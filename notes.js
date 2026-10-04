// 학생 화면 덧붙임: 미션 도장판(Stamps), 대기실 버튼들, 수업 문제 다시 풀기(Notes)
document.head.insertAdjacentHTML('beforeend', '<style>' +
  '.st-board{background:#fff;border-radius:26px;padding:14px 12px}' +
  '.st-title{display:flex;justify-content:space-between;font-size:16px;color:var(--sub);padding:0 6px 8px}' +
  '.st-row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}' +
  '.st-cell{aspect-ratio:1/1.25;border-radius:14px;background:#FBEDE8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font-size:13px;color:var(--sub)}' +
  '.st-cell.done{background:var(--pink)}.st-cell.now{background:var(--yellow);box-shadow:inset 0 0 0 3px var(--ink);color:var(--ink)}' +
  '.st-cell svg{width:78%;height:auto}.st-num{font-size:19px}' +
  '.n-btn{background:var(--pink);border-radius:26px;width:100%;display:flex;flex-direction:column;align-items:center;gap:2px}' +
  '.d-card,.n-btn{min-height:86px;justify-content:flex-start;padding:14px 18px;font-size:22px}.d-card small,.n-btn small{font-size:14px;color:var(--sub)}' +
  '.n-btn.vocab{background:var(--mint)}.n-btn.rev{background:var(--blue)}' +
  '.lb-friends{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 6px;background:#fff;border-radius:22px;padding:10px 8px}' +
  '.lb-f{display:flex;align-items:center;gap:6px;font-size:14px;min-width:0}.lb-f svg{flex:none;width:38px;height:38px}.lb-f>div{min-width:0}' +
  '.lb-f>div>div:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lb-f.off{opacity:.45}.lb-s{font-size:11px;line-height:1.25;color:var(--ok)}.lb-f.off .lb-s{color:var(--sub)}' +
  '.n-item{background:#fff;border-radius:24px;padding:16px 18px;font-size:19px;text-align:left;width:100%;display:flex;flex-direction:column;gap:4px}' +
  '.n-item small{font-size:15px;color:var(--sub)}.n-item:disabled{opacity:.6;cursor:default}' +
  '.choice.right{border-color:var(--ink)}.choice.miss{background:#FBEDE8;text-decoration:line-through}.choice.fade{opacity:.4}' +
  '.oxrow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px 6px;justify-items:center}' +
  '.oxcell{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:14px;color:var(--sub)}' +
  '.oxm{display:inline-flex;width:38px;height:38px;border-radius:50%;align-items:center;justify-content:center;font-size:20px}' +
  '.oxm.o{background:var(--mint);color:#1F5C45}.oxm.x{background:var(--pink);color:#9C2748}.oxm.n{background:#F1E2DE;color:var(--sub)}</style>');

function oxMark(v) { return v == null ? '<span class="oxm n">-</span>' : (v ? '<span class="oxm o">O</span>' : '<span class="oxm x">X</span>'); }
// 내 답을 번호와 함께 O X 로 보여 줍니다
function oxRow(rec, set, sid) {
  return '<div class="oxrow">' + set.items.map((it, i) => {
    const a = answerOf(rec, i, sid);
    return '<div class="oxcell">' + (i + 1) + oxMark(a == null ? null : a === it.a) + '</div>';
  }).join('') + '</div>';
}

// ----- 미션 도장판: 하루 미션을 끝낼 때마다 토끼 도장이 하나씩 찍힙니다 -----
const Stamps = (function () {
  const bunny = '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="17" cy="12" rx="5" ry="11" fill="#fff"/><ellipse cx="31" cy="12" rx="5" ry="11" fill="#fff"/>' +
    '<ellipse cx="17" cy="13" rx="2.2" ry="7" fill="#F29BB5"/><ellipse cx="31" cy="13" rx="2.2" ry="7" fill="#F29BB5"/>' +
    '<circle cx="24" cy="30" r="14" fill="#fff"/><circle cx="19" cy="28" r="1.8" fill="#4A3B47"/><circle cx="29" cy="28" r="1.8" fill="#4A3B47"/>' +
    '<circle cx="15.5" cy="33" r="2.4" fill="#FFC2C2"/><circle cx="32.5" cy="33" r="2.4" fill="#FFC2C2"/>' +
    '<path d="M21.5 33q2.5 2.5 5 0" stroke="#4A3B47" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>';
  return {
    html: function (sid, daily) {
      const total = DAILY.days.length, r = ((daily || {})[sid] || {})[DAILY.id] || {};
      const done = Math.min(r.day || 0, total), today = Daily.doneToday(sid);
      let cells = '';
      for (let i = 0; i < total; i++) {
        if (i < done) cells += '<div class="st-cell done">' + bunny + (i + 1) + '일</div>';
        else if (i === done && !today) cells += '<div class="st-cell now"><span class="st-num">' + (i + 1) + '</span>오늘</div>';
        else cells += '<div class="st-cell"><span class="st-num">' + (i + 1) + '</span>일</div>';
      }
      return '<div class="st-board"><div class="st-title"><span>영어 미션 도장판</span><span>' + done + ' / ' + total + '</span></div><div class="st-row">' + cells + '</div></div>';
    }
  };
})();

