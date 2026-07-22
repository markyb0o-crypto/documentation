import { analyzeVideo } from "../analyzer/index.js";
import { fetchVideoFromUrl } from "../analyzer/fetchVideoFromUrl.js";

const ACCEPT = "video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi";

export function mountApp(root) {
  root.innerHTML = `
    <div class="bg" aria-hidden="true"></div>
    <div class="shell">
      <header class="hero">
        <h1 class="brand">Klarsicht<span>Fake-Video-Check</span></h1>
        <p class="lede">
          Lade ein Video per Datei oder direkter URL — die Analyse läuft lokal
          und sucht nach Spuren von KI-Generierung oder Manipulation.
        </p>
        <div class="cta-row">
          <button type="button" class="btn btn-primary" id="pickBtn">Video wählen</button>
          <button type="button" class="btn btn-ghost" id="analyzeBtn" disabled>Analysieren</button>
          <input id="fileInput" class="file-input" type="file" accept="${ACCEPT}" />
          <span class="hint">MP4, WebM, MOV · Datei oder Direktlink · max. ~100&nbsp;MB</span>
        </div>
        <form class="url-row" id="urlForm">
          <label class="url-label" for="urlInput">Video-URL</label>
          <div class="url-field">
            <input
              id="urlInput"
              type="url"
              inputmode="url"
              autocomplete="off"
              spellcheck="false"
              placeholder="https://…/video.mp4"
            />
            <button type="submit" class="btn btn-ghost" id="urlBtn">URL laden</button>
          </div>
          <p class="hint">Nur direkte Dateilinks (.mp4/.webm). YouTube-/TikTok-Seiten-URLs gehen nicht (CORS).</p>
        </form>
      </header>

      <section class="workspace" aria-label="Analysebereich">
        <div class="dropzone" id="dropzone">
          <div class="dropzone-inner" id="dropInner">
            <h2>Video hierher ziehen</h2>
            <p>Datei wählen, ablegen oder direkten Videolink oben einfügen. Analyse bleibt lokal im Browser.</p>
          </div>
          <div class="preview" id="preview">
            <div>
              <div class="video-wrap">
                <video id="player" controls playsinline></video>
                <div class="scan-overlay" id="scanOverlay" aria-hidden="true"></div>
              </div>
              <div class="meta-line" id="metaLine"></div>
            </div>
            <div class="panel">
              <div class="progress-block" id="progressBlock">
                <div class="progress-label">
                  <span id="progressText">Bereit</span>
                  <span id="progressPct">0%</span>
                </div>
                <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
              </div>
              <div class="error" id="error" role="alert"></div>
              <div class="result" id="result"></div>
            </div>
          </div>
        </div>

        <p class="disclaimer">
          Klarsicht ist ein Heuristik-Scanner für den Schnellcheck — kein forensisches
          Gutachten. Hochwertige Deepfakes und starke Kompression können das Ergebnis
          verfälschen. Für kritische Fälle zusätzliche Quellen und Spezialtools nutzen.
        </p>
      </section>
    </div>
  `;

  const pickBtn = root.querySelector("#pickBtn");
  const analyzeBtn = root.querySelector("#analyzeBtn");
  const fileInput = root.querySelector("#fileInput");
  const urlForm = root.querySelector("#urlForm");
  const urlInput = root.querySelector("#urlInput");
  const urlBtn = root.querySelector("#urlBtn");
  const dropzone = root.querySelector("#dropzone");
  const dropInner = root.querySelector("#dropInner");
  const preview = root.querySelector("#preview");
  const player = root.querySelector("#player");
  const metaLine = root.querySelector("#metaLine");
  const progressBlock = root.querySelector("#progressBlock");
  const progressText = root.querySelector("#progressText");
  const progressPct = root.querySelector("#progressPct");
  const progressFill = root.querySelector("#progressFill");
  const scanOverlay = root.querySelector("#scanOverlay");
  const resultEl = root.querySelector("#result");
  const errorEl = root.querySelector("#error");

  let currentFile = null;
  let objectUrl = null;
  let busy = false;

  pickBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) setFile(file);
  });

  urlForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!busy) loadUrl(urlInput.value);
  });

  analyzeBtn.addEventListener("click", () => {
    if (currentFile && !busy) runAnalysis(currentFile);
  });

  ;["dragenter", "dragover"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("is-hot");
    });
  });
  ;["dragleave", "drop"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-hot");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("video/")) setFile(file);
    else if (file) showError("Bitte eine Videodatei ablegen.");
  });

  /**
   * @param {File} file
   * @param {{ sourceUrl?: string }} [opts]
   */
  function setFile(file, opts = {}) {
    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|avi|m4v|mkv)$/i.test(file.name)) {
      showError("Dieser Dateityp wird nicht unterstützt.");
      return;
    }
    if (file.size > 120 * 1024 * 1024) {
      showError("Datei ist sehr groß — bitte unter ~100 MB bleiben für den Browser-Check.");
      return;
    }

    clearError();
    currentFile = file;
    analyzeBtn.disabled = false;
    resultEl.classList.remove("is-visible");
    resultEl.innerHTML = "";
    progressBlock.classList.remove("is-visible");

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    player.src = objectUrl;

    dropInner.style.display = "none";
    preview.classList.add("is-visible");
    const source = opts.sourceUrl
      ? `<span>URL</span><span title="${escapeHtml(opts.sourceUrl)}">${escapeHtml(shortUrl(opts.sourceUrl))}</span>`
      : "";
    metaLine.innerHTML = `
      <span><strong>${escapeHtml(file.name)}</strong></span>
      <span>${formatBytes(file.size)}</span>
      <span>${file.type || "video"}</span>
      ${source}
    `;
  }

  async function loadUrl(raw) {
    busy = true;
    setBusyUi(true);
    clearError();
    resultEl.classList.remove("is-visible");
    resultEl.innerHTML = "";
    progressBlock.classList.add("is-visible");
    setProgress(0, "URL wird geladen…");

    try {
      const file = await fetchVideoFromUrl(raw, (p, label) => setProgress(p, label));
      setFile(file, { sourceUrl: String(raw).trim() });
      progressBlock.classList.remove("is-visible");
    } catch (err) {
      console.error(err);
      showError(err?.message || "URL konnte nicht geladen werden.");
      progressBlock.classList.remove("is-visible");
    } finally {
      busy = false;
      setBusyUi(false);
    }
  }

  async function runAnalysis(file) {
    busy = true;
    setBusyUi(true);
    clearError();
    resultEl.classList.remove("is-visible");
    resultEl.innerHTML = "";
    progressBlock.classList.add("is-visible");
    scanOverlay.classList.add("is-active");
    setProgress(0, "Starte Analyse…");

    try {
      const result = await analyzeVideo(file, (p, label) => {
        setProgress(p, label);
      });
      renderResult(result);
    } catch (err) {
      console.error(err);
      showError(err?.message || "Analyse fehlgeschlagen.");
    } finally {
      busy = false;
      setBusyUi(false);
      scanOverlay.classList.remove("is-active");
    }
  }

  function setBusyUi(isBusy) {
    analyzeBtn.disabled = isBusy || !currentFile;
    pickBtn.disabled = isBusy;
    urlBtn.disabled = isBusy;
    urlInput.disabled = isBusy;
  }

  function setProgress(p, label) {
    const pct = Math.round(Math.min(1, Math.max(0, p)) * 100);
    progressFill.style.width = `${pct}%`;
    progressPct.textContent = `${pct}%`;
    progressText.textContent = label;
  }

  function renderResult(result) {
    progressBlock.classList.remove("is-visible");
    resultEl.classList.add("is-visible");
    resultEl.innerHTML = `
      <div class="verdict">
        <div class="verdict-kicker">Ergebnis</div>
        <h2 class="verdict-title" data-v="${result.verdict}">${escapeHtml(result.label)}</h2>
        <p class="verdict-summary">${escapeHtml(result.summary)}</p>
        <div class="meters">
          <div class="meter">
            <div class="meter-label">KI-Score</div>
            <div class="meter-value">${result.aiScore}%</div>
          </div>
          <div class="meter">
            <div class="meter-label">Konfidenz</div>
            <div class="meter-value">${result.confidence}%</div>
          </div>
        </div>
      </div>
      <ul class="signals">
        ${result.signals
          .map(
            (s) => `
          <li class="signal">
            <span class="signal-name">${escapeHtml(s.label)}</span>
            <span class="signal-score">${s.score}%</span>
            <span class="signal-detail">${escapeHtml(s.detail)}</span>
            <div class="signal-bar"><span style="width:${s.score}%"></span></div>
          </li>`
          )
          .join("")}
      </ul>
    `;

    // Trigger bar animation
    requestAnimationFrame(() => {
      resultEl.querySelectorAll(".signal-bar > span").forEach((el) => {
        const w = el.style.width;
        el.style.width = "0";
        requestAnimationFrame(() => {
          el.style.width = w;
        });
      });
    });
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add("is-visible");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 28 ? `${u.pathname.slice(0, 24)}…` : u.pathname;
    return `${u.host}${path}`;
  } catch {
    return url.slice(0, 48);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
