/* Figma 조사 코드 — use_figma 의 code 에 **이 파일 내용을 그대로** 붙여 넣는다. 읽기 전용이다.
 *
 * 왜 파일로 두나: 같은 검사를 매번 새로 쓰다가 한 번 틀렸다. 넘침은 보는데 **겹침을 안 봤고**,
 * 그래서 "겹침 0" 이라고 보고한 뒤 화면에 보이는 겹침을 사람이 짚어 줬다.
 * 검사를 여기 고정해 두면 한 번 고친 구멍이 계속 막혀 있다.
 *
 * 쓰는 법
 *   1) cat _figma/probe.js  → 내용을 use_figma 의 code 로 전달
 *   2) 돌려받은 JSON 을 파일로 저장
 *   3) node _figma/audit.mjs diff <그 파일>   → 저장소 기대값과 대조
 *
 * 돌려받는 값이 48KB 를 넘으면 use_figma 가 거부한다(2026-10-28 k16 에 처음 만남 — 덤프 약 244KB, "Return value exceeds the 48000-byte limit").
 * 그때는 이 파일 본문을 고치지 말고 **감싸서** 보낸다(k16 에 그렇게 했다):
 *   - 맨 위에 lz-string 의 compressToBase64(_react/node_modules/lz-string/libs/lz-string.min.js 의 _compress · compressToBase64 부분)를 두고,
 *   - 이 파일 본문 전체를 `const __probe = async () => { … };` 안에 넣고,
 *   - 끝에 `const b64 = LZ.compressToBase64(JSON.stringify(await __probe())); return { run: "<표식>", len: b64.length, part: b64.slice(OFF, OFF + 46000) };`
 *     를 붙여 OFF = 0, 46000, … 으로 나눠 부른다(k16 에 base64 약 74KB → 두 번).
 *   - 받은 part 를 이어 붙여 `require("./_react/node_modules/lz-string").decompressFromBase64(…)` 로 풀면 덤프 JSON 이다.
 *     part 를 손으로 옮겨 적지 않는다 — 한 글자만 틀려도 풀리지 않는다. 에이전트 대화 기록(jsonl)에 도구 결과가 그대로 남으니 거기서 <표식>으로 찾아 꺼낸다
 */

/* 현재 페이지는 이름이 아니라 id 로 고른다(2026-10-23 k2). 이름으로 고르면 같은 이름의 작업 중 페이지가 함께 들어왔다 —
   두 번째 "Overview"(368:3228)는 사람이 쓰는 작업 페이지인데 이름이 같아 대조 대상이 됐고, 덤프에는 page 이름만 남아
   어느 Overview 인지 구분할 수 없었다. 그래서 넘침·겹침·섹션 항목에 pageId 를 함께 적는다.
   id 로 고르면 반대 구멍이 생긴다 — 페이지를 지우고 다시 만들어 id 가 바뀌면 그 페이지는 소리 없이 빠진다.
   그래서 이 표를 덤프의 scope 로 내보내고, audit 이 pages 와 맞춰 없는 id 는 어긋남으로, 같은 이름인데 범위 밖인 페이지는 NOTE 로 알린다 */
const CURRENT_PAGES = { "302:2": "Overview", "302:3": "1 Theme", "302:4": "2 Element", "302:5": "3 Component", "302:6": "4 Pattern", "302:7": "Resource" };
const isCurrent = (p) => Object.prototype.hasOwnProperty.call(CURRENT_PAGES, p.id);
const OVERFLOW_MIN = 10;   // 도형 외곽선·그림자 번짐이 만드는 2~6px 는 잡지 않는다

/* ---------- 페이지 불러오기 ----------
   불러오지 않은 페이지는 인스턴스 속 노드를 돌려주지 않는다. 그래서 이 조사는 실행할 때 열려 있던 첫 페이지 말고는
   인스턴스 안을 못 봤고, 한 번도 열리지 않은 페이지는 통째로 비어 보였다. 2026-10-23 k 에 잰 값(TEXT 수 · 그중 인스턴스 속):
     3 Component       1925 · 0  →  2721 · 796      (FRAME 1630 → 2188)
     두 번째 Overview   0 · 0     →  250 · 0        (368:3228 — 그전 덤프에는 자식 0 으로 찍혔다)
     4 Pattern          479 · 0   →  505 · 26
   page.loadAsync() 와 figma.setCurrentPageAsync() 는 같은 수를 돌려준다(3 Component 2721 · 796 으로 같음).
   loadAsync 는 현재 페이지를 바꾸지 않아 한 번의 실행에서 모든 페이지를 불러올 수 있으므로 이쪽을 쓴다 —
   setCurrentPageAsync 는 실행마다 한 번만 쓰는 것이 권장이고 페이지를 바꿀 때마다 문서를 다시 읽는다.
   전부 불러오는 데 페이지당 20~70ms. 아이콘 컴포넌트(전부 1 Theme)는 불러와도 수가 같다(313 · 145) */
for (const p of figma.root.children) await p.loadAsync();

/* ---------- 폰트 ---------- */
const fonts = await figma.listAvailableFontsAsync();
const families = new Set(fonts.map((f) => f.fontName.family));
const pretendard = fonts.filter((f) => /^Pretendard/i.test(f.fontName.family)).map((f) => f.fontName.family + " " + f.fontName.style);

/* ---------- 변수 ---------- */
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const byId = new Map();
for (const c of cols) {
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) byId.set(v.id, v);
  }
}
const hex2 = (n) => Math.round(n * 255).toString(16).padStart(2, "0").toUpperCase();
/* 값 인코딩: A<프리미티브경로> | H<RRGGBB> | O<RRGGBB>:<알파> | N<숫자> */
const enc = (val) => {
  if (val === undefined || val === null) return "?";
  if (typeof val === "number") return "N" + val;
  if (val.type === "VARIABLE_ALIAS") {
    const a = byId.get(val.id);
    return "A" + (a ? a.name.replace("color/atomic/", "") : "?");
  }
  if (typeof val.r === "number") {
    const base = hex2(val.r) + hex2(val.g) + hex2(val.b);
    return val.a === undefined || val.a >= 0.999 ? "H" + base : "O" + base + ":" + +val.a.toFixed(2);
  }
  return "?" + String(val);
};
const variables = {};
for (const c of cols) {
  const modes = c.modes.map((m) => m.name);
  const rows = {};
  for (const id of c.variableIds) {
    const v = byId.get(id);
    if (!v) continue;
    rows[v.name] = c.modes.map((m) => enc(v.valuesByMode[m.modeId])).join("|");
  }
  variables[c.name] = { modes, count: Object.keys(rows).length, values: rows };
}

/* ---------- 스타일 ---------- */
const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
  name: s.name,
  font: s.fontName.family + " " + s.fontName.style,
  size: s.fontSize,
  lineHeight: s.lineHeight && s.lineHeight.unit === "PIXELS" ? s.lineHeight.value
    : s.lineHeight && s.lineHeight.unit === "PERCENT" ? s.lineHeight.value + "%" : "auto",
  letterSpacing: s.letterSpacing ? s.letterSpacing.value + (s.letterSpacing.unit === "PERCENT" ? "%" : "px") : "0",
}));
const effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => ({
  name: s.name,
  effects: s.effects.map((e) => [e.type, e.offset ? e.offset.x + "," + e.offset.y : "", e.radius || 0, e.spread || 0, e.color ? +(e.color.a || 0).toFixed(3) : null].join(" ")),
}));

/* ---------- 아이콘 컴포넌트 ---------- */
const icons = { outline: [], filled: [] };
for (const p of figma.root.children) {
  for (const c of p.findAllWithCriteria({ types: ["COMPONENT"] })) {
    const m = c.name.match(/^icon\/(outline|filled)\/(.+)$/);
    if (m) icons[m[1]].push(m[2]);
  }
}
icons.outline.sort(); icons.filled.sort();

/* ---------- 넘침 · 겹침 ----------
   넘침: 자식이 부모 경계 밖. 겹침: 같은 페이지의 **최상위 노드끼리**.
   두 번째를 빠뜨린 것이 지난 사고였다 — 둘을 한 함수에서 같이 본다.
   넘침은 네 방향을 본다(2026-10-23 k 까지는 오른쪽·아래만 봐서, 섹션이 왼쪽·위로 밀려 자식이 음수 좌표에 있으면 놓쳤다).
   왼쪽·위가 가장 크면 side 를 적는다 — 오른쪽·아래 항목은 예전과 같은 모양이다.
   인스턴스 속 프레임은 넘침 검사에서 뺀다 — 원본 컴포넌트를 검사하면 따라오고, 페이지를 불러오기 전에도 (열려 있던
   첫 페이지 말고는) 보지 않았다. 인스턴스를 줄이거나 글자를 덮어써 생기는 넘침은 여기서 못 잡는다 */
const overflow = [], overlap = [];
const inInst = (n) => { for (let q = n.parent; q && q.type !== "PAGE"; q = q.parent) if (q.type === "INSTANCE") return true; return false; };
for (const p of figma.root.children) {
  const inScope = isCurrent(p);
  const tops = p.children.filter((n) => n.visible !== false && n.width && n.height);
  for (let i = 0; i < tops.length; i++) {
    for (let j = i + 1; j < tops.length; j++) {
      const a = tops[i], b = tops[j];
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > 1 && iy > 1) overlap.push({ page: p.name, pageId: p.id, a: a.name, b: b.name, by: [Math.round(ix), Math.round(iy)], current: inScope });
    }
  }
  if (!inScope) continue;
  for (const c of p.findAll((n) => (n.type === "SECTION" || n.type === "FRAME" || n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.children && n.children.length && !inInst(n))) {
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const k of c.children) {
      if (k.visible === false) continue;
      /* 회전한 자식은 x · y 가 회전 원점이고 width · height 는 회전 전 크기다 — 네 꼭짓점의 실제 외곽으로 본다
         (2026-11-05 k35: 도넛 경계선 2×20 을 162° 돌리니 x · y + 높이만 보고 "넘침 +17" 로 냈다. 실제로는 도넛 안) */
      const m = k.relativeTransform, W = k.width, H = k.height;
      if (Math.abs(m[0][1]) > 1e-6 || Math.abs(m[1][0]) > 1e-6) {
        for (const [u, v] of [[0, 0], [W, 0], [0, H], [W, H]]) {
          const x = m[0][2] + m[0][0] * u + m[0][1] * v, y = m[1][2] + m[1][0] * u + m[1][1] * v;
          l = Math.min(l, x); t = Math.min(t, y); r = Math.max(r, x); b = Math.max(b, y);
        }
        continue;
      }
      l = Math.min(l, k.x);
      t = Math.min(t, k.y);
      r = Math.max(r, k.x + k.width);
      b = Math.max(b, k.y + k.height);
    }
    const sides = { right: r - c.width, bottom: b - c.height, left: -l, top: -t };
    const side = Object.keys(sides).reduce((a, k) => (sides[k] > sides[a] ? k : a), "right");
    const over = sides[side];
    if (over > OVERFLOW_MIN) overflow.push({ page: p.name, pageId: p.id, node: c.name, id: c.id, by: Math.round(over), clips: c.clipsContent === true, ...(side === "left" || side === "top" ? { side } : {}) });
  }
}

