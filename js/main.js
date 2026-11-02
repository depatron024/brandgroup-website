const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobiel menu openen en sluiten
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

function zetMenu(open) {
  siteNav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  document.body.style.overflow = open ? 'hidden' : '';
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    zetMenu(!siteNav.classList.contains('is-open'));
  });

  // Menu sluiten na klikken op een link
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) zetMenu(false);
  });
}

// Tellers: getal loopt op tot de waarde in data-teller (leeg = "—" blijft staan)
function telOp(el) {
  const doel = Number(el.dataset.teller);
  if (!el.dataset.teller || Number.isNaN(doel)) return;

  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimalen = (el.dataset.teller.split('.')[1] || '').length;
  const opmaak = (waarde) => prefix + waarde.toLocaleString('nl-NL', {
    minimumFractionDigits: decimalen,
    maximumFractionDigits: decimalen,
  }) + suffix;

  if (geenBeweging) {
    el.textContent = opmaak(doel);
    return;
  }

  const duur = 1600;
  const start = performance.now();

  function stap(nu) {
    const voortgang = Math.min((nu - start) / duur, 1);
    el.textContent = opmaak(doel * (1 - Math.pow(1 - voortgang, 3)));
    if (voortgang < 1) requestAnimationFrame(stap);
  }

  requestAnimationFrame(stap);
}

// Elementen laten verschijnen bij scrollen
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !geenBeweging) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-zichtbaar');
      entry.target.querySelectorAll('[data-teller]').forEach(telOp);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-zichtbaar'));
  document.querySelectorAll('[data-teller]').forEach(telOp);
}

// Huidig jaar in de footer
document.querySelectorAll('[data-jaar]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
