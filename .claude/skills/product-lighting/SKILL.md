---
name: product-lighting
description: Luxury product lighting in real-time 3D — black glass and smoked crystal readability, champagne gold, key/fill/rim setups built from area lights and Lightformer environments, edge highlights, dark-background separation, light scans and sequential light choreography, controlled bloom, and avoiding flat lighting or blown highlights. Use whenever lighting, reflections or the look of materials under light are created or changed.
---

# PRODUCT LIGHTING — Light is the storyteller

## Purpose

Make a dark, reflective luxury product read as a photographed object in a
dark studio: sculpted by rims and shaped reflections, mostly in shadow, with
selective highlights. In the film, light also does narrative work. It
reveals the product in sequence, scans the exact region a chapter talks
about, and shifts the room's mood.

## When to use

- Setting up or changing any light, the environment, or exposure.
- A material looks flat, plastic, CG or blown out.
- Building reveals, light scans, chapter moods or transitions.
- Adjusting bloom or background separation.

## Implementation principles

1. **Black glass shows only what it reflects.** Its quality is the quality of
   its environment. Design the reflections (strips, discs, softboxes)
   like a product photographer's set.
2. **Area lights and Lightformers, not points.** Point and spot lights print
   pinpoint highlights on polished glass, the classic CG giveaway, and
   bloom turns them into stars. Use `RectAreaLight` and environment
   `Lightformer`s, which reflect as softbox shapes.
3. **Keep ~80% of the product in controlled shadow.** Light selectively:
   silhouette edges, a few facet rows, the gold, the label. Flat front
   light kills luxury.
4. **Separation without brightness.** A dark product on a dark background
   needs rims, a tight warm halo on the wall behind it, and slight haze, not
   a lighter background.
5. **Light reveals in sequence.** Silhouette → overhead → rims → material →
   gold → label, each beat in its own window. Never reveal by opacity.
6. **Light scans are physical.** A narrow strip travels across the exact
   region being discussed (stopper, label band, base), positioned in the
   camera's frame so it always crosses what's on screen.

## Technical rules

### The studio (copy and tune)
```jsx
RectAreaLightUniformsLib.init(); // once
<Environment resolution={256} frames={1}>
  <Lightformer form="circle" intensity={1.5} color="#ffe6c8" position={[0,5,0.5]} rotation-x={Math.PI/2} scale={2.4} />  {/* overhead disc */}
  <Lightformer form="rect" intensity={2.1} color="#efcf9f" position={[-4,1.2,-1.6]} rotation-y={Math.PI/2.6} scale={[0.5,7,1]} /> {/* warm strip L */}
  <Lightformer form="rect" intensity={1.4} color="#fff1e2" position={[4.2,1.4,-1.2]} rotation-y={-Math.PI/2.4} scale={[0.35,7,1]} /> {/* cool strip R */}
  <Lightformer form="rect" intensity={2.8} color="#e9c592" position={[-2.6,1,-3.4]} rotation-y={Math.PI/5} scale={[0.18,6,1]} /> {/* grazing rim lines */}
  <Lightformer form="rect" intensity={0.26} color="#f2dfc4" position={[0,0.8,5]} scale={[7,3.2,1]} />  {/* broad DIM front */}
</Environment>
```
- **Broad, dim front source.** Black glass (F0 ≈ 0.04) barely shows it,
  while gold foil (F0 ≈ 0.8) does. That ratio is what makes an engraved
  brand mark readable without glowing.
- Area lights: overhead key (softbox), two rim strips behind the product,
  a large dim fill high camera-left, a warm plinth bounce facing up.
- Avoid a strong small front area light near the camera: its rectangle
  mirrors on every flat facet and on smooth bands.

### Exposure and tone
- ACES Filmic (or AgX), exposure ≈ 1.0–1.1. Tune lights, not exposure.
- Keep background luminance very low (near-black with warm undertone);
  separation comes from a tight halo behind the product
  (`exp(-d²)` falloff in the backdrop shader), not from a bright wall.
- Bloom only above luminance 1.0 (HDR speculars), intensity ≈ 0.2–0.3.

### Gold and crystal under light
- Gold reads expensive when brushed (anisotropy) and lit by a warm-neutral,
  not orange, key. Lower warm saturation if gold turns brass.
- Smoked crystal (transmission plus dark attenuation) needs something warm
  behind it to refract: the backdrop halo or a low back light (the "amber
  glow through the base" effect).
- A brand mark revealed "last" can use a kicker multiplier that only scales
  the mark's reflected light (`outgoingLight *= mix(1, uMarkLight, mask)`),
  never emission.

### Animated lighting (choreography)
- All intensities are multipliers on a shared state (`stage.lamp`, `stage.rim`,
  `stage.fill`…) times a `MAX` table in `Lighting.jsx`, tweened by GSAP.
- Sequential reveal with overlapping windows, for example:
  lamp 0.40–0.90 s (soft ignition: 0 → 0.3 → 0.18 → 1), rims 0.90–1.40,
  fill + environment 1.40–1.90, plinth 1.90–2.40, label last.
- Scan strips: `RectAreaLight` 1.5 × 0.06 (horizontal) or 0.07 × 0.5
  (vertical), intensity envelope in/out over ~0.15–0.2, position animated
  along the region over ~0.85–1.0 of scroll.
- Camera-relative lights: rotate their local positions by the camera
  azimuth each frame so they stay correct while the camera orbits. Keep the
  studio (lamp, rims, fill, environment) world-fixed so reflections truly
  travel.
- Chapter moods: shift the room's hue (amber → red-brown → woody) and
  which light dominates (top light → low side light → back glow), not
  just the colour of everything.
- Never toggle light visibility (recompiles programs). Animate intensity.

## Common mistakes to avoid

- Point/spot lights on glass (pinpoint highlights, bloom stars).
- Strong front light (flat, plastic, every facet a white triangle).
- Pure-black background with nothing behind the product (the silhouette
  disappears), or a bright gradient background (cheap).
- Orange/yellow gold from a warm env multiplied by a saturated base colour.
- A label made readable by emissive glow.
- Revealing the product by fading opacity.
- Changing only global colour for "different chapters".
- Grazing camera angles over glossy floors without checking for blowouts.
- Over-bloom: everything glowing.

## Performance considerations

- Each `RectAreaLight` adds per-fragment LTC cost on all physical
  materials. This repo uses about 12, which is fine on desktop. If mobile
  struggles, drop the transient choreography lights on the low tier
  (decided once at mount, never toggled).
- Environment maps: render once (`frames={1}`); animate
  `scene.environmentIntensity` instead.
- Bloom with `mipmapBlur` at threshold 1.0 is cheap; selective bloom by
  layers is more expensive. Prefer the threshold.

## Practical patterns in this repository

- Lights + environment + MAX table: `src/three/Lighting.jsx`.
- Engraving material and kicker: `addBrandMark` in `src/three/Bottle.jsx`.
- Backdrop halo, flood, base glow, dim: backdrop shader in `src/three/Stage.jsx`.
- Light choreography: `src/motion/introTimeline.js` (reveal) and
  `src/motion/journeyTimeline.js` (scans, moods).

Debug lighting with three stills per change: start, middle and final. Check
that ~80% of the product stays dark, that highlights are shapes rather than
points, and that the gold reads champagne.
