/* 차트 · 대시보드 레이아웃 최적화(dataviz · design-elevation · page-patterns — 사람의 결정 2026-11-20) — behave.js 가 부른다.
   - 막대: 값 쪽 끝만 4px 둥글게 · 바닥은 각짐 · 두께 최대 24 · 누적 조각과 맞닿은 묶음 막대 사이 2px 면 색 틈(테두리로 가르지 않음)
   - 격자는 값 축에만(가로 막대면 x) · 선은 둥근 끝 · hover 점 링 2 · 영역은 계열 색 10% 단색
   - 툴팁: 선 · 영역 차트에 세로 crosshair, 값이 먼저 굵게 · 계열 키는 짧은 선 · 숫자는 ko-KR(축이 1만에 닿으면 만 단위)
   - 색은 계열을 따름(slot) · 스파크 끝 점 · 다시 불러오는 동안 지난 그림을 흐리게(레이아웃 그대로)
   - 정적 막대 끝 4 · 진행 막대 · 게이지 트랙 = 같은 파랑의 옅은 단계(--chart-mono-track)
   - 대시보드는 훑어보기만(기간 컨트롤 없음), 분석 패턴은 필터 한 줄이 카드 밖 · 차트 위 */
module.exports = async function dataviz({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const part = require("./behave.part")(ok, "behave.dataviz", () => page);
  const theme = async (t) => { await page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t); await wait(400); };

  await part("1 · 막대 모양 — 끝 4 · 바닥 각짐 · 24 · 틈 2", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/data-visual.html"); await wait(900);
    const r = await page.evaluate(() => {
      const chartOf = (sel) => { const c = document.querySelector(sel); return c && c.__dsChart && c.__dsChart.chart; };
      const alphaAt = (ch, x, y) => { const cv = ch.canvas, k = cv.width / cv.clientWidth; return cv.getContext("2d").getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data[3]; };
      /* 한 계열 막대(요일별 강조) — 요소의 해석된 옵션과 픽셀 */
      const one = chartOf("#ex-data-visual-bar-emphasis canvas[data-chart]");
      const els = one.getDatasetMeta(0).data, o = els[0].options;
      const tall = els.reduce((a, e) => (e.base - e.y > a.base - a.y ? e : a), els[0]);
      const L = tall.x - tall.width / 2, R = tall.x + tall.width / 2;
      const single = { widths: els.map((e) => +e.width.toFixed(2)), radius: o.borderRadius, skipped: o.borderSkipped, inflate: o.inflateAmount,
        /* 네 모서리 모두 각져 차 있다(2026-11-24 — 11-20 의 값 끝 4px 를 지움) */
        topCorner: alphaAt(one, L + 0.6, tall.y + 0.6), baseCorner: alphaAt(one, L + 0.6, tall.base - 0.8), mid: alphaAt(one, tall.x, (tall.y + tall.base) / 2), right: R };
      /* 묶음 막대(주간 비교 — 2계열): 한 칸 안 두 막대 사이 = 2px, 그 틈의 픽셀은 비었다(카드 면이 보임) */
      const grp = chartOf("#ex-data-visual-bars canvas[data-chart]");
      const a = grp.getDatasetMeta(0).data, b = grp.getDatasetMeta(1).data;
      const gaps = a.map((e, j) => +((b[j].x - b[j].width / 2) - (e.x + e.width / 2)).toFixed(2));
      const j0 = 2, lo = Math.max(a[j0].y, b[j0].y), gx = (a[j0].x + a[j0].width / 2 + b[j0].x - b[j0].width / 2) / 2;
      const group = { gaps, widths: a.concat(b).map((e) => +e.width.toFixed(2)), gapAlpha: alphaAt(grp, gx, (lo + a[j0].base) / 2), barAlpha: alphaAt(grp, a[j0].x, (lo + a[j0].base) / 2) };
      return { single, group };
    });
    /* 바닥에서 자라고 모서리는 모두 각지다(사람의 결정 2026-11-24). 두께는 칸을 채우지 않고 24 에서 멈춘다 */
    ok("bars: square corners (radius 0) · base square (borderSkipped start) · no inflation · ≤ 24 thick (single series)",
      r.single.radius === 0 && r.single.skipped === "start" && r.single.inflate === 0 && r.single.widths.every((w) => w <= 24.01), JSON.stringify(r.single));
    ok("bars: in pixels both the value-end corner and the base corner are filled (square)", r.single.topCorner > 200 && r.single.baseCorner > 200 && r.single.mid > 240, JSON.stringify(r.single));
    /* dataviz 'Surface gap' — 맞닿은 막대도 누적 조각과 같은 2px 면 색 틈으로 갈린다 */
    ok("bars: grouped bars in one slot are 2px apart, ≤ 24 thick, and the gap shows the surface", r.group.gaps.every((g) => g >= 1.5 && g <= 2.5) && r.group.widths.every((w) => w <= 24.01) && r.group.gapAlpha < 30 && r.group.barAlpha > 240, JSON.stringify(r.group));
  });

  await part("2 · 누적 틈 · 가로 막대 격자 축", async () => {
    await go("patterns/analytics.html"); await wait(900);
    const r = await page.evaluate(() => {
      const chartOf = (sel) => { const c = document.querySelector(sel); return c && c.__dsChart && c.__dsChart.chart; };
      const alphaAt = (ch, x, y) => { const cv = ch.canvas, k = cv.width / cv.clientWidth; return cv.getContext("2d").getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data[3]; };
      const all = [...document.querySelectorAll("#ex-analytics-default canvas[data-chart]")].map((c) => c.__dsChart && c.__dsChart.chart).filter(Boolean);
      const stack = all.find((ch) => ch.config.type === "bar" && ch.options.indexAxis !== "y" && ch.data.datasets.length > 1);
      const horiz = all.find((ch) => ch.options.indexAxis === "y");
      /* 세로 누적: 아래 조각의 값 쪽(위) 2px 은 비고, 그 아래는 차 있다 */
      let stacked = null;
      if (stack) {
        const ds = stack.data.datasets, j = ds[0].data.findIndex((_, k) => ds.filter((d) => +d.data[k]).length >= 2);
        const low = stack.getDatasetMeta(ds.findIndex((d) => +d.data[j])).data[j];
        stacked = { j, top: alphaAt(stack, low.x, low.y + 1), below: alphaAt(stack, low.x, low.y + 4), max: low.width };
      }
      const sc = horiz && horiz.options.scales;
      return { stacked, horiz: horiz && { xGrid: sc.x.grid.display, yGrid: sc.y.grid.display, xZero: sc.x.beginAtZero, yZero: !!sc.y.beginAtZero } };
    });
    ok("bars: a stacked segment leaves a 2px surface gap toward the next one (analytics trend)", r.stacked && r.stacked.top < 30 && r.stacked.below > 200 && r.stacked.max <= 24.01, JSON.stringify(r.stacked));
    /* 격자는 값을 읽는 축에 — 가로 막대는 x. 종전에는 범주 축(y)에 격자가 있고 값 축에는 없었다 */
    ok("bars: a horizontal bar chart draws the grid on the value axis (x) and starts it at zero", r.horiz && r.horiz.xGrid === true && r.horiz.yGrid === false && r.horiz.xZero === true && !r.horiz.yZero, JSON.stringify(r.horiz));
  });

  await part("3 · 선 · 영역 · 툴팁 · crosshair · 눈금", async () => {
    await go("components/data-visual.html"); await wait(900);
    const sel = "#ex-data-visual-default canvas[data-chart]";
    const line = await page.evaluate((sel) => {
      const ch = document.querySelector(sel).__dsChart.chart, d = ch.data.datasets[0];
      const a = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); return m ? +(m[1].split(",")[3] || 1) : null; };
      const area = [...document.querySelectorAll("#ex-data-visual-timeseries canvas[data-chart]")].flatMap((c) => { const t = c.__dsChart.chart; return t.data.datasets.map((x, i) => a(t.getDatasetMeta(i).dataset.options.backgroundColor)); });
      const meta = ch.getDatasetMeta(0), el = meta.dataset, ca = ch.chartArea, k = ch.canvas.width / ch.canvas.clientWidth, cx = ch.canvas.getContext("2d");
      const pk = meta.data.reduce((p, e) => (e.y < p.y ? e : p), meta.data[0]), al = (y) => cx.getImageData(Math.round(pk.x * k), Math.round(y * k), 1, 1).data[3];
      const grad = { kind: el.options.backgroundColor && el.options.backgroundColor.constructor && el.options.backgroundColor.constructor.name, top: al(pk.y + 8), bottom: al(ca.bottom - 3) };
      return { cap: d.borderCapStyle, join: d.borderJoinStyle, ring: d.pointHoverBorderWidth, width: d.borderWidth, grad, area,
        ticks: ch.scales.y.ticks.map((t) => [t.label, new Intl.NumberFormat("ko-KR").format(t.value)]), tip: { weight: ch.options.plugins.tooltip.bodyFont.weight, style: ch.options.plugins.tooltip.pointStyle } };
    }, sel);
    /* dataviz 'Line' 2px · 둥근 이음 / 'Surface ring' hover 점에 2px 면 색 링 */
    ok("lines: 2px with round cap and join, hover point carries a 2px surface ring", line.cap === "round" && line.join === "round" && line.ring === 2 && line.width === 2, JSON.stringify(line));
    /* 영역 칠(사람의 결정 2026-11-24) — 계열 하나인 선은 세로 그라데이션(위 32% → 바닥 6%), 여러 계열의 누적 영역은 계열 색 10% 단색 그대로 */
    ok("area: the single-series line fills with a vertical gradient (denser under the peak than at the baseline), stacked areas stay a flat 10% wash",
      line.grad.kind === "CanvasGradient" && line.grad.top > 60 && line.grad.bottom > 0 && line.grad.bottom < 30 && line.grad.top > line.grad.bottom * 3 && line.area.length >= 2 && line.area.every((x) => x === 0.1), JSON.stringify({ grad: line.grad, area: line.area }));
    ok("axis ticks: value ticks are the ko-KR format of their value", line.ticks.length >= 3 && line.ticks.every((t) => t[0] === t[1]), JSON.stringify(line.ticks));
    const fmt = await page.evaluate(() => ({ small: window.DSChart.tickFormat.call({ max: 2500, min: 0 }, 1500), big: window.DSChart.tickFormat.call({ max: 25000, min: 0 }, 20000), from: window.DSChart.COMPACT_FROM }));
    /* 한 축에 한 형식 — 축이 1만에 닿으면 축 전체를 만 단위로 */
    ok("axis ticks: under 10,000 in full (1,500), an axis reaching 10,000 goes compact (2만)", fmt.small === "1,500" && fmt.big === "2만" && fmt.from === 10000, JSON.stringify(fmt));

    /* 포인터를 차트 가운데에 — crosshair 는 활성 x 에 세로 1px 선, 툴팁은 값이 먼저 */
    const c = await page.$(sel); await c.scrollIntoViewIfNeeded(); await wait(300);
    const bb = await c.boundingBox(); await page.mouse.move(bb.x + bb.width * 0.55, bb.y + bb.height * 0.6); await wait(500);
    const hov = await page.evaluate((sel) => {
      const ch = document.querySelector(sel).__dsChart.chart, act = ch.tooltip.getActiveElements(), area = ch.chartArea;
      if (!act.length) return { act: 0 };
      const cv = ch.canvas, k = cv.width / cv.clientWidth, g = cv.getContext("2d"), x = Math.round(act[0].element.x);
      let rows = 0, total = 0;
      for (let y = Math.ceil(area.top) + 2; y < area.bottom - 2; y += 2) {
        total++;
        /* 선은 x + 0.5 를 지나는 1px — 픽셀 열 x 를 덮는다(고해상도면 k 배) */
        const on = g.getImageData(Math.floor((x + 0.5) * k), Math.round(y * k), 1, 1).data[3], off = g.getImageData(Math.floor((x + 6.5) * k), Math.round(y * k), 1, 1).data[3];
        if (on > off + 12) rows++;
      }
      const ln = ch.tooltip.body && ch.tooltip.body[0] && ch.tooltip.body[0].lines[0];
      return { act: act.length, rows, total, line: ln, name: ch.data.datasets[0].label, keys: ch.tooltip.labelColors && ch.tooltip.labelColors[0] };
    }, sel);
    /* dataviz 'The crosshair finds the X' — 독자는 2px 선이 아니라 날짜를 겨눈다 */
    ok("tooltip: hovering a line chart draws a vertical crosshair at the active x", hov.act > 0 && hov.rows > hov.total * 0.4, JSON.stringify(hov));
    /* dataviz 'Values lead, labels follow' · 'Line keys, not boxes' — 값이 굵게 먼저, 계열 이름은 옅게 뒤에 */
    ok("tooltip: each row is the ko-KR value first, then the series name; value font 600; key is a line",
      typeof hov.line === "string" && new RegExp("^[\\d,]+\\u2002" + (hov.name || "")).test(hov.line) && line.tip.weight === 600 && line.tip.style === "line", JSON.stringify({ line: hov.line, tip: line.tip }));
    await page.mouse.move(5, 5); await wait(200);
  });

  await part("4 · 색은 계열을 따름 · 스파크 끝 점", async () => {
    const r = await page.evaluate(() => {
      const D = window.DSChart, T = D.theme(document.documentElement);
      const three = D.palette(T, "mono", [null, null, null], [1, 2, 3]), two = D.palette(T, "mono", [null, null], [1, 3]);
      const bare3 = D.palette(T, "mono", [null, null, null]), bare2 = D.palette(T, "mono", [null, null]);
      /* slot 을 일부만 줘도 나머지는 4계열 표의 단계 — 개수별 표를 쓰면 계열 수에 따라 slot 없는 계열의 색이 바뀐다 */
      const mixed = D.palette(T, "mono", [null, null], [1, null]);
      const sp = document.querySelector("#ex-data-visual-spark canvas[data-chart]"), ch = sp && sp.__dsChart && sp.__dsChart.chart;
      const pts = ch ? ch.getDatasetMeta(0).data.map((e) => e.options.radius) : [];
      const last = ch ? ch.getDatasetMeta(0).data[pts.length - 1].options : {};
      return { three, two, bare3, bare2, mixed, pts, ring: last.borderWidth, ringColor: last.borderColor, surface: T.surface, color: last.backgroundColor, line: ch && ch.data.datasets[0].borderColor };
    });
    /* 필터로 계열 하나가 빠져도 남은 계열은 같은 색(dataviz 'Color follows the entity') — slot 이 없으면 단계가 바뀐다는 것도 함께 잰다 */
    ok("colour: with slots, removing a series keeps the survivors' colours (slot 1 and 3 unchanged; a series without a slot beside slotted ones uses the 4-step table)", r.three[0] === r.two[0] && r.three[2] === r.two[1] && r.bare3[1] !== r.bare2[1] && r.mixed[1] === r.three[1], JSON.stringify(r));
    /* dataviz 'Marker / end-dot' · stat tile 'trend' — 지금 값을 끝 점으로, 면 색 링 */
    ok("spark: only the last point has a dot (r 3) in the line colour with a 2px surface ring",
      r.pts.length > 3 && r.pts.slice(0, -1).every((x) => x === 0) && r.pts[r.pts.length - 1] === 3 && r.ring === 2 && r.ringColor === r.surface && r.color === r.line, JSON.stringify(r));
  });

  await part("5 · 정적 막대 끝 · 트랙 = 같은 파랑의 옅은 단계(라이트 · 다크)", async () => {
    const read = () => page.evaluate(() => {
      const rgb = (c) => { const p = document.createElement("i"); p.style.color = c; document.body.appendChild(p); const v = getComputedStyle(p).color; p.remove(); return v; };
      const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const track = rgb("var(--chart-mono-track)"), fill = rgb("var(--chart-mono-1)");
      const rad = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).borderRadius : null; };
      const prog = document.querySelector("#ex-data-visual-progress .progress-list .progress");
      const gauge = document.querySelector("#ex-data-visual-gauge canvas[data-chart]"), gch = gauge && gauge.__dsChart && gauge.__dsChart.chart;
      return { track, fill, ratio: +ratio(fill, track).toFixed(2), bgRatio: +ratio(track, rgb("var(--surface-elevated-primary)")).toFixed(2),
        prog: prog && getComputedStyle(prog).backgroundColor, progFill: prog && getComputedStyle(prog.querySelector("i")).backgroundColor,
        gauge: gch && rgb(gch.data.datasets[0].backgroundColor[1]),
        ends: { bar: rad(".chart .bar i"), progress: rad(".progress-list .progress i"), spark: rad(".sparkline i") } };
    });
    const light = await read();
    /* 정적 막대도 각지게(사람의 결정 2026-11-24 — 탐색형 막대와 같게) */
    ok("static bars: CSS bar, progress fill and sparkline bars have square ends",
      light.ends.bar === "0px" && light.ends.progress === "0px" && light.ends.spark === "0px", JSON.stringify(light.ends));
    /* dataviz 'Meter' — 비운 트랙은 같은 램프의 옅은 단계(회색이 아님), 채움과 3:1 이상, 면과는 구분됨 */
    const trackOk = (t) => t.prog === t.track && t.gauge === t.track && t.progFill === t.fill && t.ratio >= 3 && t.bgRatio >= 1.1;
    ok("track: progress and gauge tracks are --chart-mono-track, fill / track ≥ 3:1 (light)", trackOk(light), JSON.stringify(light));
    await theme("dark");
    const dark = await read();
    ok("track: the same holds in dark with the dark track step", trackOk(dark) && dark.track !== light.track, JSON.stringify(dark));
    await theme(null);
  });

  await part("6 · 다시 불러오기 · 대시보드 · 분석 패턴 레이아웃", async () => {
    await go("patterns/analytics.html"); await wait(900);
    const r = await page.evaluate(() => {
      const card = (ex) => document.querySelector(ex + " .chart-card");
      const busy = card("#ex-analytics-loading"), def = card("#ex-analytics-default");
      const view = busy && busy.querySelector(".chart-view"), cv = busy && busy.querySelector("canvas[data-chart]");
      const tb = document.querySelector("#ex-analytics-default .toolbar"), first = def;
      const tr = tb && tb.getBoundingClientRect(), fr = first && first.getBoundingClientRect();
      const ctrl = tb && [...tb.children].find((e) => e.offsetParent !== null);
      return { busy: busy && busy.getAttribute("aria-busy"), opacity: view && getComputedStyle(view).opacity, drawn: !!(cv && cv.__dsChart && cv.__dsChart.chart),
        skeleton: busy ? busy.querySelectorAll(".skeleton, .chart-state").length : -1,
        hBusy: busy && Math.round(busy.getBoundingClientRect().height), hDef: def && Math.round(def.getBoundingClientRect().height),
        toolbar: !!tb, inCard: !!(tb && tb.closest(".chart-card")), above: !!(tr && fr && tr.bottom <= fr.top), firstCtrl: ctrl && ctrl.className };
    });
    /* dataviz 'Refetch keeps the frame' — 지난 그림을 흐리게, Skeleton 깜빡임 · 높이 변화 없음 */
    ok("refetch: a busy chart card keeps its drawn chart at 50% opacity, no skeleton, same height as the loaded card",
      r.busy === "true" && r.opacity === "0.5" && r.drawn && r.skeleton === 0 && r.hBusy === r.hDef, JSON.stringify(r));
    /* dataviz 'One row, above the charts' · 'Date range first' — 필터는 카드 밖 한 줄, 모든 차트 위, 기간이 맨 앞 */
    ok("analytics: the filter row sits outside the cards, above the first chart, date picker first",
      r.toolbar && !r.inCard && r.above && /datepicker/.test(r.firstCtrl || ""), JSON.stringify(r));
    const flow = async (w) => { await page.setViewportSize({ width: w, height: 900 }); await wait(500);
      return page.evaluate(() => ({ doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        previews: [...document.querySelectorAll(".example-preview")].map((p) => p.scrollWidth - p.clientWidth).filter((d) => d > 1) })); };
    const f1440 = await flow(1440), f390 = await flow(390);
    ok("analytics: no overflow at 1440 and 390 (page and every preview)", f1440.doc <= 0 && !f1440.previews.length && f390.doc <= 0 && !f390.previews.length, JSON.stringify({ f1440, f390 }));
    await page.setViewportSize({ width: 1440, height: 900 });

    await go("patterns/dashboard.html"); await wait(700);
    const d = await page.evaluate(() => {
      const ex = document.querySelector("#ex-dashboard-full");
      const sb = ex.querySelector(".page-head .actions .select-btn"), head = ex.querySelector(".page-head"), act = ex.querySelector(".page-head .actions");
      return { period: ex.querySelectorAll(".select-btn, .datepicker, .toolbar").length, inAction: ex.querySelectorAll(".chart-action :is(.select, .dropdown, .select-btn, .datepicker)").length,
        head: !!sb, role: sb && sb.getAttribute("role"), name: sb && sb.getAttribute("aria-label"), opts: sb ? [...sb.querySelectorAll("button")].map((b) => b.textContent.trim()) : [],
        on: sb ? [...sb.querySelectorAll("button")].filter((b) => b.getAttribute("aria-checked") === "true").map((b) => b.textContent.trim()) : [],
        right: act && head ? Math.round(head.getBoundingClientRect().right - act.getBoundingClientRect().right) : null, inGroup: !!(sb && sb.closest(".page-head .actions")) };
    });
    /* 대시보드의 기간(사람의 결정 2026-11-24 — 11-20 의 '훑어보기만' 을 바꿈) — 머리 오른쪽 Select Button 하나가 화면 전체 기간. 다른 필터 · 카드 안 기간은 없다 */
    ok("dashboard: one period Select Button (24시간 · 7일 · 30일, 24시간 on) in the page header actions at its right edge — no other period control and nothing period-like in card actions",
      d.head && d.period === 1 && d.inAction === 0 && d.role === "radiogroup" && d.name === "기간" && d.opts.join() === "24시간,7일,30일" && d.on.join() === "24시간" && d.inGroup && d.right !== null && d.right <= 1, JSON.stringify(d));
  });
};
