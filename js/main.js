const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Delen van elke sectie komen na elkaar binnen (kop, tekst, beeld)
const groepen = [
  ['.hero', ['.hero__line', '.hero__lead']],
  ['.stats', ['.stats__title', '.stat']],
  ['.brands', ['.brands__title', '.brands__note']],
  ['.routes', ['.routes__title', '.routes__lead', '.route']],
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

// Merken-carousel: schuift langzaam door, stopt bij hover, focus of aanraken.
// Zonder JS (of met minder beweging) is het een gewone rij die je zelf scrolt.
const carousel = document.querySelector('[data-carousel]');
if (carousel && !geenBeweging) {
  let pauze = false;
  let positie = carousel.scrollLeft;
  const stop = () => { pauze = true; };
  const verder = () => { pauze = false; positie = carousel.scrollLeft; };
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', verder);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', verder);
  carousel.addEventListener('touchstart', stop, { passive: true });
  carousel.addEventListener('touchend', () => window.setTimeout(verder, 1500), { passive: true });

  const kaarten = carousel.querySelectorAll('.brand-card');
  const lus = () => kaarten[kaarten.length / 2].offsetLeft - kaarten[0].offsetLeft;

  const stap = () => {
    const helft = lus();
    if (!pauze) {
      positie += 0.5;
      if (positie >= helft) positie -= helft;
      carousel.scrollLeft = positie;
    } else if (carousel.scrollLeft >= helft) {
      carousel.scrollLeft -= helft;
    }
    requestAnimationFrame(stap);
  };
  requestAnimationFrame(stap);
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
