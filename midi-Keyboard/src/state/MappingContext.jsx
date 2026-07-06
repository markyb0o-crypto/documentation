import { createContext, useContext, useMemo, useState } from 'react';
import { initialMappingState } from './mappingStore.js';

const MappingContext = createContext(null);

export function MappingProvider({ children }) {
  const [mappings, setMappings] = useState(initialMappingState);
  const [selectedMeshId, setSelectedMeshId] = useState(null);

  const value = useMemo(
    () => ({
      mappings,
      setMappings,
      selectedMeshId,
      setSelectedMeshId,
    }),
    [mappings, selectedMeshId],
  );

  return <MappingContext.Provider value={value}>{children}</MappingContext.Provider>;
}

export function useMapping() {
  const context = useContext(MappingContext);
  if (!context) {
    throw new Error('useMapping muss innerhalb von MappingProvider verwendet werden.');
  }
  return context;
}
