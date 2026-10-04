import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stage } from './stage';
import { KEY, ROT } from './cameraPath';

gsap.registerPlugin(ScrollTrigger);

// SCENES 2 → 9 · ONE CAMERA MOVE, SCRUBBED BY SCROLL
//
// A single pinned ScrollTrigger scrubs this timeline. The camera's position is
// ONE value (`stage.cam`) travelling along ONE plotted path (cameraPath.js);
// the timeline only decides its rhythm: where it moves, accelerates, holds.
// Light, atmosphere and copy are cued against that move, never against
// "sections".
//
// Rhythm (timeline time = viewport heights of scroll):
//   MOVE → HOLD → MOVE · REVEAL → HOLD → ARC · REVEAL → HOLD → DROP · REVEAL
//   → HOLD → ACCELERATE → MACRO → PULL BACK → BREATHE → RETURN → INTERACT
//   → ARC · SETTLE · PUSH → LIGHT → COPY
export const SCENES = {
  s2: [0.0, 2.5], // approach
  s3: [2.5, 4.6], // top notes
  s4: [4.6, 7.0], // heart notes
  s5: [7.0, 9.3], // base notes
  s6: [9.3, 11.4], // macro
  s7: [11.4, 13.4], // through the smoke
  s8: [13.4, 15.9], // the return + interaction
  s9: [15.9, 18.2], // final payoff
};
export const JOURNEY_VH = SCENES.s9[1];
// composed "holds", used by reduced motion (snap) and navigation
export const HOLDS = { s2: 2.2, s3: 4.45, s4: 6.85, s5: 9.15, s6: 11.15, s7: 13.0, s8: 15.3, s9: 18.15 };
const SCENE_ORDER = Object.entries(SCENES);

const IVORY = 'rgba(236, 228, 216, 1)';
const IVORY_DIM = 'rgba(236, 228, 216, 0.42)';
const GOLD_LIT = 'rgba(222, 196, 150, 1)';

