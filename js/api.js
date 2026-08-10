/* Content/auth API.

   READS resolve against data/posts.json (a static file) so the public site
   works on GitHub Pages and any static host with NO backend.

   WRITES and authentication (the admin panel) still talk to the Node backend
   (/api/*). Those endpoints only exist when the site is deployed together with
   server.js on a Node host (Railway / Render / VPS). */
window.API = (function () {
  const B = ''; // same-origin prefix for the Node backend endpoints
  function postUrl() { return (window.ZYYT_BASE || '') + 'data/posts.json'; }

  async function req(method, path, body) {
    const opts = { method, credentials: 'include', headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(B + path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    return { ok: res.ok, status: res.status, data };
  }

  function loadAll() {
    return fetch(postUrl(), { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error('http ' + res.status);
      return res.json();
    }).then((json) => (Array.isArray(json.posts) ? json.posts : (Array.isArray(json) ? json : [])));
  }

  // Static read — works everywhere. `all` includes drafts (used by the admin).
  async function readStatic(type, all) {
    try {
      let posts = await loadAll();
      if (type) posts = posts.filter((p) => p.type === type);
      if (!all) posts = posts.filter((p) => p.status === 'published');
      posts = posts.slice().sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
      posts = posts.map((p) => ({
        id: p.id, type: p.type, status: p.status, publishedAt: p.publishedAt,
        cover: p.cover, tags: p.tags, title: p.title, summary: p.summary,
      }));
      return { ok: true, status: 200, data: { posts } };
    } catch (e) {
      return { ok: false, status: 0, data: null };
    }
  }

  async function readStaticOne(id, includeDrafts) {
    try {
      const all = await loadAll();
      const p = all.find((x) => x.id === id);
      if (!p) return { ok: false, status: 404, data: null };
      if (!includeDrafts && p.status !== 'published') return { ok: false, status: 404, data: null };
      return { ok: true, status: 200, data: { post: p } };
    } catch (e) {
      return { ok: false, status: 0, data: null };
    }
  }

  return {
    getPosts: (type, all) => readStatic(type, all),
    getPost: (id, includeDrafts) => readStaticOne(id, includeDrafts),
    login: (user, pass) => req('POST', '/api/login', { user, pass }),
    logout: () => req('POST', '/api/logout'),
    me: () => req('GET', '/api/me'),
    create: (p) => req('POST', '/api/posts', p),
    update: (id, p) => req('PUT', '/api/posts/' + id, p),
    remove: (id) => req('DELETE', '/api/posts/' + id),
  };
})();
