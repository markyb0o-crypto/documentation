/**
 * Platzhalter-Katalog – wird später durch echte FL-Studio-Parameter ersetzt.
 * Quelle: MIDI-Scripting, Remote Control oder OSC/API-Brücke zu FL.
 */

/** @typedef {import('../state/mappingStore.js').FlParameter} FlParameter */

/** @type {FlParameter[]} */
export const FL_PARAMETER_CATALOG_PLACEHOLDER = [
  {
    parameterId: 'mixer.track.1.volume',
    label: 'Track 1 – Volume',
    category: 'Mixer',
    path: ['Mixer', 'Track 1', 'Volume'],
  },
  {
    parameterId: 'mixer.track.1.pan',
    label: 'Track 1 – Pan',
    category: 'Mixer',
    path: ['Mixer', 'Track 1', 'Pan'],
  },
  {
    parameterId: 'transport.play',
    label: 'Play / Pause',
    category: 'Transport',
    path: ['Transport', 'Play'],
  },
];

/**
 * Später: Parameter live aus FL Studio laden.
 * @returns {Promise<FlParameter[]>}
 */
export async function fetchFlParameters() {
  return FL_PARAMETER_CATALOG_PLACEHOLDER;
}
