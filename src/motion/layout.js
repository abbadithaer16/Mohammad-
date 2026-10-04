// Scene 1 composition per viewport (the opening shot). Everything after Scene 1
// lives on the single camera path in cameraPath.js, which reads these values
// for its first and last keys. Bottle height = 1 world unit, base at y = 0.
//
// Framing is done with a projection shift (camera.setViewOffset), not by
// aiming the camera off-axis, so the bottle stays frontal (no keystone) while
// sitting right of centre on desktop / low-centre on mobile.

const BOTTLE_ASPECT = 0.529; // width / height of the model's bounding box
const FOV = 30;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);

// distance at which a 1u-tall bottle fills `fraction` of the viewport height
const distanceFor = (fraction) => 1 / (fraction * 2 * TAN);

export function computeLayout(w, h) {
  const aspect = w / h;
  const portrait = aspect < 0.85;
  const compact = !portrait && aspect < 1.3; // tablet landscape / square-ish

  let l;
  if (portrait) {
    // short phones get a smaller, lower bottle so the headline block keeps its
    // space above it and the CTAs keep theirs below
    const short = h < 740;
    l = {
      mode: 'portrait',
      startFraction: short ? 0.41 : 0.46,
      endFraction: short ? 0.47 : 0.53,
      shiftX: 0, // bottle horizontally centred
      shiftY: short ? 0.14 : 0.115, // bottle centre at 64% / 61.5% of the height
    };
  } else if (compact) {
    l = { mode: 'compact', startFraction: 0.6, endFraction: 0.71, shiftX: 0.19, shiftY: 0.03 };
  } else {
    l = { mode: 'wide', startFraction: 0.68, endFraction: 0.82, shiftX: 0.17, shiftY: 0.035 };
  }

  l.fov = FOV;
  l.dStart = distanceFor(l.startFraction);
  l.dEnd = distanceFor(l.endFraction);
  l.targetY = 0.5;
  l.camLift = 0.06; // camera sits a touch above the bottle's centre
  l.parallax = portrait ? 0.5 : 1; // smaller motion amplitude on mobile

  // bottle's left edge in the hero pose (px), used to size the hero copy column
  const bottleWpx = l.endFraction * h * BOTTLE_ASPECT;
  l.bottleLeftPx = (0.5 + l.shiftX) * w - bottleWpx / 2;
  return l;
}
