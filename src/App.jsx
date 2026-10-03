import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Experience from './three/Experience';
import { detectTier } from './three/quality';
import { computeLayout } from './motion/layout';
import { sceneReady, pointer } from './motion/stage';
import { playIntro } from './motion/introTimeline';
import Header from './components/Header';
import HeroCopy from './components/HeroCopy';
import Footer from './components/Footer';

const tierName = detectTier();

export default function App() {
  const rootRef = useRef(null);
  const [layoutMode, setLayoutMode] = useState(() => computeLayout(window.innerWidth, window.innerHeight).mode);
  const [ready, setReady] = useState(false);

  // copy column never reaches the bottle: its width is derived from the
  // bottle's projected left edge in the final hero pose
  useLayoutEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const l = computeLayout(w, h);
      const root = document.documentElement;
      const gutter = Math.max(24, w * 0.07);
      root.style.setProperty('--gutter', `${gutter}px`);
      root.style.setProperty('--copy-max', `${Math.max(240, Math.min(600, l.bottleLeftPx - gutter - w * 0.04))}px`);
      setLayoutMode(l.mode);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    let tl;
    let cancelled = false;
    sceneReady.then(() => {
      if (cancelled) return;
      setReady(true);
      tl = playIntro(rootRef.current);
      // ?at=1.6 freezes the reveal at a given second (review / screenshots)
      const at = parseFloat(new URLSearchParams(window.location.search).get('at'));
      if (!Number.isNaN(at)) tl.pause(at);
    });
    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="app" data-layout={layoutMode} data-ready={ready}>
      <Experience tierName={tierName} />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="loader" aria-hidden="true"><span /></div>
      <Header />
      <main>
        <HeroCopy />
      </main>
      <Footer />
    </div>
  );
}
