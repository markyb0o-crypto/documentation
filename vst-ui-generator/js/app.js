import { DEFAULT_STATE, describeState, formatAssetName, mergeState } from './config.js';
import { exportCurrentPng, exportPngZip, exportSvgZip } from './exporter.js';
import { renderAsset, createExportCanvas } from './renderer.js';

/** @type {import('./config.js').GeneratorState} */
let state = { ...DEFAULT_STATE };

const previewCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById('previewCanvas'));
const previewCtx = previewCanvas.getContext('2d');

const bindings = {
  assetType: 'assetType',
  stylePreset: 'stylePreset',
  materialPreset: 'materialPreset',
  width: 'width',
  height: 'height',
  radius: 'radius',
  scale: 'scale',
  strokeWidth: 'strokeWidth',
  colorPrimary: 'colorPrimary',
  colorSecondary: 'colorSecondary',
  colorAccent: 'colorAccent',
  colorBackground: 'colorBackground',
  colorHighlight: 'colorHighlight',
  colorShadow: 'colorShadow',
  opacity: 'opacity',
  stateIndex: 'stateIndex',
  frameCount: 'frameCount',
  angleStart: 'angleStart',
  angleEnd: 'angleEnd',
  includeTrack: 'includeTrack',
  shadowIntensity: 'shadowIntensity',
  blurAmount: 'blurAmount',
  glossAmount: 'glossAmount',
  roughness: 'roughness',
  exportPrefix: 'exportPrefix',
  exportStart: 'exportStart',
  transparentBg: 'transparentBg',
  paddingExport: 'paddingExport',
  showGrid: 'showGrid',
  showChecker: 'showChecker',
};

function readStateFromUI() {
  /** @type {Partial<import('./config.js').GeneratorState>} */
  const next = {};

  for (const [key, id] of Object.entries(bindings)) {
    const el = document.getElementById(id);
    if (!el) continue;

    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') next[key] = el.checked;
      else if (el.type === 'range' || el.type === 'number') next[key] = Number(el.value);
      else if (el.type === 'color') next[key] = el.value;
      else next[key] = el.value;
    } else if (el instanceof HTMLSelectElement) {
      next[key] = el.value;
    }
  }

  state = mergeState({ ...state, ...next });
  syncUI();
  render();
}

function syncUI() {
  document.getElementById('widthVal').textContent = String(state.width);
  document.getElementById('heightVal').textContent = String(state.height);
  document.getElementById('radiusVal').textContent = String(state.radius);
  document.getElementById('scaleVal').textContent = state.scale.toFixed(2);
  document.getElementById('strokeVal').textContent = String(state.strokeWidth);
  document.getElementById('opacityVal').textContent = String(state.opacity);
  document.getElementById('stateVal').textContent = String(state.stateIndex);
  document.getElementById('frameCountVal').textContent = String(state.frameCount);
  document.getElementById('shadowVal').textContent = String(state.shadowIntensity);
  document.getElementById('blurVal').textContent = String(state.blurAmount);
  document.getElementById('glossVal').textContent = String(state.glossAmount);
  document.getElementById('roughnessVal').textContent = String(state.roughness);

  const stateSlider = document.getElementById('stateIndex');
  stateSlider.max = String(Math.max(0, state.frameCount - 1));
  if (state.stateIndex > state.frameCount - 1) {
    state.stateIndex = state.frameCount - 1;
    stateSlider.value = String(state.stateIndex);
  }

  const angleField = document.getElementById('angleField');
  angleField.style.display = state.assetType === 'knob' ? 'grid' : 'none';

  document.getElementById('previewInfo').textContent =
    `Asset ${state.stateIndex + 1} / ${state.frameCount} · ${describeState(state)}`;

  const first = formatAssetName(state.exportPrefix, state.exportStart, 0);
  const last = formatAssetName(state.exportPrefix, state.exportStart, state.frameCount - 1);
  document.getElementById('exportInfo').textContent =
    `Export: ${first}.png … ${last}.png (freigestellt)`;

  const stage = document.getElementById('previewStage');
  stage.style.backgroundColor = state.showChecker ? '#0f1218' : state.colorBackground;
}

