import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Experience from './three/Experience';
import { detectTier } from './three/quality';
import { computeLayout } from './motion/layout';
import { buildPath, chapterBottleLeft } from './motion/cameraPath';
import { sceneReady, pointer, stage } from './motion/stage';
import { playIntro } from './motion/introTimeline';
import { createJourney } from './motion/journeyTimeline';
import { registerJourney, scrollToState } from './motion/navigation';
import Loader from './components/Loader';
import Header from './components/Header';
import HeroCopy from './components/HeroCopy';
import Scene2Copy from './components/Scene2Copy';
import NotesCopy from './components/NotesCopy';
import MacroCopy from './components/MacroCopy';
import SignatureCopy from './components/SignatureCopy';
import MonumentCopy from './components/MonumentCopy';
import FinaleCopy from './components/FinaleCopy';
import ShopDialog from './components/ShopDialog';
import Footer from './components/Footer';

const tierName = detectTier();

export default function App() {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const footerRef = useRef(null);
  const shopRef = useRef(null);
  const [layoutMode, setLayoutMode] = useState(() => computeLayout(window.innerWidth, window.innerHeight).mode);
  const [ready, setReady] = useState(false);
  const [bag, setBag] = useState([]);

  // copy columns never reach the bottle: their widths derive from the bottle's
  // projected left edge in the hero pose and along the chapter path
  useLayoutEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const l = computeLayout(w, h);
      const root = document.documentElement;
      const gutter = Math.max(24, w * 0.07);
      root.style.setProperty('--gutter', `${gutter}px`);
      root.style.setProperty('--copy-max', `${Math.max(240, Math.min(600, l.bottleLeftPx - gutter - w * 0.04))}px`);
      // chapter copy: clear of the bottle in every chapter composition on the path
      const chapterLeft = chapterBottleLeft(buildPath(l), w, h);
      root.style.setProperty('--copy-max-2', `${Math.max(240, Math.min(560, chapterLeft - gutter - w * 0.04))}px`);
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
    let intro;
    let journey;
    let outro;
    let unlockTimer;
    let cancelled = false;
    const html = document.documentElement;
    // the film always opens on its first shot: no restored mid-journey scroll
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // the opening shot plays uninterrupted; scrolling unlocks once the hero
    // headline has started to land
    html.classList.add('is-locked');
    sceneReady.then(() => {
      if (cancelled) return;
      window.scrollTo(0, 0);
      setReady(true);
      intro = playIntro(rootRef.current);
      journey = createJourney(frameRef.current);
      registerJourney(journey.scrollTrigger);
      const unlock = () => html.classList.remove('is-locked');
      // unlock as the hero headline lands (or when the short reduced-motion
      // reveal ends, whichever comes first)
      intro.call(unlock, null, Math.min(3.4, intro.duration()));
      // safety net: on a very slow device GSAP plays the intro in slow motion
      // (lag smoothing); never hold scrolling for more than 5.2 real seconds
      unlockTimer = window.setTimeout(unlock, 5200);

      // outro: once the film has ended, the footer scrolls in and the bottle
      // rises with the page (exactly, undamped) instead of staying behind
      outro = ScrollTrigger.create({
        trigger: footerRef.current,
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          stage.outro = (self.progress * footerRef.current.offsetHeight) / window.innerHeight;
          // the header steps aside as the end card arrives, so the rising
          // finale copy never slides under it
          html.style.setProperty('--chrome-opacity', String(Math.max(0, 1 - self.progress * 2.5)));
        },
      });
    });
    return () => {
      cancelled = true;
      window.clearTimeout(unlockTimer);
      html.classList.remove('is-locked');
      outro?.kill();
      journey?.scrollTrigger?.kill();
      journey?.kill();
      intro?.kill();
    };
  }, []);

  const navigate = useCallback((name) => (e) => {
    e?.preventDefault();
    scrollToState(name);
  }, []);
  const openShop = useCallback((e) => {
    e?.preventDefault();
    shopRef.current?.open();
  }, []);
  const addToBag = useCallback((item) => setBag((b) => [...b, item]), []);

  return (
    <div ref={rootRef} className="app" data-layout={layoutMode} data-ready={ready}>
      <Experience tierName={tierName} />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <Loader ready={ready} />
      <Header onNavigate={navigate} onShop={openShop} bagCount={bag.length} />
      <main>
        {/* one pinned frame = one continuous shot; scenes are layers in it */}
        <div className="pin-frame" ref={frameRef}>
          <HeroCopy onDiscover={navigate('scent')} onShop={openShop} />
          <Scene2Copy />
          <MacroCopy />
          <NotesCopy chapter="TOP" index="01" notes={['BERGAMOT', 'PINK PEPPER', 'SAFFRON']} />
          <NotesCopy chapter="HEART" index="02" notes={['ROSE', 'JASMINE', 'OUD']} />
          <NotesCopy chapter="BASE" index="03" notes={['AMBER', 'MUSK', 'SANDALWOOD', 'VANILLA']} />
          <SignatureCopy />
          <MonumentCopy />
          <FinaleCopy onDiscover={navigate('notes')} onShop={openShop} />
        </div>
      </main>
      <Footer ref={footerRef} onNavigate={navigate} onShop={openShop} />
      <ShopDialog ref={shopRef} onAdd={addToBag} bagCount={bag.length} />
    </div>
  );
}
