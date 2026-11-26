import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/phone';
import { dict, site, t } from '@/lib/site';
import type { SignWord as SignWordType } from '@/lib/types';
import { CallButton, Logo, WhatsAppButton } from '../ui';

/**
 * Taken from the shop sign: "Electric" on the left, "Hybrid" on the right, split by a thin
 * gold line, with the round logo in the middle on a patch of black marble. This split is used
 * only here. Below it: headline, actions, Google rating and the storefront photo.
 */
export function Hero() {
  const [left, right] = site.hero.sign;
  const photo = site.images.hero;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-7 pb-14 md:pt-12 md:pb-20">
      <div className="container-page">
        {/* Physical left/right like the sign, whatever the page direction */}
        <div dir="ltr" className="relative grid grid-cols-2 items-center gap-x-8 gap-y-3 md:grid-cols-[1fr_auto_1fr] md:gap-x-14">
          <div aria-hidden className="sign-line absolute -top-7 -bottom-5 left-1/2 -z-10 w-px -translate-x-1/2 md:-top-12 md:-bottom-9" />
          <div className="relative col-span-2 mx-auto md:order-2 md:col-span-1">
            <div aria-hidden className="sign-marble absolute top-1/2 left-1/2 -z-20 size-[175%] -translate-1/2 md:size-[200%]" />
            <Logo eager decorative sizes="(min-width: 768px) 232px, 128px" className="w-32 md:w-58" />
          </div>
          <SignWord item={left} side="left" className="md:order-1" />
          <SignWord item={right} side="right" className="md:order-3" />
        </div>

        <div className="hero-in mx-auto mt-7 text-center md:mt-11">
          <h1 id="hero-title" className="text-[2.15rem] leading-[1.35] font-bold min-[400px]:text-[2.4rem] md:text-[3.6rem]">
            {t(site.hero.headline)}
          </h1>
          <p className="mx-auto mt-3 max-w-[42ch] text-base leading-[1.75] text-soft md:mt-4 md:text-xl">{t(site.hero.subline)}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 md:mt-8 md:gap-3">
            <WhatsAppButton className="min-h-12 px-4 text-base md:min-h-13 md:px-6 md:text-[1.05rem]" />
            <CallButton className="min-h-12 px-4 text-base md:min-h-13 md:px-6 md:text-[1.05rem]" />
          </div>
          <TrustLine className="mt-4 md:mt-5" />
        </div>

        <figure className="mt-8 overflow-hidden rounded-card border border-gold/35 md:mt-12">
          <Image
            src={photo.src}
            alt={t(photo.alt)}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1152px) 1088px, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
            loading="eager"
            fetchPriority="high"
            className="block h-auto w-full saturate-[.85]"
          />
        </figure>
      </div>
    </section>
  );
}

function SignWord({ item, side, className }: { item: SignWordType; side: 'left' | 'right'; className?: string }) {
  return (
    <p className={cn('flex flex-col', side === 'left' ? 'items-end text-right' : 'items-start text-left', className)}>
      <span lang="en" className="text-gold-sheen font-sign text-[1.15rem] leading-[1.3] min-[400px]:text-[1.3rem] md:text-[2.4rem] lg:text-[3rem]">
        {item.word}
      </span>
      <span lang="ar" dir="rtl" className="mt-1 font-display text-base font-semibold text-soft md:mt-2 md:text-xl">
        {t(item.caption)}
      </span>
    </p>
  );
}

/** "★ 4.8 على Google | +95 تقييم", linking to the reviews on Google. */
function TrustLine({ className }: { className?: string }) {
  const { rating, reviewsCount } = site.trust;
  return (
    <a
      href={site.reviews.googleUrl}
      target="_blank"
      rel="noopener"
      className={cn(
        'inline-flex min-h-11 items-center gap-3 rounded-full px-2 text-base text-soft underline-offset-4 hover:text-fg hover:underline',
        className,
      )}
    >
      <Star aria-hidden className="size-5 fill-gold text-gold" strokeWidth={1.5} />
      <span>
        <b dir="ltr" className="font-bold text-fg">
          {rating}
        </b>{' '}
        {dict.trust.onGoogle}
      </span>
      <span aria-hidden className="h-4 w-px bg-gold/50" />
      <span>
        <b dir="ltr" className="inline-block font-bold text-fg">
          {reviewsCount}
        </b>{' '}
        {dict.trust.reviews}
      </span>
    </a>
  );
}
