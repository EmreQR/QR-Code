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
    mode: 'page',            // 'page' ou 'redirect'
    url: '',                 // adresse de la redirection directe
    layout: 'full',          // 'full' (texte sur le fond) ou 'card' (photo dans un cadre, texte dessous)
    bg: { type: 'gradient', color: '#0D1117', color2: '#2F4BFF', angle: 160, media: '', overlay: 0.3, overlayColor: '#000000' },
    text: {
      title: 'Salut !', body: '',
      font: 'Bricolage Grotesque', bodyFont: 'Instrument Sans',
      color: '#ffffff', size: 56, bodySize: 20,
      pos: 'center', align: 'center', shadow: true
    },
    button: { show: true, label: 'Ouvrir', url: '', bg: '#ffffff', color: '#111111' },
    links: [],
    music: { src: '', volume: 0.6, gate: 'Touche pour entrer' },
    draw: { on: false, only: false, title: 'Dessine ici', paper: '#ffffff' },
    guestbook: { on: false, title: 'Livre d’or' },
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
  function config(over) { return merge(clone(DEFAULTS), over || {}); }

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

  g.QR = {
    SB_URL: SB_URL, SB_KEY: SB_KEY, FONTS: FONTS, DEFAULTS: DEFAULTS,
    clone: clone, merge: merge, config: config,
    safeUrl: safeUrl, ytId: ytId, mediaUrl: mediaUrl,
    fontStack: fontStack, loadFonts: loadFonts,
    rest: rest, fetchConfig: fetchConfig, fallbackConfig: fallbackConfig, legacyToConfig: legacyToConfig
  };
})(window);
