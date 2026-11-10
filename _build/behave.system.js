/* 모션 · 한 시스템 · 패턴 정렬 단정(2026-11-05) — behave.js 가 부른다.
   taste-skill 2.5.0(MIT, github.com/Leonxlnx/taste-skill)의 references/motion.md · references/system.md · scripts/consistency.mjs
   (edges · row-lines · spill · button-styles · card-family · nesting · link-styles)를 콘솔 패턴에 맞게 옮겼다. 코드는 가져오지 않고 규칙만.
   가져오지 않은 것(무작위 토큰 · 보라 금지 · 아코디언 금지 · 13px · 44px · 사진 · 효과 · 한 섹션 한 화면)과 이유는 CLAUDE.md 에 있다 */
const fs = require("fs");

const PATTERNS = ["dashboard", "empty-state", "input-form", "log-viewer", "notes", "onboarding", "policy-settings", "search", "severity", "system-status", "terms-agreement"];
const MOTION_MS = ["120ms", "200ms", "320ms"];   // --motion-fast · base · slow
/* .btn 이 아닌 button 은 이 컴포넌트 안에서만 — 각자 정의된 모양이 있다 */
const BUTTON_HOSTS = ["th.sortable", ".select-btn", ".chip-group", ".chip", ".toast", ".banner", ".pagination", ".dropdown", ".datepicker", ".tile-grid", ".terms .item"];
/* Button 정의의 클래스. 무리마다 하나까지. left 는 폼 액션 줄의 배치 클래스(.form .form-actions .left) */
const BTN_GROUPS = { size: ["sm", "md", "lg"], variant: ["solid", "outline", "text"], color: ["primary", "assistive", "negative"], mod: ["icon-only", "loading", "block", "left"] };

