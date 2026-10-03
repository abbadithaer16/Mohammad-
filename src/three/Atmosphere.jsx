import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '../motion/stage';
import { computeLayout } from '../motion/layout';

// SCENE 7 — the smoke interlude's atmosphere.
//
// Smoke: a few large sheets at different depths (behind, around, and one low
// veil in front of the plinth). Each is slow domain-warped fbm noise with soft
// edges, normally blended (not additive) so it can darken as well as glow:
// dark brown bodies, warm back-lit edges. Motion is a slow upward drift with a
// gentle lateral sway; no particles, no swirl.
//
// Word: a huge NOIRÉ far behind the bottle, rasterised small and blurred in
// the shader, so it reads as atmosphere, never as UI.

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + 7.3; a *= 0.5; } return v; }
`;

const smokeShader = {
  uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSeed: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform float uTime; uniform float uAmount; uniform float uSeed;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      float t = uTime * 0.012;
      vec2 p = vUv * vec2(2.4, 1.5) + uSeed;
      // domain warp: two slow fields bend the third -> long, elegant curls
      vec2 w = vec2(fbm(p + vec2(0.0, -t)), fbm(p + vec2(5.2, -t * 1.3)));
      float n = fbm(p + 1.6 * w + vec2(sin(t * 2.0) * 0.15, -t * 1.6));
      float body = smoothstep(0.42, 0.82, n);
      float edge = smoothstep(0.0, 0.28, vUv.x) * smoothstep(1.0, 0.72, vUv.x)
                 * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.62, vUv.y);
      // back-lit from upper left: the thin parts of each curl catch warm light
      float lit = smoothstep(0.42, 0.62, n) * (1.0 - smoothstep(0.62, 0.86, n)) * (0.55 + 0.45 * (1.0 - vUv.x) * vUv.y);
      vec3 dark = vec3(0.030, 0.019, 0.012);
      vec3 warm = vec3(0.30, 0.18, 0.095);
      vec3 col = mix(dark, warm, lit);
      gl_FragColor = vec4(col, body * edge * uAmount);
    }`,
};

const beamShader = {
  uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
  vertexShader: smokeShader.vertexShader,
  fragmentShader: /* glsl */ `
    uniform float uTime; uniform float uAmount;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      // soft wedge, widest at the bottom, modulated by slow noise (dust in light)
      float width = mix(0.18, 0.5, 1.0 - vUv.y);
      float x = abs(vUv.x - 0.5) / width;
      float wedge = (1.0 - smoothstep(0.2, 1.0, x)) * smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
      float n = fbm(vUv * vec2(3.0, 6.0) + vec2(0.0, -uTime * 0.02));
      gl_FragColor = vec4(vec3(1.0, 0.78, 0.52) * wedge * (0.6 + 0.4 * n) * uAmount, 1.0);
    }`,
};

