/* 남은 것 정리(사람의 결정 2026-11-12) — 말줄임 칸 · 아바타의 title → Tooltip, 끈 컨트롤 커서, 액션 바 건수 색, 로그 한 줄. behave.js 가 부른다 */
module.exports = async function cells({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const away = () => page.mouse.move(4, 500);
  const tok = (v) => page.evaluate((x) => { const d = document.createElement("i"); d.style.color = `var(${x})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);

  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.cells", () => page);
  let W, cut, numCur;
  await part("1 · components/data-table.html", async () => {
    /* ── 말줄임 칸 — 잘린 칸만 Tooltip, title 없음 ── */
    await go("components/data-table.html"); await away();
    await page.evaluate(() => document.fonts.ready); await wait(50);
    W = "#ex-data-table-sticky .tbl-wrap";
    cut = await page.evaluate((s) => {
      const w = document.querySelector(s), tds = [...w.querySelectorAll("td.truncate")];
      const one = tds.find((td) => td.querySelector(":scope > .tooltip-wrap")), t = one && one.querySelector(".cell-text"), tip = one && one.querySelector(".tooltip"), c = t && getComputedStyle(t);
      return { n: tds.length, wrapped: tds.filter((td) => td.querySelector(":scope > .tooltip-wrap")).length, titles: tds.filter((td) => td.hasAttribute("title")).length,
        ell: c && c.textOverflow, cutNow: t && t.scrollWidth > t.clientWidth, tab: t && t.tabIndex, same: tip && tip.textContent === t.textContent, hidden: tip && tip.getAttribute("aria-hidden"),
        h: one && Math.round(one.getBoundingClientRect().height), over: w.scrollWidth - w.clientWidth };
    }, W);
    ok("a cut table cell gets a Tooltip with the whole value instead of title, is focusable, and keeps its row height", cut.n > 0 && cut.wrapped > 0 && cut.titles === 0 && cut.ell === "ellipsis" && cut.cutNow && cut.tab === 0 && cut.same && cut.hidden === "true" && cut.h === 40 && cut.over === 0, JSON.stringify(cut));
  });
  await part("2 · 키보드로 오면 바로 보이고, 스크롤 영역 안이라 화면 기준으로 뜬다", async () => {

    /* 키보드로 오면 바로 보이고, 스크롤 영역 안이라 화면 기준으로 뜬다 */
    const cellText = page.locator(`${W} td.truncate .cell-text`).first();
    await cellText.focus();
    await page.waitForFunction((s) => Number(getComputedStyle(document.querySelector(s).querySelector("td.truncate > .tooltip-wrap > .tooltip")).opacity) === 1, W, { timeout: 1500 }).catch(() => {});   // 나타나는 전환 도중에 재면 0.96 · 0.999 가 나왔다
    const kb = await page.evaluate((s) => { const w = document.querySelector(s).querySelector("td.truncate > .tooltip-wrap"), tip = w.querySelector(".tooltip"), r = tip.getBoundingClientRect(), c = getComputedStyle(tip);
      return { op: Number(c.opacity), pos: c.position, inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, focus: document.activeElement === w.querySelector(".cell-text") }; }, W);
    ok("a cut cell shows its Tooltip on keyboard focus, floating on the screen and fully visible", kb.op === 1 && kb.pos === "fixed" && kb.inView && kb.focus, JSON.stringify(kb));
    await page.keyboard.press("Escape"); await wait(220);
    const esc = await page.evaluate((s) => Number(getComputedStyle(document.querySelector(s).querySelector("td.truncate .tooltip")).opacity), W);
    ok("Esc hides the cut cell's Tooltip", esc === 0, JSON.stringify({ esc }));
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
  });
  await part("3 · 칸이 넓어져 다 보이면 풀고, 좁아지면 다시 단다 — 창 크기 변경으로 다시 잰다. 비활성 행 안에서는 Ta", async () => {

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
  });
  await part("4 · components/breadcrumb.html", async () => {

    /* ── Breadcrumb 의 잘린 항목 Tooltip 도 화면 글자와 같아 aria-hidden(두 번 읽히지 않게) ── */
    await go("components/breadcrumb.html"); await page.evaluate(() => document.fonts.ready); await wait(80);
    const bc = await page.evaluate(() => { const tips = [...document.querySelectorAll(".breadcrumb .tooltip-wrap > .tooltip")]; return { n: tips.length, hidden: tips.filter((t) => t.getAttribute("aria-hidden") === "true").length }; });
    ok("breadcrumb truncation Tooltips are hidden from assistive tech (same text as the label)", bc.n > 0 && bc.hidden === bc.n, JSON.stringify(bc));
  });
  await part("5 · components/number-input.html", async () => {

    /* ── 끈 컨트롤의 커서는 모두 not-allowed ── */
    await go("components/number-input.html");
    numCur = await page.evaluate(() => { const b = [...document.querySelectorAll(".example-preview .number-field .num-btn")].find((x) => x.disabled); return b ? getComputedStyle(b).cursor : "none"; });
  });
  await part("6 · components/file-upload.html", async () => {
    await go("components/file-upload.html");
    const upCur = await page.evaluate(() => { const z = document.querySelector(".example-preview .upload.disabled .upload-zone"); return z ? getComputedStyle(z).cursor : "none"; });
    ok("a disabled step button and a disabled upload zone show the not-allowed cursor like every other disabled control", numCur === "not-allowed" && upCur === "not-allowed", JSON.stringify({ numCur, upCur }));
  });
  await part("7 · components/data-table.html", async () => {

    /* ── 액션 바의 선택 건수 = 진한 중립(표 안의 brand 를 덜며 남은 것) ── */
    await go("components/data-table.html");
    const want = await tok("--foreground-neutral-primary"), brand = await tok("--foreground-brand-primary");
    const bar = await page.evaluate(() => { const b = document.querySelector(".example-preview .action-bar b"); const c = getComputedStyle(b); return { color: c.color, weight: c.fontWeight }; });
    ok("the action bar count is dark neutral and bold, not brand", bar.color === want && bar.color !== brand && Number(bar.weight) >= 700, JSON.stringify({ bar, want }));
  });
  await part("8 · patterns/log-viewer.html", async () => {

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
  });
  await part("9 · compact 행의 아이콘 동작은 28 이고 칸 패딩 5 — 행이 40(다른 compact 행과 같음), 버", async () => {

    /* compact 행의 아이콘 동작은 28 이고 칸 패딩 5 — 행이 40(다른 compact 행과 같음), 버튼은 칸 가운데.
       2026-11-15 로그 뷰어가 행 펼침으로 바뀌어 compact + 아이콘 동작 예제가 없다 — Data Table '행 동작' 표에 compact 를 붙여 잰다(제품이 그렇게 쓸 수 있음) */
    await go("components/data-table.html");
    const cp = await page.evaluate(() => { const t = document.querySelector("#ex-data-table-row-actions table.tbl"); t.classList.add("compact"); const tr = [...t.querySelectorAll("tbody tr")].find((x) => x.querySelector("td.actions .btn")), td = tr.querySelector("td.actions"), b = td.querySelector(".btn"), r = b.getBoundingClientRect(), tr_ = td.getBoundingClientRect();
      return { row: Math.round(tr.getBoundingClientRect().height), btn: [b.offsetWidth, b.offsetHeight], svg: Math.round(b.querySelector("svg").getBoundingClientRect().width), top: Math.round(r.top - tr_.top), bottom: Math.round(tr_.bottom - r.bottom) }; });
    ok("compact row icon actions are 28 so the row stays 40, centred in the cell", cp.row === 40 && cp.btn.join() === "28,28" && cp.svg === 16 && Math.abs(cp.top - cp.bottom) <= 1, JSON.stringify(cp));
  });
  await part("10 · components/chip.html", async () => {

    /* ── 입력값 칩의 긴 값 — 잘린 값에만 Tooltip, title 없음 ── */
    await go("components/chip.html"); await page.evaluate(() => document.fonts.ready); await wait(50); await away();
    const chip = await page.evaluate(() => { const ls = [...document.querySelectorAll(".example-preview .chip .lbl")];
      const cut = ls.filter((l) => l.scrollWidth > l.clientWidth), tipped = ls.filter((l) => l.parentElement.classList.contains("tooltip-wrap"));
      const tip = tipped[0] && tipped[0].parentElement.querySelector(".tooltip");
      return { n: ls.length, cut: cut.length, tipped: tipped.length, same: cut.every((l) => tipped.includes(l)), titles: document.querySelectorAll(".example-preview .chip [title]").length, text: tip && tip.textContent === tipped[0].textContent, hidden: tip && tip.getAttribute("aria-hidden"), h: tipped[0] && tipped[0].closest(".chip").offsetHeight }; });
    ok("only a cut chip value gets a Tooltip (aria-hidden, same text), no title, and the chip keeps its height", chip.n > 1 && chip.cut > 0 && chip.tipped === chip.cut && chip.same && chip.titles === 0 && chip.text && chip.hidden === "true" && chip.h === 32, JSON.stringify(chip));
    { const l = page.locator("#ex-chip-long .tooltip-wrap > .lbl").first(); await l.scrollIntoViewIfNeeded(); await wait(150); await l.hover(); await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("#ex-chip-long .tooltip-wrap > .tooltip")).opacity) === 1, null, { timeout: 1500 }).catch(() => {}); }   // 스크롤이 띄운 툴팁을 숨기므로(기존 규칙) 먼저 보이게 한 뒤 올린다
    const chipHover = await page.evaluate(() => { const tip = document.querySelector("#ex-chip-long .tooltip-wrap > .tooltip"), r = tip.getBoundingClientRect(); return { op: Number(getComputedStyle(tip).opacity), inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 }; });
    ok("hovering a cut chip value shows its Tooltip", chipHover.op === 1 && chipHover.inView, JSON.stringify(chipHover));
    await away();
  });
  await part("11 · components/data-table.html", async () => {

    /* 세 밀도 모두 행 동작 아이콘 버튼이 있는 행 = 없는 행 높이(48 · 40 · 56), 버튼은 칸 가운데 */
    await go("components/data-table.html");
    const dens = await page.evaluate(() => { const host = document.querySelector("#ex-data-table-sticky .example-preview"), out = {};
      for (const d of ["", "compact", "relaxed"]) { const box = document.createElement("div");
        box.innerHTML = `<div class="tbl-wrap"><table class="tbl ${d}"><thead><tr><th>이름</th><th class="actions"></th></tr></thead><tbody><tr><td>정책 A</td><td class="actions"><button type="button" class="btn sm assistive icon-only" aria-label="정책 A 더 보기"><svg width="16" height="16"></svg></button></td></tr><tr><td>정책 B</td><td>-</td></tr></tbody></table></div>`;
        host.append(box); const rows = box.querySelectorAll("tbody tr"), btn = box.querySelector(".btn"), r = btn.getBoundingClientRect(), t = btn.parentElement.getBoundingClientRect();
        out[d || "default"] = [Math.round(rows[0].getBoundingClientRect().height), Math.round(rows[1].getBoundingClientRect().height), btn.offsetHeight, Math.round(r.top - t.top) - Math.round(t.bottom - r.bottom)]; box.remove(); }
      return out; });
    ok("a row with an icon action keeps its density height (48 · 40 · 56) with the button centred", JSON.stringify(dens) === JSON.stringify({ default: [48, 48, 32, 0], compact: [40, 40, 28, 0], relaxed: [56, 56, 32, 0] }), JSON.stringify(dens));
  });
};
