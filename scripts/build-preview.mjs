import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const entry = path.join(path.dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');
const result = spawnSync(process.execPath, [entry, 'build'], {
  stdio: 'inherit',
  env: { ...process.env, SITE_RELEASE: 'false' },
});
if (result.status !== 0) process.exit(result.status ?? 1);

const html = await readFile('dist/index.html', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
if (!html.includes('content="noindex, nofollow"')) throw new Error('Preview build must be noindex.');
if (!robots.includes('Disallow: /')) throw new Error('Preview robots must disallow crawling.');
console.log('Preview seguro generado: noindex, robots disallow y sin sitemap indexable.');
