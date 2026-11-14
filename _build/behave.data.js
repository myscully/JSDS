/* 데이터 묶음 동작 검사(2026-11-10) — Data Table · Pagination · List. behave.js 가 부른다 */
module.exports = async function dataBundle({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const listen = (name) => page.evaluate((n) => { window.__ev = window.__ev || {}; window.__ev[n] = []; document.addEventListener(n, (e) => window.__ev[n].push(e.detail ?? null)); }, name);
  const seen = (name) => page.evaluate((n) => window.__ev[n], name);

  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.data", () => page);
  let sel, tr;
  await part("1 · components/data-table.html", async () => {
    /* ── 정렬 ── */
    await go("components/data-table.html");
    await listen("ds:sort"); await listen("ds:select-all");
    const basic = "#ex-data-table-basic .example-preview";
    const sortTh = page.locator(`${basic} th.sortable`).nth(3), sortBtn = sortTh.locator("button.sort");
    const col = () => page.evaluate((b) => [...document.querySelectorAll(`${b} tbody tr`)].map((r) => r.children[3].textContent.trim()).join("|"), basic);
    const headH = await page.locator(`${basic} thead th`).first().evaluate((e) => e.getBoundingClientRect().height);
    ok("a header with a sort button stays 44 high", Math.round(headH) === 44, String(headH));
    const sortLook = await sortBtn.evaluate((b) => { const s = getComputedStyle(b), t = getComputedStyle(b.closest("th")); return { bg: s.backgroundColor, border: s.borderTopWidth, pad: s.paddingLeft, size: s.fontSize === t.fontSize, weight: s.fontWeight === t.fontWeight, color: s.color === t.color, cursor: s.cursor }; });
    ok("the sort button looks like the header text, with no button face", sortLook.bg === "rgba(0, 0, 0, 0)" && sortLook.border === "0px" && sortLook.pad === "0px" && sortLook.size && sortLook.weight && sortLook.color && sortLook.cursor === "pointer", JSON.stringify(sortLook));
    const before = await col();
    await sortBtn.focus(); await page.keyboard.press("Enter"); await wait(30);
    const a1 = await sortTh.getAttribute("aria-sort"), ord1 = await col();
    await page.keyboard.press("Space"); await wait(30);
    ok("the sort button sorts by keyboard, both ways, once per press", a1 === "ascending" && (await sortTh.getAttribute("aria-sort")) === "descending" && ord1 !== before, JSON.stringify([a1, before, ord1]));
    const ev = await seen("ds:sort");
    ok("sorting fires ds:sort with key and direction", ev.length === 2 && ev[0].key === "횟수" && ev[0].dir === "asc" && ev[1].dir === "desc", JSON.stringify(ev));
    await page.locator(`${basic} table`).evaluate((t) => { t.dataset.sort = "server"; });
    const beforeS = await col();
    await sortTh.click(); await wait(30);
    ok("a server-sorted table changes the header but not the rows", (await col()) === beforeS && (await sortTh.getAttribute("aria-sort")) === "ascending" && (await seen("ds:sort")).length === 3);
    await page.locator(`${basic} table`).evaluate((t) => { delete t.dataset.sort; });
  });
  await part("2 · 전체 결과 선택", async () => {

    /* ── 전체 결과 선택 ── */
    const sa = "#ex-data-table-select-all .example-preview", note = page.locator(`${sa} .select-notice`), bar = page.locator(`${sa} .action-bar b`);
    ok("select-all example shows the page count and the way to widen", (await note.textContent()).includes("이 페이지의 3건") && (await note.locator("[data-select-all]").textContent()) === "전체 1,054건 선택");
    await note.locator("[data-select-all]").click(); await wait(30);
    ok("choosing all results updates the notice, the count and fires ds:select-all", (await note.textContent()).includes("전체 1,054건을 선택") && (await bar.textContent()) === "1,054개 선택" && JSON.stringify((await seen("ds:select-all")).pop()) === '{"all":true,"total":1054}', await bar.textContent());
    ok("focus stays on the notice after widening", await page.evaluate(() => document.activeElement.hasAttribute("data-select-clear")));
    await page.locator(`${sa} tbody td.check input`).first().click({ force: true }); await wait(30);
    ok("unchecking one row narrows back to the page", (await note.textContent()) === "" && (await bar.textContent()) === "2개 선택" && (await seen("ds:select-all")).pop().all === false, await bar.textContent());
    await page.locator(`${sa} tbody td.check input`).first().click({ force: true }); await wait(30);
    await note.locator("[data-select-all]").click(); await wait(30);
    await note.locator("[data-select-clear]").click(); await wait(30);
    const cleared = await page.evaluate((s) => ({ n: document.querySelectorAll(`${s} tbody td.check input:checked`).length, hidden: document.querySelector(`${s} .action-bar`).hidden, zero: document.querySelector(`${s} .action-bar b`).textContent, focus: document.activeElement.getAttribute("aria-label") }), sa);
    ok("clearing unchecks the page, the bar stays at 0 and focuses the header checkbox", cleared.n === 0 && !cleared.hidden && cleared.zero === "0개 선택" && cleared.focus === "전체 선택", JSON.stringify(cleared));
    const noteH = await page.evaluate((s) => { const n = document.querySelector(`${s} .select-notice`); return getComputedStyle(n).display; }, sa);
    ok("an empty notice takes no room", noteH === "none", noteH);
    const dis = await page.evaluate((s) => { const r = document.querySelector(`${s} tbody tr:last-child`); r.classList.add("disabled"); r.querySelector("input").checked = false; const m = document.querySelector(`${s} th.check input`); m.click(); const res = [r.querySelector("input").checked, m.checked]; m.click(); r.classList.remove("disabled"); return res; }, sa);
    ok("the header checkbox skips disabled rows", dis[0] === false && dis[1] === true, JSON.stringify(dis));
  });
  await part("3 · components/data-table.html", async () => {

    /* ── 행 지우기 ── */
    await go("components/data-table.html");
    sel = "#ex-data-table-selectable .example-preview";
    const rm = await page.evaluate((s) => {
      const rows = () => [...document.querySelectorAll(`${s} tbody tr`)], name = () => document.activeElement.getAttribute("aria-label");
      const out = [];
      rows()[0].querySelector("input").focus(); window.DS.table.removeRow(rows()[0]); out.push(name(), rows().length, document.querySelector(`${s} .action-bar b`).textContent);
      const last = rows()[rows().length - 1]; last.querySelector("input").focus(); window.DS.table.removeRow(last); out.push(name());
      document.body.focus(); const r0 = rows()[0]; document.activeElement.blur(); window.DS.table.removeRow(r0); out.push(document.activeElement === document.body);
      return out;
    }, sel);
    ok("removing a focused row moves focus to the next, or the previous at the end", rm[0] === "스크립트 실행 제한 선택" && rm[1] === 2 && rm[3] === "스크립트 실행 제한 선택", JSON.stringify(rm));
    ok("removing updates the action bar count", rm[2] === "1개 선택", String(rm[2]));
    ok("removing a row without focus leaves focus alone", rm[4] === true);
  });
  await part("4 · components/data-table.html", async () => {
    await go("components/data-table.html");
    const rmAll = await page.evaluate((s) => { const w = document.querySelector(`${s} .tbl-wrap`), rows = [...w.querySelectorAll("tbody tr")]; rows.slice(1).forEach((r) => r.remove()); rows[0].querySelector("input").focus(); window.DS.table.removeRow(rows[0]); return [document.activeElement === w, w.getAttribute("tabindex")]; }, sel);
    ok("removing the last row focuses the table area", rmAll[0] && rmAll[1] === "-1", JSON.stringify(rmAll));
  });
  await part("5 · components/data-table.html", async () => {

    /* ── 상태 ── */
    await go("components/data-table.html");
    await listen("ds:retry");
    const load = await page.evaluate(() => { const w = document.querySelector("#ex-data-table-loading .tbl-wrap"), trs = [...w.querySelectorAll("tbody tr")]; return { busy: w.querySelector("table").getAttribute("aria-busy"), status: w.querySelector("[role=status]").textContent, n: trs.length, h: Math.round(trs[0].getBoundingClientRect().height), skel: trs[0].querySelectorAll(".skeleton").length }; });
    ok("loading table has skeleton rows at row height, aria-busy and a named status", load.busy === "true" && load.status === "이벤트 불러오는 중" && load.n === 3 && load.h === 48 && load.skel === 4, JSON.stringify(load));
    const errBox = page.locator("#ex-data-table-error [role=alert]");
    await errBox.locator("[data-retry]").click(); await wait(30);
    ok("error row says what to do and retry fires ds:retry", (await errBox.textContent()).includes("다시 시도하세요") && (await seen("ds:retry")).length === 1);
  });
  await part("6 · 고정 헤더 · 말줄임", async () => {

    /* ── 고정 헤더 · 말줄임 ── */
    const sticky = page.locator("#ex-data-table-sticky .tbl-wrap");
    await sticky.scrollIntoViewIfNeeded();
    const st = await sticky.evaluate((w) => { const th = w.querySelector("th"); w.scrollTop = 120; const a = w.getBoundingClientRect().top, b = th.getBoundingClientRect().top, c = getComputedStyle(th); return { scrolled: w.scrollTop, gap: Math.round(b - a), pos: c.position, bg: c.backgroundColor, line: c.boxShadow.includes("inset"), tab: w.getAttribute("tabindex"), name: w.getAttribute("aria-label"), h: Math.round(w.getBoundingClientRect().height) }; });
    ok("sticky header stays at the top while the area scrolls", st.scrolled === 120 && st.gap <= 1 && st.pos === "sticky" && st.h === 240, JSON.stringify(st));
    ok("sticky header is opaque, keeps its line and the area is reachable and named", !/, 0\)$/.test(st.bg) && !/rgba/.test(st.bg) && st.line && st.tab === "0" && st.name === "최근 로그", JSON.stringify(st));
    const withBar = await sticky.evaluate((w) => { const b = document.createElement("div"); b.className = "action-bar"; b.innerHTML = '<b>1개 선택</b><button class="btn sm outline assistive">x</button>'; w.prepend(b); w.scrollTop = 200; const r = b.getBoundingClientRect(), th = w.querySelector("th").getBoundingClientRect(), wr = w.getBoundingClientRect(), res = { h: r.height, barGap: Math.round(r.top - wr.top), thGap: Math.round(th.top - r.bottom), bg: getComputedStyle(b).backgroundColor }; b.remove(); w.scrollTop = 0; return res; });
    ok("the selection bar stays above the sticky header without a gap, on an opaque face while stuck", withBar.h === 53 && withBar.barGap <= 1 && Math.abs(withBar.thGap) <= 1 && /^rgb\(/.test(withBar.bg), JSON.stringify(withBar));
    tr = await sticky.evaluate((w) => { const td = w.querySelector("td.truncate"), t = td.querySelector(".cell-text") || td, c = getComputedStyle(t); return { cut: t.scrollWidth > t.clientWidth, ell: c.textOverflow, title: td.hasAttribute("title"), over: w.scrollWidth - w.clientWidth, h: Math.round(td.getBoundingClientRect().height) }; });
    ok("a long message is cut in its cell without title (the Tooltip is checked in behave.cells), and the table does not widen", tr.cut && tr.ell === "ellipsis" && !tr.title && tr.over === 0 && tr.h === 40, JSON.stringify(tr));
  });
  await part("7 · components/pagination.html", async () => {

    /* ── Pagination ── */
    await go("components/pagination.html");
    await listen("ds:page");
    const nav = page.locator("#ex-pagination-basic nav"), next = nav.locator('button[aria-label="다음"]');
    await nav.locator("button", { hasText: /^4$/ }).click(); await next.focus(); await page.keyboard.press("Enter"); await wait(30);
    ok("reaching the end moves focus off the disabled arrow to the current page", await page.evaluate(() => document.activeElement.textContent.trim() === "24" && document.activeElement.classList.contains("on")));
    await nav.evaluate((n) => { n.dataset.target = "#ex-pagination-cursor"; });
    await nav.locator("button", { hasText: /^2$/ }).click(); await wait(900);   // 문서 페이지는 부드러운 스크롤이다
    const tg = await page.evaluate(() => { const e = document.querySelector("#ex-pagination-cursor"); return { focus: document.activeElement === e, top: e.getBoundingClientRect().top, tab: e.getAttribute("tabindex") }; });
    ok("data-target scrolls to the table and moves focus there", tg.focus && tg.top < 120 && tg.tab === "-1", JSON.stringify(tg));
    await nav.evaluate((n) => { delete n.dataset.target; });
  });
  await part("8 · components/pagination.html", async () => {
    await go("components/pagination.html");
    await listen("ds:page");
    const pb = "#ex-pagination-bar .pagination-bar", pnav = page.locator(`${pb} nav`);
    await pnav.locator("button", { hasText: /^3$/ }).click(); await wait(30);
    await page.locator(`${pb} .dropdown .trigger`).click(); await page.locator(`${pb} .menu-item`, { hasText: "100개씩" }).click(); await wait(30);
    const reset = await page.evaluate((s) => { const b = document.querySelector(s), on = b.querySelector("nav button.on"); return { on: on.textContent.trim(), cur: on.getAttribute("aria-current"), prev: b.querySelector('nav button[aria-label="이전"]').disabled, label: b.querySelector(".trigger").textContent.trim() }; }, pb);
    ok("changing the page size goes back to page 1", reset.on === "1" && reset.cur === "page" && reset.prev && reset.label === "100개씩", JSON.stringify(reset));
    ok("and fires ds:page with the size", JSON.stringify((await seen("ds:page")).pop()) === '{"page":1,"pageSize":100}', JSON.stringify(await seen("ds:page")));
    ok("a single page keeps the count and has no numbers", await page.evaluate(() => { const b = document.querySelector("#ex-pagination-single .pagination-bar"); return !b.querySelector("nav") && b.textContent.includes("12"); }));
    const cur = page.locator("#ex-pagination-cursor nav.cursor"), n0 = (await seen("ds:page")).length;
    await cur.locator('[data-cursor="next"]').click(); await wait(30);
    const cev = (await seen("ds:page")).slice(n0);
    const cs = await cur.evaluate((n) => ({ on: n.querySelectorAll("button.on").length, h: Math.round(n.querySelector("button").getBoundingClientRect().height), name: n.querySelector("[data-cursor=next]").textContent.trim(), icon: !!n.querySelector("[data-cursor=prev] svg"), row: (() => { const b = n.querySelector("[data-cursor=next]"), s = b.querySelector("svg"), c = getComputedStyle(b), br = b.getBoundingClientRect(), sr = s.getBoundingClientRect(), r = document.createRange(); r.selectNodeContents(b); r.setEndBefore(s); const tr = r.getBoundingClientRect(); return { display: c.display, gap: Math.round(sr.left - tr.right), mid: Math.abs((sr.top + sr.bottom) / 2 - (br.top + br.bottom) / 2) }; })() }));
    ok("cursor buttons fire ds:page with a direction, never mark a number", JSON.stringify(cev) === '[{"direction":"next"}]' && cs.on === 0, JSON.stringify([cev, cs]));
    ok("cursor buttons are named by their text at height 36", cs.h === 36 && cs.name === "다음" && cs.icon, JSON.stringify(cs));
    ok("cursor button icon sits beside the text, 4 apart and centred", cs.row.display === "flex" && cs.row.gap === 4 && cs.row.mid <= 1, JSON.stringify(cs.row));
  });
  await part("9 · components/list.html", async () => {

    /* ── List ── */
    await go("components/list.html");
    const opt = page.locator("#ex-list-select li[role=option]").first();
    await opt.focus(); await page.keyboard.press("Enter"); await wait(30);
    const lb = await page.evaluate(() => [...document.querySelectorAll("#ex-list-select li[role=option]")].map((l) => l.getAttribute("aria-selected")).join());
    ok("a selectable list row is chosen by keyboard, one at a time", lb === "true,false,false", lb);
    await page.locator("#ex-list-select li[role=option]").nth(2).focus(); await page.keyboard.press("Space"); await wait(30);
    ok("Space chooses too, without scrolling the page", (await page.evaluate(() => document.querySelectorAll("#ex-list-select li[aria-selected=true]").length)) === 1 && (await page.locator("#ex-list-select li[role=option]").nth(2).getAttribute("aria-selected")) === "true");
  });
};
