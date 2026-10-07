import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { BG_FOLLOW, stage } from '../motion/stage';

const PLINTH_R = 0.52;
const PLINTH_H = 0.7;

// --- backdrop: near-black studio sweep with a warm pool under the lamp -------
const backdropShader = {
  uniforms: { uLamp: { value: 0 }, uHaze: { value: 0 }, uTime: { value: 0 }, uFlood: { value: 0 }, uHue: { value: 0 }, uWood: { value: 0 }, uDim: { value: 0 }, uBaseGlow: { value: 0 }, uBaseGlowPos: { value: new THREE.Vector2() }, uWallAz: { value: 0 }, uMotion: { value: 1 } },
  // the wall turns with the camera (see Stage), so its pools are authored in
  // the wall's own plane: x across, y = world height
  vertexShader: /* glsl */ `
    varying vec3 vWorld;
    void main() {
      vWorld = vec3(position.x, position.y + 1.2, -5.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform float uLamp; uniform float uHaze; uniform float uTime; uniform float uFlood; uniform float uHue;
    uniform float uWood; uniform float uDim; uniform float uBaseGlow; uniform vec2 uBaseGlowPos;
    uniform float uWallAz; uniform float uMotion;
    varying vec3 vWorld;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.02 + 7.3; a *= 0.5; } return v; }
    // the wall only partly follows the camera; this is the WORLD azimuth of a
    // point on it, so anything placed by it stays put in the studio and
    // slides across the frame as the camera orbits (true parallax)
    float worldAngle() { return uWallAz + 3.14159265 - atan(vWorld.x / 5.0); }
    float spill(float wa, float at, float w) { float d = (wa - at) / w; return exp(-d * d); }
    void main() {
      vec3 col = vec3(0.010, 0.009, 0.008);
      // soft warm pool behind the bottle, falling off to black
      vec2 p = (vWorld.xy - vec2(0.0, 1.1)) * vec2(0.5, 0.7);
      float pool = exp(-dot(p, p) * 1.6);
      col += vec3(0.030, 0.020, 0.012) * pool * uLamp;
      // tight warm halo directly behind the bottle: separates the black glass
      // from the black studio, with a long, soft falloff
      vec2 q = (vWorld.xy - vec2(0.0, 0.75)) * vec2(0.55, 0.5);
      col += vec3(0.060, 0.040, 0.024) * exp(-dot(q, q) * 2.2) * uLamp;
      // faint horizon where the studio floor would meet the wall
      col += vec3(0.020, 0.014, 0.009) * exp(-pow((vWorld.y + 0.15) * 1.8, 2.0)) * uHaze * pool;
      // SCENE 2 · colour flood. A warm front expands outward from the plinth
      // (behind the bottle's base) across the studio wall; inside it the wall
      // takes a deep-amber core -> smoked-brown -> muted-bronze falloff. The
      // leading edge carries a faint brighter band so the spread reads as light
      // travelling, not a crossfade.
      vec2 fo = (vWorld.xy - vec2(0.0, 0.15)) * vec2(0.62, 1.0);
      float fr = length(fo);
      float front = mix(-1.0, 9.0, uFlood);
      float inside = 1.0 - smoothstep(front - 2.6, front, fr);
      float edgeBand = inside * smoothstep(front - 2.6, front - 0.4, fr) * (1.0 - uFlood);
      vec3 core = vec3(0.060, 0.026, 0.0075);  // deep warm amber
      vec3 mid  = vec3(0.019, 0.009, 0.0038);  // smoked brown
      vec3 edge = vec3(0.012, 0.008, 0.0045);  // muted bronze into near-black
      // SCENE 4 · the same room turns richer: amber -> red-brown
      core = mix(core, vec3(0.064, 0.019, 0.0075), uHue);
      mid = mix(mid, vec3(0.020, 0.0068, 0.0038), uHue);
      // SCENE 5 · SANDALWOOD: the room turns woody brown
      core = mix(core, vec3(0.046, 0.023, 0.010), uWood);
      mid = mix(mid, vec3(0.016, 0.0085, 0.0045), uWood);
      vec3 flood = mix(edge, mid, exp(-fr * 0.42));
      flood = mix(flood, core, exp(-fr * fr * 0.16));
      col = mix(col, max(col, flood), inside);
      col += core * 0.25 * edgeBand;
      // SCENE 5 · AMBER: a low warm glow on the wall exactly behind the lower
      // bottle (position projected per frame), seen through the glass
      vec2 bg = (vWorld.xy - uBaseGlowPos) * vec2(0.55, 0.85);
      col += vec3(0.105, 0.046, 0.012) * exp(-dot(bg, bg) * 1.3) * uBaseGlow;
      // studio depth: two faint, tall spills of light on the far wall, fixed in
      // the world. They drift past behind the bottle as the camera travels.
      float wa = worldAngle();
      float tall = exp(-pow((vWorld.y - 1.3) * 0.55, 2.0));
      float spills = spill(wa, 3.14159265 - 0.62, 0.2) + 0.7 * spill(wa, 3.14159265 + 0.78, 0.24);
      col += vec3(0.016, 0.011, 0.0068) * spills * tall * uLamp;
      // light through slowly moving air: an extremely slow, soft modulation of
      // whatever light is already on the wall (never adds light to black)
      float air = fbm(vec2(wa * 2.2, vWorld.y * 0.4) + vec2(uTime * 0.009, -uTime * 0.006));
      col *= 1.0 + (air - 0.5) * 0.18 * uMotion;
      // SCENES 6–7 · the background falls toward black
      col *= 1.0 - 0.62 * uDim;

      // dither: removes banding in the dark gradient
      col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
};

// --- haze: slow fbm sheets, additive, lit by the lamp -----------------------
const hazeShader = {
  uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSeed: { value: 0 }, uWarm: { value: 0 }, uHue: { value: 0 }, uIvory: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform float uTime; uniform float uAmount; uniform float uSeed; uniform float uWarm; uniform float uHue; uniform float uIvory;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
    void main() {
      vec2 p = vUv * vec2(3.0, 1.6) + uSeed;
      float t = uTime * 0.018;
      float n = fbm(p + vec2(t, -t * 0.4) + fbm(p * 0.7 - t) * 0.9);
      float shape = smoothstep(0.38, 0.85, n);
      float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
      vec3 tint = mix(vec3(0.92, 0.74, 0.52), vec3(1.0, 0.62, 0.30), uWarm); // haze picks up the amber
      tint = mix(tint, vec3(1.0, 0.48, 0.30), uHue);
      tint = mix(tint, vec3(0.98, 0.88, 0.70), uIvory * 0.7); // VANILLA: ivory-gold lift
      gl_FragColor = vec4(tint * shape * edge * uAmount, 1.0);
    }`,
};

