/**
 * Lädt eine direkte Video-URL als Blob (CORS muss erlaubt sein).
 * YouTube-/TikTok-Seiten-URLs funktionieren nicht — nur Direktlinks (.mp4, .webm, …).
 */

const MAX_BYTES = 120 * 1024 * 1024;

/**
 * @param {string} rawUrl
 * @param {(progress: number, label: string) => void} [onProgress]
 * @returns {Promise<File>}
 */
export async function fetchVideoFromUrl(rawUrl, onProgress = () => {}) {
  const url = normalizeUrl(rawUrl);
  assertDirectVideoUrl(url);

  onProgress(0.05, "URL wird geladen…");

  let response;
  try {
    response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      redirect: "follow",
    });
  } catch {
    throw new Error(
      "URL nicht erreichbar (Netzwerk oder CORS). Viele Hosts blockieren Browser-Zugriff — Datei lokal speichern und hochladen."
    );
  }

  if (!response.ok) {
    throw new Error(`Download fehlgeschlagen (HTTP ${response.status}).`);
  }

  const type = (response.headers.get("content-type") || "").split(";")[0].trim();
  if (type && !type.startsWith("video/") && type !== "application/octet-stream") {
    throw new Error(
      `Kein Video erkannt (${type || "unbekannter Typ"}). Bitte direkten Dateilink nutzen, keine YouTube-/Seiten-URL.`
    );
  }

  const total = Number(response.headers.get("content-length")) || 0;
  if (total > MAX_BYTES) {
    throw new Error("Video ist zu groß (über ~100 MB).");
  }

  const blob = await readBody(response, total, onProgress);
  if (blob.size > MAX_BYTES) {
    throw new Error("Video ist zu groß (über ~100 MB).");
  }
  if (blob.size < 1024) {
    throw new Error("Antwort ist zu klein — vermutlich kein Videostream.");
  }

  const name = guessName(url, type || blob.type);
  const mime = type.startsWith("video/")
    ? type
    : blob.type.startsWith("video/")
      ? blob.type
      : guessMime(name);

  onProgress(1, "Download fertig");
  return new File([blob], name, { type: mime });
}

function normalizeUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) throw new Error("Bitte eine URL eingeben.");

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Ungültige URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Nur http(s)-URLs sind erlaubt.");
  }

  return parsed.href;
}

function assertDirectVideoUrl(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const pageHosts = [
    "youtube.com",
    "youtu.be",
    "tiktok.com",
    "instagram.com",
    "facebook.com",
    "fb.watch",
    "x.com",
    "twitter.com",
    "vimeo.com",
  ];
  if (pageHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
    throw new Error(
      "Seiten-Links (YouTube, TikTok, …) gehen nicht. Direkten Videodatei-Link (.mp4/.webm) nutzen oder Datei herunterladen."
    );
  }
}

async function readBody(response, total, onProgress) {
  if (!response.body || !response.body.getReader) {
    const blob = await response.blob();
    onProgress(0.9, "Video wird vorbereitet…");
    return blob;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (received > MAX_BYTES) {
      reader.cancel();
      throw new Error("Video ist zu groß (über ~100 MB).");
    }
    const p = total > 0 ? Math.min(0.95, received / total) : Math.min(0.9, received / (8 * 1024 * 1024));
    onProgress(0.05 + p * 0.9, total > 0
      ? `Lade… ${formatBytes(received)} / ${formatBytes(total)}`
      : `Lade… ${formatBytes(received)}`);
  }

  return new Blob(chunks);
}

function guessName(url, type) {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").filter(Boolean).pop() || "video";
    if (/\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(base)) {
      return decodeURIComponent(base.split("?")[0]);
    }
    const ext =
      type.includes("webm") ? "webm" : type.includes("quicktime") ? "mov" : "mp4";
    return `${base.replace(/[^a-zA-Z0-9._-]/g, "_") || "video"}.${ext}`;
  } catch {
    return "video.mp4";
  }
}

function guessMime(name) {
  if (/\.webm$/i.test(name)) return "video/webm";
  if (/\.mov$/i.test(name)) return "video/quicktime";
  if (/\.avi$/i.test(name)) return "video/x-msvideo";
  return "video/mp4";
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
