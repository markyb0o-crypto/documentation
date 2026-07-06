import { Suspense, useEffect, useState } from 'react';
import AxiomGltfModel from './AxiomGltfModel.jsx';
import AxiomPlaceholder from './AxiomPlaceholder.jsx';

const MODEL_PATH = '/models/m-audio_axiom_pro_25.glb';

export function useGlbAvailable(path = MODEL_PATH) {
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(path, { method: 'HEAD' })
      .then((response) => {
        if (!cancelled) setAvailable(response.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return available;
}

/**
 * Zeigt das echte GLB-Modell wenn vorhanden, sonst ein klickbares Platzhalter-Keyboard.
 */
export default function AxiomModel(props) {
  const glbAvailable = useGlbAvailable(MODEL_PATH);

  if (glbAvailable === null) {
    return <AxiomPlaceholder {...props} />;
  }

  if (!glbAvailable) {
    return <AxiomPlaceholder {...props} />;
  }

  return (
    <Suspense fallback={<AxiomPlaceholder {...props} />}>
      <AxiomGltfModel {...props} />
    </Suspense>
  );
}
