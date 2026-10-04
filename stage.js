const app = document.getElementById('app');
const store = makeStore();
const Q = MOCK ? '?mock' : '';
let students = {}, presence = {}, live = null, authed = null, flipping = false;

store.on('teacher/pinHash', v => { authed = MOCK || (!!v && local('sw_teacher') === v); render(); });
store.on(BASE + '/students', v => { students = v || {}; render(); });
store.on(BASE + '/presence', v => { presence = v || {}; render(); });
let lastCue = '', lastTick = 0;
store.on(BASE + '/live', v => {
  live = v; flipping = false; render();
  const cue = live ? live.sessionId + '/' + live.q + '/' + live.phase : '';
  if (cue !== lastCue && live && authed) {
    if (live.phase === 'question') Sound.dingdong();
    else if (live.phase === 'reveal') Sound.good();
    else if (live.phase === 'end') Sound.fanfare();
    lastTick = 0;
  }
  lastCue = cue;
});

setInterval(() => {
  if (!live || live.phase !== 'count') return;
  const left = Math.ceil((live.endsAt - store.now()) / 1000);
  const el = document.getElementById('cd');
  if (el) el.textContent = left > 0 ? left : '끝';
  if (left > 0 && left !== lastTick) { lastTick = left; Sound.tick(); }
  if (left <= 0 && !flipping) { flipping = true; store.update(BASE + '/live', { phase: 'reveal' }); }
}, 200);

// ----- 강의 화면 -----
document.head.insertAdjacentHTML('beforeend', '<style>' +
  '.lz-intro{display:flex;gap:3vw;flex-wrap:wrap;align-items:stretch}' +
  '.lz-word{flex:1 1 260px;background:var(--pink);border-radius:32px;padding:4vh 3vw;display:flex;flex-direction:column;justify-content:center;text-align:center}' +
  '.lz-big{font-size:clamp(60px,11vw,150px);line-height:1.1}.lz-mean{font-size:clamp(22px,3vw,42px)}' +
  '.lz-cats{flex:2 1 420px;display:flex;gap:1.6vw;flex-wrap:wrap}' +
  '.lz-cat{flex:1 1 150px;background:#fff;border-radius:28px;padding:2.4vh 1vw;text-align:center;visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1vh}' +
  '.lz-cat.show{visibility:visible}.lz-cat svg{width:clamp(70px,9vw,120px);height:auto}' +
  '.lz-catname{font-size:clamp(22px,3vw,40px)}.lz-ex{font-size:clamp(18px,2.2vw,30px);color:var(--sub);word-break:keep-all}' +
  '.lz-sent{line-height:2.3;font-size:clamp(28px,5vw,76px)}.lz-w{white-space:nowrap}' +
  '.lz-ring{position:relative;display:inline-block;line-height:1.3;padding:0 .2em;border-radius:999px;border:6px solid transparent}' +
  '.lz-ring.on{border-color:var(--pink2);background:var(--pink)}' +
  '.lz-ring small{position:absolute;left:50%;top:100%;transform:translateX(-50%);font-size:.32em;color:#9C2748;visibility:hidden;white-space:nowrap;line-height:1.5}' +
  '.lz-ring.on small{visibility:visible}.lz-cap{visibility:hidden}.lz-cap.show{visibility:visible}' +
  '.lz-odd{display:flex;gap:1.6vw;flex-wrap:wrap;justify-content:center}' +
  '.lz-card{flex:1 1 150px;max-width:230px;background:#fff;border-radius:28px;padding:3vh 1.5vw;text-align:center;font-size:clamp(24px,3.6vw,52px);white-space:nowrap;border:6px solid transparent}' +
  '.lz-card small{display:block;font-size:.4em;color:var(--sub);margin-top:.6vh}' +
  '.lz-card.ok{background:var(--mint)}.lz-card.odd{background:var(--yellow);border-color:var(--ink)}' +
  '.go.plain{background:#FBEDE8}.lz-btns{display:flex;gap:12px}</style>');

const ICONS = {
  person: () => avatarSVG({ hair: HAIRS[0], style: 2 }, 96),
  thing: () => '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 20c-10-8-24-1-22 14 2 13 10 22 22 18 12 4 20-5 22-18 2-15-12-22-22-14z" fill="#F29BB5"/><path d="M32 20c0-6 2-10 6-12" stroke="#6B4A3A" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="42" cy="12" rx="7" ry="4" fill="#7CC7B0" transform="rotate(-25 42 12)"/></svg>',
  place: () => '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="28" width="48" height="28" rx="3" fill="#FFE39A"/><path d="M4 30L32 10l28 20z" fill="#F29BB5"/><rect x="27" y="40" width="10" height="16" rx="2" fill="#6B4A3A"/><rect x="13" y="36" width="9" height="9" rx="2" fill="#CFE0FF"/><rect x="42" y="36" width="9" height="9" rx="2" fill="#CFE0FF"/><circle cx="32" cy="24" r="4" fill="#fff"/></svg>'
};

