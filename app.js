/* Brewing Note — 커피 레시피 기록장 (데이터는 브라우저 localStorage에 저장) */

const STORE_KEY = 'brewnote:v1';
const ROASTS = ['라이트', '미디엄 라이트', '미디엄', '미디엄 다크', '다크'];
const TASTES = [
  ['acidity', '산미'],
  ['sweetness', '단맛'],
  ['body', '바디'],
  ['bitterness', '쓴맛'],
  ['aftertaste', '여운'],
];
const NOTE_COLORS = [
  ['#c8414b', '베리'],
  ['#e8873d', '시트러스'],
  ['#f0bf3a', '트로피컬'],
  ['#e9967a', '핵과'],
  ['#d57eb1', '플로럴'],
  ['#7b4b94', '와인·포도'],
  ['#6fa36b', '허브·티'],
  ['#c98a3e', '캐러멜'],
  ['#9c6b45', '견과'],
  ['#5b3a29', '초콜릿'],
  ['#b5562f', '스파이스'],
];
/* 플레이버 휠: [카테고리, 색, 세부 맛] — 색은 NOTE_COLORS와 같은 계열 */
const FLAVOR_WHEEL = [
  ['플로럴', '#d57eb1', ['자스민', '장미', '캐모마일', '라벤더', '오렌지꽃', '홍차']],
  ['베리', '#c8414b', ['딸기', '라즈베리', '블루베리', '블랙베리', '체리', '크랜베리']],
  ['시트러스', '#e8873d', ['레몬', '라임', '자몽', '오렌지', '귤', '베르가못']],
  ['핵과·과일', '#e9967a', ['복숭아', '살구', '자두', '사과', '배', '청포도']],
  ['트로피컬', '#f0bf3a', ['망고', '파인애플', '패션프루트', '리치', '파파야', '바나나']],
  ['와인·발효', '#7b4b94', ['적포도', '와인', '건포도', '럼', '위스키', '발효과일']],
  ['허브·티', '#6fa36b', ['녹차', '우롱차', '허브', '민트', '레몬그라스', '풀내음']],
  ['단맛', '#c98a3e', ['캐러멜', '꿀', '흑설탕', '메이플', '바닐라', '토피']],
  ['견과·곡물', '#9c6b45', ['아몬드', '헤이즐넛', '땅콩', '호두', '곡물', '토스트']],
  ['초콜릿', '#5b3a29', ['다크초콜릿', '밀크초콜릿', '코코아', '카카오닙']],
  ['스파이스', '#b5562f', ['시나몬', '정향', '후추', '넛맥', '생강', '카다멈']],
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => (v === '' || v == null || isNaN(+v) ? null : +v);
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ---------- 저장소 ---------- */
let db = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { /* 저장소 접근 불가 → 샘플로 시작 */ }
  return seed();
}
function normalize(d) {
  return {
    beans: Array.isArray(d?.beans) ? d.beans : [],
    recipes: Array.isArray(d?.recipes) ? d.recipes : [],
    journals: Array.isArray(d?.journals) ? d.journals : [],
    grinders: normalizeGrinders(d),
  };
}
function normalizeGrinders(d) {
  const out = { ...(d?.grinders && typeof d.grinders === 'object' ? d.grinders : {}) };
  // 이전 버전의 grinderRates(이름 → μm) 이전
  Object.entries(d?.grinderRates || {}).forEach(([k, v]) => { out[k] = { rate: v, ...out[k] }; });
  return out;
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
  catch (e) { toast('저장에 실패했어요. 브라우저 저장공간을 확인해주세요.'); }
}
function seed() {
  const b = { id: uid(), roastery: '샘플 로스터스', name: '에티오피아 구지 함벨라', origin: '에티오피아 구지', variety: '에어룸', process: '워시드', roast: 1, notes: '자스민, 레몬, 복숭아. 로스팅 후 7일차부터 맛이 열림.', createdAt: Date.now() };
  const r = {
    id: uid(), title: '아침용 V60 3푸어', beanId: b.id, dripper: 'V60 02', dose: 15, water: 240, time: '2:40', temp: 93,
    grinder: '코만단테 C40', clicks: 24, clickStep: 1, umPerClick: 30, umMin: 710, umMax: 740,
    steps: [{ t: '0:00', w: 40, note: '뜸들이기, 가볍게 스월' }, { t: '0:40', w: 140, note: '중앙에서 원 그리며' }, { t: '1:20', w: 240, note: '천천히 마무리' }],
    memo: '린싱은 충분히. 드로다운 2:40 전후면 OK.', createdAt: Date.now(),
  };
  const j = {
    id: uid(), date: today(), beanId: b.id, recipeId: r.id, rating: 4,
    taste: { acidity: 4, sweetness: 4, body: 2, bitterness: 1, aftertaste: 3 },
    notes: [{ text: '자스민', color: '#d57eb1' }, { text: '레몬', color: '#e8873d' }, { text: '복숭아', color: '#e9967a' }],
    feature: '식을수록 단맛이 올라오고 복숭아 느낌이 또렷해짐. 깔끔한 티 같은 질감.',
    feedback: '산미가 살짝 날카로움 → 다음엔 1클릭 곱게, 물온도 94도로.', createdAt: Date.now(),
  };
  const d = { beans: [b], recipes: [r], journals: [j], grinders: {} };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {}
  return d;
}

const findBean = (id) => db.beans.find((b) => b.id === id);
const findRecipe = (id) => db.recipes.find((r) => r.id === id);
const beanLabel = (b) => (b ? [b.roastery, b.name].filter(Boolean).join(' · ') : '');

/* ---------- 포맷 ---------- */
function ratio(dose, water) {
  if (!dose || !water) return null;
  return `1 : ${+(water / dose).toFixed(1)}`;
}
function toSec(t) {
  if (t == null || t === '') return null;
  const s = String(t).trim();
  if (/^\d+$/.test(s)) return +s;
  const m = s.match(/^(\d{1,2}):(\d{1,2})$/);
  return m ? +m[1] * 60 + +m[2] : null;
}
function fmtSec(s) {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
/* 그라인더 기본값: 1클릭(1눈금)당 대략적인 μm, 클릭 단위 (제조사 공개값 기준 근사치) */
const GRINDERS = [
  [/코만단테|comandante/i, 30, 1],
  [/k-?ultra/i, 200, 0.1], // 다이얼 숫자 표기: 1.0 = 10클릭 × 20μm
  [/k-?max|k-?plus/i, 22, 1],
  [/jx-?pro/i, 12.5, 1],
  [/j-?max/i, 8.8, 1],
  [/zp6/i, null, 0.1],
  [/ek\s?43/i, null, 0.1],
  [/킨우|kinu/i, null, 0.1],
];
const CLICK_STEPS = [[1, '정수 (24)'], [0.5, '0.5 단위 (6.5)'], [0.1, '소수 1자리 (6.3)'], [0.01, '소수 2자리 (6.25)']];
const decimals = (step) => (String(step).split('.')[1] || '').length;
const roundStep = (v, step = 1) => (v == null ? null : +(Math.round(v / step) * step).toFixed(decimals(step)));
function fmtClicks(v, step = 1) {
  if (v == null) return '–';
  return step < 1 ? v.toFixed(decimals(step)) : String(v);
}
function grinderInfo(name) {
  const g = (name || '').trim();
  const saved = db.grinders[g] || {};
  const b = GRINDERS.find(([re]) => re.test(g));
  return { rate: saved.rate ?? b?.[1] ?? null, step: saved.step ?? b?.[2] ?? 1 };
}
function rateFor(name, custom) {
  return custom || grinderInfo(name).rate;
}
function stepFor(r) {
  return r?.clickStep || grinderInfo(r?.grinder).step;
}
function estMicron(clicks, rate, step = 1) {
  if (clicks == null || !rate) return null;
  const c = clicks * rate;
  const half = (rate * step) / 2;
  const unit = rate * step >= 20 ? 10 : 1;
  return { center: Math.round(c), min: Math.round((c - half) / unit) * unit, max: Math.round((c + half) / unit) * unit };
}
function micronText(r) {
  const { umMin: a, umMax: b } = r;
  if (a != null && b != null) return a === b ? `${a} μm` : `${a}~${b} μm`;
  if (a != null || b != null) return `${a ?? b} μm`;
  return '';
}
function grindText(r) {
  const parts = [];
  if (r.clicks != null) parts.push(`${fmtClicks(r.clicks, stepFor(r))}클릭`);
  if (micronText(r)) parts.push(micronText(r));
  return parts.join(' · ');
}
function stars(n) {
  n = n || 0;
  return `<span class="stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(5 - n)}</span></span>`;
}
function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const v = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${a})`;
}
function chip(n, removable = false, i = 0) {
  return `<span class="chip" style="background:${hexToRgba(n.color, 0.16)};color:inherit">
    <span class="dot" style="background:${n.color}"></span>${esc(n.text)}
    ${removable ? `<button type="button" data-remove-note="${i}" aria-label="삭제">✕</button>` : ''}</span>`;
}
function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d)) return s;
  const w = '일월화수목금토'[d.getDay()];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${w})`;
}

