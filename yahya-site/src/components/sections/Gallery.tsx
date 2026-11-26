import type { CSSProperties } from 'react';
import { cn } from '@/lib/phone';
import { dict, site } from '@/lib/site';
import { DeferredPhoto } from '../Photo';
import { Section, SectionHeading } from '../ui';

/*
 * Laid out for the five photos in site.config.ts, in this order:
 * storefront (wide), wall (portrait), engine (tall), Kia (tall), storefront (wide).
 *
 *   phones:           [   wide   ]        tablets/desktop:  [      wide      ]
 *                     [   wall   ]  4:5                    [wall|engine| kia]  all 4:5
 *                     [engine|kia]                         [      wide      ]
 *                     [   wide   ]
 *
 * Each photo's crop inside its tile follows `focus` (object-position) in the config.
 * Any other number of photos falls back to a plain grid.
 */
const WIDE = { tile: 'col-span-2 md:col-span-3 aspect-(--ratio)', sizes: '(min-width: 1152px) 1088px, 100vw' };
const PORTRAIT = {
  tile: 'aspect-(--ratio) md:aspect-[4/5]',
  sizes: '(min-width: 1152px) 352px, (min-width: 768px) 33vw, 50vw',
};
const bento = [
  WIDE,
  { tile: 'col-span-2 md:col-span-1 aspect-[4/5]', sizes: '(min-width: 1152px) 352px, (min-width: 768px) 33vw, 100vw' },
  PORTRAIT,
  PORTRAIT,
  WIDE,
];

export function Gallery() {
  const photos = site.images.gallery;
  if (!photos.length) return null;
  const useBento = photos.length === bento.length;
  return (
    <Section labelledBy="gallery-title">
      <SectionHeading id="gallery-title" eyebrow={dict.gallery.eyebrow}>
        {dict.gallery.title}
      </SectionHeading>
      <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
        {photos.map((photo, i) => (
          <li
            key={photo.src}
            className={cn(
              'relative overflow-hidden rounded-card border border-line bg-surface',
              useBento ? bento[i].tile : 'aspect-[4/3]',
            )}
            style={{ '--ratio': `${photo.width} / ${photo.height}` } as CSSProperties}
          >
            <DeferredPhoto
              photo={photo}
              sizes={useBento ? bento[i].sizes : '(min-width: 1152px) 352px, (min-width: 768px) 33vw, 50vw'}
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
