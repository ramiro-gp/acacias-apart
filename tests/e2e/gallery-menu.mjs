import { chromium } from '../../scripts/browser-runtime.mjs';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.QA_URL || 'http://127.0.0.1:4321/';
const environment = process.env.QA_ENV || 'development';
const output = `docs/qa/gallery-menu-${environment}-2026-11-01`;
await mkdir('docs/qa', { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { url, environment, browser: browser.version(), date: new Date().toISOString(), galleries: [], menus: [], axe: [], errors: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(url);
  report.hero = await page.locator('.hero-main-photo img').evaluate(image => ({ source: image.currentSrc, width: image.naturalWidth, durationMs: performance.getEntriesByName(image.currentSrc).at(-1)?.duration }));
  report.hero.bytes = (await (await page.request.get(report.hero.source)).body()).length;
  await page.locator('.balanced-gallery').first().waitFor();
  assert.equal(await page.locator('[data-gallery="complex"] [data-photo-id]').count(), 13);
  assert.equal(await page.locator('[data-gallery="la-paz"] [data-photo-id]').count(), 12);
  assert.equal(await page.locator('[data-gallery="la-paz"] .gallery-column').nth(2).locator('[data-photo-id="la-paz-11"]').count(), 1);
  assert.equal(await page.locator('[data-gallery="la-paz"] .gallery-column').first().locator('[data-photo-id="complex-15"]').count(), 1);
  for (const width of [320, 390, 768, 960, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Desborde a ${width}`);
    if (width >= 960) {
      for (const selector of ['.editorial-gallery', '.destination-photos']) {
        const geometry = await page.locator(`${selector} .gallery-column`).evaluateAll(columns => columns.map(column => {
          const rect = column.getBoundingClientRect();
          const last = column.lastElementChild.getBoundingClientRect();
          return { x: rect.x, width: rect.width, bottom: last.bottom, top: rect.top };
        }));
        assert(Math.max(...geometry.map(x => x.bottom)) - Math.min(...geometry.map(x => x.bottom)) < 2, `${selector}: borde inferior desigual a ${width}: ${JSON.stringify(geometry)}`);
        report.galleries.push({ width, selector, geometry });
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const selector of ['.editorial-gallery', '.destination-photos']) {
    for (const image of await page.locator(`${selector} img`).all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(image => image.decode()); }
    await page.locator(selector).screenshot({ path: `${output}-${selector.slice(1)}.png` });
  }
  const normal = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  report.axe.push({ state: 'desktop', violations: normal.violations });
  assert.equal(normal.violations.length, 0);
  for (const id of ['complex-15', 'la-paz-11']) {
    const trigger = page.locator(`[data-photo-id="${id}"] a`);
    await trigger.click();
    await page.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await page.locator('.pswp').waitFor({ state: 'detached' });
    assert(await trigger.evaluate(element => document.activeElement === element), 'El lightbox no restauró el foco');
  }
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', error => report.errors.push(error.message));
  await mobile.goto(url);
  for (const offset of [0, 650, 1600]) {
    await mobile.emulateMedia({ reducedMotion: offset === 1600 ? 'reduce' : 'no-preference' });
    await mobile.evaluate(offset => scrollTo({ top: offset, behavior: 'instant' }), offset);
    await mobile.locator('.menu-toggle').click();
    const header = await mobile.locator('.site-header').boundingBox();
    const nav = await mobile.locator('#main-navigation').boundingBox();
    assert(Math.abs(header.y) < 1, `Header fuera de vista tras scroll ${offset}: ${JSON.stringify(header)}`);
    assert(Math.abs(nav.y - header.height) < 1, 'El menú no empieza debajo del header');
    assert(await mobile.locator('.menu-toggle').evaluate(button => document.elementFromPoint(button.getBoundingClientRect().x + 5, 30)?.closest('.menu-toggle') === button), 'Cerrar menú queda tapado');
    await mobile.keyboard.press('Escape');
    assert.equal(await mobile.evaluate(() => scrollY), offset, 'Cerrar cambió la posición de scroll');
    report.menus.push({ offset, header, nav });
  }
  await mobile.locator('.menu-toggle').click();
  await mobile.screenshot({ path: `${output}-mobile-menu.png` });
  const menu = await new AxeBuilder({ page: mobile }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  report.axe.push({ state: 'mobile-menu', violations: menu.violations });
  assert.equal(menu.violations.length, 0);
  await mobile.locator('#main-navigation a[href="#la-paz"]').click();
  assert.equal(await mobile.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  assert.equal(await mobile.evaluate(() => location.hash), '#la-paz');
  assert.equal(report.errors.length, 0);
  report.passed = true;
} finally {
  await browser.close();
  await writeFile(`${output}.json`, JSON.stringify(report, null, 2));
}
console.log(`Galerías y menú: ${environment}, correcto; axe sin infracciones.`);
