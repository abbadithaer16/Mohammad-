---
name: cinematic-camera
description: Cinematographer-grade camera for scroll-driven 3D product films — one persistent perspective camera on a plotted path (dolly, crane, orbit, push-in, pull-out, lateral tracking, reveal and macro shots), spline interpolation, lookAt targets, projection-shift framing, damping against jumps, and composition that holds across screen sizes. Use whenever designing or changing camera motion or shot composition.
---

# CINEMATIC CAMERA — One camera, one plotted move

## Purpose

The camera is the main storytelling device. A scroll-controlled product film
is one continuous camera move through one physical studio: approaching,
circling, inspecting, retreating and returning. If the camera is merely
interpolated between per-section "states", the site reads as sections with
animation. If it travels a designed path, it reads as a film.

## When to use

- Designing shots, transitions or scene order.
- Any change to camera position, target, FOV or framing.
- Fixing jumps, resets, dull compositions or "same shot again" chapters.
- Adapting composition to tablet and mobile.

## Implementation principles

1. **One persistent PerspectiveCamera, one path.** Plot the whole film as a
   sequence of physical camera keys and drive the camera with ONE scroll
   value (`stage.cam` = position along the path). Do not assign isolated
   camera states per section and blend them mechanically.
2. **Think in a cinematographer's vocabulary.** Every move is a dolly (in/out),
   crane (up/down), orbit/arc (around the subject), lateral track, push-in
   or pull-out. Name each key by the shot it is.
3. **Cylindrical keys around the subject.** For a product, describe the
   camera by azimuth around the product's axis, distance and height, plus an
   aim point. Interpolating azimuth produces true arcs; interpolating XYZ
   cuts straight through the set.
4. **Scale is a narrative tool.** Vary it dramatically: the product overfills
   and crops (115–125% of the frame), becomes medium, fills the frame in
   macro, shrinks to ~30% in atmosphere, and returns large.
5. **Product rotation and camera motion share the beats.** Use both: the
   viewer travels around the object while it turns to meet the light.
6. **Holds are part of the move.** Ease into a key and creep slowly
   (≈2–3° drift, 2–3% push) instead of freezing.

## Technical rules

### Lens and setup
- FOV 24–35° (product photography). Narrow the lens slightly for macro
  (24°) to compress perspective; widen back for reveals.
- `near` 0.05 for macros (surfaces at < 1 unit), `far` 40.
- Normalise the product (1 unit tall, base at y = 0) so all camera numbers
  are in "bottle units".

### The path (as implemented in `src/motion/cameraPath.js`)
```js
// one key = one physical shot
{ az: 24, r: 1.6, y: 0.16, ty: 0.56, fov: 30, sx: 0.14, sy: 0 }
//  az: degrees around the product   r: distance   y: camera height
//  ty: aim height on the axis       fov: lens     sx/sy: framing shift
```
- Interpolate each channel with a Catmull-Rom spline so curvature
  continues smoothly through keys.
- **Interpolate distance in log space** (`exp(lerp(log r1, log r2))`).
  Perceived scale is ∝ 1/distance, so a linear dolly appears to accelerate
  as it nears the subject. Log space reads at a constant rate.
- Key 0 is the previous scene's LIVE pose (here, Scene 1's dolly), so
  hand-overs are seamless.
- The timeline decides rhythm by easing `stage.cam` between integer keys:
  `inOut` eases stop the camera at a key (a hold), while `in` → `out`
  pairs keep it travelling through.
- One long move can pass through an intermediate key with a single tween
  (e.g. return → arc → final with one `power3.inOut`): the spline makes
  the arc overshoot and settle naturally ("arc → settle → push").

### Aim (lookAt) and orientation
- Use `camera.lookAt(target)` with a target on the product's axis
  (`ty` channel). Animate the target height to crane the attention: the
  stopper for TOP, the label band for HEART, the lower glass for BASE.
