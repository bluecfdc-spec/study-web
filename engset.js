// 영어 주간 시험: 영어 미션(DAILY) 일주일치 빈칸 문제를 한 묶음의 퀴즈로 만듭니다. 강의 없이 문제만.
// 수업 화면과 학생 폰이 똑같은 보기를 봐야 하므로, 보기는 무작위가 아니라 문제 번호로 정해집니다.
(function () {
  if (typeof DAILY === 'undefined' || typeof SETS === 'undefined') return;
  const pools = {}, items = [];
  const add = (t, w) => { const p = pools[t] = pools[t] || []; if (!p.some(x => x.toLowerCase() === w.toLowerCase())) p.push(w); };
  const RE = /\{([^}|]+)(?:\|(\w+))?\}/g;
  DAILY.days.forEach(d => d.s.forEach(x => x.en.replace(RE, (m, w, t) => { add(t || 'n', w); return m; })));
  Object.keys(DAILY.extra || {}).forEach(t => DAILY.extra[t].forEach(w => add(t, w)));

  let n = 0;
  DAILY.days.forEach((d, di) => d.s.forEach(x => {
    const blanks = [];
    x.en.replace(RE, (m, w, t) => { blanks.push({ w: w, t: t || 'n' }); return m; });
    blanks.forEach((bl, bi) => {
      let k = -1;
      const q = x.en.replace(RE, (m, w) => { k++; return k === bi ? '[ ____ ]' : w; });
      const others = pools[bl.t].filter(w => w.toLowerCase() !== bl.w.toLowerCase());
      const pick = [];
      for (let i = 0; i < others.length && pick.length < 3; i++) pick.push(others[(n * 5 + i * 3 + 1) % others.length]);
      const uniq = pick.filter((w, i) => pick.indexOf(w) === i);
      for (let i = 0; uniq.length < Math.min(3, others.length); i++) if (uniq.indexOf(others[i]) < 0) uniq.push(others[i]);
      const a = n % (uniq.length + 1);
      const choices = uniq.slice(0, a).concat([bl.w], uniq.slice(a));
      items.push({ q: q, ask: x.ko, choices: choices, a: a, why: (di + 1) + '일째 문장 · 정답은 "' + bl.w + '"' });
      n++;
    });
  }));
  SETS[DAILY.id + '-week1'] = {
    subject: '영어', unit: DAILY.title + ' · 1주차', title: DAILY.title + ' 1주차 숙제 전체 시험',
    ask: '빈칸에 들어갈 말은?', choices: [], items: items
  };

  // 영어 문장은 길어서 글씨를 조금 작게 보여 줍니다
  document.head.insertAdjacentHTML('beforeend', '<style>body.en-quiz .qtext{font-family:system-ui,-apple-system,"Segoe UI",sans-serif !important;font-weight:700;line-height:1.5}' +
    'body.en-quiz main#app .qtext{font-size:clamp(20px,3.6vw,54px)}body.en-quiz .choice{font-family:system-ui,-apple-system,"Segoe UI",sans-serif !important}</style>');
  setInterval(() => {
    let on = false;
    try { const s = live && SETS[live.setId]; on = !!s && s.subject === '영어'; } catch (e) { }
    document.body.classList.toggle('en-quiz', on);
  }, 300);
})();
