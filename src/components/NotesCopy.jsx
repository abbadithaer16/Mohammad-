// A fragrance chapter (Scene 3: top, Scene 4: heart). Layered in the same
// pinned frame as the hero, so a chapter is a new state of the shot, not a
// new section. Each note line is lit by the timeline in step with the light
// on the bottle (see journeyTimeline.js).
export default function NotesCopy({ chapter, index, notes }) {
  const id = `notes-${chapter.toLowerCase()}`;
  return (
    <section id={id} className="notes" data-chapter={chapter.toLowerCase()} aria-labelledby={`${id}-title`}>
      <div className="notes-copy">
        <p id={`${id}-title`} className="notes-label" data-n="label">
          <span className="notes-index">{index}</span>
          <span className="notes-rule" data-n="rule" aria-hidden="true" />
          {chapter}
        </p>
        <ul className="notes-list">
          {notes.map((note) => (
            <li className="line" key={note}>
              <span className="line-inner" data-n="line">
                {note}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
