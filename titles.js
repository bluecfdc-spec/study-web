// 영어 미션 제목: 5과 본문 제목을 그대로 보여 줍니다 (daily.js 의 한글 소제목을 덮어씀)
(function () {
  if (typeof DAILY === 'undefined') return;
  DAILY.days.forEach(function (d) { d.title = 'Who Threw a Cake at the Monalisa?'; });
})();
