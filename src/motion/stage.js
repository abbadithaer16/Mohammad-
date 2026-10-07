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
  rim: 0.03, // gold rim lights: only a whisper of edge in the opening darkness
  fill: 0, // front softbox, reveals the black glass
  env: 0.025, // studio reflections (scene.environmentIntensity)
  plinth: 0, // warm glow pooled on the plinth
  mark: 0.12, // kicker on the gold NOIRÉ engraving, lit last. 0.12 camouflages the
  // foil against the glass until the material beat (may exceed 1: it
  // scales reflected light only, never adds emission)
  sweep: -1.5, // x position of the travelling warm sweep strip
  sweepOn: 0, // its intensity envelope
  haze: 0.35, // atmosphere density

  // SCENES 2–9 — ONE CAMERA PATH. All neutral at 0 (or 1 for scales), so
  // Scene 1 renders exactly as approved until the scroll timeline moves them.
  cam: 0, // position along the camera path (keyframe index, see cameraPath.js)
  rot: 0, // bottle rotation added after Scene 1, in degrees

  // light + atmosphere channels (0..1 unless noted)
  flood: 0, // warm amber spreading out from the plinth across the wall
  side: 0, // warm side strip, camera-right
  collar: 0, // narrow kicker on the champagne-gold collar
  fillScale: 1, // multiplies the front fill
  topBoost: 0, // brighter, warmer overhead light
  scan: 0, // TOP / BASE: horizontal strip travelling down the bottle
  scanY: 1.15, //   its height, in bottle units (base = 0, stopper top = 1)
  band: 0, // HEART: vertical strip sweeping across the label band
  bandTone: 0, // 0 warm amber (HEART) .. 1 neutral champagne (craft macro)
  bandAz: -60, //   its angle around the bottle, relative to the camera (deg)
  low: 0, // low, warm side light
  hue: 0, // atmosphere: amber -> red-brown
  baseGlow: 0, // AMBER: warm glow behind / through the lower glass
  rimScale: 1, // MUSK softens rims + side light
  wood: 0, // SANDALWOOD: woody brown atmosphere
  sideScale: 1, // SANDALWOOD: directional side light
  ivory: 0, // VANILLA: faint ivory-gold lift
  envScale: 1, // multiplies studio reflections
  dof: 0, // depth-of-field strength (high tier only)
  rack: 0, // focus: 0 stopper -> 1 gold collar -> 2 glass edge
  dim: 0, // background falls toward black
  smoke: 0, // smoke sheets around the bottle + light shaft
  veil: 0, // smoke sheets BETWEEN camera and bottle (the camera passes through)
  word: 0, // the huge out-of-focus NOIRÉ deep behind the bottle
  dust: 0, // sparse gold dust hanging in the light (world-fixed: parallax)
  interact: 0, // drag-to-turn enabled (Scene 8, after the return settles)

  // outro: the bottle travels up with the page as the footer enters
  outro: 0,
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

// Scene 8 drag-to-turn: written by the drag zone, integrated by the bottle
// (soft inertia), and eased back to a whole turn when the scene is left
export const spin = { offset: 0, velocity: 0, dragging: false };

// "scene is compiled and on screen" signal, so the intro starts on a warm GPU
let readyResolve;
export const sceneReady = new Promise((r) => (readyResolve = r));
export const markSceneReady = () => readyResolve();

// Fraction of the camera's azimuth the studio wall and haze follow. Below 1 the
// background slides against the bottle during an orbit (parallax).
export const BG_FOLLOW = 0.55;
