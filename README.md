# NOIRÉ — Signature 01

An interactive fragrance film with a website built inside it: one persistent
WebGL camera travels through nine scenes as you scroll, around a real-time 3D
bottle of smoked black crystal and champagne gold.

```
npm install
npm run dev          # local development
npm run build        # production build -> dist/
npm run preview      # serve the production build
npm run lint
npm run prepare:model  # regenerate public/models/noire-bottle.glb from assets-src/
```

## The journey

| # | Scene | What happens |
|---|---|---|
| 1 | The stage | Time-based reveal led by light: silhouette, lamp, warm sweep, rims, material, plinth and dolly, then the NOIRÉ engraving last |
| 2 | Colour flood | Camera drops lower and closer; warm amber spreads out from the plinth across the studio |
| 3 | Top notes | Bottle turns +35°; a light scan travels down the stopper, collar and shoulder; each note lights in step |
| 4 | Heart notes | A further +35°; the camera arcs, the room deepens to red-brown, a low warm side light takes over |
| 5 | Base notes | Heavier and lower; amber, musk, sandalwood and vanilla each get their own light state |
| 6 | Macro | Camera travels to the stopper and collar; rack focus (desktop) and a gold sweep |
| 7 | Smoke | Camera breathes out; slow smoke, softened highlights, a huge out-of-focus NOIRÉ |
| 8 | Signature 360 | A clean studio; the visitor can drag to turn the bottle (soft inertia) |
| 9 | Finale | Bookends Scene 1's framing; front 3/4 hero angle, richest light, CTA |

## Architecture

- **One director's sheet** (`src/motion/stage.js`): a plain mutable object of
  abstract values (camera blends, bottle turns, light levels, atmosphere). GSAP
  writes it; the R3F frame loop reads it. No React state changes per frame.
- **One camera** (`src/three/CameraRig.jsx`): turns `stage` into a pose through
  a chain of blends, each starting from wherever the camera already is, followed
  by time-based damping. Off-centre framing uses a projection shift
  (`setViewOffset`), so the bottle never keystones.
- **One scroll timeline** (`src/motion/journeyTimeline.js`): a single pinned
  ScrollTrigger scrubs Scenes 2–9 (17.1 viewport heights). Scenes cannot reset
  because they share one timeline and one set of values.
- **Intro** (`src/motion/introTimeline.js`): Scene 1 is time-based and plays
  before scrolling unlocks.
- **Navigation** (`src/motion/navigation.js`): links travel the camera to named
  states along the timeline instead of jumping.

## 3D model

`assets-src/bottle/` holds the untouched source model. `scripts/prepare-bottle.mjs`
splits the fused collar from the body (at an empty band in the vertex profile),
names the parts Body / Collar / Stopper, and drops every texture and the
duplicate UV sets. The output is a 368 KB GLB, down from 25 MB of source. At load,
`src/three/Bottle.jsx` rebuilds crease-aware normals (the source is fully
flat-shaded), assigns the NOIRÉ materials and injects the gold-foil engraving
into the glass shader. No extra geometry is added.

## Quality tiers

`src/three/quality.js` picks `high` (desktop) or `low` (touch, small screens,
low memory). Low drops transmission, bloom, depth of field, the reflective
plinth, and half of the haze and smoke layers, and caps DPR at 1.35.
`PerformanceMonitor` adapts DPR at runtime on both tiers.

## Credits

This work is based on ["perfume bottle"](https://sketchfab.com/3d-models/perfume-bottle-2318f02b3bfb4587bc6e50ea768b4e77)
by [milaha](https://sketchfab.com/elenakozlova479), licensed under
[CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Modified: materials
re-authored, collar separated, normals rebuilt, engraving added, textures
removed. The attribution is also available on the site under **Credits** in the
footer, and in `public/models/LICENSE-bottle.txt`.

Typefaces: Bodoni Moda and Inter (SIL Open Font License). NOIRÉ is a fictional brand.
