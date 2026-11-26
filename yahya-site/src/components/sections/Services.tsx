import { BatteryCharging, CarFront, Cog, MessageCircle, MonitorCog, PlugZap, Wrench, type LucideIcon } from 'lucide-react';
import { bookingWhatsApp, dict, site, t } from '@/lib/site';
import type { ServiceIcon } from '@/lib/types';
import { Section, SectionHeading } from '../ui';

const icons: Record<ServiceIcon, LucideIcon> = {
  electric: PlugZap,
  hybrid: CarFront,
  battery: BatteryCharging,
  computer: MonitorCog,
  parts: Cog,
  wrench: Wrench,
};

export function Services() {
  return (
    <Section id="services" labelledBy="services-title">
      <SectionHeading id="services-title" eyebrow={dict.services.eyebrow}>
        {dict.services.title}
      </SectionHeading>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-5 lg:gap-4">
        {site.services.map((service, i) => {
          const Icon = icons[service.icon];
          const title = t(service.title);
          return (
            <li
              key={title}
              className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 lg:flex-col lg:items-start lg:gap-0 lg:p-6"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
                <Icon aria-hidden className="size-6" strokeWidth={1.5} />
              </span>
              <div className="min-w-0 lg:mt-5 lg:flex lg:flex-1 lg:flex-col">
                <span aria-hidden dir="ltr" className="hidden font-sign text-xs text-muted lg:block">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg leading-snug font-semibold lg:mt-1 lg:flex-1 lg:text-xl">{title}</h3>
                {service.description ? <p className="mt-1 text-base text-muted">{t(service.description)}</p> : null}
                <a
                  href={bookingWhatsApp(dict.serviceMessage(title))}
                  target="_blank"
                  rel="noopener"
                  className="mt-1 inline-flex min-h-10 items-center gap-1.5 text-[0.95rem] font-semibold text-gold underline-offset-4 hover:underline lg:mt-3"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  {dict.services.ask}
                  <span className="sr-only">: {title}</span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
