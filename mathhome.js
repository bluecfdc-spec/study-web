// 학생 대기실: 맨 위에 '수학 네 공식 외우기' 카드, 그 아래 '수학 공식 간단 보기' 카드, 1·2·3·4 숙제 체크판.
// 공식은 하나씩 열립니다: ①을 3문제 모두 맞혀 끝내야 ②가 열리고, ②를 끝내야 ③ … 순서대로.
// 기록: classes/gusan1/mathvid/{학생}/{k} = { step, q, ans, wrong, done }
// '간단 보기'는 네 공식의 '꼭 외우기' 정리만 모아 보여 주고, 선생님 목소리(각 설명의 마지막 장면 녹음)를 들려줍니다.
(function () {
  if (typeof me === 'undefined' || typeof store === 'undefined' || typeof render !== 'function') return;
  const app = document.getElementById('app');
  const K = [
    { k: 1, name: '다각형의 대각선의 개수', f: 'n × (n − 3) ÷ 2', last: 14 },
    { k: 2, name: '삼각형의 내각과 외각', f: '∠A + ∠B = 외각', last: 8 },
    { k: 3, name: '다각형의 내각의 합', f: '180° × (n − 2)', last: 8 },
    { k: 4, name: '다각형의 외각의 합', f: '360°', last: 10 }
  ];
  // 각 설명 마지막 장면의 '꼭! 꼭! 꼭! 외우기' 정리 (math1~4.html 과 같은 내용)
  const SUM = {
    1: '<b>n각형의 대각선의 개수 = n × (n − 3) ÷ 2</b><br>① 한 꼭짓점에서 <b>자기 자신</b>과 <b>양옆 2개</b>를 뺀 <b>(n − 3)개</b>를 그을 수 있다<br>② 꼭짓점이 <b>n개</b>이므로 <b>n × (n − 3)</b><br>③ 한 대각선을 <b>두 번</b> 세었으므로 <b>÷ 2</b>',
    2: '<b>마주 보는 두 내각의 합</b> = <b>삼각형의 한 외각</b><br>① 일직선의 <b>평각은 180°</b><br>② 삼각형의 <b>세 내각의 합도 180°</b><br>③ 그래서 <b>외각은 마주 보는 두 내각의 합과 같다</b>',
    3: '<b>n각형의 내각의 합 = 180° × (n − 2)</b><br>① 삼각형 한 개의 내각의 합은 <b>180°</b><br>② 다각형 안에 삼각형이 몇 개인지 세면 내각의 합을 알 수 있다<br>③ 다각형 안의 삼각형은 항상 <b>(n − 2)개</b> → 그래서 <b>180° × (n − 2)</b>',
    4: '<b>다각형의 외각의 합 = 360°</b> (몇 각형이든 똑같다)<br>① 꼭짓점 하나에서 <b>내각 + 외각 = 180°</b> (일직선의 평각)<br>② 꼭짓점 n개를 전부 더하면 <b>180° × n</b> — 여기엔 <b>내각 n개 + 외각 n개</b>가 다 들어 있다<br>③ 안쪽 내각의 합 <b>180° × (n − 2)</b>를 빼면 외각만 남는다 → <b>180° × 2 = 360°</b>'
  };
  let MV = {}, sumK = 1, sumAudio = {}, playing = null;
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.lb-card.c-math{background:#E8558A;color:#fff;box-shadow:0 6px 0 #B83A68;font-size:24px}.lb-card.c-math small{color:#FFE3EE}' +
    '.lb-card.c-sum{background:#FFD9E2;box-shadow:0 4px 0 #F29BB5}.lb-card.c-sum small{color:#8A4A60}' +
    '.mv-board{background:#fff;border-radius:26px;padding:14px 12px}.mv-title{display:flex;justify-content:space-between;font-size:16px;color:var(--sub);padding:0 6px 8px}' +
    '.mv-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}' +
    '.mv-cell{aspect-ratio:1/1.1;border-radius:16px;background:#FBEDE8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:13px;color:var(--sub)}' +
    '.mv-cell b{font-size:26px;font-weight:400;color:var(--ink)}.mv-cell.done{background:var(--mint)}.mv-cell.done b{color:#1F5C45}.mv-cell.half{background:var(--yellow)}.mv-cell.next{box-shadow:inset 0 0 0 3px #E8558A}.mv-cell.soon{opacity:.45}' +
    '.mv-item{background:#fff;border-radius:24px;padding:16px 18px;font-size:20px;text-align:left;width:100%;display:flex;align-items:center;gap:14px}' +
    '.mv-item .num{flex:none;width:44px;height:44px;border-radius:50%;background:var(--yellow);display:flex;align-items:center;justify-content:center;font-size:22px}' +
    '.mv-item.done .num{background:var(--mint);color:#1F5C45}.mv-item small{display:block;font-size:14px;color:var(--sub);margin-top:2px}.mv-item:disabled{opacity:.5;cursor:default}' +
    '.mv-item .st{margin-left:auto;flex:none;font-size:14px;color:var(--sub)}.mv-item.done .st{color:#1F5C45;font-weight:700}.mv-item.next{box-shadow:inset 0 0 0 3px #E8558A}' +
    '.ms-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.ms-tabs button{min-height:52px;border-radius:18px;background:#fff;font-size:20px}.ms-tabs button.on{background:#E8558A;color:#fff}' +
    '.ms-card{background:var(--mint);border-radius:24px;padding:16px 18px;font-family:"Noto Sans KR","Apple SD Gothic Neo",sans-serif;font-size:16px;line-height:1.75;word-break:keep-all}' +
    '.ms-card .must{display:inline-block;background:#E5484D;color:#fff;border-radius:999px;padding:3px 12px;font-size:14px;font-weight:700;margin-bottom:8px}' +
    '.ms-card b{background:var(--yellow);border-radius:6px;padding:0 3px}.ms-name{font-size:20px;text-align:center}' +
    '.ms-say{min-height:56px;border-radius:22px;background:var(--pink2);font-size:20px;color:#3A2230}.ms-say:disabled{opacity:.45}</style>');

  const rec = k => (MV[me] || {})[k] || {};
  const state = k => { const r = rec(k); return r.done ? 'done' : (r.step || r.q != null ? 'half' : ''); };
  const locked = x => x.k > 1 && state(x.k - 1) !== 'done';                 // 바로 앞 공식을 끝내야 열림
  const doneN = () => K.filter(x => state(x.k) === 'done').length;
  const nextK = () => { const x = K.find(x => state(x.k) !== 'done'); return x ? x.k : 0; };   // 지금 할 차례
  const href = k => 'math' + k + '.html?sid=' + encodeURIComponent(me) + (MOCK ? '&mock' : '');

  function card() {
    const n = doneN(), nk = nextK();
    return '<button class="lb-card c-math" data-art="icon_math" data-act="m-open">수학 네 공식 외우기<small>' + (n === 4 ? '4개 모두 완료! 다시 봐도 좋아요' : '지금 할 차례: ' + '①②③④'[nk - 1] + ' · ' + n + ' / 4 완료') + '</small></button>' +
      '<button class="lb-card c-sum" data-art="obj_pencil" data-act="m-sum">수학 공식 간단 보기<small>네 공식 꼭 외우기 정리 · 선생님 목소리</small></button>';
  }
  function board() {
    const nk = nextK();
    return '<div class="mv-board"><div class="mv-title"><span>수학 공식 숙제 체크</span><span>' + doneN() + ' / 4</span></div><div class="mv-row">' + K.map(x => {
      const lk = locked(x), s = lk ? 'soon' : state(x.k);
      return '<div class="mv-cell ' + s + (x.k === nk ? ' next' : '') + '"><b>' + (s === 'done' ? '✓' : lk ? '🔒' : x.k) + '</b>' + (lk ? '잠김' : s === 'done' ? '완료' : s === 'half' ? '하는 중' : '시작 전') + '</div>';
    }).join('') + '</div></div>';
  }
  function listHTML() {
    const nk = nextK();
    return '<h1>수학 네 공식 외우기</h1><p class="sub">설명을 듣고 문제 3개를 모두 맞히면 완료! 하나를 끝내야 다음 공식이 열려요</p>' + K.map(x => {
      const s = state(x.k), r = rec(x.k), lk = locked(x);
      return '<button class="mv-item ' + s + (x.k === nk ? ' next' : '') + '" data-act="m-go" data-k="' + x.k + '"' + (lk ? ' disabled' : '') + '><span class="num">' + (s === 'done' ? '✓' : lk ? '🔒' : x.k) + '</span><span>' + esc(x.name) + '<small>' + (lk ? '①②③④'[x.k - 2] + '을 끝내면 열려요' : esc(x.f)) + '</small></span>' +
        '<span class="st">' + (lk ? '잠김' : s === 'done' ? '완료' : s === 'half' ? (r.q != null ? '문제 풀기' : '이어 보기') : '시작') + '</span></button>';
    }).join('') + '<button class="big" data-act="m-exit" style="margin-top:auto">대기실로</button>';
  }
  function sumHTML() {
    const x = K[sumK - 1], has = !!sumAudio[sumK];
    return '<h1>수학 공식 간단 보기</h1>' +
      '<div class="ms-tabs">' + K.map(y => '<button type="button" data-act="m-tab" data-k="' + y.k + '" class="' + (y.k === sumK ? 'on' : '') + '">' + '①②③④'[y.k - 1] + '</button>').join('') + '</div>' +
      '<p class="ms-name">' + esc(x.name) + '</p>' +
      '<div class="ms-card"><span class="must">꼭! 꼭! 꼭! 외우기</span><br>' + SUM[sumK] + '</div>' +
      '<button class="ms-say" data-act="m-say"' + (has ? '' : ' disabled') + '>' + (playing ? '⏹ 그만 듣기' : has ? '🔊 선생님 목소리 듣기' : '목소리 준비 중') + '</button>' +
      '<button class="big" data-act="m-exit" style="margin-top:auto">대기실로</button>';
  }
  function stopSay() { if (playing) { try { playing.pause(); playing.currentTime = 0; } catch (e) { } playing = null; } }
  function loadVoices() {   // 각 공식의 마지막 장면 녹음을 미리 받아 둡니다 (누르는 순간 바로 나오게)
    K.forEach(x => {
      if (sumAudio[x.k] !== undefined) return;
      sumAudio[x.k] = null;
      store.get(BASE + '/voice/' + x.k + '/' + x.last).then(v => { if (v && v.d) { const a = new Audio(v.d); a.preload = 'auto'; a.onended = () => { if (playing === a) { playing = null; if (screen === 'mathsum') render(); } }; sumAudio[x.k] = a; if (screen === 'mathsum') render(); } }).catch(() => { });
    });
  }

  const draw = render;
  window.render = function () {
    const mock = () => (app.querySelector('.mock') || { outerHTML: '' }).outerHTML;
    if (me && screen === 'mathvid') { app.innerHTML = mock() + listHTML(); return; }
    if (me && screen === 'mathsum') { app.innerHTML = mock() + sumHTML(); return; }
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
    e.stopPropagation();
    const act = b.dataset.act;
    if (act !== 'm-say') Sound.tap();
    if (act === 'm-open') { screen = 'mathvid'; render(); }
    else if (act === 'm-sum') { screen = 'mathsum'; loadVoices(); render(); }
    else if (act === 'm-tab') { stopSay(); sumK = Number(b.dataset.k); render(); }
    else if (act === 'm-say') { if (playing) { stopSay(); render(); return; } const a = sumAudio[sumK]; if (a) { playing = a; a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => { playing = null; render(); }); render(); } }
    else if (act === 'm-exit') { stopSay(); screen = 'lobby'; if (typeof sync === 'function') sync(); render(); }
    else if (act === 'm-go') location.href = href(b.dataset.k);
  }, true);
  store.on(BASE + '/mathvid', v => { MV = v || {}; if (me && (screen === 'lobby' || screen === 'mathvid')) render(); });
  if (me && screen === 'lobby') render();
})();
