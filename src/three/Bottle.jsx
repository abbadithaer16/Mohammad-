import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  stage,
  pointer,
  TURN_START,
  TURN_END,
  TURN2_DELTA,
  TURN3_DELTA,
  TURN4_DELTA,
  TURN5_DELTA,
  TURN6_DELTA,
  TURN7_DELTA,
} from '../motion/stage';

export const BOTTLE_URL = '/models/noire-bottle.glb';

// Measured from the source geometry by scripts/prepare-bottle.mjs (model units,
// before normalisation): the smooth ring between the studded body and shoulder.
const BAND = { y0: 0.1527, y1: 0.2041, radius: 0.1856 };
const MARK_HALF_ARC = 0.62; // radians each side of the front (+Z): ~71° total
const MARK_GOLD = new THREE.Color('#c4a676'); // muted champagne foil, not yellow

// ---------------------------------------------------------------------------
// Engraving artwork: drawn into a canvas whose aspect matches the unrolled
// band area, so letters are not stretched when wrapped around the cylinder.
function createMarkTexture() {
  const arcLength = MARK_HALF_ARC * 2 * BAND.radius;
  const bandHeight = BAND.y1 - BAND.y0;
  const W = 2048;
  const H = Math.round(W / (arcLength / bandHeight));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.round(H * 0.5)}px "Bodoni Moda Variable", "Bodoni Moda", Didot, serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(H * 0.15)}px`;
    // optical centre: Bodoni caps sit slightly high on the em box
    ctx.fillText('NOIRÉ', W / 2 + H * 0.08, H * 0.53);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load(`600 64px "Bodoni Moda Variable"`).then(draw).catch(() => {});
  return tex;
}

// Injects the engraving into the body's physical material: inside the band the
// surface switches to gold foil *under* the glass clearcoat, so it reads as
// inlaid, never as a floating sticker. No emission is added; uMarkLight only
// scales how much of the lit result the foil returns (a label "kicker").
function addBrandMark(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMarkPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMarkPos = position;');

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vMarkPos;
        uniform sampler2D uMarkTex;
        uniform vec3 uBand;      // y0, y1, radius
        uniform float uHalfArc;
        uniform vec3 uGold;
        uniform float uMarkLight;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float bandV = (vMarkPos.y - uBand.x) / (uBand.y - uBand.x);
        float onBand = step(0.0, bandV) * step(bandV, 1.0)
                     * (1.0 - smoothstep(0.0015, 0.004, abs(length(vMarkPos.xz) - uBand.z)));
        float ang = atan(vMarkPos.x, vMarkPos.z);
        float u = ang / (2.0 * uHalfArc) + 0.5;
        float letters = (u > 0.0 && u < 1.0) ? texture2D(uMarkTex, vec2(u, bandV)).r : 0.0;
        // two thin gold rules around the full circumference
        float px = fwidth(bandV) * 1.2;
        float rules = (1.0 - smoothstep(0.0, px + 0.012, abs(bandV - 0.09)))
                    + (1.0 - smoothstep(0.0, px + 0.012, abs(bandV - 0.91)));
        float nMark = clamp(max(letters, rules * 0.9), 0.0, 1.0) * onBand;
        diffuseColor.rgb = mix(diffuseColor.rgb, uGold, nMark);`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, nMark);',
      )
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.3, nMark);',
      )
      // the foil is opaque metal: no light transmits through the letters
      .replace(
        '#include <transmission_fragment>',
        THREE.ShaderChunk.transmission_fragment.replace(
          'material.transmission = transmission;',
          'material.transmission = transmission * (1.0 - nMark);',
        ),
      )
      .replace(
        'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
        `vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
        outgoingLight *= mix(1.0, uMarkLight, nMark);`,
      );
  };
  material.customProgramCacheKey = () => 'noire-body-mark';
}

