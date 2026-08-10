/* Admin backend: auth-gated content management for News & Insights. */
(function () {
  const esc = window.util.esc;
  const L = (zh, en) => (window.Lang.get() === 'zh' ? zh : en);
  const $ = (id) => document.getElementById(id);

  const state = { tab: 'all', filter: 'all', search: '', editing: null };

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- auth flow ---------- */
  async function boot() {
    const r = await window.API.me();
    if (r.ok && r.data.authenticated) showApp(r.data.user);
    else showLogin();
  }
  function showLogin() { $('loginView').style.display = 'flex'; $('appView').style.display = 'none'; }
  function showApp(user) {
    $('loginView').style.display = 'none'; $('appView').style.display = 'block';
    $('adminUser').textContent = user;
    loadAndRender();
  }

  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const r = await window.API.login($('loginUser').value, $('loginPass').value);
    if (r.ok) { $('loginError').style.display = 'none'; boot(); }
    else { $('loginError').style.display = 'block'; }
  });
  $('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault(); await window.API.logout(); showLogin();
  });
  $('adminLangToggle').addEventListener('click', () => window.Lang.toggle());

  /* ---------- tabs & filters ---------- */
  document.querySelectorAll('.admin-side a[data-tab]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = a.getAttribute('data-tab');
      document.querySelectorAll('.admin-side a').forEach((x) => x.classList.remove('active'));
      a.classList.add('active');
      if (tab === 'profile') { $('listView').style.display = 'none'; $('profileView').style.display = 'block'; }
      else { $('listView').style.display = 'block'; $('profileView').style.display = 'none'; applyFilter(tab); }
    });
  });
  document.querySelectorAll('.chip[data-filter]').forEach((c) => {
    c.addEventListener('click', () => applyFilter(c.getAttribute('data-filter')));
  });
  $('searchInput').addEventListener('input', (e) => { state.search = e.target.value.trim().toLowerCase(); loadAndRender(); });
  $('newBtn').addEventListener('click', () => openModal(null));

  /* ---------- cover image upload ---------- */
  (function () {
    const coverBtn = $('coverBtn');
    const coverInput = $('coverInput');
    if (coverBtn && coverInput) {
      coverBtn.addEventListener('click', () => coverInput.click());
      coverInput.addEventListener('change', () => {
        const file = coverInput.files && coverInput.files[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) { toast(L('图片过大（>8MB）', 'Image too large (>8MB)')); coverInput.value = ''; return; }
        uploadImageFile(file).then((url) => {
          if (url) { $('f_cover').value = url; renderCoverPreview(url); }
        });
        coverInput.value = '';
      });
    }
  })();

  /* ---------- list ---------- */
  function syncChips() {
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.getAttribute('data-filter') === state.filter));
  }
  function applyFilter(f) {
    state.filter = f;
    syncChips();
    loadAndRender();
  }
  async function loadAndRender() {
    syncChips();
    const type = state.filter === 'all' ? null : state.filter;
    const r = await window.API.getPosts(type, true);
    let posts = (r.data && r.data.posts) || [];
    if (state.search) {
      posts = posts.filter((p) => {
        const z = (p.title && p.title.zh) || ''; const en = (p.title && p.title.en) || '';
        return z.toLowerCase().includes(state.search) || en.toLowerCase().includes(state.search);
      });
    }
    const rows = $('postRows');
    if (!posts.length) { rows.innerHTML = '<tr><td colspan="6" class="empty">—</td></tr>'; return; }
    rows.innerHTML = posts.map((p) => {
      const typeLabel = p.type === 'news' ? L('公司新闻', 'News') : L('行业洞察', 'Insights');
      const cover = p.cover ? '<img class="thumb" src="' + esc(p.cover) + '">' : '<div class="thumb" style="background:#2D2D2D"></div>';
      const tZh = (p.title && p.title.zh) || '';
      const tEn = (p.title && p.title.en) || '';
      return '<tr>' +
        '<td>' + cover + '</td>' +
        '<td><strong>' + esc(tZh) + '</strong><br><span style="color:var(--gray-500);font-size:12.5px">' + esc(tEn) + '</span></td>' +
        '<td>' + typeLabel + '</td>' +
        '<td><span class="badge ' + (p.status === 'published' ? 'pub' : 'draft') + '">' + (p.status === 'published' ? L('已发布', 'Published') : L('草稿', 'Draft')) + '</span></td>' +
        '<td>' + window.util.date(p.publishedAt) + '</td>' +
        '<td><div class="row-actions"><button class="link-btn" data-edit="' + esc(p.id) + '">' + L('编辑', 'Edit') + '</button>' +
        '<button class="link-btn danger" data-del="' + esc(p.id) + '">' + L('删除', 'Delete') + '</button></div></td>' +
        '</tr>';
    }).join('');
    rows.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openModal(b.getAttribute('data-edit'))));
    rows.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => doDelete(b.getAttribute('data-del'))));
  }

  /* ---------- rich text editor toolbar ---------- */
  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  // Upload a file to the server and resolve the public URL (or null on failure).
  async function uploadImageFile(file) {
    toast(L('上传中…', 'Uploading…'));
    let dataUrl;
    try { dataUrl = await fileToDataUrl(file); }
    catch (e) { toast(L('读取失败', 'Read failed')); return null; }
    try {
      const r = await fetch('/api/upload', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataUrl, name: file.name }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.url) return d.url;
      toast(L('上传失败', 'Upload failed') + ' (' + (d.error || r.status) + ')');
      return null;
    } catch (e) {
      toast(L('上传失败', 'Upload failed'));
      return null;
    }
  }
  // Insert an already-uploaded image URL into a contenteditable editor at the caret.
  function insertImage(ed, url, alt) {
    ed.focus();
    document.execCommand('insertHTML', false,
      '<img src="' + esc(url) + '" alt="' + esc(alt) + '" class="post-img">');
    toast(L('已插入图片', 'Image inserted'));
  }
  function fileNameAlt(file) {
    return (file.name || '').replace(/\.[^.]+$/, '').replace(/[^\w一-龥-]/g, '');
  }
  // Find the image the user currently has selected / just worked with in `ed`.
  function getSelectedImage(ed) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      let n = sel.anchorNode;
      if (n && n.nodeType === 3) n = n.parentNode; // text node → element
      if (n) {
        if (n.tagName === 'IMG') return n;
        if (n.querySelector) { const im = n.querySelector('img'); if (im) return im; }
      }
    }
    const all = ed.querySelectorAll('img');
    return all.length ? all[all.length - 1] : null;
  }
  // Enable paste-to-upload of images inside the editor.
  function attachPaste(ed) {
    if (ed.dataset.paste) return;
    ed.dataset.paste = '1';
    ed.addEventListener('paste', async (e) => {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (const it of items) {
        if (it.type && it.type.indexOf('image') === 0) {
          const file = it.getAsFile();
          if (!file) continue;
          e.preventDefault();
          const url = await uploadImageFile(file);
          if (url) insertImage(ed, url, fileNameAlt(file));
          return;
        }
      }
    });
  }
  function renderCoverPreview(url) {
    const box = $('coverPreview');
    if (!box) return;
    box.innerHTML = url ? '<img src="' + esc(url) + '" alt="cover preview">' : '';
  }
  function buildToolbar(tbId, editorId) {
    const tb = $(tbId);
    if (!tb || tb.dataset.built) return;
    tb.dataset.built = '1';
    const ed = $(editorId);
    const btn = (label, cmd, val, title) =>
      '<button type="button" class="rte-btn" title="' + (title || label) + '" data-cmd="' + cmd + '"' +
      (val !== undefined ? ' data-val="' + val + '"' : '') + '>' + label + '</button>';
    let html = '';
    html += btn('B', 'bold', undefined, L('加粗', 'Bold'));
    html += btn('I', 'italic', undefined, L('斜体', 'Italic'));
    html += btn('U', 'underline', undefined, L('下划线', 'Underline'));
    html += btn('S', 'strikeThrough', undefined, L('删除线', 'Strikethrough'));
    html += '<span class="rte-sep"></span>';
    html += btn('H2', 'formatBlock', '<h2>', L('标题 2', 'Heading 2'));
    html += btn('H3', 'formatBlock', '<h3>', L('标题 3', 'Heading 3'));
    html += btn('¶', 'formatBlock', '<p>', L('正文段落', 'Paragraph'));
    html += '<span class="rte-sep"></span>';
    html += btn('• 列表', 'insertUnorderedList', undefined, L('无序列表', 'Bulleted list'));
    html += btn('1. 列表', 'insertOrderedList', undefined, L('有序列表', 'Numbered list'));
    html += btn('❝', 'formatBlock', '<blockquote>', L('引用', 'Quote'));
    html += '<span class="rte-sep"></span>';
    html += '<select class="rte-sel" data-cmd="fontName" title="' + L('字体', 'Font') + '">' +
      '<option value="Microsoft YaHei">微软雅黑</option>' +
      '<option value="SimSun">宋体</option>' +
      '<option value="SimHei">黑体</option>' +
      '<option value="KaiTi">楷体</option>' +
      '<option value="Arial">Arial</option>' +
      '<option value="Georgia">Georgia</option>' +
      '<option value="Times New Roman">Times New Roman</option></select>';
    html += '<select class="rte-sel" data-cmd="fontSize" title="' + L('字号', 'Size') + '">' +
      '<option value="2">' + L('小', 'Small') + '</option>' +
      '<option value="3" selected>' + L('中', 'Medium') + '</option>' +
      '<option value="5">' + L('大', 'Large') + '</option>' +
      '<option value="6">' + L('特大', 'X-Large') + '</option></select>';
    html += '<input type="color" class="rte-color" data-cmd="foreColor" title="' + L('文字颜色', 'Text color') + '" value="#2D2D2D">';
    html += '<span class="rte-sep"></span>';
    html += '<button type="button" class="rte-btn" id="imgBtn_' + editorId + '" title="' + L('插入图片', 'Insert image') + '">🖼 ' + L('图片', 'Image') + '</button>';
    html += '<input type="file" accept="image/*" id="imgInput_' + editorId + '" style="display:none">';
    html += '<button type="button" class="rte-btn" data-img="align-left" title="' + L('左对齐', 'Align left') + '">⬅</button>';
    html += '<button type="button" class="rte-btn" data-img="align-center" title="' + L('居中', 'Center') + '">⬌</button>';
    html += '<button type="button" class="rte-btn" data-img="align-right" title="' + L('右对齐', 'Align right') + '">➡</button>';
    html += '<select class="rte-sel" data-imgsize title="' + L('图片大小', 'Image size') + '">' +
      '<option value="">' + L('图片大小', 'Image size') + '</option>' +
      '<option value="size-sm">' + L('小', 'Small') + '</option>' +
      '<option value="size-md">' + L('中', 'Medium') + '</option>' +
      '<option value="size-lg">' + L('大', 'Large') + '</option></select>';
    html += '<button type="button" class="rte-btn" data-cmd="link" data-prompt="1">🔗 ' + L('链接', 'Link') + '</button>';
    tb.innerHTML = html;

    tb.querySelectorAll('[data-cmd]').forEach((b) => {
      const cmd = b.getAttribute('data-cmd');
      b.addEventListener('mousedown', (e) => e.preventDefault()); // keep selection in editor
      b.addEventListener('click', () => {
        ed.focus();
        if (cmd === 'link') {
          const url = prompt(L('输入链接地址', 'Enter URL'), 'https://');
          if (url) document.execCommand('createLink', false, url);
          return;
        }
        const val = b.getAttribute('data-val');
        document.execCommand(cmd, false, (val !== null && val !== '') ? val : null);
      });
    });
    tb.querySelectorAll('select.rte-sel').forEach((sel) => {
      sel.addEventListener('mousedown', (e) => e.preventDefault());
      sel.addEventListener('change', () => { ed.focus(); document.execCommand(sel.getAttribute('data-cmd'), false, sel.value); });
    });
    const color = tb.querySelector('.rte-color');
    if (color) {
      color.addEventListener('mousedown', (e) => e.preventDefault());
      color.addEventListener('input', () => { ed.focus(); document.execCommand('styleWithCSS', false, true); document.execCommand('foreColor', false, color.value); });
    }
    const imgBtn = tb.querySelector('#imgBtn_' + editorId);
    const imgInput = tb.querySelector('#imgInput_' + editorId);
    imgBtn.addEventListener('click', () => imgInput.click());
    imgInput.addEventListener('change', () => {
      const file = imgInput.files && imgInput.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) { toast(L('图片过大（>8MB）', 'Image too large (>8MB)')); imgInput.value = ''; return; }
      uploadImageFile(file).then((url) => { if (url) insertImage(ed, url, fileNameAlt(file)); });
      imgInput.value = '';
    });

    // image alignment controls — operate on the selected image
    tb.querySelectorAll('[data-img]').forEach((b) => {
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => {
        const img = getSelectedImage(ed);
        if (!img) { toast(L('请先选中图片', 'Select an image first')); return; }
        img.classList.remove('align-left', 'align-center', 'align-right');
        img.classList.add('post-img', b.getAttribute('data-img'));
      });
    });
    const sizeSel = tb.querySelector('[data-imgsize]');
    if (sizeSel) {
      sizeSel.addEventListener('mousedown', (e) => e.preventDefault());
      sizeSel.addEventListener('change', () => {
        const img = getSelectedImage(ed);
        if (!img) { toast(L('请先选中图片', 'Select an image first')); sizeSel.value = ''; return; }
        img.classList.remove('size-sm', 'size-md', 'size-lg');
        if (sizeSel.value) img.classList.add('post-img', sizeSel.value);
      });
    }

    // paste an image from the clipboard directly into the editor
    attachPaste(ed);
  }

  /* ---------- modal ---------- */
  function openModal(id) {
    state.editing = id || null;
    $('modalTitle').textContent = id ? L('编辑', 'Edit') : L('新建', 'New');
    // reset
    ['f_titleZh', 'f_titleEn', 'f_summaryZh', 'f_summaryEn', 'f_cover', 'f_tags'].forEach((f) => $(f).value = '');
    $('f_bodyZh').innerHTML = '';
    $('f_bodyEn').innerHTML = '';
    $('f_type').value = state.filter === 'insight' ? 'insight' : 'news';
    renderCoverPreview('');
    $('f_status').value = 'published';
    $('f_date').value = new Date().toISOString().slice(0, 10);
    if (id) {
      window.API.getPost(id, true).then((r) => {
        if (!r.ok || !r.data.post) return;
        const p = r.data.post;
        $('f_type').value = p.type;
        $('f_titleZh').value = (p.title && p.title.zh) || '';
        $('f_titleEn').value = (p.title && p.title.en) || '';
        $('f_summaryZh').value = (p.summary && p.summary.zh) || '';
        $('f_summaryEn').value = (p.summary && p.summary.en) || '';
        $('f_bodyZh').innerHTML = (p.body && p.body.zh) || '';
        $('f_bodyEn').innerHTML = (p.body && p.body.en) || '';
        $('f_cover').value = p.cover || '';
        renderCoverPreview(p.cover || '');
        $('f_tags').value = (p.tags || []).join(', ');
        $('f_status').value = p.status || 'published';
        $('f_date').value = window.util.date(p.publishedAt);
      });
    }
    buildToolbar('tb_bodyZh', 'f_bodyZh');
    buildToolbar('tb_bodyEn', 'f_bodyEn');
    $('modal').classList.add('open');
  }
  function closeModal() { $('modal').classList.remove('open'); }
  $('modalClose').addEventListener('click', closeModal);
  $('modalCancel').addEventListener('click', closeModal);
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });

  async function doDelete(id) {
    if (!confirm(window.Lang.t('admin.confirmDelete'))) return;
    const r = await window.API.remove(id);
    if (r.ok) { toast(L('已删除', 'Deleted')); loadAndRender(); }
    else toast('Error');
  }

  $('modalSave').addEventListener('click', async () => {
    const payload = {
      type: $('f_type').value,
      status: $('f_status').value,
      publishedAt: $('f_date').value || new Date().toISOString().slice(0, 10),
      cover: $('f_cover').value.trim(),
      tags: $('f_tags').value,
      titleZh: $('f_titleZh').value.trim(),
      titleEn: $('f_titleEn').value.trim(),
      summaryZh: $('f_summaryZh').value,
      summaryEn: $('f_summaryEn').value,
      bodyZh: $('f_bodyZh').innerHTML,
      bodyEn: $('f_bodyEn').innerHTML,
    };
    if (!payload.titleZh || !payload.titleEn) { toast(L('请填写中英标题', 'Title required')); return; }
    let r;
    if (state.editing) r = await window.API.update(state.editing, payload);
    else r = await window.API.create(payload);
    if (r.ok) { closeModal(); toast(L('已保存', 'Saved')); loadAndRender(); }
    else toast('Error');
  });

  /* ---------- profile (change password) ---------- */
  $('pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cur = $('curPass').value, np = $('newPass').value, rp = $('repPass').value;
    const err = $('pwError');
    if (np.length < 6) { err.style.display = 'block'; err.textContent = L('密码至少 6 位', 'Min 6 chars'); return; }
    if (np !== rp) { err.style.display = 'block'; err.textContent = L('两次输入不一致', 'Mismatch'); return; }
    const res = await fetch('/api/profile', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cur, pass: np }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { err.style.display = 'none'; toast(L('密码已更新', 'Password updated')); $('pwForm').reset(); }
    else { err.style.display = 'block'; err.textContent = (data.error === 'invalid_current') ? L('当前密码错误', 'Wrong current password') : L('修改失败', 'Update failed'); }
  });

  /* re-render on language toggle */
  document.addEventListener('zyyt:lang', () => { if ($('appView').style.display === 'block' && $('listView').style.display !== 'none') loadAndRender(); });

  boot();
})();
