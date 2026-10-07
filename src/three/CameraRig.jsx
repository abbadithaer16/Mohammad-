import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { stage, pointer } from '../motion/stage';
import { computeLayout } from '../motion/layout';
import { buildPath, samplePath } from '../motion/cameraPath';

const { damp, lerp } = THREE.MathUtils;

// One persistent camera. Scene 1 (the time-based reveal) dollies on its own
// curve; from there on the camera only ever travels along ONE plotted path
// (cameraPath.js), driven by a single scroll-scrubbed value, `stage.cam`.
// The path's first key is Scene 1's live pose, so the hand-over is seamless.
//
// The sampled pose is followed with exponential damping: even a fast flick of
// the trackpad leaves the lens with mass (eased starts, soft landings).
export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const layout = useMemo(() => computeLayout(size.width, size.height), [size.width, size.height]);
  const keys = useMemo(() => buildPath(layout), [layout]);
  const k0 = useMemo(() => ({ az: 0, r: layout.dStart, y: 0, ty: layout.targetY, fov: layout.fov, sx: layout.shiftX, sy: layout.shiftY }), [layout]);
  const sample = useMemo(() => ({}), []);
  const target = useMemo(() => new THREE.Vector3(0, layout.targetY, 0), [layout]);
  const pose = useMemo(
    () => ({ az: 0, r: layout.dStart, y: layout.targetY + layout.camLift, ty: layout.targetY, fov: layout.fov, sx: layout.shiftX, sy: layout.shiftY }),
    [layout],
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);

    // Scene 1's live pose = key 0 of the path
    k0.r = lerp(layout.dStart, layout.dEnd, stage.dolly);
    k0.y = layout.targetY + layout.camLift * (1 - stage.dolly * 0.35);
    samplePath(keys, k0, stage.cam, sample);

    // pointer parallax: full in the opening shot, quieter along the path (a
    // tiny orbit offset), off while the visitor drags the bottle
    const onPath = Math.min(1, stage.cam);
    const amp = layout.parallax * stage.idle * (1 - onPath * 0.75) * (1 - stage.interact * 0.7);

    // holds are slow travel along the path itself (journeyTimeline `drift`),
    // so the lens only adds damping and the pointer's small orbit offset
    pose.az = damp(pose.az, sample.az + pointer.x * 1.4 * amp, 3.4, dt);
    pose.r = damp(pose.r, sample.r, 3.4, dt);
    pose.y = damp(pose.y, sample.y - pointer.y * 0.03 * amp, 3.0, dt);
    pose.ty = damp(pose.ty, sample.ty, 3.4, dt);
    pose.fov = damp(pose.fov, sample.fov, 3.4, dt);
    pose.sx = damp(pose.sx, sample.sx, 3.4, dt);
    pose.sy = damp(pose.sy, sample.sy, 3.4, dt);

    const az = (pose.az * Math.PI) / 180;
    target.set(0, pose.ty, 0);
    camera.position.set(Math.sin(az) * pose.r, pose.y, Math.cos(az) * pose.r);
    camera.lookAt(target);
    camera.fov = pose.fov;

    // projection shift frames the bottle off-centre without keystone; the
    // outro is applied undamped so the bottle rises exactly with the page
    const { width: w, height: h } = size;
    camera.setViewOffset(w, h, -pose.sx * w, -(pose.sy - stage.outro) * h, w, h);
  });

  return null;
}
