/* Steps 마법사(2026-11-13, 외부 컴포넌트 Stepper 참고 — 구조 · 동작만) — 배치 셋의 기하, 브랜드 색(라이트 · 다크), 순서대로 · 자유 이동 흐름, 폼 검사, Enter, ds:step, DS.stepper.go.
   behave.js 가 부른다 */
module.exports = async function stepper({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const D = "#ex-steps-default .stepper", N = "#ex-steps-nonlinear .stepper", V = "#ex-steps-vertical .stepper", B = "#ex-steps-label-below .steps";
  const state = (sel) => page.evaluate((s) => { const sp = document.querySelector(s), li = [...sp.querySelectorAll(":scope > .steps > li")], ps = [...sp.querySelectorAll(".step-panel")];
    return { on: li.findIndex((x) => x.classList.contains("on")), done: li.map((x) => x.classList.contains("done")), btn: li.map((x) => !!x.querySelector(":scope > .step-btn")), cur: li.map((x) => x.getAttribute("aria-current")),
      shown: ps.map((p) => !p.hidden), check: li.map((x) => !!x.querySelector(":scope i svg, :scope > .step-btn > i svg")), sr: li.map((x) => !!x.querySelector(".sr-only")),
      active: document.activeElement && (document.activeElement.id || (document.activeElement.classList.contains("step-panel") ? "panel" + ps.indexOf(document.activeElement) : document.activeElement.tagName)) }; }, sel);
  const btn = (sel, k) => page.locator(`${sel} [data-step="${k}"]:visible`).first();
  const listen = () => page.evaluate(() => { window.__st = []; window.__fin = []; document.addEventListener("ds:step", (e) => window.__st.push(e.detail)); document.addEventListener("ds:step-finish", (e) => window.__fin.push(e.detail)); });
  const heard = () => page.evaluate(() => ({ st: window.__st, fin: window.__fin }));

  /* ── 모양 · 색 — 라이트 · 다크 ── */
  await go("components/steps.html"); await page.mouse.move(2, 2);
  for (const t of [null, "dark"]) {
    await theme(t); await wait(700);
    const nm = t || "light";
    const W = { brand: await tok("--surface-brand-primary"), label: await tok("--brand-label", "color"), subtle: await tok("--surface-brand-subtle"), bfg: await tok("--foreground-brand-primary", "color"),
      line: await tok("--line-neutral-primary", "borderTopColor"), sec: await tok("--foreground-neutral-secondary", "color"), ter: await tok("--foreground-neutral-tertiary", "color"), pri: await tok("--foreground-neutral-primary", "color") };
    const L = await page.evaluate((s) => [...document.querySelectorAll(`${s} > .steps > li`)].map((li) => { const i = li.querySelector("i"), c = getComputedStyle(i), a = getComputedStyle(li, "::after"), lab = getComputedStyle(li.querySelector(".label")), r = i.getBoundingClientRect(), svg = i.querySelector("svg");
      return { w: r.width, h: r.height, bg: c.backgroundColor, bd: c.borderTopColor, fg: c.color, line: a.backgroundColor, lineH: a.height, fs: lab.fontSize, fw: lab.fontWeight, lc: lab.color, svg: svg ? Math.round(svg.getBoundingClientRect().width) : 0 }; }), D);
    const [done, on, todo] = [L[0], L[1], L[2]];
    ok(`steps ${nm}: circles are 32 and the done check is 16`, L.every((x) => x.w === 32 && x.h === 32) && done.svg === 16, JSON.stringify(L));
    ok(`steps ${nm}: done = brand circle with a brand-label check, its connector is brand`, done.bg === W.brand && done.bd === W.brand && done.fg === W.label && done.line === W.brand, JSON.stringify({ done, W }));
    ok(`steps ${nm}: current = brand ring on brand-subtle with a brand number, its connector is gray`, on.bd === W.brand && on.bg === W.subtle && on.fg === W.bfg && on.line === await tok("--line-neutral-primary"), JSON.stringify({ on, W }));
    ok(`steps ${nm}: pending = gray ring, no face, secondary number`, todo.bd === W.line && todo.bg === "rgba(0, 0, 0, 0)" && todo.fg === W.sec, JSON.stringify({ todo, W }));
    ok(`steps ${nm}: labels are 14 — current primary 600, done secondary, pending tertiary; connectors 2px`, L.every((x) => x.fs === "14px") && on.fw === "600" && on.lc === W.pri && done.lc === W.sec && todo.lc === W.ter && L.slice(0, -1).every((x) => x.lineH === "2px"), JSON.stringify(L));
  }
  await theme(null); await wait(300);

  /* ── 배치 셋 ── */
  const geo = await page.evaluate(([d, b, v]) => {
    const box = (e) => e.getBoundingClientRect(), after = (li) => { const a = getComputedStyle(li, "::after"); return { w: parseFloat(a.width), h: parseFloat(a.height) }; };
    const H = [...document.querySelectorAll(`${d} > .steps > li`)], ol = box(document.querySelector(`${d} > .steps`));
    const horiz = { lines: H.slice(0, -1).map((li) => Math.round(after(li).w)), olRight: Math.round(ol.right), lastRight: Math.round(box(H[H.length - 1]).right) };
    const BL = [...document.querySelectorAll(`${b} > li`)].map((li) => { const i = box(li.querySelector("i")), l = box(li.querySelector(".label")), a = getComputedStyle(li, "::after"), lr = box(li);
      return { ci: i.left + i.width / 2, cl: l.left + l.width / 2, cy: i.top + i.height / 2, iTop: i.top, lTop: l.top, iBottom: i.bottom, aTop: lr.top + parseFloat(a.top), aLeft: lr.left + parseFloat(a.left), aW: parseFloat(a.width), iRight: i.right }; });
    const VL = [...document.querySelectorAll(`${v} > .steps > li`)].map((li) => { const i = box(li.querySelector("i")), lr = box(li), a = getComputedStyle(li, "::after"), p = li.querySelector(".step-panel");
      return { cx: i.left + i.width / 2, iTop: i.top, iBottom: i.bottom, iRight: i.right, aX: lr.left + parseFloat(a.left) + parseFloat(a.width) / 2, aTop: lr.top + parseFloat(a.top), aBottom: lr.bottom - parseFloat(a.bottom), aOn: a.content !== "none", panelLeft: p && !p.hidden ? box(p).left : null }; });
    return { horiz, BL, VL, dir: getComputedStyle(document.querySelector(`${v} > .steps`)).flexDirection };
  }, [D, B, V]);
  const h = geo.horiz;
  ok("steps horizontal: connectors share the free width (all equal, over 16) and the last step ends at the row's end", h.lines.every((w) => w > 16 && Math.abs(w - h.lines[0]) <= 1) && Math.abs(h.olRight - h.lastRight) <= 1, JSON.stringify(h));
  const bl = geo.BL;
  ok("steps label-below: label under its circle, centred; the connector runs at the circle's middle from one circle to the next",
    bl.every((x) => Math.abs(x.ci - x.cl) <= 1 && x.lTop >= x.iBottom) && bl.slice(0, -1).every((x, k) => Math.abs(x.aTop + 1 - x.cy) <= 1 && x.aLeft >= x.iRight && x.aLeft + x.aW <= bl[k + 1].ci - 16 + 1), JSON.stringify(bl));
  const vl = geo.VL;
  ok("steps vertical: stacked, the line runs down the circle's centre between circles, and the open panel sits right of the circles",
    geo.dir === "column" && vl.slice(0, -1).every((x, k) => Math.abs(x.aX - x.cx) <= 1 && x.aTop >= x.iBottom && x.aBottom <= vl[k + 1].iTop) && vl.filter((x) => x.panelLeft !== null).length === 1 && vl.every((x) => x.panelLeft === null || x.panelLeft >= x.iRight), JSON.stringify(geo.VL));

  /* ── 순서대로 흐름 ── */
  await listen();
  let s0 = await state(D);
  ok("stepper starts with one panel shown — the current step's — and only the done step is a button", s0.on === 1 && JSON.stringify(s0.shown) === "[false,true,false,false]" && JSON.stringify(s0.btn) === "[true,false,false,false]" && s0.cur[1] === "step", JSON.stringify(s0));
  await btn(D, "next").click(); await wait(80);
  let s1 = await state(D);
  const err = await page.evaluate(() => document.querySelector("#sd-group").closest(".field").classList.contains("error"));
  ok("next is blocked by the step's form: stays, shows the error, focuses the field, fires nothing", s1.on === 1 && err && s1.active === "sd-group" && (await heard()).st.length === 0, JSON.stringify({ s1, err }));
  await page.fill("#sd-group", "영업팀"); await btn(D, "next").click(); await wait(80);
  const s2 = await state(D), h2 = await heard();
  ok("passing next marks the step done (check + hidden '(완료)'), moves aria-current, shows the next panel and focuses it",
    s2.on === 2 && s2.done[1] && s2.check[1] && s2.sr[1] && s2.cur[2] === "step" && s2.cur[1] === null && JSON.stringify(s2.shown) === "[false,false,true,false]" && s2.active === "panel2" && s2.btn[1], JSON.stringify(s2));
  ok("next fires ds:step {index, from, trigger: next}", JSON.stringify(h2.st) === '[{"index":2,"from":1,"trigger":"next"}]', JSON.stringify(h2));
  ok("a pending step is not a button in a linear stepper", !s2.btn[3]);
  await page.locator(`${D} > .steps > li`).nth(1).locator(".step-btn").click(); await wait(80);
  const s3 = await state(D), keep = await page.inputValue("#sd-group");
  ok("pressing a done step goes back to it; inputs are kept; the current step and the one left unfinished are not buttons", s3.on === 1 && keep === "영업팀" && !s3.btn[1] && !s3.btn[2] && !s3.done[2] && (await heard()).st.pop().trigger === "click", JSON.stringify({ s3, keep }));
  await btn(D, "prev").click(); await wait(80);
  const prevOff = await page.evaluate((s) => [...document.querySelectorAll(`${s} [data-step="prev"]`)].every((b) => b.disabled), D);
  ok("prev is disabled on the first step", (await state(D)).on === 0 && prevOff);
  /* Enter 로 제출하면 '다음' 과 같다 */
  await page.evaluate((s) => window.DS.stepper.go(document.querySelector(s), 1), D); await wait(80);
  await page.focus("#sd-group"); await page.keyboard.press("Enter"); await wait(80);
  ok("Enter in the step's form is the same as next", (await state(D)).on === 2, JSON.stringify(await state(D)));
  /* 마지막 단계 — 다음 대신 완료 */
  await page.evaluate((s) => window.DS.stepper.go(document.querySelector(s), 3), D); await wait(80);
  const lastBtns = await page.evaluate((s) => { const q = (k) => [...document.querySelectorAll(`${s} [data-step="${k}"]`)].every((b) => b.hidden); return { next: q("next"), finish: q("finish") }; }, D);
  ok("DS.stepper.go moves without checking (ds:step trigger api); on the last step next hides and finish shows", lastBtns.next && !lastBtns.finish && (await heard()).st.pop().trigger === "api", JSON.stringify(lastBtns));
  await btn(D, "finish").click(); await wait(80);
  const fin = await heard(), s4 = await state(D);
  ok("finish checks the step and fires ds:step-finish {index}", JSON.stringify(fin.fin) === '[{"index":3}]' && s4.done[3], JSON.stringify({ fin, s4 }));

  /* ── 세로 — 패널 안의 버튼도 같은 흐름 ── */
  await btn(V, "next").click(); await wait(80);
  ok("vertical: next inside the open step is blocked by its form too", (await state(V)).on === 1 && (await state(V)).active === "sv-group");

  /* ── 자유 이동 ── */
  await go("components/steps.html"); await listen();
  const n0 = await state(N);
  ok("non-linear: every step but the current is a button", JSON.stringify(n0.btn) === "[false,true,true,true]", JSON.stringify(n0));
  const step = (k) => page.locator(`${N} > .steps > li`).nth(k).locator(".step-btn").click().then(() => wait(80));
  await step(2); const n1 = await state(N);
  ok("non-linear: leaving a step whose form passes marks it done", n1.on === 2 && n1.done[0] && n1.btn[0] && !n1.btn[2], JSON.stringify(n1));
  await step(1); await step(3); const n2 = await state(N);
  ok("non-linear: leaving a step whose form fails leaves it not done, quietly (no message)", n2.on === 3 && !n2.done[1] && n2.done[2] &&
    !(await page.evaluate(() => document.querySelector("#sn-group").closest(".field").classList.contains("error"))), JSON.stringify(n2));
  await btn(N, "finish").click(); await wait(120);
  const n3 = await state(N), nh = await heard();
  ok("non-linear finish goes to the first blocked step, shows its error and focuses the field — no ds:step-finish",
    n3.on === 1 && n3.active === "sn-group" && nh.fin.length === 0 && nh.st.pop().trigger === "finish" &&
    (await page.evaluate(() => document.querySelector("#sn-group").closest(".field").classList.contains("error"))), JSON.stringify({ n3, nh }));
  await page.fill("#sn-group", "영업팀"); await step(3); await btn(N, "finish").click(); await wait(80);
  const n4 = await state(N), nh2 = await heard();
  ok("non-linear finish passes once every step does", nh2.fin.length === 1 && n4.done.every(Boolean), JSON.stringify({ n4, nh2 }));

  /* ── 좁으면 세로로(사람의 결정 2026-11-13) — 가로 · 라벨 아래 배치가 자리에 안 들어가면 .stacked. 패널은 목록 아래, 미리보기는 가로로 넘치지 않는다 ── */
  const IDS = ["ex-steps-default", "ex-steps-label-below", "ex-steps-nonlinear", "ex-steps-indicator"];
  const narrow = () => page.evaluate((ids) => ids.map((id) => { const pv = document.querySelector(`#${id} .example-preview`), ol = pv.querySelector(".steps"), lis = [...ol.querySelectorAll(":scope > li")];
    const c = lis.map((li) => li.querySelector("i").getBoundingClientRect()), l = lis.map((li) => li.querySelector(".label").getBoundingClientRect());
    return { id, stacked: ol.classList.contains("stacked"), dir: getComputedStyle(ol).flexDirection, scrolls: pv.scrollWidth > pv.clientWidth, sameX: c.every((r) => Math.abs(r.left - c[0].left) <= 1), down: c.every((r, k) => !k || r.top > c[k - 1].bottom),
      labelRight: l.every((r, k) => Math.abs(r.left - c[k].right - 12) <= 1 && Math.abs((r.top + r.bottom) / 2 - (c[k].top + c[k].bottom) / 2) <= 2), panelBelow: (() => { const p = pv.querySelector(".step-panel:not([hidden])"); return !p || p.getBoundingClientRect().top >= ol.getBoundingClientRect().bottom; })() }; }), IDS);
  await go("components/steps.html");
  const wide = await narrow();
  ok("steps at 1440: every horizontal and label-below example fits, so none is stacked", wide.every((x) => !x.stacked && x.dir === "row" && !x.scrolls), JSON.stringify(wide));
  await page.setViewportSize({ width: 390, height: 900 }); await wait(300);
  const n390 = await narrow();
  ok("steps at 390: horizontal and label-below examples that do not fit stack vertically — circles in one column, label right of its circle, panel below, no sideways scroll",
    n390.every((x) => x.stacked && x.dir === "column" && !x.scrolls && x.sameX && x.down && x.labelRight && x.panelBelow), JSON.stringify(n390));
  const vert = await page.evaluate(() => document.querySelector("#ex-steps-vertical .steps").classList.contains("stacked"));
  ok("steps at 390: the vertical layout is not marked stacked (already vertical)", !vert);
  /* 글꼴을 기다리기 전에도 잰다 — 처음 그릴 때 넘친 가로 줄이 한 번 보이지 않게. 글꼴 준비가 끝나지 않는 페이지에서 잰다 */
  const p2 = await page.context().browser().newPage({ viewport: { width: 390, height: 900 } });
  await p2.addInitScript(() => Object.defineProperty(document, "fonts", { configurable: true, value: { ready: new Promise(() => {}), addEventListener() {}, check: () => true } }));
  await p2.goto(page.url()); await p2.waitForTimeout(300);
  const early = await p2.evaluate(() => document.querySelector("#ex-steps-default .steps").classList.contains("stacked")); await p2.close();
  ok("steps stack on first paint, before fonts are ready", early);
  await page.setViewportSize({ width: 1440, height: 900 }); await wait(300);
  const back = await narrow();
  ok("steps: widening the window takes the stack off again", back.every((x) => !x.stacked && x.dir === "row"), JSON.stringify(back));

  /* ── 라디오 카드 줄(2026-11-13 — 390 의 온보딩 '보호 수준' 캡처에서 발견): 카드 둘이 220 최소 폭으로 한 줄에 남아 넘쳤다. 이제 줄바꿈해 한 장씩 자리 폭을 채운다 ── */
  const radRow = async (p) => { await go(p); return page.evaluate(() => [...document.querySelectorAll(".example-preview .radio-group.row")].map((g) => { const gr = g.getBoundingClientRect(), pv = g.closest(".example-preview"), it = [...g.querySelectorAll(":scope > .radio.card")].map((c) => c.getBoundingClientRect());
    return { n: it.length, oneRow: it.every((r) => Math.abs(r.top - it[0].top) <= 1), full: it.every((r) => Math.abs(r.width - gr.width) <= 1), minW: Math.min(...it.map((r) => r.width)), gapY: it.length > 1 ? it[1].top - it[0].bottom : 0, rowGap: parseFloat(getComputedStyle(g).rowGap), rem: parseFloat(getComputedStyle(document.documentElement).fontSize), over: g.scrollWidth > g.clientWidth || pv.scrollWidth > pv.clientWidth }; })); };
  const rw = [...await radRow("components/radio-button.html"), ...await radRow("patterns/onboarding.html")];
  ok("radio card rows at 1440 keep two cards side by side, each at least 220", rw.length === 2 && rw.every((g) => g.n === 2 && g.oneRow && g.minW >= 220 && !g.over), JSON.stringify(rw));
  await page.setViewportSize({ width: 390, height: 900 }); await wait(300);
  const rn = [...await radRow("components/radio-button.html"), ...await radRow("patterns/onboarding.html")];
  await page.setViewportSize({ width: 1440, height: 900 }); await wait(300);
  ok("radio card rows at 390 wrap — one card per line at the row's width, 0.75rem apart, nothing overflows", rn.length === 2 && rn.every((g) => g.n === 2 && !g.oneRow && g.full && Math.abs(g.gapY - g.rowGap) <= 0.5 && Math.abs(g.rowGap - 0.75 * g.rem) <= 0.01 && !g.over), JSON.stringify(rn));

  /* ── 단계 버튼 포커스 링은 원에 ── */
  await go("components/steps.html");
  await page.locator(`${D} .step-btn`).first().focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(80);
  const ring = await page.evaluate((s) => { const b = document.querySelector(`${s} .step-btn`), i = getComputedStyle(b.querySelector("i")); return { focus: document.activeElement === b, btn: getComputedStyle(b).outlineStyle, i: i.outlineStyle, w: i.outlineWidth }; }, D);
  ok("a focused step button rings its circle, not the button", ring.focus && ring.btn === "none" && ring.i === "solid" && ring.w === "1px", JSON.stringify(ring));
};
