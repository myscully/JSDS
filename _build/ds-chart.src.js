/* =========================================================
   ds-chart.js — Chart.js 테마 어댑터 + 프리셋 (순수 JS, Chart.js 를 번들하지 않고 인자로 받는다)
   사용: <script src="assets/vendor/chart.umd.js" defer></script>
         <script src="assets/ds-chart.js" defer></script>
         <canvas data-chart="timeseries" data-spec='{…}' role="img" aria-label="…"></canvas>   → DOMContentLoaded 때 자동 mount
   또는: DSChart.mount(Chart, canvas, DSChart.presets.bar(spec))  /  React 는 @jiran/ds-react/chart 가 같은 함수를 쓴다.
   - theme(el)      : 토큰(--chart-* · 심각도 · 면 · 글꼴)을 계산값으로 읽어 Chart.js options 조각을 만든다. 캔버스는 CSS 변수를 못 읽는다
   - presets.*      : timeseries(선/영역 · 누적) · bar(세로/가로 · 그룹/누적 · 강조 · 그라데이션) · donut · mixed(막대 + 선, y 축 하나) · gauge(반원 진행률) · spark(KPI 안 작은 추이) — spec → Chart.js config
   - 색 모드(사람의 결정 2026-11-15): color "mono"(기본 — 고정 파랑 명도 4단계 --chart-mono-1~4, 제품 색과 무관) · "categorical"(--chart-series-1~6).
     tone 을 준 계열(심각도 · 상태)은 언제나 그 톤이다. tone 없는 계열(도넛은 조각)이 5개 이상이면 mono 대신 categorical 로 그린다
   - mount          : Chart 생성 + 라이트/다크 전환(data-theme · prefers-color-scheme) · 제품색 주입 · 화면 폭 단계 변화 때 다시 칠한다
   - auto           : canvas[data-chart] 를 찾아 data-spec(JSON) 으로 mount
   마크 규격(사람의 결정 2026-11-03, 막대 · 범례는 2026-11-05 · 11-06 개정): 선 2px · 점은 hover 때만 지름 8 · 막대는 각지고 stroke 없음 · 누적 세그먼트는 틈 없이 이어 붙임 ·
   도넛 조각 사이 2px 면 색 경계 · 격자는 y 축만, 점선(2026-11-15) · 범례는 2계열 이상일 때 아래, 원형 아이콘(도넛의 옆 범례는 자리가 좁고 높으면 아래로) · y 축은 하나(이중 축 금지) · 계열 색 6개 순서 고정, 7번째부터는 '기타'로 묶는다
   ========================================================= */
