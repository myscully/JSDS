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
/* CIE L* — 대비 비율은 두 색의 '밝기 차'를 비율로만 말해서 중간 밝기끼리의 거리를 과소평가한다.
   등급 구분에는 지각 균등한 축이 맞다 */
const lstar = (c) => { const Y = lum(c); return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; };
/* a 를 b 위에 얹는다 */
const over = (a, b) => a.a >= 0.999 ? a : ({
  r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1,
});
const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0").toUpperCase()).join("");

/* 브라우저에서 토큰을 계산값으로 받아 온다. color-mix 는 Chromium 이 color(srgb …) 로 직렬화하므로 둘 다 읽는다 */
const SENTINEL = "rgb(7, 11, 13)";   /* 어떤 토큰도 이 값이 아니다 — 상속으로 떨어진 것을 가려내는 표식 */
const RESOLVE = ({ toks, sentinel }) => {
  const wrap = document.createElement("div");
  /* 토큰 값이 쓰레기면(예: var() 안의 이름 오타) computed 시점에 무효가 되어 '상속색'이 된다.
     부모에 아무도 쓰지 않는 색을 깔아 두면, 그 색으로 떨어진 토큰이 곧 깨진 토큰이다.
     선언이 아예 없는 경우는 폴백 둘을 비교해 따로 가려낸다 */
  wrap.style.cssText = "position:fixed;left:-9999px;color:" + sentinel;
  document.body.append(wrap);
  const d = document.createElement("div");
  wrap.append(d);
  const read = (v) => { d.style.color = ""; d.style.color = v; return getComputedStyle(d).color; };
  const out = {};
  for (const t of toks) {
    /* 선언되지 않은 토큰은 var() 가 무효가 되어 '상속색'으로 계산된다 — 그걸 정상 색으로 받으면
       선언만 해 두고 CSS 에 쓰지 않은 토큰을 게이트가 조용히 통과시킨다.
       서로 다른 폴백 둘로 읽어, 값이 갈리면 선언이 없는 것이다 */
    const a = read("var(" + t + ", rgb(1, 2, 3))");
    const b = read("var(" + t + ", rgb(4, 5, 6))");
    out[t] = a !== b ? null : (a === sentinel ? false : a);   /* null = 선언 없음 · false = 값이 깨짐 */
  }
  wrap.remove();
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
    || /^--static-/.test(t) || P.grammarOnly.includes(t);
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

  /* 소스에 선언한 토큰이 전부 실제로 루트에 남아 있는지 — 색이든 아니든.
     파스 오류는 '다음 세미콜론까지'를 통째로 버리므로 선언 하나가 조용히 사라진다(3차에서 다크 --shadow-xs 가 그랬다).
     색 토큰은 아래 센티넬 가드가 값까지 보고, 이 검사는 존재만 본다 — 그림자·간격·폰트까지 덮는다 */
  const declared = [...new Set([...css.slice(0, css.indexOf("*{box-sizing")).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]))]
    .filter((t) => !/^--prod-/.test(t));

  const need = new Set();
  for (const [fg, bgs] of P.pairs) { need.add(fg); bgs.forEach((b) => need.add(b)); }
  for (const [fill, bgs] of P.separation) { need.add(fill); bgs.forEach((b) => need.add(b)); }
  P.severityRanks.forEach((t) => need.add(t));
  P.severityFillSplit.forEach(([a2, b2]) => { need.add(a2); need.add(b2); });
  P.ladders.forEach(([, toks]) => toks.forEach((t) => need.add(t)));
  P.SOLID_ONLY.forEach((t) => need.add(t));
  const toks = [...need];

  /* 전용 푸트페이지에서 잰다 — 빌드가 섹션 폴더를 먼저 지우므로 생성 페이지에 의존할 수 없고,
     무엇보다 이 게이트가 페이지 렌더보다 앞서야 Colors 페이지가 측정 결과를 표로 쓸 수 있다.
     제품 전환은 실제 경로를 쓴다: app.js 가 window.applyAccent 를 노출하고 램프 생성·밝은 제품 판정이
     모두 그 안에 있다 — 여기서 다시 구현하면 검증 가치가 사라진다.
     page.setContent 로는 외부 스크립트가 로드되지 않아 파일로 쓴다 */
  const probe = path.join(__dirname, ".contrast-probe.html");
  fs.writeFileSync(probe, `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>contrast probe</title>
<link rel="stylesheet" href="../assets/style.css"></head>
<body data-root="../"><script src="../assets/app.js"></script></body></html>
`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const probeErrors = [];
  page.on("pageerror", (e) => probeErrors.push(e.message));
  await page.goto("file://" + probe);
  await page.waitForTimeout(200);
  if (!(await page.evaluate(() => typeof window.applyAccent === "function")))
    fails.push("푸트페이지에서 applyAccent 를 찾을 수 없다 — app.js 가 완주하지 못했다" + (probeErrors.length ? ` (${probeErrors[0]})` : ""));

  const table = [];      // Colors 페이지 표의 재료
  const ladders = [];    // 명도 사다리 — 두 모드를 한 화면에 나란히 보여 주는 재료
  for (const ctx of CONTEXTS) {
    await page.evaluate((th) => document.documentElement.setAttribute("data-theme", th), ctx.theme);
    if (ctx.accent) {
      await page.evaluate((k) => window.applyAccent(k), ctx.accent);
    } else {
      await page.evaluate(() => { const r = document.documentElement; for (let i of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) r.style.removeProperty("--prod-" + i); r.removeAttribute("data-accent-light"); r.removeAttribute("data-accent-neutral"); });
    }
    await page.waitForTimeout(120);
    /* 선언 존재 검사 — 비어 있으면 그 선언이 파서에게 버려졌다 */
    for (const [t, v] of Object.entries(await page.evaluate((ts) => {
      const r = getComputedStyle(document.documentElement); const o = {};
      for (const t2 of ts) o[t2] = r.getPropertyValue(t2).trim();
      return o;
    }, declared))) if (!v) fails.push(`${ctx.label}: ${t} 선언이 루트에 없다 — 파스 오류로 버려졌을 수 있다`);

    const raw = await page.evaluate(RESOLVE, { toks, sentinel: SENTINEL });
    const C = {};
    for (const t of toks) {
      if (raw[t] === null) { fails.push(`${ctx.label}: ${t} 가 선언되지 않았다 — 쌍에만 적고 CSS 에 쓰지 않았거나 이름이 틀렸다`); C[t] = null; continue; }
      if (raw[t] === false) { fails.push(`${ctx.label}: ${t} 의 값이 색으로 해소되지 않는다 — var() 안의 이름 오타이거나 값이 깨졌다`); C[t] = null; continue; }
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

    /* 등급 간 옅은 바탕 — 같은 색조 등급(Critical·High)은 바탕의 짙기가 유일한 단서다.
       같은 알파로 접으면 라이트 1.04 · 다크 1.09 로 '지각 가능' 바닥에도 못 미친다 */
    for (const [a, b, floor] of P.severityFillSplit) {
      const min = typeof floor === "number" ? floor : floor[ctx.theme];
      for (const bed of P.SURFACES) {
        const r = ratio(over(C[a], C[bed]), over(C[b], C[bed]));
        if (r < min) fails.push(`${ctx.label}: 등급 바탕 ${a} ↔ ${b} 가 ${bed} 위에서 갈리지 않는다 — ${r} < ${min}`);
      }
    }

    /* 명도 사다리 — 세 단계가 '고르게' 벌어졌는가. 쌍 대비가 보지 못하는 질문이다.
       제품 기본 맥락에서만 잰다: 사다리는 테마의 성질이고, 제품을 타는 의도 면 사다리는
       이미 위의 -on 쌍 검사가 세 경우를 전부 본다 */
    if (!ctx.accent) for (const [name, toks, o] of P.ladders) {
      /* 알파(fill·line)는 기준 표면 위에 합성한 뒤 잰다 — 합성하지 않으면 낙폭이 뜻 없는 값이 된다 */
      const eff = toks.map((t) => (C[t].a < 0.999 ? over(C[t], C["--surface-base"]) : C[t]));
      const ls = eff.map(lstar);
      const steps = [Math.abs(ls[1] - ls[0]), Math.abs(ls[2] - ls[1])];
      const dir = [Math.sign(ls[1] - ls[0]), Math.sign(ls[2] - ls[1])];
      /* 역전과 평탄은 다르다 — 방향이 서로 반대인 것만 역전이고, 한 단계가 0 인 것은 '그 단계가 없는' 것이다.
         라이트 surface 는 base 와 raised 가 둘 다 흰색이라 평탄하다(경계를 보더·그림자가 전담한다).
         의도된 선택일 수 있으므로 게이트가 판정하지 않고 최소 낙폭 경고로 보고한다 */
      const reversed = dir[0] !== 0 && dir[1] !== 0 && dir[0] !== dir[1];
      const minStep = Math.min(...steps);
      const balanceRatio = minStep > 0 ? +(Math.max(...steps) / minStep).toFixed(2) : null;
      ladders.push({ ctx: ctx.label, theme: ctx.theme, name, toks, balance: !!(o && o.balance),
        hex: eff.map(hex), lstar: ls.map((v) => +v.toFixed(1)), steps: steps.map((v) => +v.toFixed(1)),
        ratio: balanceRatio, reversed, minStep: +minStep.toFixed(1),
        balanceMax: (o && o.balance) ? P.LADDER_BALANCE_MAX : null });
      if (reversed) { fails.push(`${ctx.label}: 사다리 ${name} 의 방향이 뒤집혔다 — L* ${ls.map((v) => v.toFixed(1)).join(" → ")}`); continue; }
      /* 낙폭과 균형은 advisory — 지금 여럿이 못 넘기고 교정을 보류했다. 숫자를 숨기지 않고 매 빌드 보고한다 */
      if (minStep < P.LADDER_MIN_STEP)
        warns.push(`${ctx.label}: 사다리 ${name} 의 한 단계가 보이지 않는다 — ΔL* ${minStep.toFixed(1)} < ${P.LADDER_MIN_STEP} (${toks.join(" → ")})`);
      /* 균형은 낙폭이 균등해야 하는 사다리에만 — 상태 셋은 동시에 보이지 않고, surface 는 깊이 모델이다 */
      if (o && o.balance && balanceRatio !== null && balanceRatio > P.LADDER_BALANCE_MAX)
        warns.push(`${ctx.label}: 사다리 ${name} 이 치우쳤다 — 낙폭 ${steps.map((v) => v.toFixed(1)).join(" · ")} = ${balanceRatio}x > ${P.LADDER_BALANCE_MAX}`);
    }

    /* 심각도 — 같은 색조 이웃은 휘도로 갈려야 한다(빨강 둘은 휘도가 유일한 단서다) */
    for (const [a, b] of P.severitySameHue) {
      const r = ratio(over(C[a], C["--surface-raised"]), over(C[b], C["--surface-raised"]));
      if (r < P.SEVERITY_ADJACENT_MIN) fails.push(`${ctx.label}: 심각도 ${a} ↔ ${b} 는 같은 색조라 휘도로 갈려야 한다 — ${r} < ${P.SEVERITY_ADJACENT_MIN}`);
    }
    /* 다섯 등급 전수(10쌍) — 같은 색조 계열이면 휘도로 갈려야 하고(ΔL* ≥ 8),
       계열이 다르면 색조가 단서이므로 '값이 다르다'만 본다. 어느 쪽도 못 지키면 다섯 단계가 네 단계로 읽힌다.
       계열 표를 코드에 적어 두는 이유: red-600 과 neutral-500 은 ΔL* 0.9 로 휘도가 거의 같은데,
       그게 통과하는 까닭이 '계열이 달라서'라는 사실이 드러나야 한다 */
    for (let i = 0; i < P.severityRanks.length; i++) {
      for (let j = i + 1; j < P.severityRanks.length; j++) {
        const [a, b] = [P.severityRanks[i], P.severityRanks[j]];
        const [ea, eb] = [over(C[a], C["--surface-raised"]), over(C[b], C["--surface-raised"])];
        if (hex(ea) === hex(eb)) { fails.push(`${ctx.label}: 심각도 ${a} 와 ${b} 가 같은 색이다(${hex(ea)})`); continue; }
        const sameHue = P.hueFamilyOf(a) === P.hueFamilyOf(b);
        if (sameHue && Math.abs(lstar(ea) - lstar(eb)) < P.SAME_HUE_LSTAR_MIN)
          fails.push(`${ctx.label}: 심각도 ${a} ↔ ${b} 는 같은 ${P.hueFamilyOf(a)} 계열인데 ΔL* ${Math.abs(lstar(ea) - lstar(eb)).toFixed(1)} < ${P.SAME_HUE_LSTAR_MIN}`);
      }
    }
  }
  await browser.close();

  fs.writeFileSync(path.join(__dirname, "contrast.json"), JSON.stringify({ generatedAt: new Date().toISOString(), table, ladders }, null, 0));
  return { fails, warns, table, ladders };
}

if (require.main === module) {
  run().then(({ fails, warns, table, ladders }) => {
    for (const w of warns) console.log("WARN  " + w);
    for (const f of fails) console.log("FAIL  " + f);
    console.log(`contrast: 쌍 ${table.length}건 · 사다리 ${table.length && ladders.length}건 측정 · 실패 ${fails.length} · 경고 ${warns.length}`);
    process.exitCode = fails.length ? 1 : 0;
  });
}
module.exports = { run, parse, ratio, over, lum, hex };
