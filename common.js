// 학습 웹 공통 코드: Firebase 연결, 저장소, 아바타
const firebaseConfig = {
  apiKey: "AIzaSyByJu2zp1c1_mVqV6KByF6RPr2dsV9Lg28",
  authDomain: "study-web-a61c8.firebaseapp.com",
  databaseURL: "https://study-web-a61c8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "study-web-a61c8",
  storageBucket: "study-web-a61c8.firebasestorage.app",
  messagingSenderId: "79039414739",
  appId: "1:79039414739:web:deba68e59c2349070b6f26"
};

const CLASS_ID = 'gusan1';            // 반 하나 = 폴더 하나. 반이 늘면 이 값만 달라짐
const BASE = 'classes/' + CLASS_ID;
const MOCK = new URLSearchParams(location.search).has('mock'); // ?mock = 연습용(저장 안 됨)

const HAIRS = ['#F29BB5', '#7CC7B0', '#9B8CE0', '#F2B24C', '#6B4A3A', '#2F2A33'];
const HAIR_NAMES = ['분홍', '민트', '보라', '노랑', '갈색', '검정'];
const STYLES = ['단발', '긴 곱슬머리', '양갈래', '똥머리'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function avatarSVG(a, size) {
  a = a || {};
  const h = a.hair || '#D9CFD3';
  const s = a.style || 0;
  let back = '<rect x="7" y="18" width="34" height="18" rx="8" fill="' + h + '"/>';
  if (s === 1) back = [[8, 23, 6.5], [6.5, 31, 6.5], [8, 39, 6.5], [13, 44, 4], [40, 23, 6.5], [41.5, 31, 6.5], [40, 39, 6.5], [35, 44, 4]]
    .map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + h + '"/>').join('');
  if (s === 3) back = '<circle cx="24" cy="7" r="6.5" fill="' + h + '"/>';
  if (s === 2) back = '<circle cx="5.5" cy="31" r="6" fill="' + h + '"/><circle cx="42.5" cy="31" r="6" fill="' + h + '"/>';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 48 48" aria-hidden="true">' + back +
    '<circle cx="24" cy="26" r="15" fill="#FFE2CF"/>' +
    '<path d="M8 26c0-12 7-19 16-19s16 7 16 19c-3-7-8-10-16-10S11 19 8 26z" fill="' + h + '"/>' +
    '<circle cx="18" cy="28" r="1.8" fill="#4A3B47"/><circle cx="30" cy="28" r="1.8" fill="#4A3B47"/>' +
    '<circle cx="14.5" cy="32" r="2.2" fill="#FFC2C2"/><circle cx="33.5" cy="32" r="2.2" fill="#FFC2C2"/>' +
    '<path d="M20 34q4 3 8 0" stroke="#4A3B47" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
}

async function hashPin(salt, pin) {
  const data = new TextEncoder().encode(salt + ':' + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function local(key, val) {
  try {
    if (val === undefined) return localStorage.getItem(key);
    if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
  } catch (e) { }
  return null;
}

// ----- 저장소: 실제(Firebase)와 연습용(메모리) 두 가지가 같은 사용법 -----
function makeMockStore() {
  const KEY = 'sw_mock';
  const seed = () => ({ classes: { gusan1: {
    students: {
      s1: { name: '하늘' },
      s2: { name: '보리', avatar: { hair: HAIRS[1], style: 1 }, pinHash: 'x' },
      s3: { name: '망고', avatar: { hair: HAIRS[3], style: 2 }, pinHash: 'x' }
    },
    presence: { s2: true }
  } } });
  let tree;
  const load = () => { try { const s = localStorage.getItem(KEY); tree = s ? JSON.parse(s) : seed(); } catch (e) { tree = tree || seed(); } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tree)); } catch (e) { } };
  if (new URLSearchParams(location.search).get('mock') === 'reset') { try { localStorage.removeItem(KEY); } catch (e) { } }
  load();
  const subs = [];
  const parts = p => p.split('/').filter(Boolean);
  const clone = v => (v === undefined || v === null) ? null : JSON.parse(JSON.stringify(v));
  const read = p => { let n = tree; for (const k of parts(p)) { if (n == null || typeof n !== 'object') return null; n = n[k]; } return n === undefined ? null : n; };
  const fire = () => subs.forEach(s => s.cb(clone(read(s.p))));
  const write = (p, v) => {
    const ks = parts(p); let n = tree;
    for (let i = 0; i < ks.length - 1; i++) { if (typeof n[ks[i]] !== 'object' || n[ks[i]] === null) n[ks[i]] = {}; n = n[ks[i]]; }
    if (v === null) delete n[ks[ks.length - 1]]; else n[ks[ks.length - 1]] = v;
  };
  const commit = () => { save(); fire(); };
  window.addEventListener('storage', e => { if (e.key === KEY) { load(); fire(); } });
  return {
    get: async p => clone(read(p)),
    set: async (p, v) => { load(); write(p, clone(v)); commit(); },
    update: async (p, o) => { load(); Object.keys(o).forEach(k => write(p + '/' + k, clone(o[k]))); commit(); },
    remove: async p => { load(); write(p, null); commit(); },
    on: (p, cb) => { subs.push({ p, cb }); cb(clone(read(p))); },
    presence: p => { load(); write(p, true); commit(); },
    newId: () => 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
    now: () => Date.now()
  };
}

