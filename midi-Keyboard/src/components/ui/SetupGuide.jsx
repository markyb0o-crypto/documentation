import { countMappings } from '../../state/mappingStore.js';

export default function SetupGuide({ connected, deviceCount, mappingCount, onConnect }) {
  return (
    <aside className="pointer-events-auto absolute left-4 top-20 z-10 w-80 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <h2 className="mb-2 text-sm font-semibold text-slate-100">So funktioniert&apos;s</h2>
      <p className="mb-4 text-xs leading-relaxed text-slate-400">
        Du musst FL Studio nicht programmieren. Dieses Tool hilft dir, jedes Bedienelement
        am Axiom mit einem Regler in FL zu verbinden – genau wie bei Klavier und Oktave,
        nur für Fader, Knöpfe und Pads.
      </p>

      <ol className="mb-4 space-y-2 text-xs text-slate-300">
        <li className="flex gap-2">
          <span className="font-bold text-emerald-400">1.</span>
          <span>Axiom per USB anschließen und hier verbinden.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-emerald-400">2.</span>
          <span>Bauteil im 3D-Modell anklicken (Fader, Knopf, Pad).</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-emerald-400">3.</span>
          <span>Ziel wählen (z.B. „Track 1 – Lautstärke") oder MIDI lernen.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-emerald-400">4.</span>
          <span>In FL: Rechtsklick → „Link to controller" → Regler bewegen → Accept.</span>
        </li>
      </ol>

      {!connected ? (
        <button
          type="button"
          onClick={onConnect}
          className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Keyboard verbinden
        </button>
      ) : (
        <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
          Verbunden ({deviceCount} Eingang{deviceCount === 1 ? '' : 'änge'})
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Zuweisungen gespeichert: {mappingCount}
      </p>
    </aside>
  );
}