/* ---------- 컴포넌트 ----------
   변수만 맞추고 컴포넌트를 안 봐서, 카드 그림자·버튼 간격·Danger 버튼 모양이 저장소와 한참 어긋난 채로 있었다.
   덤프가 커지면 옮기다 틀리므로 정해 둔 세트만 짧게 읽는다. 기대값은 audit.mjs 가 저장소 CSS 에서 읽는다 */
const SURVEY_SETS = ["Card", "Chart Card", "KPI", "Tab", "Tab Item", "Select Button", "Popup", "Button", "Accordion", "Accordion Group", "Tag", "Banner", "Menu Item",
  "Count", "Status Indicator", "Step", "Steps", "Navigation Item", "Navigation"];
/* 도넛 가운데 글(2026-11-05 k34) — 텍스트 스타일 이름 · 크기 · 행간 · 서체 · 가로 가운데 어긋남(글 상자 가운데 − 부모 가운데). audit 이 CSS .donut::after(= ds-chart centerPlugin)와 맞춘다.
   정적 도넛(Chart Card 의 "Donut" 바로 아래 TEXT)과 Chart 세트의 "Center" 가 같이 쓴다. 세트 조사는 동기 map 이라 스타일 이름 표를 미리 만든다 */
const TS_NAME = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.id, s.name]));
const centerTx = (t) => (t ? { st: t.textStyleId === figma.mixed ? "mixed" : TS_NAME.get(t.textStyleId) || null, fs: t.fontSize === figma.mixed ? "mixed" : t.fontSize,
  lh: t.lineHeight === figma.mixed ? "mixed" : t.lineHeight.unit === "PIXELS" ? t.lineHeight.value : t.lineHeight.unit, font: t.fontName === figma.mixed ? "mixed" : t.fontName.family + " " + t.fontName.style,
  h: +t.height.toFixed(2), dx: +(t.x + t.width / 2 - t.parent.width / 2).toFixed(2) } : null);
/* 정적 차트 도우미(2026-11-05 k35) — 정적 도넛의 경계 구분선 · 모서리 · 범례 견본.
   donutDiv: 도넛 바로 아래 RECTANGLE 마다 [경계 각도(위 = 0°, 시계 방향 — CSS --a 와 같은 기준), 중심에서 상자 가운데까지 거리, 폭, 높이, 칠, 긴 변과 반지름 방향의 어긋남(도)].
   maxR: 노드와 그 아래 모서리 중 가장 큰 값. swatches: 범례 항목마다 첫 RECTANGLE · ELLIPSE 를 "종류|폭x높이|r가장 작은 모서리" 로 세어 둔다(ELLIPSE 는 r = 폭/2) */
const donutDiv = (donut) => { const C = donut.width / 2;
  return donut.children.filter((k) => k.type === "RECTANGLE").map((k) => { const m = k.relativeTransform, cx = m[0][2] + m[0][0] * k.width / 2 + m[0][1] * k.height / 2, cy = m[1][2] + m[1][0] * k.width / 2 + m[1][1] * k.height / 2;
    const ang = ((Math.atan2(cx - C, -(cy - C)) * 180) / Math.PI + 360) % 360, axis = (Math.atan2(-m[0][1], m[1][1]) * 180) / Math.PI, off = Math.abs((((axis - ang) % 180) + 270) % 180 - 90);
    return [+ang.toFixed(2), +Math.hypot(cx - C, cy - C).toFixed(2), +k.width.toFixed(2), +k.height.toFixed(2), paint(k.fills), +off.toFixed(2)]; }).sort((a, b) => a[0] - b[0]); };
const cr = (k) => (k.type === "ELLIPSE" ? k.width / 2 : "cornerRadius" in k ? (k.cornerRadius === figma.mixed ? Math.min(k.topLeftRadius, k.topRightRadius, k.bottomRightRadius, k.bottomLeftRadius) : k.cornerRadius) : 0);
const maxR = (n) => Math.max(0, ...[n].concat(n.findAll ? n.findAll((k) => "cornerRadius" in k && k.type !== "TEXT") : []).map((k) => (k.cornerRadius === figma.mixed ? Math.max(k.topLeftRadius, k.topRightRadius, k.bottomRightRadius, k.bottomLeftRadius) : k.cornerRadius || 0)));
const swatches = (lg) => { const t = {}; for (const it of lg.children) { const s = it.findOne && it.findOne((k) => k.type === "RECTANGLE" || k.type === "ELLIPSE"); if (!s) continue; const key = s.type + "|" + +s.width.toFixed(2) + "x" + +s.height.toFixed(2) + "|r" + +cr(s).toFixed(2); t[key] = (t[key] || 0) + 1; } return t; };
const FLAT_SETS = ["Card", "KPI", "Chart Card"];   // variant outline · flat 을 가진 세트(2026-11-03 k32 — 사람의 결정, components.data.js card · data-visual 의 figma.variant)
const vname = (b) => { const v = b && byId.get(b.id); return v ? v.name.replace("color/semantic/", "") : null; };
const paint = (arr) => {
  if (!arr || arr === figma.mixed) return "-";
  const o = [];
  for (const p of arr) {
    if (p.visible === false) continue;
    /* 불투명도 0 인 칠은 "transparent" 로 적는다(2026-10-26 k7) — 버튼의 1px 투명 테두리(사이트 border:1px solid transparent)가
       raw#000000 으로 보여 검은 선처럼 읽히지 않게. 숨긴 칠(visible false)은 예전처럼 건너뛴다 */
    if (p.opacity === 0) { o.push("transparent"); continue; }
    const b = vname(p.boundVariables && p.boundVariables.color);
    o.push(b ? "$" + b : p.type === "SOLID" ? "raw#" + hex2(p.color.r) + hex2(p.color.g) + hex2(p.color.b) : p.type);
  }
  return o.join(",") || "-";
};
const shadows = (n) => ("effects" in n ? n.effects.filter((e) => e.visible !== false && e.type === "DROP_SHADOW").length : 0);
const components = { sets: {}, missingSets: [], negText: [], textOnSurface: [], opaque: {}, legacy: {}, sections: [], specs: [], focus: {}, tagHeights: null, effectColors: null, buttons: null, btnLoading: null, defaults: {}, translucent: [], controls: { radio: null, sliderDisabled: null }, disabledInner: [], chipX: null, tileDisabled: null, datePicker: null, calendarDay: null, calendar: null, textField: null, accordion: null, accordionProps: null, breadcrumb: null, breadcrumbItem: null, card: null };
/* 포커스 칸(2026-10-26 k5) — 세트마다 포커스 모양을 지는 노드. Search 는 변형 자신이 칸이다.
   k6 에 선택 컨트롤 넷을 더했다 — 사이트의 전역 :focus-visible 외곽선이 감싸는 상자다(Checkbox · Radio 는 16 상자, Switch 는 트랙,
   Slider 는 엄지가 아니라 range 전체라 Track 280×20). k8 에 Button 을 더했다가 2026-10-28 k16 에 뺐다 — 사람의 정의로 버튼 포커스는 상태가 아니라
   코드의 전역 :focus-visible 이라 Focused 변형을 지웠다(남아 있으면 audit 의 Button 변형 표 대조가 낸다) */
