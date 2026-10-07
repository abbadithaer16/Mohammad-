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

// Shot names map to path positions (key indices) for the timeline + nav.
// Consecutive keys always change azimuth AND distance/height together, so
// every transition is an arc, crane or dolly through the set, never the
// bottle simply growing on the same axis.
export const KEY = {
  hero: 0, //       01 · end of the reveal
  orbitA: 1, //     02 · the arc begins: high camera-right
  orbitB: 2, //          ...swinging round low camera-left, one side into dark
  detailA: 3, //    03 · macro: the stopper's cut geometry, from above
  detailB: 4, //         ...craning down onto the gold collar while arcing round it
  pullback: 5, //   04 · thrown back into the atmosphere (still arcing right)
  drift: 6, //           ...still travelling through it
  top: 7, //        05 · olfactory world: up onto the stopper (TOP)
  heart: 8, //           ...round to the label band (HEART)
  base: 9, //            ...down to the lower glass (BASE)
  sigA: 10, //      06 · the signature shot: full bottle, centred
  sigB: 11, //           ...a slow cinematic push
  craftA: 12, //    07 · macro: the NOIRÉ engraving square to the lens
  craftB: 13, //         ...tracking down and round across the cut facets
  monument: 14, //  08 · low, monumental (arcing on past centre)
  final: 15, //     09 · the CTA frame (Scene 1's framing, a touch closer)
};

// Bottle rotation (degrees, added after Scene 1's -5°) on the same beats as the
// camera. The CAMERA travels; the bottle only turns slowly and a little, so the
// world-fixed studio light genuinely slides across the glass as the camera
// orbits. The engraving faces the lens when rot = camera azimuth + 5°.
export const ROT = {
  orbitA: 4,
  orbitB: 8,
  detailA: 10,
  detailB: 12,
  pullback: 15,
  drift: 18,
  top: 22,
  heart: 48, // the mark sits on the band, a little turned away (camera at 62°)
  base: 52,
  sigA: 30,
  sigB: 9, // = sigB azimuth 4° + 5°: the engraving arrives facing the lens
  craftA: -15, // = craftA azimuth -20° + 5°: square to the lens for the macro
  craftB: -12,
  monument: 19,
  final: 35, // = +30°: front 3/4 (unchanged from Scene 1's bookend)
};

// Lens: one 30° lens for the whole film; macros close down to 27°. Distances
// were re-derived so each frame keeps its framing: tan(fov/2) * r is constant.
const MACRO_FOV = 27;
const M = (r) => r * (Math.tan((24 / 2) * DEG) / Math.tan((MACRO_FOV / 2) * DEG)); // keys authored at 24°

