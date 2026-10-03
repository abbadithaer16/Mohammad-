# NOIRÉ — Reference Video Analysis & Scene Plan

> Status: **PRE-PRODUCTION. No code written. Awaiting approval.**
> Source: `03c41b99-…dg0dh0.MP4` — 16.2 s, 576×1024 portrait, 30 fps.

---

## 0. What the reference actually is

This is **not** a single film. It is a handheld phone recording of an iMac with someone fast-scrolling through **two separate WebGL sites**, then a 4 s TikTok end card.

| Range | Content | Use for NOIRÉ |
|---|---|---|
| 0.00 – 4.83 s | **Site A**: a Japanese creative studio portfolio (dark, refractive glass prism, curved 3D media panels, giant extruded type) | Transition language, glass/refraction, typographic scale, line-drawn footer |
| 4.83 – 12.20 s | **Site B**: a beverage-can product site (3D product carousel, studio cyc, pinned ingredient chapters, smoke interlude, lineup arc, FAQ) | **The main template.** It's a single-product hero site, the same structure a perfume site needs |
| 12.20 – 16.20 s | TikTok outro (logo + glitch search bar) | Ignore |

Things that come from the phone, not the sites, and should **not** be copied: the handheld wobble (±1–2°), moiré, the room's ambient light washing out the screen, and the TikTok watermark. The user scrolls with a trackpad at roughly 3–5× normal reading speed, so every on-screen duration below is **compressed**. I give the observed duration and then the **intended real scroll length**, which I infer from how far the content moves per frame.

Cut detection (ffmpeg `scene>0.2`) found hard cuts at **4.83 s** (site switch) and **12.20 s** (outro). Every transition inside a site is continuous: it's done in WebGL and driven by scroll, with no page loads. That matters, because the "premium" feel comes from **one unbroken camera** across the whole page.

---

## A. FULL REFERENCE ANALYSIS

### SITE A — Studio portfolio (0.00 – 4.83 s)

