import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { bookingWhatsApp, dict, site, t, telHref } from '@/lib/site';
import { HoursList } from './sections/Hours';
import { Logo, PhoneText } from './ui';

export function Footer() {
  const year = new Date().getFullYear();
  const link = 'inline-flex min-h-11 items-center gap-2 font-semibold text-fg underline-offset-4 hover:text-gold hover:underline';
  return (
    <footer className="border-t border-line pb-24 lg:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <Logo className="w-20 md:w-24" sizes="96px" decorative />
          <div>
            <p className="font-display text-xl leading-snug font-bold text-fg">{t(site.name)}</p>
            <p lang="en" dir="ltr" className="mt-1 text-end font-sign text-[0.7rem] whitespace-nowrap text-muted">
              {site.latinName}
            </p>
            <p className="mt-2 text-base">{t(site.location.address)}</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold">{dict.footer.hours}</h2>
          <HoursList className="mt-3 text-base" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{dict.footer.contact}</h2>
          <ul className="mt-2 grid">
            <li>
              <a href={telHref(site.booking.phone)} className={link}>
                <Phone aria-hidden className="size-4 text-gold" />
                <PhoneText number={site.booking.phone} />
              </a>
            </li>
            <li>
              <a href={bookingWhatsApp()} target="_blank" rel="noopener" className={link}>
                <MessageCircle aria-hidden className="size-4 text-gold" />
                {dict.whatsapp}
              </a>
            </li>
            <li>
              <a href={site.location.directionsUrl} target="_blank" rel="noopener" className={link}>
                <Navigation aria-hidden className="size-4 text-gold" />
                {dict.directions}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page grid gap-2 py-6 text-[0.95rem] text-muted">
          <p>{t(site.disclaimer)}</p>
          <p>
            © <span dir="ltr">{year}</span> {t(site.name)}
          </p>
        </div>
      </div>
    </footer>
  );
}
