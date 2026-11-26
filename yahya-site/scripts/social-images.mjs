/**
 * Creates the social preview image (og.jpg, 1200×630) and the browser / phone icons
 * from the round logo and the storefront photo. Run after changing either:
 *
 *   npm run social-images
 *   node scripts/social-images.mjs <logo> <photo> <output folder>   (other paths)
 *
 * The logo is expected to be round on a transparent background.
 */
import path from 'node:path';
import sharp from 'sharp';

const [logo = 'public/images/yahya/logo.png', photo = 'public/images/yahya/hero.jpg', outDir = 'public/images/yahya'] =
  process.argv.slice(2);

const CHARCOAL = { r: 14, g: 14, b: 14, alpha: 1 };

// Icons: the round logo on charcoal, filling almost the whole square.
async function icon(size, file) {
  const inner = Math.round(size * 0.94);
  const badge = await sharp(logo).resize(inner, inner).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: CHARCOAL } })
    .composite([{ input: badge, gravity: 'center' }])
    .flatten({ background: CHARCOAL })
    .png({ palette: true, quality: 90, effort: 10 })
    .toFile(path.join(outDir, file));
}
await icon(192, 'icon.png');
await icon(180, 'apple-touch-icon.png');

// Social image: storefront on the left, fading into charcoal; logo on the right (Arabic reads right first).
const W = 1200;
const H = 630;
const bg = await sharp(photo).rotate().resize(W, H, { fit: 'cover', position: 'centre' }).modulate({ saturation: 0.8 }).toBuffer();
const shade = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#0e0e0e" stop-opacity="1"/>
    <stop offset="0.44" stop-color="#0e0e0e" stop-opacity="1"/>
    <stop offset="0.74" stop-color="#0e0e0e" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#0e0e0e" stop-opacity="0.15"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <line x1="${W - 560}" y1="70" x2="${W - 560}" y2="${H - 70}" stroke="#c8a04a" stroke-width="2" stroke-opacity="0.7"/>
</svg>`);
const LOGO = 480;
const badge = await sharp(logo).resize(LOGO, LOGO).toBuffer();
await sharp(bg)
  .composite([
    { input: shade, top: 0, left: 0 },
    { input: badge, top: Math.round((H - LOGO) / 2), left: W - LOGO - 40 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(outDir, 'og.jpg'));

console.log(`Wrote og.jpg, icon.png and apple-touch-icon.png to ${outDir}`);
