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
  const set = live && SETS[live.setId];
  if (!set) {
    app.innerHTML = '<h1>대기실</h1><p class="sub">친구들이 들어오면 캐릭터가 선명해져요</p>' +
      seats(id => ({ text: presence[id] ? '들어왔어요' : '아직이에요', good: !!presence[id] })) +
      '<div class="sets">' + Object.keys(SETS).map(k => '<div class="set"><span>' + esc(SETS[k].subject) + ' · ' + esc(SETS[k].title) + ' (' + SETS[k].items.length + '문제)</span><button class="go" data-act="start" data-set="' + k + '">시작</button></div>').join('') + '</div>' +
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
  } else if (act === 'count') {
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
