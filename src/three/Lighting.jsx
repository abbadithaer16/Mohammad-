import { useEffect, useMemo, useRef } from 'react';
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
  side: 13,
  collar: 10,
  scan: 70,
  low: 14,
  base: 30,
  band: 60,
};

// HEART band tones: warm amber, and a neutral champagne for the craft macro
const BAND_WARM = new THREE.Color('#ffd2a2');
const BAND_NEUTRAL = new THREE.Color('#fff4e6');

// Bottle centre in world space (bottle is 1u tall, base on y = 0).
const AIM = new THREE.Vector3(0, 0.5, 0);
const PLINTH_UP = new THREE.Vector3(0, 5, 0.4);
const SWEEP_AIM = new THREE.Vector3(0, 0.8, 0);
const COLLAR = new THREE.Vector3(0, 0.79, 0);
const LOW_AIM = new THREE.Vector3(0, 0.38, 0);
const BASE_AIM = new THREE.Vector3(0, 0.22, 0);

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

// Choreographic lights live in the CAMERA's frame (rotated around the bottle
// by the camera's azimuth), so a scan always crosses exactly the part of the
// product the camera is looking at, from any angle on the path. The studio
// itself (lamp, rims, fill, plinth, environment) stays fixed in the world, so
// reflections genuinely travel as the camera moves around the bottle.
const CAMERA_RELATIVE = {
  side: [2.0, 0.95, 0.35],
  collar: [-0.45, 1.55, 1.25],
  low: [-1.7, 0.18, 1.0],
  base: [0.35, 0.16, -1.3],
  sweep: [-1.5, 0.95, 2.0],
};
// Studio life: the environment turns a little against the camera's orbit, so
// its strips glide across the black glass and gold faster than the camera
// moves, and drifts very slowly on its own; the two rim strips breathe a few
// centimetres. Off for reduced motion.
const ENV_COUNTER = 0.12; // radians of env turn per radian of camera orbit
const RIM_L = new THREE.Vector3(-2.1, 1.1, -2.4);
const RIM_R = new THREE.Vector3(2.3, 1.0, -2.4);

const _v = new THREE.Vector3();
const _aim = new THREE.Vector3();
const placeRelative = (light, local, az, aim) => {
  _v.set(...local).applyAxisAngle(THREE.Object3D.DEFAULT_UP, az);
  light.position.copy(_v);
  light.lookAt(aim);
};

export default function Lighting() {
  const scene = useThree((s) => s.scene);
  const lamp = useRef();
  const rimL = useRef();
  const rimR = useRef();
  const fill = useRef();
  const plinth = useRef();
  const sweep = useRef();
  const side = useRef();
  const collar = useRef();
  const scan = useRef();
  const band = useRef();
  const low = useRef();
  const base = useRef();

  useEffect(() => {
    lamp.current.lookAt(0, 0.35, 0);
    rimL.current.lookAt(AIM);
    rimR.current.lookAt(AIM);
    fill.current.lookAt(AIM);
    plinth.current.lookAt(PLINTH_UP);
  }, []);

  const ambient = useMemo(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1), []);

  useFrame(({ camera, clock }) => {
    const az = Math.atan2(camera.position.x, camera.position.z);
    const t = clock.elapsedTime;
    scene.environmentRotation.y = -az * ENV_COUNTER + Math.sin(t * 0.045) * 0.05 * ambient;
    rimL.current.position.set(RIM_L.x + Math.sin(t * 0.07) * 0.14 * ambient, RIM_L.y, RIM_L.z);
    rimR.current.position.set(RIM_R.x + Math.sin(t * 0.058 + 1.7) * 0.12 * ambient, RIM_R.y, RIM_R.z);
    rimL.current.lookAt(AIM);
    rimR.current.lookAt(AIM);
    scene.environmentIntensity = stage.env * MAX.env * stage.envScale;
    lamp.current.intensity = stage.lamp * MAX.lamp * (1 + stage.topBoost * 0.6);
    rimL.current.intensity = stage.rim * MAX.rimL * stage.rimScale;
    rimR.current.intensity = stage.rim * MAX.rimR * stage.rimScale;
    fill.current.intensity = stage.fill * stage.fillScale * MAX.fill;
    plinth.current.intensity = stage.plinth * MAX.plinth * (1 + stage.flood * 0.4);

    side.current.intensity = stage.side * MAX.side * stage.sideScale * stage.rimScale;
    placeRelative(side.current, CAMERA_RELATIVE.side, az, AIM);
    collar.current.intensity = stage.collar * MAX.collar;
    placeRelative(collar.current, CAMERA_RELATIVE.collar, az, COLLAR);
    low.current.intensity = stage.low * MAX.low;
    placeRelative(low.current, CAMERA_RELATIVE.low, az, LOW_AIM);
    base.current.intensity = stage.baseGlow * MAX.base;
    placeRelative(base.current, CAMERA_RELATIVE.base, az, BASE_AIM);
    sweep.current.intensity = stage.sweepOn * MAX.sweep;
    placeRelative(sweep.current, [stage.sweep, 0.95, 2.0], az, SWEEP_AIM);

    // TOP / BASE scan: a thin horizontal strip a little camera-right of the
    // lens, travelling down the bottle (stage.scanY, bottle units)
    scan.current.intensity = stage.scan * MAX.scan;
    _aim.set(0, stage.scanY - 0.08, 0);
    placeRelative(scan.current, [0.25, stage.scanY, 1.7], az, _aim);

    // HEART band: a thin vertical strip that sweeps around the bottle at the
    // label's height (stage.bandAz, degrees relative to the camera)
    band.current.intensity = stage.band * MAX.band;
    band.current.color.lerpColors(BAND_WARM, BAND_NEUTRAL, stage.bandTone);
    const ba = az + (stage.bandAz * Math.PI) / 180;
    band.current.position.set(Math.sin(ba) * 1.6, 0.5, Math.cos(ba) * 1.6);
    band.current.lookAt(0, 0.5, 0);
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

      {/* camera-relative choreography lights (positions set every frame) */}
      {/* warm amber side strip, camera-right and slightly behind */}
      <rectAreaLight ref={side} width={0.45} height={2.2} color="#e3a463" intensity={0} />
      {/* small softbox above-front, aimed at the collar only */}
      <rectAreaLight ref={collar} width={0.38} height={0.2} color="#ffe2bd" intensity={0} />
      {/* TOP / BASE scan strip */}
      <rectAreaLight ref={scan} width={1.5} height={0.06} color="#ffe0b0" intensity={0} />
      {/* HEART band strip */}
      <rectAreaLight ref={band} width={0.07} height={0.5} color="#ffd2a2" intensity={0} />
      {/* low warm side light, camera-left: sensual, from below */}
      <rectAreaLight ref={low} width={0.5} height={1.0} color="#c8693b" intensity={0} />
      {/* AMBER: low warm light from behind, glowing through the lower glass */}
      <rectAreaLight ref={base} width={1.2} height={0.35} color="#d98a3d" intensity={0} />
      {/* travelling warm sweep (Scene 1 mid-reveal, Scene 6 across the collar) */}
      <rectAreaLight ref={sweep} width={0.12} height={1.1} color="#ffd6a0" intensity={0} />
    </>
  );
}
