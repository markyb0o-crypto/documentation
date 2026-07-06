/**
 * FL-Studio-Funktionen mit Beschreibung – was steuert was.
 */

/** @typedef {import('../state/mappingStore.js').ControlAssignment} ControlAssignment */
/** @typedef {import('../state/mappingStore.js').MidiBinding} MidiBinding */

/**
 * @typedef {{
 *   presetId: string,
 *   label: string,
 *   category: string,
 *   description: string,
 *   flLocation: string,
 *   midi: MidiBinding,
 *   flSteps: string[],
 *   isBuiltIn?: boolean,
 * }} FlPreset
 */

/**
 * @param {string} presetId
 * @param {string} label
 * @param {string} category
 * @param {string} description
 * @param {string} flLocation
 * @param {MidiBinding} midi
 */
function preset(presetId, label, category, description, flLocation, midi) {
  return {
    presetId,
    label,
    category,
    description,
    flLocation,
    midi,
    flSteps: [],
    isBuiltIn: midi.type === 'builtin',
  };
}

/** @type {FlPreset[]} */
export const FL_PRESET_CATALOG = [
  preset(
    'builtin-keys',
    'Klavier-Tasten',
    'Tastatur',
    'Spielt Noten in der Piano Roll oder im gewählten Instrument. Funktioniert bei dir schon im Generic-Modus.',
    'Piano Roll / Channel Rack',
    { type: 'builtin', channel: 1, number: 0 },
  ),
  preset(
    'builtin-octave',
    'Oktave +/-',
    'Tastatur',
    'Verschiebt den Tonumfang der Tasten höher oder tiefer, ohne die Oktave in FL umzustellen.',
    'Keyboard-Bereich (Generic)',
    { type: 'builtin', channel: 1, number: 0 },
  ),

  preset(
    'mixer-track-1-volume',
    'Track 1 – Lautstärke',
    'Mixer',
    'Regelt wie laut Spur 1 im Mix ist. Ideal für Fader am Axiom.',
    'Mixer → Insert 1 → Volume',
    { type: 'cc', channel: 1, number: 16 },
  ),
  preset(
    'mixer-track-2-volume',
    'Track 2 – Lautstärke',
    'Mixer',
    'Lautstärke der zweiten Spur – z.B. Bass, Drums oder Vocals.',
    'Mixer → Insert 2 → Volume',
    { type: 'cc', channel: 1, number: 17 },
  ),
  preset(
    'mixer-track-3-volume',
    'Track 3 – Lautstärke',
    'Mixer',
    'Lautstärke der dritten Spur im Mixer.',
    'Mixer → Insert 3 → Volume',
    { type: 'cc', channel: 1, number: 18 },
  ),
  preset(
    'mixer-track-4-volume',
    'Track 4 – Lautstärke',
    'Mixer',
    'Lautstärke der vierten Spur im Mixer.',
    'Mixer → Insert 4 → Volume',
    { type: 'cc', channel: 1, number: 19 },
  ),
  preset(
    'mixer-track-1-pan',
    'Track 1 – Pan',
    'Mixer',
    'Schiebt den Sound nach links oder rechts im Stereofeld.',
    'Mixer → Insert 1 → Pan',
    { type: 'cc', channel: 1, number: 20 },
  ),
  preset(
    'mixer-track-2-pan',
    'Track 2 – Pan',
    'Mixer',
    'Stereo-Position der zweiten Spur.',
    'Mixer → Insert 2 → Pan',
    { type: 'cc', channel: 1, number: 21 },
  ),
  preset(
    'mixer-master-volume',
    'Master – Lautstärke',
    'Mixer',
    'Gesamtlautstärke des Songs – vorsichtig nutzen, betrifft alles.',
    'Mixer → Master → Volume',
    { type: 'cc', channel: 1, number: 7 },
  ),

  preset(
    'transport-play',
    'Play / Pause',
    'Transport',
    'Startet oder pausiert die Wiedergabe deines Projekts.',
    'Transportleiste → Play',
    { type: 'cc', channel: 1, number: 114 },
  ),
  preset(
    'transport-stop',
    'Stop',
    'Transport',
    'Stoppt die Wiedergabe und springt zum Anfang.',
    'Transportleiste → Stop',
    { type: 'cc', channel: 1, number: 115 },
  ),
  preset(
    'transport-record',
    'Aufnahme',
    'Transport',
    'Startet die Aufnahme – z.B. für MIDI oder Audio.',
    'Transportleiste → Record',
    { type: 'cc', channel: 1, number: 116 },
  ),

  preset(
    'knob-filter-cutoff',
    'Filter Cutoff',
    'Synth & Effekte',
    'Öffnet oder schließt den Filter – klassischer „Wuuush"-Sound beim Drehen.',
    'Plugin → Filter / Cutoff',
    { type: 'cc', channel: 1, number: 74 },
  ),
  preset(
    'knob-resonance',
    'Filter Resonanz',
    'Synth & Effekte',
    'Verstärkt die Frequenz am Cutoff – schärferer, synthetischer Klang.',
    'Plugin → Resonance / Q',
    { type: 'cc', channel: 1, number: 71 },
  ),
  preset(
    'knob-reverb-send',
    'Reverb Send',
    'Synth & Effekte',
    'Schickt mehr oder weniger Signal zum Hall-Effekt.',
    'Mixer → Send → Reverb',
    { type: 'cc', channel: 1, number: 91 },
  ),
  preset(
    'knob-delay-send',
    'Delay Send',
    'Synth & Effekte',
    'Steuert wie viel Echo/Delay auf die Spur geht.',
    'Mixer → Send → Delay',
    { type: 'cc', channel: 1, number: 92 },
  ),

  preset(
    'pad-drum-1',
    'Kick / Pad 1',
    'Drums',
    'Löst das erste Drum-Pad aus – meist Kick Drum.',
    'FPC / Drum-Plugin → Pad 1',
    { type: 'note', channel: 10, number: 36 },
  ),
  preset(
    'pad-drum-2',
    'Snare / Pad 2',
    'Drums',
    'Zweites Drum-Pad – typischerweise Snare.',
    'FPC / Drum-Plugin → Pad 2',
    { type: 'note', channel: 10, number: 37 },
  ),
  preset(
    'pad-drum-3',
    'Hi-Hat / Pad 3',
    'Drums',
    'Drittes Drum-Pad – oft Closed Hi-Hat.',
    'FPC / Drum-Plugin → Pad 3',
    { type: 'note', channel: 10, number: 42 },
  ),
  preset(
    'pad-drum-4',
    'Clap / Pad 4',
    'Drums',
    'Viertes Drum-Pad – Clap oder Percussion.',
    'FPC / Drum-Plugin → Pad 4',
    { type: 'note', channel: 10, number: 39 },
  ),
];

