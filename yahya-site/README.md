# مركز المهندس يحيى العبسي – ENG. YAHYA AL-ABSI CENTER

One-page Arabic (RTL) website for an independent Hyundai & Kia electric and hybrid specialist in
Al-Bayader, Amman. Next.js + TypeScript + Tailwind, exported as static files. No backend:
bookings open WhatsApp with a ready message.

Built from the JHM site template (`jhm-site`), with its own design: a split "Electric | Hybrid"
hero taken from the shop sign, black marble behind the logo, plain charcoal page, one location.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # optimises photos, then writes the static site to ./out
```

Requires Node.js 20.9 or newer.

---

## Edit the content: `site.config.ts`

Everything the site says lives in [`site.config.ts`](site.config.ts): name, headline, about text,
Google rating, services, models, reviews, location, hours, phone/WhatsApp, colours and photo
paths. Edit it, save, and the page updates.

- **Services are not confirmed yet.** They are marked `servicesToConfirm: true`, and every build
  prints a reminder. Once the client confirms the list, edit it and set it to `false`.
- **Phone:** written as printed on the sign (`'0796176195'`). Call and WhatsApp links are built
  from it. `booking.whatsapp` (`'962796176195'`) receives the booking form.
- **Google rating:** `trust` (`'4.8'`, `'+95'`) is typed by hand. Update it when it changes.
- **Reviews:** real Google reviews copied word for word. Line breaks are kept.
- **Map:** `location.mapEmbedUrl` currently searches Google Maps for the center's name in
  Al-Bayader. For the exact pin: Google Maps → the center → **Share → Embed a map** → copy only the
  link inside `src="..."` and paste it there. "الاتجاهات" buttons use `location.directionsUrl`.
- **Hours:** 24-hour times per day; `null` means closed. Consecutive days with the same hours are
  grouped automatically ("السبت – الخميس").
- **Footer small print:** `disclaimer` states the center is independent (not a Hyundai/Kia dealer
  or partner).

Interface text (button labels, form errors, section titles) is in `src/lib/dictionary.ts`.
Every text in the config is `{ ar: '...' }` so English can be added later as
`{ ar: '...', en: '...' }`.

If something in the config is wrong (a malformed phone number, a missing photo), `npm run dev`
and `npm run build` stop with a message saying exactly what to fix.

## Photos

Photos live in `public/images/yahya/`. To swap one, **replace the file with the same name**
(update `width` / `height` in `site.config.ts` if the size changes).

| File | Used for | Notes |
|---|---|---|
| `logo.png` | Header, hero, footer, icons | Round, transparent background |
| `hero.jpg` | Hero (storefront with the Electric \| Hybrid sign) | Wide, about 1120×476 |
| `storefront-2.jpg`, `storefront-3.jpg` | Gallery | Wide |
| `engine.jpg`, `kia-service.jpg` | Gallery | Tall (phone photos) |
| `brands-wall.jpg` | Gallery, portrait 4:5 tile (`focus: 'center 35%'`) | Tall, about 870×1128; keep all four frames in the top two-thirds |
| `engineer.jpg` | "عن المركز" (portrait, name as caption) | Optional: delete `images.engineer` to hide it |

What was done to the supplied photos:

- `hero.jpg`: number plates blurred; the bottom 9 pixel rows trimmed (leftover caption text).
- `storefront-2.jpg`, `storefront-3.jpg`: the photo part of the client's improved banners. The
  headline, the bottom text and the Hyundai|Kia logo badge in the corner are cropped off, so the
  site does not look like an official dealer. A plate with number-like characters on a car inside
  the workshop (storefront-2) is blurred, and so is the neighbouring blue sign in storefront-3,
  which names another repair center.
- `brands-wall.jpg`: cropped below the "HYUNDAI MOBIS" board, so the site does not suggest a
  Mobis partnership, and trimmed to the width of the frames. It is cut tall (870×1128) for its
  portrait tile: the Hyundai and Kia frames and the two photos of the engineer fill the top, and
  `center 35%` positions it in the tile.
- `engineer.jpg`: cropped from the client's poster (head to belt). The sign text behind him is
  softened: it misspells the name ("العيسي") and the area ("البيدر"). The poster's title calls
  him "د." (Dr.); the site uses "م." as given, so the title is not part of the crop.
- `logo.png` was resized to 960px and compressed (same look, 0.4 MB instead of 1.6 MB).

New photos must have plates blurred before they go in. Every build creates small WebP versions
automatically (`public/images/_generated`, not committed).

After changing the logo or `hero.jpg`, run `npm run social-images` to rebuild `og.jpg` (the
WhatsApp/Facebook preview) and the browser and phone icons, then commit them.

The marble behind the hero logo (`public/textures/marble.webp`) is drawn by
`scripts/marble.mjs` (procedural, no third-party image). Re-run `npm run marble` only to change it.

## Deploy

### Netlify Drop (current)

1. `npm run build`
2. Drag the `out` folder (or a zip of its contents) onto **Netlify → Sites → Deploy manually**,
   or onto the site's **Deploys** page to update it.

`siteUrl` in `site.config.ts` is `https://yahya-ev.netlify.app`. Change it if the site gets
another address, then rebuild: it is used in Google results, the sitemap and link previews.

### Netlify from GitHub (updates by itself)

Netlify → **Link repository** → this repository → **Base directory:** `yahya-site`. Build
command and publish folder come from [`netlify.toml`](netlify.toml).

## Checked before delivery

- Screenshots at 375px and 1440px reviewed; no horizontal overflow; RTL throughout.
- Lighthouse (served with gzip, like Netlify): mobile Performance 92–98 (varies run to run),
  Accessibility 100, Best Practices 100, SEO 100; desktop 100 / 100 / 100 / 100.
- SEO: Arabic title/description, Open Graph image, `sitemap.xml`, `robots.txt`, and JSON-LD with
  one `AutoRepair` entry for the single location.
- Motion: only the hero text fades in once on load; turned off for visitors who prefer reduced
  motion.
- No manufacturer logos are used by the site itself (models are text chips). Hyundai/Kia appear
  only where they are part of the center's own logo, sign and wall.
