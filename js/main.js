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
  const vorm = JSON.parse(fly.dataset.maat); // maten van de letters, per lettertype
  const { nul } = vorm;
  let maat = null;
  let gepland = false;

  function meet() {
    const b = mark.parentElement.clientWidth;
    const h = mark.parentElement.clientHeight;
    const staand = b < 700; // op de telefoon staat de x onder de 100
    letterX.setAttribute('transform', staand ? `translate(${vorm.staand.dx} ${vorm.staand.dy})` : '');
    const woord = staand ? { ...vorm.woord, rechts: vorm.staand.rechts, onder: vorm.staand.onder } : vorm.woord;
    const marge = staand ? 16 : 32;
    const vrij = h - (staand ? 230 : vorm.reserve) - marge;
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
    statement.style.transform = `translateY(${(1 - tekst) * 24}px)`;
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
    const vooruit = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    if (!vooruit && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const stap = vooruit ? 1 : -1;
    const volgende = tabs[(i + stap + tabs.length) % tabs.length];
    kiesTab(volgende);
    volgende.focus();
  });
});

// Wisselaar: schuift vanzelf door tot iemand hem aanraakt
const wisselaar = document.querySelector('[data-switch]');

if (wisselaar && tabs.length && !geenBeweging) {
  let huidig = 0;
  const klok = setInterval(() => {
    if (document.hidden) return;
    const r = wisselaar.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    huidig = (huidig + 1) % tabs.length;
    kiesTab(tabs[huidig]);
  }, 4500);
  ['pointerdown', 'pointerenter', 'focusin'].forEach((soort) => wisselaar.addEventListener(soort, () => clearInterval(klok)));
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

// Golf van merkkaarten: de kaarten bij je muis (of vinger) komen omhoog en draaien naar je toe
document.querySelectorAll('[data-cardwall]').forEach((wand) => {
  const rij = wand.querySelector('[data-cardwall-row]');
  const kaarten = [...rij.children];
  kaarten.forEach((k, i) => k.style.setProperty('--i', i));
  if (geenBeweging) return;

  let doelX = null; // muispositie ten opzichte van het midden, in pixels
  let x = 0;
  let zichtbaar = false;
  const start = performance.now();

  wand.addEventListener('pointermove', (e) => {
    const r = wand.getBoundingClientRect();
    doelX = e.clientX - r.left - r.width / 2;
  });
  wand.addEventListener('pointerleave', () => { doelX = null; });

  function stap(nu) {
    if (!zichtbaar) return;
    const afstand = parseFloat(getComputedStyle(wand).getPropertyValue('--kaart-afstand-px')) || 64;
    const t = (nu - start) / 1000;
    // Zonder muis komen de vier echte kaarten (de middelste) om de beurt naar voren
    const beurt = 5 + (Math.floor(t / 2.6) % 4);
    const doel = doelX ?? (beurt - 6.5) * afstand;
    x += (doel - x) * 0.08;
    kaarten.forEach((k, i) => {
      const pos = (i - 6.5) * afstand;
      const d = (pos - x) / (afstand * 1.6);
      const til = Math.exp(-d * d);
      // De kaarten naast de gekozen kaart schuiven opzij, zodat hij helemaal vrij komt
      const opzij = afstand * 1.3 * Math.tanh((pos - x) / (afstand * 0.9));
      k.style.transform = `translateX(${pos + opzij}px) translateX(-50%) translateY(${-til * 60}px) rotateY(${-30 + til * 30}deg) scale(${1 + til * 0.1})`;
      k.style.zIndex = String(Math.round(til * 100));
    });
    requestAnimationFrame(stap);
  }

  new IntersectionObserver((entries) => {
    zichtbaar = entries[0].isIntersecting;
    if (zichtbaar) requestAnimationFrame(stap);
  }).observe(wand);
});

// Draaiend wiel: tabs links bepalen welke kaart vooraan staat; slepen draait het wiel ook
document.querySelectorAll('[data-revolver]').forEach((blok) => {
  const wiel = blok.querySelector('[data-wheel]');
  const knoppen = [...blok.querySelectorAll('.revolver__tab')];
  [...wiel.children].forEach((k, i) => k.style.setProperty('--i', i));
  let hoek = 0;
  let doelHoek = 0;
  let actief = 0;
  let aangeraakt = false;

  function kies(i, focus) {
    actief = (i + knoppen.length) % knoppen.length;
    knoppen.forEach((k, j) => {
      const aan = j === actief;
      k.setAttribute('aria-selected', String(aan));
      k.tabIndex = aan ? 0 : -1;
      document.getElementById(k.getAttribute('aria-controls')).hidden = !aan;
    });
    if (focus) knoppen[actief].focus();
    // Kortste weg naar de gekozen kaart
    const gewenst = -actief * 120;
    doelHoek = gewenst + Math.round((doelHoek - gewenst) / 360) * 360;
  }

  knoppen.forEach((k, i) => {
    k.addEventListener('click', () => { aangeraakt = true; kies(i); });
    k.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      aangeraakt = true;
      kies(actief + (e.key === 'ArrowRight' ? 1 : -1), true);
    });
  });

  // Slepen over het wiel
  const podium = blok.querySelector('.revolver__stage');
  let sleepVan = null;
  podium.addEventListener('pointerdown', (e) => { sleepVan = e.clientX; aangeraakt = true; podium.setPointerCapture(e.pointerId); });
  podium.addEventListener('pointermove', (e) => {
    if (sleepVan === null) return;
    doelHoek += (e.clientX - sleepVan) * 0.4;
    sleepVan = e.clientX;
  });
  podium.addEventListener('pointerup', () => {
    sleepVan = null;
    kies(Math.round(-doelHoek / 120));
  });

  if (geenBeweging) {
    wiel.style.transform = 'rotateX(-14deg) rotateY(0deg)';
    return;
  }

  setInterval(() => {
    if (aangeraakt || document.hidden) return;
    const r = blok.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    kies(actief + 1);
  }, 4500);

  function draai() {
    hoek += (doelHoek - hoek) * 0.08;
    wiel.style.transform = `rotateX(-14deg) rotateY(${hoek}deg)`;
    requestAnimationFrame(draai);
  }
  requestAnimationFrame(draai);
});

