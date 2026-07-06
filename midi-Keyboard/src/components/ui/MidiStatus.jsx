export default function MidiStatus({
  supported,
  connected,
  devices,
  error,
  mappingCount,
  isDesktop,
  onReconnect,
  onExport,
  onOpenDataFolder,
}) {
  const deviceLabel = devices[0] ?? null;
  const count = mappingCount ?? 0;

  let statusDot = 'bg-amber-400';
  let statusText = 'Keyboard verbinden…';

  if (!supported) {
    statusDot = 'bg-red-500';
    statusText = 'Web MIDI nicht verfügbar – Chrome oder Edge nutzen';
  } else if (error) {
    statusDot = 'bg-red-500';
    statusText = error;
  } else if (connected && deviceLabel) {
    statusDot = 'bg-emerald-400';
    statusText = deviceLabel;
  } else if (connected) {
    statusDot = 'bg-amber-400';
    statusText = 'Axiom per USB anschließen';
  }

  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-30 flex max-w-[min(100%-2rem,28rem)] flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 backdrop-blur">
        <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot}`} aria-hidden />
        <span className="min-w-0 truncate">{statusText}</span>
        {supported && !connected ? (
          <button
            type="button"
            onClick={onReconnect}
            className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-slate-200 hover:bg-slate-600"
          >
            Verbinden
          </button>
        ) : null}
        {error ? (
          <button
            type="button"
            onClick={onReconnect}
            className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-slate-200 hover:bg-slate-600"
          >
            Erneut
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-[11px] text-slate-400">
          {count === 1 ? '1 Zuweisung' : `${count} Zuweisungen`}
        </span>
        {count > 0 ? (
          <button
            type="button"
            onClick={onExport}
            className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
          >
            Export
          </button>
        ) : null}
        {isDesktop ? (
          <button
            type="button"
            onClick={onOpenDataFolder}
            className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
          >
            Datenordner
          </button>
        ) : null}
      </div>
    </div>
  );
}
