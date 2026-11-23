/* Templates 메뉴(2026-11-18 사람의 요청) — behave.js 가 부른다.
   헤더 메뉴 여섯 · 개요 행 여덟, 문서 페이지의 축소 미리보기(1440 · 1024 · 768 에서 틀 폭에 맞음 · 높이 = 900 × 비율) · 새 창 링크,
   화면 여덟을 직접 열어 오류 · 넘침 없음, 흉내 동작(로그인 → 2단계 → 대시보드 · 대화상자 제출 → Toast · 조직도 고르기 · 배포 완료 Toast · 1280 미만 접기),
   문서 페이지에서 제품 색 · 테마를 바꾸면 iframe 화면이 따라감, 코드 보기(2026-11-19 — HTML · CSS 탭 · 복사가 화면 파일 · templates.css 와 같음) */
const fs = require("fs");
const path = require("path");
module.exports = async function templates({ page, ok, go }) {
  const ROOT = path.resolve(__dirname, "..");
  const wait = (ms) => page.waitForTimeout(ms);
  const { SITE } = require("./data.js");
  const TEMPLATES = require("./templates.data.js");
  const KEYS = Object.keys(TEMPLATES);
  const part = require("./behave.part")(ok, "behave.templates", () => page);
  /* 화면을 직접 여는 덩어리는 새 컨텍스트에서 — behave.js 의 page 는 browser.newPage() 로 만든 기본 컨텍스트라 거기에 탭을 더할 수 없다 */
  const newTab = async () => { const c = await page.context().browser().newContext(); const p = await c.newPage(); p.done = () => c.close(); return p; };
  const frameOf = async (key) => { const h = await page.$(".tpl-frame iframe"); const f = h && (await h.contentFrame()); if (f) await f.waitForLoadState("load"); return f; };

  await part("1 · 헤더 메뉴 여섯 · Templates 는 Patterns 다음 · 1200 이상 한 줄, 개요 행 여덟과 링크 대상", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("templates/overview.html");
    const s = await page.evaluate(() => {
      const a = [...document.querySelectorAll(".topnav a, header nav a")].filter((x) => x.getBoundingClientRect().width > 0);
      const tops = new Set(a.map((x) => Math.round(x.getBoundingClientRect().top)));
      return { menu: a.map((x) => x.textContent.replace(/\s*N$/, "").trim()), oneLine: tops.size === 1, rows: [...document.querySelectorAll(".base-list a")].map((x) => [x.querySelector("b") && x.querySelector("b").textContent, x.getAttribute("href")]), hero: document.querySelectorAll(".tpl-hero > div").length, current: (a.find((x) => x.classList.contains("active")) || {}).textContent };
    });
    const want = Object.values(SITE).map((x) => x.title);
    const titles = KEYS.map((k) => SITE.templates.pages[k]);
    ok("templates: header has the six sections in order on one line at 1440, Templates current",
      s.menu.join() === want.join() && want.indexOf("Templates") === want.indexOf("Patterns") + 1 && s.oneLine && /Templates/.test(s.current || ""), JSON.stringify({ menu: s.menu, oneLine: s.oneLine, current: s.current }));
    const missing = s.rows.filter(([, h]) => !fs.existsSync(path.join(ROOT, "templates", path.basename(h))));
    ok("templates: overview lists the eight screens in order, each link has a page, hero has five tiles",
      s.rows.map((r) => r[0]).join() === titles.join() && s.rows.map((r) => r[1]).join() === KEYS.map((k) => "../templates/" + k + ".html").join() && !missing.length && s.hero === 5, JSON.stringify({ rows: s.rows, missing, hero: s.hero }));
  });

  await part("2 · 문서 페이지 미리보기 — iframe 이 그 화면을 그리고, 1440 · 1024 · 768 에서 틀 폭에 맞게 줄어듦, 높이 = 900 × 비율, 문서 넘침 없음", async () => {
    const bad = [];
    for (const w of [1440, 1024, 768]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const k of KEYS) {
        await go(`templates/${k}.html`);
        const f = await frameOf(k);
        const inner = f ? await f.evaluate(() => ({ title: document.title, w: innerWidth, h: innerHeight, body: document.body.children.length })) : null;
        await wait(80);
        const m = await page.evaluate(() => {
          const fr = document.querySelector(".tpl-frame"), i = fr.querySelector("iframe"), r = i.getBoundingClientRect(), fb = fr.getBoundingClientRect(), cs = getComputedStyle(fr);
          const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
          return { scaled: fr.classList.contains("scaled"), s: parseFloat(fr.style.getPropertyValue("--tpl-s")), cw: fr.clientWidth, rw: r.width, rh: r.height, fh: fb.height, bw, over: document.documentElement.scrollWidth - innerWidth, src: i.getAttribute("src") };
        });
        const good = inner && inner.w === 1440 && inner.h === 900 && inner.body > 0 && /Templates/.test(inner.title) && m.scaled && m.src === `screen/${k}.html`
          && Math.abs(m.rw - m.cw) <= 1 && Math.abs(m.s - Math.min(1, m.cw / 1440)) < 0.002 && Math.abs(m.rh - 900 * m.s) <= 1 && Math.abs(m.fh - (m.rh + m.bw)) <= 1 && m.over <= 1;
        if (!good) bad.push(`${w}/${k} ${JSON.stringify({ inner, m })}`);
      }
    }
    ok("templates: each doc page previews its screen at 1440 and scales it to the frame at 1440 · 1024 · 768", bad.length === 0, bad.slice(0, 2).join(" | "));
  });

  await part("3 · 새 창에서 열기 — 같은 화면 · 새 창 · rel · 숨긴 '(새 창)', 누르면 그 화면이 새 탭으로", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("templates/list.html");
    const a = await page.evaluate(() => { const x = document.querySelector(".tpl-frame-head a"); return { href: x.getAttribute("href"), target: x.target, rel: x.rel, sr: (x.querySelector(".sr-only") || {}).textContent, name: x.textContent.trim() }; });
    const [pop] = await Promise.all([page.context().waitForEvent("page"), page.click(".tpl-frame-head a")]);
    await pop.waitForLoadState("load");
    const url = pop.url(); await pop.close();
    ok("templates: new-window link opens the screen itself in a new tab with rel and hidden '(새 창)'",
      a.href === "screen/list.html" && a.target === "_blank" && a.rel === "noopener noreferrer" && a.sr === " (새 창)" && /새 창에서 열기/.test(a.name) && /templates\/screen\/list\.html$/.test(url), JSON.stringify({ a, url }));
  });

  await part("4 · 화면 여덟을 직접 — 1440 에서 오류 · 가로 넘침 없음, 검토 도구 없음, 로그인 말고는 상단 바 · 사이드 내비", async () => {
    const p = await newTab(); const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.setViewportSize({ width: 1440, height: 900 });
    const bad = [];
    for (const k of KEYS) {
      await p.goto("file://" + path.join(ROOT, "templates", "screen", k + ".html")); await p.waitForTimeout(250);
      const m = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, review: !!document.querySelector(".tpl-review, .tpl-hub"), top: !!document.querySelector(".topbar"), nav: !!document.querySelector(".sidenav") }));
      if (m.over > 1 || m.review || (k === "login" ? m.top || m.nav : !m.top || !m.nav)) bad.push(k + " " + JSON.stringify(m));
    }
    await p.done();
    ok("templates: the eight screens load without errors or overflow at 1440, no review toolbar", !bad.length && !errs.length, bad.concat(errs).slice(0, 3).join(" | "));
  });

  await part("5 · 흉내 동작 — 로그인 → 2단계(첫 칸 포커스) → 대시보드, 1280 미만 내비 접힘", async () => {
    const p = await newTab();
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.goto("file://" + path.join(ROOT, "templates", "screen", "login.html")); await p.waitForTimeout(200);
    await p.fill("#si-email", "admin@example.com"); await p.fill("#si-pw", "password1234");
    await p.click("#tpl-login button[type=submit]"); await p.waitForTimeout(150);
    const step = await p.evaluate(() => ({ login: document.getElementById("tpl-login").hidden, otp: document.getElementById("tpl-otp").hidden, focus: document.activeElement && document.activeElement.classList.contains("code-cell") }));
    await p.keyboard.type("123456");
    await Promise.all([p.waitForURL(/dashboard\.html$/, { timeout: 5000 }), p.click("#tpl-otp button[type=submit]")]);
    ok("templates: login submits to the code step (first cell focused) and then to the dashboard", step.login && !step.otp && step.focus && /dashboard\.html$/.test(p.url()), JSON.stringify({ step, url: p.url() }));
    await p.setViewportSize({ width: 1100, height: 900 });
    await p.goto("file://" + path.join(ROOT, "templates", "screen", "list.html")); await p.waitForTimeout(250);
    const narrow = await p.evaluate(() => ({ collapsed: document.querySelector(".sidenav").classList.contains("collapsed"), btn: document.querySelector("[data-sidenav-toggle]").getAttribute("aria-expanded") }));
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.goto("file://" + path.join(ROOT, "templates", "screen", "list.html")); await p.waitForTimeout(250);
    const wide = await p.evaluate(() => document.querySelector(".sidenav").classList.contains("collapsed"));
    await p.done();
    ok("templates: below 1280 the side nav starts collapsed, at 1440 it is open", narrow.collapsed && narrow.btn === "false" && !wide, JSON.stringify({ narrow, wide }));
  });

  await part("6 · 흉내 동작 — 조직도 고르기 · 대화상자 제출 → 닫힘 + Toast, 배포 완료 Toast", async () => {
    const p = await newTab();
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.goto("file://" + path.join(ROOT, "templates", "screen", "org.html")); await p.waitForTimeout(250);
    const name0 = await p.textContent('[data-org="name"]');
    await p.click('[aria-label="조직도"] li[data-value="dev"] > .tree-row'); await p.waitForTimeout(120);
    const name1 = await p.textContent('[data-org="name"]');
    await p.click('[data-popup-open="#org-add"]'); await p.waitForTimeout(250);
    const opened = await p.evaluate(() => !document.getElementById("org-add").hidden || document.getElementById("org-add").classList.contains("open"));
    await p.fill("#org-add-name", "보안 운영 2팀");
    await p.click('#org-add button[type=submit], button[form="org-add-form"]'); await p.waitForTimeout(400);
    const after = await p.evaluate(() => { const pp = document.getElementById("org-add"); return { closed: pp.hidden || !pp.classList.contains("open"), toast: [...document.querySelectorAll(".toast")].map((t) => t.textContent).join("|") }; });
    await p.goto("file://" + path.join(ROOT, "templates", "screen", "wizard.html")); await p.waitForTimeout(250);
    await p.evaluate(() => document.querySelector(".stepper").dispatchEvent(new CustomEvent("ds:step-finish", { bubbles: true })));
    await p.waitForTimeout(800);   // 처리 중(600ms) 뒤에 Toast — 2026-11-20
    const wiz = await p.evaluate(() => [...document.querySelectorAll(".toast")].map((t) => t.textContent).join("|"));
    await p.done();
    ok("templates: org tree selection changes the right side, a dialog form closes with a toast, wizard finish shows a toast",
      name0 !== name1 && name1.trim().length > 0 && opened && after.closed && /부서를 추가했습니다/.test(after.toast) && /정책 배포를 예약했습니다/.test(wiz), JSON.stringify({ name0, name1, opened, after, wiz }));
  });

  await part("7 · 문서 페이지에서 제품 색 · 테마를 바꾸면 iframe 화면이 따라감", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => { try { localStorage.removeItem("jsds-accent"); localStorage.setItem("jsds-theme", "light"); } catch (e) {} });
    await go("templates/dashboard.html");
    const f = await frameOf("dashboard");
    const before = await f.evaluate(() => ({ accent: document.documentElement.dataset.accent || "", theme: document.documentElement.getAttribute("data-theme") }));
    await page.evaluate(() => window.applyAccent("red"));
    await page.click("#themeBtn");
    await wait(300);
    const after = await f.evaluate(() => ({ accent: document.documentElement.dataset.accent || "", theme: document.documentElement.getAttribute("data-theme"), prod: getComputedStyle(document.documentElement).getPropertyValue("--prod-50").trim() }));
    const parent = await page.evaluate(() => ({ theme: document.documentElement.getAttribute("data-theme"), prod: getComputedStyle(document.documentElement).getPropertyValue("--prod-50").trim() }));
    await page.evaluate(() => window.applyAccent(""));
    await page.click("#themeBtn");
    await wait(300);
    const back = await f.evaluate(() => ({ accent: document.documentElement.dataset.accent || "", theme: document.documentElement.getAttribute("data-theme") }));
    ok("templates: changing product color and theme on the doc page repaints the preview screen (and back)",
      before.accent === "" && before.theme === "light" && after.accent === "red" && after.theme === "dark" && parent.theme === "dark" && after.prod === parent.prod && !!after.prod && back.accent === "" && back.theme === "light",
      JSON.stringify({ before, after, parent, back }));
  });

  await part("8 · 코드 보기 — 접힘으로 시작, 누르면 HTML 칸 · 복사가 화면 파일 그대로, CSS 탭은 templates.css 그대로, 코드 칸 안 스크롤", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const bad = [];
    for (const k of KEYS) {
      await go(`templates/${k}.html`);
      await page.evaluate(() => { window.__copied = null; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (t) => { window.__copied = t; return Promise.resolve(); } } }); });
      const sel = `#tpl-${k}`;
      const st = () => page.evaluate((q) => { const ex = document.querySelector(q), code = ex.querySelector(".example-code"), tog = ex.querySelector("[data-toggle]"), pre = ex.querySelector("[data-pane]:not([hidden]) pre");
        return { hidden: code.hidden, tog: tog.textContent, exp: tog.getAttribute("aria-expanded"), panes: [...ex.querySelectorAll("[data-pane]")].map((p) => p.dataset.pane + (p.hidden ? "-" : "+")).join(), copy: ex.querySelector(".example-actions [data-copy]").dataset.copy, preH: pre ? pre.getBoundingClientRect().height : 0, preScroll: pre ? pre.scrollHeight > pre.clientHeight : false, over: document.documentElement.scrollWidth - innerWidth }; }, sel);
      const s0 = await st();
      await page.click(`${sel} [data-toggle]`); const s1 = await st();
      await page.click(`${sel} .example-actions [data-copy]`); await wait(50); const htmlCopied = await page.evaluate(() => window.__copied);
      await page.click(`${sel} .code-tabs [data-tab="css"]`); const s2 = await st();
      await page.click(`${sel} .example-actions [data-copy]`); await wait(50); const cssCopied = await page.evaluate(() => window.__copied);
      await page.click(`${sel} .code-tabs [data-tab="html"]`); const s3 = await st();   // 다시 HTML — 복사 대상이 -css 에서 돌아와야 한다
      const file = fs.readFileSync(path.join(ROOT, "templates", "screen", k + ".html"), "utf8").trim(), css = fs.readFileSync(path.join(ROOT, "assets", "templates.css"), "utf8").trim();
      const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      const good = s0.hidden && s0.tog === "코드 보기" && s0.exp === "false"
        && !s1.hidden && s1.tog === "코드 접기" && s1.exp === "true" && s1.panes === "html+,css-" && s1.copy === `tpl-${k}-html` && htmlCopied === file && s1.preScroll && Math.abs(s1.preH - 37.5 * rem) <= 1
        && s2.panes === "html-,css+" && s2.copy === `tpl-${k}-css` && cssCopied === css && s2.over <= 1 && s3.panes === "html+,css-" && s3.copy === `tpl-${k}-html`;
      if (!good) bad.push(`${k} ${JSON.stringify({ s0, s1, s2, s3, html: htmlCopied === file, css: cssCopied === css })}`);
    }
    ok("templates: code view starts closed, opens to the screen file HTML (copy = file), CSS tab shows and copies templates.css (and back), long code scrolls inside", bad.length === 0, bad.slice(0, 2).join(" | "));
  });
};
