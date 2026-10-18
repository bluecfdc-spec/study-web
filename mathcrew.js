// 설명 첫 장면(인사) 동안 오른쪽에 우리 반 아이들 캐릭터가 흔들흔들 뽁짝뽁짝 — 녹음 길이가 길어도 심심하지 않게.
// 페이지의 <div id="crew"> 를 채웁니다. body.s0 일 때만 보입니다(첫 장면).
(function () {
  const box = document.getElementById('crew');
  if (!box || typeof makeStore !== 'function' || typeof avatarSVG !== 'function') return;
  const SKIP = ['크리미'];   // 캐릭터로 띄우지 않을 이름 (선생님 시험용 계정 등)
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.side{position:relative}#crew{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:clamp(10px,3vw,28px);visibility:hidden;pointer-events:none}' +
    'body.s0 #crew{visibility:visible}' +
    '#crew .kid{display:flex;flex-direction:column;align-items:center;gap:6px;font-family:var(--display);font-size:clamp(18px,2.4vw,26px);color:var(--fg)}' +
    '#crew .kid svg{width:clamp(70px,11vw,130px) !important;height:auto !important;visibility:visible !important;max-height:none !important;flex:none !important;margin:0 !important;filter:drop-shadow(0 6px 0 rgba(0,0,0,.08))}' +
    '#crew .bob{animation:kidbob 1.1s ease-in-out infinite;transform-origin:50% 90%}' +
    '#crew .kid:nth-child(2) .bob{animation-delay:-.37s}#crew .kid:nth-child(3) .bob{animation-delay:-.74s}' +
    '@keyframes kidbob{0%,100%{transform:translateY(0) rotate(-6deg)}25%{transform:translateY(-14px) rotate(0deg) scale(1.04,.97)}50%{transform:translateY(0) rotate(6deg)}75%{transform:translateY(-8px) rotate(0deg)}}' +
    '@media (prefers-reduced-motion:reduce){#crew .bob{animation:none}}' +
    '@media (max-width:680px){#crew .kid svg{width:clamp(64px,21vw,96px) !important}}</style>');
  makeStore().get(BASE + '/students').then(v => {
    const list = Object.keys(v || {}).map(id => v[id]).filter(s => s && s.name && !SKIP.some(n => s.name.indexOf(n) >= 0)).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    box.innerHTML = list.map(s => '<div class="kid"><div class="bob">' + avatarSVG(s.avatar, 120) + '</div>' + esc(s.name) + '</div>').join('');
  }).catch(() => { });
})();
