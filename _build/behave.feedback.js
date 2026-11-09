/* 피드백 · 오버레이 동작 검사(2026-11-10) — Toast · Banner · Popup · Tooltip · Side Panel. behave.js 가 부른다 */
module.exports = async function feedback({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const stack = () => page.locator("body > .toast-stack.fixed .toast");
  const clearToasts = () => page.evaluate(() => { const s = document.querySelector("body > .toast-stack.fixed"); if (s) s.remove(); });
  const away = () => page.mouse.move(4, 500);

  /* ── Toast ── */
  await go("components/notification.html"); await away();
  await page.evaluate(() => window.DS.toast("내보내기에 실패했습니다", { tone: "danger", duration: 50 }));
  await wait(300);
  const errT = await stack().evaluate((e) => ({ d: e.dataset.duration, close: e.querySelector("button.close")?.getAttribute("aria-label") }));
  ok("error toast ignores duration, stays and has a named close button", errT.d === "0" && errT.close === "닫기" && (await stack().count()) === 1, JSON.stringify(errT));
  await stack().locator("button.close").click(); await away(); await wait(250);
  ok("error toast closes by its button", (await stack().count()) === 0);

  const dur = await page.evaluate(() => [window.DS.toast("a").dataset.duration, window.DS.toast("b", { action: { label: "실행 취소" } }).dataset.duration, window.DS.toast("c", { action: { label: "실행 취소" }, duration: 2000 }).dataset.duration]);
  ok("toast duration: 4s plain, 10s with an action, explicit value kept", dur.join() === "4000,10000,2000", dur.join());
  const closeBtn = await page.evaluate(() => [...document.querySelectorAll("body > .toast-stack.fixed .toast")].some((t) => t.querySelector(".close")));
  ok("toasts that disappear by themselves have no close button", !closeBtn);
  await clearToasts();

  await page.evaluate(() => window.DS.toast("hold", { duration: 400 }));
  await stack().hover(); await wait(700);
  const heldHover = await stack().count();
  await away(); await wait(250);
  const stillAfterLeave = await stack().count();   // 남은 시간이 처음부터 돌지 않고 이어진다 — 아직 400 안 지남
  await wait(500);
  ok("toast timer stops while the pointer is over and resumes after it leaves", heldHover === 1 && stillAfterLeave === 1 && (await stack().count()) === 0, JSON.stringify({ heldHover, stillAfterLeave }));

  await page.evaluate(() => window.DS.toast("left", { duration: 700 })); await wait(450);
  await stack().hover(); await wait(300); await away(); await wait(400);
  ok("after the pause a toast runs only its remaining time", (await stack().count()) === 0, String(await stack().count()));

  await page.evaluate(() => { window.DS.toast("focus", { action: { label: "실행 취소" }, duration: 400 }); document.querySelector("body > .toast-stack.fixed .action").focus(); });
  await wait(700);
  const heldFocus = await stack().count();
  await page.evaluate(() => document.activeElement.blur()); await wait(700);
  ok("toast timer stops while focus is inside and resumes on blur", heldFocus === 1 && (await stack().count()) === 0, String(heldFocus));

  await page.evaluate(() => { window.DS.toast("hold-a", { duration: 400 }); window.DS.toast("hold-b", { duration: 400 }); });
  await stack().first().hover(); await wait(700);
  ok("hovering one toast holds the whole stack", (await stack().count()) === 2);
  await away(); await wait(800); await clearToasts();

  await page.evaluate(() => window.DS.toast("same", { duration: 500 })); await wait(300);
  await page.evaluate(() => window.DS.toast("same", { duration: 500 })); await wait(300);
  const merged = await stack().evaluateAll((l) => l.map((x) => x.style.opacity !== "0"));   // 첫 알림의 500 이 지났다 — 시간을 다시 재지 않았으면 사라지는 중
  await wait(450);
  ok("the same toast merges and restarts its time", merged.join() === "true" && (await stack().count()) === 0, merged.join());
  await page.evaluate(() => { window.DS.toast("same-a", { action: { label: "실행 취소" }, duration: 0 }); window.DS.toast("same-a", { action: { label: "실행 취소" }, duration: 0 }); });
  ok("toasts with an action do not merge", (await stack().count()) === 2);
  await clearToasts();
  await page.evaluate(() => { window.DS.toast("same-b", { duration: 0 }); window.DS.toast("same-b", { action: { label: "실행 취소" }, duration: 0 }); });
  ok("a toast with an action does not merge into a plain one", (await stack().count()) === 2 && (await stack().locator(".action").count()) === 1);
  await clearToasts();

  await page.evaluate(() => { for (const m of ["e1", "e2", "e3"]) window.DS.toast(m, { tone: "danger" }); window.DS.toast("n1", { duration: 0 }); });
  const texts = () => stack().evaluateAll((l) => l.map((e) => e.textContent.trim()));
  ok("errors are never pushed out, the stack grows past three", (await texts()).join() === "e1,e2,e3,n1", (await texts()).join());
  await clearToasts();
  await page.evaluate(() => { window.DS.toast("o1", { duration: 9000 }); window.DS.toast("e1", { tone: "danger" }); window.DS.toast("o2", { duration: 9000 }); window.DS.toast("o3", { duration: 9000 }); });
  ok("overflow removes the oldest toast that disappears by itself", (await texts()).join() === "e1,o2,o3", (await texts()).join());
  await clearToasts();

  await page.evaluate(() => { const o = document.createElement("button"); o.id = "t-from"; o.textContent = "시작"; document.querySelector("main, body").prepend(o); o.focus(); for (const m of ["k1", "k2"]) window.DS.toast(m, { tone: "danger" }); });
  await page.evaluate(() => document.querySelector("body > .toast-stack.fixed .toast .close").focus());
  await page.keyboard.press("Enter"); await wait(250);
  const f1 = await page.evaluate(() => document.activeElement.closest(".toast")?.textContent.trim());
  await page.keyboard.press("Enter"); await wait(250);
  const f2 = await page.evaluate(() => document.activeElement.id);
  ok("closing a toast by keyboard moves focus to the next one, then back to where it came from", f1 === "k2" && f2 === "t-from" && (await stack().count()) === 0, JSON.stringify({ f1, f2 }));
  await page.evaluate(() => { for (const m of ["m1", "m2"]) window.DS.toast(m, { tone: "danger" }); document.querySelector("body > .toast-stack.fixed .close").focus(); });
  await stack().first().locator(".close").click(); await away(); await wait(250);
  ok("closing a toast by mouse does not move focus into the next one", !(await page.evaluate(() => !!document.activeElement.closest(".toast"))));
  await clearToasts();
  await page.evaluate(() => document.getElementById("t-from").remove());
  await page.evaluate(() => window.DS.toast("o", { tone: "danger" }));
  await page.keyboard.press("Tab"); await page.evaluate(() => document.querySelector("body > .toast-stack.fixed .close").focus());
  const ring = await stack().locator(".close").evaluate((e) => { const c = getComputedStyle(e); return [c.outlineColor, c.color, c.outlineStyle]; });
  ok("the toast close ring uses the label colour on the dark surface", ring[0] === ring[1] && ring[2] === "solid", ring.join());
  await clearToasts();

  /* ── Banner ── */
  const banner = page.locator(".example-preview .banner");
  await page.evaluate(() => { window.__bc = 0; document.addEventListener("ds:banner-close", () => window.__bc++); });
  const bs = await banner.evaluate((b) => { const x = b.querySelector(".close"), r = x.getBoundingClientRect(), br = b.getBoundingClientRect(), btn = b.querySelector(".btn").getBoundingClientRect(); return { name: x.getAttribute("aria-label"), right: Math.round(br.right - r.right), after: r.left >= btn.right }; });
  ok("banner has a named close button after its action, at the right padding", bs.name === "닫기" && bs.right === 20 && bs.after, JSON.stringify(bs));
  /* 제품 색 면 위의 버튼 — 기본 글자색은 라이트에서 3.70 이었다 */
  const bBtn = banner.locator(".btn");
  const bTok = (v) => page.evaluate((x) => { const d = document.createElement("i"); d.style.color = `var(${x})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);
  const bRead = () => bBtn.evaluate((e) => { const c = getComputedStyle(e); return { color: c.color, border: c.borderTopColor, bg: c.backgroundColor, spin: getComputedStyle(e, "::after").color, outline: c.outlineColor }; });
  const bLabel = await bTok("--brand-label");
  const bRest = await bRead();
  ok("banner outline button takes the label colour on the brand surface", bRest.color === bLabel && bRest.border === bLabel && bRest.bg === "rgba(0, 0, 0, 0)", JSON.stringify(bRest));
  await bBtn.hover(); await wait(250); const bHov = await bRead();
  await page.mouse.down(); await wait(250); const bAct = await bRead();
  await away(); await page.mouse.up(); await wait(250);
  ok("banner button hover and pressed use the solid primary surfaces", bHov.bg === (await bTok("--surface-brand-strong")) && bAct.bg === (await bTok("--surface-brand-heavy")), JSON.stringify([bHov.bg, bAct.bg]));
  await bBtn.evaluate((e) => e.classList.add("loading")); await wait(30);
  const bLoad = await bRead();
  await bBtn.evaluate((e) => e.classList.remove("loading"));
  ok("banner button spinner uses the label colour", bLoad.spin === bLabel, bLoad.spin);
  await banner.evaluate((e) => e.classList.add("warning")); await wait(250);
  const bWarn = await bRead();
  await banner.evaluate((e) => e.classList.remove("warning")); await wait(250);
  ok("a warning banner keeps the neutral button label", bWarn.color === (await bTok("--foreground-neutral-primary")) && bWarn.border !== bLabel, JSON.stringify(bWarn));
  await page.keyboard.press("Tab"); await bBtn.focus();
  const bFocus = await bRead();
  ok("the banner button ring uses the label colour", bFocus.outline === bFocus.color, JSON.stringify(bFocus));
  await page.keyboard.press("Tab"); await banner.locator(".close").focus();
  const bRing = await banner.locator(".close").evaluate((e) => { const c = getComputedStyle(e); return [c.outlineColor, c.color]; });
  ok("the banner close ring uses the label colour on the brand surface", bRing[0] === bRing[1], bRing.join());
  await page.keyboard.press("Enter"); await wait(250);
  const bf = await page.evaluate(() => ({ tag: document.activeElement.tagName, n: window.__bc }));
  ok("banner closes, fires ds:banner-close and focus does not fall to body", (await banner.count()) === 0 && bf.n === 1 && bf.tag !== "BODY", JSON.stringify(bf));

  /* ── Popup ── */
  await go("components/popup.html"); await away();
  await page.evaluate(() => { document.querySelectorAll(".example-preview .popup").forEach((p, i) => { p.id = "pp" + i; }); const o = document.createElement("button"); o.id = "p-from"; o.textContent = "시작"; document.querySelector("main, body").prepend(o); o.focus(); });
  const isOpen = () => page.evaluate(() => !!document.querySelector(".popup-backdrop[data-ds-popup]"));
  const open = (i) => page.evaluate((n) => window.DS.popup.open("#pp" + n), i);
  const clickDim = async () => { await page.mouse.click(6, 6); await wait(40); };
  const active = () => page.evaluate(() => { const a = document.activeElement; return (a.className || a.tagName) + "|" + (a.textContent || "").trim() + "|" + (a.id || ""); });

  await open(0);
  const geo = await page.evaluate(() => { const t = document.querySelector(".popup-backdrop .popup-title"), x = document.querySelector(".popup-backdrop .popup-close"), r = document.createRange(); r.selectNodeContents(t); const a = r.getClientRects()[0], b = x.getBoundingClientRect(); return { dy: Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)), gap: b.left - a.right }; });
  ok("popup close sits on the title line", geo.dy <= 1.5 && geo.gap > 0, JSON.stringify(geo));
  const firstF = await active();
  ok("popup first focus skips the close button and lands on cancel", /취소/.test(firstF) && !/popup-close/.test(firstF), firstF);
  await clickDim();
  ok("an untouched popup closes on backdrop click", !(await isOpen()));

  await open(3);
  ok("form popup first focus is the first field", /^.*\|.*\|hash$/.test(await active()), await active());
  await page.keyboard.type("a"); await clickDim();
  ok("a popup with input in progress stays on backdrop click", await isOpen());
  await page.keyboard.press("Escape"); await wait(30);
  ok("Esc still closes it", !(await isOpen()));
  await open(3); await clickDim();
  ok("dirty state resets when the popup reopens", !(await isOpen()));
  await open(3);
  await page.evaluate(() => { const b = document.createElement("button"); b.type = "button"; b.className = "menu-item"; b.textContent = "x"; document.querySelector(".popup-backdrop .popup-form").append(b); });
  await page.locator(".popup-backdrop .menu-item").click(); await clickDim();
  ok("picking from a list inside counts as input", await isOpen());
  await page.evaluate(() => { document.querySelector(".popup-backdrop .menu-item").remove(); window.DS.popup.close(); });

  await open(2);
  const dg = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop .popup"); return { role: p.getAttribute("role"), desc: !!document.getElementById(p.getAttribute("aria-describedby")) }; });
  ok("danger popup is an alertdialog described by its body", dg.role === "alertdialog" && dg.desc, JSON.stringify(dg));
  ok("danger popup with a confirm field focuses the field", /\|confirm$/.test(await active()), await active());
  await clickDim();
  ok("danger popup stays on backdrop click", await isOpen());
  await page.evaluate(() => window.DS.popup.close());
  await page.evaluate(() => { const f = document.querySelector("#pp2 .field"); window.__f = f; f.remove(); const a = document.querySelector("#pp2 .popup-actions"), neg = a.querySelector(".negative"); neg.disabled = false; a.prepend(neg); });
  await open(2);
  const dgF = await active();
  ok("danger popup without a field focuses cancel, never the destructive button", /취소/.test(dgF), dgF);
  await page.evaluate(() => { window.DS.popup.close(); const a = document.querySelector("#pp2 .popup-actions"), neg = a.querySelector(".negative"); neg.disabled = true; a.append(neg); a.before(window.__f); });

  await open(0);
  const warned = []; const onCon = (m) => { if (m.type() === "warning") warned.push(m.text()); }; page.on("console", onCon);
  await open(1); await wait(30); page.off("console", onCon);
  const single = await page.evaluate(() => document.querySelectorAll(".popup-backdrop[data-ds-popup]").length);
  ok("opening a popup over a popup warns and does nothing", single === 1 && warned.some((t) => t.includes("모달 위에 모달")), JSON.stringify({ single, warned }));

  await page.evaluate(() => window.DS.popup.busy(true));
  const busyA = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop .popup"); return { busy: p.getAttribute("aria-busy"), off: [...p.querySelectorAll("[data-popup-close]")].map((b) => b.disabled) }; });
  await page.keyboard.press("Escape"); await wait(30); const afterEsc = await isOpen(); await clickDim(); const afterDim = await isOpen();
  ok("busy popup disables close and cancel and ignores Esc and backdrop", busyA.busy === "true" && busyA.off.length === 2 && busyA.off.every(Boolean) && afterEsc && afterDim, JSON.stringify({ busyA, afterEsc, afterDim }));
  await page.evaluate(() => window.DS.popup.busy(false));
  const busyB = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop .popup"); return { busy: p.getAttribute("aria-busy"), off: [...p.querySelectorAll("[data-popup-close]")].map((b) => b.disabled) }; });
  ok("busy(false) gives the close paths back", busyB.busy === null && !busyB.off.some(Boolean), JSON.stringify(busyB));
  await page.locator(".popup-backdrop .popup-close").click(); await wait(30);
  ok("the close button closes", !(await isOpen()));

  await page.evaluate(() => { const b = document.querySelector("#pp0 .popup-body"); window.__txt = b.textContent; b.textContent = "긴 본문입니다. ".repeat(900); });
  await open(0);
  const lng = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop .popup"), b = p.querySelector(".popup-body"), t = p.querySelector(".popup-title").getBoundingClientRect(), a = p.querySelector(".popup-actions").getBoundingClientRect(), r = p.getBoundingClientRect(); return { scroll: b.scrollHeight > b.clientHeight, top: r.top, bottom: innerHeight - r.bottom, tv: t.top >= r.top, av: a.bottom <= r.bottom }; });
  ok("a long popup stays on screen and only its body scrolls", lng.scroll && lng.top >= 23.5 && lng.bottom >= 23.5 && lng.tv && lng.av, JSON.stringify(lng));
  await page.evaluate(() => { window.DS.popup.close(); document.querySelector("#pp0 .popup-body").textContent = window.__txt; });
  await open(3);
  const fm = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop .popup").getBoundingClientRect(), f = document.querySelector(".popup-backdrop .popup-form"), i = f.querySelector("input").getBoundingClientRect(), c = getComputedStyle(f); return { pad: c.paddingLeft, w: Math.round(i.width), left: Math.round(i.left - p.left) }; });
  ok("the popup form keeps room for the focus ring and its fields stay on the 24 padding", fm.pad === "4px" && fm.w === 392 && fm.left === 24, JSON.stringify(fm));
  await page.evaluate(() => { window.DS.popup.close(); document.getElementById("p-from").remove(); });

  /* ── Tooltip ── */
  await go("components/tooltip.html"); await away();
  const tipOf = (loc) => loc.evaluate((b) => { const t = b.parentNode.querySelector(".tooltip"), s = getComputedStyle(t), r = t.getBoundingClientRect(); return { o: +s.opacity, cls: t.className, top: r.top, bottom: r.bottom, left: r.left, right: r.right, q: b.parentNode.classList.contains("quiet") }; });
  const refresh = page.locator('.example-preview .tooltip-wrap:not(.show) button[aria-label="새로 고침"]');
  await refresh.scrollIntoViewIfNeeded(); await wait(400);
  await refresh.hover(); await wait(150);
  const early = await tipOf(refresh); await wait(450);
  const late = await tipOf(refresh);
  ok("tooltip waits before appearing under the pointer", early.o === 0 && late.o === 1, JSON.stringify([early.o, late.o]));
  await page.keyboard.press("Escape"); await wait(200);
  const esc = await tipOf(refresh);
  ok("Esc hides the tooltip while the pointer stays", esc.o === 0 && esc.q, JSON.stringify(esc));
  await away(); await wait(50);
  ok("leaving resets it for next time", !(await tipOf(refresh)).q);
  await page.keyboard.press("Tab"); await refresh.focus(); await wait(220);
  ok("keyboard focus shows the tooltip without the delay", (await tipOf(refresh)).o === 1);
  await page.evaluate(() => document.activeElement.blur()); await away(); await wait(200);
  await refresh.hover(); await refresh.focus(); await wait(30);
  const bothDelay = await refresh.evaluate((b) => getComputedStyle(b.closest(".tooltip-wrap").querySelector(".tooltip")).transitionDelay);
  ok("focus wins over the pointer delay while both apply", bothDelay === "0s", bothDelay);
  await page.evaluate(() => document.activeElement.blur()); await away(); await wait(200);
  const nameOnly = await refresh.getAttribute("aria-describedby");
  ok("an icon button whose name is the tooltip has no aria-describedby", nameOnly === null, String(nameOnly));

  await page.evaluate(() => {
    const mk = (id, css, cls, wrapBox) => { const h = document.createElement("div"); h.id = id; h.style.cssText = css; h.innerHTML = `<span class="tooltip-wrap"><button type="button" class="btn sm outline assistive">자리</button><span class="tooltip ${cls}" role="tooltip">조금 긴 설명 문구가 들어갑니다 조금 긴 설명 문구가 들어갑니다</span></span>`; (wrapBox || document.body).append(h); return h; };
    mk("tp-top", "position:fixed;left:600px;top:2px;z-index:200", "");
    mk("tp-left", "position:fixed;left:2px;top:300px;z-index:200", "left");
    mk("tp-edge", "position:fixed;right:2px;top:300px;z-index:200", "");
    const box = document.createElement("div"); box.id = "tp-box"; box.style.cssText = "position:fixed;left:600px;top:400px;width:300px;height:60px;overflow:auto;z-index:200;background:#eee"; document.body.append(box);
    box.innerHTML = '<div style="height:200px"></div>'; mk("tp-clip", "", "", box.firstChild);
  });
  const hov = async (id) => { const b = page.locator(`#${id} button`); await b.hover(); await wait(60); return { ...(await tipOf(b)), id }; };
  const top = await hov("tp-top");
  ok("tooltip flips to the opposite side at the screen edge", /\bbottom\b/.test(top.cls) && top.top >= 8, JSON.stringify(top));
  const left = await hov("tp-left");
  ok("a left tooltip flips right at the left edge", /\bright\b/.test(left.cls) && left.left > 0, JSON.stringify(left));
  const edge = await hov("tp-edge");
  ok("a tooltip that would overflow sideways is clamped inside the screen", /\bfloat\b/.test(edge.cls) && edge.right <= 1440 - 7.5, JSON.stringify(edge));
  const clip = await hov("tp-clip");
  const boxTop = await page.evaluate(() => document.getElementById("tp-box").getBoundingClientRect().top);
  ok("a tooltip inside a scroll area escapes the clipping", /\bfloat\b/.test(clip.cls) && clip.top < boxTop, JSON.stringify({ clip, boxTop }));
  await page.locator("#tp-box").evaluate((e) => { e.scrollTop = 20; }); await wait(80);
  ok("scrolling hides a floating tooltip", (await page.locator("#tp-clip .tooltip-wrap").evaluate((w) => w.classList.contains("quiet"))));
  await away();
  await page.evaluate(() => { for (const id of ["tp-top", "tp-left", "tp-edge", "tp-box"]) document.getElementById(id).remove(); });

  await page.evaluate(() => { const p = document.createElement("div"); p.className = "popup"; p.id = "tip-pop"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.innerHTML = '<span class="tooltip-wrap"><button type="button" class="btn sm outline assistive" id="tip-b">자리</button><span class="tooltip" role="tooltip">설명</span></span>'; document.body.append(p); window.DS.popup.open("#tip-pop"); });
  await page.locator("#tip-b").focus(); await page.keyboard.press("Tab"); await page.locator("#tip-b").focus(); await wait(220);
  await page.keyboard.press("Escape"); await wait(30);
  const q1 = await page.evaluate(() => ({ open: !!document.querySelector(".popup-backdrop[data-ds-popup]"), q: document.querySelector("#tip-pop .tooltip-wrap").classList.contains("quiet") }));
  await page.keyboard.press("Escape"); await wait(30);
  ok("Esc closes a tooltip inside a popup first, the popup on the next press", q1.open && q1.q && !(await page.evaluate(() => !!document.querySelector(".popup-backdrop[data-ds-popup]"))), JSON.stringify(q1));

  /* ── Side Panel ── */
  await go("components/side-panel.html"); await away();
  const pnl = (id) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return { hidden: e.hidden, fixed: e.classList.contains("fixed"), pos: c.position, right: Math.round(innerWidth - r.right), top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), inPreview: !!e.closest(".example-preview"), overflow: document.body.style.overflow, dim: !!document.querySelector(".side-panel-dim") }; }, id);
  const stat = await page.evaluate(() => { const e = document.querySelector("#ex-side-panel-default .side-panel"), r = e.getBoundingClientRect(), c = getComputedStyle(e); return { pos: c.position, w: Math.round(r.width) }; });
  ok("side panel example renders in place at width 400", stat.pos === "static" && stat.w === 400, JSON.stringify(stat));
  const lng2 = await page.evaluate(() => { const e = document.querySelector("#ex-side-panel-long .side-panel"), b = e.querySelector(".side-panel-body"), h = e.querySelector(".side-panel-header").getBoundingClientRect(), f = e.querySelector(".side-panel-footer").getBoundingClientRect(), r = e.getBoundingClientRect(); b.scrollTop = 40; return { scroll: b.scrollTop === 40, top: Math.round(h.top - r.top), bottom: Math.round(r.bottom - f.bottom) }; });
  ok("long side panel scrolls only its body", lng2.scroll && lng2.top <= 1 && lng2.bottom <= 1, JSON.stringify(lng2));
  await page.evaluate(() => { window.__pc = 0; document.addEventListener("ds:panel-close", () => window.__pc++); });
  const inPlace = await page.evaluate(() => { const e = document.querySelector("#ex-side-panel-default .side-panel"); window.DS.panel.close(e); return [e.hidden, window.__pc]; });
  ok("an in-page panel example is not closed", inPlace.join() === "false,0", inPlace.join());

  const liveBtn = page.locator('[data-panel-open="#sp-live"]');
  await liveBtn.click(); await wait(30);
  const lv = await pnl("#sp-live");
  ok("non-modal panel opens at the right edge, full height, width 400", lv.fixed && !lv.hidden && lv.pos === "fixed" && lv.right === 0 && lv.top === 0 && lv.h === 900 && lv.w === 400, JSON.stringify(lv));
  ok("non-modal panel neither dims nor locks scrolling", !lv.dim && lv.overflow === "", JSON.stringify(lv));
  ok("opening moves focus to the panel", await page.evaluate(() => document.activeElement.id === "sp-live"));
  const behind = await page.evaluate(() => { const b = document.querySelector('[data-panel-open="#sp-live"]').getBoundingClientRect(); return document.elementFromPoint(b.left + 4, b.top + 4)?.closest("[data-panel-open]") != null; });
  await page.locator(".example-preview .btn").first().click({ trial: true });
  await page.mouse.click(4, 500); await wait(30);
  ok("non-modal panel leaves the page usable and stays open on an outside click", behind && (await pnl("#sp-live")).fixed);
  await page.evaluate(() => { const o = document.createElement("button"); o.id = "sp-out"; o.textContent = "뒤"; document.querySelector("main, body").prepend(o); o.focus(); });
  await page.keyboard.press("Escape"); await wait(30);
  ok("Esc does nothing while focus is on the page", (await pnl("#sp-live")).fixed);
  await page.evaluate(() => window.DS.panel.close()); await wait(30);
  const kept = await page.evaluate(() => [document.activeElement.id, window.__pc]);
  ok("closing does not take focus back from the page and fires ds:panel-close", kept[0] === "sp-out" && kept[1] === 1, kept.join());
  const back = await pnl("#sp-live");
  ok("closed panel returns to its place, hidden", back.hidden && !back.fixed && back.inPreview, JSON.stringify(back));
  await page.evaluate(() => document.getElementById("sp-out").remove());

  await liveBtn.focus(); await page.keyboard.press("Enter"); await wait(30);
  await page.keyboard.press("Tab");
  const onX = await page.evaluate(() => document.activeElement.classList.contains("side-panel-close"));
  await page.keyboard.press("Escape"); await wait(30);
  ok("Esc inside closes and focus returns to the opener", onX && !(await pnl("#sp-live")).fixed && (await page.evaluate(() => document.activeElement.getAttribute("data-panel-open") === "#sp-live")), String(onX));
  await liveBtn.click(); await wait(30);
  await page.locator("#sp-live .side-panel-close").click(); await wait(30);
  ok("the close button closes", !(await pnl("#sp-live")).fixed);

  await page.evaluate(() => { window.DS.panel.open("#sp-live"); window.DS.panel.open("#sp-modal"); });
  await wait(30);
  const swap = await page.evaluate(() => [...document.querySelectorAll(".side-panel.fixed")].map((e) => e.id));
  ok("opening another panel swaps it, one at a time", swap.join() === "sp-modal", swap.join());
  await page.evaluate(() => window.DS.panel.close()); await wait(30);

  const modalBtn = page.locator('[data-panel-open="#sp-modal"]');
  await modalBtn.click(); await wait(30);
  const md = await pnl("#sp-modal");
  ok("modal panel dims, locks scrolling and is 560 wide", md.dim && md.overflow === "hidden" && md.w === 560, JSON.stringify(md));
  const inTrap = () => page.evaluate(() => !!document.activeElement.closest("#sp-modal"));
  await page.keyboard.press("Shift+Tab"); const t0 = await inTrap();
  const seq = [t0]; for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); seq.push(await inTrap()); }
  ok("modal panel keeps Tab and Shift+Tab inside, from the panel itself too", seq.every(Boolean), JSON.stringify(seq));
  await page.mouse.click(6, 6); await wait(30);
  const closed = await pnl("#sp-modal");
  ok("backdrop click closes a modal panel, restores scrolling and focus", closed.hidden && !closed.dim && closed.overflow === "" && (await page.evaluate(() => document.activeElement.getAttribute("data-panel-open") === "#sp-modal")), JSON.stringify(closed));

  await liveBtn.click(); await wait(30);
  await page.evaluate(() => { const p = document.createElement("div"); p.className = "popup"; p.id = "sp-pop"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.innerHTML = '<button type="button" class="btn sm outline assistive">자리</button>'; document.body.append(p); window.DS.popup.open("#sp-pop"); });
  await page.keyboard.press("Escape"); await wait(30);
  const layered = await page.evaluate(() => [!!document.querySelector(".popup-backdrop[data-ds-popup]"), !!document.querySelector("#sp-live.fixed")]);
  const z = await page.evaluate(() => { const a = document.querySelector("#sp-live.fixed"); return getComputedStyle(a).zIndex; });
  ok("Esc closes a popup above the panel first, and the panel stays under the popup layer", !layered[0] && layered[1] && Number(z) < 100, JSON.stringify({ layered, z }));
  await page.evaluate(() => window.DS.panel.close());
};
