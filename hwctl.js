// 선생님 포털 · 숙제 다시 열기: 오늘 숙제를 한 번 더 열어 주거나, 1~7일째 중 골라 그날부터 다시 풀게 합니다.
// 틀린 단어와 지난 기록은 그대로 둡니다. 그리고 '기록 지우기'로 지운 기록은 한 번 되돌릴 수 있게 따로 보관합니다.
(function () {
  if (typeof homeworkHTML !== 'function' || typeof DAILY === 'undefined') return;
  const app = document.getElementById('app');
  const P = id => BASE + '/daily/' + id + '/' + DAILY.id;
  const TR = id => '_trash_' + id;
  const rec = id => (daily[id] || {})[DAILY.id] || null;
  let ask = '';   // 한 번 더 눌러야 적용되는 버튼
  document.head.insertAdjacentHTML('beforeend', '<style>.hc{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hc button{min-height:40px;padding:0 12px;font-size:15px}.hc button.cur{background:var(--mint);font-weight:700}.hc button.ask{background:var(--pink)}.hc button:disabled{opacity:.45;cursor:default}</style>');

  // 오늘 이미 끝낸 학생이면 '어제 끝낸 것'으로 돌려 오늘 다시 풀 수 있게 합니다 (연속 일수는 그대로 이어지게)
  function reopen(r) {
    const up = {}, today = koDate(store.now());
    if (r && r.lastDate === today) { up.lastDate = koDate(store.now() - 86400000); up.streak = Math.max(0, (r.streak || 1) - 1); }
    return up;
  }
  function controls(id) {
    const r = rec(id), n = DAILY.days.length, today = koDate(store.now()), done = !!r && r.lastDate === today, cur = r ? (r.day || 0) : 0;
    const tr = daily[TR(id)];
    let h = '<h3>숙제 다시 열기 <small>틀린 단어와 지난 기록은 그대로 남습니다</small></h3><div class="hc">' +
      '<button class="plain' + (ask === 'again' + id ? ' ask' : '') + '" data-act="hc-again" data-id="' + esc(id) + '"' + (done ? '' : ' disabled') + '>' +
      (ask === 'again' + id ? '한 번 더 누르면 열립니다' : (done ? '오늘 숙제 한 번 더 열기' : '오늘 숙제는 아직 열려 있음')) + '</button></div>' +
      '<div class="hc" style="margin-top:8px"><span class="hint" style="font-size:14px">몇 일째부터 다시 풀게 할까요?</span>';
    for (let i = 0; i < n; i++) {
      const k = 'day' + id + '/' + i;
      h += '<button class="plain' + (ask === k ? ' ask' : (i === cur ? ' cur' : '')) + '" data-act="hc-day" data-id="' + esc(id) + '" data-n="' + i + '">' + (ask === k ? (i + 1) + '일째부터 다시? 한 번 더' : (i + 1) + '일째') + '</button>';
    }
    h += '</div><p class="hint" style="font-size:13px;margin-top:6px">초록색 = 다음에 풀 차례' + (cur >= n ? ' (지금은 7일을 다 끝내고 복습 단계)' : '') + '</p>';
    if (tr && tr.at) h += '<div class="hc" style="margin-top:8px"><button class="plain' + (ask === 'undo' + id ? ' ask' : '') + '" data-act="hc-undo" data-id="' + esc(id) + '">' +
      (ask === 'undo' + id ? '지금 기록을 덮어씁니다. 한 번 더 누르면 되돌림' : '지운 기록 되돌리기 (' + koTime(tr.at) + '에 지움)') + '</button></div>';
    return h;
  }
  function inject() {
    app.querySelectorAll('.card.hw').forEach(card => {
      if (card.querySelector('.hc')) return;
      const id = card.id.slice(3), reset = card.querySelector('button[data-act="hwreset"]');
      if (reset) reset.parentNode.insertAdjacentHTML('beforebegin', controls(id)); else card.insertAdjacentHTML('beforeend', controls(id));
    });
  }
  const draw = render;
  window.render = function () { draw(); try { inject(); } catch (e) { } };

  // '기록 지우기'가 실제로 지우기 직전에(두 번째 누름) 지금 기록을 따로 보관합니다
  app.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button[data-act="hwreset"]');
    if (!b) return;
    const id = b.dataset.id;
    if (confirmDel !== 'hw' + id || (!daily[id] && !visits[id])) return;
    try { store.set(BASE + '/daily/' + TR(id), { at: store.now(), daily: daily[id] || null, visits: visits[id] || null }); } catch (err) { }
  }, true);

  app.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button[data-act^="hc-"]');
    if (!b) return;
    const id = b.dataset.id, act = b.dataset.act, r = rec(id);
    const k = act === 'hc-again' ? 'again' + id : (act === 'hc-undo' ? 'undo' + id : 'day' + id + '/' + b.dataset.n);
    if (ask !== k) { ask = k; render(); return; }
    ask = '';
    if (act === 'hc-again') { const up = reopen(r); if (Object.keys(up).length) store.update(P(id), up); else render(); }
    else if (act === 'hc-day') {
      store.update(P(id), Object.assign({ title: DAILY.title, days: DAILY.days.length, day: Number(b.dataset.n) }, reopen(r)));
    } else if (act === 'hc-undo') {
      const tr = daily[TR(id)];
      if (!tr) { render(); return; }
      if (tr.daily) store.set(BASE + '/daily/' + id, tr.daily);
      if (tr.visits) store.set(BASE + '/visits/' + id, tr.visits);
      store.remove(BASE + '/daily/' + TR(id));
    }
  });
  render();
})();
