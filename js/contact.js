/* Contact page rendering — reads window.CONTACT (single source, shared with footer). */
(function () {
  const esc = window.util.esc;

  // Brand social icons (24x24 simple-icons paths)
  const ICON = {
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.78-2.12 5.95-1.93.41.05.81.13 1.21.24v4.41c-.21-.04-.43-.07-.65-.09-1.06-.16-2.15.03-2.98.62-.63.43-1.05 1.12-1.21 1.86-.13.67-.09 1.35-.01 2.02.14 1.19.76 2.18 1.74 2.74.84.48 1.87.65 2.85.49.83-.13 1.61-.57 2.13-1.25.39-.46.62-1.04.66-1.65.08-1.29.02-2.58.01-3.87 0-1.29.01-2.58.01-3.87v-9.02c-.01-.62-.18-1.23-.5-1.77-.44-.73-1.15-1.23-1.97-1.39z',
  };

  function render() {
    const c = window.CONTACT || {};
    const lang = window.Lang.get();
    const en = (lang === 'en');
    const email = c.email || 'info@zyyt-drilling.com';
    const tel = c.tel || (en ? '(TBD)' : '（待补充）');
    const addr = (c.address && (c.address[lang] || c.address.zh)) || (en ? 'Qinghai (address TBD)' : '青海省（具体地址待补充）');
    const hours = (c.hours && (c.hours[lang] || c.hours.zh)) || (en ? 'Mon–Fri 9:00–18:00 (TBD)' : '周一至周五 9:00–18:00（待补充）');

    let html = '<li class="contact-item"><strong>' + window.Lang.t('contact.email') + '</strong>：' +
        '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a></li>' +
      '<li class="contact-item"><strong>' + window.Lang.t('contact.tel') + '</strong>：' + esc(tel) + '</li>' +
      '<li class="contact-item"><strong>' + window.Lang.t('contact.addr') + '</strong>：' + esc(addr) + '</li>' +
      '<li class="contact-item"><strong>' + window.Lang.t('contact.hours') + '</strong>：' + esc(hours) + '</li>';

    // Social: clickable brand icons (shown on the English interface), no leading label / separators
    if (en && (c.linkedin || c.facebook || c.tiktok)) {
      const ico = (key, label) =>
        '<a class="social-ico" href="' + esc(c[key]) + '" target="_blank" rel="noopener" aria-label="' + esc(label) + '" title="' + esc(label) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[key] + '"></path></svg></a>';
      html += '<li class="social-row" style="margin-top:12px; display:flex; gap:14px; align-items:center;">' +
        (c.linkedin ? ico('linkedin', 'LinkedIn') : '') +
        (c.facebook ? ico('facebook', 'Facebook') : '') +
        (c.tiktok ? ico('tiktok', 'TikTok') : '') +
        '</li>';
    }

    const el = document.getElementById('contactList');
    if (el) el.innerHTML = html;

    // CTA "send email" button
    const btn = document.getElementById('contactMailBtn');
    if (btn) btn.href = 'mailto:' + email;
  }

  document.addEventListener('zyyt:lang', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