function makeFirebaseStore() {
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  let offset = 0;
  db.ref('.info/serverTimeOffset').on('value', s => { offset = s.val() || 0; });
  return {
    get: p => db.ref(p).get().then(s => s.val()),
    set: (p, v) => db.ref(p).set(v),
    update: (p, o) => db.ref(p).update(o),
    remove: p => db.ref(p).remove(),
    on: (p, cb) => db.ref(p).on('value', s => cb(s.val())),
    presence: p => {
      db.ref('.info/connected').on('value', s => {
        if (s.val()) { db.ref(p).onDisconnect().remove(); db.ref(p).set(true); }
      });
    },
    newId: () => db.ref().push().key,
    now: () => Date.now() + offset
  };
}

function makeStore() { return MOCK ? makeMockStore() : makeFirebaseStore(); }

// 접속 기록: 아이가 단어장·복습·오답노트에 언제 들어갔는지 남깁니다 (선생님 포털에서 봄)
function logVisit(store, sid, kind, extra) {
  if (!sid) return null;
  const p = BASE + '/visits/' + sid + '/' + store.newId();
  try { Promise.resolve(store.set(p, Object.assign({ k: kind, at: store.now() }, extra || {}))).catch(() => { }); } catch (e) { }
  return p;
}

// ----- 퀴즈 공통 -----
function markQ(q) { return esc(q).replace(/\[(.+?)\]/, '<mark>$1</mark>'); }
function choicesOf(set, item) { return item.choices || set.choices; }
function answerOf(live, qi, sid) { const a = ((live && live.answers) || {})['q' + qi]; return a && a[sid] != null ? a[sid] : null; }
function correctCount(live, set, sid) {
  let n = 0;
  set.items.forEach((it, i) => { if (answerOf(live, i, sid) === it.a) n++; });
  return n;
}

// ----- 효과음 (파일 없이 브라우저가 직접 만드는 소리) -----
const Sound = (function () {
  let ctx = null;
  function ac() {
    try {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  // 소리 장치가 아직 잠들어 있으면(아이폰·아이패드) 깨운 뒤에 소리를 냅니다
  function ready(fn) {
    const c = ac(); if (!c) return;
    if (c.state === 'running') fn(c); else c.resume().then(() => fn(c)).catch(() => { });
  }
  function tone(f, t0, dur, vol, type) { ready(c => {
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }); }
  function bell(f, t0, vol) { tone(f, t0, 0.9, vol); tone(f * 2, t0, 0.5, vol * 0.35); tone(f * 3, t0, 0.25, vol * 0.15); }
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => window.addEventListener(ev, () => ac(), { passive: true }));
  return {
    // 버튼 소리: 스페이스 서바이버의 메뉴 선택음과 같은 맑은 종소리 두 음 (띠-룽)
    tap: () => ready(c => {
      const t = c.currentTime, f = m => 440 * Math.pow(2, (m - 69) / 12);
      [[88, 0], [95, 0.09]].forEach(q => [[0, 0.16, 'sine'], [12, 0.05, 'sine'], [19, 0.025, 'triangle']].forEach(h => {
        const o = c.createOscillator(), g = c.createGain(), st = t + q[1];
        o.type = h[2]; o.frequency.value = f(q[0] + h[0]);
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(h[1], st + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.75);
        o.connect(g); g.connect(c.destination); o.start(st); o.stop(st + 0.8);
      }));
    }),
    tick: () => tone(880, 0, 0.14, 0.25),
    dingdong: () => { bell(1318.5, 0, 0.3); bell(1046.5, 0.28, 0.3); },
    good: () => { bell(1046.5, 0, 0.25); bell(1318.5, 0.12, 0.25); bell(1568, 0.24, 0.3); },
    soft: () => { tone(523.3, 0, 0.35, 0.2); tone(440, 0.18, 0.45, 0.2); },
    fanfare: () => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => bell(f, i * 0.15, 0.28))
  };
})();

