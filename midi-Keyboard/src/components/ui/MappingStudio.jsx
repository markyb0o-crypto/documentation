import { useCallback, useEffect, useRef, useState } from 'react';
import ControllerBoard from './ControllerBoard.jsx';
import FlTargetPicker from './FlTargetPicker.jsx';
import { exportMappingGuide, exportMappingToJson } from '../../controller/exportMapping.js';
import { applyLearnedMidi } from '../../controller/flPresetCatalog.js';
import useWebMidi from '../../hooks/useWebMidi.js';
import { copyText, openDataFolder, saveGuideToDisk } from '../../platform/desktop.js';
import { SCAN_ORDER, getControlById } from '../../state/controllerLayout.js';
import { countMappings, removeMappingEntry, setMappingEntry } from '../../state/mappingStore.js';
import { useMapping } from '../../state/MappingContext.jsx';

export default function MappingStudio() {
  const { mappings, setMappings, selectedMeshId, setSelectedMeshId, isDesktop } = useMapping();
  const { supported, connected, connect, startLearning, error } = useWebMidi();

  const [scanActive, setScanActive] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [hardwareMidi, setHardwareMidi] = useState({});
  const [toast, setToast] = useState('');
  const scanCleanup = useRef(null);
  const autoConnected = useRef(false);

  const selectedControl = selectedMeshId ? getControlById(selectedMeshId) : null;
  const currentAssignment = selectedMeshId ? mappings[selectedMeshId] : null;
  const scanTarget = scanActive ? SCAN_ORDER[scanIndex] : null;

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }, []);

  useEffect(() => {
    if (!isDesktop || autoConnected.current || !supported) return;
    autoConnected.current = true;
    connect().catch(() => {});
  }, [isDesktop, supported, connect]);

  const stopScan = useCallback(() => {
    scanCleanup.current?.();
    scanCleanup.current = null;
    setScanActive(false);
    setScanIndex(0);
    showToast('Scan beendet');
  }, [showToast]);

  const startScan = useCallback(async () => {
    try {
      if (!connected) await connect();
      setScanActive(true);
      setScanIndex(0);
      setSelectedMeshId(SCAN_ORDER[0]?.id ?? null);
      showToast('Auto-Scan gestartet – Regler der Reihe nach bewegen');
    } catch {
      showToast('Keyboard nicht verbunden');
    }
  }, [connected, connect, setSelectedMeshId, showToast]);

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
        showToast('Alle Regler gescannt!');
        return;
      }

      setScanIndex(next);
    });

    return () => scanCleanup.current?.();
  }, [scanActive, scanIndex, setSelectedMeshId, startLearning, stopScan, showToast]);

  const handlePickTarget = useCallback(
    (preset) => {
      if (!selectedMeshId) return;

      const midi = hardwareMidi[selectedMeshId];
      const assignment = midi ? applyLearnedMidi(preset, midi) : preset;

      setMappings((prev) => setMappingEntry(prev, selectedMeshId, assignment));
      showToast(`„${assignment.label}" zugewiesen`);
    },
    [selectedMeshId, hardwareMidi, setMappings, showToast],
  );

  const handleLearnOne = useCallback(() => {
    if (!selectedMeshId) return;
    startLearning((midi) => {
      setHardwareMidi((prev) => ({ ...prev, [selectedMeshId]: midi }));
      showToast('MIDI-Signal gelernt');
    });
  }, [selectedMeshId, startLearning, showToast]);

  const handleCopyGuide = useCallback(async () => {
    const guide = exportMappingGuide(mappings);
    await copyText(guide);
    await saveGuideToDisk(guide);
    showToast(isDesktop ? 'Anleitung kopiert & gespeichert' : 'Anleitung kopiert');
  }, [mappings, showToast, isDesktop]);

  const handleExport = useCallback(async () => {
    const json = exportMappingToJson(mappings);
    await copyText(json);
    await saveGuideToDisk(exportMappingGuide(mappings));
    showToast('Export kopiert');
  }, [mappings, showToast]);

  return (
    <div className="relative flex h-full flex-col bg-[#0a0c10]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <h1 className="text-xl font-bold text-white">Axiom FL Mapper</h1>
          <p className="text-xs text-slate-400">
            {isDesktop ? 'Desktop · speichert automatisch' : 'Browser · lokal gespeichert'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!connected ? (
            <button type="button" onClick={connect} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
              Keyboard verbinden
            </button>
          ) : (
            <span className="rounded-full bg-emerald-950 px-4 py-2 text-sm text-emerald-300">● Verbunden</span>
          )}

          <button
            type="button"
            onClick={scanActive ? stopScan : startScan}
            disabled={!supported}
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {scanActive ? 'Stop' : 'Auto-Scan'}
          </button>

          <button
            type="button"
            onClick={handleCopyGuide}
            disabled={countMappings(mappings) === 0}
            className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
          >
            FL-Anleitung
          </button>

          {isDesktop ? (
            <button
              type="button"
              onClick={openDataFolder}
              className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200"
            >
              Datenordner
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExport}
              disabled={countMappings(mappings) === 0}
              className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
            >
              Export
            </button>
          )}
        </div>
      </header>

      {scanActive && scanTarget ? (
        <div className="bg-amber-500 px-4 py-3 text-center text-base font-medium text-black">
          ▶ Bewege: {scanTarget.label} ({scanIndex + 1}/{SCAN_ORDER.length})
        </div>
      ) : null}

      {error ? <p className="bg-red-950 px-4 py-2 text-sm text-red-300">{error}</p> : null}

      <main className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">Controller</h2>
            {selectedMeshId && connected ? (
              <button type="button" onClick={handleLearnOne} className="text-xs text-emerald-400 underline">
                MIDI lernen
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
              Zuweisung löschen
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

      {toast ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
