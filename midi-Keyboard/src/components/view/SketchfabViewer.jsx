import { useEffect, useRef } from 'react';
import { applyCinematicScene, focusControlShot, startCameraSlides } from '../../controller/sketchfabCinematic.js';
import { SKETCHFAB_MODEL } from '../../config/sketchfabModel.js';
import ModelCredits from '../ui/ModelCredits.jsx';

export default function SketchfabViewer({ onControlClick, pauseCamera = false }) {
  const iframeRef = useRef(null);
  const onClickRef = useRef(onControlClick);
  const pauseRef = useRef(pauseCamera);
  const apiRef = useRef(null);
  const stopSlidesRef = useRef(null);

  onClickRef.current = onControlClick;
  pauseRef.current = pauseCamera;

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
      ui_watermark: 1,
      success(api) {
        if (cancelled) return;
        apiRef.current = api;
        api.start();

        api.addEventListener('viewerready', () => {
          applyCinematicScene(api);
          stopSlidesRef.current = startCameraSlides(api, pauseRef);

          api.addEventListener(
            'click',
            (info) => {
              if (!info.instanceID) return;
              api.getNodeMap((err, nodes) => {
                if (err) return;
                const node = Object.values(nodes).find((n) => n.instanceID === info.instanceID);
                const meshId = node?.name?.trim() || `teil_${info.instanceID}`;
                focusControlShot(api);
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
      stopSlidesRef.current?.();
      apiRef.current = null;
    };
  }, []);

  return (
    <div className="sketchfab-embed-wrapper relative h-full w-full overflow-hidden bg-[#0a0c10]">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      <iframe
        ref={iframeRef}
        title={SKETCHFAB_MODEL.title}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      <ModelCredits />
    </div>
  );
}
