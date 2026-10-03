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

  // SCENE 2 — colour flood + dolly-in. All neutral at 0 (or 1 for scales), so
  // Scene 1 renders exactly as approved until the scroll timeline moves them.
  push: 0, // 0 = Scene 1 hero pose, 1 = Scene 2 close, low, 3/4 pose
  turn2: 0, // 0..1 -> extra bottle rotY (TURN2_DELTA)
  flood: 0, // 0..1 warm amber environment spreading out from the plinth
  side: 0, // warm side strip, camera-right
  collar: 0, // narrow kicker on the champagne-gold collar
  fillScale: 1, // multiplies the front fill (reduced as the camera gets close)

  // SCENE 3 — top notes
  turn3: 0, // 0..1 -> +TURN3_DELTA
  focus: 0, // camera favours the upper bottle (stopper / collar / shoulder)
  topBoost: 0, // brighter, warmer overhead light
  scan: 0, // horizontal light-scan strip intensity
  scanY: 1.15, // its height, in bottle units (base = 0, stopper top = 1)

  // SCENE 4 — heart notes
  turn4: 0, // 0..1 -> +TURN4_DELTA
  arc: 0, // subtle camera arc (yaw) + lower eye line
  low: 0, // low, warm side light
  hue: 0, // atmosphere shifts amber -> red-brown

  // SCENE 5 — base notes (heavier, darker, lower)
  turn5: 0, // 0..1 -> +TURN5_DELTA, toward a darker profile
  deep: 0, // camera: a touch lower, 5% closer, 3° lateral drift
  baseGlow: 0, // AMBER: warm glow behind / through the lower glass
  rimScale: 1, // MUSK: softens rims + side light (and later, the smoke)
  wood: 0, // SANDALWOOD: atmosphere turns woody brown
  sideScale: 1, // SANDALWOOD: directional side light strengthens
  ivory: 0, // VANILLA: faint ivory-gold lift in the haze
  envScale: 1, // multiplies studio reflections (upper/front brightness)

  // SCENE 6 — cap / material macro
  turn6: 0, // 0..1 -> +TURN6_DELTA, slow, so reflections crawl over facets
  macro: 0, // camera travels to the stopper / collar macro pose
  dof: 0, // depth-of-field strength (high tier only)
  rack: 0, // focus target: 0 stopper -> 1 gold collar -> 2 glass edge
  dim: 0, // background falls toward black

  // SCENE 7 — smoke interlude
  turn7: 0, // 0..1 -> +TURN7_DELTA, the rotation slowing to rest
  breathe: 0, // camera retreats to a centred, wider pose
  smoke: 0, // dark warm smoke sheets + soft light shaft
  word: 0, // the huge out-of-focus NOIRÉ behind the bottle
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
export const TURN2_DELTA = (10 * Math.PI) / 180; // Scene 2: -5° -> +5°
export const TURN3_DELTA = (35 * Math.PI) / 180; // Scene 3: +5° -> +40°
export const TURN4_DELTA = (35 * Math.PI) / 180; // Scene 4: +40° -> +75°
export const TURN5_DELTA = (35 * Math.PI) / 180; // Scene 5: +75° -> +110°
export const TURN6_DELTA = (12 * Math.PI) / 180; // Scene 6: +110° -> +122°
export const TURN7_DELTA = (10 * Math.PI) / 180; // Scene 7: +122° -> +132°

// pointer, normalised -1..1, written by a window listener
export const pointer = { x: 0, y: 0 };

// "scene is compiled and on screen" signal, so the intro starts on a warm GPU
let readyResolve;
export const sceneReady = new Promise((r) => (readyResolve = r));
export const markSceneReady = () => readyResolve();
