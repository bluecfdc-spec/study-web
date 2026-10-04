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
const STYLES = ['단발', '긴 머리', '양갈래'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function avatarSVG(a, size) {
  a = a || {};
  const h = a.hair || '#D9CFD3';
  const s = a.style || 0;
  let back = '<rect x="7" y="18" width="34" height="18" rx="8" fill="' + h + '"/>';
  if (s === 1) back = '<rect x="7" y="18" width="34" height="29" rx="9" fill="' + h + '"/>';
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
  const tree = {
    classes: { gusan1: {
      students: {
        s1: { name: '하늘', avatar: { hair: HAIRS[0], style: 0 }, pinHash: null },
        s2: { name: '보리', avatar: { hair: HAIRS[1], style: 1 }, pinHash: 'x' },
        s3: { name: '망고', avatar: { hair: HAIRS[3], style: 2 }, pinHash: 'x' }
      },
      presence: { s2: true }
    } }
  };
  delete tree.classes.gusan1.students.s1.avatar;
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
  let seq = 10;
  return {
    get: async p => clone(read(p)),
    set: async (p, v) => { write(p, v); fire(); },
    update: async (p, o) => { Object.keys(o).forEach(k => write(p + '/' + k, o[k])); fire(); },
    remove: async p => { write(p, null); fire(); },
    on: (p, cb) => { subs.push({ p, cb }); cb(clone(read(p))); },
    presence: p => { write(p, true); fire(); },
    newId: () => 's' + (seq++)
  };
}

function makeFirebaseStore() {
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
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
    newId: () => db.ref().push().key
  };
}

function makeStore() { return MOCK ? makeMockStore() : makeFirebaseStore(); }
