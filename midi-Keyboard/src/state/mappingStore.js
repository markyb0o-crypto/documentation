/**
 * Zuweisung: 3D-Bauteil → MIDI-Signal → FL-Studio-Ziel (per Link to Controller).
 *
 * mappings[meshId] = {
 *   presetId: string,
 *   label: string,
 *   category: string,
 *   description: string,
 *   flLocation: string,
 *   midi: MidiBinding,
 *   flSteps?: string[],
 *   isBuiltIn?: boolean,
 * }
 */

/** @typedef {{ type: 'cc' | 'note' | 'builtin', channel: number, number: number }} MidiBinding */

/**
 * @typedef {{
 *   presetId: string,
 *   label: string,
 *   category: string,
 *   midi: MidiBinding,
 *   flSteps: string[],
 *   isBuiltIn?: boolean,
 * }} ControlAssignment
 */

/** @type {Record<string, ControlAssignment>} */
export const initialMappingState = {};

/**
 * @param {Record<string, ControlAssignment>} mappings
 * @param {string} meshId
 * @param {ControlAssignment} assignment
 */
export function setMappingEntry(mappings, meshId, assignment) {
  return { ...mappings, [meshId]: assignment };
}

/**
 * @param {Record<string, ControlAssignment>} mappings
 * @param {string} meshId
 */
export function removeMappingEntry(mappings, meshId) {
  const next = { ...mappings };
  delete next[meshId];
  return next;
}

/**
 * @param {Record<string, ControlAssignment>} mappings
 * @returns {number}
 */
export function countMappings(mappings) {
  return Object.keys(mappings).length;
}

/**
 * @param {MidiBinding} midi
 */
export function formatMidiLabel(midi) {
  if (midi.type === 'builtin') return 'Bereits aktiv (Generic)';
  if (midi.type === 'cc') return `MIDI CC ${midi.number} (Kanal ${midi.channel})`;
  if (midi.type === 'note') return `MIDI Note ${midi.number} (Kanal ${midi.channel})`;
  return 'Unbekannt';
}