module.exports = async ({ b, ok, SITE, path }) => {
  const url = (p) => "file://" + path.join(SITE, p);
  const pages = ["index.html", ...["components", "patterns"].flatMap((d) => fs.readdirSync(path.join(SITE, d)).filter((f) => f.endsWith(".html")).map((f) => `${d}/${f}`))];

  /* ── 모션 ── */
  const durations = async (reducedMotion) => {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion }); const page = await ctx.newPage(); const bad = [];
    for (const p of pages) {
      await page.goto(url(p)); await page.waitForTimeout(100);
      const r = await page.evaluate((allowed) => { const out = [];
        document.querySelectorAll("*").forEach((e) => { for (const pse of [null, "::before", "::after"]) { const s = getComputedStyle(e, pse);
          const tag = e.tagName.toLowerCase() + (e.classList[0] ? "." + e.classList[0] : "") + (pse || "");
          for (const d of s.transitionDuration.split(",").map((x) => x.trim())) if (d !== "0s" && (allowed === null || !allowed.includes(Math.round(parseFloat(d) * 1000) + "ms"))) out.push(`${tag} transition ${d}`);
          if (allowed === null && s.animationName !== "none" && s.animationName !== "spin" && s.animationDuration !== "0s") out.push(`${tag} animation ${s.animationName}`); } });
        return [...new Set(out)].slice(0, 3); }, reducedMotion === "reduce" ? null : MOTION_MS);
      if (r.length) bad.push(`${p}: ${r.join(", ")}`);
    }
    await ctx.close(); return bad;
  };
  const off = await durations("no-preference");
  ok("motion: every transition runs on a --motion-* duration (120 · 200 · 320ms)", off.length === 0, off.slice(0, 4).join(" | "));
  const still = await durations("reduce");
  ok("motion: reduced motion stops every transition and animation except the spinning loaders, pseudo-elements included", still.length === 0, still.slice(0, 4).join(" | "));
  {  /* 줄인 모션의 예외(사람의 결정 2026-11-10) — 멈춘 스피너는 고장으로 보인다. Skeleton · 맥박은 멈춘다 */
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const page = await ctx.newPage(); const name = (sel, pse) => page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s), p).animationName, [sel, pse || null]);
    await page.goto(url("components/loading.html")); await page.waitForTimeout(100); const sp = await name(".example-preview .spinner"), sk = await name(".example-preview .skeleton");
    await page.goto(url("components/button.html")); await page.waitForTimeout(100); const bt = await name(".example-preview .btn.loading", "::after");
    await page.goto(url("components/switch.html")); await page.waitForTimeout(100); await page.evaluate(() => { const i = document.querySelector(".example-preview .switch input"); i.setAttribute("aria-busy", "true"); }); const sw = await name('.example-preview .switch input[aria-busy="true"]', "::before");
    await page.goto(url("components/indicator.html")); await page.waitForTimeout(100); const pulse = await page.evaluate(() => { const hit = [...document.querySelectorAll(".example-preview *")].flatMap((e) => [getComputedStyle(e).animationName, getComputedStyle(e, "::before").animationName, getComputedStyle(e, "::after").animationName]); return hit.filter((x) => x !== "none"); });
    ok("motion: reduced motion keeps the spinner, button loading and switch busy turning, and stops skeleton and pulse", sp === "spin" && bt === "spin" && sw === "spin" && sk === "none" && pulse.length === 0, JSON.stringify({ sp, bt, sw, sk, pulse }));
    await ctx.close();
  }

  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage(); const moved = [];
    for (const [p, sel] of [["components/button.html", ".example-preview .btn.solid.primary:not([disabled]):not(.loading)"], ["components/button.html", ".example-preview .btn.outline.assistive:not([disabled])"], ["components/card.html", ".example-preview .card.clickable:not(.on)"], ["components/card.html", ".example-preview .card.clickable.on"]]) {
      await page.goto(url(p)); await page.waitForTimeout(100);
      const el = page.locator(sel).first(); if (!(await el.count())) { moved.push(`${sel} 없음`); continue; }
      await el.scrollIntoViewIfNeeded(); const r0 = await el.boundingBox();
      await el.hover(); await page.waitForTimeout(250); const h = await el.evaluate((e) => getComputedStyle(e).transform); const r1 = await el.boundingBox();
      await page.mouse.down(); await page.waitForTimeout(150); const a = await el.evaluate((e) => getComputedStyle(e).transform); const r2 = await el.boundingBox(); await page.mouse.up();
      const same = (x, y) => Math.abs(x.x - y.x) < 0.5 && Math.abs(x.y - y.y) < 0.5 && Math.abs(x.width - y.width) < 0.5;
      if (h !== "none" || a !== "none" || !same(r0, r1) || !same(r0, r2)) moved.push(`${sel} hover=${h} active=${a}`);
      await page.mouse.move(0, 0);
    }
    ok("motion: buttons and cards answer hover and press with colour only (no transform, no shift)", moved.length === 0, moved.join(" | "));
    await ctx.close();
  }

  /* ── 한 시스템 · 정렬(패턴) ── */
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
  const sys = { radius: [], button: [], vocab: [], primary: [], nest: [], links: new Set() };
  for (const name of PATTERNS) {
    await page.goto(url(`patterns/${name}.html`)); await page.waitForTimeout(150);
    const r = await page.evaluate(({ hosts, groups }) => {
      const root = getComputedStyle(document.documentElement);
      const tok = ["xs", "sm", "md", "lg", "xl", "full"].map((k) => parseFloat(root.getPropertyValue("--radius-" + k)));
      /* 토큰 − 보더 두께는 보더 있는 둥근 조상 바로 안쪽 면에만 허용한다(Accordion 의 summary 7 = 8 − 1). 그냥 '토큰 − 1' 을 허용하면 5(= 6 − 1)가 통과한다 */
      const inner = (v, e) => { for (let a = e.parentElement; a; a = a.parentElement) { const s = getComputedStyle(a), r = parseFloat(s.borderTopLeftRadius); if (r) return tok.includes(r) && Math.abs(r - parseFloat(s.borderTopWidth) - v) < 0.01; } return false; };
      const okR = (v, e) => v === 0 || v >= 900 || tok.some((t) => Math.abs(v - t) < 0.01) || inner(v, e);
      const tag = (e) => e.tagName.toLowerCase() + (e.classList.length ? "." + [...e.classList].join(".") : "");
      const out = { radius: [], button: [], vocab: [], primary: [], nest: [], links: [] };
      const vocab = Object.values(groups).flat().concat("btn");
      document.querySelectorAll(".example-preview").forEach((pv) => {
        pv.querySelectorAll("*").forEach((e) => { if (!e.getClientRects().length) return; const s = getComputedStyle(e);
          for (const k of ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"]) { const v = s[k]; if (v.includes("%")) continue; if (!okR(parseFloat(v), e)) out.radius.push(`${tag(e)} ${v}`); } });
        pv.querySelectorAll("button, a[role=button]").forEach((e) => { if (!e.classList.contains("btn") && !hosts.some((h) => e.closest(h))) out.button.push(tag(e)); });
        pv.querySelectorAll(".btn").forEach((e) => { const cl = [...e.classList]; const stray = cl.filter((c) => !vocab.includes(c)); const dup = Object.entries(groups).filter(([, g]) => cl.filter((c) => g.includes(c)).length > 1).map(([n]) => n);
          if (stray.length || dup.length) out.vocab.push(`${tag(e)}${stray.length ? " 정의 밖 " + stray : ""}${dup.length ? " 중복 " + dup : ""}`); });
        const scope = ".card, form, [role=dialog], .popup";
        pv.querySelectorAll(scope).forEach((c) => { const n = [...c.querySelectorAll(".btn.solid.primary")].filter((x) => x.closest(scope) === c).length; if (n > 1) out.primary.push(`${tag(c)} ×${n}`); });
        pv.querySelectorAll(".card .card .card").forEach((c) => out.nest.push(tag(c)));
        pv.querySelectorAll("a:not(.btn)").forEach((a) => { if (a.closest("nav, .breadcrumb, .tabs, .pagination, .menu, .lnb, .sidebar")) return; const s = getComputedStyle(a); out.links.push(`${s.color}|${s.textDecorationLine}`); });
      });
      return out;
    }, { hosts: BUTTON_HOSTS, groups: BTN_GROUPS });
    for (const k of ["radius", "button", "vocab", "primary", "nest"]) for (const x of [...new Set(r[k])]) sys[k].push(`${name}: ${x}`);
    r.links.forEach((l) => sys.links.add(l));
  }
  ok("one system: pattern radii are --radius-* tokens (or token − border just inside a bordered rounded parent)", sys.radius.length === 0, sys.radius.slice(0, 4).join(" | "));
  ok("one system: every pattern button is a .btn or belongs to a defined component", sys.button.length === 0, sys.button.slice(0, 4).join(" | "));
  ok("one system: .btn classes come from the Button definition, one per group", sys.vocab.length === 0, sys.vocab.slice(0, 4).join(" | "));
  ok("one system: at most one solid primary per card · form · dialog", sys.primary.length === 0, sys.primary.join(" | "));
  ok("one system: cards nest two deep at most", sys.nest.length === 0, sys.nest.join(" | "));
  ok("one system: body links share one look across patterns", sys.links.size <= 1, [...sys.links].join(" · "));

  const align = { edges: [], rows: [], spill: [] };
  for (const w of [1440, 1024, 768]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const name of PATTERNS) {
      await page.goto(url(`patterns/${name}.html`)); await page.waitForTimeout(250);   // 차트 캔버스가 폭을 잡을 때까지
      const r = await page.evaluate(() => {
        const tag = (e) => e.tagName.toLowerCase() + (e.classList.length ? "." + [...e.classList].join(".") : "");
        const shown = (k) => k.getClientRects().length && getComputedStyle(k).position !== "absolute";
        const out = { edges: [], rows: [], spill: [] };
        document.querySelectorAll(".example-preview").forEach((pv, i) => {
          const ps = getComputedStyle(pv), P = pv.getBoundingClientRect();
          const inL = P.left + parseFloat(ps.paddingLeft) + parseFloat(ps.borderLeftWidth), inR = P.right - parseFloat(ps.paddingRight) - parseFloat(ps.borderRightWidth);
          /* 쌓인 블록: 최상위가 하나면 그 래퍼의 자식. 왼쪽 선이 같거나(왼쪽 정렬) 가운데 선이 같아야(가운데 정렬) 한다 */
          let host = pv, blocks = [...pv.children].filter(shown);
          if (blocks.length === 1) { host = blocks[0]; blocks = [...host.children].filter(shown); }
          const hs = getComputedStyle(host);
          if (blocks.length > 1 && hs.display !== "grid" && !(hs.display.includes("flex") && hs.flexDirection.startsWith("row"))) {
            const q = blocks.map((k) => k.getBoundingClientRect()); const spread = (a) => Math.max(...a) - Math.min(...a);
            if (spread(q.map((x) => x.left)) > 1 && spread(q.map((x) => (x.left + x.right) / 2)) > 1) out.edges.push(`ex${i} ${blocks.map((k, j) => tag(k) + "@" + Math.round(q[j].left)).join(" ")}`);
          }
          /* 같은 줄(위 끝 차이 < 40)의 카드는 위 끝 · 높이가 같다 */
          pv.querySelectorAll("*").forEach((c) => { const s = getComputedStyle(c); if (!(s.display === "grid" || (s.display.includes("flex") && s.flexDirection.startsWith("row")))) return;
            const q = [...c.children].filter((k) => (k.classList.contains("card") || k.classList.contains("chart-card")) && shown(k)).map((k) => k.getBoundingClientRect()); const used = new Set();
            q.forEach((x, a) => { if (used.has(a)) return; const g = q.map((y, j) => [y, j]).filter(([y]) => Math.abs(y.top - x.top) < 40); g.forEach(([, j]) => used.add(j)); if (g.length < 2) return;
              const tops = g.map(([y]) => y.top), hts = g.map(([y]) => y.height);
              if (Math.max(...tops) - Math.min(...tops) > 1 || Math.max(...hts) - Math.min(...hts) > 1) out.rows.push(`ex${i} ${tag(c)} 위 ${tops.map(Math.round)} 높이 ${hts.map(Math.round)}`); }); });
          /* 넘침: 잘라 내는 조상(overflow ≠ visible)이 없는 요소가 미리보기 안쪽 선을 넘는다 */
          pv.querySelectorAll("*").forEach((c) => { if (!c.getClientRects().length) return; for (let a = c.parentElement; a && a !== pv; a = a.parentElement) if (getComputedStyle(a).overflowX !== "visible") return;
            const q = c.getBoundingClientRect(); if (q.width && (q.right > inR + 1 || q.left < inL - 1)) out.spill.push(`ex${i} ${tag(c)} ${Math.round(q.left - inL)}/${Math.round(q.right - inR)}`); });
        });
        return { edges: out.edges, rows: [...new Set(out.rows)], spill: out.spill.slice(0, 3) };
      });
      for (const k of ["edges", "rows", "spill"]) for (const x of r[k]) align[k].push(`${w} ${name} ${x}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  ok("alignment: stacked pattern blocks share a left edge or a centre line (1440 · 1024 · 768)", align.edges.length === 0, align.edges.slice(0, 3).join(" | "));
  ok("alignment: cards in one row share top and height (1440 · 1024 · 768)", align.rows.length === 0, align.rows.slice(0, 3).join(" | "));
  ok("alignment: nothing spills past the pattern preview (1440 · 1024 · 768)", align.spill.length === 0, align.spill.slice(0, 3).join(" | "));
  await ctx.close();
};
