const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Delen van elke sectie komen na elkaar binnen (kop, tekst, beeld)
const groepen = [
  ['.hero', ['.hero__line', '.hero__lead']],
  ['.brands', ['.brands__title', '.brands__note']],
  ['.routes', ['.routes__title', '.routes__lead', '.feature']],
  ['.partners', ['.partners__title', '.partners__lead', '.partners__group']],
  ['.founder', ['.founder__title', '.founder__bio', '.reveal-button', '.founder__facts p', '.founder__portrait']],
  ['.site-footer', ['.site-footer__title', '.site-footer__links li']],
];

const delen = [];
groepen.forEach(([groep, kinderen]) => {
  document.querySelectorAll(groep).forEach((blok) => {
    blok.querySelectorAll(kinderen.join(',')).forEach((el, i) => {
      el.setAttribute('data-enter', '');
      el.style.setProperty('--i', i);
      delen.push(el);
    });
  });
});

if (geenBeweging || !('IntersectionObserver' in window)) {
  delen.forEach((el) => el.classList.add('is-in'));
} else {
  const kijker = new IntersectionObserver((items) => {
    items.forEach((item) => {
      if (item.isIntersecting) {
        item.target.classList.add('is-in');
        kijker.unobserve(item.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  delen.forEach((el) => kijker.observe(el));
}

// Founder: de knop laat even iets meer zien en zegt dan "nog niet"
const knop = document.querySelector('[data-reveal-button]');
const antwoord = document.querySelector('[data-reveal-answer]');
const portret = document.querySelector('[data-portrait]');
const antwoorden = ['Not yet.', 'Still not yet.', 'Soon. Not today.'];
let keer = 0;

if (knop && antwoord && portret) {
  knop.addEventListener('click', () => {
    antwoord.textContent = antwoorden[Math.min(keer, antwoorden.length - 1)];
    keer += 1;
    portret.classList.add('is-peeking');
    knop.classList.remove('is-denied');
    void knop.offsetWidth;
    knop.classList.add('is-denied');
    window.setTimeout(() => portret.classList.remove('is-peeking'), 900);
  });
}

// Merken: zoals de verhalen op slash.com. Eén kaart is breed en zoomt langzaam in;
// elke 7 seconden schuift hij door, of als je op een andere kaart klikt.
const verhalen = document.querySelector('[data-stories]');
if (verhalen) {
  const kaarten = [...verhalen.querySelectorAll('[data-story]')];
  const panelen = [...document.querySelectorAll('[data-panel]')];
  let actief = 0;
  let klok = null;
  const toon = (n) => {
    actief = n;
    kaarten.forEach((k, i) => {
      k.classList.toggle('is-active', i === n);
      k.setAttribute('aria-pressed', String(i === n));
    });
    panelen.forEach((p, i) => { p.hidden = i !== n; });
  };
  const start = () => {
    if (geenBeweging) return;
    clearInterval(klok);
    klok = setInterval(() => toon((actief + 1) % kaarten.length), 7000);
  };
  kaarten.forEach((k, i) => k.addEventListener('click', () => { toon(i); start(); }));
  verhalen.addEventListener('mouseenter', () => clearInterval(klok));
  verhalen.addEventListener('mouseleave', start);
  start();
}

// Footer: de 100x-chain hangt aan de bovenrand en zwaait als je er met de muis langs gaat
// (of hem op de telefoon aantikt). Een simpele slinger met demping.
const chain = document.querySelector('[data-chain]');
if (chain && !geenBeweging) {
  let hoek = 0;
  let snelheid = 0;
  let loopt = false;
  const veer = 0.018;
  const demping = 0.985;

  const tik = () => {
    snelheid += -hoek * veer;
    snelheid *= demping;
    hoek += snelheid;
    hoek = Math.max(-0.7, Math.min(0.7, hoek));
    chain.style.setProperty('--zwaai', hoek.toFixed(4) + 'rad');
    if (Math.abs(hoek) > 0.0005 || Math.abs(snelheid) > 0.0005) {
      requestAnimationFrame(tik);
    } else {
      hoek = 0; snelheid = 0; loopt = false;
      chain.style.setProperty('--zwaai', '0rad');
    }
  };
  const duw = (kracht) => {
    snelheid += kracht;
    if (!loopt) { loopt = true; requestAnimationFrame(tik); }
  };

  chain.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') duw(Math.max(-0.02, Math.min(0.02, e.movementX * 0.0008)));
  });
  chain.addEventListener('pointerdown', () => duw(Math.random() < 0.5 ? -0.05 : 0.05));
}
