import { Suspense } from 'react';
import { Center, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import AxiomModel from './AxiomModel.jsx';

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.1, 0.3]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  );
}

/**
 * Kapselt Kamera, Beleuchtung, Controls und das interaktive Keyboard-Modell.
 */
export default function Scene({ onControlClick, highlightedMeshId = null }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 2.4]} fov={45} near={0.01} far={100} />

      <color attach="background" args={['#0f1115']} />
      <fog attach="fog" args={['#0f1115', 4, 12]} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <pointLight position={[0, 1.5, 1]} intensity={0.25} />

      <Suspense fallback={<SceneFallback />}>
        <Center>
          <AxiomModel
            onControlClick={onControlClick}
            highlightedMeshId={highlightedMeshId}
          />
        </Center>
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.8}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2 + 0.15}
        target={[0, 0.1, 0]}
      />
    </>
  );
}
