import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialMappingState } from './mappingStore.js';

const STORAGE_KEY = 'midi-keyboard-mappings';

function loadMappings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialMappingState;
  } catch {
    return initialMappingState;
  }
}

const MappingContext = createContext(null);

export function MappingProvider({ children }) {
  const [mappings, setMappings] = useState(loadMappings);
  const [selectedMeshId, setSelectedMeshId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  }, [mappings]);

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
