import { useMemo, useState } from 'react';
import { PRESET_CATEGORIES, getPresetsByCategory } from '../../controller/flPresetCatalog.js';
import { formatMidiLabel } from '../../state/mappingStore.js';

export default function MappingMenu({
  meshId,
  currentAssignment,
  connected,
  isLearning,
  onAssign,
  onLearn,
  onClear,
  onClose,
}) {
  const [activeCategory, setActiveCategory] = useState('Mixer');

  const presets = useMemo(
    () => getPresetsByCategory(activeCategory),
    [activeCategory],
  );

  if (!meshId) return null;

  const handlePresetClick = (preset) => {
    if (preset.isBuiltIn) {
      onAssign(preset);
      return;
    }
    onAssign(preset);
  };

  return (
    <aside className="pointer-events-auto absolute right-4 top-4 z-10 flex max-h-[calc(100vh-2rem)] w-96 flex-col rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur">
      <div className="border-b border-slate-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Was soll das steuern?</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            Schließen
          </button>
        </div>

        <p className="mb-2 break-all text-xs text-slate-400">
          Bauteil: <span className="font-mono text-slate-300">{meshId}</span>
        </p>

        {currentAssignment ? (
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-3 py-2">
            <p className="text-xs text-emerald-400">Zugewiesen</p>
            <p className="text-sm font-medium text-emerald-100">{currentAssignment.label}</p>
            <p className="text-xs text-slate-400">{formatMidiLabel(currentAssignment.midi)}</p>
            {currentAssignment.isBuiltIn ? (
              <p className="mt-1 text-xs text-slate-500">
                Funktioniert bereits im Generic-Modus – keine Extra-Einstellung nötig.
              </p>
            ) : null}
            <button
              type="button"
              onClick={onClear}
              className="mt-2 text-xs text-slate-400 underline hover:text-slate-200"
            >
              Zuweisung entfernen
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Noch nichts zugewiesen.</p>
        )}
      </div>

      {!connected ? (
        <div className="border-b border-slate-800 p-4 text-xs text-amber-300">
          Tipp: Verbinde links dein Keyboard, um den Lernmodus zu nutzen.
        </div>
      ) : (
        <div className="border-b border-slate-800 p-4">
          <button
            type="button"
            onClick={onLearn}
            disabled={isLearning}
            className="w-full rounded-lg border border-emerald-700 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-900/50 disabled:opacity-60"
          >
            {isLearning ? 'Warte auf Signal… Bewege den Regler!' : 'MIDI lernen (Regler am Axiom bewegen)'}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Danach wählst du unten, wofür es in FL sein soll.
          </p>
        </div>
      )}

      <div className="border-b border-slate-800 p-2">
        <div className="flex flex-wrap gap-1">
          {PRESET_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-md px-2 py-1 text-xs ${
                activeCategory === category
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-1 overflow-y-auto p-2">
        {activeCategory === 'Eigenes MIDI' ? (
          <li className="px-2 py-4 text-xs text-slate-500">
            Nutze „MIDI lernen", um ein freies Signal zu erfassen. Danach kannst du es jedem
            FL-Regler zuweisen.
          </li>
        ) : (
          presets.map((preset) => (
            <li key={preset.presetId}>
              <button
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                  currentAssignment?.presetId === preset.presetId
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span className="block text-sm">{preset.label}</span>
                <span className="block text-xs opacity-70">
                  {preset.isBuiltIn ? 'Generic – schon aktiv' : formatMidiLabel(preset.midi)}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