function lessonMax(pg) { return pg.type === 'intro' ? pg.cats.length : pg.type === 'sentence' ? pg.words.filter(w => w.hit).length : 1; }

function lessonHTML() {
  const L = LESSONS[live.lessonId], pi = live.page, st = live.step || 0, total = L.pages.length;
  const head = '<div class="top"><div class="chip">' + esc(L.subject) + ' · ' + esc(L.unit) + ' · ' + esc(L.word) + '</div><div class="sub">' + (pi < total ? (pi + 1) + ' / ' + total : '끝') + '</div></div>';
  if (pi >= total) {
    return head + '<h1>' + esc(L.word) + ' 강의 끝!</h1><p class="sub">이제 퀴즈로 확인해 볼까요?</p><div class="sets">' +
      (L.quiz && SETS[L.quiz] ? '<div class="set"><span>퀴즈 · ' + esc(SETS[L.quiz].title) + '</span><button class="go" data-act="start" data-set="' + L.quiz + '">퀴즈 시작</button></div>' : '') +
      '</div><div class="bar"><button class="quiet" data-act="back">이전</button><button class="go plain" data-act="stop">대기실로</button></div>';
  }
  const pg = L.pages[pi], max = lessonMax(pg);
  let body = '';
  if (pg.type === 'intro') {
    body = '<div class="lz-intro"><div class="lz-word"><div class="lz-big">' + esc(L.word) + '</div><div class="lz-mean">' + esc(pg.mean) + '</div></div><div class="lz-cats">' +
      pg.cats.map((c, i) => '<div class="lz-cat' + (i < st ? ' show' : '') + '">' + ICONS[c.icon]() + '<div class="lz-catname">' + esc(c.name) + '</div><div class="lz-ex">' + esc(c.ex.join(' · ')) + '</div></div>').join('') + '</div></div>';
  } else if (pg.type === 'sentence') {
    let h = 0;
    body = '<p class="sub">' + esc(pg.ask) + '</p><div class="card"><p class="qtext lz-sent">' + pg.words.map(w => {
      if (!w.hit) return '<span class="lz-w">' + esc(w.w) + esc(w.tail || '') + '</span>';
      h++;
      return '<span class="lz-w"><span class="lz-ring' + (h <= st ? ' on' : '') + '">' + esc(w.w) + '<small>' + esc(L.word) + '</small></span>' + esc(w.tail || '') + '</span>';
    }).join(' ') + '</p></div><p class="why lz-cap' + (st >= max ? ' show' : '') + '">' + esc(pg.cap) + '</p>';
  } else {
    body = '<h1>' + esc(pg.ask) + '</h1><div class="lz-odd">' + pg.words.map(w =>
      '<div class="lz-card' + (st >= 1 ? (w.odd ? ' odd' : ' ok') : '') + '">' + esc(w.w) + '<small>' + (st >= 1 ? esc(w.odd ? w.tag : L.word) : '&nbsp;') + '</small></div>').join('') +
      '</div><p class="why lz-cap' + (st >= 1 ? ' show' : '') + '">' + esc(pg.cap) + '</p>';
  }
  return head + body + '<div class="bar"><button class="quiet" data-act="stop">강의 끝내기</button><div class="lz-btns"><button class="go plain" data-act="back">이전</button><button class="go" data-act="fwd">다음</button></div></div>';
}

async function lessonMove(dir) {
  if (!live || live.mode !== 'lesson') return;
  const L = LESSONS[live.lessonId], total = L.pages.length;
  let p = live.page, st = live.step || 0;
  if (dir > 0) {
    if (p >= total) return;
    if (st < lessonMax(L.pages[p])) st++; else { p++; st = 0; }
  } else {
    if (p >= total) { p = total - 1; st = lessonMax(L.pages[p]); }
    else if (st > 0) st--;
    else if (p > 0) { p--; st = lessonMax(L.pages[p]); }
    else return;
  }
  await store.update(BASE + '/live', { page: p, step: st });
}
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); lessonMove(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); lessonMove(-1); }
});

function seats(stateOf) {
  return '<div class="seats">' + Object.keys(students).map(id => {
    const on = !!presence[id]; const st = stateOf ? stateOf(id) : null;
    return '<div class="seat ' + (on ? '' : 'off') + '">' + avatarSVG(students[id].avatar, 96) + '<div>' + esc(students[id].name) + '</div>' +
      (st ? '<div class="state' + (st.good ? ' good' : '') + '">' + st.text + '</div>' : '') + '</div>';
  }).join('') + '</div>';
}

