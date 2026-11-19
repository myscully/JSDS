/* 2026-11-18 템플릿 검토에서 나온 수정 일곱(사람의 요청) — behave.js 가 부른다.
   상단 바 62 · 왼쪽 영역 240 · 사이드 내비 접기 · 라이트/다크 · 오른쪽 아이콘 40 · 검색 40 · 알림 점 기본 · 숫자 배지 11 · 사이드 내비 아이콘 secondary,
   flush 카드 마지막 행 선, 로그인 로고 · 칸 안 아이콘, 버튼 묶음 간격, 대시보드(탐색형 도넛 · 일별 탐지 · KPI 스파크 없음), 액션 바 좌우 0, 마법사 폼 폭.
   같은 날 추가 수정(사람의 요청): 일별 탐지 = 계열 하나인 추이 · Page Header 아래 16 · 로그인 화면(그림자 카드 · 반경 xl 14 · 이메일 · placeholder · 저작권 줄 · shield-check)
   · 테마 아이콘 = 지금 테마 · Count 점 안쪽 4 · 버튼 아이콘 16 · 20 · 28 */
module.exports = async function shell({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const tok = (v, p = "color") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const part = require("./behave.part")(ok, "behave.shell", () => page);

  await part("1 · 상단 바 크기 · 왼쪽 영역 · 오른쪽 순서", async () => {
    await go("components/top-navigation.html");
    const r = await page.evaluate(() => {
      const rs = parseFloat(getComputedStyle(document.documentElement).fontSize), box = (e) => e.getBoundingClientRect();
      const ex = document.querySelector("#ex-top-navigation-search"), bar = ex.querySelector(".topbar"), start = bar.querySelector(".topbar-start"), nav = ex.querySelector(".sidenav");
      const right = bar.querySelector(".right"), kids = [...right.querySelectorAll("button.btn.icon-only")];
      const order = [...right.querySelectorAll('[aria-label^="알림"], [aria-label="설정"], [data-theme-toggle], .avatar')].map((e) => e.matches("[data-theme-toggle]") ? "theme" : e.matches(".avatar") ? "user" : e.getAttribute("aria-label").startsWith("알림") ? "bell" : "settings");
      const logo = start.querySelector(".logo"), tg = start.querySelector("[data-sidenav-toggle]");
      return {
        rs, h: box(bar).height, startW: box(start).width, navW: box(nav).width, startL: box(start).left - box(bar).left, navL: box(nav).left - box(bar).left,
        logoL: box(logo).left - box(start).left, tgR: box(start).right - box(tg).right, btnH: kids.map((b) => box(b).height), searchH: box(bar.querySelector(".searchbar")).height,
        avatar: box(right.querySelector(".avatar")).height, order: order.join(" "),
        allH: [...document.querySelectorAll(".topbar")].map((b) => Math.round(box(b).height * 100) / 100),
        dot: (() => { const c = document.querySelector("#ex-top-navigation-basic .with-count > .count"); return c && c.classList.contains("dot") && c.textContent === "" && Math.round(box(c).width); })(),
      };
    });
    ok("top bar is 3.875rem tall (62 at 1440) in every example (2026-11-18)", r.allH.length >= 3 && r.allH.every((h) => Math.abs(h - 3.875 * r.rs) < 0.6), JSON.stringify(r.allH));
    ok("the start area is 240 from the bar's left edge — same width and left as the side nav; logo at its left padding 20, toggle at its right padding 12 (2026-11-18)",
      Math.abs(r.startW - 15 * r.rs) < 0.6 && Math.abs(r.startW - r.navW) < 0.6 && Math.abs(r.startL - r.navL) < 0.6 && Math.abs(r.startL) < 0.6 && Math.abs(r.logoL - 1.25 * r.rs) < 0.6 && Math.abs(r.tgR - 0.75 * r.rs) < 0.6, JSON.stringify(r));
    ok("right side: icon buttons are md 40, search is 40, avatar stays 32, order is bell · settings · theme · user, bell shows a dot without a number (2026-11-18)",
      r.btnH.length >= 3 && r.btnH.every((h) => Math.abs(h - 2.5 * r.rs) < 0.6) && Math.abs(r.searchH - 2.5 * r.rs) < 0.6 && Math.abs(r.avatar - 2 * r.rs) < 0.6 && r.order === "bell settings theme user" && r.dot > 0, JSON.stringify(r));
  });

  await part("2 · 사이드 내비 접기", async () => {
    await go("components/top-navigation.html");
    await page.evaluate(() => { window.__nav = []; document.addEventListener("ds:sidenav", (e) => window.__nav.push(e.detail && e.detail.collapsed)); });
    const tg = page.locator("#ex-top-navigation-search [data-sidenav-toggle]");
    const look = () => page.evaluate(() => {
      const ex = document.querySelector("#ex-top-navigation-search"), b = ex.querySelector("[data-sidenav-toggle]"), nav = ex.querySelector(".sidenav");
      return { exp: b.getAttribute("aria-expanded"), name: b.getAttribute("aria-label"), tip: b.parentElement.querySelector(".tooltip").textContent, col: nav.classList.contains("collapsed"),
        navW: Math.round(nav.getBoundingClientRect().width * 10) / 10, startW: Math.round(ex.querySelector(".topbar-start").getBoundingClientRect().width * 10) / 10,
        icon: getComputedStyle(nav.querySelector("a:not(.on) svg")).color, ev: window.__nav.slice(), focus: document.activeElement === b };
    });
    const rs = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    const a = await look();
    await tg.click(); await wait(350); const b = await look();
    await tg.press("Enter"); await wait(350); const c = await look();
    ok("the toggle collapses the side nav to 64 while the start area stays 240; name · tooltip · aria-expanded follow, ds:sidenav says collapsed, focus stays on the toggle (2026-11-18)",
      a.exp === "true" && a.name === "메뉴 접기" && !a.col && b.exp === "false" && b.name === "메뉴 펼치기" && b.tip === "메뉴 펼치기" && b.col && Math.abs(b.navW - 4 * rs) < 0.6 && Math.abs(b.startW - 15 * rs) < 0.6 && b.focus
      && c.exp === "true" && !c.col && Math.abs(c.navW - 15 * rs) < 0.6 && JSON.stringify(c.ev) === "[true,false]", JSON.stringify({ a, b, c }));
    const sec = await tok("--foreground-neutral-secondary");
    ok("side nav icons are foreground-neutral-secondary (2026-11-18)", a.icon === sec, `${a.icon} vs ${sec}`);
    const rail = await page.evaluate(() => [...document.querySelectorAll("#ex-top-navigation-search .sidenav > .tooltip-wrap > a")].every((x) => x.getAttribute("aria-label") && x.nextElementSibling.matches(".tooltip.right")));
    ok("a toggleable side nav keeps name + tooltip on every item so the collapsed rail stays named (2026-11-18)", rail, String(rail));
  });

  await part("3 · 라이트/다크 버튼", async () => {
    await go("components/top-navigation.html");
    await page.evaluate(() => { try { localStorage.removeItem("jsds-theme"); } catch (e) { } document.documentElement.setAttribute("data-theme", "light"); window.__th = []; document.addEventListener("ds:theme", (e) => window.__th.push(e.detail && e.detail.theme)); });
    await wait(100);
    const look = () => page.evaluate(() => {
      const bs = [...document.querySelectorAll("[data-theme-toggle]")], b = document.querySelector("#ex-top-navigation-basic [data-theme-toggle]"), vis = (s) => getComputedStyle(b.querySelector(s)).display !== "none";
      let saved = null; try { saved = localStorage.getItem("jsds-theme"); } catch (e) { }
      return { theme: document.documentElement.getAttribute("data-theme"), pressed: [...new Set(bs.map((x) => x.getAttribute("aria-pressed")))].join(), moon: vis(".i-dark"), sun: vis(".i-light"), saved, ev: window.__th.slice(), n: bs.length };
    });
    const a = await look();
    await page.locator("#ex-top-navigation-basic [data-theme-toggle]").click(); await wait(300); const b = await look();
    await page.locator("#ex-top-navigation-user [data-theme-toggle]").click(); await wait(300); const c = await look();
    ok("the theme button switches html data-theme, every theme button's aria-pressed follows (pressed = dark), the icon is the current theme (light = sun, dark = moon — 2026-11-18), ds:theme fires and the site saves it (2026-11-18)",
      a.n === 3 && a.theme === "light" && a.pressed === "false" && !a.moon && a.sun && b.theme === "dark" && b.pressed === "true" && b.moon && !b.sun && b.saved === "dark"
      && c.theme === "light" && c.pressed === "false" && c.saved === "light" && JSON.stringify(c.ev) === '["dark","light"]', JSON.stringify({ a, b, c }));
    await page.evaluate(() => { document.documentElement.setAttribute("data-theme", "dark"); }); await wait(100);
    const d = await page.evaluate(() => document.querySelector("#ex-top-navigation-basic [data-theme-toggle]").getAttribute("aria-pressed"));
    ok("a theme change made elsewhere (site header) updates the button's aria-pressed (2026-11-18)", d === "true", d);
    await page.evaluate(() => { try { localStorage.removeItem("jsds-theme"); } catch (e) { } document.documentElement.removeAttribute("data-theme"); });
  });

  await part("4 · 알림 벨 점 · 숫자 배지 11 · 99+", async () => {
    await go("components/notification-center.html");
    const r = await page.evaluate(() => {
      const c1 = document.querySelector("#ex-notification-center-default .with-count > .count"), host = document.querySelector("#ex-notification-center-count .notify"), c5 = host.querySelector(".with-count > .count"), cs = getComputedStyle(c5);
      const before = { dot: c1.classList.contains("dot"), text: c1.textContent, bell: c1.parentElement.querySelector("button").getAttribute("aria-label"), h: c1.parentElement.querySelector("button").getBoundingClientRect().height };
      const num = { text: c5.textContent, dot: c5.classList.contains("dot"), size: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight), w: cs.fontWeight };
      window.DS.notify.add(host, Array.from({ length: 100 }, (_, i) => ({ title: "대량 " + i, time: "방금", unread: true })));
      const many = c5.textContent;
      window.DS.notify.add(c1.closest(".notify"), [{ title: "새 알림", time: "방금", unread: true }]);
      return { before, num, many, after: { dot: c1.classList.contains("dot"), text: c1.textContent }, rs: parseFloat(getComputedStyle(document.documentElement).fontSize) };
    });
    ok("the bell shows a dot by default (no number, name keeps the count), a new alert keeps it a dot; data-count=number shows 11/14 Bold digits and 99+ past 99; the bell is md 40 (2026-11-18)",
      r.before.dot && r.before.text === "" && /^알림 \d+건$/.test(r.before.bell) && Math.abs(r.before.h - 2.5 * r.rs) < 0.6 && r.after.dot && r.after.text === ""
      && !r.num.dot && r.num.text === "4" && r.num.size === 11 && r.num.lh === 14 && r.num.w === "700" && r.many === "99+", JSON.stringify(r));
    await go("components/navigation.html");
    const nav = await page.evaluate(() => { const c = document.querySelector(".sidenav .count"); return c ? parseFloat(getComputedStyle(c).fontSize) : null; });
    ok("counts that are not on an icon (side nav) stay 12 (2026-11-18)", nav === 12, String(nav));
  });

  await part("5 · flush 카드 마지막 행 선", async () => {
    await go("patterns/dashboard.html");
    const r = await page.evaluate(() => {
      const card = document.querySelector("#ex-dashboard-full .card.flush"), rows = card.querySelectorAll("tbody tr"), last = rows[rows.length - 1], prev = rows[rows.length - 2];
      const b = (tr) => getComputedStyle(tr.querySelector("td")).borderBottomWidth;
      const out = { last: b(last), prev: b(prev), card: getComputedStyle(card).borderBottomWidth };
      /* 마지막이 숨긴 상세 행이면 그 앞 행 */
      const d = document.createElement("tr"); d.className = "row-detail"; d.hidden = true; d.innerHTML = "<td colspan='4'>x</td>"; last.after(d);
      out.beforeHidden = b(last); d.remove();
      /* flush 가 아닌 카드 · 카드 밖 표는 마지막 행 선 그대로 */
      card.classList.remove("flush"); out.notFlush = b(last); card.classList.add("flush");
      return out;
    });
    await go("components/table.html");
    const plain = await page.evaluate(() => { const t = [...document.querySelectorAll(".tbl")].find((x) => !x.closest(".card") && !x.matches(".plain")); const rows = t.querySelectorAll("tbody tr"); return getComputedStyle(rows[rows.length - 1].querySelector("td")).borderBottomWidth; });
    ok("a table at the bottom of a flush card drops its last row line (the card border is the edge), also when a hidden detail row comes last; tables elsewhere keep it (2026-11-18)",
      r.last === "0px" && r.prev === "1px" && r.card === "1px" && r.beforeHidden === "0px" && r.notFlush === "1px" && plain === "1px", JSON.stringify({ ...r, plain }));
  });

  await part("6 · 버튼 묶음 간격 · 액션 바 · 마법사 폼 폭", async () => {
    await go("components/button.html");
    const g = await page.evaluate(() => {
      const host = document.querySelector(".example-preview"), out = {};
      for (const [k, cls] of [["sm", "btn sm outline assistive"], ["md", "btn md outline assistive"], ["lg", "btn lg outline assistive"], ["vsm", "btn sm outline assistive"]]) {
        const d = document.createElement("div"); d.className = "btn-group" + (k === "vsm" ? " vertical" : ""); d.innerHTML = `<button type="button" class="${cls}">가</button><button type="button" class="${cls}">나</button>`; host.append(d);
        const [a, b] = d.children, ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); out[k] = Math.round((k === "vsm" ? rb.top - ra.bottom : rb.left - ra.right) * 100) / 100; d.remove();
      }
      out.rs = parseFloat(getComputedStyle(document.documentElement).fontSize); return out;
    });
    ok("button group gap follows the button size — sm 6 · md 8 · lg 12, vertical too (2026-11-18)",
      Math.abs(g.sm - 0.375 * g.rs) < 0.1 && Math.abs(g.md - 0.5 * g.rs) < 0.1 && Math.abs(g.lg - 0.75 * g.rs) < 0.1 && Math.abs(g.vsm - 0.375 * g.rs) < 0.1, JSON.stringify(g));
    await go("components/data-table.html");
    const bar = await page.evaluate(() => { const c = getComputedStyle(document.querySelector(".action-bar")); return [c.paddingLeft, c.paddingRight, c.paddingTop, c.paddingBottom].join(" "); });
    ok("action bar has no side padding — 10 top and bottom, 0 left and right (2026-11-18)", bar === "0px 0px 10px 10px", bar);
    await go("components/steps.html");
    const w = await page.evaluate(() => { const p = [...document.querySelectorAll("#ex-steps-default .step-panel")].find((x) => !x.hidden), f = p.querySelector(".form"); return { form: Math.round(f.getBoundingClientRect().width), panel: Math.round(p.clientWidth), max: getComputedStyle(f).maxWidth }; });
    ok("a form card inside the wizard fills the panel — no max width (2026-11-18)", w.max === "none" && w.form === w.panel && w.panel > 640, JSON.stringify(w));
  });

  await part("7 · 로그인 화면 — 카드 · 로고 · 이메일 칸 · 저작권 줄", async () => {
    await go("patterns/sign-in.html");
    const look = () => page.evaluate(() => {
      const scr = document.querySelector("#ex-sign-in-sign-in .auth-screen"), f = scr.querySelector("form"), cs = getComputedStyle(f), logo = f.querySelector(".auth-logo"), lc = getComputedStyle(logo), h = f.querySelector("h2");
      const i = logo.querySelector("i"), ic = getComputedStyle(i), sv = i.querySelector("svg"), mark = sv.getBoundingClientRect(), fr = f.getBoundingClientRect(), cp = scr.querySelector(":scope > .auth-copy"), cr = cp.getBoundingClientRect(), sr = scr.getBoundingClientRect();
      const ico = (id) => { const inp = document.getElementById(id), s = inp.previousElementSibling, v = s && s.querySelector("svg"), r = v && v.getBoundingClientRect(), lab = document.querySelector(`label[for="${id}"]`); return s && s.matches(".field-icon[aria-hidden=true]") ? { w: Math.round(r.width), color: getComputedStyle(s).color, gap: Math.round(inp.getBoundingClientRect().left - r.right), type: inp.type, ph: inp.placeholder, labSr: !!lab && lab.matches(".sr-only") && lab.getBoundingClientRect().width <= 1, name: lab && lab.textContent } : null; };
      const two = document.querySelector("#ex-sign-in-two-step"), tt = two.querySelector(".auth-title");
      return { border: cs.borderTopWidth, shadow: cs.boxShadow, radius: cs.borderTopLeftRadius, rs: parseFloat(getComputedStyle(document.documentElement).fontSize),
        logo: { m: [lc.marginTop, lc.marginRight, lc.marginBottom, lc.marginLeft].join(" "), gap: lc.rowGap, role: logo.getAttribute("role"), name: logo.getAttribute("aria-label"), filled: sv.getAttribute("fill") === "currentColor" && !sv.getAttribute("stroke"), w: Math.round(mark.width), h: Math.round(mark.height),
          bg: ic.backgroundColor, img: ic.backgroundImage, radius: ic.borderTopLeftRadius, color: ic.color === lc.color, center: Math.round(Math.abs((mark.left + mark.right) / 2 - (fr.left + fr.right) / 2)) },
        h: h.textContent, hSr: h.matches(".sr-only"), email: ico("si-email"), pw: ico("si-pw"), save: [...f.querySelectorAll(".auth-row .checkbox span")].map((x) => x.textContent).join(), err: f.querySelector(".notice b").textContent,
        copy: { text: cp.textContent, pos: getComputedStyle(cp).position, below: cr.top >= fr.bottom, bottom: Math.round(sr.bottom - cr.bottom), size: parseFloat(getComputedStyle(cp).fontSize), center: Math.round(Math.abs((cr.left + cr.right) / 2 - (sr.left + sr.right) / 2)) },
        screenBg: getComputedStyle(scr).backgroundColor,
        twoHead: tt.parentElement.tagName === "DIV" && tt.parentElement.parentElement.tagName === "FORM" && tt.nextElementSibling && tt.nextElementSibling.matches(".auth-desc"), twoCopy: !!two.querySelector(".auth-screen > .auth-copy"), twoLogo: !!two.querySelector(".auth-logo svg[fill=currentColor]") };
    });
    const r = await look(), ter = await tok("--foreground-neutral-tertiary"), sh2 = await tok("--shadow-2", "boxShadow"), bg2 = await tok("--background-neutral-secondary", "backgroundColor");
    ok("sign-in card: no border, shadow-2, radius xl 14 on the grey screen (2026-11-18)", r.border === "0px" && r.shadow === sh2 && Math.abs(parseFloat(r.radius) - 0.875 * r.rs) < 0.1 && r.screenBg === bg2, JSON.stringify({ border: r.border, shadow: r.shadow, sh2, radius: r.radius, bg: r.screenBg }));
    ok("sign-in logo: margin 16 · gap 8, a 48 filled shield-check with no face (no fill, gradient, radius or own colour), centred, role=img + name (2026-11-18)",
      r.logo.m === [16, 16, 16, 16].map((x) => x * r.rs / 16 + "px").join(" ") && Math.abs(parseFloat(r.logo.gap) - 0.5 * r.rs) < 0.1 && r.logo.filled && r.logo.w === Math.round(3 * r.rs) && r.logo.h === Math.round(3 * r.rs)
      && r.logo.bg === "rgba(0, 0, 0, 0)" && r.logo.img === "none" && r.logo.radius === "0px" && r.logo.color && r.logo.center <= 1 && r.logo.role === "img" && r.logo.name === "Security Console" && r.h === "관리 콘솔 로그인" && r.hSr, JSON.stringify(r.logo));
    ok("sign-in fields: email (type=email) and password show placeholders and an 18 tertiary icon 8 before the input; labels are hidden but still name them; '이메일 저장' (2026-11-18)",
      r.email && r.email.type === "email" && r.email.ph === "이메일" && r.email.name === "이메일" && r.pw && r.pw.ph === "비밀번호" && r.pw.name === "비밀번호" && [r.email, r.pw].every((x) => x.w === 18 && x.color === ter && x.labSr && x.gap >= 7 && x.gap <= 9)
      && r.save === "이메일 저장" && /^이메일 또는 비밀번호/.test(r.err), JSON.stringify({ email: r.email, pw: r.pw, save: r.save, err: r.err }));
    ok("sign-in screen: the copyright line is fixed at the bottom of the screen, centred, 12 — below the card; two-step has the same screen, logo and a div around its title and description (2026-11-18)",
      r.copy.text === "© 2026 JIRANSECURITY Co., Ltd. All rights reserved." && r.copy.pos === "absolute" && r.copy.below && Math.abs(r.copy.bottom - 1.5 * r.rs) < 1 && r.copy.size === 12 && r.copy.center <= 1 && r.twoHead && r.twoCopy && r.twoLogo, JSON.stringify({ copy: r.copy, twoHead: r.twoHead, twoCopy: r.twoCopy, twoLogo: r.twoLogo }));
    await page.setViewportSize({ width: 390, height: 900 }); await wait(150);
    const n = await look(); await page.setViewportSize({ width: 1440, height: 900 }); await wait(150);
    ok("sign-in screen at 390: the copyright line still sits below the card without overlapping (2026-11-18)", n.copy.below && n.copy.center <= 1, JSON.stringify(n.copy));
  });

  await part("8 · 대시보드 — 탐색형 도넛 · 일별 탐지 추이 · KPI 스파크 없음", async () => {
    await go("patterns/dashboard.html"); await wait(600);
    const r = await page.evaluate(() => {
      const ex = document.querySelector("#ex-dashboard-full"), cards = [...ex.querySelectorAll(".row-3 > .chart-card")];
      const chart = (c) => window.Chart && window.Chart.getChart(c);
      const daily = cards[0].querySelector("canvas"), donut = cards[1].querySelector("canvas"), dc = chart(daily), nc = chart(donut), T = window.DSChart.theme(document.documentElement);
      const ds = dc && dc.data.datasets[0];
      return { spark: ex.querySelectorAll('canvas[data-chart="spark"], .kpi .chart-canvas').length, kpis: ex.querySelectorAll(".kpi").length, staticDonut: ex.querySelectorAll(".donut").length,
        t0: cards[0].querySelector(".chart-title").textContent, figure: !!cards[0].querySelector(".chart-figure"), k0: daily.dataset.chart, type0: dc && dc.config.type, sets: dc && dc.data.datasets.length,
        line: ds && ds.borderColor, mono: T.mono[0], fill: !!(ds && ds.fill), data: ds && ds.data.join(","), name0: daily.getAttribute("aria-label"),
        t1: cards[1].querySelector(".chart-title").textContent, k1: donut.dataset.chart, type1: nc && nc.config.type, slices: nc && nc.data.datasets[0].data.join(","), name: donut.getAttribute("aria-label") };
    });
    await go("components/data-visual.html"); await wait(400);
    const dv = await page.evaluate(() => { const c = document.querySelector("#ex-data-visual-default canvas"), ch = window.Chart.getChart(c); return { kind: c.dataset.chart, data: ch.data.datasets[0].data.join(","), sets: ch.data.datasets.length, name: c.getAttribute("aria-label") }; });
    ok("dashboard: '일별 탐지' is the same single-series trend as Data Visual Default — mono-1 line, shaded area, same data and name, no big value; KPIs have no sparklines (2026-11-18)",
      r.spark === 0 && r.kpis === 4 && r.t0 === "일별 탐지" && !r.figure && r.k0 === "timeseries" && r.type0 === "line" && r.sets === 1 && r.line === r.mono && r.fill
      && dv.kind === "timeseries" && dv.sets === 1 && r.data === dv.data && r.name0 === dv.name, JSON.stringify({ r, dv }));
    ok("dashboard: '심각도 분포' is the exploratory donut (190 · 285 · 196 · 120 · 263) — no static donut (2026-11-18)",
      r.staticDonut === 0 && r.t1 === "심각도 분포" && r.k1 === "donut" && r.type1 === "doughnut" && r.slices === "190,285,196,120,263" && /합계 1,054/.test(r.name), JSON.stringify(r));
  });

  await part("9 · Page Header 아래 16", async () => {
    await go("patterns/dashboard.html");
    const r = await page.evaluate(() => { const h = document.querySelector("#ex-dashboard-full .page-head"), n = h.nextElementSibling, st = getComputedStyle(h.parentElement);
      return { mb: getComputedStyle(h).marginBottom, gap: parseFloat(st.rowGap) || 0, space: Math.round((n.getBoundingClientRect().top - h.getBoundingClientRect().bottom) * 100) / 100, rs: parseFloat(getComputedStyle(document.documentElement).fontSize) }; });
    ok("page header leaves 16 more below it than the stack gap (2026-11-18)", Math.abs(parseFloat(r.mb) - r.rs) < 0.1 && Math.abs(r.space - (r.gap + r.rs)) < 0.6, JSON.stringify(r));
  });

  await part("10 · 테마 아이콘 = 지금 테마 · Count 점 안쪽 4", async () => {
    await go("components/top-navigation.html");
    const r = await page.evaluate(() => { const w = document.querySelector("#ex-top-navigation-basic .with-count"), c = w.querySelector(".count.dot"), a = w.getBoundingClientRect(), b = c.getBoundingClientRect(), btn = w.querySelector("button").getBoundingClientRect();
      return { top: Math.round(b.top - a.top), right: Math.round(a.right - b.right), inBtn: b.top >= btn.top && b.right <= btn.right, rs: parseFloat(getComputedStyle(document.documentElement).fontSize) }; });
    ok("the bell's dot sits 4 inside the button corner (2026-11-18)", Math.abs(r.top - 0.25 * r.rs) <= 0.6 && Math.abs(r.right - 0.25 * r.rs) <= 0.6 && r.inBtn, JSON.stringify(r));
    const icon = async (theme) => { await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme); await wait(80);
      return page.evaluate(() => { const b = document.querySelector("#ex-top-navigation-basic [data-theme-toggle]"), v = (s) => getComputedStyle(b.querySelector(s)).display !== "none"; return (v(".i-light") ? "sun" : "") + (v(".i-dark") ? "moon" : ""); }); };
    const light = await icon("light"), dark = await icon("dark");
    await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
    ok("the theme button shows the current theme — sun in light, moon in dark (2026-11-18)", light === "sun" && dark === "moon", JSON.stringify({ light, dark }));
  });

  await part("11 · 버튼 아이콘 16 · 20 · 28", async () => {
    await go("components/button.html");
    const r = await page.evaluate(() => { const host = document.querySelector(".example-preview"), d = document.createElement("div");
      d.innerHTML = ["sm", "md", "lg"].map((z) => `<button type="button" class="btn ${z} outline assistive icon-only" aria-label="x"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>`).join("")
        + '<button type="button" class="btn lg outline assistive icon-only" aria-label="y"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5h14v14H5z"/></svg></button>';
      host.append(d); const s = [...d.querySelectorAll("svg")].map((v) => ({ w: Math.round(v.getBoundingClientRect().width), sw: getComputedStyle(v).strokeWidth })); d.remove(); return { s, rs: parseFloat(getComputedStyle(document.documentElement).fontSize) }; });
    const want = [1, 1.25, 1.75].map((x) => Math.round(x * r.rs));
    ok("button icons are sm 16 · md 20 · lg 28; lg strokes are 1.6, sm and md keep 2 (2026-11-18)",
      r.s.slice(0, 3).every((x, i) => x.w === want[i]) && r.s[0].sw === "2px" && r.s[1].sw === "2px" && r.s[2].sw === "1.6px" && r.s[3].w === want[2], JSON.stringify({ r, want }));
  });

  /* 2026-11-18 추가 수정 셋(사람의 요청) — 나란한 버튼은 .btn-group · 사이드 내비 접기 아이콘 회전 · 상단 바 로고 = shield-check */
  await part("12 · 나란한 버튼은 늘 .btn-group", async () => {
    const fs = require("fs"), path = require("path"), ROOT = path.join(__dirname, "..");
    const pages = [];
    for (const d of ["components", "patterns"]) for (const f of fs.readdirSync(path.join(ROOT, d))) if (f.endsWith(".html") && f !== "index.html") pages.push(d + "/" + f);
    /* 같은 줄에서 24 이내로 붙은 버튼(또는 버튼 하나를 감싼 Tooltip · Dropdown · Count · 알림 틀) 둘 이상의 부모 = .btn-group. 떨어진 버튼(폼 왼쪽 삭제 · 툴바 spacer 뒤 · 달력의 오늘 | 적용 ·
       Tooltip 위치 시연의 넓은 간격)은 붙어 있지 않아 세지 않는다. 예외 하나 — Button State 시연 표(버튼이 표의 내용이다, 사람의 결정 2026-11-18) */
    const scan = (root) => page.evaluate((sel) => {
      const isBtn = (e) => e.matches(".btn") || (e.matches(".tooltip-wrap, .dropdown, .with-count, .notify") && !!e.querySelector(".btn"));
      const bad = [];
      for (const top of document.querySelectorAll(sel)) for (const el of [top, ...top.querySelectorAll("*")]) {
        if (el.matches(".btn-group") || el.closest("#ex-button-state")) continue;
        const ks = [...el.children].filter((k) => isBtn(k) && k.getClientRects().length && getComputedStyle(k).visibility !== "hidden");
        for (let i = 1; i < ks.length; i++) {
          const a = ks[i - 1].getBoundingClientRect(), b = ks[i].getBoundingClientRect();
          const row = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > Math.min(a.height, b.height) / 2, gap = b.left - a.right;
          if (row && gap > -1 && gap <= 24) { bad.push(`${el.closest(".example")?.id || "?"} <${el.tagName.toLowerCase()}.${String(el.className).replace(/ /g, ".")}> ${(ks[i - 1].textContent.trim() || ks[i - 1].querySelector("[aria-label]")?.getAttribute("aria-label") || "").slice(0, 10)} · ${(ks[i].textContent.trim() || ks[i].querySelector("[aria-label]")?.getAttribute("aria-label") || "").slice(0, 10)}`); break; }
        }
      }
      return bad;
    }, root);
    const bad = [];
    for (const pg of pages) { await go(pg); bad.push(...(await scan(".example-preview")).map((x) => pg + " " + x)); }
    ok(`every component and pattern example puts side-by-side buttons in .btn-group (${pages.length} pages; Button State demo table excepted) (2026-11-18)`, pages.length >= 60 && bad.length === 0, bad.slice(0, 8).join(" | "));
    /* ds.js 가 그리는 줄 — 열린 Date Picker 달력 아래(글자 버튼 묶음 · 취소 적용 묶음), 실패한 파일 줄(다시 시도 · 지우기) */
    await go("components/date-picker.html");
    const open = page.locator('#ex-date-picker-range .datepicker:not([data-time]) .cal-btn').first();
    await open.click(); await wait(150);
    const foot = await page.evaluate(() => { const f = document.querySelector("#ex-date-picker-range .datepicker.open .cal-foot"); return f ? [...f.children].map((k) => k.matches(".btn-group") ? "[" + [...k.children].map((b) => b.textContent.trim()).join("|") + "]" : k.textContent.trim()).join(" ") : "none"; });
    const fbad = await scan("#ex-date-picker-range .datepicker.open .calendar");
    await page.keyboard.press("Escape"); await wait(80);
    ok("an open Date Picker footer groups its text buttons and its cancel/apply buttons separately (2026-11-18)", /^\[[^\]]+\|[^\]]+\]( \[[^\]]+\])?/.test(foot) && fbad.length === 0, foot + " " + fbad.join(" | "));
    await go("components/file-upload.html");
    const up = await page.evaluate(async () => {
      const ok = (x) => !x.hasAttribute("data-rejected") && !x.classList.contains("error") && !x.closest(".disabled, [aria-disabled=true]");
      const li = [...document.querySelectorAll(".example-preview .upload .upload-item")].find(ok), h = li.closest(".upload");
      const rm = li.querySelector(".remove"); rm.focus();
      window.DS.upload.fail(h, li.dataset.id, "x");
      const g = li.querySelector(":scope > .btn-group"), inG = g ? [...g.children].map((b) => b.classList.contains("retry") ? "retry" : b.classList.contains("remove") ? "remove" : "?").join(" ") : "none";
      const kept1 = document.activeElement === rm;
      window.DS.upload.progress(h, li.dataset.id, 40);
      return { inG, kept1, back: !li.querySelector(".btn-group") && rm.parentElement === li && !li.querySelector(".retry"), kept2: document.activeElement === rm };
    });
    ok("a failed file row puts retry + remove in .btn-group and unwraps when it goes back to one button, keeping focus on remove (2026-11-18)", up.inG === "retry remove" && up.kept1 && up.back && up.kept2, JSON.stringify(up));
  });

  await part("13 · 사이드 내비 접기 아이콘 회전", async () => {
    await go("components/top-navigation.html");
    const tg = page.locator("#ex-top-navigation-search [data-sidenav-toggle]");
    const rot = () => tg.evaluate((b) => { const s = getComputedStyle(b.querySelector("svg")); const m = s.transform === "none" ? [1, 0] : s.transform.match(/matrix\(([^)]+)\)/)[1].split(",").map(Number); return { deg: Math.round(Math.atan2(m[1], m[0]) * 180 / Math.PI), dur: s.transitionDuration, prop: s.transitionProperty, exp: b.getAttribute("aria-expanded") }; });
    const base = await page.evaluate(() => { const d = document.createElement("div"); d.style.transition = "transform var(--motion-base)"; document.body.append(d); const v = getComputedStyle(d).transitionDuration; d.remove(); return v; });
    const a = await rot();
    await tg.click(); const mid = await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))));
    const m = await rot(); await wait(320); const b = await rot();
    await tg.click(); await wait(320); const c = await rot();
    ok("the side nav toggle icon turns 180° when collapsed and back to 0° when expanded, animated with --motion-base (2026-11-18)",
      a.exp === "true" && Math.abs(a.deg) < 1 && b.exp === "false" && Math.abs(Math.abs(b.deg) - 180) < 1 && c.exp === "true" && Math.abs(c.deg) < 1 && a.dur === base && a.prop === "transform" && Math.abs(m.deg) > 0 && Math.abs(m.deg) < 180,
      JSON.stringify({ a, m, b, c, base, mid }));
    await page.emulateMedia({ reducedMotion: "reduce" });
    const r0 = await rot(); await tg.click(); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null)))); const r1 = await rot(); await tg.click(); await wait(30);
    await page.emulateMedia({ reducedMotion: null });
    ok("with reduced motion the toggle icon flips at once (no transition) (2026-11-18)", parseFloat(r0.dur) === 0 && Math.abs(Math.abs(r1.deg) - 180) < 1, JSON.stringify({ r0, r1 }));
  });

  await part("14 · 상단 바 로고 = shield-check", async () => {
    await go("components/top-navigation.html");
    const r = await page.evaluate(() => {
      const rs = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return { rs, logos: [...document.querySelectorAll(".topbar .logo")].map((l) => { const i = l.querySelector(":scope > i"), s = i && i.querySelector("svg"), cs = i && getComputedStyle(i);
        return { bg: cs && cs.backgroundColor, img: cs && cs.backgroundImage, r: cs && cs.borderTopLeftRadius, w: s && Math.round(s.getBoundingClientRect().width * 10) / 10, filled: !!(s && s.getAttribute("fill") === "currentColor"), svgColor: s && getComputedStyle(s).color, text: getComputedStyle(l).color }; }) };
    });
    ok("every top bar logo mark is the shield-check filled icon 24 in the logo text color — no brand square (2026-11-18)",
      r.logos.length >= 3 && r.logos.every((l) => l.bg === "rgba(0, 0, 0, 0)" && l.img === "none" && Math.abs(l.w - 1.5 * r.rs) < 0.6 && l.filled && l.svgColor === l.text), JSON.stringify(r));
  });

  await part("15 · Textarea 크기 셋", async () => {
    await go("components/text-field.html");
    const r = await page.evaluate(() => {
      const rs = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const pick = (id) => { const t = document.getElementById(id), cs = getComputedStyle(t), inp = document.querySelector(`#ex-text-field-size .field${id === "memo-s" ? ".sm" : id === "memo-l" ? ".lg" : ":not(.sm):not(.lg)"} input`), ic = inp && getComputedStyle(inp);
        return { h: t.getBoundingClientRect().height, fs: cs.fontSize, lh: cs.lineHeight, ls: cs.letterSpacing, r: cs.borderTopLeftRadius, pt: cs.paddingTop, pl: cs.paddingLeft, ifs: ic && ic.fontSize, ilh: ic && ic.lineHeight, ils: ic && ic.letterSpacing, ir: ic && ic.borderTopLeftRadius }; };
      return { rs, s: pick("memo-s"), m: pick("memo"), l: pick("memo-l") };
    });
    const near = (a, b) => Math.abs(parseFloat(a) - b * r.rs) < 0.6;
    ok("textarea sizes: min height 72 · 96 · 120 (4.5 · 6 · 7.5rem) and padding 8/12 · 10/14 · 12/16 (2026-11-18)",
      near(r.s.h, 4.5) && near(r.m.h, 6) && near(r.l.h, 7.5) && near(r.s.pt, 0.5) && near(r.s.pl, 0.75) && near(r.m.pt, 0.625) && near(r.m.pl, 0.875) && near(r.l.pt, 0.75) && near(r.l.pl, 1), JSON.stringify(r));
    ok("each textarea takes the font, line height, letter spacing and corner of the same-size one-line input (2026-11-18)",
      ["s", "m", "l"].every((k) => r[k].fs === r[k].ifs && r[k].lh === r[k].ilh && r[k].ls === r[k].ils && r[k].r === r[k].ir) && r.s.fs !== r.m.fs && r.l.fs !== r.m.fs, JSON.stringify(r));
  });

  await part("16 · 사이드 내비 안쪽 여백 20", async () => {
    const read = () => page.evaluate(() => {
      const rs = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return { rs, navs: [...document.querySelectorAll(".example-preview .sidenav")].map((n) => { const cs = getComputedStyle(n), a = n.querySelector("a"), nb = n.getBoundingClientRect(), ab = a.getBoundingClientRect();
        return { col: n.classList.contains("collapsed"), pt: parseFloat(cs.paddingTop), pb: parseFloat(cs.paddingBottom), pl: parseFloat(cs.paddingLeft), pr: parseFloat(cs.paddingRight), itemTop: ab.top - nb.top, itemL: ab.left - nb.left, itemW: ab.width }; }) };
    });
    await go("components/navigation.html");
    const a = await read();
    await go("components/top-navigation.html");
    const b = await read();
    const all = [...a.navs, ...b.navs], rs = a.rs, near = (x, v) => Math.abs(x - v * rs) < 0.6;
    ok("side nav padding is 1.25rem on every side; the collapsed rail keeps 1.25rem top · bottom and 0.625rem left · right (2026-11-18)",
      all.length >= 3 && all.some((n) => n.col) && all.every((n) => near(n.pt, 1.25) && near(n.pb, 1.25) && (n.col ? near(n.pl, 0.625) && near(n.pr, 0.625) : near(n.pl, 1.25) && near(n.pr, 1.25))), JSON.stringify(all));
    /* 접고 펼쳐도 첫 항목의 위 끝이 같다 — 상단 바 접기 버튼으로 같은 내비를 접어 잰다 */
    const t = await page.evaluate(async () => {
      const ex = document.querySelector("#ex-top-navigation-search"), nav = ex.querySelector(".sidenav"), btn = ex.querySelector("[data-sidenav-toggle]");
      const top = () => nav.querySelector("a").getBoundingClientRect().top - nav.getBoundingClientRect().top;
      const before = top(); btn.click(); await new Promise((r) => setTimeout(r, 50)); const col = nav.classList.contains("collapsed"), after = top(), w = nav.querySelector("a").getBoundingClientRect().width; btn.click();
      return { before, after, col, w };
    });
    ok("folding the side nav keeps the first item at the same height and the rail item fills 64 − 10 − 10 − the 1px right line (2026-11-18)", t.col && Math.abs(t.before - t.after) < 0.6 && Math.abs(t.w - (2.75 * rs - 1)) < 0.6, JSON.stringify(t));
  });

  /* 17 · 좁은 화면(2026-11-19 사람의 결정) — 화면 폭이 1280 아래로 줄면 접기 버튼이 가리키는 사이드 내비가 접히고, 다시 넓히면 펴진다.
     경계를 넘을 때만 맞추므로 그 사이 사용자가 바꾼 상태는 남는다. 접기 버튼이 없는 내비 · data-auto-collapse="false" 는 그대로 */
  await part("17 · 좁은 화면에서 사이드 내비 접힘", async () => {
    const path = require("path"), ROOT = path.resolve(__dirname, "..");
    const c = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
    try {
      const st = () => p.evaluate(() => { const n = document.querySelector(".sidenav"), t = document.querySelector("[data-sidenav-toggle]"), rs = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return { col: n.classList.contains("collapsed"), w: n.getBoundingClientRect().width / rs, exp: t.getAttribute("aria-expanded"), name: t.getAttribute("aria-label"), ev: (window.__ev || []).join(",") }; });
      const scr = (k) => "file://" + path.join(ROOT, "templates", "screen", k + ".html");
      await p.goto(scr("dashboard")); await p.waitForTimeout(300);
      await p.evaluate(() => { window.__ev = []; document.addEventListener("ds:sidenav", (e) => window.__ev.push(e.detail.collapsed + ":" + e.detail.trigger)); });
      const seq = [["load 1440", await st()]];
      const step = async (lbl, f) => { await f(); await p.waitForTimeout(200); seq.push([lbl, await st()]); };
      const vw = (w) => () => p.setViewportSize({ width: w, height: 900 }), tg = () => p.click("[data-sidenav-toggle]");
      await step("1024", vw(1024)); await step("click1", tg); await step("1100", vw(1100)); await step("1440", vw(1440));
      await step("click2", tg); await step("1600", vw(1600)); await step("1024b", vw(1024));
      const g = Object.fromEntries(seq), near = (x, v) => Math.abs(x - v) < 0.05;
      ok("templates: narrowing below 1280 collapses the side nav (4rem rail, '메뉴 펼치기', ds:sidenav trigger width); widening back to 1280+ expands it; a manual change inside a range stays until the next crossing (2026-11-19)",
        !g["load 1440"].col && near(g["load 1440"].w, 15) && g["1024"].col && near(g["1024"].w, 4) && g["1024"].exp === "false" && g["1024"].name === "메뉴 펼치기"
        && !g.click1.col && !g["1100"].col && !g["1440"].col && g.click2.col && g["1600"].col && g["1024b"].col
        && g["1024b"].ev === "true:width,false:button,true:button", JSON.stringify(seq));
      const loads = [];
      for (const [w, k] of [[1279, "dashboard"], [1024, "list"], [768, "org"], [1280, "policy"]]) { await p.setViewportSize({ width: w, height: 900 }); await p.goto(scr(k)); await p.waitForTimeout(250); loads.push([w, k, (await st()).col]); }
      ok("templates: a screen opened below 1280 starts collapsed, at 1280 starts expanded (2026-11-19)", loads.every(([w, , col]) => col === (w < 1280)), JSON.stringify(loads));
      /* 문서 페이지 — 접기 버튼이 있는 예제만 접히고 정적 Expanded 시연은 그대로 */
      await p.setViewportSize({ width: 1024, height: 900 }); await p.goto("file://" + path.join(ROOT, "components", "navigation.html")); await p.waitForTimeout(300);
      const nv = await p.evaluate(() => [...document.querySelectorAll(".example-preview .sidenav")].map((n) => [n.closest("section.example").id, n.classList.contains("collapsed")]));
      await p.goto("file://" + path.join(ROOT, "components", "top-navigation.html")); await p.waitForTimeout(300);
      const tn = await p.evaluate(() => [...document.querySelectorAll(".example-preview .sidenav")].map((n) => [n.closest("section.example").id, n.classList.contains("collapsed"), !!document.querySelector(`[data-sidenav-toggle][aria-controls="${n.id}"]`)]));
      ok("docs at 1024: only side navs a collapse button points at fold; static Navigation demos keep their own state (2026-11-19)",
        nv.length >= 2 && nv.some(([id, col]) => id === "ex-navigation-basic" && !col) && tn.length >= 1 && tn.every(([, col, hasBtn]) => col === hasBtn), JSON.stringify({ nv, tn }));
      /* data-auto-collapse="false" — 같은 화면에 달고 경계를 넘긴다 */
      await p.setViewportSize({ width: 1440, height: 900 }); await p.goto(scr("dashboard")); await p.waitForTimeout(250);
      await p.evaluate(() => document.querySelector(".sidenav").setAttribute("data-auto-collapse", "false"));
      await p.setViewportSize({ width: 1024, height: 900 }); await p.waitForTimeout(200);
      const off = await st();
      ok("data-auto-collapse=\"false\" keeps the side nav as it is across the 1280 boundary (2026-11-19)", !off.col && off.exp === "true", JSON.stringify(off));
    } finally { await c.close(); }
  });
};
