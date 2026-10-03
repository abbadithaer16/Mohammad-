import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SCENES } from './journeyTimeline';

gsap.registerPlugin(ScrollToPlugin);

// Named cinematic states, as positions on the journey timeline (vh of scroll).
// Navigation travels the camera to these states instead of jumping.
export const DESTINATIONS = {
  top: 0,
  scent: SCENES.s2[0] + 1.9, // Scene 2 composed: "An impression before a word."
  notes: SCENES.s3[0] + 1.75, // Scene 3 composed: top notes
  signature: SCENES.s8[0] + 1.3, // Scene 8: the bottle, from every angle
  finale: SCENES.s9[1], // Scene 9: final hero + CTA
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
