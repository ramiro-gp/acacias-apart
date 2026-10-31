import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const approvals = JSON.parse(await readFile('docs/approvals.json', 'utf8'));
if (!approvals.visualApproved || !approvals.publishedContentConfirmed || !approvals.whatsappConfirmed) {
  throw new Error('Faltan aprobaciones de diseño, contenido o WhatsApp. No se generará una versión indexable.');
}
const require = createRequire(import.meta.url);
const entry = path.join(path.dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');
const result = spawnSync(process.execPath, [entry, 'build'], { stdio: 'inherit', env: { ...process.env, SITE_RELEASE: 'true' } });
process.exitCode = result.status ?? 1;
