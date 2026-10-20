/* Figma ↔ 저장소 대조.
 *
 *   node _figma/audit.mjs expect              저장소가 기대하는 상태를 JSON 으로
 *   node _figma/audit.mjs diff <덤프.json>    _figma/probe.js 결과와 대조 (어긋나면 exit 1)
 *
 * 기대값은 **저장소에서 읽는다** — 손으로 적은 숫자는 금방 거짓이 된다.
 *   토큰   _build/style.src.css 의 :root 와 :root[data-theme="dark"]
 *   아이콘 _build/icons.gen.js 의 ICONS
 *   타입   assets/style.css 의 .t-* 클래스
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