(function (root) {
  "use strict";
  var doc = root.document;
  var SERIES_MAX = 6;
  var MONO_MAX = 4;
  var TOKENS = {
    series: ["--chart-series-1", "--chart-series-2", "--chart-series-3", "--chart-series-4", "--chart-series-5", "--chart-series-6"],
    mono: ["--chart-mono-1", "--chart-mono-2", "--chart-mono-3", "--chart-mono-4"],
    grid: "--chart-grid-primary", axis: "--chart-axis-text", tipBg: "--chart-tooltip-surface", tipFg: "--chart-tooltip-text",
    surface: "--surface-elevated-primary", text: "--foreground-neutral-primary", sub: "--foreground-neutral-tertiary", track: "--surface-neutral-strong",
  };
  /* 한 톤의 계열 수별 단계(사람의 결정 2026-11-15 '명도 단계') — 둘이면 가장 진한 것과 옅은 것으로 벌린다. 이웃 단계의 명도 차는 dataviz 검증기로 잰 값(0.06 이상) */
  var MONO_STEPS = { 1: [0], 2: [0, 3], 3: [0, 1, 3], 4: [0, 1, 2, 3] };
  /* 심각도 · 상태 톤 → 기존 토큰. 계열 색과 섞지 않는다(빨강 = Critical 의 의미를 지킨다) */
  var TONES = {
    /* 심각도 5단계(사람의 결정 2026-11-06) — Critical 은 진한 빨강(negative-strong), Medium 은 라이트 블루 · Low 는 accent lime(라이트 lime-40) — 2026-11-11 교체(그 전 2026-11-09 엔 반대), Info 는 중립 */
    critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary", medium: "--foreground-accent-light-blue",
    low: "--foreground-accent-lime", info: "--foreground-inactive-primary", ok: "--foreground-positive-primary", brand: "--foreground-brand-primary",
    /* 계열 1의 톤(사람의 결정 2026-11-05) — 비교 기간(지난 주 · 전월)은 옅은 톤, 막대 위를 지나는 선은 진한 톤. 같은 지표의 다른 기간 · 다른 값으로 읽힌다 */
    "series-1": "--chart-series-1", "series-1-subtle": "--chart-series-1-subtle", "series-1-strong": "--chart-series-1-strong",
    /* 한 톤의 단계를 직접 고를 때(2026-11-15) */
    "mono-1": "--chart-mono-1", "mono-2": "--chart-mono-2", "mono-3": "--chart-mono-3", "mono-4": "--chart-mono-4",
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

  /* ---------- 화면 폭 단계(2026-11-11 글자 크기 체계) ----------
     CSS 는 rem 이라 루트 글꼴 크기가 바뀌면 글자 · 간격이 같은 비율로 따라간다. 캔버스는 CSS 를 모르므로 그 비율(루트 px / 16)을 곱해 그린다.
     글자 12 는 CSS 의 --font-size-12 처럼 최소 12 를 지킨다(좁은 화면에서 줄지 않음) */
  var FONT_MIN = 12;
  function rootScale() { var f = parseFloat(getComputedStyle(doc.documentElement).fontSize); return f > 0 ? f / 16 : 1; }

  /* ---------- theme ---------- */
  function theme(el) {
    el = el || doc.documentElement;
    var cs = getComputedStyle(el);
    var t = {
      series: TOKENS.series.map(function (k) { return resolve(el, k); }),
      mono: TOKENS.mono.map(function (k) { return resolve(el, k); }),
      tone: {}, grid: resolve(el, TOKENS.grid), axis: resolve(el, TOKENS.axis),
      tipBg: resolve(el, TOKENS.tipBg), tipFg: resolve(el, TOKENS.tipFg), surface: resolve(el, TOKENS.surface), text: resolve(el, TOKENS.text),
      sub: resolve(el, TOKENS.sub), track: resolve(el, TOKENS.track),
      scale: rootScale(),
      font: { family: cs.fontFamily, size: Math.max(FONT_MIN, 12 * rootScale()) },
      reduced: !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches),
    };
    Object.keys(TONES).forEach(function (k) { t.tone[k] = resolve(el, TONES[k]); });
    return t;
  }
  /* 색 정하기 — tone 이 있으면 그 토큰. tone 없는 것들만 모아 color 모드로 칠한다:
     mono(기본)는 개수에 맞는 명도 단계(MONO_STEPS), 5개 이상이거나 categorical 이면 계열 색 1~6 순서(넘치면 '기타'로 묶는 것이 규칙이라 경고).
     tones 는 계열(도넛은 조각)마다 tone 또는 undefined. 돌려주는 값은 같은 길이의 색 배열 */
  function colorMode(mode, n) {
    if (mode === "categorical") return "categorical";
    if (n > MONO_MAX) { if (mode === "mono" && root.console) root.console.warn("[ds-chart] 한 톤(mono)은 " + MONO_MAX + "계열까지입니다 — " + n + "계열은 범주색(categorical)으로 그립니다"); return "categorical"; }
    return "mono";
  }
  function palette(t, mode, tones) {
    var free = tones.filter(function (x) { return !(x && t.tone[x]); }).length, m = colorMode(mode, free), k = 0;
    if (m === "categorical" && free > SERIES_MAX && root.console) root.console.warn("[ds-chart] 계열이 " + SERIES_MAX + "개를 넘습니다 — 7번째부터는 '기타'로 묶으세요");
    return tones.map(function (x) {
      if (x && t.tone[x]) return t.tone[x];
      var j = k++;
      return m === "mono" ? t.mono[MONO_STEPS[free][j]] : t.series[Math.min(j, SERIES_MAX - 1)];
    });
  }
  function font(t, weight) { return { family: t.font.family, size: t.font.size, weight: weight || 400 }; }
  /* 애니메이션 중에 들어온 크기 변경은 Chart.js 가 '다음 그리기' 로 미뤄 둔다(_resizeBeforeDraw — 4.6.1 고정). 그런데 애니메이션은 그리기 없이 끝나는
     프레임이 있어서(마지막 항목을 치우는 틱), 그 틈에 들어온 변경은 영영 적용되지 않았다 — 부하가 걸린 채 창을 1440 → 390 으로 줄이면
     대시보드 '일별 탐지' 캔버스가 445 로 남았다(hover 애니메이션 도중, 2026-11-20 측정). 애니메이션이 끝날 때 미뤄 둔 변경을 적용한다 */
  function flushResize(ctx) {
    var c = ctx && ctx.chart, p = c && c._resizeBeforeDraw;
    if (p && c.canvas) { c._resizeBeforeDraw = null; c.resize(p.width, p.height); }
  }
  function baseOptions(t, n) {
    var s = t.scale || 1;
    return {
      responsive: true, maintainAspectRatio: false, animation: t.reduced ? false : { duration: 200, onComplete: flushResize },
      interaction: { mode: "index", intersect: false },
      color: t.axis,
      plugins: {
        /* 원형 점의 지름 — 범례는 boxHeight × √2(7 이면 10, 정적 .chart-legend i 와 같음), 툴팁은 min(boxWidth, boxHeight)(6) — Chart.js 4.6.1 이 둘을 다른 식으로 그린다 */
        /* 범례는 데이터셋(도넛은 조각) 순서 — Chart.js 기본은 그리기 order 라 혼합 차트에서 선(위에 그림)이 먼저 왔다 */
        legend: { display: n > 1, position: "bottom", align: "start", labels: { color: t.axis, boxWidth: 7 * s, boxHeight: 7 * s, usePointStyle: true, pointStyle: "circle", padding: 16 * s, font: font(t), sort: function (a, b) { return ((a.datasetIndex || 0) - (b.datasetIndex || 0)) || ((a.index || 0) - (b.index || 0)); } } },
        tooltip: { backgroundColor: t.tipBg, titleColor: t.tipFg, bodyColor: t.tipFg, padding: 10 * s, cornerRadius: 6 * s, boxWidth: 6 * s, boxHeight: 6 * s, boxPadding: 4 * s, usePointStyle: true, pointStyle: "circle", titleFont: font(t, 600), bodyFont: font(t) },
      },
      scales: {
        x: { grid: { display: false }, border: { color: t.grid }, ticks: { color: t.axis, font: font(t), maxRotation: 0, autoSkip: true, autoSkipPadding: 12 * s } },
        /* 가로 격자는 점선 3 · 3(사람의 결정 2026-11-15) — Chart.js 4 는 격자선 점선을 border.dash 로 받는다(축 선을 숨겨도 격자에 적용) */
        y: { beginAtZero: true, grid: { color: t.grid, drawTicks: false }, border: { display: false, dash: [3 * s, 3 * s] }, ticks: { color: t.axis, font: font(t), padding: 8 * s, maxTicksLimit: 5 } },
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
  /* 옆 범례(right · left)는 자리가 좁고 세로로 길면 차트 아래로 내린다(사람의 요청 2026-11-06) — 옆에 두면 도넛 지름이 '폭 − 범례 폭'으로 줄어
     좁은 카드에서 도넛이 점처럼 작아진다. 기준은 캔버스 폭 < 높이 × 1.5(높이 240 이면 폭 360 미만). 크기가 바뀔 때마다 다시 판정한다 */
  var SIDE_LEGEND_RATIO = 1.5;
  function legendPosition(want, w, h) {
    if (want !== "left" && want !== "right") return want || "bottom";
    return w > 0 && h > 0 && w < h * SIDE_LEGEND_RATIO ? "bottom" : want;
  }
  /* Chart.js 는 onResize 를 부른 뒤 다시 배치(update)하므로 여기서 위치만 바꾸면 된다 */
  function relayout(chart, size) {
    var meta = chart.$ds || {}; if (meta.kind !== "donut") return;
    chart.options.plugins.legend.position = legendPosition(meta.legend, size.width, size.height);
  }
  /* 누적 영역 = 계열마다 세로 그라데이션(사람의 결정 2026-11-13 — 단색 24% 대신). 그 계열의 가장 높은 값(누적이면 쌓은 값)에서 차트 바닥까지
     위 32% → 아래 6%(사람이 정하지 않은 제안값 — 아래 띠도 보이게). 크기 · 값이 같으면 만든 것을 다시 쓴다. 배치 전(chartArea 없음)에는 단색.
     범례 · 툴팁 마커는 점 색(pointBackgroundColor)이라 이 그라데이션을 쓰지 않는다 */
  function areaFill(c) {
    var cache = {};
    return function (ctx) {
      var chart = ctx.chart, a = chart.chartArea, y = chart.scales && chart.scales.y, i = ctx.datasetIndex;
      if (!a || !y || i == null) return alpha(c, 0.24);
      var ds = chart.data.datasets, stacked = !!(y.options && y.options.stacked), top = -Infinity;
      (ds[i].data || []).forEach(function (_, j) { var v = 0; for (var k = stacked ? 0 : i; k <= i; k++) { var d = +(ds[k].data || [])[j]; if (isFinite(d)) v += d; } if (v > top) top = v; });
      var py = isFinite(top) ? Math.max(a.top, Math.min(a.bottom - 1, y.getPixelForValue(top))) : a.top, key = py + "|" + a.bottom;
      if (cache.key !== key) { var g = chart.ctx.createLinearGradient(0, py, 0, a.bottom); g.addColorStop(0, alpha(c, 0.32)); g.addColorStop(1, alpha(c, 0.06)); cache = { key: key, g: g }; }
      return cache.g;
    };
  }
  /* 막대 그라데이션(옵션, 사람의 결정 2026-11-15 — 기본은 단색) — 막대마다 값 끝(진한 색)에서 기준선(같은 색 55%)까지. 진한 끝이 그래픽 3:1 을 지킨다.
     가로 막대는 왼쪽(기준선) → 오른쪽(값 끝). 위치 · 크기가 같으면 만든 것을 다시 쓴다 */
  var BAR_FADE = 0.55;
  function barFill(c, horizontal) {
    var cache = {};
    return function (ctx) {
      var chart = ctx.chart, v = ctx.raw;
      var axis = chart.scales && chart.scales[horizontal ? "x" : "y"];
      if (!axis || !chart.chartArea || !isFinite(+v)) return c;
      var end = axis.getPixelForValue(+v), base = axis.getPixelForValue(0), key = end + "|" + base;
      if (!cache[key]) { var g = horizontal ? chart.ctx.createLinearGradient(base, 0, end, 0) : chart.ctx.createLinearGradient(0, base, 0, end); g.addColorStop(0, alpha(c, BAR_FADE)); g.addColorStop(1, c); cache[key] = g; }
      return cache[key];
    };
  }
  function paint(chart, t) {
    /* Chart.js 의 chart.config 는 Config 래퍼라 config 에 붙인 _ds 가 보이지 않는다 — mount 가 chart.$ds 로 옮겨 둔다 */
    var meta = chart.$ds || {}, kind = meta.kind, data = chart.data, n = data.datasets.length, round = kind === "donut" || kind === "gauge";
    deepAssign(chart.options, baseOptions(t, kind === "donut" ? data.labels.length : kind === "gauge" || kind === "spark" ? 1 : n));
    /* 프리셋 · 사용자가 config.options 에 준 것이 기본 옵션 위에 남아야 한다 — 종전에는 기본이 덮어 bar 의 autoSkip:false 가 사라졌다(Figma 대조에서 발견, 2026-11-04) */
    if (meta.options) deepAssign(chart.options, meta.options);
    if (round) { chart.options.scales = {}; chart.options.interaction = { mode: "nearest", intersect: true }; }
    if (kind === "donut") { chart.options.plugins.legend.position = legendPosition(meta.legend, chart.width, chart.height); chart.options.onResize = relayout; }
    if (kind === "gauge") { chart.options.plugins.tooltip.enabled = false; }
    if (kind === "spark") { chart.options.scales = { x: { display: false }, y: { display: false, beginAtZero: false } }; }
    var cols = kind === "donut" ? palette(t, meta.color, data.datasets[0]._dsTones || [])
      : palette(t, meta.color, data.datasets.map(function (ds) { return ds.tone; }));
    data.datasets.forEach(function (ds, i) {
      var c = cols[i];
      if (kind === "donut") {
        ds.backgroundColor = cols;
        ds.borderColor = t.surface; ds.borderWidth = 2; ds.hoverBorderColor = t.surface; ds.hoverOffset = 4;
      } else if (kind === "gauge") {
        /* 채운 호 = 한 톤의 가장 진한 단계(또는 tone), 나머지 = 트랙(진행 막대 · 정적 막대의 트랙과 같은 면) */
        var g = ds.tone && t.tone[ds.tone] ? t.tone[ds.tone] : t.mono[0];
        ds.backgroundColor = [g, t.track]; ds.hoverBackgroundColor = [g, t.track]; ds.borderWidth = 0;
      } else if (ds.type === "line" || kind === "timeseries" || kind === "spark") {
        ds.borderColor = c; ds.backgroundColor = ds.fill ? areaFill(c) : c; ds.pointBackgroundColor = c; ds.pointBorderColor = t.surface;
      } else {
        /* 강조(highlight) — 한 계열 막대에서 그 막대만 가장 진한 단계, 나머지는 가장 옅은 단계(같은 파랑). tone 을 준 계열은 강조하지 않는다 */
        var hi = meta.highlight;
        if (hi != null && n === 1 && !(ds.tone && t.tone[ds.tone])) {
          ds.backgroundColor = (ds.data || []).map(function (_, j) { return j === hi ? t.mono[0] : t.mono[MONO_MAX - 1]; });
        } else ds.backgroundColor = meta.gradient ? barFill(c, !!meta.horizontal) : c;
        ds.borderColor = "transparent";   // 막대는 stroke 없음
      }
    });
    meta.text = t.text; meta.sub = t.sub;
  }

  /* ---------- presets ---------- */
  function seriesOf(spec) { return (spec.series || []).map(function (s) { return { label: s.label, data: s.data, tone: s.tone }; }); }
  function warn(msg) { if (root.console) root.console.warn("[ds-chart] " + msg); }
  var presets = {
    /* 시계열 — 선, stacked 면 누적 영역(심각도 누적 추이 같은). 점은 hover 때만 지름 8.
       계열이 하나면 선 아래를 옅은 그라데이션으로 칠한다(사람의 결정 2026-11-15) — area:false 로 끈다. 여러 계열의 겹친 영역은 서로 가려 칠하지 않는다 */
    timeseries: function (spec) {
      var stacked = !!spec.stacked, list = seriesOf(spec), area = !stacked && list.length === 1 && spec.area !== false;
      return { type: "line", _ds: { kind: "timeseries", color: spec.color },
        data: { labels: spec.labels, datasets: list.map(function (s, i) {
          return deepAssign(s, { borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 12, pointBorderWidth: 2, fill: stacked ? (i === 0 ? "origin" : "-1") : area ? "origin" : false, order: i });
        }) },
        options: { scales: { x: { stacked: stacked }, y: { stacked: stacked } } } };
    },
    /* 막대 — horizontal 로 가로, stacked 로 누적. 각지고 stroke 없음, 누적 세그먼트는 틈 없이 이어 붙임.
       highlight: n(0부터) — 한 계열에서 그 막대만 진하게. gradient: true — 막대마다 세로(가로) 그라데이션, 누적에는 쓰지 않는다(세그먼트끼리 갈리지 않음) */
    bar: function (spec) {
      var stacked = !!spec.stacked, list = seriesOf(spec), gradient = !!spec.gradient;
      if (gradient && stacked) { warn("누적 막대에는 gradient 를 쓰지 않습니다 — 단색으로 그립니다"); gradient = false; }
      if (spec.highlight != null && list.length !== 1) warn("highlight 는 계열이 하나인 막대에만 씁니다");
      return { type: "bar", _ds: { kind: "bar", color: spec.color, highlight: spec.highlight, gradient: gradient, horizontal: !!spec.horizontal },
        data: { labels: spec.labels, datasets: list.map(function (s, i) {
          /* 막대는 각지고 stroke 가 없다(사람의 결정 2026-11-05). 누적 세그먼트는 틈 없이 이어 붙인다(사람의 요청 2026-11-06 — 종전 2px 투명 틈을 지움).
             inflateAmount 는 기본(auto)이라 이웃 세그먼트 사이에 안티에일리어싱 실금이 생기지 않는다 */
          return deepAssign(s, { borderWidth: 0, borderRadius: 0, maxBarThickness: 32 });
        }) },
        /* 범주 축은 라벨을 건너뛰지 않는다(autoSkip 은 시계열용) — 좁으면 글자가 돌아가는 대신 maxRotation 0 이라 겹칠 수 있으니 카드 폭을 준다 */
        options: { indexAxis: spec.horizontal ? "y" : "x", scales: { x: { stacked: stacked, ticks: spec.horizontal ? {} : { autoSkip: false } }, y: { stacked: stacked, ticks: spec.horizontal ? { autoSkip: false } : {} } } } };
    },
    /* 도넛 — series 는 {label, value, tone?}. center 는 구멍 가운데 글자(합계 등) */
    donut: function (spec) {
      var list = spec.series || [];
      return { type: "doughnut", _ds: { kind: "donut", center: spec.center, legend: spec.legend, color: spec.color },
        data: { labels: list.map(function (s) { return s.label; }), datasets: [{ data: list.map(function (s) { return s.value; }), _dsTones: list.map(function (s) { return s.tone; }), borderWidth: 2 }] },
        options: { cutout: "67%" },
        plugins: [centerPlugin] };
    },
    /* 혼합 — bars + lines, y 축은 하나(두 값의 단위가 다르면 차트를 둘로 나눈다) */
    mixed: function (spec) {
      var bars = (spec.bars || []).map(function (s, i) { return { label: s.label, data: s.data, tone: s.tone, type: "bar", borderWidth: 0, borderRadius: 0, maxBarThickness: 32, order: 2 + i }; });
      var lines = (spec.lines || []).map(function (s, i) { return { label: s.label, data: s.data, tone: s.tone, type: "line", borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 12, pointBorderWidth: 2, fill: false, order: i }; });
      return { type: "bar", _ds: { kind: "mixed", color: spec.color }, data: { labels: spec.labels, datasets: bars.concat(lines) }, options: {} };
    },
    /* 게이지 — 목표 대비 하나(사람의 결정 2026-11-15). value · max(기본 100) · label(가운데 큰 글자, 없으면 값) · caption(그 위 작은 설명) · tone.
       반원(위쪽), 채운 호 = 한 톤의 가장 진한 단계, 나머지 = 트랙. 범례 · 툴팁은 없다 — 값은 가운데 글자와 canvas 의 aria-label 이 나른다 */
    gauge: function (spec) {
      var max = +spec.max > 0 ? +spec.max : 100, v = Math.max(0, Math.min(max, +spec.value || 0));
      if (+spec.value > max) warn("gauge 의 value 가 max 보다 큽니다 — max 에서 멈춥니다");
      return { type: "doughnut", _ds: { kind: "gauge", center: spec.label != null ? spec.label : String(spec.value), caption: spec.caption },
        data: { labels: [spec.caption || "값", "남은 값"], datasets: [{ data: [v, max - v], tone: spec.tone, borderWidth: 0 }] },
        options: { rotation: -90, circumference: 180, cutout: "78%" },
        plugins: [centerPlugin] };
    },
    /* 스파크 — KPI 안 작은 추이. 축 · 격자 · 범례 없이 선과 옅은 영역만, hover 점과 툴팁은 남긴다. data · labels? · tone · area(기본 true) */
    spark: function (spec) {
      var data = spec.data || [], labels = spec.labels || data.map(function (_, i) { return String(i + 1); });
      return { type: "line", _ds: { kind: "spark" },
        data: { labels: labels, datasets: [{ label: spec.label || "값", data: data, tone: spec.tone, borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 3, pointHitRadius: 8, pointBorderWidth: 2, fill: spec.area === false ? false : "origin" }] },
        options: { layout: { padding: 2 } } };
    },
  };
  /* 가운데 글자 — 도넛은 CSS .donut::after 와 같은 Body 1 Normal 16/600, 게이지는 반원 안 Title 2 28/700 + 그 위 설명 12(Label 2) tertiary.
     크기는 화면 폭 단계를 따른다 */
  var CENTER_FONT = { weight: 600, size: 16 };
  var GAUGE_FONT = { weight: 700, size: 28, caption: 12 };
  var centerPlugin = { id: "dsCenter", afterDraw: function (chart) {
    var ds = chart.$ds; if (!ds || ds.center == null || ds.center === "") return;
    var area = chart.chartArea, ctx = chart.ctx, s = rootScale(), fam = chart.options.plugins.tooltip.bodyFont.family;
    ctx.save(); ctx.textAlign = "center";
    if (ds.kind === "gauge") {
      /* 반원의 중심(호의 아래 끝)을 기준으로 값의 기준선을 놓는다 */
      var arc = chart.getDatasetMeta(0).data[0], cx = arc ? arc.x : (area.left + area.right) / 2, cy = arc ? arc.y : area.bottom;
      ctx.textBaseline = "alphabetic"; ctx.fillStyle = ds.text || "#000"; ctx.font = GAUGE_FONT.weight + " " + GAUGE_FONT.size * s + "px " + fam;
      ctx.fillText(String(ds.center), cx, cy - 4 * s);
      if (ds.caption) { ctx.fillStyle = ds.sub || ds.text || "#000"; ctx.font = "500 " + Math.max(FONT_MIN, GAUGE_FONT.caption * s) + "px " + fam; ctx.fillText(String(ds.caption), cx, cy - (4 + GAUGE_FONT.size + 8) * s); }
    } else {
      ctx.font = CENTER_FONT.weight + " " + CENTER_FONT.size * s + "px " + fam; ctx.fillStyle = ds.text || "#000"; ctx.textBaseline = "middle";
      ctx.fillText(String(ds.center), (area.left + area.right) / 2, (area.top + area.bottom) / 2);
    }
    ctx.restore();
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
    /* 첫 등장 애니메이션도 이 어댑터의 값으로 — paint 는 Chart 를 만든 뒤에 옵션을 넣어서, 첫 애니메이션은 Chart.js 기본 1000ms 로 돌고
       줄인 모션에서도 돌았다(2026-11-20 측정). 사용자가 준 animation 은 그대로 둔다 */
    if (config.options.animation === undefined) config.options.animation = baseOptions(t, 1).animation;
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
    /* 화면 폭 단계가 바뀌면(창 크기 변경으로 루트 글꼴 크기가 달라지면) 다시 칠한다 — 캔버스 크기 변경만으로는 글자 크기를 다시 정하지 않는다 */
    var lastScale = rootScale();
    root.addEventListener("resize", function () { var s = rootScale(); if (s !== lastScale) { lastScale = s; repaintAll(); } });
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

  /* ---------- 표로 보기 ----------
     캔버스의 값은 스크린 리더 · 키보드로 읽을 수 없다(사람의 결정 2026-11-10). 차트가 그리는 data 그대로 표를 만든다 — 사이트와 React 가 같은 함수 */
  /* 빈 값은 보이는 '—' + 숨긴 '값 없음'(사람의 결정 2026-11-11) — '—' 만 두면 스크린 리더가 읽지 않거나 '대시'로 읽는다. tableData 는 빈 칸을 null 로 돌려주고 그리는 쪽이 둘을 넣는다 */
  var TABLE_LABELS = { table: "표로 보기", chart: "차트로 보기", head: "구분", value: "값", empty: "값 없음" };
  function tableData(data, labels) {
    var L = Object.assign({}, TABLE_LABELS, labels), ds = data.datasets || [];
    return {
      head: [L.head].concat(ds.map(function (d, i) { return d.label || (ds.length === 1 ? L.value : L.value + " " + (i + 1)); })),
      rows: (data.labels || []).map(function (l, r) {
        return [String(l)].concat(ds.map(function (d) { var v = d.data[r]; return v == null ? null : typeof v === "number" ? v.toLocaleString("ko-KR") : String(v); }));
      }),
    };
  }
  function cellHtml(c, L) { return c == null ? '<span aria-hidden="true">—</span><span class="sr-only">' + esc(L.empty) + "</span>" : esc(c); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function viewLabels(view) { try { return Object.assign({}, TABLE_LABELS, JSON.parse(view.getAttribute("data-labels") || "{}")); } catch (e) { console.warn("[ds-chart] data-labels 는 JSON 입니다"); return TABLE_LABELS; } }
  function toggleTable(btn) {
    var view = btn.closest(".chart-view"), wrap = view.querySelector(".chart-canvas"), canvas = wrap.querySelector("canvas"), box = view.querySelector(".chart-table"), L = viewLabels(view);
    if (!canvas.__dsChart) return;
    var show = !wrap.hidden;
    if (show) {
      if (!box) { box = doc.createElement("div"); box.className = "tbl-wrap sticky chart-table"; box.tabIndex = 0; box.setAttribute("role", "region"); box.setAttribute("aria-label", canvas.getAttribute("aria-label") || ""); view.appendChild(box); }
      var t = tableData(canvas.__dsChart.chart.data, L);
      box.innerHTML = '<table class="tbl compact"><thead><tr>' + t.head.map(function (h, i) { return '<th scope="col"' + (i ? ' class="num"' : "") + ">" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        t.rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (i ? ' class="num"' : "") + ">" + cellHtml(c, L) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
    }
    wrap.hidden = show; if (box) box.hidden = !show;
    btn.textContent = show ? L.chart : L.table;
  }

  var DSChart = { tableData: tableData, TABLE_LABELS: TABLE_LABELS, theme: theme, presets: presets, mount: mount, auto: auto, paint: paint, resolve: resolve, legendPosition: legendPosition, palette: palette, areaFill: areaFill,
    SERIES_MAX: SERIES_MAX, MONO_MAX: MONO_MAX, MONO_STEPS: MONO_STEPS, CENTER_FONT: CENTER_FONT, GAUGE_FONT: GAUGE_FONT, TOKENS: TOKENS, TONES: TONES };
  if (typeof module !== "undefined" && module.exports) module.exports = DSChart;
  root.DSChart = DSChart;
  if (doc && root.Chart !== undefined) { /* 사이트 · 순수 JS: 벤더 스크립트가 먼저 defer 로 실려 있다 */
    doc.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-chart-table]"); if (b) toggleTable(b); });
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { auto(root.Chart, doc); });
    else auto(root.Chart, doc);
  }
})(typeof window !== "undefined" ? window : globalThis);
