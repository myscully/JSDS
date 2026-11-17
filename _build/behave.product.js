/* 제품 색 팔레트(사람의 결정 2026-11-14 · 11-17 이름 기본 · 제품1 · 제품2 · 제품3 · 브랜드 · 중립 · AI, 제품3 남색 추가) — 헤더 메뉴로 고른다. behave.js 가 부른다.
   - Negative(.negative)는 빨강, 위험 확인 팝업의 확정 버튼에만 — 화면의 삭제는 Assistive(2026-11-16 — 11-14 의 '중립' 을 되돌림)
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

  await part("1 · Negative 는 빨강 · 화면의 삭제는 Assistive", async () => {
    /* 사람의 결정 2026-11-16 — 11-14 의 '삭제 버튼 중립' 을 되돌림. Negative 는 위험 확인 팝업의 확정 버튼에만, 화면의 삭제는 Assistive */
    await go("components/button.html"); await page.mouse.move(2, 2);
    await pick("red");
    RED = rgb(PAL.find((p) => p.key === "red").hex);
    const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
    const res = {};
    for (const t of [null, "dark"]) {
      await theme(t); await wait(300);
      const W = { face: await tok("--surface-negative-primary", "backgroundColor"), fg: await tok("--foreground-negative-strong"), line: await tok("--line-negative-primary", "borderTopColor") };
      const neg = await page.evaluate(() => {
        const one = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { bg: c.backgroundColor, fg: c.color, bd: c.borderTopColor }; };
        const ic = document.createElement("button"); ic.className = "btn md negative icon-only"; ic.setAttribute("aria-label", "x"); document.querySelector("#ex-button-variant .example-preview").append(ic);
        const icon = getComputedStyle(ic).color; ic.remove();
        const spin = document.querySelector(".btn.solid.negative.loading");
        return { solid: one("#ex-button-variant .btn.solid.negative"), outline: one("#ex-button-variant .btn.outline.negative"), icon, spinner: spin ? getComputedStyle(spin, "::after").color : null };
      });
      res[t || "light"] = { neg, W };
    }
    await theme(null);
    const red = (r) => r.neg.solid && r.neg.solid.bg === r.W.face && r.neg.solid.fg === r.W.fg && r.neg.outline && r.neg.outline.bd === r.W.line && r.neg.outline.fg === r.W.fg && r.neg.icon === r.W.fg && r.neg.spinner === r.W.fg;
    ok("red product, light: Negative is red — solid = negative tint + negative-strong text, outline = negative line, icon-only glyph and spinner = negative-strong", red(res.light), JSON.stringify(res.light));
    ok("red product, dark: Negative is red the same way", red(res.dark), JSON.stringify(res.dark));
    await go("components/form.html"); await wait(100);
    const del = await page.evaluate(() => { const b = [...document.querySelectorAll("#ex-form-actions .btn")].find((x) => x.textContent.trim() === "삭제"); return b ? b.className : null; });
    await go("components/popup.html"); await wait(100);
    const conf = await page.evaluate(() => { const d = document.querySelector("#ex-popup-danger .popup.danger"); const b = d && d.querySelector(".popup-actions .btn.solid"); return d ? { role: d.getAttribute("role"), cls: b && b.className } : null; });
    ok("a delete button on the screen is Assistive; the confirm button inside the alertdialog is Negative",
      del && /\bassistive\b/.test(del) && !/\bnegative\b/.test(del) && conf && conf.role === "alertdialog" && /\bnegative\b/.test(conf.cls), JSON.stringify({ del, conf }));
    const danger = await tok("--foreground-negative-strong");
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
  await part("5 · 제품3 남색 — 다크 주 면만 밝힘(2026-11-17)", async () => {
    /* 다크 주 면은 제품 HEX 그대로인데 남색 #10367D 은 다크 카드 면 위 1.40 이었다 — 다크만 1.5 를 넘는 50d(#113B88)로, 라이트는 그대로.
       다른 제품은 50d 가 없어 다크 주 면 = 제품 HEX. 다른 제품으로 바꾸면 --prod-50d 를 지운다 */
    await go("components/button.html");
    const th = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
    const look = () => page.evaluate(() => { const b = document.querySelector("#ex-button-variant .btn.solid.primary"); const r = getComputedStyle(document.documentElement);
      return { btn: getComputedStyle(b).backgroundColor, d: r.getPropertyValue("--prod-50d").trim(), card: r.getPropertyValue("--surface-elevated-primary").trim() }; });
    await pick("navy");
    await th(null); await wait(200); const light = await look();
    await th("dark"); await wait(200); const dark = await look();
    const lum = (c) => { const v = c.match(/\d+/g).slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const hexLum = (h) => lum(rgb(h));
    const sep = (lum(dark.btn) + 0.05) / (hexLum(dark.card) + 0.05);
    ok("product 3 (navy): light primary = #10367D, dark primary = #113B88 and clears the dark card by 1.5",
      light.btn === rgb("#10367D") && dark.btn === rgb("#113B88") && dark.d.toUpperCase() === "#113B88" && +sep.toFixed(2) >= 1.5, JSON.stringify({ light, dark, sep: sep.toFixed(2) }));
    await pick("cyan"); await wait(150); const cy = await look();
    ok("other products have no dark surface step — cyan dark primary = its hex, --prod-50d cleared", cy.d === "" && cy.btn === rgb("#00828B"), JSON.stringify(cy));
    await th(null); await pick("");
  });
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
};
