/* Date Picker 시각 옵션 동작 단정(2026-11-10) — behave.js 가 부른다.
   값 하나 YYYY. MM. DD HH:mm(24시간제, data-time="seconds" 면 초까지). 달력 아래 시각 칸 · 처음 값 00:00 · 기간 끝 23:59(사람의 결정).
   오늘을 2026-10-27 10:00(Asia/Seoul)로 고정한다 — 달력 칸과 시간대 값이 기계 시각에 흔들리지 않게 */
module.exports = async ({ b, ok, SITE, path }) => {
  const NOW = new Date("2026-10-27T01:00:00Z");
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: "Asia/Seoul" });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(NOW); page.setDefaultTimeout(2000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const fresh = async () => { await page.goto("file://" + path.join(SITE, "components/date-picker.html")); await page.waitForTimeout(150); await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.__dsd = []; document.addEventListener("ds:date", (e) => { const d = e.detail, iso = (x) => (x instanceof Date ? (isNaN(x.getTime()) ? "NaN" : x.toISOString()) : x); window.__dsd.push({ ...d, date: d.date && !(d.date instanceof Date) ? { start: iso(d.date.start), end: iso(d.date.end) } : iso(d.date) }); }); }); };
  const dpOf = (id, n = 0) => page.locator(`#ex-date-picker-${id} .example-preview .datepicker`).nth(n);
  const single = () => dpOf("time"), sec = () => dpOf("time", 1), range = () => dpOf("time-range");
  const toTop = (loc) => loc.evaluate((e) => { e.scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy(0, -140); });
  const day = (dp, k) => dp.locator(`.calendar .day[data-date="${k}"]:not(.muted)`);
  const state = (dp) => dp.evaluate((e) => ({ v: e.dataset.value || null, s: e.dataset.start || null, e: e.dataset.end || null, t: e.querySelector(":scope > .affix input").value, val: e.dataset.validity || null, err: e.classList.contains("error"), msg: (e.querySelector(".help") || {}).textContent || "", open: e.classList.contains("open") }));
  const typeInto = async (dp, digits) => { const i = dp.locator(":scope > .affix input"); await i.fill(""); await i.pressSequentially(digits); await i.press("Enter"); return state(dp); };
  const clear = async (dp) => { const i = dp.locator(":scope > .affix input"); await i.fill(""); await i.press("Enter"); };
  const openCal = async (dp) => { await toTop(dp); await dp.locator(".cal-btn").click(); };
  const last = async () => (await page.evaluate(() => window.__dsd)).pop() || {};
  const clockVals = (dp) => dp.locator(".cal-time input").evaluateAll((l) => l.map((i) => i.value));
  const applyBtn = (dp) => dp.locator('.calendar [data-cal="apply"]');
  const set = (dp, a, v) => dp.evaluate((e, [x, y]) => e.setAttribute(x, y), [a, v]);
  const caret = (dp, at) => dp.locator(":scope > .affix input").evaluate((e, p) => { e.focus(); e.setSelectionRange(p, p); }, at);

  await fresh();

  // ── 필드 글자 ──────────────────────────────────────────────
  await step("time field cuts digits into date and clock", async () => {
    const r = await typeInto(single(), "202609081430"), ev = await last();
    ok("time field cuts digits into date and clock", r.t === "2026. 09. 08 14:30" && r.v === "2026-09-08 14:30" && r.val === "valid" && !r.err, JSON.stringify(r));
    ok("time ds:date carries the value and the instant", ev.value === "2026-09-08 14:30" && ev.date === "2026-09-08T05:30:00.000Z" && ev.validity === "valid" && ev.text === r.t, JSON.stringify(ev));
  });
  await step("hour 3-9 and minute 6-9 get a leading zero", async () => {
    const h = await typeInto(single(), "20260907905"), m = await typeInto(single(), "20260907147");
    ok("hour 3-9 and minute 6-9 get a leading zero", h.t === "2026. 09. 07 09:05" && m.t.startsWith("2026. 09. 07 14:07"), h.t + " | " + m.t);
  });
  await step("hour 2 waits for its second digit", async () => { const i = single().locator(":scope > .affix input"); await i.fill(""); await i.pressSequentially("202609072"); const t = await i.inputValue(); ok("hour 2 waits for its second digit", t === "2026. 09. 07 2", t); });
  await step("seconds field takes 14 digits", async () => {
    const r = await typeInto(sec(), "20260907143007");
    ok("seconds field takes 14 digits", r.t === "2026. 09. 07 14:30:07" && r.v === "2026-09-07 14:30:07" && r.val === "valid", JSON.stringify(r));
    const s9 = await typeInto(sec(), "2026090714309");
    ok("second 6-9 gets a leading zero", s9.t === "2026. 09. 07 14:30:09", s9.t);
  });
  await step("pasting a machine value formats it", async () => {
    const i = single().locator(":scope > .affix input");
    const t = await i.evaluate((e) => { e.focus(); e.value = "2026-9-7 14:30"; e.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertFromPaste" })); return e.value; });
    ok("pasting a machine value formats it", t === "2026. 09. 07 14:30", t);
    await i.press("Enter");
  });
  await step("a date without time is incomplete", async () => {
    const r = await typeInto(single(), "20260907");
    ok("a date without time is incomplete", r.val === "incomplete" && r.err && r.msg.includes("덜 입력됐습니다") && r.msg.includes("2026. 09. 07 14:30") && !r.v, JSON.stringify(r));
  });
  await step("a missing clock names the time", async () => {
    const r = await typeInto(single(), "202609072500");
    ok("a missing clock names the time", r.val === "invalid" && r.msg.startsWith("시각이 24시간제 형식이 아닙니다") && r.msg.includes("24시간제") && !r.v, JSON.stringify(r));
    const d = await typeInto(single(), "202602301200");
    ok("a missing date still names the date", d.val === "invalid" && d.msg.startsWith("날짜가 달력에 없습니다"), d.msg);
  });
  await step("the parser rejects what typing cannot produce", async () => {
    const raw = async (dp, v) => { const i = dp.locator(":scope > .affix input"); await i.evaluate((e, x) => { e.value = x; }, v); await i.press("Enter"); return state(dp); };
    const m = await raw(single(), "2026. 09. 07 14:60");
    ok("minute 60 is not a time", m.val === "invalid" && !m.v, JSON.stringify(m));
    const c = await raw(sec(), "2026. 09. 07 14:30:60");
    ok("second 60 is not a time", c.val === "invalid" && !c.v, JSON.stringify(c));
    const x = await raw(single(), "2026. 09. 07 14:30 99");
    ok("extra pieces are not a time", x.val === "invalid" && !x.v, JSON.stringify(x));
  });
  await step("range names the wrong clock side", async () => {
    const r = await typeInto(range(), "202609070900202609082500");
    ok("range names the wrong clock side", r.val === "invalid" && r.msg.startsWith("종료 시각이 24시간제 형식이 아닙니다"), r.msg);
    const s = await typeInto(range(), "202609072500202609080900");
    ok("range names the wrong start clock", s.msg.startsWith("시작 시각이 24시간제 형식이 아닙니다"), s.msg);
    const b = await typeInto(range(), "202609072500202609082500");
    ok("both clocks wrong says time", b.msg.startsWith("시각이 24시간제 형식이 아닙니다"), b.msg);
  });
  await step("same-day order compares the clock", async () => {
    const r = await typeInto(range(), "202609071800202609070900");
    ok("same-day order compares the clock", r.val === "order" && r.msg === "종료 시각이 시작 시각보다 빠릅니다. 시작과 같거나 늦은 시각으로 바꾸세요." && r.s === "2026-09-07 18:00" && r.e === "2026-09-07 09:00", JSON.stringify(r));
    const o = await typeInto(range(), "202609081800202609070900");
    ok("different-day order keeps the date message", o.val === "order" && o.msg.startsWith("종료일이 시작일보다"), o.msg);
    const g = await typeInto(range(), "202609070900202609071800");
    ok("same-day forward range is valid", g.val === "valid" && g.s === "2026-09-07 09:00" && g.e === "2026-09-07 18:00" && !g.err, JSON.stringify(g));
  });
  await step("arrow keys wrap hour and minute without carry", async () => {
    const dp = single(); await typeInto(dp, "202609072359");
    await caret(dp, 15); await page.keyboard.press("ArrowUp");
    let r = await state(dp);
    ok("ArrowUp on the hour wraps 23 to 00 and keeps the date", r.t === "2026. 09. 07 00:59" && r.v === "2026-09-07 00:59", r.t);
    await caret(dp, 18); await page.keyboard.press("ArrowUp");
    r = await state(dp);
    ok("ArrowUp on the minute wraps 59 to 00 and keeps the hour", r.t === "2026. 09. 07 00:00", r.t);
    await caret(dp, 15); await page.keyboard.press("ArrowDown");
    r = await state(dp);
    ok("ArrowDown on the hour wraps 00 to 23", r.t === "2026. 09. 07 23:00", r.t);
    await caret(dp, 10); await page.keyboard.press("ArrowUp");
    r = await state(dp);
    ok("ArrowUp on the day still moves the date", r.t === "2026. 09. 08 23:00", r.t);
    const s = sec(); await typeInto(s, "20260907143059");
    await caret(s, 21); await page.keyboard.press("ArrowUp");
    r = await state(s);
    ok("ArrowUp on the second wraps 59 to 00", r.t === "2026. 09. 07 14:30:00", r.t);
  });

  await step("arrows fill a missing clock", async () => {
    const dp = single(), i = dp.locator(":scope > .affix input");
    await i.fill("2026. 09. 07"); await caret(dp, 12); await page.keyboard.press("ArrowUp");
    let r = await state(dp);
    ok("an empty clock fills with 00:00", r.t === "2026. 09. 08 00:00", r.t);
    const g = range(), j = g.locator(":scope > .affix input");
    await j.fill("2026. 09. 07 09:00 ~ 2026. 09. 08"); await caret(g, 33); await page.keyboard.press("ArrowUp");
    r = await state(g);
    ok("an empty end clock fills with 23:59", r.t === "2026. 09. 07 09:00 ~ 2026. 09. 09 23:59", r.t);
  });
  await step("a time on a month picker is ignored", async () => {
    await fresh();
    await page.evaluate(() => { const o = document.querySelector('#ex-date-picker-unit .example-preview .datepicker[data-unit="month"]'), h = o.cloneNode(true); ["data-value", "data-validity"].forEach((a) => h.removeAttribute(a)); h.setAttribute("data-time", ""); h.id = "dp-month-time"; const i = h.querySelector(":scope > .affix input"); i.id = "dp-month-time-i"; i.value = ""; i.setAttribute("value", ""); h.querySelector("label").setAttribute("for", i.id); const c = h.querySelector(".calendar"); if (c) c.remove(); h.classList.remove("open"); o.parentNode.append(h); });
    const dp = page.locator("#dp-month-time"), r = await typeInto(dp, "202609");
    ok("a time on a month picker is ignored", r.v === "2026-09" && r.t === "2026. 09" && r.val === "valid", JSON.stringify(r));
    await openCal(dp);
    ok("a month picker has no time field", await dp.locator(".cal-time").count() === 0);
    await page.keyboard.press("Escape");
  });

  // ── 범위 · 시간대 ──────────────────────────────────────────
  await step("max with a time blocks past that moment", async () => {
    await fresh(); const dp = single(); await set(dp, "data-max", "2026-09-07 18:00");
    const over = await typeInto(dp, "202609071801"), edge = await typeInto(dp, "202609071800");
    ok("max with a time blocks past that moment", over.val === "max" && edge.val === "valid", over.val + " " + edge.val);
    await dp.evaluate((e) => e.removeAttribute("data-max")); await set(dp, "data-min", "2026-09-07 09:00");
    const under = await typeInto(dp, "202609070859"), at = await typeInto(dp, "202609070900");
    ok("min with a time blocks before that moment", under.val === "min" && at.val === "valid", under.val + " " + at.val);
    await dp.evaluate((e) => e.removeAttribute("data-min"));
  });
  await step("date-only max means the whole day", async () => {
    const dp = single(); await set(dp, "data-max", "2026-09-07");
    const end = await typeInto(dp, "202609072359"), next = await typeInto(dp, "202609080000");
    ok("date-only max means the whole day", end.val === "valid" && next.val === "max", end.val + " " + next.val);
    await set(dp, "data-max", "today");
    const t = await typeInto(dp, "202610272359"), n = await typeInto(dp, "202610280000");
    ok("data-max today covers the whole of today", t.val === "valid" && n.val === "max", t.val + " " + n.val);
    await dp.evaluate((e) => e.removeAttribute("data-max"));
  });
  await step("timezone exports that wall clock", async () => {
    await fresh(); const dp = single(); await set(dp, "data-timezone", "America/New_York");
    await typeInto(dp, "202609081430");
    const ev = await last();
    ok("timezone exports that wall clock", ev.date === "2026-09-08T18:30:00.000Z" && ev.value === "2026-09-08 14:30", JSON.stringify(ev));
  });

  // ── 달력의 시각 칸 ─────────────────────────────────────────
  await step("an empty picker starts at 00:00", async () => {
    await fresh(); const dp = single(); await clear(dp); await openCal(dp);
    ok("an empty picker starts at 00:00", (await clockVals(dp)).join() === "00:00", (await clockVals(dp)).join());
    await day(dp, "2026-10-14").click();
    ok("picking a date waits for apply", (await state(dp)).open && await applyBtn(dp).isEnabled());
    await applyBtn(dp).click();
    const r = await state(dp);
    ok("apply joins the date and the default time", r.t === "2026. 10. 14 00:00" && r.v === "2026-10-14 00:00" && r.val === "valid" && !r.open, JSON.stringify(r));
  });
  await step("seconds default to 00:00:00", async () => { const dp = sec(); await clear(dp); await openCal(dp); ok("seconds default to 00:00:00", (await clockVals(dp)).join() === "00:00:00", (await clockVals(dp)).join()); await page.keyboard.press("Escape"); });
  await step("an empty range ends at 23:59", async () => {
    const dp = range(); await clear(dp); await openCal(dp);
    ok("an empty range starts 00:00 and ends 23:59", (await clockVals(dp)).join() === "00:00,23:59", (await clockVals(dp)).join());
    const labels = await dp.locator(".cal-time label").allTextContents();
    ok("range time fields are named start and end", labels.join() === "시작 시각,종료 시각", labels.join());
    await day(dp, "2026-10-05").click(); await day(dp, "2026-10-05").click(); await applyBtn(dp).click();
    const r = await state(dp);
    ok("a one-day range covers the whole day", r.s === "2026-10-05 00:00" && r.e === "2026-10-05 23:59" && r.val === "valid", JSON.stringify(r));
  });
  await step("a range shows both clocks side by side", async () => {
    await fresh(); const dp = range(); await openCal(dp);
    ok("a filled range shows both of its clocks", (await clockVals(dp)).join() === "09:00,18:30", (await clockVals(dp)).join());
    const r = await dp.locator(".cal-time").evaluate((e) => { const b = e.getBoundingClientRect(), [x, y] = [...e.children].map((c) => c.getBoundingClientRect()); return { t: x.top === y.top, gap: y.left - x.right, w: x.width === y.width, end: Math.abs(y.right - b.right) < 1 }; });
    ok("range time fields share the row evenly", r.t && r.gap === 12 && r.w && r.end, JSON.stringify(r));
    await page.keyboard.press("Escape");
  });
  await step("typing in the field while open moves the clock", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    const i = dp.locator(":scope > .affix input"); await i.fill(""); await i.pressSequentially("202609080715"); await i.press("Enter");
    const r = await state(dp);
    ok("typing in the field while open moves the clock", r.open && (await clockVals(dp)).join() === "07:15", JSON.stringify(r) + (await clockVals(dp)).join());
    await page.keyboard.press("Escape");
  });
  await step("seconds time field", async () => {
    await fresh(); const dp = sec(); await openCal(dp);
    const i = dp.locator(".cal-time input"); await i.fill(""); await i.pressSequentially("143007");
    ok("the seconds time field formats HH:mm:ss", await i.inputValue() === "14:30:07", await i.inputValue());
    await page.keyboard.press("Escape");
  });
  await step("changing the date keeps the time", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    ok("the panel shows the field time", (await clockVals(dp)).join() === "14:30", (await clockVals(dp)).join());
    ok("apply is off until something changes", await applyBtn(dp).isDisabled());
    await day(dp, "2026-09-10").click();
    ok("changing the date keeps the time", (await clockVals(dp)).join() === "14:30", (await clockVals(dp)).join());
    await applyBtn(dp).click();
    ok("apply keeps the time on the new date", (await state(dp)).v === "2026-09-10 14:30", JSON.stringify(await state(dp)));
  });
  await step("typing in the time field", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    const i = dp.locator(".cal-time input");
    await i.fill(""); await i.pressSequentially("0915");
    ok("the time field formats HH:mm", await i.inputValue() === "09:15", await i.inputValue());
    ok("changing the time enables apply", await applyBtn(dp).isEnabled());
    await i.fill(""); await i.pressSequentially("915");
    ok("time field hour 3-9 gets a leading zero", await i.inputValue() === "09:15", await i.inputValue());
    await i.press("Enter");
    const r = await state(dp);
    ok("Enter in the time field applies and closes", r.v === "2026-09-07 09:15" && !r.open, JSON.stringify(r));
    ok("Enter returns focus to the field", await page.evaluate(() => !!document.activeElement.closest(".affix")));
  });
  await step("Enter in the time field does nothing while apply is off", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    await dp.locator(".cal-time input").press("Enter");
    ok("Enter in the time field does nothing while apply is off", (await state(dp)).open);
    await page.keyboard.press("Escape");
  });
  await step("arrows step the time field", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    const i = dp.locator(".cal-time input"); await i.fill(""); await i.pressSequentially("2359");
    await i.evaluate((e) => e.setSelectionRange(1, 1)); await i.press("ArrowUp");
    ok("ArrowUp on the panel hour wraps", await i.inputValue() === "00:59", await i.inputValue());
    await i.evaluate((e) => e.setSelectionRange(4, 4)); await i.press("ArrowUp");
    ok("ArrowUp on the panel minute wraps", await i.inputValue() === "00:00", await i.inputValue());
    ok("arrows leave the calendar focus alone", await i.evaluate((e) => document.activeElement === e));
    ok("arrow steps do not touch the value before apply", (await state(dp)).v === "2026-09-07 14:30");
    await i.evaluate((e) => e.setSelectionRange(1, 1)); await i.press("ArrowUp"); await i.press("ArrowUp");
    ok("repeated arrows stay on the same piece", await i.inputValue() === "02:00", await i.inputValue());
    await i.press("ArrowDown");
    ok("panel arrows enable apply", await applyBtn(dp).isEnabled());
    await page.keyboard.press("Escape");
  });
  await step("a bad panel time reports on the field", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    const i = dp.locator(".cal-time input"); await i.fill(""); await i.pressSequentially("2500"); await applyBtn(dp).click();
    const r = await state(dp);
    ok("a bad panel time reports on the field", r.val === "invalid" && r.msg.startsWith("시각이 24시간제 형식이 아닙니다") && r.t === "2026. 09. 07 25:00" && !r.open, JSON.stringify(r));
    await openCal(dp); const v = await clockVals(dp);
    ok("reopening after a bad value falls back to the default", v.join() === "00:00", v.join());
    await page.keyboard.press("Escape");
    await openCal(dp); const j = dp.locator(".cal-time input"); await j.fill(""); await j.pressSequentially("09"); await day(dp, "2026-10-10").click(); await applyBtn(dp).click();
    const n = await state(dp);
    ok("a half panel time is incomplete", n.val === "incomplete" && n.t === "2026. 10. 10 09", JSON.stringify(n));
  });
  await step("a panel range can be reversed within a day", async () => {
    await fresh(); const dp = range(); await clear(dp); await openCal(dp);
    await day(dp, "2026-10-05").click(); await day(dp, "2026-10-05").click();
    const ins = dp.locator(".cal-time input"); await ins.nth(0).fill(""); await ins.nth(0).pressSequentially("1800"); await ins.nth(1).fill(""); await ins.nth(1).pressSequentially("0900"); await applyBtn(dp).click();
    const r = await state(dp);
    ok("a panel range can be reversed within a day", r.val === "order" && r.msg.startsWith("종료 시각이"), JSON.stringify(r));
  });
  await step("Tab cycles through the time field", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    await dp.locator(".cal-time input").focus();
    await page.keyboard.press("Tab");
    const btn = await page.evaluate(() => { const a = document.activeElement; return a.classList.contains("tp-btn") && !!a.closest(".cal-time .timepicker"); });
    ok("Tab from the time field goes to its clock button (2026-11-13 — the field is a Time Picker)", btn);
    await page.keyboard.press("Tab");
    const apply = await dp.evaluate((e) => document.activeElement.dataset.cal || document.activeElement.textContent);
    await day(dp, "2026-09-10").click(); await dp.locator(".cal-time input").focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
    const a2 = await page.evaluate(() => document.activeElement.dataset.cal || "");
    await page.keyboard.press("Tab");
    const wrap = await page.evaluate(() => document.activeElement.className);
    ok("Tab from the time field stays in the calendar and wraps", !!apply && a2 === "apply" && /cal-nav/.test(wrap), `${apply} ${a2} ${wrap}`);
    await page.keyboard.press("Shift+Tab");
    ok("Shift+Tab wraps back to the last control", await page.evaluate(() => document.activeElement.dataset.cal === "apply"));
    await page.keyboard.press("Escape");
  });
  await step("the time field can be the last stop", async () => {
    await fresh(); const dp = single(); await set(dp, "data-footer", "apply"); await openCal(dp);
    await dp.locator(".cal-time .tp-btn").focus();
    await page.keyboard.press("Tab");
    ok("Tab from the last stop wraps inside the calendar", await page.evaluate(() => /cal-nav/.test(document.activeElement.className)), await page.evaluate(() => document.activeElement.className));
    await dp.locator(".cal-time input").focus();
    await page.keyboard.press("Shift+Tab");
    ok("Shift+Tab from the time field goes back one", await page.evaluate(() => !!document.activeElement.closest(".cal-grid")), await page.evaluate(() => document.activeElement.className));
    await page.keyboard.press("Escape");
  });
  await step("the time field only shows on the day view", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    await dp.locator(".cal-title").first().click();
    ok("the time field only shows on the day view", await dp.locator(".cal-time").count() === 0);
    await page.keyboard.press("Escape");
  });
  await step("a time picker always has apply", async () => {
    await fresh(); const dp = single(); await set(dp, "data-footer", "none"); await openCal(dp);
    ok("a time picker always has apply", await applyBtn(dp).count() === 1);
    await day(dp, "2026-09-10").click();
    ok("picking does not close it even with data-footer none", (await state(dp)).open);
    await page.keyboard.press("Escape");
  });
  await step("today keeps the time and reset restores it", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    await dp.locator('.calendar [data-cal="today"]').click();
    ok("today keeps the time", (await clockVals(dp)).join() === "14:30" && await day(dp, "2026-10-27").getAttribute("class").then((c) => /\bon\b/.test(c)));
    await applyBtn(dp).click();
    ok("today applies with the kept time", (await state(dp)).v === "2026-10-27 14:30");
    await fresh(); const r = single(); await set(r, "data-footer", "reset apply"); await openCal(r);
    await r.locator('.calendar [data-cal="reset"]').click();
    ok("reset restores the default time", (await clockVals(r)).join() === "00:00", (await clockVals(r)).join());
    await page.keyboard.press("Escape");
  });
  await step("presets cover whole days", async () => {
    await fresh(); const dp = range(); await set(dp, "data-presets", "7"); await openCal(dp);
    await dp.locator('.calendar [data-preset="7"]').click();
    const r = await state(dp);
    ok("presets cover whole days", r.s === "2026-10-21 00:00" && r.e === "2026-10-27 23:59" && !r.open, JSON.stringify(r));
  });
  await step("default preset ends at the end of today", async () => {
    await fresh();
    const r = await page.evaluate(() => { const h = document.querySelector("#ex-date-picker-time-range .example-preview .datepicker").cloneNode(true); h.removeAttribute("data-validity"); h.removeAttribute("data-start"); h.removeAttribute("data-end"); h.setAttribute("data-default-preset", "7"); const inp = h.querySelector(":scope > .affix input"); inp.id = "dp-time-clone"; inp.value = ""; inp.setAttribute("value", ""); h.querySelector("label").setAttribute("for", "dp-time-clone"); document.querySelector("#ex-date-picker-time-range .example-preview").append(h); h.querySelector(".cal-btn").click(); h.querySelector(".cal-btn").click(); const d = { s: h.dataset.start, e: h.dataset.end, t: inp.value }; h.remove(); return d; });
    ok("default preset ends at the end of today", r.s === "2026-10-21 00:00" && r.e === "2026-10-27 23:59", JSON.stringify(r));
  });

  // ── 문구 · 모양 ────────────────────────────────────────────
  await step("data-labels name the time fields", async () => {
    await fresh(); const dp = range(); await set(dp, "data-labels", JSON.stringify({ startTime: "From", endTime: "To" })); await openCal(dp);
    const l = await dp.locator(".cal-time label").allTextContents();
    ok("data-labels name the time fields", l.join() === "From,To", l.join());
    await page.keyboard.press("Escape");
    const s = single(); await set(s, "data-labels", JSON.stringify({ time: "At" })); await openCal(s);
    ok("data-labels name the single time field", await s.locator(".cal-time label").textContent() === "At");
    await page.keyboard.press("Escape");
  });
  await step("data-messages reword the time errors", async () => {
    await fresh(); const dp = single(); await set(dp, "data-messages", JSON.stringify({ invalidTime: "{subject} is wrong, like {example}", timeSubject: "Time" }));
    const r = await typeInto(dp, "202609072500");
    ok("data-messages reword the time errors", r.msg === "Time is wrong, like 2026. 09. 07 14:30", r.msg);
    const g = range(); await set(g, "data-messages", JSON.stringify({ orderTime: "End is before start" }));
    const o = await typeInto(g, "202609071800202609070900");
    ok("data-messages reword the same-day order", o.msg === "End is before start", o.msg);
  });
  await step("the time field stays small and neutral inside an error or large field", async () => {
    await fresh(); const dp = single(); await dp.evaluate((e) => e.classList.add("lg")); await typeInto(dp, "20260907"); await openCal(dp);
    const r = await dp.locator(".cal-time .affix").evaluate((e) => { const c = getComputedStyle(e), t = document.createElement("div"); t.style.borderColor = "var(--line-neutral-primary)"; document.body.append(t); const want = getComputedStyle(t).borderColor; t.remove(); return { h: c.height, f: getComputedStyle(e.querySelector("input")).fontSize, c: c.borderColor, want, s: c.boxShadow }; });
    ok("the time field stays small and neutral inside an error or large field", r.h === "32px" && r.f === "12px" && r.c === r.want && r.s === "none", JSON.stringify(r));
    await dp.locator(".cal-time input").focus(); await page.waitForTimeout(350);   // 테두리 전환이 끝난 뒤
    const f = await dp.locator(".cal-time .affix").evaluate((e) => { const c = getComputedStyle(e), t = document.createElement("div"); t.style.borderColor = "var(--foreground-brand-primary)"; document.body.append(t); const want = getComputedStyle(t).borderColor; t.remove(); return { c: c.borderColor, want, s: c.boxShadow }; });
    ok("the time field shows the brand focus ring", f.c === f.want && f.s !== "none", JSON.stringify(f));
    await page.keyboard.press("Escape");
  });
  await step("wide values fit their field", async () => {
    await fresh();
    const r = await page.evaluate(() => {
      const fits = (host, big) => { if (big) host.classList.add("lg"); const i = host.querySelector(":scope > .affix input"), ph = i.placeholder; i.value = ""; const s = document.createElement("span"), c = getComputedStyle(i); s.style.cssText = `position:absolute;white-space:pre;font:${c.font}`; s.textContent = ph; document.body.append(s); const w = s.getBoundingClientRect().width; s.remove(); const pad = parseFloat(c.paddingLeft) + parseFloat(c.paddingRight); return { w, room: i.clientWidth - pad, width: host.getBoundingClientRect().width }; };
      const g = document.querySelector("#ex-date-picker-time-range .example-preview .datepicker"), a = fits(g, true);
      g.setAttribute("data-time", "seconds"); g.querySelector(":scope > .affix input").placeholder = "YYYY. MM. DD HH:mm:ss ~ YYYY. MM. DD HH:mm:ss"; const b2 = fits(g, true);
      return { a, b2 };
    });
    ok("a time range fits its placeholder in a large field", r.a.w <= r.a.room && r.a.width === 410, JSON.stringify(r.a));
    ok("a seconds range fits its placeholder in a large field", r.b2.w <= r.b2.room && r.b2.width === 450, JSON.stringify(r.b2));
  });
  await step("time fields stay unique without an input id", async () => {
    await fresh();
    const ids = await page.evaluate(() => { const out = []; document.querySelectorAll("#ex-date-picker-time .datepicker").forEach((h) => { h.querySelector(":scope > .affix input").removeAttribute("id"); h.querySelector(".cal-btn").click(); out.push(h.querySelector(".cal-time input").id); h.querySelector(".cal-btn").click(); }); return out; });
    ok("time fields stay unique without an input id", ids.length === 2 && ids[0] && ids[1] && ids[0] !== ids[1], ids.join());
  });

  // ── 로그 뷰어 패턴 ─────────────────────────────────────────
  await step("the log viewer queries down to the minute", async () => {
    await page.goto("file://" + path.join(SITE, "patterns/log-viewer.html")); await page.waitForTimeout(150);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const dp = page.locator(".example-preview .toolbar .datepicker").first();
    const first = await state(dp);
    ok("the log viewer starts with the last 7 whole days", first.t === "2026. 10. 21 00:00 ~ 2026. 10. 27 23:59" && first.s === "2026-10-21 00:00" && first.e === "2026-10-27 23:59" && first.val === "valid" && !first.err, JSON.stringify(first));
    const row = await page.evaluate(() => { const t = document.querySelector("#ex-log-viewer-viewer .toolbar"), a = t.querySelector(".searchbar").getBoundingClientRect(), b = t.querySelector(".datepicker").getBoundingClientRect(); return Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2); });
    ok("the log viewer keeps search and range on one line", row < 1, String(row));
    ok("the log viewer range is named", await dp.locator(":scope > .affix input").getAttribute("aria-label") === "조회 구간");
    await openCal(dp);
    ok("the log viewer calendar shows both clocks", (await clockVals(dp)).join() === "00:00,23:59", (await clockVals(dp)).join());
    const lab = await dp.locator(".cal-time label").first().evaluate((l) => !!document.getElementById(l.htmlFor));
    ok("the log viewer time labels point at their fields", lab);
    await dp.locator('.calendar [data-preset="30"]').click();
    const p = await state(dp);
    ok("a log viewer preset covers whole days", p.s === "2026-09-28 00:00" && p.e === "2026-10-27 23:59" && !p.open, JSON.stringify(p));
    const end = await typeInto(dp, "202610270900202610272359"), over = await typeInto(dp, "202610270900202610280000");
    ok("the log viewer accepts the end of today and rejects tomorrow", end.val === "valid" && over.val === "max", end.val + " " + over.val);
    const narrow = await typeInto(dp, "202610270900202610270830");
    ok("the log viewer reports a reversed clock", narrow.val === "order" && narrow.msg.startsWith("종료 시각이"), narrow.msg);
  });
  // ── 달력 안 시각 칸 = Time Picker sm(사람의 결정 2026-11-13) ──────────────
  const tpPanel = (dp) => dp.evaluate((e) => { const h = e.querySelector(".cal-time .timepicker"), p = h && h.querySelector(".time-panel"), a = document.activeElement; return { open: !!h && h.classList.contains("open"), shown: !!p && getComputedStyle(p).display === "flex", cols: p ? p.querySelectorAll(".time-col").length : 0, cal: e.classList.contains("open"), inp: h ? h.querySelector("input").value : "", act: a.classList.contains("time-opt") ? "opt:" + a.closest(".time-col").dataset.part + ":" + a.dataset.v : a.classList.contains("tp-btn") ? "btn" : a.matches(".cal-time input") ? "input" : a.className }; });
  await step("the calendar time field is a Time Picker", async () => {
    await fresh(); const dp = single(); await page.evaluate(() => { window.__tpt = 0; document.addEventListener("ds:time", () => window.__tpt++); });
    const before = await state(dp); await openCal(dp);   // 예제 처음 값의 시각 14:30
    const shape = await dp.evaluate((e) => { const h = [...e.querySelectorAll(".cal-time .timepicker")]; return { n: h.length, sm: h.every((x) => x.matches(".field.sm[data-dp-side='a']")), name: h[0]?.querySelector(".tp-btn").getAttribute("aria-label"), exp: h[0]?.querySelector(".tp-btn").getAttribute("aria-expanded"), r: h[0] && Math.round(h[0].querySelector(".tp-btn").getBoundingClientRect().height) }; });
    ok("the calendar's time field is a small Time Picker with a named clock button", shape.n === 1 && shape.sm && shape.name === "시각 선택" && shape.exp === "false" && shape.r === 28, JSON.stringify(shape));
    await dp.locator(".cal-time .tp-btn").click(); await page.waitForTimeout(40);
    const o = await tpPanel(dp);
    ok("the clock button opens the hour and minute columns inside the open calendar, on the current hour", o.open && o.shown && o.cols === 2 && o.cal && o.act === "opt:hour:14", JSON.stringify(o));
    const ring = await dp.evaluate((e) => { const t = document.createElement("div"); t.style.color = "var(--foreground-brand-primary)"; document.body.append(t); const want = getComputedStyle(t).color; t.remove(); const a = getComputedStyle(e.querySelector(".cal-time .affix")); return { b: a.borderTopColor, want, s: a.boxShadow }; });
    ok("the open time field shows the brand ring", ring.b === ring.want && ring.s !== "none", JSON.stringify(ring));
    await dp.locator('.cal-time .time-col[data-part="hour"] .time-opt[data-v="9"]').click();
    await dp.locator('.cal-time .time-col[data-part="minute"] .time-opt[data-v="5"]').click(); await page.waitForTimeout(30);
    const p = await tpPanel(dp), outer = await state(dp);
    ok("picking an hour and a minute writes the time field at once, the list and calendar stay open, the field waits for apply", p.inp === "09:05" && p.open && p.cal && outer.t === before.t, JSON.stringify([p, outer, before.t]));
    await dp.locator('.cal-time .time-col[data-part="minute"] .time-opt[data-v="5"]').focus(); await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    const e1 = await tpPanel(dp);
    ok("Esc closes only the clock list and returns to the time field", !e1.open && e1.cal && e1.act === "input", JSON.stringify(e1));
    await page.keyboard.press("Enter"); await page.waitForTimeout(40);
    const r = await state(dp);
    ok("Enter in the time field applies the picked time", r.t === before.t.replace(/\d\d:\d\d$/, "09:05") && r.t !== before.t && /09:05$/.test(r.v) && !(await dp.evaluate((e) => e.classList.contains("open"))), JSON.stringify(r));
    ok("the calendar's clock list fires no ds:time — the field's ds:date carries the value", await page.evaluate(() => window.__tpt) === 0);
  });
  await step("Alt+Down opens the clock list from the time field without stepping it", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    const i = dp.locator(".cal-time input"); await i.focus(); await page.keyboard.press("Alt+ArrowDown"); await page.waitForTimeout(40);
    const a = await tpPanel(dp);
    ok("Alt+Down opens the clock list and leaves the time as it is", a.open && a.inp === "14:30" && a.act === "opt:hour:14", JSON.stringify(a));
    await page.keyboard.press("Shift+Tab");
    ok("Shift+Tab from the first column goes back to the clock button, not around the calendar", (await tpPanel(dp)).act === "btn", JSON.stringify(await tpPanel(dp)));
    await page.keyboard.press("Escape"); await page.waitForTimeout(40);
    const eb = await tpPanel(dp);
    ok("Esc on the clock button closes only the list and returns to the time field", !eb.open && eb.cal && eb.act === "input", JSON.stringify(eb));
    await page.keyboard.press("Alt+ArrowDown"); await page.waitForTimeout(40);
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await page.waitForTimeout(30);
    const b = await tpPanel(dp);
    ok("Enter picks the hour and moves to the minute column", b.inp === "15:30" && b.act === "opt:minute:30", JSON.stringify(b));
    await page.keyboard.press("Enter"); await page.waitForTimeout(30);
    const c = await tpPanel(dp);
    ok("Enter in the last column closes the list and returns to the time field, the calendar stays open", !c.open && c.act === "input" && c.cal && c.inp === "15:30", JSON.stringify(c));
    await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    ok("the next Esc closes the calendar", !(await dp.evaluate((e) => e.classList.contains("open"))));
  });
  await step("typing in the calendar time field cuts the clock and moves the open list", async () => {
    await fresh(); const dp = single(); await openCal(dp);
    await dp.locator(".cal-time .tp-btn").click(); await page.waitForTimeout(40);
    const i = dp.locator(".cal-time input"); await i.focus(); await i.fill(""); await i.pressSequentially("0915"); await page.waitForTimeout(30);
    const t = await dp.evaluate((e) => ({ v: e.querySelector(".cal-time input").value, on: [...e.querySelectorAll(".cal-time .time-opt.on")].map((o) => o.closest(".time-col").dataset.part + ":" + o.dataset.v).join(), open: e.querySelector(".cal-time .timepicker").classList.contains("open") }));
    ok("typing digits in the calendar time field cuts them as a clock and the open list follows", t.v === "09:15" && t.on === "hour:9,minute:15" && t.open, JSON.stringify(t));
    await page.keyboard.press("Enter"); await page.waitForTimeout(40);
    ok("Enter after typing applies the typed time", /09:15$/.test((await state(dp)).t), (await state(dp)).t);
  });
  await step("range and seconds time fields are Time Pickers too", async () => {
    await fresh(); const g = range(); await openCal(g);
    const names = await g.locator(".cal-time .tp-btn").evaluateAll((l) => l.map((x) => x.getAttribute("aria-label")));
    ok("the range calendar has start and end Time Pickers", names.join() === "시작 시각 선택,종료 시각 선택", names.join());
    await g.locator(".cal-time .timepicker[data-dp-side='b'] .tp-btn").click(); await page.waitForTimeout(40);
    await g.locator('.cal-time .timepicker[data-dp-side="b"] .time-col[data-part="hour"] .time-opt[data-v="20"]').click(); await page.waitForTimeout(30);
    ok("picking in the end field changes only the end time", (await clockVals(g)).join() === "09:00,20:30", (await clockVals(g)).join());
    await page.keyboard.press("Escape"); await page.keyboard.press("Escape");
    const s = sec(); await openCal(s); await s.locator(".cal-time .tp-btn").click(); await page.waitForTimeout(40);
    const sc = await tpPanel(s);
    ok("the seconds calendar's clock list has a seconds column", sc.cols === 3 && (await s.locator(".cal-time .timepicker").getAttribute("data-seconds")) === "", JSON.stringify(sc));
    await page.keyboard.press("Escape"); await page.keyboard.press("Escape");
  });
  await step("no script errors", async () => { ok("time picker raises no script errors", errors.length === 0, errors.join(" | ")); });

  await ctx.close();
};
