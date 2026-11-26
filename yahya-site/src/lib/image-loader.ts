/**
 * Maps next/image requests to the WebP files made by scripts/images.mjs:
 *   /images/yahya/engine.jpg at 828px  →  /images/_generated/yahya/engine-828.webp
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (!src.startsWith('/images/') || src.startsWith('/images/_generated/') || /\.svg$/i.test(src)) return src;
  const base = src.replace(/^\/images\//, '').replace(/\.[a-z0-9]+$/i, '');
  return `/images/_generated/${base}-${width}.webp`;
}
