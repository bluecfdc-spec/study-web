// 영어 미션의 하루치 제목을 영어로 보여 줍니다 (daily.js 의 한글 제목을 덮어씀)
(function () {
  if (typeof DAILY === 'undefined') return;
  ['What Happened?', "Ann's Story", "Carlos's Story", 'Carlos and Diego', 'Diego and Camila', "Camila's Story", 'Who Did It?']
    .forEach(function (t, i) { if (DAILY.days[i]) DAILY.days[i].title = t; });
})();
