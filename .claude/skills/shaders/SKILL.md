---
name: shaders
description: GLSL for premium product websites — vertex/fragment fundamentals, onBeforeCompile material injection, procedural gradients and backdrops, noise and fbm, domain-warped smoke, light shafts, masks and reveal shaders, restrained distortion, dithering, and performance rules. Use whenever writing or modifying custom shaders, ShaderMaterials or injected material code.
---

# SHADERS — Atmosphere and material detail, never gimmicks

## Purpose

Custom shaders give a product film what stock materials can't: a studio
wall that glows exactly behind the product, light that floods outward,
smoke that curls slowly, a brand mark inlaid in glass, a wordmark softly out
of focus. In luxury work, shaders must be invisible as technique. The
viewer should see light and air, not effects.

## When to use

- Backdrops, gradients, halos, colour floods.
- Atmosphere: haze, smoke, light shafts, dust in light.
- Injecting details into PBR materials (engraving, masks, scan bands).
- Reveal/transition masks driven by animated uniforms.
- Any `ShaderMaterial`, `onBeforeCompile` or postprocessing effect code.

## Implementation principles

1. **Uniforms are the only interface.** Shaders read uniforms; GSAP animates
   values on `stage`; `useFrame` copies them into uniforms. No per-frame
   material recreation.
2. **Physical metaphors.** A colour flood is a light front expanding from a
   source with a soft leading edge. Smoke is back-lit density. A reveal is
   light arriving, not a wipe.
3. **Inject, don't replace, PBR.** For product materials use
   `onBeforeCompile` to extend `MeshPhysicalMaterial` (keeping its lighting,
   environment and clearcoat), rather than rewriting lighting in a
   ShaderMaterial.
4. **Restraint.** Low amplitudes, slow time scales (0.01–0.03 × time),
   desaturated warm tints. If you notice the effect, it is too strong.

## Technical rules

### Fundamentals
- Vertex shader: pass what the fragment needs (`vUv`, world or local
  position, view-facing terms). Use `modelViewMatrix`/`projectionMatrix`
  for meshes that move.
- Fragment shader: end with `#include <colorspace_fragment>` (and
  `#include <tonemapping_fragment>` if the renderer, not the composer, tone
  maps) so custom colours match PBR output.
- `transparent: true, depthWrite: false` for atmosphere sheets.
  `blending: AdditiveBlending` only for light (shafts, glows).
  Smoke that should darken needs normal blending.
- Hide meshes whose uniform amount is ~0 (`mesh.visible = amount > 0.002`).

### Injecting into MeshPhysicalMaterial (engraving / masks)
```js
material.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, uniforms);  // shared uniform objects
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <color_fragment>', `#include <color_fragment>
      float mark = /* mask from cylindrical coords: atan(vLocal.x, vLocal.z), height */;
      diffuseColor.rgb = mix(diffuseColor.rgb, uGold, mark);`)
    .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, mark);')
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.3, mark);');
};
material.customProgramCacheKey = () => 'unique-key';
```
- Chunks referenced via `#include` are not expanded yet. To modify code
  inside a chunk (e.g. `transmission_fragment`), replace the include with
  `THREE.ShaderChunk.transmission_fragment.replace(…)`.
- Work in the mesh's local space after baking transforms, so masks stick
  to the object as it rotates.
- Anti-alias procedural lines with `fwidth()`.

### Procedural backdrop pattern
```glsl
vec3 col = vec3(0.010, 0.009, 0.008);                            // near-black base
vec2 q = (pos - vec2(0.0, 0.75)) * vec2(0.55, 0.5);
col += vec3(0.060, 0.040, 0.024) * exp(-dot(q, q) * 2.2) * uLamp; // tight halo behind the product
// colour flood: a front expanding from a source, soft edge, faint leading band
float r = length((pos - origin) * vec2(0.62, 1.0));
float front = mix(-1.0, 9.0, uFlood);
float inside = 1.0 - smoothstep(front - 2.6, front, r);
col = mix(col, max(col, floodColour(r)), inside);
col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;     // dither: kills banding
```
- Gaussian falloffs (`exp(-d²)`) read as light. Linear ramps read as UI
  gradients.
- Always dither dark gradients; 8-bit banding is very visible on near-black.
- If the camera orbits, author the backdrop in its own plane space and turn
  the plane with the camera, so the pools stay behind the product.

### Noise and smoke
```glsl
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.02+7.3; a*=.5; } return v; }
vec2 w = vec2(fbm(p + vec2(0., -t)), fbm(p + vec2(5.2, -t*1.3)));   // domain warp
float n = fbm(p + 1.6*w + vec2(sin(t*2.)*.15, -t*1.6));
float body = smoothstep(uThresh, uThresh + .4, n);
float lit  = smoothstep(uThresh, uThresh+.2, n) * (1. - smoothstep(uThresh+.2, uThresh+.44, n)); // thin parts catch backlight
gl_FragColor = vec4(mix(uBody, warm, lit), body * edgeMask * uAmount);
```
- 4 octaves are enough; 5+ is wasted on soft smoke.
- Smoke between the camera and a black product must be LIGHTER than the
  product (lit haze), or it's invisible over it.
- Soft edges on every sheet (`smoothstep` on `vUv`): a visible quad edge
  ruins the illusion.
- Time scale ~0.012: elegant, never "swirling".

### Light shafts / volumetric hints
Fresnel-faded cone (`pow(abs(dot(n, viewDir)), 3.0)`), or a soft wedge plane
modulated by slow fbm, additive, amount ≤ 0.06. Ray-marched volumetrics are
rarely worth the cost on the web.

### Blurred typography in 3D
Rasterise the word small (e.g. 320×128) with a generous black margin,
then sample with a gaussian-weighted disc (3 rings × 8 taps). The margin
matters: blur taps that reach a clamped edge pixel produce hard bands.

### Reveals and masks
Drive masks with a single uniform (0..1) eased by GSAP. Prefer light-like
reveals (luminance arriving through a soft front) over geometric wipes.

## Common mistakes to avoid

- Additive smoke (it can only brighten; it looks like fog-machine glow).
- Ring blurs with few taps (doubled, "ghosted" images instead of defocus).
- Fast noise time scales; high-contrast noise; neon tints.
- Visible quad edges on atmosphere planes.
- Undithered dark gradients (banding).
- Rewriting PBR lighting by hand instead of injecting.
- Reading uniforms that are never updated (stale values after refactors).
- Distortion/RGB-split effects on a luxury product (cheap, "glitch" aesthetic).

## Performance considerations

- Fill rate dominates: large full-screen transparent planes running fbm are
  the most expensive objects in the scene. Limit layers (4 desktop, 2 mobile)
  and hide them when their amount is zero.
- Prefer `exp`/`smoothstep` math over texture lookups for gradients.
- Avoid branching on per-pixel conditions in hot loops; use `step`/`mix`.
- Each `onBeforeCompile` variant is a separate program: compile up front
  (`gl.compileAsync`) to avoid hitches.

## Practical patterns in this repository

- Engraving and transmission override: `addBrandMark` in `src/three/Bottle.jsx`.
- Backdrop (halo, flood, hue/wood shifts, base glow, dim), haze sheets and
  lamp cone: `src/three/Stage.jsx`.
- Smoke, veil (camera-axis sheets), light shaft and blurred word:
  `src/three/Atmosphere.jsx`.

New effect checklist: one uniform per controllable quantity, defaults that
are invisible, driven only from `stage`, softened edges, dithered
gradients, visible only when needed, and checked on a dark product at
1× DPR.
