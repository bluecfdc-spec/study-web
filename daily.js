// 오늘의 영어 미션: 본문을 하루에 서너 문장씩, 빈칸을 눌러 채우는 숙제
// {단어|종류} 가 빈칸이 됩니다. 종류: n 이름, v 동작, a 모습·비교, p 위치, d 어떻게, t 때
// {단어|종류|+} 는 나중에 추가한 빈칸입니다. 번호를 따로 매겨서(s0n0…) 예전 빈칸 번호(s0b0…)와 아이들 기록이 밀리지 않게 합니다
const DAILY = {
  id: 'eng5', subject: '영어', title: 'Lesson 5',
  days: [
    { title: '사건이 일어났다', s: [
      { en: '{Last Saturday|t|+}, someone {threw|v} a cake at the Monalisa in the Botero {Museum|n} in Bogota, Colombia.', ko: "지난주 토요일, 콜롬비아 보고타에 있는 보테로 미술관에서 누군가가 '모나리자'에 케이크를 던졌다." },
      { en: '{There were|v|+} four {eyewitnesses|n}.', ko: '목격자는 네 명이 있었다.' },
      { en: 'What did they {say|v}?', ko: '그들이 무엇을 말했을까?' },
      { en: 'Read the following, and find the {criminal|n}.', ko: '다음 내용을 읽고, 범인을 찾아라.' }
    ] },
    { title: '방문객 Ann의 말', s: [
      { who: 'Ann Jones, a visitor · 방문객', en: 'I was {looking at|v} the Monalisa, and {someone|n|+} threw a cake at the {painting|n}.', ko: "저는 '모나리자'를 보고 있었는데, 누군가가 그림에 케이크를 던졌어요." },
      { who: 'Ann Jones, a visitor · 방문객', en: 'I {turned around|v} and saw an old man.', ko: '저는 뒤를 돌아보았고 한 노인을 봤어요.' },
      { who: 'Ann Jones, a visitor · 방문객', en: 'He was {standing|v|+} {in front of|p} a {wheelchair|n|+}.', ko: '그는 휠체어 앞에 서 있었죠.' },
      { who: 'Ann Jones, a visitor · 방문객', en: "I'm about 170 cm tall, and he was {a little|d|+} {taller than|a} me.", ko: '저는 키가 약 170cm인데, 그는 저보다 조금 더 키가 컸어요.' }
    ] },
    { title: '관리인 Carlos의 말 ①', s: [
      { who: 'Carlos Diaz, a janitor · 관리인', en: 'An old man with {gray|a} hair was running away, and something {fell off|v} his head.', ko: '머리가 회색인 한 노인이 도망치고 있었는데, 머리에서 무언가가 떨어졌습니다.' },
      { who: 'Carlos Diaz, a janitor · 관리인', en: 'It was his {wig|n}.', ko: '그건 그의 가발이었죠.' },
      { who: 'Carlos Diaz, a janitor · 관리인', en: "I {ran after|v} him, but I {couldn't catch|v} him.", ko: '저는 그를 쫓아서 뛰어갔지만, 그를 잡을 수가 없었습니다.' },
      { who: 'Carlos Diaz, a janitor · 관리인', en: 'He was {faster than|a} me.', ko: '그는 저보다 빨랐어요.' }
    ] },
    { title: 'Carlos의 말 ② · 경비원 Diego', s: [
      { who: 'Carlos Diaz, a janitor · 관리인', en: 'In fact, the old man was not {old|a}.', ko: '사실, 그 노인은 나이가 들지 않았죠.' },
      { who: 'Carlos Diaz, a janitor · 관리인', en: 'He was a {young|a} man with long {brown|a} hair.', ko: '그는 긴 갈색 머리를 한 젊은 남자였어요.' },
      { who: 'Diego Perez, a guard · 경비원', en: 'I went to the {crime scene|n}, and there were {pieces|n} of cake {all over|p|+} the painting.', ko: '저는 범죄 현장으로 갔는데, 그림 곳곳에 케이크 조각들이 있었습니다.' }
    ] },
    { title: 'Diego의 말 ② · 빵집 주인 Camila', s: [
      { who: 'Diego Perez, a guard · 경비원', en: 'There was also a wheelchair {near|p} the painting, and I found a cake box {next to|p} the wheelchair.', ko: '또한 그림 근처에는 휠체어가 있었고, 휠체어 옆에서 저는 케이크 상자를 발견했어요.' },
      { who: 'Diego Perez, a guard · 경비원', en: "The box was from Camila's {Bakery|n}.", ko: '그 상자는 카밀라 빵집의 상자였습니다.' },
      { who: "Camila Santos, the owner of Camila's Bakery · 빵집 주인", en: 'Last Friday, a young man {came in|v}.', ko: '지난주 금요일, 한 젊은 남자가 들어왔어요.' }
    ] },
    { title: '빵집 주인 Camila의 말', s: [
      { who: "Camila Santos, the owner of Camila's Bakery · 빵집 주인", en: "I spoke to him in {Spanish|n}, but he {didn't understand|v} me.", ko: '저는 그에게 스페인어로 말했지만, 그는 제 말을 이해하지 못했어요.' },
      { who: "Camila Santos, the owner of Camila's Bakery · 빵집 주인", en: 'He {spoke|v|+} only {English|n}.', ko: '그는 영어만 말했죠.' },
      { who: "Camila Santos, the owner of Camila's Bakery · 빵집 주인", en: 'We had a lot of {different|a} cakes, but he just wanted the {smallest|a} one.', ko: '저희 가게에는 다양한 케이크들이 많이 있었는데, 그는 단지 가장 작은 것을 원했어요.' },
      { who: "Camila Santos, the owner of Camila's Bakery · 빵집 주인", en: 'We sold {only one|a|+} cake that day, so I {remember|v} him {clearly|d}.', ko: '저희는 그날 딱 한 개의 케이크만 팔았으니까, 저는 그를 분명히 기억해요.' }
    ] },
    { title: '범인은 누구?', s: [
      { who: "Camila Santos, the owner of Camila's Bakery · 빵집 주인", en: 'Oh, he had {blue|a} eyes.', ko: '아, 그의 눈은 파란색이었어요.' },
      { en: 'Now, look at the {information|n} about the {suspects|n}.', ko: '이제, 용의자들에 관한 정보를 보아라.' },
      { en: 'Who {threw|v} the cake at the Monalisa?', ko: "누가 '모나리자'에 케이크를 던졌을까?" }
    ] }
  ],
  // 단어장에 보여 줄 뜻
  gloss: {
    'threw': '던졌다', 'Museum': '미술관', 'eyewitnesses': '목격자들', 'say': '말하다', 'criminal': '범인',
    'looking at': '~을 보고 있는', 'painting': '그림', 'turned around': '뒤를 돌아보았다', 'in front of': '~ 앞에',
    'taller than': '~보다 키가 더 큰', 'gray': '회색의', 'fell off': '~에서 떨어졌다', 'wig': '가발',
    'ran after': '~을 쫓아 뛰어갔다', "couldn't catch": '잡을 수 없었다', 'faster than': '~보다 더 빠른', 'old': '나이 든', 'young': '젊은',
    'brown': '갈색의', 'crime scene': '범죄 현장', 'pieces': '조각들', 'near': '~ 근처에', 'next to': '~ 옆에',
    'Bakery': '빵집', 'came in': '들어왔다', 'Spanish': '스페인어', "didn't understand": '이해하지 못했다', 'English': '영어',
    'different': '다양한, 다른', 'smallest': '가장 작은', 'remember': '기억하다', 'clearly': '분명히', 'blue': '파란',
    'information': '정보', 'suspects': '용의자들',
    // 학교 학습지·쓰기 수행평가에 나오는 표현
    'Last Saturday': '지난주 토요일', 'There were': '~이 있었다', 'someone': '누군가', 'standing': '서 있는', 'wheelchair': '휠체어',
    'a little': '조금, 약간', 'all over': '~ 곳곳에', 'spoke': '말했다', 'only one': '딱 하나의'
  },
  extra: { t: ['Last Friday', 'Last Sunday', 'Next Saturday'], n: [], v: ['bought', 'sold'], a: ['shorter than', 'red'], p: ['behind', 'under', 'on top of'], d: ['slowly', 'quickly', 'loudly'] }
};

