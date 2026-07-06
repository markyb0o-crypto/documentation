import { useCallback, useEffect, useRef, useState } from 'react';
import SketchfabViewer from './components/view/SketchfabViewer.jsx';
import AssignPanel from './components/ui/AssignPanel.jsx';
import FunctionCatalog from './components/ui/FunctionCatalog.jsx';
import MidiStatus from './components/ui/MidiStatus.jsx';
import { exportMappingToJson, downloadTextFile } from './controller/exportMapping.js';
import { applyLearnedMidi } from './controller/flPresetCatalog.js';
import useWebMidi from './hooks/useWebMidi.js';
import { openDataFolder } from './platform/desktop.js';
import { countMappings, setMappingEntry } from './state/mappingStore.js';
import { MappingProvider, useMapping } from './state/MappingContext.jsx';

function Mapper() {
  const { mappings, setMappings, selectedMeshId, setSelectedMeshId, isDesktop } = useMapping();
  const { supported, connected, devices, error, connect, startLearning } = useWebMidi();
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

    const savedMidi = mappings[selectedMeshId]?.midi;
    if (savedMidi && savedMidi.type !== 'builtin') {
      learnedByMesh.current[selectedMeshId] = savedMidi;
    }

    const knownMidi = learnedByMesh.current[selectedMeshId] ?? null;
    setLearnedMidi(knownMidi);
    setListening(!knownMidi);

    if (knownMidi) return undefined;

    listenStop.current = startLearning((midi) => {
      learnedByMesh.current[selectedMeshId] = midi;
      setLearnedMidi(midi);
      setListening(false);
    });

    return () => listenStop.current?.();
  }, [selectedMeshId, connected, startLearning, mappings]);

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

  const handleExport = useCallback(() => {
    const json = exportMappingToJson(mappings);
    downloadTextFile(json, 'axiom-fl-mappings.json');
  }, [mappings]);

  const handleReconnect = useCallback(() => {
    connect().catch(() => {});
  }, [connect]);

  return (
    <div className="relative h-full w-full">
      <SketchfabViewer onControlClick={handleControlClick} pauseCamera={Boolean(selectedMeshId)} />

      <MidiStatus
        supported={supported}
        connected={connected}
        devices={devices}
        error={error}
        mappingCount={countMappings(mappings)}
        isDesktop={isDesktop}
        onReconnect={handleReconnect}
        onExport={handleExport}
        onOpenDataFolder={() => openDataFolder()}
      />

      <button
        type="button"
        onClick={() => setShowCatalog(true)}
        className="pointer-events-auto absolute right-4 top-4 z-30 rounded-full border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 backdrop-blur hover:bg-slate-800"
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
