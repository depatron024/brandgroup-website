// Sectiestijlen: scroll-effecten, zwevend beeld, magnetische knop en lichtbundel.
document.documentElement.classList.add('js');
const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lichtbundel volgt de muis
document.querySelectorAll('[data-licht]').forEach((el) => {
  if (rustig) return;
  el.addEventListener('pointermove', (e) => {
    const b = el.getBoundingClientRect();
    el.style.setProperty('--x', `${((e.clientX - b.left) / b.width) * 100}%`);
    el.style.setProperty('--y', `${((e.clientY - b.top) / b.height) * 100}%`);
  });
});

// Hoe ver een element door het scherm is gescrold (0 tot 1)
const voortgang = (el, start = 1, eind = 0) => {
  const b = el.getBoundingClientRect();
  const h = window.innerHeight;
  const van = h * start;
  const tot = h * eind - b.height;
  return Math.min(1, Math.max(0, (van - b.top) / (van - tot)));
};

const oplicht = [...document.querySelectorAll('[data-oplicht]')].map((s) => ({ s, woorden: [...s.querySelectorAll('.s-oplicht__tekst span')] }));
const banden = [...document.querySelectorAll('[data-band] > div')];
const horizontaal = [...document.querySelectorAll('[data-horizontaal]')];
const lijnen = [...document.querySelectorAll('[data-lijn]')];
const parallax = [...document.querySelectorAll('[data-parallax]')];
let bandPos = 0;
let vorigeY = window.scrollY;
let extra = 0;

function frame() {
  const y = window.scrollY;
  extra = extra * 0.9 + Math.abs(y - vorigeY) * 0.3;
  vorigeY = y;

  oplicht.forEach(({ s, woorden }) => {
    const p = voortgang(s, 0.85, 0.35);
    const n = Math.round(p * woorden.length * 1.15);
    woorden.forEach((w, i) => w.classList.toggle('is-aan', i < n));
  });

  bandPos += 0.5 + extra;
  banden.forEach((b, i) => {
    const w = b.offsetWidth / 2 || 1;
    const x = (bandPos % w) * (i % 2 ? 1 : -1) - (i % 2 ? w : 0);
    b.style.transform = `translateX(${x}px)`;
  });

  horizontaal.forEach((s) => {
    const spoor = s.querySelector('[data-spoor]');
    const b = s.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -b.top / (b.height - window.innerHeight)));
    spoor.style.transform = `translateX(${-p * Math.max(0, spoor.scrollWidth - window.innerWidth)}px)`;
  });

  lijnen.forEach((l) => l.style.setProperty('--voortgang', voortgang(l, 0.8, 0.4).toFixed(3)));

  parallax.forEach((img) => {
    const b = img.parentElement.getBoundingClientRect();
    img.style.transform = `translateY(${(b.top + b.height / 2 - window.innerHeight / 2) * -0.15}px)`;
  });

  if (!rustig) requestAnimationFrame(frame);
}
if (rustig) {
  oplicht.forEach(({ woorden }) => woorden.forEach((w) => w.classList.add('is-aan')));
} else {
  requestAnimationFrame(frame);
}

// Zwevend beeld bij de index
const zweef = document.querySelector('[data-zweef]');
if (zweef) {
  const img = zweef.querySelector('img');
  document.querySelectorAll('.s-index__lijst li').forEach((li) => {
    li.addEventListener('pointerenter', () => { img.src = li.dataset.beeld; zweef.classList.add('is-aan'); });
    li.addEventListener('pointerleave', () => zweef.classList.remove('is-aan'));
    li.addEventListener('pointermove', (e) => { zweef.style.left = `${e.clientX}px`; zweef.style.top = `${e.clientY}px`; });
  });
}

// Magnetische knop
document.querySelectorAll('[data-magneet]').forEach((k) => {
  if (rustig) return;
  k.addEventListener('pointermove', (e) => {
    const b = k.getBoundingClientRect();
    k.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.3}px, ${(e.clientY - b.top - b.height / 2) * 0.4}px)`;
  });
  k.addEventListener('pointerleave', () => { k.style.transform = ''; });
});
