import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.QA_URL || 'http://127.0.0.1:4321/';
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const report = { stage: 'H2 proposal, not final acceptance', date: new Date().toISOString(), browser: browser.version(), url, viewports: [], scenarios: [], pageErrors: [], failedResources: [], externalRequests: [], accessibility: [] };
await mkdir('docs/qa', { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.failedResources.push({ url: response.url(), status: response.status() }); });
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(url).origin) report.externalRequests.push(request.url()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('html').getAttribute('lang'), 'es-AR');
  assert((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    assert(dimensions.document <= dimensions.viewport, `Desborde a ${width}px: ${JSON.stringify(dimensions)}`);
    report.viewports.push({ width, ...dimensions, horizontalOverflow: false });
  }
  report.scenarios.push('Sin desborde horizontal en 320, 390, 768, 1024, 1440 y 1920.');
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Menú', exact: true });
  await menu.focus(); await page.keyboard.press('Enter');
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert(await menu.evaluate(element => element === document.activeElement));
  await menu.click(); await page.getByRole('link', { name: 'Alojamientos', exact: true }).click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  const summary = page.locator('.equipment-details summary');
  await summary.focus(); await page.keyboard.press('Enter');
  assert.notEqual(await page.locator('.equipment-details').getAttribute('open'), null);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.equipment-details').getAttribute('open'), null);
  report.scenarios.push('Menú por teclado, cierre con Escape y enlace; foco restaurado; detalles nativos por teclado.');
  const whatsapp = await page.locator('a[href^="https://wa.me/"]').evaluateAll(links => links.map(a => ({ href: a.href, icon: !!a.querySelector('svg path'), target: a.target, rel: a.rel, name: a.getAttribute('aria-label') || a.textContent.trim() })));
  assert(whatsapp.length >= 4);
  for (const link of whatsapp) {
    assert(link.href.startsWith('https://wa.me/5491161426804?text='));
    assert(link.icon && link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer'));
  }
  const external = await page.locator('a[href^="https://"]').evaluateAll(links => links.map(a => ({ href: a.href, target: a.target, rel: a.rel })));
  for (const link of external) assert(link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer'));
  assert.equal(await page.locator('a[href^="mailto:"]').getAttribute('target'), null);
  for (const file of ['PLANO%20DEPARTAMENTO%201.pdf', 'PLANO%20DEPARTAMENTO%202.pdf', 'PLANO%20DORMI.pdf']) {
    const response = await context.request.get(new URL(`img/${file}`, url).href);
    assert.equal(response.status(), 200);
    assert((await response.body()).subarray(0, 4).toString() === '%PDF');
  }
  report.scenarios.push('WhatsApp con destino confirmado e iconos; externos seguros; mailto nativo; tres PDF originales accesibles.');
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
  await page.evaluate(async () => Promise.all([...document.images].map(image => image.decode())));
  assert.equal(await page.locator('img:not([alt])').count(), 0);
  assert.equal(await page.locator('img:not([width]),img:not([height])').count(), 0);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  report.accessibility.push({ state: 'desktop document', violations: axe.violations, incomplete: axe.incomplete.map(item => ({ id: item.id, impact: item.impact })) });
  assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))));
  const trigger = page.locator('[data-gallery="three-room"] .photo-link').first();
  await trigger.click();
  await page.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('.pswp__counter')?.textContent?.includes('2'));
  assert.equal(await page.locator('.whatsapp-float').isVisible(), false);
  const lightboxAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  report.accessibility.push({ state: 'lightbox open', violations: lightboxAxe.violations, incomplete: lightboxAxe.incomplete.map(item => ({ id: item.id, impact: item.impact })) });
  assert.equal(lightboxAxe.violations.length, 0, JSON.stringify(lightboxAxe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))));
  await page.keyboard.press('Escape');
  await page.locator('.pswp').waitFor({ state: 'detached' });
  assert(await trigger.evaluate(element => element === document.activeElement), 'El lightbox no devolvió el foco al disparador');
  assert(await page.locator('.whatsapp-float').isVisible());
  report.scenarios.push('Lightbox: apertura, flecha siguiente, flotante oculto, Escape y foco restaurado.');
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(url, { waitUntil: 'networkidle' });
  assert.equal(await reducedPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await reducedPage.locator('[data-gallery="complex"] .photo-link').first().click();
  await reducedPage.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  await reducedPage.keyboard.press('Escape');
  await reducedPage.locator('.pswp').waitFor({ state: 'detached' });
  await reduced.close();
  report.scenarios.push('Movimiento reducido: scroll no animado y galería utilizable.');

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(url, { waitUntil: 'load' });
  assert(await noJsPage.getByRole('link', { name: 'Alojamientos', exact: true }).isVisible());
  assert(await noJsPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await noJsPage.locator('.equipment-details summary').click();
  assert.notEqual(await noJsPage.locator('.equipment-details').getAttribute('open'), null);
  const fallback = await noJsPage.locator('.photo-link').first().getAttribute('href');
  assert((await noJs.request.get(new URL(fallback, url).href)).ok());
  await noJs.close();
  report.scenarios.push('Sin JavaScript a 320px: navegación visible, detalles nativos y enlace directo a imagen.');

  assert.equal(report.pageErrors.length, 0, JSON.stringify(report.pageErrors));
  assert.equal(report.failedResources.length, 0, JSON.stringify(report.failedResources));
  assert.equal(report.externalRequests.length, 0, JSON.stringify(report.externalRequests));
  report.passed = true;
  console.log(JSON.stringify({ passed: true, viewports: report.viewports.length, scenarios: report.scenarios, axeViolations: report.accessibility.reduce((n, r) => n + r.violations.length, 0) }, null, 2));
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile('docs/qa/proposal.json', JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
