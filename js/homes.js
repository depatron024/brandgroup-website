// Vijf homepage-richtingen: gedeelde stippen-motor, licht en reveal.
document.documentElement.classList.add('js');
const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const muis = { x: -9999, y: -9999 };

function zichtbaar(el, aan, uit) {
  new IntersectionObserver(([e]) => (e.isIntersecting ? aan() : uit && uit()), { rootMargin: '100px' }).observe(el);
}

const buste = new Image();
buste.src = 'images/richtingen/buste.webp';
const klaar = Promise.all([
  buste.decode().catch(() => new Promise((r) => (buste.onload = r))),
  document.fonts.load('128px "Instrument Serif"'),
]);

// Ketting en hanger in buste-coördinaten (1000 x 1500)
function tekenKetting(ctx, k, ox, oy, extra = 0) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(k, k);
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 9 + extra;
  ctx.setLineDash(extra ? [] : [15, 5]);
  ctx.beginPath();
  ctx.moveTo(300, 870);
  ctx.bezierCurveTo(340, 1010, 430, 1085, 505, 1088);
  ctx.bezierCurveTo(580, 1085, 668, 1010, 708, 870);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 6 + extra;
  ctx.beginPath();
  ctx.arc(505, 1100, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '128px "Instrument Serif"';
  ctx.textAlign = 'center';
  if (extra) { ctx.lineWidth = extra * 1.6; ctx.strokeText('100x', 505, 1222); }
  ctx.fillText('100x', 505, 1222);
  ctx.restore();
}

/* ---------- Puntenwolk: buste + ketting als stippen die op je muis reageren ---------- */
function puntenwolk(canvas, opties) {
  const ctx = canvas.getContext('2d');
  let punten = [];
  let W = 0;
  let H = 0;
  let loopt = false;
  let rust = 0;

  function bouw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { k, ox, oy } = opties.plaats(W, H);
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true });
    o.drawImage(buste, ox, oy, 1000 * k, 1500 * k);
    const beeld = o.getImageData(0, 0, W, H).data;
    o.clearRect(0, 0, W, H);
    if (opties.ketting || opties.uitsparen) tekenKetting(o, k, ox, oy, opties.uitsparen ? 14 : 0);
    const juweel = o.getImageData(0, 0, W, H).data;

    const stap = opties.stap(W);
    const oud = punten;
    punten = [];
    const voeg = (x, y, r, soort) => {
      const vorige = oud[punten.length];
      const begin = vorige || (opties.stof ? { x: Math.random() * W, y: Math.random() * H } : { x, y });
      punten.push({ x: begin.x, y: begin.y, hx: x, hy: y, vx: 0, vy: 0, r, soort, fase: Math.random() * 6.28, snel: 0.6 + Math.random() * 2.4 });
    };
    for (let y = stap / 2; y < H; y += stap) {
      const rij = Math.round(y / stap) % 2;
      for (let x = stap / 2 + (rij ? stap / 2 : 0); x < W; x += stap) {
        const i = (Math.floor(y) * W + Math.floor(x)) * 4;
        if (juweel[i + 3] > 100) continue;
        if (beeld[i + 3] < 120) continue;
        const l = beeld[i] / 255;
        const r = opties.straal(l, stap);
        if (r > 0.35) voeg(x, y, r, 0);
      }
    }
    if (opties.ketting) {
      const fijn = Math.max(stap * 0.55, 2.6);
      for (let y = 0; y < H; y += fijn) {
        for (let x = 0; x < W; x += fijn) {
          const i = (Math.floor(y) * W + Math.floor(x)) * 4;
          if (juweel[i + 3] > 100) voeg(x, y, fijn * 0.42, 1);
        }
      }
    }
    rust = 0;
    start();
  }

  function stap(t) {
    const rect = canvas.getBoundingClientRect();
    const mx = muis.x - rect.left;
    const my = muis.y - rect.top;
    const R = opties.bereik || 110;
    let beweging = 0;
    ctx.clearRect(0, 0, W, H);

    const paden = [new Path2D(), new Path2D()];
    const glim = new Path2D();
    for (const p of punten) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / R) * 5;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx = (p.vx + (p.hx - p.x) * 0.045) * 0.84;
      p.vy = (p.vy + (p.hy - p.y) * 0.045) * 0.84;
      p.x += p.vx;
      p.y += p.vy;
      beweging += Math.abs(p.vx) + Math.abs(p.vy);
      if (p.soort === 1 && Math.sin(t * 0.001 * p.snel + p.fase) > 0.93) {
        glim.moveTo(p.x + p.r * 2.2, p.y);
        glim.arc(p.x, p.y, p.r * 2.2, 0, 6.283);
      } else {
        paden[p.soort].moveTo(p.x + p.r, p.y);
        paden[p.soort].arc(p.x, p.y, p.r, 0, 6.283);
      }
    }
    ctx.fillStyle = opties.kleur;
    ctx.fill(paden[0]);
    if (opties.ketting) {
      ctx.fillStyle = opties.juweelKleur || '#ffffff';
      ctx.fill(paden[1]);
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fill(glim);
      ctx.restore();
    }
    rust = beweging < punten.length * 0.02 ? rust + 1 : 0;
    // Zonder ketting en zonder beweging mag de lus stoppen
    if (!opties.ketting && rust > 30) { loopt = false; return; }
    if (loopt) requestAnimationFrame(stap);
  }

  function start() {
    if (loopt || rustig) { if (rustig) { loopt = true; stap(0); loopt = false; } return; }
    loopt = true;
    requestAnimationFrame(stap);
  }

  klaar.then(() => {
    bouw();
    zichtbaar(canvas, start, () => (loopt = false));
    window.addEventListener('pointermove', () => { rust = 0; if (!loopt && canvas.getBoundingClientRect().bottom > 0) start(); }, { passive: true });
    let wacht;
    window.addEventListener('resize', () => { clearTimeout(wacht); wacht = setTimeout(bouw, 200); });
  });
}

