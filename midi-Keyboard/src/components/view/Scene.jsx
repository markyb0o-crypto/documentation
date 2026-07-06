import { Suspense } from 'react';
import { Center, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import AxiomModel from './AxiomModel.jsx';

export default function Scene({ onControlClick, highlightedMeshId }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 2.4]} fov={45} />
      <color attach="background" args={['#0a0c10']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <Center>
          <AxiomModel onControlClick={onControlClick} highlightedMeshId={highlightedMeshId} />
        </Center>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={0.8} maxDistance={6} />
    </>
  );
}
