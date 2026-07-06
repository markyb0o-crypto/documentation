import { countMappings } from '../../state/mappingStore.js';

export default function SetupGuide({ connected, deviceCount, mappingCount, onConnect, usingPlaceholder }) {
  return (
    <aside className="pointer-events-auto absolute left-4 top-20 z-10 w-80 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <h2 className="mb-2 text-sm font-semibold text-slate-100">In 4 Klicks fertig</h2>

      {usingPlaceholder ? (
        <p className="mb-3 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
          Vereinfachtes Keyboard aktiv – du kannst sofort loslegen. Dein echtes 3D-Modell wird
          automatisch geladen, sobald die Datei im Projekt liegt.
        </p>
      ) : null}

      <ol className="mb-4 space-y-2 text-xs text-slate-300">
        <li><span className="text-emerald-400">1.</span> Bauteil anklicken</li>
        <li><span className="text-emerald-400">2.</span> Ziel wählen (z.B. Track-Lautstärke)</li>
        <li><span className="text-emerald-400">3.</span> Am PC: Axiom verbinden → MIDI lernen</li>
        <li><span className="text-emerald-400">4.</span> In FL: Rechtsklick → Link to controller</li>
      </ol>

      {!connected ? (
        <button
          type="button"
          onClick={onConnect}
          className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Keyboard verbinden (am PC)
        </button>
      ) : (
        <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
          Verbunden ({deviceCount} Eingang{deviceCount === 1 ? '' : 'änge'})
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Gespeichert: {mappingCount} · bleibt im Browser gespeichert
      </p>
    </aside>
  );
}
