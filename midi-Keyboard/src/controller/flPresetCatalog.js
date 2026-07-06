/**
 * Einfache FL-Studio-Ziele für Einsteiger.
 * Jedes Preset enthält ein vorgeschlagenes MIDI-Signal und eine Schritt-für-Schritt-Anleitung.
 */

/** @typedef {import('../state/mappingStore.js').ControlAssignment} ControlAssignment */
/** @typedef {import('../state/mappingStore.js').MidiBinding} MidiBinding */

const FL_LINK_STEPS = [
  'Öffne FL Studio mit deinem Projekt.',
  'Rechtsklick auf den gewünschten Regler (z.B. Track-Lautstärke).',
  'Wähle „Link to controller" (Mit Controller verknüpfen).',
  'Bewege das physische Bedienelement am Axiom.',
  'Klicke oben links in FL auf das Menü und wähle „Accept" (Übernehmen).',
];

/**
 * @param {string} targetLabel
 * @param {string} controlLabel
 * @returns {string[]}
 */
function buildFlSteps(targetLabel, controlLabel) {
  return [
    `Ziel in FL: ${targetLabel}`,
    ...FL_LINK_STEPS.slice(0, 3),
    `Bewege „${controlLabel}" am Axiom.`,
    FL_LINK_STEPS[4],
  ];
}

/**
 * @param {string} presetId
 * @param {string} label
 * @param {string} category
 * @param {MidiBinding} midi
 * @param {string} flTarget
 * @returns {ControlAssignment}
 */
function createPreset(presetId, label, category, midi, flTarget) {
  return {
    presetId,
    label,
    category,
    midi,
    flSteps: buildFlSteps(flTarget, label),
    isBuiltIn: midi.type === 'builtin',
  };
}

/** @type {ControlAssignment[]} */
export const FL_PRESET_CATALOG = [
  createPreset(
    'builtin-keys',
    'Klavier-Tasten',
    'Bereits aktiv',
    { type: 'builtin', channel: 1, number: 0 },
    'Instrument / Piano-Roll',
  ),
  createPreset(
    'builtin-octave',
    'Oktave +/-',
    'Bereits aktiv',
    { type: 'builtin', channel: 1, number: 0 },
    'Tonhöhenbereich der Tasten',
  ),

  createPreset(
    'mixer-track-1-volume',
    'Track 1 – Lautstärke',
    'Mixer',
    { type: 'cc', channel: 1, number: 16 },
    'Mixer → Insert 1 → Volume',
  ),
  createPreset(
    'mixer-track-2-volume',
    'Track 2 – Lautstärke',
    'Mixer',
    { type: 'cc', channel: 1, number: 17 },
    'Mixer → Insert 2 → Volume',
  ),
  createPreset(
    'mixer-track-3-volume',
    'Track 3 – Lautstärke',
    'Mixer',
    { type: 'cc', channel: 1, number: 18 },
    'Mixer → Insert 3 → Volume',
  ),
  createPreset(
    'mixer-track-4-volume',
    'Track 4 – Lautstärke',
    'Mixer',
    { type: 'cc', channel: 1, number: 19 },
    'Mixer → Insert 4 → Volume',
  ),
  createPreset(
    'mixer-master-volume',
    'Master – Lautstärke',
    'Mixer',
    { type: 'cc', channel: 1, number: 7 },
    'Mixer → Master → Volume',
  ),

  createPreset(
    'transport-play',
    'Play / Pause',
    'Transport',
    { type: 'cc', channel: 1, number: 114 },
    'Transport → Play/Pause',
  ),
  createPreset(
    'transport-stop',
    'Stop',
    'Transport',
    { type: 'cc', channel: 1, number: 115 },
    'Transport → Stop',
  ),
  createPreset(
    'transport-record',
    'Aufnahme',
    'Transport',
    { type: 'cc', channel: 1, number: 116 },
    'Transport → Record',
  ),

  createPreset(
    'knob-filter-cutoff',
    'Filter Cutoff (Synth)',
    'Effekte',
    { type: 'cc', channel: 1, number: 74 },
    'Plugin-Regler (z.B. Filter Cutoff)',
  ),
  createPreset(
    'knob-resonance',
    'Filter Resonanz',
    'Effekte',
    { type: 'cc', channel: 1, number: 71 },
    'Plugin-Regler (z.B. Resonanz)',
  ),
  createPreset(
    'pad-drum-1',
    'Drum Pad 1',
    'Pads',
    { type: 'note', channel: 10, number: 36 },
    'FPC / Drum-Plugin → Pad 1',
  ),
  createPreset(
    'pad-drum-2',
    'Drum Pad 2',
    'Pads',
    { type: 'note', channel: 10, number: 37 },
    'FPC / Drum-Plugin → Pad 2',
  ),
];

/** @type {string[]} */
export const PRESET_CATEGORIES = [
  'Bereits aktiv',
  'Mixer',
  'Transport',
  'Effekte',
  'Pads',
  'Eigenes MIDI',
];

/**
 * @param {string} category
 */
export function getPresetsByCategory(category) {
  return FL_PRESET_CATALOG.filter((preset) => preset.category === category);
}

/**
 * @param {string} presetId
 */
export function getPresetById(presetId) {
  return FL_PRESET_CATALOG.find((preset) => preset.presetId === presetId) ?? null;
}

/**
 * @param {ControlAssignment} preset
 * @param {MidiBinding} learnedMidi
 */
export function applyLearnedMidi(preset, learnedMidi) {
  return {
    ...preset,
    midi: learnedMidi,
    flSteps: buildFlSteps(
      preset.flSteps[0]?.replace('Ziel in FL: ', '') ?? preset.label,
      preset.label,
    ),
  };
}

/**
 * @param {MidiBinding} midi
 */
export function createCustomAssignment(midi) {
  return {
    presetId: `custom-${midi.type}-${midi.channel}-${midi.number}`,
    label: 'Freies MIDI-Signal',
    category: 'Eigenes MIDI',
    midi,
    flSteps: buildFlSteps('Beliebiger FL-Regler', formatMidiShort(midi)),
  };
}

/**
 * @param {MidiBinding} midi
 */
export function formatMidiShort(midi) {
  if (midi.type === 'cc') return `CC ${midi.number}`;
  if (midi.type === 'note') return `Note ${midi.number}`;
  return 'Signal';
}
