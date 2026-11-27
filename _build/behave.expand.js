/* Data Table 행 펼침의 단정(2026-11-11) — behave.js 가 부른다.
   맨 앞 셰브론 버튼 · 여러 행 함께 · 정렬은 펼침을 남김 · 자유 자리 + 권장 구성(키-값 + 원본 로그), 사람의 결정 넷 */
module.exports = async ({ b, ok, SITE, path }) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(3000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const go = async (f) => { await page.goto("file://" + path.join(SITE, f)); await page.waitForTimeout(250); await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; }); };
  const EX = "#ex-data-table-expandable .example-preview";
  /* 행 순서와 펼침 상태 — [시간, aria-expanded, 상세가 바로 아래, 상세 hidden] */
  const state = () => page.evaluate((EX) => {
    const tb = document.querySelector(EX + " tbody");
    return Array.from(tb.children).filter((tr) => !tr.classList.contains("row-detail")).map((tr) => {
      const btn = tr.querySelector(".expand-btn"), det = document.getElementById(btn.getAttribute("aria-controls"));
      return [tr.children[1].textContent.trim(), btn.getAttribute("aria-expanded"), tr.nextElementSibling === det, det.hidden];
    });
  }, EX);

  await go("components/data-table.html");
  await page.locator(EX).scrollIntoViewIfNeeded();

  await step("row expand: initial — first two open, third closed, header cell named, button names the row", async () => {
    const s = await state();
    const r = await page.evaluate((EX) => {
      const t = document.querySelector(EX + " table"), th = t.querySelector("thead th");
      const btns = Array.from(t.querySelectorAll(".expand-btn"));
      return { th: th.className, thName: th.querySelector(".sr-only")?.textContent, first: btns.map((x) => x.closest("td") === x.closest("tr").firstElementChild).every(Boolean),
        names: btns.map((x) => x.getAttribute("aria-label")), span: Array.from(t.querySelectorAll("tr.row-detail > td")).map((td) => td.colSpan), cols: t.querySelectorAll("thead th").length };
    }, EX);
    ok("row expand: initial — first two open, third closed, header cell named, button names the row",
      JSON.stringify(s) === JSON.stringify([["09:41:12.031", "true", true, false], ["09:41:11.870", "true", true, false], ["09:41:09.114", "false", true, true]])
      && r.th === "expand" && r.thName === "상세" && r.first && r.names[0] === "09:41:12.031 로그 상세" && r.span.every((n) => n === r.cols) && r.cols === 5, JSON.stringify({ s, r }));
  });

  await step("row expand: click opens with ds:row-expand on the row, focus stays, several stay open", async () => {
    const r = await page.evaluate((EX) => { window._exp = []; document.querySelector(EX).addEventListener("ds:row-expand", (e) => window._exp.push([e.target.tagName, e.target.children[1].textContent.trim(), e.detail.expanded])); }, EX);
    await page.locator(EX + " tbody tr:nth-child(5) .expand-btn").click();
    const s = await state();
    const f = await page.evaluate(() => [document.activeElement.className, window._exp]);
    ok("row expand: click opens with ds:row-expand on the row, focus stays, several stay open", r === undefined && s.every((x) => x[1] === "true" && !x[3]) && f[0] === "expand-btn" && JSON.stringify(f[1]) === JSON.stringify([["TR", "09:41:09.114", true]]), JSON.stringify({ s, f }));
  });

  await step("row expand: Space and Enter toggle, hidden detail leaves the Tab order", async () => {
    await page.keyboard.press("Space");
    const a = await state();
    await page.keyboard.press("Tab");
    const afterClosed = await page.evaluate(() => [document.activeElement.className, document.activeElement.closest("tr")?.className]);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");
    const b2 = await state();
    const ev = await page.evaluate(() => window._exp.map((x) => x[2]));
    ok("row expand: Space and Enter toggle, hidden detail leaves the Tab order", a[2][1] === "false" && a[2][3] && afterClosed[1] !== "row-detail" && b2[2][1] === "true" && !b2[2][3] && JSON.stringify(ev) === "[true,false,true]", JSON.stringify({ a, afterClosed, b2, ev }));
  });

  await step("row expand: Tab goes from the button into its open detail", async () => {
    await page.locator(EX + " tbody tr:nth-child(1) .expand-btn").focus();
    await page.keyboard.press("Tab");
    const r = await page.evaluate(() => { const a = document.activeElement; return [a.closest("tr")?.className, a.getAttribute("aria-label")]; });
    ok("row expand: Tab goes from the button into its open detail", r[0] === "row-detail" && r[1] === "09:41:12.031 원본 로그 복사", JSON.stringify(r));
  });

  await step("row expand: chevron points right when closed and down when open", async () => {
    const r = await page.evaluate(async (EX) => {
      const svg = (i) => getComputedStyle(document.querySelectorAll(EX + " .expand-btn svg")[i]).transform;
      const wait = () => new Promise((res) => setTimeout(res, 400));   // 회전이 끝난 뒤에 잰다
      const b = document.querySelectorAll(EX + " .expand-btn")[2]; b.click(); await wait(); const closed = svg(2); b.click(); await wait();
      return { open: svg(0), closed, reopened: svg(2), prop: getComputedStyle(document.querySelector(EX + " .expand-btn svg")).transitionProperty };
    }, EX);
    const down = /^matrix\((6\.1\d*e-17|0), 1, -1, (6\.1\d*e-17|0), 0, 0\)$/;   // rotate(90deg)
    ok("row expand: chevron points right when closed and down when open", down.test(r.open) && down.test(r.reopened) && (r.closed === "none" || r.closed === "matrix(1, 0, 0, 1, 0, 0)") && r.prop === "transform", JSON.stringify(r));
  });

  await step("row expand: sorting moves each detail with its row and keeps it open", async () => {
    await page.locator(EX + " th.sortable button.sort").click();
    const s = await state();
    await page.locator(EX + " th.sortable button.sort").click();
    const s2 = await state();
    ok("row expand: sorting moves each detail with its row and keeps it open",
      s.map((x) => x[0]).join() === "09:41:09.114,09:41:11.870,09:41:12.031" && s.every((x) => x[2] && x[1] === "true" && !x[3])
      && s2.map((x) => x[0]).join() === "09:41:12.031,09:41:11.870,09:41:09.114" && s2.every((x) => x[2]), JSON.stringify({ s, s2 }));
  });

  await step("row expand: detail is a gray band without row hover, lined up with the first column", async () => {
    const det = page.locator(EX + " tbody tr.row-detail").first();
    await det.hover();
    const r = await page.evaluate((EX) => {
      const t = document.querySelector(EX + " table"), d = t.querySelector("tr.row-detail > td"), tr1 = t.querySelector("tbody tr");
      const probe = document.createElement("i"); probe.style.background = "var(--background-neutral-secondary)"; document.body.appendChild(probe); const gray = getComputedStyle(probe).backgroundColor; probe.remove();
      const body = d.querySelector(".row-detail-body").getBoundingClientRect(), cell = tr1.children[1], cs = getComputedStyle(cell);
      const textLeft = cell.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
      return { bg: getComputedStyle(d).backgroundColor, gray, dLeft: body.left, textLeft, w: d.getBoundingClientRect().width, tw: t.getBoundingClientRect().width, h: d.style.height };
    }, EX);
    await page.locator(EX + " tbody tr:not(.row-detail)").first().hover();
    const hov = await page.evaluate((EX) => getComputedStyle(document.querySelector(EX + " tbody tr td:nth-child(2)")).backgroundColor, EX);
    ok("row expand: detail is a gray band without row hover, lined up with the first column", r.bg === r.gray && hov !== r.gray && Math.abs(r.dLeft - r.textLeft) < 0.5 && Math.abs(r.w - r.tw) < 0.5, JSON.stringify({ r, hov }));
  });

  await step("row expand: zebra skips detail rows", async () => {
    await page.mouse.move(0, 0);
    const r = await page.evaluate((EX) => {
      const t = document.querySelector(EX + " table"); t.classList.add("zebra");
      const main = Array.from(t.tBodies[0].rows).filter((tr) => !tr.classList.contains("row-detail")).map((tr) => getComputedStyle(tr.children[1]).backgroundColor);
      t.classList.remove("zebra"); const plain = getComputedStyle(t.tBodies[0].rows[0].children[1]).backgroundColor;
      return { main, plain };
    }, EX);
    ok("row expand: zebra skips detail rows", r.main[0] === r.plain && r.main[1] !== r.plain && r.main[2] === r.plain, JSON.stringify(r));
  });

  await step("row expand: a long raw log wraps inside the detail and never widens the table", async () => {
    const r = await page.evaluate((EX) => {
      const w = document.querySelector(EX + " .tbl-wrap"), pre = document.querySelector(EX + " tr.row-detail pre");
      const cs = getComputedStyle(pre.querySelector("code"));
      return { code: [cs.backgroundColor, cs.fontSize, cs.paddingLeft], sw: w.scrollWidth, cw: w.clientWidth, lines: Math.round(pre.querySelector("code").getBoundingClientRect().height / parseFloat(getComputedStyle(pre).lineHeight)) };
    }, EX);
    await page.setViewportSize({ width: 768, height: 900 });
    const n = await page.evaluate((EX) => { const w = document.querySelector(EX + " .tbl-wrap"); const t = w.querySelector("table"); const d = w.querySelector("tr.row-detail > td"); return { tw: t.offsetWidth, dw: d.offsetWidth, cw: w.clientWidth }; }, EX);
    await page.setViewportSize({ width: 1440, height: 900 });
    ok("row expand: a long raw log wraps inside the detail and never widens the table", r.code.join() === "rgba(0, 0, 0, 0),12px,0px" && r.sw <= r.cw && r.lines >= 2 && n.dw === n.tw && n.tw <= n.cw, JSON.stringify({ r, n }));
  });

  await step("row expand: the loading detail is a status line in one row", async () => {
    const r = await page.evaluate((EX) => {
      const s = Array.from(document.querySelectorAll(EX + " tr.row-detail .spinner-wrap"));
      return s.map((x) => [x.getAttribute("role"), getComputedStyle(x).flexDirection, x.textContent.trim(), !!x.querySelector(".spinner.sm")]);
    }, EX);
    ok("row expand: the loading detail is a status line in one row", JSON.stringify(r) === JSON.stringify([["status", "row", "상세 불러오는 중…", true]]), JSON.stringify(r));
  });

  await step("row expand: the chevron button has the hover tint", async () => {
    const btn = page.locator(EX + " .expand-btn").first();
    await btn.hover();
    const r = await page.evaluate((EX) => {
      const b = document.querySelector(EX + " .expand-btn"), probe = document.createElement("i"); probe.style.background = "var(--surface-neutral-strong)"; document.body.appendChild(probe);
      const want = getComputedStyle(probe).backgroundColor; probe.remove(); const r = b.getBoundingClientRect();
      return { bg: getComputedStyle(b).backgroundColor, want, w: r.width, h: r.height };
    }, EX);
    ok("row expand: the chevron button has the hover tint", r.bg === r.want && r.w === 24 && r.h === 24, JSON.stringify(r));
  });

  await step("row expand: removeRow takes the detail too and moves focus to the next row", async () => {
    const r = await page.evaluate((EX) => {
      const tb = document.querySelector(EX + " tbody"), first = tb.querySelector("tr:not(.row-detail)");
      first.nextElementSibling.querySelector("pre").focus();
      const before = tb.children.length; window.DS.table.removeRow(first);
      const a = document.activeElement;
      const live = Array.from(tb.children).filter((tr) => !tr.classList.contains("ds-leaving"));   /* 흐려지는 동안 남은 행은 세지 않는다 · 행 방향키 표(data-row-nav)라 포커스는 다음 행 자체로(2026-11-26) */
      const res = { before, after: live.length, lead: live[0].classList.contains("row-detail"), focus: [a.className, a.closest("tr")?.children[1]?.textContent.trim()] };
      /* 마지막 행을 지우면 앞 행으로 — 바로 앞은 앞 행의 상세(Spinner 뿐)라 건너뛴다 */
      const last = Array.from(tb.children).filter((tr) => !tr.classList.contains("row-detail") && !tr.classList.contains("ds-leaving")).pop();
      last.querySelector(".expand-btn").focus(); window.DS.table.removeRow(last);
      const z = document.activeElement; res.back = [z.className, z.closest("tr")?.children[1]?.textContent.trim()];
      return res;
    }, EX);
    ok("row expand: removeRow takes the detail too and moves focus to the next row", r.after === r.before - 2 && !r.lead && r.focus[0] === "log-row" && r.focus[1] === "09:41:11.870" && r.back[0] === "log-row" && r.back[1] === "09:41:11.870", JSON.stringify(r));
  });

  ok("row expand: no page errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
};
