export default function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="NOIRÉ home" data-reveal="chrome">
        NOIRÉ
      </a>
      <nav className="site-nav" aria-label="Primary" data-reveal="chrome">
        <a href="#scene-1">The Scent</a>
        <span className="nav-sep" aria-hidden="true" />
        <a href="#scene-1">Shop</a>
      </nav>
    </header>
  );
}
