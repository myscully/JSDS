/* VectorLab UI/UX Skills 대조로 고친 것(2026-11-23) — behave.js 가 부른다.
   1 · 2. 오버레이 입력 보호 — 모달 Side Panel 배경도 Popup 과 같은 판정, 편집한 오버레이를 Esc · X · 취소로 닫으면 안에서 버릴지 묻는다(1 Side Panel · 2 Popup)
   3. 폼 초안 — form[data-draft] 는 0.5초 뒤 남기고, 다시 열면 되살려 맨 위에 알리고, 통과한 제출에 지운다
   4. 누르는 영역 24 이상 · 이웃을 덮지 않음 · Pagination 이전/다음 32 · 아이콘 전용 버튼 Tooltip
   5. 패턴 보강 — 검색 빈 결과는 표 틀 그대로, 목록의 만들기는 Page Header · 정렬 열 · Pagination, 다시 불러오기는 지난 행을 흐리게, 좁은 화면의 빈 상태 문구는 표 안에서 줄바꿈 */
module.exports = async function ux({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.ux", () => page);

  await part("1 · 모달 Side Panel — 배경 · Esc · 취소 · 버리기", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/side-panel.html"); await wait(300);
    /* 문서 예제에는 입력칸이 없다 — 하나 넣어 잰다 */
    await page.evaluate(() => { const b = document.querySelector("#sp-modal .side-panel-body"); b.insertAdjacentHTML("afterbegin", '<div class="field"><label for="ux-why">사유</label><input id="ux-why"></div>'); window.__closed = 0; document.addEventListener("ds:panel-close", () => { window.__closed++; }); });
    const opener = page.locator('[data-panel-open="#sp-modal"]');
    const isOpen = () => page.evaluate(() => { const p = document.getElementById("sp-modal"); return p.classList.contains("fixed") && !p.hidden; });
    const dim = async () => { await page.mouse.click(40, 450); await wait(60); };
    await opener.click(); await wait(200); await dim();
    ok("modal panel: untouched closes on backdrop click", !(await isOpen()));
    await opener.click(); await wait(200);
    await page.locator("#ux-why").fill("a"); await page.locator("#ux-why").focus(); await dim();
    ok("modal panel: with input in progress the backdrop does not close it", await isOpen());
    await page.keyboard.press("Escape"); await wait(40);
    const c1 = await page.evaluate(() => { const n = document.querySelector("#sp-modal > .discard-confirm"); return n && { role: n.getAttribute("role"), cls: n.className, next: n.nextElementSibling && n.nextElementSibling.className, focus: document.activeElement.textContent, title: n.querySelector("b").textContent, btns: [...n.querySelectorAll("button")].map((b) => b.className + "|" + b.textContent), open: !document.getElementById("sp-modal").hidden }; });
    ok("modal panel: Esc after typing shows a danger alert just above the footer with 계속 편집 focused",
      !!c1 && c1.role === "alert" && /notice danger discard-confirm/.test(c1.cls) && c1.next === "side-panel-footer" && c1.focus === "계속 편집" && c1.title === "변경 사항을 버릴까요?" && c1.btns.join() === "btn sm outline assistive|계속 편집,btn sm outline assistive|버리기" && c1.open, JSON.stringify(c1));
    await page.keyboard.press("Escape"); await wait(40);
    const c2 = await page.evaluate(() => ({ left: !!document.querySelector("#sp-modal > .discard-confirm"), focus: document.activeElement.id, open: !document.getElementById("sp-modal").hidden }));
    ok("modal panel: a second Esc only dismisses the confirm and returns focus to the field", !c2.left && c2.focus === "ux-why" && c2.open, JSON.stringify(c2));
    await page.locator('#sp-modal .side-panel-footer [data-panel-close]:not(.primary)').click(); await wait(40);
    ok("modal panel: 취소 asks too", await page.evaluate(() => !!document.querySelector("#sp-modal > .discard-confirm")) && await isOpen());
    await page.locator('#sp-modal [data-discard="drop"]').click(); await wait(200);
    const c3 = await page.evaluate(() => ({ closed: window.__closed, focus: document.activeElement.getAttribute("data-panel-open") }));
    ok("modal panel: 버리기 closes, fires ds:panel-close and returns focus to the opener", !(await isOpen()) && c3.closed === 2 && c3.focus === "#sp-modal", JSON.stringify(c3));
    await opener.click(); await wait(200);
    const c4 = await page.evaluate(() => ({ dirty: document.getElementById("sp-modal").dataset.dsDirty || "", confirm: !!document.querySelector("#sp-modal > .discard-confirm") }));
    await dim();
    ok("modal panel: reopening starts clean (no dirty flag, no confirm)", !c4.dirty && !c4.confirm && !(await isOpen()), JSON.stringify(c4));
    await opener.click(); await wait(200);
    await page.locator("#ux-why").fill("b");
    await page.locator("#sp-modal .side-panel-footer .primary[data-panel-close]").click(); await wait(200);
    ok("modal panel: a primary button with data-panel-close closes without asking (save then close)", !(await isOpen()));
    await opener.click(); await wait(200);
    await page.evaluate(() => document.getElementById("sp-modal").setAttribute("data-confirm-discard", "false"));
    await page.locator("#ux-why").fill("c"); await page.keyboard.press("Escape"); await wait(200);
    ok("modal panel: data-confirm-discard=false closes on Esc without asking", !(await isOpen()));
    await page.evaluate(() => document.getElementById("sp-modal").removeAttribute("data-confirm-discard"));
  });

  await part("2 · Popup — Esc · X · 취소 확인, 위험 확인 · 코드 닫기는 묻지 않음", async () => {
    await go("patterns/secrets.html"); await wait(300);
    const isOpen = () => page.evaluate(() => !!document.querySelector(".popup-backdrop[data-ds-popup]"));
    const conf = () => page.evaluate(() => { const n = document.querySelector(".popup-backdrop[data-ds-popup] .popup > .discard-confirm"); return n && { next: n.nextElementSibling && n.nextElementSibling.className, focus: document.activeElement.textContent }; });
    await page.locator('[data-popup-open="#sec-create"]').first().click(); await wait(200);
    await page.keyboard.press("Escape"); await wait(200);
    ok("popup: untouched closes on Esc right away", !(await isOpen()));
    await page.locator('[data-popup-open="#sec-create"]').first().click(); await wait(200);
    await page.locator("#sec-name").fill("SIEM");
    await page.keyboard.press("Escape"); await wait(40);
    const a = await conf();
    ok("popup: Esc after typing shows the confirm above the action row with 계속 편집 focused", !!a && a.next === "popup-actions" && a.focus === "계속 편집" && await isOpen(), JSON.stringify(a));
    await page.locator(".popup-backdrop[data-ds-popup] .popup-close").click(); await wait(40);
    ok("popup: X while the confirm shows works as 계속 편집", !(await conf()) && await isOpen());
    await page.locator(".popup-backdrop[data-ds-popup] .popup-close").click(); await wait(40);
    ok("popup: X after typing asks", !!(await conf()));
    await page.locator('.popup-backdrop[data-ds-popup] [data-discard="drop"]').click(); await wait(200);
    ok("popup: 버리기 closes it", !(await isOpen()));
    await page.locator('[data-popup-open="#sec-create"]').first().click(); await wait(200);
    await page.locator("#sec-name").fill("x");
    await page.evaluate(() => window.DS.popup.close()); await wait(200);
    ok("popup: DS.popup.close() from code closes without asking (after save)", !(await isOpen()));
    await go("components/popup.html"); await wait(300);
    await page.evaluate(() => { const p = document.querySelector(".example-preview .popup.danger"); p.id = "ux-dg"; window.DS.popup.open("#ux-dg"); });
    await page.locator(".popup-backdrop[data-ds-popup] #confirm").fill("삭"); await page.keyboard.press("Escape"); await wait(200);
    ok("popup: a danger confirm (alertdialog) never asks — Esc closes it", !(await isOpen()));
  });
  await part("3 · 폼 초안 — 저장 · 되살림 · 버리기 · 제출", async () => {
    const KEY = "jsds-draft:alert-rule-new", KEY2 = "jsds-draft:policy-new";
    const F = 'form[data-draft="alert-rule-new"]';
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await go("patterns/alert-rules.html"); await wait(300);
      await page.evaluate(([k, k2]) => { localStorage.removeItem(k); localStorage.removeItem(k2); }, [KEY, KEY2]);
      await page.evaluate((f) => { document.querySelector(f + " #ar-name").closest(".field").insertAdjacentHTML("afterend", '<div class="field"><label for="ux-pw">비밀번호</label><input id="ux-pw" type="password"></div>'); }, F);
      await page.locator("#ux-pw").fill("secret");
      await page.locator("#ar-name").fill("새 규칙");
      await wait(300);
      const early = await page.evaluate((k) => localStorage.getItem(k), KEY);
      await page.waitForFunction((k) => !!localStorage.getItem(k), KEY, { timeout: 5000 }).catch(() => {});   // 0.5초 저장 타이머 — 부하에서 늦게 돈다
      const d = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);
      ok("draft: saved only after the 0.5s pause — the typed value, never the password",
        early === null && !!d && d.f["ar-name"] === "새 규칙" && d.f["ar-count"] === "5" && !("ux-pw" in d.f) && !("ar-sev" in d.f), JSON.stringify({ early, d }));

      await go("patterns/alert-rules.html"); await wait(300);
      const r = await page.evaluate((f) => { const form = document.querySelector(f), n = form.querySelector(":scope > .draft-notice"); return { name: document.getElementById("ar-name").value, first: form.firstElementChild === n, cls: n && n.className, role: n && n.getAttribute("role"), text: n && n.querySelector("div > span").textContent, btn: n && n.querySelector("button").className + "|" + n.querySelector("button").textContent, others: document.querySelectorAll(".draft-notice").length }; }, F);
      ok("draft: reopening restores the field and shows an info notice as the form's first child",
        r.name === "새 규칙" && r.first && /notice info draft-notice/.test(r.cls) && r.role === "status" && r.text === "저장하지 않은 입력을 되살렸습니다." && r.btn === "btn sm outline assistive|버리기" && r.others === 1, JSON.stringify(r));

      await page.locator(F + " .draft-notice [data-draft-discard]").click(); await wait(60);
      const x = await page.evaluate(([f, k]) => ({ name: document.getElementById("ar-name").value, store: localStorage.getItem(k), notice: !!document.querySelector(f + " .draft-notice"), focus: document.activeElement.id }), [F, KEY]);
      ok("draft: 버리기 puts the defaults back, removes the draft and notice, and focuses the first field",
        x.name === "랜섬웨어 연속 탐지" && x.store === null && !x.notice && x.focus === "ar-name", JSON.stringify(x));
      await wait(600);
      ok("draft: discarding does not write a new draft", await page.evaluate((k) => localStorage.getItem(k), KEY) === null);

      await page.locator("#ar-name").fill("");
      await page.locator(F + ' button[type="submit"]').click();   // 친 바로 뒤에 눌러도
      await page.waitForFunction((k) => /"ar-name":""/.test(localStorage.getItem(k) || ""), KEY, { timeout: 5000 }).catch(() => {});
      const b = await page.evaluate(([f, k]) => ({ invalid: document.getElementById("ar-name").getAttribute("aria-invalid"), store: JSON.parse(localStorage.getItem(k) || "null") }), [F, KEY]);
      ok("draft: a submit the validation blocks keeps the draft, including the value typed just before", b.invalid === "true" && !!b.store && b.store.f["ar-name"] === "", JSON.stringify(b));
      await page.locator("#ar-name").fill("통과 규칙");
      await page.locator(F + ' button[type="submit"]').click(); await wait(80);
      await wait(600);
      const s2 = await page.evaluate(([f, k]) => ({ store: localStorage.getItem(k), invalid: !!document.querySelector(f + ' [aria-invalid="true"]') }), [F, KEY]);
      ok("draft: a submit that passes removes the draft (and the pending save does not bring it back)", s2.store === null && !s2.invalid, JSON.stringify(s2));

      await go("patterns/input-form.html"); await wait(300);
      await page.locator('form[data-draft="policy-new"] input[name="fa"]').nth(1).check();
      await page.waitForFunction(() => /"radio:fa":1/.test(localStorage.getItem("jsds-draft:policy-new") || ""), null, { timeout: 5000 }).catch(() => {});   // 0.5초 저장 타이머 — 부하에서 늦게 돈다
      await go("patterns/input-form.html"); await wait(300);
      const rd = await page.evaluate(() => { const r = [...document.querySelectorAll('form[data-draft="policy-new"] input[name="fa"]')]; return { checked: r.map((x) => x.checked), notice: !!document.querySelector('form[data-draft="policy-new"] > .draft-notice') }; });
      const r3 = await page.evaluate(() => {
        document.querySelector("main").insertAdjacentHTML("beforeend", '<div id="ux-rbox"><form data-draft="ux-r"><input type="radio" name="r" id="ux-r0" checked><input type="radio" name="r" id="ux-r1"><input type="radio" name="r" id="ux-r2"></form></div>');
        localStorage.setItem("jsds-draft:ux-r", JSON.stringify({ v: 1, f: { "radio:r": 1 } }));
        DS.init(document.getElementById("ux-rbox"));
        const out = [0, 1, 2].map((i) => document.getElementById("ux-r" + i).checked).join();
        localStorage.removeItem("jsds-draft:ux-r"); document.getElementById("ux-rbox").remove();
        return out;
      });
      ok("draft: a radio choice comes back by its place in the group", rd.checked.join() === "false,true" && rd.notice && r3 === "false,true,false", JSON.stringify({ rd, r3 }));

      const ud = await page.evaluate(() => [...document.querySelectorAll("form[data-draft]")].map((f) => f.closest(".example-preview, main") && f.closest("main") ? f.getAttribute("data-draft") : "").filter(Boolean));
      ok("draft: only the two documented forms carry data-draft on these pages", ud.join() === "policy-new", JSON.stringify(ud));
    } finally {
      await page.evaluate(([k, k2]) => { try { localStorage.removeItem(k); localStorage.removeItem(k2); } catch (e) {} }, [KEY, KEY2]);
    }
  });

  await part("4 · 누르는 영역 · Pagination · 아이콘 버튼 Tooltip", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const HIT = ".chip .x, .searchbar .clear, .notice .close, .toast .close, .banner .close, .tbl th.sortable .sort, .tbl .check .checkbox";
    const measure = () => page.evaluate((HIT) => {
      document.documentElement.style.scrollBehavior = "auto";
      const own = (el, t) => t && (el === t || el.contains(t) || (el.labels && [...el.labels].some((l) => l === t || (l.contains(t) && !t.closest("a,button")))));
      const small = [], cover = [];
      for (const h of document.querySelectorAll(".example-preview :is(" + HIT + ")")) {
        if (h.closest("[hidden],[inert]") || !h.getBoundingClientRect().width) continue;
        h.scrollIntoView({ block: "center", behavior: "instant" });
        const r = h.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        /* 체크박스는 라벨이 누르는 대상이다 — 라벨 안의 입력도 같은 것으로 센다 */
        const el = h.matches(".checkbox") ? h.querySelector("input") : h;
        let miss = 0;
        for (const dx of [-11, 0, 11]) for (const dy of [-11, 0, 11]) { const t = document.elementFromPoint(cx + dx, cy + dy); if (!(own(el, t) || (t && h.contains(t)))) miss++; }
        if (miss) small.push((h.getAttribute("aria-label") || h.className) + " miss " + miss + "/9");
      }
      const sel = "button, a[href], input, select, textarea, [role=button], [role=tab], [role=option], summary";
      for (const el of document.querySelectorAll(".example-preview :is(" + sel + ")")) {
        if (el.closest("[hidden],[inert],.tooltip") || !el.getBoundingClientRect().width) continue;
        el.scrollIntoView({ block: "center", behavior: "instant" });
        const r = el.getBoundingClientRect();
        for (const [x, y] of [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]]) {
          const t = document.elementFromPoint(x, y), h = t && t.closest(HIT);
          if (h && h !== el && !h.contains(el) && !el.contains(h) && !(el.labels && [...el.labels].includes(h))) { cover.push((el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 20) + " ← " + h.className); break; }
        }
      }
      return { n: document.querySelectorAll(".example-preview :is(" + HIT + ")").length, small, cover };
    }, HIT);
    const res = {};
    for (const f of ["components/chip.html", "components/combobox.html", "components/notification.html", "components/data-table.html", "patterns/search.html"]) {
      await go(f); await wait(150);
      /* 검색 지우기는 값이 있을 때만 보인다 */
      await page.evaluate(() => { for (const i of document.querySelectorAll(".example-preview .searchbar input")) { if (!i.value) { i.value = "agent"; i.dispatchEvent(new Event("input", { bubbles: true })); } } });
      await wait(60);
      res[f] = await measure();
    }
    const all = Object.values(res);
    ok("hit area: chip x · clear · close · sort · row checkbox take the whole 24×24 around their centre", all.every((r) => r.n > 0 && !r.small.length), JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, [v.n, v.small.slice(0, 3)]]))));
    ok("hit area: the enlarged areas never cover a neighbouring control's centre or corners", all.every((r) => !r.cover.length), JSON.stringify(all.flatMap((r) => r.cover).slice(0, 5)));

    await go("components/pagination.html"); await wait(150);
    const pg = await page.evaluate(() => [...document.querySelectorAll(".example-preview .pagination button[aria-label]")].filter((b) => b.querySelector("svg") && !b.textContent.trim()).map((b) => (b.closest(".pagination").classList.contains("compact") ? "c" : "d") + Math.round(b.getBoundingClientRect().width) + "x" + Math.round(b.getBoundingClientRect().height)));
    ok("pagination: previous · next are square — compact 32, default 36", pg.length > 0 && pg.every((x) => x === "c32x32" || x === "d36x36") && pg.includes("c32x32"), pg.join());

    await go("components/button.html"); await wait(150);
    const add = page.locator('#ex-button-icon-only .example-preview button[aria-label="추가"]');
    await add.focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(250);
    const tip = await page.evaluate(() => { const b = document.activeElement, t = b.closest(".tooltip-wrap") && b.closest(".tooltip-wrap").querySelector(".tooltip"); return t && { text: t.textContent, op: getComputedStyle(t).opacity, desc: b.getAttribute("aria-describedby"), hidden: t.getAttribute("aria-hidden") }; });
    ok("icon-only button: keyboard focus shows its Tooltip right away, text = name, not read twice", !!tip && tip.text === "추가" && tip.op === "1" && tip.desc === null && tip.hidden === null, JSON.stringify(tip));

    const wrapped = [];
    for (const f of ["dropdown", "list", "data-table", "indicator"]) {
      await go("components/" + f + ".html"); await wait(80);
      wrapped.push(...await page.evaluate((f) => [...document.querySelectorAll(".example-preview .btn.icon-only:not([disabled]):not(.popup-close,.side-panel-close,.copy,.remove,.retry)")].filter((b) => !b.parentElement.matches(".tooltip-wrap")).map((b) => f + ":" + b.getAttribute("aria-label")), f));
    }
    ok("icon-only button: dropdown · list · data-table · indicator examples wrap every enabled icon-only button", !wrapped.length, wrapped.join());

    await go("components/data-table.html"); await wait(150);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.querySelector("#ex-data-table-row-actions").scrollIntoView({ block: "center", behavior: "instant" }); }); await wait(80);
    const tr = page.locator("#ex-data-table-row-actions .example-preview tbody tr").first();
    await tr.locator(".dropdown .btn.icon-only").click(); await wait(120);
    const menu = await page.evaluate(() => { const d = document.querySelector("#ex-data-table-row-actions .example-preview tbody tr .dropdown"); const rows = [...document.querySelectorAll("#ex-data-table-row-actions .example-preview tbody tr")].map((r) => Math.round(r.getBoundingClientRect().height)); return { open: d.classList.contains("open"), expanded: d.querySelector("[aria-haspopup]").getAttribute("aria-expanded"), rows: [...new Set(rows)] }; });
    await page.keyboard.press("Escape");
    ok("row action: a Tooltip-wrapped ⋯ trigger still opens its menu and rows keep the density height", menu.open && menu.expanded === "true" && menu.rows.length === 1 && menu.rows[0] <= 48, JSON.stringify(menu));
  });

  await part("5 · 패턴 보강 — 빈 결과 틀 · 목록의 Page Header · 정렬 · Pagination · 다시 불러오기 흐림", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("patterns/search.html"); await wait(200);
    const em = await page.evaluate(() => { const ex = document.querySelector("#ex-search-empty .example-preview"); const td = ex.querySelector("tbody td.empty"); return { search: !!ex.querySelector(".toolbar .searchbar"), filters: ex.querySelectorAll(".toolbar .combobox, .toolbar .datepicker").length, heads: ex.querySelectorAll("thead th").length, colspan: td && td.colSpan, sorted: !!ex.querySelector("th[aria-sort]"), reset: td ? [...td.querySelectorAll("button")].map((b) => b.textContent.trim()) : [] }; });
    ok("search empty: toolbar (search · severity · period) and the table frame stay, the reason and 필터 초기화 sit in the body", em.search && em.filters === 2 && em.heads === 5 && em.colspan === 5 && em.sorted && em.reset.join() === "필터 초기화", JSON.stringify(em));
    /* 좁은 화면 — 빈 상태 문구가 표를 넓혀 가로 스크롤 뒤로 잘리지 않는다(.tbl.nowrap 안에서도 줄바꿈) */
    await page.setViewportSize({ width: 390, height: 900 });
    const narrow = [];
    for (const u of ["patterns/search.html", "patterns/audit-log.html", "patterns/incident.html", "patterns/log-viewer.html", "components/data-table.html"]) {
      await go(u); await wait(150);
      narrow.push(...await page.evaluate((u) => [...document.querySelectorAll(".example-preview td.empty")].filter((td) => td.getClientRects().length).map((td) => {
        const w = td.closest(".tbl-wrap"), t = td.closest("table"); const wr = w ? w.getBoundingClientRect() : t.getBoundingClientRect();
        const rg = document.createRange(); rg.selectNodeContents(td); const tr = rg.getBoundingClientRect();
        return { u: u.split("/")[1], wide: Math.round(t.getBoundingClientRect().width - wr.width), out: Math.round(tr.right - wr.right) };
      }), u));
    }
    const badN = narrow.filter((r) => r.wide > 1 || r.out > 1);
    ok("narrow: an empty-state message wraps inside its table — the table is not widened past its scroll frame", narrow.length >= 4 && badN.length === 0, JSON.stringify({ n: narrow.length, bad: badN }));
    await page.setViewportSize({ width: 1440, height: 900 });

    const lists = [["roles", "list", "역할 만들기", false], ["secrets", "keys", "API 키 만들기", false], ["report-schedule", "list", "보고서 만들기", true], ["audit-log", "list", null, true]];
    const bad = [];
    for (const [k, ex, create, pager] of lists) {
      await go("patterns/" + k + ".html"); await wait(120);
      const r = await page.evaluate(([k, ex]) => { const p = document.querySelector("#ex-" + k + "-" + ex + " .example-preview"); const head = p.querySelector(".page-head"); return { create: head ? [...head.querySelectorAll(".actions .btn.solid.primary")].map((b) => b.textContent.trim()) : [], toolbarCreate: [...p.querySelectorAll(".toolbar .btn.solid.primary")].length, sort: [...p.querySelectorAll("th[aria-sort]")].map((t) => t.getAttribute("aria-sort") + ":" + !!t.querySelector("button.sort")), pager: !!p.querySelector(".tbl-wrap ~ .pagination-bar nav.pagination[aria-label]") }; }, [k, ex]);
      const good = (create ? r.create.join() === create && !r.toolbarCreate : !r.create.length) && r.sort.length === 1 && r.sort[0].endsWith(":true") && r.pager === pager;
      if (!good) bad.push(k + " " + JSON.stringify(r));
    }
    ok("lists: create lives in the Page Header (not a toolbar), one sorted column with a sort button, pagination under longer lists", !bad.length, bad.join(" | "));

    await go("components/data-table.html"); await wait(150);
    const dim = await page.evaluate(async () => { const w = document.querySelector("#ex-data-table-basic .tbl-wrap"); const b = w.querySelector("tbody"); const h0 = w.getBoundingClientRect().height; const before = getComputedStyle(b).opacity; w.setAttribute("aria-busy", "true"); await new Promise((r) => setTimeout(r, 400)); const r = { before, busy: getComputedStyle(b).opacity, head: getComputedStyle(w.querySelector("thead")).opacity, rows: w.querySelectorAll("tbody tr").length, same: Math.abs(w.getBoundingClientRect().height - h0) < 0.5 }; w.removeAttribute("aria-busy"); return r; });
    ok("refetch: .tbl-wrap[aria-busy] keeps the rows and dims only the body to .5 — the frame does not move", dim.before === "1" && dim.busy === "0.5" && dim.head === "1" && dim.rows > 0 && dim.same, JSON.stringify(dim));
  });

};
