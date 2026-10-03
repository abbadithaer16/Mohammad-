import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { stage, pointer } from '../motion/stage';
import { computeLayout } from '../motion/layout';

const { damp, lerp } = THREE.MathUtils;

// One camera for the whole site. GSAP animates abstract values in `stage`
// (dolly 0..1, later orbit / pitch / focus); this rig turns them into a camera
// pose and follows it with exponential damping, so even a curve that starts
// fast (power3.out) leaves the lens with a heavy, eased start, like a dolly
// with mass.
export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const layout = useMemo(() => computeLayout(size.width, size.height), [size.width, size.height]);
  const target = useMemo(() => new THREE.Vector3(0, layout.targetY, 0), [layout]);
  const pose = useMemo(() => ({ z: layout.dStart, x: 0, y: layout.targetY + layout.camLift }), [layout]);

  useEffect(() => {
    camera.fov = layout.fov;
    // projection shift: frames the bottle off-centre without keystone
    const { width: w, height: h } = size;
    camera.setViewOffset(w, h, -layout.shiftX * w, -layout.shiftY * h, w, h);
    camera.updateProjectionMatrix();
  }, [camera, layout, size]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const amp = layout.parallax * stage.idle;
    const z = lerp(layout.dStart, layout.dEnd, stage.dolly);
    // slight orbit response to the pointer (desktop), max ~1.3°
    const x = pointer.x * 0.06 * amp;
    const y = layout.targetY + layout.camLift * (1 - stage.dolly * 0.35) - pointer.y * 0.03 * amp;

    pose.z = damp(pose.z, z, 3.2, dt);
    pose.x = damp(pose.x, x, 2.2, dt);
    pose.y = damp(pose.y, y, 2.6, dt);
    camera.position.set(pose.x, pose.y, pose.z);
    camera.lookAt(target);
  });

  return null;
}
