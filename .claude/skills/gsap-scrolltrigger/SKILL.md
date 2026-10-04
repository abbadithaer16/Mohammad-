---
name: gsap-scrolltrigger
description: GSAP timelines and ScrollTrigger orchestration for scroll-controlled product films — scrubbed and pinned sequences, one timeline driving camera, model, lighting and DOM typography together, rhythm (move/hold/reveal), cleanup, responsive refresh and reduced motion. Use whenever adding or changing scroll choreography, intro sequences or synchronized DOM + WebGL animation.
---

# GSAP + SCROLLTRIGGER — Directing the film with scroll

## Purpose

Turn scroll into a film's timeline. One pinned ScrollTrigger scrubs ONE GSAP
timeline that moves the camera along its path, turns the product, changes
light and atmosphere, and reveals typography, all in sync. The user should
feel they are moving a camera through one set, not scrolling past sections.

## When to use

- Any scroll-driven motion (camera, product, light, copy).
- Intro sequences (time-based) before scroll takes over.
- Navigation that must travel to a cinematic state.
- Reduced-motion behaviour, refresh and resize issues, pin problems.

## Implementation principles

1. **One master scroll timeline.** A single `ScrollTrigger` with `pin: true`
   and `scrub` drives a single timeline for the whole film
   (`src/motion/journeyTimeline.js`). Separate per-section triggers
   inevitably drift, reset and create "section" feelings.
2. **Animate abstract values, not objects.** GSAP tweens plain numbers on
   the shared `stage` object (`cam`, `rot`, `flood`, `scan`…); the R3F loop
   reads them. GSAP never touches Three.js objects directly, and React never
   re-renders for motion.
3. **Timeline time = scroll distance.** Author positions in viewport heights
   (1.0 = 100vh) and set the trigger end to `+=${innerHeight * TOTAL_VH}`. The
   numbers in the code then read directly as scroll pacing.
4. **Rhythm, not uniform speed.** Plot beats: MOVE → HOLD → REVEAL → MOVE →
   ACCELERATE → MACRO → PULL BACK → BREATHE → RETURN → SETTLE. Holds are
   real stretches where the camera barely moves (with a slow creep) while
   copy lands.
5. **Text follows the camera.** Copy enters only after the camera move has
   begun or settled, and leaves only after the next move has started.
   Typography never leads the scene.
6. **Every transition is physical.** It's caused by camera travel, product
   rotation, light, smoke or depth, never by a bare opacity crossfade between
   sections.

## Technical rules

### Setup
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0); // a film keeps wall-clock time (see below)
```

### The master timeline
```js
const tl = gsap.timeline({
  defaults: { immediateRender: false },   // scrubbed fromTo must not jump on build
  scrollTrigger: {
    trigger: frame,                       // the pinned 100svh DOM frame
    start: 'top top',
    end: () => `+=${innerHeight * JOURNEY_VH}`,
    pin: true,
    scrub: reduce ? true : 0.7,           // 0.5–1.0: smooth but responsive
    invalidateOnRefresh: true,
    onUpdate: track, onRefresh: track, onLeaveBack: track,
  },
});
```
- **Always `fromTo` with explicit from-values** for anything that several
  scenes touch (`rimScale`, `haze`, `dim`…). With `immediateRender: false`
  this makes forward AND backward scrubbing deterministic.
- Chain values honestly: if Scene 5 ends `haze` at 1.75, Scene 7 must start
  its tween from 1.75.
- Helper pattern used in this repo:
  ```js
  const move = (from, to, at, d, ease) => tl.fromTo(stage, { cam: from }, { cam: to, duration: d, ease }, at);
  const set  = (p, a, b, at, d, ease='power2.inOut') => tl.fromTo(stage, { [p]: a }, { [p]: b, duration: d, ease }, at);
  ```
- End the timeline with an explicit rest: `tl.to({}, { duration: 0.01 }, TOTAL - 0.01)`.

### Easing vocabulary
| Intent | Ease |
|---|---|
| Camera travel between holds | `power3.inOut` |
| Acceleration into a macro | `expo.inOut` |
| Pull-back / throw | `power2.inOut` then `sine.in` (keeps travelling) |
| Atmosphere colour shifts | `expo.inOut` |
| Light levels | `power2.inOut` |
| Typography in | `power4.out` / `expo.out` (masked line reveals) |
| Typography out | `power2.in`, short (0.25–0.4) |
| Slow product turns, creep | `sine.inOut`, `none` |
Never `bounce`, `elastic` or `back` in a luxury film.

### Scrub and smoothing
- Use `scrub: 0.5–1` (seconds of catch-up). Then add **time-based damping in
  the render loop** on top (`MathUtils.damp`). Together they make fast
  trackpad flicks glide instead of snapping, without feeling laggy.
- Don't over-smooth: `scrub` above ~1.5 plus heavy damping feels disconnected
  from the hand.

### Typography (avoid generic fades)
- Masked line reveals: wrap each line in `.line { overflow: hidden }` and
  animate the inner span `yPercent: 108 → 0`.
- Hairline rules `scaleX: 0 → 1` from the left.
- Notes that react to the product: tween a line's colour to lit gold at the
  exact timeline time the light scan crosses the matching part of the
  bottle, then settle back.
- Never transform a parent that contains absolutely positioned children
  you rely on (e.g. a mobile CTA row anchored to the hero): a transform
  creates a new containing block and moves them. Animate wrapper children
  instead (`.hero-text` and `.ctas` separately).

### Intro (time-based) → scroll hand-over
- Play the intro as a normal timeline, lock scroll (`html.is-locked { overflow: hidden }`),
  and unlock at a cue (`tl.call(unlock, null, Math.min(2.9, tl.duration()))`).
- Add a real-time safety net (`setTimeout(unlock, 4500)`).
- `gsap.ticker.lagSmoothing(0)`: otherwise GSAP slows the intro on slow
  devices (33 ms per frame cap) and the UI is withheld for minutes.
- Create the master scroll timeline after the scene is compiled
  (`sceneReady` promise), and set `history.scrollRestoration = 'manual'`
  so a refresh always starts at the first shot.

### Navigation into states
```js
gsap.registerPlugin(ScrollToPlugin);
gsap.to(window, { scrollTo: { y: st.start + HOLDS.s3 * innerHeight, autoKill: true },
  duration: clamp(distanceVh * 0.22, 0.9, 2.6), ease: 'power2.inOut' });
