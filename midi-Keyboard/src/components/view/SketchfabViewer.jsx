import { useEffect, useRef } from 'react';
import { SKETCHFAB_MODEL } from '../../config/sketchfabModel.js';

export default function SketchfabViewer({ onControlClick }) {
  const iframeRef = useRef(null);
  const onClickRef = useRef(onControlClick);

  onClickRef.current = onControlClick;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !window.Sketchfab) return undefined;

    let cancelled = false;
    const client = new window.Sketchfab('1.12.1', iframe);

    client.init(SKETCHFAB_MODEL.uid, {
      autostart: 1,
      preload: 1,
      ui_controls: 1,
      ui_infos: 0,
      ui_watermark: 0,
      success(api) {
        if (cancelled) return;
        api.start();
        api.addEventListener('viewerready', () => {
          api.addEventListener(
            'click',
            (info) => {
              if (!info.instanceID) return;
              api.getNodeMap((err, nodes) => {
                if (err) return;
                const node = Object.values(nodes).find((n) => n.instanceID === info.instanceID);
                const meshId = node?.name?.trim() || `teil_${info.instanceID}`;
                onClickRef.current(meshId);
              });
            },
            { pick: 'slow' },
          );
        });
      },
      error() {
        /* Fallback bleibt über lokalen Platzhalter möglich */
      },
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-[#0a0c10]">
      <iframe
        ref={iframeRef}
        title="M-Audio Axiom Pro 25"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
      />
      <a
        href={SKETCHFAB_MODEL.url}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200"
      >
        3D: {SKETCHFAB_MODEL.author} / Sketchfab (CC BY)
      </a>
    </div>
  );
}
