/* =========================================================
   ds-chart.js — Chart.js 테마 어댑터 + 프리셋 (순수 JS, Chart.js 를 번들하지 않고 인자로 받는다)
   사용: <script src="assets/vendor/chart.umd.js" defer></script>
         <script src="assets/ds-chart.js" defer></script>
         <canvas data-chart="timeseries" data-spec='{…}' role="img" aria-label="…"></canvas>   → DOMContentLoaded 때 자동 mount
   또는: DSChart.mount(Chart, canvas, DSChart.presets.bar(spec))  /  React 는 @jiran/ds-react/chart 가 같은 함수를 쓴다.
   - theme(el)      : 토큰(--chart-* · 심각도 · 면 · 글꼴)을 계산값으로 읽어 Chart.js options 조각을 만든다. 캔버스는 CSS 변수를 못 읽는다
   - presets.*      : timeseries(선/영역 · 누적) · bar(세로/가로 · 그룹/누적) · donut · mixed(막대 + 선, y 축 하나) — spec → Chart.js config
   - mount          : Chart 생성 + 라이트/다크 전환(data-theme · prefers-color-scheme)과 제품색 주입 때 다시 칠한다
   - auto           : canvas[data-chart] 를 찾아 data-spec(JSON) 으로 mount
   마크 규격(사람의 결정 2026-11-03): 선 2px · 점은 hover 때만 지름 8 · 막대 끝 4px 둥글림 · 세그먼트 사이 2px 면 색 틈 ·
   격자는 y 축만 · 범례는 2계열 이상일 때 아래 · y 축은 하나(이중 축 금지) · 계열 색 6개 순서 고정, 7번째부터는 '기타'로 묶는다
   ========================================================= */
