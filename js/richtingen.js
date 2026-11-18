// Vergelijkingspagina met tien richtingen. Alles hier is alleen voor de keuze.
const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const muis = { x: -9999, y: -9999 };

// Alleen animeren wat in beeld is
function zichtbaar(el, aan, uit) {
  new IntersectionObserver(([e]) => (e.isIntersecting ? aan() : uit && uit()), { rootMargin: '100px' }).observe(el);
}

/* ---------- Buste laden ---------- */
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

// 1 · Dust to diamond: grote buste, rechts op desktop
const stof = document.querySelector('[data-wolk="stof"]');
if (stof) {
  puntenwolk(stof, {
    stof: true,
    ketting: true,
    kleur: 'rgba(214, 218, 226, 0.82)',
    stap: (W) => (W < 700 ? 4.4 : 5.4),
    straal: (l, s) => s * 0.54 * Math.pow(Math.max(0, (l - 0.3) / 0.7), 1.8),
    plaats: (W, H) => {
      const k = Math.min((H * 0.97) / 1500, (W * 0.95) / 1000);
      const cx = W > 900 ? W * 0.62 : W * 0.5;
      return { k, ox: cx - 500 * k, oy: H - 1440 * k };
    },
  });
}

// 3 · Members: buste in de boog
const boog = document.querySelector('[data-wolk="boog"]');
if (boog) {
  puntenwolk(boog, {
    ketting: true,
    kleur: 'rgba(225, 227, 232, 0.9)',
    stap: () => 4.5,
    bereik: 70,
    straal: (l, s) => s * 0.54 * Math.pow(Math.max(0, (l - 0.3) / 0.7), 1.8),
    plaats: (W, H) => {
      const k = (W * 1.12) / 1000;
      return { k, ox: (W - 1000 * k) / 2, oy: H - 1440 * k };
    },
  });
}

// 5 · Monument: inktstippen op papier, de SVG-ketting ligt erover
const inkt = document.querySelector('[data-wolk="inkt"]');
if (inkt) {
  puntenwolk(inkt, {
    kleur: '#141210',
    uitsparen: true,
    stap: () => 4.6,
    bereik: 60,
    straal: (l, s) => s * 0.56 * Math.sqrt(Math.max(0, 1 - l * 0.92)),
    plaats: (W) => ({ k: W / 1000, ox: 0, oy: 0 }),
  });
}

/* ---------- 2 · Lichtbundel volgt je muis ---------- */
const r2 = document.querySelector('.r2');
if (r2 && !rustig) {
  r2.addEventListener('pointermove', (e) => {
    const b = r2.getBoundingClientRect();
    r2.style.setProperty('--x', `${((e.clientX - b.left) / b.width) * 100}%`);
    r2.style.setProperty('--y', `${((e.clientY - b.top) / b.height) * 100}%`);
  });
}

/* ---------- 4 · De munt ---------- */
const munt = document.querySelector('[data-munt]');
if (munt) {
  let om = false;
  let rx = 0;
  let ry = 0;
  const zet = () => { munt.style.transform = `rotateY(${(om ? 180 : 0) + rx}deg) rotateX(${ry}deg)`; };
  const draai = () => {
    om = !om;
    munt.style.transition = 'transform .9s cubic-bezier(.2,.8,.2,1)';
    zet();
    setTimeout(() => (munt.style.transition = 'transform .25s ease-out'), 900);
  };
  munt.addEventListener('click', draai);
  munt.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); draai(); } });
  const r4 = document.querySelector('.r4');
  if (!rustig) {
    r4.addEventListener('pointermove', (e) => {
      const b = r4.getBoundingClientRect();
      rx = ((e.clientX - b.left) / b.width - 0.5) * 36;
      ry = -((e.clientY - b.top) / b.height - 0.5) * 24;
      zet();
    });
  }

  // Achterkant: 100x geslagen in stippen
  const achter = document.querySelector('[data-wolk="munt"]');
  const tekenAchter = () => {
    const c = achter.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const S = achter.clientWidth;
    if (!S) return;
    achter.width = achter.height = S * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const off = document.createElement('canvas');
    off.width = off.height = S;
    const o = off.getContext('2d', { willReadFrequently: true });
    o.font = `${S * 0.36}px "Instrument Serif"`;
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillText('100x', S / 2, S * 0.5);
    o.lineWidth = S * 0.012;
    o.beginPath();
    o.arc(S / 2, S / 2, S * 0.43, 0, Math.PI * 2);
    o.stroke();
    const d = o.getImageData(0, 0, S, S).data;
    const s = S / 90;
    for (let y = s / 2; y < S; y += s) {
      for (let x = s / 2; x < S; x += s) {
        if (d[(Math.floor(y) * S + Math.floor(x)) * 4 + 3] < 120) continue;
        c.fillStyle = 'rgba(255,255,255,.9)';
        c.beginPath(); c.arc(x - s * 0.08, y - s * 0.08, s * 0.36, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(30,32,38,.75)';
        c.beginPath(); c.arc(x + s * 0.06, y + s * 0.06, s * 0.3, 0, 6.283); c.fill();
      }
    }
  };
  klaar.then(tekenAchter);
  window.addEventListener('resize', () => klaar.then(tekenAchter));
}