- Quaternion slerp is only needed when the camera must roll or follow
  non-lookAt orientation (handheld feel, Dutch angles). For an orbiting
  product camera, `lookAt` on an interpolated target is more stable. Never
  interpolate Euler angles.
- Do not roll the camera; roll (tilt) the product if a dynamic angle is needed.

### Framing across screen sizes
- Off-centre composition (product right, copy left) uses a **projection
  shift**: `camera.setViewOffset(w, h, -sx * w, -sy * h, w, h)`. The
  product stays perspective-correct, unlike an off-axis `lookAt`.
- Keep per-mode keys: `wide` (desktop), `compact` (tablet landscape),
  `portrait` (phones: centred, lower `sy`, the camera ~1.2× further back,
  macro ~1.5× further back).
- Derive copy column widths from the path (`chapterBottleLeft`) so text
  never overlaps the product in any composition.

### Preventing jumps
- Follow the sampled pose with exponential damping per channel:
  `pose.r = damp(pose.r, sample.r, 3.4, dt)`, with `dt` clamped to 1/20.
- Apply the outro shift (page scrolling into the footer) undamped, so the
  product moves exactly with the DOM.
- Keep the world orbit-safe: anything that assumes a front camera
  (backdrop planes, haze sheets, smoke) must be anchored to the camera's
  azimuth, or the edges show when the camera circles.
- Camera-relative choreography lights (scans, kickers) rotate with the
  camera's azimuth so they always hit what is on screen.

### Shot grammar for a product film
| Shot | Recipe |
|---|---|
| Reveal | Static or slow dolly in, light does the work (Scene 1) |
| Approach | Strong dolly in + crane down to a low 3/4: 80% → 115% of frame |
| Top / shoulder | Crane up and across the front, looking down at stopper/collar |
| Side / band | Arc 50–70° around, tight on the mid body; label wraps away |
| Base | Drop near plinth level, aim at the lower glass, top crops |
| Macro | Accelerate, crane up and push to ~0.6 units with a 24° lens; detail fills 50–80% |
| Pull-out | Fast throw back to 5+ units through foreground atmosphere |
| Breathe | Continue drifting laterally while far |
| Return | Arc back to a high, centred appreciation view; then interaction |
| Payoff | Arc past the hero line, settle, slight push; light completes AFTER |

## Common mistakes to avoid

- Per-section camera states lerped in sequence (mechanical, and "resets"
  at boundaries).
- Rotating only the product while the camera stays parked: chapters look
  identical.
- Two consecutive chapters with the same distance, height and aim. A
  symmetric product hides orbits, so change the composition too.
- Linear interpolation of distance (dollies speed up near the subject).
- Off-axis `lookAt` for framing (keystoned product).
- Per-frame lerp factors (`x += (t-x)*0.1`): frame-rate dependent.
- Camera at exactly plinth level (grazing reflections blow out).
- Safe, unchanging product scale.

## Performance considerations

- Sampling a spline per frame is trivial. Damping costs nothing.
- Macro shots (camera very close) increase per-pixel cost of the product's
  materials; that's where DOF/transmission costs peak. Test there.
- Avoid changing `fov` every frame without need. When you do,
  `setViewOffset` already updates the projection matrix.

## Practical patterns in this repository

- Path, keys, rotation beats: `src/motion/cameraPath.js` (`KEY`, `ROT`,
  `buildPath`, `samplePath`).
- Camera rig: `src/three/CameraRig.jsx` (Scene 1 live key, damping, creep,
  pointer parallax, projection shift, outro).
- Rhythm: `src/motion/journeyTimeline.js` (`move()` / `hold()` / `release()`).

To add a shot: insert a key in `buildPath` (with portrait/compact
variants), add its index to `KEY` and a rotation beat to `ROT`, then
schedule `move()` and `turn()` in the timeline. Review it as a contact
sheet: frames every 0.5vh across the whole film. Two adjacent chapters
must not look alike.
