/**
 * Extrahiert gleichmäßig verteilte Frames aus einem Video.
 */

const MAX_FRAMES = 16;
const TARGET_SIZE = 256;

/**
 * @param {File|Blob} file
 * @param {(progress: number, label: string) => void} [onProgress]
 * @returns {Promise<{ frames: ImageData[], meta: { duration: number, width: number, height: number, name: string } }>}
 */
export async function extractFrames(file, onProgress = () => {}) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForEvent(video, "loadedmetadata");
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration || duration <= 0) {
      throw new Error("Videodauer konnte nicht gelesen werden.");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas nicht verfügbar.");

    const scale = Math.min(
      1,
      TARGET_SIZE / Math.max(video.videoWidth, video.videoHeight)
    );
    canvas.width = Math.max(32, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(32, Math.round(video.videoHeight * scale));

    const count = Math.min(MAX_FRAMES, Math.max(6, Math.floor(duration * 2)));
    const frames = [];
    const margin = Math.min(0.15, duration * 0.05);
    const usable = Math.max(duration - margin * 2, duration * 0.8);
    const start = (duration - usable) / 2;

    for (let i = 0; i < count; i += 1) {
      const t = start + (usable * i) / Math.max(count - 1, 1);
      await seekTo(video, t);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      onProgress((i + 1) / count, `Frame ${i + 1}/${count} gelesen`);
    }

    return {
      frames,
      meta: {
        duration,
        width: video.videoWidth,
        height: video.videoHeight,
        name: file.name || "video",
      },
    };
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}

function waitForEvent(el, event) {
  return new Promise((resolve, reject) => {
    const onOk = () => {
      cleanup();
      resolve();
    };
    const onErr = () => {
      cleanup();
      reject(new Error("Video konnte nicht geladen werden."));
    };
    const cleanup = () => {
      el.removeEventListener(event, onOk);
      el.removeEventListener("error", onErr);
    };
    el.addEventListener(event, onOk, { once: true });
    el.addEventListener("error", onErr, { once: true });
  });
}

function seekTo(video, time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onErr = () => {
      cleanup();
      reject(new Error("Seek fehlgeschlagen."));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onErr);
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onErr, { once: true });
    video.currentTime = Math.min(Math.max(time, 0), video.duration - 0.01);
  });
}
