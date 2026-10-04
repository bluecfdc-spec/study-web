// 강의 화면 그리기. 쪽(page) 종류마다 한 단계씩('다음'을 누를 때마다) 내용이 열립니다.
//   talk    제목 + 한 줄씩 나오는 설명            cards  카드가 하나씩 (세 품사, 단위, 선의 종류 …)
//   tag     문장 속 낱말에 품사 이름표 붙이기      sentence / odd / intro  한 품사만 연습
//   angle   팔이 돌아가며 각이 커지는 그림         figure 단계별 그림 (맞꼭지각, 평행선, 상태 변화)
//   state   고체·액체·기체 입자가 움직이는 그림    think  서술형 질문 → 힌트 → 예시 답
// stage.js 의 lessonHTML · lessonMax 를 이 파일의 것으로 바꿔 씁니다.
(function () {
  const TAG = { '명사': 't-n', '동사': 't-v', '형용사': 't-a' };
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '.lx-hide{visibility:hidden}' +
    '.lx-lines{display:flex;flex-direction:column;gap:1.6vh;max-width:1000px;margin:0 auto;width:100%}' +
    '.lx-line{background:#fff;border-radius:24px;padding:1.6vh 2vw;font-size:clamp(20px,2.7vw,38px);line-height:1.4;word-break:keep-all}' +
    '.lx-line b{background:var(--yellow);border-radius:10px;padding:0 .2em;font-weight:inherit}' +
    '.lx-cards{display:flex;gap:1.6vw;flex-wrap:wrap;justify-content:center}' +
    '.lx-card{flex:1 1 200px;max-width:380px;border-radius:28px;padding:2.4vh 1.2vw;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.8vh;background:#fff}' +
    '.lx-sym{font-size:clamp(34px,5vw,70px);line-height:1.1;font-weight:700}.lx-name{font-size:clamp(26px,3.8vw,52px);font-weight:700}' +
    '.lx-desc{font-size:clamp(18px,2.4vw,32px);word-break:keep-all;line-height:1.35}.lx-ex{font-size:clamp(17px,2.1vw,28px);color:var(--sub);word-break:keep-all}' +
    '.lx-card svg{width:100%;max-width:230px;height:auto}' +
    '.lx-tag{font-size:clamp(26px,4.2vw,64px) !important;line-height:2.5 !important}' +
    '.lz-ring.t-n.on{border-color:var(--pink2);background:var(--pink)}.lz-ring.t-v.on{border-color:#5DB79B;background:var(--mint)}.lz-ring.t-a.on{border-color:#E0B43A;background:var(--yellow)}' +
    '.lz-ring.t-v small{color:#1F5C45}.lz-ring.t-a small{color:#7A5A00}' +
    '.lx-legend{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.lx-legend span{border-radius:999px;padding:6px 18px;font-size:clamp(16px,1.9vw,24px)}' +
    '.lx-fig{display:flex;gap:3vw;align-items:center;justify-content:center;flex-wrap:wrap}.lx-fig svg{width:min(56vw,640px);height:auto;background:#fff;border-radius:28px}' +
    '.lx-side{flex:1 1 240px;max-width:420px;text-align:center}.lx-deg{font-size:clamp(50px,8vw,110px);font-weight:700;line-height:1}.lx-big{font-size:clamp(30px,4.4vw,60px);font-weight:700}' +
    '@keyframes lxarm{from{transform:rotate(var(--from))}to{transform:rotate(var(--to))}}@keyframes lxin{from{opacity:0}to{opacity:1}}' +
    '.lx-arm{transform-origin:200px 200px;animation:lxarm .9s ease both}.lx-arc{animation:lxin .4s .8s both}' +
    '.lx-states{display:flex;gap:2vw;justify-content:center;flex-wrap:wrap}.lx-state{flex:1 1 200px;max-width:330px;background:#fff;border-radius:28px;padding:2vh 1.2vw;text-align:center}' +
    '.lx-state svg{width:100%;max-width:220px;height:auto;background:#F6FAFF;border-radius:18px}' +
    '@keyframes lxjig{from{transform:translate(-1.5px,1px)}to{transform:translate(1.5px,-1px)}}' +
    '@keyframes lxliq{0%{transform:translate(0,0)}25%{transform:translate(14px,-4px)}50%{transform:translate(4px,5px)}75%{transform:translate(-12px,-3px)}100%{transform:translate(0,0)}}' +
    '@keyframes lxgas1{0%{transform:translate(0,0)}25%{transform:translate(46px,-38px)}50%{transform:translate(-30px,-52px)}75%{transform:translate(-44px,24px)}100%{transform:translate(0,0)}}' +
    '@keyframes lxgas2{0%{transform:translate(0,0)}25%{transform:translate(-50px,30px)}50%{transform:translate(36px,44px)}75%{transform:translate(52px,-20px)}100%{transform:translate(0,0)}}' +
    '.lx-q{font-size:clamp(26px,3.8vw,54px);line-height:1.4;text-align:center;word-break:keep-all}' +
    '.lx-hint{background:#fff;border-radius:22px;padding:1.4vh 2vw;font-size:clamp(18px,2.3vw,32px);word-break:keep-all}' +
    '.lx-ans{background:var(--mint);border-radius:22px;padding:1.6vh 2vw;font-size:clamp(19px,2.4vw,34px);line-height:1.45;word-break:keep-all}' +
    '.lx-ans small,.lx-hint small{display:block;font-size:.62em;color:var(--sub)}</style>');

  const hide = on => on ? '' : ' lx-hide';
  const P = (cx, cy, r, a) => (cx + r * Math.cos(a * Math.PI / 180)).toFixed(1) + ' ' + (cy - r * Math.sin(a * Math.PI / 180)).toFixed(1);
  // 각을 나타내는 부채꼴 (a0 → a1, 시계 반대 방향, 도)
  function sector(cx, cy, r, a0, a1, color) {
    return '<path d="M' + cx + ' ' + cy + ' L' + P(cx, cy, r, a0) + ' A' + r + ' ' + r + ' 0 ' + ((a1 - a0) > 180 ? 1 : 0) + ' 0 ' + P(cx, cy, r, a1) + ' Z" fill="' + color + '" fill-opacity=".55" stroke="' + color + '" stroke-width="2"/>';
  }
  const T = (x, y, s, size) => '<text x="' + x + '" y="' + y + '" font-size="' + (size || 15) + '" text-anchor="middle" fill="#4A3B47" font-weight="700">' + s + '</text>';
  const LN = (x1, y1, x2, y2) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#4A3B47" stroke-width="4" stroke-linecap="round"/>';
  const DOT = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#4A3B47"/>';
  const ARW = (x, y, dir) => '<path d="M' + x + ' ' + y + ' l' + (-12 * dir) + ' -8 v16 z" fill="#4A3B47"/>';
  const MINI = {   // 카드 안 작은 그림
    line: '<svg viewBox="0 0 200 50">' + LN(18, 25, 182, 25) + ARW(194, 25, 1) + ARW(6, 25, -1) + DOT(70, 25) + DOT(130, 25) + '</svg>',
    ray: '<svg viewBox="0 0 200 50">' + LN(30, 25, 182, 25) + ARW(194, 25, 1) + DOT(30, 25) + '</svg>',
    seg: '<svg viewBox="0 0 200 50">' + LN(30, 25, 170, 25) + DOT(30, 25) + DOT(170, 25) + '</svg>'
  };
  const FIG = {
    // 맞꼭지각: 두 직선이 만나면 마주 보는 각끼리 크기가 같다
    vertical: st => '<svg viewBox="0 0 400 240">' +
      (st >= 1 ? sector(200, 120, 46, -20.6, 29.7, '#F29BB5') + T(262, 122, '50°') : '') +
      (st >= 2 ? sector(200, 120, 46, 159.4, 209.7, '#F29BB5') + T(138, 126, '50°') : '') +
      (st >= 3 ? sector(200, 120, 34, 29.7, 159.4, '#8FB4F5') + sector(200, 120, 34, 209.7, 339.4, '#8FB4F5') + T(200, 74, '130°') + T(200, 176, '130°') : '') +
      LN(40, 60, 360, 180) + LN(60, 200, 340, 40) + DOT(200, 120) + '</svg>',
    // 평행선과 만나는 직선: 동위각(같은 자리), 엇각(엇갈린 자리)
    parallel: st => '<svg viewBox="0 0 400 250">' +
      (st === 1 ? sector(250, 80, 40, 0, 42, '#8FB4F5') + sector(150, 170, 40, 0, 42, '#8FB4F5') + T(312, 70, '동위각', 14) + T(212, 160, '동위각', 14) : '') +
      (st >= 2 ? sector(250, 80, 40, 180, 222, '#F29BB5') + sector(150, 170, 40, 0, 42, '#F29BB5') + T(190, 100, '엇각', 14) + T(210, 160, '엇각', 14) : '') +
      LN(40, 80, 360, 80) + LN(40, 170, 360, 170) + LN(95, 219.5, 305, 30.5) + T(378, 85, 'l', 16) + T(378, 175, 'm', 16) +
      '<text x="60" y="130" font-size="14" fill="#6B5764">l 과 m 은 평행</text></svg>',
    // 상태 변화: 고체 ⇄ 액체 ⇄ 기체
    change: st => {
      const box = (x, name, c) => '<rect x="' + x + '" y="85" width="90" height="56" rx="16" fill="' + c + '"/>' + T(x + 45, 120, name, 20);
      const arr = (x1, x2, y, label, up) => '<path d="M' + x1 + ' ' + y + ' L' + x2 + ' ' + y + '" stroke="#4A3B47" stroke-width="3"/>' + ARW(x2 + (x2 > x1 ? 6 : -6), y, x2 > x1 ? 1 : -1) + T((x1 + x2) / 2, up ? y - 9 : y + 22, label, 14);
      return '<svg viewBox="0 0 440 230">' + box(20, '고체', '#CFE0FF') + box(175, '액체', '#BFE8D9') + box(330, '기체', '#FFE39A') +
        (st >= 1 ? arr(116, 164, 100, '융해', true) : '') + (st >= 2 ? arr(169, 121, 128, '응고', false) : '') +
        (st >= 3 ? arr(271, 319, 100, '기화', true) : '') + (st >= 4 ? arr(324, 276, 128, '액화', false) : '') +
        (st >= 5 ? '<path d="M65 80 C120 15 320 15 375 80" stroke="#4A3B47" stroke-width="3" fill="none" stroke-dasharray="7 6"/>' + T(220, 26, '승화 (고체 ↔ 기체)', 14) : '') +
        (st >= 1 ? '<text x="220" y="205" font-size="13" text-anchor="middle" fill="#6B5764">→ 열을 얻으면 오른쪽으로 · ← 열을 잃으면 왼쪽으로</text>' : '') + '</svg>';
    }
  };
  // 입자 그림: 고체는 제자리에서 떨고, 액체는 서로 미끄러지고, 기체는 사방으로 날아다닙니다
  function particles(kind) {
    let dots = '';
    for (let i = 0; i < 16; i++) {
      const c = i % 4, r = Math.floor(i / 4);
      let x, y, an;
      if (kind === 'solid') { x = 36 + c * 16; y = 60 + r * 16; an = 'lxjig .35s ' + (i * 0.07).toFixed(2) + 's infinite alternate'; }
      else if (kind === 'liquid') { x = 22 + c * 24 + (r % 2) * 9; y = 62 + r * 14; an = 'lxliq ' + (2.2 + (i % 3) * 0.5) + 's ' + (-i * 0.3).toFixed(1) + 's infinite ease-in-out'; }
      else { x = 60; y = 60; an = (i % 2 ? 'lxgas1 ' : 'lxgas2 ') + (2.6 + (i % 5) * 0.45) + 's ' + (-i * 0.55).toFixed(2) + 's infinite linear'; }
      if (kind === 'gas' && i >= 8) continue;   // 기체는 입자 사이가 멀어요
      dots += '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="' + (kind === 'solid' ? '#7FA6EA' : kind === 'liquid' ? '#5DB79B' : '#E0A93A') + '" style="animation:' + an + '"/>';
    }
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + dots + '</svg>';
  }

  function maxOf(pg) {
    switch (pg.type) {
      case 'intro': return pg.cats.length;
      case 'sentence': return pg.words.filter(w => w.hit).length;
      case 'tag': return pg.words.filter(w => w.tag).length;
      case 'talk': return pg.lines.length;
      case 'cards': return pg.cards.length;
      case 'angle': return pg.steps.length - 1;
      case 'figure': return pg.caps.length;
      case 'state': return pg.items.length;
      case 'think': return (pg.hints || []).length + 1;
      default: return 1;
    }
  }

  function body(L, pg, st) {
    const max = maxOf(pg), word = pg.word || L.word;
    const cap = pg.cap ? '<p class="why lz-cap' + (st >= max ? ' show' : '') + '">' + esc(pg.cap) + '</p>' : '';
    if (pg.type === 'intro') {
      return '<div class="lz-intro"><div class="lz-word"><div class="lz-big">' + esc(word) + '</div><div class="lz-mean">' + esc(pg.mean) + '</div></div><div class="lz-cats">' +
        pg.cats.map((c, i) => '<div class="lz-cat' + (i < st ? ' show' : '') + '">' + ICONS[c.icon]() + '<div class="lz-catname">' + esc(c.name) + '</div><div class="lz-ex">' + esc(c.ex.join(' · ')) + '</div></div>').join('') + '</div></div>';
    }
    if (pg.type === 'sentence' || pg.type === 'tag') {
      let h = 0;
      const tagged = pg.type === 'tag';
      const text = pg.words.map(w => {
        if (w.br) return '<br>';
        const mark = tagged ? w.tag : w.hit;
        if (!mark) return '<span class="lz-w">' + esc(w.w) + esc(w.tail || '') + '</span>';
        h++;
        return '<span class="lz-w"><span class="lz-ring ' + (tagged ? TAG[w.tag] || 't-n' : 't-n') + (h <= st ? ' on' : '') + '">' + esc(w.w) + '<small>' + esc(tagged ? w.tag : word) + '</small></span>' + esc(w.tail || '') + '</span>';
      }).join(' ');
      return '<p class="sub">' + esc(pg.ask) + '</p><div class="card"><p class="qtext lz-sent' + (tagged ? ' lx-tag' : '') + '">' + text + '</p></div>' +
        (tagged ? '<div class="lx-legend"><span style="background:var(--pink)">명사 · 이름</span><span style="background:var(--mint)">동사 · 움직임</span><span style="background:var(--yellow)">형용사 · 모습·상태</span></div>' : '') + cap;
    }
    if (pg.type === 'odd') {
      return '<h1>' + esc(pg.ask) + '</h1><div class="lz-odd">' + pg.words.map(w =>
        '<div class="lz-card' + (st >= 1 ? (w.odd ? ' odd' : ' ok') : '') + '">' + esc(w.w) + '<small>' + (st >= 1 ? esc(w.odd ? w.tag : (pg.okTag || word)) : '&nbsp;') + '</small></div>').join('') + '</div>' + cap;
    }
    if (pg.type === 'talk') {
      return '<h1>' + esc(pg.title) + '</h1><div class="lx-lines">' + pg.lines.map((t, i) =>
        '<div class="lx-line' + hide(i < st) + '">' + esc(t).replace(/\[(.+?)\]/g, '<b>$1</b>') + '</div>').join('') + '</div>';
    }
    if (pg.type === 'cards') {
      return '<h1>' + esc(pg.title) + '</h1><div class="lx-cards">' + pg.cards.map((c, i) =>
        '<div class="lx-card' + hide(i < st) + '" style="background:' + (c.bg || '#fff') + '">' + (c.sym ? '<div class="lx-sym">' + esc(c.sym) + '</div>' : '') + (c.svg ? MINI[c.svg] : '') +
        '<div class="lx-name">' + esc(c.name) + '</div>' + (c.desc ? '<div class="lx-desc">' + esc(c.desc) + '</div>' : '') + (c.ex ? '<div class="lx-ex">' + esc(c.ex) + '</div>' : '') + '</div>').join('') + '</div>' + cap;
    }
    if (pg.type === 'angle') {
      const s = pg.steps[Math.min(st, pg.steps.length - 1)], from = st > 0 ? pg.steps[st - 1].deg : 0, d = s.deg;
      const arc = d === 90 ? '<path class="lx-arc" d="M228 200 v-28 h-28" fill="none" stroke="#F29BB5" stroke-width="5"/>'
        : d > 0 ? '<g class="lx-arc">' + sector(200, 200, 54, 0, d, '#F29BB5') + '</g>' : '';
      return '<h1>' + esc(pg.title) + '</h1><div class="lx-fig"><svg viewBox="0 0 400 240">' + arc + LN(200, 200, 370, 200) +
        '<line class="lx-arm" style="--from:' + (-from) + 'deg;--to:' + (-d) + 'deg" x1="200" y1="200" x2="370" y2="200" stroke="#E5484D" stroke-width="5" stroke-linecap="round"/>' +
        DOT(200, 200) + T(200, 226, '꼭짓점', 13) + '</svg>' +
        '<div class="lx-side"><div class="lx-deg">' + d + '°</div><div class="lx-big">' + esc(s.name || '') + '&nbsp;</div><p class="why">' + esc(s.note) + '</p></div></div>';
    }
    if (pg.type === 'figure') {
      return '<h1>' + esc(pg.title) + '</h1><div class="lx-fig">' + FIG[pg.fig](st) +
        '<div class="lx-side"><p class="why">' + esc(st === 0 ? (pg.lead || '') : pg.caps[st - 1]) + '</p></div></div>';
    }
    if (pg.type === 'state') {
      return '<h1>' + esc(pg.title) + '</h1><div class="lx-states">' + pg.items.map((it, i) =>
        '<div class="lx-state' + hide(i < st) + '">' + particles(it.kind) + '<div class="lx-name">' + esc(it.name) + '</div><div class="lx-desc">' + esc(it.desc) + '</div></div>').join('') + '</div>' + cap;
    }
    if (pg.type === 'think') {
      const hints = pg.hints || [];
      return '<div class="chip" style="align-self:center;background:var(--yellow)">생각해 보기 · 말로 설명해 봐요</div><div class="card"><p class="lx-q">' + esc(pg.q) + '</p></div><div class="lx-lines">' +
        hints.map((t, i) => '<div class="lx-hint' + hide(i < st) + '"><small>힌트 ' + (i + 1) + '</small>' + esc(t) + '</div>').join('') +
        '<div class="lx-ans' + hide(st > hints.length) + '"><small>이렇게 말할 수 있어요</small>' + esc(pg.answer) + '</div></div>';
    }
    return '';
  }

  window.lessonMax = maxOf;
  window.lessonHTML = function () {
    const L = LESSONS[live.lessonId], pi = live.page, st = live.step || 0, total = L.pages.length;
    const head = '<div class="top"><div class="chip">' + esc(L.subject) + ' · ' + esc(L.unit) + ' · ' + esc(L.word) + '</div><div class="sub">' + (pi < total ? (pi + 1) + ' / ' + total : '끝') + '</div></div>';
    if (pi >= total) {
      return head + '<h1>' + esc(L.word) + ' 수업 끝!</h1><p class="sub">' + (L.quiz && SETS[L.quiz] ? '이제 문제로 확인해 볼까요?' : '수고했어요!') + '</p><div class="sets">' +
        (L.quiz && SETS[L.quiz] ? '<div class="set"><span>문제 · ' + esc(SETS[L.quiz].title) + '</span><button class="go" data-act="start" data-set="' + L.quiz + '">문제 풀기</button></div>' : '') +
        '</div><div class="bar"><button class="quiet" data-act="back">이전</button><button class="go plain" data-act="stop">대기실로</button></div>';
    }
    return head + body(L, L.pages[pi], st) +
      '<div class="bar"><button class="quiet" data-act="stop">수업 끝내기</button><div class="lz-btns"><button class="go plain" data-act="back">이전</button><button class="go" data-act="fwd">다음</button></div></div>';
  };
  if (typeof render === 'function') render();
})();
