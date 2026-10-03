import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import Bottle from './Bottle';
import Lighting from './Lighting';
import Stage from './Stage';
import CameraRig from './CameraRig';
import Atmosphere from './Atmosphere';
import { TIERS } from './quality';
import { markSceneReady, stage } from '../motion/stage';

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

// Rack-focus targets on the bottle (bottle units), each pushed out toward the
// camera onto the surface: stopper -> gold collar -> upper glass edge.
const FOCUS_POINTS = [
  { y: 0.9, r: 0.12 },
  { y: 0.835, r: 0.17 },
  { y: 0.64, r: 0.25 },
];

// Post stack (high tier). Depth of field is mounted only while Scene 6 needs it,
// so it costs nothing anywhere else in the journey.
function Effects({ dof }) {
  const [dofOn, setDofOn] = useState(false);
  const dofRef = useRef();
  const focus = useMemo(() => new THREE.Vector3(0, 0.9, 0), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const on = dof && stage.dof > 0.002;
    if (on !== dofOn) setDofOn(on);
    if (!dofRef.current) return;
    const k = Math.min(Math.max(stage.rack, 0), 2);
    const i = Math.min(Math.floor(k), 1);
    const f = k - i;
    const a = FOCUS_POINTS[i];
    const b = FOCUS_POINTS[i + 1];
    dir.set(camera.position.x, 0, camera.position.z).normalize();
    const r = a.r + (b.r - a.r) * f;
    focus.set(dir.x * r, a.y + (b.y - a.y) * f, dir.z * r);
    dofRef.current.target = focus;
    dofRef.current.bokehScale = stage.dof * 3.2;
  });

  return (
    // bloom stays very subtle: only HDR speculars above 1.0 (pre tone-mapping).
    // While depth of field runs, MSAA is off: DOF needs a depth texture and
    // blitting depth out of a multisampled buffer is rejected by some drivers.
    <EffectComposer key={dofOn ? 'dof' : 'msaa'} multisampling={dofOn ? 0 : 4}>
      {dofOn ? <DepthOfField ref={dofRef} target={focus} worldFocusRange={0.16} bokehScale={0} resolutionScale={0.5} /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={0.24} radius={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export default function Experience({ tierName }) {
  const tier = TIERS[tierName];
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio, tier.maxDpr));

  return (
    <div className="stage-canvas" role="img" aria-label="NOIRÉ Signature 01: a faceted smoked black crystal bottle with a champagne-gold collar, lit in a dark studio.">
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
          <Atmosphere tier={tier} />
          <CameraRig />
          <ReadySignal />
        </Suspense>
        {tier.bloom && <Effects dof={tier.dof} />}
      </Canvas>
    </div>
  );
}