const Daily = (function () {
  const C = DAILY;
  let store = null, all = {}, S = null, result = null, view = '', hide = '';   // hide: 'ko' 뜻 가리기, 'en' 영어 가리기   // view 'words' = 단어장

  // 문장을 조각(글자, 빈칸)으로 나눕니다
  const sentences = [], byId = {}, pools = {};
  C.days.forEach((d, di) => d.s.forEach(x => {
    const idx = sentences.length, parts = [], blanks = [];
    let last = 0;
    let nOld = 0, nNew = 0;
    x.en.replace(/\{([^}|]+)(?:\|(\w+))?(\|\+)?\}/g, (m, w, t, plus, off) => {
      parts.push(x.en.slice(last, off)); parts.push({ b: blanks.length });
      const bl = { w: w, t: t || 'n', id: 's' + idx + (plus ? 'n' + nNew++ : 'b' + nOld++) };
      blanks.push(bl); last = off + m.length; return m;
    });
    parts.push(x.en.slice(last));
    const sen = { idx: idx, di: di, ko: x.ko, who: x.who || '', parts: parts, blanks: blanks };
    sentences.push(sen);
    blanks.forEach((bl, bi) => { byId[bl.id] = { s: sen, bi: bi }; (pools[bl.t] = pools[bl.t] || []).push(bl.w); });
  }));
  Object.keys(C.extra).forEach(t => { pools[t] = (pools[t] || []).concat(C.extra[t]); });

  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.d-card{display:flex;flex-direction:column;gap:4px;align-items:center;background:var(--yellow);border-radius:26px;padding:16px;font-size:22px;width:100%}' +
    '.d-card small{font-size:15px;color:var(--sub)}' +
    '.d-prog{display:flex;flex-direction:column;gap:6px}.d-prog div:first-child{display:flex;justify-content:space-between;font-size:15px;color:var(--sub)}' +
    '.d-bar{height:14px;border-radius:999px;background:#F1E2DE}.d-bar i{display:block;height:14px;border-radius:999px;background:#F2B24C}' +
    '.d-en{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:24px;line-height:1.7;font-weight:700}' +
    '.d-ko{font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;font-size:17px;color:var(--sub);line-height:1.5;margin-top:12px}' +
    '.d-hl{background:var(--yellow);border-radius:8px;padding:0 4px}' +
    '.d-blank{display:inline-block;min-width:78px;border-bottom:4px solid var(--ink);text-align:center;border-radius:8px 8px 0 0;padding:0 6px;line-height:1.3}' +
    '.d-blank.ok{background:var(--mint);border-color:var(--ok)}.d-blank.no{background:var(--pink);border-color:#B4325A}' +
    '.d-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '.d-opt{min-height:64px;border-radius:20px;background:#fff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:19px;font-weight:700;padding:6px;border:3px solid transparent}' +
    '.d-opt.ok{background:var(--mint);border-color:var(--ok)}.d-opt.no{background:var(--pink)}.d-opt:disabled{cursor:default}' +
    '.d-tag{align-self:flex-start;background:#FBEDE8;border-radius:999px;padding:6px 14px;font-size:15px}' +
    '.w-list{background:#fff;border-radius:24px;padding:6px 16px;max-height:52vh;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
    '.w-row{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid #F1E2DE;font-size:17px}.w-row:first-child{border-top:none}' +
    '.w-say{flex:none;width:34px;height:34px;padding:0;border-radius:50%;background:#FBEDE8;color:#B4688A;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}.w-say svg{width:18px;height:18px}.w-say:active{background:var(--yellow)}' +
    '.d-tags{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.w-row b{flex:0 0 40%;font-size:19px;font-weight:700;overflow-wrap:anywhere}.w-row span{flex:1;min-width:0;color:var(--sub)}' +
    '.w-row i{flex:none;font-style:normal;font-size:13px;background:var(--pink);border-radius:999px;padding:3px 9px}' +
    '.w-list.hide-ko span{visibility:hidden}.w-list.hide-en b{visibility:hidden}' +
    '.w-tog{display:grid;grid-template-columns:1fr 1fr;gap:10px}.w-tog button{min-height:56px;border-radius:20px;background:#fff;font-size:17px;font-weight:700;border:3px solid transparent}.w-tog button.on{background:var(--yellow);border-color:var(--ink)}' +
    '.d-list{font-size:17px;line-height:1.9;text-align:center}.d-list b{font-family:system-ui,sans-serif}</style>');

  // 발음 듣기: 기기에 들어 있는 영어 음성으로 읽어 줍니다 (파일 없이 브라우저 기능 사용)
  const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9a4.5 4.5 0 010 6"/></svg>';
  function sayBtn(text) { return '<button class="w-say" type="button" data-say="' + esc(text) + '" aria-label="발음 듣기">' + SPK + '</button>'; }
  function say(text) {
    try {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.85;
      const v = speechSynthesis.getVoices().filter(x => /^en[-_]US/i.test(x.lang))[0];
      if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { }
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-say]'); if (b) say(b.dataset.say); });
  function plain(sen) { return sen.parts.map(p => typeof p === 'string' ? p : sen.blanks[p.b].w).join(''); }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function dateOf(ms) { return new Date(ms + 4 * 3600000).toISOString().slice(0, 10); }   // 숙제 날짜: 한국 시간 새벽 5시에 하루가 바뀝니다 (9시간 - 5시간)
  function today() { return dateOf(store.now()); }
  function rec(sid) { return (all[sid] || {})[C.id] || {}; }
  function doneToday(sid) { return rec(sid).lastDate === today(); }
  // 한 번이라도 틀렸던 단어 전부 (단어장용, 맞혀도 지워지지 않음)
  function missedIds(sid) { const r = rec(sid); return Object.keys(Object.assign({}, r.wrong || {}, r.missed || {})).filter(id => byId[id]); }
  // 단어장: 틀렸던 단어를 한데 모아 많이 틀린 순으로 (같은 단어는 하나로 합칩니다)
  function wordList(sid) {
    const r = rec(sid), cnt = r.missN || {}, still = r.wrong || {}, map = {};
    missedIds(sid).forEach(id => {
      const w = byId[id].s.blanks[byId[id].bi].w, k = w.toLowerCase();
      const o = map[k] = map[k] || { w: w, n: 0, still: false, ko: glossOf(w) };
      o.n += cnt[id] || 1; if (still[id]) o.still = true;
    });
    return Object.keys(map).map(k => map[k]).sort((a, b) => b.n - a.n || a.w.localeCompare(b.w));
  }
  function glossOf(w) {
    if (C.gloss[w]) return C.gloss[w];
    const k = Object.keys(C.gloss).filter(x => x.toLowerCase() === String(w).toLowerCase())[0];
    return k ? C.gloss[k] : '';
  }
  // 틀린 단어 복습하기. 미션 기록은 바뀌지 않습니다
  function beginPractice(sid) {
    const queue = shuffle(missedIds(sid)).map(id => ({ kind: 'q', s: byId[id].s, bi: byId[id].bi, review: true }));
    S = { queue: queue, i: 0, right: 0, total: queue.length, done: 0, wrong: {}, isNew: false, practice: true, picked: null, opts: null, today: {} };
    S.visit = logVisit(store, sid, 'review');
    prep();
  }

  // 오늘 할 분량: 틀렸던 것 복습(최대 8개) + 새 문장. 본문을 다 돌면 복습과 섞은 문제
  function plan(sid) {
    const r = rec(sid), day = r.day || 0;
    const review = Object.keys(r.wrong || {}).filter(id => byId[id]).slice(0, 8);
    if (day < C.days.length) return { day: day, review: review, sens: sentences.filter(s => s.di === day), mix: [] };
    const rest = shuffle(Object.keys(byId).filter(id => review.indexOf(id) < 0)).slice(0, 6);
    return { day: day, review: review, sens: [], mix: rest };
  }
  function countQ(p) { return p.review.length + p.mix.length + p.sens.reduce((n, s) => n + s.blanks.length, 0); }

  function begin(sid) {
    const p = plan(sid), queue = [];
    p.review.forEach(id => queue.push({ kind: 'q', s: byId[id].s, bi: byId[id].bi, review: true }));
    p.sens.forEach(s => { queue.push({ kind: 'card', s: s }); s.blanks.forEach((b, bi) => queue.push({ kind: 'q', s: s, bi: bi })); });
    p.mix.forEach(id => queue.push({ kind: 'q', s: byId[id].s, bi: byId[id].bi, review: true }));
    S = { queue: queue, i: 0, right: 0, total: countQ(p), done: 0, wrong: Object.assign({}, rec(sid).wrong || {}), isNew: p.sens.length > 0, picked: null, opts: null, today: {}, dayNo: p.sens.length ? p.day + 1 : 0 };
    prep();
  }
  function prep() {
    const cur = S.queue[S.i];
    S.picked = null; S.opts = null;
    if (cur && cur.kind === 'q') {
      const bl = cur.s.blanks[cur.bi], seen = {}, others = [];
      pools[bl.t].forEach(w => { const k = w.toLowerCase(); if (k !== bl.w.toLowerCase() && !seen[k]) { seen[k] = 1; others.push(w); } });
      S.opts = shuffle(shuffle(others).slice(0, 3).concat([bl.w]));
    }
  }
  async function finish(sid) {
    const r = rec(sid), t = today(), yesterday = dateOf(store.now() - 86400000);
    const streak = r.lastDate === yesterday ? (r.streak || 0) + 1 : (r.lastDate === t ? (r.streak || 1) : 1);
    const wrongWords = Object.keys(S.wrong).map(id => S.wrong[id]);
    result = { right: S.right, total: S.total, streak: streak, words: wrongWords };
    const path = BASE + '/daily/' + sid + '/' + C.id;
    await store.update(path, {
      title: C.title, days: C.days.length, day: S.isNew ? (r.day || 0) + 1 : (r.day || 0),
      lastDate: t, streak: streak, wrong: wrongWords.length ? S.wrong : null
    });
    // 그날 숙제에서 틀린 단어도 함께 남겨 선생님 포털에서 회차별로 볼 수 있게 합니다
    const tw = Object.keys(S.today).map(id => S.today[id]).filter((w, i, a) => a.indexOf(w) === i);
    await store.set(path + '/log/' + t, { right: S.right, total: S.total, day: S.dayNo, words: tw.length ? tw : null });
    S = null;
  }

  function sentenceHTML(sen, mode, bi) {   // mode: 'show' 단어 강조, 'ask' bi번 빈칸 묻기
    return sen.parts.map(p => {
      if (typeof p === 'string') return esc(p);
      const w = sen.blanks[p.b].w;
      if (mode === 'show') return '<span class="d-hl">' + esc(w) + '</span>';
      if (p.b !== bi) return esc(w);
      if (S.picked == null) return '<span class="d-blank">&nbsp;</span>';
      return '<span class="d-blank ' + (S.picked === w ? 'ok' : 'no') + '">' + esc(w) + '</span>';
    }).join('');
  }

  return {
    init: function (st, onChange) { store = st; store.on(BASE + '/daily', v => { all = v || {}; onChange(); }); },
    doneToday: doneToday,
    missed: missedIds,
    lobbyCard: function (sid) {
      const r = rec(sid), n = C.days.length, day = r.day || 0;
      if (doneToday(sid)) return '<button class="d-card" data-act="d-open">오늘의 영어 미션 완료!<small>연속 ' + (r.streak || 1) + '일째 · 내일 또 만나요</small></button>';
      return '<button class="d-card" data-act="d-open">오늘의 영어 미션<small>' + esc(C.title) + ' · ' + (day < n ? (day + 1) + '일째 / ' + n + '일' : '복습 연습') + ' · 3분이면 끝</small></button>';
    },
    words: wordList,
    gloss: glossOf,
    html: function (sid) {
      if (view === 'words') {
        const ws = wordList(sid);
        return '<h1>단어장</h1><p class="sub">' + (ws.length ? '숙제에서 틀린 단어 ' + ws.length + '개 · 많이 틀린 순' : '아직 틀린 단어가 없어요') + '</p>' +
          (ws.length ? '<div class="w-list' + (hide ? ' hide-' + hide : '') + '">' + ws.map(o => '<div class="w-row">' + sayBtn(o.w) + '<b class="d-en" style="line-height:1.3">' + esc(o.w) + '</b><span>' + esc(o.ko) + '</span>' + (o.n > 1 ? '<i>' + o.n + '번</i>' : '') + '</div>').join('') + '</div>' +
            '<div class="w-tog"><button class="' + (hide === 'ko' ? 'on' : '') + '" data-act="d-hide" data-h="ko">' + (hide === 'ko' ? '뜻 다시 보기' : '뜻 가리고 보기') + '</button>' +
            '<button class="' + (hide === 'en' ? 'on' : '') + '" data-act="d-hide" data-h="en">' + (hide === 'en' ? '영어 다시 보기' : '영어 가리고 보기') + '</button></div><span style="margin-top:auto"></span>'
            : '<div class="card"><p class="sub">영어 미션에서 틀린 단어가 생기면 여기에 모여요.</p></div><span style="margin-top:auto"></span>') +
          '<button class="big" data-act="d-exit">대기실로</button>';
      }
      if (result && result.practice) {
        return '<h1>한 바퀴 끝!</h1><div class="card"><p class="sub">이번에 맞힌 단어</p><p class="bignum">' + result.right + ' / ' + result.total + '</p></div>' +
          '<p class="sub">이 단어들은 단어장에 계속 남아 있어요</p>' +
          '<button class="big" data-act="d-review" style="margin-top:auto">한 번 더 풀기</button><button class="ghost" data-act="d-words">단어장 보기</button><button class="ghost" data-act="d-exit">대기실로</button>';
      }
      if (result) {
        return '<h1>미션 완료!</h1><div class="card"><p class="sub">오늘 맞힌 문제</p><p class="bignum">' + result.right + ' / ' + result.total + '</p></div>' +
          '<div class="wait">연속 ' + result.streak + '일째예요</div>' +
          (result.words.length ? '<div class="card"><p class="sub">내일 다시 만날 단어</p><p class="d-list"><b>' + result.words.map(esc).join('</b> · <b>') + '</b></p></div>' : '<p class="sub">틀린 단어가 하나도 없어요!</p>') +
          '<button class="big" data-act="d-exit" style="margin-top:auto">대기실로</button>';
      }
      if (!S) {
        if (doneToday(sid)) return '<h1>오늘 미션은 끝!</h1><div class="wait">내일 새 문장이 열려요</div><button class="big" data-act="d-exit" style="margin-top:auto">대기실로</button>';
        const p = plan(sid), n = C.days.length, newQ = p.sens.reduce((k, s) => k + s.blanks.length, 0);
        return '<h1>오늘의 영어 미션</h1><p class="sub">' + esc(C.title) + (p.day < n ? ' · ' + (p.day + 1) + '일째 / ' + n + '일' : ' · 복습 연습') + '</p>' +
          '<div class="card" style="text-align:center">' + (p.sens.length ? '<p class="qtext" style="font-size:26px">' + esc(C.days[p.day].title) + '</p>' : '') +
          '<p class="why" style="margin-top:10px">' + (p.sens.length ? '새 문장 ' + p.sens.length + '개 · 문제 ' + newQ + '개' : '섞어 풀기 ' + p.mix.length + '개') +
          (p.review.length ? '<br>어제 틀린 것 다시 ' + p.review.length + '개' : '') + '</p></div>' +
          '<div class="wait">문제는 모두 ' + countQ(p) + '개. 3분이면 끝나요</div>' +
          '<button class="big" data-act="d-start" style="margin-top:auto">시작</button><button class="ghost" data-act="d-exit">나중에 할래요</button>';
      }
      const cur = S.queue[S.i];
      const prog = '<div class="d-prog"><div><span>' + esc(C.title) + '</span><span>문제 ' + Math.min(S.done + (cur.kind === 'q' ? 1 : 0), S.total) + ' / ' + S.total + '</span></div><div class="d-bar"><i style="width:' + Math.round(S.done / S.total * 100) + '%"></i></div></div>';
      const who = cur.s.who ? '<div class="d-tag">' + esc(cur.s.who) + '</div>' : '';
      if (cur.kind === 'card') {
        return prog + '<div class="d-tags"><div class="d-tag">새 문장</div>' + sayBtn(plain(cur.s)) + '</div>' + who + '<div class="card"><p class="d-en">' + sentenceHTML(cur.s, 'show') + '</p><p class="d-ko">' + esc(cur.s.ko) + '</p></div>' +
          '<p class="sub">색칠한 단어를 잘 봐 두세요</p><button class="big" data-act="d-next" style="margin-top:auto">봤어요! 문제 풀기</button>';
      }
      const bl = cur.s.blanks[cur.bi], answered = S.picked != null, ok = S.picked === bl.w;
      return prog + '<div class="d-tags"><div class="d-tag">' + (S.practice ? '틀린 단어 복습' : (cur.review ? '다시 풀기' : '빈칸 채우기')) + '</div>' + (answered ? sayBtn(plain(cur.s)) : '') + '</div>' + who +
        '<div class="card"><p class="d-en">' + sentenceHTML(cur.s, 'ask', cur.bi) + '</p><p class="d-ko">' + esc(cur.s.ko) + '</p></div>' +
        '<div class="d-opts">' + S.opts.map((w, i) => '<button class="d-opt' + (answered ? (w === bl.w ? ' ok' : (w === S.picked ? ' no' : '')) : '') + '" data-act="d-pick" data-i="' + i + '"' + (answered ? ' disabled' : '') + '>' + esc(w) + '</button>').join('') + '</div>' +
        (answered ? '<p class="sub">' + (ok ? '정답이에요!' : (S.practice ? '괜찮아요. 단어장에 남아 있어요' : '괜찮아요. 내일 한 번 더 만나요')) + '</p><button class="big" data-act="d-next" style="margin-top:auto">다음</button>' : '<p class="sub">빈칸에 들어갈 말을 눌러요</p>' + (S.practice ? '<button class="ghost" data-act="d-exit" style="margin-top:auto">그만하기</button>' : ''));
    },
    // 눌린 버튼 처리. 화면을 바꿔야 하면 'daily', 대기실로 가면 'lobby' 를 돌려줍니다
    click: async function (act, b, sid) {
      if (act === 'd-open') { result = null; S = null; view = ''; return 'daily'; }
      if (act === 'd-exit') { result = null; S = null; view = ''; return 'lobby'; }
      if (act === 'd-words') { result = null; S = null; view = 'words'; hide = ''; logVisit(store, sid, 'words'); return 'daily'; }
      if (act === 'd-hide') { hide = hide === b.dataset.h ? '' : b.dataset.h; return 'daily'; }
      if (act === 'd-start') { begin(sid); return 'daily'; }
      if (act === 'd-review') { result = null; S = null; if (missedIds(sid).length) { view = ''; beginPractice(sid); } else view = 'words'; return 'daily'; }
      if (act === 'd-pick' && S && S.picked == null) {
        const cur = S.queue[S.i], bl = cur.s.blanks[cur.bi];
        S.picked = S.opts[Number(b.dataset.i)]; S.done++;
        if (S.picked === bl.w) { S.right++; delete S.wrong[bl.id]; Sound.good(); }
        else {
          S.wrong[bl.id] = bl.w; Sound.soft();
          S.today[bl.id] = bl.w;
          const r0 = rec(sid), m = {}, c = {}; m[bl.id] = bl.w;   // 틀린 단어는 바로 단어장에 남기고, 몇 번 틀렸는지도 셉니다
          c[bl.id] = ((r0.missN || {})[bl.id] || ((r0.missed || {})[bl.id] ? 1 : 0)) + 1;
          store.update(BASE + '/daily/' + sid + '/' + C.id + '/missed', m);
          store.update(BASE + '/daily/' + sid + '/' + C.id + '/missN', c);
        }
        return 'daily';
      }
      if (act === 'd-next' && S) {
        S.i++;
        if (S.i >= S.queue.length) {
          if (S.practice) { result = { practice: true, right: S.right, total: S.total }; if (S.visit) store.update(S.visit, { right: S.right, total: S.total }); S = null; } else await finish(sid);
          Sound.fanfare();
        } else prep();
        return 'daily';
      }
      return 'daily';
    }
  };
})();
