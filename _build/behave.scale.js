/* 글자 크기 체계 — 화면 폭 단계의 단정(2026-11-11) — behave.js 가 부른다.
   사람의 결정: 토큰 + rem + 화면 폭 단계, 줄일 때 최소 글자 크기. 단계 표(style.src.css 의 ds:scale 블록):
   ~1279 93.75% · 1280~1919 100%(기준 — Figma) · 1920~ 106.25% · 2560~ 112.5% */
module.exports = async ({ b, ok, SITE, path }) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const go = async (f) => { await page.goto("file://" + path.join(SITE, f)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250); };
  const STEPS = { 1100: 15, 1440: 16, 1920: 17, 2560: 18 };

  /* 표의 숫자 — 루트 · 본문(Label 1 · 14) · 버튼 md · 버튼 아이콘 · 12 이하 글자(최소 크기) · 그 행간 */
  await step("scale: each width step sets the root and everything follows it, 12px and smaller text keeps its minimum", async () => {
    const got = {}, want = {};
    for (const [w, root] of Object.entries(STEPS)) {
      await page.setViewportSize({ width: +w, height: 900 }); await go("components/button.html");
      got[w] = await page.evaluate(() => {
        const mk = (cls) => { const e = document.createElement("span"); e.className = cls; e.textContent = "가"; document.body.appendChild(e); return getComputedStyle(e); };
        const btn = document.querySelector(".example-preview .btn.md"), ico = document.querySelector(".example-preview .btn.md svg");
        return [parseFloat(getComputedStyle(document.documentElement).fontSize), parseFloat(mk("t-label-1-reading").fontSize), btn.getBoundingClientRect().height, ico.getBoundingClientRect().width,
          parseFloat(mk("t-caption-1").fontSize), parseFloat(mk("t-caption-1").lineHeight), parseFloat(mk("t-caption-2").fontSize)];
      });
      const k = root / 16;
      want[w] = [root, 14 * k, 40 * k, 18 * k, Math.max(12, 12 * k), Math.max(16, 16 * k), Math.max(11, 11 * k)];
    }
    ok("scale: each width step sets the root and everything follows it, 12px and smaller text keeps its minimum", JSON.stringify(got) === JSON.stringify(want), JSON.stringify({ got, want }));
  });

  /* 아이콘은 HTML 속성(width="16")으로 크기를 받는다 — :where 규칙이 rem 으로 다시 준다. 컴포넌트가 정한 크기는 그대로 이긴다(명시도 0) */
  await step("scale: attribute-sized icons follow the step, component icon sizes still win", async () => {
    const r = {};
    for (const w of [1100, 2560]) {
      await page.setViewportSize({ width: w, height: 900 }); await go("components/button.html");
      r[w] = await page.evaluate(() => {
        const svg = (n) => { const d = document.createElement("div"); d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${n}" height="${n}"></svg>`; document.body.appendChild(d); return d.firstChild.getBoundingClientRect().width; };
        const own = document.createElement("style"); own.textContent = ".ds-own-icon svg{width:30px;height:30px}"; document.head.prepend(own);   // 사이트 CSS 보다 앞 — 명시도 0 이 아니면 뒤에 오는 사이트 규칙이 이겨 잡힌다
        const host = document.createElement("div"); host.className = "ds-own-icon"; host.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"></svg>'; document.body.appendChild(host);
        return { i16: svg(16), i24: svg(24), i12: svg(12), i10: svg(10), own: host.firstChild.getBoundingClientRect().width };
      });
    }
    ok("scale: attribute-sized icons follow the step, component icon sizes still win",
      r[1100].i16 === 15 && r[1100].i24 === 22.5 && r[1100].i12 === 12 && r[1100].i10 === 10 && r[2560].i16 === 18 && r[2560].i24 === 27 && r[2560].i12 === 13.5 && r[1100].own === 30 && r[2560].own === 30, JSON.stringify(r));
  });

  /* 탐색형 차트 — 캔버스는 CSS 를 모르므로 ds-chart 가 루트 비율을 곱한다. 글자 12 는 최소 12. 창 크기가 바뀌어 단계가 넘어가면 다시 칠한다 */
  await step("scale: explorable charts scale fonts and padding with the step and repaint when the step changes", async () => {
    const read = () => page.evaluate(() => { const c = document.querySelector("canvas[data-chart]").__dsChart.chart, o = c.options; return [o.scales.x.ticks.font.size, o.plugins.legend.labels.padding, o.plugins.tooltip.padding, o.plugins.legend.labels.boxHeight]; });
    await page.setViewportSize({ width: 1100, height: 900 }); await go("components/data-visual.html");
    const small = await read();
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(300);
    const base = await read();
    await page.setViewportSize({ width: 2560, height: 900 }); await page.waitForTimeout(300);
    const big = await read();
    ok("scale: explorable charts scale fonts and padding with the step and repaint when the step changes",
      JSON.stringify(small) === JSON.stringify([12, 15, 9.375, 6.5625]) && JSON.stringify(base) === JSON.stringify([12, 16, 10, 7]) && JSON.stringify(big) === JSON.stringify([13.5, 18, 11.25, 7.875]), JSON.stringify({ small, base, big }));
  });

  /* 컴포넌트 예제가 미리보기 밖으로 넘치지 않는다 — 패턴은 behave.system 이 다섯 폭에서 잰다. 여기는 컴포넌트 페이지를 양 끝 단계에서 */
  await step("scale: no component example spills out of its preview at 1100 and 2560", async () => {
    const fs = require("fs");
    const pages = fs.readdirSync(path.join(SITE, "components")).filter((f) => f.endsWith(".html") && f !== "index.html");
    const bad = [];
    for (const w of [1100, 2560]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const f of pages) {
        await page.goto("file://" + path.join(SITE, "components", f)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(120);
        const r = await page.evaluate(() => { const out = [];
          document.querySelectorAll(".example-preview").forEach((pv) => { const pr = pv.getBoundingClientRect(); if (!pr.width) return; const id = (pv.closest("[id]") || {}).id;
            if (pv.scrollWidth > pv.clientWidth + 1) out.push(id + " 가로 스크롤");
            pv.querySelectorAll("*").forEach((e) => { if (e.closest(".float,[role=tooltip],.menu,.popup-backdrop,.side-panel,.toast-stack")) return; if (getComputedStyle(e).position === "fixed") return; const er = e.getBoundingClientRect(); if (!er.width || !er.height) return;
              for (let s = e.parentElement; s && s !== pv; s = s.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(s).overflowX)) return;
              if (er.right > pr.right + 1 || er.left < pr.left - 1) out.push(id + " " + e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : "")); }); });
          return [...new Set(out)].slice(0, 3); });
        if (r.length) bad.push(`${w} ${f}: ${r.join(" | ")}`);
      }
    }
    ok("scale: no component example spills out of its preview at 1100 and 2560", bad.length === 0, bad.slice(0, 4).join(" || "));
  });

  /* 대시보드 KPI 넷은 1024 ~ 2560 에서 한 줄(사람의 결정 2026-11-11 — 격자 안 KPI 좌우 20 · 칸 최소 176). 1280 이상 문서 본문 758 에서 3 + 1 로 줄바꿈하던 것.
     가장 긴 줄(값 · 단위 · 증감)이 카드 안쪽 폭 안에 들어가는지도 잰다 — 칸만 좁히고 패딩을 그대로 두면 값이 카드 밖으로 나간다 */
  await step("scale: dashboard keeps its four KPIs in one row from 1024 to 2560 and every value fits its card", async () => {
    const r = {};
    for (const w of [1024, 1280, 1440, 1920, 2560]) {
      await page.setViewportSize({ width: w, height: 900 }); await go("patterns/dashboard.html");
      r[w] = await page.evaluate(() => { const ks = [...document.querySelectorAll("#ex-dashboard-full .kpi-grid > .kpi")];
        return { n: ks.length, rows: new Set(ks.map((k) => Math.round(k.getBoundingClientRect().top))).size,
          spare: Math.min(...ks.map((k) => { const cs = getComputedStyle(k), inner = k.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            return Math.min(...[...k.children].filter((c) => !c.matches(".chart-canvas")).map((c) => { const g = document.createRange(); g.selectNodeContents(c); return Math.floor(inner - g.getBoundingClientRect().width); })); })) }; });   // 스파크 캔버스는 폭을 채우는 그래픽(2026-11-15) — 글자만 잰다
    }
    ok("scale: dashboard keeps its four KPIs in one row from 1024 to 2560 and every value fits its card", Object.values(r).every((x) => x.n === 4 && x.rows === 1 && x.spare >= 0), JSON.stringify(r));
  });

  ok("scale: no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
};
