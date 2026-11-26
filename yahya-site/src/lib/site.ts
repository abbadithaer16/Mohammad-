import { existsSync } from 'node:fs';
import path from 'node:path';
import config from '@site';
import { getDictionary } from './dictionary';
import { waHref } from './phone';
import type { Lang, SiteConfig, Text, Weekday } from './types';

export const site: SiteConfig = config;
export const lang: Lang = site.lang;
export const dict = getDictionary(lang);

/** Text in the site's language (falls back to Arabic). */
export function t(text: Text): string {
  // Keep short titles on the same line as the name: "م. يحيى", "د. أحمد", "Eng. Sam"
  return (text[lang] ?? text.ar).replace(/(^|\s)(م|د|أ|Eng|Dr)\.\s/g, '$1$2. ');
}

/* ── Phone numbers & links ─────────────────────────────────────────────── */

export { internationalDigits, telHref, waHref } from './phone';

export function bookingWhatsApp(message: string = dict.generalMessage): string {
  return waHref(site.booking.whatsapp, message);
}

/** Options of the booking form list: config `booking.options`, or the services + "أخرى". */
export function bookingOptions(): string[] {
  if (site.booking.options?.length) return site.booking.options.map(t);
  return [...site.services.map((s) => t(s.title)), dict.booking.other];
}

/* ── URLs ─────────────────────────────────────────────────────────────────── */

/**
 * Public address of the site, used in search results, sitemap and WhatsApp/Facebook previews.
 * Order: site.config.ts `siteUrl` → NEXT_PUBLIC_SITE_URL → Netlify (URL) → Vercel → localhost.
 */
export function siteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL || // set by Netlify on every build: the site's main address
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    '';
  return (site.siteUrl || fromEnv || 'http://localhost:3000').replace(/\/$/, '');
}

if (process.env.NODE_ENV === 'production' && siteUrl().startsWith('http://localhost')) {
  console.warn(
    '\n⚠ siteUrl is not set: links in Google and WhatsApp previews will point to localhost.\n' +
      "  Set siteUrl in site.config.ts (e.g. 'https://yahya-ev.netlify.app'), or build on Netlify/Vercel.\n",
  );
}

export function absoluteUrl(p: string): string {
  return `${siteUrl()}${p}`;
}

/* ── Opening hours ────────────────────────────────────────────────────────── */

const week: Weekday[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

function orderedWeek(): Weekday[] {
  const i = week.indexOf(site.weekStartsOn);
  return [...week.slice(i), ...week.slice(0, i)];
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, 0, 1, h, m)));
}

export type HoursRow = { days: string; hours: string; closed: boolean };

/** Groups consecutive days with the same hours: "السبت – الخميس · 9:00 ص – 7:00 م". */
export function hoursRows(): HoursRow[] {
  const rows: { from: Weekday; to: Weekday; key: string }[] = [];
  for (const day of orderedWeek()) {
    const h = site.hours[day];
    const key = h ? h.join('-') : 'closed';
    const last = rows.at(-1);
    if (last && last.key === key) last.to = day;
    else rows.push({ from: day, to: day, key });
  }
  return rows.map(({ from, to, key }) => {
    const h = site.hours[from];
    return {
      days: from === to ? dict.weekdays[from] : `${dict.weekdays[from]} – ${dict.weekdays[to]}`,
      hours: h ? `${formatTime(h[0])} – ${formatTime(h[1])}` : dict.location.closed,
      closed: key === 'closed',
    };
  });
}

const schemaDay: Record<Weekday, string> = {
  sat: 'Saturday',
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
};

export function openingHoursSpecification() {
  return orderedWeek()
    .filter((d) => site.hours[d])
    .map((d) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: schemaDay[d],
      opens: site.hours[d]![0],
      closes: site.hours[d]![1],
    }));
}

/* ── Config checks (stop the build with a clear message) ─────────────────── */

function validate(c: SiteConfig) {
  const problems: string[] = [];
  const phone = /^0\d{8,9}$|^\+?962\d{8,9}$/;
  if (!phone.test(c.booking.phone)) problems.push(`booking.phone "${c.booking.phone}" should look like 0796176195.`);
  if (!/^962\d{8,9}$/.test(c.booking.whatsapp)) {
    problems.push(`booking.whatsapp "${c.booking.whatsapp}" should be digits only, like 962796176195.`);
  }
  for (const [key, value] of Object.entries(c.colors)) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) problems.push(`colors.${key} must be a 6-digit hex colour like #c8a04a.`);
  }
  for (const [key, url] of Object.entries({
    'reviews.googleUrl': c.reviews.googleUrl,
    'location.directionsUrl': c.location.directionsUrl,
    'location.mapEmbedUrl': c.location.mapEmbedUrl,
  })) {
    if (!/^https:\/\//.test(url)) problems.push(`${key} must start with https://`);
  }
  const photos = [c.images.logo, c.images.hero, ...c.images.gallery];
  if (c.images.engineer) photos.push(c.images.engineer);
  const files = photos.map((p) => p.src);
  files.push(c.images.og, c.images.icon, c.images.appleIcon);
  for (const f of files) {
    if (!existsSync(path.join(process.cwd(), 'public', f))) problems.push(`Image not found: public${f}`);
  }
  if (problems.length) {
    throw new Error(`\n\nsite.config.ts has ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}\n`);
  }
}

validate(site);

