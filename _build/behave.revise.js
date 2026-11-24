/* 2026-11-13 수정 묶음(사람의 요청) — behave.js 가 부른다.
   Tab 글자 16 · sm 14, Top Navigation 선택 = 제품 색 면, Notice · Banner 아이콘 filled, 고정폭 글자는 Code 에만. */
module.exports = async function revise({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);

  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.revise", () => page);
  let ico;
  await part("1 · components/tab.html", async () => {
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
    ok("tab text is Body 2/Normal 15/22 at height 44, sm is Label 2 13/18 at 38, pill tabs are 15/22 at 34 (2026-11-24 — 11-13 의 16 · 14 를 바꿈, 높이는 그대로)",
      tab.base === "15/22/0.0096" && tab.baseH === 44 && tab.sm === "13/18/0.0194" && tab.smH === 38 && tab.pill === "15/22/0.0096" && tab.pillTab === 34, JSON.stringify(tab));
  });
  await part("2 · components/top-navigation.html", async () => {

    /* Top Navigation — 선택 메뉴는 brand 글자 + 아래 2px brand 선, 면 없음, hover 해도 같다(2026-11-14 — 11-13 의 제품 색 면을 바꿈).
       다른 메뉴는 투명 2px 선이라 글자 줄이 같고, 메뉴 사이 8 · 모서리 0 */
    await go("components/top-navigation.html");
    for (const t of [null, "dark"]) {
      await theme(t); await wait(400);
      const B = await tok("--foreground-brand-primary", "color");
      const on = page.locator("#ex-top-navigation-basic .topbar nav a.on").first();
      const look = () => on.evaluate((a) => { const c = getComputedStyle(a); return { bg: c.backgroundColor, fg: c.color, bw: c.borderBottomWidth, bs: c.borderBottomStyle, bc: c.borderBottomColor, r: c.borderTopLeftRadius, w: c.fontWeight }; });
      await page.mouse.move(2, 2); await wait(200); const rest = await look();
      await on.hover(); await wait(200); const hov = await look();
      const nav = await page.locator("#ex-top-navigation-basic .topbar nav").first().evaluate((n) => {
        const a = [...n.querySelectorAll("a")], off = a.find((x) => !x.classList.contains("on")), c = getComputedStyle(off);
        return { gap: getComputedStyle(n).columnGap, offB: c.borderBottomWidth + " " + c.borderBottomStyle + " " + c.borderBottomColor, radii: a.map((x) => getComputedStyle(x).borderTopLeftRadius).every((v) => v === "0px"),
          tops: new Set(a.map((x) => Math.round(x.getBoundingClientRect().top))).size, heights: new Set(a.map((x) => Math.round(x.getBoundingClientRect().height))).size };
      });
      const same = (x) => x.fg === B && x.bc === B && x.bw === "2px" && x.bs === "solid" && x.bg === "rgba(0, 0, 0, 0)" && x.r === "0px" && x.w === "700";   // 굵기 700(2026-11-16)
      ok(`top navigation ${t || "light"}: the selected item is brand text weight 700 with a 2px brand bottom line and no face, hover keeps it; other items carry a transparent 2px line, gap 8, no radius`,
        same(rest) && same(hov) && nav.gap === "8px" && nav.offB === "2px solid rgba(0, 0, 0, 0)" && nav.radii && nav.tops === 1 && nav.heights === 1, JSON.stringify({ rest, hov, nav, B }));
    }
    await theme(null);
  });
  await part("2b · 내비 굵기 · 사이드 패널 표 · Time Picker 폭(2026-11-16)", async () => {
    /* Navigation 선택(상위 · 하위)은 700, 다른 항목은 500 */
    await go("components/navigation.html");
    const nv = await page.evaluate(() => { const a = [...document.querySelectorAll(".example-preview .sidenav a")]; return { on: a.filter((x) => x.classList.contains("on")).map((x) => getComputedStyle(x).fontWeight + (x.classList.contains("sub") ? "s" : "")), off: [...new Set(a.filter((x) => !x.classList.contains("on")).map((x) => getComputedStyle(x).fontWeight))] }; });
    ok("navigation: the selected item (and a selected sub item) is weight 700, the rest 500 (2026-11-16)", nv.on.length > 0 && nv.on.every((w) => /^700/.test(w)) && JSON.stringify(nv.off) === '["500"]', JSON.stringify(nv));
    /* 사이드 패널 안 속성 표 머리글은 오른쪽 선 없음, 다른 자리의 속성 표는 그대로 */
    await go("components/side-panel.html");
    const sp = await page.evaluate(() => [...document.querySelectorAll(".side-panel .tbl.kv th")].map((th) => getComputedStyle(th).borderRightWidth));
    await go("components/table.html");
    const kv = await page.evaluate(() => [...document.querySelectorAll(".example-preview .tbl.kv th")].filter((th) => !th.closest(".side-panel")).map((th) => getComputedStyle(th).borderRightWidth));
    ok("a key-value table inside a side panel has no header right border; elsewhere it keeps 1px (2026-11-16)", sp.length > 0 && sp.every((w) => w === "0px") && kv.length > 0 && kv.every((w) => w === "1px"), JSON.stringify({ sp, kv }));
    /* Time Picker — 단독은 최소 160, 폼 안에서는 칸 폭을 채운다(설정 행은 160 고정 그대로) */
    await go("components/time-picker.html");
    const tp = await page.evaluate(() => { const w = (e) => Math.round(e.getBoundingClientRect().width); const solo = [...document.querySelectorAll("#ex-time-picker-default .field.timepicker, #ex-time-picker-size .field.timepicker")].map(w);
      const f = document.querySelector("#ex-time-picker-form .field.timepicker"), sib = f.parentElement.querySelector(".field:not(.timepicker)"); const pc = getComputedStyle(f.parentElement); return { solo, form: w(f), col: Math.round(f.parentElement.clientWidth - parseFloat(pc.paddingLeft) - parseFloat(pc.paddingRight)), sib: sib ? w(sib) : null }; });
    ok("time picker: alone it is the 160 minimum at every size, in a form it fills the column like the other fields (2026-11-16)", tp.solo.length === 4 && tp.solo.every((x) => x === 160) && tp.form > 160 && (tp.sib === null ? tp.form === tp.col : tp.form === tp.sib), JSON.stringify(tp));
  });
  await part("3 · components/tag.html", async () => {

    /* Tag sm = Caption 2 11/14 · 위아래 2 · 좌우 8 — 높이는 18 그대로(2026-11-14 사람의 결정, 12/16 + 1 이었다) */
    await go("components/tag.html");
    const tsm = await page.evaluate(() => [...document.querySelectorAll("#ex-tag-size .example-preview .tag.sm, #ex-tag-size .tag.sm")].map((e) => { const c = getComputedStyle(e); return [parseFloat(c.fontSize), parseFloat(c.lineHeight), c.paddingTop, c.paddingLeft, Math.round(e.getBoundingClientRect().height * 10) / 10].join("/"); }));
    ok("tag sm is Caption 2 11/14 with padding 2/8 at height 18 (2026-11-14)", tsm.length > 0 && tsm.every((v) => v === "11/14/2px/8px/18"), JSON.stringify(tsm));
  });
  await part("4 · components/indicator.html", async () => {

    /* Count 점은 감싼 틀(아이콘 버튼) 모서리 안쪽 4(2026-11-18 사람의 요청 — 2026-11-14 의 -2 를 바꿈), 숫자는 -6 그대로 */
    await go("components/indicator.html");
    const dot = await page.evaluate(() => [...document.querySelectorAll(".example-preview .with-count")].map((w) => { const c = w.querySelector(".count"), a = w.getBoundingClientRect(), b = c.getBoundingClientRect(); return { dot: c.classList.contains("dot"), top: Math.round(b.top - a.top), right: Math.round(a.right - b.right) }; }));
    ok("count dot sits 4px inside the wrapper corner, the numeric badge 6px outside (2026-11-18)",
      dot.some((d) => d.dot) && dot.some((d) => !d.dot) && dot.every((d) => d.dot ? d.top === 4 && d.right === 4 : d.top === -6 && d.right === -6), JSON.stringify(dot));
  });
  await part("4b · components/indicator.html — 아이콘 원", async () => {
    /* Indicator = 아이콘이 든 색 원(2026-11-16 사람의 요청 · 결정 — 원 16 · 아이콘 10). 원 면 = 톤 토큰, 아이콘 = 흰색(accent 는 brand-label) mask, 톤마다 다른 모양, 줄 높이 22 그대로 · 라이트 · 다크 · 중립 제품 */
    await go("components/indicator.html");
    for (const [t, acc] of [[null, null], ["dark", null], ["dark", "neutral"]]) {
      await page.evaluate(([t, a]) => { const h = document.documentElement; t ? h.setAttribute("data-theme", t) : h.removeAttribute("data-theme"); a ? h.setAttribute("data-accent", a) : h.removeAttribute("data-accent"); }, [t, acc]); await wait(300);
      const r = await page.evaluate(() => {
        const tk = (v) => { const e = document.createElement("i"); e.style.color = `var(${v})`; document.body.append(e); const c = getComputedStyle(e).color; e.remove(); return c; };
        const pv = document.querySelector("#ex-indicator-status .example-preview");
        const acc = document.createElement("span"); acc.className = "indicator accent"; acc.textContent = "제품"; pv.append(acc);
        const WANT = { ok: "--foreground-positive-primary", warn: "--foreground-cautionary-primary", danger: "--foreground-negative-primary", info: "--foreground-accent-cyan", accent: "--surface-brand-primary", "": "--foreground-inactive-primary" };
        const rows = [...pv.querySelectorAll(".indicator")].map((el) => { const k = ["ok", "warn", "danger", "info", "accent"].find((c) => el.classList.contains(c)) || "", b = getComputedStyle(el, "::before"), a = getComputedStyle(el, "::after"), r = el.getBoundingClientRect();
          const icon = { x: Math.round((r.left + parseFloat(a.left) + 5) * 10) / 10 }; return { k, w: b.width, h: b.height, bg: b.backgroundColor, want: tk(WANT[k]), aw: a.width, ah: a.height, ink: a.backgroundColor, inkWant: tk(k === "accent" ? "--brand-label" : "--static-white"), mask: a.maskImage || a.webkitMaskImage, lh: Math.round(r.height * 10) / 10, cx: Math.round((r.left + parseFloat(b.width) / 2) * 10) / 10, icon: icon.x }; });
        acc.remove();
        return { rows, shapes: new Set(rows.filter((x) => x.k !== "accent").map((x) => x.mask)).size };
      });
      ok(`indicator ${t || "light"}${acc ? " · " + acc : ""}: a 16 circle in the tone token with a 10 icon (white, brand-label on accent) centred on it, a shape per state, row 22 (2026-11-16)`,
        r.rows.length === 7 && r.rows.every((x) => x.w === "16px" && x.h === "16px" && x.bg === x.want && x.aw === "10px" && x.ah === "10px" && x.ink === x.inkWant && /url\(/.test(x.mask) && x.lh === 22 && Math.abs(x.cx - x.icon) <= 0.5) && r.shapes === 5, JSON.stringify(r));
    }
    await page.evaluate(() => { document.documentElement.removeAttribute("data-theme"); document.documentElement.removeAttribute("data-accent"); });
    await go("components/data-table.html");
    const off = await page.evaluate(() => { const i = document.querySelector("#ex-data-table-basic tr.disabled .indicator"); return { after: getComputedStyle(i, "::after").display, img: getComputedStyle(i, "::before").backgroundImage }; });
    ok("a disabled row's indicator is a plain grey circle with no icon (2026-11-16)", off.after === "none" && off.img === "none", JSON.stringify(off));
  });
  await part("5 · components/notification.html", async () => {

    /* Notice · Banner 아이콘은 filled — 정적 예제(Toast 는 그대로) */
    await go("components/notification.html");
    ico = await page.evaluate(() => {
      const filled = (s) => !!s && s.getAttribute("fill") === "currentColor" && !s.getAttribute("stroke");
      const n = [...document.querySelectorAll(".example-preview .notice > .ico > svg")], b = [...document.querySelectorAll(".example-preview .banner > svg")], t = [...document.querySelectorAll(".example-preview .toast > .ico > svg")];
      return { notice: n.length, nf: n.filter(filled).length, banner: b.length, bf: b.filter(filled).length, toastOutline: t.length > 0 && t.every((s) => !filled(s)) };
    });
  });
  await part("5b · 톤 없는 Notice 아이콘 = 회색 · 정보 톤은 시안 · 유의사항은 message-2(사람의 요청 2026-11-16)", async () => {
    for (const t of [null, "dark"]) {
      await go("patterns/notes.html"); await theme(t); await wait(300);
      const nm = t || "light", grey = await tok("--foreground-neutral-secondary", "color"), cyan = await tok("--foreground-accent-cyan", "color");
      const n = await page.evaluate(() => { const i = document.querySelector("#ex-notes-basic .notice:not(.info):not(.success):not(.warning):not(.danger) > .ico"); const p = i && i.querySelector("svg path");
        return i ? { c: getComputedStyle(i).color, d: p ? p.getAttribute("d").slice(0, 10) : "" } : null; });
      await go("components/notification.html"); await theme(t); await wait(300);
      const info = await page.evaluate(() => getComputedStyle(document.querySelector(".example-preview .notice.info > .ico")).color);
      ok(`notice ${nm}: a toneless notice icon is neutral-secondary, the notes pattern uses message-2, and the info tone keeps cyan`,
        !!n && n.c === grey && n.d === "M18 3a4 4 " && info === cyan && grey !== cyan, JSON.stringify({ n, info, grey, cyan }));
    }
    await theme(null);
  });
  await part("6 · patterns/input-form.html", async () => {
    await go("patterns/input-form.html");
  });
  await part("7 · 비운 채 제출해도 폼 위 요약을 만들지 않는다(사람의 결정 2026-11-16 — 요약을 통째로 없앰)", async () => {
    /* 오류 3개 이상이 되도록 비운 채 제출 — 필드 오류만 나고 요약 상자는 생기지 않는다 */
    await page.locator("form[data-validate]").first().evaluate((f) => { f.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea").forEach((i) => { i.value = ""; }); f.requestSubmit(); }); await wait(200);
    const sum = await page.evaluate(() => { const f = document.querySelector("form[data-validate]"); return { errors: f.querySelectorAll(".field.error").length, box: document.querySelectorAll("[data-form-summary], .form-summary").length }; });
    ok("notice and banner icons are filled and toast stays outline (2026-11-13); a form with three or more errors draws no summary (2026-11-16)",
      ico.notice >= 4 && ico.nf === ico.notice && ico.banner >= 1 && ico.bf === ico.banner && ico.toastOutline && sum.errors >= 3 && sum.box === 0, JSON.stringify({ ico, sum }));
  });
  await part("8 · components/tag.html", async () => {

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
  });
  await part("9 · components/data-visual.html", async () => {

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
      /* 2026-11-20 — 영역은 계열 색 10% 단색(사람의 결정, dataviz 'a wash'). 11-13 의 세로 그라데이션을 바꿨다: 띠 위아래 알파가 같다 */
      ok(`timeseries ${t || "light"}: each stacked area is a flat 10% wash — the same alpha near its top and its bottom (2026-11-20)`,
        !!g && g.length >= 2 && g.every((b) => b.fill === "string" && Math.abs(b.top - b.bot) <= 3 && b.top >= 18 && b.top <= 34), JSON.stringify(g));
    }
    await theme(null);
  });
  await part("10 · components/avatar.html", async () => {

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
    /* Avatar 색(2026-11-24 — 11-16 의 이름으로 정하는 6색을 없앰) — 페이지의 모든 아바타가 면 surface/neutral/secondary(묶음 안은 링 면 위에 합성한 같은 색)
       · 글자 foreground/neutral/secondary, data-tone 없음, 이니셜 4.5 이상, ds.js 가 새 아바타에 data-tone 을 달지 않음 · 라이트 · 다크 */
    for (const t of [null, "dark"]) {
      await theme(t); await wait(300);
      const r = await page.evaluate(() => {
        const rgb = (s) => { const v = s.match(/[\d.]+/g).map(Number); return /^color\(srgb/.test(s) ? [v[0] * 255, v[1] * 255, v[2] * 255, v[3]] : v; }, lum = (c) => { const [r, g, b] = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const over = (fg, bg) => { const f = rgb(fg), b = rgb(bg), a = f[3] == null ? 1 : f[3]; return `rgb(${[0, 1, 2].map((k) => Math.round(f[k] * a + b[k] * (1 - a))).join(", ")})`; };
        const ratio = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const tk = (v, p) => { const e = document.createElement("i"); e.style[p] = `var(${v})`; document.body.append(e); const c = getComputedStyle(e)[p]; e.remove(); return c; };
        const face = tk("--surface-neutral-secondary", "color"), text = tk("--foreground-neutral-secondary", "color");
        const rows = [...document.querySelectorAll(".example-preview .avatar")].map((a) => { const c = getComputedStyle(a), inG = !!a.closest(".avatar-group");
          const f = inG ? (c.backgroundImage.match(/color\(srgb[^)]*\)|rgba?\([^)]*\)/) || [""])[0] : c.backgroundColor, ring = getComputedStyle(a.closest(".avatar-group") || a.parentElement).getPropertyValue("--avatar-ring");
          const under = inG ? c.backgroundColor : getComputedStyle(a.closest(".example-preview")).backgroundColor;
          return { f, c: c.color, tone: a.hasAttribute("data-tone"), cr: Math.round(ratio(c.color, over(over(f, under), "rgb(255, 255, 255)")) * 100) / 100 }; });
        const d = document.createElement("div"); d.innerHTML = '<span class="avatar" role="img" aria-label="박지호">박</span>'; document.body.append(d); DS.init(d);
        const fresh = d.firstChild.hasAttribute("data-tone"); d.remove();
        return { n: rows.length, bad: rows.filter((x) => x.f !== face || x.c !== text || x.tone || x.cr < 4.5), face, text, fresh, api: typeof DS.avatarTone };
      });
      ok(`avatar ${t || "light"}: every avatar face = surface/neutral/secondary · initials = foreground/neutral/secondary, no data-tone, initials ≥ 4.5, DS.init adds no tone (2026-11-24)`,
        r.n >= 8 && !r.bad.length && !r.fresh && r.api === "undefined", JSON.stringify(r));
    }
    await theme(null);
  });
  await part("11 · components/copy-field.html", async () => {

    /* 고정폭 글자는 Code 에만 — Copy Field 의 값 · 표 안 인라인 값도 본문 글자 */
    await go("components/copy-field.html");
    const mono = await page.evaluate(() => {
      const code = getComputedStyle(document.createElement("pre")); const d = document.createElement("pre"); document.body.append(d); const m = getComputedStyle(d).fontFamily; d.remove();
      const body = getComputedStyle(document.body).fontFamily;
      return { m, body, fields: [...document.querySelectorAll(".example-preview .copy-field input, .example-preview .copy-field .value")].map((e) => getComputedStyle(e).fontFamily === m).filter(Boolean).length,
        count: document.querySelectorAll(".example-preview .copy-field input, .example-preview .copy-field .value").length };
    });
    ok("copy field values are not monospace — monospace is for Code only (2026-11-13)", mono.count >= 3 && mono.fields === 0 && mono.m !== mono.body, JSON.stringify(mono));
  });
};
