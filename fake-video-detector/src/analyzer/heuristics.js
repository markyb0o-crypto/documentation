/**
 * Forensische Heuristiken für KI-/Fake-Video-Signale.
 * Läuft komplett lokal — kein Upload an Drittanbieter.
 */

/**
 * @typedef {{ id: string, label: string, score: number, detail: string }} Signal
 */

/**
 * @param {ImageData[]} frames
 * @returns {Signal[]}
 */
export function runHeuristics(frames) {
  if (frames.length < 3) {
    throw new Error("Zu wenige Frames für eine Analyse.");
  }

  return [
    temporalJitter(frames),
    sharpnessDrift(frames),
    chromaStability(frames),
    frequencyFingerprint(frames),
    edgeMorph(frames),
    textureUniformity(frames),
  ];
}

/** Zu glatte oder chaotisch sprunghafte Frame-zu-Frame-Differenzen */
function temporalJitter(frames) {
  const diffs = [];
  for (let i = 1; i < frames.length; i += 1) {
    diffs.push(meanAbsDiff(frames[i - 1], frames[i]));
  }
  const mean = avg(diffs);
  const cv = mean > 1e-6 ? std(diffs) / mean : 0;

  // KI-Video: oft unnatürlich niedrige Varianz (zu glatt) ODER Spike-Muster
  let score = 0;
  if (mean < 4) score += 0.45;
  else if (mean < 8) score += 0.2;
  if (cv < 0.18) score += 0.35;
  else if (cv > 1.4) score += 0.4;
  else if (cv > 0.9) score += 0.2;

  const detail =
    mean < 6
      ? `Sehr glatte Übergänge (Δ=${mean.toFixed(1)}, CV=${cv.toFixed(2)})`
      : cv > 1.1
        ? `Unregelmäßige Sprünge (Δ=${mean.toFixed(1)}, CV=${cv.toFixed(2)})`
        : `Natürliche Bewegungsvarianz (Δ=${mean.toFixed(1)}, CV=${cv.toFixed(2)})`;

  return {
    id: "temporal",
    label: "Zeitliche Konsistenz",
    score: clamp01(score),
    detail,
  };
}

/** Schärfe schwankt unnatürlich zwischen Frames */
function sharpnessDrift(frames) {
  const sharp = frames.map(laplacianVariance);
  const mean = avg(sharp);
  const cv = mean > 1e-6 ? std(sharp) / mean : 0;
  const range = (Math.max(...sharp) - Math.min(...sharp)) / (mean || 1);

  let score = 0;
  if (cv > 0.55) score += 0.45;
  else if (cv > 0.35) score += 0.25;
  if (range > 1.2) score += 0.35;
  else if (range > 0.7) score += 0.2;
  // Übermäßig weiche Texturen (Diffusion-Look)
  if (mean < 80) score += 0.25;

  return {
    id: "sharpness",
    label: "Schärfe-Drift",
    score: clamp01(score),
    detail: `Schärfe Ø=${mean.toFixed(0)}, Schwankung CV=${cv.toFixed(2)}`,
  };
}

/** Unnatürliche Farbkanal-Korrelation / Hautton-Glätte */
function chromaStability(frames) {
  const scores = frames.map((f) => {
    const { rg, rb, gb, satMean, satStd } = channelStats(f);
    let s = 0;
    // Generierte Frames: oft extrem hohe Kanalkorrelation
    if (rg > 0.97 && rb > 0.95) s += 0.35;
    if (satStd < 0.06 && satMean > 0.15) s += 0.3;
    if (satMean > 0.55) s += 0.15;
    return s;
  });
  const score = clamp01(avg(scores));
  return {
    id: "chroma",
    label: "Farbraum-Signatur",
    score,
    detail:
      score > 0.45
        ? "Auffällige Kanal-Korrelation / Sättigung"
        : "Farbverteilung im üblichen Bereich",
  };
}

/** Hochfrequenz-Energie (GAN/Diffusion-Fingerabdruck-Approximation) */
function frequencyFingerprint(frames) {
  const energies = frames.map((f) => highFreqEnergy(f, 8));
  const mean = avg(energies);
  const cv = mean > 1e-9 ? std(energies) / mean : 0;

  let score = 0;
  // Zu wenig Hochfrequenz = Over-smoothing
  if (mean < 0.012) score += 0.5;
  else if (mean < 0.02) score += 0.25;
  // Periodische HF-Schwankungen
  if (cv > 0.65) score += 0.35;
  else if (cv < 0.08 && mean < 0.03) score += 0.2;

  return {
    id: "frequency",
    label: "Frequenz-Fingerprint",
    score: clamp01(score),
    detail: `HF-Energie=${mean.toFixed(4)}, Stabilität CV=${cv.toFixed(2)}`,
  };
}

/** Kanten-Morphing zwischen benachbarten Frames */
function edgeMorph(frames) {
  const morphs = [];
  for (let i = 1; i < frames.length; i += 1) {
    const e0 = sobelEdges(frames[i - 1]);
    const e1 = sobelEdges(frames[i]);
    morphs.push(meanAbsDiffGray(e0, e1));
  }
  const mean = avg(morphs);
  const cv = mean > 1e-6 ? std(morphs) / mean : 0;

  let score = 0;
  if (mean > 28 && cv < 0.25) score += 0.4; // konstantes Morphing
  if (mean > 40) score += 0.35;
  else if (mean < 3 && frames.length > 4) score += 0.3; // zu starr

  return {
    id: "edges",
    label: "Kanten-Morphing",
    score: clamp01(score),
    detail: `Kanten-Δ=${mean.toFixed(1)}, CV=${cv.toFixed(2)}`,
  };
}

