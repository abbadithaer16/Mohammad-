/**
 * ============================================================================
 *  SITE CONFIG — all business content lives here.
 *  Edit this file (and the photos in /public/images/yahya) to update the site.
 *  Every text is { ar: '...' } so English can be added later as { ar: '...', en: '...' }.
 * ============================================================================
 */
import type { SiteConfig } from './src/lib/types';

const PLACE_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJb9ujvRChHBURpMa07yh6lCU';

const site: SiteConfig = {
  siteUrl: 'https://yahya-ev.netlify.app', // change when the center gets its own domain
  lang: 'ar',
  name: { ar: 'مركز المهندس يحيى العبسي' },
  latinName: 'ENG. YAHYA AL-ABSI CENTER',

  /* ── Colours ─────────────────────────────────────────────────────────── */
  colors: {
    background: '#0e0e0e', // plain charcoal
    surface: '#161616',
    border: '#2b2b2b',
    text: '#ffffff',
    textSoft: '#d6d6d6',
    textMuted: '#a6a6a6',
    accent: '#c8a04a', // gold
    accentText: '#0e0e0e',
  },

  /* ── Photos (files in /public/images/yahya) ──────────────────────────── */
  // Number plates are already blurred in these files. Replace a photo by keeping its file name.
  images: {
    logo: {
      src: '/images/yahya/logo.png',
      alt: { ar: 'شعار مركز المهندس يحيى العبسي' },
      width: 960,
      height: 960,
    },
    hero: {
      src: '/images/yahya/hero.jpg',
      alt: { ar: 'واجهة مركز المهندس يحيى العبسي بلوحة Electric و Hybrid وسيارات أمام الورشة' },
      width: 1120,
      height: 476,
      focus: '50% 50%',
    },
    // Cropped from the center's promo poster. The sign text behind him is softened (it
    // misspells the name and the area). A real photo can replace it.
    engineer: {
      src: '/images/yahya/engineer.jpg',
      alt: { ar: 'المهندس يحيى العبسي بزي العمل' },
      width: 420,
      height: 580,
      focus: '50% 30%',
    },
    // Order matters: it matches the layout in src/components/sections/Gallery.tsx
    // (wide · [wall | engine | kia] · wide).
    gallery: [
      // storefront-2 / -3: photo part of the client's banners (headline, bottom text and the
      // Hyundai|Kia badge are cropped off).
      {
        src: '/images/yahya/storefront-2.jpg',
        alt: { ar: 'واجهة المركز وسيارات الزبائن أمام مداخل الورشة' },
        width: 1662,
        height: 550,
      },
      {
        // Tall crop below the Hyundai Mobis board, shown in a portrait tile.
        src: '/images/yahya/brands-wall.jpg',
        alt: { ar: 'جدار الورشة بلوحات هيونداي وكيا وصور من العمل' },
        width: 870,
        height: 1128,
        focus: 'center 35%',
      },
      {
        src: '/images/yahya/engine.jpg',
        alt: { ar: 'لقطة قريبة لمحرك أثناء إعادة بنائه في الورشة' },
        width: 941,
        height: 1672,
        focus: '50% 40%',
      },
      {
        src: '/images/yahya/kia-service.jpg',
        alt: { ar: 'سيارة كيا مفتوحة الغطاء أثناء الصيانة داخل الورشة' },
        width: 937,
        height: 1679,
        focus: '50% 62%', // keeps the KIA badge in the 4:5 tile
      },
      {
        src: '/images/yahya/storefront-3.jpg',
        alt: { ar: 'واجهة المركز من الشارع وسيارات أمام الورشة' },
        width: 1661,
        height: 568,
      },
    ],
    og: '/images/yahya/og.jpg',
    icon: '/images/yahya/icon.png',
    appleIcon: '/images/yahya/apple-touch-icon.png',
  },

  /* ── Search engines & sharing ────────────────────────────────────────── */
  seo: {
    title: { ar: 'مركز المهندس يحيى العبسي | صيانة السيارات الكهربائية والهايبرد – البيادر، عمّان' },
    description: {
      ar: 'خبراء في صيانة السيارات الكهربائية والهجينة (هايبرد)، متخصصون بسيارات هيونداي وكيا. قطع غيار أصلية وتقنية متطورة في البيادر – عمّان. 0796176195',
    },
  },

  /* ── Hero ────────────────────────────────────────────────────────────── */
  hero: {
    headline: { ar: 'خيارك الذكي لمستقبل سيارتك' },
    subline: {
      ar: 'خبراء في صيانة السيارات الكهربائية والهجينة (هايبرد)، قطع غيار أصلية وتقنية متطورة، بلمسة المهندس يحيى.',
    },
    // Left and right of the logo, as on the shop sign.
    sign: [
      { word: 'Electric', caption: { ar: 'كهرباء' } },
      { word: 'Hybrid', caption: { ar: 'هايبرد' } },
    ],
  },

  /* ── About ───────────────────────────────────────────────────────────── */
  about: {
    text: { ar: 'مركز مختص في صيانة سيارات الهايبرد والكهرباء بإدارة المهندس يحيى العبسي' },
    engineer: { ar: 'م. يحيى العبسي' },
  },

  /* ── Google rating ("4.8 على Google / +95 تقييم") ────────────────────── */
  trust: { rating: '4.8', reviewsCount: '+95' },

  /* ── Booking & contact ───────────────────────────────────────────────── */
  booking: {
    whatsapp: '962796176195',
    phone: '0796176195',
    // options: [...]  // list in the booking form; default = the services below + "أخرى"
  },

  /* ── Services ────────────────────────────────────────────────────────── */
  // ⚠ TO CONFIRM WITH CLIENT: this list has not been confirmed by the center yet.
  //   Once confirmed, set servicesToConfirm to false (the build stops printing a reminder).
  // icon: electric | hybrid | battery | computer | parts | wrench
  servicesToConfirm: true,
  services: [
    { icon: 'electric', title: { ar: 'صيانة السيارات الكهربائية' } },
    { icon: 'hybrid', title: { ar: 'صيانة الهايبرد' } },
    { icon: 'battery', title: { ar: 'فحص البطارية' } },
    { icon: 'computer', title: { ar: 'فحص كمبيوتر' } },
    { icon: 'parts', title: { ar: 'قطع غيار أصلية' } },
  ],

  /* ── Models (text only, no manufacturer logos) ──────────────────────── */
  models: {
    title: { ar: 'متخصصون بسيارات هيونداي وكيا – كهرباء وهايبرد' },
    items: ['Hyundai Kona Electric', 'Hyundai Ioniq', 'Hyundai Sonata Hybrid', 'Kia Niro', 'Kia K5 Hybrid'],
  },

  /* ── Reviews ─────────────────────────────────────────────────────────── */
  // Real Google reviews, copied word for word (line breaks kept with \n).
  reviews: {
    googleUrl: PLACE_URL,
    items: [
      {
        author: 'خلف موسى',
        rating: 5,
        text: [
          'مركز فخم وتعامل راقي ما شاء الله',
          'وفن وإتقان بالعمل الله يباركلهم بمالهم وعيالهم',
          'وكل الشكر لا المهندس يحيى على أخلاقه العالية',
        ].join('\n'),
      },
      {
        author: 'Waleed Alyaseen',
        rating: 5,
        text: ['مركز رائع وشباب ذو خبرة عالية', 'اشكركم على التعامل وحسن الاستقبال'].join('\n'),
      },
      {
        author: 'Hamzah Kokash',
        rating: 5,
        text: ['مركز رائع والمهندس يحيى ما شاء الله عنه', 'قمة اخلاق واحترام'].join('\n'),
      },
    ],
  },

  /* ── Location ────────────────────────────────────────────────────────── */
  location: {
    address: { ar: 'البيادر – عمّان' },
    area: { ar: 'البيادر' },
    city: { ar: 'عمّان' },
    directionsUrl: PLACE_URL,
    // Map in the "الموقع وساعات الدوام" section. For an exact pin: Google Maps → the center →
    // Share → Embed a map → copy only the link inside src="..." and paste it here.
    mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent('مركز المهندس يحيى العبسي، البيادر، عمّان')}&hl=ar&z=16&output=embed`,
  },

  /* ── Opening hours ───────────────────────────────────────────────────── */
  hours: {
    sat: ['09:00', '19:00'],
    sun: ['09:00', '19:00'],
    mon: ['09:00', '19:00'],
    tue: ['09:00', '19:00'],
    wed: ['09:00', '19:00'],
    thu: ['09:00', '19:00'],
    fri: null,
  },
  weekStartsOn: 'sat',

  /* ── Footer small print ──────────────────────────────────────────────── */
  disclaimer: {
    ar: 'مركز صيانة مستقل. أسماء هيونداي وكيا وموديلاتها مذكورة للتعريف بالسيارات التي نخدمها فقط، ولا تعني أننا وكيل أو شريك رسمي لأي منهما.',
  },
};

export default site;
