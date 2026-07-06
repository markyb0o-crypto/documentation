import { CONTROLS, getControlById } from '../../state/controllerLayout.js';

export default function ControllerBoard({ selectedId, mappings, scanTargetId, onSelect }) {
  return (
    <div className="relative aspect-[2.1/1] w-full overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-inner">
      <div className="absolute inset-x-0 top-[62%] mx-[4%] h-[18%] rounded-sm bg-slate-700/80" aria-hidden />

      {CONTROLS.map((control) => {
        const mapped = mappings[control.id];
        const isSelected = selectedId === control.id;
        const isScanTarget = scanTargetId === control.id;

        return (
          <button
            key={control.id}
            type="button"
            onClick={() => onSelect(control.id)}
            title={control.label}
            className={`absolute rounded-md border transition-all ${
              isScanTarget
                ? 'z-10 animate-pulse border-amber-400 bg-amber-500/40 ring-2 ring-amber-400'
                : isSelected
                  ? 'z-10 border-emerald-400 bg-emerald-500/30 ring-2 ring-emerald-400'
                  : mapped
                    ? 'border-emerald-700/80 bg-emerald-900/50 hover:bg-emerald-800/60'
                    : 'border-slate-600 bg-slate-700/60 hover:border-slate-500 hover:bg-slate-600/70'
            }`}
            style={{
              left: `${control.x}%`,
              top: `${control.y}%`,
              width: `${control.w}%`,
              height: `${control.h}%`,
            }}
          >
            <span className="sr-only">{control.label}</span>
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex justify-between text-[10px] text-slate-500">
        <span>M-Audio Axiom Pro 25</span>
        <span>Grün = zugewiesen</span>
      </div>

      {selectedId && mappings[selectedId] ? (
        <div className="pointer-events-none absolute left-3 top-2 rounded-lg bg-black/50 px-2 py-1 text-xs text-emerald-300">
          {getControlById(selectedId)?.label}: {mappings[selectedId].label}
        </div>
      ) : null}
    </div>
  );
}
