/* 전체 점검에서 찾은 결함(2026-11-15) — behave.js 가 부른다.
   이벤트에 값이 없던 것(Select Button · Tab), 사이트에만 없던 이벤트(입력값 칩 · 필터 칩 · Notice), data-debounce="0", 닫기 전환,
   Pagination outline 의 hover · 눌림 면, 고른 List 행의 hover 틴트 */
module.exports = async function review({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const tok = (v) => page.evaluate((v) => { const d = document.createElement("div"); d.style.backgroundColor = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; }, v);
  /* 문서에 듣는 쪽을 달아 두고, 받은 이벤트를 window.__ev 에 모은다 */
  const listen = (names) => page.evaluate((names) => { window.__ev = []; names.forEach((n) => document.addEventListener(n, (e) => window.__ev.push({ n, d: e.detail, t: e.target && e.target.className })), { once: false }); }, names);
  const got = () => page.evaluate(() => window.__ev);
  const part = require("./behave.part")(ok, "behave.review", () => page);

  await part("1 · Select Button · Tab 이벤트에 값", async () => {
    await go("components/select-button.html"); await listen(["ds:select"]);
    const btns = page.locator("#ex-select-button-basic .example-preview .select-btn > button:not([disabled])");
    await btns.nth(1).click(); await wait(50);
    await btns.nth(1).press("ArrowRight"); await wait(50);
    const ev = await got();
    ok("review: Select Button ds:select carries {value} on click and on arrow keys — the documented e.detail.value no longer throws",
      ev.length === 2 && ev.every((e) => e.d && typeof e.d.value === "string" && e.d.value.length > 0) && ev[0].d.value !== ev[1].d.value, JSON.stringify(ev));
    await go("components/tab.html"); await listen(["ds:tab"]);
    await page.locator("#ex-tab-default .example-preview .tab").nth(1).click(); await wait(50);
    const tv = await got();
    ok("review: Tab ds:tab carries {value, index}", tv.length === 1 && tv[0].d && tv[0].d.index === 1 && typeof tv[0].d.value === "string" && tv[0].d.value.length > 0, JSON.stringify(tv));
  });

  await part("2 · 입력값 칩 · 필터 칩 · Notice 이벤트", async () => {
    await go("components/chip.html"); await listen(["ds:chip-toggle", "ds:chip-remove"]);
    const f = page.locator("#ex-chip-filter .example-preview button.chip[aria-pressed]").first();
    const was = await f.getAttribute("aria-pressed");
    await f.click(); await wait(50);
    const x = page.locator("#ex-chip-input .example-preview .chip .x").first();
    const lbl = (await page.locator("#ex-chip-input .example-preview .chip .lbl").first().textContent()).trim();
    await x.click(); await wait(50);
    const ev = await got();
    const tg = ev.find((e) => e.n === "ds:chip-toggle"), rm = ev.find((e) => e.n === "ds:chip-remove");
    ok("review: filter chip fires ds:chip-toggle {selected, value}, input chip remove fires ds:chip-remove {value}",
      !!tg && tg.d.selected === (was !== "true") && typeof tg.d.value === "string" && !!rm && rm.d.value === lbl, JSON.stringify({ ev, was, lbl }));
    await go("components/notification.html"); await listen(["ds:notice-close"]);
    const n0 = await page.locator("#ex-notification-notice .example-preview .notice").count();
    await page.locator("#ex-notification-notice .example-preview .notice .close").first().click();
    await wait(30); const mid = await page.locator("#ex-notification-notice .example-preview .notice").count();
    await wait(250); const n1 = await page.locator("#ex-notification-notice .example-preview .notice").count();
    const nv = await got();
    ok("review: closing a Notice fires ds:notice-close and removes it after the --motion-fast fade", nv.length === 1 && n0 >= 1 && mid === n0 && n1 === n0 - 1, JSON.stringify({ nv, n0, mid, n1 }));
    await page.emulateMedia({ reducedMotion: "reduce" }); await go("components/notification.html");
    const r0 = await page.locator("#ex-notification-notice .example-preview .notice").count();
    await page.locator("#ex-notification-notice .example-preview .notice .close").first().click(); await wait(20);
    const r1 = await page.locator("#ex-notification-notice .example-preview .notice").count();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    ok("review: with reduced motion a closed Notice is removed at once", r1 === r0 - 1, JSON.stringify({ r0, r1 }));
  });

  await part("3 · data-debounce 0 은 기다리지 않음", async () => {
    await go("components/search.html"); await listen(["ds:search"]);
    const sb = page.locator(".example-preview .searchbar[data-debounce]").first();
    await sb.evaluate((e) => e.setAttribute("data-debounce", "0"));
    await sb.locator("input").pressSequentially("a"); await wait(20);
    const zero = (await got()).filter((e) => e.d && e.d.trigger === "input").length;
    await page.evaluate(() => { window.__ev = []; });
    await sb.evaluate((e) => e.setAttribute("data-debounce", ""));
    await sb.locator("input").pressSequentially("b"); await wait(100);
    const early = (await got()).length; await wait(350);
    const late = (await got()).filter((e) => e.d && e.d.trigger === "input").length;
    ok("review: data-debounce=\"0\" fires ds:search at once, an empty data-debounce still waits 300ms", zero === 1 && early === 0 && late === 1, JSON.stringify({ zero, early, late }));
  });

  await part("4 · Pagination 기본(outline) · ghost · 고른 List 행 hover", async () => {
    await go("components/pagination.html");
    const W = { sec: await tok("--surface-neutral-secondary"), strong: await tok("--surface-neutral-strong"), elev: await tok("--surface-elevated-primary"), sub: await tok("--surface-brand-subtle") };
    const nav = "#ex-pagination-basic .example-preview .pagination";   // 기본이 outline(2026-11-16)
    const plain = page.locator(`${nav} button:not(.on):not([disabled]):not([aria-label])`).first();
    const bg = (l) => l.evaluate((e) => getComputedStyle(e).backgroundColor);
    /* locator.hover · scrollIntoViewIfNeeded 는 비활성 버튼에서 기다린다 — 요소에서 바로(부드러운 스크롤 없이) 옮기고 포인터를 놓는다 */
    const over = async (l) => { await l.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" })); await wait(100); const r = await l.evaluate((e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }); await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); };
    /* 누르면 그 칸이 고른 칸이 되고 '이전' 이 켜진다 — 고른 칸 · 비활성 칸을 먼저 잰다 */
    const on = page.locator(`${nav} button.on`); await over(on); await wait(200); const onHov = await bg(on);
    const dis = page.locator(`${nav} button[disabled]`).first(); await over(dis); await wait(200); const disHov = await bg(dis);
    const rest = await bg(plain);
    await over(plain); await wait(200); const hov = await bg(plain);
    await page.mouse.down(); await wait(200); const act = await bg(plain); await page.mouse.up();
    ok("review: outline pagination shows the hover and pressed faces; the current page and a disabled arrow keep the white face on hover",
      rest === W.elev && hov === W.sec && act === W.strong && onHov === W.elev && disHov === W.elev, JSON.stringify({ rest, hov, act, onHov, disHov, W }));
    await page.mouse.move(2, 2); await wait(200);
    /* 기본 = 회색 선 + 흰 면 · 고른 칸 brand 선 + brand 글자, .ghost = 선 · 면 없음 · 고른 칸 제품 색 면 + brand-label(옛 기본) */
    const T = { line: await tok("--line-neutral-secondary", "borderTopColor"), brand: await tok("--surface-brand-primary"), brandBd: await tok("--surface-brand-primary", "borderTopColor"), brandFg: await tok("--foreground-brand-primary", "color"), label: await tok("--brand-label", "color") };
    const pg = await page.evaluate(() => { const cs = (e) => { const c = getComputedStyle(e); return { bd: c.borderTopColor, bg: c.backgroundColor, fg: c.color }; };
      const d = document.querySelector("#ex-pagination-basic .example-preview .pagination"), g = document.querySelector("#ex-pagination-variant .example-preview .pagination.ghost");
      return { dRest: cs(d.querySelector("button:not(.on):not([disabled])")), dOn: cs(d.querySelector("button.on")), gRest: cs(g.querySelector("button:not(.on):not([disabled])")), gOn: cs(g.querySelector("button.on")),
        outlineClass: document.querySelectorAll(".example-preview .pagination.outline").length }; });
    ok("pagination: the default is outline (grey line, white face; current = brand line + brand text) and .ghost keeps the old faceless look (current = product face) (2026-11-16)",
      pg.dRest.bd === T.line && pg.dRest.bg === W.elev && pg.dOn.bd === T.brandBd && pg.dOn.fg === T.brandFg && pg.dOn.bg === W.elev &&
      pg.gRest.bd === "rgba(0, 0, 0, 0)" && pg.gRest.bg === "rgba(0, 0, 0, 0)" && pg.gOn.bg === T.brand && pg.gOn.fg === T.label && pg.outlineClass === 0, JSON.stringify({ pg, T, W }));
    await go("components/list.html");
    const li = page.locator("#ex-list-select .example-preview .list.hover li.on").first();
    const r = await bg(li); await over(li); await wait(200); const h = await bg(li);
    ok("review: a selected List row keeps its brand tint on hover", r === W.sub && h === W.sub, JSON.stringify({ r, h, W }));
    await page.mouse.move(2, 2);
  });
};
