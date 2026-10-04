import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { HOLDS, JOURNEY_VH } from './journeyTimeline';

gsap.registerPlugin(ScrollToPlugin);

// Named cinematic states, as positions on the journey timeline (vh of scroll).
// Navigation travels the camera to these states instead of jumping.
export const DESTINATIONS = {
  top: 0,
  scent: HOLDS.s2, // the approach, composed: "An impression before a word."
  notes: HOLDS.s3, // top notes, composed
  signature: HOLDS.s8, // the return: the bottle, from every angle
  finale: JOURNEY_VH, // final hero + CTA
};

let journeyTrigger = null;
export const registerJourney = (st) => (journeyTrigger = st);

export function scrollToState(name) {
  if (!journeyTrigger || document.documentElement.classList.contains('is-locked')) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const y = journeyTrigger.start + DESTINATIONS[name] * window.innerHeight;
  const distance = Math.abs(window.scrollY - y) / window.innerHeight;
  // long journeys take longer, but never feel sluggish: 0.9 s – 2.6 s
  gsap.to(window, {
    scrollTo: { y, autoKill: true },
    duration: reduce ? 0 : Math.min(2.6, Math.max(0.9, distance * 0.22)),
    ease: 'power2.inOut',
    overwrite: true,
  });
}
