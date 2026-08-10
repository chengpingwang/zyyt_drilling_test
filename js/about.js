/* About page rendering — reuses CONTENT and the same bilingual logic as home. */
(function () {
  const C = window.CONTENT;
  const L = (zh, en) => (window.Lang.get() === 'zh' ? zh : en);
  const esc = window.util.esc;

  function paragraphs(arr) { return arr.map((p) => '<p>' + esc(p) + '</p>').join(''); }

  function render() {
    document.getElementById('profileParas').innerHTML = paragraphs(C.profileParas[L('zh', 'en')]);
    document.getElementById('orgParas').innerHTML = paragraphs(C.orgParas[L('zh', 'en')]);

    document.getElementById('capGrid').innerHTML = C.capability.map((c) =>
      '<div class="cell"><h4>' + esc(L(c.zh, c.en)) + '</h4><p>' + esc(L(c.body.zh, c.body.en)) + '</p></div>'
    ).join('');

    const elabels = [L('设备', 'Equipment'), L('数量', 'Qty'), L('主要能力', 'Capability'), L('适用工况', 'Conditions')];
    const erows = C.equipment.map((e) => {
      const cells = [
        '<strong>' + esc(e.name) + '</strong>',
        esc(e.qty),
        esc(L(e.ability.zh, e.ability.en)),
        esc(L(e.cond.zh, e.cond.en)),
      ];
      return '<tr>' + cells.map((v, i) => '<td data-label="' + esc(elabels[i]) + '">' + v + '</td>').join('') + '</tr>';
    }).join('');
    document.getElementById('equipTable').innerHTML =
      '<thead><tr><th>' + elabels[0] + '</th><th>' + elabels[1] + '</th><th>' +
      elabels[2] + '</th><th>' + elabels[3] + '</th></tr></thead><tbody>' + erows + '</tbody>';

    const plabels = [L('项目名称', 'Project'), L('矿种', 'Commodity'), L('施工内容', 'Work'),
      L('合同金额(万元)', 'Contract (¥10k)'), L('交付结果', 'Result')];
    const prows = C.projects.map((p) => {
      const cells = [
        esc(L(p.name.zh, p.name.en)),
        esc(L(p.commodity.zh, p.commodity.en)),
        esc(L(p.work.zh, p.work.en)),
        '<span class="amt">' + Number(p.amount).toFixed(2) + '</span>',
        '<span class="pass">' + esc(L(p.result.zh, p.result.en)) + '</span>',
      ];
      return '<tr>' + cells.map((v, i) => '<td data-label="' + esc(plabels[i]) + '">' + v + '</td>').join('') + '</tr>';
    }).join('');
    document.getElementById('projTable').innerHTML =
      '<thead><tr><th>' + plabels[0] + '</th><th>' + plabels[1] + '</th><th>' +
      plabels[2] + '</th><th>' + plabels[3] + '</th><th>' + plabels[4] + '</th></tr></thead><tbody>' + prows + '</tbody>';

    document.getElementById('clientGrid').innerHTML = C.clients.map((c) =>
      '<div class="card" style="padding:16px"><p style="margin:0;font-weight:600;color:var(--charcoal)">' + esc(L(c.zh, c.en)) + '</p></div>'
    ).join('');

    document.getElementById('repeatClients').innerHTML =
      '<strong>' + L('重复合作客户：', 'Repeat clients: ') + '</strong>' +
      C.repeatClients.map((c) => esc(L(c.zh, c.en))).join('、');

    document.getElementById('valueGrid').innerHTML = C.valuePoints.map((v) =>
      '<div class="cell"><h4>' + esc(L(v.title.zh, v.title.en)) + '</h4><p>' + esc(L(v.text.zh, v.text.en)) + '</p></div>'
    ).join('');

    window.Lang.apply();
  }

  document.addEventListener('zyyt:lang', () => { render(); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
