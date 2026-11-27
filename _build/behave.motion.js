/* 모션 · 인터랙션 보강(2026-11-26) — behave.js 가 부른다.
   1. 이징 토큰 — 들어옴 --motion-enter(200ms 감속) · 나감 --motion-exit(120ms 가속) · 하이라이트 --motion-flash(1.6s). 오버레이 들어옴 = enter, 사본 나감 = exit
   2. 팝오버 들어옴 — 메뉴 · Combobox · 달력 · 시각 목록 · 알림 센터가 ds-pop(위로 뒤집히면 ds-pop-up)으로 흐림에서 4px 움직이며 나타남. 줄인 모션이면 없음
   3. 탭 밑줄 미끄러짐 — 밑줄 하나가 고른 탭에 맞고, 처음 그릴 때는 움직이지 않으며, 고르면 그 사이 값을 지나 새 탭에 닿음. pill 은 면. 줄인 모션이면 바로
   4. 사이드 내비 폭 — 버튼으로 접고 펼 때 폭이 그 사이 값을 지나고 펼칠 때 이름이 흐림에서 나타남. 폭으로 처음 접혀 그릴 때는 움직이지 않음
   5. 체크 표시 · 복사 완료 — 켜면 커지며 나타나고 처음 그릴 때는 움직이지 않음
   6. 패널 바꿈 흐림 — 탭 · 단계 · 행 펼침 패널이 바뀔 때만 ds-fade
   7. 새 항목 하이라이트 — DS.flash · DS.notify.add 가 brand subtle 면에서 한 번 흐려짐(로그 뷰어 '새 로그' 시연), 줄인 모션이면 머묾, '새 항목 n개' 를 한 번 알림(알림 센터는 제목으로만)
   8. 지운 항목 사라짐 — 표 행 · 칩 · Toast 가 그 자리에서 흐려지고 inert, 포커스 · 이벤트는 바로 */
