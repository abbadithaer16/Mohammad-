/**
 * Types for site.config.ts.
 *
 * Every visible text is a `Text` object: { ar: '...' }. The site is Arabic-only for now;
 * adding English later means adding `en: '...'` next to each `ar` and an English route.
 */
export type Lang = 'ar' | 'en';
export type Text = { ar: string; en?: string };

export type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
/** ['09:00', '19:00'] in 24h time, or null when closed. */
export type DayHours = [open: string, close: string] | null;

export type Photo = {
  /** Path inside /public, e.g. '/images/yahya/engine.jpg'. */
  src: string;
  alt: Text;
  /** Size of the original file in pixels (used to reserve space while it loads). */
  width: number;
  height: number;
  /** Which part stays visible when the photo is cropped, CSS object-position, e.g. '50% 35%'. */
  focus?: string;
};

export type ServiceIcon = 'electric' | 'hybrid' | 'battery' | 'computer' | 'parts' | 'wrench';

export type Service = {
  icon: ServiceIcon;
  title: Text;
  /** Optional one-line description under the title. */
  description?: Text;
};

export type Review = {
  author: string;
  /** Copied exactly from Google. Line breaks (\n) are kept on the card. */
  text: string;
  /** Star rating given on Google (1–5). */
  rating: 1 | 2 | 3 | 4 | 5;
};

/** One word of the shop sign in the hero ("Electric" | "Hybrid") with its Arabic caption. */
export type SignWord = { word: string; caption: Text };

export type SiteConfig = {
  /** Public URL without trailing slash. Empty = detected on Netlify / Vercel. */
  siteUrl: string;
  lang: Lang;
  name: Text;
  /** Latin name as written on the sign. */
  latinName: string;
  colors: {
    /** Page background (plain charcoal) */
    background: string;
    /** Cards and lifted panels */
    surface: string;
    /** Borders and dividers */
    border: string;
    /** Headings and strong text */
    text: string;
    /** Body text */
    textSoft: string;
    /** Secondary text */
    textMuted: string;
    /** Buttons, links, icons, the gold line */
    accent: string;
    /** Text on gold buttons */
    accentText: string;
  };
  images: {
    /** Round logo on a transparent background. */
    logo: Photo;
    /** Storefront photo shown in the hero. */
    hero: Photo;
    gallery: Photo[];
    /** Social preview image, 1200×630 JPG (shown when the link is shared on WhatsApp etc.). */
    og: string;
    /** Square PNG icons for browser tabs and phone home screens. */
    icon: string;
    appleIcon: string;
  };
  seo: { title: Text; description: Text };
  hero: {
    headline: Text;
    subline: Text;
    /** The two words of the shop sign, shown left and right of the logo (physical order). */
    sign: [left: SignWord, right: SignWord];
  };
  about: {
    text: Text;
    /** Lead engineer, e.g. 'م. يحيى العبسي'. */
    engineer: Text;
  };
  /** Shown as "4.8 على Google / +95 تقييم". Update by hand when the numbers change. */
  trust: { rating: string; reviewsCount: string };
  booking: {
    /** WhatsApp number that receives bookings, international digits: '962796176195'. */
    whatsapp: string;
    /** Number for the "Call" buttons, local format as printed on the sign. */
    phone: string;
    /** Options of the "الخدمة" list in the booking form. Default: the services + "أخرى". */
    options?: Text[];
  };
  services: Service[];
  /** true while the services list still has to be confirmed with the client (build prints a reminder). */
  servicesToConfirm: boolean;
  models: {
    /** e.g. 'متخصصون بسيارات هيونداي وكيا – كهرباء وهايبرد' */
    title: Text;
    /** Model names as text chips (no manufacturer logos). */
    items: string[];
  };
  reviews: {
    googleUrl: string;
    items: Review[];
  };
  location: {
    /** Shown on the page, e.g. 'البيادر – عمّان'. */
    address: Text;
    /** For search engines (JSON-LD). */
    area: Text;
    city: Text;
    /** Google Maps link used by every "الاتجاهات" button. */
    directionsUrl: string;
    /** `src` of the Google Maps iframe. */
    mapEmbedUrl: string;
  };
  hours: Record<Weekday, DayHours>;
  weekStartsOn: Weekday;
  /** Small print in the footer. */
  disclaimer: Text;
};
