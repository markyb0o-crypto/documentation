import { extractFrames } from "./extractFrames.js";
import { runHeuristics } from "./heuristics.js";
import { scoreAnalysis } from "./score.js";

/**
 * @param {File} file
 * @param {(progress: number, label: string) => void} [onProgress]
 */
export async function analyzeVideo(file, onProgress = () => {}) {
  onProgress(0.02, "Video wird vorbereitet…");
  const { frames, meta } = await extractFrames(file, (p, label) => {
    onProgress(0.05 + p * 0.7, label);
  });

  onProgress(0.8, "Forensische Signale werden berechnet…");
  // Kurze Pause, damit UI den Fortschritt zeichnen kann
  await yieldToMain();
  const signals = runHeuristics(frames);

  onProgress(0.95, "Verdikt wird aggregiert…");
  await yieldToMain();
  const result = scoreAnalysis(signals, {
    ...meta,
    frameCount: frames.length,
    fileSize: file.size,
    type: file.type || "video/*",
  });

  onProgress(1, "Fertig");
  return result;
}

function yieldToMain() {
  return new Promise((r) => setTimeout(r, 30));
}
