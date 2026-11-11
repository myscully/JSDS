/* Button 오류 정리(사람의 요청 2026-11-12) — sm 반경 · 끈 버튼 클릭 · 스피너 크기 · loading / 끈 버튼의 hover · Banner 안 상태 · 32 높이 필드 반경. behave.js 가 부른다 */
module.exports = async function buttonFix({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const away = () => page.mouse.move(4, 500);
  const tok = (v) => page.evaluate((x) => { const d = document.createElement("i"); d.style.color = `var(${x})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);

  await go("components/button.html"); await away();
  /* 버튼을 예제 미리보기 안에 넣는다 — 사이트 셸 규칙이 아니라 컴포넌트 CSS 만 받게 */
  const mount = (html) => page.evaluate((html) => { document.getElementById("__bt")?.remove(); const box = document.createElement("div"); box.id = "__bt"; box.style.cssText = "display:flex;gap:16px;padding:16px;flex-wrap:wrap"; box.innerHTML = html; document.querySelector("#ex-button-size .example-preview").append(box); box.scrollIntoView({ block: "center", behavior: "instant" }); window.__parent = 0; box.addEventListener("click", () => window.__parent++); }, html);

  /* ── 끈 버튼을 눌러도 클릭이 부모(행 · 카드)로 떨어지지 않는다 — pointer-events:none 이 있으면 뒤의 요소가 받았다 ── */
  await mount(`<button type="button" class="btn md solid primary" disabled>끔</button><button type="button" class="btn md solid primary" aria-disabled="true">끔2</button><a class="btn md outline assistive" href="#x" aria-disabled="true">링크</a>`);
  const hits = [];
  for (const sel of ["#__bt button[disabled]", "#__bt button[aria-disabled]", "#__bt a"]) {
    const el = page.locator(sel); const bb = await el.boundingBox();
    const top = await page.evaluate(([x, y, s]) => document.elementFromPoint(x, y) === document.querySelector(s), [bb.x + bb.width / 2, bb.y + bb.height / 2, sel]);
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(30);
    hits.push({ sel, top, parent: await page.evaluate(() => window.__parent), cursor: await el.evaluate((e) => getComputedStyle(e).cursor) });
  }
  ok("a disabled · aria-disabled button takes its own click — nothing falls through to the row or card behind it", hits.every((h) => h.top && h.parent === 0 && h.cursor === "not-allowed"), JSON.stringify(hits));

  /* ── 다른 끈 컨트롤도 같다 — Chip(button · span) · Tile · Pagination · 메뉴 항목(li · 링크). pointer-events:none 을 지웠다(2026-11-12):
       클릭이 그 요소에 오고 부모 · 제품 핸들러 · 링크 이동은 없으며, not-allowed 커서가 보이고 hover · 눌림 모양이 없다 ── */
  await mount(`<button type="button" class="chip" aria-pressed="false" disabled id="x1">끈 칩</button><span class="chip" aria-disabled="true" id="x2"><span class="lbl">값</span><button type="button" class="x" aria-label="값 지우기" disabled>×</button></span>`
    + `<div class="tile-grid" style="width:240px"><button type="button" class="tile" disabled id="x3"><b>끈 타일</b><span>설명</span></button></div>`
    + `<nav class="pagination" aria-label="p"><button type="button" aria-label="이전" disabled id="x4">‹</button><button type="button" class="on">1</button></nav>`
    + `<ul class="menu" role="menu" style="position:static"><li class="menu-item" role="menuitem" aria-disabled="true" id="x5">끈 항목</li><li role="none"><a class="menu-item" role="menuitem" href="#moved" aria-disabled="true" id="x6">끈 이동</a></li></ul>`);
  await page.evaluate(() => { window.__own = 0; ["x2", "x5", "x6"].forEach((id) => document.getElementById(id).addEventListener("click", () => window.__own++)); });
  const others = [];
  for (const id of ["x1", "x2", "x3", "x4", "x5", "x6"]) {
    const el = page.locator("#" + id); await away(); await wait(30);
    const look = () => el.evaluate((e) => { const c = getComputedStyle(e); return [c.backgroundColor, c.borderTopColor, c.color, c.boxShadow].join("|"); });
    const bb = await el.boundingBox(), x = bb.x + Math.min(bb.width / 2, 24), y = bb.y + bb.height / 2;
    const rest = await look();
    const top = await page.evaluate(([x, y, id]) => { const t = document.elementFromPoint(x, y); return !!t && t.closest("#" + id) !== null; }, [x, y, id]);
    await page.mouse.move(x, y); await wait(30); const hov = await look(); const cursor = await el.evaluate((e) => getComputedStyle(e).cursor);
    await page.mouse.down(); await wait(30); const act = await look(); await page.mouse.up(); await wait(30);
    others.push({ id, top, cursor, still: rest === hov && rest === act, parent: await page.evaluate(() => window.__parent), own: await page.evaluate(() => window.__own), hash: await page.evaluate(() => location.hash) });
  }
  await away();
  ok("disabled chip · tile · pagination · menu item take their own click — no parent, product handler or link move; not-allowed cursor; no hover or press look", others.every((o) => o.top && o.cursor === "not-allowed" && o.still && o.parent === 0 && o.own === 0 && o.hash !== "#moved"), JSON.stringify(others));

  /* ── loading · 끈 버튼은 hover · 눌림 색이 없다 ── */
  const still = [];
  for (const t of [null, "dark"]) {
    await theme(t); await wait(200);
    for (const cls of ["solid primary", "solid assistive", "outline primary", "outline assistive", "solid negative", "outline negative", "text", "text assistive"]) {
      for (const st of ["loading", "disabled", "aria"]) {
        await mount(`<button type="button" class="btn md ${cls}${st === "loading" ? " loading" : ""}"${st === "disabled" ? " disabled" : st === "aria" ? ' aria-disabled="true"' : ""}>저장</button>`);
        const b = page.locator("#__bt .btn"); await away(); await wait(30);
        const read = () => b.evaluate((e) => { const c = getComputedStyle(e); return [c.backgroundColor, c.borderTopColor, c.color].join(); });
        const rest = await read(); await b.hover({ force: true }); await wait(30); const hov = await read();
        await page.mouse.down(); await wait(30); const act = await read(); await page.mouse.up(); await away();
        if (rest !== hov || rest !== act) still.push({ t, cls, st, rest, hov, act });
      }
    }
  }
  await theme(null); await wait(200);
  ok("loading and disabled buttons keep one colour under hover and press, every form · both themes", still.length === 0, JSON.stringify(still.slice(0, 4)));

  /* ── 스피너 = 그 크기의 아이콘(16 · 18 · 20) ── */
  await mount(["sm", "md", "lg"].map((z) => `<button type="button" class="btn ${z} solid primary loading" aria-busy="true">저장</button><button type="button" class="btn ${z} solid primary icon-only" aria-label="a"><svg width="${{ sm: 16, md: 18, lg: 20 }[z]}" height="${{ sm: 16, md: 18, lg: 20 }[z]}" viewBox="0 0 24 24"></svg></button>`).join(""));
  const spin = await page.evaluate(() => ["sm", "md", "lg"].map((z) => { const s = getComputedStyle(document.querySelector(`#__bt .btn.${z}.loading`), "::after"), ic = document.querySelector(`#__bt .btn.${z}.icon-only svg`).getBoundingClientRect(); const w = parseFloat(s.width) + (s.boxSizing === "border-box" ? 0 : 2 * parseFloat(s.borderTopWidth)); return { z, drawn: w, icon: Math.round(ic.width), sizing: s.boxSizing }; }));
  ok("the loading spinner draws at the icon size of its button: 16 · 18 · 20", spin.every((s, i) => s.drawn === [16, 18, 20][i] && s.icon === s.drawn), JSON.stringify(spin));

  /* ── assistive 스피너 = foreground/brand/primary(면 토큰이던 것), 두 테마 ── */
  const asst = [];
  for (const t of [null, "dark"]) {
    await theme(t); await wait(200);
    await mount(`<button type="button" class="btn md solid assistive loading">a</button><button type="button" class="btn md outline assistive loading">b</button><button type="button" class="btn md text assistive loading">c</button>`);
    const want = await tok("--foreground-brand-primary");
    const got = await page.evaluate(() => [...document.querySelectorAll("#__bt .btn")].map((e) => getComputedStyle(e, "::after").borderTopColor));
    asst.push({ t, want, got });
  }
  await theme(null); await wait(200);
  ok("assistive loading spinners use foreground/brand/primary in both themes", asst.every((a) => a.got.every((g) => g === a.want)), JSON.stringify(asst));
  await page.evaluate(() => document.getElementById("__bt")?.remove());

  /* ── 32 높이 컨트롤은 radius/sm 4 — 필드 · Date Picker · Select Button 안쪽 · Combobox, 40 · 48 은 6 ── */
  const rad = await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-size .example-preview"), box = document.createElement("div");
    box.innerHTML = ["sm", "md", "lg"].map((z) => `<div class="field ${z}" data-z="${z}"><input></div><div class="field ${z}" data-z="${z}"><div class="affix"><input><button type="button" class="reveal" aria-label="보기"></button></div></div>`).join("") + `<div class="select-btn" data-z="sm"><button type="button">a</button><button type="button">b</button></div>`;
    prev.append(box);
    const out = [...box.querySelectorAll(".field > input, .field .affix, .field .reveal, .select-btn button")].map((e) => (e.closest("[data-z]").dataset.z) + ":" + (e.matches(".reveal") ? "reveal" : e.className || e.tagName) + "=" + getComputedStyle(e).borderTopLeftRadius);
    box.remove(); return out;
  });
  const radOk = rad.every((r) => { const [z] = r.split(":"); const v = r.split("=")[1]; return r.includes("reveal") ? (z === "sm" ? v === "4px" : v === "6px") : (z === "sm" ? v === "4px" : v === "6px"); });
  ok("32-high field controls take radius/sm 4 like the sm button, 40 · 48 keep 6", radOk && rad.length === 11, JSON.stringify(rad));

  /* ── 정보 Banner 안 버튼 — loading 은 라벨이 사라지고 끈 버튼은 비활성 색, 포커스 링은 둘 다 보인다 ── */
  await go("components/notification.html"); await away();
  const bb = page.locator(".example-preview .banner .btn").first();
  const label = await tok("--brand-label"), dis = [await tok("--foreground-disable-primary"), await tok("--surface-disable-primary")];
  const bRead = () => bb.evaluate((e) => { const c = getComputedStyle(e); return { color: c.color, bg: c.backgroundColor, border: c.borderTopColor, outline: c.outlineColor, ow: c.outlineWidth, fv: e.matches(":focus-visible") }; });
  const focusKb = async () => { await page.evaluate(() => document.activeElement?.blur()); await bb.evaluate((e) => e.focus()); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(60); };
  await bb.evaluate((e) => { e.classList.add("loading"); e.setAttribute("aria-busy", "true"); }); await focusKb(); const ld = await bRead();
  await bb.evaluate((e) => { e.classList.remove("loading"); e.removeAttribute("aria-busy"); e.setAttribute("aria-disabled", "true"); }); await focusKb(); const ad = await bRead();
  await bb.evaluate((e) => { e.removeAttribute("aria-disabled"); e.disabled = true; }); await wait(300); const dd = await bRead();
  await bb.evaluate((e) => { e.disabled = false; e.blur(); });
  ok("info banner: a loading button hides its label and keeps a visible ring", ld.color === "rgba(0, 0, 0, 0)" && ld.fv && ld.ow === "1px" && ld.outline === label, JSON.stringify(ld));
  ok("info banner: a disabled button takes the outline disabled colours (no face · grey edge · grey label), an aria-disabled one keeps a visible ring", dd.color === dis[0] && dd.bg === "rgba(0, 0, 0, 0)" && dd.border === dis[1] && ad.color === dis[0] && ad.fv && ad.outline === label, JSON.stringify({ dd, ad }));
};
