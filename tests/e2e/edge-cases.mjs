import { chromium } from '../../scripts/browser-runtime.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const url = process.env.QA_URL || 'http://127.0.0.1:4321/';
const browser = await chromium.launch({ headless: true });
const report = { date: new Date().toISOString(), browser: browser.version(), scenarios: [], passed: false };
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('[data-gallery="complex"] .photo-link').first().tap();
  await page.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y: 400 }] });
  for (const x of [280, 240, 200, 160, 120, 70]) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: 400 }] });
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForFunction(() => document.querySelector('.pswp__counter')?.textContent?.includes('2 de'));
  // The counter changes before the inertial swipe finishes. Wait for a settled frame.
  await page.locator('.pswp__container').evaluate(element => new Promise(resolve => {
    let previous = '', stable = 0;
    const frame = () => {
      const transform = getComputedStyle(element).transform;
      stable = transform === previous ? stable + 1 : 0;
      previous = transform;
      if (stable >= 8) resolve(true); else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }));
  await page.locator('.pswp--zoom-allowed').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const image = document.querySelector('.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)');
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });
  const zoomButton = page.locator('.pswp__button--zoom');
  await zoomButton.waitFor({ state: 'visible' });
  await zoomButton.tap();
  await page.locator('.pswp--zoomed-in').waitFor({ state: 'visible' });
  await page.locator('.pswp__button--close').tap();
  await page.locator('.pswp').waitFor({ state: 'detached' });
  report.scenarios.push('Deslizamiento táctil real de entrada CDP y zoom por control en Chromium móvil emulado.');
  const missing = await context.request.get(new URL('pagina-inexistente/', url).href);
  assert.equal(missing.status(), 404);
  assert((await missing.text()).includes('content="noindex, nofollow"'));
  await context.close();

  const errorContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const errorPage = await errorContext.newPage();
  await errorPage.goto(url, { waitUntil: 'networkidle' });
  const trigger = errorPage.locator('[data-gallery="three-room"] .photo-link').first();
  const imageUrl = new URL(await trigger.getAttribute('href'), url).href;
  await errorPage.route(imageUrl, route => route.abort('failed'));
  await trigger.click();
  await errorPage.getByText('No se pudo cargar la imagen. Cerrá la galería e intentá nuevamente.', { exact: true }).waitFor({ state: 'visible' });
  await errorPage.locator('.pswp[data-gallery-ready="true"]').waitFor({ state: 'visible' });
  await errorPage.keyboard.press('Escape');
  await errorPage.locator('.pswp').waitFor({ state: 'detached' });
  await errorPage.waitForFunction(element => element === document.activeElement, await trigger.elementHandle());
  report.scenarios.push('404 HTTP real con noindex; error de imagen controlado con mensaje en español, Escape y retorno del foco.');
  await errorContext.close();
  const future = await browser.newContext();
  const futurePage = await future.newPage();
  await futurePage.clock.setFixedTime(new Date('2027-01-01T03:00:01Z'));
  await futurePage.goto(url, { waitUntil: 'networkidle' });
  assert.equal(await futurePage.locator('[data-current-year]').innerText(), '2027');
  await future.close();
  report.scenarios.push('Copyright actualizado a 2027 en el cliente con reloj futuro, sin reconstruir el HTML de 2026.');
  report.passed = true;
  console.log(JSON.stringify(report));
} catch (error) {
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile('docs/qa/edge-cases.json', JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
