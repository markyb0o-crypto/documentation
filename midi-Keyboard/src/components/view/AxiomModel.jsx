import { Suspense, useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/m-audio_axiom_pro_25.glb';
const HIGHLIGHT = new THREE.Color('#4ade80');
const HIGHLIGHT_EMISSIVE = new THREE.Color('#166534');

function cloneScene(source) {
  const clone = source.clone(true);
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.userData.meshId = child.name || child.uuid;
    if (Array.isArray(child.material)) child.material = child.material.map((m) => m.clone());
    else if (child.material) child.material = child.material.clone();
    child.userData.baseMaterial = child.material;
    child.castShadow = true;
    child.receiveShadow = true;
  });
  return clone;
}

function GltfKeyboard({ onControlClick, highlightedMeshId }) {
  const { scene } = useGLTF(MODEL_PATH);
  const model = useMemo(() => cloneScene(scene), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return;
      const base = child.userData.baseMaterial;
      if (highlightedMeshId !== child.userData.meshId) {
        child.material = base;
        return;
      }
      const h = base.clone();
      h.color = HIGHLIGHT;
      h.emissive = HIGHLIGHT_EMISSIVE;
      h.emissiveIntensity = 0.35;
      child.material = h;
    });
  }, [model, highlightedMeshId]);

  const onPointerDown = (e) => {
    e.stopPropagation();
    if (!e.object?.isMesh) return;
    onControlClick(e.object.userData.meshId ?? e.object.name);
  };

  return (
    <primitive
      object={model}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    />
  );
}

function PlaceholderKey({ meshId, geometry, material, position, rotation, scale, highlighted, onControlClick }) {
  const mat = useMemo(() => {
    if (!highlighted) return material;
    const h = material.clone();
    h.color = HIGHLIGHT;
    h.emissive = HIGHLIGHT_EMISSIVE;
    h.emissiveIntensity = 0.35;
    return h;
  }, [material, highlighted]);

  return (
    <mesh
      name={meshId}
      userData={{ meshId }}
      geometry={geometry}
      material={mat}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
      onPointerDown={(e) => { e.stopPropagation(); onControlClick(meshId); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    />
  );
}

function PlaceholderKeyboard({ onControlClick, highlightedMeshId }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b' }), []);
  const keyW = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e2e8f0' }), []);
  const keyB = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a' }), []);
  const pad = useMemo(() => new THREE.MeshStandardMaterial({ color: '#334155' }), []);
  const knob = useMemo(() => new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.5 }), []);
  const fader = useMemo(() => new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.6 }), []);

  const keyGeo = useMemo(() => new THREE.BoxGeometry(0.07, 0.02, 0.22), []);
  const keyBGeo = useMemo(() => new THREE.BoxGeometry(0.045, 0.025, 0.14), []);
  const padGeo = useMemo(() => new THREE.BoxGeometry(0.14, 0.015, 0.14), []);
  const knobGeo = useMemo(() => new THREE.CylinderGeometry(0.035, 0.04, 0.03, 24), []);
  const faderGeo = useMemo(() => new THREE.BoxGeometry(0.025, 0.08, 0.06), []);
  const btnGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.02, 0.04), []);

  const whiteKeys = useMemo(() => Array.from({ length: 25 }, (_, i) => [-0.84 + i * 0.07, 0.06, 0]), []);
  const blackKeys = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22, 23];

  return (
    <group>
      <mesh position={[0, 0, 0]} material={body} receiveShadow castShadow>
        <boxGeometry args={[1.9, 0.08, 0.55]} />
      </mesh>
      {whiteKeys.map((pos, i) => (
        <PlaceholderKey key={`key_${i + 1}`} meshId={`key_${i + 1}`} geometry={keyGeo} material={keyW} position={pos} highlighted={highlightedMeshId === `key_${i + 1}`} onControlClick={onControlClick} />
      ))}
      {blackKeys.map((i) => (
        <PlaceholderKey key={`key_black_${i}`} meshId={`key_black_${i}`} geometry={keyBGeo} material={keyB} position={[-0.84 + i * 0.07 + 0.035, 0.075, -0.03]} highlighted={highlightedMeshId === `key_black_${i}`} onControlClick={onControlClick} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <PlaceholderKey key={`pad_${i + 1}`} meshId={`pad_${i + 1}`} geometry={padGeo} material={pad} position={[-0.55 + i * 0.16, 0.065, 0.28]} highlighted={highlightedMeshId === `pad_${i + 1}`} onControlClick={onControlClick} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <PlaceholderKey key={`knob_${i + 1}`} meshId={`knob_${i + 1}`} geometry={knobGeo} material={knob} position={[-0.7 + i * 0.2, 0.12, -0.22]} highlighted={highlightedMeshId === `knob_${i + 1}`} onControlClick={onControlClick} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <PlaceholderKey key={`fader_${i + 1}`} meshId={`fader_${i + 1}`} geometry={faderGeo} material={fader} position={[0.55 + i * 0.1, 0.1, -0.22]} highlighted={highlightedMeshId === `fader_${i + 1}`} onControlClick={onControlClick} />
      ))}
      {[['transport_play', -0.2], ['transport_stop', -0.05], ['transport_record', 0.1], ['octave_up', 0.75], ['octave_down', 0.6]].map(([id, x]) => (
        <PlaceholderKey key={id} meshId={id} geometry={btnGeo} material={knob} position={[x, 0.09, -0.22]} highlighted={highlightedMeshId === id} onControlClick={onControlClick} />
      ))}
    </group>
  );
}

function useGlbAvailable() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    fetch(MODEL_PATH, { method: 'HEAD' }).then((r) => setOk(r.ok)).catch(() => setOk(false));
  }, []);
  return ok;
}

export default function AxiomModel({ onControlClick, highlightedMeshId }) {
  const glb = useGlbAvailable();
  if (glb !== true) return <PlaceholderKeyboard onControlClick={onControlClick} highlightedMeshId={highlightedMeshId} />;
  return (
    <Suspense fallback={<PlaceholderKeyboard onControlClick={onControlClick} highlightedMeshId={highlightedMeshId} />}>
      <GltfKeyboard onControlClick={onControlClick} highlightedMeshId={highlightedMeshId} />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
