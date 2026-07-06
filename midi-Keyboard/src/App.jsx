import { useCallback, useRef, useState } from 'react';
import Canvas3D from './components/view/Canvas3D.jsx';
import FlStepsPanel from './components/ui/FlStepsPanel.jsx';
import MappingMenu from './components/ui/MappingMenu.jsx';
import SetupGuide from './components/ui/SetupGuide.jsx';
import { downloadTextFile, exportMappingGuide, exportMappingToJson } from './controller/exportMapping.js';
import { applyLearnedMidi, createCustomAssignment } from './controller/flPresetCatalog.js';
import useWebMidi from './hooks/useWebMidi.js';
import { countMappings, removeMappingEntry, setMappingEntry } from './state/mappingStore.js';
import { MappingProvider, useMapping } from './state/MappingContext.jsx';

function AppContent() {
  const { mappings, setMappings, selectedMeshId, setSelectedMeshId } = useMapping();
  const { supported, connected, devices, error, isLearning, connect, startLearning } = useWebMidi();
  const [learnedMidi, setLearnedMidi] = useState(null);
  const learnCleanupRef = useRef(null);

  const currentAssignment = selectedMeshId ? mappings[selectedMeshId] : null;

  const handleControlClick = useCallback(
    (meshId) => {
      setSelectedMeshId(meshId);
      setLearnedMidi(null);
    },
    [setSelectedMeshId],
  );

  const handleAssign = useCallback(
    (assignment) => {
      if (!selectedMeshId) return;

      let finalAssignment = assignment;

      if (learnedMidi) {
        finalAssignment =
          assignment.category === 'Eigenes MIDI'
            ? createCustomAssignment(learnedMidi)
            : applyLearnedMidi(assignment, learnedMidi);
      }

      setMappings((prev) => setMappingEntry(prev, selectedMeshId, finalAssignment));
      setLearnedMidi(null);
    },
    [selectedMeshId, setMappings, learnedMidi],
  );

  const handleLearn = useCallback(() => {
    learnCleanupRef.current?.();
    learnCleanupRef.current = startLearning((midi) => {
      setLearnedMidi(midi);
    });
  }, [startLearning]);

  const handleClear = useCallback(() => {
    if (!selectedMeshId) return;
    setMappings((prev) => removeMappingEntry(prev, selectedMeshId));
    setLearnedMidi(null);
  }, [selectedMeshId, setMappings]);

  const handleExport = useCallback(() => {
    downloadTextFile(exportMappingToJson(mappings), 'axiom-fl-mapping.json');
    downloadTextFile(exportMappingGuide(mappings), 'axiom-fl-anleitung.txt');
  }, [mappings]);

  return (
    <div className="relative h-full w-full">
      <Canvas3D
        onControlClick={handleControlClick}
        highlightedMeshId={selectedMeshId}
      />

      <header className="pointer-events-none absolute left-4 top-4 z-10">
        <h1 className="text-lg font-semibold text-slate-100">MIDI Keyboard Mapper</h1>
        <p className="text-xs text-slate-400">Einfach FL Studio Regler zuweisen – ohne Vorkenntnisse</p>
      </header>

      <SetupGuide
        connected={connected}
        deviceCount={devices.length}
        mappingCount={countMappings(mappings)}
        onConnect={connect}
      />

      <MappingMenu
        meshId={selectedMeshId}
        currentAssignment={currentAssignment}
        connected={connected}
        isLearning={isLearning}
        onAssign={handleAssign}
        onLearn={handleLearn}
        onClear={handleClear}
        onClose={() => setSelectedMeshId(null)}
      />

      <FlStepsPanel assignment={currentAssignment} />

      <div className="pointer-events-auto absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        {learnedMidi ? (
          <p className="rounded-lg bg-emerald-950/80 px-3 py-1 text-xs text-emerald-300">
            Gelernt: {learnedMidi.type === 'cc' ? `CC ${learnedMidi.number}` : `Note ${learnedMidi.number}`}
            {' – '}wähle jetzt das FL-Ziel
          </p>
        ) : null}

        {error ? (
          <p className="max-w-xs rounded-lg bg-red-950/80 px-3 py-1 text-xs text-red-300">{error}</p>
        ) : null}

        {!supported ? (
          <p className="max-w-xs rounded-lg bg-amber-950/80 px-3 py-1 text-xs text-amber-300">
            Web MIDI nicht verfügbar – nutze Chrome oder Edge für den Lernmodus.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleExport}
          disabled={countMappings(mappings) === 0}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40"
        >
          Mapping exportieren
        </button>
      </div>
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
