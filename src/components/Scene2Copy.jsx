const LINES = ['AN IMPRESSION', 'BEFORE A WORD.'];

// Editorial block for Scene 2. It lives in the same pinned frame as the hero
// copy (one continuous shot), so it is positioned over the stage, not stacked
// below it as a new section.
export default function Scene2Copy() {
  return (
    <section id="scene-2" className="scene2" aria-labelledby="scene2-title">
      <div className="scene2-copy">
        <span className="scene2-rule" data-s2="rule" aria-hidden="true" />
        <h2 id="scene2-title" className="scene2-headline" aria-label="An impression before a word.">
          {LINES.map((line) => (
            <span className="line" key={line} aria-hidden="true">
              <span className="line-inner" data-s2="line">
                {line}
              </span>
            </span>
          ))}
        </h2>
        <p className="scene2-lede" data-s2="fade-late">
          Dark woods. Warm amber.
          <br />A trace that stays after you leave.
        </p>
      </div>
    </section>
  );
}
