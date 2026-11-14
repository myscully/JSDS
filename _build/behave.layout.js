/* 컴포넌트 수정 15건(사람의 요청 2026-11-12) — 높이 맞춤 · 표 · 개별 스타일 · 1199 이하 Spec 표. behave.js 가 부른다.
   페이지 구성(묶음 · Placement)은 behave.js 의 'component page opens with Default' 와 verify 가 잰다 */
module.exports = async function layout({ page, ok, go }) {
  const fs = require("fs"), path = require("path");
  const SITE = path.resolve(__dirname, "..");
  const tok = (v, p = "color") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const ex = (pg, id) => `#ex-${pg}-${id} .example-preview`;
  const hs = (sel) => page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.getBoundingClientRect().height), sel);

  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.layout", () => page);
  let ter, rowLook, li;
  await part("1 · components/select-button.html", async () => {
    /* ── 폼 컨트롤 sm 32 · md 40 · lg 48(사람의 결정 — Button · Text Field 와 같은 눈금) ── */
    await go("components/select-button.html");
    const sb = await hs(`${ex("select-button", "size")} .select-btn`);
    ok("select button: sm 32 · md 40 · lg 48 for filled and outline", JSON.stringify(sb) === "[32,40,48,32,40,48]", JSON.stringify(sb));
  });
  await part("2 · components/select.html", async () => {
    await go("components/select.html");
    const dd = await hs(`${ex("select", "size")} .trigger`);
    ok("select: trigger sm 32 · md 40 · lg 48", JSON.stringify(dd) === "[32,40,48]", JSON.stringify(dd));
    const inField = await page.evaluate(() => { const box = document.createElement("div"); box.className = "example-preview"; box.innerHTML = '<div class="field sm"><div class="dropdown"><button class="trigger">a</button></div></div><div class="field lg"><div class="dropdown"><button class="trigger">a</button></div></div>'; document.querySelector("#content").append(box);
      const r = [...box.querySelectorAll(".trigger")].map((t) => t.getBoundingClientRect().height); box.remove(); return r; });
    ok("select inside .field.sm · .field.lg follows the field size (32 · 48)", JSON.stringify(inField) === "[32,48]", JSON.stringify(inField));
  });
  await part("3 · components/search.html", async () => {
    await go("components/search.html");
    const se = await hs(`${ex("search", "size")} .searchbar`);
    ok("search: sm 32 · md 40 · lg 48", JSON.stringify(se) === "[32,40,48]", JSON.stringify(se));
  });
  await part("4 · components/top-navigation.html", async () => {
    await go("components/top-navigation.html");
    const tn = await page.evaluate((s) => { const bar = document.querySelector(s); return { search: bar.querySelector(".searchbar").getBoundingClientRect().height, btn: bar.querySelector(".btn.icon-only").getBoundingClientRect().height }; }, ex("top-navigation", "search"));
    ok("top navigation search is 32, the same as the icon buttons beside it", tn.search === 32 && tn.btn === 32, JSON.stringify(tn));
  });
  await part("5 · 나란히 놓인 컨트롤은 높이가 같다 — 모든 컴포넌트 · 패턴 예제. 같은 flex · grid 부모 안에서 ", async () => {

    /* ── 나란히 놓인 컨트롤은 높이가 같다 — 모든 컴포넌트 · 패턴 예제. 같은 flex · grid 부모 안에서 가운데가 같은 줄(±4)인 형제 컨트롤을 잰다.
       제외(이유): 크기를 나란히 보여 주는 시연 — button-size · button-icon-only · button-text · chip-size */
    const CTRL = ".btn, .field > input, .field .affix, .searchbar, .dropdown > .trigger, .select-btn, .combobox .control, .chip";
    const SKIP = ["ex-button-size", "ex-button-icon-only", "ex-button-text", "ex-chip-size"];
    const off = [];
    for (const sec of ["components", "patterns"]) for (const f of fs.readdirSync(path.join(SITE, sec))) {
      if (!f.endsWith(".html") || /^(index|overview)\.html$/.test(f)) continue;
      await go(`${sec}/${f}`);
      off.push(...await page.evaluate(([CTRL, SKIP]) => {
        const res = [];
        for (const exa of document.querySelectorAll("section.example")) {
          if (SKIP.includes(exa.id)) continue;
          const els = [...exa.querySelector(".example-preview").querySelectorAll(CTRL)].filter((e) => e.getClientRects().length && !e.closest(".menu, .calendar, .popup, .side-panel-body, .tbl, .chip .x")
            && !(e.matches(".btn") && e.closest(".select-btn, .searchbar, .affix, .combobox")));
          const groups = new Map();
          for (const e of els) {
            const host = e.closest(".field, .dropdown, .combobox") && !e.matches(".btn, .chip, .searchbar, .select-btn") ? e.closest(".field, .dropdown, .combobox") : e;
            const p = host.parentElement; if (!p || !/flex|grid/.test(getComputedStyle(p).display)) continue;
            (groups.get(p) || groups.set(p, []).get(p)).push(e);
          }
          for (const list of groups.values()) {
            const rows = [];
            for (const e of list) { const r = e.getBoundingClientRect(), mid = r.top + r.height / 2; let row = rows.find((x) => Math.abs(x.mid - mid) < 4); if (!row) rows.push(row = { mid, items: [] }); row.items.push([e, Math.round(r.height * 10) / 10]); }
            for (const row of rows) if (row.items.length > 1 && new Set(row.items.map(([, h]) => h)).size > 1) res.push(`${exa.id}: ${row.items.map(([e, h]) => `${e.className.split(" ").slice(0, 3).join(".")}=${h}`).join(" ")}`);
          }
        }
        return res;
      }, [CTRL, SKIP]));
    }
    ok("controls placed side by side in a row have the same height (every component and pattern example)", off.length === 0, off.slice(0, 8).join(" | "));
  });
  await part("6 · components/table.html", async () => {

    /* ── 표 — 행 hover tertiary · 머리글 13 · 속성 표 위 선 ── */
    await go("components/table.html");
    ter = await tok("--surface-neutral-tertiary", "backgroundColor");
    const tb = await page.evaluate(([d, k]) => { const th = document.querySelector(`${d} th`), kth = document.querySelector(`${k} th`), ktd = document.querySelector(`${k} tr:first-child td`), f = (e) => { const c = getComputedStyle(e); return [c.fontSize, c.lineHeight, c.letterSpacing].join(" "); };
      return { th: f(th), kv: f(kth), kvTopTh: getComputedStyle(kth).borderTopWidth, kvTopTd: getComputedStyle(ktd).borderTopWidth, kvTopColor: getComputedStyle(ktd).borderTopColor, line: getComputedStyle(document.querySelector(`${d} tbody td`)).borderBottomColor }; }, [ex("table", "default"), ex("table", "kv")]);
    ok("table header and key–value header are Label 2 13/18; the key–value table has a 1px top line on its first row", tb.th === "13px 18px 0.2522px" && tb.kv === "13px 18px 0.2522px" && tb.kvTopTh === "1px" && tb.kvTopTd === "1px" && tb.kvTopColor === tb.line, JSON.stringify(tb));
  });
  await part("7 · 행 hover 는 .tbl.hover 일 때만(사람의 결정 2026-11-13) — 기본 표는 hover 면", async () => {
    /* 행 hover 는 .tbl.hover 일 때만(사람의 결정 2026-11-13) — 기본 표는 hover 면이 없다 */
    rowLook = async (sel) => { await page.locator(`${sel} tbody tr`).first().hover(); await page.waitForTimeout(250);
      return page.evaluate((s) => { const td = document.querySelector(`${s} tbody tr:first-child td`); return { tint: getComputedStyle(td).getPropertyValue("--tbl-tint").trim(), bg: getComputedStyle(td).backgroundColor, cls: td.closest("table").className }; }, sel); };
    const plainRow = await rowLook(ex("table", "default"));
    ok("a default table has no row hover face (2026-11-13 — only .tbl.hover)", plainRow.tint === "" && plainRow.bg === "rgba(0, 0, 0, 0)" && !/\bhover\b/.test(plainRow.cls), JSON.stringify(plainRow));
  });
  await part("8 · components/data-table.html", async () => {
    await go("components/data-table.html");
    const tint = (await rowLook(ex("data-table", "selectable"))).tint;
    const tintTok = await page.evaluate(() => { const d = document.createElement("div"); d.style.color = "var(--surface-neutral-tertiary)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    const tintCol = await page.evaluate((v) => { const d = document.createElement("div"); d.style.color = v; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, tint);
    ok("table row hover (.tbl.hover — a selectable data table) is surface/neutral/tertiary", tintCol === tintTok, JSON.stringify({ tint, tintCol, tintTok }));
  });
  await part("9 · components/side-panel.html", async () => {
    await go("components/side-panel.html");
    const sp = await page.evaluate(() => [...document.querySelectorAll(".example-preview .side-panel table")].map((t) => [...t.classList].join(" ")));
    ok("side panel fact tables are key–value tables (.tbl.kv)", sp.length > 0 && sp.every((c) => c === "tbl kv"), JSON.stringify(sp));
  });
  await part("10 · components/list.html", async () => {
    await go("components/list.html");
    li = page.locator(".example-preview .list.hover li").first(); await li.hover(); await page.waitForTimeout(250);
    const lbg = await li.evaluate((e) => getComputedStyle(e).backgroundColor);
    ok("list hover is surface/neutral/tertiary, the same as table rows", lbg === ter, JSON.stringify({ lbg, ter }));
  });
  await part("11 · components/empty-state.html", async () => {

    /* ── 개별 스타일 ── */
    await go("components/empty-state.html");
    const em = await page.evaluate(() => { const ico = document.querySelector(".example-preview .empty:not(.compact) .ico"), svg = ico.querySelector("svg"), c = getComputedStyle(ico), cico = document.querySelector(".example-preview .empty.compact .ico svg");
      return { bg: c.backgroundColor, color: c.color, w: svg.getBoundingClientRect().width, h: svg.getBoundingClientRect().height, stroke: getComputedStyle(svg).strokeWidth, compact: cico.getBoundingClientRect().width, compactBg: getComputedStyle(cico.parentElement).backgroundColor }; });
    const q = await tok("--foreground-neutral-quaternary");
    ok("empty state icon: no face, quaternary, 40 × 40, stroke 1.5 (compact 32, no face)", em.bg === "rgba(0, 0, 0, 0)" && em.color === q && em.w === 40 && em.h === 40 && em.stroke === "1.5px" && em.compact === 32 && em.compactBg === "rgba(0, 0, 0, 0)", JSON.stringify({ em, q }));
  });
  await part("12 · components/notification.html", async () => {

    await go("components/notification.html");
  });
  await part("13 · 예제에는 톤 없는 Notice 가 없어(전부 info · success · warning · danger) ", async () => {
    /* 예제에는 톤 없는 Notice 가 없어(전부 info · success · warning · danger) 하나 넣어 잰다 — 넣지 않으면 회색 면 단정이 빈 목록으로 통과한다(음성 시험에서 발견) */
    const nt = await page.evaluate(() => { const pv = document.querySelector(".example-preview"); const probe = document.createElement("div"); probe.className = "notice"; probe.textContent = "가"; pv.append(probe);
      const r = [...document.querySelectorAll(".example-preview .notice")].map((n) => { const c = getComputedStyle(n); return { cls: n.className, bw: c.borderTopWidth, pad: c.padding, bg: c.backgroundColor }; }); probe.remove(); return r; });
    const gray = await tok("--background-neutral-secondary", "backgroundColor");
    ok("notice: no border, padding 20 18, a toneless notice sits on background/neutral/secondary", nt.length > 1 && nt.every((n) => n.bw === "0px" && n.pad === "20px 18px") && nt.filter((n) => n.cls === "notice").length === 1 && nt.filter((n) => n.cls === "notice").every((n) => n.bg === gray), JSON.stringify({ nt, gray }));
  });
  await part("14 · components/page-header.html", async () => {

    await go("components/page-header.html");
    const ph = await page.evaluate(() => { const h = document.querySelector(".example-preview .page-head"), t = h.querySelector(".title"), c = getComputedStyle(t);
      return { title: [c.fontSize, c.lineHeight, c.fontWeight, +(parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(4)].join("/"), gap: getComputedStyle(h).gap }; });
    ok("page header title is Title 2 28/38 Bold -0.0236em (2026-11-13)", ph.title === "28px/38px/700/-0.0236", JSON.stringify(ph));
    ok("page header rows and columns are 16 apart", ph.gap === "16px", ph.gap);
  });
  await part("15 · components/file-upload.html", async () => {

    await go("components/file-upload.html");
    const up = await page.evaluate(() => { const it = document.querySelector(".example-preview .upload-item.error"); return it && getComputedStyle(it).borderTopColor; });
    ok("upload error item border is line/negative/primary", up === await tok("--line-negative-primary", "borderTopColor"), up);
  });
  await part("16 · components/steps.html", async () => {

    await go("components/steps.html");
    const st = await page.evaluate(() => { const li = document.querySelector(".example-preview .steps li"), done = document.querySelector(".example-preview .steps li.done i"); return { w: getComputedStyle(li).fontWeight, bg: getComputedStyle(done).backgroundColor, fg: getComputedStyle(done).color }; });
    ok("steps: labels 500, done circle is the brand face with a brand-label check (2026-11-13 — was green)", st.w === "500" && st.bg === await tok("--surface-brand-primary", "backgroundColor") && st.fg === await tok("--brand-label"), JSON.stringify(st));
  });
  await part("17 · 1199 이하에서 Spec · Props 표가 틀 폭을 채운다(그 전엔 블록이 되어 내용 폭으로 줄었다)", async () => {

    /* ── 1199 이하에서 Spec · Props 표가 틀 폭을 채운다(그 전엔 블록이 되어 내용 폭으로 줄었다) ── */
    const vp = page.viewportSize(); await page.setViewportSize({ width: 1100, height: 900 });
    const narrow = [];
    for (const pg of ["empty-state", "avatar", "divider", "button"]) {
      await go(`components/${pg}.html`);
      narrow.push(...await page.evaluate((pg) => ["spec", "props"].map((id) => { const w = document.querySelector(`#${id} ~ .tablewrap`); const t = w && w.querySelector("table"); return t ? `${pg}/${id}:${Math.round(t.getBoundingClientRect().width)}/${Math.round(w.clientWidth)}:${getComputedStyle(t).display}` : `${pg}/${id}:none`; }), pg));
    }
    await page.setViewportSize(vp);
    ok("at 1100 wide the Spec and Props tables fill their frame (display:table)", narrow.every((x) => { const m = /:(\d+)\/(\d+):(\S+)$/.exec(x); return m && Math.abs(+m[1] - +m[2]) <= 2 && m[3] === "table"; }), narrow.join(" "));
  });
};
