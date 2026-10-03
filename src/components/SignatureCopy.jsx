import { useRef } from 'react';
import { spin } from '../motion/stage';

// Scene 8: small microcopy + the drag-to-turn surface. The surface only takes
// pointer events while Scene 8 is on screen (see [data-scene] in styles.css),
// so it never steals scroll or clicks anywhere else in the film.
export default function SignatureCopy() {
  const last = useRef({ x: 0, t: 0 });

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    spin.dragging = true;
    spin.velocity = 0;
    last.current = { x: e.clientX, t: performance.now() };
  };
  const onPointerMove = (e) => {
    if (!spin.dragging) return;
    const now = performance.now();
    const dx = e.clientX - last.current.x;
    const dt = Math.max(1, now - last.current.t) / 1000;
    const delta = dx * 0.0065; // radians per pixel: a full turn ≈ 970 px of drag
    spin.offset += delta;
    spin.velocity = spin.velocity * 0.6 + (delta / dt) * 0.4;
    last.current = { x: e.clientX, t: now };
  };
  const onPointerUp = () => {
    spin.dragging = false;
    spin.velocity = Math.max(-6, Math.min(6, spin.velocity)); // soft, capped inertia
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      spin.velocity += e.key === 'ArrowLeft' ? -1.6 : 1.6;
    }
  };

  return (
    <section id="signature" className="signature" aria-labelledby="signature-title">
      <div
        className="drag-zone"
        role="button"
        tabIndex={-1}
        data-drag-zone
        aria-label="Turn the bottle. Drag, or use the left and right arrow keys."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      />
      <div className="signature-copy" data-sig="fade">
        <span className="signature-rule" aria-hidden="true" />
        <h2 id="signature-title" className="signature-title">
          <span>The Signature</span>
          <span>From every angle</span>
        </h2>
        <p className="drag-hint" aria-hidden="true">
          <span className="drag-hint-line" />
          Drag to turn
        </p>
      </div>
    </section>
  );
}
