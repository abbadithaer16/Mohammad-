---
name: threejs-webgl
description: Three.js / React Three Fiber scene architecture for cinematic 3D product websites — GLB loading, PBR and MeshPhysicalMaterial (smoked glass, black crystal, brushed gold), environment maps, renderer configuration, responsive canvas, render loop, disposal and graceful fallback. Use whenever creating or changing the WebGL scene, the product model or its materials.
---

# THREE.JS / WEBGL — Scene architecture for a product film

## Purpose

Render one hero product (here: the NOIRÉ smoked-crystal bottle) in real time
with photographic material quality, inside ONE persistent WebGL canvas that
lives behind the whole page. The canvas is the film set; the DOM is the
typography laid over it. Every scene of the site is a new camera position,
light state and atmosphere in that same set, never a new canvas or a new
image.

## When to use

- Adding or replacing the product model (GLB/GLTF).
- Authoring or tuning materials (glass, crystal, metal, stone).
- Changing renderer settings (tone mapping, color space, DPR, antialiasing).
- Adding scene objects (plinth, backdrop, atmosphere planes).
- Anything touching resize, the render loop, or GPU resource lifetime.
- Pair with `cinematic-camera`, `product-lighting`, `shaders`,
  `postprocessing` and `performance`.

## Implementation principles

1. **One canvas, fixed, full-viewport, behind the DOM.** Mount it once
   (`src/three/Experience.jsx`, `.stage-canvas { position: fixed; inset: 0 }`).
   Never mount a canvas per section: that breaks continuity and multiplies
   GPU cost.
2. **React for structure, refs and plain objects for motion.** Use React Three
   Fiber (R3F) for the scene graph and Suspense loading. Animate by mutating
   objects inside `useFrame` from a shared mutable state (`src/motion/stage.js`).
   Never put per-frame values in React state.
3. **The model is data; materials are authored in code.** Strip identity
   textures from a downloaded model and author NOIRÉ materials in JS, so the
   look is controllable, consistent and light to download.
4. **Physically based everything.** `MeshPhysicalMaterial`, a real
   environment map, ACES (or AgX) tone mapping and sRGB output. Do not fake
   reflections with emissive colour.
5. **The asset is swappable.** Scenes talk to the product only through
   abstract values (`stage.rot`, `stage.mark`…) and named meshes; replacing
   the GLB must not require touching choreography.

## Technical rules

### Renderer
```jsx
<Canvas
  dpr={dpr}                                  // adaptive, capped per tier
  camera={{ fov: 30, near: 0.05, far: 40 }}  // long lens = product photography
  gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
  onCreated={({ gl }) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }}
>
  <color attach="background" args={['#030303']} />
```
- `outputColorSpace` stays `SRGBColorSpace` (R3F default). Colour textures
  get `SRGBColorSpace`; data textures (masks, normals) get `NoColorSpace`.
- Use a narrow FOV (24–35°) for products. Wide lenses distort bottles.
- When an EffectComposer is active, tone mapping moves into the composer
  (`<ToneMapping />` last); see `postprocessing`.

### Loading GLB/GLTF
- Load with drei `useGLTF(url)` inside `<Suspense>`; call
  `useGLTF.preload(url)` at module scope and add
  `<link rel="preload" href="/models/x.glb" as="fetch" crossorigin>` to
  `index.html`.
- Never mutate the cached GLTF scene. Clone geometry and bake the node
  chain into it (`geometry.clone().applyMatrix4(mesh.matrixWorld)`), then
  normalise: in this repo the bottle is 1 unit tall with its base at y = 0.
- **Draco** only pays off for dense meshes (>50k triangles). Under ~10k
  triangles (the NOIRÉ bottle is 4.7k) the decoder download costs more than
  it saves. Meshopt is cheaper to decode; prefer it for medium meshes.
- Offline prep beats runtime fixes: `scripts/prepare-bottle.mjs` uses
  `@gltf-transform` to split fused meshes, rename parts, drop unused maps and
  attributes, and prune. Pass `prune({ keepAttributes: true })` whenever UVs
  are needed without textures (anisotropy derives tangents from UVs).
- Keep the untouched source model outside `public/` (`assets-src/`) so it
  never ships in the build.

### Normals (a common cause of "low-poly" looks)
Downloaded models are often fully flat-shaded. Rebuild crease-aware
normals at load: average face normals under a crease angle (~35°) so
round surfaces go smooth, and keep hard facets cut, optionally softened
slightly toward the averaged normal. See `refineNormals` in
`src/three/Bottle.jsx`. Recompute tangents afterwards.

