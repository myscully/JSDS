/* UI Dictionary(2026-11-19 사람의 요청) — behave.js 가 부른다.
   카드 수 · 수 글자 없음 · 탭은 분류 이름만 · 추천 검색어는 텍스트 버튼 · placeholder · 분류 탭(방향키) · 검색(다른 이름 '모달' → 팝업, 생김새 '점 세 개' → 드롭다운 메뉴, 없는 말 → 빈 상태, Esc 로 지움, 추천 검색어),
   '/' 가 사전 검색으로, 카드 → Side Panel(포커스 · 큰 미리보기 · Esc 로 닫고 카드로 복귀 · 상세가 카드로 돌아감),
   복사 셋(HTML · React · 클래스 = 데이터 그대로), 미리보기는 inert 이고 1440 · 1024 · 768 · 390 에서 칸 안에 듦, 다크 · 제품 색, 넘침 없음, URL 기억 */
const fs = require("fs");
const path = require("path");
module.exports = async function uidict({ page, ok, go }) {
  const ROOT = path.resolve(__dirname, "..");
  const wait = (ms) => page.waitForTimeout(ms);
  const UD = require("./uidict.data.js");
  const part = require("./behave.part")(ok, "behave.uidict", () => page);
  const F = "resources/ui-dictionary.html";
  const open = async (q = "") => { await page.goto("file://" + path.join(ROOT, F) + q); await page.waitForLoadState("load"); await wait(300); };
  const vis = () => page.evaluate(() => [...document.querySelectorAll(".ud-item")].filter((li) => !li.hidden && li.offsetParent).map((li) => li.querySelector(".ud-name").textContent));
  const state = () => page.evaluate(() => ({ q: document.getElementById("ud-q").value, tabs: !document.querySelector(".ud-tabbar > .tabs").closest("[hidden]") && document.querySelector(".ud-tabbar > .tabs").offsetParent !== null,
    sel: (document.querySelector('.ud-tabbar > .tabs > .tab[aria-selected="true"]') || {}).dataset?.value, empty: !document.querySelector(".ud-empty").hidden, rhead: !document.querySelector(".ud-rhead").hidden,
    count: document.querySelector(".ud-rcount").textContent, status: document.getElementById("ud-status").textContent, url: location.search, over: document.documentElement.scrollWidth - innerWidth }));
  const search = async (t) => { await page.fill("#ud-q", t); await wait(450); };
  const catItems = (c) => UD.items.filter((x) => x.cat === c).map((x) => x.name);

  await part("1 · 구성 — 카드 수 = 데이터, 수 글자 없음, 탭은 분류 이름만, 추천 검색어는 텍스트 버튼, placeholder, 첫 분류만 보임", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open();
    const s = await page.evaluate(() => ({ cards: document.querySelectorAll(".ud-item").length, meta: !!document.querySelector(".ud-meta"),
      tabs: [...document.querySelectorAll(".ud-tabbar > .tabs > .tab")].map((t) => [t.dataset.value, t.textContent.trim(), !!t.querySelector(".count")]),
      hints: [...document.querySelectorAll("[data-ud-hint]")].map((x) => [x.textContent, x.classList.contains("text") && !x.classList.contains("outline") && getComputedStyle(x).borderTopColor === "rgba(0, 0, 0, 0)"]),
      ph: document.getElementById("ud-q").placeholder }));
    const v = await vis();
    ok("uidict: one card per entry, no count line, tabs show only category names, hints are text buttons, placeholder, first category shown",
      s.cards === UD.items.length && !s.meta && JSON.stringify(s.tabs) === JSON.stringify(UD.cats.map((c) => [c, c, false]))
      && JSON.stringify(s.hints) === JSON.stringify(UD.suggest.map((h) => [h, true])) && s.ph === "이름이 안 떠오르면 생김새로 찾아보세요" && v.join() === catItems(UD.cats[0]).join(),
      JSON.stringify({ s, v: v.length }));
  });

  await part("2 · 분류 탭 — 누르기 · 방향키 · End, 보이는 카드 = 그 분류, URL 에 cat", async () => {
    await open();
    await page.click(`.ud-tabbar > .tabs > .tab[data-value="${UD.cats[2]}"]`); await wait(100);
    const a = { v: await vis(), s: await state() };
    await page.focus(`.ud-tabbar > .tabs > .tab[data-value="${UD.cats[2]}"]`); await page.keyboard.press("ArrowRight"); await wait(100);
    const b = { v: await vis(), s: await state(), focus: await page.evaluate(() => document.activeElement.dataset.value) };
    await page.keyboard.press("End"); await wait(100);
    const c = { v: await vis(), s: await state() };
    const last = UD.cats[UD.cats.length - 1];
    ok("uidict: tabs filter cards by category (click · arrow · End) and remember it in the URL",
      a.v.join() === catItems(UD.cats[2]).join() && a.s.sel === UD.cats[2] && decodeURIComponent(a.s.url) === `?cat=${UD.cats[2]}`
      && b.focus === UD.cats[3] && b.v.join() === catItems(UD.cats[3]).join() && c.s.sel === last && c.v.join() === catItems(last).join(),
      JSON.stringify({ a: a.s, b: [b.focus, b.v.length], c: [c.s.sel, c.v.length] }));
  });

  await part("3 · 검색 — 다른 이름 · 생김새 · 없는 말 · Esc · 추천 검색어", async () => {
    await open();
    await search("모달"); const m = { v: await vis(), s: await state() };
    await search("점세개"); const d = { v: await vis(), s: await state() };
    await search("없는말쿼리zz"); const n = { v: await vis(), s: await state() };
    await page.focus("#ud-q"); await page.keyboard.press("Escape"); await wait(450); const e = { v: await vis(), s: await state() };
    await page.click(`[data-ud-hint="${UD.suggest[0]}"]`); await wait(450); const h = { v: await vis(), s: await state() };
    await page.click("[data-ud-hint]"); await wait(50);
    ok("uidict: search finds by another name ('모달' → 팝업 first) and by look ('점세개', spaces ignored → 드롭다운 메뉴), hides tabs, counts hits",
      m.v[0] === "팝업" && !m.s.tabs && m.s.rhead && +m.s.count === m.v.length && /모달/.test(decodeURIComponent(m.s.url)) && /\d+개/.test(m.s.status)
      && d.v[0] === "드롭다운 메뉴", JSON.stringify({ m: [m.v.slice(0, 3), m.s], d: d.v.slice(0, 3) }));
    ok("uidict: no hits shows the empty state, Esc clears back to the category, a hint button searches",
      n.v.length === 0 && n.s.empty && n.s.count === "0" && e.s.q === "" && e.s.tabs && !e.s.empty && e.v.join() === catItems(UD.cats[0]).join() && e.s.url === ""
      && h.s.q === UD.suggest[0] && h.v.length > 0 && h.v[0] === "사이드 패널", JSON.stringify({ n: n.s, e: e.s, h: [h.s.q, h.v.slice(0, 3)] }));
  });

  await part("4 · '/' 는 사전 검색으로", async () => {
    await open();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("/"); await wait(100);
    const f = await page.evaluate(() => ({ id: document.activeElement.id, siteOpen: !!document.querySelector(".search-pop:not([hidden]), .search-results:not([hidden])") }));
    ok("uidict: '/' focuses the dictionary search, not the site search", f.id === "ud-q", JSON.stringify(f));
  });

  await part("5 · 카드 → Side Panel — 제목 · 포커스 · 큰 미리보기, Esc 로 닫고 카드로, 상세는 카드로 돌아감", async () => {
    await open();
    const name = UD.items.find((x) => x.cat === UD.cats[0]).name;
    await page.click(".ud-item:not([hidden]) .ud-open"); await wait(400);
    const o = await page.evaluate(() => { const p = document.getElementById("ud-panel"), big = p.querySelector(".ud-big .ud-stage"); const r = p.getBoundingClientRect();
      return { open: !p.hidden && r.width > 0, right: Math.round(innerWidth - r.right), title: document.getElementById("ud-panel-title").textContent, focusIn: p.contains(document.activeElement),
        big: big ? big.children.length : 0, fit: big ? big.classList.contains("fit") : false, inert: big ? big.hasAttribute("inert") : false, detailIn: !!p.querySelector(".ud-detail:not([hidden])"),
        ids: (() => { const a = [...document.querySelectorAll("[id]")].map((x) => x.id); return a.length - new Set(a).size; })() }; });
    await page.keyboard.press("Escape"); await wait(300);
    const c = await page.evaluate(() => { const li = document.querySelector(".ud-item:not([hidden])"); return { hidden: document.getElementById("ud-panel").hidden, back: document.activeElement === li.querySelector(".ud-open"), detailHome: !!li.querySelector(".ud-detail[hidden]") }; });
    ok("uidict: a card opens the side panel on the right with its name, focus inside, a fitted inert big preview, no duplicate ids",
      o.open && o.right <= 1 && o.title === name && o.focusIn && o.big > 0 && o.fit && o.inert && o.detailIn && o.ids === 0, JSON.stringify(o));
    ok("uidict: Esc closes the panel, focus returns to the card, the detail goes back into its card", c.hidden && c.back && c.detailHome, JSON.stringify(c));
  });

  await part("6 · 복사 — HTML · React · 클래스 = 카드의 코드 · 데이터 그대로", async () => {
    await open();
    await page.evaluate(() => { window.__copied = []; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (t) => { window.__copied.push(t); return Promise.resolve(); } } }); });
    const i = UD.items.findIndex((x) => x.cat === UD.cats[0] && x.cls);
    const want = await page.evaluate((k) => { const li = document.querySelector(`.ud-item[data-i="${k}"]`); return { html: li.querySelector('code[id$="code-html"]').textContent, react: (li.querySelector('code[id$="code-react"]') || {}).textContent }; }, i);
    await page.click(`.ud-item[data-i="${i}"] .ud-open`); await wait(400);
    await page.click('#ud-panel [data-label="HTML 복사"]'); await wait(80);
    if (want.react) { await page.click('#ud-panel [data-label="React 복사"]'); await wait(80); }
    await page.click("#ud-panel .copy-field .copy"); await wait(80);
    const got = await page.evaluate(() => window.__copied);
    const x = UD.items[i];
    const [srcSec, srcPage, srcId] = x.src.split("/");
    const reactFile = path.join(ROOT, "_react", "examples", srcSec, srcPage, srcId + ".tsx");
    const reactOk = !fs.existsSync(reactFile) || got[1] === fs.readFileSync(reactFile, "utf8").trim() || got[1] === fs.readFileSync(reactFile, "utf8");
    ok("uidict: HTML · React · class copy buttons copy the example HTML, the React example file and the class",
      got.length === (want.react ? 3 : 2) && got[0] === want.html && want.html.length > 20 && (!want.react || (got[1] === want.react && reactOk)) && got[got.length - 1] === x.cls,
      JSON.stringify({ n: got.length, html: got[0] === want.html, react: want.react ? got[1] === want.react : "none", reactOk, cls: got[got.length - 1] }));
  });

  await part("7 · 미리보기 — inert · 칸에 맞춤 · 넘침 없음(1440 · 1024 · 768 · 390)", async () => {
    const bad = [];
    for (const w of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width: w, height: 900 });
      await open();
      for (const c of UD.cats) {
        await page.click(`.ud-tabbar > .tabs > .tab[data-value="${c}"]`); await wait(c === UD.cats[UD.cats.length - 1] ? 1500 : 250);
        const r = await page.evaluate(() => [...document.querySelectorAll(".ud-item")].filter((li) => !li.hidden && li.offsetParent).map((li) => {
          const shot = li.querySelector(".ud-shot"), st = li.querySelector(".ud-stage"), a = shot.getBoundingClientRect(), t = (st.classList.contains("ud-tpl") ? st.querySelector("iframe") : st).getBoundingClientRect();
          return { n: li.querySelector(".ud-name").textContent, inert: st.hasAttribute("inert"), fit: st.classList.contains("fit"), inside: t.left >= a.left - 1 && t.right <= a.right + 1 && t.top >= a.top - 1 && t.bottom <= a.bottom + 1, empty: t.width < 8 || t.height < 8 };
        }).filter((x) => !x.inert || !x.fit || !x.inside || x.empty));
        r.forEach((x) => bad.push(`${w}/${c}/${JSON.stringify(x)}`));
      }
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 1) bad.push(`${w} page overflow ${over}`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    ok("uidict: every preview is inert, fitted and inside its shot in every category at 1440 · 1024 · 768 · 390, no page overflow", bad.length === 0, bad.slice(0, 3).join(" | "));
  });

  await part("8 · 다크 · 제품 색 — 카드 면 = 토큰, 미리보기 안 주 버튼 = 제품 면", async () => {
    await open();
    const read = () => page.evaluate(() => {
      const li = document.querySelector(".ud-item:not([hidden])"), probe = document.createElement("i"); probe.style.cssText = "position:absolute;background:var(--surface-elevated-primary);color:var(--surface-brand-primary)"; document.body.appendChild(probe);
      const cs = getComputedStyle(probe), want = { bg: cs.backgroundColor, brand: cs.color }; probe.remove();
      const btn = document.querySelector(".ud-item .ud-stage .btn.solid.primary");
      return { bg: getComputedStyle(li).backgroundColor, btn: btn ? getComputedStyle(btn).backgroundColor : null, want };
    });
    await page.evaluate(() => { document.documentElement.setAttribute("data-theme", "dark"); });
    await page.click('[data-accent="red"]').catch(() => page.evaluate(() => document.documentElement.setAttribute("data-accent", "red")));
    await wait(200);
    const dk = await read();
    await page.evaluate(() => { document.documentElement.setAttribute("data-theme", "light"); });
    const lt = await read();
    await page.evaluate(() => { try { localStorage.removeItem("jsds-accent"); localStorage.removeItem("jsds-theme"); } catch (e) { } document.documentElement.removeAttribute("data-accent"); });
    ok("uidict: cards use the elevated surface and previews follow the product color in dark and light",
      dk.bg === dk.want.bg && lt.bg === lt.want.bg && dk.bg !== lt.bg && dk.btn === dk.want.brand && lt.btn === lt.want.brand, JSON.stringify({ dk, lt }));
  });

  await part("9 · URL 기억 — ?q= 로 열면 검색, ?cat= 로 열면 그 분류", async () => {
    await open("?q=" + encodeURIComponent("모달"));
    const q = { v: await vis(), s: await state() };
    await open("?cat=" + encodeURIComponent(UD.cats[4]));
    const c = { v: await vis(), s: await state() };
    ok("uidict: opening with ?q= restores the search and with ?cat= restores the category",
      q.s.q === "모달" && q.v[0] === "팝업" && !q.s.tabs && c.s.sel === UD.cats[4] && c.v.join() === catItems(UD.cats[4]).join() && decodeURIComponent(c.s.url) === `?cat=${UD.cats[4]}`,
      JSON.stringify({ q: [q.s, q.v.slice(0, 2)], c: [c.s, c.v.length] }));
  });
};