function renderPreview() {
  previewCanvas.dataset.preview = 'true';
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (state.showChecker) {
    drawChecker(previewCtx, previewCanvas.width, previewCanvas.height);
  } else if (!state.transparentBg) {
    previewCtx.fillStyle = state.colorBackground;
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  }

  const exportDims = getPreviewLayout();
  previewCtx.save();
  previewCtx.globalAlpha = state.opacity / 100;
  previewCtx.translate(exportDims.offsetX, exportDims.offsetY);
  previewCtx.scale(exportDims.fitScale, exportDims.fitScale);
  renderAsset(previewCtx, state, state.stateIndex, { pad: state.paddingExport ? 4 : 0 });
  previewCtx.restore();

  if (state.showGrid) drawGrid(previewCtx, previewCanvas.width, previewCanvas.height);
}

function getPreviewLayout() {
  const pad = state.paddingExport ? 4 : 0;
  let w = state.width * state.scale + pad * 2;
  let h = state.height * state.scale + pad * 2;
  if (state.assetType === 'slider' && state.includeTrack) h = state.height * 2.2 * state.scale + pad * 2;
  if (state.assetType === 'fader' && state.includeTrack) {
    w = state.width * 1.8 * state.scale + pad * 2;
    h = state.height * 2.8 * state.scale + pad * 2;
  }
  const fitScale = Math.min((previewCanvas.width - 40) / w, (previewCanvas.height - 40) / h, 4);
  return {
    fitScale,
    offsetX: (previewCanvas.width - w * fitScale) / 2,
    offsetY: (previewCanvas.height - h * fitScale) / 2,
  };
}

function drawChecker(ctx, width, height) {
  const size = 12;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#2a2f3a' : '#22262f';
      ctx.fillRect(x, y, size, size);
    }
  }
}

function drawGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x < width; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  ctx.restore();
}

function renderFilmstrip() {
  const strip = document.getElementById('filmstrip');
  strip.innerHTML = '';

  for (let i = 0; i < state.frameCount; i += 1) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `filmstrip-item${i === state.stateIndex ? ' active' : ''}`;
    item.title = formatAssetName(state.exportPrefix, state.exportStart, i);

    const mini = createExportCanvas(state, i);
    mini.style.width = '100%';
    mini.style.height = '100%';
    item.appendChild(mini);

    const label = document.createElement('span');
    label.textContent = String(i + 1);
    item.appendChild(label);

    item.addEventListener('click', () => {
      state.stateIndex = i;
      document.getElementById('stateIndex').value = String(i);
      render();
    });

    strip.appendChild(item);
  }
}

function render() {
  syncUI();
  renderPreview();
  renderFilmstrip();
}

function bindEvents() {
  for (const id of Object.values(bindings)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const event = el instanceof HTMLSelectElement || el.type === 'color' || el.type === 'number' || el.type === 'text'
      ? 'change'
      : 'input';
    el.addEventListener(event, readStateFromUI);
  }

  document.getElementById('exportPngBtn').addEventListener('click', async () => {
    readStateFromUI();
    await exportPngZip(state);
  });

  document.getElementById('exportSvgBtn').addEventListener('click', async () => {
    readStateFromUI();
    await exportSvgZip(state);
  });

  document.getElementById('exportSingleBtn').addEventListener('click', async () => {
    readStateFromUI();
    await exportCurrentPng(state);
  });
}

function initDefaultsInUI() {
  for (const [key, id] of Object.entries(bindings)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const value = state[key];
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') el.checked = Boolean(value);
      else el.value = String(value);
    } else if (el instanceof HTMLSelectElement) {
      el.value = String(value);
    }
  }
}

bindEvents();
initDefaultsInUI();
render();
