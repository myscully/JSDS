/* Date Picker · Calendar 동작 단정(2026-10-27) — behave.js 가 부른다.
   오늘을 2026-10-27 로 고정한 별도 컨텍스트에서 잰다(실제 날짜가 바뀌어도 같은 칸을 누르게).
   한 단정이 요소를 못 찾아도 나머지가 돌도록 step() 으로 감싼다 — 옛 코드에서 무엇이 실패하는지 끝까지 보이려고 */
module.exports = async ({ b, ok, SITE, path }) => {
  const NOW = new Date(2026, 9, 27, 10, 0, 0);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(NOW);
  page.setDefaultTimeout(2000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const go = async (p, pg = page) => { await pg.goto("file://" + path.join(SITE, p)); await pg.waitForTimeout(150); };
  const ex = (id) => `#ex-date-picker-${id} .example-preview`;
  const dpOf = (id, n = 0, pg = page) => pg.locator(`${ex(id)} .datepicker`).nth(n);
  /* 상단 고정 헤더에 가리지 않게, 아래로 펼칠 자리가 있게 필드를 화면 위쪽으로 */
  const toTop = (loc) => loc.evaluate((e) => { e.scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy(0, -140); });
  const day = (loc, k) => loc.locator(`.calendar .day[data-date="${k}"]:not(.muted)`);
  const listen = (pg = page) => pg.evaluate(() => { window.__dsd = []; document.addEventListener("ds:date", (e) => window.__dsd.push(e.detail)); });
  const events = (pg = page) => pg.evaluate(() => window.__dsd);
  /* 토큰의 계산 색 */
  const tok = (name, prop = "color") => page.evaluate(([n, p]) => { const d = document.createElement("div"); d.style[p] = `var(${n})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [name, prop]);

  await go("components/date-picker.html");

  // ── 오류 수정 ──────────────────────────────────────────────
  await step("range keeps its start across month navigation", async () => {
    const dp = dpOf("field", 1);
    await toTop(dp); await listen();
    await dp.locator(".field-btn").click();
    /* 시작은 다음 달 격자의 앞쪽 흐린 칸(9/27~30)에 들지 않는 날로 — 9/28 이면 옛 엔진도 흐린 칸의 .on 으로 우연히 맞았다 */
    await day(dp, "2026-09-10").click();
    await dp.locator('.calendar .cal-nav[data-nav="1"]').click();
    await day(dp, "2026-10-03").click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await dp.evaluate((e) => ({ text: e.querySelector(".field-btn").textContent.replace(/\s+/g, " ").trim(), sep: !!e.querySelector(".field-btn .sep"), start: e.dataset.start, end: e.dataset.end, open: e.classList.contains("open") }));
    ok("range keeps its start across month navigation", r.text === "2026-09-10 ~ 2026-10-03" && r.sep && r.start === "2026-09-10" && r.end === "2026-10-03" && !r.open, JSON.stringify(r));
    const ev = (await events()).pop() || {};
    ok("range ds:date carries both ends", ev.value === "2026-09-10 ~ 2026-10-03" && ev.start === "2026-09-10" && ev.end === "2026-10-03", JSON.stringify(ev));
  });
  await step("a full range keeps both ends after moving months", async () => {
    const dp = dpOf("field", 1);
    await dp.locator(".field-btn").click();
    await dp.locator('.calendar .cal-nav[data-nav="1"]').click();
    await dp.locator('.calendar .cal-nav[data-nav="-1"]').click();
    const r = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date), band: e.querySelectorAll(".day.in-range").length, end: e.dataset.end }));
    await dp.locator('.calendar .cal-nav[data-nav="1"]').click();
    const oct = await dp.evaluate((e) => [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date).join());
    /* 9월 화면: 시작 9/10 과 띠 9/11~9/30. 다른 달(흐린) 10/1~10/3 칸은 선택 · 띠를 칠하지 않는다(사람의 결정 2026-10-27) — 10월 화면에서 끝이 보인다 */
    ok("a full range keeps both ends after moving months", r.title === "2026년 9월" && r.on.join() === "2026-09-10" && r.band === 20 && r.end === "2026-10-03" && oct === "2026-10-03", JSON.stringify({ r, oct }));
    await page.keyboard.press("Escape");
  });
  await step("a preset that crosses a month commits both ends", async () => {
    const dp = dpOf("two-months");
    await toTop(dp); await listen();
    await dp.locator(".field-btn").click();
    await dp.locator('.calendar [data-preset="30"]').click();
    const r = await dp.evaluate((e) => ({ start: e.dataset.start, end: e.dataset.end, text: e.querySelector(".field-btn").textContent.replace(/\s+/g, " ").trim(), open: e.classList.contains("open") }));
    const ev = (await events()).pop() || {};
    ok("a preset that crosses a month commits both ends", r.start === "2026-09-28" && r.end === "2026-10-27" && r.text === "2026-09-28 ~ 2026-10-27" && !r.open && ev.start === "2026-09-28", JSON.stringify({ r, ev }));
  });
  await step("the static range calendar's preset marks the whole range", async () => {
    const rc = page.locator(`${ex("range")} .calendar`);
    await toTop(rc);
    await rc.locator('[data-preset="7"]').click();
    ok("the static range calendar's preset marks the whole range", await rc.evaluate((e) => e.querySelectorAll(".day.on").length === 2 && e.querySelectorAll(".day.in-range").length === 5 && e.dataset.start === "2026-09-01" && e.dataset.end === "2026-09-07"));
  });
  await step("a standalone range calendar selects a range", async () => {
    const rc = page.locator(`${ex("range")} .calendar`);
    await rc.locator('.day[data-date="2026-09-10"]').click();
    await rc.locator('.day[data-date="2026-09-15"]').click();
    const r = await rc.evaluate((e) => ({ on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date || d.textContent), band: e.querySelectorAll(".day.in-range").length }));
    ok("a standalone range calendar selects a range", r.on.join() === "2026-09-10,2026-09-15" && r.band === 4, JSON.stringify(r));
  });
  await step("Escape closes only this picker and returns focus to the field", async () => {
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await page.keyboard.press("Escape");
    const r = await dp.evaluate((e) => ({ open: e.classList.contains("open"), exp: e.querySelector(".field-btn").getAttribute("aria-expanded"), opened: e.hasAttribute("data-ds-opened"), focus: document.activeElement === e.querySelector(".field-btn") }));
    ok("Escape closes only this picker and returns focus to the field", !r.open && r.exp === "false" && !r.opened && r.focus, JSON.stringify(r));
  });
  await step("closing without apply discards the draft", async () => {
    const dp = dpOf("default");
    await dp.locator(".field-btn").click();
    await day(dp, "2026-10-10").click();
    await page.keyboard.press("Escape");
    await dp.locator(".field-btn").click();
    const r = await dp.evaluate((e) => ({ on: e.querySelectorAll(".calendar .day.on").length, value: e.dataset.value || null, ph: !!e.querySelector(".placeholder") }));
    ok("closing without apply discards the draft", r.on === 0 && !r.value && r.ph, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("a field written as end ~ start still draws the band", async () => {
    const r = await page.evaluate(() => {
      const box = document.querySelector("#ex-date-picker-default .example-preview"), d = document.createElement("div");
      d.className = "datepicker"; d.id = "dp-rev"; d.innerHTML = '<button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false">2026-09-07 <span class="sep">~</span> 2026-09-01</button>';
      box.append(d); d.querySelector(".field-btn").click();
      const out = { on: d.querySelectorAll(".day.on").length, band: d.querySelectorAll(".day.in-range").length };
      d.remove(); return out;
    });
    ok("a field written as end ~ start still draws the band", r.on === 2 && r.band === 5, JSON.stringify(r));
  });
  await step("a range in America/New_York keeps its dates", async () => {
    const c2 = await b.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: "America/New_York" });
    const p2 = await c2.newPage();
    await p2.clock.setFixedTime(NOW); p2.setDefaultTimeout(2000);
    await go("components/date-picker.html", p2); await listen(p2);
    const dp = dpOf("field", 1, p2);
    await dp.evaluate((e) => { e.scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy(0, -140); });
    await dp.locator(".field-btn").click();
    await dp.locator('.calendar .day[data-date="2026-09-10"]:not(.muted)').click();
    await dp.locator('.calendar .day[data-date="2026-09-15"]:not(.muted)').click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const ev = (await events(p2)).pop() || {};
    await c2.close();
    ok("a range in America/New_York keeps its dates", ev.value === "2026-09-10 ~ 2026-09-15", JSON.stringify(ev));
  });
  await step("the search toolbar date picker selects a range", async () => {
    await go("patterns/search.html");
    const dp = page.locator(".example-preview .datepicker").first();
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await day(dp, "2026-10-05").click();
    await day(dp, "2026-10-09").click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const t = await dp.evaluate((e) => e.querySelector(".field-btn").textContent.replace(/\s+/g, " ").trim());
    ok("the search toolbar date picker selects a range", t === "2026-10-05 ~ 2026-10-09", t);
    await go("components/date-picker.html");
  });
  await step("the calendar flips above the field near the viewport bottom", async () => {
    const dp = dpOf("field", 0);
    await dp.evaluate((e) => { e.scrollIntoView({ block: "end", behavior: "instant" }); window.scrollBy(0, 20); });
    await dp.locator(".field-btn").click();
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar").getBoundingClientRect(), f = e.querySelector(".field-btn").getBoundingClientRect(); return { up: e.classList.contains("up"), gap: Math.round(f.top - c.bottom), top: Math.round(c.top) }; });
    ok("the calendar flips above the field near the viewport bottom", r.up && Math.abs(r.gap - 4) <= 1 && r.top >= 0, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("an open calendar is not clipped by the example section", async () => {
    const dp = dpOf("field", 0);
    await toTop(dp);
    await dp.locator(".field-btn").click();
    const r = await dp.evaluate((e) => { const cal = e.querySelector(".calendar"), c = cal.getBoundingClientRect(), p = e.closest(".example").getBoundingClientRect(); return { below: c.bottom > p.bottom, vis: getComputedStyle(e.closest(".example")).overflow, hit: document.elementFromPoint(c.left + 20, c.bottom - 20)?.closest(".calendar") === cal }; });
    ok("an open calendar is not clipped by the example section", r.below && r.vis === "visible" && r.hit, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("the calendar opens 4px under the input box, not under its help text", async () => {
    const dp = dpOf("input", 0);
    await toTop(dp);
    await dp.locator(".cal-btn").click();
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar").getBoundingClientRect(), a = e.querySelector(".affix").getBoundingClientRect(); return { gap: Math.round(c.top - a.bottom), open: e.classList.contains("open") }; });
    ok("the calendar opens 4px under the input box, not under its help text", r.open && Math.abs(r.gap - 4) <= 1, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("days after data-max are disabled and do nothing", async () => {
    const dp = dpOf("two-months");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    const cell = dp.locator('.calendar .day[data-date="2026-10-28"]');
    await cell.click({ force: true });
    const r = await dp.evaluate((e) => ({ dis: e.querySelector('.day[data-date="2026-10-28"]').getAttribute("aria-disabled"), dis27: e.querySelector('.day[data-date="2026-10-27"]').getAttribute("aria-disabled"), on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date) }));
    ok("days after data-max are disabled and do nothing", r.dis === "true" && r.dis27 === null && !r.on.includes("2026-10-28"), JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("the popover is a named modal dialog with a date grid", async () => {
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar"), sel = [...c.querySelectorAll("[aria-selected]")]; return { role: c.getAttribute("role"), modal: c.getAttribute("aria-modal"), name: c.getAttribute("aria-label"), grid: c.querySelector(".cal-grid").getAttribute("role"), cells: sel.every((x) => x.getAttribute("role") === "gridcell"), label: c.querySelector('.day[data-date="2026-10-27"]').getAttribute("aria-label"), cur: c.querySelector('.day[data-date="2026-10-27"]').getAttribute("aria-current") }; });
    const snap = await dp.locator(".calendar .cal-grid").ariaSnapshot();
    ok("the popover is a named modal dialog with a date grid", r.role === "dialog" && r.modal === "true" && r.name === "날짜 선택" && r.grid === "grid" && r.cells && r.label === "2026년 10월 27일 화요일" && r.cur === "date" && /- row/.test(snap) && /- gridcell "2026년 10월 27일 화요일"/.test(snap), JSON.stringify(r) + " " + snap.slice(0, 120));
    await page.keyboard.press("Escape");
    ok("a static demo calendar is a group, not a modal", await page.locator(`${ex("calendar")} .calendar`).evaluate((c) => c.getAttribute("role") === "group" && !c.hasAttribute("aria-modal")));
  });
  await step("the static calendar is the same markup ds.js renders", async () => {
    const c = page.locator(`${ex("calendar")} .calendar`);
    const shape = () => c.evaluate((e) => [...e.querySelectorAll("*")].filter((x) => !x.closest("svg")).map((x) => [x.tagName, [...x.classList].sort().join("."), ...["role", "data-date", "tabindex", "aria-label", "aria-selected", "aria-current", "aria-disabled", "data-nav", "data-cal", "aria-live"].map((a) => x.getAttribute(a))].join("|")).join("\n"));
    const before = await shape();
    await toTop(c);
    await c.locator('.cal-nav[data-nav="1"]').click();
    await c.locator('.cal-nav[data-nav="-1"]').click();
    const after = await shape();
    ok("the static calendar is the same markup ds.js renders", before === after, before === after ? "" : before.split("\n").find((l, i) => l !== after.split("\n")[i]));
  });

  // ── 두 달 · 미리보기 · 연/월 ──────────────────────────────────
  await step("range shows two months side by side", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("two-months");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar"), ms = [...c.querySelectorAll(".cal-month")]; return { two: c.classList.contains("two"), titles: ms.map((m) => m.querySelector(".cal-title").textContent), prev: ms.map((m) => m.querySelectorAll('[data-nav="-1"]').length), next: ms.map((m) => m.querySelectorAll('[data-nav="1"]').length), w: Math.round(c.getBoundingClientRect().width), dup: c.querySelectorAll('.day[data-date="2026-10-01"]').length }; });
    ok("range shows two months side by side", r.two && r.titles.join() === "2026년 9월,2026년 10월" && r.prev.join() === "1,0" && r.next.join() === "0,1" && r.dup === 1, JSON.stringify(r));
    await day(dp, "2026-09-28").click();
    await day(dp, "2026-10-03").click();
    const s = await dp.evaluate((e) => ({ on: e.querySelectorAll(".day.on").length, band: e.querySelectorAll(".day.in-range").length, apply: e.querySelector('[data-cal="apply"]').disabled }));
    ok("a range across the fold of two months", s.on === 2 && s.band === 4 && !s.apply, JSON.stringify(s));
    await page.keyboard.press("Escape");
  });
  await step("two months fold to one at 390", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await go("components/date-picker.html");
    const dp = dpOf("two-months");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar"), b2 = c.getBoundingClientRect(); return { two: c.classList.contains("two"), months: c.querySelectorAll(".cal-month").length, left: Math.round(b2.left), right: Math.round(b2.right) }; });
    ok("two months fold to one at 390 and stay on screen", !r.two && r.months === 0 && r.left >= 0 && r.right <= 390, JSON.stringify(r));
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/date-picker.html");
  });
  await step("hovering after a start previews the band", async () => {
    const dp = dpOf("field", 1);
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await day(dp, "2026-09-10").click();
    await day(dp, "2026-09-14").hover();
    const r = await dp.evaluate((e) => ({ pv: e.querySelectorAll(".day.preview").length, end: e.querySelector(".day.preview-end")?.dataset.date, band: e.querySelectorAll(".day.in-range").length }));
    await page.mouse.move(5, 300);
    const cleared = await dp.evaluate((e) => e.querySelectorAll(".day.preview, .day.preview-end").length);
    ok("hovering after a start previews the band", r.pv === 3 && r.end === "2026-09-14" && r.band === 0 && cleared === 0, JSON.stringify({ r, cleared }));
    await page.keyboard.press("Escape");
  });
  await step("the title goes to years, then months, then days", async () => {
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await dp.locator(".calendar .cal-title").click();
    const y = await dp.evaluate((e) => ({ n: e.querySelectorAll(".cal-grid.years .cell").length, t: e.querySelector(".cal-title").textContent, on: e.querySelectorAll(".cell.on").length, today: e.querySelector(".cell.today")?.dataset.year }));
    await dp.locator('.calendar .cell[data-year="2027"]').click();
    const m = await dp.evaluate((e) => ({ n: e.querySelectorAll(".cal-grid.months .cell").length, t: e.querySelector(".cal-title").textContent }));
    await dp.locator('.calendar .cell[data-ym="2027-03"]').click();
    const d = await dp.evaluate((e) => e.querySelector(".cal-title").textContent);
    /* 값이 없으면 연 · 월 칸을 선택으로 칠하지 않는다 — 오늘만 표시 */
    ok("the title goes to years, then months, then days", y.n === 12 && y.t === "2016–2027" && y.on === 0 && y.today === "2026" && m.n === 12 && m.t === "2027년" && d === "2027년 3월", JSON.stringify({ y, m, d }));
    await page.keyboard.press("Escape");
  });
  await step("month mode commits a month", async () => {
    const dp = dpOf("month");
    await toTop(dp); await listen();
    await dp.locator(".field-btn").click();
    const view = await dp.evaluate((e) => e.querySelectorAll(".cal-grid.months .cell").length);
    await dp.locator('.calendar .cell[data-ym="2026-05"]').click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await dp.evaluate((e) => ({ v: e.dataset.value, t: e.querySelector(".field-btn").textContent.trim() }));
    const ev = (await events()).pop() || {};
    ok("month mode commits a month", view === 12 && r.v === "2026-05" && r.t === "2026-05" && ev.value === "2026-05", JSON.stringify({ view, r, ev }));
  });

  // ── 키보드 ─────────────────────────────────────────────────
  await step("keyboard: opening focuses today's cell, one tab stop in the grid", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".field-btn").focus();
    await page.keyboard.press("Enter");
    const r = await dp.evaluate((e) => ({ f: document.activeElement.dataset.date, stops: e.querySelectorAll('.cal-grid [tabindex="0"]').length }));
    ok("keyboard: opening focuses today's cell, one tab stop in the grid", r.f === "2026-10-27" && r.stops === 1, JSON.stringify(r));
  });
  const focused = () => page.evaluate(() => document.activeElement.dataset.date || document.activeElement.dataset.ym || document.activeElement.dataset.year);
  await step("keyboard: arrows move a day and a week, across months", async () => {
    const seq = [];
    for (const k of ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"]) { await page.keyboard.press(k); seq.push(await focused()); }
    const title = await dpOf("default").evaluate((e) => e.querySelector(".cal-title").textContent);
    ok("keyboard: arrows move a day and a week, across months", seq.join() === "2026-10-28,2026-11-04,2026-11-03,2026-10-27" && title === "2026년 10월", seq.join() + " " + title);
  });
  await step("keyboard: Home/End go to the week's ends, PageDown clamps the day", async () => {
    const seq = [];
    for (const k of ["Home", "End", "PageDown", "PageUp"]) { await page.keyboard.press(k); seq.push(await focused()); }
    ok("keyboard: Home/End go to the week's ends, PageDown clamps the day", seq.join() === "2026-10-25,2026-10-31,2026-11-30,2026-10-30", seq.join());
  });
  await step("keyboard: Enter selects and Tab stays inside the dialog", async () => {
    await page.keyboard.press("Enter");
    const on = await dpOf("default").evaluate((e) => e.querySelector(".day.on")?.dataset.date);
    let inside = true;
    for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); inside = inside && (await dpOf("default").evaluate((e) => e.querySelector(".calendar").contains(document.activeElement))); }
    ok("keyboard: Enter selects and Tab stays inside the dialog", on === "2026-10-30" && inside, JSON.stringify({ on, inside }));
    await page.keyboard.press("Escape");
  });
  await step("keyboard: year and month views follow the arrows", async () => {
    const dp = dpOf("default");
    await dp.locator(".field-btn").click();
    await dp.locator(".calendar .cal-title").focus();
    await page.keyboard.press("Enter");   // 제목은 그대로 포커스를 지니고, 격자의 Tab 정지 칸이 보던 해다
    await dp.locator('.calendar .cal-grid [tabindex="0"]').focus();
    const start = await focused();
    await page.keyboard.press("ArrowRight");
    const y = await focused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    const m = await focused();
    ok("keyboard: year and month views follow the arrows", start === "2026" && y === "2027" && m === "2028-01", JSON.stringify({ start, y, m }));   // 2026 → 2027, 월 뷰는 보이던 달(2027-10)에서 ↓ 3칸 = 2028-01
    await page.keyboard.press("Escape");
  });

  // ── 직접 입력 · 오류 ────────────────────────────────────────
  const typeInto = async (dp, text) => { const i = dp.locator(".affix input"); await i.fill(text); await i.press("Enter"); return dp.evaluate((e) => ({ v: e.dataset.value || null, s: e.dataset.start || null, t: e.querySelector(".affix input").value, err: e.classList.contains("error"), inv: e.querySelector(".affix input").getAttribute("aria-invalid"), help: e.querySelector(".help")?.textContent || "" })); };
  await step("typing a date commits it on Enter", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("input", 0);
    await toTop(dp);
    const r = await typeInto(dp, "20260915");
    ok("typing a date commits it on Enter", r.v === "2026-09-15" && r.t === "2026-09-15" && !r.err, JSON.stringify(r));
  });
  await step("an invalid date shows the error and keeps the value", async () => {
    const dp = dpOf("input", 0);
    const r = await typeInto(dp, "2026-02-30");
    const border = await dp.evaluate((e) => getComputedStyle(e.querySelector(".affix")).borderTopColor), want = await tok("--foreground-negative-primary");
    ok("an invalid date shows the error and keeps the value", r.err && r.inv === "true" && r.help === "날짜 형식이 올바르지 않습니다. 예: 2026-09-07" && r.v === "2026-09-15" && border === want, JSON.stringify({ r, border, want }));
  });
  await step("dates before min and after max say which bound", async () => {
    const dp = dpOf("input", 0);
    const lo = await typeInto(dp, "2025-12-31"), hi = await typeInto(dp, "2027-01-01");
    ok("dates before min and after max say which bound", lo.help === "2026-01-01 이후 날짜를 입력하세요" && hi.help === "2026-12-31 이전 날짜를 입력하세요", JSON.stringify({ lo: lo.help, hi: hi.help }));
  });
  await step("fixing the date restores the help text", async () => {
    const dp = dpOf("input", 0);
    const r = await typeInto(dp, "2026-09-20");
    ok("fixing the date restores the help text", !r.err && r.inv === null && r.help === "2026년 안의 날짜 · YYYY-MM-DD" && r.v === "2026-09-20", JSON.stringify(r));
  });
  await step("typing a range commits it, a reversed range is an error", async () => {
    const dp = dpOf("input", 1);
    const r1 = await typeInto(dp, "2026.09.10~2026.09.12"), r2 = await typeInto(dp, "2026-09-12 ~ 2026-09-10");
    ok("typing a range commits it, a reversed range is an error", r1.s === "2026-09-10" && r1.t === "2026-09-10 ~ 2026-09-12" && r2.err && r2.help === "종료일이 시작일보다 빠릅니다" && r2.s === "2026-09-10", JSON.stringify({ r1, r2 }));
  });
  await step("input focus rings: field halo for the input, own outline for the calendar button, red when in error", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("input", 0), er = dpOf("input", 2);
    await toTop(dp);
    const ring = (loc) => loc.evaluate((e) => { const a = getComputedStyle(e.querySelector(".affix")), c = getComputedStyle(e.querySelector(".cal-btn")); return { border: a.borderTopColor, shadow: a.boxShadow, btnOutline: c.outlineStyle + " " + c.outlineWidth }; });
    await dp.locator(".affix input").focus(); await page.waitForTimeout(250);
    const inp = await ring(dp);
    await page.keyboard.press("Tab"); await page.waitForTimeout(250);
    const btn = await ring(dp);
    await er.locator(".affix input").focus(); await page.waitForTimeout(250);
    const red = await ring(er);
    const brand = await tok("--foreground-brand-primary"), halo = await tok("--line-brand-focus"), neg = await tok("--foreground-negative-primary"), negHalo = await tok("--line-negative-focus");
    ok("input focus rings: field halo for the input, own outline for the calendar button, red when in error",
      inp.border === brand && inp.shadow.includes(halo) && inp.shadow.includes("4px") && btn.shadow === "none" && btn.btnOutline === "solid 1px" && red.border === neg && red.shadow.includes(negHalo),
      JSON.stringify({ inp, btn, red }));
  });

  // ── 하단 버튼 · 즉시 적용 ────────────────────────────────────
  await step("today appears only in single mode", async () => {
    const one = dpOf("default"), rg = dpOf("field", 1);
    await toTop(one); await one.locator(".field-btn").click();
    const a = await one.evaluate((e) => !!e.querySelector('[data-cal="today"]')); await page.keyboard.press("Escape");
    await toTop(rg); await rg.locator(".field-btn").click();
    const c = await rg.evaluate((e) => !!e.querySelector('[data-cal="today"]')); await page.keyboard.press("Escape");
    ok("today appears only in single mode", a && !c, JSON.stringify({ single: a, range: c }));
  });
  await step("cancel restores the value from before opening", async () => {
    const dp = dpOf("footer", 0);
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await day(dp, "2026-09-10").click();
    await dp.locator('.calendar [data-cal="cancel"]').click();
    const r = await dp.evaluate((e) => ({ v: e.dataset.value, t: e.querySelector(".field-btn").textContent.trim(), open: e.classList.contains("open"), focus: document.activeElement === e.querySelector(".field-btn") }));
    ok("cancel restores the value from before opening", r.v === "2026-09-07" && r.t === "2026-09-07" && !r.open && r.focus, JSON.stringify(r));
  });
  await step("reset clears the value", async () => {
    const dp = dpOf("footer", 0);
    await dp.locator(".field-btn").click();
    await dp.locator('.calendar [data-cal="reset"]').click();
    const on = await dp.evaluate((e) => e.querySelectorAll(".calendar .day.on").length);
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await dp.evaluate((e) => ({ v: e.dataset.value || null, ph: e.querySelector(".placeholder")?.textContent }));
    ok("reset clears the value", on === 0 && r.v === null && r.ph === "날짜 선택", JSON.stringify({ on, r }));
  });
  await step("apply waits for the range end", async () => {
    const dp = dpOf("field", 1);
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await day(dp, "2026-09-03").click();
    const half = await dp.evaluate((e) => e.querySelector('[data-cal="apply"]').disabled);
    await day(dp, "2026-09-05").click();
    const full = await dp.evaluate((e) => e.querySelector('[data-cal="apply"]').disabled);
    ok("apply waits for the range end", half && !full, JSON.stringify({ half, full }));
    await page.keyboard.press("Escape");
  });
  await step("without a footer a pick applies and closes", async () => {
    const one = dpOf("footer", 1), rg = dpOf("footer", 2);
    await toTop(one);
    await one.locator(".field-btn").click();
    const foot = await one.evaluate((e) => !!e.querySelector(".cal-foot"));
    await day(one, "2026-10-10").click();
    const a = await one.evaluate((e) => ({ v: e.dataset.value, open: e.classList.contains("open") }));
    await rg.locator(".field-btn").click();
    await day(rg, "2026-10-05").click();
    const mid = await rg.evaluate((e) => e.classList.contains("open"));
    await day(rg, "2026-10-09").click();
    const c = await rg.evaluate((e) => ({ s: e.dataset.start, e: e.dataset.end, open: e.classList.contains("open") }));
    ok("without a footer a pick applies and closes", !foot && a.v === "2026-10-10" && !a.open && mid && c.s === "2026-10-05" && c.e === "2026-10-09" && !c.open, JSON.stringify({ foot, a, mid, c }));
  });

  // ── 검토에서 나온 것(2026-10-27) ─────────────────────────────
  await step("Escape closes the focused picker and leaves another open one", async () => {
    await go("components/date-picker.html");
    const [a, b2] = [dpOf("field", 0), dpOf("field", 1)];
    await toTop(a);
    await b2.locator(".field-btn").focus(); await page.keyboard.press("Enter");
    await a.locator(".field-btn").focus(); await page.keyboard.press("Enter");   // 포커스로 열면 바깥 클릭이 없어 둘 다 열린다
    const both = await page.evaluate(() => document.querySelectorAll("#ex-date-picker-field .datepicker.open").length);
    await page.keyboard.press("Escape");
    const r = await page.evaluate(() => [...document.querySelectorAll("#ex-date-picker-field .datepicker")].map((e) => e.classList.contains("open")));
    ok("Escape closes the focused picker and leaves another open one", both === 2 && r.join() === "false,true", JSON.stringify({ both, r }));
    await b2.locator(".field-btn").click();
  });
  await step("typed text is checked when focus leaves through the calendar button", async () => {
    const dp = dpOf("input", 0);
    await toTop(dp);
    await dp.locator(".affix input").fill("2099-99-99");
    await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
    const r = await dp.evaluate((e) => ({ err: e.classList.contains("error"), inv: e.querySelector("input").getAttribute("aria-invalid") }));
    ok("typed text is checked when focus leaves through the calendar button", r.err && r.inv === "true", JSON.stringify(r));
  });
  await step("typing while the calendar is open moves the calendar and apply keeps it", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("input", 0);
    await toTop(dp);
    await dp.locator(".cal-btn").click();
    await dp.locator(".affix input").fill("2026-03-15"); await dp.locator(".affix input").press("Enter");
    const t = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelector(".day.on")?.dataset.date }));
    await dp.locator('.calendar [data-cal="apply"]').click();
    const v = await dp.evaluate((e) => ({ v: e.dataset.value, i: e.querySelector("input").value }));
    ok("typing while the calendar is open moves the calendar and apply keeps it", t.title === "2026년 3월" && t.on === "2026-03-15" && v.v === "2026-03-15" && v.i === "2026-03-15", JSON.stringify({ t, v }));
  });
  await step("an impossible date in the markup is not turned into another date", async () => {
    const dp = dpOf("input", 2);
    const r = await dp.evaluate((e) => ({ v: e.dataset.value || null, err: e.classList.contains("error") }));
    await dp.locator(".cal-btn").click();
    const open = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelectorAll(".day.on").length, border: getComputedStyle(e.querySelector(".affix")).borderTopColor }));
    const neg = await tok("--foreground-negative-primary");
    ok("an impossible date in the markup is not turned into another date", r.v === null && r.err && open.title === "2026년 10월" && open.on === 0, JSON.stringify({ r, open }));
    ok("an error field stays red while its calendar is open", open.border === neg, JSON.stringify({ border: open.border, neg }));
    await page.keyboard.press("Escape");
  });
  await step("an input inside the field box draws no second halo", async () => {
    const dp = dpOf("input", 0);
    await dp.locator(".affix input").focus(); await page.waitForTimeout(250);
    const sh = await dp.evaluate((e) => getComputedStyle(e.querySelector(".affix input")).boxShadow);
    ok("an input inside the field box draws no second halo", sh === "none", sh);
  });
  await step("an upward calendar re-measures when the month changes", async () => {
    const dp = dpOf("field", 0);
    await dp.evaluate((e) => { e.scrollIntoView({ block: "end", behavior: "instant" }); window.scrollBy(0, 20); });
    await dp.locator(".field-btn").click();
    const gaps = [];
    for (let i = 0; i < 4; i++) { gaps.push(await dp.evaluate((e) => Math.round(e.querySelector(".field-btn").getBoundingClientRect().top - e.querySelector(".calendar").getBoundingClientRect().bottom))); await dp.locator('.calendar .cal-nav[data-nav="1"]').click(); }
    await dp.locator(".calendar .cal-title").click();
    gaps.push(await dp.evaluate((e) => Math.round(e.querySelector(".field-btn").getBoundingClientRect().top - e.querySelector(".calendar").getBoundingClientRect().bottom)));
    ok("an upward calendar re-measures when the month changes", gaps.every((g) => Math.abs(g - 4) <= 1), gaps.join());
    await page.keyboard.press("Escape");
  });
  await step("picking a dimmed day of another month moves there", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".field-btn").click();
    await dp.locator('.calendar .day.muted[data-date="2026-09-30"]').click();   // 10월 화면 앞쪽의 흐린 9/30
    const r = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelector(".day.on")?.dataset.date, mutedOn: e.querySelectorAll(".day.muted.on").length, stop: e.querySelector('.cal-grid [tabindex="0"]')?.dataset.date }));
    ok("picking a dimmed day of another month moves there", r.title === "2026년 9월" && r.on === "2026-09-30" && r.mutedOn === 0 && r.stop === "2026-09-30", JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("a button field is named by its label and value", async () => {
    const snap = await page.locator(`${ex("field")}`).ariaSnapshot();
    ok("a button field is named by its label and value", /button "조회 기간 2026-09-01 ~ 2026-09-07"/.test(snap) && /button "시작일 날짜 선택"/.test(snap), snap.slice(0, 200));
  });
  await step("the live region stays the same node across months", async () => {
    const c = page.locator(`${ex("calendar")} .calendar`);
    await toTop(c);
    const r = await c.evaluate((e) => { const a = e.querySelector("[aria-live]"); e.querySelector('.cal-nav[data-nav="1"]').click(); const b2 = e.querySelector("[aria-live]"); return { same: a === b2, text: b2.textContent }; });
    ok("the live region stays the same node across months", r.same && r.text === "2026년 10월", JSON.stringify(r));
  });

  // ── 크기 · 상태 ────────────────────────────────────────────
  await step("sizes match the Text Field heights", async () => {
    const dp = await page.evaluate(() => [...document.querySelectorAll("#ex-date-picker-size .example-preview .field-btn")].map((x) => Math.round(x.getBoundingClientRect().height)));
    await go("components/text-field.html");
    const tf = await page.evaluate(() => [...document.querySelectorAll("#ex-text-field-size .example-preview input")].map((x) => Math.round(x.getBoundingClientRect().height)));
    ok("sizes match the Text Field heights", dp.join() === "36,44,52" && tf.join() === dp.join(), JSON.stringify({ dp, tf }));
    await go("components/date-picker.html");
  });
  await step("disabled and read-only fields don't open", async () => {
    const dis = dpOf("state", 0), ro = dpOf("state", 1);
    await toTop(dis);
    /* 비활성 버튼은 마우스 클릭이 가지 않으므로(force 클릭은 그 자리의 다른 요소를 누른다) 클릭 이벤트를 직접 보내 ds.js 의 가드를 잰다 */
    await dis.locator(".field-btn").dispatchEvent("click");
    await ro.locator(".cal-btn").dispatchEvent("click");
    const r = await page.evaluate(() => { const [d, o] = document.querySelectorAll("#ex-date-picker-state .example-preview .datepicker"), fb = getComputedStyle(d.querySelector(".field-btn")); return { dOpen: d.classList.contains("open"), oOpen: o.classList.contains("open"), bg: fb.backgroundColor, color: fb.color, op: fb.opacity, roBg: getComputedStyle(o.querySelector(".affix")).backgroundColor, roVal: o.querySelector("input").value }; });
    const want = { bg: await tok("--surface-disable-primary", "backgroundColor"), color: await tok("--foreground-disable-primary"), roBg: await tok("--background-neutral-secondary", "backgroundColor") };
    ok("disabled and read-only fields don't open", !r.dOpen && !r.oOpen && r.bg === want.bg && r.color === want.color && r.op === "1" && r.roBg === want.roBg && r.roVal === "2026-09-07", JSON.stringify({ r, want }));
  });

  ok("date picker pages raise no JS errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
};
