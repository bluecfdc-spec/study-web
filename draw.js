// 수업 화면 필기: 펜(칠판처럼 남음) · 레이저 포인터(잔상이 남았다 사라짐) · 지우개
// 큰 화면(아이패드 → 모니터)에만 그려집니다. 강의 쪽이나 문제가 바뀌면 자동으로 지워집니다.
(function () {
  const COLORS = ['#E5484D', '#3B6FE0', '#4A3B47', '#2E9E6B', '#F08A24'];   // 빨강, 파랑, 진한 색, 초록, 주황
  const ERASE = [8, 22, 46];   // 지우개 굵기: 펜촉만큼 · 중간 · 엄지손톱만큼
  let eraseI = 1, pop = null, held = false, holdT = null;
  let tool = 'off', colorI = 0, drawing = false, last = null, moved = 0, downAt = null;
  let trail = [];   // 레이저 점들 {x, y, t, gap}
  let folded = local('sw_draw_fold') === '1', pos = null;   // 도구 막대: 접기, 옮긴 자리
  try { pos = JSON.parse(local('sw_draw_pos') || 'null'); } catch (e) { }

  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.dr-c{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:20;pointer-events:none;touch-action:none}' +
    '.dr-on .dr-c.ink{pointer-events:auto}' +
    '.dr-bar{position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:21;display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.82);border-radius:999px;padding:8px 6px;box-shadow:0 1px 6px rgba(74,59,71,.16);-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}' +
    '.dr-b{width:44px;height:44px;padding:0;border:3px solid transparent;border-radius:50%;background:transparent;color:#8E7783;display:flex;align-items:center;justify-content:center;cursor:pointer}' +
    '.dr-b svg{width:24px;height:24px}.dr-b.on{background:#FFE39A;border-color:#4A3B47;color:#4A3B47}' +
    '.dr-grip{cursor:grab;touch-action:none;height:26px;color:#C9BCC2}.dr-grip svg{width:20px;height:20px}.dr-fold{height:30px}.dr-fold svg{width:18px;height:18px}' +
    '.dr-pop{position:fixed;z-index:22;display:flex;gap:8px;align-items:center;background:#fff;border-radius:999px;padding:8px 10px;box-shadow:0 2px 10px rgba(74,59,71,.22)}' +
    '.dr-o{width:44px;height:44px;padding:0;border-radius:50%;border:3px solid transparent;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer}.dr-o.on{border-color:#4A3B47;background:#FFE39A}.dr-o i{display:block;border-radius:50%}' +
    '.dr-dot{width:14px;height:14px;border-radius:50%;border:2px solid #fff;position:absolute;right:4px;bottom:4px}.dr-b{position:relative}</style>');

  const ink = document.createElement('canvas'), las = document.createElement('canvas');
  ink.className = 'dr-c ink'; las.className = 'dr-c';
  document.body.appendChild(ink); document.body.appendChild(las);
  const ictx = ink.getContext('2d'), lctx = las.getContext('2d');

  function size() {
    const r = window.devicePixelRatio || 1, w = window.innerWidth, h = window.innerHeight;
    // 캔버스를 '실제로 보이는 화면' 크기에 딱 맞춥니다. (100vh 는 아이패드에서 보이는 높이보다 커서, 그대로 두면 펜보다 아래에 그려집니다)
    [ink, las].forEach(c => { c.style.width = w + 'px'; c.style.height = h + 'px'; c.width = Math.round(w * r); c.height = Math.round(h * r); c.getContext('2d').setTransform(r, 0, 0, r, 0, 0); });
  }
  size();
  window.addEventListener('resize', size);   // 화면을 돌리면 필기는 지워집니다
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { if (Math.abs(ink.clientHeight - window.innerHeight) > 1 || Math.abs(ink.clientWidth - window.innerWidth) > 1) size(); });
  function clearInk() { ictx.clearRect(0, 0, window.innerWidth, window.innerHeight); }

  const S = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ICON = {
    off: S('<path d="M9 11V5.5a1.5 1.5 0 013 0V11m0-1.5a1.5 1.5 0 013 0V12m0-1a1.5 1.5 0 013 0v4.5a6 6 0 01-6 6h-1a6 6 0 01-5-2.7L5 14.5a1.6 1.6 0 012.6-1.8L9 14.5"/>'),
    pen: S('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>'),
    laser: S('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    erase: S('<path d="M8 19l-4.5-4.5a1.5 1.5 0 010-2.1L12 4a1.5 1.5 0 012.1 0l5.4 5.4a1.5 1.5 0 010 2.1L12 19H8z"/><path d="M8.5 7.5l7 7M12 19h8"/>'),
    clear: S('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>'),
    grip: S('<circle cx="9" cy="7" r="1.3" fill="currentColor"/><circle cx="15" cy="7" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="17" r="1.3" fill="currentColor"/><circle cx="15" cy="17" r="1.3" fill="currentColor"/>'),
    up: S('<path d="M6 15l6-6 6 6"/>'), down: S('<path d="M6 9l6 6 6-6"/>')
  };
  const NAME = { off: '터치 (필기 끄기)', pen: '펜 (꾹 누르면 색 고르기)', laser: '레이저 포인터', erase: '지우개 (꾹 누르면 크기 고르기)', clear: '전부 지우기' };
  const bar = document.createElement('div');
  bar.className = 'dr-bar';
  document.body.appendChild(bar);
  function drawBar() {
    bar.innerHTML = '<div class="dr-b dr-grip" data-grip="1" title="끌어서 옮기기" aria-label="끌어서 옮기기">' + ICON.grip + '</div>' + (folded ? [] : ['off', 'pen', 'laser', 'erase', 'clear']).map(t =>
      '<button type="button" class="dr-b' + (tool === t ? ' on' : '') + '" data-t="' + t + '" aria-label="' + NAME[t] + '" title="' + NAME[t] + '">' + ICON[t] +
      (t === 'pen' ? '<span class="dr-dot" style="background:' + COLORS[colorI] + '"></span>' : '') + '</button>').join('') +
      '<button type="button" class="dr-b dr-fold" data-t="fold" aria-label="' + (folded ? '도구 펴기' : '도구 접기') + '" title="' + (folded ? '도구 펴기' : '도구 접기') + '">' + (folded ? ICON.down : ICON.up) + '</button>';
    place();
    document.body.classList.toggle('dr-on', tool !== 'off');
    ink.style.cursor = tool === 'off' ? '' : 'crosshair';
  }
  bar.addEventListener('click', e => {
    const b = e.target.closest('.dr-b'); if (!b) return;
    const t = b.dataset.t;
    if (held) { held = false; return; }   // 꾹 눌러서 고르기 창을 연 경우
    closePop();
    if (t === 'fold') { folded = !folded; local('sw_draw_fold', folded ? '1' : '0'); drawBar(); return; }
    if (t === 'clear') { clearInk(); trail = []; return; }
    if ((t === 'pen' || t === 'erase') && tool === t) { openPop(t); return; }   // 이미 고른 도구를 한 번 더 누르면 고르기 창
    tool = t; drawBar();
  });
  // 고르기 창: 펜은 색, 지우개는 크기. 도구를 꾹 누르거나, 고른 도구를 한 번 더 누르면 열립니다
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(t) {
    closePop();
    tool = t; drawBar();
    const b = bar.querySelector('[data-t="' + t + '"]'); if (!b) return;
    pop = document.createElement('div'); pop.className = 'dr-pop';
    pop.innerHTML = t === 'pen'
      ? COLORS.map((c, i) => '<button type="button" class="dr-o' + (i === colorI ? ' on' : '') + '" data-i="' + i + '" aria-label="펜 색 ' + (i + 1) + '"><i style="width:26px;height:26px;background:' + c + '"></i></button>').join('')
      : ERASE.map((w, i) => '<button type="button" class="dr-o' + (i === eraseI ? ' on' : '') + '" data-i="' + i + '" aria-label="지우개 크기 ' + (i + 1) + '"><i style="width:' + Math.min(w, 32) + 'px;height:' + Math.min(w, 32) + 'px;background:#fff;border:2px solid #8E7783"></i></button>').join('');
    document.body.appendChild(pop);
    const r = b.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    const left = r.left > window.innerWidth / 2 ? r.left - pw - 12 : r.right + 12;
    pop.style.left = Math.max(4, Math.min(window.innerWidth - pw - 4, left)) + 'px';
    pop.style.top = Math.max(4, Math.min(window.innerHeight - ph - 4, r.top + r.height / 2 - ph / 2)) + 'px';
    pop.addEventListener('click', e => {
      const o = e.target.closest('.dr-o'); if (!o) return;
      if (t === 'pen') colorI = Number(o.dataset.i); else eraseI = Number(o.dataset.i);
      closePop(); drawBar();
    });
  }
  bar.addEventListener('pointerdown', e => {
    const b = e.target.closest('.dr-b[data-t]'); if (!b) return;
    const t = b.dataset.t; held = false;
    if (t !== 'pen' && t !== 'erase') return;
    clearTimeout(holdT);
    holdT = setTimeout(() => { held = true; openPop(t); }, 450);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => bar.addEventListener(ev, () => clearTimeout(holdT)));

  // 막대 자리: 옮긴 적이 있으면 그 자리(화면 밖으로 나가지 않게), 없으면 오른쪽 가운데
  function place() {
    if (!pos) return;
    const w = bar.offsetWidth || 56, h = bar.offsetHeight || 60;
    const x = Math.max(4, Math.min(window.innerWidth - w - 4, pos.x)), y = Math.max(4, Math.min(window.innerHeight - h - 4, pos.y));
    bar.style.right = 'auto'; bar.style.transform = 'none'; bar.style.left = x + 'px'; bar.style.top = y + 'px';
  }
  window.addEventListener('resize', place);
  let grab = null;
  bar.addEventListener('pointerdown', e => {
    if (!e.target.closest('[data-grip]')) return;
    e.preventDefault();
    const r = bar.getBoundingClientRect();
    grab = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    try { bar.setPointerCapture(e.pointerId); } catch (err) { }
  });
  bar.addEventListener('pointermove', e => { if (!grab) return; pos = { x: e.clientX - grab.dx, y: e.clientY - grab.dy }; place(); });
  const drop = () => { if (grab) { grab = null; if (pos) local('sw_draw_pos', JSON.stringify(pos)); } };
  bar.addEventListener('pointerup', drop); bar.addEventListener('pointercancel', drop);
  drawBar();

  function seg(a, b) {
    if (tool === 'pen' || tool === 'erase') {
      ictx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over';
      ictx.strokeStyle = COLORS[colorI]; ictx.lineWidth = tool === 'erase' ? ERASE[eraseI] : 5;
      ictx.lineCap = 'round'; ictx.lineJoin = 'round';
      ictx.beginPath(); ictx.moveTo(a.x, a.y); ictx.lineTo(b.x, b.y); ictx.stroke();
    }
  }
  function point(e, gap) {
    const rc = ink.getBoundingClientRect();
    const p = { x: e.clientX - rc.left, y: e.clientY - rc.top };
    if (tool === 'laser') trail.push({ x: p.x, y: p.y, t: performance.now(), gap: gap });
    else if (last) seg(last, p); else seg(p, p);
    if (last) moved += Math.abs(p.x - last.x) + Math.abs(p.y - last.y);
    last = p;
  }
  ink.addEventListener('pointerdown', e => {
    if (tool === 'off') return;
    e.preventDefault();
    closePop();
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
