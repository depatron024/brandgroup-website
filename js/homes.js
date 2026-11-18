// Homepage-richtingen: lichtbundel volgt de muis, blokken schuiven zacht in beeld.
document.documentElement.classList.add('js');
const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-licht]').forEach((el) => {
  if (rustig) return;
  el.addEventListener('pointermove', (e) => {
    const b = el.getBoundingClientRect();
    el.style.setProperty('--x', `${((e.clientX - b.left) / b.width) * 100}%`);
    el.style.setProperty('--y', `${((e.clientY - b.top) / b.height) * 100}%`);
  });
});

const rv = document.querySelectorAll('.rv');
if ('IntersectionObserver' in window && !rustig) {
  const kijk = new IntersectionObserver((items) => items.forEach((it) => {
    if (!it.isIntersecting) return;
    it.target.classList.add('is-in');
    kijk.unobserve(it.target);
  }), { threshold: 0.12 });
  rv.forEach((el) => kijk.observe(el));
} else {
  rv.forEach((el) => el.classList.add('is-in'));
}
