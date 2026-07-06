import { FL_PRESET_CATALOG, PRESET_CATEGORIES } from '../../controller/flPresetCatalog.js';

export default function FunctionCatalog({ open, onClose }) {
  if (!open) return null;

  return (
    <aside className="pointer-events-auto absolute right-0 top-0 z-30 flex h-full w-full max-w-md flex-col border-l border-slate-700 bg-slate-900/98 shadow-2xl backdrop-blur sm:w-96">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Steuerbare Funktionen</h2>
          <p className="text-xs text-slate-400">Was du mit dem Axiom in FL machen kannst</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-slate-400 hover:bg-slate-800">
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {PRESET_CATEGORIES.map((category) => {
          const items = FL_PRESET_CATALOG.filter((p) => p.category === category);
          return (
            <section key={category}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">{category}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.presetId} className="rounded-xl bg-slate-800/80 p-3">
                    <p className="font-medium text-slate-100">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                    <p className="mt-2 text-xs text-slate-500">In FL: {item.flLocation}</p>
                    {item.isBuiltIn ? (
                      <span className="mt-2 inline-block rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                        Bereits aktiv (Generic)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
