const LINES = ['SCENT,', 'MADE TO', 'LINGER.'];

export default function HeroCopy() {
  return (
    <section id="scene-1" className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow" data-reveal="fade" data-order="0">
          <span className="eyebrow-rule" data-reveal="rule" aria-hidden="true" />
          NOIRÉ <span className="eyebrow-slash">/</span> SIGNATURE 01
        </p>

        <h1 id="hero-title" className="headline" aria-label="Scent, made to linger.">
          {LINES.map((line) => (
            <span className="line" key={line} aria-hidden="true">
              <span className="line-inner" data-reveal="line">
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p className="lede" data-reveal="fade" data-order="1">
          A refined fragrance experience crafted for those who leave a mark without saying a word.
        </p>

        <div className="ctas">
          <a className="btn btn-primary" href="#scene-1" data-reveal="fade" data-order="2">
            <span>Discover the scent</span>
          </a>
          <a className="btn btn-ghost" href="#scene-1" data-reveal="fade" data-order="2">
            <span>Shop NOIRÉ</span>
          </a>
        </div>
      </div>

      <div className="scroll-cue" data-reveal="fade" data-order="3" aria-hidden="true">
        <span className="scroll-cue-line" />
        <span className="scroll-cue-label">Scroll</span>
      </div>
    </section>
  );
}
