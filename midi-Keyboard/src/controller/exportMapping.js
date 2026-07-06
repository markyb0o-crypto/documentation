/**
 * Exportiert Zuweisungen im FL-tauglichen Format.
 * Später: Konvertierung in FL MIDI-Script / Controller-Map.
 */

/**
 * @param {Record<string, import('../state/mappingStore.js').FlParameter>} mappings
 */
export function exportMappingToJson(mappings) {
  const exportPayload = {
    version: 1,
    target: 'fl-studio',
    assignments: Object.entries(mappings).map(([meshId, parameter]) => ({
      meshId,
      parameterId: parameter.parameterId,
      label: parameter.label,
      category: parameter.category,
    })),
  };

  return JSON.stringify(exportPayload, null, 2);
}
