/* 남은 것 정리(사람의 결정 2026-11-12) — 말줄임 칸 · 아바타의 title → Tooltip, 끈 컨트롤 커서, 액션 바 건수 색, 로그 한 줄. behave.js 가 부른다 */
module.exports = async function cells({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const away = () => page.mouse.move(4, 500);
  const tok = (v) => page.evaluate((x) => { const d = document.createElement("i"); d.style.color = `var(${x})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);

  /* ── 말줄임 칸 — 잘린 칸만 Tooltip, title 없음 ── */
  await go("components/data-table.html"); await away();
  await page.evaluate(() => document.fonts.ready); await wait(50);
  const W = "#ex-data-table-sticky .tbl-wrap";
  const cut = await page.evaluate((s) => {
    const w = document.querySelector(s), tds = [...w.querySelectorAll("td.truncate")];
    const one = tds.find((td) => td.querySelector(":scope > .tooltip-wrap")), t = one && one.querySelector(".cell-text"), tip = one && one.querySelector(".tooltip"), c = t && getComputedStyle(t);
    return { n: tds.length, wrapped: tds.filter((td) => td.querySelector(":scope > .tooltip-wrap")).length, titles: tds.filter((td) => td.hasAttribute("title")).length,
      ell: c && c.textOverflow, cutNow: t && t.scrollWidth > t.clientWidth, tab: t && t.tabIndex, same: tip && tip.textContent === t.textContent, hidden: tip && tip.getAttribute("aria-hidden"),
      h: one && Math.round(one.getBoundingClientRect().height), over: w.scrollWidth - w.clientWidth };
  }, W);
  ok("a cut table cell gets a Tooltip with the whole value instead of title, is focusable, and keeps its row height", cut.n > 0 && cut.wrapped > 0 && cut.titles === 0 && cut.ell === "ellipsis" && cut.cutNow && cut.tab === 0 && cut.same && cut.hidden === "true" && cut.h === 40 && cut.over === 0, JSON.stringify(cut));

  /* 키보드로 오면 바로 보이고, 스크롤 영역 안이라 화면 기준으로 뜬다 */
  const cellText = page.locator(`${W} td.truncate .cell-text`).first();
  await cellText.focus(); await wait(220);
  const kb = await page.evaluate((s) => { const w = document.querySelector(s).querySelector("td.truncate > .tooltip-wrap"), tip = w.querySelector(".tooltip"), r = tip.getBoundingClientRect(), c = getComputedStyle(tip);
    return { op: Number(c.opacity), pos: c.position, inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, focus: document.activeElement === w.querySelector(".cell-text") }; }, W);
  ok("a cut cell shows its Tooltip on keyboard focus, floating on the screen and fully visible", kb.op === 1 && kb.pos === "fixed" && kb.inView && kb.focus, JSON.stringify(kb));
  await page.keyboard.press("Escape"); await wait(220);
  const esc = await page.evaluate((s) => Number(getComputedStyle(document.querySelector(s).querySelector("td.truncate .tooltip")).opacity), W);
  ok("Esc hides the cut cell's Tooltip", esc === 0, JSON.stringify({ esc }));
  await page.evaluate(() => document.activeElement && document.activeElement.blur());

  /* 칸이 넓어져 다 보이면 풀고, 좁아지면 다시 단다 — 창 크기 변경으로 다시 잰다. 비활성 행 안에서는 Tab 칸이 아니다 */
  const re = await page.evaluate(async () => {
    const box = document.createElement("div"); box.id = "__cells"; box.style.cssText = "position:absolute;left:0;top:0;width:360px";   // 미리보기 틀은 폭을 758 로 묶는다
    box.innerHTML = '<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>시간</th><th>메시지</th></tr></thead><tbody>' +
      '<tr><td>09:41</td><td class="truncate">짧은 값</td></tr>' +
      '<tr><td>09:42</td><td class="truncate">process.create blocked: rundll32.exe → cryptor.dll (parent explorer.exe)</td></tr>' +
      '<tr class="disabled" aria-disabled="true"><td>09:43</td><td class="truncate">usb.attach vendor=0x0781 product=0x5583 unapproved device</td></tr></tbody></table></div>';
    document.body.append(box); window.DS.init(box); await document.fonts.ready; await new Promise((r) => setTimeout(r, 30));
    const tds = [...box.querySelectorAll("td.truncate")], st = () => tds.map((td) => !!td.querySelector(":scope > .tooltip-wrap"));
    const narrow = st(), offTab = tds[2].querySelector(".cell-text") ? tds[2].querySelector(".cell-text").tabIndex : null;
    box.style.width = "1400px"; window.dispatchEvent(new Event("resize")); await new Promise((r) => setTimeout(r, 260));
    const wide = st(), text = tds[1].textContent;
    box.style.width = "360px"; window.dispatchEvent(new Event("resize")); await new Promise((r) => setTimeout(r, 260));
    const again = st(); box.remove();
    return { narrow, offTab, wide, again, text };
  });
  ok("only cut cells get the Tooltip, it is removed when the cell widens and comes back when it narrows", JSON.stringify(re.narrow) === "[false,true,true]" && JSON.stringify(re.wide) === "[false,false,false]" && JSON.stringify(re.again) === "[false,true,true]" && re.text.startsWith("process.create"), JSON.stringify(re));
  ok("a cut cell in a disabled row is not a Tab stop", re.offTab === -1, JSON.stringify(re));

  /* ── Breadcrumb 의 잘린 항목 Tooltip 도 화면 글자와 같아 aria-hidden(두 번 읽히지 않게) ── */
  await go("components/breadcrumb.html"); await page.evaluate(() => document.fonts.ready); await wait(80);
  const bc = await page.evaluate(() => { const tips = [...document.querySelectorAll(".breadcrumb .tooltip-wrap > .tooltip")]; return { n: tips.length, hidden: tips.filter((t) => t.getAttribute("aria-hidden") === "true").length }; });
  ok("breadcrumb truncation Tooltips are hidden from assistive tech (same text as the label)", bc.n > 0 && bc.hidden === bc.n, JSON.stringify(bc));

  /* ── 끈 컨트롤의 커서는 모두 not-allowed ── */
  await go("components/number-input.html");
  const numCur = await page.evaluate(() => { const b = [...document.querySelectorAll(".example-preview .number-field .num-btn")].find((x) => x.disabled); return b ? getComputedStyle(b).cursor : "none"; });
  await go("components/file-upload.html");
  const upCur = await page.evaluate(() => { const z = document.querySelector(".example-preview .upload.disabled .upload-zone"); return z ? getComputedStyle(z).cursor : "none"; });
  ok("a disabled step button and a disabled upload zone show the not-allowed cursor like every other disabled control", numCur === "not-allowed" && upCur === "not-allowed", JSON.stringify({ numCur, upCur }));

  /* ── 액션 바의 선택 건수 = 진한 중립(표 안의 brand 를 덜며 남은 것) ── */
  await go("components/data-table.html");
  const want = await tok("--foreground-neutral-primary"), brand = await tok("--foreground-brand-primary");
  const bar = await page.evaluate(() => { const b = document.querySelector(".example-preview .action-bar b"); const c = getComputedStyle(b); return { color: c.color, weight: c.fontWeight }; });
  ok("the action bar count is dark neutral and bold, not brand", bar.color === want && bar.color !== brand && Number(bar.weight) >= 700, JSON.stringify({ bar, want }));

  /* ── 로그 한 건 = 한 줄 — 짧은 열은 끊기지 않고 메시지 열이 남는 폭을 갖는다 ── */
  await go("patterns/log-viewer.html"); await page.evaluate(() => document.fonts.ready); await wait(50);
  const lg = await page.evaluate(() => {
    const t = document.querySelector(".example-preview table.tbl"), rows = [...t.querySelectorAll("tbody tr.log-row")];
    const lines = (td) => { const r = document.createRange(); r.selectNodeContents(td); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size; };
    const broken = rows.flatMap((tr) => [...tr.children].filter((td) => !td.classList.contains("truncate") && !td.classList.contains("actions") && !td.querySelector(".tag") && lines(td) > 1).map((td) => td.textContent.trim()));
    const hs = [...new Set(rows.map((tr) => Math.round(tr.getBoundingClientRect().height)))], ths = [...t.querySelectorAll("thead th")].map((th) => Math.round(th.getBoundingClientRect().width));
    const msg = rows[0].querySelector("td.truncate"), w = t.closest(".tbl-wrap");
    return { broken, hs, msgW: msg && Math.round(msg.getBoundingClientRect().width), widest: Math.max(...ths), over: w.scrollWidth - w.clientWidth };
  });
  ok("log rows stay on one line (time · IP · host never break) and the message column takes the remaining width", lg.broken.length === 0 && lg.hs.length === 1 && lg.msgW === lg.widest && lg.over === 0, JSON.stringify(lg));
};
