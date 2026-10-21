/* Figma ↔ 저장소 대조.
 *
 *   node _figma/audit.mjs expect              저장소가 기대하는 상태를 JSON 으로
 *   node _figma/audit.mjs diff <덤프.json>    _figma/probe.js 결과와 대조 (어긋나면 exit 1)
 *
 * 기대값은 **저장소에서 읽는다** — 손으로 적은 숫자는 금방 거짓이 된다.
 *   토큰   _build/style.src.css 의 :root 와 :root[data-theme="dark"]
 *   아이콘 _build/icons.gen.js 의 ICONS
 *   타입   assets/style.css 의 .t-* 클래스
 *   컴포넌트 _build/style.src.css 의 .card · .card-foot · .tabs · .btn.danger … 규칙 (표면 그림자·보더, 간격, 트랙, Danger 상태)
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ---------- 토큰 ---------- */
const GROUPS = ["foreground", "background", "surface", "line", "effect", "static"];
const EXTRA = ["--brand-label", "--company-mark", "--company-mark-subtle"];
const RAMP = /^--((?:cool-neutral|neutral|blue|green|orange|red-orange|red|lime|cyan|light-blue|violet|purple|pink))-(\d+)$/;

function block(css, sel) {
  const i = css.indexOf(sel + "{");
  if (i < 0) throw new Error("블록 없음: " + sel);
  let d = 0, j = i + sel.length;
  for (; j < css.length; j++) {
    if (css[j] === "{") d++;
    else if (css[j] === "}") { d--; if (!d) break; }
  }
  return css.slice(i, j);
}
const vars = (b) => Object.fromEntries([...b.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)].map((m) => [m[1].trim(), m[2].trim()]));