/* ---------- 탭 & 검색 ---------- */
const query = { journal: '', recipes: '', beans: '' };

function showTab(name) {
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
  try { localStorage.setItem('brewnote:tab', name); } catch (e) {}
}
$$('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
$$('[data-search]').forEach((inp) => inp.addEventListener('input', () => {
  query[inp.dataset.search] = inp.value.trim().toLowerCase();
  renderAll();
}));
const matches = (q, ...fields) => !q || fields.join(' ').toLowerCase().includes(q);

/* ---------- 렌더링 ---------- */
function renderAll() {
  renderJournals();
  renderRecipes();
  renderBeans();
}

function emptyBox(title, desc) {
  return `<div class="empty"><strong>${title}</strong>${desc}</div>`;
}

function renderBeans() {
  const list = db.beans
    .filter((b) => matches(query.beans, b.roastery, b.name, b.origin, b.variety, b.process, b.notes))
    .sort((a, b) => b.createdAt - a.createdAt);
  $('#beanList').innerHTML = list.length ? list.map((b) => `
    <article class="card">
      <div>
        <div class="eyebrow">${esc(b.roastery)}</div>
        <div class="card-title">${esc(b.name || b.origin || '이름 없는 원두')}</div>
      </div>
      <div class="tags">
        ${[b.origin, b.variety, b.process].filter(Boolean).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
      ${b.roast != null ? `<div class="roast"><div class="roast-bar">${ROASTS.map((_, i) =>
        `<span style="${i <= b.roast ? `background:${roastColor(b.roast)}` : ''}"></span>`).join('')}</div>${ROASTS[b.roast]}</div>` : ''}
      ${b.notes ? `<p class="clamp">${esc(b.notes)}</p>` : ''}
      <div class="card-actions">
        <button class="btn small ghost" data-edit-bean="${b.id}">수정</button>
        <button class="btn small ghost danger" data-del-bean="${b.id}">삭제</button>
      </div>
    </article>`).join('')
    : emptyBox(query.beans ? '검색 결과가 없어요' : '아직 등록한 원두가 없어요', query.beans ? '' : '오른쪽 위 “+ 새 원두”로 첫 원두를 추가해보세요.');
}
function roastColor(i) {
  return ['#d9a46c', '#bb7d47', '#94582f', '#6e3d20', '#46261a'][i] || '#94582f';
}

function renderRecipes() {
  const list = db.recipes
    .filter((r) => matches(query.recipes, r.title, r.dripper, r.grinder, beanLabel(findBean(r.beanId))))
    .sort((a, b) => b.createdAt - a.createdAt);
  $('#recipeList').innerHTML = list.length ? list.map((r) => {
    const b = findBean(r.beanId);
    return `
    <button class="card" data-open-recipe="${r.id}">
      <div>
        <div class="eyebrow">${esc(r.dripper || '드리퍼 미지정')}</div>
        <div class="card-title">${esc(r.title)}</div>
        ${b ? `<div class="meta">${esc(beanLabel(b))}</div>` : ''}
      </div>
      <div class="stat-row">
        <div class="stat"><b>${r.dose ?? '–'}g</b><small>원두</small></div>
        <div class="stat"><b>${r.water ?? '–'}g</b><small>물</small></div>
        <div class="stat"><b>${ratio(r.dose, r.water)?.replace('1 : ', '1:') ?? '–'}</b><small>비율</small></div>
      </div>
      <div class="tags">
        ${r.temp != null ? `<span class="tag">${r.temp}°C</span>` : ''}
        ${r.time ? `<span class="tag">${esc(r.time)}</span>` : ''}
        ${r.grinder || grindText(r) ? `<span class="tag">${esc([r.grinder, grindText(r)].filter(Boolean).join(' '))}</span>` : ''}
      </div>
    </button>`;
  }).join('')
    : emptyBox(query.recipes ? '검색 결과가 없어요' : '아직 레시피가 없어요', query.recipes ? '' : '자주 쓰는 브루잉 레시피를 저장해보세요.');
}

function journalView(j) {
  const b = findBean(j.beanId) || j.beanSnap || null;
  const r = findRecipe(j.recipeId) || j.recipeSnap || null;
  return { b, r };
}

function renderJournals() {
  const list = db.journals
    .filter((j) => {
      const { b, r } = journalView(j);
      return matches(query.journal, beanLabel(b), b?.origin, r?.title, j.feature, j.feedback, (j.notes || []).map((n) => n.text).join(' '));
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);
  $('#journalList').innerHTML = list.length ? list.map((j) => {
    const { b, r } = journalView(j);
    return `
    <article class="card clickable" data-open-journal="${j.id}" tabindex="0">
      <div class="card-top">
        <span class="eyebrow">${fmtDate(j.date)}</span>
        ${stars(j.rating)}
      </div>
      <div>
        <div class="card-title">${esc(b ? b.name || b.origin || b.roastery : '원두 미지정')}</div>
        <div class="meta">${esc([b?.roastery, r?.title].filter(Boolean).join(' · '))}</div>
      </div>
      ${j.notes?.length ? `<div class="chips">${j.notes.map((n) => chip(n)).join('')}</div>` : ''}
      <div class="mini-taste">${TASTES.map(([k, label]) =>
        `<div><div class="bar"><i style="width:${(j.taste?.[k] || 0) * 20}%"></i></div>${label}</div>`).join('')}</div>
      ${j.feature ? `<p class="clamp">${esc(j.feature)}</p>` : ''}
    </article>`;
  }).join('')
    : emptyBox(query.journal ? '검색 결과가 없어요' : '첫 커피 일기를 남겨보세요', query.journal ? '' : '“+ 새 기록”을 눌러 오늘의 커피를 기록할 수 있어요.');
}

/* 상세 & 내보내기에 함께 쓰는 일기 카드 */
function journalCard(j) {
  const { b, r } = journalView(j);
  const recipeBits = r ? [
    r.dripper, r.dose != null && `${r.dose}g`, r.water != null && `${r.water}g`, ratio(r.dose, r.water),
    r.temp != null && `${r.temp}°C`, r.time, [r.grinder, grindText(r)].filter(Boolean).join(' '),
  ].filter(Boolean) : [];
  return `
  <div class="jcard">
    <div class="jc-head"><span>${fmtDate(j.date)}</span>${stars(j.rating)}</div>
    <div class="jc-bean">
      <small>${esc(b?.roastery || '')}</small>
      <h3>${esc(b ? b.name || b.origin || '이름 없는 원두' : '원두 미지정')}</h3>
      ${b ? `<p>${esc([b.origin, b.variety, b.process, b.roast != null && ROASTS[b.roast]].filter(Boolean).join(' · '))}</p>` : ''}
    </div>
    ${r ? `<div class="jc-recipe"><span class="name">${esc(r.title)}</span>${recipeBits.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
    ${j.notes?.length ? `<div class="jc-section"><h4>컵노트</h4><div class="chips">${j.notes.map((n) => chip(n)).join('')}</div></div>` : ''}
    <div class="jc-section"><h4>맛</h4><div class="jc-taste">${TASTES.map(([k, label]) => {
      const v = j.taste?.[k] || 0;
      return `<div class="jc-taste-row"><span>${label}</span><div class="segs">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= v ? 'on' : ''}"></i>`).join('')}</div><b>${v || '–'}</b></div>`;
    }).join('')}</div></div>
    ${j.feature || j.feedback ? `<div class="jc-cols">
      ${j.feature ? `<div class="jc-section"><h4>특징</h4><p>${esc(j.feature)}</p></div>` : '<div></div>'}
      ${j.feedback ? `<div class="jc-section"><h4>피드백</h4><p>${esc(j.feedback)}</p></div>` : ''}
    </div>` : ''}
    <div class="jc-foot"><span>☕ Brewing Note</span><span>${esc(j.date || '')}</span></div>
  </div>`;
}

/* ---------- 공통: 모달 ---------- */
$$('dialog').forEach((d) => {
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-close]')) d.close();
  });
});
function fillSelects(form) {
  $$('[data-bean-select]', form).forEach((s) => {
    s.innerHTML = `<option value="">선택 안 함</option>` +
      db.beans.map((b) => `<option value="${b.id}">${esc(beanLabel(b) || '이름 없는 원두')}</option>`).join('');
  });
  $$('[data-recipe-select]', form).forEach((s) => {
    s.innerHTML = `<option value="">선택 안 함</option>` +
      db.recipes.map((r) => `<option value="${r.id}">${esc(r.title)}</option>`).join('');
  });
}

/* ---------- 원두 폼 ---------- */
const beanDialog = $('#beanDialog');
const beanForm = $('#beanForm');
let beanEditing = null;
let roastVal = null;

$('#roastSeg').innerHTML = ROASTS.map((r, i) => `<button type="button" data-roast="${i}">${r}</button>`).join('');
$('#roastSeg').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-roast]');
  if (!btn) return;
  roastVal = roastVal === +btn.dataset.roast ? null : +btn.dataset.roast;
  paintRoast();
});
function paintRoast() {
  $$('#roastSeg button').forEach((b) => b.classList.toggle('on', +b.dataset.roast === roastVal));
}