#### A1 · Hero wordmark + glass prism
1. **Scene:** A1
2. **Time:** 0.00 – 0.45 s
3. **Camera angle:** Frontal, eye-level, ~35–40° FOV (low distortion)
4. **Camera movement:** Static camera. Only the object moves.
5. **Subject:** Giant white extruded wordmark spans ~95% of the viewport width, vertically centred. A triangular **glass prism** sits in front of it at ~40% viewport height.
6. **Background:** Near-black (#0B0B0D) with an op-art field of black/white concentric radial stripes behind a faint square tile grid
7. **Lighting:** High-key white type. The prism is lit by an HDRI, so its edges catch hot white speculars.
8. **Shadows/reflections:** No cast shadows. The prism **refracts** the wordmark and stripes behind it with strong **chromatic dispersion** (RGB fringing on every edge).
9. **Depth/focus:** Everything sharp. Depth comes from refraction, not DOF.
10. **Text position:** Wordmark centred. Small UI in the corners (logo top-left, nav top-centre, menu top-right).
11. **Text animation:** The wordmark is static. On scroll, its letters are **re-sampled into the next word** ("WORKS") through the prism.
12. **Object animation:** Prism rotates continuously on Y/Z (~25°/s), and scroll speeds it up.
13. **Transition in:** (pre-roll, not visible)
14. **Transition out:** The prism stays in place as an **anchor object** while the word behind it changes. The glass object carries the transition.
15. **Duration:** 0.45 s observed (≈ 100 vh real)
16. **Easing:** Rotation is linear and constant. The scroll-coupled part is lerped (damping ≈ 0.08–0.1).
17. **Scroll:** Hero pinned. Scroll progress drives prism rotation and the word swap.
18. **Atmosphere:** None. Graphic, not atmospheric.
19. **Why it feels premium:** Real refraction is expensive and hard to fake, so it reads instantly as high-end. Type at 95% width means confidence. Only one moving object.
20. **NOIRÉ adaptation:** The **bottle's glass is our prism.** In the hero, the giant "NOIRÉ" wordmark sits *behind* the bottle and is refracted/darkened through the black glass. Our version is more restrained: dispersion at ~30% of theirs, with a gold fringe in place of rainbow.

#### A2 · Works — curved media carousel
1. A2 · 2. 0.45 – 1.95 s
3. Frontal, eye-level
4. Camera static. The carousel rotates around a vertical axis in front of it (a cylinder of cards).
5. Active card ≈ 50% viewport width, centred. Neighbours sit at the edges at ~60% scale, turned 35–50° away in perspective.
6. Same dark tile grid and stripe field. A huge ghosted "WORKS" word sits **behind** the cards at ~15% opacity.
7. Cards are self-lit images. No scene light.
8. Cards are **bent planes** (cylindrical curvature). While moving, they get **RGB split** whose size scales with scroll velocity.
9. All sharp. Velocity-based smear only.
10. Caption bottom-left (title + tags), "More works ↗" bottom-right
11. Caption swaps per card with a ~150 ms fade/clip
12. Cylinder rotates ~40° per card. Cards bend more with velocity (curvature ∝ scroll speed).
13. In: the prism from A1 shrinks and passes through, and the first card **flies in from z-depth** with heavy RGB split
14. Out: last card exits left, the prism re-appears big for one beat (1.83 s), then a **hard inversion** to white
15. 1.5 s observed (≈ 300–400 vh real, 6 cards)
16. Velocity-driven, inertial (Lenis-style). Settles with a power3-like tail.
17. Pinned, horizontal-from-vertical scroll mapping
18. None
19. Velocity-reactive distortion makes the page feel physical. Curved planes read as 3D, not "slider".
20. **NOIRÉ:** use velocity-reactive distortion for the **fragrance notes carousel**: note cards bend 0→6° and gain 0→4 px chromatic offset as scroll speed rises.

#### A3 · Vision — white inversion + holographic blade
1. A3 · 2. 1.95 – 2.80 s
3. Frontal
4. Static, then the "camera" is swallowed by the blade
5. Thin holographic glass sliver, diagonal (~60°), centre-left, ~40% viewport height
6. Pure white (#F4F4F4). A hard cut by inversion from the dark section.
7. Flat white. The blade has an iridescent thin-film shader (cyan/yellow/magenta).
8. Iridescent sheen, no shadows
9. Sharp, then a full-screen holographic blur during the wipe
10. Japanese copy left/centre-left, plus a small right-aligned line. Outlined "VISION" title top-left at low opacity.
11. **Line-by-line reveal with black highlight bars**: each line's background bar wipes in left→right (~120 ms/line), then the text appears inside it, so it reads like typing
12. Blade rotates and grows, then **scales ~15× toward camera** and becomes a full-screen wipe (2.50 → 2.80 s)
13. In: hard luminance inversion (dark → white in one frame)
14. Out: **the object becomes the transition.** The blade fills the frame with holographic noise and grain, and resolves into the next section's dark type.
15. 0.85 s observed (≈ 150 vh)
16. Bars: expo.out. Blade zoom: expo.in (accelerates into camera).
17. Pinned
18. Film grain/noise visible during the wipe
19. The contrast whiplash (dark → white → dark) resets the eye. A product-derived object used as the wipe feels authored, not templated.
20. **NOIRÉ:** a **gold light-blade wipe**. A thin sliver of gold glass, taken from the cap's edge, sweeps across and then fills the frame to move from the bottle reveal to the macro section. Don't flash to full white: go to a **warm ivory (#EFE7DA)** for one "breath" section only.

#### A4 · Service — fly-through type
1. A4 · 2. 2.80 – 3.10 s
3. Low-ish, oblique (~10° yaw)
4. **Camera dolly forward through giant 3D letters** (z-move ~+40% of the scene depth in 0.3 s)
5. Letters overscaled: individual glyphs are ~60% of viewport height and cropped by the frame
6. Dark
7. Letters lit from top-left, with a hard rim on the bevels
8. Glossy letters reflect the light, with heavy directional motion blur
9. Motion blur + grain
10. The type *is* the scene
11. The type is static geometry. The camera moves through it.
12. –
13. In: emerges out of the A3 holographic wipe
14. Out: letters pass the camera and video panels resolve behind
15. 0.3 s (≈ 80 vh)
16. Strong ease-in-out (power4.inOut)
17. Scrubbed
18. Grain
19. Real z-depth camera motion through type is rare and cinematic.
20. **NOIRÉ:** use as the **notes title transition**. The camera dollies through "TOP · HEART · BASE" set as large, thin gold serif letters.

#### A5 · Service list — curved video screens
1. A5 · 2. 3.10 – 3.75 s
3. Frontal with slight perspective
4. Slow push-in (~5%) per panel
5. Video panel ≈ 45% width, slightly right of centre, bent
6. Dark with a fine dotted grid and **"+" crosshair markers** at intersections (technical/blueprint feel)
7. Panels self-lit, with a bloom flash at each swap
8. Bloom
9. Sharp panel. The previous panel ghosts out with blur.
10. Title + paragraph to the right of the panel
11. Fade + slight x-shift
12. Panel swaps through a light-flash crossfade
13–14. Bloom flash (white overexposure peak ~100 ms)
15. 0.65 s (≈ 200 vh)
16. power2.out
17. Pinned
18. Crosshair grid + sparse star-like glints
19. The blueprint grid suggests precision and engineering.
20. **NOIRÉ:** a hairline gold crosshair grid at 6% opacity behind the **ingredient scene**, like a perfumer's lab sheet.

#### A6 · Case — RGB-offset wordmark
1. A6 · 2. 3.75 – 4.10 s
3. Frontal · 4. Lateral slide (~-10% x)
5–6. Teal 3D room. Big lowercase wordmark bottom-left.
10–11. The wordmark appears **doubled** (two copies offset ~8 px vertically) and merges into one: a ghost/echo settle
14. Out: cut to black footer
19–20. Echo-settle is a nice, subtle type effect. **NOIRÉ:** fragrance note names settle from a 2-copy echo (offset 10 px → 0, second copy opacity 0.35 → 0, 500 ms, expo.out).

#### A7 · Footer — construction-line logo
1. A7 · 2. 4.10 – 4.83 s
3. Frontal · 4. Static
5. Logo glyph left at ~30% height. The rest of the wordmark is **drawn in as construction geometry** (thin white lines, arcs, circles, diagonals).
6. Black, with a soft **blue radial glow** behind the forming letters
7. Glow only
10. Footer links and © bottom
11. **SVG stroke-draw**: vertical grid lines first (staggered ~40 ms each), then diagonals, then arcs forming letters
15. 0.7 s (≈ 100 vh)
16. power2.inOut per line, staggered
19. Shows the "drafting" of the brand. Very architectural.
20. **NOIRÉ:** the **final footer** draws the NOIRÉ monogram/wordmark in gold hairlines (0.75 px) over the bottle silhouette, with a warm amber glow in place of blue.

---

### SITE B — Product site (4.83 – 12.20 s) · PRIMARY TEMPLATE

Shared look across the whole site:
- **Studio cyclorama:** vertical gradient from near-black at the top (#0D0C0E) to warm taupe/beige at the floor (#B8ADA2), with a soft horizon at ~55% of viewport height. This reads as an infinite photo studio.
- **One continuous WebGL camera**, the same product mesh moving between every section
- Fixed UI: logo top-centre, sound + language top-left, menu + CTA pill top-right, **thin progress line** at the top-left that grows with scroll
- Type: ultra-bold condensed uppercase sans for titles, small light sans for body. High contrast between the two.

#### B1 · Flavour carousel (hero)
1. **Scene:** B1
2. **Time:** 4.83 – 6.50 s
3. **Camera angle:** Eye-level, very slight high angle (~3°). Medium-wide shot.
4. **Camera movement:** Static. The product ring rotates.
5. **Subject:** ~10 cans on a horizontal **arc/ring**. The active can is centre, ~45% of viewport height, tilted ~15° clockwise. Neighbours recede in perspective, each tilted at a different angle (8–25°, alternating) for an organic float.
6. **Background:** Studio cyc. Above the active can hangs a **disc "UFO" lamp** (practical light fixture). Below it is a **round plinth**, and the flavour name is embossed/printed on the plinth top.
7. **Lighting:** The overhead disc acts as the key and pools on the active can. **The active can is the only one in colour/fully lit.** Inactive cans are dark silhouettes showing only a **thin coloured rim strip** (their flavour colour on the edge). The plinth emits an underglow in the flavour colour (green → pink → blue), which bleeds onto the floor as a soft spectral pool.
8. **Shadows/reflections:** Aluminium speculars on the can shoulders. The plinth glow reflects on the can bottom. No hard floor shadow; the plinth light replaces it.
9. **Depth:** Far cans are slightly softer (subtle DOF, ~1–2 px blur at the edges)
10. **Text:** Flavour name on the plinth (in-scene 3D text, not HTML). "<" ">" arrows hug the active can at mid-height.
11. **Text animation:** The plinth label swaps with a quick fade (~150 ms) as the colour changes
12. **Object animation:** Per change: ring rotates one slot (~36°). The incoming can **spins ~180° on Y** while travelling into centre. Idle: each can bobs (±6 px, ~3 s period, desynced) and rocks (±2°).
13. **Transition in:** loops back from the footer (seen at 11.6 s: cans re-enter from the edges, the lamp lights first, then the plinth glow)
14. **Transition out:** see B2
15. **Duration:** ~0.35–0.45 s per flavour change. 4 changes observed.
16. **Easing:** ring rotation power3.inOut ~600 ms. Y-spin power2.out. Colour crossfade 300 ms linear.
17. **Scroll:** Arrows/drag/wheel step the carousel (discrete), and the page then continues
18. **Atmosphere:** Colour light pool on the floor. Faint dust specks.
19. **Why premium:** "Only the hero is lit" is a museum/vitrine lighting language. The practical lamp + plinth stage the product like a jewel in a display case. Everything floats; nothing sits on a surface.
20. **NOIRÉ:** **This is our hero stage.** Use one bottle, not a ring of 10, because a perfume is singular. Keep the **overhead disc lamp + plinth**: the bottle floats ~4 cm above a black-marble plinth with a gold rim, and a warm gold underglow. Optional: 3 concentrations (EDP / Parfum / Extrait) shown as dark sibling bottles, lit by rim only.

#### B2 · Colour-flood dolly-in
1. B2 · 2. 6.45 – 6.70 s
3. Moves from eye-level to **low angle** (~-12° pitch, looking up at the can)
4. **Fast dolly-in** (~2.5× apparent scale) plus a **roll** of the product from 15° to ~25°. Siblings fly outward off-frame (±x, ~150% viewport).
5. Can goes from 45% to **~110% of viewport height** (top cropped by the frame edge, bottom bleeds off)
6. The background **floods** from the studio cyc to a **radial magenta/crimson gradient**: hot centre behind the can → deep crimson → near-black vignette in the corners
7. A new key appears from top-right: a white rim light along the can's top-left edge plus a hot specular streak down the cylinder
8. Strong vertical specular band on the can. No floor (the plinth leaves the frame).
9. Sharp product, smooth gradient background
10. Flavour name + body appear left at ~12% x, 40% y
11. Title enters **after** the can settles (~200 ms later)
12. Can scales/translates/rotates simultaneously
13. In: the scroll trigger past the carousel
14. Out: holds into B3
15. ~0.25 s observed (≈ 100 vh real)
16. Dolly expo.out. BG colour flood ~400 ms power2.out radiating from the product's position.
17. Scrubbed
18. None
19. The colour flood is the brand moment. A low-angle hero shot makes the product monumental.
20. **NOIRÉ:** at the **reveal**, flood from the neutral studio to a **deep noir-amber radial** (centre #3A2614 → #120C08 → #050404). The bottle dollies in to ~95% of viewport height at a low angle.

#### B3 · Flavour hero (hold)
1. B3 · 2. 6.70 – 7.30 s
3. Low angle ~-12°, 3/4 view
4. Slow drift: the product rotates Y ~+8° over the hold. Micro-float ±4 px.
5. Can centre-right (~55% x), **~100% viewport height**, tilted 20° clockwise, cropped bottom
6. Magenta radial + vignette, plus sparse white specks (dust/glints, ~10–15 visible)
7. Key from top-right (rim), fill from the front-left (low)
8. Specular streak vertical. A soft reflected glow of the BG colour on the can's dark side (environment-coloured fill).
9. Sharp
10. Left column at 12% x: bold 2-line uppercase title + 3-line body. Right edge: **vertical stack of 4 circular icon buttons** (chapter nav), active one filled.
11. Title: blur 8 px → 0 + opacity 0 → 1, stagger by line
12. –
13. From B2
14. Into B4 (rotation begins)
15. 0.6 s observed (≈ 60 vh real hold)
16. –
17. Pinned start of a long pin
18. Dust specks
19. The **hold**. The site lets you look. Composition is a classic ad layout (product right, copy left, nav right).
20. **NOIRÉ:** after the reveal, hold for 60–80 vh with the bottle drifting 6°.

#### B4 · Ingredient chapters — pinned rotation with label "scan"
1. B4 · 2. 7.30 – 9.60 s
3. Low angle, moving towards eye level (pitch -12° → -4°)
4. Camera pushes in slightly (~6%). The **product rotates on Y ~35–45° per chapter**, ~180° total, so we see the back label.
5. Product centre (~50% x) by now, straightening: roll goes from 20° → 6°, alternating ±6° per chapter
6. Magenta radial, constant
7. **Key drops as the product turns away.** The can goes nearly black; only the rim stays lit. Then **a band of the label glows** (emissive "scan highlight") over the exact text on the can that the left copy describes.
8. Glowing band ~12% of the can's height. Text inside the band is lit, the rest of the label stays dark.
9. Sharp
10. Left column: small **magenta pill/bar** above the title, title, body. The right icon nav updates its active state.
11. Per chapter: **outgoing** title blurs/scrambles out (~150 ms, opacity → 0, blur → 6 px); **incoming** title scramble/blurs in (~300 ms). Body fades after the title (+100 ms). The pill bar wipes in left→right.
12. Product rotation and roll are tied to scroll and snap to each chapter
13. From B3
14. Into B5
15. 2.3 s observed, 4 chapters (≈ 4 × 100 vh = **400 vh pin**)
16. Between chapters power3.inOut, with **snap** to chapter positions (snap duration ~0.5 s)
17. **Pinned ~400 vh, scrubbed, snapping**
18. Dust specks continue
19. **Linking copy to a physical spot on the product** (the glow band) is the smartest idea in the reference. It turns the product into the infographic.
20. **NOIRÉ:** this becomes the **fragrance notes chapter**. The bottle turns and a **gold light band** (emissive line on the glass, or a light sweep) passes over an engraved note on the back of the bottle, synced with Top / Heart / Base copy.

#### B5 · Smoke interlude with blurred giant type
1. B5 · 2. 9.60 – 9.95 s
3. Eye-level, frontal
4. **Pull-back**: the product shrinks from ~100% to ~55% of viewport height while rotating back to the front label (Y → 0°, roll → ~8°)
5. Centred, upright-ish
6. Background becomes **soft pink/white smoke/clouds**, very blurred, fully filling the frame. A **giant headline** sits **behind** the product, **out of focus** (shallow DOF), about 40% opacity.
7. High-key, bright, diffused (as if lit through fog). The product gets a frontal soft key and its label pops.
8. Soft. The product picks up the warm ambient.
9. **Shallow DOF:** product sharp, type + smoke heavily blurred (~12–20 px)
10. Giant type centre-left behind the product
11. Type drifts slowly laterally (parallax ~-3% x relative to smoke)
12. Product floats and rotates to front
13. In: magenta darkens/lightens into smoke as the can pulls back (~300 ms)
14. Out: smoke dissipates to the dark studio while the cans fly in from the right
15. 0.35 s observed (≈ 100–120 vh)
16. Pull-back power2.inOut. Smoke drifts linearly and continuously.
17. Scrubbed
18. **Volumetric-looking smoke/fog** (likely a fullscreen video or noise shader with blur)
19. A "breath" scene: soft after the hard red. Text-behind-product with DOF is photographic, not webby.
20. **NOIRÉ:** **the smoke transition is native to perfume.** Use dark warm smoke (smoked amber, not pink), with "L'ESSENCE DE LA NUIT" (or similar) huge and blurred behind the bottle.

#### B6 · Lineup arc
1. B6 · 2. 9.95 – 10.40 s
3. **High angle** (~25° down), wide shot
4. Camera static. The products travel along a **circular track**, entering bottom-left and exiting top-right, a "conveyor wave".
5. 12+ cans in a sweeping diagonal arc, each tilted toward the camera, all lit/coloured (not silhouettes)
6. Dark studio cyc, floor visible
7. Even top light. Every product readable.
8. Metallic tops reflect the light
9. Slight DOF at the ends of the arc
10. "FOIRE AUX QUESTIONS" rises from the bottom (10.4 s)
11. Giant title translateY ~+60% → 0
12. Arc rotation scrubbed. The products **fly up and out the top** of the frame (tops visible at 10.6 s).
13. In: from the smoke, products stream in from the right
14. Out: products exit upward and the next section's type rises
15. 0.45 s (≈ 150 vh)
16. Scrubbed, linear-ish with a lerp
17. Scrubbed
18. –
19. Showing the whole range in one choreographed sweep feels abundant.
20. **NOIRÉ:** for the **collection/size row**: 30 / 50 / 100 ml + discovery set on a slow arc.

#### B7 · FAQ with light beam
1. B7 · 2. 10.40 – 10.85 s
3. Frontal · 4. Static, page scroll
5. Product absent (exited top)
6. Studio cyc with a **diagonal soft light shaft** coming from top-right into the floor, as if a window/spot is cutting the dark
7. Shaft ~25° diagonal, soft edges, ~20% brighter than the surrounding cyc
10. Huge bold title top-left with a subtle 3D bevel/reflection. Question list with hairline dividers.
11. Title rises (y 60% → 0). List rows stagger in.
15. ≈ 100–150 vh
19. Even utility sections keep the cinematic light. **No section drops back to a flat web background.**
20. **NOIRÉ:** use the same **diagonal light shaft** behind the FAQ, shipping and story sections.

#### B8 · Join / newsletter + footer product
1. B8 · 2. 10.85 – 11.60 s
3. Frontal · 4. Static
5. Small can (~25% viewport height) centred, floating, **rising from the bottom** into place under the newsletter form
6. Dark studio, same diagonal shaft
10. "REJOIGNEZ-NOUS" title + email input, centred
11. Title + input fade-up
12. Product rises (y +40% → 0), slow float
15. ≈ 150 vh
19. The product accompanies you to the very end. It's a **persistent character**.
20. **NOIRÉ:** a **final purchase CTA** with the bottle centred at ~45% viewport height on the plinth.

#### B9 · Loop back to the carousel
11.60 – 12.20 s. The page jumps back to the top (scroll-to-top or a loop). Cans fly in from the sides, the **disc lamp lights first**, then the plinth glow fades in pink (~200 ms later) with the label. This is a staged light cue order: **lamp → product → plinth → label.**

---

## B. PROPOSED NOIRÉ SCENE SEQUENCE

Total scroll length ≈ **1,520 vh** desktop (≈ 1,200 vh mobile). One persistent WebGL canvas (fixed, full-screen, `z-index: 0`) carries the bottle through every scene. HTML type layers sit on top.

| # | Scene | Scroll range (vh) | Pin | Reference DNA |
|---|---|---|---|---|
| 00 | **Preloader / Lamp cue** | – (time-based, 2.4 s) | – | B9 light-cue order, A7 line drawing |
| 01 | **Bottle Reveal** (on plinth, under the lamp) | 0 – 140 | 140 vh | B1 stage, A1 wordmark-behind-glass |
| 02 | **Noir Flood / Hero hold** | 140 – 260 | 120 vh | B2 colour-flood dolly, B3 hold |
| 03 | **Glass Macro** | 260 – 400 | 140 vh | A4 camera fly, B3 rim light |
| 04 | **Gold Cap Detail** | 400 – 520 | 120 vh | B4 rotation, A3 blade |
| 05 | **Gold Blade Wipe → Ivory Breath** | 520 – 600 | 80 vh | A3 holographic wipe + inversion |
| 06 | **Fragrance Notes** (Top / Heart / Base) | 600 – 960 | 360 vh | **B4 label-scan chapters**, A6 echo type |
| 07 | **Smoke Interlude** | 960 – 1080 | 120 vh | **B5 smoke + DOF type** |
| 08 | **Ingredients** (raw materials orbit) | 1080 – 1260 | 180 vh | A2 curved carousel, A5 crosshair grid |
| 09 | **Rotation / Parallax showcase** | 1260 – 1360 | 100 vh | B6 arc (single bottle 360°) |
| 10 | **Final Product Hero + Purchase CTA** | 1360 – 1460 | 100 vh | B8, B1 stage reprise |
| 11 | **Footer** (gold construction-line wordmark) | 1460 – 1520 | – | A7 |

---

## C. EXACT MOTION PLAN

Conventions: `p` = scene scroll progress 0→1. Bottle transforms are in world units, where **1 unit = bottle height**, and scale is relative to the hero rest pose. Durations marked "(time)" are time-based tweens; everything else is scrubbed with `scrub: 0.8` (0.8 s catch-up lerp) on top of Lenis (`lerp: 0.085`, `wheelMultiplier: 0.9`).

**Global easing vocabulary**
- `ENTER` = `expo.out` (text, UI)
- `SETTLE` = `power3.out` (objects arriving)
- `TRAVEL` = `power3.inOut` (objects moving between poses)
- `PUNCH` = `expo.in` (accelerating into camera / wipes)
- `DRIFT` = `sine.inOut` (idle loops)

**Global idle (always on):** bottle float `y ±0.012` (≈ ±4 px at hero scale), period 4.2 s, `sine.inOut` · rock `rotZ ±0.6°`, period 5.6 s (desynced) · dust particles drift `+0.02 u/s` upward.

### 00 · Preloader / Lamp cue (time-based, total 2.4 s)
| t | Event |
|---|---|
| 0.00 | Black #050404. A gold hairline (1 px) draws from centre outward to 120 px wide (600 ms, power2.inOut) as the progress bar fills. |
| 0.60–1.40 | Hairline progress fills to 100% (tied to asset loading, minimum 800 ms) |
| 1.40 | Hairline collapses to 0 width (300 ms, expo.in) |
| 1.55 | **Lamp cue:** the overhead disc lamp emissive goes 0 → 1 over 500 ms (power2.out), flickers once at 120 ms (1 → 0.6 → 1), and a light cone appears (opacity 0 → 0.35) |
| 1.80 | **Bottle cue:** bottle emerges from black: exposure on the bottle's key 0 → 1 (700 ms, power3.out). Bottle y +0.06 → 0, scale 0.96 → 1.00. |
| 2.10 | **Plinth cue:** gold underglow 0 → 1 (400 ms) |
| 2.40 | **Label cue:** UI fades in (top bar opacity 0 → 1, translateY -12 px → 0, 500 ms ENTER, stagger 60 ms). Scroll unlocks. |

### 01 · Bottle Reveal (0–140 vh, pinned 140 vh)
- **Rest pose (p=0):** bottle centred x=0, y=0.05, **~52% viewport height**, rotY -18° (3/4 view), rotZ 0°. Plinth below, lamp above.
- **Wordmark "NOIRÉ"** behind the bottle, set in a high-contrast Didone, width 86vw, colour #E8D3A2 at 90% opacity, rendered **into the WebGL scene** as a plane behind the bottle so the glass refracts it.
- `p 0 → 0.35`: wordmark letter-spacing 0.32em → 0.12em, scale 1.06 → 1.00 (SETTLE). The bottle turns rotY -18° → 0°.
- `p 0.35 → 0.60`: hold. Light sweep #1: a specular bar travels left→right across the glass. Time-based **1.2 s**, power2.inOut, triggered once at p=0.35.
- `p 0.60 → 1.00`: the wordmark splits. Letters N-O-I move x → -12vw, R-É move → +12vw, opacity 0.9 → 0, blur 0 → 10 px (TRAVEL). Scroll cue fades out (opacity 1 → 0 by p=0.15).
- **Text:** tagline "Eau de Parfum — Absolu" at bottom centre, enters **300 ms after the bottle settles** (on load: opacity 0 → 1, translateY 24 px → 0, 900 ms ENTER).

### 02 · Noir Flood / Hero hold (140–260 vh, pinned 120 vh)
- `p 0 → 0.40` (**dolly-in**): camera z moves forward so the bottle grows from 52% → **92% viewport height**. Camera pitch 0° → **-10°** (low angle), bottle rotZ 0° → **+7°**, bottle x 0 → **+0.18** (centre-right). Ease: SETTLE.
- Simultaneously, the **flood**: background shader uniform `uFlood` 0 → 1 (power2.out). It expands as a radial mask **from the bottle's screen position**, radius 0 → 140% of the viewport diagonal. Colours: studio cyc → radial `#3A2614` (centre) → `#120C08` (55%) → `#050404` (100%). The plinth and lamp drop out (y -0.4, opacity → 0).
- `p 0.40 → 1.00` (**hold**): bottle rotY 0° → +6° (linear drift). Camera holds.
- **Text (left column, x = 8vw, y = 42vh):** eyebrow "N°01 — L'Absolu" (gold, 11 px, tracking 0.3em) → title "Born in the hour / after midnight" (2 lines, 64 px Didone) → body (3 lines). Enters at **p = 0.42**, i.e. *after* the bottle settles:
  - Gold pill bar width 0 → 48 px (500 ms, ENTER)
  - Title lines: opacity 0 → 1, translateY 40 px → 0, blur 8 px → 0, 900 ms ENTER, stagger 90 ms, starting 150 ms after the bar
  - Body: opacity 0 → 1, translateY 16 px → 0, 700 ms, starting +250 ms
- **Right rail:** 4 chapter dots (Notes / Ingredients / Craft / Shop) fade in, 40 ms stagger

### 03 · Glass Macro (260–400 vh, pinned 140 vh)
- `p 0 → 0.45`: **camera flies forward** until the bottle fills ~260% of viewport height (camera z = 35% of the start distance). Camera target moves to the **shoulder of the bottle** (upper-left edge of the glass). Ease: TRAVEL. Camera FOV 32° → 26° (slight compression, macro feel).
- Depth of field engages: focus distance tracks the glass surface, bokeh scale 0 → 1, so the background blurs.
- `p 0.45 → 0.80`: **light sweep #2**. An area light travels along the glass edge from top to bottom (scrubbed). The rim specular slides with it and the dark glass shows its **inner depth** (thickness/absorption tint #1A0F08).
- `p 0.80 → 1.00`: camera arcs ~12° around the Y axis toward the cap (sets up 04)
- **Text:** a single line, right side (x = 62vw, y = 70vh): "Hand-poured smoked glass, 6 mm thick." Echo-settle in (2 copies, offset 10 px → 0, second copy opacity 0.35 → 0, 500 ms ENTER) at p=0.50. Out at p=0.85 (opacity → 0, translateY → -16 px, 300 ms).

### 04 · Gold Cap Detail (400–520 vh, pinned 120 vh)
- `p 0 → 0.35`: camera tilts up to the **cap**. The cap fills ~70% of viewport width, cropped top. Pitch -10° → +4°.
- `p 0.20 → 0.70`: **cap rotates on Y 0° → 90°** (only the cap mesh, if separable; otherwise the whole bottle). The anisotropic brushed-gold highlight streaks around the cylinder.
- `p 0.35`: **light sweep #3**, time-based **1.0 s**: a thin hot highlight runs across the gold faceting, left→right, power2.inOut
- **Text:** left (x = 8vw): eyebrow "The Crown", title "24k gold-plated zamak, / 7 facets." Enters at p = 0.30 (same type pattern as 02). A thin gold hairline **draws** from the text toward the cap (SVG stroke-dashoffset 100% → 0, 800 ms, power2.inOut) as a technical callout.
- `p 0.80 → 1.00`: zoom pull-back starts (camera z +20%), handing off to 05

### 05 · Gold Blade Wipe → Ivory Breath (520–600 vh, pinned 80 vh)
- `p 0 → 0.30`: a thin **gold-glass sliver** (a long beveled blade mesh, the cap's edge "breaking off") enters from bottom-left at a 60° diagonal, width 0.6vw, length 40vh
- `p 0.30 → 0.70`: blade **scales 1 → 18×** and moves toward the camera (PUNCH, expo.in). It fills the frame with gold, plus a chromatic fringe (gold/amber/ivory) and film grain at 6%.
- `p 0.70 → 1.00`: the frame resolves into **warm ivory #EFE7DA** (the "breath"). The blade's last pixels dissolve via noise threshold.
- In the ivory frame, the bottle reappears **small and centred (38% viewport height), now a dark silhouette on ivory**: high contrast and a complete tonal reset.
- **Text:** one line, centred, under the bottle: "Three movements." Line reveal with highlight bar (from A3): an **ink-black bar** wipes in left→right (400 ms, expo.out), then the text appears inside in ivory, +80 ms.

### 06 · Fragrance Notes — pinned label-scan (600–960 vh, pinned 360 vh, 3 chapters × 120 vh)
- **Entry (`p 0 → 0.10`)**: background ivory → back to the noir radial (flood reversed, collapsing toward the bottle, 0.10 of the scroll). Bottle scale 38% → **88% viewport height**, centred x=0, low angle -8°.
- **Per chapter** (TOP 0.10–0.40 · HEART 0.40–0.70 · BASE 0.70–1.00):
  - Bottle rotY steps **0° → 40° → 95° → 160°** (back face visible by BASE), TRAVEL, with **ScrollTrigger snap** to chapter centres (snap duration 0.45 s, delay 0.08 s, ease power2.inOut)
  - Bottle rotZ alternates **+6° / -4° / +3°**
  - Key light intensity drops as the bottle rotates away from the front (1.0 → 0.35); the rim stays at 0.9
  - **Gold scan band**: an emissive band on the glass (shader-driven horizontal band, height = 8% of the bottle, soft edges 20%) moves to the y-position of the engraved note word on the bottle: TOP band at y=0.72, HEART y=0.50, BASE y=0.28. Band intensity 0 → 1.4, 500 ms, delayed 200 ms after the rotation settles.
  - **Left copy (x = 8vw):** chapter number "01 / 03" (mono, 11 px) · gold pill bar wipe 0 → 48 px · note family title (e.g. "TOP — Black Bergamot · Pink Pepper"):
    - OUT (prev chapter): opacity 1 → 0, blur 0 → 6 px, translateY 0 → -20 px, 220 ms, power2.in
    - IN: **echo-settle**: 2 copies, offset 10 px → 0, ghost opacity 0.35 → 0, plus blur 8 → 0, 700 ms ENTER, starting 120 ms after OUT completes
    - Body copy follows +120 ms, opacity 0 → 1, y 16 → 0
  - **Right copy (x = 72vw, y = 64vh):** 3 note ingredients as a mini-list. Each item: a hairline grows 0 → 32 px, then the label fades in, stagger 80 ms.
  - **Right rail:** active dot fills gold, scale 1 → 1.25, 300 ms
  - **Ambient colour per chapter** (`uFloodCentre` lerps): TOP `#3A2614` (amber) → HEART `#3A1418` (oxblood rose) → BASE `#1C140C` (dark resin)
- **Mobile:** text moves *below* the bottle (bottle scale 70% of viewport height, y +0.10); snap stays.

### 07 · Smoke Interlude (960–1080 vh, pinned 120 vh)
- `p 0 → 0.35`: **pull-back**. Bottle 88% → **55% viewport height**, rotY 160° → 360° (back to front, long way round for drama), rotZ → +5°. Ease TRAVEL.
- `p 0.10 → 0.40`: smoke layer opacity 0 → 1. Smoke is dark amber/charcoal, lit from behind-left (brighter rim on the smoke = backlit fog).
- **Giant type behind the bottle:** "L'HEURE NOIRE", 22vw, ivory at 30% opacity, blurred via **DOF**: CSS `filter: blur(14px)` if HTML, or rendered in-scene behind the focal plane. Parallax: type x 0 → -4vw over the full scene, smoke x 0 → -1.5vw (different depth rates).
- `p 0.40 → 0.75`: hold. Smoke curls continuously (time-based, not scroll).
- `p 0.75 → 1.00`: smoke thins (opacity → 0.25, density down), revealing the dark studio cyc with the diagonal **light shaft**
- **Bottle lighting:** the soft frontal key rises to 1.2 so the label reads crisply against the soft background

### 08 · Ingredients (1080–1260 vh, pinned 180 vh)
- **Bottle:** moves to x = -0.25 (left third), scale 48% viewport height, rotY -20°. Slow DRIFT rotation ±4°.
- **Ingredient objects** (6 isolated, high-res cut-outs or simple 3D: bergamot peel, pink peppercorns, rose petal, oud wood shard, vanilla pod, labdanum resin) float on a **curved arc / cylinder** to the right of the bottle, radius 0.9 u
- Scroll rotates the arc: 6 items → **40° per item**, the active item comes front-centre at the right (x = 0.30), scale 1.0. Others recede (scale 0.6, opacity 0.45, blur 3 px).
- **Velocity distortion (from A2):** each card/object gets bend 0 → 6° and chromatic offset 0 → 4 px ∝ `|scrollVelocity|`, clamped. Decays with power3.out over 400 ms when scrolling stops.
- **Background:** hairline gold **crosshair grid** (dots + "+" every 80 px) at 6% opacity, with a slight parallax (grid y moves 0.3× the scroll rate)
- **Caption** (bottom-left x = 8vw, y = 86vh): ingredient name + origin ("Oud — Assam, India"). Swap per item: clip-path inset(0 0 100% 0) → inset(0) on the incoming, 450 ms ENTER, outgoing fades 150 ms.

### 09 · Rotation / Parallax showcase (1260–1360 vh, pinned 100 vh)
- Ingredients exit (arc radius 0.9 → 2.4, opacity → 0)
- Bottle returns to centre, scale 60% viewport height, **camera high angle +18°** (from B6)
- **Full 360° turntable** tied to scroll: rotY 0° → 360°, linear. Light sweep #4 is static in world space, so the highlight travels naturally across the rotating glass.
- **Parallax layers** (mouse + scroll): background shaft -1.5%, bottle 0, foreground dust +3% of the mouse delta
- Text: 3 tiny spec callouts orbit with the bottle at fixed angles ("100 ml", "Extrait 28%", "Made in Grasse"), fading in when facing the camera (opacity = max(0, cos(angle))^2)

### 10 · Final Product Hero + Purchase CTA (1360–1460 vh, pinned 100 vh)
- **Restage B1:** plinth rises from below (y -0.5 → 0, SETTLE). The lamp lowers into frame (y +0.4 → 0). The bottle descends onto its float point above the plinth (y +0.15 → 0.05). Camera returns to eye level, pitch 0, FOV 35.
- **Light cue reprise** at p = 0.40: lamp flickers (1 → 0.7 → 1, 120 ms) and the gold underglow pulses 0.6 → 1.0 (600 ms)
- **Size selector** (30 / 50 / 100 ml): siblings at ±0.5 u, dark, rim only (B1 "only the hero is lit"). Selecting animates a ring rotation 1 slot (600 ms, power3.inOut) and a Y-spin of the incoming bottle 180° (power2.out).
- **CTA:** price + "Add to bag" pill (gold border 1 px, fill on hover). Enters 300 ms after the bottle settles: opacity 0 → 1, translateY 24 px → 0, 700 ms ENTER. Hover: background gold fill wipes left→right 350 ms power2.out, text colour inverts.
- Magnetic button: translate toward the cursor, max 6 px, lerp 0.15

### 11 · Footer (1460–1520 vh, not pinned)
- Gold hairline construction drawing of the NOIRÉ wordmark: vertical guides first (stagger 40 ms, each 500 ms power2.inOut), then diagonals, then arcs/letters (stroke-dashoffset). Total ~1.8 s, triggered at 30% visibility.
- Warm radial glow behind the letters (#3A2614 at 40%, radius 40vw)
- Links + newsletter fade up (y 16 → 0, stagger 50 ms)

### Global micro-interactions
- **Top progress line:** 1 px gold, width = page progress × 18vw, top-left (from Site B)
- **Cursor:** 8 px ivory dot plus a 36 px ring that lags (lerp 0.12). The ring expands to 64 px over interactive elements and the bottle.
- **Bottle hover tilt (desktop):** rotX/rotY ±3° toward the mouse, lerp 0.06
- **Scroll velocity → grain:** film grain opacity 3% at rest → 7% at high velocity

---

## D. EXACT LIGHTING PLAN

Renderer: `ACESFilmicToneMapping` (or AgX), exposure 1.0, `SRGBColorSpace`, physically correct lights.

| Light | Type | Position (bottle at origin, height 1) | Colour | Intensity | Role |
|---|---|---|---|---|---|
| **Environment** | HDRI studio softbox (e.g. a Poly Haven studio, 2K, PMREM) | – | neutral, rotated so the strip-light falls on the glass edge | envMapIntensity 0.9 (glass) / 1.4 (gold) | Reflections, the real secret of glass + metal |
| **Lamp key** | SpotLight (+ visible emissive disc mesh) | (0, 2.2, 0.2) aimed down | #FFF1DC (3200 K-ish warm) | 1.0 base | B1 "only the hero is lit" overhead pool |
| **Rim L** | RectAreaLight 0.2×2 | (-1.4, 0.6, -0.8) | #FFE2B0 | 6 | Defines the left glass silhouette |
| **Rim R** | RectAreaLight 0.2×2 | (1.3, 0.8, -0.9) | #FFFFFF | 4 | Cooler counter-rim for separation |
| **Front fill** | RectAreaLight 1.5×1 | (-0.6, -0.2, 2.0) | #FFF6EA | 0.6 | Lifts the label, low |
| **Plinth underglow** | PointLight + emissive ring | (0, -0.62, 0) | #C9A35C | 0 → 1.2 | Gold bounce on the base + floor pool |
| **Sweep bar** | RectAreaLight 0.08×2.5 (or shader highlight) | animated x -1.5 → +1.5 at z 1.2 | #FFFFFF | 10 at peak | The signature light sweeps |

**Per-scene lighting state**

| Scene | Lamp | RimL | RimR | Fill | Underglow | BG |
|---|---|---|---|---|---|---|
| 00 | 0 → 1 | 0 → 6 | 0 → 4 | 0 | 0 → 1.2 | black → studio cyc |
| 01 | 1.0 | 6 | 4 | 0.6 | 1.2 | studio cyc (#0D0C0E top → #6E6257 floor, horizon 56%) |
| 02 | 1 → 0 | 6 → 8 | 4 | 0.6 → 0.4 | 1.2 → 0 | flood → amber radial |
| 03 | 0 | 8 | 3 | 0.3 | 0 | amber radial + DOF blur; sweep bar travels along the edge |
| 04 | 0 | 5 | 6 | 0.8 | 0 | darker radial (centre #2A1C10); sweep #3 on the gold |
| 05 | – | – | – | – | – | gold blade → ivory #EFE7DA, bottle as silhouette (all lights 0.2, env 0.3) |
| 06 | 0 | 9 | 5 | 1.0 → 0.35 per chapter | 0 | per-chapter radial hue; **emissive scan band** |
| 07 | 0 | 4 | 2 | 1.2 | 0 | backlit smoke (smoke rim brighter on the left) |
| 08 | 0.5 | 6 | 4 | 0.8 | 0 | studio cyc + diagonal shaft + crosshair grid |
| 09 | 0.7 | 6 | 4 | 0.6 | 0.4 | studio cyc, sweep bar fixed in world space |
| 10 | 1.0 (flicker cue) | 6 | 4 | 0.6 | 1.2 pulse | studio cyc, B1 reprise |
| 11 | – | – | – | – | – | black + warm glow |

**Signature light sweeps** (the "luxury" tell): #1 (01, 1.2 s, L→R, glass body) · #2 (03, scrubbed, top→bottom along the edge) · #3 (04, 1.0 s, L→R across the cap facets) · #4 (09, world-fixed, revealed by rotation).

**Diagonal light shaft (B7):** a fullscreen shader quad with a soft wedge from the top-right at 25° (from (110%, -10%) to (20%, 110%)), 18% luminance lift, edge softness 30%, and slow noise modulation (±3%, 8 s period). Used in 07 (exit), 08, 09, FAQ/footer.

**Materials**
- **Black glass:** `MeshPhysicalMaterial` — color #050505, roughness 0.04, metalness 0, `transmission` 0.25 (mostly opaque black glass; enough to refract the wordmark at the edges), thickness 0.6, ior 1.5, `attenuationColor` #1A0F08, attenuationDistance 0.3, clearcoat 1, clearcoatRoughness 0.02, `dispersion` 0.15 (gold-ish fringe, subtle)
- **Gold:** metalness 1, roughness 0.22, color #D4AF6A, anisotropy 0.6 along the cap's circumference (brushed), envMapIntensity 1.4
- **Plinth:** black marble (roughness map), roughness 0.35, gold rim metalness 1 roughness 0.18
- **Liquid (if visible):** dark amber #2B1608, slightly transmissive

---

## E. EXACT CAMERA PLAN

Base camera: PerspectiveCamera, **FOV 35°** (portrait/mobile 42°). Bottle height = 1 u, origin at bottle centre. All moves are scrubbed through a single **camera rig** (target + position + FOV + roll) interpolated with Catmull-Rom across keyframes, so the camera flows instead of jumping.

| Key | Scene / p | Position (x, y, z) | Target | FOV | Pitch | Notes |
|---|---|---|---|---|---|---|
| K0 | 00–01 | (0, 0.10, 3.40) | (0, 0.05, 0) | 35 | ~-1° | Bottle ≈ 52% VH. Static, frontal, B1 framing. |
| K1 | 02 p0.40 | (0.10, -0.38, 1.85) | (0.18, 0.10, 0) | 35 | -10° | **Dolly-in ~46% closer + crane down** → low angle, bottle ≈ 92% VH, centre-right |
| K2 | 02 p1.00 | (0.14, -0.38, 1.80) | (0.18, 0.10, 0) | 35 | -10° | Hold, 3% creep forward |
| K3 | 03 p0.45 | (-0.22, 0.28, 0.62) | (-0.18, 0.30, 0) | 26 | -2° | **Macro**: camera forward to 18% of K0 distance. DOF on (focus 0.6, aperture f/1.8 equivalent). |
| K4 | 03 p1.00 | (0.05, 0.40, 0.66) | (0, 0.38, 0) | 26 | 0° | Arc 12° around Y toward the cap |
| K5 | 04 p0.35 | (0, 0.55, 0.85) | (0, 0.48, 0) | 28 | +4° | Cap macro, cap ≈ 70% VW |
| K6 | 05 | (0, 0.05, 4.60) | (0, 0.05, 0) | 35 | 0° | Pulled back (bottle 38% VH) during the ivory breath. The cut is hidden behind the blade wipe. |
| K7 | 06 | (0, -0.22, 2.05) | (0, 0.05, 0) | 35 | -8° | Low angle, centred, bottle ≈ 88% VH. Camera +6% push across the whole pin. |
| K8 | 07 | (0, 0.05, 3.10) | (0, 0.05, 0) | 35 | 0° | Pull-back, eye level. DOF focus on the bottle, type plane behind at z = -2. |
| K9 | 08 | (0.25, 0.08, 3.20) | (0.10, 0.05, 0) | 35 | 0° | Frames the bottle left + arc right |
| K10 | 09 | (0, 1.05, 2.90) | (0, 0.02, 0) | 35 | +18° (looking down) | High angle turntable (B6) |
| K11 | 10 | (0, 0.10, 3.40) | (0, 0.05, 0) | 35 | ~-1° | **Returns exactly to K0**: bookend composition |

Rules
- **Roll:** never roll the camera. Roll the *bottle* (rotZ). That reads as product styling, not a shaky camera.
- **Hold rule:** every scene keeps ≥ 30% of its pin as a *hold* where the camera moves < 3%. The reference's premium feel comes from these holds.
- **Mouse parallax:** camera position offset ±0.04 u x / ±0.025 u y from the cursor, lerp 0.05, disabled in 03/04 macros (where it would feel shaky) and on touch.
- **Velocity damping:** the camera rig follows the scroll target with a critically damped spring (stiffness 120, damping 22), *on top of* Lenis, so fast trackpad flicks (like in the reference) don't snap the camera.

---

## F. ASSETS REQUIRED

**⚠️ The perfume bottle image was not in the upload.** Only the video arrived. Please re-upload it. Everything below assumes a black glass bottle with a gold cap.

| # | Asset | Spec | Priority | Notes |
|---|---|---|---|---|
| 1 | **Bottle 3D model (GLB)** | ≤ 60k tris, separate meshes: glass, liquid, cap, collar, label/engraving. UVs, Draco/Meshopt compressed, ≤ 2.5 MB. | **Critical** for true rotation (02, 04, 06, 09) | Can be modelled in Blender from your photo (front + side photos needed, or exact dimensions) |
| 2 | **Bottle hero image** (the one you have) | ≥ 3000 px tall, transparent PNG/WebP or clean on black, studio-lit | Critical | Used as fallback, poster, OG image, low-power 2.5D mode, and for texture/label reference |
| 3 | Bottle side + back photos (or dimensions) | Same lighting | High | For modelling accuracy and the back-engraving copy (06 scan targets) |
| 4 | **Label / engraving artwork** | SVG of the NOIRÉ logo + back-label text (note names positioned at the scan heights) | High | Becomes normal/emissive maps |
| 5 | **HDRI** | Studio softbox 2K .hdr (CC0, e.g. Poly Haven "studio_small_09") | Critical | Reflections |
| 6 | Turntable image sequence (alternative to #1) | 72 frames × 1600 px, WebP/AVIF, ~4–6 MB total | Alternative | If no GLB: a rendered or photographed 360° sequence for 06/09 |
| 7 | **Smoke** | (a) 8 s seamless loop, dark bg, 1920×1080 H.265/VP9 + alpha-luma, ≤ 3 MB, **or** (b) procedural shader (no asset) | High | 07 + subtle overlays |
| 8 | Ingredient cut-outs | 6 × transparent WebP, 1200 px, consistently lit (warm key from the top-left) | Medium | 08. Stock or AI-generated, colour-graded to match. |
| 9 | Plinth + lamp | Simple procedural geometry (no asset) | – | Built in Three.js |
| 10 | **Fonts** | Didone display (e.g. "Bodoni Moda" / "Playfair Display" free, or licensed "Canela", "Ogg", "Saol Display") + clean grotesk (e.g. "Inter", "Neue Montreal") + mono for numerals | High | Licensing for commercial use |
| 11 | Copy | Notes (top/heart/base), ingredient origins, specs, price, sizes | Medium | Placeholder copy if needed |
| 12 | Film grain texture | 512² tileable noise | Low | Or procedural |
| 13 | Audio (optional) | Ambient low drone + subtle "lamp" tick | Optional | The reference shows a sound toggle. Muted by default. |

---

## G. CSS / GSAP (no WebGL needed)

- Lenis smooth scroll + GSAP ScrollTrigger orchestration (pins, scrub, snap, progress values that feed WebGL uniforms)
- All HTML typography: line splits (SplitText or a custom splitter), translate/opacity/blur reveals, **echo-settle** (two stacked spans), highlight-bar reveals (`clip-path` / `scaleX` with `transform-origin: left`), callout hairline draws (SVG `stroke-dashoffset`)
- **Footer construction-line wordmark** (SVG stroke drawing)
- Preloader hairline
- Top progress line, right chapter rail, custom cursor, magnetic CTA, hover fill wipes
- Crosshair grid (CSS `background-image` with radial/linear gradients, or a single SVG pattern)
- Ingredient caption clip-path swaps
- The giant blurred type in 07 (`filter: blur()` on HTML text over the canvas is cheap if not animated every frame; animate the transform only)
- `prefers-reduced-motion` alternative (crossfades, no scrub-pins, static hero)
- Mobile layout reflows

## H. REQUIRES THREE.JS / WebGL

- **The bottle itself**: physical glass with transmission/refraction, clearcoat, dispersion; anisotropic gold; HDRI reflections
- **Continuous camera rig** across all scenes (the core of the premium feel; impossible convincingly in CSS)
- Light sweeps (moving area light or shader highlight)
- **Scene 01 wordmark refracted through the glass** (needs the wordmark as a texture behind the transmissive mesh)
- **Background colour-flood** (radial mask expanding from the bottle's projected screen position) and the per-chapter hue lerps — a fullscreen shader quad
- **Scan band** on the glass (custom shader chunk injected into the physical material via `onBeforeCompile`)
- **Gold blade wipe** (05): mesh + post chromatic aberration + grain
- Depth of field (03, 07): postprocessing `DepthOfFieldEffect` / bokeh
- Smoke (07): fbm noise shader with backlight, or video texture composited in-scene
- Ingredient arc with velocity bend (08) — could be CSS 3D, but WebGL gives the bend and DOF properly
- Dust particles (instanced points, ~300 desktop / 120 mobile)
- Plinth, lamp + visible light cone, floor glow pool
- Post stack: tone mapping, subtle bloom (threshold 0.85, intensity 0.35 — only speculars and the lamp bloom), chromatic aberration (velocity-driven), grain, vignette

Recommended stack: **Vite + TypeScript + Three.js (r17x) + `postprocessing` + GSAP 3 (ScrollTrigger, SplitText) + Lenis.** No React needed, but R3F + drei is an option if you prefer components.

## I. WHAT CAN USE THE PROVIDED IMAGE AS 2.5D

If no GLB model exists, the photo can carry much of the experience in **2.5D** (a textured plane in the WebGL scene plus a generated **depth map** and **normal map**, made with Depth-Anything / Marigold, then cleaned up):

| Scene | 2.5D viability | Technique |
|---|---|---|
| 00 Preloader light cues | ✅ Full | Exposure/relight via shader using the normal map |
| 01 Reveal | ✅ Good | Plane + depth-displacement parallax (±5° fake rotation max), light sweep via a normal-mapped specular pass. The wordmark goes behind and is "refracted" via a masked distortion inside the glass silhouette (alpha mask). |
| 02 Flood + dolly-in | ✅ Full | Scale/translate/rotZ of the plane, flood shader. No Y rotation beyond ±5°. |
| 03 Glass macro | ⚠️ Needs a hi-res source (≥ 6000 px) | Zoom into the image, with DOF as a gaussian on the depth map |
| 04 Cap detail | ⚠️ Partial | Zoom + an anisotropic sweep fake over the cap mask. **No real cap rotation.** |
| 05 Blade wipe / ivory | ✅ Full | Silhouette = the image's alpha mask, tinted black |
| 06 Notes (label scan) | ❌ Rotation impossible / ⚠️ fallback | Without rotation: keep the bottle front-facing, slide it horizontally, and run the scan band vertically over the *front* face. It loses the B4 "turn to reveal" magic. |
| 07 Smoke | ✅ Full | Plane works perfectly (the bottle faces front in this scene) |
| 08 Ingredients | ✅ Full | Bottle static in the left third |
| 09 360° turntable | ❌ Needs a GLB or a 72-frame sequence | – |
| 10 Final hero + CTA | ✅ Full | B1 restage with the plane. Siblings = the same image scaled, darkened, rim-tinted. |

**Recommendation:** a **hybrid**. Build with the 2.5D image first so we can lock layout, camera and timing quickly. Then swap in a GLB (same scene graph, same rig) for 04, 06 and 09. The 2.5D path also becomes the **low-power/mobile fallback**.

## J. BIGGEST TECHNICAL RISKS

1. **No true 3D asset (biggest).** The B4-style rotating label-scan, the cap rotation and the 360° turntable are the reference's strongest ideas, and they require a GLB or a rendered turntable. With only one photo, those scenes have to be redesigned. *Mitigation:* model the bottle (≈ 1–2 days for a skilled 3D artist) or render a turntable sequence.
2. **Black glass is the hardest material to make look expensive.** Dark glass shows only its reflections; with a bad HDRI it becomes a black blob. *Mitigation:* a custom HDRI with strong vertical strip lights; rim lights tuned per scene; screenshot reviews against real perfume photography.
3. **Transmission + DOF + bloom performance.** `MeshPhysicalMaterial` transmission renders an extra pass, and DOF plus bloom add more. 60 fps on a mid-range laptop and iPhone 12+ is not guaranteed. *Mitigation:* adaptive DPR (cap 1.5 desktop / 1.25 mobile), a performance monitor that degrades (DOF off → transmission off → 2.5D), keep transmission only in 01/03 and fake it elsewhere.
4. **Scroll-sync jank on trackpads.** The reference user flicks very fast. Pinned scrubs with snap can fight Lenis inertia (the "rubber-band" feel). *Mitigation:* one master timeline, the camera on a damped spring, snap only in 06, careful `anticipatePin`.
5. **iOS Safari:** the address-bar resize breaks `vh` pins (use `svh`/`lvh` + `ScrollTrigger.normalizeScroll`), WebGL memory limits (≤ 256 MB of textures), no `dispersion` support on some GPUs.
6. **Text legibility over moving 3D** (the left column over the radial gradient). *Mitigation:* keep the bottle to the right during text scenes, add a subtle left-side darkening in the flood shader.
7. **Smoke realism.** Procedural fbm smoke can look like "noise". A real smoke plate looks better but costs bandwidth and alpha compositing complexity. *Mitigation:* a video plate with luma-keyed screen blend + shader distortion on top.
8. **Total payload / time-to-first-frame.** GLB + HDRI + smoke + fonts can exceed 8–10 MB. *Mitigation:* a staged loader (hero assets first ≤ 3 MB, lazy-load scenes 06+), KTX2/Basis textures, Meshopt.
9. **Accessibility & SEO.** A canvas-driven page hides content. *Mitigation:* real semantic HTML for all copy, `prefers-reduced-motion` path, keyboard-operable size selector/CTA.
10. **Over-borrowing.** Site B's identity is strongly "colour flood + ultra-bold condensed type". We take the *camera grammar* (stage → flood dolly → pinned label-scan → smoke DOF → restage) but invert the palette (noir/gold vs. saturated magenta) and the type (refined Didone vs. heavy condensed). That keeps us clearly original.

---

### Open questions for approval
1. Please **re-upload the bottle image.** Do you also have, or can you commission, a **3D model**? (This decides full-3D vs. 2.5D for scenes 04/06/09.)
2. Single bottle only, or show the **size/concentration siblings** in the hero (B1-style ring)?
3. Framework preference: vanilla Vite + Three, or React/Next + R3F?
4. Real copy (notes, ingredients, price), or placeholders for now?
5. Fonts: free (Bodoni Moda / Inter), or do you have licensed display faces?

**STOPPED. Awaiting your approval before any build.**
