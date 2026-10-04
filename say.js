// 영어 미션 문제(빈칸을 아직 안 채운 화면)에서도 문장을 읽어 주는 스피커.
// 빈칸 자리에서는 낱말 대신 '삐—' 소리(약 1초)를 냅니다. 정답은 말하지 않아요.
(function () {
  const app = document.getElementById('app');
  if (!app) return;
  const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9a4.5 4.5 0 010 6"/></svg>';
  let ctx = null, run = 0;

  // 삐 소리는 소리 파일처럼 재생합니다. 아이폰·아이패드는 영어를 읽어 준 직후에 브라우저가 직접 만드는 소리를 막는 일이 있어서요.
  let toneA = null;
  function toneEl() {
    if (toneA) return toneA;
    const sr = 22050, n = sr, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const str = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {   // 660Hz, 1초, 처음과 끝은 부드럽게
      const env = Math.min(1, i / (sr * 0.04), (n - i) / (sr * 0.15));
      v.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * 660 * i / sr) * 0.4 * env * 32767), true);
    }
    toneA = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
    return toneA;
  }
  function prime() {   // 버튼을 누른 순간 소리 없이 한 번 틀어 두어야 나중에 저절로 재생할 수 있습니다
    try {
      const a = toneEl(); a.muted = true;
      const p = a.play();
      if (p && p.then) p.then(() => { if (a.muted) { a.pause(); a.currentTime = 0; } }).catch(() => { });
    } catch (e) { }
  }
  function synthBeep() {
    try {
      if (ctx.state !== 'running') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'sine'; o.frequency.value = 660;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.05);
      g.gain.setValueAtTime(0.35, t + 0.85);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.05);
    } catch (e) { }
  }
  function beep(done) {
    try {
      const a = toneEl(); a.muted = false; a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(synthBeep);
    } catch (e) { synthBeep(); }
    setTimeout(done, 1100);
  }
  function speak(text, done) {
    text = text.replace(/\s+/g, ' ').trim();
    if (!text || !/[A-Za-z0-9]/.test(text) || !window.speechSynthesis) { done(); return; }
    let ended = false;
    const fin = () => { if (!ended) { ended = true; done(); } };
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.85;
      const v = speechSynthesis.getVoices().filter(x => /^en[-_]US/i.test(x.lang))[0];
      if (v) u.voice = v;
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
      setTimeout(fin, 1500 + text.length * 120);   // 끝났다는 신호가 안 오는 기기를 위한 안전장치
    } catch (e) { fin(); }
  }
  function play(before, after, plain) {   // plain: 삐 소리 없이 이어서 읽기
    const my = ++run;
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!ctx && C) ctx = new C();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      if (window.speechSynthesis) speechSynthesis.cancel();
    } catch (e) { }
    if (!plain) prime();
    if (plain) { speak(before + ' ' + (after || ''), () => { }); return; }
    speak(before, () => { if (my !== run) return; beep(() => { if (my !== run) return; speak(after, () => { }); }); });
  }

  function add() {
    const blank = app.querySelector('.d-en .d-blank:not(.ok):not(.no)'), tags = app.querySelector('.d-tags');
    if (!blank || !tags || tags.querySelector('[data-sayq]')) return;
    let before = '', after = '', seen = false;
    blank.parentNode.childNodes.forEach(n => { if (n === blank) seen = true; else if (seen) after += n.textContent; else before += n.textContent; });
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'w-say'; b.setAttribute('aria-label', '문장 듣기');
    b.dataset.sayq = '1'; b.dataset.a = before; b.dataset.b = after; b.innerHTML = SPK;
    tags.appendChild(b);
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-sayq]'); if (b) play(b.dataset.a, b.dataset.b); });
  // 스피커를 누르면 소리가 나오기 전에도 바로 눌린 티가 나게: 통 튀면서 노랗게 번지는 물결
  document.head.insertAdjacentHTML('beforeend', '<style>@keyframes sayPop{0%{transform:scale(1)}25%{transform:scale(.8)}60%{transform:scale(1.15)}100%{transform:scale(1)}}@keyframes sayRing{0%{box-shadow:0 0 0 0 rgba(242,178,76,.75)}100%{box-shadow:0 0 0 16px rgba(242,178,76,0)}}' +
    '.say-on{animation:sayPop .38s ease-out,sayRing .7s ease-out 2;background:#FFE39A !important;color:#4A3B47 !important}</style>');
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.w-say,.en-say');
    if (!b) return;
    b.classList.remove('say-on'); void b.offsetWidth; b.classList.add('say-on');
    clearTimeout(b._sayT); b._sayT = setTimeout(() => b.classList.remove('say-on'), 1500);
  });
  window.SayQ = { play: play };   // 수업 화면의 영어 시험에서도 같은 읽기를 씁니다
  new MutationObserver(add).observe(app, { childList: true, subtree: true });
  add();
})();
