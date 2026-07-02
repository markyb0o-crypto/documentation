import { getKnobAngle, getNormalizedState, getExportDimensions } from './config.js';

/** @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
export function renderSvg(state, frameIndex) {
  const dims = getExportDimensions(state);
  const { width, height, pad } = dims;
  const inner = renderInner(state, frameIndex);
  const bg = state.transparentBg ? '' : `<rect width="100%" height="100%" fill="${state.colorBackground}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bg}
  <g transform="translate(${pad}, ${pad}) scale(${state.scale})">
    ${inner}
  </g>
</svg>`;
}

/** @param {import('./config.js').GeneratorState} state @param {number} frameIndex */
function renderInner(state, frameIndex) {
  switch (state.assetType) {
    case 'knob': return svgKnob(state, frameIndex);
    case 'button': return svgButton(state, frameIndex);
    case 'slider': return svgSlider(state, frameIndex);
    case 'fader': return svgFader(state, frameIndex);
    case 'panel': return svgPanel(state);
    case 'led': return svgLed(state, frameIndex);
    case 'vuMeter': return svgVu(state, frameIndex);
    default: return '';
  }
}

function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}" ry="${rr}" />`;
}

function defs(state, id, fill) {
  return `<defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${lighten(fill, 0.15)}" />
      <stop offset="100%" stop-color="${lighten(fill, -0.12)}" />
    </linearGradient>
  </defs>`;
}

function lighten(hex, amt) {
  const clean = hex.replace('#', '');
  let r = parseInt(clean.slice(0, 2), 16);
  let g = parseInt(clean.slice(2, 4), 16);
  let b = parseInt(clean.slice(4, 6), 16);
  const f = amt >= 0 ? 255 : 0;
  const p = Math.abs(amt);
  r = Math.round(r + (f - r) * p);
  g = Math.round(g + (f - g) * p);
  b = Math.round(b + (f - b) * p);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function svgKnob(state, frameIndex) {
  const w = state.width;
  const h = state.height;
  const cx = w / 2;
  const cy = h / 2;
  const angle = getKnobAngle(state, frameIndex);
  const id = `grad-knob-${frameIndex}`;
  return `${defs(state, id, state.colorPrimary)}
    ${roundRect(0, 0, w, h, state.radius).replace('/>', ` fill="url(#${id})" stroke="${lighten(state.colorPrimary, -0.25)}" stroke-width="${state.strokeWidth}"/>`)}
    <g transform="rotate(${angle} ${cx} ${cy})">
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - h * 0.38}" stroke="${state.colorAccent}" stroke-width="${Math.max(2, w * 0.05)}" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy - h * 0.38}" r="${Math.max(2, w * 0.04)}" fill="${state.colorAccent}"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.08}" fill="${lighten(state.colorSecondary, 0.15)}"/>`;
}

function svgButton(state, frameIndex) {
  const t = getNormalizedState(state, frameIndex);
  const pressed = t > 0.66;
  const offset = pressed ? 2 : 0;
  const id = `grad-btn-${frameIndex}`;
  return `${defs(state, id, state.colorPrimary)}
    ${roundRect(offset, offset, state.width, state.height, state.radius).replace('/>', ` fill="url(#${id})"/>`)}
    <text x="${state.width / 2 + offset}" y="${state.height / 2 + offset + 5}" text-anchor="middle" fill="${state.colorAccent}" font-size="${Math.floor(state.height * 0.28)}" font-family="Inter, sans-serif" font-weight="600">${pressed ? 'ON' : 'OFF'}</text>`;
}

function svgSlider(state, frameIndex) {
  const trackH = Math.max(6, state.height * 0.18);
  const trackW = state.width;
  const trackY = state.height * 1.2;
  const thumbW = state.height;
  const t = getNormalizedState(state, frameIndex);
  const thumbX = t * (trackW - thumbW);
  let svg = '';
  if (state.includeTrack) {
    svg += roundRect(0, trackY, trackW, trackH, trackH / 2).replace('/>', ` fill="${state.colorSecondary}"/>`);
  }
  svg += roundRect(thumbX, 0, thumbW, state.height, state.radius).replace('/>', ` fill="${state.colorPrimary}"/>`);
  return svg;
}

function svgFader(state, frameIndex) {
  const trackW = Math.max(8, state.width * 0.22);
  const trackH = state.height * 2.2;
  const capW = state.width;
  const capH = Math.max(18, state.height * 0.28);
  const t = getNormalizedState(state, frameIndex);
  const capY = (1 - t) * (trackH - capH);
  let svg = '';
  if (state.includeTrack) {
    svg += roundRect(0, 0, trackW, trackH, trackW / 2).replace('/>', ` fill="${state.colorSecondary}"/>`);
  }
  svg += roundRect(-((capW - trackW) / 2), capY, capW, capH, state.radius).replace('/>', ` fill="${state.colorPrimary}"/>`);
  return svg;
}

function svgPanel(state) {
  return roundRect(0, 0, state.width, state.height, state.radius).replace('/>', ` fill="${state.colorSecondary}" stroke="${state.colorAccent}" stroke-opacity="0.35" stroke-width="${state.strokeWidth || 1}"/>`);
}

function svgLed(state, frameIndex) {
  const on = getNormalizedState(state, frameIndex) >= 0.5;
  const color = on ? state.colorAccent : lighten(state.colorSecondary, -0.1);
  const w = state.width;
  const h = state.height;
  return `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2}" fill="${color}"/>
    ${on ? `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.22}" fill="${state.colorAccent}" opacity="0.95"/>` : ''}`;
}

function svgVu(state, frameIndex) {
  const t = getNormalizedState(state, frameIndex);
  const segments = 12;
  const gap = 2;
  const segW = (state.width - gap * (segments - 1)) / segments;
  let svg = roundRect(0, 0, state.width, state.height, state.radius).replace('/>', ` fill="${state.colorSecondary}"/>`);
  for (let i = 0; i < segments; i += 1) {
    const active = i / (segments - 1) <= t;
    const ratio = i / (segments - 1);
    let col = state.colorAccent;
    if (ratio > 0.7) col = '#ffd166';
    if (ratio > 0.88) col = '#ff5d6c';
    svg += `<rect x="${i * (segW + gap)}" y="${state.height * 0.25}" width="${segW}" height="${state.height * 0.5}" rx="2" fill="${active ? col : lighten(state.colorSecondary, 0.05)}"/>`;
  }
  return svg;
}
