const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobiel menu openen en sluiten
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

function zetMenu(open) {
  siteNav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => zetMenu(!siteNav.classList.contains('is-open')));
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) zetMenu(false);
  });
}

// Blokken schuiven zacht in beeld; de puntjes van de dot-koppen gaan aan
const revealItems = document.querySelectorAll('.reveal');

revealItems.forEach((item) => {
  const broers = [...item.parentElement.children].filter((el) => el.classList.contains('reveal'));
  item.style.setProperty('--vertraging', `${Math.max(broers.indexOf(item), 0) * 80}ms`);
});

if ('IntersectionObserver' in window && !geenBeweging) {
  const kijker = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      kijker.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((item) => kijker.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Hero: de buste zakt iets mee bij het scrollen
const heroFoto = document.querySelector('.hero__foto');

if (heroFoto && !geenBeweging) {
  let gepland = false;
  window.addEventListener('scroll', () => {
    if (gepland) return;
    gepland = true;
    requestAnimationFrame(() => {
      gepland = false;
      heroFoto.style.transform = `translateY(${Math.min(window.scrollY, 800) * 0.12}px)`;
    });
  }, { passive: true });
}

// Huidig jaar in de footer
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
