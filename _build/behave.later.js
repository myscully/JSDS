/* 1.0 뒤로 미뤘다가 앞당긴 것의 단정(2026-11-11) — behave.js 가 부른다.
   Loading 지연(data-delay · DS.loading) · Slider + 숫자 입력(.slider-field), 사람의 결정 넷 */
module.exports = async ({ b, ok, SITE, path }) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(3000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "예외: " + String(e.message || e).split("\n")[0]); } };
  const go = async (f) => { await page.goto("file://" + path.join(SITE, f)); await page.waitForTimeout(250); await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; }); };

  // ── Loading 지연 ─────────────────────────────────────────
  /* 새로 넣은 요소의 visibility 를 시각마다 잰다 — CSS 지연은 요소가 그려지는 순간부터 센다 */
  const probe = (html, at) => page.evaluate(async ({ html, at }) => {
    const box = document.createElement("div"); box.innerHTML = html; document.querySelector("#ex-loading-default .example-preview").appendChild(box);
    const el = box.firstElementChild, t0 = performance.now(), out = [];
    for (const t of at) { await new Promise((r) => setTimeout(r, Math.max(0, t - (performance.now() - t0)))); out.push(getComputedStyle(el).visibility); }
    const names = el.getAnimations({ subtree: true }).map((a) => a.animationName), r = { width: el.offsetWidth, height: el.offsetHeight };   // 도는 중이라 getBoundingClientRect 는 기울어진 상자
    box.remove();
    return { out, names, w: r.width, h: r.height };
  }, { html, at });

  await go("components/loading.html");
  await step("loading delay: a delayed spinner waits 1s, keeps its size and keeps spinning", async () => {
    const r = await probe('<span class="spinner" data-delay role="status" aria-label="x"></span>', [30, 850, 1150]);
    ok("loading delay: a delayed spinner waits 1s, keeps its size and keeps spinning", r.out.join() === "hidden,hidden,visible" && r.w === 24 && r.h === 24 && r.names.includes("spin") && r.names.includes("ds-delay"), JSON.stringify(r));
  });
  await step("loading delay: --ds-delay changes the wait, skeleton rows hide their bars", async () => {
    const r = await page.evaluate(async () => {
      const box = document.createElement("div"); box.innerHTML = '<div class="skeleton-row" data-delay style="--ds-delay:300ms"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span></div></div>';
      document.querySelector("#ex-loading-default .example-preview").appendChild(box); const row = box.firstElementChild, bar = row.querySelector(".skeleton.title");
      await new Promise((res) => setTimeout(res, 120)); const a = [getComputedStyle(row).visibility, getComputedStyle(bar).visibility];
      await new Promise((res) => setTimeout(res, 330)); const c = [getComputedStyle(row).visibility, getComputedStyle(bar).visibility, bar.getAnimations({ subtree: true }).map((x) => x.animationName).join()];
      box.remove(); return { a, c };
    });
    ok("loading delay: --ds-delay changes the wait, skeleton rows hide their bars", r.a.join() === "hidden,hidden" && r.c[0] === "visible" && r.c[1] === "visible" && r.c[2] === "shimmer", JSON.stringify(r));
  });
  await step("loading delay: a single delayed skeleton keeps shimmering", async () => {
    const r = await probe('<span class="skeleton text" data-delay style="--ds-delay:200ms"></span>', [40, 320]);
    ok("loading delay: a single delayed skeleton keeps shimmering", r.out.join() === "hidden,visible" && r.names.includes("shimmer") && r.names.includes("ds-delay"), JSON.stringify(r));
  });
  await step("loading delay: the documented example uses it", async () => {
    await page.waitForTimeout(900);   // go() 가 250 을 기다렸다 — 페이지가 그려진 지 1초가 지나야 보인다
    const r = await page.evaluate(() => { const p = document.querySelector("#ex-loading-delay .example-preview"); return { sp: !!p.querySelector('.spinner[data-delay][role=status]'), row: p.querySelector(".skeleton-row[data-delay]")?.style.getPropertyValue("--ds-delay"), vis: getComputedStyle(p.querySelector(".spinner")).visibility }; });
    ok("loading delay: the documented example uses it", r.sp && r.row === "300ms" && r.vis === "visible", JSON.stringify(r));
  });
  await step("loading delay: buttons and switches are never delayed", async () => {
    const r = await page.evaluate(() => {
      const box = document.createElement("div"); box.innerHTML = '<button class="btn solid primary loading" data-delay>저장</button><label class="switch"><input type="checkbox" aria-busy="true" data-delay><span>x</span></label>';
      document.querySelector("#ex-loading-default .example-preview").appendChild(box);
      const res = [box.querySelector(".btn"), box.querySelector(".switch input")].map((e) => [getComputedStyle(e).visibility, e.getAnimations().some((a) => a.animationName === "ds-delay")]);
      box.remove(); return res;
    });
    ok("loading delay: buttons and switches are never delayed", r.every(([v, d]) => v === "visible" && !d), JSON.stringify(r));
  });
  await step("loading delay: reduced motion still waits, the spinner still spins", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const r = await probe('<span class="spinner" data-delay role="status" aria-label="x"></span>', [30, 1150]);
    const s = await probe('<span class="skeleton text" data-delay style="--ds-delay:200ms"></span>', [40, 320]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    ok("loading delay: reduced motion still waits, the spinner still spins", r.out.join() === "hidden,visible" && r.names.includes("spin") && s.out.join() === "hidden,visible" && !s.names.includes("shimmer"), JSON.stringify({ r, s }));
  });

  /* DS.loading — 보일지를 끝까지 정한다 */
  const run = (fn) => page.evaluate(fn);
  await step("DS.loading: defaults are 1000 and 500", async () => {
    const r = await run(() => [DS.loading.DELAY, DS.loading.MIN]);
    ok("DS.loading: defaults are 1000 and 500", r.join() === "1000,500", JSON.stringify(r));
  });
  await step("DS.loading: stopping inside the delay never shows it", async () => {
    const r = await run(async () => {
      const el = document.createElement("span"); el.className = "spinner"; document.querySelector("#ex-loading-default .example-preview").appendChild(el);
      let seen = false; const iv = setInterval(() => { if (!el.hidden) seen = true; }, 10);
      DS.loading.start(el, { delay: 200, min: 300 }); const h0 = el.hidden;
      await new Promise((r) => setTimeout(r, 120)); const t = performance.now(); await DS.loading.stop(el); const took = performance.now() - t;
      await new Promise((r) => setTimeout(r, 200)); clearInterval(iv); const end = el.hidden; el.remove();
      return { h0, seen, took, end };
    });
    ok("DS.loading: stopping inside the delay never shows it", r.h0 && !r.seen && r.end && r.took < 60, JSON.stringify(r));
  });
  await step("DS.loading: once shown it stays for the minimum", async () => {
    const r = await run(async () => {
      const el = document.createElement("span"); el.className = "spinner"; document.querySelector("#ex-loading-default .example-preview").appendChild(el);
      DS.loading.start(el, { delay: 100, min: 400 });
      await new Promise((r) => setTimeout(r, 160)); const shown = !el.hidden, t = performance.now();
      const p = DS.loading.stop(el); await new Promise((r) => setTimeout(r, 100)); const mid = !el.hidden;
      await p; const took = performance.now() - t, end = el.hidden; el.remove();
      return { shown, mid, took, end };
    });
    ok("DS.loading: once shown it stays for the minimum", r.shown && r.mid && r.end && r.took > 250 && r.took < 420, JSON.stringify(r));
  });
  await step("DS.loading: starting again before it hides keeps it shown", async () => {
    const r = await run(async () => {
      const el = document.createElement("span"); el.className = "spinner"; document.querySelector("#ex-loading-default .example-preview").appendChild(el);
      DS.loading.start(el, { delay: 50, min: 200 }); await new Promise((r) => setTimeout(r, 100));
      DS.loading.stop(el); DS.loading.start(el, { delay: 50, min: 200 }); const right = !el.hidden;   // 다시 시작하는 순간에도 깜빡이지 않는다
      await new Promise((r) => setTimeout(r, 400)); const still = !el.hidden; await DS.loading.stop(el); const end = el.hidden; el.remove();
      return { right, still, end };
    });
    ok("DS.loading: starting again before it hides keeps it shown", r.right && r.still && r.end, JSON.stringify(r));
  });

  // ── Slider + 숫자 입력 ───────────────────────────────────
  await go("components/slider.html");
  const ex = page.locator("#ex-slider-with-input .example-preview .slider-field");
  const R = ex.locator("input[type=range]"), N = ex.locator("input[type=number]");
  const st = () => ex.evaluate((f) => { const r = f.querySelector("input[type=range]"), n = f.querySelector("input[type=number]"); return { r: r.value, p: r.style.getPropertyValue("--p"), vt: r.getAttribute("aria-valuetext"), n: n.value, err: f.classList.contains("error"), inv: n.getAttribute("aria-invalid"), help: f.querySelector(".help").textContent }; });
  await ex.scrollIntoViewIfNeeded();
  await step("slider field: track and input share one line, input 120 on the right", async () => {
    const r = await ex.evaluate((f) => { const s = f.querySelector(".slider").getBoundingClientRect(), a = f.querySelector(".affix").getBoundingClientRect(), l = f.querySelector("label").getBoundingClientRect(), rg = f.querySelector("input[type=range]"), cs = getComputedStyle(rg); return { mid: Math.abs((s.top + s.bottom) / 2 - (a.top + a.bottom) / 2), aw: a.width, gap: a.left - s.right, under: s.top >= l.bottom, rh: rg.getBoundingClientRect().height, border: cs.borderTopWidth, edge: Math.abs(a.right - f.getBoundingClientRect().right), val: !!f.querySelector(".val") }; });
    ok("slider field: track and input share one line, input 120 on the right", r.mid <= 1 && r.aw === 120 && r.gap === 16 && r.under && r.rh === 20 && r.border === "0px" && r.edge <= 1 && !r.val, JSON.stringify(r));
  });
  await step("slider field: at least 416 wide (track 280), the track takes the extra width", async () => {
    const r = await ex.evaluate((f) => { const m = () => ({ f: f.getBoundingClientRect().width, s: f.querySelector(".slider").getBoundingClientRect().width, edge: Math.abs(f.querySelector(".affix").getBoundingClientRect().right - f.getBoundingClientRect().right) }); const a = m(); f.style.width = "600px"; const w = m(); f.style.width = ""; return { a, w }; });
    ok("slider field: at least 416 wide (track 280), the track takes the extra width", r.a.f === 416 && r.a.s === 280 && r.w.s === 464 && r.w.edge <= 1, JSON.stringify(r));
  });
  await step("slider field: names and the unit in the track's value text", async () => {
    const r = await ex.evaluate((f) => { const l = f.querySelector("label"), rg = f.querySelector("input[type=range]"), n = f.querySelector("input[type=number]"); return { rl: rg.getAttribute("aria-labelledby") === l.id, nf: l.htmlFor === n.id, vt: rg.getAttribute("aria-valuetext"), tab: rg.tabIndex, nv: n.getAttribute("aria-valuetext") }; });
    ok("slider field: names and the unit in the track's value text", r.rl && r.nf && r.vt === "5회" && r.tab === 0 && r.nv === "5회", JSON.stringify(r));
  });
  await step("slider field: moving the track updates the input and fires its events", async () => {
    await N.evaluate((n) => { window.__sf = []; n.addEventListener("input", () => window.__sf.push("input:" + n.value)); n.addEventListener("change", () => window.__sf.push("change:" + n.value)); });
    await R.focus(); await page.keyboard.press("ArrowRight");
    const s = await st(), ev = await page.evaluate(() => window.__sf);
    ok("slider field: moving the track updates the input and fires its events", s.r === "6" && s.n === "6" && s.p === "30%" && s.vt === "6회" && ev.includes("input:6") && ev.includes("change:6"), JSON.stringify({ s, ev }));
  });
  await step("slider field: typing moves the track", async () => {
    await N.fill("12"); const s = await st();
    ok("slider field: typing moves the track", s.r === "12" && s.p === "60%" && s.vt === "12회" && s.n === "12" && !s.err, JSON.stringify(s));
  });
  await step("slider field: out of range keeps the text, track at the end, error on leaving", async () => {
    await N.fill("25"); const a = await st(); await N.press("Tab"); const b2 = await st();
    ok("slider field: out of range keeps the text, track at the end, error on leaving", a.n === "25" && a.r === "20" && a.p === "100%" && !a.err && b2.err && b2.inv === "true" && /20/.test(b2.help), JSON.stringify({ a, b2 }));
  });
  await step("slider field: fixing the number clears the error at once", async () => {
    await N.fill("8"); const s = await st();
    ok("slider field: fixing the number clears the error at once", s.r === "8" && !s.err && s.inv === null && s.help === "0회부터 20회까지 입력할 수 있습니다.", JSON.stringify(s));
  });
  await step("slider field: an empty input leaves the track where it was", async () => {
    await N.fill(""); const s = await st(); await N.fill("8");
    ok("slider field: an empty input leaves the track where it was", s.r === "8" && s.n === "", JSON.stringify(s));
  });
  await step("slider field: the step buttons move the track too", async () => {
    await ex.locator(".num-btn.up").click(); const s = await st();
    ok("slider field: the step buttons move the track too", s.n === "9" && s.r === "9" && s.p === "45%", JSON.stringify(s));
  });
  await step("slider field: moving the track clears an error", async () => {
    await N.fill("30"); await N.press("Tab"); const a = await st(); await R.focus(); await page.keyboard.press("ArrowLeft"); const s = await st();
    ok("slider field: moving the track clears an error", a.err && s.r === "19" && s.n === "19" && !s.err, JSON.stringify({ a, s }));
  });
  await step("slider field: plain sliders and number inputs are unchanged", async () => {
    const r = await page.evaluate(() => { const rg = document.querySelector("#ex-slider-basic input[type=range]"), n = document.querySelector("#ex-slider-exact input[type=number]"); return { rh: rg.getBoundingClientRect().height, nh: n.closest(".affix").getBoundingClientRect().height, app: getComputedStyle(n).appearance }; });
    ok("slider field: plain sliders and number inputs are unchanged", r.rh === 20 && r.nh === 40 && r.app === "textfield", JSON.stringify(r));
  });

  ok("later bundle: no page errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
};
