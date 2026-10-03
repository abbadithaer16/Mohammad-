import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import Bottle from './Bottle';
import Lighting from './Lighting';
import Stage from './Stage';
import CameraRig from './CameraRig';
import { TIERS } from './quality';
import { markSceneReady } from '../motion/stage';

// Precompiles every shader, then waits two frames so the first animated frame
// of the reveal is never a compile hitch.
function ReadySignal() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let raf;
    const compiled = gl.compileAsync ? gl.compileAsync(scene, camera) : Promise.resolve();
    compiled
      .catch(() => {})
      .then(() => {
        raf = requestAnimationFrame(() => (raf = requestAnimationFrame(markSceneReady)));
      });
    return () => cancelAnimationFrame(raf);
  }, [gl, scene, camera]);
  return null;
}

export default function Experience({ tierName }) {
  const tier = TIERS[tierName];
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio, tier.maxDpr));

  return (
    <div className="stage-canvas" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ fov: 30, near: 0.05, far: 40, position: [0, 0.56, 3.3] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={['#030303']} />
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(tier.maxDpr, d + 0.25))}
        />
        <Suspense fallback={null}>
          <Lighting />
          <Stage tier={tier} />
          <Bottle tier={tier} />
          <CameraRig />
          <ReadySignal />
        </Suspense>
        {tier.bloom && (
          // very subtle bloom, only on HDR speculars above 1.0 (pre tone-mapping)
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={0.24} radius={0.55} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