/** Lokale Textur zu uniform (klassisch bei generierten Flächen) */
function textureUniformity(frames) {
  const vals = frames.map((f) => localUniformity(f, 16));
  const mean = avg(vals);
  let score = 0;
  if (mean > 0.72) score = 0.75;
  else if (mean > 0.58) score = 0.45;
  else if (mean > 0.45) score = 0.25;

  return {
    id: "texture",
    label: "Textur-Uniformität",
    score: clamp01(score),
    detail:
      mean > 0.55
        ? `Hohe Flächen-Glätte (${(mean * 100).toFixed(0)}%)`
        : `Natürliche Texturverteilung (${(mean * 100).toFixed(0)}%)`,
  };
}

/* ——— Pixel-Utilities ——— */

function meanAbsDiff(a, b) {
  const da = a.data;
  const db = b.data;
  let sum = 0;
  const n = da.length;
  for (let i = 0; i < n; i += 4) {
    sum +=
      Math.abs(da[i] - db[i]) +
      Math.abs(da[i + 1] - db[i + 1]) +
      Math.abs(da[i + 2] - db[i + 2]);
  }
  return sum / ((n / 4) * 3);
}

function meanAbsDiffGray(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

function laplacianVariance(image) {
  const { data, width, height } = image;
  const gray = toGray(data, width, height);
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const v =
        -4 * gray[i] +
        gray[i - 1] +
        gray[i + 1] +
        gray[i - width] +
        gray[i + width];
      sum += v;
      sumSq += v * v;
      count += 1;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

function channelStats(image) {
  const { data } = image;
  const n = data.length / 4;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumRG = 0;
  let sumRB = 0;
  let sumGB = 0;
  let sumR2 = 0;
  let sumG2 = 0;
  let sumB2 = 0;
  let satSum = 0;
  let satSq = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    sumR += r;
    sumG += g;
    sumB += b;
    sumRG += r * g;
    sumRB += r * b;
    sumGB += g * b;
    sumR2 += r * r;
    sumG2 += g * g;
    sumB2 += b * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max > 1e-6 ? (max - min) / max : 0;
    satSum += sat;
    satSq += sat * sat;
  }

  const meanR = sumR / n;
  const meanG = sumG / n;
  const meanB = sumB / n;
  const corr = (sxy, mx, my, sx2, sy2) => {
    const cov = sxy / n - mx * my;
    const vx = sx2 / n - mx * mx;
    const vy = sy2 / n - my * my;
    return cov / (Math.sqrt(vx * vy) + 1e-9);
  };

  const satMean = satSum / n;
  const satStd = Math.sqrt(Math.max(0, satSq / n - satMean * satMean));

  return {
    rg: corr(sumRG, meanR, meanG, sumR2, sumG2),
    rb: corr(sumRB, meanR, meanB, sumR2, sumB2),
    gb: corr(sumGB, meanG, meanB, sumG2, sumB2),
    satMean,
    satStd,
  };
}

function highFreqEnergy(image, block) {
  const { data, width, height } = image;
  const gray = toGray(data, width, height);
  let energy = 0;
  let blocks = 0;
  for (let y = 0; y + block <= height; y += block) {
    for (let x = 0; x + block <= width; x += block) {
      let sum = 0;
      let sumSq = 0;
      for (let by = 0; by < block; by += 1) {
        for (let bx = 0; bx < block; bx += 1) {
          const v = gray[(y + by) * width + (x + bx)];
          sum += v;
          sumSq += v * v;
        }
      }
      const n = block * block;
      const mean = sum / n;
      const variance = sumSq / n - mean * mean;
      // Hochpass-Approximation: Nachbar-Differenzen im Block
      let hf = 0;
      for (let by = 0; by < block; by += 1) {
        for (let bx = 0; bx < block - 1; bx += 1) {
          hf += Math.abs(
            gray[(y + by) * width + (x + bx)] -
              gray[(y + by) * width + (x + bx + 1)]
          );
        }
      }
      energy += hf / (n * 255) + variance / (255 * 255);
      blocks += 1;
    }
  }
  return energy / Math.max(blocks, 1);
}

function sobelEdges(image) {
  const { data, width, height } = image;
  const gray = toGray(data, width, height);
  const out = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gx =
        -gray[i - width - 1] +
        gray[i - width + 1] -
        2 * gray[i - 1] +
        2 * gray[i + 1] -
        gray[i + width - 1] +
        gray[i + width + 1];
      const gy =
        -gray[i - width - 1] -
        2 * gray[i - width] -
        gray[i - width + 1] +
        gray[i + width - 1] +
        2 * gray[i + width] +
        gray[i + width + 1];
      out[i] = Math.hypot(gx, gy);
    }
  }
  return out;
}

function localUniformity(image, block) {
  const { data, width, height } = image;
  const gray = toGray(data, width, height);
  let uniform = 0;
  let blocks = 0;
  for (let y = 0; y + block <= height; y += block) {
    for (let x = 0; x + block <= width; x += block) {
      let sum = 0;
      let sumSq = 0;
      const n = block * block;
      for (let by = 0; by < block; by += 1) {
        for (let bx = 0; bx < block; bx += 1) {
          const v = gray[(y + by) * width + (x + bx)];
          sum += v;
          sumSq += v * v;
        }
      }
      const variance = sumSq / n - (sum / n) ** 2;
      if (variance < 45) uniform += 1;
      blocks += 1;
    }
  }
  return uniform / Math.max(blocks, 1);
}

function toGray(data, width, height) {
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  const m = avg(arr);
  return Math.sqrt(avg(arr.map((v) => (v - m) ** 2)));
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
