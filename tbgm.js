// 선생님 포털 배경음악: 학생·수업 화면과 같은 곡, 같은 켜고 끄기 설정(오른쪽 위 작은 스피커)
(function () {
  let audio = null, unlocked = false, off = local('sw_bgm') === 'off';
  document.head.insertAdjacentHTML('beforeend', '<style>#bgmBtn{position:fixed;top:8px;right:8px;z-index:5;width:34px;height:34px;min-height:0;padding:0;border-radius:50%;border:none;background:rgba(255,255,255,.7);color:#B79AA6;display:flex;align-items:center;justify-content:center;cursor:pointer}#bgmBtn.off{color:#D3C3C9}#bgmBtn svg{width:18px;height:18px}</style>');
  const btn = document.createElement('button');
  btn.id = 'bgmBtn'; btn.type = 'button'; document.body.appendChild(btn);
  function label() {
    btn.className = off ? 'off' : '';
    btn.setAttribute('aria-label', off ? '음악 켜기' : '음악 끄기');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>' +
      (off ? '<path d="M17 9.5l4.5 5M21.5 9.5l-4.5 5"/>' : '<path d="M16.5 9a4.5 4.5 0 010 6M19 6.5a8 8 0 010 11"/>') + '</svg>';
  }
  function sync() {
    label();
    if (!unlocked) return;
    if (!off) {
      if (!audio) {
        audio = new Audio('assets/bgm_home.mp3'); audio.loop = true; audio.volume = 0.3;
        const at = Number(local('sw_bgm_t')) || 0;   // 다른 화면에서 듣던 자리부터 이어서
        if (at > 0) audio.addEventListener('loadedmetadata', () => { try { if (at < audio.duration) audio.currentTime = at; } catch (e) { } }, { once: true });
        setInterval(() => { if (audio && !audio.paused) local('sw_bgm_t', String(audio.currentTime)); }, 2000);
      }
      audio.play().catch(() => { });
    } else if (audio) audio.pause();
  }
  btn.addEventListener('click', () => { off = !off; local('sw_bgm', off ? 'off' : 'on'); unlocked = true; sync(); });
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (!unlocked) { unlocked = true; sync(); } }, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden && audio) audio.pause(); else sync(); });
  window.addEventListener('pagehide', () => { if (audio && !audio.paused) local('sw_bgm_t', String(audio.currentTime)); });
  sync();
})();
