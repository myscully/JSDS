/* Kbd · 명령 팔레트 · 단축키 도움말(2026-11-26) — behave.js 가 부른다.
   1. Kbd — 크기 20 · 18, 면 · 선 · 글자 토큰, 수정 키가 운영체제에 맞게(맥 ⌘ + 숨긴 Command · 그 밖 Ctrl), 메뉴 끝 자리 · Tooltip 안 모양, Search 의 / 도 같은 모양
   2. 명령 팔레트 — Mod K 로 열고 다시 누르면 닫힘, 입력 중에도 열림, 다른 대화상자가 열린 동안은 무시, 첫 항목 활성 · 포커스는 검색칸
   3. 찾기 · 키 — 부분 일치 · 초성 · 결과 수 알림, ↑↓ 돌기 · Home · End, Enter · 누름으로 실행하면 닫고 ds:command · 포커스 복귀, 다시 열면 비어 있음, 맞는 것이 없으면 안내
   4. 단축키 도움말 — ? 로 열림, 입력 중에는 무시
   5. 줄인 모션 · 좁은 화면 — 팔레트 들어옴 없음, 390 에서 화면 안 */
module.exports = async function kbd({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.kbd", () => page);
  const settle = () => page.evaluate(() => document.getAnimations().forEach((a) => { if (a.effect && a.effect.getComputedTiming().endTime !== Infinity) a.finish(); }));
  const mod = async () => (await page.evaluate(() => window.DS.kbd.mac)) ? "Meta" : "Control";
  const pal = () => page.evaluate(() => {
    const bd = document.querySelector(".popup-backdrop[data-ds-popup]"), el = bd && bd.querySelector(".cmdk");
    if (!el) return { open: false, backdrop: !!bd };
    const inp = el.querySelector(".cmdk-search input"), on = el.querySelector('.cmdk-item[aria-selected="true"]');
    const vis = [...el.querySelectorAll(".cmdk-item")].filter((x) => !x.hidden).map((x) => x.querySelector(".cmdk-name").textContent);
    return { open: true, focus: document.activeElement === inp, value: inp.value, active: on ? on.querySelector(".cmdk-name").textContent : null, ad: inp.getAttribute("aria-activedescendant") === (on && on.id), vis, groups: [...el.querySelectorAll(".cmdk-group")].filter((g) => !g.hidden).length, empty: !el.querySelector(".cmdk-empty").hidden, status: el.querySelector(":scope > [role=status]").textContent };
  });

  await part("1 · Kbd 모양 · 운영체제", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/kbd.html"); await wait(300);
    const m = await page.evaluate(() => {
      const probe = (v) => { const d = document.createElement("div"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      const k = document.querySelector(".example-preview kbd.kbd:not(.sm)"), s = document.querySelector(".example-preview kbd.kbd.sm"), ck = getComputedStyle(k), cs = getComputedStyle(s);
      return { h: k.getBoundingClientRect().height, hs: s.getBoundingClientRect().height, fs: ck.fontSize, fss: cs.fontSize, bg: ck.backgroundColor === probe("--background-neutral-secondary"), line: ck.borderTopColor === probe("--line-neutral-secondary"), fg: ck.color === probe("--foreground-neutral-secondary"), rad: ck.borderTopLeftRadius, num: ck.fontVariantNumeric };
    });
    ok("kbd is 20 high (sm 18) on the token face, line and secondary text", m.h === 20 && m.hs === 18 && m.fs === "12px" && m.fss === "11px" && m.bg && m.line && m.fg && m.rad === "4px" && /tabular/.test(m.num), JSON.stringify(m));
    const os = await page.evaluate(() => {
      const ks = [...document.querySelectorAll("kbd[data-kbd-mod]")], k = ks[0];
      window.DS.kbd.sync(document, true); const mac = { html: k.innerHTML, name: k.textContent, hidden: k.querySelector('[aria-hidden="true"]').textContent, sr: k.querySelector(".sr-only").textContent };
      window.DS.kbd.sync(document, true); const twice = k.innerHTML === mac.html;
      window.DS.kbd.sync(document, false); const other = k.innerHTML;
      window.DS.kbd.sync(document); return { mac, twice, other, n: ks.length, auto: window.DS.kbd.mac ? ks.every((x) => x.dataset.kbdMac === "1") : ks.every((x) => x.textContent === "Ctrl") };
    });
    ok("the modifier key reads ⌘ with a hidden 'Command' on a Mac and Ctrl elsewhere", os.mac.hidden === "⌘" && os.mac.sr === "Command" && os.twice && os.other === "Ctrl" && os.n >= 6 && os.auto, JSON.stringify(os));
    const place = await page.evaluate(() => {
      const it = document.querySelector('.example-preview .menu-item[aria-keyshortcuts="F2"]'), mk = it.querySelector(".menu-kbd"), ir = it.getBoundingClientRect(), mr = mk.getBoundingClientRect(), pr = parseFloat(getComputedStyle(it).paddingRight);
      const tk = document.querySelector(".example-preview .tooltip kbd"), ct = getComputedStyle(tk), tip = getComputedStyle(tk.closest(".tooltip"));
      const sk = document.querySelector('.searchbar kbd') ;
      return { right: Math.round(ir.right - pr - mr.right), hidden: mk.getAttribute("aria-hidden"), mid: Math.abs((mr.top + mr.bottom) / 2 - (ir.top + ir.bottom) / 2) < 1.5, tipBg: ct.backgroundColor, tipColor: ct.color === tip.color, tipLine: ct.borderTopColor === tip.color, search: !sk };
    });
    ok("menu shortcuts sit at the item's right edge, centred and hidden; a tooltip shortcut takes the tooltip's colour", place.right === 0 && place.hidden === "true" && place.mid && place.tipBg === "rgba(0, 0, 0, 0)" && place.tipColor && place.tipLine, JSON.stringify(place));
    await go("components/search.html"); await wait(300);
    const sk = await page.evaluate(() => { const k = document.querySelector(".example-preview .searchbar kbd"); return k && { cls: k.className, h: k.getBoundingClientRect().height, fs: getComputedStyle(k).fontSize }; });
    ok("Search's '/' hint is the same Kbd", !!sk && sk.cls === "kbd" && sk.h === 20 && sk.fs === "12px", JSON.stringify(sk));
  });

  await part("2 · 명령 팔레트 열기 · 닫기", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/command-palette.html"); await wait(300);
    const M = await mod();
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press(`${M}+K`); await settle();
    let p = await pal();
    ok("Mod K opens the palette with the search focused and the first command active", p.open && p.focus && p.value === "" && p.active === "대시보드" && p.ad && p.vis.length === 8 && p.groups === 2, JSON.stringify(p));
    const geo = await page.evaluate(() => { const el = document.querySelector(".popup-backdrop[data-ds-popup] .cmdk"), r = el.getBoundingClientRect(); return { w: r.width, top: Math.round(r.top), x: Math.round(r.left + r.width / 2), close: !!el.querySelector(".popup-close") }; });
    ok("it is 640 wide, 96 from the top, centred, with no close button", geo.w === 640 && geo.top === 96 && Math.abs(geo.x - 720) <= 1 && !geo.close, JSON.stringify(geo));
    await page.keyboard.press(`${M}+K`); await wait(200);
    p = await pal();
    ok("pressing Mod K again closes it", !p.open && !p.backdrop, JSON.stringify(p));
    /* 입력 중에도 열림 · 다른 대화상자가 열린 동안은 무시 */
    await page.evaluate(() => { const i = document.createElement("input"); i.id = "kb-probe"; i.setAttribute("aria-label", "시험"); document.body.append(i); i.focus(); });
    await page.keyboard.press(`${M}+K`); await settle();
    p = await pal();
    const inInput = p.open && p.focus;
    await page.keyboard.press("Escape"); await wait(200);
    const back = await page.evaluate(() => document.activeElement && document.activeElement.id);
    await page.evaluate(() => { const d = document.createElement("div"); d.className = "popup"; d.id = "kb-other"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "다른 창"); d.innerHTML = '<button type="button" class="btn md solid primary">확인용</button>'; document.body.append(d); window.DS.popup.open("#kb-other"); });
    const warns = []; const onWarn = (m) => { if (m.type() === "warning") warns.push(m.text()); }; page.on("console", onWarn);
    await page.keyboard.press(`${M}+K`); await wait(100); page.off("console", onWarn);
    const other = await page.evaluate(() => ({ cmdk: !!document.querySelector(".popup-backdrop[data-ds-popup] .cmdk"), other: !!document.querySelector(".popup-backdrop[data-ds-popup] #kb-other") }));
    other.warns = warns;   // 단축키가 팝업 위에 팔레트를 열려 들지도 않는다(DS.popup 의 '모달 위에 모달' 경고 없음)
    await page.evaluate(() => { window.DS.popup.close(); document.getElementById("kb-other").remove(); document.getElementById("kb-probe").remove(); }); await wait(200);
    ok("Mod K opens while typing in a field, Esc returns focus there, and it does nothing over another dialog", inInput && back === "kb-probe" && !other.cmdk && other.other && other.warns.length === 0, JSON.stringify({ inInput, back, other }));
  });

  await part("3 · 찾기 · 키 · 실행", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/command-palette.html"); await wait(300);
    await page.click('.example-preview [data-popup-open="#cmdk-demo"]'); await settle();
    await page.keyboard.type("정책"); await wait(50);
    let p = await pal();
    ok("typing filters by name and announces the count", JSON.stringify(p.vis) === '["정책","정책 만들기"]' && p.active === "정책" && p.groups === 2 && p.status === "결과 2개" && p.ad, JSON.stringify(p));
    await page.fill(".popup-backdrop .cmdk-search input", ""); await page.keyboard.type("ㄷㅅㅂ"); await wait(50);
    const jamo = (await pal()).vis;
    await page.fill(".popup-backdrop .cmdk-search input", ""); await page.keyboard.type("CSV"); await wait(50);
    const kw = await pal();
    ok("consonants match initials and other names match too", JSON.stringify(jamo) === '["대시보드"]' && JSON.stringify(kw.vis) === '["보고서 내보내기"]' && kw.groups === 1, JSON.stringify({ jamo, kw }));
    await page.fill(".popup-backdrop .cmdk-search input", ""); await page.keyboard.press("Backspace"); await wait(50);
    await page.keyboard.press("ArrowUp"); const up = (await pal()).active;
    await page.keyboard.press("ArrowDown"); const wrap = (await pal()).active;
    await page.keyboard.press("ArrowDown"); const down = (await pal()).active;
    await page.keyboard.press("End"); const end = (await pal()).active;
    await page.keyboard.press("Home"); const home = (await pal()).active;
    const still = (await pal()).focus;
    ok("↑ from the top wraps to the last, ↓ wraps back, Home and End jump, focus stays in the search", up === "단축키 보기" && wrap === "대시보드" && down === "탐지 로그" && end === "단축키 보기" && home === "대시보드" && still, JSON.stringify({ up, wrap, down, end, home, still }));
    const scrolled = await page.evaluate(() => { const l = document.querySelector(".popup-backdrop .cmdk-list"); return { sh: l.scrollHeight, ch: l.clientHeight, y: window.scrollY }; });
    await page.evaluate(() => { window.__cmd = []; document.addEventListener("ds:command", (e) => window.__cmd.push(e.detail)); });
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await wait(150);
    const run = await page.evaluate(() => ({ cmd: window.__cmd, open: !!document.querySelector(".popup-backdrop[data-ds-popup]"), focus: document.activeElement && document.activeElement.getAttribute("data-popup-open"), toast: [...document.querySelectorAll(".toast")].map((t) => t.textContent).join("|") }));
    ok("Enter closes the palette, then fires ds:command and returns focus to the button", run.cmd.length === 1 && run.cmd[0].value === "nav-policies" && run.cmd[0].label === "정책" && !run.open && run.focus === "#cmdk-demo" && /명령을 골랐습니다: 정책/.test(run.toast), JSON.stringify({ run, scrolled }));
    await page.click('.example-preview [data-popup-open="#cmdk-demo"]'); await settle();
    p = await pal();
    const fresh = p.value === "" && p.vis.length === 8 && p.active === "대시보드" && p.status === "";
    await page.keyboard.type("백업"); await wait(50);
    const none = await pal();
    ok("reopening starts empty; no match shows the hint and announces it", fresh && none.vis.length === 0 && none.groups === 0 && none.empty && none.active === null && !(await page.evaluate(() => document.querySelector(".popup-backdrop .cmdk-search input").hasAttribute("aria-activedescendant"))) && none.status === "맞는 명령이 없습니다", JSON.stringify({ p, none }));
    await page.keyboard.press("Enter"); await wait(50);
    const stay = (await pal()).open;
    await page.mouse.click(30, 30); await wait(200);
    const bgClose = !(await pal()).open;
    ok("Enter with no match does nothing; typing does not keep the backdrop from closing it", stay && bgClose, JSON.stringify({ stay, bgClose }));
    await page.click('.example-preview [data-popup-open="#cmdk-demo"]'); await settle();
    const it = await page.$('.popup-backdrop .cmdk-item[data-value="report-export"]');
    await it.hover(); const hov = (await pal()).active;
    await it.click(); await wait(150);
    const clicked = await page.evaluate(() => ({ last: window.__cmd[window.__cmd.length - 1], open: !!document.querySelector(".popup-backdrop[data-ds-popup]") }));
    ok("hovering activates and clicking runs the command", hov === "보고서 내보내기" && clicked.last.value === "report-export" && !clicked.open, JSON.stringify({ hov, clicked }));
    const st = await page.evaluate(() => { const el = document.getElementById("cmdk-empty"); return { groups: [...el.querySelectorAll(".cmdk-group")].filter((g) => !g.hidden).length, empty: !el.querySelector(".cmdk-empty").hidden, value: el.querySelector("input").value }; });
    ok("the Empty example shows the hint with every group hidden", st.groups === 0 && st.empty && st.value === "백업", JSON.stringify(st));
  });

  await part("4 · 단축키 도움말", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/kbd.html"); await wait(300);
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press("Shift+Slash"); await settle();
    const open = await page.evaluate(() => { const p = document.querySelector(".popup-backdrop[data-ds-popup] .popup[data-hotkey-help]"); return p && { rows: p.querySelectorAll("tbody tr").length, focusIn: p.contains(document.activeElement) }; });
    await page.keyboard.press("Escape"); await wait(200);
    await page.evaluate(() => { const i = document.createElement("input"); i.id = "kb-probe"; i.setAttribute("aria-label", "시험"); document.body.append(i); i.focus(); });
    await page.keyboard.press("Shift+Slash"); await wait(100);
    const typing = await page.evaluate(() => ({ open: !!document.querySelector(".popup-backdrop[data-ds-popup]"), value: document.getElementById("kb-probe").value }));
    await page.evaluate(() => document.getElementById("kb-probe").remove());
    ok("? opens the shortcut help; typing ? in a field just types it", !!open && open.rows === 4 && open.focusIn && !typing.open && typing.value === "?", JSON.stringify({ open, typing }));
  });

  await part("5 · 줄인 모션 · 좁은 화면", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await go("components/command-palette.html"); await wait(300);
    await page.click('.example-preview [data-popup-open="#cmdk-demo"]'); await wait(30);
    const an = await page.evaluate(() => { const bd = document.querySelector(".popup-backdrop[data-ds-popup]"); return bd ? [bd, ...bd.querySelectorAll("*")].flatMap((n) => n.getAnimations()).length : -1; });
    await page.keyboard.press("Escape"); await wait(100);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    ok("with reduced motion the palette appears without animation", an === 0, String(an));
    await page.setViewportSize({ width: 390, height: 800 });
    await go("components/command-palette.html"); await wait(300);
    const inline = await page.evaluate(() => [...document.querySelectorAll(".example-preview")].map((p) => p.scrollWidth - p.clientWidth));
    await page.click('.example-preview [data-popup-open="#cmdk-demo"]'); await settle();
    const r = await page.evaluate(() => { const b = document.querySelector(".popup-backdrop[data-ds-popup] .cmdk").getBoundingClientRect(); return { l: b.left, r: b.right, ow: document.documentElement.scrollWidth - document.documentElement.clientWidth }; });
    await page.keyboard.press("Escape"); await wait(100);
    const pop = await page.evaluate(async () => { const d = document.createElement("div"); d.className = "popup"; d.id = "kb-wide"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "넓은 창"); d.innerHTML = "<p>" + "긴 문장 ".repeat(40) + "</p>"; document.body.append(d); window.DS.popup.open("#kb-wide"); await new Promise((r) => setTimeout(r, 50)); const b = d.getBoundingClientRect(); window.DS.popup.close(); d.remove(); return { l: b.left, r: b.right }; });
    /* 배경 그리드 칸이 내용 폭으로 늘어나 max-width:100% 가 듣지 않던 것(2026-11-26 — 일반 Popup 도 390 에서 22px 넘쳤다) */
    await page.setViewportSize({ width: 1440, height: 900 });
    ok("at 390 an ordinary popup also stays inside the screen", pop.l >= 22 && pop.r <= 368   /* 배경 여백 1.5rem — 1279 이하는 22.5 */, JSON.stringify(pop));
    ok("at 390 the palette and the examples stay inside the screen", inline.every((x) => x <= 0) && r.l >= 0 && r.r <= 390 && r.ow <= 0, JSON.stringify({ inline, r }));
  });
};
