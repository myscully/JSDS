/* Data Visual 한 세트(사람의 결정 2026-11-15) — behave.js 가 부른다.
   - 한 톤: tone 없는 계열 · 조각은 --chart-mono-1~4(계열 수에 따라 1 · 1·4 · 1·2·4 · 1~4 단계), 5개를 넘으면 --chart-series-1~6. 심각도는 tone 그대로. 제품 색과 무관
   - 강조 막대(단색 — 그라데이션은 2026-11-20 에 없앰) · 계열 하나 영역 · 실선 격자 — 픽셀로 잰다
   - 게이지(반원 · 채운 비율 = value / max) · 스파크(높이 40 · 축 없음) · 진행 막대 목록(폭 = 값 / 목표 · meter)
   - 증감 배지(색 = 의미) · 차트 카드 틀(머리 32 · 같은 줄 정렬 · 높이 단계 · 상태) · 대시보드 */
module.exports = async function chart({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.chart", () => page);
  const theme = async (t) => { await page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t); await wait(300); };
  /* 차트의 칠 — 데이터셋마다 배경 · 선 색(배열이면 조각마다)과 토큰 계산값 */
  const paints = () => page.evaluate(() => {
    const T = window.DSChart.theme(document.documentElement);
    const of = (sel) => { const c = document.querySelector(sel); const ch = c && c.__dsChart && c.__dsChart.chart; if (!ch) return null;
      return ch.data.datasets.map((d) => ({ bg: d.backgroundColor, line: d.borderColor, fill: d.fill })); };
    return { T: { mono: T.mono, series: T.series, tone: T.tone, track: T.track }, weeks: of("#ex-data-visual-bars canvas[data-chart]"), depts: of("#ex-data-visual-bars .chart-card:nth-child(2) canvas[data-chart]"),
      daily: of("#ex-data-visual-default canvas[data-chart]"), channels: of("#ex-data-visual-donut-live canvas[data-chart]"), os: of("#ex-data-visual-donut-categorical canvas[data-chart]"),
      trend: of("#ex-data-visual-timeseries canvas[data-chart]"), weekday: of("#ex-data-visual-bar-emphasis canvas[data-chart]") };
  });
  const monoOk = (p) => p.weeks && JSON.stringify(p.weeks.map((d) => d.bg)) === JSON.stringify([p.T.mono[0], p.T.mono[3]])
    && p.daily && p.daily[0].line === p.T.mono[0]
    && p.channels && JSON.stringify(p.channels[0].bg) === JSON.stringify(p.T.mono)
    && p.os && JSON.stringify(p.os[0].bg) === JSON.stringify(p.T.series)
    && p.trend && JSON.stringify(p.trend.map((d) => d.line)) === JSON.stringify([p.T.tone.critical, p.T.tone.high, p.T.tone.medium])
    && p.depts && JSON.stringify(p.depts.map((d) => d.bg)) === JSON.stringify(["critical", "high", "medium", "low", "info"].map((k) => p.T.tone[k]));
  const short = (p) => JSON.stringify({ T: p.T.mono, weeks: p.weeks && p.weeks.map((d) => d.bg), daily: p.daily && p.daily[0].line, channels: p.channels && p.channels[0].bg, os: p.os && p.os[0].bg });

  await part("1 · 한 톤 — 계열 수에 따른 단계 · 범주색 · 심각도 tone · 제품 색과 무관", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/data-visual.html"); await wait(600);
    const light = await paints();
    ok("chart colour: tone-less series take the mono steps by count (2 → 1·4, 1 → 1, 4 slices → 1~4), 6 slices fall back to series 1~6, severity keeps its tones (light)", monoOk(light), short(light));
    await theme("dark");
    const dark = await paints();
    ok("chart colour: the same rule holds in dark with the dark mono steps", monoOk(dark) && dark.T.mono[0] !== light.T.mono[0], short(dark));
    await theme(null);
    const before = JSON.stringify(light.weeks.map((d) => d.bg));
    const after = {};
    for (const key of ["red", "orange"]) { await page.evaluate((k) => document.documentElement.setAttribute("data-accent", k), key); await wait(300); const p = await paints(); after[key] = JSON.stringify(p.weeks.map((d) => d.bg)) + JSON.stringify(p.daily[0].line); }
    await page.evaluate(() => document.documentElement.removeAttribute("data-accent")); await wait(200);
    ok("chart colour: red and orange products leave the chart blue (charts do not follow the product colour)", after.red === after.orange && after.red.startsWith(before), JSON.stringify({ before, after }));
    /* 정적: 막대 · 진행 막대 = mono-1, 스파크라인 = mono-4 · 강조 mono-1, 정적 도넛 .mono 의 조각 색과 누적 % */
    const st = await page.evaluate(() => {
      const tok = (v) => { const d = document.createElement("i"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      const bg = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).backgroundColor : null; };
      return { m1: tok("--chart-mono-1"), m2: tok("--chart-mono-2"), m3: tok("--chart-mono-3"), m4: tok("--chart-mono-4"),
        bar: bg("#ex-data-visual-bar .chart .bar i"), prog: bg("#ex-data-visual-progress .progress i"), spark: bg("#ex-data-visual-spark .sparkline i:not(.hi)"), hi: bg("#ex-data-visual-spark .sparkline i.hi"),
        donut: getComputedStyle(document.querySelector("#ex-data-visual-donut .donut.mono")).backgroundImage };
    });
    const stops = [...new Set(st.donut.match(/rgb\([^)]+\)/g) || [])];   // 조각마다 시작 · 끝 두 번 나온다
    ok("static charts are mono: bar · progress fill = mono-1, sparkline = mono-4 with mono-1 highlight, static .mono donut = mono 1~4 at the --d stops",
      st.bar === st.m1 && st.prog === st.m1 && st.spark === st.m4 && st.hi === st.m1 && JSON.stringify(stops) === JSON.stringify([st.m1, st.m2, st.m3, st.m4]) && /58\.06%/.test(st.donut) && /81\.59%/.test(st.donut) && /94\.02%/.test(st.donut),
      JSON.stringify(st));
  });

  /* 캔버스 픽셀 — 장치 픽셀 비율을 곱해 읽는다 */
  const px = (sel, pts) => page.evaluate(([sel, pts]) => {
    const c = document.querySelector(sel), ctx = c.getContext("2d"), r = c.width / c.getBoundingClientRect().width;
    return pts.map(([x, y]) => { const d = ctx.getImageData(Math.round(x * r), Math.round(y * r), 1, 1).data; return [d[0], d[1], d[2], d[3]]; });
  }, [sel, pts]);
  const rgbOf = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
  const near = (a, b, d = 14) => a.every((v, i) => Math.abs(v - b[i]) <= d);

  await part("2 · 강조 · 영역 · 실선 격자", async () => {
    const hi = await page.evaluate(() => { const ch = document.querySelector("#ex-data-visual-bar-emphasis canvas[data-chart]").__dsChart.chart, T = window.DSChart.theme(document.documentElement);
      return { bg: ch.data.datasets[0].backgroundColor, m1: T.mono[0], m4: T.mono[3] }; });
    ok("bar highlight: only bar 4 (Friday) takes mono-1, the rest mono-4", Array.isArray(hi.bg) && hi.bg.length === 7 && hi.bg.every((c, i) => c === (i === 4 ? hi.m1 : hi.m4)), JSON.stringify(hi));
    /* 그라데이션 옵션은 2026-11-20 에 없앴다(사람의 결정) — 둘째 카드(월별)도 단색 강조: 이번 달 막대가 위 · 아래 끝까지 불투명 mono-1 */
    const sel = "#ex-data-visual-bar-emphasis .chart-card:nth-child(2) canvas[data-chart]";
    const geo = await page.evaluate((sel) => { const ch = document.querySelector(sel).__dsChart.chart, b = ch.getDatasetMeta(0).data[5]; return { x: b.x, top: b.y, base: b.base, m1: window.DSChart.theme(document.documentElement).mono[0], spec: JSON.parse(document.querySelector(sel).dataset.spec) }; }, sel);
    const [top, bottom] = await px(sel, [[geo.x, geo.top + 6], [geo.x, geo.base - 3]]);
    const m1 = rgbOf(geo.m1);
    ok("bar emphasis is a solid colour — the highlighted bar is opaque mono-1 at the value end and at the baseline, and the spec has no gradient", near(top.slice(0, 3), m1) && top[3] > 240 && near(bottom.slice(0, 3), m1) && bottom[3] > 240 && !("gradient" in geo.spec), JSON.stringify({ top, bottom, m1, spec: Object.keys(geo.spec) }));
    /* 다크로 바꾸면 다크 mono-1 로 다시 칠한다 */
    await theme("dark");
    const geoD = await page.evaluate((sel) => { const ch = document.querySelector(sel).__dsChart.chart, b = ch.getDatasetMeta(0).data[5]; return { x: b.x, top: b.y, base: b.base, m1: window.DSChart.theme(document.documentElement).mono[0] }; }, sel);
    const [topD] = await px(sel, [[geoD.x, geoD.top + 6]]);
    await theme(null);
    ok("bar emphasis repaints in dark with the dark mono-1", geoD.m1 !== geo.m1 && near(topD.slice(0, 3), rgbOf(geoD.m1)) && topD[3] > 240, JSON.stringify({ topD, m1: geoD.m1 }));
    const area = await page.evaluate(() => { const ch = document.querySelector("#ex-data-visual-default canvas[data-chart]").__dsChart.chart, a = ch.chartArea, p = ch.getDatasetMeta(0).data[10]; return { fill: ch.data.datasets[0].fill, x: p.x, y: (p.y + a.bottom) / 2, bottom: a.bottom }; });
    const [under] = await px("#ex-data-visual-default canvas[data-chart]", [[area.x, area.y]]);
    ok("single-series timeseries fills under the line (fill origin, tinted pixel between line and axis)", area.fill === "origin" && under[3] > 0 && !(under[0] > 245 && under[1] > 245 && under[2] > 245), JSON.stringify({ area, under }));
    /* 격자는 실선 hairline(2026-11-20 사람의 결정 — dataviz '점선은 투영 · 기준선으로 읽힘'). 11-15 의 점선 3 · 3 을 바꿨다 */
    const grid = await page.evaluate(() => { const ch = document.querySelector("#ex-data-visual-default canvas[data-chart]").__dsChart.chart, y = ch.scales.y, a = ch.chartArea;
      return { y: y.getPixelForTick(y.ticks.length - 1), left: a.left, dash: ch.options.scales.y.border.dash, w: ch.options.scales.y.grid.lineWidth }; });
    const row = await px("#ex-data-visual-default canvas[data-chart]", Array.from({ length: 40 }, (_, i) => [grid.left + 4 + i, grid.y]));
    let flips = 0; for (let i = 1; i < row.length; i++) if ((row[i][3] > 5) !== (row[i - 1][3] > 5)) flips++;   // 맨 위 눈금 줄(영역 칠 위)에서 잰다
    ok("horizontal grid lines are solid 1px hairlines — no dash pattern and the ink runs unbroken along a grid line", !(Array.isArray(grid.dash) && grid.dash.length) && (grid.w === undefined || grid.w === 1) && flips === 0 && row.every((p) => p[3] > 5), JSON.stringify({ grid, flips }));
  });

  await part("3 · 게이지 · 스파크 · 진행 막대 목록", async () => {
    const g = await page.evaluate(() => { const ch = document.querySelector("#ex-data-visual-gauge canvas[data-chart]").__dsChart.chart, [a, b] = ch.getDatasetMeta(0).data, T = window.DSChart.theme(document.documentElement);
      return { a: [a.startAngle, a.endAngle], b: [b.startAngle, b.endAngle], legend: ch.options.plugins.legend.display, tip: ch.options.plugins.tooltip.enabled, center: ch.$ds.center, caption: ch.$ds.caption, bg: ch.data.datasets[0].backgroundColor, m1: T.mono[0], track: T.track }; });
    const P = Math.PI, share = (g.a[1] - g.a[0]) / P;
    ok("gauge: upper half circle (−π → 0), filled arc = 842 / 1,284, mono-1 on the track, centre text, no legend or tooltip",
      Math.abs(g.a[0] + P) < 0.01 && Math.abs(g.b[1]) < 0.01 && Math.abs(share - 842 / 1284) < 0.005 && g.bg[0] === g.m1 && g.bg[1] === g.track && g.legend === false && g.tip === false && g.center === "66%" && g.caption === "패치 적용", JSON.stringify(g));
    const s = await page.evaluate(() => { const box = document.querySelector("#ex-data-visual-spark .kpi > .chart-canvas.spark"), ch = box.querySelector("canvas").__dsChart.chart;
      return { h: box.getBoundingClientRect().height, last: box === box.parentElement.lastElementChild, x: ch.options.scales.x.display, y: ch.options.scales.y.display, legend: ch.options.plugins.legend.display, fill: ch.data.datasets[0].fill }; });
    ok("spark: 40 tall at the bottom of the KPI, no axes or legend, filled under the line", s.h === 40 && s.last && s.x === false && s.y === false && s.legend === false && s.fill === "origin", JSON.stringify(s));
    const pl = await page.evaluate(() => [...document.querySelectorAll("#ex-data-visual-progress .progress")].map((m) => {
      const i = m.firstElementChild, c = getComputedStyle(m);
      return { r: i.getBoundingClientRect().width / m.getBoundingClientRect().width, want: +m.getAttribute("aria-valuenow") / +m.getAttribute("aria-valuemax"), role: m.getAttribute("role"), name: document.getElementById(m.getAttribute("aria-labelledby"))?.textContent, text: m.getAttribute("aria-valuetext"), radius: c.borderTopLeftRadius + getComputedStyle(i).borderTopLeftRadius, h: m.getBoundingClientRect().height };
    }));
    ok("progress list: fill width = value / target, role=meter with a name and value text, square, 8 tall", pl.length === 4 && pl.every((x) => Math.abs(x.r - x.want) < 0.006 && x.role === "meter" && x.name && /\/.*%$/.test(x.text) && x.radius === "0px0px" && x.h === 8), JSON.stringify(pl));
  });

  await part("4 · 증감 배지 — 색은 의미", async () => {
    const d = await page.evaluate(() => {
      const tok = (v, p) => { const e = document.createElement("i"); e.style[p] = `var(${v})`; document.querySelector("#ex-data-visual-kpi .kpi").append(e); const c = getComputedStyle(e)[p]; e.remove(); return c; };
      const one = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { bg: c.backgroundColor, fg: c.color, size: c.fontSize, lh: c.lineHeight, w: c.fontWeight, pad: c.padding, sr: e.querySelector(".sr-only")?.textContent || "", h: e.getBoundingClientRect().height }; };
      return { bad: one("#ex-data-visual-kpi .delta.bad"), good: one("#ex-data-visual-kpi .delta.good"), neutral: one("#ex-data-visual-default .delta"),
        W: { badBg: tok("--surface-negative-primary", "backgroundColor"), badFg: tok("--foreground-negative-heavy", "color"), goodBg: tok("--surface-positive-primary", "backgroundColor"), goodFg: tok("--foreground-positive-heavy", "color") },
        old: document.querySelectorAll(".delta.up, .delta.down").length };
    });
    ok("delta badge: bad = negative tint + heavy text, good = positive tint + heavy text, Tag sm size (11/14 · 600 · 2px 8px · 18 tall), hidden 증가 · 감소, no .up/.down left",
      d.bad && d.good && d.bad.bg === d.W.badBg && d.bad.fg === d.W.badFg && d.good.bg === d.W.goodBg && d.good.fg === d.W.goodFg && d.bad.size === "11px" && d.bad.lh === "14px" && d.bad.w === "600" && d.bad.pad === "2px 8px" && d.bad.h === 18 && d.bad.sr === "증가" && d.good.sr === "증가" && d.old === 0,
      JSON.stringify(d));
  });

  await part("5 · 카드 틀 — 머리 32 · 같은 줄 정렬 · 높이 단계 · 상태", async () => {
    const heads = await page.evaluate(() => [...document.querySelectorAll(".example-preview .chart-card > .chart-head")].map((h) => Math.round(h.getBoundingClientRect().height * 100) / 100));
    ok("every chart card head is 32 tall, with or without an action", heads.length >= 20 && heads.every((h) => h === 32), JSON.stringify(heads));
    const rows = {};
    for (const w of [1024, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 }); await wait(400);
      rows[w] = await page.evaluate(() => { const cards = [...document.querySelectorAll("#ex-data-visual-set .chart-card")];
        return cards.map((c) => { const h = c.querySelector(".chart-head").getBoundingClientRect(), body = c.querySelector(".chart-head").nextElementSibling.getBoundingClientRect(), r = c.getBoundingClientRect();
          return { y: Math.round(r.top), head: Math.round(h.bottom), body: Math.round(body.top), card: Math.round(r.height), canvasH: c.querySelector(".chart-canvas") ? Math.round(c.querySelector(".chart-canvas").getBoundingClientRect().height) : null }; }); });
    }
    const aligned = (cs) => { const line = cs.filter((c) => c.y === cs[0].y); return line.length >= 2 && line.every((c) => c.head === line[0].head && c.body === line[0].body && c.card === line[0].card); };
    ok("set: cards of different kinds on one line share the head bottom, body top and card height (1024 · 1440 · 1920)", Object.values(rows).every(aligned), JSON.stringify(rows));
    await page.setViewportSize({ width: 1440, height: 900 }); await wait(300);
    const size = await page.evaluate(() => [...document.querySelectorAll("#ex-data-visual-size .chart-card .chart-canvas")].map((e) => e.getBoundingClientRect().height));
    ok("size: chart body is 160 · 240 · 320 for sm · md · lg", JSON.stringify(size) === "[160,240,320]", JSON.stringify(size));
    const states = await page.evaluate(() => { const cs = [...document.querySelectorAll("#ex-data-visual-state .chart-card")];
      let fired = 0; cs[2].addEventListener("ds:retry", () => fired++); cs[2].querySelector("[data-retry]").click();
      return { h: cs.map((c) => c.querySelector(".chart-state").getBoundingClientRect().height), busy: cs[0].getAttribute("aria-busy"), status: !!cs[0].querySelector(".skeleton[role=status]"), empty: !!cs[1].querySelector(".empty:not(.error)"), fired }; });
    ok("state: loading · empty · error keep the 240 body, loading is aria-busy with a status skeleton, retry fires ds:retry on the card", states.h.every((h) => h === 240) && states.busy === "true" && states.status && states.empty && states.fired === 1, JSON.stringify(states));
  });

  await part("6 · 대시보드 — 한 세트", async () => {
    await go("patterns/dashboard.html"); await wait(700);
    const r = await page.evaluate(() => {
      const row = (sel) => [...document.querySelectorAll(`#ex-dashboard-full ${sel} > .chart-card`)].map((c) => { const h = c.querySelector(".chart-head"); return { head: Math.round(h.getBoundingClientRect().bottom), body: Math.round(h.nextElementSibling.getBoundingClientRect().top), card: Math.round(c.getBoundingClientRect().height), top: Math.round(c.getBoundingClientRect().top) }; });
      const T = window.DSChart.theme(document.documentElement), bar = document.querySelector('#ex-dashboard-full .row-2 canvas[data-chart="bar"]').__dsChart.chart;
      return { r3: row(".row-3"), r2: row(".row-2"), sparks: document.querySelectorAll("#ex-dashboard-full .kpi > .chart-canvas.spark canvas").length, deltas: [...document.querySelectorAll("#ex-dashboard-full .delta")].map((d) => d.className),
        bar: bar.data.datasets.map((d) => d.backgroundColor), mono: [T.mono[0], T.mono[3]], meters: document.querySelectorAll('#ex-dashboard-full .progress-list [role="meter"]').length };
    });
    const same = (cs) => cs.length === 2 && cs[0].top === cs[1].top && cs[0].head === cs[1].head && cs[0].body === cs[1].body && cs[0].card === cs[1].card;
    ok("dashboard: both chart rows line up (head bottom · body top · card height), no KPI sparks (2026-11-18 — KPI 기본은 스파크 없음), meaning-coloured deltas, mono weekly bars, four meters",
      same(r.r3) && same(r.r2) && r.sparks === 0 && JSON.stringify(r.deltas) === JSON.stringify(["delta bad", "delta good", "delta bad"]) && JSON.stringify(r.bar) === JSON.stringify(r.mono) && r.meters === 4, JSON.stringify(r));
    /* 애니메이션 도중 들어와 미뤄진 크기 변경은 애니메이션이 끝날 때 적용된다(2026-11-20 — 그리기 없이 끝나는 틱에 들어온 변경이 영영 남아
       부하가 걸리면 390 에서 선 차트가 445 로 남았다). 경합 자체는 시간에 달려 있어, 끝날 때 부르는 콜백이 미뤄 둔 값을 적용하는지를 직접 잰다 */
    const fl = await page.evaluate(() => [...document.querySelectorAll("#ex-dashboard-full canvas[data-chart]")].map((cv) => { const ch = cv.__dsChart.chart; window.Chart.animator.stop(ch); const w0 = ch.width, h0 = ch.height, on = ch.options.animation && ch.options.animation.onComplete;
      if (typeof on !== "function") return { kind: cv.dataset.chart, on: false };
      ch._resizeBeforeDraw = { width: w0 - 40, height: h0 }; on({ chart: ch }); const r = { kind: cv.dataset.chart, on: true, applied: Math.round(ch.width) === Math.round(w0 - 40), cleared: ch._resizeBeforeDraw === null };
      ch.resize(); return r; }));
    ok("dashboard: a resize deferred during an animation is applied when the animation completes (every chart)", fl.length >= 3 && fl.every((f) => f.on && f.applied && f.cleared), JSON.stringify(fl));
    /* 첫 등장 애니메이션 — 200ms 로 돌고(항목마다 프레임만큼 더해 재면 230 ~ 252 — Chart.js 기본 1000ms 가 아님), 줄인 모션이면 아예 없다(2026-11-20) */
    const firstAnim = async () => { await go("patterns/dashboard.html"); await wait(80);
      return page.evaluate(() => [...document.querySelectorAll("#ex-dashboard-full canvas[data-chart]")].map((cv) => { const ch = cv.__dsChart.chart, a = window.Chart.animator._charts.get(ch);
        return { kind: cv.dataset.chart, running: window.Chart.animator.running(ch), dur: a ? a.duration : 0 }; })); };
    const normal = await firstAnim();
    await page.emulateMedia({ reducedMotion: "reduce" }); const reduced = await firstAnim(); await page.emulateMedia({ reducedMotion: null });
    ok("dashboard: the first chart animation is the adapter's 200ms (under 300 measured, not Chart.js's 1000ms default), and with reduced motion no chart animates at all",
      normal.length >= 3 && normal.every((c) => c.dur > 0 && c.dur < 300) && reduced.length === normal.length && reduced.every((c) => !c.running), JSON.stringify({ normal, reduced }));
    await go("patterns/dashboard.html"); await wait(700);
    /* 390 — 두 줄 모두 한 칸으로 쌓이고 카드 · 도넛 · 제목이 잘리지 않는다 */
    const vp = page.viewportSize(); await page.setViewportSize({ width: 390, height: 900 }); await wait(500);
    const n = await page.evaluate(() => { const rows = [".row-3", ".row-2"].map((s) => [...document.querySelectorAll(`#ex-dashboard-full ${s} > .chart-card`)]);
      return { cols: rows.map((cs) => new Set(cs.map((c) => Math.round(c.getBoundingClientRect().left))).size),
        spill: [...document.querySelectorAll("#ex-dashboard-full .chart-card")].filter((c) => c.scrollWidth > c.clientWidth + 1 || [...c.querySelectorAll(".donut, canvas")].some((e) => e.getBoundingClientRect().right > c.getBoundingClientRect().right + 0.5)).length,
        cut: [...document.querySelectorAll("#ex-dashboard-full .chart-title")].filter((t) => t.scrollWidth > t.clientWidth + 1).map((t) => t.textContent) }; });
    /* 같은 390 — 머리 부제는 띄어쓰기에서만 줄바꿈(낱말마다 글자들의 줄이 같음), 최근 이벤트 표는 칸이 한 줄이고 틀이 가로로 스크롤(2026-11-15).
       부제는 분석 패턴에서 잰다 — 2026-11-20 대시보드 머리에서 기간 버튼을 빼자 대시보드 부제가 390 에서도 한 줄이 되어 줄바꿈을 잴 수 없다(같은 .page-head .sub 규칙) */
    const subWrap = (sel) => page.evaluate((sel) => {
      const sub = document.querySelector(sel), node = sub.firstChild, text = node.textContent, tops = [];
      for (let i = 0; i < text.length; i++) { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); tops.push(Math.round(r.getBoundingClientRect().top)); }
      let split = [], i = 0; for (const word of text.split(" ")) { const t = new Set(tops.slice(i, i + word.length)); if (t.size > 1) split.push(word); i += word.length + 1; }
      return { lines: new Set(tops).size, split };
    }, sel);
    const w = await page.evaluate(() => {
      const sub = document.querySelector("#ex-dashboard-full .page-head .sub"), node = sub.firstChild, text = node.textContent, tops = [];
      for (let i = 0; i < text.length; i++) { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); tops.push(Math.round(r.getBoundingClientRect().top)); }
      let split = [], i = 0; for (const word of text.split(" ")) { const t = new Set(tops.slice(i, i + word.length)); if (t.size > 1) split.push(word); i += word.length + 1; }
      const wrap = document.querySelector("#ex-dashboard-full .card .tbl-wrap"), tbl = wrap && wrap.querySelector("table.tbl.nowrap");
      return { lines: new Set(tops).size, split, wrapped: !!tbl, scrolls: wrap ? wrap.scrollWidth > wrap.clientWidth : false,
        rows: tbl ? [...tbl.tBodies[0].rows].map((r) => Math.round(r.getBoundingClientRect().height)) : [], row: Math.round(3 * parseFloat(getComputedStyle(document.documentElement).fontSize)) };   // 행 3rem — 1279 이하는 루트 93.75% 라 45
    });
    await go("patterns/analytics.html"); await wait(500);
    const aw = await subWrap("#ex-analytics-default .page-head .sub");
    await page.setViewportSize(vp); await wait(300);
    ok("dashboard at 390: chart rows stack into one column, nothing spills past its card and no card title is cut", n.cols.every((c) => c === 1) && n.spill === 0 && n.cut.length === 0, JSON.stringify(n));
    ok("at 390 the page-head subtitle breaks only at spaces (analytics), and the dashboard's recent-events table keeps one-line 3rem rows and scrolls sideways", aw.lines > 1 && aw.split.length === 0 && w.wrapped && w.scrolls && w.rows.length === 3 && w.rows.every((h) => h === w.row), JSON.stringify({ sub: aw, ...w }));
  });
};
