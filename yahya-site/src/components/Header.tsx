import { dict, site, t } from '@/lib/site';
import { MobileMenu } from './MobileMenu';
import { Logo } from './ui';

export function Header() {
  const items = [
    { href: '#about', label: dict.nav.about },
    { href: '#services', label: dict.nav.services },
    { href: '#models', label: dict.nav.models },
    { href: '#reviews', label: dict.nav.reviews },
    { href: '#location', label: dict.nav.location },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-md">
      <div className="container-page relative flex h-16 items-center gap-3 md:h-[4.5rem]">
        <a href="#top" className="flex min-w-0 items-center gap-2.5 rounded-full">
          <Logo className="w-11 md:w-13" sizes="52px" decorative />
          <span className="font-display text-[0.95rem] leading-snug font-bold text-fg max-[369px]:max-w-[9rem] md:text-lg">
            {t(site.name)}
          </span>
        </a>

        <nav aria-label={dict.mainNav} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="rounded-full px-3.5 py-2 font-semibold text-soft transition-colors hover:text-gold">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-3">
          <a href="#contact" className="btn btn-gold min-h-11 px-4 text-[0.95rem] max-[369px]:px-3">
            <span className="min-[400px]:hidden">{dict.bookShort}</span>
            <span className="max-[399px]:hidden">{dict.book}</span>
          </a>
          <MobileMenu items={items} openLabel={dict.menu} closeLabel={dict.closeMenu} navLabel={dict.mainNav} />
        </div>
      </div>
    </header>
  );
}
