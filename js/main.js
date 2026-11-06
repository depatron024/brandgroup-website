const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const beperk = (waarde, min, max) => Math.min(Math.max(waarde, min), max);

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

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) zetMenu(false);
  });
}

// Home: vliegen door de tweede nul van 100x.
// De SVG blijft scherp doordat we de viewBox verzetten in plaats van te schalen.
// js/chrome.js leest window.honderdX om de iced-out letters op dezelfde plek te tekenen.
const fly = document.querySelector('[data-fly]');

if (fly && !geenBeweging) {
  const mark = fly.querySelector('[data-fly-mark]');
  const letterX = fly.querySelector('[data-fly-x]');
  const intro = fly.querySelector('[data-fly-intro]');
  const statement = fly.querySelector('[data-fly-statement]');
  const nul = { x: 2195, y: -880, a: 87, b: 572 }; // midden en halve maten van de opening in de nul
  let maat = null;
  let gepland = false;

  function meet() {
    const b = mark.parentElement.clientWidth;
    const h = mark.parentElement.clientHeight;
    const staand = b < 700; // op de telefoon staat de x onder de 100
    letterX.setAttribute('transform', staand ? 'translate(-972 1560)' : '');
    const woord = staand ? { links: 25, rechts: 2661, boven: -1776, onder: 1560 } : { links: 25, rechts: 3633, boven: -1776, onder: 16 };
    const marge = staand ? 16 : 32;
    const vrij = h - (staand ? 230 : 130) - marge;
    const start = Math.min((b - marge * 2) / (woord.rechts - woord.links), vrij / (woord.onder - woord.boven));
    const breedte = (woord.rechts - woord.links) * start;
    // Waar het midden van de nul op het scherm staat aan het begin
    const beginX = (b - breedte) / 2 + (nul.x - woord.links) * start;
    const beginY = h - marge - (woord.onder - nul.y) * start;
    // Eindschaal: de opening van de nul bedekt het hele scherm
    const eind = Math.hypot(b / 2 / nul.a, h / 2 / nul.b) * 1.25;
    maat = { b, h, start, eind, beginX, beginY, staand };
  }

  function teken() {
    gepland = false;
    if (!maat) meet();
    const { b, h, start, eind, beginX, beginY, staand } = maat;
    const rect = fly.getBoundingClientRect();
    const p = beperk(-rect.top / (rect.height - h), 0, 1);
    const zoom = beperk(p / 0.72, 0, 1);
    const z = zoom * zoom * (3 - 2 * zoom);
    const schaal = start * Math.pow(eind / start, z);
    const cx = beginX + (b / 2 - beginX) * z;
    const cy = beginY + (h / 2 - beginY) * z;
    const x0 = nul.x - cx / schaal;
    const y0 = nul.y - cy / schaal;
    mark.setAttribute('viewBox', `${x0} ${y0} ${b / schaal} ${h / schaal}`);
    mark.style.visibility = zoom >= 1 ? 'hidden' : 'visible';
    window.honderdX = { x0, y0, schaal, staand, klaar: zoom >= 1 };

    const introUit = beperk(p / 0.12, 0, 1);
    intro.style.opacity = String(1 - introUit);
    intro.style.visibility = introUit >= 1 ? 'hidden' : 'visible';
    const tekst = beperk((p - 0.7) / 0.14, 0, 1);
    statement.style.opacity = String(tekst);
    statement.style.transform = `translateY(${(1 - tekst) * 32}px) scale(${1.15 - 0.15 * tekst})`;
  }

  function vraagTeken() {
    if (!gepland) {
      gepland = true;
      requestAnimationFrame(teken);
    }
  }

  mark.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  fly.classList.add('is-flying');
  window.addEventListener('scroll', vraagTeken, { passive: true });
  window.addEventListener('resize', () => {
    meet();
    vraagTeken();
  });
  teken();
}

// De vermenigvuldiger: van één tegel naar de hele foto
const multiplier = document.querySelector('[data-multiplier]');

