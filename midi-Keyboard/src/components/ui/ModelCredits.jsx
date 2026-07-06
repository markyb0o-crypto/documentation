import { SKETCHFAB_MODEL } from '../../config/sketchfabModel.js';

export default function ModelCredits({ raised = false }) {
  return (
    <p
      className={`pointer-events-auto absolute right-4 z-40 m-0 text-[10px] text-slate-500 transition-[bottom] ${
        raised ? 'bottom-[52vh]' : 'bottom-3'
      }`}
    >
      Erstellt von{' '}
      <a
        href={SKETCHFAB_MODEL.authorUrl}
        target="_blank"
        rel="noreferrer"
        className="text-slate-400 hover:text-sky-400"
      >
        {SKETCHFAB_MODEL.author}
      </a>
      {' · '}
      <a
        href={SKETCHFAB_MODEL.url}
        target="_blank"
        rel="noreferrer"
        className="text-slate-400 hover:text-sky-400"
      >
        Sketchfab
      </a>
    </p>
  );
}
