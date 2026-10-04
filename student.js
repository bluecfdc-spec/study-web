const app = document.getElementById('app');
const store = makeStore();
let students = {}, presence = {}, loaded = false;
let screen = 'names', me = null, pin = '', firstPin = '', pinMode = '', msg = '', draft = null;

store.on(BASE + '/students', v => {
  students = v || {};
  if (!loaded) { loaded = true; autoLogin(); }
  if (me && !students[me]) { local('sw_sid', null); me = null; screen = 'names'; }
  render();
});
store.on(BASE + '/presence', v => { presence = v || {}; if (screen === 'lobby') render(); });
let live = null;
let lastCue = '';
store.on(BASE + '/live', v => {
  live = v; sync(); render();
  // 폰에서는 내 결과 소리만. 함께 듣는 소리는 큰 화면이 냅니다
  const cue = live ? live.sessionId + '/' + live.q + '/' + live.phase : '';
  if (cue !== lastCue && screen === 'quiz' && live.phase === 'reveal') {
    const set = SETS[live.setId];
    if (answerOf(live, live.q, me) === set.items[live.q].a) Sound.good(); else Sound.soft();
  }
  lastCue = cue;
});
Daily.init(store, () => { if (screen === 'lobby') render(); });
Notes.init(store, () => { if (screen === 'lobby' || screen === 'notes') render(); });
function sync() { if (me && (screen === 'lobby' || screen === 'quiz')) screen = (live && SETS[live.setId]) ? 'quiz' : 'lobby'; }
setInterval(() => {
  if (screen !== 'quiz' || !live || live.phase !== 'count') return;
  const el = document.getElementById('cd');
  const left = Math.ceil((live.endsAt - store.now()) / 1000);
  if (el) el.textContent = left > 0 ? left : '끝';
}, 200);

function quizHTML() {
  const set = SETS[live.setId], n = set.items.length, qi = live.q, it = set.items[qi];
  const top = '<div class="row" style="align-items:center"><div class="chip">' + esc(set.subject) + ' · ' + esc(set.unit) + '</div><div class="sub">문제 ' + (qi + 1) + ' / ' + n + '</div></div>';
  if (live.phase === 'end') {
    return '<h1>끝! 수고했어요</h1><div class="card"><p class="sub">내가 맞힌 문제</p><p class="bignum">' + correctCount(live, set, me) + ' / ' + n + '</p></div>' +
      '<div class="card">' + oxRow(live, set, me) + '</div><p class="sub">틀린 문제는 오답노트에서 다시 풀 수 있어요</p>';
  }
  const mine = answerOf(live, qi, me), ch = choicesOf(set, it);
  if (live.phase === 'reveal') {
    const ok = mine === it.a;
    return top + '<div class="banner ' + (ok ? 'good' : 'soft') + '">' + (ok ? '정답이에요!' : (mine == null ? '이번엔 못 골랐어요' : '아쉬워요, 괜찮아요')) + '</div>' +
      '<div class="card"><p class="qtext">' + markQ(it.q) + '</p><p class="sub" style="margin-top:12px">정답은</p><p class="bignum" style="font-size:40px">' + esc(ch[it.a]) + '</p></div>' +
      '<p class="why">' + esc(it.why) + '</p>';
  }
  const counting = live.phase === 'count';
  return top + '<div class="center"><div id="cd" class="cd' + (counting ? '' : ' idle') + '">' + (counting ? '' : '생각 중') + '</div></div>' +
    '<div class="card"><p class="qtext">' + markQ(it.q) + '</p><p class="sub" style="margin-top:10px">' + esc(it.ask || set.ask) + '</p></div>' +
    '<div class="choices">' + ch.map((c, i) => '<button class="choice' + (mine === i ? ' on' : (mine != null ? ' dim' : '')) + '" data-act="ans" data-i="' + i + '"' + (mine != null ? ' disabled' : '') + '>' + esc(c) + '</button>').join('') + '</div>' +
    '<p class="sub">' + (mine != null ? '골랐어요! 결과를 기다려요' : '하나를 골라 눌러요') + '</p>';
}

function autoLogin() {
  const sid = local('sw_sid');
  if (sid && students[sid] && students[sid].pinHash) enter(sid);
}
function enter(sid) {
  me = sid; local('sw_sid', sid);
  store.presence(BASE + '/presence/' + sid);
  if (students[sid].avatar) { screen = 'lobby'; sync(); } else openAvatar();
}
function openAvatar() {
  const a = (students[me] && students[me].avatar) || {};
  draft = { hair: a.hair || HAIRS[0], style: a.style || 0 };
  screen = 'avatar';
}

