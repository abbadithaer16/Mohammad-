import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stage } from './stage';

gsap.registerPlugin(ScrollTrigger);

// SCENES 2 → 9 · one pinned, scrubbed shot
//
// A single ScrollTrigger pins the frame and scrubs ONE timeline, so the
// camera, bottle and light can never "reset" between scenes: each scene picks
// up exactly where the previous one left the shared `stage` values.
//
// Timeline time is measured in viewport heights of scroll (1.0 = 100vh).
export const SCENES = {
  s2: [0.0, 2.2], // colour flood + dolly-in
  s3: [2.2, 4.2], // top notes
  s4: [4.2, 6.2], // heart notes
  s5: [6.2, 8.4], // base notes
  s6: [8.4, 10.8], // cap / material macro (a longer dwell: inspection)
  s7: [10.8, 12.9], // smoke interlude (a breath)
  s8: [12.9, 15.3], // signature 360 moment (time to interact)
  s9: [15.3, 17.1], // final product hero / CTA (the payoff, then rest)
};
export const JOURNEY_VH = SCENES.s9[1];
const SCENE_ORDER = Object.entries(SCENES);

const IVORY = 'rgba(236, 228, 216, 1)';
const IVORY_DIM = 'rgba(236, 228, 216, 0.42)';
const GOLD_LIT = 'rgba(222, 196, 150, 1)';

