import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { stage } from '../motion/stage';

const PLINTH_R = 0.52;
const PLINTH_H = 0.7;

// --- backdrop: near-black studio sweep with a warm pool under the lamp -------
const backdropShader = {
  uniforms: { uLamp: { value: 0 }, uHaze: { value: 0 }, uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec3 vWorld;
    void main() {
      vec4 w = modelMatrix * vec4(position, 1.0);
      vWorld = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uLamp; uniform float uHaze; uniform float uTime;
    varying vec3 vWorld;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
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
      // dither: removes banding in the dark gradient
      col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
};

// --- haze: slow fbm sheets, additive, lit by the lamp -----------------------
const hazeShader = {
  uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSeed: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform float uTime; uniform float uAmount; uniform float uSeed;
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
      vec3 tint = vec3(0.92, 0.74, 0.52);
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
  const backdrop = useMemo(() => new THREE.ShaderMaterial({ ...backdropShader, uniforms: THREE.UniformsUtils.clone(backdropShader.uniforms), depthWrite: false }), []);
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

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    backdrop.uniforms.uLamp.value = stage.lamp;
    backdrop.uniforms.uHaze.value = stage.haze;
    backdrop.uniforms.uTime.value = t;
    cone.uniforms.uAmount.value = stage.lamp * 0.05;
    hazeMats.forEach((m, i) => {
      m.uniforms.uTime.value = t;
      m.uniforms.uAmount.value = stage.haze * (0.25 + 0.75 * stage.lamp) * HAZE_LAYERS[i].weight;
    });
    // the shadow exists because light exists: it follows the key + fill
    shadow.current.material.opacity = Math.min(1, stage.lamp * 0.65 + stage.fill * 0.35);
    glow.current.material.opacity = stage.plinth;
    goldLine.current.emissiveIntensity = 0.08 + stage.plinth * 0.25;
  });

  return (
    <group>
      <mesh position={[0, 1.2, -5]} material={backdrop} renderOrder={-10}>
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

      {hazeMats.map((m, i) => (
        <mesh key={i} position={HAZE_LAYERS[i].position} scale={HAZE_LAYERS[i].scale} material={m}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
