/* 텍스트 스타일 19단계(사람의 결정 2026-11-12) — behave.js 가 부른다.
   기대값은 사람이 준 표(이미지)를 그대로 옮긴 것이다 — CSS 에서 읽으면 CSS 가 틀려도 통과한다.
   - 스타일은 크기 · 행간 · 자간, 굵기는 .t-bold · .t-semibold · .t-medium · .t-regular(기본 굵기: Display · Title · Heading · Headline Bold, Body Regular, Label · Caption Medium)
   - 문서 사이트 h1 = Title 1(2026-11-14 사람의 결정 — 11-12 의 Display 3 에서 내림), Page Header 제목 = Title 2(2026-11-13 사람의 결정 — 11-12 의 Title 1 에서 내림)
   - 컴포넌트 글자도 표의 (크기, 행간, 자간) 중 하나 — 크기는 그대로 두고 행간 · 자간을 묶었다(사람의 결정) */
module.exports = async function type({ page, ok, go }) {
  const fs = require("fs"), path = require("path");
  const SITE = path.resolve(__dirname, "..");
  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.type", () => page);
  let TABLE, DEF, WEIGHTS;
  await part("1 · 명칭 · 크기 · 행간 · 자간(em) — 이미지의 표. Headline 2 는 표에 '26px (1.412", async () => {
    /* 명칭 · 크기 · 행간 · 자간(em) — 이미지의 표. Headline 2 는 표에 '26px (1.412)' 로 둘이 어긋나 비율 쪽 24 로 정했다(사람의 결정 2026-11-12) */
    TABLE = [["display-1", 56, 72, -0.0319], ["display-2", 40, 52, -0.0282], ["display-3", 36, 48, -0.027], ["title-1", 32, 44, -0.0253], ["title-2", 28, 38, -0.0236], ["title-3", 24, 32, -0.023],
      ["heading-1", 22, 30, -0.0194], ["heading-2", 20, 28, -0.012], ["headline-1", 18, 26, -0.002], ["headline-2", 17, 24, 0],
      ["body-1-normal", 16, 24, 0.0057], ["body-1-reading", 16, 26, 0.0057], ["body-2-normal", 15, 22, 0.0096], ["body-2-reading", 15, 24, 0.0096],
      ["label-1-normal", 14, 20, 0.0145], ["label-1-reading", 14, 22, 0.0145], ["label-2", 13, 18, 0.0194], ["caption-1", 12, 16, 0.0252], ["caption-2", 11, 14, 0.0311]];
    DEF = (c) => (/^(display|title|heading|headline)/.test(c) ? 700 : /^body/.test(c) ? 400 : 500);
    WEIGHTS = { bold: 700, semibold: 600, medium: 500, regular: 400 };
  });
  await part("2 · foundations/typography.html", async () => {

    await go("foundations/typography.html");
    const got = await page.evaluate(([T, W]) => {
      const box = document.createElement("div"); document.body.append(box);
      const m = (cls) => { const e = document.createElement("span"); e.className = cls; e.textContent = "가"; box.append(e); const c = getComputedStyle(e); return [parseFloat(c.fontSize), parseFloat(c.lineHeight), +(parseFloat(c.letterSpacing) / parseFloat(c.fontSize) || 0).toFixed(4), +c.fontWeight]; };
      const r = { styles: T.map(([c]) => m("t-" + c)), weights: Object.keys(W).map((w) => m(`t-caption-1 t-${w}`)[3]), heading: m("t-display-1 t-regular")[3] };
      box.remove(); return r;
    }, [TABLE, WEIGHTS]);
    const bad = TABLE.filter(([c, s, lh, ls], i) => { const [gs, gl, gls, gw] = got.styles[i]; return gs !== s || gl !== lh || Math.abs(gls - ls) > 0.0001 || gw !== DEF(c); }).map(([c], i) => `${c}:${JSON.stringify(got.styles[TABLE.findIndex((x) => x[0] === c)])}`);
    ok("19 text styles match the given table (size · line height · letter spacing) with their default weight", bad.length === 0, bad.join(" "));
    ok("weight classes override the style's default weight (Bold 700 · SemiBold 600 · Medium 500 · Regular 400)", JSON.stringify(got.weights) === JSON.stringify(Object.values(WEIGHTS)) && got.heading === 400, JSON.stringify(got));
  });
  await part("3 · components/page-header.html", async () => {

    /* 페이지 h1 — 문서 사이트 제목 = Title 1 · Page Header 제목 = Title 2 */
    await go("components/page-header.html");
    const h1 = await page.evaluate(() => { const f = (e) => { const c = getComputedStyle(e); return [parseFloat(c.fontSize), parseFloat(c.lineHeight), +c.fontWeight, +(parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(3)].join("/"); };
      return { site: f(document.querySelector("main h1, h1")), head: [...new Set([...document.querySelectorAll(".example-preview .page-head .title")].map(f))] }; });
    ok("site h1 is Title 1 (2026-11-14) and the Page Header title is Title 2 (2026-11-13)", h1.site === "32/44/700/-0.025" && h1.head.length === 1 && h1.head[0] === "28/38/700/-0.024", JSON.stringify(h1));
  });
  await part("4 · 문서 제목 h2 · h3 · h4 = Heading 2 · Body 1/Normal · Label 1/Nor", async () => {

    /* 문서 제목 h2 · h3 · h4 = Heading 2 · Body 1/Normal · Label 1/Normal 의 크기 · 행간 · 자간(굵기는 그대로) — 사이트에 h4 가 없어 하나 넣어 잰다 */
    const f4 = (e) => { const c = getComputedStyle(e); return [parseFloat(c.fontSize), parseFloat(c.lineHeight), +(parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(4)].join("/"); };
    const doc = await page.evaluate((src) => { const f = new Function("return " + src)(); const main = document.querySelector("main") || document.body;
      const h4 = document.createElement("h4"); h4.textContent = "가"; main.append(h4);
      const pick = (t) => [...new Set([...main.querySelectorAll(t)].filter((e) => !e.closest(".example-preview") && e.getClientRects().length).map(f))];
      const r = { h2: pick("h2"), h3: pick("h3"), h4: pick("h4") }; h4.remove(); return r; }, f4.toString());
    ok("doc headings h2 · h3 · h4 are Heading 2 · Body 1/Normal · Label 1/Normal", JSON.stringify(doc) === JSON.stringify({ h2: ["20/28/-0.012"], h3: ["16/24/0.0057"], h4: ["14/20/0.0145"] }), JSON.stringify(doc));
  });
  await part("5 · index.html", async () => {

    /* 사이트 홈 제목 — 텍스트 스타일 표 밖의 선언된 예외(사람의 결정 2026-11-18, B4 메인 화면): 화면 폭을 따르는 clamp(2.5rem, 6vw, 6rem) · 행간 1.04 · 700 · 자간 -0.045em,
       767 이하는 clamp(2.25rem, 10.5vw, 3rem). 이 둘 말고 다른 값이 들어오면 실패한다 */
    await go("index.html");
    const hero = async () => page.evaluate(() => { const c = getComputedStyle(document.querySelector(".hm h1")), r = parseFloat(getComputedStyle(document.documentElement).fontSize), w = innerWidth;
      const want = w <= 767 ? Math.min(Math.max(2.25 * r, 0.105 * w), 3 * r) : Math.min(Math.max(2.5 * r, 0.06 * w), 6 * r), fs = parseFloat(c.fontSize);
      return { ok: Math.abs(fs - want) < 0.05 && Math.abs(parseFloat(c.lineHeight) / fs - 1.04) < 0.002 && c.fontWeight === "700" && Math.abs(parseFloat(c.letterSpacing) / fs + 0.045) < 0.0005, got: [fs, parseFloat(c.lineHeight), c.fontWeight, c.letterSpacing].join("/"), want: +want.toFixed(2) }; });
    const vp = page.viewportSize(), seen = [];
    for (const w of [2560, 1440, 1024, 768, 375]) { await page.setViewportSize({ width: w, height: 800 }); await page.waitForTimeout(80); seen.push([w, await hero()]); }
    await page.setViewportSize(vp);
    ok("home hero title follows its declared exception (fluid 2.5–6rem at 6vw, 1.04, 700, -0.045em; 2.25–3rem at 10.5vw from 767 down)", seen.every(([, h]) => h.ok), JSON.stringify(seen));
  });
  await part("6 · 컴포넌트 · 패턴 예제의 글자 — 표 밖의 (크기, 행간, 자간) 이 없다. 예외는 이유와 함께: - 고정폭", async () => {

    /* 컴포넌트 · 패턴 예제의 글자 — 표 밖의 (크기, 행간, 자간) 이 없다. 예외는 이유와 함께:
       - 고정폭 Code(12/20 — 2026-11-11 사람의 결정, 고정폭은 같은 크기에서 커 보인다) · 인라인 코드(둘레 글자의 0.9배)
       - Pagination 의 생략 기호(놓인 곳의 글자 크기를 따른다 — 2026-10-26 사람의 결정)
       - 숨긴 글자(.sr-only — 보이지 않는다)
       - 대문자 그룹 라벨(.menu-label · .sidenav .group)의 자간 .06em — 행간은 표를 따른다 */
    const PAIRS = TABLE.map(([, s, lh, ls]) => [s, lh, ls]);
    const off = [], weights = new Set();
    for (const sec of ["components", "patterns"]) for (const f of fs.readdirSync(path.join(SITE, sec))) {
      if (!f.endsWith(".html") || /^(index|overview)\.html$/.test(f)) continue;
      await go(`${sec}/${f}`); await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate((P) => {
        const out = [], ws = [];
        for (const pv of document.querySelectorAll(".example-preview")) for (const e of pv.querySelectorAll("*")) {
          if (!e.getClientRects().length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
          if (e.closest(".code-view, .code-inline, .sr-only") || e.matches(".pagination .gap")) continue;
          const c = getComputedStyle(e); if (c.visibility === "hidden") continue;
          const s = parseFloat(c.fontSize), lh = parseFloat(c.lineHeight), ls = parseFloat(c.letterSpacing) / s || 0;
          const lsOk = (want) => Math.abs(ls - want) < 0.0006 || (e.matches(".menu-label, .sidenav .group") && Math.abs(ls - 0.06) < 0.0006);
          ws.push(+c.fontWeight);
          if (!P.some(([ps, pl, pls]) => ps === s && Math.abs(pl - lh) < 0.01 && lsOk(pls))) out.push(`${(pv.closest(".example") || {}).id}:${e.tagName.toLowerCase()}${e.classList.length ? "." + [...e.classList].slice(0, 2).join(".") : ""}=${s}/${+lh.toFixed(2)}/${ls.toFixed(4)}`);
        }
        return { out, ws };
      }, PAIRS);
      off.push(...r.out); r.ws.forEach((w) => weights.add(w));
    }
    ok("every text in component and pattern examples uses a text style's size, line height and letter spacing", off.length === 0, `${off.length}: ${[...new Set(off)].slice(0, 12).join(" ")}`);
    ok("every text in examples uses one of the four weights", [...weights].every((w) => [400, 500, 600, 700].includes(w)), JSON.stringify([...weights]));
  });
};
