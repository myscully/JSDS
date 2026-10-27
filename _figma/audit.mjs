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
 *   컨테이너 _build/components.data.js 의 예제 HTML(순서 · 라벨 · 아이콘), 내비 기하는 빌드된 components/navigation.html 을
 *            헤드리스 Chromium 으로 잰 값(_build/node_modules/playwright — 없으면 어긋남으로 남긴다)
 *   Spec   _build/components.data.js 의 spec 행 ↔ 문서 카드 "Card/…" 의 Spec 글
 *   포커스 _build/style.src.css 의 값 입력 필드 포커스 규칙(오류 필드 포함 · k9 부터 inset 없음)과 전역 :focus-visible 외곽선(선택 컨트롤 · Button 의 Focus Ring) — focusExpect
 *   효과 색 컴포넌트 세트의 그림자 색이 변수나 효과 스타일에 묶였는지(2026-10-26 k6) — 기대값 없이 probe 가 모은 것을 그대로 어긋남으로
 *   버튼   빌드된 components/button.html 에 "버튼" 버튼을 붙여 Chromium 으로 잰 상자(테두리 + padding · 높이)(2026-10-26 k7)
 *   기본 변형 Tag 세트의 기본 변형 크기 ↔ components.data.js 의 Tag props size 기본값(2026-10-26 k7)
 *   반투명 모든 컴포넌트 · 변형 · 세트의 자기 불투명도가 1 인지(2026-10-27 k10) — 비활성은 토큰으로 칠한다(CLAUDE.md). 예외는 OPACITY_OK
 *   선택 컨트롤 선택된 Radio · 선택 + 비활성 Radio 의 면 · 테두리 · 점, 비활성 Slider 의 라벨 · 값 글자 칠(2026-10-27 k11) — controlsExpect
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
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
  /* 주석을 먼저 지운다 — 규칙 뒤에 붙은 설명 주석이 다음 규칙의 셀렉터 앞에 끼어 목록 안 셀렉터를 못 찾았다(2026-10-26 k5) */
  const css = read("_build/style.src.css").replace(/\/\*[\s\S]*?\*\//g, "");
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
function navExample(id = "basic") {
  const out = [];
  for (const m of exampleHtml("navigation", id).matchAll(/<a([^>]*)>([\s\S]*?)<\/a>|<div class="(group|foot)">([\s\S]*?)<\/div>/g)) {
    if (m[3]) { out.push({ kind: m[3], label: strip(m[4]) }); continue; }
    const cls = ((/class="([^"]*)"/.exec(m[1]) || [])[1] || "").split(/\s+/);
    const ic = /\$\{I\("([a-z0-9-]+)"/.exec(m[2]), ct = /<span class="count[^"]*">([\s\S]*?)<\/span>/.exec(m[2]);
    const body = m[2].replace(/\$\{[^}]*\}/g, "").replace(/<span class="count[^"]*">[\s\S]*?<\/span>/g, "");
    out.push({ kind: "item", type: cls.includes("sub") ? "Sub" : "Default", state: cls.includes("on") ? "Selected" : "Default", icon: ic ? ic[1] : null, label: strip(body), count: ct ? strip(ct[1]) : null });
  }
  /* 접힌 예제(.sidenav.collapsed) — 하위 항목 · 그룹 · 건수 · foot 은 CSS 가 숨긴다. 남는 항목은 Figma 의 Type=Collapsed 와 맞춘다 */
  if (id === "collapsed") return out.filter((x) => x.kind === "item" && x.type !== "Sub").map((x) => ({ ...x, type: "Collapsed", count: null }));
  return out;
}

/* ---------- 사이트 실측(2026-10-26 k3) ----------
   내비 항목 · 그룹의 높이와 세로 위치는 CSS 규칙만 읽어서는 얻을 수 없다(줄 높이 상속 · flex gap · 여백). 그래서 빌드된 사이트
   components/navigation.html 을 헤드리스 Chromium 으로 열어 Default(#ex-navigation-basic) · Collapsed(#ex-navigation-collapsed)
   예제를 잰다. 기준점은 레일 안쪽(padding box)의 위 끝이다 — 사이트 예제는 미리보기용으로 네 변에 1px 테두리를 인라인 style 로
   따로 달아 그만큼 내려가 있고, 컴포넌트 CSS(.sidenav)의 테두리는 오른쪽 1px 뿐이라 Figma 레일에는 위 테두리가 없다.
   재지 못하면(Playwright 없음 · 빌드 안 됨) 빼고 넘어가지 않고 어긋남으로 남긴다.
   Tag 세 크기의 높이(2026-10-26 k5)도 같은 브라우저로 components/tag.html 예제에서 잰다(줄 높이 1.6 × 12px + padding 이라 CSS 만으로는 소수점이 맞지 않는다) */
async function siteMeasure() {
  /* 한 번 띄운 브라우저로 내비(2026-10-26 k3)와 Tag 높이(2026-10-26 k5)를 잰다. 어느 하나를 못 재면 그쪽에만 error 를 단다 */
  let chromium;
  try { ({ chromium } = require(path.join(ROOT, "_build/node_modules/playwright"))); }
  catch (e) { const err = { error: "playwright 를 불러오지 못했습니다(" + String(e.message).split("\n")[0] + ")" }; return { nav: err, tag: err, btn: err }; }
  let b;
  const out = {};
  try {
    b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const open = async (page) => { const file = path.join(ROOT, "components", page + ".html"); if (!fs.existsSync(file)) return false; await p.goto("file://" + file); return true; };
    /* 내비 */
    if (!(await open("navigation"))) out.nav = { error: "components/navigation.html 이 없습니다 — 사이트를 빌드하세요" };
    else {
      const r = await p.evaluate(() => {
        const one = (sel) => {
          const nav = document.querySelector(sel); if (!nav) return null;
          const cs = getComputedStyle(nav), top = nav.getBoundingClientRect().top + parseFloat(cs.borderTopWidth);
          const kids = [...nav.children].filter((k) => getComputedStyle(k).display !== "none").map((k) => {
            const c = getComputedStyle(k), box = k.getBoundingClientRect();
            return { kind: k.tagName === "A" ? "item" : k.classList.contains("group") ? "group" : k.classList.contains("foot") ? "foot" : "other",
              y: box.top - top, h: box.height, mt: parseFloat(c.marginTop), mb: parseFloat(c.marginBottom), pb: parseFloat(c.paddingBottom) };
          });
          return { padBottom: parseFloat(cs.paddingBottom), kids };
        };
        return { basic: one("#ex-navigation-basic .sidenav"), collapsed: one("#ex-navigation-collapsed .sidenav") };
      });
      out.nav = r.basic && r.collapsed ? r : { error: "사이트에서 내비 예제(#ex-navigation-basic · #ex-navigation-collapsed)를 찾지 못했습니다" };
    }
    /* Tag 높이 — 예제 안의 .tag.sm · .tag(크기 클래스 없음) · .tag.lg 첫 것 */
    if (!(await open("tag"))) out.tag = { error: "components/tag.html 이 없습니다 — 사이트를 빌드하세요" };
    else {
      const t = await p.evaluate(() => {
        const h = (sel) => { const e = document.querySelector(sel); return e ? +e.getBoundingClientRect().height.toFixed(3) : null; };
        return { sm: h(".example-preview .tag.sm"), md: h(".example-preview .tag:not(.sm):not(.lg)"), lg: h(".example-preview .tag.lg") };
      });
      out.tag = t.sm && t.md && t.lg ? t : { error: "사이트 Tag 예제에서 세 크기(.tag.sm · .tag · .tag.lg)를 다 찾지 못했습니다 " + JSON.stringify(t) };
    }
    /* 버튼(2026-10-26 k7) — components/button.html 에 "버튼" 라벨 버튼을 잠시 붙여(파일은 그대로) 변형 · 크기 · 아이콘만 여부마다
       폭 · 높이 · 라벨 글자의 폭과 x 를 잰다. Figma 변형의 라벨이 "버튼" 이라 같은 글로 잰다. 아이콘만 있는 버튼은 16 아이콘 하나 */
    if (!(await open("button"))) out.btn = { error: "components/button.html 이 없습니다 — 사이트를 빌드하세요" };
    else {
      out.btn = await p.evaluate(async () => {
        await document.fonts.ready;
        const host = document.createElement("div"); host.style.cssText = "position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px";
        (document.querySelector(".example-preview") || document.body).appendChild(host);
        const res = {};
        for (const v of ["primary", "secondary", "tertiary", "text", "danger", "danger secondary"]) for (const s of ["sm", "md", "lg"]) for (const icon of [false, true]) {
          const e = document.createElement("button"); e.type = "button"; e.className = "btn " + v + " " + s + (icon ? " icon" : "");
          if (icon) e.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"></svg>'; else e.textContent = "버튼";
          host.appendChild(e);
          const r = e.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
          res[v + "|" + s + "|" + icon] = { w: +r.width.toFixed(3), h: +r.height.toFixed(3), text: icon ? null : +tr.width.toFixed(3), textX: icon ? null : +(tr.left - r.left).toFixed(3) };
        }
        host.remove();
        return res;
      });
    }
  } catch (e) {
    const err = { error: "사이트를 재지 못했습니다(" + String(e.message).split("\n")[0] + ")" };
    if (!out.nav) out.nav = err; if (!out.tag) out.tag = err; if (!out.btn) out.btn = err;
  } finally { if (b) await b.close(); }
  return out;
}

/* ---------- 포커스(2026-10-26 k5 · k6 · k9) ----------
   값 입력 필드 — 사람의 결정(k5): Text Field · Search · Select 트리거 · Date Picker 필드의 포커스는 테두리 1px + inset 1px(합쳐 2px 가장자리)
   + 0 0 0 4px 후광. k6: 오류 필드(.field.error)의 포커스는 같은 모양을 negative 토큰으로 — Figma 에서는 Text Field 의 State=Error Focused.
   k9(사람의 결정 "필드에서 focus 됐을 경우에는 1px 브랜드 컬러와 4px 의 박스 섀도우가 함께 나오는 형태"): inset 을 뺐다 — 테두리 1px + 후광만.
   그래서 inset 은 **있어도 없어도 읽는다**: CSS 에 inset 이 없으면 Figma 칸에도 안쪽 그림자가 없어야 하고, 있으면 예전처럼 spread 를 맞춘다.
   검색창 링은 입력칸에 포커스가 있을 때만이다(.searchbar:has(input:focus) — :focus-within 이면 지우기 버튼 포커스에도 링이 나왔다).
   기대값은 사이트 CSS 에서 읽는다 — [기본 규칙(테두리 굵기), 포커스 규칙(border-color · box-shadow)]. 테두리 · 후광을 읽지 못하면 어긋남으로 낸다.
   외곽선 포커스(선택 컨트롤 · Button) — 사이트의 전역 :focus-visible 외곽선(굵기 · offset · 색). k6 에는 바깥 그림자 두 겹(틈을 면 색으로 칠함)으로
   그렸으나, 사람의 결정(k7): 틈은 사이트에서 판 색이 비쳐 보이는 자리이므로 어느 바탕 위에서도 같게 — 선만 있는 고리 하나("Focus Ring")로 그린다.
   k8(외곽선 2px → 1px)에 표현을 하나로 맞췄다 — Button 이 쓰던 방식: 고리 사각형은 사이트 outline-offset 상자 그 자체(dx = dy = −offset,
   크기 = 칸 + 2 × offset)이고 선은 OUTSIDE 로 굵기만큼 바깥에 그린다. 그래서 굵기가 바뀌어도 선 굵기 하나만 고치면 되고, 사각형 경계가 곧 CSS 의
   outline 시작선이다(k7 의 INSIDE 방식은 굵기가 바뀌면 자리 · 크기 · 모서리를 모두 다시 맞춰야 했다). 선 brand · 굵기 · OUTSIDE, 면 없음, 효과 없음.
   모서리는 칸 모서리 + offset(사이트 외곽선 안쪽 모서리는 border-radius + offset — 칸이 각지면 고리도 각지고, 완전히 둥글면 고리도 완전히 둥글다).
   칸에는 그림자가 남지 않아야 한다. Slider 칸(Track = range 280×20)은 사이트 range 처럼 바탕이 없어야 한다(.slider input[type=range] 의 background).
   Button 은 변형 자신이 칸이다(k8). 사이트에서 외곽선을 쓰지만 Figma 에 Focused 변형이 없는 것(Tab · Pagination · Chip …)은 대조할 것이 없다 */
const FOCUS_CSS = [
  { set: "Text Field", state: "Focused", base: ".field input", rule: ".field input:focus" },
  { set: "Text Field", state: "Error Focused", base: ".field input", rule: ".field.error input:focus" },
  { set: "Search", state: "Focused", base: ".searchbar", rule: ".searchbar:has(input:focus)" },
  { set: "Select", state: "Focused", base: ".dropdown .trigger", rule: ".dropdown .trigger:focus-visible" },
  { set: "Date Picker", state: "Focused", base: ".datepicker .field-btn", rule: ".datepicker .field-btn:focus-visible" },
];
const RING_SETS = ["Checkbox", "Radio Button", "Switch", "Slider", "Button"];
function focusExpect() {
  const fields = [];
  const shadow = (s) => { const nums = s.replace(/var\([^)]*\)/g, " ").replace(/\binset\b/, " ").trim().split(/\s+/).filter(Boolean).map(parseFloat); return { x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0, spread: nums[3] || 0, tok: figTok(s), inset: /\binset\b/.test(s) }; };
  for (const { set, state, base, rule } of FOCUS_CSS) {
    try {
      const b = cssRule(base), f = cssRule(rule);
      const bw = parseFloat((/(\d+(?:\.\d+)?)px\s+solid/.exec(b.border || "") || [])[1]);
      const parts = (f["box-shadow"] || "").split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean).map(shadow);
      const ins = parts.filter((x) => x.inset), ring = parts.filter((x) => !x.inset);
      /* inset 은 0 또는 1개(k9 부터 0 이 정답), 후광은 꼭 1개 */
      if (!(bw > 0) || !figTok(f["border-color"]) || ins.length > 1 || (ins.length && !ins[0].tok) || ring.length !== 1 || !ring[0].tok) throw new Error(`${rule} 의 border · box-shadow 를 읽지 못했습니다(${b.border} / ${f["border-color"]} / ${f["box-shadow"]})`);
      fields.push({ set, state, border: { tok: figTok(f["border-color"]), w: bw }, inner: ins[0] || null, ring: ring[0], css: rule });
    } catch (e) { fields.push({ set, state, error: String(e.message || e) }); }
  }
  let ring;
  try {
    const r = cssRule(":focus-visible");
    const m = /(\d+(?:\.\d+)?)px\s+solid\s+(var\(--[a-z0-9-]+\))/.exec(r.outline || "");
    const off = parseFloat(r["outline-offset"]);
    if (!m || !(off >= 0) || !figTok(m[2])) throw new Error(`:focus-visible 의 outline · outline-offset 을 읽지 못했습니다(${r.outline} / ${r["outline-offset"]})`);
    const sb = (cssRule(".slider input[type=range]").background || "").trim();
    ring = { tok: figTok(m[2]), width: +m[1], offset: off, css: ":focus-visible", sliderTrack: sb === "transparent" ? "-" : null, sliderTrackCss: ".slider input[type=range] background:" + (sb || "(없음)") };
  } catch (e) { ring = { error: String(e.message || e) }; }
  return { fields, ring };
}

