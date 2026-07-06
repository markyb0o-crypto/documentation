/**
 * Ziel-Schema für FL-Studio-Parameter-Zuweisungen.
 *
 * mappings[meshId] = {
 *   parameterId: string,   // stabile ID aus FL (z.B. "mixer.track.3.volume")
 *   label: string,         // Anzeigename in FL
 *   category: string,      // z.B. "Mixer", "Playlist", "Plugin"
 *   path: string[],        // hierarchischer Pfad für die UI-Suche
 * }
 */

/** @typedef {{ parameterId: string, label: string, category: string, path: string[] }} FlParameter */

/** @type {Record<string, FlParameter>} */
export const initialMappingState = {};

/**
 * @param {Record<string, FlParameter>} mappings
 * @param {string} meshId
 * @param {FlParameter} flParameter
 */
export function setMappingEntry(mappings, meshId, flParameter) {
  return {
    ...mappings,
    [meshId]: flParameter,
  };
}

/**
 * @param {Record<string, FlParameter>} mappings
 * @param {string} meshId
 */
export function removeMappingEntry(mappings, meshId) {
  const next = { ...mappings };
  delete next[meshId];
  return next;
}

/**
 * @param {Record<string, FlParameter>} mappings
 * @param {string} meshId
 * @returns {FlParameter | null}
 */
export function getMappingForMesh(mappings, meshId) {
  return mappings[meshId] ?? null;
}
