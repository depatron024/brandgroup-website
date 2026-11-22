const geenBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero-beeld opent als een sluiter zodra de pagina er is
const sluiter = document.querySelector('.shutter');
if (sluiter) {
  requestAnimationFrame(() => requestAnimationFrame(() => sluiter.classList.add('is-open')));
}

// Delen van elke sectie komen na elkaar binnen (kop, tekst, beeld)
const groepen = [
  ['.hero__text', ['.hero__line', '.hero__lead']],
  ['.ledger', ['.ledger__title', '.ledger__row']],
  ['.brand', ['.brand__small', '.brand__title', '.brand__text']],
  ['.founder', ['.founder__title', '.founder__bio', '.reveal-button', '.founder__facts p', '.founder__portrait']],
  ['.site-footer', ['.site-footer__title', '.site-footer__links li', '.site-footer__name']],
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