export function buildPath(layout) {
  const portrait = layout.mode === 'portrait';
  const compact = layout.mode === 'compact';
  // phones frame from a little further back (copy sits above the bottle) and
  // travel less; the macros need proportionally more room on a narrow screen
  const R = (r, phone = 1.22) => r * (portrait ? phone : compact ? 1.1 : 1);
  const A = (az) => (portrait ? az * 0.7 : az); // smaller arcs on phones
  const SX = (x) => (portrait ? 0 : compact ? x + 0.02 : x);
  const SY = (x, phone) => (portrait ? phone : x);
  const d = layout.dEnd;

  return [
    null, // K0 is live: Scene 1's own pose (see CameraRig)
    // 02 · SCULPTURAL ORBIT: an arc from high camera-right...
    { az: A(38), r: R(2.0), y: 0.66, ty: 0.52, fov: 30, sx: SX(0.14), sy: SY(0.02, 0.16) },
    // ...round to low camera-left; the world-fixed studio light means one side
    // of the bottle falls into darkness as the camera passes (short phones sit
    // further back and lower, under the two-line copy)
    { az: A(-42), r: R(1.7, layout.short ? 1.42 : 1.22), y: 0.36, ty: 0.55, fov: 30, sx: SX(0.14), sy: SY(0, layout.short ? 0.24 : 0.16) },
    // 03 · MATERIAL / GOLD: the camera keeps arcing right as it rises and
    // pushes in, until the stopper's cut geometry fills the frame...
    { az: A(-16), r: R(M(0.6), 1.75), y: 1.02, ty: 0.9, fov: MACRO_FOV, sx: SX(0.2), sy: SY(0, 0.26) },
    // ...then cranes down onto the gold collar while orbiting it: the fixed
    // studio light travels across the brushed gold
    { az: A(12), r: R(M(0.66), 1.75), y: 0.8, ty: 0.78, fov: MACRO_FOV, sx: SX(0.2), sy: SY(0, layout.short ? 0.26 : 0.14) },
    // 04 · ATMOSPHERE: thrown back through the veil, still arcing right; the
    // bottle small and far
    { az: A(24), r: R(5.4, 1.12), y: 0.95, ty: 0.55, fov: 30, sx: SX(0), sy: SY(0, 0.05) },
    // ...drifting on sideways through the smoke
    { az: A(40), r: R(4.9, 1.12), y: 0.72, ty: 0.55, fov: 30, sx: SX(0), sy: SY(0.01, 0.05) },
    // 05 · OLFACTORY WORLD — TOP: arcing back in close, looking down onto the stopper
    { az: A(6), r: R(1.045), y: 1.08, ty: 0.8, fov: 30, sx: SX(0.13), sy: SY(0.05, 0.2) },
    // HEART: arc round to the side, tight on the label band
    { az: A(62), r: R(1.05, 1.6), y: 0.62, ty: 0.58, fov: 30, sx: SX(0.16), sy: SY(0, 0.26) },
    // BASE: down toward the lower glass, just above the plinth
    { az: A(28), r: R(1.28, 2.0), y: 0.19, ty: SY(0.34, 0.42), fov: 30, sx: SX(0.14), sy: SY(0.02, 0.34) },
    // 06 · SIGNATURE: continuing left and out to the full bottle, centred
    { az: A(-14), r: d * 1.28, y: 0.72, ty: 0.5, fov: 30, sx: SX(0.02), sy: SY(0.02, 0.07) },
    // ...a slow cinematic push while the bottle turns its mark to the lens
    { az: A(4), r: d * 1.08, y: 0.6, ty: 0.5, fov: 30, sx: SX(0.03), sy: SY(0.02, 0.08) },
    // 07 · CRAFT: arc left and in to the engraving band (azimuth not
    // phone-scaled, so ROT.craftA keeps the mark square to the lens everywhere)
    { az: -20, r: R(M(0.72), 1.8), y: 0.55, ty: 0.51, fov: MACRO_FOV, sx: SX(0.06), sy: SY(0, 0.03) },
    // ...then a slow macro track down and round across the cut facets
    { az: A(-2), r: R(M(0.95), 1.8), y: 0.4, ty: 0.3, fov: MACRO_FOV, sx: SX(0.04), sy: SY(0, 0.03) },
    // 08 · MONUMENT: pull back low and wide, carrying on round past centre
    { az: A(14), r: d * 1.14, y: 0.3, ty: 0.52, fov: 30, sx: 0, sy: SY(0.06, 0.1) },
    // 09 · CTA: arc back and settle on Scene 1's framing, a touch closer (the bookend)
    { az: 0, r: d * 0.93, y: 0.539, ty: 0.5, fov: 30, sx: layout.shiftX, sy: layout.shiftY },
  ];
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
// bottle across the compositions that carry left-hand copy, in px.
const COPY_KEYS = [KEY.orbitA, KEY.orbitB, KEY.top, KEY.heart, KEY.base];
export function chapterBottleLeft(keys, w, h) {
  let left = Infinity;
  for (const k of COPY_KEYS.map((i) => keys[i])) {
    const dist = Math.hypot(k.r, k.y - k.ty);
    const fraction = 1 / (2 * dist * Math.tan((k.fov / 2) * DEG));
    left = Math.min(left, (0.5 + k.sx) * w - (fraction * h * 0.56) / 2);
  }
  return left;
}