module.exports = async function motion({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.motion", () => page);
  const frames = (n) => page.evaluate((k) => new Promise((r) => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

  await part("1 · 이징 토큰 · 오버레이 들어옴과 나감", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/popup.html"); await wait(300);
    const t = await page.evaluate(() => { const c = getComputedStyle(document.documentElement); return ["--motion-enter", "--motion-exit", "--motion-flash"].map((k) => c.getPropertyValue(k).trim()); });
    ok("enter 200ms decelerate, exit 120ms accelerate, flash 1.6s", t[0] === "200ms cubic-bezier(.2,.8,.2,1)" && t[1] === "120ms cubic-bezier(.4,0,1,1)" && t[2] === "1600ms ease-out", JSON.stringify(t));
    await page.evaluate(() => { const p = document.querySelector(".example-preview .popup"); p.id = "mo-pop"; window.DS.popup.open("#mo-pop"); }); await frames(1);
    const enter = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop[data-ds-popup] > .popup"); return p && p.getAnimations().map((a) => [a.animationName, a.effect.getComputedTiming().duration, getComputedStyle(p).animationTimingFunction]); });
    ok("a popup comes in for 200ms on the decelerating curve", !!enter && enter.length > 0 && enter[0][1] === 200 && /cubic-bezier\(0\.2, 0\.8, 0\.2, 1\)/.test(enter[0][2]), JSON.stringify(enter));
    await wait(260); await page.keyboard.press("Escape"); await frames(1);
    const out = await page.evaluate(() => { const g = document.querySelector(".ds-ghost"); return g && g.getAnimations().map((a) => [a.animationName, a.effect.getComputedTiming().duration, getComputedStyle(g).animationTimingFunction]); });
    ok("the closed popup's copy fades with ds-out for 120ms on the accelerating curve", !!out && out[0][0] === "ds-out" && out[0][1] === 120 && /cubic-bezier\(0\.4, 0, 1, 1\)/.test(out[0][2]), JSON.stringify(out));
    await wait(200);
  });

  await part("2 · 팝오버 들어옴", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const cases = [["components/dropdown.html", ".example .dropdown:not(.open) [aria-haspopup=menu]", ".dropdown", ".menu"], ["components/select.html", ".example .dropdown:not(.open) .trigger[aria-haspopup=listbox]", ".dropdown", ".menu"], ["components/combobox.html", ".example .combobox:not(.open) input[role=combobox]:not([disabled])", ".combobox", ".menu"], ["components/date-picker.html", ".example .datepicker:not(.open):not([data-range]) .cal-btn", ".datepicker", ".calendar"], ["components/time-picker.html", ".example .timepicker:not(.open) .tp-btn", ".timepicker", ".time-panel"], ["components/notification-center.html", ".example .notify:not(.open) [aria-haspopup=dialog]", ".notify", ".notify-panel"]];
    const res = [];
    for (const [p, sel, host, pop] of cases) {
      await go(p); await wait(300);
      const t = page.locator(sel).first(); await t.scrollIntoViewIfNeeded(); await wait(350);
      await page.evaluate((s) => { window.__moT = document.querySelector(s); }, sel);
      await t.click();
      const r = await page.evaluate(([h, m]) => { const el = window.__moT.closest(h).querySelector(m); const a = el.getAnimations().filter((x) => x.animationName); const cs = getComputedStyle(el); const o = cs.transformOrigin.split(" ").map(parseFloat); return { name: a.map((x) => x.animationName).join(), d: a[0] && a[0].effect.getComputedTiming().duration, op: +cs.opacity, tr: cs.translate, sc: parseFloat(cs.scale), ox: Math.round(o[0] - el.offsetWidth), oy: Math.round(o[1]), oh: el.offsetHeight, right: m === ".notify-panel" }; }, [host, pop]);
      res.push([p.split("/")[1], r]);
      await page.keyboard.press("Escape");
    }
    const bad = res.filter(([, r]) => !/^ds-pop(-up)?$/.test(r.name) || r.d !== 200 || !(r.op < 1) || r.tr === "none" || !(r.sc < 1 && r.sc >= 0.98) || r.oy !== (r.name === "ds-pop-up" ? r.oh : 0) || (r.right && r.ox !== 0));
    ok("menus, Select, Combobox, calendar, time list and notification center pop in over 200ms from faded, 4px off and scale .98 grown from the trigger edge (top, bottom when flipped up · notification center top right)", bad.length === 0, JSON.stringify(bad.length ? bad : res));
    await go("components/dropdown.html"); await wait(300);
    const ut = page.locator(".example .dropdown:not(.open) [aria-haspopup=menu]").first(); await ut.scrollIntoViewIfNeeded(); await wait(350);
    await page.evaluate(() => { window.__moT = document.querySelector(".example .dropdown:not(.open) [aria-haspopup=menu]"); });
    await page.setViewportSize({ width: 1440, height: Math.ceil(await page.evaluate(() => window.__moT.getBoundingClientRect().bottom + 12)) });
    await ut.click();
    const up = await page.evaluate(() => { const dd = window.__moT.closest(".dropdown"), m = dd.querySelector(".menu"); const cs = getComputedStyle(m); return [dd.className, m.getAnimations().map((a) => a.animationName).join(), cs.translate, parseFloat(cs.scale), Math.round(parseFloat(cs.transformOrigin.split(" ")[1]) - m.offsetHeight)]; });
    ok("a menu flipped above its trigger comes up from below (ds-pop-up) and grows from its bottom edge", /\bup\b/.test(up[0]) && up[1] === "ds-pop-up" && up[2] !== "none" && up[3] < 1 && up[4] === 0, JSON.stringify(up));
    await page.keyboard.press("Escape"); await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const rt = page.locator(".example .dropdown:not(.open) [aria-haspopup=menu]").first(); await rt.scrollIntoViewIfNeeded(); await wait(350); await rt.click();
    const rm = await page.evaluate(() => { const m = document.querySelector(".example .dropdown.open .menu"); return [m.getAnimations().length, getComputedStyle(m).opacity]; });
    await page.emulateMedia({ reducedMotion: null }); await page.keyboard.press("Escape");
    ok("with reduced motion the menu is there at once", rm[0] === 0 && rm[1] === "1", JSON.stringify(rm));
  });

  await part("3 · 탭 밑줄 미끄러짐", async () => {
    /* 밑줄은 translate · scale 로 움직인다(2026-11-27) — 계산값 left · width 가 아니라 이동 · 배율을 더한 실제 자리를 잰다. pill 면은 translate + width */
    const defInk = () => page.evaluate(() => { window.__ink = (b) => { const a = getComputedStyle(b, "::after"), t = a.translate === "none" ? [0, 0] : a.translate.split(" ").map(parseFloat), sc = a.scale === "none" ? [1, 1] : a.scale.split(" ").map(parseFloat); return { x: parseFloat(a.left) + t[0], y: parseFloat(a.top) + (t[1] || 0), w: parseFloat(a.width) * sc[0], h: parseFloat(a.height) * (sc.length > 1 ? sc[1] : sc[0]), tr: a.transition }; }; });
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/tab.html"); await frames(4); await defInk();
    const fit = await page.evaluate(() => [...document.querySelectorAll(".example .tabs[role=tablist]")].map((b) => { const on = b.querySelector(".tab.on"), a = getComputedStyle(b, "::after"), k = window.__ink(b), br = b.getBoundingClientRect(), r = on.getBoundingClientRect(); return { id: b.closest(".example").id, ink: b.hasAttribute("data-ink"), dx: Math.abs(k.x - (r.left - br.left + b.scrollLeft)), dw: Math.abs(k.w - r.width), own: getComputedStyle(on).borderBottomColor, pill: b.classList.contains("pill"), bg: a.backgroundColor, onBg: getComputedStyle(on).backgroundColor }; }));
    const misfit = fit.filter((f) => !f.ink || f.dx > 0.5 || f.dw > 0.5 || (!f.pill && f.own !== "rgba(0, 0, 0, 0)") || (f.pill && f.onBg !== "rgba(0, 0, 0, 0)"));
    ok("one ink per tab row sits exactly under the selected tab (pill: the surface), the tab's own line is hidden", fit.length >= 6 && misfit.length === 0, JSON.stringify(misfit.length ? misfit : fit.map((f) => f.id)));
    const fc = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } }), fresh = await fc.newPage();
    await fresh.addInitScript(() => { window.__moRun = []; document.addEventListener("transitionrun", (e) => { if (e.target.closest && e.target.closest(".tabs")) window.__moRun.push(e.propertyName + e.pseudoElement); }, true); });
    await fresh.goto(page.url()); await fresh.waitForTimeout(400);
    const load = await fresh.evaluate(() => [[...document.querySelectorAll(".tabs[data-ink]")].length, [...document.querySelectorAll(".tabs[data-ink]")].every((b) => b.hasAttribute("data-ink-ready")), window.__moRun]);
    await fc.close();
    ok("on first paint the ink does not slide in — no transition runs while the page loads, then every row is ready", load[0] >= 6 && load[1] && load[2].length === 0, JSON.stringify(load));
    const slide = await page.evaluate(async () => { const b = document.querySelector("#ex-tab-default .tabs"); b.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 300)); const k0 = window.__ink(b); const t = b.querySelectorAll(".tab")[2]; t.click(); const xs = [], ws = []; for (let i = 0; i < 6; i++) { await new Promise((r) => requestAnimationFrame(r)); const k = window.__ink(b); xs.push(k.x); ws.push(k.w); } await new Promise((r) => setTimeout(r, 300)); const br = b.getBoundingClientRect(), r = t.getBoundingClientRect(), k = window.__ink(b), a = getComputedStyle(b, "::after"); return { x0: k0.x, w0: k0.w, xs, ws, end: k.x, endW: k.w, want: r.left - br.left + b.scrollLeft, wantW: r.width, left: a.left, width: a.width, tr: k.tr }; });
    ok("picking a tab slides the ink by translate and stretches it by scale over --motion-base (left · width never move)", slide.xs.some((x) => x > slide.x0 + 1 && x < slide.want - 1) && Math.abs(slide.end - slide.want) < 0.5 && Math.abs(slide.endW - slide.wantW) < 0.5 && slide.left === "0px" && slide.width === "1px" && /translate 0\.2s/.test(slide.tr) && /scale 0\.2s/.test(slide.tr) && !/(^|, )(left|width) /.test(slide.tr), JSON.stringify(slide));
    const over = await page.evaluate(async () => { const b = document.querySelector("#ex-tab-overflow .tabs"); b.scrollIntoView({ block: "center" }); const t = b.querySelector(".tab:last-child"); t.click(); await new Promise((r) => setTimeout(r, 400)); const k = window.__ink(b), br = b.getBoundingClientRect(), r = t.getBoundingClientRect(); return { scrolled: b.scrollLeft, dx: Math.abs(k.x - b.scrollLeft - (r.left - br.left)), dw: Math.abs(k.w - r.width) }; });
    ok("in a scrolled tab row the ink stays under the tab", over.scrolled > 0 && over.dx < 0.5 && over.dw < 0.5, JSON.stringify(over));
    const pill = await page.evaluate(async () => { const b = document.querySelector("#ex-tab-pill .tabs"); const t = [...b.querySelectorAll(".tab:not(.on)")][0]; t.click(); await new Promise((r) => setTimeout(r, 400)); const a = getComputedStyle(b, "::after"), k = window.__ink(b), br = b.getBoundingClientRect(), r = t.getBoundingClientRect(); return { dx: Math.abs(k.x - (r.left - br.left)), dy: Math.abs(k.y - (r.top - br.top)), dw: Math.abs(k.w - r.width), dh: Math.abs(k.h - r.height), scale: a.scale, tr: a.transition, sh: a.boxShadow !== "none", tz: getComputedStyle(t).zIndex }; });
    ok("the pill surface slides to the picked tab (translate · width — not scaled, so corners and shadow keep shape) and the label stays above it", pill.dx < 0.5 && pill.dy < 0.5 && pill.dw < 0.5 && pill.dh < 0.5 && pill.scale === "none" && /translate 0\.2s/.test(pill.tr) && pill.sh && pill.tz === "1", JSON.stringify(pill));
    const acc = await page.evaluate(() => { const b = document.querySelector("#ex-tab-variant .tabs"), d = document.createElement("i"); d.style.color = "var(--foreground-brand-primary)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return [getComputedStyle(b, "::after").backgroundColor, c]; });
    ok("the accent ink is the brand colour", acc[0] === acc[1], JSON.stringify(acc));
    await go("components/notification-center.html"); await wait(300); await defInk();
    const bell = page.locator(".example .notify:not(.open) [aria-haspopup=dialog]").first(); await bell.scrollIntoViewIfNeeded(); await wait(350);
    await page.evaluate(() => { window.__moRun = []; const h = document.querySelector(".example .notify:not(.open)"); window.__moH = h; h.addEventListener("transitionrun", (e) => { if (e.target.closest(".tabs")) window.__moRun.push(e.propertyName); }, true); });
    await bell.click(); await wait(400);
    const hid = await page.evaluate(() => { const b = window.__moH.querySelector(".notify-panel .tabs"), on = b.querySelector(".tab.on"), br = b.getBoundingClientRect(), r = on.getBoundingClientRect(), k = window.__ink(b); return { run: window.__moRun, dx: Math.abs(k.x - (r.left - br.left)), dw: Math.abs(k.w - r.width), ready: b.hasAttribute("data-ink-ready") }; });
    await page.keyboard.press("Escape");
    ok("a tab row that was hidden (closed notification panel) shows its ink in place without sliding in", hid.run.length === 0 && hid.dx < 0.5 && hid.dw < 0.5 && hid.ready, JSON.stringify(hid));
    await go("components/tab.html"); await frames(4); await defInk();
    await page.emulateMedia({ reducedMotion: "reduce" });
    const rm = await page.evaluate(async () => { const b = document.querySelector("#ex-tab-default .tabs"), t = b.querySelectorAll(".tab")[0]; t.click(); await new Promise((r) => requestAnimationFrame(r)); const br = b.getBoundingClientRect(), r = t.getBoundingClientRect(); return Math.abs(window.__ink(b).x - (r.left - br.left)); });
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion the ink jumps at once", rm < 0.5, String(rm));
  });

  await part("3b · 진행 막대", async () => {
    /* 채움은 늘 트랙 폭이고 --p 만큼 translate 로 민다(2026-11-27) — 값이 바뀌면 그 사이를 지나고, 폭은 움직이지 않는다 */
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/loading.html"); await frames(4);
    const r = await page.evaluate(async () => {
      const m = document.querySelector(".example .progress[role=progressbar]"), i = m.firstElementChild; m.scrollIntoView({ block: "center" }); await new Promise((f) => setTimeout(f, 300));
      const vis = () => (i.getBoundingClientRect().right - m.getBoundingClientRect().left) / m.getBoundingClientRect().width;
      i.style.setProperty("--p", "20%"); await new Promise((f) => setTimeout(f, 300)); const a = vis();
      i.style.setProperty("--p", "80%"); const mid = []; for (let k = 0; k < 6; k++) { await new Promise((f) => requestAnimationFrame(f)); mid.push(vis()); }
      await new Promise((f) => setTimeout(f, 300));
      const cs = getComputedStyle(i);
      return { a, mid, b: vis(), w: Math.abs(i.getBoundingClientRect().width - m.getBoundingClientRect().width), tr: cs.transition, clip: getComputedStyle(m).overflow };
    });
    ok("a progress bar slides its fill by translate between values, its width stays the track width", Math.abs(r.a - 0.2) < 0.01 && Math.abs(r.b - 0.8) < 0.01 && r.mid.some((x) => x > 0.21 && x < 0.79) && r.w < 0.5 && /translate 0\.2s/.test(r.tr) && !/width/.test(r.tr) && r.clip === "hidden", JSON.stringify(r));
  });

  await part("4 · 사이드 내비 폭", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("templates/screen/dashboard.html"); await wait(400);
    const run = await page.evaluate(async () => { const n = document.querySelector(".sidenav"), b = document.querySelector("[data-sidenav-toggle]"), w = () => n.getBoundingClientRect().width; const w0 = w(); b.click(); const ws = []; for (let i = 0; i < 6; i++) { await new Promise((r) => requestAnimationFrame(r)); ws.push(w()); } await new Promise((r) => setTimeout(r, 300)); const w1 = w(); b.click(); await new Promise((r) => requestAnimationFrame(r)); await new Promise((r) => requestAnimationFrame(r)); const lab = n.querySelector("a span"), op = +getComputedStyle(lab).opacity, an = lab.getAnimations().map((a) => a.animationName).join(); const ws2 = []; for (let i = 0; i < 4; i++) { await new Promise((r) => requestAnimationFrame(r)); ws2.push(w()); } await new Promise((r) => setTimeout(r, 400)); return { w0, ws, w1, op, an, ws2, w2: w(), clip: getComputedStyle(n).overflowX, opening: n.classList.contains("ds-nav-opening") }; });
    ok("the toggle button folds the side nav through the widths between", run.ws.some((x) => x < run.w0 - 2 && x > run.w1 + 2) && Math.abs(run.w1 - 64) < 1, JSON.stringify(run));
    ok("unfolding widens through the widths between, names fade in, overflow is clipped while it grows", run.ws2.some((x) => x > run.w1 + 2 && x < run.w0 - 2) && run.an === "ds-fade" && run.op < 1 && run.clip !== "visible" && Math.abs(run.w2 - run.w0) < 1 && !run.opening, JSON.stringify(run));
    const fc = await page.context().browser().newContext({ viewport: { width: 1024, height: 800 } }), fresh = await fc.newPage();
    await fresh.goto(page.url()); await fresh.waitForTimeout(30);
    const first = await fresh.evaluate(() => { const n = document.querySelector(".sidenav"); return [n.classList.contains("collapsed"), n.getBoundingClientRect().width, document.getAnimations().filter((a) => a.effect && a.effect.target === n).length]; });
    await fc.close();
    ok("a nav folded by screen width on first paint does not animate", first[0] && first[2] === 0 && Math.abs(first[1] - 60) < 1, JSON.stringify(first));
    await page.emulateMedia({ reducedMotion: "reduce" });
    const rm = await page.evaluate(async () => { const n = document.querySelector(".sidenav"), b = document.querySelector("[data-sidenav-toggle]"); b.click(); await new Promise((r) => requestAnimationFrame(r)); const w = n.getBoundingClientRect().width; b.click(); return w; });
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion the nav folds at once", Math.abs(rm - 64) < 1, String(rm));
  });

  await part("5 · 체크 표시 · 복사 완료", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => { window.__moChk = 0; document.addEventListener("transitionrun", (e) => { if (e.pseudoElement === "::after" && e.target.matches && e.target.matches(".checkbox input,.radio input,.menu-mark")) window.__moChk++; }, true); });
    await page.addInitScript(() => {   /* 막 시작한 ::after 전환을 찾아 길이의 절반에 멈춘다 — 프레임 수로 기다리면 부하에서 전환 시작 전 값을 읽었다(2026-11-26). 전환이 없으면 멈출 것이 없어 끝값 · 시작값이 그대로 읽힌다 */
      const mine = (el) => document.getAnimations().filter((x) => x.effect && x.effect.target === el && x.effect.pseudoElement === "::after");
      window.__moHalf = (el) => mine(el).forEach((x) => { x.pause(); x.currentTime = x.effect.getTiming().duration / 2; });
      window.__moEnd = (el) => mine(el).forEach((x) => x.finish());
    });
    await go("components/checkbox.html"); await wait(400);
    const first = await page.evaluate(() => window.__moChk);
    ok("nothing scales on first paint — checked boxes are drawn in place", first === 0, String(first));
    const look = await page.evaluate(() => { const i = [...document.querySelectorAll(".example .checkbox input")].find((x) => !x.checked && !x.disabled && !x.indeterminate && !x.classList.contains("mixed")); window.__moI = i; const a = getComputedStyle(i, "::after"); return { op: a.opacity, tr: a.transform, c: a.content, t: a.transitionProperty }; });
    ok("an unchecked box keeps its check drawn, faded and at half size", look.op === "0" && look.tr !== "none" && look.c !== "none" && /opacity/.test(look.t) && /transform/.test(look.t), JSON.stringify(look));
    const mid = await page.evaluate(async () => { const i = window.__moI; i.click(); window.__moHalf(i); const a = getComputedStyle(i, "::after"); const m = { op: +a.opacity, tr: a.transform }; window.__moEnd(i); const e = getComputedStyle(i, "::after"); return [m, { op: +e.opacity, tr: e.transform }]; });
    ok("checking grows the mark in — between values mid-way, full at the end", mid[0].op > 0 && mid[0].op < 1 && mid[0].tr !== "none" && mid[1].op === 1 && mid[1].tr === "none", JSON.stringify(mid));
    await go("components/radio-button.html"); await wait(400);
    const rd = await page.evaluate(async () => { const i = [...document.querySelectorAll(".example .radio input")].find((x) => !x.checked && !x.disabled); i.click(); window.__moHalf(i); const a = getComputedStyle(i, "::after"); const r = { op: +a.opacity, tr: a.transform, first: window.__moChk }; window.__moEnd(i); return r; });
    ok("a radio dot grows in the same way and not on first paint", rd.op > 0 && rd.op < 1 && rd.tr !== "none", JSON.stringify(rd));
    await go("components/dropdown.html"); await wait(400);
    const mk = await page.evaluate(async () => { const d = document.querySelector('.example .dropdown [role=menuitemcheckbox]').closest(".dropdown"); if (!d.classList.contains("open")) d.querySelector("[aria-haspopup]").click(); await new Promise((r) => setTimeout(r, 260)); const it = [...d.querySelectorAll('[role=menuitemcheckbox]')].find((x) => x.getAttribute("aria-checked") === "false" && x.getAttribute("aria-disabled") !== "true"); const m = it.querySelector(".menu-mark"); const b = getComputedStyle(m, "::after").opacity; it.click(); window.__moHalf(m); const a = getComputedStyle(m, "::after"); const res = { before: b, op: +a.opacity, tr: a.transform }; window.__moEnd(m); return res; });
    await page.keyboard.press("Escape");
    ok("a menu check item grows its mark in too", mk.before === "0" && mk.op > 0 && mk.op < 1 && mk.tr !== "none", JSON.stringify(mk));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await go("components/checkbox.html"); await wait(300);
    const rm = await page.evaluate(async () => { const i = [...document.querySelectorAll(".example .checkbox input")].find((x) => !x.checked && !x.disabled && !x.indeterminate && !x.classList.contains("mixed")); i.click(); await new Promise((r) => requestAnimationFrame(r)); return +getComputedStyle(i, "::after").opacity; });
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion the check appears at once", rm === 1, String(rm));
    await go("components/copy-field.html"); await wait(300);
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.resolve() } }));
    const cp = await page.evaluate(async () => { const b = document.querySelector(".example .copy"); const idle = b.querySelector(".ico > svg").getAnimations().length; b.click(); await new Promise((r) => setTimeout(r, 30)); const s = b.querySelector(".ico > svg"); return { idle, done: b.classList.contains("copy-done"), a: s.getAnimations().map((x) => x.animationName + " " + x.effect.getComputedTiming().duration).join(), op: +getComputedStyle(s).opacity }; });
    ok("a finished copy grows its check in for 120ms; the resting icon does not move", cp.idle === 0 && cp.done && cp.a === "ds-check 120" && cp.op < 1, JSON.stringify(cp));
  });

  await part("6 · 패널 바꿈 흐림", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/tab.html"); await wait(400);
    const t = await page.evaluate(async () => { const none = document.querySelectorAll(".ds-swap").length; const bar = [...document.querySelectorAll(".example .tabs")].find((b) => b.nextElementSibling && b.nextElementSibling.classList.contains("tab-panel")); const tab = [...bar.querySelectorAll(".tab")].find((x) => !x.classList.contains("on") && !x.disabled); tab.click(); const p = bar.nextElementSibling; const a = p.getAnimations().map((x) => x.animationName + " " + x.effect.getComputedTiming().duration).join(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); const op = +getComputedStyle(p).opacity; await new Promise((r) => setTimeout(r, 220)); return { none, a, op, after: p.classList.contains("ds-swap") }; });
    ok("picking a tab fades its panel in for 120ms; nothing fades on first paint; the class goes after", t.none === 0 && t.a === "ds-fade 120" && t.op < 1 && !t.after, JSON.stringify(t));
    await go("components/steps.html"); await wait(400);
    const st = await page.evaluate(() => { const sp = [...document.querySelectorAll(".example .stepper")].find((s) => !s.querySelector(".step-panel:not([hidden]) form[data-validate]")); if (!sp) return null; sp.querySelector('[data-step="next"]').click(); const p = sp.querySelector(".step-panel:not([hidden])"); return p && p.getAnimations().map((x) => x.animationName).join(); });
    ok("moving a step fades the new panel in", st === "ds-fade", String(st));
    await go("components/data-table.html"); await wait(400);
    const ex = await page.evaluate(() => { const b = [...document.querySelectorAll(".example .tbl .expand-btn")].find((x) => x.getAttribute("aria-expanded") === "false"); b.click(); const d = document.getElementById(b.getAttribute("aria-controls")); return d.getAnimations().map((x) => x.animationName).join(); });
    ok("opening a row detail fades it in", ex === "ds-fade", String(ex));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await go("components/tab.html"); await wait(300);
    const rm = await page.evaluate(() => { const bar = [...document.querySelectorAll(".example .tabs")].find((b) => b.nextElementSibling && b.nextElementSibling.classList.contains("tab-panel")); [...bar.querySelectorAll(".tab")].find((x) => !x.classList.contains("on") && !x.disabled).click(); return bar.nextElementSibling.getAnimations().length; });
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion the panel swaps at once", rm === 0, String(rm));
  });

  await part("7 · 새 항목 하이라이트", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/notification-center.html"); await wait(400);
    const nf = await page.evaluate(async () => { const host = document.querySelector(".example .notify"); const [li] = window.DS.notify.add(host, { id: "mo-1", title: "모션 시험 알림", unread: true }); await new Promise((r) => requestAnimationFrame(r)); const a = li.getAnimations().map((x) => x.animationName + " " + x.effect.getComputedTiming().duration).join(); const bg = getComputedStyle(li).backgroundColor; await new Promise((r) => setTimeout(r, 1750)); return { cls: true, a, bg, after: li.classList.contains("ds-new"), bgAfter: getComputedStyle(li).backgroundColor }; });
    ok("a new notification fades from brand subtle over 1.6s, then the class goes", nf.a === "ds-flash 1600" && nf.bg !== nf.bgAfter && !nf.after, JSON.stringify(nf));
    const nfSay = await page.evaluate(async () => { const host = document.querySelector(".example .notify"); window.DS.notify.add(host, { id: "mo-3", title: "겹침 시험 알림", unread: true }); await new Promise((r) => setTimeout(r, 120)); return document.querySelector("body > .ds-live").textContent; });
    ok("a new notification is announced by its title only, not also as '새 항목'", nfSay.includes("겹침 시험 알림") && !nfSay.includes("새 항목"), JSON.stringify(nfSay));
    await go("components/data-table.html"); await wait(400);
    const row = await page.evaluate(async () => { const tr = document.querySelector(".example .tbl tbody tr:not(.row-detail)"); window.DS.flash(tr); await new Promise((r) => requestAnimationFrame(r)); const td = tr.querySelector("td"); return { tr: tr.getAnimations().length, td: td.getAnimations().map((x) => x.animationName).join() }; });
    ok("DS.flash on a table row paints its cells, not the row", row.tr === 0 && row.td === "ds-flash", JSON.stringify(row));
    await go("patterns/log-viewer.html"); await wait(400);
    const lv = await page.evaluate(async () => { const b = document.querySelector(".example-preview [data-demo-flash]"); b.click(); await new Promise((r) => requestAnimationFrame(r)); const rows = [...b.closest(".example-preview").querySelectorAll("tbody tr.log-row")]; return rows.slice(0, 4).map((tr) => tr.classList.contains("ds-new") && tr.querySelector("td").getAnimations().some((x) => x.animationName === "ds-flash")); });
    ok("the log viewer's new-log button flashes the first three rows", JSON.stringify(lv) === "[true,true,true,false]", JSON.stringify(lv));
    /* 2026-11-27 — 뜻을 모션으로만 나르지 않게 숨긴 알림 영역에 '새 항목 n개' 를 한 번. 알림 센터는 제목으로 따로 알려 겹치지 않고, announce:false · 문구 바꾸기를 받는다 */
    const say = await page.evaluate(async () => {
      const live = () => { const l = document.querySelector("body > .ds-live"); return l ? [l.getAttribute("role"), l.classList.contains("sr-only"), l.textContent] : null; };
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      await sleep(120); const r = { demo: live() };   // 위 '새 로그' 누름의 알림(비웠다가 50ms 뒤에 넣는다)
      const rows = [...document.querySelectorAll(".example-preview tbody tr.log-row")];
      window.DS.flash([rows[0], null, rows[1]]); await sleep(120); r.two = live();
      window.DS.flash(rows[2], { announce: false }); await sleep(120); r.off = live();
      window.DS.flash(rows[1], { announce: "로그 {n}건 들어옴" }); await sleep(120); r.custom = live();
      return r;
    });
    ok("DS.flash announces '새 항목 n개' once in the hidden status, announce:false stays quiet, a custom text takes {n}",
      !!say.demo && say.demo[0] === "status" && say.demo[1] && say.demo[2] === "새 항목 3개" && say.two[2] === "새 항목 2개" && say.off[2] === "새 항목 2개" && say.custom[2] === "로그 1건 들어옴", JSON.stringify(say));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await go("components/notification-center.html"); await wait(300);
    const rm = await page.evaluate(async () => { const host = document.querySelector(".example .notify"); const [li] = window.DS.notify.add(host, { id: "mo-2", title: "줄인 모션 알림", unread: true }); const subtle = getComputedStyle(document.documentElement).getPropertyValue("--surface-brand-subtle").trim(); const probe = document.createElement("i"); probe.style.background = subtle; document.body.append(probe); const want = getComputedStyle(probe).backgroundColor; probe.remove(); const r = { a: li.getAnimations().length, bg: getComputedStyle(li).backgroundColor, want }; await new Promise((res) => setTimeout(res, 1750)); r.after = li.classList.contains("ds-new"); return r; });
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion the brand subtle face stays without fading, then goes", rm.a === 0 && rm.bg === rm.want && !rm.after, JSON.stringify(rm));
  });

  await part("8 · 지운 항목 사라짐", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/data-table.html"); await wait(400);
    const rr = await page.evaluate(async () => { const tbl = [...document.querySelectorAll(".example .tbl")].find((t) => t.querySelector("th.check input") && t.querySelectorAll("tbody tr:not(.row-detail):not(.disabled)").length > 2); const rows = [...tbl.querySelectorAll("tbody tr:not(.row-detail):not(.disabled)")]; const tr = rows[0], next = rows[1]; const box = tr.querySelector("td.check input"); box.click(); const others = rows.slice(1).map((r) => r.querySelector("td.check input")); others.forEach((b) => { if (!b.checked) b.click(); }); box.focus(); window.DS.table.removeRow(tr); const r = { leaving: tr.classList.contains("ds-leaving"), inert: tr.inert, hidden: tr.getAttribute("aria-hidden"), a: tr.getAnimations().map((x) => x.animationName + " " + x.effect.getComputedTiming().duration).join(), focus: next.contains(document.activeElement), master: tbl.querySelector("th.check input").checked, inDom: tbl.contains(tr) }; await new Promise((res) => setTimeout(res, 260)); r.gone = !tbl.contains(tr); return r; });
    ok("a removed row fades out in place for 120ms — inert and hidden, focus moves at once, the header box counts only what stays", rr.leaving && rr.inert && rr.hidden === "true" && rr.a === "ds-out 120" && rr.focus && rr.master && rr.inDom && rr.gone, JSON.stringify(rr));
    await go("components/chip.html"); await wait(400);
    const ch = await page.evaluate(async () => { const x = document.querySelector(".example .chip > .x:not([disabled])"); const chip = x.closest(".chip"); let ev = 0; chip.addEventListener("ds:chip-remove", () => ev++); x.focus(); x.click(); const r = { ev, leaving: chip.classList.contains("ds-leaving"), inert: chip.inert, a: chip.getAnimations().map((y) => y.animationName).join(), focusOut: !chip.contains(document.activeElement) && document.activeElement !== document.body }; await new Promise((res) => setTimeout(res, 260)); r.gone = !chip.isConnected; return r; });
    ok("a removed input chip fades out while focus and the event go at once", ch.ev === 1 && ch.leaving && ch.inert && ch.a === "ds-out" && ch.focusOut && ch.gone, JSON.stringify(ch));
    const ts = await page.evaluate(async () => { window.DS.toast("모션 시험 토스트", { duration: 0 }); await new Promise((r) => setTimeout(r, 260)); const t = [...document.querySelectorAll(".toast-stack.fixed > .toast")].pop(); const c = t.querySelector("button"); c.click(); const r = { leaving: t.classList.contains("ds-leaving"), a: t.getAnimations().map((y) => y.animationName).join() }; await new Promise((res) => setTimeout(res, 260)); r.gone = !t.isConnected; return r; });
    ok("a closed toast fades out with ds-out, not its coming-in animation", ts.leaving && ts.a === "ds-out" && ts.gone, JSON.stringify(ts));
    await go("components/combobox.html"); await wait(400);
    const cb = await page.evaluate(() => { const x = document.querySelector(".example .combobox .control .chip > .x"); const v = x.closest(".chip").dataset.value; x.click(); const g = document.querySelector(".ds-ghost .chip"); return { ghost: !!g && g.dataset.value === v, real: [...document.querySelectorAll(".example .combobox .control .chip")].every((c) => c.dataset.value !== v || c.closest(".ds-ghost")) }; });
    ok("a removed Combobox tag leaves a fading copy while the real tag is gone", cb.ghost, JSON.stringify(cb));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await go("components/chip.html"); await wait(300);
    const rm = await page.evaluate(() => { const x = document.querySelector(".example .chip > .x:not([disabled])"); const chip = x.closest(".chip"); x.click(); return chip.isConnected; });
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion a removed chip goes at once", rm === false, String(rm));
  });
};
