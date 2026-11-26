import { UserRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import { dict, site, t } from '@/lib/site';
import { DeferredPhoto } from '../Photo';
import { Section, Stars } from '../ui';

/**
 * About text, lead engineer and the Google rating.
 * With images.engineer: text and rating on one side, his portrait (name as caption) on the other.
 * Phones: text → portrait → rating.
 */
export function About() {
  const photo = site.images.engineer;
  const engineer = t(site.about.engineer);
  return (
    <Section id="about" labelledBy="about-title">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_22rem] lg:gap-x-16 lg:gap-y-10">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="eyebrow">{dict.about.eyebrow}</p>
          <h2 id="about-title" className="mt-4 text-[1.7rem] leading-[1.5] font-bold md:text-[2.5rem]">
            {t(site.about.text)}
          </h2>
          {photo ? null : (
            <div className="mt-8 flex items-center gap-4">
              <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
                <UserRound className="size-6" strokeWidth={1.5} />
              </span>
              <EngineerName name={engineer} />
            </div>
          )}
        </div>

        {photo ? (
          <figure className="relative mx-auto w-full max-w-[22rem] overflow-hidden rounded-card border border-gold/35 bg-surface lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="relative aspect-(--ratio)" style={{ '--ratio': `${photo.width} / ${photo.height}` } as CSSProperties}>
              <DeferredPhoto photo={photo} sizes="352px" className="object-cover" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-5 pt-12 pb-4">
              <EngineerName name={engineer} />
            </figcaption>
          </figure>
        ) : null}

        <RatingCard className="w-full lg:col-start-1 lg:row-start-2 lg:max-w-md lg:self-start" />
      </div>
    </Section>
  );
}

function EngineerName({ name }: { name: string }) {
  return (
    <p className="leading-snug">
      <span className="block text-[0.95rem] text-soft">{dict.about.engineer}</span>
      <span className="mt-1 block font-display text-xl font-bold text-fg md:text-2xl">{name}</span>
    </p>
  );
}

function RatingCard({ className }: { className?: string }) {
  const { rating, reviewsCount } = site.trust;
  return (
    <a
      href={site.reviews.googleUrl}
      target="_blank"
      rel="noopener"
      className={`grid grid-cols-2 rounded-card border border-gold/35 bg-surface transition-colors hover:border-gold ${className ?? ''}`}
    >
      <span className="flex flex-col items-center justify-center gap-2 px-4 py-7 text-center">
        <span dir="ltr" className="font-display text-5xl leading-none font-bold text-fg">
          {rating}
        </span>
        <Stars rating={5} className="mt-1" />
        <span className="text-base text-soft">{dict.trust.onGoogle}</span>
      </span>
      <span className="flex flex-col items-center justify-center gap-2 border-s border-line px-4 py-7 text-center">
        <span dir="ltr" className="font-display text-5xl leading-none font-bold text-fg">
          {reviewsCount}
        </span>
        <span className="mt-1 text-base text-soft">{dict.trust.reviews}</span>
      </span>
    </a>
  );
}
