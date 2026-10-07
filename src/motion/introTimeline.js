import gsap from 'gsap';
import { stage, HERO } from './stage';

// SCENE 01 — THE REVEAL (time-based, before scroll takes over)
//
// The opening seconds of a fragrance film. Almost complete darkness, then a
// single narrow light travels across the bottle: it finds an edge, then the
// faceted shoulder, then the gold collar. Only then does the silhouette
// resolve (rims), the overhead light settle, the material read, and the
// engraving catch light last. The camera approaches slowly underneath it all.
// The bottle is never faded: it appears only because light reaches it.
//
// Times are seconds from the moment the compiled scene is on screen.
export const BEATS = {
  dark: [0.0, 0.35], //    near black: the faintest edge, the room barely there
  sweep: [0.35, 2.0], //   a narrow light travels: edge -> shoulder -> gold -> far edge
  lamp: [1.2, 2.0], //     the overhead softbox settles onto stopper and shoulders
  rims: [1.55, 2.25], //   rim strips resolve the full silhouette
  material: [2.0, 2.7], // dim front fill + studio reflections: black glass reads
  finale: [2.4, 3.1], //   plinth glow; the engraving catches light last (to ~3.5 s)
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
  const { sweep, lamp, rims, material, finale } = BEATS;

  // 0.00–0.35 · darkness. The START state holds only a whisper of rim (0.03)
  // and ~2.5% studio reflections.

  // camera: a slow, heavy approach under the whole reveal (eased again by
  // the rig's damping) + a few degrees of real 3D turn
  tl.to(stage, { dolly: 1, duration: 3.4, ease: 'power2.inOut' }, 0.2)
    .to(stage, { turn: 1, duration: 3.4, ease: 'power2.inOut' }, 0.2)
    .to(stage, { haze: 1, duration: 1.8, ease: 'sine.inOut' }, 0.6);

  // 0.35–2.00 · ONE NARROW LIGHT travels left -> right across the upper bottle:
  // first an edge, then the shoulder facets, then the gold collar, then the
  // far edge. Everything else stays dark while it passes.
  tl.fromTo(stage, { sweep: -1.5 }, { sweep: 1.5, duration: len(sweep), ease: 'power1.inOut' }, sweep[0])
    .to(stage, { sweepOn: 1, duration: 0.35, ease: 'sine.out' }, sweep[0])
    .to(stage, { sweepOn: 0, duration: 0.4, ease: 'sine.in' }, sweep[1] - 0.4);

  // 1.20–2.00 · the overhead light settles (a soft ignition, never a snap)
  tl.to(stage, { lamp: 0.28, duration: 0.14, ease: 'power2.in' }, lamp[0])
    .to(stage, { lamp: 0.18, duration: 0.1, ease: 'sine.out' })
    .to(stage, { lamp: 1, duration: 0.6, ease: 'power2.out' });

  // 1.55–2.25 · rim strips resolve the silhouette; the centre stays dark
  tl.to(stage, { rim: 1, duration: len(rims), ease: 'power2.inOut' }, rims[0]);

  // 2.00–2.70 · material: dim front fill + studio reflections
  tl.to(stage, { fill: 1, duration: len(material) + 0.2, ease: 'power2.inOut' }, material[0])
    .to(stage, { env: 1, duration: len(material) + 0.2, ease: 'power2.inOut' }, material[0]);

  // 2.40–3.10 · plinth glow; the NOIRÉ engraving catches light LAST
  tl.to(stage, { plinth: 1, duration: len(finale), ease: 'power2.out' }, finale[0])
    .to(stage, { mark: 0.55, duration: 0.5, ease: 'power1.inOut' }, finale[0] + 0.1)
    .to(stage, { mark: 1.35, duration: 0.6, ease: 'power2.inOut' }, finale[0] + 0.6);

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
