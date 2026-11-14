/* 제품 색 팔레트(사람의 결정 2026-11-14) — 파랑(기본) · 빨강 · 시안 · 주황 · 중립 · AI 를 헤더 메뉴로 고른다. behave.js 가 부른다.
   - 삭제 버튼(.negative)은 모든 제품에서 중립 — 빨강 제품의 주 버튼과 헷갈리지 않게. 빨강은 위험 확인 팝업 제목 · 메뉴 위험 항목 글자에만 남는다
   - AI 만 넓은 브랜드 면(주 버튼 · Banner)이 그라데이션이고, 비활성 주 버튼에는 그라데이션이 없다. 다른 제품은 background-image 가 none
   - 입력 포커스 · 열린 필드 링은 빨강 · 주황 제품에서만 중립(오류 링 · 경고색과 헷갈리지 않게), 그 밖은 제품 색. 오류 필드는 늘 빨강
   - 고른 색은 새로 읽어도 남는다 */
module.exports = async function product({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const PAL = require("./data.js").PRODUCTS;
  const KEY = (p) => (p.kind === "base" ? "" : p.key);
  const pick = async (key) => {
    await page.click("#accentBtn"); await wait(80);
    await page.locator(`#accentPop [data-accent="${key}"]`).click(); await wait(200);
  };
  const tok = (v, p = "color") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return `rgb(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255})`; };
  const part = require("./behave.part")(ok, "behave.product", () => page);
  let RED;

  await part("1 · 삭제 버튼은 중립 · 빨강은 위험 글자에만", async () => {
    await go("components/button.html"); await page.mouse.move(2, 2);
    await pick("red");
    RED = rgb(PAL.find((p) => p.key === "red").hex);
    const W = { tert: await tok("--surface-neutral-tertiary", "backgroundColor"), fg: await tok("--foreground-neutral-primary"), line: await tok("--line-neutral-primary", "borderTopColor"),
      sec: await tok("--foreground-neutral-secondary"), brand: await tok("--surface-brand-primary", "backgroundColor") };
    const neg = await page.evaluate(() => {
      const one = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { bg: c.backgroundColor, fg: c.color, bd: c.borderTopColor }; };
      const spin = document.querySelector(".btn.solid.negative.loading");
      return { solid: one(".btn.solid.negative:not([disabled]):not(.loading)"), outline: one(".btn.outline.negative:not([disabled])"), icon: one(".btn.negative.icon-only:not(.solid):not(.outline)"),
        spinner: spin ? getComputedStyle(spin, "::after").color : null,
        assistSolid: one(".btn.solid.assistive:not([disabled]):not(.loading)") };
    });
    ok("red product: delete buttons are neutral — solid = tertiary face, outline = gray line, icon-only = secondary glyph, spinner = neutral text",
      neg.solid && neg.solid.bg === W.tert && neg.solid.fg === W.fg && neg.outline && neg.outline.bd === W.line && neg.outline.fg === W.fg && neg.icon && neg.icon.fg === W.sec && neg.spinner === W.fg,
      JSON.stringify({ neg, W }));
    ok("red product: no delete button carries the product red", W.brand === RED && ![neg.solid, neg.outline, neg.icon].some((x) => x && [x.bg, x.fg, x.bd].includes(RED)), JSON.stringify({ neg, RED }));
    ok("delete solid = assistive solid", neg.assistSolid && neg.solid.bg === neg.assistSolid.bg && neg.solid.fg === neg.assistSolid.fg, JSON.stringify(neg));
    const danger = await tok("--foreground-negative-strong");
    await go("components/popup.html"); await wait(100);
    const title = await page.evaluate(() => { const e = document.querySelector("#ex-popup-danger .popup.danger .popup-title"); return e ? getComputedStyle(e).color : null; });
    await go("components/dropdown.html"); await wait(100);
    const item = await page.evaluate(() => { const e = document.querySelector(".menu-item.danger"); return e ? getComputedStyle(e).color : null; });
    ok("red stays on the danger popup title and the danger menu item", title === danger && item === danger, JSON.stringify({ title, item, danger }));
  });

  await part("2 · AI 그라데이션은 주 버튼 · Banner 에만", async () => {
    const look = () => page.evaluate(() => {
      const bi = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).backgroundImage : null; };
      return { primary: bi("#ex-button-variant .btn.solid.primary"), off: bi(".btn.solid.primary[disabled]"), outline: bi("#ex-button-variant .btn.outline.primary") };
    });
    await go("components/button.html"); await page.mouse.move(2, 2);
    const res = {};
    for (const p of PAL) { await pick(KEY(p)); res[p.key] = await look(); }
    const stops = PAL.find((p) => p.kind === "ai").gradient.rest;
    const s1 = await tok("--" + stops[0]), s2 = await tok("--" + stops[1]);
    ok("AI primary button is a gradient between its two stops", /linear-gradient/.test(res.ai.primary || "") && res.ai.primary.includes(s1) && res.ai.primary.includes(s2), JSON.stringify({ ai: res.ai.primary, s1, s2 }));
    ok("disabled AI primary has no gradient, outline AI has none", res.ai.off === "none" && res.ai.outline === "none", JSON.stringify(res.ai));
    ok("non-AI products paint the primary button solid (background-image none)", PAL.filter((p) => p.kind !== "ai").every((p) => res[p.key].primary === "none"),
      PAL.map((p) => `${p.key} ${res[p.key].primary}`).join(" · "));
    await go("components/notification.html"); await wait(100);
    const banner = await page.evaluate(() => { const e = document.querySelector("#ex-notification-banner .banner"); return e ? getComputedStyle(e).backgroundImage : null; });
    await pick("cyan");
    const bannerCyan = await page.evaluate(() => { const e = document.querySelector("#ex-notification-banner .banner"); return e ? getComputedStyle(e).backgroundImage : null; });
    ok("AI Banner is a gradient, cyan Banner is solid", /linear-gradient/.test(banner || "") && bannerCyan === "none", JSON.stringify({ banner, bannerCyan }));
  });

  await part("3 · 입력 포커스 링 — 빨강 · 주황만 중립", async () => {
    await go("components/text-field.html"); await page.mouse.move(2, 2);
    const ring = async () => {
      await page.locator("#ex-text-field-basic .field:not(.error) input").first().focus(); await wait(250);
      return page.evaluate(() => { const e = document.activeElement, c = getComputedStyle(e); return { bd: c.borderTopColor, sh: c.boxShadow }; });
    };
    const errRing = async () => {
      await page.locator("#ex-text-field-basic .field.error input").first().focus(); await wait(250);
      return page.evaluate(() => getComputedStyle(document.activeElement).borderTopColor);
    };
    const out = {};
    for (const p of PAL) {
      await pick(KEY(p));
      out[p.key] = { ...(await ring()), err: await errRing(), nfg: await tok("--foreground-neutral-primary"), bfg: await tok("--foreground-brand-primary"), neg: await tok("--foreground-negative-primary") };
    }
    const bad = PAL.filter((p) => { const o = out[p.key], want = p.neutralFocus ? o.nfg : o.bfg; return o.bd !== want || !/4px/.test(o.sh); });
    ok("field focus ring is neutral only for red and orange, the product color otherwise", bad.length === 0 && PAL.filter((p) => p.neutralFocus).map((p) => p.key).join() === "red,orange",
      JSON.stringify(PAL.map((p) => [p.key, out[p.key].bd, p.neutralFocus ? "neutral" : "brand"])));
    ok("an error field keeps the red ring in every product", PAL.every((p) => out[p.key].err === out[p.key].neg), JSON.stringify(PAL.map((p) => out[p.key].err)));
    await go("components/select.html"); await wait(150);
    const sel = {};
    for (const key of ["red", "cyan"]) {
      await pick(key);
      sel[key] = await page.evaluate(() => { const e = document.querySelector("#ex-select-open .dropdown.open .trigger"); return e ? getComputedStyle(e).borderTopColor : null; });
      sel[key + "Want"] = await tok(key === "red" ? "--foreground-neutral-primary" : "--foreground-brand-primary");
    }
    ok("an open Select ring follows the same rule (red neutral, cyan brand)", sel.red && sel.red === sel.redWant && sel.cyan === sel.cyanWant, JSON.stringify(sel));
  });

  await part("4 · 팝오버 · 새로 읽어도 유지 · 옛 속성 없음", async () => {
    await go("components/button.html");
    await pick("orange");
    await page.reload(); await wait(250);
    const after = await page.evaluate(() => ({ key: document.documentElement.dataset.accent || "", legacy: document.documentElement.hasAttribute("data-accent-neutral"),
      surface: getComputedStyle(document.documentElement).getPropertyValue("--surface-brand-primary").trim() }));
    ok("the chosen product color survives a reload", after.key === "orange" && after.surface.toUpperCase() === PAL.find((p) => p.key === "orange").hex && !after.legacy, JSON.stringify(after));
    await page.click("#accentBtn"); await wait(80);
    const checked = await page.evaluate(() => [...document.querySelectorAll('#accentPop [role="menuitemradio"],#accentPop [data-accent]')].filter((b) => b.getAttribute("aria-checked") === "true").map((b) => b.dataset.accent));
    await page.keyboard.press("Escape"); await wait(80);
    ok("after reload the menu checks the stored color", checked.length === 1 && checked[0] === "orange", JSON.stringify(checked));
    await pick("");
    const back = await page.evaluate(() => ({ has: document.documentElement.hasAttribute("data-accent"), prod: getComputedStyle(document.documentElement).getPropertyValue("--prod-50").trim() }));
    ok("blue clears the attribute and the injected --prod-*", !back.has && back.prod === "", JSON.stringify(back));
  });
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
};
