import { useMemo } from 'react';
import * as THREE from 'three';

const BODY = new THREE.Color('#1e293b');
const KEY_WHITE = new THREE.Color('#e2e8f0');
const KEY_BLACK = new THREE.Color('#0f172a');
const PAD = new THREE.Color('#334155');
const KNOB = new THREE.Color('#475569');
const FADER = new THREE.Color('#64748b');
const ACCENT = new THREE.Color('#10b981');

function makeMaterial(color, metalness = 0.3, roughness = 0.7) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function InteractivePart({ meshId, geometry, material, position, rotation = [0, 0, 0], scale = [1, 1, 1], onControlClick, highlighted }) {
  const mat = useMemo(() => {
    if (!highlighted) return material;
    const highlight = material.clone();
    highlight.color = ACCENT;
    highlight.emissive = new THREE.Color('#166534');
    highlight.emissiveIntensity = 0.35;
    return highlight;
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
      onPointerDown={(event) => {
        event.stopPropagation();
        onControlClick?.(meshId, event.object);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

/**
 * Vereinfachtes Axiom-Keyboard – funktioniert ohne GLB-Datei.
 * Später automatisch ersetzt, wenn m-audio_axiom_pro_25.glb vorhanden ist.
 */
export default function AxiomPlaceholder({ onControlClick, highlightedMeshId = null }) {
  const bodyMat = useMemo(() => makeMaterial(BODY), []);
  const keyWhiteMat = useMemo(() => makeMaterial(KEY_WHITE, 0.1, 0.5), []);
  const keyBlackMat = useMemo(() => makeMaterial(KEY_BLACK, 0.2, 0.6), []);
  const padMat = useMemo(() => makeMaterial(PAD, 0.4, 0.5), []);
  const knobMat = useMemo(() => makeMaterial(KNOB, 0.5, 0.4), []);
  const faderMat = useMemo(() => makeMaterial(FADER, 0.6, 0.35), []);

  const keyGeo = useMemo(() => new THREE.BoxGeometry(0.07, 0.02, 0.22), []);
  const keyBlackGeo = useMemo(() => new THREE.BoxGeometry(0.045, 0.025, 0.14), []);
  const padGeo = useMemo(() => new THREE.BoxGeometry(0.14, 0.015, 0.14), []);
  const knobGeo = useMemo(() => new THREE.CylinderGeometry(0.035, 0.04, 0.03, 24), []);
  const faderGeo = useMemo(() => new THREE.BoxGeometry(0.025, 0.08, 0.06), []);
  const buttonGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.02, 0.04), []);

  const whiteKeyPositions = useMemo(
    () => Array.from({ length: 25 }, (_, index) => [-0.84 + index * 0.07, 0.06, 0]),
    [],
  );

  const blackKeyIndices = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22, 23];

  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow castShadow material={bodyMat}>
        <boxGeometry args={[1.9, 0.08, 0.55]} />
      </mesh>

      {whiteKeyPositions.map((position, index) => (
        <InteractivePart
          key={`key_${index + 1}`}
          meshId={`key_${index + 1}`}
          geometry={keyGeo}
          material={keyWhiteMat}
          position={position}
          onControlClick={onControlClick}
          highlighted={highlightedMeshId === `key_${index + 1}`}
        />
      ))}

      {blackKeyIndices.map((index) => (
        <InteractivePart
          key={`key_black_${index}`}
          meshId={`key_black_${index}`}
          geometry={keyBlackGeo}
          material={keyBlackMat}
          position={[-0.84 + index * 0.07 + 0.035, 0.075, -0.03]}
          onControlClick={onControlClick}
          highlighted={highlightedMeshId === `key_black_${index}`}
        />
      ))}

      {Array.from({ length: 8 }, (_, index) => (
        <InteractivePart
          key={`pad_${index + 1}`}
          meshId={`pad_${index + 1}`}
          geometry={padGeo}
          material={padMat}
          position={[-0.55 + index * 0.16, 0.065, 0.28]}
          onControlClick={onControlClick}
          highlighted={highlightedMeshId === `pad_${index + 1}`}
        />
      ))}

      {Array.from({ length: 8 }, (_, index) => (
        <InteractivePart
          key={`knob_${index + 1}`}
          meshId={`knob_${index + 1}`}
          geometry={knobGeo}
          material={knobMat}
          position={[-0.7 + index * 0.2, 0.12, -0.22]}
          rotation={[0, 0, 0]}
          onControlClick={onControlClick}
          highlighted={highlightedMeshId === `knob_${index + 1}`}
        />
      ))}

      {Array.from({ length: 4 }, (_, index) => (
        <InteractivePart
          key={`fader_${index + 1}`}
          meshId={`fader_${index + 1}`}
          geometry={faderGeo}
          material={faderMat}
          position={[0.55 + index * 0.1, 0.1, -0.22]}
          onControlClick={onControlClick}
          highlighted={highlightedMeshId === `fader_${index + 1}`}
        />
      ))}

      {[
        ['transport_play', 'Play', -0.2],
        ['transport_stop', 'Stop', -0.05],
        ['transport_record', 'Rec', 0.1],
        ['octave_up', 'Okt+', 0.75],
        ['octave_down', 'Okt-', 0.6],
      ].map(([meshId, , x]) => (
        <InteractivePart
          key={meshId}
          meshId={meshId}
          geometry={buttonGeo}
          material={knobMat}
          position={[x, 0.09, -0.22]}
          onControlClick={onControlClick}
          highlighted={highlightedMeshId === meshId}
        />
      ))}
    </group>
  );
}
