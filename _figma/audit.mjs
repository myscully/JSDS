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
  let m = css.match(new RegExp("(?:^|\\n|\\})" + esc + "\\{([^}]*)\\}"));
  /* 셀렉터 목록 안에 있는 규칙(예: .sidenav.collapsed a span,…,.sidenav.collapsed a.sub{…})도 찾는다 */
  if (!m) for (const r of css.matchAll(/(?:^|\n|\})([^{}@]+)\{([^}]*)\}/g)) if (r[1].split(",").map((x) => x.trim()).includes(sel)) { m = [null, r[2]]; break; }
  if (!m) throw new Error("CSS 규칙 없음: " + sel);
  return Object.fromEntries(m[1].split(";").filter((x) => x.includes(":")).map((x) => { const i = x.indexOf(":"); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }));
}
/* --surface-neutral-secondary → surface/neutral/secondary (그룹/하위/나머지) */
const figTok = (v) => {
  const m = /var\(--([a-z0-9-]+)\)/.exec(v || ""); if (!m) return null;
  const p = m[1].split("-");
  /* 두 마디 토큰 — static/white · brand/label(트리 밖, Figma 에서는 color/semantic/brand/label) */
  if (p[0] === "static" || p[0] === "brand") return p[0] + "/" + p.slice(1).join("-");
  return p.length >= 3 ? `${p[0]}/${p[1]}/${p.slice(2).join("-")}` : null;
};
const inset = (v) => (/inset/.test(v || "") ? figTok(v) : null);
const px = (v) => (v ? parseFloat(v) : null);

/* ---------- 사이트 예제(저장소 = 사이트) ----------
   컨테이너(Steps · Navigation)는 사이트 예제와 순서 · 라벨 · 상태 · 아이콘을 맞춘다. 예제 HTML 은 components.data.js 의
   템플릿 문자열 그대로 읽는다 — 아이콘은 ${I("이름")} 으로 적혀 있어 이름을 바로 얻는다 */
