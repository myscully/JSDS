/* 메뉴 체크 · 라디오 항목 · 적용 영역, Select 여러 개, Combobox 태그 넘침, 표 칸 글자(사람의 결정 2026-11-23) — behave.js 가 부른다.
   1. Dropdown 체크 · 라디오 — 누르거나 Space 로 뒤집고, 메뉴는 열린 채 · 포커스는 그 항목 · ds:menu-change, 라디오는 묶음 안에서 하나
   2. 적용 영역 — 고르는 것은 초안(이벤트 없음), 적용 없이 닫으면 되돌림, 초기화 · 적용, Tab 은 항목 → 초기화 → 적용 → 떠남
   3. Select 여러 개 — 값 · 숨은 input · placeholder · '전체' · 고른 모양(앞 체크 · 600 · .on 없음), 적용 영역, 필수 검증
   4. Combobox — 기본 가로 스크롤(높이 그대로 · 입력칸 보임 · 세로 휠 → 가로), wrap 이면 줄바꿈
   5. 표 칸 글자 14/22 — 세 밀도 · 로그 행, 6. 열린 메뉴가 미리보기 안에 든다 */
module.exports = async function menu({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.menu", () => page);
  const listen = (type) => page.evaluate((t) => { window.__ev = []; document.addEventListener(t, (e) => window.__ev.push(JSON.parse(JSON.stringify(e.detail)))); }, type);
  const evs = () => page.evaluate(() => window.__ev.slice());

  await part("1 · Dropdown 체크 · 라디오 항목", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/dropdown.html"); await wait(250);
    await listen("ds:menu-change");
    const ck = "#ex-dropdown-checkbox .example-preview";
    await page.click(ck + " [data-value=hidden]");
    const a = await page.evaluate((s) => { const d = document.querySelector(s + " .dropdown"), i = d.querySelector("[data-value=hidden]"); return { open: d.classList.contains("open"), role: i.getAttribute("role"), checked: i.getAttribute("aria-checked"), focus: document.activeElement === i, mark: !!i.querySelector(":scope > .menu-mark.check[aria-hidden=true]") }; }, ck);
    const e1 = await evs();
    ok("dropdown check item: click flips aria-checked, keeps the menu open and focus on the item",
      a.open && a.role === "menuitemcheckbox" && a.checked === "true" && a.focus && a.mark, JSON.stringify(a));
    ok("dropdown check item: ds:menu-change carries value · checked · every checked value · trigger toggle",
      e1.length === 1 && e1[0].value === "hidden" && e1[0].checked === true && e1[0].trigger === "toggle" && e1[0].values.includes("hidden") && Array.isArray(e1[0].groups[""]), JSON.stringify(e1));
    const before = await page.evaluate((s) => [...document.querySelectorAll(s + " [role=menuitemcheckbox]")].map((i) => i.getAttribute("aria-checked")).join(), ck);
    await page.keyboard.press("ArrowDown"); await page.keyboard.press(" ");
    const after = await page.evaluate((s) => ({ v: [...document.querySelectorAll(s + " [role=menuitemcheckbox]")].map((i) => i.getAttribute("aria-checked")).join(), open: document.querySelector(s + " .dropdown").classList.contains("open") }), ck);
    ok("dropdown check item: ArrowDown + Space flips the next item and the menu stays open", after.open && after.v !== before && after.v.split(",")[0] === "true", before + " → " + JSON.stringify(after));
    /* 켜진 항목의 모양 — 글자 600 · brand 면 없음 · 앞 상자는 제품 색 면(포인터를 치우고 전환이 끝난 뒤 잰다) */
    await page.mouse.move(5, 5); await wait(250);
    const look = await page.evaluate((s) => { const i = document.querySelector(s + ' [aria-checked="true"]'), cs = getComputedStyle(i), m = getComputedStyle(i.querySelector(".menu-mark")); const probe = document.createElement("i"); probe.style.background = "var(--surface-brand-primary)"; document.body.appendChild(probe); const brand = getComputedStyle(probe).backgroundColor; probe.remove(); return { fw: cs.fontWeight, bg: cs.backgroundColor, mark: m.backgroundColor, brand, size: Math.round(parseFloat(m.width)) }; }, ck);
    ok("dropdown check item: checked = weight 600 · no item surface · 16 mark filled with the product color",
      look.fw === "600" && look.bg === "rgba(0, 0, 0, 0)" && look.mark === look.brand && look.size === 16, JSON.stringify(look));
    /* 라디오 */
    const rd = "#ex-dropdown-radio .example-preview";
    await page.evaluate(() => { window.__ev.length = 0; });
    await page.click(rd + " [data-value=severity]");
    const r = await page.evaluate((s) => { const g = document.querySelector(s + " [role=group][data-name]"); return { name: g && g.dataset.name, lbl: g && !!document.getElementById(g.getAttribute("aria-labelledby")), v: [...g.querySelectorAll("[role=menuitemradio]")].map((i) => i.getAttribute("aria-checked")), round: g.querySelectorAll(".menu-mark.round").length, open: document.querySelector(s + " .dropdown").classList.contains("open") }; }, rd);
    const e2 = await evs();
    ok("dropdown radio: one per named group, labelled, round marks, stays open, event names the group",
      r.name === "sort" && r.lbl && r.v.filter((x) => x === "true").length === 1 && r.round === r.v.length && r.open && e2.length === 1 && e2[0].name === "sort" && e2[0].values.join() === "severity", JSON.stringify({ r, e2 }));
    /* 설명 줄 · 글자로 찾기는 이름만 */
    const gp = "#ex-dropdown-groups .example-preview";
    const g = await page.evaluate((s) => { const items = [...document.querySelectorAll(s + " .menu-item")]; const withDesc = items.filter((i) => i.querySelector(":scope > .menu-text > .menu-name + .menu-desc")); return { groups: document.querySelectorAll(s + " li.menu-group[role=none] > span.menu-label + ul[role=group]").length, desc: withDesc.length, descs: withDesc.map((i) => [i.querySelector(".menu-name").textContent.trim(), i.querySelector(".menu-desc").textContent.trim()]) }; }, gp);
    ok("dropdown groups: titled groups and description lines", g.groups >= 2 && g.desc >= 1, JSON.stringify(g));
    /* 설명의 첫 글자로는 찾지 않는다 — 설명 첫 글자가 어떤 이름의 첫 글자와도 다른 항목을 골라 친다 */
    const pick = await page.evaluate((s) => { const items = [...document.querySelectorAll(s + " .menu-item")]; const firsts = items.map((i) => ((i.querySelector(".menu-name") || i).textContent.trim()[0] || "").toLowerCase()); for (const i of items) { const d = i.querySelector(".menu-desc"); if (!d) continue; const c = d.textContent.trim()[0].toLowerCase(); if (!firsts.includes(c)) return c; } return null; }, gp);
    if (pick) {
      await page.locator(gp + " .menu-item").first().focus();
      const was = await page.evaluate(() => document.activeElement.textContent.trim());
      await page.keyboard.type(pick); await wait(30);
      const now = await page.evaluate(() => document.activeElement.textContent.trim());
      ok("dropdown typeahead ignores the description line", was === now, JSON.stringify({ pick, was, now }));
    } else ok("dropdown typeahead ignores the description line", false, "no description whose first letter differs from every name");
  });

  await part("2 · 적용 영역 — 초안 · 되돌림 · 초기화 · 적용 · Tab", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/dropdown.html"); await wait(250);
    await listen("ds:menu-change");
    const ac = "#ex-dropdown-actions .example-preview";
    const st = () => page.evaluate((s) => { const d = document.querySelector(s + " .dropdown"); return { open: d.classList.contains("open"), v: [...d.querySelectorAll(".menu-item")].map((i) => i.getAttribute("aria-checked")).join(), ev: window.__ev.length }; }, ac);
    const frame = await page.evaluate((s) => { const m = document.querySelector(s + " .menu[data-actions]"); return m && { list: !!m.querySelector(":scope > ul.menu-items[role=menu]"), acts: [...m.querySelectorAll(":scope > .menu-actions.btn-group > button")].map((b) => b.dataset.menuAction + ":" + b.textContent.trim()) }; }, ac);
    ok("apply area: frame = .menu[data-actions] > ul.menu-items + .menu-actions.btn-group (초기화 · 적용)",
      !!frame && frame.list && frame.acts.join() === "reset:초기화,apply:적용", JSON.stringify(frame));
    /* 트리거가 좁아도 초기화 왼쪽 · 적용 오른쪽 한 줄(Dropdown 필터 · Select 적용) */
    const lines = [];
    for (const id of ["#ex-dropdown-actions"]) lines.push(await page.evaluate((s) => { const m = document.querySelector(s + " .menu[data-actions]"), [r, a] = [...m.querySelectorAll(".menu-actions > button")].map((x) => x.getBoundingClientRect()), mr = m.getBoundingClientRect(); return { w: Math.round(mr.width), oneLine: Math.abs(r.top - a.top) < 1, leftRight: r.right < a.left && a.right <= mr.right - 8 }; }, id + " .example-preview"));
    ok("apply area: 초기화 and 적용 share one line at the two ends, menu at least 200 wide", lines.every((l) => l.oneLine && l.leftRight && l.w >= 200), JSON.stringify(lines));
    const s0 = await st();
    await page.click(ac + " [data-value=allowed]");
    const s1 = await st();
    ok("apply area: toggling is a draft — the item flips, no event", s1.open && s1.v !== s0.v && s1.ev === 0, JSON.stringify([s0, s1]));
    await page.click(ac + " .dropdown > button"); await wait(80);
    const s2 = await st();
    ok("apply area: closing without applying reverts the draft", !s2.open && s2.v === s0.v && s2.ev === 0, JSON.stringify(s2));
    await page.click(ac + " .dropdown > button"); await wait(80);
    await page.click(ac + " [data-value=allowed]"); await page.keyboard.press("Escape"); await wait(40);
    const s3 = await st();
    ok("apply area: Esc reverts the draft too", !s3.open && s3.v === s0.v && s3.ev === 0, JSON.stringify(s3));
    await page.click(ac + " .dropdown > button"); await wait(80);
    await page.click(ac + " [data-menu-action=reset]");
    const s4 = await page.evaluate((s) => ({ checks: [...document.querySelectorAll(s + " [role=menuitemcheckbox]")].every((i) => i.getAttribute("aria-checked") === "false"), radios: [...document.querySelectorAll(s + " [role=group]")].filter((g) => g.querySelector("[role=menuitemradio]")).map((g) => [...g.querySelectorAll("[role=menuitemradio]")].filter((r) => r.getAttribute("aria-checked") === "true").length), ev: window.__ev.length, open: document.querySelector(s + " .dropdown").classList.contains("open") }), ac);
    ok("apply area: 초기화 clears checks, puts each radio group on its default, no event, stays open",
      s4.checks && s4.radios.every((n) => n === 1) && s4.ev === 0 && s4.open, JSON.stringify(s4));
    await page.click(ac + " [data-value=pending]"); await page.click(ac + " [data-menu-action=apply]"); await wait(60);
    const s5 = await page.evaluate((s) => ({ open: document.querySelector(s + " .dropdown").classList.contains("open"), ev: window.__ev.slice(), focus: document.activeElement === document.querySelector(s + " .dropdown > button") }), ac);
    ok("apply area: 적용 fires one ds:menu-change (trigger apply · groups), closes and focuses the trigger",
      !s5.open && s5.ev.length === 1 && s5.ev[0].trigger === "apply" && s5.ev[0].values.includes("pending") && !!s5.ev[0].groups.result && s5.focus, JSON.stringify(s5));
    await page.click(ac + " .dropdown > button"); await wait(80);
    const seq = [];
    for (let i = 0; i < 3; i++) { await page.keyboard.press("Tab"); seq.push(await page.evaluate((s) => ({ t: document.activeElement.dataset.menuAction || "", open: document.querySelector(s + " .dropdown").classList.contains("open") }), ac)); }
    ok("apply area: Tab goes item → 초기화 → 적용 → leaves and closes", seq[0].t === "reset" && seq[0].open && seq[1].t === "apply" && seq[1].open && !seq[2].open, JSON.stringify(seq));
  });

  await part("3 · Select 여러 개", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/select.html"); await wait(250);
    await listen("ds:select");
    const st = (s) => page.evaluate((s) => { const d = document.querySelector(s + " .dropdown"); return { open: d.classList.contains("open"), text: d.querySelector(".trigger").textContent.trim(), ph: !!d.querySelector(".trigger > .placeholder"), hid: [...d.querySelectorAll(":scope > input[type=hidden]")].map((i) => i.value).join(), sel: [...d.querySelectorAll("[role=option]")].map((i) => (i.getAttribute("aria-selected") === "true" ? 1 : 0)).join(""), on: d.querySelectorAll(".menu-item.on").length, focus: document.activeElement.dataset.value || "", ev: window.__ev.slice() }; }, s);
    const m = "#ex-select-multiple .example-preview";
    const shape = await page.evaluate((s) => { const d = document.querySelector(s + " .dropdown"); const l = d.querySelector(".menu"); return { multi: d.hasAttribute("data-multiple"), name: d.getAttribute("data-name"), role: l.getAttribute("role"), ms: l.getAttribute("aria-multiselectable"), marks: [...d.querySelectorAll("[role=option]")].every((o) => o.querySelector(":scope > .menu-mark.check")) }; }, m);
    ok("select multiple: .dropdown[data-multiple] + listbox[aria-multiselectable] + a check mark on every option",
      shape.multi && !!shape.name && shape.role === "listbox" && shape.ms === "true" && shape.marks, JSON.stringify(shape));
    await page.click(m + " [data-value=dev]");
    const a = await st(m);
    ok("select multiple: click adds the value in option order, stays open, focus stays, hidden input per value, no .on",
      a.open && a.text === "영업팀, 개발팀, 보안팀" && a.hid === "sales,dev,security" && a.on === 0 && a.focus === "dev" && a.ev.length === 1 && a.ev[0].values.join() === "sales,dev,security" && a.ev[0].trigger === "toggle", JSON.stringify(a));
    await page.keyboard.press("ArrowDown"); await page.keyboard.press(" ");
    const b = await st(m);
    ok("select multiple: ArrowDown + Space toggles the next option", b.open && b.hid === "sales,dev,infra,security", JSON.stringify(b));
    for (const v of ["sales", "dev", "infra", "security"]) await page.click(m + ` [data-value=${v}]`);
    const c = await st(m);
    ok("select multiple: nothing picked → the placeholder comes back and no hidden input", c.ph && c.text === "그룹 선택" && c.hid === "" && c.ev[c.ev.length - 1].values.length === 0, JSON.stringify(c));
    const look = await page.evaluate((s) => { const o = document.querySelector(s + ' [data-value=plan]'); o.click(); const cs = getComputedStyle(o); return { fw: cs.fontWeight, bg: cs.backgroundColor }; }, m);
    ok("select multiple: a picked option is weight 600 with no item surface", look.fw === "600" && look.bg === "rgba(0, 0, 0, 0)", JSON.stringify(look));
    /* 적용 영역 */
    await page.evaluate(() => { window.__ev.length = 0; });
    const ap = "#ex-select-multiple-apply .example-preview";
    await page.click(ap + " [data-value=sales]");
    const d1 = await st(ap);
    ok("select multiple + apply: picking is a draft (trigger follows, no event)", d1.open && d1.text === "영업팀, 개발팀, 인프라팀" && d1.ev.length === 0, JSON.stringify(d1));
    await page.click(ap + " .trigger"); await wait(80);
    const d2 = await st(ap);
    ok("select multiple + apply: closing without applying reverts", !d2.open && d2.hid === "dev,infra" && d2.ev.length === 0, JSON.stringify(d2));
    await page.click(ap + " .trigger"); await wait(80);
    await page.click(ap + " [data-menu-action=reset]"); await page.click(ap + " [data-value=plan]"); await page.click(ap + " [data-menu-action=apply]"); await wait(60);
    const d3 = await st(ap);
    ok("select multiple + apply: 초기화 then 적용 fires one ds:select {values, trigger apply} and closes",
      !d3.open && d3.hid === "plan" && d3.ev.length === 1 && d3.ev[0].trigger === "apply" && d3.ev[0].values.join() === "plan", JSON.stringify(d3));
    /* 모두 고르면 '전체' */
    const al = "#ex-select-all-selected .example-preview";
    const t0 = await st(al);
    await page.click(al + " .trigger"); await wait(80); await page.click(al + " [data-value=plan]");
    const t1 = await st(al);
    await page.click(al + " [data-value=plan]");
    const t2 = await st(al);
    ok("select multiple: all picked shows data-all-label, one off lists the names, back on shows it again",
      t0.text === "전체 그룹" && t1.text === "영업팀, 개발팀, 인프라팀, 보안팀, 디자인팀" && t2.text === "전체 그룹" && t2.hid.split(",").length === 6, JSON.stringify([t0.text, t1.text, t2.text]));
    /* 필수 — 폼 안에 넣어 잰다 */
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      const src = document.querySelector("#ex-select-all-selected .dropdown").cloneNode(true);
      src.classList.remove("open"); src.setAttribute("data-required", ""); src.setAttribute("data-name", "req-teams");
      src.querySelectorAll(":scope > input[type=hidden]").forEach((h) => h.remove());
      src.querySelectorAll("[role=option]").forEach((o) => o.setAttribute("aria-selected", "false"));
      const tr = src.querySelector(".trigger"); tr.id = "bm-req"; tr.removeAttribute("aria-labelledby"); tr.innerHTML = '<span class="placeholder">그룹 선택</span>'; tr.dataset.placeholder = "그룹 선택";
      src.querySelector(".menu").id = "bm-req-list"; tr.setAttribute("aria-controls", "bm-req-list");
      const f = document.createElement("form"); f.id = "bm-form"; f.setAttribute("data-validate", ""); f.noValidate = true;
      f.innerHTML = '<div class="field"><label id="bm-req-l">그룹</label><span class="help" aria-live="polite"></span></div><button type="submit" class="btn">저장</button>';
      f.querySelector(".field").insertBefore(src, f.querySelector(".help")); tr.setAttribute("aria-labelledby", "bm-req-l bm-req");
      document.querySelector("#ex-select-all-selected .example-preview").appendChild(f);
    });
    await page.click("#bm-form button[type=submit]"); await wait(80);
    const v1 = await page.evaluate(() => ({ inv: document.getElementById("bm-req").getAttribute("aria-invalid"), help: document.querySelector("#bm-form .help").textContent.trim(), focus: document.activeElement.id }));
    ok("select multiple required: empty submit is blocked with the choose message and focus on the trigger",
      v1.inv === "true" && /고른 항목이 없습니다/.test(v1.help) && v1.focus === "bm-req", JSON.stringify(v1));
    await page.click("#bm-req"); await wait(80); await page.click("#bm-form [data-value=dev]"); await wait(40);
    const v2 = await page.evaluate(() => ({ inv: document.getElementById("bm-req").getAttribute("aria-invalid"), help: document.querySelector("#bm-form .help").textContent.trim(), hid: [...document.querySelectorAll("#bm-form input[type=hidden][name=req-teams]")].map((i) => i.value).join() }));
    ok("select multiple required: picking one clears the error at once", v2.inv !== "true" && v2.help === "" && v2.hid === "dev", JSON.stringify(v2));
  });

  await part("4 · Combobox 태그 넘침 — 가로 스크롤 기본 · wrap", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/combobox.html"); await wait(300);
    const m = (id) => page.evaluate((id) => { const inp = document.getElementById(id), box = inp.closest(".combobox"), c = box.querySelector(".control"), t = box.querySelector(".control-track"); const cr = c.getBoundingClientRect(), ir = inp.getBoundingClientRect(); return { attr: box.getAttribute("data-overflow"), h: Math.round(cr.height), sw: t.scrollWidth, cw: t.clientWidth, sl: Math.round(t.scrollLeft), inView: ir.right <= cr.right + 1 && ir.left >= cr.left - 1, chips: t.querySelectorAll(".chip").length, wrap: getComputedStyle(t).flexWrap, bar: getComputedStyle(t).scrollbarWidth }; }, id);
    const s = await m("cb-m"), w = await m("cb-mw");
    ok("combobox multiple: default scroll keeps the field at 40, the tag row scrolls sideways with a hidden bar and the input in view",
      s.attr === null && s.h === 40 && s.sw > s.cw && s.inView && s.wrap === "nowrap" && s.bar === "none", JSON.stringify(s));
    ok("combobox multiple: data-overflow=wrap grows the field instead of scrolling", w.attr === "wrap" && w.h > 40 && w.sw <= w.cw + 1 && w.wrap === "wrap", JSON.stringify(w));
    /* 세로 휠은 넘칠 때만 가로로 */
    await page.evaluate(() => { const t = document.getElementById("cb-m").closest(".combobox").querySelector(".control-track"); t.scrollLeft = 0; document.getElementById("cb-m").scrollIntoView({ block: "center", behavior: "instant" }); });
    await wait(150);
    const box = await page.locator("#cb-m").evaluate((i) => { const r = i.closest(".combobox").querySelector(".control").getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2 }; });
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.move(box.x, box.y); await page.mouse.wheel(0, 120); await wait(120);
    const h = await page.evaluate(() => ({ sl: Math.round(document.getElementById("cb-m").closest(".combobox").querySelector(".control-track").scrollLeft), y: scrollY }));
    ok("combobox multiple: a vertical wheel over an overflowing tag row scrolls it sideways, not the page", h.sl > 0 && h.y === y0, JSON.stringify({ h, y0 }));
    /* 더하면 입력칸이 보이게 따라간다 */
    await page.evaluate(() => { const t = document.getElementById("cb-m").closest(".combobox").querySelector(".control-track"); t.scrollLeft = 0; });
    await page.locator("#cb-m").click(); await wait(80);
    const opt = await page.evaluate(() => { const l = document.getElementById(document.getElementById("cb-m").getAttribute("aria-controls")); const o = [...l.querySelectorAll('[role=option]:not([aria-selected="true"]):not([aria-disabled="true"])')][0]; return o && o.id; });
    if (opt) { await page.click("#" + opt); await wait(80); }
    const s2 = await m("cb-m");
    ok("combobox multiple: adding a tag keeps the input in view and the height fixed", !!opt && s2.inView && s2.h === 40 && s2.chips === s.chips + 1, JSON.stringify({ opt, s2 }));
    /* 다른 크기도 높이 그대로 */
    const sizes = await page.evaluate(() => [...document.querySelectorAll(".combobox[data-multiple]:not([data-overflow])")].map((b) => { const c = b.querySelector(".control"); return [b.classList.contains("sm") || !!b.closest(".field.sm") ? "sm" : b.classList.contains("lg") || !!b.closest(".field.lg") ? "lg" : "md", Math.round(c.getBoundingClientRect().height)]; }));
    const want = { sm: 32, md: 40, lg: 48 };
    ok("combobox multiple: every scroll-mode field keeps its size height", sizes.length > 0 && sizes.every(([k, v]) => v === want[k]), JSON.stringify(sizes));
  });

  await part("5 · 표 칸 글자 14/22 — 세 밀도 · 로그 행", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const pages = ["components/data-table.html", "components/table.html", "patterns/log-viewer.html", "patterns/dashboard.html", "templates/screen/list.html"];
    const bad = []; let cells = 0, logs = 0;
    for (const f of pages) {
      await go(f); await wait(120);
      const r = await page.evaluate(() => { const out = { c: 0, logs: 0, bad: [] };
        for (const t of document.querySelectorAll("table.tbl")) { const orig = t.className;
          /* 둘레 글자가 달라도 칸이 14/22 인지 — 옛 결함은 tr.log-row 의 12px 가 칸으로 내려온 것이었다. 표와 행에 12/16 을 걸어 둔 채 잰다 */
          t.style.font = "12px/16px sans-serif"; t.querySelectorAll("tbody tr").forEach((r) => { r.style.fontSize = "12px"; r.style.lineHeight = "16px"; });
          for (const d of ["", "compact", "relaxed"]) { t.classList.remove("compact", "relaxed"); if (d) t.classList.add(d);
            for (const td of t.querySelectorAll("tbody td:not(.empty)")) { if (td.closest(".row-detail")) continue; const cs = getComputedStyle(td); out.c++; if (td.closest("tr.log-row")) out.logs++; if (cs.fontSize !== "14px" || cs.lineHeight !== "22px") out.bad.push(d + " " + cs.fontSize + "/" + cs.lineHeight + " " + td.textContent.trim().slice(0, 16)); } }
          t.className = orig; t.style.font = ""; t.querySelectorAll("tbody tr").forEach((r) => { r.style.fontSize = ""; r.style.lineHeight = ""; }); }
        return out; });
      cells += r.c; logs += r.logs; for (const x of r.bad) bad.push(f + ": " + x);
    }
    ok("table cells are 14/22 in default · compact · relaxed, log rows included, even under a 12px row", cells > 200 && logs > 30 && bad.length === 0, JSON.stringify({ cells, logs, bad: bad.slice(0, 6) }));
  });

  await part("6 · 열린 메뉴가 미리보기 안에 든다", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const cut = [];
    for (const f of ["dropdown", "select", "combobox"]) {
      await go("components/" + f + ".html"); await wait(200);
      const r = await page.evaluate(() => [...document.querySelectorAll(".example-preview")].map((pv) => { const ms = [...pv.querySelectorAll(".open .menu")].filter((x) => !x.hidden && x.getClientRects().length); if (!ms.length) return null; const pr = pv.getBoundingClientRect(); const over = Math.max(...ms.map((x) => { const r = x.getBoundingClientRect(); return Math.max(r.bottom - pr.bottom, pr.top - r.top, r.right - pr.right, pr.left - r.left); })); return [pv.closest("section").id, Math.round(over)]; }).filter(Boolean));
      for (const x of r) cut.push(x);
    }
    ok("every statically open menu fits inside its preview (dropdown · select · combobox)", cut.length >= 8 && cut.every(([, o]) => o <= 0), JSON.stringify(cut));
  });
};
