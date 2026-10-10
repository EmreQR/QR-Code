/* Partagé par la page publique (index.html) et le studio (studio.html). */
(function (g) {
  'use strict';

  var SB_URL = 'https://gfhutyxwycwavdorxffl.supabase.co';
  var SB_KEY = 'sb_publishable_Dl9ioevpqYM_0XKxgd1QoA_Q0IC-DDD'; // clé publique, faite pour être visible

  /* [nom, paramètre Google Fonts, famille de secours] */
  var FONTS = [
    ['Bricolage Grotesque', 'Bricolage+Grotesque:wght@600;800', 'sans-serif'],
    ['Instrument Sans', 'Instrument+Sans:wght@400;600', 'sans-serif'],
    ['Anton', 'Anton', 'sans-serif'],
    ['Bebas Neue', 'Bebas+Neue', 'sans-serif'],
    ['Oswald', 'Oswald:wght@500;700', 'sans-serif'],
    ['Righteous', 'Righteous', 'sans-serif'],
    ['Rubik Mono One', 'Rubik+Mono+One', 'sans-serif'],
    ['Monoton', 'Monoton', 'sans-serif'],
    ['Press Start 2P', 'Press+Start+2P', 'monospace'],
    ['Space Mono', 'Space+Mono:wght@400;700', 'monospace'],
    ['Permanent Marker', 'Permanent+Marker', 'cursive'],
    ['Pacifico', 'Pacifico', 'cursive'],
    ['Lobster', 'Lobster', 'cursive'],
    ['Dancing Script', 'Dancing+Script:wght@600;700', 'cursive'],
    ['Caveat', 'Caveat:wght@600;700', 'cursive'],
    ['Playfair Display', 'Playfair+Display:wght@600;800', 'serif'],
    ['Abril Fatface', 'Abril+Fatface', 'serif']
  ];

  var DEFAULTS = {
    pageTitle: '',           // nom affiché dans l'onglet du navigateur
    mode: 'page',            // 'page' ou 'redirect'
    url: '',                 // adresse de la redirection directe
    layout: 'full',          // 'full' (texte sur le fond) ou 'card' (photo dans un cadre, texte dessous)
    bg: { type: 'gradient', color: '#0D1117', color2: '#2F4BFF', angle: 160, media: '', mediaOpacity: 1, overlay: 0.3, overlayColor: '#000000' },
    text: {
      title: 'Salut !', body: '',
      font: 'Bricolage Grotesque', bodyFont: 'Instrument Sans',
      color: '#ffffff', size: 56, bodySize: 20,
      pos: 'center', align: 'center', shadow: true
    },
    button: { show: true, label: 'Ouvrir', url: '', bg: '#ffffff', color: '#111111' }, // ancien format, converti en "buttons"
    links: [],                                                                       // ancien format, converti en "buttons"
    buttons: null,           // liste de boutons (voir BTN_DEFAULT)
    modStyle: { bg: '#ffffff', color: '#121A26', radius: 20, opacity: 0.95 },
    music: { src: '', volume: 0.6, gate: 'Touche pour entrer' },
    draw: { on: false, only: false, title: 'Dessine ici', paper: '#ffffff', size: 3000, place: 'bottom' },
    guestbook: { on: false, title: 'Livre d’or', place: 'bottom' },
    countdown: { on: false, label: '', date: '' }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function merge(base, over) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (isObj(over)) {
      for (var k in over) {
        var v = over[k];
        if (v === undefined) continue;
        if (isObj(v) && isObj(base[k])) out[k] = merge(base[k], v);
        else out[k] = v;
      }
    }
    return out;
  }
  var BTN_DEFAULT = { label: '', url: '', bg: '#ffffff', color: '#111111', size: 'm', shape: 'round', fill: 'solid', align: 'auto', full: false };
  function config(over) {
    over = over || {};
    var c = merge(clone(DEFAULTS), over);
    var list = c.buttons;
    if (!Array.isArray(over.buttons)) {            // anciens réglages : un gros bouton + des liens
      list = [];
      if (c.button && c.button.show && (c.button.url || c.url)) {
        list.push({ label: c.button.label || 'Ouvrir', url: c.button.url || c.url, bg: c.button.bg, color: c.button.color, size: 'l' });
      }
      (c.links || []).forEach(function (l) {
        if (l && (l.label || l.url)) list.push({ label: l.label, url: l.url, bg: c.text.color, fill: 'outline', full: true });
      });
    }
    c.buttons = list.filter(isObj).map(function (b) { return Object.assign({}, BTN_DEFAULT, b); });
    return c;
  }

  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return null;
    if (!/^https?:\/\//i.test(u)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return null;
      u = 'https://' + u;
    }
    try { new URL(u); return u; } catch (e) { return null; }
  }
  function ytId(u) {
    var m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  function mediaUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || /^data:/i.test(path)) return path;
    return SB_URL + '/storage/v1/object/public/media/' + encodeURIComponent(path);
  }
  function fontStack(name) {
    for (var i = 0; i < FONTS.length; i++) {
      if (FONTS[i][0] === name) return '"' + name + '", ' + FONTS[i][2];
    }
    return 'system-ui, sans-serif';
  }
  function loadFonts(names) {
    var qs = [];
    names.forEach(function (n) {
      for (var i = 0; i < FONTS.length; i++) {
        if (FONTS[i][0] === n && qs.indexOf(FONTS[i][1]) < 0) qs.push(FONTS[i][1]);
      }
    });
    if (!qs.length) return;
    var href = 'https://fonts.googleapis.com/css2?family=' + qs.join('&family=') + '&display=swap';
    if (document.querySelector('link[href="' + href + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  /* Appel à la base. token = jeton de l'administrateur (facultatif). */
  function rest(path, opts, token, timeoutMs) {
    opts = opts || {};
    var h = { apikey: SB_KEY };
    if (token) h.Authorization = 'Bearer ' + token;
    opts.headers = Object.assign(h, opts.headers || {});
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, timeoutMs || 8000);
    opts.signal = ctrl.signal;
    return fetch(SB_URL + '/rest/v1/' + path, opts).then(function (r) {
      clearTimeout(t);
      if (!r.ok) {
        return r.text().then(function (txt) {
          var e = new Error(txt || ('HTTP ' + r.status));
          e.status = r.status;
          throw e;
        });
      }
      return r.status === 204 ? null : r.text().then(function (txt) { return txt ? JSON.parse(txt) : null; });
    }, function (e) { clearTimeout(t); throw e; });
  }

  /* Anciens fichiers config.json (url, photo, title, text, button) */
  function legacyToConfig(old) {
    old = old || {};
    var hasPage = old.photo || old.title || old.text;
    if (!hasPage) return { mode: 'redirect', url: old.url || '' };
    return {
      mode: 'page',
      layout: old.photo ? 'card' : 'full',
      bg: old.photo ? { type: 'image', media: new URL(old.photo, location.href).href, color: '#0D1117' } : { type: 'color', color: '#0D1117' },
      text: { title: old.title || '', body: old.text || '', color: '#ffffff' },
      button: { show: !!old.url, label: old.button || 'Ouvrir', url: old.url || '' }
    };
  }

  function fetchConfig() {
    return rest('page?id=eq.1&select=config').then(function (rows) {
      var c = rows && rows[0] && rows[0].config;
      if (!c || !Object.keys(c).length) throw new Error('page vide');
      try { localStorage.setItem('qr_cfg', JSON.stringify(c)); } catch (e) {}
      return c;
    });
  }
  function fallbackConfig() {
    try {
      var c = localStorage.getItem('qr_cfg');
      if (c) return Promise.resolve(JSON.parse(c));
    } catch (e) {}
    return fetch('config.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(legacyToConfig);
  }


  /* ---------- dessin : trait -> rendu (monde carré, coordonnées 0-1) ---------- */
  function cleanStroke(s) {
    if (!s || typeof s !== 'object' || !Array.isArray(s.p) || !s.p.length) return null;
    var col = (s.c === 'erase' || /^#[0-9a-fA-F]{6}$/.test(s.c)) ? s.c : '#121A26';
    var w = Math.min(0.1, Math.max(0.0005, +s.w || 0.01));
    var legacy = s.s !== 2;     // anciens traits du petit module 3:4 : on les replace au centre du grand mur
    var p = [];
    for (var i = 0; i < s.p.length && i < 600; i++) {
      var a = s.p[i];
      if (!Array.isArray(a) || !isFinite(a[0]) || !isFinite(a[1])) continue;
      var x = Math.min(1, Math.max(0, +a[0])), y = Math.min(1, Math.max(0, +a[1]));
      if (legacy) { x = 0.3 + 0.4 * x; y = 0.2 + 0.4 * (4 / 3) * y; }
      p.push([x, y]);
    }
    if (legacy) w = w * 0.4;
    return p.length ? { c: col, w: w, p: p, k: String(s.k || ''), s: 2 } : null;
  }
  function paintSeg(ctx, s, W, H, from) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = s.c === 'erase' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = ctx.fillStyle = s.c === 'erase' ? '#000' : s.c;
    ctx.lineWidth = Math.max(1.2, s.w * W);
    var p = s.p;
    if (p.length === 1) {
      ctx.beginPath(); ctx.arc(p[0][0] * W, p[0][1] * H, ctx.lineWidth / 2, 0, 6.2832); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(p[from][0] * W, p[from][1] * H);
      for (var i = from + 1; i < p.length; i++) ctx.lineTo(p[i][0] * W, p[i][1] * H);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- générateur de QR code (octets, versions 1 à 10) ---------- */
  var ECC_PER_BLOCK = { L: [7, 10, 15, 20, 26, 18, 20, 24, 30, 18], M: [10, 16, 26, 18, 24, 16, 18, 22, 22, 26], Q: [13, 22, 18, 26, 18, 24, 18, 22, 20, 24], H: [17, 28, 22, 16, 22, 28, 26, 26, 24, 28] };
  var ECC_BLOCKS = { L: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4], M: [1, 1, 1, 2, 2, 4, 4, 4, 5, 5], Q: [1, 1, 2, 2, 4, 4, 6, 6, 8, 8], H: [1, 1, 2, 4, 4, 4, 5, 6, 8, 8] };
  var ECC_FMT = { L: 1, M: 0, Q: 3, H: 2 };
  function rawModules(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function gfMul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; }
  function rsGen(deg) {
    var r = []; for (var i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    var root = 1;
    for (i = 0; i < deg; i++) {
      for (var j = 0; j < r.length; j++) { r[j] = gfMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = gfMul(root, 2);
    }
    return r;
  }
  function rsRem(data, gen) {
    var r = gen.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ r.shift(); r.push(0);
      gen.forEach(function (c, i) { r[i] ^= gfMul(c, f); });
    });
    return r;
  }
  function utf8(str) { return Array.prototype.slice.call(new TextEncoder().encode(str)); }

  function qrMatrix(text, ecl) {
    ecl = ECC_FMT[ecl] !== undefined ? ecl : 'M';
    var bytes = utf8(text), ver, cap;
    for (ver = 1; ver <= 10; ver++) {
      cap = Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ecl][ver - 1] * ECC_BLOCKS[ecl][ver - 1];
      if (bytes.length + (ver < 10 ? 2 : 3) <= cap) break;
    }
    if (ver > 10) throw new Error('Adresse trop longue pour le QR code');
    // bits de données
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    var capBits = cap * 8;
    put(0, Math.min(4, capBits - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < capBits; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; data.push(b); }
    // blocs + correction d'erreur
    var nb = ECC_BLOCKS[ecl][ver - 1], el = ECC_PER_BLOCK[ecl][ver - 1];
    var raw = Math.floor(rawModules(ver) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var gen = rsGen(el), blocks = [], pos = 0;
    for (i = 0; i < nb; i++) {
      var len = shortLen - el + (i < nShort ? 0 : 1);
      var d = data.slice(pos, pos + len); pos += len;
      var e = rsRem(d, gen);
      if (i < nShort) d.push(0);
      blocks.push(d.concat(e));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) blocks.forEach(function (bl, j) { if (i !== shortLen - el || j >= nShort) all.push(bl[i]); });
    // grille
    var size = ver * 4 + 17, M = [], F = [];
    for (i = 0; i < size; i++) { M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    function setF(x, y, dark) { M[y][x] = !!dark; F[y][x] = true; }
    for (i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, dist !== 2 && dist !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = [];
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      ap = [6]; for (var p = size - 7; ap.length < na; p -= step) ap.splice(1, 0, p);
    }
    ap.forEach(function (ax, i) { ap.forEach(function (ay, j) {
      if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) return;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }); });
    function fmt(mask) {
      var d = (ECC_FMT[ecl] << 3) | mask, r = d;
      for (var i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var bitsF = ((d << 10) | r) ^ 0x5412;
      function bt(i) { return ((bitsF >>> i) & 1) !== 0; }
      for (i = 0; i <= 5; i++) setF(8, i, bt(i));
      setF(8, 7, bt(6)); setF(8, 8, bt(7)); setF(7, 8, bt(8));
      for (i = 9; i < 15; i++) setF(14 - i, 8, bt(i));
      for (i = 0; i < 8; i++) setF(size - 1 - i, 8, bt(i));
      for (i = 8; i < 15; i++) setF(8, size - 15 + i, bt(i));
      setF(8, size - 8, true);
    }
    fmt(0);
    if (ver >= 7) {
      var rr = ver; for (i = 0; i < 12; i++) rr = (rr << 1) ^ ((rr >>> 11) * 0x1F25);
      var vb = (ver << 12) | rr;
      for (i = 0; i < 18; i++) { var a = size - 11 + i % 3, bb = Math.floor(i / 3), bit = ((vb >>> i) & 1) !== 0; setF(a, bb, bit); setF(bb, a, bit); }
    }
    // placement des octets
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var j = 0; j < 2; j++) {
        var x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!F[y][x] && idx < all.length * 8) { M[y][x] = ((all[idx >>> 3] >>> (7 - (idx & 7))) & 1) !== 0; idx++; }
      }
    }
    function applyMask(mask) {
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        var inv;
        switch (mask) {
          case 0: inv = (x + y) % 2 === 0; break;
          case 1: inv = y % 2 === 0; break;
          case 2: inv = x % 3 === 0; break;
          case 3: inv = (x + y) % 3 === 0; break;
          case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: inv = x * y % 2 + x * y % 3 === 0; break;
          case 6: inv = (x * y % 2 + x * y % 3) % 2 === 0; break;
          default: inv = ((x + y) % 2 + x * y % 3) % 2 === 0;
        }
        if (!F[y][x] && inv) M[y][x] = !M[y][x];
      }
    }
    function penalty() {
      var score = 0, y, x, i;
      for (var pass = 0; pass < 2; pass++) {
        for (y = 0; y < size; y++) {
          var run = 1, hist = '';
          for (x = 0; x < size; x++) {
            var cur = pass ? M[x][y] : M[y][x];
            hist += cur ? '1' : '0';
            if (x > 0) { var prev = pass ? M[x - 1][y] : M[y][x - 1]; if (cur === prev) { run++; if (run === 5) score += 3; else if (run > 5) score++; } else run = 1; }
          }
          var m = hist.match(/10111010000|00001011101/g); if (m) score += 40 * m.length;
        }
      }
      var dark = 0;
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) {
        if (M[y][x]) dark++;
        if (x < size - 1 && y < size - 1 && M[y][x] === M[y][x + 1] && M[y][x] === M[y + 1][x] && M[y][x] === M[y + 1][x + 1]) score += 3;
      }
      score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return score;
    }
    var best = 0, bestScore = Infinity;
    for (var mk = 0; mk < 8; mk++) {
      applyMask(mk); fmt(mk);
      var sc = penalty();
      if (sc < bestScore) { bestScore = sc; best = mk; }
      applyMask(mk);
    }
    applyMask(best); fmt(best);
    return { size: size, version: ver, modules: M };
  }
  function qrSvg(text, ecl, dark, light) {
    var q = qrMatrix(text, ecl), n = q.size, b = 4, d = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (q.modules[y][x]) d += 'M' + (x + b) + ',' + (y + b) + 'h1v1h-1z';
    var t = n + 2 * b;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges"><rect width="' + t + '" height="' + t + '" fill="' + (light || '#fff') + '"/><path d="' + d + '" fill="' + (dark || '#000') + '"/></svg>';
  }

  g.QR = {
    SB_URL: SB_URL, SB_KEY: SB_KEY, FONTS: FONTS, DEFAULTS: DEFAULTS,
    clone: clone, merge: merge, config: config,
    safeUrl: safeUrl, ytId: ytId, mediaUrl: mediaUrl,
    fontStack: fontStack, loadFonts: loadFonts,
    cleanStroke: cleanStroke, paintSeg: paintSeg, qrMatrix: qrMatrix, qrSvg: qrSvg, BTN_DEFAULT: BTN_DEFAULT,
    rest: rest, fetchConfig: fetchConfig, fallbackConfig: fallbackConfig, legacyToConfig: legacyToConfig
  };
})(window);