// ----- 오답노트: 선생님과 푼 퀴즈마다, 내가 틀린 문제를 계속 다시 풀 수 있습니다 (지워지지 않음) -----
const Notes = (function () {
  let store = null, sessions = {}, daily = {}, run = null;   // run: 지금 다시 푸는 중인 묶음

  function mine(sid) {
    return Object.keys(sessions).map(id => {
      const rec = sessions[id], set = SETS[rec.setId];
      if (!set) return null;
      const reached = Math.min(rec.q == null ? set.items.length - 1 : rec.q, set.items.length - 1);
      let joined = false; const wrong = [];
      for (let i = 0; i <= reached; i++) {
        const a = answerOf(rec, i, sid);
        if (a != null) joined = true;
        if (a !== set.items[i].a) wrong.push(i);
      }
      return joined ? { id: id, rec: rec, set: set, wrong: wrong, at: rec.startedAt || 0 } : null;
    }).filter(Boolean).sort((a, b) => b.at - a.at);
  }
  function dayText(ms) { const d = new Date(ms + 9 * 3600000); return (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일'; }

  return {
    init: function (st, onChange) {
      store = st;
      store.on(BASE + '/sessions', v => { sessions = v || {}; onChange(); });
      store.on(BASE + '/daily', v => { daily = v || {}; onChange(); });
    },
    stamps: function (sid) { return Stamps.html(sid, daily); },
    // 대기실 버튼 세 개: 영어 단어장, 틀린 단어 복습, 수업 문제 다시 풀기 (그림은 여기서 직접 넣습니다)
    lobbyButton: function (sid) {
      const eng = Daily.missed(sid).length, cls = mine(sid).reduce((k, s) => k + s.wrong.length, 0);
      const btn = (kind, act, pic, title, sub) => '<button class="n-btn art-on ' + kind + '" data-act="' + act + '"><img class="art" src="assets/' + pic + '.webp" alt="" draggable="false">' +
        '<span class="btn-t">' + title + '<small>' + sub + '</small></span></button>';
      return btn('vocab', 'd-vocab', 'cream_book', '영어 단어장', eng ? '내가 틀린 낱말 ' + eng + '개 한눈에 보기' : '틀린 낱말이 생기면 여기에 모여요') +
        btn('rev', 'd-review', 'obj_pencil', '틀린 영어 단어 복습', eng ? eng + '개 다시 풀기' : '아직 복습할 낱말이 없어요') +
        btn('', 'n-list', 'icon_korean', '수업 문제 다시 풀기', cls ? '수업에서 틀린 문제 ' + cls + '개' : '수업에서 푼 문제가 여기에 모여요');
    },
    html: function (sid) {
      if (!run) {
        const list = mine(sid);
        return '<h1>수업 문제 다시 풀기</h1><p class="sub">선생님과 푼 퀴즈에서 틀린 문제예요</p>' +
          (list.length ? list.map(s => '<button class="n-item" data-act="n-open" data-id="' + esc(s.id) + '"' + (s.wrong.length ? '' : ' disabled') + '>' +
            esc(s.set.subject) + ' · ' + esc(s.set.unit) + '<small>' + dayText(s.at) + ' · ' + (s.wrong.length ? '틀린 문제 ' + s.wrong.length + '개' : '다 맞혔어요!') + '</small></button>').join('')
            : '<div class="card"><p class="sub">아직 선생님과 푼 퀴즈가 없어요.</p></div>') +
          '<button class="big" data-act="n-exit" style="margin-top:auto">대기실로</button>';
      }
      const set = run.set, total = run.list.length;
      if (run.i >= total) {
        return '<h1>한 바퀴 끝!</h1><div class="card"><p class="sub">이번에 맞힌 문제</p><p class="bignum">' + run.right + ' / ' + total + '</p></div>' +
          '<p class="sub">이 문제들은 여기에 계속 남아 있어요</p>' +
          '<button class="big" data-act="n-again" style="margin-top:auto">한 번 더 풀기</button><button class="ghost" data-act="n-list">목록으로</button>';
      }
      const it = set.items[run.list[run.i]], ch = choicesOf(set, it), done = run.picked != null;
      return '<div class="row" style="align-items:center"><div class="chip">다시 풀기 · ' + esc(set.unit) + '</div><div class="sub">' + (run.i + 1) + ' / ' + total + '</div></div>' +
        '<div class="card"><p class="qtext">' + markQ(it.q) + '</p><p class="sub" style="margin-top:10px">' + esc(it.ask || set.ask) + '</p></div>' +
        '<div class="choices">' + ch.map((c, i) => '<button class="choice' + (done ? (i === it.a ? ' right' : (i === run.picked ? ' miss' : ' fade')) : '') + '" data-act="n-pick" data-i="' + i + '"' + (done ? ' disabled' : '') + '>' + esc(c) + '</button>').join('') + '</div>' +
        (done ? '<p class="why">' + (run.picked === it.a ? '정답이에요! ' : '') + esc(it.why) + '</p><button class="big" data-act="n-next" style="margin-top:auto">다음</button>'
          : '<p class="sub">하나를 골라 눌러요</p><button class="ghost" data-act="n-list" style="margin-top:auto">목록으로</button>');
    },
    click: async function (act, b, sid) {
      if (act === 'n-exit') { run = null; return 'lobby'; }
      if (act === 'n-list') { run = null; return 'notes'; }
      if (act === 'n-open') {
        const s = mine(sid).filter(x => x.id === b.dataset.id)[0];
        if (s && s.wrong.length) { run = { set: s.set, list: s.wrong.slice(), i: 0, right: 0, picked: null }; Daily.logAct(sid, 'retry'); }
      } else if (act === 'n-pick' && run && run.picked == null) {
        run.picked = Number(b.dataset.i);
        if (run.picked === run.set.items[run.list[run.i]].a) { run.right++; Sound.good(); } else Sound.soft();
      } else if (act === 'n-next' && run) { run.i++; run.picked = null; }
      else if (act === 'n-again' && run) { run.i = 0; run.right = 0; run.picked = null; }
      return 'notes';
    }
  };
})();
