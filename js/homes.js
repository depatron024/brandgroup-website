// Vijf homepage-richtingen: stippen-100x, wereldbol van stippen, lichtbundel en reveal.
document.documentElement.classList.add('js');
const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const muis = { x: -9999, y: -9999 };
window.addEventListener('pointermove', (e) => { muis.x = e.clientX; muis.y = e.clientY; }, { passive: true });

function zichtbaar(el, aan, uit) {
  new IntersectionObserver(([e]) => (e.isIntersecting ? aan() : uit && uit()), { rootMargin: '100px' }).observe(el);
}

function maatCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H };
}

/* ---------- 100x van duizenden stippen die wegspatten voor je muis ---------- */
function stippen100x(canvas, opties) {
  let punten = [];
  let ctx;
  let W = 0;
  let H = 0;
  let loopt = false;

  function bouw() {
    ({ ctx, W, H } = maatCanvas(canvas));
    if (!W || !H) return;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true });
    const { x, y, grootte } = opties.plaats(W, H);
    o.font = `${grootte}px "Instrument Serif"`;
    o.textBaseline = 'alphabetic';
    o.fillText('100x', x, y);
    const data = o.getImageData(0, 0, W, H).data;
    const stap = opties.stap(W);
    const oud = punten;
    punten = [];
    for (let py = stap / 2; py < H; py += stap) {
      const rij = Math.round(py / stap) % 2;
      for (let px = stap / 2 + (rij ? stap / 2 : 0); px < W; px += stap) {
        if (data[(Math.floor(py) * W + Math.floor(px)) * 4 + 3] < 128) continue;
        const v = oud[punten.length];
        const begin = v || { x: Math.random() * W, y: Math.random() * H };
        punten.push({ x: begin.x, y: begin.y, hx: px, hy: py, vx: 0, vy: 0, r: stap * (0.28 + Math.random() * 0.16), fase: Math.random() * 6.28, snel: 0.5 + Math.random() * 2.5 });
      }
    }
    start();
  }

  function frame(t) {
    const b = canvas.getBoundingClientRect();
    const mx = muis.x - b.left;
    const my = muis.y - b.top;
    const R = opties.bereik || 120;
    ctx.clearRect(0, 0, W, H);
    const pad = new Path2D();
    const glim = new Path2D();
    for (const p of punten) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / R) * 6;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx = (p.vx + (p.hx - p.x) * 0.05) * 0.84;
      p.vy = (p.vy + (p.hy - p.y) * 0.05) * 0.84;
      p.x += p.vx;
      p.y += p.vy;
      if (Math.sin(t * 0.0012 * p.snel + p.fase) > 0.985) {
        glim.moveTo(p.x + p.r * 2.4, p.y);
        glim.arc(p.x, p.y, p.r * 2.4, 0, 6.283);
      } else {
        pad.moveTo(p.x + p.r, p.y);
        pad.arc(p.x, p.y, p.r, 0, 6.283);
      }
    }
    ctx.fillStyle = opties.kleur;
    ctx.fill(pad);
    ctx.save();
    ctx.shadowColor = opties.glimKleur || '#ffffff';
    ctx.shadowBlur = 14;
    ctx.fillStyle = opties.glimKleur || '#ffffff';
    ctx.fill(glim);
    ctx.restore();
    if (loopt) requestAnimationFrame(frame);
  }

  function start() {
    if (rustig) { frame(0); return; }
    if (loopt) return;
    loopt = true;
    requestAnimationFrame(frame);
  }

  document.fonts.load('200px "Instrument Serif"').then(() => {
    bouw();
    zichtbaar(canvas, start, () => (loopt = false));
    let wacht;
    window.addEventListener('resize', () => { clearTimeout(wacht); wacht = setTimeout(bouw, 200); });
  });
}

