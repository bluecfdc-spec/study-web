// 단어장 관리: 아이가 '외웠어요'로 단어를 빼고, 선생님이 확인 시험을 보내 진짜 외웠는지 봅니다.
// 저장 위치 (학생별 영어 미션 기록 아래)
//   known/{단어} = { w, at, n(뺄 때까지 틀린 횟수), ok(확인 시험 통과한 때) }
//   fail/{단어}  = 확인 시험에서 틀린 때   ·   check = 선생님이 보낸 시험   ·   checkLog = 시험 기록
//   pre/{단어}   = { w, at } 아이가 예습 단어장에서 미리 담은 단어 (틀린 적이 없어도 단어장에 올라옵니다)
// 외웠다고 뺀 뒤에 숙제·수업 시험에서 또 틀리면(틀린 횟수가 늘면) 단어장으로 저절로 돌아옵니다.
(function () {
  if (typeof DAILY === 'undefined' || typeof Daily === 'undefined' || typeof store === 'undefined') return;
  const app = document.getElementById('app');
  const isTeacher = typeof homeworkHTML === 'function';
  const P = sid => BASE + '/daily/' + sid + '/' + DAILY.id;
  let D = {};
  const rec = sid => (D[sid] || {})[DAILY.id] || {};
  const key = w => String(w).toLowerCase().replace(/[^a-z0-9]+/g, '_');
  function split(sid) {
    const r = rec(sid), kn = r.known || {}, fail = r.fail || {}, pre = r.pre || {}, study = [], known = [];
    const list = Daily.words(sid), have = {};
    list.forEach(o => { have[key(o.w)] = 1; });
    Object.keys(pre).forEach(k => { const w = pre[k] && pre[k].w; if (w && !have[k] && Daily.gloss(w)) list.push({ w: w, n: 0, still: false, ko: Daily.gloss(w) }); });   // 예습으로만 담은 단어 (틀린 횟수 0)
    list.forEach(o => {
      const k = key(o.w), kk = kn[k];
      o.k = k; o.pre = !!pre[k];
      if (kk && o.n <= (kk.n || 0)) { o.at = kk.at; o.ok = kk.ok; known.push(o); }
      else { o.fail = !!fail[k]; o.again = !!kk; study.push(o); }
    });
    return { study: study, known: known };
  }
  const pending = sid => { const c = rec(sid).check; return c && c.words ? Object.keys(c.words).map(i => c.words[i]) : null; };

  // ================= 선생님 포털 =================
  if (isTeacher) {
    document.head.insertAdjacentHTML('beforeend', '<style>.hw-w.ok{background:var(--mint)}.hw-w em{font-style:normal;font-size:12px;font-weight:700;color:#9C2748;margin-left:4px}.hw-w.ok em{color:var(--ok)}' +
      '.wb-send{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}</style>');
    const chip = (o, cls, extra) => '<span class="hw-w' + cls + '"><b>' + esc(o.w) + '</b> ' + esc(o.ko) + (o.n > 1 ? ' <i>' + o.n + '번</i>' : '') + (extra || '') + '</span>';
    function section(id) {
      const sp = split(id), r = rec(id), pend = pending(id);
      let h = '<h3>단어장에 남아 있는 단어 <small>아직 못 외운 단어 ' + sp.study.length + '개 · 많이 틀린 순 (예습으로 담은 단어 포함)</small></h3>' +
        (sp.study.length ? '<div class="hw-words">' + sp.study.map(o => chip(o, o.still ? ' still' : '', o.fail ? '<em>확인 시험에서 틀림</em>' : (o.again && o.n ? '<em>뺐다가 또 틀림</em>' : (o.n ? (o.pre ? '<em>예습 + 틀림</em>' : '') : '<em>예습으로 담음</em>')))).join('') + '</div>' +
          '<p class="hint" style="font-size:13px">분홍색 = 마지막 숙제에서도 틀려서 다음 숙제에 다시 나오는 단어</p>' : '<p class="hint">남아 있는 단어 없음</p>');
      h += '<h3>외웠다고 뺀 단어 <small>' + sp.known.length + '개 · 초록색 = 확인 시험 통과</small></h3>' +
        (sp.known.length ? '<div class="hw-words">' + sp.known.map(o => chip(o, o.ok ? ' ok' : '', o.ok ? '<em>확인됨</em>' : '')).join('') + '</div>' : '<p class="hint">아직 없음</p>');
      const todo = sp.known.filter(o => !o.ok), send = (todo.length ? todo : sp.known).slice(0, 20);
      h += '<div class="wb-send">' + (pend
        ? '<span class="tag on">확인 시험 보냄 (' + pend.length + '단어) · 아직 안 풀었어요</span><button class="plain" data-act="wb-cancel" data-id="' + esc(id) + '">보낸 시험 취소</button>'
        : (send.length ? '<button class="primary" data-act="wb-send" data-id="' + esc(id) + '">확인 시험 보내기 (' + send.length + '단어)</button><span class="hint" style="font-size:13px">' + (todo.length ? '아직 확인 안 된 단어만 냅니다. ' : '모두 확인된 단어라 전부 다시 냅니다. ') + '아이 폰에 바로 뜨고, 접속해 있지 않으면 다음에 들어올 때 뜹니다.</span>'
          : '<span class="hint" style="font-size:13px">아이가 외웠다고 뺀 단어가 생기면 여기서 확인 시험을 보낼 수 있습니다.</span>')) + '</div>';
      const logs = Object.keys(r.checkLog || {}).map(k => r.checkLog[k]).filter(g => g && g.at).sort((a, b) => b.at - a.at);
      if (logs.length) h += '<h3>확인 시험 기록</h3><ul class="hw-log">' + logs.slice(0, 6).map(g => {
        const w = g.wrong ? Object.keys(g.wrong).map(k => g.wrong[k]) : [];
        return '<li><span>' + koTime(g.at) + '</span>' + g.right + ' / ' + g.total + ' 맞힘' + (w.length ? ' · 틀린 단어: <b>' + w.map(esc).join('</b>, <b>') + '</b> (단어장으로 돌아감)' : ' · 모두 통과') + '</li>';
      }).join('') + '</ul>';
      return h;
    }
    function inject() {
      app.querySelectorAll('.card.hw').forEach(card => {
        const h3 = Array.from(card.querySelectorAll('h3')).filter(x => x.textContent.indexOf('꼭 외워야 할 단어') === 0)[0];
        if (!h3) return;
        let n = h3.nextElementSibling;
        while (n && n.tagName !== 'H3') { const x = n.nextElementSibling; n.remove(); n = x; }
        h3.outerHTML = section(card.id.slice(3));
      });
    }
    const draw = render;
    window.render = function () { draw(); try { inject(); } catch (e) { } };
    app.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('button[data-act^="wb-"]');
      if (!b) return;
      const id = b.dataset.id;
      if (b.dataset.act === 'wb-cancel') { store.update(P(id), { check: null }); return; }
      const sp = split(id), todo = sp.known.filter(o => !o.ok), send = (todo.length ? todo : sp.known).slice(0, 20);
      if (send.length) store.update(P(id), { check: { at: store.now(), words: send.map(o => o.w) } });
    });
    store.on(BASE + '/daily', v => { D = v || {}; render(); });
    return;
  }

  // ================= 학생 폰 =================
  if (typeof me === 'undefined') return;
  document.head.insertAdjacentHTML('beforeend', '<style>.wb-b{flex:none;min-height:36px;border-radius:999px;padding:0 12px;font-size:14px;font-weight:700;background:#FBEDE8;color:var(--sub)}.wb-b.go{background:var(--mint);color:var(--ink)}' +
    '.w-list.wb{max-height:44vh}.wb-tabs{grid-template-columns:1fr 1fr 1fr !important;gap:6px !important}.wb-tabs button{font-size:15px !important;padding:0 4px;line-height:1.25}.w-row .wb-pre{background:var(--yellow)}.wb-day{padding:12px 0 4px;font-size:14px;font-weight:700;color:var(--sub);border-top:1px solid #F1E2DE}.wb-day:first-child{border-top:none;padding-top:6px}.wb-b.in{background:var(--yellow);color:var(--ink)}.lb-card.c-yellow{background:var(--yellow)}.w-row .wb-ok{background:var(--mint)}.wb-tabs button{min-height:48px}.d-prog div:first-child{padding-right:84px}.wb-ko{font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;font-size:30px;font-weight:700;text-align:center;line-height:1.4}</style>');
  const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9a4.5 4.5 0 010 6"/></svg>';
  let tab = 'study', hide = '', inWords = false, T = null;

  // 예습 단어장: 이번 과(Lesson 5)에 나오는 단어 전부를 숙제 날짜 순서로
  const PRE = [];
  (function () {
    const seen = {};
    DAILY.days.forEach((d, di) => d.s.forEach(x => x.en.replace(/\{([^}|]+)/g, (m, w) => {
      const k = key(w);
      if (!seen[k] && Daily.gloss(w)) { seen[k] = 1; PRE.push({ w: w, k: k, ko: Daily.gloss(w), day: di + 1 }); }
      return m;
    })));
  })();
  function preHTML(sp) {
    const st = {}; sp.study.forEach(o => { st[o.k] = o; });
    const kn = {}; sp.known.forEach(o => { kn[o.k] = o; });
    let day = 0;
    return '<p class="sub" style="font-size:15px">' + esc(DAILY.title) + '에 나오는 단어 ' + PRE.length + '개 · 미리 외울 단어를 단어장에 담아요</p>' +
      '<div class="w-list wb' + (hide ? ' hide-' + hide : '') + '">' + PRE.map(o => {
        const head = o.day !== day ? '<div class="wb-day">' + (day = o.day) + '일째 숙제에 나오는 단어</div>' : '';
        const s = st[o.k], btn = kn[o.k] ? '<i class="wb-ok">외운 단어</i>'
          : s ? (s.n ? '<i>틀린 단어</i>' : '<button class="wb-b in" data-act="d-preoff" data-k="' + o.k + '">담았어요 ✓</button>')
            : '<button class="wb-b go" data-act="d-preon" data-k="' + o.k + '">단어장에 담기</button>';
        return head + '<div class="w-row"><button class="w-say" type="button" data-say="' + esc(o.w) + '" aria-label="발음 듣기">' + SPK + '</button><b class="d-en" style="line-height:1.3">' + esc(o.w) + '</b><span>' + esc(o.ko) + '</span>' + btn + '</div>';
      }).join('') + '</div>' +
      '<div class="w-tog"><button class="' + (hide === 'ko' ? 'on' : '') + '" data-act="d-hide" data-h="ko">' + (hide === 'ko' ? '뜻 다시 보기' : '뜻 가리고 보기') + '</button>' +
      '<button class="' + (hide === 'en' ? 'on' : '') + '" data-act="d-hide" data-h="en">' + (hide === 'en' ? '영어 다시 보기' : '영어 가리고 보기') + '</button></div>';
  }
  function wordsHTML(sid) {
    const sp = split(sid), list = tab === 'known' ? sp.known : sp.study;
    let h = '<h1>단어장</h1><div class="w-tog wb-tabs"><button class="' + (tab === 'study' ? 'on' : '') + '" data-act="d-tab" data-t="study">공부할 단어 ' + sp.study.length + '</button>' +
      '<button class="' + (tab === 'known' ? 'on' : '') + '" data-act="d-tab" data-t="known">외운 단어 ' + sp.known.length + '</button>' +
      '<button class="' + (tab === 'pre' ? 'on' : '') + '" data-act="d-tab" data-t="pre">예습 단어 ' + PRE.length + '</button></div>';
    if (tab === 'pre') h += preHTML(sp);
    else if (!list.length) {
      h += '<div class="card"><p class="sub">' + (tab === 'known' ? '다 외운 단어는 ‘외웠어요’를 눌러 여기로 옮겨요.' : (sp.known.length ? '공부할 단어를 모두 외웠어요. 대단해요!' : '영어 미션에서 틀린 단어와, ‘예습 단어’에서 담은 단어가 여기에 모여요.')) + '</p></div>';
    } else {
      h += '<div class="w-list wb' + (hide ? ' hide-' + hide : '') + '">' + list.map(o =>
        '<div class="w-row"><button class="w-say" type="button" data-say="' + esc(o.w) + '" aria-label="발음 듣기">' + SPK + '</button><b class="d-en" style="line-height:1.3">' + esc(o.w) + '</b><span>' + esc(o.ko) + '</span>' +
        (tab === 'known' ? (o.ok ? '<i class="wb-ok">확인 완료</i>' : '') + '<button class="wb-b" data-act="d-unknown" data-k="' + o.k + '">다시 공부</button>'
          : (o.pre ? '<i class="wb-pre">' + (o.n ? '예습·틀림' : '예습') + '</i>' : '') + '<button class="wb-b go" data-act="d-known" data-k="' + o.k + '">외웠어요</button>') + '</div>').join('') + '</div>' +
        '<div class="w-tog"><button class="' + (hide === 'ko' ? 'on' : '') + '" data-act="d-hide" data-h="ko">' + (hide === 'ko' ? '뜻 다시 보기' : '뜻 가리고 보기') + '</button>' +
        '<button class="' + (hide === 'en' ? 'on' : '') + '" data-act="d-hide" data-h="en">' + (hide === 'en' ? '영어 다시 보기' : '영어 가리고 보기') + '</button></div>';
    }
    return h + '<span style="margin-top:auto"></span><button class="big" data-act="d-exit">대기실로</button>';
  }
  const html0 = Daily.html, click0 = Daily.click;
  Daily.html = function (sid) {
    const h = html0(sid);
    inWords = h.indexOf('<h1>단어장</h1>') === 0;
    return inWords ? wordsHTML(sid) : h;
  };
  Daily.click = async function (act, b, sid) {
    if (act === 'd-tab') { tab = b.dataset.t; return 'daily'; }
    if (act === 'd-hide') { hide = hide === b.dataset.h ? '' : b.dataset.h; return 'daily'; }
    if (act === 'd-known' || act === 'd-unknown') {
      const sp = split(sid), o = sp.study.concat(sp.known).filter(x => x.k === b.dataset.k)[0], up = {};
      if (o) {
        up['known/' + o.k] = act === 'd-known' ? { w: o.w, at: store.now(), n: o.n } : null;
        if (act === 'd-known') up['fail/' + o.k] = null;
        store.update(P(sid), up);
      }
      return 'daily';
    }
    if (act === 'd-preon' || act === 'd-preoff') {
      const o = PRE.filter(x => x.k === b.dataset.k)[0], up = {};
      if (o) { up['pre/' + o.k] = act === 'd-preon' ? { w: o.w, at: store.now() } : null; store.update(P(sid), up); }
      return 'daily';
    }
    if (act === 'd-pre') { const r = await click0('d-words', b, sid); tab = 'pre'; hide = ''; return r; }   // 대기실의 '예습 단어장' 버튼
    if (act === 'd-words') { tab = 'study'; hide = ''; }
    return click0(act, b, sid);
  };

  // ----- 확인 시험: 선생님이 보내면 대기실이나 단어장에 있을 때 바로 뜹니다 -----
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function startCheck() {
    const all = Object.keys(DAILY.gloss);
    const q = (pending(me) || []).filter(w => Daily.gloss(w)).map(w => {
      const others = shuffle(all.filter(x => x.toLowerCase() !== String(w).toLowerCase())).slice(0, 3);
      return { w: w, ko: Daily.gloss(w), opts: shuffle(others.concat([w])), picked: null };
    });
    if (!q.length) { store.update(P(me), { check: null }); return false; }
    T = { q: shuffle(q), i: -1, done: false };
    screen = 'check';
    return true;
  }
  function checkHTML() {
    const n = T.q.length;
    if (T.i < 0) return '<h1>단어 확인 시험</h1><div class="card"><p class="sub">선생님이 보냈어요</p><p class="bignum">' + n + '문제</p></div>' +
      '<div class="wait">‘외웠어요’ 한 단어를 진짜 외웠는지 확인해요.<br>뜻을 보고 영어 단어를 골라요.</div><button class="big" data-act="c-next" style="margin-top:auto">시작</button>';
    if (T.done) {
      const wrong = T.q.filter(x => x.picked !== x.w), right = n - wrong.length;
      return '<h1>확인 시험 끝!</h1><div class="card"><p class="sub">맞힌 단어</p><p class="bignum">' + right + ' / ' + n + '</p></div>' +
        (wrong.length ? '<div class="card"><p class="sub">단어장으로 돌아온 단어</p><p class="d-list"><b>' + wrong.map(x => esc(x.w)).join('</b> · <b>') + '</b></p></div><p class="sub">한 번 더 외우고 다시 ‘외웠어요’를 눌러요</p>'
          : '<div class="wait">모두 진짜로 외웠네요. 대단해요!</div>') +
        '<button class="big" data-act="c-exit" style="margin-top:auto">대기실로</button>';
    }
    const x = T.q[T.i], ans = x.picked != null;
    return '<div class="d-prog"><div><span>단어 확인 시험</span><span>문제 ' + (T.i + 1) + ' / ' + n + '</span></div><div class="d-bar"><i style="width:' + Math.round(T.i / n * 100) + '%"></i></div></div>' +
      '<div class="card"><p class="wb-ko">' + esc(x.ko) + '</p></div>' +
      '<div class="d-opts">' + x.opts.map((w, i) => '<button class="d-opt' + (ans ? (w === x.w ? ' ok' : (w === x.picked ? ' no' : '')) : '') + '" data-act="c-pick" data-i="' + i + '"' + (ans ? ' disabled' : '') + '>' + esc(w) + '</button>').join('') + '</div>' +
      (ans ? '<p class="sub">' + (x.picked === x.w ? '정답이에요!' : '괜찮아요. 단어장에서 다시 만나요') + '</p><button class="big" data-act="c-next" style="margin-top:auto">다음</button>' : '<p class="sub">이 뜻의 영어 단어를 눌러요</p>');
  }
  function finishCheck() {
    const up = { check: null }, now = store.now(), wrong = [];
    T.q.forEach(x => {
      const k = key(x.w);
      if (x.picked === x.w) up['known/' + k + '/ok'] = now;
      else { up['known/' + k] = null; up['fail/' + k] = now; wrong.push(x.w); }
    });
    up['checkLog/' + store.newId()] = { at: now, right: T.q.length - wrong.length, total: T.q.length, wrong: wrong.length ? wrong : null };
    T.done = true;
    store.update(P(me), up);
  }
  app.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button[data-act^="c-"]');
    if (!b || !T) return;
    e.stopPropagation();
    const act = b.dataset.act;
    if (act === 'c-pick') {
      const x = T.q[T.i];
      if (!x || x.picked != null) return;
      x.picked = x.opts[Number(b.dataset.i)];
      if (x.picked === x.w) Sound.good(); else Sound.soft();
    } else if (act === 'c-next') {
      Sound.tap(); T.i++;
      if (T.i >= T.q.length) { finishCheck(); Sound.fanfare(); }
    } else if (act === 'c-exit') { Sound.tap(); T = null; screen = 'lobby'; if (typeof sync === 'function') sync(); }
    render();
  }, true);

  const draw = render;
  window.render = function () {
    if (me && T && screen === 'check') { app.innerHTML = checkHTML(); return; }
    if (me && !T && pending(me) && (screen === 'lobby' || (screen === 'daily' && inWords)) && startCheck()) { app.innerHTML = checkHTML(); return; }
    draw();
    // 대기실: '틀린 단어 단어장' 바로 아래에 '예습 단어장' 버튼을 붙입니다
    const wb = app.querySelector('.lb-card[data-act="d-words"]');
    if (wb && !app.querySelector('[data-act="d-pre"]')) {
      const n = Object.keys(rec(me).pre || {}).length;
      wb.insertAdjacentHTML('afterend', '<button class="lb-card c-yellow" data-art="obj_pencil" data-act="d-pre">예습 단어장<small>' + esc(DAILY.title) + ' 단어 ' + PRE.length + '개 · ' + (n ? '내가 담은 단어 ' + n + '개' : '미리 외우기') + '</small></button>');
    }
  };
  store.on(BASE + '/daily', v => {
    D = v || {};
    if (!me) return;
    // 선생님이 시험을 취소하면 풀던 시험을 닫습니다
    if (T && !T.done && !pending(me)) { T = null; screen = 'lobby'; if (typeof sync === 'function') sync(); }
    if (screen === 'lobby' || screen === 'check' || (screen === 'daily' && inWords)) render();
  });
})();
