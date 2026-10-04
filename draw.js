// 수업 화면 필기: 펜(칠판처럼 남음) · 레이저 포인터(잔상이 남았다 사라짐) · 지우개
// 큰 화면(아이패드 → 모니터)에만 그려집니다. 강의 쪽이나 문제가 바뀌면 자동으로 지워집니다.
(function () {
  const COLORS = ['#E5484D', '#3B6FE0', '#4A3B47'];   // 빨강, 파랑, 진한 색
  let tool = 'off', colorI = 0, drawing = false, last = null, moved = 0, downAt = null;
  let trail = [];   // 레이저 점들 {x, y, t, gap}

  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.dr-c{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:20;pointer-events:none;touch-action:none}' +
    '.dr-on .dr-c.ink{pointer-events:auto}' +
    '.dr-bar{position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:21;display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.82);border-radius:999px;padding:8px 6px;box-shadow:0 1px 6px rgba(74,59,71,.16)}' +
    '.dr-b{width:44px;height:44px;padding:0;border:3px solid transparent;border-radius:50%;background:transparent;color:#8E7783;display:flex;align-items:center;justify-content:center;cursor:pointer}' +
    '.dr-b svg{width:24px;height:24px}.dr-b.on{background:#FFE39A;border-color:#4A3B47;color:#4A3B47}' +
    '.dr-dot{width:14px;height:14px;border-radius:50%;border:2px solid #fff;position:absolute;right:4px;bottom:4px}.dr-b{position:relative}</style>');

  const ink = document.createElement('canvas'), las = document.createElement('canvas');
  ink.className = 'dr-c ink'; las.className = 'dr-c';
  document.body.appendChild(ink); document.body.appendChild(las);
  const ictx = ink.getContext('2d'), lctx = las.getContext('2d');

  function size() {
    const r = window.devicePixelRatio || 1, w = window.innerWidth, h = window.innerHeight;
    [ink, las].forEach(c => { c.width = Math.round(w * r); c.height = Math.round(h * r); c.getContext('2d').setTransform(r, 0, 0, r, 0, 0); });
  }
  size();
  window.addEventListener('resize', size);   // 화면을 돌리면 필기는 지워집니다
  function clearInk() { ictx.clearRect(0, 0, window.innerWidth, window.innerHeight); }

  const S = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ICON = {
    off: S('<path d="M9 11V5.5a1.5 1.5 0 013 0V11m0-1.5a1.5 1.5 0 013 0V12m0-1a1.5 1.5 0 013 0v4.5a6 6 0 01-6 6h-1a6 6 0 01-5-2.7L5 14.5a1.6 1.6 0 012.6-1.8L9 14.5"/>'),
    pen: S('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>'),
    laser: S('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    erase: S('<path d="M8 19l-4.5-4.5a1.5 1.5 0 010-2.1L12 4a1.5 1.5 0 012.1 0l5.4 5.4a1.5 1.5 0 010 2.1L12 19H8z"/><path d="M8.5 7.5l7 7M12 19h8"/>'),
    clear: S('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>')
  };
  const NAME = { off: '터치 (필기 끄기)', pen: '펜 (한 번 더 누르면 색 바꾸기)', laser: '레이저 포인터', erase: '지우개', clear: '전부 지우기' };
  const bar = document.createElement('div');
  bar.className = 'dr-bar';
  document.body.appendChild(bar);
  function drawBar() {
    bar.innerHTML = ['off', 'pen', 'laser', 'erase', 'clear'].map(t =>
      '<button type="button" class="dr-b' + (tool === t ? ' on' : '') + '" data-t="' + t + '" aria-label="' + NAME[t] + '" title="' + NAME[t] + '">' + ICON[t] +
      (t === 'pen' ? '<span class="dr-dot" style="background:' + COLORS[colorI] + '"></span>' : '') + '</button>').join('');
    document.body.classList.toggle('dr-on', tool !== 'off');
    ink.style.cursor = tool === 'off' ? '' : 'crosshair';
  }
  bar.addEventListener('click', e => {
    const b = e.target.closest('.dr-b'); if (!b) return;
    const t = b.dataset.t;
    if (t === 'clear') { clearInk(); trail = []; return; }
    if (t === 'pen' && tool === 'pen') colorI = (colorI + 1) % COLORS.length;
    tool = t; drawBar();
  });
  drawBar();

  function seg(a, b) {
    if (tool === 'pen' || tool === 'erase') {
      ictx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over';
      ictx.strokeStyle = COLORS[colorI]; ictx.lineWidth = tool === 'erase' ? 36 : 5;
      ictx.lineCap = 'round'; ictx.lineJoin = 'round';
      ictx.beginPath(); ictx.moveTo(a.x, a.y); ictx.lineTo(b.x, b.y); ictx.stroke();
    }
  }
  function point(e, gap) {
    const p = { x: e.clientX, y: e.clientY };
    if (tool === 'laser') trail.push({ x: p.x, y: p.y, t: performance.now(), gap: gap });
    else if (last) seg(last, p); else seg(p, p);
    if (last) moved += Math.abs(p.x - last.x) + Math.abs(p.y - last.y);
    last = p;
  }
  ink.addEventListener('pointerdown', e => {
    if (tool === 'off') return;
    e.preventDefault();
    drawing = true; last = null; moved = 0; downAt = { x: e.clientX, y: e.clientY, type: e.pointerType };
    try { ink.setPointerCapture(e.pointerId); } catch (err) { }
    point(e, true);
  });
  ink.addEventListener('pointermove', e => {
    if (!drawing) return;
    e.preventDefault();
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    (list.length ? list : [e]).forEach(x => point(x, false));
  });
  function up(e) {
    if (!drawing) return;
    drawing = false; last = null;
    // 손가락으로 '톡' 누른 것(움직임 없음)은 필기가 아니라 아래 버튼 누르기로 넘깁니다 — 펜을 든 채 '다음'을 누를 수 있게
    if (downAt && downAt.type === 'touch' && moved < 8) {
      ink.style.pointerEvents = 'none';
      const el = document.elementFromPoint(downAt.x, downAt.y);
      ink.style.pointerEvents = '';
      const btn = el && el.closest && el.closest('button,a');
      if (btn) btn.click();
    }
  }
  ink.addEventListener('pointerup', up);
  ink.addEventListener('pointercancel', () => { drawing = false; last = null; });

  // 레이저: 지나간 자리가 1.2초 동안 빛나다가 사라집니다
  const LIFE = 1200;
  function frame() {
    const now = performance.now();
    lctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    trail = trail.filter(p => now - p.t < LIFE);
    if (trail.length) {
      lctx.lineCap = 'round'; lctx.lineJoin = 'round';
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1], b = trail[i];
        if (b.gap) continue;
        const k = 1 - (now - b.t) / LIFE;
        lctx.strokeStyle = 'rgba(255,70,90,' + (0.35 * k) + ')'; lctx.lineWidth = 16 * k + 4;
        lctx.beginPath(); lctx.moveTo(a.x, a.y); lctx.lineTo(b.x, b.y); lctx.stroke();
        lctx.strokeStyle = 'rgba(255,40,70,' + (0.95 * k) + ')'; lctx.lineWidth = 5 * k + 1.5;
        lctx.beginPath(); lctx.moveTo(a.x, a.y); lctx.lineTo(b.x, b.y); lctx.stroke();
      }
      if (drawing && tool === 'laser') {   // 지금 가리키는 점
        const h = trail[trail.length - 1];
        lctx.fillStyle = 'rgba(255,70,90,.35)'; lctx.beginPath(); lctx.arc(h.x, h.y, 13, 0, 7); lctx.fill();
        lctx.fillStyle = '#FF2846'; lctx.beginPath(); lctx.arc(h.x, h.y, 5, 0, 7); lctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // 강의 쪽이나 퀴즈 문제가 바뀌면 필기를 지웁니다 (같은 쪽 안에서 한 단계씩 여는 동안은 그대로)
  let key = '';
  setInterval(() => {
    let k = '';
    try { k = live ? [live.mode, live.lessonId, live.page, live.sessionId, live.q].join('/') : ''; } catch (e) { }
    if (k !== key) { key = k; clearInk(); trail = []; }
  }, 300);
})();
