// Search Tool: reads the links in article/index.html, opens each article,
// and looks for the search term in the text. No list to maintain.
(function () {
  var q = document.getElementById('q');
  var out = document.getElementById('out');
  var sort = 'best';
  var loading = null;
  var indexURL = new URL('article/index.html', location.href);

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function clean(t) { return t.replace(/\s+/g, ' ').trim(); }

  function readPage(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' (' + r.status + ')');
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var main = doc.querySelector('main') || doc.body;
      var h1 = main.querySelector('h1');
      var meta = main.querySelector('.meta');
      var paras = [].map.call(main.querySelectorAll('p, li, blockquote, h2, h3'), function (e) {
        return clean(e.textContent);
      }).filter(Boolean);
      return {
        url: url,
        title: clean(h1 ? h1.textContent : doc.title || url),
        meta: meta ? clean(meta.textContent) : '',
        paras: paras
      };
    });
  }

  function load() {
    if (loading) return loading;
    loading = fetch(indexURL).then(function (r) {
      if (!r.ok) throw new Error('Could not open article/index.html (' + r.status + ')');
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var seen = {}, urls = [];
      doc.querySelectorAll('main a[href]').forEach(function (a) {
        var u = new URL(a.getAttribute('href'), indexURL);
        u.hash = ''; u.search = '';
        if (u.origin !== indexURL.origin || !/\.html$/.test(u.pathname)) return;
        if (u.href === indexURL.href || seen[u.href]) return;
        seen[u.href] = 1;
        urls.push(u.href);
      });
      return Promise.all(urls.map(function (u) {
        return readPage(u).catch(function () { return null; });
      }));
    }).then(function (list) {
      return list.filter(Boolean);
    });
    return loading;
  }

  function run() {
    var term = q.value.trim();
    try { history.replaceState(null, '', term ? '?q=' + encodeURIComponent(term) : location.pathname); } catch (e) {}
    if (!term) {
      out.innerHTML = '<p class="empty">Type a word or phrase to search the articles.</p>';
      return;
    }
    out.innerHTML = '<p class="empty">Searching...</p>';
    load().then(function (list) {
      if (q.value.trim() !== term) return; // typed something newer meanwhile
      var re = new RegExp(rx(term), 'gi');
      var hl = new RegExp(rx(esc(term)), 'gi');
      var count = function (s) { return (s.match(re) || []).length; };
      var hits = [];
      list.forEach(function (p, i) {
        var score = count(p.title) * 3 + p.paras.reduce(function (a, s) { return a + count(s); }, 0);
        if (!score) return;
        var para = p.paras.filter(function (s) { return count(s); })[0] || p.paras[0] || '';
        if (para.length > 300) {
          var at = Math.max(0, para.search(re) - 100);
          para = (at ? '\u2026' : '') + para.slice(at, at + 300) + '\u2026';
        }
        hits.push({ p: p, i: i, score: score, para: para });
      });
      hits.sort(sort === 'best'
        ? function (a, b) { return b.score - a.score; }
        : function (a, b) { return a.i - b.i; });
      var mark = function (s) { return esc(s).replace(hl, function (m) { return '<mark>' + m + '</mark>'; }); };
      out.innerHTML = hits.length ? hits.map(function (h) {
        return '<a class="card" href="' + esc(h.p.url) + '">' +
          (h.p.meta ? '<div class="meta">' + esc(h.p.meta) + '</div>' : '') +
          '<h3>' + mark(h.p.title) + '</h3>' +
          (h.para ? '<blockquote>' + mark(h.para) + '</blockquote>' : '') + '</a>';
      }).join('') : '<p class="empty">No results for \u201c' + esc(term) + '\u201d.</p>';
    }).catch(function (e) {
      out.innerHTML = '<p class="empty">Search problem: ' + esc(e.message) +
        (location.protocol === 'file:' ? ' (Search only works on the hosted site, not when the file is opened from your computer.)' : '') + '</p>';
    });
  }

  document.getElementById('sf').addEventListener('submit', function (e) { e.preventDefault(); run(); });
  q.addEventListener('input', run);
  document.querySelectorAll('[data-o]').forEach(function (b) {
    b.addEventListener('click', function () {
      sort = b.dataset.o;
      document.querySelectorAll('[data-o]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      run();
    });
  });
  q.value = new URLSearchParams(location.search).get('q') || '';
  load().catch(function () {});
  if (q.value) run();
})();