// ----- 화면 맞춤: 두 번 터치 확대 막기 + 내용을 한 화면에 딱 맞추기 -----
(function () {
  const vp = document.querySelector('meta[name=viewport]');
  if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  document.head.insertAdjacentHTML('beforeend', '<style>html,body,button,a{touch-action:manipulation}body{overscroll-behavior:none}</style>');
  // 배경 사진: 학생·수업·선생님 화면 어디서나 책상 사진이 뒤에 깔립니다 (세로 화면은 세로 사진)
  document.head.insertAdjacentHTML('beforeend', '<style>body::before{content:"";position:fixed;left:0;top:0;width:100vw;height:100vh;height:100lvh;z-index:-1;pointer-events:none;background:#FFF4EE url(assets/bg_wide.webp) center bottom/cover no-repeat}' +
    '@media (orientation:portrait){body::before{background-image:url(assets/bg_phone.webp)}}</style>');
  // 글씨체: 프리텐다드 (요즘 앱에서 흔히 쓰는 깔끔한 고딕). 제목은 굵게, 본문은 보통 굵기
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css">' +
    '<style>body,button,input,h1,h2,.brand,.stu .name{font-family:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif !important;letter-spacing:-0.01em}' +
    'body{font-weight:500}' +
    'h1,h2,.brand,.hero-t,.qtext,.bignum,.banner,.big,.go,.choice,.key,.name-btn,.d-card,.n-btn,.lb-card,.n-item,.cd,.lz-big,.lz-catname,.lz-card,.chip,.st-num,.stu .name{font-weight:700}' +
    '.d-card small,.n-btn small,.lb-card small,.n-item small,.sub,.key.small,.ghost{font-weight:500}</style>');
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  // 수업 화면에서 키보드(화살표·스페이스)로 넘길 때도 버튼과 같은 소리
  document.addEventListener('keydown', e => { if (typeof lessonMove === 'function' && ['ArrowRight', 'ArrowLeft', ' '].includes(e.key)) Sound.tap(); });

  // 학생 화면과 수업 화면(<main id="app">)만 맞춥니다. 선생님 포털은 길어지면 스크롤합니다
  const app = document.getElementById('app');
  if (!app || app.tagName !== 'MAIN') return;
  let queued = false;
  function fit() {
    queued = false;
    const H = window.innerHeight;
    let z = 1;
    app.style.zoom = ''; app.style.minHeight = H + 'px';
    for (let i = 0; i < 3; i++) {
      const h = app.getBoundingClientRect().height;
      if (h <= H + 1) break;
      z *= H / h;
      app.style.zoom = z; app.style.minHeight = (H / z) + 'px';
    }
  }
  function ask() { if (!queued) { queued = true; requestAnimationFrame(fit); } }
  // ----- 꾸미기: 화면이 그려질 때마다 크림이 그림, 아이콘, 도장을 얹습니다 -----
  const art = (name, cls) => '<img class="art ' + (cls || '') + '" src="assets/' + name + '.webp" alt="" draggable="false">';
  const isStage = !!document.title && document.title.indexOf('수업') >= 0;
  document.head.insertAdjacentHTML('beforeend', '<style>' +
    'img.art{display:block;user-select:none;-webkit-user-drag:none;pointer-events:none}' +
    '.hero{display:flex;flex-direction:column;align-items:center;gap:2px}.hero img{width:' + (isStage ? 'clamp(110px,16vh,190px)' : '168px') + ';height:auto}' +
    '.hero-t{font-size:' + (isStage ? 'clamp(26px,3.6vw,46px)' : '32px') + '}' +
    '.banner img.art{width:132px;height:auto;margin:0 auto 6px}' +
    '.st-cell.done img.art{width:86%;height:auto}' +
    '.d-card,.n-btn,.lb-card{flex-direction:row !important;gap:14px !important;text-align:left}.d-card img.art,.n-btn img.art,.lb-card img.art{width:56px;height:auto;flex:none}' +
    '.btn-t{display:flex;flex-direction:column;gap:2px}' +
    '.lz-cat img.art{width:clamp(70px,9vw,120px);height:auto}' +
    '.cheer-img{display:flex;justify-content:center}.cheer-img img{width:150px;height:auto}' +
    '#bgmBtn{position:fixed;top:10px;right:10px;z-index:5;min-height:40px;padding:0 14px;border-radius:999px;border:none;background:#fff;color:#6B5764;font-family:inherit;font-size:14px;box-shadow:0 1px 4px rgba(74,59,71,.15)}</style>');

  function wrapText(btn) {   // 버튼 안 글자를 한 덩어리로 묶어 그림 옆에 둡니다
    const box = document.createElement('span'); box.className = 'btn-t';
    while (btn.firstChild) box.appendChild(btn.firstChild);
    btn.appendChild(box);
  }
  function deco() {
    const names = app.querySelector('.names'), sets = app.querySelector('.sets');
    const calm = !!names || !!app.querySelector('.keys') || !!app.querySelector('.swatches') || (isStage && !!sets && !app.querySelector('.top'));
    document.body.classList.toggle('landing', !!names || (isStage && calm));
    const h1 = app.querySelector('h1');
    if (h1 && !app.querySelector('.hero')) {
      if (names) h1.insertAdjacentHTML('beforebegin', '<div class="hero">' + art('cream_hello') + '<div class="hero-t">크림이네 공부방</div></div>');
      else if (isStage && calm) h1.insertAdjacentHTML('beforebegin', '<div class="hero">' + art('cream_sit') + '<div class="hero-t">크림이네 공부방</div></div>');
    }
    app.querySelectorAll('.banner.good:not(.art-on)').forEach(e => { e.classList.add('art-on'); e.insertAdjacentHTML('afterbegin', art('cream_happy')); });
    app.querySelectorAll('.banner.soft:not(.art-on)').forEach(e => { e.classList.add('art-on'); e.insertAdjacentHTML('afterbegin', art('cream_cheer')); });
    app.querySelectorAll('.st-cell.done svg').forEach(e => { e.outerHTML = art('stamp_complete'); });
    app.querySelectorAll('.d-card:not(.art-on)').forEach(e => { e.classList.add('art-on'); wrapText(e); e.insertAdjacentHTML('afterbegin', art('icon_english')); });
    app.querySelectorAll('.n-btn:not(.art-on)').forEach(e => { e.classList.add('art-on'); wrapText(e); e.insertAdjacentHTML('afterbegin', art('obj_pencil')); });
    app.querySelectorAll('.lb-card[data-art]:not(.art-on)').forEach(e => { e.classList.add('art-on'); wrapText(e); e.insertAdjacentHTML('afterbegin', art(e.dataset.art)); });
    app.querySelectorAll('.lz-cat:not(.art-on)').forEach(e => {
      e.classList.add('art-on');
      const n = e.querySelector('.lz-catname'), svg = e.querySelector('svg');
      const pic = n && { '물건': 'obj_apple', '장소': 'obj_school' }[n.textContent];
      if (pic && svg) svg.outerHTML = art(pic);
    });
    Bgm.want(calm);
  }

  // ----- 배경음악: 첫 화면(로그인 전)과 수업 화면 대기실에서만 잔잔하게 -----
  const Bgm = (function () {
    let audio = null, wanted = false, unlocked = false, off = local('sw_bgm') === 'off';
    const btn = document.createElement('button');
    btn.id = 'bgmBtn'; btn.type = 'button'; btn.hidden = true; document.body.appendChild(btn);
    function label() { btn.textContent = off ? '음악 켜기' : '음악 끄기'; }
    function sync() {
      btn.hidden = !wanted; label();
      if (!unlocked) return;
      if (wanted && !off) {
        if (!audio) { audio = new Audio('assets/bgm_home.mp3'); audio.loop = true; audio.volume = 0.3; }
        audio.play().catch(() => { });
      } else if (audio) audio.pause();
    }
    btn.addEventListener('click', () => { off = !off; local('sw_bgm', off ? 'off' : 'on'); unlocked = true; sync(); });
    ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (!unlocked) { unlocked = true; sync(); } }, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (document.hidden && audio) audio.pause(); else sync(); });
    return { want: function (w) { if (w !== wanted) { wanted = w; sync(); } } };
  })();

  new MutationObserver(() => { deco(); ask(); }).observe(app, { childList: true, subtree: true });
  deco();
  window.addEventListener('resize', ask);
  window.addEventListener('load', ask);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ask);
  ask();
})();