```
The camera then travels through the intervening film rather than jumping.

### Tracking the current scene
Compute the scene from `self.progress * TOTAL_VH` in `onUpdate`/`onRefresh`/
`onLeaveBack`, write it to `html[data-scene]` and use it for nav state and
interaction gating. Treat the first ~5% of a viewport as the opening scene:
pins often start a sub-pixel early.

### Responsive
- `invalidateOnRefresh: true` plus function-based `end` values.
- Layout-dependent values (camera keys, copy widths) are recomputed from
  viewport size in render code, not baked into tweens.

### Reduced motion
- Detect `matchMedia('(prefers-reduced-motion: reduce)')`.
- Intro: jump to composed final states over ~1 s with no camera travel.
- Scroll: `scrub: true` plus `snap` to composed holds, so each gesture
  settles on a still composition. Disable pointer parallax and idle drift.
- Keep every piece of content reachable.

### Cleanup
```js
return () => { outro?.kill(); tl.scrollTrigger?.kill(); tl.kill(); intro?.kill(); };
```
Guard against React StrictMode double effects with a `cancelled` flag.

## Common mistakes to avoid

- One ScrollTrigger per section, each with its own pin (sections feel separate,
  and pins fight each other).
- `gsap.from()` in scrubbed timelines (immediate render jumps; reverse breaks).
- Fading everything in and out by opacity: the "template" look.
- Text entering before the camera moves.
- Uniform pacing: every scene the same length and easing.
- Forgetting `invalidateOnRefresh` when distances depend on `innerHeight`.
- Animating `transform` on a parent of absolutely positioned layout elements.
- Leaving GSAP lag smoothing on for a time-critical intro.

## Performance considerations

- Tween plain objects; never call `setState` from `onUpdate`.
- Keep the DOM layer light: transforms and opacity only, and `will-change`
  only on actively animated text.
- `ScrollTrigger.refresh()` is expensive; let it run on resize, not per frame.
- Avoid `snap` for normal motion: it fights the user's hand. Use it only for
  reduced motion.

## Practical patterns in this repository

- Master timeline + scene map + holds: `src/motion/journeyTimeline.js`
  (`SCENES`, `HOLDS`, `JOURNEY_VH`).
- Intro: `src/motion/introTimeline.js` (sequential light cues, copy after the
  product).
- Navigation: `src/motion/navigation.js` (`DESTINATIONS`, `scrollToState`).
- Outro: a second ScrollTrigger on the footer writes `stage.outro`, applied
  undamped in the camera rig so the bottle rises exactly with the page.

Adding a beat: pick the timeline time in vh, add `move()`/`turn()` for the
camera and product, cue light with `set()`, then add copy tweens AFTER the
move starts. Keep from-values continuous with the previous beat, and check
by scrubbing backwards.