// ---------------------------------------------------------------------------
// The source model is fully flat-shaded (every vertex carries its face normal,
// even on surfaces meant to be round). Rebuild normals without touching a
// single vertex position:
//   - faces closer than `crease` are averaged -> round surfaces become smooth
//   - harder edges (the stud pyramids) stay cut, but are softened by `soften`
//     towards the fully averaged normal -> polished crystal, not CG triangles
function refineNormals(geometry, { crease = 35, soften = 0.2 } = {}) {
  const pos = geometry.attributes.position;
  const idx = geometry.index.array;
  const count = pos.count;
  const faceSum = new Float32Array(count * 3); // area-weighted face normals per vertex
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let t = 0; t < idx.length; t += 3) {
    const i0 = idx[t];
    const i1 = idx[t + 1];
    const i2 = idx[t + 2];
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1).sub(a);
    c.fromBufferAttribute(pos, i2).sub(a);
    b.cross(c); // length = 2 × area
    for (const i of [i0, i1, i2]) {
      faceSum[i * 3] += b.x;
      faceSum[i * 3 + 1] += b.y;
      faceSum[i * 3 + 2] += b.z;
    }
  }

  const groups = new Map();
  for (let i = 0; i < count; i++) {
    const key = `${Math.round(pos.getX(i) * 1e5)}|${Math.round(pos.getY(i) * 1e5)}|${Math.round(pos.getZ(i) * 1e5)}`;
    (groups.get(key) ?? groups.set(key, []).get(key)).push(i);
  }

  const cosCrease = Math.cos((crease * Math.PI) / 180);
  const out = new Float32Array(count * 3);
  const fi = new THREE.Vector3();
  const fj = new THREE.Vector3();
  const creased = new THREE.Vector3();
  const full = new THREE.Vector3();
  for (const members of groups.values()) {
    full.set(0, 0, 0);
    for (const j of members) full.add(fj.fromArray(faceSum, j * 3));
    full.normalize();
    for (const i of members) {
      fi.fromArray(faceSum, i * 3).normalize();
      creased.set(0, 0, 0);
      for (const j of members) {
        fj.fromArray(faceSum, j * 3);
        if (fi.dot(fj.clone().normalize()) > cosCrease) creased.add(fj);
      }
      creased.normalize().lerp(full, soften).normalize();
      creased.toArray(out, i * 3);
    }
  }
  geometry.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  geometry.deleteAttribute('tangent');
  geometry.computeTangents(); // brushed-gold anisotropy follows the UV tangent
  return geometry;
}

// ---------------------------------------------------------------------------
function createMaterials(tier) {
  // Smoked black crystal. High tier: real transmission with a deep smoke
  // attenuation, so the warm studio light refracts faintly through the cut
  // studs (glass thickness). Low tier: the same look as opaque lacquered glass.
  const glass = {
    roughness: 0.045,
    ior: 1.55,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.015,
  };

  const body = tier.transmission
    ? new THREE.MeshPhysicalMaterial({
        name: 'NOIRE_Body_SmokedCrystal',
        ...glass,
        color: '#ece4dc',
        metalness: 0,
        transmission: 1,
        thickness: 0.32,
        attenuationColor: new THREE.Color('#3a271a'),
        attenuationDistance: 0.11,
      })
    : new THREE.MeshPhysicalMaterial({ name: 'NOIRE_Body_BlackGlass', ...glass, color: '#060505', metalness: 0 });

  // champagne gold, brushed along the circumference (anisotropic highlight)
  const collar = new THREE.MeshPhysicalMaterial({
    name: 'NOIRE_Collar_BrushedChampagne',
    color: '#c7b08a',
    metalness: 1,
    roughness: 0.34,
    anisotropy: 0.8,
    anisotropyRotation: Math.PI / 2,
    specularIntensity: 1,
  });

  const stopper = tier.transmission
    ? new THREE.MeshPhysicalMaterial({
        name: 'NOIRE_Stopper_SmokedCrystal',
        ...glass,
        color: '#ece4dc',
        metalness: 0,
        transmission: 1,
        thickness: 0.16,
        attenuationColor: new THREE.Color('#33231a'),
        attenuationDistance: 0.07,
        dispersion: 0.1,
      })
    : new THREE.MeshPhysicalMaterial({ name: 'NOIRE_Stopper_BlackCrystal', ...glass, color: '#0a0908', metalness: 0 });

  return { body, collar, stopper };
}

