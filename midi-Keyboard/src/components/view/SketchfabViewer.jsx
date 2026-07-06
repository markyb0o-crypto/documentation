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
      error() {},
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sketchfab-embed-wrapper relative h-full w-full bg-[#0a0c10]">
      <iframe
        ref={iframeRef}
        title={SKETCHFAB_MODEL.title}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      <p className="pointer-events-auto absolute bottom-2 left-2 m-0 text-[11px] text-slate-500">
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
    </div>
  );
}
