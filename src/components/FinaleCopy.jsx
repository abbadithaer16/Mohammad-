const LINES = ['FIND YOUR', 'SIGNATURE SCENT.'];

// Scene 9: the final emotional payoff. Same left-column editorial grammar as
// the hero (bookend), the product stays dominant on the right.
export default function FinaleCopy({ onDiscover, onShop }) {
  return (
    <section id="finale" className="finale" aria-labelledby="finale-title">
      <div className="finale-copy">
        <p className="eyebrow" data-fin="fade">
          <span className="eyebrow-rule" aria-hidden="true" />
          NOIRÉ <span className="eyebrow-slash">/</span> SIGNATURE 01
        </p>
        <h2 id="finale-title" className="finale-headline" aria-label="Find your signature scent.">
          {LINES.map((line) => (
            <span className="line" key={line} aria-hidden="true">
              <span className="line-inner" data-fin="line">
                {line}
              </span>
            </span>
          ))}
        </h2>
        <p className="lede" data-fin="fade">
          A fragrance designed to linger
          <br />
          long after the moment is gone.
        </p>
        <div className="ctas">
          <a className="btn btn-primary" href="#notes-top" data-fin="fade" onClick={onDiscover}>
            <span>Discover NOIRÉ</span>
          </a>
          <button type="button" className="btn btn-ghost" data-fin="fade" onClick={onShop}>
            <span>Shop NOIRÉ</span>
          </button>
        </div>
      </div>
    </section>
  );
}
