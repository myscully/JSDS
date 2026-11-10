/* 이미 정비한 컴포넌트의 보강 단정(2026-11-10) — behave.js 가 부른다.
   Date Picker 기간 상한 · Breadcrumb 잘린 항목 Tooltip · 차트 표로 보기(사람의 결정 셋).
   오늘을 2026-10-27(Asia/Seoul)로 고정한다 — 달력 칸이 기계 시각에 흔들리지 않게 */
module.exports = async ({ b, ok, SITE, path }) => {
  const NOW = new Date("2026-10-27T01:00:00Z");
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: "Asia/Seoul" });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(NOW); page.setDefaultTimeout(2000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const go = async (f) => { await page.goto("file://" + path.join(SITE, f)); await page.waitForTimeout(250); await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.__dsd = []; document.addEventListener("ds:date", (e) => window.__dsd.push(e.detail)); }); };

  // ── Date Picker 기간 상한 ──────────────────────────────────
  const dp = () => page.locator("#ex-date-picker-max-days .example-preview .datepicker");
  const toTop = (loc) => loc.evaluate((e) => { e.scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy(0, -140); });
  const openCal = async (h) => { await toTop(h); await h.locator(".cal-btn").click(); };
  const day = (h, k) => h.locator(`.calendar .day[data-date="${k}"]:not(.muted)`);
  const off = (h, k) => day(h, k).evaluate((e) => e.getAttribute("aria-disabled") === "true");
  const apply = (h) => h.locator('.calendar [data-cal="apply"]');
  const state = (h) => h.evaluate((e) => ({ s: e.dataset.start || null, e: e.dataset.end || null, val: e.dataset.validity || null, help: e.querySelector(".help")?.textContent || "", inv: e.querySelector(".affix input").getAttribute("aria-invalid"), t: e.querySelector(".affix input").value }));
  const typeInto = async (h, digits) => { const i = h.locator(".affix input"); await i.fill(""); await i.pressSequentially(digits); await i.press("Enter"); return state(h); };
  const last = async () => (await page.evaluate(() => window.__dsd)).pop() || {};

  await go("components/date-picker.html");
  await step("max-days: after the start, days past the limit are off on both sides", async () => {
    await openCal(dp()); await day(dp(), "2026-09-10").click();
    const after = [await off(dp(), "2026-10-10"), await off(dp(), "2026-10-11")];
    await dp().locator('.cal-nav').first().click();
    const before = [await off(dp(), "2026-08-11"), await off(dp(), "2026-08-10")];
    ok("max-days: after the start, days past the limit are off on both sides", after[0] === false && after[1] === true && before[0] === false && before[1] === true, JSON.stringify({ after, before }));
    await dp().locator('.cal-nav').last().click();
  });
  await step("max-days: min and max still apply inside the limit", async () => {
    const h = dp();
    await page.keyboard.press("Escape");
    await h.evaluate((e) => { e.setAttribute("data-min", "2026-09-05"); e.setAttribute("data-max", "2026-09-20"); });
    await openCal(h); await day(h, "2026-09-10").click();
    const r = [await off(h, "2026-09-04"), await off(h, "2026-09-21"), await off(h, "2026-09-20")];
    await page.keyboard.press("Escape");
    await h.evaluate((e) => { e.removeAttribute("data-min"); e.removeAttribute("data-max"); });
    ok("max-days: min and max still apply inside the limit", r.join() === "true,true,false", JSON.stringify(r));
    await openCal(h); await day(h, "2026-09-10").click();
  });
  await step("max-days: a blocked day cannot be the end by click or Enter", async () => {
    await day(dp(), "2026-10-11").evaluate((e) => e.click());
    const clicked = await apply(dp()).isDisabled();
    await day(dp(), "2026-10-11").evaluate((e) => { e.tabIndex = 0; e.focus(); });
    await page.keyboard.press("Enter");
    ok("max-days: a blocked day cannot be the end by click or Enter", clicked && await apply(dp()).isDisabled() && await dp().evaluate((e) => !e.querySelector(".day.end")), "");
  });
  await step("max-days: the last allowed day completes the range and lifts the block", async () => {
    await day(dp(), "2026-10-10").click();
    const blocked = await off(dp(), "2026-10-11");
    await apply(dp()).click();
    const r = await state(dp());
    ok("max-days: the last allowed day completes the range and lifts the block", blocked === false && r.s === "2026-09-10" && r.e === "2026-10-10" && r.val === "valid", JSON.stringify({ blocked, r }));
  });
  await step("max-days: an end before the start inside the limit still works", async () => {
    await openCal(dp()); await day(dp(), "2026-09-20").click(); await day(dp(), "2026-09-05").click(); await apply(dp()).click();
    const r = await state(dp());
    ok("max-days: an end before the start inside the limit still works", r.s === "2026-09-05" && r.e === "2026-09-20", JSON.stringify(r));
  });
  await step("max-days: presets longer than the limit are off", async () => {
    await openCal(dp());
    const d = await dp().evaluate((e) => [...e.querySelectorAll("[data-preset]")].map((x) => [x.dataset.preset, x.disabled]));
    ok("max-days: presets longer than the limit are off", JSON.stringify(d) === '[["7",false],["30",false],["90",true]]', JSON.stringify(d));
    await page.keyboard.press("Escape");
  });
  await step("max-days: typed range over the limit is kept and reported", async () => {
    const r = await typeInto(dp(), "2026090120261002"), ev = await last();
    ok("max-days: typed range over the limit is kept and reported", r.val === "long" && r.inv === "true" && r.help === "기간이 31일을 넘습니다. 31일 이내로 고르세요." && r.t === "2026. 09. 01 ~ 2026. 10. 02" && ev.validity === "long" && ev.sides.start === "valid" && ev.sides.end === "valid", JSON.stringify({ r, ev }));
  });
  await step("max-days: exactly the limit is valid (both ends count)", async () => {
    const r = await typeInto(dp(), "2026090120261001");
    ok("max-days: exactly the limit is valid (both ends count)", r.val === "valid" && r.inv !== "true", JSON.stringify(r));
  });
  await step("max-days: reversed order is reported as order first", async () => {
    const r = await typeInto(dp(), "2026120120260901");
    ok("max-days: reversed order is reported as order first", r.val === "order", JSON.stringify(r));
  });
  await step("max-days: data-messages long uses {days}, plain text stays as is", async () => {
    await dp().evaluate((e) => e.setAttribute("data-messages", '{"long":"Max {days} days."}'));
    const a = await typeInto(dp(), "2026090120261002");
    await dp().evaluate((e) => e.setAttribute("data-messages", '{"long":"너무 깁니다."}'));
    const c = await typeInto(dp(), "2026090120261003");
    await dp().evaluate((e) => e.removeAttribute("data-messages"));
    ok("max-days: data-messages long uses {days}, plain text stays as is", a.help === "Max 31 days." && c.help === "너무 깁니다.", JSON.stringify([a.help, c.help]));
  });
  await step("max-days: clock does not count — same days, different times", async () => {
    const h = page.locator("#ex-date-picker-time-range .example-preview .datepicker");
    await h.evaluate((e) => e.setAttribute("data-max-days", "31"));
    const a = await typeInto(h, "202609010000202610012359");
    const c = await typeInto(h, "202609010000202610020000");
    await h.evaluate((e) => e.removeAttribute("data-max-days"));
    ok("max-days: clock does not count — same days, different times", a.val === "valid" && c.val === "long", JSON.stringify([a.val, c.val]));
  });
  await step("max-days: month range ignores the limit", async () => {
    await page.evaluate(() => { const o = document.querySelector("#ex-date-picker-max-days .example-preview .datepicker"), h = o.cloneNode(true); ["data-start", "data-end", "data-value", "data-validity", "data-presets"].forEach((a) => h.removeAttribute(a)); h.setAttribute("data-unit", "month"); h.setAttribute("data-max-days", "1"); h.id = "dp-span-month"; const i = h.querySelector(".affix input"); i.id = "dp-span-month-i"; i.value = ""; i.setAttribute("value", ""); h.querySelector("label").setAttribute("for", i.id); const c = h.querySelector(".calendar"); if (c) c.remove(); h.classList.remove("open"); o.parentNode.append(h); });
    const r = await typeInto(page.locator("#dp-span-month"), "202601202603");
    ok("max-days: month range ignores the limit", r.val === "valid", JSON.stringify(r));
    await page.evaluate(() => document.querySelector("#dp-span-month").remove());
  });

  // ── Breadcrumb 잘린 항목 Tooltip ───────────────────────────
  const long = () => page.locator("#ex-breadcrumb-long .example-preview");
  await go("components/breadcrumb.html");
  await step("breadcrumb: only cut items get a tooltip", async () => {
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(50);
    const r = await long().evaluate((p) => ({ tips: [...p.querySelectorAll(".tooltip")].map((t) => t.textContent), short: p.querySelector("li:nth-child(2) .tooltip"), titles: p.querySelectorAll("[title]").length }));
    ok("breadcrumb: only cut items get a tooltip", r.tips.length === 2 && r.tips[0] === "본사 개발팀 외부 저장장치 · 클라우드 업로드 통합 차단 정책" && r.tips[1].startsWith("예외 승인 요청 상세") && r.short === null && r.titles === 0, JSON.stringify(r));
  });
  await step("breadcrumb: wrapped items keep 220 ellipsis and the row stays 24", async () => {
    const r = await long().evaluate((p) => { const x = [...p.querySelectorAll(".tooltip-wrap > a, .tooltip-wrap > span:not(.tooltip)")]; return { w: x.map((e) => e.getBoundingClientRect().width), ell: x.map((e) => getComputedStyle(e).textOverflow), h: x.map((e) => e.getBoundingClientRect().height), row: p.querySelector(".breadcrumb").getBoundingClientRect().height, plain: p.querySelector("li:nth-child(2) a").getBoundingClientRect().height }; });
    ok("breadcrumb: wrapped items keep 220 ellipsis and the row stays 24", r.w.every((v) => v === 220) && r.ell.every((v) => v === "ellipsis") && r.row === 24 && r.h.every((v) => v === r.plain), JSON.stringify(r));
  });
  await step("breadcrumb: cut plain item takes focus, whole items do not, the text is not read twice", async () => {
    const r = await long().evaluate((p) => { const cur = p.querySelector("li[aria-current] span:not(.tooltip-wrap):not(.tooltip)"), a = p.querySelector(".tooltip-wrap > a"), sh = p.querySelector("li:nth-child(2) a"); return { cur: cur.tabIndex, link: a.getAttribute("tabindex"), short: sh.getAttribute("tabindex"), desc: [...p.querySelectorAll(".tooltip-wrap > :not(.tooltip)")].filter((e) => e.hasAttribute("aria-describedby")).length }; });
    const thumb = await page.evaluate(() => { const s = [...document.querySelectorAll("#ex-breadcrumb-default .breadcrumb li[aria-current] span")][0]; return s ? s.getAttribute("tabindex") : "none"; });
    ok("breadcrumb: cut plain item takes focus, whole items do not, the text is not read twice", r.cur === 0 && r.link === null && r.short === null && r.desc === 0 && thumb === null, JSON.stringify({ r, thumb }));
  });
  await step("breadcrumb: tooltip shows on hover and at once on keyboard focus", async () => {
    await long().scrollIntoViewIfNeeded();
    const tip = long().locator(".tooltip").nth(1);
    await long().locator("li[aria-current] span[tabindex]").focus();
    await page.waitForTimeout(250);
    const focus = await tip.evaluate((e) => getComputedStyle(e).opacity);
    await page.evaluate(() => document.activeElement.blur());
    await page.waitForTimeout(250);
    const hid = await tip.evaluate((e) => getComputedStyle(e).opacity);
    await long().locator(".tooltip-wrap").first().hover(); await page.waitForTimeout(650);
    const hover = await long().locator(".tooltip").first().evaluate((e) => getComputedStyle(e).opacity);
    await page.mouse.move(0, 0);
    ok("breadcrumb: tooltip shows on hover and at once on keyboard focus", focus === "1" && hid === "0" && hover === "1", JSON.stringify({ focus, hid, hover }));
  });
  await step("breadcrumb: items that appear after expanding are measured too", async () => {
    await page.evaluate(() => { const m = document.querySelector("#ex-breadcrumb-collapsed .more") || document.querySelector(".example-preview .breadcrumb .more"); m.dataset.items = "정책|" + "아주 긴 이름의 경로 항목입니다 ".repeat(6).trim(); m.id = "crumb-more"; });
    await page.locator("#crumb-more").evaluate((e) => e.click());
    await page.waitForTimeout(50);
    const r = await page.evaluate(() => [...document.querySelectorAll(".example-preview .breadcrumb .tooltip")].some((t) => t.textContent.startsWith("아주 긴 이름의")));
    ok("breadcrumb: items that appear after expanding are measured too", r === true, String(r));
  });
  await step("breadcrumb: width is measured again when fonts arrive", async () => {
    const p2 = await ctx.newPage();
    await p2.addInitScript(() => { const ready = new Promise((r) => { window.__fonts = r; }); Object.defineProperty(document, "fonts", { value: { ready, load: () => Promise.resolve([]), check: () => true, addEventListener() {}, removeEventListener() {} } }); });
    await p2.goto("file://" + path.join(SITE, "components/breadcrumb.html")); await p2.waitForTimeout(200);
    const r = await p2.evaluate(async () => { const a = document.querySelector("#ex-breadcrumb-long li:nth-child(2) a"); a.textContent = "글꼴이 늦게 도착해 폭이 넓어진 아주 긴 경로 항목의 이름입니다 그래서 잘립니다"; const before = !!a.closest(".tooltip-wrap"); window.__fonts(); await new Promise((f) => setTimeout(f, 30)); return { before, after: !!a.closest(".tooltip-wrap") }; });
    await p2.close();
    ok("breadcrumb: width is measured again when fonts arrive", r.before === false && r.after === true, JSON.stringify(r));
  });

  // ── 차트 표로 보기 ─────────────────────────────────────────
  const view = (id, n = 0) => page.locator(`#ex-data-visual-${id} .chart-view`).nth(n);
  const tog = (v) => v.locator("[data-chart-table]");
  const tableOf = (v) => v.evaluate((e) => { const t = e.querySelector(".chart-table table"); return t && { head: [...t.querySelectorAll("thead th")].map((x) => x.textContent), rows: [...t.querySelectorAll("tbody tr")].map((r) => [...r.children].map((c) => c.textContent)) }; });
  const painted = (v) => v.locator("canvas").evaluate((c) => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; });
  await go("components/data-visual.html");
  await page.waitForTimeout(400);
  await step("chart table: every chart has the toggle and starts as a chart", async () => {
    const r = await page.evaluate(() => [...document.querySelectorAll("canvas[data-chart]")].map((c) => { const v = c.closest(".chart-view"); return [!!v.querySelector("[data-chart-table]"), v.querySelector("[data-chart-table]").textContent, !c.parentNode.hidden, v.querySelectorAll(".chart-table").length]; }));
    ok("chart table: every chart has the toggle and starts as a chart", r.length === 6 && r.every((x) => x[0] && x[1] === "표로 보기" && x[2] && x[3] === 0), JSON.stringify(r));
  });
  await step("chart table: the toggle sits at the right, 8 above the chart", async () => {
    const r = await view("timeseries").evaluate((v) => { const b = v.querySelector("[data-chart-table]").getBoundingClientRect(), w = v.querySelector(".chart-canvas").getBoundingClientRect(); return { right: w.right - b.right, gap: w.top - b.bottom }; });
    ok("chart table: the toggle sits at the right, 8 above the chart", r.right === 0 && r.gap === 8, JSON.stringify(r));
  });
  await step("chart table: a chart that failed to mount stays put", async () => {
    const r = await view("timeseries").evaluate((v) => { const c = v.querySelector("canvas"), k = c.__dsChart, b = v.querySelector("[data-chart-table]"); delete c.__dsChart; b.click(); const t = [b.textContent, c.parentNode.hidden]; c.__dsChart = k; return t; });
    ok("chart table: a chart that failed to mount stays put", r[0] === "표로 보기" && r[1] === false, JSON.stringify(r));
  });
  await step("chart table: the table shows every series and label", async () => {
    await view("timeseries").scrollIntoViewIfNeeded();
    const before = await page.locator("#ex-data-visual-timeseries .chart-card").evaluate((e) => e.getBoundingClientRect().height);
    await tog(view("timeseries")).click();
    const t = await tableOf(view("timeseries"));
    const data = await view("timeseries").locator("canvas").evaluate((c) => { const d = c.__dsChart.chart.data; return { labels: d.labels, sets: d.datasets.map((s) => ({ label: s.label, data: s.data })) }; });
    const good = t.head.join() === ["구분", ...data.sets.map((s) => s.label)].join() && t.rows.length === data.labels.length && t.rows.every((r, i) => r[0] === String(data.labels[i]) && data.sets.every((s, j) => r[j + 1] === s.data[i].toLocaleString("ko-KR")));
    const after = await page.locator("#ex-data-visual-timeseries .chart-card").evaluate((e) => e.getBoundingClientRect().height);
    ok("chart table: the table shows every series and label", good && t.head[1] === "Critical" && t.rows[0][0] === "10-21" && t.rows[0][1] === "12", JSON.stringify(t).slice(0, 200));
    ok("chart table: switching does not change the card height", before === after, JSON.stringify([before, after]));
  });
  await step("chart table: canvas hides, button flips, focus stays, region named after the chart", async () => {
    const r = await view("timeseries").evaluate((v) => { const box = v.querySelector(".chart-table"), wrap = v.querySelector(".chart-canvas"), b = v.querySelector("[data-chart-table]"); const th = v.querySelector("th"); return { hidden: getComputedStyle(wrap).display, btn: b.textContent, focus: document.activeElement === b, name: box.getAttribute("aria-label"), canvasName: wrap.querySelector("canvas").getAttribute("aria-label"), role: box.getAttribute("role"), tab: box.tabIndex, h: box.getBoundingClientRect().height, scope: th.getAttribute("scope"), num: getComputedStyle(v.querySelector("tbody td:nth-child(2)")).textAlign, cols: v.querySelectorAll("thead th.num").length }; });
    ok("chart table: canvas hides, button flips, focus stays, region named after the chart", r.hidden === "none" && r.btn === "차트로 보기" && r.focus && r.name === r.canvasName && r.name && r.role === "region" && r.tab === 0 && r.h === 240 && r.scope === "col" && r.num === "right" && r.cols === 3, JSON.stringify(r));
  });
  await step("chart table: the header stays while the rows scroll", async () => {
    const r = await view("timeseries").evaluate((v) => { const box = v.querySelector(".chart-table"), th = v.querySelector("thead th"); box.scrollTop = 200; const top = th.getBoundingClientRect().top - box.getBoundingClientRect().top; const res = { scrolled: box.scrollTop, top, overflow: getComputedStyle(box).overflowY }; box.scrollTop = 0; return res; });
    ok("chart table: the header stays while the rows scroll", r.scrolled > 0 && Math.abs(r.top) <= 1, JSON.stringify(r));
  });
  await step("chart table: back to the chart restores the canvas", async () => {
    await tog(view("timeseries")).click(); await page.waitForTimeout(250);
    const r = await view("timeseries").evaluate((v) => { const w = v.querySelector(".chart-canvas"), c = w.querySelector("canvas"); return { d: getComputedStyle(w).display, h: w.getBoundingClientRect().height, cw: c.getBoundingClientRect().width, ww: w.getBoundingClientRect().width, table: getComputedStyle(v.querySelector(".chart-table")).display, btn: v.querySelector("[data-chart-table]").textContent }; });
    ok("chart table: back to the chart restores the canvas", r.d !== "none" && r.h === 240 && Math.abs(r.cw - r.ww) <= 1 && r.table === "none" && r.btn === "표로 보기" && await painted(view("timeseries")), JSON.stringify(r));
  });
  await step("chart table: a donut has one unnamed series", async () => {
    await view("donut-live").scrollIntoViewIfNeeded();
    await tog(view("donut-live")).click();
    const t = await tableOf(view("donut-live"));
    ok("chart table: a donut has one unnamed series", t.head.join() === "구분,값" && t.rows.length === 5 && t.rows[0][0] === "Critical", JSON.stringify(t));
  });
  await step("chart table: uses the current data, formats numbers, shows gaps, escapes text", async () => {
    const r = await view("bars").evaluate((v) => { const d = v.querySelector("canvas").__dsChart.chart.data, s = d.datasets[0].data, o = [...s], l = [...d.labels]; s[0] = 12345; s[1] = null; d.labels[2] = "<img src=x>"; v.querySelector("[data-chart-table]").click(); const tb = v.querySelector(".chart-table tbody"), res = { a: tb.rows[0].cells[1].textContent, b: tb.rows[1].cells[1].querySelector("[aria-hidden=true]")?.textContent, sr: tb.rows[1].cells[1].querySelector(".sr-only")?.textContent, srHidden: (() => { const s = tb.rows[1].cells[1].querySelector(".sr-only"); return s ? s.getBoundingClientRect().width <= 1 : false; })(), lbl: tb.rows[2].cells[0].textContent, img: tb.querySelectorAll("img").length }; v.querySelector("[data-chart-table]").click(); d.datasets[0].data = o; d.labels = l; return res; });
    ok("chart table: uses the current data, formats numbers, shows gaps, escapes text", r.a === "12,345" && r.b === "—" && r.sr === "값 없음" && r.srHidden && r.lbl === "<img src=x>" && r.img === 0, JSON.stringify(r));
  });
  await step("chart table: data-labels replaces every word, broken JSON falls back", async () => {
    const warns = []; const on = (m) => { if (m.type() === "warning") warns.push(m.text()); }; page.on("console", on);
    const v = view("mixed");
    const a = await v.evaluate((e) => { const s = e.querySelector("canvas").__dsChart.chart.data.datasets[0].data, o = s[0]; s[0] = null; e.setAttribute("data-labels", '{"table":"Table","chart":"Chart","head":"Day","empty":"No value"}'); const b = e.querySelector("[data-chart-table]"); b.click(); const r = [b.textContent, e.querySelector("thead th").textContent, e.querySelector("tbody .sr-only")?.textContent]; b.click(); s[0] = o; const back = b.textContent; e.setAttribute("data-labels", "{oops"); b.click(); r.push(back, b.textContent); b.click(); e.removeAttribute("data-labels"); return r; });
    page.off("console", on);
    ok("chart table: data-labels replaces every word, broken JSON falls back", a.join() === "Chart,Day,No value,Table,차트로 보기" && warns.some((w) => w.includes("data-labels")), JSON.stringify({ a, warns }));
  });
  await step("chart table: the chart repaints for dark while the table is showing", async () => {
    const v = view("timeseries");
    await tog(v).click();
    const before = await v.locator("canvas").evaluate((c) => c.__dsChart.chart.options.scales.y.grid.color);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await page.waitForTimeout(300);
    await tog(v).click(); await page.waitForTimeout(250);
    ok("chart table: the table box is reused, not stacked", await v.evaluate((e) => e.querySelectorAll(".chart-table").length) === 1, "");
    const r = await v.locator("canvas").evaluate((c) => ({ now: c.__dsChart.chart.options.scales.y.grid.color, token: getComputedStyle(c).getPropertyValue("--chart-grid-primary").trim() }));
    await page.evaluate(() => document.documentElement.removeAttribute("data-theme")); await page.waitForTimeout(200);
    ok("chart table: the chart repaints for dark while the table is showing", r.now !== before && r.now && await painted(v), JSON.stringify({ before, r }));
  });
  await step("chart table: dashboard pattern has the same toggle", async () => {
    await go("patterns/dashboard.html"); await page.waitForTimeout(400);
    const v = page.locator(".chart-view").first();
    await v.scrollIntoViewIfNeeded(); await tog(v).click();
    const t = await tableOf(v);
    ok("chart table: dashboard pattern has the same toggle", !!t && t.rows.length > 0 && t.head.length >= 2, JSON.stringify(t).slice(0, 160));
  });
  ok("polish pages run without script errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
};
