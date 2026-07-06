import { formatMidiLabel } from '../../state/mappingStore.js';

export default function FlStepsPanel({ assignment }) {
  if (!assignment || assignment.isBuiltIn) return null;

  return (
    <section className="pointer-events-auto absolute bottom-4 left-4 z-10 w-96 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <h3 className="mb-1 text-sm font-semibold text-slate-100">Nächster Schritt in FL Studio</h3>
      <p className="mb-3 text-xs text-slate-400">
        MIDI: <span className="font-mono text-slate-300">{formatMidiLabel(assignment.midi)}</span>
      </p>
      <ol className="space-y-1.5">
        {assignment.flSteps.map((step, index) => (
          <li key={step} className="flex gap-2 text-xs text-slate-300">
            <span className="font-bold text-emerald-400">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
