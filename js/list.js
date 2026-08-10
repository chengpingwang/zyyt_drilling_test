/* News / Insights list rendering. Reads data-type from <body>. */
(function () {
  const TYPE = document.body.getAttribute('data-type') || 'news';
  const esc = window.util.esc;

  function cardHTML(p) {
    const href = (TYPE === 'news' ? 'news' : 'insight') + '-detail.html?id=' + esc(p.id);
    const cover = p.cover ? '<div class="thumb" style="background-image:url(\'' + esc(p.cover) + '\')"></div>' : '<div class="thumb" style="background:#2D2D2D"></div>';
    const lang = window.Lang.get();
    const title = (p.title && (p.title[lang] || p.title.zh)) || '';
    const summary = (p.summary && (p.summary[lang] || p.summary.zh)) || '';
    const tags = (p.tags || []).slice(0, 2).map((t) => '<span class="tag">' + esc(t) + '</span>').join(' ');
    return '<a class="card" href="' + href + '">' + cover +
      '<div class="body"><div class="meta">' + window.util.date(p.publishedAt) + ' ' + tags + '</div>' +
      '<h3>' + esc(title) + '</h3><p>' + esc(summary) + '</p>' +
      '<span class="more">' + window.Lang.t('common.readmore') + '</span></div></a>';
  }

  async function render() {
    const grid = document.getElementById('listGrid');
    const empty = document.getElementById('emptyState');
    const zh = window.Lang.get() === 'zh';
    try {
      const r = await window.API.getPosts(TYPE);
      if (!r.ok) throw new Error('bad');
      const posts = (r.data && r.data.posts) || [];
      if (!posts.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        empty.textContent = zh ? '暂无已发布内容' : 'No published content yet';
        return;
      }
      empty.style.display = 'none';
      grid.innerHTML = posts.map(cardHTML).join('');
    } catch (e) {
      // fetch failed — almost always because the page was opened via file://
      // (the static JSON can only be fetched over http/https, not from disk).
      grid.innerHTML = '';
      empty.style.display = 'block';
      empty.textContent = zh
        ? '无法加载内容：请通过 http(s) 访问本页（部署到 GitHub Pages / 任意静态主机，或用 node server.js 本地运行），不要直接双击打开 HTML 文件'
        : 'Cannot load content: serve this page over http(s) — deploy to GitHub Pages / any static host, or run `node server.js` locally. Do not open the HTML file directly.';
    }
  }

  document.addEventListener('zyyt:lang', () => { window.Lang.apply(); render(); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
