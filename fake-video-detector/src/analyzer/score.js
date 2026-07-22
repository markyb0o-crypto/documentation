/**
 * Aggregiert Heuristik-Signale zu einem Gesamtverdikt.
 */

/**
 * @typedef {import('./heuristics.js').Signal} Signal
 * @typedef {{
 *   verdict: 'likely_ai' | 'suspicious' | 'likely_real' | 'inconclusive',
 *   label: string,
 *   confidence: number,
 *   aiScore: number,
 *   summary: string,
 *   signals: Signal[],
 *   meta: object,
 * }} AnalysisResult
 */

const WEIGHTS = {
  temporal: 1.15,
  sharpness: 1.0,
  chroma: 0.85,
  frequency: 1.2,
  edges: 1.05,
  texture: 0.95,
};

/**
 * @param {Signal[]} signals
 * @param {object} meta
 * @returns {AnalysisResult}
 */
export function scoreAnalysis(signals, meta) {
  let weighted = 0;
  let totalW = 0;
  for (const s of signals) {
    const w = WEIGHTS[s.id] ?? 1;
    weighted += s.score * w;
    totalW += w;
  }
  const aiScore = totalW > 0 ? weighted / totalW : 0.5;

  // Konfidenz steigt, wenn Signale übereinstimmen
  const scores = signals.map((s) => s.score);
  const agreement = 1 - sampleStd(scores);
  const confidence = clamp01(0.35 + agreement * 0.55 + Math.abs(aiScore - 0.5) * 0.4);

  let verdict;
  let label;
  let summary;

  if (aiScore >= 0.62) {
    verdict = "likely_ai";
    label = "Wahrscheinlich KI-generiert";
    summary =
      "Mehrere forensische Signale deuten auf synthetische Erzeugung oder starke KI-Nachbearbeitung hin.";
  } else if (aiScore >= 0.42) {
    verdict = "suspicious";
    label = "Verdächtig / unklar";
    summary =
      "Gemischte Hinweise. Mögliche leichte Manipulation, starkes Re-Encoding oder ungewöhnliche Aufnahmebedingungen.";
  } else if (aiScore >= 0.28) {
    verdict = "likely_real";
    label = "Eher echt";
    summary =
      "Die meisten Signale liegen im Bereich typischer Kameravideos. Keine starke KI-Signatur erkannt.";
  } else {
    verdict = "likely_real";
    label = "Wahrscheinlich echt";
    summary =
      "Zeitliche Struktur, Textur und Frequenzbild wirken natürlich. Keine auffällige KI-Fingerprint-Lage.";
  }

  if (confidence < 0.45 && verdict !== "suspicious") {
    verdict = "inconclusive";
    label = "Nicht eindeutig";
    summary =
      "Zu widersprüchliche oder schwache Signale für ein klares Verdikt. Bitte längeres oder höher aufgelöstes Material versuchen.";
  }

  return {
    verdict,
    label,
    confidence: Math.round(confidence * 100),
    aiScore: Math.round(aiScore * 100),
    summary,
    signals: signals.map((s) => ({
      ...s,
      score: Math.round(s.score * 100),
    })),
    meta,
  };
}

function sampleStd(arr) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(v);
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