function exampleHtml(comp, id) {
  const src = read("_build/components.data.js");
  const i = src.indexOf('"' + comp + '": {');
  if (i < 0) throw new Error("components.data.js 에 컴포넌트 없음: " + comp);
  const next = /\n  "[a-z0-9-]+": \{/g; next.lastIndex = i + 1;
  const n = next.exec(src), end = n ? n.index : src.length;
  const j = src.indexOf('{ id: "' + id + '"', i);
  if (j < 0 || j > end) throw new Error("components.data.js 에 예제 없음: " + comp + " / " + id);
  const h = src.indexOf("html: `", j), e = src.indexOf("`", h + 7);
  return src.slice(h + 7, e);
}
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
function stepsExample() {
  return [...exampleHtml("indicator", "steps").matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)].map((m) => {
    const cls = ((/class="([^"]*)"/.exec(m[1]) || [])[1] || "").split(/\s+/);
    const i = /<i>([\s\S]*?)<\/i>/.exec(m[2]), ic = i && /\$\{I\("([a-z0-9-]+)"/.exec(i[1]);
    return { state: cls.includes("done") ? "Done" : cls.includes("on") ? "Current" : "Todo", mark: ic ? ic[1] : i ? strip(i[1]) : null,
      label: strip(m[2].replace(/<i>[\s\S]*?<\/i>/, "").replace(/<span class="sr-only">[\s\S]*?<\/span>/g, "")) };
  });
}
function navExample() {
  const out = [];
  for (const m of exampleHtml("navigation", "basic").matchAll(/<a([^>]*)>([\s\S]*?)<\/a>|<div class="(group|foot)">([\s\S]*?)<\/div>/g)) {
    if (m[3]) { out.push({ kind: m[3], label: strip(m[4]) }); continue; }
    const cls = ((/class="([^"]*)"/.exec(m[1]) || [])[1] || "").split(/\s+/);
    const ic = /\$\{I\("([a-z0-9-]+)"/.exec(m[2]), ct = /<span class="count[^"]*">([\s\S]*?)<\/span>/.exec(m[2]);
    const body = m[2].replace(/\$\{[^}]*\}/g, "").replace(/<span class="count[^"]*">[\s\S]*?<\/span>/g, "");
    out.push({ kind: "item", type: cls.includes("sub") ? "Sub" : "Default", state: cls.includes("on") ? "Selected" : "Default", icon: ic ? ic[1] : null, label: strip(body), count: ct ? strip(ct[1]) : null });
  }
  return out;
}

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
      face: Object.fromEntries([["info", ".tag"], ["neutral", ".tag"], ...["critical", "high", "medium", "low", "ok", "accent"].map((t) => [t, `.tag.${t}`])].map(([k, sel]) => [k, figTok(cssRule(sel).background)])),
    },
    bannerWarning: figTok(cssRule(".banner.warning").background),
    /* Tag 세 스타일 — 점(::before)·Outline·Solid 까지. 톤에 규칙이 없으면 기본 .tag / .tag.solid 를 따른다 */
    tagStyle: (() => {
      const has = (sel) => { try { return cssRule(sel); } catch { return null; } };
      const tones = ["info", "neutral", "critical", "high", "medium", "low", "ok", "accent"];
      const sel = (t) => (t === "info" || t === "neutral" ? "" : "." + t);
      const base = cssRule(".tag"), solid = cssRule(".tag.solid");
      return {
        outline: { stroke: inset(cssRule(".tag.outline")["box-shadow"]) },
        tones: Object.fromEntries(tones.map((t) => {
          const dot = has(`.tag${sel(t)}::before`) || cssRule(".tag::before"), s = has(`.tag.solid${sel(t)}`) || {}, sd = has(`.tag.solid${sel(t)}::before`);
          const sBg = s.background || (has(`.tag${sel(t)}`) || base).background;
          return [t, {
            dot: figTok(dot.background),
            solid: { fill: figTok(sBg), stroke: s["box-shadow"] === "none" ? null : inset(s["box-shadow"] || solid["box-shadow"]), label: figTok(s.color || base.color), dot: figTok((sd || dot).background) },
          }];
        })),
      };
    })(),
    kpiValue: { Default: figTok(cssRule(".kpi .value").color), Critical: figTok(cssRule(".kpi.critical .value").color), High: figTok(cssRule(".kpi.high .value").color) },   // Default 는 .kpi .value 에 색이 생긴 뒤(2026-10-23 k)부터 본다 — 색이 없으면 null 이라 건너뛴다
    banner: Object.fromEntries([["Accent", ".banner"], ["Warning", ".banner.warning"], ["Danger", ".banner.danger"]].map(([k, s]) => { const r = cssRule(s), b = cssRule(".banner"); return [k, { fill: figTok(r.background || b.background), label: figTok(r.color || b.color) }]; })),
    menuItem: { hover: figTok(cssRule(".menu-item:hover").background), selected: figTok(cssRule(".menu-item.on").background) },
    tabCount: { base: figTok(cssRule(".tabs .tab .count").background), on: figTok(cssRule(".tabs .tab.on .count").background) },
    /* 저장소에 있고 Figma 에도 있어야 하는 세트 — 없으면 어긋남 */
    /* Count · Status Indicator · Step · Navigation Item · Sparkline · Donut — 기대값은 전부 CSS 에서 */
    countBadge: (() => { const base = cssRule(".count"); const t = (sel) => { const r = cssRule(sel); return { fill: figTok(r.background || base.background), text: figTok(r.color || base.color) }; };
      return { Danger: t(".count"), Neutral: t(".count.neutral"), Accent: t(".count.accent"), Dot: { fill: figTok(cssRule(".count.dot").background || base.background), text: null } }; })(),   // .count.dot 은 배경을 따로 두지 않아 .count 를 따른다
    statusDot: Object.fromEntries([["Neutral", ".indicator::before"], ["OK", ".indicator.ok::before"], ["Warn", ".indicator.warn::before"], ["Danger", ".indicator.danger::before"], ["Info", ".indicator.info::before"], ["Accent", ".indicator.accent::before"]].map(([k, sel]) => [k, figTok(cssRule(sel).background)])),
    step: (() => { const r = cssRule; return {
      Todo: { circle: figTok(r(".steps li i").background), number: figTok(r(".steps li i").color), label: figTok(r(".steps li").color) },
      Done: { circle: figTok(r(".steps li.done i").background), check: figTok(r(".steps li.done i").color), label: figTok(r(".steps li").color) },
      Current: { circle: figTok(r(".steps li.on i").background), number: figTok(r(".steps li.on i").color), label: figTok(r(".steps li.on").color) } }; })(),
    navItem: (() => { const r = cssRule; return {
      hover: figTok(r(".sidenav a:hover").background), pressed: figTok(r(".sidenav a:active").background),
      selected: { fill: figTok(r(".sidenav a.on").background), label: figTok(r(".sidenav a.on").color), icon: figTok(r(".sidenav a.on svg").color) },
      base: { label: figTok(r(".sidenav a").color), icon: figTok(r(".sidenav a svg").color) },
      sub: { label: figTok(r(".sidenav a.sub").color), selected: figTok(r(".sidenav a.sub.on").color) } }; })(),
    sparkBars: { bar: figTok(cssRule(".sparkline i").background), hi: figTok(cssRule(".sparkline i.hi").background) },
    /* 컨테이너 — 사이트 예제와 순서 · 라벨 · 상태 · 아이콘. Steps 는 Indicator 의 steps 예제, Navigation 은 Default 예제 */
    stepsItems: stepsExample(),
    navItems: navExample(),
    /* 도넛 호 각도 — conic-gradient 정지점에서. CSS 0° 는 12시, Figma 0° 는 3시라 90° 를 뺀다. 면 색(틈) 구간은 호가 아니다 */
    donutArcs: [...cssRule(".donut").background.matchAll(/var\(--([a-z0-9-]+)\)\s+([\d.]+)%?\s+([\d.]+)%/g)]
      .map((x) => ({ tok: figTok("var(--" + x[1] + ")"), from: +x[2] * 3.6 - 90, to: +x[3] * 3.6 - 90 }))
      .filter((s) => s.tok !== "surface/elevated/primary"),
    /* 체크 선 굵기 — 24 viewBox 의 stroke-width 를 아이콘 폭으로 줄인 실제 굵기(3 × 12/24 = 1.5). Figma 는 px 로 그린다 */
    checkStroke: (() => { const r = cssRule(".steps li i svg"); return parseFloat(r["stroke-width"]) * (parseFloat(r.width) / 24); })(),
    /* Pulse 고리 — 색은 box-shadow 색과 같은 계열(foreground/negative/primary → negative), 굵기는 @keyframes pulse 의 최대 퍼짐 이하 */
    pulse: (() => {
      const tok = figTok(cssRule(".indicator.pulse::before")["box-shadow"]);
      const css = read("_build/style.src.css"), i = css.indexOf("@keyframes pulse{");
      if (i < 0) throw new Error("@keyframes pulse 없음");
      let d = 0, j = i; for (; j < css.length; j++) { if (css[j] === "{") d++; else if (css[j] === "}") { d--; if (!d) break; } }
      const spreads = [...css.slice(i, j).matchAll(/box-shadow:\s*0 0 0 ([\d.]+)px/g)].map((x) => +x[1]);
      return { tok, family: tok ? tok.split("/")[1] : null, max: spreads.length ? Math.max(...spreads) : null };
    })(),
    donut: (() => { const bg = cssRule(".donut").background;
      const gaps = [...bg.matchAll(/var\(--surface-elevated-primary\) ([\d.]+)% ([\d.]+)%/g)].map((x) => +x[2] - +x[1]).filter((w) => w > 0.9);   // 0 · 100 끝의 반쪽 틈은 뺀다
      return { gapDeg: gaps.length ? +(gaps[0] * 3.6).toFixed(2) : 0, row: cssRule(".donut-row")["justify-content"] }; })(),
    /* 저장소에 있고 Figma 에도 있어야 하는 세트 — 없으면 어긋남 */
    requiredSets: ["Card", "Chart Card", "KPI", "Tab", "Tab Item", "Select Button", "Popup", "Button", "Accordion", "Accordion Group", "Tag", "Banner", "Menu Item",
      "Count", "Status Indicator", "Step", "Steps", "Navigation Item", "Navigation"],
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
  /* 이름 전체를 훑으면 Size=Medium 을 Medium 톤으로 읽는다 — 속성 값을 직접 읽는다 */
  const prop = (name, k) => { const m = new RegExp("(?:^|, )" + k + "=([^,]+)").exec(name); return m ? m[1].trim() : null; };
  for (const v of sets["Tag"] || []) {
    const tone = prop(v.name, "Tone"), style = prop(v.name, "Style");
    if (!tone || (style && style !== "Subtle")) continue;   // Outline·Solid 는 바탕 규칙이 달라 여기서 보지 않는다
    const w = want.tag.face[tone.toLowerCase()];
    if (!w) { bad.push(`Tag 톤 ${tone} 은 저장소에 없습니다 — ${v.name} (${v.id})`); continue; }
    if (!v.fill.includes("$" + w)) bad.push(`Tag ${tone} 바탕 ${v.fill} ≠ ${w} — ${v.name} (${v.id})`);
    if (v.text && !v.text.includes("$" + want.tag.label)) bad.push(`Tag ${tone} 라벨 ${v.text} ≠ ${want.tag.label} — ${v.name} (${v.id})`);
  }
  const has$ = (got, w) => (w === null ? true : w === "-" ? got === "-" : !!got && got.includes("$" + w));
  for (const v of sets["Tag"] || []) {
    const tone = (prop(v.name, "Tone") || "").toLowerCase(), style = prop(v.name, "Style"), w = want.tagStyle.tones[tone];
    if (!w) continue;
    if (style === "Subtle" && v.dot && !has$(v.dot, w.dot)) bad.push(`Tag ${tone} 점 ${v.dot} ≠ ${w.dot} — ${v.name} (${v.id})`);
    if (style === "Outline") {
      if (v.fill !== "-") bad.push(`Tag Outline 면이 있음 ${v.fill} — ${v.name} (${v.id})`);
      if (!has$(v.stroke, want.tagStyle.outline.stroke)) bad.push(`Tag Outline 보더 ${v.stroke} ≠ ${want.tagStyle.outline.stroke} — ${v.name} (${v.id})`);
      if (v.text && !has$(v.text, want.tag.label)) bad.push(`Tag Outline 라벨 ${v.text} ≠ ${want.tag.label} — ${v.name} (${v.id})`);
      if (v.dot && !has$(v.dot, w.dot)) bad.push(`Tag Outline 점 ${v.dot} ≠ ${w.dot} — ${v.name} (${v.id})`);
    }
    if (style === "Solid") {
      const s = w.solid;
      if (!has$(v.fill, s.fill)) bad.push(`Tag Solid 면 ${v.fill} ≠ ${s.fill} — ${v.name} (${v.id})`);
      if (s.stroke ? !has$(v.stroke, s.stroke) : v.stroke !== "-") bad.push(`Tag Solid 보더 ${v.stroke} ≠ ${s.stroke || "없음"} — ${v.name} (${v.id})`);
      if (v.text && !has$(v.text, s.label)) bad.push(`Tag Solid 라벨 ${v.text} ≠ ${s.label} — ${v.name} (${v.id})`);
      if (v.dot && !has$(v.dot, s.dot)) bad.push(`Tag Solid 점 ${v.dot} ≠ ${s.dot} — ${v.name} (${v.id})`);
    }
  }
  for (const v of sets["KPI"] || []) {
    const w = want.kpiValue[prop(v.name, "Tone")], val = (v.texts || []).find((t) => /value/i.test(t.split("=")[0]));
    if (w && val && !has$(val.slice(val.indexOf("=") + 1), w)) bad.push(`KPI 값 ${val} ≠ ${w} — ${v.name} (${v.id})`);
  }
  for (const v of sets["Banner"] || []) {
    const w = want.banner[prop(v.name, "Tone")];
    if (!w) continue;
    if (!has$(v.fill, w.fill)) bad.push(`Banner ${prop(v.name, "Tone")} 바탕 ${v.fill} ≠ ${w.fill} (${v.id})`);
    if (v.text && !has$(v.text, w.label)) bad.push(`Banner ${prop(v.name, "Tone")} 글자 ${v.text} ≠ ${w.label} (${v.id})`);
  }
  for (const v of sets["Menu Item"] || []) {
    const type = prop(v.name, "Type"), st = prop(v.name, "State");
    const w = type === "Selected" && st !== "Disabled" ? want.menuItem.selected : st === "Hover" ? want.menuItem.hover : null;   // .on 이 :hover 뒤에 있어 선택 항목은 hover 에도 brand-subtle
    if (w && !has$(v.fill, w)) bad.push(`Menu Item ${type} ${st} 면 ${v.fill} ≠ ${w} (${v.id})`);
  }
  for (const v of sets["Tab Item"] || []) {
    const w = prop(v.name, "State") === "Selected" ? want.tabCount.on : want.tabCount.base;   // 선택 탭의 배지는 .tabs .tab.on .count 를 따로 갖는다
    if (v.count && !has$(v.count, w)) bad.push(`Tab count 배지 ${v.count} ≠ ${w} — ${v.name} (${v.id})`);
  }
  for (const v of sets["Count"] || []) {
    const tone = prop(v.name, "Tone"), w = want.countBadge[tone]; if (!w) continue;
    if (!has$(v.fill, w.fill)) bad.push(`Count ${tone} 면 ${v.fill} ≠ ${w.fill} (${v.id})`);
    if (w.text && v.text && !has$(v.text, w.text)) bad.push(`Count ${tone} 숫자 ${v.text} ≠ ${w.text} (${v.id})`);
  }
  const si = sets["Status Indicator"] || [];
  for (const v of si) { const tone = prop(v.name, "Tone"), w = want.statusDot[tone]; if (w && v.dot && !has$(v.dot, w)) bad.push(`Status Indicator ${tone} 점 ${v.dot} ≠ ${w} (${v.id})`); }
  if (si.length && !si.some((v) => /Pulse=On/.test(v.name))) bad.push("Status Indicator 에 Pulse=On 변형이 없습니다(.indicator.pulse)");
  for (const v of sets["Step"] || []) {
    const st = prop(v.name, "State"), w = want.step[st]; if (!w) continue;
    for (const k of ["circle", "check", "number", "label"]) if (w[k] && v[k] !== undefined && !has$(v[k], w[k])) bad.push(`Step ${st} ${k} ${v[k]} ≠ ${w[k]} (${v.id})`);
  }
  const ni = sets["Navigation Item"] || [];
  for (const v of ni) {
    const type = prop(v.name, "Type"), st = prop(v.name, "State"), w = want.navItem, tag = `Navigation Item ${type} ${st}`;
    if (st === "Hover" && !has$(v.fill, w.hover)) bad.push(`${tag} 면 ${v.fill} ≠ ${w.hover} (${v.id})`);
    if (st === "Pressed" && !has$(v.fill, w.pressed)) bad.push(`${tag} 면 ${v.fill} ≠ ${w.pressed} (${v.id})`);
    if (st === "Selected") {
      if (!has$(v.fill, w.selected.fill)) bad.push(`${tag} 면 ${v.fill} ≠ ${w.selected.fill} (${v.id})`);
      const lw = type === "Sub" ? w.sub.selected : w.selected.label;
      if (v.label && !has$(v.label, lw)) bad.push(`${tag} 글자 ${v.label} ≠ ${lw} (${v.id})`);
      if (v.icon && !has$(v.icon, w.selected.icon)) bad.push(`${tag} 아이콘 ${v.icon} ≠ ${w.selected.icon} (${v.id})`);
    } else {
      const lw = type === "Sub" ? w.sub.label : w.base.label;
      if (v.label && !has$(v.label, lw)) bad.push(`${tag} 글자 ${v.label} ≠ ${lw} (${v.id})`);
      if (v.icon && !has$(v.icon, w.base.icon)) bad.push(`${tag} 아이콘 ${v.icon} ≠ ${w.base.icon} (${v.id})`);
    }
    if (v.countInstance === false) bad.push(`${tag} 건수가 Count 인스턴스가 아닙니다 — 톤을 고를 수 없다 (${v.id})`);   // React countTone
  }
  if (ni.length && !ni.some((v) => prop(v.name, "State") === "Pressed")) bad.push("Navigation Item 에 State=Pressed 변형이 없습니다(.sidenav a:active)");
  /* 컨테이너가 항목 인스턴스로 짜였는지 · 접힌 내비의 빈 칸 */
  for (const nm of ["Navigation", "Steps"]) for (const v of sets[nm] || []) {
    const it = v.items; if (!it) continue;
    if (it.raw > 0 || it.inst === 0) bad.push(`${nm} 가 항목 인스턴스로 짜이지 않았습니다 — 복제본 ${it.raw} · 인스턴스 ${it.inst} (${v.name}, ${v.id})`);
    if (it.empty > 0) bad.push(`${nm} 에 빈 칸 프레임 ${it.empty}개 (${v.name}, ${v.id})`);
  }
  /* 컨테이너 내용 — 사이트 예제와 순서 · 라벨 · 상태 · 아이콘. Figma 글자를 고쳐 맞추지 않는다: 다르면 실패로 남겨 사람이 고른다 */
  const seqDiff = (where, v, site, fig, fmt) => {
    const n = Math.max(site.length, fig.length);
    for (let i = 0; i < n; i++) {
      const a = site[i] ? fmt(site[i]) : "없음", b = fig[i] ? fmt(fig[i]) : "없음";
      if (a !== b) bad.push(`${where} 항목 ${i + 1}: 저장소 [${a}] ≠ Figma [${b}] (${v.name}, ${v.id})`);
    }
  };
  for (const v of sets["Steps"] || []) {
    if (!v.itemsList) { notes.push("덤프에 컨테이너 항목 목록이 없습니다 — 2026-10-23 k 이전 probe.js 로 만든 덤프입니다"); break; }
    const fig = v.itemsList.filter((x) => x.item).map((x) => ({ state: x.item.replace(/^.*State=/, ""), mark: x.icon || x.number, label: x.label }));
    seqDiff("Steps", v, want.stepsItems, fig, (x) => `${x.state} · ${x.mark} · ${x.label}`);
  }
  for (const v of (sets["Navigation"] || []).filter((x) => /State=Expanded/.test(x.name))) {
    if (!v.itemsList) break;
    const fig = v.itemsList.filter((x) => x.item || x.group).map((x) => x.group ? { kind: "group", label: x.group }
      : { kind: "item", type: prop(x.item, "Type"), state: prop(x.item, "State"), icon: x.icon, label: x.label, count: x.count });
    seqDiff("Navigation", v, want.navItems, fig, (x) => x.kind === "item" ? `${x.type}${x.state === "Selected" ? "·선택" : ""} · ${x.icon || "아이콘 없음"} · ${x.label}${x.count ? " · 건수 " + x.count : ""}` : `${x.kind === "group" ? "그룹" : "foot"} · ${x.label}`);
  }
  /* 도넛 호 각도 — CSS 정지점과 ±0.5° · 색 */
  for (const v of sets["Chart Card"] || []) {
    if (!v.donutArcs) continue;
    const ang = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
    if (v.donutArcs.length !== want.donutArcs.length) bad.push(`Donut 호 ${v.donutArcs.length}개 ≠ ${want.donutArcs.length}개(.donut conic-gradient) (${v.id})`);
    else want.donutArcs.forEach((w, i) => { const [s, e, p] = v.donutArcs[i];
      if (ang(s, w.from) > 0.5 || ang(e, w.to) > 0.5 || !has$(p, w.tok)) bad.push(`Donut 호 ${i + 1}: Figma ${s}°~${e}° ${p} ≠ 저장소 ${+w.from.toFixed(2)}°~${+w.to.toFixed(2)}° ${w.tok} (${v.id})`); });
  }
  /* 체크 선 굵기 — 저장소의 실제 굵기(stroke-width × 폭/24) */
  for (const nm of ["Step", "Steps"]) for (const v of sets[nm] || []) {
    if (v.checkW === undefined) continue;
    if (typeof v.checkW !== "number" || Math.abs(v.checkW - want.checkStroke) > 0.01) bad.push(`${nm} 체크 선 굵기 ${v.checkW} ≠ ${want.checkStroke}(.steps li i svg: stroke-width × 폭/24) — ${v.name} (${v.id})`);
  }
  /* Pulse 고리 — Pulse=On 은 같은 계열 토큰 · 0 < 굵기 ≤ 최대 퍼짐, Pulse=Off 는 고리 없음.
     고리(ring)는 2026-10-23 k 의 probe.js 부터 적으므로, 그 전 덤프(새 필드가 하나도 없음)에서는 보지 않는다 */
  const newProbe = Object.values(sets).some((vs) => vs.some((v) => v.refs !== undefined || v.itemsList !== undefined || v.checkW !== undefined));
  for (const v of newProbe ? si : []) {
    const p = prop(v.name, "Pulse"); if (!p) continue;
    const [paintR, wR] = (v.ring || "").split("|"), w = +wR, tok = /\$([a-z]+)\/([a-z]+)\//.exec(paintR || "");
    if (p === "On") {
      if (!v.ring) bad.push(`Status Indicator Pulse=On 에 고리가 없습니다(.indicator.pulse) — ${v.name} (${v.id})`);
      else {
        if (!tok || tok[2] !== want.pulse.family) bad.push(`Pulse 고리 색 ${paintR} 이 ${want.pulse.tok} 계열(${want.pulse.family})이 아닙니다 — ${v.name} (${v.id})`);
        if (!(w > 0 && w <= want.pulse.max)) bad.push(`Pulse 고리 굵기 ${wR} 가 0 초과 ${want.pulse.max} 이하(@keyframes pulse)가 아닙니다 — ${v.name} (${v.id})`);
      }
    } else if (v.ring) bad.push(`Status Indicator Pulse=Off 에 고리가 있습니다 ${v.ring} — ${v.name} (${v.id})`);
  }
  /* 컴포넌트 속성 연결 — 어떤 변형에서 이름·종류가 같은 노드가 속성 P 를 참조하면, 같은 노드를 가진 다른 변형도 P 를 참조해야 한다.
     복제(clone)해 넣은 변형은 연결이 빠진 채 들어온다(2026-10-23 j 에 8개). 같은 빠짐은 묶어서 한 줄로 */
  if (Object.values(sets).some((vs) => vs.some((v) => v.refs !== undefined))) {
    for (const [set, vs] of Object.entries(sets)) {
      const all = {};
      for (const v of vs) for (const [k, r] of Object.entries(v.refs || {})) for (const x of r.split(";").filter(Boolean)) (all[k] = all[k] || new Set()).add(x);
      const miss = {};
      for (const v of vs) for (const [k, r] of Object.entries(v.refs || {})) {
        const have = new Set(r.split(";").filter(Boolean));
        for (const x of all[k] || []) if (!have.has(x)) (miss[k + " → " + x] = miss[k + " → " + x] || []).push(v);
      }
      for (const [kx, list] of Object.entries(miss)) {
        const [k, x] = kx.split(" → "), [nm, ty] = k.split("|");
        bad.push(`${set} 속성 연결 빠짐 — ${nm}(${ty}) 이 ${x} 를 참조하지 않는 변형 ${list.length}개: ${list.slice(0, 3).map((v) => v.name + " " + v.id).join(" · ")}${list.length > 3 ? " …" : ""}`);
      }
    }
  } else notes.push("덤프에 컴포넌트 속성 연결 조사가 없습니다 — 2026-10-23 k 이전 probe.js 로 만든 덤프입니다");
  /* Sparkline 막대 — 강조는 하나, 나머지는 옅은 막대 */
  const sparkCheck = (where, v) => { const b = v.bars; if (!b) return;
    const hi = b["$" + want.sparkBars.hi] || 0, lo = b["$" + want.sparkBars.bar] || 0, all = Object.values(b).reduce((n, x) => n + x, 0);
    if (hi !== 1 || lo !== all - 1) bad.push(`${where} 막대 ${JSON.stringify(b)} ≠ 강조 1(${want.sparkBars.hi}) · 나머지 ${want.sparkBars.bar} (${v.id})`); };
  for (const v of sets["Chart Card"] || []) sparkCheck("Chart Card", v);
  const kpis = sets["KPI"] || [];
  for (const v of kpis) sparkCheck("KPI", v);
  if (kpis.length && !kpis.some((v) => /Sparkline=On/.test(v.name))) bad.push("KPI 에 Sparkline=On 변형이 없습니다(.kpi:has(> .sparkline))");
  /* Donut — 호 사이 틈(CSS 의 면 색 틈과 같은 각도)과 도넛 + 범례 행 */
  for (const v of sets["Chart Card"] || []) {
    if (!v.donutGaps) continue;
    if (v.donutGaps.some((g) => Math.abs(g - want.donut.gapDeg) > 0.5)) bad.push(`Donut 호 사이 간격 ${v.donutGaps.join(" · ")}° ≠ ${want.donut.gapDeg}° (${v.id})`);
    if (v.donutStrokes) bad.push(`Donut 호에 테두리 ${v.donutStrokes}개 — 틈은 비워서 만든다 (${v.id})`);
    if (want.donut.row === "space-between" && v.row !== "SPACE_BETWEEN/FILL") bad.push(`Donut + 범례 행 ${v.row} ≠ SPACE_BETWEEN/FILL(.donut-row) (${v.id})`);
  }
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

  for (const o of got.overflow || []) bad.push(`넘침 ${o.page} / ${o.node} +${o.by}${o.side ? " (" + (o.side === "left" ? "왼쪽" : "위") + ")" : ""}${o.clips ? " (잘림)" : ""}`);
  for (const o of (got.overlap || []).filter((x) => x.current !== false)) bad.push(`겹침 ${o.page}: ${o.a} ↔ ${o.b} (${o.by.join("×")})`);

  const notes = [];
  /* 서체 상태는 덤프의 실제 스타일 서체로 말한다 — 고정 문구를 찍다가 사람이 Pretendard 로 되돌린 뒤에도 "Noto 대체" 라고 했다 */
  if (got.fonts && !got.fonts.pretendard) {
    const noto = (got.textStyles || []).filter((t) => /^Noto Sans KR/.test(t.font)).map((t) => t.name);
    notes.push(noto.length
      ? `Figma 에 Pretendard 가 없어 텍스트 스타일 ${noto.length}개가 Noto Sans KR 대체입니다(${noto.slice(0, 4).join(" · ")}${noto.length > 4 ? " …" : ""}) — 되돌리기는 _figma/font-revert.md`
      : "텍스트 스타일은 Pretendard 지만 이 플러그인 환경에는 Pretendard 가 없습니다 — 글자 내용·스타일 연결 같은 텍스트 편집은 여기서 할 수 없습니다");
  }

  /* 텍스트 스타일 — typeScale 을 계산만 하고 대조하지 않아 "어긋남 0" 에 글자 크기가 빠져 있었다.
     저장소 .t-* 는 서체 이름을 적지 않으므로 서체는 Pretendard · Noto Sans KR(대체) 를 모두 받고 굵기만 본다 */
  const W = { Thin: 100, Light: 300, DemiLight: 350, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, Black: 900 };
  const ts = new Map((got.textStyles || []).map((t) => [t.name, t]));
  for (const [name, w] of Object.entries(want.typeScale)) {
    const t = ts.get(name);
    if (!t) { bad.push(`텍스트 스타일 없음 ${name}`); continue; }
    const fam = /^(Pretendard|Noto Sans KR)\b/.exec(t.font), wt = W[(t.font || "").split(" ").pop()];
    const em = parseFloat(w.letterSpacing) * (/em$/.test(w.letterSpacing) ? 100 : 0);   // 0.0282em = 2.82%
    const ls = parseFloat(t.letterSpacing) * (/%$/.test(t.letterSpacing) ? 1 : 0);
    const off = [];
    if (!fam) off.push(`서체 ${t.font}`);
    if (w.weight && wt !== w.weight) off.push(`굵기 ${wt} ≠ ${w.weight}`);
    if (t.size !== w.size) off.push(`크기 ${t.size} ≠ ${w.size}`);
    if (w.lineHeight && t.lineHeight !== w.lineHeight) off.push(`행간 ${t.lineHeight} ≠ ${w.lineHeight}`);
    if (Math.abs(ls - em) > 0.01) off.push(`자간 ${+ls.toFixed(2)}% ≠ ${+em.toFixed(2)}%`);
    if (off.length) bad.push(`텍스트 스타일 ${name}: ${off.join(" · ")}`);
  }
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
