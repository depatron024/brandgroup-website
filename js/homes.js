// Homepage-richtingen: tabs voor Build / Buy / Invest en zacht inschuiven.
document.documentElement.classList.add('js');

document.querySelectorAll('[role="tablist"]').forEach((lijst) => {
  const wrap = lijst.parentElement;
  const tabs = [...lijst.querySelectorAll('[data-tab]')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.toggle('is-aan', t === tab));
    wrap.querySelectorAll('[data-paneel]').forEach((p) => p.classList.toggle('is-aan', p.dataset.paneel === tab.dataset.tab));
  }));
});

const rv = document.querySelectorAll('.sectie .rand > *');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  rv.forEach((el) => el.classList.add('rv'));
  const kijk = new IntersectionObserver((items) => items.forEach((it) => {
    if (it.isIntersecting) { it.target.classList.add('is-in'); kijk.unobserve(it.target); }
  }), { threshold: 0.1 });
  rv.forEach((el) => kijk.observe(el));
}
