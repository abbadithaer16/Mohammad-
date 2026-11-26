/** Prints open to-dos from site.config.ts once per build (runs before `npm run build`). */
import { readFileSync } from 'node:fs';

const config = readFileSync('site.config.ts', 'utf8');
if (/servicesToConfirm:\s*true/.test(config)) {
  console.warn('ℹ site.config.ts: the services list is marked "to confirm with client" (servicesToConfirm: true).');
}
