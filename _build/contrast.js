/* 대비 게이트 — contrast.pairs.js 의 선언을 실제 생성 사이트에서 전수 측정한다.
   라이트·다크 × 제품 세 경우(기본 · 밝은 제품 · 상태색과 겹치는 제품) = 6 맥락.
   기준 미달이면 빌드를 실패시키고, 통과하면 Colors 페이지 표의 재료(JSON)를 남긴다.

   파서가 핵심이다 — 종전에 토큰 값을 `s.match(/[0-9.]+/g)` 로 읽어 알파를 떨어뜨린 탓에
   반투명 면 위 글자를 검은 바탕에 대고 재는 버그가 두 번 났다. 여기서는 알파를 살려 합성한다. */
const path = require("path");
const fs = require("fs");
const SITE = path.resolve(__dirname, "..");
const { chromium } = require(path.join(__dirname, "node_modules/playwright"));
const P = require("./contrast.pairs.js");

const lum = ({ r, g, b }) => {
  const [x, y, z] = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * x + 0.7152 * y + 0.0722 * z;
};
const ratio = (a, b) => { const [x, y] = [lum(a) + 0.05, lum(b) + 0.05]; return +(Math.max(x, y) / Math.min(x, y)).toFixed(2); };
/* a 를 b 위에 얹는다 */
const over = (a, b) => a.a >= 0.999 ? a : ({
  r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1,
});
const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0").toUpperCase()).join("");

/* 브라우저에서 토큰을 계산값으로 받아 온다. color-mix 는 Chromium 이 color(srgb …) 로 직렬화하므로 둘 다 읽는다 */
const RESOLVE = (toks) => {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;left:-9999px";
  document.body.append(d);
  const out = {};
  for (const t of toks) {
    d.style.color = "";
    d.style.color = "var(" + t + ")";
    out[t] = getComputedStyle(d).color;
  }
  d.remove();
  return out;
};

function parse(s) {
  let m = s.match(/^rgba?\(([^)]+)\)/);
  if (m) { const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; }
  m = s.match(/^color\(srgb\s+([^)]+)\)/);
  if (m) { const v = m[1].split(/[\s/]+/).filter(Boolean).map((x) => parseFloat(x)); return { r: v[0] * 255, g: v[1] * 255, b: v[2] * 255, a: v.length > 3 ? v[3] : 1 }; }
  m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
  return null;
}

const CONTEXTS = [
  { theme: "light", accent: "", label: "라이트 · 기본" },
  { theme: "light", accent: "product-a", label: "라이트 · 밝은 제품" },
  { theme: "light", accent: "product-b", label: "라이트 · 상태색과 겹치는 제품" },
  { theme: "dark", accent: "", label: "다크 · 기본" },
  { theme: "dark", accent: "product-a", label: "다크 · 밝은 제품" },
  { theme: "dark", accent: "product-b", label: "다크 · 상태색과 겹치는 제품" },
];

