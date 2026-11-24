/* =========================================================
   ds-chart.js — Chart.js 테마 어댑터 + 프리셋 (순수 JS, Chart.js 를 번들하지 않고 인자로 받는다)
   사용: <script src="assets/vendor/chart.umd.js" defer></script>
         <script src="assets/ds-chart.js" defer></script>
         <canvas data-chart="timeseries" data-spec='{…}' role="img" aria-label="…"></canvas>   → DOMContentLoaded 때 자동 mount
   또는: DSChart.mount(Chart, canvas, DSChart.presets.bar(spec))  /  React 는 @jiran/ds-react/chart 가 같은 함수를 쓴다.
   - theme(el)      : 토큰(--chart-* · 심각도 · 면 · 글꼴)을 계산값으로 읽어 Chart.js options 조각을 만든다. 캔버스는 CSS 변수를 못 읽는다
   - presets.*      : timeseries(선/영역 · 누적) · bar(세로/가로 · 그룹/누적 · 강조) · donut · mixed(막대 + 선, y 축 하나) · gauge(반원 진행률) · spark(KPI 안 작은 추이) — spec → Chart.js config
   - 색 모드(사람의 결정 2026-11-15): color "mono"(기본 — 고정 파랑 명도 4단계 --chart-mono-1~4, 제품 색과 무관) · "categorical"(--chart-series-1~6).
     tone 을 준 계열(심각도 · 상태)은 언제나 그 톤이다. tone 없는 계열(도넛은 조각)이 5개 이상이면 mono 대신 categorical 로 그린다
   - mount          : Chart 생성 + 라이트/다크 전환(data-theme · prefers-color-scheme) · 제품색 주입 · 화면 폭 단계 변화 때 다시 칠한다
   - auto           : canvas[data-chart] 를 찾아 data-spec(JSON) 으로 mount
   마크 규격(dataviz 기준 — 사람의 결정 2026-11-20, 11-05 · 11-06 · 11-15 의 결정을 바꿈): 선 2px · 끝과 꺾임은 둥글게 · 점은 hover 때만 지름 8 + 면 색 링 2 ·
   막대는 최대 24 · 값 쪽 끝만 4px 둥글게(바닥은 각짐) · stroke 없음 · 누적 조각과 맞닿은 막대 사이 2px 면 색 틈 · 영역은 계열 색 10% ·
   도넛 조각 사이 2px 면 색 경계 · 격자는 값 축만, 실선 hairline · 범례는 2계열 이상일 때 아래, 원형 아이콘(도넛의 옆 범례는 자리가 좁고 높으면 아래로) ·
   툴팁은 값이 먼저(굵게) · 계열은 짧은 선 키 · 선 · 막대 차트는 세로 crosshair · 값 축 눈금은 ko-KR 천 단위(축이 1만에 닿으면 축 전체를 만 단위) ·
   y 축은 하나(이중 축 금지) · 계열 색 6개 순서 고정(slot 으로 고정 가능), 7번째부터는 '기타'로 묶는다
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
    surface: "--surface-elevated-primary", text: "--foreground-neutral-primary", sub: "--foreground-neutral-tertiary",
    /* meter 트랙 = 채움과 같은 파랑의 옅은 단계(사람의 요청 2026-11-20 — dataviz meter 규칙, 종전 회색 --surface-neutral-strong). 게이지의 남은 호 · 진행 막대 목록의 트랙 */
    track: "--chart-mono-track",
    /* crosshair — 격자(--line-neutral-tertiary)보다 한 단계 진한 선. 격자와 구별되고 데이터보다는 조용하다 */
    cross: "--line-neutral-primary",
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
      sub: resolve(el, TOKENS.sub), track: resolve(el, TOKENS.track), cross: resolve(el, TOKENS.cross),
      scale: rootScale(),
      font: { family: cs.fontFamily, size: Math.max(FONT_MIN, 12 * rootScale()) },
      reduced: !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches),
    };
    Object.keys(TONES).forEach(function (k) { t.tone[k] = resolve(el, TONES[k]); });
    return t;
  }
  /* 색 정하기 — tone 이 있으면 그 토큰. tone 없는 것들만 모아 color 모드로 칠한다:
     mono(기본)는 개수에 맞는 명도 단계(MONO_STEPS), 5개 이상이거나 categorical 이면 계열 색 1~6 순서(넘치면 '기타'로 묶는 것이 규칙이라 경고).
     tones 는 계열(도넛은 조각)마다 tone 또는 undefined. 돌려주는 값은 같은 길이의 색 배열.
     slots(선택)는 계열마다 1부터의 고정 자리 — 주면 그 계열은 개수와 무관하게 그 자리의 색이다(dataviz '색은 대상을 따른다': 필터로 계열이 빠져도
     남은 계열이 다시 칠해지지 않게). mono 는 MONO_STEPS[4] 의 자리(1 = 가장 진함 … 4 = 가장 옅음), categorical 은 계열 색 순서 */
  function colorMode(mode, n) {
    if (mode === "categorical") return "categorical";
    if (n > MONO_MAX) { if (mode === "mono" && root.console) root.console.warn("[ds-chart] 한 톤(mono)은 " + MONO_MAX + "계열까지입니다 — " + n + "계열은 범주색(categorical)으로 그립니다"); return "categorical"; }
    return "mono";
  }
  function palette(t, mode, tones, slots) {
    slots = slots || [];
    var free = tones.filter(function (x) { return !(x && t.tone[x]); }).length, m = colorMode(mode, free), k = 0;
    /* slot 을 하나라도 쓰면 mono 의 단계는 4계열 표(MONO_STEPS[4])로 고정한다 — 개수별 표를 쓰면 계열 수가 바뀔 때 단계가 바뀐다 */
    var pinned = slots.some(function (x) { return +x > 0; });
    if (m === "categorical" && free > SERIES_MAX && root.console) root.console.warn("[ds-chart] 계열이 " + SERIES_MAX + "개를 넘습니다 — 7번째부터는 '기타'로 묶으세요");
    return tones.map(function (x, i) {
      if (x && t.tone[x]) return t.tone[x];
      var j = k++, sl = +slots[i];
      if (sl > 0) return m === "mono" ? t.mono[MONO_STEPS[MONO_MAX][Math.min(sl, MONO_MAX) - 1]] : t.series[Math.min(sl, SERIES_MAX) - 1];
      return m === "mono" ? t.mono[(pinned ? MONO_STEPS[MONO_MAX] : MONO_STEPS[free])[j]] : t.series[Math.min(j, SERIES_MAX - 1)];
    });
  }
  function font(t, weight) { return { family: t.font.family, size: t.font.size, weight: weight || 400 }; }
  /* 애니메이션 중에 들어온 크기 변경은 Chart.js 가 '다음 그리기' 로 미뤄 둔다. 그런데 애니메이션은 그리기 없이 끝나는
     프레임이 있어서(마지막 항목을 치우는 틱), 그 틈에 들어온 변경은 영영 적용되지 않았다 — 부하가 걸린 채 창을 1440 → 390 으로 줄이면
     대시보드 '일별 탐지' 캔버스가 445 로 남았다(hover 애니메이션 도중, 2026-11-20 측정). 애니메이션이 끝날 때 공개 API resize() 로
     틀 크기를 다시 잰다 — onComplete 때는 애니메이션이 이미 끝난 것으로 쳐서 미루지 않고 바로 적용하고, 크기가 같으면 아무것도 하지 않는다.
     2026-11-23 — 종전엔 미뤄 둔 값을 내부 이름 _resizeBeforeDraw 로 읽어 Chart.js 버전을 올리면 깨질 수 있었다.
     틀이 숨어 0 × 0 이면 Chart.js 의 ResizeObserver 처럼 건너뛴다(숨은 탭 · 표로 보기 · 닫힌 패널의 차트를 0 으로 만들지 않게) */
  function flushResize(ctx) {
    var c = ctx && ctx.chart, box = c && c.canvas && c.canvas.parentNode;
    if (box && (box.clientWidth || box.clientHeight)) c.resize();
  }
  /* ---------- 숫자 ----------
     값 축 눈금은 ko-KR 천 단위, 축이 1만에 닿으면 축 전체를 만 단위(1만 · 2.5만)로 — 한 축에 한 형식(dataviz 'Y-axis ticks'). 툴팁 값도 ko-KR */
  var NUM = new Intl.NumberFormat("ko-KR"), COMPACT = new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }), COMPACT_FROM = 10000;
  function tickFormat(v) {
    var sc = this, m = Math.max(Math.abs(+sc.max || 0), Math.abs(+sc.min || 0));
    return typeof v !== "number" ? v : m >= COMPACT_FROM ? COMPACT.format(v) : NUM.format(v);
  }
  /* 툴팁 한 줄 = 값(굵게) + 계열 이름(옅게) — dataviz 'Values lead, labels follow'. Chart.js 는 한 줄을 한 글꼴로 그려서
     label 은 '값 SEP 이름' 으로 넘기고 tipBody 가 둘을 나눠 그린다. 줄 폭은 Chart.js 가 굵은 글꼴(bodyFont 600)로 재므로 이름을 400 으로 그려도 넘치지 않는다 */
  var TIP_SEP = "\u2002";
  function tipValue(ctx) {
    var ch = ctx.chart, kind = (ch.$ds || {}).kind, p = ctx.parsed;
    var v = typeof p === "number" ? p : p == null ? null : ch.options.indexAxis === "y" ? p.x : p.y;
    if (kind === "donut" && typeof p !== "number") v = ctx.raw;
    return v == null || !isFinite(+v) ? TABLE_LABELS.empty : NUM.format(+v);
  }
  function tipLabel(ctx) {
    var kind = (ctx.chart.$ds || {}).kind, name = kind === "donut" ? ctx.label : ctx.dataset.label;
    return tipValue(ctx) + (name ? TIP_SEP + name : "");
  }
  /* 툴팁의 계열 키 = 그 계열의 단색(막대의 borderColor 는 투명, 영역의 backgroundColor 는 10% 라 그대로 쓰면 키가 안 보인다) */
  function tipColor(ctx) {
    var c = ctx.dataset._dsColor; if (Array.isArray(c)) c = c[ctx.dataIndex];
    return { borderColor: c, backgroundColor: c, borderWidth: 2 };
  }
  function baseOptions(t, n, horizontal) {
    var s = t.scale || 1;
    /* 격자는 값 축에만(가로 막대면 x) — 종전에는 가로 막대에서도 y(범주 축)에 격자가 있고 값 축에는 없었다(2026-11-20 발견) */
    var valueAxis = { beginAtZero: true, grid: { display: true, color: t.grid, drawTicks: false, lineWidth: 1 }, border: { display: false, dash: [] }, ticks: { color: t.axis, font: font(t), padding: 8 * s, maxTicksLimit: 5, maxRotation: 0, callback: tickFormat } };
    var catAxis = { grid: { display: false }, border: { display: true, color: t.grid, dash: [] }, ticks: { color: t.axis, font: font(t), maxRotation: 0, autoSkip: true, autoSkipPadding: 12 * s } };
    return {
      responsive: true, maintainAspectRatio: false, animation: t.reduced ? false : { duration: 200, onComplete: flushResize },
      interaction: { mode: "index", intersect: false },
      color: t.axis,
      plugins: {
        /* 원형 점의 지름 — 범례는 boxHeight × √2(7 이면 10, 정적 .chart-legend i 와 같음), 툴팁은 min(boxWidth, boxHeight)(6) — Chart.js 4.6.1 이 둘을 다른 식으로 그린다 */
        /* 범례는 데이터셋(도넛은 조각) 순서 — Chart.js 기본은 그리기 order 라 혼합 차트에서 선(위에 그림)이 먼저 왔다 */
        legend: { display: n > 1, position: "bottom", align: "start", labels: { color: t.axis, boxWidth: 7 * s, boxHeight: 7 * s, usePointStyle: true, pointStyle: "circle", padding: 16 * s, font: font(t), sort: function (a, b) { return ((a.datasetIndex || 0) - (b.datasetIndex || 0)) || ((a.index || 0) - (b.index || 0)); } } },
        /* 툴팁: 제목 = x 라벨(600), 줄 = 값(600, 툴팁 글자색) + 계열 이름(400, 같은 색 72%) · 계열 키는 짧은 선 12 × 2(사람의 결정 2026-11-20 — 범례는 원 그대로).
           pointStyle "line" 은 audit 이 읽는 표식이고, 실제 키는 tipBody 가 2px 둥근 끝 선으로 그린다 */
        tooltip: { backgroundColor: t.tipBg, titleColor: t.tipFg, bodyColor: t.tipFg, padding: 10 * s, cornerRadius: 6 * s, boxWidth: 12 * s, boxHeight: 12 * s, boxPadding: 6 * s, usePointStyle: true, pointStyle: "line", titleFont: font(t, 600), bodyFont: font(t, 600),
          callbacks: { label: tipLabel, labelColor: tipColor } },
      },
      /* 격자는 실선 hairline(dataviz — 사람의 결정 2026-11-20, 11-15 의 점선 3 · 3 을 바꿈). 점선은 '예측 · 기준선' 으로 읽힌다 */
      scales: horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis },
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
  /* 영역 — 계열이 하나인 선(spark 포함)은 세로 그라데이션, 여러 계열의 누적 영역은 계열 색 10% 단색(사람의 결정 2026-11-24 — 11-20 의 '모두 10% 단색' 을 바꿈).
     그라데이션은 그 계열의 가장 높은 값에서 차트 바닥까지 위 32% → 아래 6%(11-13 의 값). 크기 · 값이 같으면 만든 것을 다시 쓴다.
     배치 전(chartArea 없음)에는 단색 10%. 범례 · 툴팁 키는 단색(_dsColor)이라 이 칠을 쓰지 않는다 */
  var AREA_ALPHA = 0.1, AREA_TOP = 0.32, AREA_BOTTOM = 0.06;
  function areaFill(c) {
    var cache = {};
    return function (ctx) {
      var chart = ctx && ctx.chart, a = chart && chart.chartArea, y = chart && chart.scales && chart.scales.y, i = ctx && ctx.datasetIndex;
      if (!a || !y || i == null || (y.options && y.options.stacked)) return alpha(c, AREA_ALPHA);
      var top = -Infinity;
      (chart.data.datasets[i].data || []).forEach(function (d) { d = +d; if (isFinite(d) && d > top) top = d; });
      var py = isFinite(top) ? Math.max(a.top, Math.min(a.bottom - 1, y.getPixelForValue(top))) : a.top, key = py + "|" + a.bottom;
      if (cache.key !== key) { var g = chart.ctx.createLinearGradient(0, py, 0, a.bottom); g.addColorStop(0, alpha(c, AREA_TOP)); g.addColorStop(1, alpha(c, AREA_BOTTOM)); cache = { key: key, g: g }; }
      return cache.g;
    };
  }
  /* 막대 그라데이션(옵션 gradient:true — 사람의 결정 2026-11-24 에 되살림, 기본은 단색) — 막대마다 값 끝(진한 색)에서 기준선(같은 색 55%)까지.
     진한 끝이 그래픽 3:1 을 지킨다. 가로 막대는 왼쪽(기준선) → 오른쪽(값 끝). 위치 · 크기가 같으면 만든 것을 다시 쓴다 */
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

  /* ---------- 막대 모양(dataviz — 사람의 결정 2026-11-20 · 11-24) ----------
     두께 최대 24 · 네 모서리 모두 각짐(BAR_END 0 — 2026-11-24 에 11-20 의 값 끝 4px 를 지움) · 누적 조각 사이와 맞닿은 묶음 막대 사이 2px 면 색 틈. 테두리로 가르지 않는다 —
     틈은 투명 border 로 채움을 깎아 만든다(Chart.js 는 바깥 사각형을 borderColor 로, 안쪽을 backgroundColor 로 칠한다 — 투명이면 뒤의 카드 면이 보인다) */
  var BAR_MAX = 24, BAR_END = 0, BAR_GAP = 2;
  /* 그 칸에서 0 이 아닌 값을 가진 마지막(보이는) 막대 계열 = 쌓은 막대의 값 끝 */
  function stackTop(ctx) {
    var ch = ctx.chart, ds = ch.data.datasets, j = ctx.dataIndex, top = -1;
    for (var k = 0; k < ds.length; k++) {
      if ((ds[k].type || (ch.config && ch.config.type)) !== "bar" || (ch.isDatasetVisible && !ch.isDatasetVisible(k))) continue;
      var v = +(ds[k].data || [])[j]; if (v) top = k;
    }
    return top;
  }
  /* 누적: 값 끝 조각 말고는 값 쪽(위 · 오른쪽)에 투명 2px — 다음 조각과의 틈 */
  function stackBorder(horizontal) { return function (ctx) { return ctx.datasetIndex === stackTop(ctx) ? 0 : horizontal ? { right: BAR_GAP } : { top: BAR_GAP }; }; }
  /* 묶음(누적 아닌 여러 계열): 한 칸 안의 막대 사이가 2px 이 되게 칸 비율을 정한다. 막대가 24 에 닿으면 칸을 좁혀 묶음이 벌어지지 않게 한다.
     Chart.js 는 칸 폭 × categoryPercentage ÷ 계열 수 = 한 막대 자리, 그 × barPercentage = 막대(최대 24) */
  var CAT_PCT = 0.8, BAR_PCT = 0.9;
  function groupSlot(horizontal, n) {
    var w = function (ctx) {
      var ch = ctx.chart, sc = ch.scales && ch.scales[horizontal ? "y" : "x"], len = (ch.data.labels || []).length || 1;
      var size = sc ? (horizontal ? sc.height : sc.width) : 0;
      return size > 0 ? size / len : 0;
    };
    return {
      cat: function (ctx) { var cw = w(ctx); if (!cw) return CAT_PCT; var slot = cw * CAT_PCT / n; return slot - BAR_GAP > BAR_MAX ? Math.min(CAT_PCT, n * (BAR_MAX + BAR_GAP) / cw) : CAT_PCT; },
      bar: function (ctx) { var cw = w(ctx); if (!cw) return BAR_PCT; var slot = Math.min(cw * CAT_PCT / n, BAR_MAX + BAR_GAP); return slot > BAR_GAP ? (slot - BAR_GAP) / slot : BAR_PCT; },
    };
  }

  /* ---------- 플러그인: 툴팁 줄 · crosshair ---------- */
  function tipBody(pt, ctx, o) {
    var self = this, ch = self.chart, s = rootScale(), size = o.bodyFont.size, fam = o.bodyFont.family, lh = size * 1.2;
    var pad = typeof o.padding === "number" ? o.padding : (o.padding && o.padding.left) || 0, x0 = self.x + pad, kw = o.boxWidth, sub = (ch.$ds || {}).tipSub || o.bodyColor;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    (self.body || []).forEach(function (item, i) {
      (item.lines || []).forEach(function (line, j) {
        var cy = pt.y + lh / 2, x = x0;
        if (o.displayColors) {
          if (j === 0) { var c = self.labelColors[i] || {}; ctx.save(); ctx.strokeStyle = c.borderColor || c.backgroundColor; ctx.lineWidth = 2 * s; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x + s, cy); ctx.lineTo(x + kw - s, cy); ctx.stroke(); ctx.restore(); }
          x += kw + 2 + o.boxPadding;
        }
        var k = line.indexOf(TIP_SEP), val = k < 0 ? line : line.slice(0, k), name = k < 0 ? "" : line.slice(k + TIP_SEP.length);
        ctx.font = "600 " + size + "px " + fam; ctx.fillStyle = o.bodyColor; ctx.fillText(val, x, cy);
        if (name) { x += ctx.measureText(val).width + size * 0.5; ctx.font = "400 " + size + "px " + fam; ctx.fillStyle = sub; ctx.fillText(name, x, cy); }
        pt.y += lh + o.bodySpacing;
      });
    });
    pt.y -= o.bodySpacing;
  }
  var tipPlugin = { id: "dsTip", beforeTooltipDraw: function (chart, args) { var tt = args.tooltip; if (tt && tt.drawBody !== tipBody) tt.drawBody = tipBody; } };
  /* 선 · 영역(혼합 포함)은 세로 crosshair 가 포인터에 가장 가까운 x 를 잡는다(dataviz 'The crosshair finds the X'). 막대만 있는 차트는 막대가 hover 대상이라 없다 */
  var crossPlugin = { id: "dsCross", afterDatasetsDraw: function (chart) {
    var meta = chart.$ds || {}; if (meta.kind !== "timeseries" && meta.kind !== "mixed") return;
    var tt = chart.tooltip, act = tt && tt.getActiveElements ? tt.getActiveElements() : [], a = chart.chartArea;
    if (!act.length || !a) return;
    var x = Math.round(act[0].element.x) + 0.5, ctx = chart.ctx;
    ctx.save(); ctx.strokeStyle = meta.cross || "rgba(0,0,0,.2)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); ctx.stroke(); ctx.restore();
  } };
  function paint(chart, t) {
    /* Chart.js 의 chart.config 는 Config 래퍼라 config 에 붙인 _ds 가 보이지 않는다 — mount 가 chart.$ds 로 옮겨 둔다 */
    var meta = chart.$ds || {}, kind = meta.kind, data = chart.data, n = data.datasets.length, round = kind === "donut" || kind === "gauge";
    deepAssign(chart.options, baseOptions(t, kind === "donut" ? data.labels.length : kind === "gauge" || kind === "spark" ? 1 : n, !!meta.horizontal));
    /* 프리셋 · 사용자가 config.options 에 준 것이 기본 옵션 위에 남아야 한다 — 종전에는 기본이 덮어 bar 의 autoSkip:false 가 사라졌다(Figma 대조에서 발견, 2026-11-04) */
    if (meta.options) deepAssign(chart.options, meta.options);
    if (round) { chart.options.scales = {}; chart.options.interaction = { mode: "nearest", intersect: true }; }
    if (kind === "donut") { chart.options.plugins.legend.position = legendPosition(meta.legend, chart.width, chart.height); chart.options.onResize = relayout; }
    if (kind === "gauge") { chart.options.plugins.tooltip.enabled = false; }
    if (kind === "spark") { chart.options.scales = { x: { display: false }, y: { display: false, beginAtZero: false } }; }
    var cols = kind === "donut" ? palette(t, meta.color, data.datasets[0]._dsTones || [], data.datasets[0]._dsSlots)
      : palette(t, meta.color, data.datasets.map(function (ds) { return ds.tone; }), data.datasets.map(function (ds) { return ds.slot; }));
    data.datasets.forEach(function (ds, i) {
      var c = cols[i];
      ds._dsColor = kind === "donut" ? cols : c;
      if (kind === "donut") {
        ds.backgroundColor = cols;
        ds.borderColor = t.surface; ds.borderWidth = 2; ds.hoverBorderColor = t.surface; ds.hoverOffset = 4;
      } else if (kind === "gauge") {
        /* 채운 호 = 한 톤의 가장 진한 단계(또는 tone), 나머지 = 트랙(진행 막대 · 정적 막대의 트랙과 같은 면) */
        var g = ds.tone && t.tone[ds.tone] ? t.tone[ds.tone] : t.mono[0];
        ds.backgroundColor = [g, t.track]; ds.hoverBackgroundColor = [g, t.track]; ds.borderWidth = 0;
      } else if (ds.type === "line" || kind === "timeseries" || kind === "spark") {
        ds.borderColor = c; ds.backgroundColor = ds.fill ? areaFill(c) : c; ds.pointBackgroundColor = c; ds.pointBorderColor = t.surface;
        ds.pointHoverBackgroundColor = c; ds.pointHoverBorderColor = t.surface;   // hover 점 = 계열 색 + 면 색 링 2(dataviz 'Surface ring')
      } else {
        /* 강조(highlight) — 한 계열 막대에서 그 막대만 가장 진한 단계, 나머지는 가장 옅은 단계(같은 파랑). tone 을 준 계열은 강조하지 않는다 */
        var hi = meta.highlight;
        if (hi != null && n === 1 && !(ds.tone && t.tone[ds.tone])) {
          ds.backgroundColor = (ds.data || []).map(function (_, j) { return j === hi ? t.mono[0] : t.mono[MONO_MAX - 1]; });
        } else ds.backgroundColor = meta.gradient ? barFill(c, !!meta.horizontal) : c;
        ds.borderColor = "transparent";   // 막대는 stroke 없음 — 투명 border 는 틈(누적)에만 쓰인다
      }
    });
    meta.text = t.text; meta.sub = t.sub; meta.cross = t.cross;
    /* 툴팁의 계열 이름 = 툴팁 글자색 72% — 반전 면 위에서 값보다 한 단계 옅다(라이트 · 다크 모두 대비 7 이상, 캔버스라 contrast 게이트 밖) */
    meta.tipSub = alpha(t.tipFg, 0.72);
  }

  /* ---------- presets ---------- */
  function seriesOf(spec) { return (spec.series || []).map(function (s) { return { label: s.label, data: s.data, tone: s.tone, slot: s.slot }; }); }
  var LINE = { borderWidth: 2, borderCapStyle: "round", borderJoinStyle: "round", tension: 0.3, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 12, pointBorderWidth: 2, pointHoverBorderWidth: 2 };
  function warn(msg) { if (root.console) root.console.warn("[ds-chart] " + msg); }
  var presets = {
    /* 시계열 — 선, stacked 면 누적 영역(심각도 누적 추이 같은). 점은 hover 때만 지름 8 + 면 색 링 2, 선 끝 · 꺾임은 둥글게.
       계열이 하나면 선 아래를 세로 그라데이션으로 칠한다(사람의 결정 2026-11-15 · 11-24) — area:false 로 끈다. 여러 계열의 겹친 영역은 서로 가려 칠하지 않는다 */
    timeseries: function (spec) {
      var stacked = !!spec.stacked, list = seriesOf(spec), area = !stacked && list.length === 1 && spec.area !== false;
      return { type: "line", _ds: { kind: "timeseries", color: spec.color },
        data: { labels: spec.labels, datasets: list.map(function (s, i) {
          return deepAssign(deepAssign(s, LINE), { fill: stacked ? (i === 0 ? "origin" : "-1") : area ? "origin" : false, order: i });
        }) },
        options: { scales: { x: { stacked: stacked }, y: { stacked: stacked } } } };
    },
    /* 막대 — horizontal 로 가로, stacked 로 누적. 최대 24 · 각짐 · 누적과 묶음 사이 2px 면 색 틈(위 '막대 모양').
       highlight: n(0부터) — 한 계열에서 그 막대만 진하게(강조가 그라데이션보다 먼저). gradient: true — 막대마다 값 끝 → 기준선 그라데이션, 누적에는 쓰지 않는다(조각끼리 갈리지 않음) */
    bar: function (spec) {
      var stacked = !!spec.stacked, list = seriesOf(spec), hz = !!spec.horizontal, group = !stacked && list.length > 1 ? groupSlot(hz, list.length) : null, gradient = !!spec.gradient;
      if (gradient && stacked) { warn("누적 막대에는 gradient 를 쓰지 않습니다 — 단색으로 그립니다"); gradient = false; }
      if (spec.highlight != null && list.length !== 1) warn("highlight 는 계열이 하나인 막대에만 씁니다");
      return { type: "bar", _ds: { kind: "bar", color: spec.color, highlight: spec.highlight, gradient: gradient, horizontal: hz },
        data: { labels: spec.labels, datasets: list.map(function (s) {
          /* inflateAmount 0 — 기본(auto)은 막대를 0.33px 부풀려 2px 틈을 메운다 */
          var o = { borderWidth: 0, borderRadius: BAR_END, borderSkipped: "start", maxBarThickness: BAR_MAX, inflateAmount: 0 };
          if (stacked) o.borderWidth = stackBorder(hz);
          if (group) { o.categoryPercentage = group.cat; o.barPercentage = group.bar; }
          return deepAssign(s, o);
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
      var bars = (spec.bars || []).map(function (s, i) { return { label: s.label, data: s.data, tone: s.tone, slot: s.slot, type: "bar", borderWidth: 0, borderRadius: BAR_END, borderSkipped: "start", maxBarThickness: BAR_MAX, inflateAmount: 0, order: 2 + i }; });
      var lines = (spec.lines || []).map(function (s, i) { return deepAssign({ label: s.label, data: s.data, tone: s.tone, slot: s.slot, type: "line", fill: false, order: i }, LINE); });
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
    /* 스파크 — KPI 안 작은 추이. 축 · 격자 · 범례 없이 선과 옅은 영역만, hover 점과 툴팁은 남긴다. data · labels? · tone · area(기본 true).
       마지막 점(지금)에 끝 점 — 반지름 3 + 면 색 링 2(보이는 지름 8, dataviz 'end-dot'). 끝 점이 잘리지 않게 여백 4 */
    spark: function (spec) {
      var data = spec.data || [], labels = spec.labels || data.map(function (_, i) { return String(i + 1); }), last = data.length - 1;
      return { type: "line", _ds: { kind: "spark" },
        data: { labels: labels, datasets: [deepAssign(deepAssign({ label: spec.label || "값", data: data, tone: spec.tone }, LINE), { pointRadius: function (ctx) { return ctx.dataIndex === last ? 3 : 0; }, pointHoverRadius: 3, pointHitRadius: 8, fill: spec.area === false ? false : "origin" })] },
        options: { layout: { padding: 4 } } };
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
    /* 툴팁 줄 · crosshair 플러그인 — 차트마다(전역 등록을 하지 않아 제품의 다른 Chart.js 차트를 건드리지 않는다) */
    var plugs = config.plugins || [];
    [tipPlugin, crossPlugin].forEach(function (p) { if (plugs.indexOf(p) < 0) plugs = plugs.concat([p]); });
    config.plugins = plugs;
    var kind = config.type, chart = new Chart(canvas, config);
    chart.$ds = config._ds || {}; chart.$ds.options = own;
    /* 2d 컨텍스트가 없는 환경(jsdom 테스트)에서는 Chart.js 가 ctx 없이 만들어지고 update 가 던진다 — 칠하지 않고 handle 만 돌려준다 */
    var live = function () { return !!chart.ctx; };
    if (live()) { paint(chart, t); chart.update("none"); }
    var handle = { chart: chart, repaint: function () { if (live()) { paint(chart, theme(canvas)); chart.update("none"); } },
      /* 같은 종류면 지우지 않고 data · options 만 바꿔 다시 칠한다(2026-11-20, dataviz 'Refetch keeps the frame') — 캔버스가 비었다 다시 그려지며
         깜빡이거나 높이가 흔들리지 않고, 바뀐 값으로 옮겨 가는 애니메이션이 돈다. 종류가 다르면 false — 부르는 쪽이 다시 만든다 */
      update: function (next) {
        if (!next || next.type !== kind) return false;   // 처음 만든 종류와 대조 — chart.config 는 Chart.js 내부라 기대지 않는다
        var o = next.options || {}, mine = JSON.parse(JSON.stringify(o));
        if (o.animation === undefined) o.animation = baseOptions(theme(canvas), 1).animation;
        chart.data.labels = next.data.labels; chart.data.datasets = next.data.datasets; chart.options = o;
        chart.$ds = next._ds || {}; chart.$ds.options = mine;
        if (live()) { paint(chart, theme(canvas)); chart.update(); }
        return true;
      },
      destroy: function () {
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

  var DSChart = { tableData: tableData, TABLE_LABELS: TABLE_LABELS, theme: theme, presets: presets, mount: mount, auto: auto, paint: paint, resolve: resolve, legendPosition: legendPosition, palette: palette, areaFill: areaFill, barFill: barFill,
    tickFormat: tickFormat, tipLabel: tipLabel, BAR_MAX: BAR_MAX, BAR_END: BAR_END, BAR_GAP: BAR_GAP, AREA_ALPHA: AREA_ALPHA, AREA_TOP: AREA_TOP, AREA_BOTTOM: AREA_BOTTOM, BAR_FADE: BAR_FADE, COMPACT_FROM: COMPACT_FROM,
    SERIES_MAX: SERIES_MAX, MONO_MAX: MONO_MAX, MONO_STEPS: MONO_STEPS, CENTER_FONT: CENTER_FONT, GAUGE_FONT: GAUGE_FONT, TOKENS: TOKENS, TONES: TONES };
  if (typeof module !== "undefined" && module.exports) module.exports = DSChart;
  root.DSChart = DSChart;
  if (doc && root.Chart !== undefined) { /* 사이트 · 순수 JS: 벤더 스크립트가 먼저 defer 로 실려 있다 */
    doc.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-chart-table]"); if (b) toggleTable(b); });
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { auto(root.Chart, doc); });
    else auto(root.Chart, doc);
  }
})(typeof window !== "undefined" ? window : globalThis);
