/* Table · Data Table 최적화(사람의 결정 2026-11-11) — 테두리 없는 표 · 밀도 세 단계 · 행 스타일 · 하위 텍스트 · 첫 열 고정 · 합계 행. behave.js 가 부른다.
   참고: 외부 글(외부 글 번역) — 행 40 · 48 · 56, 셀 좌우 16 이상, 숫자 고정폭 */
module.exports = async function tableOpt({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const tok = (v, p = "color") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const ex = (pg, id) => `#ex-${pg}-${id} .example-preview`;

  /* ── 테두리 · radius 없음, 아래 경계는 마지막 행 선 ── */
  for (const pg of ["data-table", "table"]) {
    await go(`components/${pg}.html`);
    const r = await page.evaluate(() => [...document.querySelectorAll(".example-preview .tbl-wrap")].map((w) => { const s = getComputedStyle(w); return [s.borderTopWidth, s.borderLeftWidth, s.borderTopLeftRadius, s.backgroundColor].join(" "); }));
    ok(`${pg}: table wraps have no border, radius or face`, r.length > 0 && r.every((x) => x === "0px 0px 0px rgba(0, 0, 0, 0)"), JSON.stringify([...new Set(r)]));
  }
  await go("components/data-table.html");
  const [last, line] = await page.evaluate((s) => { const td = document.querySelector(`${s} tbody tr:last-child td`), mid = document.querySelector(`${s} tbody tr:first-child td`), cs = getComputedStyle(td); return [[cs.borderBottomWidth, cs.borderBottomColor], getComputedStyle(mid).borderBottomColor]; }, ex("data-table", "basic"));
  ok("the last row keeps its bottom line as the table's lower edge", last[0] === "1px" && last[1] === line, JSON.stringify({ last, line }));
  const tab = await page.evaluate((s) => getComputedStyle(document.querySelector(`${s} tbody td`)).fontVariantNumeric, ex("data-table", "basic"));
  ok("every table cell uses tabular figures, not only .num", tab === "tabular-nums", tab);

  /* ── 밀도 세 단계 — 툴바 Select Button 이 바꾼다(data-density-for) ── */
  {
    const D = ex("data-table", "density"), btn = (i) => page.locator(`${D} .select-btn button`).nth(i);
    const read = () => page.evaluate((s) => { const t = document.querySelector(`${s} table`); return { cls: [...t.classList].join(" "), td: t.querySelector("tbody td").getBoundingClientRect().height, th: t.querySelector("thead th").getBoundingClientRect().height, pad: getComputedStyle(t.querySelector("tbody td")).paddingLeft }; }, D);
    const base = await read(); await btn(0).click(); await wait(30); const c = await read(); await btn(2).click(); await wait(30); const rl = await read(); await btn(1).click(); await wait(30); const back = await read();
    ok("density: default 48 · compact 40 · relaxed 56 rows, headers 44 · 40 · 48, switched by the toolbar Select Button",
      base.cls === "tbl" && base.td === 48 && base.th === 44 && c.cls === "tbl compact" && c.td === 40 && c.th === 40 && rl.cls === "tbl relaxed" && rl.td === 56 && rl.th === 48 && back.cls === "tbl" && back.td === 48 && [base, c, rl].every((x) => x.pad === "16px"), JSON.stringify({ base, c, rl, back }));
  }

  /* ── 하위 텍스트 ── */
  {
    const sec = await tok("--foreground-neutral-secondary");
    const r = await page.evaluate((s) => { const e = document.querySelector(`${s} .cell-sub`), cs = getComputedStyle(e), td = e.closest("td"); return { d: cs.display, f: cs.fontSize, lh: cs.lineHeight, c: cs.color, below: e.getBoundingClientRect().top >= td.firstChild.parentNode.getBoundingClientRect().top + 16, h: td.getBoundingClientRect().height }; }, ex("data-table", "sub-text"));
    ok("sub-text sits on its own line under the value, 12/16 secondary, in a relaxed 56 row", r.d === "block" && r.f === "12px" && r.lh === "16px" && r.c === sec && r.below && r.h === 56, JSON.stringify({ r, sec }));
  }

  /* ── 첫 열 고정 — 체크박스 칸과 첫 데이터 열이 함께 남고, 불투명하고, 오른쪽 끝에 선 ── */
  {
    const S = ex("data-table", "sticky-col"), surf = await tok("--background-neutral-primary", "backgroundColor");
    const geo = () => page.evaluate((s) => { const w = document.querySelector(`${s} .tbl-wrap`), r = w.querySelector("tbody tr"), x = w.getBoundingClientRect().left; return { scroll: w.scrollWidth > w.clientWidth, left: w.scrollLeft, cells: [...r.children].slice(0, 3).map((c) => Math.round(c.getBoundingClientRect().left - x)), thLeft: Math.round(w.querySelector("thead th:nth-child(2)").getBoundingClientRect().left - x) }; }, S);
    const g0 = await geo(); const dx = await page.locator(`${S} .tbl-wrap`).evaluate((w) => { w.scrollLeft = 120; return w.scrollLeft; }); await wait(30); const g1 = await geo();
    const look = await page.evaluate((s) => { const r = document.querySelector(`${s} tbody tr`), [a, b] = r.children, cs = getComputedStyle(b); return { pos: getComputedStyle(a).position + " " + cs.position, joined: Math.abs(a.getBoundingClientRect().right - b.getBoundingClientRect().left) < 0.5, bg: cs.backgroundColor, shadow: cs.boxShadow, checkShadow: getComputedStyle(a).boxShadow }; }, S);
    await page.locator(`${S} tbody tr`).first().hover(); await wait(30);
    const hov = await page.evaluate((s) => { const b = document.querySelector(`${s} tbody tr`).children[1], cs = getComputedStyle(b); return { bg: cs.backgroundColor, img: cs.backgroundImage }; }, S);
    await page.mouse.move(0, 0);
    ok("sticky column: the check cell and the first column stay put while the rest scroll, opaque, with a line on the right",
      g0.scroll && dx === 120 && g1.left === 120 && g1.cells[0] === g0.cells[0] && g1.cells[1] === g0.cells[1] && g1.cells[2] === g0.cells[2] - 120 && g1.thLeft === g0.thLeft &&
      look.pos === "sticky sticky" && look.joined && look.bg === surf && look.shadow.includes("inset") && look.checkShadow === "none" && hov.bg === surf && hov.img.includes("gradient"), JSON.stringify({ g0, g1, look, hov, surf }));
  }

  /* ── 합계 행 ── */
  {
    const gray = await tok("--background-neutral-secondary", "backgroundColor"), strong = await tok("--line-neutral-primary");
    const r = await page.evaluate((s) => { const t = document.querySelector(`${s} table`), f = t.querySelector("tfoot tr.total td"), l = t.querySelector("tbody tr:last-child td"), cs = getComputedStyle(f); return { w: cs.fontWeight, bg: cs.backgroundColor, top: getComputedStyle(l).borderBottomColor, num: getComputedStyle(t.querySelector("tfoot td.num")).textAlign }; }, ex("data-table", "total"));
    ok("total row: grey face, 600, a stronger line above, numbers right", r.w === "600" && r.bg === gray && r.top === strong && r.num === "right", JSON.stringify({ r, gray, strong }));
  }

  /* ── 행 스타일 — Grid · Plain ── */
  await go("components/table.html");
  {
    const g = await page.evaluate((s) => [...document.querySelector(`${s} tbody tr`).children].map((c) => getComputedStyle(c).borderRightWidth), ex("table", "grid"));
    const gh = await page.evaluate((s) => [...document.querySelector(`${s} thead tr`).children].map((c) => getComputedStyle(c).borderRightWidth), ex("table", "grid"));
    const lastCell = (a) => a.at(-1) === "0px" && a.slice(0, -1).every((x) => x === "1px");
    ok("grid: a line between columns in head and body, none after the last column", lastCell(g) && lastCell(gh), JSON.stringify({ g, gh }));
    const p = await page.evaluate((s) => [...document.querySelectorAll(`${s} tbody td`)].map((c) => getComputedStyle(c).borderBottomWidth), ex("table", "plain"));
    ok("plain: no row lines at all, the header face stays", p.length > 0 && p.every((x) => x === "0px"), JSON.stringify(p));
  }

  /* ── brand 를 뺀 정렬 머리글 · 칸 링크, 늘 있는 액션 바(사람의 결정 2026-11-12) ── */
  {
    await go("components/data-table.html");
    const [pri, ter, brand] = [await tok("--foreground-neutral-primary"), await tok("--foreground-neutral-tertiary"), await tok("--foreground-brand-primary")];
    const r = await page.evaluate((s) => { const th = document.querySelector(`${s} th.sorted`), other = document.querySelector(`${s} th:not(.sorted)`), a = document.querySelector(`${s} td a.link`), td = a.closest("td");
      return { sorted: getComputedStyle(th).color, arrow: getComputedStyle(th, "::after").opacity, other: getComputedStyle(other).color, link: getComputedStyle(a).color, cell: getComputedStyle(td).color, w: getComputedStyle(a).fontWeight }; }, ex("data-table", "basic"));
    ok("sorted header is dark neutral with a solid arrow, never brand", r.sorted === pri && r.sorted !== brand && r.arrow === "1" && r.other === ter, JSON.stringify({ r, pri, ter }));
    await page.hover(`${ex("data-table", "basic")} td a.link`);
    const hov = await page.evaluate((s) => getComputedStyle(document.querySelector(`${s} td a.link`)).textDecorationLine, ex("data-table", "basic"));
    ok("a link in a cell takes the cell's text colour, 500, underline on hover", r.link === r.cell && r.link !== brand && r.w === "500" && hov === "underline", JSON.stringify({ r, hov }));

    const S = ex("data-table", "selectable");
    const bar = await page.evaluate((s) => { const b = document.querySelector(`${s} .action-bar`), cs = getComputedStyle(b), w = b.closest(".tbl-wrap"), t = w.querySelector("table");
      return { bg: cs.backgroundColor, shown: !b.hidden && b.getBoundingClientRect().height > 0, above: b.getBoundingClientRect().bottom <= t.getBoundingClientRect().top + 1 }; }, S);
    ok("selection bar has no face and sits above the table", bar.bg === "rgba(0, 0, 0, 0)" && bar.shown && bar.above, JSON.stringify(bar));
    const hit = await page.evaluate((s) => { const w = document.querySelector(s); window.__barHit = 0; w.querySelectorAll(".action-bar .btn").forEach((b) => b.addEventListener("click", () => window.__barHit++));
      w.querySelectorAll("tbody td.check input:checked").forEach((i) => i.click()); const b = w.querySelector(".action-bar"), btn = b.querySelector(".btn");
      return { shown: !b.hidden && b.getBoundingClientRect().height > 0, text: b.querySelector("b").textContent, off: [...b.querySelectorAll(".btn")].map((x) => x.getAttribute("aria-disabled")), dis: btn.disabled, face: getComputedStyle(btn).borderColor, fg: getComputedStyle(btn).color }; }, S);
    const disFg = await tok("--foreground-disable-primary");
    await page.locator(`${S} .action-bar .btn`).first().focus(); await page.keyboard.press("Enter"); await page.keyboard.press("Space"); await wait(30);
    const kb = await page.evaluate((s) => ({ hits: window.__barHit, focus: document.activeElement === document.querySelector(`${s} .action-bar .btn`) }), S);
    ok("with nothing picked the bar stays: '0개 선택', buttons aria-disabled in disabled colours, still focusable, Enter and Space reach no handler",
      hit.shown && hit.text === "0개 선택" && hit.off.every((x) => x === "true") && !hit.dis && hit.fg === disFg && kb.hits === 0 && kb.focus, JSON.stringify({ hit, kb, disFg }));
    const back = await page.evaluate((s) => { const w = document.querySelector(s); w.querySelector("tbody td.check input").click(); const b = w.querySelector(".action-bar");
      const r = { text: b.querySelector("b").textContent, off: [...b.querySelectorAll(".btn")].map((x) => x.getAttribute("aria-disabled")) }; b.querySelector(".btn").click(); r.hits = window.__barHit; return r; }, S);
    ok("picking a row turns the bar's buttons back on", back.text === "1개 선택" && back.off.every((x) => x === null) && back.hits === 1, JSON.stringify(back));
    const own = await page.evaluate((s) => { const w = document.querySelector(s), b = w.querySelector(".action-bar .btn:last-child"); b.setAttribute("aria-disabled", "true");
      w.querySelectorAll("tbody td.check input:checked").forEach((i) => i.click()); w.querySelector("tbody td.check input").click(); const r = b.getAttribute("aria-disabled") === "true"; b.removeAttribute("aria-disabled"); return r; }, S);
    ok("a button the product turned off stays off after the selection changes", own, String(own));
    const fresh = await page.evaluate(() => { const d = document.createElement("div");
      d.innerHTML = '<div class="tbl-wrap"><div class="action-bar"><b>0개 선택</b><span class="spacer"></span><button type="button" class="btn sm outline assistive">내보내기</button></div><table class="tbl"><thead><tr><th class="check"><label class="checkbox"><input type="checkbox" aria-label="전체 선택"></label></th><th>이름</th></tr></thead><tbody><tr><td class="check"><label class="checkbox"><input type="checkbox" aria-label="가 선택"></label></td><td>가</td></tr></tbody></table></div>';
      document.body.append(d); window.DS.init(d); const r = d.querySelector(".action-bar .btn").getAttribute("aria-disabled"); d.remove(); return r; });
    ok("a selection table drawn with nothing picked starts with its bar buttons off", fresh === "true", String(fresh));
  }
};
