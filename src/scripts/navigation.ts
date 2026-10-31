const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#main-navigation');
if (toggle && nav) {
  toggle.hidden = false;
  document.documentElement.classList.add('nav-enhanced');
  const setOpen = (open: boolean, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  matchMedia('(min-width: 960px)').addEventListener('change', () => setOpen(false));
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
