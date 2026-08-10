/* Shared layout (header/footer), language manager, SEO/Geo JSON-LD and helpers. */
(function () {
  const I18N = window.I18N;

  /* repo-root asset base — derived from this script's own URL so paths resolve
     correctly at the site root, inside /admin/, and on GitHub Pages subpaths. */
  (function () {
    const s = document.currentScript;
    let base = './';
    if (s && s.src) {
      const m = s.src.match(/(.*\/)js\/common\.js(\?[^#]*)?(#.*)?$/);
      if (m) base = m[1];
    }
    window.ZYYT_BASE = base;
  })();

  /* ---------- small utilities ---------- */
  window.util = {
    esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    // turn body text (separated by blank lines) into <p> blocks; single \n -> <br>
    paras(text) {
      return String(text || '').split(/\n{2,}/).map((blk) => {
        const html = blk.split(/\n/).map((l) => window.util.esc(l)).join('<br>');
        return '<p>' + html + '</p>';
      }).join('');
    },
    date(iso) { return (iso || '').slice(0, 10); },
  };

  /* ---------- language manager ---------- */
  const Lang = {
    current: localStorage.getItem('zyyt-lang') || 'zh',
    get() { return this.current; },
    set(lang) {
      this.current = (lang === 'en') ? 'en' : 'zh';
      localStorage.setItem('zyyt-lang', this.current);
      this.apply();
      document.dispatchEvent(new CustomEvent('zyyt:lang', { detail: this.current }));
    },
    toggle() { this.set(this.current === 'zh' ? 'en' : 'zh'); },
    t(key) {
      const d = I18N[this.current];
      if (d && d[key] != null) return d[key];
      if (I18N.zh[key] != null) return I18N.zh[key];
      return key;
    },
    apply() {
      document.documentElement.lang = (this.current === 'zh') ? 'zh-CN' : 'en';
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const v = this.t(el.getAttribute('data-i18n'));
        if (v != null) el.textContent = v;
      });
      document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
        const v = this.t(el.getAttribute('data-i18n-ph'));
        if (v != null) el.setAttribute('placeholder', v);
      });
      const tg = document.querySelector('[data-lang-toggle-label]');
      if (tg) tg.textContent = this.t('lang.toggle');
    },
  };
  window.Lang = Lang;

  /* ---------- header / footer ---------- */
  function navLinks() {
    const path = location.pathname;
    const items = [
      ['index.html', 'nav.home'],
      ['about.html', 'nav.about'],
      ['news.html', 'nav.news'],
      ['insights.html', 'nav.insights'],
      ['contact.html', 'nav.contact'],
    ];
    return items.map(([href, key]) => {
      const active = (href === 'index.html')
        ? (path === '/' || path === '' || path.endsWith('/index.html'))
        : path.endsWith('/' + href);
      return '<a href="' + href + '" class="' + (active ? 'active' : '') + '" data-i18n="' + key + '">' + Lang.t(key) + '</a>';
    }).join('');
  }

  function renderHeader() {
    const root = document.getElementById('header-root');
    if (!root) return;
    document.body.classList.add('has-site-header');
    root.innerHTML =
      '<header class="site-header"><div class="container nav">' +
        '<a class="brand" href="index.html"><img src="' + ZYYT_BASE + 'images/logo.png" alt="ZYYT"><span class="brand-text"><span class="brand-zh">凿研岩土</span><span class="brand-en">ZYYT</span></span></a>' +
        '<nav class="nav-links" id="navLinks">' + navLinks() + '</nav>' +
        '<div class="nav-right">' +
          '<button class="lang-toggle" id="langToggle"><span class="dot"></span><span data-lang-toggle-label>' + Lang.t('lang.toggle') + '</span></button>' +
          '<button class="nav-toggle" id="navToggle" aria-label="menu"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div></header>';
    const langToggle = document.getElementById('langToggle');
    const navToggle = document.getElementById('navToggle');
    const navEl = document.getElementById('navLinks');
    langToggle.addEventListener('click', () => Lang.toggle());
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navEl.classList.toggle('open');
    });
    // tap a link inside the open menu → close it
    navEl.addEventListener('click', (e) => {
      if (e.target.closest('a')) navEl.classList.remove('open');
    });
    // tap anywhere outside the menu / toggle → close it
    document.addEventListener('click', (e) => {
      if (!navEl.classList.contains('open')) return;
      if (e.target.closest('.nav-toggle') || e.target.closest('.nav-right') || e.target.closest('.nav-links')) return;
      navEl.classList.remove('open');
    });
    // rotate back to desktop width → ensure menu is collapsed
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) navEl.classList.remove('open');
    });
  }

  function footerContact() {
    const c = window.CONTACT || {};
    const en = (Lang.get() === 'en');
    const email = c.email || 'info@zyyt-drilling.com';
    const tel = c.tel || (en ? '(TBD)' : '（待补充）');
    const addr = (c.address && (c.address[Lang.get()] || c.address.zh)) || '青海省（待补充）';
    let html = '<li>' + Lang.t('contact.email') + '：' + window.util.esc(email) + '</li>' +
      '<li>' + Lang.t('contact.tel') + '：' + window.util.esc(tel) + '</li>' +
      '<li>' + Lang.t('contact.addr') + '：' + window.util.esc(addr) + '</li>';
    if (en && c.linkedin) {
      html += '<li style="margin-top:6px"><a href="' + window.util.esc(c.linkedin) + '" target="_blank" rel="noopener">' + Lang.t('contact.linkedin') + '</a> · ' +
        '<a href="' + window.util.esc(c.facebook) + '" target="_blank" rel="noopener">' + Lang.t('contact.facebook') + '</a></li>';
    }
    return html;
  }

  function renderFooter() {
    const root = document.getElementById('footer-root');
    if (!root) return;
    root.innerHTML =
      '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
        '<div><div class="foot-brand"><img src="' + ZYYT_BASE + 'images/logo.png" alt="ZYYT"><span class="bz">凿研岩土 ZYYT</span></div>' +
          '<p style="font-size:14px;max-width:34ch;" data-i18n="home.hero.lead">' + Lang.t('home.hero.lead') + '</p></div>' +
        '<div><h5 data-i18n="footer.quick">Quick links</h5><ul class="foot-links">' +
          '<li><a href="about.html" data-i18n="nav.about">About</a></li>' +
          '<li><a href="news.html" data-i18n="nav.news">News</a></li>' +
          '<li><a href="insights.html" data-i18n="nav.insights">Insights</a></li>' +
          '<li><a href="contact.html" data-i18n="nav.contact">Contact</a></li></ul></div>' +
        '<div><h5 data-i18n="footer.about">About</h5><ul class="foot-links">' +
          '<li><a href="about.html#profile" data-i18n="about.profile.title">Profile</a></li>' +
          '<li><a href="about.html#equipment" data-i18n="about.equip.title">Equipment</a></li>' +
          '<li><a href="about.html#projects" data-i18n="about.proj.title">Track record</a></li>' +
          '<li><a href="about.html#clients" data-i18n="about.clients.title">Clients</a></li></ul></div>' +
        '<div><h5 data-i18n="footer.contact">Contact</h5><ul class="foot-links" id="footerContact">' + footerContact() + '</ul></div>' +
      '</div><div class="copy"><span data-i18n="footer.copyright">© 2020–2026 …</span>' +
      '<span data-i18n="footer.icp">ICP …</span></div></div></footer>';
  }

  /* ---------- SEO / Geo structured data ---------- */
  function injectSEO() {
    const geo = { lat: 36.6171, lng: 101.7782, placename: 'Xining, Qinghai, China' };
    const ld = {
      '@context': 'https://schema.org',
      '@type': ['Organization', 'ProfessionalService'],
      '@id': ZYYT_BASE + '#organization',
      name: '青海凿研岩土工程有限公司',
      alternateName: 'Qinghai Zaoyan Rock & Soil Engineering Co., Ltd.',
      description: Lang.t('home.hero.lead'),
      url: ZYYT_BASE,
      logo: ZYYT_BASE + 'images/logo.png',
      foundingDate: '2020-09',
      founder: { '@type': 'Person', name: '王小俊' },
      areaServed: ['青海', '甘肃', '新疆', 'Qinghai', 'Gansu', 'Xinjiang'],
      knowsAbout: ['矿产勘查钻探', '槽探', '高原钻探', '盐湖钻探', '深孔钻探',
        'Mineral exploration drilling', 'Trenching', 'Plateau drilling', 'Salt-lake drilling', 'Deep-hole drilling'],
      address: {
        '@type': 'PostalAddress', addressRegion: 'Qinghai',
        addressCountry: 'CN', addressLocality: geo.placename,
      },
      geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng },
      contactPoint: [{ '@type': 'ContactPoint', email: 'info@zyyt-drilling.com', contactType: 'sales' }],
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  function init() {
    Lang.apply();
    renderHeader();
    renderFooter();
    injectSEO();
  }

  document.addEventListener('zyyt:lang', () => {
    const el = document.getElementById('footerContact');
    if (el) el.innerHTML = footerContact();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
