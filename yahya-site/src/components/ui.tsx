import Image from 'next/image';
import { MessageCircle, Navigation, Phone, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/phone';
import { bookingWhatsApp, dict, site, t, telHref } from '@/lib/site';

/** A page section. All sections share the plain charcoal background, split by a hairline. */
export function Section({
  id,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('border-t border-line py-16 md:py-24', className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/** Gold eyebrow + section title. */
export function SectionHeading({
  id,
  eyebrow,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-[1.85rem] font-bold md:text-[2.6rem]">
        {children}
      </h2>
    </div>
  );
}

/** The round logo (transparent PNG). */
export function Logo({
  className,
  sizes = '72px',
  eager = false,
  decorative = false,
}: {
  className?: string;
  sizes?: string;
  eager?: boolean;
  /** Empty alt when the name is already written next to it. */
  decorative?: boolean;
}) {
  const logo = site.images.logo;
  return (
    <span className={cn('relative block aspect-square shrink-0', className)}>
      <Image
        src={logo.src}
        alt={decorative ? '' : t(logo.alt)}
        fill
        sizes={sizes}
        loading={eager ? 'eager' : 'lazy'}
        className="object-contain"
      />
    </span>
  );
}

export function WhatsAppButton({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={bookingWhatsApp(message)} target="_blank" rel="noopener" className={cn('btn btn-gold', className)}>
      <MessageCircle aria-hidden className="size-5 shrink-0" />
      {children ?? dict.bookWhatsApp}
    </a>
  );
}

export function CallButton({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a href={telHref(site.booking.phone)} className={cn('btn btn-line', className)}>
      <Phone aria-hidden className="size-5 shrink-0" />
      {children ?? dict.callNow}
    </a>
  );
}

export function DirectionsButton({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a href={site.location.directionsUrl} target="_blank" rel="noopener" className={cn('btn btn-line', className)}>
      <Navigation aria-hidden className="size-5 shrink-0" />
      {children ?? dict.directions}
    </a>
  );
}

/** Phone numbers always read left-to-right, even inside Arabic text. */
export function PhoneText({ number, className }: { number: string; className?: string }) {
  return (
    <span dir="ltr" className={cn('inline-block', className)}>
      {number}
    </span>
  );
}

/** Gold stars with a spoken label ("5 من 5 نجوم"). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={dict.reviews.stars(rating)} className={cn('inline-flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          strokeWidth={1.5}
          className={i <= rating ? 'size-4 fill-gold text-gold' : 'size-4 text-line'}
        />
      ))}
    </span>
  );
}