### Materials (copy these starting points)
```js
// smoked black crystal (high tier: real transmission)
new THREE.MeshPhysicalMaterial({
  color: '#ece4dc', metalness: 0, roughness: 0.045, ior: 1.55,
  transmission: 1, thickness: 0.32,
  attenuationColor: new THREE.Color('#3a271a'), attenuationDistance: 0.11,
  clearcoat: 1, clearcoatRoughness: 0.015, specularIntensity: 1,
});
// opaque black glass (low tier / fallback)
new THREE.MeshPhysicalMaterial({ color: '#060505', roughness: 0.045, clearcoat: 1, clearcoatRoughness: 0.015, ior: 1.55 });
// brushed champagne gold
new THREE.MeshPhysicalMaterial({ color: '#c7b08a', metalness: 1, roughness: 0.34, anisotropy: 0.8, anisotropyRotation: Math.PI / 2 });
```
- Gold must be muted champagne (`#b09a74`–`#c7b08a`), never saturated
  yellow. Metal colour comes from base colour × environment, so a warm env
  plus yellow base gives cheap brass.
- Black glass is defined almost entirely by reflections. It needs an
  environment with shaped highlights (see `product-lighting`).
- Brand marks belong IN the material: inject a mask into the physical
  shader (`onBeforeCompile`) that switches the surface to metal foil under
  the clearcoat. No decals floating on top, no emissive glow.
- Give each customised material a `customProgramCacheKey` so shader
  variants don't collide.

### Environment and reflections
- Build the environment from drei `<Environment frames={1} resolution={256}>`
  with `<Lightformer>` strips and discs composed like a product studio.
  This is cheaper and more art-directable than a generic HDRI.
- Animate overall reflection strength with `scene.environmentIntensity`
  per frame. Re-rendering the cube map every frame is too expensive.

### Resize and responsive framing
- R3F resizes the canvas. Recompute composition from viewport size with a
  pure function (`computeLayout(w, h)` in `src/motion/layout.js`) memoised
  on `size`.
- Off-centre framing uses `camera.setViewOffset` (a projection shift), never
  an off-axis `lookAt`: the product stays perspective-correct.
- Use `100lvh` for the fixed canvas and `100svh` for pinned DOM frames.

### Render loop
- Use R3F's `useFrame((state, delta) => …)`; clamp `delta` (`Math.min(dt, 1/20)`)
  and use `THREE.MathUtils.damp(current, target, lambda, dt)` for
  frame-rate-independent smoothing. Never use per-frame
  `x += (t - x) * 0.08`, which runs at different speeds on 60 and 120 Hz.
- Hide meshes that contribute nothing (`mesh.visible = amount > 0.002`) to
  skip their fill-rate cost.

### Cleanup and disposal
- Dispose geometries, materials and textures you create
  (`useEffect(() => () => { g.dispose(); m.dispose(); }, [...])`).
- Never toggle `light.visible` at runtime: it changes the light count and
  forces every program to recompile (a visible hitch). Set
  `intensity = 0` instead.
- Kill GSAP timelines and ScrollTriggers on unmount (see `gsap-scrolltrigger`).

### Graceful fallback
- Detect WebGL failure (`Canvas onCreated` never firing, or a context-lost
  event) and show a static, art-directed poster of the hero frame plus all
  copy. Content must stay reachable without WebGL.
- Quality tiers (`src/three/quality.js`) are the primary fallback: drop
  transmission, reflectors, bloom and DOF before ever dropping the 3D product.

## Common mistakes to avoid

- Mounting several canvases, or re-mounting the canvas between sections.
- Storing animated values in React state (re-renders every frame).
- Using point/spot lights on polished glass: they print pinpoint CG
  highlights (see `product-lighting`).
- Leaving the source model or 4K textures in `public/`.
- Pruning away UVs, then wondering why anisotropic metal goes black.
- Saturated yellow "gold", pure-black backgrounds with no separation.
- Emissive glow to make a label readable (it should catch light instead).
- `transparent: true` on glass (use `transmission`; `transparent` causes
  sorting artefacts).

## Performance considerations

- Triangle count is rarely the bottleneck for a single product. Fill rate is:
  transmission passes, reflectors, large transparent planes, postprocessing.
- `MeshPhysicalMaterial` with `transmission` renders an extra scene pass;
  keep it to the hero object and disable it on the low tier.
- Every `RectAreaLight` costs per fragment on every physical material. Keep
  the count deliberate.
- Precompile before the first animated frame: `gl.compileAsync(scene, camera)`,
  then wait two rAFs before starting the intro (see `ReadySignal`).

## Practical patterns in this repository

| Concern | File |
|---|---|
| Canvas, tiers, post stack, ready signal | `src/three/Experience.jsx` |
| Model load, normals rebuild, materials, engraving shader | `src/three/Bottle.jsx` |
| Studio environment + area lights | `src/three/Lighting.jsx` |
| Backdrop, plinth, haze | `src/three/Stage.jsx` |
| Smoke, veil, background word | `src/three/Atmosphere.jsx` |
| Offline model prep | `scripts/prepare-bottle.mjs` |
| Shared animated state | `src/motion/stage.js` |

Adding a new animated property: add it to `START` in `stage.js` with a
neutral default (so earlier scenes are unaffected), read it in the relevant
`useFrame`, and drive it only from GSAP timelines.
