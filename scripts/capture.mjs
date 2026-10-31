import { mkdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';

const [phase, requestedUrl, runtime] = process.argv.slice(2);
if (!['before', 'proposal', 'after'].includes(phase) || !requestedUrl) {
  throw new Error('Uso: node scripts/capture.mjs before|proposal|after URL [ruta a node_modules]');
}
const require = createRequire(runtime ? path.join(path.resolve(runtime), '_capture.cjs') : import.meta.url);
const { chromium } = require('playwright');
const playwrightVersion = require('playwright/package.json').version;
const directory = path.resolve('docs/portfolio/screenshots');
await mkdir(directory, { recursive: true });
const manifestPath = path.join(directory, `${phase}-manifest.json`);
try {
  await access(manifestPath);
  throw new Error(`Ya existe ${manifestPath}. No sobrescribir evidencia; archivarla antes de repetir.`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const records = [];
try {
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires', colorScheme: 'light', reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const failures = [];
    const errors = [];
    page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }));
    page.on('response', response => { if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() }); });
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(requestedUrl, { waitUntil: 'load', timeout: 60000 });
    if (!response?.ok()) throw new Error(`No se capturará una respuesta HTTP ${response?.status()}`);
    await page.evaluate(async () => {
      await Promise.race([Promise.all([document.fonts.ready, ...[...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode().catch(() => undefined))]), new Promise(resolve => setTimeout(resolve, 15000))]);
    });
    if (phase === 'before' && label === 'desktop') {
      await mkdir('docs/source', { recursive: true });
      await writeFile('docs/source/original.html', await response.text());
    }
    // No CSS injection, masks, animation disabling, or modification of the original.
    for (const fullPage of [false, true]) {
      if (fullPage && phase !== 'before') {
        // Load lazy images through normal scrolling before returning to the initial frame.
        for (const image of await page.locator('img').all()) {
          if (await image.evaluate(element => !element.closest('details:not([open])')) && await image.isVisible()) await image.scrollIntoViewIfNeeded();
        }
        await page.waitForFunction(() => [...document.images].filter(image => !image.closest('details:not([open])') && image.getBoundingClientRect().width > 0).every(image => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
        await page.evaluate(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        });
        await page.waitForFunction(() => scrollY === 0);
      }
      const file = `${phase}-${label}${fullPage ? '-fullpage' : ''}.png`;
      const bytes = await page.screenshot({ fullPage, type: 'png', timeout: 60000 });
      await writeFile(path.join(directory, file), bytes);
      records.push({ file, requestedUrl, finalUrl: page.url(), date: new Date().toISOString(), timeZone: 'America/Argentina/Buenos_Aires', browser: browser.version(), channel: process.env.PLAYWRIGHT_CHANNEL || 'chromium', playwrightVersion, viewport, deviceScaleFactor: 1, viewportOnlyEmulation: true, locale: 'es-AR', colorScheme: 'light', reducedMotion: 'no-preference', fullPage, imageDimensions: { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }, document: await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, scrollX, scrollY })), sha256: createHash('sha256').update(bytes).digest('hex'), conditions: 'Contexto limpio; carga normal sin throttling; inicio de página; ninguna alteración visual; carga de fuentes e imágenes eager esperada hasta 15 s.', failedResources: failures, pageErrors: errors });
      console.log(`${file}: ${records.at(-1).imageDimensions.width}×${records.at(-1).imageDimensions.height}`);
    }
    await context.close();
  }
  await writeFile(manifestPath, JSON.stringify({ phase, records }, null, 2) + '\n');
} finally {
  await browser.close();
}
