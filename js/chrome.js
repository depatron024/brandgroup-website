// 100x op home in platina: gepolijste randen en een pavé van diamanten die reageren op de muis.
// Gewone WebGL2 zonder bibliotheek. Werkt het niet, dan blijven de witte letters uit de SVG staan.
(() => {
  const canvas = document.querySelector('[data-fly-chrome]');
  const mark = document.querySelector('[data-fly-mark]');
  if (!canvas || !mark) return;

  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;

  const vorm = JSON.parse(document.querySelector('[data-fly]').dataset.maat);
  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vert = `#version 300 es
  in vec2 p;
  void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

  const frag = `#version 300 es
  precision highp float;
  uniform sampler2D afstand;
  uniform vec2 scherm;      // in schermpixels
  uniform vec2 oorsprong;   // lettercoordinaat linksboven
  uniform float schaal;     // schermpixels per lettereenheid
  uniform vec3 kaart;       // lettereenheid naar textuur: schaal, x, y
  uniform vec2 textuur;
  uniform float bereik;
  uniform vec2 muis;
  uniform float tijd;
  uniform vec3 opkomst;     // de 1, de nullen, de x
  uniform float staand;
  uniform float eenheid;    // lettereenheden ten opzichte van 2048 per em
  uniform vec2 grens;       // einde van de 1, begin van de x
  uniform float afschuining;
  uniform float steenMaat;
  uniform vec3 loep;        // midden (schermpixels) en straal; straal 0 = uit
  uniform vec3 glas;
  uniform vec3 tint;
  out vec4 kleur;

  float hash(vec2 v) { return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 omgeving(vec2 r) {
    float a = 0.5 + 0.5 * sin(r.y * 7.0 + sin(r.x * 4.0 + tijd * 0.25) * 1.6);
    float b = 0.5 + 0.5 * sin(r.y * 19.0 - r.x * 6.0);
    vec3 c = mix(vec3(0.03, 0.03, 0.04), vec3(1.0), pow(a, 3.0));
    return c + vec3(0.28) * pow(b, 6.0);
  }

  vec4 letters(vec2 px) {
    vec2 g = oorsprong + px / schaal;
    vec2 uv = (g * kaart.x + kaart.yz) / textuur;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { return vec4(0.0); }

    float t = texture(afstand, uv).r;
    float d = (t - 0.5) * 2.0 * bereik / kaart.x;
    float aa = max(fwidth(d), 0.001);
    float dekking = smoothstep(-aa, aa, d);
    if (dekking <= 0.0) { return vec4(0.0); }

    bool isX = staand > 0.5 ? g.y > 20.0 : g.x > grens.y;
    float op = isX ? opkomst.z : (g.x < grens.x ? opkomst.x : opkomst.y);

    vec2 e = 2.5 / textuur;
    vec2 helling = vec2(
      texture(afstand, uv + vec2(e.x, 0.0)).r - texture(afstand, uv - vec2(e.x, 0.0)).r,
      texture(afstand, uv + vec2(0.0, e.y)).r - texture(afstand, uv - vec2(0.0, e.y)).r
    );
    vec2 buiten = length(helling) > 0.0001 ? -normalize(helling) : vec2(0.0);

    float rand = clamp(d / afschuining, 0.0, 1.0);
    vec3 n = normalize(vec3(buiten * pow(1.0 - rand, 1.2) * 1.5, 1.0));
    vec2 kijk = (muis - 0.5) * 1.5;
    vec3 c = omgeving(n.xy * 1.6 + kijk + g * 0.00035 / eenheid);

    // Pavé: rijen stenen met een briljant geslepen patroon; elk vlak vangt het licht op zijn eigen moment
    float maat = steenMaat;
    vec2 q = g / vec2(maat, maat * 0.866);
    float rij = floor(q.y);
    q.x += mod(rij, 2.0) * 0.5;
    vec2 id = vec2(floor(q.x), rij);
    vec2 f = fract(q) - 0.5;
    f.y *= 0.866;
    float r = length(f);
    float steen = 1.0 - smoothstep(0.41, 0.48, r);
    float h = hash(id);
    float vlak = floor((atan(f.y, f.x) + 3.1416 + h * 6.0) / 6.2832 * 8.0);
    float b = hash(id + vlak * 3.17);
    float golf = sin(tijd * (0.6 + h * 1.5) + b * 30.0 + dot(muis, vec2(13.0, 9.0)) * 4.0);
    float licht = mix(0.3, 1.0, smoothstep(-0.25, 0.75, golf * 0.5 + b * 0.5));
    licht = mix(licht, licht * 0.8 + 0.14, 1.0 - smoothstep(0.13, 0.17, r));
    float flits = pow(max(0.0, golf), 40.0) * step(0.6, b);
    vec3 regenboog = 0.5 + 0.5 * cos(6.2832 * (b + vec3(0.0, 0.33, 0.67)));
    vec3 sc = vec3(0.92, 0.95, 1.0) * licht + vec3(1.0) * flits * 1.2 + regenboog * flits * 0.15;
    vec3 vlakKleur = mix(vec3(0.05, 0.05, 0.06), sc, steen);

    c = mix(c, vlakKleur, smoothstep(0.82, 1.0, rand));
    return vec4(c * dekking * op, dekking * op);
  }

  // De loep: binnen de cirkel zie je de letters vergroot, met een metalen rand
  void main() {
    vec2 px = vec2(gl_FragCoord.x, scherm.y - gl_FragCoord.y);
    vec2 dl = px - loep.xy;
    float r = length(dl);
    if (loep.z <= 0.0 || r > loep.z + 4.0) { kleur = letters(px); return; }
    float t = r / loep.z;
    vec4 l = letters(loep.xy + dl * (0.55 + 0.15 * t * t));
    vec4 binnen = l + vec4(glas, 1.0) * 0.92 * (1.0 - l.a);
    float w = max(loep.z * 0.045, 3.0);
    float ring = smoothstep(loep.z - w, loep.z - w * 0.5, r) * (1.0 - smoothstep(loep.z - 1.0, loep.z + 1.0, r));
    float binnenMasker = 1.0 - smoothstep(loep.z - w * 0.5 - 1.0, loep.z - w * 0.5, r);
    vec3 rand = omgeving(dl / loep.z * 1.4 + (muis - 0.5) * 2.0) * tint;
    kleur = binnen * binnenMasker + vec4(rand, 1.0) * ring;
  }`;

  function bouw(type, bron) {
    const s = gl.createShader(type);
    gl.shaderSource(s, bron);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, bouw(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, bouw(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ['afstand', 'scherm', 'oorsprong', 'schaal', 'kaart', 'textuur', 'bereik', 'muis', 'tijd', 'opkomst', 'staand', 'eenheid', 'grens', 'afschuining', 'steenMaat', 'loep', 'glas', 'tint'].forEach((n) => {
    u[n] = gl.getUniformLocation(prog, n);
  });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // Afstandsveld van de letters: blijft scherp als je er ver op inzoomt (Felzenszwalb)
  function afstandsVeld(vol, w, h) {
    const INF = 1e12;
    const n = Math.max(w, h);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    const lijn = new Float64Array(n);
    function transform(rooster) {
      const pas = (start, stap, len) => {
        for (let i = 0; i < len; i += 1) lijn[i] = rooster[start + i * stap];
        let k = 0;
        v[0] = 0;
        z[0] = -INF;
        z[1] = INF;
        for (let q = 1; q < len; q += 1) {
          let s;
          do {
            const m = v[k];
            s = (lijn[q] + q * q - lijn[m] - m * m) / (2 * q - 2 * m);
          } while (s <= z[k] && --k > -1);
          k += 1;
          v[k] = q;
          z[k] = s;
          z[k + 1] = INF;
        }
        k = 0;
        for (let q = 0; q < len; q += 1) {
          while (z[k + 1] < q) k += 1;
          const m = v[k];
          rooster[start + q * stap] = (q - m) * (q - m) + lijn[m];
        }
      };
      for (let x = 0; x < w; x += 1) pas(x, w, h);
      for (let y = 0; y < h; y += 1) pas(y * w, 1, w);
    }
    const binnen = new Float64Array(w * h);
    const buiten = new Float64Array(w * h);
    for (let i = 0; i < w * h; i += 1) {
      binnen[i] = vol[i] ? 0 : INF; // afstand tot de letter
      buiten[i] = vol[i] ? INF : 0; // afstand tot de lege ruimte
    }
    transform(binnen);
    transform(buiten);
    return { binnen, buiten };
  }

  // Haalt de trapjes uit het afstandsveld, zodat de gepolijste randen glad blijven
  function verzacht(veld, w, h) {
    const hulp = new Float32Array(veld.length);
    const straal = 2;
    for (let ronde = 0; ronde < 3; ronde += 1) {
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          let som = 0;
          for (let i = -straal; i <= straal; i += 1) som += veld[y * w + Math.min(w - 1, Math.max(0, x + i))];
          hulp[y * w + x] = som / (straal * 2 + 1);
        }
      }
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          let som = 0;
          for (let i = -straal; i <= straal; i += 1) som += hulp[Math.min(h - 1, Math.max(0, y + i)) * w + x];
          veld[y * w + x] = som / (straal * 2 + 1);
        }
      }
    }
  }

  let kaart = null;
  let bereik = 48;

  function maakTextuur(staand) {
    const paden = [...mark.querySelectorAll('.fly__glyph path')].map((p) => new Path2D(p.getAttribute('d')));
    const klein = window.innerWidth < 900;
    const w = vorm.woord;
    const b = staand ? { x0: w.links, x1: vorm.staand.rechts, y0: w.boven, y1: vorm.staand.onder } : { x0: w.links, x1: w.rechts, y0: w.boven, y1: w.onder };
    const breedte = klein ? 1024 : 2048;
    bereik = klein ? 40 : 64;
    const s = (breedte - bereik * 2 - 4) / (b.x1 - b.x0);
    const hoogte = Math.ceil((b.y1 - b.y0) * s + bereik * 2 + 4);
    const off = document.createElement('canvas');
    off.width = breedte;
    off.height = hoogte;
    const c = off.getContext('2d', { willReadFrequently: true });
    const ox = bereik + 2 - b.x0 * s;
    const oy = bereik + 2 - b.y0 * s;
    c.setTransform(s, 0, 0, s, ox, oy);
    paden.forEach((p, i) => {
      if (i === 3 && staand) {
        c.save();
        c.translate(vorm.staand.dx, vorm.staand.dy);
        c.fill(p);
        c.restore();
      } else {
        c.fill(p);
      }
    });
    const data = c.getImageData(0, 0, breedte, hoogte).data;
    const vol = new Uint8Array(breedte * hoogte);
    for (let i = 0; i < vol.length; i += 1) vol[i] = data[i * 4 + 3] > 127 ? 1 : 0;
    const { binnen, buiten } = afstandsVeld(vol, breedte, hoogte);
    const uit = new Float32Array(breedte * hoogte);
    for (let i = 0; i < uit.length; i += 1) {
      const d = Math.sqrt(buiten[i]) - Math.sqrt(binnen[i]);
      uit[i] = Math.max(0, Math.min(1, (d / bereik) * 0.5 + 0.5));
    }
    verzacht(uit, breedte, hoogte);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, breedte, hoogte, 0, gl.RED, gl.FLOAT, uit);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    kaart = { s, ox, oy, breedte, hoogte, staand };
  }

  let dpr = 1;
  function maatCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const muis = { x: 0.5, y: 0.5, doelX: 0.5, doelY: 0.5 };
  const lens = { x: 0, y: 0, px: NaN, py: NaN, binnen: false };
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    lens.x = e.clientX - r.left;
    lens.y = e.clientY - r.top;
    lens.binnen = lens.x >= 0 && lens.y >= 0 && lens.x <= r.width && lens.y <= r.height && r.bottom > 0;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { lens.binnen = false; });
  window.addEventListener('pointermove', (e) => {
    muis.doelX = e.clientX / window.innerWidth;
    muis.doelY = e.clientY / window.innerHeight;
  }, { passive: true });

  const start = performance.now();
  const opkomst = (nu, vanaf) => {
    if (stil) return 1;
    const v = Math.min(Math.max((nu - start - vanaf) / 700, 0), 1);
    return 1 - Math.pow(1 - v, 3);
  };

  function teken(nu) {
    // Zonder scrollscène (minder beweging) past het woordbeeld onderaan in het scherm
    let beeld = window.honderdX;
    if (!beeld) {
      const r = canvas.getBoundingClientRect();
      const [vx, vy, vb, vh] = mark.getAttribute('viewBox').split(' ').map(Number); // zelfde kader als de SVG
      const schaal = Math.min(r.width / vb, r.height / vh);
      beeld = { schaal, x0: vx - (r.width / schaal - vb) / 2, y0: vy - (r.height / schaal - vh), staand: false, klaar: false };
    }
    if (!kaart || kaart.staand !== beeld.staand) maakTextuur(beeld.staand);

    muis.x += (muis.doelX - muis.x) * 0.08;
    muis.y += (muis.doelY - muis.y) * 0.08;
    const tijd = (nu - start) / 1000;
    // Op de telefoon beweegt het licht vanzelf
    const mx = muis.x + Math.sin(tijd * 0.5) * 0.12;
    const my = muis.y + Math.cos(tijd * 0.37) * 0.12;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(u.afstand, 0);
    gl.uniform2f(u.scherm, canvas.width, canvas.height);
    gl.uniform2f(u.oorsprong, beeld.x0, beeld.y0);
    gl.uniform1f(u.schaal, beeld.schaal * dpr);
    gl.uniform3f(u.kaart, kaart.s, kaart.ox, kaart.oy);
    gl.uniform2f(u.textuur, kaart.breedte, kaart.hoogte);
    gl.uniform1f(u.bereik, bereik);
    gl.uniform2f(u.muis, mx, my);
    gl.uniform1f(u.tijd, tijd);
    gl.uniform3f(u.opkomst, opkomst(nu, 0), opkomst(nu, 350), opkomst(nu, 700));
    gl.uniform1f(u.staand, beeld.staand ? 1 : 0);
    gl.uniform1f(u.eenheid, vorm.upm / 2048);
    gl.uniform2f(u.grens, vorm.grens[0], vorm.grens[1]);
    gl.uniform1f(u.afschuining, vorm.bevel);
    gl.uniform1f(u.steenMaat, vorm.steen || 1);
    gl.uniform3f(u.glas, 0.035, 0.035, 0.045);
    gl.uniform3f(u.tint, 1.0, 1.0, 1.0);

    // Loep: volgt de muis boven het woordbeeld, anders glijdt hij rustig over de letters
    const r = canvas.getBoundingClientRect();
    const w = vorm.woord;
    // Zonder muis gaat de loep langs drie plekken met metaal: de 1, de rand van de tweede 0 en het kruis van de x
    const hoogte = w.onder - w.boven;
    const plekken = [
      [(w.links + vorm.grens[0]) / 2, w.boven + hoogte * 0.5],
      [vorm.nul.x - vorm.nul.a * 1.3, vorm.nul.y],
      [(vorm.grens[1] + w.rechts) / 2 + (beeld.staand ? vorm.staand.dx : 0), w.onder - hoogte * 0.32 + (beeld.staand ? vorm.staand.dy : 0)],
    ];
    const [gx, gy] = plekken[Math.floor(tijd / 3) % 3];
    const doelX = lens.binnen ? lens.x : (gx - beeld.x0) * beeld.schaal;
    const doelY = lens.binnen ? lens.y : (gy - beeld.y0) * beeld.schaal;
    if (Number.isNaN(lens.px)) { lens.px = doelX; lens.py = doelY; }
    const tempo = lens.binnen ? 0.18 : 0.05;
    lens.px += (doelX - lens.px) * tempo;
    lens.py += (doelY - lens.py) * tempo;
    const zichtbaar = stil || (beeld.zoom || 0) > 0.02 ? 0 : Math.min(1, (nu - start - 1600) / 600);
    const straal = Math.min(r.width, r.height) * (r.width < 700 ? 0.2 : 0.14) * Math.max(0, zichtbaar);
    gl.uniform3f(u.loep, lens.px * dpr, lens.py * dpr, straal * dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function lus(nu) {
    const r = canvas.getBoundingClientRect();
    const beeld = window.honderdX;
    if (r.bottom > 0 && !(beeld && beeld.klaar)) teken(nu);
    else gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(lus);
  }

  maatCanvas();
  window.addEventListener('resize', () => {
    maatCanvas();
    if (stil) teken(performance.now());
  });
  mark.classList.add('has-chrome');
  if (stil) teken(performance.now());
  else requestAnimationFrame(lus);
})();
