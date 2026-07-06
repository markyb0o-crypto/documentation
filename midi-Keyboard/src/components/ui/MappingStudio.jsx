import { useCallback, useEffect, useRef, useState } from 'react';
import ControllerBoard from './ControllerBoard.jsx';
import FlTargetPicker from './FlTargetPicker.jsx';
import { downloadTextFile, exportMappingGuide, exportMappingToJson } from '../../controller/exportMapping.js';
import { applyLearnedMidi } from '../../controller/flPresetCatalog.js';
import useWebMidi from '../../hooks/useWebMidi.js';
import { SCAN_ORDER, getControlById } from '../../state/controllerLayout.js';
import { countMappings, removeMappingEntry, setMappingEntry } from '../../state/mappingStore.js';
import { useMapping } from '../../state/MappingContext.jsx';

/**
 * Ein Bildschirm: Controller links, FL-Ziel rechts, Auto-Scan oben.
 * Kein 3D, keine schwebenden Panels.
 */
export default function MappingStudio() {
  const { mappings, setMappings, selectedMeshId, setSelectedMeshId } = useMapping();
  const { supported, connected, connect, startLearning, error } = useWebMidi();

  const [scanActive, setScanActive] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [hardwareMidi, setHardwareMidi] = useState({});
  const scanCleanup = useRef(null);

  const selectedControl = selectedMeshId ? getControlById(selectedMeshId) : null;
  const currentAssignment = selectedMeshId ? mappings[selectedMeshId] : null;
  const scanTarget = scanActive ? SCAN_ORDER[scanIndex] : null;

  const stopScan = useCallback(() => {
    scanCleanup.current?.();
    scanCleanup.current = null;
    setScanActive(false);
    setScanIndex(0);
  }, []);

  const startScan = useCallback(async () => {
    try {
      if (!connected) await connect();
      setScanActive(true);
      setScanIndex(0);
      setSelectedMeshId(SCAN_ORDER[0]?.id ?? null);
    } catch {
      /* connect-Fehler wird von useWebMidi angezeigt */
    }
  }, [connected, connect, setSelectedMeshId]);

  useEffect(() => {
    if (!scanActive || !SCAN_ORDER[scanIndex]) return undefined;

    const target = SCAN_ORDER[scanIndex];
    setSelectedMeshId(target.id);

    scanCleanup.current?.();
    scanCleanup.current = startLearning((midi) => {
      setHardwareMidi((prev) => ({ ...prev, [target.id]: midi }));

      const next = scanIndex + 1;
      if (next >= SCAN_ORDER.length) {
        stopScan();
        return;
      }

      setScanIndex(next);
    });

    return () => scanCleanup.current?.();
  }, [scanActive, scanIndex, setSelectedMeshId, startLearning, stopScan]);

  const handlePickTarget = useCallback(
    (preset) => {
      if (!selectedMeshId) return;

      const midi = hardwareMidi[selectedMeshId];
      const assignment = midi ? applyLearnedMidi(preset, midi) : preset;

      setMappings((prev) => setMappingEntry(prev, selectedMeshId, assignment));
    },
    [selectedMeshId, hardwareMidi, setMappings],
  );

  const handleLearnOne = useCallback(() => {
    if (!selectedMeshId) return;
    startLearning((midi) => {
      setHardwareMidi((prev) => ({ ...prev, [selectedMeshId]: midi }));
    });
  }, [selectedMeshId, startLearning]);

  return (
    <div className="flex h-full flex-col bg-[#0a0c10]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-white">Axiom → FL Studio</h1>
          <p className="text-xs text-slate-400">Antippen. Ziel wählen. Fertig.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!connected ? (
            <button
              type="button"
              onClick={connect}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Keyboard verbinden
            </button>
          ) : (
            <span className="rounded-full bg-emerald-950 px-4 py-2 text-sm text-emerald-300">Verbunden</span>
          )}

          <button
            type="button"
            onClick={scanActive ? stopScan : startScan}
            disabled={!supported}
            className="rounded-full border border-amber-600 bg-amber-950/50 px-4 py-2 text-sm text-amber-200 disabled:opacity-40"
          >
            {scanActive ? 'Scan stoppen' : 'Auto-Scan'}
          </button>

          <button
            type="button"
            onClick={() => downloadTextFile(exportMappingToJson(mappings), 'mapping.json')}
            disabled={countMappings(mappings) === 0}
            className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
          >
            Export
          </button>
        </div>
      </header>

      {scanActive && scanTarget ? (
        <div className="bg-amber-950/40 px-4 py-2 text-center text-sm text-amber-200">
          Bewege jetzt: <strong>{scanTarget.label}</strong> ({scanIndex + 1}/{SCAN_ORDER.length})
        </div>
      ) : null}

      {error ? <p className="px-4 py-2 text-sm text-red-400">{error}</p> : null}

      <main className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">Dein Controller</h2>
            {selectedMeshId && connected ? (
              <button
                type="button"
                onClick={handleLearnOne}
                className="text-xs text-emerald-400 underline"
              >
                Nur dieses Element lernen
              </button>
            ) : null}
          </div>
          <ControllerBoard
            selectedId={selectedMeshId}
            mappings={mappings}
            scanTargetId={scanTarget?.id}
            onSelect={setSelectedMeshId}
          />
          {selectedMeshId && currentAssignment ? (
            <button
              type="button"
              onClick={() => setMappings((p) => removeMappingEntry(p, selectedMeshId))}
              className="text-xs text-slate-500 underline"
            >
              Zuweisung entfernen
            </button>
          ) : null}
        </section>

        <section className="min-h-0">
          <FlTargetPicker
            selectedControlLabel={selectedControl?.label}
            currentAssignment={currentAssignment}
            onPick={handlePickTarget}
          />
        </section>
      </main>
    </div>
  );
}
