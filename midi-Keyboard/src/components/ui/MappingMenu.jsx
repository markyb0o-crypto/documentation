import { useEffect, useState } from 'react';
import { fetchFlParameters } from '../../controller/flParameterCatalog.js';

export default function MappingMenu({ meshId, currentParameter, onAssign, onClear, onClose }) {
  const [parameters, setParameters] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFlParameters().then(setParameters);
  }, []);

  if (!meshId) return null;

  const filtered = parameters.filter((param) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      param.label.toLowerCase().includes(query) ||
      param.category.toLowerCase().includes(query) ||
      param.path.join(' ').toLowerCase().includes(query)
    );
  });

  return (
    <aside className="pointer-events-auto absolute right-4 top-4 z-10 flex w-80 flex-col rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur">
      <div className="border-b border-slate-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">FL-Parameter zuweisen</h2>
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

        {currentParameter ? (
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-3 py-2">
            <p className="text-xs text-emerald-400">Aktuell zugewiesen</p>
            <p className="text-sm font-medium text-emerald-100">{currentParameter.label}</p>
            <p className="text-xs text-slate-400">{currentParameter.path.join(' › ')}</p>
            <button
              type="button"
              onClick={onClear}
              className="mt-2 text-xs text-slate-400 underline hover:text-slate-200"
            >
              Zuweisung entfernen
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Noch kein FL-Parameter zugewiesen.</p>
        )}
      </div>

      <div className="border-b border-slate-800 p-4">
        <label className="mb-1 block text-xs text-slate-400" htmlFor="fl-param-search">
          Parameter suchen
        </label>
        <input
          id="fl-param-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="z.B. Volume, Track 1, Play…"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <ul className="max-h-64 space-y-1 overflow-y-auto p-2">
        {filtered.map((parameter) => (
          <li key={parameter.parameterId}>
            <button
              type="button"
              onClick={() => onAssign(parameter)}
              className={`w-full rounded-lg px-3 py-2 text-left transition ${
                currentParameter?.parameterId === parameter.parameterId
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <span className="block text-sm">{parameter.label}</span>
              <span className="block text-xs opacity-70">{parameter.path.join(' › ')}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
