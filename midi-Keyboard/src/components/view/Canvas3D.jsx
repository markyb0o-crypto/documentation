import { Canvas } from '@react-three/fiber';
import Scene from './Scene.jsx';

export default function Canvas3D({ onControlClick, highlightedMeshId }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      className="h-full w-full"
    >
      <Scene
        onControlClick={onControlClick}
        highlightedMeshId={highlightedMeshId}
      />
    </Canvas>
  );
}
