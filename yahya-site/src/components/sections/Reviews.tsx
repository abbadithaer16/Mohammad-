import { Star } from 'lucide-react';
import { dict, site } from '@/lib/site';
import { Section, SectionHeading, Stars } from '../ui';

export function Reviews() {
  const { items, googleUrl } = site.reviews;
  if (!items.length) return null;
  return (
    <Section id="reviews" labelledBy="reviews-title">
      <SectionHeading id="reviews-title" eyebrow={dict.reviews.eyebrow}>
        {dict.reviews.title}
      </SectionHeading>

      <ul className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
        {items.map((review) => (
          <li key={review.author}>
            <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-6 md:p-7">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] text-muted">
                <Stars rating={review.rating} />
                {dict.reviews.fromGoogle}
              </p>
              <blockquote className="mt-4 flex-1 text-lg leading-[1.9] whitespace-pre-line text-fg">
                <p>{review.text}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-gold/60 font-display text-lg font-bold text-gold"
                >
                  {Array.from(review.author.trim())[0]}
                </span>
                <span className="font-semibold text-soft">
                  <bdi>{review.author}</bdi>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <a href={googleUrl} target="_blank" rel="noopener" className="btn btn-line mt-8">
        <Star aria-hidden className="size-5 fill-gold text-gold" strokeWidth={1.5} />
        {dict.reviews.google}
      </a>
    </Section>
  );
}
