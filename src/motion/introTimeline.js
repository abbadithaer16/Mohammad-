import gsap from 'gsap';
import { stage, HERO } from './stage';

// SCENE 1 — THE STAGE / HERO REVEAL
//
// A light-led, strictly sequential reveal:
//   light -> silhouette -> material -> gold -> label
// The bottle is never faded; it is always fully opaque and appears only
// because individual lights come on. Each beat owns its own window and only
// overlaps the next by a breath, so nothing animates "all at once".
//
// Times are seconds from the moment the compiled scene is on screen.
export const BEATS = {
  dark: [0.0, 0.4], //    near darkness: faint silhouette + a whisper of gold edge
  lamp: [0.4, 0.9], //    overhead softbox: top facets / stopper / collar top catch light
  rims: [0.9, 1.4], //    left + right rim strips draw the silhouette, centre stays dark
  material: [1.4, 1.9], // dim front fill + studio reflections: glass + gold accents read
  finale: [1.9, 2.4], //  plinth glow + slow dolly-in begin; label clarity arrives last
};

const len = ([a, b]) => b - a;

export function playIntro(root) {
  const q = (sel) => root.querySelectorAll(sel);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.set(q('[data-reveal="line"]'), { yPercent: 108 });
  gsap.set(q('[data-reveal="fade"]'), { autoAlpha: 0, y: 18 });
  gsap.set(q('[data-reveal="rule"]'), { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(q('[data-reveal="chrome"]'), { autoAlpha: 0, y: -10 });

  if (reduce) {
    const tl = gsap.timeline();
    tl.to(stage, { ...HERO, duration: 1.2, ease: 'power2.inOut' });
    tl.to(q('[data-reveal="line"]'), { yPercent: 0, duration: 0.01 }, 0.2);
    tl.to(q('[data-reveal="rule"]'), { scaleX: 1, duration: 0.01 }, 0.2);
    tl.to(q('[data-reveal="fade"], [data-reveal="chrome"]'), { autoAlpha: 1, y: 0, duration: 0.6 }, 0.4);
    return tl;
  }

  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
  const { lamp, rims, material, finale } = BEATS;

  // 0.00–0.40 · darkness. Nothing moves; the START state holds a faint rim (0.07)
  // and ~2.5% studio reflections, enough for a silhouette and a thin gold edge.

  // 0.40–0.90 · overhead light turns on: a soft ignition, never a snap.
  // Lights only the top: stopper facets, collar rim, shoulder studs.
  tl.to(stage, { lamp: 0.3, duration: 0.12, ease: 'power2.in' }, lamp[0])
    .to(stage, { lamp: 0.18, duration: 0.08, ease: 'sine.out' })
    .to(stage, { lamp: 1, duration: 0.55, ease: 'power2.out' }) // full at ~1.15 s, eased into the rims
    .to(stage, { haze: 1, duration: 1.4, ease: 'sine.inOut' }, lamp[0]);

  // 0.84–1.32 (35%–55%) · MID-REVEAL MOMENT: a narrow warm strip crosses the
  // upper bottle. Only the faceted shoulder, collar and stopper flare as it
  // passes, then fall back to darkness; the body is never lit as a whole.
  const sweep = [0.84, 1.32];
  tl.fromTo(stage, { sweep: -1.5 }, { sweep: 1.5, duration: len(sweep), ease: 'power2.inOut' }, sweep[0])
    .to(stage, { sweepOn: 1, duration: 0.18, ease: 'sine.out' }, sweep[0])
    .to(stage, { sweepOn: 0, duration: 0.22, ease: 'sine.in' }, sweep[1] - 0.22);

  // 0.90–1.40 · rim strips gradually reveal the silhouette; centre stays dark
  tl.to(stage, { rim: 1, duration: len(rims) + 0.2, ease: 'power2.inOut' }, rims[0]);

  // 1.40–1.90 · material: dim front fill + studio reflections bring up the black
  // glass and the champagne-gold collar; the engraving starts to read
  tl.to(stage, { fill: 1, duration: len(material) + 0.3, ease: 'power2.inOut' }, material[0])
    .to(stage, { env: 1, duration: len(material) + 0.3, ease: 'power2.inOut' }, material[0])
    .to(stage, { mark: 0.55, duration: len(material), ease: 'power1.inOut' }, material[0] + 0.15);

  // 1.90–2.40 · plinth glow, then the slow dolly-in and a ~4° perspective turn.
  // The rig adds exponential damping, so the lens accelerates gently and keeps
  // settling for ~1 s after the curve ends: a heavy camera, never a stop.
  tl.to(stage, { plinth: 1, duration: len(finale) + 0.2, ease: 'power2.out' }, finale[0])
    .to(stage, { dolly: 1, duration: 1.9, ease: 'power3.out' }, finale[0])
    .to(stage, { turn: 1, duration: 1.9, ease: 'power3.out' }, finale[0]);

  // label clarity arrives last, peaking after everything else has landed
  tl.to(stage, { mark: 1.35, duration: 0.7, ease: 'power2.inOut' }, finale[0] + 0.25);

  // copy follows the product, never competes with it
  const copy = finale[1] + 0.2;
  tl.to(q('[data-reveal="chrome"]'), { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, copy)
    .to(q('[data-reveal="rule"]'), { scaleX: 1, duration: 0.8, ease: 'expo.out' }, copy)
    .to(q('[data-reveal="fade"][data-order="0"]'), { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, copy + 0.1)
    .to(q('[data-reveal="line"]'), { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.11 }, copy + 0.15)
    .to(q('[data-reveal="fade"][data-order="1"]'), { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, copy + 0.6)
    .to(q('[data-reveal="fade"][data-order="2"]'), { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, copy + 0.8)
    .to(q('[data-reveal="fade"][data-order="3"]'), { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out' }, copy + 1.3);

  // hand over to the idle state: breathing drift + pointer parallax
  tl.to(stage, { idle: 1, duration: 1.6, ease: 'sine.inOut' }, copy + 0.8);

  return tl;
}