export function createJourney(frame) {
  const q = (sel) => frame.querySelectorAll(sel);
  const chapter = (name) => frame.querySelector(`[data-chapter="${name}"]`);
  const inChapter = (name, sel) => chapter(name).querySelectorAll(sel);

  // initial (hidden) states for every layer that enters later
  gsap.set(q('[data-s2="line"], [data-n="line"]'), { yPercent: 108 });
  gsap.set(q('[data-s2="fade-late"]'), { autoAlpha: 0, y: 16 });
  gsap.set(q('[data-s2="rule"], [data-n="rule"]'), { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(q('[data-n="label"]'), { autoAlpha: 0 });
  gsap.set(q('[data-n="line"]'), { color: IVORY_DIM });
  gsap.set(q('[data-m="fade"]'), { autoAlpha: 0, y: 10 });
  gsap.set(q('[data-sig="fade"]'), { autoAlpha: 0, y: 12 });
  gsap.set(q('[data-fin="line"]'), { yPercent: 108 });
  gsap.set(q('[data-fin="fade"]'), { autoAlpha: 0, y: 16 });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dragZone = frame.querySelector('[data-drag-zone]');
  let current = '';
  // which scene is on screen: drives nav state, drag availability, etc.
  const track = (self) => {
    const t = self.progress * JOURNEY_VH;
    const found = SCENE_ORDER.find(([, [a, b]]) => t >= a && t < b);
    const name = self.progress <= 0 ? 's1' : found ? found[0] : 's9';
    if (name === current) return;
    current = name;
    document.documentElement.dataset.scene = name;
    if (dragZone) dragZone.tabIndex = name === 's8' ? 0 : -1;
  };

  const tl = gsap.timeline({
    defaults: { immediateRender: false },
    scrollTrigger: {
      trigger: frame,
      start: 'top top',
      end: () => `+=${window.innerHeight * JOURNEY_VH}`,
      pin: true,
      // input smoothed for 0.8 s, then the camera rig damps on top: fast
      // trackpad flicks glide through the scenes instead of snapping
      scrub: reduce ? true : 0.8,
      invalidateOnRefresh: true,
      onUpdate: track,
      onRefresh: track,
      onLeaveBack: track,
      // reduced motion: every scroll gesture settles on a composed still
      snap: reduce
        ? {
            snapTo: SCENE_ORDER.map(([, [, b]]) => (b - 0.05) / JOURNEY_VH).concat(0),
            duration: { min: 0.2, max: 0.6 },
            ease: 'power1.inOut',
          }
        : undefined,
    },
  });

  // =========================================================================
  // SCENE 2 — COLOUR FLOOD + DOLLY-IN           (0.0 → 2.2 vh)
  // camera starts → environment warms → bottle grows → text enters
  // =========================================================================
  tl.fromTo(stage, { push: 0 }, { push: 1, duration: 1.9, ease: 'power3.inOut' }, 0)
    .fromTo(stage, { turn2: 0 }, { turn2: 1, duration: 1.9, ease: 'power3.inOut' }, 0.08)
    // hero copy steps back only once the camera is already moving
    .fromTo(q('.hero-copy, .scroll-cue-wrap'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -36, duration: 0.48, ease: 'power2.in', stagger: 0.04 }, 0.09)
    .fromTo(stage, { flood: 0 }, { flood: 1, duration: 1.55, ease: 'expo.inOut' }, 0.22)
    .fromTo(stage, { fillScale: 1 }, { fillScale: 0.6, duration: 1.3, ease: 'power2.inOut' }, 0.26)
    .fromTo(stage, { side: 0 }, { side: 1, duration: 1.35, ease: 'power3.inOut' }, 0.35)
    .fromTo(stage, { collar: 0 }, { collar: 1, duration: 0.9, ease: 'power2.out' }, 0.92)
    // editorial copy, once the bottle has grown
    .fromTo(q('[data-s2="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power4.out' }, 1.1)
    .fromTo(q('[data-s2="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.62, ease: 'power4.out', stagger: 0.11 }, 1.2)
    .fromTo(q('[data-s2="fade-late"]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.52, ease: 'power4.out' }, 1.45);
  // 1.9 → 2.2 hold

  // =========================================================================
  // SCENE 3 — TOP NOTES                          (2.2 → 4.2 vh)
  // bottle turns +35°, camera favours the top, a light scan travels down the
  // stopper → collar → shoulder; each note lights as "its" facets flare
  // =========================================================================
  const s3 = SCENES.s3[0];
  tl.fromTo(stage, { turn3: 0 }, { turn3: 1, duration: 1.3, ease: 'power3.inOut' }, s3 + 0.05)
    .fromTo(stage, { focus: 0 }, { focus: 1, duration: 1.15, ease: 'power3.inOut' }, s3 + 0.05)
    // Scene 2 copy leaves after the rotation has begun
    .fromTo(q('.scene2-copy'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, s3 + 0.15)
    .fromTo(stage, { topBoost: 0 }, { topBoost: 1, duration: 0.8, ease: 'power2.inOut' }, s3 + 0.2)
    // light scan: fades in above the stopper, travels down, fades out at the shoulder
    .fromTo(stage, { scan: 0 }, { scan: 1, duration: 0.18, ease: 'sine.out' }, s3 + 0.5)
    .fromTo(stage, { scanY: 1.15 }, { scanY: 0.55, duration: 0.95, ease: 'power1.inOut' }, s3 + 0.55)
    .fromTo(stage, { scan: 1 }, { scan: 0, duration: 0.22, ease: 'sine.in' }, s3 + 1.35);

  const top = 'top';
  tl.fromTo(inChapter(top, '[data-n="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, s3 + 0.6)
    .fromTo(inChapter(top, '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, s3 + 0.6)
    .fromTo(inChapter(top, '[data-n="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.1 }, s3 + 0.68);
  // notes react to the product: each line warms to lit gold as the scan crosses
  // its height on the bottle (stopper 1.0 → collar 0.8 → shoulder 0.62), then settles
  inChapter(top, '[data-n="line"]').forEach((line, i) => {
    const at = s3 + 0.7 + i * 0.27;
    tl.to(line, { color: GOLD_LIT, duration: 0.16, ease: 'sine.out' }, at).to(line, { color: IVORY, duration: 0.4, ease: 'sine.inOut' }, at + 0.18);
  });
  // 1.6 → 2.0 hold

  // =========================================================================
  // SCENE 4 — HEART NOTES                        (4.2 → 6.2 vh)
  // bottle turns a further +35°, camera arcs 11° and lowers, the room deepens
  // to red-brown, a low warm side light takes over from the top light
  // =========================================================================
  const s4 = SCENES.s4[0];
  tl.fromTo(stage, { turn4: 0 }, { turn4: 1, duration: 1.35, ease: 'power3.inOut' }, s4 + 0.05)
    .fromTo(stage, { arc: 0 }, { arc: 1, duration: 1.45, ease: 'power3.inOut' }, s4 + 0.05)
    .fromTo(stage, { focus: 1 }, { focus: 0, duration: 1.3, ease: 'power3.inOut' }, s4 + 0.05)
    .fromTo(chapter(top), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, s4 + 0.15)
    .fromTo(stage, { topBoost: 1 }, { topBoost: 0.25, duration: 0.8, ease: 'power2.inOut' }, s4 + 0.1)
    .fromTo(stage, { hue: 0 }, { hue: 1, duration: 1.2, ease: 'expo.inOut' }, s4 + 0.2)
    .fromTo(stage, { fillScale: 0.6 }, { fillScale: 0.42, duration: 0.9, ease: 'power2.inOut' }, s4 + 0.2)
    .fromTo(stage, { low: 0 }, { low: 1, duration: 0.95, ease: 'power3.inOut' }, s4 + 0.4)
    .fromTo(stage, { haze: 1 }, { haze: 1.35, duration: 1.1, ease: 'sine.inOut' }, s4 + 0.3);

  const heart = 'heart';
  tl.fromTo(inChapter(heart, '[data-n="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, s4 + 0.65)
    .fromTo(inChapter(heart, '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, s4 + 0.65)
    .fromTo(inChapter(heart, '[data-n="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.55, ease: 'power4.out', stagger: 0.12 }, s4 + 0.75);
  // the heart warms slowly, following the low side light rising
  inChapter(heart, '[data-n="line"]').forEach((line, i) => {
    tl.to(line, { color: IVORY, duration: 0.5, ease: 'sine.inOut' }, s4 + 0.95 + i * 0.14);
  });
  // 1.6 → 2.0 hold

  // =========================================================================
  // SCENE 5 — BASE NOTES                         (6.2 → 8.4 vh)
  // heavier, darker, lower: the bottle turns a slow +35° toward a dark profile,
  // the camera settles lower and closer, upper light recedes, and each base
  // note gets its own light state on the bottle
  // =========================================================================
  const s5 = SCENES.s5[0];
  tl.fromTo(stage, { turn5: 0 }, { turn5: 1, duration: 1.55, ease: 'power3.inOut' }, s5 + 0.05)
    .fromTo(stage, { deep: 0 }, { deep: 1, duration: 1.6, ease: 'power3.inOut' }, s5 + 0.05)
    .fromTo(chapter(heart), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, s5 + 0.15)
    // upper / front brightness recedes, depth in the shadows
    .fromTo(stage, { topBoost: 0.25 }, { topBoost: 0, duration: 0.8, ease: 'power2.inOut' }, s5 + 0.1)
    .fromTo(stage, { envScale: 1 }, { envScale: 0.72, duration: 1.0, ease: 'power2.inOut' }, s5 + 0.1)
    .fromTo(stage, { fillScale: 0.42 }, { fillScale: 0.3, duration: 0.9, ease: 'power2.inOut' }, s5 + 0.1)
    .fromTo(stage, { low: 1 }, { low: 0.5, duration: 0.9, ease: 'power2.inOut' }, s5 + 0.3)
    .fromTo(stage, { dim: 0 }, { dim: 0.25, duration: 1.2, ease: 'power2.inOut' }, s5 + 0.2);

  const base = 'base';
  tl.fromTo(inChapter(base, '[data-n="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, s5 + 0.5)
    .fromTo(inChapter(base, '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, s5 + 0.5)
    .fromTo(inChapter(base, '[data-n="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.1 }, s5 + 0.58);

  // ingredient beats: the bottle's light changes with each note, and the note
  // line warms at the same moment (text follows the product, never leads)
  const BEAT = { amber: s5 + 0.6, musk: s5 + 0.95, sandalwood: s5 + 1.28, vanilla: s5 + 1.6 };
  // AMBER · rich warm glow low in the glass
  tl.fromTo(stage, { baseGlow: 0 }, { baseGlow: 1, duration: 0.55, ease: 'power2.out' }, BEAT.amber);
  // MUSK · softer, diffused: sharp rims dip, haze thickens, then recover partly
  tl.fromTo(stage, { rimScale: 1 }, { rimScale: 0.55, duration: 0.32, ease: 'sine.inOut' }, BEAT.musk)
    .fromTo(stage, { haze: 1.35 }, { haze: 1.75, duration: 0.4, ease: 'sine.inOut' }, BEAT.musk)
    .fromTo(stage, { rimScale: 0.55 }, { rimScale: 0.85, duration: 0.4, ease: 'sine.inOut' }, BEAT.sandalwood);
  // SANDALWOOD · woody brown atmosphere, directional side light
  tl.fromTo(stage, { wood: 0 }, { wood: 1, duration: 0.6, ease: 'expo.inOut' }, BEAT.sandalwood)
    .fromTo(stage, { sideScale: 1 }, { sideScale: 1.2, duration: 0.5, ease: 'power2.inOut' }, BEAT.sandalwood);
  // VANILLA · a faint ivory-gold lift, never bright
  tl.fromTo(stage, { ivory: 0 }, { ivory: 1, duration: 0.45, ease: 'power2.inOut' }, BEAT.vanilla);

  inChapter(base, '[data-n="line"]').forEach((line, i) => {
    const at = Object.values(BEAT)[i] + 0.05;
    tl.to(line, { color: GOLD_LIT, duration: 0.16, ease: 'sine.out' }, at).to(line, { color: IVORY, duration: 0.4, ease: 'sine.inOut' }, at + 0.18);
  });
  // 2.0 → 2.2 hold

  // =========================================================================
  // SCENE 6 — CAP / MATERIAL MACRO               (8.4 → 10.6 vh)
  // the camera physically travels up to the stopper + collar: push in, rise,
  // a further ~6° arc, lens tightens to 24°. Focus racks stopper -> collar ->
  // glass edge while a warm sweep crosses the gold.
  // =========================================================================
  const s6 = SCENES.s6[0];
  tl.fromTo(stage, { macro: 0 }, { macro: 1, duration: 1.5, ease: 'power3.inOut' }, s6 + 0.05)
    .fromTo(stage, { turn6: 0 }, { turn6: 1, duration: 1.9, ease: 'sine.inOut' }, s6 + 0.1)
    .fromTo(chapter(base), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, s6 + 0.12)
    .fromTo(stage, { dim: 0.25 }, { dim: 0.7, duration: 1.0, ease: 'power2.inOut' }, s6 + 0.1)
    .fromTo(stage, { low: 0.5 }, { low: 0, duration: 0.8, ease: 'power2.inOut' }, s6 + 0.2)
    .fromTo(stage, { baseGlow: 1 }, { baseGlow: 0.3, duration: 0.8, ease: 'power2.inOut' }, s6 + 0.2)
    .fromTo(stage, { rimScale: 0.85 }, { rimScale: 1.1, duration: 0.8, ease: 'power2.inOut' }, s6 + 0.4)
    // focus: arrives on the stopper as the camera lands, then racks
    .fromTo(stage, { dof: 0 }, { dof: 1, duration: 0.5, ease: 'power2.out' }, s6 + 0.7)
    .fromTo(stage, { rack: 0 }, { rack: 1, duration: 0.35, ease: 'power2.inOut' }, s6 + 1.15)
    .fromTo(stage, { rack: 1 }, { rack: 2, duration: 0.35, ease: 'power2.inOut' }, s6 + 1.65)
    // warm gold sweep across the collar
    .fromTo(stage, { sweep: -1.5 }, { sweep: 1.5, duration: 0.9, ease: 'power2.inOut' }, s6 + 1.0)
    .fromTo(stage, { sweepOn: 0 }, { sweepOn: 0.8, duration: 0.2, ease: 'sine.out' }, s6 + 1.0)
    .fromTo(stage, { sweepOn: 0.8 }, { sweepOn: 0, duration: 0.25, ease: 'sine.in' }, s6 + 1.65)
    .fromTo(q('[data-m="fade"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, s6 + 1.1);
  // 2.0 → 2.2 hold

  // =========================================================================
  // SCENE 7 — SMOKE INTERLUDE                    (10.6 → 12.6 vh)
  // breathe out: the camera retreats to a wide, centred pose, focus opens,
  // highlights soften, the room deepens and dark smoke rises around a bottle
  // that now seems suspended. A huge, unfocused NOIRÉ hangs behind it.
  // =========================================================================
  const s7 = SCENES.s7[0];
  tl.fromTo(stage, { breathe: 0 }, { breathe: 1, duration: 1.6, ease: 'power3.inOut' }, s7 + 0.05)
    .fromTo(stage, { turn7: 0 }, { turn7: 1, duration: 1.9, ease: 'sine.out' }, s7 + 0.05)
    .fromTo(stage, { dof: 1 }, { dof: 0, duration: 0.5, ease: 'power2.inOut' }, s7 + 0.05)
    .fromTo(q('[data-m="fade"]'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.3, ease: 'power2.in' }, s7 + 0.1)
    .fromTo(stage, { smoke: 0 }, { smoke: 1, duration: 1.2, ease: 'power2.inOut' }, s7 + 0.2)
    .fromTo(stage, { haze: 1.75 }, { haze: 2.3, duration: 1.2, ease: 'sine.inOut' }, s7 + 0.2)
    .fromTo(stage, { dim: 0.7 }, { dim: 1, duration: 1.0, ease: 'power2.inOut' }, s7 + 0.3)
    .fromTo(stage, { rimScale: 1.1 }, { rimScale: 0.6, duration: 1.0, ease: 'power2.inOut' }, s7 + 0.3)
    .fromTo(stage, { sideScale: 1.2 }, { sideScale: 0.7, duration: 1.0, ease: 'power2.inOut' }, s7 + 0.3)
    .fromTo(stage, { envScale: 0.72 }, { envScale: 0.55, duration: 1.0, ease: 'power2.inOut' }, s7 + 0.3)
    .fromTo(stage, { collar: 1 }, { collar: 0.4, duration: 0.9, ease: 'power2.inOut' }, s7 + 0.3)
    .fromTo(stage, { plinth: 1 }, { plinth: 0.15, duration: 1.0, ease: 'power2.inOut' }, s7 + 0.3)
    .fromTo(stage, { word: 0 }, { word: 1, duration: 1.0, ease: 'power2.inOut' }, s7 + 0.55);
  // 1.65 → 2.1 hold: a breath

  // =========================================================================
  // SCENE 8 — SIGNATURE 360 MOMENT               (12.9 → 15.3 vh)
  // out of the smoke into a clean studio: the camera comes closer to a
  // balanced composition and orbits subtly while the bottle turns a slow
  // +170°. In the middle of the scene the visitor can turn it themselves.
  // =========================================================================
  const s8 = SCENES.s8[0];
  tl.fromTo(stage, { studio: 0 }, { studio: 1, duration: 1.3, ease: 'power3.inOut' }, s8 + 0.05)
    .fromTo(stage, { orbit: 0 }, { orbit: 1, duration: 2.2, ease: 'sine.inOut' }, s8 + 0.1)
    .fromTo(stage, { turn8: 0 }, { turn8: 1, duration: 2.2, ease: 'power2.inOut' }, s8 + 0.1)
    // the air clears, the studio returns
    .fromTo(stage, { smoke: 1 }, { smoke: 0, duration: 0.9, ease: 'power2.inOut' }, s8 + 0.05)
    .fromTo(stage, { word: 1 }, { word: 0, duration: 0.6, ease: 'power2.in' }, s8 + 0.05)
    .fromTo(stage, { haze: 2.3 }, { haze: 1.05, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.1)
    .fromTo(stage, { dim: 1 }, { dim: 0.3, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.15)
    .fromTo(stage, { wood: 1 }, { wood: 0.4, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.15)
    .fromTo(stage, { hue: 1 }, { hue: 0.35, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.15)
    // clean studio light: restrained rims, clear reflections, no blown highlights
    .fromTo(stage, { rimScale: 0.6 }, { rimScale: 0.95, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.25)
    .fromTo(stage, { envScale: 0.55 }, { envScale: 0.9, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.25)
    .fromTo(stage, { sideScale: 0.7 }, { sideScale: 0.85, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.25)
    .fromTo(stage, { fillScale: 0.3 }, { fillScale: 0.5, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.25)
    .fromTo(stage, { collar: 0.4 }, { collar: 0.8, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.3)
    .fromTo(stage, { topBoost: 0 }, { topBoost: 0.3, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.3)
    .fromTo(stage, { baseGlow: 0.3 }, { baseGlow: 0.2, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.3)
    .fromTo(stage, { plinth: 0.15 }, { plinth: 0.6, duration: 1.0, ease: 'power2.inOut' }, s8 + 0.3)
    // interaction opens once the camera has settled, closes before Scene 9
    .fromTo(stage, { interact: 0 }, { interact: 1, duration: 0.25, ease: 'sine.inOut' }, s8 + 0.8)
    .fromTo(stage, { interact: 1 }, { interact: 0, duration: 0.25, ease: 'sine.inOut' }, s8 + 2.15)
    .fromTo(q('[data-sig="fade"]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, s8 + 0.9)
    .fromTo(q('[data-sig="fade"]'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.3, ease: 'power2.in' }, s8 + 2.1);

  // =========================================================================
  // SCENE 9 — FINAL PRODUCT HERO / CTA           (15.3 → 17.1 vh)
  // the bookend: Scene 1's exact framing, the bottle settles on its front 3/4
  // hero angle, and the light reaches its richest state
  // =========================================================================
  const s9 = SCENES.s9[0];
  tl.fromTo(stage, { finale: 0 }, { finale: 1, duration: 1.1, ease: 'power3.inOut' }, s9 + 0.0)
    .fromTo(stage, { turn9: 0 }, { turn9: 1, duration: 1.1, ease: 'power3.inOut' }, s9 + 0.0)
    .fromTo(stage, { dim: 0.3 }, { dim: 0.12, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.1)
    .fromTo(stage, { envScale: 0.9 }, { envScale: 1, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.1)
    .fromTo(stage, { rimScale: 0.95 }, { rimScale: 1, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.1)
    .fromTo(stage, { fillScale: 0.5 }, { fillScale: 0.65, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.1)
    .fromTo(stage, { plinth: 0.6 }, { plinth: 1, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.2)
    .fromTo(stage, { collar: 0.8 }, { collar: 1, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.2)
    .fromTo(stage, { topBoost: 0.3 }, { topBoost: 0.45, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.2)
    .fromTo(stage, { baseGlow: 0.2 }, { baseGlow: 0.35, duration: 0.9, ease: 'power2.inOut' }, s9 + 0.2)
    .fromTo(stage, { haze: 1.05 }, { haze: 1.15, duration: 0.9, ease: 'sine.inOut' }, s9 + 0.2)
    // copy arrives after the bottle has landed on its hero angle
    .fromTo(q('.finale .eyebrow'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, s9 + 0.8)
    .fromTo(q('[data-fin="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.55, ease: 'power4.out', stagger: 0.1 }, s9 + 0.85)
    .fromTo(q('.finale .lede'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, s9 + 1.05)
    .fromTo(q('.finale .btn'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, s9 + 1.15);
  // 1.6 → 1.8 rest on the final frame
  tl.to({}, { duration: 0.01 }, SCENES.s9[1] - 0.01);

  return tl;
}