function render() {
  if (authed === null) return;
  if (!authed) { app.innerHTML = '<h1>수업 화면</h1><p class="sub">선생님 포털에서 먼저 로그인해 주세요.</p><p class="sub"><a href="teacher.html' + Q + '">선생님 포털로 가기</a></p>'; return; }
  if (live && live.mode === 'lesson' && LESSONS[live.lessonId]) { app.innerHTML = lessonHTML(); return; }
  const set = live && SETS[live.setId];
  if (!set) {
    app.innerHTML = '<h1>대기실</h1><p class="sub">친구들이 들어오면 캐릭터가 선명해져요</p>' +
      seats(id => ({ text: presence[id] ? '들어왔어요' : '아직이에요', good: !!presence[id] })) +
      '<div class="sets">' + Object.keys(LESSONS).map(k => '<div class="set"><span>강의 · ' + esc(LESSONS[k].subject) + ' · ' + esc(LESSONS[k].unit) + ' · ' + esc(LESSONS[k].word) + ' (' + LESSONS[k].pages.length + '장)</span><button class="go" data-act="lesson" data-id="' + k + '">강의 시작</button></div>').join('') +
      Object.keys(SETS).map(k => '<div class="set"><span>퀴즈 · ' + esc(SETS[k].subject) + ' · ' + esc(SETS[k].title) + ' (' + SETS[k].items.length + '문제)</span><button class="go" data-act="start" data-set="' + k + '">시작</button></div>').join('') + '</div>' +
      '<div class="bar"><a class="quiet" href="teacher.html' + Q + '">선생님 포털</a><span></span></div>';
    return;
  }
  const n = set.items.length, qi = live.q, it = set.items[qi], ch = choicesOf(set, it), ids = Object.keys(students);
  const top = '<div class="top"><div class="chip">' + esc(set.subject) + ' · ' + esc(set.unit) + '</div><div class="sub">문제 ' + (qi + 1) + ' / ' + n + '</div></div>';
  const stop = '<button class="quiet" data-act="stop">수업 끝내기</button>';
  if (live.phase === 'end') {
    const team = ids.reduce((s, id) => s + correctCount(live, set, id), 0);
    app.innerHTML = '<h1>끝! 모두 수고했어요</h1>' + seats(id => ({ text: n + '문제 중 ' + correctCount(live, set, id) + '개', good: true })) +
      '<div class="team">우리 팀이 함께 맞힌 문제 ' + team + '개</div>' +
      '<div class="bar"><span></span><button class="go" data-act="stop">대기실로</button></div>';
    return;
  }
  if (live.phase === 'reveal') {
    const right = ids.filter(id => answerOf(live, qi, id) === it.a).length;
    app.innerHTML = top + '<div class="card"><p class="qtext">' + markQ(it.q) + '</p></div>' +
      '<div class="choices">' + ch.map((c, i) => '<div class="choice ' + (i === it.a ? 'right' : 'fade') + '">' + esc(c) + '</div>').join('') + '</div>' +
      '<p class="why">' + esc(it.why) + '</p>' +
      seats(id => { const a = answerOf(live, qi, id); return a === it.a ? { text: '정답!', good: true } : { text: a == null ? '못 골랐어요' : '아쉬워요' }; }) +
      '<div class="bar">' + stop + '<div class="team" style="margin:0">이번 문제 ' + right + '명 정답</div><button class="go" data-act="next">' + (qi + 1 < n ? '다음 문제' : '결과 보기') + '</button></div>';
    return;
  }
  const counting = live.phase === 'count';
  app.innerHTML = top + '<div class="card"><p class="qtext">' + markQ(it.q) + '</p><p class="sub" style="margin-top:1.5vh">' + esc(it.ask || set.ask) + '</p></div>' +
    '<div class="choices">' + ch.map(c => '<div class="choice">' + esc(c) + '</div>').join('') + '</div>' +
    (counting ? '<div id="cd" class="cd"></div>' : '') +
    seats(id => answerOf(live, qi, id) != null ? { text: '골랐어요', good: true } : { text: '고민 중…' }) +
    '<div class="bar">' + stop + (counting ? '<span></span>' : '<button class="go" data-act="count">5초 카운트다운 시작</button>') + '</div>';
}

app.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  Sound.tap();
  const act = b.dataset.act;
  if (act === 'start') {
    await store.set(BASE + '/live', { sessionId: store.newId(), setId: b.dataset.set, q: 0, phase: 'question', startedAt: store.now() });
  } else if (act === 'lesson') {
    await store.set(BASE + '/live', { sessionId: store.newId(), mode: 'lesson', lessonId: b.dataset.id, page: 0, step: 0 });
  } else if (act === 'fwd') { await lessonMove(1); }
  else if (act === 'back') { await lessonMove(-1); }
  else if (act === 'count') {
    await store.update(BASE + '/live', { phase: 'count', endsAt: store.now() + 5000 });
  } else if (act === 'next') {
    const set = SETS[live.setId];
    if (live.q + 1 < set.items.length) await store.update(BASE + '/live', { q: live.q + 1, phase: 'question', endsAt: null });
    else {
      const rec = Object.assign({}, live, { phase: 'end', endedAt: store.now() });
      await store.set(BASE + '/sessions/' + live.sessionId, rec);   // 학습 기록으로 남김
      await store.update(BASE + '/live', { phase: 'end' });
    }
  } else if (act === 'stop') {
    await store.remove(BASE + '/live');
  }
});
