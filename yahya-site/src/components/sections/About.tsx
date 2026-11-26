import { UserRound } from 'lucide-react';
import { dict, site, t } from '@/lib/site';
import { Section, Stars } from '../ui';

export function About() {
  const { rating, reviewsCount } = site.trust;
  return (
    <Section id="about" labelledBy="about-title">
      <div className="grid items-center gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <p className="eyebrow">{dict.about.eyebrow}</p>
          <h2 id="about-title" className="mt-4 text-[1.7rem] leading-[1.5] font-bold md:text-[2.5rem]">
            {t(site.about.text)}
          </h2>
          <div className="mt-8 flex items-center gap-4">
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
              <UserRound className="size-6" strokeWidth={1.5} />
            </span>
            <p className="leading-snug">
              <span className="block text-[0.95rem] text-muted">{dict.about.engineer}</span>
              <span className="mt-1 block font-display text-xl font-bold text-fg md:text-2xl">{t(site.about.engineer)}</span>
            </p>
          </div>
        </div>

        <a
          href={site.reviews.googleUrl}
          target="_blank"
          rel="noopener"
          className="group grid grid-cols-2 rounded-card border border-gold/35 bg-surface transition-colors hover:border-gold"
        >
          <span className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <span dir="ltr" className="font-display text-5xl leading-none font-bold text-fg md:text-6xl">
              {rating}
            </span>
            <Stars rating={5} className="mt-1" />
            <span className="text-base text-soft">{dict.trust.onGoogle}</span>
          </span>
          <span className="flex flex-col items-center justify-center gap-2 border-s border-line px-4 py-8 text-center">
            <span dir="ltr" className="font-display text-5xl leading-none font-bold text-fg md:text-6xl">
              {reviewsCount}
            </span>
            <span className="mt-1 text-base text-soft">{dict.trust.reviews}</span>
          </span>
        </a>
      </div>
    </Section>
  );
}
