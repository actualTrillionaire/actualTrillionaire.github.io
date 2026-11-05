// Search Tool: reads the links in index.html, opens each article, and lists
// every mention of the search term, grouped under the article it appears in.
(function () {
  var ARTICLES_PER_PAGE = 10;   // articles shown per screen
  var MENTIONS_SHOWN = 10;      // mentions shown per article before "more"
  var q = document.getElementById('q');
  var out = document.getElementById('out');
  var sort = 'best';
  var page = 1;
  var groups = [];
  var loading = null;
  var indexURL = new URL('index.html', location.href);

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function clean(t) { return t.replace(/\s+/g, ' ').trim(); }
  function say(msg) { out.innerHTML = '<p class="empty">' + esc(msg) + '</p>'; }

  // Open one article and split its text into blocks (title, paragraphs, list items, quotes)
  function readPage(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' (' + r.status + ')');
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var main = doc.querySelector('main') || doc.body;
      [].forEach.call(main.querySelectorAll('br'), function (b) { b.replaceWith(' '); });
      var h1 = main.querySelector('h1');
      var meta = main.querySelector('.meta');
      var blocks = [].filter.call(main.querySelectorAll('h1, h2, h3, p, li, blockquote'), function (e) {
        return !e.matches('.meta') && !e.querySelector('h1, h2, h3, p, li, blockquote');
      }).map(function (e) { return clean(e.textContent); }).filter(Boolean);
      return {
        url: url,
        title: clean(h1 ? h1.textContent : doc.title || url),
        meta: meta ? clean(meta.textContent) : '',
        blocks: blocks
      };
    });
  }

  // Find every article linked from index.html and read them all (once)
  function load() {
    if (loading) return loading;
    loading = fetch(indexURL).then(function (r) {
      if (!r.ok) throw new Error('Could not open index.html (' + r.status + ')');
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

  // A link that jumps to the spot in the article (browsers that don't support it just open the page)
  function jumpLink(url, text, at, len) {
    var a = text.lastIndexOf(' ', Math.max(0, at - 20));
    a = a < 0 ? 0 : a + 1;
    var b = text.indexOf(' ', Math.min(text.length, at + len + 20));
    if (b < 0) b = text.length;
    return url + '#:~:text=' + encodeURIComponent(text.slice(a, b)).replace(/-/g, '%2D');
  }

  function search(term, list) {
    var re = new RegExp(rx(term), 'gi');
    var hl = new RegExp(rx(esc(term)), 'gi');
    var mark = function (s) { return esc(s).replace(hl, function (m) { return '<mark>' + m + '</mark>'; }); };
    var result = [];
    list.forEach(function (p, order) {
      var lines = [];
      p.blocks.forEach(function (text) {
        var m;
        re.lastIndex = 0;
        while ((m = re.exec(text))) {
          if (!m[0]) { re.lastIndex++; continue; }
          var from = Math.max(0, m.index - 30);
          var to = Math.min(text.length, m.index + m[0].length + 60);
          lines.push('<li><a href="' + esc(jumpLink(p.url, text, m.index, m[0].length)) + '">' +
            (from > 0 ? '\u2026' : '') + mark(text.slice(from, to)) + (to < text.length ? '\u2026' : '') +
            '</a></li>');
        }
      });
      if (!lines.length) return;
      var more = lines.slice(MENTIONS_SHOWN);
      result.push({
        order: order,
        count: lines.length,
        html: '<section class="grp"><h3><a href="' + esc(p.url) + '">' + mark(p.title) + '</a></h3>' +
          '<div class="meta">' + (p.meta ? esc(p.meta) + ' \u00b7 ' : '') + lines.length +
          (lines.length === 1 ? ' mention' : ' mentions') + '</div>' +
          '<ul class="hits">' + lines.slice(0, MENTIONS_SHOWN).join('') + '</ul>' +
          (more.length ? '<details><summary>+ ' + more.length + ' more ' + (more.length === 1 ? 'mention' : 'mentions') +
            '</summary><ul class="hits">' + more.join('') + '</ul></details>' : '') +
          '</section>'
      });
    });
    result.sort(sort === 'best'
      ? function (a, b) { return b.count - a.count || a.order - b.order; }
      : function (a, b) { return a.order - b.order; });
    return result;
  }

  function draw(term) {
    if (!groups.length) { say('No mentions of \u201c' + term + '\u201d found.'); return; }
    var pages = Math.ceil(groups.length / ARTICLES_PER_PAGE);
    page = Math.min(Math.max(page, 1), pages);
    var total = groups.reduce(function (n, g) { return n + g.count; }, 0);
    var shown = groups.slice((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE);
    out.innerHTML =
      '<p class="count">' + total + (total === 1 ? ' mention' : ' mentions') + ' in ' + groups.length +
      (groups.length === 1 ? ' article' : ' articles') + '</p>' +
      shown.map(function (g) { return g.html; }).join('') +
      (pages > 1 ? '<div class="pager"><button type="button" data-pg="-1"' + (page === 1 ? ' disabled' : '') +
        '>&larr; Prev</button><span>Page ' + page + ' of ' + pages + '</span><button type="button" data-pg="1"' +
        (page === pages ? ' disabled' : '') + '>Next &rarr;</button></div>' : '');
  }

  function run() {
    var term = q.value.trim();
    try { history.replaceState(null, '', term ? '?q=' + encodeURIComponent(term) : location.pathname); } catch (e) {}
    if (!term) { say('Type a word or phrase to find every mention in the articles.'); return; }
    say('Searching...');
    load().then(function (list) {
      if (q.value.trim() !== term) return; // typed something newer meanwhile
      groups = search(term, list);
      page = 1;
      draw(term);
    }).catch(function (e) {
      say('Search problem: ' + e.message +
        (location.protocol === 'file:' ? ' (Search only works on the hosted site, not when the file is opened from your computer.)' : ''));
    });
  }

  out.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pg]');
    if (!b) return;
    page += +b.dataset.pg;
    draw(q.value.trim());
    window.scrollTo(0, 0);
  });
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