const wordShader = {
  uniforms: { uMap: { value: null }, uAmount: { value: 0 } },
  vertexShader: smokeShader.vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D uMap; uniform float uAmount;
    varying vec2 vUv;
    void main() {
      // gaussian-weighted disc blur (3 rings × 8 taps, golden-angle offset per
      // ring) over a low-res raster: one soft shape, never a doubled image
      vec2 r = vec2(0.016, 0.05);
      float a = texture2D(uMap, vUv).r;
      float wsum = 1.0;
      for (int ring = 1; ring <= 3; ring++) {
        float rr = float(ring) / 3.0;
        float w = exp(-rr * rr * 2.0);
        for (int i = 0; i < 8; i++) {
          float ang = float(i) * 0.7854 + float(ring) * 2.3999;
          a += texture2D(uMap, vUv + vec2(cos(ang), sin(ang)) * r * rr).r * w;
          wsum += w;
        }
      }
      a /= wsum;
      gl_FragColor = vec4(vec3(0.86, 0.72, 0.54), a * uAmount);
    }`,
};

const SMOKE_LAYERS = [
  { position: [0.15, 0.75, -1.1], scale: [4.8, 3.2, 1], seed: 1.3, weight: 0.55 },
  { position: [0, -0.1, 0.9], scale: [4.6, 1.5, 1], seed: 9.4, weight: 0.95 }, // veils the plinth: the bottle floats
  { position: [-0.2, 1.1, -2.4], scale: [9, 5.5, 1], seed: 5.1, weight: 0.5 },
  { position: [-0.85, 0.55, 0.55], scale: [2.2, 2.6, 1], seed: 13.7, weight: 0.32 },
];

function createWordTexture() {
  const c = document.createElement('canvas');
  // generous black margin on every side: the blur taps reach past the glyphs
  // and must never sample a clamped, lit edge pixel
  c.width = 320;
  c.height = 128;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  const draw = () => {
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 59px "Bodoni Moda Variable", "Bodoni Moda", Didot, serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '5px';
    ctx.fillText('NOIRÉ', c.width / 2 + 2.5, c.height * 0.56);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('400 64px "Bodoni Moda Variable"').then(draw).catch(() => {});
  return tex;
}

export default function Atmosphere({ tier }) {
  const layers = useMemo(() => SMOKE_LAYERS.slice(0, tier.smokeLayers), [tier.smokeLayers]);
  const smokeMats = useMemo(
    () =>
      layers.map((l) => {
        const m = new THREE.ShaderMaterial({ ...smokeShader, uniforms: THREE.UniformsUtils.clone(smokeShader.uniforms), transparent: true, depthWrite: false });
        m.uniforms.uSeed.value = l.seed;
        return m;
      }),
    [layers],
  );
  const beam = useMemo(
    () => new THREE.ShaderMaterial({ ...beamShader, uniforms: THREE.UniformsUtils.clone(beamShader.uniforms), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const word = useMemo(() => {
    const m = new THREE.ShaderMaterial({ ...wordShader, uniforms: THREE.UniformsUtils.clone(wordShader.uniforms), transparent: true, depthWrite: false });
    m.uniforms.uMap.value = createWordTexture();
    return m;
  }, []);
  useEffect(() => () => [...smokeMats, beam, word].forEach((m) => m.dispose()), [smokeMats, beam, word]);

  // the word spans the frame: wide on desktop, narrower on a portrait phone
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.85;
  const wordW = portrait ? 2.1 : 5.4;
  // sits on the Scene 7 camera axis, 2.2u behind the bottle, facing the lens
  const yaw = useMemo(() => computeLayout(size.width, size.height).breatheYaw, [size.width, size.height]);
  const wordPos = useMemo(() => [-Math.sin(yaw) * 2.2, 0.62, -Math.cos(yaw) * 2.2], [yaw]);

  const smokeRefs = useRef([]);
  const beamRef = useRef();
  const wordRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    smokeMats.forEach((m, i) => {
      const amount = stage.smoke * layers[i].weight;
      m.uniforms.uTime.value = t;
      m.uniforms.uAmount.value = amount;
      // skip the fill-rate cost entirely while the scene does not need smoke
      if (smokeRefs.current[i]) smokeRefs.current[i].visible = amount > 0.002;
    });
    beam.uniforms.uTime.value = t;
    beam.uniforms.uAmount.value = stage.smoke * 0.06;
    beamRef.current.visible = stage.smoke > 0.002;
    word.uniforms.uAmount.value = stage.word * 0.075;
    wordRef.current.visible = stage.word > 0.002;
  });

  return (
    <group>
      {/* huge, out-of-focus NOIRÉ far behind the bottle */}
      <mesh ref={wordRef} position={wordPos} rotation-y={yaw} scale={[wordW * 1.25, wordW * 1.25 * (128 / 320), 1]} material={word} renderOrder={-5} visible={false}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* soft volumetric shaft from upper right, behind the bottle */}
      <mesh ref={beamRef} position={[0.75, 1.35, -1.5]} rotation-z={0.42} scale={[1.3, 4.6, 1]} material={beam} visible={false}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {smokeMats.map((m, i) => (
        <mesh key={i} ref={(el) => (smokeRefs.current[i] = el)} position={layers[i].position} scale={layers[i].scale} material={m} visible={false}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
