import { useRef } from 'react';

// Model attribution required by CC-BY-4.0 (public/models/LICENSE-bottle.txt).
export default function Footer() {
  const dialogRef = useRef(null);

  return (
    <footer className="site-footer">
      <span className="footer-mark">NOIRÉ</span>
      <span className="footer-legal">© 2026 NOIRÉ. A fictional fragrance house.</span>
      <button type="button" className="credits-link" onClick={() => dialogRef.current?.showModal()}>
        Credits
      </button>

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
            Changes: materials recoloured and re-authored (smoked black glass, champagne gold), collar separated from the body
            mesh, NOIRÉ engraving added, textures resized.
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
}
