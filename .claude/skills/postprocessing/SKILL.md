---
name: postprocessing
description: Restrained cinematic post-processing for WebGL product films with @react-three/postprocessing — EffectComposer setup, subtle threshold bloom, depth of field and rack focus, tone mapping and exposure, anti-aliasing (MSAA vs DOF), vignette and grading concepts, desktop/mobile quality levels and GPU cost control. Use whenever adding, removing or tuning post effects.
---

# POSTPROCESSING — Lens, not filter

## Purpose

Post effects should behave like a real lens and film stock: speculars that
softly bloom, focus that racks during a macro shot, a gentle tonal roll-off.
They must never become the look. A luxury product loses credibility the
moment the post stack is noticeable.

## When to use

- Adding or tuning bloom, depth of field, tone mapping, vignette or grading.
- Diagnosing GPU cost, banding, aliasing or WebGL warnings around effects.
- Defining quality tiers for post effects.

## Implementation principles

1. **Minimal stack.** Bloom (threshold) and tone mapping on desktop. Depth
   of field only during the shots that need it. Vignette and grain can live
   in CSS overlays at near-zero GPU cost.
2. **Effects are scene-scoped.** Mount expensive effects only while a scene
   needs them (DOF in the macro), driven by `stage` values.
3. **HDR first, tone map last.** Bloom thresholds operate on linear HDR
   values before tone mapping; `ToneMapping` is the last effect.
4. **Mobile gets no composer** unless measured safe. The renderer's own tone
   mapping keeps colour consistent.

## Technical rules

### Composer
```jsx
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

<EffectComposer key={dofOn ? 'dof' : 'msaa'} multisampling={dofOn ? 0 : 4}>
  {dofOn ? <DepthOfField ref={dofRef} target={focus} worldFocusRange={0.16} bokehScale={0} resolutionScale={0.5} /> : <></>}
  <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={0.24} radius={0.55} />
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
</EffectComposer>
```
- **MSAA and depth of field don't mix on every driver.** DOF needs a depth
  texture, and blitting depth out of a multisampled buffer can raise
  `GL_INVALID_OPERATION: glBlitFramebuffer: Depth/stencil buffer format
  combination not allowed`. Disable multisampling while DOF is mounted
  (rebuild the composer with a different `key`).
- Mounting or unmounting an effect rebuilds the passes (one hitch).
  Toggle at scene boundaries only, from a `useFrame` check that calls
  `setState` only when the boolean actually changes.

### Bloom
- `luminanceThreshold` ≈ 1.0 (only HDR speculars), `intensity` 0.2–0.35,
  `mipmapBlur`. If large areas bloom, the lights are too strong.
- Selective bloom (layers/selection) is rarely needed. A high threshold is
  cheaper and more natural.
- Never bloom point-light pinpoints into stars; fix the lighting
  (see `product-lighting`).

### Depth of field and rack focus
- Use a world-space `target` (a `Vector3` you update each frame) rather than
  normalised focus distance. Compute focus points on the product's surface
  toward the camera:
  `focus = (dir.x * r, y, dir.z * r)` with `dir` the camera's horizontal
  direction and `r` the radius of the feature (stopper 0.12, collar 0.17,
  glass edge 0.25 in bottle units).
- Rack focus = interpolate between focus points with a GSAP-driven value
  (`stage.rack` 0 → 1 → 2) and ease each rack (`power2.inOut`, ~0.3 of scroll).
- `bokehScale` from `stage.dof * 3.2`; `resolutionScale: 0.5` halves its cost.
- Keep DOF to macro moments. Blurring wide shots looks like a mistake.

### Tone mapping and exposure
- ACES Filmic, exposure ≈ 1.05 on the renderer. With a composer, the
  `ToneMapping` effect replaces renderer tone mapping. Compare both tiers
  side by side, since they must match.
- Adjust lights, not exposure, when a frame is too bright.

### Anti-aliasing
- Desktop: MSAA ×4 in the composer (except while DOF runs) plus DPR up to
  1.75. Facet-heavy products shimmer at DPR 1, so check aliasing in motion.
- Low tier: renderer `antialias: true`, DPR ≤ 1.35, no composer.
- SMAA/FXAA blur fine facets. Prefer MSAA plus DPR.

### Vignette, grain, grading
- Vignette as a CSS radial gradient overlay (`pointer-events: none`) is free
  and composes with the DOM.
- Film grain as a static SVG `feTurbulence` overlay at ~7% opacity with
  `mix-blend-mode: overlay` gives texture without GPU cost.
- Grade in the scene (light colour, backdrop hue shifts) rather than a LUT.
  Keep shadows warm-neutral, never crushed blue.

## Common mistakes to avoid

- Bloom thresholds below 1 (the whole frame glows).
- DOF active on every scene, or animated focus without a reason.
- MSAA plus DOF on the same composer (driver errors, broken depth).
- Chromatic aberration, glitch, heavy grain or LUT looks on luxury products.
- Forgetting tone mapping in the composer (washed or clipped colours).
- Mounting/unmounting effects every frame.

## Performance considerations

- Each effect is at least one full-screen pass. DOF is several (CoC, blur,
  composite); `resolutionScale: 0.5` matters.
- `mipmapBlur` bloom is efficient. Avoid large kernel sizes.
- Transmission plus reflector plus DOF plus bloom in one frame is the peak
  cost (the macro shot). Profile there.
- On mobile, skip the composer entirely.

## Practical patterns in this repository

- `Effects` component and `FOCUS_POINTS` in `src/three/Experience.jsx`.
- Quality flags `bloom`, `dof` in `src/three/quality.js`.
- DOF and rack values are scheduled in `src/motion/journeyTimeline.js`
  (macro scene); vignette and grain are in `src/styles.css`
  (`.vignette`, `.grain`).

When adding an effect, gate it by tier, scope it to the scenes that need it,
and verify there are no console warnings at the scene boundary where it
mounts.