function render() {
  if (!loaded) return;
  const mock = MOCK ? '<div class="mock">연습용 화면입니다. 저장되지 않아요.</div>' : '';
  let h = '';
  if (screen === 'names') {
    const ids = Object.keys(students);
    h = '<h1>누구인가요?</h1><p class="sub">내 이름을 눌러 주세요</p>';
    if (!ids.length) h += '<div class="card"><p class="sub">선생님이 아직 친구들을 등록하지 않았어요.</p></div>';
    h += '<div class="names">' + ids.map(id =>
      '<button class="name-btn" data-act="pick" data-id="' + esc(id) + '">' + avatarSVG(students[id].avatar, 56) + '<span>' + esc(students[id].name) + '</span></button>'
    ).join('') + '</div>';
  } else if (screen === 'pin') {
    const titles = { set1: '비밀번호를 만들어요', set2: '한 번 더 눌러 주세요', enter: '비밀번호를 눌러 주세요' };
    const subs = { set1: '나만 아는 숫자 4개', set2: '방금 정한 숫자 4개', enter: esc(students[me].name) + ' 맞죠?' };
    h = '<h1>' + titles[pinMode] + '</h1><p class="sub">' + subs[pinMode] + '</p>' +
      '<div class="dots" aria-label="입력한 숫자 ' + pin.length + '개">' + [0, 1, 2, 3].map(i => '<div class="dot' + (i < pin.length ? ' on' : '') + '"></div>').join('') + '</div>' +
      '<p class="msg" role="status">' + esc(msg) + '</p>' +
      '<div class="keys">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button class="key" data-act="key" data-n="' + n + '">' + n + '</button>').join('') +
      '<button class="key small" data-act="back">처음으로</button><button class="key" data-act="key" data-n="0">0</button><button class="key small" data-act="del">지우기</button></div>';
  } else if (screen === 'avatar') {
    h = '<h1>내 캐릭터 꾸미기</h1>' +
      '<div class="center">' + avatarSVG(draft, 190) + '</div>' +
      '<div class="card"><div class="label">머리 색</div><div class="swatches">' + HAIRS.map((c, i) =>
        '<button class="swatch' + (draft.hair === c ? ' on' : '') + '" style="background:' + c + '" data-act="hair" data-c="' + c + '" aria-label="' + HAIR_NAMES[i] + '" aria-pressed="' + (draft.hair === c) + '"></button>').join('') + '</div>' +
      '<div class="label" style="margin-top:18px">머리 모양</div><div class="styles">' + STYLES.map((s, i) =>
        '<button class="style-btn' + (draft.style === i ? ' on' : '') + '" data-act="style" data-i="' + i + '" aria-pressed="' + (draft.style === i) + '">' + s + '</button>').join('') + '</div></div>' +
      '<button class="big" data-act="saveAvatar">완성!</button>';
  } else if (screen === 'daily') {
    h = Daily.html(me);
  } else if (screen === 'notes') {
    h = Notes.html(me);
  } else if (screen === 'quiz') {
    h = quizHTML();
  } else if (screen === 'lobby') {
    const ids = Object.keys(students);
    // 친구들은 위에 작게, 그 아래에 도장판과 큰 버튼들
    h = '<div class="lb-friends">' + ids.map(id => {
        const on = !!presence[id] || id === me;
        return '<div class="lb-f' + (on ? '' : ' off') + '">' + avatarSVG(students[id].avatar, 46) + '<div><div>' + esc(students[id].name) + (id === me ? ' (나)' : '') + '</div>' +
          '<div class="lb-s">' + (on ? '접속 중' : '없음') + (Daily.doneToday(id) ? ' · 미션 완료' : '') + '</div></div></div>';
      }).join('') + '</div>' +
      Notes.stamps(me) + Daily.lobbyCard(me) + Notes.lobbyButton(me) +
      '<div class="row" style="margin-top:auto"><button class="ghost" data-act="editAvatar">캐릭터 바꾸기</button><button class="ghost" data-act="logout">나가기</button></div>';
  }
  app.innerHTML = mock + h;
}

app.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act !== 'd-pick' && act !== 'n-pick') Sound.tap();
  if (act.indexOf('d-') === 0 || act.indexOf('n-') === 0) {   // 오늘의 영어 미션, 오답노트 버튼
    screen = act.indexOf('d-') === 0 ? await Daily.click(act, b, me) : await Notes.click(act, b, me);
    if (screen === 'lobby') sync();
    render(); return;
  }
  if (act === 'pick') {
    me = b.dataset.id; pin = ''; firstPin = ''; msg = '';
    pinMode = students[me].pinHash ? 'enter' : 'set1'; screen = 'pin';
  } else if (act === 'back') { me = null; screen = 'names'; }
  else if (act === 'del') { pin = pin.slice(0, -1); }
  else if (act === 'key') {
    if (pin.length >= 4) return;
    pin += b.dataset.n; msg = '';
    if (pin.length === 4) { render(); await pinDone(); }
  } else if (act === 'ans') {
    if (!live || (live.phase !== 'question' && live.phase !== 'count')) return;
    if (live.phase === 'count' && store.now() > live.endsAt + 300) return;
    if (answerOf(live, live.q, me) != null) return;
    await store.set(BASE + '/live/answers/q' + live.q + '/' + me, Number(b.dataset.i));
    return;
  } else if (act === 'hair') { draft.hair = b.dataset.c; }
  else if (act === 'style') { draft.style = Number(b.dataset.i); }
  else if (act === 'saveAvatar') {
    await store.set(BASE + '/students/' + me + '/avatar', draft);
    students[me].avatar = draft; screen = 'lobby'; sync();
  } else if (act === 'editAvatar') { openAvatar(); }
  else if (act === 'logout') {
    local('sw_sid', null);
    await store.remove(BASE + '/presence/' + me);
    if (MOCK) { me = null; screen = 'names'; } else { location.reload(); return; }
  }
  render();
});

async function pinDone() {
  const entered = pin; pin = '';
  if (pinMode === 'set1') { firstPin = entered; pinMode = 'set2'; return; }
  if (pinMode === 'set2') {
    if (entered !== firstPin) { msg = '두 번이 서로 달라요. 다시 정해 볼까요?'; pinMode = 'set1'; return; }
    const hsh = await hashPin(me, entered);
    await store.set(BASE + '/students/' + me + '/pinHash', hsh);
    students[me].pinHash = hsh; enter(me); return;
  }
  const ok = MOCK ? true : (await hashPin(me, entered)) === students[me].pinHash;
  if (ok) enter(me); else msg = '숫자가 달라요. 다시 눌러 볼까요?';
}
