// 영어 미션 문제(빈칸을 아직 안 채운 화면)에서도 문장을 읽어 주는 스피커.
// 빈칸 자리에서는 낱말 대신 부드러운 '삐—' 소리(시 음, 약 0.4초)를 냅니다. 정답은 말하지 않아요.
(function () {
  const app = document.getElementById('app');
  if (!app) return;
  const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9a4.5 4.5 0 010 6"/></svg>';
  let ctx = null, run = 0;

  function beep(done) {
    try {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'sine'; o.frequency.value = 493.88;   // 시(B4)
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.05);
      g.gain.setValueAtTime(0.1, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.45);
    } catch (e) { }
    setTimeout(done, 520);
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
  window.SayQ = { play: play };   // 수업 화면의 영어 시험에서도 같은 읽기를 씁니다
  new MutationObserver(add).observe(app, { childList: true, subtree: true });
  add();
})();