/* ---------- 7 · Klapbord ---------- */
const bord = document.querySelector('[data-bord]');
if (bord) {
  const tekens = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const vakjes = [...bord.querySelectorAll('[data-flap]')].map((el) => {
    const doel = el.dataset.flap.replace(/#/g, '█');
    el.className = 'flap';
    el.innerHTML = [...doel].map(() => '<i></i>').join('');
    return { cellen: [...el.children], doel };
  });
  const klap = (vak) => {
    vak.cellen.forEach((cel, i) => {
      const eind = vak.doel[i] === ' ' ? '' : vak.doel[i];
      if (rustig) { cel.textContent = eind; return; }
      let n = 6 + Math.floor(Math.random() * 10) + i;
      const tik = () => {
        if (n-- <= 0) { cel.textContent = eind; return; }
        cel.textContent = tekens[Math.floor(Math.random() * tekens.length)];
        setTimeout(tik, 45);
      };
      tik();
    });
  };
  let gestart = false;
  zichtbaar(bord, () => {
    if (gestart) return;
    gestart = true;
    vakjes.forEach(klap);
    if (!rustig) {
      setInterval(() => {
        const rij = 1 + Math.floor(Math.random() * 5);
        vakjes.slice(rij * 4 - 4, rij * 4).forEach(klap);
      }, 3200);
    }
  });
}

/* ---------- 8 · Index: beeld volgt je muis ---------- */
const voorbeeld = document.querySelector('[data-voorbeeld]');
if (voorbeeld) {
  const img = voorbeeld.querySelector('img');
  document.querySelectorAll('.r8__lijst li').forEach((li) => {
    li.addEventListener('pointerenter', () => { img.src = li.dataset.beeld; voorbeeld.classList.add('is-aan'); });
    li.addEventListener('pointerleave', () => voorbeeld.classList.remove('is-aan'));
    li.addEventListener('pointermove', (e) => { voorbeeld.style.left = `${e.clientX + 150}px`; voorbeeld.style.top = `${e.clientY}px`; });
  });
}

/* ---------- 9 · Film ---------- */
const lichten = document.querySelector('[data-lichten]');
if (lichten) {
  const kleuren = ['#ffb347', '#ffd9a0', '#ffffff', '#ff4d3d', '#8fb6ff', '#ffcf6b', '#ff7a45'];
  let html = '';
  for (let i = 0; i < 34; i += 1) {
    const g = 30 + Math.random() * 160;
    html += `<i style="left:${Math.random() * 130}%;top:${30 + Math.random() * 50}%;width:${g}px;height:${g}px;background:${kleuren[i % kleuren.length]};opacity:${0.25 + Math.random() * 0.6};animation-duration:${18 + Math.random() * 30}s;animation-direction:${i % 2 ? 'alternate' : 'alternate-reverse'}"></i>`;
  }
  lichten.innerHTML = html;

  const tc = document.querySelector('[data-tijdcode]');
  const ondertitel = document.querySelector('[data-ondertitel]');
  const regels = [
    'Two in the morning. The city is still awake.',
    'So are we.',
    'We build consumer brands from zero.',
    'We buy the ones that fit.',
    'We advise founders with the systems we use ourselves.',
    'And we back brands we believe in.',
    'One hundred times.',
  ];
  let regel = 0;
  const begin = performance.now();
  zichtbaar(lichten, () => {
    if (tc.dataset.loopt) return;
    tc.dataset.loopt = '1';
    setInterval(() => {
      const t = (performance.now() - begin) / 1000;
      const f = Math.floor((t % 1) * 24);
      const p = (n) => String(Math.floor(n)).padStart(2, '0');
      tc.textContent = `${p(t / 3600)}:${p((t / 60) % 60)}:${p(t % 60)}:${p(f)}`;
    }, 42);
    const toon = () => { ondertitel.textContent = regels[regel % regels.length]; regel += 1; };
    toon();
    setInterval(toon, 2600);
  });
}

/* ---------- 10 · Lopende banden ---------- */
const banden = [...document.querySelectorAll('[data-band]')];
if (banden.length && !rustig) {
  const sporen = banden.map((b) => {
    const spoor = b.querySelector('.band__spoor');
    for (let i = 0; i < 3; i += 1) b.appendChild(spoor.cloneNode(true));
    return { b, sporen: [...b.children], richting: parseFloat(b.dataset.band), pos: 0 };
  });
  let laatsteY = window.scrollY;
  let extra = 0;
  let aan = false;
  const lus = () => {
    const dy = Math.abs(window.scrollY - laatsteY);
    laatsteY = window.scrollY;
    extra = extra * 0.9 + dy * 0.25;
    sporen.forEach((s) => {
      const w = s.sporen[0].offsetWidth;
      s.pos = (s.pos + (0.6 + extra) * s.richting) % w;
      const x = s.richting > 0 ? -s.pos : -w + (-s.pos % w);
      s.sporen.forEach((el) => (el.style.transform = `translateX(${x}px)`));
    });
    if (aan) requestAnimationFrame(lus);
  };
  zichtbaar(banden[0].parentElement, () => { if (!aan) { aan = true; requestAnimationFrame(lus); } }, () => (aan = false));
}

/* ---------- Nummer rechts licht op ---------- */
const sprongen = [...document.querySelectorAll('.sprong a')];
const kijk = new IntersectionObserver((items) => {
  items.forEach((it) => {
    if (it.isIntersecting) sprongen.forEach((a) => a.classList.toggle('is-actief', a.getAttribute('href') === `#${it.target.id}`));
  });
}, { threshold: 0.5 });
document.querySelectorAll('.r').forEach((r) => kijk.observe(r));
