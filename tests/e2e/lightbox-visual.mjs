import { chromium } from '../../scripts/browser-runtime.mjs';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2] || process.env.QA_URL || 'http://127.0.0.1:4321/';
const environment = process.argv[3] || process.env.QA_ENV || (new URL(url).port === '4321' ? 'dev' : 'production');
const outputDir = path.resolve('docs/qa/lightbox');
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const report = {
  date: new Date().toISOString(), environment, url, browser: browser.version(),
  playwright: packageJson.devDependencies.playwright,
  results: [], screenshots: [], consoleErrors: [], failedRequests: [],
};

function watch(page) {
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  page.on('pageerror', error => report.consoleErrors.push(error.message));
  page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', response => { if (response.status() >= 400) report.failedRequests.push({ url: response.url(), status: response.status() }); });
}

async function open(page, selector) {
  const trigger = typeof selector === 'string' ? page.locator(selector) : selector;
  await trigger.click();
  await page.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const image = document.querySelector('.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)');
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });
}

async function closeWithEscape(page, trigger) {
  await page.keyboard.press('Escape');
  await page.locator('.pswp').waitFor({ state: 'detached' });
  await page.waitForFunction(element => element === document.activeElement, await trigger.elementHandle());
}

async function assertRenderedRatio(page) {
  const image = await page.locator('.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)').evaluate(element => ({
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  }));
  assert(Math.abs(image.width / image.height - image.naturalWidth / image.naturalHeight) < 0.025, `La imagen perdió sus proporciones: ${JSON.stringify(image)}`);
}

async function inspectOverlay(page, width, height) {
  const state = await page.evaluate(() => {
    const root = document.querySelector('.pswp');
    const image = root?.querySelector('.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)');
    if (!root || !image) return null;
    const stylesheets = [...document.styleSheets];
    const cssRules = stylesheets.flatMap(sheet => {
      try { return [...sheet.cssRules].map(rule => rule.cssText); }
      catch { return []; }
    }).join('\n');
    const rect = element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom };
    };
    const controls = ['.pswp__button--arrow--prev', '.pswp__button--arrow--next', '.pswp__button--close'].map(selector => {
      const button = root.querySelector(selector);
      if (!button) return null;
      const style = getComputedStyle(button);
      const icon = button.querySelector('svg');
      return { selector, label: button.getAttribute('aria-label'), rect: rect(button), display: style.display, visibility: style.visibility, icon: icon && rect(icon), iconFill: icon && getComputedStyle(icon).fill };
    });
    return {
      root: rect(root), position: getComputedStyle(root).position, zIndex: getComputedStyle(root).zIndex,
      image: { rect: rect(image), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
      controls, counter: root.querySelector('.pswp__counter')?.textContent,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      lockClasses: document.documentElement.classList.contains('lightbox-open') && document.body.classList.contains('lightbox-open'),
      coveredFooter: (() => {
        const point = document.elementFromPoint(innerWidth - 2, innerHeight - 2);
        return !!point?.closest('.pswp');
      })(),
      rootCss: stylesheets.map(sheet => sheet.href).filter(Boolean),
      photoSwipeCssLoaded: cssRules.includes('.pswp__button--close') && cssRules.includes('.pswp__button--arrow'),
    };
  });
  assert(state, 'No se montó el diálogo PhotoSwipe');
  assert.equal(state.position, 'fixed', 'El visor no está fuera del flujo del documento');
  assert.equal(Number(state.zIndex) > 0, true);
  assert(state.root.x <= 1 && state.root.y <= 1 && Math.abs(state.root.width - width) <= 1 && Math.abs(state.root.height - height) <= 1,
    `El visor no cubre el viewport: ${JSON.stringify(state.root)}`);
  assert.equal(state.lockClasses, true, 'Falta bloqueo de scroll durante la galería');
  assert(['hidden', 'clip'].includes(state.htmlOverflow), `El documento sigue desplazándose: ${state.htmlOverflow}`);
  assert.equal(state.coveredFooter, true, 'El footer quedó por encima del visor');
  const ratioError = Math.abs(state.image.rect.width / state.image.rect.height - state.image.naturalWidth / state.image.naturalHeight);
  assert(ratioError < 0.025, `La imagen perdió sus proporciones: ${JSON.stringify(state.image)}`);
  assert(state.rootCss.length > 0 || state.photoSwipeCssLoaded, 'No se cargaron los estilos de PhotoSwipe');
  assert(state.photoSwipeCssLoaded, 'Faltan reglas de PhotoSwipe en el CSS aplicado');
  for (const button of state.controls) {
    assert(button, 'Falta un control');
    assert(button.label, `Control sin nombre: ${button.selector}`);
    if (button.display === 'none' || button.visibility === 'hidden') {
      assert(button.selector === '.pswp__button--arrow--prev' && state.counter?.startsWith('1 de '), `Control oculto inesperadamente: ${button.selector}`);
      continue;
    }
    assert(button.rect.width >= 44 && button.rect.height >= 44, `Control demasiado pequeño: ${button.selector}`);
    assert(button.rect.x >= 0 && button.rect.y >= 0 && button.rect.right <= width + 1 && button.rect.bottom <= height + 1,
      `Control fuera del viewport: ${JSON.stringify(button)}`);
    assert(button.icon && button.icon.width >= 24 && button.icon.height >= 24 && button.iconFill !== 'none', `Icono SVG no aplicado: ${button.selector}`);
  }
  return state;
}