// --- lamp shaft: a soft volumetric cone, fresnel-faded --------------------
const coneShader = {
  uniforms: { uAmount: { value: 0 } },
  vertexShader: /* glsl */ `
    varying float vFacing; varying float vAlong;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normal);
      vFacing = abs(dot(n, normalize(-mv.xyz)));
      vAlong = uv.y;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uAmount; varying float vFacing; varying float vAlong;
    void main() {
      float a = pow(vFacing, 3.0) * smoothstep(0.0, 0.75, vAlong) * uAmount;
      gl_FragColor = vec4(vec3(1.0, 0.80, 0.56) * a, 1.0);
    }`,
};

function radialTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const HAZE_LAYERS = [
  { position: [0.35, 1.0, -1.6], scale: [3.6, 2.8, 1], seed: 0.0, weight: 0.07 },
  { position: [0.5, 0.55, -2.8], scale: [5, 2.6, 1], seed: 3.7, weight: 0.05 },
  { position: [0.4, 0.12, 0.85], scale: [3.2, 0.9, 1], seed: 7.1, weight: 0.03 }, // low mist across the plinth front
  { position: [0, 1.9, -0.6], scale: [3.5, 2.4, 1], seed: 11.3, weight: 0.03 },
];

export default function Stage({ tier }) {
  const backdrop = useMemo(() => {
    const m = new THREE.ShaderMaterial({ ...backdropShader, uniforms: THREE.UniformsUtils.clone(backdropShader.uniforms), depthWrite: false });
    // reduced motion: the wall's light stays still (no drifting air)
    m.uniforms.uMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
    return m;
  }, []);
  const cone = useMemo(
    () => new THREE.ShaderMaterial({ ...coneShader, uniforms: THREE.UniformsUtils.clone(coneShader.uniforms), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const hazeMats = useMemo(
    () =>
      HAZE_LAYERS.slice(0, tier.hazeLayers).map((l) => {
        const m = new THREE.ShaderMaterial({ ...hazeShader, uniforms: THREE.UniformsUtils.clone(hazeShader.uniforms), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        m.uniforms.uSeed.value = l.seed;
        return m;
      }),
    [tier.hazeLayers],
  );
  const shadowTex = useMemo(() => radialTexture([[0, 'rgba(0,0,0,0.92)'], [0.45, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]), []);
  const glowTex = useMemo(() => radialTexture([[0, 'rgba(190,140,80,0.26)'], [0.5, 'rgba(140,96,52,0.08)'], [1, 'rgba(120,80,40,0)']]), []);

  const shadow = useRef();
  const glow = useRef();
  const goldLine = useRef();

  const wall = useRef();
  const hazeGroup = useRef();
  const v = useMemo(() => ({ c: new THREE.Vector3(), n: new THREE.Vector3(), r: new THREE.Vector3(), d: new THREE.Vector3(), h: new THREE.Vector3() }), []);

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    // The studio wall and its haze stay behind the bottle from wherever the
    // camera stands on its path (the camera orbits up to ~60° around it).
    // The set only follows the camera part of the way (BG_FOLLOW), so the
    // background visibly slides against the bottle during an orbit (parallax)
    // while the wall's edges never enter the frame.
    const az = Math.atan2(camera.position.x, camera.position.z) * BG_FOLLOW;
    v.n.set(Math.sin(az), 0, Math.cos(az));
    v.r.set(Math.cos(az), 0, -Math.sin(az));
    v.c.copy(v.n).multiplyScalar(-5);
    v.c.y = 1.2;
    wall.current.position.copy(v.c);
    wall.current.rotation.y = az;
    hazeGroup.current.rotation.y = az;
    // project the lower bottle (0, 0.22, 0) from the camera onto that wall
    v.d.set(0, 0.22, 0).sub(camera.position);
    const k = v.h.copy(v.c).sub(camera.position).dot(v.n) / v.d.dot(v.n);
    v.h.copy(camera.position).addScaledVector(v.d, k);
    backdrop.uniforms.uBaseGlowPos.value.set((v.h.x - v.c.x) * v.r.x + (v.h.z - v.c.z) * v.r.z, v.h.y);
    backdrop.uniforms.uBaseGlow.value = stage.baseGlow;
    backdrop.uniforms.uWood.value = stage.wood;
    backdrop.uniforms.uDim.value = stage.dim;
    backdrop.uniforms.uLamp.value = stage.lamp;
    backdrop.uniforms.uHaze.value = stage.haze;
    backdrop.uniforms.uTime.value = t;
    backdrop.uniforms.uFlood.value = stage.flood;
    backdrop.uniforms.uHue.value = stage.hue;
    backdrop.uniforms.uWallAz.value = az;
    cone.uniforms.uAmount.value = stage.lamp * 0.05;
    hazeMats.forEach((m, i) => {
      m.uniforms.uTime.value = t;
      m.uniforms.uAmount.value = stage.haze * (0.25 + 0.75 * stage.lamp) * HAZE_LAYERS[i].weight * (1 + stage.flood * 0.4) * (1 - stage.dim * 0.4);
      m.uniforms.uIvory.value = stage.ivory;
      m.uniforms.uWarm.value = stage.flood;
      m.uniforms.uHue.value = stage.hue;
    });
    // the shadow exists because light exists: it follows the key + fill
    shadow.current.material.opacity = Math.min(1, stage.lamp * 0.65 + stage.fill * 0.35);
    // plinth glow brightens and spreads as the flood takes the room
    glow.current.material.opacity = stage.plinth * (1 + stage.flood * 0.6);
    glow.current.scale.setScalar(1 + stage.flood * 0.2); // stays within the plinth top
    goldLine.current.emissiveIntensity = 0.08 + stage.plinth * 0.25;
  });

  return (
    <group>
      <mesh ref={wall} position={[0, 1.2, -5]} material={backdrop} renderOrder={-10}>
        <planeGeometry args={[40, 24]} />
      </mesh>

      {/* plinth: black honed stone, faint gloss */}
      <mesh position-y={-PLINTH_H / 2}>
        <cylinderGeometry args={[PLINTH_R, PLINTH_R, PLINTH_H, 128, 1, true]} />
        <meshPhysicalMaterial color="#0b0a09" roughness={0.42} metalness={0} clearcoat={0.5} clearcoatRoughness={0.18} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <circleGeometry args={[PLINTH_R, 128]} />
        {tier.reflector ? (
          <MeshReflectorMaterial
            resolution={512}
            blur={[260, 80]}
            mixBlur={1}
            mixStrength={0.45}
            mirror={0.5}
            roughness={0.55}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#080707"
            metalness={0.3}
          />
        ) : (
          <meshPhysicalMaterial color="#0c0b0a" roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.08} />
        )}
      </mesh>

      {/* thin champagne-gold inlay around the plinth edge */}
      <mesh rotation-x={Math.PI / 2} position-y={-0.004}>
        <torusGeometry args={[PLINTH_R + 0.001, 0.0022, 8, 256]} />
        <meshStandardMaterial ref={goldLine} color="#a88a5c" metalness={1} roughness={0.28} emissive="#5a4426" emissiveIntensity={0.08} />
      </mesh>

      {/* contact shadow + warm glow pooled on the plinth top */}
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position-y={0.002}>
        <planeGeometry args={[0.78, 0.78]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={glow} rotation-x={-Math.PI / 2} position-y={0.003}>
        <planeGeometry args={[1.05, 1.05]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} toneMapped={false} />
      </mesh>

      {/* lamp shaft */}
      <mesh position-y={1.85} material={cone}>
        <cylinderGeometry args={[0.1, 0.78, 3.3, 64, 1, true]} />
      </mesh>

      <group ref={hazeGroup}>
        {hazeMats.map((m, i) => (
          <mesh key={i} position={HAZE_LAYERS[i].position} scale={HAZE_LAYERS[i].scale} material={m}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
