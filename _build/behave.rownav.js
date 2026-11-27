/* 표 행 방향키 · 긴 폼 버튼 줄 고정(2026-11-26) — behave.js 가 부른다.
   1. 행 방향키 — table.tbl[data-row-nav] 의 행이 Tab 칸 하나(roving tabindex). ↑↓ · Home · End 로 옮기고 꺼진 행은 건너뜀, Space = 행 체크박스, Enter = 행의 첫 링크,
      Tab 은 그 행 안의 조작으로, 칸 안 조작의 방향키는 가로채지 않음, 포커스 링은 행 안쪽 1px
   2. 행 펼침 · 로그 뷰어 — Enter 가 펼침 버튼을 누르고 상세 행은 건너뜀, 로그 표도 Tab 칸 하나
   3. 행을 지운 뒤 — 행 방향키 표는 다음 행 자체로 포커스 · 그 행이 Tab 칸
   4. 버튼 줄 고정 — Form 'Sticky Actions' 미리보기 안에서 아래 끝에 붙고(.stuck) 끝까지 스크롤하면 제자리, 위저드 템플릿은 화면 아래 끝에 */
module.exports = async function rownav({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.rownav", () => page);
  const state = () => page.evaluate(() => {
    const t = document.querySelector("#ex-data-table-row-nav table[data-row-nav]"), rows = [...t.tBodies[0].rows];
    const a = document.activeElement;
    return { tabs: rows.map((r) => r.tabIndex), at: rows.indexOf(a.closest ? a.closest("tr") : null), self: a.tagName, links: rows.map((r) => r.querySelector("a").getAttribute("tabindex")) };
  });

  await part("1 · 행 방향키", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/data-table.html"); await wait(300);
    const s0 = await state();
    ok("one row is the Tab stop and only its links stay in the Tab order", JSON.stringify(s0.tabs) === "[0,-1,-1,-1,-1]" && s0.links[0] === null && s0.links[1] === "-1" && s0.links[2] === "-1", JSON.stringify(s0));
    await page.locator("#ex-data-table-row-nav thead input").focus(); await page.keyboard.press("Tab");
    const s1 = await state();
    ok("Tab from the header reaches the row itself", s1.self === "TR" && s1.at === 0, JSON.stringify(s1));
    const seq = [];
    for (const k of ["ArrowDown", "ArrowDown", "ArrowDown", "End", "ArrowDown", "Home", "ArrowUp"]) { await page.keyboard.press(k); const s = await state(); seq.push(s.at); }
    const s2 = await state();
    ok("arrows · Home · End move rows, skip the disabled row and stop at the ends", JSON.stringify(seq) === "[1,3,4,4,4,0,0]" && JSON.stringify(s2.tabs) === "[0,-1,-1,-1,-1]", JSON.stringify(seq));
    const focusRing = await page.evaluate(() => { const r = document.activeElement, cs = getComputedStyle(r); return [r.matches(":focus-visible"), cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]; });
    ok("the row draws a 1px focus ring inside", focusRing[0] && focusRing[1] === "solid" && focusRing[2] === "1px" && focusRing[3] === "-1px", JSON.stringify(focusRing));
    const y0 = await page.evaluate(async () => { let a = -1; for (let i = 0; i < 30; i++) { await new Promise((f) => setTimeout(f, 100)); if (scrollY === a) break; a = scrollY; } return scrollY; });   // 앞 포커스가 일으킨 부드러운 스크롤이 멈출 때까지
    await page.keyboard.press(" ");
    const sp = await page.evaluate(() => [document.activeElement.querySelector("td.check input").checked, scrollY, document.activeElement.tagName]);
    ok("Space ticks the row's checkbox, keeps focus on the row and does not scroll", sp[0] && sp[1] === y0 && sp[2] === "TR", JSON.stringify([sp, y0]));
    await page.evaluate(() => { window.__rnClick = 0; document.querySelectorAll("#ex-data-table-row-nav tbody a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); window.__rnClick = a.textContent; })); });
    await page.keyboard.press("Enter");
    ok("Enter opens the row's link", await page.evaluate(() => window.__rnClick) === "PC-2041");
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("Tab");
    const inner = await page.evaluate(() => { const a = document.activeElement; return [a.tagName, a.closest("tr").querySelector("a").textContent]; });
    ok("Tab from a row goes to the controls inside that row", inner[0] === "INPUT" && inner[1] === "PC-1187", JSON.stringify(inner));
    await page.keyboard.press("ArrowDown");
    const still = await page.evaluate(() => [document.activeElement.tagName, document.activeElement.closest("tr").querySelector("a").textContent]);
    ok("arrow keys inside a control are not taken by the row", still[0] === "INPUT" && still[1] === "PC-1187", JSON.stringify(still));
    await page.locator("#ex-data-table-row-nav tbody tr").nth(3).locator("td").nth(2).click();
    const s3 = await state();
    ok("clicking a row makes it the Tab stop", s3.tabs[3] === 0 && s3.tabs.filter((v) => v === 0).length === 1, JSON.stringify(s3));
  });

  await part("2 · 행 펼침 · 로그 뷰어", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/data-table.html"); await wait(300);
    const r = await page.evaluate(async () => {
      const t = document.querySelector("#ex-data-table-expandable table[data-row-nav]"); if (!t) return null;
      const rows = [...t.tBodies[0].rows].filter((x) => !x.classList.contains("row-detail"));
      rows[0].focus();
      const key = (k) => rows[0].ownerDocument.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
      const b = rows[0].querySelector(".expand-btn"), was = b.getAttribute("aria-expanded");
      key("Enter"); await new Promise((f) => setTimeout(f, 50));
      const now = b.getAttribute("aria-expanded"), detailShown = !rows[0].nextElementSibling.hidden;
      key("ArrowDown");
      return { was, now, detailShown, next: document.activeElement === rows[1], tab0: [...t.tBodies[0].rows].filter((x) => x.tabIndex === 0).length };
    });
    ok("Enter toggles the row's expand button and ↓ skips the detail row", !!r && r.now !== r.was && r.next && r.tab0 === 1, JSON.stringify(r));
    await go("patterns/log-viewer.html"); await wait(300);
    const lg = await page.evaluate(() => { const t = document.querySelector("#log-tbl"); return t && [t.hasAttribute("data-row-nav"), [...t.tBodies[0].rows].filter((x) => x.tabIndex === 0).length, [...t.tBodies[0].rows].filter((x) => !x.hidden && !x.classList.contains("row-detail")).every((x) => x.tabIndex === 0 || x.tabIndex === -1)]; });
    ok("the log table is one Tab stop", !!lg && lg[0] && lg[1] === 1 && lg[2], JSON.stringify(lg));
  });

  await part("3 · 행을 지운 뒤", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/data-table.html"); await wait(300);
    const r = await page.evaluate(async () => {
      const t = document.querySelector("#ex-data-table-row-nav table"), rows = [...t.tBodies[0].rows];
      rows[1].focus(); window.DS.table.removeRow(rows[1]);
      const a = document.activeElement;
      return { tag: a.tagName, host: a.querySelector && a.querySelector("a") && a.querySelector("a").textContent, tab: a.tabIndex, stops: [...t.tBodies[0].rows].filter((x) => x.tabIndex === 0 && !x.classList.contains("ds-leaving")).length };
    });
    ok("deleting a row moves focus to the next enabled row itself", r.tag === "TR" && r.host === "PC-0815" && r.tab === 0 && r.stops === 1, JSON.stringify(r));
    await wait(250);
  });

  await part("4 · 버튼 줄 고정", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/form.html"); await wait(300);
    await page.locator("#ex-form-sticky").scrollIntoViewIfNeeded(); await wait(400);
    const a = await page.evaluate(() => { const p = document.querySelector("#ex-form-sticky .example-preview"), b = p.querySelector(".form-actions.sticky"), pr = p.getBoundingClientRect(), br = b.getBoundingClientRect(); return { scroll: p.scrollHeight > p.clientHeight + 40, h: Math.round(p.clientHeight), stuck: b.classList.contains("stuck"), pos: getComputedStyle(b).position, gap: Math.round(pr.bottom - br.bottom), bg: getComputedStyle(b).backgroundColor, card: getComputedStyle(b.closest(".form")).backgroundColor }; });
    ok("in the Sticky Actions preview the bar sticks to the bottom and paints the form surface", a.scroll && a.pos === "sticky" && a.stuck && a.gap >= 0 && a.gap <= 2 && a.bg === a.card, JSON.stringify(a));
    await page.evaluate(() => { const p = document.querySelector("#ex-form-sticky .example-preview"); p.scrollTop = p.scrollHeight; }); await wait(300);
    const b = await page.evaluate(() => { const p = document.querySelector("#ex-form-sticky .example-preview"), b = p.querySelector(".form-actions.sticky"), f = b.closest(".form").getBoundingClientRect(), br = b.getBoundingClientRect(); return { stuck: b.classList.contains("stuck"), inForm: br.bottom <= f.bottom + 1 }; });
    ok("scrolled to the end, the bar is back in place and not stuck", !b.stuck && b.inForm, JSON.stringify(b));
    const pad = await page.evaluate(async () => {   // 아래 패딩이 있는 스크롤 영역 — 줄은 패딩 위에 붙으므로 관찰 영역에서 패딩을 뺀다
      const box = document.createElement("div"); box.style.cssText = "height:300px;overflow-y:auto;padding:0 0 48px";
      box.innerHTML = '<form class="form"><div style="height:600px"></div><div class="form-actions sticky"><div class="btn-group"><button type="button" class="btn solid primary md">저장</button></div></div></form>';
      document.querySelector("#ex-form-sticky").appendChild(box); window.DS.init(box); await new Promise((f) => setTimeout(f, 300));
      const b = box.querySelector(".form-actions"), r = { stuck: b.classList.contains("stuck"), gap: Math.round(box.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom) }; box.remove(); return r;
    });
    ok("in a scroll area with bottom padding the bar still counts as stuck", pad.stuck && pad.gap === 48, JSON.stringify(pad));
    const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 600 } }); const p2 = await ctx.newPage();
    await p2.goto("file://" + require("path").resolve(__dirname, "../templates/screen/wizard.html")); await p2.waitForTimeout(500);
    const w = await p2.evaluate(() => { const b = document.querySelector(".step-actions.sticky"); if (!b) return null; const r = b.getBoundingClientRect(); return { pos: getComputedStyle(b).position, stuck: b.classList.contains("stuck"), inView: r.top >= 0 && r.bottom <= innerHeight + 1, bottom: Math.round(r.bottom), vh: innerHeight }; });
    ok("the wizard template keeps its step buttons in view and stuck at 1440 × 600", !!w && w.pos === "sticky" && w.stuck && w.inView, JSON.stringify(w));
    await ctx.close();
  });
};
