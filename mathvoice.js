// 수학 공식 설명 페이지: 선생님이 record.html 에서 녹음한 목소리를 장면마다 재생합니다.
// 기록 위치: classes/gusan1/voice/{k}/{장면 번호} = { d: 'data:audio/...;base64,...', mime, ms, t }
(function () {
  if (typeof VID === 'undefined' || typeof makeStore !== 'function') return;
  if (new URLSearchParams(location.search).has('rec')) return;   // 녹음용 화면에서는 재생 안 함
  const store = makeStore();
  const clips = {};          // 장면 번호 → Audio
  let cur = null, ready = false;
  const bar = document.querySelector('.bar');
  const btn = document.createElement('button'); btn.id = 'say'; btn.type = 'button'; btn.textContent = '🔊'; btn.title = '다시 듣기';
  bar.insertBefore(btn, document.getElementById('next'));

  function stop() { if (cur) { try { cur.pause(); cur.currentTime = 0; } catch (e) { } cur = null; } }
  function play(n) {
    stop();
    const a = clips[n]; if (!a) { btn.classList.remove('on'); return; }
    btn.classList.add('on'); cur = a;
    const p = a.play(); if (p && p.catch) p.catch(() => { });   // 자동 재생이 막히면 🔊 버튼으로
  }
  btn.addEventListener('click', () => play(VID.cur()));
  const prev = VID.onChange;
  VID.onChange = n => { if (prev) prev(n); if (ready) play(n); };

  store.get(BASE + '/voice/' + VID.k).then(v => {
    if (v) Object.keys(v).forEach(n => { if (v[n] && v[n].d) { const a = new Audio(v[n].d); a.preload = 'auto'; clips[n] = a; } });
    ready = true;
    play(VID.cur());
  }).catch(() => { ready = true; });
})();
