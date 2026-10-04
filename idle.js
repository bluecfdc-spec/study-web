// 수업(문제 풀이)을 켜 둔 채 잊어도 아이들이 갇히지 않게 합니다.
// 수업 화면: 선생님이 화면을 만질 때마다 '살아 있음' 시각(live.beat)을 남기고, 10분 동안 아무 조작이 없으면 수업을 자동으로 끝냅니다.
// 학생 폰: 그 시각이 5분 넘게 그대로면 '대기실로 나가기' 버튼이 나타납니다. 선생님이 다시 진행하면 수업으로 돌아옵니다.
(function () {
  const app = document.getElementById('app');
  const END_MS = 10 * 60000, OUT_MS = 5 * 60000;
  const inQuiz = () => { try { return !!(live && SETS[live.setId]); } catch (e) { return false; } };

  // ----- 수업 화면 -----
  if (typeof saveSession === 'function') {
    let last = Date.now(), beatAt = 0, ending = false;
    const touch = () => {
      last = Date.now();
      if (inQuiz() && last - beatAt > 30000) { beatAt = last; try { store.update(BASE + '/live', { beat: store.now() }); } catch (e) { } }
    };
    ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, touch, { passive: true }));
    setInterval(async () => {
      if (ending || !inQuiz() || Date.now() - last < END_MS) return;
      ending = true;
      try { await saveSession(); await store.remove(BASE + '/live'); } catch (e) { }
      ending = false; last = Date.now();
    }, 15000);
    return;
  }

  // ----- 학생 폰 -----
  if (typeof me === 'undefined' || typeof sync !== 'function') return;
  let left = '';   // 내가 나온 수업의 상태. 수업이 다시 움직이면(상태가 달라지면) 수업으로 돌아갑니다
  const keyOf = () => live ? [live.sessionId, live.q, live.phase, live.beat || 0].join('/') : '';
  const stale = () => inQuiz() && store.now() - (live.beat || live.startedAt || 0) > OUT_MS;
  const sync0 = sync;
  window.sync = function () {
    if (left && left === keyOf()) { if (me && screen === 'quiz') screen = 'lobby'; return; }
    left = '';
    sync0();
  };
  function put() {
    if (screen !== 'quiz' || !stale() || document.getElementById('idleOut')) return;
    app.insertAdjacentHTML('beforeend', '<button class="ghost" id="idleOut" type="button" style="height:auto;min-height:44px;line-height:1.4">선생님이 자리를 비운 것 같아요 · 대기실로 나가기</button>');
  }
  new MutationObserver(put).observe(app, { childList: true });
  setInterval(put, 5000);
  document.addEventListener('click', e => {
    if (!(e.target.closest && e.target.closest('#idleOut'))) return;
    Sound.tap(); left = keyOf(); sync(); render();
  });
})();
