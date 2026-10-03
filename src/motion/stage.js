// Single mutable "director's sheet" shared by GSAP (writes) and the R3F frame
// loop (reads). Nothing here is React state: tweening these values never
// triggers a re-render. Every scene of the site animates the same object, which
// is what keeps the journey one continuous shot.

export const START = {
  // camera / product
  dolly: 0, // 0 = wide opening pose, 1 = hero pose (see layout.js)
  turn: 0, // 0..1 -> bottle rotY from TURN_START to TURN_END
  idle: 0, // 0..1 weight of the slow breathing drift + mouse parallax

  // light rig, 0..1 multipliers of each light's full intensity (Lighting.jsx)
  lamp: 0, // overhead warm key
  rim: 0.07, // gold rim lights; non-zero so a faint gold edge is just readable
  fill: 0, // front softbox, reveals the black glass
  env: 0.025, // studio reflections (scene.environmentIntensity)
  plinth: 0, // warm glow pooled on the plinth
  mark: 0.12, // kicker on the gold NOIRÉ engraving, lit last. 0.12 camouflages the
  // foil against the glass until the material beat (may exceed 1: it
  // scales reflected light only, never adds emission)
  sweep: -1.5, // x position of the travelling warm sweep strip
  sweepOn: 0, // its intensity envelope
  haze: 0.35, // atmosphere density
};

export const stage = { ...START };

// final values of the Scene 1 reveal (used directly for reduced motion)
export const HERO = {
  ...START,
  dolly: 1,
  turn: 1,
  idle: 1,
  lamp: 1,
  rim: 1,
  fill: 1,
  env: 1,
  plinth: 1,
  mark: 1.35,
  sweep: 1.5,
  sweepOn: 0,
  haze: 1,
};

export const TURN_START = (-9 * Math.PI) / 180;
export const TURN_END = (-5 * Math.PI) / 180;

// pointer, normalised -1..1, written by a window listener
export const pointer = { x: 0, y: 0 };

// "scene is compiled and on screen" signal, so the intro starts on a warm GPU
let readyResolve;
export const sceneReady = new Promise((r) => (readyResolve = r));
export const markSceneReady = () => readyResolve();