/* 원산지: 국가 → 추천 산지 */
const ORIGINS = [
  ['에티오피아', ['예가체프', '구지', '시다마', '함벨라', '겔레나 아바야', '코체레', '리무', '짐마', '하라']],
  ['케냐', ['니에리', '키리냐가', '엠부', '무랑아', '키암부', '메루']],
  ['콜롬비아', ['우일라', '나리뇨', '카우카', '안티오키아', '톨리마', '킨디오', '산탄데르']],
  ['과테말라', ['안티구아', '우에우에테낭고', '아티틀란', '아카테낭고', '코반', '프라이하네스']],
  ['코스타리카', ['타라주', '웨스트 밸리', '센트럴 밸리', '트레스 리오스', '브룽카', '오로시']],
  ['파나마', ['보케테', '볼칸', '레나시미엔토']],
  ['브라질', ['세하도 미네이루', '술 지 미나스', '모지아나', '샤파다 지아만치나', '에스피리투 산투']],
  ['엘살바도르', ['산타 아나', '아파네카-일라마테펙', '찰라테낭고']],
  ['르완다', ['니야마셰케', '후예', '루치로', '가켄케', '냐마가베']],
  ['인도네시아', ['수마트라 만델링', '아체 가요', '자바', '술라웨시 토라자', '발리 킨타마니', '플로레스']],
  ['온두라스', ['산타 바르바라', '마르칼라', '코판', '오코테페케', '라파스']],
  ['니카라과', ['히노테가', '마타갈파', '누에바 세고비아']],
  ['부룬디', ['카얀자', '응고지', '무잉가', '키롱도']],
  ['탄자니아', ['킬리만자로', '음베야', '아루샤', '음빙가']],
  ['예멘', ['하라즈', '바니 마타르', '하이마', '사나']],
  ['페루', ['카하마르카', '쿠스코', '아마소나스', '푸노', '후닌']],
  ['볼리비아', ['카라나비', '융가스', '사마이파타']],
  ['멕시코', ['치아파스', '오악사카', '베라크루스', '푸에블라']],
  ['에콰도르', ['로하', '피친차', '임바부라']],
  ['우간다', ['엘곤산', '르웬조리']],
  ['중국', ['윈난', '푸얼', '바오산']],
  ['인도', ['치크마갈루르', '쿠르그', '아라쿠']],
  ['자메이카', ['블루마운틴']],
  ['미국 하와이', ['코나', '카우', '마우이']],
];
const POPULAR_COUNTRIES = 10;
const regionsOf = (country) => ORIGINS.find(([c]) => c === (country || '').trim())?.[1] || [];
// 이전 버전의 '에티오피아 구지' 같은 원산지를 국가/산지로 나눔
function splitOrigin(b) {
  if (b?.country != null || b?.region != null) return { country: b.country || '', region: b.region || '' };
  const o = (b?.origin || '').trim();
  const hit = ORIGINS.find(([c]) => o.startsWith(c));
  return hit ? { country: hit[0], region: o.slice(hit[0].length).trim() } : { country: o, region: '' };
}
$('#countryList').innerHTML = ORIGINS.map(([c]) => `<option value="${c}"></option>`).join('');
function paintOrigin() {
  const f = beanForm.elements;
  const country = f.country.value.trim();
  const region = f.region.value.trim();
  $('#countrySuggest').innerHTML = ORIGINS.slice(0, POPULAR_COUNTRIES).map(([c]) =>
    `<button type="button" class="${c === country ? 'on' : ''}" data-country="${c}">${c}</button>`).join('');
  const regions = regionsOf(country);
  $('#regionList').innerHTML = regions.map((r) => `<option value="${r}"></option>`).join('');
  $('#regionSuggest').innerHTML = regions.map((r) =>
    `<button type="button" class="${r === region ? 'on' : ''}" data-region="${r}">${r}</button>`).join('');
  const varieties = splitList(f.variety.value);
  $('#varietySuggest').innerHTML = VARIETIES.map((v) =>
    `<button type="button" class="${varieties.includes(v) ? 'on' : ''}" data-variety="${v}">${v}</button>`).join('');
  const process = f.process.value.trim();
  $('#processSuggest').innerHTML = PROCESSES.map((p) =>
    `<button type="button" class="${p === process ? 'on' : ''}" data-process="${p}">${p}</button>`).join('');
}
const VARIETIES = ['에어룸', '게이샤', '버번', '카투라', '카투아이', 'SL28', 'SL34', '티피카', '파카마라', '74110', '핑크 버번', '시드라'];
const PROCESSES = ['워시드', '내추럴', '허니', '무산소 발효', '카보닉 매서레이션', '세미 워시드', '웻 헐드'];
const splitList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
// 품종은 블렌드가 있어 여러 개 선택(쉼표로 구분), 가공방식은 하나만
$('#varietySuggest').addEventListener('click', (e) => {
  const v = e.target.closest('[data-variety]')?.dataset.variety;
  if (!v) return;
  const inp = beanForm.elements.variety;
  const list = splitList(inp.value);
  inp.value = (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(', ');
  paintOrigin();
});
$('#processSuggest').addEventListener('click', (e) => {
  const p = e.target.closest('[data-process]')?.dataset.process;
  if (!p) return;
  const inp = beanForm.elements.process;
  inp.value = inp.value.trim() === p ? '' : p;
  paintOrigin();
});
['variety', 'process'].forEach((k) => beanForm.elements[k].addEventListener('input', paintOrigin));
$('#countrySuggest').addEventListener('click', (e) => {
  const c = e.target.closest('[data-country]')?.dataset.country;
  if (!c) return;
  const f = beanForm.elements;
  if (f.country.value.trim() !== c) f.region.value = '';
  f.country.value = c;
  paintOrigin();
  f.region.focus();
});
$('#regionSuggest').addEventListener('click', (e) => {
  const r = e.target.closest('[data-region]')?.dataset.region;
  if (!r) return;
  beanForm.elements.region.value = r;
  paintOrigin();
});
['country', 'region'].forEach((k) => beanForm.elements[k].addEventListener('input', paintOrigin));

function openBean(id) {
  const b = id ? findBean(id) : null;
  beanEditing = b?.id || null;
  beanForm.reset();
  $('[data-title]', beanForm).textContent = b ? '원두 수정' : '새 원두';
  if (b) ['roastery', 'name', 'variety', 'process', 'notes'].forEach((k) => (beanForm.elements[k].value = b[k] ?? ''));
  const { country, region } = splitOrigin(b);
  beanForm.elements.country.value = country;
  beanForm.elements.region.value = region;
  paintOrigin();
  roastVal = b?.roast ?? null;
  paintRoast();
  beanDialog.showModal();
}
beanForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = beanForm.elements;
  const country = f.country.value.trim();
  const region = f.region.value.trim();
  const data = {
    roastery: f.roastery.value.trim(), name: f.name.value.trim(),
    country, region, origin: [country, region].filter(Boolean).join(' '),
    variety: f.variety.value.trim(), process: f.process.value.trim(), roast: roastVal, notes: f.notes.value.trim(),
  };
  if (beanEditing) Object.assign(findBean(beanEditing), data);
  else db.beans.push({ id: uid(), createdAt: Date.now(), ...data });
  save(); renderAll(); beanDialog.close();
  toast(beanEditing ? '원두를 수정했어요' : '원두를 추가했어요');
});