/* ---------- Wereldbol van stippen: wereldwijd verkopen ---------- */
function wereldbol(canvas, opties) {
  let ctx;
  let W = 0;
  let H = 0;
  let loopt = false;
  const punten = [];
  const N = opties.aantal || 1600;
  const gulden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i += 1) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = gulden * i;
    punten.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  // Voorbeeldsteden (illustratief): lat, lon
  const steden = [[52.4, 4.9], [51.5, -0.1], [40.7, -74], [25.2, 55.3], [34, -118.2], [1.35, 103.8], [-33.9, 151.2], [48.9, 2.35], [35.7, 139.7]]
    .map(([lat, lon]) => {
      const f = (lat * Math.PI) / 180;
      const l = (lon * Math.PI) / 180;
      return [Math.cos(f) * Math.sin(l), Math.sin(f), Math.cos(f) * Math.cos(l)];
    });
  let kantel = 0.35;
  let draai = 0;

  function frame(t) {
    const b = canvas.getBoundingClientRect();
    const doel = 0.25 + ((muis.y - b.top) / (b.height || 1) - 0.5) * 0.5;
    if (Number.isFinite(doel) && muis.y > -9000) kantel += (doel - kantel) * 0.04;
    draai = rustig ? 0.6 : t * 0.00012 + ((muis.x - b.left) / (b.width || 1) - 0.5) * 0.4;
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) * (opties.schaal || 0.46);
    const cx = W / 2;
    const cy = H / 2;
    const cr = Math.cos(draai);
    const sr = Math.sin(draai);
    const ck = Math.cos(kantel);
    const sk = Math.sin(kantel);
    const zet = ([x, y, z]) => {
      const x1 = x * cr - z * sr;
      const z1 = x * sr + z * cr;
      const y2 = y * ck - z1 * sk;
      const z2 = y * sk + z1 * ck;
      return [cx + x1 * R, cy - y2 * R, z2];
    };
    const voor = new Path2D();
    const achter = new Path2D();
    for (const p of punten) {
      const [x, y, z] = zet(p);
      const r = z > 0 ? 1 + z * (opties.punt || 1.6) : 0.8;
      const pad = z > 0 ? voor : achter;
      pad.moveTo(x + r, y);
      pad.arc(x, y, r, 0, 6.283);
    }
    ctx.fillStyle = opties.kleur;
    ctx.globalAlpha = 0.22;
    ctx.fill(achter);
    ctx.globalAlpha = 1;
    ctx.fill(voor);
    steden.forEach((s, i) => {
      const [x, y, z] = zet(s);
      if (z < 0.05) return;
      const puls = ((t * 0.0006 + i * 0.37) % 1);
      ctx.beginPath();
      ctx.arc(x, y, 4 + puls * 22, 0, 6.283);
      ctx.strokeStyle = opties.accent;
      ctx.globalAlpha = (1 - puls) * 0.8;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, 6.283);
      ctx.fillStyle = opties.accent;
      ctx.fill();
    });
    if (loopt) requestAnimationFrame(frame);
  }

  function start() {
    if (rustig) { frame(0); return; }
    if (loopt) return;
    loopt = true;
    requestAnimationFrame(frame);
  }

  const bouw = () => { ({ ctx, W, H } = maatCanvas(canvas)); if (W && H) start(); };
  bouw();
  zichtbaar(canvas, start, () => (loopt = false));
  window.addEventListener('resize', bouw);
}

document.querySelectorAll('[data-stippen]').forEach((c) => {
  stippen100x(c, {
    kleur: 'rgba(222,226,234,.9)',
    stap: (W) => (W < 700 ? 4.2 : 6),
    plaats: (W, H) => {
      const grootte = Math.min(W * 0.56, H * 0.8);
      const breed = grootte * 1.56;
      return { grootte, x: (W - breed) / 2, y: H * (W < 700 ? 0.52 : 0.7) };
    },
  });
});

document.querySelectorAll('[data-bol]').forEach((c) => {
  const soort = c.dataset.bol;
  if (soort === 'inkt') wereldbol(c, { kleur: '#141210', accent: '#141210', schaal: 0.47, punt: 1.5 });
  if (soort === 'platina') wereldbol(c, { kleur: 'rgba(170,185,215,.75)', accent: '#e9ecf2', schaal: 0.44, aantal: 2600, punt: 1.4 });
});

// Lichtbundel volgt de muis
document.querySelectorAll('[data-licht]').forEach((el) => {
  if (rustig) return;
  el.addEventListener('pointermove', (e) => {
    const b = el.getBoundingClientRect();
    el.style.setProperty('--x', `${((e.clientX - b.left) / b.width) * 100}%`);
    el.style.setProperty('--y', `${((e.clientY - b.top) / b.height) * 100}%`);
  });
});

// Blokken schuiven zacht in beeld
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
