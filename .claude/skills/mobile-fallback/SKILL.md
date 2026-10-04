---
name: mobile-fallback
description: Mobile adaptation and fallbacks for cinematic WebGL product films — iOS Safari/WebKit and Android GPU limits, viewport units and address bars, touch interaction alongside scroll, portrait camera framing, adaptive DPR, reduced post/atmosphere, simplified lighting, layout pitfalls, and static fallbacks only when WebGL truly cannot run. Use whenever building or testing phone/tablet behaviour or failure modes.
---

# MOBILE & FALLBACK — The same film, re-framed

## Purpose

Phones must get the same story (the same camera journey, the same hero
object, the same chapters), re-composed for a portrait frame and rendered
at a quality the device can sustain. Mobile is not a shrunken desktop and
never a fallback page that hides the product.

## When to use

- Any change that affects layout, framing or interaction on phones/tablets.
- Testing at 390×844, 393×852, 430×932 (and short 375×667).
- WebGL failure handling, iOS/Android-specific bugs.

## Implementation principles

1. **Re-frame, don't shrink.** Portrait gets its own camera keys: centred
   product, a lower framing shift (copy sits above), the camera further
   back, macro further back, and copy at the top with CTAs pinned to the
   bottom.
2. **Same timeline, same beats.** Scroll choreography is shared; only
   composition values and quality differ. Users on phones experience every
   chapter.
3. **Drop effects, keep the object.** Low tier: no transmission (opaque
   black glass), no reflector, no bloom or DOF, half the haze/smoke
   layers, DPR ≤ 1.35. The bottle, its lighting story and the copy remain.
4. **Touch must never fight scroll.** Interactive regions allow vertical
   panning (`touch-action: pan-y`) and only interpret horizontal drags.

## Technical rules

### Viewport (iOS Safari / WebKit)
- Address bars resize `vh`. Use `100lvh` for the fixed canvas (no gaps
  when bars hide), and `100svh` for pinned DOM frames (content always fits).
- `viewport-fit=cover` plus `env(safe-area-inset-*)` paddings for notches
  and home indicators (header, CTAs, footer).
- Avoid `position: fixed` inside transformed ancestors; it breaks on iOS
  and anywhere a transform creates a containing block.
- iOS Safari throttles rAF in low-power mode and when scrolling fast. Rely on
  time-based damping (`MathUtils.damp`) so motion stays correct at 30 fps.

### GPU limits
- Mobile GPUs: limited fill rate, memory pressure (textures ≤ 1024² where
  possible), weaker float render-target support. Avoid MSAA render targets
  and multi-pass post on the low tier.
- WebGL context loss happens (backgrounding, memory). Listen for
  `webglcontextlost`, show the static poster, and let R3F restore on
  `webglcontextrestored`.
- Keep the number of compiled programs low (shader variants multiply on
  low-end devices; compile up front).

### Portrait framing
- `computeLayout` returns `mode: 'portrait'` (aspect < 0.85), with short-phone
  variants (h < 740) that shrink and lower the hero.
- Camera path keys: `r × 1.22` for chapter shots, macro `× 1.5`, far shots
  `× 1.12`, `sx = 0` (centred), `sy` ≈ 0.12–0.2 so the product sits below
  the copy block.
- Big atmosphere elements (the background wordmark) need portrait sizes,
  or they fall outside the frame.
- Check every composition for: the product dominant, no overlap with copy,
  CTAs fully visible, the product never off-screen or cropped incorrectly.

### Touch interaction
```css
.drag-zone { touch-action: pan-y; }   /* vertical swipes still scroll */
```
```js
onPointerDown → setPointerCapture; track dx only; velocity → soft inertia (decay e^-2.6t)
```
- Gate interaction by scene (`html[data-scene='s8'] .drag-zone { pointer-events: auto }`).
- Offer a keyboard path too (arrow keys) for accessibility.
- No hover-only affordances. Make tap targets ≥ 44 px.

### Layout pitfalls found in practice
- Absolutely positioned mobile CTAs anchored to the hero get captured by any
  transformed ancestor. Never animate `transform` on their parent; animate
  sibling wrappers.
- Mobile nav: three short links fit at 390 px with tracking 0.18em and
  font-size 9.5px. Avoid hamburger panels for a three-item nav.
- Long serif headlines: size by `min(vw, vh, max)` and verify the longest
  line at 375 px wide.

### Fallback (only when WebGL genuinely cannot run)
1. Feature-detect WebGL2/WebGL (`canvas.getContext('webgl2') || getContext('webgl')`).
2. If unavailable, or the context fails to create or is lost and not
   restored, render a static, art-directed poster (a pre-rendered hero frame
   of the bottle at the Scene 1 composition, or a short muted loop video),
   with all copy, navigation, shop and credits fully functional.
3. Never show a fallback just because a device is mobile. Mobile gets the
   low tier, not a picture.

### Reduced motion on mobile
Same as desktop: composed stills, snapping between holds, no parallax.
Respect it before any heavy effect.

## Common mistakes to avoid

- Scaling the desktop composition down (tiny product, cramped copy).
- Hiding the 3D product on mobile, or replacing the film with stacked images.
- `100vh` everywhere (jumps when the address bar moves).
- Drag handlers without `touch-action` (blocks page scroll) or with
  `touch-action: none` on large areas.
- Desktop-only DOF/bloom silently left on (thermal throttling, then jank).
- Forgetting safe-area insets (CTAs under the home indicator).
- Atmosphere sized for landscape that disappears in portrait.

## Performance considerations

- Low tier DPR ≤ 1.35; `PerformanceMonitor` may step lower. Phones with
  DPR 3 must never render at 3.
- Transparent full-screen fbm planes are the most expensive thing on phones:
  2 layers maximum, hidden when unused.
- Prefer fewer, larger area lights over many small ones on mobile if frame
  time is high.
- Test on real devices: iPhone (Safari) and a mid-range Android (Chrome).
  Headless results don't reflect thermal or fill-rate limits.

## Practical patterns in this repository

- Mode and Scene 1 framing: `src/motion/layout.js`.
- Portrait/compact camera keys: `buildPath()` in `src/motion/cameraPath.js`.
- Tiers: `src/three/quality.js`; materials per tier: `createMaterials` in
  `src/three/Bottle.jsx`.
- Portrait CSS: the `[data-layout='portrait']` rules in `src/styles.css`.
- Drag-to-turn: `src/components/SignatureCopy.jsx`.

Mobile QA pass: hero, one chapter, macro, smoke, the 360 moment and the
final CTA at 390/393/430 wide. Check for overlaps, clipped CTAs, a missing
product and drag-versus-scroll conflicts.