(function (root) {
  "use strict";
  var doc = root.document;
  var SERIES_MAX = 6;
  var TOKENS = {
    series: ["--chart-series-1", "--chart-series-2", "--chart-series-3", "--chart-series-4", "--chart-series-5", "--chart-series-6"],
    grid: "--chart-grid-primary", axis: "--chart-axis-text", tipBg: "--chart-tooltip-surface", tipFg: "--chart-tooltip-text",
    surface: "--surface-elevated-primary", text: "--foreground-neutral-primary",
  };
  /* 심각도 · 상태 톤 → 기존 토큰. 계열 색과 섞지 않는다(빨강 = Critical 의 의미를 지킨다) */
  var TONES = {
    critical: "--foreground-negative-primary", high: "--foreground-cautionary-primary", medium: "--foreground-accent-cyan",
    low: "--foreground-inactive-primary", ok: "--foreground-positive-primary", brand: "--foreground-brand-primary",
  };

  /* ---------- 토큰 읽기 ----------
     getComputedStyle(el).getPropertyValue("--x") 는 color-mix() 를 계산하지 않는다 — 탐침 요소의 color 로 흘려 계산값을 받는다 */
  var probe = null;
  function resolve(el, token) {
    if (!probe) { probe = doc.createElement("i"); probe.setAttribute("aria-hidden", "true"); probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"; }
    var host = el && el.nodeType === 1 ? el : doc.body;
    host.appendChild(probe);
    probe.style.color = "var(" + token + ")";
    var v = getComputedStyle(probe).color;
    host.removeChild(probe);
    return toRgba(v);
  }
  /* color(srgb r g b / a) → rgba(). Chromium 이 color-mix 계산값을 color() 로 내면 캔버스가 못 읽는 버전이 있다 */
  function toRgba(v) {
    var m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(v);
    if (!m) return v;
    var r = Math.round(+m[1] * 255), g = Math.round(+m[2] * 255), b = Math.round(+m[3] * 255), a = m[4] === undefined ? 1 : +m[4];
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
  }
  function alpha(color, a) {
    var m = /^rgba?\(([^)]+)\)$/.exec(color);
    if (!m) return color;
    var p = m[1].split(",").map(function (s) { return s.trim(); });
    return "rgba(" + p[0] + ", " + p[1] + ", " + p[2] + ", " + a + ")";
  }

  /* ---------- theme ---------- */
  function theme(el) {
    el = el || doc.documentElement;
    var cs = getComputedStyle(el);
    var t = {
      series: TOKENS.series.map(function (k) { return resolve(el, k); }),
      tone: {}, grid: resolve(el, TOKENS.grid), axis: resolve(el, TOKENS.axis),
      tipBg: resolve(el, TOKENS.tipBg), tipFg: resolve(el, TOKENS.tipFg), surface: resolve(el, TOKENS.surface), text: resolve(el, TOKENS.text),
      font: { family: cs.fontFamily, size: 12 },
      reduced: !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches),
    };
    Object.keys(TONES).forEach(function (k) { t.tone[k] = resolve(el, TONES[k]); });
    return t;
  }
  /* 데이터셋의 색 — tone 이 있으면 그 토큰, 없으면 계열 순서(6 고정, 넘치면 마지막 색을 쓰지 않고 '기타'로 묶는 것이 규칙이라 경고) */
  function seriesColor(t, ds, i) {
    if (ds.tone && t.tone[ds.tone]) return t.tone[ds.tone];
    if (i >= SERIES_MAX && root.console) root.console.warn("[ds-chart] 계열이 " + SERIES_MAX + "개를 넘습니다 — 7번째부터는 '기타'로 묶으세요");
    return t.series[Math.min(i, SERIES_MAX - 1)];
  }
  function font(t, weight) { return { family: t.font.family, size: t.font.size, weight: weight || 400 }; }
  function baseOptions(t, n) {
    return {
      responsive: true, maintainAspectRatio: false, animation: t.reduced ? false : { duration: 200 },
      interaction: { mode: "index", intersect: false },
      color: t.axis,
      plugins: {
        /* 범례는 데이터셋(도넛은 조각) 순서 — Chart.js 기본은 그리기 order 라 혼합 차트에서 선(위에 그림)이 먼저 왔다 */
        legend: { display: n > 1, position: "bottom", align: "start", labels: { color: t.axis, boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: "rectRounded", padding: 16, font: font(t), sort: function (a, b) { return ((a.datasetIndex || 0) - (b.datasetIndex || 0)) || ((a.index || 0) - (b.index || 0)); } } },
        tooltip: { backgroundColor: t.tipBg, titleColor: t.tipFg, bodyColor: t.tipFg, padding: 10, cornerRadius: 6, boxWidth: 8, boxHeight: 8, boxPadding: 4, usePointStyle: true, titleFont: font(t, 600), bodyFont: font(t) },
      },
      scales: {
        x: { grid: { display: false }, border: { color: t.grid }, ticks: { color: t.axis, font: font(t), maxRotation: 0, autoSkip: true, autoSkipPadding: 12 } },
        y: { beginAtZero: true, grid: { color: t.grid, drawTicks: false }, border: { display: false }, ticks: { color: t.axis, font: font(t), padding: 8, maxTicksLimit: 5 } },
      },
    };
  }

  /* ---------- 칠하기(테마가 바뀔 때마다) ---------- */
  function deepAssign(dst, src) {
    Object.keys(src).forEach(function (k) {
      var v = src[k];
      if (v && typeof v === "object" && !Array.isArray(v)) { if (!dst[k] || typeof dst[k] !== "object") dst[k] = {}; deepAssign(dst[k], v); }
      else dst[k] = v;
    });
    return dst;
  }
  function paint(chart, t) {
    /* Chart.js 의 chart.config 는 Config 래퍼라 config 에 붙인 _ds 가 보이지 않는다 — mount 가 chart.$ds 로 옮겨 둔다 */
    var meta = chart.$ds || {}, kind = meta.kind, data = chart.data, n = data.datasets.length;
    deepAssign(chart.options, baseOptions(t, kind === "donut" ? data.labels.length : n));
    /* 프리셋 · 사용자가 config.options 에 준 것이 기본 옵션 위에 남아야 한다 — 종전에는 기본이 덮어 bar 의 autoSkip:false 가 사라졌다(Figma 대조에서 발견, 2026-11-04) */
    if (meta.options) deepAssign(chart.options, meta.options);
    if (kind === "donut") { chart.options.scales = {}; chart.options.interaction = { mode: "nearest", intersect: true }; chart.options.plugins.legend.position = meta.legend || "bottom"; }
    data.datasets.forEach(function (ds, i) {
      var c = seriesColor(t, ds, i);
      if (kind === "donut") {
        ds.backgroundColor = (ds._dsTones || []).map(function (tone, j) { return tone && t.tone[tone] ? t.tone[tone] : t.series[Math.min(j, SERIES_MAX - 1)]; });
        ds.borderColor = t.surface; ds.borderWidth = 2; ds.hoverBorderColor = t.surface; ds.hoverOffset = 4;
      } else if (ds.type === "line" || kind === "timeseries") {
        ds.borderColor = c; ds.backgroundColor = ds.fill ? alpha(c, 0.24) : c; ds.pointBackgroundColor = c; ds.pointBorderColor = t.surface;
      } else {
        ds.backgroundColor = c; ds.borderColor = t.surface;
      }
    });
    meta.text = t.text;
  }

  /* ---------- presets ---------- */
  function seriesOf(spec) { return (spec.series || []).map(function (s) { return { label: s.label, data: s.data, tone: s.tone }; }); }
  var presets = {
    /* 시계열 — 선, stacked 면 누적 영역(심각도 누적 추이 같은). 점은 hover 때만 지름 8 */
    timeseries: function (spec) {
      var stacked = !!spec.stacked;
      return { type: "line", _ds: { kind: "timeseries" },
        data: { labels: spec.labels, datasets: seriesOf(spec).map(function (s, i) {
          return deepAssign(s, { borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 12, pointBorderWidth: 2, fill: stacked ? (i === 0 ? "origin" : "-1") : false, order: i });
        }) },
        options: { scales: { x: { stacked: stacked }, y: { stacked: stacked } } } };
    },
    /* 막대 — horizontal 로 가로, stacked 로 누적. 끝 4px 둥글림, 세그먼트 · 이웃 사이 2px 면 색 틈 */
    bar: function (spec) {
      var stacked = !!spec.stacked, list = seriesOf(spec), last = list.length - 1;
      return { type: "bar", _ds: { kind: "bar" },
        data: { labels: spec.labels, datasets: list.map(function (s, i) {
          return deepAssign(s, { borderWidth: 2, borderSkipped: stacked ? false : "start", borderRadius: !stacked || i === last ? 4 : 0, maxBarThickness: 32 });
        }) },
        /* 범주 축은 라벨을 건너뛰지 않는다(autoSkip 은 시계열용) — 좁으면 글자가 돌아가는 대신 maxRotation 0 이라 겹칠 수 있으니 카드 폭을 준다 */
        options: { indexAxis: spec.horizontal ? "y" : "x", scales: { x: { stacked: stacked, ticks: spec.horizontal ? {} : { autoSkip: false } }, y: { stacked: stacked, ticks: spec.horizontal ? { autoSkip: false } : {} } } } };
    },
    /* 도넛 — series 는 {label, value, tone?}. center 는 구멍 가운데 글자(합계 등) */
    donut: function (spec) {
      var list = spec.series || [];
      return { type: "doughnut", _ds: { kind: "donut", center: spec.center, legend: spec.legend },
        data: { labels: list.map(function (s) { return s.label; }), datasets: [{ data: list.map(function (s) { return s.value; }), _dsTones: list.map(function (s) { return s.tone; }), borderWidth: 2 }] },
        options: { cutout: "67%" },
        plugins: [centerPlugin] };
    },
    /* 혼합 — bars + lines, y 축은 하나(두 값의 단위가 다르면 차트를 둘로 나눈다) */
    mixed: function (spec) {
      var bars = (spec.bars || []).map(function (s, i) { return { label: s.label, data: s.data, tone: s.tone, type: "bar", borderWidth: 2, borderSkipped: "start", borderRadius: 4, maxBarThickness: 32, order: 2 + i }; });
      var lines = (spec.lines || []).map(function (s, i) { return { label: s.label, data: s.data, tone: s.tone, type: "line", borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 12, pointBorderWidth: 2, fill: false, order: i }; });
      return { type: "bar", _ds: { kind: "mixed" }, data: { labels: spec.labels, datasets: bars.concat(lines) }, options: {} };
    },
  };
  /* 도넛 가운데 글자 — CSS .donut::after 와 같은 Title/1 16/600(사람의 결정 2026-11-04) */
  var centerPlugin = { id: "dsCenter", afterDraw: function (chart) {
    var ds = chart.$ds; if (!ds || !ds.center) return;
    var area = chart.chartArea, ctx = chart.ctx;
    ctx.save(); ctx.font = "600 16px " + chart.options.plugins.tooltip.bodyFont.family; ctx.fillStyle = ds.text || "#000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(ds.center), (area.left + area.right) / 2, (area.top + area.bottom) / 2); ctx.restore();
  } };

  /* ---------- mount / auto ---------- */
  var mounted = [];
  function mount(Chart, canvas, config) {
    if (!Chart) throw new Error("[ds-chart] Chart.js 가 필요합니다 — mount(Chart, canvas, config)");
    if (canvas.__dsChart) canvas.__dsChart.destroy();
    var t = theme(canvas);
    config.options = config.options || {};
    /* 프리셋 · 사용자 옵션은 Chart 생성 전에 떠 둔다 — new Chart 가 config.options 에 기본값(격자 rgba(0,0,0,.1) 등)을 합쳐 넣는다 */
    var own = JSON.parse(JSON.stringify(config.options || {}));
    var chart = new Chart(canvas, config);
    chart.$ds = config._ds || {}; chart.$ds.options = own;
    /* 2d 컨텍스트가 없는 환경(jsdom 테스트)에서는 Chart.js 가 ctx 없이 만들어지고 update 가 던진다 — 칠하지 않고 handle 만 돌려준다 */
    var live = function () { return !!chart.ctx; };
    if (live()) { paint(chart, t); chart.update("none"); }
    var handle = { chart: chart, repaint: function () { if (live()) { paint(chart, theme(canvas)); chart.update("none"); } }, destroy: function () {
      var i = mounted.indexOf(handle); if (i >= 0) mounted.splice(i, 1);
      chart.destroy(); delete canvas.__dsChart;
    } };
    canvas.__dsChart = handle; mounted.push(handle); watch();
    return handle;
  }
  var watching = false;
  function watch() {
    if (watching) return; watching = true;
    var repaintAll = function () { mounted.forEach(function (h) { h.repaint(); }); };
    if (root.MutationObserver) new MutationObserver(repaintAll).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });
    if (root.matchMedia) { var mq = root.matchMedia("(prefers-color-scheme: dark)"); (mq.addEventListener ? mq.addEventListener("change", repaintAll) : mq.addListener(repaintAll)); }
  }
  function auto(Chart, scope) {
    Chart = Chart || root.Chart; scope = scope || doc;
    var list = Array.prototype.slice.call(scope.querySelectorAll("canvas[data-chart]"));
    return list.filter(function (c) { return !c.__dsChart; }).map(function (c) {
      var kind = c.getAttribute("data-chart"), make = presets[kind];
      if (!make) throw new Error("[ds-chart] 모르는 data-chart: " + kind);
      return mount(Chart, c, make(JSON.parse(c.getAttribute("data-spec") || "{}")));
    });
  }

  var DSChart = { theme: theme, presets: presets, mount: mount, auto: auto, paint: paint, resolve: resolve, SERIES_MAX: SERIES_MAX, TOKENS: TOKENS, TONES: TONES };
  if (typeof module !== "undefined" && module.exports) module.exports = DSChart;
  root.DSChart = DSChart;
  if (doc && root.Chart !== undefined) { /* 사이트 · 순수 JS: 벤더 스크립트가 먼저 defer 로 실려 있다 */
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { auto(root.Chart, doc); });
    else auto(root.Chart, doc);
  }
})(typeof window !== "undefined" ? window : globalThis);
