// 수학 공식 설명 페이지: 선생님이 record.html 에서 녹음한 목소리를 장면마다 재생합니다.
// 말이 끝날 때까지 '다음' 버튼을 잠그고, 아래에 진행 막대를 보여 줍니다.
// 기록 위치: classes/gusan1/voice/{k}/{장면 번호} = { d: 'data:audio/...;base64,...', mime, ms, t }
(function () {
  if (typeof VID === 'undefined' || typeof makeStore !== 'function') return;
  if (new URLSearchParams(location.search).has('rec')) return;   // 녹음용 화면에서는 재생 안 함
  const store = makeStore();
  const clips = {}, lens = {};   // 장면 번호 → Audio, 녹음 길이(ms)
  let cur = null, ready = false, nextText = '', guard = null;
  const $ = id => document.getElementById(id);
  const bar = document.querySelector('.bar'), next = $('next');
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '#vprog{height:8px;border-radius:999px;background:#F1E2DE;overflow:hidden;visibility:hidden;flex:none;margin-top:4px}#vprog.on{visibility:visible}' +
    '#vprog i{display:block;height:100%;width:0;background:var(--mint);border-radius:999px;transition:width .25s linear}' +
    '#next.wait{background:#E8D6D9;color:var(--sub)}</style>');
  const prog = document.createElement('div'); prog.id = 'vprog'; prog.innerHTML = '<i></i>';
  bar.parentNode.insertBefore(prog, bar);
  const fill = prog.firstChild;
  const btn = document.createElement('button'); btn.id = 'say'; btn.type = 'button'; btn.textContent = '🔊'; btn.title = '다시 듣기';
  bar.insertBefore(btn, next);
  const quizOn = () => { const q = $('quiz'); return q && q.classList.contains('on'); };

  function lock() { if (!next.classList.contains('wait')) { nextText = next.textContent; next.textContent = '듣는 중…'; next.classList.add('wait'); } next.disabled = true; prog.classList.add('on'); }
  function unlock() {
    if (next.classList.contains('wait')) { next.classList.remove('wait'); if (nextText) next.textContent = nextText; }
    if (!quizOn()) next.disabled = false;
    setTimeout(() => { if (!cur) { prog.classList.remove('on'); fill.style.width = '0'; } }, 400);
  }
  function stop() { clearTimeout(guard); if (cur) { const a = cur; cur = null; try { a.pause(); a.currentTime = 0; } catch (e) { } } unlock(); }
  function play(n) {
    stop();
    const a = clips[n]; if (!a) { btn.classList.remove('on'); prog.classList.remove('on'); fill.style.width = '0'; return; }   // 녹음 없는 장면: 막대 없이 바로 다음
    btn.classList.add('on'); cur = a; fill.style.width = '0';
    const p = a.play(); if (p && p.catch) p.catch(() => { if (cur === a) { cur = null; unlock(); } });   // 자동 재생이 막히면 🔊 버튼으로
  }
  const len = a => { for (const n in clips) if (clips[n] === a) { const d = lens[n] ? lens[n] / 1000 : 0; return (isFinite(a.duration) && a.duration > 0) ? a.duration : d; } return 0; };
  function wire(a) {
    a.addEventListener('playing', () => { if (cur === a) { lock(); clearTimeout(guard); const d = len(a); if (d) guard = setTimeout(() => { if (cur === a) { cur = null; unlock(); } }, d * 1000 + 1500); } });   // 끝 신호가 안 와도 길이만큼 지나면 풀어 줌
    a.addEventListener('timeupdate', () => { const d = len(a); if (cur === a && d) fill.style.width = Math.min(100, a.currentTime / d * 100) + '%'; });
    a.addEventListener('ended', () => { if (cur === a) { clearTimeout(guard); fill.style.width = '100%'; cur = null; unlock(); } });
    a.addEventListener('error', () => { if (cur === a) { cur = null; unlock(); } });
  }
  btn.addEventListener('click', () => play(VID.cur()));
  $('prev').addEventListener('click', () => stop(), true);
  $('home').addEventListener('click', () => stop(), true);
  const prev = VID.onChange;
  VID.onChange = n => { if (prev) prev(n); if (ready) play(n); };

  store.get(BASE + '/voice/' + VID.k).then(v => {
    if (v) Object.keys(v).forEach(n => { if (v[n] && v[n].d) { const a = new Audio(v[n].d); a.preload = 'auto'; wire(a); clips[n] = a; lens[n] = v[n].ms || 0; } });
    ready = true;
    play(VID.cur());
  }).catch(() => { ready = true; });
})();
