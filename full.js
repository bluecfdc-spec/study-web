// 전체 화면 버튼: 음악·효과음 버튼 왼쪽의 작은 아이콘. 누르면 주소창 없이 화면을 가득 채웁니다.
// 기기가 전체 화면을 지원하지 않으면(아이폰 등) 버튼이 아예 나오지 않습니다.
(function () {
  // 오른쪽 위 작은 버튼들(전체 화면·효과음·음악)이 '문제 1 / 10' 같은 글씨를 가리지 않게 자리를 비워 둡니다
  document.head.insertAdjacentHTML('beforeend', '<style>#app .top{padding-right:126px}</style>');
  const el = document.documentElement;
  const can = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  if (!can || !(el.requestFullscreen || el.webkitRequestFullscreen)) return;
  document.head.insertAdjacentHTML('beforeend', '<style>#fullBtn{position:fixed;top:8px;right:92px;z-index:5;width:34px;height:34px;padding:0;border-radius:50%;border:none;background:rgba(255,255,255,.7);color:#B79AA6;display:flex;align-items:center;justify-content:center;cursor:pointer}#fullBtn svg{width:18px;height:18px}</style>');
  const btn = document.createElement('button');
  btn.id = 'fullBtn'; btn.type = 'button';
  document.body.appendChild(btn);
  const isOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function draw() {
    btn.setAttribute('aria-label', isOn() ? '전체 화면 끝내기' : '전체 화면');
    btn.title = isOn() ? '전체 화면 끝내기' : '전체 화면';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (isOn() ? '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>' : '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>') + '</svg>';
  }
  btn.addEventListener('click', () => {
    try {
      if (isOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else { const r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if (r && r.catch) r.catch(() => { }); }
    } catch (e) { }
  });
  document.addEventListener('fullscreenchange', draw);
  document.addEventListener('webkitfullscreenchange', draw);
  draw();
})();
