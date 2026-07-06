import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/m-audio_axiom_pro_25.glb';

const HIGHLIGHT_COLOR = new THREE.Color('#4ade80');
const HIGHLIGHT_EMISSIVE = new THREE.Color('#166534');

useGLTF.preload(MODEL_PATH);

function cloneSceneWithMaterials(source) {
  const clone = source.clone(true);

  clone.traverse((child) => {
    if (!child.isMesh) return;

    child.userData.meshId = child.name || child.uuid;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material.clone());
    } else if (child.material) {
      child.material = child.material.clone();
    }

    child.userData.baseMaterial = child.material;

    child.castShadow = true;
    child.receiveShadow = true;
  });

  return clone;
}

/**
 * Lädt das M-Audio Axiom Pro 25 GLB-Modell und macht alle Meshes interaktiv.
 * Feuert bei Klick nur ein Callback nach außen – keine Geschäftslogik hier.
 */
export default function AxiomModel({ onControlClick, highlightedMeshId = null }) {
  const { scene } = useGLTF(MODEL_PATH);

  const model = useMemo(() => cloneSceneWithMaterials(scene), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return;

      const meshId = child.userData.meshId;
      const baseMaterial = child.userData.baseMaterial;
      const isHighlighted = highlightedMeshId === meshId;

      if (!isHighlighted) {
        child.material = baseMaterial;
        return;
      }

      const highlightMaterial = baseMaterial.clone();
      highlightMaterial.color = HIGHLIGHT_COLOR;
      highlightMaterial.emissive = HIGHLIGHT_EMISSIVE;
      highlightMaterial.emissiveIntensity = 0.35;
      child.material = highlightMaterial;
    });
  }, [model, highlightedMeshId]);

  const handlePointerDown = (event) => {
    event.stopPropagation();

    const mesh = event.object;
    if (!mesh?.isMesh) return;

    const meshId = mesh.userData.meshId ?? mesh.name ?? mesh.uuid;
    onControlClick?.(meshId, mesh);
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  return (
    <primitive
      object={model}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}
