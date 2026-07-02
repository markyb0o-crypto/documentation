import { formatAssetName } from './config.js';
import { createExportCanvas } from './renderer.js';
import { renderSvg } from './svg-renderer.js';

/** @param {import('./config.js').GeneratorState} state */
export async function exportPngZip(state) {
  const zip = new JSZip();
  const folder = zip.folder(state.exportPrefix || 'Assets');
  const tasks = [];

  for (let i = 0; i < state.frameCount; i += 1) {
    const canvas = createExportCanvas(state, i);
    const name = formatAssetName(state.exportPrefix, state.exportStart, i);
    const blob = await canvasToBlob(canvas);
    folder.file(`${name}.png`, blob);
    tasks.push(name);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `${state.exportPrefix}_png_export.zip`);
  return tasks;
}

/** @param {import('./config.js').GeneratorState} state */
export async function exportSvgZip(state) {
  const zip = new JSZip();
  const folder = zip.folder(state.exportPrefix || 'Assets');

  for (let i = 0; i < state.frameCount; i += 1) {
    const svg = renderSvg(state, i);
    const name = formatAssetName(state.exportPrefix, state.exportStart, i);
    folder.file(`${name}.svg`, svg);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `${state.exportPrefix}_svg_export.zip`);
}

/** @param {import('./config.js').GeneratorState} state */
export async function exportCurrentPng(state) {
  const canvas = createExportCanvas(state, state.stateIndex);
  const name = formatAssetName(state.exportPrefix, state.exportStart, state.stateIndex);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${name}.png`);
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
