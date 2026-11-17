/* Form · Empty State · Page Header · Avatar · Link 동작 검사(2026-11-10). behave.js 가 부른다 */
const fs = require("fs"), path = require("path");
module.exports = async function promote({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const token = (name) => page.evaluate((n) => { const d = document.createElement("div"); d.style.color = `var(${n})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, name);
  const rest = () => page.mouse.move(4, 500);

  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.promote", () => page);
  let look, fr, b, l;
  await part("1 · components/link.html", async () => {
    /* ── Link ── */
    await go("components/link.html");
    const brand = await token("--foreground-brand-primary");
    const inl = page.locator("#ex-link-inline a.link");
    look = (l) => l.evaluate((a) => { const c = getComputedStyle(a); return { line: c.textDecorationLine, offset: c.textUnderlineOffset, thick: c.textDecorationThickness, color: c.color, weight: c.fontWeight }; });
    const i0 = await look(inl);
    ok("a link in a sentence is underlined in the brand colour", i0.line === "underline" && i0.color === brand && i0.offset === "2px", JSON.stringify(i0));
    await inl.scrollIntoViewIfNeeded(); await inl.hover(); await wait(40);
    const i1 = await look(inl); await rest();
    ok("hovering a sentence link thickens the underline", i1.line === "underline" && i1.thick === "2px", JSON.stringify(i1));
    const sa = page.locator("#ex-link-standalone a.link").first();
    const s0 = await look(sa);
    ok("a standalone link has no underline at rest and weight 500", s0.line === "none" && s0.weight === "500" && s0.color === brand, JSON.stringify(s0));
    await sa.scrollIntoViewIfNeeded(); await sa.hover(); await wait(40);
    const s1 = await look(sa); await rest();
    ok("a standalone link is underlined on hover at normal thickness", s1.line === "underline" && s1.thick !== "2px", JSON.stringify(s1));
    await inl.focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(30);
    ok("a link shows the focus ring from the keyboard", await inl.evaluate((a) => document.activeElement === a && getComputedStyle(a).outlineWidth === "1px" && getComputedStyle(a).outlineStyle === "solid"));
    const ext = await page.locator("#ex-link-external a.link").evaluate((a) => { const v = a.querySelector("svg").getBoundingClientRect(), s = a.querySelector(".sr-only").getBoundingClientRect(), c = getComputedStyle(a.querySelector("svg")); return { w: v.width, h: v.height, ml: c.marginLeft, sr: s.width, t: a.target, r: a.rel }; });
    ok("a new-window link has a 14 icon, hidden text and rel", ext.w === 14 && ext.h === 14 && ext.ml === "2px" && ext.sr <= 1 && ext.t === "_blank" && /noopener/.test(ext.r), JSON.stringify(ext));
  });
  await part("2 · components/data-table.html", async () => {
    await go("components/data-table.html");
    const tl = await look(page.locator("#ex-data-table-basic .tbl a.link").first());
    ok("a table link keeps the standalone look", tl.line === "none" && tl.weight === "500", JSON.stringify(tl));
  });
  await part("3 · components/avatar.html", async () => {

    /* ── Avatar ── */
    await go("components/avatar.html");
    const av = await page.evaluate(() => [...document.querySelectorAll("#ex-avatar-sizes .avatar")].map((a) => { const r = a.getBoundingClientRect(), c = getComputedStyle(a); return [r.width, r.height, c.fontSize, c.borderTopLeftRadius]; }));
    ok("avatar is 32 with 12 text and sm 24 with 11 text, both round", JSON.stringify(av) === JSON.stringify([[32, 32, "12px", "50%"], [24, 24, "11px", "50%"]]), JSON.stringify(av));
  });
  await part("4 · Empty State", async () => {

    /* ── Empty State ── */
    ok("the empty-state pattern page is gone", !fs.existsSync(path.join(__dirname, "..", "patterns/empty-state.html")));
  });
  await part("5 · components/empty-state.html", async () => {
    await go("components/empty-state.html");
    const cp = await page.locator("#ex-empty-state-compact .empty").evaluate((e) => { const b = e.querySelector("b"), s = e.querySelector(":scope > div > span"), btn = e.querySelector(".btn"), er = e.getBoundingClientRect(), br = btn.getBoundingClientRect(), sr = s.getBoundingClientRect(), tr = b.getBoundingClientRect(); return { fs: getComputedStyle(b).fontSize, below: sr.top >= tr.bottom - 1, gapR: Math.round(er.right - br.right), dir: getComputedStyle(e).flexDirection, inl: [b, s, btn].some((x) => x.getAttribute("style")) }; });
    ok("compact empty: 14 title, description below it, button at the right padding, no inline styles", cp.fs === "14px" && cp.below && cp.gapR === 25 && cp.dir === "row" && !cp.inl, JSON.stringify(cp));
    fr = await page.locator("#ex-empty-state-nores .empty").evaluate((e) => ({ fs: getComputedStyle(e.querySelector("b")).fontSize, m: getComputedStyle(e.querySelector(".btn")).marginTop, dir: getComputedStyle(e).flexDirection }));
    ok("regular empty keeps a 16 title, 10 above the button and a column", fr.fs === "16px" && fr.m === "10px" && fr.dir === "column", JSON.stringify(fr));
  });
  await part("6 · components/page-header.html", async () => {

    /* ── Page Header ── */
    await go("components/page-header.html");
    const headOf = (id) => page.locator(`#ex-page-header-${id} .page-head`).evaluate((h) => { const r = h.getBoundingClientRect(), t = h.querySelector(".title"), tr = t.getBoundingClientRect(), a = h.querySelector(".actions"), ar = a.getBoundingClientRect(), n = h.querySelector("nav"), nr = n && n.getBoundingClientRect(), c = getComputedStyle(t); return { tag: t.tagName, keep: c.wordBreak, fs: c.fontSize, fw: c.fontWeight, aRight: Math.round(r.right - ar.right), aTop: Math.round(ar.top - tr.top), titleH: Math.round(tr.height), titleRight: tr.right, aLeft: ar.left, navW: nr && Math.round(r.width - nr.width), navGap: nr && Math.round((tr.top - nr.bottom) * 10) / 10, first: h.firstElementChild.tagName }; });
    const d = await headOf("default");
    ok("page title is h1 at 28/700 (Title 2 — 2026-11-13) with actions at the top right", d.tag === "H1" && d.fs === "28px" && d.fw === "700" && d.aRight === 0 && d.aTop === 0, JSON.stringify(d));
    b = await headOf("breadcrumb");
    ok("breadcrumb takes the whole first row, 16 above the title (2026-11-12 — 8 이었다)", b.first === "NAV" && b.navW === 0 && b.navGap === 16, JSON.stringify(b));
    l = await headOf("long");
    ok("a long title wraps at spaces in its cell and the action stays top right", l.keep === "keep-all" && l.titleH > 40 && l.aRight === 0 && l.aTop === 0 && l.titleRight <= l.aLeft, JSON.stringify(l));
  });
  await part("7 · patterns/policy-settings.html", async () => {
    await go("patterns/policy-settings.html");
    ok("the settings pattern puts its breadcrumb inside the page header", await page.locator("#ex-policy-settings-sections .page-head > nav .breadcrumb").count() === 1);
  });
  await part("8 · components/form.html", async () => {

    /* ── Form ── */
    await go("components/form.html");
    const sum = await page.locator("#ex-form-error form").evaluate((f) => ({ first: f.firstElementChild.className, errs: f.querySelectorAll(".field.error").length, box: f.querySelectorAll(".notice, [data-form-summary], .form-summary").length }));
    ok("server errors sit under their fields — no summary box above the form (2026-11-16)", sum.first === "field error" && sum.errs === 3 && sum.box === 0, JSON.stringify(sum));
    const rowInfo = await page.locator("#ex-form-default .form-row").evaluate((r) => { const [a, c] = [...r.children].map((x) => x.getBoundingClientRect()); return { same: Math.abs(a.width - c.width) < 0.5, gap: Math.round(c.left - a.right), top: a.top === c.top }; });
    ok("form-row is two equal columns 16 apart", rowInfo.same && rowInfo.gap === 16 && rowInfo.top, JSON.stringify(rowInfo));
    const acts = await page.locator("#ex-form-actions form").evaluate((f) => { const fr = f.getBoundingClientRect(), p = parseFloat(getComputedStyle(f).paddingLeft), b = [...f.querySelectorAll(".form-actions .btn")].map((x) => x.getBoundingClientRect()), a = f.querySelector(".form-actions"); return { l: Math.round(b[0].left - fr.left - p - 1), r: Math.round(fr.right - b[2].right - p - 1), gap: Math.round(b[2].left - b[1].right), last: f.lastElementChild === a, solid: f.querySelectorAll(".form-actions .solid.primary").length }; });
    ok("delete sits at the left, primary at the far right, buttons 12 apart, actions last", acts.l === 0 && acts.r === 0 && acts.gap === 12 && acts.last && acts.solid === 1, JSON.stringify(acts));
  });
  await part("9 · patterns/input-form.html", async () => {
    await go("patterns/input-form.html");
    const vf = page.locator("#ex-input-form-validate form");
    await vf.locator('button[type="submit"]').evaluate((b) => b.click()); await wait(60);
    const auto = await vf.evaluate((f) => ({ first: f.firstElementChild.className, errs: f.querySelectorAll(".field.error").length, box: f.querySelectorAll(":scope > .notice, [data-form-summary], .form-summary").length }));
    ok("submitting the empty form adds no summary — field errors only (2026-11-16)", auto.first === "form-legend" && auto.errs >= 3 && auto.box === 0, JSON.stringify(auto));
  });
};
