// 수학 공식 설명 페이지(math1~3.html) 공통: 진행 저장(이어 보기) + 설명이 끝나면 기본 문제 3개 + 숙제 완료 표시.
// 페이지 쪽은 window.VID = { k, go, steps, cur, onChange } 를 내보냅니다. 기록: classes/gusan1/mathvid/{학생}/{k} = { step, ans:{0,1,2}, done }
(function () {
  if (typeof VID === 'undefined' || typeof makeStore !== 'function') return;
  const Q = {
    1: [
      { q: '칠각형의 대각선은 모두 몇 개일까요?', c: ['7개', '10개', '14개', '21개'], a: 2, why: '칠각형은 n = 7. 공식에 넣으면 7 × (7 − 3) ÷ 2 = 7 × 4 ÷ 2 = 14개예요. 21은 2로 나누기 전 숫자(한 선을 두 번 센 것)이니 조심!' },
      { q: '한 꼭짓점에서 대각선을 5개 그을 수 있는 다각형은 몇 각형일까요?', c: ['육각형', '칠각형', '팔각형', '구각형'], a: 2, why: '한 꼭짓점에서 그을 수 있는 대각선은 (n − 3)개. n − 3 = 5이니까 n = 8, 팔각형이에요. 자기 자신과 양옆 2개를 뺀 것이 3개라는 걸 떠올리면 돼요.' },
      { q: '사각형의 대각선은 모두 몇 개일까요?', c: ['1개', '2개', '4개', '6개'], a: 1, why: '4 × (4 − 3) ÷ 2 = 4 × 1 ÷ 2 = 2개. 사각형 안에 ✕ 모양으로 그어지는 두 줄이 바로 대각선이에요.' }
    ],
    2: [
      { q: '삼각형의 두 내각이 40°, 75°일 때, 나머지 꼭짓점의 외각은 몇 도일까요?', c: ['105°', '115°', '125°', '135°'], a: 1, why: '외각은 마주 보는 두 내각의 합. 40 + 75 = 115°예요. 나머지 내각은 180 − 115 = 65°이고, 65 + 115 = 180°(평각)이 되는 것도 확인해 보세요.' },
      { q: '삼각형의 두 내각이 55°, 55°일 때, 나머지 꼭짓점의 외각은 몇 도일까요?', c: ['100°', '110°', '120°', '125°'], a: 1, why: '55 + 55 = 110°. 두 내각을 더하면 바로 외각이에요. 180에서 빼는 게 아니라는 점 기억!' },
      { q: '어떤 꼭짓점의 외각이 125°이고, 마주 보는 두 내각 중 하나가 45°예요. 나머지 한 내각은 몇 도일까요?', c: ['70°', '80°', '90°', '100°'], a: 1, why: '외각 125° = 45° + ?. 그러니까 ? = 125 − 45 = 80°예요. 외각은 마주 보는 두 내각을 더한 것이니, 하나를 알면 빼서 구할 수 있어요.' }
    ],
    3: [
      { q: '팔각형의 내각의 합은 몇 도일까요?', c: ['900°', '1080°', '1260°', '1440°'], a: 1, why: '팔각형 안에는 삼각형이 8 − 2 = 6개. 180° × 6 = 1080°예요.' },
      { q: '오각형 안에는 삼각형이 몇 개 들어 있을까요? (한 꼭짓점에서 대각선을 그었을 때)', c: ['2개', '3개', '4개', '5개'], a: 1, why: '다각형 안의 삼각형은 항상 (n − 2)개. 5 − 2 = 3개예요. 그래서 오각형 내각의 합은 180° × 3 = 540°.' },
      { q: '정육각형의 한 내각은 몇 도일까요?', c: ['100°', '108°', '120°', '135°'], a: 2, why: '육각형 내각의 합은 180° × (6 − 2) = 720°. 정육각형은 여섯 각이 모두 같으니 720 ÷ 6 = 120°예요. 108°는 정오각형의 한 내각!' }
    ]
  }[VID.k];
  const sid = new URLSearchParams(location.search).get('sid');
  const back = 'index.html' + (MOCK ? '?mock' : '');
  const store = makeStore();
  const path = sid ? BASE + '/mathvid/' + sid + '/' + VID.k : null;
  let rec = {}, qi = -1, picked = null, loaded = false;

  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '#quiz{display:none;flex-direction:column;gap:14px;max-width:560px;width:100%;margin:0 auto}#quiz.on{display:flex}' +
    '.qz-top{display:flex;justify-content:space-between;font-size:15px;color:var(--sub)}' +
    '.qz-q{background:#fff;border-radius:22px;padding:18px 20px;font-size:clamp(19px,2.6vw,24px);line-height:1.5;word-break:keep-all}' +
    '.qz-c{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qz-c button{min-height:64px;border-radius:18px;font-size:20px;border:4px solid transparent;background:#fff}' +
    '.qz-c button.ok{background:var(--mintL);border-color:var(--mint)}.qz-c button.no{background:#FFD9E2;border-color:var(--pink)}.qz-c button:disabled{cursor:default}' +
    '.qz-why{background:var(--yellowL);border-radius:18px;padding:14px 18px;font-size:clamp(16px,2.2vw,20px);line-height:1.6;word-break:keep-all}' +
    '.qz-why b{display:block;margin-bottom:4px}.qz-done{background:var(--mintL);border-radius:22px;padding:22px;text-align:center;font-family:var(--display);font-size:30px;line-height:1.4}' +
    '.qz-done small{display:block;font-family:var(--body);font-size:16px;color:var(--sub);margin-top:6px}' +
    '@media (max-width:680px){.memo{white-space:normal}svg{max-height:46vh}}</style>');
  const main = document.querySelector('main'), bar = document.querySelector('.bar');
  const quiz = document.createElement('div'); quiz.id = 'quiz'; main.insertBefore(quiz, bar);
  const $ = id => document.getElementById(id);
  const save = o => { Object.assign(rec, o); if (path) store.update(path, o); };

  function showQuiz(on) {
    document.querySelectorAll('.row,.memo,hr').forEach(e => { e.style.display = on ? 'none' : ''; });
    quiz.classList.toggle('on', on);
    $('prev').style.visibility = on ? 'hidden' : '';
    $('auto').parentElement.style.visibility = on ? 'hidden' : '';
  }
  function drawQuiz() {
    const ans = rec.ans || {};
    if (qi >= Q.length) {
      const right = Q.filter((x, i) => ans[i] === x.a).length;
      quiz.innerHTML = '<div class="qz-done">숙제 완료! 🎉<small>' + Q.length + '문제 중 ' + right + '개 맞혔어요' + (right < Q.length ? ' · 틀린 문제는 설명을 다시 읽어 봐요' : ' · 완벽해요!') + '</small></div>' +
        (right < Q.length ? Q.map((x, i) => ans[i] === x.a ? '' : '<div class="qz-why"><b>' + (i + 1) + '. ' + esc(x.q) + '</b>정답: ' + esc(x.c[x.a]) + '<br>' + esc(x.why) + '</div>').join('') : '');
      $('next').textContent = '대기실로'; return;
    }
    const x = Q[qi], done = picked != null;
    quiz.innerHTML = '<div class="qz-top"><span>공식 ' + VID.k + ' · 확인 문제</span><span>' + (qi + 1) + ' / ' + Q.length + '</span></div>' +
      '<div class="qz-q">' + esc(x.q) + '</div><div class="qz-c">' + x.c.map((c, i) => '<button type="button" data-i="' + i + '" class="' + (done ? (i === x.a ? 'ok' : (i === picked ? 'no' : '')) : '') + '"' + (done ? ' disabled' : '') + '>' + esc(c) + '</button>').join('') + '</div>' +
      (done ? '<div class="qz-why"><b>' + (picked === x.a ? '정답이에요!' : '아쉬워요. 정답은 ' + esc(x.c[x.a])) + '</b>' + esc(x.why) + '</div>' : '');
    $('next').textContent = done ? (qi + 1 < Q.length ? '다음 문제 →' : '결과 보기') : '답을 골라요';
    $('next').disabled = !done;
  }
  quiz.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b || picked != null) return;
    picked = Number(b.dataset.i);
    const ans = Object.assign({}, rec.ans || {}); ans[qi] = picked;
    save({ ans: ans, q: qi });
    drawQuiz();
  });
  function startQuiz(i) { qi = i; picked = (rec.ans || {})[qi] != null ? rec.ans[qi] : null; showQuiz(true); drawQuiz(); }

  // '다음' 버튼: 설명이 끝나면 문제로, 문제가 끝나면 대기실로
  $('next').addEventListener('click', e => {
    if (!quiz.classList.contains('on')) {
      if (VID.cur() === VID.steps - 1 && VID.atEnd) { e.stopImmediatePropagation(); startQuiz(rec.q != null && (rec.ans || {})[rec.q] == null ? rec.q : (rec.q != null ? Math.min(rec.q + 1, Q.length) : 0)); if (qi >= Q.length) { save({ done: store.now() }); drawQuiz(); } }
      return;
    }
    e.stopImmediatePropagation();
    if (qi >= Q.length) { location.href = back; return; }
    if (picked == null) return;
    qi++; picked = null;
    if (qi >= Q.length) { save({ done: store.now(), q: qi }); drawQuiz(); } else { save({ q: qi }); drawQuiz(); }
  }, true);
  $('prev').addEventListener('click', e => { if (quiz.classList.contains('on')) { e.stopImmediatePropagation(); showQuiz(false); $('next').disabled = false; VID.go(VID.cur()); } }, true);

  // 마지막 설명 단계에서는 '처음부터' 대신 '문제 풀기'
  const cur = VID.onChange;
  VID.onChange = n => { if (cur) cur(n); if (n === VID.steps - 1) { $('next').textContent = '문제 풀기 (3문제) →'; VID.atEnd = true; } else VID.atEnd = false; if (loaded && path) store.update(path, { step: n }); };

  // 이어 보기: 저장된 단계·문제로
  async function load() {
    if (path) rec = (await store.get(path)) || {};
    loaded = true;
    if (rec.q != null && rec.step === VID.steps - 1) { VID.go(VID.steps - 1); startQuiz(Math.min(rec.q, Q.length)); if (qi >= Q.length) drawQuiz(); }
    else if (rec.step) VID.go(Math.min(rec.step, VID.steps - 1));
    else VID.onChange(VID.cur());
    if (!sid) document.querySelector('.step').textContent += ' · 기록 안 됨';
  }
  // 대기실로 돌아가는 링크
  bar.insertAdjacentHTML('afterbegin', '<a href="' + back + '" style="font-size:14px;color:var(--sub)">← 대기실</a>');
  load();
})();
