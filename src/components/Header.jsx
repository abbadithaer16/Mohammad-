// Minimal navigation. Links travel the camera to a cinematic state (see
// motion/navigation.js); the anchors keep real fragment targets for no-JS and
// assistive tech.
export default function Header({ onNavigate, onShop, bagCount }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#scene-1" aria-label="NOIRÉ, back to the opening" data-reveal="chrome" onClick={onNavigate('top')}>
        NOIRÉ
      </a>
      <nav className="site-nav" aria-label="Primary" data-reveal="chrome">
        <a href="#scene-2" onClick={onNavigate('scent')} data-nav="scent">
          The Scent
        </a>
        <a href="#notes-top" onClick={onNavigate('notes')} data-nav="notes">
          Notes
        </a>
        <button type="button" className="nav-shop" onClick={onShop} aria-haspopup="dialog">
          Shop
          {bagCount > 0 && (
            <span className="nav-bag" aria-label={`${bagCount} in bag`}>
              {bagCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}
