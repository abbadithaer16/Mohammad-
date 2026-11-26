import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { absoluteUrl, dict, lang, site, siteUrl, t } from '@/lib/site';
import { messiri, michroma, tajawal } from './fonts';
import './globals.css';

const title = t(site.seo.title);
const description = t(site.seo.description);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { absolute: title },
  description,
  applicationName: t(site.name),
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    siteName: t(site.name),
    title,
    description,
    locale: lang === 'ar' ? 'ar_JO' : 'en_US',
    images: [{ url: site.images.og, width: 1200, height: 630, alt: t(site.name) }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [site.images.og] },
  icons: {
    icon: [{ url: site.images.icon, type: 'image/png', sizes: '192x192' }],
    apple: [{ url: site.images.appleIcon, sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: site.colors.background,
  colorScheme: 'dark',
};

const c = site.colors;
const colorVars = {
  '--c-background': c.background,
  '--c-surface': c.surface,
  '--c-border': c.border,
  '--c-text': c.text,
  '--c-text-soft': c.textSoft,
  '--c-text-muted': c.textMuted,
  '--c-accent': c.accent,
  '--c-accent-text': c.accentText,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={colorVars}
      className={`${messiri.variable} ${tajawal.variable} ${michroma.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-3 focus:font-semibold focus:text-on-gold"
        >
          {dict.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