const FOCUS_BOX = { "Text Field": "Input", "Search": null, "Select": "Trigger", "Date Picker": "Field", "Checkbox": "Box", "Radio Button": "Circle", "Switch": "Track", "Slider": "Track" };
const effectColors = { nodes: 0, styled: 0, bound: 0, raw: [] };
for (const p of figma.root.children) {
  if (!isCurrent(p)) continue;
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    if (!SURVEY_SETS.includes(set.name)) continue;
    /* 기본 변형(2026-10-26 k7) — 인스턴스를 새로 꺼낼 때 나오는 변형. Figma 는 층 순서가 아니라 자리로 정한다(세트 안에서 왼쪽 위에 놓인 변형 —
       첫 자식으로 옮겨도 바뀌지 않았다). audit 이 사이트의 기본값(Tag size md)과 맞춘다 */
    components.defaults[set.name] = set.defaultVariant ? set.defaultVariant.name : null;
    /* 컴포넌트 속성 연결 — 이름·종류가 같은 노드가 변형마다 같은 속성을 참조하는지 audit 이 보려고 모은다.
       복제(clone)한 변형은 연결이 빠진 채 세트에 들어온다(2026-10-23 j 에 8개가 그랬다). 인스턴스 속은 내려가지 않는다 */
    const own = (root, fn) => { for (const k of root.children || []) { fn(k); if (k.type !== "INSTANCE" && "children" in k) own(k, fn); } };
    const rkey = (n) => n.name + "|" + n.type;
    const refKeys = new Set();
    for (const c of set.children) own(c, (n) => { const r = n.componentPropertyReferences; if (r && Object.keys(r).length) refKeys.add(rkey(n)); });
    components.sets[set.name] = set.children.map((c) => {
      /* 이름 있는 부품 — 값이 있을 때만 기록해 덤프가 커지지 않게 한다 */
      const named = (nm, t) => c.findOne((k) => k.name === nm && (!t || k.type === t));
      const vecStroke = (n) => { const v = n && (n.type === "VECTOR" ? n : n.findOne && n.findOne((k) => k.type === "VECTOR")); return v ? paint(v.strokes) : null; };
      const parts = {};
      const circle = named("Circle"), icon = named("Icon"), num = named("Number", "TEXT"), lab = named("Label", "TEXT");
      if (circle) { parts.circle = paint(circle.fills); const ck = vecStroke(circle); if (ck) parts.check = ck; }
      if (num) parts.number = paint(num.fills);
      if (lab) parts.label = paint(lab.fills);
      if (icon) { const ic = vecStroke(icon); if (ic) parts.icon = ic; }
      /* 막대 묶음 — Chart Card 의 Sparkline 과 KPI 안의 Sparkline. 강조는 하나여야 한다 */
      const spark = named("Sparkline") || (/Type=Sparkline/.test(c.name) ? named("Chart") : null);
      if (spark) { const t = {}; for (const r of spark.findAll((k) => k.type === "RECTANGLE")) { const pf = paint(r.fills); t[pf] = (t[pf] || 0) + 1; } parts.bars = t; }
      /* 도넛 — 호 사이 간격(도)과 호 테두리 수, 도넛 + 범례 행의 정렬 */
      const donut = named("Donut");
      if (donut) {
        const arcs = donut.findAll((k) => k.type === "ELLIPSE" && k.arcData).map((e) => [e.arcData.startingAngle, e.arcData.endingAngle].map((x) => (x * 180) / Math.PI)).sort((a, b) => a[0] - b[0]);
        parts.donutGaps = arcs.map((a, i) => +((i + 1 < arcs.length ? arcs[i + 1][0] : arcs[0][0] + 360) - a[1]).toFixed(2));
        parts.donutStrokes = donut.findAll((k) => k.type === "ELLIPSE").reduce((n, e) => n + (e.strokes || []).filter((x) => x.visible !== false).length, 0);
        const row = donut.parent; if (row && "primaryAxisAlignItems" in row) parts.row = row.primaryAxisAlignItems + "/" + (row.layoutSizingHorizontal || "-");
        const ct = (donut.children || []).find((k) => k.type === "TEXT"); if (ct) parts.donutCenter = centerTx(ct);   // 가운데 합계(k34)
        parts.donutDividers = donutDiv(donut);   // 경계 구분선(k35)
      }
      /* 정적 막대 · 스파크라인 모서리, 범례 견본 모양(2026-11-05 k35 — 사람의 결정: 정적 막대 · 트랙 · 스파크라인 각짐, .chart-legend i 원형 10) */
      const bar0 = c.findAll((k) => k.name === "Bar" && k.type === "FRAME");
      if (bar0.length) parts.barR = Math.max(...bar0.map(maxR));
      if (spark) parts.sparkR = maxR(spark);
      const lg = named("Legend"); if (lg) parts.legendSw = swatches(lg);
      const kid = (nm) => c.findOne((k) => k.name === nm && "itemSpacing" in k);
      const foot = kid("Foot"), actions = kid("Actions");
      const label = c.findOne((k) => k.type === "TEXT" && k.visible !== false);
      const dot = c.findOne((k) => k.type === "ELLIPSE" && k.visible !== false);
      const count = c.findOne((k) => /count/i.test(k.name) && "fills" in k && k.type !== "TEXT");
      const texts = c.findAll((k) => k.type === "TEXT" && k.visible !== false).slice(0, 4).map((k) => k.name + "=" + paint(k.fills));
      /* 2026-10-23 k 에 더한 필드 — 맨 뒤에 붙여 앞 필드의 순서·값은 예전 덤프와 같게 둔다 */
      const extra = {};
      /* 체크 선 굵기 — Figma 는 인스턴스 크기와 상관없이 px 로 그린다. 저장소는 24 viewBox 의 stroke-width 를 아이콘 폭에 맞춰 줄인다 */
      const ckv = circle && circle.findOne && circle.findOne((k) => k.type === "VECTOR");
      if (ckv) extra.checkW = ckv.strokeWeight === figma.mixed ? "mixed" : ckv.strokeWeight;
      /* 점 둘레 고리(Pulse) — 점의 바깥 테두리나 퍼짐 그림자. 없으면 적지 않는다 */
      if (dot) {
        const st = (dot.strokes || []).filter((x) => x.visible !== false);
        const sh = ("effects" in dot ? dot.effects : []).filter((e) => e.visible !== false && e.type === "DROP_SHADOW" && (e.spread || 0) > 0);
        if (st.length && dot.strokeWeight !== figma.mixed && dot.strokeWeight > 0) extra.ring = paint(dot.strokes) + "|" + dot.strokeWeight + "|" + dot.strokeAlign;
        else if (sh.length) { const b = vname(sh[0].boundVariables && sh[0].boundVariables.color); extra.ring = (b ? "$" + b : "raw") + "|" + sh[0].spread + "|SHADOW"; }
      }
      /* 도넛 호 — 시작·끝 각도(Figma 각도: 3시 방향 0°, 시계 방향)와 색. audit 이 CSS conic-gradient 정지점과 맞춘다 */
      if (donut) extra.donutArcs = donut.findAll((k) => k.type === "ELLIPSE" && k.arcData).map((e) => [e.arcData.startingAngle, e.arcData.endingAngle].map((x) => +((x * 180) / Math.PI).toFixed(2)).concat(paint(e.fills))).sort((a, b) => a[0] - b[0]);
      /* 속성 연결 — 세트 안 어느 변형에서든 연결이 있는 "이름|종류" 만, 이 변형에 그 노드가 있으면 연결(없으면 "") */
      if (refKeys.size) {
        const refs = {};
        own(c, (n) => {
          const k = rkey(n); if (!refKeys.has(k)) return;
          const r = n.componentPropertyReferences || {};
          const cur = new Set(refs[k] ? refs[k].split(";") : []);
          for (const f of Object.keys(r)) cur.add(f + "=" + r[f]);
          refs[k] = [...cur].filter(Boolean).sort().join(";");
        });
        extra.refs = refs;
      }
      return {
        id: c.id, name: c.name, fill: paint(c.fills), stroke: paint(c.strokes),
        sw: c.strokeWeight === figma.mixed ? "mixed" : c.strokeWeight, shadow: shadows(c), opacity: +c.opacity.toFixed(2),
        gap: "itemSpacing" in c ? c.itemSpacing : null,
        foot: foot ? foot.itemSpacing : null, actions: actions ? actions.itemSpacing : null,
        text: label ? paint(label.fills) : null, dot: dot ? paint(dot.fills) : null,
        count: count ? paint(count.fills) : null, countInstance: count ? count.type === "INSTANCE" : null, texts, ...parts, ...extra,
        /* 크기(2026-11-03 k32) — variant outline · flat 을 가진 세 세트만. audit 이 Flat 과 같은 이름의 Outline 이 크기가 같은지 본다(사이트 .flat 은 보더 색만 지우고 1px 자리는 남긴다) */
        ...(FLAT_SETS.includes(set.name) ? { w: +c.width.toFixed(2), h: +c.height.toFixed(2) } : {}),
      };
    });
  }
  /* 컨테이너가 항목 인스턴스로 짜였는지 — 복제본이면 항목을 고쳐도 따라오지 않는다. 접힌 내비의 빈 칸도 센다 */
  for (const [nm, item] of [["Navigation", "Navigation Item"], ["Steps", "Step"]]) {
    for (const v of components.sets[nm] || []) {
      const node = await figma.getNodeByIdAsync(v.id); let inst = 0, raw = 0, empty = 0;
      for (const k of node.children) {
        if (k.type === "INSTANCE") { const m = await k.getMainComponentAsync(); if (m && m.parent && m.parent.name === item) inst++; }
        else if (k.type === "FRAME" && !k.children.length) empty++;
        else if (k.type === "FRAME" && !/^foot$/i.test(k.name) && (k.findOne((x) => x.type === "INSTANCE" && /^icon\//.test(x.name)) || (nm === "Steps" && k.findOne((x) => x.type === "TEXT")) || (k.children.length === 1 && k.children[0].type === "TEXT" && k.height >= 36))) raw++;   // "Foot" 프레임(.sidenav .foot)은 항목이 아니다
      }
      v.items = { inst, raw, empty };
      /* 항목 목록(순서대로) — audit 이 저장소 예제(사이트)와 순서·라벨·상태·아이콘을 맞춘다. 숨은 건수 배지는 적지 않는다 */
      const list = [];
      /* 기하(2026-10-26 k3) — 컨테이너 기준 y · 높이. 그룹 · foot 프레임은 안 글자의 y · 높이도 적는다(ty · th, 컨테이너 기준).
         audit 이 사이트 예제를 헤드리스 Chromium 으로 잰 값과 ±0.5 로 맞춘다. 항목마다 맨 뒤에 붙여 앞 필드는 예전과 같다 */
      const oy = node.absoluteTransform[1][2];
      const geo = (k) => {
        const g = { y: +k.y.toFixed(2), h: +k.height.toFixed(2) };
        const t = k.type === "FRAME" ? k.findOne((y) => y.type === "TEXT") : null;
        if (t) { g.ty = +(t.absoluteTransform[1][2] - oy).toFixed(2); g.th = +t.height.toFixed(2); }
        return g;
      };
      for (const k of node.children) {
        if (k.type === "INSTANCE") {
          const m = await k.getMainComponentAsync();
          const tx = (n) => { const x = k.findOne((y) => y.type === "TEXT" && y.name === n && y.visible !== false); return x ? x.characters : null; };
          const ic = k.findOne((y) => y.type === "INSTANCE" && (y.name === "Icon" || /^icon\//.test(y.name)) && y.visible !== false);
          const icm = ic ? await ic.getMainComponentAsync() : null;
          const cn = k.findOne((y) => y.type === "INSTANCE" && y.name === "Count" && y.visible !== false);
          const ct = cn ? cn.findOne((y) => y.type === "TEXT") : null;
          /* 접힌 레일은 라벨 글자가 없어 Label 속성 값으로 비교한다(사이트는 숨은 span · title 에 라벨이 있다) */
          const lp = Object.entries(k.componentProperties || {}).find(([key, v]) => /^Label#/.test(key) && v.type === "TEXT");
          /* 아이콘 색 — 아이콘을 바꿔 끼우면(swap) 이름이 맞는 층에만 색 덮어쓰기가 남고 나머지는 아이콘 원본 색으로 돌아간다(2026-10-23 k2, list 아이콘) */
          const ip = ic ? [...new Set(ic.findAll((y) => ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "BOOLEAN_OPERATION"].includes(y.type) && y.visible !== false).flatMap((y) => [paint(y.strokes), paint(y.fills)]).filter((x) => x !== "-"))].sort().join("|") : null;
          list.push({ item: m ? m.name : null, label: tx("Label"), number: tx("Number"), icon: icm ? icm.name.replace(/^icon\/(outline|filled)\//, "") : null, count: ct ? ct.characters : null, labelProp: lp ? lp[1].value : null, iconPaints: ip, ...geo(k) });
        } else if (k.type === "FRAME" && k.children.length) { const x = k.findOne((y) => y.type === "TEXT"); list.push({ ...(/^foot$/i.test(k.name) ? { foot: x ? x.characters : null } : { group: x ? x.characters : null }), ...geo(k) }); }
        else list.push({ other: k.type + (k.type === "FRAME" ? " (빈 칸)" : ""), ...geo(k) });
      }
      v.itemsList = list;
      v.box = { h: +node.height.toFixed(2), pad: [node.paddingTop, node.paddingBottom], gap: node.itemSpacing };
    }
  }
  /* 글자에 negative/primary 가 묶이면 안 된다 — 저장소 규칙이 "글자는 strong, primary 는 아이콘·그래픽" 이다 */
  const inInstance = (n) => { for (let q = n.parent; q && q.type !== "PAGE"; q = q.parent) if (q.type === "INSTANCE") return true; return false; };
  for (const t of p.findAllWithCriteria({ types: ["TEXT"] })) {
    if (inInstance(t)) continue;   // 인스턴스는 원본을 고치면 따라온다
    const f = paint(t.fills);
    if (f.includes("foreground/negative/primary")) components.negText.push(t.id);
    if (/\$surface\//.test(f)) components.textOnSurface.push(t.id);   // 글자에 면 토큰 — 라이트는 같아 보여도 다크에서 갈린다
  }
  /* 컴포넌트가 써서는 안 되는 변수를 물고 있는 노드 — opaque 보더와 옛 변수 층(color/* · site/*)이 여기 걸린다.
     opaque 토큰 자체는 저장소에 있다(참조 토큰). 다만 컴포넌트 CSS 가 쓰지 않으므로, 토큰 견본을 늘어놓는
     1 Theme 에서만 허용한다 — 견본을 다른 토큰으로 묶으면 토큰 문서가 거짓이 된다 */
  const swatchPage = p.name === "1 Theme";
  for (const n of p.findAll((k) => ("fills" in k || "strokes" in k) && !inInstance(k))) {
    for (const arr of [n.fills, n.strokes]) {
      if (!arr || arr === figma.mixed) continue;
      for (const pt of arr) {
        const v = pt.boundVariables && pt.boundVariables.color && byId.get(pt.boundVariables.color.id);
        if (!v) continue;
        const bucket = /-opaque$/.test(v.name) ? (swatchPage ? null : components.opaque) : /^color\/(semantic|atomic)\//.test(v.name) ? null : components.legacy;
        if (!bucket) continue;
        const e = bucket[v.name] || (bucket[v.name] = { n: 0, ids: [] });
        e.n++; if (e.ids.length < 4) e.ids.push(n.id);
      }
    }
  }
  /* 섹션 세로 간격 — 겹침이 0 이어도 간격이 들쭉날쭉하면 다음 사람이 기준을 모른다 */
  const secs = p.children.filter((n) => n.type === "SECTION" && n.visible !== false).sort((a, b) => a.y - b.y);
  for (let i = 1; i < secs.length; i++) {
    const a = secs[i - 1], b = secs[i];
    if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) <= 0) continue;   // 옆 칸에 놓인 섹션은 세로 간격 대상이 아니다
    components.sections.push({ page: p.name, pageId: p.id, a: a.name, b: b.name, gap: Math.round(b.y - (a.y + a.height)) });
  }
  /* 문서 카드의 Spec 행(2026-10-26 k3) — audit 이 저장소 components.data.js 의 spec 행과 맞춘다.
     카드는 이름이 "Card/<컴포넌트>" 인 프레임이고, 그 안에서 제목 글자 "Spec" 을 가진 "Spec" 프레임의 자식 프레임 하나가 한 행이다
     (보이는 글자 둘: 행 이름 · 값). 값 글자의 id 도 적는다 — 어긋난 행을 고칠 사람이 바로 찾게 */
  for (const card of p.findAll((n) => n.type === "FRAME" && /^Card\//.test(n.name) && !inInstance(n))) {
    const spec = card.findOne((n) => n.type === "FRAME" && n.name === "Spec" && n.children.some((k) => k.type === "TEXT" && k.characters.trim() === "Spec"));
    if (!spec) continue;
    const rows = [];
    for (const r of spec.children) {
      if (r.type !== "FRAME" || r.visible === false) continue;
      const ts = r.findAll((n) => n.type === "TEXT" && n.visible !== false);
      if (ts.length >= 2) rows.push([ts[0].characters, ts.slice(1).map((t) => t.characters).join(" "), ts[1].id]);
    }
    components.specs.push({ card: card.name, id: card.id, rows });
  }
  /* 포커스 변형(2026-10-26 k5) — audit 이 사이트 CSS 의 테두리 · inset · 후광(값 입력 필드), 전역 :focus-visible 외곽선(선택 컨트롤, k6)과 맞춘다.
     변형마다 칸의 테두리(토큰 · 굵기 · 정렬) · 면 · 안쪽 · 바깥 그림자([토큰, spread, blur, "x,y"] — 배열 순서 그대로, 뒤의 것이 위에 그려진다).
     State 값이 "Focused" 로 끝나는 변형을 모은다 — k6 의 "Error Focused"(오류 필드의 포커스)도 여기 들어오고 state 에 값을 적는다 */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    if (!Object.prototype.hasOwnProperty.call(FOCUS_BOX, set.name)) continue;
    const list = [];
    for (const v of set.children) {
      const sm = /(?:^|, )State=((?:[^,=]+ )?Focused)(?:,|$)/.exec(v.name);
      if (!sm) continue;
      const box = FOCUS_BOX[set.name] ? v.findOne((k) => k.name === FOCUS_BOX[set.name] && "strokes" in k) : v;
      if (!box) { list.push({ variant: v.name, id: v.id, state: sm[1], box: null }); continue; }
      const fx = (t) => box.effects.filter((e) => e.visible !== false && e.type === t).map((e) => [vname(e.boundVariables && e.boundVariables.color) || "raw", e.spread || 0, e.radius || 0, e.offset ? e.offset.x + "," + e.offset.y : "0,0"]);
      const rad = (n) => ("cornerRadius" in n ? (n.cornerRadius === figma.mixed ? "mixed" : n.cornerRadius) : null);
      /* 선만 있는 고리(2026-10-26 k7) — 이름이 "Focus Ring" 인 노드. 칸에 대한 위치(dx · dy, 절대 좌표 차)와 크기 · 선(정렬 포함) · 면 · 모서리를 적는다.
         노드의 경계는 선이 아니라 사각형 자체다 — OUTSIDE 선이면 선은 경계 바깥으로 그려진다(k8 부터 이 표현으로 맞췄다, audit 주석) */
      const ringNode = v.findOne((k) => k.name === "Focus Ring");
      const ring = ringNode ? { id: ringNode.id, dx: +(ringNode.absoluteTransform[0][2] - box.absoluteTransform[0][2]).toFixed(2), dy: +(ringNode.absoluteTransform[1][2] - box.absoluteTransform[1][2]).toFixed(2), w: +ringNode.width.toFixed(2), h: +ringNode.height.toFixed(2), stroke: paint(ringNode.strokes), sw: ringNode.strokeWeight === figma.mixed ? "mixed" : ringNode.strokeWeight, align: ringNode.strokeAlign, fill: paint(ringNode.fills), radius: rad(ringNode), fx: ringNode.effects.filter((e) => e.visible !== false).length } : null;
      list.push({ variant: v.name, id: v.id, state: sm[1], box: box.id, stroke: paint(box.strokes), sw: box.strokeWeight === figma.mixed ? "mixed" : box.strokeWeight, align: box.strokeAlign, fill: paint(box.fills), size: [+box.width.toFixed(2), +box.height.toFixed(2)], inner: fx("INNER_SHADOW"), drop: fx("DROP_SHADOW"), radius: rad(box), ring });
    }
    components.focus[set.name] = list;
  }
  /* 버튼 상자(2026-10-26 k7) — State=Normal · Loading=False 변형마다 폭 · 높이와 라벨 글자의 폭 · x(2026-10-28 k16 전에는 State=Default — 개편으로 Normal 이 됐고
     로딩은 상태가 아니라 옵션이라 따로 뺀다). audit 이 사이트 버튼("버튼" 라벨)을 헤드리스 Chromium 으로 잰
     폭에서 글자 폭을 뺀 몫(테두리 + padding)과 맞춘다 — 글자 폭은 서체 · 자간 때문에 Figma 와 사이트가 다르다(Figma 는 텍스트 스타일의 자간을 지닌다) */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    /* Accordion(2026-10-29 k21 — 사람의 정의로 Variant Outline · Flat × Size Small · Medium · Large × State Collapsed · Expanded · Hover · Disabled).
       변형마다 헤더("Summary")의 높이 · 면 · 네 모서리(와 묶인 변수) · 제목("Title") 글자 칠 · 크기 · 보조 정보("Meta") 칠 · 셰브론("Chevron") 크기와 선 색.
       audit 이 사이트 CSS(.accordion summary · .sm/.md/.lg · :hover · .disabled · ::after)와 맞춘다.
       앞 아이콘(2026-10-29 k22 — 사람의 결정): 헤더의 "Icon" 인스턴스 — 순서(0 이 맨 앞) · 폭 · 높이 · 기본 보임 · 선 색(첫 VECTOR) · 연결된 속성.
       세트의 속성 정의(accordionProps — 이름 · 종류 · 기본값)도 함께 낸다. audit 이 .accordion summary>svg · .sm · .lg 의 width 와 맞춘다.
       숨긴 인스턴스는 하위 층을 내주지 않는다(k22 에 잼 — visible false 인 Icon 은 children 이 0 이고, 켜면 3 이다. I<인스턴스>;<원본 층> id 로도 못 얻는다).
       그래서 선 색은 이렇게 읽는다: 하위 층이 보이면 그 층 → 안 보이면 overrides 에 strokes 덮어쓰기가 없을 때 원본 컴포넌트의 층(그대로 물려받으므로 같다) →
       덮어쓰기가 있는데 숨겨져 있으면 값을 못 읽으므로 "override(hidden)" 으로 적는다(audit 은 NOTE 로 센다).
       헤더 줄(2026-10-30 k24 — 사이트 .accordion summary 가 gap 12 → 8, space-between 을 버리고 왼쪽 정렬): row 에 헤더의 방향 · itemSpacing · 주축 정렬 ·
       자식 순서(이름을 > 로 이음) · 제목의 가로 크기 방식과 글자 정렬 · 보조 정보의 가로 크기 방식을 낸다. audit 이 gap 은 .accordion summary 의 gap 과,
       배치는 "제목이 FILL + LEFT"(= 사이트의 margin-left:auto — 제목은 아이콘 바로 뒤, 보조 정보 · 셰브론은 오른쪽 끝)로 맞춘다 */
    if (set.name === "Accordion") components.accordionProps = Object.fromEntries(Object.entries(set.componentPropertyDefinitions).map(([k, d]) => [k, { type: d.type, def: d.defaultValue }]));
    const accInk = new Map();
    if (set.name === "Accordion") for (const v of set.children) {
      const s = v.findOne((k) => k.name === "Summary"), ic = s && s.children.find((k) => k.name === "Icon");
      if (!ic || ic.type !== "INSTANCE") continue;
      const icv = ic.findOne((k) => k.type === "VECTOR");
      if (icv) { accInk.set(ic.id, paint(icv.strokes)); continue; }
      if ((ic.overrides || []).some((o) => o.id !== ic.id && o.overriddenFields.includes("strokes"))) { accInk.set(ic.id, "override(hidden)"); continue; }
      const mc = await ic.getMainComponentAsync(), mv = mc && mc.findOne((k) => k.type === "VECTOR");
      accInk.set(ic.id, mv ? paint(mv.strokes) : null);
    }
    if (set.name === "Accordion") components.accordion = set.children.map((v) => {
      const s = v.findOne((k) => k.name === "Summary"), t = s && s.findOne((k) => k.name === "Title" && k.type === "TEXT"), m = s && s.findOne((k) => k.name === "Meta" && k.type === "TEXT");
      const ch = s && s.findOne((k) => k.name === "Chevron"), vec = ch && ch.findOne && ch.findOne((k) => k.type === "VECTOR");
      const ic = s && s.children.find((k) => k.name === "Icon");
      const rb = s && s.boundVariables && s.boundVariables.topLeftRadius;
      return { name: v.name, id: v.id, h: s ? +s.height.toFixed(2) : null, face: s ? paint(s.fills) : null,
        r: s ? [s.topLeftRadius, s.topRightRadius, s.bottomRightRadius, s.bottomLeftRadius] : null, rv: rb ? vname(rb) : null,
        title: t ? paint(t.fills) : null, fs: t ? (t.fontSize === figma.mixed ? "mixed" : t.fontSize) : null, meta: m ? paint(m.fills) : null,
        chevW: ch ? +ch.width.toFixed(2) : null, chev: vec ? paint(vec.strokes) : null,
        icon: ic ? { idx: s.children.indexOf(ic), w: +ic.width.toFixed(2), h: +ic.height.toFixed(2), vis: ic.visible, ink: accInk.has(ic.id) ? accInk.get(ic.id) : null, ref: ic.componentPropertyReferences || null } : null,
        row: s ? { lm: s.layoutMode, gap: s.itemSpacing, pa: s.primaryAxisAlignItems, order: s.children.map((k) => k.name).join(">"),
          tSz: t ? t.layoutSizingHorizontal : null, tAl: t ? t.textAlignHorizontal : null, mSz: m ? m.layoutSizingHorizontal : null } : null };
    });
    /* Breadcrumb(2026-10-30 k25 — 사람의 정의 2026-10-30: 경로는 언제나 홈 아이콘으로 시작 · 행 높이 24 한 크기 · 구분자 slash 12 · 상태 Default · Hover · Focus · Current).
       2026-11-02 k26 — 사람의 결정(2026-11-02): 상태는 "Breadcrumb" 세트 자체의 State 축에 둔다 — Type(Default · Collapsed) × State(Default · Hover · Focus).
       Current 는 축 값이 아니라 모든 변형의 마지막 항목(현재 페이지)이다. k25 의 항목 세트 "Breadcrumb Item" 은 지웠다 — 남아 있으면 audit 이 어긋남으로 알리도록
       계속 덤프한다(components.breadcrumbItem — 없으면 null).
       행: 변형마다 높이 · 방향 · itemSpacing · 세로 정렬과 보이는 자식을 순서대로 — 이름 · 종류 · 크기, 인스턴스면 원본 이름(main)과 원본이 든 세트(set),
       아이콘(자신이 icon/* 인스턴스이거나 그 안 첫 icon/* 인스턴스 — 이름 · 폭 · 높이 · 벡터 칠), 글자가 있으면 첫 글자 칠(text)과 글자 정보(tx — 칠 · 밑줄 · 서체 · 크기 · 행간),
       항목 안 "Focus Ring"(ring — 항목 칸 기준 dx · dy · 크기 · 선 · 굵기 · 정렬 · 면). 아이콘 이름은 원본 컴포넌트에서 읽는다 — 층 이름은 "Icon" · "Separator" 로 바꿔 두었다(k25).
       out.k26 = true 로 새 덤프임을 적는다(옛 덤프에는 tx · ring 이 없다). audit 이 사이트 .breadcrumb 규칙과 맞춘다(breadcrumbExpect) */
    if (set.name === "Breadcrumb" || set.name === "Breadcrumb Item") {
      const vecInk = (n) => [...new Set(n.findAll((x) => ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "BOOLEAN_OPERATION"].includes(x.type) && x.visible !== false).flatMap((x) => [paint(x.strokes), paint(x.fills)]).filter((x) => x !== "-"))].sort().join("|");
      const iconOf = async (n) => {
        const list = n.type === "INSTANCE" ? [n].concat(n.findAll((x) => x.type === "INSTANCE")) : "findAll" in n ? n.findAll((x) => x.type === "INSTANCE") : [];
        for (const i of list) { const m = await i.getMainComponentAsync(); if (m && /^icon\//.test(m.name)) return { name: m.name.replace(/^icon\/(outline|filled)\//, ""), w: +i.width.toFixed(2), h: +i.height.toFixed(2), ink: vecInk(i) }; }
        return null;
      };
      const txt = (n) => { const t = n.type === "TEXT" ? n : "findOne" in n ? n.findOne((x) => x.type === "TEXT" && x.visible !== false) : null; return t; };
      const tinfo = (t) => (t ? { fill: paint(t.fills), deco: t.textDecoration === figma.mixed ? "mixed" : t.textDecoration, font: t.fontName === figma.mixed ? "mixed" : t.fontName.family + " " + t.fontName.style, fs: t.fontSize === figma.mixed ? "mixed" : t.fontSize, lh: t.lineHeight === figma.mixed ? "mixed" : t.lineHeight.unit === "PIXELS" ? t.lineHeight.value : t.lineHeight.unit } : null);
      const ringOf = (n) => {
        const r = "findOne" in n ? n.findOne((k) => k.name === "Focus Ring") : null;
        return r ? { dx: +(r.absoluteTransform[0][2] - n.absoluteTransform[0][2]).toFixed(2), dy: +(r.absoluteTransform[1][2] - n.absoluteTransform[1][2]).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), stroke: paint(r.strokes), sw: r.strokeWeight === figma.mixed ? "mixed" : r.strokeWeight, align: r.strokeAlign, fill: paint(r.fills), vis: r.visible } : null;
      };
      const out = { def: set.defaultVariant ? set.defaultVariant.name : null, id: set.id, k26: true, variants: [] };
      for (const v of set.children) {
        const e = { name: v.name, id: v.id, w: +v.width.toFixed(2), h: +v.height.toFixed(2) };
        if (set.name === "Breadcrumb") {
          Object.assign(e, { lm: v.layoutMode, gap: v.itemSpacing, ca: v.counterAxisAlignItems, kids: [] });
          for (const k of v.children) {
            if (k.visible === false) continue;
            const kd = { n: k.name, t: k.type, w: +k.width.toFixed(2), h: +k.height.toFixed(2) };
            if (k.type === "INSTANCE") { const m = await k.getMainComponentAsync(); kd.main = m ? m.name : null; kd.set = m && m.parent && m.parent.type === "COMPONENT_SET" ? m.parent.name : null; }
            const ic = await iconOf(k); if (ic) kd.icon = ic;
            const t = txt(k); if (t) { kd.text = paint(t.fills); kd.tx = tinfo(t); }
            kd.ring = ringOf(k);
            e.kids.push(kd);
          }
        } else {
          e.text = tinfo(txt(v));
          e.icon = await iconOf(v);
          e.ring = ringOf(v);
        }
        out.variants.push(e);
      }
      components[set.name === "Breadcrumb" ? "breadcrumb" : "breadcrumbItem"] = out;
    }
    /* Card(2026-11-03 k29 — 사람의 정의 2026-11-02 ~ 11-03: 유형 기본 정보 · 상태 · 목록/표 · 선택 · 빈/오류 · Loading, 크기 md · sm, 선택 카드만 Hover · Selected · Disabled).
       세트 축은 Type × Size × State(State 는 Type=Selection 에만 여럿) × Variant(2026-11-03 k32 — Outline · Flat, Flat 은 State=Default 만). 변형마다 바깥 상자(폭 · 높이(k32) · 최소 폭 · 방향 · padding · gap 과 묶인 변수 · 면 · 테두리 · 모서리와 변수 ·
       효과 스타일 · 안쪽 그림자[토큰, spread] · 바깥 그림자 수)와 부품을 이름으로 읽는다 — Head(padding · gap · 변수 · 오른쪽 Button 원본 이름 — k31), Title · Description(텍스트 스타일 · 크기 · 행간 · 서체 · 칠 · 글 상자 높이 h — k29 마무리에 더함),
       Icon(선택 카드 앞 아이콘 — 자리 · 크기 · 선 색), Meta(상태 카드 키-값 — 열 간격 · Keys/Values 행 간격 · 칠 · 스타일 · 행 수),
       Empty(빈 · 오류 본문 — padding · gap · 면 · 테두리, Face 면 · 크기 · 모서리 값과 변수, Icon 선 · 크기(k31), Message · Hint 글자, Action 안 Button 원본 이름),
       Skeleton(Loading — 원본 이름). 자식 이름 순서(kids)도 낸다. audit 이 사이트 .card 규칙 · components.data.js card 와 맞춘다(cardExpect) */
    if (set.name === "Card") {
      const tsMap = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.id, s.name]));
      const esMap = new Map((await figma.getLocalEffectStylesAsync()).map((s) => [s.id, s.name]));
      const vb = (n, k) => { const b = n && n.boundVariables && n.boundVariables[k]; const x = b && byId.get(b.id); return x ? x.name : null; };
      const box = (n) => (n ? { pad: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft], padV: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map((k) => vb(n, k)), gap: n.itemSpacing, gapV: vb(n, "itemSpacing"), lm: n.layoutMode } : null);
      const tx = (t) => (t ? { st: t.textStyleId === figma.mixed ? "mixed" : tsMap.get(t.textStyleId) || null, fs: t.fontSize === figma.mixed ? "mixed" : t.fontSize, lh: t.lineHeight === figma.mixed ? "mixed" : t.lineHeight.unit === "PIXELS" ? t.lineHeight.value : t.lineHeight.unit, font: t.fontName === figma.mixed ? "mixed" : t.fontName.family + " " + t.fontName.style, fill: paint(t.fills), vis: t.visible, h: +t.height.toFixed(2) } : null);
      const ink = (n) => (n ? [...new Set(n.findAll((x) => ["VECTOR", "ELLIPSE", "LINE", "RECTANGLE", "POLYGON"].includes(x.type) && x.visible !== false).map((x) => paint(x.strokes)).filter((x) => x !== "-"))].sort().join("|") : null);
      const kid = (p, nm) => (p && "children" in p ? p.children.find((k) => k.name === nm) || null : null);
      const out = { def: set.defaultVariant ? set.defaultVariant.name : null, id: set.id, k29: true, variants: [] };
      for (const v of set.children) {
        const fx = v.effects.filter((e) => e.visible !== false);
        const e = Object.assign({ name: v.name, id: v.id, w: +v.width.toFixed(2), h: +v.height.toFixed(2), minW: v.minWidth, kids: v.children.map((k) => k.name).join(">") }, box(v), {
          fill: paint(v.fills), stroke: paint(v.strokes), sw: v.strokeWeight === figma.mixed ? "mixed" : v.strokeWeight, sa: v.strokeAlign,
          r: [v.topLeftRadius, v.topRightRadius, v.bottomRightRadius, v.bottomLeftRadius], rv: vb(v, "topLeftRadius"),
          fx: { style: v.effectStyleId ? esMap.get(v.effectStyleId) || "?" : null, inner: fx.filter((x) => x.type === "INNER_SHADOW").map((x) => [vname(x.boundVariables && x.boundVariables.color) || "raw", x.spread || 0]), drop: fx.filter((x) => x.type === "DROP_SHADOW").length } });
        const head = kid(v, "Head");
        if (head) { const hb = head.children.find((k) => k.type === "INSTANCE" && k.name === "Button"), hm = hb ? await hb.getMainComponentAsync() : null; e.head = Object.assign(box(head), { kids: head.children.map((k) => k.name).join(">"), btn: hm ? hm.name : null }); }   // btn: 헤더 '전체 보기' 원본 이름(k31)
        const title = v.findOne((k) => k.name === "Title" && k.type === "TEXT"), desc = v.findOne((k) => k.name === "Description" && k.type === "TEXT");
        e.title = tx(title); e.desc = tx(desc);
        const icon = kid(v, "Icon");
        if (icon) e.icon = { idx: v.children.indexOf(icon), w: +icon.width.toFixed(2), h: +icon.height.toFixed(2), ink: ink(icon) };
        const meta = kid(v, "Meta");
        if (meta) { const ks = kid(meta, "Keys"), vs = kid(meta, "Values"), col = (c) => (c ? Object.assign(box(c), { n: c.children.length, fill: [...new Set(c.children.map((t) => paint(t.fills)))].join("|"), st: [...new Set(c.children.map((t) => (t.type === "TEXT" ? tsMap.get(t.textStyleId) || null : t.type)))].join("|") }) : null); e.meta = Object.assign(box(meta), { keys: col(ks), vals: col(vs) }); }
        const em = kid(v, "Empty");
        if (em) {
          const face = em.findOne((k) => k.name === "Face"), act = kid(em, "Action"), btn = act && act.findOne((k) => k.type === "INSTANCE" && k.name === "Button");
          const bm = btn ? await btn.getMainComponentAsync() : null;
          e.empty = Object.assign(box(em), { fill: paint(em.fills), stroke: paint(em.strokes), kids: em.children.map((k) => k.name).join(">"),
            face: face ? (() => { const fi = face.findOne((k) => k.name === "Icon"); return { w: +face.width.toFixed(2), h: +face.height.toFixed(2), fill: paint(face.fills), rv: vb(face, "topLeftRadius"), r: face.cornerRadius === figma.mixed ? "mixed" : face.cornerRadius, ink: ink(fi), iw: fi ? +fi.width.toFixed(2) : null, ih: fi ? +fi.height.toFixed(2) : null }; })() : null,   // r · iw · ih: 칸 없는 아이콘 36(k31)
            msg: tx(kid(em, "Message")), hint: tx(kid(em, "Hint")), btn: bm ? bm.name : null });
        }
        const sk = [];
        for (const k of v.children) if (k.type === "INSTANCE" && /^Skeleton/.test(k.name)) { const m = await k.getMainComponentAsync(); sk.push(m ? m.name : null); }
        if (sk.length) e.skel = sk;
        out.variants.push(e);
      }
      components.card = out;
    }
    if (set.name === "Text Field") components.textField = set.children.map((v) => { const f = v.findOne((k) => k.name === "Input" && "strokes" in k); return { variant: v.name, id: v.id, h: f ? +f.height.toFixed(2) : null }; });   // 입력칸 높이(2026-10-28 k16) — audit 이 .field input 높이와 맞춘다
    if (set.name !== "Button") continue;
    components.buttons = set.children.filter((v) => /(?:^|, )State=Normal(?:,|$)/.test(v.name) && !/(?:^|, )Loading=True(?:,|$)/.test(v.name)).map((v) => {
      const t = v.findOne((k) => k.type === "TEXT" && k.visible !== false);
      return { name: v.name, id: v.id, w: +v.width.toFixed(2), h: +v.height.toFixed(2), stroke: paint(v.strokes), sw: v.strokeWeight === figma.mixed ? "mixed" : v.strokeWeight, label: t ? [t.characters, +t.width.toFixed(2), +t.x.toFixed(2)] : null };
    });
    /* Loading 변형(2026-10-28 k17) — 사이트 .btn.loading 은 라벨 · 아이콘을 투명하게 두고 자리는 지키며 ::after 스피너만 가운데 보인다.
       변형마다 크기와 짝(같은 이름의 Loading=False) 크기, 스피너("Spinner")의 배치 · 중심 어긋남 · 크기 · 선 색, 그리고 스피너 말고 보이는 층(leak)을 적는다.
       leak: 글자는 보이는 칠 중 불투명도 0 이 아닌 것이 있으면, 나머지 층은 층 불투명도가 0 이 아니면 — visible 은 보지 않는다(아이콘은 인스턴스에서 속성으로 켜진다) */
    components.btnLoading = set.children.filter((v) => /(?:^|, )Loading=True(?:,|$)/.test(v.name)).map((v) => {
      const sib = set.children.find((s) => s.name === v.name.replace("Loading=True", "Loading=False"));
      const sp = v.children.find((k) => k.name === "Spinner");
      const vec = sp && (sp.type === "VECTOR" ? sp : sp.findOne && sp.findOne((k) => k.type === "VECTOR"));
      const leak = v.children.filter((k) => k !== sp && (k.type === "TEXT" ? (k.fills === figma.mixed || k.fills.some((f) => f.visible !== false && f.opacity !== 0)) : k.opacity > 0)).map((k) => k.name);
      return {
        name: v.name, id: v.id, w: +v.width.toFixed(2), h: +v.height.toFixed(2), sibW: sib ? +sib.width.toFixed(2) : null, sibH: sib ? +sib.height.toFixed(2) : null,
        spinner: sp ? { abs: sp.layoutPositioning, dx: +(sp.x + sp.width / 2 - v.width / 2).toFixed(2), dy: +(sp.y + sp.height / 2 - v.height / 2).toFixed(2), w: +sp.width.toFixed(2), h: +sp.height.toFixed(2), stroke: vec ? paint(vec.strokes) : "-" } : null,
        leak,
      };
    });
  }
  /* 효과(그림자) 색의 변수 연결(2026-10-26 k6) — 현재 페이지의 컴포넌트 세트 안, 인스턴스 밖 노드의 보이는 그림자를 본다.
     효과 스타일(Shadow/1 …)을 쓴 노드는 연결된 것으로 친다 — 스타일 자체의 값은 effectStyles 로 따로 본다.
     거짓 경보를 피하려고 빼는 것: 인스턴스 속 노드(원본 쪽에서 본다 — 그래서 인스턴스에서 효과를 덮어쓴 것은 여기서 못 잡는다),
     숨긴 효과(visible false), 색이 없는 흐림(LAYER_BLUR · BACKGROUND_BLUR). 세트 밖 컴포넌트와 문서 프레임은 범위 밖이다.
     변수는 이 파일의 로컬 변수로만 알아본다 — 라이브러리 변수에 묶인 색은 묶이지 않은 것으로 나온다(지금 이 파일은 로컬 변수만 쓴다) */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    for (const n of set.findAll((k) => "effects" in k && k.effects.length > 0 && !inInstance(k))) {
      effectColors.nodes++;
      if (n.effectStyleId && n.effectStyleId !== figma.mixed) { effectColors.styled++; continue; }
      let v = n; while (v.parent && v.parent.type !== "COMPONENT_SET") v = v.parent;
      for (const e of n.effects) {
        if (e.visible === false || !e.color) continue;
        if (e.boundVariables && e.boundVariables.color && byId.get(e.boundVariables.color.id)) { effectColors.bound++; continue; }
        effectColors.raw.push({ page: p.name, set: set.name, variant: v.name, node: n.name, id: n.id, type: e.type, color: "#" + hex2(e.color.r) + hex2(e.color.g) + hex2(e.color.b) + "@" + +e.color.a.toFixed(2), spread: e.spread || 0, blur: e.radius || 0 });
      }
    }
  }
  /* Tag 높이(2026-10-26 k5) — 크기마다 [가장 낮은 높이, 가장 높은 높이, 변형 수]. audit 이 사이트 실측(.tag.sm · .tag · .tag.lg)과 ±0.5 로 맞춘다 */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    if (set.name !== "Tag") continue;
    const by = {};
    for (const v of set.children) { const m = /(?:^|, )Size=([^,]+)/.exec(v.name); if (!m) continue; const e = by[m[1]] || (by[m[1]] = [Infinity, -Infinity, 0]); e[0] = Math.min(e[0], v.height); e[1] = Math.max(e[1], v.height); e[2]++; }
    components.tagHeights = Object.fromEntries(Object.entries(by).map(([k, e]) => [k, [+e[0].toFixed(2), +e[1].toFixed(2), e[2]]]));
  }
  /* 반투명 컴포넌트(2026-10-27 k10) — 자기 불투명도가 1 이 아닌 컴포넌트(세트의 변형 · 단독 컴포넌트)와 컴포넌트 세트. 조사하는 세트(SURVEY_SETS)만이 아니라 전부 본다.
     비활성을 변형 불투명도 0.4 로 흐린 것이 21개 있었다(k10 에 잼) — 저장소 규칙은 --surface-disable-primary · --foreground-disable-primary 로 칠하기다(CLAUDE.md).
     audit 이 OPACITY_OK 에 선언된 것 말고는 어긋남으로 낸다. 안쪽 층의 불투명도는 적지 않는다 — 표 정렬 아이콘 0.45 처럼 사이트도 opacity 로 그리는 표현이 있다 */
  for (const n of p.findAllWithCriteria({ types: ["COMPONENT", "COMPONENT_SET"] })) {
    if (!(n.opacity < 0.999)) continue;
    components.translucent.push({ set: n.type === "COMPONENT" && n.parent && n.parent.type === "COMPONENT_SET" ? n.parent.name : n.type === "COMPONENT_SET" ? "(세트)" : null, name: n.name, id: n.id, opacity: +n.opacity.toFixed(2) });
  }
  /* 선택 컨트롤의 칠(2026-10-27 k11) — audit 이 사이트 CSS 와 맞춘다. Radio Button 의 Value=Checked 변형마다 Circle 의 면 · 선(굵기)과 Dot 의 면,
     Slider 의 State=Disabled 변형마다 Label · Value 글자의 칠. 선택된 Radio 가 흰 면 + brand 링 + brand 점으로 사이트(brand 면 + 흰 점)와 달랐고,
     비활성 Slider 의 라벨 · 값은 흐리지 않았다. 세트가 없으면 null 로 남는다 */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    if (set.name === "Radio Button") components.controls.radio = set.children.filter((v) => /(?:^|, )Value=Checked(?:,|$)/.test(v.name)).map((v) => {
      const c = v.findOne((k) => k.name === "Circle"), d = v.findOne((k) => k.name === "Dot");
      return { variant: v.name, id: v.id, face: c ? paint(c.fills) : null, ring: c ? paint(c.strokes) : null, sw: c && c.strokeWeight !== figma.mixed ? c.strokeWeight : null, dot: d ? paint(d.fills) : null };
    });
    if (set.name === "Slider") components.controls.sliderDisabled = set.children.filter((v) => /(?:^|, )State=Disabled(?:,|$)/.test(v.name)).map((v) => {
      const t = (nm) => { const x = v.findOne((k) => k.type === "TEXT" && k.name === nm); return x ? paint(x.fills) : null; };
      return { variant: v.name, id: v.id, label: t("Label"), value: t("Value") };
    });
  }
  /* 비활성 안쪽 층(2026-10-27 k12) — 이름에 Disabled 가 든 변형 · 노드(예: Date Picker 안의 Day/Disabled)의 자신과 자손 가운데 불투명도가 1 이 아닌 층.
     인스턴스 속은 빼고 본다(원본 쪽에서 잡힌다). 이름으로 고르므로 비활성 밖의 반투명(표 정렬 아이콘 0.45 — 사이트도 opacity .45)은 걸리지 않는다.
     변형 자신의 불투명도는 위 "반투명 컴포넌트" 가 본다 */
  const underInst = (n, root) => { for (let q = n.parent; q && q !== root; q = q.parent) if (q.type === "INSTANCE") return true; return false; };
  for (const c of p.findAllWithCriteria({ types: ["COMPONENT"] })) {
    const roots = /Disabled/.test(c.name) ? [c] : c.findAll((k) => /Disabled/.test(k.name) && !underInst(k, c));
    const seen = new Set();
    for (const r of roots) for (const k of [r].concat(r.findAll(() => true))) {
      if (k === c || seen.has(k.id) || !("opacity" in k) || !(k.opacity < 0.999) || underInst(k, c)) continue;
      seen.add(k.id);
      components.disabledInner.push({ set: c.parent && c.parent.type === "COMPONENT_SET" ? c.parent.name : null, variant: c.name, id: k.id, name: k.name, opacity: +k.opacity.toFixed(2) });
    }
  }
  /* Chip 의 삭제(x) · 비활성 Item Tile(2026-10-27 k12) — audit 이 사이트 CSS(.chip .x · .chip[disabled] .x · .tile[disabled] .ico · span:not(.tag))와 맞춘다.
     Chip Type=Input 변형마다 Remove 면과 그 안 아이콘 벡터의 선, Item Tile State=Disabled 변형마다 Icon 프레임 면 · 아이콘 선 · Description 글자 칠 */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    const vecs = (n) => { const ic = n && n.findOne((k) => k.type === "INSTANCE"); const vs = ic ? ic.findAll((k) => k.type === "VECTOR" && k.visible !== false) : []; return vs.length ? [...new Set(vs.map((x) => paint(x.strokes)))].join("|") : null; };
    if (set.name === "Chip") components.chipX = set.children.filter((v) => /(?:^|, )Type=Input(?:,|$)/.test(v.name)).map((v) => {
      const r = v.findOne((k) => k.name === "Remove");
      return { variant: v.name, id: v.id, face: r ? paint(r.fills) : null, icon: vecs(r) };
    });
    if (set.name === "Item Tile") components.tileDisabled = set.children.filter((v) => /(?:^|, )State=Disabled(?:,|$)/.test(v.name)).map((v) => {
      const ico = v.findOne((k) => k.type === "FRAME" && k.name === "Icon"), d = v.findOne((k) => k.type === "TEXT" && k.name === "Description");
      return { variant: v.name, id: v.id, icoFace: ico ? paint(ico.fills) : null, icon: vecs(ico), desc: d ? paint(d.fills) : null };
    });
  }
  /* Date Picker 필드 · 날짜 칸(2026-10-27 k14) — audit 이 사이트 CSS(.datepicker .field-btn · .field .affix 와 그 상태 규칙, .calendar .day 상태 규칙)와 맞춘다.
     필드: 변형마다 "Field" 칸(버튼형은 .field-btn, 입력형은 .affix)의 높이 · 면 · 테두리(굵기) · 바깥 그림자([토큰, spread, blur]),
     입력형은 안쪽 "Input" 노드의 효과 수(사이트는 입력칸에 후광이 없다 — 고리는 .affix 가 그린다).
     날짜 칸: Calendar Day 변형마다 면 · 테두리(굵기 · 정렬) · 네 모서리(왼위 · 오위 · 오아래 · 왼아래) · 글자 칠 · 고리(Focus Ring 의 선|굵기|정렬) */
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    const drops = (n) => n.effects.filter((e) => e.visible !== false && e.type === "DROP_SHADOW").map((e) => [vname(e.boundVariables && e.boundVariables.color) || "raw", e.spread || 0, e.radius || 0]);
    if (set.name === "Date Picker") components.datePicker = set.children.map((v) => {
      const f = v.findOne((k) => k.name === "Field" && "strokes" in k), inp = f && f.findOne((k) => k.name === "Input");
      return { variant: v.name, id: v.id, h: f ? +f.height.toFixed(2) : null, fill: f ? paint(f.fills) : null, stroke: f ? paint(f.strokes) : null, sw: f && f.strokeWeight !== figma.mixed ? f.strokeWeight : null, drop: f ? drops(f) : null, innerFx: inp ? inp.effects.filter((e) => e.visible !== false).length : null };
    });
    if (set.name === "Calendar Day") components.calendarDay = set.children.map((v) => {
      const t = v.findOne((k) => k.type === "TEXT"), r = v.findOne((k) => k.name === "Focus Ring");
      return { variant: v.name, id: v.id, fill: paint(v.fills), stroke: paint(v.strokes), sw: v.strokeWeight === figma.mixed ? "mixed" : v.strokeWeight, align: v.strokeAlign, radius: [v.topLeftRadius, v.topRightRadius, v.bottomRightRadius, v.bottomLeftRadius], text: t ? paint(t.fills) : null, ring: r ? paint(r.strokes) + "|" + r.strokeWeight + "|" + r.strokeAlign : null };
    });
    /* 달력(2026-10-27 k15) — Calendar 세트의 화면(View) 변형마다 달력 안 날짜 칸("Day/<상태>" 프레임, 인스턴스 밖)의 [이름|면|글자] 종류와
       적용 버튼("Apply" 인스턴스)의 State 값. audit 이 날짜 칸을 Calendar Day 기대값(사이트 .calendar .day 상태 규칙)과, 적용을 비활성(값이 그대로면 꺼짐)과 맞춘다 */
    if (set.name === "Calendar") components.calendar = set.children.map((v) => ({
      variant: v.name, id: v.id,
      cells: [...new Set(v.findAll((k) => /^Day\//.test(k.name) && k.type === "FRAME").map((k) => { const t = k.findOne((x) => x.type === "TEXT"); return k.name + "|" + paint(k.fills) + "|" + (t ? paint(t.fills) : "-"); }))].sort(),
      apply: v.findAll((k) => k.type === "INSTANCE" && k.name === "Apply").map((k) => (k.componentProperties.State || {}).value || null),
    }));
  }
}
for (const k of Object.keys(FOCUS_BOX)) if (!components.focus[k]) components.focus[k] = null;   // 세트가 없으면 null — audit 이 어긋남으로 낸다
/* Flat 이 놓인 바탕(2026-11-03 k32) — 사람의 결정: flat 은 background/neutral/secondary 바탕 위에서만(흰 바탕 금지). 현재 페이지에서 Variant=Flat 인
   Card · KPI · Chart Card 인스턴스마다 면이 보이는 가장 가까운 조상의 칠을 적는다. audit 이 figma.variant.flat.canvas 와 맞춘다 */
components.flatCanvas = [];
for (const p of figma.root.children) {
  if (!isCurrent(p)) continue;
  for (const n of p.findAllWithCriteria({ types: ["INSTANCE"] })) {
    if (!FLAT_SETS.includes(n.name)) continue;
    const vp = n.componentProperties && n.componentProperties.Variant;
    if (!vp || vp.value !== "Flat") continue;
    let a = n.parent, bg = null;
    while (a && a.type !== "PAGE") { if ("fills" in a && Array.isArray(a.fills) && a.fills.some((f) => f.visible !== false && f.opacity !== 0)) { bg = paint(a.fills); break; } a = a.parent; }
    components.flatCanvas.push({ page: p.name, id: n.id, set: n.name, bg });
  }
}
/* Chart 세트(2026-11-04 k33 — 사람의 결정 2026-11-03: 탐색형 차트는 Chart.js, Figma 는 토큰 + 4종 대표 컴포넌트 Type = Timeseries · Bar · Donut · Mixed).
   변형마다 카드 상자(면 · 테두리 · 굵기 · 모서리와 변수 · padding · gap 과 변수) · 제목("Chart Title": 스타일 · 크기 · 칠) · "Canvas"(폭 · 높이)와 그 안의 마크 —
   선(strokes 가 있는 VECTOR: 굵기 · 선 색), 영역(fills 가 있는 VECTOR: 칠 · 층 불투명도 — Chart.js 의 alpha 0.24 를 층 불투명도로 둔다), 막대("Series" 안 RECTANGLE: 칠 · 네 모서리 · 폭),
   호(innerRadius 가 있는 ELLIPSE: 칠 · 구멍 비율 · 시작 · 끝 각도(도) · 테두리 색 · 굵기), 격자(LINE: 선 색 · 굵기), 눈금 글자("Tick …" TEXT: 스타일|크기|칠 의 종류와 수 · 라벨),
   범례("Legend" 의 Item: 글 · 견본 칠 · 견본 폭 · 글자 칠 · 스타일), hover 점("Hover" 바로 아래 ELLIPSE: 지름 · 칠 · 테두리 · 굵기), 툴팁("Tooltip": 면 · 모서리 · padding · 제목 · 행(글 · 칠 · 스타일 · 견본 칠 · 지름)),
   도넛 가운데 글("Center"). audit 이 CSS --chart-* · components.data.js data-visual.figma.chart · CHART_DATA(예제 data-spec) · ds-chart.src.js 와 맞춘다(chartExpect · diffChart). 세트가 없으면 null */
components.chart = null;
for (const p of figma.root.children) {
  if (!isCurrent(p)) continue;
  const set = p.findAllWithCriteria({ types: ["COMPONENT_SET"] }).find((s) => s.name === "Chart");
  if (!set) continue;
  const tsMap = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.id, s.name]));
  const vb = (n, k) => { const b = n && n.boundVariables && n.boundVariables[k]; const x = b && byId.get(b.id); return x ? x.name : null; };
  const deg = (r) => +((r * 180) / Math.PI).toFixed(2);
  const tx = (t) => (t ? { chars: t.characters, st: t.textStyleId === figma.mixed ? "mixed" : tsMap.get(t.textStyleId) || null, fs: t.fontSize === figma.mixed ? "mixed" : t.fontSize, font: t.fontName === figma.mixed ? "mixed" : t.fontName.family + " " + t.fontName.style, fill: paint(t.fills), h: +t.height.toFixed(2) } : null);
  const out = { id: set.id, page: p.name, def: set.defaultVariant ? set.defaultVariant.name : null, variants: [] };
  for (const v of set.children) {
    const canvas = v.findOne((k) => k.name === "Canvas" && k.type === "FRAME");
    const e = { name: v.name, id: v.id, w: +v.width.toFixed(2), h: +v.height.toFixed(2), fill: paint(v.fills), stroke: paint(v.strokes), sw: v.strokeWeight === figma.mixed ? "mixed" : v.strokeWeight,
      r: [v.topLeftRadius, v.topRightRadius, v.bottomRightRadius, v.bottomLeftRadius], rv: vb(v, "topLeftRadius"), pad: [v.paddingTop, v.paddingRight, v.paddingBottom, v.paddingLeft], padV: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map((k) => vb(v, k)), gap: v.itemSpacing, gapV: vb(v, "itemSpacing"),
      title: tx(v.findOne((k) => k.name === "Chart Title" && k.type === "TEXT")), meta: tx(v.findOne((k) => k.name === "Meta" && k.type === "TEXT")), canvas: canvas ? { w: +canvas.width.toFixed(2), h: +canvas.height.toFixed(2), sv: canvas.layoutSizingVertical } : null };
    if (canvas) {
      const all = canvas.findAll(() => true);
      const under = (n, nm) => { for (let q = n.parent; q && q !== canvas; q = q.parent) if (q.name === nm) return true; return false; };
      e.lines = all.filter((k) => k.type === "VECTOR" && k.strokes.some((s) => s.visible !== false) && k.name !== "Caret").map((k) => ({ name: k.name, sw: k.strokeWeight === figma.mixed ? "mixed" : k.strokeWeight, stroke: paint(k.strokes) }));
      e.areas = all.filter((k) => k.type === "VECTOR" && k.fills !== figma.mixed && k.fills.some((f) => f.visible !== false) && k.name !== "Caret").map((k) => ({ name: k.name, fill: paint(k.fills), opacity: +k.opacity.toFixed(2) }));
      e.bars = all.filter((k) => k.type === "RECTANGLE" && under(k, "Series")).map((k) => ({ name: k.name, fill: paint(k.fills), r: [k.topLeftRadius, k.topRightRadius, k.bottomRightRadius, k.bottomLeftRadius], w: +k.width.toFixed(2), h: +k.height.toFixed(2),
        /* 2026-11-05 k35 — stroke 수 · 굵기(막대는 stroke 없음), 자리(누적 세그먼트 사이 틈을 audit 이 잰다) */
        st: k.strokes.filter((x) => x.visible !== false && x.opacity !== 0).length, sw: k.strokeWeight === figma.mixed ? "mixed" : k.strokeWeight, x: +k.x.toFixed(2), y: +k.y.toFixed(2) }));
      e.arcs = all.filter((k) => k.type === "ELLIPSE" && k.arcData && k.arcData.innerRadius > 0).map((k) => ({ name: k.name, fill: paint(k.fills), inner: +k.arcData.innerRadius.toFixed(3), deg: [deg(k.arcData.startingAngle), deg(k.arcData.endingAngle)], stroke: paint(k.strokes), sw: k.strokeWeight === figma.mixed ? "mixed" : k.strokeWeight, d: +k.width.toFixed(2) }));
      e.grid = all.filter((k) => k.type === "LINE").map((k) => ({ name: k.name, stroke: paint(k.strokes), sw: k.strokeWeight === figma.mixed ? "mixed" : k.strokeWeight }));
      const ticks = all.filter((k) => k.type === "TEXT" && /^Tick /.test(k.name)).map(tx);
      e.ticks = { n: ticks.length, kinds: [...new Set(ticks.map((t) => t.st + "|" + t.fs + "|" + t.fill))], labels: ticks.map((t) => t.chars) };
      const legend = canvas.children.find((k) => k.name === "Legend");
      e.legend = legend ? { dir: legend.layoutMode, gap: legend.itemSpacing, x: +legend.x.toFixed(2), y: +legend.y.toFixed(2), items: legend.children.map((it) => { const sw = it.findOne((k) => k.type === "RECTANGLE" || k.type === "ELLIPSE"), t = it.findOne((k) => k.type === "TEXT"); return { text: t ? t.characters : null, swatch: sw ? paint(sw.fills) : null, swW: sw ? +sw.width.toFixed(2) : null, swH: sw ? +sw.height.toFixed(2) : null, swT: sw ? sw.type : null, swR: sw ? +cr(sw).toFixed(2) : null, fill: t ? paint(t.fills) : null, st: t ? tsMap.get(t.textStyleId) || null : null }; }) } : null;
      const hover = canvas.children.find((k) => k.name === "Hover");
      e.points = hover ? hover.children.filter((k) => k.type === "ELLIPSE").map((k) => ({ name: k.name, d: +k.width.toFixed(2), fill: paint(k.fills), stroke: paint(k.strokes), sw: k.strokeWeight === figma.mixed ? "mixed" : k.strokeWeight })) : [];
      const tip = hover ? hover.children.find((k) => k.name === "Tooltip") : null;
      e.tooltip = tip ? { fill: paint(tip.fills), r: tip.cornerRadius === figma.mixed ? "mixed" : tip.cornerRadius, pad: [tip.paddingTop, tip.paddingRight, tip.paddingBottom, tip.paddingLeft], title: tx(tip.findOne((k) => k.name === "Title" && k.type === "TEXT")),
        rows: tip.findAll((k) => k.name === "Row").map((row) => { const t = row.findOne((k) => k.type === "TEXT"), dot = row.findOne((k) => k.type === "ELLIPSE"); return { text: t ? t.characters : null, fill: t ? paint(t.fills) : null, st: t ? tsMap.get(t.textStyleId) || null : null, swatch: dot ? paint(dot.fills) : null, swD: dot ? +dot.width.toFixed(2) : null }; }) } : null;
      e.center = tx(canvas.findOne((k) => k.name === "Center" && k.type === "TEXT"));
      e.centerType = centerTx(canvas.findOne((k) => k.name === "Center" && k.type === "TEXT"));   // 스타일 · 행간 · 가운데(k34)
    }
    out.variants.push(e);
  }
  components.chart = out;
}
/* 컴포넌트 밖 정적 차트(2026-11-05 k35) — 패턴 예시(대시보드)처럼 인스턴스가 아니라 프레임으로 그린 도넛 · 막대 트랙.
   도넛 = 호(innerRadius > 0 인 ELLIPSE)를 둘 이상 가진 프레임: 호 각도 · 칠, 호 사이 틈, 호 테두리 수, 경계 구분선(donutDiv), 같은 행(도넛의 부모)의 범례 견본.
   트랙 = 높이 12 인 프레임 중 앞뒤 형제가 TEXT 인 것(.chart .row 의 .lbl + .bar + .num): 모서리(maxR). audit 이 CSS .donut · .donut i · .chart-legend i · .chart .bar 와 patterns.data.js 의 --a 와 맞춘다 */
