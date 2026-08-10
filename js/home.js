/* Home page dynamic rendering (stats, capability, equipment, projects, clients, latest news). */
(function () {
  const C = window.CONTENT;
  const L = (zh, en) => (window.Lang.get() === 'zh' ? zh : en);
  const esc = window.util.esc;

  function fmtNum(value) {
    // 19/19 → 仅前一个数字高亮（与单位同色）
    const slash = value.indexOf('/');
    if (slash > -1) {
      return '<span class="hl">' + esc(value.slice(0, slash)) + '</span>' + esc(value.slice(slash));
    }
    // ¥45M → 货币符号保持白色，后缀字母(M)高亮，中间数字保持白色
    const m = value.match(/^([^\d]*)([\d.,]+)([^\d]*)$/);
    if (m && m[3]) {
      return esc(m[1]) + m[2] + '<span class="hl">' + esc(m[3]) + '</span>';
    }
    return esc(value);
  }
  function renderStats() {
    const isEn = window.Lang.get() === 'en';
    document.getElementById('statGrid').innerHTML = C.stats.map((s) => {
      const value = isEn && s.enValue ? s.enValue : s.value;
      const unit = isEn && s.enUnit !== undefined ? s.enUnit : (s.unit || '');
      return '<div class="stat"><div class="num">' + fmtNum(value) + (unit ? '<span class="u">' + esc(unit) + '</span>' : '') + '</div>' +
        '<div class="label">' + esc(L(s.zh, s.en)) + '</div></div>';
    }).join('');
  }
  function renderCapability() {
    document.getElementById('capGrid').innerHTML = C.capability.map((c) =>
      '<div class="cell"><h4>' + esc(L(c.zh, c.en)) + '</h4><p>' + esc(L(c.body.zh, c.body.en)) + '</p></div>'
    ).join('');
  }
  function renderEquipment() {
    const labels = [L('设备', 'Equipment'), L('数量', 'Qty'), L('主要能力', 'Capability'), L('适用工况', 'Conditions')];
    const rows = C.equipment.map((e) => {
      const cells = [
        '<strong>' + esc(e.name) + '</strong>',
        esc(e.qty),
        esc(L(e.ability.zh, e.ability.en)),
        esc(L(e.cond.zh, e.cond.en)),
      ];
      return '<tr>' + cells.map((v, i) => '<td data-label="' + esc(labels[i]) + '">' + v + '</td>').join('') + '</tr>';
    }).join('');
    document.getElementById('equipTable').innerHTML =
      '<thead><tr><th>' + labels[0] + '</th><th>' + labels[1] + '</th><th>' +
      labels[2] + '</th><th>' + labels[3] + '</th></tr></thead><tbody>' + rows + '</tbody>';
  }
  function renderProjects() {
    const labels = [L('项目名称', 'Project'), L('矿种', 'Commodity'), L('施工内容', 'Work'),
      L('合同金额(万元)', 'Contract (¥10k)'), L('交付结果', 'Result')];
    const rows = C.projects.map((p) => {
      const cells = [
        esc(L(p.name.zh, p.name.en)),
        esc(L(p.commodity.zh, p.commodity.en)),
        esc(L(p.work.zh, p.work.en)),
        '<span class="amt">' + Number(p.amount).toFixed(2) + '</span>',
        '<span class="pass">' + esc(L(p.result.zh, p.result.en)) + '</span>',
      ];
      return '<tr>' + cells.map((v, i) => '<td data-label="' + esc(labels[i]) + '">' + v + '</td>').join('') + '</tr>';
    }).join('');
    document.getElementById('projTable').innerHTML =
      '<thead><tr><th>' + labels[0] + '</th><th>' + labels[1] + '</th><th>' +
      labels[2] + '</th><th>' + labels[3] + '</th><th>' + labels[4] + '</th></tr></thead><tbody>' + rows + '</tbody>';
  }
  function renderClients() {
    document.getElementById('clientGrid').innerHTML = C.clients.map((c) =>
      '<div class="card" style="padding:16px"><p style="margin:0;font-weight:600;color:var(--charcoal)">' + esc(L(c.zh, c.en)) + '</p></div>'
    ).join('');
  }
  function renderAll() {
    renderStats(); renderCapability(); renderEquipment(); renderProjects(); renderClients();
    window.Lang.apply();
  }

  document.addEventListener('zyyt:lang', () => {
    renderStats(); renderCapability(); renderEquipment(); renderProjects(); renderClients();
    // re-apply static i18n that common.js already handled, then refresh latest
    document.querySelectorAll('[data-i18n]').forEach((elm) => {
      const v = window.Lang.t(elm.getAttribute('data-i18n'));
      if (v != null) elm.textContent = v;
    });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderAll);
  else renderAll();
})();
