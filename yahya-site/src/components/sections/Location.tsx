import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { bookingWhatsApp, dict, site, t, telHref } from '@/lib/site';
import { CallButton, DirectionsButton, PhoneText, Section, SectionHeading } from '../ui';
import { HoursList } from './Hours';

/** The one location: address, hours, phone, the three actions and a Google Maps embed. */
export function Location() {
  const s = dict.location;
  return (
    <Section id="location" labelledBy="location-title">
      <SectionHeading id="location-title" eyebrow={s.eyebrow}>
        {s.title}
      </SectionHeading>

      <div className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-[1fr_1.4fr] lg:gap-5">
        <div className="flex flex-col gap-7 rounded-card border border-line bg-surface p-6 md:p-8">
          <Item icon={<MapPin className="size-5" strokeWidth={1.75} />} title={s.address}>
            <p className="font-display text-xl font-bold text-fg">{t(site.location.address)}</p>
          </Item>
          <Item icon={<Clock className="size-5" strokeWidth={1.75} />} title={s.hours}>
            <HoursList className="text-base" />
          </Item>
          <Item icon={<Phone className="size-5" strokeWidth={1.75} />} title={s.phone}>
            <a href={telHref(site.booking.phone)} className="font-display text-2xl font-bold text-fg hover:text-gold">
              <PhoneText number={site.booking.phone} />
            </a>
          </Item>
          <div className="mt-auto grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
            <CallButton className="min-h-12 gap-1.5 px-3 text-[0.95rem]">{dict.call}</CallButton>
            <a
              href={bookingWhatsApp()}
              target="_blank"
              rel="noopener"
              className="btn btn-gold min-h-12 gap-1.5 px-3 text-[0.95rem]"
            >
              <MessageCircle aria-hidden className="size-5 shrink-0" />
              {dict.whatsapp}
            </a>
            <DirectionsButton className="col-span-2 min-h-12 gap-1.5 px-3 text-[0.95rem] min-[420px]:col-span-1" />
          </div>
        </div>

        <div className="relative min-h-[20rem] overflow-hidden rounded-card border border-line bg-surface md:min-h-[26rem]">
          {/* Shown only if the map cannot load (the map covers it once it does). Keyboard and
              screen-reader users have the "الاتجاهات" button in the card, so this one is mouse-only. */}
          <a
            href={site.location.directionsUrl}
            target="_blank"
            rel="noopener"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center font-semibold text-gold underline-offset-4 hover:underline"
          >
            <MapPin aria-hidden className="size-8" strokeWidth={1.5} />
            {s.openMap}
          </a>
          <iframe
            src={site.location.mapEmbedUrl}
            title={s.map(t(site.name))}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      </div>
    </Section>
  );
}

function Item({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-semibold text-muted">
        <span aria-hidden className="text-gold">
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
