const app = document.getElementById('app');
const store = makeStore();
let students = {}, presence = {}, daily = {}, visits = {}, view = 'students', teacherHash = undefined, authed = false, msg = '', confirmDel = null;
const studentUrl = location.href.replace(/teacher\.html.*$/, '');

function sess(v) { return local('sw_teacher', v); }

store.on('teacher/pinHash', v => { teacherHash = v || null; if (MOCK || (teacherHash && sess() === teacherHash)) authed = true; render(); });
store.on(BASE + '/students', v => { students = v || {}; render(); });
store.on(BASE + '/presence', v => { presence = v || {}; render(); });
store.on(BASE + '/daily', v => { daily = v || {}; render(); });
store.on(BASE + '/visits', v => { visits = v || {}; render(); });
Daily.init(store, () => render());

function koDate(ms) { return new Date(ms + 4 * 3600000).toISOString().slice(0, 10); }   // 숙제 날짜: 한국 시간 새벽 5시에 하루가 바뀝니다

// 숙제 현황: 학생마다 진도 · 회차별 결과(누적) · 꼭 외워야 할 단어 · 복습하러 들어온 기록
const OLD_VISIT = { review: '틀린 단어 복습(문제)', replay: '수업 문제 다시 풀기' };   // 예전에 있던 메뉴의 기록
const VISIT = { words: '단어장', wrong: '수업 중 오답노트' };
function koTime(ms) { const d = new Date(ms + 9 * 3600000), z = n => String(n).padStart(2, '0'); return (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일 ' + z(d.getUTCHours()) + ':' + z(d.getUTCMinutes()); }
function visitsHTML(id) {
  const list = Object.keys(visits[id] || {}).map(k => visits[id][k]).filter(v => v && v.at).sort((x, y) => y.at - x.at);
  const kindOf = v => v.k === 'wrongRun' ? 'wrong' : (v.k === 'replayRun' ? 'replay' : v.k);
  // 들어간 횟수: 단어장·복습은 열 때마다, 오답노트·다시 풀기는 메뉴에 들어갈 때마다 1번
  const opens = list.filter(v => VISIT[v.k]);
  let h = '<h3>복습하러 들어온 기록</h3><div class="hw-counts">' + Object.keys(VISIT).map(k => {
    const mineK = opens.filter(v => v.k === k);
    return '<div class="hw-count"><b>' + mineK.length + '번</b>' + VISIT[k] + '<small>' + (mineK.length ? '최근 ' + koTime(mineK[0].at) : '아직 없음') + '</small></div>';
  }).join('') + '</div>';
  if (list.length) h += '<ul class="hw-log">' + list.slice(0, 6).map(v =>
    '<li><span>' + koTime(v.at) + '</span>' + esc(VISIT[kindOf(v)] || OLD_VISIT[v.k] || v.k) + (v.unit ? ' · ' + esc(v.unit) + ' 풀기' : '') + (v.total ? ' · ' + v.right + ' / ' + v.total + ' 맞힘' : '') + '</li>').join('') +
    '</ul>' + (list.length > 6 ? '<p class="hint" style="font-size:13px">최근 6개만 보여 줍니다 (전체 ' + list.length + '개)</p>' : '');
  return h;
}
function homeworkHTML(ids) {
  const today = koDate(store.now());
  let h = '<h1>숙제 현황</h1><div class="card"><p class="hint">오늘 날짜 ' + today + ' · 영어 미션은 하루에 한 번(새벽 5시에 새로 열림), 틀린 단어는 다음 날 다시 나옵니다.</p></div>';
  if (!ids.length) return h + '<div class="card"><p class="hint">아직 등록된 학생이 없습니다.</p></div>';
  // 한눈에 보기: 누가 오늘 했는지
  h += '<div class="card"><div class="hw-sum">' + ids.map(id => {
    const r = (daily[id] || {})[DAILY.id] || {}, done = r.lastDate === today;
    return '<a href="#hw-' + esc(id) + '" class="hw-pill' + (done ? ' on' : '') + '">' + esc(students[id].name) + ' · ' + (done ? '오늘 완료' : '오늘 아직') + ' · ' + Math.min(r.day || 0, DAILY.days.length) + '/' + DAILY.days.length + '</a>';
  }).join('') + '</div></div>';
  h += ids.map(id => {
    const s = students[id], r = (daily[id] || {})[DAILY.id];
    let c = '<div class="card hw" id="hw-' + esc(id) + '"><div class="stu">' + avatarSVG(s.avatar, 52) + '<div class="name">' + esc(s.name) + '</div>';
    if (!r) return c + '<span class="tag">숙제 아직 시작 전</span></div>' + visitsHTML(id) + '</div>';
    const done = r.lastDate === today;
    c += '<span class="tag' + (done ? ' on' : '') + '">' + (done ? '오늘 완료' : '오늘 아직') + '</span>' +
      '<span class="tag">' + esc(r.title || DAILY.title) + ' ' + Math.min(r.day || 0, r.days || 0) + ' / ' + (r.days || '?') + '일</span>' +
      '<span class="tag">연속 ' + (r.streak || 0) + '일</span></div>';
    // 회차별 결과
    const dates = Object.keys(r.log || {}).sort();
    c += '<h3>숙제 회차별 결과</h3>' + (dates.length ? '<div class="hw-scroll"><table class="hw-t"><tr><th>회차</th><th>날짜</th><th>맞힌 수</th><th>그날 틀린 단어</th></tr>' + dates.map((d, i) => {
      const g = r.log[d], w = g.words ? Object.keys(g.words).map(k => g.words[k]) : null;
      return '<tr><td>' + (i + 1) + '번째' + (g.day ? '<small> (' + g.day + '일째 본문)</small>' : (g.day === 0 ? '<small> (복습)</small>' : '')) + '</td><td>' + esc(d.slice(5).replace('-', '/')) + '</td><td>' + g.right + ' / ' + g.total + '</td><td>' +
        (w ? '<b>' + w.map(esc).join('</b>, <b>') + '</b>' : (g.right === g.total ? '없음 (다 맞힘)' : '<span class="hint" style="font-size:13px">' + (g.total - g.right) + '개 틀림 · 단어 기록은 이번 업데이트 뒤부터 남습니다</span>')) + '</td></tr>';
    }).join('') + '</table></div>' : '<p class="hint">아직 끝낸 숙제가 없습니다.</p>');
    // 꼭 외워야 할 단어
    const ws = Daily.words(id);
    c += '<h3>꼭 외워야 할 단어 <small>지금까지 틀린 단어 전부 · 많이 틀린 순</small></h3>' + (ws.length ? '<div class="hw-words">' + ws.map(o =>
      '<span class="hw-w' + (o.still ? ' still' : '') + '"><b>' + esc(o.w) + '</b> ' + esc(o.ko) + (o.n > 1 ? ' <i>' + o.n + '번</i>' : '') + '</span>').join('') + '</div>' +
      '<p class="hint" style="font-size:13px">분홍색 = 마지막 숙제에서도 틀려서 다음 숙제에 다시 나오는 단어</p>' : '<p class="hint">틀린 단어 없음</p>');
    c += visitsHTML(id);
    c += '<div style="margin-top:14px"><button class="plain" data-act="hwreset" data-id="' + esc(id) + '">' + (confirmDel === 'hw' + id ? '정말 처음부터 다시? (숙제·접속 기록 모두 삭제)' : '기록 지우기') + '</button></div></div>';
    return c;
  }).join('');
  return h;
}
document.head.insertAdjacentHTML('beforeend', '<style>button.nav-item{background:transparent;text-align:left;width:100%;font-size:16px;min-height:0}button.nav-item.on{background:var(--mint)}' +
  '.hw h3{font-size:15px;margin:18px 0 8px;color:var(--ink)}.hw h3 small{font-weight:400;color:var(--sub);font-size:13px;margin-left:6px}' +
  '.hw-sum{display:flex;flex-wrap:wrap;gap:8px}.hw-pill{padding:8px 14px;border-radius:999px;background:#FBEDE8;color:var(--sub);text-decoration:none;font-size:15px}.hw-pill.on{background:var(--mint);color:var(--ink);font-weight:700}' +
  '.hw-scroll{overflow-x:auto}.hw-t{border-collapse:collapse;width:100%;font-size:15px}.hw-t th{text-align:left;font-weight:500;color:var(--sub);font-size:13px;padding:6px 10px 6px 0;white-space:nowrap}' +
  '.hw-t td{padding:8px 10px 8px 0;border-top:1px solid var(--line);vertical-align:top}.hw-t td:nth-child(-n+3){white-space:nowrap}.hw-t small{color:var(--sub)}' +
  '.hw-words{display:flex;flex-wrap:wrap;gap:8px}.hw-w{background:#FBEDE8;border-radius:12px;padding:6px 12px;font-size:15px;color:var(--sub)}.hw-w b{color:var(--ink)}.hw-w.still{background:var(--pink)}.hw-w i{font-style:normal;font-weight:700;color:#9C2748}' +
  '.hw-counts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}.hw-count{background:#FBEDE8;border-radius:14px;padding:10px 12px;font-size:14px;color:var(--sub);display:flex;flex-direction:column;gap:2px}.hw-count b{font-size:20px;color:var(--ink)}.hw-count small{font-size:12px}' +
  '.hw-log{list-style:none;margin:10px 0 0;padding:0;font-size:14px}.hw-log li{padding:5px 0;border-top:1px solid var(--line)}.hw-log span{display:inline-block;min-width:118px;color:var(--sub)}</style>');

function render() {
  if (teacherHash === undefined) return;
  if (!authed) {
    const first = !teacherHash;
    const keep = document.getElementById('tpin');
    const val = keep ? keep.value : '';
    app.innerHTML = '<form class="gate" id="gate"><h1>선생님 포털</h1>' +
      '<p class="hint">' + (first ? '처음 오셨네요. 선생님 비밀번호를 정해 주세요. (숫자 6자리 이상)' : '선생님 비밀번호를 입력해 주세요.') + '</p>' +
      '<label for="tpin" class="hint">비밀번호</label><input id="tpin" type="password" inputmode="numeric" autocomplete="off">' +
      '<p class="msg" role="status">' + esc(msg) + '</p>' +
      '<button class="primary" type="submit">' + (first ? '정하고 들어가기' : '들어가기') + '</button></form>';
    document.getElementById('tpin').value = val;
    return;
  }
  const ids = Object.keys(students);
  const keepName = document.getElementById('newName');
  const nameVal = keepName ? keepName.value : '';
  app.innerHTML = '<div class="wrap"><nav aria-label="메뉴"><div class="brand">선생님 포털</div>' +
    '<button class="nav-item' + (view === 'students' ? ' on' : '') + '" data-act="view" data-v="students">학생 관리</button>' +
    '<a class="nav-item" href="stage.html' + (MOCK ? '?mock' : '') + '">수업 진행<small>큰 화면 열기</small></a>' +
    '<button class="nav-item' + (view === 'homework' ? ' on' : '') + '" data-act="view" data-v="homework">숙제 현황</button>' +
    '<div class="nav-item">문제 관리<small>준비 중</small></div></nav>' +
    '<main>' + (view === 'homework' ? homeworkHTML(ids) + '</main></div>' : '<h1>학생 관리</h1>' +
    '<div class="card"><p class="hint">학생들이 접속할 주소</p><p class="url">' + esc(studentUrl) + '</p></div>' +
    '<form class="card add" id="addForm"><label for="newName" class="hint" style="flex:1 1 100%">학생 추가 (이름 또는 별명)</label>' +
    '<input id="newName" maxlength="8" autocomplete="off"><button class="primary" type="submit">추가</button></form>' +
    '<div class="card"><h2 style="font-size:20px;margin-bottom:6px">우리 반 (' + ids.length + '명)</h2><div class="list">' +
    (ids.length ? ids.map(id => {
      const s = students[id];
      return '<div class="stu">' + avatarSVG(s.avatar, 52) + '<div class="name">' + esc(s.name) + '</div>' +
        '<span class="tag' + (presence[id] ? ' on' : '') + '">' + (presence[id] ? '접속 중' : '미접속') + '</span>' +
        '<span class="tag">비밀번호 ' + (s.pinHash ? '설정됨' : '아직 없음') + '</span>' +
        '<div class="acts">' + (s.pinHash ? '<button class="plain" data-act="reset" data-id="' + esc(id) + '">비밀번호 초기화</button>' : '') +
        '<button class="danger" data-act="del" data-id="' + esc(id) + '">' + (confirmDel === id ? '정말 삭제할까요?' : '삭제') + '</button></div></div>';
    }).join('') : '<p class="hint">아직 등록된 학생이 없습니다. 위에서 추가해 주세요.</p>') +
    '</div></div></main></div>');
  const nn = document.getElementById('newName'); if (nn) nn.value = nameVal;
}

app.addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'gate') {
    const v = document.getElementById('tpin').value.trim();
    if (!teacherHash) {
      if (!/^\d{6,}$/.test(v)) { msg = '숫자 6자리 이상으로 정해 주세요.'; render(); return; }
      const h = await hashPin('teacher', v);
      await store.set('teacher/pinHash', h); teacherHash = h; sess(h); authed = true; msg = '';
    } else {
      const h = await hashPin('teacher', v);
      if (h === teacherHash) { sess(h); authed = true; msg = ''; } else { msg = '비밀번호가 다릅니다.'; }
    }
    document.getElementById('tpin').value = '';
    render();
  } else if (e.target.id === 'addForm') {
    const input = document.getElementById('newName');
    const name = input.value.trim();
    if (!name) return;
    input.value = '';
    await store.set(BASE + '/students/' + store.newId(), { name: name, createdAt: Date.now() });
  }
});

app.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.act === 'view') { view = b.dataset.v; render(); return; }
  if (b.dataset.act === 'hwreset') {   // 숙제 기록을 지워 1일째부터 다시 (테스트용)
    if (confirmDel !== 'hw' + id) { confirmDel = 'hw' + id; render(); return; }
    confirmDel = null; await store.remove(BASE + '/daily/' + id); await store.remove(BASE + '/visits/' + id); return;
  }
  if (b.dataset.act === 'reset') { await store.remove(BASE + '/students/' + id + '/pinHash'); }
  else if (b.dataset.act === 'del') {
    if (confirmDel !== id) { confirmDel = id; render(); return; }
    confirmDel = null;
    await store.remove(BASE + '/presence/' + id);
    await store.remove(BASE + '/students/' + id);
  }
});