/* ---------- 레시피 폼 ---------- */
const recipeDialog = $('#recipeDialog');
const recipeForm = $('#recipeForm');
let recipeEditing = null;

function stepRow(s = {}) {
  const row = document.createElement('div');
  row.className = 'step-row';
  row.innerHTML = `
    <input data-k="t" placeholder="0:00" value="${esc(s.t ?? '')}" aria-label="시작 시간" />
    <input data-k="w" type="number" inputmode="decimal" placeholder="누적 g" value="${esc(s.w ?? '')}" aria-label="누적 물양" />
    <input data-k="note" placeholder="메모 (뜸들이기 등)" value="${esc(s.note ?? '')}" aria-label="메모" />
    <button type="button" class="x" aria-label="단계 삭제">✕</button>`;
  $('.x', row).addEventListener('click', () => row.remove());
  return row;
}
$('#addStep').addEventListener('click', () => {
  const rows = $('#stepRows');
  rows.appendChild(stepRow());
  rows.lastElementChild.querySelector('input').focus();
});
function updateRatio() {
  const f = recipeForm.elements;
  $('#ratioOut').textContent = ratio(num(f.dose.value), num(f.water.value)) || '–';
}
recipeForm.elements.dose.addEventListener('input', updateRatio);
recipeForm.elements.water.addEventListener('input', updateRatio);

/* 분쇄도: 클릭 → μm 자동 계산 (직접 고친 값은 덮어쓰지 않음) */
let umTouched = false;
let rateTouched = false;
let stepTouched = false;
recipeForm.elements.clickStep.innerHTML = CLICK_STEPS.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
function updateGrind() {
  const f = recipeForm.elements;
  const info = grinderInfo(f.grinder.value);
  if (!rateTouched) f.umPerClick.value = info.rate ?? '';
  if (!stepTouched) f.clickStep.value = info.step;
  const step = +f.clickStep.value || 1;
  f.clicks.step = step;
  f.clicks.placeholder = step < 1 ? (6.3).toFixed(decimals(step)) : '24';
  const rate = num(f.umPerClick.value);
  const clicks = num(f.clicks.value);
  const est = estMicron(clicks, rate, step);
  if (!umTouched) {
    f.umMin.value = est?.min ?? '';
    f.umMax.value = est?.max ?? '';
  }
  const hint = $('#grindHint');
  if (est) hint.textContent = `${step < 1 ? '1.0' : '1클릭'} ≈ ${rate}μm → ${fmtClicks(clicks, step)}클릭 ≈ ${est.center}μm${umTouched ? ' (μm 범위는 직접 입력한 값 유지)' : ''}`;
  else if (!rate) hint.textContent = '그라인더의 μm/클릭 값을 넣으면 클릭 수로 μm를 자동 계산해요. 직접 입력해도 돼요.';
  else hint.textContent = '클릭 수를 넣으면 μm를 자동 계산해요.';
}
['grinder', 'clicks'].forEach((k) => recipeForm.elements[k].addEventListener('input', updateGrind));
recipeForm.elements.umPerClick.addEventListener('input', () => { rateTouched = true; updateGrind(); });
recipeForm.elements.clickStep.addEventListener('change', () => {
  stepTouched = true;
  const f = recipeForm.elements;
  const step = +f.clickStep.value || 1;
  if (f.clicks.value !== '') f.clicks.value = fmtClicks(roundStep(num(f.clicks.value), step), step);
  updateGrind();
});
recipeForm.elements.clicks.addEventListener('change', () => {
  const f = recipeForm.elements;
  const step = +f.clickStep.value || 1;
  if (f.clicks.value !== '') f.clicks.value = fmtClicks(roundStep(num(f.clicks.value), step), step);
  updateGrind();
});
['umMin', 'umMax'].forEach((k) => recipeForm.elements[k].addEventListener('input', () => {
  const f = recipeForm.elements;
  umTouched = f.umMin.value !== '' || f.umMax.value !== '';
  updateGrind();
}));

