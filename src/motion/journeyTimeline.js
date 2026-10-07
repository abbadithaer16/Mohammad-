import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stage } from './stage';
import { KEY, ROT } from './cameraPath';

gsap.registerPlugin(ScrollTrigger);

// SCENES 02 → 09 · ONE CAMERA MOVE, SCRUBBED BY SCROLL
//
// One pinned ScrollTrigger scrubs this ONE timeline. Ownership:
//   - this file: timing / cinematic progression only
//   - cameraPath + CameraRig: camera transforms (`stage.cam` = position on the path)
//   - Bottle: product transform (`stage.rot`)
//   - Lighting / Stage / Atmosphere: read light + atmosphere channels on `stage`
//   - React components: presentation (copy layers animated here, by GSAP)
// Scenes never finish before the next begins: camera, light, atmosphere,
// product and type hand off in overlapping windows.
//
// Timeline time = viewport heights of scroll (1.0 = 100vh).
export const SCENES = {
  s2: [0.0, 2.6], //   sculptural orbit
  s3: [2.6, 4.9], //   material / gold detail (macro)
  s4: [4.9, 7.0], //   atmospheric transformation
  s5: [7.0, 13.8], //  olfactory world: top → heart → base
  s6: [13.8, 16.6], // signature shot (+ drag to turn)
  s7: [16.6, 19.1], // craft macro: engraving → facets
  s8: [19.1, 21.4], // monumental reveal
  s9: [21.4, 23.2], // CTA
};
export const JOURNEY_VH = SCENES.s9[1];
// composed holds: reduced-motion snap points and navigation destinations
export const HOLDS = { s2: 2.4, s3: 4.1, s4: 6.8, s5: 8.9, s6: 16.2, s7: 17.9, s8: 21.1, s9: 23.15 };
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
  gsap.set(q('[data-mon="mark"]'), { autoAlpha: 0, letterSpacing: '0.9em' });
  gsap.set(q('[data-mon="sub"]'), { autoAlpha: 0, y: 8 });
  gsap.set(q('.finale .eyebrow, .finale .lede, .finale .btn'), { autoAlpha: 0, y: 16 });

  const dragZone = frame.querySelector('[data-drag-zone]');
  let current = '';
  // which part of the film is on screen: drives nav state + drag availability
  const track = (self) => {
    const t = self.progress * JOURNEY_VH;
    const found = SCENE_ORDER.find(([, [a, b]]) => t >= a && t < b);
    // the pin starts a sub-pixel early, so treat the first 5% of a viewport as the reveal
    const name = t < 0.05 ? 's1' : found ? found[0] : 's9';
    if (name === current) return;
    current = name;
    document.documentElement.dataset.scene = name;
    if (dragZone) dragZone.tabIndex = name === 's6' ? 0 : -1;
  };

  let resumeAt = null;
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
      // a resize changes the journey's length in pixels while the browser keeps
      // the pixel scroll: re-seat the page at the same point of the film
      onRefreshInit: (self) => {
        resumeAt = self.isActive ? self.progress : null;
      },
      onRefresh: (self) => {
        if (resumeAt !== null) self.scroll(self.start + resumeAt * (self.end - self.start));
        resumeAt = null;
        track(self);
      },
      onLeaveBack: track,
      // reduced motion: every scroll gesture settles on a composed hold
      snap: reduce
        ? { snapTo: [0, ...Object.values(HOLDS).map((v) => v / JOURNEY_VH)], duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut' }
        : undefined,
    },
  });

  // ---- vocabulary ----------------------------------------------------------
  // The camera never comes to a dead stop. `flow` is power2.inOut blended with
  // a little linear motion, so a move leaves and arrives with the slow speed of
  // the drift that follows it; `drift` is a hold: the camera keeps travelling
  // a few percent of the way toward the NEXT shot while copy lands, so the end
  // of one scene's motion is already the beginning of the next.
  // (power2, not power3: a gentler middle, so no move ever feels like a lurch)
  const p2 = gsap.parseEase('power2.inOut');
  const flow = (a = 0.14) => (t) => a * t + (1 - a) * p2(t);
  // accelerates away from a given starting speed (keeps a throw travelling)
  const sineIn = gsap.parseEase('sine.in');
  const glide = (a) => (t) => a * t + (1 - a) * sineIn(t);
  // decelerates into a given arrival speed (lands in a drift, not a stop)
  const p2out = gsap.parseEase('power2.out');
  const settle = (a) => (t) => a * t + (1 - a) * p2out(t);
  const move = (from, to, at, d, ease = flow()) => tl.fromTo(stage, { cam: from }, { cam: to, duration: d, ease }, at);
  const drift = (key, at, d, h = 0.08) => tl.fromTo(stage, { cam: key }, { cam: key + h, duration: d, ease: 'none' }, at);
  const turn = (from, to, at, d, ease = 'sine.inOut') => tl.fromTo(stage, { rot: from }, { rot: to, duration: d, ease }, at);
  const set = (p, a, b, at, d, ease = 'power2.inOut') => tl.fromTo(stage, { [p]: a }, { [p]: b, duration: d, ease }, at);
  const show = (els, at, d = 0.4, from = { autoAlpha: 0, y: 16 }) =>
    tl.fromTo(els, from, { autoAlpha: 1, y: 0, duration: d, ease: 'power3.out' }, at);
  const leave = (els, at, d = 0.28) => tl.fromTo(els, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -26, duration: d, ease: 'power2.in' }, at);
  const lines = (els, at, stagger = 0.1, d = 0.55) =>
    tl.fromTo(els, { yPercent: 108 }, { yPercent: 0, duration: d, ease: 'power4.out', stagger }, at);
  const glint = (line, at) =>
    tl.to(line, { color: GOLD_LIT, duration: 0.16, ease: 'sine.out' }, at).to(line, { color: IVORY, duration: 0.4, ease: 'sine.inOut' }, at + 0.18);
  const notes = (name, at) => {
    show(inChapter(name, '[data-n="label"]'), at, 0.3, { autoAlpha: 0, y: 0 });
    tl.fromTo(inChapter(name, '[data-n="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.out' }, at);
    lines(inChapter(name, '[data-n="line"]'), at + 0.07);
  };

  // ===========================================================================
  // 02 · SCULPTURAL ORBIT                                          0.0 → 2.6
  // the camera leaves the hero line on one continuous arc: up and round to
  // camera-right, then swinging low across to camera-left, around a bottle
  // that barely turns. The studio light is fixed in the world, so as the
  // camera travels one side falls into darkness and the facets pass through
  // the light. A touch more haze in the air gives the orbit aerial depth.
  // ===========================================================================
  move(KEY.hero, KEY.orbitB, 0, 2.2, flow(0.1)); // passes through orbitA
  drift(KEY.orbitB, 2.2, 0.4, 0.05);
  turn(0, ROT.orbitB, 0.05, 2.55);
  leave(q('.hero-text, .hero-copy .ctas, .scroll-cue-wrap'), 0.08, 0.42);
  set('flood', 0, 0.6, 0.2, 1.4, 'expo.inOut');
  set('fillScale', 1, 0.55, 0.3, 1.2);
  set('side', 0, 1, 0.4, 1.2, 'power3.inOut');
  set('collar', 0, 0.7, 0.9, 0.8);
  set('dust', 0, 0.55, 0.3, 1.0, 'sine.inOut');
  set('haze', 1, 1.25, 0.3, 1.4, 'sine.inOut');
  tl.fromTo(q('[data-s2="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power4.out' }, 1.2);
  lines(q('[data-s2="line"]'), 1.27, 0.11, 0.6);
  show(q('[data-s2="fade-late"]'), 1.5, 0.5);

  // ===========================================================================
  // 03 · MATERIAL / GOLD DETAIL                                    2.6 → 4.9
  // still arcing right, the camera rises and pushes in until the stopper's cut
  // geometry fills the frame; the room falls dark. Then a slow macro move:
  // craning down onto the gold collar while circling it, so the studio's light
  // travels across the brushed gold. Focus follows: stopper → collar → glass.
  // ===========================================================================
  move(KEY.orbitB + 0.05, KEY.detailA, 2.6, 1.0);
  move(KEY.detailA, KEY.detailB, 3.6, 1.3, flow(0.55));
  turn(ROT.orbitB, ROT.detailA, 2.6, 1.0);
  turn(ROT.detailA, ROT.detailB, 3.6, 1.3);
  leave(q('.scene2-copy'), 2.68);
  set('haze', 1.25, 1, 2.7, 0.8);
  set('dust', 0.55, 0.15, 2.7, 0.6);
  set('dim', 0, 0.6, 2.7, 0.8);
  set('collar', 0.7, 1, 2.9, 0.6);
  set('rimScale', 1, 1.1, 2.9, 0.6);
  set('dof', 0, 1, 3.4, 0.3, 'power2.out');
  set('rack', 0, 1, 4.0, 0.35);
  set('rack', 1, 2, 4.5, 0.3);
  set('sweep', -1.5, 1.5, 3.6, 0.75);
  set('sweepOn', 0, 0.8, 3.6, 0.18, 'sine.out');
  set('sweepOn', 0.8, 0, 4.15, 0.2, 'sine.in');
  show(q('[data-m="fade"]'), 3.7, 0.4, { autoAlpha: 0, y: 10 });

  // ===========================================================================
  // 04 · ATMOSPHERIC TRANSFORMATION                                4.9 → 7.0
  // the camera is thrown back out of the macro, still arcing right, through
  // sheets of lit smoke that stand between lens and bottle; the bottle sinks
  // into the atmosphere, gold dust scatters the light, and a huge unfocused
  // NOIRÉ looms behind. Then it keeps drifting sideways through it.
  // ===========================================================================
  move(KEY.detailB, KEY.pullback, 4.9, 0.9, flow(0.12));
  move(KEY.pullback, KEY.drift, 5.8, 1.2, glide(0.16)); // leaves at the throw's own speed
  turn(ROT.detailB, ROT.pullback, 4.9, 0.9);
  turn(ROT.pullback, ROT.drift, 5.8, 1.2);
  set('dof', 1, 0, 4.9, 0.3);
  leave(q('[data-m="fade"]'), 4.92, 0.25);
  set('veil', 0, 1, 4.95, 0.5, 'power2.out');
  set('smoke', 0, 1, 5.0, 0.7);
  set('haze', 1, 2.2, 5.0, 0.7, 'sine.inOut');
  set('dim', 0.6, 0.9, 5.05, 0.6);
  set('rimScale', 1.1, 0.65, 5.05, 0.6);
  set('envScale', 1, 0.6, 5.05, 0.6);
  set('collar', 1, 0.45, 5.05, 0.6);
  set('plinth', 1, 0.2, 5.05, 0.6);
  set('flood', 0.6, 1, 5.2, 1.0, 'expo.inOut');
  set('dust', 0.15, 0.9, 5.2, 0.8, 'sine.inOut');
  set('word', 0, 1, 5.4, 0.7);
  set('veil', 1, 0.5, 5.9, 0.9, 'sine.inOut');

  // ===========================================================================
  // 05 · OLFACTORY WORLD                                          7.0 → 13.8
  // out of the smoke the camera arcs back in close and travels around the
  // bottle through three compositions. A narrow light scans the exact region
  // each note belongs to; the room shifts amber → red-brown → wood. While a
  // chapter's notes land, the camera is already easing toward the next one.
  //   TOP   · up onto the stopper, a strip of light travels down it
  //   HEART · round to the side, a vertical strip sweeps the label band
  //   BASE  · down to the lower glass, the strip travels to the base
  // ===========================================================================
  move(KEY.drift, KEY.top, 7.0, 1.2, settle(0.1)); // arrives at the drift's speed
  drift(KEY.top, 8.2, 0.9);
  turn(ROT.drift, ROT.top, 7.0, 2.1);
  set('veil', 0.5, 0, 7.05, 0.6);
  set('word', 1, 0, 7.05, 0.45, 'power2.in');
  set('smoke', 1, 0.35, 7.1, 0.9);
  set('haze', 2.2, 1.3, 7.1, 0.9);
  set('dim', 0.9, 0.25, 7.2, 0.9);
  set('rimScale', 0.65, 1, 7.2, 0.9);
  set('envScale', 0.6, 0.85, 7.2, 0.9);
  set('collar', 0.45, 0.8, 7.2, 0.9);
  set('plinth', 0.2, 0.8, 7.2, 0.9);
  set('dust', 0.9, 0.35, 7.2, 1.0);
  // TOP
  set('topBoost', 0, 1, 7.5, 0.7);
  set('scan', 0, 1, 7.85, 0.15, 'sine.out');
  set('scanY', 1.12, 0.62, 7.9, 0.85, 'power1.inOut');
  set('scan', 1, 0, 8.65, 0.2, 'sine.in');
  notes('top', 7.85);
  inChapter('top', '[data-n="line"]').forEach((line, i) => glint(line, 8.0 + i * 0.26));
  // HEART
  move(KEY.top + 0.08, KEY.heart, 9.1, 1.3);
  drift(KEY.heart, 10.4, 1.1);
  turn(ROT.top, ROT.heart, 9.1, 2.4);
  leave(chapter('top'), 9.18);
  set('topBoost', 1, 0.3, 9.2, 0.7);
  set('hue', 0, 1, 9.3, 1.1, 'expo.inOut');
  set('fillScale', 0.55, 0.42, 9.3, 0.8);
  set('low', 0, 1, 9.5, 0.9, 'power3.inOut');
  set('smoke', 0.35, 0.15, 9.3, 0.8);
  set('band', 0, 1, 10.2, 0.15, 'sine.out');
  set('bandAz', -55, 55, 10.25, 0.9, 'power1.inOut');
  set('band', 1, 0, 11.05, 0.2, 'sine.in');
  notes('heart', 10.2);
  inChapter('heart', '[data-n="line"]').forEach((line, i) => glint(line, 10.5 + i * 0.2));
  // BASE
  move(KEY.heart + 0.08, KEY.base, 11.5, 1.0);
  drift(KEY.base, 12.5, 1.3);
  turn(ROT.heart, ROT.base, 11.5, 2.3);
  leave(chapter('heart'), 11.58);
  set('topBoost', 0.3, 0, 11.6, 0.8);
  set('envScale', 0.85, 0.72, 11.6, 0.9);
  set('fillScale', 0.42, 0.3, 11.6, 0.8);
  set('low', 1, 0.5, 11.7, 0.8);
  set('dim', 0.25, 0.35, 11.7, 1.0);
  set('smoke', 0.15, 0, 11.6, 0.6);
  set('dust', 0.35, 0.2, 11.6, 0.8);
  set('scan', 0, 1, 12.35, 0.15, 'sine.out');
  set('scanY', 0.62, 0.03, 12.4, 1.0, 'power1.inOut');
  set('scan', 1, 0, 13.35, 0.18, 'sine.in');
  notes('base', 12.35);
  const BEAT = { amber: 12.5, musk: 12.8, sandalwood: 13.1, vanilla: 13.4 };
  set('baseGlow', 0, 1, BEAT.amber, 0.5, 'power2.out'); // AMBER · glow low in the glass
  set('rimScale', 1, 0.55, BEAT.musk, 0.3, 'sine.inOut'); // MUSK · diffused, softer
  set('haze', 1.3, 1.7, BEAT.musk, 0.4, 'sine.inOut');
  set('rimScale', 0.55, 0.85, BEAT.sandalwood, 0.4, 'sine.inOut');
  set('wood', 0, 1, BEAT.sandalwood, 0.6, 'expo.inOut'); // SANDALWOOD · woody, directional
  set('sideScale', 1, 1.2, BEAT.sandalwood, 0.5);
  set('ivory', 0, 1, BEAT.vanilla, 0.4); // VANILLA · a faint ivory-gold lift
  inChapter('base', '[data-n="line"]').forEach((line, i) => glint(line, Object.values(BEAT)[i] + 0.04));

  // ===========================================================================
  // 06 · SIGNATURE SHOT                                          13.8 → 16.6
  // the camera carries on left and out to the full bottle, centred in dark
  // negative space; the air clears to a clean studio with strong rims. A slow
  // cinematic push while the bottle turns its NOIRÉ engraving to the lens.
  // The visitor may take over the turn.
  // ===========================================================================
  move(KEY.base + 0.08, KEY.sigA, 13.8, 1.2);
  turn(ROT.base, ROT.sigA, 13.8, 1.2);
  leave(chapter('base'), 13.83);
  set('dim', 0.35, 0.2, 13.9, 0.9);
  set('wood', 1, 0.35, 13.9, 0.9);
  set('hue', 1, 0.3, 13.9, 0.9);
  set('haze', 1.7, 1.05, 13.9, 0.9);
  set('rimScale', 0.85, 1.15, 13.9, 0.9);
  set('envScale', 0.72, 0.8, 13.9, 0.9);
  set('sideScale', 1.2, 0.9, 13.9, 0.9);
  set('fillScale', 0.3, 0.4, 13.9, 0.9);
  set('low', 0.5, 0.15, 13.9, 0.9);
  set('baseGlow', 1, 0.2, 13.9, 0.9);
  set('ivory', 1, 0.3, 13.9, 0.9);
  set('collar', 0.8, 0.9, 13.9, 0.9);
  set('topBoost', 0, 0.25, 13.9, 0.9);
  set('plinth', 0.8, 1, 13.9, 0.9);
  set('dust', 0.2, 0.08, 13.9, 1.0);
  move(KEY.sigA, KEY.sigB, 15.0, 1.6, flow(0.3)); // the slow push
  turn(ROT.sigA, ROT.sigB, 15.0, 1.5);
  set('interact', 0, 1, 15.1, 0.15, 'sine.inOut');
  set('interact', 1, 0, 16.45, 0.15, 'sine.inOut');
  show(q('[data-sig="fade"]'), 15.15, 0.35, { autoAlpha: 0, y: 12 });
  leave(q('[data-sig="fade"]'), 16.4, 0.22);

  // ===========================================================================
  // 07 · CRAFT                                                   16.6 → 19.1
  // a second macro: the camera arcs left and in until the NOIRÉ engraving is
  // square to the lens and a narrow light travels across the gold foil. Then a
  // slow macro track down and round across the cut facets: the mark slides out
  // of frame, the facets slide in, a thin strip of light runs down the glass
  // and focus follows it.
  // ===========================================================================
  move(KEY.sigB, KEY.craftA, 16.6, 1.0);
  drift(KEY.craftA, 17.6, 0.5, 0.06);
  move(KEY.craftA + 0.06, KEY.craftB, 18.1, 1.0, flow(0.5));
  turn(ROT.sigB, ROT.craftA, 16.6, 1.2);
  turn(ROT.craftA, ROT.craftB, 17.8, 1.3);
  set('dim', 0.2, 0.55, 16.7, 0.7);
  set('rimScale', 1.15, 1, 16.7, 0.7);
  // the warm wall would mirror in the foil and facets as red at this range
  set('hue', 0.3, 0, 16.7, 0.7);
  set('wood', 0.35, 0.1, 16.7, 0.7);
  set('low', 0.15, 0, 16.7, 0.7);
  set('baseGlow', 0.2, 0, 16.7, 0.7);
  set('rack', 2, 3, 16.7, 0.05);
  set('dof', 0, 1, 17.3, 0.3, 'power2.out');
  set('rack', 3, 4, 18.3, 0.6);
  // neutral tone: at macro range the warm HEART strip saturates the foil
  // to orange under ACES; a near-white strip reads as champagne gold
  set('bandTone', 0, 1, 17.0, 0.3);
  set('band', 0, 0.75, 17.45, 0.15, 'sine.out');
  set('bandAz', -45, 45, 17.5, 0.8, 'power1.inOut');
  set('band', 0.75, 0, 18.15, 0.2, 'sine.in');
  // facets: a thin strip travels down the cut glass with the camera
  set('scanY', 0.03, 0.56, 17.0, 0.05);
  set('scan', 0, 0.7, 18.25, 0.15, 'sine.out');
  set('scanY', 0.56, 0.12, 18.3, 0.75, 'power1.inOut');
  set('scan', 0.7, 0, 18.9, 0.18, 'sine.in');

  // ===========================================================================
  // 08 · MONUMENTAL REVEAL                                       19.1 → 21.4
  // the camera pulls back low and wide, carrying on round past centre, while
  // the light falls away; then the light is rebuilt in order: darkness → edge
  // → gold → the complete hero composition. Only then does the mark appear.
  // ===========================================================================
  move(KEY.craftB, KEY.monument, 19.1, 1.1);
  drift(KEY.monument, 20.2, 1.2, 0.05);
  turn(ROT.craftB, ROT.monument, 19.1, 2.3);
  set('dof', 1, 0, 19.1, 0.3);
  // darkness
  set('rimScale', 1, 0.15, 19.15, 0.5, 'power2.in');
  set('envScale', 0.8, 0.15, 19.15, 0.5, 'power2.in');
  set('fillScale', 0.4, 0.05, 19.15, 0.5, 'power2.in');
  set('collar', 0.9, 0.1, 19.15, 0.5, 'power2.in');
  set('topBoost', 0.25, 0, 19.15, 0.5, 'power2.in');
  set('plinth', 1, 0.15, 19.15, 0.5, 'power2.in');
  set('dim', 0.55, 1, 19.15, 0.5, 'power2.in');
  // → edge
  set('rimScale', 0.15, 1.25, 19.7, 0.6, 'power2.out');
  // → gold
  set('sweep', -1.5, 1.5, 20.05, 0.8);
  set('sweepOn', 0, 1, 20.05, 0.2, 'sine.out');
  set('sweepOn', 1, 0, 20.65, 0.2, 'sine.in');
  set('collar', 0.1, 1, 20.2, 0.5);
  // → the complete composition
  set('envScale', 0.15, 0.95, 20.5, 0.6);
  set('fillScale', 0.05, 0.5, 20.5, 0.6);
  set('plinth', 0.15, 1, 20.5, 0.6);
  set('topBoost', 0, 0.45, 20.5, 0.6);
  set('dim', 1, 0.1, 20.5, 0.6);
  tl.fromTo(q('[data-mon="mark"]'), { autoAlpha: 0, letterSpacing: '0.9em' }, { autoAlpha: 1, letterSpacing: '0.52em', duration: 0.6, ease: 'power3.out' }, 20.85);
  show(q('[data-mon="sub"]'), 21.0, 0.4, { autoAlpha: 0, y: 8 });

  // ===========================================================================
  // 09 · CTA                                                     21.4 → 23.2
  // movement reduces: the camera arcs back and settles onto Scene 1's
  // framing, a touch closer (the bookend). The bottle stays the hero; the
  // offer arrives beside it.
  // ===========================================================================
  move(KEY.monument + 0.05, KEY.final, 21.4, 1.1, 'power3.inOut');
  turn(ROT.monument, ROT.final, 21.4, 1.1, 'power3.inOut');
  leave(q('.monument'), 21.45, 0.3);
  show(q('.finale .eyebrow'), 22.2, 0.35);
  lines(q('[data-fin="line"]'), 22.25, 0.1, 0.5);
  show(q('.finale .lede'), 22.45, 0.4);
  tl.fromTo(q('.finale .btn'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, 22.55);
  tl.to({}, { duration: 0.01 }, JOURNEY_VH - 0.01);

  return tl;
}
