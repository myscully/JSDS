/* Home › Guide(2026-11-20 사람의 요청) — behave.js 가 부른다.
   여섯 페이지 · 사이드바 Guide 묶음 · Getting started 의 탭 이름과 Guide 링크, 자유 이동 Steps 마법사(다음 · 이전 · 단계 누름 · 완료 · 패널 포커스),
   진행 저장(jsds-guide — 다시 읽어도 마지막 단계 · 개요의 'n / N 완료'), 트랙 초기화 · 모두 지우기, 저장이 막힌 브라우저에서도 동작,
   개발자 단계의 React / HTML 탭 전환과 복사, 1440 · 1024 · 768 · 390 라이트 · 다크에서 넘침 없음 */
const path = require("path");
module.exports = async function guide({ page, ok, go }) {
  const { SITE } = require("./data.js");
  const GUIDE = require("./guide.data.js");
  const KEYS = GUIDE.order;
  const part = require("./behave.part")(ok, "behave.guide", () => page);
  const wait = (ms) => page.waitForTimeout(ms);
  const store = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem("jsds-guide") || "{}"); } catch (e) { return "throws"; } });
  const clear = () => page.evaluate(() => localStorage.removeItem("jsds-guide"));
  /* 마법사 상태 — 보이는 패널 자리 · 단계 클래스 · 포커스가 그 패널 안인지 · 진행 글자 · 완료 안내 · 초기화 버튼 */
  const state = () => page.evaluate(() => {
    const sp = document.querySelector(".guide-stepper"), li = [...sp.querySelectorAll(":scope > .steps > li")];
    const panels = [...sp.querySelectorAll(":scope > .step-panel")], vis = panels.findIndex((p) => !p.hidden);
    const a = document.activeElement;
    return {
      vis, n: li.length, cls: li.map((x) => (x.classList.contains("done") ? "d" : "") + (x.classList.contains("on") ? "o" : "")).join(","),
      focus: vis >= 0 && panels[vis].contains(a), prog: document.querySelector("[data-guide-prog]").textContent.trim(),
      done: !document.querySelector(".guide-done").hidden, reset: !document.querySelector("[data-guide-reset]").hidden,
      prev: (sp.querySelector('[data-step="prev"]') || {}).disabled, nextLabel: (sp.querySelector('[data-step="next"]:not([hidden])') || sp.querySelector('[data-step="finish"]:not([hidden])') || {}).textContent,
    };
  });
  const click = async (sel) => { await page.click(sel); await wait(120); };

  await part("1 · 여섯 페이지 · 사이드바 Guide 묶음 · 개요 행 다섯 · 트랙 단계 수 · Getting started 탭 이름과 Guide 링크", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("home/guide.html");
    const s = await page.evaluate(() => {
      const h5 = [...document.querySelectorAll("#nav h5, nav h5")].find((x) => x.textContent.trim() === "Guide");
      const links = []; for (let n = h5 && h5.nextElementSibling; n && n.tagName === "A"; n = n.nextElementSibling) links.push([n.textContent.replace(/N(, 새 항목)?$/, "").trim(), n.getAttribute("href")]);
      return { links, rows: [...document.querySelectorAll(".guide-tracks a")].map((a) => [a.querySelector("b").textContent.replace(/N(, 새 항목)?$/, "").trim(), a.getAttribute("href"), a.querySelector("[data-guide-prog]").textContent.trim()]), path: document.querySelectorAll(".guide-path > li").length };
    });
    const want = SITE.home.groups.find((g) => g[0] === "Guide")[1];
    ok("guide: sidebar has the Guide group with its six pages in order",
      s.links.map((l) => l[0]).join() === want.map((w) => w[1]).join() && s.links.map((l) => l[1]).join() === want.map(([k]) => `../home/${k}.html`).join(), JSON.stringify(s.links));
    ok("guide: overview lists the five tracks with step counts and a three-step path",
      s.rows.map((r) => r[0]).join() === KEYS.map((k) => GUIDE.tracks[k].title).join() && s.rows.every((r, i) => r[1] === `../home/guide-${KEYS[i]}.html` && /단계$|완료$/.test(r[2])) && s.path === 3, JSON.stringify(s));
    const bad = [];
    for (const k of KEYS) {
      await go(`home/guide-${k}.html`);
      const m = await page.evaluate(() => { const sp = document.querySelector(".guide-stepper"); return { li: sp.querySelectorAll(":scope > .steps > li").length, panels: sp.querySelectorAll(":scope > .step-panel").length, labelBelow: sp.querySelector(".steps").classList.contains("label-below"), nonlinear: sp.hasAttribute("data-nonlinear"), roles: [...document.querySelectorAll(".guide-panel")].map((p) => p.querySelectorAll(".guide-roles .tag").length) }; });
      const n = GUIDE.tracks[k].steps.length;
      if (m.li !== n || m.panels !== n || !m.labelBelow || !m.nonlinear || (k === "together" ? m.roles.some((r) => r < 1) : m.roles.some((r) => r > 0))) bad.push(`${k} ${JSON.stringify(m)}`);
    }
    ok("guide: each track page is a non-linear label-below wizard with one panel per step, role tags only in together", bad.length === 0, bad.join(" | "));
    await go("home/getting-started.html");
    const g = await page.evaluate(() => ({ tabs: [...document.querySelectorAll("#content .doc-tabs [data-doctab]")].map((b) => b.textContent.trim()), link: !!document.querySelector('#content .lead a[href$="home/guide.html"], #content p a[href$="home/guide.html"]') }));
    ok("guide: getting started keeps install tabs (designer · React · HTML) and links to Guide", g.tabs.join() === "디자이너,React 개발자,HTML+CSS 개발자" && g.link, JSON.stringify(g));
  });

  await part("2 · 다음 · 이전 · 단계 누름 — 떠나는 단계가 완료, 새 패널로 포커스, 진행이 저장됨", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("home/guide-basics.html"); await clear(); await page.reload(); await wait(150);
    const s0 = await state();
    await click('.guide-stepper [data-step="next"]'); await click('.guide-stepper [data-step="next"]');
    const s2 = await state(), st2 = await store();
    ok("guide: first visit starts at step 1 with no progress and no reset button", s0.vis === 0 && s0.cls.startsWith("o,") && s0.prog === "5단계" && !s0.reset && !s0.done && s0.prev === true, JSON.stringify(s0));
    ok("guide: next twice marks steps 1–2 done, shows step 3, moves focus into it and saves progress",
      s2.vis === 2 && s2.cls === "d,d,o,," && s2.focus && s2.prog === "2 / 5 완료" && s2.reset && JSON.stringify(st2) === JSON.stringify({ basics: [0, 1], "basics@": 2 }), JSON.stringify({ s2, st2 }));
    await click('.guide-stepper [data-step="prev"]');
    const sp = await state(), stp = await store();
    await click(".guide-stepper .steps > li:nth-child(5) .step-btn");
    const s5 = await state();
    ok("guide: prev returns to step 2 (done steps stay done) and a step button jumps to step 5",
      sp.vis === 1 && sp.focus && stp["basics@"] === 1 && s5.vis === 4 && s5.focus && /완료/.test(s5.nextLabel || ""), JSON.stringify({ sp, stp, s5 }));
  });

  await part("3 · 다시 읽어도 마지막 단계 · 완료 단계 그대로, 개요의 'n / N 완료'", async () => {
    await page.reload(); await wait(200);
    const s = await state();
    ok("guide: reload restores the last step and the done steps", s.vis === 4 && s.cls.split(",")[4] === "o" && s.cls.split(",").filter((c) => c.includes("d")).length >= 2 && s.prev === false, JSON.stringify(s));
    await go("home/guide.html");
    const p = await page.evaluate(() => [...document.querySelectorAll(".guide-tracks [data-guide-prog]")].map((x) => [x.textContent.trim(), x.classList.contains("on")]));
    const done = (await store()).basics.length;
    ok("guide: overview shows the saved progress for that track only", p[0][0] === `${done} / 5 완료` && p[0][1] && p.slice(1).every(([t, on]) => /단계$/.test(t) && !on), JSON.stringify(p));
  });

  await part("4 · 완료 — 모든 단계 완료 · 완료 안내 · 다음 트랙 링크", async () => {
    await go("home/guide-basics.html");
    await click('.guide-stepper [data-step="finish"]');
    const s = await state(), st = await store();
    const note = await page.evaluate(() => { const n = document.querySelector(".guide-done"); return { role: n.getAttribute("role"), next: (n.querySelector("a") || {}).getAttribute && n.querySelector("a").getAttribute("href") }; });
    ok("guide: finish marks every step done, shows the done notice and links to the next track",
      s.done && s.prog === "5 / 5 완료" && st.basics.length === 5 && note.role === "status" && note.next === "../home/guide-designer.html", JSON.stringify({ s, st, note }));
  });

  await part("5 · 초기화 — 트랙 하나는 처음으로 · 패널 포커스, 개요의 모두 지우기는 저장값을 비우고 첫 트랙으로 포커스", async () => {
    await page.evaluate(() => localStorage.setItem("jsds-guide", JSON.stringify({ basics: [0, 1, 2, 3, 4], "basics@": 4, planner: [0], "planner@": 1 })));
    await page.reload(); await wait(150);
    await click("[data-guide-reset]");
    const s = await state(), st = await store();
    ok("guide: track reset returns to step 1, clears only that track and focuses the panel",
      s.vis === 0 && s.cls === "o,,,," && s.focus && !s.done && !s.reset && s.prog === "5단계" && !("basics" in st) && JSON.stringify(st.planner) === "[0]", JSON.stringify({ s, st }));
    await go("home/guide.html");
    const before = await page.evaluate(() => !document.querySelector('[data-guide-reset="all"]').hidden);
    await click('[data-guide-reset="all"]');
    const after = await page.evaluate(() => ({ hidden: document.querySelector('[data-guide-reset="all"]').hidden, focus: document.activeElement === document.querySelector(".guide-tracks a"), prog: [...document.querySelectorAll(".guide-tracks [data-guide-prog]")].every((x) => /단계$/.test(x.textContent)) }));
    ok("guide: overview 'clear all' empties progress, hides itself and focuses the first track", before && after.hidden && after.focus && after.prog && JSON.stringify(await store()) === "{}", JSON.stringify({ before, after }));
  });

  await part("6 · 저장이 막힌 브라우저 — 오류 없이 넘겨 읽고 진행 표시 없음", async () => {
    const c = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
    try {
      await c.addInitScript(() => { Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("blocked"); } }); });
      const p = await c.newPage(), errs = [];
      p.on("pageerror", (e) => errs.push(String(e)));
      const root = path.resolve(__dirname, "..");
      await p.goto("file://" + path.join(root, "home/guide-planner.html")); await p.waitForTimeout(150);
      await p.click('.guide-stepper [data-step="next"]'); await p.waitForTimeout(120);
      const s = await p.evaluate(() => { const sp = document.querySelector(".guide-stepper"); return { vis: [...sp.querySelectorAll(":scope > .step-panel")].findIndex((x) => !x.hidden), prog: document.querySelector("[data-guide-prog]").textContent.trim(), reset: !document.querySelector("[data-guide-reset]").hidden }; });
      await p.goto("file://" + path.join(root, "home/guide.html")); await p.waitForTimeout(150);
      const rows = await p.evaluate(() => document.querySelectorAll(".guide-tracks a").length);
      ok("guide: with storage blocked the wizard still moves, shows no progress and throws nothing", s.vis === 1 && s.prog === "6단계" && !s.reset && rows === 5 && errs.length === 0, JSON.stringify({ s, rows, errs }));
    } finally { await c.close(); }
  });

  await part("7 · 개발자 단계 — React / HTML 탭 전환, 복사 버튼이 보이는 칸의 코드", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("home/guide-developer.html"); await clear(); await page.reload(); await wait(150);
    const pane = () => page.evaluate(() => { const p = document.querySelector(".guide-panel:not([hidden])"); const v = [...p.querySelectorAll("[data-docpane]")].find((x) => !x.hidden); const b = v && v.querySelector(".copy-btn"); const code = b && document.getElementById(b.dataset.copy); return { id: v && v.dataset.docpane, sel: [...p.querySelectorAll("[data-doctab]")].map((t) => t.getAttribute("aria-selected")).join(), code: code ? code.textContent : "" }; });
    const r = await pane();
    await click('.guide-panel:not([hidden]) [data-doctab$="-html"]');
    const h = await pane();
    await page.evaluate(() => { window.__copied = null; try { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (t) => { window.__copied = t; return Promise.resolve(); } } }); } catch (e) { } });
    await click('.guide-panel:not([hidden]) [data-docpane]:not([hidden]) .copy-btn');
    const copied = await page.evaluate(() => window.__copied);
    const want = GUIDE.tracks.developer.steps.map((s, i) => (s.code ? i : -1)).filter((i) => i >= 0);
    const all = await page.evaluate(() => [...document.querySelectorAll(".guide-panel")].map((p, i) => (p.querySelector(".doc-tabset") ? i : -1)).filter((i) => i >= 0));
    ok("guide: developer steps with code have React / HTML tabs, switching shows HTML and copy copies the visible code",
      /react$/.test(r.id) && /npm i @jiran\/ds-react/.test(r.code) && r.sel === "true,false" && /html$/.test(h.id) && h.sel === "false,true" && /<link/.test(h.code) && copied === h.code && JSON.stringify(all) === JSON.stringify(want), JSON.stringify({ r: { ...r, code: r.code.slice(0, 40) }, h: { ...h, code: h.code.slice(0, 40) }, copied: (copied || "").slice(0, 40), all, want }));
  });

  await part("8 · 넘침 없음 — 여섯 페이지 × 1440 · 1024 · 768 · 390 × 라이트 · 다크, 마지막 단계까지", async () => {
    const bad = [];
    for (const theme of ["light", "dark"]) for (const w of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const k of ["guide", ...KEYS.map((x) => `guide-${x}`)]) {
        await go(`home/${k}.html`);
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        const steps = k === "guide" ? 1 : GUIDE.tracks[k.slice(6)].steps.length;
        for (let i = 0; i < steps; i++) {
          if (i) await page.evaluate((j) => { const b = document.querySelectorAll(".guide-stepper .steps > li")[j].querySelector(".step-btn"); if (b) b.click(); }, i);
          const m = await page.evaluate(() => { const art = document.querySelector("#content").getBoundingClientRect(); const out = [...document.querySelectorAll("#content .guide-panel:not([hidden]) *, #content .guide-tracks *, #content .guide-path *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > art.right + 1 || r.left < art.left - 1) && !e.closest("pre"); }).length; return { over: document.documentElement.scrollWidth - innerWidth, out }; });
          if (m.over > 1 || m.out) bad.push(`${theme}/${w}/${k}#${i + 1} ${JSON.stringify(m)}`);
          if (k === "guide" && w === 390) { const lefts = await page.evaluate(() => [...document.querySelectorAll(".guide-path > li")].map((x) => Math.round(x.getBoundingClientRect().left))); if (new Set(lefts).size !== 1) bad.push(`${theme}/390/guide path cards not stacked ${lefts}`); }
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await clear();
    ok("guide: no horizontal overflow and nothing outside the article on any step at 1440 · 1024 · 768 · 390, light and dark; path cards stack at 390", bad.length === 0, bad.slice(0, 3).join(" | "));
  });
};