function openRecipe(id) {
  const r = id ? findRecipe(id) : null;
  recipeEditing = r?.id || null;
  recipeForm.reset();
  fillSelects(recipeForm);
  $('[data-title]', recipeForm).textContent = r ? '레시피 수정' : '새 레시피';
  const f = recipeForm.elements;
  if (r) ['title', 'beanId', 'dripper', 'dose', 'water', 'time', 'temp', 'grinder', 'clicks', 'umPerClick', 'umMin', 'umMax', 'memo'].forEach((k) => (f[k].value = r[k] ?? ''));
  $('#stepRows').replaceChildren(...(r?.steps || []).map(stepRow));
  const info = grinderInfo(r?.grinder);
  rateTouched = r?.umPerClick != null && r.umPerClick !== info.rate;
  stepTouched = r?.clickStep != null && r.clickStep !== info.step;
  if (r) f.clickStep.value = stepFor(r);
  if (r?.clicks != null) f.clicks.value = fmtClicks(r.clicks, stepFor(r));
  const est = estMicron(r?.clicks, rateFor(r?.grinder, r?.umPerClick), stepFor(r));
  umTouched = (r?.umMin != null || r?.umMax != null) && !(est && est.min === r.umMin && est.max === r.umMax);
  updateRatio();
  updateGrind();
  recipeDialog.showModal();
}
recipeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = recipeForm.elements;
  const steps = $$('#stepRows .step-row').map((row) => ({
    t: $('[data-k="t"]', row).value.trim(),
    w: num($('[data-k="w"]', row).value),
    note: $('[data-k="note"]', row).value.trim(),
  })).filter((s) => s.t || s.w != null || s.note)
    .sort((a, b) => (toSec(a.t) ?? 1e9) - (toSec(b.t) ?? 1e9));
  const data = {
    title: f.title.value.trim(), beanId: f.beanId.value || null, dripper: f.dripper.value.trim(),
    dose: num(f.dose.value), water: num(f.water.value), time: f.time.value.trim(), temp: num(f.temp.value),
    grinder: f.grinder.value.trim(), clickStep: +f.clickStep.value || 1,
    clicks: roundStep(num(f.clicks.value), +f.clickStep.value || 1), umPerClick: num(f.umPerClick.value),
    umMin: num(f.umMin.value), umMax: num(f.umMax.value),
    steps, memo: f.memo.value.trim(),
  };
  if (data.umMin != null && data.umMax != null && data.umMin > data.umMax) [data.umMin, data.umMax] = [data.umMax, data.umMin];
  // 직접 바꾼 μm/클릭·클릭 단위는 그라인더 이름으로 기억해 다음에 자동 적용
  if (data.grinder && (rateTouched || stepTouched)) {
    const saved = { ...db.grinders[data.grinder] };
    if (rateTouched && data.umPerClick) saved.rate = data.umPerClick;
    if (stepTouched) saved.step = data.clickStep;
    db.grinders[data.grinder] = saved;
  }
  if (recipeEditing) delete findRecipe(recipeEditing).micro;
  if (recipeEditing) Object.assign(findRecipe(recipeEditing), data);
  else db.recipes.push({ id: uid(), createdAt: Date.now(), ...data });
  save(); renderAll(); recipeDialog.close();
  if (recipeEditing && currentRecipe === recipeEditing) renderRecipeView();
  toast(recipeEditing ? '레시피를 수정했어요' : '레시피를 추가했어요');
});

/* ---------- 일기 폼 ---------- */
const journalDialog = $('#journalDialog');
const journalForm = $('#journalForm');
let journalEditing = null;
let jState = { rating: 0, taste: {}, notes: [], color: NOTE_COLORS[0][0] };

