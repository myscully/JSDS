/* Tree(2026-11-14 사람의 결정: 탐색형 기본 + 체크박스 옵션 · 펼칠 때 불러오기는 상태만 · 검색 필터 · 끌어 옮기기 없음) — behave.js 가 부른다.
   WAI-ARIA tree 의 키보드 · roving tabindex · 고르기와 펼치기를 나눔 · 체크 상태 계산 · 불러오기 · 검색 필터 · 모양(행 32 · 들여쓰기 20 · 고른 행 · 끈 항목) */
module.exports = async function tree({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const ex = (id) => `#ex-tree-${id} .example-preview`;
  const item = (id, label) => page.locator(`${ex(id)} .tree-item`).filter({ has: page.locator(`:scope > .tree-row > .tree-label`, { hasText: new RegExp(`^${label}$`) }) }).first();
  const active = () => page.evaluate(() => { const a = document.activeElement; const l = a && a.querySelector(":scope > .tree-row > .tree-label"); return l ? l.textContent : a && a.tagName; });
  const events = () => page.evaluate(() => { const out = window.__tr || []; window.__tr = []; return out; });
  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.tree", () => page);
  await part("1 · components/tree.html", async () => {
    await go("components/tree.html");
    await page.evaluate(() => { window.__tr = []; for (const n of ["ds:tree-select", "ds:tree-expand", "ds:tree-check", "ds:tree-load"]) document.addEventListener(n, (e) => window.__tr.push([n, { ...e.detail, resolve: undefined, reject: undefined }])); });
  });
  await part("2 · 처음 상태 — Tab 칸 하나(고른 항목), 접힌 하위는 숨김, 행 32 · 들여쓰기 단계마다 20 · 글자", async () => {

    /* 처음 상태 — Tab 칸 하나(고른 항목), 접힌 하위는 숨김, 행 32 · 들여쓰기 단계마다 20 · 글자 14/20 */
    const init = await page.evaluate((sel) => {
      const t = document.querySelector(`${sel} .tree`), items = [...t.querySelectorAll(".tree-item")], row = (l) => t.querySelector(`.tree-item[aria-level="${l}"] > .tree-row`);
      const pad = (l) => parseFloat(getComputedStyle(row(l)).paddingLeft), c = getComputedStyle(t.querySelector(".tree-label"));
      return { tabs: items.filter((x) => x.tabIndex === 0).map((x) => x.querySelector(".tree-label").textContent), hiddenOk: items.every((x) => { const g = x.querySelector(":scope > .tree-group"); return !g || g.hidden === (x.getAttribute("aria-expanded") !== "true"); }),
        h: Math.round(row(1).getBoundingClientRect().height * 10) / 10, step: [pad(2) - pad(1), pad(3) - pad(2)], text: `${parseFloat(c.fontSize)}/${parseFloat(c.lineHeight)}` };
    }, ex("default"));
    ok("tree starts with one Tab stop on the selected item, collapsed groups hidden, rows 32, indent 20 per level, text 14/20",
      init.tabs.length === 1 && init.tabs[0] === "관제 파트" && init.hiddenOk && init.h === 32 && init.step[0] === 20 && init.step[1] === 20 && init.text === "14/20", JSON.stringify(init));
  });
  await part("3 · 키보드 — ↓↑ 는 보이는 항목만, → 접힌 상위는 펼치고 펼친 상위는 첫 하위로, ← 펼친 상위는 접고 아", async () => {

    /* 키보드 — ↓↑ 는 보이는 항목만, → 접힌 상위는 펼치고 펼친 상위는 첫 하위로, ← 펼친 상위는 접고 아니면 상위로, Home · End, 글자로 찾기(초성), * 같은 단계 모두 펼침 */
    await item("default", "관제 파트").focus();
    const seq = [];
    for (const k of ["ArrowDown", "ArrowDown", "ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft", "ArrowLeft", "End", "Home"]) { await page.keyboard.press(k); await wait(30); seq.push([k, await active(), await item("default", "개발팀").getAttribute("aria-expanded")]); }
    ok("tree arrows: down skips nothing hidden, right expands then enters, left collapses then climbs, Home · End reach the ends",
      JSON.stringify(seq.map((s) => s[1])) === JSON.stringify(["대응 파트", "개발팀", "개발팀", "플랫폼 파트", "개발팀", "개발팀", "본사", "부산 지사", "본사"]) && seq[2][2] === "true" && seq[5][2] === "false", JSON.stringify(seq));
    const tabsNow = await page.locator(`${ex("default")} .tree-item[tabindex="0"]`).count();
    const type1 = (k) => page.evaluate((key) => document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })), k);   // 한글 낱자는 Playwright 키 이름이 없어 keydown 을 직접 보낸다(Select 단정과 같음)
    await type1("ㅂ"); await wait(30); const ta1 = await active(); await type1("ㅂ"); await wait(30); const ta2 = await active();
    await wait(600); await page.keyboard.press("Home"); await page.keyboard.press("*"); await wait(30);
    const star = await page.evaluate((sel) => [...document.querySelectorAll(`${sel} .tree > .tree-item`)].map((x) => x.getAttribute("aria-expanded")), ex("default"));
    ok("tree keeps one Tab stop as focus moves, typing jumps by first letter (Hangul initial too, repeat cycles), * expands every sibling",
      tabsNow === 1 && ta1 === "보안팀" && ta2 === "부산 지사" && star.every((x) => x === "true"), JSON.stringify({ tabsNow, ta1, ta2, star }));
  });
  await part("4 · 고르기와 펼치기를 나눔 — 행을 누르면 고르기만(펼침 그대로), 셰브론은 펼치기만, 포커스만 옮겨서는 고르지", async () => {

    /* 고르기와 펼치기를 나눔 — 행을 누르면 고르기만(펼침 그대로), 셰브론은 펼치기만, 포커스만 옮겨서는 고르지 않음, Enter · Space 로 고름 */
    await events();
    await item("default", "개발팀").locator(":scope > .tree-row > .tree-label").click(); await wait(50);
    const c1 = { sel: await item("default", "개발팀").getAttribute("aria-selected"), old: await item("default", "관제 파트").getAttribute("aria-selected"), exp: await item("default", "개발팀").getAttribute("aria-expanded") };
    await item("default", "개발팀").locator(":scope > .tree-row > .tree-toggle").click(); await wait(50);
    const c2 = { exp: await item("default", "개발팀").getAttribute("aria-expanded"), sel: await item("default", "개발팀").getAttribute("aria-selected") };
    await page.keyboard.press("ArrowDown"); await wait(30); const c3 = await item("default", "플랫폼 파트").getAttribute("aria-selected");
    await page.keyboard.press("Enter"); await wait(30); const c4 = await item("default", "플랫폼 파트").getAttribute("aria-selected");
    const ev1 = await events();
    ok("tree: clicking a row selects without expanding, the chevron expands without selecting, focus alone never selects, Enter selects; ds:tree-select · ds:tree-expand carry the value",
      c1.sel === "true" && c1.old === null && c1.exp === "false" && c2.exp === "true" && c2.sel === "true" && c3 === null && c4 === "true" &&
      ev1.filter((e) => e[0] === "ds:tree-select").map((e) => e[1].label).join() === "개발팀,플랫폼 파트" && ev1.some((e) => e[0] === "ds:tree-expand" && e[1].value === "개발팀" && e[1].expanded === true), JSON.stringify({ c1, c2, c3, c4, ev1 }));
  });
  await part("5 · 펼친 상위를 접으면 안에 있던 포커스가 상위로", async () => {
    /* 펼친 상위를 접으면 안에 있던 포커스가 상위로 */
    await item("default", "플랫폼 파트").focus(); await item("default", "개발팀").locator(":scope > .tree-row > .tree-toggle").click(); await wait(50);
    ok("tree: collapsing a parent moves focus out of its hidden children to the parent", await active() === "개발팀", await active());
    await item("default", "대응 파트").locator(":scope > .tree-row").click(); await wait(50);
  });
  await part("6 · 모양 — 고른 행 = 옅은 제품 면 + brand 글자 600, hover = tertiary, 포커스 외곽", async () => {

    /* 모양 — 고른 행 = 옅은 제품 면 + brand 글자 600, hover = tertiary, 포커스 외곽선은 행 안쪽 · 라이트 · 다크 */
    for (const t of [null, "dark"]) {
      await theme(t); await wait(300);
      const W = { face: await tok("--surface-brand-subtle"), fg: await tok("--foreground-brand-primary", "color"), hover: await tok("--surface-neutral-tertiary") };
      const look = (l) => item("default", l).locator(":scope > .tree-row").evaluate((r) => { const c = getComputedStyle(r); return { bg: c.backgroundColor, fg: c.color, w: c.fontWeight }; });
      const on = await look("대응 파트");
      await item("default", "경영지원팀").locator(":scope > .tree-row").hover(); await wait(150); const hv = await look("경영지원팀");
      await item("default", "대응 파트").locator(":scope > .tree-row").hover(); await wait(150); const onHv = await look("대응 파트");
      await page.mouse.move(2, 2);
      ok(`tree ${t || "light"}: the selected row is brand-subtle with brand text 600 and keeps it on hover; other rows hover tertiary`,
        on.bg === W.face && on.fg === W.fg && on.w === "600" && onHv.bg === W.face && hv.bg === W.hover, JSON.stringify({ on, onHv, hv, W }));
    }
    await theme(null);
    await item("default", "본사").focus(); await page.keyboard.press("ArrowDown"); await wait(30);
    const ring = await page.evaluate(() => { const r = document.activeElement.querySelector(":scope > .tree-row"), c = getComputedStyle(r), li = getComputedStyle(document.activeElement); return { o: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineOffset}`, li: li.outlineStyle }; });
    ok("tree: keyboard focus draws a 1px ring inside the row, never around the whole subtree", ring.o === "solid 1px -1px" && ring.li === "none", JSON.stringify(ring));
  });
  await part("7 · 체크박스형 — 처음 상위 상태는 하위에서, 상위를 켜면 하위가 따라가고, 하나를 끄면 상위가 mixed, S", async () => {

    /* 체크박스형 — 처음 상위 상태는 하위에서, 상위를 켜면 하위가 따라가고, 하나를 끄면 상위가 mixed, Space 로 켜고 끔, ds:tree-check 의 values 는 켜진 모든 항목 */
    const st = (l) => item("checkable", l).getAttribute("aria-checked");
    const s0 = [await st("전체 조직"), await st("본사"), await st("보안팀"), await st("개발팀")];
    await events();
    await item("checkable", "개발팀").locator(":scope > .tree-row").click(); await wait(50);
    const s1 = [await st("개발팀"), await st("플랫폼 파트"), await st("앱 파트"), await st("본사")];
    await item("checkable", "개발팀").locator(":scope > .tree-row > .tree-toggle").click(); await wait(50);
    await item("checkable", "앱 파트").focus(); await page.keyboard.press(" "); await wait(50);
    const s2 = [await st("앱 파트"), await st("개발팀"), await st("본사")];
    await item("checkable", "부산 지사").focus(); await page.keyboard.press("Space"); await wait(50);
    const s3 = [await st("부산 지사"), await st("영업팀"), await st("전체 조직")];
    const ev2 = (await events()).filter((e) => e[0] === "ds:tree-check"), last = ev2[ev2.length - 1];
    const exp2 = await item("checkable", "개발팀").getAttribute("aria-expanded");
    ok("tree checkbox: parents start from their children, a parent drives its children, one off makes the parent mixed, Space toggles, the chevron only expands",
      s0.join() === "mixed,mixed,true,false" && s1.join() === "true,true,true,true" && s2.join() === "false,mixed,mixed" && s3.join() === "true,true,mixed" && exp2 === "true", JSON.stringify({ s0, s1, s2, s3 }));
    ok("tree checkbox: ds:tree-check carries the value, the new state and every checked value (parents included)",
      ev2.length === 3 && last[1].value === "부산 지사" && last[1].checked === true && ["부산 지사", "영업팀", "기술지원팀", "보안팀", "관제 파트"].every((v) => last[1].values.includes(v)) && !last[1].values.includes("본사"), JSON.stringify(last));
    const chkLook = await item("checkable", "보안팀").locator(":scope > .tree-row > .tree-check").evaluate((b) => { const c = getComputedStyle(b), a = getComputedStyle(b, "::after"); return { bg: c.backgroundColor, w: b.getBoundingClientRect().width, mark: a.content !== "none" }; });
    ok("tree checkbox box is 16 with the brand face and a mark when checked", chkLook.w === 16 && chkLook.bg === await tok("--surface-brand-primary") && chkLook.mark, JSON.stringify(chkLook));
  });
  await part("8 · 끈 항목 — 포커스는 받지만 고르거나 켤 수 없고, 상위를 켜도 그대로라 상위가 mixed, 다시 누르면 꺼", async () => {

    /* 끈 항목 — 포커스는 받지만 고르거나 켤 수 없고, 상위를 켜도 그대로라 상위가 mixed, 다시 누르면 꺼짐. 글자 disable · 이유는 tertiary · not-allowed */
    const ds = (l) => item("disabled", l).getAttribute("aria-checked");
    await item("disabled", "외부 협력사").locator(":scope > .tree-row").click(); await wait(50);
    const d0 = [await ds("외부 협력사"), await active()];
    await item("disabled", "본사").locator(":scope > .tree-row").click(); await wait(50); const d1 = [await ds("본사"), await ds("개발팀"), await ds("외부 협력사")];
    await item("disabled", "본사").locator(":scope > .tree-row").click(); await wait(50); const d2 = [await ds("본사"), await ds("보안팀")];
    const dLook = await item("disabled", "외부 협력사").locator(":scope > .tree-row").evaluate((r) => ({ fg: getComputedStyle(r).color, cur: getComputedStyle(r).cursor, meta: getComputedStyle(r.querySelector(".tree-meta")).color }));
    await item("disabled", "외부 협력사").locator(":scope > .tree-row").hover(); await wait(100);
    const dHv = await item("disabled", "외부 협력사").locator(":scope > .tree-row").evaluate((r) => getComputedStyle(r).backgroundColor); await page.mouse.move(2, 2);
    ok("tree disabled: takes focus but not the check, a parent leaves it alone and stays mixed, pressing that parent again clears it",
      d0[0] === "false" && d0[1] === "외부 협력사" && d1.join() === "mixed,true,false" && d2.join() === "false,false", JSON.stringify({ d0, d1, d2 }));
    ok("tree disabled look: disable text, tertiary reason, not-allowed cursor, no hover face",
      dLook.fg === await tok("--foreground-disable-primary", "color") && dLook.meta === await tok("--foreground-neutral-tertiary", "color") && dLook.cur === "not-allowed" && dHv === "rgba(0, 0, 0, 0)", JSON.stringify({ dLook, dHv }));
  });
  await part("9 · 불러오기 — 펼치면 ds:tree-load, 그동안 aria-busy · 스피너(셰브론 숨김) · 다시 눌러", async () => {

    /* 불러오기 — 펼치면 ds:tree-load, 그동안 aria-busy · 스피너(셰브론 숨김) · 다시 눌러도 한 번, resolve 면 하위가 다음 단계로, reject 면 접힌 채 줄 끝 오류 · 알림 · 다시 펼치면 다시 부름 */
    await events();
    const seoul = item("lazy", "본사 IDC");
    await seoul.focus(); await page.keyboard.press("*"); await wait(100);   // * 는 불러와야 하는 항목을 건너뛴다(한꺼번에 조회하지 않게)
    const starL = { loads: (await events()).filter((e) => e[0] === "ds:tree-load").length, busy: await seoul.getAttribute("aria-busy"), exp: await seoul.getAttribute("aria-expanded") };
    await seoul.locator(":scope > .tree-row > .tree-toggle").click(); await wait(100);
    await seoul.locator(":scope > .tree-row > .tree-toggle").click(); await wait(50);
    const busy = await seoul.evaluate((li) => ({ busy: li.getAttribute("aria-busy"), exp: li.getAttribute("aria-expanded"), spin: !!li.querySelector(".tree-toggle .spinner"), chev: getComputedStyle(li.querySelector(".tree-toggle svg")).display }));
    await wait(1000);
    const done = await seoul.evaluate((li) => ({ busy: li.getAttribute("aria-busy"), exp: li.getAttribute("aria-expanded"), lazy: li.hasAttribute("data-lazy"), spin: !!li.querySelector(".tree-toggle .spinner"), kids: [...li.querySelectorAll(":scope > .tree-group > .tree-item")].map((k) => k.getAttribute("aria-level") + k.textContent) }));
    const loads = (await events()).filter((e) => e[0] === "ds:tree-load");
    ok("tree lazy: * leaves lazy items alone; expanding fires ds:tree-load once, shows a spinner in the chevron's place with aria-busy, then renders the children one level down",
      starL.loads === 0 && starL.busy === null && starL.exp === "false" && loads.length === 1 && loads[0][1].value === "idc-seoul" && busy.busy === "true" && busy.exp === "false" && busy.spin && busy.chev === "none" &&
      done.busy === null && done.exp === "true" && !done.lazy && !done.spin && done.kids.join() === "2WEB-01,2DB-01", JSON.stringify({ starL, busy, done, loads }));
    await page.keyboard.press("ArrowDown"); await wait(30); const intoKids = await active();
    const busan = item("lazy", "부산 IDC");
    await busan.locator(":scope > .tree-row > .tree-toggle").click(); await wait(1100);
    const fail = await busan.evaluate((li) => ({ busy: li.getAttribute("aria-busy"), exp: li.getAttribute("aria-expanded"), lazy: li.hasAttribute("data-lazy"), err: (li.querySelector(".tree-meta.error") || {}).textContent, live: document.querySelector("body > .ds-live").textContent }));
    await busan.locator(":scope > .tree-row > .tree-toggle").click(); await wait(100);
    const retry = await busan.evaluate((li) => ({ busy: li.getAttribute("aria-busy"), err: !!li.querySelector(".tree-meta.error") }));
    ok("tree lazy failure: stays collapsed and lazy, says so at the row end and to screen readers; expanding again retries and clears the error",
      fail.busy === null && fail.exp === "false" && fail.lazy && fail.err === "불러오지 못했습니다. 다시 펼치세요" && /부산 IDC 하위 항목을 불러오지 못했습니다/.test(fail.live) && retry.busy === "true" && !retry.err && intoKids === "WEB-01", JSON.stringify({ fail, retry, intoKids }));
    await wait(1000);
  });
  await part("10 · 검색 — 맞는 항목과 상위만 남기고 펼침 · 맞는 글자 굵게 · 결과 수 알림 · 초성 · 없으면 안내 · ", async () => {

    /* 검색 — 맞는 항목과 상위만 남기고 펼침 · 맞는 글자 굵게 · 결과 수 알림 · 초성 · 없으면 안내 · 검색칸 ↓ 는 첫 항목 · 지우면 검색 전 펼침으로 */
    const inp = page.locator(`${ex("search")} input`);
    const vis = () => page.evaluate((sel) => { const t = document.querySelector(`${sel} .tree`); return [...t.querySelectorAll(".tree-item")].filter((li) => { for (let p = li; p && p !== t; p = p.parentElement) if (p.hidden) return false; return true; }).map((li) => li.querySelector(":scope > .tree-row > .tree-label").textContent); }, ex("search"));
    const before = await vis();
    await inp.fill("pc"); await wait(150);
    const f1 = { vis: await vis(), hits: await page.locator(`${ex("search")} mark.tree-hit`).allTextContents(), w: await page.locator(`${ex("search")} mark.tree-hit`).first().evaluate((m) => getComputedStyle(m).fontWeight), live: await page.evaluate(() => document.querySelector("body > .ds-live").textContent) };
    await wait(100); const live1 = await page.evaluate(() => document.querySelector("body > .ds-live").textContent);
    await page.keyboard.press("ArrowDown"); await wait(30); const first = await active();
    await inp.fill("ㄷ"); await wait(150); const f2 = await vis();
    await inp.fill("없는이름"); await wait(150); const f3 = { vis: await vis(), empty: await page.locator(`${ex("search")} .tree-empty:not([hidden])`).count() };
    await inp.fill(""); await wait(150); const f4 = { vis: await vis(), empty: await page.locator(`${ex("search")} .tree-empty:not([hidden])`).count(), marks: await page.locator(`${ex("search")} mark`).count() };
    ok("tree search keeps matches and their ancestors expanded, bolds the matched text, announces the count, and ↓ from the box enters the tree",
      JSON.stringify(f1.vis) === JSON.stringify(["단말", "본사 PC", "보안팀 PC", "개발팀 PC", "지사 PC"]) && f1.hits.join() === "PC,PC,PC,PC" && f1.w === "700" && live1 === "결과 4개" && first === "단말", JSON.stringify({ f1, live1, first }));
    ok("tree search matches Hangul initials, shows the empty note when nothing matches, and clearing restores the pre-search expansion",
      JSON.stringify(f2) === JSON.stringify(["단말"]) && f3.vis.length === 0 && f3.empty === 1 && f4.empty === 0 && f4.marks === 0 && JSON.stringify(f4.vis) === JSON.stringify(before), JSON.stringify({ f2, f3, f4, before }));
  });
};
