// 학생 대기실: 맨 위에 '수학 네 공식 외우기' 카드와 1·2·3·4 숙제 체크판. 영어 도장판과 '수업 중 오답노트' 버튼은 숨깁니다.
// 누르면 공식 목록(1·2·3) → 각각 math1~3.html(설명 + 확인 문제 3개). 기록: classes/gusan1/mathvid/{학생}/{k}
(function () {
  if (typeof me === 'undefined' || typeof store === 'undefined' || typeof render !== 'function') return;
  const app = document.getElementById('app');
  const K = [
    { k: 1, name: '다각형의 대각선의 개수', f: 'n × (n − 3) ÷ 2' },
    { k: 2, name: '삼각형의 내각과 외각', f: '∠A + ∠B = 외각' },
    { k: 3, name: '다각형의 내각의 합', f: '180° × (n − 2)' },
    { k: 4, name: '다각형의 외각의 합', f: '360°', lock: true }   // 1·2·3 을 다 끝내야 열림
  ];
  let MV = {};
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.lb-card.c-math{background:var(--yellow)}' +
    '.mv-board{background:#fff;border-radius:26px;padding:14px 12px}.mv-title{display:flex;justify-content:space-between;font-size:16px;color:var(--sub);padding:0 6px 8px}' +
    '.mv-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}' +
    '.mv-cell{aspect-ratio:1/1.1;border-radius:16px;background:#FBEDE8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:13px;color:var(--sub)}' +
    '.mv-cell b{font-size:26px;font-weight:400;color:var(--ink)}.mv-cell.done{background:var(--mint)}.mv-cell.done b{color:#1F5C45}.mv-cell.half{background:var(--yellow)}.mv-cell.soon{opacity:.45}' +
    '.mv-item{background:#fff;border-radius:24px;padding:16px 18px;font-size:20px;text-align:left;width:100%;display:flex;align-items:center;gap:14px}' +
    '.mv-item .num{flex:none;width:44px;height:44px;border-radius:50%;background:var(--yellow);display:flex;align-items:center;justify-content:center;font-size:22px}' +
    '.mv-item.done .num{background:var(--mint);color:#1F5C45}.mv-item small{display:block;font-size:14px;color:var(--sub);margin-top:2px}.mv-item:disabled{opacity:.5;cursor:default}' +
    '.mv-item .st{margin-left:auto;flex:none;font-size:14px;color:var(--sub)}.mv-item.done .st{color:#1F5C45;font-weight:700}</style>');
  const rec = k => (MV[me] || {})[k] || {};
  const state = k => { const r = rec(k); return r.done ? 'done' : (r.step || r.q != null ? 'half' : ''); };
  const base3 = () => K.filter(x => !x.lock && state(x.k) === 'done').length;   // 1·2·3 완료 수
  const open4 = () => base3() === 3;
  const locked = x => x.lock && !open4();
  const doneN = () => K.filter(x => state(x.k) === 'done').length;
  const href = k => 'math' + k + '.html?sid=' + encodeURIComponent(me) + (MOCK ? '&mock' : '');

  function card() {
    const n = doneN();
    return '<button class="lb-card c-math" data-art="icon_math" data-act="m-open">수학 네 공식 외우기<small>' + (n === 4 ? '4개 모두 완료! 다시 봐도 좋아요' : n === 3 ? '④ 외각의 합이 열렸어요! · 3 / 4 완료' : '설명 듣고 문제 3개 · ' + n + ' / 4 완료') + '</small></button>';
  }
  function board() {
    return '<div class="mv-board"><div class="mv-title"><span>수학 공식 숙제 체크</span><span>' + doneN() + ' / 4</span></div><div class="mv-row">' + K.map(x => {
      const s = locked(x) ? 'soon' : state(x.k);
      return '<div class="mv-cell ' + s + '"><b>' + (s === 'done' ? '✓' : locked(x) ? '🔒' : x.k) + '</b>' + (locked(x) ? '잠김' : s === 'done' ? '완료' : s === 'half' ? '보는 중' : '아직') + '</div>';
    }).join('') + '</div></div>';
  }
  function listHTML() {
    return '<h1>수학 네 공식 외우기</h1><p class="sub">설명을 듣고 문제 3개를 모두 맞히면 완료! ①②③을 끝내면 ④가 열려요</p>' + K.map(x => {
      const s = state(x.k), r = rec(x.k), lk = locked(x);
      return '<button class="mv-item ' + s + '" data-act="m-go" data-k="' + x.k + '"' + (lk ? ' disabled' : '') + '><span class="num">' + (s === 'done' ? '✓' : lk ? '🔒' : x.k) + '</span><span>' + esc(x.name) + '<small>' + (lk ? '①②③을 다 끝내면 열려요' : esc(x.f)) + '</small></span>' +
        '<span class="st">' + (lk ? '잠김' : s === 'done' ? '완료' : s === 'half' ? (r.q != null ? '문제 ' + (Math.min(r.q, 2) + 1) + '번부터' : '이어 보기') : '시작') + '</span></button>';
    }).join('') + '<button class="big" data-act="m-exit" style="margin-top:auto">대기실로</button>';
  }

  const draw = render;
  window.render = function () {
    if (me && screen === 'mathvid') { app.innerHTML = (app.querySelector('.mock') || { outerHTML: '' }).outerHTML + listHTML(); return; }
    draw();
    if (!me || screen !== 'lobby') return;
    const st = app.querySelector('.st-board'); if (st) st.remove();                               // 영어 도장판 숨김
    const nb = app.querySelector('.lb-card[data-act="n-mode"]'); if (nb) nb.remove();            // 수업 중 오답노트 숨김
    const first = app.querySelector('.d-card');                                                   // 영어 미션 카드 앞에 끼워 넣음
    if (first && !app.querySelector('[data-act="m-open"]')) {
      first.insertAdjacentHTML('beforebegin', card() + board());
      if (typeof window.decorate === 'function') window.decorate();
    }
  };
  app.addEventListener('click', e => {
    const b = e.target.closest('button[data-act^="m-"]'); if (!b) return;
    e.stopPropagation(); Sound.tap();
    const act = b.dataset.act;
    if (act === 'm-open') { screen = 'mathvid'; render(); }
    else if (act === 'm-exit') { screen = 'lobby'; if (typeof sync === 'function') sync(); render(); }
    else if (act === 'm-go') location.href = href(b.dataset.k);
  }, true);
  store.on(BASE + '/mathvid', v => { MV = v || {}; if (me && (screen === 'lobby' || screen === 'mathvid')) render(); });
  if (me && screen === 'lobby') render();
})();