window.addEventListener('pointermove', (e) => { muis.x = e.clientX; muis.y = e.clientY; }, { passive: true });


const plaatsen = {
  // A: grote buste rechts
  rechts: (W, H) => {
    if (W < 900) {
      const k = Math.min((H * 0.62) / 1500, (W * 1.1) / 1000);
      return { k, ox: W / 2 - 500 * k, oy: H * 0.08 };
    }
    const k = Math.min((H * 0.98) / 1500, (W * 0.95) / 1000);
    return { k, ox: W * 0.66 - 500 * k, oy: H - 1440 * k };
  },
  // E: buste in het midden, als sfeer
  midden: (W, H) => {
    const k = Math.min((H * 1.05) / 1500, (W * 0.9) / 1000);
    return { k, ox: W / 2 - 500 * k, oy: H - 1440 * k };
  },
  // C: buste vult het vak
  vak: (W) => ({ k: W / 1000, ox: 0, oy: 0 }),
};
const zachtLicht = (l, s) => s * 0.54 * Math.pow(Math.max(0, (l - 0.3) / 0.7), 1.8);

document.querySelectorAll('[data-wolk]').forEach((c) => {
  const soort = c.dataset.wolk;
  if (soort === 'stof') puntenwolk(c, { stof: true, ketting: true, kleur: 'rgba(214,218,226,.82)', stap: (W) => (W < 700 ? 4.4 : 5.4), straal: zachtLicht, plaats: plaatsen.rechts });
  if (soort === 'sfeer') puntenwolk(c, { stof: true, kleur: 'rgba(170,185,215,.7)', stap: (W) => (W < 700 ? 5 : 6.5), straal: zachtLicht, plaats: plaatsen.midden, bereik: 140 });
  if (soort === 'inkt') puntenwolk(c, { kleur: '#141210', uitsparen: true, stap: () => 4.6, bereik: 60, straal: (l, s) => s * 0.56 * Math.sqrt(Math.max(0, 1 - l * 0.92)), plaats: plaatsen.vak });
});

// B: lichtbundel volgt de muis
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
