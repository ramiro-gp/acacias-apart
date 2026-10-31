import PhotoSwipeLightbox from 'photoswipe/lightbox';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLElement>('[data-gallery]').forEach(gallery => {
  let lastTrigger: HTMLElement | null = null;
  // Safari does not necessarily focus a clicked anchor. Remember the actual trigger.
  gallery.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('a.photo-link') : null;
    if (target) lastTrigger = target;
  }, { capture: true });
  const lightbox = new PhotoSwipeLightbox({
    gallery,
    children: 'a.photo-link',
    pswpModule: () => import('photoswipe'),
    closeTitle: 'Cerrar galería',
    zoomTitle: 'Ampliar imagen',
    arrowPrevTitle: 'Imagen anterior',
    arrowNextTitle: 'Imagen siguiente',
    errorMsg: 'No se pudo cargar la imagen. Cerrá la galería e intentá nuevamente.',
    indexIndicatorSep: ' de ',
    bgOpacity: 0.97,
    loop: false,
    bgClickAction: 'close',
    imageClickAction: 'zoom-or-close',
    escKey: true,
    arrowKeys: true,
    trapFocus: true,
    returnFocus: true,
    showHideAnimationType: reducedMotion.matches ? 'none' : 'fade',
    showAnimationDuration: reducedMotion.matches ? 0 : 180,
    hideAnimationDuration: reducedMotion.matches ? 0 : 180,
    zoomAnimationDuration: reducedMotion.matches ? 0 : 180,
    preload: [1, 1],
  });
  lightbox.on('beforeOpen', () => {
    lastTrigger ??= document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.documentElement.classList.add('lightbox-open');
    document.body.classList.add('lightbox-open');
    // Keep only the dialog in the accessibility and tab order while open.
    document.querySelectorAll<HTMLElement>('body > :not(.pswp)').forEach(element => {
      if (!element.inert) { element.inert = true; element.dataset.galleryInert = 'true'; }
    });
  });
  lightbox.on('afterInit', () => {
    const dialog = lightbox.pswp?.element;
    dialog?.setAttribute('aria-label', 'Galería de fotografías de Acacias Apart');
    dialog?.setAttribute('aria-modal', 'true');
    dialog?.querySelector('.pswp__scroll-wrap')?.setAttribute('aria-roledescription', 'carrusel');
    dialog?.querySelectorAll('.pswp__item').forEach(element => element.setAttribute('aria-roledescription', 'fotografía'));
    const counter = dialog?.querySelector('.pswp__counter');
    counter?.setAttribute('role', 'status');
    counter?.setAttribute('aria-live', 'polite');
    counter?.setAttribute('aria-atomic', 'true');
  });
  lightbox.on('bindEvents', () => {
    // Controls become interactive after the opening transition, not at first paint.
    if (lightbox.pswp?.element) {
      lightbox.pswp.element.dataset.galleryReady = 'true';
      lightbox.pswp.element.focus({ preventScroll: true });
    }
  });
  lightbox.on('keydown', event => {
    if (event.originalEvent.key !== 'Tab') return;
    const dialog = lightbox.pswp?.element;
    if (!dialog) return;
    const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== 'hidden');
    if (!controls.length) return;
    event.preventDefault();
    event.originalEvent.preventDefault();
    const current = controls.indexOf(document.activeElement as HTMLElement);
    const next = event.originalEvent.shiftKey ? (current <= 0 ? controls.length - 1 : current - 1) : (current + 1) % controls.length;
    controls[next]?.focus();
  });
  lightbox.on('destroy', () => {
    document.documentElement.classList.remove('lightbox-open');
    document.body.classList.remove('lightbox-open');
    document.querySelectorAll<HTMLElement>('[data-gallery-inert]').forEach(element => {
      element.inert = false;
      delete element.dataset.galleryInert;
    });
    const returnTarget = lastTrigger;
    queueMicrotask(() => { if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true }); });
    lastTrigger = null;
  });
  reducedMotion.addEventListener('change', () => {
    lightbox.options.showHideAnimationType = reducedMotion.matches ? 'none' : 'fade';
    lightbox.options.showAnimationDuration = reducedMotion.matches ? 0 : 180;
    lightbox.options.hideAnimationDuration = reducedMotion.matches ? 0 : 180;
    lightbox.options.zoomAnimationDuration = reducedMotion.matches ? 0 : 180;
  });
  lightbox.init();
});
