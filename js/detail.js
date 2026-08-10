/* Article detail rendering + BlogPosting structured data for SEO/AI search. */
(function () {
  const TYPE = document.body.getAttribute('data-type') || 'news';
  const esc = window.util.esc;
  const params = new URLSearchParams(location.search);
  const ID = params.get('id');
  let POST = null;

  function relListHref() { return (TYPE === 'news' ? 'news' : 'insights') + '.html'; }
  function relDetailHref(id) { return (TYPE === 'news' ? 'news' : 'insight') + '-detail.html?id=' + esc(id); }

  function injectArticleLD(p) {
    const lang = window.Lang.get();
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: (p.title && (p.title[lang] || p.title.zh)) || '',
      alternativeHeadline: (p.title && (p.title[lang === 'zh' ? 'en' : 'zh'])) || '',
      datePublished: p.publishedAt,
      dateModified: (p.updatedAt || p.publishedAt || '').slice(0, 10),
      inLanguage: (lang === 'zh' ? 'zh-CN' : 'en'),
      articleSection: (TYPE === 'news' ? 'Company News' : 'Industry Insights'),
      keywords: (p.tags || []).join(', '),
      image: p.cover ? ZYYT_BASE + p.cover : ZYYT_BASE + 'images/logo.png',
      mainEntityOfPage: { '@type': 'WebPage', '@id': location.href },
      publisher: {
        '@type': 'Organization', '@id': location.origin + '/#organization',
        name: '青海凿研岩土工程有限公司', logo: { '@type': 'ImageObject', url: ZYYT_BASE + 'images/logo.png' },
      },
      description: (p.summary && (p.summary[lang] || p.summary.zh)) || '',
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  function renderBody(el, body) {
    if (!body) { el.innerHTML = ''; return; }
    // Sanitized HTML from the admin rich editor; legacy plain-text bodies fall back to <p> blocks.
    if (/<[a-zA-Z][\s\S]*>/i.test(body)) el.innerHTML = body;
    else el.innerHTML = window.util.paras(body);
  }

  function render() {
    if (!POST) return;
    const lang = window.Lang.get();
    const title = (POST.title && (POST.title[lang] || POST.title.zh)) || '';
    const body = (POST.body && (POST.body[lang] || POST.body.zh)) || '';
    const tags = (POST.tags || []).map((t) => '<span class="tag">' + esc(t) + '</span>').join(' ');

    const hero = document.getElementById('detailHero');
    hero.style.backgroundImage = POST.cover ? "url('" + esc(POST.cover) + "')" : "url('images/0ec08c47ac9f593b23795f8b48233d0d.jpg')";
    document.getElementById('detailMeta').innerHTML = window.util.date(POST.publishedAt) + ' &nbsp;·&nbsp; ' + tags;
    document.getElementById('detailTitle').textContent = title;
    renderBody(document.getElementById('detailBody'), body);
    document.getElementById('backLink').setAttribute('href', relListHref());
    document.title = title + ' | 青海凿研岩土工程有限公司 ZYYT';
  }

  function renderRelated() {
    const grid = document.getElementById('relatedGrid');
    window.API.getPosts(TYPE).then((r) => {
      const posts = ((r.data && r.data.posts) || []).filter((p) => p.id !== ID).slice(0, 3);
      grid.innerHTML = posts.map((p) => {
        const lang = window.Lang.get();
        const cover = p.cover ? '<div class="thumb" style="background-image:url(\'' + esc(p.cover) + '\')"></div>' : '<div class="thumb" style="background:#2D2D2D"></div>';
        const t = (p.title && (p.title[lang] || p.title.zh)) || '';
        const s = (p.summary && (p.summary[lang] || p.summary.zh)) || '';
        const tg = (p.tags || []).slice(0, 2).map((x) => '<span class="tag">' + esc(x) + '</span>').join(' ');
        return '<a class="card" href="' + relDetailHref(p.id) + '">' + cover +
          '<div class="body"><div class="meta">' + window.util.date(p.publishedAt) + ' ' + tg + '</div>' +
          '<h3>' + esc(t) + '</h3><p>' + esc(s) + '</p><span class="more">' + window.Lang.t('common.readmore') + '</span></div></a>';
      }).join('');
    });
  }

  async function init() {
    if (!ID) { document.getElementById('detailBody').innerHTML = '<p class="empty">—</p>'; return; }
    try {
      const r = await window.API.getPost(ID);
      if (!r.ok || !r.data.post) { document.getElementById('detailBody').innerHTML = '<p class="empty">404</p>'; return; }
      POST = r.data.post;
      injectArticleLD(POST);
      render();
      renderRelated();
    } catch (e) {
      document.getElementById('detailBody').innerHTML = '<p class="empty">—</p>';
    }
  }

  document.addEventListener('zyyt:lang', () => { if (POST) { render(); renderRelated(); } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
