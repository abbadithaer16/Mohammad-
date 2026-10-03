import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { stage, pointer } from '../motion/stage';
import { computeLayout } from '../motion/layout';

const { damp, lerp } = THREE.MathUtils;

// One camera for the whole site. GSAP animates abstract values in `stage`
// (Scene 1: dolly 0..1, Scene 2: push 0..1, later orbit / focus); this rig
// turns them into a camera pose and follows it with exponential damping, so
// even a curve that starts fast (power3.out) leaves the lens with a heavy,
// eased start, like a dolly with mass.
//
// At push = 0 the pose is exactly Scene 1's; every Scene 2 term is a lerp
// away from it, so there is no cut between the scenes, only one move.
export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const layout = useMemo(() => computeLayout(size.width, size.height), [size.width, size.height]);
  const target = useMemo(() => new THREE.Vector3(0, layout.targetY, 0), [layout]);
  const pose = useMemo(
    () => ({
      dist: layout.dStart,
      yaw: 0,
      x: 0,
      y: layout.targetY + layout.camLift,
      ty: layout.targetY,
      shiftX: layout.shiftX,
      shiftY: layout.shiftY,
    }),
    [layout],
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const p = stage.push;
    const amp = layout.parallax * stage.idle * (1 - p * 0.5);

    // Scene 1 terms
    const dist1 = lerp(layout.dStart, layout.dEnd, stage.dolly);
    const y1 = layout.targetY + layout.camLift * (1 - stage.dolly * 0.35);
    // Scene 2 blends
    const dist = lerp(dist1, layout.dPush, p) * (1 - stage.focus * 0.03);
    // Scene 3 favours the upper bottle; Scene 4 arcs and lowers the eye line
    const ty = lerp(layout.targetY, layout.pushTargetY, p) + layout.focusTargetY * stage.focus;
    const y =
      lerp(y1, lerp(layout.targetY, layout.pushTargetY, p) + layout.pushLift, p) +
      (layout.focusTargetY + layout.focusLift) * stage.focus +
      layout.arcLift * stage.arc -
      pointer.y * 0.03 * amp;
    const yaw = layout.pushYaw * p + layout.arcYaw * stage.arc;
    const x = pointer.x * 0.06 * amp; // slight orbit response to the pointer, max ~1.3°

    pose.dist = damp(pose.dist, dist, 3.2, dt);
    pose.yaw = damp(pose.yaw, yaw, 3.2, dt);
    pose.x = damp(pose.x, x, 2.2, dt);
    pose.y = damp(pose.y, y, 2.6, dt);
    pose.ty = damp(pose.ty, ty, 3.2, dt);
    pose.shiftX = damp(pose.shiftX, lerp(layout.shiftX, layout.pushShiftX, p), 3.2, dt);
    pose.shiftY = damp(pose.shiftY, lerp(layout.shiftY, layout.pushShiftY, p), 3.2, dt);

    target.y = pose.ty;
    camera.position.set(Math.sin(pose.yaw) * pose.dist + pose.x, pose.y, Math.cos(pose.yaw) * pose.dist);
    camera.lookAt(target);

    // projection shift frames the bottle off-centre without keystone
    const { width: w, height: h } = size;
    if (camera.fov !== layout.fov) camera.fov = layout.fov;
    camera.setViewOffset(w, h, -pose.shiftX * w, -pose.shiftY * h, w, h);
  });

  return null;
}