components.staticCharts = { donuts: [], tracks: [] };
for (const p of figma.root.children) {
  if (!isCurrent(p)) continue;
  const inComp = (n) => { for (let q = n.parent; q && q.type !== "PAGE"; q = q.parent) if (q.type === "COMPONENT" || q.type === "COMPONENT_SET" || q.type === "INSTANCE") return true; return false; };
  for (const f of p.findAllWithCriteria({ types: ["FRAME"] })) {
    if (f.height === 12 && f.parent && f.parent.layoutMode === "HORIZONTAL") { const sib = f.parent.children, i = sib.indexOf(f); if (i > 0 && i < sib.length - 1 && sib[i - 1].type === "TEXT" && sib[i + 1].type === "TEXT" && !inComp(f)) components.staticCharts.tracks.push({ page: p.name, id: f.id, r: maxR(f) }); }
    const arcs = f.children.filter((k) => k.type === "ELLIPSE" && k.arcData && k.arcData.innerRadius > 0);
    if (arcs.length < 2 || inComp(f)) continue;
    const a = arcs.map((e) => [e.arcData.startingAngle, e.arcData.endingAngle].map((x) => +((x * 180) / Math.PI).toFixed(2)).concat(paint(e.fills))).sort((x, y) => x[0] - y[0]);
    const lgs = f.parent ? f.parent.children.filter((k) => k !== f && "children" in k) : [];
    const sw = {}; for (const g of lgs) for (const [k2, n2] of Object.entries(swatches(g))) sw[k2] = (sw[k2] || 0) + n2;
    components.staticCharts.donuts.push({ page: p.name, id: f.id, path: [f.parent && f.parent.parent && f.parent.parent.parent ? f.parent.parent.parent.name : null].join(""), d: +f.width.toFixed(2), arcs: a,
      gaps: a.map((x, i) => +((i + 1 < a.length ? a[i + 1][0] : a[0][0] + 360) - x[1]).toFixed(2)), strokes: arcs.reduce((n, e) => n + e.strokes.filter((x) => x.visible !== false).length, 0), dividers: donutDiv(f), legendSw: sw });
  }
}
/* 문서 카드의 KPI 예제(2026-11-05 k35) — "Card/<figma.frame>"(Data Visual) 안 List 마다 머리 글과 KPI 인스턴스의 Label 글. audit 이 components.data.js kpi 예제의 카드 수 · 라벨과 맞춘다 */
components.kpiDoc = null;
for (const p of figma.root.children) {
  if (!isCurrent(p)) continue;
  const card = p.findAllWithCriteria({ types: ["FRAME"] }).find((f) => f.name === "Card/Data Visual");
  if (!card) continue;
  components.kpiDoc = card.findAll((k) => k.name === "List" && k.type === "FRAME").map((l) => { const h = l.findOne((k) => k.name === "Heading"), ht = h && h.findOne((k) => k.type === "TEXT");
    const kp = l.findAll((k) => k.type === "INSTANCE" && k.mainComponent && k.mainComponent.parent && k.mainComponent.parent.name === "KPI");
    return { heading: ht ? ht.characters : null, kpi: kp.map((k) => { const t = k.findOne((x) => x.name === "Label" && x.type === "TEXT"); return t ? t.characters : null; }) }; }).filter((l) => l.kpi.length);
}
components.effectColors = effectColors;
components.missingSets = SURVEY_SETS.filter((s) => !components.sets[s]);

/* 게시 숨김(2026-10-27 k13) — hiddenFromPublishing 이 켜진 로컬 변수를 "컬렉션/이름" 으로. audit 이 옛 변수(옛 프리미티브 8그룹 + site/*)는
   모두 숨겨졌는지, 그 밖의 변수(지금 쓰는 atomic · semantic 등)는 숨겨지지 않았는지 본다 */
const publishing = { hidden: [] };
for (const c of cols) for (const id of c.variableIds) { const v = byId.get(id); if (v && v.hiddenFromPublishing) publishing.hidden.push(c.name + "/" + v.name); }
publishing.hidden.sort();

return {
  pages: figma.root.children.map((p) => ({ name: p.name, id: p.id, children: p.children.length })),
  scope: CURRENT_PAGES,
  fonts: { total: families.size, pretendard: pretendard.length ? pretendard : null },
  variables,
  textStyles,
  effectStyles,
  icons: { outline: icons.outline.length, filled: icons.filled.length, outlineNames: icons.outline, filledNames: icons.filled },
  overflow,
  overlap,
  components,
  publishing,
};
