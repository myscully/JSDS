/* =========================================================
   components.data.js — 컴포넌트 상세(수는 세어 쓴다 — render.js 가 Object.keys 로)
   shape: { status, desc, css:[접두어…], examples:[{id,title,desc,html,react?,layout?,style?}],
            props:[[name, type, default, desc]], spec:[[k,v]], figma:{…}, principles? }
   choose:[[항목, 문장]] 는 정의 바로 아래 표 — '언제 쓰는가'(필수) · '비슷한 것'(선택) · 'Placement'(필수), 3행 이하(2026-11-13 사람의 결정).
   principles:[[항목, 규칙]] 는 컴포넌트별 규칙 — 예제 뒤 · Spec 앞의 Rules 절. 8행을 넘으면 { 소제목: [[항목, 규칙]] } 으로 묶어 h3 로 그린다
   - html 은 라이브 프리뷰와 "HTML+CSS" 탭에 그대로 쓰이고, react 가 없으면 htmlToJsx 로 자동 변환됩니다.
   - 규칙: onclick 등 인라인 핸들러 · <script> · href="#/…" 금지(링크는 href="#"). 색은 var(--*) 토큰만.
   ========================================================= */
/* 탐색형 차트(Chart.js) 예제 — 같은 spec 으로 canvas(data-spec) 와 JS 탭을 만든다. 데이터는 React 예제(_react/examples/components/data-visual/*.tsx)와 같아야 한다.
   canvas 는 그래픽이라 role=img + aria-label(제목 · 요약)이 필수다(verify 가 검사) */
/* 표로 보기는 옵션(사람의 결정 2026-11-13 — 11-10 의 '늘 있음' 을 바꿈). { table: true } 일 때만 버튼을 그리고 .chart-view 틀은 늘 둔다 */
const chartCanvas = (kind, spec, label, opt = {}) => `<div class="chart-view">${opt.table ? `<div class="chart-tools"><button type="button" class="btn sm text assistive" data-chart-table>표로 보기</button></div>` : ""}<div class="chart-canvas"><canvas data-chart="${kind}" data-spec='${JSON.stringify(spec)}' role="img" aria-label="${label}"></canvas></div></div>`;
/* spec 을 사람이 읽을 모양으로 — 기본값 배열(라벨 · 숫자)은 한 줄, 객체는 들여쓰기 */
const pretty = (v, ind = "") => Array.isArray(v) ? (v.every((x) => typeof x !== "object" || x === null) ? JSON.stringify(v).replace(/,/g, ", ") : "[\n" + v.map((x) => ind + "  " + pretty(x, ind + "  ")).join(",\n") + "\n" + ind + "]")
  : v && typeof v === "object" ? "{\n" + Object.entries(v).map(([k, x]) => ind + "  " + k + ": " + pretty(x, ind + "  ")).join(",\n") + "\n" + ind + "}" : JSON.stringify(v);
const chartJs = (kind, spec, sel) => `// canvas[data-chart] + data-spec 은 ds-chart.js 가 DOMContentLoaded 때 자동으로 그립니다. 직접 그릴 때:
const handle = DSChart.mount(Chart, document.querySelector("${sel}"), DSChart.presets.${kind}(${pretty(spec)}));
// handle.chart(Chart.js 인스턴스) · handle.repaint() · handle.destroy() — 라이트/다크 · 제품 색 전환은 자동으로 다시 칠합니다`;
const CHART_DATA = {
  trend: {"labels":["10-21","10-22","10-23","10-24","10-25","10-26","10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03"],"series":[{"label":"Critical","tone":"critical","data":[12,18,9,14,22,17,11,8,15,19,24,13,10,16]},{"label":"High","tone":"high","data":[30,24,41,35,28,33,39,27,31,36,44,29,25,32]},{"label":"Medium","tone":"medium","data":[52,48,61,55,47,58,64,49,53,60,66,51,46,57]}],"stacked":true},
  /* 한 톤(2026-11-15) — 계열 하나인 추이는 선 아래를 옅게 칠한다. 값은 trend 세 계열의 합 */
  daily14: {"labels":["10-21","10-22","10-23","10-24","10-25","10-26","10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03"],"series":[{"label":"탐지","data":[94,90,111,104,97,108,114,84,99,115,134,93,81,105]}]},
  /* tone 없는 두 계열 → 한 톤의 1 · 4 단계(이번 주 진하게 · 지난 주 옅게) */
  weeks: {"labels":["랜섬웨어","악성코드","USB 위반","정책 위반","피싱"],"series":[{"label":"이번 주","data":[412,306,221,115,88]},{"label":"지난 주","data":[349,331,198,142,97]}]},
  depts: {"labels":["개발팀","영업팀","운영팀","재무팀","인사팀"],"series":[{"label":"Critical","tone":"critical","data":[42,18,25,9,6]},{"label":"High","tone":"high","data":[88,51,64,23,17]},{"label":"Medium","tone":"medium","data":[74,60,62,30,24]},{"label":"Low","tone":"low","data":[46,36,39,18,15]},{"label":"Info","tone":"info","data":[64,70,58,41,33]}],"stacked":true,"horizontal":true},
  weekday: {"labels":["월","화","수","목","금","토","일"],"series":[{"label":"차단","data":[182,204,196,221,268,94,71]}],"highlight":4},
  monthly: {"labels":["5월","6월","7월","8월","9월","10월"],"series":[{"label":"탐지","data":[2140,2385,2210,2560,2470,2920]}],"gradient":true},
  severity: {"series":[{"label":"Critical","tone":"critical","value":190},{"label":"High","tone":"high","value":285},{"label":"Medium","tone":"medium","value":196},{"label":"Low","tone":"low","value":120},{"label":"Info","tone":"info","value":263}],"center":"1,054","legend":"right"},
  /* tone 없는 조각 4개 → 한 톤 1~4 단계(spec 순서) */
  channels: {"series":[{"label":"엔드포인트","value":612},{"label":"메일","value":248},{"label":"네트워크","value":131},{"label":"USB","value":63}],"center":"1,054","legend":"right"},
  /* tone 없는 조각 6개 → 계열 색(자동) */
  os: {"series":[{"label":"Windows 11","value":642},{"label":"Windows 10","value":318},{"label":"macOS","value":156},{"label":"Ubuntu","value":88},{"label":"RHEL","value":51},{"label":"기타","value":29}],"center":"1,284","legend":"right"},
  patch: {"value":842,"max":1284,"label":"66%","caption":"패치 적용"},
  spark: {"label":"신규 위협","data":[62,70,58,81,77,96,88,104,93,112]},
  daily: {"labels":["10-28","10-29","10-30","10-31","11-01","11-02","11-03"],"bars":[{"label":"탐지","data":[412,380,455,402,390,470,431]}],"lines":[{"label":"차단","tone":"series-1-strong","data":[398,372,440,391,377,462,420]}]},
};
/* 차트 카드 머리(2026-11-15) — 제목 · 보조 글자 · 동작, 높이 32 고정 */
const chartHead = (title, sub = "", action = "") => `<div class="chart-head"><h3 class="chart-title">${title}</h3>${sub ? `<span class="chart-sub">${sub}</span>` : ""}${action ? `<div class="chart-action">${action}</div>` : ""}</div>`;
/* 증감 배지 — 색은 의미(bad · good · 없음 = 중립), 방향은 화살표 + 숨긴 글자(방향 클래스는 없다 — 옛 .up · .down 은 색을 뜻했다) */
const delta = (dir, tone, text) => `<span class="delta${tone ? " " + tone : ""}">${I(dir === "up" ? "arrow-up" : "arrow-down", 12)}<span class="sr-only">${dir === "up" ? "증가" : "감소"}</span>${text}</span>`;
/* KPI 안 탐색형 스파크 — .kpi > .chart-canvas.spark > canvas(표로 보기 틀 없음) */
const sparkCanvas = (spec, label) => `<div class="chart-canvas spark"><canvas data-chart="spark" data-spec='${JSON.stringify(spec)}' role="img" aria-label="${label}"></canvas></div>`;
/* 진행 막대 목록의 한 줄 — 측정값이라 role=meter */
const meter = (id, label, value, max, unit = "") => { const pct = Math.round(value / max * 1000) / 10, fmt = (n) => n.toLocaleString("en-US"); return `<div class="progress-row"><div class="row"><span id="${id}">${label}</span><span><b>${fmt(value)}</b><span class="target">/ ${fmt(max)}${unit}</span></span></div><div class="progress" role="meter" aria-labelledby="${id}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${fmt(value)}${unit} / ${fmt(max)}${unit}, ${Math.round(pct)}%"><i style="width:${pct}%"></i></div></div>`; };

/* 아이콘: icons.gen.js 의 I(name, size, {style}) — assets/icons 의 Tabler 아이콘을 빌드 시 인라인 */
const popX = () => `<button type="button" class="btn sm text assistive icon-only popup-close" aria-label="닫기" data-popup-close>${I("x")}</button>`;
const spHead = (id, title) => `<div class="side-panel-header"><h3 class="side-panel-title" id="${id}">${title}</h3><button type="button" class="btn sm text assistive icon-only side-panel-close" aria-label="닫기" data-panel-close>${I("x")}</button></div>`;
const spFacts = (rows) => `<table class="tbl kv"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("")}</tbody></table>`;
const SP_EVENT = [["시각", "2026. 09. 07 14:22:05"], ["호스트", "DESKTOP-7F3K"], ["IP", "10.0.0.12"], ["정책", "외부 USB 차단"], ["처리", "차단"]];
const cb = (label, attrs = "", small = "") => `<label class="checkbox"><input type="checkbox"${attrs ? " " + attrs : ""}><span>${label}${small ? `<small>${small}</small>` : ""}</span></label>`;

/* 정적 달력 — ds.js 가 그리는 마크업과 같다(behave 가 대조한다). 정적 데모도 클릭 · 키보드 · 달 이동이 그대로 동작한다.
   React Calendar 도 같은 골격이다(site-consistency). 표기는 Intl(locale, 기본 ko-KR) — ds.js · React 와 같은 식.
   opts: month "YYYY-MM", mode("range" 면 두 달 — calendars:1 로 한 달, 767px 이하에서는 ds.js 가 한 달로 다시 그림), value | start · end, today, min, max, footer, presets, locale,
   labels(Intl 이 만들지 못하는 문구 — ds.js data-labels 와 같은 키 · 기본값) */
const CAL_LABELS = { dialog: "날짜 선택", reset: "초기화", cancel: "취소", apply: "적용", prevMonth: "이전 달", nextMonth: "다음 달", chooseYear: "연도 선택", recent: "최근 {n}일" };
const cal = (o) => {
  const pad = (n) => String(n).padStart(2, "0"), fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const loc = o.locale || "ko-KR", F = (opt) => new Intl.DateTimeFormat(loc, opt), titleF = F({ year: "numeric", month: "long" }), full = F({ dateStyle: "full" });
  const DOW = Array.from({ length: 7 }, (_, i) => { const d = new Date(2024, 0, 7 + i); return [F({ weekday: "narrow" }).format(d), F({ weekday: "long" }).format(d)]; });   // 2024-01-07 은 일요일
  const rg = o.mode === "range", two = rg && o.calendars !== 1, [y, m] = o.month.split("-").map(Number);
  const a = o.value || o.start, b = o.end, out = (k) => (o.min && k < o.min) || (o.max && k > o.max);
  const list = (o.footer || "").split(/\s+/).filter(Boolean), presets = (o.presets || "").split(/\s+/).filter(Boolean);
  const months = (two ? [0, 1] : [0]).map((i) => { const mo = m - 1 + i, off = new Date(y, mo, 1).getDay(), rows = Math.ceil((off + new Date(y, mo + 1, 0).getDate()) / 7); return { first: new Date(y, mo, 1), rows, days: Array.from({ length: rows * 7 }, (_, j) => new Date(y, mo, j - off + 1)) }; });
  /* roving tabindex — ds.js renderMarks 와 같은 순서: 선택 · 오늘 · 고를 수 있는 첫 칸 */
  const live = months.flatMap((M) => M.days.filter((d) => d.getMonth() === M.first.getMonth()).map(fmt));
  const target = live.find((k) => k === a || k === b) || live.find((k) => k === o.today) || live.find((k) => !out(k)) || live[0];
  const cell = (d, M) => {
    const k = fmt(d), muted = d.getMonth() !== M.first.getMonth();
    if (two && muted) return `<span class="day blank" role="gridcell"></span>`;   // 두 달 보기에서 다른 달 칸은 비운다
    const on = !muted && (k === a || k === b), mid = !muted && b && k > a && k < b, today = k === o.today;
    const cls = ["day", muted && "muted", on && "on", on && b && k === a && "start", on && b && k === b && "end", mid && "in-range", today && "today"].filter(Boolean).join(" ");
    return `<button type="button" class="${cls}" role="gridcell" data-date="${k}" aria-label="${full.format(d)}" tabindex="${k === target && !muted ? 0 : -1}"${out(k) ? ' aria-disabled="true"' : ""}${on || mid ? ' aria-selected="true"' : ""}${today ? ' aria-current="date"' : ""}>${d.getDate()}</button>`;
  };
  const nav = (d) => `<button type="button" class="cal-nav" data-nav="${d}" aria-label="${d < 0 ? L.prevMonth : L.nextMonth}">${I(d < 0 ? "chevron-left" : "chevron-right", 16)}</button>`, gap = `<span class="cal-nav-gap"></span>`;
  const month = (M, i) => {
    const t = titleF.format(M.first), weeks = Array.from({ length: M.rows }, (_, r) => `<div class="cal-week" role="row">${M.days.slice(r * 7, r * 7 + 7).map((d) => cell(d, M)).join("")}</div>`).join("\n    ");
    const head = `<div class="cal-head">${two && i ? gap : nav(-1)}<button type="button" class="cal-title" aria-label="${t}, ${L.chooseYear}">${t}</button>${two && !i ? gap : nav(1)}</div>`;
    const grid = `<div class="cal-grid" role="grid" aria-label="${t}"${rg ? ' aria-multiselectable="true"' : ""}>
    <div class="cal-week" role="row">${DOW.map(([n, l]) => `<span class="dow" role="columnheader" aria-label="${l}">${n}</span>`).join("")}</div>
    ${weeks}
  </div>`;
    return two ? `<div class="cal-month">${head}${grid}</div>` : `${head}\n  ${grid}`;
  };
  let todayLabel = "오늘"; try { const s = new Intl.RelativeTimeFormat(loc, { numeric: "auto" }).format(0, "day"); todayLabel = s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { /* 오래된 엔진 */ }
  const L = { ...CAL_LABELS, today: todayLabel, ...(o.labels || {}) };
  const btn = (cls, attr, label) => `<button type="button" class="btn sm ${cls}" ${attr}${attr === 'data-cal="apply"' ? " disabled" : ""}>${label}</button>`;   // 적용은 값이 바뀌어야 켜진다 — 정적 달력은 처음 값 그대로라 꺼져 있다
  const footBtns = [...presets.map((n) => btn("text", `data-preset="${n}"`, L.recent.replace("{n}", n))), ...[["today", "text", L.today], ["reset", "text", L.reset], ["cancel", "outline assistive", L.cancel], ["apply", "solid primary", L.apply]].filter(([k]) => list.includes(k) && (k !== "today" || !rg)).map(([k, c, l]) => btn(c, `data-cal="${k}"`, l))];
  const grp = (a) => a.length > 1 ? `<div class="btn-group">${a.join("")}</div>` : a.join("");   // 나란한 버튼 2개 이상은 묶음(사람의 요청 2026-11-18)
  const foot = grp(footBtns.filter((h) => / text"/.test(h))) + grp(footBtns.filter((h) => !/ text"/.test(h)));
  const data = [rg && "data-range", rg && o.calendars === 1 && 'data-calendars="1"', rg ? `data-start="${a}" data-end="${b}"` : a ? `data-value="${a}"` : "", `data-month="${o.month}"`, o.locale && `data-locale="${o.locale}"`, o.labels && `data-labels='${JSON.stringify(o.labels).replace(/'/g, "&#39;")}'`, o.today && `data-today="${o.today}"`, o.min && `data-min="${o.min}"`, o.max && `data-max="${o.max}"`, `data-footer="${o.footer || "none"}"`, presets.length && `data-presets="${o.presets}"`].filter(Boolean).join(" ");
  return `<div class="calendar${two ? " two" : ""}"${/^ko\b/i.test(loc) ? "" : ` lang="${loc}"`} role="group" aria-label="${L.dialog}" ${data}>
  ${two ? `<div class="cal-months">${months.map(month).join("")}</div>` : month(months[0], 0)}${foot ? `\n  <div class="cal-foot">${foot}</div>` : ""}
  <span class="sr-only" aria-live="polite"></span>
</div>`;
};
/* Number Input 의 증감 버튼 */
const EXP_ROWS = [
  ["lg1", "09:41:12.031", "critical", "CRIT", "10.0.4.21", "process.create blocked: rundll32.exe → cryptor.dll", "open"],
  ["lg2", "09:41:11.870", "medium", "WARN", "10.0.4.21", "usb.attach vendor=0x0781 product=0x5583", "loading"],
  ["lg3", "09:41:09.114", "info", "INFO", "10.0.0.3", "policy.sync ok (rev 2041)", ""],
];
const expBtn = (id, t, open) => `<button type="button" class="expand-btn" aria-expanded="${open ? "true" : "false"}" aria-controls="${id}-d" aria-label="${t} 로그 상세">${I("chevron-right",16)}</button>`;
const expDetail = (id, t, ip, m, st) => `<tr class="row-detail" id="${id}-d"${st ? "" : " hidden"}><td colspan="5"><div class="row-detail-body">${st === "loading" ? `<div class="spinner-wrap" role="status"><span class="spinner sm"></span>상세 불러오는 중…</div>` : `<dl class="detail-meta"><dt>탐지 정책</dt><dd>랜섬웨어 행위 차단</dd><dt>사용자</dt><dd>corp\\kim</dd><dt>상위 프로세스</dt><dd>winword.exe</dd></dl>
        <div class="code-view wrap"><div class="head"><span class="title">${t} 원본 로그</span>${copyBtn(t + " 원본 로그")}</div><pre tabindex="0" aria-label="${t} 원본 로그"><code>${t} ${ip} CRIT ${m} parent=winword.exe user=corp\\kim sha256=9f2c41d07be3a8f6e1c2d4b5a6978e0f1d2c3b4a5968778695a4b3c2d1e0f9a8</code></pre></div>`}</div></td></tr>`;
const numBtns = (name, downOff, upOff) => `<button type="button" class="num-btn down" tabindex="-1" aria-label="${name} 줄이기"${downOff ? " disabled" : ""}>${I("minus",16)}</button><button type="button" class="num-btn up" tabindex="-1" aria-label="${name} 늘리기"${upOff ? " disabled" : ""}>${I("plus",16)}</button>`;

/* Code · Copy Field 의 복사 버튼 — 이름에 값의 이름을 넣는다 */
const copyBtn = (name, iconOnly) => `<button type="button" class="btn sm text assistive${iconOnly ? " icon-only" : ""} copy" aria-label="${name} 복사"><span class="ico">${I("copy",16)}</span>${iconOnly ? "" : '<span class="t">복사</span>'}</button>`;

/* Time Picker 필드 — Text Field 셸(.field + .affix) 위 입력 하나와 시계 버튼. 열 목록은 ds.js 가 열 때 host 끝에 그린다(2026-11-13).
   opts: id, label, value, help, sec, step, min, max, cls(sm · lg · error), req, off, live(폼 안 도움말 aria-live), style */
const tpField = (o) => {
  const attrs = [o.sec && "data-seconds", o.step && `data-step="${o.step}"`, o.min && `data-min="${o.min}"`, o.max && `data-max="${o.max}"`].filter(Boolean).join(" ");
  const bad = /error/.test(o.cls || ""), help = o.help !== undefined;
  return `<div class="field timepicker${o.cls ? " " + o.cls : ""}"${attrs ? " " + attrs : ""}${o.style ? ` style="${o.style}"` : ""}><label for="${o.id}">${o.label}${o.req ? " <em>*</em>" : ""}</label><div class="affix"><input id="${o.id}" type="text" inputmode="numeric" autocomplete="off" placeholder="${o.sec ? "HH:mm:ss" : "HH:mm"}"${o.value ? ` value="${o.value}"` : ""}${o.req ? " required" : ""}${bad ? ' aria-invalid="true"' : ""}${help ? ` aria-describedby="${o.id}-help"` : ""}${o.off ? " disabled" : ""}><button type="button" class="tp-btn" aria-label="${o.label} 선택" aria-haspopup="dialog" aria-expanded="false"${o.off ? " disabled" : ""}>${I("clock")}</button></div>${help ? `<span class="help" id="${o.id}-help"${o.live ? ' aria-live="polite"' : ""}>${o.help}</span>` : ""}</div>`;
};

/* Text Field Code — 인증 코드 칸(2026-11-17). o: id, label, length(6), value, name, req(data-required), mark(라벨의 *), help, messages{}, cls(error · 등), disabled, live(검증 폼 — 빈 도움말 칸에도 aria-live)
   칸 n개 + 값을 담는 hidden. 첫 칸만 one-time-code(문자 자동 채우기). 칸에 maxlength 를 두지 않는다 — 자동 채우기가 첫 칸에 코드 전체를 넣으면 ds.js 가 나눠 담는다. React CodeInput 과 같아야 한다 */
const codeField = (o) => {
  const n = o.length || 6, v = (o.value || "").split(""), rove = Math.min(v.length, n - 1), bad = /error/.test(o.cls || ""), help = o.help !== undefined || o.live;
  const msgs = o.messages ? ` data-messages='${JSON.stringify(o.messages)}'` : "";
  const cells = Array.from({ length: n }, (_, i) => `<input${i ? "" : ` id="${o.id}-1"`} class="code-cell" type="text" inputmode="numeric" autocomplete="${i ? "off" : "one-time-code"}" aria-label="${n}자리 중 ${i + 1}번째"${i === rove ? "" : ' tabindex="-1"'}${v[i] ? ` value="${v[i]}"` : ""}${bad ? ' aria-invalid="true"' : ""}${o.disabled ? " disabled" : ""}>`).join("");
  return `<div class="field code-field${o.cls ? " " + o.cls : ""}"><label id="${o.id}-l" for="${o.id}-1">${o.label}${o.mark ? " <em>*</em>" : ""}</label><div class="code-inputs" role="group" aria-labelledby="${o.id}-l"${help ? ` aria-describedby="${o.id}-help"` : ""}${o.name ? ` data-name="${o.name}"` : ""}${o.req ? " data-required" : ""}${msgs}>${o.name ? `<input type="hidden" name="${o.name}" value="${o.value || ""}">` : ""}${cells}</div>${help ? `<span class="help" id="${o.id}-help" aria-live="polite">${o.help || ""}</span>` : ""}</div>`;
};

/* Tree 마크업(2026-11-14) — items: {label, value, icon, meta, children, open, selected, checked, disabled, lazy}. 상위의 aria-checked 는 하위에서 계산한다(빌드가 검사하는 규칙과 같게).
   o: id(라벨 id 접두), label(트리 이름), checkable, attrs */
const treeState = (it) => it.children ? (() => { const k = it.children.map(treeState); return k.every((x) => x === "true") ? "true" : k.every((x) => x === "false") ? "false" : "mixed"; })() : String(!!it.checked);
const treeItems = (items, o, lv, path) => items.map((it, n) => {
  const id = `${o.id}-${path}${n}`, par = !!(it.children || it.lazy), st = o.checkable ? treeState(it) : null;
  const a = [`aria-level="${lv}"`, `tabindex="${it.focus ? 0 : -1}"`, par && `aria-expanded="${it.open ? "true" : "false"}"`, par && `aria-labelledby="${id}"`, it.lazy && "data-lazy", it.selected && `aria-selected="true"`, st && `aria-checked="${st}"`, it.disabled && `aria-disabled="true"`, it.value && `data-value="${it.value}"`, it.demoFail && "data-demo-fail"].filter(Boolean).join(" ");
  return `<li class="tree-item" role="treeitem" ${a}><div class="tree-row"><span class="tree-toggle" aria-hidden="true">${par ? I("chevron-right", 16) : ""}</span>${o.checkable ? `<span class="tree-check" aria-hidden="true"></span>` : ""}${it.icon ? I(it.icon, 16) : ""}<span class="tree-label"${par ? ` id="${id}"` : ""}>${it.label}</span>${it.meta != null ? `<span class="tree-meta">${it.meta}</span>` : ""}</div>${it.children ? `<ul class="tree-group" role="group"${it.open ? "" : " hidden"}>${treeItems(it.children, o, lv + 1, `${path}${n}-`)}</ul>` : ""}</li>`;
}).join("");
const treeHtml = (items, o) => {
  const first = (function f(xs) { for (const x of xs) { if (x.selected) return x; if (x.open && x.children) { const y = f(x.children); if (y) return y; } } return null; })(items) || items[0];
  first.focus = true;
  return `<ul class="tree${o.checkable ? " checkable" : ""}" role="tree" aria-label="${o.label}"${o.checkable ? ` aria-multiselectable="true"` : ""}${o.attrs ? " " + o.attrs : ""}>${treeItems(items, o, 1, "")}</ul>`;
};
const TREE_ORG = () => [
  { label: "본사", icon: "building", meta: 128, open: true, children: [
    { label: "보안팀", icon: "users", meta: 24, open: true, children: [{ label: "관제 파트", icon: "users", meta: 12, selected: true }, { label: "대응 파트", icon: "users", meta: 12 }] },
    { label: "개발팀", icon: "users", meta: 56, children: [{ label: "플랫폼 파트", icon: "users", meta: 30 }, { label: "앱 파트", icon: "users", meta: 26 }] },
    { label: "경영지원팀", icon: "users", meta: 48 },
  ] },
  { label: "부산 지사", icon: "building", meta: 31, children: [{ label: "영업팀", icon: "users", meta: 19 }, { label: "기술지원팀", icon: "users", meta: 12 }] },
];

/* Notification Center 마크업(2026-11-14) — groups: [{label, items:[{id, title, sub, time, datetime, severity, href, unread}]}].
   ds.js 의 nfItemHtml 과 같은 구조여야 한다(behave 가 정적 항목과 새로 넣은 항목을 같이 잰다). o: id, open, more, attrs */
const NF_SEV = { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" };
const notifyItem = (it) => {
  const inner = `<span class="notify-dot" aria-hidden="true"></span><span class="notify-main"><span class="notify-text">${it.severity ? `<span class="tag sm ${it.severity}">${NF_SEV[it.severity]}</span>` : ""}${it.title}</span>${it.sub ? `<span class="notify-sub">${it.sub}</span>` : ""}</span><time class="notify-time" datetime="${it.datetime}">${it.time}</time><span class="sr-only">${it.unread ? ", 안 읽음" : ""}</span>`;
  return `<li class="notify-item${it.unread ? " unread" : ""}" data-id="${it.id}">${it.href ? `<a class="notify-link" href="${it.href}">${inner}</a>` : `<button type="button" class="notify-link">${inner}</button>`}</li>`;
};
/* Top Navigation 오른쪽 조각(2026-11-18) — 아이콘 버튼은 md 40, 알림은 점이 기본, 설정 바로 옆 라이트/다크 */
const tbIcon = (icon, name) => `<span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" aria-label="${name}">${I(icon)}</button><span class="tooltip bottom" role="tooltip">${name}</span></span>`;
const tbBell = (name = "알림 3건") => `<span class="with-count">${tbIcon("bell", name)}<span class="count dot" aria-hidden="true"></span></span>`;
const tbTheme = () => `<span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" data-theme-toggle aria-pressed="false" aria-label="다크 모드"><span class="i-light">${I("sun-high")}</span><span class="i-dark">${I("moon")}</span></button><span class="tooltip bottom" role="tooltip">다크 모드</span></span>`;
const tbStart = (navId, name = "Security Console") => `<div class="topbar-start"><a href="#" class="logo"><i>${I("shield-check",24,{style:"filled"})}</i>${name}</a><span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" data-sidenav-toggle aria-controls="${navId}" aria-expanded="true" aria-label="메뉴 접기">${I("layout-sidebar")}</button><span class="tooltip bottom" role="tooltip">메뉴 접기</span></span></div>`;
const notifyHtml = (groups, o) => {
  const items = groups.flatMap((g) => g.items), n = items.filter((it) => it.unread).length, name = n ? `알림 ${n}건` : "알림";
  const body = groups.length
    ? groups.map((g) => `<section class="notify-group" aria-label="${g.label}"><h3 class="notify-day">${g.label}</h3><ul class="notify-list">${g.items.map(notifyItem).join("")}</ul></section>`).join("") + `<p class="notify-empty" hidden>알림이 없습니다.</p>`
    : `<p class="notify-empty">알림이 없습니다.</p>`;
  const num = o.count === "number", badge = !n ? "" : num ? `<span class="count" aria-hidden="true">${n > 99 ? "99+" : n}</span>` : `<span class="count dot" aria-hidden="true"></span>`;   // 벨은 점이 기본, 숫자는 data-count="number"(2026-11-18)
  return `<div class="notify"${num ? ' data-count="number"' : ""}${o.attrs ? " " + o.attrs : ""}${o.hostId ? ` id="${o.hostId}"` : ""}>
            <span class="with-count"><span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" aria-label="${name}" aria-haspopup="dialog" aria-expanded="${o.open ? "true" : "false"}" aria-controls="${o.id}">${I("bell")}</button><span class="tooltip bottom" role="tooltip">${name}</span></span>${badge}</span>
            <section class="notify-panel" id="${o.id}" role="dialog" aria-labelledby="${o.id}-t" tabindex="-1"${o.open ? "" : " hidden"}>
              <div class="notify-head"><h2 class="notify-title" id="${o.id}-t">알림</h2><button type="button" class="btn sm text assistive notify-read-all"${n ? "" : ' aria-disabled="true"'}>모두 읽음</button></div>
              <div class="tabs sm" role="tablist" aria-label="알림 보기"><button type="button" class="tab on" role="tab" aria-selected="true" data-filter="all">전체</button><button type="button" class="tab" role="tab" aria-selected="false" tabindex="-1" data-filter="unread">안 읽음${n ? ` <span class="count">${n}</span>` : ""}</button></div>
              <div class="tab-panel notify-body" role="tabpanel" data-static>${body}${o.more ? `<div class="notify-more"><button type="button" class="btn sm outline assistive">이전 알림 보기</button></div>` : ""}</div>
            </section>
          </div>`;
};
const NF_GROUPS = () => [
  { label: "오늘", items: [
    { id: "n1", severity: "critical", title: "랜섬웨어 의심 행위를 차단했습니다", sub: "PC-2041 · 김보안", time: "10분 전", datetime: "2026-11-14T09:40", href: "#ev-2041", unread: true },
    { id: "n2", severity: "high", title: "승인되지 않은 원격 접속을 막았습니다", sub: "SRV-DB-01 · 198.51.100.7", time: "32분 전", datetime: "2026-11-14T09:18", href: "#ev-2040", unread: true },
    { id: "n3", title: "보안 정책 '외부 저장장치 차단'이 배포되었습니다", sub: "영업팀 외 3개 그룹", time: "1시간 전", datetime: "2026-11-14T08:50", href: "#policy-12", unread: true },
  ] },
  { label: "어제", items: [
    { id: "n4", severity: "medium", title: "에이전트 12대가 24시간 동안 응답하지 않습니다", sub: "부산 지사", time: "어제 18:20", datetime: "2026-11-13T18:20", href: "#agents-offline" },
    { id: "n5", title: "라이선스가 30일 뒤 만료됩니다", time: "어제 09:00", datetime: "2026-11-13T09:00", unread: true },
  ] },
];

/* Date Picker 필드 — Text Field 셸(.field + .affix) 위 입력 하나와 달력 버튼. 입력 형식은 단위마다 고정(YYYY. MM. DD · YYYY. MM · YYYY), locale 과 무관(사람의 결정 2026-11-09).
   opts: id, label, value, help, attrs(data-* 문자열), cls(sm · lg · error), unit, range, invalid, disabled, readonly */
const dpField = (o) => {
  const one = (o.unit === "year" ? "YYYY" : o.unit === "month" ? "YYYY. MM" : "YYYY. MM. DD") + (o.time ? (o.time === "seconds" ? " HH:mm:ss" : " HH:mm") : ""), ph = o.range ? `${one} ~ ${one}` : one, off = o.disabled || o.readonly;
  const attrs = [o.unit && o.unit !== "day" && `data-unit="${o.unit}"`, o.range && "data-range", o.time && (o.time === "seconds" ? 'data-time="seconds"' : "data-time"), o.attrs].filter(Boolean).join(" ");
  return `<div class="datepicker field${o.cls ? " " + o.cls : ""}"${attrs ? " " + attrs : ""}><label for="${o.id}">${o.label}</label><div class="affix"><input id="${o.id}"${o.value ? ` value="${o.value}"` : ""} placeholder="${ph}" inputmode="numeric" autocomplete="off"${o.help ? ` aria-describedby="${o.id}-help"` : ""}${o.invalid ? ' aria-invalid="true"' : ""}${o.readonly ? " readonly" : ""}${o.disabled ? " disabled" : ""}><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false"${off ? " disabled" : ""}>${I("calendar")}</button></div>${o.help ? `<span class="help" id="${o.id}-help">${o.help}</span>` : ""}</div>`;
};

/* Select · Combobox 예제 재료 — 메뉴 안 상태 줄은 두 컴포넌트가 같다 */
const MENU_STATE = {
  loading: `<li class="menu-state" role="presentation"><span class="spinner sm" aria-hidden="true"></span>불러오는 중입니다.</li>`,
  error: `<li class="menu-state" role="presentation">목록을 불러오지 못했습니다.<button type="button" class="btn sm text" data-retry>다시 시도</button></li>`,
  empty: `<li class="menu-state" role="presentation">선택할 수 있는 항목이 없습니다.</li>`,
};
const CB_DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "디자인팀", "QA팀", "고객지원팀", "재무팀", "인사팀", "법무팀"];
const CB_LIVE = `<span class="sr-only" role="status"></span>`;
const cbChip = (l) => `<span class="chip sm" data-value="${l}"><span class="lbl">${l}</span><button type="button" class="x" aria-label="${l} 제거">${I("x", 10)}</button></span>`;
/* 여러 개면 칩과 입력칸을 .control-track 에 — 가로 스크롤(기본)이 셰브론 자리 안쪽에서 잘리게(2026-11-23) */
const cbCtl = ({ id, label, placeholder, value = "", chips = "", expanded = false, disabled = false, field = false, multi = false }) => { const inp = `<input type="text" id="${id}" role="combobox" aria-autocomplete="list" aria-expanded="${expanded}" aria-controls="${id}-list" autocomplete="off" placeholder="${placeholder}"${value ? ` value="${value}"` : ""}${field ? "" : ` aria-label="${label}"`}${disabled ? " disabled" : ""}>`; return `<div class="control">${multi ? `<div class="control-track">${chips}${inp}</div>` : inp}</div>`; };
const LOG_SAMPLE = [
  ["09:41:12.031","critical","CRIT","10.0.4.21","process.create blocked: rundll32.exe → cryptor.dll (parent=winword.exe, user=corp\\kim, sha256=9f2c…)"],
  ["09:41:11.870","medium","WARN","10.0.4.21","usb.attach vendor=0x0781 product=0x5583"],
  ["09:41:09.114","info","INFO","10.0.0.3","policy.sync ok (rev 2041)"],
  ["09:41:08.552","info","INFO","10.0.0.3","agent.checkin 1284/1284"],
  ["09:41:05.207","high","HIGH","10.0.4.33","network.block dst=185.220.101.4:443"],
  ["09:41:03.118","info","INFO","10.0.0.3","policy.sync ok (rev 2040)"],
  ["09:41:01.640","low","LOW","10.0.4.12","agent.update 3.8.1 → 3.8.2"],
  ["09:40:58.902","medium","WARN","10.0.4.33","usb.attach vendor=0x13fe product=0x4200"],
];
const cbMenu = (label, inner, id, multi) => `<ul class="menu" role="listbox" id="${id}-list" aria-label="${label}"${multi ? ' aria-multiselectable="true"' : ""}>${inner}</ul>`;
const MARK_CHECK = `<span class="menu-mark check" aria-hidden="true"></span>`, MARK_RADIO = `<span class="menu-mark round" aria-hidden="true"></span>`;
const cbAllOpt = (on, label) => { const all = CB_DEPTS.every((l) => on.includes(l)); return `<li class="menu-item${all ? " on" : ""}" role="option" data-all aria-selected="${all}">${MARK_CHECK}${label}</li>`; };
const cbOpts = (on, multi, all) => (multi && all ? cbAllOpt(on, all) : "") + CB_DEPTS.map((l) => `<li class="menu-item${on.includes(l) ? " on" : ""}" role="option" data-value="${l}" aria-selected="${on.includes(l)}">${multi ? MARK_CHECK : ""}${l}</li>`).join("");
const cbBox = ({ id, name, placeholder, multi = false, on = [], field = "", required = false, overflow = "", all = "" }) => `<div class="combobox"${multi ? " data-multiple" : ""}${overflow ? ` data-overflow="${overflow}"` : ""}${field ? ` data-name="${field}"` : ""}${required ? " data-required" : ""}>${cbCtl({ id, label: name, placeholder, chips: multi ? on.map(cbChip).join("") : "", value: multi ? "" : on[0], field: true, multi })}${cbMenu(name, cbOpts(on, multi, all), id, multi)}${CB_LIVE}${field && !multi ? `<input type="hidden" name="${field}" value="">` : ""}</div>`;
const selItems = (labels) => labels.map(([l, v]) => `<li class="menu-item" role="option"${v === undefined ? "" : ` data-value="${v}"`}>${l}</li>`).join("");
const selOpen = (label, state) => `<div class="dropdown open"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="true"><span class="placeholder">그룹 선택</span></button><ul class="menu" role="listbox" aria-label="${label}">${state}</ul></div>`;

/* Steps 마법사(2026-11-13) — 정적 단계 · 패널 · 이전/다음/완료. 정적 HTML 은 ds.js 가 처음 그릴 때와 같은 모양이다(구조 비교가 React 와 맞춘다) */
const STEP_L = ["기본 정보", "적용 대상", "규칙 설정", "검토 · 배포"];
const stepLi = (label, i, st, { btn = false, inner = "" } = {}) => {
  const body = `<i>${st === "done" ? I("check", 16) : i + 1}</i><span class="label">${label}</span>${st === "done" ? '<span class="sr-only"> (완료)</span>' : ""}`;
  return `<li${st === "done" ? ' class="done"' : st === "on" ? ' class="on" aria-current="step"' : ""}>${btn ? `<button type="button" class="step-btn">${body}</button>` : body}${inner}</li>`;
};
const stepsOl = (cls, items) => `<ol class="steps${cls ? " " + cls : ""}" aria-label="진행 단계">${items.join("")}</ol>`;
const stepPanel = (on, inner) => `<div class="step-panel" tabindex="-1"${on ? "" : " hidden"}>${inner}</div>`;
const stepActs = (first, last, finish = "완료") => `<div class="step-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-step="prev"${first ? " disabled" : ""}>이전</button><button type="button" class="btn md solid primary" data-step="next"${last ? " hidden" : ""}>다음</button><button type="button" class="btn md solid primary" data-step="finish"${last ? "" : " hidden"}>${finish}</button></div></div>`;
const stepForm = (id, label, help, value = "") => `<form class="form" data-validate novalidate><p class="form-legend"><em>*</em> 필수 항목</p><div class="field"><label for="${id}">${label} <em>*</em></label><input id="${id}"${value ? ` value="${value}"` : ""} required><span class="help" aria-live="polite">${help}</span></div></form>`;
const stepNote = (t) => `<p class="t-body-2-reading">${t}</p>`;
const COMPONENTS = {
  /* ------------------------------------------------ Button */
  "button": {
    status: "ready", react: ["Button","ButtonGroup"], css: [".btn", ".btn-group"], borrows: [".tooltip-wrap", ".tooltip"],
    desc: "사용자의 의도를 명확하게 전달하고 행동을 유도합니다.",
    choose: [
      ["언제 쓰는가", "다른 화면으로 가면 링크를, 지금 화면에서 일어나는 동작이면 버튼을 씁니다. 새 탭 열기와 주소 복사가 되어야 하면 링크입니다. 버튼 모양이 필요한 링크는 링크 요소에 버튼 모양을 입혀 만듭니다."],
      ["Placement", "수평은 주 행동이 오른쪽 · 수직은 주 행동이 위 · Lv.4 는 카드 · 폼 · 대화상자당 하나"],
    ],
    principles: [
      ["비활성", "폼 제출 버튼은 끄지 않고 누르면 검증해 안내합니다. 권한 · 상태 때문에 할 수 없는 동작은 끄고 이유를 화면에 적습니다. 끈 버튼에 Tooltip 을 달지 않습니다"],
      ["주 버튼", "카드 · 폼 · 대화상자마다 Solid Primary 는 하나입니다"],
      ["삭제와 Negative", "표 · 카드 · 상세 화면의 삭제 버튼은 Assistive 입니다. Negative 는 되돌릴 수 없는 일을 확정하는 위험 확인 팝업의 버튼에만 씁니다. 화면 곳곳의 삭제가 빨강이면 위험 신호가 흐려지고, 빨강 제품에서는 주 버튼과도 헷갈립니다"],
      ["버튼 묶음", "버튼이 두 개 이상 나란히 놓이면 늘 한 묶음으로 감쌉니다. 버튼 사이 간격은 버튼 크기를 따라 작은 버튼일수록 좁아집니다. 왼쪽 끝의 삭제처럼 떨어져 놓이는 버튼은 묶음 밖에 둡니다. 가로로 놓으면 주 행동을 오른쪽 끝에 둡니다."],
      ["아이콘 전용", "화면 · 표 · 카드 · 목록의 아이콘 전용 버튼은 접근 이름과 같은 글을 Tooltip 으로 보입니다. 필드 · 칩 · 파일 줄 · 대화상자에 붙은 닫기 · 복사 · 보기 · 지우기 버튼은 자리가 뜻을 알려 Tooltip 을 두지 않습니다. 끈 버튼에는 Tooltip 을 두지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "Primary Solid 가 기본입니다. 화면에서 가장 중요한 행동 하나에만 씁니다.", html: `<button type="button" class="btn md solid primary">정책 저장</button>` },
      { id: "variant", group: "variant", title: "Variant · Color", desc: "형태는 <b>Solid</b> 와 <b>Outline</b> 두 가지, 색은 <b>Primary</b> · <b>Assistive</b> · <b>Negative</b> 세 가지입니다. 기본 색은 Primary 이고, 고른 제품 색을 따르므로 빨강 제품이면 빨강입니다. Negative 는 위험 · 경고성 행동에만 씁니다. Negative 는 빨강이고, 위험 확인 팝업에서 되돌릴 수 없는 일을 확정하는 버튼에만 씁니다. 화면의 삭제 버튼은 Assistive 입니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary">Primary</button>
          <button type="button" class="btn md solid assistive">Assistive</button>
          <button type="button" class="btn md solid negative">Negative</button>
          <button type="button" class="btn md outline primary">Primary</button>
          <button type="button" class="btn md outline assistive">Assistive</button>
          <button type="button" class="btn md outline negative">Negative</button>
        </div>` },
      { id: "priority", group: "variant", title: "Priority", desc: "<b>Lv.4 Primary Solid</b> — 화면에서 가장 중요한 메인 행동을 유도 · 제안합니다. <b>Lv.3 Primary Outline</b> — 미리보기 · 임시 저장처럼 대체 행동을 제안합니다. <b>Lv.2 Assistive Solid</b> — 토글 버튼을 보조합니다. <b>Lv.1 Assistive Outline</b> — 닫기 · 취소 같은 보조 행동을 제시합니다. 위험 확인 팝업에서 <b>되돌릴 수 없는 일을 확정</b>하는 버튼에는 우선순위와 별개로 Negative 를 씁니다. 화면의 삭제 버튼은 Assistive 입니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary">정책 저장</button>
          <button type="button" class="btn md outline primary">미리보기</button>
          <button type="button" class="btn md solid assistive">필터</button>
          <button type="button" class="btn md outline assistive">취소</button>
          <button type="button" class="btn md solid negative">정책 삭제</button>
        </div>` },
      { id: "size", group: "size", title: "Size", desc: "<b>높이는 고정</b>하고 너비는 라벨에 맞춰 자유롭게 씁니다. 테이블 · 툴바 · 배너 안에서는 Small 을, 폼 하단과 빈 화면에서는 Medium 을 씁니다. 온보딩의 시작 행동처럼 화면에 하나뿐인 큰 행동에는 Large 를 씁니다.", html: `
        <div class="btn-group"><button type="button" class="btn sm solid primary">Small</button>
        <button type="button" class="btn md solid primary">Medium</button>
        <button type="button" class="btn lg solid primary">Large</button></div>` },
      { id: "icon", group: "variant", title: "Icon", desc: "아이콘은 행동의 의미를 보완할 때만 선택적으로 넣습니다. 라벨의 왼쪽이나 오른쪽 한쪽에만 두고, <b>양쪽에 동시에 두는 것은 지양</b>합니다.", html: `
        <div class="btn-group"><button type="button" class="btn md solid primary">${I("plus")}정책 만들기</button>
        <button type="button" class="btn md outline assistive">${I("download")}CSV 내보내기</button>
        <button type="button" class="btn md outline primary">다음 단계${I("chevron-right")}</button></div>` },
      { id: "icon-only", group: "variant", title: "Icon only", desc: "누구나 즉시 이해할 수 있는 보편적인 아이콘으로 <b>의미가 명확히 전달될 때만</b> 라벨 없이 씁니다.", html: `
        <div class="btn-group">
          <span class="tooltip-wrap"><button type="button" class="btn md primary icon-only" aria-label="추가">${I("plus")}</button><span class="tooltip" role="tooltip">추가</span></span>
          <span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip" role="tooltip">새로 고침</span></span>
          <span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" aria-label="삭제">${I("trash")}</button><span class="tooltip" role="tooltip">삭제</span></span>
          <span class="tooltip-wrap"><button type="button" class="btn sm outline assistive icon-only" aria-label="더 보기">${I("dots")}</button><span class="tooltip" role="tooltip">더 보기</span></span>
          <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기">${I("dots")}</button><span class="tooltip" role="tooltip">더 보기</span></span>
          <span class="tooltip-wrap"><button type="button" class="btn lg solid primary icon-only" aria-label="설정">${I("settings")}</button><span class="tooltip" role="tooltip">설정</span></span>
        </div>` },
      { id: "state", group: "state", title: "State", desc: "상태는 <b>Normal · Hover · Pressed · Disabled</b> 네 가지입니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(4,auto);gap:12px;max-width:100%;overflow-x:auto;padding:4px">
          <button type="button" class="btn md solid primary">Normal</button>
          <button type="button" class="btn md outline primary">Normal</button>
          <button type="button" class="btn md solid assistive">Normal</button>
          <button type="button" class="btn md outline assistive">Normal</button>
          <button type="button" class="btn md solid primary" data-state="hover">Hover</button>
          <button type="button" class="btn md outline primary" data-state="hover">Hover</button>
          <button type="button" class="btn md solid assistive" data-state="hover">Hover</button>
          <button type="button" class="btn md outline assistive" data-state="hover">Hover</button>
          <button type="button" class="btn md solid primary" data-state="pressed">Pressed</button>
          <button type="button" class="btn md outline primary" data-state="pressed">Pressed</button>
          <button type="button" class="btn md solid assistive" data-state="pressed">Pressed</button>
          <button type="button" class="btn md outline assistive" data-state="pressed">Pressed</button>
          <button type="button" class="btn md solid primary" disabled>Disabled</button>
          <button type="button" class="btn md outline primary" disabled>Disabled</button>
          <button type="button" class="btn md solid assistive" disabled>Disabled</button>
          <button type="button" class="btn md outline assistive" disabled>Disabled</button>
        </div>` },
      { id: "disabled", group: "state", title: "Disabled", desc: "비활성 옵션을 켜면 버튼이 꺼진 모양이 되고 누를 수 없습니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary" disabled>Primary</button>
          <button type="button" class="btn md solid assistive" disabled>Assistive</button>
          <button type="button" class="btn md solid negative" disabled>Negative</button>
          <button type="button" class="btn md outline primary" disabled>Primary</button>
          <button type="button" class="btn md outline assistive" disabled>Assistive</button>
          <button type="button" class="btn md outline negative" disabled>Negative</button>
          <button type="button" class="btn md assistive icon-only" aria-label="새로 고침" disabled>${I("refresh")}</button>
        </div>` },
      { id: "loading", group: "state", title: "Loading", desc: "파일 업로드 · 전송 · 저장처럼 <b>잠깐 기다리는 상태</b>를 버튼 안에서 간단히 보여줄 때 씁니다.", html: `
        <div class="btn-group"><button type="button" class="btn md solid primary loading" aria-busy="true">저장 중</button>
        <button type="button" class="btn md outline assistive loading" aria-busy="true">불러오는 중</button>
        <button type="button" class="btn md solid negative loading" aria-busy="true">삭제 중</button></div>` },
      { id: "text", group: "variant", title: "Text", desc: "카드 머리의 '전체 보기', 달력 하단의 '오늘 · 초기화'처럼 <b>문장 속 링크에 가까운 가벼운 행동</b>에만 씁니다. 카드 머리의 '전체 보기' 는 Assistive 색입니다.", html: `
        <div class="btn-group"><button type="button" class="btn sm text">전체 보기</button>
        <button type="button" class="btn md text">초기화</button>
        <button type="button" class="btn sm text assistive">전체 보기</button>
        <button type="button" class="btn md text assistive">초기화</button></div>` },
      { id: "placement", group: "variant", title: "Placement", desc: "메인과 서브가 분명히 다른 버튼을 <b>수평</b>으로 놓으면 유도 목적이 분명한 버튼을 <b>오른쪽</b>에, <b>수직</b>으로 놓으면 <b>위</b>에 둡니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md outline assistive">취소</button>
          <button type="button" class="btn md outline primary">임시 저장</button>
          <button type="button" class="btn md solid primary">정책 저장</button>
        </div>
        <div class="btn-group vertical" style="width:320px">
          <button type="button" class="btn lg solid primary">시작하기</button>
          <button type="button" class="btn lg outline assistive">나중에 하기</button>
        </div>`, layout: "stack center" },
    ],
    props: [
      ["variant", "solid | outline | text", "solid", "형태. 기본값은 React 의 것이고 HTML 은 형태 · 색 클래스를 늘 적습니다(<code>btn md solid primary</code> — 예외는 text 의 primary 하나). Solid 는 면을 채우고 Outline 은 테두리만 둡니다. <code>text</code> 는 Solid · Outline 정의 밖의 변형이고 색은 primary · assistive 둘입니다(assistive 는 <code>.text.assistive</code>). iconOnly 에서 생략하면 배경이 없습니다"],
      ["color", "primary | assistive | negative", "primary", "색. Primary 는 주 행동, Assistive 는 보조 행동, Negative 는 되돌릴 수 없는 일을 확정하는 위험 확인 팝업(alertdialog)의 버튼 — 빨강 틴트 면 + <code>--foreground-negative-strong</code> 글자. 화면의 삭제 버튼은 assistive(verify)"],
      ["size", "sm | md | lg", "md", "높이 32 · 40 · 48 고정, 너비는 라벨에 맞춰 자유. 반경은 sm 4 · md · lg 6"],
      ["iconLeft / iconRight", "ReactNode", "—", "라벨 왼쪽 · 오른쪽 아이콘. 행동의 의미를 보완할 때만 쓰고 한쪽에만 둡니다(동시 사용 지양). HTML 은 라벨 앞이나 뒤에 <code>svg</code> 를 둡니다. 크기는 sm 16 · md 18 · lg 20"],
      ["iconOnly / .icon-only", "boolean", "false", "아이콘만 단독으로 둡니다. variant 를 생략하면 배경이 없고 hover 에만 배경이 나타나며, solid · outline 을 주면 그 면을 가진 정사각 버튼이 됩니다. <code>aria-label</code> 필수"],
      ["tooltip / .tooltip-wrap", "boolean | top | bottom | left | right", "false", "아이콘 전용 버튼을 접근 이름(<code>aria-label</code>)과 같은 글의 Tooltip 으로 감쌉니다. true 는 위쪽. 끈 버튼 · 이름이 없는 버튼은 감싸지 않습니다. HTML 은 <code>&lt;span class=\"tooltip-wrap\"&gt;</code> 안에 버튼과 <code>.tooltip[role=tooltip]</code> 을 둡니다"],
      ["disabled", "boolean", "false", "비활성. 전용 토큰(회색 면 · 라벨)으로 칠하고 투명도를 쓰지 않으며 hover · 눌림 색이 없습니다. 링크(<code>a</code>)는 <code>aria-disabled=\"true\"</code>. 포커스를 남겨야 하면 <code>aria-disabled=\"true\"</code> 를 직접 적어도 됩니다 — 클릭은 ds.js · React 가 막고, 부모 행 · 카드로도 가지 않습니다"],
      ["loading / .loading", "boolean", "false", "로딩 상태. disabled 와 달리 포커스를 유지하고 click · mousedown · pointerdown · keydown 실행을 막습니다(이동 키 · 단축키는 통과). <code>aria-busy=\"true\"</code> 를 함께 두고, 스피너(아이콘과 같은 sm 16 · md 18 · lg 20)만 보이며 라벨은 자리만 지킵니다. hover · 눌림 색은 없습니다. 통과한 이동 키 · 단축키를 사이트는 버튼 자신의 keydown 리스너에도 보내고, React 는 <code>onKeyDown</code> 을 부르지 않습니다(부모로는 둘 다 감)"],
      ["block / .block", "boolean", "false", "전체 폭"],
      ["as / a.btn", "ElementType", "button", "루트 요소. 이동이면 <code>a</code>, 실행이면 <code>button</code>"],
      ["type", "button | submit | reset", "button", "폼 안에서는 명시"],
      ["ButtonGroup / .btn-group", "container", "—", "버튼 묶음. 나란한 버튼이 2개 이상이면 늘 이 안에 둔다 — 팝업 · 폼 · 카드 · 패널 · 단계 · 표 액션 바 · 달력 아래 · 상단 바 오른쪽도 틀 안에 묶음을 넣는다. 떨어진 버튼(.form-actions 의 .left)은 밖. 간격은 버튼 크기를 따라 sm 6 · md 8 · lg 12. 수평으로 놓으면 주 행동이 오른쪽"],
      ["end / .end", "boolean", "false", "ButtonGroup — 묶음을 오른쪽 정렬(폼 하단)"],
      ["vertical / .vertical", "boolean", "false", "ButtonGroup — 수직 배열(간격 8, 같은 폭). 주 행동이 위"],
    ],
    spec: [["Priority", "Lv.4 Primary Solid · Lv.3 Primary Outline · Lv.2 Assistive Solid · Lv.1 Assistive Outline · 되돌리기 어려운 행동은 Negative"], ["State", "Normal → Hover → Pressed 로 <b>라이트는 어두워지고 다크는 밝아집니다</b>. Solid primary <code>--surface-brand-primary</code> → <code>-strong</code> → <code>-heavy</code>(라이트 brand 50·45·40 · 다크 50·55·60) · Solid assistive <code>--surface-neutral-tertiary</code> → <code>-secondary</code> → <code>-strong</code> · Solid negative <code>--surface-negative-primary</code> → <code>-strong</code> → <code>-heavy</code>(위험 확인 팝업의 확정 버튼에만). Outline 은 면이 투명에서 출발 — primary(테두리 <code>--line-brand-strong</code> · 글자 <code>--foreground-brand-primary</code>) <code>--surface-brand-subtle</code> → <code>-subtle-strong</code>, assistive <code>--surface-neutral-secondary</code> → <code>-strong</code>, negative(테두리 <code>--line-negative-primary</code> · 글자 <code>--foreground-negative-strong</code>) <code>--surface-negative-hover</code> → <code>-pressed</code>. 틴트는 알파가 커지는 구조라 같은 토큰이 테마에 따라 방향을 뒤집고, 불투명 primary 는 두 테마 모두 제품 HEX(50)에서 출발해 테마별로 반대 방향 단계를 집습니다. Disabled 는 전용 토큰. 키보드 포커스는 상태가 아니라 전 변형 공통 <code>--foreground-brand-primary</code> 1px 외곽선(2px 띄움) — 예외는 Banner 안 버튼으로, 면 위에서 보이게 라벨 색(<code>currentColor</code>)을 쓰고 loading 버튼은 그 Banner 의 글자색을 씁니다. Banner 안 버튼은 끄지 않습니다(Notification › Banner)"], ["Size", "sm 32 · md 40 · lg 48 (높이 고정) · 아이콘 · loading 스피너 16 / 20 / 28 · lg 아이콘 선 1.6 · 버튼 묶음 간격 6 / 8 / 12"], ["Container", "radius sm 4(radius/sm) · md · lg 6(radius/md) · 좌우 padding 14 / 20 / 26 (text 변형은 8 고정 · 아이콘 전용은 정사각)"], ["Label", "14 SemiBold (sm 12 · lg 16) · 누르면 일어날 동작으로"]],
    figma: { frame: "Button", radius: "radius/md", sizes: { sm: { h: 32, px: 14, fs: 12, radius: "radius/sm" }, md: { h: 40, px: 20, fs: 14 }, lg: { h: 48, px: 26, fs: 16 } }, iconSize: { sm: 16, md: 18, lg: 20 }, variants: { "solid primary": { bg: "--surface-brand-primary", fg: "--brand-label" }, "outline primary": { bg: "transparent", fg: "--foreground-brand-primary", stroke: "--line-brand-strong" }, "solid assistive": { bg: "--surface-neutral-tertiary", fg: "--foreground-neutral-primary" }, "outline assistive": { bg: "transparent", fg: "--foreground-neutral-primary", stroke: "--line-neutral-primary" }, "solid negative": { bg: "--surface-negative-primary", fg: "--foreground-negative-strong" }, "outline negative": { bg: "transparent", fg: "--foreground-negative-strong", stroke: "--line-negative-primary" }, text: { bg: "transparent", fg: "--foreground-brand-primary" }, "text assistive": { bg: "transparent", fg: "--foreground-neutral-secondary" }, "plain primary": { bg: "transparent", fg: "--foreground-brand-primary" }, "plain assistive": { bg: "transparent", fg: "--foreground-neutral-secondary" }, "plain negative": { bg: "transparent", fg: "--foreground-negative-strong" } }, states: ["normal", "hover", "pressed", "disabled"], loading: true, disabled: { bg: "--surface-disable-primary", fg: "--foreground-disable-primary", outlineBg: "transparent", outlineStroke: "--surface-disable-primary" } },
  },

  /* ------------------------------------------------ Text Field */
  "text-field": {
    status: "ready", react: ["Field","TextField","TextArea","CodeInput"], css: [".field", ".code-inputs"],
    desc: "한 줄 텍스트를 입력합니다. 라벨 · 도움말 · 오류 메시지가 하나의 필드로 묶입니다.",
    choose: [
      ["언제 쓰는가", "자유로운 글을 한 줄로 받을 때 씁니다. 정해진 값 가운데 고르게 하려면 <a href=\"#/components/select\">Select</a> 나 <a href=\"#/components/combobox\">Combobox</a> 를, 숫자는 <a href=\"#/components/number-input\">Number Input</a> 을, 날짜는 <a href=\"#/components/date-picker\">Date Picker</a> 를 씁니다."],
      ["Placement", "라벨은 필드 위, 도움말은 아래. 좌우 여백 14"],
    ],
    principles: {
      "입력 전": [
        ["라벨", "모든 입력에 보이는 라벨을 위에 둡니다. placeholder 로 대신하지 않습니다. 로그인처럼 칸이 둘뿐이고 칸 안 아이콘이 뜻을 보태는 화면만 라벨을 숨기고 placeholder 로 보입니다. 숨긴 라벨은 스크린 리더가 읽습니다"],
        ["Placeholder", "입력 예시만 짧게 씁니다. 입력을 시작하면 사라지므로 형식 · 조건은 도움말에 씁니다"],
        ["필수", "필수 항목이 있는 폼은 맨 위에 <b>* 필수 항목</b> 안내를 둡니다"],
      ],
      "검증": [
        ["오류", "동작은 <a href=\"#/foundations/interaction\">Interaction</a> › Input errors 를 따릅니다. 폼에 검증을 켜면 시스템이 처리합니다. 문구는 <a href=\"#/foundations/writing\">Writing</a> 대로 무엇이 일어났는지와 고치는 법을 씁니다"],
        ["글자 수", "한도가 있고 넘기기 쉬운 필드에만 카운터를 둡니다. 붙여넣은 값이 잘리지 않도록 넘겨도 입력되고, 오류로 알립니다"],
        ["포커스 링", "포커스를 받았거나 열린 필드의 링은 제품 색입니다. <b>빨강인 제품1과 주황인 브랜드만 중립색</b>입니다. 빨강은 오류 링과, 주황은 경고색과 헷갈리지 않게 하려는 것입니다. 오류 필드의 링은 어느 제품에서나 빨강입니다"],
      ],
      "상태와 종류": [
        ["Disabled · Read-only", "Disabled 는 고칠 수 없고 값도 중요하지 않을 때, Read-only 는 고칠 수 없지만 값을 읽고 복사해야 할 때 씁니다"],
        ["필드 안 조작", "필드 안에 버튼을 넣지 않습니다. 비밀번호 표시 · Date Picker 달력 · Search 지우기 · Combobox 태그 제거만 예외입니다"],
        ["입력 종류", "IP · URL · 해시도 본문 글자로 씁니다. 고정폭 글자는 Code 에만 씁니다. 비밀번호는 표시 토글을 둡니다. 표준 입력 종류와 자동 완성 값을 쓰고, 비밀번호 필드의 붙여넣기를 막지 않습니다"],
        ["아이콘", "입력칸 안 앞에 둔 아이콘은 무엇을 넣는 칸인지 빨리 알아보게 돕는 장식입니다. 라벨을 대신하지 않아 라벨은 그대로 위에 둡니다"],
        ["Textarea", "세로로만 늘립니다"],
        ["인증 코드", "자리 수가 정해진 숫자 코드는 자리마다 칸을 나눠 받습니다. 숫자가 아닌 글자는 받지 않고, 붙여넣기와 문자 코드 자동 채우기는 모든 칸을 한 번에 채웁니다. 다 채워도 저절로 제출하지 않습니다"],
      ],
    },
    examples: [
      { id: "basic", group: "default", title: "Default / Error", desc: "오류가 나면 필드를 오류 상태로 바꾸고 도움말 자리에 오류 메시지를 씁니다. 원인과 해결 방법을 함께 씁니다.", html: `
        <div class="field"><label for="ip1">허용 IP</label><input id="ip1" value="10.0.0.12"><span class="help">IPv4 형식</span></div>
        <div class="field error"><label for="ip2">허용 IP</label><input id="ip2" value="10.0.0" aria-invalid="true" aria-describedby="ip2-err"><span class="help" id="ip2-err">올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12</span></div>` },
      { id: "size", group: "size", title: "Size", desc: "작은 크기 32px · 기본 40px · 큰 크기 48px 입니다. 버튼과 같은 높이라 나란히 둡니다.", html: `
        <div class="field sm"><label for="sz-s">Small</label><input id="sz-s" placeholder="32px"></div>
        <div class="field"><label for="sz-m">Medium</label><input id="sz-m" placeholder="40px"></div>
        <div class="field lg"><label for="sz-l">Large</label><input id="sz-l" placeholder="48px"></div>`, layout: "top" },
      { id: "affix", group: "variant", title: "Prefix / Suffix / Counter", desc: "단위나 접두어는 입력칸 안쪽 앞뒤에 둡니다. 글자 수 한도가 있으면 라벨 오른쪽에 카운터를 둡니다. 한도를 넘겨도 입력되고 오류로 알립니다.", html: `
        <div class="field"><label for="af-d">보관 기간</label><div class="affix"><input id="af-d" value="90"><span>일</span></div></div>
        <div class="field"><label for="af-u">관리 콘솔 주소</label><div class="affix"><span>https://</span><input id="af-u" placeholder="console.example.com"></div></div>
        <div class="field"><div class="row"><label for="af-c">설명</label><span class="counter">12 / 80</span></div><input id="af-c" value="외부 저장장치 차단 정책" data-maxlength="80"><span class="help" aria-live="polite"></span></div>` },
      { id: "icon", group: "variant", title: "With Icon", desc: "입력칸 안 앞에 18px 아이콘을 둡니다. 무엇을 넣는 칸인지 빨리 알아보게 돕는 장식이라 라벨은 그대로 둡니다.", html: `
        <div class="field"><label for="ic-id">이메일</label><div class="affix"><span class="field-icon" aria-hidden="true">${I("user")}</span><input id="ic-id" type="email" autocomplete="username" placeholder="admin@example.com"></div></div>
        <div class="field"><label for="ic-mail">알림 받을 이메일</label><div class="affix"><span class="field-icon" aria-hidden="true">${I("mail")}</span><input id="ic-mail" type="email" autocomplete="email" placeholder="name@example.com"></div></div>` },
      { id: "password", group: "variant", title: "Password", desc: "표시 토글로 입력한 값을 확인합니다. 토글을 눌러도 포커스는 버튼에 남고, 붙여넣기를 막지 않습니다.", html: `
        <div class="field"><label for="pw1">관리자 비밀번호</label><div class="affix"><input id="pw1" type="password" value="secret-value" autocomplete="current-password"><button type="button" class="reveal" aria-label="비밀번호 표시" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button></div></div>` },
      { id: "textarea", group: "variant", title: "Textarea", desc: "여러 줄을 입력합니다. 높이는 세로로만 늘릴 수 있습니다. 크기는 한 줄 입력과 같은 셋이고, 최소 높이는 작은 크기 72px · 기본 96px · 큰 크기 120px 입니다.", html: `
        <div class="field sm" style="min-width:min(420px,100%)"><label for="memo-s">메모</label><textarea id="memo-s" placeholder="Small · 최소 72px"></textarea></div>
        <div class="field" style="min-width:min(420px,100%)"><label for="memo">메모</label><textarea id="memo" placeholder="정책 변경 사유를 남겨 주세요"></textarea><span class="help">감사 로그에 기록됩니다</span></div>
        <div class="field lg" style="min-width:min(420px,100%)"><label for="memo-l">메모</label><textarea id="memo-l" placeholder="Large · 최소 120px"></textarea></div>`, layout: "stack" },
      { id: "code", group: "variant", title: "Code", desc: "인증 코드처럼 자리 수가 정해진 숫자를 칸마다 한 자리씩 받습니다. 치면 다음 칸으로 가고, 빈 칸에서 지우면 앞 칸을 지웁니다. 붙여넣기와 문자로 받은 코드 자동 채우기는 모든 칸을 한 번에 채웁니다. 다 채우지 않고 떠나면 오류로 알립니다.", html: `
        <form data-validate novalidate>${codeField({ id: "cd", label: "인증 코드", name: "otp", req: true, help: "인증 앱에 표시된 6자리 숫자", messages: { required: "인증 코드를 입력하세요.", code: "숫자 6자리를 모두 입력하세요." } })}</form>
        ${codeField({ id: "cd-e", label: "인증 코드", value: "4821", cls: "error", help: "숫자 6자리를 모두 입력하세요." })}
        ${codeField({ id: "cd-d", label: "인증 코드", value: "482193", disabled: true })}`, layout: "stack" },
      { id: "state", group: "state", title: "Disabled / Read-only", desc: "Disabled 는 값을 바꿀 수도 복사할 수도 없을 때 씁니다. Read-only 는 값을 읽고 복사할 수 있지만 고칠 수 없을 때 씁니다.", html: `
        <div class="field"><label for="st-id">정책 ID</label><input id="st-id" value="POL-2041" readonly><span class="help">자동 생성</span></div>
        <div class="field"><label for="st-by">생성자</label><input id="st-by" value="admin@jiran.com" disabled></div>` },
    ],
    props: [
      [".field", "container", "—", "label + input(+ .help) 묶음. 폼 안에서 min-width 해제"],
      ["size", "sm | (md) | lg", "md", "입력 높이 32 / 40 / 48"],
      [".error", "boolean", "false", "보더 danger, help 를 오류 메시지로. input 에 aria-invalid. 포커스 때는 빨강 가장자리 + --line-negative-focus 후광"],
      [".affix", "wrapper", "—", "접두어/접미어 span 과 input 을 감싸는 컨테이너"],
      [".counter", "element", "—", "글자 수 표시. .row 안에서 라벨 우측 정렬. 한도를 넘으면 .over(ds.js 가 붙임)"],
      ["data-maxlength", "number", "—", "글자 수 한도. 넘겨도 입력되고 오류로 알립니다. React 는 maxLength. 네이티브 maxlength 는 붙여넣은 값을 잘라 쓰지 않습니다"],
      [".field-icon", "span", "—", ".affix 안 맨 앞 아이콘(18, aria-hidden). 라벨을 대신하지 않습니다. React 는 icon"],
      [".reveal", "button", "—", ".affix 안 비밀번호 표시 토글(aria-pressed). React 는 reveal"],
      [".code-inputs", "wrapper", "—", "인증 코드 칸 묶음(role=group · aria-labelledby 라벨). 안에 input.code-cell × 자리 수(칸마다 aria-label 'n자리 중 m번째', 첫 칸만 autocomplete=one-time-code)와 값을 담는 hidden input(name). data-required · data-messages(required · code). 값이 바뀔 때마다 ds:code {value, complete}. React 는 CodeInput"],
      ["data-validate", "form 속성", "—", "폼 검증을 켭니다. required · pattern · min · max · minlength · type 과 data-maxlength 를 봅니다. 문구는 data-messages(JSON). React 는 Form 의 validate · messages"],
      ["disabled / readonly", "attribute", "—", "비활성 / 읽기 전용(배경 subtle)"],
    ],
    spec: [["Size", "sm 32 · md 40 · lg 48 · Textarea 최소 높이 sm 72 · md 96 · lg 120"], ["Container", "radius/md 6(sm 은 radius/sm 4 — sm 버튼과 같음, Date Picker · Combobox · Number Input 의 sm 도) · line/neutral/primary 1px · 포커스: 테두리 1px line/field/focus · 바깥 4px line/field/focus-halo(제품 색, 빨강 · 주황 제품은 중립) · 오류일 때는 foreground/negative/primary · line/negative/focus"], ["Label", "라벨 14 SemiBold · 입력 Label 1/Reading 14 · placeholder foreground/neutral/tertiary · 필수는 em(*)"], ["Icon", "칸 안 앞 아이콘 18 · foreground/neutral/tertiary · 아이콘과 입력 간격 8"], ["Code", "칸 48 × 56 · 간격 8 · 숫자 Title 2 28/38 SemiBold · 테두리 · 포커스 · 오류는 입력과 같음"]],
    figma: { frame: "Text Field", radius: "radius/md", sizes: { sm: { h: 32 }, md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-primary" }, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" }, error: { stroke: "--foreground-negative-primary", focused: { stroke: "--foreground-negative-primary", ring: "--line-negative-focus" } } }, states: ["default", "hover", "focused", "error", "error focused", "disabled", "readonly"] },
  },

  /* ------------------------------------------------ Search */
  "search": {
    status: "ready", react: ["SearchBar"], css: [".searchbar", ".chip", ".chip-group"], borrows: [".sr-only", ".btn"],
    desc: "목록 · 로그를 빠르게 거르는 검색 입력입니다. 입력이 멈추면 결과가 바뀌는 '필터형'과 Enter 로 조회하는 '조회형'을 나눠 씁니다.",
    choose: [
      ["언제 쓰는가", "목록이나 로그에서 이름이나 내용으로 항목을 찾을 때 씁니다. 정해진 값으로 좁히려면 <a href=\"#/components/chip\">Filter Chip</a> 이나 <a href=\"#/components/select\">Select</a> 를, 보기 가운데 하나를 찾아 고르려면 <a href=\"#/components/combobox\">Combobox</a> 를 씁니다."],
      ["Placement", "테이블 툴바 좌측, 전역 검색은 상단 바 로고 옆"],
    ],
    principles: [
      ["필터형 · 조회형", "이미 불러온 목록을 좁히면 필터형입니다. 입력이 멈추고 300ms 뒤에 결과를 바꿉니다. 서버에 새로 묻거나 비용이 크면 조회형으로 두고 Enter 에 맡깁니다"],
      ["Placeholder", "검색 대상을 씁니다. 검색 아이콘이 있고 스크린 리더가 읽을 이름을 달았을 때만 보이는 라벨 없이 쓸 수 있습니다"],
      ["지우기", "값이 있을 때만 보입니다. Esc 도 같은 동작입니다. 값이 없으면 검색창은 Esc 에 반응하지 않습니다"],
      ["단축키", "'/' 단축키는 화면에 하나뿐인 주 검색에만 답니다. 다른 칸에 입력하는 중이거나 조합키를 함께 누를 때, 모달이 열린 동안에는 무시합니다"],
      ["툴바", "검색칸 옆에 Select · Combobox · Date Picker 를 둘 때는 되도록 한 줄에 놓습니다. 옆 컨트롤은 제 폭을 지키고, 검색칸이 남는 폭을 가집니다. 자리가 모자라면 검색칸이 200 까지 줄고, 그래도 넘칠 때만 줄을 바꿉니다. 예는 <a href=\"#/patterns/search\">검색</a> 패턴에 있습니다."],
      ["결과 건수", "결과가 바뀌면 화면에 보이지 않는 알림으로 건수를 스크린 리더에 전합니다. 보이는 건수는 목록 툴바에 둡니다"],
      ["결과 없음", "<a href=\"#/components/empty-state\">Empty State</a> 의 검색 결과 없음으로 잇습니다. 조건을 보여 주고 초기화 · 완화를 제안합니다"],
      ["조건 유지", "검색어와 필터를 URL 에 남겨 공유 · 새로고침해도 유지합니다. 제품이 구현합니다"],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "아이콘과 입력칸으로 된 조회형입니다. Enter 를 누르면 검색을 실행했다는 이벤트를 냅니다.", html: `
        <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="정책 이름 검색" aria-label="정책 검색"></div>` },
      { id: "extras", group: "variant", title: "Shortcut / Clear", desc: "전역 검색에는 단축키를 달고 그 키를 입력칸에 표시합니다. 값이 있을 때는 지우기 버튼을 보여 줍니다. 이 페이지에서는 / 를 누르면 이 입력으로 갑니다.", html: `
        <div class="searchbar" role="search" data-hotkey>${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="검색"><kbd>/</kbd></div>
        <div class="searchbar" role="search">${I("search")}<input type="search" value="랜섬웨어" aria-label="검색"><button type="button" class="clear" aria-label="지우기">${I("x",12)}</button></div>` },
      { id: "large", group: "size", title: "Large / Block", desc: "빈 화면이나 온보딩처럼 검색이 화면의 주된 행동일 때 큰 크기를 폭에 꽉 채워 씁니다.", html: `
        <div class="searchbar lg block" role="search" style="max-width:560px">${I("search")}<input type="search" placeholder="정책 이름, 대상 검색" aria-label="검색"></div>` },
      { id: "size", group: "size", title: "Size", desc: "작은 크기 32px · 기본 40px · 큰 크기 48px 로 버튼 · 필드와 같은 높이입니다. 상단 내비의 검색은 옆 아이콘 버튼과 같은 32px 입니다.", html: `
        <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
          <div class="searchbar sm" role="search">${I("search")}<input type="search" placeholder="검색" aria-label="검색 sm"></div>
          <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="검색" aria-label="검색 md"></div>
          <div class="searchbar lg" role="search">${I("search")}<input type="search" placeholder="검색" aria-label="검색 lg"></div>
        </div>` },
      { id: "filters", group: "variant", title: "With Filters", desc: "필터형과 필터 칩을 함께 쓴 예입니다. 입력이 멈추면 결과를 바꾸고, 건수는 화면에 보이지 않는 알림으로 전합니다.", html: `
        <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:720px">
          <div class="searchbar block" role="search" data-debounce>${I("search")}<input type="search" placeholder="로그 검색" aria-label="로그 검색"><span class="sr-only" role="status">128건</span></div>
          <div class="chip-group">
            <button type="button" class="chip on" aria-pressed="true">Critical</button>
            <button type="button" class="chip on" aria-pressed="true">High</button>
            <button type="button" class="chip" aria-pressed="false">Medium</button>
            <button type="button" class="chip" aria-pressed="false">Low</button>
            <button type="button" class="chip" aria-pressed="false">Info</button>
            <button type="button" class="chip" aria-pressed="false">최근 24시간</button>
            <button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button>
          </div>
        </div>`, layout: "left" },
    ],
    props: [
      [".searchbar", "container", "—", "svg + input(+ kbd / .clear). role=search"],
      ["data-debounce", "ms", "300", "필터형 — 입력이 멈춘 뒤 ds:search. 값을 비우면 300. 없으면 조회형(Enter). React 는 debounce"],
      ["ds:search", "이벤트", "—", ".searchbar 에서 detail {value, trigger}. trigger 는 input · enter · clear. React 는 onSearch(value, trigger)"],
      ["data-hotkey", "boolean", "false", "/ 로 포커스. 화면에 하나. React 는 hotkey"],
      [".sr-only[role=status]", "element", "—", "결과 건수 — 제품이 글자를 넣습니다. React 는 status"],
      ["size", "sm | (md) | lg", "md", "높이 32 / 40 / 48 — 버튼 · 필드와 같다(상단 내비 검색은 32)"],
      ["kbd", "element", "—", "단축키 표시(전역 검색). 값이 있으면 숨김. data-hotkey 와 같이 씁니다"],
      [".clear", "button", "—", "값 지우기. 값이 있을 때만 렌더"],
    ],
    spec: [["Size", "높이 sm 32 · md 40 · lg 48 · 최소 폭 280 · 상단 내비 40(최소 폭 220)"], ["Container", "radius/md 6(sm 4) · line/neutral/primary · 포커스: 테두리 1px line/field/focus · 바깥 4px line/field/focus-halo(제품 색, 빨강 · 주황 제품은 중립)"], ["Label", "Label 1/Reading 14 · 플레이스홀더 foreground/neutral/tertiary"]],
    figma: { frame: "Search", radius: "radius/md", sizes: { md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-primary" }, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" } }, states: ["default", "focused", "filled"] },
  },

  /* ------------------------------------------------ Select Button */
  "select-button": {
    status: "ready", react: ["SelectButton"], css: [".select-btn"],
    desc: "2~5개 옵션 가운데 하나를 고르는 세그먼트 컨트롤입니다. 목록과 카드 사이의 보기 전환이나 24시간 · 7일 · 30일 같은 기간처럼 바로 반영되는 선택에 씁니다.",
    choose: [
      ["언제 쓰는가", "2~5개 중 하나를 고르고, 같은 내용에서 보기나 기간만 바뀔 때 씁니다. 내용이 달라지면 <a href=\"#/components/tab\">Tab</a> 을, 저장해야 반영되면 <a href=\"#/components/radio-button\">Radio Button</a> 을, 6개 이상이면 <a href=\"#/components/select\">Select</a> 를 씁니다."],
      ["Placement", "카드 헤더 우측, 툴바"],
    ],
    principles: [
      ["항상 하나", "언제나 하나가 선택되어 있습니다. 선택을 푸는 동작은 없습니다"],
      ["라벨", "1~2단어로 쓰고 항목끼리 길이를 비슷하게 맞춥니다"],
      ["키보드", "Tab 은 묶음에 한 번만 멈춥니다. 좌우 · 상하 화살표로 옮기면 바로 고르고, 비활성은 건너뛰며 끝에서 처음으로 돌아옵니다"],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "고른 항목이 강조됩니다. 묶음 전체가 라디오 묶음으로 읽히고, Tab 은 묶음에 한 번만 멈추며 화살표로 옮깁니다.", html: `
        <div class="select-btn" role="radiogroup" aria-label="기간">
          <button type="button" class="on" role="radio" aria-checked="true">24시간</button>
          <button type="button" role="radio" aria-checked="false">7일</button>
          <button type="button" role="radio" aria-checked="false">30일</button>
        </div>`, react: `
        import { useState } from "react";
        import { SelectButton } from "@jiran/ds-react";
        const OPTIONS = [{ value: "24h", label: "24시간" }, { value: "7d", label: "7일" }, { value: "30d", label: "30일" }];
        export function PeriodSelect() {
          const [value, setValue] = useState("24h");
          return <SelectButton label="기간" options={OPTIONS} value={value} onChange={setValue} />;
        }` },
      { id: "outline", group: "variant", title: "Outline", desc: "툴바에서 다른 버튼과 나란히 둘 때는 테두리형을 씁니다. 고른 버튼은 네 변이 제품 색 선이고 면은 옅은 제품 색입니다.", html: `
        <div class="select-btn outline" role="radiogroup" aria-label="보기">
          <button type="button" class="on" role="radio" aria-checked="true">${I("list")}목록</button>
          <button type="button" role="radio" aria-checked="false">${I("chart-bar")}차트</button>
        </div>` },
      { id: "solid", group: "variant", title: "Outline Solid", desc: "테두리형에서 고른 버튼을 제품 색 면과 흰 글자로 칠합니다. 툴바에서 고른 값을 더 또렷하게 보여야 할 때 씁니다. 테두리형에만 씁니다.", html: `
        <div class="select-btn outline solid" role="radiogroup" aria-label="판정">
          <button type="button" class="on" role="radio" aria-checked="true">전체</button>
          <button type="button" role="radio" aria-checked="false">차단</button>
          <button type="button" role="radio" aria-checked="false">허용</button>
        </div>` },
      { id: "disabled", group: "state", title: "Disabled", desc: "옵션을 하나씩 끌 수 있습니다.", html: `
        <div class="select-btn" role="radiogroup" aria-label="판정">
          <button type="button" class="on" role="radio" aria-checked="true">전체</button>
          <button type="button" role="radio" aria-checked="false">차단</button>
          <button type="button" role="radio" aria-checked="false" disabled>허용</button>
        </div>` },
      { id: "size", group: "size", title: "Size", desc: "작은 크기 32px · 기본 40px · 큰 크기 48px 로 Button · 필드와 같은 높이라 툴바에 나란히 둡니다. 면형은 안쪽 버튼이 3px 씩 들어가 있습니다.", html: `
        <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
          <div class="select-btn sm" role="radiogroup" aria-label="판정 sm"><button type="button" class="on" role="radio" aria-checked="true">전체</button><button type="button" role="radio" aria-checked="false">차단</button><button type="button" role="radio" aria-checked="false">허용</button></div>
          <div class="select-btn" role="radiogroup" aria-label="판정 md"><button type="button" class="on" role="radio" aria-checked="true">전체</button><button type="button" role="radio" aria-checked="false">차단</button><button type="button" role="radio" aria-checked="false">허용</button></div>
          <div class="select-btn lg" role="radiogroup" aria-label="판정 lg"><button type="button" class="on" role="radio" aria-checked="true">전체</button><button type="button" role="radio" aria-checked="false">차단</button><button type="button" role="radio" aria-checked="false">허용</button></div>
          <div class="select-btn outline sm" role="radiogroup" aria-label="판정 outline sm"><button type="button" class="on" role="radio" aria-checked="true">전체</button><button type="button" role="radio" aria-checked="false">차단</button><button type="button" role="radio" aria-checked="false">허용</button></div>
          <div class="select-btn outline" role="radiogroup" aria-label="판정 outline md"><button type="button" class="on" role="radio" aria-checked="true">전체</button><button type="button" role="radio" aria-checked="false">차단</button><button type="button" role="radio" aria-checked="false">허용</button></div>
          <div class="select-btn outline lg" role="radiogroup" aria-label="판정 outline lg"><button type="button" class="on" role="radio" aria-checked="true">전체</button><button type="button" role="radio" aria-checked="false">차단</button><button type="button" role="radio" aria-checked="false">허용</button></div>
        </div>` },
    ],
    props: [[".select-btn", "container", "—", "role=radiogroup + aria-label. 버튼 2~5개, 버튼마다 role=radio"], [".outline", "boolean", "false", "아웃라인형(툴바용). 고른 버튼은 brand 선 + 옅은 brand 면"], [".solid", "boolean", "false", "고른 버튼을 제품 색 면 + 흰 글자로. <code>.outline</code> 과 함께만 — React <code>solid</code>"], [".on", "boolean", "—", "선택 항목. aria-checked=true 와 함께"], ["size", "sm | (md) | lg", "md", "높이 32 / 40 / 48 — Button · 필드와 같다"], ["disabled", "attribute", "—", "옵션 비활성"], ["data-value", "attribute", "—", "버튼의 값. 없으면 글자"], ["ds:select", "event", "—", "고르면 {value} — 클릭과 화살표 키 모두"]],
    spec: [["Size", "높이 sm 32 · md 40 · lg 48 = Button · 필드(면형은 안쪽 버튼 26 · 34 · 42 + 패딩 3 · outline 은 버튼마다 테두리 1 포함 · 이웃과 1px 겹침)"], ["Container", "radius/md 6 · 안쪽 버튼 radius/sm 4 · surface/neutral/secondary · outline 은 버튼마다 line/neutral/primary"], ["Selected", "기본 elevated + shadow-1 · outline brand 선(surface/brand/primary) + brand subtle 면 · outline solid surface/brand/primary 면 + 흰 글자"], ["Label", "Label 1/Normal 14 · 선택 14 SemiBold"]],
    figma: { frame: "Select Button", radius: "radius/md", sizes: { md: { h: 38 } }, variants: { filled: { bg: "--surface-neutral-secondary" }, outline: { stroke: "--line-neutral-primary" } }, states: ["default", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Slider */
  "slider": {
    status: "ready", react: ["Slider"], css: [".slider", ".slider-field"], borrows: [".number-field", ".num-btn", ".field", ".affix", ".help"],
    desc: "범위 안의 값을 끌어서 고릅니다. 정확한 값이 중요하면 <a href=\"#/components/number-input\">Number Input</a> 을 씁니다.",
    choose: [
      ["언제 쓰는가", "대략적인 값을 고를 때 씁니다. 정책 임계치처럼 숫자가 정확해야 하면 <a href=\"#/components/number-input\">Number Input</a> 을 먼저 씁니다."],
      ["Placement", "정책 설정의 수치 항목. 정확 입력이 필요하면 Number Input 을 함께 둠"],
    ],
    principles: [
      ["숫자 입력을 함께 둘 때", "트랙과 숫자 입력칸을 값 하나로 묶습니다. 입력칸은 트랙 오른쪽에 두고, 제출하는 값은 입력칸입니다. Slider 를 움직이면 입력칸이 바로 바뀝니다. 입력칸에 범위를 벗어난 값을 쓰면 글자는 지우지 않고 오류로 알리며, Slider 는 가까운 끝에 둡니다"],
      ["단위", "현재 값에 단위를 붙여 보이고, 스크린 리더도 값을 단위와 함께 읽게 합니다"],
      ["범위", "값은 하나입니다. 두 끝을 고르는 범위 슬라이더는 지원하지 않습니다. 시작 · 끝 값을 Text Field 둘로 받습니다"],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "트랙은 현재 값까지 채워 그립니다. 값을 코드로 바꿀 때는 채운 길이도 함께 바꿉니다.", html: `
        <div class="slider">
          <div class="row"><label for="s1">탐지 민감도</label><span class="val">60</span></div>
          <input id="s1" type="range" min="0" max="100" value="60" style="--p:60%">
        </div>`, react: `
        import { useState } from "react";
        export function Sensitivity() {
          const [v, setV] = useState(60);
          return (
            <div className="slider">
              <div className="row"><label htmlFor="s1">탐지 민감도</label><span className="val">{v}</span></div>
              <input id="s1" type="range" min={0} max={100} value={v} style={{ "--p": v + "%" } as React.CSSProperties} onChange={e => setV(Number(e.target.value))} />
            </div>
          );
        }` },
      { id: "ticks", group: "variant", title: "With Ticks", desc: "단계가 정해진 값은 간격을 두고 눈금을 보여 줍니다. 스크린 리더는 현재 값을 단위와 함께 읽습니다.", html: `
        <div class="slider">
          <div class="row"><label for="s2">로그 보관</label><span class="val">90일</span></div>
          <input id="s2" type="range" min="30" max="180" step="30" value="90" style="--p:40%" aria-valuetext="90일">
          <div class="ticks"><span>30</span><span>180</span></div>
        </div>` },
      { id: "with-input", group: "variant", title: "With Number Input", desc: "대략 맞추고 정확히 고치는 값입니다. 트랙을 움직이면 입력칸이, 입력칸에 치면 트랙이 따라갑니다. 범위 밖 값은 받아서 오류로 알리고 트랙은 끝에 둡니다.", html: `
        <div class="field number-field slider-field">
          <label id="s5-label" for="s5">로그인 실패 허용 횟수</label>
          <div class="slider-control">
            <div class="slider"><input type="range" min="0" max="20" value="5" style="--p:25%" aria-labelledby="s5-label" aria-valuetext="5회"></div>
            <div class="affix"><input id="s5" type="number" min="0" max="20" value="5" aria-valuetext="5회"><span>회</span>${numBtns("로그인 실패 허용 횟수")}</div>
          </div>
          <span class="help">0회부터 20회까지 입력할 수 있습니다.</span>
        </div>` },
      { id: "exact", group: "variant", title: "Exact Value", desc: "숫자가 정확해야 하면 Slider 대신 Number Input 을 씁니다.", html: `
        <div class="field number-field" style="width:280px"><label for="s4">세션 만료</label><div class="affix"><input id="s4" type="number" value="30" min="5" max="1440" aria-valuetext="30분"><span>분</span>${numBtns("세션 만료")}</div><span class="help">5분부터 1440분까지 입력할 수 있습니다.</span></div>` },
      { id: "disabled", group: "state", title: "Disabled", html: `
        <div class="slider">
          <div class="row"><label for="s3">대역폭 제한</label><span class="val">—</span></div>
          <input id="s3" type="range" value="40" style="--p:40%" disabled>
        </div>` },
    ],
    props: [[".slider", "container", "—", ".row(라벨·값) + input[type=range](+ .ticks)"], [".val", "element", "—", "현재 값. 숫자 뒤 글자가 단위(90일) — 움직여도 유지되고 aria-valuetext 로 나간다"], [".slider-field", "container", "—", ".field.number-field.slider-field — label(id · 숫자 입력칸에 for) + .slider-control(.slider > range[aria-labelledby=라벨] + .affix > input[type=number] · 단위 · .num-btn) + .help. 두 칸의 min · max · step 은 같다. 트랙의 aria-valuetext 에 입력칸의 단위가 붙는다. React <code>withInput</code> · <code>unit</code>"], ["--p", "css var (%)", "50%", "채워진 트랙 비율. value 와 동기화"], ["min / max / step", "attribute", "0 / 100 / 1", "네이티브 속성"], ["disabled", "attribute", "—", "비활성"], ["ds:slide", "event", "—", "트랙을 움직이면 {value}(숫자)"]],
    spec: [["Size", "트랙 6 · 썸 20 · 최소 폭 280"], ["Container", "트랙 radius/full · 썸 border 2px brand"], ["Label", "라벨 12 Regular · 현재 값 12 SemiBold · 눈금 12 tertiary"]],
    figma: { frame: "Slider", sizes: { md: { track: 6, thumb: 20 } }, variants: { default: { fill: "--surface-brand-primary", track: "--surface-neutral-strong" } }, states: ["default", "hover", "focused", "disabled"] },
  },

  /* ------------------------------------------------ Date Picker */
  "date-picker": {
    status: "ready", react: ["Calendar","DatePicker","DateRangePicker","formatDate","parseDate"], css: [".datepicker", ".calendar"], borrows: [".btn", ".field", ".sr-only"],
    desc: "날짜를 YYYY. MM. DD 순서로 입력하거나 달력에서 고릅니다. Text Field 를 바탕으로 만들어 숫자만 쳐도 형식이 채워집니다. 고르는 단위와 기간, 달력 표기 언어, 기준 시간대를 정할 수 있습니다. 입력한 값이 늘 올바른 날짜는 아닙니다. 덜 친 날짜, 달력에 없는 날짜, 범위 밖 날짜도 그 상태 그대로 남겨 알립니다.",
    choose: [
      ["언제 쓰는가", "날짜나 기간, 또는 날짜와 시각을 받을 때 씁니다. 미리 정해 둔 기간 몇 개 중에서만 고르게 하려면 <a href=\"#/components/select-button\">Select Button</a> 이 낫습니다."],
      ["Placement", "필드 아래 4px. 아래 자리가 모자라고 위가 더 넓으면 필드 위 4px. 팝업 · 패널 본문 안에서도 본문에 잘리지 않고 그 위로 뜸"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "날짜 하나를 입력하는 기본 필드입니다. 숫자만 치면 YYYY. MM. DD 형식으로 끊어 채워집니다. 20260907 을 치면 2026. 09. 07 이 되고, 월 자리에 9 를 치면 09 가 됩니다. 위 · 아래 화살표는 커서가 놓인 연 · 월 · 일 조각을 하나씩 올리고 내립니다. 달력 버튼이나 Alt + 아래 화살표로 달력을 열어 고를 수도 있습니다.", html: dpField({ id: "dp-default", label: "점검일" }) },
      { id: "range", group: "variant", title: "Date Range Picker", desc: "조회 기간처럼 시작일과 종료일을 함께 받습니다. 달력 두 개가 기본이라 달을 넘는 기간도 한 번에 고릅니다. 767px 이하의 좁은 화면이나 달력 수를 하나로 정한 필드에서는 달력이 하나로 줄어듭니다. 입력 형식은 YYYY. MM. DD ~ YYYY. MM. DD 이고, 앞 날짜를 다 치면 ~ 뒤로 넘어갑니다. 이 예제는 최대 날짜를 오늘로 정해 미래 날짜를 고를 수 없습니다.", html: dpField({ id: "dp-range", label: "조회 기간", range: true, value: "2026. 09. 01 ~ 2026. 09. 07", attrs: 'data-max="today" data-presets="7 30"' }), layout: "top" },
      { id: "time", group: "variant", title: "Time", desc: "시각까지 입력하는 옵션입니다. 값은 YYYY. MM. DD HH:mm 하나이고 24시간제입니다. 초까지 받도록 정할 수도 있습니다. 숫자만 치면 끊어 채워지고, 위 · 아래 화살표는 시 · 분 · 초도 하나씩 움직입니다. 달력에서는 날짜를 누르고 아래 칸에서 시각을 고친 뒤 적용합니다. 아래 칸은 <a href=\"#/components/time-picker\">Time Picker</a> 라서 시계 버튼으로 시 · 분 열을 열어 고를 수도 있습니다. 처음 시각은 00:00 이고, 이미 시각이 있으면 날짜만 바꿉니다. 시각을 치지 않으면 값이 되지 않고 덜 입력됐다고 알립니다.", html: `
        ${dpField({ id: "dp-time", label: "예약 실행", time: true, value: "2026. 09. 07 14:30" })}
        ${dpField({ id: "dp-time-sec", label: "이벤트 시각", time: "seconds", value: "2026. 09. 07 14:30:05" })}`, layout: "top" },
      { id: "time-range", group: "variant", title: "Time Range", desc: "기간에도 시각을 붙입니다. 달력에서 고르면 시작은 00:00, 끝은 23:59 로 채워져 고른 마지막 날까지 조회에 들어갑니다. 초를 쓰면 끝은 23:59:59 입니다. 시작과 끝이 같은 날이면 시각까지 견주어 순서가 뒤집혔을 때 알립니다. 범위를 '오늘' 처럼 날짜만으로 정하면 그 하루 전체가 범위에 들어갑니다.", html: `
        ${dpField({ id: "dp-time-range", label: "로그 조회 구간", time: true, range: true, value: "2026. 09. 07 09:00 ~ 2026. 09. 08 18:30" })}`, layout: "top" },
      { id: "max-days", group: "variant", title: "Max Days", desc: "기간의 최대 길이를 정합니다. 길이는 양끝을 포함한 일수이고 시각은 세지 않습니다. 달력에서 시작을 고르면 상한 밖의 날짜는 고를 수 없고, 상한보다 긴 프리셋은 꺼집니다. 키보드로 친 긴 기간은 값으로 받되 기간이 너무 길다고 알립니다. 상한은 도움말에 적어 둡니다.", html: `
        ${dpField({ id: "dp-max-days", label: "감사 로그 내보내기", range: true, attrs: 'data-max-days="31" data-presets="7 30 90"', value: "2026. 09. 01 ~ 2026. 09. 30", help: "최대 31일까지 내보낼 수 있습니다." })}`, layout: "top" },
      { id: "unit", group: "variant", title: "Unit", desc: "고르는 단위를 연 · 월 · 일 중에서 정합니다. 연 단위는 YYYY 형식이고 12년씩 보이는 연도 목록에서 고릅니다. 월 단위는 YYYY. MM 형식이고 월 목록에서 고릅니다. 기본인 일 단위는 YYYY. MM. DD 형식이고 날짜 달력에서 고릅니다. 확정한 값은 단위에 맞는 기계 형식으로 넘어갑니다.", html: `
        ${dpField({ id: "dp-year", label: "보고 연도", unit: "year", value: "2026" })}
        ${dpField({ id: "dp-month", label: "보고서 월", unit: "month", value: "2026. 09" })}
        ${dpField({ id: "dp-day", label: "점검일", value: "2026. 09. 07" })}`, layout: "top" },
      { id: "calendar", group: "variant", title: "Calendar", desc: "열린 상태의 달력입니다. 칸에 칠하는 면은 모두 지름 34px 원입니다. 오늘은 옅은 제품 색 원에 굵은 제품 색 글자로, 고른 날은 제품 색 원으로 보입니다. 포인터를 올리거나 누르면 회색 원이, 키보드 포커스에는 원 외곽선이 생깁니다. 다른 달의 날짜는 흐리게 보이고, 최대 날짜 밖의 날짜는 고를 수 없습니다. 제목을 누르면 연도와 월을 골라 빠르게 옮겨 갑니다.", html: cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", max: "2026-09-30", footer: "today apply" }) },
      { id: "range-calendar", group: "variant", title: "Range Calendar", desc: "기간 달력은 두 달을 나란히 보여 줍니다. 자리가 좁은 화면에서는 한 달만 보여 줍니다. 시작일과 종료일은 제품 색 원이고, 그 사이는 옅은 띠로 이어집니다. 시작만 고른 동안에는 포인터를 올린 날까지 기간을 미리 보여 줍니다. 포인터를 올린 날은 시작과 같은 제품 색 원입니다. 적용 버튼은 끝을 고른 뒤에 켜집니다. 두 달 보기에서는 다른 달 칸을 비워 같은 날짜가 두 번 나오지 않게 합니다.", html: cal({ month: "2026-09", mode: "range", start: "2026-09-21", end: "2026-10-07", today: "2026-10-07", footer: "apply", presets: "7 30" }) },
      { id: "min-max", group: "variant", title: "Min · Max", desc: "최소 · 최대 날짜 밖은 달력에서 고를 수 없습니다. 키보드로는 범위 밖 값도 들어갑니다. 직접 치거나 화살표로 조각을 넘기면 값은 그 날짜로 남고, 오류 테두리와 원인 문구가 붙습니다. 문구는 무엇이 일어났는지와 고치는 법 두 부분으로 씁니다. 범위는 그 날짜를 포함하는 '부터 · 까지' 로 적습니다. 오류 문구는 제품이 바꿀 수 있습니다.", html: `
        ${dpField({ id: "dp-in", label: "점검일", value: "2026. 09. 07", help: "2026년 안의 날짜", attrs: 'data-min="2026-01-01" data-max="2026-12-31"' })}
        ${dpField({ id: "dp-out", label: "점검일", value: "2027. 01. 05", help: "날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.", cls: "error", invalid: true, attrs: 'data-min="2026-01-01" data-max="2026-12-31" data-help="2026년 안의 날짜"' })}`, layout: "top" },
      { id: "invalid", group: "state", title: "Invalid Date", desc: "입력한 값이 늘 올바른 날짜는 아닙니다. 덜 친 날짜는 '덜 입력됨', 2월 30일처럼 달력에 없는 날짜는 '없는 날짜' 상태로 남습니다. 두 경우 모두 확정 값은 비어 있습니다. 오류는 Enter 를 누르거나 포커스가 필드를 떠날 때 보입니다.", html: `
        ${dpField({ id: "dp-incomplete", label: "시작일", value: "2026. 09", help: "날짜가 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.", cls: "error", invalid: true, attrs: 'data-help="점검을 시작한 날"' })}
        ${dpField({ id: "dp-invalid", label: "종료일", value: "2026. 02. 30", help: "날짜가 달력에 없습니다. 달력에서 고르거나 2026. 09. 07 처럼 입력하세요.", cls: "error", invalid: true, attrs: 'data-help="점검을 끝낸 날"' })}`, layout: "top" },
      { id: "locale", group: "variant", title: "Locale", desc: "달력 표기 언어를 바꿉니다. 기본은 한국어입니다. 제목, 요일, 월 이름, 날짜 칸의 읽는 이름, '오늘' 버튼은 브라우저의 언어 기능으로 만들어서 따로 불러오지 않아도 됩니다. 브라우저가 만들지 못하는 적용 · 이전 달 · 다음 달 같은 문구는 제품이 넣습니다. 필드의 입력 형식은 언어와 상관없이 YYYY. MM. DD 입니다.", html: `
        ${cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", locale: "en-US", footer: "today apply", labels: { dialog: "Choose date", apply: "Apply", prevMonth: "Previous month", nextMonth: "Next month", chooseYear: "choose year" } })}
        ${cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", locale: "ja-JP", footer: "today apply", labels: { dialog: "日付を選択", apply: "適用", prevMonth: "前の月", nextMonth: "次の月", chooseYear: "年を選択" } })}` },
      { id: "timezone", group: "variant", title: "Timezone", desc: "'오늘' 과 값의 기준 시간대를 정합니다. 기본은 사용자 환경의 시간대입니다. America/New_York 같은 표준 시간대 이름과 UTC 를 씁니다. 값을 확정하면 그 시간대의 0시를 넘깁니다. 같은 순간이라도 뉴욕은 서울보다 하루 늦을 수 있어서 '오늘까지' 가 가리키는 날이 다릅니다.", html: `
        ${dpField({ id: "dp-utc", label: "UTC 기준", help: "UTC 의 오늘까지", attrs: 'data-timezone="UTC" data-max="today" data-footer="today apply"' })}
        ${dpField({ id: "dp-ny", label: "뉴욕 기준", help: "America/New_York 의 오늘까지", attrs: 'data-timezone="America/New_York" data-max="today" data-footer="today apply"' })}`, layout: "top" },
      { id: "footer", group: "variant", title: "Footer", desc: "달력 아래 버튼을 오늘 · 초기화 · 취소 · 적용 중에서 고릅니다. 취소는 달력을 열기 전 값으로 되돌립니다. 버튼을 하나도 두지 않으면 고르는 순간 적용하고 닫힙니다. 기간은 끝을 고를 때 적용됩니다.", html: `
        ${dpField({ id: "dp-foot-all", label: "전체 버튼", value: "2026. 09. 07", attrs: 'data-footer="today reset cancel apply"' })}
        ${dpField({ id: "dp-foot-none", label: "바로 적용", attrs: 'data-footer="none"' })}
        ${dpField({ id: "dp-foot-range", label: "기간 바로 적용", range: true, attrs: 'data-footer="none"' })}`, layout: "top" },
      { id: "size", group: "size", title: "Size", desc: "높이는 32px · 40px · 48px 세 가지이고 Text Field · Button 과 같습니다.", html: `
        ${dpField({ id: "dp-sm", label: "Small", cls: "sm" })}
        ${dpField({ id: "dp-md", label: "Medium" })}
        ${dpField({ id: "dp-lg", label: "Large", cls: "lg" })}`, layout: "top" },
      { id: "state", group: "state", title: "State", desc: "비활성 필드는 비활성 색으로 칠하고 달력을 열지 않습니다. 읽기 전용 필드는 값만 보이고 달력을 열지 않습니다.", html: `
        ${dpField({ id: "dp-off", label: "비활성", value: "2026. 09. 07", disabled: true })}
        ${dpField({ id: "dp-ro", label: "읽기 전용", value: "2026. 09. 07", help: "정책이 정한 날짜", readonly: true })}`, layout: "top" },
    ],
    props: [[".datepicker.field", "container", "—", "Text Field 셸 — label + .affix(input + .cal-btn) + .help, 열면 .calendar. 열림은 .open, 위로 펼침은 .up"], ["data-unit", "day | month | year", "day", "입력 형식(YYYY. MM. DD · YYYY. MM · YYYY) · 달력 첫 화면 · 고르는 단위"], ["data-range", "boolean", "—", "기간(Date Range Picker). 달력 2개가 기본(일 단위). 월 · 연 단위는 칸 하나에 12개라 1개"], ["data-max-days", "number", "—", "기간의 최대 길이(양끝 포함 일수, 일 단위 기간만). 시작을 고르면 밖의 날짜를 막고 긴 프리셋을 끈다. 키보드 입력은 받아서 validity long. React <code>maxDays</code>"], ["data-time", "boolean | seconds", "—", "시각까지 입력(일 단위만). 필드 YYYY. MM. DD HH:mm · 값 YYYY-MM-DD HH:mm · 24시간제. seconds 면 초까지. 달력 아래 시각 칸(Time Picker sm, <code>.timepicker[data-dp-side]</code>)이 생기고 적용 버튼은 늘 있다. React <code>time</code>"], ["data-value / data-start · data-end", "YYYY-MM-DD · YYYY-MM · YYYY · YYYY-MM-DD HH:mm(:ss)", "—", "확정 값(기계 형식). 미완성 · 없는 날짜면 비고, 범위 밖 · 순서 오류면 그 날짜가 남는다"], ["data-validity", "empty | incomplete | invalid | min | max | order | long | valid", "—", "ds.js 가 쓴다. 유효 · 빈 값도 적는다(React 와 같다)"], ["data-locale", "BCP 47 태그", "ko-KR", "달력 제목 · 요일 · 월 이름 · 접근 이름 · '오늘'(Intl). 입력 형식은 바뀌지 않는다"], ["data-labels", "JSON", "한국어", "Intl 이 만들지 못하는 문구 — dialog · apply · cancel · reset · today · prevMonth · nextMonth · prevYear · nextYear · prevYears · nextYears · chooseYear · yearGrid · backToDays · backToMonths · recent(\"최근 {n}일\") · time · startTime · endTime · timeOpen(시계 버튼 이름 뒷말 \"선택\"). 키는 React labels 와 같다. 오류 문구는 data-messages"], ["data-messages", "JSON", "한국어", "오류 문구 — incomplete · invalid · min · max · order 와 주어 subject(\"날짜가\") · startSubject(\"시작일이\") · endSubject(\"종료일이\"), 시각의 invalidTime · orderTime · timeSubject · startTimeSubject · endTimeSubject, 기간 상한의 long(자리표시 {days}). 자리표시 {subject} {example} {min} {max} 로 어순을 정한다 — 기간에서 한쪽만 틀리면 {subject} 가 그 쪽 이름. 자리표시가 없으면 옛 조합(앞말 + 예시 · 날짜 + 꼬리말). 키는 React messages 와 같다"], ["data-timezone", "IANA 이름 | UTC", "사용자 환경", "'오늘'과 ds:date 의 date(그 시간대 0시 — data-time 이면 그 시각). dayjs + utc · timezone 플러그인이 실린 페이지에서 계산한다"], ["data-min / data-max", "YYYY-MM-DD | today | YYYY-MM-DD HH:mm", "—", "밖의 날짜 · 월 · 연은 달력에서 aria-disabled. 키보드 입력은 막지 않고 오류로 알린다. data-time 에서 날짜만 적으면 그 하루 전체"], ["data-footer", "today reset cancel apply | none", "단일: today apply · 기간: apply", "none 이면 고르는 순간 적용"], ["data-calendars", "1 | 2", "기간 2", "기간 달력 수. 767px 이하 1"], ["data-presets", "\"7 30\"", "—", "기간 프리셋(최근 N일). 누르는 즉시 확정한다(적용 버튼과 별개). min/max 밖이면 비활성"], ["data-default-preset", "N", "—", "값이 없으면 오늘 기준 최근 N일을 처음 값으로(기간)"], ["data-today", "YYYY-MM-DD", "오늘", "정적 데모용"], [".sm / .lg", "size", "md", "필드 높이 32 / 40 / 48"], ["disabled / readonly", "attribute", "—", "input 과 .cal-btn 에. 읽기 전용은 값만 보이고 달력을 열지 않는다"], ["↑ ↓ · Alt+↓ · Enter", "keyboard", "—", "입력에서: 커서 조각 ±1(min/max 무시) · 달력 열기 · 검사와 확정"], [".calendar", "popover", "—", ".cal-head(.cal-nav · .cal-title) + .cal-grid[role=grid](.cal-week ×주 수 · .day 주 수×7, 28–42) + .cal-foot. 두 달은 .two > .cal-months > .cal-month ×2"], [".day.on · .start · .end · .in-range · .preview · .today · .muted", "state", "—", "선택 / 기간 양끝 / 사이 / 미리보기 / 오늘 / 다른 달"], [".cell.on · .in-range", "state", "—", "월 · 연 단위의 선택 / 기간 사이"], ["ds:date", "event", "—", "값이 바뀔 때. {value, date, text, validity} · 기간 {value:\"A ~ B\", start, end, date:{start, end}, text, validity, sides:{start, end}} — sides 는 쪽마다의 상태(empty · incomplete · invalid · min · max · valid)"]],
    spec: [["Size", "필드 32 · 40 · 48(Text Field 와 같다) · 기간 필드 최소 폭 300 · 달력 폭 296(두 달 606) · 패딩 20 · 헤더 아래 16 · 날짜 셀 높이 34 · 원 지름 34(선택 · 미리보기 끝 · 오늘 · hover · 누름 · 포커스) · 연/월 셀 40(둥근 사각형)"], ["Input", "YYYY. MM. DD — 숫자만 받아 끊어 채운다. 월 첫 자리 2~9 · 일 첫 자리 4~9 는 앞에 0. 시각은 HH:mm(:ss) — 시 첫 자리 3~9 · 분과 초 첫 자리 6~9 는 앞에 0"], ["Time", "달력 아래 12 · Time Picker sm(32 · 시계 버튼 28) · 칸 사이 12 · 기간 필드 최소 폭 410(초까지 450)"], ["Container", "달력 radius/lg 8 · shadow/2 · 기간 띠는 선택 원의 가운데까지 이어진다"], ["Label", "제목 16 SemiBold · 요일 12 SemiBold tertiary · 날짜 · 연/월 14 Regular(Label 1/Reading) · 필드 Label 1/Reading 14"], ["Focus", "입력 포커스와 달력이 열린 동안은 필드 링(테두리 brand 1px + 후광 4px, 오류 필드는 빨강) — 아이콘으로 열어도 같다. 달력 버튼에 Tab 으로만 오면 버튼 외곽선만"]],
    figma: { frame: "Date Picker", radius: "radius/lg", sizes: { sm: { h: 32 }, md: { h: 40 }, lg: { h: 48 }, calendar: { w: 296 }, day: { h: 34 }, cell: { h: 40 } }, variants: { single: {}, range: { band: "--surface-brand-subtle-strong", endpoint: "--surface-brand-primary" }, month: {}, year: {}, input: {}, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" }, error: { stroke: "--foreground-negative-primary", ring: "--line-negative-focus" }, disabled: { bg: "--surface-disable-primary", fg: "--foreground-disable-primary" } }, states: ["closed", "focused", "open", "selected", "range", "preview", "error", "disabled", "read-only"] },
  },


  /* ------------------------------------------------ Checkbox */
  "checkbox": {
    status: "ready", react: ["Checkbox","CheckboxGroup"], css: [".checkbox", ".checkbox-group"], borrows: [".t-label-1-normal", ".t-semibold", ".field", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "여러 항목 중 0개 이상을 고릅니다. 브라우저 기본 체크박스에 모양만 입혀서 키보드와 스크린 리더로도 그대로 씁니다.",
    choose: [
      ["언제 쓰는가", "저장하기 전까지 반영되지 않는 선택에 씁니다. 누르는 즉시 적용되면 <a href=\"#/components/switch\">Switch</a> 를 씁니다."],
      ["Placement", "폼 옵션, 테이블 행 선택"],
    ],
    principles: [
      ["전체 선택", "자식이 전부 선택이면 체크, 일부면 부분 선택, 하나도 없으면 해제입니다. 부분 선택에서 누르면 전부 선택합니다"],
      ["필수 그룹", "필수로 표시한 묶음은 하나 이상 골라야 합니다. 제출할 때 알리고, 고르면 바로 지웁니다. 지나가기만 하면 알리지 않고, 마지막 하나를 풀면 바로 알립니다"],
      ["라벨", "끝에 마침표를 찍지 않습니다. 선택하면 일어날 일을 긍정형으로 씁니다"],
      ["표의 행 선택", "행마다 '외부 USB 차단 선택' 처럼 다른 접근 이름을 줍니다. 전부 '선택' 이면 어느 행인지 들리지 않습니다"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "선택하지 않은 기본 상태입니다.", html: `<label class="checkbox"><input type="checkbox"><span>정책 배포 시 알림</span></label>` },
      { id: "state", group: "state", title: "State", desc: "Unchecked · Checked · Indeterminate · Disabled 네 가지입니다. Indeterminate 는 하위 항목 중 일부만 고른 부분 선택 상태입니다.", html: `
        ${cb("Unchecked")}
        ${cb("Checked", "checked")}
        ${cb("Indeterminate", 'class="mixed"')}
        ${cb("Disabled", "disabled")}
        ${cb("Disabled checked", "checked disabled")}`, react: `
        import { useState } from "react";
        export function AlertOption() {
          const [on, setOn] = useState(true);
          return (
            <label className="checkbox">
              <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} />
              <span>변경 시 관리자에게 알림</span>
            </label>
          );
        }` },
      { id: "desc", group: "variant", title: "With Description", desc: "라벨 아래 작은 글자로 선택의 결과를 설명합니다.", html: `
        <div class="checkbox-group">
          ${cb("정책 배포 시 알림", "checked", "배포가 완료되면 관리자 메일로 알립니다")}
          ${cb("주간 리포트 수신", "", "매주 월요일 09:00 에 발송")}
        </div>` },
      { id: "group", group: "variant", title: "Group", desc: "세로 배치가 기본이고, 짧은 항목은 가로로 놓습니다. 전체 선택은 Indeterminate 와 함께 씁니다.", html: `
        <div class="checkbox-group">
          ${cb("<b>전체 선택</b>", 'class="mixed"')}
          <div class="checkbox-group row" style="padding-left:24px">${cb("Critical", "checked")}${cb("High", "checked")}${cb("Medium")}${cb("Low")}${cb("Info")}</div>
        </div>` },
      { id: "form", group: "variant", title: "Required Group", desc: "폼 필드 안에 필수 체크박스 묶음을 둡니다. 저장을 누르면 첫 칸으로 포커스가 가고, 고르면 안내를 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><fieldset class="checkbox-group" data-required><legend class="t-label-1-normal t-semibold">알림 채널 <em>*</em></legend>${cb("이메일")}${cb("SMS")}${cb("콘솔 알림")}</fieldset><span class="help" aria-live="polite">하나 이상 선택합니다.</span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>`, layout: "tall top" },
    ],
    props: [[".checkbox", "label wrapper", "—", "input[type=checkbox] + span(라벨, small 설명)"], ["checked / disabled", "attribute", "—", "네이티브 상태"], [".mixed", "boolean", "false", "부분 선택 외형(JS indeterminate 대체)"], [".checkbox-group", "container", "—", "세로 12px 간격. .row 로 가로 24px. fieldset + legend 로 질문을 붙인다"], ["data-required", "attribute", "—", ".field 안 fieldset.checkbox-group — 하나 이상 골라야 한다(form[data-validate])"]],
    spec: [["Size", "박스 16 · 라벨 Label 1/Reading 14 · 클릭 영역 라벨 포함"], ["Container", "radius/sm 4 · line/neutral/primary 1.5px · 선택 brand"], ["Label", "Label 1/Reading 14 · 설명 12 Regular tertiary"]],
    figma: { frame: "Checkbox", radius: "radius/sm", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--line-neutral-primary" }, checked: { bg: "--surface-brand-primary" } }, states: ["unchecked", "checked", "indeterminate", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Chip */
  "chip": {
    status: "ready", react: ["Chip","ChipGroup"], css: [".chip", ".chip-group"], borrows: [".btn"],
    desc: "필터 조건이나 입력된 값을 작은 캡슐로 보여 줍니다. 고를 수 있는 Filter Chip 과 지울 수 있는 Input Chip 을 나눠 씁니다. 상태 표시는 Tag 를 씁니다.",
    choose: [
      ["언제 쓰는가", "Filter Chip 은 목록을 좁히는 조건에, Input Chip 은 사용자가 입력한 값에 씁니다. 상태나 분류를 보여 주기만 하면 <a href=\"#/components/tag\">Tag</a> 를 씁니다."],
      ["Placement", "검색 아래 필터 행, 입력 필드 안 값 목록"],
    ],
    principles: [
      ["넘칠 때", "한 줄을 넘으면 다음 줄로 내려갑니다. 남은 개수로 접지 않으므로 조건이 전부 보입니다"],
      ["필터 초기화", "필터 칩이 2개 이상이면 묶음 끝에 '필터 초기화'를 둡니다. 켜진 칩이 있을 때만 보이고, 누르면 포커스는 첫 칩으로 갑니다"],
      ["지운 뒤 포커스", "다음 칸으로, 없으면 앞 칸으로 옮깁니다. 칸이 하나도 남지 않으면 묶음 자신입니다"],
      ["긴 값", "값은 240px 에서 말줄임합니다. 지우기 버튼에 포커스가 오면 펼치고, 버튼 이름에 전체 값이 들어갑니다. 마우스로는 잘린 값에만 붙는 Tooltip 으로 전체를 봅니다. 브라우저 기본 말풍선은 쓰지 않습니다"],
      ["형태와 색", "형태는 회색 선의 Outline 과 회색 면의 Solid 둘이고, Outline 이 기본입니다. 고른 칩은 두 형태 모두 같은 진한 면입니다. 색은 제품 색 면의 brand 와 반전 면의 neutral 둘이고, brand 가 기본입니다. 색은 고른 모양만 바꾸므로 고르지 않은 칩은 둘 다 중립입니다. 입력값 칩은 고를 수 없어 형태만 받고 색은 중립입니다"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "선택하지 않은 기본 칩입니다.", html: `<button type="button" class="chip" aria-pressed="false">Critical</button>` },
      { id: "outline", group: "variant", title: "Outline", desc: "기본 형태입니다. 고르지 않은 칩은 회색 선, 고른 칩은 진한 면입니다. 위 줄은 기본 색인 brand 로 제품 색 면이고, 아래 줄은 neutral 로 반전 면입니다. 색은 고른 모양만 바꿉니다.", html: `
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="chip-group">
            <button type="button" class="chip on" aria-pressed="true">Critical</button>
            <button type="button" class="chip on" aria-pressed="true">High</button>
            <button type="button" class="chip" aria-pressed="false">Medium</button>
            <button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button>
          </div>
          <div class="chip-group">
            <button type="button" class="chip neutral on" aria-pressed="true">Windows</button>
            <button type="button" class="chip neutral on" aria-pressed="true">macOS</button>
            <button type="button" class="chip neutral" aria-pressed="false">Linux</button>
            <button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button>
          </div>
        </div>` },
      { id: "solid", group: "variant", title: "Solid", desc: "고르지 않은 칩은 선 없는 회색 면이고 크기는 Outline 과 같습니다. 고른 칩은 Outline 과 같은 진한 면입니다. 입력값 칩도 형태를 받지만 고를 수 없어 색은 중립입니다.", html: `
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="chip-group">
            <button type="button" class="chip solid on" aria-pressed="true">Critical</button>
            <button type="button" class="chip solid on" aria-pressed="true">High</button>
            <button type="button" class="chip solid" aria-pressed="false">Medium</button>
            <button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button>
          </div>
          <div class="chip-group">
            <button type="button" class="chip solid neutral on" aria-pressed="true">Windows</button>
            <button type="button" class="chip solid neutral on" aria-pressed="true">macOS</button>
            <button type="button" class="chip solid neutral" aria-pressed="false">Linux</button>
            <button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button>
          </div>
          <div class="chip-group">
            <span class="chip solid"><span class="lbl">10.0.1.5</span><button type="button" class="x" aria-label="10.0.1.5 제거">${I("x",10)}</button></span>
            <span class="chip solid"><span class="lbl">10.0.1.6</span><button type="button" class="x" aria-label="10.0.1.6 제거">${I("x",10)}</button></span>
            <button type="button" class="chip solid">${I("plus")}추가</button>
          </div>
        </div>` },
      { id: "filter", group: "variant", title: "Filter Chip", desc: "눌러서 켜고 끕니다. 묶음 끝의 필터 초기화는 켜진 칩이 있을 때만 보입니다. 고를 수 있는 칩은 체크 아이콘을 늘 두고 꺼진 동안 흐린 색으로 그립니다. 켜지면 색만 바뀌므로 폭이 흔들리지 않습니다.", html: `
        <div class="chip-group">
          <button type="button" class="chip on" aria-pressed="true">Critical</button>
          <button type="button" class="chip on" aria-pressed="true">High</button>
          <button type="button" class="chip" aria-pressed="false">Medium</button>
          <button type="button" class="chip" aria-pressed="false">Low</button>
          <button type="button" class="chip" aria-pressed="false">Info</button>
          <button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button>
        </div>`, react: `
        import { useState } from "react";
        import { Chip, ChipGroup } from "@jiran/ds-react";
        const LEVELS = ["Critical", "High", "Medium", "Low", "Info"];
        export function SeverityFilter() {
          const [sel, setSel] = useState<string[]>(["Critical", "High"]);
          const toggle = (l: string) => setSel(s => s.includes(l) ? s.filter(x => x !== l) : [...s, l]);
          return (
            <ChipGroup clearable={sel.length > 0} onClear={() => setSel([])}>
              {LEVELS.map(l => <Chip key={l} selected={sel.includes(l)} onSelectedChange={() => toggle(l)}>{l}</Chip>)}
            </ChipGroup>
          );
        }` },
      { id: "input", group: "variant", title: "Input Chip", desc: "IP · 태그 · 수신자처럼 입력된 값입니다. 지우기는 진짜 버튼이고 버튼 이름에 값이 들어갑니다. 지우면 다음 칸으로 포커스가 갑니다.", html: `
        <div class="chip-group">
          <span class="chip"><span class="lbl">10.0.0.12</span><button type="button" class="x" aria-label="10.0.0.12 제거">${I("x",10)}</button></span>
          <span class="chip"><span class="lbl">10.0.0.13</span><button type="button" class="x" aria-label="10.0.0.13 제거">${I("x",10)}</button></span>
          <span class="chip"><span class="lbl">192.168.1.0/24</span><button type="button" class="x" aria-label="192.168.1.0/24 제거">${I("x",10)}</button></span>
          <button type="button" class="chip">${I("plus")}추가</button>
        </div>` },
      { id: "size", group: "size", title: "Size / Disabled", desc: "크기와 비활성 칩입니다. 입력값 칩은 버튼이 아니어서 비활성을 따로 알리는 속성으로 끄고, 지우기 버튼은 함께 끕니다.", html: `
        <button type="button" class="chip sm on" aria-pressed="true">Small</button>
        <button type="button" class="chip on" aria-pressed="true">Default</button>
        <button type="button" class="chip" aria-pressed="false" disabled>Disabled</button>
        <span class="chip" aria-disabled="true"><span class="lbl">10.0.0.12</span><button type="button" class="x" aria-label="10.0.0.12 제거" disabled>${I("x",10)}</button></span>` },
      { id: "long", group: "variant", title: "Long Value", desc: "값은 240px 에서 말줄임합니다. 지우기 버튼에 포커스가 오면 펼쳐지고, 마우스는 잘린 값에만 붙는 Tooltip 으로 전체를 봅니다.", html: `
        <div class="chip-group">
          <span class="chip"><span class="lbl">security-audit-notification@corp.example.com</span><button type="button" class="x" aria-label="security-audit-notification@corp.example.com 제거">${I("x",10)}</button></span>
          <span class="chip"><span class="lbl">admin@example.com</span><button type="button" class="x" aria-label="admin@example.com 제거">${I("x",10)}</button></span>
        </div>` },
    ],
    props: [[".chip", "button | span", "—", "선택형은 button, 입력값은 span"], [".solid", "class", "—", "Solid 형태 — 고르지 않은 칩이 회색 면(surface/neutral/tertiary). 없으면 Outline(회색 선). 입력값 칩도 받는다"], [".neutral", "class", "—", "고른 칩의 색을 반전 면(surface/neutral/inverse)으로. 없으면 brand(제품 색 면). 고를 수 있는 칩(aria-pressed)에만"], [".on", "boolean", "false", "선택 상태 — 형태와 상관없이 진한 면 + 굵은 체크 + 글자 600. 고를 수 있는 칩에만"], [".lbl", "element", "—", "Input Chip 의 값. 240px 에서 말줄임"], [".x", "button", "—", "삭제 버튼(Input Chip · Combobox 다중 선택 항목). 면 없이 x 만, aria-label 에 값을 넣는다"], ["data-chip-reset", "attribute", "—", ".chip-group 끝 버튼 — 켜진 칩이 있을 때만 보이고 누르면 모두 끈다(ds:chip-reset)"], ["data-value", "attribute", "—", "칩의 값. 없으면 글자(입력값 칩은 .lbl)"], ["ds:chip-toggle", "event", "—", "필터 칩을 켜고 끄면 {selected, value}"], ["ds:chip-remove", "event", "—", "입력값 칩의 .x 를 누르면 {value}. 칩은 ds.js 가 지우고 포커스를 다음 칩으로"], ["size", "(md) | sm", "md", "높이 32 / 26"], ["disabled", "attribute", "—", "비활성. 입력값 칩(span)은 aria-disabled=\"true\""]],
    spec: [["Size", "높이 32 (sm 26) · padding 0 12"], ["Container", "radius/full · Outline line/neutral/primary · Solid surface/neutral/tertiary(선 투명) · hover secondary · 눌림 strong"], ["Selected", "두 형태 같음 — brand surface/brand/primary + brand-label · neutral surface/neutral/inverse + foreground/neutral/inverse · 글자 600 · 체크 14 선 2.5"], ["Label", "Caption 1 12"], ["Remove", "x 16 · 아이콘 10 · 면 없음 · foreground/neutral/secondary(hover primary)"]],
    figma: { frame: "Chip", radius: "radius/full", sizes: { md: { h: 32 }, sm: { h: 26 } }, variants: { filter: { stroke: "--line-neutral-primary" }, selected: { bg: "--surface-brand-primary", stroke: "--surface-brand-primary", fg: "--brand-label" }, input: {} }, states: ["default", "selected", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Radio Button */
  "radio-button": {
    status: "ready", react: ["Radio","RadioGroup"], css: [".radio", ".radio-group"], borrows: [".t-label-1-normal", ".t-semibold", ".card", ".field", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "여러 항목 중 정확히 하나를 고릅니다. 옵션이 5개를 넘으면 <a href=\"#/components/select\">Select</a> 를 씁니다.",
    choose: [
      ["언제 쓰는가", "2~5개 중 하나를 고르고 보기가 모두 보여야 할 때 씁니다. 6개 이상이면 <a href=\"#/components/select\">Select</a> 를, 고르는 즉시 보기만 바뀌면 <a href=\"#/components/select-button\">Select Button</a> 을 씁니다."],
      ["Placement", "폼의 배타 옵션, 설정의 동작 선택"],
    ],
    principles: [
      ["기본값", "가장 안전한 쪽을 미리 고릅니다. 보안 · 개인정보 · 결제가 걸린 고위험 옵션은 미리 선택하지 않습니다. 안전한 기본값이 없으면 비워 두고 필수로 받습니다"],
      ["순서", "가능성이 높은 것, 단순한 것, 위험이 낮은 것부터 놓습니다"],
      ["범위 옵션", "겹치거나 빠지는 구간이 없어야 합니다. 전부 나열할 수 없으면 '기타'를 둡니다"],
      ["필수 그룹", "필수로 표시한 묶음은 제출할 때 알리고, 고르면 바로 지웁니다"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "선택하지 않은 기본 상태입니다.", html: `<label class="radio"><input type="radio" name="rd"><span>표준 모드</span></label>` },
      { id: "state", group: "state", title: "State", html: `
        <label class="radio"><input type="radio" name="r1"><span>Unchecked</span></label>
        <label class="radio"><input type="radio" name="r1" checked><span>Checked</span></label>
        <label class="radio"><input type="radio" name="r2" disabled><span>Disabled</span></label>
        <label class="radio"><input type="radio" name="r3" checked disabled><span>Disabled checked</span></label>` },
      { id: "group", group: "variant", title: "Group", desc: "같은 그룹 이름으로 묶고 묶음 제목으로 질문을 붙입니다. 설명은 작은 글자로 둡니다.", html: `
        <fieldset class="radio-group">
          <legend class="t-label-1-normal t-semibold">탐지 시 동작</legend>
          <label class="radio"><input type="radio" name="act" checked><span>차단 후 알림<small>실행을 즉시 중단하고 관리자에게 알립니다</small></span></label>
          <label class="radio"><input type="radio" name="act"><span>알림만<small>기록과 알림만, 실행은 허용</small></span></label>
          <label class="radio"><input type="radio" name="act"><span>기록만</span></label>
        </fieldset>`, react: `
        import { useState } from "react";
        const ACTIONS = [["block", "차단 후 알림"], ["notify", "알림만"], ["log", "기록만"]];
        export function ActionRadio() {
          const [v, setV] = useState("block");
          return (
            <fieldset className="radio-group">
              <legend className="t-label-1-normal t-semibold">탐지 시 동작</legend>
              {ACTIONS.map(([k, label]) => (
                <label key={k} className="radio">
                  <input type="radio" name="act" value={k} checked={v === k} onChange={() => setV(k)} />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          );
        }` },
      { id: "card", group: "variant", title: "Card Radio", desc: "옵션마다 설명이 길거나 서로 비교해야 할 때 카드형을 씁니다.", html: `
        <div class="radio-group row">
          <label class="radio card"><input type="radio" name="plan" checked><span>표준 모드<small>권장. 알려진 위협 차단</small></span></label>
          <label class="radio card"><input type="radio" name="plan"><span>강화 모드<small>의심 행위까지 차단, 오탐 증가</small></span></label>
        </div>` },
      { id: "form", group: "variant", title: "Required Group", desc: "권한이 걸린 선택이라 미리 고르지 않았습니다. 저장을 누르면 첫 칸으로 포커스가 가고, 고르면 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><fieldset class="radio-group" data-required><legend class="t-label-1-normal t-semibold">격리 해제 권한 <em>*</em></legend>
            <label class="radio"><input type="radio" name="rf" required><span>보안 관리자만</span></label>
            <label class="radio"><input type="radio" name="rf" required><span>보안 · 운영 관리자</span></label>
            <label class="radio"><input type="radio" name="rf" required><span>모든 관리자</span></label>
          </fieldset><span class="help" aria-live="polite"></span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>`, layout: "tall top" },
    ],
    props: [[".radio", "label wrapper", "—", "input[type=radio] + span(라벨, small)"], ["name", "attribute", "—", "같은 그룹은 같은 name"], [".card", "boolean", "false", "카드형(보더 + 선택 시 brand). 최소 · 기준 폭 220 — 가로 묶음에서는 늘어나 줄을 채우고, 둘이 안 들어가면 한 장씩 줄바꿈한다"], [".radio-group", "container", "—", "세로 12px. .row 로 가로(자리에 안 들어가면 줄바꿈 — 줄 사이 12). fieldset + legend 로 질문을 붙인다"], ["data-required", "attribute", "—", ".field 안 fieldset.radio-group — 하나를 골라야 한다(form[data-validate])"]],
    spec: [["Size", "원 16 · 선택 내부 점 8"], ["Container", "radius/full · line/neutral/primary 1.5px"], ["Label", "Label 1/Reading 14 · 설명 12 Regular tertiary"]],
    figma: { frame: "Radio Button", radius: "radius/full", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--line-neutral-primary" }, checked: { stroke: "--surface-brand-primary" }, card: { stroke: "--line-neutral-secondary" } }, states: ["unchecked", "checked", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Switch */
  "switch": {
    status: "ready", react: ["Switch"], css: [".switch"], borrows: [".settings-section", ".setting"],
    desc: "설정을 켜고 끕니다. 토글 즉시 적용되며 저장 버튼이 없습니다. 저장이 필요한 폼 안에서는 Checkbox 를 씁니다.",
    choose: [
      ["언제 쓰는가", "누르면 바로 적용되는 켜기와 끄기에 씁니다. 저장 버튼이 있는 폼에서는 <a href=\"#/components/checkbox\">Checkbox</a> 를 씁니다."],
      ["Placement", "설정 행 우측 끝, 테이블 '사용' 열"],
    ],
    principles: [
      ["언제 바뀌는가", "서버를 거치면 응답을 받은 뒤에 바뀝니다. 보안 설정이 실제와 다르게 보이는 순간을 만들지 않습니다"],
      ["처리 중", "노브에 스피너를 띄우고 다시 누를 수 없게 막습니다. 포커스는 그 자리에 남습니다"],
      ["실패", "상태를 바꾸지 않고 이유를 닫을 때까지 남는 Toast 로 알립니다"],
      ["보안 기능을 끌 때", "<a href=\"#/foundations/interaction\">Interaction</a> 의 위험 동작 표대로 Popup 으로 확인한 뒤 처리합니다. 취소하면 조용히 그대로 둡니다"],
      ["라벨", "켜짐 · 꺼짐에 따라 바꾸지 않습니다. 상태를 말하지 않고 '실시간 보호' 처럼 켜지는 대상을 씁니다"],
      ["비활성", "왜 바꿀 수 없는지 설명 자리에 적습니다. 비활성 요소에는 Tooltip 을 달지 않습니다"],
      ["표 안", "'사용' 열의 Switch 는 '외부 USB 차단 사용' 처럼 행마다 다른 접근 이름을 줍니다"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "꺼진 기본 상태입니다.", html: `<label class="switch"><input type="checkbox" role="switch"><span>실시간 보호</span></label>` },
      { id: "state", group: "state", title: "State", desc: "상태는 Off · On · Disabled 세 가지입니다.", html: `
        <label class="switch"><input type="checkbox" role="switch"><span>Off</span></label>
        <label class="switch"><input type="checkbox" role="switch" checked><span>On</span></label>
        <label class="switch"><input type="checkbox" role="switch" disabled><span>Disabled</span></label>
        <label class="switch"><input type="checkbox" role="switch" checked disabled><span>Disabled on</span></label>`, react: `
        import { useState } from "react";
        export function RealtimeSwitch() {
          const [on, setOn] = useState(true);
          return (
            <label className="switch">
              <input type="checkbox" role="switch" checked={on} onChange={e => setOn(e.target.checked)} />
              <span>실시간 보호</span>
            </label>
          );
        }` },
      { id: "async", group: "state", title: "Busy / Failed", desc: "응답을 기다리는 Switch 는 눌러도 바로 바뀌지 않고 처리 중이 됩니다. 제품이 응답에 따라 반영하거나, 실패 문구를 알리거나, 취소합니다. 이 예제의 첫 Switch 는 0.9초 뒤 응답하고, 둘째는 실패를 보여 줍니다.", html: `
        <label class="switch" data-async><input type="checkbox" role="switch" checked><span>실시간 보호</span></label>
        <label class="switch" data-async data-demo-fail><input type="checkbox" role="switch"><span>USB 자동 검사</span></label>
        <label class="switch" data-async><input type="checkbox" role="switch" checked aria-busy="true" aria-disabled="true"><span>웹 필터</span></label>` },
      { id: "size", group: "size", title: "Size / Label Position", desc: "테이블 셀과 밀도 높은 목록에는 작은 크기를 씁니다. 설정 행에서는 라벨을 왼쪽에 둡니다.", html: `
        <label class="switch sm"><input type="checkbox" role="switch" checked><span>Small</span></label>
        <label class="switch label-left"><input type="checkbox" role="switch" checked><span>라벨 왼쪽</span></label>` },
      { id: "settings", group: "variant", title: "In Settings", desc: "정책 설정 행입니다. 라벨과 설명은 왼쪽, 스위치는 오른쪽 끝에 둡니다. 바꿀 수 없으면 이유를 설명 자리에 적습니다.", html: `
        <div class="settings-section" style="max-width:560px">
          <div class="setting"><div class="info"><b>실시간 보호</b><span>파일 실행 시 즉시 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="실시간 보호"></label></div></div>
          <div class="setting"><div class="info"><b>USB 자동 검사</b><span>연결된 저장장치를 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" aria-label="USB 자동 검사"></label></div></div>
          <div class="setting"><div class="info"><b>원격 제어</b><span>보안 관리자만 바꿀 수 있습니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" disabled aria-label="원격 제어"></label></div></div>
        </div>`, layout: "left" },
    ],
    props: [[".switch", "label wrapper", "—", "input[type=checkbox][role=switch] + span"], ["checked / disabled", "attribute", "—", "네이티브 상태"], ["size", "(md) | sm", "md", "44×24 / 36×20"], [".label-left", "boolean", "false", "라벨을 왼쪽에"], ["data-async", "attribute", "—", "응답 후 반영. 눌러도 바뀌지 않고 처리 중이 되며 ds:switch 를 낸다 — 제품이 resolve() · reject(문구) · cancel() 중 하나를 불러야 끝난다"], ["aria-busy", "attribute", "—", "처리 중(ds.js 가 넣는다). 노브 스피너, 조작 막음"]],
    spec: [["Size", "트랙 44×24 (sm 36×20) · 노브 20"], ["Container", "radius/full · off line/neutral/primary · on brand"], ["Label", "Label 1/Reading 14"]],
    figma: { frame: "Switch", radius: "radius/full", sizes: { md: { w: 44, h: 24 }, sm: { w: 36, h: 20 } }, variants: { off: { bg: "--line-neutral-primary" }, on: { bg: "--surface-brand-primary" } }, states: ["off", "on", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Tag */
  "tag": {
    status: "ready", react: ["Tag","TagGroup"], css: [".tag", ".tag-group", ".tag-more"], borrows: [".tooltip-wrap", ".tooltip", ".tbl-wrap", ".tbl"],
    desc: "상태 · 분류 · 심각도를 짧게 표시합니다. 색만이 아니라 라벨 글자로도 뜻을 전합니다.",
    choose: [
      ["언제 쓰는가", "상태나 분류, 심각도를 읽기만 하도록 보여 줄 때 씁니다. 사용자가 누르거나 지울 수 있어야 하면 <a href=\"#/components/chip\">Chip</a> 을, 건수를 보여 줄 때는 <a href=\"#/components/indicator\">Indicator</a> 를 씁니다."],
      ["Placement", "테이블 셀, 카드 헤더, 상세 패널 제목 옆"],
    ],
    principles: [
      ["톤", "의미 색은 정해진 심각도 · 상태 어휘에만 씁니다. 사용자가 만든 라벨은 중립이나 강조색으로 씁니다."],
      ["색", "색은 옅은 틴트 면과 같은 색상의 진한 글자가 나릅니다. 점은 기본으로 없고 필요할 때만 켭니다. 라벨 글자가 늘 등급 이름이라 색만으로 뜻을 전하지 않습니다."],
      ["라벨", "1~2단어로 씁니다. 사용자가 짓는 라벨은 입력할 때 글자 수를 제한합니다. 폭 160px 을 넘으면 자르지 않고 줄바꿈합니다. Tag 는 포커스를 받지 않으므로 잘라 내면 읽을 길이 없습니다."],
      ["누를 수 없음", "Tag 는 표시 전용입니다. 선택 · 삭제는 Chip 을 씁니다."],
      ["여러 개", "표 칸에서는 앞 2개와 남은 개수 '+N' 을 보이고, 나머지는 Tooltip 으로 보여 줍니다. '+N' 은 포커스를 받는 버튼입니다. 표 밖에서는 줄바꿈해 전부 보입니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "의미 색을 지정하지 않은 중립 태그입니다.", html: `<span class="tag">Tag</span>` },
      { id: "severity", group: "variant", title: "Severity", desc: "위협 심각도 5단계입니다. Critical 은 빨강, High 는 주황, Medium 은 라이트 블루, Low 는 라임, Info 는 중립입니다. 글자는 틴트와 같은 색상의 진한 톤이고 점은 없습니다.", html: `
        <span class="tag critical">Critical</span>
        <span class="tag high">High</span>
        <span class="tag medium">Medium</span>
        <span class="tag low">Low</span>
        <span class="tag info">Info</span>
        ` },
      { id: "status", group: "variant", title: "Status", desc: "작업 · 시스템 상태입니다. 성공은 초록, 실패는 High 와 같은 주황, 그 밖은 중립입니다. 대기는 청록이고 심각도 Medium 과 색을 나눠 쓰지 않습니다.", html: `
        <span class="tag ok">승인</span>
        <span class="tag pending">검토 대기</span>
        <span class="tag high">반려</span>
        <span class="tag">보관</span>
        <span class="tag accent">신규</span>` },
      { id: "style", group: "variant", title: "Style", desc: "Outline · Solid · Dot 입니다. Solid 는 강조할 때 씁니다. Dot 은 글자 앞에 점을 더하는 선택 사항입니다.", html: `
        <span class="tag critical outline">Critical</span>
        <span class="tag medium outline">Medium</span>
        <span class="tag critical solid">Critical</span>
        <span class="tag ok solid">정상</span>
        <span class="tag critical dot">Critical</span>
        <span class="tag ok dot">정상</span>` },
      { id: "size", group: "size", title: "Size", desc: "작은 크기는 밀도 높은 표 칸에, 큰 크기는 상세 패널 제목 옆에 씁니다.", html: `
        <span class="tag high sm">High</span>
        <span class="tag high">High</span>
        <span class="tag high lg">High</span>` },
      { id: "group", group: "variant", title: "Group", desc: "표 밖에서는 줄바꿈해 전부 보입니다. 사용자가 만든 라벨은 중립이나 강조색으로 씁니다.", html: `
        <div class="tag-group" style="max-width:240px"><span class="tag">내부망</span><span class="tag">재택 근무</span><span class="tag">외부 협력사</span><span class="tag">서버실</span><span class="tag">임원</span><span class="tag accent">신규</span></div>` },
      { id: "table", group: "variant", title: "In Table", desc: "표 칸에서는 행 높이를 지키려고 앞 2개와 '+N' 만 보입니다. 키보드로 '+N' 에 오면 나머지가 Tooltip 으로 뜹니다.", html: `
        <div class="tbl-wrap" style="max-width:480px"><table class="tbl compact"><thead><tr><th>정책</th><th>분류</th></tr></thead><tbody>
          <tr><td>외부 USB 차단</td><td><div class="tag-group"><span class="tag">내부망</span><span class="tag">재택 근무</span><span class="tooltip-wrap"><button type="button" class="tag tag-more" aria-label="분류 3개 더 보기" aria-describedby="tm-1">+3</button><span class="tooltip" role="tooltip" id="tm-1">외부 협력사, 서버실, 임원</span></span></div></td></tr>
          <tr><td>웹 필터 기본</td><td><div class="tag-group"><span class="tag">전사</span></div></td></tr>
        </tbody></table></div>` },
    ],
    props: [[".tag-group", "container", "—", "여러 개를 묶음. 표 밖 줄바꿈, 표 칸 한 줄. React TagGroup max 는 앞 n개 + +N"], [".tag-more", "button", "—", "표 칸의 +N. .tooltip-wrap 안에 두고 나머지를 Tooltip 으로"], ["tone", "critical | high | medium | low | info | ok | pending | accent | (neutral)", "neutral", "의미별 색. 심각도 5단계는 critical · high · medium · low · info, pending 은 상태 톤(검토 대기)입니다. 바탕은 틴트(<code>--surface-{negative|cautionary|…}-primary</code>)이고 <b>글자는 같은 색상의 진한 톤</b>(<code>--foreground-{negative|cautionary|accent-light-blue|accent-lime|accent-cyan|positive}-heavy</code> · info 는 neutral-secondary · accent 는 brand-primary)입니다. <code>.solid</code> 는 한 단계 강한 틴트 + 테두리입니다(기준 토큰에 솔리드 상태 면이 없습니다). 라벨 색을 직접 지정하지 마세요"], ["style", ".outline | .solid", "subtle", "아웃라인 / 채움"], [".dot", "boolean", "false", "글자 앞 점(등급 색). 기본은 점 없음 — 옛 <code>.plain</code> 은 없어졌습니다"], ["size", "sm | (md) | lg", "md", "글자 sm 11 · md 12 · lg 13, 높이 18 / 24 / 30. 모서리는 sm radius/sm · 나머지 radius/md"]],
    spec: [["Max width", "160 — 넘으면 줄바꿈(잘라 내지 않음)"], ["Size", "높이 24 (sm 18 · lg 30) · padding 4/6 (sm 2/4 · lg 6/8)"], ["Container", "radius/md (sm radius/sm) · 기본형은 <code>--surface-{…}-primary</code> 틴트 8%(중립 surface/neutral/tertiary · Info surface/neutral/secondary), <code>.outline</code> 은 면 없이 그 톤의 <code>--line-{…}</code> 테두리(중립 · Info 는 line/neutral/primary), <code>.solid</code> 는 같은 틴트 + <code>--line-{…}</code> 테두리(Critical 만 <code>--surface-negative-strong</code>)"], ["Label", "Caption 1 12 SemiBold (sm 은 Caption 2 11 · lg 는 Label 2 13) · 같은 색상의 진한 톤 <code>--foreground-*-heavy</code>(라이트 30 · Low 20 / 다크 60) · 점은 <code>.dot</code> 일 때만 6"]],
    figma: { frame: "Tag", radius: "radius/md", sizes: { sm: { h: 18 }, md: { h: 24 }, lg: { h: 30 } }, variants: { critical: { bg: "--surface-negative-primary", fg: "--foreground-negative-strong", solidBg: "--surface-negative-strong", solidFg: "--foreground-negative-heavy" }, high: { bg: "--surface-cautionary-primary", fg: "--foreground-cautionary-primary", solidBg: "--surface-cautionary-primary", solidFg: "--foreground-cautionary-heavy" }, medium: { bg: "--surface-accent-light-blue", fg: "--foreground-accent-light-blue", solidBg: "--surface-accent-light-blue", solidFg: "--foreground-accent-light-blue-heavy" }, low: { bg: "--surface-accent-lime", fg: "--foreground-accent-lime", solidBg: "--surface-accent-lime", solidFg: "--foreground-accent-lime-heavy" }, info: { bg: "--surface-neutral-secondary", fg: "--foreground-inactive-primary", solidBg: "--surface-neutral-secondary", solidFg: "--foreground-neutral-secondary" }, pending: { bg: "--surface-accent-cyan", fg: "--foreground-accent-cyan", solidBg: "--surface-accent-cyan", solidFg: "--foreground-accent-cyan-heavy" }, ok: { bg: "--surface-positive-primary", fg: "--foreground-positive-primary", solidBg: "--surface-positive-primary", solidFg: "--foreground-positive-heavy" }, accent: { bg: "--surface-brand-subtle", fg: "--foreground-brand-primary", solidBg: "--surface-brand-primary", solidFg: "--brand-label" }, neutral: { bg: "--surface-neutral-tertiary", fg: "--foreground-inactive-primary", solidBg: "--surface-neutral-tertiary", solidFg: "--foreground-neutral-primary" } }, states: ["subtle", "outline", "solid"] },
  },

  /* ------------------------------------------------ Dropdown (액션 메뉴) · Select (값 선택) — 같은 .dropdown CSS 를 쓰지만 용도가 달라 페이지를 나눈다 */
  "dropdown": {
    status: "ready", react: ["Dropdown","DropdownTrigger","Menu","MenuItem","MenuSep","MenuLabel","MenuCheckboxItem","MenuRadioGroup","MenuRadioItem","MenuGroup","MenuActionArea"], css: [".dropdown", ".menu", ".menu-item", ".menu-sep", ".menu-label", ".menu-mark", ".menu-text", ".menu-desc", ".menu-group", ".menu-items", ".menu-actions"], borrows: [".btn", ".btn-group", ".tooltip-wrap", ".tooltip"],
    desc: "⋯ 버튼 같은 트리거에서 <b>실행할 동작</b>이나 <b>화면의 보기 설정</b>을 모아 보여 줍니다. 폼 · 필터의 값을 고를 때는 <a href=\"#/components/select\">Select</a> 를 씁니다.",
    choose: [
      ["언제 쓰는가", "실행할 동작이나 켜고 끄는 보기 설정이 3~15개일 때 씁니다. 1~2개라면 버튼으로 바로 보이게 두고, 16개를 넘으면 별도 화면으로 옮깁니다. 고른 값을 필드에 보여야 하는 자리에는 <a href=\"#/components/select\">Select</a> 를 씁니다."],
      ["Placement", "테이블 행 액션·카드 헤더의 우측 정렬 메뉴 · 아래 공간이 모자라면 위로 뒤집어 연다 · 스크롤 영역 안이면 화면 기준으로 띄운다"],
    ],
    principles: {
      "항목": [
        ["항목 글", "동작은 '편집' · '내보내기' 처럼 동사로, 이동은 '감사 로그' 처럼 명사로, 보기 설정은 '숨긴 이벤트 보기' 처럼 켰을 때의 모습으로 씁니다"],
        ["항목 수", "실행 · 체크 · 라디오 항목을 모두 합쳐 3~15개입니다"],
        ["위험 항목", "맨 아래, 구분선 뒤에 둡니다. 되돌리기 어려우면 <a href=\"#/foundations/interaction\">Interaction</a> 의 위험 동작 표대로 Popup 으로 확인합니다"],
        ["이동 항목", "다른 화면으로 가는 항목은 진짜 링크로 만듭니다. 그래서 새 탭 열기와 주소 복사가 됩니다"],
        ["비활성 항목", "권한 때문에 못 쓰는 항목은 비활성으로 두고, 항목 안 보조 글에 이유를 적습니다"],
      ],
      "선택 항목": [
        ["체크 · 라디오 항목", "실행 항목에는 선택 표시가 없습니다. 켜고 끄는 보기 설정은 체크 항목으로, 여럿 중 하나를 고르는 설정은 라디오 묶음으로 둡니다. 고르는 동안 메뉴는 열려 있습니다. 폼 · 필터의 값처럼 고른 값을 필드에 보여야 하면 Select 를 씁니다"],
        ["그룹", "라디오 항목은 늘 이름 있는 그룹 안에 둡니다. 성격이 다른 설정은 그룹 제목으로 나눕니다"],
        ["설명", "이름만으로 결과를 알기 어려운 항목에만 한 줄 설명을 붙입니다. 모든 항목에 붙이지 않습니다"],
        ["적용 영역", "여러 설정을 한꺼번에 바꾸고 결과를 다시 불러와야 할 때만 아래에 초기화와 적용을 둡니다. 적용하기 전에는 아무것도 바뀌지 않고, 적용하지 않고 닫으면 열기 전으로 돌아갑니다. 실행 항목과 섞지 않습니다"],
      ],
      "자리 · 키보드": [
        ["표의 행 동작", "1~2개면 버튼으로, 3개 이상이면 ⋯ 로 묶습니다. 스크롤 영역 안의 메뉴는 화면 기준으로 띄워 잘리지 않고, 스크롤하면 닫힙니다"],
        ["하위 메뉴", "만들지 않습니다. 항목이 많으면 그룹 제목으로 나누거나 화면으로 옮깁니다"],
        ["키보드", "열면 첫 항목으로 포커스가 갑니다. ↑↓ Home End 로 옮기고, 글자를 치면 그 글자로 시작하는 항목으로 갑니다. Enter · Space 는 실행하거나 켜고 끕니다. Esc 는 닫고 트리거로, Tab 은 닫고 다음 칸으로 갑니다. 적용 영역이 있으면 Tab 은 초기화와 적용을 거쳐 닫습니다"],
      ],
    },
    examples: [
      { id: "default", group: "default", title: "Default", desc: "닫힌 기본 상태입니다. ⋯ 버튼을 누르면 동작 목록이 열립니다.", html: `
        <div class="dropdown">
          <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button><span class="tooltip" role="tooltip">더 보기</span></span>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("copy")}복제</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
          </ul>
        </div>` },
      { id: "menu", group: "variant", title: "Action Menu", desc: "⋯ 버튼에서 여는 동작 목록입니다. 그룹 라벨과 구분선, 위험한 동작을 함께 보여 줍니다.", html: `
        <div class="dropdown open">
          <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button><span class="tooltip" role="tooltip">더 보기</span></span>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-label">정책</li>
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "states", group: "state", title: "Item States", desc: "기본 · 위험 · 비활성 항목입니다. 아이콘은 기본 항목에서 흐린 색이고, 위험 · 비활성 항목에서는 글자색을 따릅니다.", html: `
        <div class="dropdown open">
          <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button><span class="tooltip" role="tooltip">더 보기</span></span>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
            <li class="menu-item" role="menuitem" aria-disabled="true">${I("share")}공유<span class="hint">권한 없음</span></li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "disabled", group: "state", title: "Disabled", desc: "권한이 없어 열 수 없는 상태입니다.", html: `
        <div class="dropdown"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false" disabled>${I("dots")}</button></div>` },
      { id: "links", group: "variant", title: "Link Items", desc: "다른 화면으로 가는 항목은 진짜 링크로 만듭니다. 새 탭으로 열거나 주소를 복사할 수 있습니다.", html: `
        <div class="dropdown">
          <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button><span class="tooltip" role="tooltip">더 보기</span></span>
          <ul class="menu" role="menu">
            <li role="none"><a class="menu-item" role="menuitem" href="#">정책 상세</a></li>
            <li role="none"><a class="menu-item" role="menuitem" href="#">감사 로그</a></li>
            <li class="menu-item" role="menuitem">복제</li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">삭제</li>
          </ul>
        </div>`, layout: "tall top" },
      { id: "checkbox", group: "variant", title: "Checkbox Items", desc: "화면의 보기를 켜고 끄는 설정입니다. 누를 때마다 바로 반영되고 메뉴는 열린 채로 남아 여러 개를 이어서 바꿀 수 있습니다.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive" aria-haspopup="menu" aria-expanded="true">${I("eye")}보기</button>
          <ul class="menu" role="menu" aria-label="보기">
            <li class="menu-item" role="menuitemcheckbox" aria-checked="false" data-value="hidden"><span class="menu-mark check" aria-hidden="true"></span>숨긴 이벤트 보기</li>
            <li class="menu-item" role="menuitemcheckbox" aria-checked="true" data-value="utc"><span class="menu-mark check" aria-hidden="true"></span>시간을 UTC 로 보기</li>
            <li class="menu-item" role="menuitemcheckbox" aria-checked="true" data-value="refresh"><span class="menu-mark check" aria-hidden="true"></span>자동 새로 고침</li>
          </ul>
        </div>`, layout: "tall top" },
      { id: "radio", group: "variant", title: "Radio Items", desc: "여럿 중 하나를 고르는 설정은 라디오 묶음으로 둡니다. 묶음에는 늘 이름이 있습니다.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive" aria-haspopup="menu" aria-expanded="true">${I("arrows-sort")}정렬</button>
          <ul class="menu" role="menu" aria-label="정렬">
            <li class="menu-group" role="none"><span class="menu-label" id="dd-sort-label">정렬 기준</span>
              <ul role="group" aria-labelledby="dd-sort-label" data-name="sort">
                <li class="menu-item" role="menuitemradio" aria-checked="true" data-value="latest"><span class="menu-mark round" aria-hidden="true"></span>최신순</li>
                <li class="menu-item" role="menuitemradio" aria-checked="false" data-value="oldest"><span class="menu-mark round" aria-hidden="true"></span>오래된순</li>
                <li class="menu-item" role="menuitemradio" aria-checked="false" data-value="severity"><span class="menu-mark round" aria-hidden="true"></span>심각도순</li>
              </ul>
            </li>
          </ul>
        </div>`, layout: "tall top" },
      { id: "groups", group: "variant", title: "Groups & Description", desc: "성격이 다른 설정은 그룹 제목으로 나눕니다. 이름만으로 결과를 알기 어려운 항목에만 한 줄 설명을 붙입니다.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive" aria-haspopup="menu" aria-expanded="true">${I("adjustments")}보기 설정</button>
          <ul class="menu" role="menu" aria-label="보기 설정">
            <li class="menu-group" role="none"><span class="menu-label" id="dd-den-label">밀도</span>
              <ul role="group" aria-labelledby="dd-den-label" data-name="density">
                <li class="menu-item" role="menuitemradio" aria-checked="true" data-value="default"><span class="menu-mark round" aria-hidden="true"></span>기본</li>
                <li class="menu-item" role="menuitemradio" aria-checked="false" data-value="compact"><span class="menu-mark round" aria-hidden="true"></span><span class="menu-text"><span class="menu-name">좁게</span><span class="menu-desc">한 화면에 행을 더 많이 보여 줍니다</span></span></li>
              </ul>
            </li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-group" role="none"><span class="menu-label" id="dd-show-label">표시</span>
              <ul role="group" aria-labelledby="dd-show-label" data-name="show">
                <li class="menu-item" role="menuitemcheckbox" aria-checked="false" data-value="hidden"><span class="menu-mark check" aria-hidden="true"></span><span class="menu-text"><span class="menu-name">숨긴 이벤트 보기</span><span class="menu-desc">예외로 처리한 이벤트도 목록에 둡니다</span></span></li>
                <li class="menu-item" role="menuitemcheckbox" aria-checked="true" data-value="group"><span class="menu-mark check" aria-hidden="true"></span>같은 이벤트 묶기</li>
              </ul>
            </li>
          </ul>
        </div>`, layout: "taller top" },
      { id: "actions", group: "variant", title: "Apply Actions", desc: "여러 설정을 한꺼번에 바꾸고 결과를 다시 불러와야 할 때만 아래에 초기화와 적용을 둡니다. 적용하기 전에는 아무것도 바뀌지 않고, 적용하지 않고 닫으면 열기 전으로 돌아갑니다.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive" aria-haspopup="menu" aria-expanded="true">${I("filter")}필터</button>
          <div class="menu" data-actions role="presentation">
            <ul class="menu-items" role="menu" aria-label="필터">
              <li class="menu-group" role="none"><span class="menu-label" id="dd-st-label">처리 결과</span>
                <ul role="group" aria-labelledby="dd-st-label" data-name="result">
                  <li class="menu-item" role="menuitemcheckbox" aria-checked="true" data-value="blocked"><span class="menu-mark check" aria-hidden="true"></span>차단</li>
                  <li class="menu-item" role="menuitemcheckbox" aria-checked="false" data-value="allowed"><span class="menu-mark check" aria-hidden="true"></span>허용</li>
                  <li class="menu-item" role="menuitemcheckbox" aria-checked="true" data-value="pending"><span class="menu-mark check" aria-hidden="true"></span>검토 대기</li>
                </ul>
              </li>
              <li class="menu-sep" role="separator"></li>
              <li class="menu-group" role="none"><span class="menu-label" id="dd-pd-label">기간</span>
                <ul role="group" aria-labelledby="dd-pd-label" data-name="period">
                  <li class="menu-item" role="menuitemradio" aria-checked="false" data-value="1d"><span class="menu-mark round" aria-hidden="true"></span>오늘</li>
                  <li class="menu-item" role="menuitemradio" aria-checked="true" data-value="7d" data-default><span class="menu-mark round" aria-hidden="true"></span>최근 7일</li>
                  <li class="menu-item" role="menuitemradio" aria-checked="false" data-value="30d"><span class="menu-mark round" aria-hidden="true"></span>최근 30일</li>
                </ul>
              </li>
            </ul>
            <div class="menu-actions btn-group"><button type="button" class="btn sm text assistive" data-menu-action="reset">초기화</button><button type="button" class="btn sm solid primary" data-menu-action="apply">적용</button></div>
          </div>
        </div>`, layout: "taller top" },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open. inline-block 이라 상자 높이가 놓인 곳의 글자 크기를 따른다(트리거 버튼 · 메뉴 항목 글자는 따로 정해져 있다)"], [".menu", "ul", "—", "role=menu. 우측 정렬은 left:auto;right:0"], [".menu-item", "li · a", "—", "role=menuitem. .danger 위험, aria-disabled 비활성, .hint 단축키 · 비활성 이유. 이동 항목은 li[role=none] 안에 a. 아이콘은 기본이 tertiary 이고 .danger · 비활성에서는 글자색을 따릅니다"], [".menu-sep / .menu-label", "li", "—", "구분선 / 그룹 라벨"], ["menuitemcheckbox · menuitemradio", "li role", "—", "켜고 끄는 항목 · 하나를 고르는 항목. 상태는 aria-checked, 맨 앞에 span.menu-mark.check · .round(aria-hidden). data-value 가 이벤트의 값. 누르면 메뉴는 열린 채"], [".menu-group", "li[role=none]", "—", "span.menu-label#id + ul[role=group][aria-labelledby][data-name]. 라디오 항목은 늘 이 안에. data-name 이 이벤트의 name"], [".menu-text > .menu-name + .menu-desc", "span", "—", "항목 이름 아래 한 줄 설명(12 tertiary). 글자로 찾기는 .menu-name 만 본다"], [".menu[data-actions]", "div", "—", "아래 초기화 · 적용 영역이 있는 메뉴. 안에 ul.menu-items[role=menu] + div.menu-actions.btn-group. 목록만 스크롤한다"], ["data-menu-action", "reset | apply", "—", ".menu-actions 안 버튼. 초기화는 체크를 끄고 라디오를 data-default(없으면 첫 항목)로 — 적용 전까지 초안"], ["ds:menu-change", "event", "—", "detail {name, value, checked, values, groups, trigger} — 체크 · 라디오가 바뀔 때(trigger toggle), 적용 영역이 있으면 적용할 때 한 번(trigger apply · name · value 는 null). values 는 켜진 값 전부, groups 는 이름별 값"]],
    spec: [["Size", "항목 높이 38(설명 줄이 있으면 54) · 메뉴 폭은 트리거 폭 이상에서 항목 글자에 맞추고, 설명 줄이 있으면 최대 320 · 표시 16 · 적용 영역 위 1px 선 · 버튼 sm"], ["Container", "radius/md 6 · shadow/2 · 트리거 아래 4px"], ["Label", "항목 Label 1/Reading 14 · 그룹 라벨 12 SemiBold uppercase tertiary · 힌트 12 tertiary"]],
    figma: { frame: "Dropdown", radius: "radius/md", sizes: { item: { h: 36 } }, variants: { menu: {} }, states: ["closed", "open", "disabled"] },
  },

  /* ------------------------------------------------ Select */
  "select": {
    status: "ready", react: ["Select"], css: [".dropdown", ".menu", ".menu-item", ".menu-state", ".menu-mark", ".menu-items", ".menu-actions"], borrows: [".field", ".help", ".spinner", ".btn", ".btn-group", ".form", ".form-legend", ".form-actions", ".menu-label"],
    desc: "옵션 목록을 열어 <b>하나를, 또는 여러 개를 고릅니다</b>. 옵션이 5개 이하이고 항상 보여야 하면 Radio · Select Button, 찾아서 고르거나 고른 값을 칩으로 보며 지워야 하면 <a href=\"#/components/combobox\">Combobox</a>, 고르는 것이 아니라 실행이면 <a href=\"#/components/dropdown\">Dropdown</a> 을 씁니다.",
    choose: [
      ["언제 쓰는가", "6개 이상의 보기에서 하나를 고르거나, 찾지 않고도 보이는 목록에서 여러 개를 고를 때 씁니다. 5개 이하이고 늘 보여야 하면 Radio Button 이나 Select Button 을, 찾아서 고르거나 고른 값을 칩으로 보고 지워야 하면 <a href=\"#/components/combobox\">Combobox</a> 를 씁니다."],
      ["Placement", "필터 툴바, 폼 안의 선택 필드 · 아래 공간이 모자라면 위로 뒤집어 연다"],
    ],
    principles: {
      "목록": [
      ["옵션 순서", "자주 쓰는 순서로 둡니다. 크기 · 기간처럼 순서가 있는 값은 작은 것부터, 그 밖에 기준이 없으면 가나다순입니다"],
      ["그룹", "그룹 라벨로 묶습니다. 모든 옵션이 그룹에 들어갈 때만 쓰고, 그룹이 하나뿐이면 쓰지 않습니다"],
      ["항목 글", "한 줄로 씁니다. 짧게 구별되도록 앞에 다른 낱말을 둡니다"],
      ["'전체' · '선택 안 함'", "하나를 고르는 필터에는 맨 위에 '전체'를, 필수가 아닌 폼 항목에는 맨 위에 '선택 안 함'을 둡니다. 여러 개 선택에는 두지 않습니다. '선택 안 함'을 고르면 값이 비워집니다. 필수 항목에는 두지 않습니다"],
      ],
      "동작": [
      ["목록 상태", "불러오는 중 · 실패 · 항목 없음을 메뉴 안 한 줄로 보여 줍니다. 실패하면 다시 시도 버튼을 함께 둡니다"],
      ["키보드", "닫힌 트리거에서 ↑↓ 로 엽니다. 열리면 ↑↓ Home End 로 옮기고, 글자를 치면 그 글자로 시작하는 항목으로 갑니다. 초성으로도 찾습니다. Tab 은 닫고 다음 칸으로 갑니다"],
      ["폼 안에서", "필드로 감싸면 필드 폭을 채우고, 필드 라벨이 Select 의 이름으로 읽힙니다. 필수로 두면 Text Field 와 같은 검증에 참여합니다"],
      ],
      "여러 개": [
      ["체크", "옵션 앞의 체크로 여러 개를 고릅니다. 고르는 동안 목록은 열린 채입니다. 트리거에는 고른 이름을 쉼표로 잇고 넘치면 말줄임하며, 모두 고르면 '전체' 처럼 한 낱말로 줄입니다. '전체' · '선택 안 함' 옵션은 두지 않습니다. 고른 값을 칩으로 보고 하나씩 지워야 하면 Combobox 를 씁니다"],
      ["적용 영역", "고른 값으로 결과를 다시 불러와야 하는 여러 개 선택에만 아래에 초기화와 적용을 둡니다. 적용하기 전에는 값이 바뀌지 않고, 적용하지 않고 닫으면 열기 전으로 돌아갑니다"],
      ],
    },
    examples: [
      { id: "default", group: "default", title: "Default", desc: "닫힌 기본 상태입니다. 고른 값이 없으면 트리거에 placeholder 를 둡니다. 항목이 8개를 넘으면 열린 목록은 최대 높이 320px 안에서 스크롤됩니다.", html: `
        <div class="dropdown">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button>
          <ul class="menu" role="listbox" aria-label="그룹">
            <li class="menu-item" role="option">전체</li>
            <li class="menu-item" role="option">영업팀</li>
            <li class="menu-item" role="option">개발팀</li>
            <li class="menu-item" role="option">인프라팀</li>
            <li class="menu-item" role="option">보안팀</li>
            <li class="menu-item" role="option">기획팀</li>
            <li class="menu-item" role="option">디자인팀</li>
            <li class="menu-item" role="option">QA팀</li>
            <li class="menu-item" role="option">고객지원팀</li>
            <li class="menu-item" role="option">재무팀</li>
            <li class="menu-item" role="option">인사팀</li>
            <li class="menu-item" role="option">법무팀</li>
          </ul>
        </div>`, layout: "top" },
      { id: "open", group: "state", title: "Open / Selected", desc: "닫힘과 열림을 나란히 둔 모습입니다. 열린 목록에서 고른 항목은 강조되고, 스크린 리더에도 선택된 항목으로 읽힙니다.", html: `
        <div class="dropdown">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button>
          <ul class="menu" role="listbox" aria-label="그룹">
            <li class="menu-item" role="option">전체</li>
            <li class="menu-item" role="option">영업팀</li>
            <li class="menu-item" role="option">개발팀</li>
            <li class="menu-item" role="option">인프라팀</li>
            <li class="menu-item" role="option" aria-disabled="true">외주(권한 없음)</li>
          </ul>
        </div>
        <div class="dropdown open">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="true">영업팀</button>
          <ul class="menu" role="listbox" aria-label="그룹">
            <li class="menu-item" role="option">전체</li>
            <li class="menu-item on" role="option" aria-selected="true">영업팀</li>
            <li class="menu-item" role="option">개발팀</li>
            <li class="menu-item" role="option">인프라팀</li>
            <li class="menu-item" role="option" aria-disabled="true">외주(권한 없음)</li>
          </ul>
        </div>`, layout: "tall top" },
      { id: "disabled", group: "state", title: "Disabled", desc: "권한이 없거나 선택할 값이 없는 상태입니다.", html: `
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" disabled><span class="placeholder">권한 없음</span></button></div>` },
      { id: "size", group: "size", title: "Size", desc: "작은 크기 32px · 기본 40px · 큰 크기 48px 로 Text Field · Button 과 같은 높이입니다. 크기를 정한 필드 안에서는 그 필드의 크기를 따릅니다.", html: `
        <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div class="dropdown sm"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button></div>
          <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button></div>
          <div class="dropdown lg"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button></div>
        </div>` },
      { id: "clear", group: "variant", title: "Clear Selection", desc: "필터에는 맨 위에 '전체'를 둡니다. 필수가 아닌 폼 항목에는 맨 위에 '선택 안 함'을 두고, 그것을 고르면 placeholder 로 돌아갑니다.", html: `
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">전체</button><ul class="menu" role="listbox" aria-label="심각도 필터"><li class="menu-item on" role="option" data-value="all" aria-selected="true">전체</li>${selItems([["Critical", "critical"], ["High", "high"], ["Medium", "medium"]])}</ul></div>
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">승인자 선택</span></button><ul class="menu" role="listbox" aria-label="승인자">${selItems([["선택 안 함", ""], ["김보안", "kim"], ["이인프라", "lee"], ["박개발", "park"]])}</ul></div>`, layout: "tall top" },
      { id: "states", group: "state", title: "List States", desc: "목록을 불러오는 동안, 불러오지 못했을 때, 고를 항목이 없을 때를 메뉴 안 한 줄로 보여 줍니다. 실패하면 다시 시도 버튼을 둡니다.", html: `${selOpen("불러오는 중", MENU_STATE.loading)}${selOpen("불러오기 실패", MENU_STATE.error)}${selOpen("항목 없음", MENU_STATE.empty)}`, layout: "tall top" },
      { id: "form", group: "variant", title: "In Form", desc: "고른 값은 폼과 함께 제출되고, 필수 항목은 Text Field 와 같은 검증에 참여합니다. 열었다가 고르지 않고 닫으면 오류를 알리고, 고르면 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label id="sel-f1-l">적용 그룹 <em>*</em></label><div class="dropdown" data-name="group" data-required><button type="button" id="sel-f1" class="trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="sel-f1-l sel-f1"><span class="placeholder">그룹 선택</span></button><ul class="menu" role="listbox" aria-label="적용 그룹">${selItems([["영업팀", "sales"], ["개발팀", "dev"], ["보안팀", "sec"]])}</ul><input type="hidden" name="group" value=""></div><span class="help" aria-live="polite"></span></div>
          <div class="field"><label id="sel-f2-l">승인자</label><div class="dropdown" data-name="approver"><button type="button" id="sel-f2" class="trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="sel-f2-l sel-f2"><span class="placeholder">승인자 선택</span></button><ul class="menu" role="listbox" aria-label="승인자">${selItems([["선택 안 함", ""], ["김보안", "kim"], ["이인프라", "lee"]])}</ul><input type="hidden" name="approver" value=""></div><span class="help" aria-live="polite"></span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">정책 저장</button></div>
        </form>`, layout: "tall top" },
      { id: "multiple", group: "variant", title: "Multiple", desc: "검색 없이 보이는 목록에서 여러 개를 고릅니다. 옵션을 누를 때마다 체크가 바뀌고 목록은 열린 채입니다. 트리거에는 고른 이름을 쉼표로 잇고, 넘치면 말줄임합니다.", html: `
        <div class="dropdown open" data-multiple data-name="teams">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="true" data-placeholder="그룹 선택"><span class="trigger-text">영업팀, 보안팀</span></button>
          <ul class="menu" role="listbox" aria-label="그룹" aria-multiselectable="true"><li class="menu-item" role="option" aria-selected="true" data-value="sales"><span class="menu-mark check" aria-hidden="true"></span>영업팀</li><li class="menu-item" role="option" aria-selected="false" data-value="dev"><span class="menu-mark check" aria-hidden="true"></span>개발팀</li><li class="menu-item" role="option" aria-selected="false" data-value="infra"><span class="menu-mark check" aria-hidden="true"></span>인프라팀</li><li class="menu-item" role="option" aria-selected="true" data-value="security"><span class="menu-mark check" aria-hidden="true"></span>보안팀</li><li class="menu-item" role="option" aria-selected="false" data-value="plan"><span class="menu-mark check" aria-hidden="true"></span>기획팀</li><li class="menu-item" role="option" aria-selected="false" data-value="design"><span class="menu-mark check" aria-hidden="true"></span>디자인팀</li></ul><input type="hidden" name="teams" value="sales"><input type="hidden" name="teams" value="security">
        </div>`, layout: "tall top" },
      { id: "multiple-apply", group: "variant", title: "Multiple + Apply", desc: "고른 값으로 목록을 다시 불러와야 하면 아래에 초기화와 적용을 둡니다. 적용해야 값이 바뀌고, 적용하지 않고 닫으면 열기 전으로 돌아갑니다.", html: `
        <div class="dropdown open" data-multiple data-name="teams">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="true" data-placeholder="그룹 선택"><span class="trigger-text">개발팀, 인프라팀</span></button>
          <div class="menu" data-actions role="presentation">
            <ul class="menu-items" role="listbox" aria-label="그룹" aria-multiselectable="true"><li class="menu-item" role="option" aria-selected="false" data-value="sales"><span class="menu-mark check" aria-hidden="true"></span>영업팀</li><li class="menu-item" role="option" aria-selected="true" data-value="dev"><span class="menu-mark check" aria-hidden="true"></span>개발팀</li><li class="menu-item" role="option" aria-selected="true" data-value="infra"><span class="menu-mark check" aria-hidden="true"></span>인프라팀</li><li class="menu-item" role="option" aria-selected="false" data-value="security"><span class="menu-mark check" aria-hidden="true"></span>보안팀</li><li class="menu-item" role="option" aria-selected="false" data-value="plan"><span class="menu-mark check" aria-hidden="true"></span>기획팀</li><li class="menu-item" role="option" aria-selected="false" data-value="design"><span class="menu-mark check" aria-hidden="true"></span>디자인팀</li></ul>
            <div class="menu-actions btn-group"><button type="button" class="btn sm text assistive" data-menu-action="reset">초기화</button><button type="button" class="btn sm solid primary" data-menu-action="apply">적용</button></div>
          </div><input type="hidden" name="teams" value="dev"><input type="hidden" name="teams" value="infra">
        </div>`, layout: "taller top" },
      { id: "all-selected", group: "variant", title: "All Selected", desc: "모두 고르면 이름을 늘어놓지 않고 '전체' 처럼 한 낱말로 줄입니다. 하나라도 빼면 다시 고른 이름을 보여 줍니다.", html: `
        <div class="dropdown" data-multiple data-name="teams" data-all-label="전체 그룹">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" data-placeholder="그룹 선택"><span class="trigger-text">전체 그룹</span></button>
          <ul class="menu" role="listbox" aria-label="그룹" aria-multiselectable="true"><li class="menu-item" role="option" aria-selected="true" data-value="sales"><span class="menu-mark check" aria-hidden="true"></span>영업팀</li><li class="menu-item" role="option" aria-selected="true" data-value="dev"><span class="menu-mark check" aria-hidden="true"></span>개발팀</li><li class="menu-item" role="option" aria-selected="true" data-value="infra"><span class="menu-mark check" aria-hidden="true"></span>인프라팀</li><li class="menu-item" role="option" aria-selected="true" data-value="security"><span class="menu-mark check" aria-hidden="true"></span>보안팀</li><li class="menu-item" role="option" aria-selected="true" data-value="plan"><span class="menu-mark check" aria-hidden="true"></span>기획팀</li><li class="menu-item" role="option" aria-selected="true" data-value="design"><span class="menu-mark check" aria-hidden="true"></span>디자인팀</li></ul><input type="hidden" name="teams" value="sales"><input type="hidden" name="teams" value="dev"><input type="hidden" name="teams" value="infra"><input type="hidden" name="teams" value="security"><input type="hidden" name="teams" value="plan"><input type="hidden" name="teams" value="design">
        </div>`, layout: "top" },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open. inline-block 이라 상자 높이가 놓인 곳의 글자 크기를 따른다 — 단독이면 앱 기본 글자, 입력 폼(.field) 안 14, .pagination-bar 안 12"], [".trigger", "button", "—", "고른 값을 표시. 값이 없으면 안에 .placeholder"], ["size", "sm | (md) | lg", "md", ".dropdown.sm · .lg — 트리거 높이 32 / 40 / 48. .field.sm · .lg 안에서는 필드 크기를 따른다. React size"], [".menu", "ul", "—", "role=listbox · aria-label 필수"], [".menu-item", "li", "—", "role=option. 고른 항목 .on + aria-selected, 비활성 aria-disabled. data-value 가 ds:select 의 값 — 빈 값은 '선택 안 함'"], [".menu-state", "li", "—", "role=presentation. 불러오는 중 · 실패 · 항목 없음"], ["data-name", "attr", "—", "제출할 이름 — 안의 input[type=hidden] 값을 고른 값으로"], ["data-required", "attr", "—", "form[data-validate] 안에서 필수 검사"], ["ds:select", "event", "—", "detail.value — 여러 개는 detail {values, trigger}(trigger toggle · apply)"], ["ds:retry", "event", "—", "목록 상태의 다시 시도"], ["data-multiple", "attr", "—", "여러 개 선택. ul.menu 에 aria-multiselectable=true, 옵션은 aria-selected(true | false) + 맨 앞 span.menu-mark.check. 트리거의 data-placeholder 가 빈 값 글, 고른 이름은 span.trigger-text. data-name 이면 값마다 숨은 input 하나"], ["data-all-label", "attr", "—", "여러 개에서 켤 수 있는 옵션을 모두 고르면 트리거에 이 글(예: 전체 그룹)"], ["data-overflow", "(ellipsis) | wrap", "—", "여러 개 트리거 글이 넘칠 때 — 기본은 한 줄 말줄임, wrap 이면 줄을 바꿔 트리거가 늘어난다. React overflow"], [".menu[data-actions]", "div", "—", "여러 개 아래 초기화 · 적용 — Dropdown 과 같은 구조(ul.menu-items[role=listbox] + div.menu-actions). 적용할 때 ds:select 한 번"]],
    spec: [["Size", "트리거 높이 sm 32 · md 40 · lg 48(= Text Field · Button) · 항목 높이 38 · 메뉴 폭은 트리거 폭 이상(항목 글자가 길면 글자에 맞춰 넓어짐) · 메뉴 최대 높이 320(약 8개, 넘으면 스크롤)"], ["Container", "radius/md 6 · shadow/2 · 트리거 아래 4px"], ["Label", "Label 1/Reading 14 · placeholder foreground/neutral/tertiary"]],
    figma: { frame: "Select", radius: "radius/md", sizes: { trigger: { h: 40 }, item: { h: 36 } }, variants: { select: {}, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" } }, states: ["closed", "focused", "open", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Combobox */
  "combobox": {
    status: "ready", react: ["Combobox"], css: [".combobox", ".menu-state"], borrows: [".menu", ".menu-item", ".menu-mark", ".field", ".help", ".chip", ".spinner", ".btn", ".sr-only", ".form", ".form-legend", ".form-actions"],
    desc: "입력해서 목록을 좁혀 <b>찾아 고르거나</b>, <b>여러 개를 칩으로 고릅니다</b>. 옵션이 적으면 하나든 여러 개든 <a href=\"#/components/select\">Select</a>, 자유 입력이면 <a href=\"#/components/text-field\">Text Field</a> 를 씁니다.",
    choose: [
      ["언제 쓰는가", "보기가 약 15개 이상으로 많아 찾아서 골라야 하거나, 고른 값을 칩으로 보며 하나씩 지워야 할 때 씁니다. 목록에 있는 값만 고르고 새 값을 만들지 않습니다."],
      ["Placement", "필터 툴바, 폼 안의 선택 필드 · 아래 공간이 모자라면 위로 뒤집어 연다"],
    ],
    principles: [
      ["필터", "입력한 글자가 들어 있는 항목만 남기고, 대소문자는 가리지 않습니다. 서버에서 찾을 때는 목록 거르기를 끄고, 입력이 멈추고 300ms 뒤에 오는 검색어 이벤트를 받아 제품이 결과를 채웁니다"],
      ["키보드", "포커스는 입력칸에 둡니다. ↑↓ 로 후보를 옮기고 Enter 로 고릅니다. Esc 는 목록을 닫고, 목록이 닫혀 있으면 바깥으로 넘깁니다. Home · End 는 글자 커서를 옮깁니다"],
      ["떠날 때", "고르지 않은 글자는 버리고 고른 값으로 되돌립니다. 하나 고르기에서 글자를 모두 지우고 떠나면 선택을 해제합니다"],
      ["여러 개", "고르면 태그가 되고 목록은 열린 채 검색어만 비웁니다. 목록의 고른 항목은 앞 체크로 보입니다. 태그는 ×, 또는 빈 입력에서 Backspace 로 지웁니다"],
      ["전체", "여러 개 고르기에서 모두 고르는 일이 잦으면 목록 맨 위에 '전체' 옵션을 둡니다. 고르면 고를 수 있는 모든 항목이 선택되고 항목마다 태그가 생깁니다. 모두 골라진 채 다시 고르면 모두 풉니다. 항목 하나를 풀면 '전체' 의 체크도 꺼집니다. 검색어를 치는 동안은 숨고, 제출하는 값에는 들지 않습니다"],
      ["태그가 넘칠 때", "기본은 필드 높이를 그대로 두고 태그 줄이 가로로 스크롤합니다. 입력칸은 늘 줄 끝에 보이고, 넘칠 때는 마우스 휠로도 옮깁니다. 줄을 바꿔 필드가 늘어나게 하려면 줄바꿈 옵션을 켭니다. 표 위 툴바처럼 높이가 바뀌면 안 되는 자리는 가로 스크롤을 씁니다"],
      ["목록 상태", "불러오는 중 · 실패 · 항목 없음을 목록 안 한 줄로 보여 줍니다. 실패하면 다시 시도 버튼을 함께 둡니다"],
      ["결과 알림", "결과 수와 선택 · 해제를 화면에 보이지 않는 알림으로 스크린 리더에 전합니다"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "입력하면 목록이 좁혀지고 첫 후보가 표시됩니다. ↑↓ 로 옮기고 Enter 로 고릅니다.", html: `<div class="field" style="width:320px"><label for="cb-d">담당 부서</label>${cbBox({ id: "cb-d", name: "부서", placeholder: "부서 검색" })}</div>`, layout: "tall top" },
      { id: "multiple", group: "variant", title: "Multiple", desc: "여러 개 고르기입니다. 고른 항목이 태그로 쌓이고 목록은 열린 채 있습니다. 태그가 넘치면 필드 높이는 그대로 두고 가로로 스크롤합니다.", html: `<div class="field" style="width:320px"><label for="cb-m">알림 받을 부서</label>${cbBox({ id: "cb-m", name: "알림 받을 부서", placeholder: "부서 검색", multi: true, on: ["영업팀", "인프라팀", "보안팀", "디자인팀", "고객지원팀"] })}</div>`, layout: "tall top" },
      { id: "all", group: "variant", title: "All Option", desc: "목록 맨 위의 '전체' 를 고르면 모든 항목이 선택되고 항목마다 태그가 생깁니다. 다시 고르면 모두 풉니다.", html: `<div class="field" style="width:320px"><label for="cb-all">알림 받을 부서</label>${cbBox({ id: "cb-all", name: "알림 받을 부서", placeholder: "부서 검색", multi: true, all: "전체", on: ["보안팀"] })}</div>`, layout: "tall top" },
      { id: "multiple-wrap", group: "variant", title: "Multiple Wrap", desc: "줄바꿈 옵션입니다. 태그가 넘치면 줄을 바꾸고 필드가 아래로 늘어납니다.", html: `<div class="field" style="width:320px"><label for="cb-mw">알림 받을 부서</label>${cbBox({ id: "cb-mw", name: "알림 받을 부서", placeholder: "부서 검색", multi: true, overflow: "wrap", on: ["영업팀", "인프라팀", "보안팀", "디자인팀", "고객지원팀"] })}</div>`, layout: "tall top" },
      { id: "states", group: "state", title: "List States", desc: "불러오는 중 · 실패 · 항목 없음을 목록 안 한 줄로 보여 줍니다. 실패하면 다시 시도 버튼을 둡니다.", html: `<div class="combobox open" data-filter="none" style="width:260px">${cbCtl({ id: "cb-s1", label: "불러오는 중", expanded: true, placeholder: "부서 검색" })}${cbMenu("불러오는 중", MENU_STATE.loading, "cb-s1")}${CB_LIVE}</div>
        <div class="combobox open" data-filter="none" style="width:260px">${cbCtl({ id: "cb-s2", label: "불러오기 실패", expanded: true, placeholder: "부서 검색" })}${cbMenu("불러오기 실패", MENU_STATE.error, "cb-s2")}${CB_LIVE}</div>
        <div class="combobox open" data-filter="none" style="width:260px">${cbCtl({ id: "cb-s3", label: "항목 없음", expanded: true, placeholder: "부서 검색" })}${cbMenu("항목 없음", MENU_STATE.empty, "cb-s3")}${CB_LIVE}</div>`, layout: "tall top" },
      { id: "disabled", group: "state", title: "Disabled", desc: "권한이 없거나 고를 수 없는 상태입니다.", html: `<div class="combobox disabled" style="width:260px">${cbCtl({ id: "cb-x", label: "담당 부서", placeholder: "권한 없음", disabled: true })}${cbMenu("담당 부서", cbOpts([]), "cb-x")}${CB_LIVE}</div>` },
      { id: "form", group: "variant", title: "Submit Validation", desc: "고른 값은 폼과 함께 제출되고, 필수 항목은 Text Field 와 같은 검증에 참여합니다. 고르지 않은 채 떠나면 오류를 알리고, 고르면 바로 지웁니다.", html: `<form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
        <div class="field"><label for="cb-f1">담당 부서 <em>*</em></label>${cbBox({ id: "cb-f1", name: "담당 부서", placeholder: "부서 검색", field: "owner", required: true })}<span class="help" aria-live="polite"></span></div>
        <div class="field"><label for="cb-f2">알림 받을 부서 <em>*</em></label>${cbBox({ id: "cb-f2", name: "알림 받을 부서", placeholder: "부서 검색", field: "notify", required: true, multi: true })}<span class="help" aria-live="polite"></span></div>
        <div class="form-actions"><button type="submit" class="btn md solid primary">정책 저장</button></div></form>`, layout: "tall top" },
    ],
    props: [[".combobox", "container", "—", "열림은 .open, 비활성은 .disabled + 입력 disabled"], [".control", "div", "—", "입력 셸. 하나 고르기면 입력이 바로 안에 있다"], [".control-track", "div", "—", "여러 개 — 칩(.chip.sm)과 입력의 줄. 가로 스크롤이 여기서 일어난다"], ["input[role=combobox]", "input", "—", "aria-autocomplete=list · aria-expanded · aria-controls. 접근 이름 필수(label for 또는 aria-label)"], [".menu", "ul", "—", "role=listbox · aria-label 필수, 여러 개면 aria-multiselectable"], [".menu-item", "li", "—", "role=option · data-value · aria-selected. 고른 항목 .on, 후보는 ds.js 가 .active. 여러 개면 맨 앞에 span.menu-mark.check(aria-hidden)"], [".menu-item[data-all]", "li", "—", "여러 개 — 목록 맨 위 하나. role=option · aria-selected(모두 골라졌으면 true). 고르면 끄지 않은 모든 항목을 고르고 다시 고르면 모두 푼다. 값 · 태그에는 들지 않고 검색어를 치는 동안 숨는다. React <code>allLabel</code>"], [".menu-state", "li", "—", "role=presentation. 불러오는 중 · 실패 · 항목 없음"], ["data-multiple", "attr", "—", "여러 개 고르기"], ["data-overflow", "'wrap'", "가로 스크롤", "여러 개 — 태그가 넘치면 줄을 바꿔 필드가 늘어난다. 없으면 높이를 지키고 가로로 스크롤"], ["data-name", "attr", "—", "제출할 이름 — 숨은 input 을 동기화(여러 개면 값마다 하나)"], ["data-required", "attr", "—", "form[data-validate] 안에서 필수 검사"], ["data-filter", "'none'", "—", "목록을 좁히지 않고 <code>ds:query</code> 만 낸다(서버 검색)"], ["ds:select", "event", "—", "detail.value — 하나면 문자열, 여러 개면 배열"], ["ds:query", "event", "—", "detail.query"], ["ds:retry", "event", "—", "목록 상태의 다시 시도"]],
    spec: [["Size", "필드 최소 높이 32 · 40 · 48(Text Field 와 같다) · 최소 폭 260 · 메뉴 폭 = 필드 폭 · 메뉴 최대 높이 320 · 활성 항목 surface/neutral/tertiary 면(테두리 없음)"], ["Tag", "Chip sm 26 · 간격 4 · 넘치면 가로 스크롤(필드 높이 32 · 40 · 48 그대로) · 줄바꿈 옵션은 필드가 늘어남 · 툴바 안 최대 폭 320"], ["Mark", "여러 개 옵션 앞 체크 16 · 고른 것은 surface/brand/primary 면 + brand-label 체크 · 글자 600"], ["Label", "Label 1/Reading 14 · placeholder foreground/neutral/tertiary"]],
  },

  /* ------------------------------------------------ Tab */
  "tab": {
    status: "ready", react: ["Tabs","TabList","Tab","TabPanel"], css: [".tabs", ".tab-panel"], borrows: [".count", ".field"],
    desc: "같은 맥락의 콘텐츠를 뷰 단위로 전환합니다. 페이지 수준에는 Underline 을, 카드 안의 보조 전환에는 Pill 을 씁니다.",
    choose: [
      ["언제 쓰는가", "같은 대상의 보기를 바꿀 때 씁니다. 페이지를 옮기는 메뉴에는 쓰지 않고, 표의 필터에는 Filter Chip 을 씁니다. 동시에 봐야 하는 정보는 탭으로 나누지 않습니다."],
      ["Placement", "페이지 헤더 아래, 카드 헤더 우측(pill)"],
    ],
    principles: [
      ["순서 · 제목", "중요도와 빈도 순으로 둡니다. 모든 탭에 공통인 제목은 탭 위에 둡니다."],
      ["라벨", "1~2단어로 씁니다."],
      ["건수", "탭에 건수는 기본으로 두지 않습니다. 안 읽은 알림처럼 그 수를 보고 탭을 고르는 때에만 붙입니다."],
      ["넘칠 때", "탭 줄만 옆으로 스크롤합니다. 고른 탭은 자동으로 보이는 자리에 옵니다. 탭을 메뉴로 접어 숨기지 않습니다."],
      ["키보드", "←→ · Home · End 로 옮기면 바로 전환합니다. Tab 키는 다음 탭이 아니라 패널로 갑니다."],
      ["패널의 입력", "탭을 옮겨도 패널을 숨기기만 하고 입력은 남겨 둡니다. 패널을 지워야 하는 제품은 확인 Popup 을 띄웁니다."],
      ["URL", "활성 탭을 URL 에 남겨 공유와 새로고침에 유지합니다. 제품이 구현합니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "밑줄 스타일의 기본 탭입니다.", html: `
        <div class="tabs" role="tablist" aria-label="보기 전환">
          <button type="button" class="tab on" role="tab" aria-selected="true">개요</button>
          <button type="button" class="tab" role="tab" aria-selected="false">이벤트</button>
          <button type="button" class="tab" role="tab" aria-selected="false">정책</button>
        </div>
      ` },
      { id: "underline", group: "variant", title: "Underline", desc: "기본 모양입니다. 고른 탭에 밑줄이 붙습니다.", html: `
        <div style="width:100%;max-width:640px">
          <div class="tabs" role="tablist" aria-label="보기 전환">
            <button type="button" class="tab on" role="tab" aria-selected="true">개요</button>
            <button type="button" class="tab" role="tab" aria-selected="false">이벤트</button>
            <button type="button" class="tab" role="tab" aria-selected="false">정책</button>
            <button type="button" class="tab" role="tab" aria-selected="false" disabled>리포트</button>
          </div>
          <div class="tab-panel" role="tabpanel">선택한 탭의 내용이 여기에 표시됩니다.</div>
        </div>`, react: `
        import { useState } from "react";
        const TABS = ["개요", "이벤트", "정책"];
        export function DetailTabs() {
          const [cur, setCur] = useState(0);
          return (
            <div>
              <div className="tabs" role="tablist" aria-label="보기 전환">
                {TABS.map((t, i) => (
                  <button key={t} type="button" role="tab" className={"tab" + (i === cur ? " on" : "")} aria-selected={i === cur} onClick={() => setCur(i)}>{t}</button>
                ))}
              </div>
              <div className="tab-panel" role="tabpanel">{TABS[cur]} 내용</div>
            </div>
          );
        }` },
      { id: "count", group: "variant", title: "With Count", desc: "그 수를 보고 탭을 고르는 때에만 건수를 붙입니다. 목록의 전체 건수는 탭이 아니라 목록 아래 건수 줄이 보여 줍니다.", html: `
        <div class="tabs" role="tablist" aria-label="보기 전환" style="max-width:640px">
          <button type="button" class="tab on" role="tab" aria-selected="true">전체<span class="count">128</span></button>
          <button type="button" class="tab" role="tab" aria-selected="false">차단<span class="count">37</span></button>
          <button type="button" class="tab" role="tab" aria-selected="false">검토 필요<span class="count">5</span></button>
        </div>` },
      { id: "pill", group: "variant", title: "Pill", desc: "카드 · 패널 안의 보조 전환에 씁니다. 폭은 내용에 맞춥니다.", html: `
        <div class="tabs pill" role="tablist" aria-label="보기 전환">
          <button type="button" class="tab on" role="tab" aria-selected="true">일간</button>
          <button type="button" class="tab" role="tab" aria-selected="false">주간</button>
          <button type="button" class="tab" role="tab" aria-selected="false">월간</button>
        </div>` },
      { id: "overflow", group: "variant", title: "Overflow", desc: "폭을 넘으면 탭 줄만 옆으로 스크롤합니다. 키보드로 옮기면 그 탭이 보이는 자리에 옵니다.", html: `
        <div class="tabs" role="tablist" aria-label="정책 종류" style="max-width:480px">
          ${["전체","USB 제어","네트워크","웹 필터","메일","프린터","앱 실행","화면 캡처","클립보드"].map((t, i) => `<button type="button" class="tab${i ? "" : " on"}" role="tab" aria-selected="${!i}">${t}</button>`).join("")}
        </div>` },
      { id: "panels", group: "variant", title: "Panels", desc: "탭마다 패널을 두고 서로 연결합니다. 탭을 옮겨도 입력은 그대로 남습니다.", html: `
        <div style="width:100%;max-width:480px">
          <div class="tabs" role="tablist" aria-label="정책 설정">
            <button type="button" class="tab on" role="tab" aria-selected="true" id="tp-tab-a" aria-controls="tp-panel-a">기본</button>
            <button type="button" class="tab" role="tab" aria-selected="false" id="tp-tab-b" aria-controls="tp-panel-b">예외</button>
          </div>
          <div class="tab-panel" role="tabpanel" id="tp-panel-a" aria-labelledby="tp-tab-a"><div class="field"><label for="tp-name">정책 이름</label><input id="tp-name" type="text" placeholder="예: 외부 USB 차단"></div></div>
          <div class="tab-panel" role="tabpanel" id="tp-panel-b" aria-labelledby="tp-tab-b" hidden><div class="field"><label for="tp-ex">예외 대상</label><input id="tp-ex" type="text" placeholder="사용자 또는 그룹"></div></div>
        </div>` },
      { id: "variant", group: "variant", title: "Small / Accent", desc: "밀도 높은 패널에는 작은 크기를, 제품 색으로 강조할 때는 Accent 를 씁니다.", html: `
        <div class="tabs sm accent" role="tablist" aria-label="보기 전환" style="max-width:480px">
          <button type="button" class="tab on" role="tab" aria-selected="true">상세</button>
          <button type="button" class="tab" role="tab" aria-selected="false">타임라인</button>
          <button type="button" class="tab" role="tab" aria-selected="false">관련 이벤트</button>
        </div>` },
    ],
    props: [[".tabs", "container", "—", "role=tablist. 기본 Underline, 전체 폭"], [".tab", "button", "—", "role=tab, aria-selected. 활성 .on"], [".pill", "boolean", "false", "캡슐형(보조 전환)"], [".sm / .accent", "boolean", "false", "작은 크기 / 활성 색 accent"], [".count", "element", "—", "건수 배지"], ["disabled", "attribute", "—", "비활성 탭"], ["aria-controls", "attribute", "—", "패널 id. 있으면 ds.js 가 패널을 숨기고 보입니다(입력 유지)"], ["ds:tab", "event", "—", "탭을 바꾸면 {value, index}. value 는 data-value, 없으면 건수를 뺀 글자"]],
    spec: [["Size", "높이 44 (sm 38 · pill 탭 34) · 탭 간격 24"], ["Container", "하단 1px line/neutral/secondary · 활성 2px"], ["Label", "Body 2/Normal 15/22 Medium tertiary · 선택 Bold · pill 선택 SemiBold · sm Label 2 13/18"], ["Overflow", "폭을 넘으면 탭 줄 가로 스크롤. 탭은 줄어들지 않음"]],
    figma: { frame: "Tab", sizes: { md: { h: 44 }, sm: { h: 38 } }, variants: { underline: {}, pill: { bg: "--surface-neutral-secondary" } }, states: ["default", "active", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Breadcrumb */
  "breadcrumb": {
    status: "ready", react: ["Breadcrumb","BreadcrumbHome","BreadcrumbItem","BreadcrumbMore"], css: [".breadcrumb"], borrows: [".page-head", ".btn", ".tooltip-wrap", ".tooltip"],
    desc: "지금 화면이 메뉴 계층의 어디인지 보여 주고 상위로 한 번에 돌아가게 합니다.",
    choose: [
      ["언제 쓰는가", "좌측 메뉴에서 한 단계 이상 들어간 상세, 편집, 하위 화면에 둡니다. 메뉴에서 바로 열리는 화면에는 두지 않습니다."],
      ["Placement", "메뉴 아래 상세 · 편집 화면의 페이지 타이틀 위 8px · 모달 · 탭 패널 안 금지"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "홈 아이콘 › 메뉴 › … › 현재 페이지 순서로 놓습니다. 첫 항목은 항상 홈 아이콘이고 '홈' 이라는 접근 이름이 필수입니다. 마지막은 현재 페이지로, 링크 없이 Medium 굵기이며 페이지 타이틀과 같은 이름입니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><a href="#">정책</a></li>
            <li><a href="#">USB 제어</a></li>
            <li aria-current="page"><span>외부 저장장치 차단</span></li>
          </ol>
        </nav>` },
      { id: "state", group: "state", title: "State", desc: "Normal · Hover · Focus · Current 네 가지입니다. Hover 는 글자를 진하게 바꾸고 밑줄을 긋습니다. 가운데 항목은 Hover 를 고정해 보여 줍니다. Focus 는 전역 포커스 외곽선이고 Tab 키로 옮기면 보입니다. Disabled 는 두지 않습니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><a href="#">Normal</a></li>
            <li><a href="#" data-state="hover">Hover</a></li>
            <li aria-current="page"><span>Current</span></li>
          </ol>
        </nav>` },
      { id: "long", group: "variant", title: "Long label", desc: "메뉴 항목은 메뉴에 적힌 이름 그대로, 상세 화면은 정책 · 장비 이름처럼 대상 이름을 씁니다. 220px 를 넘으면 말줄임합니다. 잘린 항목에만 Tooltip 이 붙어 마우스와 키보드로 전체 문구를 봅니다. 링크가 아닌 현재 항목도 잘렸을 때는 포커스를 받습니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><a href="#">정책</a></li>
            <li><a href="#">본사 개발팀 외부 저장장치 · 클라우드 업로드 통합 차단 정책</a></li>
            <li aria-current="page"><span>예외 승인 요청 상세 — 2026. 10. 30 개발팀 김지란</span></li>
          </ol>
        </nav>` },
      { id: "text-parent", group: "variant", title: "Non-link parent", desc: "메뉴 그룹처럼 눌러 갈 페이지가 없는 단계는 링크 없이 텍스트로만 둡니다. 갈 수 없는 단계를 비활성으로 칠하지 않습니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><span>리포트</span></li>
            <li><a href="#">주간 리포트</a></li>
            <li aria-current="page"><span>2026년 10월 4주차</span></li>
          </ol>
        </nav>` },
      { id: "collapsed", group: "variant", title: "Collapsed", desc: "홈을 포함해 5단계 이상이면 첫 항목인 홈과 끝 2개를 남기고 가운데를 … 하나로 접습니다. 누르면 그 자리에 펼쳐지고 포커스는 펼친 첫 링크로 갑니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><button type="button" class="more" aria-label="상위 경로 펼치기" data-items="정책|USB 제어">${I("dots",14)}</button></li>
            <li><a href="#">PC-2041</a></li>
            <li aria-current="page"><span>이벤트 #48213</span></li>
          </ol>
        </nav>` },
      { id: "placement", group: "variant", title: "Placement", desc: "<a href=\"#/components/page-header\">Page Header</a> 첫 칸에 넣어 타이틀 바로 위 8px 에 둡니다. 한 화면에 하나만 둡니다. 모달 · 탭 패널 안에는 두지 않습니다.", html: `
        <div class="page-head">
          <nav aria-label="현재 위치">
            <ol class="breadcrumb">
              <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
              <li><a href="#">정책</a></li>
              <li><a href="#">USB 제어</a></li>
              <li aria-current="page"><span>외부 저장장치 차단</span></li>
            </ol>
          </nav>
          <div><h2 class="title">외부 저장장치 차단</h2><p class="sub">POL-2041 · 전체 그룹</p></div><div class="actions"><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="button" class="btn md solid primary">저장</button></div></div>
        </div>` },
    ],
    props: [
      ["Breadcrumb / nav > ol.breadcrumb", "container", "—", "<code>nav[aria-label]</code> 안의 ol. React <code>label</code> 이 aria-label(기본 \"현재 위치\"). 한 화면에 하나 — 페이지 타이틀 위 8px"],
      ["BreadcrumbHome / li > a.icon", "link", "—", "<b>필수 첫 항목</b> — 홈 아이콘 18 · <code>aria-label=\"홈\"</code>(React <code>label</code>). 클릭 영역 24×24"],
      ["BreadcrumbItem href / li > a", "link", "—", "상위 경로 링크. 220px 를 넘으면 말줄임 — 잘린 항목에만 ds.js · React 가 Tooltip 을 답니다. React <code>as</code> · <code>linkProps</code> 로 라우터 링크를 씁니다"],
      ["BreadcrumbItem / li > span", "text", "—", "페이지가 없는 상위 단계(href · current 없음). 링크 없이 텍스트로 — 비활성으로 칠하지 않습니다"],
      ["current / li[aria-current=page] > span", "boolean", "false", "현재 페이지. 마지막 항목, 링크 없이 Medium · 페이지 타이틀과 같은 이름. 라벨을 <code>span</code> 으로 감싸야 말줄임이 걸립니다(React 가 감쌉니다)"],
      ["BreadcrumbMore / .more", "button", "—", "접힌 가운데 경로(…). 홈 포함 5단계 이상일 때 첫 항목과 끝 2개만 남기고 접습니다. 클릭 영역 24×24"],
      [".more[data-items]", "attribute", "—", "<b>HTML 필수</b> — 접은 경로를 <code>|</code> 로 이어 둡니다(<code>\"정책|USB 제어\"</code>). 누르면 그 자리에 링크로 펼치고 첫 링크로 포커스를 옮기며 <code>ds:expand</code> 를 발행합니다 — ds.js 담당. React 는 <code>BreadcrumbMore</code> 의 onClick 으로 직접 처리"],
    ],
    spec: [["Size", "높이 24 한 크기 · 항목 간격 6 · 구분자 사선(slash) 12 · disable 색 · 홈 아이콘 18 · 라벨 최대 220"], ["Container", "없음(텍스트 행)"], ["Label", "14/22(Label 1/Reading) tertiary · Hover primary + 밑줄 · 현재 primary Medium"]],
    figma: { frame: "Breadcrumb", sizes: { md: { h: 24 } }, variants: { default: {}, collapsed: {} }, states: ["default", "hover", "focus", "current"] },
  },

  /* ------------------------------------------------ Pagination */
  "pagination": {
    status: "ready", react: ["Pagination","PaginationBar","CursorPagination","paginate","PAGE_SIZES"], css: [".pagination", ".pagination-bar", ".dropdown", ".menu", ".menu-item"],
    desc: "긴 목록을 페이지로 나누어 이동합니다. 총 건수와 페이지 크기 선택을 함께 둡니다.",
    choose: [
      ["언제 쓰는가", "전체 건수를 아는 긴 목록이나 표를 여러 쪽으로 나눌 때 씁니다. 전체 쪽수를 셀 수 없다면 이전과 다음만 있는 커서 방식을 씁니다."],
      ["Placement", "테이블 하단 우측, 총 건수는 좌측. 표시 개수 20 · 50 · 100"],
    ],
    principles: [
      ["표시 개수", "한 페이지에 보일 개수는 20 · 50 · 100 중에서 고릅니다. 개수나 필터가 바뀌면 1페이지로 돌아갑니다."],
      ["번호 칸", "화살표를 빼고 번호 칸은 9칸 이하로 둡니다."],
      ["한 페이지뿐일 때", "번호를 숨기고 건수는 남깁니다. 전체 건수가 가장 작은 표시 개수 이하이면 표시 개수 선택도 숨깁니다."],
      ["이동한 뒤", "옮겨 갈 자리를 정해 두면 이동한 뒤 표 맨 위로 스크롤하고 포커스를 옮깁니다. 현재 페이지는 제품이 URL 에 남깁니다."],
      ["끝을 모르는 목록", "수십만 건 로그처럼 전체 쪽수를 세지 못하면 이전 · 다음 버튼만 있는 커서 방식을 씁니다. 끝이 확인되면 그 방향 버튼을 끕니다."],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "이전 · 다음 버튼과 쪽 번호를 둡니다. 지금 쪽은 강조되고, 첫 쪽에서는 이전 버튼이 꺼집니다.", html: `
        <nav class="pagination" aria-label="페이지">
          <button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button>
          <button type="button" class="on" aria-current="page">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">4</button>
          <span class="gap">…</span>
          <button type="button">24</button>
          <button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>`, react: `
        import { useState } from "react";
        import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
        export function Pager({ total = 24 }: { total?: number }) {
          const [page, setPage] = useState(1);
          const nums = [1, 2, 3, 4].filter(n => n <= total);
          return (
            <nav className="pagination" aria-label="페이지">
              <button type="button" aria-label="이전" disabled={page === 1} onClick={() => setPage(p => p - 1)}><IconChevronLeft size={16} /></button>
              {nums.map(n => (
                <button key={n} type="button" className={n === page ? "on" : ""} aria-current={n === page ? "page" : undefined} onClick={() => setPage(n)}>{n}</button>
              ))}
              <span className="gap">…</span>
              <button type="button" className={page === total ? "on" : ""} onClick={() => setPage(total)}>{total}</button>
              <button type="button" aria-label="다음" disabled={page === total} onClick={() => setPage(p => p + 1)}><IconChevronRight size={16} /></button>
            </nav>
          );
        }` },
      { id: "variant", group: "variant", title: "Compact / Ghost", desc: "기본은 회색 선 칸입니다. 칸이 좁으면 Compact 를, 선 없이 가볍게 두려면 Ghost 를 씁니다. Ghost 의 지금 쪽은 제품 색 면입니다.", html: `
        <nav class="pagination compact" aria-label="페이지">
          <button type="button" aria-label="이전">${I("chevron-left",16)}</button><button type="button">7</button><button type="button" class="on" aria-current="page">8</button><button type="button">9</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>
        <nav class="pagination ghost" aria-label="페이지">
          <button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>` },
      { id: "bar", group: "variant", title: "Pagination Bar", desc: "표 아래에 둡니다. 왼쪽에 총 건수를, 오른쪽에 표시 개수 선택과 페이지 이동을 둡니다.", html: `
        <div class="pagination-bar">
          <span>총 <b>1,284</b>건 · 1–50</span>
          <div>
            <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">50개씩</button><ul class="menu" role="listbox" aria-label="페이지당 개수"><li class="menu-item" role="option" data-value="20">20개씩</li><li class="menu-item on" role="option" data-value="50" aria-selected="true">50개씩</li><li class="menu-item" role="option" data-value="100">100개씩</li></ul></div>
            <nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><span class="gap">…</span><button type="button">26</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav>
          </div>
        </div>` },
      { id: "single", group: "state", title: "Single Page", desc: "번호와 표시 개수 선택을 숨기고 건수는 남깁니다.", html: `
        <div class="pagination-bar"><span>총 <b>12</b>건</span></div>` },
      { id: "cursor", group: "variant", title: "Cursor", desc: "전체 쪽수를 모르는 목록에 씁니다. 이전 · 다음 버튼 사이에 지금 보이는 범위를 적습니다. 끝이 확인되면 제품이 그 방향 버튼을 끕니다.", html: `
        <nav class="pagination cursor" aria-label="페이지"><button type="button" data-cursor="prev" disabled>${I("chevron-left",16)}이전</button><span class="range">1–100</span><button type="button" data-cursor="next">다음${I("chevron-right",16)}</button></nav>` },
    ],
    props: [[".pagination", "nav", "—", "aria-label=페이지. 버튼 36 (compact 32)"], ["button.on", "current", "—", "현재 페이지 + aria-current=page"], [".gap", "span", "—", "생략(…). 글자 크기는 놓인 곳을 따른다 — 단독이면 앱 기본 글자, .pagination-bar 안이면 12(번호 버튼은 14 · compact 12 로 정해져 있다)"], [".compact / .ghost", "boolean", "false", "작은 크기 / 면 없는 모양(선 없음 · 지금 쪽은 제품 색 면). 기본은 회색 선 칸이고 옛 .outline 은 쓰지 않는다. React <code>compact</code> · <code>variant=\"ghost\"</code>"], [".pagination-bar", "container", "—", "총 건수 + 페이지 크기 + 페이지네이션. 전체 건수가 가장 작은 표시 개수 이하이면 페이지 크기 Select 를 두지 않는다"], [".cursor", "boolean", "false", "커서 방식 — 버튼 둘(data-cursor prev · next)과 범위 글자. 끝이면 제품이 버튼에 disabled. React <code>CursorPagination</code>"], ["data-target", "selector", "—", "이동한 뒤 스크롤하고 포커스를 옮길 요소(보통 표 영역). React <code>target</code>"], ["ds:page", "event", "—", "번호 이동 {page}, 표시 개수를 바꾸면 {page:1, pageSize}, 커서 방식은 {direction}"]],
    spec: [["Size", "버튼 36 (compact 32) · 간격 4"], ["Container", "radius/md · 기본 1px line/neutral/secondary + surface/elevated/primary · 현재 surface/brand/primary 선 + foreground/brand/primary 글자 · ghost 는 선 · 면 없음 · 현재 surface/brand/primary 면 + brand-label"], ["Label", "Label 1/Reading 14 · 현재 Semibold"]],
    figma: { frame: "Pagination", radius: "radius/md", sizes: { md: { h: 36 }, compact: { h: 32 } }, variants: { default: { stroke: "--line-neutral-secondary" }, ghost: {} }, states: ["default", "current", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Navigation */
  "navigation": {
    status: "ready", react: ["SideNav","SideNavGroup","SideNavItem"], css: [".sidenav", ".count", ".skip-link", ".tooltip-wrap", ".tooltip"], borrows: [".divider"],
    desc: "콘솔 좌측의 1차 내비게이션입니다. 그룹 라벨로 메뉴를 묶고 현재 위치를 강조합니다. 폭은 240px 이고, 접으면 64px 입니다.",
    choose: [
      ["언제 쓰는가", "메뉴가 여러 그룹으로 나뉜 콘솔에서 1차 이동을 맡습니다. 상단 1차 메뉴와 함께 두지 않습니다."],
      ["Placement", "헤더 아래 좌측 고정, 전체 높이"],
    ],
    principles: [
      ["깊이", "2단계까지입니다."],
      ["이름", "메뉴 이름과 페이지 제목, Breadcrumb 이름을 같게 씁니다."],
      ["권한", "권한 없는 메뉴는 숨깁니다. 비활성으로 두지 않습니다."],
      ["접힘", "Top Navigation 왼쪽 영역의 접기 버튼으로 접고 폅니다. 접으면 아이콘만 남고 이름은 Tooltip 으로 보입니다. 마우스와 키보드 모두 볼 수 있습니다. 접은 상태는 사용자별로 기억하고, 그 저장은 제품이 맡습니다."],
      ["위험 항목", "계정 삭제처럼 되돌릴 수 없는 일로 가는 항목은 메뉴 맨 아래에 구분선을 두고 빨간 글자로 하나만 둡니다. 누르면 바로 실행하지 않고 위험 확인 대화상자를 엽니다. 화면으로 가는 항목이 아니므로 눌러도 현재 메뉴 표시는 그대로입니다."],
      ["좁은 화면", "화면 폭이 1280px 아래로 줄면 접기 버튼이 있는 사이드 내비가 접히고, 다시 넓히면 펼쳐집니다. 그 사이 사용자가 바꾼 상태는 다음에 폭이 경계를 넘을 때까지 그대로 둡니다."],
      ["본문 바로가기", "페이지의 첫 포커스에 둡니다. 포커스가 오면 나타납니다."],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "그룹 라벨 아래에 링크를 둡니다. 아이콘은 18px 이고, 건수와 하위 항목을 함께 둘 수 있습니다.", html: `
        <nav class="sidenav" aria-label="주 메뉴" style="border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)">
          <a href="#" class="on" aria-current="page">${I("home")}<span>대시보드</span></a>
          <a href="#">${I("list")}<span>이벤트</span><span class="count">12</span></a>
          <div class="group">보호</div>
          <a href="#">${I("shield")}<span>정책</span></a>
          <a href="#" class="sub">USB 제어</a>
          <a href="#" class="sub">네트워크</a>
          <a href="#">${I("server")}<span>에이전트</span></a>
          <div class="group">관리</div>
          <a href="#">${I("user")}<span>사용자</span></a>
          <a href="#">${I("settings")}<span>설정</span></a>
          <div class="foot">v2.4.1 · 라이선스 정상</div>
        </nav>`, layout: "left" },
      { id: "collapsed", group: "variant", title: "Collapsed", desc: "사용자가 접었거나 화면 폭이 1280px 아래로 줄었을 때의 모양입니다. 아이콘만 남고, 이름은 마우스와 키보드 모두 Tooltip 으로 봅니다. 하위 항목과 아래쪽 영역은 숨습니다. 현재 메뉴가 하위 항목이면 부모 메뉴가 선택 모양을 이어받습니다.", html: `
        <nav class="sidenav collapsed" aria-label="주 메뉴" style="border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)">
          <span class="tooltip-wrap"><a href="#" class="on" aria-current="page" aria-label="대시보드">${I("home")}<span>대시보드</span></a><span class="tooltip right" role="tooltip">대시보드</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="이벤트">${I("list")}<span>이벤트</span></a><span class="tooltip right" role="tooltip">이벤트</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="정책">${I("shield")}<span>정책</span></a><span class="tooltip right" role="tooltip">정책</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="에이전트">${I("server")}<span>에이전트</span></a><span class="tooltip right" role="tooltip">에이전트</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="설정">${I("settings")}<span>설정</span></a><span class="tooltip right" role="tooltip">설정</span></span>
        </nav>`, layout: "left" },
      { id: "danger", group: "variant", title: "Danger Item", desc: "설정 메뉴처럼 아이콘 없이 쓸 수 있습니다. 계정 삭제 같은 위험 항목은 맨 아래 구분선 뒤에 빨간 글자로 하나만 두고, 누르면 위험 확인 대화상자를 엽니다.", html: `
        <nav class="sidenav" aria-label="설정 메뉴" style="border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)">
          <a href="#" class="on" aria-current="page"><span>내 정보</span></a>
          <a href="#"><span>비밀번호와 보안</span></a>
          <a href="#"><span>알림</span></a>
          <a href="#"><span>팀 구성원</span></a>
          <hr class="divider">
          <a href="#" class="danger"><span>계정 삭제</span></a>
        </nav>`, layout: "left" },
      { id: "skip", group: "variant", title: "Skip Link", desc: "페이지의 첫 포커스에 둡니다. 화면 밖에 있다가 Tab 을 누르면 나타납니다. 이 예제는 보이는 상태로 고정했습니다.", html: `
        <div style="position:relative;width:100%;max-width:480px;height:64px;border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)"><a href="#" class="skip-link show">본문 바로가기</a></div>` },
    ],
    props: [[".skip-link", "a", "—", "본문 바로가기. .show 는 문서용 고정 표시"], [".tooltip-wrap > a", "wrapper", "—", "접힌 레일의 항목. a 에 aria-label, 옆에 .tooltip.right"], [".sidenav", "nav", "—", "폭 240, 세로 링크 목록"], [".group", "div", "—", "그룹 라벨(uppercase caption)"], ["a.on", "current", "—", "현재 메뉴(brand subtle)"], ["a.sub", "child", "—", "하위 항목(들여쓰기). 선택(.on)되면 brand 글자"], ["a.danger", "danger", "—", "위험 항목 — foreground/negative/strong 글자. 맨 아래 하나, 앞에 .divider. 누르면 위험 확인(alertdialog)을 연다. 눌러도 현재 메뉴(.on · aria-current)가 옮겨 가지 않는다. React <code>SideNavItem danger</code>"], ["a.has-on", "parent", "—", "하위 항목이 현재 메뉴인 부모. 펼친 레일에서는 그대로, 접힌 레일에서는 하위 항목이 숨으니 선택 모양이 된다. 접힌 레일에서는 aria-current=\"true\" 도 함께(React hasActiveChild 는 자동)"], [".collapsed", "boolean", "false", "폭 64, 아이콘만. 접기 버튼이 가리키는 내비는 ds.js 가 화면 폭 1280 경계를 넘을 때 붙이고 뗍니다(React <code>useSideNavCollapse</code>)"], ["[data-auto-collapse=\"false\"]", "attr", "—", "화면 폭으로 접지 않음(React <code>useSideNavCollapse({ auto: false })</code>)"], [".count", "element", "—", "미확인 건수"]],
    spec: [["Size", "폭 240 (접힘 64) · 안쪽 여백 20 (접힘 위아래 20 · 좌우 10) · 항목 높이 38 (padding 8 · Label 1/Reading 14/22)"], ["Container", "surface/elevated/primary · 우측 1px line/neutral/secondary"], ["Label", "항목 14 Medium · 선택 14 Bold · 그룹 12 SemiBold uppercase · 위험 항목 foreground/negative/strong"], ["Icon", "18 · foreground/neutral/secondary · 선택 foreground/brand/primary"]],
    figma: { frame: "Navigation", radius: "radius/md", sizes: { expanded: { w: 240 }, collapsed: { w: 64 }, item: { h: 38 } }, variants: { default: { icon: "--foreground-neutral-secondary" }, collapsed: { hasOn: { bg: "--surface-brand-subtle", icon: "--foreground-brand-primary" } }, selected: { bg: "--surface-brand-subtle", fg: "--foreground-brand-primary" }, sub: { fg: "--foreground-neutral-secondary", selected: { fg: "--foreground-brand-primary" } } }, states: ["default", "hover", "active", "sub selected"] },
  },

  /* ------------------------------------------------ Top Navigation */
  "top-navigation": {
    status: "ready", react: ["TopBar","TopBarLogo","TopBarNav","TopBarNavItem","TopBarRight","TopBarStart","TopBarNavToggle","TopBarThemeToggle","Avatar"], css: [".topbar", ".topbar-start", ".topbar-user", ".avatar", ".searchbar", ".divider", ".count", ".with-count", ".tooltip-wrap", ".tooltip", ".dropdown", ".menu", ".menu-item", ".menu-sep", ".i-light", ".i-dark"], borrows: [".btn", ".sidenav", ".t-label-1-normal"],
    desc: "제품 상단 바입니다. 제품 로고, 1차 메뉴, 전역 검색, 알림, 설정, 라이트와 다크 전환, 사용자 메뉴로 구성합니다. 1차 메뉴는 사이드 내비게이션이 없는 제품에만 둡니다.",
    choose: [
      ["언제 쓰는가", "모든 화면 맨 위에 놓이는 제품 바입니다. 사이드 내비게이션이 없는 제품에서만 이곳에 1차 메뉴를 둡니다."],
      ["Placement", "스크롤해도 최상단에 고정"],
    ],
    principles: [
      ["1차 메뉴", "상단 메뉴와 Navigation 을 함께 두지 않습니다. 사이드 내비가 있으면 상단에는 전역 검색을 둡니다."],
      ["왼쪽 영역", "사이드 내비게이션이 있으면 로고와 사이드 내비 접기 버튼을 한 영역에 둡니다. 로고는 왼쪽 끝, 접기 버튼은 오른쪽 끝입니다. 영역 폭은 사이드 내비게이션과 같은 240 이고, 사이드 내비를 접어도 그대로입니다."],
      ["오른쪽 순서", "검색 · 알림 · 설정 · 라이트와 다크 전환 · 사용자 순으로 고정합니다. 라이트와 다크 전환은 설정 바로 옆이고, 사용자는 맨 끝입니다."],
      ["알림", "벨에는 안 읽은 알림이 있다는 점만 보여 주는 것이 기본입니다. 건수가 중요한 제품만 숫자를 보여 줍니다. 숫자는 99 까지 쓰고 넘으면 99+ 로 씁니다."],
      ["사용자 메뉴", "로그아웃은 메뉴 맨 아래, 구분선 뒤에 둡니다."],
      ["아이콘 버튼", "기본 크기 40 이고, 모두 접근 이름과 Tooltip 을 둡니다. 옆의 전역 검색도 같은 높이 40 입니다. 라이트와 다크 전환 버튼은 지금 테마를 아이콘으로 보입니다. 라이트면 해, 다크면 달입니다."],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "로고와 메뉴, 오른쪽 동작으로 이루어집니다. 현재 메뉴는 강조해 보여 줍니다. 사이드 내비게이션이 없는 제품이라 접기 버튼이 없습니다.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i>${I("shield-check",24,{style:"filled"})}</i>Security Console <small>v2.4</small></a>
          <nav aria-label="주 메뉴"><a href="#" class="on" aria-current="page">대시보드</a><a href="#">이벤트</a><a href="#">정책</a></nav>
          <div class="right">
            <div class="btn-group">${tbBell()}${tbIcon("settings", "설정")}${tbTheme()}</div>
            <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
            <span class="avatar" role="img" aria-label="정희 · 관리자">JH</span>
          </div>
        </header>` },
      { id: "search", group: "variant", title: "With Navigation", desc: "사이드 내비가 있는 제품은 상단 메뉴 대신 전역 검색을 둡니다. 왼쪽 영역은 사이드 내비와 같은 폭이고, 오른쪽 끝의 버튼으로 사이드 내비를 접고 폅니다.", html: `
        <div style="width:100%;border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg);overflow:hidden">
          <header class="topbar">
            ${tbStart("tn-nav")}
            <div class="searchbar" role="search" data-hotkey>${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="전역 검색"><kbd>/</kbd></div>
            <div class="right">
              <div class="btn-group">${tbBell("알림")}${tbIcon("settings", "설정")}${tbTheme()}</div>
              <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
              <span class="avatar" role="img" aria-label="정희 · 관리자">JH</span>
            </div>
          </header>
          <div style="display:flex;min-height:15rem">
            <nav class="sidenav" id="tn-nav" aria-label="주 메뉴" style="min-height:0">
              <span class="tooltip-wrap"><a href="#" class="on" aria-current="page" aria-label="대시보드">${I("layout-dashboard")}<span>대시보드</span></a><span class="tooltip right" role="tooltip">대시보드</span></span>
              <span class="tooltip-wrap"><a href="#" aria-label="이벤트">${I("list")}<span>이벤트</span></a><span class="tooltip right" role="tooltip">이벤트</span></span>
              <span class="tooltip-wrap"><a href="#" aria-label="정책">${I("shield")}<span>정책</span></a><span class="tooltip right" role="tooltip">정책</span></span>
              <span class="tooltip-wrap"><a href="#" aria-label="에이전트">${I("server")}<span>에이전트</span></a><span class="tooltip right" role="tooltip">에이전트</span></span>
            </nav>
            <p class="t-label-1-normal" style="margin:0;padding:1.5rem;color:var(--foreground-neutral-secondary)">본문 영역</p>
          </div>
        </div>` },
      { id: "user", group: "variant", title: "User Menu", desc: "맨 끝의 사용자 메뉴입니다. 로그아웃은 맨 아래 구분선 뒤에 둡니다.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i>${I("shield-check",24,{style:"filled"})}</i>Security Console</a>
          <div class="right">
            <div class="btn-group">${tbBell("알림")}${tbIcon("settings", "설정")}${tbTheme()}</div>
            <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
            <div class="dropdown"><button type="button" class="topbar-user" aria-label="사용자 메뉴" aria-haspopup="menu" aria-expanded="false"><span class="avatar">JH</span></button><ul class="menu" role="menu" style="left:auto;right:0"><li class="menu-item" role="menuitem">내 정보</li><li class="menu-item" role="menuitem">비밀번호 변경</li><li class="menu-sep" role="separator"></li><li class="menu-item" role="menuitem">로그아웃</li></ul></div>
          </div>
        </header>` },
    ],
    props: [[".topbar", "header", "—", "높이 62, 하단 1px"], [".topbar-start", "div", "—", "로고 + 사이드 내비 접기 버튼을 담는 왼쪽 영역. 폭 240(사이드 내비와 같음), 접어도 그대로"], ["[data-sidenav-toggle]", "button", "—", "사이드 내비 접기. <code>aria-controls</code> = 사이드 내비 id. ds.js 가 <code>.collapsed</code> · <code>aria-expanded</code> · 이름 · Tooltip 을 맞추고 <code>ds:sidenav {collapsed, trigger}</code> 를 냅니다(trigger 는 button · width — 화면 폭 1280 경계를 넘으면 접고 폄). 접으면 아이콘이 180° 돌아 반대쪽을 향합니다(<code>--motion-base</code>, 줄인 모션은 바로). 저장은 제품"], ["[data-theme-toggle]", "button", "—", "라이트/다크 전환. 안에 지금 테마의 아이콘 <code>.i-light</code>(해 — 라이트에서 보임) · <code>.i-dark</code>(달 — 다크에서 보임). ds.js 가 <code>&lt;html data-theme&gt;</code> 와 <code>aria-pressed</code> 를 바꾸고 <code>ds:theme {theme}</code> 를 냅니다. 저장은 제품"], [".logo", "a", "—", "제품 마크(i — 로그인 로고와 같은 shield-check 면 아이콘 24, 색은 로고 글자색) + 이름 + small 버전. React <code>TopBarLogo mark</code> 로 바꿈"], ["nav a.on", "current", "—", "현재 1차 메뉴"], [".right", "container", "—", "우측 액션(알림 · 설정 · 라이트/다크 · 아바타). 아이콘 버튼 md 40 — 알림 · 설정 · 라이트/다크는 .btn-group, 구분선 · 아바타는 묶음 밖"], [".count.dot", "span", "—", "알림 벨의 기본 표시. 숫자는 Caption 2 11, 99 초과 99+"], [".avatar", "span", "—", "이니셜 32 (sm 24)"]],
    spec: [["Size", "높이 62 · 좌우 padding 20 · 왼쪽 영역 240 · 아이콘 버튼 40 · 검색 40"], ["Container", "surface/elevated/primary · 하단 line/neutral/secondary"], ["Label", "메뉴 14 Medium secondary · 로고 16 Bold"], ["Selected", "foreground/brand/primary 글자 14 Bold · 아래 2px foreground/brand/primary 선(다른 항목은 투명 2px) · 면 · 모서리 없음 · hover 해도 같음 · 메뉴 사이 8"]],
    figma: { frame: "Top Navigation", sizes: { md: { h: 62 } }, variants: { menu: {}, search: {} }, states: ["default", "active"] },
  },

  /* ------------------------------------------------ Accordion */
  "accordion": {
    status: "ready", react: ["Accordion","AccordionGroup"], css: [".accordion", ".accordion-group"],
    desc: "정보를 접어 두었다가 필요할 때 펼칩니다. 핵심 정보와 필수 입력은 펼쳐 둡니다.",
    choose: [
      ["언제 쓰는가", "긴 설명, 고급 설정, 자주 묻는 질문처럼 당장 보지 않아도 되는 정보를 접어 둘 때 씁니다. 같은 층위의 내용을 바꿔 보여 주려면 <a href=\"#/components/tab\">Tab</a> 을, 순서대로 진행해야 하면 <a href=\"#/components/steps\">Steps</a> 를 씁니다."],
      ["Placement", "설정 폼의 고급 옵션, FAQ · 헤더 안 조작 요소 금지(약관 동의만 예외)"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "Outline 형태와 Medium 크기가 기본이고, 처음에는 <b>닫힌 상태</b>로 둡니다. 사용자가 반드시 봐야 하는 첫 항목만 예외로 펼쳐 둡니다.", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px">
          <summary>고급 탐지 옵션</summary>
          <div class="body">휴리스틱 분석, 메모리 스캔, 스크립트 차단을 개별로 켜고 끕니다. 기본값은 모두 켬입니다.</div>
        </details>` },
      { id: "variant", group: "variant", title: "Variant", desc: "<b>Outline</b> 이 기본입니다. 항목마다 테두리가 있는 카드로, 페이지 바탕 위에 씁니다. <b>Flat</b> 은 테두리 없이 구분선만 있어 카드 · 패널 안에 씁니다. Flat 의 바탕 · 테두리 · 좌우 여백은 항목을 감싼 묶음이 그립니다.", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px"><summary>Outline</summary><div class="body">항목마다 테두리가 있는 카드입니다.</div></details>
        <div class="accordion-group flat" style="max-width:560px">
          <details class="accordion md flat"><summary>Flat</summary><div class="body">구분선으로 나뉩니다.</div></details>
          <details class="accordion md flat"><summary>Flat</summary><div class="body">구분선으로 나뉩니다.</div></details>
        </div>` },
      { id: "size", group: "size", title: "Size", desc: "헤더 높이는 Small 40px · Medium 52px · Large 60px 로 고정하고, 너비는 컨테이너를 채웁니다. 패널 · 사이드 영역에는 Small, 일반 화면에는 Medium, 넓은 안내 화면에는 Large 를 씁니다.", layout: "top", html: `
        <details class="accordion sm outline" style="max-width:560px"><summary>Small</summary><div class="body">헤더 40 · 제목 14</div></details>
        <details class="accordion md outline" style="max-width:560px"><summary>Medium</summary><div class="body">헤더 52 · 제목 16</div></details>
        <details class="accordion lg outline" style="max-width:560px"><summary>Large</summary><div class="body">헤더 60 · 제목 18</div></details>` },
      { id: "state", group: "state", title: "State", desc: "상태는 <b>Collapsed · Expanded · Hover · Disabled</b> 네 가지입니다. Hover 는 헤더 면을 옅게 칠해 누를 수 있는 영역임을 알립니다. Disabled 는 권한처럼 열 수 없는 이유가 있을 때만 쓰고, 그 이유를 보조 정보로 함께 보입니다.", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px"><summary>Collapsed</summary><div class="body">펼친 내용</div></details>
        <details class="accordion md outline" open style="max-width:560px"><summary>Expanded</summary><div class="body">펼친 내용입니다.</div></details>
        <details class="accordion md outline" style="max-width:560px"><summary data-state="hover">Hover</summary><div class="body">펼친 내용</div></details>
        <details class="accordion md outline disabled" style="max-width:560px"><summary tabindex="-1" aria-disabled="true">Disabled <small>권한 필요</small></summary><div class="body">관리자 권한이 있어야 열람할 수 있습니다.</div></details>` },
      { id: "header", group: "variant", title: "Header", desc: "제목은 필수이고 내용을 예측할 수 있는 명사형 · 질문형 한 줄로 씁니다. 개수 · 상태 같은 <b>보조 정보는 오른쪽</b>에 두고, 앞 아이콘은 의미를 보완할 때만 둡니다. 펼침 화살표는 오른쪽에 고정되고 헤더 전체를 누를 수 있습니다. <b>헤더 안에는 버튼 · 체크박스 같은 조작 요소를 두지 않습니다</b>. 예외는 <a href=\"#/patterns/terms-agreement\">Terms Agreement</a> 의 항목 체크박스 하나입니다.", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px"><summary>탐지 예외 목록 <small>12개</small></summary><div class="body">예외로 등록된 해시 · 경로입니다.</div></details>
        <details class="accordion md outline" style="max-width:560px"><summary>${I("info-circle")}유의사항</summary><div class="body">배포 후 최대 5분 안에 적용됩니다.</div></details>` },
      { id: "group", group: "variant", title: "Group", desc: "여러 항목은 8px 간격으로 묶고, <b>여러 개를 동시에 펼칠 수 있는 것</b>이 기본입니다. 한 묶음에는 3~7개를 권장하고, 더 많으면 검색 · 필터나 별도 페이지를 씁니다.", layout: "top", html: `
        <div class="accordion-group" style="max-width:560px">
          <details class="accordion md outline" open><summary>일반</summary><div class="body">정책 이름, 설명, 적용 그룹</div></details>
          <details class="accordion md outline"><summary>스케줄</summary><div class="body">적용 요일과 시간대</div></details>
          <details class="accordion md outline"><summary>알림</summary><div class="body">차단 시 알림 받을 채널</div></details>
        </div>` },
      { id: "single", group: "variant", title: "Single open", desc: "항목들에 같은 묶음 이름을 주면 하나를 펼칠 때 나머지가 닫힙니다. 브라우저가 지원할 때만 동작합니다. FAQ 처럼 <b>한 번에 하나만 읽는 목록</b>에만 씁니다.", layout: "top", html: `
        <div class="accordion-group" style="max-width:560px">
          <details class="accordion md outline" name="faq" open><summary>정책은 언제 적용되나요?</summary><div class="body">배포 버튼을 누른 뒤 에이전트가 다음 체크인(최대 5분)에서 받아 적용합니다.</div></details>
          <details class="accordion md outline" name="faq"><summary>차단된 파일은 어디에 보관되나요?</summary><div class="body">격리 저장소에 30일 보관 후 자동 삭제됩니다.</div></details>
          <details class="accordion md outline" name="faq"><summary>예외 처리는 어떻게 하나요?</summary><div class="body">정책 › 예외 목록에서 해시 또는 경로를 등록합니다.</div></details>
        </div>` },
      { id: "body", group: "variant", title: "Body", desc: "본문에는 텍스트와 폼 요소를 둘 수 있습니다. <b>아코디언 안에 아코디언을 넣지 않습니다</b>. 내용이 길면 높이를 제한하고 스크롤합니다.", layout: "top", html: `
        <details class="accordion md outline" open style="max-width:560px">
          <summary>변경 이력 <small>최근 30일</small></summary>
          <div class="body" style="max-height:120px;overflow:auto">2026. 10. 28 실시간 보호 켬<br>2026. 10. 21 USB 검사 예외 추가<br>2026. 10. 14 스케줄 변경(평일 09–18)<br>2026. 10. 07 알림 채널 추가<br>2026. 09. 30 정책 생성</div>
        </details>` },
    ],
    props: [
      ["variant / .outline · .flat", "outline | flat", "outline", "형태. Outline 은 항목마다 테두리가 있는 카드(페이지 바탕 위), Flat 은 구분선형(카드 · 패널 안 — <code>.accordion-group.flat</code> 과 함께)"],
      ["size", "sm | md | lg", "md", "헤더 높이 40 · 52 · 60 고정, 제목 14 · 16 · 18"],
      ["title / summary", "ReactNode", "—", "제목(필수). 명사형 · 질문형 한 줄 권장. 앞 아이콘은 <code>summary &gt; svg</code>"],
      ["extra / summary small", "ReactNode", "—", "오른쪽 보조 정보(개수 · 상태 · 비활성 이유)"],
      ["open / defaultOpen", "boolean", "false", "펼침 상태. 기본은 닫힘 — 반드시 봐야 하는 첫 항목만 펼쳐 둡니다. React 는 <code>open</code>(제어) 또는 <code>defaultOpen</code> + <code>onOpenChange</code>"],
      ["name", "string", "—", "같은 name 은 하나만 펼침(브라우저 지원 시). FAQ 처럼 한 번에 하나만 읽는 목록에만"],
      ["disabled / .disabled", "boolean", "false", "열 수 없음. 이유를 보조 정보로 함께 보입니다. HTML 은 summary 에 <code>tabindex=\"-1\"</code> 과 <code>aria-disabled=\"true\"</code> 를 함께(React 가 둘 다 넣습니다)"],
      ["bodyStyle / .body", "CSSProperties", "—", "본문. 길면 <code>max-height</code> + <code>overflow</code> 로 높이를 제한합니다. 아코디언 중첩 금지"],
      ["AccordionGroup / .accordion-group", "container", "—", "묶음. Outline 은 간격 8, <code>variant=\"flat\"</code>(<code>.flat</code>)은 간격 0 · 카드 바탕 · 테두리 · 좌우 20. 3~7개 권장"],
    ],
    spec: [["Size", "헤더 sm 40 · md 52 · lg 60 · 본문 padding sm 0 16 12 · md 0 20 16 · lg 0 24 20 (Flat 은 좌우 4)"], ["Container", "radius/lg 8 · Outline 은 line/neutral/secondary 1px · Hover 는 헤더 면 surface/neutral/secondary"], ["Label", "제목 14 · 16 · 18 SemiBold · 보조 정보 12 tertiary · 본문 Label 1/Reading 14 secondary(sm 12)"], ["Motion", "본문 높이는 --motion-base 로 보간(::details-content 미지원 브라우저는 즉시 열림) · 셰브론은 --motion-fast 로 회전 · Hover 면은 --motion-fast"]],
    figma: { frame: "Accordion", radius: "radius/lg", sizes: { sm: { h: 40, fs: 14 }, md: { h: 52, fs: 16 }, lg: { h: 60, fs: 18 } }, variants: { outline: { stroke: "--line-neutral-secondary" }, flat: {} }, states: ["collapsed", "expanded", "hover", "disabled"], hover: { bg: "--surface-neutral-secondary" } },
  },

  /* ------------------------------------------------ Card */
  "card": {
    status: "ready", react: ["Card","CardHead","CardTitle","CardDesc","CardMeta","CardFoot","CardGrid"], css: [".card", ".card-grid"], borrows: [".tag", ".btn", ".select-btn", ".sparkline", ".skeleton", ".tbl", ".indicator", ".empty"],
    desc: "관련 정보와 그 정보에 대한 액션을 한 덩어리로 묶는 컨테이너입니다. 대시보드 위젯 · 상세 화면의 정보 블록 · 선택지 묶음에 씁니다.",
    choose: [
      ["언제 쓰는가", "관련된 정보와 그 정보로 할 수 있는 동작을 한 덩어리로 묶을 때 씁니다. 숫자 하나를 강조하려면 KPI 를, 그래프를 담으려면 <a href=\"#/components/data-visual\">Chart Card</a> 를 씁니다. 화면 전체를 감싸는 틀로는 쓰지 않습니다."],
      ["Placement", "대시보드 그리드(minmax 260 · gap 20) · 상세 정보 블록 · 선택지 묶음 · 카드 안 카드 금지"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "헤더 · 본문 · 푸터 순서로 둡니다. 헤더에는 제목과 오른쪽 요소 하나를 둡니다. 푸터 동작은 오른쪽에 모으고 강조 버튼은 하나만 둡니다. 카드 면과 1px 테두리로 구획하고 그림자는 두지 않습니다.", html: `
        <div class="card" style="width:360px">
          <div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div>
          <p class="desc">1,000석 중 842석 사용 중. 2026. 12. 31 만료.</p>
          <div class="card-foot"><div class="btn-group"><button type="button" class="btn sm outline assistive">라이선스 상세</button><button type="button" class="btn sm solid primary">라이선스 갱신</button></div></div>
        </div>` },
      { id: "header", group: "variant", title: "Header", desc: "헤더 오른쪽에는 상태 Tag, 기간을 고르는 Select Button, '전체 보기' 텍스트 버튼 가운데 <b>하나만</b> 둡니다. 기간 선택은 바뀌는 패널이 없으므로 Tab 이 아니라 Select Button 을 씁니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card" style="width:300px">
            <div class="card-head"><h3 class="title">에이전트 연결</h3><span class="tag ok">정상</span></div>
            <p class="desc">1,284대 중 1,247대 온라인</p>
          </div>
          <div class="card" style="width:300px">
            <div class="card-head"><h3 class="title">주간 탐지 추이</h3><div class="select-btn" role="radiogroup" aria-label="기간"><button type="button" class="on" role="radio" aria-checked="true">7일</button><button type="button" role="radio" aria-checked="false">30일</button></div></div>
            <div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div>
            <p class="desc">이번 주 탐지 <b>412</b>건, 지난주보다 18% 증가</p>
          </div>
          <div class="card" style="width:300px">
            <div class="card-head"><h3 class="title">정책 배포</h3><button type="button" class="btn sm text assistive">전체 보기</button></div>
            <p class="desc">대기 중인 배포 3건 · 마지막 배포 09:12</p>
          </div>
        </div>` },
      { id: "status", group: "variant", title: "Status", desc: "자산 · 서버 · 에이전트를 보여 주는 카드입니다. 제목 옆에 상태 Indicator 를 둡니다. 본문에는 버전 · 그룹 · IP · 마지막 접속 같은 키-값 행을, 푸터에는 동작을 둡니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card" style="width:320px">
            <div class="card-head"><h3 class="title">PC-2041</h3><span class="indicator ok">온라인</span></div>
            <dl class="card-meta"><dt>에이전트</dt><dd>6.2.1</dd><dt>그룹</dt><dd>개발팀</dd><dt>IP</dt><dd>10.20.4.41</dd><dt>마지막 접속</dt><dd>2026. 11. 02 09:41</dd></dl>
            <div class="card-foot"><div class="btn-group"><button type="button" class="btn sm outline assistive">로그 보기</button><button type="button" class="btn sm solid primary">원격 점검</button></div></div>
          </div>
          <div class="card" style="width:320px">
            <div class="card-head"><h3 class="title">SRV-DB-01</h3><span class="indicator warn">점검 필요</span></div>
            <dl class="card-meta"><dt>에이전트</dt><dd>6.1.8 · 업데이트 필요</dd><dt>그룹</dt><dd>서버</dd><dt>IP</dt><dd>10.20.1.12</dd><dt>마지막 접속</dt><dd>2026. 11. 01 22:05</dd></dl>
            <div class="card-foot"><div class="btn-group"><button type="button" class="btn sm outline assistive">로그 보기</button><button type="button" class="btn sm solid primary">업데이트</button></div></div>
          </div>
        </div>` },
      { id: "columns", group: "variant", title: "Columns", desc: "설정 화면의 개인 정보처럼 항목이 많고 값이 긴 키-값은 두 칸으로 나눠 라벨을 위에, 값을 아래에 둡니다. 긴 값은 두 칸을 다 씁니다. 좁은 화면에서는 한 칸으로 쌓입니다.", html: `
        <div class="card" style="width:min(560px,100%)">
          <div class="card-head"><h3 class="title">개인 정보</h3><button type="button" class="btn sm outline assistive" aria-label="개인 정보 편집">${I("edit",16)}편집</button></div>
          <dl class="card-meta columns">
            <div><dt>이름</dt><dd>김민준</dd></div>
            <div><dt>직함</dt><dd>보안 관리자</dd></div>
            <div><dt>이메일</dt><dd>minjun.kim@example.com</dd></div>
            <div><dt>휴대전화</dt><dd>010-1234-5678</dd></div>
            <div class="wide"><dt>소개</dt><dd>엔드포인트 보안 정책과 에이전트 배포를 맡고 있습니다.</dd></div>
          </dl>
        </div>` },
      { id: "list", group: "variant", title: "List", desc: "최근 이벤트나 위협 Top 5 처럼 표 · 목록을 카드 폭까지 채울 때는 여백 없는 카드를 씁니다. 카드의 안쪽 여백과 간격이 0 이고, 헤더에만 위아래 16px · 좌우 24px 여백을 둡니다. 헤더 오른쪽에는 '전체 보기' 텍스트 버튼을 둡니다. 표는 바깥 테두리가 없으므로 그대로 넣습니다. List 는 자체 테두리가 있어 넣으면 테두리가 두 겹이 됩니다.", html: `
        <div class="card flush" style="width:400px">
          <div class="card-head"><h3 class="title">최근 이벤트</h3><button type="button" class="btn sm text assistive">전체 보기</button></div>
          <table class="tbl compact">
            <thead><tr><th>시간</th><th>이벤트</th><th class="num">횟수</th></tr></thead>
            <tbody>
              <tr><td>09:41</td><td>USB 연결 차단</td><td class="num">3</td></tr>
              <tr><td>09:12</td><td>악성 URL 접속 시도</td><td class="num">12</td></tr>
              <tr><td>08:57</td><td>정책 위반 파일 전송</td><td class="num">1</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "selection", group: "variant", title: "Selection", desc: "정책 템플릿이나 검사 유형처럼 카드 전체를 눌러 고릅니다. 고르는 카드는 눌림 상태를 가진 버튼으로, 다른 화면으로 가는 카드는 링크로 만듭니다. 고르거나 이동하는 카드 안에는 버튼 · 링크를 두지 않습니다. 상태는 Normal · Hover · Selected · Disabled 넷입니다. Disabled 는 투명도로 흐리게 하지 않고 비활성 색으로 칠합니다. 비활성인 이유는 설명 줄에 적고, 그 이유 줄만 옅은 글자로 읽히게 둡니다.", html: `
        <div class="card-grid" style="max-width:600px">
          <button type="button" class="card clickable" aria-pressed="false">${I("scan",24)}<h3 class="title">빠른 검사</h3><p class="desc">실행 중인 프로세스 · 시작 프로그램</p></button>
          <button type="button" class="card clickable" aria-pressed="false" data-state="hover">${I("file-search",24)}<h3 class="title">사용자 지정 검사</h3><p class="desc">폴더 · 확장자를 골라 검사</p></button>
          <button type="button" class="card clickable on" aria-pressed="true">${I("shield-check",24)}<h3 class="title">정밀 검사</h3><p class="desc">모든 드라이브 · 압축 파일 포함</p></button>
          <button type="button" class="card clickable" aria-pressed="false" disabled>${I("database",24)}<h3 class="title">메모리 포렌식</h3><p class="desc">EDR 라이선스가 필요합니다</p></button>
        </div>` },
      { id: "size", group: "size", title: "Size", desc: "기본과 작은 크기 두 가지입니다. 기본은 안쪽 여백 24px · 간격 12px 이고 제목은 Body 1/Normal 16/24 SemiBold 입니다. 작은 크기는 안쪽 여백 16px · 간격 8px 이고 제목은 Label 1/Normal 14/20 SemiBold 입니다. 작은 크기는 밀도 높은 그리드에 씁니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card md" style="width:300px"><div class="card-head"><h3 class="title">md</h3><span class="tag ok">정상</span></div><p class="desc">padding 24 · gap 12 · 제목 16/24</p></div>
          <div class="card sm" style="width:280px"><div class="card-head"><h3 class="title">sm</h3><span class="tag ok sm">정상</span></div><p class="desc">padding 16 · gap 8 · 제목 14/20</p></div>
        </div>` },
      { id: "flat", group: "variant", title: "Flat", desc: "회색 바탕 위에서는 테두리 없이 면 색 차이로만 카드를 가릅니다. 그림자는 두지 않습니다. 흰 바탕 위에서는 카드가 바탕과 같은 색이 되므로 쓰지 않습니다. 테두리 자리 1px 은 남아 있어 테두리 있는 카드와 크기가 같습니다.", html: `
        <div style="background:var(--background-neutral-secondary);padding:24px;border-radius:var(--radius-lg);display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card flat" style="width:min(300px,100%)">
            <div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div>
            <p class="desc">1,000석 중 842석 사용 중. 2026. 12. 31 만료.</p>
          </div>
          <div class="card flat" style="width:min(300px,100%)">
            <div class="card-head"><h3 class="title">PC-2041</h3><span class="indicator ok">온라인</span></div>
            <dl class="card-meta"><dt>에이전트</dt><dd>6.2.1</dd><dt>그룹</dt><dd>개발팀</dd><dt>IP</dt><dd>10.20.4.41</dd></dl>
          </div>
        </div>` },
      { id: "empty", group: "state", title: "Empty · Error", desc: "카드 틀과 헤더는 남기고 본문 자리만 바꿉니다. 빈 상태에는 '데이터 없음' 문구를 둡니다. 오류에는 빨간 아이콘과 문구, '다시 시도' 버튼을 둡니다. 카드에 이미 테두리와 면이 있으므로 안의 Empty State 는 점선과 면 없이 그리고, 아이콘도 칸 없이 36px 로 그립니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card" style="width:320px">
            <div class="card-head"><h3 class="title">최근 차단 이벤트</h3><button type="button" class="btn sm text assistive">전체 보기</button></div>
            <div class="empty"><span class="ico">${I("inbox",24)}</span><b>차단 이벤트 없음</b><span>최근 24시간 동안 차단된 이벤트가 없습니다.</span></div>
          </div>
          <div class="card" style="width:320px">
            <div class="card-head"><h3 class="title">위협 탐지 추이</h3></div>
            <div class="empty error"><span class="ico">${I("alert-triangle",24)}</span><b>데이터를 불러오지 못했습니다</b><span>잠시 후 다시 시도하세요.</span><button type="button" class="btn sm outline assistive">${I("refresh",16)}다시 시도</button></div>
          </div>
        </div>` },
      { id: "loading", group: "state", title: "Loading", desc: "데이터를 기다리는 동안 내용 자리에 Skeleton 을 넣고, 카드에 불러오는 중이라는 표시를 답니다. 다 불러오면 같은 자리를 실제 내용으로 바꿉니다.", html: `
        <div class="card" style="width:360px" aria-busy="true">
          <span class="skeleton title"></span>
          <span class="skeleton text"></span>
          <span class="skeleton text short"></span>
        </div>` },
    ],
    props: [
      ["Card / .card", "container", "—", "flex column · 최소 폭 260 · radius/lg · 1px line/neutral/secondary · surface/elevated/primary. 화면 전체를 감싸는 틀로 쓰지 않고, 카드 안에 카드를 겹치지 않습니다"],
      ["size / .sm · .md", "\"sm\" | \"md\"", "\"md\"", "md padding 24 · gap 12 · 제목 Body 1/Normal 16/24 600 / sm padding 16 · gap 8 · 제목 Label 1/Normal 14/20 600 — 밀도 높은 그리드"],
      ["CardHead · CardTitle / .card-head · .title", "element", "—", "제목 + 오른쪽 요소 하나(상태 Tag · Select Button · '전체 보기' 텍스트 assistive 버튼 중 하나). <code>CardTitle</code> 기본 h3"],
      ["CardDesc / .desc", "element", "—", "Label 1/Reading 14 secondary"],
      ["CardMeta / dl.card-meta", "element", "—", "상태 카드의 키-값 행 — dt secondary · dd primary · 14/22, 키 열은 가장 긴 키에 맞춤. React <code>items={[{ label, value }]}</code> 또는 dt · dd 자식"],
      ["columns / dl.card-meta.columns", "boolean", "false", "두 칸 키-값 — 항목마다 <code>div</code>(dt + dd), 라벨 Label 2 13/18 secondary 위 · 값 Body 1/Normal 16/24 primary 아래, 칸 사이 24 · 줄 사이 20. <code>.wide</code> 는 두 칸을 씀. 767 이하 한 칸. React <code>CardMeta columns</code> · items 의 <code>wide</code>"],
      ["CardFoot / .card-foot", "element", "—", "액션 오른쪽 정렬 · 버튼이 둘 이상이면 안에 .btn-group(간격은 버튼 크기 — sm 6) · 강조 버튼은 하나"],
      ["variant / .flat", "\"outline\" | \"flat\"", "\"outline\"", "outline 1px line/neutral/secondary 보더 / flat 보더 색 없음(두께 1px 는 남아 크기 같음) — 주변에 배경색 <code>background/neutral/secondary</code> 이 있을 때만. 흰 바탕 위 금지 · 그림자 없음. KPI · Chart Card 도 같은 옵션"],
      ["flush / .flush", "boolean", "false", "padding · gap 0 — 테두리 없는 표 · 목록을 카드 폭까지. 헤더만 자체 여백(md 16 · 24 / sm 12 · 16). 안의 Table 은 테두리가 없어 그대로(가로 스크롤이 필요 없으면 <code>wrap={false}</code>) · List 는 자체 테두리가 있어 두 겹 · 바닥에 붙은 표는 마지막 행 선 없음(카드 테두리가 경계)"],
      ["clickable / .clickable", "boolean", "false", "카드 전체가 눌림 — 이동이면 <code>a</code>, 선택이면 <code>button</code> + <code>aria-pressed</code>(React <code>as</code>). hover shadow/2. 안에 버튼 · 링크를 두지 않습니다"],
      ["selected / .on", "boolean", "false", "선택됨 — 안쪽 2px brand 링 + surface/brand/subtle, 앞 아이콘 brand. 포커스 외곽선과 함께 보입니다"],
      ["disabled / :disabled · aria-disabled", "boolean", "false", "고를 수 없는 선택 카드 — surface/disable 면 · 제목과 아이콘 foreground/disable, hover 없음, 눌러도 선택되지 않음. 이유는 <code>.desc</code> 에 적고 그 줄은 tertiary 로 읽히게 둡니다. button 이면 <code>disabled</code>, 그 밖은 <code>aria-disabled</code>"],
      ["loading / aria-busy", "boolean", "false", "내용 자리를 Skeleton 으로 바꾸고 <code>aria-busy</code> 를 켭니다"],
      ["CardGrid / .card-grid", "container", "—", "auto-fill minmax(260px, 1fr) · gap 20. 안의 선택 카드는 ds.js 가 단일 선택으로 묶어 <code>.on</code> · <code>aria-pressed</code> 를 갱신하고 <code>ds:select</code> 를 발행합니다"],
      ["compact / .compact", "boolean", "false", "<b>호환용</b> — sm 의 옛 이름. React 는 개발 모드에서 경고합니다"],
      ["bordered / .bordered", "boolean", "false", "<b>호환용 — 효과 없음.</b> 기본 카드가 이미 1px 보더입니다"],
    ],
    spec: [["Size", "md padding 24 · gap 12 · sm padding 16 · gap 8 · flush 0 · 최소 폭 260"], ["Container", "radius/lg 8 · 1px line/neutral/secondary · flush 카드 바닥에 붙은 표는 마지막 행 선 없음(카드 테두리가 경계) · surface/elevated/primary · flat 은 보더 색 없음(background/neutral/secondary 위 전용) · 선택 2px brand 링 · Disabled surface/disable"], ["Label", "제목 md Body 1/Normal 16/24 SemiBold · sm Label 1/Normal 14/20 SemiBold · 설명 Label 1/Reading 14 secondary · 키 secondary · 값 primary · 두 칸 키-값은 라벨 Label 2 13/18 · 값 Body 1/Normal 16/24"], ["Motion", "선택 · 이동 카드 hover --motion-fast 로 그림자 없음 → shadow/2"]],
    figma: { frame: "Card", radius: "radius/lg", sizes: { md: { pad: 24 }, sm: { pad: 16 }, flush: { pad: 0 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-secondary" }, status: {}, list: {}, selection: {}, empty: {}, error: {} }, variant: { outline: { stroke: "--line-neutral-secondary" }, flat: { stroke: "transparent", canvas: "--background-neutral-secondary" } }, states: ["default", "hover", "selected", "focused", "disabled", "loading"] },
  },

  /* ------------------------------------------------ Popup */
  "popup": {
    status: "ready", react: ["Popup","PopupSurface","PopupTitle","PopupBody","PopupActions","PopupForm"], css: [".popup", ".popup-backdrop"], borrows: [".btn", ".field", ".checkbox", ".notice"],
    desc: "사용자의 확인이나 짧은 입력을 받아야 진행할 때 화면 위에 띄우는 모달입니다. 되돌리기 어려운 동작 앞에 둡니다. 목록을 보며 내용을 확인하려면 <a href=\"#/components/side-panel\">Side Panel</a> 을 씁니다.",
    choose: [
      ["언제 쓰는가", "응답을 받아야 진행할 수 있을 때만 씁니다. 자주 띄우면 흐름을 끊습니다. 큰 표나 가로 스크롤, 여러 단계 이동이 필요하면 넣지 않고 별도 페이지로 보냅니다."],
      ["Placement", "화면 중앙. 열리면 안으로 포커스를 옮기고, 닫으면 연 요소로 돌려보냅니다"],
    ],
    principles: [
      ["닫기", "헤더의 닫기 버튼은 꼭 둡니다. Esc 와 취소 버튼으로도 닫힙니다. 입력하는 중이거나 위험 확인이면 배경을 눌러도 닫지 않습니다. 입력한 뒤 Esc · 닫기 · 취소로 닫으려 하면 바로 닫지 않고 팝업 안에서 버릴지 묻습니다. 포커스는 '계속 편집' 에 놓습니다."],
      ["첫 포커스", "열 때 닫기 버튼과 위험한 실행 버튼은 건너뜁니다. 입력칸이 있으면 입력칸에, 없으면 취소 버튼에 포커스를 놓습니다."],
      ["주 버튼", "주 버튼의 이름은 제목의 동작을 그대로 씁니다. '정책을 배포할까요?' 의 주 버튼은 '확인' 이 아니라 '배포' 입니다."],
      ["처리 중", "처리하는 동안 주 버튼에 로딩 표시를 하고, 닫기 버튼 · 취소 · Esc · 배경 누름으로 닫는 길을 모두 막습니다. 실패하면 팝업을 그대로 두고 안에 오류를 보입니다. 입력한 내용을 잃지 않게 하려는 것입니다."],
      ["위험 확인", "위험 확인은 제목을 위험 색으로 칠하고, 화면 낭독기에 경고 대화상자로 알립니다. 확인 문구를 입력받는 것은 복구할 수 없고 대량일 때만 둡니다. 모두 확인받으면 습관적으로 넘기게 됩니다. 삭제 버튼은 끄지 않고, 누르면 문구를 검사해 다르면 입력칸 아래에 고치는 법을 적습니다."],
      ["긴 본문", "본문만 스크롤하고 제목과 버튼은 그 자리에 둡니다."],
      ["폭", "폭은 기본 440px 입니다. 넓은 640px 은 필드가 두 열이거나 미리보기를 함께 보여 줄 때만 씁니다."],
      ["겹침", "모달 위에 모달을 띄우지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "제목 · 본문 · 액션으로 이루어진 기본 구성입니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="d-title">
          <h3 class="popup-title" id="d-title">정책을 배포할까요?</h3>${popX()}
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">배포</button></div></div>
        </div>
      ` },
      { id: "confirm", group: "variant", title: "Confirm", desc: "실제 화면에서는 뒤를 어둡게 덮는 배경 위에 띄웁니다. 그 모습은 코드 탭에 있고, 예제는 팝업만 보여 줍니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="c-title">
          <h3 class="popup-title" id="c-title">정책을 배포할까요?</h3>${popX()}
          <p class="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다. 에이전트는 다음 체크인(최대 5분)에서 정책을 받습니다.</p>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">배포</button></div></div>
        </div>`, react: `
        import { useState } from "react";
        export function DeployConfirm() {
          const [open, setOpen] = useState(false);
          return (
            <>
              <button type="button" className="btn md solid primary" onClick={() => setOpen(true)}>배포</button>
              {open && (
                <div className="popup-backdrop" onClick={() => setOpen(false)}>
                  <div className="popup" role="dialog" aria-modal="true" aria-labelledby="c-title" onClick={e => e.stopPropagation()}>
                    <h3 className="popup-title" id="c-title">정책을 배포할까요?</h3>
                    <p className="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다.</p>
                    <div className="popup-actions">
                      <button type="button" className="btn md outline assistive" onClick={() => setOpen(false)}>취소</button>
                      <button type="button" className="btn md solid primary" onClick={() => setOpen(false)}>배포</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }` },
      { id: "danger", group: "variant", title: "Danger Confirm", desc: "삭제나 초기화를 확인받습니다. 제목은 위험 색이고, 주 버튼은 삭제 버튼을 씁니다. 복구할 수 없고 대량이면 확인 문구를 입력받습니다. 삭제 버튼은 늘 켜 두고, 누르면 문구를 검사해 다르면 막고 고치는 법을 알립니다. 배경을 눌러도 닫히지 않습니다.", html: `
        <div class="popup danger" role="alertdialog" aria-modal="true" aria-labelledby="dg-title" aria-describedby="dg-body">
          <h3 class="popup-title" id="dg-title">정책 12개를 삭제할까요?</h3>${popX()}
          <p class="popup-body" id="dg-body">삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</p>
          <form class="popup-form" id="dg-form" data-validate novalidate><div class="field"><label for="confirm">확인을 위해 <b>삭제</b>를 입력하세요</label><input id="confirm" required pattern="\\s*삭제\\s*" autocomplete="off" data-messages='{"required":"확인 문구를 입력하세요.","pattern":"문구가 다릅니다. 삭제를 그대로 입력하세요."}'><span class="help" aria-live="polite"></span></div></form>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="submit" form="dg-form" class="btn md solid negative">삭제</button></div></div>
        </div>` },
      { id: "form", group: "variant", title: "Form", desc: "필드 1~3개의 짧은 입력을 받습니다. 그보다 많으면 별도 페이지로 보냅니다. 입력을 시작하면 배경을 눌러도 닫히지 않습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="f-title">
          <h3 class="popup-title" id="f-title">예외 추가</h3>${popX()}
          <div class="popup-form">
            <div class="field"><label for="hash">파일 해시(SHA-256)</label><input id="hash" placeholder="64자리 16진수"></div>
            <div class="field"><label for="reason">사유</label><input id="reason" placeholder="예: 사내 배포 도구"></div>
            ${cb("모든 그룹에 적용")}
          </div>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">추가</button></div></div>
        </div>` },
      { id: "busy", group: "state", title: "Busy", desc: "처리하는 동안 주 버튼은 로딩 표시를 하고, 닫기 버튼과 취소는 꺼집니다. Esc 나 배경 누름으로도 닫히지 않습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="b-title" aria-busy="true">
          <h3 class="popup-title" id="b-title">정책을 배포할까요?</h3>${popX().replace("data-popup-close", "data-popup-close disabled")}
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close disabled>취소</button><button type="button" class="btn md solid primary loading" aria-busy="true">배포</button></div></div>
        </div>` },
      { id: "failed", group: "state", title: "Failed", desc: "팝업을 닫지 않고 안에 오류를 보입니다. 원인과 다음 행동을 함께 적습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="e-title">
          <h3 class="popup-title" id="e-title">정책을 배포할까요?</h3>${popX()}
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="notice danger" role="alert"><span class="ico">${I("alert-circle",20,{style:"filled"})}</span><div><b>배포하지 못했습니다</b>정책 서버에 연결하지 못했습니다. 다시 시도하세요.</div></div>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">다시 배포</button></div></div>
        </div>` },
    ],
    props: [[".popup-backdrop", "overlay", "—", "fixed · 중앙 정렬 · 바깥 여백 24"], [".popup", "dialog", "—", "role=dialog aria-modal aria-labelledby. 폭 440 (lg 640), 높이는 화면 안"], [".popup-title / .popup-body / .popup-actions", "elements", "—", "제목 18 / 본문 14 · 길면 스크롤 / 액션 우측 — 버튼 둘 이상은 안에 .btn-group(md 8)"], [".popup-close", "button", "필수", "제목 바로 뒤. aria-label · data-popup-close"], ["data-confirm-discard=\"false\"", "속성", "—", "입력한 뒤 닫을 때 버릴지 묻지 않습니다. 위험 확인 · 처리 중, 주 버튼에 단 data-popup-close, DS.popup.close() 는 원래 묻지 않습니다. React confirmDiscard={false}"], [".danger", "boolean", "false", "제목 danger 색. role=alertdialog + aria-describedby 와 함께"], ["aria-busy", "\"true\"", "—", "처리 중. X · 취소 · Esc · 배경이 막힙니다(DS.popup.busy)"], [".popup-form", "container", "—", "필드 세로 16px 간격"]],
    spec: [["Size", "폭 440 (lg 640) · padding 24"], ["Container", "radius/xl 14 · shadow/3 · 배경 effect/dimmer/primary(라이트 52% · 다크 74%)"], ["Label", "제목 Headline 1 18 Bold · 본문 Label 1/Reading 14"]],
    figma: { frame: "Popup", radius: "radius/xl", sizes: { md: { w: 440 }, lg: { w: 640 } }, variants: { confirm: {}, danger: {}, form: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ Side Panel */
  "side-panel": {
    status: "ready", react: ["SidePanel","SidePanelSurface"], css: [".side-panel", ".side-panel-dim", ".side-panel-header", ".side-panel-title", ".side-panel-body", ".side-panel-footer"], borrows: [".btn", ".tbl"],
    desc: "목록이나 화면을 그대로 둔 채 상세를 오른쪽에서 보여 줍니다. 응답을 받아야 진행하면 <a href=\"#/components/popup\">Popup</a> 을 씁니다.",
    choose: [
      ["언제 쓰는가", "목록을 보면서 한 항목을 확인할 때 씁니다. 로그와 이벤트 상세가 대표적입니다. 양식 전체를 채우는 일은 별도 페이지로 보냅니다."],
      ["Placement", "화면 오른쪽 끝 · 위아래 전체. Popup(100)과 Toast(110) 아래"],
    ],
    principles: [
      ["비모달이 기본", "뒤 페이지를 그대로 쓸 수 있습니다. 포커스를 가두지 않고 스크롤도 잠그지 않습니다. 다른 항목을 누르면 패널 내용을 바꿉니다."],
      ["모달", "패널의 내용을 끝내기 전에 뒤 페이지를 건드리면 안 될 때만 모달로 엽니다. 모달이면 뒤를 덮는 배경이 깔리고, 포커스가 패널 안에 머물며, 뒤 페이지의 스크롤이 잠깁니다."],
      ["포커스", "열면 패널로 옮깁니다. 닫을 때 포커스가 패널 안에 있었으면 연 요소로 돌려보냅니다. 사용자가 뒤 페이지로 옮겨 갔으면 뺏지 않습니다."],
      ["닫기", "닫기 버튼은 필수입니다. Esc 는 포커스가 패널 안에 있을 때 닫습니다. 비모달은 바깥을 눌러도 닫히지 않습니다. 모달은 입력하는 중이면 배경을 눌러도 닫지 않고, Esc · 닫기 · 취소로 닫으려 하면 패널 안에서 버릴지 묻습니다."],
      ["개수", "한 번에 하나입니다. 다른 패널을 열면 바꿔 끼웁니다."],
      ["위에 띄우는 것", "패널 안에서 <a href=\"#/components/popup\">Popup</a> 을 띄울 수 있습니다. 모달 패널 위에는 띄우지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "머리글 · 본문 · 바닥글로 이루어집니다. 예제는 띄우지 않은 모습입니다.", html: `
        <section class="side-panel" role="dialog" aria-labelledby="sp-d">
          ${spHead("sp-d", "이벤트 상세")}
          <div class="side-panel-body">${spFacts(SP_EVENT)}</div>
          <div class="side-panel-footer"><div class="btn-group"><button type="button" class="btn md outline assistive" data-panel-close>닫기</button><button type="button" class="btn md solid primary">예외 추가</button></div></div>
        </section>` },
      { id: "long", group: "variant", title: "Long Body", desc: "본문만 스크롤합니다. 머리글과 바닥글은 그 자리에 있습니다.", html: `
        <section class="side-panel" role="dialog" aria-labelledby="sp-l" style="height:320px">
          ${spHead("sp-l", "에이전트 상세")}
          <div class="side-panel-body">${spFacts([...SP_EVENT, ["그룹", "본사 · 개발"], ["운영체제", "Windows 11"], ["버전", "4.2.1"], ["마지막 체크인", "2026. 09. 07 14:20"], ["정책 수", "12"], ["라이선스", "2027. 03. 31 까지"]])}</div>
          <div class="side-panel-footer"><button type="button" class="btn md solid primary">격리</button></div>
        </section>` },
      { id: "live", group: "variant", title: "Non-modal", desc: "실제 동작입니다. 패널이 열려 있어도 뒤 페이지를 누르고 스크롤할 수 있습니다.", html: `
        <button type="button" class="btn md outline assistive" data-panel-open="#sp-live">이벤트 상세 열기</button>
        <section class="side-panel" id="sp-live" role="dialog" aria-labelledby="sp-live-t" hidden>
          ${spHead("sp-live-t", "이벤트 상세")}
          <div class="side-panel-body">${spFacts(SP_EVENT)}</div>
        </section>` },
      { id: "modal", group: "variant", title: "Modal", desc: "실제 동작입니다. 배경을 누르거나 Esc 로 닫고, 포커스는 패널 안에 머뭅니다.", html: `
        <button type="button" class="btn md outline assistive" data-panel-open="#sp-modal">격리 설정 열기</button>
        <section class="side-panel lg" id="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-modal-t" data-modal hidden>
          ${spHead("sp-modal-t", "격리 설정")}
          <div class="side-panel-body">${spFacts(SP_EVENT)}</div>
          <div class="side-panel-footer"><div class="btn-group"><button type="button" class="btn md outline assistive" data-panel-close>취소</button><button type="button" class="btn md solid primary" data-panel-close>격리</button></div></div>
        </section>` },
    ],
    props: [
      [".side-panel", "section", "—", "role=dialog · aria-labelledby. 폭 400 (.lg 560)"],
      [".fixed", "boolean", "false", "화면 오른쪽에 띄웁니다. DS.panel.open 이 붙입니다"],
      ["data-modal", "boolean", "false", "배경 · 포커스 가둠 · 스크롤 잠금. aria-modal=true 와 함께"],
      ["data-confirm-discard=\"false\"", "속성", "—", "모달 패널에서 입력한 뒤 닫을 때 버릴지 묻지 않습니다. 주 버튼에 단 data-panel-close 와 DS.panel.close() 는 저장 뒤 닫기라 원래 묻지 않습니다. React confirmDiscard={false}"],
      ["data-panel-open / data-panel-close", "속성", "—", "여는 버튼(값은 선택자) / 닫는 버튼"],
      ["DS.panel.open(sel) / close()", "API", "—", "닫으면 ds:panel-close 가 납니다"],
      [".side-panel-header / -body / -footer", "elements", "—", "본문만 스크롤. 바닥글은 없어도 됩니다"],
    ],
    spec: [["Size", "폭 400 (lg 560) · 머리글 최소 높이 56 · 본문 padding 20 · 바닥글 padding 12 20"], ["Container", "surface/elevated/primary · 왼쪽 선 line/neutral/secondary · shadow/3"], ["Label", "제목 Body 1/Normal 16 SemiBold · 본문 Label 1/Reading 14"], ["Table", "속성 표(.tbl.kv) 머리글 폭 120 · 머리글 오른쪽 선 없음"]],
  },

  /* ------------------------------------------------ Tooltip */
  "tooltip": {
    status: "ready", react: ["Tooltip"], css: [".tooltip", ".tooltip-wrap"], borrows: [".btn", ".indicator"],
    desc: "아이콘 버튼의 이름이나 짧은 보조 설명을 마우스를 올리거나 포커스할 때 보여 줍니다.",
    choose: [
      ["언제 쓰는가", "아이콘 버튼의 이름이나 짧은 보조 설명을 보여 줄 때 씁니다. 사용자가 꼭 읽어야 하는 내용이거나 링크와 버튼이 필요하면 본문에 적거나 <a href=\"#/components/popup\">Popup</a> 을 씁니다."],
      ["Placement", "아이콘 전용 버튼의 이름, 잘린 글자의 전체 보기"],
    ],
    principles: [
      ["내용", "짧은 보조 설명과 아이콘 버튼의 이름만 넣습니다. 필수 정보는 넣지 않습니다. 툴팁을 못 봐도 작업을 끝낼 수 있어야 합니다."],
      ["트리거", "포커스를 받을 수 있는 요소에만 답니다. 비활성 요소와 Tag 처럼 누를 수 없는 요소에는 달지 않습니다."],
      ["되풀이", "보이는 라벨을 되풀이하지 않습니다. 아이콘 전용 버튼은 이름이 곧 툴팁이므로 버튼 이름만 두고, 툴팁을 설명으로 따로 잇지 않습니다."],
      ["안에 넣지 않는 것", "링크와 버튼을 넣지 않습니다. 툴팁 안에는 포커스가 닿지 않기 때문입니다. 단축키를 툴팁에만 적어 두지 않습니다."],
      ["동작", "마우스는 0.3초 뒤, 키보드 포커스는 바로 보입니다. Esc 로 닫습니다. 화면 끝이면 반대쪽으로 뒤집고, 스크롤되는 영역 안에서도 잘리지 않습니다."],
      ["차트 값", "차트의 값 표시는 <a href=\"#/components/data-visual\">Data Visual</a> 의 몫입니다. 이 컴포넌트를 쓰지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "요소 위쪽에 뜨는 기본 위치입니다.", html: `<span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">새로 고침</button><span class="tooltip" role="tooltip">목록을 다시 불러옵니다</span></span>` },
      { id: "position", group: "variant", title: "Position", desc: "기본은 위쪽이고 아래 · 왼쪽 · 오른쪽에도 띄울 수 있습니다. 예제는 늘 보이게 띄워 두었습니다.", html: `
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Top</button><span class="tooltip" role="tooltip">위 (기본)</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Bottom</button><span class="tooltip bottom" role="tooltip">아래</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Left</button><span class="tooltip left" role="tooltip">왼쪽</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Right</button><span class="tooltip right" role="tooltip">오른쪽</span></span>`, style: "gap:104px;padding:64px 72px" },
      { id: "hover", group: "variant", title: "On Hover / Focus", desc: "실제 동작입니다. 아이콘 버튼 위에 마우스를 올리거나 키보드로 포커스하면 툴팁이 뜹니다. 버튼 이름이 곧 툴팁이라 설명으로 따로 잇지 않습니다.", html: `
        <div class="btn-group"><span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip" role="tooltip" id="tt1">새로 고침</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="필터">${I("filter")}</button><span class="tooltip" role="tooltip" id="tt2">필터</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="삭제">${I("trash")}</button><span class="tooltip" role="tooltip" id="tt3">삭제</span></span></div>`, style: "padding-top:64px" },
      { id: "multi", group: "variant", title: "Multiline", desc: "두 줄 이상이면 폭 220px 의 여러 줄 툴팁을 씁니다. 그보다 긴 설명은 도움말 링크로 보냅니다.", html: `
        <span class="indicator warn">검토 필요</span><span class="tooltip-wrap show"><button type="button" class="btn sm text assistive icon-only" aria-label="검토 필요 이유" aria-describedby="tt-multi">${I("info-circle")}</button><span class="tooltip multi" role="tooltip" id="tt-multi">게시자 서명을 확인하지 못한 실행 파일입니다. 신뢰할 수 있는 파일이면 예외로 추가할 수 있습니다.</span></span>`, style: "padding-top:96px" },
    ],
    props: [[".tooltip-wrap", "container", "—", "position:relative 트리거 래퍼"], [".tooltip", "span", "—", "role=tooltip. 기본 위치 위"], ["position", ".bottom | .left | .right", "top", "위치"], [".show", "boolean", "false", "강제 표시(문서·디버그)"], [".multi", "boolean", "false", "여러 줄, 폭 220"], [".quiet", "boolean", "false", "Esc 로 닫힌 상태. ds.js 가 붙이고, 마우스 · 포커스가 떠나면 뗍니다"], [".float", "boolean", "false", "화면 기준 위치. ds.js 가 스크롤 영역 안에서 붙입니다"]],
    spec: [["Size", "높이 28 · padding 6 10 · 트리거와 8px"], ["Container", "radius 6 · surface/neutral/inverse · shadow/2 · 화살표 5px"], ["Label", "Caption 1 12 · 행간 16 · Medium · inverse"]],
    figma: { frame: "Tooltip", radius: 6, sizes: { md: { h: 30 } }, variants: { top: {}, bottom: {}, left: {}, right: {} }, states: ["default", "multiline"] },
  },

  /* ------------------------------------------------ Notification */
  "notification": {
    status: "ready", react: ["Notice","Toast","ToastStack","Banner","ToastProvider","useToast"], css: [".notice", ".toast", ".toast-stack", ".banner"], borrows: [".btn"],
    desc: "시스템 상태와 결과를 알립니다. 페이지 안에 머무는 Notice, 잠시 떴다 사라지는 Toast, 화면 맨 위 전체 폭에 띄우는 공지 Banner 를 구분해 씁니다.",
    choose: [
      ["언제 쓰는가", "사용자가 언제까지 봐야 하는지로 고릅니다. 방금 한 동작의 결과는 Toast, 화면 일부의 지속 상태는 Notice, 제품 전체에 영향을 주는 공지는 Banner 로 알리고, 응답을 받아야 진행하면 <a href=\"#/components/popup\">Popup</a> 을 씁니다. 기준표는 <a href=\"#/foundations/interaction\">Interaction</a> 에 있습니다."],
      ["Placement", "Notice 는 페이지 헤더 아래, Toast 우측 하단, Banner 헤더 위"],
    ],
    principles: [
      ["Toast 시간", "기본 4초, 실행 취소 같은 동작이 있으면 10초입니다. 마우스를 올리거나 포커스가 들어오면 묶음 전체의 시간이 멈춥니다."],
      ["오류 Toast", "오류 Toast 는 닫을 때까지 남고 닫기 버튼이 있습니다. 표시 시간을 정해 줘도 사라지지 않습니다."],
      ["쌓임", "동시에 3개까지입니다. 넘치면 자동으로 사라지는 것부터 지웁니다. 닫을 때까지 남는 오류는 밀리지 않으므로 3개를 넘을 수 있습니다."],
      ["같은 알림", "동작이 없는 같은 문구는 쌓지 않고 시간을 다시 잽니다. 동작이 있으면 실행 취소 대상이 서로 달라 합치지 않습니다."],
      ["Banner", "Banner 는 한 번에 하나만 둡니다. 닫으면 닫혔다는 이벤트가 나고, 다시 띄울지는 제품이 정합니다. 안의 버튼은 끄지 않습니다. 제품 색 면 위에서는 꺼진 글자가 보이지 않기 때문입니다. 할 수 없는 동작이면 버튼을 빼고 문구로 알립니다. 처리하는 동안 버튼에 로딩 표시를 하는 것은 괜찮습니다."],
      ["알리는 세기", "화면 낭독기가 하던 말을 끊고 바로 읽는 알림은 바로 알아야 하는 위험에만 씁니다. Toast 는 읽던 말이 끝난 뒤에 읽힙니다."],
      ["문구", "오류에는 원인과 다음 행동을 함께 적습니다. 폼 필드 오류는 Toast 로 알리지 않고 필드 아래에 적습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "본문 안에 머무는 기본 인라인 알림입니다.", html: `<div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle",18,{style:"filled"})}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div></div>` },
      { id: "notice", group: "variant", title: "Notice (Inline)", desc: "페이지 안에 머무는 알림입니다. Info · Success · Warning · Danger 네 가지가 있습니다. 정보는 화면 낭독기가 읽던 말을 마친 뒤 읽고, 위험은 바로 읽습니다.", html: `
        <div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle",20,{style:"filled"})}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>
        <div class="notice success" role="status" style="max-width:600px"><span class="ico">${I("circle-check",20,{style:"filled"})}</span><div><b>배포 완료</b>1,284대 중 1,284대에 적용되었습니다.</div></div>
        <div class="notice warning" role="status" style="max-width:600px"><span class="ico">${I("alert-triangle",20,{style:"filled"})}</span><div><b>라이선스가 3일 후 만료됩니다</b>만료 시 신규 이벤트 수집이 중단됩니다.<div class="actions"><button type="button" class="btn sm solid primary">갱신 요청</button></div></div></div>
        <div class="notice danger" role="alert" style="max-width:600px"><span class="ico">${I("alert-circle",20,{style:"filled"})}</span><div><b>에이전트 37대 연결 끊김</b>10분 이상 체크인이 없습니다. 네트워크 상태를 확인하세요.<div class="actions"><button type="button" class="btn sm outline assistive">연결 끊긴 에이전트 보기</button></div></div></div>`, layout: "stack" },
      { id: "toast", group: "variant", title: "Toast", desc: "짧은 결과 알림입니다. 우측 하단에 뜨고 4초 뒤 사라지며, 동작이 있으면 10초입니다. 오류는 닫을 때까지 남습니다.", html: `
        <div class="toast-stack" aria-live="polite">
          <div class="toast"><span class="ico">${I("circle-check",20)}</span>정책 'USB 차단' 이 저장되었습니다<button type="button" class="action">실행 취소</button></div>
          <div class="toast danger"><span class="ico">${I("alert-circle",20)}</span>CSV를 내보내지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.<button type="button" class="action">다시 시도</button><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>
        </div>` },
      { id: "banner", group: "variant", title: "Banner", desc: "점검이나 라이선스처럼 시스템 전체에 대한 공지입니다. 헤더 위 전체 폭에 한 번에 하나만 둡니다.", html: `
        <div class="banner" role="status">${I("info-circle",18,{style:"filled"})}9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다. 점검 중 콘솔 접속이 제한됩니다.<button type="button" class="btn sm outline assistive">점검 안내 보기</button><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>`, layout: "stack", style: "padding:24px 0;gap:8px" },
    ],
    props: [[".notice", "div", "—", "role=status | alert. .ico + div(b 제목 + 본문 + .actions) + .close"], ["tone", "info | success | warning | danger", "neutral", "톤별 subtle 배경 · 테두리 없음(톤이 없으면 회색 면 background/neutral/secondary)"], [".toast", "div", "—", "폭 360, 어두운 배경. .action 하나, 닫을 때까지 남으면 .close"], ["data-duration", "ms", "4000", "자동 소멸 시간. 0 이면 닫을 때까지. DS.toast 는 동작이 있으면 10000, 오류는 늘 0"], [".toast-stack", "container", "—", "aria-live=polite, 우측 하단 고정"], [".banner", "div", "—", "전체 폭. accent / .warning / .danger. .close 는 ds:banner-close 를 냅니다"], ["ds:notice-close", "event", "—", "Notice 의 .close 를 누르면 Notice 에서 발생. 사라지는 전환(motion-fast, 줄인 모션은 바로) 뒤에 지운다"]],
    spec: [["Size", "Notice padding 20 18 · Toast 폭 360 · Banner padding 10 20"], ["Container", "Notice radius/lg 8 · 테두리 없음 · 톤별 surface(톤 없음 background/neutral/secondary) · Toast surface/neutral/inverse"], ["Label", "제목 14 Bold · 본문 Label 1/Reading 14"], ["Icon", "Notice 20 · Banner 18 filled · Toast 20 선 아이콘 · 톤 없는 Notice 아이콘 foreground/neutral/secondary · info 는 foreground/accent/cyan"]],
    figma: { frame: "Notification", radius: "radius/lg", sizes: { notice: { minH: 56 }, toast: { w: 360 }, banner: { h: 44 } }, variants: { info: { bg: "--surface-accent-cyan", fg: "--surface-accent-cyan" }, success: { bg: "--surface-positive-primary", fg: "--surface-positive-primary" }, warning: { bg: "--surface-cautionary-primary", fg: "--surface-cautionary-primary" }, danger: { bg: "--surface-negative-primary", fg: "--surface-negative-strong" }, toast: { bg: "--surface-neutral-inverse", fg: "--foreground-neutral-inverse" } }, states: ["default", "with-action", "dismissible"] },
  },

  /* ------------------------------------------------ Loading */
  "loading": {
    status: "ready", react: ["Spinner","Skeleton","SkeletonRow","Progress"], css: [".spinner", ".spinner-wrap", ".skeleton", ".skeleton-row", ".progress", ".progress-row"],
    desc: "기다리는 동안의 상태를 알립니다. 영역의 첫 로딩은 Skeleton, 짧은 동작은 Spinner, 진행률을 알면 Progress 를 씁니다.",
    choose: [
      ["언제 쓰는가", "어떤 표시를 쓸지는 기다리는 시간으로 고르고, 그 기준은 <a href=\"#/foundations/interaction\">Interaction</a> 의 Loading 표를 따릅니다."],
      ["Placement", "Skeleton 은 콘텐츠 자리 그대로, Spinner 는 영역 중앙"],
    ],
    principles: [
      ["1초 미만", "금방 끝날 수도 있는 기다림에는 지연 옵션을 켭니다. 1초 안에 끝나면 표시가 나타나지 않아 깜빡이지 않습니다. 한 번 보이면 0.5초는 유지합니다."],
      ["누른 반응", "버튼의 로딩 표시와 Switch 의 처리 중 표시는 지연 없이 바로 보입니다. 누른 반응이 바로 보여야 두 번 누르지 않습니다."],
      ["Spinner 이름", "Spinner 의 이름에는 '불러오는 중' 만 쓰지 않고 실제 작업을 적습니다."],
      ["Skeleton", "완성될 콘텐츠의 크기와 모양에 맞춥니다."],
      ["Progress", "진행률을 알 때만 씁니다. 진행 값은 꼭 넣습니다. 끝을 알 수 없는 진행 막대는 제공하지 않으므로 그때는 Spinner 를 씁니다."],
      ["오래 걸리는 작업", "10초 넘게 걸릴 것 같으면 진행 막대나 진행 문구로 얼마나 남았는지 알리고, 취소하거나 백그라운드로 돌릴 길을 제공합니다. Spinner 만 오래 돌면 멈춘 것인지 알 수 없습니다."],
      ["줄인 모션", "모션을 줄이는 설정에서도 Spinner, 버튼의 로딩 표시, Switch 의 처리 중 표시는 계속 돕니다. 멈춘 스피너는 고장으로 보이기 때문입니다. Skeleton 과 맥박 표시는 멈춥니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "기본 크기 24px 의 스피너입니다.", html: `<span class="spinner" role="status" aria-label="이벤트 불러오는 중"></span>` },
      { id: "spinner", group: "variant", title: "Spinner", desc: "크기는 작게 16px · 기본 24px · 크게 40px 입니다. 버튼 안에서는 Spinner 대신 Button 의 로딩 상태를 씁니다.", html: `
        <span class="spinner sm" role="status" aria-label="목록 불러오는 중"></span>
        <span class="spinner" role="status" aria-label="정책 불러오는 중"></span>
        <span class="spinner lg" role="status" aria-label="보고서 만드는 중"></span>
        <div class="spinner-wrap" role="status"><span class="spinner"></span>이벤트를 불러오는 중…</div>` },
      { id: "skeleton", group: "variant", title: "Skeleton", desc: "완성될 콘텐츠의 형태를 미리 보여 줍니다. 목록과 카드를 처음 불러올 때 씁니다.", html: `
        <div style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:14px" aria-busy="true">
          <div class="skeleton-row"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text"></span></div></div>
          <div class="skeleton-row"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text short"></span></div></div>
          <span class="skeleton rect"></span>
        </div>` },
      { id: "delay", group: "variant", title: "Delay", desc: "지연 옵션을 켜면 1초 동안 자리만 지키고 보이지 않습니다. 그 안에 끝나면 아무것도 깜빡이지 않습니다. 기다리는 시간은 바꿀 수 있고, 아래 줄은 0.3초로 줄인 모습입니다.", html: `
        <span class="spinner" data-delay role="status" aria-label="정책 불러오는 중"></span>
        <div style="width:100%;max-width:520px" aria-busy="true"><div class="skeleton-row" data-delay style="--ds-delay:300ms"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text"></span></div></div></div>` },
      { id: "progress", group: "variant", title: "Progress", desc: "배포나 검사처럼 진행률을 아는 작업에 씁니다. 끝나면 성공 색, 실패하면 위험 색으로 칠합니다.", html: `
        <div style="width:100%;max-width:480px;display:flex;flex-direction:column;gap:20px">
          <div class="progress-row"><div class="row"><span>정책 배포 중</span><span>842 / 1,284</span></div><div class="progress" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100" aria-label="정책 배포 중"><i style="width:66%"></i></div></div>
          <div class="progress-row"><div class="row"><span>전체 검사 완료</span><span>100%</span></div><div class="progress success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-label="전체 검사 완료"><i style="width:100%"></i></div></div>
          <div class="progress-row"><div class="row"><span>업데이트 실패</span><span>38%</span></div><div class="progress danger" role="progressbar" aria-valuenow="38" aria-valuemin="0" aria-valuemax="100" aria-label="업데이트 실패"><i style="width:38%"></i></div></div>
        </div>` },
    ],
    props: [[".spinner", "span", "—", "role=status · aria-label 은 실제 작업. sm | (md) | lg"], [".skeleton", "span", "—", ".title | .text(.short) | .circle | .rect. 컨테이너에 aria-busy"], [".progress", "div", "—", "role=progressbar aria-valuenow. i 의 width 가 진행률"], ["tone", ".success | .danger", "accent", "완료 / 실패"], [".sm", "boolean", "false", "높이 4"], ["data-delay", "attr", "—", ".spinner · .spinner-wrap · .skeleton · .skeleton-row 에. <code>--ds-delay</code>(기본 1s) 동안 자리를 지킨 채 보이지 않는다 — 줄인 모션에서도. React <code>delay</code>(true | ms)"], ["DS.loading.start(el, {delay, min}) · stop(el)", "function", "1000 · 500 ms", "보일지를 정한다 — delay 안에 stop 하면 끝내 안 보이고, 보였으면 min 을 채운 뒤 숨긴다(el.hidden). stop 은 숨긴 뒤 풀리는 Promise. 이 요소에는 data-delay 를 달지 않는다. React <code>useLoadingDelay(loading, {delay, minDuration})</code>"]],
    spec: [["Size", "Spinner 16/24/40 · Skeleton 행 14 · Progress 8 (sm 4)"], ["Container", "Skeleton radius 6 · Progress radius/full"], ["Label", "문구 12 Regular — 스피너 tertiary · 진행 secondary"]],
    figma: { frame: "Loading", sizes: { spinner: { sm: 16, md: 24, lg: 40 }, progress: { h: 8 } }, variants: { spinner: {}, skeleton: { bg: "--surface-neutral-strong" }, progress: { fill: "--surface-brand-primary", track: "--surface-neutral-strong" } }, states: ["default", "success", "danger"] },
  },

  /* ------------------------------------------------ Indicator */
  "indicator": {
    status: "ready", react: ["Indicator","Count","WithCount"], css: [".indicator", ".count", ".with-count"], borrows: [".btn", ".tooltip-wrap", ".tooltip"],
    desc: "상태 원, 건수 배지처럼 작은 시각 신호입니다. 상태 원은 색 원 안에 상태마다 다른 아이콘을 넣습니다. 텍스트 라벨과 함께 써 색만으로 의미를 전달하지 않습니다.",
    choose: [
      ["언제 쓰는가", "라벨 옆에 상태 원이나 건수 배지를 붙일 때 씁니다. 상태 이름을 글자로 보여 주려면 <a href=\"#/components/tag\">Tag</a> 를, 진행 단계를 보여 주려면 <a href=\"#/components/steps\">Steps</a> 를 씁니다."],
      ["Placement", "테이블 상태 열, 내비 건수"],
    ],
    principles: [
      ["모양", "원의 색과 아이콘이 함께 상태를 나릅니다. 같은 상태는 어느 화면에서나 같은 아이콘을 씁니다. 원과 아이콘은 보조이고 뜻은 옆 라벨이 나릅니다."],
      ["Pulse", "실제로 진행 중일 때만 씁니다. 지난 일이나 강조에 쓰지 않습니다."],
      ["Count", "99 를 넘으면 99+ 로 적습니다. 0 은 표시하지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "상태 원과 라벨을 함께 쓰는 기본 형태입니다.", html: `<span class="indicator ok">정상</span>` },
      { id: "status", group: "variant", title: "Status", desc: "에이전트와 서비스의 상태를 보여 줍니다. 정상은 체크, 주의는 느낌표, 장애는 엑스, 점검 중은 i, 오프라인은 가로선입니다. 라벨은 꼭 함께 둡니다. 지금 진행 중인 위험은 원 둘레가 맥박처럼 퍼져 알립니다.", html: `
        <span class="indicator ok">정상</span>
        <span class="indicator warn">주의</span>
        <span class="indicator danger">장애</span>
        <span class="indicator info">점검 중</span>
        <span class="indicator">오프라인</span>
        <span class="indicator danger pulse">실시간 공격 탐지</span>` },
      { id: "count", group: "variant", title: "Count Badge", desc: "확인하지 않은 건수를 보여 줍니다. 99 를 넘으면 99+ 로 적습니다. 아이콘 위에 붙일 때는 아이콘과 배지를 한 틀로 감싸 모서리에 겹칩니다.", html: `
        <span class="count">3</span>
        <span class="count">99+</span>
        <span class="count accent">12</span>
        <span class="count neutral">128</span>
        <div class="btn-group"><span class="with-count"><span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="알림 5건">${I("bell")}</button><span class="tooltip" role="tooltip">알림 5건</span></span><span class="count">5</span></span>
        <span class="with-count"><span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="새 알림">${I("bell")}</button><span class="tooltip" role="tooltip">새 알림</span></span><span class="count dot" aria-hidden="true"></span></span></div>` },
    ],
    props: [[".indicator", "span", "—", "아이콘 원 + 라벨. ok 체크 | warn ! | danger × | info i | accent i | (neutral) 가로선"], [".pulse", "boolean", "false", "원 둘레 맥박(위험 실시간)"], [".count", "span", "—", "건수. 기본은 진한 빨강(--foreground-negative-strong) + 흰 숫자. .accent / .neutral / .dot(점만)"], [".with-count", "wrapper", "—", "아이콘 우상단에 count 배치 — 숫자는 모서리에서 -6, 점(.dot)은 -2"]],
    spec: [["Size", "원 16 · 아이콘 10(선 1.33) · 원과 라벨 간격 8 · count 높이 20 · .with-count 위치 숫자 -6 · 점 안쪽 4"], ["Container", "radius/full · 원 = ok foreground/positive/primary · warn cautionary · danger negative · info accent/cyan · neutral inactive · accent surface/brand/primary"], ["Icon", "static/white(accent 는 brand-label) · 비활성 행은 아이콘 없는 foreground/disable/primary 원"], ["Label", "Label 1/Reading 14 · count 12 Bold · 아이콘 위 숫자 배지 Caption 2 11 Bold · 99 초과 99+"]],
    figma: { frame: "Indicator", radius: "radius/full", sizes: { dot: 16, icon: 10, count: { h: 20 }, step: 24 }, variants: { ok: { fg: "--foreground-positive-primary" }, warn: { fg: "--foreground-cautionary-primary" }, danger: { fg: "--foreground-negative-primary" }, info: { fg: "--foreground-accent-cyan" }, accent: { fg: "--surface-brand-primary" }, neutral: { fg: "--foreground-inactive-primary" },
      count: { bg: "--foreground-negative-strong", fg: "--static-white", neutral: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" }, accent: { bg: "--surface-brand-primary", fg: "--brand-label" } },
      steps: { todo: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" }, done: { bg: "--foreground-positive-primary", icon: "--brand-label" }, on: { bg: "--surface-brand-primary", fg: "--brand-label" } } }, states: ["default", "pulse"] },
  },

  /* ------------------------------------------------ Steps — Indicator 에서 분리(사람의 결정 2026-11-10) */
  "steps": {
    status: "ready", react: ["Steps", "Stepper", "StepButton"], css: [".steps", ".stepper", ".step-panel", ".step-actions", ".sr-only"], borrows: [".form", ".form-legend", ".field", ".help", ".btn", ".t-body-2-reading"],   // .sr-only — 완료 숨김 문구가 쓴다. 빠지면 복사한 CSS 에서 " (완료)" 가 화면에 보인다
    desc: "온보딩 · 마법사처럼 순서대로 진행하는 일에서 지금 어디에 있는지 보여 주고, 단계 이동과 단계별 검사를 맡습니다.",
    choose: [
      ["언제 쓰는가", "온보딩이나 설정 마법사처럼 순서가 있는 여러 단계의 입력에 씁니다. 같은 층위의 내용을 오가려면 <a href=\"#/components/tab\">Tab</a> 을 쓰고, 한 화면에 다 들어가는 입력은 <a href=\"#/components/form\">Form</a> 하나로 충분합니다."],
      ["Placement", "온보딩 · 마법사 상단"],
    ],
    principles: [
      ["단계 수", "3~6단계로 둡니다. 2단계면 표시하지 않고, 6단계를 넘으면 단계를 묶습니다."],
      ["라벨", "1~2단어의 명사로 씁니다."],
      ["이동", "기본은 순서대로 옮깁니다. 앞으로는 '다음'으로만 가고, 그 단계의 폼을 통과해야 합니다. 뒤로는 완료한 단계를 눌러 돌아갑니다. 자유 이동으로 두면 어느 단계든 눌러 옮기고, 떠날 때 폼이 통과하면 그 단계를 완료로 표시합니다."],
      ["검사", "'다음'과 '완료'는 그 단계 패널의 폼을 검사하고, 막히면 첫 오류 필드로 갑니다. 폼 안에서 Enter 를 눌러도 '다음'과 같습니다. 자유 이동의 '완료'는 모든 단계를 검사해 막힌 첫 단계로 갑니다. 단계를 옮겨도 입력값은 남습니다."],
      ["상태", "완료한 단계는 제품 색 원과 체크로 그리고, 화면에 보이지 않는 '완료' 문구를 함께 둡니다. 현재 단계는 제품 색 테두리 원으로 그리고, 스크린 리더에 현재 단계로 알립니다. 아직인 단계는 회색 테두리 원입니다. 완료한 단계 뒤의 연결선은 제품 색입니다."],
      ["배치", "가로가 기본이고 연결선이 남는 폭을 나눕니다. 라벨이 길거나 단계가 많으면 라벨을 원 아래에 둡니다. 좁은 패널에서 단계 아래에 내용을 펼치려면 세로 배치를 씁니다. 가로나 라벨 아래 배치가 자리에 들어가지 않으면 단계 목록이 세로로 쌓이고, 패널은 목록 아래에 그대로 둡니다. 마법사 패널 안의 폼 카드는 최대 폭 없이 패널 폭을 채워, 아래 이전 · 다음 버튼 줄과 양끝이 맞습니다."],
      ["포커스", "단계를 옮기면 새 패널로 포커스가 갑니다."],
      ["저장", "Steps 는 이동과 검사까지 맡습니다. 저장과 전송은 단계가 바뀌었다는 이벤트와 마쳤다는 이벤트를 받아 제품이 합니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "가로 마법사입니다. '다음'은 그 단계의 폼을 검사합니다. 이 예제는 적용 그룹이 비어 있어 막힙니다. 완료한 '기본 정보'는 눌러 돌아갈 수 있고, 단계를 옮겨도 입력값은 남습니다.", html: `
        <div class="stepper" data-async>
          ${stepsOl("", [stepLi(STEP_L[0], 0, "done", { btn: true }), stepLi(STEP_L[1], 1, "on"), stepLi(STEP_L[2], 2, ""), stepLi(STEP_L[3], 3, "")])}
          ${stepPanel(false, stepForm("sd-name", "정책 이름", "2~40자", "외부 USB 차단"))}
          ${stepPanel(true, stepForm("sd-group", "적용 그룹", "예: 영업팀"))}
          ${stepPanel(false, stepNote("차단할 장치 종류와 예외를 정합니다."))}
          ${stepPanel(false, stepNote("설정을 확인한 뒤 정책 만들기를 누릅니다."))}
          ${stepActs(false, false, "정책 만들기")}
        </div>` },
      { id: "label-below", group: "variant", title: "Label Below", desc: "원을 위에, 라벨을 그 아래 가운데에 둡니다. 라벨이 길거나 단계가 많을 때 폭을 아낍니다.", html: `
        <div class="stepper">
          ${stepsOl("label-below", [stepLi("조직 정보", 0, "done", { btn: true }), stepLi("보호 수준", 1, "on"), stepLi("에이전트 배포", 2, ""), stepLi("알림 설정", 3, ""), stepLi("검토", 4, "")])}
          ${stepPanel(false, stepNote("조직 이름과 관리자 연락처를 정합니다."))}
          ${stepPanel(true, stepNote("기본 보호 수준을 고릅니다."))}
          ${stepPanel(false, stepNote("설치 파일을 받아 단말에 설치합니다."))}
          ${stepPanel(false, stepNote("위협을 알릴 채널을 고릅니다."))}
          ${stepPanel(false, stepNote("설정을 확인한 뒤 설정 마치기를 누릅니다."))}
          ${stepActs(false, false, "설정 마치기")}
        </div>` },
      { id: "vertical", group: "variant", title: "Vertical", desc: "단계를 세로로 쌓고 현재 단계의 내용을 그 아래에 펼칩니다. 좁은 패널에 씁니다. 각 단계 안에 그 단계의 패널과 버튼을 둡니다.", html: `
        <div class="stepper">
          ${stepsOl("vertical", [
            stepLi(STEP_L[0], 0, "done", { btn: true, inner: stepPanel(false, stepForm("sv-name", "정책 이름", "2~40자", "외부 USB 차단") + stepActs(false, false, "정책 만들기")) }),
            stepLi(STEP_L[1], 1, "on", { inner: stepPanel(true, stepForm("sv-group", "적용 그룹", "예: 영업팀") + stepActs(false, false, "정책 만들기")) }),
            stepLi(STEP_L[2], 2, "", { inner: stepPanel(false, stepNote("차단할 장치 종류와 예외를 정합니다.") + stepActs(false, false, "정책 만들기")) }),
            stepLi(STEP_L[3], 3, "", { inner: stepPanel(false, stepNote("설정을 확인한 뒤 정책 만들기를 누릅니다.") + stepActs(false, false, "정책 만들기")) }),
          ])}
        </div>` },
      { id: "nonlinear", group: "variant", title: "Non-linear", desc: "자유 이동입니다. 어느 단계든 눌러 옮기므로 순서가 상관없는 설정에 씁니다. 떠날 때 폼이 통과하면 완료로 표시합니다. '완료'는 모든 단계를 검사해 막힌 첫 단계로 가고, 이 예제에서는 적용 그룹 단계로 갑니다.", html: `
        <div class="stepper" data-nonlinear>
          ${stepsOl("", [stepLi(STEP_L[0], 0, "on"), stepLi(STEP_L[1], 1, "", { btn: true }), stepLi(STEP_L[2], 2, "", { btn: true }), stepLi(STEP_L[3], 3, "", { btn: true })])}
          ${stepPanel(true, stepForm("sn-name", "정책 이름", "2~40자", "외부 USB 차단"))}
          ${stepPanel(false, stepForm("sn-group", "적용 그룹", "예: 영업팀"))}
          ${stepPanel(false, stepNote("차단할 장치 종류와 예외를 정합니다."))}
          ${stepPanel(false, stepNote("설정을 확인한 뒤 정책 만들기를 누릅니다."))}
          ${stepActs(true, false, "정책 만들기")}
        </div>` },
      { id: "indicator", group: "variant", title: "Indicator Only", desc: "마법사 틀 없이 단계 목록만 쓰면 표시만 합니다. 단계 이동은 제품이 맡고, 완료한 단계를 누르면 몇 번째 단계를 눌렀는지 알리는 이벤트만 냅니다.", html: `
        ${stepsOl("", [stepLi(STEP_L[0], 0, "done", { btn: true }), stepLi(STEP_L[1], 1, "done", { btn: true }), stepLi(STEP_L[2], 2, "on"), stepLi(STEP_L[3], 3, "")])}` },
    ],
    props: [[".stepper", "container", "—", "마법사. .steps + 단계 수만큼의 .step-panel + .step-actions(이전 · 다음 · 완료를 .btn-group 으로)"], [".steps", "ol", "—", "진행 단계. aria-label 필수. .stepper 밖에서 혼자 쓰면 표시만 한다(이동은 제품)"], [".steps li", "li", "—", ".done 완료(제품 색 원 + 체크 + 숨긴 '(완료)'), .on 현재(제품 색 테두리 원 + aria-current=\"step\"). 라벨은 .label"], [".label-below · .vertical", "class", "—", "배치. 없으면 가로. 세로는 각 li 안에 그 단계의 .step-panel 과 버튼"], [".stacked", "class", "—", "가로 · 라벨 아래가 자리에 안 들어가면 ds.js · React 가 붙여 세로로 쌓는다(창 크기가 바뀌면 다시 잰다). 직접 적지 않는다 — 빌드가 막는다"], [".step-btn", "button", "—", "누를 수 있는 단계 — 순서대로면 .done 안에만, data-nonlinear 면 현재가 아닌 모든 단계. ds.js 가 단계를 옮길 때마다 다시 그린다"], [".step-panel", "div", "—", "단계 내용. 현재만 보이고(hidden) 입력값은 남는다. 안의 form[data-validate] 를 '다음' · '완료'가 검사한다"], ["data-step", "prev | next | finish", "—", "이전 · 다음 · 완료 버튼. 첫 단계에서 이전은 disabled, 마지막 단계에서는 다음 대신 완료. 완료 버튼의 글자는 결과를 말하는 동사로 바꿔 쓴다(정책 만들기 · 배포). React labels.finish"], ["data-nonlinear", "attribute", "—", "어느 단계든 눌러 옮긴다. React nonLinear"], ["data-async", "attribute", "—", "완료 처리 중. 완료를 내면 완료 버튼이 loading 이 되어 다시 눌리지 않고, 제품이 ds:step-finish 의 resolve() 나 reject(문구) 를 불러야 풀린다. reject 는 오류 Toast(문구가 없으면 기본 문구). React async"], ["ds:step", "event", "—", ".stepper 에서 {index, from, trigger} — trigger 는 next · prev · click · finish · api. .stepper 밖 .steps 는 완료 단계 누름만 {index, from, trigger: \"click\"}. React onStepChange · Steps onStepClick"], ["ds:step-finish", "event", "—", "'완료'가 검사를 통과하면 {index}. data-async 면 {index, resolve, reject}. React onFinish(async 면 Promise 를 돌려줌 — 던지면 오류 Toast)"], ["DS.stepper.go(el, index)", "function", "—", "제품이 단계를 옮긴다(검사 없음) — 서버 응답 뒤 등"]],
    spec: [["Size", "원 32 · 체크 16 · 연결선 2(최소 16) · 간격 8 · 세로 단계 사이 24 · 마법사 안 폼 카드는 패널 폭을 채움(최대 폭 없음)"], ["Container", "원 radius/full · 완료 surface/brand/primary · 현재 surface/brand/primary 테두리 + surface/brand/subtle · 아직 line/neutral/primary 테두리 · 완료 뒤 연결선 surface/brand/primary"], ["Label", "Label 1/Normal 14 · 현재 SemiBold · 완료 secondary · 아직 tertiary"]],
  },

  /* ------------------------------------------------ Divider */
  "divider": {
    status: "ready", react: ["Divider"], css: [".divider"], borrows: [".t-label-1-reading", ".t-regular", ".btn"],
    desc: "콘텐츠 그룹을 나눕니다. 여백과 배경 차이로 구획이 되면 쓰지 않고, 꼭 필요한 곳에만 아주 연하게 씁니다.",
    choose: [
      ["언제 쓰는가", "다른 방법으로 나눌 수 없는 구획에만 씁니다. 여백이나 배경 차이로 구획이 나뉘면 쓰지 않습니다."],
      ["Placement", "설정 섹션 사이, 툴바 버튼 그룹 사이"],
    ],
    principles: [
      ["중복 금지", "표 · 목록 · 메뉴처럼 이미 구분선이 있는 컴포넌트 안에 더하지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "영역을 나누는 기본 가로 구분선입니다.", html: `
        <div style="width:100%;max-width:480px">
          <p class="t-label-1-reading t-regular" style="margin:0">기본 설정</p>
          <hr class="divider">
          <p class="t-label-1-reading t-regular" style="margin:0">고급 설정</p>
        </div>
      ` },
      { id: "basic", group: "variant", title: "Horizontal", desc: "가로 구분선입니다. 강조할 때는 진한 선을, 임시로 나눌 때는 점선을 씁니다.", html: `
        <div style="width:100%;max-width:480px">
          <p class="t-label-1-reading t-regular" style="margin:0">기본 설정</p>
          <hr class="divider">
          <p class="t-label-1-reading t-regular" style="margin:0">고급 설정</p>
          <hr class="divider strong">
          <p class="t-label-1-reading t-regular" style="margin:0">감사 로그</p>
          <hr class="divider dashed">
        </div>` },
      { id: "label", group: "variant", title: "With Label", desc: "구분의 의미를 알려야 할 때 가운데에 라벨을 둡니다.", html: `
        <div style="width:100%;max-width:480px"><div class="divider label" role="separator">또는</div><div class="divider label" role="separator">2026. 09. 07</div></div>` },
      { id: "vertical", group: "variant", title: "Vertical", desc: "툴바에서 버튼 그룹을 나눕니다. 높이는 24px 입니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn sm solid assistive">편집</button>
          <button type="button" class="btn sm solid assistive">복제</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm solid assistive">내보내기</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm outline assistive">삭제</button>
        </div>` },
    ],
    props: [[".divider", "hr | div", "—", "가로 1px line/neutral/secondary, margin 16 0"], [".strong / .dashed", "boolean", "false", "line/neutral/primary / 점선"], [".label", "div", "—", "가운데 라벨 텍스트"], [".vertical", "span", "—", "세로 1×24, 좌우 12"]],
    spec: [["Size", "1px · 세로 24"], ["Container", "line/neutral/secondary (strong 시 line/neutral/primary)"], ["Label", "라벨 12 Regular tertiary"]],
    figma: { frame: "Divider", sizes: { horizontal: { h: 1 }, vertical: { w: 1, h: 24 } }, variants: { default: { stroke: "--line-neutral-secondary" }, strong: { stroke: "--line-neutral-primary" }, label: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ Data Table */
  "data-table": {
    status: "ready", react: ["DataTable","ActionBar"], css: [".tbl-wrap", ".tbl", ".action-bar", ".select-notice", ".tag", ".checkbox", ".indicator"], borrows: [".link", ".btn", ".switch", ".log-row", ".empty", ".dropdown", ".menu", ".menu-item", ".menu-sep", ".skeleton", ".sr-only", ".code-view", ".spinner", ".spinner-wrap", ".stack", ".toolbar", ".spacer", ".select-btn", ".tooltip-wrap", ".tooltip"],
    desc: "로그 · 이벤트 · 정책 목록처럼 행이 많은 데이터를 다룹니다. 정렬, 선택, 행 동작을 갖춘 콘솔의 핵심 컴포넌트입니다. 읽기만 하는 단순한 표는 Table 을 씁니다.",
    choose: [
      ["언제 쓰는가", "정렬, 선택, 행 동작이 필요한 목록에 씁니다. 몇 줄을 읽기만 하면 <a href=\"#/components/table\">Table</a> 을, 열이 2~3개이고 항목마다 제목과 부제가 있으면 <a href=\"#/components/list\">List</a> 를 씁니다."],
      ["Placement", "툴바(검색·필터) 위, 페이지네이션 아래"],
    ],
    principles: {
      "선택": [
        ["액션 바", "선택 열이 있는 표는 표 위에 액션 바를 늘 둡니다. 고르기 전에도 무엇을 할 수 있는지 보이고, 고를 때 표가 아래로 밀리지 않습니다. 고른 것이 없으면 '0개 선택' 으로 적고 버튼은 꺼집니다."],
        ["전체 선택", "머리글 체크박스는 이 페이지의 행만 고릅니다. 전체 건수를 알면 '전체 n건 선택' 안내를 띄웁니다. 전체 결과에 대한 실행은 제품 서버가 합니다."],
        ["선택 유지", "페이지를 옮겨도 선택은 남고, 필터 · 검색 · 기간이 바뀌면 지웁니다."],
      ],
      "정렬": [
        ["서버 정렬", "서버가 페이지를 나눠 주는 표는 서버 정렬로 정해, 화면에서 다시 정렬하지 않게 합니다. 현재 페이지만 뒤섞이면 결과가 틀려 보입니다."],
        ["머리글", "정렬 말고는 링크 · 버튼을 넣지 않습니다. 정렬은 머리글 안의 버튼이라 키보드로 닿습니다."],
        ["정렬 방향", "글자 · 상태 · 날짜 · ID · IP 는 왼쪽에 맞춥니다. 건수 · % · 용량처럼 크기를 견주는 숫자만 오른쪽에 맞추고, 행 동작은 맨 오른쪽에 둡니다. 표 전체의 숫자가 같은 폭이라 시각 · IP 도 자리가 맞습니다. 말줄임은 긴 메시지 열 하나에만 쓰고 전체 값은 상세에서 보여 줍니다."],
      ],
      "행 동작": [
        ["행 hover", "포인터를 올린 행의 면은 행을 고르거나 행 동작이 있는 표에만 켭니다. 읽기만 하는 표에 이 면을 칠하면 누를 수 있는 것처럼 보입니다."],
        ["행 전체 클릭", "안쪽 버튼 · 링크 · 체크박스를 누르면 행을 누른 것으로 치지 않습니다. 키보드로 닿도록 같은 목적지의 링크를 첫 열에 둡니다."],
        ["행 버튼 이름", "행마다 달라야 합니다. '수정' 이 아니라 'USB 차단 정책 수정' 입니다."],
        ["행을 지운 뒤", "포커스를 다음 행으로 옮깁니다."],
        ["행 펼침", "원본 로그나 탐지 근거 같은 한 행의 상세를 페이지를 옮기지 않고 봅니다. 맨 앞 칸의 셰브론 버튼으로 열고, 여러 행을 함께 펼칠 수 있습니다. 행을 누르는 동작은 상세 화면 이동에 남겨 두고 펼침에 쓰지 않습니다. 정렬하면 펼친 상세가 제 행을 따라갑니다. 페이지 · 필터 · 검색 · 기간이 바뀌면 모두 접습니다."],
        ["펼친 내용", "펼친 자리는 제품이 채웁니다. 키-값 목록과 원본 로그를 담은 <a href=\"#/components/code\">Code</a> 를 권합니다. 서버에서 불러오는 동안은 그 자리에 Spinner 를 두고, 실패하면 원인과 다시 시도를 둡니다."],
      ],
      "모양": [
        ["밀도", "행 높이는 기본 48px 입니다. 로그처럼 행이 많으면 좁은 40px 을, 하위 텍스트처럼 칸이 두 줄이면 넓은 56px 을 씁니다. 사용자가 바꾸게 하려면 툴바에 Select Button 을 둡니다. 고른 값은 제품이 기억합니다."],
        ["행 스타일", "행 사이 가로선이 기본입니다. 행이 많아 줄을 놓치기 쉬우면 줄무늬를 씁니다. 숫자가 빽빽한 리포트의 열 세로선과 작은 요약의 선 없는 모양은 <a href=\"#/components/table\">Table</a> 에서 씁니다."],
        ["하위 텍스트", "열을 늘리지 않고 맥락을 줄 때 주 값 아래에 보조 글을 둡니다. 이름 아래 이메일, 단말 아래 IP 같은 식입니다. 칸이 두 줄이 되므로 넓은 밀도를 씁니다. 정렬 · 검색 기준은 주 값입니다."],
        ["첫 열 고정", "열이 많아 가로로 스크롤하면 식별 열을 고정합니다. 맨 앞 체크박스 칸과 펼침 칸도 함께 고정됩니다. 표 영역이 스크롤되므로 영역에 이름을 붙이고 키보드로 닿게 합니다."],
        ["합계 행", "합계 · 평균은 표 맨 아래의 합계 행에 둡니다. 합계 행은 정렬 · 선택 · 페이지와 상관없이 맨 아래에 남습니다. 이 페이지만의 합계인지 전체의 합계인지 첫 칸에 적습니다."],
        ["고정 헤더", "세로로 긴 로그 표에 씁니다. 표 영역에 높이를 주고, 영역에 이름을 붙여 키보드로 닿게 합니다. 복잡한 표에는 표 제목을 둡니다."],
        ["강조", "색만으로 의미를 전하지 않습니다. 심각도 · 상태는 글자를 함께 둡니다."],
      ],
      "상태": [
        ["다시 불러오기", "정렬 · 필터 · 페이지를 바꿔 다시 불러올 때는 지난 행을 지우지 않고 흐리게 둡니다. 행 높이와 열 폭이 그대로라 화면이 흔들리지 않고, 끝나면 새 행으로 바뀝니다. 금방 끝날 수 있는 조회에는 지연 옵션을 켭니다."],
        ["상태", "처음 불러오는 중에는 Skeleton 행을 둡니다. 실패하면 원인과 '다시 시도' 를 둡니다. 처음이라 비어 있으면 만드는 동작을, 조건에 맞는 결과가 없으면 조건 초기화를 둡니다."],
        ["로그 표", "자동 갱신하는 로그 표에는 일시 정지를 둡니다. 읽는 중에 행이 밀리지 않게 새 행은 건수로 알립니다. 최신 100건처럼 조회 범위를 건수 옆에 적습니다. 이 동작은 제품이 구현합니다."],
      ],
    },
    examples: [
      { id: "basic", group: "default", title: "Default (Sortable)", desc: "머리글을 눌러 정렬합니다. 정렬 중인 열은 머리글이 진해지고 방향 화살표가 붙습니다. 크기를 견주는 숫자 열은 오른쪽에 맞춥니다. 처리할 수 없는 행은 비활성 행으로 둡니다. 비활성 행은 글자 · 태그 · 링크 · 상태 원이 모두 비활성 색이 됩니다. 행 안 링크와 버튼은 Tab 순서에서 빠지고 눌러도 동작하지 않습니다. 행의 글자는 스크린 리더가 그대로 읽습니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl nowrap">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th class="sortable"><button type="button" class="sort">심각도</button></th><th>이벤트</th><th class="sortable"><button type="button" class="sort">대상</button></th><th class="num sortable"><button type="button" class="sort">횟수</button></th><th>상태</th></tr></thead>
            <tbody>
              <tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td class="num">3</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>09:40:58</td><td><span class="tag medium">Medium</span></td><td><a href="#" class="link">미승인 USB 연결</a></td><td>PC-1187 · 이서연</td><td class="num">1</td><td><span class="indicator warn">검토 필요</span></td></tr>
              <tr><td>09:38:03</td><td><span class="tag info">Info</span></td><td><a href="#" class="link">정책 동기화 완료</a></td><td>Server-03</td><td class="num">12</td><td><span class="indicator ok">정상</span></td></tr>
              <tr class="disabled" aria-disabled="true"><td>09:36:47</td><td><span class="tag high">High</span></td><td><a href="#" class="link" tabindex="-1" aria-disabled="true">알려진 악성코드 차단</a></td><td>PC-0932 · 박지훈</td><td class="num">2</td><td><span class="indicator danger">차단</span></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "selectable", group: "variant", title: "Selectable + Action Bar", desc: "맨 앞에 체크박스 열을 두고, 표 위에 면 없는 액션 바를 늘 둡니다. 고른 것이 없으면 '0개 선택' 으로 적고 버튼은 꺼집니다. 꺼진 버튼에도 포커스는 갈 수 있습니다. 고른 행에는 옅은 제품 색 면이 칠해집니다.", html: `
        <div class="tbl-wrap">
          <div class="action-bar"><b>2개 선택</b><span class="spacer"></span><div class="btn-group"><button type="button" class="btn sm outline assistive">허용 처리</button><button type="button" class="btn sm outline assistive">${I("download")}내보내기</button><button type="button" class="btn sm outline assistive">삭제</button></div></div>
          <table class="tbl hover">
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" class="mixed" aria-label="전체 선택"></label></th><th>정책</th><th>적용 그룹</th><th class="num">대상</th><th>수정</th><th>사용</th></tr></thead>
            <tbody>
              <tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="외부 USB 차단 선택"></label></td><td>외부 USB 차단</td><td>전체</td><td class="num">1,284</td><td>2026. 09. 06</td><td><label class="switch sm"><input type="checkbox" role="switch" checked aria-label="외부 USB 차단 사용"></label></td></tr>
              <tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="스크립트 실행 제한 선택"></label></td><td>스크립트 실행 제한</td><td>개발팀 제외</td><td class="num">1,102</td><td>2026. 09. 02</td><td><label class="switch sm"><input type="checkbox" role="switch" checked aria-label="스크립트 실행 제한 사용"></label></td></tr>
              <tr><td class="check"><label class="checkbox"><input type="checkbox" aria-label="원격 접속 허용 목록 선택"></label></td><td>원격 접속 허용 목록</td><td>인프라팀</td><td class="num">48</td><td>2026. 08. 21</td><td><label class="switch sm"><input type="checkbox" role="switch" aria-label="원격 접속 허용 목록 사용"></label></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "compact", group: "size", title: "Compact", desc: "로그 뷰어처럼 행이 많을 때 행 높이를 40px 로 줄입니다. 글자 크기는 다른 밀도와 같고, 로그 행은 한 건을 한 줄에 보여 줍니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl compact">
            <thead><tr><th>시간</th><th>레벨</th><th>소스</th><th>메시지</th></tr></thead>
            <tbody>
              <tr class="log-row"><td>2026. 09. 07 09:41:12.031</td><td><span class="tag critical sm">CRIT</span></td><td>10.0.4.21</td><td>process.create blocked: rundll32.exe → cryptor.dll</td></tr>
              <tr class="log-row"><td>2026. 09. 07 09:41:11.870</td><td><span class="tag medium sm">WARN</span></td><td>10.0.4.21</td><td>usb.attach vendor=0x0781 product=0x5583</td></tr>
              <tr class="log-row"><td>2026. 09. 07 09:41:09.114</td><td><span class="tag info sm">INFO</span></td><td>10.0.0.3</td><td>policy.sync ok (rev 2041)</td></tr>
              <tr class="log-row"><td>2026. 09. 07 09:41:08.552</td><td><span class="tag info sm">INFO</span></td><td>10.0.0.3</td><td>agent.checkin 1284/1284</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "density", group: "size", title: "Density", desc: "툴바의 Select Button 으로 행 밀도를 바꿉니다. 좁게는 40px, 기본은 48px, 넓게는 56px 입니다. 고른 값을 기억하는 것은 제품 몫입니다.", html: `
        <div class="stack">
          <div class="toolbar"><span class="spacer"></span><div class="select-btn outline" role="radiogroup" aria-label="행 밀도" data-density-for="dt-density"><button type="button" role="radio" aria-checked="false" data-density="compact">좁게</button><button type="button" class="on" role="radio" aria-checked="true" data-density="default">기본</button><button type="button" role="radio" aria-checked="false" data-density="relaxed">넓게</button></div></div>
          <div class="tbl-wrap">
            <table class="tbl" id="dt-density">
              <thead><tr><th>정책</th><th>적용 그룹</th><th class="num">대상</th><th>수정</th></tr></thead>
              <tbody>
                <tr><td>외부 USB 차단</td><td>전체</td><td class="num">1,284</td><td>2026. 09. 06</td></tr>
                <tr><td>스크립트 실행 제한</td><td>개발팀 제외</td><td class="num">1,102</td><td>2026. 09. 02</td></tr>
                <tr><td>원격 접속 허용 목록</td><td>인프라팀</td><td class="num">48</td><td>2026. 08. 21</td></tr>
              </tbody>
            </table>
          </div>
        </div>`, layout: "top" },
      { id: "sub-text", group: "variant", title: "Sub Text", desc: "주 값 아래에 보조 글을 둡니다. 이름 아래 이메일, 단말 아래 IP 처럼 열을 늘리지 않고 맥락을 줍니다. 칸이 두 줄이라 넓은 밀도인 56px 행을 씁니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl relaxed nowrap">
            <thead><tr><th>사용자</th><th>단말</th><th>역할</th><th class="num">위반</th></tr></thead>
            <tbody>
              <tr><td>김민준<span class="cell-sub">minjun.kim@corp.example.com</span></td><td>PC-2041<span class="cell-sub">10.0.4.21</span></td><td>영업팀</td><td class="num">3</td></tr>
              <tr><td>이서연<span class="cell-sub">seoyeon.lee@corp.example.com</span></td><td>PC-1187<span class="cell-sub">10.0.4.37</span></td><td>개발팀</td><td class="num">1</td></tr>
              <tr><td>박지훈<span class="cell-sub">jihoon.park@corp.example.com</span></td><td>PC-0932<span class="cell-sub">10.0.2.8</span></td><td>인프라팀</td><td class="num">0</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "sticky-col", group: "variant", title: "Sticky Column", desc: "열이 많아 가로로 스크롤하면 식별 열을 고정합니다. 맨 앞 체크박스 칸도 함께 고정되고, 고정 칸 오른쪽에 선이 생깁니다. 표 영역이 스크롤되므로 영역에 이름을 붙이고 키보드로 닿게 합니다.", html: `
        <div class="tbl-wrap sticky-col" tabindex="0" role="region" aria-label="단말 현황" style="max-width:640px">
          <table class="tbl hover">
            <caption class="sr-only">단말 현황</caption>
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" aria-label="전체 선택"></label></th><th>단말</th><th>사용자</th><th>그룹</th><th>IP</th><th>OS</th><th>에이전트</th><th class="num">위반</th><th>최근 접속</th></tr></thead>
            <tbody>${[["PC-2041", "김민준", "영업팀", "10.0.4.21", "Windows 11", "5.2.1", "3", "2026. 09. 07 09:41"], ["PC-1187", "이서연", "개발팀", "10.0.4.37", "macOS 14", "5.2.1", "1", "2026. 09. 07 09:12"], ["PC-0932", "박지훈", "인프라팀", "10.0.2.8", "Windows 10", "5.1.8", "0", "2026. 09. 06 18:30"]].map(([n, u, g, ip, os, v, c, t]) => `<tr><td class="check"><label class="checkbox"><input type="checkbox" aria-label="${n} 선택"></label></td><td>${n}</td><td>${u}</td><td>${g}</td><td>${ip}</td><td>${os}</td><td>${v}</td><td class="num">${c}</td><td>${t}</td></tr>`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
      { id: "total", group: "variant", title: "Total Row", desc: "합계 행은 회색 면에 굵은 글자이고, 위 선이 한 단계 진합니다. 이 페이지의 합계인지 전체의 합계인지 첫 칸에 적습니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>그룹</th><th class="num">단말</th><th class="num">탐지</th><th class="num">차단</th></tr></thead>
            <tbody>
              <tr><td>영업팀</td><td class="num">312</td><td class="num">48</td><td class="num">41</td></tr>
              <tr><td>개발팀</td><td class="num">184</td><td class="num">27</td><td class="num">19</td></tr>
              <tr><td>인프라팀</td><td class="num">48</td><td class="num">9</td><td class="num">9</td></tr>
            </tbody>
            <tfoot><tr class="total"><td>전체 합계</td><td class="num">544</td><td class="num">84</td><td class="num">69</td></tr></tfoot>
          </table>
        </div>` },
      { id: "empty", group: "state", title: "Empty", desc: "조건에 맞는 결과가 없을 때입니다. 조건 초기화처럼 다음 행동을 함께 둡니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody><tr><td colspan="4" class="empty"><div class="empty">조건에 맞는 이벤트가 없습니다. <a href="#" class="link">필터 초기화</a></div></td></tr></tbody>
          </table>
        </div>` },
      { id: "row-actions", group: "variant", title: "Row Actions", desc: "동작이 3개 이상이면 ⋯ 로 묶습니다. 스크롤 영역 안에서도 메뉴는 잘리지 않습니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl hover">
            <thead><tr><th>정책</th><th>대상</th><th class="actions"></th></tr></thead>
            <tbody>${[["외부 USB 차단", "전체"], ["랜섬웨어 행위 차단", "영업팀"]].map(([n, t]) => `
              <tr><td>${n}</td><td>${t}</td><td class="actions"><div class="dropdown"><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="${n} 더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button><span class="tooltip" role="tooltip">${n} 더 보기</span></span><ul class="menu" role="menu" style="left:auto;right:0"><li class="menu-item" role="menuitem">${I("pencil")}편집</li><li class="menu-item" role="menuitem">${I("download")}내보내기</li><li class="menu-sep" role="separator"></li><li class="menu-item danger" role="menuitem">${I("trash")}삭제</li></ul></div></td></tr>`).join("")}
            </tbody>
          </table>
        </div>`, layout: "top" },
      { id: "loading", group: "state", title: "Loading", desc: "완성될 행과 같은 크기의 Skeleton 행을 둡니다. 표가 불러오는 중이라는 것을 스크린 리더에도 알립니다.", html: `
        <div class="tbl-wrap">
          <span class="sr-only" role="status">이벤트 불러오는 중</span>
          <table class="tbl" aria-busy="true">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody>${[1, 2, 3].map(() => `<tr>${[1, 2, 3, 4].map(() => '<td><span class="skeleton text"></span></td>').join("")}</tr>`).join("")}</tbody>
          </table>
        </div>` },
      { id: "error", group: "state", title: "Load Error", desc: "원인과 다음 행동을 함께 적고 다시 시도 버튼을 둡니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody><tr><td colspan="4" class="empty"><div class="empty" role="alert">이벤트를 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요. <button type="button" class="btn sm outline assistive" data-retry>다시 시도</button></div></td></tr></tbody>
          </table>
        </div>` },
      { id: "first-use", group: "state", title: "First Use", desc: "아직 만든 것이 없으면 만드는 동작을 둡니다. 조건에 맞는 결과가 없을 때와 구분합니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>정책</th><th>적용 그룹</th><th class="num">대상</th></tr></thead>
            <tbody><tr><td colspan="3" class="empty"><div class="empty">아직 만든 정책이 없습니다. <button type="button" class="btn sm solid primary">정책 만들기</button></div></td></tr></tbody>
          </table>
        </div>` },
      { id: "select-all", group: "variant", title: "Select All Results", desc: "머리글 체크박스는 이 페이지의 행만 고릅니다. 전체 건수를 알면 전체 결과로 넓혀 고르는 길을 안내합니다. 전체 결과에 대한 실행은 제품 서버가 맡습니다.", html: `
        <div class="tbl-wrap" data-total="1054">
          <div class="action-bar"><b>3개 선택</b><span class="spacer"></span><button type="button" class="btn sm outline assistive">${I("download")}내보내기</button></div>
          <div class="select-notice" aria-live="polite"><span>이 페이지의 3건을 모두 선택했습니다.</span><button type="button" class="btn sm text" data-select-all>전체 1,054건 선택</button></div>
          <table class="tbl hover">
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" checked aria-label="전체 선택"></label></th><th>단말</th><th>그룹</th></tr></thead>
            <tbody>${[["PC-2041", "영업팀"], ["PC-1187", "개발팀"], ["PC-0932", "인프라팀"]].map(([n, g]) => `<tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="${n} 선택"></label></td><td>${n}</td><td>${g}</td></tr>`).join("")}</tbody>
          </table>
        </div>` },
      { id: "expandable", group: "variant", title: "Row Expand", desc: "맨 앞 셰브론으로 한 행의 상세를 펼칩니다. 여러 행을 함께 펼칠 수 있고, 정렬하면 상세가 제 행을 따라갑니다. 서버에서 불러오는 동안은 그 자리에 Spinner 를 둡니다. 두 번째 행이 불러오는 중인 모습입니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl compact">
            <thead><tr><th class="expand"><span class="sr-only">상세</span></th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>레벨</th><th>소스</th><th>메시지</th></tr></thead>
            <tbody>${EXP_ROWS.map(([id, t, c, l, ip, m, st]) => `<tr class="log-row"><td class="expand">${expBtn(id, t, !!st)}</td><td>${t}</td><td><span class="tag ${c} sm">${l}</span></td><td>${ip}</td><td class="truncate">${m}</td></tr>${expDetail(id, t, ip, m, st)}`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
      { id: "sticky", group: "variant", title: "Sticky Header", desc: "표 영역에 높이를 주면 안에서 스크롤하고 머리글이 남습니다. 긴 메시지 열은 말줄임으로 자릅니다. 잘린 칸에 마우스를 올리거나 Tab 으로 오면 전체 값을 Tooltip 으로 봅니다.", html: `
        <div class="tbl-wrap sticky" tabindex="0" role="region" aria-label="최근 로그" style="max-height:240px">
          <table class="tbl compact">
            <caption class="sr-only">최근 로그</caption>
            <thead><tr><th style="width:120px">시간</th><th style="width:96px">레벨</th><th style="width:120px">소스</th><th>메시지</th></tr></thead>
            <tbody>${LOG_SAMPLE.map(([t, c, l, ip, m]) => `<tr class="log-row"><td>${t}</td><td><span class="tag ${c} sm">${l}</span></td><td>${ip}</td><td class="truncate">${m}</td></tr>`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
    ],
    props: [[".tbl-wrap", "container", "—", "가로 스크롤 영역(테두리 · radius 없음 — 위는 머리글 아래 선, 아래는 마지막 행 선). 안에 .action-bar 와 table.tbl"], [".tbl", "table", "—", "기본 행 48. .compact 40 · .relaxed 56 · .zebra 줄무늬. React density · rowStyle"], [".hover", "boolean", "false", "행 hover · 눌림 면(surface/neutral/tertiary · strong). 행을 고르거나 행 동작이 있는 표에만 켭니다. React hover"], [".tbl-wrap.sticky-col", "container", "—", "첫 열 고정(맨 앞 체크박스 · 펼침 칸 포함). tabindex=0 + 이름. React stickyColumn"], [".cell-sub", "element", "—", "칸 안 주 값 아래 보조 글(12 secondary). React 열 정의 sub"], ["tfoot tr.total", "row", "—", "합계 · 평균 행. React summaryRow"], [".select-btn[data-density-for]", "attribute", "—", "표 id. 버튼 data-density(compact · default · relaxed)로 밀도를 바꾼다"], ["th.sortable / .sorted(.desc)", "header", "—", "정렬 가능 / 정렬 중. aria-sort"], ["table[data-sort=server]", "attribute", "—", "서버 정렬. 표시만 바꾸고 다시 정렬하지 않는다. 정렬하면 언제나 ds:sort {key, dir}"], [".tbl-wrap[data-total]", "attribute", "—", "전체 건수. .select-notice 에 전체 결과 선택을 안내하고 ds:select-all {all, total}"], [".tbl-wrap.sticky", "class", "—", "고정 헤더. max-height · tabindex=0 · 이름을 함께"], ["td.truncate", "class", "—", "말줄임. 잘린 칸에만 ds.js 가 전체 값 Tooltip 을 붙이고 칸이 Tab 칸이 됩니다(창 크기가 바뀌면 다시 잼 · 비활성 행 안은 Tab 칸 없음). title 은 쓰지 않는다 — 키보드로 볼 수 없다. React 는 TableCell truncate · 열 정의 truncate"], ["DS.table.removeRow(tr)", "function", "—", "행을 지우고 다음 행으로 포커스. 펼친 상세 행도 함께 지운다"], ["th.expand / td.expand > .expand-btn", "cell", "—", "행 펼침 — 맨 앞 칸. 머리글에는 숨긴 이름(.sr-only), 버튼은 aria-expanded · aria-controls(상세 행 id) · 행마다 다른 aria-label. React <code>renderExpanded</code>"], ["tr.row-detail[hidden] > td[colspan] > .row-detail-body", "row", "—", "바로 앞 행의 상세. colspan = 열 수. 글자는 셰브론 뒤 첫 칸의 글자와 같은 선(왼쪽 56)에서 시작합니다. 안에 .detail-meta(dl) · Code · 불러오는 중 .spinner-wrap. React 는 <code>renderExpanded(row, {expanded})</code> — 접힌 행도 그려 두므로 불러와야 하는 내용은 expanded 일 때만 돌려줍니다. 펼칠 내용이 없는 행은 <code>expandable</code> 로 빼면 셰브론 없이 빈 칸"], ["ds:row-expand", "event", "—", "행(tr)에서 {expanded}. 상세를 불러올 때 쓴다. React <code>expanded</code> · <code>defaultExpanded</code> · <code>onExpandedChange(set, {key, expanded})</code> — 지금 rows 에 없는 키는 지우고(페이지를 옮기면 접힘), <code>expandScope</code> 가 바뀌면 모두 접습니다(key null)"], ["[data-retry]", "attribute", "—", "오류 행의 다시 시도. ds:retry"], [".tbl-wrap[aria-busy=\"true\"]", "attribute", "—", "다시 불러오는 중 — 지난 행을 흐리게 둔다(행을 Skeleton 으로 바꾸지 않음). 제품이 달고 뗀다. React <code>status=\"loading\"</code> 에 rows 가 있으면 자동, 이름은 caption 이 있으면 '{caption} 불러오는 중'. 지연은 React <code>delay</code>(true = 1초 · ms)"], ["tr.on / .disabled", "row", "—", "선택 / 비활성. 비활성 행은 <code>aria-disabled=\"true\"</code>(<code>inert</code> 는 쓰지 않는다 — 클릭이 표로 떨어지고 행 글자가 보조기기에서 사라진다), 안의 링크 · 버튼은 <code>tabindex=\"-1\"</code> + <code>aria-disabled</code>. 비활성 행 안의 태그도 disable 토큰으로 칠해져 심각도 색이 활성처럼 남지 않습니다"], ["td.num / .check / .actions / .empty", "cell", "—", "숫자 우측 정렬 / 체크박스 열 / 행 액션 / 빈 상태"], [".action-bar", "div", "—", "선택 건수 + 일괄 액션(버튼 둘 이상은 .btn-group). 선택 표 위에 늘 있고(면 없음 · 고정 헤더 표에서는 스크롤해도 맨 위), 0개면 ds.js 가 버튼에 aria-disabled 를 답니다. React <code>ActionBar count={0}</code> 도 같습니다"]],
    spec: [["Size", "행 48 · compact 40 · relaxed 56 · 헤더 44 · 40 · 48 · 셀 좌우 16 · 액션 바 위아래 10 · 좌우 0 · 행 동작 아이콘 버튼 칸은 위아래 7(compact 는 버튼 28 · 5) — 버튼이 있어도 행 높이 그대로"], ["Container", "테두리 · radius 없음 · 머리글 면 없음(고정 헤더 · 고정 열은 놓인 자리의 면) · 머리글 아래 선 · 행 선 line/neutral/secondary 1px(마지막 행 포함 — flush 카드 바닥에 붙으면 카드 테두리가 대신) · 합계 행 위 선 line/neutral/primary · 셀 격자선 없음"], ["Label", "헤더 Label 2 13 SemiBold tertiary(정렬된 열 neutral/primary + 진한 화살표) · 셀 Label 1/Reading Regular 14(밀도 · 로그 행과 무관) · 칸 링크는 칸 글자색 Medium + hover 밑줄 · 하위 텍스트 12 secondary · 숫자 tabular(표 전체) · 오른쪽 정렬은 크기 숫자(.num) · 말줄임은 긴 메시지 열 하나"]],
    figma: { frame: "Data Table", radius: "none", sizes: { row: { h: 48 }, compact: { h: 40 }, relaxed: { h: 56 }, header: { h: 44 } }, variants: { default: {}, selectable: {}, compact: {} }, states: ["default", "hover", "selected", "sorted", "empty"] },
  },

  /* ------------------------------------------------ Table */
  "table": {
    status: "ready", react: ["Table","TableHead","TableBody","TableRow","TableHeader","TableCell","SelectButton"], css: [".tbl-wrap", ".tbl"], borrows: [".indicator", ".stack", ".toolbar", ".spacer", ".select-btn", ".sr-only", ".link"],
    desc: "정렬이나 선택이 필요 없는 단순한 표입니다. 한 대상의 속성을 적는 키-값 표, 비교표, 요약 통계에 씁니다.",
    choose: [
      ["언제 쓰는가", "데이터를 보여 줄 때만 씁니다. 레이아웃을 잡는 데는 쓰지 않습니다."],
      ["비슷한 것", "한 대상의 속성은 키-값 표로, 카드 안의 짧은 속성 몇 줄은 Card Meta 로, 같은 종류의 항목을 나열하면 <a href=\"#/components/list\">List</a> 로 보여 줍니다. 행이 많아 정렬이나 선택, 페이지 나눔이 필요해지면 <a href=\"#/components/data-table\">Data Table</a> 로 옮깁니다."],
      ["Placement", "상세 패널, 리포트 요약"],
    ],
    principles: [
      ["머리글", "머리글 없는 표를 만들지 않습니다. 키-값 표는 왼쪽 키 칸이 머리글입니다."],
      ["행 스타일", "행 사이 가로선이 기본입니다. 긴 비교표는 줄무늬를, 숫자가 빽빽한 리포트는 열 사이 세로선을 씁니다. 5행 안팎의 요약은 선 없는 모양을 씁니다. 선 없는 모양은 줄무늬나 세로선과 함께 쓰지 않습니다."],
      ["행 hover", "행 hover 면은 기본으로 칠하지 않습니다. 행이 상세 화면으로 이어질 때만 옵션으로 켭니다. 읽기만 하는 표에 칠하면 누를 수 있는 것처럼 보입니다."],
      ["경계", "바깥 테두리와 둥근 모서리가 없습니다. 위는 머리글 아래 선, 아래는 마지막 행 선이 경계입니다. 카드 안에 붙일 때는 카드 패딩을 없애고 표를 그대로 둡니다. 표가 카드 바닥에 닿으면 마지막 행 선을 지우고 카드 테두리가 아래 경계를 맡습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "머리글과 본문만 둔 기본 표입니다.", html: `
        <div class="tbl-wrap" style="max-width:480px">
          <table class="tbl">
            <thead><tr><th>그룹</th><th class="num">에이전트</th></tr></thead>
            <tbody>
              <tr><td>영업팀</td><td class="num">312</td></tr>
              <tr><td>개발팀</td><td class="num">184</td></tr>
            </tbody>
          </table>
        </div>
      ` },
      { id: "simple", group: "variant", title: "Simple", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl">
            <thead><tr><th>그룹</th><th class="num">에이전트</th><th class="num">정책</th><th>최근 배포</th></tr></thead>
            <tbody>
              <tr><td>영업팀</td><td class="num">312</td><td class="num">8</td><td>2026. 09. 06</td></tr>
              <tr><td>개발팀</td><td class="num">184</td><td class="num">11</td><td>2026. 09. 06</td></tr>
              <tr><td>인프라팀</td><td class="num">48</td><td class="num">14</td><td>2026. 09. 02</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "hover", group: "variant", title: "Hover", desc: "행 hover 는 기본이 아니라 옵션입니다. 행이 상세 화면으로 이어질 때만 켜고, 읽기만 하는 표에는 켜지 않습니다.", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl hover">
            <thead><tr><th>그룹</th><th class="num">에이전트</th><th>최근 배포</th></tr></thead>
            <tbody>
              <tr><td><a href="#" class="link">영업팀</a></td><td class="num">312</td><td>2026. 09. 06</td></tr>
              <tr><td><a href="#" class="link">개발팀</a></td><td class="num">184</td><td>2026. 09. 06</td></tr>
              <tr><td><a href="#" class="link">인프라팀</a></td><td class="num">48</td><td>2026. 09. 02</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "kv", group: "variant", title: "Key–Value", desc: "상세 패널의 속성 표입니다. 왼쪽 머리글 칸이 키입니다.", html: `
        <div class="tbl-wrap" style="max-width:560px">
          <table class="tbl kv">
            <tbody>
              <tr><th>정책 ID</th><td>POL-2041</td></tr>
              <tr><th>이름</th><td>외부 USB 차단</td></tr>
              <tr><th>적용 그룹</th><td>전체 (1,284대)</td></tr>
              <tr><th>상태</th><td><span class="indicator ok">사용 중</span></td></tr>
              <tr><th>최근 수정</th><td>2026. 09. 06 14:20 · admin@jiran.com</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "zebra", group: "variant", title: "Zebra / Compact", desc: "긴 비교표는 줄무늬로 행 추적을 돕습니다.", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl compact zebra">
            <thead><tr><th>기능</th><th>Standard</th><th>Enterprise</th></tr></thead>
            <tbody>
              <tr><td>실시간 보호</td><td>${I("check",16)}</td><td>${I("check",16)}</td></tr>
              <tr><td>USB 제어</td><td>${I("check",16)}</td><td>${I("check",16)}</td></tr>
              <tr><td>행위 기반 탐지</td><td>—</td><td>${I("check",16)}</td></tr>
              <tr><td>감사 로그 보관</td><td>30일</td><td>1년</td></tr>
              <tr><td>SIEM 연동</td><td>—</td><td>${I("check",16)}</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "grid", group: "variant", title: "Grid / Total", desc: "숫자가 빽빽한 리포트는 열 사이 세로선으로 칸을 가릅니다. 바깥 테두리가 없어서 마지막 칸 오른쪽에는 선이 없습니다. 합계는 맨 아래 합계 행에 둡니다.", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl compact grid">
            <thead><tr><th>월</th><th class="num">탐지</th><th class="num">차단</th><th class="num">허용</th><th class="num">차단율</th></tr></thead>
            <tbody>
              <tr><td>7월</td><td class="num">1,204</td><td class="num">1,113</td><td class="num">91</td><td class="num">92.4%</td></tr>
              <tr><td>8월</td><td class="num">1,388</td><td class="num">1,301</td><td class="num">87</td><td class="num">93.7%</td></tr>
              <tr><td>9월</td><td class="num">1,054</td><td class="num">1,002</td><td class="num">52</td><td class="num">95.1%</td></tr>
            </tbody>
            <tfoot><tr class="total"><td>3개월 합계</td><td class="num">3,646</td><td class="num">3,416</td><td class="num">230</td><td class="num">93.7%</td></tr></tfoot>
          </table>
        </div>` },
      { id: "plain", group: "variant", title: "Plain", desc: "5행 안팎의 작은 요약은 행 선을 없앱니다. 머리글 아래 선은 남습니다.", html: `
        <div class="tbl-wrap" style="max-width:360px">
          <table class="tbl compact plain">
            <thead><tr><th>상태</th><th class="num">단말</th></tr></thead>
            <tbody>
              <tr><td>정상</td><td class="num">1,236</td></tr>
              <tr><td>점검 필요</td><td class="num">36</td></tr>
              <tr><td>연결 끊김</td><td class="num">12</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "density", group: "size", title: "Density", desc: "행 높이는 좁게 40px, 기본 48px, 넓게 56px 세 단계입니다. Data Table 과 같은 단계이고, 툴바의 Select Button 으로 바꿀 수 있습니다.", html: `
        <div class="stack">
          <div class="toolbar"><span class="spacer"></span><div class="select-btn outline sm" role="radiogroup" aria-label="행 밀도" data-density-for="tb-density"><button type="button" role="radio" aria-checked="false" data-density="compact">좁게</button><button type="button" class="on" role="radio" aria-checked="true" data-density="default">기본</button><button type="button" role="radio" aria-checked="false" data-density="relaxed">넓게</button></div></div>
          <div class="tbl-wrap">
            <table class="tbl" id="tb-density">
              <thead><tr><th>그룹</th><th class="num">에이전트</th><th class="num">정책</th><th>최근 배포</th></tr></thead>
              <tbody>
                <tr><td>영업팀</td><td class="num">312</td><td class="num">8</td><td>2026. 09. 06</td></tr>
                <tr><td>개발팀</td><td class="num">184</td><td class="num">11</td><td>2026. 09. 06</td></tr>
                <tr><td>인프라팀</td><td class="num">48</td><td class="num">14</td><td>2026. 09. 02</td></tr>
              </tbody>
            </table>
          </div>
        </div>`, layout: "top" },
      { id: "sub-text", group: "variant", title: "Sub Text", desc: "주 값 아래에 보조 글을 둡니다. 그룹 아래 담당자, 정책 아래 ID 같은 식입니다. 칸이 두 줄이라 넓은 밀도인 56px 행을 씁니다.", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl relaxed">
            <thead><tr><th>그룹</th><th>정책</th><th class="num">에이전트</th></tr></thead>
            <tbody>
              <tr><td>영업팀<span class="cell-sub">담당 김민준</span></td><td>외부 USB 차단<span class="cell-sub">POL-2041</span></td><td class="num">312</td></tr>
              <tr><td>개발팀<span class="cell-sub">담당 이서연</span></td><td>스크립트 실행 제한<span class="cell-sub">POL-1187</span></td><td class="num">184</td></tr>
              <tr><td>인프라팀<span class="cell-sub">담당 박지훈</span></td><td>원격 접속 허용 목록<span class="cell-sub">POL-0932</span></td><td class="num">48</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "sticky", group: "variant", title: "Sticky Header", desc: "표 영역에 높이를 주면 안에서 스크롤하고 머리글이 남습니다. 표 영역이 스크롤되므로 영역에 이름을 붙이고 키보드로 닿게 합니다.", html: `
        <div class="tbl-wrap sticky" tabindex="0" role="region" aria-label="월별 차단 현황" style="max-height:240px;max-width:640px">
          <table class="tbl compact">
            <caption class="sr-only">월별 차단 현황</caption>
            <thead><tr><th>월</th><th class="num">탐지</th><th class="num">차단</th><th class="num">차단율</th></tr></thead>
            <tbody>${[["1월", "982", "901", "91.8%"], ["2월", "1,040", "958", "92.1%"], ["3월", "1,117", "1,030", "92.2%"], ["4월", "1,096", "1,012", "92.3%"], ["5월", "1,233", "1,141", "92.5%"], ["6월", "1,180", "1,094", "92.7%"], ["7월", "1,204", "1,113", "92.4%"], ["8월", "1,388", "1,301", "93.7%"], ["9월", "1,054", "1,002", "95.1%"]].map(([m, a, b, c]) => `<tr><td>${m}</td><td class="num">${a}</td><td class="num">${b}</td><td class="num">${c}</td></tr>`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
      { id: "sticky-col", group: "variant", title: "Sticky Column", desc: "열이 많아 가로로 스크롤하면 첫 열을 고정합니다. 고정 칸 오른쪽에 선이 생깁니다.", html: `
        <div class="tbl-wrap sticky-col" tabindex="0" role="region" aria-label="그룹별 정책 적용" style="max-width:640px">
          <table class="tbl">
            <caption class="sr-only">그룹별 정책 적용</caption>
            <thead><tr><th>그룹</th><th class="num">에이전트</th><th class="num">USB 차단</th><th class="num">스크립트 제한</th><th class="num">원격 접속</th><th class="num">화면 캡처</th><th class="num">프린터</th><th>최근 배포</th></tr></thead>
            <tbody>${[["영업팀", "312", "312", "298", "12", "312", "40", "2026. 09. 06"], ["개발팀", "184", "184", "0", "184", "120", "8", "2026. 09. 06"], ["인프라팀", "48", "48", "48", "48", "48", "2", "2026. 09. 02"]].map(([g, ...v]) => `<tr><td>${g}</td>${v.slice(0, 6).map((n) => `<td class="num">${n}</td>`).join("")}<td>${v[6]}</td></tr>`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
    ],
    props: [[".tbl-wrap", "container", "—", "가로 스크롤(테두리 · radius 없음)"], [".tbl-wrap.sticky", "class", "—", "고정 헤더. max-height · tabindex=0 · 이름을 함께. React stickyHeader · maxHeight · regionLabel"], [".tbl-wrap.sticky-col", "class", "—", "첫 열 고정. tabindex=0 · 이름을 함께. React stickyColumn · regionLabel"], [".tbl", "table", "—", "기본 표(행 48)"], [".kv", "boolean", "false", "키-값 표(th 폭 200 · 머리글 13 · 첫 행 위 선, 머리글 오른쪽 선 없음). 상세 패널의 속성 표"], [".select-btn[data-density-for]", "attribute", "—", "표 id. 버튼 data-density(compact · default · relaxed)로 밀도를 바꾼다"], [".compact / .relaxed", "boolean", "false", "행 40 / 56. React density"], [".zebra / .grid / .plain", "boolean", "false", "줄무늬 / 열 사이 세로선 / 행 선 없음. React rowStyle"], [".hover", "boolean", "false", "행 hover · 눌림 면(surface/neutral/tertiary · strong) — 기본은 없음. 행이 상세로 이어질 때만 켭니다. 행을 고르거나 행 동작이 있으면 Data Table 입니다. React hover"], [".nowrap", "boolean", "false", "칸을 한 줄로 — 좁으면 .tbl-wrap 이 가로로 스크롤합니다. 짧은 값만 있는 요약 표에 씁니다(긴 글은 Data Table 의 말줄임). React nowrap"], ["tfoot tr.total", "row", "—", "합계 행. React TableFoot"], [".cell-sub", "element", "—", "칸 안 주 값 아래 보조 글(12 secondary). React TableCell sub"], ["td.num", "cell", "—", "크기 숫자 우측 정렬"]],
    spec: [["Size", "행 48 · compact 40 · relaxed 56 · kv th 폭 200"], ["Container", "테두리 · radius 없음 · 머리글 면 없음 · 속성 표 머리글에 오른쪽 선 없음 · 행 선 line/neutral/secondary(마지막 행 포함 — flush 카드 바닥에 붙으면 카드 테두리가 대신) · grid 세로선 같은 색"], ["Label", "헤더 Label 2 13 SemiBold tertiary · 셀 Label 1/Reading Regular 14(밀도 · 로그 행과 무관) · 하위 텍스트 12 secondary · kv 헤더 13 Medium secondary"]],
    figma: { frame: "Table", radius: "none", sizes: { row: { h: 48 }, compact: { h: 40 }, relaxed: { h: 56 } }, variants: { simple: {}, kv: {}, zebra: {}, grid: {}, plain: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ List */
  "list": {
    status: "ready", react: ["List","ListItem"], css: [".list", ".avatar", ".tag", ".indicator"], borrows: [".btn", ".tooltip-wrap", ".tooltip"],
    desc: "같은 종류의 항목을 세로로 나열합니다. 열이 2~3개 이하이고 항목마다 제목 · 부제 · 동작이 있으면 표 대신 List 를 씁니다.",
    choose: [
      ["언제 쓰는가", "열이 2~3개이고 항목마다 제목, 부제, 동작이 있을 때 씁니다. 값을 열로 비교하면 표를, 항목이 각각 독립된 묶음이면 Card 를 씁니다."],
      ["Placement", "상세 패널 목록, 설정의 항목 목록"],
    ],
    principles: [
      ["행 전체 클릭", "안쪽 버튼 · 링크를 누르면 행을 누른 것으로 치지 않습니다. <a href=\"#/components/data-table\">Data Table</a> 과 같습니다."],
      ["행 버튼 이름", "행마다 달라야 합니다. '편집' 이 아니라 '김민준 편집' 입니다."],
      ["listbox", "선택 목록은 항목 하나를 고르는 목록에만 씁니다. 그 안에는 버튼 · 링크를 넣지 않고, 항목은 Tab 으로 닿아야 합니다."],
    ],
    examples: [
      { id: "basic", group: "default", title: "Default", desc: "제목과 부제, 오른쪽 영역으로 이루어진 기본 목록입니다.", html: `
        <ul class="list" style="max-width:560px">
          <li><div><span class="primary">외부 USB 차단</span><span class="meta">전체 · 1,284대 · 2026. 09. 06</span></div><span class="end"><span class="tag ok">사용</span></span></li>
          <li><div><span class="primary">스크립트 실행 제한</span><span class="meta">개발팀 제외 · 1,102대</span></div><span class="end"><span class="tag ok">사용</span></span></li>
          <li><div><span class="primary">원격 접속 허용 목록</span><span class="meta">인프라팀 · 48대</span></div><span class="end"><span class="tag">중지</span></span></li>
        </ul>` },
      { id: "media", group: "variant", title: "With Avatar / Actions", desc: "앞에 아이콘이나 아바타를, 뒤에 동작 버튼을 둡니다.", html: `
        <ul class="list" style="max-width:560px">
          <li><span class="avatar">김</span><div><span class="primary">김민준</span><span class="meta">보안팀 · 관리자</span></div><span class="end"><div class="btn-group"><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="김민준 편집">${I("pencil")}</button><span class="tooltip" role="tooltip">김민준 편집</span></span><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="김민준 더 보기">${I("dots")}</button><span class="tooltip" role="tooltip">김민준 더 보기</span></span></div></span></li>
          <li><span class="avatar">이</span><div><span class="primary">이서연</span><span class="meta">인프라팀 · 운영자</span></div><span class="end"><div class="btn-group"><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="이서연 편집">${I("pencil")}</button><span class="tooltip" role="tooltip">이서연 편집</span></span><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="이서연 더 보기">${I("dots")}</button><span class="tooltip" role="tooltip">이서연 더 보기</span></span></div></span></li>
        </ul>` },
      { id: "select", group: "variant", title: "Selectable / Dense", desc: "행을 눌러 하나를 고르는 목록입니다. 고른 행에는 선택 면이 칠해집니다. 밀도가 높은 목록은 행 높이를 40px 로 줄입니다.", html: `
        <ul class="list hover dense" style="max-width:480px" role="listbox" aria-label="단말">
          <li role="option" tabindex="0"><span class="indicator ok">PC-2041</span><span class="end meta">10.0.4.21</span></li>
          <li role="option" tabindex="0" class="on" aria-selected="true"><span class="indicator danger">PC-1187</span><span class="end meta">10.0.4.33</span></li>
          <li role="option" tabindex="0"><span class="indicator">PC-0932</span><span class="end meta">오프라인</span></li>
        </ul>` },
    ],
    props: [[".list", "ul", "—", "보더 + radius/lg. li 는 flex row"], [".primary / .meta / .end", "elements", "—", "제목 / 부제 / 우측 영역"], [".hover / li.on", "boolean", "false", "행 hover 배경 / 선택"], [".dense / .plain", "boolean", "false", "행 40 / 보더 없음"]],
    spec: [["Size", "행 padding 12 16 (dense 8 16)"], ["Container", "radius/lg · line/neutral/secondary · 행 사이 1px"], ["Label", "제목 14 Medium · 부제 12 Regular tertiary"]],
    figma: { frame: "List", radius: "radius/lg", sizes: { md: { h: 56 }, dense: { h: 40 } }, variants: { default: {}, media: {}, selectable: {} }, states: ["default", "hover", "selected"] },
  },

  /* ------------------------------------------------ Item Tile */
  "item-tile": {
    status: "ready", react: ["Tile","TileGrid"], css: [".tile", ".tile-grid", ".tag"],
    desc: "아이콘·제목·설명을 담은 작은 선택지입니다. 연동 모듈이나 보호 기능처럼 여러 개를 고르거나, 눌러서 바로 이동할 때 씁니다.",
    choose: [
      ["언제 쓰는가", "아이콘이 앞서는 작은 선택지를 여러 개 고르거나, 눌러서 바로 이동할 때 씁니다."],
      ["비슷한 것", "하나만 고르면 <a href=\"#/components/radio-button\">Card Radio</a> 를, 내용이 많은 카드를 고르면 <a href=\"#/components/card\">Card Selection</a> 을 씁니다."],
      ["Placement", "연동 목록, 여러 개를 고르는 모듈 선택"],
    ],
    principles: [
      ["선택의 뜻", "타일의 선택은 하나씩 켜고 끄는 다중 선택입니다. 하나만 고르는 묶음에는 쓰지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "선택하지 않은 기본 타일입니다.", html: `<button type="button" class="tile"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>` },
      { id: "grid", group: "variant", title: "Grid", desc: "타일을 격자로 나열합니다. 고른 타일은 제품 색 테두리와 옅은 제품 색 면으로 표시됩니다.", html: `
        <div class="tile-grid" style="max-width:760px">
          <button type="button" class="tile on" aria-pressed="true"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("server")}</span><b>네트워크 격리</b><span>감염 의심 단말 격리</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("list")}</span><b>스크립트 제한</b><span>PowerShell·WSH 실행 제어</span></button>
          <button type="button" class="tile" aria-pressed="false" disabled><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>Enterprise 전용</span></button>
        </div>` },
      { id: "badge", group: "variant", title: "With Tag", desc: "오른쪽 위에 상태나 신규 태그를 둡니다. 비활성 타일에서는 태그도 비활성 색이 됩니다.", html: `
        <div class="tile-grid" style="max-width:560px">
          <button type="button" class="tile"><span class="tag accent sm">NEW</span><span class="ico">${I("bell")}</span><b>Slack 알림</b><span>채널로 이벤트 전송</span></button>
          <button type="button" class="tile"><span class="tag ok sm">연결됨</span><span class="ico">${I("user")}</span><b>AD 연동</b><span>사용자·그룹 동기화</span></button>
          <button type="button" class="tile" disabled><span class="tag accent sm">Enterprise</span><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>이벤트 로그 전달</span></button>
        </div>` },
      { id: "horizontal", group: "variant", title: "Horizontal", desc: "좁은 폭에서는 아이콘과 글자를 가로로 놓습니다.", html: `
        <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:420px">
          <button type="button" class="tile horizontal on" aria-pressed="true"><span class="ico">${I("chart-bar")}</span><div><b>주간 요약</b><span>매주 월요일 발송</span></div></button>
          <button type="button" class="tile horizontal" aria-pressed="false"><span class="ico">${I("list")}</span><div><b>상세 이벤트</b><span>CSV · 최대 10만 행</span></div></button>
        </div>` },
    ],
    props: [[".tile", "button", "—", ".ico + b(제목) + span(설명). aria-pressed"], [".on", "boolean", "false", "선택(brand 보더·배경)"], [".horizontal", "boolean", "false", "가로 배치"], ["disabled", "attribute", "—", "선택 불가"], [".tile-grid", "container", "—", "auto-fill 180px 그리드"]],
    spec: [["Size", "최소 폭 180 · padding 16 · 아이콘 36"], ["Container", "radius/lg 8 · line/neutral/secondary · 선택 brand"], ["Label", "제목 14 Bold · 설명 12 Regular tertiary"]],
    figma: { frame: "Item Tile", radius: "radius/lg", sizes: { md: { minW: 180, pad: 16 } }, variants: { default: { stroke: "--line-neutral-secondary" }, selected: { stroke: "--surface-brand-primary", bg: "--surface-brand-subtle" } }, states: ["default", "hover", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Data Visual */
  "data-visual": {
    status: "ready", react: ["Kpi","KpiGrid","ChartCard","BarChart","Donut","DonutRow","ChartLegend","Sparkline","ProgressList"], css: [".kpi", ".kpi-grid", ".kpi-foot", ".delta", ".delta-note", ".chart", ".progress-list", ".chart-card", ".chart-head", ".chart-sub", ".chart-action", ".chart-figure", ".chart-view", ".chart-tools", ".chart-table", ".chart-canvas", ".chart-state", ".donut", ".donut-row", ".chart-legend", ".sparkline"], borrows: [".btn", ".tbl", ".tbl-wrap", ".progress-row", ".progress", ".skeleton", ".empty", ".sr-only"],
    desc: "대시보드의 수치 · 추이 · 비율을 <b>한 세트</b>로 보여 줍니다. 모든 차트는 같은 카드 틀에 들어갑니다. 카드는 높이 32px 머리, 큰 값, 정해진 단계의 본문으로 이루어집니다. 색은 <b>한 톤</b>이 기본입니다. 제품 색과 상관없는 고정 파랑을 명도 4단계로 씁니다. 그래서 어느 차트를 골라 옆에 두어도 줄과 색이 맞습니다. KPI · 스파크라인 · 가로 막대 · 진행 막대 · 도넛 같은 <b>정적 요약</b>은 CSS 만으로 그립니다. 시계열 · 막대 · 도넛 · 혼합 · 게이지 · 스파크 같은 <b>탐색형 차트</b>는 Chart.js 위에 디자인 토큰을 입혀 그립니다.",
    choose: [
      ["언제 쓰는가", "숫자 하나는 KPI, 기간에 따른 변화는 Timeseries, 항목 비교는 Bar, 구성비는 Donut, 목표 대비는 Gauge 나 진행 막대 목록을 씁니다. 값 몇 개를 요약만 하면 정적 차트로, 툴팁 · 기간 비교가 필요하면 탐색형 차트로 그립니다."],
      ["비슷한 것", "정확한 값을 서로 견주어야 하면 <a href=\"#/components/table\">Table</a> 이 낫습니다. 작업이 얼마나 진행됐는지는 <a href=\"#/components/loading\">Loading</a> 의 진행 막대입니다."],
      ["Placement", "대시보드 상단 KPI 4개, 아래 차트 카드 2열(추이 · 분포) — 같은 줄의 카드는 같은 높이 단계와 같은 머리 구성(큰 값이 있으면 모두 있게)으로 맞춥니다"],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "차트 카드 하나입니다. 머리에 제목 · 보조 글자 · 동작을, 그 아래 큰 값과 증감을, 맨 아래 차트를 둡니다. 계열이 하나인 추이는 한 톤의 가장 진한 단계로 선을 긋고, 선 아래를 같은 색으로 옅게 칠합니다.", html: `
        <div class="chart-card" style="max-width:640px">
          ${chartHead("일별 탐지", "최근 14일", `<button type="button" class="btn sm text assistive">전체 보기</button>`)}
          <div class="chart-figure"><span class="value">1,429<small>건</small></span>${delta("up", "bad", "8%")}<span class="delta-note">지난 14일 대비</span></div>
          ${chartCanvas("timeseries", CHART_DATA.daily14, "일별 탐지 — 최근 14일 합계 1,429건, 지난 14일보다 8% 증가")}
        </div>`, js: chartJs("timeseries", CHART_DATA.daily14, ".chart-canvas canvas") },
      { id: "kpi", group: "variant", title: "KPI", desc: "라벨 · 값 · 증감 배지로 이루어집니다. 배지 색은 방향이 아니라 <b>의미</b>를 나릅니다. 위협이 늘면 나쁨, 차단률이 오르면 좋음이고, 판단이 없으면 중립 색입니다. 화살표는 방향만 나르고, 스크린 리더에는 숨긴 '증가' · '감소' 글자가 방향을 읽어 줍니다. 비교 기준은 배지 밖에 적습니다.", html: `
        <div class="kpi-grid" style="max-width:800px">
          <div class="kpi critical"><span class="label">Critical 이벤트</span><span class="value">1,284</span><div class="kpi-foot">${delta("up", "bad", "12%")}<span class="delta-note">전주 대비</span></div></div>
          <div class="kpi"><span class="label">차단률</span><span class="value">99.2<small>%</small></span><div class="kpi-foot">${delta("up", "good", "0.3%p")}<span class="delta-note">전주 대비</span></div></div>
          <div class="kpi"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><div class="kpi-foot"><span class="delta-note">37대 오프라인</span></div></div>
        </div>` },
      { id: "spark", group: "variant", title: "Sparkline", desc: "KPI 안에 넣는 작은 추이입니다. 정적 스파크라인은 옅은 단계의 막대로 그리고, 강조할 막대만 진하게 칠합니다. 정적 스파크라인은 값 오른쪽에 밑변을 숫자 기준선에 맞춰 놓이고, 자리가 모자라면 값 아래로 내려갑니다. 마우스로 값을 봐야 하면 탐색형 스파크를 카드 맨 아래에 둡니다. 탐색형 스파크는 축 없는 선과 옅은 영역이고 높이는 40px 입니다.", html: `
        <div class="kpi-grid" style="max-width:640px">
          <div class="kpi"><span class="label">일별 탐지</span><span class="value">412</span><div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div></div>
          <div class="kpi"><span class="label">신규 위협</span><span class="value">112</span><div class="kpi-foot">${delta("up", "bad", "20%")}<span class="delta-note">전일 대비</span></div>${sparkCanvas(CHART_DATA.spark, "신규 위협 — 최근 10일 62건에서 112건으로 증가")}</div>
        </div>` },
      { id: "timeseries", group: "variant", title: "Timeseries", desc: "기간에 따른 추이입니다. 선은 2px 이고 끝과 꺾임이 둥급니다. 포인터를 올리면 세로 기준선이 가장 가까운 날짜를 잡고, 그 날짜의 점이 지름 8px 로 나타나며, 툴팁에 모든 계열의 값이 나옵니다. 가로 격자는 실선입니다. 심각도 계열은 누적 영역으로 쌓고 심각도 색을 그대로 씁니다. 심각도는 한 톤 규칙의 예외입니다. 범례는 계열이 2개 이상일 때 아래에 붙고, 눌러서 계열을 끌 수 있습니다. 표로 보기 옵션을 켜면 같은 값을 표로 바꿔 볼 수 있습니다.", html: `
        <div class="chart-card" style="max-width:640px">
          ${chartHead("일별 탐지 추이", "최근 14일")}
          ${chartCanvas("timeseries", CHART_DATA.trend, "일별 탐지 추이 — 최근 14일, Critical · High · Medium 누적 영역", { table: true })}
        </div>`, js: chartJs("timeseries", CHART_DATA.trend, ".chart-canvas canvas") },
      { id: "bars", group: "variant", title: "Bars", desc: "범주 비교는 세로 막대로 그립니다. 라벨이 길거나 순위를 보일 때는 가로 막대를, 구성을 보일 때는 누적 막대를 씁니다. 심각도가 아닌 계열은 <b>한 톤의 명도 단계</b>를 받습니다. 이번 주와 지난 주처럼 계열이 둘이면 가장 진한 단계와 옅은 단계입니다. 심각도 계열은 심각도 색을 받습니다. 막대는 두께가 최대 24px 이고 값 쪽 끝만 둥급니다. 누적 막대의 조각 사이와 나란한 막대 사이에는 2px 틈을 둡니다. 가로 막대는 격자도 세로로 긋습니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:16px;width:100%;max-width:960px">
          <div class="chart-card">
            ${chartHead("유형별 탐지", "주간 비교")}
            ${chartCanvas("bar", CHART_DATA.weeks, "유형별 탐지 — 이번 주와 지난 주 비교")}
          </div>
          <div class="chart-card">
            ${chartHead("부서별 심각도")}
            ${chartCanvas("bar", CHART_DATA.depts, "부서별 심각도 — Critical · High · Medium · Low · Info 누적")}
          </div>
        </div>`, js: chartJs("bar", CHART_DATA.weeks, ".chart-canvas canvas") },
      { id: "bar-emphasis", group: "variant", title: "Highlight · Gradient", desc: "막대 하나를 말할 때는 그 막대를 강조합니다. 강조한 막대만 진한 단계이고 나머지는 옅은 단계입니다. 그라데이션은 막대마다 기준선에서 55% 농도로 시작해 값 끝의 진한 색까지 칠합니다. 둘 다 계열이 하나인 막대에만 씁니다. 누적 막대에 그라데이션을 쓰면 조각끼리 갈리지 않으므로 쓰지 않습니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:16px;width:100%;max-width:960px">
          <div class="chart-card">
            ${chartHead("요일별 차단", "이번 주")}
            ${chartCanvas("bar", CHART_DATA.weekday, "요일별 차단 — 이번 주, 금요일 268건이 가장 많음")}
          </div>
          <div class="chart-card">
            ${chartHead("월별 탐지", "최근 6개월")}
            ${chartCanvas("bar", CHART_DATA.monthly, "월별 탐지 — 최근 6개월, 10월 2,920건이 가장 많음")}
          </div>
        </div>`, js: chartJs("bar", CHART_DATA.weekday, ".chart-canvas canvas") },
      { id: "bar", group: "variant", title: "Bar Chart", desc: "상위 몇 개를 요약하는 정적 막대입니다. 막대 길이가 값이고, 색은 한 톤의 가장 진한 단계입니다. 막대가 심각도를 나타낼 때만 심각도 색을 씁니다.", html: `
        <div class="chart-card" style="max-width:560px">
          ${chartHead("유형별 탐지", "최근 7일")}
          <div class="chart">
            <div class="row"><span class="lbl">랜섬웨어</span><div class="bar"><i style="width:82%"></i></div><span class="num">412</span></div>
            <div class="row"><span class="lbl">악성코드</span><div class="bar"><i style="width:61%"></i></div><span class="num">306</span></div>
            <div class="row"><span class="lbl">USB 위반</span><div class="bar"><i style="width:44%"></i></div><span class="num">221</span></div>
            <div class="row"><span class="lbl">정책 위반</span><div class="bar"><i style="width:23%"></i></div><span class="num">115</span></div>
            <div class="row"><span class="lbl">피싱</span><div class="bar"><i style="width:18%"></i></div><span class="num">88</span></div>
          </div>
        </div>` },
      { id: "progress", group: "variant", title: "Progress List", desc: "항목마다 목표 대비 값을 보입니다. 윗줄에 라벨과 '값 / 목표' 를, 아랫줄에 한 톤의 각진 막대를 둡니다. 작업 진행이 아니라 측정값이므로 스크린 리더에도 측정값으로 알리고, 값 문구를 함께 읽어 줍니다.", html: `
        <div class="chart-card" style="max-width:420px">
          ${chartHead("부서별 패치 적용", "에이전트 기준")}
          <div class="progress-list">
            ${meter("pl-dev", "개발팀", 412, 450, "대")}
            ${meter("pl-sales", "영업팀", 236, 298, "대")}
            ${meter("pl-ops", "운영팀", 128, 196, "대")}
            ${meter("pl-fin", "재무팀", 66, 140, "대")}
          </div>
        </div>` },
      { id: "gauge", group: "variant", title: "Gauge", desc: "목표 대비 값 하나를 크게 보입니다. 반원에서 채운 호는 한 톤의 가장 진한 단계이고, 나머지는 트랙입니다. 가운데 큰 글자와 그 위 설명이 값을 나르고 범례 · 툴팁은 없습니다. 그래서 차트의 읽는 이름에 '값 / 목표' 를 적습니다.", html: `
        <div class="chart-card" style="max-width:360px">
          ${chartHead("패치 적용률", "전체 에이전트")}
          ${chartCanvas("gauge", CHART_DATA.patch, "패치 적용률 66% — 1,284대 중 842대")}
        </div>`, js: chartJs("gauge", CHART_DATA.patch, ".chart-canvas canvas") },
      { id: "donut", group: "variant", title: "Donut + Legend", desc: "구성 비율을 보이는 정적 도넛입니다. 조각 비율은 누적 백분율로 정합니다. 조각 경계마다 2px 구분선을 두고, 구분선 수는 조각 수와 같습니다. 구분선 각도는 위가 0° 이고 시계 방향으로 잽니다. 색은 기본이 심각도 다섯 색이고, 한 톤이나 계열 색으로 바꿀 수 있습니다. 한 톤이면 조각 수에 맞는 명도 단계를 씁니다. 가운데에는 합계 값을 적습니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:16px;width:100%;max-width:720px">
          <div class="chart-card">
            ${chartHead("심각도 분포")}
            <div class="donut-row">
              <div class="donut" role="img" aria-label="Critical 18%, High 27%, Medium 19%, Low 11%, Info 25%" data-label="1,054"><i style="--a:0deg"></i><i style="--a:64.9deg"></i><i style="--a:162.3deg"></i><i style="--a:229.2deg"></i><i style="--a:270.2deg"></i></div>
              <div class="chart-legend" style="flex-direction:column">
                <span><i class="critical"></i>Critical <b>190</b></span>
                <span><i class="high"></i>High <b>285</b></span>
                <span><i class="medium"></i>Medium <b>196</b></span>
                <span><i class="low"></i>Low <b>120</b></span>
                <span><i class="info"></i>Info <b>263</b></span>
              </div>
            </div>
          </div>
          <div class="chart-card">
            ${chartHead("탐지 경로")}
            <div class="donut-row">
              <div class="donut mono" role="img" aria-label="엔드포인트 58%, 메일 24%, 네트워크 12%, USB 6%" data-label="1,054" style="--d1:58.06%;--d2:81.59%;--d3:94.02%"><i style="--a:0deg"></i><i style="--a:209deg"></i><i style="--a:293.7deg"></i><i style="--a:338.5deg"></i></div>
              <div class="chart-legend" style="flex-direction:column">
                <span><i class="mono-1"></i>엔드포인트 <b>612</b></span>
                <span><i class="mono-2"></i>메일 <b>248</b></span>
                <span><i class="mono-3"></i>네트워크 <b>131</b></span>
                <span><i class="mono-4"></i>USB <b>63</b></span>
              </div>
            </div>
          </div>
        </div>` },
      { id: "donut-live", group: "variant", title: "Donut (Interactive)", desc: "비율을 툴팁과 범례 토글로 살펴봐야 하면 탐색형 도넛을 씁니다. 조각 색도 계열처럼 정합니다. 심각도가 아닌 조각이 4개 이하면 한 톤이고, 적은 순서대로 진한 단계부터 옅은 단계까지 칠합니다. 심각도 조각은 심각도 색입니다. 조각 사이 2px 틈과 67% 구멍은 정적 도넛과 같고, 가운데에 합계를 그립니다. 범례를 오른쪽에 두어도 자리가 좁고 세로로 길면 범례를 아래로 내립니다. 차트 폭이 높이의 1.5배보다 좁을 때입니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(22rem,1fr));gap:16px;width:100%;max-width:960px">
          <div class="chart-card">
            ${chartHead("탐지 경로")}
            ${chartCanvas("donut", CHART_DATA.channels, "탐지 경로 — 엔드포인트 612, 메일 248, 네트워크 131, USB 63, 합계 1,054")}
          </div>
          <div class="chart-card">
            ${chartHead("심각도 분포")}
            ${chartCanvas("donut", CHART_DATA.severity, "심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054")}
          </div>
        </div>`, js: chartJs("donut", CHART_DATA.channels, ".chart-canvas canvas") },
      { id: "donut-categorical", group: "variant", title: "Donut (Categorical)", desc: "순서 없는 범주가 5개 이상이면 명도만으로는 갈리지 않아 계열 색으로 넘어갑니다. 따로 정하지 않아도 심각도가 아닌 조각이 5개 이상이면 저절로 바뀝니다. 6개를 넘으면 '기타' 로 묶습니다.", html: `
        <div class="chart-card" style="max-width:480px">
          ${chartHead("운영체제 분포", "연결 에이전트")}
          ${chartCanvas("donut", CHART_DATA.os, "운영체제 분포 — Windows 11 642, Windows 10 318, macOS 156, Ubuntu 88, RHEL 51, 기타 29, 합계 1,284")}
        </div>`, js: chartJs("donut", CHART_DATA.os, ".chart-canvas canvas") },
      { id: "donut-narrow", group: "variant", title: "Donut (Narrow)", desc: "범례를 옆에 둔 도넛을 폭 300px 카드에 넣은 모습입니다. 차트 폭이 높이의 1.5배보다 좁으면 범례가 차트 아래로 내려가 도넛 지름을 지킵니다. 대시보드의 좁은 열이나 사이드 패널이 이런 자리입니다. 창 크기가 바뀌면 다시 판단합니다.", html: `
        <div class="chart-card" style="max-width:300px">
          ${chartHead("심각도 분포")}
          ${chartCanvas("donut", CHART_DATA.severity, "심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054")}
        </div>`, js: chartJs("donut", CHART_DATA.severity, ".chart-canvas canvas") },
      { id: "mixed", group: "variant", title: "Mixed", desc: "막대와 선을 한 차트에 둘 때는 <b>y 축이 하나</b>여야 합니다. 탐지와 차단은 둘 다 건수라 함께 그립니다. 건수와 % 처럼 단위가 다른 두 값은 이중 축으로 겹치지 말고 차트를 둘로 나눕니다. 막대 위를 지나는 선은 같은 파랑의 진한 톤입니다.", html: `
        <div class="chart-card" style="max-width:640px">
          ${chartHead("일별 탐지와 차단", "최근 7일")}
          ${chartCanvas("mixed", CHART_DATA.daily, "일별 탐지와 차단 — 최근 7일, 막대는 탐지 건수, 선은 차단 건수")}
        </div>`, js: chartJs("mixed", CHART_DATA.daily, ".chart-canvas canvas") },
      { id: "set", group: "variant", title: "Set", desc: "종류가 다른 차트를 한 줄에 두어도 줄이 맞습니다. 머리는 동작이 없어도 높이 32px 로 같습니다. 본문도 같은 높이 단계라 머리 아래 끝과 본문 위 끝이 나란합니다. 큰 값은 같은 줄의 카드가 모두 갖거나 모두 갖지 않게 합니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:16px;width:100%;max-width:960px">
          <div class="chart-card">
            ${chartHead("요일별 차단", "이번 주", `<button type="button" class="btn sm text assistive">전체 보기</button>`)}
            ${chartCanvas("bar", CHART_DATA.weekday, "요일별 차단 — 이번 주, 금요일 268건이 가장 많음")}
          </div>
          <div class="chart-card">
            ${chartHead("패치 적용률")}
            ${chartCanvas("gauge", CHART_DATA.patch, "패치 적용률 66% — 1,284대 중 842대")}
          </div>
          <div class="chart-card">
            ${chartHead("부서별 패치 적용")}
            <div class="progress-list">
              ${meter("set-dev", "개발팀", 412, 450, "대")}
              ${meter("set-sales", "영업팀", 236, 298, "대")}
              ${meter("set-ops", "운영팀", 128, 196, "대")}
            </div>
          </div>
        </div>` },
      { id: "flat", group: "variant", title: "Flat", desc: "회색 바탕 위에 놓인 대시보드에서는 KPI 와 차트 카드도 Card 처럼 테두리 색을 지운 모양을 씁니다. 흰 바탕 위에서는 쓰지 않습니다.", html: `
        <div style="background:var(--background-neutral-secondary);padding:24px;border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:16px;width:100%;max-width:800px">
          <div class="kpi-grid">
            <div class="kpi critical flat"><span class="label">Critical 이벤트</span><span class="value">1,284</span><div class="kpi-foot">${delta("up", "bad", "12%")}<span class="delta-note">전주 대비</span></div></div>
            <div class="kpi flat"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><div class="kpi-foot"><span class="delta-note">37대 오프라인</span></div></div>
          </div>
          <div class="chart-card flat">
            ${chartHead("유형별 탐지", "최근 7일")}
            <div class="chart">
              <div class="row"><span class="lbl">랜섬웨어</span><div class="bar"><i style="width:82%"></i></div><span class="num">412</span></div>
              <div class="row"><span class="lbl">악성코드</span><div class="bar"><i style="width:61%"></i></div><span class="num">306</span></div>
            </div>
          </div>
        </div>` },
      { id: "size", group: "size", title: "Size", desc: "본문 높이는 작게 160px, 기본 240px, 크게 320px 세 단계입니다. 차트와 표로 보기, 상태 자리가 같은 높이를 따릅니다. 한 줄의 카드는 같은 단계로 맞춥니다. KPI 옆 좁은 줄은 작게, 화면의 주 차트 하나는 크게 씁니다.", html: `
        <div style="display:flex;flex-direction:column;gap:16px;width:100%;max-width:640px">
          <div class="chart-card sm">${chartHead("Small", "160")}${chartCanvas("bar", CHART_DATA.weekday, "요일별 차단 — 이번 주, 금요일 268건이 가장 많음")}</div>
          <div class="chart-card">${chartHead("Medium", "240 · 기본")}${chartCanvas("bar", CHART_DATA.weekday, "요일별 차단 — 이번 주, 금요일 268건이 가장 많음")}</div>
          <div class="chart-card lg">${chartHead("Large", "320")}${chartCanvas("bar", CHART_DATA.weekday, "요일별 차단 — 이번 주, 금요일 268건이 가장 많음")}</div>
        </div>` },
      { id: "state", group: "state", title: "Loading · Empty · Error", desc: "카드 틀과 머리는 남기고 본문 자리만 바꿉니다. 본문 높이가 그대로라 같은 줄의 카드가 흔들리지 않습니다. 불러오는 중에는 Skeleton 을 두고, 카드가 불러오는 중이라는 것을 스크린 리더에도 알립니다. 빈 상태에는 '데이터 없음' 문구를, 오류에는 원인과 '다시 시도' 버튼을 둡니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:16px;width:100%;max-width:960px">
          <div class="chart-card" aria-busy="true">
            ${chartHead("일별 탐지", "최근 14일")}
            <div class="chart-state"><span class="skeleton rect" aria-label="차트를 불러오는 중" role="status"></span></div>
          </div>
          <div class="chart-card">
            ${chartHead("일별 탐지", "최근 14일")}
            <div class="chart-state"><div class="empty"><span class="ico">${I("chart-bar",24)}</span><b>탐지 이벤트 없음</b><span>최근 14일 동안 탐지된 이벤트가 없습니다.</span></div></div>
          </div>
          <div class="chart-card">
            ${chartHead("일별 탐지", "최근 14일")}
            <div class="chart-state"><div class="empty error"><span class="ico">${I("alert-triangle",24)}</span><b>데이터를 불러오지 못했습니다</b><span>잠시 후 다시 시도하세요.</span><button type="button" class="btn sm outline assistive" data-retry>${I("refresh",16)}다시 시도</button></div></div>
          </div>
        </div>` },
    ],
    principles: {
      "차트 고르기": [
        ["추이", "기간에 따른 변화는 Timeseries 로 그립니다. 계열이 하나면 선 아래를 옅게 칠하고, 이 칠은 끌 수 있습니다. 계열이 여럿이면 선만 그립니다."],
        ["비교", "항목 비교는 Bar 로 그립니다. 라벨이 길거나 순위를 보이면 가로 막대를 씁니다. 막대 하나를 말할 때는 그 막대를 강조합니다."],
        ["구성비", "Donut 은 한 톤이면 4조각까지, 계열 색이나 심각도 색이면 6조각까지 씁니다. 그보다 많으면 '기타' 로 묶거나 막대로 바꿉니다. 시간에 따른 구성은 누적 막대나 누적 영역으로 그립니다."],
        ["목표 대비", "목표 대비 값 하나를 크게 보이면 Gauge 를, 여럿을 나란히 견주면 진행 막대 목록을 씁니다."],
        ["숫자 하나", "숫자 하나는 KPI 로 보입니다. 흐름까지 보이려면 스파크라인을 더합니다. 정확한 값을 견주어야 하면 차트 대신 Table 을 씁니다."],
      ],
      "색": [
        ["한 톤", "심각도나 범주를 가를 필요가 없으면 고정 파랑의 한 톤을 씁니다. 계열은 진한 단계부터 옅은 단계까지 명도로 가릅니다. 두 계열이면 가장 진한 단계와 옅은 단계입니다."],
        ["범주색", "순서 없는 범주가 5개 이상이면 계열 색으로 넘어갑니다. 따로 정하지 않아도 저절로 바뀌고, 처음부터 계열 색으로 정할 수도 있습니다."],
        ["심각도 · 상태", "심각도와 상태를 나타낼 때만 심각도 · 상태 색을 씁니다. 그 밖의 계열에는 빨강 · 주황을 쓰지 않습니다."],
        ["제품 색", "차트는 제품 색을 따르지 않고 늘 같은 파랑입니다. 빨강 · 주황 제품에서도 차트가 경고나 위험처럼 읽히지 않게 하기 위해서입니다."],
        ["글자", "값 · 라벨 · 범례 글자는 글자 색을 씁니다. 계열 색은 차트 마크와 범례 견본에만 씁니다."],
        ["색 자리", "필터로 계열 수가 바뀌는 차트는 계열마다 색 자리를 정해 둡니다. 그러면 계열 하나를 빼도 남은 계열의 색이 바뀌지 않습니다."],
      ],
      "카드": [
        ["머리", "제목, 기간 같은 보조 글자, 동작 순서로 놓습니다. 동작에는 텍스트 버튼을 씁니다. 기간이나 필터는 카드 안에 두지 않고, 그것이 정하는 차트 전체 위에 한 줄로 둡니다. 머리 높이는 32px 로 고정입니다."],
        ["높이", "본문 높이는 작게 160px, 기본 240px, 크게 320px 입니다. 같은 줄의 카드는 같은 높이 단계로 맞춥니다. 머리 구성도 맞춰서, 한 카드에 큰 값이 있으면 모두 둡니다."],
        ["증감", "배지 색은 방향이 아니라 나쁨 · 좋음 · 중립의 의미를 나릅니다. 방향은 화살표와 숨긴 '증가' · '감소' 글자가 나릅니다. 비교 기준은 배지 밖에 적습니다."],
        ["상태", "로딩 · 빈 · 오류 상태는 본문 자리만 바꾸고 머리는 남깁니다. 이미 그린 차트를 다시 불러올 때는 지난 그림을 흐리게 두고 다 오면 바꿉니다."],
      ],
      "마크": [
        ["선 · 점", "선은 2px 이고 끝과 꺾임이 둥급니다. 점은 포인터를 올렸을 때만 지름 8px 로 나타나고, 바탕색 링을 두릅니다. 곡선 장력은 0.3 입니다. 스파크는 마지막 점을 늘 보입니다."],
        ["막대", "막대는 두께가 최대 24px 이고 네 모서리 모두 각집니다. 누적 조각 사이와 나란한 막대 사이에는 2px 틈을 두고, 테두리로 가르지 않습니다."], ["영역 · 그라데이션", "계열이 하나인 선 차트는 아래 영역을 가장 높은 점에서 바닥으로 옅어지는 그라데이션으로 칠합니다. 여러 계열을 쌓은 영역은 계열 색을 옅은 단색으로 칠합니다. 막대 그라데이션은 강조용 옵션이고, 누적 막대에는 쓰지 않습니다."],
        ["격자 · 축", "격자는 값 축에만 1px 실선으로 긋습니다. 가로 막대면 격자도 세로입니다. 값 축의 숫자는 천 단위로 끊고, 축이 1만에 닿으면 축 전체를 만 단위로 줄여 씁니다. 값 축은 하나만 두고 이중 축은 쓰지 않습니다. 범례는 계열이 2개 이상일 때 원형 견본으로 아래에 둡니다."],
        ["툴팁", "툴팁은 값을 먼저 굵게 적고 계열 이름을 옅게 뒤에 둡니다. 계열은 짧은 선으로 표시합니다. 선과 영역 차트는 세로 기준선이 가장 가까운 날짜를 잡고, 막대는 막대 자체가 대상입니다."],
        ["접근성", "차트는 그림으로 읽히게 하고, 읽는 이름에 제목 · 요약 · 가장 중요한 값을 적습니다. 값을 하나하나 읽어야 하는 차트는 표로 보기를 켭니다. 진행 막대는 측정값으로 읽히게 합니다."],
      ],
    },
    props: [
      [".kpi", "div", "—", ".label + .value(small 단위) + .kpi-foot(.delta + .delta-note) · .sparkline 또는 .chart-canvas.spark. .critical/.high 로 값 색 · .compact 는 작은 KPI"],
      [".delta", "span", "—", "증감 배지(Tag sm 크기 · 틴트 + heavy 글자). 의미 <code>.bad</code> · <code>.good</code> · 클래스 없음 = 중립, 방향은 화살표 아이콘(arrow-up · arrow-down) + 숨긴 '증가' · '감소'(옛 <code>.up</code> · <code>.down</code> 은 없앴습니다). React <code>Kpi delta · deltaDir · deltaTone · note</code>"],
      ["variant / .flat", "\"outline\" | \"flat\"", "\"outline\"", ".kpi · .chart-card 의 보더 색을 지웁니다(두께 1px 는 남아 크기 같음). 주변에 배경색 <code>background/neutral/secondary</code> 이 있을 때만 — Card 의 flat 과 같은 규칙. React <code>variant</code>"],
      [".kpi-grid", "container", "—", "auto-fit 176(격자 안 KPI 좌우 패딩 20)"],
      [".chart-card", "container", "—", "차트를 담는 카드 — <code>.chart-head</code>(<code>h3.chart-title</code> + <code>.chart-sub</code> + <code>.chart-action</code>, 높이 32) · 선택 <code>.chart-figure</code>(<code>.value</code> + <code>.delta</code> + <code>.delta-note</code>) · 본문. React <code>ChartCard title · sub · action · figure · size · state</code>"],
      ["size / .sm · .lg", "\"sm\" | \"md\" | \"lg\"", "\"md\"", "본문 높이 160 · 240 · 320 — <code>.chart-canvas</code> · <code>.chart-table</code> · <code>.chart-state</code> 가 따릅니다"],
      [".chart-state", "div", "—", "로딩(카드 <code>aria-busy</code> + <code>.skeleton.rect</code>) · 빈(<code>.empty</code>) · 오류(<code>.empty.error</code> + 다시 시도 <code>data-retry</code> — 누르면 ds:retry). React <code>ChartCard state · onRetry</code>"],
      [".chart .row", "row", "—", ".lbl + .bar(i width%) + .num. 채움은 한 톤, 심각도 막대만 bar 톤 critical|high|medium|low|info"],
      [".progress-list", "container", "—", "<code>.progress-row</code>(윗줄 라벨 · <code>b</code> 값 · <code>.target</code> 목표, 아랫줄 <code>.progress[role=meter]</code>) 묶음. React <code>ProgressList items</code>"],
      [".donut", "div", "—", "조각 비율 = 누적 % <code>--d1 ~ --d5</code>, 경계마다 <code>&lt;i style=\"--a:각도\"&gt;</code> 2px 면 색 구분선(구분선 수 = 조각 수), data-label 중앙 값, role=img aria-label. 팔레트 기본 = 심각도 · <code>.mono</code> · <code>.categorical</code>. React <code>Donut</code> 은 tone 없는 조각이 4개 이하면 mono, 5개 이상이면 categorical(<code>color</code> 로 고정), tone · color 를 준 조각은 그대로"],
      [".donut-row", "div", "—", "도넛 + 범례 한 줄. 한 줄에 안 들어가면 범례가 도넛 아래로 내려갑니다(줄 사이 16)"],
      [".chart-legend", "div", "—", "i 견본(원형 10) + 라벨 + b 값. 견본 클래스 = 톤(critical · high · medium · low · info · ok · pending · brand) · <code>mono-1~4</code> · <code>series-1~6</code>"],
      [".sparkline", "div", "—", "i height% 막대(옅은 단계), .hi 강조(진한 단계). .kpi 의 자식이면 값 오른쪽(밑변 = 숫자 기준선), 좁으면 값 아래"],
      [".chart-view", "div", "—", "<code>.chart-canvas</code> 를 감싸는 틀. 표로 보기는 옵션이라 필요할 때만 <code>.chart-tools</code> 안에 버튼(<code>data-chart-table</code>)을 앞에 둡니다. React <code>ChartCanvas table</code>(기본 false). 문구는 <code>data-labels</code>(JSON — table · chart · head · value · empty), React <code>labels</code>"],
      ["canvas[data-chart] / ChartCanvas", "\"timeseries\" | \"bar\" | \"donut\" | \"mixed\" | \"gauge\" | \"spark\"", "—", "탐색형 차트(Chart.js) 자리 — <code>.chart-canvas</code> 안의 canvas(KPI 안 스파크는 <code>.kpi &gt; .chart-canvas.spark</code>). HTML 은 <code>data-spec</code>(JSON) 으로 <code>ds-chart.js</code> 가 자동으로 그리고, React 는 <code>chart</code>(Chart.js 생성자) · <code>config</code>(presets.*) · <code>aria-label</code>(필수) prop 입니다"],
      ["DSChart.presets.* / presets", "spec → config", "—", "공통 <code>color</code>(\"mono\" 기본 | \"categorical\") · <code>series[{label, data, tone?, slot?}]</code>(<code>slot</code> = 색 자리 고정 — mono 1~4 · categorical 1~6) · <code>labels</code>. timeseries <code>stacked</code> · <code>area</code>(계열 하나일 때 기본 true), bar <code>stacked</code> · <code>horizontal</code> · <code>highlight</code>(막대 번호) · <code>gradient</code>(true — 값 끝 → 바닥 55%, 누적이면 경고하고 단색), donut <code>{label, value, tone?}</code> · <code>center</code> · <code>legend</code>(\"bottom\" | \"right\"), mixed <code>bars</code> · <code>lines</code>, gauge <code>value</code> · <code>max</code>(100) · <code>label</code> · <code>caption</code>, spark <code>data</code> · <code>area</code>. tone 은 심각도 · 상태(critical · high · medium · low · info · ok · brand) · 한 톤 단계(mono-1~4) · 계열 1의 톤(series-1 · series-1-subtle · series-1-strong). 비교 기간(지난 주 · 전월)은 이제 한 톤의 mono-1 · mono-4 입니다 — series-1-subtle 은 이미 쓰는 화면을 위해 남긴 값이라 새로 쓰지 않습니다"],
      ["DSChart.theme · mount · auto / chartTheme · useDsChart · mountChart", "(el) → theme · (Chart, canvas, config) → handle", "—", "theme 은 <code>--chart-*</code> · 심각도 · 면 · 글꼴 토큰을 계산값으로 읽은 것(캔버스는 CSS 변수를 못 읽습니다). mount 는 Chart 를 만들고 라이트/다크 전환 때 다시 칠하며 handle(<code>update(config)</code> — 같은 종류면 지우지 않고 바꿔 칠함 · <code>repaint()</code> · <code>destroy()</code>)을 돌려줍니다. React <code>useDsChart</code> 는 config 가 바뀌면 update 를 씁니다. auto 는 <code>canvas[data-chart]</code> 를 모두 mount"],
    ],
    spec: [["Size", "KPI 값 Title 1 32 · 막대 12 · 진행 막대 8 · 도넛 120 · 차트 본문 sm 160 · 기본 240 · lg 320 · 스파크 40"], ["Container", "chart-card = Card 와 같은 Surface·radius/lg·1px 보더, padding 20 24 · gap 16 · 머리 높이 32 · flat 은 보더 색 없음(background/neutral/secondary 위 전용). KPI 는 padding 20 24 · 최소 폭 180, kpi-grid 안에서는 padding 20 · 칸 최소 176 · gap 16"], ["Label", "카드 제목 Body 1/Normal 16 SemiBold · 보조 글자 12 tertiary · KPI 라벨 12 Medium tertiary · 값 32 Bold · 증감 배지 Caption 2 11 SemiBold · 차트 축 · 범례 · 툴팁 글자 12 · 게이지 가운데 28 Bold + 설명 12"], ["Chart", "선 2 · 끝 · 꺾임 round · 점은 hover 때만 지름 8 + 면 색 링 2 · 스파크 끝 점 r 3 · 막대 두께 최대 24 · radius 0(정적 막대 · 진행 막대 · 스파크라인 채움도) · 누적 조각 · 묶음 막대 사이 2px 면 색 틈 · stroke 없음 · 영역 — 계열 하나는 가장 높은 점 32% → 바닥 6% 세로 그라데이션, 누적은 계열 색 10% · 막대 gradient 옵션 값 끝 100% → 바닥 55%(누적 제외) · 도넛 조각 사이 2px 면 색 경계 · 격자는 값 축에만 실선 1px · 값 축 눈금 ko-KR 천 단위, 1만 이상이면 만 단위 · crosshair 1px --line-neutral-primary(선 · 영역 · 혼합) · 툴팁 줄 = 값 600 + 계열 이름(글자색 72%) · 키 선 12 × 2 · 값 축 하나(이중 축 금지) · 범례는 2계열 이상, 원형 아이콘 · 옆 범례는 자리가 좁고 세로로 길면 아래로 · 게이지 반원 구멍 78%"], ["Color", "기본은 한 톤 --chart-mono-1~4(고정 파랑, 라이트 blue-40 · 50 · 60 · 70 / 다크 blue-80 · 70 · 60 · 45 — 제품색과 무관, 계열 수에 따라 1 · 1·4 · 1·2·4 · 1~4 단계) · 순서 없는 범주 5개 이상은 --chart-series-1~6 · 심각도 5단계는 negative-strong · cautionary · accent-light-blue · accent-lime · inactive 토큰 · 정적 막대 트랙 --surface-neutral-strong · 진행 막대 · 게이지 트랙 --chart-mono-track(= --surface-neutral-strong) · 격자 --chart-grid-primary · 축 글자 --chart-axis-text · 툴팁 --chart-tooltip-* · 증감 배지 = Tag 의 틴트 · heavy 쌍"], ["A11y", "canvas 는 role=img + aria-label(제목 · 요약) 필수 · 표로 보기 옵션 · 진행 막대 role=meter + aria-valuetext · 증감 방향은 숨긴 글자로"]],
    figma: { frame: "Data Visual", radius: "radius/lg", sizes: { kpi: { pad: 20 }, bar: { h: 12 }, donut: 120 }, variants: { kpi: {}, kpiSparkline: { layout: "라벨 한 줄 · 값 + 그래프 한 줄(밑변 = 숫자 기준선, 좁으면 그래프가 값 아래)" }, bar: {}, donut: { gap: "경계마다 2px 직선 --surface-elevated-primary(폭 일정)" }, sparkline: { bar: "--chart-mono-4", hi: "--chart-mono-1" } }, variant: { outline: { stroke: "--line-neutral-secondary" }, flat: { stroke: "transparent", canvas: "--background-neutral-secondary" } }, states: ["default", "loading", "empty", "error"],
      /* 탐색형 차트(Chart.js) — Figma 의 Chart 세트가 따르는 마크 규격과 색 */
      chart: { types: ["timeseries", "bar", "donut", "mixed", "gauge", "spark"], canvasH: 240, line: 2, point: 8, barRadius: 0, barStroke: 0, barMax: 24, gap: 2, legend: "circle", tooltipKey: "line", cutout: "67%", gridDash: [], area: 0.1, track: "--chart-mono-track", mono: ["--chart-mono-1", "--chart-mono-2", "--chart-mono-3", "--chart-mono-4"], series: ["--chart-series-1", "--chart-series-2", "--chart-series-3", "--chart-series-4", "--chart-series-5", "--chart-series-6"], grid: "--chart-grid-primary", axis: "--chart-axis-text", tooltip: { bg: "--chart-tooltip-surface", fg: "--chart-tooltip-text" }, tones: { critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary", medium: "--foreground-accent-light-blue", low: "--foreground-accent-lime", info: "--foreground-inactive-primary", "series-1": "--chart-series-1", "series-1-subtle": "--chart-series-1-subtle", "series-1-strong": "--chart-series-1-strong" } } },
  },

  /* ------------------------------------------------ Empty State (패턴에서 올림 2026-11-10) */
  "empty-state": {
    status: "ready", react: ["Empty"], css: [".empty"], borrows: [".btn", ".btn-group"],
    desc: "데이터가 없거나 검색 결과가 없을 때 이유와 다음 행동을 보여 줍니다.",
    choose: [
      ["언제 쓰는가", "처음 사용하거나 검색 결과가 없어서 보여 줄 데이터가 없을 때 씁니다. 데이터를 불러오지 못했다면 빈 화면 대신 오류 상태를 보여 줍니다."],
      ["Placement", "목록 · 표 · 패널의 내용 자리"],
    ],
    principles: [
      ["첫 사용", "무엇을 할 수 있는지와 그것으로 얻는 것을 한 문장으로 설명하고 시작 동작을 Solid Primary 로 둡니다."],
      ["검색 결과 없음", "찾은 조건을 보여 주고 초기화 · 완화를 제안합니다. 만들기 동작을 주 버튼으로 두지 않습니다."],
      ["정상 0건", "처리할 것이 없는 것이 좋은 결과라면 그렇게 알립니다. '미처리 경고가 없습니다' 처럼 쓰고 동작은 두지 않아도 됩니다."],
      ["권한 없음", "볼 권한이 없으면 빈 화면 대신 권한 안내를 둡니다. 누구에게 요청하는지 알리고, 요청할 수 있으면 그 버튼을 둡니다. 화면 전체를 막을 때는 <a href=\"#/patterns/error-pages\">오류 · 권한 없음</a> 패턴을 씁니다."],
      ["오류와 구분", "불러오지 못했으면 위험 톤의 <a href=\"#/components/notification\">Notification</a> 이나 카드의 오류 상태와 다시 시도를 씁니다. '없습니다' 로 보여 주지 않습니다."],
      ["구성", "제목은 필수입니다. 동작은 2개까지 두고, 그중 Solid Primary 는 하나만 씁니다. 첫 사용과 검색 결과 없음에는 동작을 하나 이상 둡니다."],
      ["좁은 자리", "카드 · 사이드 패널에서는 가로로 놓는 작은 모양을 씁니다. 표 안은 표의 빈 상태 칸을, 카드 본문은 <a href=\"#/components/card\">Card</a> 의 빈 상태를 따릅니다."],
    ],
    examples: [
      { id: "first", group: "default", title: "First Use", html: `
        <div class="empty" style="max-width:560px">
          <span class="ico">${I("shield")}</span>
          <b>아직 정책이 없습니다</b>
          <span>템플릿에서 시작하거나 새 정책을 만들어 에이전트에 배포하세요.</span>
          <div class="btn-group"><button type="button" class="btn md outline primary">템플릿 보기</button><button type="button" class="btn md solid primary">${I("plus")}정책 만들기</button></div>
        </div>` },
      { id: "nores", group: "variant", title: "No Results", html: `
        <div class="empty" style="max-width:560px">
          <span class="ico">${I("search")}</span>
          <b>'랜섬웨어 2025' 에 대한 결과가 없습니다</b>
          <span>검색어를 줄이거나 기간 필터(최근 24시간)를 넓혀 보세요.</span>
          <button type="button" class="btn md outline assistive">필터 초기화</button>
        </div>` },
      { id: "compact", group: "variant", title: "Compact", desc: "카드 · 사이드 패널처럼 좁은 자리에서는 아이콘 · 글자 · 버튼을 가로로 놓는 작은 모양을 씁니다.", html: `
        <div class="empty compact" style="max-width:480px"><span class="ico">${I("inbox")}</span><div><b>연결된 알림 채널이 없습니다</b><span>Slack 또는 이메일을 연결하세요.</span></div><button type="button" class="btn sm outline assistive">알림 채널 연결</button></div>` },
    ],
    props: [[".empty", "div", "—", "세로 가운데 정렬 · 점선 테두리"], [".ico", "span", "—", "아이콘 40 · 면 없음 · foreground/neutral/quaternary · 선 1.5(compact 32 · 카드 안 36)"], ["b", "제목", "—", "필수"], ["span", "설명", "—", "이유와 다음 행동"], [".compact", "boolean", "false", "가로형"], ["React actions", "ReactNode", "—", "Button 또는 ButtonGroup"]],
    spec: [["Size", "위아래 여백 48 · compact 24"], ["Container", "1px dashed line/neutral/primary · radius/lg · 카드 안은 테두리 · 면 없음"], ["Icon", "40 · compact 32 · 카드 안 36 — 면 없음 · foreground/neutral/quaternary · 선 1.5"], ["Title", "16 SemiBold · compact · 카드 안 14"]],
  },

  /* ------------------------------------------------ Form (2026-11-10) */
  "form": {
    status: "ready", react: ["Form","FormLegend","FormSection","FormRow","FormActions"], css: [".form", ".form-legend"], borrows: [".field", ".btn", ".notice"],
    desc: "입력 필드를 묶고 저장 동작을 놓는 틀입니다. 실제 화면 조합은 <a href=\"#/patterns/input-form\">입력 폼</a> 패턴을 봅니다.",
    choose: [
      ["언제 쓰는가", "필드 두 개 이상을 묶어 한 번에 저장할 때 씁니다. 입력이 여러 단계로 나뉘면 <a href=\"#/components/steps\">Steps</a> 의 단계마다 Form 을 하나씩 둡니다."],
      ["Placement", "페이지 본문 · Side Panel"],
    ],
    principles: [
      ["열", "한 열이 기본입니다. 시작 · 종료처럼 짝이 되는 짧은 필드만 한 줄에 2열로 둡니다."],
      ["필수", "필수 입력이 있으면 맨 위에 필수 항목 안내를 둡니다."],
      ["검증", "폼에 검증을 켜면 시스템이 처리합니다. 규칙은 <a href=\"#/foundations/interaction\">Interaction</a> › Input errors 입니다."],
      ["서버 오류", "폼 위에 오류를 모아 요약하지 않습니다. 서버가 돌려준 오류도 그 필드 아래에 적고, 필드에 붙일 수 없는 오류는 Toast 로 알립니다."],
      ["동작", "동작 버튼 줄은 폼 맨 아래에 두고, 주 버튼은 오른쪽 끝에 둡니다. 삭제는 왼쪽에 떼어 둡니다."],
      ["초안", "길게 입력하는 폼은 초안 저장을 켭니다. 입력을 이 브라우저에 남겨 두었다가 다시 열면 되살리고 폼 맨 위에 알립니다. 저장에 성공하면 지웁니다. 비밀번호와 인증 코드는 남기지 않습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "필수 항목 안내, 필드, 2열 줄, 동작 버튼을 차례로 둔 기본 폼입니다.", html: `
        <form class="form">
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label for="fm-name">정책 이름 <em>*</em></label><input id="fm-name" required><span class="help">2~40자</span></div>
          <div class="form-row">
            <div class="field"><label for="fm-from">시작 IP</label><input id="fm-from"></div>
            <div class="field"><label for="fm-to">종료 IP</label><input id="fm-to"></div>
          </div>
          <div class="form-actions"><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">저장</button></div></div>
        </form>` },
      { id: "sections", group: "variant", title: "Sections", desc: "필드가 많으면 구역으로 나눕니다.", html: `
        <form class="form">
          <div class="form-section">기본 정보</div>
          <div class="field"><label for="fs-name">정책 이름</label><input id="fs-name"></div>
          <div class="form-section">알림</div>
          <div class="field"><label for="fs-mail">알림 이메일</label><input id="fs-mail" type="email"></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "actions", group: "variant", title: "Delete", desc: "삭제 버튼은 왼쪽에 떼어 둡니다.", html: `
        <form class="form">
          <div class="field"><label for="fa-name">정책 이름</label><input id="fa-name" value="외부 USB 차단"></div>
          <div class="form-actions"><button type="button" class="btn md outline assistive left">삭제</button><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">저장</button></div></div>
        </form>` },
      { id: "error", group: "state", title: "Error", desc: "서버가 돌려준 오류도 그 필드 아래에 적습니다. 폼 위에 모아 요약하지 않습니다.", html: `
        <form class="form" novalidate>
          <div class="field error"><label for="fe-a">정책 이름</label><input id="fe-a" value="외부 USB" aria-invalid="true" aria-describedby="fe-ah"><span class="help" id="fe-ah">같은 이름의 정책이 있습니다. 다른 이름을 입력하세요.</span></div>
          <div class="field error"><label for="fe-b">허용 IP</label><input id="fe-b" value="10.0.0.1" aria-invalid="true" aria-describedby="fe-bh"><span class="help" id="fe-bh">다른 정책이 쓰는 주소입니다. 다른 주소를 입력하세요.</span></div>
          <div class="field error"><label for="fe-c">보관 기간</label><input id="fe-c" value="400" aria-invalid="true" aria-describedby="fe-ch"><span class="help" id="fe-ch">라이선스 한도를 넘었습니다. 365 이하로 입력하세요.</span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
    ],
    props: [["form.form", "form", "—", "카드 형태의 틀. 최대 폭 640"], ["data-validate", "attr", "—", "입력 검증을 켭니다. React <code>validate</code>"], ["data-draft=\"키\"", "attr", "—", "초안 저장 — 입력을 localStorage <code>jsds-draft:키</code> 에 0.5초 뒤 남기고, 다시 열면 되살려 맨 위에 Notice('버리기'). 제출이 통과하면 지움. 비밀번호 · 파일 · 일회용 코드 · 복사 필드 · <code>data-draft-skip</code> 안은 남기지 않음. 네이티브 입력만. React <code>useFormDraft(key)</code>"], [".form-legend", "p", "—", "필수 범례. React <code>FormLegend</code>"], [".form-section", "div", "—", "섹션 제목. React <code>FormSection</code>"], [".form-row", "div", "—", "2열. React <code>FormRow</code>"], [".form-actions", "div", "—", "하단 동작. 버튼은 .btn-group 안, .left 는 묶음 밖 왼쪽. React <code>FormActions</code>"], ["ds:validate", "event", "—", "제출을 검사한 뒤 form 에서 {valid, errors[{label, message}]}. React <code>onValidate</code>"]],
    spec: [["Size", "최대 폭 640 · 패딩 24 · 필드 간격 20"], ["Container", "surface/elevated/primary · 1px · radius/lg"], ["Section", "16 SemiBold"], ["Actions", "위 패딩 16 · 위 테두리 1px · 버튼은 .btn-group(md 8) · .left 는 묶음 밖 왼쪽"]],
  },

  /* ------------------------------------------------ Page Header (2026-11-10) */
  "page-header": {
    status: "ready", react: ["PageHead"], css: [".page-head"], borrows: [".btn", ".breadcrumb"],
    desc: "페이지 맨 위에서 이 화면이 무엇인지와 주요 동작을 보여 줍니다.",
    choose: [
      ["언제 쓰는가", "화면 맨 위에 하나만 둡니다. 대화상자나 패널 안의 제목은 각 컴포넌트의 헤더를 씁니다."],
      ["Placement", "페이지 본문 맨 위, 한 화면에 하나"],
    ],
    principles: [
      ["제목", "페이지 제목은 화면에 하나뿐인 최상위 제목이고 Title 2 스타일입니다. 메뉴 이름과 같게 씁니다."],
      ["Breadcrumb", "첫 칸에 넣습니다. 제목 바로 위 16px 입니다."],
      ["설명", "설명 줄에는 ID · 범위 · 갱신 시각처럼 짧은 정보를 한 줄로 둡니다."],
      ["동작", "3개까지입니다. 주 버튼은 하나이고 오른쪽 끝입니다. 나머지는 <a href=\"#/components/dropdown\">Dropdown</a> 으로 묶습니다."],
      ["긴 제목", "제목 칸에서 줄바꿈합니다. 동작은 오른쪽 위에 남습니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "제목과 설명, 동작으로 이루어집니다.", html: `
        <div class="page-head"><div><h2 class="title">정책</h2><p class="sub">전체 24개 · 최근 배포 09:41</p></div><div class="actions"><div class="btn-group"><button type="button" class="btn md outline assistive">CSV 내보내기</button><button type="button" class="btn md solid primary">정책 만들기</button></div></div></div>` },
      { id: "breadcrumb", group: "variant", title: "Breadcrumb", desc: "하위 페이지는 첫 칸에 Breadcrumb 를 넣습니다.", html: `
        <div class="page-head">
          <nav aria-label="현재 위치">
            <ol class="breadcrumb">
              <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
              <li><a href="#">정책</a></li>
              <li aria-current="page"><span>외부 USB 차단</span></li>
            </ol>
          </nav>
          <div><h2 class="title">외부 USB 차단</h2><p class="sub">POL-2041 · 전체 그룹</p></div><div class="actions"><button type="button" class="btn md solid primary">배포</button></div>
        </div>` },
      { id: "long", group: "variant", title: "Long Title", desc: "긴 제목은 줄바꿈하고 동작은 오른쪽 위에 남습니다.", html: `
        <div class="page-head" style="max-width:520px"><div><h2 class="title">외부 저장장치 차단 및 예외 승인 정책의 부서별 적용 현황</h2><p class="sub">POL-2041</p></div><div class="actions"><button type="button" class="btn md solid primary">저장</button></div></div>` },
    ],
    props: [[".page-head", "div", "—", "2열 격자. 줄 간격 · 열 간격 16"], ["nav", "Breadcrumb", "—", "첫 칸. React <code>breadcrumb</code>"], [".title", "h1", "—", "React <code>title</code> · 태그는 <code>as</code>(기본 h1)"], [".sub", "p", "—", "React <code>sub</code>"], [".actions", "div", "—", "동작 3개까지. React <code>actions</code>"]],
    spec: [["Size", "아래 내용과 16"], ["Title", "Title 2 28/38 Bold · 자간 -0.0236em"], ["Breadcrumb", "제목 위 · 아래 간격 16"], ["Description", "14 · foreground/neutral/secondary · 위 4"], ["Actions", "버튼 간격 8 · 오른쪽 위"]],
  },

  /* ------------------------------------------------ Avatar (문서화 2026-11-10) */
  "avatar": {
    status: "ready", react: ["Avatar", "AvatarGroup"], css: [".avatar", ".avatar-group", ".avatar-group-more"], borrows: [".t-label-1-reading", ".t-regular", ".btn"],
    desc: "사용자를 이니셜로 표시합니다. 사진은 지원하지 않습니다. 여러 사람은 Avatar Group 으로 겹쳐 놓고 넘친 수를 '외 N명' 으로 적습니다.",
    choose: [
      ["언제 쓰는가", "사용자를 이니셜로 나타낼 때 씁니다. 눌러서 여는 사용자 메뉴가 필요하면 <a href=\"#/components/top-navigation\">Top Navigation</a> 의 사용자 메뉴를 씁니다."],
      ["Placement", "Top Navigation 오른쪽 끝 · List 행 앞. Avatar Group 은 표의 담당자 칸 · 카드 헤더 · 상세 패널"],
    ],
    principles: [
      ["글자", "이니셜 1~2자로 씁니다."],
      ["크기", "목록 · 표 · 상단 바에는 기본이나 작은 크기를 씁니다. 큰 크기는 프로필처럼 한 사람을 보이는 자리에만 쓰고, Avatar Group 에는 쓰지 않습니다."],
      ["색", "모든 아바타는 같은 중립 회색 면과 글자를 씁니다. 사람은 이니셜과 이름으로 가르고, 상태나 역할을 아바타 색으로 알리지 않습니다."],
      ["이름", "옆에 이름이 보이면 아바타는 스크린 리더에서 숨깁니다. 혼자 있으면 이미지로 읽히게 하고 이름을 줍니다."],
      ["누를 때", "그 자체로는 버튼이 아닙니다. 사용자 메뉴는 <a href=\"#/components/top-navigation\">Top Navigation</a> 의 사용자 메뉴를 씁니다."],
      ["Group", "여러 사람은 Avatar Group 으로 겹쳐 놓습니다. 묶음에는 '담당자' 처럼 무엇의 사람들인지 알리는 이름을 주고, 아바타마다 이름을 줍니다."],
      ["Group 개수", "아바타는 5개까지 보이고 나머지는 뒤에 '외 N명' 으로 적습니다. 전체 목록을 열어야 하면 '외 N명' 을 글자 버튼으로 두고, 목록은 제품이 그립니다."],
    ],
    examples: [
      { id: "sizes", group: "size", title: "Size", desc: "기본 32px, 작은 크기 24px, 큰 크기 64px 세 가지입니다. 큰 크기는 설정 화면의 프로필처럼 한 사람을 크게 보일 때만 씁니다.", html: `
        <div style="display:flex;gap:12px;align-items:center"><span class="avatar lg" role="img" aria-label="김민준">김</span><span class="avatar" role="img" aria-label="김민준">김</span><span class="avatar sm" role="img" aria-label="김민준">김</span></div>` },
      { id: "name", group: "default", title: "With Name", desc: "이름이 옆에 있으면 아바타는 스크린 리더에서 숨깁니다.", html: `
        <div style="display:flex;gap:8px;align-items:center"><span class="avatar" aria-hidden="true">이</span><span class="t-label-1-reading t-regular">이서연</span></div>` },
      { id: "group", group: "variant", title: "Group", desc: "여러 사람을 겹쳐 놓습니다. 겹침은 8px 이고 작은 크기에서는 6px 입니다. 아바타마다 놓인 자리의 면 색으로 2px 링을 둘러 겹쳐도 경계가 보입니다.", html: `
        <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
          <span class="avatar-group" role="group" aria-label="담당자"><span class="avatar" role="img" aria-label="김민준">김</span><span class="avatar" role="img" aria-label="이서연">이</span><span class="avatar" role="img" aria-label="박지호">박</span></span>
          <span class="avatar-group" role="group" aria-label="검토자"><span class="avatar sm" role="img" aria-label="최유나">최</span><span class="avatar sm" role="img" aria-label="정하준">정</span><span class="avatar sm" role="img" aria-label="강서윤">강</span></span>
        </div>` },
      { id: "group-more", group: "variant", title: "Group Overflow", desc: "5명을 넘으면 앞 5명만 보이고 나머지는 '외 N명' 으로 적습니다.", html: `
        <span class="avatar-group" role="group" aria-label="담당자"><span class="avatar" role="img" aria-label="김민준">김</span><span class="avatar" role="img" aria-label="이서연">이</span><span class="avatar" role="img" aria-label="박지호">박</span><span class="avatar" role="img" aria-label="최유나">최</span><span class="avatar" role="img" aria-label="정하준">정</span><span class="avatar-group-more">외 3명</span></span>` },
      { id: "group-button", group: "variant", title: "Group With List", desc: "전체 목록을 열어야 하면 '외 N명' 을 글자 버튼으로 둡니다. 목록은 제품이 그립니다.", html: `
        <span class="avatar-group" role="group" aria-label="담당자"><span class="avatar" role="img" aria-label="김민준">김</span><span class="avatar" role="img" aria-label="이서연">이</span><span class="avatar" role="img" aria-label="박지호">박</span><span class="avatar" role="img" aria-label="최유나">최</span><span class="avatar" role="img" aria-label="정하준">정</span><button type="button" class="btn sm text assistive avatar-group-more" aria-label="담당자 외 3명 보기">외 3명</button></span>` },
    ],
    props: [[".avatar", "span", "—", "32. React <code>initials</code>"], ["role=\"img\" + aria-label", "string", "—", "혼자 있는 아바타의 이름. 옆에 이름이 보이면 대신 aria-hidden=\"true\""], [".sm", "boolean", "false", "24. React <code>size=\"sm\"</code>"], [".lg", "boolean", "false", "64 · 글자 Heading 2 20/28 Bold. 프로필 머리에만, Avatar Group 에는 쓰지 않는다. React <code>size=\"lg\"</code>"], [".avatar-group", "span", "—", "role=group + aria-label. 아바타 5개까지. React <code>AvatarGroup label</code> · <code>max</code>(기본 5) · <code>size</code>"], [".avatar-group-more", "span | button", "—", "'외 N명'. 목록을 열면 <code>.btn.sm.text.assistive</code> 버튼. React <code>AvatarGroup onMore</code> 를 주면 버튼"]],
    spec: [["Size", "32 · sm 24 · lg 64"], ["Container", "surface/neutral/secondary · radius/full"], ["Label", "12 Bold · sm 11 Bold · lg Heading 2 20/28 Bold · foreground/neutral/secondary"], ["Group", "겹침 8 · sm 6 · 링 2px 놓인 자리의 면(바탕 background/neutral/primary, 카드 · 패널 · 팝업 안 surface/elevated/primary) · 5개까지"], ["More", "'외 N명' Label 1/Normal 14/20 Medium · foreground/neutral/secondary · 앞 간격 8(버튼이면 4)"]],
  },

  /* ------------------------------------------------ Link (2026-11-10) */
  "link": {
    status: "ready", react: ["Link"], css: [".link", ".sr-only"], borrows: [".t-label-1-reading", ".t-regular"],
    desc: "다른 페이지로 옮겨 갑니다. 같은 화면에서 일을 실행하면 <a href=\"#/components/button\">Button</a> 입니다.",
    choose: [
      ["언제 쓰는가", "주소가 바뀌면 Link 를, 그 자리에서 실행하면 Button 을 씁니다. 링크에는 반드시 갈 주소가 있어야 합니다."],
      ["Placement", "문장 안 · 표 · 목록 행"],
    ],
    principles: [
      ["밑줄", "문장 안 링크는 늘 밑줄입니다. 색만으로 구분하지 않습니다. 표 · 목록처럼 그 줄 자체가 링크인 자리는 단독 링크 모양을 쓰고, 마우스를 올렸을 때만 밑줄을 긋습니다."],
      ["라벨", "도착할 곳의 이름을 씁니다. '자세히' · '여기' 처럼 어디로 가는지 알 수 없는 말은 쓰지 않습니다."],
      ["새 창", "되도록 같은 창에서 엽니다. 새 창으로 열면 아이콘을 두고, 스크린 리더만 읽는 '(새 창)' 문구를 숨겨 둡니다."],
      ["비활성", "링크는 비활성으로 두지 않습니다. 갈 곳이 없으면 글자로 둡니다."],
    ],
    examples: [
      { id: "inline", group: "default", title: "Inline", desc: "문장 안 링크는 늘 밑줄입니다.", html: `
        <p class="t-label-1-reading t-regular" style="margin:0">에이전트가 오프라인이면 <a href="#" class="link">배포 상태</a> 에서 다시 배포하세요.</p>` },
      { id: "standalone", group: "variant", title: "Standalone", desc: "그 줄 자체가 링크인 자리에 씁니다. 평소에는 밑줄 없이 Medium 굵기입니다. 표 안의 링크도 같은 모양이지만, 글자는 제품 색이 아니라 칸의 글자색을 따릅니다.", html: `
        <div class="t-label-1-reading t-regular" style="display:flex;flex-direction:column;gap:8px;align-items:flex-start"><a href="#" class="link standalone">랜섬웨어 행위 탐지</a><a href="#" class="link standalone">미승인 USB 연결</a></div>` },
      { id: "external", group: "variant", title: "New Window", desc: "새 창이면 아이콘과 숨긴 문구를 둡니다.", html: `
        <p class="t-label-1-reading t-regular" style="margin:0"><a href="#" class="link" target="_blank" rel="noopener noreferrer">제품 문서${I("external-link",14)}<span class="sr-only"> (새 창)</span></a> 에서 설치 방법을 확인하세요.</p>` },
    ],
    props: [["a.link", "a", "—", "<code>href</code> 필수"], [".standalone", "boolean", "false", "밑줄은 hover 때만, 500. React <code>standalone</code>"], ["target=_blank", "attr", "—", "아이콘 + sr-only + <code>rel</code>. React <code>external</code>"], ["React as", "ElementType", "a", "라우터 링크"]],
    spec: [["Label", "주변 글자 크기 · foreground/brand/primary(표 칸 안은 칸 글자색)"], ["Underline", "위치 2 · hover 두께 2"], ["Icon", "14"]],
  },
  /* ------------------------------------------------ File Upload (2026-11-10) */
  "file-upload": {
    status: "ready", react: ["FileUpload"], css: [".upload", ".upload-zone", ".upload-list", ".upload-item"], borrows: [".field", ".btn", ".progress", ".sr-only", ".form", ".form-legend", ".form-actions"],
    desc: "파일을 고르거나 끌어다 놓아 올립니다. 형식 · 용량 검사와 진행 표시까지 시스템이 맡고, 실제 전송은 제품이 합니다.",
    choose: [
      ["언제 쓰는가", "인증서나 가져올 데이터처럼 파일을 받아 서버로 보낼 때 씁니다. 키나 토큰처럼 붙여 넣는 값은 <a href=\"#/components/text-field\">Text Field</a> 로 받습니다."],
      ["Placement", "폼의 필드 자리 · 가져오기 대화상자"],
    ],
    principles: [
      ["안내", "받는 형식과 용량을 도움말에 미리 적습니다."],
      ["거절", "형식 · 용량 · 개수가 맞지 않으면 목록에 이름과 이유를 남깁니다. 통과한 파일은 그대로 받습니다."],
      ["전송 실패", "다시 시도와 지우기를 둡니다. 거절된 파일은 다시 보내도 같으므로 지우기만 둡니다."],
      ["하나만 받을 때", "새 파일을 고르면 바로 교체합니다."],
      ["전송 중 지우기", "전송 중인 줄에도 지우기를 둡니다. 지우거나 교체하면 파일이 빠졌다는 이벤트가 나가고, 제품이 그 전송을 멈춥니다."],
      ["폼", "전송 중이거나 오류가 있으면 제출을 막고 그 필드로 옮깁니다. 저장 버튼은 켜 둡니다."],
      ["모양", "기본은 드롭 영역입니다. 파일 하나를 받는 좁은 폼 칸에는 버튼형을 씁니다. 버튼형도 드롭은 받습니다."],
      ["보안", "화면의 형식 검사는 안내입니다. 서버에서 다시 검사합니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "파일 하나를 받습니다. 영역을 누르거나 끌어다 놓습니다. 이 예제의 전송은 흉내입니다.", html: `
        <div class="field" style="width:100%;max-width:480px">
          <label id="fu1-l">인증서</label>
          <div class="upload" data-demo data-max-size="5MB">
            <div class="upload-zone">
            <span class="ico">${I("upload",24)}</span>
            <span class="upload-msg">파일을 끌어다 놓거나</span>
            <button type="button" id="fu1-p" class="btn sm outline assistive upload-pick" aria-labelledby="fu1-l fu1-p">파일 선택</button>
              <input type="file" hidden accept=".pem,.crt">
            </div>
            <span class="sr-only upload-status" role="status"></span>
          </div>
          <span class="help">PEM · CRT, 5MB 이하</span>
        </div>` },
      { id: "compact", group: "variant", title: "Compact", desc: "좁은 폼 칸에는 버튼형을 씁니다. 끌어다 놓기도 받습니다.", html: `
        <div class="field" style="width:100%;max-width:480px">
          <label id="fu2-l">서명 파일</label>
          <div class="upload compact" data-demo data-max-size="1MB">
            <div class="upload-zone">
              <button type="button" id="fu2-p" class="btn sm outline assistive upload-pick" aria-labelledby="fu2-l fu2-p">파일 선택</button>
              <input type="file" hidden accept=".sig">
            </div>
            <span class="sr-only upload-status" role="status"></span>
          </div>
          <span class="help">SIG, 1MB 이하</span>
        </div>` },
      { id: "multiple", group: "variant", title: "Multiple", desc: "여러 개를 받습니다. 첫 전송이 실패하는 흉내입니다. 다시 시도하면 끝납니다.", html: `
        <div class="field" style="width:100%;max-width:480px">
          <label id="fu3-l">예외 목록</label>
          <div class="upload" data-demo data-demo-fail data-max-size="10MB" data-max-files="5">
            <div class="upload-zone">
            <span class="ico">${I("upload",24)}</span>
            <span class="upload-msg">파일을 끌어다 놓거나</span>
            <button type="button" id="fu3-p" class="btn sm outline assistive upload-pick" aria-labelledby="fu3-l fu3-p">파일 선택</button>
              <input type="file" hidden accept=".csv,.txt" multiple>
            </div>
            <span class="sr-only upload-status" role="status"></span>
          </div>
          <span class="help">CSV · TXT, 10MB 이하, 5개까지</span>
        </div>` },
      { id: "states", group: "state", title: "States", desc: "대기 · 전송 중 · 완료 · 전송 실패 · 거절의 다섯 상태입니다.", html: `
        <div class="field" style="width:100%;max-width:480px">
          <label id="fu4-l">로그 가져오기</label>
          <div class="upload" data-max-size="10MB">
            <div class="upload-zone">
            <span class="ico">${I("upload",24)}</span>
            <span class="upload-msg">파일을 끌어다 놓거나</span>
            <button type="button" id="fu4-p" class="btn sm outline assistive upload-pick" aria-labelledby="fu4-l fu4-p">파일 선택</button>
              <input type="file" hidden multiple>
            </div>
            <span class="sr-only upload-status" role="status"></span>
            <ul class="upload-list" aria-label="첨부 파일">
            <li class="upload-item" data-id="s1">
              <span class="ico">${I("file",20)}</span>
              <div class="body"><div class="row"><span class="name">agent-2026-11.log</span><span class="size">820 KB</span></div></div>
              <button type="button" class="btn sm text assistive icon-only remove" aria-label="agent-2026-11.log 지우기">${I("x",16)}</button>
            </li>
            <li class="upload-item uploading" data-id="s2">
              <span class="ico">${I("file",20)}</span>
              <div class="body"><div class="row"><span class="name">server-audit.log</span><span class="size">4.2 MB</span></div><div class="progress sm" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60" aria-label="server-audit.log 전송"><i style="width:60%"></i></div></div>
              <button type="button" class="btn sm text assistive icon-only remove" aria-label="server-audit.log 지우기">${I("x",16)}</button>
            </li>
            <li class="upload-item done" data-id="s3">
              <span class="ico">${I("circle-check",20)}</span>
              <div class="body"><div class="row"><span class="name">firewall.log</span><span class="size">1.1 MB</span><span class="sr-only"> (완료)</span></div></div>
              <button type="button" class="btn sm text assistive icon-only remove" aria-label="firewall.log 지우기">${I("x",16)}</button>
            </li>
            <li class="upload-item error" data-id="s4">
              <span class="ico">${I("alert-circle",20)}</span>
              <div class="body"><div class="row"><span class="name">gateway.log</span><span class="size">2.4 MB</span></div><span class="msg">전송하지 못했습니다. 다시 시도하세요.</span></div>
              <div class="btn-group"><button type="button" class="btn sm text assistive icon-only retry" aria-label="gateway.log 다시 시도">${I("refresh",16)}</button>
              <button type="button" class="btn sm text assistive icon-only remove" aria-label="gateway.log 지우기">${I("x",16)}</button></div>
            </li>
            <li class="upload-item error" data-id="s5" data-rejected>
              <span class="ico">${I("alert-circle",20)}</span>
              <div class="body"><div class="row"><span class="name">dump.bin</span><span class="size">48 MB</span></div><span class="msg">파일이 너무 큽니다. 10MB 이하 파일을 고르세요.</span></div>
              <button type="button" class="btn sm text assistive icon-only remove" aria-label="dump.bin 지우기">${I("x",16)}</button>
            </li>
            </ul>
          </div>
          <span class="help">10MB 이하</span>
        </div>` },
      { id: "form", group: "variant", title: "In Form", desc: "빈 채로 저장하면 막고 알립니다. 전송 중 · 오류일 때도 막습니다.", html: `
        <form class="form" data-validate novalidate><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field">
            <label id="fu5-l">인증서 <em>*</em></label>
            <div class="upload" data-demo data-required data-max-size="5MB">
              <div class="upload-zone">
            <span class="ico">${I("upload",24)}</span>
            <span class="upload-msg">파일을 끌어다 놓거나</span>
            <button type="button" id="fu5-p" class="btn sm outline assistive upload-pick" aria-labelledby="fu5-l fu5-p">파일 선택</button>
                <input type="file" hidden accept=".pem,.crt">
              </div>
              <span class="sr-only upload-status" role="status"></span>
            </div>
            <span class="help" aria-live="polite">PEM · CRT, 5MB 이하</span>
          </div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "disabled", group: "state", title: "Disabled", desc: "받을 수 없는 동안에는 영역과 버튼을 함께 끕니다.", html: `
        <div class="field" style="width:100%;max-width:480px">
          <label id="fu6-l">인증서</label>
          <div class="upload disabled" data-max-size="5MB">
            <div class="upload-zone">
            <span class="ico">${I("upload",24)}</span>
            <span class="upload-msg">파일을 끌어다 놓거나</span>
            <button type="button" id="fu6-p" class="btn sm outline assistive upload-pick" aria-labelledby="fu6-l fu6-p" disabled>파일 선택</button>
              <input type="file" hidden disabled>
            </div>
            <span class="sr-only upload-status" role="status"></span>
          </div>
          <span class="help">라이선스를 등록한 뒤 올릴 수 있습니다</span>
        </div>` },
    ],
    props: [[".upload", "div", "—", "React <code>FileUpload</code>"], ["input[type=file]", "accept · multiple", "—", "받는 형식과 여러 개. React <code>accept</code> · <code>multiple</code>"], ["data-max-size", "attr", "—", "예: 5MB. React <code>maxSize</code>(바이트)"], ["data-max-files", "attr", "—", "여러 개일 때 상한. React <code>maxFiles</code>"], ["data-required", "attr", "—", "폼 검증에 낍니다. React <code>required</code>"], [".compact", "boolean", "false", "버튼형"], [".upload-item", "li", "—", ".uploading · .done · .error, 거절은 data-rejected"], ["ds:upload", "event", "—", "<code>detail.files</code> = [{id, file}]. 전송은 제품이. React <code>onAdd</code>"], ["DS.upload", "API", "—", "<code>progress(el, id, n)</code> · <code>done(el, id)</code> · <code>fail(el, id, 문구)</code>. React 는 <code>items</code> 의 status · progress · error"], ["ds:upload-retry · ds:upload-remove", "event", "—", "<code>detail.id</code> · <code>detail.file</code>. 지우기는 교체될 때도 납니다 — 전송 중이면 제품이 그 전송을 멈춥니다. 거절된 줄을 지울 때는 나지 않습니다. React <code>onRetry</code> · <code>onRemove</code>"], ["data-messages · data-labels", "JSON", "—", "문구 바꾸기. React <code>messages</code> · <code>labels</code>"]],
    spec: [["Size", "영역 패딩 24 · 목록 간격 4 · 줄 패딩 8/12"], ["Container", "1px dashed line/neutral/primary · radius/lg"], ["Icon", "영역 24 · 줄 20"], ["Label", "14 · 크기와 오류 문구 12"]],
  },
  /* ------------------------------------------------ Code · Copy Field (2026-11-10) */
  "code": {
    status: "ready", react: ["CodeBlock", "InlineCode"], css: [".code-view", ".code-inline"], borrows: [".btn", ".t-label-1-reading", ".t-regular"],
    desc: "명령 · 설정 · 로그 원문을 고정폭 글자로 보여 줍니다. 여러 줄은 복사 버튼이 있는 블록, 문장 안의 값은 인라인입니다.",
    choose: [
      ["언제 쓰는가", "명령이나 설정처럼 그대로 옮겨 쓰는 글자와, 고치면 안 되는 로그 원문에 씁니다. 값 하나를 옮겨 쓰는 자리는 Copy Field 입니다."],
      ["Placement", "설치 안내 · 설정 화면 · 로그 상세"],
    ],
    principles: [
      ["강조", "구문 강조는 하지 않습니다."],
      ["긴 줄", "명령과 설정은 가로로 스크롤합니다. 줄을 끊으면 뜻이 바뀌기 때문입니다. 긴 한 줄 로그는 줄바꿈 모양으로 줄을 나눕니다."],
      ["긴 내용", "높이를 정해 안에서 스크롤합니다."],
      ["복사", "블록에는 복사 버튼을 둡니다. 결과는 버튼 자리에서 2초 동안 보이고 스크린 리더에도 읽힙니다. Toast 를 띄우지 않습니다."],
      ["키보드", "넘친 내용은 키보드로 스크롤합니다. 코드 영역은 포커스를 받고, 제목과 같은 이름으로 읽힙니다."],
      ["민감한 값", "API 키 · 토큰은 Code 에 넣지 않습니다. 가릴 수 있는 Copy Field 를 씁니다."],
    ],
    examples: [
      { id: "block", group: "default", title: "Block", desc: "제목과 복사 버튼이 있는 블록입니다. 긴 줄은 가로로 스크롤합니다.", html: `
        <div class="code-view">
          <div class="head"><span class="title">에이전트 설치</span>${copyBtn("에이전트 설치")}</div>
          <pre tabindex="0" aria-label="에이전트 설치"><code>curl -fsSL https://agent.example.com/install.sh -o install.sh
sudo sh install.sh --group default
sudo systemctl enable --now js-agent</code></pre>
        </div>` },
      { id: "wrap", group: "variant", title: "Wrap", desc: "긴 한 줄 로그는 줄바꿈 모양으로 줄을 나눕니다.", html: `
        <div class="code-view wrap">
          <div class="head"><span class="title">원본 로그</span>${copyBtn("원본 로그")}</div>
          <pre tabindex="0" aria-label="원본 로그"><code>2026-11-10T09:14:22+09:00 gw-01 kernel: [UFW BLOCK] IN=eth0 OUT= MAC=52:54:00:12:34:56 SRC=203.0.113.24 DST=198.51.100.7 LEN=60 TOS=0x00 PREC=0x00 TTL=52 ID=41021 DF PROTO=TCP SPT=51544 DPT=22 WINDOW=64240 RES=0x00 SYN URGP=0</code></pre>
        </div>` },
      { id: "height", group: "variant", title: "Max Height", desc: "긴 내용은 높이를 정해 안에서 스크롤합니다. 포커스를 준 뒤 화살표 키로도 움직입니다.", html: `
        <div class="code-view">
          <div class="head"><span class="title">차단 로그</span>${copyBtn("차단 로그")}</div>
          <pre tabindex="0" aria-label="차단 로그" style="max-height:200px"><code>2026-11-10T09:14:10 gw-01 ips: rule=2041 action=block src=203.0.113.20 dst=198.51.100.7 port=22
2026-11-10T09:14:13 gw-01 ips: rule=2041 action=block src=203.0.113.21 dst=198.51.100.7 port=443
2026-11-10T09:14:16 gw-01 ips: rule=2041 action=block src=203.0.113.22 dst=198.51.100.7 port=22
2026-11-10T09:14:19 gw-01 ips: rule=2041 action=block src=203.0.113.23 dst=198.51.100.7 port=443
2026-11-10T09:14:22 gw-01 ips: rule=2041 action=block src=203.0.113.24 dst=198.51.100.7 port=22
2026-11-10T09:14:25 gw-01 ips: rule=2041 action=block src=203.0.113.25 dst=198.51.100.7 port=443
2026-11-10T09:14:28 gw-01 ips: rule=2041 action=block src=203.0.113.26 dst=198.51.100.7 port=22
2026-11-10T09:14:31 gw-01 ips: rule=2041 action=block src=203.0.113.27 dst=198.51.100.7 port=443
2026-11-10T09:14:34 gw-01 ips: rule=2041 action=block src=203.0.113.28 dst=198.51.100.7 port=22
2026-11-10T09:14:37 gw-01 ips: rule=2041 action=block src=203.0.113.29 dst=198.51.100.7 port=443
2026-11-10T09:14:40 gw-01 ips: rule=2041 action=block src=203.0.113.30 dst=198.51.100.7 port=22
2026-11-10T09:14:43 gw-01 ips: rule=2041 action=block src=203.0.113.31 dst=198.51.100.7 port=443</code></pre>
        </div>` },
      { id: "inline", group: "variant", title: "Inline", desc: "문장 안의 경로 · 명령은 인라인 코드로 씁니다.", html: `
        <p class="t-label-1-reading t-regular" style="margin:0">설정 파일은 <code class="code-inline">/etc/js-agent/agent.conf</code> 에 있습니다. 바꾼 뒤 <code class="code-inline">systemctl restart js-agent</code> 를 실행하세요.</p>` },
    ],
    props: [[".code-view", "div", "—", "React <code>CodeBlock</code>. <code>title</code> 필수"], [".wrap", "boolean", "false", "줄바꿈. React <code>wrap</code>"], ["pre", "tabindex · aria-label", "—", "키보드 스크롤과 이름. React 는 자동"], ["max-height", "style", "—", "pre 에. React <code>maxHeight</code>"], [".code-inline", "code", "—", "문장 안의 값. React <code>InlineCode</code>"], ["ds:copy", "event", "—", "<code>detail.ok</code>. 값은 싣지 않습니다. React <code>onCopy(ok)</code>"], ["data-labels", "JSON", "—", "복사 결과 문구. React <code>labels</code>"]],
    spec: [["Header", "패딩 4/8/4/16 · 아래 선 line/neutral/secondary"], ["Body", "패딩 12/16 · 12/20 고정폭"], ["Container", "1px line/neutral/secondary · radius/lg"], ["Inline", "0.9em 고정폭 · 면 surface/neutral/strong · 반경 4"]],
  },
  "copy-field": {
    status: "ready", react: ["CopyField"], css: [".copy-field"], borrows: [".field", ".affix", ".reveal", ".btn", ".help", ".t-label-1-normal", ".t-semibold"],
    desc: "해시 · IP · API 키처럼 옮겨 쓰는 값을 읽기 전용으로 보여 주고 복사 버튼을 둡니다. 민감한 값은 가립니다.",
    choose: [
      ["언제 쓰는가", "값을 다른 곳으로 옮겨 쓰는 자리에 씁니다. 사용자가 고치는 값은 Text Field 로, 여러 줄은 Code 로 보여 줍니다."],
      ["Placement", "폼의 값 자리 · 표 칸 · 키-값 목록"],
    ],
    principles: [
      ["민감한 값", "API 키 · 토큰은 기본으로 가리고 보기 버튼을 둡니다."],
      ["복사", "가린 채로도 전체 값을 복사합니다. 복사해도 가림은 풀리지 않습니다."],
      ["결과 알림", "버튼 자리에서 2초 동안 보이고 스크린 리더에도 읽힙니다. Toast 를 띄우지 않습니다."],
      ["버튼 이름", "보기와 복사 버튼 이름에 값의 이름을 넣습니다."],
      ["표 안", "표 · 키-값 목록에서는 인라인 모양을 씁니다. 가리는 기능이 없어 민감한 값에는 쓰지 않습니다."],
      ["보안", "가려도 값은 브라우저에 있습니다. 한 번만 보여 줄 키는 화면에 내려보낼지 제품이 정합니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "읽기 전용 값과 복사 버튼입니다.", html: `
        <div class="field copy-field" style="width:100%;max-width:480px"><label for="cf1">SHA-256</label><div class="affix"><input id="cf1" readonly autocomplete="off" value="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08">${copyBtn("SHA-256")}</div></div>` },
      { id: "secret", group: "variant", title: "Secret", desc: "민감한 값은 가리고 보기 버튼을 둡니다. 가린 채로 복사해도 전체 값이 복사됩니다.", html: `
        <div class="field copy-field" style="width:100%;max-width:480px"><label for="cf2">API 키</label><div class="affix"><input id="cf2" type="password" readonly autocomplete="off" value="jsk_demo_4f7a91c2e8b3d605"><button type="button" class="reveal" aria-label="API 키 보기" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button>${copyBtn("API 키")}</div><span class="help">외부에 공유하지 마세요</span></div>` },
      { id: "inline", group: "variant", title: "Inline", desc: "표 · 키-값 목록의 값은 인라인 모양으로 둡니다. 민감한 값에는 쓰지 않습니다.", html: `
        <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;align-items:center">
          <span class="t-label-1-normal t-semibold">에이전트 IP</span><span class="copy-field inline"><span class="value">203.0.113.24</span>${copyBtn("에이전트 IP", true)}</span>
          <span class="t-label-1-normal t-semibold">파일 해시</span><span class="copy-field inline"><span class="value">9f86d081884c7d65</span>${copyBtn("파일 해시", true)}</span>
        </div>` },
    ],
    props: [[".copy-field", "class", "—", "React <code>CopyField</code>. <code>.field</code> 와 함께"], ["input", "readonly · value", "—", "React <code>value</code> · <code>label</code>"], ["type=password", "attr", "text", "가리기. <code>.reveal</code> 필수. React <code>secret</code>"], [".inline", "boolean", "false", "표 · 키-값 목록. React <code>inline</code>"], ["ds:copy", "event", "—", "<code>detail.ok</code>. 값은 싣지 않습니다. React <code>onCopy(ok)</code>"], ["ds:reveal", "event", "—", "<code>detail.shown</code>. 감사 로그용. React <code>onReveal(shown)</code>"], ["data-labels", "JSON", "—", "복사 결과 문구. React <code>labels</code>"]],
    spec: [["Size", "Text Field 와 같음 · 높이 40"], ["Value", "본문 글자 · 숫자 tabular · 읽기 전용 면 background/neutral/secondary"], ["Actions", "보기 28 · 복사 Button sm · Inline 복사 24"]],
  },
  /* ------------------------------------------------ Number Input (2026-11-10) */
  "number-input": {
    status: "ready", react: ["NumberInput"], css: [".number-field", ".num-btn"], borrows: [".field", ".affix", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "임계치 · 세션 시간처럼 정확한 수를 입력합니다. 입력칸 안에 단위와 증감 버튼이 있고 위 · 아래 화살표로도 바꿉니다.",
    choose: [
      ["언제 쓰는가", "크기를 비교하거나 더하는 수에 씁니다. 사번이나 포트 목록, 전화번호처럼 이름에 가까운 숫자는 Text Field 로 받고, 대략의 값을 빠르게 정하는 자리는 Slider 를 씁니다."],
      ["Placement", "폼의 값 자리 · 정책 임계치"],
    ],
    principles: [
      ["범위 안내", "받을 수 있는 범위를 도움말에 미리 적습니다."],
      ["범위 밖", "입력을 막거나 값을 몰래 고치지 않습니다. 입력을 받고 떠날 때 오류로 알립니다. 폼에서는 저장을 막습니다."],
      ["단위", "입력칸 안쪽 뒤에 둡니다. 스크린 리더도 값과 함께 읽습니다."],
      ["증감", "버튼과 위 · 아래 화살표는 정한 간격만큼 움직이고 범위 끝에서 멈춥니다. 끝에 닿은 쪽 버튼은 꺼집니다."],
      ["키보드", "증감 버튼은 Tab 에서 뺍니다. 화살표 키가 같은 일을 합니다."],
      ["표준 입력", "브라우저의 표준 숫자 입력 위에 만듭니다. 숫자 입력은 전부 이 컴포넌트를 씁니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "단위 · 범위가 있는 기본 입력입니다. 범위 밖 값은 떠날 때 오류로 알립니다.", html: `
        <div class="field number-field" style="width:280px"><label for="n1">세션 만료</label><div class="affix"><input id="n1" type="number" value="30" min="5" max="1440" aria-valuetext="30분"><span>분</span>${numBtns("세션 만료")}</div><span class="help">5분부터 1440분까지 입력할 수 있습니다.</span></div>` },
      { id: "step", group: "variant", title: "Step", desc: "정한 간격만큼 움직입니다. 소수 간격도 됩니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:16px">
          <div class="field number-field" style="width:240px"><label for="n2">재시도 간격</label><div class="affix"><input id="n2" type="number" value="10" min="0" max="60" step="5" aria-valuetext="10초"><span>초</span>${numBtns("재시도 간격")}</div><span class="help">0~60초, 5초 단위</span></div>
          <div class="field number-field" style="width:240px"><label for="n3">CPU 임계치</label><div class="affix"><input id="n3" type="number" value="80" min="0" max="100" step="0.5" aria-valuetext="80%"><span>%</span>${numBtns("CPU 임계치")}</div><span class="help">0~100%, 0.5 단위</span></div>
        </div>` },
      { id: "error", group: "state", title: "Error", desc: "범위를 벗어난 값을 그대로 두고 알립니다.", html: `
        <div class="field number-field error" style="width:280px"><label for="n4">보관 기간</label><div class="affix"><input id="n4" type="number" value="500" min="1" max="365" aria-invalid="true" aria-describedby="n4h" aria-valuetext="500일"><span>일</span>${numBtns("보관 기간", false, true)}</div><span class="help" id="n4h">값이 너무 큽니다. 365 이하 입력하세요.</span></div>` },
      { id: "form", group: "variant", title: "In Form", desc: "빈 값 · 범위 밖 값은 저장할 때 막습니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field number-field"><label for="n5">동시 접속 수 <em>*</em></label><div class="affix"><input id="n5" type="number" required min="1" max="500"><span>명</span>${numBtns("동시 접속 수")}</div><span class="help" aria-live="polite">1~500명</span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "disabled", group: "state", title: "Disabled", desc: "입력과 버튼이 함께 꺼집니다.", html: `
        <div class="field number-field" style="width:280px"><label for="n6">세션 만료</label><div class="affix"><input id="n6" type="number" value="30" min="5" max="1440" disabled aria-valuetext="30분"><span>분</span>${numBtns("세션 만료", true, true)}</div><span class="help">관리자만 바꿀 수 있습니다</span></div>` },
    ],
    props: [[".number-field", "class", "—", ".field 와 함께. React <code>NumberInput</code>"], ["min · max · step", "attr", "—", "범위와 간격. <code>step=any</code> 는 쓰지 않습니다"], ["단위", "span", "—", "입력 뒤 <code>span</code>. React <code>unit</code>"], [".num-btn.down · .up", "button", "—", "tabindex=-1, 이름에 값의 이름. React 는 자동(문구는 <code>labels</code>)"], ["input · change", "event", "—", "버튼 · 화살표로 바꿔도 표준 이벤트가 납니다. React <code>onChange</code>"], ["data-messages", "JSON", "—", "오류 문구. React <code>messages</code>"]],
    spec: [["Size", "Text Field 와 같음 · sm 32 · md 40 · lg 48"], ["Stepper", "28 × 28 · 아이콘 16 · 사이 2"], ["Unit", "12 · foreground/neutral/tertiary"]],
  },
  "time-picker": {
    status: "ready", react: ["TimePicker"], css: [".timepicker", ".tp-btn", ".time-panel", ".time-col", ".time-opt"], borrows: [".field", ".affix", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "백업 시각이나 점검 시작 시각처럼 날짜 없이 하루 안의 시각을 입력합니다. 직접 치거나 시 · 분 열에서 고르면 바로 값이 됩니다.",
    choose: [
      ["언제 쓰는가", "날짜와 상관없이 하루 안의 시각만 받을 때 씁니다. 매일 도는 백업 시각, 점검 시작 시각, 업무 시간대의 시작과 끝 같은 값입니다."],
      ["비슷한 것", "날짜와 시각을 함께 받는 값은 Date Picker 의 시각 옵션을 씁니다. 그 달력 아래 시각 칸도 이 Time Picker 입니다. 몇 분이나 몇 초 같은 길이는 시각이 아니므로 Number Input 으로 받습니다."],
      ["Placement", "폼의 값 자리 · 정책 일정 설정"],
    ],
    principles: [
      ["형식", "24시간제 HH:mm 형식입니다. 초가 필요하면 HH:mm:ss 형식으로 받습니다. 오전 · 오후 표기는 쓰지 않습니다."],
      ["입력", "숫자만 쳐도 콜론이 채워집니다. 위 · 아래 화살표는 커서가 놓인 조각을 하나씩 바꾸고, 23 다음은 00 으로 돕니다."],
      ["열 목록", "시계 버튼이나 Alt + 아래 화살표로 엽니다. 칸을 고르면 바로 값이 되고 비어 있던 조각은 00 으로 채웁니다. 적용 버튼은 두지 않습니다."],
      ["팝업 안", "팝업이나 패널 본문 안에서도 열 목록은 본문에 잘리지 않고 그 위로 뜹니다. 본문을 스크롤하면 필드를 따라가고, 필드가 보이지 않게 되면 닫힙니다."],
      ["폭", "혼자 놓이면 최소 폭으로 둡니다. 폼 안에서는 다른 필드처럼 칸 폭을 채우고, 칸이 좁아도 최소 폭보다 줄지 않습니다."],
      ["간격", "간격은 분 열에 보이는 칸 사이의 간격입니다. 직접 친 값은 간격과 맞지 않아도 받습니다."],
      ["범위", "최소 · 최대 시각 밖의 칸은 고를 수 없습니다. 직접 친 범위 밖 값은 받고, 필드를 떠날 때 오류로 알립니다. 받을 수 있는 범위는 도움말에 미리 적습니다."],
      ["키보드", "열 안에서는 위 · 아래 화살표와 Home · End 로 옮기고, 왼쪽 · 오른쪽 화살표로 열을 바꿉니다. Enter 는 고르고 다음 열로 가며, 마지막 열에서는 닫고 입력칸으로 돌아갑니다. Esc 는 닫습니다. Tab 은 열 사이를 옮기고, 필드를 떠나면 닫힙니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "직접 치거나 시계 버튼으로 열 목록을 엽니다. 칸을 고르면 바로 값이 됩니다.", html: `
        ${tpField({ id: "tp1", label: "백업 시각", value: "02:00", help: "매일 이 시각에 백업합니다." })}` },
      { id: "seconds", group: "variant", title: "Seconds", desc: "초를 받으면 초 열이 더해지고 형식이 HH:mm:ss 가 됩니다.", html: `
        ${tpField({ id: "tp2", label: "기준 시각", value: "14:30:05", sec: true })}` },
      { id: "step", group: "variant", title: "Step", desc: "분 열을 15분 간격으로 보입니다. 직접 친 값은 간격과 맞지 않아도 받습니다.", html: `
        ${tpField({ id: "tp3", label: "점검 시작", value: "09:30", step: 15, help: "15분 단위로 고를 수 있습니다." })}` },
      { id: "range", group: "variant", title: "Min · Max", desc: "범위 밖 칸은 고를 수 없습니다. 직접 친 범위 밖 값은 떠날 때 오류로 알립니다.", html: `
        ${tpField({ id: "tp4", label: "업무 시작", value: "09:00", min: "06:00", max: "12:00", help: "06:00 부터 12:00 까지 입력할 수 있습니다." })}` },
      { id: "form", group: "variant", title: "In Form", desc: "빈 필수 값과 잘못된 시각은 저장할 때 막습니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          ${tpField({ id: "tp5", label: "점검 종료", req: true, help: "점검이 끝나는 시각입니다.", live: true })}
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "size", group: "size", title: "Size", desc: "높이는 Text Field 와 같은 32px · 40px · 48px 입니다.", html: `
        <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px">
          ${tpField({ id: "tp6", label: "Small", value: "08:00", cls: "sm" })}
          ${tpField({ id: "tp7", label: "Medium", value: "08:00" })}
          ${tpField({ id: "tp8", label: "Large", value: "08:00", cls: "lg" })}
        </div>` },
      { id: "error", group: "state", title: "Error", desc: "잘못된 시각을 그대로 두고 알립니다.", html: `
        ${tpField({ id: "tp9", label: "백업 시각", value: "25:10", cls: "error", help: "시각이 24시간제 형식이 아닙니다. 14:30 처럼 입력하세요." })}` },
      { id: "disabled", group: "state", title: "Disabled", desc: "입력과 버튼이 함께 꺼집니다.", html: `
        ${tpField({ id: "tp10", label: "백업 시각", value: "02:00", off: true, help: "관리자만 바꿀 수 있습니다." })}` },
    ],
    props: [[".timepicker", "class", "—", ".field 와 함께. React <code>TimePicker</code>"], ["data-seconds", "attr", "—", "HH:mm:ss. React <code>seconds</code>"], ["data-step", "attr", "1", "분 열의 간격(1~59 정수). React <code>step</code>"], ["data-min · data-max", "attr", "—", "HH:mm 범위. 밖 칸은 고를 수 없고 입력은 오류로 알립니다. React <code>min</code> · <code>max</code>"], ["data-messages", "attr", "—", "오류 문구 JSON — Date Picker 와 같은 키(incomplete · invalidTime · min · max · timeSubject). React <code>messages</code>"], ["data-labels", "attr", "—", "패널 · 열 이름 JSON(dialog · hour · minute · second). React <code>labels</code>"], ["data-validity", "attr(출력)", "—", "empty · incomplete · invalid · min · max · valid"], ["ds:time", "event", "—", "확정할 때 글자가 바뀌면 <code>{value, text, validity}</code>. value 는 미완성 · 잘못된 시각이면 null. React <code>onChange(value, {text, validity})</code>"]],
    spec: [["Size", "Text Field 와 같음 · sm 32 · md 40 · lg 48 · 최소 폭 160, 폼 안에서는 칸 폭을 채움"], ["Panel", "열 폭 56 · 칸 높이 32 · 칸 8개 높이 · 위아래 4 · 열 사이 1px 선"], ["Option", "Label 1/Normal 14/20 · 고른 칸 surface/brand/primary + 흰 글자 · 끈 칸 foreground/disable/primary"], ["Format", "24시간제 HH:mm · HH:mm:ss"]],
  },
  "tree": {
    status: "ready", react: ["Tree"], css: [".tree", ".tree-group", ".tree-item", ".tree-row", ".tree-toggle", ".tree-check", ".tree-label", ".tree-meta", ".tree-view", ".tree-hit", ".tree-empty"], borrows: [".searchbar", ".spinner"],
    desc: "조직 · 자산 그룹처럼 상하 관계가 있는 항목을 접고 펼치며 보여 줍니다. 하나를 골라 오른쪽 내용을 바꾸거나, 체크박스로 여러 개를 고릅니다.",
    choose: [
      ["언제 쓰는가", "조직이나 자산 그룹, 정책 폴더처럼 단계가 있는 항목을 보여 주고 그 안에서 고르게 할 때 씁니다. 하나를 골라 오른쪽 내용을 바꾸는 탐색에도, 정책을 적용할 대상을 여러 개 고르는 데에도 씁니다."],
      ["비슷한 것", "화면 사이를 옮기는 메뉴는 Navigation 입니다. 단계가 하나뿐이면 List 나 Checkbox 묶음으로 충분하고, 값 자리에서 하나를 고르는 것은 Select 나 Combobox 입니다. 표의 행 아래에 자세한 내용을 펼치는 것은 Data Table 의 행 펼침입니다."],
      ["Placement", "화면 왼쪽 목록 패널 · 적용 대상을 고르는 대화상자 · Side Panel"],
    ],
    principles: [
      ["선택", "탐색형은 행을 누르거나 Enter · Space 로 하나를 고릅니다. 포커스를 옮기는 것만으로는 고르지 않습니다. 화살표로 지나갈 때마다 오른쪽 내용을 다시 불러오지 않게 하려는 것입니다."],
      ["펼치기", "셰브론을 누르거나 오른쪽 · 왼쪽 화살표로 펼치고 접습니다. 행을 누르면 고르기만 하고 펼치지 않습니다."],
      ["체크박스형", "체크박스형에서는 상위를 켜면 켤 수 있는 하위가 모두 따라 켜지고, 일부만 켜지면 상위가 부분 선택으로 보입니다. 선택이 바뀌었다는 이벤트에는 켜진 항목이 모두 실립니다. 상위만 보낼지 하위만 보낼지는 제품이 정합니다."],
      ["끈 항목", "고르거나 켤 수 없지만 포커스는 받고 펼칠 수 있습니다. 이유는 행 끝 글자로 적습니다. 체크박스형에서 끈 하위는 상위를 켜도 그대로라 상위가 부분 선택으로 남고, 그 상위를 다시 누르면 꺼집니다."],
      ["불러오기", "하위를 나중에 불러오는 항목은 펼칠 때 불러 달라는 이벤트를 냅니다. 제품은 하위 항목을 넘기거나 실패를 알려야 합니다. 불러오는 동안 셰브론 자리에 스피너가 돕니다. 실패하면 접힌 채 줄 끝에 알리고, 다시 펼치면 다시 부릅니다."],
      ["검색", "트리 위 Search 에 치면 맞는 항목과 그 상위만 남기고 펼칩니다. 맞는 글자는 굵게 보이고 결과 수는 화면 낭독기에 알립니다. 지우면 검색 전 펼침으로 돌아갑니다. 아직 불러오지 않은 하위는 찾지 않으므로, 큰 트리는 서버 검색을 제품이 붙입니다."],
      ["키보드", "위 · 아래 화살표로 보이는 항목을 옮기고 Home · End 로 처음과 끝으로 갑니다. 글자를 치면 그 글자로 시작하는 항목으로 가고, * 는 같은 단계를 모두 펼칩니다. Tab 키는 트리 전체에서 한 번만 멈춥니다. 검색칸에서 아래 화살표를 누르면 첫 항목으로 갑니다."],
      ["구성", "8단계까지 들여씁니다. 긴 이름은 자르지 않고 줄을 바꿉니다. 행 안에는 버튼이나 링크를 두지 않고, 항목에 대한 동작은 트리 밖 툴바나 오른쪽 내용에 둡니다. 끌어다 놓아 옮기는 기능은 없으므로 옮기기도 오른쪽 내용의 동작으로 합니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "하나를 골라 오른쪽 내용을 바꾸는 탐색형입니다. 셰브론으로 펼치고, 행을 누르면 고릅니다. 행 끝에는 인원 같은 짧은 수를 둘 수 있습니다.", html: `
        <div style="width:280px">${treeHtml(TREE_ORG(), { id: "tr1", label: "조직" })}</div>` },
      { id: "checkable", group: "variant", title: "Checkbox", desc: "정책을 적용할 대상을 여러 개 고릅니다. 상위를 켜면 하위가 따라가고, 일부만 켜지면 상위가 부분 선택으로 보입니다.", html: `
        <div style="width:280px">${treeHtml([{ label: "전체 조직", open: true, children: [
          { label: "본사", open: true, children: [
            { label: "보안팀", children: [{ label: "관제 파트", checked: true }, { label: "대응 파트", checked: true }] },
            { label: "개발팀", children: [{ label: "플랫폼 파트" }, { label: "앱 파트" }] },
            { label: "경영지원팀", checked: true },
          ] },
          { label: "부산 지사", children: [{ label: "영업팀" }, { label: "기술지원팀" }] },
        ] }], { id: "tr2", label: "적용 대상", checkable: true })}</div>` },
      { id: "search", group: "variant", title: "Search", desc: "트리 위 Search 에 치면 맞는 항목과 그 상위만 남기고 펼칩니다. 지우면 검색 전 펼침으로 돌아갑니다.", html: `
        <div class="tree-view" style="width:280px">
          <div class="searchbar sm" role="search">${I("search")}<input type="search" placeholder="그룹 이름" aria-label="자산 그룹 검색"></div>
          ${treeHtml([
            { label: "서버", icon: "server", open: true, children: [{ label: "웹 서버", icon: "server", children: [{ label: "WEB-01" }, { label: "WEB-02" }] }, { label: "DB 서버", icon: "server", children: [{ label: "DB-01" }, { label: "DB-백업" }] }] },
            { label: "단말", icon: "device-desktop", children: [{ label: "본사 PC", icon: "device-desktop", children: [{ label: "보안팀 PC" }, { label: "개발팀 PC" }] }, { label: "지사 PC", icon: "device-desktop" }] },
          ], { id: "tr3", label: "자산 그룹" })}
        </div>` },
      { id: "lazy", group: "variant", title: "Load on Expand", desc: "하위가 많으면 펼칠 때 불러옵니다. 불러오는 동안 셰브론 자리에 스피너가 돌고, 실패하면 줄 끝에 알립니다. 이 예제의 부산 IDC 는 실패를 흉내 냅니다.", html: `
        <div style="width:280px">${treeHtml([
          { label: "본사 IDC", icon: "server", lazy: true, value: "idc-seoul" },
          { label: "부산 IDC", icon: "server", lazy: true, value: "idc-busan", demoFail: true },
        ], { id: "tr4", label: "서버 위치" })}</div>` },
      { id: "disabled", group: "state", title: "Disabled", desc: "권한이 없는 항목은 끕니다. 포커스는 받고 펼칠 수 있지만 고르거나 켤 수 없고, 이유를 행 끝에 적습니다.", html: `
        <div style="width:280px">${treeHtml([{ label: "본사", open: true, children: [
          { label: "보안팀", checked: true },
          { label: "개발팀" },
          { label: "외부 협력사", disabled: true, meta: "권한 없음" },
        ] }], { id: "tr5", label: "적용 대상", checkable: true })}</div>` },
    ],
    props: [[".tree", "class", "—", "<code>ul[role=tree][aria-label]</code>. React <code>Tree</code>"], [".checkable", "class", "—", "체크박스형 — <code>aria-multiselectable</code> · 항목마다 <code>aria-checked</code>. React <code>checkable</code>"], [".tree-item", "class", "—", "<code>li[role=treeitem][aria-level]</code>. 하위가 있으면 <code>aria-expanded</code> 와 <code>aria-labelledby</code>(.tree-label 의 id) · 하위 <code>ul.tree-group[role=group]</code>"], ["aria-selected", "attr", "—", "탐색형에서 고른 항목 하나만 true. React <code>selected</code> · <code>defaultSelected</code>"], ["aria-checked", "attr", "—", "체크박스형 true · false · mixed. 상위는 하위에서 계산합니다. React <code>checked</code> · <code>defaultChecked</code>"], ["aria-disabled", "attr", "—", "고르거나 켤 수 없음. React 항목의 <code>disabled</code>"], ["data-lazy", "attr", "—", "펼칠 때 하위를 불러옵니다. React 항목의 <code>lazy</code> + <code>onLoad</code>"], ["data-value", "attr", "글자", "이벤트에 실을 값. React 항목의 <code>value</code>"], [".tree-meta", "class", "—", "행 끝 짧은 글자 — 인원 · 개수 · 끈 이유. React 항목의 <code>meta</code>"], [".tree-view", "class", "—", "Search + Tree 묶음 — 검색 필터. React <code>searchable</code>"], ["data-labels", "attr", "—", "문구 JSON(failed · failedStatus · results · empty). React <code>labels</code>"], ["ds:tree-select", "event", "—", "<code>{value, label}</code>. React <code>onSelect(value)</code>"], ["ds:tree-expand", "event", "—", "<code>{value, expanded}</code>. React <code>onExpandedChange(values, {value, expanded})</code>"], ["ds:tree-check", "event", "—", "<code>{value, checked, values}</code> — values 는 켜진 모든 항목. React <code>onCheckedChange(values, {value, checked})</code>"], ["ds:tree-load", "event", "—", "<code>{value, resolve(items), reject(message)}</code> — items 는 <code>{label, value, children, lazy, disabled, meta}</code>. React <code>onLoad(value)</code> 가 하위를 돌려주는 Promise"]],
    spec: [["Size", "행 32 · padding 6/8 · 들여쓰기 단계마다 20 · 8단계까지 · 모서리 radius/sm"], ["Label", "Label 1/Normal 14/20 · 행 끝 글자 Caption 1 12 foreground/neutral/secondary · 검색에 맞는 글자 700"], ["Selected", "surface/brand/subtle 면 · foreground/brand/primary 글자 600 · 아이콘도 brand"], ["State", "hover surface/neutral/tertiary · 누름 surface/neutral/strong · 끈 항목 foreground/disable/primary · 포커스는 행 안쪽 1px 외곽선"], ["Checkbox", "16 · Checkbox 와 같은 면과 체크 · 부분 선택은 가로줄"], ["Icon", "셰브론 16 foreground/neutral/tertiary · 펼치면 90° · 불러오는 동안 스피너 12"]],
  },

  /* ------------------------------------------------ Notification Center(2026-11-14) */
  "notification-center": {
    status: "ready", react: ["NotificationCenter"], css: [".notify", ".notify-panel", ".notify-head", ".notify-title", ".notify-read-all", ".notify-body", ".notify-group", ".notify-day", ".notify-list", ".notify-item", ".notify-link", ".notify-dot", ".notify-main", ".notify-text", ".notify-sub", ".notify-time", ".notify-empty", ".notify-more"], borrows: [".btn", ".with-count", ".count", ".tooltip-wrap", ".tooltip", ".tabs", ".tab", ".tab-panel", ".tag", ".sr-only"],
    desc: "상단 바의 벨 버튼으로 여는 지난 알림 목록입니다. Toast 로 지나간 탐지 · 배포 · 계정 알림을 다시 보고, 안 읽은 것을 골라 관련 화면으로 갑니다.",
    choose: [
      ["언제 쓰는가", "실시간 탐지처럼 흘려보내면 놓칠 수 있는 알림을 쌓아 두고 나중에 다시 보게 할 때 씁니다. 안 읽은 수를 벨에 보여 주고, 항목을 누르면 그 알림의 관련 화면으로 갑니다."],
      ["비슷한 것", "방금 한 동작의 결과는 Toast, 화면 일부의 지속 상태는 Notice, 제품 전체에 영향을 주는 상태는 Banner 입니다. 알림을 검색하고 오래 쌓아 보는 이력 화면은 Data Table 로 따로 만듭니다."],
      ["Placement", "Top Navigation 오른쪽 — 검색 다음, 사용자 메뉴 앞"],
    ],
    principles: [
      ["열기", "벨 버튼 아래에 비모달 대화상자로 엽니다. 열면 포커스가 패널로 가고, Esc 를 누르면 닫히며 벨로 돌아옵니다. 바깥을 누르거나 Tab 으로 패널을 떠나도 닫힙니다."],
      ["읽음", "항목을 누르면 그 항목만 읽음이 됩니다. 열기만 해서는 바뀌지 않습니다. 머리의 '모두 읽음' 은 안 읽은 것을 한꺼번에 읽음으로 바꾸고, 남은 것이 없으면 꺼집니다. 읽음을 서버에 저장하는 일은 제품이 읽음 이벤트를 받아 합니다."],
      ["항목", "누르면 관련 화면으로 갑니다. 그래서 항목은 링크이고, 갈 화면이 없는 알림은 버튼이라 누르면 읽음만 됩니다. 항목 안에 다른 버튼을 두지 않고, 알림 하나를 지우는 동작도 두지 않습니다."],
      ["안 읽은 수", "벨에는 안 읽은 것이 있다는 점이 기본으로 보입니다. 건수가 중요한 제품은 숫자 배지를 고를 수 있고, 숫자는 99 를 넘으면 99+ 로 적습니다. 벨의 이름과 Tooltip, '안 읽음' 탭의 수는 점이어도 건수를 알리고, 시스템이 함께 맞춥니다. 0 이면 배지를 숨깁니다."],
      ["새 알림", "제품이 새 알림을 넘기면 맨 위 '오늘' 묶음에 넣고, 안 읽은 수를 늘리며 화면 낭독기에 알립니다. 알림을 받아 오는 연결은 제품의 몫입니다."],
      ["목록", "'전체' 와 '안 읽음' 탭으로 거르고, 목록 안은 오늘 · 어제 · 이전 같은 날짜 묶음으로 나눕니다. 묶음 이름과 '10분 전' 같은 시각 글자는 제품이 정합니다. 심각도가 있는 알림만 앞에 심각도 Tag 를 둡니다."],
      ["이전 알림", "목록 끝의 '이전 알림 보기' 를 누르면 더 불러 달라는 이벤트가 납니다. 불러오는 동안 버튼에 스피너가 돕니다. 실패하면 버튼 위에 알리고 버튼이 '다시 시도' 로 바뀝니다. 제품이 더 없다고 알려 주면 버튼을 없앱니다."],
    ],
    examples: [
      { id: "default", group: "default", title: "Default", desc: "벨을 누르면 열립니다. 안 읽은 항목은 점과 굵은 제목으로 보이고, 누르면 읽음이 되며 관련 화면으로 갑니다. 이 예제는 열린 채로 시작합니다.", html: `
        <div style="display:flex;justify-content:flex-end;width:100%;min-height:36rem">
          ${notifyHtml(NF_GROUPS(), { id: "nc1", open: true, more: true })}
        </div>` },
      { id: "count", group: "variant", title: "Count", desc: "건수가 중요한 제품은 벨에 숫자 배지를 둡니다. 숫자는 99 까지 쓰고 넘으면 99+ 로 씁니다.", html: `
        <div style="display:flex;justify-content:flex-end;width:100%">
          ${notifyHtml(NF_GROUPS(), { id: "nc5", count: "number" })}
        </div>` },
      { id: "live", group: "variant", title: "New Alerts", desc: "제품이 새 알림을 넘기면 맨 위에 쌓이고 벨의 수가 늘며 화면 낭독기에 알립니다. 아래 버튼은 도착을 흉내 냅니다.", html: `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;min-height:32rem">
          <button type="button" class="btn sm outline assistive" data-demo-notify="nc2-host">새 알림 도착 흉내</button>
          ${notifyHtml(NF_GROUPS().slice(1), { id: "nc2", hostId: "nc2-host" })}
        </div>` },
      { id: "empty", group: "state", title: "Empty", desc: "알림이 하나도 없으면 빈 상태 문구만 보이고 '모두 읽음' 은 꺼집니다. '안 읽음' 탭에서 다 읽었을 때도 같은 자리에 문구가 나옵니다.", html: `
        <div style="display:flex;justify-content:flex-end;width:100%;min-height:16rem">
          ${notifyHtml([], { id: "nc3", open: true })}
        </div>` },
      { id: "load-failed", group: "state", title: "Load Failed", desc: "이전 알림을 불러오지 못하면 버튼 위에 알리고 '다시 시도' 로 바뀝니다. 이 예제는 첫 시도가 실패합니다.", html: `
        <div style="display:flex;justify-content:flex-end;width:100%;min-height:30rem">
          ${notifyHtml(NF_GROUPS().slice(1), { id: "nc4", open: true, more: true, attrs: "data-demo-fail" })}
        </div>` },
    ],
    props: [[".notify", "class", "—", "벨 버튼과 패널을 감쌉니다. React <code>NotificationCenter</code>"], ["[aria-haspopup=dialog]", "button", "필수", "벨 아이콘 버튼 — <code>aria-expanded</code> · <code>aria-controls</code>, 접근 이름과 Tooltip 은 ds.js 가 안 읽은 수로 맞춥니다. 배지는 <code>.with-count > .count</code> — 기본은 점(<code>.dot</code>)"], ["data-count=\"number\"", ".notify", "점", "벨 배지를 숫자로. Caption 2 11, 99 초과 99+. React <code>count=\"number\"</code>"], [".notify-panel", "section", "—", "<code>role=dialog</code> · <code>aria-labelledby</code>(.notify-title). <code>hidden</code> 이면 닫힘"], [".notify-read-all", "button", "—", "모두 읽음 — 안 읽은 것이 없으면 <code>aria-disabled</code>"], [".tabs [data-filter]", "tab", "all · unread", "탭 두 개가 같은 <code>.tab-panel.notify-body[data-static]</code> 를 거릅니다"], [".notify-group", "section", "—", "날짜 묶음 — <code>aria-label</code> = <code>.notify-day</code> 글자"], [".notify-item", "li", "—", "<code>data-id</code>. 안 읽음이면 <code>.unread</code> + 링크 안 <code>.sr-only</code> ', 안 읽음'"], [".notify-link", "a | button", "—", "갈 화면이 있으면 <code>a[href]</code>, 없으면 <code>button</code>. 안에 다른 조작을 두지 않습니다"], [".notify-more", "container", "—", "이전 알림 보기 버튼. 실패 문구 <code>.msg</code> 는 ds.js 가 넣습니다. React <code>hasMore</code> · <code>onMore</code>"], ["data-labels", "attr", "—", "문구 JSON(trigger · triggerNone · unread · empty · emptyUnread · more · retry · moreFailed · loaded · readAll · fresh · freshMany · today). React <code>labels</code>"], ["DS.notify.add(el, items)", "function", "—", "맨 위에 넣고 수와 알림을 맞춥니다. items 는 <code>{id, title, sub, time, datetime, severity, href, unread, group}</code>. React 는 <code>items</code> 를 바꿉니다"], ["ds:notify-read", "event", "—", "<code>{ids, all}</code>. React <code>onRead(ids, {all})</code>"], ["ds:notify-more", "event", "—", "<code>{resolve(items, {done}), reject(message)}</code>. React <code>onMore()</code> 가 Promise"], ["ds:notify-open", "event", "—", "<code>{open}</code>. React <code>onOpenChange(open)</code>"]],
    spec: [["Size", "패널 폭 380(화면 폭 − 32 까지) · 높이 화면 − 96 과 560 중 작은 값 · 본문만 스크롤 · 항목 padding 12/20"], ["Container", "surface/elevated/primary · line/neutral/secondary · radius/lg · shadow-3 · 벨 아래 8 · 오른쪽 맞춤"], ["Label", "제목 Body 1/Normal 16/24 600 · 항목 Label 1/Normal 14/20(안 읽음 600) · 보조 · 시각 Caption 1 12/16 foreground/neutral/secondary · 날짜 묶음 Caption 1 600"], ["Unread", "앞 점 8 surface/brand/primary · 제목 600 — 읽으면 점 자리만 남음"], ["State", "항목 hover surface/neutral/tertiary · 누름 surface/neutral/strong · 포커스는 항목 안쪽 1px"], ["Count", "벨 배지 = Indicator Count · 99 넘으면 99+ · 0 이면 숨김 · 안 읽음 탭은 탭 건수 Count"]],
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = COMPONENTS;
