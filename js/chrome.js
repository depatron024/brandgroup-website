// 100x op home in goud: gepolijste randen en geborsteld metaal dat reageert op de muis.
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
  out vec4 kleur;

  float hash(vec2 v) { return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 omgeving(vec2 r) {
    float a = 0.5 + 0.5 * sin(r.y * 7.0 + sin(r.x * 4.0 + tijd * 0.25) * 1.6);
    float b = 0.5 + 0.5 * sin(r.y * 19.0 - r.x * 6.0);
    vec3 c = mix(vec3(0.03, 0.03, 0.04), vec3(1.0), pow(a, 3.0));
    return c + vec3(0.28) * pow(b, 6.0);
  }

  void main() {
    vec2 px = vec2(gl_FragCoord.x, scherm.y - gl_FragCoord.y);
    vec2 g = oorsprong + px / schaal;
    vec2 uv = (g * kaart.x + kaart.yz) / textuur;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { kleur = vec4(0.0); return; }

    float t = texture(afstand, uv).r;
    float d = (t - 0.5) * 2.0 * bereik / kaart.x;
    float aa = max(fwidth(d), 0.001);
    float dekking = smoothstep(-aa, aa, d);
    if (dekking <= 0.0) { kleur = vec4(0.0); return; }

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
    vec3 c;

    // Goud: warme overgang met een geborstelde glans die meebeweegt
    vec2 v = n.xy * 1.7 + kijk + g * 0.0009 / eenheid;
    float a = 0.5 + 0.5 * sin(v.y * 4.5 + v.x * 2.0 + sin(v.x * 2.6 + tijd * 0.18) * 1.3);
    vec3 goud = mix(vec3(0.27, 0.16, 0.06), vec3(0.79, 0.61, 0.3), smoothstep(0.0, 0.6, a));
    goud = mix(goud, vec3(1.0, 0.93, 0.74), smoothstep(0.78, 1.0, a));
    goud *= 0.97 + 0.03 * sin(g.y / eenheid * 1.4 + hash(vec2(floor(g.y / eenheid * 0.5), 3.0)) * 6.0);
    c = goud;
    kleur = vec4(c * dekking * op, dekking * op);
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
  ['afstand', 'scherm', 'oorsprong', 'schaal', 'kaart', 'textuur', 'bereik', 'muis', 'tijd', 'opkomst', 'staand', 'eenheid', 'grens', 'afschuining', 'steenMaat'].forEach((n) => {
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
