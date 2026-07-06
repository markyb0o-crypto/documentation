/** Reines JSON-Mapping: meshId → FL-Studio-Parameter */
export const initialMappingState = {};

export function setMappingEntry(mappings, meshId, flStudioAction) {
  return {
    ...mappings,
    [meshId]: flStudioAction,
  };
}

export function removeMappingEntry(mappings, meshId) {
  const next = { ...mappings };
  delete next[meshId];
  return next;
}
