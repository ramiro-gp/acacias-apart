const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#main-navigation');
if (toggle && nav) {
  toggle.hidden = false;
  document.documentElement.classList.add('nav-enhanced');
  const label = toggle.querySelector<HTMLElement>('.menu-toggle-label');
  const setOpen = (open: boolean, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (label) label.textContent = open ? 'Cerrar' : 'Menú';
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    nav.inert = matchMedia('(max-width: 959px)').matches && !open;
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.addEventListener('click', () => setOpen(false, true)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    if (event.key !== 'Tab' || toggle.getAttribute('aria-expanded') !== 'true') return;
    const focusable = [toggle, ...nav.querySelectorAll<HTMLElement>('a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  matchMedia('(min-width: 960px)').addEventListener('change', () => setOpen(false));
  setOpen(toggle.getAttribute('aria-expanded') === 'true');
}

function openHashTarget() {
  let hash: string;
  try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!hash) return;
  const target = document.getElementById(hash);
  if (!target) return;
  const details = target instanceof HTMLDetailsElement ? target : target.closest('details');
  if (details) details.open = true;
  if (details) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}
openHashTarget();
addEventListener('hashchange', openHashTarget);
