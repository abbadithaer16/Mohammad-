// THE CAMERA PATH — one plotted move through one studio.
//
// Every key is a physical camera position around the bottle (cylindrical:
// azimuth around the bottle's axis, distance from it, height), plus where it
// aims, the lens and the framing offset. The path between keys is a smooth
// Catmull-Rom spline per channel, so:
//   - changing azimuth is a real orbit/arc around the product, never a straight
//     cut across the set,
//   - distance is interpolated in log space, so a dolly reads at a constant
//     perceived speed (scale ∝ 1/distance),
//   - the path keeps its curvature through the keys; the scroll timeline
//     decides where the camera actually stops (holds) by easing `stage.cam`.
//
// Bottle: 1 unit tall, base on y = 0. Azimuth 0 = straight in front.

const DEG = Math.PI / 180;

// Scene names map to path positions (key indices) for the timeline + nav.
export const KEY = {
  hero: 0, // end of Scene 1
  approach: 1, // Scene 2: low 3/4, the bottle overfills the frame
  top: 2, // Scene 3: up and across the front shoulder, onto the stopper
  heart: 3, // Scene 4: arc round to the side, the label band
  base: 4, // Scene 5: down to the base and lower glass, almost at plinth level
  macro: 5, // Scene 6: the gold collar fills the frame
  pullback: 6, // Scene 7: thrown back into the smoke
  breathe: 7, //          still drifting through it
  return: 8, // Scene 8: the bottle emerges, the camera comes back on an arc
  arc: 9, // Scene 9: the last arc passes the hero line...
  final: 10, //          ...and settles with a slight push
};

// Bottle rotation (degrees, added after Scene 1's -5°) planned on the same
// beats, so product and camera move together: the viewer travels around the
// object AND the object turns to meet the light.
export const ROT = {
  approach: 15, // -5° -> +10°
  top: 43,
  heart: 77, // label turns to meet the side camera (camera 62°, label ~72°)
  base: 110, // darker profile
  macro: 123,
  pullback: 133,
  breathe: 145,
  return: 255,
  signature: 315, // the slow turn while the visitor may drag
  final: 345, // = -20°: the front 3/4 hero angle
};

export function buildPath(layout) {
  const portrait = layout.mode === 'portrait';
  const compact = layout.mode === 'compact';
  // phones frame from a little further back (copy sits above the bottle);
  // the macro needs proportionally more room on a narrow screen
  const R = (r, phone = 1.22) => r * (portrait ? phone : compact ? 1.1 : 1);
  const SX = (x) => (portrait ? 0 : compact ? x + 0.02 : x);
  const SY = (x, phone) => (portrait ? phone : x);

  const keys = [
    null, // K0 is live: Scene 1's own pose (see CameraRig)
    // Scene 2 · strong dolly in, camera drops to a low 3/4 angle; the bottle
    // grows to ~115% of the frame and crops top and bottom
    { az: 24, r: R(1.6), y: 0.16, ty: 0.56, fov: 30, sx: SX(0.14), sy: SY(0, 0.17) },
    // Scene 3 · TOP: crane up and back across the front shoulder, looking down
    // onto stopper, collar and upper glass
    { az: 6, r: R(1.12), y: 1.08, ty: 0.8, fov: 28, sx: SX(0.13), sy: SY(0.05, 0.2) },
    // Scene 4 · HEART: arc round to the side at mid height, the label band
    { az: 62, r: R(1.45), y: 0.5, ty: 0.5, fov: 30, sx: SX(0.16), sy: SY(0, 0.16) },
    // Scene 5 · BASE: drop almost to plinth level, aim at the lower glass
    { az: 28, r: R(1.28), y: 0.05, ty: 0.3, fov: 30, sx: SX(0.14), sy: SY(0.02, 0.12) },
    // Scene 6 · MACRO: crane up and push in until the gold collar and stopper
    // fill most of the frame
    { az: 10, r: R(0.62, 1.5), y: 0.9, ty: 0.835, fov: 24, sx: SX(0.08), sy: SY(0, 0.05) },
    // Scene 7 · thrown back through the smoke, the bottle small and distant
    { az: -25, r: R(5.4, 1.12), y: 0.95, ty: 0.55, fov: 30, sx: SX(0), sy: SY(0, 0.05) },
    // ...and still travelling, drifting sideways through the atmosphere
    { az: -40, r: R(4.9, 1.12), y: 0.72, ty: 0.55, fov: 30, sx: SX(0), sy: SY(0.01, 0.05) },
    // Scene 8 · the return: the camera comes back toward the product on an arc
    { az: -8, r: layout.dEnd * 1.03, y: 0.64, ty: 0.5, fov: 30, sx: SX(0.08), sy: SY(0.02, 0.09) },
    // Scene 9 · one last arc past the hero line...
    { az: 6, r: layout.dEnd * 1.01, y: 0.58, ty: 0.5, fov: 30, sx: layout.shiftX * 0.9, sy: layout.shiftY * 0.9 },
    // ...settling with a slight push, on Scene 1's framing (the bookend)
    { az: 0, r: layout.dEnd * 0.93, y: 0.539, ty: 0.5, fov: 30, sx: layout.shiftX, sy: layout.shiftY },
  ];
  return keys;
}

const CHANNELS = ['az', 'lr', 'y', 'ty', 'fov', 'sx', 'sy'];

// uniform Catmull-Rom for one scalar
const cr = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

// Evaluate the path at u (0 .. keys.length-1). `k0` is Scene 1's live pose.
export function samplePath(keys, k0, u, out) {
  const all = keys.map((k, i) => (i === 0 ? k0 : k));
  const last = all.length - 1;
  const uc = Math.min(Math.max(u, 0), last);
  const i = Math.min(Math.floor(uc), last - 1);
  const t = uc - i;
  const pick = (j) => all[Math.min(Math.max(j, 0), last)];
  const a = pick(i - 1);
  const b = pick(i);
  const c = pick(i + 1);
  const d = pick(i + 2);
  for (const ch of CHANNELS) {
    const get = (k) => (ch === 'lr' ? Math.log(k.r) : k[ch]);
    out[ch] = cr(get(a), get(b), get(c), get(d), t);
  }
  out.r = Math.exp(out.lr);
  out.azRad = out.az * DEG;
  return out;
}

// Copy columns must never reach the bottle: the narrowest left edge of the
// bottle across the chapter compositions (Scenes 2–5), in px.
export function chapterBottleLeft(keys, w, h) {
  let left = Infinity;
  for (const k of keys.slice(1, 5)) {
    const dist = Math.hypot(k.r, k.y - k.ty);
    const fraction = 1 / (2 * dist * Math.tan((k.fov / 2) * DEG));
    left = Math.min(left, (0.5 + k.sx) * w - (fraction * h * 0.56) / 2);
  }
  return left;
}
