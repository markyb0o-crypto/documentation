import { useCallback, useEffect, useRef, useState } from 'react';
import Canvas3D from './components/view/Canvas3D.jsx';
import AssignPanel from './components/ui/AssignPanel.jsx';
import FunctionCatalog from './components/ui/FunctionCatalog.jsx';
import { applyLearnedMidi } from './controller/flPresetCatalog.js';
import useWebMidi from './hooks/useWebMidi.js';
import { setMappingEntry } from './state/mappingStore.js';
import { MappingProvider, useMapping } from './state/MappingContext.jsx';

function Mapper() {
  const { mappings, setMappings, selectedMeshId, setSelectedMeshId } = useMapping();
  const { connected, connect, startLearning } = useWebMidi();
  const learnedByMesh = useRef({});
  const listenStop = useRef(null);
  const [listening, setListening] = useState(false);
  const [learnedMidi, setLearnedMidi] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    connect().catch(() => {});
  }, [connect]);

  useEffect(() => {
    listenStop.current?.();
    if (!selectedMeshId || !connected) {
      setListening(false);
      setLearnedMidi(null);
      return undefined;
    }

    setLearnedMidi(learnedByMesh.current[selectedMeshId] ?? null);
    setListening(!learnedByMesh.current[selectedMeshId]);

    if (learnedByMesh.current[selectedMeshId]) return undefined;

    listenStop.current = startLearning((midi) => {
      learnedByMesh.current[selectedMeshId] = midi;
      setLearnedMidi(midi);
      setListening(false);
    });

    return () => listenStop.current?.();
  }, [selectedMeshId, connected, startLearning]);

  const handleControlClick = useCallback((meshId) => {
    setSelectedMeshId(meshId);
  }, [setSelectedMeshId]);

  const handleAssign = useCallback((preset) => {
    if (!selectedMeshId) return;
    const midi = learnedByMesh.current[selectedMeshId];
    const assignment = midi ? applyLearnedMidi(preset, midi) : preset;
    setMappings((prev) => setMappingEntry(prev, selectedMeshId, assignment));
    setSelectedMeshId(null);
  }, [selectedMeshId, setMappings, setSelectedMeshId]);

  return (
    <div className="relative h-full w-full">
      <Canvas3D onControlClick={handleControlClick} highlightedMeshId={selectedMeshId} />

      <button
        type="button"
        onClick={() => setShowCatalog(true)}
        className="pointer-events-auto absolute right-4 top-4 z-10 rounded-full border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 backdrop-blur hover:bg-slate-800"
      >
        Funktionen
      </button>

      <FunctionCatalog open={showCatalog} onClose={() => setShowCatalog(false)} />

      <AssignPanel
        meshId={selectedMeshId}
        learnedMidi={learnedMidi}
        isListening={listening}
        currentAssignment={selectedMeshId ? mappings[selectedMeshId] : null}
        onAssign={handleAssign}
        onClose={() => setSelectedMeshId(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <MappingProvider>
      <Mapper />
    </MappingProvider>
  );
}