if (multiplier) {
  const mosaic = multiplier.querySelector('[data-mosaic]');
  const range = multiplier.querySelector('[data-multiplier-range]');
  const waarde = multiplier.querySelector('[data-multiplier-value]');
  const stappen = [...multiplier.querySelectorAll('[data-stage]')];
  const tegels = [];

  // 100 diamanten; ze gaan aan vanuit het midden
  for (let rij = 0; rij < 10; rij += 1) {
    for (let kolom = 0; kolom < 10; kolom += 1) {
      const steen = document.createElement('i');
      steen.className = 'mosaic__tile';
      tegels.push({ el: steen, afstand: Math.hypot(kolom - 4.5, rij - 4.5) + ((rij * 7 + kolom * 3) % 5) * 0.1 });
      mosaic.appendChild(steen);
    }
  }
  tegels.sort((a, b) => a.afstand - b.afstand);

  function zetWaarde(n) {
    tegels.forEach((t, i) => t.el.classList.toggle('is-on', i < n));
    waarde.textContent = String(n);
    range.value = String(n);
    range.setAttribute('aria-valuetext', `${n} times`);
    range.style.setProperty('--vulling', `${n}%`);
    let actief = stappen[0];
    stappen.forEach((s) => { if (n >= Number(s.dataset.stage)) actief = s; });
    stappen.forEach((s) => s.classList.toggle('is-active', s === actief));
  }

  let aangeraakt = false;
  range.addEventListener('input', () => {
    aangeraakt = true;
    zetWaarde(Number(range.value));
  });

  if (geenBeweging || !('IntersectionObserver' in window)) {
    zetWaarde(100);
  } else {
    // Speelt één keer af als de sectie in beeld komt, en stopt zodra iemand zelf schuift
    zetWaarde(1);
    const kijker = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      kijker.disconnect();
      const begin = performance.now();
      const duur = 3200;

      function speel(nu) {
        if (aangeraakt) return;
        const v = Math.min((nu - begin) / duur, 1);
        zetWaarde(Math.max(1, Math.round(100 * v * v)));
        if (v < 1) requestAnimationFrame(speel);
      }

      requestAnimationFrame(speel);
    }, { threshold: 0.4 });
    kijker.observe(mosaic);
  }
}

// Grote namen: de actieve regel bepaalt het beeld rechts
document.querySelectorAll('[data-index]').forEach((index) => {
  const links = [...index.querySelectorAll('[data-preview]')];
  const beelden = [...index.querySelector('.index__frame').children];

  function kies(link) {
    links.forEach((l) => l.classList.toggle('is-active', l === link));
    beelden.forEach((b, i) => b.classList.toggle('is-active', i === Number(link.dataset.preview)));
  }

  links.forEach((link) => {
    link.addEventListener('pointerenter', () => kies(link));
    link.addEventListener('focus', () => kies(link));
  });
});

// Blokken schuiven zacht in beeld; blokken in dezelfde groep net na elkaar
const revealItems = document.querySelectorAll('.reveal');

revealItems.forEach((item) => {
  const broers = [...item.parentElement.children].filter((el) => el.classList.contains('reveal'));
  item.style.setProperty('--vertraging', `${Math.max(broers.indexOf(item), 0) * 80}ms`);
});

if ('IntersectionObserver' in window && !geenBeweging) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Grote regels schuiven horizontaal mee met het scrollen
const loudRijen = [...document.querySelectorAll('[data-loud]')];

if (loudRijen.length && !geenBeweging) {
  let loudGepland = false;

  function zetLoud() {
    loudGepland = false;
    loudRijen.forEach((rij) => {
      const r = rij.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const v = (r.top - window.innerHeight) / window.innerHeight;
      const richting = Number(rij.dataset.loud);
      rij.style.transform = `translateX(${richting > 0 ? v * 22 : -30 - v * 22}%)`;
    });
  }

  window.addEventListener('scroll', () => {
    if (!loudGepland) {
      loudGepland = true;
      requestAnimationFrame(zetLoud);
    }
  }, { passive: true });
  zetLoud();
}

// Track record: de tijdlijn speelt af terwijl je scrolt (terug scrollen spoelt terug)
const tracker = document.querySelector('[data-tracker]');

if (tracker) {
  const blokjes = [...tracker.children];
  const label = document.querySelector('[data-tracker-label]');
  const hoogtepunten = [...document.querySelectorAll('.highlight[data-month]')];

  hoogtepunten.forEach((h) => {
    const blokje = blokjes[Number(h.dataset.month) - 1];
    if (blokje) blokje.classList.add('is-milestone');
  });

  function toonTijdlijn(gevuld) {
    blokjes.forEach((b, i) => {
      b.classList.toggle('is-filled', i < gevuld);
      b.classList.toggle('is-current', gevuld < blokjes.length && i === gevuld - 1);
    });
    hoogtepunten.forEach((h) => h.classList.toggle('is-active', Number(h.dataset.month) <= gevuld));
    if (label) label.textContent = gevuld >= blokjes.length ? 'Now' : `Month ${Math.max(gevuld, 1)}`;
  }

  if (geenBeweging) {
    toonTijdlijn(blokjes.length);
  } else {
    let tijdlijnGepland = false;

    // Begint als de tijdlijn op 85% van het scherm staat, klaar op 35%
    function updateTijdlijn() {
      tijdlijnGepland = false;
      const boven = tracker.getBoundingClientRect().top;
      const h = window.innerHeight;
      const voortgang = beperk((h * 0.85 - boven) / (h * 0.5), 0, 1);
      toonTijdlijn(Math.round(voortgang * blokjes.length));
    }

    window.addEventListener('scroll', () => {
      if (!tijdlijnGepland) {
        tijdlijnGepland = true;
        requestAnimationFrame(updateTijdlijn);
      }
    }, { passive: true });
    window.addEventListener('resize', updateTijdlijn);
    updateTijdlijn();
  }
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
  const opmaak = (w) => prefix + w.toLocaleString('en-GB', {
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
