/* 2026-11-13 수정 묶음(사람의 요청) — behave.js 가 부른다.
   Tab 글자 16 · sm 14, Top Navigation 선택 = 제품 색 면, Notice · Banner 아이콘 filled, 고정폭 글자는 Code 에만. */
module.exports = async function revise({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);

  /* Tab — 기본 Body 1/Normal 16/24 · 높이 44, sm Label 1/Normal 14/20 · 높이 38, pill 탭 16/24 · 34 */
  await go("components/tab.html");
  const tab = await page.evaluate(() => {
    const f = (e) => { const c = getComputedStyle(e); return `${parseFloat(c.fontSize)}/${parseFloat(c.lineHeight)}/${+(parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(4)}`; };
    const base = document.querySelector("#ex-tab-default .tabs"), pill = document.querySelector("#ex-tab-pill .tabs.pill");
    /* sm 은 예제가 없어 기본 예제를 복제해 잰다 */
    const sm = base.cloneNode(true); sm.classList.add("sm"); sm.removeAttribute("id"); base.parentElement.append(sm);
    const r = { base: f(base.querySelector(".tab")), baseH: Math.round(base.getBoundingClientRect().height * 10) / 10,
      sm: f(sm.querySelector(".tab")), smH: Math.round(sm.getBoundingClientRect().height * 10) / 10,
      pill: f(pill.querySelector(".tab")), pillTab: Math.round(pill.querySelector(".tab").getBoundingClientRect().height * 10) / 10 };
    sm.remove(); return r;
  });
  ok("tab text is Body 1/Normal 16/24 at height 44, sm is Label 1/Normal 14/20 at 38, pill tabs are 16/24 at 34 (2026-11-13)",
    tab.base === "16/24/0.0057" && tab.baseH === 44 && tab.sm === "14/20/0.0145" && tab.smH === 38 && tab.pill === "16/24/0.0057" && tab.pillTab === 34, JSON.stringify(tab));

  /* Top Navigation — 선택 메뉴는 brand 글자 + 아래 2px brand 선, 면 없음, hover 해도 같다(2026-11-14 — 11-13 의 제품 색 면을 바꿈).
     다른 메뉴는 투명 2px 선이라 글자 줄이 같고, 메뉴 사이 8 · 모서리 0 */
  await go("components/top-navigation.html");
  for (const t of [null, "dark"]) {
    await theme(t); await wait(400);
    const B = await tok("--foreground-brand-primary", "color");
    const on = page.locator("#ex-top-navigation-basic .topbar nav a.on").first();
    const look = () => on.evaluate((a) => { const c = getComputedStyle(a); return { bg: c.backgroundColor, fg: c.color, bw: c.borderBottomWidth, bs: c.borderBottomStyle, bc: c.borderBottomColor, r: c.borderTopLeftRadius }; });
    await page.mouse.move(2, 2); await wait(200); const rest = await look();
    await on.hover(); await wait(200); const hov = await look();
    const nav = await page.locator("#ex-top-navigation-basic .topbar nav").first().evaluate((n) => {
      const a = [...n.querySelectorAll("a")], off = a.find((x) => !x.classList.contains("on")), c = getComputedStyle(off);
      return { gap: getComputedStyle(n).columnGap, offB: c.borderBottomWidth + " " + c.borderBottomStyle + " " + c.borderBottomColor, radii: a.map((x) => getComputedStyle(x).borderTopLeftRadius).every((v) => v === "0px"),
        tops: new Set(a.map((x) => Math.round(x.getBoundingClientRect().top))).size, heights: new Set(a.map((x) => Math.round(x.getBoundingClientRect().height))).size };
    });
    const same = (x) => x.fg === B && x.bc === B && x.bw === "2px" && x.bs === "solid" && x.bg === "rgba(0, 0, 0, 0)" && x.r === "0px";
    ok(`top navigation ${t || "light"}: the selected item is brand text with a 2px brand bottom line and no face, hover keeps it; other items carry a transparent 2px line, gap 8, no radius`,
      same(rest) && same(hov) && nav.gap === "8px" && nav.offB === "2px solid rgba(0, 0, 0, 0)" && nav.radii && nav.tops === 1 && nav.heights === 1, JSON.stringify({ rest, hov, nav, B }));
  }
  await theme(null);

  /* Tag sm = Caption 2 11/14 · 위아래 2 · 좌우 8 — 높이는 18 그대로(2026-11-14 사람의 결정, 12/16 + 1 이었다) */
  await go("components/tag.html");
  const tsm = await page.evaluate(() => [...document.querySelectorAll("#ex-tag-size .example-preview .tag.sm, #ex-tag-size .tag.sm")].map((e) => { const c = getComputedStyle(e); return [parseFloat(c.fontSize), parseFloat(c.lineHeight), c.paddingTop, c.paddingLeft, Math.round(e.getBoundingClientRect().height * 10) / 10].join("/"); }));
  ok("tag sm is Caption 2 11/14 with padding 2/8 at height 18 (2026-11-14)", tsm.length > 0 && tsm.every((v) => v === "11/14/2px/8px/18"), JSON.stringify(tsm));

  /* Count 점은 숫자 배지보다 모서리 안쪽 — 감싼 틀에서 위 -2 · 오른쪽 -2(2026-11-14 사람의 결정), 숫자는 -6 그대로 */
  await go("components/indicator.html");
  const dot = await page.evaluate(() => [...document.querySelectorAll(".example-preview .with-count")].map((w) => { const c = w.querySelector(".count"), a = w.getBoundingClientRect(), b = c.getBoundingClientRect(); return { dot: c.classList.contains("dot"), top: Math.round(b.top - a.top), right: Math.round(a.right - b.right) }; }));
  ok("count dot sits 2px outside the wrapper corner, the numeric badge 6px (2026-11-14)",
    dot.some((d) => d.dot) && dot.some((d) => !d.dot) && dot.every((d) => d.dot ? d.top === -2 && d.right === -2 : d.top === -6 && d.right === -6), JSON.stringify(dot));

  /* Notice · Banner 아이콘은 filled — 정적 예제와 ds.js 가 만드는 폼 오류 요약까지(Toast 는 그대로) */
  await go("components/notification.html");
  const ico = await page.evaluate(() => {
    const filled = (s) => !!s && s.getAttribute("fill") === "currentColor" && !s.getAttribute("stroke");
    const n = [...document.querySelectorAll(".example-preview .notice > .ico > svg")], b = [...document.querySelectorAll(".example-preview .banner > svg")], t = [...document.querySelectorAll(".example-preview .toast > .ico > svg")];
    return { notice: n.length, nf: n.filter(filled).length, banner: b.length, bf: b.filter(filled).length, toastOutline: t.length > 0 && t.every((s) => !filled(s)) };
  });
  await go("patterns/input-form.html");
  /* 정적 요약을 지우고 비운 채 제출 — ds.js 가 요약을 새로 만든다(3개 이상일 때) */
  await page.locator("form[data-validate]").first().evaluate((f) => { f.querySelectorAll("[data-form-summary]").forEach((x) => x.remove()); f.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea").forEach((i) => { i.value = ""; }); f.requestSubmit(); }); await wait(200);
  const sum = await page.evaluate(() => { const s = document.querySelector("[data-form-summary] > .ico > svg"); return s ? s.getAttribute("fill") === "currentColor" && !s.getAttribute("stroke") : null; });
  ok("notice and banner icons are filled — static examples and the generated form summary; toast stays outline (2026-11-13)",
    ico.notice >= 4 && ico.nf === ico.notice && ico.banner >= 1 && ico.bf === ico.banner && ico.toastOutline && sum === true, JSON.stringify({ ico, sum }));

  /* Tag — 중립 면 tertiary · info 면 secondary, outline 테두리 = 그 톤의 선 토큰(라이트 · 다크) */
  await go("components/tag.html");
  for (const t of [null, "dark"]) {
    await theme(t); await wait(400);
    const LINE = { critical: "--line-negative-primary", high: "--line-cautionary-primary", medium: "--line-accent-light-blue", low: "--line-accent-lime", pending: "--line-accent-cyan", ok: "--line-positive-primary", accent: "--line-brand-primary", info: "--line-neutral-primary", "": "--line-neutral-primary" };
    const r = await page.evaluate((LINE) => {
      const box = document.querySelector("#ex-tag-style .example-preview"), res = (v, p) => { const d = document.createElement("div"); d.style[p] = v; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; };
      const out = {};
      for (const [tone, tok] of Object.entries(LINE)) {
        const e = document.createElement("span"); e.className = `tag outline ${tone}`.trim(); e.textContent = "x"; box.append(e);
        const sh = getComputedStyle(e).boxShadow; out[tone || "neutral"] = sh.includes(res(`var(${tok})`, "color")) && getComputedStyle(e).backgroundColor === "rgba(0, 0, 0, 0)"; e.remove();
      }
      const n = document.querySelector("#ex-tag-default .example-preview .tag"), i = document.createElement("span"); i.className = "tag info"; i.textContent = "x"; box.append(i);
      out.neutralFace = getComputedStyle(n).backgroundColor === res("var(--surface-neutral-tertiary)", "backgroundColor");
      out.infoFace = getComputedStyle(i).backgroundColor === res("var(--surface-neutral-secondary)", "backgroundColor"); i.remove();
      return out;
    }, LINE);
    ok(`tag ${t || "light"}: neutral face is tertiary, info face is secondary, each outline border is its tone's line token (2026-11-13)`, Object.values(r).every(Boolean), JSON.stringify(r));
  }
  await theme(null);

  /* Timeseries 누적 영역 = 계열마다 세로 그라데이션 — 같은 계열 띠 안에서 위쪽 픽셀의 알파가 아래쪽보다 크다(라이트 · 다크) */
  await go("components/data-visual.html"); await wait(500);
  for (const t of [null, "dark"]) {
    await theme(t); await wait(600);
    const g = await page.evaluate(() => {
      const c = document.querySelector("#ex-data-visual-timeseries canvas[data-chart]"), ch = c.__dsChart && c.__dsChart.chart; if (!ch) return null;
      const a = ch.chartArea, y = ch.scales.y, ds = ch.data.datasets, ctx = c.getContext("2d"), r = c.width / c.getBoundingClientRect().width;
      /* 띠 경계 사이의 픽셀 알파 — 격자 선이 섞이지 않게 세로 5칸 중 가장 작은 값 */
      const al = (x, py) => { let m = 255; for (let k = -2; k <= 2; k++) m = Math.min(m, ctx.getImageData(Math.round(x * r), Math.round((py + k) * r), 1, 1).data[3]); return m; };
      const out = [];
      for (let i = 0; i < ds.length; i++) {
        /* 이 계열이 가장 높은 x — 그 칸에서 띠가 가장 두껍다 */
        let best = 0, j0 = 0; ds[i].data.forEach((v, j) => { if (+v > best) { best = +v; j0 = j; } });
        const x = ch.scales.x.getPixelForValue(j0), lo = ds.slice(0, i).reduce((s, d) => s + (+d.data[j0] || 0), 0), hi = lo + (+ds[i].data[j0] || 0);
        const pTop = y.getPixelForValue(hi), pBot = y.getPixelForValue(lo); if (pBot - pTop < 20) continue;
        out.push({ i, top: al(x, pTop + (pBot - pTop) * 0.2), bot: al(x, pTop + (pBot - pTop) * 0.85), fill: typeof ch.getDatasetMeta(i).dataset.options.backgroundColor });
      }
      return out;
    });
    ok(`timeseries ${t || "light"}: each stacked area is a vertical gradient — more alpha near its top than near the bottom (2026-11-13)`,
      !!g && g.length >= 2 && g.every((b) => b.fill === "object" && b.top > b.bot + 8), JSON.stringify(g));
  }
  await theme(null);

  /* Avatar Group — 겹침 8(sm 6) · 링 2px = 놓인 자리의 면 · 겹친 면은 불투명 · '외 N명' 은 맨 뒤 간격 8(버튼 4) · 라이트 · 다크 */
  await go("components/avatar.html");
  for (const t of [null, "dark"]) {
    await theme(t); await wait(300);
    const elev = await tok("--surface-elevated-primary");
    const r = await page.evaluate(() => {
      const g = (id, n = 0) => document.querySelectorAll(`#ex-avatar-${id} .avatar-group`)[n];
      const geo = (grp) => { const a = [...grp.querySelectorAll(":scope > .avatar")].map((e) => e.getBoundingClientRect()); return a.slice(1).map((r, i) => Math.round((r.left - a[i].right) * 10) / 10); };
      const av = g("group").querySelector(".avatar"), c = getComputedStyle(av);
      const more = (grp) => { const m = grp.querySelector(".avatar-group-more"), last = [...grp.querySelectorAll(":scope > .avatar")].pop(); return { last: grp.lastElementChild === m, gap: Math.round(m.getBoundingClientRect().left - last.getBoundingClientRect().right), fs: getComputedStyle(m).fontSize, tag: m.tagName }; };
      return { md: geo(g("group")), sm: geo(g("group", 1)), ring: c.boxShadow, img: c.backgroundImage.includes("gradient"), base: c.backgroundColor, role: g("group").getAttribute("role"), name: g("group").getAttribute("aria-label"),
        count: g("group-more").querySelectorAll(".avatar").length, text: more(g("group-more")), btn: more(g("group-button")), btnName: g("group-button").querySelector("button").getAttribute("aria-label") };
    });
    ok(`avatar group ${t || "light"}: overlap 8 (sm 6), a 2px ring and an opaque base in the place's surface, five avatars then '외 N명' last — text 8 after, button 4 after (2026-11-13)`,
      r.md.every((x) => x === -8) && r.sm.every((x) => x === -6) && r.ring.includes(elev) && r.ring.includes("2px") && r.img && r.base === elev && r.role === "group" && r.name === "담당자" &&
      r.count === 5 && r.text.last && r.text.gap === 8 && r.text.fs === "14px" && r.text.tag === "SPAN" && r.btn.last && r.btn.gap === 4 && r.btn.tag === "BUTTON" && /외 3명/.test(r.btnName), JSON.stringify({ r, elev }));
  }
  await theme(null);

  /* 고정폭 글자는 Code 에만 — Copy Field 의 값 · 표 안 인라인 값도 본문 글자 */
  await go("components/copy-field.html");
  const mono = await page.evaluate(() => {
    const code = getComputedStyle(document.createElement("pre")); const d = document.createElement("pre"); document.body.append(d); const m = getComputedStyle(d).fontFamily; d.remove();
    const body = getComputedStyle(document.body).fontFamily;
    return { m, body, fields: [...document.querySelectorAll(".example-preview .copy-field input, .example-preview .copy-field .value")].map((e) => getComputedStyle(e).fontFamily === m).filter(Boolean).length,
      count: document.querySelectorAll(".example-preview .copy-field input, .example-preview .copy-field .value").length };
  });
  ok("copy field values are not monospace — monospace is for Code only (2026-11-13)", mono.count >= 3 && mono.fields === 0 && mono.m !== mono.body, JSON.stringify(mono));
};
