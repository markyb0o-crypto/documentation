import { adjustColor, getKnobAngle, getNormalizedState, getExportDimensions } from './config.js';

/** @param {CanvasRenderingContext2D} ctx */
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** @param {import('./config.js').GeneratorState} state */
function applyMaterial(ctx, state, x, y, w, h, r, baseColor) {
  const { materialPreset, glossAmount, roughness, stylePreset } = state;
  const gloss = glossAmount / 100;
  const rough = roughness / 100;

  if (materialPreset === 'metal' || materialPreset === 'brushedMetal') {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, adjustColor(baseColor, 0.35));
    grad.addColorStop(0.45, baseColor);
    grad.addColorStop(0.55, adjustColor(baseColor, -0.15));
    grad.addColorStop(1, adjustColor(baseColor, 0.2));
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    if (materialPreset === 'brushedMetal') {
      ctx.save();
      roundRect(ctx, x, y, w, h, r);
      ctx.clip();
      ctx.globalAlpha = 0.12 + rough * 0.2;
      for (let i = 0; i < h; i += 2) {
        ctx.strokeStyle = i % 4 === 0 ? '#ffffff' : '#000000';
        ctx.beginPath();
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + w, y + i);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else if (materialPreset === 'glass') {
    ctx.fillStyle = baseColor;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();
    const shine = ctx.createLinearGradient(x, y, x, y + h * 0.65);
    shine.addColorStop(0, `rgba(255,255,255,${0.35 + gloss * 0.35})`);
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(x, y, w, h * 0.55);
    ctx.restore();
  } else if (materialPreset === 'rubber') {
    ctx.fillStyle = adjustColor(baseColor, -0.08);
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = 0.08 + rough * 0.25;
    for (let i = 0; i < 400; i += 1) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 1, 1);
    }
    ctx.restore();
  } else if (materialPreset === 'wood') {
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, adjustColor(baseColor, -0.12));
    grad.addColorStop(0.5, baseColor);
    grad.addColorStop(1, adjustColor(baseColor, 0.08));
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  } else if (materialPreset === 'carbon') {
    ctx.fillStyle = baseColor;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.globalAlpha = 0.25;
    const step = 6;
    for (let i = -h; i < w + h; i += step) {
      ctx.strokeStyle = i % (step * 2) === 0 ? '#666' : '#111';
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + h, y + h);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, adjustColor(baseColor, 0.12 + gloss * 0.15));
    grad.addColorStop(1, adjustColor(baseColor, -0.1 - rough * 0.08));
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }

  if (gloss > 0.05 && materialPreset !== 'rubber') {
    ctx.save();
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();
    const spec = ctx.createRadialGradient(x + w * 0.32, y + h * 0.22, 1, x + w * 0.32, y + h * 0.22, Math.max(w, h) * 0.75);
    spec.addColorStop(0, `rgba(255,255,255,${0.15 + gloss * 0.45})`);
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  if (stylePreset === 'glassmorphism') {
    ctx.save();
    roundRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + gloss * 0.25})`;
    ctx.lineWidth = Math.max(1, state.strokeWidth);
    ctx.stroke();
    ctx.restore();
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state */
function applyStyleShadow(ctx, state, x, y, w, h, r) {
  const intensity = state.shadowIntensity / 100;
  if (intensity <= 0) return;

  ctx.save();
  if (state.stylePreset === 'neumorphism') {
    const off = 4 + intensity * 10;
    ctx.shadowColor = adjustColor(state.colorShadow, 0.2);
    ctx.shadowBlur = 2 + state.blurAmount * 0.25;
    ctx.shadowOffsetX = off;
    ctx.shadowOffsetY = off;
    ctx.fillStyle = state.colorSecondary;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    ctx.shadowColor = adjustColor(state.colorHighlight, 0.5);
    ctx.shadowOffsetX = -off * 0.75;
    ctx.shadowOffsetY = -off * 0.75;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, r);
    ctx.fill();
  } else {
    ctx.shadowColor = hexAlpha(state.colorShadow, 0.15 + intensity * 0.45);
    ctx.shadowBlur = 4 + state.blurAmount * 0.8;
    ctx.shadowOffsetY = 2 + intensity * 6;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = 'rgba(0,0,0,0.01)';
    ctx.fill();
  }
  ctx.restore();
}

function hexAlpha(hex, alpha) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex @param {{width?:number,height?:number,pad?:number}} [dims] */
export function renderAsset(ctx, state, frameIndex = state.stateIndex, dims) {
  const pad = dims?.pad ?? 0;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!state.transparentBg) {
    ctx.fillStyle = state.colorBackground;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  if (state.showChecker && ctx.canvas.dataset.preview === 'true') {
    drawChecker(ctx);
  }

  ctx.save();
  ctx.translate(pad, pad);
  ctx.scale(state.scale, state.scale);

  switch (state.assetType) {
    case 'knob': drawKnob(ctx, state, frameIndex); break;
    case 'button': drawButton(ctx, state, frameIndex); break;
    case 'slider': drawSlider(ctx, state, frameIndex); break;
    case 'fader': drawFader(ctx, state, frameIndex); break;
    case 'panel': drawPanel(ctx, state, frameIndex); break;
    case 'led': drawLed(ctx, state, frameIndex); break;
    case 'vuMeter': drawVuMeter(ctx, state, frameIndex); break;
    default: break;
  }

  ctx.restore();

  if (state.showGrid && ctx.canvas.dataset.preview === 'true') {
    drawGrid(ctx);
  }
}

function drawChecker(ctx) {
  const size = 12;
  for (let y = 0; y < ctx.canvas.height; y += size) {
    for (let x = 0; x < ctx.canvas.width; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#2a2f3a' : '#22262f';
      ctx.fillRect(x, y, size, size);
    }
  }
}

function drawGrid(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < ctx.canvas.width; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ctx.canvas.height); ctx.stroke();
  }
  for (let y = 0; y < ctx.canvas.height; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width, y); ctx.stroke();
  }
  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function drawKnob(ctx, state, frameIndex) {
  const w = state.width;
  const h = state.height;
  const r = Math.min(state.radius, w / 2, h / 2);
  const cx = w / 2;
  const cy = h / 2;

  applyStyleShadow(ctx, state, 0, 0, w, h, r);
  applyMaterial(ctx, state, 0, 0, w, h, r, state.colorPrimary);

  if (state.strokeWidth > 0) {
    ctx.strokeStyle = adjustColor(state.colorPrimary, -0.25);
    ctx.lineWidth = state.strokeWidth;
    roundRect(ctx, 0, 0, w, h, r);
    ctx.stroke();
  }

  const angle = (getKnobAngle(state, frameIndex) * Math.PI) / 180;
  const indicatorLen = Math.min(w, h) * 0.38;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = state.colorAccent;
  ctx.lineWidth = Math.max(2, w * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -indicatorLen);
  ctx.stroke();

  ctx.fillStyle = state.colorAccent;
  ctx.beginPath();
  ctx.arc(0, -indicatorLen, Math.max(2, w * 0.04), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = adjustColor(state.colorSecondary, 0.15);
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(w, h) * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function drawButton(ctx, state, frameIndex) {
  const w = state.width;
  const h = state.height;
  const r = Math.min(state.radius, w / 2, h / 2);
  const t = getNormalizedState(state, frameIndex);
  const pressed = t > 0.66;
  const hover = t > 0.33 && t <= 0.66;
  const offset = pressed ? 2 : 0;
  const base = hover ? adjustColor(state.colorPrimary, 0.08) : state.colorPrimary;

  applyStyleShadow(ctx, state, offset, offset, w, h, r);
  applyMaterial(ctx, state, offset, offset, w, h, r, base);

  if (state.strokeWidth > 0) {
    ctx.strokeStyle = adjustColor(base, -0.2);
    ctx.lineWidth = state.strokeWidth;
    roundRect(ctx, offset, offset, w, h, r);
    ctx.stroke();
  }

  ctx.fillStyle = pressed ? adjustColor(state.colorAccent, -0.05) : state.colorAccent;
  ctx.font = `600 ${Math.floor(h * 0.28)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pressed ? 'ON' : 'OFF', w / 2 + offset, h / 2 + offset + (pressed ? 1 : 0));
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function drawSlider(ctx, state, frameIndex) {
  const trackH = Math.max(6, state.height * 0.18);
  const trackW = state.width;
  const trackY = state.height * 1.2;
  const thumbW = state.height;
  const thumbH = state.height;
  const t = getNormalizedState(state, frameIndex);
  const thumbX = t * (trackW - thumbW);

  if (state.includeTrack) {
    applyStyleShadow(ctx, state, 0, trackY, trackW, trackH, trackH / 2);
    applyMaterial(ctx, state, 0, trackY, trackW, trackH, trackH / 2, state.colorSecondary);

    const fillW = thumbX + thumbW / 2;
    ctx.save();
    roundRect(ctx, 0, trackY, trackW, trackH, trackH / 2);
    ctx.clip();
    ctx.fillStyle = hexAlpha(state.colorAccent, 0.55);
    ctx.fillRect(0, trackY, fillW, trackH);
    ctx.restore();
  }

  applyStyleShadow(ctx, state, thumbX, 0, thumbW, thumbH, state.radius);
  applyMaterial(ctx, state, thumbX, 0, thumbW, thumbH, state.radius, state.colorPrimary);
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function drawFader(ctx, state, frameIndex) {
  const trackW = Math.max(8, state.width * 0.22);
  const trackH = state.height * 2.2;
  const capW = state.width;
  const capH = Math.max(18, state.height * 0.28);
  const t = getNormalizedState(state, frameIndex);
  const capY = (1 - t) * (trackH - capH);

  if (state.includeTrack) {
    applyStyleShadow(ctx, state, 0, 0, trackW, trackH, trackW / 2);
    applyMaterial(ctx, state, 0, 0, trackW, trackH, trackW / 2, state.colorSecondary);
  }

  applyStyleShadow(ctx, state, -((capW - trackW) / 2), capY, capW, capH, state.radius);
  applyMaterial(ctx, state, -((capW - trackW) / 2), capY, capW, capH, state.radius, state.colorPrimary);

  ctx.fillStyle = state.colorAccent;
  ctx.fillRect((trackW / 2) - 1, capY + capH * 0.35, 2, capH * 0.3);
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state */
function drawPanel(ctx, state) {
  const w = state.width;
  const h = state.height;
  const r = state.radius;
  applyStyleShadow(ctx, state, 0, 0, w, h, r);
  applyMaterial(ctx, state, 0, 0, w, h, r, state.colorSecondary);

  if (state.stylePreset === 'minimal') {
    ctx.strokeStyle = hexAlpha(state.colorAccent, 0.35);
    ctx.lineWidth = state.strokeWidth || 1;
    roundRect(ctx, 0.5, 0.5, w - 1, h - 1, r);
    ctx.stroke();
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function drawLed(ctx, state, frameIndex) {
  const w = state.width;
  const h = state.height;
  const r = Math.min(w, h) / 2;
  const t = getNormalizedState(state, frameIndex);
  const on = t >= 0.5;
  const color = on ? state.colorAccent : adjustColor(state.colorSecondary, -0.1);

  applyStyleShadow(ctx, state, 0, 0, w, h, r);
  applyMaterial(ctx, state, 0, 0, w, h, r, color);

  if (on) {
    ctx.save();
    ctx.shadowColor = hexAlpha(state.colorAccent, 0.85);
    ctx.shadowBlur = 8 + state.blurAmount;
    ctx.fillStyle = state.colorAccent;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function drawVuMeter(ctx, state, frameIndex) {
  const w = state.width;
  const h = state.height;
  const r = state.radius;
  const t = getNormalizedState(state, frameIndex);

  applyStyleShadow(ctx, state, 0, 0, w, h, r);
  applyMaterial(ctx, state, 0, 0, w, h, r, state.colorSecondary);

  const segments = 12;
  const gap = 2;
  const segW = (w - gap * (segments - 1)) / segments;
  for (let i = 0; i < segments; i += 1) {
    const active = i / (segments - 1) <= t;
    const ratio = i / (segments - 1);
    let col = state.colorAccent;
    if (ratio > 0.7) col = '#ffd166';
    if (ratio > 0.88) col = '#ff5d6c';
    ctx.fillStyle = active ? col : adjustColor(state.colorSecondary, 0.05);
    roundRect(ctx, i * (segW + gap), h * 0.25, segW, h * 0.5, 2);
    ctx.fill();
  }
}

/** @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
export function createExportCanvas(state, frameIndex) {
  const dims = getExportDimensions(state);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');
  ctx.globalAlpha = state.opacity / 100;
  renderAsset(ctx, state, frameIndex, dims);
  return canvas;
}
