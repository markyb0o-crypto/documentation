import { useState } from 'react';
import { ASSIGNABLE_PRESETS, PRESET_CATEGORIES } from '../../controller/flPresetCatalog.js';
import { formatMeshLabel } from '../../state/meshLabels.js';

function PresetCard({ preset, selected, onSelect, onAssign }) {
  return (
    <button
      type="button"
      onClick={() => onAssign(preset)}
      onMouseEnter={() => onSelect(preset)}
      onFocus={() => onSelect(preset)}
      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
        selected ? 'bg-emerald-600/20 ring-1 ring-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
      }`}
    >
      <span className="block text-sm font-medium text-slate-100">{preset.label}</span>
      <span className="mt-0.5 block text-xs text-slate-400 line-clamp-2">{preset.description}</span>
    </button>
  );
}

export default function AssignPanel({
  meshId,
  learnedMidi,
  isListening,
  currentAssignment,
  onAssign,
  onClose,
}) {
  const [activeCategory, setActiveCategory] = useState('Mixer');
  const [preview, setPreview] = useState(null);

  if (!meshId) return null;

  const categories = PRESET_CATEGORIES.filter((c) => c !== 'Tastatur');
  const items = ASSIGNABLE_PRESETS.filter((p) => p.category === activeCategory);
  const detail = preview ?? items[0] ?? null;

  return (
    <aside className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20 flex max-h-[50vh] flex-col rounded-t-2xl border-t border-slate-700 bg-slate-900/98 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-white">{formatMeshLabel(meshId)}</h2>
          <p className="text-xs text-slate-400">
            {isListening ? 'Regler einmal bewegen…' : learnedMidi ? '✓ MIDI erkannt' : 'Ziel wählen'}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-slate-400 hover:bg-slate-800">
          ✕
        </button>
      </div>

      {detail ? (
        <div className="border-b border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-300">{detail.label}</p>
          <p className="mt-1 text-sm text-slate-300">{detail.description}</p>
          <p className="mt-1 text-xs text-slate-500">In FL: {detail.flLocation}</p>
        </div>
      ) : null}

      <div className="flex gap-1 overflow-x-auto px-4 py-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              activeCategory === cat ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto px-4 pb-4 sm:grid-cols-2">
        {items.map((preset) => (
          <PresetCard
            key={preset.presetId}
            preset={preset}
            selected={currentAssignment?.presetId === preset.presetId || preview?.presetId === preset.presetId}
            onSelect={setPreview}
            onAssign={onAssign}
          />
        ))}
      </div>
    </aside>
  );
}