/* 소비자 0 검사 — 샘플 블록과 문서 크롬이 실제로 참조하는지 본다 */
function consumerAudit(css) {
  const cut = css.indexOf("*{box-sizing");
  const declared = new Set();
  for (const m of css.slice(0, cut).matchAll(/(--[a-z0-9-]+)\s*:/g)) declared.add(m[1]);
  const used = new Set();
  for (const m of css.slice(cut).matchAll(/var\((--[a-z0-9-]+)/g)) used.add(m[1]);
  /* 의미 토큰이 다른 의미 토큰을 참조하는 것도 소비로 센다(예: --shadow-1 → --shadow-sm) */
  for (const m of css.slice(0, cut).matchAll(/var\((--[a-z0-9-]+)/g)) used.add(m[1]);
  const skip = (t) => /^--(neutral|brand|accent|red|orange|green|cyan|prod|space|radius|shadow|motion|font|header|sidebar|toc|shell|card|row)-/.test(t)
    || /^--(static|sev)-/.test(t) || P.grammarOnly.includes(t);
  return [...declared].filter((t) => !used.has(t) && !skip(t)).sort();
}

/* 샘플 블록에서 프리미티브를 직접 참조하면 3계층 규칙이 깨진다 */
function primitiveAudit(css) {
  const s = css.indexOf("/* ---------- Live component samples ---------- */");
  const e = css.indexOf("/* ---------- /Live component samples ---------- */");
  const out = [];
  for (const m of css.slice(s, e).matchAll(/var\((--(?:neutral|brand|accent|red|orange|green|cyan)-\d+)\)/g)) out.push(m[1]);
  return [...new Set(out)];
}

async function run() {
  const css = fs.readFileSync(path.join(SITE, "assets", "style.css"), "utf8");
  const fails = [];
  const warns = [];

  for (const t of primitiveAudit(css)) fails.push(`샘플 블록이 프리미티브를 직접 참조: ${t}`);
  for (const t of consumerAudit(css)) warns.push(`소비자 0: ${t}`);

  const need = new Set();
  for (const [fg, bgs] of P.pairs) { need.add(fg); bgs.forEach((b) => need.add(b)); }
  for (const [fill, bgs] of P.separation) { need.add(fill); bgs.forEach((b) => need.add(b)); }
  P.severityRanks.forEach((t) => need.add(t));
  P.SOLID_ONLY.forEach((t) => need.add(t));
  const toks = [...need];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("file://" + path.join(SITE, "foundations", "colors.html"));
  await page.waitForTimeout(200);

  const table = [];      // Colors 페이지 표의 재료
  for (const ctx of CONTEXTS) {
    await page.evaluate((th) => document.documentElement.setAttribute("data-theme", th), ctx.theme);
    if (ctx.accent) {
      await page.locator("#accentBtn").click().catch(() => {});
      await page.locator(`#accentPop [data-accent="${ctx.accent}"]`).click();
    } else {
      await page.evaluate(() => { const r = document.documentElement; for (let i of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) r.style.removeProperty("--prod-" + i); r.removeAttribute("data-accent-light"); r.removeAttribute("data-accent-neutral"); });
    }
    await page.waitForTimeout(120);
    const raw = await page.evaluate(RESOLVE, toks);
    const C = {};
    for (const t of toks) {
      const v = parse((raw[t] || "").trim());
      if (!v) fails.push(`${ctx.label}: ${t} 를 색으로 읽을 수 없다 — "${raw[t]}"`);
      C[t] = v;
    }
    if (toks.some((t) => !C[t])) continue;   /* 색으로 못 읽은 게 있으면 이 맥락은 더 재지 않는다 */

    /* 알파 금지 규칙 */
    for (const t of P.SOLID_ONLY) if (C[t] && C[t].a < 0.999) fails.push(`${ctx.label}: ${t} 에 알파가 있다(${C[t].a}) — surface·on·text·graphic 은 솔리드여야 한다`);

    /* 선언한 쌍 전수 */
    for (const [fg, bgs, min, note, opt] of P.pairs) {
      for (const bg of bgs) {
        /* 바탕이 반투명하면 세 표면 위에서 각각 합성해 가장 나쁜 값을 쓴다 */
        const beds = C[bg].a < 0.999 ? P.SURFACES : [null];
        for (const bed of beds) {
          const eff = bed ? over(C[bg], C[bed]) : C[bg];
          const r = ratio(C[fg], eff);
          const label = bed ? `${bg} / ${bed}` : bg;
          table.push({ ctx: ctx.label, theme: ctx.theme, accent: ctx.accent, fg, bg: label, min, r, note, pass: r >= min, hex: { fg: hex(C[fg]), bg: hex(eff) } });
          if (r < min) (opt && opt.advisory ? warns : fails).push(`${ctx.label}: ${fg}(${hex(C[fg])}) on ${label}(${hex(eff)}) = ${r} < ${min}`);
        }
      }
    }

    /* 옅은 면이 자기 바탕과 구분되는지 */
    for (const [fill, bgs, floor] of P.separation) {
      const min = typeof floor === "number" ? floor : floor[ctx.theme];
      for (const bg of bgs) {
        const eff = over(C[fill], C[bg]);
        const r = ratio(eff, C[bg]);
        if (r < min) fails.push(`${ctx.label}: ${fill} 이 ${bg} 와 구분되지 않는다 — ${r} < ${min}`);
      }
    }

    /* 심각도 — 같은 색조 이웃은 휘도로 갈려야 한다(빨강 둘은 휘도가 유일한 단서다) */
    for (const [a, b] of P.severitySameHue) {
      const r = ratio(over(C[a], C["--surface-raised"]), over(C[b], C["--surface-raised"]));
      if (r < P.SEVERITY_ADJACENT_MIN) fails.push(`${ctx.label}: 심각도 ${a} ↔ ${b} 는 같은 색조라 휘도로 갈려야 한다 — ${r} < ${P.SEVERITY_ADJACENT_MIN}`);
    }
    /* 그리고 다섯 등급이 서로 다른 값이어야 한다 — 색조가 달라 대비로는 잡히지 않는 중복을 잡는다 */
    {
      const seen = new Map();
      for (const t of P.severityRanks) {
        const h = hex(over(C[t], C["--surface-raised"]));
        if (seen.has(h)) fails.push(`${ctx.label}: 심각도 ${seen.get(h)} 와 ${t} 가 같은 색이다(${h})`);
        seen.set(h, t);
      }
    }
  }
  await browser.close();

  fs.writeFileSync(path.join(__dirname, "contrast.json"), JSON.stringify({ generatedAt: new Date().toISOString(), table }, null, 0));
  return { fails, warns, table };
}

if (require.main === module) {
  run().then(({ fails, warns, table }) => {
    for (const w of warns) console.log("WARN  " + w);
    for (const f of fails) console.log("FAIL  " + f);
    console.log(`contrast: 쌍 ${table.length}건 측정 · 실패 ${fails.length} · 경고 ${warns.length}`);
    process.exitCode = fails.length ? 1 : 0;
  });
}
module.exports = { run, parse, ratio, over, lum, hex };
