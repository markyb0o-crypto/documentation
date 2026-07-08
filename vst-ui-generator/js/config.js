/** @typedef {'knob'|'button'|'slider'|'fader'|'panel'|'led'|'vuMeter'} AssetType */
/** @typedef {'flat'|'neumorphism'|'glassmorphism'|'skeuomorphic'|'minimal'} StylePreset */
/** @typedef {'plastic'|'rubber'|'glass'|'metal'|'brushedMetal'|'wood'|'carbon'} MaterialPreset */

/**
 * @typedef {Object} GeneratorState
 * @property {AssetType} assetType
 * @property {StylePreset} stylePreset
 * @property {MaterialPreset} materialPreset
 * @property {number} width
 * @property {number} height
 * @property {number} radius
 * @property {number} scale
 * @property {number} strokeWidth
 * @property {string} colorPrimary
 * @property {string} colorSecondary
 * @property {string} colorAccent
 * @property {string} colorBackground
 * @property {string} colorHighlight
 * @property {string} colorShadow
 * @property {number} opacity
 * @property {number} stateIndex
 * @property {number} frameCount
 * @property {number} angleStart
 * @property {number} angleEnd
 * @property {boolean} includeTrack
 * @property {number} shadowIntensity
 * @property {number} blurAmount
 * @property {number} glossAmount
 * @property {number} roughness
 * @property {string} exportPrefix
 * @property {number} exportStart
 * @property {boolean} transparentBg
 * @property {boolean} paddingExport
 * @property {boolean} showGrid
 * @property {boolean} showChecker
 */

export const DEFAULT_STATE = {
  assetType: 'knob',
  stylePreset: 'neumorphism',
  materialPreset: 'plastic',
  width: 80,
  height: 80,
  radius: 12,
  scale: 1,
  strokeWidth: 1,
  colorPrimary: '#3d7cff',
  colorSecondary: '#1a1f2e',
  colorAccent: '#00e5a0',
  colorBackground: '#12151c',
  colorHighlight: '#ffffff',
  colorShadow: '#000000',
  opacity: 100,
  stateIndex: 0,
  frameCount: 8,
  angleStart: -135,
  angleEnd: 135,
  includeTrack: true,
  shadowIntensity: 40,
  blurAmount: 12,
  glossAmount: 55,
  roughness: 35,
  exportPrefix: 'Asset',
  exportStart: 1,
  transparentBg: true,
  paddingExport: true,
  showGrid: false,
  showChecker: true,
};

/** @param {Partial<GeneratorState>} partial */
export function mergeState(partial) {
  return { ...DEFAULT_STATE, ...partial };
}

/** @param {GeneratorState} state @param {number} index */
export function getNormalizedState(state, index) {
  if (state.frameCount <= 1) return 0;
  return index / (state.frameCount - 1);
}

/** @param {GeneratorState} state @param {number} index */
export function getKnobAngle(state, index) {
  const t = getNormalizedState(state, index);
  return state.angleStart + (state.angleEnd - state.angleStart) * t;
}

/** @param {GeneratorState} state */
export function getExportDimensions(state) {
  const pad = state.paddingExport ? 4 : 0;
  const w = Math.ceil(state.width * state.scale + pad * 2);
  const h = Math.ceil(state.height * state.scale + pad * 2);

  if (state.assetType === 'slider' && state.includeTrack) {
    return { width: w, height: Math.ceil((state.height * 2.2) * state.scale + pad * 2), pad };
  }
  if (state.assetType === 'fader' && state.includeTrack) {
    return { width: Math.ceil((state.width * 1.8) * state.scale + pad * 2), height: Math.ceil((state.height * 2.8) * state.scale + pad * 2), pad };
  }
  return { width: w, height: h, pad };
}

/** @param {number} start @param {number} count @param {number} pad */
export function formatAssetName(prefix, start, index, pad = 3) {
  const num = String(start + index).padStart(pad, '0');
  return `${prefix}_${num}`;
}

/** @param {string} hex @param {number} alpha 0-1 */
export function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** @param {string} hex @param {number} amount -1..1 */
export function adjustColor(hex, amount) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  let r = parseInt(full.slice(0, 2), 16);
  let g = parseInt(full.slice(2, 4), 16);
  let b = parseInt(full.slice(4, 6), 16);
  const f = amount >= 0 ? 255 : 0;
  const p = Math.abs(amount);
  r = Math.round(r + (f - r) * p);
  g = Math.round(g + (f - g) * p);
  b = Math.round(b + (f - b) * p);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** @param {GeneratorState} state */
export function describeState(state) {
  const labels = {
    knob: 'Knob', button: 'Button', slider: 'Slider', fader: 'Fader',
    panel: 'Panel', led: 'LED', vuMeter: 'VU Meter',
  };
  const styles = {
    flat: 'Flat', neumorphism: 'Neumorphism', glassmorphism: 'Glassmorphism',
    skeuomorphic: 'Skeuomorph', minimal: 'Minimal Dark',
  };
  const materials = {
    plastic: 'Plastik', rubber: 'Gummi', glass: 'Glas', metal: 'Metall',
    brushedMetal: 'Gebürstetes Metall', wood: 'Holz', carbon: 'Carbon',
  };
  return `${labels[state.assetType]} · ${styles[state.stylePreset]} · ${materials[state.materialPreset]}`;
}
