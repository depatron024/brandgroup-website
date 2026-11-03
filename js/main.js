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
  navToggle.addEventListener('click', () => {
    zetMenu(!siteNav.classList.contains('is-open'));
  });

  // Menu sluiten na klikken op een link
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) zetMenu(false);
  });
}

// Hero: de grote "100x" telt op van 1x naar 100x (zonder JS of met minder beweging blijft "100x" staan)
const heroTeller = document.querySelector('[data-hero-counter]');

if (heroTeller && !geenBeweging) {
  const duur = 2400;
  const start = performance.now();

  function heroStap(nu) {
    const voortgang = Math.min((nu - start) / duur, 1);
    const waarde = Math.max(1, Math.round(100 * (1 - Math.pow(1 - voortgang, 3))));
    heroTeller.textContent = waarde + 'x';
    if (voortgang < 1) requestAnimationFrame(heroStap);
    else heroTeller.classList.add('is-done');
  }

  heroTeller.textContent = '1x';
  requestAnimationFrame(heroStap);
} else if (heroTeller) {
  heroTeller.classList.add('is-done');
}

// Hero: de "100x" zakt mee en vervaagt bij het scrollen (parallax)
const hero = document.querySelector('.hero');

if (heroTeller && hero && !geenBeweging) {
  let gepland = false;

  function zetParallax() {
    gepland = false;
    const y = Math.min(window.scrollY, hero.offsetHeight);
    heroTeller.style.transform = `translate(-50%, calc(-52% + ${y * 0.35}px)) scale(${1 + y * 0.0003})`;
    heroTeller.style.opacity = String(Math.max(0, 1 - y / (hero.offsetHeight * 0.9)));
  }

  window.addEventListener('scroll', () => {
    if (!gepland) {
      gepland = true;
      requestAnimationFrame(zetParallax);
    }
  }, { passive: true });
}

// Blokken schuiven zacht in beeld; kaarten naast elkaar net na elkaar
document.querySelectorAll('.brands, .tiles, .team, .highlights').forEach((groep) => {
  groep.querySelectorAll('.reveal').forEach((item, i) => item.style.setProperty('--vertraging', `${i * 90}ms`));
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !geenBeweging) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Tabs bij "How we build", ook met pijltjestoetsen te bedienen
const tabs = [...document.querySelectorAll('.tab')];

function kiesTab(tab) {
  tabs.forEach((t) => {
    const actief = t === tab;
    t.setAttribute('aria-selected', String(actief));
    t.tabIndex = actief ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !actief;
  });
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => kiesTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const stap = event.key === 'ArrowRight' ? 1 : -1;
    const volgende = tabs[(i + stap + tabs.length) % tabs.length];
    kiesTab(volgende);
    volgende.focus();
  });
});

// Rollende band: lijst verdubbelen zodat hij naadloos doorloopt
const band = document.querySelector('.band__track');

if (band && !geenBeweging) {
  [...band.children].forEach((item) => {
    const kopie = item.cloneNode(true);
    kopie.setAttribute('aria-hidden', 'true');
    band.appendChild(kopie);
  });
  band.classList.add('is-looping');
}

// Tellers: getal loopt op tot de waarde in data-counter (leeg = "—" blijft staan)
function telOp(el) {
  const doel = Number(el.dataset.counter);
  if (!el.dataset.counter || Number.isNaN(doel)) return;

  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimalen = (el.dataset.counter.split('.')[1] || '').length;
  const opmaak = (waarde) => prefix + waarde.toLocaleString('en-GB', {
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

const tellers = document.querySelectorAll('[data-counter]');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      telOp(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  tellers.forEach((el) => observer.observe(el));
} else {
  tellers.forEach(telOp);
}

// Huidig jaar in de footer
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
