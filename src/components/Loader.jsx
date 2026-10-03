import { useProgress } from '@react-three/drei';

// Near-black, a small NOIRÉ wordmark and a hairline that fills with the real
// asset progress (bottle, textures, fonts). It dissolves straight into the
// first frame of Scene 1, which itself opens in darkness.
export default function Loader({ ready }) {
  const { progress } = useProgress();
  return (
    <div className="loader" aria-hidden={ready} role="status" aria-live="polite">
      <span className="loader-mark">NOIRÉ</span>
      <span className="loader-track">
        <span className="loader-fill" style={{ transform: `scaleX(${ready ? 1 : Math.max(0.04, progress / 100) * 0.92})` }} />
      </span>
      <span className="sr-only">{ready ? 'Loaded' : `Loading ${Math.round(progress)}%`}</span>
    </div>
  );
}
