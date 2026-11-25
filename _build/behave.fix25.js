/* 추가 수정 일곱(2026-11-25) — behave.js 가 부른다. 진행 막대 트랙(behave.dataviz) · Tag 모양(behave.nav · revise) · 속성 표 오른쪽 선(behave.revise)은 각 묶음이 잰다.
   1. 표 머리글 면 없음 — 컴포넌트 · 패턴 예제의 모든 .tbl th 가 투명. 고정 헤더 · 고정 열 머리글만 불투명한 자리 면이고 스크롤해도 행이 비치지 않음
   2. 표 hover 는 옵션 — Table 기본 예제는 hover 해도 면이 없고 Hover 예제(.tbl.hover)는 tertiary 면
   3. Toast 글자 500(동작 버튼은 600)
   4. Combobox '전체' — 고르면 끄지 않은 모든 항목 · 항목마다 칩, 값에 '전체' 없음, 칩을 지우면 체크 꺼짐, 다시 고르면 모두 풂, 검색 중 숨김(컴포넌트 예제 · 위저드 템플릿)
   5. 운영 팀 이름 = '기획실 디자인팀'(About — 원본 · 생성물 전체는 verify 가 본다) */
module.exports = async function fix25({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.fix25", () => page);

  await part("1 · 표 머리글 면 없음 · 고정 머리글은 불투명", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const bad = []; let n = 0;
    for (const p of ["components/table.html", "components/data-table.html", "components/side-panel.html", "components/card.html", "patterns/dashboard.html", "patterns/log-viewer.html", "patterns/audit-log.html", "patterns/analytics.html"]) {
      await go(p); await wait(300);
      const r = await page.evaluate(() => [...document.querySelectorAll(".example-preview .tbl th")].filter((th) => !th.closest(".tbl-wrap.sticky, .tbl-wrap.sticky-col")).map((th) => getComputedStyle(th).backgroundColor));
      n += r.length; bad.push(...r.filter((c) => c !== "rgba(0, 0, 0, 0)").map((c) => [p, c]));
    }
    await go("components/table.html"); await wait(300);
    const s = await page.evaluate(async () => {
      const out = {};
      for (const id of ["ex-table-sticky", "ex-table-sticky-col"]) {
        const w = document.querySelector(`#${id} .tbl-wrap`), th = w.querySelector("th"); w.scrollIntoView({ block: "center", behavior: "instant" });
        const probe = document.createElement("i"); probe.style.background = "var(--tbl-surface)"; w.append(probe);
        const surf = getComputedStyle(probe).backgroundColor; probe.remove();
        const bg = getComputedStyle(th).backgroundColor, img = getComputedStyle(th).backgroundImage;
        w.scrollTop = 80; w.scrollLeft = 120; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const b = th.getBoundingClientRect(), hit = document.elementFromPoint(b.left + 6, b.top + b.height / 2);
        out[id] = { hit: hit ? hit.tagName + "." + hit.className : null, bg, img: img !== "none", surf, opaque: /^rgb\(/.test(bg) || (img !== "none"), onTop: !!hit && (hit === th || th.contains(hit)) };
        w.scrollTop = 0; w.scrollLeft = 0;
      }
      return out;
    });
    const st = s["ex-table-sticky"], sc = s["ex-table-sticky-col"];
    ok("tables: every non-sticky .tbl th in component · pattern examples has no fill (transparent, 2026-11-25); sticky header th paints the opaque place surface (--tbl-surface) and stays on top while the rows scroll under it; the sticky-column header corner is opaque too",
      n >= 60 && !bad.length && st.bg === st.surf && /^rgb\(/.test(st.surf) && st.onTop && sc.opaque && sc.onTop, JSON.stringify({ n, bad: bad.slice(0, 6), s }));
  });

  await part("2 · 표 hover 는 옵션", async () => {
    await go("components/table.html"); await wait(300);
    const face = async (id) => {
      const row = page.locator(`#${id} .tbl tbody tr`).first();
      await row.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0); await wait(120);
      const rest = await row.evaluate((r) => getComputedStyle(r.querySelector("td")).backgroundColor);
      await row.hover(); await wait(200);
      return row.evaluate((r, rest) => {
        const p = document.createElement("i"); p.style.background = "var(--surface-neutral-tertiary)"; r.closest(".example-preview").append(p);
        const want = getComputedStyle(p).backgroundColor; p.remove();
        return { rest, hover: getComputedStyle(r.querySelector("td")).backgroundColor, want, hasClass: r.closest(".tbl").classList.contains("hover") };
      }, rest);
    };
    const d = await face("ex-table-default"), h = await face("ex-table-hover");
    await page.mouse.move(0, 0);
    ok("table hover is an option: the default Table example keeps no face on hover; the Hover example (.tbl.hover) paints --surface-neutral-tertiary on the hovered row",
      !d.hasClass && d.hover === d.rest && h.hasClass && h.hover === h.want && h.hover !== h.rest, JSON.stringify({ d, h }));
  });

  await part("3 · Toast 500", async () => {
    await go("components/notification.html"); await wait(300);
    const r = await page.evaluate(() => [...document.querySelectorAll(".example-preview .toast")].map((t) => {
      const msg = [...t.childNodes].find((c) => c.nodeType === 1 && !c.matches(".ico, button, .btn, .x")) || t;
      const btn = t.querySelector(".btn"); return { t: getComputedStyle(t).fontWeight, msg: getComputedStyle(msg).fontWeight, btn: btn ? getComputedStyle(btn).fontWeight : null };
    }));
    ok("toast: message text is weight 500 (2026-11-25); an action button inside stays 600", r.length >= 2 && r.every((x) => x.t === "500" && x.msg === "500" && (x.btn === null || x.btn === "600")), JSON.stringify(r));
  });

  /* 열린 Combobox 의 상태 — 칩 글자 · 숨은 값 · '전체' 체크 · 끄지 않은 항목 수 */
  const cbState = (sel) => page.evaluate((sel) => {
    const h = document.querySelector(sel), a = h.querySelector(".menu-item[data-all]");
    const items = [...h.querySelectorAll(".menu-item:not([data-all])")], en = items.filter((i) => i.getAttribute("aria-disabled") !== "true");
    return {
      first: h.querySelector(".menu > li") === a, allSel: a && a.getAttribute("aria-selected"), allOn: a && a.classList.contains("on"), allHidden: a && (a.hidden || !a.offsetParent),
      chips: [...h.querySelectorAll(".chip .lbl")].map((x) => x.textContent.trim()),
      hidden: [...h.querySelectorAll("input[type=hidden]")].map((x) => x.value),
      on: items.filter((i) => i.classList.contains("on")).map((i) => i.textContent.trim()), enabled: en.length,
    };
  }, sel);

  await part("4 · Combobox 전체 — 컴포넌트 예제", async () => {
    await go("components/combobox.html"); await wait(300);
    const H = "#ex-combobox-all .combobox";
    const events = await page.evaluate((H) => { const h = document.querySelector(H); window.__cbAll = []; h.addEventListener("ds:select", (e) => window.__cbAll.push(e.detail.value)); return true; }, H);
    const inp = page.locator(`${H} input[role=combobox]`);
    await inp.scrollIntoViewIfNeeded(); await inp.click(); await wait(150);
    const s0 = await cbState(H);
    await page.locator(`${H} .menu-item[data-all]`).click(); await wait(150);
    const s1 = await cbState(H), ev1 = await page.evaluate(() => window.__cbAll.at(-1));
    const live1 = await page.locator(`${H} [role=status], ${H} [aria-live]`).first().textContent().catch(() => "");
    await page.locator(`${H} .chip .x`).first().click(); await wait(150);
    const s2 = await cbState(H);
    await inp.click(); await wait(100);
    await page.locator(`${H} .menu-item[data-all]`).click(); await wait(100);   // 다시 모두
    await page.locator(`${H} .menu-item[data-all]`).click(); await wait(150);   // 모두 풂
    const s3 = await cbState(H);
    await inp.fill("보"); await wait(150);
    const s4 = await cbState(H);
    await inp.fill(""); await wait(150);
    const s5 = await cbState(H);
    await page.keyboard.press("Escape");
    ok("combobox 'All' option: first option in the list; picking it selects every enabled option with one chip each and turns its check on; the value / hidden inputs / ds:select carry no '전체'",
      s0.first && s0.allSel === "false" && s1.chips.length === s1.enabled && s1.on.length === s1.enabled && s1.allSel === "true" && s1.allOn && !s1.chips.includes("전체") && !s1.hidden.includes("전체") && Array.isArray(ev1) && ev1.length === s1.enabled && !ev1.includes("전체") && /전체 선택됨/.test(live1 || ""),
      JSON.stringify({ s0, s1, ev1, live1 }));
    ok("combobox 'All' option: removing one chip turns its check off; picking it again with everything selected clears all; it hides while a search term is typed and comes back when cleared",
      s2.allSel === "false" && s2.chips.length === s1.enabled - 1 && s3.chips.length === 0 && s3.allSel === "false" && s4.allHidden && !s5.allHidden, JSON.stringify({ s2, s3, s4: { allHidden: s4.allHidden }, s5: { allHidden: s5.allHidden } }));
  });

  await part("5 · Combobox 전체 — 위저드 템플릿", async () => {
    await go("templates/screen/wizard.html"); await wait(400);
    const r = await page.evaluate(() => {
      const h = document.querySelector("#wz-groups-list").closest(".combobox"), a = h.querySelector(".menu-item[data-all]");
      const plain = [...h.querySelectorAll(".menu-item:not([data-all])")].map((i) => i.textContent.trim());
      a.click();
      const chips = [...h.querySelectorAll(".chip .lbl")].map((x) => x.textContent.trim());
      const out = { first: h.querySelector(".menu > li") === a, multi: h.hasAttribute("data-multiple"), plainHasAll: plain.includes("전체"), n: plain.length, chips, allSel: a.getAttribute("aria-selected") };
      a.click(); out.after = h.querySelectorAll(".chip .lbl").length; return out;
    });
    ok("wizard template: the deploy-group Combobox uses the 'All' option (first, not a plain item named 전체); picking it adds a chip per group, picking again clears them",
      r.first && r.multi && !r.plainHasAll && r.chips.length === r.n && r.allSel === "true" && r.after === 0, JSON.stringify(r));
  });

  await part("6 · 운영 팀 이름", async () => {
    await go("home/about.html"); await wait(300);
    const r = await page.evaluate(() => ({ team: (document.querySelector("#team") && document.querySelector("#team").nextElementSibling.textContent) || "", any: document.body.textContent.includes("디자인" + "파트") }));
    ok("team name: About › 운영 says '기획실 디자인팀' with the right particle; the old part name is gone from the page (2026-11-25)",
      /^기획실 디자인팀이 운영하며/.test(r.team.trim()) && !r.any, JSON.stringify(r));
  });
};
