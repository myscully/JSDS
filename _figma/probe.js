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
const vname = (b) => { const v = b && byId.get(b.id); return v ? v.name.replace("color/semantic/", "") : null; };
const paint = (arr) => {
  if (!arr || arr === figma.mixed) return "-";
  const o = [];
  for (const p of arr) {
    if (p.visible === false) continue;
    const b = vname(p.boundVariables && p.boundVariables.color);
    o.push(b ? "$" + b : p.type === "SOLID" ? "raw#" + hex2(p.color.r) + hex2(p.color.g) + hex2(p.color.b) : p.type);
  }
  return o.join(",") || "-";
};
const shadows = (n) => ("effects" in n ? n.effects.filter((e) => e.visible !== false && e.type === "DROP_SHADOW").length : 0);
const components = { sets: {}, missingSets: [], negText: [], textOnSurface: [], opaque: {}, legacy: {}, sections: [] };
for (const p of figma.root.children) {
  if (!isCurrent(p)) continue;
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    if (!SURVEY_SETS.includes(set.name)) continue;
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
      }
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
          list.push({ item: m ? m.name : null, label: tx("Label"), number: tx("Number"), icon: icm ? icm.name.replace(/^icon\/(outline|filled)\//, "") : null, count: ct ? ct.characters : null, labelProp: lp ? lp[1].value : null, iconPaints: ip });
        } else if (k.type === "FRAME" && k.children.length) { const x = k.findOne((y) => y.type === "TEXT"); list.push(/^foot$/i.test(k.name) ? { foot: x ? x.characters : null } : { group: x ? x.characters : null }); }
        else list.push({ other: k.type + (k.type === "FRAME" ? " (빈 칸)" : "") });
      }
      v.itemsList = list;
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
}
components.missingSets = SURVEY_SETS.filter((s) => !components.sets[s]);

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
};
