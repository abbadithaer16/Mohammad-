import { El_Messiri, Michroma, Tajawal } from 'next/font/google';

/** Headings and all bold / semibold text (buttons, labels, names). */
export const messiri = El_Messiri({
  subsets: ['arabic', 'latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

/** Body text, regular weight only (bold text uses El Messiri). */
export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['500'],
  variable: '--font-body',
  display: 'swap',
});

/** Only for the two sign words in the hero ("Electric", "Hybrid") and the model chips. */
export const michroma = Michroma({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-michroma',
  display: 'swap',
});
