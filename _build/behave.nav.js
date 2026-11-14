/* 탐색 · 표시 동작 검사(2026-11-10) — Tab · Navigation · Top Navigation · Tag · Steps. behave.js 가 부른다 */
module.exports = async function nav({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const active = () => page.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, cls: a.className, text: a.textContent.trim().slice(0, 30), id: a.id }; });

  /* ── Tab ── */
  await go("components/tab.html");
  const under = page.locator("#ex-tab-underline .tabs");
  ok("only the selected tab is a tab stop", await under.evaluate((b) => { const t = [...b.querySelectorAll(".tab")]; return t.filter((x) => x.tabIndex === 0).length === 1 && t.find((x) => x.tabIndex === 0).classList.contains("on"); }));
  await under.locator(".tab.on").focus(); await page.keyboard.press("Tab");
  const afterTab = await active();
  ok("Tab from the selected tab goes to its panel, not the next tab", /tab-panel/.test(afterTab.cls), JSON.stringify(afterTab));
  await page.evaluate(() => { window.__tab = []; document.addEventListener("ds:tab", (e) => window.__tab.push(e.target.textContent.trim())); });
  await under.locator(".tab.on").focus(); await page.keyboard.press("ArrowRight"); await wait(30);
  const kb = await page.evaluate(() => ({ text: document.querySelector("#ex-tab-underline .tab-panel").textContent, ev: window.__tab, named: document.querySelector("#ex-tab-underline .tab-panel").getAttribute("aria-labelledby") === document.querySelector("#ex-tab-underline .tab.on").id }));
  ok("arrow keys change the panel and fire ds:tab like a click", /이벤트 탭의 내용/.test(kb.text) && kb.ev.length === 1 && kb.ev[0] === "이벤트" && kb.named, JSON.stringify(kb));

  const over = page.locator("#ex-tab-overflow .tabs");
  await over.scrollIntoViewIfNeeded();
  const ov = await over.evaluate((b) => { const c = getComputedStyle(b), t = [...b.querySelectorAll(".tab")]; return { scrolls: b.scrollWidth > b.clientWidth, x: c.overflowX, full: t.every((x) => x.scrollWidth <= x.clientWidth), oneLine: new Set(t.map((x) => Math.round(x.getBoundingClientRect().top))).size === 1, h: Math.round(b.getBoundingClientRect().height), pageScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth }; });
  ok("too many tabs scroll in their own row on one line, none squeezed", ov.scrolls && ov.x === "auto" && ov.full && ov.oneLine && ov.pageScroll, JSON.stringify(ov));
  const h1 = await page.locator("#ex-tab-default .tabs").evaluate((b) => Math.round(b.getBoundingClientRect().height * 10) / 10);
  ok("the tab row is 44 high and overflow does not change it", h1 === 44 && ov.h === 44, JSON.stringify([h1, ov.h]));
  const look = await page.locator("#ex-tab-default .tabs").evaluate((b) => { const on = b.querySelector(".tab.on"), r = on.getBoundingClientRect(), br = b.getBoundingClientRect(), c = getComputedStyle(on), s = getComputedStyle(b), d = document.createElement("div"); d.style.color = "var(--line-neutral-secondary)"; document.body.append(d); const line = getComputedStyle(d).color; d.remove(); return { flush: Math.abs(r.bottom - br.bottom) <= 0.5, w: c.borderBottomWidth, shadow: s.boxShadow, line, border: s.borderBottomWidth, vscroll: b.scrollHeight <= b.clientHeight }; });
  ok("the selected tab's 2px underline sits on the row's 1px line, nothing clipped", look.flush && look.w === "2px" && look.border === "0px" && look.shadow.includes(look.line) && /inset/.test(look.shadow) && look.vscroll, JSON.stringify(look));
  await over.locator(".tab.on").focus(); const sy = await page.evaluate(() => scrollY);
  await page.keyboard.press("End"); await wait(30);
  const end = await over.evaluate((b) => { const t = b.querySelector(".tab.on"), r = t.getBoundingClientRect(), br = b.getBoundingClientRect(); return { last: t === b.querySelector(".tab:last-child"), inside: r.right <= br.right + 0.5 && r.left >= br.left - 0.5, left: b.scrollLeft }; });
  const endY = await page.evaluate(() => scrollY);
  ok("moving to a hidden tab brings it into the row without moving the page", end.last && end.inside && end.left > 0 && endY === sy, JSON.stringify([end, sy, endY]));
  await page.keyboard.press("Home"); await wait(30);
  ok("Home brings the row back to its start", (await over.evaluate((b) => b.scrollLeft)) === 0);
  await over.evaluate((b) => { b.scrollLeft = 9999; }); await over.locator(".tab").nth(0).evaluate((t) => t.click()); await wait(30);
  ok("clicking a tab outside the row brings it back", (await over.evaluate((b) => { const r = b.querySelector(".tab.on").getBoundingClientRect(), br = b.getBoundingClientRect(); return r.left >= br.left - 0.5 && r.right <= br.right + 0.5; })));
  await over.evaluate((b) => { b.scrollLeft = 0; }); await over.locator(".tab").last().evaluate((t) => t.click()); await wait(30);
  ok("clicking a tab past the right edge brings it in", (await over.evaluate((b) => { const r = b.querySelector(".tab.on").getBoundingClientRect(), br = b.getBoundingClientRect(); return b.scrollLeft > 0 && r.right <= br.right + 0.5; })));
  await over.locator(".tab").nth(0).evaluate((t) => t.click()); await wait(30);
  await over.locator(".tab.on").focus(); await page.keyboard.press("ArrowRight"); await wait(20);
  const ring = await over.evaluate((b) => { const c = getComputedStyle(b.querySelector(".tab.on")); return { off: c.outlineOffset, w: c.outlineWidth }; });
  ok("the keyboard ring is drawn inside the scrolling row", ring.off === "-2px" && ring.w === "1px", JSON.stringify(ring));
  const pill = await page.locator("#ex-tab-pill .tabs").evaluate((b) => { const c = getComputedStyle(b); return { shadow: c.boxShadow, h: Math.round(b.getBoundingClientRect().height), max: c.maxWidth, flush: b.scrollHeight <= b.clientHeight }; });
  ok("pill tabs have no underline row and do not outgrow their parent", pill.shadow === "none" && pill.max === "100%" && pill.flush, JSON.stringify(pill));

  const pa = page.locator("#ex-tab-panels");
  await pa.locator("#tp-name").fill("외부 USB 차단");
  await pa.locator("#tp-tab-b").click(); await wait(20);
  const swapped = await pa.evaluate((e) => ({ a: e.querySelector("#tp-panel-a").hidden, b: e.querySelector("#tp-panel-b").hidden, kept: !!e.querySelector("#tp-name"), tab: e.querySelector("#tp-panel-b").tabIndex }));
  await pa.locator("#tp-tab-a").click(); await wait(20);
  ok("linked panels are only hidden, so typed input survives a tab change", swapped.a && !swapped.b && swapped.kept && swapped.tab === 0 && (await pa.locator("#tp-name").inputValue()) === "외부 USB 차단", JSON.stringify(swapped));
  ok("linked panels keep their content instead of the demo text", !/탭의 내용이/.test(await pa.textContent()));

  /* ── Navigation ── */
  await go("components/navigation.html");
  const rail = page.locator("#ex-navigation-collapsed .sidenav");
  const railInfo = await rail.evaluate((n) => { const a = [...n.querySelectorAll("a")], first = a[0].getBoundingClientRect(), svg = a[0].querySelector("svg").getBoundingClientRect(); return { titles: a.filter((x) => x.title).length, names: a.map((x) => x.getAttribute("aria-label")).join(), w: Math.round(n.getBoundingClientRect().width), aw: Math.round(first.width), centred: Math.abs((svg.left + svg.right) / 2 - (first.left + first.right) / 2) <= 0.5, h: Math.round(first.height) }; });
  ok("collapsed rail names items without title, with the same 64 rail and centred icons", railInfo.titles === 0 && railInfo.names === "대시보드,이벤트,정책,에이전트,설정" && railInfo.w === 64 && railInfo.aw === 42 && railInfo.centred, JSON.stringify(railInfo));
  await rail.locator("a").nth(1).focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(900);
  const railTip = await rail.evaluate((n) => { const w = n.querySelectorAll(".tooltip-wrap")[1], t = w.querySelector(".tooltip"), a = w.querySelector("a").getBoundingClientRect(), r = t.getBoundingClientRect(), s = document.activeElement; return { op: getComputedStyle(t).opacity, text: t.textContent, right: r.left >= a.right, focus: s === w.querySelector("a") }; });
  ok("a collapsed item shows its name to keyboard users, beside the rail", railTip.op === "1" && railTip.text === "이벤트" && railTip.right && railTip.focus, JSON.stringify(railTip));
  await page.evaluate(() => document.activeElement.blur());
  await rail.locator("a").nth(3).hover(); await wait(650);
  ok("a collapsed item shows its name on hover too", (await rail.evaluate((n) => getComputedStyle(n.querySelectorAll(".tooltip")[3]).opacity)) === "1");
  await page.mouse.move(4, 500);
  const openRail = await page.locator("#ex-navigation-basic .sidenav").evaluate((n) => ({ tips: n.querySelectorAll(".tooltip").length, w: Math.round(n.getBoundingClientRect().width) }));
  ok("an expanded rail has no tooltips", openRail.tips === 0 && openRail.w === 240, JSON.stringify(openRail));
  await page.locator("#ex-navigation-collapsed .sidenav").evaluate((n) => { n.classList.remove("collapsed"); });
  const expanded = await rail.evaluate((n) => { const t = n.querySelector(".tooltip"), a = n.querySelector("a"); return { d: getComputedStyle(t).display, w: Math.round(a.getBoundingClientRect().width) }; });
  await page.locator("#ex-navigation-collapsed .sidenav").evaluate((n) => { n.classList.add("collapsed"); });
  ok("a rail expanded in place hides its tooltips and fills the row", expanded.d === "none" && expanded.w === 214, JSON.stringify(expanded));

  const shown = await page.locator("#ex-navigation-skip .skip-link").evaluate((a) => { const r = a.getBoundingClientRect(), p = a.parentElement.getBoundingClientRect(); return { in: r.top >= p.top && r.bottom <= p.bottom }; });
  ok("the skip link example shows it pinned inside its box", shown.in, JSON.stringify(shown));
  await go("components/navigation.html"); await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement.blur(); });
  const hiddenSkip = await page.locator("body > .skip-link").evaluate((a) => a.getBoundingClientRect().bottom);
  await page.keyboard.press("Tab"); await wait(30);
  const sk = await page.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return { first: a.matches("body > .skip-link"), top: r.top, text: a.textContent }; });
  ok("every page's first tab stop is a skip link that appears on focus", hiddenSkip <= 0 && sk.first && sk.top >= 0 && sk.text === "본문 바로가기", JSON.stringify([hiddenSkip, sk]));
  await page.keyboard.press("Enter"); await wait(60); await page.keyboard.press("Tab"); await wait(30);
  ok("the skip link moves the next tab stop into the content", await page.evaluate(() => !!document.activeElement.closest("#content")), JSON.stringify(await active()));

  /* ── Top Navigation ── */
  await go("components/top-navigation.html");
  const bar = page.locator("#ex-top-navigation-basic .topbar");
  await bar.locator("button[aria-label=설정]").focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(260);
  const topTip = await bar.evaluate((b) => { const t = b.querySelector("button[aria-label=설정]").parentElement.querySelector(".tooltip"), r = t.getBoundingClientRect(), a = t.previousElementSibling.getBoundingClientRect(); return { op: getComputedStyle(t).opacity, below: r.top >= a.bottom, text: t.textContent }; });
  ok("top bar icon buttons show their name below on keyboard focus", topTip.op === "1" && topTip.below && topTip.text === "설정", JSON.stringify(topTip));
  const count = await bar.evaluate((b) => { const w = b.querySelector(".with-count").getBoundingClientRect(), c = b.querySelector(".with-count .count").getBoundingClientRect(), btn = b.querySelector(".with-count button").getBoundingClientRect(); return { top: Math.round(c.top - w.top), right: Math.round(c.right - w.right), same: Math.round(btn.width) === Math.round(w.width) }; });
  ok("the count badge keeps its corner around a tooltip-wrapped button", count.top === -6 && count.right === 6 && count.same, JSON.stringify(count));
  const userEx = page.locator("#ex-top-navigation-user");
  await userEx.locator(".topbar-user").click(); await wait(40);
  const um = await userEx.evaluate((e) => { const k = [...e.querySelector(".menu").children]; return { open: e.querySelector(".dropdown").classList.contains("open"), last: k[k.length - 1].textContent, sep: k[k.length - 2].classList.contains("menu-sep"), expanded: e.querySelector(".topbar-user").getAttribute("aria-expanded") }; });
  await page.keyboard.press("Escape"); await wait(30);
  const uf = await userEx.locator(".topbar-user").evaluate((b) => { const c = getComputedStyle(b), a = b.querySelector(".avatar").getBoundingClientRect(), r = b.getBoundingClientRect(); return { bg: c.backgroundColor, b: c.borderTopWidth, same: Math.round(r.width) === Math.round(a.width) && Math.round(r.height) === Math.round(a.height) }; });
  ok("the user button is just the avatar, with no button face", uf.bg === "rgba(0, 0, 0, 0)" && uf.b === "0px" && uf.same, JSON.stringify(uf));
  ok("user menu opens from the avatar, logout last after a separator, Esc returns", um.open && um.last === "로그아웃" && um.sep && um.expanded === "true" && (await active()).cls === "topbar-user", JSON.stringify(um));
  /* 좁은 자리 — 바가 내용 폭만큼 늘어 면 · 선이 내용 끝까지, 미리보기가 가로로 스크롤(2026-11-13). 넓은 자리에서는 폭을 채움 그대로 */
  const fitBar = () => page.evaluate(() => [...document.querySelectorAll(".example-preview .topbar")].map((b) => { const r = b.getBoundingClientRect(), k = [...b.children].map((c) => c.getBoundingClientRect().right), pv = b.closest(".example-preview"), ps = getComputedStyle(b.parentElement); return { id: b.closest(".example").id, inside: Math.max(...k) <= r.right + 0.5, fill: r.width >= b.parentElement.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight) - 0.5, scroll: pv.scrollWidth > pv.clientWidth, h: Math.abs(r.height - 3.5 * parseFloat(getComputedStyle(document.documentElement).fontSize)) <= 0.5 }; }));
  const wideBar = await fitBar();
  const vpN = page.viewportSize(); await page.setViewportSize({ width: 390, height: 900 }); await wait(120);
  const narrowBar = await fitBar(); await page.setViewportSize(vpN); await wait(120);
  ok("a top bar narrower than its content grows with it — face and line reach the last item, the preview scrolls; wide bars still fill", wideBar.every((x) => x.inside && x.fill && !x.scroll && x.h) && narrowBar.every((x) => x.inside && x.fill && x.h) && narrowBar.filter((x) => x.scroll).length === 2, JSON.stringify({ wideBar, narrowBar }));

  /* ── Tag ── */
  await go("components/tag.html");
  const sizes = await page.evaluate(() => [...document.querySelectorAll("#ex-tag-size .tag")].map((t) => Math.round(t.getBoundingClientRect().height)));
  ok("tag heights are 18 · 22 · 26 (Caption 1 16 line) with the new width rules", sizes.join() === "18,22,26", sizes.join());
  const fit = await page.evaluate(() => { const box = document.createElement("div"); box.style.cssText = "width:20px;display:flex"; box.innerHTML = '<span class="tag">검토 대기</span><span class="tag">승인</span>'; const cell = document.createElement("div"); cell.style.width = "20px"; cell.innerHTML = '<span class="tag">검토 대기</span>'; const lng = document.createElement("div"); lng.innerHTML = '<span class="tag">외부 협력사 전용 망 분리 예외 정책 대상 그룹 이름</span>'; document.querySelector("#content").append(box, cell, lng); const h = (e) => Math.round(e.querySelector(".tag").getBoundingClientRect().height), t = lng.querySelector(".tag"), r = { flex: h(box), cell: h(cell), longW: Math.round(t.getBoundingClientRect().width), longH: h(lng), whole: t.scrollWidth <= t.clientWidth && t.scrollHeight <= t.clientHeight, keep: getComputedStyle(t).wordBreak }; box.remove(); cell.remove(); lng.remove(); return r; });
  ok("short tags never wrap in tight spots; a long label stops at 160 and wraps whole", fit.flex === 22 && fit.cell === 22 && fit.longW === 160 && fit.longH > 22 && fit.whole && fit.keep === "keep-all", JSON.stringify(fit));
  const grp = await page.locator("#ex-tag-group .tag-group").evaluate((g) => { const t = [...g.querySelectorAll(".tag")]; return { rows: new Set(t.map((x) => Math.round(x.getBoundingClientRect().top))).size, inside: t.every((x) => x.getBoundingClientRect().right <= g.getBoundingClientRect().right + 0.5), n: t.length }; });
  ok("outside a table every tag shows and wraps", grp.rows > 1 && grp.inside && grp.n === 6, JSON.stringify(grp));
  const cell = page.locator("#ex-tag-table tbody tr").first();
  const rowInfo = await cell.evaluate((r) => { const g = r.querySelector(".tag-group"), t = [...g.querySelectorAll(".tag")]; return { wrap: getComputedStyle(g).flexWrap, line: new Set(t.map((x) => Math.round(x.getBoundingClientRect().top))).size, shown: g.querySelectorAll(":scope > .tag").length, more: g.querySelector(".tag-more").textContent, tag: g.querySelector(".tag-more").tagName, tab: g.querySelector(".tag-more").tabIndex, dot: getComputedStyle(g.querySelector(".tag-more"), "::before").display, cursor: getComputedStyle(g.querySelector(".tag-more")).cursor, h: Math.round(g.querySelector(".tag-more").getBoundingClientRect().height), sibling: Math.round(g.querySelector(":scope > .tag").getBoundingClientRect().height) }; });
  ok("a table cell keeps one line with two tags and a focusable +N of the same height", rowInfo.wrap === "nowrap" && rowInfo.line === 1 && rowInfo.shown === 2 && rowInfo.more === "+3" && rowInfo.tag === "BUTTON" && rowInfo.tab === 0 && rowInfo.dot === "none" && rowInfo.h === rowInfo.sibling && rowInfo.cursor === "default", JSON.stringify(rowInfo));
  await cell.locator(".tag-more").focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(900);
  const plus = await cell.evaluate((r) => { const t = r.querySelector(".tooltip"), b = t.getBoundingClientRect(); return { op: getComputedStyle(t).opacity, text: t.textContent, float: t.classList.contains("float"), vis: b.width > 0 && b.top >= 0, desc: r.querySelector(".tag-more").getAttribute("aria-describedby") === t.id, name: r.querySelector(".tag-more").getAttribute("aria-label") }; });
  ok("keyboard focus on +N reveals the hidden names, unclipped by the table", plus.op === "1" && plus.text === "외부 협력사, 서버실, 임원" && plus.float && plus.vis && plus.desc && plus.name === "분류 3개 더 보기", JSON.stringify(plus));
  const followed = await cell.evaluate(async (r) => { const t = r.querySelector(".tooltip"), b = r.querySelector(".tag-more"), a = t.getBoundingClientRect().top - b.getBoundingClientRect().top; document.documentElement.style.scrollBehavior = "auto"; window.scrollBy(0, 40); await new Promise((x) => setTimeout(x, 120)); document.documentElement.style.scrollBehavior = ""; return { before: Math.round(a), after: Math.round(t.getBoundingClientRect().top - b.getBoundingClientRect().top), op: getComputedStyle(t).opacity, quiet: t.parentNode.classList.contains("quiet") }; });
  ok("a tooltip reached by keyboard follows its trigger through scrolling", followed.before === followed.after && followed.op === "1" && !followed.quiet, JSON.stringify(followed));

  await cell.locator(".tag-more").focus(); await wait(30);
  await page.locator("h1").first().evaluate((h) => { h.tabIndex = -1; h.focus({ preventScroll: true }); }); await wait(30);
  await page.evaluate(() => window.dispatchEvent(new Event("scroll"))); await wait(30);
  await cell.locator(".tag-more").focus(); await wait(250);
  const again = await cell.evaluate((r) => ({ op: getComputedStyle(r.querySelector(".tooltip")).opacity, quiet: r.querySelector(".tooltip-wrap").classList.contains("quiet") }));
  ok("a scroll while nobody is on a floated tooltip does not silence it for the next visit", again.op === "1" && !again.quiet, JSON.stringify(again));

  /* ── Steps ── */
  await go("components/indicator.html");
  ok("Indicator no longer documents Steps as an example", (await page.locator("#ex-indicator-steps").count()) === 0);
  await go("components/steps.html");
  /* .stepper 밖의 .steps(표시 전용) — 이동은 제품, 완료 단계 누름만 ds:step(2026-11-13 — 상세에 from · trigger) */
  await page.evaluate(() => { window.__step = []; document.addEventListener("ds:step", (e) => window.__step.push(e.detail)); });
  const back = page.locator("#ex-steps-indicator .steps");
  await back.locator(".step-btn").nth(1).click(); await wait(20);
  const sev = await page.evaluate(() => window.__step);
  await back.locator(".step-btn").first().hover(); await wait(60);
  const hov = await page.evaluate(() => { const d = document.createElement("div"); d.style.color = "var(--foreground-neutral-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove(); return getComputedStyle(document.querySelector("#ex-steps-indicator .step-btn .label")).color === want; });
  await page.mouse.move(4, 500);
  ok("hovering a done step darkens its label", hov);
  ok("pressing a done step of a plain .steps fires ds:step and does not move it", JSON.stringify(sev) === '[{"index":1,"from":2,"trigger":"click"}]' && await page.evaluate(() => document.querySelectorAll("#ex-steps-indicator li")[2].classList.contains("on")), JSON.stringify(sev));
  const stepLook = await page.evaluate(() => { const a = document.querySelector("#ex-steps-indicator li.done"), b = document.querySelector("#ex-steps-indicator li.on"), btn = a.querySelector(".step-btn"), c = getComputedStyle(btn), f = (e) => Math.round(e.getBoundingClientRect().height); return { h: [f(a), f(b)], bg: c.backgroundColor, b: c.borderTopWidth, p: c.paddingLeft, gap: c.columnGap, fs: c.fontSize === getComputedStyle(a).fontSize, future: document.querySelectorAll("#ex-steps-indicator li:not(.done) button").length, ver: getComputedStyle(document.querySelector("#ex-steps-vertical .steps")).flexDirection, cur: document.querySelector("#ex-steps-default li.on").getAttribute("aria-current") }; });
  ok("a done step button looks the same as a static step; only done steps are buttons", stepLook.h[0] === stepLook.h[1] && stepLook.bg === "rgba(0, 0, 0, 0)" && stepLook.b === "0px" && stepLook.p === "0px" && stepLook.gap === "8px" && stepLook.fs && stepLook.future === 0, JSON.stringify(stepLook));
  ok("steps lie vertically with .vertical and mark the current step", stepLook.ver === "column" && stepLook.cur === "step", JSON.stringify(stepLook));
  const nav2 = await page.evaluate(() => !!document.querySelector('.nav a[href$="steps.html"]'));
  ok("Steps has its own page in the components menu", nav2);
};
