/* Chip 형태 둘 · 색 둘(사람의 결정 2026-11-13) — Outline(기본) · Solid, brand(기본) · neutral. 고른 칩은 두 형태가 같은 진한 면이고 색은 고른 모양만 바꾼다.
   입력값 칩은 형태만 받는다(색 중립 고정 — verify 가 고를 수 없는 칩의 .on · .neutral 을 막는다). behave.js 가 부른다 */
module.exports = async function chip({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const look = (sel) => page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const c = getComputedStyle(e); return { bg: c.backgroundColor, bd: c.borderTopColor, bw: c.borderTopWidth, fg: c.color, h: e.getBoundingClientRect().height }; }), sel);
  const O = "#ex-chip-outline .example-preview", S = "#ex-chip-solid .example-preview";
  /* 포인터를 칩 밖으로 — hover 면이 섞이지 않게 */
  const away = () => page.mouse.move(2, 2);

  await go("components/chip.html"); await away(); await wait(150);
  for (const t of [null, "dark"]) {
    await theme(t); await wait(700);   // 칩 면 전환(--motion-fast)과 사이트의 테마 전환이 끝난 뒤
    const nm = t || "light";
    const W = { line: await tok("--line-neutral-primary", "borderTopColor"), elev: await tok("--surface-elevated-primary"), tert: await tok("--surface-neutral-tertiary"),
      brand: await tok("--surface-brand-primary"), label: await tok("--brand-label", "color"), inv: await tok("--surface-neutral-inverse"), invFg: await tok("--foreground-neutral-inverse", "color"), fg: await tok("--foreground-neutral-primary", "color") };
    const oOff = await look(`${O} .chip:not(.on)`), sOff = await look(`${S} button.chip[aria-pressed]:not(.on)`);
    ok(`chip ${nm}: outline off = gray line on the elevated face, solid off = tertiary face with a transparent 1px line, same 32 height`,
      oOff.length === 2 && oOff.every((c) => c.bd === W.line && c.bg === W.elev && c.fg === W.fg && c.h === 32) &&
      sOff.length === 2 && sOff.every((c) => c.bg === W.tert && c.bd === "rgba(0, 0, 0, 0)" && c.bw === "1px" && c.fg === W.fg && c.h === 32), JSON.stringify({ oOff, sOff, W }));
    const on = async (box, neutral) => look(`${box} .chip.on${neutral ? ".neutral" : ":not(.neutral)"}`);
    const ob = await on(O, false), sb = await on(S, false), on_ = await on(O, true), sn = await on(S, true);
    const same = (a, b) => a.length === 2 && b.length === 2 && JSON.stringify(a) === JSON.stringify(b);
    ok(`chip ${nm}: selected brand is the same solid face in outline and solid (surface/brand/primary + brand-label)`,
      same(ob, sb) && ob.every((c) => c.bg === W.brand && c.bd === W.brand && c.fg === W.label), JSON.stringify({ ob, sb }));
    ok(`chip ${nm}: selected neutral is the same inverse face in outline and solid`,
      same(on_, sn) && on_.every((c) => c.bg === W.inv && c.bd === W.inv && c.fg === W.invFg), JSON.stringify({ on_, sn }));
    /* 체크 표시는 글자색을 따라간다 */
    const chk = await page.evaluate((s) => [...document.querySelectorAll(s)].every((e) => getComputedStyle(e, "::before").backgroundColor === getComputedStyle(e).color), `${O} .chip.on, ${S} .chip.on`);
    ok(`chip ${nm}: the check on a selected chip takes the label color`, chk);
  }
  await theme(null); await wait(200);

  /* hover — 고르지 않은 칩은 두 형태 모두 secondary 면, 고른 칩은 그대로 */
  const sec = await tok("--surface-neutral-secondary");
  const hov = async (sel) => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded(); const before = (await look(sel))[0].bg; await l.hover(); await wait(200); const r = await l.evaluate((e) => getComputedStyle(e).backgroundColor); await away(); await wait(200); return { before, r }; };
  const hs = await hov(`${S} button.chip.solid:not(.on)`), ho = await hov(`${O} button.chip:not(.on)`), hon = await hov(`${S} .chip.on.neutral`);
  ok("chip: hover on an unselected chip is surface/neutral/secondary in both forms, a selected chip keeps its face", hs.r === sec && ho.r === sec && hon.r === hon.before, JSON.stringify({ hs, ho, hon, sec }));

  /* Solid 입력값 칩 · 동작 칩 — 회색 면, 선택 없음 */
  const tert = await tok("--surface-neutral-tertiary");
  const si = await look(`${S} span.chip.solid, ${S} button.chip.solid:not([aria-pressed])`);
  ok("chip: a solid input chip and the solid add chip sit on the tertiary face", si.length === 3 && si.every((c) => c.bg === tert && c.h === 32), JSON.stringify(si));

  /* 끈 칩은 형태 · 색 · 선택과 상관없이 비활성 면 — :where 로 명시도를 눌러 둔 것을 잰다 */
  const off = await page.evaluate(() => { const b = document.createElement("div"); b.className = "example-preview"; b.innerHTML = '<button class="chip solid neutral on" aria-pressed="true" disabled>a</button><button class="chip on" aria-pressed="true" disabled>b</button><button class="chip solid" aria-pressed="false" disabled>c</button>';
    document.querySelector("#content").append(b); const r = [...b.children].map((e) => getComputedStyle(e).backgroundColor); b.remove(); return r; });
  const dis = await tok("--surface-disable-primary");
  ok("chip: a disabled chip uses the disable face whatever its form, color or selection", off.every((c) => c === dis), JSON.stringify({ off, dis }));
};
