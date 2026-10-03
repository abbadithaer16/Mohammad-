import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { stage } from '../motion/stage';

RectAreaLightUniformsLib.init();

// Full-intensity values; `stage` holds 0..1 multipliers that GSAP animates.
// Every light that can be seen in the glass is an AREA light: point and spot
// sources print pinpoint highlights on polished glass (the CG giveaway); real
// product photography reflects softboxes and strips.
const MAX = {
  lamp: 11,
  rimL: 22,
  rimR: 14,
  fill: 0.8,
  env: 0.55,
  plinth: 0.75,
  sweep: 66,
};

// Bottle centre in world space (bottle is 1u tall, base on y = 0).
const AIM = new THREE.Vector3(0, 0.5, 0);
const PLINTH_UP = new THREE.Vector3(0, 5, 0.4);
const SWEEP_AIM = new THREE.Vector3(0, 0.8, 0);

// Custom studio environment: these shapes ARE the reflections the black glass
// and gold show, so they are composed like a real product-photography set.
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* overhead softbox (the lamp) */}
      <Lightformer form="circle" intensity={1.5} color="#ffe6c8" position={[0, 5, 0.5]} rotation-x={Math.PI / 2} scale={2.4} />
      {/* tall warm strip, camera-left back: draws the gold rim line */}
      <Lightformer form="rect" intensity={2.1} color="#efcf9f" position={[-4, 1.2, -1.6]} rotation-y={Math.PI / 2.6} scale={[0.5, 7, 1]} />
      {/* tall neutral strip, camera-right back */}
      <Lightformer form="rect" intensity={1.4} color="#fff1e2" position={[4.2, 1.4, -1.2]} rotation-y={-Math.PI / 2.4} scale={[0.35, 7, 1]} />
      {/* broad, dim front source: black glass (F0 ≈ 0.04) barely shows it while
          the gold foil (F0 ≈ 0.8) does, which is what makes the engraving read */}
      <Lightformer form="rect" intensity={0.26} color="#f2dfc4" position={[0, 0.8, 5]} scale={[7, 3.2, 1]} />
      {/* narrow grazing strips just behind the silhouette: clean, continuous rim lines */}
      <Lightformer form="rect" intensity={2.8} color="#e9c592" position={[-2.6, 1, -3.4]} rotation-y={Math.PI / 5} scale={[0.18, 6, 1]} />
      <Lightformer form="rect" intensity={1.8} color="#fbead6" position={[2.8, 1, -3.2]} rotation-y={-Math.PI / 5} scale={[0.14, 6, 1]} />
      {/* faint warm floor bounce */}
      <Lightformer form="rect" intensity={0.25} color="#8a5e33" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} />
    </Environment>
  );
}

export default function Lighting() {
  const scene = useThree((s) => s.scene);
  const lamp = useRef();
  const rimL = useRef();
  const rimR = useRef();
  const fill = useRef();
  const plinth = useRef();
  const sweep = useRef();

  useEffect(() => {
    lamp.current.lookAt(0, 0.35, 0);
    rimL.current.lookAt(AIM);
    rimR.current.lookAt(AIM);
    fill.current.lookAt(AIM);
    plinth.current.lookAt(PLINTH_UP);
  }, []);

  useFrame(() => {
    scene.environmentIntensity = stage.env * MAX.env;
    lamp.current.intensity = stage.lamp * MAX.lamp;
    rimL.current.intensity = stage.rim * MAX.rimL;
    rimR.current.intensity = stage.rim * MAX.rimR;
    fill.current.intensity = stage.fill * MAX.fill;
    plinth.current.intensity = stage.plinth * MAX.plinth;
    sweep.current.intensity = stage.sweepOn * MAX.sweep;
    sweep.current.position.x = stage.sweep;
    sweep.current.lookAt(SWEEP_AIM);
  });

  return (
    <>
      <StudioEnvironment />

      {/* 1 · overhead lamp: a round-ish softbox above, warm */}
      <rectAreaLight ref={lamp} position={[0, 2.3, 0.3]} width={1.1} height={1.1} color="#ffdcb4" intensity={0} />

      {/* 2 · rim strips, behind the bottle, grazing the silhouette */}
      <rectAreaLight ref={rimL} position={[-2.1, 1.1, -2.4]} width={0.35} height={2.6} color="#e8bf88" intensity={0} />
      <rectAreaLight ref={rimR} position={[2.3, 1.0, -2.4]} width={0.3} height={2.6} color="#f3dcc0" intensity={0} />

      {/* 3 · front fill: very large, dim, high camera-left; its mirror image
          lands on the upper-left shoulder instead of the label band */}
      <rectAreaLight ref={fill} position={[-1.9, 1.7, 2.4]} width={3.6} height={2.6} color="#f3e3cf" intensity={0} />

      {/* 4 · plinth glow: warm bounce rising from the plinth top */}
      <rectAreaLight ref={plinth} position={[0, 0.004, 0.25]} width={0.8} height={0.5} color="#c9944f" intensity={0} />

      {/* mid-reveal sweep: a narrow warm strip aimed at the upper bottle
          (shoulder studs, collar, stopper) travelling left -> right */}
      <rectAreaLight ref={sweep} position={[-1.5, 0.95, 2.0]} width={0.12} height={1.1} color="#ffd6a0" intensity={0} />
    </>
  );
}
