import type { CSSProperties } from 'react';
import { cn } from '@/lib/phone';
import { dict, site } from '@/lib/site';
import { DeferredPhoto } from '../Photo';
import { Section, SectionHeading } from '../ui';

/*
 * Laid out for the five photos in site.config.ts (wide, wide, tall, tall, wall) so each keeps
 * close to its own shape:
 *   phones/tablets: wide · wide · [tall | tall] · wall
 *   desktop:        [wide ][tall]      (tall spans two rows)
 *                   [wide ][    ]
 *                   [tall][ wall ]
 * Any other number of photos falls back to a plain grid.
 */
const bento = [
  'col-span-2 lg:col-start-1 lg:row-start-1',
  'col-span-2 lg:col-start-1 lg:row-start-2',
  'lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:aspect-auto',
  'lg:col-start-1 lg:row-start-3 lg:aspect-auto',
  'col-span-2 lg:col-start-2 lg:row-start-3',
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
      <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:gap-4 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <li
            key={photo.src}
            className={cn(
              'relative overflow-hidden rounded-card border border-line bg-surface',
              useBento ? cn('aspect-(--ratio)', bento[i]) : 'aspect-[4/3]',
            )}
            style={{ '--ratio': `${photo.width} / ${photo.height}` } as CSSProperties}
          >
            <DeferredPhoto
              photo={photo}
              sizes={
                photo.width > photo.height
                  ? '(min-width: 1152px) 728px, (min-width: 1024px) 66vw, 100vw'
                  : '(min-width: 1152px) 360px, (min-width: 1024px) 33vw, 50vw'
              }
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
