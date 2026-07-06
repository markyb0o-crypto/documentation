const FL_STUDIO_ACTIONS = [
  { id: 'volume', label: 'Volume' },
  { id: 'pan', label: 'Pan' },
  { id: 'mute', label: 'Mute' },
  { id: 'solo', label: 'Solo' },
  { id: 'play', label: 'Play/Pause' },
  { id: 'record', label: 'Record' },
  { id: 'plugin-param', label: 'Plugin-Parameter' },
];

export default function MappingMenu({ meshId, currentAction, onSelect, onClose }) {
  if (!meshId) return null;

  return (
    <aside className="pointer-events-auto absolute right-4 top-4 z-10 w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">FL Studio Mapping</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          Schließen
        </button>
      </div>

      <p className="mb-3 break-all text-xs text-slate-400">
        Bauteil: <span className="font-mono text-slate-300">{meshId}</span>
      </p>

      <ul className="space-y-1">
        {FL_STUDIO_ACTIONS.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => onSelect(action)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                currentAction?.id === action.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
