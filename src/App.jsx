import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Experience from './three/Experience';
import { detectTier } from './three/quality';
import { computeLayout } from './motion/layout';
import { sceneReady, pointer, stage } from './motion/stage';
import { playIntro } from './motion/introTimeline';
import Header from './components/Header';
import HeroCopy from './components/HeroCopy';
import Scene2Copy from './components/Scene2Copy';
import NotesCopy from './components/NotesCopy';
import { createJourney } from './motion/journeyTimeline';
import Footer from './components/Footer';

const tierName = detectTier();

export default function App() {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
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
      root.style.setProperty('--copy-max-2', `${Math.max(240, Math.min(560, l.pushBottleLeftPx - gutter - w * 0.05))}px`);
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
    let journey;
    let cancelled = false;
    const html = document.documentElement;
    // the opening shot plays uninterrupted; scrolling unlocks once the hero
    // headline has started to land
    html.classList.add('is-locked');
    sceneReady.then(() => {
      if (cancelled) return;
      setReady(true);
      window.scrollTo(0, 0);
      tl = playIntro(rootRef.current);
      journey = createJourney(frameRef.current);
      tl.call(() => html.classList.remove('is-locked'), null, 2.9);

      // review hooks: ?at=1.6 freezes the reveal; ?vh=4.2 jumps to a journey
      // position measured in viewport heights of scroll (see SCENES)
      const params = new URLSearchParams(window.location.search);
      const at = parseFloat(params.get('at'));
      const vh = parseFloat(params.get('vh'));
      if (params.has('debug')) window.__noire = { stage, intro: tl, journey };
      if (!Number.isNaN(at)) {
        tl.pause(at);
        html.classList.remove('is-locked');
      }
      if (!Number.isNaN(vh)) {
        tl.progress(1);
        html.classList.remove('is-locked');
        const st = journey.scrollTrigger;
        st.refresh();
        window.scrollTo(0, st.start + window.innerHeight * vh);
      }
    });
    return () => {
      cancelled = true;
      html.classList.remove('is-locked');
      journey?.scrollTrigger?.kill();
      journey?.kill();
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
        {/* one pinned frame = one continuous shot; scenes are layers in it */}
        <div className="pin-frame" ref={frameRef}>
          <HeroCopy />
          <Scene2Copy />
          <NotesCopy chapter="TOP" index="01" notes={['BERGAMOT', 'PINK PEPPER', 'SAFFRON']} />
          <NotesCopy chapter="HEART" index="02" notes={['ROSE', 'JASMINE', 'OUD']} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
