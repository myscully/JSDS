/* 추가 수정 열하나(2026-11-24) — behave.js 가 부른다. 차트 그라데이션 · 막대 각짐 · 대시보드 기간 · Tab 글자 · Avatar 중립은 각 묶음(behave.chart · dataviz · revise)이 잰다.
   1. 차트 카드 머리의 제목 · 부제 · 동작이 세로 가운데, .chart-figure 안 증감 배지가 값의 세로 가운데
   2. Pagination 의 아이콘 버튼(compact 포함)은 svg 가 버튼 가운데
   3. Card Radio — 고른 카드의 제목만 600
   4. Tree — 고른 항목의 숫자(.tree-meta)는 600 · brand
   5. 개요 목록의 N 배지 — 배지 안 글자가 10px · 배지 글자색, 높이는 배지 하나
   6. Tab 건수 — 탭 목록 템플릿의 목록 탭에는 없고(알림 센터의 안 읽음 탭 건수는 남김) Tab 페이지의 With Count 예제에는 있다
   7. 767 이하의 Page Header — 동작이 제목 아래로 내려가 제목이 낱말 가운데서 끊기지 않음(대시보드 기간 버튼 · 1440 은 그대로 오른쪽) */
module.exports = async function fix24({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.fix24", () => page);

  await part("1 · 차트 머리 · 증감 세로 가운데", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const bad = [], seen = { head: 0, sub: 0, act: 0, delta: 0 };
    for (const p of ["components/data-visual.html", "patterns/dashboard.html", "patterns/analytics.html"]) {
      await go(p); await wait(500);
      const r = await page.evaluate(() => {
        const mid = (e) => { const b = e.getBoundingClientRect(); return b.top + b.height / 2; }, out = [], n = { head: 0, sub: 0, act: 0, delta: 0 };
        for (const h of document.querySelectorAll(".example-preview .chart-head")) {
          if (!h.offsetParent) continue;
          n.head++; const m = mid(h);
          for (const k of [h.querySelector(".chart-title"), h.querySelector(".chart-sub"), h.querySelector(".chart-action")]) {
            if (!k) continue; if (k.matches(".chart-sub")) n.sub++; if (k.matches(".chart-action")) n.act++;
            const d = Math.abs(mid(k) - m); if (d > 0.75) out.push([k.className, +d.toFixed(2)]);
          }
        }
        for (const f of document.querySelectorAll(".example-preview .chart-figure")) {
          const v = f.querySelector(".value"), d = f.querySelector(":scope > .delta"); if (!v || !d || !f.offsetParent) continue;
          n.delta++; const x = Math.abs(mid(d) - mid(v)); if (x > 1) out.push(["delta", +x.toFixed(2)]);
        }
        return { out, n };
      });
      bad.push(...r.out.map((x) => [p, ...x])); for (const k in seen) seen[k] += r.n[k];
    }
    ok("chart card head: title, sub and action sit on one vertical centre (±0.75), and the delta in .chart-figure is centred on the value (±1) — Data Visual · dashboard · analytics",
      !bad.length && seen.head >= 10 && seen.sub >= 1 && seen.act >= 1 && seen.delta >= 1, JSON.stringify({ bad: bad.slice(0, 8), seen }));
  });

  await part("2 · Pagination 아이콘 가운데", async () => {
    const bad = []; let n = 0, compact = 0;
    for (const p of ["components/pagination.html", "components/data-table.html"]) {
      await go(p); await wait(300);
      const r = await page.evaluate(() => [...document.querySelectorAll(".example-preview .pagination button")].filter((b) => b.querySelector(":scope > svg") && !b.textContent.trim() && b.offsetParent).map((b) => {
        const a = b.getBoundingClientRect(), s = b.querySelector(":scope > svg").getBoundingClientRect();
        return { c: b.closest(".pagination").classList.contains("compact"), dx: +Math.abs(a.left + a.width / 2 - (s.left + s.width / 2)).toFixed(2), dy: +Math.abs(a.top + a.height / 2 - (s.top + s.height / 2)).toFixed(2) };
      }));
      n += r.length; compact += r.filter((x) => x.c).length; bad.push(...r.filter((x) => x.dx > 0.5 || x.dy > 0.5).map((x) => [p, x]));
    }
    ok("pagination: every icon button's svg is centred in the button (±0.5), compact included (2026-11-24)", n >= 6 && compact >= 2 && !bad.length, JSON.stringify({ n, compact, bad: bad.slice(0, 6) }));
  });

  await part("3 · Card Radio 고른 제목 600", async () => {
    await go("components/radio-button.html"); await wait(300);
    const read = () => page.evaluate(() => [...document.querySelectorAll("#ex-radio-button-card label.radio.card")].map((l) => {
      const s = l.querySelector(":scope > span"), sm = s.querySelector("small");
      return { on: l.querySelector("input").checked, title: getComputedStyle(s).fontWeight, small: sm ? getComputedStyle(sm).fontWeight : null };
    }));
    const a = await read();
    await page.evaluate(() => { const l = [...document.querySelectorAll("#ex-radio-button-card label.radio.card")].find((x) => !x.querySelector("input").checked); l.querySelector("input").click(); });
    await wait(80);
    const b = await read();
    const okRows = (rs) => rs.length >= 2 && rs.filter((x) => x.on).length === 1 && rs.every((x) => (x.on ? x.title === "600" : x.title !== "600") && (x.small === null || x.small === "400"));
    ok("card radio: only the checked card's title is 600 (description stays 400) and it follows the selection", okRows(a) && okRows(b) && a.findIndex((x) => x.on) !== b.findIndex((x) => x.on), JSON.stringify({ a, b }));
  });

  await part("4 · Tree 고른 항목의 숫자", async () => {
    await go("components/tree.html"); await wait(300);
    const r = await page.evaluate(() => {
      const tk = (v) => { const e = document.createElement("i"); e.style.color = `var(${v})`; document.body.append(e); const c = getComputedStyle(e).color; e.remove(); return c; };
      const tree = document.querySelector("#ex-tree-default .tree");
      const target = [...tree.querySelectorAll(".tree-item")].find((li) => li.getAttribute("aria-selected") !== "true" && li.querySelector(":scope > .tree-row > .tree-meta"));
      target.querySelector(":scope > .tree-row").click();
      const meta = (li) => { const m = li.querySelector(":scope > .tree-row > .tree-meta"), c = getComputedStyle(m); return { w: c.fontWeight, c: c.color }; };
      const other = [...tree.querySelectorAll(".tree-item")].find((li) => li !== target && li.getAttribute("aria-selected") !== "true" && li.getAttribute("aria-disabled") !== "true" && li.querySelector(":scope > .tree-row > .tree-meta"));
      return { sel: target.getAttribute("aria-selected"), on: meta(target), off: meta(other), brand: tk("--foreground-brand-primary"), sec: tk("--foreground-neutral-secondary") };
    });
    ok("tree: the selected item's count is 600 in --foreground-brand-primary, other counts stay 400 secondary (2026-11-24)",
      r.sel === "true" && r.on.w === "600" && r.on.c === r.brand && r.off.w === "400" && r.off.c === r.sec, JSON.stringify(r));
  });

  await part("5 · 개요 목록 N 배지", async () => {
    const bad = []; let n = 0;
    for (const p of ["foundations/overview.html", "templates/overview.html", "home/guide.html"]) {
      await go(p); await wait(200);
      const r = await page.evaluate(() => [...document.querySelectorAll(".base-list .n")].map((b) => {
        const c = getComputedStyle(b), v = b.querySelector('[aria-hidden="true"]'), vc = getComputedStyle(v || b);
        return { fs: c.fontSize, vfs: vc.fontSize, color: c.color, vcolor: vc.color, h: Math.round(b.getBoundingClientRect().height * 10) / 10, text: (v || b).textContent };
      }));
      n += r.length; bad.push(...r.filter((x) => x.fs !== "10px" || x.vfs !== "10px" || x.vcolor !== x.color || x.h > 18 || x.text !== "N").map((x) => [p, x]));
    }
    ok("overview lists: every N badge draws its visible letter at 10px in the badge's text colour and stays one badge high (≤ 18)", n >= 1 && !bad.length, JSON.stringify({ n, bad: bad.slice(0, 4) }));
  });

  await part("6 · Tab 건수는 필요할 때만", async () => {
    await go("templates/screen/tabs-list.html"); await wait(300);
    const t = await page.evaluate(() => ({ tabs: document.querySelectorAll(".tabs .tab").length, count: [...document.querySelectorAll(".tabs .tab .count")].filter((c) => !c.closest(".notify")).length }));
    await go("components/tab.html"); await wait(200);
    const c = await page.evaluate(() => document.querySelectorAll(".example-preview .tabs .tab .count").length);
    ok("tab counts: the tabs-list template shows no count on its list tabs (the notification centre unread tab keeps its own), the Tab page's With Count example still has them", t.tabs >= 2 && t.count === 0 && c >= 2, JSON.stringify({ t, c }));
  });

  await part("7 · 좁은 화면 Page Header", async () => {
    const read = () => page.evaluate(() => [...document.querySelectorAll(".example-preview .page-head")].filter((h) => h.offsetParent && h.querySelector(".actions")).map((h) => {
      const t = h.querySelector(".title"), a = h.querySelector(".actions"), tr = t.getBoundingClientRect(), ar = a.getBoundingClientRect(), lh = parseFloat(getComputedStyle(t).lineHeight);
      return { lines: Math.round(tr.height / lh), below: ar.top >= tr.bottom - 0.5, right: ar.left > tr.right - 0.5, over: Math.round(ar.right - h.getBoundingClientRect().right) };
    }));
    await page.setViewportSize({ width: 390, height: 900 }); await go("patterns/dashboard.html"); await wait(400);
    const n = await read();
    await page.setViewportSize({ width: 1440, height: 900 }); await go("patterns/dashboard.html"); await wait(400);
    const w = await read();
    ok("page header at 390: actions drop below the title so 대시보드 stays one line and nothing overflows; at 1440 they stay to the right of the title (2026-11-24)",
      n.length >= 1 && n.every((x) => x.lines === 1 && x.below && x.over <= 0) && w.length >= 1 && w.every((x) => x.right && x.lines === 1), JSON.stringify({ n, w }));
  });
};
