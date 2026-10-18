// 수학 확인 문제(mathquiz.js)용 그림. window.MATHFIG(k, i) → 문제 위에 넣을 SVG 문자열 (모르는 값은 빨간 ?)
(function () {
  const D = Math.PI / 180;
  const f = v => (+v).toFixed(1);
  const reg = (n, cx, cy, r, rot) => Array.from({ length: n }, (_, i) => { const a = ((rot == null ? 90 : rot) - 360 * i / n) * D; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; });
  const poly = (P, cls) => '<polygon class="' + (cls || 'fe') + '" points="' + P.map(p => f(p[0]) + ',' + f(p[1])).join(' ') + '"/>';
  const ln = (a, b, cls) => '<line class="' + (cls || 'fl') + '" x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '"/>';
  const dot = (p, r) => '<circle class="fv" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + (r || 5) + '"/>';
  const T = (x, y, t, cls) => '<text class="' + (cls || 'ft') + '" x="' + f(x) + '" y="' + f(y) + '">' + t + '</text>';
  const ang = (a, b) => Math.atan2(-(b[1] - a[1]), b[0] - a[0]) / D;
  const norm = a => ((a % 360) + 360) % 360;
  const at = (c, r, a) => [c[0] + r * Math.cos(a * D), c[1] - r * Math.sin(a * D)];
  // c 에서 from → to 사이 부채꼴. mid 방향이 들어 있는 쪽으로 그립니다
  const wedge = (c, r, from, to, mid, color) => {
    let a0 = norm(from), span = norm(to - from); if (norm(mid - from) > span) { a0 = norm(to); span = 360 - span; }
    const n = Math.max(2, Math.round(span / 6)), pts = ['M' + f(c[0]) + ',' + f(c[1])];
    for (let i = 0; i <= n; i++) { const p = at(c, r, a0 + span * i / n); pts.push('L' + f(p[0]) + ',' + f(p[1])); }
    return { svg: '<path d="' + pts.join(' ') + 'Z" fill="' + color + '" fill-opacity=".55" stroke="' + color + '" stroke-width="2"/>', mid: a0 + span / 2 };
  };
  const ext = (a, b, len) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); return [b[0] + (b[0] - a[0]) / d * len, b[1] + (b[1] - a[1]) / d * len]; };
  const cen = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  // 다각형 P 의 i 번째 꼭짓점 내각 / 외각
  function inner(P, i, color, label, cls, r) {
    const n = P.length, c = P[i], w = wedge(c, r || 26, ang(c, P[(i + 1) % n]), ang(c, P[(i + n - 1) % n]), ang(c, cen(P)), color);
    const p = at(c, (r || 26) + 20, w.mid); return w.svg + T(p[0], p[1] + 7, label, cls || 'ft');
  }
  function outer(P, i, color, label, cls, r) {
    const n = P.length, c = P[i], e = ext(P[(i + n - 1) % n], c, 46);
    let d = norm(ang(c, e) - ang(c, P[(i + 1) % n])); if (d > 180) d -= 360;
    const w = wedge(c, r || 26, ang(c, P[(i + 1) % n]), ang(c, e), ang(c, P[(i + 1) % n]) + d / 2, color);
    const p = at(c, (r || 26) + 20, w.mid); return ln(c, e, 'fd') + w.svg + T(p[0], p[1] + 7, label, cls || 'ft');
  }
  // 삼각형: A(왼쪽 아래)·C(오른쪽 아래), ∠A = a, ∠B = b → B 는 위. C 에서 AC 를 오른쪽으로 늘린 외각
  function tri(a, b, la, lb, lext) {
    const c = 180 - a - b, k = Math.sin(c * D) / Math.sin(b * D) * Math.sin(a * D);   // 높이 = 밑변 × k
    const L = Math.min(176, 118 / k), x0 = 40 + (176 - L) / 2;                            // 위 글씨와 겹치지 않게 높이 128 이하로
    const A = [x0, 190], C = [x0 + L, 190], AB = L * Math.sin(c * D) / Math.sin(b * D), B = at(A, AB, a), E = [Math.min(300, x0 + L + 84), 190];
    let s = poly([A, B, C]) + ln(C, E, 'fd');
    s += wedge(A, 30, 0, a, a / 2, '#F29BB5').svg + wedge(B, 30, ang(B, A), ang(B, C), ang(B, [(A[0] + C[0]) / 2, 190]), '#8DB8FF').svg + wedge(C, 34, 0, 180 - c, (180 - c) / 2, '#58B894').svg;
    const pa = at(A, 52, a / 2), pb = at(B, 52, ang(B, [(A[0] + C[0]) / 2, 190])), pc = at(C, 56, (180 - c) / 2);
    s += T(pa[0], pa[1] + 7, la, la === '?' ? 'fq' : 'ft') + T(pb[0], pb[1] + 7, lb, lb === '?' ? 'fq' : 'ft') + T(pc[0], pc[1] + 7, lext, lext === '?' ? 'fq' : 'ft');
    s += T(A[0] - 12, A[1] + 22, 'A', 'fn') + T(B[0], B[1] - 12, 'B', 'fn') + T(C[0], C[1] + 22, 'C', 'fn');
    return s;
  }
  const head = t => T(160, 24, t, 'fh');
  const F = {
    1: [
      () => { const P = reg(7, 160, 120, 80); return head('칠각형 · 대각선은 모두 ?개') + poly(P) + P.map(p => dot(p)).join(''); },
      () => { const P = reg(8, 160, 122, 82); let s = head('한 꼭짓점에서 대각선 5개 → ?각형'); s += ln(P[0], P[1]) + ln(P[0], P[7]); for (let k = 2; k <= 6; k++) s += ln(P[0], P[k], 'fg'); return s + P.map((p, i) => i === 0 ? '<circle class="fy" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="8"/>' : dot(p)).join(''); },
      () => { const P = [[80, 52], [240, 52], [240, 192], [80, 192]]; return head('사각형 · 대각선은 모두 ?개') + poly(P) + P.map(p => dot(p)).join(''); }
    ],
    2: [
      () => head('두 내각이 40°, 75° → 외각 ?') + tri(40, 75, '40°', '75°', '?'),
      () => head('두 내각이 55°, 55° → 외각 ?') + tri(55, 55, '55°', '55°', '?'),
      () => head('외각 125°, 한 내각 45° → 나머지 내각 ?') + tri(45, 80, '45°', '?', '125°')
    ],
    3: [
      () => { const P = reg(8, 160, 122, 82, 112.5); return head('팔각형 · 내각의 합 = ?') + poly(P) + P.map(p => dot(p)).join(''); },
      () => { const P = reg(5, 160, 128, 86); let s = head('오각형 · 안에 삼각형 ?개') + poly(P); s += ln(P[0], P[2], 'fg') + ln(P[0], P[3], 'fg'); return s + P.map(p => dot(p)).join(''); },
      () => { const P = reg(6, 160, 124, 84, 90); return head('정육각형 · 한 내각 = ?') + poly(P) + inner(P, 1, '#F29BB5', '?', 'fq') + P.map(p => dot(p)).join(''); }
    ],
    4: [
      () => { const P = reg(5, 160, 126, 70); let s = head('오각형 · 외각 다섯 개의 합 = ?') + poly(P); const C = ['#F29BB5', '#F2B24C', '#58B894', '#8DB8FF', '#C9A7F0']; P.forEach((p, i) => { s += outer(P, i, C[i], '', 'ft', 22); }); return s + P.map(p => dot(p)).join(''); },
      () => { const P = reg(8, 160, 124, 76, 112.5); return head('정팔각형 · 한 외각 = ?') + poly(P) + outer(P, 1, '#58B894', '?', 'fq') + P.map(p => dot(p)).join(''); },
      () => {   // 정다각형의 일부만: 꼭짓점 3개와 외각 60°, 나머지는 점선으로 '…'
        const P = reg(6, 160, 140, 92, 120), V = [P[5], P[0], P[1], P[2]];
        let s = head('한 외각이 60°인 정?각형');
        s += ln(V[0], V[1]) + ln(V[1], V[2]) + ln(V[2], V[3]) + ln(P[4], V[0], 'fx') + ln(V[3], P[3], 'fx');
        s += outer(P, 1, '#58B894', '60°', 'ft');
        return s + V.map(p => dot(p)).join('') + T(160, 214, '⋯ 나머지는 몇 개? ⋯', 'fn');
      }
    ]
  };
  window.MATHFIG = (k, i) => { const g = F[k] && F[k][i]; return g ? '<svg class="qz-svg" viewBox="0 0 320 222" role="img" aria-label="문제 그림">' + g() + '</svg>' : ''; };
})();
