import { useCallback } from 'react';
import Canvas3D from './components/view/Canvas3D.jsx';
import MappingMenu from './components/ui/MappingMenu.jsx';
import { setMappingEntry } from './state/mappingStore.js';
import { MappingProvider, useMapping } from './state/MappingContext.jsx';

function AppContent() {
  const { mappings, setMappings, selectedMeshId, setSelectedMeshId } = useMapping();

  const handleControlClick = useCallback(
    (meshId) => {
      setSelectedMeshId(meshId);
    },
    [setSelectedMeshId],
  );

  const handleActionSelect = useCallback(
    (action) => {
      if (!selectedMeshId) return;
      setMappings((prev) => setMappingEntry(prev, selectedMeshId, action));
    },
    [selectedMeshId, setMappings],
  );

  return (
    <div className="relative h-full w-full">
      <Canvas3D
        onControlClick={handleControlClick}
        highlightedMeshId={selectedMeshId}
      />

      <MappingMenu
        meshId={selectedMeshId}
        currentAction={selectedMeshId ? mappings[selectedMeshId] : null}
        onSelect={handleActionSelect}
        onClose={() => setSelectedMeshId(null)}
      />

      <header className="pointer-events-none absolute left-4 top-4 z-10">
        <h1 className="text-lg font-semibold text-slate-100">MIDI Keyboard Mapper</h1>
        <p className="text-xs text-slate-400">M-Audio Axiom Pro 25 – 3D Mapping</p>
      </header>
    </div>
  );
}

export default function App() {
  return (
    <MappingProvider>
      <AppContent />
    </MappingProvider>
  );
}
