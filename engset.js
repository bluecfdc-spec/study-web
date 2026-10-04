// 영어 주간 시험: 영어 미션(DAILY) 일주일치 빈칸 문제를 18문제씩 두 묶음의 퀴즈로 만듭니다. 강의 없이 문제만.
// 수업 화면과 학생 폰이 똑같은 보기를 봐야 하므로, 보기는 무작위가 아니라 문제 번호로 정해집니다.
(function () {
  if (typeof DAILY === 'undefined' || typeof SETS === 'undefined') return;
  const pools = {}, items = [];
  const add = (t, w) => { const p = pools[t] = pools[t] || []; if (!p.some(x => x.toLowerCase() === w.toLowerCase())) p.push(w); };
  const RE = /\{([^}|]+)(?:\|(\w+))?\}/g;
  DAILY.days.forEach(d => d.s.forEach(x => x.en.replace(RE, (m, w, t) => { add(t || 'n', w); return m; })));
  Object.keys(DAILY.extra || {}).forEach(t => DAILY.extra[t].forEach(w => add(t, w)));

  let n = 0, si = 0;
  DAILY.days.forEach((d, di) => d.s.forEach(x => {
    const blanks = [];
    x.en.replace(RE, (m, w, t) => { blanks.push({ w: w, t: t || 'n' }); return m; });
    const full = x.en.replace(RE, (m, w) => w);
    blanks.forEach((bl, bi) => {
      let k = -1;
      const q = x.en.replace(RE, (m, w) => { k++; return k === bi ? '[ ____ ]' : w; });
      const cut = q.split('[ ____ ]');
      const others = pools[bl.t].filter(w => w.toLowerCase() !== bl.w.toLowerCase());
      const pick = [];
      for (let i = 0; i < others.length && pick.length < 3; i++) pick.push(others[(n * 5 + i * 3 + 1) % others.length]);
      const uniq = pick.filter((w, i) => pick.indexOf(w) === i);
      for (let i = 0; uniq.length < Math.min(3, others.length); i++) if (uniq.indexOf(others[i]) < 0) uniq.push(others[i]);
      const a = n % (uniq.length + 1);
      const choices = uniq.slice(0, a).concat([bl.w], uniq.slice(a));
      // bid: 영어 미션과 같은 빈칸 번호 (시험에서 틀리면 단어장에 같은 단어로 들어가게)
      items.push({ q: q, ask: x.ko, choices: choices, a: a, why: (di + 1) + '일째 문장 · 정답은 "' + bl.w + '"', bid: 's' + si + 'b' + bi, w: bl.w, full: full, sayA: cut[0], sayB: cut[1] || '' });
      n++;
    });
    si++;
  }));
  const half = Math.ceil(items.length / 2);
  [[0, half, '①'], [half, items.length, '②']].forEach((r, i) => {
    SETS[DAILY.id + '-week1-' + (i + 1)] = {
      subject: '영어', unit: DAILY.title + ' · 1주차 ' + r[2], title: DAILY.title + ' 1주차 숙제 시험 ' + r[2] + ' (' + (r[0] + 1) + '~' + r[1] + '번 문제)',
      ask: '빈칸에 들어갈 말은?', choices: [], items: items.slice(r[0], r[1])
    };
  });

  const isStage = !!document.title && document.title.indexOf('수업') >= 0;
  // 영어 문장은 길어서 글씨를 조금 작게. 문제가 많은 시험의 결과표는 스크롤 없이 한눈에 보이게 촘촘하게.
  document.head.insertAdjacentHTML('beforeend', '<style>body.en-quiz .qtext{font-family:system-ui,-apple-system,"Segoe UI",sans-serif !important;font-weight:700;line-height:1.5}' +
    'body.en-quiz main#app .qtext{font-size:clamp(20px,3.6vw,54px)}body.en-quiz .choice{font-family:system-ui,-apple-system,"Segoe UI",sans-serif !important}' +
    'body.ox-many .ox{font-size:clamp(10px,1.3vw,19px)}body.ox-many .ox td,body.ox-many .ox th{padding:.25em .1em}body.ox-many .ox .who svg{width:2.4em;height:2.4em}body.ox-many .ox .who{padding-right:.5em}body.ox-many .ox .sum{padding-left:.5em}body.ox-many .card{padding:2vh 1vw}' +
    'body.en-quiz .card{position:relative}.en-say{position:absolute;top:10px;right:10px;width:52px;height:52px;padding:0;border-radius:50%;background:#FBEDE8;color:#B4688A;display:flex;align-items:center;justify-content:center;cursor:pointer}.en-say svg{width:28px;height:28px}</style>');

  const enSet = () => { try { const s = live && SETS[live.setId]; return s && s.subject === '영어' ? s : null; } catch (e) { return null; } };
  const done = {};   // 이미 단어장에 넣은 (시험, 문제번호)
  setInterval(() => {
    const s = enSet();
    document.body.classList.toggle('en-quiz', !!s);
    let many = false;
    try { const t = live && SETS[live.setId]; many = !!t && t.items.length > 12; } catch (e) { }
    document.body.classList.toggle('ox-many', many);
    // 학생 폰: 시험에서 틀리게 고른 단어는 영어 미션의 단어장에 바로 넣습니다
    try {
      if (!s || isStage || typeof me === 'undefined' || !me || live.phase !== 'reveal') return;
      const key = live.sessionId + '/' + live.q;
      if (done[key]) return;
      done[key] = 1;
      const it = s.items[live.q], mine = answerOf(live, live.q, me);
      if (!it || !it.bid || mine == null || mine === it.a) return;
      const path = BASE + '/daily/' + me + '/' + DAILY.id;
      store.get(path).then(r => {
        r = r || {};
        const c = {}, m = {}; m[it.bid] = it.w;
        c[it.bid] = ((r.missN || {})[it.bid] || ((r.missed || {})[it.bid] ? 1 : 0)) + 1;
        store.update(path + '/missed', m); store.update(path + '/missN', c);
      });
    } catch (e) { }
  }, 300);

  // 수업 화면: 영어 시험 문제 옆 스피커. 문제 중에는 빈칸을 '삐—'로, 정답 공개 뒤에는 문장 전체를 읽어 줍니다
  if (isStage) {
    const app = document.getElementById('app');
    const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9a4.5 4.5 0 010 6M19 6.5a8 8 0 010 11"/></svg>';
    const put = () => {
      const s = enSet(); if (!s || !live || live.phase === 'end') return;
      const q = app.querySelector('.card .qtext'); if (!q || q.parentNode.querySelector('.en-say')) return;
      q.parentNode.insertAdjacentHTML('beforeend', '<button type="button" class="en-say" aria-label="문장 듣기" title="문장 듣기">' + SPK + '</button>');
    };
    new MutationObserver(put).observe(app, { childList: true, subtree: true });
    document.addEventListener('click', e => {
      if (!(e.target.closest && e.target.closest('.en-say')) || !window.SayQ) return;
      const s = enSet(), it = s && s.items[live.q]; if (!it) return;
      if (live.phase === 'reveal') SayQ.play(it.full, '', true); else SayQ.play(it.sayA, it.sayB);
    });
  }
})();