// ---------------------------------------------------------------------------
// The NOIRÉ bottle. Owns its materials and exposes a single transform group;
// scenes drive it only through `stage` (turn / idle) and the light rig, so the
// asset itself can be replaced without touching any choreography.
export default function Bottle({ tier }) {
  const { scene } = useGLTF(BOTTLE_URL);
  const turnGroup = useRef();

  const uniforms = useMemo(
    () => ({
      uMarkTex: { value: createMarkTexture() },
      uBand: { value: new THREE.Vector3(BAND.y0, BAND.y1, BAND.radius) },
      uHalfArc: { value: MARK_HALF_ARC },
      uGold: { value: MARK_GOLD.clone().convertSRGBToLinear() },
      uMarkLight: { value: stage.mark },
    }),
    [],
  );

  const { parts, scale, lift } = useMemo(() => {
    scene.updateMatrixWorld(true);
        const meshes = {};
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const name = o.name.replace(/_\d+$/, '');
      // bake the Sketchfab node chain into a private geometry copy (the cached
      // GLTF is never mutated); vertices keep their exact relative positions
      meshes[name] = refineNormals(o.geometry.clone().applyMatrix4(o.matrixWorld), {
        crease: 35,
        soften: name === 'Collar' ? 0 : 0.2,
      });
    });
    const materials = createMaterials(tier);
    addBrandMark(materials.body, uniforms);

    const box = new THREE.Box3();
    Object.values(meshes).forEach((g) => {
      g.computeBoundingBox();
      box.union(g.boundingBox);
    });
    const height = box.max.y - box.min.y;
    return {
      parts: [
        { key: 'Body', geometry: meshes.Body, material: materials.body },
        { key: 'Collar', geometry: meshes.Collar, material: materials.collar },
        { key: 'Stopper', geometry: meshes.Stopper, material: materials.stopper },
      ],
      scale: 1 / height,
      lift: -box.min.y / height,
    };
  }, [scene, tier, uniforms]);

  useEffect(
    () => () => {
      parts.forEach((p) => {
        p.geometry.dispose();
        p.material.dispose();
      });
    },
    [parts],
  );

  useFrame(({ clock }, dtRaw) => {
    uniforms.uMarkLight.value = stage.mark;
    const dt = Math.min(dtRaw, 1 / 20);
    const t = clock.elapsedTime;
    // Scene 1 turn, then +10° (S2), +35° (S3), +35° (S4), +35° (S5), +12° (S6), +10° (S7)
    const base =
      THREE.MathUtils.lerp(TURN_START, TURN_END, stage.turn) +
      TURN2_DELTA * stage.turn2 +
      TURN3_DELTA * stage.turn3 +
      TURN4_DELTA * stage.turn4 +
      TURN5_DELTA * stage.turn5 +
      TURN6_DELTA * stage.turn6 +
      TURN7_DELTA * stage.turn7;
    // breathing drift (±2.2°, 15 s) + pointer response (±2°), both gated by idle
    const drift = Math.sin((t / 15) * Math.PI * 2) * 0.038 + pointer.x * 0.035;
    const target = base + drift * stage.idle;
    const g = turnGroup.current;
    // time-based damping: identical motion at 30, 60 or 120 Hz
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 4.8, dt);
  });

  return (
    <group ref={turnGroup} rotation-y={TURN_START} name="NOIRE_Bottle">
      <group scale={scale} position-y={lift}>
        {parts.map((p) => (
          <mesh key={p.key} name={p.key} geometry={p.geometry} material={p.material} />
        ))}
      </group>
    </group>
  );
}

useGLTF.preload(BOTTLE_URL);