try {
  for (const viewport of [
    { label: 'desktop', width: 1440, height: 900, mobile: false },
    { label: 'mobile', width: 390, height: 844, mobile: true },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1, isMobile: viewport.mobile, hasTouch: viewport.mobile,
      locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires',
      colorScheme: 'light', reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    watch(page);
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200);
    await page.evaluate(() => document.fonts.ready);

    const photoSwipeStyles = await page.evaluate(() => {
      const rules = [...document.styleSheets].flatMap(sheet => {
        try { return [...sheet.cssRules].map(rule => rule.cssText); }
        catch { return []; }
      }).join('\n');
      return {
        hasClose: rules.includes('.pswp__button--close'),
        hasArrow: rules.includes('.pswp__button--arrow'),
        stylesheets: [...document.styleSheets].map(sheet => sheet.href).filter(Boolean),
      };
    });
    assert(photoSwipeStyles.hasClose && photoSwipeStyles.hasArrow, `PhotoSwipe CSS no está en los estilos aplicados: ${JSON.stringify(photoSwipeStyles)}`);

    const inventories = await page.evaluate(() => ({
      rooms: Object.fromEntries(['three-room', 'two-room', 'studio'].map(id => [id, [...document.querySelectorAll(`[data-gallery="${id}"] .photo-link`)].length])),
      complex: document.querySelectorAll('[data-gallery="complex"] .photo-link').length,
      destination: document.querySelectorAll('[data-gallery="la-paz"] .photo-link').length,
      hiddenGalleryDetails: document.querySelectorAll('details.more-photos,details.gallery-more').length,
      uniquePhotoIds: new Set([...document.querySelectorAll('[data-photo-id]')].map(el => el.getAttribute('data-photo-id'))).size,
    }));
    assert.deepEqual(inventories.rooms, { 'three-room': 5, 'two-room': 6, studio: 5 });
    assert.equal(inventories.complex, 11);
    assert.equal(inventories.destination, 9);
    assert.equal(inventories.hiddenGalleryDetails, 0, 'Quedaron fotos detrás de un desplegable');
    assert.equal(inventories.uniquePhotoIds, 36);
    for (const [room, count] of Object.entries(inventories.rooms)) {
      const links = page.locator(`[data-gallery="${room}"] .photo-link`);
      assert.equal(await links.count(), count);
      for (const link of await links.all()) assert(await link.isVisible(), `Foto de ${room} no visible inicialmente`);
    }
    const strip = page.locator('[data-gallery="two-room"] .room-thumbnails');
    const stripMetrics = await strip.evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, count: element.querySelectorAll('.photo-link').length }));
    assert.equal(stripMetrics.count, 5, 'No aparecen todas las miniaturas del dos ambientes');
    if (viewport.mobile) assert(stripMetrics.scrollWidth > stripMetrics.clientWidth, 'La tira móvil debería desplazarse horizontalmente');
    await strip.evaluate(element => { element.scrollLeft = element.scrollWidth; });
    if (viewport.mobile) assert(await strip.evaluate(element => element.scrollLeft > 0), 'La tira de fotos no se desplaza');

    const trigger = page.locator('[data-gallery="three-room"] .photo-link').first();
    await open(page, page.locator('[data-gallery="three-room"] .photo-link').first());
    const initial = await inspectOverlay(page, viewport.width, viewport.height);
    assert.match(initial.counter || '', /^1 de 5$/);
    assert.equal(await page.locator('.pswp__button--arrow--prev').isVisible(), false, 'No se ocultó anterior en el inicio del álbum');
    assert.equal(await page.locator('.whatsapp-float').evaluate(element => getComputedStyle(element).visibility), 'hidden');
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.mouse.move(viewport.width - 12, viewport.height / 2);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => window.scrollY), scrollY, 'El fondo de la página se desplazó tras abrir el modal');

    await page.locator('.pswp__button--arrow--next').click();
    await page.waitForFunction(() => document.querySelector('.pswp__counter')?.textContent === '2 de 5');
    assert.equal(await page.locator('.pswp__button--arrow--prev').isVisible(), true);
    assert.equal(await page.locator('.pswp__button--arrow--next').isVisible(), true);
    const nextState = await inspectOverlay(page, viewport.width, viewport.height);
    await page.waitForTimeout(250);
    const screenshot = path.join(outputDir, `${environment}-${viewport.label}-lightbox.png`);
    await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' });
    report.screenshots.push(screenshot);
    report.results.push({ viewport: viewport.label, inventories, strip: stripMetrics, initial, afterNext: nextState, screenshot });
    await closeWithEscape(page, trigger);

    // Every immediately visible room thumbnail must open at its own album index.
    for (const room of ['three-room', 'two-room', 'studio']) {
      const links = page.locator(`[data-gallery="${room}"] .photo-link`);
      for (let index = 1; index < await links.count(); index++) {
        const photoLink = links.nth(index);
        await open(page, photoLink);
        const number = await page.locator('.pswp__counter').textContent();
        assert.equal(number, `${index + 1} de ${await links.count()}`, `${room} miniatura abrió en otra posición`);
        await assertRenderedRatio(page);
        await closeWithEscape(page, photoLink);
      }
    }
    report.results.at(-1).allRoomThumbnailsOpenAtIndex = true;

    if (viewport.mobile) {
      const touchTrigger = page.locator('[data-gallery="complex"] .photo-link').first();
      await open(page, page.locator('[data-gallery="complex"] .photo-link').first());
      const session = await context.newCDPSession(page);
      const startX = viewport.width * 0.72;
      const y = viewport.height * 0.52;
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y, id: 1 }] });
      for (const progress of [0.2, 0.4, 0.6, 0.75]) {
        await page.waitForTimeout(45);
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX - viewport.width * progress, y, id: 1 }] });
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForFunction(() => document.querySelector('.pswp__counter')?.textContent === '2 de 11');
      await closeWithEscape(page, touchTrigger);
      await session.detach();
      report.results.at(-1).touchSwipe = true;
    }

    // A real one-photo instance must remove both navigation controls and remain closable.
    const singlePage = await context.newPage();
    watch(singlePage);
    await singlePage.goto(url, { waitUntil: 'networkidle' });
    await singlePage.locator('[data-gallery="studio"] .photo-link').evaluateAll(links => links.slice(1).forEach(link => link.closest('figure')?.remove()));
    const singleTrigger = singlePage.locator('[data-gallery="studio"] .photo-link').first();
    await open(singlePage, singlePage.locator('[data-gallery="studio"] .photo-link').first());
    assert.equal(await singlePage.locator('.pswp__counter').textContent(), '1 de 1');
    assert.equal(await singlePage.locator('.pswp__button--arrow--prev').isVisible(), false);
    assert.equal(await singlePage.locator('.pswp__button--arrow--next').isVisible(), false);
    await closeWithEscape(singlePage, singleTrigger);
    report.results.at(-1).singlePhotoAlbum = true;
    await singlePage.close();

    // Verify PhotoSwipe's explicit backdrop action in an area outside the rendered photo and controls.
    const backdropTrigger = page.locator('[data-gallery="studio"] .photo-link').first();
    await open(page, page.locator('[data-gallery="studio"] .photo-link').first());
    const point = await page.evaluate(() => {
      const root = document.querySelector('.pswp');
      const image = root.querySelector('.pswp__img').getBoundingClientRect();
      const controls = [...root.querySelectorAll('.pswp__button')].map(element => element.getBoundingClientRect());
      for (let y = 8; y < innerHeight - 8; y += 8) for (let x = 8; x < innerWidth - 8; x += 8) {
        const inRect = rect => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        if (inRect(image) || controls.some(inRect)) continue;
        return { x, y };
      }
      return null;
    });
    assert(point, 'No se encontró una zona despejada del fondo para probar el cierre');
    await page.mouse.click(point.x, point.y);
    await page.locator('.pswp').waitFor({ state: 'detached' });
    await page.waitForFunction(element => element === document.activeElement, await backdropTrigger.elementHandle());
    report.results.at(-1).backdropClose = true;
    await page.close();
    await context.close();
  }

  assert.deepEqual(report.consoleErrors, [], `Errores de consola: ${JSON.stringify(report.consoleErrors)}`);
  assert.deepEqual(report.failedRequests, [], `Recursos fallidos: ${JSON.stringify(report.failedRequests)}`);
  const filename = path.resolve(`docs/qa/lightbox-${environment}.json`);
  await writeFile(filename, JSON.stringify({ ...report, report: filename }, null, 2) + '\n');
  console.log(JSON.stringify({ report: filename, screenshots: report.screenshots, viewports: report.results.map(({ viewport, allRoomThumbnailsOpenAtIndex, singlePhotoAlbum, backdropClose, touchSwipe }) => ({ viewport, allRoomThumbnailsOpenAtIndex, singlePhotoAlbum, backdropClose, touchSwipe: !!touchSwipe })) }, null, 2));
} finally {
  await browser.close();
}
