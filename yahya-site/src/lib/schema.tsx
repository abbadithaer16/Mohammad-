import { absoluteUrl, internationalDigits, openingHoursSpecification, site, siteUrl, t } from './site';

/** One location: a single AutoRepair entry. */
export function siteSchema() {
  const url = absoluteUrl('/');
  const { location } = site;
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${siteUrl()}/#center`,
    name: t(site.name),
    alternateName: site.latinName,
    description: t(site.seo.description),
    url,
    logo: absoluteUrl(site.images.logo.src),
    image: [absoluteUrl(site.images.og), absoluteUrl(site.images.hero.src)],
    telephone: `+${internationalDigits(site.booking.phone)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: t(location.area),
      addressLocality: t(location.city),
      addressCountry: 'JO',
    },
    hasMap: location.directionsUrl,
    openingHoursSpecification: openingHoursSpecification(),
    areaServed: t(location.city),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