/* 선택 컨트롤의 칠(2026-10-27 k11) — 선택된 Radio(면 · 안쪽 테두리 · 점)와 선택 + 비활성 Radio, 비활성 Slider 의 라벨 · 값 글자.
   CSS 에서 읽는다: .radio input:checked(background · inset box-shadow) · ::after(점) · :disabled · :checked:disabled::after,
   .slider:has(input:disabled) .row(color). 테두리는 inset box-shadow 의 굵기와 토큰이다(Figma 는 INSIDE 선). 하나라도 못 읽으면 어긋남이다 */
function controlsExpect() {
  try {
    const ins = (v) => { const m = /inset\s+0\s+0\s+0\s+([\d.]+)px\s+(var\(--[a-z0-9-]+\))/.exec(v || ""); return m ? { w: +m[1], tok: figTok(m[2]) } : null; };
    const ck = cssRule(".radio input:checked"), ckA = cssRule(".radio input:checked::after"), dis = cssRule(".radio input:disabled"), disA = cssRule(".radio input:checked:disabled::after");
    const sl = cssRule(".slider:has(input:disabled) .row");
    const r1 = ins(ck["box-shadow"]), r2 = ins(dis["box-shadow"]);
    const out = {
      radioChecked: { face: figTok(ck.background), ring: r1 && r1.tok, sw: r1 && r1.w, dot: figTok(ckA.background), css: ".radio input:checked" },
      radioDisabled: { face: figTok(dis.background), ring: r2 && r2.tok, sw: r2 && r2.w, dot: figTok(disA.background), css: ".radio input:disabled · :checked:disabled::after" },
      sliderText: figTok(sl.color),
    };
    for (const k of ["radioChecked", "radioDisabled"]) for (const f of ["face", "ring", "sw", "dot"]) if (!out[k][f]) throw new Error(`${out[k].css} 의 ${f} 를 읽지 못했습니다`);
    if (!out.sliderText) throw new Error(".slider:has(input:disabled) .row 의 color 를 읽지 못했습니다");
    return out;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Tag 기본 크기(2026-10-26 k7) — components.data.js 의 Tag props 에서 size 행의 기본값(md)을 읽어 Figma 크기 이름으로 */
function tagDefaultSize() {
  const box = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
  const row = ((box.module.exports.tag || {}).props || []).find((r) => r[0] === "size");
  return row ? { sm: "Small", md: "Medium", lg: "Large" }[String(row[2]).trim()] || null : null;
}

/* ---------- 문서 카드 Spec(2026-10-26 k3) ----------
   저장소 값은 _build/components.data.js 의 spec 행이다. 파일을 그대로 실행해 읽는다(아이콘 함수 I 는 빈 글로 대신한다).
   사이트에 보이는 글로 바꿔 둔다 — HTML 태그를 지우고 엔티티를 푼다. 맞대는 규칙은 diffComponents 의 Spec 대조 주석에 */
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
const specNorm = (s) => String(s).normalize("NFC").replace(/\s+/g, " ").trim();
const specSite = (s) => specNorm(String(s).replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENT[e]));
function specExpect() {
  const box = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
  const out = {};
  for (const [slug, c] of Object.entries(box.module.exports)) out[slug] = (c.spec || []).map(([k, v]) => [specNorm(k), specSite(v)]);
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
    navCollapsed: navExample("collapsed"),
    /* 문서 카드 Spec — 컴포넌트 키별 [행 이름, 사이트 글] (2026-10-26 k3) */
    specs: specExpect(),
    /* 값 입력 필드 4종의 포커스 — 사이트 CSS (2026-10-26 k5) */
    focus: focusExpect(),
    /* Tag 기본 크기 — props 의 size 기본값(2026-10-26 k7) */
    tagDefault: tagDefaultSize(),
    /* 선택된 Radio · 비활성 Slider 글자의 칠 — 사이트 CSS (2026-10-27 k11) */
    controls: controlsExpect(),
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

/* 속성 연결 규칙의 선언된 예외 — 넷(세트 · 변형 · 노드 · 속성)이 다 맞을 때만 넘긴다. 다른 빠짐은 그대로 잡는다 */
const REF_EXCEPTIONS = [
  { set: "Button", variant: /(?:^|, )State=Loading(?:,|$)/, key: "Leading Icon|INSTANCE", ref: "visible=Leading Icon#315:121",
    why: "State=Loading 은 그 자리에 스피너를 늘 보이므로 Leading Icon 속성으로 끄지 않는다(사람의 결정 2026-10-23 k2). 범위: Button · State=Loading · Leading Icon(INSTANCE) · visible=Leading Icon#315:121" },
];

/* 반투명 컴포넌트의 선언된 예외(2026-10-27 k10) — 컴포넌트 자체가 반투명이어야 하는 것만 [세트, 변형 이름 정규식, 이유] 로 적는다
   (예: 끌기 미리보기 · 딤 오버레이 견본). 비활성 표현은 여기 넣지 않는다 — 비활성은 토큰으로 칠한다(CLAUDE.md). 지금은 없다 */
const OPACITY_OK = [];

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
  /* 비활성을 opacity 로 흐리는 것은 버튼만의 문제가 아니다 — 조사하는 세트 전부에서 본다(모든 컴포넌트로 넓힌 검사는 아래 "반투명 컴포넌트") */
  const dimmed = new Set();
  for (const [set, vs] of Object.entries(sets)) {
    if (set === "Button") continue;
    for (const v of vs) if (/Disabled/.test(v.name) && v.opacity !== undefined && v.opacity < 1) { dimmed.add(v.id); bad.push(`${set} Disabled 를 opacity ${v.opacity} 로 흐림 — ${v.name} (${v.id})`); }
  }
  for (const v of sets.Button || []) if (/Disabled/.test(v.name) && v.opacity !== undefined && v.opacity < 1) dimmed.add(v.id);   // Button 은 아래 Button 검사가 낸다
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
  const navFmt = (x) => x.kind === "item" ? `${x.type}${x.state === "Selected" ? "·선택" : ""} · ${x.icon || "아이콘 없음"} · ${x.label}${x.count ? " · 건수 " + x.count : ""}` : `${x.kind === "group" ? "그룹" : "foot"} · ${x.label}`;
  let geoErr = null, geoNote = false;
  for (const v of sets["Navigation"] || []) {
    if (!v.itemsList) break;
    const collapsed = /State=Collapsed/.test(v.name);
    if (!collapsed && !/State=Expanded/.test(v.name)) continue;
    const fig = v.itemsList.filter((x) => x.item || x.group || x.foot).map((x) => x.group ? { kind: "group", label: x.group } : x.foot ? { kind: "foot", label: x.foot }
      : { kind: "item", type: prop(x.item, "Type"), state: prop(x.item, "State"), icon: x.icon, label: collapsed ? x.labelProp : x.label, count: x.count });   // 접힌 레일은 라벨 글자가 없다 — Label 속성 값(사이트의 숨은 span · title)
    seqDiff("Navigation", v, collapsed ? want.navCollapsed : want.navItems, fig, navFmt);
    /* 기하(2026-10-26 k3) — 사이트 실측과 ±0.5. 항목은 칸의 y · 높이, 그룹은 바깥 여백까지 친 칸(margin box: y − margin-top,
       높이 + margin-top + margin-bottom)과 글자 가운데, foot 은 레일 아래 끝에서 글자 아래 끝까지의 거리(margin-top:auto 로 아래에 붙는지).
       Figma 글자 상자는 텍스트 스타일 행간(Label/2 16 · Title/2 20)이라 사이트 줄 상자(행간 1.6)와 높이가 다를 수 있어 그룹은 가운데로 본다.
       레일 높이(560)는 화면 높이를 나타내는 값으로 두기로 했다(사람의 결정 2026-10-26) — 보지 않는다 */
    const geo = want.navGeo;
    if (!geo) continue;
    const list = v.itemsList.filter((x) => x.item || x.group || x.foot);
    if (list.some((x) => x.y === undefined)) { geoNote = true; continue; }
    if (geo.error) { geoErr = geo.error; continue; }
    const site = (collapsed ? geo.collapsed : geo.basic).kids.filter((k) => k.kind !== "other");
    if (site.length !== list.length) continue;   // 항목 수가 다르면 위 seqDiff 가 이미 어긋남으로 냈다
    const r2 = (x) => +x.toFixed(2), off = (a, b) => Math.abs(a - b) > 0.5;
    const rail = v.box ? v.box.h : null;
    for (const [i, x] of list.entries()) {
      const s = site[i], nm = x.group || x.foot || x.labelProp || x.label, at = `(${v.name}, ${v.id})`;
      const kind = x.group ? "group" : x.foot ? "foot" : "item";
      if (s.kind !== kind) continue;   // 종류가 다르면 seqDiff 가 냈다
      if (kind === "item") {
        if (off(x.y, s.y) || off(x.h, s.h)) bad.push(`Navigation 항목 ${i + 1} 칸 y ${r2(x.y)} · 높이 ${r2(x.h)} ≠ 사이트 실측 ${r2(s.y)} · ${r2(s.h)} — ${nm} ${at}`);
      } else if (kind === "group") {
        const my = s.y - s.mt, mh = s.h + s.mt + s.mb, fc = x.ty + x.th / 2, sc = s.y + s.h / 2;
        if (off(x.y, my) || off(x.h, mh)) bad.push(`Navigation 그룹 ${i + 1} 칸(바깥 여백 포함) y ${r2(x.y)} · 높이 ${r2(x.h)} ≠ 사이트 실측 ${r2(my)} · ${r2(mh)} — ${nm} ${at}`);
        if (off(fc, sc)) bad.push(`Navigation 그룹 ${i + 1} 글자 가운데 ${r2(fc)} ≠ 사이트 실측 ${r2(sc)} — ${nm} ${at}`);
      } else if (rail !== null) {
        const fb = rail - (x.ty + x.th), sb = geo.basic.padBottom + s.pb;
        if (off(fb, sb)) bad.push(`Navigation foot 글자 아래 끝이 레일 아래에서 ${r2(fb)} ≠ 사이트 ${r2(sb)}(레일 padding ${geo.basic.padBottom} + foot padding ${s.pb}) — 아래에 붙지 않았습니다 ${at}`);
      }
    }
  }
  if (geoErr) bad.push(`내비 기하를 사이트와 대조하지 못했습니다 — ${geoErr}`);
  if (geoNote) notes.push("덤프에 컨테이너 기하(y · 높이)가 없습니다 — 2026-10-26 k3 전 probe.js 로 만든 덤프입니다");
  /* 컨테이너 항목의 아이콘 색 — Navigation Item 은 기본 · 선택 아이콘 색, Steps 는 Done 체크 색. 아이콘을 바꿔 끼운 인스턴스에서
     이름이 다른 층(list 의 점 3개 등)이 아이콘 원본 색으로 남았다(2026-10-23 k2) — 원본 변형만 봐서는 못 잡는다 */
  for (const [nm, exp] of [["Navigation", (x) => (prop(x.item, "State") === "Selected" ? want.navItem.selected.icon : want.navItem.base.icon)], ["Steps", (x) => (want.step[prop(x.item, "State")] || {}).check]]) {
    for (const v of sets[nm] || []) for (const [i, x] of (v.itemsList || []).entries()) {
      if (!x.item || !x.iconPaints) continue;
      const w = exp(x); if (!w) continue;
      if (x.iconPaints !== "$" + w) bad.push(`${nm} 항목 ${i + 1} 아이콘 색 ${x.iconPaints} ≠ ${w} — ${x.labelProp || x.label} (${v.name}, ${v.id})`);
    }
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
    const hits = new Map(REF_EXCEPTIONS.map((e) => [e, 0]));
    for (const [set, vs] of Object.entries(sets)) {
      const all = {};
      for (const v of vs) for (const [k, r] of Object.entries(v.refs || {})) for (const x of r.split(";").filter(Boolean)) (all[k] = all[k] || new Set()).add(x);
      const miss = {}; let excused = 0;
      for (const v of vs) for (const [k, r] of Object.entries(v.refs || {})) {
        const have = new Set(r.split(";").filter(Boolean));
        for (const x of all[k] || []) if (!have.has(x)) {
          const e = REF_EXCEPTIONS.find((e) => e.set === set && e.variant.test(v.name) && e.key === k && e.ref === x);
          if (e) { excused++; hits.set(e, hits.get(e) + 1); continue; }
          (miss[k + " → " + x] = miss[k + " → " + x] || []).push(v);
        }
      }
      if (excused) notes.push(`${set} 속성 연결 빠짐 ${excused}개는 선언된 예외입니다 — ${REF_EXCEPTIONS.filter((e) => e.set === set).map((e) => e.why).join(" / ")}`);
      for (const [kx, list] of Object.entries(miss)) {
        const [k, x] = kx.split(" → "), [nm, ty] = k.split("|");
        bad.push(`${set} 속성 연결 빠짐 — ${nm}(${ty}) 이 ${x} 를 참조하지 않는 변형 ${list.length}개: ${list.slice(0, 3).map((v) => v.name + " " + v.id).join(" · ")}${list.length > 3 ? " …" : ""}`);
      }
    }
    /* 맞는 곳이 없는 예외는 남겨 두면 나중에 같은 이름의 진짜 빠짐을 덮는다 — 원인이 없어졌으면 지운다 */
    for (const [e, n] of hits) if (!n) notes.push(`선언된 예외가 맞는 곳이 없습니다 — ${e.set} · ${e.key} · ${e.ref}. 원인이 없어졌으면 audit.mjs 의 REF_EXCEPTIONS 에서 지우세요`);
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
  for (const s of c.sections || []) if (s.gap !== want.sectionGap) bad.push(`섹션 간격 ${s.page}${s.pageId ? "(" + s.pageId + ")" : ""}: ${s.a} → ${s.b} ${s.gap} ≠ ${want.sectionGap}`);
  if ((c.negText || []).length) bad.push(`글자에 foreground/negative/primary ${c.negText.length}개 — 저장소는 글자에 strong (${c.negText.slice(0, 6).join(" ")}${c.negText.length > 6 ? " …" : ""})`);
  /* 문서 카드 Spec 글 ↔ 저장소 spec 행(2026-10-26 k3). 모든 컴포넌트를 본다. 맞대는 법
     - 카드: Figma 프레임 "Card/<이름>" 의 <이름>을 소문자로, 공백을 "-" 로 바꾼 것이 components.data.js 의 키다("Text Field" → text-field).
       짝이 없는 카드 · 키는 둘 다 어긋남이다
     - 행: 행 이름(Size · Container · Label · Placement · State · Motion …)이 같은 것끼리 맞댄다. 순서는 보지 않는다. 한쪽에만 있는 행도 어긋남이다
     - 글: 저장소 값은 사이트에 보이는 글로 바꾼다 — HTML 태그(<code> · <b> …)를 지우고 엔티티 &amp; &lt; &gt; &quot; &#39; &apos; &nbsp; 를 푼다.
       그다음 양쪽 모두 Unicode NFC 로 맞추고(macOS 가 한글을 NFD 로 넣는 일이 있다), 공백류(줄바꿈 · NBSP 포함)가 이어지면 공백 하나로, 앞뒤 공백은 지운다.
       그 밖의 차이(숫자 · 단위 · 문장부호 · 대소문자 · 토큰 이름 · 글 순서)는 그대로 어긋남이다 — 어느 쪽이 맞는지는 사람이 고른다.
       사이트 Spec 은 실측으로 자주 고쳐지므로(2026-10 에 22행) 이 대조는 Figma 글이 뒤처진 곳을 찾는 데 쓴다. 고친 곳은 2026-10-26 k3 의 3행뿐이다 */
  if (c.specs) {
    const key = (card) => card.replace(/^Card\//, "").trim().toLowerCase().replace(/\s+/g, "-");
    const fig = new Map(c.specs.map((s) => [key(s.card), s]));
    for (const [slug, rows] of Object.entries(want.specs)) {
      const s = fig.get(slug);
      if (!s) { bad.push(`Spec 카드 없음: ${slug} — Figma 에 "Card/…" 문서 카드나 그 안의 Spec 프레임이 없습니다`); continue; }
      const nm = s.card.replace(/^Card\//, ""), have = new Map(s.rows.map((r) => [specNorm(r[0]), r]));
      for (const [row, site] of rows) {
        const f = have.get(row);
        if (!f) bad.push(`Spec ${nm} · ${row}: 저장소에만 있는 행 — 저장소 [${site}] (카드 ${s.id})`);
        else if (specNorm(f[1]) !== site) bad.push(`Spec ${nm} · ${row}: 저장소 [${site}] ≠ Figma [${specNorm(f[1])}] (${f[2]})`);
      }
      for (const [row, f] of have) if (!rows.some((r) => r[0] === row)) bad.push(`Spec ${nm} · ${row}: Figma 에만 있는 행 — Figma [${specNorm(f[1])}] (${f[2]})`);
    }
    for (const [slug, s] of fig) if (!want.specs[slug]) bad.push(`Spec 카드 ${s.card}(${s.id}) 에 맞는 저장소 컴포넌트가 없습니다(키 ${slug})`);
  } else notes.push("덤프에 문서 카드 Spec 이 없습니다 — 2026-10-26 k3 전 probe.js 로 만든 덤프입니다");
  /* 포커스(2026-10-26 k5 · k6 · k9) — 값 입력 필드는 테두리 · 안쪽 줄 · 후광의 토큰과 굵기를 사이트 CSS 와 맞춘다.
     Figma 는 안쪽 그림자를 INSIDE 테두리 밑에 그린다(임시 노드로 확인 — spread 1 은 1px 테두리에 완전히 가려지고, spread 2 라야
     테두리 안쪽에 1px 이 보인다). 그래서 CSS 의 inset Npx 는 Figma 안쪽 그림자 spread = N + 테두리 굵기 로 그린 것을 기대한다.
     k9 부터 CSS 에 inset 이 없다 — 그때는 Figma 칸에 안쪽 그림자가 하나도 없어야 한다(남은 안쪽 그림자가 어긋남).
     변형은 State 값으로 가른다(Focused · Error Focused — 옛 덤프에는 state 가 없어 Focused 로 본다). 기대값이 없는 포커스 상태도 어긋남이다.
     선택 컨트롤 · Button 은 아래 외곽선 대조가 본다. 세트나 변형이 없으면, 기대값을 CSS 에서 읽지 못하면 어긋남이다 */
  if (c.focus) {
    const stateOf = (v) => v.state || "Focused";
    const ok = (fx, tok, spread, blur) => fx.length === 1 && fx[0][0] === tok && fx[0][1] === spread && fx[0][2] === blur && fx[0][3] === "0,0";
    for (const w of want.focus.fields) {
      if (w.error) { bad.push(`${w.set} State=${w.state} 포커스 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${w.error}`); continue; }
      const all = c.focus[w.set];
      if (!all) { bad.push(`${w.set} 세트가 없어 State=${w.state} 를 대조하지 못했습니다`); continue; }
      const list = all.filter((v) => stateOf(v) === w.state);
      if (!list.length) { bad.push(`${w.set} 에 State=${w.state} 변형이 없습니다 — 사이트 ${w.css}`); continue; }
      const innerSpread = w.inner ? w.inner.spread + w.border.w : 0;
      for (const v of list) {
        const at = `${w.set} ${v.variant} (${v.id})`;
        if (!v.box) { bad.push(`${at} — 포커스 칸을 찾지 못했습니다`); continue; }
        if (v.stroke !== "$" + w.border.tok || v.sw !== w.border.w || v.align !== "INSIDE") bad.push(`${at} 테두리 ${v.stroke} · ${v.sw}px · ${v.align} ≠ ${w.border.tok} · ${w.border.w}px · INSIDE`);
        if (!w.inner) { if (v.inner.length) bad.push(`${at} 안쪽 그림자가 남아 있습니다 ${JSON.stringify(v.inner)} — 사이트 ${w.css} 에는 inset 이 없습니다(테두리 ${w.border.w}px + 후광)`); }
        else if (!ok(v.inner, w.inner.tok, innerSpread, w.inner.blur)) bad.push(`${at} 안쪽 줄 ${JSON.stringify(v.inner)} ≠ [${w.inner.tok}, spread ${innerSpread}(inset ${w.inner.spread} + 테두리 ${w.border.w}), blur ${w.inner.blur}]`);
        if (!ok(v.drop, w.ring.tok, w.ring.spread, w.ring.blur)) bad.push(`${at} 후광 ${JSON.stringify(v.drop)} ≠ [${w.ring.tok}, spread ${w.ring.spread}, blur ${w.ring.blur}]`);
      }
    }
    for (const set of [...new Set(want.focus.fields.map((w) => w.set))]) for (const v of c.focus[set] || []) {
      if (!want.focus.fields.some((w) => w.set === set && w.state === stateOf(v))) bad.push(`${set} ${v.variant} (${v.id}) — 기대값이 없는 포커스 상태(${stateOf(v)}). 사이트 규칙이 있으면 audit.mjs 의 FOCUS_CSS 에 더하세요`);
    }
    /* 외곽선 포커스(선택 컨트롤 · Button) — 사이트 :focus-visible 외곽선을 선만 있는 고리("Focus Ring")로(2026-10-26 k7 · k8). 규칙은 focusExpect 머리 주석 */
    const r = want.focus.ring;
    /* 옛 덤프 — 세트가 조사에 없거나(선택 컨트롤 k6 전 · Button k8 전) 고리 필드가 없으면(k7 전) 그 세트만 NOTE 로 넘긴다 */
    const ringSets = RING_SETS.filter((s) => {
      if (!(s in c.focus)) { notes.push(`덤프에 ${s} 포커스 조사가 없습니다 — ${s === "Button" ? "2026-10-26 k8" : "2026-10-26 k6"} 전 probe.js 로 만든 덤프입니다`); return false; }
      if ((c.focus[s] || []).length && c.focus[s].every((v) => v.ring === undefined)) { notes.push(`덤프에 ${s} 의 고리(Focus Ring) 조사가 없습니다 — 2026-10-26 k7 전 probe.js 로 만든 덤프입니다`); return false; }
      return true;
    });
    if (ringSets.length && r.error) bad.push(`외곽선 포커스 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${r.error}`);
    else for (const set of ringSets) {
      const list = c.focus[set];
      if (!list) { bad.push(`${set} 세트가 없어 Focused 를 대조하지 못했습니다`); continue; }
      if (!list.length) { bad.push(`${set} 에 State=Focused 변형이 없습니다 — 사이트 ${r.css}`); continue; }
      const full = (rad, w, h) => typeof rad === "number" && rad >= Math.min(w, h) / 2 - 0.01;
      for (const v of list) {
        const at = `${set} ${v.variant} (${v.id})`;
        if (!v.box) { bad.push(`${at} — 포커스 칸을 찾지 못했습니다`); continue; }
        if (v.drop.length || v.inner.length) bad.push(`${at} 칸(${v.box})에 그림자가 남아 있습니다 ${JSON.stringify(v.drop.concat(v.inner))} — 고리는 Focus Ring 이 그립니다`);
        if (set === "Slider" && r.sliderTrack && v.fill !== r.sliderTrack) bad.push(`${at} 칸(${v.box}) 면 ${v.fill} — 사이트 range 는 바탕이 없습니다(${r.sliderTrackCss})`);
        const g = v.ring;
        if (!g) { bad.push(`${at} — Focus Ring 이 없습니다. 사이트 outline ${r.width}px ${r.tok} · offset ${r.offset}`); continue; }
        if (g.stroke !== "$" + r.tok || g.sw !== r.width || g.align !== "OUTSIDE") bad.push(`${at} 고리 선 ${g.stroke} · ${g.sw}px · ${g.align} ≠ ${r.tok} · ${r.width}px · OUTSIDE`);
        if (g.fill !== "-") bad.push(`${at} 고리에 면 ${g.fill} — 틈은 비어 있어야 바탕이 비칩니다`);
        if (g.fx) bad.push(`${at} 고리에 효과 ${g.fx}개`);
        const ex = { dx: -r.offset, dy: -r.offset, w: +(v.size[0] + 2 * r.offset).toFixed(2), h: +(v.size[1] + 2 * r.offset).toFixed(2) };
        if (Math.abs(g.dx - ex.dx) > 0.5 || Math.abs(g.dy - ex.dy) > 0.5 || Math.abs(g.w - ex.w) > 0.5 || Math.abs(g.h - ex.h) > 0.5) bad.push(`${at} 고리 자리 ${g.dx},${g.dy} · ${g.w}×${g.h} ≠ 칸에서 ${ex.dx},${ex.dy} · ${ex.w}×${ex.h}(outline-offset ${r.offset} 상자 — 선 ${r.width}px 는 그 바깥)`);
        if (full(v.radius, v.size[0], v.size[1])) { if (!full(g.radius, g.w, g.h)) bad.push(`${at} 고리 모서리 ${g.radius} — 칸이 완전히 둥글어 고리도 완전히 둥글어야 합니다`); }
        else if (typeof v.radius === "number") { const er = v.radius > 0 ? v.radius + r.offset : 0; if (Math.abs(g.radius - er) > 0.5) bad.push(`${at} 고리 모서리 ${g.radius} ≠ ${er}(칸 ${v.radius}${v.radius > 0 ? " + offset " + r.offset : " — 각진 칸은 각진 고리"})`); }
      }
    }
  } else notes.push("덤프에 값 입력 필드 Focused 조사가 없습니다 — 2026-10-26 k5 전 probe.js 로 만든 덤프입니다");
  /* Tag 높이(2026-10-26 k5) — 크기마다 모든 변형이 사이트 실측과 ±0.5. 잴 수 없으면 어긋남이다 */
  if (c.tagHeights !== undefined) {
    const tg = want.tagSite;
    if (!tg || tg.error) bad.push(`Tag 높이를 사이트와 대조하지 못했습니다 — ${tg ? tg.error : "잴 수 없음"}`);
    else if (!c.tagHeights) bad.push("Tag 세트가 없어 높이를 대조하지 못했습니다");
    else for (const [size, k] of [["Small", "sm"], ["Medium", "md"], ["Large", "lg"]]) {
      const f = c.tagHeights[size];
      if (!f) { bad.push(`Tag 에 Size=${size} 변형이 없습니다`); continue; }
      if (Math.abs(f[0] - tg[k]) > 0.5 || Math.abs(f[1] - tg[k]) > 0.5) bad.push(`Tag Size=${size} 높이 ${f[0] === f[1] ? f[0] : f[0] + "~" + f[1]}(변형 ${f[2]}) ≠ 사이트 실측 ${+tg[k].toFixed(2)}`);
    }
  } else notes.push("덤프에 Tag 높이가 없습니다 — 2026-10-26 k5 전 probe.js 로 만든 덤프입니다");
  /* 효과(그림자) 색의 변수 연결(2026-10-26 k6) — 사람의 결정: 컴포넌트 세트의 그림자 색은 변수에 묶거나 효과 스타일로 칠한다.
     변수 없는 색이 하나라도 남으면 어긋남이다. 범위와 거짓 경보를 피하려고 뺀 것은 probe.js 의 같은 날짜 주석에 */
  if (c.effectColors) {
    for (const e of c.effectColors.raw) bad.push(`효과 색이 변수에 묶이지 않았습니다 — ${e.set} · ${e.variant} · ${e.node} (${e.id}) ${e.type} ${e.color} spread ${e.spread} blur ${e.blur}`);
  } else notes.push("덤프에 효과 색 조사가 없습니다 — 2026-10-26 k6 전 probe.js 로 만든 덤프입니다");
  /* 반투명 컴포넌트(2026-10-27 k10) — 사람의 결정: 컴포넌트 변형의 불투명도를 본다. 자기 불투명도가 1 이 아닌 컴포넌트 · 변형 · 세트는 어긋남이다.
     비활성은 opacity 로 흐리지 않고 --surface-disable-primary(면 · 테두리) · --foreground-disable-primary(글자 · 표시)로 칠한다(CLAUDE.md · 사이트 :disabled 규칙).
     거짓 경보가 날 수 있는 경우와 규칙:
       - 컴포넌트 자체가 반투명이어야 하는 것(끌기 미리보기 · 딤 오버레이 견본 등)은 OPACITY_OK 에 이유와 함께 선언한다. 비활성은 선언 대상이 아니다.
       - 안쪽 층(아이콘 · 장식 · 프레임)의 불투명도는 probe 가 적지 않는다 — 사이트도 opacity 로 그리는 표현이 있어서다(.tbl th.sortable::after 0.45 ↔ Figma 정렬 아이콘 0.45).
         그래서 변형 안의 층을 opacity 로 흐린 비활성(예: 달력 Day/Disabled 프레임)은 이 검사로 잡히지 않는다.
       - 숨긴 변형도 본다. 위 조사 세트 검사가 이미 낸 Disabled 는 다시 내지 않는다 */
  if (c.translucent !== undefined) {
    for (const t of c.translucent) {
      if (dimmed.has(t.id)) continue;
      const ok = OPACITY_OK.find((e) => e.set === t.set && e.variant.test(t.name));
      if (ok) { notes.push(`반투명 컴포넌트 ${t.set} · ${t.name} 는 선언된 예외입니다 — ${ok.why}`); continue; }
      bad.push(`${t.set ? t.set + " " : ""}${t.name} (${t.id}) 불투명도 ${t.opacity} — 컴포넌트는 1 이어야 합니다${/Disabled/.test(t.name) ? ". 비활성은 --surface-disable-primary · --foreground-disable-primary 로 칠합니다" : ""}`);
    }
  } else notes.push("덤프에 반투명 컴포넌트 조사가 없습니다 — 2026-10-27 k10 전 probe.js 로 만든 덤프입니다");
  /* 선택 컨트롤의 칠(2026-10-27 k11) — 사람의 결정: 선택된 Radio 는 사이트처럼 brand 면 + 같은 색 안쪽 1.5px + brand-label 점,
     선택 + 비활성은 disable 면 · 테두리 + foreground-disable 점. 비활성 Slider 는 라벨 · 값도 foreground-disable. 기대값은 controlsExpect */
  if (c.controls !== undefined) {
    const ce = want.controls;
    if (ce.error) bad.push(`선택 컨트롤의 칠 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${ce.error}`);
    else {
      if (!c.controls.radio || !c.controls.radio.length) bad.push("Radio Button 세트에 Value=Checked 변형이 없어 선택 칠을 대조하지 못했습니다");
      for (const v of c.controls.radio || []) {
        const w = /(?:^|, )State=Disabled(?:,|$)/.test(v.variant) ? ce.radioDisabled : ce.radioChecked;
        const at = `Radio Button ${v.variant} (${v.id})`;
        if (v.face !== "$" + w.face) bad.push(`${at} 면 ${v.face} ≠ ${w.face} — 사이트 ${w.css}`);
        if (v.ring !== "$" + w.ring || v.sw !== w.sw) bad.push(`${at} 테두리 ${v.ring} · ${v.sw}px ≠ ${w.ring} · ${w.sw}px(안쪽) — 사이트 ${w.css}`);
        if (v.dot !== "$" + w.dot) bad.push(`${at} 점 ${v.dot} ≠ ${w.dot} — 사이트 ${w.css}`);
      }
      if (!c.controls.sliderDisabled || !c.controls.sliderDisabled.length) bad.push("Slider 세트에 State=Disabled 변형이 없어 비활성 글자를 대조하지 못했습니다");
      for (const v of c.controls.sliderDisabled || []) for (const f of ["label", "value"]) {
        if (v[f] !== "$" + ce.sliderText) bad.push(`Slider ${v.variant} (${v.id}) ${f === "label" ? "라벨" : "값"} 글자 ${v[f]} ≠ ${ce.sliderText} — 사이트 .slider:has(input:disabled) .row · .val`);
      }
    }
  } else notes.push("덤프에 선택 컨트롤의 칠 조사가 없습니다 — 2026-10-27 k11 전 probe.js 로 만든 덤프입니다");
  const pv = (name, k) => { const m = new RegExp("(?:^|, )" + k + "=([^,]+)").exec(name || ""); return m ? m[1].trim() : null; };
  /* 버튼 상자(2026-10-26 k7) — 사람의 결정: 사이트 버튼의 1px 투명 테두리 몫을 Figma 에도 둔다. State=Default 변형마다 사이트에서 잰 같은 버튼과
     (폭 − 라벨 폭) = 테두리 + padding, 라벨 x = 테두리 + 왼쪽 padding, 높이를 ±0.5 로 맞춘다. 아이콘만 있는 버튼은 폭 · 높이.
     라벨 폭 자체는 맞추지 않는다 — Figma 텍스트 스타일이 자간(Label/2 2.52% · Label/1 1.45% · Title/1 0.57%)을 지니고 자동 폭이 정수로 올라가
     사이트(.btn 자간 0)보다 0.3 ~ 1.3px 넓다. 그 차이는 글자를 고쳐야 하고 지금은 Pretendard 가 없어 막혀 있다. 잴 수 없으면 어긋남이다 */
  if (c.buttons !== undefined) {
    const sb = want.btnSite;
    if (!sb || sb.error) bad.push(`버튼 상자를 사이트와 대조하지 못했습니다 — ${sb ? sb.error : "잴 수 없음"}`);
    else if (!c.buttons || !c.buttons.length) bad.push("Button 세트가 없어 버튼 상자를 대조하지 못했습니다");
    else {
      const VAR = { Primary: "primary", Secondary: "secondary", Tertiary: "tertiary", Text: "text", Danger: "danger", "Danger Secondary": "danger secondary" }, SIZE = { Small: "sm", Medium: "md", Large: "lg" };
      for (const v of c.buttons) {
        const io = pv(v.name, "Icon Only") === "True", s = sb[VAR[pv(v.name, "Variant")] + "|" + SIZE[pv(v.name, "Size")] + "|" + io];
        const at = `Button ${v.name} (${v.id})`;
        if (!s) { bad.push(`${at} — 사이트에서 같은 버튼을 재지 못했습니다`); continue; }
        if (Math.abs(v.h - s.h) > 0.5) bad.push(`${at} 높이 ${v.h} ≠ 사이트 ${s.h}`);
        if (io) { if (Math.abs(v.w - s.w) > 0.5) bad.push(`${at} 폭 ${v.w} ≠ 사이트 ${s.w}`); continue; }
        if (!v.label) { bad.push(`${at} — 라벨 글자를 찾지 못했습니다`); continue; }
        const box = +(v.w - v.label[1]).toFixed(2), sbox = +(s.w - s.text).toFixed(2);
        if (Math.abs(box - sbox) > 0.5) bad.push(`${at} 테두리 + padding ${box}(폭 ${v.w} − 라벨 ${v.label[1]}) ≠ 사이트 ${sbox}(폭 ${s.w} − 라벨 ${s.text})`);
        if (Math.abs(v.label[2] - s.textX) > 0.5) bad.push(`${at} 라벨 x ${v.label[2]} ≠ 사이트 ${s.textX}(테두리 + 왼쪽 padding)`);
      }
    }
  } else notes.push("덤프에 버튼 상자가 없습니다 — 2026-10-26 k7 전 probe.js 로 만든 덤프입니다");
  /* 기본 변형(2026-10-26 k7) — 사람의 결정: Tag 세트의 기본 변형 크기는 사이트 기본(Tag props 의 size 기본값 md → Medium).
     Figma 의 기본 변형은 세트에서 왼쪽 위에 놓인 변형이다 — 그래서 각 Style 묶음에서 Medium 줄이 맨 위에 온다 */
  if (c.defaults) {
    const d = c.defaults.Tag;
    if (!want.tagDefault) bad.push("Tag 기본 크기를 components.data.js 의 props 에서 읽지 못했습니다");
    else if (!d) bad.push("Tag 세트의 기본 변형을 읽지 못했습니다");
    else if (pv(d, "Size") !== want.tagDefault) bad.push(`Tag 기본 변형 "${d}" — Size 가 사이트 기본(${want.tagDefault})이 아닙니다`);
  } else notes.push("덤프에 세트 기본 변형이 없습니다 — 2026-10-26 k7 전 probe.js 로 만든 덤프입니다");
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
function diff(dumpPath, site) {
  const want = expect_();
  want.components.navGeo = site.nav;   // 사이트 실측(siteMeasure) — 진입점이 미리 잰다
  want.components.tagSite = site.tag;
  want.components.btnSite = site.btn;
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

  for (const o of got.overflow || []) bad.push(`넘침 ${o.page}${o.pageId ? "(" + o.pageId + ")" : ""} / ${o.node} +${o.by}${o.side ? " (" + (o.side === "left" ? "왼쪽" : "위") + ")" : ""}${o.clips ? " (잘림)" : ""}`);
  for (const o of (got.overlap || []).filter((x) => x.current !== false)) bad.push(`겹침 ${o.page}${o.pageId ? "(" + o.pageId + ")" : ""}: ${o.a} ↔ ${o.b} (${o.by.join("×")})`);

  const notes = [];
  /* 서체 상태는 덤프의 실제 스타일 서체로 말한다 — 고정 문구를 찍다가 사람이 Pretendard 로 되돌린 뒤에도 "Noto 대체" 라고 했다 */
  if (got.fonts && !got.fonts.pretendard) {
    const noto = (got.textStyles || []).filter((t) => /^Noto Sans KR/.test(t.font)).map((t) => t.name);
    notes.push(noto.length
      ? `Figma 에 Pretendard 가 없어 텍스트 스타일 ${noto.length}개가 Noto Sans KR 대체입니다(${noto.slice(0, 4).join(" · ")}${noto.length > 4 ? " …" : ""}) — 되돌리기는 _figma/font-revert.md`
      : "텍스트 스타일은 Pretendard 지만 이 플러그인 환경에는 Pretendard 가 없습니다 — 글자 내용·스타일 연결 같은 텍스트 편집은 여기서 할 수 없습니다");
  }

  /* 대조 범위 — probe 는 현재 페이지를 id 로 고른다(2026-10-23 k2). 범위의 id 가 파일에 없으면(페이지를 지우고 다시 만들면)
     그 페이지는 조사되지 않은 채 "어긋남 0" 이 나오므로 어긋남으로 잡는다. 이름이 같은데 범위 밖인 페이지는 매번 알린다 —
     빼는 것이 소리 없이 일어나지 않게 */
  if (got.scope) {
    const pg = new Map((got.pages || []).map((p) => [p.id, p]));
    for (const [id, name] of Object.entries(got.scope)) {
      const p = pg.get(id);
      if (!p) bad.push(`대조 범위의 페이지 ${name}(${id}) 가 파일에 없습니다 — 그 페이지는 조사되지 않았습니다. probe.js 의 CURRENT_PAGES 를 고치세요`);
      else if (p.name !== name) notes.push(`대조 범위의 페이지 ${id} 이름이 "${p.name}" 입니다(probe.js 에는 "${name}") — 조사는 id 로 했습니다`);
    }
    const names = new Set(Object.values(got.scope));
    const out = (got.pages || []).filter((p) => names.has(p.name) && !Object.prototype.hasOwnProperty.call(got.scope, p.id));
    if (out.length) notes.push(`대조에서 뺀 같은 이름의 페이지 ${out.length}개 — ${out.map((p) => p.name + "(" + p.id + ")").join(" · ")}. probe.js 의 CURRENT_PAGES 가 id 로 고릅니다`);
  } else notes.push("덤프에 대조 범위(scope)가 없습니다 — 어느 페이지를 조사했는지 덤프로는 확인할 수 없습니다(2026-10-23 k2 전 probe.js 는 이름으로 골라 같은 이름의 페이지가 섞였습니다)");

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
  const w = expect_();
  const site = await siteMeasure();
  w.components.navGeo = site.nav;
  w.components.tagSite = site.tag;
  w.components.btnSite = site.btn;
  console.log(JSON.stringify(w, null, 1));
} else if (cmd === "diff") {
  if (!arg) { console.error("쓰는 법: node _figma/audit.mjs diff <덤프.json>"); process.exit(2); }
  const { bad, notes, counts } = diff(arg, await siteMeasure());
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
