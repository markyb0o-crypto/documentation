import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialMappingState } from './mappingStore.js';
import { isDesktopApp, loadMappingsFromDisk, saveMappingsToDisk } from '../platform/desktop.js';

const STORAGE_KEY = 'midi-keyboard-mappings';
const MappingContext = createContext(null);

function loadBrowserMappings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialMappingState;
  } catch {
    return initialMappingState;
  }
}

export function MappingProvider({ children }) {
  const [mappings, setMappings] = useState(initialMappingState);
  const [selectedMeshId, setSelectedMeshId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (isDesktopApp()) {
        const disk = await loadMappingsFromDisk();
        if (!cancelled && disk) setMappings(disk);
      } else {
        if (!cancelled) setMappings(loadBrowserMappings());
      }
      if (!cancelled) setReady(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (isDesktopApp()) {
      saveMappingsToDisk(mappings);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    }
  }, [mappings, ready]);

  const value = useMemo(
    () => ({
      mappings,
      setMappings,
      selectedMeshId,
      setSelectedMeshId,
      ready,
      isDesktop: isDesktopApp(),
    }),
    [mappings, selectedMeshId, ready],
  );

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0c10] text-slate-400">
        Lädt…
      </div>
    );
  }

  return <MappingContext.Provider value={value}>{children}</MappingContext.Provider>;
}

export function useMapping() {
  const context = useContext(MappingContext);
  if (!context) {
    throw new Error('useMapping muss innerhalb von MappingProvider verwendet werden.');
  }
  return context;
}
