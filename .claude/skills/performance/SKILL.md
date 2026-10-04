---
name: performance
description: Performance engineering for cinematic WebGL product sites — frame budget targets, adaptive DPR, GLB compression (gltf-transform, Draco/Meshopt), KTX2/texture limits, lazy loading and code splitting, preloading critical assets, GPU resource disposal, draw calls and instancing, mobile GPU constraints, profiling, loading strategy, and never trading usability for effects. Use whenever adding assets or effects, or when the experience is slow, janky or heavy.
---

# PERFORMANCE — Smooth is part of premium

## Purpose

A product film that stutters is not premium. The goal is a steady frame
rate on modern laptops and phones, a fast first frame, and a site that stays
usable even when the GPU struggles, without stripping the visual identity.

## When to use

- Before adding any asset, light, post effect or atmosphere layer.
- When frames drop, loading is slow, or the bundle grows.
- When preparing a release (audit pass).

## Implementation principles

1. **Budget the frame.** Target 60 fps on desktop, 30–60 on phones. Fill rate
   (pixels × shader cost) is almost always the limit for a single-product
   scene, not triangles.
2. **Scale quality, never content.** Tiers drop transmission, reflectors,
   bloom, DOF, haze/smoke layers and DPR. They never drop the product,
   the copy or navigation.
3. **Ship only what renders.** Prepare assets offline; nothing unused in
   `public/`.
4. **No React work per frame.** Motion lives in plain objects read by
   `useFrame`.
5. **Wall-clock time.** A slow device drops frames; it doesn't slow the film
   or withhold the UI (`gsap.ticker.lagSmoothing(0)`, a real-time unlock
   fallback).

## Technical rules

### Adaptive quality
```js
// quality.js: decided once at boot
const coarse = matchMedia('(pointer: coarse)').matches;
const small = Math.min(innerWidth, innerHeight) < 700;
const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
tier = coarse || small || lowMemory ? 'low' : 'high';
TIERS = {
  high: { maxDpr: 1.75, transmission: true,  reflector: true,  hazeLayers: 4, smokeLayers: 4, bloom: true,  dof: true },
  low:  { maxDpr: 1.35, transmission: false, reflector: false, hazeLayers: 2, smokeLayers: 2, bloom: false, dof: false },
};
```
- Runtime DPR adaptation with drei `<PerformanceMonitor onDecline/onIncline>`
  stepping DPR by 0.25 between 1 and `maxDpr`.
- Decide tier-dependent material and light counts at mount. Toggling at
  runtime recompiles programs.

### Assets
- Model prep with `@gltf-transform` (`scripts/prepare-bottle.mjs`): split
  and rename meshes, remove unused maps, duplicate UV sets and tangents
  that are recomputed at load, then `dedup()` and
  `prune({ keepAttributes: true })`. Result here: 25 MB source → 368 KB GLB.
- Draco: worthwhile above ~50k triangles. Meshopt: decodes faster, good
  for mid-size meshes, and works with `useGLTF` defaults. Below ~10k
  triangles, skip both.
- Textures: max 2048² desktop, 1024² mobile. Use KTX2/Basis (UASTC for
  normals, ETC1S for colour) when textures are needed, and WebP otherwise.
  Prefer procedural or material-authored looks over textures.
- Fonts: self-host variable fonts (`@fontsource-variable/*`), subset to
  needed scripts.
- Keep source assets outside `public/` (`assets-src/`).

### Loading strategy
- `<link rel="preload" as="fetch" crossorigin>` for the GLB, plus
  `useGLTF.preload(url)`.
- Loading screen driven by real progress (drei `useProgress`): wordmark plus
  hairline, dissolving into the first frame.
- Precompile shaders (`gl.compileAsync(scene, camera)`) and wait two rAFs
  before starting the intro, so the first animated frame doesn't hitch.
- `history.scrollRestoration = 'manual'` so a refresh starts at the
  composed first shot instead of mid-journey with half-built state.

### Code splitting
```js
// vite.config.js (rolldown)
build: { chunkSizeWarningLimit: 1500, rolldownOptions: { output: { codeSplitting: { groups: [
  { name: 'three', test: /node_modules[\\/](three|three-stdlib|three-mesh-bvh|postprocessing|@react-three)[\\/]/ },
  { name: 'vendor', test: /node_modules[\\/]/ },
] } } } }
```
The engine chunk is long-lived and cacheable; app code ships separately
(~18 KB gzipped here). Lazy-load non-critical UI (dialogs) only if they're
heavy.

### GPU work per frame
- Hide zero-amount meshes (`visible = amount > 0.002`).
- Transmission: hero object only, and off on the low tier.
- Reflector (`MeshReflectorMaterial`): small surfaces only, low resolution
  (512), off on the low tier.
- Post effects: see `postprocessing`. Mount DOF only during macro shots.
- Draw calls: a product scene has few. Merge static decorative geometry and
  use `InstancedMesh` for repeated objects (e.g. many bottles in a
  lineup), never hundreds of meshes.
- No per-frame allocations in `useFrame` (reuse vectors). No `setState`
  per frame.

### Disposal
Dispose created geometries, materials, textures and render targets on
unmount. Kill GSAP timelines and ScrollTriggers. Never call `dispose()` on
assets still cached by `useGLTF` (clone first).

### Profiling
- Chrome Performance panel (frame breakdown), the WebGL inspector (Spector.js)
  for draw calls and passes, and `renderer.info` for programs, geometries
  and textures.
- Test the heaviest shot (macro: transmission plus DOF plus bloom), fast
  scroll through the whole film, and a mid-range phone.
- Headless SwiftShader is useful for correctness and composition only. Its
  fps (~1) says nothing about real devices.

## Common mistakes to avoid

- Shipping source models or 4K textures; leaving unused maps in the GLB.
- Pruning UVs that materials still need (anisotropy).
- Per-frame React state, per-frame object allocation.
- Toggling `light.visible` / material defines at runtime (shader recompiles).
- Blocking scroll on the intro without a real-time fallback.
- Treating headless fps as real performance.
- Dropping the product on mobile instead of dropping effects.

## Performance considerations (this repo)

Measured build (gzip): app ≈ 18 KB, vendor ≈ 110 KB, three/R3F/post ≈ 420 KB,
GLB 368 KB, fonts ≈ 100 KB for the latin subsets used. About 12 area lights on
physical materials is the main per-pixel cost after transmission. Smoke and
veil layers run only in Scenes 7–8.

## Practical patterns in this repository

- Tiers: `src/three/quality.js`. DPR monitor and ready signal:
  `src/three/Experience.jsx`.
- Model pipeline: `scripts/prepare-bottle.mjs` (`npm run prepare:model`).
- Chunking: `vite.config.js`. Loader: `src/components/Loader.jsx`.
- Visibility culling of atmosphere: `src/three/Atmosphere.jsx`, `Stage.jsx`.

Before merging an effect, answer: what does it cost at the heaviest
shot, what does the low tier do instead, and is it hidden when unused?
