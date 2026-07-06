import { FL_PRESET_CATALOG } from '../../controller/flPresetCatalog.js';
import { formatMeshLabel } from '../../state/meshLabels.js';

const TARGETS = FL_PRESET_CATALOG.filter((p) => !p.isBuiltIn);

export default function AssignPanel({ meshId, learnedMidi, isListening, currentAssignment, onAssign, onClose }) {
  if (!meshId) return null;

  return (
    <aside className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20 max-h-[45vh] overflow-y-auto rounded-t-2xl border-t border-slate-700 bg-slate-900/95 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">{formatMeshLabel(meshId)}</h2>
          <p className="text-xs text-slate-400">
            {isListening ? 'Regler einmal bewegen…' : learnedMidi ? '✓ Erkannt' : currentAssignment ? 'Zugewiesen' : ''}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-sm text-slate-400 hover:bg-slate-800">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {TARGETS.map((preset) => (
          <button
            key={preset.presetId}
            type="button"
            onClick={() => onAssign(preset)}
            className={`rounded-xl px-3 py-3 text-left text-sm transition ${
              currentAssignment?.presetId === preset.presetId
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
