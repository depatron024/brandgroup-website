const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const beperk = (waarde, min, max) => Math.min(Math.max(waarde, min), max);
const zacht = (t) => t * t * (3 - 2 * t);

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

// Blokken schuiven zacht in beeld; blokken in dezelfde groep net na elkaar
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

// Voortgang van een hoge sectie met een vaste stage: 0 bovenaan, 1 onderaan
function voortgang(el) {
  const r = el.getBoundingClientRect();
  return beperk(-r.top / Math.max(r.height - window.innerHeight, 1), 0, 1);
}

function opScroll(fn) {
  let gepland = false;
  const run = () => { gepland = false; fn(); };
  window.addEventListener('scroll', () => {
    if (!gepland) { gepland = true; requestAnimationFrame(run); }
  }, { passive: true });
  window.addEventListener('resize', run);
  run();
}

// De kluis: het wiel draait, de bouten gaan los, de deur zwaait open en de lade schuift naar voren
const kluis = document.querySelector('[data-kluis]');

if (kluis) {
  const deur = kluis.querySelector('[data-deur]');
  const front = kluis.querySelector('[data-front]');
  const binnenkant = kluis.querySelector('.kluis__binnen');
  const wiel = kluis.querySelector('[data-wiel]');
  const bouten = [...kluis.querySelectorAll('.bout')];
  bouten.forEach((b, i) => b.style.setProperty('--h', `${i * (360 / bouten.length)}deg`));

  function zet(p) {
    const draai = zacht(beperk(p / 0.25, 0, 1));
    const open = zacht(beperk((p - 0.25) / 0.3, 0, 1));
    const door = zacht(beperk((p - 0.5) / 0.25, 0, 1)); // door het gat naar binnen
    front.style.transform = `scale(${1 + door * 5})`;
    front.style.opacity = String(1 - beperk((door - 0.6) / 0.4, 0, 1));
    binnenkant.style.transform = `scale(${1.25 - door * 0.25})`;
    wiel.style.transform = `rotate(${draai * 300}deg)`;
    deur.style.setProperty('--bout-uit', `${draai * 14}px`);
    deur.style.transform = `rotateY(${-112 * open}deg) translateX(${open * -4}%)`;
    kluis.classList.toggle('is-open', open > 0.5);
    kluis.classList.toggle('is-lade', p > 0.8);
  }

  if (geenBeweging) zet(1);
  else opScroll(() => zet(voortgang(kluis)));
}

// Black card: kantelt mee met je muis, klik draait hem om
const bcard = document.querySelector('[data-bcard]');

if (bcard) {
  const binnen = bcard.querySelector('[data-bcard-binnen]');
  const glans = bcard.querySelector('[data-bcard-glans]');
  const hero = document.querySelector('[data-bhero]');
  let om = false;
  let doel = { x: 0, y: 0 };
  let nu = { x: 0, y: 0 };

  bcard.addEventListener('click', () => {
    om = !om;
    bcard.setAttribute('aria-label', om ? 'Turn the card back' : 'Turn the card');
  });

  if (!geenBeweging) {
    hero.addEventListener('pointermove', (e) => {
      const r = bcard.getBoundingClientRect();
      doel = {
        x: beperk((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1),
        y: beperk((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1),
      };
    });
    hero.addEventListener('pointerleave', () => { doel = { x: 0, y: 0 }; });
  }

  const start = performance.now();
  function lus(t) {
    // Zonder muis wiegt de kaart heel licht
    const rust = geenBeweging ? 0 : Math.sin((t - start) / 1400) * 0.25;
    nu.x += ((doel.x || rust) - nu.x) * 0.08;
    nu.y += (doel.y - nu.y) * 0.08;
    binnen.style.transform = `rotateY(${(om ? 180 : 0) + nu.x * 16}deg) rotateX(${-nu.y * 12}deg)`;
    glans.style.transform = `translateZ(1px) translateX(${nu.x * 18}%)`;
    requestAnimationFrame(lus);
  }
  requestAnimationFrame(lus);
}

// De wallet: per stuk scrollen komt de volgende kaart uit het vak
const wallet = document.querySelector('[data-wallet]');

if (wallet) {
  const kaarten = [...wallet.querySelectorAll('[data-wallet-kaart]')];
  const items = [...wallet.querySelectorAll('[data-wallet-item]')];
  let vorige = -1;

  function zet(p) {
    const n = kaarten.length;
    const actief = Math.min(n - 1, Math.floor(p * n));
    const binnenStap = p * n - actief;
    kaarten.forEach((k, i) => {
      let t;
      if (i < actief) {
        const plek = actief - i;
        t = `translate(${-18 - plek * 6}%, ${-62 - plek * 3}%) rotate(${-8 - plek * 3}deg) scale(${1 - plek * 0.05})`;
      } else if (i === actief) {
        const op = zacht(beperk(binnenStap / 0.4, 0, 1));
        t = `translate(${op * 4}%, ${-8 - op * 56}%) rotate(${op * 2}deg)`;
      } else {
        t = `translateY(${-(n - i) * 6}%)`;
      }
      k.style.transform = t;
      k.style.zIndex = String(i <= actief ? 20 + i : 5 + n - i);
    });
    if (actief !== vorige) {
      items.forEach((it, i) => it.classList.toggle('is-actief', i === actief));
      vorige = actief;
    }
  }

  if (geenBeweging) zet(0.99);
  else opScroll(() => zet(voortgang(wallet)));
}

// Huidig jaar in de footer
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