$('#ratingInput').innerHTML = [1, 2, 3, 4, 5].map((i) => `<button type="button" data-star="${i}" aria-label="${i}점">★</button>`).join('');
$('#ratingInput').addEventListener('click', (e) => {
  const b = e.target.closest('[data-star]');
  if (!b) return;
  jState.rating = jState.rating === +b.dataset.star ? 0 : +b.dataset.star;
  paintJournalInputs();
});
$('#tasteInputs').innerHTML = TASTES.map(([k, label]) => `
  <div class="taste-row"><span>${label}</span>
    <div class="dots" data-taste="${k}">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-v="${i}">${i}</button>`).join('')}</div>
  </div>`).join('');
$('#tasteInputs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-v]');
  if (!b) return;
  const k = b.parentElement.dataset.taste;
  jState.taste[k] = jState.taste[k] === +b.dataset.v ? 0 : +b.dataset.v;
  paintJournalInputs();
});
$('#swatches').innerHTML = NOTE_COLORS.map(([c, label]) =>
  `<button type="button" class="swatch" data-color="${c}" style="background:${c}" title="${label}" aria-label="${label}"></button>`).join('') +
  '<span class="swatch-label" id="swatchLabel"></span>';
$('#swatches').addEventListener('click', (e) => {
  const b = e.target.closest('[data-color]');
  if (!b) return;
  jState.color = b.dataset.color;
  paintJournalInputs();
  $('#noteText').focus();
});
function addNote() {
  const inp = $('#noteText');
  const text = inp.value.trim();
  if (!text) return;
  text.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
    .forEach((t) => jState.notes.push({ text: t, color: jState.color }));
  inp.value = '';
  paintJournalInputs();
}
$('#addNote').addEventListener('click', addNote);
$('#noteText').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addNote(); }
});
$('#noteChips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-remove-note]');
  if (!b) return;
  jState.notes.splice(+b.dataset.removeNote, 1);
  paintJournalInputs();
});
journalForm.elements.recipeId.addEventListener('change', (e) => {
  const r = findRecipe(e.target.value);
  if (r?.beanId && findBean(r.beanId)) journalForm.elements.beanId.value = r.beanId;
});

function paintJournalInputs() {
  $$('#ratingInput button').forEach((b) => b.classList.toggle('on', +b.dataset.star <= jState.rating));
  $$('#tasteInputs .dots').forEach((row) => {
    const v = jState.taste[row.dataset.taste] || 0;
    $$('button', row).forEach((b) => b.classList.toggle('on', +b.dataset.v === v));
  });
  $$('#swatches .swatch').forEach((s) => s.classList.toggle('on', s.dataset.color === jState.color));
  $('#swatchLabel').textContent = NOTE_COLORS.find(([c]) => c === jState.color)?.[1] || '';
  $('#noteChips').innerHTML = jState.notes.map((n, i) => chip(n, true, i)).join('');
  $('#flavorWheel').innerHTML = wheelSvg(new Set(jState.notes.map((n) => n.text)));
}

/* ---------- 플레이버 휠 (SVG) ---------- */
function mixWhite(hex, t) {
  const v = parseInt(hex.slice(1), 16);
  const ch = (s) => Math.round(((v >> s) & 255) + (255 - ((v >> s) & 255)) * t).toString(16).padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}
function isLight(hex) {
  const v = parseInt(hex.slice(1), 16);
  return 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255) > 170;
}
function wheelSvg(selected) {
  const C = 200, R0 = 46, R1 = 112, R2 = 196;
  const total = FLAVOR_WHEEL.reduce((n, [, , fl]) => n + fl.length, 0);
  const step = 360 / total;
  const pt = (r, a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${(C + r * Math.cos(rad)).toFixed(2)},${(C + r * Math.sin(rad)).toFixed(2)}`;
  };
  const arc = (ri, ro, a0, a1) => {
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${pt(ri, a0)} L${pt(ro, a0)} A${ro},${ro} 0 ${large} 1 ${pt(ro, a1)} L${pt(ri, a1)} A${ri},${ri} 0 ${large} 0 ${pt(ri, a0)}Z`;
  };
  // 반지름 방향 글자: 왼쪽 절반은 뒤집어서 항상 바로 읽히게
  const label = (text, r, a, size, color, weight) => {
    const flip = a % 360 > 180;
    const [x, y] = pt(r, a).split(',');
    const rot = flip ? a + 90 : a - 90;
    return `<text x="${x}" y="${y}" transform="rotate(${rot.toFixed(2)} ${x} ${y})" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(text)}</text>`;
  };
  let a = 0;
  let inner = '', outer = '';
  FLAVOR_WHEEL.forEach(([cat, color, flavors]) => {
    const start = a;
    flavors.forEach((fl) => {
      const on = selected.has(fl);
      const fill = on ? color : mixWhite(color, 0.62);
      const ink = on ? (isLight(color) ? '#2b211b' : '#fff') : '#3b2a1f';
      outer += `<g class="wseg${on ? ' on' : ''}" data-flavor="${esc(fl)}" data-color="${color}" role="button" aria-pressed="${on}" aria-label="${esc(fl)}">
        <path d="${arc(R1, R2, a, a + step)}" fill="${fill}" />
        ${label(fl, (R1 + R2) / 2 + 4, a + step / 2, 11.5, ink, on ? 700 : 600)}</g>`;
      a += step;
    });
    const on = selected.has(cat);
    inner += `<g class="wseg${on ? ' on' : ''}" data-flavor="${esc(cat)}" data-color="${color}" role="button" aria-pressed="${on}" aria-label="${esc(cat)}">
      <path d="${arc(R0, R1, start, a)}" fill="${color}" opacity="${on ? 1 : 0.88}" />
      ${label(cat, (R0 + R1) / 2 + 2, (start + a) / 2, 11, isLight(color) ? '#2b211b' : '#fff', 700)}</g>`;
  });
  return `<svg class="wheel" viewBox="0 0 400 400" role="group" aria-label="플레이버 휠">
    ${outer}${inner}
    <circle cx="${C}" cy="${C}" r="${R0 - 1}" fill="#fffdf9" />
    <text x="${C}" y="${C - 7}" text-anchor="middle" font-size="12" font-weight="800" fill="#8a4b2a">FLAVOR</text>
    <text x="${C}" y="${C + 9}" text-anchor="middle" font-size="12" font-weight="800" fill="#8a4b2a">WHEEL</text>
  </svg>`;
}
$('#flavorWheel').addEventListener('click', (e) => {
  const seg = e.target.closest('[data-flavor]');
  if (!seg) return;
  const text = seg.dataset.flavor;
  const i = jState.notes.findIndex((n) => n.text === text);
  if (i >= 0) jState.notes.splice(i, 1);
  else jState.notes.push({ text, color: seg.dataset.color });
  paintJournalInputs();
});

function openJournal(id, preset = {}) {
  const j = id ? db.journals.find((x) => x.id === id) : null;
  journalEditing = j?.id || null;
  journalForm.reset();
  fillSelects(journalForm);
  $('[data-title]', journalForm).textContent = j ? '기록 수정' : '새 기록';
  const f = journalForm.elements;
  f.date.value = j?.date || today();
  f.recipeId.value = j?.recipeId && findRecipe(j.recipeId) ? j.recipeId : preset.recipeId || '';
  f.beanId.value = j?.beanId && findBean(j.beanId) ? j.beanId : preset.beanId || '';
  f.feature.value = j?.feature || '';
  f.feedback.value = j?.feedback || '';
  jState = {
    rating: j?.rating || 0,
    taste: { ...(j?.taste || {}) },
    notes: (j?.notes || []).map((n) => ({ ...n })),
    color: jState.color,
  };
  paintJournalInputs();
  journalDialog.showModal();
}
journalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('#noteText').value.trim()) addNote();
  const f = journalForm.elements;
  const b = findBean(f.beanId.value);
  const r = findRecipe(f.recipeId.value);
  const prev = journalEditing ? db.journals.find((x) => x.id === journalEditing) : null;
  // 원본 원두/레시피가 이미 삭제된 기록이면 보관된 사본을 유지
  const keepBean = !b && prev?.beanSnap && !findBean(prev.beanId);
  const keepRecipe = !r && prev?.recipeSnap && !findRecipe(prev.recipeId);
  const data = {
    date: f.date.value, beanId: b?.id || null, recipeId: r?.id || null,
    rating: jState.rating, taste: { ...jState.taste }, notes: jState.notes,
    feature: f.feature.value.trim(), feedback: f.feedback.value.trim(),
    // 원두·레시피가 나중에 삭제돼도 기록이 남도록 사본 보관
    beanSnap: b ? { ...b } : keepBean ? prev.beanSnap : null,
    recipeSnap: r ? { ...r } : keepRecipe ? prev.recipeSnap : null,
  };
  if (journalEditing) Object.assign(db.journals.find((x) => x.id === journalEditing), data);
  else db.journals.push({ id: uid(), createdAt: Date.now(), ...data });
  save(); renderAll(); journalDialog.close();
  if (journalEditing && detailDialog.open) openDetail(journalEditing);
  toast(journalEditing ? '기록을 수정했어요' : '오늘의 커피를 기록했어요');
});

/* ---------- 일기 상세 ---------- */
const detailDialog = $('#detailDialog');
let detailId = null;

function openDetail(id) {
  const j = db.journals.find((x) => x.id === id);
  if (!j) return;
  detailId = id;
  $('#detailBody').innerHTML = journalCard(j);
  if (!detailDialog.open) detailDialog.showModal();
}
$('#detailEdit').addEventListener('click', () => openJournal(detailId));
$('#detailDelete').addEventListener('click', () => {
  if (!confirm('이 기록을 삭제할까요?')) return;
  db.journals = db.journals.filter((j) => j.id !== detailId);
  save(); renderAll(); detailDialog.close(); toast('기록을 삭제했어요');
});
$('#detailPng').addEventListener('click', (e) => withBusy(e.currentTarget, () => exportPng(detailId)));
$('#detailPdf').addEventListener('click', (e) => withBusy(e.currentTarget, () => exportPdf([detailId])));
$('#exportAllPdf').addEventListener('click', (e) => {
  const ids = [...db.journals].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((j) => j.id);
  if (!ids.length) return toast('내보낼 기록이 없어요');
  withBusy(e.currentTarget, () => exportPdf(ids, `커피일기_전체_${today()}.pdf`));
});

/* ---------- 내보내기 (사진 / PDF) ---------- */
async function withBusy(btn, fn) {
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = '만드는 중…';
  try { await fn(); }
  catch (err) { console.error(err); toast('내보내기에 실패했어요. 인터넷 연결을 확인해주세요.'); }
  finally { btn.disabled = false; btn.textContent = label; }
}
async function capture(j) {
  if (!window.html2canvas) throw new Error('html2canvas 로드 실패');
  const stage = $('#exportStage');
  stage.innerHTML = journalCard(j);
  if (document.fonts?.ready) await document.fonts.ready;
  try {
    return await html2canvas(stage.firstElementChild, { scale: 2, backgroundColor: '#fbf7f2', logging: false });
  } finally {
    stage.innerHTML = '';
  }
}
function fileBase(j) {
  const { b } = journalView(j);
  const name = (b?.name || b?.origin || '커피').replace(/[\\/:*?"<>|]/g, '').slice(0, 30);
  return `커피일기_${j.date || today()}_${name}`;
}
async function exportPng(id) {
  const j = db.journals.find((x) => x.id === id);
  const canvas = await capture(j);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  download(blob, `${fileBase(j)}.png`);
  toast('사진으로 저장했어요');
}
async function exportPdf(ids, filename) {
  if (!window.jspdf) throw new Error('jsPDF 로드 실패');
  const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const pw = 210, ph = 297, m = 12;
  for (let i = 0; i < ids.length; i++) {
    const j = db.journals.find((x) => x.id === ids[i]);
    const canvas = await capture(j);
    let w = pw - m * 2;
    let h = (canvas.height / canvas.width) * w;
    if (h > ph - m * 2) { h = ph - m * 2; w = (canvas.width / canvas.height) * h; }
    if (i > 0) pdf.addPage();
    pdf.setFillColor(251, 247, 242);
    pdf.rect(0, 0, pw, ph, 'F');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', (pw - w) / 2, m, w, h);
  }
  const first = db.journals.find((x) => x.id === ids[0]);
  pdf.save(filename || `${fileBase(first)}.pdf`);
  toast('PDF로 저장했어요');
}
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- 레시피 전체화면 ---------- */
const recipeView = $('#recipeView');
let currentRecipe = null;
let timer = { start: 0, elapsed: 0, running: false, tick: null };

function openRecipeView(id) {
  currentRecipe = id;
  resetTimer();
  renderRecipeView();
  recipeView.hidden = false;
  document.body.style.overflow = 'hidden';
  recipeView.scrollTop = 0;
}
function closeRecipeView() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  resetTimer();
  recipeView.hidden = true;
  document.body.style.overflow = '';
  currentRecipe = null;
}
function renderRecipeView() {
  const r = findRecipe(currentRecipe);
  if (!r) return closeRecipeView();
  grindDraft = null;
  const b = findBean(r.beanId);
  const total = toSec(r.time);
  $('#rvContent').innerHTML = `
    <div>
      <div class="rv-eyebrow">${esc(r.dripper || 'BREW RECIPE')}</div>
      <div class="rv-title">${esc(r.title)}</div>
      ${b ? `<div class="rv-bean">${esc(beanLabel(b))}${[b.origin, b.process].filter(Boolean).length ? ' — ' + esc([b.origin, b.process, b.roast != null && ROASTS[b.roast]].filter(Boolean).join(' · ')) : ''}</div>` : ''}
    </div>
    <div class="rv-stats">
      <div class="rv-stat"><small>원두</small><b>${r.dose ?? '–'}<span>g</span></b></div>
      <div class="rv-stat"><small>물</small><b>${r.water ?? '–'}<span>g</span></b></div>
      <div class="rv-stat hl"><small>비율</small><b>${ratio(r.dose, r.water) ?? '–'}</b></div>
      <div class="rv-stat"><small>물 온도</small><b>${r.temp ?? '–'}<span>°C</span></b></div>
      <div class="rv-stat"><small>추출 시간</small><b>${esc(r.time || '–')}</b></div>
      <div class="rv-stat grind" id="grindStat" role="button" tabindex="0" title="눌러서 μm 확인·수정">${grindStatView(r)}</div>
    </div>
    <div class="rv-timer">
      <div class="rv-clock" id="rvClock">0:00</div>
      <div class="rv-timer-info">
        <div class="rv-next" id="rvNext">${r.steps?.length ? '시작을 누르면 단계를 안내해요' : '브루잉 타이머'}</div>
        ${total ? `<div class="rv-progress"><i id="rvProg"></i></div>` : ''}
      </div>
      <div class="rv-timer-btns">
        <button class="go" id="rvStart">시작</button>
        <button id="rvReset">리셋</button>
      </div>
    </div>
    ${r.steps?.length ? `<div class="rv-steps"><h3>푸어 단계</h3>${r.steps.map((s, i) => `
      <div class="rv-step" data-step="${i}">
        <span class="t">${esc(s.t || '')}</span>
        <span class="w">${s.w != null ? `${s.w}g` : ''}</span>
        <span class="n">${esc(s.note || '')}</span>
      </div>`).join('')}</div>` : ''}
    ${r.memo ? `<div class="rv-memo"><h3>메모</h3><p>${esc(r.memo)}</p></div>` : ''}`;
  $('#rvStart').addEventListener('click', toggleTimer);
  $('#rvReset').addEventListener('click', () => { resetTimer(); paintTimer(); });
  paintTimer();
}
/* 전체화면 분쇄도 카드: 누르면 μm 보기 + 수정 */
function grindStatView(r) {
  return `<small>분쇄도 <em>눌러서 수정</em></small><b>${fmtClicks(r.clicks, stepFor(r))}<span>클릭</span></b>
    <div class="sub2">${esc(r.grinder || '그라인더 미지정')}</div>
    ${micronText(r) ? `<div class="um">${micronText(r)}</div>` : ''}`;
}
let grindDraft = null;
function openGrindEdit() {
  const r = findRecipe(currentRecipe);
  if (!r || grindDraft) return;
  grindDraft = { clicks: r.clicks ?? 0, umMin: r.umMin, umMax: r.umMax, rate: rateFor(r.grinder, r.umPerClick), step: stepFor(r) };
  const el = $('#grindStat');
  el.classList.add('editing');
  el.innerHTML = `
    <small>분쇄도 · ${esc(r.grinder || '그라인더 미지정')}</small>
    <div class="ge-row">
      <button type="button" data-ge="-1" aria-label="한 단계 곱게">−</button>
      <input type="number" min="0" step="${grindDraft.step}" id="geClicks" aria-label="클릭" />
      <button type="button" data-ge="1" aria-label="한 단계 굵게">+</button>
      <span class="ge-unit">클릭</span>
    </div>
    <div class="ge-um" id="geUm"></div>
    <div class="range-in">
      <input type="number" min="0" id="geMin" aria-label="최소 μm" /><span>~</span>
      <input type="number" min="0" id="geMax" aria-label="최대 μm" /><span>μm</span>
    </div>
    <div class="ge-btns">
      <button type="button" data-ge="cancel">취소</button>
      <button type="button" data-ge="save" class="go">저장</button>
    </div>`;
  paintGrindEdit(true);
  $('#geClicks').focus();
}
function paintGrindEdit(fillRange, typing = false) {
  const d = grindDraft;
  const est = estMicron(d.clicks, d.rate, d.step);
  if (fillRange && est) { d.umMin = est.min; d.umMax = est.max; }
  if (!typing) $('#geClicks').value = fmtClicks(d.clicks, d.step);
  $('#geMin').value = d.umMin ?? '';
  $('#geMax').value = d.umMax ?? '';
  $('#geUm').innerHTML = est
    ? `${fmtClicks(d.clicks, d.step)}클릭 ≈ <b>${est.center} μm</b> <small>(1.0 ≈ ${d.rate}μm)</small>`
    : `<small>레시피 수정에서 μm/클릭 값을 넣으면 자동 계산돼요</small>`;
}
function closeGrindEdit() {
  grindDraft = null;
  const el = $('#grindStat');
  if (!el) return;
  el.classList.remove('editing');
  el.innerHTML = grindStatView(findRecipe(currentRecipe));
}
$('#rvContent').addEventListener('click', (e) => {
  const act = e.target.closest('[data-ge]')?.dataset.ge;
  if (!act) {
    if (e.target.closest('#grindStat') && !grindDraft) openGrindEdit();
    return;
  }
  const d = grindDraft;
  if (act === 'cancel') return closeGrindEdit();
  if (act === 'save') {
    const r = findRecipe(currentRecipe);
    let [a, b] = [num($('#geMin').value), num($('#geMax').value)];
    if (a != null && b != null && a > b) [a, b] = [b, a];
    Object.assign(r, { clicks: roundStep(num($('#geClicks').value), d.step), clickStep: d.step, umMin: a, umMax: b });
    save(); renderAll(); closeGrindEdit(); toast('분쇄도를 수정했어요');
    return;
  }
  d.clicks = Math.max(0, roundStep((num($('#geClicks').value) ?? 0) + +act * d.step, d.step));
  paintGrindEdit(true);
});
$('#rvContent').addEventListener('input', (e) => {
  if (!grindDraft) return;
  if (e.target.id === 'geClicks') { grindDraft.clicks = num(e.target.value) ?? 0; paintGrindEdit(true, true); }
  if (e.target.id === 'geMin') grindDraft.umMin = num(e.target.value);
  if (e.target.id === 'geMax') grindDraft.umMax = num(e.target.value);
});
$('#rvContent').addEventListener('keydown', (e) => {
  if (e.target.id === 'grindStat' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openGrindEdit(); }
});

function toggleTimer() {
  if (timer.running) {
    timer.elapsed += (Date.now() - timer.start) / 1000;
    timer.running = false;
    clearInterval(timer.tick);
  } else {
    timer.start = Date.now();
    timer.running = true;
    timer.tick = setInterval(paintTimer, 200);
  }
  paintTimer();
}
function resetTimer() {
  clearInterval(timer.tick);
  timer = { start: 0, elapsed: 0, running: false, tick: null };
}
function paintTimer() {
  const r = findRecipe(currentRecipe);
  if (!r || !$('#rvClock')) return;
  const sec = timer.elapsed + (timer.running ? (Date.now() - timer.start) / 1000 : 0);
  $('#rvClock').textContent = fmtSec(sec);
  const btn = $('#rvStart');
  btn.textContent = timer.running ? '일시정지' : sec > 0 ? '계속' : '시작';
  btn.classList.toggle('go', !timer.running);
  const total = toSec(r.time);
  if ($('#rvProg') && total) $('#rvProg').style.width = `${Math.min(100, (sec / total) * 100)}%`;

  const steps = r.steps || [];
  if (!steps.length || (sec === 0 && !timer.running)) {
    $$('.rv-step').forEach((el) => el.classList.remove('now', 'done'));
    return;
  }
  let cur = -1;
  steps.forEach((s, i) => { const t = toSec(s.t); if (t != null && t <= sec) cur = i; });
  $$('.rv-step').forEach((el, i) => {
    el.classList.toggle('now', i === cur);
    el.classList.toggle('done', i < cur);
  });
  const next = steps.slice(cur + 1).find((s) => toSec(s.t) != null);
  const nextEl = $('#rvNext');
  if (next) nextEl.textContent = `다음 ${fmtSec(toSec(next.t) - sec)} 후 → ${next.w != null ? `${next.w}g까지` : ''} ${next.note || ''}`.trim();
  else if (total && sec >= total) nextEl.textContent = '추출 완료! ☕';
  else nextEl.textContent = total ? `완료까지 ${fmtSec(total - sec)}` : '마지막 단계';
}
$('#rvClose').addEventListener('click', closeRecipeView);
$('#rvEdit').addEventListener('click', () => openRecipe(currentRecipe));
$('#rvJournal').addEventListener('click', () => {
  const r = findRecipe(currentRecipe);
  openJournal(null, { recipeId: r.id, beanId: r.beanId });
});
$('#rvDelete').addEventListener('click', () => {
  if (!confirm('이 레시피를 삭제할까요?\n(이미 남긴 일기에는 레시피 내용이 그대로 남아요)')) return;
  db.recipes = db.recipes.filter((r) => r.id !== currentRecipe);
  save(); closeRecipeView(); renderAll(); toast('레시피를 삭제했어요');
});
$('#rvFull').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else recipeView.requestFullscreen?.().catch(() => toast('이 브라우저는 전체화면을 지원하지 않아요'));
});
document.addEventListener('fullscreenchange', () => {
  $('#rvFull').textContent = document.fullscreenElement ? '⛶ 전체화면 해제' : '⛶ 전체화면';
});
document.addEventListener('keydown', (e) => {
  if (recipeView.hidden || $$('dialog').some((d) => d.open)) return;
  if (e.key === 'Escape' && !document.fullscreenElement) closeRecipeView();
  if (e.key === ' ' && e.target === document.body) { e.preventDefault(); toggleTimer(); }
});

/* ---------- 목록 클릭 위임 ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-new],[data-edit-bean],[data-del-bean],[data-open-recipe],[data-open-journal]');
  if (!t) return;
  const d = t.dataset;
  if (d.new === 'bean') openBean();
  else if (d.new === 'recipe') openRecipe();
  else if (d.new === 'journal') openJournal();
  else if (d.editBean) openBean(d.editBean);
  else if (d.delBean) {
    const used = db.recipes.filter((r) => r.beanId === d.delBean).length;
    if (!confirm(`이 원두를 삭제할까요?${used ? `\n이 원두를 쓰는 레시피 ${used}개는 '원두 미지정'이 돼요.` : ''}`)) return;
    db.beans = db.beans.filter((b) => b.id !== d.delBean);
    db.recipes.forEach((r) => { if (r.beanId === d.delBean) r.beanId = null; });
    save(); renderAll(); toast('원두를 삭제했어요');
  }
  else if (d.openRecipe) openRecipeView(d.openRecipe);
  else if (d.openJournal) openDetail(d.openJournal);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches?.('[data-open-journal]')) openDetail(e.target.dataset.openJournal);
});

/* ---------- 백업 / 불러오기 ---------- */
$('#backupBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  download(blob, `brewingnote_backup_${today()}.json`);
  toast('백업 파일을 저장했어요');
});
$('#importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = normalize(JSON.parse(await file.text()));
    const count = data.beans.length + data.recipes.length + data.journals.length;
    if (!count) return toast('불러올 데이터가 없는 파일이에요');
    if (!confirm(`원두 ${data.beans.length} · 레시피 ${data.recipes.length} · 기록 ${data.journals.length}개를 불러옵니다.\n현재 데이터는 백업 내용으로 바뀌어요. 계속할까요?`)) return;
    db = data;
    save(); renderAll(); toast('백업을 불러왔어요');
  } catch (err) {
    toast('올바른 백업 파일이 아니에요');
  }
});

/* ---------- 토스트 ---------- */
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- 시작 ---------- */
renderAll();
try {
  const saved = localStorage.getItem('brewnote:tab');
  if (saved && $(`[data-tab="${saved}"]`)) showTab(saved);
} catch (e) {}
