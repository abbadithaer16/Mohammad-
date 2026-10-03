import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stage } from './stage';

gsap.registerPlugin(ScrollTrigger);

// SCENES 2 → 4 · one pinned, scrubbed shot
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
};
export const JOURNEY_VH = SCENES.s4[1];

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

  const tl = gsap.timeline({
    defaults: { immediateRender: false },
    scrollTrigger: {
      trigger: frame,
      start: 'top top',
      end: () => `+=${window.innerHeight * JOURNEY_VH}`,
      pin: true,
      scrub: 1.1, // scroll smoothed for 1.1 s, then the camera rig damps again
      invalidateOnRefresh: true,
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
  tl.to({}, { duration: 0.01 }, SCENES.s4[1] - 0.01);

  return tl;
}
