/* 메인 화면(index.html) — B4 Balance(2026-11-18 사람의 결정) — behave.js 가 부른다.
   구성 · 배너 수 = 데이터 · 모든 헤더의 JSDS 로고, 들어오기와 떠 있기(메인 히어로만의 움직임 예외), 줄인 모션은 처음부터 마지막 모습,
   패럴랙스 방향, 글자와 도형의 실제 칠한 면이 어느 폭 · 어느 스크롤에서도 겹치지 않음, 제품 색은 방패 · 아이콘 포인트만, 배너 hover 는 색만, 넘침 */
const fs = require("fs");
const path = require("path");
module.exports = async function home({ page, ok, go }) {
  const SITE_DIR = path.resolve(__dirname, "..");
  const wait = (ms) => page.waitForTimeout(ms);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const { SITE } = require("./data.js");
  const LIB = require("./lib.js");
  const cnt = (sec) => LIB.allPages(SITE, sec).filter((p) => p.key !== "overview").length;
  const part = require("./behave.part")(ok, "behave.home", () => page);
  const setAccent = (k) => page.evaluate((k) => { try { k ? localStorage.setItem("jsds-accent", k) : localStorage.removeItem("jsds-accent"); } catch (e) {} }, k);
  // 글자(h1 · 서브 두 문장 · 버튼)의 둘레 pad px 안에서 도형의 실제 칠한 면을 찾는다 — 도형은 pointer-events:none 이라 잴 동안만 켠다
  const overlap = (pad) => page.evaluate((pad) => {
    // 바깥 .hm-sh 는 회전 전 사각형이라 칠한 면이 아니다 — 반원 · 부채꼴 · 알약은 .hm-in(둥근 모서리 · 회전 반영), 방패 그림은 원 · 방패 · 점 조각만 켠다
    const sh = [...document.querySelectorAll(".hm-half .hm-in, .hm-wedge .hm-in, .hm-pill .hm-in, .hm-guard .hm-in > *")]; sh.forEach((e) => (e.style.pointerEvents = "auto"));
    const rects = [...document.querySelectorAll(".hm h1, .hm-copy p span")].flatMap((e) => { const g = document.createRange(); g.selectNodeContents(e); return [...g.getClientRects()]; }).concat([document.querySelector(".hm-btn").getBoundingClientRect()]);
    const by = new Set(); let n = 0;
    for (const rc of rects) for (let x = rc.left - pad; x <= rc.right + pad; x += 6) for (let y = rc.top - pad; y <= rc.bottom + pad; y += 6) {
      if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) continue;
      const hit = document.elementsFromPoint(x, y).map((el) => el.closest(".hm-sh")).find(Boolean); if (hit) { n++; by.add(hit.classList[1]); }
    }
    sh.forEach((e) => (e.style.pointerEvents = ""));
    const lines = [...document.querySelectorAll(".hm-copy p span")].map((e) => { const g = document.createRange(); g.selectNodeContents(e); return new Set([...g.getClientRects()].map((x) => Math.round(x.top))).size; });
    const gd = document.querySelector(".hm-guard .hm-in").getBoundingClientRect();
    return { n, by: [...by].join(","), lines, guardIn: gd.left >= 0 && gd.right <= innerWidth };
  }, pad);

  await part("1 · 구성 — 제목 · 서브 두 문장 · 시작하기 · 도형 넷 · 배너 셋(수 = 데이터) · 모든 헤더의 JSDS 로고", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setAccent(null);
    await go("index.html"); await wait(300);
    const s = await page.evaluate(() => ({
      h1: document.querySelector(".hm h1").textContent, label: document.querySelector(".hm").getAttribute("aria-labelledby"),
      sub: document.querySelectorAll(".hm-copy p span").length, btn: document.querySelector(".hm-btn").getAttribute("href"),
      shapes: [...document.querySelectorAll(".hm-sh")].map((e) => e.classList[1] + ":" + (e.getAttribute("aria-hidden") || e.getAttribute("role") + (e.getAttribute("aria-label") ? "+name" : ""))),
      bans: [...document.querySelectorAll(".hm-ban")].map((a) => [a.querySelector(".hm-txt > b").textContent, a.getAttribute("href"), a.querySelector("em").textContent]),
      region: document.querySelector(".hm-bans").getAttribute("aria-label"),
    }));
    const want = [["Foundations", "foundations/overview.html", `${cnt("foundations")} pages`], ["Components", "components/overview.html", `${cnt("components")} components`], ["Patterns", "patterns/overview.html", `${cnt("patterns")} patterns`]];
    const logos = [];
    for (const pg of ["index.html", "components/button.html", "patterns/dashboard.html"]) {
      await go(pg); await wait(150);
      logos.push(await page.evaluate(() => { const b = document.querySelector("header .brand"), l = b.querySelector(".logo"), i = l && l.querySelector("i"); return { name: b.getAttribute("aria-label"), text: l && l.textContent, hidden: l && l.getAttribute("aria-hidden"), w: l && getComputedStyle(l).fontWeight, dot: i && getComputedStyle(i).backgroundColor, href: b.getAttribute("href") }; }));
    }
    const brand = await tok("--surface-brand-primary");
    ok("home is the B4 hero (title, two sentences, Get started to Getting started, three decorative shapes and a named shield) with three shortcut banners whose counts equal the data; every header shows the JSDS logo with a product-color dot",
      s.h1 === "JS Design System" && s.label === "hm-title" && s.sub === 2 && s.btn === "home/getting-started.html"
      && s.shapes.join() === "hm-half:true,hm-wedge:true,hm-pill:true,hm-guard:img+name" && s.region === "Shortcuts" && JSON.stringify(s.bans) === JSON.stringify(want)
      && logos.every((l) => l.name === "JS Design System 홈" && l.text === "JSDS" && l.hidden === "true" && l.w === "800" && l.dot === brand) && logos[0].href === "index.html" && logos[1].href === "../index.html",
      JSON.stringify({ s, want, logos, brand }));
  });

  await part("2 · 들어오기 — 처음엔 숨었다가 글자 0.9초 · 도형 1.3초로 나타나고 도형 넷이 떠 있음", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("index.html"); await wait(60);
    const early = await page.evaluate(() => ({ attr: document.documentElement.hasAttribute("data-hm"), op: [...document.querySelectorAll(".hm-in, .hm-rise")].map((e) => +(+getComputedStyle(e).opacity).toFixed(2)) }));
    await wait(2700);
    const late = await page.evaluate(() => ({ go: document.querySelector(".hm").classList.contains("go"), op: [...document.querySelectorAll(".hm-in, .hm-rise")].map((e) => +getComputedStyle(e).opacity),
      anim: document.getAnimations().filter((a) => a.playState === "running").map((a) => a.animationName).filter((n) => /^hm-/.test(n)), dur: getComputedStyle(document.querySelector(".hm-fl")).animationDuration }));
    ok("the hero starts hidden, the text rises and the shapes come in once, then all four shapes keep floating (8s, the declared hero exception)",
      early.attr && early.op.some((x) => x < 1) && late.go && late.op.length === 7 && late.op.every((x) => x === 1) && late.anim.filter((n) => n === "hm-float").length === 4 && late.anim.every((n) => n === "hm-float") && late.dur === "8s",
      JSON.stringify({ early, late }));
  });

  await part("3 · 줄인 모션 — data-hm 없음 · 처음부터 보이고 움직임 없음 · 패럴랙스 없음", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    try {
      await go("index.html"); await wait(200);
      const a = await page.evaluate(() => ({ attr: document.documentElement.hasAttribute("data-hm"), op: [...document.querySelectorAll(".hm-in, .hm-rise")].map((e) => getComputedStyle(e).opacity), anim: document.getAnimations().map((x) => x.animationName).filter((n) => /^hm-/.test(n)) }));
      const y0 = await page.evaluate(() => document.querySelector(".hm-wedge").getBoundingClientRect().top + scrollY);
      await page.evaluate(() => scrollTo(0, 300)); await wait(300);
      const y1 = await page.evaluate(() => ({ y: document.querySelector(".hm-wedge").getBoundingClientRect().top + scrollY, sy: getComputedStyle(document.documentElement).getPropertyValue("--hm-sy") }));
      ok("with reduced motion the hero is fully visible at once, nothing animates and scrolling does not move the shapes",
        !a.attr && a.op.length === 7 && a.op.every((o) => o === "1") && a.anim.length === 0 && Math.abs(y1.y - y0) < 0.5 && y1.sy === "", JSON.stringify({ a, y0, y1 }));
    } finally { await page.emulateMedia({ reducedMotion: null }); }
  });

  await part("4 · 패럴랙스 — 글자 위 부채꼴은 스크롤보다 빨리, 아래 방패는 느리게 올라감", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("index.html"); await wait(2700);
    const y0 = await page.evaluate(() => ["hm-guard", "hm-wedge"].map((k) => document.querySelector("." + k).getBoundingClientRect().top));
    await page.mouse.move(700, 500); await page.mouse.wheel(0, 300); await wait(800);
    const sc = await page.evaluate((y0) => ({ g: y0[0] - document.querySelector(".hm-guard").getBoundingClientRect().top, w: y0[1] - document.querySelector(".hm-wedge").getBoundingClientRect().top, sy: scrollY }), y0);
    ok("scroll parallax keeps the shapes away from the text: the wedge above rises faster than the page, the shield below slower",
      sc.sy > 0 && sc.g < sc.sy && sc.w > sc.sy, JSON.stringify(sc));
  });

  await part("5 · 겹침 — 일곱 폭에서 글자(둘레 8px)와 도형 0 · 방패 화면 안 · 1024 이상은 서브 문장마다 한 줄 · 스크롤 중에도 0", async () => {
    const bad = [];
    for (const [w, h] of [[2560, 1440], [1920, 1080], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844]]) {
      await page.setViewportSize({ width: w, height: h });
      await go("index.html"); await wait(2700);
      const r = await overlap(8);
      if (!(r.n === 0 && r.guardIn && (w < 1024 || r.lines.every((x) => x === 1)))) bad.push([w, r]);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("index.html"); await wait(2700);
    const during = [];
    for (const y of [100, 200, 300, 450]) { await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y); await wait(250); during.push((await overlap(0)).n); }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    ok("the painted shapes never touch the text or button at 2560 · 1920 · 1440 · 1280 · 1024 · 768 · 390 nor while scrolling, the shield stays on screen, and each sentence is one line from 1024",
      bad.length === 0 && during.every((x) => x === 0), JSON.stringify({ bad, during }));
  });

  await part("6 · 제품 색 — 방패와 아이콘 포인트만 따라가고 도형 셋은 그대로 · AI 는 그라데이션", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setAccent(null); await go("index.html"); await wait(400);
    const fixed = () => page.evaluate(() => ["hm-half", "hm-wedge", "hm-pill"].map((k) => getComputedStyle(document.querySelector("." + k + " .hm-in")).backgroundColor).join());
    const c0 = await fixed();
    const want0 = [await tok("--orange-50"), await tok("--red-50"), await tok("--green-50")].join();
    await page.click("#accentBtn"); await wait(200); await page.click('#accentPop [data-accent="red"]'); await wait(400);
    const red = await page.evaluate(() => ({ shield: getComputedStyle(document.querySelector(".hm-shield")).backgroundColor, ic: ["hm-ic-f i:nth-child(3)", "hm-ic-c", "hm-ic-p b"].map((q) => getComputedStyle(document.querySelector("." + q)).backgroundColor) }));
    const brand = await tok("--surface-brand-primary");
    const c1 = await fixed();
    await page.click("#accentBtn"); await wait(200); await page.click('#accentPop [data-accent="ai"]'); await wait(400);
    const ai = await page.evaluate(() => ["hm-shield", "hm-ic-f i:nth-child(3)", "hm-ic-c", "hm-ic-p b"].map((q) => /gradient/.test(getComputedStyle(document.querySelector("." + q)).backgroundImage)));
    const c2 = await fixed();
    await page.click("#accentBtn"); await wait(200); await page.click('#accentPop [data-accent=""]'); await wait(300);
    const base = await page.evaluate(() => ["hm-shield", "hm-ic-c"].map((q) => getComputedStyle(document.querySelector("." + q)).backgroundImage));
    await setAccent(null);
    ok("product color repaints only the shield and the banner icon points (AI as a gradient, none for solid products); the half circle, wedge and pill keep their fixed ramp colors",
      c0 === want0 && c1 === c0 && c2 === c0 && red.shield === brand && red.ic.every((c) => c === brand) && ai.every(Boolean) && base.every((b) => b === "none"), JSON.stringify({ c0, want0, c1, c2, red, brand, ai, base }));
  });

  await part("7 · 배너 hover — 면 색만 바뀌고 카드는 뜨지 않음 · 화살표 · 아이콘만 움직임 · 토큰 시간", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("index.html"); await wait(300);
    await page.evaluate(() => document.querySelector(".hm-bans").scrollIntoView({ block: "center", behavior: "instant" })); await wait(200);
    const st = () => page.evaluate(() => { const a = document.querySelector(".hm-ban"), s = getComputedStyle(a); return { bg: s.backgroundColor, tf: s.transform, tr: s.translate, sh: s.boxShadow, dur: s.transitionDuration, gap: (() => { const f = a.querySelectorAll(".hm-ic-f i"); return f[f.length - 1].getBoundingClientRect().left - f[0].getBoundingClientRect().left; })() }; });   // gap = 원 사이 거리 — 벌어짐은 transform(2026-11-20)
    const a = await st();
    await page.hover(".hm-ban"); await wait(500);
    const b = await st();
    await page.mouse.move(0, 0);
    ok("hovering a banner changes its surface color and spreads its icon, without lifting, scaling or shadowing the card (200ms token)",
      a.bg !== b.bg && b.bg === (await tok("--surface-neutral-secondary")) && b.tf === "none" && b.tr === "none" && b.sh === "none" && a.dur === "0.2s" && parseFloat(b.gap) > parseFloat(a.gap), JSON.stringify({ a, b }));
  });

  await part("8 · 링크 대상 있음 · 1920 · 2560 · 390 넘침 없음", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("index.html"); await wait(200);
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("#content a[href]")].map((a) => a.getAttribute("href")));
    const missing = hrefs.filter((h) => !/^https?:/.test(h)).filter((h) => !fs.existsSync(path.join(SITE_DIR, h.split("#")[0])));
    const over = [];
    for (const [w, h] of [[1920, 1080], [2560, 1440], [390, 844]]) { await page.setViewportSize({ width: w, height: h }); await wait(200); const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 1) over.push([w, o]); }
    await page.setViewportSize({ width: 1440, height: 900 });
    ok("every home link points to an existing page and nothing overflows at 1920 · 2560 · 390",
      hrefs.length === 4 && missing.length === 0 && over.length === 0, JSON.stringify({ hrefs, missing, over }));
  });
};
