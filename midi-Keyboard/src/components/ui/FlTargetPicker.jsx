import { FL_PRESET_CATALOG } from '../../controller/flPresetCatalog.js';

const QUICK_TARGETS = FL_PRESET_CATALOG.filter(
  (preset) => !preset.isBuiltIn && ['Mixer', 'Transport', 'Pads'].includes(preset.category),
);

export default function FlTargetPicker({ selectedControlLabel, currentAssignment, onPick }) {
  const groups = ['Mixer', 'Transport', 'Pads', 'Effekte'];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h2 className="mb-1 text-base font-semibold text-white">FL Studio Ziel</h2>
      <p className="mb-4 text-sm text-slate-400">
        {selectedControlLabel
          ? `Wofür soll „${selectedControlLabel}" sein?`
          : 'Links ein Bedienelement wählen'}
      </p>

      {currentAssignment ? (
        <div className="mb-4 rounded-xl border border-emerald-800 bg-emerald-950/50 px-3 py-2">
          <p className="text-xs text-emerald-400">Aktiv</p>
          <p className="font-medium text-emerald-100">{currentAssignment.label}</p>
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {groups.map((group) => {
          const items = QUICK_TARGETS.filter((p) => p.category === group);
          if (!items.length) return null;

          return (
            <section key={group}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{group}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((preset) => (
                  <button
                    key={preset.presetId}
                    type="button"
                    disabled={!selectedControlLabel}
                    onClick={() => onPick(preset)}
                    className={`rounded-xl px-3 py-3 text-left transition ${
                      currentAssignment?.presetId === preset.presetId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40'
                    }`}
                  >
                    <span className="block text-sm font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
        In FL: Rechtsklick auf Regler → Link to controller → Bedienelement bewegen → Accept
      </p>
    </div>
  );
}
