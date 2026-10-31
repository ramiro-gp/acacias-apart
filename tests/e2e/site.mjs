import { chromium, firefox, webkit } from '../../scripts/browser-runtime.mjs';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const name = process.env.QA_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[name];
if (!browserType) throw new Error('QA_BROWSER debe ser chromium, firefox o webkit');
const url = process.env.QA_URL || 'http://127.0.0.1:4321/';
const browser = await browserType.launch({ headless: true });
const report = { date: new Date().toISOString(), engine: name, browser: browser.version(), url, viewports: [], scenarios: [], pageErrors: [], failedResources: [], initialExternalRequests: [], accessibility: [] };
await mkdir('docs/qa', { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.failedResources.push({ url: response.url(), status: response.status() }); });
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(url).origin) report.initialExternalRequests.push(request.url()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('html').getAttribute('lang'), 'es-AR');
  assert.equal(await page.locator('[data-accommodation]').count(), 3);
  assert.equal(await page.locator('[data-accommodation="studio"] dt').filter({ hasText: 'Capacidad' }).count(), 0);
  assert.equal(await page.locator('[data-current-year]').innerText(), new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric' }).format(new Date()));
  assert.equal(await page.getByText(/Covid-19|Safe Travels/i).count(), 0);
  const ids = await page.locator('[data-photo-id]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('data-photo-id')))]);
  assert.equal(ids.length, 36);
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    if (dimensions.document > dimensions.viewport) {
      const overflowElements = await page.evaluate(() => [...document.body.querySelectorAll('*')].map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, id: element.id, className: typeof element.className === 'string' ? element.className : '', x: Math.round(rect.x), right: Math.round(rect.right), width: Math.round(rect.width), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
      }).filter(element => element.right > innerWidth + 1 || element.x < -1).slice(0, 12));
      assert(false, `Desborde a ${width}: ${JSON.stringify({ ...dimensions, overflowElements })}`);
    }
    assert(dimensions.document <= dimensions.viewport, `Desborde a ${width}: ${JSON.stringify(dimensions)}`);
    report.viewports.push({ width, ...dimensions, horizontalOverflow: false });
  }
  report.scenarios.push('Tres tipologías, 36 fotos distintas, capacidad desconocida omitida, año actual, sin avisos retirados; seis anchos sin desborde.');
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Menú', exact: true });
  await menu.focus(); await page.keyboard.press('Enter');
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert(await menu.evaluate(element => element === document.activeElement));
  await menu.click(); await page.getByRole('link', { name: 'Alojamientos', exact: true }).click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  for (const hash of ['deptos', 'fotitos', 'linkpaz', 'lapazcontenidos2', 'normaslink', 'linkmascotas']) {
    assert.equal(await page.locator(`[id="${hash}"]`).count(), 1);
  }
  for (const hash of ['normaslink', 'linkmascotas']) {
    await page.goto(new URL(`#${hash}`, url).href, { waitUntil: 'load' });
    await page.waitForFunction(id => document.getElementById(id)?.open === true, hash);
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  const summary = page.locator('.equipment-details summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  assert.notEqual(await page.locator('.equipment-details').first().getAttribute('open'), null);
  await page.keyboard.press('Enter');
  report.scenarios.push('Menú por teclado/Escape y selección; fragmentos originales; políticas abiertas al entrar por URL; detalles nativos.');
  const links = await page.locator('a[href^="https://"]').evaluateAll(links => links.map(a => ({ href: a.href, icon: !!a.querySelector('svg path'), target: a.target, rel: a.rel })));
  for (const link of links) {
    assert(link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer'));
    if (link.href.startsWith('https://wa.me/')) assert(link.icon && link.href.startsWith('https://wa.me/5491161426804?text='));
  }
  for (const protocol of ['mailto:', 'tel:']) assert.equal(await page.locator(`a[href^="${protocol}"]`).getAttribute('target'), null);
  for (const file of ['PLANO%20DEPARTAMENTO%201.pdf', 'PLANO%20DEPARTAMENTO%202.pdf', 'PLANO%20DORMI.pdf']) {
    const response = await context.request.get(new URL(`img/${file}`, url).href);
    assert.equal(response.status(), 200);
    assert((await response.body()).subarray(0, 4).toString() === '%PDF');
  }
  assert.equal(await page.locator('iframe').count(), 0, 'El mapa no debe cargarse automáticamente');
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  assert.equal(schema['@type'], 'LodgingBusiness');
  assert(!schema.address.streetAddress && !schema.aggregateRating && !schema.priceRange && !schema.numberOfRooms);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'index, follow');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.acaciasapart.com.ar/');
  const robots = await context.request.get(new URL('robots.txt', url).href);
  assert.equal(robots.status(), 200);
  assert((await robots.text()).includes('Allow: /'));
  const sitemap = await context.request.get(new URL('sitemap-0.xml', url).href);
  assert.equal(sitemap.status(), 200);
  assert((await sitemap.text()).includes('<loc>https://www.acaciasapart.com.ar/</loc>'));
  report.scenarios.push('Enlaces e iconos de WhatsApp, externos protegidos, mailto/tel nativos, PDF, mapa bajo demanda y schema sin datos inferidos.');
  // Open disclosures to verify the complete content and all lazy images, not only the first screen.
  await page.locator('details').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
  for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
  await page.evaluate(async () => Promise.all([...document.images].map(image => image.decode())));
  assert.equal(await page.locator('img:not([alt]),img:not([width]),img:not([height])').count(), 0);
  const ratios = await page.locator('.photo-link img').evaluateAll(images => images.map(image => ({
    rendered: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
    natural: image.naturalWidth / image.naturalHeight,
    objectFit: getComputedStyle(image).objectFit,
    primary: !!image.closest('.room-primary-photo'),
    thumbnail: !!image.closest('.room-thumbnails'),
  })));
  for (const ratio of ratios) {
    assert(ratio.natural > 0 && ratio.rendered > 0, 'Foto sin dimensiones válidas');
    if (ratio.primary || ratio.thumbnail) {
      assert.equal(ratio.objectFit, 'cover', 'La foto editorial debe recortarse sin deformarse');
      assert(Math.abs(ratio.rendered - (ratio.primary ? 4 / 3 : 1.2)) < 0.02, 'El encuadre fotográfico no respeta la proporción prevista');
    } else assert(Math.abs(ratio.rendered - ratio.natural) < 0.02, 'Foto deformada');
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  report.accessibility.push({ state: 'complete content and open disclosures', violations: axe.violations, incomplete: axe.incomplete.map(item => item.id) });
  assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))));
  const trigger = page.locator('[data-gallery="three-room"] .photo-link').first();
  await trigger.click(); await page.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('.pswp__counter')?.textContent?.includes('2'));
  for (let step = 0; step < 8; step++) {
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => !!document.activeElement?.closest('.pswp')), 'El foco salió del lightbox');
  }
  const dialogAxe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  report.accessibility.push({ state: 'lightbox', violations: dialogAxe.violations, incomplete: dialogAxe.incomplete.map(item => item.id) });
  assert.equal(dialogAxe.violations.length, 0, JSON.stringify(dialogAxe.violations.map(v => v.id)));
  await page.keyboard.press('Escape'); await page.locator('.pswp').waitFor({ state: 'detached' });
  await page.waitForFunction(element => element === document.activeElement, await trigger.elementHandle(), { timeout: 3000 });
  report.scenarios.push('Imágenes completas y proporcionadas, axe, galería con teclado, ciclo de foco, Escape y restauración.');
  await context.close();
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', hasTouch: true });
  const touchPage = await reduced.newPage();
  await touchPage.goto(url, { waitUntil: 'networkidle' });
  assert.equal(await touchPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await touchPage.locator('[data-gallery="complex"] .photo-link').first().tap();
  await touchPage.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  await touchPage.locator('.pswp__button--arrow--next').tap();
  await touchPage.waitForFunction(() => document.querySelector('.pswp__counter')?.textContent?.includes('2'));
  await touchPage.locator('.pswp__button--close').tap();
  await touchPage.locator('.pswp').waitFor({ state: 'detached' });
  await reduced.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const noJsPage = await noJs.newPage(); await noJsPage.goto(url, { waitUntil: 'load' });
  assert(await noJsPage.getByRole('link', { name: 'Alojamientos', exact: true }).isVisible());
  assert(await noJsPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await noJsPage.locator('.equipment-details summary').first().click();
  assert.notEqual(await noJsPage.locator('.equipment-details').first().getAttribute('open'), null);
  await noJs.close();
  report.scenarios.push('Controles táctiles emulados, movimiento reducido y navegación/detalles sin JavaScript a 320px.');
  assert.equal(report.pageErrors.length, 0, JSON.stringify(report.pageErrors));
  assert.equal(report.failedResources.length, 0, JSON.stringify(report.failedResources));
  assert.equal(report.initialExternalRequests.length, 0, JSON.stringify(report.initialExternalRequests));
  report.passed = true;
  console.log(JSON.stringify({ engine: name, passed: true, viewports: report.viewports.length, photos: ids.length, axeViolations: 0 }));
} catch (error) {
  report.passed = false; report.failure = error.stack; throw error;
} finally {
  await writeFile(`docs/qa/site-${name}.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