/** @type {string[]} */
export const PRESET_CATEGORIES = [...new Set(FL_PRESET_CATALOG.map((p) => p.category))];

/** Nur zuweisbare Ziele (ohne bereits aktive Generic-Funktionen). */
export const ASSIGNABLE_PRESETS = FL_PRESET_CATALOG.filter((p) => !p.isBuiltIn);

/**
 * @param {string} category
 */
export function getPresetsByCategory(category) {
  return FL_PRESET_CATALOG.filter((p) => p.category === category);
}

/**
 * @param {string} presetId
 */
export function getPresetById(presetId) {
  return FL_PRESET_CATALOG.find((p) => p.presetId === presetId) ?? null;
}

/**
 * @param {FlPreset} source
 * @param {MidiBinding} learnedMidi
 */
export function applyLearnedMidi(source, learnedMidi) {
  return { ...source, midi: learnedMidi };
}

/**
 * @param {MidiBinding} midi
 */
export function createCustomAssignment(midi) {
  return {
    presetId: `custom-${midi.type}-${midi.channel}-${midi.number}`,
    label: 'Freies MIDI-Signal',
    category: 'Eigenes',
    description: 'Beliebiger Regler in FL – du verknüpfst ihn selbst.',
    flLocation: 'Beliebig in FL Studio',
    midi,
    flSteps: [],
  };
}
