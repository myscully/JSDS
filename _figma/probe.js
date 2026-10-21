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

const CURRENT_PAGES = ["Overview", "1 Theme", "2 Element", "3 Component", "4 Pattern", "Resource"];
const OVERFLOW_MIN = 10;   // 도형 외곽선·그림자 번짐이 만드는 2~6px 는 잡지 않는다

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
   두 번째를 빠뜨린 것이 지난 사고였다 — 둘을 한 함수에서 같이 본다. */
const overflow = [], overlap = [];
for (const p of figma.root.children) {
  const inScope = CURRENT_PAGES.includes(p.name);
  const tops = p.children.filter((n) => n.visible !== false && n.width && n.height);
  for (let i = 0; i < tops.length; i++) {
    for (let j = i + 1; j < tops.length; j++) {
      const a = tops[i], b = tops[j];
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > 1 && iy > 1) overlap.push({ page: p.name, a: a.name, b: b.name, by: [Math.round(ix), Math.round(iy)], current: inScope });
    }
  }
  if (!inScope) continue;
  for (const c of p.findAll((n) => (n.type === "SECTION" || n.type === "FRAME" || n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.children && n.children.length)) {
    let r = -Infinity, b = -Infinity;
    for (const k of c.children) {
      if (k.visible === false) continue;
      r = Math.max(r, k.x + k.width);
      b = Math.max(b, k.y + k.height);
    }
    const over = Math.max(r - c.width, b - c.height);
    if (over > OVERFLOW_MIN) overflow.push({ page: p.name, node: c.name, id: c.id, by: Math.round(over), clips: c.clipsContent === true });
  }
}

/* ---------- 컴포넌트 ----------
   변수만 맞추고 컴포넌트를 안 봐서, 카드 그림자·버튼 간격·Danger 버튼 모양이 저장소와 한참 어긋난 채로 있었다.
   덤프가 커지면 옮기다 틀리므로 정해 둔 세트만 짧게 읽는다. 기대값은 audit.mjs 가 저장소 CSS 에서 읽는다 */
const SURVEY_SETS = ["Card", "Chart Card", "KPI", "Tab", "Tab Item", "Select Button", "Popup", "Button", "Accordion", "Accordion Group"];
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
const components = { sets: {}, missingSets: [], negText: [] };
for (const p of figma.root.children) {
  if (!CURRENT_PAGES.includes(p.name)) continue;
  for (const set of p.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
    if (!SURVEY_SETS.includes(set.name)) continue;
    components.sets[set.name] = set.children.map((c) => {
      const kid = (nm) => c.findOne((k) => k.name === nm && "itemSpacing" in k);
      const foot = kid("Foot"), actions = kid("Actions");
      return {
        id: c.id, name: c.name, fill: paint(c.fills), stroke: paint(c.strokes),
        sw: c.strokeWeight === figma.mixed ? "mixed" : c.strokeWeight, shadow: shadows(c),
        gap: "itemSpacing" in c ? c.itemSpacing : null,
        foot: foot ? foot.itemSpacing : null, actions: actions ? actions.itemSpacing : null,
      };
    });
  }
  /* 글자에 negative/primary 가 묶이면 안 된다 — 저장소 규칙이 "글자는 strong, primary 는 아이콘·그래픽" 이다 */
  const inInstance = (n) => { for (let q = n.parent; q && q.type !== "PAGE"; q = q.parent) if (q.type === "INSTANCE") return true; return false; };
  for (const t of p.findAllWithCriteria({ types: ["TEXT"] })) {
    if (!inInstance(t) && paint(t.fills).includes("foreground/negative/primary")) components.negText.push(t.id);   // 인스턴스는 원본을 고치면 따라온다
  }
}
components.missingSets = SURVEY_SETS.filter((s) => !components.sets[s]);

return {
  pages: figma.root.children.map((p) => ({ name: p.name, id: p.id, children: p.children.length })),
  fonts: { total: families.size, pretendard: pretendard.length ? pretendard : null },
  variables,
  textStyles,
  effectStyles,
  icons: { outline: icons.outline.length, filled: icons.filled.length, outlineNames: icons.outline, filledNames: icons.filled },
  overflow,
  overlap,
  components,
};
