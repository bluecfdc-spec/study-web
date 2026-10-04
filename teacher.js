const app = document.getElementById('app');
const store = makeStore();
let students = {}, presence = {}, daily = {}, view = 'students', teacherHash = undefined, authed = false, msg = '', confirmDel = null;
const studentUrl = location.href.replace(/teacher\.html.*$/, '');

function sess(v) { return local('sw_teacher', v); }

store.on('teacher/pinHash', v => { teacherHash = v || null; if (MOCK || (teacherHash && sess() === teacherHash)) authed = true; render(); });
store.on(BASE + '/students', v => { students = v || {}; render(); });
store.on(BASE + '/presence', v => { presence = v || {}; render(); });
store.on(BASE + '/daily', v => { daily = v || {}; render(); });

function koDate(ms) { return new Date(ms + 9 * 3600000).toISOString().slice(0, 10); }

// 숙제 현황: 학생마다 진도, 오늘 했는지, 연속 일수, 최근 결과, 다시 볼 낱말
function homeworkHTML(ids) {
  const today = koDate(store.now());
  let h = '<h1>숙제 현황</h1><div class="card"><p class="hint">오늘 날짜 ' + today + ' · 영어 미션은 하루에 한 번, 틀린 낱말은 다음 날 다시 나옵니다.</p></div>';
  h += '<div class="card"><div class="list">' + (ids.length ? ids.map(id => {
    const s = students[id], courses = daily[id] || {}, keys = Object.keys(courses);
    const head = '<div class="stu">' + avatarSVG(s.avatar, 52) + '<div class="name">' + esc(s.name) + '</div>';
    if (!keys.length) return head + '<span class="tag">아직 시작 전</span></div>';
    return keys.map(k => {
      const r = courses[k], done = r.lastDate === today, log = (r.log || {})[r.lastDate] || null;
      const words = Object.keys(r.wrong || {}).map(w => r.wrong[w]);
      return head + '<span class="tag' + (done ? ' on' : '') + '">' + (done ? '오늘 완료' : '오늘 아직') + '</span>' +
        '<span class="tag">' + esc(r.title || k) + ' ' + Math.min(r.day || 0, r.days || 0) + ' / ' + (r.days || '?') + '일</span>' +
        '<span class="tag">연속 ' + (r.streak || 0) + '일</span>' +
        (log ? '<span class="tag">최근 ' + log.right + ' / ' + log.total + ' (' + esc(r.lastDate) + ')</span>' : '') +
        '<div class="words">' + (words.length ? '다시 볼 낱말: <b>' + words.map(esc).join('</b>, <b>') + '</b>' : '틀린 낱말 없음') +
        ' <button class="plain" data-act="hwreset" data-id="' + esc(id) + '" style="margin-left:10px">' + (confirmDel === 'hw' + id ? '정말 처음부터 다시?' : '기록 지우기') + '</button></div></div>';
    }).join('');
  }).join('') : '<p class="hint">아직 등록된 학생이 없습니다.</p>') + '</div></div>';
  return h;
}
document.head.insertAdjacentHTML('beforeend', '<style>button.nav-item{background:transparent;text-align:left;width:100%;font-size:16px;min-height:0}button.nav-item.on{background:var(--mint)}.words{flex:1 1 100%;font-size:15px;color:var(--sub);padding-left:66px}.words b{color:var(--ink)}</style>');

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
    confirmDel = null; await store.remove(BASE + '/daily/' + id); return;
  }
  if (b.dataset.act === 'reset') { await store.remove(BASE + '/students/' + id + '/pinHash'); }
  else if (b.dataset.act === 'del') {
    if (confirmDel !== id) { confirmDel = id; render(); return; }
    confirmDel = null;
    await store.remove(BASE + '/presence/' + id);
    await store.remove(BASE + '/students/' + id);
  }
});