function tokens() {
  const css = read("_build/style.src.css");
  const light = vars(block(css, ":root"));
  const dark = vars(block(css, ':root[data-theme="dark"]'));

  const primitives = {};
  for (const [k, v] of Object.entries(light)) {
    const m = k.match(RAMP);
    if (m && /^#/.test(v)) primitives[m[1] + "/" + m[2]] = v;
  }
  primitives["common/white"] = light["--static-white"];
  primitives["common/black"] = light["--static-black"];
  const cssToPrim = Object.fromEntries(Object.entries(primitives).map(([p, hex]) => [hex, p]));
  const byCssName = {};
  for (const [k, v] of Object.entries(light)) { const m = k.match(RAMP); if (m && /^#/.test(v)) byCssName[k] = m[1] + "/" + m[2]; }
  byCssName["--static-white"] = "common/white";
  byCssName["--static-black"] = "common/black";

  /* 제품 슬롯은 기본값(파랑)으로 굳힌다 — 제품을 주입하지 않은 상태가 Figma 의 기준판이다 */
  const slot = (t) => { const m = t.match(/^--(?:prod|brand)-(\d+)$/); return m ? "blue/" + m[1] : null; };
  const resolve = (val, mode) => {
    let m = val.match(/^var\((--[a-z0-9-]+)(?:,\s*var\((--[a-z0-9-]+)\))?\)$/);
    if (m) {
      const t = slot(m[1]) ? m[1] : (m[2] || m[1]);
      const s = slot(t);
      if (s) return "A" + s;
      if (byCssName[t]) return "A" + byCssName[t];
      const src = (mode === "dark" ? dark : light)[t] || light[t];
      if (src && /^#/.test(src)) return "H" + src.slice(1).toUpperCase();
      if (src) return resolve(src, mode);
      return "?" + val;
    }
    m = val.match(/^color-mix\(in srgb,\s*var\((--[a-z0-9-]+)\)\s*([\d.]+)%,\s*transparent\)$/);
    if (m) {
      let t = m[1];
      const s = slot(t);
      if (s) t = "--" + s.replace("/", "-");
      const base = (mode === "dark" ? dark : light)[t] || light[t];
      return /^#/.test(base || "") ? "O" + base.slice(1).toUpperCase() + ":" + +(+m[2] / 100).toFixed(2) : "?" + val;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) return "H" + val.slice(1).toUpperCase();
    return "?" + val;
  };
  const figPath = (k) => {
    const b = k.slice(2);
    if (b === "brand-label") return "color/semantic/brand/label";
    if (b === "company-mark") return "color/semantic/company/mark";
    if (b === "company-mark-subtle") return "color/semantic/company/mark-subtle";
    const p = b.split("-");
    return "color/semantic/" + p[0] + "/" + p[1] + (p.length > 2 ? "/" + p.slice(2).join("-") : "");
  };

  const semantic = {};
  for (const k of Object.keys(light)) {
    if (!GROUPS.includes(k.slice(2).split("-")[0]) && !EXTRA.includes(k)) continue;
    semantic[figPath(k)] = resolve(light[k], "light") + "|" + resolve(dark[k] !== undefined ? dark[k] : light[k], "dark");
  }

  const space = {};
  for (const [k, v] of Object.entries(light)) {
    const m = k.match(/^--space-(\d+)$/);
    if (m) space["space/" + m[1]] = parseInt(v, 10);
  }
  return {
    primitives: Object.fromEntries(Object.entries(primitives).map(([p, hex]) => ["color/atomic/" + p, "H" + hex.slice(1).toUpperCase()])),
    semantic,
    space,
  };
}

/* ---------- 아이콘 ---------- */
function icons() {
  const mod = require(path.join(ROOT, "_build/icons.gen.js"));
  const I = mod.ICONS || mod;
  const outline = Object.keys(I).sort();
  const filled = outline.filter((n) => I[n].f).sort();
  return { outline, filled };
}

/* ---------- 타입 스케일 ---------- */
function typeScale() {
  const css = read("assets/style.css");
  const out = {};
  for (const m of css.matchAll(/\.t-([a-z0-9-]+)\{([^}]*)\}/g)) {
    const d = Object.fromEntries(m[2].split(";").filter(Boolean).map((x) => x.split(":").map((s) => s.trim())));
    if (!d["font-size"]) continue;
    const name = m[1].replace(/-(\d)$/, "/$1").replace(/^(\w)/, (c) => c.toUpperCase());
    out[name] = {
      size: parseFloat(d["font-size"]),
      lineHeight: d["line-height"] ? parseFloat(d["line-height"]) : null,
      weight: d["font-weight"] ? parseInt(d["font-weight"], 10) : null,
      letterSpacing: d["letter-spacing"] || "0",
    };
  }
  return out;
}

/* ---------- 컴포넌트 ----------
   기대값은 style.src.css 의 해당 규칙에서 읽는다 — 간격 12 를 여기 적어 두면 CSS 가 바뀌는 날 거짓이 된다 */
function cssRule(sel) {
  const css = read("_build/style.src.css");
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp("(?:^|\\n|\\})" + esc + "\\{([^}]*)\\}"));
  if (!m) throw new Error("CSS 규칙 없음: " + sel);
  return Object.fromEntries(m[1].split(";").filter((x) => x.includes(":")).map((x) => { const i = x.indexOf(":"); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }));
}
/* --surface-neutral-secondary → surface/neutral/secondary (그룹/하위/나머지) */
const figTok = (v) => { const m = /var\(--([a-z]+)-([a-z]+)-([a-z-]+)\)/.exec(v || ""); return m ? `${m[1]}/${m[2]}/${m[3]}` : null; };
const px = (v) => (v ? parseFloat(v) : null);

function componentsExpect() {
  const surface = (sel) => { const r = cssRule(sel); const b = /1px solid (var\([^)]+\))/.exec(r.border || ""); return { shadow: !!r["box-shadow"] && r["box-shadow"] !== "none", stroke: b ? figTok(b[1]) : null }; };
  return {
    surfaces: { "Card": surface(".card"), "Chart Card": surface(".chart-card"), "KPI": surface(".kpi") },
    gap: {
      cardFoot: px(cssRule(".card .card-foot").gap),
      popupActions: px(cssRule(".popup .popup-actions").gap),
      tabItem: px(cssRule(".tabs .tab").gap),
    },
    track: { pill: figTok(cssRule(".tabs.pill").background), selectFilled: figTok(cssRule(".select-btn").background) },
    danger: {
      Default: figTok(cssRule(".btn.danger").background), Hover: figTok(cssRule(".btn.danger:hover").background), Pressed: figTok(cssRule(".btn.danger:active").background),
    },
    dangerSecondary: { Hover: figTok(cssRule(".btn.danger.secondary:hover").background), Pressed: figTok(cssRule(".btn.danger.secondary:active").background) },
    /* 비활성 — opacity 로 흐리지 않고 전용 토큰으로 칠한다(CLAUDE.md). 투명 변형은 면이 없고 secondary 계열은 보더만 남는다 */
    disabled: (() => {
      const d = (s) => cssRule(`.btn${s}[disabled],.btn${s}[aria-disabled="true"]`);
      const base = d(""), sec = d(".secondary"), dsec = d(".danger.secondary"), txt = d(".text");
      const face = (r) => (r.background === "transparent" ? "-" : figTok(r.background || base.background));
      const line = (r) => (r["border-color"] && r["border-color"] !== "transparent" ? figTok(r["border-color"]) : null);
      return {
        "Primary": { fill: face(base), stroke: null }, "Tertiary": { fill: face(base), stroke: null }, "Danger": { fill: face(base), stroke: null },
        "Secondary": { fill: face(sec), stroke: line(sec) }, "Danger Secondary": { fill: face(dsec), stroke: line(dsec) }, "Text": { fill: face(txt), stroke: null },
      };
    })(),
    /* Figma 레이아웃 규칙 — CSS 에 없는 값이라 여기 상수로 둔다. 출처: .claude/agents/figma-sync.md "섹션 간격은 200px" */
    sectionGap: 200,
    /* 버튼 변형별 상태 면 — 투명은 "-" */
    buttonFace: Object.fromEntries(["primary", "secondary", "tertiary", "text"].map((v) => {
      const f = (sel) => { const b = cssRule(sel).background; return b === "transparent" ? "-" : figTok(b); };
      return [v[0].toUpperCase() + v.slice(1), { Default: f(`.btn.${v}`), Hover: f(`.btn.${v}:hover`), Pressed: f(`.btn.${v}:active`) }];
    })),
    /* 태그 톤 — 라벨 글자는 톤과 상관없이 .tag 의 color 하나다. Figma 의 Info 는 저장소의 기본 .tag 가 맡는다 */
    tag: {
      label: figTok(cssRule(".tag").color),
      face: Object.fromEntries([["Info", ".tag"], ...["critical", "high", "medium", "low", "ok", "accent"].map((t) => [t[0].toUpperCase() + t.slice(1), `.tag.${t}`])].map(([k, sel]) => [k, figTok(cssRule(sel).background)])),
    },
    bannerWarning: figTok(cssRule(".banner.warning").background),
    /* 저장소에 있고 Figma 에도 있어야 하는 세트 — 없으면 어긋남 */
    requiredSets: ["Card", "Chart Card", "KPI", "Tab", "Tab Item", "Select Button", "Popup", "Button", "Accordion", "Accordion Group", "Tag", "Banner", "Menu Item"],
  };
}

function diffComponents(c, want, bad, notes) {
  if (!c) { notes.push("덤프에 컴포넌트 조사가 없습니다 — 옛 probe.js 로 만든 덤프입니다"); return; }
  for (const s of c.missingSets || []) if (want.requiredSets.includes(s)) bad.push(`컴포넌트 세트 없음: ${s}`);
  const sets = c.sets || {};
  const state = (n) => (/Hover/.test(n) ? "Hover" : /Pressed|Active/.test(n) ? "Pressed" : /Disabled|Loading|Focus/.test(n) ? null : "Default");
  for (const [set, w] of Object.entries(want.surfaces)) {
    for (const v of sets[set] || []) {
      if (!/Hover/.test(v.name) && w.shadow === false && v.shadow > 0) bad.push(`${set} 그림자 남음 — ${v.name} (${v.id})`);
      if (!/Selected/.test(v.name) && w.stroke && !(v.stroke.includes("$" + w.stroke) && !v.stroke.includes(w.stroke + "-opaque") && v.sw === 1))
        bad.push(`${set} 보더 다름 — ${v.name}: Figma[${v.stroke} ${v.sw}px] 저장소[1px ${w.stroke}] (${v.id})`);
      if (set === "Card" && v.foot !== null && v.foot !== want.gap.cardFoot) bad.push(`Card Foot 간격 ${v.foot} ≠ ${want.gap.cardFoot} — ${v.name} (${v.id})`);
    }
  }
  for (const v of sets["Popup"] || []) if (v.actions !== null && v.actions !== want.gap.popupActions) bad.push(`Popup Actions 간격 ${v.actions} ≠ ${want.gap.popupActions} — ${v.name} (${v.id})`);
  for (const v of sets["Tab Item"] || []) if (v.gap !== null && v.gap !== want.gap.tabItem) bad.push(`Tab Item 간격 ${v.gap} ≠ ${want.gap.tabItem} — ${v.name} (${v.id})`);
  for (const v of (sets["Tab"] || []).filter((x) => /Style=Pill/.test(x.name)))
    if (!v.fill.includes("$" + want.track.pill)) bad.push(`Tab Pill 트랙 ${v.fill} ≠ ${want.track.pill} (${v.id})`);
  for (const v of (sets["Select Button"] || []).filter((x) => /Style=Filled/.test(x.name)))
    if (!v.fill.includes("$" + want.track.selectFilled)) bad.push(`Select Button 트랙 ${v.fill} ≠ ${want.track.selectFilled} (${v.id})`);
  const btn = sets["Button"] || [];
  for (const v of btn.filter((x) => /Variant=Danger(?! Secondary)/.test(x.name))) {
    const st = state(v.name);
    if (st && !v.fill.includes("$" + want.danger[st])) bad.push(`Danger ${st} 면 ${v.fill} ≠ ${want.danger[st]} — ${v.name} (${v.id})`);
  }
  const ds = btn.filter((x) => /Variant=Danger Secondary/.test(x.name));
  if (btn.length && !ds.length) bad.push("Button 에 Danger Secondary 변형이 없습니다");
  for (const v of ds) {
    const st = state(v.name);
    if ((st === "Hover" || st === "Pressed") && !v.fill.includes("$" + want.dangerSecondary[st])) bad.push(`Danger Secondary ${st} 면 ${v.fill} ≠ ${want.dangerSecondary[st]} — ${v.name} (${v.id})`);
  }
  for (const v of btn) {
    const m = /Variant=(Primary|Secondary|Tertiary|Text)(?=,|$)/.exec(v.name), st = state(v.name);
    const w = m && st && want.buttonFace[m[1]][st];
    if (!w) continue;
    if (w === "-" ? v.fill !== "-" : !v.fill.includes("$" + w)) bad.push(`${m[1]} ${st} 면 ${v.fill} ≠ ${w === "-" ? "없음" : w} — ${v.name} (${v.id})`);
  }
  /* 비활성을 opacity 로 흐리는 것은 버튼만의 문제가 아니다 — 조사하는 세트 전부에서 본다 */
  for (const [set, vs] of Object.entries(sets)) {
    if (set === "Button") continue;
    for (const v of vs) if (/Disabled/.test(v.name) && v.opacity !== undefined && v.opacity < 1) bad.push(`${set} Disabled 를 opacity ${v.opacity} 로 흐림 — ${v.name} (${v.id})`);
  }
  for (const v of (sets["Tag"] || []).filter((x) => !/Solid|Outline/.test(x.name))) {
    const t = /(Critical|High|Medium|Low|Ok|Accent|Info)/.exec(v.name);
    if (!t) continue;
    const w = want.tag.face[t[1]];
    if (!v.fill.includes("$" + w)) bad.push(`Tag ${t[1]} 바탕 ${v.fill} ≠ ${w} — ${v.name} (${v.id})`);
    if (v.text && !v.text.includes("$" + want.tag.label)) bad.push(`Tag ${t[1]} 라벨 ${v.text} ≠ ${want.tag.label} — ${v.name} (${v.id})`);
  }
  for (const v of (sets["Banner"] || []).filter((x) => /Warning/.test(x.name)))
    if (!v.fill.includes("$" + want.bannerWarning)) bad.push(`Banner Warning 바탕 ${v.fill} ≠ ${want.bannerWarning} (${v.id})`);
  for (const v of btn.filter((x) => /State=Disabled/.test(x.name))) {
    const m = /Variant=(Primary|Secondary|Tertiary|Text|Danger Secondary|Danger)(?=,|$)/.exec(v.name);
    const w = m && want.disabled[m[1]];
    if (!w) continue;
    if (v.opacity !== undefined && v.opacity < 1) bad.push(`Disabled 를 opacity ${v.opacity} 로 흐림 — ${v.name} (${v.id})`);
    const fillOk = w.fill === "-" ? v.fill === "-" : v.fill.includes("$" + w.fill);
    if (!fillOk) bad.push(`Disabled 면 ${v.fill} ≠ ${w.fill === "-" ? "없음" : w.fill} — ${v.name} (${v.id})`);
    if (w.stroke && !v.stroke.includes("$" + w.stroke)) bad.push(`Disabled 보더 ${v.stroke} ≠ ${w.stroke} — ${v.name} (${v.id})`);
  }
  if (c.textOnSurface === undefined) notes.push("덤프에 글자 토큰·옛 변수·섹션 간격 조사가 없습니다 — 옛 probe.js 로 만든 덤프입니다");
  if ((c.textOnSurface || []).length) bad.push(`글자에 surface/* 토큰 ${c.textOnSurface.length}개 — 글자는 foreground (${c.textOnSurface.slice(0, 6).join(" ")}${c.textOnSurface.length > 6 ? " …" : ""})`);
  for (const [name, e] of Object.entries(c.opaque || {})) bad.push(`컴포넌트 CSS 가 쓰지 않는 opaque 토큰 ${name} ×${e.n} (${e.ids.join(" ")}${e.n > e.ids.length ? " …" : ""})`);
  for (const [name, e] of Object.entries(c.legacy || {})) bad.push(`현재 페이지에 옛 변수 ${name} ×${e.n} (${e.ids.join(" ")}${e.n > e.ids.length ? " …" : ""})`);
  for (const s of c.sections || []) if (s.gap !== want.sectionGap) bad.push(`섹션 간격 ${s.page}: ${s.a} → ${s.b} ${s.gap} ≠ ${want.sectionGap}`);
  if ((c.negText || []).length) bad.push(`글자에 foreground/negative/primary ${c.negText.length}개 — 저장소는 글자에 strong (${c.negText.slice(0, 6).join(" ")}${c.negText.length > 6 ? " …" : ""})`);
}

function expect_() {
  const t = tokens();
  const ic = icons();
  const ts = typeScale();
  return {
    primitives: t.primitives,
    semantic: t.semantic,
    space: t.space,
    icons: { outline: ic.outline, filled: ic.filled },
    typeScale: ts,
    components: componentsExpect(),
    counts: {
      primitives: Object.keys(t.primitives).length,
      semantic: Object.keys(t.semantic).length,
      space: Object.keys(t.space).length,
      iconOutline: ic.outline.length,
      iconFilled: ic.filled.length,
      typeScale: Object.keys(ts).length,
    },
  };
}

/* ---------- 대조 ---------- */
function diff(dumpPath) {
  const want = expect_();
  const got = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
  const bad = [];
  const list = (a, b, label) => {
    const miss = a.filter((x) => !b.includes(x)), extra = b.filter((x) => !a.includes(x));
    if (miss.length) bad.push(`${label}: 저장소에만 ${miss.length}개 — ${miss.slice(0, 8).join(" ")}${miss.length > 8 ? " …" : ""}`);
    if (extra.length) bad.push(`${label}: Figma 에만 ${extra.length}개 — ${extra.slice(0, 8).join(" ")}${extra.length > 8 ? " …" : ""}`);
  };

  const sem = (got.variables && got.variables.Semantic && got.variables.Semantic.values) || {};
  const semFig = Object.keys(sem).filter((n) => n.startsWith("color/semantic/"));
  list(Object.keys(want.semantic), semFig, "semantic 토큰");
  for (const [name, spec] of Object.entries(want.semantic)) {
    if (!(name in sem)) continue;
    if (sem[name] !== spec) bad.push(`semantic 값 다름 ${name}: 저장소[${spec}] Figma[${sem[name]}]`);
  }

  const prim = (got.variables && got.variables.Primitive && got.variables.Primitive.values) || {};
  list(Object.keys(want.primitives), Object.keys(prim).filter((n) => n.startsWith("color/atomic/")), "atomic 프리미티브");
  for (const [name, spec] of Object.entries(want.primitives)) {
    if (!(name in prim)) continue;
    if (prim[name] !== spec) bad.push(`프리미티브 값 다름 ${name}: 저장소[${spec}] Figma[${prim[name]}]`);
  }

  for (const [name, px] of Object.entries(want.space)) {
    const v = prim[name];
    if (v === undefined) { bad.push(`간격 변수 없음 ${name}(${px}px)`); continue; }
    if (v !== "N" + px) bad.push(`간격 값 다름 ${name}: 저장소[${px}] Figma[${String(v).replace(/^N/, "")}]`);
  }

  list(want.icons.outline, got.icons ? got.icons.outlineNames || [] : [], "outline 아이콘");
  list(want.icons.filled, got.icons ? got.icons.filledNames || [] : [], "filled 아이콘");

  for (const o of got.overflow || []) bad.push(`넘침 ${o.page} / ${o.node} +${o.by}${o.clips ? " (잘림)" : ""}`);
  for (const o of (got.overlap || []).filter((x) => x.current !== false)) bad.push(`겹침 ${o.page}: ${o.a} ↔ ${o.b} (${o.by.join("×")})`);

  const notes = [];
  if (got.fonts && !got.fonts.pretendard) notes.push("Pretendard 가 Figma 에 없습니다 — 텍스트 스타일 교정과 서체 복구는 막혀 있습니다");
  diffComponents(got.components, want.components, bad, notes);

  return { bad, notes, counts: want.counts };
}

/* ---------- 진입점 ---------- */
const [cmd, arg] = process.argv.slice(2);
if (cmd === "expect") {
  console.log(JSON.stringify(expect_(), null, 1));
} else if (cmd === "diff") {
  if (!arg) { console.error("쓰는 법: node _figma/audit.mjs diff <덤프.json>"); process.exit(2); }
  const { bad, notes, counts } = diff(arg);
  console.log("기대값:", JSON.stringify(counts));
  for (const n of notes) console.log("NOTE ", n);
  if (!bad.length) { console.log("어긋남 0 — Figma 와 저장소가 같습니다."); process.exit(0); }
  for (const b of bad) console.log("  ✗", b);
  console.log(`어긋남 ${bad.length}건`);
  process.exit(1);
} else {
  console.error("쓰는 법: node _figma/audit.mjs expect | diff <덤프.json>");
  process.exit(2);
}
