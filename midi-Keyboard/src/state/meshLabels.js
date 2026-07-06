const LABELS = {
  transport_play: 'Play',
  transport_stop: 'Stop',
  transport_record: 'Aufnahme',
  octave_up: 'Oktave +',
  octave_down: 'Oktave -',
};

export function formatMeshLabel(meshId) {
  if (!meshId) return '';
  if (LABELS[meshId]) return LABELS[meshId];
  const m = meshId.match(/^(key|pad|knob|fader)_(\d+)$/);
  if (m) {
    const names = { key: 'Taste', pad: 'Pad', knob: 'Knopf', fader: 'Fader' };
    return `${names[m[1]]} ${m[2]}`;
  }
  if (meshId.startsWith('key_black_')) return `Taste ${meshId.replace('key_black_', '')}`;
  return meshId;
}
