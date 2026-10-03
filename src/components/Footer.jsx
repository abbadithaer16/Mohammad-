import { forwardRef, useRef } from 'react';

// The film's end card. Model attribution (CC-BY-4.0, see
// public/models/LICENSE-bottle.txt) lives behind CREDITS.
const Footer = forwardRef(function Footer({ onNavigate, onShop }, ref) {
  const dialogRef = useRef(null);

  return (
    <footer className="site-footer" ref={ref}>
      <div className="footer-top">
        <span className="footer-mark">NOIRÉ</span>
        <p className="footer-statement">Scent, made to linger.</p>
      </div>
      <div className="footer-bottom">
        <nav className="footer-nav" aria-label="Footer">
          <a href="#scene-2" onClick={onNavigate('scent')}>
            The Scent
          </a>
          <button type="button" onClick={onShop} aria-haspopup="dialog">
            Shop
          </button>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <button type="button" onClick={() => dialogRef.current?.showModal()} aria-haspopup="dialog">
            Credits
          </button>
        </nav>
        <span className="footer-legal">© 2026 NOIRÉ. A fictional fragrance house.</span>
      </div>

      <dialog
        ref={dialogRef}
        className="credits-dialog"
        aria-labelledby="credits-title"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      >
        <div className="credits-body">
          <h2 id="credits-title">Credits</h2>
          <p>
            This work is based on{' '}
            <a href="https://sketchfab.com/3d-models/perfume-bottle-2318f02b3bfb4587bc6e50ea768b4e77" target="_blank" rel="noreferrer">
              "perfume bottle"
            </a>{' '}
            by{' '}
            <a href="https://sketchfab.com/elenakozlova479" target="_blank" rel="noreferrer">
              milaha
            </a>{' '}
            licensed under{' '}
            <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
              CC-BY-4.0
            </a>
            .
          </p>
          <p className="credits-note">
            Changes: materials recoloured and re-authored (smoked black crystal, champagne gold), collar separated from the body
            mesh, normals rebuilt, NOIRÉ engraving added, textures resized.
          </p>
          <p className="credits-note">Typefaces: Bodoni Moda and Inter, SIL Open Font License.</p>
          <form method="dialog">
            <button className="credits-close" type="submit">
              Close
            </button>
          </form>
        </div>
      </dialog>
    </footer>
  );
});

export default Footer;
