// 수업 화면 대기실: 먼저 과목을 고르고, 과목 안에서 왼쪽은 수업 · 오른쪽은 문제 풀이
// stage.js 의 render 를 감싸서, 대기실일 때만 이 화면을 대신 그립니다.
(function () {
  const SUBJ = [
    { k: '국어', icon: 'icon_korean', bg: 'var(--pink)' },
    { k: '수학', icon: 'icon_math', bg: 'var(--mint)' },
    { k: '영어', icon: 'icon_english', bg: 'var(--yellow)' },
    { k: '과학', icon: 'icon_science', bg: 'var(--blue)' }
  ];
  let subj = null;   // 지금 들어가 있는 과목 (null = 과목 고르기)

  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.sets.sj-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.6vw;max-width:1100px}' +
    '@media (max-width:700px){.sets.sj-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sj-cols{grid-template-columns:1fr !important}}' +
    '.sj-card{border-radius:28px;padding:2.2vh 1vw;display:flex;flex-direction:column;align-items:center;gap:.6vh;font-size:clamp(22px,2.8vw,36px);font-weight:700}' +
    '.sj-card img{width:clamp(56px,7vw,92px);height:auto}.sj-card small{font-size:clamp(14px,1.5vw,19px);font-weight:500;color:var(--sub)}' +
    '.sj-head{display:flex;align-items:center;gap:12px;font-size:clamp(24px,3vw,40px);font-weight:700}.sj-head img{width:clamp(44px,5vw,64px);height:auto}' +
    '.sj-cols{display:grid;grid-template-columns:1fr 1fr;gap:2vw;align-items:start}' +
    '.sj-col{background:rgba(255,255,255,.75);border-radius:28px;padding:2vh 1.6vw;display:flex;flex-direction:column;gap:12px}' +
    '.sj-col h2{margin:0;font-size:clamp(20px,2.2vw,28px);display:flex;align-items:center;gap:10px}.sj-col h2 small{font-size:.65em;font-weight:500;color:var(--sub)}' +
    '.sj-col .set{font-size:clamp(17px,1.8vw,23px);padding:12px 16px;flex-wrap:nowrap}.sj-col .set span{min-width:0}.sj-col .set small{display:block;font-size:.78em;color:var(--sub);font-weight:500}' +
    '.sj-col .go{min-height:52px;padding:0 22px;flex:none}.sj-none{color:var(--sub);font-size:clamp(16px,1.6vw,20px);padding:8px 4px}</style>');

  function of(s) {
    return {
      lessons: Object.keys(LESSONS).filter(k => LESSONS[k].subject === s),
      sets: Object.keys(SETS).filter(k => SETS[k].subject === s)
    };
  }
  function allSubjects() {   // 정해 둔 네 과목 + 혹시 다른 과목 이름으로 만든 자료
    const names = SUBJ.map(x => x.k);
    Object.keys(LESSONS).map(k => LESSONS[k].subject).concat(Object.keys(SETS).map(k => SETS[k].subject))
      .forEach(s => { if (s && names.indexOf(s) < 0) names.push(s); });
    return names.map(n => SUBJ.filter(x => x.k === n)[0] || { k: n, icon: '', bg: '#fff' });
  }
  const pic = s => s.icon ? '<img src="assets/' + s.icon + '.webp" alt="" draggable="false">' : '';

  function lobbyHTML() {
    const list = allSubjects();
    const cur = subj && list.filter(x => x.k === subj)[0];
    if (!cur) {
      return '<h1>대기실</h1><p class="sub">친구들이 들어오면 캐릭터가 선명해져요 · 과목을 골라 주세요</p>' +
        seats(id => ({ text: presence[id] ? '들어왔어요' : '아직이에요', good: !!presence[id] })) +
        '<div class="sets sj-grid">' + list.map(s => {
          const o = of(s.k), n = o.lessons.length + o.sets.length;
          return '<button class="sj-card" data-act="subj" data-s="' + esc(s.k) + '" style="background:' + s.bg + '">' + pic(s) + esc(s.k) +
            '<small>' + (n ? '수업 ' + o.lessons.length + ' · 문제 ' + o.sets.length : '준비 중') + '</small></button>';
        }).join('') + '</div>' +
        '<div class="bar"><a class="quiet" href="teacher.html' + Q + '">선생님 포털</a><span></span></div>';
    }
    const o = of(cur.k);
    return '<div class="top"><div class="sj-head">' + pic(cur) + esc(cur.k) + '</div><button class="go plain" data-act="subjback">과목 다시 고르기</button></div>' +
      '<div class="sj-cols">' +
      '<div class="sj-col"><h2>수업 <small>개념 설명</small></h2>' + (o.lessons.length ? o.lessons.map(k => { const L = LESSONS[k];
        return '<div class="set"><span>' + esc(L.unit) + ' · ' + esc(L.word) + '<small>' + L.pages.length + '장</small></span><button class="go" data-act="lesson" data-id="' + esc(k) + '">수업 시작</button></div>'; }).join('')
        : '<p class="sj-none">아직 준비 중이에요</p>') + '</div>' +
      '<div class="sj-col"><h2>문제 풀이 <small>함께 푸는 퀴즈</small></h2>' + (o.sets.length ? o.sets.map(k => { const T = SETS[k];
        return '<div class="set"><span>' + esc(T.title) + '<small>' + esc(T.unit) + ' · ' + T.items.length + '문제</small></span><button class="go" data-act="start" data-set="' + esc(k) + '">시작</button></div>'; }).join('')
        : '<p class="sj-none">아직 준비 중이에요</p>') + '</div>' +
      '</div><div class="bar"><a class="quiet" href="teacher.html' + Q + '">선생님 포털</a><span></span></div>';
  }

  const base = render;
  window.render = function () {
    const inLesson = live && live.mode === 'lesson' && LESSONS[live.lessonId];
    const inQuiz = live && SETS[live.setId];
    if (authed && !inLesson && !inQuiz) { app.innerHTML = lobbyHTML(); return; }
    base();
  };
  app.addEventListener('click', e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    if (b.dataset.act === 'subj') { subj = b.dataset.s; render(); }
    else if (b.dataset.act === 'subjback') { subj = null; render(); }
  });
  render();
})();
