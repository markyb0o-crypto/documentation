import { SKETCHFAB_MODEL } from '../../config/sketchfabModel.js';

export default function ModelCredits() {
  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-20 max-w-xs rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2.5 text-xs leading-relaxed text-slate-300 shadow-lg backdrop-blur">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        3D-Modell · Credits
      </p>
      <p>
        <a
          href={SKETCHFAB_MODEL.url}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-sky-400 hover:text-sky-300"
        >
          {SKETCHFAB_MODEL.title}
        </a>
        {' by '}
        <a
          href={SKETCHFAB_MODEL.authorUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-sky-400 hover:text-sky-300"
        >
          {SKETCHFAB_MODEL.author}
        </a>
        {' on '}
        <a
          href={SKETCHFAB_MODEL.sketchfabUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-sky-400 hover:text-sky-300"
        >
          Sketchfab
        </a>
      </p>
      <p className="mt-1.5 text-[10px] text-slate-500">
        Lizenz:{' '}
        <a
          href={SKETCHFAB_MODEL.licenseUrl}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 underline hover:text-slate-300"
        >
          {SKETCHFAB_MODEL.license}
        </a>
        {' · Ersteller muss genannt werden'}
      </p>
    </div>
  );
}
