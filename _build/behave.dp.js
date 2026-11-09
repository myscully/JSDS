/* Date Picker · Calendar 동작 단정(2026-10-27, 2026-11-09 개편) — behave.js 가 부른다.
   오늘을 2026-10-27 10:00(Asia/Seoul)로 고정한 별도 컨텍스트에서 잰다(실제 날짜 · 기계 시간대가 바뀌어도 같은 칸을 누르게).
   2026-11-09(사람의 요청): 버튼형 필드를 없애고 TextField 입력 하나 — YYYY. MM. DD 자동 형식 · ↑↓ 조각 · 범위 밖도 값으로 남김 · validity 일곱 ·
   unit(year · month · day) · 기간 두 달 기본 · locale(Intl) · timezone(dayjs) · 선택은 원.
   한 단정이 요소를 못 찾아도 나머지가 돌도록 step() 으로 감싼다 — 옛 코드에서 무엇이 실패하는지 끝까지 보이려고 */
module.exports = async ({ b, ok, SITE, path }) => {
  const NOW = new Date("2026-10-27T01:00:00Z");   // 서울 10:00 · UTC 01:00 · 뉴욕 전날 21:00
  const open = async (tz = "Asia/Seoul", vp = { width: 1440, height: 900 }) => {
    const c = await b.newContext({ viewport: vp, timezoneId: tz });
    const p = await c.newPage();
    await p.clock.setFixedTime(NOW); p.setDefaultTimeout(2000);
    return { c, p };
  };
  const { c: ctx, p: page } = await open();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const go = async (p, pg = page) => { await pg.goto("file://" + path.join(SITE, p)); await pg.waitForTimeout(150); };
  const ex = (id) => `#ex-date-picker-${id} .example-preview`;
  const dpOf = (id, n = 0, pg = page) => pg.locator(`${ex(id)} .datepicker`).nth(n);
  /* 상단 고정 헤더에 가리지 않게, 아래로 펼칠 자리가 있게 필드를 화면 위쪽으로 */
  const toTop = (loc) => loc.evaluate((e) => { e.scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy(0, -140); });
  const day = (loc, k) => loc.locator(`.calendar .day[data-date="${k}"]:not(.muted)`);
  const openCal = (dp) => dp.locator(".cal-btn").click();
  /* ds:date 를 모은다 — date 는 Date(또는 {start, end})라 ISO 로 · Invalid Date 는 "NaN" 으로 바꿔 둔다 */
  const listen = (pg = page) => pg.evaluate(() => {
    window.__dsd = [];
    if (window.__dsdOn) return;
    window.__dsdOn = true;
    const iso = (d) => (d instanceof Date ? (isNaN(d.getTime()) ? "NaN" : d.toISOString()) : d);
    document.addEventListener("ds:date", (e) => { const d = e.detail; window.__dsd.push({ ...d, date: d.date && !(d.date instanceof Date) ? { start: iso(d.date.start), end: iso(d.date.end) } : iso(d.date) }); });
  });
  const last = async (pg = page) => (await pg.evaluate(() => window.__dsd || [])).pop() || {};
  const state = (dp) => dp.evaluate((e) => ({ v: e.dataset.value || null, s: e.dataset.start || null, e: e.dataset.end || null, t: e.querySelector(".affix input").value, val: e.dataset.validity || null, err: e.classList.contains("error"), inv: e.querySelector(".affix input").getAttribute("aria-invalid"), help: e.querySelector(".help")?.textContent || "", open: e.classList.contains("open") }));
  const typeInto = async (dp, digits) => { const i = dp.locator(".affix input"); await i.fill(""); await i.pressSequentially(digits); await i.press("Enter"); return state(dp); };
  /* 토큰의 계산 색 */
  const tok = (name, prop = "color") => page.evaluate(([n, p]) => { const d = document.createElement("div"); d.style[p] = `var(${n})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [name, prop]);

  await go("components/date-picker.html");

  // ── 기간 ───────────────────────────────────────────────────
  await step("range keeps its start across month navigation", async () => {
    const dp = dpOf("range");
    await toTop(dp); await listen();
    await openCal(dp);
    await day(dp, "2026-09-10").click();
    await dp.locator('.calendar .cal-nav[data-nav="-1"]').click();
    await dp.locator('.calendar .cal-nav[data-nav="1"]').click();
    await day(dp, "2026-10-03").click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await state(dp), ev = await last();
    ok("range keeps its start across month navigation", r.t === "2026. 09. 10 ~ 2026. 10. 03" && r.s === "2026-09-10" && r.e === "2026-10-03" && r.val === "valid" && !r.open, JSON.stringify(r));
    ok("range ds:date carries both ends, the text and the validity", ev.value === "2026-09-10 ~ 2026-10-03" && ev.start === "2026-09-10" && ev.end === "2026-10-03" && ev.text === r.t && ev.validity === "valid" && ev.date?.start === "2026-09-09T15:00:00.000Z", JSON.stringify(ev));
  });
  await step("a full range keeps both ends after moving months", async () => {
    const dp = dpOf("range");
    await openCal(dp);
    const r = await dp.evaluate((e) => ({ titles: [...e.querySelectorAll(".cal-title")].map((t) => t.textContent).join(), on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date).join(), band: e.querySelectorAll(".day.in-range").length }));
    await dp.locator('.calendar .cal-nav[data-nav="1"]').click();
    const nx = await dp.evaluate((e) => ({ titles: [...e.querySelectorAll(".cal-title")].map((t) => t.textContent).join(), on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date).join() }));
    /* 9 · 10월: 양끝과 띠 9/11~9/30 · 10/1~10/2. 다음 달로 넘기면 10 · 11월에 끝 10/3 만 */
    ok("a full range keeps both ends after moving months", r.titles === "2026년 9월,2026년 10월" && r.on === "2026-09-10,2026-10-03" && r.band === 22 && nx.titles === "2026년 10월,2026년 11월" && nx.on === "2026-10-03", JSON.stringify({ r, nx }));
    await page.keyboard.press("Escape");
  });
  await step("a preset that crosses a month commits both ends", async () => {
    const dp = dpOf("range");
    await listen();
    await openCal(dp);
    await dp.locator('.calendar [data-preset="30"]').click();
    const r = await state(dp), ev = await last();
    ok("a preset that crosses a month commits both ends", r.s === "2026-09-28" && r.e === "2026-10-27" && r.t === "2026. 09. 28 ~ 2026. 10. 27" && !r.open && ev.start === "2026-09-28", JSON.stringify({ r, ev }));
  });
  await step("a standalone range calendar selects a range", async () => {
    const rc = page.locator(`${ex("range-calendar")} .calendar`);
    await toTop(rc);
    await rc.locator('.day[data-date="2026-09-10"]').click();
    await rc.locator('.day[data-date="2026-09-15"]').click();
    const r = await rc.evaluate((e) => ({ on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date).join(), band: e.querySelectorAll(".day.in-range").length }));
    ok("a standalone range calendar selects a range", r.on === "2026-09-10,2026-09-15" && r.band === 4, JSON.stringify(r));
  });
  await step("the static range calendar's preset counts back from its own today", async () => {
    const rc = page.locator(`${ex("range-calendar")} .calendar`);
    await rc.locator('[data-preset="7"]').click();
    const r = await rc.evaluate((e) => ({ on: e.querySelectorAll(".day.on").length, band: e.querySelectorAll(".day.in-range").length, s: e.dataset.start, e: e.dataset.end }));
    ok("the static range calendar's preset counts back from its own today", r.on === 2 && r.band === 5 && r.s === "2026-10-01" && r.e === "2026-10-07", JSON.stringify(r));   // data-today 2026-10-07
  });
  await step("range shows two months side by side by default", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("range");
    await toTop(dp);
    await openCal(dp);
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar"), ms = [...c.querySelectorAll(".cal-month")]; return { two: c.classList.contains("two"), titles: ms.map((m) => m.querySelector(".cal-title").textContent).join(), prev: ms.map((m) => m.querySelectorAll('[data-nav="-1"]').length).join(), next: ms.map((m) => m.querySelectorAll('[data-nav="1"]').length).join(), w: Math.round(c.getBoundingClientRect().width), dup: c.querySelectorAll('.day[data-date="2026-10-01"]').length, multi: c.querySelector(".cal-grid").getAttribute("aria-multiselectable") }; });
    ok("range shows two months side by side by default", r.two && r.titles === "2026년 9월,2026년 10월" && r.prev === "1,0" && r.next === "0,1" && r.dup === 1 && r.w === 606 && r.multi === "true", JSON.stringify(r));
    await day(dp, "2026-09-28").click();
    await day(dp, "2026-10-03").click();
    const s = await dp.evaluate((e) => ({ on: e.querySelectorAll(".day.on").length, band: e.querySelectorAll(".day.in-range").length, apply: e.querySelector('[data-cal="apply"]').disabled }));
    ok("a range across the fold of two months", s.on === 2 && s.band === 4 && !s.apply, JSON.stringify(s));
    await page.keyboard.press("Escape");
  });
  await step("a single date picker shows one calendar", async () => {
    const dp = dpOf("default");
    await toTop(dp); await openCal(dp);
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar"); return { two: c.classList.contains("two"), months: c.querySelectorAll(".cal-month").length, w: Math.round(c.getBoundingClientRect().width) }; });
    ok("a single date picker shows one calendar", !r.two && r.months === 0 && r.w === 296, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("two months fold to one at 767 and below", async () => {
    const out = {};
    for (const w of [767, 390, 768]) {
      await page.setViewportSize({ width: w, height: 844 });
      await go("components/date-picker.html");
      const dp = dpOf("range");
      await toTop(dp); await openCal(dp);
      out[w] = await dp.evaluate((e) => { const c = e.querySelector(".calendar"), r = c.getBoundingClientRect(); return { months: c.querySelectorAll(".cal-month").length, left: Math.round(r.left), right: Math.round(r.right) }; });
      out[w].vw = w;
    }
    ok("two months fold to one at 767 and below and stay on screen", out[767].months === 0 && out[390].months === 0 && out[768].months === 2 && [767, 390, 768].every((w) => out[w].left >= 0 && out[w].right <= w), JSON.stringify(out));
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/date-picker.html");
  });
  await step("hovering after a start previews the band", async () => {
    const dp = dpOf("range");
    await toTop(dp); await openCal(dp);
    await day(dp, "2026-09-10").click();
    await day(dp, "2026-09-14").hover();
    const r = await dp.evaluate((e) => ({ pv: e.querySelectorAll(".day.preview").length, end: e.querySelector(".day.preview-end")?.dataset.date, endCls: e.querySelector(".day.preview-end")?.classList.contains("end"), startCls: e.querySelector('.day[data-date="2026-09-10"]').classList.contains("start"), band: e.querySelectorAll(".day.in-range").length }));
    await page.mouse.move(5, 300);
    const cleared = await dp.evaluate((e) => e.querySelectorAll(".day.preview, .day.preview-end").length);
    ok("hovering after a start previews the band", r.pv === 3 && r.end === "2026-09-14" && r.endCls && r.startCls && r.band === 0 && cleared === 0, JSON.stringify({ r, cleared }));
    await page.keyboard.press("Escape");
  });
  await step("apply waits for the range end", async () => {
    const dp = dpOf("range");
    await openCal(dp);
    await day(dp, "2026-09-03").click();
    const half = await dp.evaluate((e) => e.querySelector('[data-cal="apply"]').disabled);
    await day(dp, "2026-09-05").click();
    const full = await dp.evaluate((e) => e.querySelector('[data-cal="apply"]').disabled);
    ok("apply waits for the range end", half && !full, JSON.stringify({ half, full }));
    await page.keyboard.press("Escape");
  });
  await step("days after data-max are disabled and do nothing", async () => {
    const dp = dpOf("range");
    await openCal(dp);
    await dp.locator('.calendar .day[data-date="2026-10-28"]').click({ force: true });
    const r = await dp.evaluate((e) => ({ dis: e.querySelector('.day[data-date="2026-10-28"]').getAttribute("aria-disabled"), dis27: e.querySelector('.day[data-date="2026-10-27"]').getAttribute("aria-disabled"), on: [...e.querySelectorAll(".day.on")].map((d) => d.dataset.date) }));
    ok("days after data-max are disabled and do nothing", r.dis === "true" && r.dis27 === null && !r.on.includes("2026-10-28"), JSON.stringify(r));
    await page.keyboard.press("Escape");
  });

  // ── 선택은 원 · 달력 치수(사람의 결정 2026-11-09) ─────────────────
  await step("a selected day is a 34px brand circle and range ends meet the band halfway", async () => {
    await go("components/date-picker.html");
    const one = page.locator(`${ex("calendar")} .calendar`), rc = page.locator(`${ex("range-calendar")} .calendar`);
    const s = await one.evaluate((c) => { const d = c.querySelector(".day.on"), b4 = getComputedStyle(d, "::before"), cs = getComputedStyle(d); return { w: b4.width, h: b4.height, r: b4.borderRadius, bg: b4.backgroundColor, cellBg: cs.backgroundColor, color: cs.color }; });
    const r = await rc.evaluate((c) => { const g = (k) => getComputedStyle(c.querySelector(`.day[data-date="${k}"]`)).backgroundImage; return { start: g("2026-09-21"), end: g("2026-10-07"), mid: getComputedStyle(c.querySelector(".day.in-range")).borderRadius }; });
    const brand = await tok("--surface-brand-primary", "backgroundColor"), band = await tok("--surface-brand-subtle-strong", "backgroundColor"), label = await tok("--brand-label");
    ok("a selected day is a 34px brand circle and range ends meet the band halfway",
      s.w === "34px" && s.h === "34px" && s.r === "50%" && s.bg === brand && s.cellBg === "rgba(0, 0, 0, 0)" && s.color === label &&
      r.start.startsWith("linear-gradient(to right") && r.start.includes(band) && r.end.startsWith("linear-gradient(to left") && r.end.includes(band) && r.mid === "0px",
      JSON.stringify({ s, r, brand, band }));
  });
  await step("calendar padding 20, text 13, title 16", async () => {
    const r = await page.locator(`${ex("calendar")} .calendar`).evaluate((c) => { const g = (e) => getComputedStyle(e); return { pad: g(c).padding, fs: g(c).fontSize, title: g(c.querySelector(".cal-title")).fontSize, day: g(c.querySelector(".day")).fontSize }; });
    const y = await dpOf("unit", 0).evaluate(async (e) => { e.querySelector(".cal-btn").click(); await new Promise((r) => setTimeout(r, 50)); const out = getComputedStyle(e.querySelector(".calendar .cell")).fontSize; e.querySelector(".cal-btn").click(); return out; });
    ok("calendar padding 20, text 13, title 16", r.pad === "20px" && r.fs === "13px" && r.title === "16px" && r.day === "13px" && y === "13px", JSON.stringify({ r, y }));
  });

  // ── 닫기 · 접근성 ──────────────────────────────────────────
  await step("Escape closes only this picker and returns focus to the calendar button", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp);
    await openCal(dp);
    await page.keyboard.press("Escape");
    const r = await dp.evaluate((e) => ({ open: e.classList.contains("open"), exp: e.querySelector(".cal-btn").getAttribute("aria-expanded"), opened: e.hasAttribute("data-ds-opened"), focus: document.activeElement === e.querySelector(".cal-btn") }));
    ok("Escape closes only this picker and returns focus to the calendar button", !r.open && r.exp === "false" && !r.opened && r.focus, JSON.stringify(r));
  });
  await step("closing without apply discards the draft", async () => {
    const dp = dpOf("default");
    await openCal(dp);
    await day(dp, "2026-10-10").click();
    await page.keyboard.press("Escape");
    await openCal(dp);
    const r = await dp.evaluate((e) => ({ on: e.querySelectorAll(".calendar .day.on").length, value: e.dataset.value || null, t: e.querySelector("input").value }));
    ok("closing without apply discards the draft", r.on === 0 && !r.value && r.t === "", JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("the popover is a named modal dialog with a date grid", async () => {
    const dp = dpOf("default");
    await openCal(dp);
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar"), sel = [...c.querySelectorAll("[aria-selected]")]; return { role: c.getAttribute("role"), modal: c.getAttribute("aria-modal"), name: c.getAttribute("aria-label"), grid: c.querySelector(".cal-grid").getAttribute("role"), cells: sel.every((x) => x.getAttribute("role") === "gridcell"), label: c.querySelector('.day[data-date="2026-10-27"]').getAttribute("aria-label"), cur: c.querySelector('.day[data-date="2026-10-27"]').getAttribute("aria-current") }; });
    const snap = await dp.locator(".calendar .cal-grid").ariaSnapshot();
    ok("the popover is a named modal dialog with a date grid", r.role === "dialog" && r.modal === "true" && r.name === "날짜 선택" && r.grid === "grid" && r.cells && r.label === "2026년 10월 27일 화요일" && r.cur === "date" && /- row/.test(snap) && /- gridcell "2026년 10월 27일 화요일"/.test(snap), JSON.stringify(r) + " " + snap.slice(0, 120));
    await page.keyboard.press("Escape");
    ok("a static demo calendar is a group, not a modal", await page.locator(`${ex("calendar")} .calendar`).evaluate((c) => c.getAttribute("role") === "group" && !c.hasAttribute("aria-modal")));
  });
  await step("a field is a text box named by its label, with a named calendar button", async () => {
    const snap = await page.locator(ex("default")).ariaSnapshot();
    const attrs = await dpOf("default").evaluate((e) => { const i = e.querySelector("input"); return { ph: i.placeholder, mode: i.inputMode, fieldBtn: e.querySelectorAll(".field-btn").length }; });
    ok("a field is a text box named by its label, with a named calendar button", /textbox "점검일"/.test(snap) && /button "달력 열기"/.test(snap) && attrs.ph === "YYYY. MM. DD" && attrs.mode === "numeric" && attrs.fieldBtn === 0, snap.slice(0, 200) + " " + JSON.stringify(attrs));
  });
  /* 사이트가 미리 그린 달력(components.data.js cal())과 ds.js 가 다시 그린 달력이 같은 마크업이다 — 단일 · 기간 두 달 · en-US · ja-JP */
  for (const [label, sel] of [["single", `${ex("calendar")} .calendar`], ["two-month range", `${ex("range-calendar")} .calendar`], ["en-US", `${ex("locale")} .calendar >> nth=0`], ["ja-JP", `${ex("locale")} .calendar >> nth=1`]]) {
    await step(`the static ${label} calendar is the same markup ds.js renders`, async () => {
      const c = page.locator(sel);
      const shape = () => c.evaluate((e) => [...e.querySelectorAll("*")].filter((x) => !x.closest("svg")).map((x) => [x.tagName, [...x.classList].sort().join("."), x.children.length || x.hasAttribute("aria-live") ? "" : x.textContent.trim(),   /* 알림 영역은 달을 옮길 때만 채운다 — 처음부터 읽히지 않게 */
...["role", "data-date", "data-month", "tabindex", "aria-label", "aria-selected", "aria-current", "aria-disabled", "data-nav", "data-cal", "data-preset", "aria-live"].map((a) => x.getAttribute(a))].join("|")).join("\n"));
      const before = await shape();
      await toTop(c);
      await c.locator('.cal-nav[data-nav="1"]').last().click();
      await c.locator('.cal-nav[data-nav="-1"]').first().click();
      const after = await shape();
      ok(`the static ${label} calendar is the same markup ds.js renders`, before === after, before === after ? "" : before.split("\n").find((l, i) => l !== after.split("\n")[i]) + " ≠ " + after.split("\n").find((l, i) => l !== before.split("\n")[i]));
    });
  }
  await step("the live region stays the same node across months", async () => {
    await go("components/date-picker.html");
    const c = page.locator(`${ex("calendar")} .calendar`);
    await toTop(c);
    const r = await c.evaluate((e) => { const a = e.querySelector("[aria-live]"); e.querySelector('.cal-nav[data-nav="1"]').click(); const b2 = e.querySelector("[aria-live]"); return { same: a === b2, text: b2.textContent }; });
    ok("the live region stays the same node across months", r.same && r.text === "2026년 10월", JSON.stringify(r));
  });

  // ── 연 · 월 · 일 단위 ───────────────────────────────────────
  await step("the title goes to years, then months, then days", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp); await openCal(dp);
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
  await step("unit year opens the year list, its title is plain text, and commits YYYY", async () => {
    const dp = dpOf("unit", 0);
    await toTop(dp); await listen(); await openCal(dp);
    const v = await dp.evaluate((e) => ({ n: e.querySelectorAll(".cal-grid.years .cell").length, days: e.querySelectorAll(".day").length, title: e.querySelector(".cal-title").tagName, on: e.querySelector(".cell.on")?.dataset.year }));
    await dp.locator('.calendar .cell[data-year="2025"]').click();
    const still = await dp.evaluate((e) => e.querySelectorAll(".cal-grid.years").length);   // 연 단위는 월로 내려가지 않는다
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await state(dp), ev = await last();
    ok("unit year opens the year list, its title is plain text, and commits YYYY", v.n === 12 && v.days === 0 && v.title === "SPAN" && v.on === "2026" && still === 1 && r.t === "2025" && r.v === "2025" && ev.value === "2025" && ev.date === "2024-12-31T15:00:00.000Z", JSON.stringify({ v, still, r, ev }));
  });
  await step("unit month opens the month list and commits YYYY. MM", async () => {
    const dp = dpOf("unit", 1);
    await listen(); await openCal(dp);
    const v = await dp.evaluate((e) => ({ n: e.querySelectorAll(".cal-grid.months .cell").length, on: e.querySelector(".cell.on")?.dataset.ym, ph: e.querySelector("input").placeholder }));
    await dp.locator('.calendar .cell[data-ym="2026-05"]').click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await state(dp), ev = await last();
    ok("unit month opens the month list and commits YYYY. MM", v.n === 12 && v.on === "2026-09" && v.ph === "YYYY. MM" && r.t === "2026. 05" && r.v === "2026-05" && ev.value === "2026-05", JSON.stringify({ v, r, ev }));
  });
  await step("each unit types its own format and calls a shorter one incomplete", async () => {
    const y = await typeInto(dpOf("unit", 0), "2031"), m = await typeInto(dpOf("unit", 1), "202611"), d = await typeInto(dpOf("unit", 2), "202611");
    ok("each unit types its own format and calls a shorter one incomplete", y.t === "2031" && y.val === "valid" && m.t === "2026. 11" && m.val === "valid" && d.t === "2026. 11" && d.val === "incomplete" && d.err, JSON.stringify({ y, m, d }));
  });

  // ── 키보드(달력) ────────────────────────────────────────────
  await step("keyboard: opening focuses today's cell, one tab stop in the grid", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".cal-btn").focus();
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
    await openCal(dp);
    await dp.locator(".calendar .cal-title").focus();
    await page.keyboard.press("Enter");
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

  // ── 입력 · 자동 형식 · validity ──────────────────────────────
  await step("typing digits fills in YYYY. MM. DD as you go", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default"), i = dp.locator(".affix input");
    await toTop(dp); await listen();
    await i.click();
    const seen = [];
    for (const k of "20269") { await page.keyboard.type(k); seen.push(await i.inputValue()); }
    await page.keyboard.type("4"); seen.push(await i.inputValue());   // 일 첫 자리 4~9 는 앞에 0
    const quiet = await state(dp);
    await page.keyboard.press("Enter");
    const r = await state(dp), ev = await last();
    ok("typing digits fills in YYYY. MM. DD as you go", seen.join("|") === "2|20|202|2026|2026. 09|2026. 09. 04" && !quiet.err && r.v === "2026-09-04" && r.val === "valid" && ev.text === "2026. 09. 04" && ev.date === "2026-09-03T15:00:00.000Z", JSON.stringify({ seen, quiet, r, ev }));
  });
  await step("Backspace removes digits through the separators", async () => {
    const i = dpOf("default").locator(".affix input");
    const seen = [];
    for (let n = 0; n < 3; n++) { await page.keyboard.press("Backspace"); seen.push(await i.inputValue()); }
    ok("Backspace removes digits through the separators", seen.join("|") === "2026. 09. 0|2026. 09|2026. 0", seen.join("|"));
  });
  await step("pasted 2026/9/1 is padded to 2026. 09. 01", async () => {
    const i = dpOf("default").locator(".affix input");
    const v = await i.evaluate((e) => { e.focus(); e.value = "2026/9/1"; e.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertFromPaste", data: "2026/9/1" })); return e.value; });
    ok("pasted 2026/9/1 is padded to 2026. 09. 01", v === "2026. 09. 01", v);
    await i.press("Enter");
  });
  await step("incomplete typing is an error only when you leave, and ds:date carries an Invalid Date", async () => {
    const dp = dpOf("default"), i = dp.locator(".affix input");
    await listen();
    await i.fill(""); await i.pressSequentially("202609");
    const quiet = await state(dp);
    await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
    const r = await state(dp), ev = await last();
    ok("incomplete typing is an error only when you leave, and ds:date carries an Invalid Date",
      !quiet.err && quiet.inv === null && r.err && r.inv === "true" && r.val === "incomplete" && !r.v && r.help === "날짜가 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요." && ev.validity === "incomplete" && ev.date === "NaN" && ev.value === null,
      JSON.stringify({ quiet, r, ev }));
  });
  await step("an impossible date is invalid and never becomes another date", async () => {
    const dp = dpOf("default");
    await listen();
    const r = await typeInto(dp, "20260230"), ev = await last();
    const border = await dp.evaluate((e) => getComputedStyle(e.querySelector(".affix")).borderTopColor), want = await tok("--foreground-negative-primary");
    ok("an impossible date is invalid and never becomes another date", r.t === "2026. 02. 30" && r.val === "invalid" && !r.v && r.err && r.help === "날짜가 달력에 없습니다. 달력에서 고르거나 2026. 09. 07 처럼 입력하세요." && ev.date === "NaN" && border === want, JSON.stringify({ r, ev, border, want }));
  });
  await step("↑↓ step the segment under the cursor and ignore max — the value stays", async () => {
    const dp = dpOf("min-max", 0), i = dp.locator(".affix input");
    await toTop(dp); await listen();
    await i.evaluate((e) => { e.focus(); e.setSelectionRange(2, 2); });
    await page.keyboard.press("ArrowUp");
    const up = await state(dp), ev = await last();
    await page.keyboard.press("ArrowDown");
    const down = await state(dp);
    await i.evaluate((e) => e.setSelectionRange(7, 7));
    await page.keyboard.press("ArrowUp");
    const month = await state(dp);
    ok("↑↓ step the segment under the cursor and ignore max — the value stays",
      up.t === "2027. 09. 07" && up.v === "2027-09-07" && up.val === "max" && up.err && up.help === "날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다." && ev.value === "2027-09-07" && ev.validity === "max" &&
      down.t === "2026. 09. 07" && down.val === "valid" && !down.err && down.help === "2026년 안의 날짜" && month.t === "2026. 10. 07",
      JSON.stringify({ up, ev, down, month }));
  });
  await step("a typed date before min is kept, and the calendar shows it but can't pick around it", async () => {
    const dp = dpOf("min-max", 0);
    const r = await typeInto(dp, "20251231");
    await openCal(dp);
    const c = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelector(".day.on")?.dataset.date, dis: e.querySelector('.day[data-date="2025-12-30"]').getAttribute("aria-disabled") }));
    await dp.locator('.calendar .day[data-date="2025-12-30"]').click({ force: true });
    const after = await dp.evaluate((e) => e.querySelector(".day.on")?.dataset.date);
    ok("a typed date before min is kept, and the calendar shows it but can't pick around it", r.v === "2025-12-31" && r.val === "min" && r.help === "날짜가 범위를 벗어났습니다. 2026. 01. 01 부터 입력할 수 있습니다." && c.title === "2025년 12월" && c.on === "2025-12-31" && c.dis === "true" && after === "2025-12-31", JSON.stringify({ r, c, after }));
    await page.keyboard.press("Escape");
  });
  await step("examples start in their validity — max, incomplete, invalid", async () => {
    await go("components/date-picker.html");
    const out = await state(dpOf("min-max", 1)), inc = await state(dpOf("invalid", 0)), inv = await state(dpOf("invalid", 1));
    ok("examples start in their validity — max, incomplete, invalid", out.val === "max" && out.v === "2027-01-05" && out.err && out.inv === "true" && inc.val === "incomplete" && !inc.v && inc.err && inv.val === "invalid" && !inv.v && inv.err, JSON.stringify({ out, inc, inv }));
  });
  /* 오류 문구는 필드 폭을 넓히지 않고 줄바꿈한다(사람의 결정 2026-11-09) — 문구가 길어져 폭 260 의 필드가 321 · 354 로 넓어졌었다 */
  await step("an error message wraps inside the field instead of widening it", async () => {
    await go("components/date-picker.html");
    const w = (dp) => dp.evaluate((e) => { const h = e.querySelector(".help"); return { w: e.getBoundingClientRect().width, hw: h.getBoundingClientRect().width, lines: Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)) }; });
    const fine = dpOf("min-max", 0), before = await w(fine);
    await typeInto(fine, "20270105");
    const typed = await w(fine), out = await w(dpOf("min-max", 1)), inv = await w(dpOf("invalid", 1));
    ok("an error message wraps inside the field instead of widening it",
      before.w === 260 && typed.w === 260 && out.w === 260 && inv.w === 260 && typed.hw === 260 && typed.lines === 2 && inv.lines === 2,
      JSON.stringify({ before, typed, out, inv }));
  });
  await step("an invalid field opens on today and stays red while open", async () => {
    const dp = dpOf("invalid", 1);
    await toTop(dp); await openCal(dp);
    const r = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelectorAll(".day.on").length, border: getComputedStyle(e.querySelector(".affix")).borderTopColor }));
    const neg = await tok("--foreground-negative-primary");
    ok("an invalid field opens on today and stays red while open", r.title === "2026년 10월" && r.on === 0 && r.border === neg, JSON.stringify({ r, neg }));
    await page.keyboard.press("Escape");
  });
  await step("typing a range puts ~ after the start, a reversed range is order and keeps both dates", async () => {
    const dp = dpOf("range");
    await toTop(dp); await listen();
    const r = await typeInto(dp, "2026091220260910"), ev = await last();
    ok("typing a range puts ~ after the start, a reversed range is order and keeps both dates", r.t === "2026. 09. 12 ~ 2026. 09. 10" && r.val === "order" && r.err && r.help === "종료일이 시작일보다 빠릅니다. 시작일과 같거나 늦은 날짜로 바꾸세요." && ev.start === "2026-09-12" && ev.end === "2026-09-10" && ev.validity === "order", JSON.stringify({ r, ev }));
    const ok2 = await typeInto(dp, "2026091020260912");
    ok("typing a valid range commits both ends", ok2.s === "2026-09-10" && ok2.e === "2026-09-12" && ok2.val === "valid" && !ok2.err, JSON.stringify(ok2));
    /* 쪽마다의 상태(2026-11-09) — 비운 끝 empty · max(오늘) 넘은 끝 max · 순서는 validity 에만 */
    const halfS = await typeInto(dp, "20260910"), half = await last();
    const overS = await typeInto(dp, "2026091020261105"), over = await last();
    ok("ds:date sides tell which end is wrong", ev.sides?.start === "valid" && ev.sides?.end === "valid" && half.validity === "incomplete" && half.sides?.start === "valid" && half.sides?.end === "empty" && over.validity === "max" && over.sides?.start === "valid" && over.sides?.end === "max", JSON.stringify({ ev: ev.sides, half, over }));
    /* 오류 문구도 그 쪽 이름으로(2026-11-09) — 둘 다 틀리면 '날짜가' · 예시도 A ~ B */
    const both = await typeInto(dp, "2026110520261106");
    ok("the error names the wrong end — both wrong falls back to 날짜가",
      halfS.help === "종료일이 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요." && overS.help === "종료일이 범위를 벗어났습니다. 2026. 10. 27 까지 입력할 수 있습니다." &&
      both.help === "날짜가 범위를 벗어났습니다. 2026. 10. 27 까지 입력할 수 있습니다.", JSON.stringify({ half: halfS.help, over: overS.help, both: both.help }));
  });
  await step("typed text is checked when focus leaves through the calendar button", async () => {
    const dp = dpOf("default");
    await toTop(dp);
    await dp.locator(".affix input").fill("20260230");
    await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
    const r = await state(dp);
    ok("typed text is checked when focus leaves through the calendar button", r.err && r.inv === "true" && r.val === "invalid", JSON.stringify(r));
  });
  await step("typing while the calendar is open moves the calendar and apply keeps it", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp); await openCal(dp);
    await dp.locator(".affix input").fill("20260315"); await dp.locator(".affix input").press("Enter");
    const t = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelector(".day.on")?.dataset.date, v: e.dataset.value, i: e.querySelector("input").value, apply: e.querySelector('[data-cal="apply"]').disabled }));
    /* 입력의 Enter 가 이미 확정했으므로 초안 = 확정 값 — 적용은 꺼져 예전 값으로 되돌릴 길이 없다 */
    ok("typing while the calendar is open moves the calendar and apply keeps it", t.title === "2026년 3월" && t.on === "2026-03-15" && t.v === "2026-03-15" && t.i === "2026. 03. 15" && t.apply, JSON.stringify(t));
    await page.keyboard.press("Escape");
  });
  await step("input focus rings: field halo for the input, own outline for the calendar button, red when in error", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("min-max", 0), er = dpOf("min-max", 1);
    await toTop(dp);
    const ring = (loc) => loc.evaluate((e) => { const a = getComputedStyle(e.querySelector(".affix")), c = getComputedStyle(e.querySelector(".cal-btn")); return { border: a.borderTopColor, shadow: a.boxShadow, btnOutline: c.outlineStyle + " " + c.outlineWidth, inner: getComputedStyle(e.querySelector(".affix input")).boxShadow }; });
    await dp.locator(".affix input").focus(); await page.waitForTimeout(250);
    const inp = await ring(dp);
    await page.keyboard.press("Tab"); await page.waitForTimeout(250);
    const btn = await ring(dp);
    await er.locator(".affix input").focus(); await page.waitForTimeout(250);
    const red = await ring(er);
    const brand = await tok("--foreground-brand-primary"), halo = await tok("--line-brand-focus"), neg = await tok("--foreground-negative-primary"), negHalo = await tok("--line-negative-focus");
    ok("input focus rings: field halo for the input, own outline for the calendar button, red when in error",
      inp.border === brand && inp.shadow.includes(halo) && inp.shadow.includes("4px") && inp.inner === "none" && btn.shadow === "none" && btn.btnOutline === "solid 1px" && red.border === neg && red.shadow.includes(negHalo),
      JSON.stringify({ inp, btn, red }));
  });

  await step("data-messages templates set the word order; bad JSON warns and keeps the defaults", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("min-max", 0);
    await toTop(dp);
    await dp.evaluate((e) => e.setAttribute("data-messages", JSON.stringify({ max: "Pick a date on or before {max}.", incomplete: "{subject} is incomplete. Type it like {example}.", subject: "The date" })));
    const en = await typeInto(dp, "20270105"), enInc = await typeInto(dp, "202609");
    await page.evaluate(() => { window.__warn = []; const w = console.warn; console.warn = (...a) => { window.__warn.push(a.join(" ")); w.apply(console, a); }; });
    await dp.evaluate((e) => e.setAttribute("data-messages", "{max:"));
    const bad = await typeInto(dp, "20270105"), warn = await page.evaluate(() => window.__warn);
    await dp.evaluate((e) => e.removeAttribute("data-messages"));
    ok("data-messages templates set the word order; bad JSON warns and keeps the defaults",
      en.help === "Pick a date on or before 2026. 12. 31." && enInc.help === "The date is incomplete. Type it like 2026. 09. 07." &&
      bad.help === "날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다." && warn.length === 1 && warn[0].includes("data-messages"),
      JSON.stringify({ en: en.help, enInc: enInc.help, bad: bad.help, warn }));
  });

  // ── locale · timezone ──────────────────────────────────────
  await step("locale calendars use Intl for the title, weekdays, today and day names", async () => {
    await go("components/date-picker.html");
    const read = (n) => page.locator(`${ex("locale")} .calendar`).nth(n).evaluate((c) => ({ title: c.querySelector(".cal-title").textContent, dow: [...c.querySelectorAll(".dow")].map((d) => d.textContent).join(""), today: c.querySelector('[data-cal="today"]')?.textContent.trim(), label: c.querySelector('.day[data-date="2026-09-07"]').getAttribute("aria-label") }));
    const en = await read(0), ja = await read(1);
    const enNext = await page.locator(`${ex("locale")} .calendar`).nth(0).evaluate((c) => { c.querySelector('.cal-nav[data-nav="1"]').click(); return c.querySelector(".cal-title").textContent; });
    ok("locale calendars use Intl for the title, weekdays, today and day names",
      en.title === "September 2026" && en.dow === "SMTWTFS" && en.today === "Today" && en.label === "Monday, September 7, 2026" && enNext === "October 2026" &&
      ja.title === "2026年9月" && ja.dow === "日月火水木金土" && ja.today === "今日",
      JSON.stringify({ en, ja, enNext }));
  });
  await step("data-labels replaces the words Intl can't make — static markup and ds.js render alike", async () => {
    await go("components/date-picker.html");
    const read = () => page.locator(`${ex("locale")} .calendar`).nth(0).evaluate((c) => ({ name: c.getAttribute("aria-label"), apply: c.querySelector('[data-cal="apply"]').textContent.trim(), prev: c.querySelector('[data-nav="-1"]').getAttribute("aria-label"), next: c.querySelector('[data-nav="1"]').getAttribute("aria-label"), title: c.querySelector(".cal-title").getAttribute("aria-label") }));
    const before = await read();
    await page.locator(`${ex("locale")} .calendar`).nth(0).evaluate((c) => c.querySelector('[data-nav="1"]').click());
    const after = await read();
    /* 기간 필드에 문구를 주면 프리셋({n}) · 적용 · 달력 이름이 바뀐다 */
    const dp = dpOf("range");
    await dp.evaluate((e) => e.setAttribute("data-labels", JSON.stringify({ recent: "Last {n} days", apply: "Apply", dialog: "Choose dates" })));
    await toTop(dp); await openCal(dp);
    const f = await dp.evaluate((e) => ({ presets: [...e.querySelectorAll("[data-preset]")].map((b) => b.textContent.trim()).join(), apply: e.querySelector('[data-cal="apply"]').textContent.trim() }));
    await page.keyboard.press("Escape");
    ok("data-labels replaces the words Intl can't make — static markup and ds.js render alike",
      before.name === "Choose date" && before.apply === "Apply" && before.prev === "Previous month" && before.next === "Next month" && before.title === "September 2026, choose year" &&
      after.next === "Next month" && after.title === "October 2026, choose year" && f.presets === "Last 7 days,Last 30 days" && f.apply === "Apply",
      JSON.stringify({ before, after, f }));
  });
  await step("timezone decides today and the instant ds:date sends", async () => {
    const utc = dpOf("timezone", 0), ny = dpOf("timezone", 1);
    await toTop(utc); await listen();
    const pick = async (dp) => {
      await openCal(dp);
      const t = await dp.evaluate((e) => ({ today: e.querySelector(".day.today")?.dataset.date, dis27: e.querySelector('.day[data-date="2026-10-27"]')?.getAttribute("aria-disabled") || null }));
      await dp.locator('.calendar [data-cal="today"]').click();
      await dp.locator('.calendar [data-cal="apply"]').click();
      return { ...t, ...(await state(dp)), ev: await last() };
    };
    const a = await pick(utc), n = await pick(ny);
    ok("timezone decides today and the instant ds:date sends",
      a.today === "2026-10-27" && a.v === "2026-10-27" && a.ev.date === "2026-10-27T00:00:00.000Z" &&
      n.today === "2026-10-26" && n.dis27 === "true" && n.v === "2026-10-26" && n.ev.date === "2026-10-26T04:00:00.000Z",
      JSON.stringify({ a, n }));
  });
  await step("a range in America/New_York keeps its dates", async () => {
    const { c: c2, p: p2 } = await open("America/New_York");
    await go("components/date-picker.html", p2); await listen(p2);
    const dp = dpOf("range", 0, p2);
    await dp.evaluate((e) => { e.scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy(0, -140); });
    await dp.locator(".cal-btn").click();
    await day(dp, "2026-09-10").click();
    await day(dp, "2026-09-15").click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const ev = await last(p2);
    await c2.close();
    ok("a range in America/New_York keeps its dates", ev.value === "2026-09-10 ~ 2026-09-15" && ev.date?.start === "2026-09-10T04:00:00.000Z", JSON.stringify(ev));
  });

  // ── 하단 버튼 · 즉시 적용 ────────────────────────────────────
  await step("today appears only in single mode", async () => {
    await go("components/date-picker.html");
    const one = dpOf("default"), rg = dpOf("range");
    await toTop(one); await openCal(one);
    const a = await one.evaluate((e) => !!e.querySelector('[data-cal="today"]')); await page.keyboard.press("Escape");
    await toTop(rg); await openCal(rg);
    const c = await rg.evaluate((e) => !!e.querySelector('[data-cal="today"]')); await page.keyboard.press("Escape");
    ok("today appears only in single mode", a && !c, JSON.stringify({ single: a, range: c }));
  });
  await step("cancel restores the value from before opening", async () => {
    const dp = dpOf("footer", 0);
    await toTop(dp); await openCal(dp);
    await day(dp, "2026-09-10").click();
    await dp.locator('.calendar [data-cal="cancel"]').click();
    const r = await state(dp), focus = await dp.evaluate((e) => document.activeElement === e.querySelector(".cal-btn"));
    ok("cancel restores the value from before opening", r.v === "2026-09-07" && r.t === "2026. 09. 07" && !r.open && focus, JSON.stringify({ r, focus }));
  });
  await step("reset clears the value", async () => {
    const dp = dpOf("footer", 0);
    await openCal(dp);
    await dp.locator('.calendar [data-cal="reset"]').click();
    const on = await dp.evaluate((e) => e.querySelectorAll(".calendar .day.on").length);
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await state(dp);
    ok("reset clears the value", on === 0 && r.v === null && r.t === "" && r.val === "empty" && !r.err, JSON.stringify({ on, r }));
  });
  await step("without a footer a pick applies and closes", async () => {
    const one = dpOf("footer", 1), rg = dpOf("footer", 2);
    await toTop(one); await openCal(one);
    const foot = await one.evaluate((e) => !!e.querySelector(".cal-foot"));
    await day(one, "2026-10-10").click();
    const a = await state(one);
    await openCal(rg);
    await day(rg, "2026-10-05").click();
    const mid = await rg.evaluate((e) => e.classList.contains("open"));
    await day(rg, "2026-10-09").click();
    const c = await state(rg);
    ok("without a footer a pick applies and closes", !foot && a.v === "2026-10-10" && a.t === "2026. 10. 10" && !a.open && mid && c.s === "2026-10-05" && c.e === "2026-10-09" && c.t === "2026. 10. 05 ~ 2026. 10. 09" && !c.open, JSON.stringify({ foot, a, mid, c }));
  });
  await step("apply stays off until the value changes", async () => {
    const dp = dpOf("default");
    await toTop(dp); await openCal(dp);
    const off = await dp.evaluate((e) => e.querySelector('[data-cal="apply"]').disabled);
    await day(dp, "2026-10-10").click();
    const on = await dp.evaluate((e) => e.querySelector('[data-cal="apply"]').disabled);
    ok("apply stays off until the value changes", off && !on, JSON.stringify({ off, on }));
    await page.keyboard.press("Escape");
  });

  // ── 자리 · 겹침 ────────────────────────────────────────────
  await step("Escape closes the focused picker and leaves another open one", async () => {
    await go("components/date-picker.html");
    const [a, b2] = [dpOf("size", 0), dpOf("size", 1)];
    await toTop(a);
    await b2.locator(".cal-btn").focus(); await page.keyboard.press("Enter");
    await a.locator(".cal-btn").focus(); await page.keyboard.press("Enter");   // 포커스로 열면 바깥 클릭이 없어 둘 다 열린다
    const both = await page.evaluate(() => document.querySelectorAll("#ex-date-picker-size .datepicker.open").length);
    await page.keyboard.press("Escape");
    const r = await page.evaluate(() => [...document.querySelectorAll("#ex-date-picker-size .datepicker")].map((e) => e.classList.contains("open")));
    ok("Escape closes the focused picker and leaves another open one", both === 2 && r.join() === "false,true,false", JSON.stringify({ both, r }));
    await b2.locator(".cal-btn").click();
  });
  await step("the calendar opens 4px under the input box, not under its help text", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("min-max", 0);
    await toTop(dp); await openCal(dp);
    const r = await dp.evaluate((e) => { const c = e.querySelector(".calendar").getBoundingClientRect(), a = e.querySelector(".affix").getBoundingClientRect(); return { gap: Math.round(c.top - a.bottom), open: e.classList.contains("open") }; });
    ok("the calendar opens 4px under the input box, not under its help text", r.open && Math.abs(r.gap - 4) <= 1, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("an open calendar is not clipped by the example section", async () => {
    const dp = dpOf("default");
    await toTop(dp); await openCal(dp);
    const r = await dp.evaluate((e) => { const cal = e.querySelector(".calendar"), c = cal.getBoundingClientRect(), p = e.closest(".example").getBoundingClientRect(); return { below: c.bottom > p.bottom, vis: getComputedStyle(e.closest(".example")).overflow, hit: document.elementFromPoint(c.left + 20, c.bottom - 20)?.closest(".calendar") === cal }; });
    ok("an open calendar is not clipped by the example section", r.below && r.vis === "visible" && r.hit, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("the calendar flips above the field near the viewport bottom and re-measures", async () => {
    const dp = dpOf("size", 1);   // 페이지 맨 위 예제는 화면 아래로 내릴 수 없다
    await dp.evaluate((e) => { e.scrollIntoView({ block: "end", behavior: "instant" }); window.scrollBy(0, 20); });
    await openCal(dp);
    const gap = () => dp.evaluate((e) => Math.round(e.querySelector(".affix").getBoundingClientRect().top - e.querySelector(".calendar").getBoundingClientRect().bottom));
    const up = await dp.evaluate((e) => ({ up: e.classList.contains("up"), top: Math.round(e.querySelector(".calendar").getBoundingClientRect().top) }));
    const gaps = [];
    for (let i = 0; i < 4; i++) { gaps.push(await gap()); await dp.locator('.calendar .cal-nav[data-nav="1"]').click(); }
    await dp.locator(".calendar .cal-title").click();
    gaps.push(await gap());
    ok("the calendar flips above the field near the viewport bottom and re-measures", up.up && up.top >= 0 && gaps.every((g) => Math.abs(g - 4) <= 1), JSON.stringify({ up, gaps }));
    await page.keyboard.press("Escape");
  });
  await step("picking a dimmed day of another month moves there", async () => {
    await go("components/date-picker.html");
    const dp = dpOf("default");
    await toTop(dp); await openCal(dp);
    await dp.locator('.calendar .day.muted[data-date="2026-09-30"]').click();   // 10월 화면 앞쪽의 흐린 9/30
    const r = await dp.evaluate((e) => ({ title: e.querySelector(".cal-title").textContent, on: e.querySelector(".day.on")?.dataset.date, mutedOn: e.querySelectorAll(".day.muted.on").length, stop: e.querySelector('.cal-grid [tabindex="0"]')?.dataset.date }));
    ok("picking a dimmed day of another month moves there", r.title === "2026년 9월" && r.on === "2026-09-30" && r.mutedOn === 0 && r.stop === "2026-09-30", JSON.stringify(r));
    await page.keyboard.press("Escape");
  });

  // ── 사람의 결정(2026-10-27) — 띠 진하게 · 흐린 날 · 툴바 처음 값 ─────
  await step("the range band uses the stronger tint and dimmed days differ from disabled ones", async () => {
    const dp = dpOf("range");
    await toTop(dp); await openCal(dp);
    const r = await dp.evaluate((e) => { const c = (sel, p = "color") => getComputedStyle(e.querySelector(sel))[p]; return { band: c(".day.in-range", "backgroundColor"), dis: c('.day[aria-disabled="true"]') }; }).catch(() => null);
    const want = { band: await tok("--surface-brand-subtle-strong", "backgroundColor"), dis: await tok("--foreground-disable-primary") };
    await page.keyboard.press("Escape");
    const muted = await page.locator(`${ex("calendar")} .calendar .day.muted`).first().evaluate((d) => getComputedStyle(d).color), tert = await tok("--foreground-neutral-tertiary");
    ok("the range band uses the stronger tint and dimmed days differ from disabled ones", r && r.band === want.band && r.dis === want.dis && muted === tert && muted !== want.dis, JSON.stringify({ r, muted, tert, want }));
  });
  await step("the search toolbar starts with the last 7 days and selects a range", async () => {
    await go("patterns/search.html");
    const dp = page.locator(".example-preview .datepicker").first();
    const first = await state(dp);
    await toTop(dp); await openCal(dp);
    const two = await dp.evaluate((e) => e.querySelectorAll(".cal-month").length);
    await day(dp, "2026-10-05").click();
    await day(dp, "2026-10-09").click();
    await dp.locator('.calendar [data-cal="apply"]').click();
    const r = await state(dp);
    ok("the search toolbar starts with the last 7 days and selects a range", first.t === "2026. 10. 21 ~ 2026. 10. 27" && first.s === "2026-10-21" && first.e === "2026-10-27" && two === 2 && r.t === "2026. 10. 05 ~ 2026. 10. 09", JSON.stringify({ first, two, r }));
    await go("components/date-picker.html");
  });

  // ── 크기 · 상태 ────────────────────────────────────────────
  await step("sizes match the Text Field heights", async () => {
    const dp = await page.evaluate(() => [...document.querySelectorAll("#ex-date-picker-size .example-preview .affix")].map((x) => Math.round(x.getBoundingClientRect().height)));
    await go("components/text-field.html");
    const tf = await page.evaluate(() => [...document.querySelectorAll("#ex-text-field-size .example-preview input")].map((x) => Math.round(x.getBoundingClientRect().height)));
    ok("sizes match the Text Field heights", dp.join() === "32,40,48" && tf.join() === dp.join(), JSON.stringify({ dp, tf }));
    await go("components/date-picker.html");
  });
  await step("disabled and read-only fields don't open", async () => {
    const dis = dpOf("state", 0), ro = dpOf("state", 1);
    await toTop(dis);
    /* 비활성 버튼은 마우스 클릭이 가지 않으므로(force 클릭은 그 자리의 다른 요소를 누른다) 클릭 이벤트를 직접 보내 ds.js 의 가드를 잰다 */
    await dis.locator(".cal-btn").dispatchEvent("click");
    await ro.locator(".cal-btn").dispatchEvent("click");
    const r = await page.evaluate(() => { const [d, o] = document.querySelectorAll("#ex-date-picker-state .example-preview .datepicker"), a = getComputedStyle(d.querySelector(".affix")), i = getComputedStyle(d.querySelector("input")); return { dOpen: d.classList.contains("open"), oOpen: o.classList.contains("open"), bg: a.backgroundColor, color: i.color, op: a.opacity, roBg: getComputedStyle(o.querySelector(".affix")).backgroundColor, roVal: o.querySelector("input").value, roRO: o.querySelector("input").readOnly }; });
    const want = { bg: await tok("--surface-disable-primary", "backgroundColor"), color: await tok("--foreground-disable-primary"), roBg: await tok("--background-neutral-secondary", "backgroundColor") };
    ok("disabled and read-only fields don't open", !r.dOpen && !r.oOpen && r.bg === want.bg && r.color === want.color && r.op === "1" && r.roBg === want.roBg && r.roVal === "2026. 09. 07" && r.roRO, JSON.stringify({ r, want }));
  });
  await step("read-only ignores ↑↓", async () => {
    const ro = dpOf("state", 1);
    await ro.locator("input").evaluate((e) => { e.focus(); e.setSelectionRange(2, 2); });
    await page.keyboard.press("ArrowUp");
    const v = await ro.locator("input").inputValue();
    ok("read-only ignores ↑↓", v === "2026. 09. 07", v);
  });

  ok("date picker pages raise no JS errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
};
