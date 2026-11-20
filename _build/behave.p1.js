/* 디자인 검토 P1 넷(2026-11-20) — behave.js 가 부른다.
   ① 헤더 검색: 다른 이름 · 영문 · React 이름으로도 찾고, 키보드로 결과를 고르며(combobox + listbox), 결과 수를 알리고, 0건이면 UI Dictionary 로 잇는다.
   ② 상단 메뉴 줄(.topnav)의 포커스 링이 overflow-x 에 잘리지 않는다(안쪽 외곽선).
   ③ 알림 센터 본문(.notify-body)의 포커스 표시를 지우지 않는다.
   ④ 사이드바 · 목차 묶음 제목이 opacity 로 흐려지지 않고 4.5 를 넘는다. */
module.exports = async function p1({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.p1", () => page);
  const typeQ = async (v) => {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("/"); await wait(80);
    await page.evaluate((v) => { const q = document.getElementById("q"); q.value = v; q.dispatchEvent(new Event("input", { bubbles: true })); }, v);
    await wait(80);
  };
  const state = () => page.evaluate(() => {
    const q = document.getElementById("q"), box = document.getElementById("searchResults"), st = document.getElementById("searchStatus");
    const opts = [...box.querySelectorAll('[role="option"]')];
    return { role: q.getAttribute("role"), exp: q.getAttribute("aria-expanded"), ctl: q.getAttribute("aria-controls"), ad: q.getAttribute("aria-activedescendant"), ph: q.placeholder,
      boxRole: box.getAttribute("role"), hidden: box.hidden, active: document.activeElement === q, status: st && st.textContent, stRole: st && st.getAttribute("role"),
      opts: opts.map((o) => ({ id: o.id, sel: o.getAttribute("aria-selected"), href: o.getAttribute("href"), t: o.textContent })),
      empty: box.querySelector(".empty") ? { t: box.querySelector(".empty").textContent, href: (box.querySelector(".empty a") || {}).getAttribute ? box.querySelector(".empty a").getAttribute("href") : null } : null };
  });

  await part("1 · 헤더 검색 — 다른 이름 · 영문 · React 이름", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("index.html");
    const hits = {};
    for (const term of ["토스트", "Toast", "모달", "Modal", "스피너", "Spinner", "배너", "날짜", "ToastProvider", "Dialog"]) {
      await typeQ(term); const s = await state();
      hits[term] = s.opts.length ? s.opts[0].t : 0;
    }
    ok("p1 search: names people use but the page title doesn't (토스트 · Toast · 모달 · Modal · 스피너 · Spinner · 배너 · 날짜 · ToastProvider · Dialog) all find a page — before, all ten found nothing",
      Object.values(hits).every((v) => v !== 0), JSON.stringify(hits));
    await typeQ("스피너"); const sp = await state();
    ok("p1 search: an exact other name ranks above a partial one (스피너 → Loading before 스피너 버튼)", sp.opts.length > 1 && /^Loading/.test(sp.opts[0].t), JSON.stringify(sp.opts.slice(0, 3).map((o) => o.t)));
    await typeQ("button"); const s = await state();
    ok("p1 search: a title prefix still ranks first (button → Button)", s.opts.length > 0 && /^Button/.test(s.opts[0].t), JSON.stringify(s.opts.slice(0, 3)));
    ok("p1 search: the field is a combobox for a listbox, the placeholder is Korean, and the result count is announced",
      s.role === "combobox" && s.ctl === "searchResults" && s.boxRole === "listbox" && s.exp === "true" && !s.hidden && /[가-힣]/.test(s.ph) &&
      s.stRole === "status" && s.status === `결과 ${s.opts.length}개`, JSON.stringify({ ...s, opts: s.opts.length }));
  });

  await part("2 · 헤더 검색 — 키보드로 고르고 Enter", async () => {
    await go("index.html");
    await typeQ("버튼"); await page.keyboard.press("ArrowDown"); await wait(50);
    const a = await state();
    await page.keyboard.press("ArrowDown"); await wait(50);
    const b = await state();
    await page.keyboard.press("ArrowUp"); await wait(50);
    const c = await state();
    ok("p1 search: ↓ ↑ move the active option (aria-activedescendant · aria-selected) while focus stays in the field",
      a.opts.length > 1 && a.active && a.ad === a.opts[0].id && a.opts[0].sel === "true" && b.ad === b.opts[1].id && b.opts[1].sel === "true" && b.opts[0].sel === "false" &&
      c.ad === c.opts[0].id && c.active, JSON.stringify({ a: a.ad, b: b.ad, c: c.ad, n: a.opts.length, active: [a.active, b.active, c.active] }));
    const want = new URL(c.opts[0].href, page.url()).href;
    await Promise.all([page.waitForNavigation({ timeout: 5000 }), page.keyboard.press("Enter")]);
    ok("p1 search: Enter opens the active option", page.url() === want, page.url() + " ≠ " + want);
    await typeQ("탭"); const t = await state(), first = new URL(t.opts[0].href, page.url()).href;
    await Promise.all([page.waitForNavigation({ timeout: 5000 }), page.keyboard.press("Enter")]);
    ok("p1 search: Enter with no active option opens the first result", !t.ad && page.url() === first, page.url() + " ≠ " + first);
  });

  await part("3 · 헤더 검색 — 0건과 닫기", async () => {
    await go("index.html");
    await typeQ("zzqqxx"); const s = await state();
    ok("p1 search: no results says so in the list and the status, and links to UI Dictionary with the query",
      s.opts.length === 0 && s.empty && /검색 결과가 없습니다/.test(s.empty.t) && /resources\/ui-dictionary\.html\?q=zzqqxx$/.test(s.empty.href || "") && s.status === "검색 결과가 없습니다",
      JSON.stringify(s));
    await typeQ("모달"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Escape"); await wait(80);
    const e = await page.evaluate(() => { const q = document.getElementById("q"); return { exp: q.getAttribute("aria-expanded"), ad: q.hasAttribute("aria-activedescendant"), pop: document.getElementById("searchPop").hidden }; });
    ok("p1 search: Esc closes it and clears aria-expanded · aria-activedescendant", e.exp === "false" && !e.ad && e.pop, JSON.stringify(e));
  });

  await part("4 · 상단 메뉴 줄 포커스 링", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/button.html");
    await page.mouse.click(5, 300); let r = null;
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    for (let i = 0; i < 20 && !r; i++) {
      await page.keyboard.press("Tab");
      r = await page.evaluate(() => { const a = document.activeElement; if (!a || !a.closest(".topnav")) return null;
        const c = getComputedStyle(a), n = a.closest(".topnav").getBoundingClientRect(), e = a.getBoundingClientRect();
        return { fv: a.matches(":focus-visible"), style: c.outlineStyle, w: parseFloat(c.outlineWidth), off: parseFloat(c.outlineOffset),
          inside: e.left >= n.left - 0.5 && e.right <= n.right + 0.5 && e.top >= n.top - 0.5 && e.bottom <= n.bottom + 0.5, ox: getComputedStyle(a.closest(".topnav")).overflowX }; });
    }
    ok("p1 focus: a Tab-focused top menu link draws its ring inside itself (offset −width or less) so the scrolling menu row cannot clip it — before, only the right edge showed",
      r && r.fv && r.style !== "none" && r.w >= 1 && r.off + r.w <= 0.01 && r.inside && r.ox === "auto", JSON.stringify(r));
  });

  await part("5 · 알림 센터 본문 포커스 표시", async () => {
    await go("components/notification-center.html");
    await page.keyboard.press("Shift");
    const r = await page.evaluate(() => { const b = [...document.querySelectorAll(".notify-body")].find((x) => x.offsetParent && x.tabIndex >= 0); if (!b) return null;
      b.focus(); const c = getComputedStyle(b), e = b.getBoundingClientRect(), p = b.parentElement.getBoundingClientRect();
      return { fv: b.matches(":focus-visible"), style: c.outlineStyle, w: parseFloat(c.outlineWidth), off: parseFloat(c.outlineOffset), color: c.outlineColor }; });
    ok("p1 focus: the Notification Center body (a Tab stop) shows a focus ring drawn inside — it used to be outline:none",
      r && r.fv && r.style !== "none" && r.w >= 1 && r.color !== "rgba(0, 0, 0, 0)" && r.off + r.w <= 0.01, JSON.stringify(r));
  });

  await part("6 · 사이드바 · 목차 묶음 제목 대비", async () => {
    const measure = () => page.evaluate(() => {
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const rgb = (s) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = "#000"; cv.fillStyle = s; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
      const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
      const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.a > 0) stack.push(c); if (c.a === 1) break; }
        return stack.reverse().reduce((acc, c) => over(c, acc), { r: 255, g: 255, b: 255, a: 1 }); };
      const L = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
      const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const probe = document.createElement("i"); probe.style.color = "var(--foreground-neutral-secondary)"; document.body.append(probe); const sec = getComputedStyle(probe).color; probe.remove();
      return [...document.querySelectorAll(".nav h5, .toc h6")].filter((h) => h.offsetParent).map((h) => { const c = getComputedStyle(h);
        let op = 1; for (let e = h; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
        const b = bgOf(h), f = rgb(c.color); f.a *= op; return { t: h.tagName + " " + h.textContent, op, isSec: c.color === sec, cr: Math.round(cr(over(f, b), b) * 100) / 100 }; });
    });
    await page.setViewportSize({ width: 1600, height: 900 });
    await go("components/button.html"); await wait(150);
    const light = await measure();
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await wait(250);
    const dark = await measure();
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await page.setViewportSize({ width: 1440, height: 900 });
    const all = light.concat(dark);
    ok("p1 contrast: sidebar group titles and the TOC title are secondary text at full opacity — 4.5 or more in light and dark (they were opacity .3: 1.95 · 2.62)",
      light.some((x) => /^H5/.test(x.t)) && light.some((x) => /^H6/.test(x.t)) && all.every((x) => x.op === 1 && x.isSec && x.cr >= 4.5),
      JSON.stringify({ light: light.map((x) => x.cr), dark: dark.map((x) => x.cr), bad: all.filter((x) => !(x.op === 1 && x.isSec && x.cr >= 4.5)).slice(0, 3) }));
  });
};