// Bewijs: het beeld achter de vaste kaart schuift door terwijl je scrolt
const pin = document.querySelector('[data-pin]');

if (pin && !geenBeweging) {
  const beeld = pin.querySelector('[data-pin-beeld]');
  let pinGepland = false;

  function zetPin() {
    pinGepland = false;
    const r = pin.getBoundingClientRect();
    const p = beperk(-r.top / Math.max(r.height - window.innerHeight, 1), 0, 1);
    beeld.style.transform = `translateY(${(0.5 - p) * 30}%) scale(${1.05 + p * 0.15})`;
  }

  window.addEventListener('scroll', () => {
    if (!pinGepland) {
      pinGepland = true;
      requestAnimationFrame(zetPin);
    }
  }, { passive: true });
  zetPin();
}

// 100x bouwt zich op uit duizenden puntjes, in het tempo van het scrollen
const dotsBlok = document.querySelector('[data-dots]');

if (dotsBlok) {
  const canvas = dotsBlok.querySelector('[data-dots-canvas]');
  const bron = dotsBlok.querySelector('[data-dots-bron]');
  const ctx = canvas.getContext('2d');
  const kleur = getComputedStyle(document.documentElement).getPropertyValue('--kleur-accent').trim();
  let punten = [];
  let breedte = 0;
  let hoogte = 0;
  let dpr = 1;

  function maakPunten() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    breedte = canvas.clientWidth;
    hoogte = canvas.clientHeight;
    canvas.width = breedte * dpr;
    canvas.height = hoogte * dpr;

    // Waar staan de letters? Teken ze klein en lees de pixels uit
    const [vx, vy, vb, vh] = bron.getAttribute('viewBox').split(' ').map(Number);
    const doelB = Math.min(breedte * 0.86, (hoogte * 0.55) * (vb / vh));
    const s = doelB / vb;
    const ox = (breedte - doelB) / 2;
    const oy = hoogte * 0.38 - (vh * s) / 2;
    const stap = 3;
    const proef = document.createElement('canvas');
    proef.width = Math.ceil(breedte / stap);
    proef.height = Math.ceil(hoogte / stap);
    const pc = proef.getContext('2d');
    pc.setTransform(s / stap, 0, 0, s / stap, (ox - vx * s) / stap, (oy - vy * s) / stap);
    bron.querySelectorAll('path').forEach((p) => pc.fill(new Path2D(p.getAttribute('d'))));
    const data = pc.getImageData(0, 0, proef.width, proef.height).data;
    const doelen = [];
    for (let y = 0; y < proef.height; y += 1) {
      for (let x = 0; x < proef.width; x += 1) {
        if (data[(y * proef.width + x) * 4 + 3] > 128) doelen.push([x * stap, y * stap]);
      }
    }

    // Startpunten: zachte golven over de hele breedte
    punten = doelen.map(([tx, ty], i) => {
      const sx = Math.random() * breedte;
      const golf = Math.sin(sx / breedte * Math.PI * 3 + (i % 5)) * hoogte * 0.18;
      return {
        sx,
        sy: hoogte * 0.45 + golf + (Math.random() - 0.5) * hoogte * 0.25,
        tx,
        ty,
        wacht: Math.random() * 0.35,
        r: 1 + Math.random() * 1.2,
      };
    });
  }

  function teken(p, t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, breedte, hoogte);
    ctx.fillStyle = kleur;
    punten.forEach((pt) => {
      const q = beperk((p - pt.wacht) / 0.55, 0, 1);
      const e = q * q * (3 - 2 * q);
      const tril = (1 - e) * Math.sin(t * 1.5 + pt.sx) * 6;
      const x = pt.sx + (pt.tx - pt.sx) * e;
      const y = pt.sy + (pt.ty - pt.sy) * e + tril;
      ctx.globalAlpha = 0.45 + e * 0.55;
      ctx.fillRect(x, y, pt.r, pt.r);
    });
  }

  maakPunten();
  window.addEventListener('resize', maakPunten);

  if (geenBeweging) {
    teken(1, 0);
  } else {
    let zichtbaar = false;
    function lus(nu) {
      if (!zichtbaar) return;
      const r = dotsBlok.getBoundingClientRect();
      const p = beperk(-r.top / Math.max(r.height - window.innerHeight, 1) * 1.25, 0, 1);
      teken(p, nu / 1000);
      requestAnimationFrame(lus);
    }
    new IntersectionObserver((entries) => {
      zichtbaar = entries[0].isIntersecting;
      if (zichtbaar) requestAnimationFrame(lus);
    }).observe(dotsBlok);
  }
}

// Huidig jaar in de footer
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
