const MESH_LABELS = {
  transport_play: 'Play',
  transport_stop: 'Stop',
  transport_record: 'Aufnahme',
  octave_up: 'Oktave +',
  octave_down: 'Oktave -',
};

export function formatMeshLabel(meshId) {
  if (!meshId) return '';
  if (MESH_LABELS[meshId]) return MESH_LABELS[meshId];

  const match = meshId.match(/^(key|pad|knob|fader)_(\d+)$/);
  if (match) {
    const labels = { key: 'Taste', pad: 'Pad', knob: 'Knopf', fader: 'Fader' };
    return `${labels[match[1]]} ${match[2]}`;
  }

  if (meshId.startsWith('key_black_')) {
    return `Schwarze Taste ${meshId.replace('key_black_', '')}`;
  }

  return meshId;
}
