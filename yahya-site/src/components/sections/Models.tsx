import { dict, site, t } from '@/lib/site';
import { Section, SectionHeading } from '../ui';

/** Model names as plain text chips (no manufacturer logos). */
export function Models() {
  return (
    <Section id="models" labelledBy="models-title">
      <SectionHeading id="models-title" eyebrow={dict.models.eyebrow}>
        {t(site.models.title)}
      </SectionHeading>
      <ul className="mt-8 flex flex-wrap gap-2.5 md:mt-10 md:gap-3">
        {site.models.items.map((model) => (
          <li
            key={model}
            lang="en"
            dir="ltr"
            className="rounded-full border border-gold/45 px-4 py-2.5 font-sign text-[0.78rem] leading-tight text-fg md:px-5 md:py-3 md:text-[0.9rem]"
          >
            {model}
          </li>
        ))}
      </ul>
    </Section>
  );
}