export function createJourney(frame) {
  const q = (sel) => frame.querySelectorAll(sel);
  const chapter = (name) => frame.querySelector(`[data-chapter="${name}"]`);
  const inChapter = (name, sel) => chapter(name).querySelectorAll(sel);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // initial (hidden) states for every layer that enters later
  gsap.set(q('[data-s2="line"], [data-n="line"], [data-fin="line"]'), { yPercent: 108 });
  gsap.set(q('[data-s2="fade-late"]'), { autoAlpha: 0, y: 16 });
  gsap.set(q('[data-s2="rule"], [data-n="rule"]'), { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(q('[data-n="label"]'), { autoAlpha: 0 });
  gsap.set(q('[data-n="line"]'), { color: IVORY_DIM });
  gsap.set(q('[data-m="fade"]'), { autoAlpha: 0, y: 10 });
  gsap.set(q('[data-sig="fade"]'), { autoAlpha: 0, y: 12 });
  gsap.set(q('.finale .eyebrow, .finale .lede, .finale .btn'), { autoAlpha: 0, y: 16 });

  const dragZone = frame.querySelector('[data-drag-zone]');
  let current = '';
  // which part of the film is on screen: drives nav state + drag availability
  const track = (self) => {
    const t = self.progress * JOURNEY_VH;
    const found = SCENE_ORDER.find(([, [a, b]]) => t >= a && t < b);
    // the pin starts a sub-pixel early, so treat the first 5% of a viewport as the hero
    const name = t < 0.05 ? 's1' : found ? found[0] : 's9';
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
      // input smoothed for 0.7 s, then the camera rig damps on top: fast
      // trackpad flicks glide along the path instead of snapping
      scrub: reduce ? true : 0.7,
      invalidateOnRefresh: true,
      onUpdate: track,
      onRefresh: track,
      onLeaveBack: track,
      // reduced motion: every scroll gesture settles on a composed hold
      snap: reduce
        ? { snapTo: [0, ...Object.values(HOLDS).map((v) => v / JOURNEY_VH)], duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut' }
        : undefined,
    },
  });

  // helpers: the camera travels key -> key; the bottle turns on the same beats
  const move = (from, to, at, duration, ease) => tl.fromTo(stage, { cam: from }, { cam: to, duration, ease }, at);
  const turn = (from, to, at, duration, ease = 'power2.inOut') => tl.fromTo(stage, { rot: from }, { rot: to, duration, ease }, at);
  const set = (prop, from, to, at, duration, ease = 'power2.inOut') => tl.fromTo(stage, { [prop]: from }, { [prop]: to, duration, ease }, at);
  const lineGlint = (line, at) => tl.to(line, { color: GOLD_LIT, duration: 0.16, ease: 'sine.out' }, at).to(line, { color: IVORY, duration: 0.4, ease: 'sine.inOut' }, at + 0.18);

  // ===========================================================================
  // SCENE 2 · APPROACH                                          0.0 → 2.5
  // MOVE: a strong dolly in. The camera drops to a low 3/4 angle while the
  // bottle grows from ~82% to ~115% of the frame and crops. The warm light
  // floods outward from the bottle as the camera arrives. HOLD: the copy lands.
  // ===========================================================================
  move(KEY.hero, KEY.approach, 0, 1.7, 'power3.inOut');
  turn(0, ROT.approach, 0.05, 1.7);
  tl.fromTo(q('.hero-text, .hero-copy .ctas, .scroll-cue-wrap'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -36, duration: 0.42, ease: 'power2.in', stagger: 0.04 }, 0.08);
  set('flood', 0, 1, 0.15, 1.35, 'expo.inOut');
  set('fillScale', 1, 0.6, 0.25, 1.2);
  set('side', 0, 1, 0.35, 1.2, 'power3.inOut');
  set('collar', 0, 1, 0.95, 0.75, 'power2.out');
  tl.fromTo(q('[data-s2="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power4.out' }, 1.25)
    .fromTo(q('[data-s2="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.6, ease: 'power4.out', stagger: 0.11 }, 1.32)
    .fromTo(q('[data-s2="fade-late"]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power4.out' }, 1.55);

  // ===========================================================================
  // SCENE 3 · TOP                                               2.5 → 4.6
  // MOVE: crane up and back across the front shoulder until the camera looks
  // down onto stopper, collar and upper glass. REVEAL: a thin strip of light
  // travels down exactly that region; each note warms as it crosses.
  // ===========================================================================
  move(KEY.approach, KEY.top, 2.5, 1.1, 'power3.inOut');
  turn(ROT.approach, ROT.top, 2.55, 1.15);
  tl.fromTo(q('.scene2-copy'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 2.58);
  set('topBoost', 0, 1, 2.7, 0.7);
  set('scan', 0, 1, 3.35, 0.15, 'sine.out');
  set('scanY', 1.12, 0.62, 3.4, 0.85, 'power1.inOut');
  set('scan', 1, 0, 4.15, 0.2, 'sine.in');
  tl.fromTo(inChapter('top', '[data-n="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 3.35)
    .fromTo(inChapter('top', '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, 3.35)
    .fromTo(inChapter('top', '[data-n="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.1 }, 3.42);
  // stopper (y≈0.95) → collar (≈0.8) → shoulder (≈0.65), as the strip passes
  inChapter('top', '[data-n="line"]').forEach((line, i) => lineGlint(line, 3.5 + i * 0.26));

  // ===========================================================================
  // SCENE 4 · HEART                                             4.6 → 7.0
  // ARC: the camera swings round to the side at mid height while the bottle
  // turns its label to meet it; the room deepens to red-brown, a low warm side
  // light rises. REVEAL: a vertical strip sweeps across the label band.
  // ===========================================================================
  move(KEY.top, KEY.heart, 4.6, 1.3, 'power3.inOut');
  turn(ROT.top, ROT.heart, 4.65, 1.3);
  tl.fromTo(chapter('top'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 4.68);
  set('topBoost', 1, 0.3, 4.7, 0.7);
  set('hue', 0, 1, 4.8, 1.1, 'expo.inOut');
  set('fillScale', 0.6, 0.42, 4.8, 0.8);
  set('low', 0, 1, 5.0, 0.9, 'power3.inOut');
  set('haze', 1, 1.35, 4.9, 1.0, 'sine.inOut');
  set('band', 0, 1, 5.7, 0.15, 'sine.out');
  set('bandAz', -55, 55, 5.75, 0.9, 'power1.inOut');
  set('band', 1, 0, 6.55, 0.2, 'sine.in');
  tl.fromTo(inChapter('heart', '[data-n="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 5.7)
    .fromTo(inChapter('heart', '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, 5.7)
    .fromTo(inChapter('heart', '[data-n="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.55, ease: 'power4.out', stagger: 0.12 }, 5.78);
  inChapter('heart', '[data-n="line"]').forEach((line, i) => lineGlint(line, 6.0 + i * 0.2));

  // ===========================================================================
  // SCENE 5 · BASE                                              7.0 → 9.3
  // DROP: the camera sinks almost to plinth level, looking up at the lower
  // glass; the bottle turns to a darker profile and the upper light recedes.
  // REVEAL: the strip travels down to the base; each base note gets its own
  // light state as it passes.
  // ===========================================================================
  move(KEY.heart, KEY.base, 7.0, 1.0, 'power3.inOut');
  turn(ROT.heart, ROT.base, 7.05, 1.05);
  tl.fromTo(chapter('heart'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 7.08);
  set('topBoost', 0.3, 0, 7.1, 0.8);
  set('envScale', 1, 0.72, 7.1, 0.9);
  set('fillScale', 0.42, 0.3, 7.1, 0.8);
  set('low', 1, 0.5, 7.2, 0.8);
  set('dim', 0, 0.25, 7.2, 1.0);
  set('scan', 0, 1, 7.85, 0.15, 'sine.out');
  set('scanY', 0.62, 0.03, 7.9, 1.0, 'power1.inOut');
  set('scan', 1, 0, 8.85, 0.18, 'sine.in');
  tl.fromTo(inChapter('base', '[data-n="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 7.85)
    .fromTo(inChapter('base', '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, 7.85)
    .fromTo(inChapter('base', '[data-n="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.1 }, 7.92);
  const BEAT = { amber: 8.0, musk: 8.3, sandalwood: 8.6, vanilla: 8.9 };
  set('baseGlow', 0, 1, BEAT.amber, 0.5, 'power2.out'); // AMBER · glow low in the glass
  set('rimScale', 1, 0.55, BEAT.musk, 0.3, 'sine.inOut'); // MUSK · diffused, softer
  set('haze', 1.35, 1.75, BEAT.musk, 0.4, 'sine.inOut');
  set('rimScale', 0.55, 0.85, BEAT.sandalwood, 0.4, 'sine.inOut');
  set('wood', 0, 1, BEAT.sandalwood, 0.6, 'expo.inOut'); // SANDALWOOD · woody, directional
  set('sideScale', 1, 1.2, BEAT.sandalwood, 0.5);
  set('ivory', 0, 1, BEAT.vanilla, 0.4); // VANILLA · a faint ivory-gold lift
  inChapter('base', '[data-n="line"]').forEach((line, i) => lineGlint(line, Object.values(BEAT)[i] + 0.04));

  // ===========================================================================
  // SCENE 6 · ACCELERATE → MACRO                                9.3 → 11.4
  // the camera gathers speed, cranes up and pushes in until the gold collar
  // and stopper fill the frame; the room falls dark. MACRO HOLD: focus racks
  // stopper → collar → glass edge while a warm sweep crosses the gold.
  // ===========================================================================
  move(KEY.base, KEY.macro, 9.3, 0.85, 'expo.inOut');
  turn(ROT.base, ROT.macro, 9.35, 2.0, 'sine.inOut');
  tl.fromTo(chapter('base'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.27, ease: 'power2.in' }, 9.33);
  set('dim', 0.25, 0.7, 9.35, 0.75);
  set('low', 0.5, 0, 9.35, 0.6);
  set('baseGlow', 1, 0.3, 9.35, 0.6);
  set('rimScale', 0.85, 1.1, 9.5, 0.6);
  set('dof', 0, 1, 10.0, 0.3, 'power2.out');
  set('rack', 0, 1, 10.5, 0.3);
  set('rack', 1, 2, 10.95, 0.3);
  set('sweep', -1.5, 1.5, 10.35, 0.75);
  set('sweepOn', 0, 0.8, 10.35, 0.18, 'sine.out');
  set('sweepOn', 0.8, 0, 10.9, 0.22, 'sine.in');
  tl.fromTo(q('[data-m="fade"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 10.4);

  // ===========================================================================
  // SCENE 7 · PULL BACK → BREATHE                              11.4 → 13.4
  // the camera is thrown back out of the macro, through sheets of smoke that
  // stand between lens and bottle; the bottle sinks into the atmosphere and a
  // huge unfocused NOIRÉ looms deep behind it. Then the camera keeps drifting.
  // ===========================================================================
  move(KEY.macro, KEY.pullback, 11.4, 0.7, 'power2.inOut');
  move(KEY.pullback, KEY.breathe, 12.1, 1.3, 'sine.in');
  turn(ROT.macro, ROT.pullback, 11.4, 0.7);
  turn(ROT.pullback, ROT.breathe, 12.1, 1.3, 'sine.inOut');
  set('dof', 1, 0, 11.4, 0.3);
  tl.fromTo(q('[data-m="fade"]'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in' }, 11.42);
  set('veil', 0, 1, 11.45, 0.5, 'power2.out');
  set('smoke', 0, 1, 11.5, 0.7);
  set('haze', 1.75, 2.3, 11.5, 0.7, 'sine.inOut');
  set('dim', 0.7, 1, 11.55, 0.6);
  set('rimScale', 1.1, 0.6, 11.55, 0.6);
  set('sideScale', 1.2, 0.7, 11.55, 0.6);
  set('envScale', 0.72, 0.55, 11.55, 0.6);
  set('collar', 1, 0.4, 11.55, 0.6);
  set('plinth', 1, 0.15, 11.55, 0.6);
  set('word', 0, 1, 11.9, 0.7);
  set('veil', 1, 0.55, 12.4, 0.9, 'sine.inOut');

  // ===========================================================================
  // SCENE 8 · RETURN → INTERACT                                13.4 → 15.9
  // the bottle emerges: the camera arcs back toward it, passing back through
  // the veil as the smoke clears and the clean studio returns. Only after the
  // return settles does the bottle become the visitor's to turn.
  // ===========================================================================
  move(KEY.breathe, KEY.return, 13.4, 1.2, 'power2.out');
  turn(ROT.breathe, ROT.return, 13.4, 1.2);
  set('veil', 0.55, 0, 13.45, 0.6);
  set('word', 1, 0, 13.45, 0.45, 'power2.in');
  set('smoke', 1, 0, 13.55, 0.8);
  set('haze', 2.3, 1.05, 13.55, 0.9);
  set('dim', 1, 0.3, 13.6, 0.9);
  set('wood', 1, 0.4, 13.6, 0.9);
  set('hue', 1, 0.35, 13.6, 0.9);
  set('rimScale', 0.6, 0.95, 13.7, 0.9);
  set('envScale', 0.55, 0.9, 13.7, 0.9);
  set('sideScale', 0.7, 0.85, 13.7, 0.9);
  set('fillScale', 0.3, 0.5, 13.7, 0.9);
  set('collar', 0.4, 0.8, 13.8, 0.9);
  set('topBoost', 0, 0.3, 13.8, 0.9);
  set('baseGlow', 0.3, 0.2, 13.8, 0.9);
  set('plinth', 0.15, 0.6, 13.8, 0.9);
  // the reward: a slow turn the visitor may take over
  turn(ROT.return, ROT.signature, 14.6, 1.25, 'sine.inOut');
  set('interact', 0, 1, 14.65, 0.15, 'sine.inOut');
  set('interact', 1, 0, 15.75, 0.15, 'sine.inOut');
  tl.fromTo(q('[data-sig="fade"]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 14.7)
    .fromTo(q('[data-sig="fade"]'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in' }, 15.72);

  // ===========================================================================
  // SCENE 9 · ARC → SETTLE → PUSH → LIGHT → COPY               15.9 → 18.2
  // one last camera move: an arc that carries past the hero line, settles
  // back onto it and pushes in slightly. The bottle lands on its front 3/4
  // angle. Only then does the light reach its final state, then the copy.
  // ===========================================================================
  move(KEY.return, KEY.final, 15.9, 1.3, 'power3.inOut');
  turn(ROT.signature, ROT.final, 15.9, 1.3, 'power3.inOut');
  set('dim', 0.3, 0.12, 17.0, 0.5);
  set('envScale', 0.9, 1, 17.0, 0.5);
  set('rimScale', 0.95, 1, 17.0, 0.5);
  set('fillScale', 0.5, 0.65, 17.0, 0.5);
  set('plinth', 0.6, 1, 17.0, 0.5);
  set('collar', 0.8, 1, 17.0, 0.5);
  set('topBoost', 0.3, 0.45, 17.05, 0.5);
  set('baseGlow', 0.2, 0.35, 17.05, 0.5);
  set('haze', 1.05, 1.15, 17.05, 0.5, 'sine.inOut');
  tl.fromTo(q('.finale .eyebrow'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 17.3)
    .fromTo(q('[data-fin="line"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.1 }, 17.35)
    .fromTo(q('.finale .lede'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 17.58)
    .fromTo(q('.finale .btn'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, 17.68);
  tl.to({}, { duration: 0.01 }, JOURNEY_VH - 0.01);

  return tl;
}
