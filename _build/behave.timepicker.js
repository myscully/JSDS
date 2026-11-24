/* Time Picker(2026-11-13, 사람의 결정 — 입력칸 + 열 목록, 고르면 바로 반영) — behave.js 가 부른다.
   열기 · 고름 · 빈 조각 00 · 키보드 · 입력 끊기 · ↑↓ · 간격 · 범위(끈 칸 · 오류) · 미완성 · 없는 시각 · 폼 필수 · 초 · 닫힘 · 크기 · 칸 색 */
module.exports = async function timepicker({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const host = (ex) => `#ex-time-picker-${ex} .timepicker`;
  const state = (ex) => page.evaluate((sel) => {
    const h = document.querySelector(sel), inp = h.querySelector(".affix input"), p = h.querySelector(".time-panel"), a = document.activeElement;
    return { open: h.classList.contains("open"), value: inp.value, validity: h.dataset.validity, error: h.classList.contains("error"), help: (h.querySelector(":scope > .help") || {}).textContent || "",
      expanded: h.querySelector(".tp-btn").getAttribute("aria-expanded"), panel: !!p && getComputedStyle(p).display !== "none",
      focus: a === inp ? "input" : a && a.classList.contains("time-opt") ? a.closest(".time-col").dataset.part + ":" + a.textContent : a && a.tagName };
  }, host(ex));
  const events = () => page.evaluate(() => { const r = window.__tpEv || []; window.__tpEv = []; return r; });
  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.timepicker", () => page);
  let inp;
  await part("1 · components/time-picker.html", async () => {
    await go("components/time-picker.html");
    await page.evaluate(() => { window.__tpEv = []; document.addEventListener("ds:time", (e) => window.__tpEv.push(e.detail)); });
  });
  await part("2 · 열기 — 시계 버튼, 대화상자 · 고른 칸이 맨 위 · 포커스는 시 열의 고른 칸 · 입력 포커스 링", async () => {

    /* 열기 — 시계 버튼, 대화상자 · 고른 칸이 맨 위 · 포커스는 시 열의 고른 칸 · 입력 포커스 링 */
    await page.locator(`${host("default")} .tp-btn`).click(); await wait(150);
    const o1 = await state("default");
    const geo = await page.evaluate((sel) => {
      const h = document.querySelector(sel), p = h.querySelector(".time-panel"), cols = [...p.querySelectorAll(".time-col")], hc = cols[0], on = hc.querySelector(".time-opt.on");
      const af = getComputedStyle(h.querySelector(".affix")), ring = getComputedStyle(document.createElement("i"));
      return { role: p.getAttribute("role"), label: p.getAttribute("aria-label"), cols: cols.map((c) => c.getAttribute("role") + ":" + c.getAttribute("aria-label") + ":" + c.children.length).join(","),
        top: Math.round(on.getBoundingClientRect().top - hc.getBoundingClientRect().top - parseFloat(getComputedStyle(hc).paddingTop)), sel: on.getAttribute("aria-selected"),
        below: Math.round(p.getBoundingClientRect().top - h.querySelector(".affix").getBoundingClientRect().bottom), shadow: af.boxShadow.includes("4px"), ring,
        overflow: getComputedStyle(h.closest(".example")).overflow, colW: Math.round(hc.getBoundingClientRect().width), optH: Math.round(on.getBoundingClientRect().height) };
    }, host("default"));
    ok("time picker opens a dialog of hour · minute listboxes from the clock button, the chosen option at the top and focused (2026-11-13)",
      o1.open && o1.panel && o1.expanded === "true" && o1.focus === "hour:02" && geo.role === "dialog" && geo.label === "시각 선택" && geo.cols === "listbox:시:24,listbox:분:60" && geo.top === 0 && geo.sel === "true" && geo.below === 4 && geo.shadow && geo.overflow === "visible" && geo.colW === 56 && geo.optH === 32, JSON.stringify({ o1, geo }));
  });
  await part("3 · 마우스로 고름 — 바로 값 · ds:time · 열린 채", async () => {

    /* 마우스로 고름 — 바로 값 · ds:time · 열린 채 */
    await events();
    await page.locator(`${host("default")} .time-col[data-part=minute] .time-opt`, { hasText: /^30$/ }).click(); await wait(100);
    const o2 = await state("default"), e2 = await events();
    ok("picking a minute applies at once, fires ds:time and keeps the panel open", o2.value === "02:30" && o2.open && e2.length === 1 && e2[0].value === "02:30" && e2[0].text === "02:30" && e2[0].validity === "valid", JSON.stringify({ o2, e2 }));
  });
  await part("4 · 키보드 — ↓ 다음 칸, Enter 고르고 다음 열, 마지막 열 Enter 는 닫고 입력칸으로", async () => {

    /* 키보드 — ↓ 다음 칸, Enter 고르고 다음 열, 마지막 열 Enter 는 닫고 입력칸으로 */
    await page.locator(`${host("default")} .time-col[data-part=hour] .time-opt.on`).focus();
    await page.keyboard.press("ArrowDown"); const k1 = await state("default");
    await page.keyboard.press("Enter"); await wait(50); const k2 = await state("default");
    await page.keyboard.press("End"); const k3 = await state("default");
    await page.keyboard.press("ArrowLeft"); const k4 = await state("default");
    await page.keyboard.press("ArrowRight"); await page.keyboard.press("Home"); await page.keyboard.press("Enter"); await wait(50); const k5 = await state("default");
    ok("keyboard: ↓ moves, Enter picks and goes to the next column, ←→ switch columns, Home · End, Enter in the last column closes and returns to the input",
      k1.focus === "hour:03" && k1.value === "02:30" && k2.value === "03:30" && k2.focus === "minute:30" && k3.focus === "minute:59" && k4.focus === "hour:03" && k5.value === "03:00" && !k5.open && k5.focus === "input" && k5.expanded === "false", JSON.stringify({ k1, k2, k3, k4, k5 }));
  });
  await part("5 · Alt+↓ 로 열고 Esc 로 닫는다(입력칸으로)", async () => {

    /* Alt+↓ 로 열고 Esc 로 닫는다(입력칸으로) */
    await page.keyboard.press("Alt+ArrowDown"); await wait(100); const a1 = await state("default");
    await page.keyboard.press("Escape"); const a2 = await state("default");
    ok("Alt+↓ opens with focus in the panel, Esc closes and returns to the input", a1.open && a1.focus === "hour:03" && !a2.open && a2.focus === "input", JSON.stringify({ a1, a2 }));
  });
  await part("6 · 입력 — 숫자만 쳐도 끊긴다, ↑ 은 커서 조각, 23 → 00 으로 돈다, Enter 확정", async () => {

    /* 입력 — 숫자만 쳐도 끊긴다, ↑ 은 커서 조각, 23 → 00 으로 돈다, Enter 확정 */
    inp = page.locator(`${host("default")} .affix input`);
    await inp.fill(""); await inp.pressSequentially("915"); const t1 = await state("default");
    await page.keyboard.press("ArrowUp"); const t2 = await state("default");
    await inp.fill("23:59"); await inp.evaluate((i) => i.setSelectionRange(1, 1)); await page.keyboard.press("ArrowUp"); const t3 = await state("default");
    ok("typing digits fills the colon, ↑ steps the segment under the caret and 23 wraps to 00", t1.value === "09:15" && t2.value === "09:16" && t3.value === "00:59", JSON.stringify({ t1, t2, t3 }));
  });
  await part("7 · 빈 값에서 분을 고르면 시는 00", async () => {

    /* 빈 값에서 분을 고르면 시는 00 */
    await inp.fill(""); await page.keyboard.press("Enter"); await page.locator(`${host("default")} .tp-btn`).click(); await wait(100);
    await page.locator(`${host("default")} .time-col[data-part=minute] .time-opt`, { hasText: /^15$/ }).click(); await wait(50);
    const f1 = await state("default");
    ok("picking a minute on an empty field fills the hour with 00", f1.value === "00:15", JSON.stringify(f1));
  });
  await part("8 · 바깥 클릭 · Tab 으로 떠남 — 닫힌다", async () => {

    /* 바깥 클릭 · Tab 으로 떠남 — 닫힌다 */
    await page.mouse.click(5, 300); await wait(100); const c1 = await state("default");
    await page.locator(`${host("default")} .tp-btn`).click(); await wait(100);
    await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await wait(100); const c2 = await state("default");
    ok("an outside click closes the panel, and Tab moves between columns then out of the field, closing it", !c1.open && !c2.open && c2.focus !== "input", JSON.stringify({ c1, c2 }));
  });
  await part("9 · 간격 — 분 열 00 · 15 · 30 · 45, 친 값은 받는다", async () => {

    /* 간격 — 분 열 00 · 15 · 30 · 45, 친 값은 받는다 */
    await page.locator(`${host("step")} .tp-btn`).click(); await wait(100);
    const st = await page.evaluate((sel) => [...document.querySelectorAll(sel + " .time-col[data-part=minute] .time-opt")].map((o) => o.textContent).join(","), host("step"));
    await page.keyboard.press("Escape");
    const sinp = page.locator(`${host("step")} .affix input`); await sinp.fill("09:07"); await page.keyboard.press("Enter"); const s1 = await state("step");
    ok("data-step shows only multiples in the minute column but a typed 09:07 is accepted", st === "00,15,30,45" && s1.value === "09:07" && s1.validity === "valid" && !s1.error, JSON.stringify({ st, s1 }));
  });
  await part("10 · 범위 — 범위 밖 칸은 고를 수 없고, 친 범위 밖 값은 남긴 채 오류", async () => {

    /* 범위 — 범위 밖 칸은 고를 수 없고, 친 범위 밖 값은 남긴 채 오류 */
    await page.locator(`${host("range")} .tp-btn`).click(); await wait(100);
    const rg = await page.evaluate((sel) => {
      const offs = (part) => [...document.querySelectorAll(sel + ` .time-col[data-part=${part}] .time-opt`)].filter((o) => o.getAttribute("aria-disabled") === "true").map((o) => o.textContent);
      return { hour: offs("hour").join(","), minute: offs("minute").length, look: (() => { const o = document.querySelector(sel + " .time-col[data-part=hour] .time-opt[aria-disabled=true]"); return o ? getComputedStyle(o).cursor : "none"; })() };
    }, host("range"));
    await page.locator(`${host("range")} .time-col[data-part=hour] .time-opt`, { hasText: /^05$/ }).click({ force: true }); await wait(50); const r0 = await state("range");
    await page.locator(`${host("range")} .time-col[data-part=hour] .time-opt`, { hasText: /^12$/ }).click(); await wait(50);
    const rg12 = await page.evaluate((sel) => [...document.querySelectorAll(sel + " .time-col[data-part=minute] .time-opt")].filter((o) => o.getAttribute("aria-disabled") === "true").length, host("range"));
    await page.keyboard.press("Escape");
    const rinp = page.locator(`${host("range")} .affix input`); await events(); await rinp.fill("13:00"); await rinp.blur(); await wait(50);
    const r1 = await state("range"), re1 = await events();
    ok("min · max disable hours outside 06–12 (and minutes past 12:00) — a disabled option does nothing, a typed 13:00 stays with the max error",
      rg.hour === "00,01,02,03,04,05,13,14,15,16,17,18,19,20,21,22,23" && rg.minute === 0 && rg.look === "not-allowed" && r0.value === "09:00" && rg12 === 59
      && r1.value === "13:00" && r1.validity === "max" && r1.error && r1.help === "시각이 범위를 벗어났습니다. 12:00 까지 입력할 수 있습니다." && re1.length === 1 && re1[0].value === "13:00" && re1[0].validity === "max", JSON.stringify({ rg, r0, rg12, r1, re1 }));
    await rinp.fill("10:00"); const r2 = await state("range");
    ok("fixing the value clears the error while typing", !r2.error && r2.help === "06:00 부터 12:00 까지 입력할 수 있습니다.", JSON.stringify(r2));
  });
  await part("11 · 미완성 · 없는 시각 — 떠날 때 문구", async () => {

    /* 미완성 · 없는 시각 — 떠날 때 문구 */
    await inp.fill("9"); await inp.blur(); await wait(50); const i1 = await state("default");
    await inp.fill("25:10"); await inp.blur(); await wait(50); const i2 = await state("default");
    ok("leaving an incomplete or nonexistent time explains it (Date Picker's time messages)",
      i1.validity === "incomplete" && i1.help === "시각이 덜 입력됐습니다. 14:30 처럼 끝까지 입력하세요." && i2.validity === "invalid" && i2.help === "시각이 24시간제 형식이 아닙니다. 14:30 처럼 입력하세요." && i2.value === "25:10", JSON.stringify({ i1, i2 }));
    await inp.fill("02:00"); await inp.blur(); await wait(50);
    ok("a valid value restores the help text", (await state("default")).help === "매일 이 시각에 백업합니다.");
  });
  await part("12 · 폼 — 빈 필수는 저장할 때, 고르면 바로 지운다", async () => {

    /* 폼 — 빈 필수는 저장할 때, 고르면 바로 지운다 */
    await page.locator("#ex-time-picker-form button[type=submit]").click(); await wait(100); const p1 = await state("form");
    await page.locator(`${host("form")} .tp-btn`).click(); await wait(100);
    await page.locator(`${host("form")} .time-col[data-part=hour] .time-opt`, { hasText: /^18$/ }).click(); await wait(50); const p2 = await state("form");
    await page.keyboard.press("Escape");
    const pinp = page.locator(`${host("form")} .affix input`); await pinp.fill("18"); await pinp.blur(); await wait(50); const p3 = await state("form");
    ok("in a form, an empty required time blocks saving with the common message and focus, picking clears it, an incomplete time is a form error",
      p1.error && p1.help === "값이 비어 있습니다. 값을 입력하세요." && p1.focus === "input" && p2.value === "18:00" && !p2.error && p3.error && p3.help.startsWith("시각이 덜 입력됐습니다"), JSON.stringify({ p1, p2, p3 }));
  });
  await part("13 · 초 — 열 셋, 고른 칸 셋", async () => {

    /* 초 — 열 셋, 고른 칸 셋 */
    await page.locator(`${host("seconds")} .tp-btn`).click(); await wait(100);
    const sc = await page.evaluate((sel) => ({ cols: document.querySelectorAll(sel + " .time-col").length, on: [...document.querySelectorAll(sel + " .time-opt.on")].map((o) => o.textContent).join(":"), ph: document.querySelector(sel + " input").placeholder }), host("seconds"));
    await page.keyboard.press("Escape");
    ok("data-seconds adds a second column and the HH:mm:ss format", sc.cols === 3 && sc.on === "14:30:05" && sc.ph === "HH:mm:ss", JSON.stringify(sc));
  });
  await part("14 · 마크업 값 — 한 자리 시 · 분도 채운다(2:5 → 02:05)", async () => {

    /* 마크업 값 — 한 자리 시 · 분도 채운다(2:5 → 02:05) */
    const mk = await page.evaluate(() => { const box = document.createElement("div"); box.innerHTML = '<div class="field timepicker"><label for="tpx">x</label><div class="affix"><input id="tpx" value="2:5"><button type="button" class="tp-btn" aria-label="x 선택"></button></div></div>'; document.body.append(box); window.DS.init(box); const v = box.querySelector("input").value + "|" + box.firstChild.dataset.validity; box.remove(); return v; });
    ok("markup values pad a one-digit hour and minute (2:5 → 02:05)", mk === "02:05|valid", mk);
  });
  await part("15 · 크기 · 끈 필드", async () => {

    /* 크기 · 끈 필드 */
    const sz = await page.evaluate(() => [...document.querySelectorAll("#ex-time-picker-size .timepicker .affix")].map((a) => Math.round(a.getBoundingClientRect().height)).join(","));
    await page.locator(`${host("disabled")} .tp-btn`).click({ force: true }); await wait(50); const d1 = await state("disabled");
    ok("sizes are 32 · 40 · 48 and a disabled field does not open", sz === "32,40,48" && !d1.open && (await page.locator(`${host("disabled")} .tp-btn`).isDisabled()), JSON.stringify({ sz, d1 }));
  });
  await part("16 · 칸 색 — 고른 칸 제품 색 면 + 라벨 색, hover 는 tertiary(라이트 · 다크)", async () => {

    /* 칸 색 — 고른 칸 제품 색 면 + 라벨 색, hover 는 tertiary(라이트 · 다크) */
    for (const t of [null, "dark"]) {
      await theme(t); await wait(300);
      const W = { bg: await tok("--surface-brand-primary"), fg: await tok("--brand-label", "color"), hv: await tok("--surface-neutral-tertiary"), off: await tok("--foreground-disable-primary", "color") };
      await page.locator(`${host("range")} .tp-btn`).click(); await wait(100);
      const on = page.locator(`${host("range")} .time-col[data-part=hour] .time-opt.on`);
      const plain = page.locator(`${host("range")} .time-col[data-part=hour] .time-opt`, { hasText: /^07$/ });
      await plain.hover(); await wait(150);
      const c = await page.evaluate((sel) => { const g = (e) => getComputedStyle(e); const on = document.querySelector(sel + " .time-col[data-part=hour] .time-opt.on"), off = document.querySelector(sel + " .time-col[data-part=hour] .time-opt[aria-disabled=true]"), hv = [...document.querySelectorAll(sel + " .time-col[data-part=hour] .time-opt")].find((o) => o.textContent === "07");
        return { onBg: g(on).backgroundColor, onFg: g(on).color, onW: g(on).fontWeight, hv: g(hv).backgroundColor, off: off ? g(off).color : "none" }; }, host("range"));
      await page.keyboard.press("Escape"); await page.mouse.click(5, 300);
      ok(`chosen option is brand face + label color, hover tertiary, disabled uses the disable token (${t || "light"})`, c.onBg === W.bg && c.onFg === W.fg && c.onW === "600" && c.hv === W.hv && c.off === W.off, JSON.stringify({ c, W }));
      void on;
    }
    await theme(null);
  });
};
