// 수학 공식 설명 페이지(math1~4.html) 공통: 진행 저장(이어 보기) + 설명이 끝나면 기본 문제 3개. 오답은 다시 풀기, 3문제 모두 정답이어야 숙제 완료.
// 페이지 쪽은 window.VID = { k, go, steps, cur, onChange } 를 내보냅니다. 기록: classes/gusan1/mathvid/{학생}/{k} = { step, ans:{0,1,2}, wrong:{0,1,2}, q, done }
(function () {
  if (typeof VID === 'undefined' || typeof makeStore !== 'function') return;
  if (new URLSearchParams(location.search).has('rec')) return;   // 녹음용 화면에서는 문제·저장 없음
  const Q = {
    1: [
      { q: '칠각형의 대각선은 모두 몇 개일까요?', c: ['7개', '10개', '14개', '21개'], a: 2, hint: 'n = 7 을 공식에 넣어요. 마지막에 ÷ 2 잊지 말기!', why: '칠각형은 n = 7. 공식에 넣으면 7 × (7 − 3) ÷ 2 = 7 × 4 ÷ 2 = 14개예요. 21은 2로 나누기 전 숫자(한 선을 두 번 센 것)이니 조심!' },
      { q: '한 꼭짓점에서 대각선을 5개 그을 수 있는 다각형은 몇 각형일까요?', c: ['육각형', '칠각형', '팔각형', '구각형'], a: 2, hint: '한 꼭짓점에서 긋는 대각선은 (n − 3)개. n − 3 = 5 이면 n 은?', why: '한 꼭짓점에서 그을 수 있는 대각선은 (n − 3)개. n − 3 = 5이니까 n = 8, 팔각형이에요. 자기 자신과 양옆 2개를 뺀 것이 3개라는 걸 떠올리면 돼요.' },
      { q: '사각형의 대각선은 모두 몇 개일까요?', c: ['1개', '2개', '4개', '6개'], a: 1, hint: '4 × (4 − 3) ÷ 2 를 차근차근 계산해 봐요', why: '4 × (4 − 3) ÷ 2 = 4 × 1 ÷ 2 = 2개. 사각형 안에 ✕ 모양으로 그어지는 두 줄이 바로 대각선이에요.' }
    ],
    2: [
      { q: '삼각형의 두 내각이 40°, 75°일 때, 나머지 꼭짓점의 외각은 몇 도일까요?', c: ['105°', '115°', '125°', '135°'], a: 1, hint: '외각 = 마주 보는 두 내각의 합. 더하기만 하면 돼요', why: '외각은 마주 보는 두 내각의 합. 40 + 75 = 115°예요. 나머지 내각은 180 − 115 = 65°이고, 65 + 115 = 180°(평각)이 되는 것도 확인해 보세요.' },
      { q: '삼각형의 두 내각이 55°, 55°일 때, 나머지 꼭짓점의 외각은 몇 도일까요?', c: ['100°', '110°', '120°', '125°'], a: 1, hint: '55 + 55. 180에서 빼는 게 아니에요', why: '55 + 55 = 110°. 두 내각을 더하면 바로 외각이에요. 180에서 빼는 게 아니라는 점 기억!' },
      { q: '어떤 꼭짓점의 외각이 125°이고, 마주 보는 두 내각 중 하나가 45°예요. 나머지 한 내각은 몇 도일까요?', c: ['70°', '80°', '90°', '100°'], a: 1, hint: '외각 125° = 45° + ?. 외각에서 45° 를 빼요', why: '외각 125° = 45° + ?. 그러니까 ? = 125 − 45 = 80°예요. 외각은 마주 보는 두 내각을 더한 것이니, 하나를 알면 빼서 구할 수 있어요.' }
    ],
    3: [
      { q: '팔각형의 내각의 합은 몇 도일까요?', c: ['900°', '1080°', '1260°', '1440°'], a: 1, hint: '팔각형 안 삼각형은 8 − 2 개. 거기에 180° 를 곱해요', why: '팔각형 안에는 삼각형이 8 − 2 = 6개. 180° × 6 = 1080°예요.' },
      { q: '오각형 안에는 삼각형이 몇 개 들어 있을까요? (한 꼭짓점에서 대각선을 그었을 때)', c: ['2개', '3개', '4개', '5개'], a: 1, hint: '다각형 안의 삼각형은 항상 (n − 2)개. n = 5', why: '다각형 안의 삼각형은 항상 (n − 2)개. 5 − 2 = 3개예요. 그래서 오각형 내각의 합은 180° × 3 = 540°.' },
      { q: '정육각형의 한 내각은 몇 도일까요?', c: ['100°', '108°', '120°', '135°'], a: 2, hint: '육각형 내각의 합 720° 를 여섯 각이 똑같이 나눠 가져요', why: '육각형 내각의 합은 180° × (6 − 2) = 720°. 정육각형은 여섯 각이 모두 같으니 720 ÷ 6 = 120°예요. 108°는 정오각형의 한 내각!' }
    ],
    4: [
      { q: '오각형의 외각의 합은 몇 도일까요?', c: ['180°', '360°', '540°', '720°'], a: 1, hint: '외각의 합은 몇 각형이든 똑같아요', why: '다각형의 외각의 합은 몇 각형이든 항상 360°예요. 540°는 오각형 내각의 합이니 헷갈리지 않기!' },
      { q: '정팔각형의 한 외각은 몇 도일까요?', c: ['30°', '36°', '45°', '60°'], a: 2, hint: '외각의 합 360° 를 꼭짓점 수로 똑같이 나눠요', why: '외각의 합 360° 를 8 등분하면 360 ÷ 8 = 45°예요.' },
      { q: '한 외각이 60°인 정다각형은 몇 각형일까요?', c: ['정오각형', '정육각형', '정팔각형', '정십각형'], a: 1, hint: '360° 를 60° 로 나누면 꼭짓점 수가 나와요', why: '한 외각 × 꼭짓점 수 = 360° 이니까 360 ÷ 60 = 6, 정육각형이에요.' }
    ]
  }[VID.k];
  const sid = new URLSearchParams(location.search).get('sid');
  const back = 'index.html' + (MOCK ? '?mock' : '');
  const store = makeStore();
  const path = sid ? BASE + '/mathvid/' + sid + '/' + VID.k : null;
  let rec = {}, qi = -1, tried = [], loaded = false;   // tried: 이 문제에서 이미 골라 본 오답들

  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '#quiz{display:none;flex-direction:column;gap:12px;max-width:560px;width:100%;margin:0 auto;flex:1;min-height:0;overflow:auto;justify-content:center}#quiz.on{display:flex}' +
    '.qz-top{display:flex;justify-content:space-between;font-size:15px;color:var(--sub)}' +
    '.qz-q{background:#fff;border-radius:22px;padding:18px 20px;font-size:clamp(19px,2.6vw,24px);line-height:1.5;word-break:keep-all}' +
    '.qz-c{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qz-c button{min-height:64px;border-radius:18px;font-size:20px;border:4px solid transparent;background:#fff}' +
    '.qz-c button.ok{background:var(--mintL);border-color:var(--mint)}.qz-c button.no{background:#FFD9E2;border-color:var(--pink)}.qz-c button:disabled{cursor:default}' +
    '.qz-why{background:var(--yellowL);border-radius:18px;padding:14px 18px;font-size:clamp(16px,2.2vw,20px);line-height:1.6;word-break:keep-all}' +
    '.qz-why b{display:block;margin-bottom:4px}.qz-done{background:var(--mintL);border-radius:22px;padding:22px;text-align:center;font-family:var(--display);font-size:30px;line-height:1.4}' +
    '.qz-done small{display:block;font-family:var(--body);font-size:16px;color:var(--sub);margin-top:6px}' +
    '#quiz.on{overflow:hidden}.qz-fig{flex:1 1 auto;min-height:110px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:22px;padding:6px}' +
    '.qz-fig svg.qz-svg{visibility:visible !important;width:100% !important;height:100% !important;max-height:none !important;max-width:none !important;margin:0 !important;flex:none}' +
    '.qz-svg .fe{fill:#FFF8F4;stroke:#4A3B47;stroke-width:3.5;stroke-linejoin:round}.qz-svg .fl{stroke:#4A3B47;stroke-width:3.5;stroke-linecap:round}.qz-svg .fg{stroke:#58B894;stroke-width:3;stroke-linecap:round}' +
    '.qz-svg .fd{stroke:#4A3B47;stroke-width:3;stroke-dasharray:8 7;stroke-linecap:round}.qz-svg .fx{stroke:#B9A8B3;stroke-width:3;stroke-dasharray:4 8;stroke-linecap:round}.qz-svg .fv{fill:#4A3B47}.qz-svg .fy{fill:#F2B24C;stroke:#4A3B47;stroke-width:2}' +
    '.qz-svg text{font-family:var(--display);text-anchor:middle}.qz-svg .ft{font-size:19px;fill:#4A3B47}.qz-svg .fq{font-size:28px;fill:#E5484D}.qz-svg .fn{font-size:16px;fill:#8A7584}.qz-svg .fh{font-size:16px;fill:#8A7584}' +
    '.qz-slot{flex:none;height:132px;display:flex;flex-direction:column;justify-content:flex-start}.qz-slot .qz-why{flex:1;overflow:hidden}' +
    '@media (max-width:680px){.qz-q{padding:10px 14px;font-size:17px;line-height:1.45}.qz-c button{min-height:48px;font-size:17px}.qz-c{gap:8px}.qz-why{padding:10px 14px;font-size:14px;line-height:1.5}.qz-done{font-size:24px;padding:14px}#quiz{gap:7px}.qz-slot{height:126px}body.quizon h1{font-size:20px}}</style>');
  // 문제 그림(mathfig.js)을 불러와 그림이 오면 다시 그립니다
  if (!window.MATHFIG) { const sc = document.createElement('script'); sc.src = 'mathfig.js?v=' + Date.now(); sc.onload = () => { if (quiz && quiz.classList.contains('on')) drawQuiz(); }; document.body.appendChild(sc); }
  const main = document.querySelector('main'), bar = document.querySelector('.bar');
  const quiz = document.createElement('div'); quiz.id = 'quiz'; main.insertBefore(quiz, bar);
  const $ = id => document.getElementById(id);
  const save = o => { Object.assign(rec, o); if (path) store.update(path, o); };

  function showQuiz(on) {
    document.querySelectorAll('.row,.memo,hr').forEach(e => { e.style.display = on ? 'none' : ''; });
    quiz.classList.toggle('on', on); document.body.classList.toggle('quizon', on);
    $('prev').style.visibility = on ? 'hidden' : '';
  }
  const solved = i => (rec.ans || {})[i] === Q[i].a;
  const allSolved = () => Q.every((x, i) => solved(i));
  const firstOpen = () => { for (let i = 0; i < Q.length; i++) if (!solved(i)) return i; return Q.length; };
  function drawQuiz() {
    const wrong = rec.wrong || {};
    if (qi >= Q.length) {
      const miss = Q.map((x, i) => i).filter(i => wrong[i]);
      quiz.innerHTML = '<div class="qz-done">숙제 완료! 🎉<small>' + Q.length + '문제 모두 정답' + (miss.length ? ' · 한 번에 못 맞힌 문제는 설명을 다시 읽어 봐요' : ' · 한 번에 다 맞혔어요, 완벽!') + '</small></div>' +
        (miss.length ? '<div class="qz-why">' + miss.map(i => '<b>' + (i + 1) + '번 정답: ' + esc(Q[i].c[Q[i].a]) + '</b>' + esc(Q[i].hint)).join('<br>') + '</div>' : '');
      $('next').textContent = '대기실로'; $('next').disabled = false; return;
    }
    const x = Q[qi], ok = solved(qi);
    quiz.innerHTML = '<div class="qz-top"><span>공식 ' + VID.k + ' · 확인 문제</span><span>' + (qi + 1) + ' / ' + Q.length + '</span></div>' +
      '<div class="qz-fig">' + (window.MATHFIG ? MATHFIG(VID.k, qi) : '') + '</div>' +
      '<div class="qz-q">' + esc(x.q) + '</div><div class="qz-c">' + x.c.map((c, i) => '<button type="button" data-i="' + i + '" class="' + (ok && i === x.a ? 'ok' : (tried.includes(i) ? 'no' : '')) + '"' + (ok || tried.includes(i) ? ' disabled' : '') + '>' + esc(c) + '</button>').join('') + '</div>' +
      '<div class="qz-slot">' + (ok ? '<div class="qz-why"><b>정답이에요!</b>' + esc(x.why) + '</div>' : tried.length ? '<div class="qz-why"><b>아쉬워요. 다시 골라 봐요 (' + tried.length + '번 틀림)</b>힌트: ' + esc(x.hint) + '</div>' : '') + '</div>';
    $('next').textContent = ok ? (qi + 1 < Q.length ? '다음 문제 →' : '결과 보기') : (tried.length ? '다시 풀기' : '답을 골라요');
    $('next').disabled = !ok;
  }
  quiz.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b || solved(qi)) return;
    const i = Number(b.dataset.i);
    if (i === Q[qi].a) {
      const ans = Object.assign({}, rec.ans || {}); ans[qi] = i;
      const o = { ans: ans, q: qi }; if (allSolvedWith(ans)) o.done = store.now();
      save(o);
    } else {
      if (!tried.includes(i)) tried.push(i);
      const wrong = Object.assign({}, rec.wrong || {}); wrong[qi] = (wrong[qi] || 0) + 1;
      save({ wrong: wrong, q: qi });
    }
    drawQuiz();
  });
  const allSolvedWith = ans => Q.every((x, i) => ans[i] === x.a);
  function startQuiz(i) { qi = i; tried = []; showQuiz(true); drawQuiz(); }

  // '다음' 버튼: 설명이 끝나면 문제로, 문제가 끝나면 대기실로
  $('next').addEventListener('click', e => {
    if (!quiz.classList.contains('on')) {
      if (VID.cur() === VID.steps - 1 && VID.atEnd) { e.stopImmediatePropagation(); startQuiz(firstOpen()); }
      return;
    }
    e.stopImmediatePropagation();
    if (qi >= Q.length) { location.href = back; return; }
    if (!solved(qi)) return;
    let n2 = qi + 1; while (n2 < Q.length && solved(n2)) n2++;
    if (n2 >= Q.length) n2 = firstOpen();          // 안 푼 문제가 남았으면 그리로, 다 풀었으면 결과(Q.length)
    qi = n2;
    tried = []; save({ q: qi }); drawQuiz();
  }, true);
  $('prev').addEventListener('click', e => { if (quiz.classList.contains('on')) { e.stopImmediatePropagation(); showQuiz(false); $('next').disabled = false; VID.go(VID.cur()); } }, true);
  $('home').addEventListener('click', () => { if (quiz.classList.contains('on')) { showQuiz(false); $('next').disabled = false; } }, true);

  // 마지막 설명 단계에서는 '처음부터' 대신 '문제 풀기'
  const cur = VID.onChange;
  VID.onChange = n => { if (cur) cur(n); document.body.classList.toggle('final', n === VID.steps - 1); if (n === VID.steps - 1) { $('next').textContent = (innerWidth <= 680 ? '문제 풀기 →' : '문제 풀기 (3문제) →'); VID.atEnd = true; } else VID.atEnd = false; if (loaded && path) store.update(path, { step: n }); };

  // 이어 보기: 저장된 단계·문제로
  async function load() {
    if (path) rec = (await store.get(path)) || {};
    loaded = true;
    if (new URLSearchParams(location.search).has('quiz')) { rec = {}; VID.go(VID.steps - 1); startQuiz(0); return; }   // 문제만 바로 풀어 보기(선생님 확인용)
    if (rec.done && !allSolved()) { save({ done: null }); delete rec.done; }   // 예전 기록: 오답이 있으면 완료 취소
    if (rec.q != null && rec.step === VID.steps - 1) { VID.go(VID.steps - 1); startQuiz(allSolved() ? Q.length : firstOpen()); }
    else if (rec.step) VID.go(Math.min(rec.step, VID.steps - 1));
    else VID.onChange(VID.cur());
    if (!sid) document.querySelector('.step').textContent += ' · 기록 안 됨';
  }
  // 대기실로 돌아가는 링크
  bar.insertAdjacentHTML('afterbegin', '<a href="' + back + '" style="font-size:14px;color:var(--sub)">← 대기실</a>');
  load();
})();
