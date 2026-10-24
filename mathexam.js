// 수학 중간고사 전날 수업 (2026-10-25): '적을 알자' + 덩어리 4개(③ 다각형 → ② 작도·합동 → ④ 원과 부채꼴 → ① 기본 도형) + 시험 요령.
// 수업 화면(stage.html)에서는 수업(LESSONS)과 퀴즈(SETS)를, 학생 폰(index.html)에서는 퀴즈만 씁니다.
// 그림은 lesson.js 가 window.LX 로 내보낸 도구(sector, T, LN, DOT)로 그리고, '다음'을 누를 때마다 한 단계씩 열립니다.
(function () {
  if (typeof SETS === 'undefined' || typeof LESSONS === 'undefined') return;

  // ===== 덩어리 끝 퀴즈 5문제씩 (카운트다운 동시 응답) =====
  SETS['math-exam-q3'] = {
    subject: '수학', unit: '시험 전날 · ③ 다각형', title: '③ 다각형 확인 5문제', ask: '답을 골라요', choices: ['①', '②', '③', '④'],
    items: [
      { q: '[팔각형]의 대각선의 개수는?', choices: ['16', '20', '24', '40'], a: 1, why: '8 × (8 − 3) ÷ 2 = 8 × 5 ÷ 2 = 20' },
      { q: '[칠각형]의 내각의 크기의 합은?', choices: ['720°', '900°', '1080°', '1260°'], a: 1, why: '180° × (7 − 2) = 180° × 5 = 900°' },
      { q: '[정육각형]의 한 외각의 크기는?', choices: ['45°', '60°', '72°', '120°'], a: 1, why: '외각의 합은 항상 360°. 360° ÷ 6 = 60°' },
      { q: '삼각형의 두 내각이 [50°, 60°]일 때, 나머지 꼭짓점의 외각은?', choices: ['70°', '100°', '110°', '130°'], a: 2, why: '외각 = 이웃하지 않는 두 내각의 합 = 50 + 60 = 110°' },
      { q: '[오각별] 다섯 꼭짓점 각의 합은?', choices: ['180°', '360°', '540°', '720°'], a: 0, why: '오각별은 180°, 칠각별은 540°. 외워요!' }
    ]
  };
  SETS['math-exam-q2'] = {
    subject: '수학', unit: '시험 전날 · ② 작도와 합동', title: '② 작도·합동 확인 5문제', ask: '답을 골라요', choices: ['①', '②', '③', '④'],
    items: [
      { q: '[작도]할 때 쓰는 도구 두 개는?', choices: ['눈금 없는 자 · 컴퍼스', '각도기 · 컴퍼스', '눈금 있는 자 · 각도기', '자 · 연필'], a: 0, why: '작도 = 눈금 없는 자와 컴퍼스만. 각도기는 절대 안 써요.' },
      { q: '선분의 길이를 [재어 옮길 때] 쓰는 도구는?', choices: ['컴퍼스', '각도기', '눈금 없는 자', '삼각자'], a: 0, why: '길이를 잰다·옮긴다 = 컴퍼스. 자는 선만 그어요.' },
      { q: '같은 크기의 각을 만드는 [작도 순서]는?', choices: ['원→원→길이 재기→원→선', '선→원→원→길이 재기→원', '원→길이 재기→원→원→선', '길이 재기→원→원→선→원'], a: 0, why: '원 → 원 → 길이 재기 → 원 → 선. 노래처럼 외워요.' },
      { q: '두 변의 길이와 [그 끼인각]이 각각 같으면 무슨 합동?', choices: ['SSS 합동', 'SAS 합동', 'ASA 합동', '합동 아님'], a: 1, why: '변(S) 각(A) 변(S) = SAS. 각이 두 변 사이에 끼어 있어야 해요.' },
      { q: '세 각의 크기가 같으면 두 삼각형은 [항상 합동]이다', ask: '맞으면 ○, 틀리면 ×', choices: ['○', '×'], a: 1, why: '×. 각만 같고 크기가 다른 삼각형(닮은꼴)이 있어요. 변이 하나는 있어야 해요.' }
    ]
  };
  SETS['math-exam-q4'] = {
    subject: '수학', unit: '시험 전날 · ④ 원과 부채꼴', title: '④ 원과 부채꼴 확인 5문제', ask: '답을 골라요', choices: ['①', '②', '③', '④'],
    items: [
      { q: '원 위의 두 점을 이은 [선분]의 이름은?', choices: ['호', '현', '할선', '반지름'], a: 1, why: '곡선이면 호, 선분이면 현, 끝없이 뻗는 직선이면 할선.' },
      { q: '중심각 30°의 호가 4 cm이면, 중심각 [90°]의 호는?', choices: ['6 cm', '8 cm', '12 cm', '16 cm'], a: 2, why: '각이 3배면 호도 3배. 4 × 3 = 12 cm' },
      { q: '반원에서 ∠BOC = 60°이면 [∠AOC]는?', choices: ['60°', '90°', '120°', '150°'], a: 2, why: '지름 위의 두 각을 더하면 180°. 180 − 60 = 120°' },
      { q: '한 원에서 [현의 길이]는 중심각의 크기에 정비례한다', ask: '맞으면 ○, 틀리면 ×', choices: ['○', '×'], a: 1, why: '×. 비례하는 건 호와 넓이만. 현은 각이 2배여도 2배가 안 돼요.' },
      { q: '두 반지름과 호로 이루어진 도형은?', choices: ['활꼴', '부채꼴', '반원', '현'], a: 1, why: '반지름 두 개 + 호 = 부채꼴. 현 + 호 = 활꼴.' }
    ]
  };
  SETS['math-exam-q1'] = {
    subject: '수학', unit: '시험 전날 · ① 기본 도형', title: '① 기본 도형 확인 5문제', ask: '답을 골라요', choices: ['①', '②', '③', '④'],
    items: [
      { q: '[사각뿔]의 교점의 개수 + 교선의 개수는?', choices: ['12', '13', '14', '16'], a: 1, why: '교점 = 꼭짓점 5개, 교선 = 모서리 8개. 5 + 8 = 13. 작년에 그대로 나왔어요.' },
      { q: '[맞꼭지각]의 크기는 서로 같다', ask: '맞으면 ○, 틀리면 ×', choices: ['○', '×'], a: 0, why: '○. 두 직선이 만나면 마주 보는 각은 항상 같아요.' },
      { q: '[평각]은 몇 도?', choices: ['90°', '180°', '270°', '360°'], a: 1, why: '일직선 = 평각 = 180°' },
      { q: '두 직선 [안쪽]에서 엇갈린 위치에 있는 각의 이름은?', choices: ['동위각', '엇각', '맞꼭지각', '평각'], a: 1, why: '안쪽에서 엇갈리면 엇각(Z 모양). 같은 자리면 동위각.' },
      { q: '점에서 직선에 수직으로 내린 선이 직선과 만나는 점은?', choices: ['중점', '교점', '수선의 발', '꼭짓점'], a: 2, why: '수직으로 내려가 발이 닿는 자리 = 수선의 발. 그 길이가 점과 직선 사이의 거리.' }
    ]
  };

  // ===== 수업 그림 (수업 화면에서만) =====
  const X = window.LX;
  if (!X) return;
  const { sector, T, LN, DOT } = X;
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    '@keyframes mxin{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}.mx-in{animation:mxin .5s ease both;transform-origin:center}' +
    '@keyframes mxpop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}.mx-pop{animation:mxpop .45s ease both;transform-box:fill-box;transform-origin:center}' +
    '@keyframes mxdraw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}.mx-draw{stroke-dasharray:600;animation:mxdraw .9s ease both}' +
    '@keyframes mxarm{from{transform:rotate(var(--from))}to{transform:rotate(var(--to))}}.mx-arm{animation:mxarm .8s ease both}' +
    '</style>');

  const C = { pink: '#F29BB5', mint: '#58B894', blue: '#8FB4F5', yellow: '#F2B24C', ink: '#4A3B47', grey: '#B9A8B3', red: '#E5484D', green: '#2E7D5E', purple: '#B48BE0' };
  const pt = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  const poly = (cx, cy, r, n, a0) => { const p = []; for (let i = 0; i < n; i++) p.push(pt(cx, cy, r, a0 - 360 * i / n)); return p; };
  const ang = (a, b) => Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180 / Math.PI;
  const f1 = v => (+v).toFixed(1);
  const seg = (a, b, col, w, dash) => '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + (col || C.ink) + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="8 7"' : '') + '/>';
  const outline = (ps, col, w) => '<path d="M' + ps.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + ' Z" fill="none" stroke="' + (col || C.ink) + '" stroke-width="' + (w || 4) + '" stroke-linejoin="round"/>';
  const fill = (ps, col, op) => '<path d="M' + ps.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + ' Z" fill="' + col + '" fill-opacity="' + (op == null ? .5 : op) + '"/>';
  const arc = (cx, cy, r, a0, a1, col, w) => '<path d="M' + f1(pt(cx, cy, r, a0)[0]) + ' ' + f1(pt(cx, cy, r, a0)[1]) + ' A' + r + ' ' + r + ' 0 ' + ((a1 - a0) > 180 ? 1 : 0) + ' 0 ' + f1(pt(cx, cy, r, a1)[0]) + ' ' + f1(pt(cx, cy, r, a1)[1]) + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 5) + '" stroke-linecap="round"/>';
  const circ = (cx, cy, r, col, w) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + (col || C.ink) + '" stroke-width="' + (w || 4) + '"/>';
  const tick = (a, b, n, col) => {   // 같은 길이 표시: 선분 가운데 짧은 금 n개
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    let h = ''; for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 7, x = mx + ux * o, y = my + uy * o; h += seg([x - nx * 7, y - ny * 7], [x + nx * 7, y + ny * 7], col || C.red, 3); }
    return h;
  };
  const angmark = (v, p, q, r, col, n) => {   // 꼭짓점 v에서 p쪽→q쪽 호 (n개 겹침)
    let a0 = ang(v, p), a1 = ang(v, q); while (a1 < a0) a1 += 360; if (a1 - a0 > 180) { const t = a0; a0 = a1 - 360; a1 = t; }
    let h = ''; for (let i = 0; i < (n || 1); i++) h += arc(v[0], v[1], r + i * 6, a0, a1, col || C.red, 3); return h;
  };
  const G = (cls, inner) => '<g class="' + cls + '">' + inner + '</g>';
  const IN = inner => G('mx-in', inner);
  const svg = (inner, vb) => '<svg viewBox="' + (vb || '0 0 400 260') + '">' + inner + '</svg>';
  const BOX = (x, y, w, h, col, op) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14" fill="' + col + '" fill-opacity="' + (op == null ? 1 : op) + '"/>';
  const TL = (x, y, s, size, col, anchor) => '<text x="' + x + '" y="' + y + '" font-size="' + (size || 15) + '" text-anchor="' + (anchor || 'middle') + '" fill="' + (col || C.ink) + '" font-weight="700">' + s + '</text>';

  // ---------- 적을 알자 ----------
  // 1. 우리가 배울 4덩어리: 그림 4장이 수업 순서대로 하나씩 나타납니다
  X.FIG.ex4 = st => {
    const panel = (x, y, col, num, name, inner, on) => !on ? '' : IN(BOX(x, y, 190, 122, col, .35) + '<circle cx="' + (x + 18) + '" cy="' + (y + 18) + '" r="13" fill="' + C.ink + '"/>' + TL(x + 18, y + 23, num, 14, '#fff') +
      TL(x + 110, y + 23, name, 16) + '<g transform="translate(' + x + ',' + (y + 32) + ')">' + inner + '</g>');
    // ③ 다각형: 오각형 + 대각선
    const P5 = poly(95, 44, 38, 5, 90);
    let p3 = outline(P5, C.ink, 3);
    for (let i = 0; i < 5; i++) for (let j = i + 2; j < 5; j++) if (!(i === 0 && j === 4)) p3 += seg(P5[i], P5[j], C.pink, 2.5);
    p3 += angmark(P5[0], P5[1], P5[4], 12, C.red, 1) + TL(160, 70, '108°', 13, C.red);
    // ② 작도·합동: 똑같은 삼각형 두 개 + 컴퍼스
    const A1 = [[18, 78], [78, 78], [48, 24]], A2 = [[100, 78], [160, 78], [130, 24]];
    let p2 = fill(A1, C.mint, .45) + outline(A1, C.ink, 3) + fill(A2, C.mint, .45) + outline(A2, C.ink, 3) + tick(A1[0], A1[1], 1) + tick(A2[0], A2[1], 1) + tick(A1[1], A1[2], 2) + tick(A2[1], A2[2], 2) + TL(89, 56, '≡', 20);
    p2 += seg([172, 12], [160, 74], C.ink, 3) + seg([172, 12], [184, 74], C.ink, 3) + DOT(172, 12);
    // ④ 원과 부채꼴: 피자 조각
    let p4 = circ(95, 46, 38, C.ink, 3) + sector(95, 46, 38, 0, 60, C.yellow) + sector(95, 46, 38, 60, 180, C.blue) + DOT(95, 46) + TL(125, 36, '60°', 11, C.ink) + TL(60, 24, '120°', 11, C.ink);
    // ① 기본 도형: 평행선 + 만나는 직선, 맞꼭지각
    let p1 = seg([15, 30], [175, 30], C.ink, 3) + seg([15, 68], [175, 68], C.ink, 3) + seg([50, 84], [140, 14], C.ink, 3) +
      sector(113, 30, 14, 0, 38, C.pink) + sector(63, 68, 14, 0, 38, C.pink) + TL(150, 20, '같다', 11, C.red);
    return svg(panel(5, 4, C.pink, '1', '③ 다각형', p3, st >= 1) + panel(205, 4, C.mint, '2', '② 작도와 합동', p2, st >= 2) +
      panel(5, 134, C.yellow, '3', '④ 원과 부채꼴', p4, st >= 3) + panel(205, 134, C.blue, '4', '① 기본 도형', p1, st >= 4));
  };

  // 2. 작년 시험지 지도: 25문제가 초록·노랑·빨강으로 칠해집니다
  const EXAM = [   // [번호, 배점, 색] g=초록 y=노랑 r=빨강  (exam_map.md 와 같음)
    [1, 3, 'g'], [2, 4, 'r'], [3, 4, 'y'], [4, 4, 'g'], [5, 4, 'r'], [6, 4, 'r'], [7, 3, 'g'], [8, 4, 'r'], [9, 3, 'g'], [10, 4, 'y'],
    [11, 4, 'y'], [12, 4, 'r'], [13, 5, 'r'], [14, 4, 'g'], [15, 4, 'y'], [16, 4, 'g'], [17, 3, 'g'], [18, 5, 'r'], [19, 4, 'y'], [20, 4, 'r'],
    [21, 4, 'g'], [22, 4, 'g'], [23, 4, 'r'], [24, 5, 'r'], [25, 5, 'r']];
  const KCOL = { g: '#7ED6A6', y: '#FFE07A', r: '#FF9B9B' };
  X.FIG.exmap = st => {
    const on = { g: st >= 1, y: st >= 2, r: st >= 3 };
    let h = '';
    EXAM.forEach((e, i) => {
      const col = Math.floor(i / 5), row = i % 5, x = 12 + col * 60, y = 8 + row * 44, lit = on[e[2]];
      h += '<g class="' + (lit ? 'mx-pop' : '') + '">' + BOX(x, y, 54, 38, lit ? KCOL[e[2]] : '#F1E9EC') + TL(x + 27, y + 19, e[0] + '번', 13, lit ? C.ink : C.grey) + TL(x + 27, y + 33, e[1] + '점', 10, lit ? C.ink : C.grey) + '</g>';
    });
    const leg = (x, col, txt, lit) => BOX(x, 236, 16, 16, lit ? col : '#F1E9EC') + TL(x + 24, 249, txt, 12, lit ? C.ink : C.grey, 'start');
    h += '<g transform="translate(0,-80)">' + leg(318, KCOL.g, '초록 9문제 32점', on.g) + '</g><g transform="translate(0,-40)">' + leg(318, KCOL.y, '노랑 5문제 20점', on.y) + '</g>' + leg(318, KCOL.r, '빨강 11문제 48점', on.r);
    if (st >= 3) h += IN(TL(355, 120, '24·25번은', 11, C.red) + TL(355, 134, '올해 범위 밖', 11, C.red));
    return svg(h);
  };

  // 3. 목표 50점: 막대가 쌓입니다 32 → +10 → +9
  X.FIG.exscore = st => {
    const W = 340, x0 = 30, y0 = 70, hgt = 56, bar = (from, to, col, txt, on, cls) => !on ? '' : '<g class="' + (cls || 'mx-in') + '">' + BOX(x0 + from * W / 100, y0, (to - from) * W / 100, hgt, col) + TL(x0 + (from + to) / 2 * W / 100, y0 + 34, txt, 16) + '</g>';
    let h = BOX(x0, y0, W, hgt, '#F1E9EC') + TL(x0, y0 + hgt + 18, '0점', 12) + TL(x0 + W, y0 + hgt + 18, '100점', 12) + seg([x0 + W / 2, y0 - 8], [x0 + W / 2, y0 + hgt + 8], C.grey, 2, true) + TL(x0 + W / 2, y0 - 14, '50점', 13, C.grey);
    h += bar(0, 32, KCOL.g, '초록 32', st >= 1) + bar(32, 42, KCOL.y, '+10', st >= 2) + bar(42, 51, KCOL.r, '+9', st >= 3);
    const total = st >= 3 ? 51 : st >= 2 ? 42 : st >= 1 ? 32 : 0;
    if (st >= 1) h += '<g class="mx-pop">' + TL(200, 40, total + '점', 30, total >= 50 ? C.green : C.ink) + '</g>';
    if (st >= 4) h += IN(BOX(30, 160, 340, 88, '#fff') + TL(200, 186, '초록부터 완벽하게 → 노랑은 아는 것만', 15) + TL(200, 210, '빨강은 미련 없이 찍기', 15, C.red) + TL(200, 236, '빈칸은 절대 금지!', 15, C.red));
    return svg(h);
  };

  LESSONS['math-exam-0'] = {
    subject: '수학', unit: '시험 전날', word: '적을 알자',
    pages: [
      { type: 'figure', fig: 'ex4', title: '내일 시험, 우리가 싸울 상대는 4덩어리',
        lead: '시험 범위가 길어 보여도 결국 4덩어리예요. 오늘 이 순서대로 하나씩 잡아요.',
        caps: ['1번째 ③ 다각형: 꼭짓점 수만 세면 공식에 넣는 거예요. 작년 8문제 32점. 제일 큰 덩어리.',
          '2번째 ② 작도와 합동: 컴퍼스·자로 똑같이 그리기, 똑같은 삼각형 찾기. 작년 5문제 20점.',
          '3번째 ④ 원과 부채꼴: 피자 조각이에요. 각이 2배면 조각도 2배. 작년 4문제 18점.',
          '4번째 ① 기본 도형: 점·선·각, 평행선. 작년 8문제 30점인데 쉬운 것만 골라서 가요.'] },
      { type: 'figure', fig: 'exmap', title: '작년 시험지 지도: 25문제를 색으로 나누면',
        lead: '작년 시험 25문제예요. 똑같은 유형이 올해도 나와요. 그래서 미리 색을 칠해 놨어요.',
        caps: ['초록 9문제 32점: 외우면 맞히는 문제. 오늘 전부 잡아요.',
          '노랑 5문제 20점: 공식을 한 번 더 쓰는 문제. 절반만 잡아도 돼요.',
          '빨강 11문제 48점: 어려운 문제. 고민하지 말고 찍어요. 24·25번은 올해 범위도 아니에요.'] },
      { type: 'figure', fig: 'exscore', title: '목표는 50점. 왜 50점일까?',
        lead: '욕심내지 말고, 잡을 수 있는 것만 다 잡으면 나오는 점수예요.',
        caps: ['초록 9문제를 다 맞히면 32점.',
          '노랑 5문제 중 반만 맞히면 +10점. 여기까지 42점.',
          '빨강 11문제는 찍기. 5개 중 1개는 맞으니까 덤으로 +9점. 그래서 51점!',
          '작전은 이거 하나예요. 초록부터 완벽하게, 노랑은 아는 것만, 빨강은 미련 없이 찍기. 빈칸은 절대 금지.'] }
    ]
  };

  // ---------- ③ 다각형 ----------
  // 정다각형 한 외각·한 내각 (정육각형)
  const H6 = poly(130, 130, 80, 6, 90);
  X.FIG.regpoly = st => {
    let h = fill(H6, C.blue, .25) + outline(H6);
    const cur = H6[1], prev = H6[0], next = H6[2];
    const e = [cur[0] + (cur[0] - prev[0]) * .7, cur[1] + (cur[1] - prev[1]) * .7];
    if (st >= 1) h += IN(seg(cur, e, C.ink, 3, true) + angmark(cur, next, e, 26, C.red) + TL(e[0] - 30, e[1] + 24, '외각 60°', 13, C.red) + TL(318, 50, '외각의 합 = 360°', 15) + TL(318, 74, '360° ÷ 6 = 60°', 17, C.red));
    if (st >= 2) h += IN(angmark(cur, prev, next, 22, C.blue) + TL(cur[0] - 46, cur[1] + 34, '내각 120°', 14, C.blue) + TL(318, 156, '내각 + 외각 = 180°', 15) + TL(318, 180, '180° − 60° = 120°', 17, C.blue));
    if (st >= 3) h += IN(BOX(230, 200, 160, 48, '#fff') + TL(310, 220, '한 외각 = 360 ÷ n', 13) + TL(310, 240, '한 내각 = 180 − 한 외각', 13));
    return svg(h);
  };
  // 대각선으로 나누기: 육각형을 대각선 하나로 → 사각형 2개
  X.FIG.split = st => {
    const P = poly(130, 130, 85, 6, 90);
    let h = outline(P);
    if (st >= 1) h += IN(seg(P[0], P[3], C.red, 4) + fill([P[0], P[1], P[2], P[3]], C.pink, .4) + fill([P[3], P[4], P[5], P[0]], C.blue, .4) + TL(170, 120, '사각형', 13) + TL(90, 140, '사각형', 13));
    if (st >= 2) h += IN(TL(300, 90, '사각형 360°', 16, C.pink) + TL(300, 116, '+ 사각형 360°', 16, C.blue) + seg([240, 128], [360, 128], C.ink, 2) + TL(300, 152, '= 720°', 20, C.red));
    if (st >= 3) h += IN(BOX(225, 180, 170, 60, '#fff') + TL(310, 202, '확인: 4 + 4 − 2 = 6', 13) + TL(310, 224, '육각형 → 180 × 4 = 720° ✓', 13));
    return svg(h);
  };
  // 별 모양: 오각별 180°, 칠각별 540°
  const star = (cx, cy, r, n, k) => { const P = poly(cx, cy, r, n, 90); let h = ''; for (let i = 0; i < n; i++) h += seg(P[i], P[(i + k) % n], C.ink, 3); return { P, h }; };
  X.FIG.star = st => {
    const s5 = star(100, 125, 78, 5, 2), s7 = star(295, 125, 78, 7, 3);
    let h = s5.h;
    if (st >= 1) h += IN(s5.P.map((p, i) => angmark(p, s5.P[(i + 2) % 5], s5.P[(i + 3) % 5], 16, C.red)).join('') + TL(100, 232, '오각별: 5개 다 더하면 180°', 15, C.red));
    if (st >= 2) h += IN(s7.h + s7.P.map((p, i) => angmark(p, s7.P[(i + 3) % 7], s7.P[(i + 4) % 7], 14, C.blue)).join('') + TL(295, 232, '칠각별: 7개 다 더하면 540°', 15, C.blue));
    if (st >= 3) h += IN(TL(200, 20, '계산하지 말고 외워요: 오각별 180° · 칠각별 540°', 14));
    return svg(h);
  };
  LESSONS['math-exam-3'] = {
    subject: '수학', unit: '시험 전날 1번째', word: '③ 다각형', quiz: 'math-exam-q3',
    pages: [
      { type: 'talk', title: '③ 다각형: n만 찾으면 끝', lines: [
        '다각형 문제는 전부 [꼭짓점이 몇 개(n)?]로 시작해요. 육각형이면 n = 6.',
        'n을 찾았으면 [공식에 넣기만] 하면 돼요. 외울 공식은 딱 4개 + 외울 숫자 2개.',
        '작년 시험 8문제 32점. 오늘 제일 오래 할 덩어리예요.'] },
      { type: 'figure', fig: 'diag', title: '공식 1. 대각선의 개수',
        lead: '대각선 = 이웃하지 않는 두 꼭짓점을 이은 선. 오각형의 A에서 그어 볼게요.',
        caps: ['양옆으로 그은 건 변이에요. 자기 자신까지 3개는 못 그어요.', '그래서 한 꼭짓점에서는 n − 3개. 오각형이면 5 − 3 = 2개.', '전체는 n × (n − 3) ÷ 2. 한 선을 양 끝에서 두 번 셌으니 2로 나눠요. 오각형은 5개.'] },
      { type: 'figure', fig: 'intsum', title: '공식 2. 내각의 크기의 합',
        lead: '육각형 안의 각을 다 더하면? 한 꼭짓점에서 대각선을 그어 삼각형으로 잘라요.',
        caps: ['삼각형 1개 = 180°.', '삼각형 2개.', '삼각형 3개.', '삼각형 4개 = (6 − 2)개. 그래서 180° × (n − 2). 육각형은 720°.'] },
      { type: 'figure', fig: 'regpoly', title: '공식 3. 정다각형의 한 외각 · 한 내각',
        lead: '정육각형처럼 각이 다 같은 도형은 외각부터 구해요.',
        caps: ['외각의 합은 몇 각형이든 360°. 그러니까 한 외각은 360 ÷ n. 정육각형은 60°.', '한 꼭짓점에서 내각 + 외각 = 180°. 그래서 한 내각은 180 − 60 = 120°.', '외워요: 한 외각 = 360 ÷ n, 한 내각 = 180 − 한 외각.'] },
      { type: 'figure', fig: 'triext', title: '공식 4. 삼각형의 외각',
        lead: '삼각형 ABC. A는 60°, B는 70°예요. C 바깥쪽 각(외각)은 몇 도일까요?',
        caps: ['C의 안쪽 각은 180 − 60 − 70 = 50°.', '변을 쭉 늘려서 C의 외각을 만들어요. 180 − 50 = ?', '130°. 그런데 60 + 70도 130이죠? 외각 = 이웃하지 않는 두 내각의 합.'] },
      { type: 'figure', fig: 'star', title: '외울 숫자 1. 별 모양',
        lead: '별 모양 꼭짓점 각을 다 더하는 문제는 작년에 2문제 나왔어요. 계산하면 늦어요.',
        caps: ['오각별(꼭짓점 5개) 각을 다 더하면 180°.', '칠각별(꼭짓점 7개)은 540°.', '이 두 숫자는 그냥 외워요. 보기에서 180°, 540° 찾으면 끝.'] },
      { type: 'figure', fig: 'split', title: '외울 방법 2. 대각선으로 나누기',
        lead: '"대각선을 그었더니 사각형과 사각형으로 나뉘었다. 원래 다각형의 내각의 합은?"',
        caps: ['나뉜 도형의 내각의 합을 각각 구해요. 사각형은 360°.', '그냥 더하면 끝. 360 + 360 = 720°.', '확인하고 싶으면 꼭짓점 수: 4 + 4 − 2 = 6, 육각형. 180 × 4 = 720° 맞아요.'] },
      { type: 'talk', title: '③ 같이 풀어 봐요 (문제지 ③)', lines: [
        '5번. 육각형의 대각선의 개수 → 6 × 3 ÷ 2 = [9개]',
        '77번. 육각형의 내각의 합 → 180 × 4 = [720°]',
        '106번. 정오각형의 한 외각 → 360 ÷ 5 = [72°], 한 내각 → 180 − 72 = [108°]',
        '48번. 삼각형 두 내각이 20°, 30° → 외각 [50°]',
        '158번. 칠각별 각의 합 → [540°]'] },
      { type: 'talk', title: '③ 이제 혼자 풀어요', lines: [
        '문제지 ③에서 [1 · 4 · 6 · 7 · 8번] → 대각선',
        '[76 · 78 · 79 · 80 · 81번] → 내각의 합',
        '[103 · 104 · 107 · 108 · 109번] → 정다각형',
        '[49 · 50 · 51번] → 삼각형 외각   /   [156 · 157 · 159번] → 별',
        '다 푼 사람은 유형 끝 [정답 모아보기]로 직접 채점. 틀린 건 손 들어요.'] }
    ]
  };

  // ---------- ② 작도와 합동 ----------
  // 각 옮기기 작도 순서: 원 → 원 → 길이 재기 → 원 → 선
  X.FIG.copyangle = st => {
    const O = [40, 200], Xp = pt(O[0], O[1], 150, 0), Yp = pt(O[0], O[1], 150, 50), P = [230, 200], Q = pt(P[0], P[1], 150, 0);
    const r = 70, A = pt(O[0], O[1], r, 0), B = pt(O[0], O[1], r, 50), D = pt(P[0], P[1], r, 0), Cc = pt(P[0], P[1], r, 50);
    let h = seg(O, Xp, C.ink, 3) + seg(O, Yp, C.ink, 3) + DOT(O[0], O[1]) + T(O[0] - 8, O[1] + 20, 'O', 14) + T(Xp[0], Xp[1] + 20, 'X', 14) + T(Yp[0] + 14, Yp[1], 'Y', 14) +
      seg(P, Q, C.ink, 3) + DOT(P[0], P[1]) + T(P[0] - 8, P[1] + 20, 'P', 14) + T(Q[0], Q[1] + 20, 'Q', 14);
    const lab = (n, txt, on) => !on ? '' : '<g class="mx-pop">' + BOX(10 + (n - 1) * 78, 8, 72, 30, n === st ? C.yellow : '#fff') + TL(46 + (n - 1) * 78, 28, n + ' ' + txt, 12) + '</g>';
    if (st >= 1) h += G('mx-in', arc(O[0], O[1], r, -10, 62, C.pink, 4) + DOT(A[0], A[1]) + DOT(B[0], B[1]) + T(A[0], A[1] + 18, 'A', 12) + T(B[0] + 14, B[1] - 4, 'B', 12));
    if (st >= 2) h += G('mx-in', arc(P[0], P[1], r, -10, 62, C.pink, 4) + DOT(D[0], D[1]) + T(D[0], D[1] + 18, 'D', 12));
    if (st >= 3) h += G('mx-in', seg(A, B, C.red, 3, true) + arc(A[0], A[1], Math.hypot(B[0] - A[0], B[1] - A[1]), 100, 130, C.red, 3));
    if (st >= 4) h += G('mx-in', arc(D[0], D[1], Math.hypot(B[0] - A[0], B[1] - A[1]), 95, 135, C.red, 4) + DOT(Cc[0], Cc[1]) + T(Cc[0] + 14, Cc[1] - 4, 'C', 12));
    if (st >= 5) h += G('mx-in', '<line class="mx-draw" x1="' + P[0] + '" y1="' + P[1] + '" x2="' + f1(pt(P[0], P[1], 150, 50)[0]) + '" y2="' + f1(pt(P[0], P[1], 150, 50)[1]) + '" stroke="' + C.mint + '" stroke-width="4" stroke-linecap="round"/>' + angmark(P, Q, Cc, 30, C.mint) + angmark(O, Xp, Yp, 30, C.mint));
    h += lab(1, '원', st >= 1) + lab(2, '원', st >= 2) + lab(3, '길이 재기', st >= 3) + lab(4, '원', st >= 4) + lab(5, '선', st >= 5);
    return svg(h);
  };
  // 삼각형이 하나로 정해지는 3가지 + 함정
  X.FIG.tri3 = st => {
    const tri = (x, y) => [[x, y + 70], [x + 90, y + 70], [x + 28, y]];
    const card = (i, title, marks, col, on) => { if (!on) return ''; const x = 10 + i * 130, y = 40, P = tri(x + 20, y + 32); return IN(BOX(x, y, 122, 110, col, .3) + TL(x + 61, y + 14, title, 12) + outline(P, C.ink, 3) + marks(P)); };
    let h = TL(200, 22, '삼각형이 하나로 정해지는 3가지', 15);
    h += card(0, '세 변 (SSS)', P => tick(P[0], P[1], 1) + tick(P[1], P[2], 2) + tick(P[2], P[0], 3), C.pink, st >= 1);
    h += card(1, '두 변 + 끼인각 (SAS)', P => tick(P[0], P[1], 1) + tick(P[0], P[2], 2) + angmark(P[0], P[1], P[2], 16), C.mint, st >= 2);
    h += card(2, '한 변 + 양 끝 각 (ASA)', P => tick(P[0], P[1], 1) + angmark(P[0], P[1], P[2], 16) + angmark(P[1], P[2], P[0], 16), C.blue, st >= 3);
    if (st >= 4) h += IN(BOX(10, 160, 380, 90, '#fff') + TL(200, 184, '함정 ✗  세 각만 같으면? → 크기가 다른 삼각형이 얼마든지 있어요', 13, C.red) +
      TL(200, 208, '함정 ✗  두 변 + 끼인각이 "아닌" 각 → 두 가지 모양이 나와요', 13, C.red) + TL(200, 234, '변이 하나는 있어야 하고, 각은 두 변 "사이"에 있어야 해요', 13));
    return svg(h);
  };
  // 합동 조건 SSS · SAS · ASA 짝
  X.FIG.cong = st => {
    const tri = (x, y, flip) => flip ? [[x + 90, y + 70], [x, y + 70], [x + 62, y]] : [[x, y + 70], [x + 90, y + 70], [x + 28, y]];
    const row = (i, name, marks, col, on) => {
      if (!on) return ''; const y = 14 + i * 82, P1 = tri(70, y), P2 = tri(230, y, true);
      return IN(BOX(6, y - 8, 388, 80, col, .22) + TL(34, y + 42, name, 15) + outline(P1, C.ink, 3) + outline(P2, C.ink, 3) + marks(P1) + marks(P2) + TL(200, y + 44, '≡', 22));
    };
    let h = row(0, 'SSS', P => tick(P[0], P[1], 1) + tick(P[1], P[2], 2) + tick(P[2], P[0], 3), C.pink, st >= 1);
    h += row(1, 'SAS', P => tick(P[0], P[1], 1) + tick(P[0], P[2], 2) + angmark(P[0], P[1], P[2], 14), C.mint, st >= 2);
    h += row(2, 'ASA', P => tick(P[0], P[1], 1) + angmark(P[0], P[1], P[2], 14) + angmark(P[1], P[2], P[0], 14), C.blue, st >= 3);
    return svg(h);
  };
  LESSONS['math-exam-2'] = {
    subject: '수학', unit: '시험 전날 2번째', word: '② 작도와 합동', quiz: 'math-exam-q2',
    pages: [
      { type: 'cards', title: '작도: 도구는 딱 두 개', cards: [
        { sym: '📏', name: '눈금 없는 자', desc: '선 긋기 · 선 늘리기', ex: '길이는 못 재요', bg: 'var(--mint)' },
        { sym: '🧭', name: '컴퍼스', desc: '원 그리기 · 길이 재서 옮기기', ex: '"길이를 옮긴다" = 컴퍼스', bg: 'var(--blue)' },
        { sym: '✗', name: '각도기 · 눈금 있는 자', desc: '작도에서는 절대 안 써요', ex: '보기에 나오면 틀린 말', bg: 'var(--pink)' }
      ], cap: '작년 9번(3점): "각의 크기를 잴 때 각도기를 쓴다" → 틀린 설명. 이것만 알아도 3점.' },
      { type: 'figure', fig: 'copyangle', title: '같은 크기의 각 만들기: 순서를 외워요',
        lead: '왼쪽 ∠XOY와 똑같은 각을 오른쪽 반직선 PQ 위에 만들 거예요. 손으로 안 해도 돼요. 순서만 봐요.',
        caps: ['① 원: O를 중심으로 원을 그려 A, B를 찍어요.', '② 원: P를 중심으로 같은 크기 원을 그려 D를 찍어요.', '③ 길이 재기: 컴퍼스로 A에서 B까지 길이를 재요.',
          '④ 원: D를 중심으로 그 길이만큼 원을 그려 C를 찾아요.', '⑤ 선: P에서 C로 선을 그으면 끝. 원 → 원 → 길이 재기 → 원 → 선!'] },
      { type: 'figure', fig: 'tri3', title: '삼각형이 하나로 정해지려면',
        lead: '정보가 몇 개 있어야 삼각형 모양이 딱 하나로 정해질까요? 세 가지만 외워요.',
        caps: ['세 변의 길이. 변 세 개면 모양이 하나.', '두 변 + 그 사이에 낀 각(끼인각).', '한 변 + 그 양 끝의 각 두 개.', '함정 두 개. 세 각만 있으면 ✗, 각이 두 변 사이에 없으면 ✗.'] },
      { type: 'figure', fig: 'cong', title: '합동 조건: SSS · SAS · ASA',
        lead: '합동 = 모양도 크기도 완전히 똑같은 것. 겹치면 딱 맞아요. 합동인지 확인하는 조건 3개.',
        caps: ['SSS: 세 변이 각각 같다. (S = 변)', 'SAS: 두 변과 그 끼인각이 같다. (A = 각) 각이 가운데!', 'ASA: 한 변과 그 양 끝 각이 같다. 변이 가운데!'] },
      { type: 'talk', title: '② 외울 것 정리', lines: [
        '도구: [눈금 없는 자] = 선, [컴퍼스] = 원·길이 옮기기, 각도기 ✗',
        '각 옮기기 순서: [원 → 원 → 길이 재기 → 원 → 선]',
        '삼각형이 하나로: [세 변] / [두 변 + 끼인각] / [한 변 + 양 끝 각]',
        '합동 조건: [SSS · SAS · ASA]. 각 세 개(AAA)는 합동 아님!',
        '세 변 관계: [가장 긴 변 < 나머지 두 변의 합]. 3, 4, 8은 삼각형이 안 돼요 (3 + 4 < 8)'] },
      { type: 'talk', title: '② 같이 풀어 봐요 (문제지 ②)', lines: [
        '4번. 길이를 옮길 때 쓰는 도구 → [컴퍼스]',
        '23번. 각 옮기기 작도 순서 → 원 → 원 → 길이 재기 → 원 → 선 → 답 [④]',
        '107번. 세 변이 각각 같은 두 삼각형 → [SSS 합동]',
        '69번. 두 변과 끼인각이 주어지면 삼각형이 하나로 정해진다 → [○]'] },
      { type: 'talk', title: '② 이제 혼자 풀어요', lines: [
        '문제지 ②에서 [1 · 2 · 3 · 5 · 7 · 8번] → 도구',
        '[24 · 25 · 28 · 29번] → 작도 순서',
        '[108 · 109 · 110 · 112 · 113번] → 합동 조건',
        '[65 · 66 · 67 · 68 · 70번] → 하나로 정해지는 조건',
        '다 푼 사람은 유형 끝 [정답 모아보기]로 채점.'] }
    ]
  };

  // ---------- ④ 원과 부채꼴 ----------
  const O4 = [150, 135], R4 = 95;
  X.FIG.cterms = st => {
    const A = pt(O4[0], O4[1], R4, 20), B = pt(O4[0], O4[1], R4, 110);
    let h = circ(O4[0], O4[1], R4) + DOT(O4[0], O4[1]) + T(O4[0] + 12, O4[1] + 18, 'O', 14) + DOT(A[0], A[1]) + DOT(B[0], B[1]) + T(A[0] + 16, A[1], 'A', 14) + T(B[0] - 4, B[1] - 12, 'B', 14);
    const lab = (i, txt, col) => BOX(258, 18 + i * 44, 136, 36, col, .35) + TL(326, 41 + i * 44, txt, txt.length > 10 ? 10.5 : 13);
    if (st >= 1) h += IN(arc(O4[0], O4[1], R4, 20, 110, C.red, 7) + lab(0, '호 AB = 곡선', C.pink));
    if (st >= 2) h += IN(seg(A, B, C.blue, 5) + lab(1, '현 AB = 선분', C.blue));
    if (st >= 3) { const e1 = [A[0] + (A[0] - B[0]) * .45, A[1] + (A[1] - B[1]) * .45], e2 = [B[0] + (B[0] - A[0]) * .45, B[1] + (B[1] - A[1]) * .45]; h += IN(seg(e1, e2, C.purple, 3, true) + lab(2, '할선 = 끝없는 직선', C.purple)); }
    if (st >= 4) h += IN(sector(O4[0], O4[1], R4, 20, 110, C.yellow) + angmark(O4, A, B, 26, C.ink) + T(O4[0] + 28, O4[1] - 28, '중심각', 12) + lab(3, '부채꼴 = 반지름 2개 + 호', C.yellow));
    if (st >= 5) h += IN('<path d="M' + f1(A[0]) + ' ' + f1(A[1]) + ' A' + R4 + ' ' + R4 + ' 0 0 0 ' + f1(B[0]) + ' ' + f1(B[1]) + ' Z" fill="' + C.mint + '" fill-opacity=".7"/>' + lab(4, '활꼴 = 현 + 호', C.mint));
    return svg(h);
  };
  // 피자 조각: 각이 커지면 호도 넓이도 같은 배로
  X.FIG.pizza = st => {
    const cx = 120, cy = 135, r = 100;
    let h = circ(cx, cy, r) + DOT(cx, cy);
    const deg = st >= 3 ? 90 : st >= 2 ? 60 : st >= 1 ? 30 : 0, arcL = deg / 30 * 4;
    if (st >= 1) h += IN(sector(cx, cy, r, 0, deg, C.yellow) + arc(cx, cy, r, 0, deg, C.red, 7) + TL(cx + 60, cy - 10, deg + '°', 16) + TL(pt(cx, cy, r + 22, deg / 2)[0], pt(cx, cy, r + 22, deg / 2)[1], '호 ' + arcL + ' cm', 13, C.red));
    const row = (i, a, l, on) => !on ? '' : IN(BOX(250, 40 + i * 50, 140, 40, i === 0 ? C.yellow : '#fff', i === 0 ? .4 : 1) + TL(320, 65 + i * 50, a + '°  →  호 ' + l + ' cm', 15));
    h += row(0, 30, 4, st >= 1) + row(1, 60, 8, st >= 2) + row(2, 90, 12, st >= 3);
    if (st >= 3) h += IN(TL(320, 215, '각이 3배 → 호도 3배', 15, C.red) + TL(320, 240, '각 : 각 = 호 : 호 = 넓이 : 넓이', 14));
    return svg(h);
  };
  // 반원: 지름 위의 두 각은 합이 180°
  X.FIG.semi = st => {
    const cx = 128, cy = 170, r = 100, A = [cx - r, cy], B = [cx + r, cy], Cp = pt(cx, cy, r, 60);
    let h = arc(cx, cy, r, 0, 180, C.ink, 4) + seg(A, B) + DOT(cx, cy) + T(cx, cy + 20, 'O', 14) + T(A[0] - 14, A[1] + 6, 'A', 14) + T(B[0] + 14, B[1] + 6, 'B', 14);
    if (st >= 1) h += IN(seg([cx, cy], Cp, C.ink, 3) + DOT(Cp[0], Cp[1]) + T(Cp[0] + 10, Cp[1] - 10, 'C', 14) + sector(cx, cy, 36, 0, 60, C.pink) + TL(cx + 48, cy - 14, '60°', 14) + arc(cx, cy, r, 0, 60, C.pink, 7) + TL(300, 60, '호 BC = 5 cm', 13, C.pink));
    if (st >= 2) h += IN(sector(cx, cy, 36, 60, 180, C.blue) + TL(cx - 40, cy - 22, '120°', 14) + arc(cx, cy, r, 60, 180, C.blue, 7) + TL(300, 100, '180 − 60 = 120°', 16, C.blue));
    if (st >= 3) h += IN(BOX(230, 130, 164, 70, '#fff') + TL(312, 154, '60 : 120 = 5 : ?', 15) + TL(312, 180, '각이 2배 → 호도 2배 = 10 cm', 13, C.red) + TL(60, 50, '호 AC = ?', 13, C.blue));
    return svg(h);
  };
  // 현은 비례하지 않는다
  X.FIG.chord2 = st => {
    const cx = 120, cy = 135, r = 100, A = pt(cx, cy, r, 0), B = pt(cx, cy, r, 40), Cc = pt(cx, cy, r, 80);
    let h = circ(cx, cy, r) + DOT(cx, cy) + seg([cx, cy], A, C.grey, 2) + seg([cx, cy], B, C.grey, 2) + seg([cx, cy], Cc, C.grey, 2);
    if (st >= 1) h += IN(sector(cx, cy, 30, 0, 40, C.pink) + seg(A, B, C.red, 5) + TL(300, 60, '중심각 40° → 현 AB', 14, C.red));
    if (st >= 2) h += IN(sector(cx, cy, 44, 0, 80, C.blue) + seg(A, Cc, C.blue, 5) + TL(300, 100, '중심각 80° → 현 AC', 14, C.blue) + TL(300, 126, '각은 2배인데 현은 2배보다 짧다!', 13));
    if (st >= 3) h += IN(BOX(228, 160, 166, 80, '#fff') + TL(311, 184, '현은 정비례 ✗', 16, C.red) + TL(311, 208, '같은 중심각 → 같은 현 ○', 13, C.green) + TL(311, 228, '비례하는 건 호와 넓이만', 12));
    return svg(h);
  };
  LESSONS['math-exam-4'] = {
    subject: '수학', unit: '시험 전날 3번째', word: '④ 원과 부채꼴', quiz: 'math-exam-q4',
    pages: [
      { type: 'figure', fig: 'cterms', title: '용어 5개: 그림으로 외워요',
        lead: '원 위에 점 A, B를 찍었어요. 이 둘 사이에 생기는 것들의 이름이에요.',
        caps: ['호: A에서 B까지 원을 따라가는 곡선. "호 AB".', '현: A와 B를 곧게 이은 선분. 가장 긴 현은 지름.', '할선: 현을 양쪽으로 끝없이 늘린 직선.',
          '부채꼴: 반지름 두 개와 호로 둘러싸인 부분. 가운데 각이 중심각.', '활꼴: 현과 호로 둘러싸인 부분. 반원은 부채꼴이면서 활꼴이에요.'] },
      { type: 'figure', fig: 'pizza', title: '이 단원 계산은 딱 하나: 비례',
        lead: '피자를 잘라요. 가운데 각이 커지면 조각(호, 넓이)도 똑같은 배로 커져요.',
        caps: ['중심각 30°일 때 호가 4 cm라고 해요.', '각을 2배(60°)로 → 호도 2배, 8 cm.', '각을 3배(90°)로 → 호도 3배, 12 cm. 각 : 각 = 호 : 호. 비례식 세우고 곱하기만!'] },
      { type: 'figure', fig: 'semi', title: '반원이 나오면: 먼저 180°',
        lead: '지름 AB가 있는 반원. 각 하나만 주고 나머지 호를 물어봐요.',
        caps: ['∠BOC = 60°, 호 BC = 5 cm.', '지름 위의 두 각을 더하면 180°. 그래서 ∠AOC = 120°.', '이제 아까처럼 비례. 60 : 120 = 5 : ? → 10 cm.'] },
      { type: 'figure', fig: 'chord2', title: '함정 하나: 현은 비례 안 해요',
        lead: '○× 문제로 꼭 나와요. "현의 길이는 중심각에 정비례한다" → ?',
        caps: ['중심각 40°의 현 AB.', '중심각을 2배(80°)로 하면 현 AC는 2배보다 짧아요. 활처럼 휘어서 그래요.', '정답은 ×. 다만 "같은 중심각이면 현도 같다"는 ○.'] },
      { type: 'talk', title: '④ 외울 것 정리', lines: [
        '용어: [호]=곡선, [현]=선분, [할선]=직선, [부채꼴]=반지름 2개+호, [활꼴]=현+호',
        '[중심각 : 중심각 = 호 : 호 = 넓이 : 넓이] (정비례). 한 바퀴 360° = 원 둘레 전체',
        '반원 → 지름 위 두 각의 합 [180°]부터 구하기',
        '[현은 정비례 ✗]. 같은 중심각이면 같은 현 ○',
        'π가 나오면 겁먹지 말고 그냥 글자처럼 들고 다녀요. 10π × 18 = [180π]'] },
      { type: 'talk', title: '④ 같이 풀어 봐요 (문제지 ④)', lines: [
        '1번. 원 위 두 점을 이은 선분 → [현]',
        '21번. 중심각 30°, 호 2 cm. 중심각 120°의 호는? → 4배 → [8 cm]',
        '38번. 호 10π cm의 중심각이 20°. 원 둘레는? → 360 ÷ 20 = 18배 → [180π cm]',
        '51번. 반원에서 ∠BOC = 45°, 호 BC = 3 cm. 호 AC는? → 135° → 3배 → [9 cm]'] },
      { type: 'talk', title: '④ 이제 혼자 풀어요', lines: [
        '문제지 ④에서 [2 · 3 · 4 · 5 · 9번] → 용어',
        '[22 · 23 · 24 · 25 · 26번] → 비례',
        '[52 · 53 · 54 · 55번] → 반원 180°',
        '[71 · 72 · 74번] → 현은 비례 ✗ (○× 문제)',
        '다 푼 사람은 유형 끝 [정답 모아보기]로 채점.'] }
    ]
  };

  // ---------- ① 기본 도형 ----------
  // 사각뿔: 교점(꼭짓점) 5개, 교선(모서리) 8개
  X.FIG.pyr = st => {
    const V = { T: [160, 30], A: [60, 200], B: [220, 215], C: [280, 160], D: [120, 150] };
    const E = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['T', 'A'], ['T', 'B'], ['T', 'C'], ['T', 'D']];
    let h = E.map(e => seg(V[e[0]], V[e[1]], C.ink, 3, e[0] === 'D' || e[1] === 'D')).join('');
    if (st >= 1) h += Object.keys(V).map((k, i) => '<g class="mx-pop" style="animation-delay:' + (i * .12) + 's">' + '<circle cx="' + V[k][0] + '" cy="' + V[k][1] + '" r="9" fill="' + C.red + '"/>' + TL(V[k][0], V[k][1] + 4, i + 1, 11, '#fff') + '</g>').join('') + IN(TL(340, 60, '교점 = 꼭짓점', 15, C.red) + TL(340, 86, '5개', 24, C.red));
    if (st >= 2) h += E.map((e, i) => { const m = [(V[e[0]][0] + V[e[1]][0]) / 2, (V[e[0]][1] + V[e[1]][1]) / 2]; return '<g class="mx-pop" style="animation-delay:' + (i * .1) + 's">' + BOX(m[0] - 11, m[1] - 10, 22, 20, C.blue) + TL(m[0], m[1] + 5, i + 1, 11, '#fff') + '</g>'; }).join('') + IN(TL(340, 140, '교선 = 모서리', 15, C.blue) + TL(340, 166, '8개', 24, C.blue));
    if (st >= 3) h += IN(BOX(282, 196, 112, 46, '#fff') + TL(338, 226, '5 + 8 = 13', 20));
    return svg(h);
  };
  // 평행선과 동위각·엇각 (a~h)
  X.FIG.alt = st => {
    const l1 = 80, l2 = 180, tx = y => 110 + (180 - y) * .9;   // 가로선 두 개와 비스듬한 선
    const Pa = [tx(l1), l1], Pb = [tx(l2), l2];
    let h = seg([20, l1], [380, l1]) + seg([20, l2], [380, l2]) + seg([tx(240), 240], [tx(20), 20]) + TL(392, l1 + 5, 'l', 14) + TL(392, l2 + 5, 'm', 14);
    const L = (p, dx, dy, s, col) => TL(p[0] + dx, p[1] + dy, s, 15, col || C.ink);
    const pos = { a: [-26, -10], b: [26, -10], c: [-26, 20], d: [26, 20] };
    const hi = (p, name, col, on) => !on ? '' : sector(p[0], p[1], 20, { a: 138, b: 0, c: 180, d: 318 }[name], { a: 180, b: 42, c: 222, d: 360 }[name], col);
    const sA = st === 1, sB = st === 2;
    h += hi(Pa, 'b', C.blue, sA) + hi(Pb, 'b', C.blue, sA) + hi(Pa, 'd', C.pink, sB) + hi(Pb, 'a', C.pink, sB);
    h += L(Pa, pos.a[0], pos.a[1], 'a') + L(Pa, pos.b[0], pos.b[1], 'b') + L(Pa, pos.c[0], pos.c[1], 'c') + L(Pa, pos.d[0], pos.d[1], 'd') +
      L(Pb, pos.a[0], pos.a[1], 'e') + L(Pb, pos.b[0], pos.b[1], 'f') + L(Pb, pos.c[0], pos.c[1], 'g') + L(Pb, pos.d[0], pos.d[1], 'h');
    if (st === 1) h += IN(TL(18, 40, '동위각 = 같은 자리', 16, C.blue, 'start') + TL(18, 62, 'b와 f (오른쪽 위끼리)', 13, C.blue, 'start'));
    if (st === 2) h += IN(TL(18, 40, '엇각 = 안쪽에서 엇갈린 자리', 16, '#C2185B', 'start') + TL(18, 62, 'd와 e (Z 모양)', 13, '#C2185B', 'start'));
    if (st >= 3) h += IN(BOX(20, 24, 230, 52, '#fff') + TL(135, 46, 'l ∥ m 이면', 15) + TL(135, 68, '동위각도 같고, 엇각도 같다', 14, C.green) + sector(Pa[0], Pa[1], 18, 0, 42, C.blue) + sector(Pb[0], Pb[1], 18, 0, 42, C.blue) + sector(Pa[0], Pa[1], 18, 318, 360, C.pink) + sector(Pb[0], Pb[1], 18, 138, 180, C.pink));
    return svg(h);
  };
  // 수선의 발
  X.FIG.foot = st => {
    const P = [150, 60], H = [150, 200];
    let h = seg([30, 200], [370, 200]) + TL(385, 205, 'l', 14) + DOT(P[0], P[1]) + T(P[0] - 16, P[1] + 4, 'P', 14);
    if (st >= 1) h += IN('<line class="mx-draw" x1="150" y1="60" x2="150" y2="200" stroke="' + C.red + '" stroke-width="4" stroke-linecap="round"/>' + '<path d="M150 184 h16 v16" fill="none" stroke="' + C.red + '" stroke-width="3"/>' + TL(300, 70, '점 P에서 직선 l에', 14) + TL(300, 92, '수직으로 선을 내려요', 14));
    if (st >= 2) h += IN('<circle cx="150" cy="200" r="8" fill="' + C.blue + '"/>' + T(150, 228, 'H', 14) + TL(300, 130, '발이 닿는 점 H', 15, C.blue) + TL(300, 152, '= 수선의 발', 17, C.blue));
    if (st >= 3) h += IN(seg([110, 60], [110, 200], C.mint, 3, true) + TL(80, 134, '거리', 14, C.green) + TL(300, 196, '선분 PH의 길이', 14, C.green) + TL(300, 218, '= 점과 직선 사이의 거리', 14, C.green) + TL(300, 240, '(가장 짧은 길)', 12, C.grey));
    return svg(h);
  };
  LESSONS['math-exam-1'] = {
    subject: '수학', unit: '시험 전날 4번째', word: '① 기본 도형', quiz: 'math-exam-q1',
    pages: [
      { type: 'talk', title: '① 기본 도형: 외우면 되는 것만 골라서', lines: [
        '이 덩어리는 작년 8문제 30점인데, 어려운 공간 문제는 [버려요].',
        '우리가 잡을 건 4개: [교점·교선], [맞꼭지각], [동위각·엇각], [수선의 발]. 다 외우기만 하면 돼요.',
        '작년 1번(3점)과 7번(3점), 4번(4점)이 여기서 나왔어요.'] },
      { type: 'figure', fig: 'pyr', title: '교점과 교선: 그냥 세면 돼요',
        lead: '사각뿔이에요. 교점 = 선과 선이 만나는 점, 교선 = 면과 면이 만나는 선. 어려운 말이지만 세는 건 쉬워요.',
        caps: ['교점은 꼭짓점이에요. 꼭대기 1개 + 바닥 4개 = 5개.', '교선은 모서리예요. 바닥 4개 + 옆 4개 = 8개.', '작년 1번: 교점 + 교선 = 5 + 8 = 13. 똑같이 나오면 바로 13!'] },
      { type: 'figure', fig: 'vertical', title: '맞꼭지각: 마주 보면 같다',
        lead: '두 직선이 X자로 만나요. 마주 보는 각을 맞꼭지각이라고 해요.',
        caps: ['한 각이 50°예요.', '마주 보는 각도 50°. 맞꼭지각은 항상 같아요.', '옆 각은? 일직선(평각)은 180°니까 180 − 50 = 130°. 둘 다 130°.'] },
      { type: 'figure', fig: 'alt', title: '동위각과 엇각: 자리 이름이에요',
        lead: '직선 두 개에 비스듬한 선 하나. 각이 8개 생겨요. 이름은 "자리"로 정해요.',
        caps: ['동위각 = 같은 자리. b는 오른쪽 위, f도 오른쪽 위. 그래서 b와 f는 동위각.', '엇각 = 두 직선 안쪽에서 엇갈린 자리. d와 e. Z 모양을 떠올려요.', 'l과 m이 평행이면 동위각끼리 같고, 엇각끼리도 같아요. 평행이 아니면 이름만 있고 크기는 달라요.'] },
      { type: 'figure', fig: 'foot', title: '수선의 발: 수직으로 내려 발이 닿는 자리',
        lead: '점 P가 직선 l 위에 떠 있어요. P에서 l까지 가장 짧은 길은?',
        caps: ['수직으로 똑바로 내려가는 길이에요. 이 선을 수선이라고 해요.', '수선이 직선과 만나는 점 H가 수선의 발.', '선분 PH의 길이가 점 P와 직선 l 사이의 거리예요. 작년 4번이 이 문제.'] },
      { type: 'talk', title: '① 같이 풀어 봐요 (문제지 ①)', lines: [
        '13번. 사각뿔의 교점 a, 교선 b, a + b는? → 5 + 8 = [13]',
        '47번. 두 직선이 만나서 한 각이 25°. 맞꼭지각은? → [25°]',
        '94번. ∠a의 동위각은? → 같은 자리 → [∠e]',
        '74번. 점 A에서 선분 BD에 수선을 내린 점은? → [점 E] (수선의 발)'] },
      { type: 'talk', title: '① 이제 혼자 풀어요', lines: [
        '문제지 ①에서 [1 · 2 · 3 · 4 · 10번] → 교점·교선',
        '[48 · 49 · 50 · 53 · 54번] → 맞꼭지각',
        '[95 · 96 · 97 · 100 · 101번] → 동위각·엇각',
        '[73 · 76 · 77 · 78번] → 수선의 발',
        '나머지 유형(중점, 공간 위치 관계, 꺾인 선)은 오늘 [안 해요]. 시험에서 나오면 찍기.'] }
    ]
  };

  // ---------- 마무리: 시험 요령 ----------
  LESSONS['math-exam-9'] = {
    subject: '수학', unit: '시험 전날', word: '마무리 · 시험 요령',
    pages: [
      { type: 'talk', title: '내일 시험장에서: 이렇게 하면 50점', lines: [
        '① [초록 문제부터]. 아는 문제를 먼저 다 풀어요. 1번부터 순서대로 풀 필요 없어요.',
        '② 모르면 [보기 지우고 찍기]. 빈칸은 0점, 찍으면 20%. 빈칸 절대 금지.',
        '③ 5점짜리 어려운 문제에 [시간 쓰지 않기]. 보자마자 찍고 넘어가요.',
        '④ 마지막 5분은 [OMR 확인]. 번호 밀리지 않았는지, 빈칸 없는지.',
        '⑤ 월요일 아침: [암기 시트 한 장]만 두 번 읽고 들어가요. 폰 없이도 돼요.'] },
      { type: 'talk', title: '오늘 외운 것, 한 번만 더', lines: [
        '③ 대각선 [n(n−3)÷2] · 내각의 합 [180×(n−2)] · 한 외각 [360÷n] · 외각 = [두 내각의 합] · 별 [180 / 540]',
        '② 도구 [자·컴퍼스] · 순서 [원→원→길이 재기→원→선] · 합동 [SSS·SAS·ASA]',
        '④ [호·현·할선·부채꼴·활꼴] · [각:각 = 호:호] · 반원 [180°] · 현은 비례 [✗]',
        '① 교점 = [꼭짓점 수] · 교선 = [모서리 수] · 맞꼭지각 [같다] · 동위각 [같은 자리] · 엇각 [Z]',
        '잘했어요. 내일 50점 넘기면 선생님이 쏜다!'] }
    ]
  };
})();
