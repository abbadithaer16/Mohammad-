/**
 * Draws the black-marble texture shown behind the logo in the hero (public/textures/marble.webp).
 * Procedural (Perlin noise), so there is no third-party image to license.
 * Run once after changing the colours below:  npm run marble
 */
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const SIZE = 720;
const BASE = [17, 17, 17]; // near-black stone
const GOLD = [200, 160, 74]; // #c8a04a
const SEED = 7;

// Classic 2D Perlin noise with a seeded permutation table.
const perm = new Uint8Array(512);
{
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = SEED;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
function grad(h, x, y) {
  switch (h & 3) {
    case 0: return x + y;
    case 1: return -x + y;
    case 2: return x - y;
    default: return -x - y;
  }
}
function perlin(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = fade(x);
  const v = fade(y);
  const a = perm[X] + Y;
  const b = perm[X + 1] + Y;
  return lerp(
    lerp(grad(perm[a], x, y), grad(perm[b], x - 1, y), u),
    lerp(grad(perm[a + 1], x, y - 1), grad(perm[b + 1], x - 1, y - 1), u),
    v,
  );
}
function fbm(x, y, octaves = 5) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * perlin(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return sum;
}

const px = Buffer.alloc(SIZE * SIZE * 3);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const nx = x / SIZE;
    const ny = y / SIZE;
    // Cloudy body of the stone
    const cloud = fbm(nx * 2.5 + 11, ny * 2.5 + 5, 5);
    // Main veins: long diagonal lines, gently bent by turbulence
    const warp = fbm(nx * 1.4, ny * 1.4, 4) + 0.035 * fbm(nx * 14 + 2, ny * 14 + 7, 3);
    const main = Math.abs(Math.sin((nx * 0.8 + ny * 0.55) * 5.2 + warp * 3.4));
    const vein = Math.pow(1 - main, 55);
    const haze = Math.pow(1 - main, 9) * 0.2; // soft light band along each vein
    // Thin secondary veins in another direction
    const warp2 = fbm(nx * 3 + 3, ny * 3 + 9, 6);
    const fine = Math.abs(Math.sin((nx * -0.5 + ny * 1.0) * 9 + warp2 * 2.6));
    const vein2 = Math.pow(1 - fine, 80) * 0.5;

    const shade = 1 + cloud * 0.9 + haze;
    const g = Math.min(1, vein * 0.85 + vein2);
    const i = (y * SIZE + x) * 3;
    for (let c = 0; c < 3; c++) {
      const stone = BASE[c] * shade;
      px[i + c] = Math.max(0, Math.min(255, Math.round(stone + (GOLD[c] - stone) * g * 0.72)));
    }
  }
}

await mkdir('public/textures', { recursive: true });
await sharp(px, { raw: { width: SIZE, height: SIZE, channels: 3 } })
  .webp({ quality: 72, effort: 6 })
  .toFile('public/textures/marble.webp');
console.log('Wrote public/textures/marble.webp');
