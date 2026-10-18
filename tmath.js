// 선생님 포털 · 숙제 현황에 '수학 네 공식' 진행을 붙입니다.
// 학생마다 ①~④ 칸: 잠김 / 시작 전 / 설명 보는 중(몇 장면) / 문제 푸는 중(맞힌 수·틀린 횟수) / 완료(날짜), 그리고 '지금 할 차례'.
// 기록: classes/gusan1/mathvid/{학생}/{k} = { step, q, ans, wrong, done }
(function () {
  if (typeof homeworkHTML !== 'function') return;
  const app = document.getElementById('app');
  const K = [
    { k: 1, name: '대각선의 개수', steps: 15, ans: [2, 2, 1] },
    { k: 2, name: '삼각형 내각·외각', steps: 9, ans: [1, 1, 1] },
    { k: 3, name: '내각의 합', steps: 9, ans: [1, 1, 2] },
    { k: 4, name: '외각의 합', steps: 11, ans: [1, 2, 1] }
  ];
  let MV = {};
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.tm{margin-top:4px}.tm-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}' +
    '.tm-c{background:#FBEDE8;border-radius:14px;padding:10px 12px;font-size:14px;color:var(--sub);display:flex;flex-direction:column;gap:3px;min-width:0}' +
    '.tm-c b{font-size:16px;color:var(--ink)}.tm-c em{font-style:normal;font-weight:700}.tm-c.done{background:var(--mint)}.tm-c.done em{color:var(--ok)}.tm-c.half{background:var(--yellow)}.tm-c.lock{opacity:.5}.tm-c.next{box-shadow:inset 0 0 0 3px #E8558A}' +
    '.tm-c small{font-size:12px}.tm-sum{margin-top:8px;font-size:14px}.hw-pill.tmp{background:#FFD9E2;color:#8A2A4A}.hw-pill.tmp.all{background:var(--mint);color:var(--ink)}' +
    '@media (max-width:640px){.tm-row{grid-template-columns:repeat(2,minmax(0,1fr))}}</style>');

  const rec = (id, k) => (MV[id] || {})[k] || {};
  const done = (id, k) => !!rec(id, k).done;
  const doneN = id => K.filter(x => done(id, x.k)).length;
  const nextK = id => { const x = K.find(x => !done(id, x.k)); return x ? x.k : 0; };

  function cell(id, x) {
    const r = rec(id, x.k), nk = nextK(id), lk = x.k > 1 && !done(id, x.k - 1);
    const right = x.ans.filter((a, i) => (r.ans || {})[i] === a).length;
    const wrongs = Object.keys(r.wrong || {}).reduce((s, i) => s + (r.wrong[i] || 0), 0);
    let cls = 'tm-c', st;
    if (r.done) { cls += ' done'; st = '<em>완료 ✓</em><small>' + koTime(r.done) + '</small>' + (wrongs ? '<small>틀린 횟수 ' + wrongs + '번</small>' : '<small>한 번에 다 맞힘</small>'); }
    else if (lk) { cls += ' lock'; st = '<em>🔒 잠김</em><small>' + '①②③④'[x.k - 2] + ' 끝나면 열림</small>'; }
    else if (r.q != null) { cls += ' half'; st = '<em>문제 푸는 중</em><small>3문제 중 ' + right + '개 맞힘</small>' + (wrongs ? '<small>틀린 횟수 ' + wrongs + '번</small>' : ''); }
    else if (r.step) { cls += ' half'; st = '<em>설명 보는 중</em><small>' + Math.min(r.step + 1, x.steps) + ' / ' + x.steps + ' 장면</small>'; }
    else st = '<em>시작 전</em>';
    if (x.k === nk) cls += ' next';
    return '<div class="' + cls + '"><b>' + '①②③④'[x.k - 1] + ' ' + x.name + '</b>' + st + '</div>';
  }
  function block(id) {
    const n = doneN(id), nk = nextK(id);
    return '<div class="tm"><h3>수학 네 공식 <small>설명 듣고 문제 3개를 모두 맞혀야 완료 · 하나씩 순서대로 열림</small></h3>' +
      '<div class="tm-row">' + K.map(x => cell(id, x)).join('') + '</div>' +
      '<p class="tm-sum hint">' + (n === 4 ? '네 공식 모두 끝냈어요 🎉' : n + ' / 4 완료 · 지금 할 차례: <b>' + '①②③④'[nk - 1] + ' ' + K[nk - 1].name + '</b>') + '</p></div>';
  }
  function inject() {
    app.querySelectorAll('.card.hw').forEach(card => {
      if (card.querySelector('.tm')) return;
      const id = card.id.slice(3), head = card.querySelector('.stu');
      if (head) head.insertAdjacentHTML('afterend', block(id)); else card.insertAdjacentHTML('afterbegin', block(id));
    });
    // 맨 위 '한눈에 보기'에 수학 진행도 한 줄씩
    const sum = app.querySelector('.hw-sum');
    if (sum && !sum.querySelector('.tmp')) {
      sum.insertAdjacentHTML('beforeend', Object.keys(students).map(id => {
        const n = doneN(id), nk = nextK(id);
        return '<a href="#hw-' + esc(id) + '" class="hw-pill tmp' + (n === 4 ? ' all' : '') + '">' + esc(students[id].name) + ' · 수학 ' + n + '/4' + (n < 4 ? ' · 다음 ' + '①②③④'[nk - 1] : ' 완료') + '</a>';
      }).join(''));
    }
  }
  const draw = render;
  window.render = function () { draw(); try { if (view === 'homework') inject(); } catch (e) { } };
  store.on(BASE + '/mathvid', v => { MV = v || {}; render(); });
})();
