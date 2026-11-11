/* =========================================================
   components.data.js — 컴포넌트 상세(수는 세어 쓴다 — render.js 가 Object.keys 로)
   shape: { status, desc, css:[접두어…], thumb, examples:[{id,title,desc,html,react?,layout?,style?}],
            props:[[name, type, default, desc]], spec:[[k,v]], figma:{…}, principles? }
   spec 의 Placement 행은 Placement 절로, 나머지는 Spec 표로 그린다. principles:[[항목, 규칙]] 는 컴포넌트별 규칙 — 정의 바로 아래 표(패턴 페이지와 같은 형식)
   - html 은 라이브 프리뷰와 "HTML+CSS" 탭에 그대로 쓰이고, react 가 없으면 htmlToJsx 로 자동 변환됩니다.
   - 규칙: onclick 등 인라인 핸들러 · <script> · href="#/…" 금지(링크는 href="#"). 색은 var(--*) 토큰만.
   ========================================================= */
/* 탐색형 차트(Chart.js) 예제 — 같은 spec 으로 canvas(data-spec) 와 JS 탭을 만든다. 데이터는 React 예제(_react/examples/components/data-visual/*.tsx)와 같아야 한다.
   canvas 는 그래픽이라 role=img + aria-label(제목 · 요약)이 필수다(verify 가 검사) */
const chartCanvas = (kind, spec, label) => `<div class="chart-view"><div class="chart-tools"><button type="button" class="btn sm text assistive" data-chart-table>표로 보기</button></div><div class="chart-canvas"><canvas data-chart="${kind}" data-spec='${JSON.stringify(spec)}' role="img" aria-label="${label}"></canvas></div></div>`;
/* spec 을 사람이 읽을 모양으로 — 기본값 배열(라벨 · 숫자)은 한 줄, 객체는 들여쓰기 */
const pretty = (v, ind = "") => Array.isArray(v) ? (v.every((x) => typeof x !== "object" || x === null) ? JSON.stringify(v).replace(/,/g, ", ") : "[\n" + v.map((x) => ind + "  " + pretty(x, ind + "  ")).join(",\n") + "\n" + ind + "]")
  : v && typeof v === "object" ? "{\n" + Object.entries(v).map(([k, x]) => ind + "  " + k + ": " + pretty(x, ind + "  ")).join(",\n") + "\n" + ind + "}" : JSON.stringify(v);
const chartJs = (kind, spec, sel) => `// canvas[data-chart] + data-spec 은 ds-chart.js 가 DOMContentLoaded 때 자동으로 그립니다. 직접 그릴 때:
const handle = DSChart.mount(Chart, document.querySelector("${sel}"), DSChart.presets.${kind}(${pretty(spec)}));
// handle.chart(Chart.js 인스턴스) · handle.repaint() · handle.destroy() — 라이트/다크 · 제품 색 전환은 자동으로 다시 칠합니다`;
const CHART_DATA = {
  trend: {"labels":["10-21","10-22","10-23","10-24","10-25","10-26","10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03"],"series":[{"label":"Critical","tone":"critical","data":[12,18,9,14,22,17,11,8,15,19,24,13,10,16]},{"label":"High","tone":"high","data":[30,24,41,35,28,33,39,27,31,36,44,29,25,32]},{"label":"Medium","tone":"medium","data":[52,48,61,55,47,58,64,49,53,60,66,51,46,57]}],"stacked":true},
  weeks: {"labels":["랜섬웨어","악성코드","USB 위반","정책 위반","피싱"],"series":[{"label":"이번 주","tone":"series-1","data":[412,306,221,115,88]},{"label":"지난 주","tone":"series-1-subtle","data":[349,331,198,142,97]}]},
  depts: {"labels":["개발팀","영업팀","운영팀","재무팀","인사팀"],"series":[{"label":"Critical","tone":"critical","data":[42,18,25,9,6]},{"label":"High","tone":"high","data":[88,51,64,23,17]},{"label":"Medium","tone":"medium","data":[74,60,62,30,24]},{"label":"Low","tone":"low","data":[46,36,39,18,15]},{"label":"Info","tone":"info","data":[64,70,58,41,33]}],"stacked":true,"horizontal":true},
  severity: {"series":[{"label":"Critical","tone":"critical","value":190},{"label":"High","tone":"high","value":285},{"label":"Medium","tone":"medium","value":196},{"label":"Low","tone":"low","value":120},{"label":"Info","tone":"info","value":263}],"center":"1,054","legend":"right"},
  daily: {"labels":["10-28","10-29","10-30","10-31","11-01","11-02","11-03"],"bars":[{"label":"탐지","data":[412,380,455,402,390,470,431]}],"lines":[{"label":"차단","tone":"series-1-strong","data":[398,372,440,391,377,462,420]}]},
};

/* 아이콘: icons.gen.js 의 I(name, size, {style}) — assets/icons 의 Tabler 아이콘을 빌드 시 인라인 */
const popX = () => `<button type="button" class="btn sm text assistive icon-only popup-close" aria-label="닫기" data-popup-close>${I("x")}</button>`;
const spHead = (id, title) => `<div class="side-panel-header"><h3 class="side-panel-title" id="${id}">${title}</h3><button type="button" class="btn sm text assistive icon-only side-panel-close" aria-label="닫기" data-panel-close>${I("x")}</button></div>`;
const spFacts = (rows) => `<table class="tbl compact"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("")}</tbody></table>`;
const SP_EVENT = [["시각", "2026-09-07 14:22:05"], ["호스트", "DESKTOP-7F3K"], ["IP", "10.0.0.12"], ["정책", "외부 USB 차단"], ["처리", "차단"]];
const cb = (label, attrs = "", small = "") => `<label class="checkbox"><input type="checkbox"${attrs ? " " + attrs : ""}><span>${label}${small ? `<small>${small}</small>` : ""}</span></label>`;

/* 정적 달력 — ds.js 가 그리는 마크업과 같다(behave 가 대조한다). 정적 데모도 클릭 · 키보드 · 달 이동이 그대로 동작한다.
   React Calendar 도 같은 골격이다(site-consistency). 표기는 Intl(locale, 기본 ko-KR) — ds.js · React 와 같은 식.
   opts: month "YYYY-MM", mode("range" 면 두 달 — calendars:1 로 한 달), value | start · end, today, min, max, footer, presets, locale,
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
  const foot = [...presets.map((n) => btn("text", `data-preset="${n}"`, L.recent.replace("{n}", n))), ...[["today", "text", L.today], ["reset", "text", L.reset], ["cancel", "outline assistive", L.cancel], ["apply", "solid primary", L.apply]].filter(([k]) => list.includes(k) && (k !== "today" || !rg)).map(([k, c, l]) => btn(c, `data-cal="${k}"`, l))].join("");
  const data = [rg && "data-range", rg && o.calendars === 1 && 'data-calendars="1"', rg ? `data-start="${a}" data-end="${b}"` : a ? `data-value="${a}"` : "", `data-month="${o.month}"`, o.locale && `data-locale="${o.locale}"`, o.labels && `data-labels='${JSON.stringify(o.labels).replace(/'/g, "&#39;")}'`, o.today && `data-today="${o.today}"`, o.min && `data-min="${o.min}"`, o.max && `data-max="${o.max}"`, `data-footer="${o.footer || "none"}"`, presets.length && `data-presets="${o.presets}"`].filter(Boolean).join(" ");
  return `<div class="calendar${two ? " two" : ""}" role="group" aria-label="${L.dialog}" ${data}>
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
const cbCtl = ({ id, label, placeholder, value = "", chips = "", expanded = false, disabled = false, field = false }) => `<div class="control">${chips}<input type="text" id="${id}" role="combobox" aria-autocomplete="list" aria-expanded="${expanded}" aria-controls="${id}-list" autocomplete="off" placeholder="${placeholder}"${value ? ` value="${value}"` : ""}${field ? "" : ` aria-label="${label}"`}${disabled ? " disabled" : ""}></div>`;
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
const cbOpts = (on) => CB_DEPTS.map((l) => `<li class="menu-item${on.includes(l) ? " on" : ""}" role="option" data-value="${l}" aria-selected="${on.includes(l)}">${l}</li>`).join("");
const cbBox = ({ id, name, placeholder, multi = false, on = [], field = "", required = false }) => `<div class="combobox"${multi ? " data-multiple" : ""}${field ? ` data-name="${field}"` : ""}${required ? " data-required" : ""}>${cbCtl({ id, label: name, placeholder, chips: multi ? on.map(cbChip).join("") : "", value: multi ? "" : on[0], field: true })}${cbMenu(name, cbOpts(on), id, multi)}${CB_LIVE}${field && !multi ? `<input type="hidden" name="${field}" value="">` : ""}</div>`;
const selItems = (labels) => labels.map(([l, v]) => `<li class="menu-item" role="option"${v === undefined ? "" : ` data-value="${v}"`}>${l}</li>`).join("");
const selOpen = (label, state) => `<div class="dropdown open"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="true"><span class="placeholder">그룹 선택</span></button><ul class="menu" role="listbox" aria-label="${label}">${state}</ul></div>`;

const COMPONENTS = {
  /* ------------------------------------------------ Button */
  "button": {
    status: "ready", react: ["Button","ButtonGroup"], css: [".btn", ".btn-group"],
    desc: "사용자의 의도를 명확하게 전달하고 행동을 유도합니다.",
    thumb: `<button type="button" class="btn md outline assistive">취소</button><button type="button" class="btn md solid primary">저장</button>`,
    principles: [
      ["링크와 버튼", "다른 화면으로 가면 링크(<code>a.btn</code>, React <code>as=\"a\"</code>)이고, 지금 화면에서 일어나는 동작이면 <code>button</code> 입니다. 새 탭 열기와 주소 복사가 되어야 하면 링크입니다"],
      ["비활성", "폼 제출 버튼은 끄지 않고 누르면 검증해 안내합니다. 권한 · 상태 때문에 할 수 없는 동작은 끄고 이유를 화면에 적습니다. 끈 버튼에 Tooltip 을 달지 않습니다"],
      ["주 버튼", "카드 · 폼 · 대화상자마다 Solid Primary 는 하나입니다"],
    ],
    examples: [
      { id: "default", title: "Default", desc: "Primary Solid 가 기본입니다. 화면에서 가장 중요한 행동 하나에만 씁니다.", html: `<button type="button" class="btn md solid primary">정책 저장</button>` },
      { id: "variant", title: "Variant · Color", desc: "형태는 <b>Solid</b> 와 <b>Outline</b> 두 가지, 색은 <b>Primary</b>(기본) · <b>Assistive</b> · <b>Negative</b> 세 가지입니다. Negative 는 위험 · 경고성 행동에만 씁니다. 제품 메인 컬러가 상태색과 겹치면 제품 컬러가 쓰이는 곳이 모두 중립색으로 내려가, Primary 도 함께 바뀝니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary">Primary</button>
          <button type="button" class="btn md solid assistive">Assistive</button>
          <button type="button" class="btn md solid negative">Negative</button>
          <button type="button" class="btn md outline primary">Primary</button>
          <button type="button" class="btn md outline assistive">Assistive</button>
          <button type="button" class="btn md outline negative">Negative</button>
        </div>` },
      { id: "priority", title: "Priority", desc: "<b>Lv.4 Primary Solid</b> — 화면에서 가장 중요한 메인 행동을 유도 · 제안합니다. <b>Lv.3 Primary Outline</b> — 미리보기 · 임시 저장처럼 대체 행동을 제안합니다. <b>Lv.2 Assistive Solid</b> — 토글 버튼을 보조합니다. <b>Lv.1 Assistive Outline</b> — 닫기 · 취소 같은 보조 행동을 제시합니다. 삭제 · 탈퇴처럼 <b>되돌리기 어려운 행동</b>에는 우선순위와 별개로 Negative 를 씁니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary">정책 저장</button>
          <button type="button" class="btn md outline primary">미리보기</button>
          <button type="button" class="btn md solid assistive">필터</button>
          <button type="button" class="btn md outline assistive">취소</button>
          <button type="button" class="btn md solid negative">정책 삭제</button>
        </div>` },
      { id: "size", title: "Size", desc: "<b>높이는 고정</b>하고 너비는 라벨에 맞춰 자유롭게 씁니다. 테이블 · 툴바 안에서는 Small, 폼 하단은 Medium, 온보딩 · 빈 화면은 Large.", html: `
        <button type="button" class="btn sm solid primary">Small</button>
        <button type="button" class="btn md solid primary">Medium</button>
        <button type="button" class="btn lg solid primary">Large</button>` },
      { id: "icon", title: "Icon", desc: "아이콘은 행동의 의미를 보완할 때만 선택적으로 넣습니다. 라벨의 왼쪽(iconLeft) 또는 오른쪽(iconRight)에 하나만 두고, <b>양쪽에 동시에 두는 것은 지양</b>합니다.", html: `
        <button type="button" class="btn md solid primary">${I("plus")}정책 추가</button>
        <button type="button" class="btn md outline assistive">${I("download")}내보내기</button>
        <button type="button" class="btn md outline primary">다음 단계${I("chevron-right")}</button>` },
      { id: "icon-only", title: "Icon only", desc: "누구나 즉시 이해할 수 있는 보편적인 아이콘으로 <b>의미가 명확히 전달될 때만</b> 라벨 없이 씁니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md primary icon-only" aria-label="추가">${I("plus")}</button>
          <button type="button" class="btn md assistive icon-only" aria-label="새로 고침">${I("refresh")}</button>
          <button type="button" class="btn md negative icon-only" aria-label="삭제">${I("trash")}</button>
          <button type="button" class="btn sm outline assistive icon-only" aria-label="더 보기">${I("dots")}</button>
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기">${I("dots")}</button>
          <button type="button" class="btn lg solid primary icon-only" aria-label="설정">${I("settings")}</button>
        </div>` },
      { id: "state", title: "State", desc: "상태는 <b>Normal · Hover · Pressed · Disabled</b> 네 가지입니다.", html: `
        <div style="display:grid;grid-template-columns:repeat(4,auto);gap:12px">
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
      { id: "disabled", title: "Disabled", desc: "<code>disabled</code> 옵션으로 비활성을 표시합니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary" disabled>Primary</button>
          <button type="button" class="btn md solid assistive" disabled>Assistive</button>
          <button type="button" class="btn md solid negative" disabled>Negative</button>
          <button type="button" class="btn md outline primary" disabled>Primary</button>
          <button type="button" class="btn md outline assistive" disabled>Assistive</button>
          <button type="button" class="btn md outline negative" disabled>Negative</button>
          <button type="button" class="btn md assistive icon-only" aria-label="새로 고침" disabled>${I("refresh")}</button>
        </div>` },
      { id: "loading", title: "Loading", desc: "파일 업로드 · 전송 · 저장처럼 <b>잠깐 기다리는 상태</b>를 버튼 안에서 간단히 보여줄 때 씁니다.", html: `
        <button type="button" class="btn md solid primary loading" aria-busy="true">저장 중</button>
        <button type="button" class="btn md outline assistive loading" aria-busy="true">불러오는 중</button>
        <button type="button" class="btn md solid negative loading" aria-busy="true">삭제 중</button>` },
      { id: "text", title: "Text", desc: "카드 머리의 '전체 보기', 달력 하단의 '오늘 · 초기화'처럼 <b>문장 속 링크에 가까운 가벼운 행동</b>에만 씁니다. 카드 머리의 '전체 보기' 는 assistive 입니다(Card).", html: `
        <button type="button" class="btn sm text">전체 보기</button>
        <button type="button" class="btn md text">초기화</button>
        <button type="button" class="btn sm text assistive">전체 보기</button>
        <button type="button" class="btn md text assistive">초기화</button>` },
      { id: "placement", title: "Placement", desc: "메인과 서브가 분명히 다른 버튼을 <b>수평</b>으로 놓으면 유도 목적이 분명한 버튼을 <b>오른쪽</b>에, <b>수직</b>으로 놓으면 <b>위</b>에 둡니다.", html: `
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
      ["variant", "solid | outline | text", "solid", "형태. Solid 는 면을 채우고 Outline 은 테두리만 둡니다. <code>text</code> 는 Solid · Outline 정의 밖의 변형이고 색은 primary · assistive 둘입니다(assistive 는 <code>.text.assistive</code>). iconOnly 에서 생략하면 배경이 없습니다"],
      ["color", "primary | assistive | negative", "primary", "색. Primary 는 주 행동, Assistive 는 보조 행동, Negative 는 삭제 · 탈퇴처럼 되돌리기 어려운 위험 · 경고성 행동"],
      ["size", "sm | md | lg", "md", "높이 32 · 40 · 48 고정, 너비는 라벨에 맞춰 자유"],
      ["iconLeft / iconRight", "ReactNode", "—", "라벨 왼쪽 · 오른쪽 아이콘. 행동의 의미를 보완할 때만 쓰고 한쪽에만 둡니다(동시 사용 지양). HTML 은 라벨 앞이나 뒤에 <code>svg</code> 를 둡니다. 크기는 sm 16 · md 18 · lg 20"],
      ["iconOnly / .icon-only", "boolean", "false", "아이콘만 단독으로 둡니다. variant 를 생략하면 배경이 없고 hover 에만 배경이 나타나며, solid · outline 을 주면 그 면을 가진 정사각 버튼이 됩니다. <code>aria-label</code> 필수"],
      ["disabled", "boolean", "false", "비활성. 전용 토큰(회색 면 · 라벨)으로 칠하고 투명도를 쓰지 않습니다. 링크(<code>a</code>)는 <code>aria-disabled=\"true\"</code>"],
      ["loading / .loading", "boolean", "false", "로딩 상태. disabled 와 달리 포커스를 유지하고 click · mousedown · pointerdown · keydown 실행을 막습니다(이동 키 · 단축키는 통과). <code>aria-busy=\"true\"</code> 를 함께 두고, 스피너만 보이며 라벨은 자리만 지킵니다"],
      ["block / .block", "boolean", "false", "전체 폭"],
      ["as / a.btn", "ElementType", "button", "루트 요소. 이동이면 <code>a</code>, 실행이면 <code>button</code>"],
      ["type", "button | submit | reset", "button", "폼 안에서는 명시"],
      ["ButtonGroup / .btn-group", "container", "—", "버튼 묶음(간격 12). 수평으로 놓으면 주 행동이 오른쪽"],
      ["end / .end", "boolean", "false", "ButtonGroup — 묶음을 오른쪽 정렬(폼 하단)"],
      ["vertical / .vertical", "boolean", "false", "ButtonGroup — 수직 배열(간격 8, 같은 폭). 주 행동이 위"],
    ],
    spec: [["Priority", "Lv.4 Primary Solid · Lv.3 Primary Outline · Lv.2 Assistive Solid · Lv.1 Assistive Outline · 되돌리기 어려운 행동은 Negative"], ["State", "Normal → Hover → Pressed 로 <b>라이트는 어두워지고 다크는 밝아집니다</b>. Solid primary <code>--surface-brand-primary</code> → <code>-strong</code> → <code>-heavy</code>(라이트 brand 50·45·40 · 다크 50·55·60) · Solid assistive <code>--surface-neutral-tertiary</code> → <code>-secondary</code> → <code>-strong</code> · Solid negative <code>--surface-negative-primary</code> → <code>-strong</code> → <code>-heavy</code>. Outline 은 면이 투명에서 출발 — primary(테두리 <code>--line-brand-strong</code> · 글자 <code>--foreground-brand-primary</code>) <code>--surface-brand-subtle</code> → <code>-subtle-strong</code>, assistive <code>--surface-neutral-secondary</code> → <code>-strong</code>, negative <code>--surface-negative-hover</code> → <code>-pressed</code>. 틴트는 알파가 커지는 구조라 같은 토큰이 테마에 따라 방향을 뒤집고, 불투명 primary 는 두 테마 모두 제품 HEX(50)에서 출발해 테마별로 반대 방향 단계를 집습니다. Disabled 는 전용 토큰. 키보드 포커스는 상태가 아니라 전 변형 공통 <code>--foreground-brand-primary</code> 1px 외곽선(2px 띄움)"], ["Size", "sm 32 · md 40 · lg 48 (높이 고정)"], ["Container", "radius/md 6 · 좌우 padding 14 / 20 / 26 (text 변형은 8 고정 · 아이콘 전용은 정사각)"], ["Label", "14 SemiBold (sm 12 · lg 16) · 누르면 일어날 동작으로"], ["Placement", "수평은 주 행동이 오른쪽 · 수직은 주 행동이 위 · Lv.4 는 카드 · 폼 · 대화상자당 하나"]],
    figma: { frame: "Button", radius: "radius/md", sizes: { sm: { h: 32, px: 14, fs: 12 }, md: { h: 40, px: 20, fs: 14 }, lg: { h: 48, px: 26, fs: 16 } }, iconSize: { sm: 16, md: 18, lg: 20 }, variants: { "solid primary": { bg: "--surface-brand-primary", fg: "--brand-label" }, "outline primary": { bg: "transparent", fg: "--foreground-brand-primary", stroke: "--line-brand-strong" }, "solid assistive": { bg: "--surface-neutral-tertiary", fg: "--foreground-neutral-primary" }, "outline assistive": { bg: "transparent", fg: "--foreground-neutral-primary", stroke: "--line-neutral-primary" }, "solid negative": { bg: "--surface-negative-primary", fg: "--foreground-negative-strong" }, "outline negative": { bg: "transparent", fg: "--foreground-negative-strong", stroke: "--line-negative-primary" }, text: { bg: "transparent", fg: "--foreground-brand-primary" }, "text assistive": { bg: "transparent", fg: "--foreground-neutral-secondary" }, "plain primary": { bg: "transparent", fg: "--foreground-brand-primary" }, "plain assistive": { bg: "transparent", fg: "--foreground-neutral-secondary" }, "plain negative": { bg: "transparent", fg: "--foreground-negative-strong" } }, states: ["normal", "hover", "pressed", "disabled"], loading: true, disabled: { bg: "--surface-disable-primary", fg: "--foreground-disable-primary", outlineBg: "transparent", outlineStroke: "--surface-disable-primary" } },
  },

  /* ------------------------------------------------ Text Field */
  "text-field": {
    status: "ready", react: ["Field","TextField","TextArea"], css: [".field"],
    desc: "한 줄 텍스트를 입력합니다. 라벨·도움말·오류 메시지가 하나의 필드 단위로 묶입니다.",
    principles: [
      ["라벨", "모든 입력에 보이는 라벨을 위에 둡니다. placeholder 로 대신하지 않습니다"],
      ["Placeholder", "입력 예시만 짧게 씁니다. 입력을 시작하면 사라지므로 형식 · 조건은 도움말에 씁니다"],
      ["필수", "필수 항목이 있는 폼은 위에 <code>.form-legend</code> 로 <b>* 필수 항목</b> 을 표시합니다"],
      ["오류", "동작은 <a href=\"#/foundations/interaction\">Interaction</a> › Input errors 를 따릅니다. 폼에 <code>data-validate</code> 를 달면 시스템이 처리합니다. 문구는 <a href=\"#/foundations/writing\">Writing</a> 대로 무엇이 일어났는지와 고치는 법을 씁니다"],
      ["글자 수", "한도가 있고 넘기기 쉬운 필드에만 카운터를 둡니다. 붙여넣은 값이 잘리지 않도록 넘겨도 입력되고, 오류로 알립니다"],
      ["Disabled · Read-only", "Disabled 는 고칠 수 없고 값도 중요하지 않을 때, Read-only 는 고칠 수 없지만 값을 읽고 복사해야 할 때 씁니다"],
      ["필드 안 조작", "필드 안에 버튼을 넣지 않습니다. 비밀번호 표시 · Date Picker 달력 · Search 지우기 · Combobox 태그 제거만 예외입니다"],
      ["입력 종류", "IP · URL · 해시는 <code>.mono</code> 로 고정폭, 비밀번호는 표시 토글을 둡니다. 표준 <code>type</code> · <code>autocomplete</code> 값을 쓰고, 비밀번호 필드의 붙여넣기를 막지 않습니다"],
      ["Textarea", "세로로만 늘립니다"],
    ],
    thumb: `<div class="field" style="min-width:200px"><label>정책 이름</label><input placeholder="예: USB 차단"></div>`,
    examples: [
      { id: "basic", title: "Default / Error", desc: "오류 시 .error 를 필드에 붙이고 help 를 오류 메시지로 바꿉니다. 원인과 해결 방법을 함께 씁니다.", html: `
        <div class="field mono"><label for="ip1">허용 IP</label><input id="ip1" value="10.0.0.12"><span class="help">IPv4 형식</span></div>
        <div class="field mono error"><label for="ip2">허용 IP</label><input id="ip2" value="10.0.0" aria-invalid="true" aria-describedby="ip2-err"><span class="help" id="ip2-err">올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12</span></div>` },
      { id: "size", title: "Size", desc: "sm 32 · md 40 · lg 48. 버튼과 같은 높이로 나란히 배치합니다.", html: `
        <div class="field sm"><label for="sz-s">Small</label><input id="sz-s" placeholder="32px"></div>
        <div class="field"><label for="sz-m">Medium</label><input id="sz-m" placeholder="40px"></div>
        <div class="field lg"><label for="sz-l">Large</label><input id="sz-l" placeholder="48px"></div>`, layout: "top" },
      { id: "affix", title: "Prefix / Suffix / Counter", desc: "단위·접두어는 .affix 컨테이너 안에 span 으로. 글자 수 한도는 data-maxlength 와 .counter — 넘겨도 입력되고 오류로 알립니다.", html: `
        <div class="field"><label for="af-d">보관 기간</label><div class="affix"><input id="af-d" value="90"><span>일</span></div></div>
        <div class="field"><label for="af-u">관리 콘솔 주소</label><div class="affix"><span>https://</span><input id="af-u" placeholder="console.example.com"></div></div>
        <div class="field"><div class="row"><label for="af-c">설명</label><span class="counter">12 / 80</span></div><input id="af-c" value="외부 저장장치 차단 정책" data-maxlength="80"><span class="help" aria-live="polite"></span></div>` },
      { id: "password", title: "Password", desc: "표시 토글로 입력한 값을 확인합니다. 토글을 눌러도 포커스는 버튼에 남고, 붙여넣기를 막지 않습니다.", html: `
        <div class="field"><label for="pw1">관리자 비밀번호</label><div class="affix"><input id="pw1" type="password" value="secret-value" autocomplete="current-password"><button type="button" class="reveal" aria-label="비밀번호 표시" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button></div></div>` },
      { id: "textarea", title: "Textarea", desc: "여러 줄 입력. 높이는 세로 리사이즈 허용, 최소 96px.", html: `
        <div class="field" style="min-width:420px"><label for="memo">메모</label><textarea id="memo" placeholder="정책 변경 사유를 남겨 주세요"></textarea><span class="help">감사 로그에 기록됩니다</span></div>` },
      { id: "state", title: "Disabled / Read-only", desc: "Disabled 는 값을 바꿀 수도 복사할 수도 없을 때, Read-only 는 참조만 할 때.", html: `
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
      [".mono", "boolean", "false", "입력 글자를 고정폭으로 — IP · URL · 해시"],
      [".reveal", "button", "—", ".affix 안 비밀번호 표시 토글(aria-pressed). React 는 reveal"],
      ["data-validate", "form 속성", "—", "폼 검증을 켭니다. required · pattern · min · max · minlength · type 과 data-maxlength 를 봅니다. 문구는 data-messages(JSON). React 는 Form 의 validate · messages"],
      ["disabled / readonly", "attribute", "—", "비활성 / 읽기 전용(배경 subtle)"],
    ],
    spec: [["Size", "sm 32 · md 40 · lg 48"], ["Container", "radius/md 6 · line/neutral/primary 1px · 포커스: 테두리 1px foreground/brand/primary · 바깥 4px line/brand/focus · 오류일 때는 foreground/negative/primary · line/negative/focus"], ["Label", "라벨 14 SemiBold · 입력 Body/2 14 · placeholder foreground/neutral/tertiary · 필수는 em(*)"], ["Placement", "라벨은 필드 위, 도움말은 아래. 좌우 여백 14"]],
    figma: { frame: "Text Field", radius: "radius/md", sizes: { sm: { h: 32 }, md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-primary" }, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" }, error: { stroke: "--foreground-negative-primary", focused: { stroke: "--foreground-negative-primary", ring: "--line-negative-focus" } } }, states: ["default", "hover", "focused", "error", "error focused", "disabled", "readonly"] },
  },

  /* ------------------------------------------------ Search */
  "search": {
    status: "ready", react: ["SearchBar"], css: [".searchbar", ".chip", ".chip-group"], borrows: [".sr-only", ".btn"],
    desc: "목록·로그를 빠르게 필터링하는 검색 입력입니다. 입력이 멈추면 결과가 바뀌는 '필터형'과 Enter 로 조회하는 '조회형'을 구분합니다.",
    principles: [
      ["필터형 · 조회형", "이미 불러온 목록을 좁히면 필터형입니다. <code>data-debounce</code> 로 입력이 멈추고 300ms 뒤에 결과를 바꿉니다. 서버에 새로 묻거나 비용이 크면 조회형으로 Enter 에 맡깁니다"],
      ["Placeholder", "검색 대상을 씁니다. 검색 아이콘과 접근 이름(<code>aria-label</code>)이 있을 때만 보이는 라벨 없이 쓸 수 있습니다"],
      ["지우기", "값이 있을 때만 보입니다. Esc 도 같은 동작입니다. 값이 없으면 검색창은 Esc 에 반응하지 않습니다"],
      ["단축키", "<code>/</code> 는 화면에 하나뿐인 주 검색에만 답니다. 입력 중 · 조합키 · 모달이 열린 동안에는 무시합니다"],
      ["결과 건수", "결과가 바뀌면 숨긴 라이브 영역으로 건수를 알립니다. 보이는 건수는 목록 툴바에 둡니다"],
      ["결과 없음", "<a href=\"#/components/empty-state\">Empty State</a> 의 검색 결과 없음으로 잇습니다. 조건을 보여 주고 초기화 · 완화를 제안합니다"],
      ["조건 유지", "검색어와 필터를 URL 에 남겨 공유 · 새로고침해도 유지합니다. 제품이 구현합니다"],
    ],
    thumb: `<div class="searchbar" style="min-width:220px">${I("search")}<input placeholder="검색"></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "아이콘 + 입력. 조회형입니다 — Enter 로 ds:search 를 냅니다.", html: `
        <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="정책 이름 검색" aria-label="정책 검색"></div>` },
      { id: "extras", title: "Shortcut / Clear", desc: "전역 검색에는 data-hotkey 와 단축키(kbd)를, 값이 있을 때는 지우기 버튼을 보여줍니다. 이 페이지에서는 / 가 이 입력으로 갑니다.", html: `
        <div class="searchbar" role="search" data-hotkey>${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="검색"><kbd>/</kbd></div>
        <div class="searchbar" role="search">${I("search")}<input type="search" value="랜섬웨어" aria-label="검색"><button type="button" class="clear" aria-label="지우기">${I("x",12)}</button></div>` },
      { id: "large", title: "Large / Block", desc: "빈 화면·온보딩처럼 검색이 화면의 주된 행동일 때 lg + block.", html: `
        <div class="searchbar lg block" role="search" style="max-width:560px">${I("search")}<input type="search" placeholder="정책 이름, 대상 검색" aria-label="검색"></div>` },
      { id: "filters", title: "With Filters", desc: "필터형 + 필터 칩 조합. 입력이 멈추면 결과를 바꾸고, 건수는 숨긴 role=status 로 알립니다.", html: `
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
      ["size", "(md) | lg", "md", "높이 40 / 48"],
      ["kbd", "element", "—", "단축키 표시(전역 검색). 값이 있으면 숨김. data-hotkey 와 같이 씁니다"],
      [".clear", "button", "—", "값 지우기. 값이 있을 때만 렌더"],
    ],
    spec: [["Size", "높이 40 (lg 48) · 최소 폭 280"], ["Container", "radius/md 6 · line/neutral/primary · 포커스: 테두리 1px foreground/brand/primary · 바깥 4px line/brand/focus"], ["Label", "Body/2 14 · 플레이스홀더 foreground/neutral/tertiary"], ["Placement", "테이블 툴바 좌측, 전역 검색은 상단 바 로고 옆"]],
    figma: { frame: "Search", radius: "radius/md", sizes: { md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-primary" }, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" } }, states: ["default", "focused", "filled"] },
  },

  /* ------------------------------------------------ Select Button */
  "select-button": {
    status: "ready", react: ["SelectButton"], css: [".select-btn"],
    desc: "2~5개 옵션 중 하나를 고르는 세그먼트 컨트롤입니다. 뷰 전환(목록/카드), 기간(24시간/7일/30일)처럼 즉시 반영되는 선택에 씁니다.",
    principles: [
      ["언제 쓰는가", "2~5개 중 하나이고 같은 내용의 보기 · 기간만 바뀔 때입니다. 내용이 달라지면 <a href=\"#/components/tab\">Tab</a>, 저장해야 반영되면 <a href=\"#/components/radio-button\">Radio Button</a>, 6개 이상이면 <a href=\"#/components/select\">Select</a> 입니다"],
      ["항상 하나", "언제나 하나가 선택되어 있습니다. 선택을 푸는 동작은 없습니다"],
      ["라벨", "1~2단어로 쓰고 항목끼리 길이를 비슷하게 맞춥니다"],
      ["키보드", "Tab 은 묶음에 한 번만 멈춥니다. 좌우 · 상하 화살표로 옮기면 바로 고르고, 비활성은 건너뛰며 끝에서 처음으로 돌아옵니다"],
    ],
    thumb: `<div class="select-btn"><button class="on">24시간</button><button>7일</button><button>30일</button></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "선택된 항목에 .on. 컨테이너에 role=radiogroup, 버튼에 role=radio · aria-checked. Tab 은 한 번만 멈추고 화살표로 옮깁니다.", html: `
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
      { id: "outline", title: "Outline", desc: "툴바에서 다른 버튼과 나란히 둘 때 아웃라인형. 고른 버튼은 네 변이 brand 선이고 면은 옅은 brand 입니다.", html: `
        <div class="select-btn outline" role="radiogroup" aria-label="보기">
          <button type="button" class="on" role="radio" aria-checked="true">${I("list")}목록</button>
          <button type="button" role="radio" aria-checked="false">${I("chart-bar")}차트</button>
        </div>` },
      { id: "solid", title: "Outline Solid", desc: "<code>.outline.solid</code> — 고른 버튼을 제품 색 면 + 흰 글자로 칠합니다. 고른 값을 툴바에서 더 또렷하게 보여야 할 때 씁니다. outline 틀에만 씁니다.", html: `
        <div class="select-btn outline solid" role="radiogroup" aria-label="판정">
          <button type="button" class="on" role="radio" aria-checked="true">전체</button>
          <button type="button" role="radio" aria-checked="false">차단</button>
          <button type="button" role="radio" aria-checked="false">허용</button>
        </div>` },
      { id: "disabled", title: "Disabled", desc: "개별 옵션 비활성.", html: `
        <div class="select-btn" role="radiogroup" aria-label="판정">
          <button type="button" class="on" role="radio" aria-checked="true">전체</button>
          <button type="button" role="radio" aria-checked="false">차단</button>
          <button type="button" role="radio" aria-checked="false" disabled>허용</button>
        </div>` },
    ],
    props: [[".select-btn", "container", "—", "role=radiogroup + aria-label. 버튼 2~5개, 버튼마다 role=radio"], [".outline", "boolean", "false", "아웃라인형(툴바용). 고른 버튼은 brand 선 + 옅은 brand 면"], [".solid", "boolean", "false", "고른 버튼을 제품 색 면 + 흰 글자로. <code>.outline</code> 과 함께만 — React <code>solid</code>"], [".on", "boolean", "—", "선택 항목. aria-checked=true 와 함께"], ["disabled", "attribute", "—", "옵션 비활성"]],
    spec: [["Size", "높이 38 (버튼 32 + 패딩 3) · outline 38 (버튼마다 테두리 1 포함 38 · 이웃과 1px 겹침)"], ["Container", "radius/md 6 · surface/neutral/secondary · outline 은 버튼마다 line/neutral/primary"], ["Selected", "기본 elevated + shadow-1 · outline brand 선(surface/brand/primary) + brand subtle 면 · outline solid surface/brand/primary 면 + 흰 글자"], ["Label", "Label/1 14 · 선택 14 SemiBold"], ["Placement", "카드 헤더 우측, 툴바"]],
    figma: { frame: "Select Button", radius: "radius/md", sizes: { md: { h: 38 } }, variants: { filled: { bg: "--surface-neutral-secondary" }, outline: { stroke: "--line-neutral-primary" } }, states: ["default", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Slider */
  "slider": {
    status: "ready", react: ["Slider"], css: [".slider", ".slider-field"], borrows: [".number-field", ".num-btn", ".field", ".affix", ".help"],
    desc: "범위 안의 값을 드래그로 고릅니다. 정확한 값이 중요하면 <a href=\"#/components/text-field\">Text Field</a> 를 씁니다.",
    principles: [
      ["언제 쓰는가", "대략적인 값일 때입니다. 정책 임계치처럼 숫자가 정확해야 하면 Text Field 를 먼저 씁니다"],
      ["숫자 입력을 함께 둘 때", "<code>.slider-field</code> 로 두 칸을 값 하나로 묶습니다. 입력칸은 트랙 오른쪽에 두고, 제출하는 값은 입력칸입니다. Slider 를 움직이면 입력칸이 바로 바뀝니다. 입력칸에 범위를 벗어난 값을 쓰면 글자는 지우지 않고 오류로 알리며, Slider 는 가까운 끝에 둡니다"],
      ["단위", "현재 값에 단위를 붙여 보이고 읽히게 합니다. <code>.val</code> 의 단위는 <code>aria-valuetext</code> 로도 나갑니다"],
      ["범위", "값은 하나입니다. 두 끝을 고르는 범위 슬라이더는 지원하지 않습니다. 시작 · 끝 값을 Text Field 둘로 받습니다"],
    ],
    thumb: `<div class="slider" style="min-width:200px"><input type="range" value="60" style="--p:60%"></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "채워진 트랙은 --p 커스텀 속성(현재 %)으로 그립니다. JS 로 value 변경 시 --p 도 함께 갱신합니다.", html: `
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
      { id: "ticks", title: "With Ticks", desc: "단계가 정해진 값은 step 과 눈금을 보여줍니다. 단위는 현재 값과 함께 aria-valuetext 로 읽힙니다.", html: `
        <div class="slider">
          <div class="row"><label for="s2">로그 보관</label><span class="val">90일</span></div>
          <input id="s2" type="range" min="30" max="180" step="30" value="90" style="--p:40%">
          <div class="ticks"><span>30</span><span>180</span></div>
        </div>` },
      { id: "with-input", title: "With Number Input", desc: "대략 맞추고 정확히 고치는 값입니다. 트랙을 움직이면 입력칸이, 입력칸에 치면 트랙이 따라갑니다. 범위 밖 값은 받아서 오류로 알리고 트랙은 끝에 둡니다.", html: `
        <div class="field number-field slider-field">
          <label id="s5-label" for="s5">로그인 실패 허용 횟수</label>
          <div class="slider-control">
            <div class="slider"><input type="range" min="0" max="20" value="5" style="--p:25%" aria-labelledby="s5-label" aria-valuetext="5회"></div>
            <div class="affix"><input id="s5" type="number" min="0" max="20" value="5"><span>회</span>${numBtns("로그인 실패 허용 횟수")}</div>
          </div>
          <span class="help">0회부터 20회까지 입력할 수 있습니다.</span>
        </div>` },
      { id: "exact", title: "정확한 값", desc: "숫자가 정확해야 하면 Slider 대신 Number Input 을 씁니다.", html: `
        <div class="field number-field" style="width:280px"><label for="s4">세션 만료</label><div class="affix"><input id="s4" type="number" value="30" min="5" max="1440"><span>분</span>${numBtns("세션 만료")}</div><span class="help">5분부터 1440분까지 입력할 수 있습니다.</span></div>` },
      { id: "disabled", title: "Disabled", html: `
        <div class="slider">
          <div class="row"><label for="s3">대역폭 제한</label><span class="val">—</span></div>
          <input id="s3" type="range" value="40" style="--p:40%" disabled>
        </div>` },
    ],
    props: [[".slider", "container", "—", ".row(라벨·값) + input[type=range](+ .ticks)"], [".val", "element", "—", "현재 값. 숫자 뒤 글자가 단위(90일) — 움직여도 유지되고 aria-valuetext 로 나간다"], [".slider-field", "container", "—", ".field.number-field.slider-field — label(id · 숫자 입력칸에 for) + .slider-control(.slider > range[aria-labelledby=라벨] + .affix > input[type=number] · 단위 · .num-btn) + .help. 두 칸의 min · max · step 은 같다. 트랙의 aria-valuetext 에 입력칸의 단위가 붙는다. React <code>withInput</code> · <code>unit</code>"], ["--p", "css var (%)", "50%", "채워진 트랙 비율. value 와 동기화"], ["min / max / step", "attribute", "0 / 100 / 1", "네이티브 속성"], ["disabled", "attribute", "—", "비활성"]],
    spec: [["Size", "트랙 6 · 썸 20 · 최소 폭 280"], ["Container", "트랙 radius/full · 썸 border 2px brand"], ["Label", "라벨 12 Regular · 현재 값 12 SemiBold · 눈금 12 tertiary"], ["Placement", "정책 설정의 수치 항목. 정확 입력이 필요하면 Text Field 병행"]],
    figma: { frame: "Slider", sizes: { md: { track: 6, thumb: 20 } }, variants: { default: { fill: "--surface-brand-primary", track: "--surface-neutral-strong" } }, states: ["default", "hover", "focused", "disabled"] },
  },

  /* ------------------------------------------------ Date Picker */
  "date-picker": {
    status: "ready", react: ["Calendar","DatePicker","DateRangePicker","formatDate","parseDate"], css: [".datepicker", ".calendar"], borrows: [".btn", ".field", ".sr-only"],
    desc: "날짜를 YYYY. MM. DD 순서로 입력하거나 달력에서 고릅니다. Text Field 위에 만들어 숫자만 치면 형식이 채워지고, 단위(연 · 월 · 일) · 기간 · 표기 언어(locale) · 기준 시간대(timezone)를 정할 수 있습니다. 값이 늘 유효한 날짜는 아닙니다 — 덜 친 날짜 · 없는 날짜 · 범위 밖 날짜도 상태로 남습니다.",
    thumb: dpField({ id: "dp-thumb", label: "조회 기간", range: true, value: "2026. 09. 01 ~ 2026. 09. 07" }),
    examples: [
      { id: "default", title: "Default", desc: "날짜 하나를 입력하는 기본 필드입니다. 숫자만 치면 <code>YYYY. MM. DD</code> 로 끊어 채워집니다(20260907 → 2026. 09. 07, 월에 9 를 치면 09). ↑↓ 는 커서가 놓인 조각(연 · 월 · 일)을 하나씩 올리고 내립니다. 달력 버튼이나 Alt+↓ 로 달력을 열면 달력 하나에서 고릅니다.", html: dpField({ id: "dp-default", label: "점검일" }) },
      { id: "range", title: "Date Range Picker", desc: "기간(조회 기간)은 <code>data-range</code> 입니다. 달력 두 개가 기본이라 달을 넘는 기간을 한 번에 고르고, 좁은 화면(767px 이하)이나 <code>data-calendars=\"1\"</code> 에서는 하나로 줄어듭니다. 입력은 <code>YYYY. MM. DD ~ YYYY. MM. DD</code> — 앞 날짜가 다 차면 ~ 뒤로 넘어갑니다. <code>data-max=\"today\"</code> 로 미래 날짜는 고를 수 없습니다.", html: dpField({ id: "dp-range", label: "조회 기간", range: true, value: "2026. 09. 01 ~ 2026. 09. 07", attrs: 'data-max="today" data-presets="7 30"' }), layout: "top" },
      { id: "time", title: "Time", desc: "<code>data-time</code> 이면 시각까지 입력합니다. 값 하나 <code>YYYY. MM. DD HH:mm</code>, 24시간제입니다. <code>data-time=\"seconds\"</code> 는 초까지 받습니다. 숫자만 치면 끊어 채워지고 ↑↓ 는 시 · 분 · 초도 하나씩 움직입니다. 달력에서는 날짜를 누르고 아래 칸에서 시각을 고쳐 적용합니다. 처음 시각은 00:00 이고, 이미 시각이 있으면 날짜만 바꿉니다. 시각을 치지 않으면 값이 되지 않고 덜 입력됐다고 알립니다.", html: `
        ${dpField({ id: "dp-time", label: "예약 실행", time: true, value: "2026. 09. 07 14:30" })}
        ${dpField({ id: "dp-time-sec", label: "이벤트 시각", time: "seconds", value: "2026. 09. 07 14:30:05" })}`, layout: "top" },
      { id: "time-range", title: "Time Range", desc: "기간에도 시각을 붙입니다. 달력에서 고르면 시작은 00:00, 끝은 23:59(초를 쓰면 23:59:59)로 시작해 고른 마지막 날까지 조회에 들어갑니다. 같은 날이면 시각까지 비교해 순서가 뒤집히면 알립니다. <code>data-max=\"today\"</code> 처럼 날짜만 적은 범위는 그 하루 전체입니다.", html: `
        ${dpField({ id: "dp-time-range", label: "로그 조회 구간", time: true, range: true, value: "2026. 09. 07 09:00 ~ 2026. 09. 08 18:30" })}`, layout: "top" },
      { id: "max-days", title: "Max Days", desc: "<code>data-max-days</code> 로 기간의 최대 길이를 정합니다. 양끝을 포함한 일수이고 시각은 보지 않습니다. 달력에서 시작을 고르면 상한 밖의 날짜는 고를 수 없고, 상한보다 긴 프리셋은 꺼집니다. 키보드로 친 값은 받아서 <b>long</b> 으로 알립니다. 상한은 도움말에 적습니다.", html: `
        ${dpField({ id: "dp-max-days", label: "감사 로그 내보내기", range: true, attrs: 'data-max-days="31" data-presets="7 30 90"', value: "2026. 09. 01 ~ 2026. 09. 30", help: "최대 31일까지 내보낼 수 있습니다." })}`, layout: "top" },
      { id: "unit", title: "Unit", desc: "<code>data-unit</code> 으로 고르는 단위를 정합니다. <b>year</b> 는 <code>YYYY</code> 와 12년 연도 목록, <b>month</b> 는 <code>YYYY. MM</code> 과 월 목록, <b>day</b>(기본)는 <code>YYYY. MM. DD</code> 와 날짜 달력입니다. 확정 값(<code>data-value</code>)은 단위의 기계 형식(2026 · 2026-09 · 2026-09-07)입니다.", html: `
        ${dpField({ id: "dp-year", label: "보고 연도", unit: "year", value: "2026" })}
        ${dpField({ id: "dp-month", label: "보고서 월", unit: "month", value: "2026. 09" })}
        ${dpField({ id: "dp-day", label: "점검일", value: "2026. 09. 07" })}`, layout: "top" },
      { id: "calendar", title: "Calendar", desc: "열린 상태의 달력. 칸의 면은 모두 지름 34 원입니다 — 오늘(.today · aria-current, 옅은 brand 원 + 굵은 brand 글자), 선택(.on · aria-selected, brand 원), 포인터 · 누름(회색 원), 키보드 포커스(원 외곽선). 다른 달(.muted), 선택 불가(data-max 밖 · aria-disabled). 제목을 누르면 연 → 월로 빠르게 옮깁니다.", html: cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", max: "2026-09-30", footer: "today apply" }) },
      { id: "range-calendar", title: "Range Calendar", desc: "기간 달력은 두 달을 나란히 봅니다. 시작 · 끝은 .on(.start · .end), 사이는 .in-range. 시작만 고른 동안에는 포인터를 올린 날까지 미리 보여 주고(올린 날은 시작과 같은 brand 원), 적용은 끝을 고른 뒤에 켜집니다. 두 달 보기에서 다른 달 칸은 비워 같은 날짜가 두 번 나오지 않습니다.", html: cal({ month: "2026-09", mode: "range", start: "2026-09-21", end: "2026-10-07", today: "2026-10-07", footer: "apply", presets: "7 30" }) },
      { id: "min-max", title: "Min · Max", desc: "<code>data-min</code> · <code>data-max</code> 밖의 날짜는 달력에서 고를 수 없습니다(aria-disabled). 키보드로는 범위 밖 값도 들어갑니다 — 직접 치거나 ↑↓ 로 조각을 넘기면 값은 그 날짜로 남고, 오류 테두리와 원인 문구가 붙습니다(<code>data-validity=\"max\"</code>). 문구는 무엇이 일어났는지와 고칠 방법 두 부분이고, 범위는 '부터 · 까지'(그 날짜 포함)로 씁니다 — <code>data-messages</code>(JSON, React 는 <code>messages</code>)로 바꿉니다.", html: `
        ${dpField({ id: "dp-in", label: "점검일", value: "2026. 09. 07", help: "2026년 안의 날짜", attrs: 'data-min="2026-01-01" data-max="2026-12-31"' })}
        ${dpField({ id: "dp-out", label: "점검일", value: "2027. 01. 05", help: "날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.", cls: "error", invalid: true, attrs: 'data-min="2026-01-01" data-max="2026-12-31" data-help="2026년 안의 날짜"' })}`, layout: "top" },
      { id: "invalid", title: "Invalid Date", desc: "값이 늘 유효한 날짜는 아닙니다. 덜 친 날짜는 <b>incomplete</b>, 없는 날짜(2월 30일)는 <b>invalid</b> 로 남습니다 — 확정 값(<code>data-value</code>)은 비고 <code>ds:date</code> 의 <code>date</code> 는 Invalid Date 입니다. 오류는 Enter 를 누르거나 포커스가 필드를 떠날 때 보입니다.", html: `
        ${dpField({ id: "dp-incomplete", label: "시작일", value: "2026. 09", help: "날짜가 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.", cls: "error", invalid: true, attrs: 'data-help="점검을 시작한 날"' })}
        ${dpField({ id: "dp-invalid", label: "종료일", value: "2026. 02. 30", help: "날짜가 달력에 없습니다. 달력에서 고르거나 2026. 09. 07 처럼 입력하세요.", cls: "error", invalid: true, attrs: 'data-help="점검을 끝낸 날"' })}`, layout: "top" },
      { id: "locale", title: "Locale", desc: "<code>data-locale</code> 로 달력 표기 언어를 바꿉니다(기본 ko-KR). 제목 · 요일 · 월 이름 · 날짜 칸의 접근 이름 · '오늘' 버튼을 <code>Intl</code> 로 만들어, Intl 이 지원하는 언어는 따로 불러오지 않고 씁니다. Intl 에 없는 문구(적용 · 이전 달 · 다음 달 …)는 <code>data-labels</code>(JSON, React 는 <code>labels</code>)로 바꿉니다. 필드 입력 형식은 언어와 무관하게 YYYY. MM. DD 입니다.", html: `
        ${cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", locale: "en-US", footer: "today apply", labels: { dialog: "Choose date", apply: "Apply", prevMonth: "Previous month", nextMonth: "Next month", chooseYear: "choose year" } })}
        ${cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", locale: "ja-JP", footer: "today apply", labels: { dialog: "日付を選択", apply: "適用", prevMonth: "前の月", nextMonth: "次の月", chooseYear: "年を選択" } })}` },
      { id: "timezone", title: "Timezone", desc: "<code>data-timezone</code> 으로 '오늘'과 값의 기준 시간대를 정합니다(기본은 사용자 환경). dayjs 가 지원하는 IANA 이름과 UTC 를 그대로 씁니다 — ds.js 는 dayjs · utc · timezone 플러그인이 실린 페이지에서 계산하고, 확정 때 <code>ds:date</code> 의 <code>date</code> 로 그 시간대의 0시를 줍니다. 같은 순간이라도 뉴욕은 서울보다 하루 늦을 수 있어, '오늘까지'가 가리키는 날이 다릅니다.", html: `
        ${dpField({ id: "dp-utc", label: "UTC 기준", help: "UTC 의 오늘까지", attrs: 'data-timezone="UTC" data-max="today" data-footer="today apply"' })}
        ${dpField({ id: "dp-ny", label: "뉴욕 기준", help: "America/New_York 의 오늘까지", attrs: 'data-timezone="America/New_York" data-max="today" data-footer="today apply"' })}`, layout: "top" },
      { id: "footer", title: "Footer", desc: "하단 버튼은 data-footer 로 고릅니다 — 오늘 · 초기화 · 취소(열기 전 값으로) · 적용. none 이면 버튼 없이 고르는 순간 적용하고 닫힙니다(기간은 끝을 고를 때).", html: `
        ${dpField({ id: "dp-foot-all", label: "전체 버튼", value: "2026. 09. 07", attrs: 'data-footer="today reset cancel apply"' })}
        ${dpField({ id: "dp-foot-none", label: "바로 적용", attrs: 'data-footer="none"' })}
        ${dpField({ id: "dp-foot-range", label: "기간 바로 적용", range: true, attrs: 'data-footer="none"' })}`, layout: "top" },
      { id: "size", title: "Size", desc: "높이 32 · 40 · 48 — Text Field · Button 과 같습니다(.sm · .lg).", html: `
        ${dpField({ id: "dp-sm", label: "Small", cls: "sm" })}
        ${dpField({ id: "dp-md", label: "Medium" })}
        ${dpField({ id: "dp-lg", label: "Large", cls: "lg" })}`, layout: "top" },
      { id: "state", title: "State", desc: "비활성은 비활성 토큰으로 칠하고 달력을 열지 않습니다. 읽기 전용은 값만 보이고 달력을 열지 않습니다.", html: `
        ${dpField({ id: "dp-off", label: "비활성", value: "2026. 09. 07", disabled: true })}
        ${dpField({ id: "dp-ro", label: "읽기 전용", value: "2026. 09. 07", help: "정책이 정한 날짜", readonly: true })}`, layout: "top" },
    ],
    props: [[".datepicker.field", "container", "—", "Text Field 셸 — label + .affix(input + .cal-btn) + .help, 열면 .calendar. 열림은 .open, 위로 펼침은 .up"], ["data-unit", "day | month | year", "day", "입력 형식(YYYY. MM. DD · YYYY. MM · YYYY) · 달력 첫 화면 · 고르는 단위"], ["data-range", "boolean", "—", "기간(Date Range Picker). 달력 2개가 기본(일 단위). 월 · 연 단위는 칸 하나에 12개라 1개"], ["data-max-days", "number", "—", "기간의 최대 길이(양끝 포함 일수, 일 단위 기간만). 시작을 고르면 밖의 날짜를 막고 긴 프리셋을 끈다. 키보드 입력은 받아서 validity long. React <code>maxDays</code>"], ["data-time", "boolean | seconds", "—", "시각까지 입력(일 단위만). 필드 YYYY. MM. DD HH:mm · 값 YYYY-MM-DD HH:mm · 24시간제. seconds 면 초까지. 달력 아래 시각 칸이 생기고 적용 버튼은 늘 있다. React <code>time</code>"], ["data-value / data-start · data-end", "YYYY-MM-DD · YYYY-MM · YYYY · YYYY-MM-DD HH:mm(:ss)", "—", "확정 값(기계 형식). 미완성 · 없는 날짜면 비고, 범위 밖 · 순서 오류면 그 날짜가 남는다"], ["data-validity", "empty | incomplete | invalid | min | max | order | long | valid", "—", "ds.js 가 쓴다. 유효 · 빈 값도 적는다(React 와 같다)"], ["data-locale", "BCP 47 태그", "ko-KR", "달력 제목 · 요일 · 월 이름 · 접근 이름 · '오늘'(Intl). 입력 형식은 바뀌지 않는다"], ["data-labels", "JSON", "한국어", "Intl 이 만들지 못하는 문구 — dialog · apply · cancel · reset · today · prevMonth · nextMonth · prevYear · nextYear · prevYears · nextYears · chooseYear · yearGrid · backToDays · backToMonths · recent(\"최근 {n}일\") · time · startTime · endTime. 키는 React labels 와 같다. 오류 문구는 data-messages"], ["data-messages", "JSON", "한국어", "오류 문구 — incomplete · invalid · min · max · order 와 주어 subject(\"날짜가\") · startSubject(\"시작일이\") · endSubject(\"종료일이\"), 시각의 invalidTime · orderTime · timeSubject · startTimeSubject · endTimeSubject, 기간 상한의 long(자리표시 {days}). 자리표시 {subject} {example} {min} {max} 로 어순을 정한다 — 기간에서 한쪽만 틀리면 {subject} 가 그 쪽 이름. 자리표시가 없으면 옛 조합(앞말 + 예시 · 날짜 + 꼬리말). 키는 React messages 와 같다"], ["data-timezone", "IANA 이름 | UTC", "사용자 환경", "'오늘'과 ds:date 의 date(그 시간대 0시 — data-time 이면 그 시각). dayjs + utc · timezone 플러그인이 실린 페이지에서 계산한다"], ["data-min / data-max", "YYYY-MM-DD | today | YYYY-MM-DD HH:mm", "—", "밖의 날짜 · 월 · 연은 달력에서 aria-disabled. 키보드 입력은 막지 않고 오류로 알린다. data-time 에서 날짜만 적으면 그 하루 전체"], ["data-footer", "today reset cancel apply | none", "단일: today apply · 기간: apply", "none 이면 고르는 순간 적용"], ["data-calendars", "1 | 2", "기간 2", "기간 달력 수. 767px 이하 1"], ["data-presets", "\"7 30\"", "—", "기간 프리셋(최근 N일). 누르는 즉시 확정한다(적용 버튼과 별개). min/max 밖이면 비활성"], ["data-default-preset", "N", "—", "값이 없으면 오늘 기준 최근 N일을 처음 값으로(기간)"], ["data-today", "YYYY-MM-DD", "오늘", "정적 데모용"], [".sm / .lg", "size", "md", "필드 높이 32 / 40 / 48"], ["disabled / readonly", "attribute", "—", "input 과 .cal-btn 에. 읽기 전용은 값만 보이고 달력을 열지 않는다"], ["↑ ↓ · Alt+↓ · Enter", "keyboard", "—", "입력에서: 커서 조각 ±1(min/max 무시) · 달력 열기 · 검사와 확정"], [".calendar", "popover", "—", ".cal-head(.cal-nav · .cal-title) + .cal-grid[role=grid](.cal-week ×주 수 · .day 주 수×7, 28–42) + .cal-foot. 두 달은 .two > .cal-months > .cal-month ×2"], [".day.on · .start · .end · .in-range · .preview · .today · .muted", "state", "—", "선택 / 기간 양끝 / 사이 / 미리보기 / 오늘 / 다른 달"], [".cell.on · .in-range", "state", "—", "월 · 연 단위의 선택 / 기간 사이"], ["ds:date", "event", "—", "값이 바뀔 때. {value, date, text, validity} · 기간 {value:\"A ~ B\", start, end, date:{start, end}, text, validity, sides:{start, end}} — sides 는 쪽마다의 상태(empty · incomplete · invalid · min · max · valid)"]],
    spec: [["Size", "필드 32 · 40 · 48(Text Field 와 같다) · 기간 필드 최소 폭 300 · 달력 폭 296(두 달 606) · 패딩 20 · 헤더 아래 16 · 날짜 셀 높이 34 · 원 지름 34(선택 · 미리보기 끝 · 오늘 · hover · 누름 · 포커스) · 연/월 셀 40(둥근 사각형)"], ["Input", "YYYY. MM. DD — 숫자만 받아 끊어 채운다. 월 첫 자리 2~9 · 일 첫 자리 4~9 는 앞에 0. 시각은 HH:mm(:ss) — 시 첫 자리 3~9 · 분과 초 첫 자리 6~9 는 앞에 0"], ["Time", "달력 아래 12 · Text Field sm · 칸 사이 12 · 기간 필드 최소 폭 410(초까지 450)"], ["Container", "달력 radius/lg 8 · shadow/2 · 기간 띠는 선택 원의 가운데까지 이어진다"], ["Label", "제목 16 SemiBold · 요일 12 SemiBold tertiary · 날짜 · 연/월 13 Regular · 필드 Body/2 14"], ["Placement", "필드 아래 4px. 아래 자리가 모자라고 위가 더 넓으면 필드 위 4px"], ["Focus", "입력 포커스와 달력이 열린 동안은 필드 링(테두리 brand 1px + 후광 4px, 오류 필드는 빨강) — 아이콘으로 열어도 같다. 달력 버튼에 Tab 으로만 오면 버튼 외곽선만"]],
    figma: { frame: "Date Picker", radius: "radius/lg", sizes: { sm: { h: 32 }, md: { h: 40 }, lg: { h: 48 }, calendar: { w: 296 }, day: { h: 34 }, cell: { h: 40 } }, variants: { single: {}, range: { band: "--surface-brand-subtle-strong", endpoint: "--surface-brand-primary" }, month: {}, year: {}, input: {}, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" }, error: { stroke: "--foreground-negative-primary", ring: "--line-negative-focus" }, disabled: { bg: "--surface-disable-primary", fg: "--foreground-disable-primary" } }, states: ["closed", "focused", "open", "selected", "range", "preview", "error", "disabled", "read-only"] },
  },


  /* ------------------------------------------------ Checkbox */
  "checkbox": {
    status: "ready", react: ["Checkbox","CheckboxGroup"], css: [".checkbox", ".checkbox-group"], borrows: [".t-label-1", ".field", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "여러 항목 중 0개 이상을 선택합니다. 네이티브 input 을 그대로 쓰고 외형만 CSS 로 바꿔 키보드·스크린리더가 동작합니다.",
    principles: [
      ["언제 쓰는가", "저장 전까지 반영되지 않는 선택입니다. 누르는 즉시 적용되면 <a href=\"#/components/switch\">Switch</a> 입니다"],
      ["전체 선택", "자식이 전부 선택이면 체크, 일부면 부분 선택, 하나도 없으면 해제입니다. 부분 선택에서 누르면 전부 선택합니다"],
      ["필수 그룹", "<code>fieldset[data-required]</code> 는 하나 이상 골라야 합니다. 제출할 때 알리고, 고르면 바로 지웁니다. 지나가기만 하면 알리지 않고, 마지막 하나를 풀면 바로 알립니다"],
      ["라벨", "끝에 마침표를 찍지 않습니다. 선택하면 일어날 일을 긍정형으로 씁니다"],
      ["표의 행 선택", "행마다 다른 접근 이름을 줍니다(외부 USB 차단 선택). 전부 '선택' 이면 어느 행인지 들리지 않습니다"],
    ],
    thumb: `${cb("이메일 알림", "checked")}${cb("SMS 알림")}`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 상태입니다.", html: `<label class="checkbox"><input type="checkbox"><span>정책 배포 시 알림</span></label>` },
      { id: "state", title: "State", desc: "Unchecked · Checked · Indeterminate(부분 선택, JS 로 indeterminate=true 또는 .mixed) · Disabled.", html: `
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
      { id: "desc", title: "With Description", desc: "선택의 결과를 small 로 설명합니다.", html: `
        <div class="checkbox-group">
          ${cb("정책 배포 시 알림", "checked", "배포가 완료되면 관리자 메일로 알립니다")}
          ${cb("주간 리포트 수신", "", "매주 월요일 09:00 에 발송")}
        </div>` },
      { id: "group", title: "Group", desc: "세로 기본, 짧은 항목은 .row 로 가로 배치. 전체 선택은 Indeterminate 와 함께.", html: `
        <div class="checkbox-group">
          ${cb("<b>전체 선택</b>", 'class="mixed"')}
          <div class="checkbox-group row" style="padding-left:24px">${cb("Critical", "checked")}${cb("High", "checked")}${cb("Medium")}${cb("Low")}${cb("Info")}</div>
        </div>` },
      { id: "form", title: "필수 그룹", desc: "<code>.field</code> 안 <code>fieldset.checkbox-group[data-required]</code>. 저장을 누르면 첫 칸으로 포커스가 가고, 고르면 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><fieldset class="checkbox-group" data-required><legend class="t-label-1">알림 채널 <em>*</em></legend>${cb("이메일")}${cb("SMS")}${cb("콘솔 알림")}</fieldset><span class="help" aria-live="polite">하나 이상 선택합니다.</span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>`, layout: "tall top" },
    ],
    props: [[".checkbox", "label wrapper", "—", "input[type=checkbox] + span(라벨, small 설명)"], ["checked / disabled", "attribute", "—", "네이티브 상태"], [".mixed", "boolean", "false", "부분 선택 외형(JS indeterminate 대체)"], [".checkbox-group", "container", "—", "세로 12px 간격. .row 로 가로 24px. fieldset + legend 로 질문을 붙인다"], ["data-required", "attribute", "—", ".field 안 fieldset.checkbox-group — 하나 이상 골라야 한다(form[data-validate])"]],
    spec: [["Size", "박스 16 · 라벨 Body/2 14 · 클릭 영역 라벨 포함"], ["Container", "radius/sm 4 · line/neutral/primary 1.5px · 선택 brand"], ["Label", "Body/2 14 · 설명 12 Regular tertiary"], ["Placement", "폼 옵션, 테이블 행 선택(.tbl .check)"]],
    figma: { frame: "Checkbox", radius: "radius/sm", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--line-neutral-primary" }, checked: { bg: "--surface-brand-primary" } }, states: ["unchecked", "checked", "indeterminate", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Chip */
  "chip": {
    status: "ready", react: ["Chip","ChipGroup"], css: [".chip", ".chip-group"], borrows: [".btn"],
    desc: "필터 조건이나 입력된 값을 작은 캡슐로 보여줍니다. 선택 가능한 Filter Chip 과 삭제 가능한 Input Chip 을 구분합니다. 상태 표시는 Tag 를 씁니다.",
    principles: [
      ["언제 쓰는가", "Filter Chip 은 목록을 좁히는 조건, Input Chip 은 입력한 값입니다. 상태 · 분류 표시는 <a href=\"#/components/tag\">Tag</a> 입니다"],
      ["넘칠 때", "한 줄을 넘으면 다음 줄로 내려갑니다. <code>+N</code> 으로 접지 않아 조건이 전부 보입니다"],
      ["필터 초기화", "필터 칩이 2개 이상이면 묶음 끝에 '필터 초기화'를 둡니다. 켜진 칩이 있을 때만 보이고, 누르면 포커스는 첫 칩으로 갑니다"],
      ["지운 뒤 포커스", "다음 칸으로, 없으면 앞 칸으로 옮깁니다. 칸이 하나도 남지 않으면 묶음 자신입니다"],
      ["긴 값", "값은 240px 에서 말줄임합니다. 지우기 버튼에 포커스가 오면 펼치고, 접근 이름에 전체 값이 들어갑니다"],
    ],
    thumb: `<button class="chip on" aria-pressed="true">Critical</button><button class="chip" aria-pressed="false">High</button><button class="chip" aria-pressed="false">Medium</button>`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 칩입니다.", html: `<button type="button" class="chip" aria-pressed="false">Critical</button>` },
      { id: "filter", title: "Filter Chip", desc: "토글 선택. 묶음 끝의 필터 초기화는 켜진 칩이 있을 때만 보입니다. aria-pressed 가 있는 칩은 체크 아이콘을 항상 두고(비활성 색), 선택되면 .on 으로 색만 바뀌어 폭이 흔들리지 않습니다.", html: `
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
      { id: "input", title: "Input Chip", desc: "입력된 값(IP, 태그, 수신자). .x 는 진짜 버튼이고 접근 이름에 값이 들어갑니다. 지우면 다음 칸으로 포커스가 갑니다.", html: `
        <div class="chip-group">
          <span class="chip"><span class="lbl">10.0.0.12</span><button type="button" class="x" aria-label="10.0.0.12 삭제">${I("x",10)}</button></span>
          <span class="chip"><span class="lbl">10.0.0.13</span><button type="button" class="x" aria-label="10.0.0.13 삭제">${I("x",10)}</button></span>
          <span class="chip"><span class="lbl">192.168.1.0/24</span><button type="button" class="x" aria-label="192.168.1.0/24 삭제">${I("x",10)}</button></span>
          <button type="button" class="chip">${I("plus")}추가</button>
        </div>` },
      { id: "size", title: "Size / Disabled", desc: "비활성. 입력값 칩(span)은 disabled 속성을 못 가져 aria-disabled=\"true\" 로 쓰고, 삭제(x)는 disabled 입니다.", html: `
        <button type="button" class="chip sm on" aria-pressed="true">Small</button>
        <button type="button" class="chip on" aria-pressed="true">Default</button>
        <button type="button" class="chip" aria-pressed="false" disabled>Disabled</button>
        <span class="chip" aria-disabled="true"><span class="lbl">10.0.0.12</span><button type="button" class="x" aria-label="10.0.0.12 삭제" disabled>${I("x",10)}</button></span>` },
      { id: "long", title: "긴 값", desc: "값은 240px 에서 말줄임합니다. 지우기 버튼에 포커스가 오면 펼쳐지고, 마우스는 title 로 전체를 봅니다.", html: `
        <div class="chip-group">
          <span class="chip"><span class="lbl" title="security-audit-notification@corp.example.com">security-audit-notification@corp.example.com</span><button type="button" class="x" aria-label="security-audit-notification@corp.example.com 삭제">${I("x",10)}</button></span>
          <span class="chip"><span class="lbl">admin@example.com</span><button type="button" class="x" aria-label="admin@example.com 삭제">${I("x",10)}</button></span>
        </div>` },
    ],
    props: [[".chip", "button | span", "—", "선택형은 button, 입력값은 span"], [".on", "boolean", "false", "선택 상태(brand subtle + 체크)"], [".lbl", "element", "—", "Input Chip 의 값. 240px 에서 말줄임"], [".x", "button", "—", "삭제 버튼(Input Chip · Combobox 다중 선택 항목). 면 없이 x 만, aria-label 에 값을 넣는다"], ["data-chip-reset", "attribute", "—", ".chip-group 끝 버튼 — 켜진 칩이 있을 때만 보이고 누르면 모두 끈다(ds:chip-reset)"], ["size", "(md) | sm", "md", "높이 32 / 26"], ["disabled", "attribute", "—", "비활성. 입력값 칩(span)은 aria-disabled=\"true\""]],
    spec: [["Size", "높이 32 (sm 26) · padding 0 12"], ["Container", "radius/full · line/neutral/primary · 선택 brand subtle"], ["Label", "Label/2 12"], ["Remove", "x 16 · 아이콘 10 · 면 없음 · foreground/neutral/secondary(hover primary)"], ["Placement", "검색 아래 필터 행, 입력 필드 안 값 목록"]],
    figma: { frame: "Chip", radius: "radius/full", sizes: { md: { h: 32 }, sm: { h: 26 } }, variants: { filter: { stroke: "--line-neutral-primary" }, selected: { bg: "--surface-brand-subtle", stroke: "--surface-brand-primary", fg: "--surface-brand-primary" }, input: {} }, states: ["default", "selected", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Radio Button */
  "radio-button": {
    status: "ready", react: ["Radio","RadioGroup"], css: [".radio", ".radio-group"], borrows: [".t-label-1", ".card", ".field", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "여러 항목 중 정확히 하나를 고릅니다. 옵션이 5개를 넘으면 <a href=\"#/components/select\">Select</a> 를 씁니다.",
    principles: [
      ["언제 쓰는가", "2~5개 중 하나이고 모두 보여야 할 때입니다. 6개 이상이면 <a href=\"#/components/select\">Select</a>, 즉시 보기만 바뀌면 <a href=\"#/components/select-button\">Select Button</a> 입니다"],
      ["기본값", "가장 안전한 쪽을 미리 고릅니다. 보안 · 개인정보 · 결제가 걸린 고위험 옵션은 미리 선택하지 않습니다. 안전한 기본값이 없으면 비워 두고 필수로 받습니다"],
      ["순서", "가능성이 높은 것, 단순한 것, 위험이 낮은 것부터 놓습니다"],
      ["범위 옵션", "겹치거나 빠지는 구간이 없어야 합니다. 전부 나열할 수 없으면 '기타'를 둡니다"],
      ["필수 그룹", "<code>fieldset[data-required]</code> 는 제출할 때 알리고, 고르면 바로 지웁니다"],
    ],
    thumb: `<label class="radio"><input type="radio" name="t" checked><span>차단</span></label><label class="radio"><input type="radio" name="t"><span>허용</span></label>`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 상태입니다.", html: `<label class="radio"><input type="radio" name="rd"><span>표준 모드</span></label>` },
      { id: "state", title: "State", html: `
        <label class="radio"><input type="radio" name="r1"><span>Unchecked</span></label>
        <label class="radio"><input type="radio" name="r1" checked><span>Checked</span></label>
        <label class="radio"><input type="radio" name="r2" disabled><span>Disabled</span></label>
        <label class="radio"><input type="radio" name="r3" checked disabled><span>Disabled checked</span></label>` },
      { id: "group", title: "Group", desc: "같은 name 으로 묶고 fieldset/legend 로 질문을 붙입니다. 설명은 small.", html: `
        <fieldset class="radio-group">
          <legend class="t-label-1">탐지 시 동작</legend>
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
              <legend className="t-label-1">탐지 시 동작</legend>
              {ACTIONS.map(([k, label]) => (
                <label key={k} className="radio">
                  <input type="radio" name="act" value={k} checked={v === k} onChange={() => setV(k)} />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          );
        }` },
      { id: "card", title: "Card Radio", desc: "옵션마다 설명이 길거나 비교가 필요할 때 카드형.", html: `
        <div class="radio-group row">
          <label class="radio card"><input type="radio" name="plan" checked><span>표준 모드<small>권장. 알려진 위협 차단</small></span></label>
          <label class="radio card"><input type="radio" name="plan"><span>강화 모드<small>의심 행위까지 차단, 오탐 증가</small></span></label>
        </div>` },
      { id: "form", title: "필수 그룹", desc: "권한이 걸린 선택이라 미리 고르지 않았습니다. 저장을 누르면 첫 칸으로 포커스가 가고, 고르면 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><fieldset class="radio-group" data-required><legend class="t-label-1">격리 해제 권한 <em>*</em></legend>
            <label class="radio"><input type="radio" name="rf" required><span>보안 관리자만</span></label>
            <label class="radio"><input type="radio" name="rf" required><span>보안 · 운영 관리자</span></label>
            <label class="radio"><input type="radio" name="rf" required><span>모든 관리자</span></label>
          </fieldset><span class="help" aria-live="polite"></span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>`, layout: "tall top" },
    ],
    props: [[".radio", "label wrapper", "—", "input[type=radio] + span(라벨, small)"], ["name", "attribute", "—", "같은 그룹은 같은 name"], [".card", "boolean", "false", "카드형(보더 + 선택 시 brand)"], [".radio-group", "container", "—", "세로 12px. .row 로 가로. fieldset + legend 로 질문을 붙인다"], ["data-required", "attribute", "—", ".field 안 fieldset.radio-group — 하나를 골라야 한다(form[data-validate])"]],
    spec: [["Size", "원 16 · 선택 내부 점 8"], ["Container", "radius/full · line/neutral/primary 1.5px"], ["Label", "Body/2 14 · 설명 12 Regular tertiary"], ["Placement", "폼의 배타 옵션, 설정의 동작 선택"]],
    figma: { frame: "Radio Button", radius: "radius/full", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--line-neutral-primary" }, checked: { stroke: "--surface-brand-primary" }, card: { stroke: "--line-neutral-secondary" } }, states: ["unchecked", "checked", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Switch */
  "switch": {
    status: "ready", react: ["Switch"], css: [".switch"], borrows: [".settings-section", ".setting"],
    desc: "설정을 켜고 끕니다. 토글 즉시 적용되며 저장 버튼이 없습니다. 저장이 필요한 폼 안에서는 Checkbox 를 씁니다.",
    principles: [
      ["언제 쓰는가", "누르면 바로 적용되는 켜기 · 끄기입니다. 저장 버튼이 있는 폼에서는 <a href=\"#/components/checkbox\">Checkbox</a> 입니다"],
      ["언제 바뀌는가", "서버를 거치면 응답을 받은 뒤에 바뀝니다. 보안 설정이 실제와 다르게 보이는 순간을 만들지 않습니다"],
      ["처리 중", "노브에 스피너를 띄우고 다시 누를 수 없게 막습니다. 포커스는 그 자리에 남습니다"],
      ["실패", "상태를 바꾸지 않고 이유를 닫을 때까지 남는 Toast 로 알립니다"],
      ["보안 기능을 끌 때", "<a href=\"#/foundations/interaction\">Interaction</a> 의 위험 동작 표대로 Popup 으로 확인한 뒤 처리합니다. 취소하면 조용히 그대로 둡니다"],
      ["라벨", "켜짐 · 꺼짐에 따라 바꾸지 않습니다. 상태를 말하지 않고 켜지는 대상을 씁니다(실시간 보호)"],
      ["비활성", "왜 바꿀 수 없는지 설명 자리에 적습니다. 비활성 요소에는 Tooltip 을 달지 않습니다"],
      ["표 안", "'사용' 열의 Switch 는 행마다 다른 접근 이름을 줍니다(외부 USB 차단 사용)"],
    ],
    thumb: `<label class="switch"><input type="checkbox" role="switch" checked><span>실시간 보호</span></label>`,
    examples: [
      { id: "default", title: "Default", desc: "꺼진 기본 상태입니다.", html: `<label class="switch"><input type="checkbox" role="switch"><span>실시간 보호</span></label>` },
      { id: "state", title: "State", desc: "input[type=checkbox] 에 role=switch. Off · On · Disabled.", html: `
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
      { id: "async", title: "처리 중 · 실패", desc: "<code>data-async</code> 는 눌러도 바로 바뀌지 않고 처리 중이 됩니다. 제품이 <code>ds:switch</code> 의 <code>resolve()</code> · <code>reject(문구)</code> · <code>cancel()</code> 중 하나를 부릅니다. 이 예제는 0.9초 뒤 응답하고, 둘째는 실패를 보여 줍니다(<code>data-demo-fail</code> 은 문서 전용).", html: `
        <label class="switch" data-async><input type="checkbox" role="switch" checked><span>실시간 보호</span></label>
        <label class="switch" data-async data-demo-fail><input type="checkbox" role="switch"><span>USB 자동 검사</span></label>
        <label class="switch" data-async><input type="checkbox" role="switch" checked aria-busy="true" aria-disabled="true"><span>웹 필터</span></label>` },
      { id: "size", title: "Size / Label Position", desc: "테이블 셀·밀도 높은 목록은 .sm. 설정 행에서는 라벨을 왼쪽에(.label-left).", html: `
        <label class="switch sm"><input type="checkbox" role="switch" checked><span>Small</span></label>
        <label class="switch label-left"><input type="checkbox" role="switch" checked><span>라벨 왼쪽</span></label>` },
      { id: "settings", title: "In Settings", desc: "정책 설정 행. 라벨·설명은 왼쪽, 스위치는 오른쪽 끝. 바꿀 수 없으면 이유를 설명 자리에 적습니다.", html: `
        <div class="settings-section" style="max-width:560px">
          <div class="setting"><div class="info"><b>실시간 보호</b><span>파일 실행 시 즉시 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="실시간 보호"></label></div></div>
          <div class="setting"><div class="info"><b>USB 자동 검사</b><span>연결된 저장장치를 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" aria-label="USB 자동 검사"></label></div></div>
          <div class="setting"><div class="info"><b>원격 제어</b><span>보안 관리자만 바꿀 수 있습니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" disabled aria-label="원격 제어"></label></div></div>
        </div>`, layout: "left" },
    ],
    props: [[".switch", "label wrapper", "—", "input[type=checkbox][role=switch] + span"], ["checked / disabled", "attribute", "—", "네이티브 상태"], ["size", "(md) | sm", "md", "44×24 / 36×20"], [".label-left", "boolean", "false", "라벨을 왼쪽에"], ["data-async", "attribute", "—", "응답 후 반영. 눌러도 바뀌지 않고 처리 중이 되며 ds:switch 를 낸다 — 제품이 resolve() · reject(문구) · cancel() 중 하나를 불러야 끝난다"], ["aria-busy", "attribute", "—", "처리 중(ds.js 가 넣는다). 노브 스피너, 조작 막음"]],
    spec: [["Size", "트랙 44×24 (sm 36×20) · 노브 20"], ["Container", "radius/full · off line/neutral/primary · on brand"], ["Label", "Body/2 14"], ["Placement", "설정 행 우측 끝, 테이블 '사용' 열"]],
    figma: { frame: "Switch", radius: "radius/full", sizes: { md: { w: 44, h: 24 }, sm: { w: 36, h: 20 } }, variants: { off: { bg: "--line-neutral-primary" }, on: { bg: "--surface-brand-primary" } }, states: ["off", "on", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Tag */
  "tag": {
    status: "ready", react: ["Tag","TagGroup"], css: [".tag", ".tag-group", ".tag-more"], borrows: [".tooltip-wrap", ".tooltip", ".tbl-wrap", ".tbl"],
    desc: "상태·분류·심각도를 짧게 표시합니다. 색만이 아니라 라벨 텍스트로도 의미를 전달합니다. 선택·삭제가 필요하면 Chip 을 씁니다.",
    principles: [
      ["톤", "의미 색은 정해진 심각도 · 상태 어휘에만 씁니다. 사용자가 만든 라벨은 중립 또는 accent 입니다."],
      ["색", "색은 틴트와 같은 색상의 진한 글자(<code>--foreground-*-heavy</code>)가 나릅니다. 점은 기본으로 없고, 필요할 때 <code>.dot</code> 으로 켭니다. 라벨 글자가 늘 등급 이름이라 색만으로 뜻을 전하지 않습니다."],
      ["라벨", "1~2단어로 씁니다. 사용자가 짓는 라벨은 입력에서 글자 수를 제한합니다. 폭 160 을 넘으면 줄바꿈합니다. 포커스를 받지 않아 잘라 내면 읽을 길이 없습니다."],
      ["누를 수 없음", "Tag 는 표시 전용입니다. 선택 · 삭제는 Chip 을 씁니다."],
      ["여러 개", "표 칸은 앞 2개와 <code>+N</code> 을 보이고 나머지는 Tooltip 으로 보여 줍니다. <code>+N</code> 은 포커스를 받는 버튼입니다. 표 밖에서는 줄바꿈해 전부 보입니다."],
    ],
    thumb: `<span class="tag critical">Critical</span><span class="tag medium">Medium</span><span class="tag ok">정상</span>`,
    examples: [
      { id: "default", title: "Default", desc: "의미 색을 지정하지 않은 중립 태그입니다.", html: `<span class="tag">Tag</span>` },
      { id: "severity", title: "Severity", desc: "위협 심각도 5단계. 색은 상태·강조 의도 매핑입니다 — Critical=negative · High=cautionary · Medium=accent light blue · Low=accent lime · Info=중립. 글자는 틴트와 같은 색상의 진한 톤(<code>--foreground-*-heavy</code>)이고 점은 없습니다.", html: `
        <span class="tag critical">Critical</span>
        <span class="tag high">High</span>
        <span class="tag medium">Medium</span>
        <span class="tag low">Low</span>
        <span class="tag info">Info</span>
        ` },
      { id: "status", title: "Status", desc: "작업·시스템 상태. 성공 ok, 대기 pending(청록 — 심각도 Medium 과 나눠 쓰지 않습니다), 실패 high, 중립 기본.", html: `
        <span class="tag ok">승인</span>
        <span class="tag pending">검토 대기</span>
        <span class="tag high">반려</span>
        <span class="tag">보관</span>
        <span class="tag accent">신규</span>` },
      { id: "style", title: "Style", desc: "Outline · Solid(강조) · Dot(글자 앞 점 — 선택).", html: `
        <span class="tag critical outline">Critical</span>
        <span class="tag medium outline">Medium</span>
        <span class="tag critical solid">Critical</span>
        <span class="tag ok solid">정상</span>
        <span class="tag critical dot">Critical</span>
        <span class="tag ok dot">정상</span>` },
      { id: "size", title: "Size", desc: "sm 은 테이블 밀도 높은 셀, lg 는 상세 패널 제목 옆.", html: `
        <span class="tag high sm">High</span>
        <span class="tag high">High</span>
        <span class="tag high lg">High</span>` },
      { id: "group", title: "Group", desc: "표 밖에서는 줄바꿈해 전부 보입니다. 사용자가 만든 라벨은 중립 또는 accent 입니다.", html: `
        <div class="tag-group" style="max-width:240px"><span class="tag">내부망</span><span class="tag">재택 근무</span><span class="tag">외부 협력사</span><span class="tag">서버실</span><span class="tag">임원</span><span class="tag accent">신규</span></div>` },
      { id: "table", title: "In Table", desc: "표 칸은 행 높이를 지키려고 앞 2개와 <code>+N</code> 을 보입니다. 키보드로 <code>+N</code> 에 오면 나머지가 Tooltip 으로 뜹니다.", html: `
        <div class="tbl-wrap" style="max-width:480px"><table class="tbl compact"><thead><tr><th>정책</th><th>분류</th></tr></thead><tbody>
          <tr><td>외부 USB 차단</td><td><div class="tag-group"><span class="tag">내부망</span><span class="tag">재택 근무</span><span class="tooltip-wrap"><button type="button" class="tag tag-more" aria-label="분류 3개 더 보기" aria-describedby="tm-1">+3</button><span class="tooltip" role="tooltip" id="tm-1">외부 협력사, 서버실, 임원</span></span></div></td></tr>
          <tr><td>웹 필터 기본</td><td><div class="tag-group"><span class="tag">전사</span></div></td></tr>
        </tbody></table></div>` },
    ],
    props: [[".tag-group", "container", "—", "여러 개를 묶음. 표 밖 줄바꿈, 표 칸 한 줄. React TagGroup max 는 앞 n개 + +N"], [".tag-more", "button", "—", "표 칸의 +N. .tooltip-wrap 안에 두고 나머지를 Tooltip 으로"], ["tone", "critical | high | medium | low | info | ok | pending | accent | (neutral)", "neutral", "의미별 색. 심각도 5단계는 critical · high · medium · low · info, pending 은 상태 톤(검토 대기)입니다. 바탕은 틴트(<code>--surface-{negative|cautionary|…}-primary</code>)이고 <b>글자는 같은 색상의 진한 톤</b>(<code>--foreground-{negative|cautionary|accent-light-blue|accent-lime|accent-cyan|positive}-heavy</code> · info 는 neutral-secondary · accent 는 brand-primary)입니다. <code>.solid</code> 는 한 단계 강한 틴트 + 테두리입니다(기준 시스템에 솔리드 상태 면이 없습니다). 라벨 색을 직접 지정하지 마세요"], ["style", ".outline | .solid", "subtle", "아웃라인 / 채움"], [".dot", "boolean", "false", "글자 앞 점(등급 색). 기본은 점 없음 — 옛 <code>.plain</code> 은 없어졌습니다"], ["size", "sm | (md) | lg", "md", "폰트는 12 고정이고 padding 으로 높이만 21 / 25 / 29"]],
    spec: [["Max width", "160 — 넘으면 줄바꿈(잘라 내지 않음)"], ["Size", "높이 25 (sm 21 · lg 29) · padding 3/10 (sm 1/8 · lg 5/12)"], ["Container", "radius/full · 기본형은 <code>--surface-{…}-primary</code> 틴트, <code>.solid</code> 는 같은 틴트 + <code>--line-{…}</code> 테두리(Critical 만 <code>--surface-negative-strong</code>)"], ["Label", "12 SemiBold (세 사이즈 공통) · 같은 색상의 진한 톤 <code>--foreground-*-heavy</code>(라이트 30 · Low 20 / 다크 60) · 점은 <code>.dot</code> 일 때만 6"], ["Placement", "테이블 셀, 카드 헤더, 상세 패널 제목 옆"]],
    figma: { frame: "Tag", radius: "radius/full", sizes: { sm: { h: 21 }, md: { h: 25 }, lg: { h: 29 } }, variants: { critical: { bg: "--surface-negative-primary", fg: "--foreground-negative-strong", solidBg: "--surface-negative-strong", solidFg: "--foreground-neutral-primary" }, high: { bg: "--surface-cautionary-primary", fg: "--foreground-cautionary-primary", solidBg: "--surface-cautionary-primary", solidFg: "--foreground-neutral-primary" }, medium: { bg: "--surface-accent-light-blue", fg: "--foreground-accent-light-blue", solidBg: "--surface-accent-light-blue", solidFg: "--foreground-neutral-primary" }, low: { bg: "--surface-accent-lime", fg: "--foreground-accent-lime", solidBg: "--surface-accent-lime", solidFg: "--foreground-neutral-primary" }, info: { bg: "--surface-neutral-strong", fg: "--foreground-inactive-primary", solidBg: "--surface-neutral-strong", solidFg: "--foreground-neutral-primary" }, pending: { bg: "--surface-accent-cyan", fg: "--foreground-accent-cyan", solidBg: "--surface-accent-cyan", solidFg: "--foreground-neutral-primary" }, ok: { bg: "--surface-positive-primary", fg: "--foreground-positive-primary", solidBg: "--surface-positive-primary", solidFg: "--foreground-neutral-primary" }, accent: { bg: "--surface-brand-subtle", fg: "--foreground-brand-primary", solidBg: "--surface-brand-primary", solidFg: "--brand-label" }, neutral: { bg: "--surface-neutral-strong", fg: "--foreground-inactive-primary" } }, states: ["subtle", "outline", "solid"] },
  },

  /* ------------------------------------------------ Dropdown (액션 메뉴) · Select (값 선택) — 같은 .dropdown CSS 를 쓰지만 용도가 달라 페이지를 나눈다 */
  "dropdown": {
    status: "ready", react: ["Dropdown","DropdownTrigger","Menu","MenuItem","MenuSep","MenuLabel"], css: [".dropdown", ".menu", ".menu-item", ".menu-sep", ".menu-label"], borrows: [".btn"],
    desc: "더 보기(⋯) 같은 트리거에서 <b>실행할 액션</b>을 모아 보여줍니다. 값을 고르는 경우에는 <a href=\"#/components/select\">Select</a> 를 씁니다.",
    principles: [
      ["언제 쓰는가", "실행할 동작이 3~15개일 때입니다. 1~2개는 버튼으로 바로 보이게 둡니다. 16개를 넘으면 화면으로 옮깁니다. 값을 고르면 <a href=\"#/components/select\">Select</a> 입니다"],
      ["항목 글", "동작은 동사(편집 · 내보내기), 이동은 명사(감사 로그)로 씁니다"],
      ["위험 항목", "맨 아래, 구분선 뒤에 둡니다. 되돌리기 어려우면 <a href=\"#/foundations/interaction\">Interaction</a> 의 위험 동작 표대로 Popup 으로 확인합니다"],
      ["표의 행 동작", "1~2개면 버튼으로, 3개 이상이면 ⋯ 로 묶습니다. 스크롤 영역 안의 메뉴는 화면 기준으로 띄워 잘리지 않고, 스크롤하면 닫힙니다"],
      ["이동 항목", "<code>a.menu-item</code>(React <code>href</code>)으로 진짜 링크를 씁니다. 새 탭 열기와 주소 복사가 됩니다"],
      ["선택 표시", "쓰지 않습니다. 메뉴는 실행만 합니다. 현재 값을 보여 줘야 하면 Select · Select Button 입니다"],
      ["하위 메뉴", "만들지 않습니다. 항목이 많으면 그룹 라벨로 나누거나 화면으로 옮깁니다"],
      ["비활성 항목", "권한 때문에 못 쓰면 <code>aria-disabled</code> 와 함께 <code>.hint</code> 에 이유를 적습니다"],
      ["키보드", "열면 첫 항목으로 포커스가 갑니다. ↑↓ Home End 로 옮기고, 글자를 치면 그 글자로 시작하는 항목으로 갑니다. Esc 는 닫고 트리거로, Tab 은 닫고 다음 칸으로 갑니다"],
    ],
    thumb: `<div class="dropdown open" style="height:60px"><ul class="menu" style="position:static;min-width:120px"><li class="menu-item">편집</li><li class="menu-item danger">삭제</li></ul></div>`,
    examples: [
      { id: "default", title: "Default", desc: "닫힌 기본 상태입니다. 더 보기 버튼을 누르면 액션 목록이 열립니다.", html: `
        <div class="dropdown">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("copy")}복제</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
          </ul>
        </div>` },
      { id: "menu", title: "Action Menu", desc: "더 보기(⋯) 버튼에서 여는 액션 목록. 그룹 라벨·구분선·위험 액션.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-label">정책</li>
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "states", title: "Item States", desc: "기본 · 위험(.danger) · 비활성(aria-disabled). 아이콘은 기본이 tertiary 이고, 위험 · 비활성에서는 글자색을 따릅니다.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
            <li class="menu-item" role="menuitem" aria-disabled="true">${I("share")}공유<span class="hint">권한 없음</span></li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "disabled", title: "Disabled", desc: "권한이 없어 열 수 없는 상태입니다.", html: `
        <div class="dropdown"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false" disabled>${I("dots")}</button></div>` },
      { id: "links", title: "이동 항목", desc: "다른 화면으로 가는 항목은 진짜 링크입니다. li[role=none] 안에 a.menu-item 을 둡니다.", html: `
        <div class="dropdown">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button>
          <ul class="menu" role="menu">
            <li role="none"><a class="menu-item" role="menuitem" href="#">정책 상세</a></li>
            <li role="none"><a class="menu-item" role="menuitem" href="#">감사 로그</a></li>
            <li class="menu-item" role="menuitem">복제</li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">삭제</li>
          </ul>
        </div>`, layout: "tall top" },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open. inline-block 이라 상자 높이가 놓인 곳의 글자 크기를 따른다(트리거 버튼 · 메뉴 항목 글자는 따로 정해져 있다)"], [".menu", "ul", "—", "role=menu. 우측 정렬은 left:auto;right:0"], [".menu-item", "li · a", "—", "role=menuitem. .danger 위험, aria-disabled 비활성, .hint 단축키 · 비활성 이유. 이동 항목은 li[role=none] 안에 a. 아이콘은 기본이 tertiary 이고 .danger · 비활성에서는 글자색을 따릅니다"], [".menu-sep / .menu-label", "li", "—", "구분선 / 그룹 라벨"]],
    spec: [["Size", "항목 높이 38.4 · 메뉴 폭은 트리거 폭 이상에서 항목 글자에 맞춘다"], ["Container", "radius/md 6 · shadow/2 · 트리거 아래 4px"], ["Label", "항목 Body/2 14 · 그룹 라벨 12 SemiBold uppercase tertiary · 힌트 12 tertiary"], ["Placement", "테이블 행 액션·카드 헤더(우측 정렬 메뉴) · 아래 공간이 모자라면 위로 뒤집어 연다(.up) · 스크롤 영역 안이면 화면 기준으로 띄운다(.float)"]],
    figma: { frame: "Dropdown", radius: "radius/md", sizes: { item: { h: 36 } }, variants: { menu: {} }, states: ["closed", "open", "disabled"] },
  },

  /* ------------------------------------------------ Select */
  "select": {
    status: "ready", react: ["Select"], css: [".dropdown", ".menu", ".menu-item", ".menu-state"], borrows: [".field", ".help", ".spinner", ".btn", ".form", ".form-legend", ".form-actions", ".menu-label"],
    desc: "옵션 목록을 열어 <b>하나를 고릅니다</b>. 옵션이 5개 이하이고 항상 보여야 하면 Radio · Select Button, 찾아야 하거나 여러 개를 고르면 <a href=\"#/components/combobox\">Combobox</a>, 고르는 것이 아니라 실행이면 <a href=\"#/components/dropdown\">Dropdown</a> 을 씁니다.",
    principles: [
      ["언제 쓰는가", "6개 이상에서 하나를 고릅니다. 5개 이하로 항상 보여야 하면 Radio · Select Button, 찾아야 하거나 여러 개를 고르면 <a href=\"#/components/combobox\">Combobox</a> 입니다"],
      ["옵션 순서", "자주 쓰는 순서로 둡니다. 크기 · 기간처럼 순서가 있는 값은 작은 것부터, 그 밖에 기준이 없으면 가나다순입니다"],
      ["그룹", "<code>.menu-label</code> 로 묶습니다. 모든 옵션이 그룹에 들어갈 때만 쓰고 그룹 하나짜리는 쓰지 않습니다"],
      ["항목 글", "한 줄로 씁니다. 짧게 구별되도록 앞에 다른 낱말을 둡니다"],
      ["'전체' · '선택 안 함'", "필터는 맨 위 '전체', 필수가 아닌 폼 항목은 맨 위 '선택 안 함'(<code>data-value=\"\"</code>)입니다. 필수 항목에는 두지 않습니다"],
      ["목록 상태", "불러오는 중 · 실패 · 항목 없음을 메뉴 안 한 줄(<code>.menu-state</code>)로 보여 줍니다. 실패는 다시 시도를 함께 둡니다"],
      ["키보드", "닫힌 트리거에서 ↑↓ 로 엽니다. 열리면 ↑↓ Home End 로 옮기고, 글자를 치면 그 글자로 시작하는 항목으로 갑니다(초성도 맞습니다). Tab 은 닫고 다음 칸으로 갑니다"],
      ["폼 안에서", "<code>.field</code> 로 감싸면 필드 폭을 채우고 라벨을 <code>aria-labelledby</code> 로 잇습니다. <code>data-required</code> 는 Text Field 와 같은 검증에 참여합니다"],
    ],
    thumb: `<div class="dropdown"><button class="trigger" style="min-width:160px">전체 그룹</button></div>`,
    examples: [
      { id: "default", title: "Default", desc: "닫힌 기본 상태입니다. 고른 값이 없으면 트리거에 placeholder 를 둡니다. 눌러서 열면 항목이 8개를 넘는 목록은 메뉴 안에서 스크롤됩니다(최대 높이 320).", html: `
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
      { id: "open", title: "Open / Selected", desc: "닫힘과 열림을 나란히 둔 모습입니다. 열린 메뉴는 role=listbox, 고른 항목은 .on + aria-selected.", html: `
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
      { id: "disabled", title: "Disabled", desc: "권한이 없거나 선택할 값이 없는 상태입니다.", html: `
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" disabled><span class="placeholder">권한 없음</span></button></div>` },
      { id: "clear", title: "선택 해제", desc: "필터는 맨 위 '전체'를 둡니다. 필수가 아닌 폼 항목은 맨 위 '선택 안 함'(data-value 빈 값)을 두고, 고르면 placeholder 로 돌아갑니다.", html: `
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">전체</button><ul class="menu" role="listbox" aria-label="심각도 필터"><li class="menu-item on" role="option" data-value="all" aria-selected="true">전체</li>${selItems([["Critical", "critical"], ["High", "high"], ["Medium", "medium"]])}</ul></div>
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">승인자 선택</span></button><ul class="menu" role="listbox" aria-label="승인자">${selItems([["선택 안 함", ""], ["김보안", "kim"], ["이인프라", "lee"], ["박개발", "park"]])}</ul></div>`, layout: "tall top" },
      { id: "states", title: "목록 상태", desc: "목록을 불러오는 동안 · 실패 · 고를 항목이 없을 때 메뉴 안 한 줄로 보여 줍니다. 다시 시도를 누르면 ds:retry 가 납니다.", html: `${selOpen("불러오는 중", MENU_STATE.loading)}${selOpen("불러오기 실패", MENU_STATE.error)}${selOpen("항목 없음", MENU_STATE.empty)}`, layout: "tall top" },
      { id: "form", title: "폼 안에서", desc: "data-name 은 숨은 input 으로 제출되고 data-required 는 Text Field 와 같은 검증에 참여합니다. 열었다가 고르지 않고 닫으면 알리고, 고르면 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label id="sel-f1-l">적용 그룹 <em>*</em></label><div class="dropdown" data-name="group" data-required><button type="button" id="sel-f1" class="trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="sel-f1-l sel-f1"><span class="placeholder">그룹 선택</span></button><ul class="menu" role="listbox" aria-label="적용 그룹">${selItems([["영업팀", "sales"], ["개발팀", "dev"], ["보안팀", "sec"]])}</ul><input type="hidden" name="group" value=""></div><span class="help" aria-live="polite"></span></div>
          <div class="field"><label id="sel-f2-l">승인자</label><div class="dropdown" data-name="approver"><button type="button" id="sel-f2" class="trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="sel-f2-l sel-f2"><span class="placeholder">승인자 선택</span></button><ul class="menu" role="listbox" aria-label="승인자">${selItems([["선택 안 함", ""], ["김보안", "kim"], ["이인프라", "lee"]])}</ul><input type="hidden" name="approver" value=""></div><span class="help" aria-live="polite"></span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">정책 저장</button></div>
        </form>`, layout: "tall top" },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open. inline-block 이라 상자 높이가 놓인 곳의 글자 크기를 따른다 — 단독이면 앱 기본 글자, 입력 폼(.field) 안 14, .pagination-bar 안 12"], [".trigger", "button", "—", "고른 값을 표시. 값이 없으면 안에 .placeholder"], [".menu", "ul", "—", "role=listbox · aria-label 필수"], [".menu-item", "li", "—", "role=option. 고른 항목 .on + aria-selected, 비활성 aria-disabled. data-value 가 ds:select 의 값 — 빈 값은 '선택 안 함'"], [".menu-state", "li", "—", "role=presentation. 불러오는 중 · 실패 · 항목 없음"], ["data-name", "attr", "—", "제출할 이름 — 안의 input[type=hidden] 값을 고른 값으로"], ["data-required", "attr", "—", "form[data-validate] 안에서 필수 검사"], ["ds:select", "event", "—", "detail.value"], ["ds:retry", "event", "—", "목록 상태의 다시 시도"]],
    spec: [["Size", "트리거 높이 40 · 항목 높이 38.4 · 메뉴 최소 폭 200 · 메뉴 최대 높이 320(약 8개, 넘으면 스크롤)"], ["Container", "radius/md 6 · shadow/2 · 트리거 아래 4px"], ["Label", "Body/2 14 · placeholder foreground/neutral/tertiary"], ["Placement", "필터 툴바, 폼 안의 선택 필드 · 아래 공간이 모자라면 위로 뒤집어 연다(.up)"]],
    figma: { frame: "Select", radius: "radius/md", sizes: { trigger: { h: 40 }, item: { h: 36 } }, variants: { select: {}, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" } }, states: ["closed", "focused", "open", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Combobox */
  "combobox": {
    status: "ready", react: ["Combobox"], css: [".combobox", ".menu-state"], borrows: [".menu", ".menu-item", ".field", ".help", ".chip", ".spinner", ".btn", ".sr-only", ".form", ".form-legend", ".form-actions"],
    desc: "입력해서 목록을 좁혀 <b>찾아 고르거나</b>, <b>여러 개를 고릅니다</b>. 옵션이 적고 하나만 고르면 <a href=\"#/components/select\">Select</a>, 자유 입력이면 <a href=\"#/components/text-field\">Text Field</a> 를 씁니다.",
    principles: [
      ["언제 쓰는가", "옵션이 많아 찾아야 하거나(약 15개 이상) 여러 개를 고를 때입니다. 목록에 있는 값만 고릅니다 — 새 값을 만들지 않습니다"],
      ["필터", "입력한 글자가 들어 있는 항목만 남깁니다(대소문자 무시). 서버에서 찾으면 <code>data-filter=\"none\"</code> 과 <code>ds:query</code>(입력이 멈추고 300ms 뒤)를 씁니다"],
      ["키보드", "포커스는 입력에 있습니다. ↑↓ 로 후보를 옮기고 Enter 로 고릅니다. Esc 는 목록을 닫고, 닫혀 있으면 지나갑니다. Home · End 는 글자 커서를 옮깁니다"],
      ["떠날 때", "고르지 않은 글자는 버리고 고른 값으로 되돌립니다. 하나 고르기에서 글자를 모두 지우고 떠나면 선택을 해제합니다"],
      ["여러 개", "고르면 태그가 되고 목록은 열린 채 검색어만 비웁니다. 태그는 ×, 또는 빈 입력에서 Backspace 로 지웁니다. 태그가 많으면 줄을 바꿔 필드가 늘어납니다"],
      ["목록 상태", "불러오는 중 · 실패 · 항목 없음을 목록 안 한 줄(<code>.menu-state</code>)로 보여 줍니다. 실패는 다시 시도를 함께 둡니다"],
      ["결과 알림", "결과 수와 선택 · 해제를 숨긴 라이브 영역으로 알립니다"],
    ],
    thumb: `<div class="combobox" style="min-width:200px"><div class="control"><input placeholder="부서 검색" aria-label="부서"></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "입력하면 목록이 좁혀지고 첫 후보가 표시됩니다. ↑↓ 로 옮기고 Enter 로 고릅니다.", html: `<div class="field" style="width:320px"><label for="cb-d">담당 부서</label>${cbBox({ id: "cb-d", name: "부서", placeholder: "부서 검색" })}</div>`, layout: "tall top" },
      { id: "multiple", title: "Multiple", desc: "<code>data-multiple</code> — 고른 항목이 태그로 쌓이고 목록은 열린 채 있습니다.", html: `<div class="field" style="width:320px"><label for="cb-m">알림 받을 부서</label>${cbBox({ id: "cb-m", name: "알림 받을 부서", placeholder: "부서 검색", multi: true, on: ["영업팀", "보안팀"] })}</div>`, layout: "tall top" },
      { id: "states", title: "목록 상태", desc: "목록 안 한 줄로 불러오는 중 · 실패 · 항목 없음을 보여 줍니다. 다시 시도를 누르면 <code>ds:retry</code> 가 납니다.", html: `<div class="combobox open" data-filter="none" style="width:260px">${cbCtl({ id: "cb-s1", label: "불러오는 중", expanded: true, placeholder: "부서 검색" })}${cbMenu("불러오는 중", MENU_STATE.loading, "cb-s1")}${CB_LIVE}</div>
        <div class="combobox open" data-filter="none" style="width:260px">${cbCtl({ id: "cb-s2", label: "불러오기 실패", expanded: true, placeholder: "부서 검색" })}${cbMenu("불러오기 실패", MENU_STATE.error, "cb-s2")}${CB_LIVE}</div>
        <div class="combobox open" data-filter="none" style="width:260px">${cbCtl({ id: "cb-s3", label: "항목 없음", expanded: true, placeholder: "부서 검색" })}${cbMenu("항목 없음", MENU_STATE.empty, "cb-s3")}${CB_LIVE}</div>`, layout: "tall top" },
      { id: "disabled", title: "Disabled", desc: "권한이 없거나 고를 수 없는 상태입니다.", html: `<div class="combobox disabled" style="width:260px">${cbCtl({ id: "cb-x", label: "담당 부서", placeholder: "권한 없음", disabled: true })}${cbMenu("담당 부서", cbOpts([]), "cb-x")}${CB_LIVE}</div>` },
      { id: "form", title: "제출 검증", desc: "<code>data-name</code> 은 숨은 값으로 제출되고 <code>data-required</code> 는 Text Field 와 같은 검증에 참여합니다. 고르지 않은 채 떠나면 알리고, 고르면 바로 지웁니다.", html: `<form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
        <div class="field"><label for="cb-f1">담당 부서 <em>*</em></label>${cbBox({ id: "cb-f1", name: "담당 부서", placeholder: "부서 검색", field: "owner", required: true })}<span class="help" aria-live="polite"></span></div>
        <div class="field"><label for="cb-f2">알림 받을 부서 <em>*</em></label>${cbBox({ id: "cb-f2", name: "알림 받을 부서", placeholder: "부서 검색", field: "notify", required: true, multi: true })}<span class="help" aria-live="polite"></span></div>
        <div class="form-actions"><button type="submit" class="btn md solid primary">정책 저장</button></div></form>`, layout: "tall top" },
    ],
    props: [[".combobox", "container", "—", "열림은 .open, 비활성은 .disabled + 입력 disabled"], [".control", "div", "—", "입력 셸. 여러 개면 입력 앞에 .chip.sm"], ["input[role=combobox]", "input", "—", "aria-autocomplete=list · aria-expanded · aria-controls. 접근 이름 필수(label for 또는 aria-label)"], [".menu", "ul", "—", "role=listbox · aria-label 필수, 여러 개면 aria-multiselectable"], [".menu-item", "li", "—", "role=option · data-value · aria-selected. 고른 항목 .on, 후보는 ds.js 가 .active"], [".menu-state", "li", "—", "role=presentation. 불러오는 중 · 실패 · 항목 없음"], ["data-multiple", "attr", "—", "여러 개 고르기"], ["data-name", "attr", "—", "제출할 이름 — 숨은 input 을 동기화(여러 개면 값마다 하나)"], ["data-required", "attr", "—", "form[data-validate] 안에서 필수 검사"], ["data-filter", "'none'", "—", "목록을 좁히지 않고 <code>ds:query</code> 만 낸다(서버 검색)"], ["ds:select", "event", "—", "detail.value — 하나면 문자열, 여러 개면 배열"], ["ds:query", "event", "—", "detail.query"], ["ds:retry", "event", "—", "목록 상태의 다시 시도"]],
    spec: [["Size", "필드 최소 높이 32 · 40 · 48(Text Field 와 같다) · 최소 폭 260 · 메뉴 폭 = 필드 폭 · 메뉴 최대 높이 320"], ["Tag", "Chip sm 26 · 간격 4 · 넘치면 줄바꿈"], ["Label", "Body/2 14 · placeholder foreground/neutral/tertiary"], ["Placement", "필터 툴바, 폼 안의 선택 필드 · 아래 공간이 모자라면 위로 뒤집어 연다(.up)"]],
  },

  /* ------------------------------------------------ Tab */
  "tab": {
    status: "ready", react: ["Tabs","TabList","Tab","TabPanel"], css: [".tabs", ".tab-panel"], borrows: [".count", ".field"],
    desc: "같은 맥락의 콘텐츠를 뷰 단위로 전환합니다. 페이지 수준은 Underline, 카드 안의 보조 전환은 Pill.",
    principles: [
      ["언제", "같은 대상의 보기를 바꿀 때 씁니다. 페이지를 옮기는 메뉴에 쓰지 않고, 표의 필터는 Filter Chip 을 씁니다. 동시에 봐야 할 정보는 나누지 않습니다."],
      ["순서 · 제목", "중요도와 빈도 순으로 둡니다. 모든 탭에 공통인 제목은 탭 위에 둡니다."],
      ["라벨", "1~2단어로 씁니다. 빌드가 검사합니다."],
      ["넘칠 때", "탭 줄만 옆으로 스크롤합니다. 고른 탭은 자동으로 보이는 자리에 옵니다. 탭을 메뉴로 접어 숨기지 않습니다."],
      ["키보드", "←→ · Home · End 로 옮기면 바로 전환합니다. Tab 키는 다음 탭이 아니라 패널로 갑니다."],
      ["패널의 입력", "탭을 옮겨도 패널을 숨기기만 하고 입력은 남겨 둡니다. 패널을 지워야 하는 제품은 확인 Popup 을 띄웁니다."],
      ["URL", "활성 탭을 URL 에 남겨 공유와 새로고침에 유지합니다. 제품이 구현합니다."],
    ],
    thumb: `<div class="tabs sm" style="width:auto"><button class="tab on">개요</button><button class="tab">이벤트</button><button class="tab">정책</button></div>`,
    examples: [
      { id: "default", title: "Default", desc: "밑줄 스타일의 기본 탭입니다.", html: `
        <div class="tabs" role="tablist" aria-label="보기 전환">
          <button type="button" class="tab on" role="tab" aria-selected="true">개요</button>
          <button type="button" class="tab" role="tab" aria-selected="false">이벤트</button>
          <button type="button" class="tab" role="tab" aria-selected="false">정책</button>
        </div>
      ` },
      { id: "underline", title: "Underline", desc: "기본. role=tablist / tab / aria-selected. 활성은 .on.", html: `
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
      { id: "count", title: "With Count", desc: "탭마다 건수를 보여줄 때 .count.", html: `
        <div class="tabs" role="tablist" aria-label="보기 전환" style="max-width:640px">
          <button type="button" class="tab on" role="tab" aria-selected="true">전체<span class="count">128</span></button>
          <button type="button" class="tab" role="tab" aria-selected="false">차단<span class="count">37</span></button>
          <button type="button" class="tab" role="tab" aria-selected="false">검토 필요<span class="count">5</span></button>
        </div>` },
      { id: "pill", title: "Pill", desc: "카드·패널 안의 보조 전환. 폭은 내용에 맞춤.", html: `
        <div class="tabs pill" role="tablist" aria-label="보기 전환">
          <button type="button" class="tab on" role="tab" aria-selected="true">일간</button>
          <button type="button" class="tab" role="tab" aria-selected="false">주간</button>
          <button type="button" class="tab" role="tab" aria-selected="false">월간</button>
        </div>` },
      { id: "overflow", title: "Overflow", desc: "폭을 넘으면 탭 줄만 옆으로 스크롤합니다. 키보드로 옮기면 그 탭이 보이는 자리에 옵니다.", html: `
        <div class="tabs" role="tablist" aria-label="정책 종류" style="max-width:480px">
          ${["전체","USB 제어","네트워크","웹 필터","메일","프린터","앱 실행","화면 캡처","클립보드"].map((t, i) => `<button type="button" class="tab${i ? "" : " on"}" role="tab" aria-selected="${!i}">${t}</button>`).join("")}
        </div>` },
      { id: "panels", title: "Panels", desc: "탭마다 패널을 두면 <code>aria-controls</code> 로 잇습니다. 옮겨도 입력은 그대로 남습니다.", html: `
        <div style="width:100%;max-width:480px">
          <div class="tabs" role="tablist" aria-label="정책 설정">
            <button type="button" class="tab on" role="tab" aria-selected="true" id="tp-tab-a" aria-controls="tp-panel-a">기본</button>
            <button type="button" class="tab" role="tab" aria-selected="false" id="tp-tab-b" aria-controls="tp-panel-b">예외</button>
          </div>
          <div class="tab-panel" role="tabpanel" id="tp-panel-a" aria-labelledby="tp-tab-a"><div class="field"><label for="tp-name">정책 이름</label><input id="tp-name" type="text" placeholder="이름을 입력하세요"></div></div>
          <div class="tab-panel" role="tabpanel" id="tp-panel-b" aria-labelledby="tp-tab-b" hidden><div class="field"><label for="tp-ex">예외 대상</label><input id="tp-ex" type="text" placeholder="사용자 또는 그룹"></div></div>
        </div>` },
      { id: "variant", title: "Small / Accent", desc: "밀도 높은 패널은 .sm, 제품 컬러 강조는 .accent.", html: `
        <div class="tabs sm accent" role="tablist" aria-label="보기 전환" style="max-width:480px">
          <button type="button" class="tab on" role="tab" aria-selected="true">상세</button>
          <button type="button" class="tab" role="tab" aria-selected="false">타임라인</button>
          <button type="button" class="tab" role="tab" aria-selected="false">관련 이벤트</button>
        </div>` },
    ],
    props: [[".tabs", "container", "—", "role=tablist. 기본 Underline, 전체 폭"], [".tab", "button", "—", "role=tab, aria-selected. 활성 .on"], [".pill", "boolean", "false", "캡슐형(보조 전환)"], [".sm / .accent", "boolean", "false", "작은 크기 / 활성 색 accent"], [".count", "element", "—", "건수 배지"], ["disabled", "attribute", "—", "비활성 탭"], ["aria-controls", "attribute", "—", "패널 id. 있으면 ds.js 가 패널을 숨기고 보입니다(입력 유지)"], ["ds:tab", "event", "—", "탭을 바꾸면 발생"]],
    spec: [["Size", "높이 44.4 (sm 37.2) · 탭 간격 24"], ["Container", "하단 1px line/neutral/secondary · 활성 2px"], ["Label", "14 Medium tertiary · 선택 14 Bold · pill 선택 14 SemiBold"], ["Overflow", "폭을 넘으면 탭 줄 가로 스크롤. 탭은 줄어들지 않음"], ["Placement", "페이지 헤더 아래, 카드 헤더 우측(pill)"]],
    figma: { frame: "Tab", sizes: { md: { h: 44 }, sm: { h: 38 } }, variants: { underline: {}, pill: { bg: "--surface-neutral-secondary" } }, states: ["default", "active", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Breadcrumb */
  "breadcrumb": {
    status: "ready", react: ["Breadcrumb","BreadcrumbHome","BreadcrumbItem","BreadcrumbMore"], css: [".breadcrumb"], borrows: [".page-head", ".btn", ".tooltip-wrap", ".tooltip"],
    desc: "지금 화면이 메뉴 계층의 어디인지 보여 주고 상위로 한 번에 돌아가게 합니다. 좌측 메뉴에 바로 있는 화면은 메뉴가 이미 위치를 보여 주므로 두지 않고, 그 아래로 들어간 상세 · 편집 · 하위 화면에만 둡니다.",
    thumb: `<ol class="breadcrumb"><li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li><li><a href="#">정책</a></li><li aria-current="page"><span>외부 저장장치 차단</span></li></ol>`,
    examples: [
      { id: "default", title: "Default", desc: "홈 아이콘 › 메뉴 › … › 현재 페이지. 첫 항목은 항상 홈 아이콘이고 <code>aria-label=\"홈\"</code> 이 필수입니다. 마지막은 현재 페이지로, 링크 없이 Medium 이며 페이지 타이틀과 같은 이름입니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><a href="#">정책</a></li>
            <li><a href="#">USB 제어</a></li>
            <li aria-current="page"><span>외부 저장장치 차단</span></li>
          </ol>
        </nav>` },
      { id: "state", title: "State", desc: "Normal · Hover · Focus · Current 네 가지입니다. Hover 는 글자를 primary 로 바꾸고 밑줄을 긋습니다(가운데 항목은 Hover 를 고정해 보입니다). Focus 는 전역 포커스 외곽선입니다 — Tab 으로 확인하세요. Disabled 는 두지 않습니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><a href="#">Normal</a></li>
            <li><a href="#" data-state="hover">Hover</a></li>
            <li aria-current="page"><span>Current</span></li>
          </ol>
        </nav>` },
      { id: "long", title: "Long label", desc: "메뉴 항목은 메뉴에 적힌 이름 그대로, 상세 화면은 대상 이름(정책 · 장비 이름)을 씁니다. 220px 를 넘으면 말줄임하고, 잘린 항목에만 Tooltip 이 붙어 마우스와 키보드로 전체 문구를 봅니다. 링크가 아닌 현재 항목도 잘렸을 때는 포커스를 받습니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><a href="#">정책</a></li>
            <li><a href="#">본사 개발팀 외부 저장장치 · 클라우드 업로드 통합 차단 정책</a></li>
            <li aria-current="page"><span>예외 승인 요청 상세 — 2026-10-30 개발팀 김지란</span></li>
          </ol>
        </nav>` },
      { id: "text-parent", title: "Non-link parent", desc: "메뉴 그룹처럼 눌러 갈 페이지가 없는 단계는 링크 없이 텍스트로만 둡니다. 갈 수 없는 단계를 비활성으로 칠하지 않습니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><span>리포트</span></li>
            <li><a href="#">주간 리포트</a></li>
            <li aria-current="page"><span>2026년 10월 4주차</span></li>
          </ol>
        </nav>` },
      { id: "collapsed", title: "Collapsed", desc: "홈을 포함해 5단계 이상이면 첫 항목(홈)과 끝 2개를 남기고 가운데를 … 하나로 접습니다. 누르면 그 자리에 펼쳐지고 포커스는 펼친 첫 링크로 갑니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><button type="button" class="more" aria-label="상위 경로 펼치기" data-items="정책|USB 제어">${I("dots",14)}</button></li>
            <li><a href="#">PC-2041</a></li>
            <li aria-current="page"><span>이벤트 #48213</span></li>
          </ol>
        </nav>` },
      { id: "placement", title: "Placement", desc: "<a href=\"#/components/page-header\">Page Header</a> 첫 칸에 넣어 타이틀 바로 위 8px 에 둡니다. 한 화면에 하나만 둡니다. 모달 · 탭 패널 안에는 두지 않습니다.", html: `
        <div class="page-head">
          <nav aria-label="현재 위치">
            <ol class="breadcrumb">
              <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
              <li><a href="#">정책</a></li>
              <li><a href="#">USB 제어</a></li>
              <li aria-current="page"><span>외부 저장장치 차단</span></li>
            </ol>
          </nav>
          <div><h1 class="title">외부 저장장치 차단</h1><p class="sub">POL-2041 · 전체 그룹</p></div><div class="actions"><button type="button" class="btn md outline assistive">취소</button><button type="button" class="btn md solid primary">저장</button></div>
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
    spec: [["Size", "높이 24 한 크기 · 항목 간격 6 · 구분자 사선(slash) 12 · disable 색 · 홈 아이콘 18 · 라벨 최대 220"], ["Container", "없음(텍스트 행)"], ["Label", "14/22(Body 2) tertiary · Hover primary + 밑줄 · 현재 primary Medium"], ["Placement", "메뉴 아래 상세 · 편집 화면의 페이지 타이틀 위 8px · 모달 · 탭 패널 안 금지"]],
    figma: { frame: "Breadcrumb", sizes: { md: { h: 24 } }, variants: { default: {}, collapsed: {} }, states: ["default", "hover", "focus", "current"] },
  },

  /* ------------------------------------------------ Pagination */
  "pagination": {
    status: "ready", react: ["Pagination","PaginationBar","CursorPagination","paginate","PAGE_SIZES"], css: [".pagination", ".pagination-bar", ".dropdown", ".menu", ".menu-item"],
    desc: "긴 목록을 페이지로 나누어 이동합니다. 총 건수와 페이지 크기 선택을 함께 둡니다.",
    thumb: `<div class="pagination compact"><button>${I("chevron-left",16)}</button><button class="on">1</button><button>2</button><button>3</button><button>${I("chevron-right",16)}</button></div>`,
    principles: [
      ["표시 개수", "20 · 50 · 100 중에서 고릅니다. 개수나 필터가 바뀌면 1페이지로 돌아갑니다"],
      ["번호 칸", "화살표를 빼고 9칸 이하입니다. 빌드가 검사하고, React 는 넘으면 경고합니다"],
      ["한 페이지뿐일 때", "번호를 숨기고 건수는 남깁니다"],
      ["이동한 뒤", "<code>data-target</code> · <code>target</code> 을 주면 표 맨 위로 스크롤하고 포커스를 옮깁니다. 현재 페이지는 제품이 URL 에 남깁니다"],
      ["끝을 모르는 목록", "수십만 건 로그처럼 전체 쪽수를 세지 못하면 커서 방식(이전 · 다음)입니다. 끝이 확인되면 버튼을 끕니다"],
    ],
    examples: [
      { id: "basic", title: "Default", desc: "이전/다음 + 번호. 현재 .on + aria-current. 첫 페이지에서는 이전 비활성.", html: `
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
      { id: "variant", title: "Compact / Outline", html: `
        <nav class="pagination compact" aria-label="페이지">
          <button type="button" aria-label="이전">${I("chevron-left",16)}</button><button type="button">7</button><button type="button" class="on" aria-current="page">8</button><button type="button">9</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>
        <nav class="pagination outline" aria-label="페이지">
          <button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>` },
      { id: "bar", title: "Pagination Bar", desc: "테이블 하단. 총 건수 · 페이지 크기 · 페이지 이동.", html: `
        <div class="pagination-bar">
          <span>총 <b>1,284</b>건 · 1–50</span>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">50개씩</button><ul class="menu" role="listbox" aria-label="페이지당 개수"><li class="menu-item" role="option" data-value="20">20개씩</li><li class="menu-item on" role="option" data-value="50" aria-selected="true">50개씩</li><li class="menu-item" role="option" data-value="100">100개씩</li></ul></div>
            <nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><span class="gap">…</span><button type="button">26</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav>
          </div>
        </div>` },
      { id: "single", title: "한 페이지뿐일 때", desc: "번호를 숨기고 건수는 남깁니다.", html: `
        <div class="pagination-bar"><span>총 <b>12</b>건</span></div>` },
      { id: "cursor", title: "커서 방식", desc: "전체 쪽수를 모르는 목록입니다. 누르면 ds:page {direction}. 끝이 확인되면 제품이 버튼을 끕니다.", html: `
        <nav class="pagination cursor" aria-label="페이지"><button type="button" data-cursor="prev" disabled>${I("chevron-left",16)}이전</button><span class="range">1–100</span><button type="button" data-cursor="next">다음${I("chevron-right",16)}</button></nav>` },
    ],
    props: [[".pagination", "nav", "—", "aria-label=페이지. 버튼 36 (compact 32)"], ["button.on", "current", "—", "현재 페이지 + aria-current=page"], [".gap", "span", "—", "생략(…). 글자 크기는 놓인 곳을 따른다 — 단독이면 앱 기본 글자, .pagination-bar 안이면 12(번호 버튼은 14 · compact 12 로 정해져 있다)"], [".compact / .outline", "boolean", "false", "작은 크기 / 보더형"], [".pagination-bar", "container", "—", "총 건수 + 페이지 크기 + 페이지네이션"]],
    spec: [["Size", "버튼 36 (compact 32) · 간격 4"], ["Container", "radius/md · 현재 brand"], ["Label", "Body/2 14 · 현재 Semibold"], ["Placement", "테이블 하단 우측, 총 건수는 좌측. 표시 개수 20 · 50 · 100"]],
    figma: { frame: "Pagination", radius: "radius/md", sizes: { md: { h: 36 }, compact: { h: 32 } }, variants: { default: {}, outline: { stroke: "--line-neutral-secondary" } }, states: ["default", "current", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Navigation */
  "navigation": {
    status: "ready", react: ["SideNav","SideNavGroup","SideNavItem"], css: [".sidenav", ".count", ".skip-link", ".tooltip-wrap", ".tooltip"],
    desc: "콘솔 좌측의 1차 내비게이션입니다. 그룹 라벨로 메뉴를 묶고 현재 위치를 .on 으로 표시합니다. 폭 240, 접으면 64.",
    principles: [
      ["깊이", "2단계까지입니다."],
      ["이름", "메뉴 이름 = 페이지 제목 = Breadcrumb 이름입니다."],
      ["권한", "권한 없는 메뉴는 숨깁니다. 비활성으로 두지 않습니다."],
      ["접힘", "아이콘만 남고 이름은 Tooltip 으로 보입니다. 마우스와 키보드 모두 볼 수 있습니다. 접은 상태는 사용자별로 기억합니다. 제품이 구현합니다."],
      ["본문 바로가기", "페이지의 첫 포커스에 둡니다. 포커스가 오면 나타납니다."],
    ],
    thumb: `<div class="sidenav" style="width:180px;min-height:0;border:1px solid var(--line-neutral-secondary);border-radius:8px"><a href="#" class="on" aria-current="page">${I("home")}<span>대시보드</span></a><a href="#">${I("list")}<span>이벤트</span></a><a href="#">${I("shield")}<span>정책</span></a></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "그룹 라벨(.group) + 링크. 아이콘 18px, 건수는 .count. 하위 항목은 .sub.", html: `
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
      { id: "collapsed", title: "Collapsed", desc: "1280 이하 또는 사용자가 접었을 때. 아이콘만, 이름은 마우스 · 키보드 모두 Tooltip 으로. 하위 항목과 .foot 은 숨고, 현재 메뉴가 하위 항목이면 부모(.has-on)가 선택 모양을 이어받습니다.", html: `
        <nav class="sidenav collapsed" aria-label="주 메뉴" style="border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)">
          <span class="tooltip-wrap"><a href="#" class="on" aria-current="page" aria-label="대시보드">${I("home")}<span>대시보드</span></a><span class="tooltip right" role="tooltip">대시보드</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="이벤트">${I("list")}<span>이벤트</span></a><span class="tooltip right" role="tooltip">이벤트</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="정책">${I("shield")}<span>정책</span></a><span class="tooltip right" role="tooltip">정책</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="에이전트">${I("server")}<span>에이전트</span></a><span class="tooltip right" role="tooltip">에이전트</span></span>
          <span class="tooltip-wrap"><a href="#" aria-label="설정">${I("settings")}<span>설정</span></a><span class="tooltip right" role="tooltip">설정</span></span>
        </nav>`, layout: "left" },
      { id: "skip", title: "Skip Link", desc: "페이지의 첫 포커스에 둡니다. 화면 밖에 있다가 Tab 을 누르면 나타납니다. 여기서는 <code>.show</code> 로 고정했습니다.", html: `
        <div style="position:relative;width:100%;max-width:480px;height:64px;border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)"><a href="#" class="skip-link show">본문 바로가기</a></div>` },
    ],
    props: [[".skip-link", "a", "—", "본문 바로가기. .show 는 문서용 고정 표시"], [".tooltip-wrap > a", "wrapper", "—", "접힌 레일의 항목. a 에 aria-label, 옆에 .tooltip.right"], [".sidenav", "nav", "—", "폭 240, 세로 링크 목록"], [".group", "div", "—", "그룹 라벨(uppercase caption)"], ["a.on", "current", "—", "현재 메뉴(brand subtle)"], ["a.sub", "child", "—", "하위 항목(들여쓰기). 선택(.on)되면 brand 글자"], ["a.has-on", "parent", "—", "하위 항목이 현재 메뉴인 부모. 펼친 레일에서는 그대로, 접힌 레일에서는 하위 항목이 숨으니 선택 모양이 된다. 접힌 레일에서는 aria-current=\"true\" 도 함께(React hasActiveChild 는 자동)"], [".collapsed", "boolean", "false", "폭 64, 아이콘만"], [".count", "element", "—", "미확인 건수"]],
    spec: [["Size", "폭 240 (접힘 64) · 항목 높이 38.4 (padding 8 · 글자 14 · 행간 1.6)"], ["Container", "surface/elevated/primary · 우측 1px line/neutral/secondary"], ["Label", "항목 14 Medium · 선택 14 SemiBold · 그룹 12 SemiBold uppercase"], ["Placement", "헤더 아래 좌측 고정, 전체 높이"]],
    figma: { frame: "Navigation", radius: "radius/md", sizes: { expanded: { w: 240 }, collapsed: { w: 64 }, item: { h: 38.4 } }, variants: { default: {}, collapsed: { hasOn: { bg: "--surface-brand-subtle", icon: "--foreground-brand-primary" } }, selected: { bg: "--surface-brand-subtle", fg: "--foreground-brand-primary" }, sub: { fg: "--foreground-neutral-secondary", selected: { fg: "--foreground-brand-primary" } } }, states: ["default", "hover", "active", "sub selected"] },
  },

  /* ------------------------------------------------ Top Navigation */
  "top-navigation": {
    status: "ready", react: ["TopBar","TopBarLogo","TopBarNav","TopBarNavItem","TopBarRight","Avatar"], css: [".topbar", ".topbar-user", ".avatar", ".searchbar", ".divider", ".count", ".with-count", ".tooltip-wrap", ".tooltip", ".dropdown", ".menu", ".menu-item", ".menu-sep"], borrows: [".btn"],
    desc: "제품 상단 바입니다. 제품 로고 · 1차 메뉴(사이드 내비가 없는 제품) · 전역 검색 · 알림 · 사용자 메뉴로 구성합니다.",
    principles: [
      ["1차 메뉴", "상단 메뉴와 Navigation 을 함께 두지 않습니다. 사이드 내비가 있으면 상단에는 전역 검색을 둡니다. 빌드가 검사합니다."],
      ["오른쪽 순서", "검색 · 알림 · 사용자 순으로 고정합니다. 사용자는 맨 끝입니다."],
      ["사용자 메뉴", "로그아웃은 메뉴 맨 아래, 구분선 뒤에 둡니다."],
      ["아이콘 버튼", "모두 접근 이름과 Tooltip 을 둡니다. 빌드가 검사합니다."],
    ],
    thumb: `<div class="topbar" style="height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--line-neutral-secondary);width:260px"><span class="logo"><i></i>Console</span><span class="right"><span class="avatar sm">JH</span></span></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "로고 + 메뉴 + 우측 액션. 현재 메뉴는 .on.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i></i>Security Console <small>v2.4</small></a>
          <nav aria-label="주 메뉴"><a href="#" class="on" aria-current="page">대시보드</a><a href="#">이벤트</a><a href="#">정책</a><a href="#">에이전트</a></nav>
          <div class="right">
            <span class="with-count"><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="알림 3건">${I("bell")}</button><span class="tooltip bottom" role="tooltip">알림 3건</span></span><span class="count">3</span></span>
            <span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="설정">${I("settings")}</button><span class="tooltip bottom" role="tooltip">설정</span></span>
            <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
            <span class="avatar" title="정희 · 관리자">JH</span>
          </div>
        </header>` },
      { id: "search", title: "With Search", desc: "사이드 내비가 있는 제품은 상단 메뉴 대신 전역 검색을 둡니다.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i></i>Security Console</a>
          <div class="searchbar" role="search" data-hotkey style="margin-left:16px">${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="전역 검색"><kbd>/</kbd></div>
          <div class="right">
            <span class="with-count"><span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="알림">${I("bell")}</button><span class="tooltip bottom" role="tooltip">알림</span></span><span class="count dot" aria-hidden="true"></span></span>
            <span class="avatar">JH</span>
          </div>
        </header>` },
      { id: "user", title: "User Menu", desc: "맨 끝의 사용자 메뉴입니다. 로그아웃은 맨 아래 구분선 뒤에 둡니다.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i></i>Security Console</a>
          <div class="right">
            <span class="tooltip-wrap"><button type="button" class="btn sm assistive icon-only" aria-label="알림">${I("bell")}</button><span class="tooltip bottom" role="tooltip">알림</span></span>
            <div class="dropdown"><button type="button" class="topbar-user" aria-label="사용자 메뉴" aria-haspopup="menu" aria-expanded="false"><span class="avatar">JH</span></button><ul class="menu" role="menu" style="left:auto;right:0"><li class="menu-item" role="menuitem">내 정보</li><li class="menu-item" role="menuitem">비밀번호 변경</li><li class="menu-sep" role="separator"></li><li class="menu-item" role="menuitem">로그아웃</li></ul></div>
          </div>
        </header>` },
    ],
    props: [[".topbar", "header", "—", "높이 56, 하단 1px"], [".logo", "a", "—", "제품 마크(i) + 이름 + small 버전"], ["nav a.on", "current", "—", "현재 1차 메뉴"], [".right", "container", "—", "우측 액션(알림·설정·아바타)"], [".avatar", "span", "—", "이니셜 32 (sm 24)"]],
    spec: [["Size", "높이 56 · 좌우 padding 20"], ["Container", "surface/elevated/primary · 하단 line/neutral/secondary"], ["Label", "메뉴 14 Medium secondary · 로고 16 Bold"], ["Placement", "최상단 고정(sticky)"]],
    figma: { frame: "Top Navigation", sizes: { md: { h: 56 } }, variants: { menu: {}, search: {} }, states: ["default", "active"] },
  },

  /* ------------------------------------------------ Accordion */
  "accordion": {
    status: "ready", react: ["Accordion","AccordionGroup"], css: [".accordion", ".accordion-group"],
    desc: "긴 설명 · 고급 설정 · FAQ 처럼 당장 보지 않아도 되는 정보를 접어 두었다가 필요할 때 펼칩니다. 핵심 정보와 필수 입력은 펼쳐 두고, 같은 층위의 화면 전환에는 Tab, 순서 진행에는 Steps 를 씁니다.",
    thumb: `<details class="accordion sm outline" open style="min-width:200px"><summary style="padding:10px 14px;font-size:12px">고급 설정</summary><div class="body" style="padding:0 14px 10px;font-size:12px">내용</div></details>`,
    examples: [
      { id: "default", title: "Default", desc: "Outline · md 가 기본이고, 처음에는 <b>닫힌 상태</b>로 둡니다. 사용자가 반드시 봐야 하는 첫 항목만 예외로 펼쳐 둡니다(<code>open</code>).", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px">
          <summary>고급 탐지 옵션</summary>
          <div class="body">휴리스틱 분석, 메모리 스캔, 스크립트 차단을 개별로 켜고 끕니다. 기본값은 모두 켬입니다.</div>
        </details>` },
      { id: "variant", title: "Variant", desc: "<b>Outline</b>(기본)은 항목마다 테두리가 있는 카드로, 페이지 바탕 위에 씁니다. <b>Flat</b> 은 테두리 없이 구분선만 있어 카드 · 패널 안에 씁니다 — 바탕 · 테두리 · 좌우 여백은 <code>.accordion-group.flat</code> 이 그립니다.", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px"><summary>Outline</summary><div class="body">항목마다 테두리가 있는 카드입니다.</div></details>
        <div class="accordion-group flat" style="max-width:560px">
          <details class="accordion md flat"><summary>Flat</summary><div class="body">구분선으로 나뉩니다.</div></details>
          <details class="accordion md flat"><summary>Flat</summary><div class="body">구분선으로 나뉩니다.</div></details>
        </div>` },
      { id: "size", title: "Size", desc: "sm 40 · md 52 · lg 60. 헤더 높이는 고정하고 너비는 컨테이너를 채웁니다. 패널 · 사이드 영역은 sm, 일반 화면은 md, 넓은 안내 화면은 lg.", layout: "top", html: `
        <details class="accordion sm outline" style="max-width:560px"><summary>Small</summary><div class="body">헤더 40 · 제목 14</div></details>
        <details class="accordion md outline" style="max-width:560px"><summary>Medium</summary><div class="body">헤더 52 · 제목 16</div></details>
        <details class="accordion lg outline" style="max-width:560px"><summary>Large</summary><div class="body">헤더 60 · 제목 18</div></details>` },
      { id: "state", title: "State", desc: "상태는 <b>Collapsed · Expanded · Hover · Disabled</b> 네 가지입니다. Hover 는 헤더 면을 옅게 칠해 누를 수 있는 영역임을 알립니다. Disabled 는 권한처럼 열 수 없는 이유가 있을 때만 쓰고, 그 이유를 보조 정보로 함께 보입니다.", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px"><summary>Collapsed</summary><div class="body">펼친 내용</div></details>
        <details class="accordion md outline" open style="max-width:560px"><summary>Expanded</summary><div class="body">펼친 내용입니다.</div></details>
        <details class="accordion md outline" style="max-width:560px"><summary data-state="hover">Hover</summary><div class="body">펼친 내용</div></details>
        <details class="accordion md outline disabled" style="max-width:560px"><summary tabindex="-1" aria-disabled="true">Disabled <small>권한 필요</small></summary><div class="body">관리자 권한이 있어야 열람할 수 있습니다.</div></details>` },
      { id: "header", title: "Header", desc: "제목은 필수이고 내용을 예측할 수 있는 명사형 · 질문형 한 줄로 씁니다. 개수 · 상태 같은 <b>보조 정보는 오른쪽</b>에, 앞 아이콘은 의미를 보완할 때만 둡니다. 펼침 화살표는 오른쪽에 고정되고 헤더 전체가 클릭 영역입니다. <b>헤더 안에는 버튼 · 체크박스 같은 조작 요소를 두지 않습니다</b> — 약관 동의의 항목 체크박스만 예외입니다(<a href=\"#/patterns/terms-agreement\">Terms Agreement</a>).", layout: "top", html: `
        <details class="accordion md outline" style="max-width:560px"><summary>탐지 예외 목록 <small>12개</small></summary><div class="body">예외로 등록된 해시 · 경로입니다.</div></details>
        <details class="accordion md outline" style="max-width:560px"><summary>${I("info-circle")}유의사항</summary><div class="body">배포 후 최대 5분 안에 적용됩니다.</div></details>` },
      { id: "group", title: "Group", desc: "여러 항목은 <code>.accordion-group</code>(간격 8)으로 묶고, <b>여러 개를 동시에 펼칠 수 있는 것</b>이 기본입니다. 한 묶음에는 3~7개를 권장하고, 더 많으면 검색 · 필터나 별도 페이지를 씁니다.", layout: "top", html: `
        <div class="accordion-group" style="max-width:560px">
          <details class="accordion md outline" open><summary>일반</summary><div class="body">정책 이름, 설명, 적용 그룹</div></details>
          <details class="accordion md outline"><summary>스케줄</summary><div class="body">적용 요일과 시간대</div></details>
          <details class="accordion md outline"><summary>알림</summary><div class="body">차단 시 알림 받을 채널</div></details>
        </div>` },
      { id: "single", title: "Single open", desc: "같은 <code>name</code> 을 주면 하나를 펼칠 때 나머지가 닫힙니다(브라우저 지원 시). FAQ 처럼 <b>한 번에 하나만 읽는 목록</b>에만 씁니다.", layout: "top", html: `
        <div class="accordion-group" style="max-width:560px">
          <details class="accordion md outline" name="faq" open><summary>정책은 언제 적용되나요?</summary><div class="body">배포 버튼을 누른 뒤 에이전트가 다음 체크인(최대 5분)에서 받아 적용합니다.</div></details>
          <details class="accordion md outline" name="faq"><summary>차단된 파일은 어디에 보관되나요?</summary><div class="body">격리 저장소에 30일 보관 후 자동 삭제됩니다.</div></details>
          <details class="accordion md outline" name="faq"><summary>예외 처리는 어떻게 하나요?</summary><div class="body">정책 › 예외 목록에서 해시 또는 경로를 등록합니다.</div></details>
        </div>` },
      { id: "body", title: "Body", desc: "본문에는 텍스트와 폼 요소를 둘 수 있습니다. <b>아코디언 안에 아코디언을 넣지 않습니다</b>. 내용이 길면 높이를 제한하고 스크롤합니다(React <code>bodyStyle</code>).", layout: "top", html: `
        <details class="accordion md outline" open style="max-width:560px">
          <summary>변경 이력 <small>최근 30일</small></summary>
          <div class="body" style="max-height:120px;overflow:auto">2026-10-28 실시간 보호 켬<br>2026-10-21 USB 검사 예외 추가<br>2026-10-14 스케줄 변경(평일 09–18)<br>2026-10-07 알림 채널 추가<br>2026-09-30 정책 생성</div>
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
    spec: [["Size", "헤더 sm 40 · md 52 · lg 60 · 본문 padding sm 0 16 12 · md 0 20 16 · lg 0 24 20 (Flat 은 좌우 4)"], ["Container", "radius/lg 8 · Outline 은 line/neutral/secondary 1px · Hover 는 헤더 면 surface/neutral/secondary"], ["Label", "제목 14 · 16 · 18 SemiBold · 보조 정보 12 tertiary · 본문 Body/2 14 secondary(sm 12)"], ["Placement", "설정 폼의 고급 옵션, FAQ · 헤더 안 조작 요소 금지(약관 동의만 예외)"], ["Motion", "본문 높이는 --motion-base 로 보간(::details-content 미지원 브라우저는 즉시 열림) · 셰브론은 --motion-fast 로 회전 · Hover 면은 --motion-fast"]],
    figma: { frame: "Accordion", radius: "radius/lg", sizes: { sm: { h: 40, fs: 14 }, md: { h: 52, fs: 16 }, lg: { h: 60, fs: 18 } }, variants: { outline: { stroke: "--line-neutral-secondary" }, flat: {} }, states: ["collapsed", "expanded", "hover", "disabled"], hover: { bg: "--surface-neutral-secondary" } },
  },

  /* ------------------------------------------------ Card */
  "card": {
    status: "ready", react: ["Card","CardHead","CardTitle","CardDesc","CardMeta","CardFoot","CardGrid"], css: [".card", ".card-grid"], borrows: [".tag", ".btn", ".select-btn", ".sparkline", ".skeleton", ".tbl", ".indicator", ".empty"],
    desc: "관련 정보와 그 정보에 대한 액션을 한 덩어리로 묶는 컨테이너입니다. 대시보드 위젯 · 상세 화면의 정보 블록 · 선택지 묶음에 씁니다. 숫자 하나는 KPI, 그래프는 Chart Card(<a href=\"data-visual.html\">Data Visual</a>)로 만들고, 화면 전체를 감싸는 틀로는 쓰지 않습니다.",
    thumb: `<div class="card sm" style="min-width:200px"><div class="card-head"><h3 class="title" style="font-size:14px">라이선스</h3><span class="tag ok sm">정상</span></div><p class="desc" style="font-size:12px">2026-12-31 만료</p></div>`,
    examples: [
      { id: "default", title: "Default", desc: "헤더(제목 + 오른쪽 요소 하나) · 본문 · 푸터 순서입니다. 푸터 액션은 오른쪽 정렬이고 강조 버튼은 하나만 둡니다. Surface 면과 1px 보더로 구획하고 그림자는 두지 않습니다.", html: `
        <div class="card" style="width:360px">
          <div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div>
          <p class="desc">1,000석 중 842석 사용 중. 2026-12-31 만료.</p>
          <div class="card-foot"><button type="button" class="btn sm outline assistive">상세</button><button type="button" class="btn sm solid primary">갱신</button></div>
        </div>` },
      { id: "header", title: "Header", desc: "헤더 오른쪽에는 상태 Tag · 기간 선택(Select Button) · '전체 보기' 텍스트 버튼(assistive) 중 <b>하나만</b> 둡니다. 기간 선택은 패널이 없으니 탭이 아니라 <code>role=group</code> + <code>aria-pressed</code> 입니다.", html: `
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
      { id: "status", title: "Status", desc: "자산 · 서버 · 에이전트 카드입니다. 제목 옆에 상태 Indicator, 본문은 키-값 행(<code>dl.card-meta</code> — 버전 · 그룹 · IP · 마지막 접속), 푸터에 액션을 둡니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card" style="width:320px">
            <div class="card-head"><h3 class="title">PC-2041</h3><span class="indicator ok">온라인</span></div>
            <dl class="card-meta"><dt>에이전트</dt><dd>6.2.1</dd><dt>그룹</dt><dd>개발팀</dd><dt>IP</dt><dd>10.20.4.41</dd><dt>마지막 접속</dt><dd>2026-11-02 09:41</dd></dl>
            <div class="card-foot"><button type="button" class="btn sm outline assistive">로그</button><button type="button" class="btn sm solid primary">원격 점검</button></div>
          </div>
          <div class="card" style="width:320px">
            <div class="card-head"><h3 class="title">SRV-DB-01</h3><span class="indicator warn">점검 필요</span></div>
            <dl class="card-meta"><dt>에이전트</dt><dd>6.1.8 · 업데이트 필요</dd><dt>그룹</dt><dd>서버</dd><dt>IP</dt><dd>10.20.1.12</dd><dt>마지막 접속</dt><dd>2026-11-01 22:05</dd></dl>
            <div class="card-foot"><button type="button" class="btn sm outline assistive">로그</button><button type="button" class="btn sm solid primary">업데이트</button></div>
          </div>
        </div>` },
      { id: "list", title: "List", desc: "최근 이벤트 · 위협 Top 5 처럼 표 · 목록을 카드 폭까지 채울 때는 <code>.flush</code> — padding · gap 0, 헤더만 16 · 24. 헤더 오른쪽에 '전체 보기'(텍스트 assistive). 안에는 표(<code>.tbl</code>)를 그대로 둡니다 — 표는 바깥 테두리가 없습니다(2026-11-11). List 는 자체 테두리가 있어 두 겹이 됩니다.", html: `
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
      { id: "selection", title: "Selection", desc: "정책 템플릿 · 검사 유형처럼 카드 전체를 눌러 고릅니다. 하나만 고르면 <code>button</code> + <code>aria-pressed</code>, 이동이면 <code>a</code>. 선택 · 이동 카드 안에는 버튼 · 링크를 두지 않습니다. 상태는 Normal · Hover · Selected · Disabled — Disabled 는 disable 토큰으로 칠하고(opacity 금지) 이유를 설명 줄에 적습니다 — 이유 줄만 tertiary 로 읽히게 둡니다.", html: `
        <div class="card-grid" style="max-width:600px">
          <button type="button" class="card clickable" aria-pressed="false">${I("scan",24)}<h3 class="title">빠른 검사</h3><p class="desc">실행 중인 프로세스 · 시작 프로그램</p></button>
          <button type="button" class="card clickable" aria-pressed="false" data-state="hover">${I("file-search",24)}<h3 class="title">사용자 지정 검사</h3><p class="desc">폴더 · 확장자를 골라 검사</p></button>
          <button type="button" class="card clickable on" aria-pressed="true">${I("shield-check",24)}<h3 class="title">정밀 검사</h3><p class="desc">모든 드라이브 · 압축 파일 포함</p></button>
          <button type="button" class="card clickable" aria-pressed="false" disabled>${I("database",24)}<h3 class="title">메모리 포렌식</h3><p class="desc">EDR 라이선스가 필요합니다</p></button>
        </div>` },
      { id: "size", title: "Size", desc: "md(padding 24 · gap 12 · 제목 Title/1 16/24 SemiBold)와 sm(padding 16 · gap 8 · 제목 Label/1 14/20 SemiBold) 두 가지입니다. sm 은 밀도 높은 그리드에 씁니다. <code>.compact</code> 는 sm 의 옛 이름입니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card md" style="width:300px"><div class="card-head"><h3 class="title">md</h3><span class="tag ok">정상</span></div><p class="desc">padding 24 · gap 12 · 제목 16/24</p></div>
          <div class="card sm" style="width:280px"><div class="card-head"><h3 class="title">sm</h3><span class="tag ok sm">정상</span></div><p class="desc">padding 16 · gap 8 · 제목 14/20</p></div>
        </div>` },
      { id: "flat", title: "Flat", desc: "주변에 배경색(<code>background/neutral/secondary</code>)이 있을 때는 보더 없이 면 색 차이로만 가릅니다(<code>.flat</code>). 그림자는 두지 않습니다. 흰 바탕(<code>background/neutral/primary</code>) 위에서는 카드가 바탕과 같은 색이라 쓰지 않습니다. 보더 자리(1px)는 남아 outline 과 크기가 같습니다.", html: `
        <div style="background:var(--background-neutral-secondary);padding:24px;border-radius:var(--radius-lg);display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
          <div class="card flat" style="width:300px">
            <div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div>
            <p class="desc">1,000석 중 842석 사용 중. 2026-12-31 만료.</p>
          </div>
          <div class="card flat" style="width:300px">
            <div class="card-head"><h3 class="title">PC-2041</h3><span class="indicator ok">온라인</span></div>
            <dl class="card-meta"><dt>에이전트</dt><dd>6.2.1</dd><dt>그룹</dt><dd>개발팀</dd><dt>IP</dt><dd>10.20.4.41</dd></dl>
          </div>
        </div>` },
      { id: "empty", title: "Empty · Error", desc: "카드 틀과 헤더는 남기고 본문 자리만 바꿉니다. 빈 상태는 '데이터 없음' 문구, 오류는 negative 아이콘 · 문구와 '다시 시도' 버튼입니다. 카드가 이미 보더 · 면을 가지므로 안의 <code>.empty</code> 는 점선 · 면 없이, 아이콘도 칸 없이 36 으로 그려집니다.", html: `
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
      { id: "loading", title: "Loading", desc: "데이터를 기다리는 동안 내용 자리에 Skeleton 을 넣고 컨테이너에 <code>aria-busy</code> 를 둡니다. 로드되면 같은 자리를 실제 내용으로 바꿉니다.", html: `
        <div class="card" style="width:360px" aria-busy="true">
          <span class="skeleton title"></span>
          <span class="skeleton text"></span>
          <span class="skeleton text short"></span>
        </div>` },
    ],
    props: [
      ["Card / .card", "container", "—", "flex column · 최소 폭 260 · radius/lg · 1px line/neutral/secondary · surface/elevated/primary. 화면 전체를 감싸는 틀로 쓰지 않고, 카드 안에 카드를 겹치지 않습니다"],
      ["size / .sm · .md", "\"sm\" | \"md\"", "\"md\"", "md padding 24 · gap 12 · 제목 Title/1 16/24 600 / sm padding 16 · gap 8 · 제목 Label/1 14/20 600 — 밀도 높은 그리드"],
      ["CardHead · CardTitle / .card-head · .title", "element", "—", "제목 + 오른쪽 요소 하나(상태 Tag · Select Button · '전체 보기' 텍스트 assistive 버튼 중 하나). <code>CardTitle</code> 기본 h3"],
      ["CardDesc / .desc", "element", "—", "Body/2 14 secondary"],
      ["CardMeta / dl.card-meta", "element", "—", "상태 카드의 키-값 행 — dt secondary · dd primary · 14/22, 키 열은 가장 긴 키에 맞춤. React <code>items={[{ label, value }]}</code> 또는 dt · dd 자식"],
      ["CardFoot / .card-foot", "element", "—", "액션 오른쪽 정렬 · 간격 12 · 강조 버튼은 하나"],
      ["variant / .flat", "\"outline\" | \"flat\"", "\"outline\"", "outline 1px line/neutral/secondary 보더 / flat 보더 색 없음(두께 1px 는 남아 크기 같음) — 주변에 배경색 <code>background/neutral/secondary</code> 이 있을 때만. 흰 바탕 위 금지 · 그림자 없음. KPI · Chart Card 도 같은 옵션"],
      ["flush / .flush", "boolean", "false", "padding · gap 0 — 테두리 없는 표 · 목록을 카드 폭까지. 헤더만 자체 여백(md 16 · 24 / sm 12 · 16). 안의 Table 은 테두리가 없어 그대로(가로 스크롤이 필요 없으면 <code>wrap={false}</code>) · List 는 자체 테두리가 있어 두 겹"],
      ["clickable / .clickable", "boolean", "false", "카드 전체가 눌림 — 이동이면 <code>a</code>, 선택이면 <code>button</code> + <code>aria-pressed</code>(React <code>as</code>). hover shadow/2. 안에 버튼 · 링크를 두지 않습니다"],
      ["selected / .on", "boolean", "false", "선택됨 — 안쪽 2px brand 링 + surface/brand/subtle, 앞 아이콘 brand. 포커스 외곽선과 함께 보입니다"],
      ["disabled / :disabled · aria-disabled", "boolean", "false", "고를 수 없는 선택 카드 — surface/disable 면 · 제목과 아이콘 foreground/disable, hover 없음, 눌러도 선택되지 않음. 이유는 <code>.desc</code> 에 적고 그 줄은 tertiary 로 읽히게 둡니다. button 이면 <code>disabled</code>, 그 밖은 <code>aria-disabled</code>"],
      ["loading / aria-busy", "boolean", "false", "내용 자리를 Skeleton 으로 바꾸고 <code>aria-busy</code> 를 켭니다"],
      ["CardGrid / .card-grid", "container", "—", "auto-fill minmax(260px, 1fr) · gap 20. 안의 선택 카드는 ds.js 가 단일 선택으로 묶어 <code>.on</code> · <code>aria-pressed</code> 를 갱신하고 <code>ds:select</code> 를 발행합니다"],
      ["compact / .compact", "boolean", "false", "<b>호환용</b> — sm 의 옛 이름. React 는 개발 모드에서 경고합니다"],
      ["bordered / .bordered", "boolean", "false", "<b>호환용 — 효과 없음.</b> 기본 카드가 이미 1px 보더입니다"],
    ],
    spec: [["Size", "md padding 24 · gap 12 · sm padding 16 · gap 8 · flush 0 · 최소 폭 260"], ["Container", "radius/lg 8 · 1px line/neutral/secondary · surface/elevated/primary · flat 은 보더 색 없음(background/neutral/secondary 위 전용) · 선택 2px brand 링 · Disabled surface/disable"], ["Label", "제목 md Title/1 16/24 SemiBold · sm Label/1 14/20 SemiBold · 설명 Body/2 14 secondary · 키 secondary · 값 primary"], ["Placement", "대시보드 그리드(minmax 260 · gap 20) · 상세 정보 블록 · 선택지 묶음 · 카드 안 카드 금지"], ["Motion", "선택 · 이동 카드 hover --motion-fast 로 그림자 없음 → shadow/2"]],
    figma: { frame: "Card", radius: "radius/lg", sizes: { md: { pad: 24 }, sm: { pad: 16 }, flush: { pad: 0 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-secondary" }, status: {}, list: {}, selection: {}, empty: {}, error: {} }, variant: { outline: { stroke: "--line-neutral-secondary" }, flat: { stroke: "transparent", canvas: "--background-neutral-secondary" } }, states: ["default", "hover", "selected", "focused", "disabled", "loading"] },
  },

  /* ------------------------------------------------ Popup */
  "popup": {
    status: "ready", react: ["Popup","PopupSurface","PopupTitle","PopupBody","PopupActions","PopupForm"], css: [".popup", ".popup-backdrop"], borrows: [".btn", ".field", ".checkbox", ".notice"],
    desc: "사용자의 확인이나 짧은 입력을 받아야 진행할 때 화면 위에 띄우는 모달입니다. 되돌리기 어려운 동작 앞에 둡니다. 목록을 보며 내용을 확인하려면 <a href=\"#/components/side-panel\">Side Panel</a> 을 씁니다.",
    principles: [
      ["언제", "응답을 받아야 진행할 때만 씁니다. 자주 띄우면 흐름을 끊습니다. 큰 표 · 가로 스크롤 · 여러 단계 이동은 넣지 않고 별도 페이지로 보냅니다."],
      ["닫기", "헤더의 닫기(X)는 필수이고 빌드가 검사합니다. Esc · 취소로도 닫힙니다. 입력 중이거나 위험 확인이면 배경을 눌러도 닫지 않습니다."],
      ["첫 포커스", "닫기(X)와 위험 실행 버튼을 건너뜁니다. 입력칸이 있으면 입력칸, 없으면 취소에 놓습니다."],
      ["주 버튼", "제목의 동작을 그대로 씁니다. '정책을 배포할까요?' 의 주 버튼은 '확인' 이 아니라 '배포' 입니다. 빌드가 검사합니다."],
      ["처리 중", "주 버튼을 loading 으로 두고 닫는 길(X · 취소 · Esc · 배경)을 모두 막습니다. 실패하면 팝업을 유지하고 안에 오류를 보입니다. 입력한 내용을 잃지 않게 하려는 것입니다."],
      ["위험 확인", "<code>.danger</code> 와 <code>role=alertdialog</code> 를 씁니다. 확인 문구 입력은 복구할 수 없고 대량일 때만 둡니다. 모두 확인받으면 습관적으로 넘기게 됩니다."],
      ["긴 본문", "본문만 스크롤하고 제목과 버튼은 그 자리에 둡니다."],
      ["폭", "기본 440 입니다. lg 640 은 필드가 두 열이거나 미리보기를 함께 보여 줄 때만 씁니다."],
      ["겹침", "모달 위에 모달을 띄우지 않습니다."],
    ],
    thumb: `<div class="popup" style="width:220px;padding:14px;gap:6px"><h3 class="popup-title" style="font-size:12px">정책 삭제</h3><p class="popup-body" style="font-size:12px">되돌릴 수 없습니다.</p><div class="popup-actions" style="margin-top:4px"><button class="btn sm outline assistive" style="height:26px;font-size:12px">취소</button><button class="btn sm solid negative" style="height:26px;font-size:12px">삭제</button></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "제목 · 본문 · 액션으로 이루어진 기본 구성입니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="d-title">
          <h3 class="popup-title" id="d-title">정책을 배포할까요?</h3>${popX()}
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">배포</button></div>
        </div>
      ` },
      { id: "confirm", title: "Confirm", desc: "실제 화면에서는 .popup-backdrop 으로 감쌉니다(코드 참조). 예제는 팝업만 표시.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="c-title">
          <h3 class="popup-title" id="c-title">정책을 배포할까요?</h3>${popX()}
          <p class="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다. 에이전트는 다음 체크인(최대 5분)에서 정책을 받습니다.</p>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">배포</button></div>
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
      { id: "danger", title: "Danger Confirm", desc: "삭제 · 초기화. 제목은 danger 색, 주 액션은 Negative 버튼입니다. 복구할 수 없고 대량이면 확인 문구를 입력받습니다. 배경을 눌러도 닫히지 않습니다.", html: `
        <div class="popup danger" role="alertdialog" aria-modal="true" aria-labelledby="dg-title" aria-describedby="dg-body">
          <h3 class="popup-title" id="dg-title">정책 12개를 삭제할까요?</h3>${popX()}
          <p class="popup-body" id="dg-body">삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</p>
          <div class="field"><label for="confirm">확인을 위해 "삭제" 를 입력하세요</label><input id="confirm" placeholder="삭제"></div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative" disabled>삭제</button></div>
        </div>` },
      { id: "form", title: "Form", desc: "짧은 입력(필드 1~3개). 그 이상은 별도 페이지로 보냅니다. 입력을 시작하면 배경을 눌러도 닫히지 않습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="f-title">
          <h3 class="popup-title" id="f-title">예외 추가</h3>${popX()}
          <div class="popup-form">
            <div class="field"><label for="hash">파일 해시(SHA-256)</label><input id="hash" placeholder="64자리 16진수"></div>
            <div class="field"><label for="reason">사유</label><input id="reason" placeholder="예: 사내 배포 도구"></div>
            ${cb("모든 그룹에 적용")}
          </div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">추가</button></div>
        </div>` },
      { id: "busy", title: "처리 중", desc: "주 버튼은 loading, 닫기(X)와 취소는 비활성입니다. Esc · 배경으로도 닫히지 않습니다. 사이트 <code>DS.popup.busy(true)</code>, React <code>busy</code>.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="b-title" aria-busy="true">
          <h3 class="popup-title" id="b-title">정책을 배포할까요?</h3>${popX().replace("data-popup-close", "data-popup-close disabled")}
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close disabled>취소</button><button type="button" class="btn md solid primary loading" aria-busy="true">배포</button></div>
        </div>` },
      { id: "failed", title: "실패", desc: "팝업을 닫지 않고 안에 오류를 보입니다. 원인과 다음 행동을 함께 적습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="e-title">
          <h3 class="popup-title" id="e-title">정책을 배포할까요?</h3>${popX()}
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="notice danger" role="alert"><span class="ico">${I("alert-circle",20)}</span><div><b>배포하지 못했습니다</b>정책 서버에 연결하지 못했습니다. 다시 시도하세요.</div></div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">다시 배포</button></div>
        </div>` },
    ],
    props: [[".popup-backdrop", "overlay", "—", "fixed · 중앙 정렬 · 바깥 여백 24"], [".popup", "dialog", "—", "role=dialog aria-modal aria-labelledby. 폭 440 (lg 640), 높이는 화면 안"], [".popup-title / .popup-body / .popup-actions", "elements", "—", "제목 18 / 본문 14 · 길면 스크롤 / 액션 우측"], [".popup-close", "button", "필수", "제목 바로 뒤. aria-label · data-popup-close"], [".danger", "boolean", "false", "제목 danger 색. role=alertdialog + aria-describedby 와 함께"], ["aria-busy", "\"true\"", "—", "처리 중. X · 취소 · Esc · 배경이 막힙니다(DS.popup.busy)"], [".popup-form", "container", "—", "필드 세로 16px 간격"]],
    spec: [["Size", "폭 440 (lg 640) · padding 24"], ["Container", "radius/xl 10 · shadow/3 · 배경 effect/dimmer/primary(라이트 52% · 다크 74%)"], ["Label", "제목 Heading/4 18 Bold · 본문 Body/2 14"], ["Placement", "화면 중앙. 열리면 안으로 포커스를 옮기고, 닫으면 연 요소로 돌려보냅니다"]],
    figma: { frame: "Popup", radius: "radius/xl", sizes: { md: { w: 440 }, lg: { w: 640 } }, variants: { confirm: {}, danger: {}, form: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ Side Panel */
  "side-panel": {
    status: "ready", react: ["SidePanel","SidePanelSurface"], css: [".side-panel", ".side-panel-dim", ".side-panel-header", ".side-panel-title", ".side-panel-body", ".side-panel-footer"], borrows: [".btn", ".tbl"],
    desc: "목록이나 화면을 그대로 둔 채 상세를 오른쪽에서 보여 줍니다. 응답을 받아야 진행하면 <a href=\"#/components/popup\">Popup</a> 을 씁니다.",
    principles: [
      ["언제", "목록을 보면서 한 항목을 확인할 때 씁니다. 로그 · 이벤트 상세가 대표적입니다. 양식 전체를 채우는 일은 별도 페이지로 보냅니다."],
      ["비모달이 기본", "뒤 페이지를 그대로 쓸 수 있습니다. 포커스를 가두지 않고 스크롤도 잠그지 않습니다. 다른 항목을 누르면 패널 내용을 바꿉니다."],
      ["모달", "패널의 내용을 끝내기 전에 뒤 페이지를 건드리면 안 될 때만 <code>data-modal</code> · <code>modal</code> 을 씁니다. 배경 · 포커스 가둠 · 스크롤 잠금이 함께 켜집니다."],
      ["포커스", "열면 패널로 옮깁니다. 닫을 때 포커스가 패널 안에 있었으면 연 요소로 돌려보냅니다. 사용자가 뒤 페이지로 옮겨 갔으면 뺏지 않습니다."],
      ["닫기", "닫기(X)는 필수입니다. Esc 는 포커스가 패널 안에 있을 때 닫습니다. 비모달은 바깥을 눌러도 닫히지 않습니다."],
      ["개수", "한 번에 하나입니다. 다른 패널을 열면 바꿔 끼웁니다."],
      ["위에 띄우는 것", "패널 안에서 <a href=\"#/components/popup\">Popup</a> 을 띄울 수 있습니다. 모달 패널 위에는 띄우지 않습니다."],
    ],
    thumb: `<div class="side-panel" style="width:200px"><div class="side-panel-header" style="min-height:0;padding:8px 12px"><span class="side-panel-title" style="font-size:12px;line-height:16px">이벤트 상세</span></div><div class="side-panel-body" style="padding:12px;font-size:12px">외부 USB 차단</div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "머리글 · 본문 · 바닥글로 이루어집니다. 예제는 띄우지 않은 모습입니다.", html: `
        <section class="side-panel" role="dialog" aria-labelledby="sp-d">
          ${spHead("sp-d", "이벤트 상세")}
          <div class="side-panel-body">${spFacts(SP_EVENT)}</div>
          <div class="side-panel-footer"><button type="button" class="btn md outline assistive" data-panel-close>닫기</button><button type="button" class="btn md solid primary">예외 추가</button></div>
        </section>` },
      { id: "long", title: "긴 본문", desc: "본문만 스크롤합니다. 머리글과 바닥글은 그 자리에 있습니다.", html: `
        <section class="side-panel" role="dialog" aria-labelledby="sp-l" style="height:320px">
          ${spHead("sp-l", "에이전트 상세")}
          <div class="side-panel-body">${spFacts([...SP_EVENT, ["그룹", "본사 · 개발"], ["운영체제", "Windows 11"], ["버전", "4.2.1"], ["마지막 체크인", "2026-09-07 14:20"], ["정책 수", "12"], ["라이선스", "2027-03-31 까지"]])}</div>
          <div class="side-panel-footer"><button type="button" class="btn md solid primary">격리</button></div>
        </section>` },
      { id: "live", title: "비모달", desc: "실제 동작입니다. 패널이 열려 있어도 뒤 페이지를 누르고 스크롤할 수 있습니다.", html: `
        <button type="button" class="btn md outline assistive" data-panel-open="#sp-live">이벤트 상세 열기</button>
        <section class="side-panel" id="sp-live" role="dialog" aria-labelledby="sp-live-t" hidden>
          ${spHead("sp-live-t", "이벤트 상세")}
          <div class="side-panel-body">${spFacts(SP_EVENT)}</div>
        </section>` },
      { id: "modal", title: "모달", desc: "실제 동작입니다. 배경을 누르거나 Esc 로 닫고, 포커스는 패널 안에 머뭅니다.", html: `
        <button type="button" class="btn md outline assistive" data-panel-open="#sp-modal">격리 설정 열기</button>
        <section class="side-panel lg" id="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-modal-t" data-modal hidden>
          ${spHead("sp-modal-t", "격리 설정")}
          <div class="side-panel-body">${spFacts(SP_EVENT)}</div>
          <div class="side-panel-footer"><button type="button" class="btn md outline assistive" data-panel-close>취소</button><button type="button" class="btn md solid primary" data-panel-close>격리</button></div>
        </section>` },
    ],
    props: [
      [".side-panel", "section", "—", "role=dialog · aria-labelledby. 폭 400 (.lg 560)"],
      [".fixed", "boolean", "false", "화면 오른쪽에 띄웁니다. DS.panel.open 이 붙입니다"],
      ["data-modal", "boolean", "false", "배경 · 포커스 가둠 · 스크롤 잠금. aria-modal=true 와 함께"],
      ["data-panel-open / data-panel-close", "속성", "—", "여는 버튼(값은 선택자) / 닫는 버튼"],
      ["DS.panel.open(sel) / close()", "API", "—", "닫으면 ds:panel-close 가 납니다"],
      [".side-panel-header / -body / -footer", "elements", "—", "본문만 스크롤. 바닥글은 없어도 됩니다"],
    ],
    spec: [["Size", "폭 400 (lg 560) · 머리글 최소 높이 56 · 본문 padding 20 · 바닥글 padding 12 20"], ["Container", "surface/elevated/primary · 왼쪽 선 line/neutral/secondary · shadow/3"], ["Label", "제목 Title/1 16 SemiBold · 본문 Body/2 14"], ["Placement", "화면 오른쪽 끝 · 위아래 전체. Popup(100)과 Toast(110) 아래"]],
  },

  /* ------------------------------------------------ Tooltip */
  "tooltip": {
    status: "ready", react: ["Tooltip"], css: [".tooltip", ".tooltip-wrap"], borrows: [".btn", ".indicator"],
    desc: "아이콘 버튼의 이름이나 짧은 보조 설명을 마우스를 올리거나 포커스할 때 보여 줍니다.",
    principles: [
      ["내용", "짧은 보조 설명과 아이콘 버튼의 이름만 넣습니다. 필수 정보는 넣지 않습니다. 툴팁을 못 봐도 작업을 끝낼 수 있어야 합니다."],
      ["트리거", "포커스를 받을 수 있는 요소에만 답니다. 비활성 요소와 Tag 같은 비인터랙티브 요소에는 달지 않고, 빌드가 검사합니다."],
      ["되풀이", "보이는 라벨을 되풀이하지 않습니다. 아이콘 전용 버튼은 이름이 곧 툴팁이므로 <code>aria-label</code> 만 두고 <code>aria-describedby</code> 를 잇지 않습니다."],
      ["안에 넣지 않는 것", "링크 · 버튼을 넣지 않습니다. 포커스가 닿지 않습니다. 단축키를 툴팁에만 두지 않습니다."],
      ["동작", "마우스는 0.3초 뒤, 키보드 포커스는 바로 보입니다. Esc 로 닫습니다. 화면 끝이면 반대쪽으로 뒤집고, 스크롤되는 영역 안에서도 잘리지 않습니다."],
      ["차트 값", "차트의 값 표시는 <a href=\"#/components/data-visual\">Data Visual</a> 의 몫입니다. 이 컴포넌트를 쓰지 않습니다."],
    ],
    thumb: `<span class="tooltip-wrap show"><button class="btn sm outline assistive icon-only" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip" role="tooltip">새로 고침</span></span>`,
    examples: [
      { id: "default", title: "Default", desc: "요소 위쪽에 뜨는 기본 위치입니다.", html: `<span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">새로 고침</button><span class="tooltip" role="tooltip">목록을 다시 불러옵니다</span></span>` },
      { id: "position", title: "Position", desc: "기본 위. .bottom / .left / .right. 예제는 .show 로 항상 표시.", html: `
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Top</button><span class="tooltip" role="tooltip">위 (기본)</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Bottom</button><span class="tooltip bottom" role="tooltip">아래</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Left</button><span class="tooltip left" role="tooltip">왼쪽</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Right</button><span class="tooltip right" role="tooltip">오른쪽</span></span>`, style: "gap:104px;padding:64px 40px" },
      { id: "hover", title: "On Hover / Focus", desc: "실제 동작입니다. 아이콘 버튼 위에 마우스를 올리거나 포커스하세요. 이름이 곧 툴팁이라 aria-describedby 는 잇지 않습니다.", html: `
        <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip" role="tooltip" id="tt1">새로 고침</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="필터">${I("filter")}</button><span class="tooltip" role="tooltip" id="tt2">필터</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md outline negative icon-only" aria-label="삭제">${I("trash")}</button><span class="tooltip" role="tooltip" id="tt3">삭제</span></span>`, style: "padding-top:64px" },
      { id: "multi", title: "Multiline", desc: "두 줄 이상은 .multi (폭 220). 그 이상 설명은 Popover/도움말 링크.", html: `
        <span class="indicator warn">검토 필요</span><span class="tooltip-wrap show"><button type="button" class="btn sm text assistive icon-only" aria-label="검토 필요 이유" aria-describedby="tt-multi">${I("info-circle")}</button><span class="tooltip multi" role="tooltip" id="tt-multi">게시자 서명을 확인하지 못한 실행 파일입니다. 신뢰할 수 있는 파일이면 예외로 추가할 수 있습니다.</span></span>`, style: "padding-top:96px" },
    ],
    props: [[".tooltip-wrap", "container", "—", "position:relative 트리거 래퍼"], [".tooltip", "span", "—", "role=tooltip. 기본 위치 위"], ["position", ".bottom | .left | .right", "top", "위치"], [".show", "boolean", "false", "강제 표시(문서·디버그)"], [".multi", "boolean", "false", "여러 줄, 폭 220"], [".quiet", "boolean", "false", "Esc 로 닫힌 상태. ds.js 가 붙이고, 마우스 · 포커스가 떠나면 뗍니다"], [".float", "boolean", "false", "화면 기준 위치. ds.js 가 스크롤 영역 안에서 붙입니다"]],
    spec: [["Size", "높이 30 · padding 6 10 · 트리거와 8px"], ["Container", "radius 6 · surface/neutral/inverse · shadow/2 · 화살표 5px"], ["Label", "Caption/1 12 · 행간 18 · Medium · inverse"], ["Placement", "아이콘 전용 버튼의 이름, 잘린 글자의 전체 보기"]],
    figma: { frame: "Tooltip", radius: 6, sizes: { md: { h: 30 } }, variants: { top: {}, bottom: {}, left: {}, right: {} }, states: ["default", "multiline"] },
  },

  /* ------------------------------------------------ Notification */
  "notification": {
    status: "ready", react: ["Notice","Toast","ToastStack","Banner","ToastProvider","useToast"], css: [".notice", ".toast", ".toast-stack", ".banner"], borrows: [".btn"],
    desc: "시스템 상태와 결과를 알립니다. 페이지 안에 머무는 Notice, 잠시 떴다 사라지는 Toast, 화면 상단 전체 공지 Banner 를 구분합니다.",
    principles: [
      ["고르기", "사용자가 언제까지 봐야 하는지로 고릅니다. 방금 한 동작의 결과는 Toast, 화면 일부의 지속 상태는 Notice, 제품 전체에 영향을 주는 공지는 Banner, 응답을 받아야 진행하면 <a href=\"#/components/popup\">Popup</a> 입니다. 기준표는 <a href=\"#/foundations/interaction\">Interaction</a> 에 있습니다."],
      ["Toast 시간", "기본 4초, 실행 취소 같은 동작이 있으면 10초입니다. 마우스를 올리거나 포커스가 들어오면 묶음 전체의 시간이 멈춥니다."],
      ["오류 Toast", "닫을 때까지 남고 닫기 버튼이 있습니다. <code>duration</code> 을 줘도 사라지지 않습니다."],
      ["쌓임", "동시에 3개까지입니다. 넘치면 자동으로 사라지는 것부터 지웁니다. 닫을 때까지 남는 오류는 밀리지 않으므로 3개를 넘을 수 있습니다."],
      ["같은 알림", "동작이 없는 같은 문구는 쌓지 않고 시간을 다시 잽니다. 동작이 있으면 실행 취소 대상이 서로 달라 합치지 않습니다."],
      ["Banner", "한 번에 하나입니다. 닫으면 사이트는 <code>ds:banner-close</code>, React 는 <code>onClose</code> 가 납니다. 다시 띄울지는 제품이 정합니다."],
      ["알리는 세기", "<code>role=alert</code> 는 바로 알아야 하는 위험에만 씁니다. Toast 묶음은 <code>aria-live=polite</code> 입니다."],
      ["문구", "오류에는 원인과 다음 행동을 함께 적습니다. 폼 필드 오류는 Toast 로 알리지 않고 필드 아래에 적습니다."],
    ],
    thumb: `<div class="notice warning" style="max-width:240px;padding:10px 12px;font-size:12px"><span class="ico">${I("alert-triangle",20)}</span><div><b>라이선스 만료 임박</b>3일 후 만료</div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "본문 안에 머무는 기본 인라인 알림입니다.", html: `<div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle")}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div></div>` },
      { id: "notice", title: "Notice (Inline)", desc: "페이지에 고정. Info · Success · Warning · Danger. role=status(정보) 또는 alert(위험).", html: `
        <div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle",20)}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>
        <div class="notice success" role="status" style="max-width:600px"><span class="ico">${I("circle-check",20)}</span><div><b>배포 완료</b>1,284대 중 1,284대에 적용되었습니다.</div></div>
        <div class="notice warning" role="status" style="max-width:600px"><span class="ico">${I("alert-triangle",20)}</span><div><b>라이선스가 3일 후 만료됩니다</b>만료 시 신규 이벤트 수집이 중단됩니다.<div class="actions"><button type="button" class="btn sm solid primary">갱신 요청</button></div></div></div>
        <div class="notice danger" role="alert" style="max-width:600px"><span class="ico">${I("alert-circle",20)}</span><div><b>에이전트 37대 연결 끊김</b>10분 이상 체크인이 없습니다. 네트워크 상태를 확인하세요.</div></div>`, layout: "stack" },
      { id: "toast", title: "Toast", desc: "짧은 결과 알림입니다. 우측 하단에 뜨고 4초 뒤 사라지며, 동작이 있으면 10초입니다. 오류는 닫을 때까지 남습니다.", html: `
        <div class="toast-stack" aria-live="polite">
          <div class="toast"><span class="ico">${I("circle-check",20)}</span>정책 'USB 차단' 이 저장되었습니다<button type="button" class="action">실행 취소</button></div>
          <div class="toast danger"><span class="ico">${I("alert-circle",20)}</span>내보내기에 실패했습니다<button type="button" class="action">다시 시도</button><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>
        </div>` },
      { id: "banner", title: "Banner", desc: "시스템 전체 공지(점검 · 라이선스)입니다. 헤더 위 전체 폭에 한 번에 하나만 둡니다.", html: `
        <div class="banner" role="status">${I("info-circle")}9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다. 점검 중 콘솔 접속이 제한됩니다.<button type="button" class="btn sm outline assistive">점검 안내 보기</button><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>`, layout: "stack", style: "padding:24px 0;gap:8px" },
    ],
    props: [[".notice", "div", "—", "role=status | alert. .ico + div(b 제목 + 본문 + .actions) + .close"], ["tone", "info | success | warning | danger", "neutral", "톤별 subtle 배경 + 30% 보더"], [".toast", "div", "—", "폭 360, 어두운 배경. .action 하나, 닫을 때까지 남으면 .close"], ["data-duration", "ms", "4000", "자동 소멸 시간. 0 이면 닫을 때까지. DS.toast 는 동작이 있으면 10000, 오류는 늘 0"], [".toast-stack", "container", "—", "aria-live=polite, 우측 하단 고정"], [".banner", "div", "—", "전체 폭. accent / .warning / .danger. .close 는 ds:banner-close 를 냅니다"]],
    spec: [["Size", "Notice padding 14 18 · Toast 폭 360 · Banner padding 10 20"], ["Container", "Notice radius/lg 8 · 톤별 surface · line 토큰 · Toast surface/neutral/inverse"], ["Label", "제목 14 Bold · 본문 Body/2 14"], ["Placement", "Notice 는 페이지 헤더 아래, Toast 우측 하단, Banner 헤더 위"]],
    figma: { frame: "Notification", radius: "radius/lg", sizes: { notice: { minH: 56 }, toast: { w: 360 }, banner: { h: 44 } }, variants: { info: { bg: "--surface-accent-cyan", fg: "--surface-accent-cyan" }, success: { bg: "--surface-positive-primary", fg: "--surface-positive-primary" }, warning: { bg: "--surface-cautionary-primary", fg: "--surface-cautionary-primary" }, danger: { bg: "--surface-negative-primary", fg: "--surface-negative-strong" }, toast: { bg: "--surface-neutral-inverse", fg: "--foreground-neutral-inverse" } }, states: ["default", "with-action", "dismissible"] },
  },

  /* ------------------------------------------------ Loading */
  "loading": {
    status: "ready", react: ["Spinner","Skeleton","SkeletonRow","Progress"], css: [".spinner", ".spinner-wrap", ".skeleton", ".skeleton-row", ".progress", ".progress-row"],
    desc: "기다리는 동안의 상태를 알립니다. 영역의 첫 로딩은 Skeleton, 짧은 동작은 Spinner, 진행률을 알면 Progress 를 씁니다.",
    principles: [
      ["고르기", "시간 기준은 <a href=\"#/foundations/interaction\">Interaction</a> 의 Loading 표를 따릅니다."],
      ["1초 미만", "금방 끝날 수도 있는 기다림에는 <code>data-delay</code> · React <code>delay</code> 를 답니다. 1초 안에 끝나면 표시가 깜빡이지 않습니다. 한 번 보이면 0.5초는 유지합니다(<code>DS.loading</code> · <code>useLoadingDelay</code>)."],
      ["누른 반응", "버튼 loading · Switch 처리 중은 기다리지 않습니다. 누른 반응이 바로 보여야 두 번 누르지 않습니다. 빌드가 검사합니다."],
      ["Spinner 이름", "'불러오는 중' 만 쓰지 않고 실제 작업을 적습니다. 빌드가 검사합니다."],
      ["Skeleton", "완성될 콘텐츠의 크기와 모양에 맞춥니다."],
      ["Progress", "진행률을 알 때만 씁니다. <code>value</code> 는 필수이고, 끝을 알 수 없는 진행 막대는 제공하지 않습니다. 그때는 Spinner 를 씁니다."],
      ["오래 걸리는 작업", "취소하거나 백그라운드로 돌릴 길을 제공합니다."],
      ["줄인 모션", "Spinner · 버튼 loading · Switch 처리 중은 계속 돕니다. 멈춘 스피너는 고장으로 보입니다. Skeleton · 맥박은 멈춥니다."],
    ],
    thumb: `<span class="spinner"></span><div style="width:120px;display:flex;flex-direction:column;gap:6px"><span class="skeleton title" style="width:60%"></span><span class="skeleton text"></span></div>`,
    examples: [
      { id: "default", title: "Default", desc: "기본 크기(24px) 스피너입니다.", html: `<span class="spinner" role="status" aria-label="이벤트 불러오는 중"></span>` },
      { id: "spinner", title: "Spinner", desc: "sm 16 · md 24 · lg 40. 버튼 안에서는 Button .loading 을 씁니다.", html: `
        <span class="spinner sm" role="status" aria-label="목록 불러오는 중"></span>
        <span class="spinner" role="status" aria-label="정책 불러오는 중"></span>
        <span class="spinner lg" role="status" aria-label="보고서 만드는 중"></span>
        <div class="spinner-wrap" role="status"><span class="spinner"></span>이벤트를 불러오는 중…</div>` },
      { id: "skeleton", title: "Skeleton", desc: "콘텐츠 형태를 미리 보여줍니다. 목록·카드의 첫 로딩에.", html: `
        <div style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:14px" aria-busy="true">
          <div class="skeleton-row"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text"></span></div></div>
          <div class="skeleton-row"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text short"></span></div></div>
          <span class="skeleton rect"></span>
        </div>` },
      { id: "delay", title: "Delay", desc: "<code>data-delay</code> 를 달면 1초 동안 자리만 지키고 보이지 않습니다. 그 안에 끝나면 아무것도 깜빡이지 않습니다. 시간은 <code>--ds-delay</code> 로 바꿉니다(아래 줄은 0.3초).", html: `
        <span class="spinner" data-delay role="status" aria-label="정책 불러오는 중"></span>
        <div style="width:100%;max-width:520px" aria-busy="true"><div class="skeleton-row" data-delay style="--ds-delay:300ms"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text"></span></div></div></div>` },
      { id: "progress", title: "Progress", desc: "진행률을 알 때. 배포·검사 진행. 완료는 success, 실패는 danger.", html: `
        <div style="width:100%;max-width:480px;display:flex;flex-direction:column;gap:20px">
          <div class="progress-row"><div class="row"><span>정책 배포 중</span><span>842 / 1,284</span></div><div class="progress" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100"><i style="width:66%"></i></div></div>
          <div class="progress-row"><div class="row"><span>전체 검사 완료</span><span>100%</span></div><div class="progress success" role="progressbar" aria-valuenow="100"><i style="width:100%"></i></div></div>
          <div class="progress-row"><div class="row"><span>업데이트 실패</span><span>38%</span></div><div class="progress danger" role="progressbar" aria-valuenow="38"><i style="width:38%"></i></div></div>
        </div>` },
    ],
    props: [[".spinner", "span", "—", "role=status · aria-label 은 실제 작업. sm | (md) | lg"], [".skeleton", "span", "—", ".title | .text(.short) | .circle | .rect. 컨테이너에 aria-busy"], [".progress", "div", "—", "role=progressbar aria-valuenow. i 의 width 가 진행률"], ["tone", ".success | .danger", "accent", "완료 / 실패"], [".sm", "boolean", "false", "높이 4"], ["data-delay", "attr", "—", ".spinner · .spinner-wrap · .skeleton · .skeleton-row 에. <code>--ds-delay</code>(기본 1s) 동안 자리를 지킨 채 보이지 않는다 — 줄인 모션에서도. React <code>delay</code>(true | ms)"], ["DS.loading.start(el, {delay, min}) · stop(el)", "function", "1000 · 500 ms", "보일지를 정한다 — delay 안에 stop 하면 끝내 안 보이고, 보였으면 min 을 채운 뒤 숨긴다(el.hidden). stop 은 숨긴 뒤 풀리는 Promise. 이 요소에는 data-delay 를 달지 않는다. React <code>useLoadingDelay(loading, {delay, minDuration})</code>"]],
    spec: [["Size", "Spinner 16/24/40 · Skeleton 행 14 · Progress 8 (sm 4)"], ["Container", "Skeleton radius 6 · Progress radius/full"], ["Label", "문구 12 Regular — 스피너 tertiary · 진행 secondary"], ["Placement", "Skeleton 은 콘텐츠 자리 그대로, Spinner 는 영역 중앙"]],
    figma: { frame: "Loading", sizes: { spinner: { sm: 16, md: 24, lg: 40 }, progress: { h: 8 } }, variants: { spinner: {}, skeleton: { bg: "--surface-neutral-strong" }, progress: { fill: "--surface-brand-primary", track: "--surface-neutral-strong" } }, states: ["default", "success", "danger"] },
  },

  /* ------------------------------------------------ Indicator */
  "indicator": {
    status: "ready", react: ["Indicator","Count","WithCount"], css: [".indicator", ".count", ".with-count"], borrows: [".btn"],
    desc: "상태 점, 건수 배지처럼 작은 시각 신호입니다. 텍스트 라벨과 함께 써 색만으로 의미를 전달하지 않습니다. 진행 단계는 <a href=\"#/components/steps\">Steps</a> 를 씁니다.",
    principles: [
      ["Pulse", "실제로 진행 중일 때만 씁니다. 지난 일이나 강조에 쓰지 않습니다."],
      ["Count", "99 를 넘으면 99+ 입니다. 0 은 표시하지 않습니다. 빌드가 검사합니다."],
    ],
    thumb: `<span class="indicator ok">정상</span><span class="indicator danger">차단</span><span class="count">3</span>`,
    examples: [
      { id: "default", title: "Default", desc: "상태 점과 라벨을 함께 쓰는 기본 형태입니다.", html: `<span class="indicator ok">정상</span>` },
      { id: "status", title: "Status Dot", desc: "에이전트·서비스 상태. 라벨 필수. 실시간 위험은 .pulse.", html: `
        <span class="indicator ok">정상</span>
        <span class="indicator warn">주의</span>
        <span class="indicator danger">장애</span>
        <span class="indicator info">점검 중</span>
        <span class="indicator">오프라인</span>
        <span class="indicator danger pulse">실시간 공격 탐지</span>` },
      { id: "count", title: "Count Badge", desc: "미확인 건수. 99 초과는 99+. 아이콘 위에는 .with-count.", html: `
        <span class="count">3</span>
        <span class="count">99+</span>
        <span class="count accent">12</span>
        <span class="count neutral">128</span>
        <span class="with-count"><button type="button" class="btn md outline assistive icon-only" aria-label="알림 5건">${I("bell")}</button><span class="count">5</span></span>
        <span class="with-count"><button type="button" class="btn md outline assistive icon-only" aria-label="새 알림">${I("bell")}</button><span class="count dot" aria-hidden="true"></span></span>` },
    ],
    props: [[".indicator", "span", "—", "점 + 라벨. ok | warn | danger | info | accent | (neutral)"], [".pulse", "boolean", "false", "깜빡임(위험 실시간)"], [".count", "span", "—", "건수. 기본은 진한 빨강(--foreground-negative-strong) + 흰 숫자. .accent / .neutral / .dot(점만)"], [".with-count", "wrapper", "—", "아이콘 우상단에 count 배치"]],
    spec: [["Size", "점 8 · count 높이 20"], ["Container", "radius/full"], ["Label", "Body/2 14 · count 12 Bold"], ["Placement", "테이블 상태 열, 내비 건수"]],
    figma: { frame: "Indicator", radius: "radius/full", sizes: { dot: 8, count: { h: 20 }, step: 24 }, variants: { ok: { fg: "--foreground-positive-primary" }, warn: { fg: "--foreground-cautionary-primary" }, danger: { fg: "--foreground-negative-primary" }, info: { fg: "--foreground-accent-cyan" }, accent: { fg: "--foreground-brand-primary" }, neutral: { fg: "--foreground-inactive-primary" },
      count: { bg: "--foreground-negative-strong", fg: "--static-white", neutral: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" }, accent: { bg: "--surface-brand-primary", fg: "--brand-label" } },
      steps: { todo: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" }, done: { bg: "--surface-positive-primary", icon: "--foreground-positive-primary" }, on: { bg: "--surface-brand-primary", fg: "--brand-label" } } }, states: ["default", "pulse"] },
  },

  /* ------------------------------------------------ Steps — Indicator 에서 분리(사람의 결정 2026-11-10) */
  "steps": {
    status: "ready", react: ["Steps"], css: [".steps", ".sr-only"],   // .sr-only — 완료 숨김 문구가 쓴다. 빠지면 복사한 CSS 에서 " (완료)" 가 화면에 보인다
    desc: "온보딩 · 마법사처럼 순서대로 진행하는 일에서 지금 어디에 있는지 보여 줍니다. 같은 층위의 화면 전환은 <a href=\"#/components/tab\">Tab</a> 을 씁니다.",
    principles: [
      ["단계 수", "3~6단계입니다. 2단계면 표시하지 않고, 7단계를 넘으면 묶습니다. 빌드와 React 가 검사합니다."],
      ["라벨", "1~2단어의 명사로 씁니다."],
      ["돌아가기", "완료한 단계로만 돌아갈 수 있습니다. 앞 단계로 건너뛰지 않습니다."],
      ["상태", "완료는 체크 아이콘과 숨긴 '(완료)' 문구, 현재는 <code>aria-current=\"step\"</code> 로 알립니다."],
    ],
    thumb: `<ol class="steps" aria-label="진행 단계" style="font-size:12px"><li class="done"><i style="width:18px;height:18px;font-size:10px">${I("check",10)}</i>1</li><li class="on"><i style="width:18px;height:18px;font-size:10px">2</i>2</li><li><i style="width:18px;height:18px;font-size:10px">3</i>3</li></ol>`,
    examples: [
      { id: "default", title: "Default", desc: "완료 .done, 현재 .on. 단계 사이는 선으로 잇습니다.", html: `
        <ol class="steps" aria-label="진행 단계">
          <li class="done"><i>${I("check",12)}</i>기본 정보<span class="sr-only"> (완료)</span></li>
          <li class="done"><i>${I("check",12)}</i>적용 대상<span class="sr-only"> (완료)</span></li>
          <li class="on" aria-current="step"><i>3</i>규칙 설정</li>
          <li><i>4</i>검토 · 배포</li>
        </ol>` },
      { id: "vertical", title: "Vertical", desc: "좁은 패널에서 세로로 놓습니다. .vertical.", html: `
        <ol class="steps vertical" aria-label="진행 단계">
          <li class="done"><i>${I("check",12)}</i>기본 정보<span class="sr-only"> (완료)</span></li>
          <li class="on" aria-current="step"><i>2</i>적용 대상</li>
          <li><i>3</i>규칙 설정</li>
          <li><i>4</i>검토 · 배포</li>
        </ol>` },
      { id: "back", title: "Back to Done", desc: "완료한 단계를 눌러 돌아갑니다. 누르면 <code>ds:step {index}</code>. 단계 이동은 제품이 합니다.", html: `
        <ol class="steps" aria-label="진행 단계">
          <li class="done"><button type="button" class="step-btn"><i>${I("check",12)}</i>기본 정보<span class="sr-only"> (완료)</span></button></li>
          <li class="done"><button type="button" class="step-btn"><i>${I("check",12)}</i>적용 대상<span class="sr-only"> (완료)</span></button></li>
          <li class="on" aria-current="step"><i>3</i>규칙 설정</li>
          <li><i>4</i>검토 · 배포</li>
        </ol>` },
    ],
    props: [[".steps", "ol", "—", "진행 단계. aria-label 필수"], [".steps li", "li", "—", ".done 완료(체크 아이콘 --foreground-positive-primary), .on 현재"], [".vertical", "boolean", "false", "세로 배치"], [".step-btn", "button", "—", "완료 단계로 돌아가는 버튼. .done 안에만"], ["ds:step", "event", "—", "돌아가기를 누르면 {index}. React onStepClick(index)"]],
    spec: [["Size", "원 24 · 연결선 32 · 간격 8"], ["Container", "원 radius/full"], ["Label", "12 · 현재 12 SemiBold"], ["Placement", "온보딩 · 마법사 상단"]],
  },

  /* ------------------------------------------------ Divider */
  "divider": {
    status: "ready", react: ["Divider"], css: [".divider"], borrows: [".t-body-2", ".btn"],
    desc: "콘텐츠 그룹을 나눕니다. 여백과 배경 차이로 구획이 되면 쓰지 않고, 꼭 필요한 곳에만 아주 연하게.",
    principles: [
      ["언제", "여백과 배경 차이로 구획이 되면 쓰지 않습니다."],
      ["중복 금지", "표 · 목록 · 메뉴처럼 이미 구분선이 있는 컴포넌트 안에 더하지 않습니다. 빌드가 검사합니다."],
    ],
    thumb: `<div style="width:160px"><hr class="divider" style="margin:6px 0"><hr class="divider label" style="margin:6px 0">또는</hr></div>`,
    examples: [
      { id: "default", title: "Default", desc: "영역을 나누는 기본 가로 구분선입니다.", html: `
        <div style="width:100%;max-width:480px">
          <p class="t-body-2" style="margin:0">기본 설정</p>
          <hr class="divider">
          <p class="t-body-2" style="margin:0">고급 설정</p>
        </div>
      ` },
      { id: "basic", title: "Horizontal", desc: "hr.divider. 강조는 .strong, 임시 구분은 .dashed.", html: `
        <div style="width:100%;max-width:480px">
          <p class="t-body-2" style="margin:0">기본 설정</p>
          <hr class="divider">
          <p class="t-body-2" style="margin:0">고급 설정</p>
          <hr class="divider strong">
          <p class="t-body-2" style="margin:0">감사 로그</p>
          <hr class="divider dashed">
        </div>` },
      { id: "label", title: "With Label", desc: "구분 의미가 필요할 때 가운데 라벨.", html: `
        <div style="width:100%;max-width:480px"><div class="divider label" role="separator">또는</div><div class="divider label" role="separator">2026-09-07</div></div>` },
      { id: "vertical", title: "Vertical", desc: "툴바에서 버튼 그룹을 나눕니다. 높이 24.", html: `
        <div style="display:flex;align-items:center">
          <button type="button" class="btn sm solid assistive">편집</button>
          <button type="button" class="btn sm solid assistive">복제</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm solid assistive">내보내기</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm outline negative">삭제</button>
        </div>` },
    ],
    props: [[".divider", "hr | div", "—", "가로 1px line/neutral/secondary, margin 16 0"], [".strong / .dashed", "boolean", "false", "line/neutral/primary / 점선"], [".label", "div", "—", "가운데 라벨 텍스트"], [".vertical", "span", "—", "세로 1×24, 좌우 12"]],
    spec: [["Size", "1px · 세로 24"], ["Container", "line/neutral/secondary (strong 시 line/neutral/primary)"], ["Label", "라벨 12 Regular tertiary"], ["Placement", "설정 섹션 사이, 툴바 버튼 그룹 사이"]],
    figma: { frame: "Divider", sizes: { horizontal: { h: 1 }, vertical: { w: 1, h: 24 } }, variants: { default: { stroke: "--line-neutral-secondary" }, strong: { stroke: "--line-neutral-primary" }, label: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ Data Table */
  "data-table": {
    status: "ready", react: ["DataTable","ActionBar"], css: [".tbl-wrap", ".tbl", ".action-bar", ".select-notice", ".tag", ".checkbox", ".indicator"], borrows: [".link", ".btn", ".switch", ".log-row", ".empty", ".dropdown", ".menu", ".menu-item", ".menu-sep", ".skeleton", ".sr-only", ".code-view", ".spinner", ".spinner-wrap", ".stack", ".toolbar", ".spacer", ".select-btn"],
    desc: "로그·이벤트·정책 목록처럼 대량의 행 데이터를 다룹니다. 정렬·선택·행 액션을 갖춘 콘솔의 핵심 컴포넌트입니다. 단순 표는 Table 을 씁니다.",
    thumb: `<div class="tbl-wrap" style="width:240px"><table class="tbl compact"><thead><tr><th>시간</th><th>심각도</th></tr></thead><tbody><tr><td>09:41</td><td><span class="tag critical sm">Critical</span></td></tr><tr><td>09:40</td><td><span class="tag medium sm">Medium</span></td></tr></tbody></table></div>`,
    principles: [
      ["언제 쓰는가", "정렬 · 선택 · 행 동작이 필요한 목록입니다. 몇 줄을 읽기만 하면 <a href=\"#/components/table\">Table</a>, 열이 2~3개이고 항목마다 제목 · 부제가 있으면 <a href=\"#/components/list\">List</a> 입니다"],
      ["상태", "불러오는 중은 Skeleton 행, 실패는 원인과 '다시 시도', 처음 비어 있으면 만드는 동작, 조건에 맞는 결과가 없으면 조건 초기화를 둡니다"],
      ["서버 정렬", "서버가 페이지를 나눠 주면 <code>data-sort=\"server\"</code> · <code>manualSort</code> 로 다시 정렬하지 않게 합니다. 현재 페이지만 뒤섞이면 결과가 틀려 보입니다"],
      ["전체 선택", "머리글 체크박스는 이 페이지만 고릅니다. 건수를 알면 '전체 n건 선택' 안내를 띄우고, 전체 실행은 제품 서버가 합니다"],
      ["선택 유지", "페이지를 옮겨도 선택은 남고, 필터 · 검색 · 기간이 바뀌면 지웁니다"],
      ["행 전체 클릭", "안쪽 버튼 · 링크 · 체크박스를 누르면 행 클릭이 일어나지 않습니다. 키보드로 닿도록 같은 목적지의 링크를 첫 열에 둡니다"],
      ["행 버튼 이름", "행마다 달라야 합니다. '수정' 이 아니라 'USB 차단 정책 수정' 입니다. 빌드가 검사합니다"],
      ["머리글", "정렬 말고는 링크 · 버튼을 넣지 않습니다. 정렬은 머리글 안의 버튼이라 키보드로 닿습니다"],
      ["정렬 방향", "글자 · 상태 · 날짜 · ID · IP 는 왼쪽, 크기를 견주는 숫자(건수 · % · 용량)만 오른쪽(<code>.num</code>), 행 동작은 맨 오른쪽입니다. 숫자는 표 전체가 고정폭이라 시각 · IP 도 자리가 맞습니다. 말줄임은 긴 메시지 열 하나에만 쓰고 전체 값은 상세에서 보여 줍니다"],
      ["밀도", "기본 48 · <code>.compact</code> 40(로그처럼 행이 많을 때) · <code>.relaxed</code> 56(하위 텍스트 · 두 줄 셀)입니다. 사용자가 바꾸게 하려면 툴바에 Select Button 을 두고, 고른 값은 제품이 기억합니다"],
      ["행 스타일", "가로선이 기본입니다. 행이 많아 줄을 놓치기 쉬우면 <code>.zebra</code> 입니다. 숫자가 빽빽한 리포트의 <code>.grid</code> · 작은 요약의 <code>.plain</code> 은 <a href=\"#/components/table\">Table</a> 에서 씁니다"],
      ["하위 텍스트", "열을 늘리지 않고 맥락을 줄 때 주 값 아래에 보조 글(<code>.cell-sub</code>)을 둡니다 — 이름 아래 이메일, 단말 아래 IP. 두 줄이라 <code>.relaxed</code> 를 씁니다. 정렬 · 검색 기준은 주 값입니다"],
      ["첫 열 고정", "열이 많아 가로로 스크롤하면 식별 열을 고정합니다(<code>.sticky-col</code>). 맨 앞 체크박스 · 펼침 칸도 함께 고정됩니다. 스크롤 영역이라 이름과 <code>tabindex=0</code> 을 둡니다(빌드가 검사합니다)"],
      ["합계 행", "합계 · 평균은 <code>tfoot</code> 의 <code>tr.total</code> 에 둡니다. 정렬 · 선택 · 페이지와 무관하게 맨 아래에 남고, 페이지만의 합계인지 전체의 합계인지 첫 칸에 적습니다"],
      ["고정 헤더", "세로로 긴 로그 표에 씁니다. 표 영역에 높이를 주고 이름과 <code>tabindex=0</code> 을 둡니다. 복잡한 표에는 <code>caption</code> 을 둡니다"],
      ["행을 지운 뒤", "포커스를 다음 행으로 옮깁니다. 사이트는 <code>DS.table.removeRow</code>, React 는 행이 사라지면 자동입니다"],
      ["강조", "색만으로 의미를 전하지 않습니다. 심각도 · 상태는 글자를 함께 둡니다"],
      ["행 펼침", "한 행의 상세(원본 로그 · 탐지 근거)를 페이지를 옮기지 않고 봅니다. 맨 앞 칸의 셰브론 버튼으로 열고 여러 행을 함께 펼칩니다. 행 클릭은 펼침에 쓰지 않습니다(상세 이동에 남김). 정렬하면 펼친 상세가 제 행을 따라가고, 페이지 · 필터 · 검색 · 기간이 바뀌면 모두 접습니다"],
      ["펼친 내용", "제품이 채웁니다. 키-값(<code>.detail-meta</code>)과 원본 로그(<a href=\"#/components/code\">Code</a>)를 권합니다. 서버에서 불러오면 그 자리에 Spinner 를, 실패하면 원인과 다시 시도를 둡니다"],
      ["로그 표", "자동 갱신에는 일시 정지를 둡니다. 읽는 중에 행이 밀리지 않게 새 행은 건수로 알립니다. 조회 범위(최신 100건 등)를 건수 옆에 적습니다. 제품이 구현합니다"],
    ],
    examples: [
      { id: "basic", title: "Default (Sortable)", desc: "헤더 클릭 정렬. 정렬 중인 열은 .sorted(.desc). 숫자 열은 .num. 처리할 수 없는 행은 tr.disabled + inert — 글자 · 태그 · 링크 · 상태 점이 모두 비활성 색이 되고, 행 안 링크는 마우스·키보드 모두 닿지 않습니다(React TableRow disabled 가 inert 를 함께 넣습니다).", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th class="sortable"><button type="button" class="sort">심각도</button></th><th>이벤트</th><th class="sortable"><button type="button" class="sort">대상</button></th><th class="num sortable"><button type="button" class="sort">횟수</button></th><th>상태</th></tr></thead>
            <tbody>
              <tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td class="num">3</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>09:40:58</td><td><span class="tag medium">Medium</span></td><td><a href="#" class="link">미승인 USB 연결</a></td><td>PC-1187 · 이서연</td><td class="num">1</td><td><span class="indicator warn">검토 필요</span></td></tr>
              <tr><td>09:38:03</td><td><span class="tag info">Info</span></td><td><a href="#" class="link">정책 동기화 완료</a></td><td>Server-03</td><td class="num">12</td><td><span class="indicator ok">정상</span></td></tr>
              <tr class="disabled" inert><td>09:36:47</td><td><span class="tag high">High</span></td><td><a href="#" class="link">알려진 악성코드 차단</a></td><td>PC-0932 · 박지훈</td><td class="num">2</td><td><span class="indicator danger">차단</span></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "selectable", title: "Selectable + Action Bar", desc: "체크박스 열(.check) + 선택 시 상단 액션 바. 선택 행은 .on.", html: `
        <div class="tbl-wrap">
          <div class="action-bar"><b>2개 선택</b><span class="spacer"></span><button type="button" class="btn sm outline assistive">허용 처리</button><button type="button" class="btn sm outline assistive">${I("download")}내보내기</button><button type="button" class="btn sm outline negative">삭제</button></div>
          <table class="tbl">
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" class="mixed" aria-label="전체 선택"></label></th><th>정책</th><th>적용 그룹</th><th class="num">대상</th><th>수정</th><th>사용</th></tr></thead>
            <tbody>
              <tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="외부 USB 차단 선택"></label></td><td>외부 USB 차단</td><td>전체</td><td class="num">1,284</td><td>2026-09-06</td><td><label class="switch sm"><input type="checkbox" role="switch" checked aria-label="외부 USB 차단 사용"></label></td></tr>
              <tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="스크립트 실행 제한 선택"></label></td><td>스크립트 실행 제한</td><td>개발팀 제외</td><td class="num">1,102</td><td>2026-09-02</td><td><label class="switch sm"><input type="checkbox" role="switch" checked aria-label="스크립트 실행 제한 사용"></label></td></tr>
              <tr><td class="check"><label class="checkbox"><input type="checkbox" aria-label="원격 접속 허용 목록 선택"></label></td><td>원격 접속 허용 목록</td><td>인프라팀</td><td class="num">48</td><td>2026-08-21</td><td><label class="switch sm"><input type="checkbox" role="switch" aria-label="원격 접속 허용 목록 사용"></label></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "compact", title: "Compact", desc: "로그 뷰어처럼 행이 많을 때 행 높이 40. 시간·IP 는 모노스페이스(.log-row).", html: `
        <div class="tbl-wrap">
          <table class="tbl compact">
            <thead><tr><th>시간</th><th>레벨</th><th>소스</th><th>메시지</th></tr></thead>
            <tbody>
              <tr class="log-row"><td>2026-09-07 09:41:12.031</td><td><span class="tag critical sm">CRIT</span></td><td>10.0.4.21</td><td>process.create blocked: rundll32.exe → cryptor.dll</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:11.870</td><td><span class="tag medium sm">WARN</span></td><td>10.0.4.21</td><td>usb.attach vendor=0x0781 product=0x5583</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:09.114</td><td><span class="tag info sm">INFO</span></td><td>10.0.0.3</td><td>policy.sync ok (rev 2041)</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:08.552</td><td><span class="tag info sm">INFO</span></td><td>10.0.0.3</td><td>agent.checkin 1284/1284</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "density", title: "밀도 전환", desc: "툴바의 Select Button(<code>data-density-for</code> = 표 id)이 밀도를 바꿉니다 — 좁게 40 · 기본 48 · 넓게 56. 고른 값을 기억하는 것은 제품 몫입니다.", html: `
        <div class="stack">
          <div class="toolbar"><span class="spacer"></span><div class="select-btn outline" role="radiogroup" aria-label="행 밀도" data-density-for="dt-density"><button type="button" role="radio" aria-checked="false" data-density="compact">좁게</button><button type="button" class="on" role="radio" aria-checked="true" data-density="default">기본</button><button type="button" role="radio" aria-checked="false" data-density="relaxed">넓게</button></div></div>
          <div class="tbl-wrap">
            <table class="tbl" id="dt-density">
              <thead><tr><th>정책</th><th>적용 그룹</th><th class="num">대상</th><th>수정</th></tr></thead>
              <tbody>
                <tr><td>외부 USB 차단</td><td>전체</td><td class="num">1,284</td><td>2026-09-06</td></tr>
                <tr><td>스크립트 실행 제한</td><td>개발팀 제외</td><td class="num">1,102</td><td>2026-09-02</td></tr>
                <tr><td>원격 접속 허용 목록</td><td>인프라팀</td><td class="num">48</td><td>2026-08-21</td></tr>
              </tbody>
            </table>
          </div>
        </div>`, layout: "top" },
      { id: "sub-text", title: "하위 텍스트", desc: "주 값 아래 보조 글(<code>.cell-sub</code>) — 이름 아래 이메일, 단말 아래 IP. 열을 늘리지 않고 맥락을 줍니다. 두 줄이라 <code>.relaxed</code>(56)입니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl relaxed">
            <thead><tr><th>사용자</th><th>단말</th><th>역할</th><th class="num">위반</th></tr></thead>
            <tbody>
              <tr><td>김민준<span class="cell-sub">minjun.kim@corp.example.com</span></td><td>PC-2041<span class="cell-sub">10.0.4.21</span></td><td>영업팀</td><td class="num">3</td></tr>
              <tr><td>이서연<span class="cell-sub">seoyeon.lee@corp.example.com</span></td><td>PC-1187<span class="cell-sub">10.0.4.37</span></td><td>개발팀</td><td class="num">1</td></tr>
              <tr><td>박지훈<span class="cell-sub">jihoon.park@corp.example.com</span></td><td>PC-0932<span class="cell-sub">10.0.2.8</span></td><td>인프라팀</td><td class="num">0</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "sticky-col", title: "첫 열 고정", desc: "열이 많아 가로로 스크롤하면 식별 열을 고정합니다(<code>.sticky-col</code>). 맨 앞 체크박스 칸도 함께 고정되고 고정 칸 오른쪽에 선이 생깁니다. 스크롤 영역이라 이름과 <code>tabindex=0</code> 을 둡니다.", html: `
        <div class="tbl-wrap sticky-col" tabindex="0" role="region" aria-label="단말 현황" style="max-width:640px">
          <table class="tbl">
            <caption class="sr-only">단말 현황</caption>
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" aria-label="전체 선택"></label></th><th>단말</th><th>사용자</th><th>그룹</th><th>IP</th><th>OS</th><th>에이전트</th><th class="num">위반</th><th>최근 접속</th></tr></thead>
            <tbody>${[["PC-2041", "김민준", "영업팀", "10.0.4.21", "Windows 11", "5.2.1", "3", "2026-09-07 09:41"], ["PC-1187", "이서연", "개발팀", "10.0.4.37", "macOS 14", "5.2.1", "1", "2026-09-07 09:12"], ["PC-0932", "박지훈", "인프라팀", "10.0.2.8", "Windows 10", "5.1.8", "0", "2026-09-06 18:30"]].map(([n, u, g, ip, os, v, c, t]) => `<tr><td class="check"><label class="checkbox"><input type="checkbox" aria-label="${n} 선택"></label></td><td>${n}</td><td>${u}</td><td>${g}</td><td>${ip}</td><td>${os}</td><td>${v}</td><td class="num">${c}</td><td>${t}</td></tr>`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
      { id: "total", title: "합계 행", desc: "<code>tfoot</code> 의 <code>tr.total</code> — 회색 면 · 굵은 글자 · 위 선 한 단계 진하게. 이 페이지의 합계인지 전체의 합계인지 첫 칸에 적습니다.", html: `
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
      { id: "empty", title: "Empty", desc: "결과 없음. 조건 초기화 등 다음 행동을 제시.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody><tr><td colspan="4" class="empty"><div class="empty">조건에 맞는 이벤트가 없습니다. <a href="#" class="link">필터 초기화</a></div></td></tr></tbody>
          </table>
        </div>` },
      { id: "row-actions", title: "행 동작", desc: "동작이 3개 이상이면 ⋯ 로 묶습니다. 스크롤 영역 안에서도 메뉴는 잘리지 않습니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>정책</th><th>대상</th><th class="actions"></th></tr></thead>
            <tbody>${[["외부 USB 차단", "전체"], ["랜섬웨어 행위 차단", "영업팀"]].map(([n, t]) => `
              <tr><td>${n}</td><td>${t}</td><td class="actions"><div class="dropdown"><button type="button" class="btn sm assistive icon-only" aria-label="${n} 더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button><ul class="menu" role="menu" style="left:auto;right:0"><li class="menu-item" role="menuitem">${I("pencil")}편집</li><li class="menu-item" role="menuitem">${I("download")}내보내기</li><li class="menu-sep" role="separator"></li><li class="menu-item danger" role="menuitem">${I("trash")}삭제</li></ul></div></td></tr>`).join("")}
            </tbody>
          </table>
        </div>`, layout: "top" },
      { id: "loading", title: "불러오는 중", desc: "완성될 행과 같은 크기의 Skeleton 행입니다. 표에 aria-busy 를 답니다.", html: `
        <div class="tbl-wrap">
          <span class="sr-only" role="status">이벤트 불러오는 중</span>
          <table class="tbl" aria-busy="true">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody>${[1, 2, 3].map(() => `<tr>${[1, 2, 3, 4].map(() => '<td><span class="skeleton text"></span></td>').join("")}</tr>`).join("")}</tbody>
          </table>
        </div>` },
      { id: "error", title: "불러오지 못함", desc: "원인과 다음 행동을 함께 적습니다. 다시 시도는 ds:retry 입니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody><tr><td colspan="4" class="empty"><div class="empty" role="alert">이벤트를 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요. <button type="button" class="btn sm outline assistive" data-retry>다시 시도</button></div></td></tr></tbody>
          </table>
        </div>` },
      { id: "first-use", title: "처음 비어 있음", desc: "아직 만든 것이 없으면 만드는 동작을 둡니다. 조건에 맞는 결과가 없을 때와 구분합니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>정책</th><th>적용 그룹</th><th class="num">대상</th></tr></thead>
            <tbody><tr><td colspan="3" class="empty"><div class="empty">아직 만든 정책이 없습니다. <button type="button" class="btn sm solid primary">정책 만들기</button></div></td></tr></tbody>
          </table>
        </div>` },
      { id: "select-all", title: "전체 결과 선택", desc: "머리글 체크박스는 이 페이지만 고릅니다. 건수를 알면(data-total) 전체 결과로 넓힐 길을 안내합니다. ds:select-all 로 제품 서버에 넘깁니다.", html: `
        <div class="tbl-wrap" data-total="1054">
          <div class="action-bar"><b>3개 선택</b><span class="spacer"></span><button type="button" class="btn sm outline assistive">${I("download")}내보내기</button></div>
          <div class="select-notice" aria-live="polite"><span>이 페이지의 3건을 모두 선택했습니다.</span><button type="button" class="btn sm text" data-select-all>전체 1,054건 선택</button></div>
          <table class="tbl">
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" checked aria-label="전체 선택"></label></th><th>단말</th><th>그룹</th></tr></thead>
            <tbody>${[["PC-2041", "영업팀"], ["PC-1187", "개발팀"], ["PC-0932", "인프라팀"]].map(([n, g]) => `<tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="${n} 선택"></label></td><td>${n}</td><td>${g}</td></tr>`).join("")}</tbody>
          </table>
        </div>` },
      { id: "expandable", title: "행 펼침", desc: "맨 앞 셰브론으로 한 행의 상세를 펼칩니다. 여러 행을 함께 펼칠 수 있고, 정렬하면 상세가 제 행을 따라갑니다. 서버에서 불러오는 동안은 그 자리에 Spinner 를 둡니다(두 번째 행).", html: `
        <div class="tbl-wrap">
          <table class="tbl compact">
            <thead><tr><th class="expand"><span class="sr-only">상세</span></th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>레벨</th><th>소스</th><th>메시지</th></tr></thead>
            <tbody>${EXP_ROWS.map(([id, t, c, l, ip, m, st]) => `<tr class="log-row"><td class="expand">${expBtn(id, t, !!st)}</td><td>${t}</td><td><span class="tag ${c} sm">${l}</span></td><td>${ip}</td><td>${m}</td></tr>${expDetail(id, t, ip, m, st)}`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
      { id: "sticky", title: "고정 헤더", desc: "표 영역에 높이를 주면 안에서 스크롤하고 머리글이 남습니다. 긴 메시지 열은 말줄임(td.truncate)입니다.", html: `
        <div class="tbl-wrap sticky" tabindex="0" role="region" aria-label="최근 로그" style="max-height:240px">
          <table class="tbl compact">
            <caption class="sr-only">최근 로그</caption>
            <thead><tr><th style="width:120px">시간</th><th style="width:96px">레벨</th><th style="width:120px">소스</th><th>메시지</th></tr></thead>
            <tbody>${LOG_SAMPLE.map(([t, c, l, ip, m]) => `<tr class="log-row"><td>${t}</td><td><span class="tag ${c} sm">${l}</span></td><td>${ip}</td><td class="truncate" title="${m}">${m}</td></tr>`).join("")}</tbody>
          </table>
        </div>`, layout: "top" },
    ],
    props: [[".tbl-wrap", "container", "—", "가로 스크롤 영역(테두리 · radius 없음 — 위는 헤더 면, 아래는 마지막 행 선). 안에 .action-bar 와 table.tbl"], [".tbl", "table", "—", "기본 행 48. .compact 40 · .relaxed 56 · .zebra 줄무늬. React density · rowStyle"], [".tbl-wrap.sticky-col", "container", "—", "첫 열 고정(맨 앞 체크박스 · 펼침 칸 포함). tabindex=0 + 이름. React stickyColumn"], [".cell-sub", "element", "—", "칸 안 주 값 아래 보조 글(12 secondary). React 열 정의 sub"], ["tfoot tr.total", "row", "—", "합계 · 평균 행. React summaryRow"], [".select-btn[data-density-for]", "attribute", "—", "표 id. 버튼 data-density(compact · default · relaxed)로 밀도를 바꾼다"], ["th.sortable / .sorted(.desc)", "header", "—", "정렬 가능 / 정렬 중. aria-sort"], ["table[data-sort=server]", "attribute", "—", "서버 정렬. 표시만 바꾸고 다시 정렬하지 않는다. 정렬하면 언제나 ds:sort {key, dir}"], [".tbl-wrap[data-total]", "attribute", "—", "전체 건수. .select-notice 에 전체 결과 선택을 안내하고 ds:select-all {all, total}"], [".tbl-wrap.sticky", "class", "—", "고정 헤더. max-height · tabindex=0 · 이름을 함께"], ["td.truncate", "class", "—", "말줄임. title 에 전체 값"], ["DS.table.removeRow(tr)", "function", "—", "행을 지우고 다음 행으로 포커스. 펼친 상세 행도 함께 지운다"], ["th.expand / td.expand > .expand-btn", "cell", "—", "행 펼침 — 맨 앞 칸. 머리글에는 숨긴 이름(.sr-only), 버튼은 aria-expanded · aria-controls(상세 행 id) · 행마다 다른 aria-label. React <code>renderExpanded</code>"], ["tr.row-detail[hidden] > td[colspan] > .row-detail-body", "row", "—", "바로 앞 행의 상세. colspan = 열 수. 글자는 셰브론 뒤 첫 칸의 글자와 같은 선(왼쪽 56)에서 시작합니다. 안에 .detail-meta(dl) · Code · 불러오는 중 .spinner-wrap. React 는 <code>renderExpanded(row, {expanded})</code> — 접힌 행도 그려 두므로 불러와야 하는 내용은 expanded 일 때만 돌려줍니다. 펼칠 내용이 없는 행은 <code>expandable</code> 로 빼면 셰브론 없이 빈 칸"], ["ds:row-expand", "event", "—", "행(tr)에서 {expanded}. 상세를 불러올 때 쓴다. React <code>expanded</code> · <code>defaultExpanded</code> · <code>onExpandedChange(set, {key, expanded})</code> — 지금 rows 에 없는 키는 지우고(페이지를 옮기면 접힘), <code>expandScope</code> 가 바뀌면 모두 접습니다(key null)"], ["[data-retry]", "attribute", "—", "오류 행의 다시 시도. ds:retry"], ["tr.on / .disabled", "row", "—", "선택 / 비활성. 비활성 행 안의 태그도 disable 토큰으로 칠해져 심각도 색이 활성처럼 남지 않습니다"], ["td.num / .check / .actions / .empty", "cell", "—", "숫자 우측 정렬 / 체크박스 열 / 행 액션 / 빈 상태"], [".action-bar", "div", "—", "선택 건수 + 일괄 액션"]],
    spec: [["Size", "행 48 · compact 40 · relaxed 56 · 헤더 44 · 40 · 48 · 셀 좌우 16"], ["Container", "테두리 · radius 없음 · 헤더 background/neutral/secondary · 행 선 line/neutral/secondary 1px(마지막 행 포함) · 합계 행 위 선 line/neutral/primary · 셀 격자선 없음"], ["Label", "헤더 12 SemiBold tertiary · 셀 Body/2 14 · 하위 텍스트 12 secondary · 숫자 tabular(표 전체) · 오른쪽 정렬은 크기 숫자(.num) · 말줄임은 긴 메시지 열 하나"], ["Placement", "툴바(검색·필터) 위, 페이지네이션 아래"]],
    figma: { frame: "Data Table", radius: "none", sizes: { row: { h: 48 }, compact: { h: 40 }, relaxed: { h: 56 }, header: { h: 44 } }, variants: { default: {}, selectable: {}, compact: {} }, states: ["default", "hover", "selected", "sorted", "empty"] },
  },

  /* ------------------------------------------------ Table */
  "table": {
    status: "ready", react: ["Table","TableHead","TableBody","TableRow","TableHeader","TableCell"], css: [".tbl-wrap", ".tbl"], borrows: [".indicator"],
    desc: "정렬·선택이 필요 없는 단순 표입니다. 상세 정보(키-값), 비교표, 요약 통계에 씁니다.",
    thumb: `<div class="tbl-wrap" style="width:220px"><table class="tbl compact kv"><tbody><tr><th style="width:80px">이름</th><td>USB 차단</td></tr><tr><th>상태</th><td>사용</td></tr></tbody></table></div>`,
    principles: [
      ["용도", "데이터 전용입니다. 레이아웃에 쓰지 않습니다"],
      ["머리글", "머리글 없는 표를 만들지 않습니다. 키-값 표는 <code>th</code> 가 머리글입니다. 빌드가 검사합니다"],
      ["옮기는 기준", "행이 많아 정렬 · 선택 · 페이지가 필요해지면 <a href=\"#/components/data-table\">Data Table</a> 입니다"],
      ["행 스타일", "가로선이 기본입니다. 긴 비교표는 <code>.zebra</code>, 숫자가 빽빽한 리포트는 열 사이 세로선 <code>.grid</code>, 5행 안팎의 요약은 선 없는 <code>.plain</code> 입니다. <code>.plain</code> 은 <code>.zebra</code> · <code>.grid</code> 와 함께 쓰지 않습니다(빌드가 검사합니다)"],
      ["경계", "바깥 테두리 · radius 가 없습니다. 위는 회색 헤더 면, 아래는 마지막 행 선이 경계입니다. 카드 안에 붙일 때는 카드 패딩을 없애고(<code>.card.flush</code>) 표를 그대로 둡니다"],
      ["비슷한 것", "한 대상의 속성은 키-값 표, 카드 안의 짧은 속성 몇 줄은 Card Meta, 같은 종류의 항목을 나열하면 <a href=\"#/components/list\">List</a> 입니다"],
    ],
    examples: [
      { id: "default", title: "Default", desc: "머리글과 본문만 둔 기본 표입니다.", html: `
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
      { id: "simple", title: "Simple", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl">
            <thead><tr><th>그룹</th><th class="num">에이전트</th><th class="num">정책</th><th>최근 배포</th></tr></thead>
            <tbody>
              <tr><td>영업팀</td><td class="num">312</td><td class="num">8</td><td>2026-09-06</td></tr>
              <tr><td>개발팀</td><td class="num">184</td><td class="num">11</td><td>2026-09-06</td></tr>
              <tr><td>인프라팀</td><td class="num">48</td><td class="num">14</td><td>2026-09-02</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "kv", title: "Key–Value", desc: "상세 패널의 속성 표. th 가 키.", html: `
        <div class="tbl-wrap" style="max-width:560px">
          <table class="tbl kv">
            <tbody>
              <tr><th>정책 ID</th><td>POL-2041</td></tr>
              <tr><th>이름</th><td>외부 USB 차단</td></tr>
              <tr><th>적용 그룹</th><td>전체 (1,284대)</td></tr>
              <tr><th>상태</th><td><span class="indicator ok">사용 중</span></td></tr>
              <tr><th>최근 수정</th><td>2026-09-06 14:20 · admin@jiran.com</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "zebra", title: "Zebra / Compact", desc: "긴 비교표는 줄무늬로 행 추적을 돕습니다.", html: `
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
      { id: "grid", title: "Grid / 합계", desc: "숫자가 빽빽한 리포트는 열 사이 세로선(<code>.grid</code>)으로 칸을 가릅니다. 바깥 테두리가 없어 마지막 칸 오른쪽에는 선이 없습니다. 합계는 <code>tfoot tr.total</code>.", html: `
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
      { id: "plain", title: "Plain", desc: "5행 안팎의 작은 요약은 행 선을 없앱니다(<code>.plain</code>). 헤더 면은 남습니다.", html: `
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
    ],
    props: [[".tbl-wrap", "container", "—", "가로 스크롤(테두리 · radius 없음)"], [".tbl", "table", "—", "기본 표(행 48)"], [".kv", "boolean", "false", "키-값 표(th 폭 200, 우측 보더)"], [".compact / .relaxed", "boolean", "false", "행 40 / 56. React density"], [".zebra / .grid / .plain", "boolean", "false", "줄무늬 / 열 사이 세로선 / 행 선 없음. React rowStyle"], ["tfoot tr.total", "row", "—", "합계 행. React TableFoot"], [".cell-sub", "element", "—", "칸 안 보조 글"], ["td.num", "cell", "—", "크기 숫자 우측 정렬"]],
    spec: [["Size", "행 48 · compact 40 · relaxed 56 · kv th 폭 200"], ["Container", "테두리 · radius 없음 · 헤더 면 background/neutral/secondary · 행 선 line/neutral/secondary(마지막 행 포함) · grid 세로선 같은 색"], ["Label", "헤더 12 SemiBold tertiary · 셀 Body/2 14 · kv 헤더 14 Medium secondary"], ["Placement", "상세 패널, 리포트 요약"]],
    figma: { frame: "Table", radius: "none", sizes: { row: { h: 48 }, compact: { h: 40 }, relaxed: { h: 56 } }, variants: { simple: {}, kv: {}, zebra: {}, grid: {}, plain: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ List */
  "list": {
    status: "ready", react: ["List","ListItem"], css: [".list", ".avatar", ".tag", ".indicator"], borrows: [".btn"],
    desc: "동질한 항목을 세로로 나열합니다. 열이 2~3개 이하이고 항목마다 제목·부제·액션이 있으면 표 대신 List.",
    thumb: `<ul class="list dense" style="width:220px"><li><span class="primary">PC-2041</span><span class="end"><span class="tag ok sm">정상</span></span></li><li><span class="primary">PC-1187</span><span class="end"><span class="tag medium sm">주의</span></span></li></ul>`,
    principles: [
      ["고르기", "열이 2~3개이고 항목마다 제목 · 부제 · 동작이 있으면 List, 값을 열로 비교하면 표, 항목이 독립된 묶음이면 Card 입니다"],
      ["행 전체 클릭", "안쪽 버튼 · 링크를 누르면 행 클릭이 일어나지 않습니다. <a href=\"#/components/data-table\">Data Table</a> 과 같습니다"],
      ["행 버튼 이름", "행마다 달라야 합니다. '편집' 이 아니라 '김민준 편집' 입니다. 빌드가 검사합니다"],
      ["listbox", "<code>role=listbox</code> 는 하나를 고르는 목록에만 씁니다. 안에 버튼 · 링크를 넣지 않고, 항목은 Tab 으로 닿아야 합니다. 빌드가 검사합니다"],
    ],
    examples: [
      { id: "basic", title: "Default", desc: "제목(.primary) + 부제(.meta) + 우측 영역(.end).", html: `
        <ul class="list" style="max-width:560px">
          <li><div><span class="primary">외부 USB 차단</span><span class="meta">전체 · 1,284대 · 2026-09-06</span></div><span class="end"><span class="tag ok">사용</span></span></li>
          <li><div><span class="primary">스크립트 실행 제한</span><span class="meta">개발팀 제외 · 1,102대</span></div><span class="end"><span class="tag ok">사용</span></span></li>
          <li><div><span class="primary">원격 접속 허용 목록</span><span class="meta">인프라팀 · 48대</span></div><span class="end"><span class="tag">중지</span></span></li>
        </ul>` },
      { id: "media", title: "With Avatar / Actions", desc: "선행 아이콘·아바타와 후행 액션 버튼.", html: `
        <ul class="list" style="max-width:560px">
          <li><span class="avatar">김</span><div><span class="primary">김민준</span><span class="meta">보안팀 · 관리자</span></div><span class="end"><button type="button" class="btn sm assistive icon-only" aria-label="김민준 편집">${I("pencil")}</button><button type="button" class="btn sm assistive icon-only" aria-label="김민준 더 보기">${I("dots")}</button></span></li>
          <li><span class="avatar">이</span><div><span class="primary">이서연</span><span class="meta">인프라팀 · 운영자</span></div><span class="end"><button type="button" class="btn sm assistive icon-only" aria-label="이서연 편집">${I("pencil")}</button><button type="button" class="btn sm assistive icon-only" aria-label="이서연 더 보기">${I("dots")}</button></span></li>
        </ul>` },
      { id: "select", title: "Selectable / Dense", desc: "행 클릭 선택(.hover + .on). 밀도 높은 목록은 .dense.", html: `
        <ul class="list hover dense" style="max-width:480px" role="listbox">
          <li role="option" tabindex="0"><span class="indicator ok">PC-2041</span><span class="end meta">10.0.4.21</span></li>
          <li role="option" tabindex="0" class="on" aria-selected="true"><span class="indicator danger">PC-1187</span><span class="end meta">10.0.4.33</span></li>
          <li role="option" tabindex="0"><span class="indicator">PC-0932</span><span class="end meta">오프라인</span></li>
        </ul>` },
    ],
    props: [[".list", "ul", "—", "보더 + radius/lg. li 는 flex row"], [".primary / .meta / .end", "elements", "—", "제목 / 부제 / 우측 영역"], [".hover / li.on", "boolean", "false", "행 hover 배경 / 선택"], [".dense / .plain", "boolean", "false", "행 40 / 보더 없음"]],
    spec: [["Size", "행 padding 12 16 (dense 8 16)"], ["Container", "radius/lg · line/neutral/secondary · 행 사이 1px"], ["Label", "제목 14 Medium · 부제 12 Regular tertiary"], ["Placement", "상세 패널 목록, 설정의 항목 목록"]],
    figma: { frame: "List", radius: "radius/lg", sizes: { md: { h: 56 }, dense: { h: 40 } }, variants: { default: {}, media: {}, selectable: {} }, states: ["default", "hover", "selected"] },
  },

  /* ------------------------------------------------ Item Tile */
  "item-tile": {
    status: "ready", react: ["Tile","TileGrid"], css: [".tile", ".tile-grid", ".tag"],
    desc: "아이콘·제목·설명을 담은 작은 선택지입니다. 연동 모듈이나 보호 기능처럼 여러 개를 고르거나, 눌러서 바로 이동할 때 씁니다.",
    thumb: `<div class="tile-grid" style="width:240px;grid-template-columns:1fr 1fr"><button class="tile on"><span class="ico">U</span><b>USB</b></button><button class="tile"><span class="ico">N</span><b>네트워크</b></button></div>`,
    principles: [
      ["언제 쓰는가", "아이콘이 앞서는 작은 선택지를 여러 개 고르거나, 눌러서 바로 이동할 때 씁니다"],
      ["비슷한 것", "하나만 고르면 <a href=\"#/components/radio-button\">Card Radio</a>, 내용이 많은 카드를 고르면 <a href=\"#/components/card\">Card Selection</a> 입니다"],
      ["선택의 뜻", "<code>aria-pressed</code> 는 켜고 끄는 다중 선택입니다. 하나만 고르는 묶음에 쓰지 않습니다"],
    ],
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 타일입니다.", html: `<button type="button" class="tile"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>` },
      { id: "grid", title: "Grid", desc: "button.tile 그리드. 선택은 .on + aria-pressed.", html: `
        <div class="tile-grid" style="max-width:760px">
          <button type="button" class="tile on" aria-pressed="true"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("server")}</span><b>네트워크 격리</b><span>감염 의심 단말 격리</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("list")}</span><b>스크립트 제한</b><span>PowerShell·WSH 실행 제어</span></button>
          <button type="button" class="tile" aria-pressed="false" disabled><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>Enterprise 전용</span></button>
        </div>` },
      { id: "badge", title: "With Tag", desc: "우상단에 상태·신규 태그. 비활성 타일에서는 태그도 비활성 색으로 흐립니다.", html: `
        <div class="tile-grid" style="max-width:560px">
          <button type="button" class="tile"><span class="tag accent sm">NEW</span><span class="ico">${I("bell")}</span><b>Slack 알림</b><span>채널로 이벤트 전송</span></button>
          <button type="button" class="tile"><span class="tag ok sm">연결됨</span><span class="ico">${I("user")}</span><b>AD 연동</b><span>사용자·그룹 동기화</span></button>
          <button type="button" class="tile" disabled><span class="tag accent sm">Enterprise</span><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>이벤트 로그 전달</span></button>
        </div>` },
      { id: "horizontal", title: "Horizontal", desc: "좁은 폭에서는 가로 배치.", html: `
        <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:420px">
          <button type="button" class="tile horizontal on" aria-pressed="true"><span class="ico">${I("chart-bar")}</span><div><b>주간 요약</b><span>매주 월요일 발송</span></div></button>
          <button type="button" class="tile horizontal" aria-pressed="false"><span class="ico">${I("list")}</span><div><b>상세 이벤트</b><span>CSV · 최대 10만 행</span></div></button>
        </div>` },
    ],
    props: [[".tile", "button", "—", ".ico + b(제목) + span(설명). aria-pressed"], [".on", "boolean", "false", "선택(brand 보더·배경)"], [".horizontal", "boolean", "false", "가로 배치"], ["disabled", "attribute", "—", "선택 불가"], [".tile-grid", "container", "—", "auto-fill 180px 그리드"]],
    spec: [["Size", "최소 폭 180 · padding 16 · 아이콘 36"], ["Container", "radius/lg 8 · line/neutral/secondary · 선택 brand"], ["Label", "제목 14 Bold · 설명 12 Regular tertiary"], ["Placement", "연동 목록, 여러 개를 고르는 모듈 선택"]],
    figma: { frame: "Item Tile", radius: "radius/lg", sizes: { md: { minW: 180, pad: 16 } }, variants: { default: { stroke: "--line-neutral-secondary" }, selected: { stroke: "--surface-brand-primary", bg: "--surface-brand-subtle" } }, states: ["default", "hover", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Data Visual */
  "data-visual": {
    status: "ready", react: ["Kpi","KpiGrid","ChartCard","BarChart","Donut","DonutRow","ChartLegend","Sparkline"], css: [".kpi", ".kpi-grid", ".chart", ".chart-card", ".chart-view", ".chart-tools", ".chart-table", ".chart-canvas", ".donut", ".donut-row", ".chart-legend", ".sparkline"], borrows: [".t-caption-1", ".btn", ".tbl", ".tbl-wrap"],
    desc: "대시보드의 수치 · 추이 · 비율을 두 층으로 보여줍니다. <b>정적 요약</b>(KPI · 스파크라인 · 가로 막대 · 도넛)은 CSS 만으로 그려 JS 없이 토큰이 먹고 Figma 와 1:1 입니다. <b>탐색형 차트</b>(시계열 · 막대 · 도넛 · 혼합)는 축 · 툴팁 · 범례 토글이 필요할 때 Chart.js(MIT) 위에 토큰을 입혀 그립니다(<code>assets/ds-chart.js</code> · <code>@jiran/ds-react/chart</code>). 경계: 값 몇 개를 한눈에 요약하면 정적, 기간 · 비교 · 상호작용이 필요하면 탐색형입니다. 색은 심각도 토큰과 계열 토큰(<code>--chart-series-1~6</code>)만 씁니다.",
    thumb: `<div class="kpi compact" style="padding:12px 14px;min-width:120px"><span class="label">Critical</span><span class="value" style="font-size:24px;color:var(--foreground-negative-strong)">1,284</span></div>`,
    examples: [
      { id: "default", title: "Default", desc: "값 하나를 보여 주는 기본 KPI 입니다.", html: `<div class="kpi" style="max-width:240px"><span class="label">연결 에이전트</span><span class="value">1,247</span></div>` },
      { id: "kpi", title: "KPI", desc: "라벨 · 값 · 증감. 보안 지표는 증가가 위험(.up 빨강), 감소가 좋음(.down 초록).", html: `
        <div class="kpi-grid" style="max-width:800px">
          <div class="kpi critical"><span class="label">Critical 이벤트</span><span class="value">1,284</span><span class="delta up">${I("arrow-up",12)} 12% 전주 대비</span></div>
          <div class="kpi"><span class="label">차단률</span><span class="value">99.2<small>%</small></span><span class="delta down">${I("arrow-down",12)} 0.3%p</span></div>
          <div class="kpi"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><span class="delta">37대 오프라인</span></div>
        </div>` },
      { id: "bar", title: "Bar Chart", desc: "항목별 비교. i 의 width 가 값, 색은 심각도.", html: `
        <div class="chart-card" style="max-width:560px">
          <h3 class="chart-title">유형별 탐지 <span class="t-caption-1" style="color:var(--foreground-neutral-tertiary)">최근 7일</span></h3>
          <div class="chart">
            <div class="row"><span class="lbl">랜섬웨어</span><div class="bar critical"><i style="width:82%"></i></div><span class="num">412</span></div>
            <div class="row"><span class="lbl">악성코드</span><div class="bar high"><i style="width:61%"></i></div><span class="num">306</span></div>
            <div class="row"><span class="lbl">USB 위반</span><div class="bar medium"><i style="width:44%"></i></div><span class="num">221</span></div>
            <div class="row"><span class="lbl">정책 위반</span><div class="bar low"><i style="width:23%"></i></div><span class="num">115</span></div>
            <div class="row"><span class="lbl">피싱</span><div class="bar info"><i style="width:18%"></i></div><span class="num">88</span></div>
          </div>
        </div>` },
      { id: "donut", title: "Donut + Legend", desc: "구성 비율. 조각은 conic-gradient 로 이어 그리고, 경계마다 2px 구분선 <code>&lt;i style=\"--a:각도\"&gt;</code>(위 = 0°, 시계 방향)를 둡니다 — 탐색형 도넛과 같은 폭이 일정한 틈입니다. 중앙 값은 data-label.", html: `
        <div class="chart-card" style="max-width:320px">
          <h3 class="chart-title">심각도 분포</h3>
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
        </div>` },
      { id: "spark", title: "Sparkline", desc: "카드 안 소형 추이. 강조 막대는 .hi. KPI 안에 두면 값 오른쪽에 놓이고 밑변을 숫자 기준선에 맞춥니다. 자리가 모자라면 값 아래로 내려갑니다.", html: `
        <div class="kpi" style="min-width:min(320px, 100%)"><span class="label">일별 탐지</span><span class="value">412</span><div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div></div>` },
      { id: "flat", title: "Flat", desc: "주변에 배경색(<code>background/neutral/secondary</code>)이 있는 대시보드에서는 KPI · Chart Card 도 Card 와 같이 <code>.flat</code> 으로 보더를 지웁니다. 흰 바탕 위에서는 쓰지 않습니다.", html: `
        <div style="background:var(--background-neutral-secondary);padding:24px;border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:16px;width:100%;max-width:800px">
          <div class="kpi-grid">
            <div class="kpi critical flat"><span class="label">Critical 이벤트</span><span class="value">1,284</span><span class="delta up">${I("arrow-up",12)} 12% 전주 대비</span></div>
            <div class="kpi flat"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><span class="delta">37대 오프라인</span></div>
          </div>
          <div class="chart-card flat">
            <h3 class="chart-title">유형별 탐지 <span class="t-caption-1" style="color:var(--foreground-neutral-tertiary)">최근 7일</span></h3>
            <div class="chart">
              <div class="row"><span class="lbl">랜섬웨어</span><div class="bar critical"><i style="width:82%"></i></div><span class="num">412</span></div>
              <div class="row"><span class="lbl">악성코드</span><div class="bar high"><i style="width:61%"></i></div><span class="num">306</span></div>
            </div>
          </div>
        </div>` },
      { id: "timeseries", title: "Timeseries · 시계열", desc: "기간에 따른 추이는 탐색형 차트(Chart.js)로 그립니다. 선 2px, 점은 hover 때만(지름 8), 심각도 계열은 <code>stacked</code> 로 누적 영역이 되고 색은 심각도 토큰 그대로입니다. 범례는 2계열 이상일 때 아래에 붙고 눌러서 계열을 끌 수 있습니다. 툴팁은 같은 x 의 값을 함께 보여 줍니다.", html: `
        <div class="chart-card" style="max-width:640px">
          <h3 class="chart-title">일별 탐지 추이 <span class="t-caption-1" style="color:var(--foreground-neutral-tertiary)">최근 14일</span></h3>
          ${chartCanvas("timeseries", CHART_DATA.trend, "일별 탐지 추이 — 최근 14일, Critical · High · Medium 누적 영역")}
        </div>`, js: chartJs("timeseries", CHART_DATA.trend, ".chart-canvas canvas") },
      { id: "bars", title: "Bar · 막대", desc: "범주 비교는 세로 막대(<code>bar</code>), 긴 라벨이나 순위는 가로(<code>horizontal</code>), 구성은 누적(<code>stacked</code>)입니다. 심각도가 아닌 계열(이번 주 · 지난 주)은 계열 색 <code>--chart-series-1~6</code> 을 순서대로 받고, 심각도는 <code>tone</code> 으로 상태 토큰을 받습니다. 막대는 각지고 stroke 가 없으며, 누적 세그먼트는 틈 없이 이어 붙고, 두께는 최대 32 입니다. 정적 Top N 요약은 위의 CSS 가로 막대로 충분합니다.", html: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;width:100%;max-width:960px">
          <div class="chart-card">
            <h3 class="chart-title">유형별 탐지 <span class="t-caption-1" style="color:var(--foreground-neutral-tertiary)">주간 비교</span></h3>
            ${chartCanvas("bar", CHART_DATA.weeks, "유형별 탐지 — 이번 주와 지난 주 비교")}
          </div>
          <div class="chart-card">
            <h3 class="chart-title">부서별 심각도</h3>
            ${chartCanvas("bar", CHART_DATA.depts, "부서별 심각도 — Critical · High · Medium · Low · Info 누적")}
          </div>
        </div>`, js: chartJs("bar", CHART_DATA.depts, ".chart-canvas canvas") },
      { id: "donut-live", title: "Donut · 탐색형", desc: "비율을 툴팁 · 범례 토글과 함께 볼 때는 탐색형 도넛(<code>donut</code>)입니다. 조각 사이 2px 면 색 틈과 구멍 67% 는 CSS 도넛과 같은 모양이고, <code>center</code> 가 가운데 합계를 그립니다. <code>legend: \"right\"</code> 는 차트 자리가 좁고 세로로 길면(폭 &lt; 높이 × 1.5) 범례를 아래로 내려 도넛 크기를 지킵니다. 값 네 개를 요약만 하면 위의 CSS Donut + Legend 를 씁니다.", html: `
        <div class="chart-card" style="max-width:420px">
          <h3 class="chart-title">심각도 분포</h3>
          ${chartCanvas("donut", CHART_DATA.severity, "심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054")}
        </div>`, js: chartJs("donut", CHART_DATA.severity, ".chart-canvas canvas") },
      { id: "donut-narrow", title: "Donut · 좁은 자리", desc: "위와 같은 spec(<code>legend: \"right\"</code>)을 폭 300 카드에 넣은 모습입니다. 캔버스 폭이 높이 × 1.5 보다 좁으면 범례가 차트 아래로 내려가 도넛 지름을 지킵니다 — 대시보드의 좁은 열 · 사이드 패널이 이 경우입니다. 창 크기가 바뀌면 다시 판정합니다.", html: `
        <div class="chart-card" style="max-width:300px">
          <h3 class="chart-title">심각도 분포</h3>
          ${chartCanvas("donut", CHART_DATA.severity, "심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054")}
        </div>`, js: chartJs("donut", CHART_DATA.severity, ".chart-canvas canvas") },
      { id: "mixed", title: "Mixed · 혼합", desc: "막대(<code>bars</code>)와 선(<code>lines</code>)을 한 차트에 둘 때는 <b>y 축이 하나</b>여야 합니다 — 탐지와 차단은 단위가 같은 건수라 함께 그립니다. 단위가 다른 두 값(건수와 %)은 이중 축으로 겹치지 말고 차트를 둘로 나눕니다. 선이 막대 위에 그려집니다.", html: `
        <div class="chart-card" style="max-width:640px">
          <h3 class="chart-title">일별 탐지와 차단 <span class="t-caption-1" style="color:var(--foreground-neutral-tertiary)">최근 7일</span></h3>
          ${chartCanvas("mixed", CHART_DATA.daily, "일별 탐지와 차단 — 최근 7일, 막대는 탐지 건수, 선은 차단 건수")}
        </div>`, js: chartJs("mixed", CHART_DATA.daily, ".chart-canvas canvas") },
    ],
    props: [[".kpi", "div", "—", ".label + .value(small 단위) + .delta(.up/.down). .critical/.high 로 값 색"], ["variant / .flat", "\"outline\" | \"flat\"", "\"outline\"", ".kpi · .chart-card 의 보더 색을 지웁니다(두께 1px 는 남아 크기 같음). 주변에 배경색 <code>background/neutral/secondary</code> 이 있을 때만 — Card 의 flat 과 같은 규칙. React <code>variant</code>"], [".kpi-grid", "container", "—", "auto-fit 180px"], [".chart .row", "row", "—", ".lbl + .bar(i width%) + .num. bar 톤 critical|high|medium|low"], [".donut", "div", "—", "conic-gradient 배경(조각을 이어 붙임) + 경계마다 <code>&lt;i style=\"--a:각도\"&gt;</code> 2px 면 색 구분선(위 = 0°, 시계 방향), data-label 중앙 값, role=img aria-label. 이웃 조각 밝기 대비가 낮아 틈 없이는 색상만으로 갈린다"], [".donut-row", "div", "—", "도넛 + 범례 한 줄. 도넛은 왼쪽, 범례는 오른쪽 끝(space-between) — 카드가 넓으면 둘 사이가 벌어지고, 한 줄에 안 들어가면 범례가 도넛 아래로 내려갑니다(줄 사이 16)"], [".chart-legend", "div", "—", "i 색(원형 10) + 라벨 + b 값"], [".chart-card", "container", "—", "차트를 담는 카드. Card 와 같은 Surface·radius/lg·1px 보더이고 padding 20 24 · gap 16 입니다. React <code>ChartCard</code>"], [".sparkline", "div", "—", "i height% 막대, .hi 강조. .kpi 의 자식이면 값 오른쪽(밑변 = 숫자 기준선), 좁으면 값 아래"], [".chart-view", "div", "—", "표로 보기 버튼(<code>data-chart-table</code>) + <code>.chart-canvas</code>. 누르면 같은 데이터의 표로 바뀝니다. 문구는 <code>data-labels</code>(JSON — table · chart · head · value · empty), React <code>labels</code>. 빈 값은 보이는 '—' 와 숨긴 '값 없음'(empty)"], ["canvas[data-chart] / ChartCanvas", "\"timeseries\" | \"bar\" | \"donut\" | \"mixed\"", "—", "탐색형 차트(Chart.js) 자리 — <code>.chart-canvas</code>(높이 240) 안의 canvas. HTML 은 <code>data-spec</code>(JSON) 으로 <code>ds-chart.js</code> 가 자동으로 그리고, React 는 <code>chart</code>(Chart.js 생성자) · <code>config</code>(presets.*) · <code>aria-label</code>(필수) prop 입니다"], ["DSChart.presets.* / presets", "timeseries · bar · donut · mixed (spec) → config", "—", "<code>series[{label, data, tone?}]</code> · <code>labels</code> · <code>stacked</code> · <code>horizontal</code> · 도넛은 <code>{label, value, tone?}</code> · <code>center</code> · <code>legend</code>(\"bottom\" | \"right\" — right 는 폭 &lt; 높이 × 1.5 이면 아래로) · 혼합은 <code>bars</code> · <code>lines</code>. tone 은 심각도 · 상태 토큰(critical · high · medium · low · ok · brand) 또는 계열 1의 톤(series-1 · series-1-subtle 비교 기간 · series-1-strong 막대 위 선), 없으면 계열 색 1~6 순서. 결과는 보통의 Chart.js config"], ["DSChart.theme · mount · auto / chartTheme · useDsChart · mountChart", "(el) → theme · (Chart, canvas, config) → handle", "—", "theme 은 <code>--chart-*</code> · 심각도 · 면 · 글꼴 토큰을 계산값으로 읽은 것(캔버스는 CSS 변수를 못 읽습니다). mount 는 Chart 를 만들고 라이트/다크 · 제품 색 전환 때 다시 칠하며 <code>destroy()</code> 를 돌려줍니다. auto 는 <code>canvas[data-chart]</code> 를 모두 mount"]],
    spec: [["Size", "KPI 값 Display/2 32 · 막대 12 · 도넛 120 · 탐색형 캔버스 높이 240"], ["Container", "chart-card = Card 와 같은 Surface·radius/lg·1px 보더, 다만 padding 20 24 · gap 16 · flat 은 보더 색 없음(background/neutral/secondary 위 전용). KPI 는 padding 20 24 · 최소 폭 180, kpi-grid 안에서는 padding 20 · 칸 최소 176 · gap 16"], ["Label", "라벨 12 Medium tertiary · 값 32 Bold(일반 숫자) · 차트 축 · 범례 · 툴팁 글자 12"], ["Chart", "선 2 · 점은 hover 때만 지름 8 · 막대는 각지고 stroke 없음(정적 막대 · 트랙 · 스파크라인도 각짐) · 누적 세그먼트는 틈 없이 이어 붙임 · 도넛 조각 사이 2px 면 색 경계 · 막대 두께 최대 32 · 격자는 y 축만 · y 축 하나(이중 축 금지) · 범례는 2계열 이상, 원형 아이콘 · 옆 범례(탐색형 도넛 right · 정적 .donut-row)는 자리가 좁고 세로로 길면 아래로 · 7번째 계열부터 '기타'"], ["Color", "계열 --chart-series-1~6 순서 고정(제품색과 무관 · 라이트/다크 각각 색각 분리 검증) · 같은 지표의 비교 기간(지난 주 · 전월)은 색이 아니라 계열 1의 옅은 톤 --chart-series-1-subtle, 막대 위를 지나는 선은 진한 톤 --chart-series-1-strong · 심각도 5단계는 negative-strong · cautionary · accent-light-blue · accent-lime · inactive 토큰 · 격자 --chart-grid-primary · 축 글자 --chart-axis-text · 툴팁 --chart-tooltip-*"], ["A11y", "canvas 는 role=img + aria-label(제목 · 요약) 필수 · 범례 · 툴팁으로 값을 읽고, 표 대체를 권장"], ["Placement", "대시보드 상단 KPI 4개, 아래 차트 카드 2열(추이 · 분포)"]],
    figma: { frame: "Data Visual", radius: "radius/lg", sizes: { kpi: { pad: 20 }, bar: { h: 12 }, donut: 120 }, variants: { kpi: {}, kpiSparkline: { layout: "라벨 한 줄 · 값 + 그래프 한 줄(밑변 = 숫자 기준선, 좁으면 그래프가 값 아래)" }, bar: {}, donut: { gap: "경계마다 2px 직선 --surface-elevated-primary(폭 일정)" }, sparkline: { bar: "--line-brand-primary", hi: "--foreground-brand-primary" } }, variant: { outline: { stroke: "--line-neutral-secondary" }, flat: { stroke: "transparent", canvas: "--background-neutral-secondary" } }, states: ["default"],
      /* 탐색형 차트(Chart.js) — Figma 의 Chart 세트가 따르는 마크 규격과 색 */
      chart: { types: ["timeseries", "bar", "donut", "mixed"], canvasH: 240, line: 2, point: 8, barRadius: 0, barStroke: 0, barMax: 32, gap: 0, legend: "circle", cutout: "67%", series: ["--chart-series-1", "--chart-series-2", "--chart-series-3", "--chart-series-4", "--chart-series-5", "--chart-series-6"], grid: "--chart-grid-primary", axis: "--chart-axis-text", tooltip: { bg: "--chart-tooltip-surface", fg: "--chart-tooltip-text" }, tones: { critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary", medium: "--foreground-accent-light-blue", low: "--foreground-accent-lime", info: "--foreground-inactive-primary", "series-1": "--chart-series-1", "series-1-subtle": "--chart-series-1-subtle", "series-1-strong": "--chart-series-1-strong" } } },
  },
  /* ------------------------------------------------ Empty State (패턴에서 올림 2026-11-10) */
  "empty-state": {
    status: "ready", react: ["Empty"], css: [".empty"], borrows: [".btn", ".btn-group"],
    desc: "데이터가 없거나 검색 결과가 없을 때 이유와 다음 행동을 보여 줍니다. 불러오지 못한 경우는 빈 화면이 아니라 오류입니다.",
    principles: [
      ["첫 사용", "무엇을 할 수 있는지 설명하고 시작 동작을 Solid Primary 로 둡니다."],
      ["검색 결과 없음", "찾은 조건을 보여 주고 초기화 · 완화를 제안합니다. 만들기 동작을 주 버튼으로 두지 않습니다."],
      ["오류와 구분", "불러오지 못했으면 <a href=\"#/components/notification\">Notification</a>(danger)이나 카드의 <code>.empty.error</code> 와 다시 시도를 씁니다. '없습니다' 로 보여 주지 않습니다."],
      ["구성", "제목은 필수입니다. 동작은 2개까지, Solid Primary 는 하나입니다. 빌드가 검사합니다."],
      ["좁은 자리", "카드 · 사이드 패널은 <code>.compact</code> 입니다. 표 안은 <code>td.empty</code>, 카드 본문은 <a href=\"#/components/card\">Card</a> 의 빈 상태를 따릅니다."],
    ],
    thumb: `<div class="empty" style="padding:16px;gap:2px"><span class="ico" style="width:28px;height:28px;font-size:12px">${I("inbox")}</span><b style="font-size:12px">이벤트 없음</b></div>`,
    examples: [
      { id: "first", title: "첫 사용", html: `
        <div class="empty" style="max-width:560px">
          <span class="ico">${I("shield")}</span>
          <b>아직 정책이 없습니다</b>
          <span>템플릿에서 시작하거나 새 정책을 만들어 에이전트에 배포하세요.</span>
          <div class="btn-group"><button type="button" class="btn md outline primary">템플릿 보기</button><button type="button" class="btn md solid primary">${I("plus")}정책 만들기</button></div>
        </div>` },
      { id: "nores", title: "검색 결과 없음", html: `
        <div class="empty" style="max-width:560px">
          <span class="ico">${I("search")}</span>
          <b>'랜섬웨어 2025' 에 대한 결과가 없습니다</b>
          <span>검색어를 줄이거나 기간 필터(최근 24시간)를 넓혀 보세요.</span>
          <button type="button" class="btn md outline assistive">필터 초기화</button>
        </div>` },
      { id: "compact", title: "패널 안 빈 상태", desc: "카드 · 사이드 패널처럼 좁은 영역은 .compact.", html: `
        <div class="empty compact" style="max-width:480px"><span class="ico">${I("inbox")}</span><div><b>연결된 알림 채널이 없습니다</b><span>Slack 또는 이메일을 연결하세요.</span></div><button type="button" class="btn sm outline assistive">연결</button></div>` },
    ],
    props: [[".empty", "div", "—", "세로 가운데 정렬 · 점선 테두리"], [".ico", "span", "—", "아이콘 칸 48"], ["b", "제목", "—", "필수"], ["span", "설명", "—", "이유와 다음 행동"], [".compact", "boolean", "false", "가로형"], ["React actions", "ReactNode", "—", "Button 또는 ButtonGroup"]],
    spec: [["Size", "위아래 여백 48 · compact 24"], ["Container", "1px dashed · radius/lg"], ["Icon", "칸 48 · compact 36"], ["Title", "16 SemiBold · compact 14"], ["Placement", "목록 · 표 · 패널의 내용 자리"]],
  },

  /* ------------------------------------------------ Form (2026-11-10) */
  "form": {
    status: "ready", react: ["Form","FormLegend","FormSection","FormRow","FormActions","ErrorSummary"], css: [".form", ".form-legend", ".form-summary"], borrows: [".field", ".btn", ".notice"],
    desc: "입력 필드를 묶고 저장 동작을 놓는 틀입니다. 실제 화면 조합은 <a href=\"#/patterns/input-form\">입력 폼</a> 패턴을 봅니다.",
    principles: [
      ["열", "한 열이 기본입니다. 시작 · 종료처럼 짝이 되는 짧은 필드만 <code>.form-row</code> 로 2열에 둡니다. 빌드가 검사합니다."],
      ["필수", "필수 입력이 있으면 맨 위에 <code>.form-legend</code> 를 둡니다."],
      ["검증", "폼에 <code>data-validate</code> 를 달면 시스템이 합니다. 규칙은 <a href=\"#/foundations/interaction\">Interaction</a> › Input errors 입니다."],
      ["오류 요약", "오류가 3개 이상이면 폼 맨 위에 둡니다. <code>data-validate</code> 는 자동으로 그리고, 서버 응답의 오류는 ErrorSummary 로 직접 넣습니다. 빌드가 위치를 검사합니다."],
      ["동작", "<code>.form-actions</code> 는 폼 맨 아래, 주 버튼은 오른쪽 끝입니다. 삭제는 <code>.left</code> 로 왼쪽에 떼어 둡니다."],
    ],
    thumb: `<div class="form" style="padding:12px;gap:8px;min-width:200px"><div class="field sm"><label>이름</label><input placeholder="정책 이름"></div><div class="form-actions" style="padding-top:8px"><button class="btn sm solid primary">저장</button></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "범례 · 필드 · 2열 · 동작.", html: `
        <form class="form">
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label for="fm-name">정책 이름 <em>*</em></label><input id="fm-name" required><span class="help">2~40자</span></div>
          <div class="form-row">
            <div class="field"><label for="fm-from">시작 IP</label><input id="fm-from"></div>
            <div class="field"><label for="fm-to">종료 IP</label><input id="fm-to"></div>
          </div>
          <div class="form-actions"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "sections", title: "Sections", desc: "필드가 많으면 .form-section 으로 나눕니다.", html: `
        <form class="form">
          <div class="form-section">기본 정보</div>
          <div class="field"><label for="fs-name">정책 이름</label><input id="fs-name"></div>
          <div class="form-section">알림</div>
          <div class="field"><label for="fs-mail">알림 이메일</label><input id="fs-mail" type="email"></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "actions", title: "Delete", desc: "삭제는 .left 로 왼쪽에 떼어 둡니다.", html: `
        <form class="form">
          <div class="field"><label for="fa-name">정책 이름</label><input id="fa-name" value="외부 USB 차단"></div>
          <div class="form-actions"><button type="button" class="btn md outline negative left">삭제</button><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "summary", title: "Error Summary", desc: "서버가 돌려준 오류처럼 제품이 직접 넣을 때입니다. 폼 맨 위에 둡니다.", html: `
        <form class="form" novalidate>
          <div class="notice danger form-summary" role="alert" data-form-summary><span class="ico">${I("alert-circle",20)}</span><div><b>입력값 3개를 확인하세요</b>정책 이름, 허용 IP, 보관 기간</div></div>
          <div class="field error"><label for="fe-a">정책 이름</label><input id="fe-a" value="외부 USB" aria-invalid="true" aria-describedby="fe-ah"><span class="help" id="fe-ah">같은 이름의 정책이 있습니다. 다른 이름을 입력하세요.</span></div>
          <div class="field error"><label for="fe-b">허용 IP</label><input id="fe-b" value="10.0.0.1" aria-invalid="true" aria-describedby="fe-bh"><span class="help" id="fe-bh">다른 정책이 쓰는 주소입니다. 다른 주소를 입력하세요.</span></div>
          <div class="field error"><label for="fe-c">보관 기간</label><input id="fe-c" value="400" aria-invalid="true" aria-describedby="fe-ch"><span class="help" id="fe-ch">라이선스 한도를 넘었습니다. 365 이하로 입력하세요.</span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
    ],
    props: [["form.form", "form", "—", "카드 형태의 틀. 최대 폭 640"], ["data-validate", "attr", "—", "입력 검증을 켭니다. React <code>validate</code>"], [".form-legend", "p", "—", "필수 범례. React <code>FormLegend</code>"], [".form-section", "div", "—", "섹션 제목. React <code>FormSection</code>"], [".form-row", "div", "—", "2열. React <code>FormRow</code>"], [".form-actions", "div", "—", "하단 동작, .left 는 왼쪽. React <code>FormActions</code>"], [".form-summary", "div.notice.danger", "—", "오류 요약. <code>role=alert</code> · <code>data-form-summary</code>"], ["React ErrorSummary", "items · count · title", "—", "<code>items</code> 는 필드 이름, <code>count</code> 기본은 items 수"]],
    spec: [["Size", "최대 폭 640 · 패딩 24 · 필드 간격 20"], ["Container", "surface/elevated/primary · 1px · radius/lg"], ["Section", "16 SemiBold"], ["Actions", "위 패딩 16 · 위 테두리 1px · 버튼 간격 12"], ["Placement", "페이지 본문 · Side Panel"]],
  },

  /* ------------------------------------------------ Page Header (2026-11-10) */
  "page-header": {
    status: "ready", react: ["PageHead"], css: [".page-head"], borrows: [".btn", ".breadcrumb"],
    desc: "페이지 맨 위에서 이 화면이 무엇인지와 주요 동작을 보여 줍니다.",
    principles: [
      ["제목", "페이지 제목은 <code>h1</code> 이고 화면에 하나입니다. 하나인지는 빌드가 검사합니다. 메뉴 이름과 같게 씁니다."],
      ["Breadcrumb", "첫 칸에 넣습니다. 제목 바로 위 8px 입니다."],
      ["설명", "<code>.sub</code> 는 ID · 범위 · 갱신 시각처럼 짧은 정보 한 줄입니다."],
      ["동작", "3개까지입니다. 주 버튼은 하나이고 오른쪽 끝입니다. 나머지는 <a href=\"#/components/dropdown\">Dropdown</a> 으로 묶습니다. 빌드가 검사합니다."],
      ["긴 제목", "제목 칸에서 줄바꿈합니다. 동작은 오른쪽 위에 남습니다."],
    ],
    thumb: `<div class="page-head" style="width:200px"><div><span class="title" style="font-size:14px">정책</span></div><div class="actions"><span class="btn sm solid primary">저장</span></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "제목 · 설명 · 동작.", html: `
        <div class="page-head"><div><h1 class="title">정책</h1><p class="sub">전체 24개 · 최근 배포 09:41</p></div><div class="actions"><button type="button" class="btn md outline assistive">내보내기</button><button type="button" class="btn md solid primary">정책 만들기</button></div></div>` },
      { id: "breadcrumb", title: "Breadcrumb", desc: "하위 페이지는 첫 칸에 Breadcrumb 를 넣습니다.", html: `
        <div class="page-head">
          <nav aria-label="현재 위치">
            <ol class="breadcrumb">
              <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
              <li><a href="#">정책</a></li>
              <li aria-current="page"><span>외부 USB 차단</span></li>
            </ol>
          </nav>
          <div><h1 class="title">외부 USB 차단</h1><p class="sub">POL-2041 · 전체 그룹</p></div><div class="actions"><button type="button" class="btn md solid primary">배포</button></div>
        </div>` },
      { id: "long", title: "Long Title", desc: "긴 제목은 줄바꿈하고 동작은 오른쪽 위에 남습니다.", html: `
        <div class="page-head" style="max-width:520px"><div><h1 class="title">외부 저장장치 차단 및 예외 승인 정책의 부서별 적용 현황</h1><p class="sub">POL-2041</p></div><div class="actions"><button type="button" class="btn md solid primary">저장</button></div></div>` },
    ],
    props: [[".page-head", "div", "—", "2열 격자. 줄 간격 8 · 열 간격 16"], ["nav", "Breadcrumb", "—", "첫 칸. React <code>breadcrumb</code>"], [".title", "h1", "—", "React <code>title</code> · 태그는 <code>as</code>(기본 h1)"], [".sub", "p", "—", "React <code>sub</code>"], [".actions", "div", "—", "동작 3개까지. React <code>actions</code>"]],
    spec: [["Title", "24 Bold · 행간 1.3"], ["Description", "14 · foreground/neutral/secondary · 위 4"], ["Actions", "버튼 간격 8 · 오른쪽 위"], ["Placement", "페이지 본문 맨 위, 한 화면에 하나"]],
  },

  /* ------------------------------------------------ Avatar (문서화 2026-11-10) */
  "avatar": {
    status: "ready", react: ["Avatar"], css: [".avatar"], borrows: [".t-body-2"],
    desc: "사용자를 이니셜로 표시합니다. 사진은 지원하지 않습니다.",
    principles: [
      ["글자", "이니셜 1~2자입니다. 빌드가 검사합니다."],
      ["이름", "옆에 이름이 보이면 <code>aria-hidden</code> 입니다. 혼자 있으면 <code>role=\"img\"</code> 와 <code>aria-label</code> 로 이름을 줍니다."],
      ["누를 때", "그 자체로는 버튼이 아닙니다. 사용자 메뉴는 <a href=\"#/components/top-navigation\">Top Navigation</a> 의 <code>.topbar-user</code> 를 씁니다."],
    ],
    thumb: `<span style="display:flex;gap:8px;align-items:center"><span class="avatar">JH</span><span class="avatar sm">JH</span></span>`,
    examples: [
      { id: "sizes", title: "Size", desc: "32 와 .sm 24.", html: `
        <div style="display:flex;gap:12px;align-items:center"><span class="avatar" role="img" aria-label="김민준">김</span><span class="avatar sm" role="img" aria-label="김민준">김</span></div>` },
      { id: "name", title: "With Name", desc: "이름이 옆에 있으면 아바타는 숨깁니다.", html: `
        <div style="display:flex;gap:8px;align-items:center"><span class="avatar" aria-hidden="true">이</span><span class="t-body-2">이서연</span></div>` },
    ],
    props: [[".avatar", "span", "—", "32. React <code>initials</code>"], [".sm", "boolean", "false", "24. React <code>size=\"sm\"</code>"]],
    spec: [["Size", "32 · sm 24"], ["Container", "surface/brand/subtle · radius/full"], ["Label", "12 Bold · sm 10 Bold · foreground/brand/primary"], ["Placement", "Top Navigation 오른쪽 끝 · List 행 앞"]],
  },

  /* ------------------------------------------------ Link (2026-11-10) */
  "link": {
    status: "ready", react: ["Link"], css: [".link", ".sr-only"], borrows: [".t-body-2"],
    desc: "다른 페이지로 옮겨 갑니다. 같은 화면에서 일을 실행하면 <a href=\"#/components/button\">Button</a> 입니다.",
    principles: [
      ["Button 과의 경계", "주소가 바뀌면 Link, 그 자리에서 실행하면 Button 입니다. <code>&lt;a&gt;</code> 에 <code>href</code> 가 없으면 빌드가 막습니다."],
      ["밑줄", "문장 안 링크는 늘 밑줄입니다. 색만으로 구분하지 않습니다. 표 · 목록처럼 그 줄 자체가 링크인 자리는 <code>.standalone</code> 이고 hover 때만 긋습니다."],
      ["라벨", "도착할 곳의 이름을 씁니다. '자세히' · '여기' 는 쓰지 않습니다. 빌드가 검사합니다."],
      ["새 창", "되도록 같은 창에서 엽니다. 새 창이면 아이콘과 숨긴 '(새 창)' 문구를 둡니다. 빌드가 검사합니다."],
      ["비활성", "링크는 비활성으로 두지 않습니다. 갈 곳이 없으면 글자로 둡니다."],
    ],
    thumb: `<a class="link" href="#" tabindex="-1">배포 상태</a>`,
    examples: [
      { id: "inline", title: "Inline", desc: "문장 안 링크는 늘 밑줄입니다.", html: `
        <p class="t-body-2" style="margin:0">에이전트가 오프라인이면 <a href="#" class="link">배포 상태</a> 에서 다시 배포하세요.</p>` },
      { id: "standalone", title: "Standalone", desc: "그 줄 자체가 링크인 자리는 .standalone. 표의 .link 도 같은 모양입니다.", html: `
        <div class="t-body-2" style="display:flex;flex-direction:column;gap:8px;align-items:flex-start"><a href="#" class="link standalone">랜섬웨어 행위 탐지</a><a href="#" class="link standalone">미승인 USB 연결</a></div>` },
      { id: "external", title: "New Window", desc: "새 창이면 아이콘과 숨긴 문구를 둡니다.", html: `
        <p class="t-body-2" style="margin:0"><a href="#" class="link" target="_blank" rel="noopener noreferrer">제품 문서${I("external-link",14)}<span class="sr-only"> (새 창)</span></a> 에서 설치 방법을 확인하세요.</p>` },
    ],
    props: [["a.link", "a", "—", "<code>href</code> 필수"], [".standalone", "boolean", "false", "밑줄은 hover 때만, 500. React <code>standalone</code>"], ["target=_blank", "attr", "—", "아이콘 + sr-only + <code>rel</code>. React <code>external</code>"], ["React as", "ElementType", "a", "라우터 링크"]],
    spec: [["Label", "주변 글자 크기 · foreground/brand/primary"], ["Underline", "위치 2 · hover 두께 2"], ["Icon", "14"], ["Placement", "문장 안 · 표 · 목록 행"]],
  },
  /* ------------------------------------------------ File Upload (2026-11-10) */
  "file-upload": {
    status: "ready", react: ["FileUpload"], css: [".upload", ".upload-zone", ".upload-list", ".upload-item"], borrows: [".field", ".btn", ".progress", ".sr-only", ".form", ".form-legend", ".form-actions"],
    desc: "파일을 고르거나 끌어다 놓아 올립니다. 형식 · 용량 검사와 진행 표시까지 시스템이 맡고, 실제 전송은 제품이 합니다.",
    principles: [
      ["안내", "받는 형식과 용량을 도움말에 미리 적습니다. 빌드가 검사합니다."],
      ["거절", "형식 · 용량 · 개수가 맞지 않으면 목록에 이름과 이유를 남깁니다. 통과한 파일은 그대로 받습니다."],
      ["전송 실패", "다시 시도와 지우기를 둡니다. 거절된 파일은 다시 보내도 같으므로 지우기만 둡니다."],
      ["하나만 받을 때", "새 파일을 고르면 바로 교체합니다."],
      ["폼", "전송 중이거나 오류가 있으면 제출을 막고 그 필드로 옮깁니다. 저장 버튼은 켜 둡니다."],
      ["모양", "기본은 드롭 영역입니다. 파일 하나를 받는 좁은 폼 칸은 <code>.compact</code> 입니다. 버튼형도 드롭은 받습니다."],
      ["보안", "화면의 형식 검사는 안내입니다. 서버에서 다시 검사합니다."],
    ],
    thumb: `<div class="upload" style="width:180px"><div class="upload-zone" style="padding:12px"><span class="ico">${I("upload",24)}</span><span class="btn sm outline assistive">파일 선택</span></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "파일 하나를 받습니다. 영역을 누르거나 끌어다 놓습니다. 이 예제의 전송은 흉내입니다.", html: `
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
      { id: "compact", title: "Compact", desc: "좁은 폼 칸은 .compact. 드롭도 받습니다.", html: `
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
      { id: "multiple", title: "Multiple", desc: "여러 개를 받습니다. 첫 전송이 실패하는 흉내입니다. 다시 시도하면 끝납니다.", html: `
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
      { id: "states", title: "States", desc: "대기 · 전송 중 · 완료 · 전송 실패 · 거절.", html: `
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
              <button type="button" class="btn sm text assistive icon-only retry" aria-label="gateway.log 다시 시도">${I("refresh",16)}</button>
              <button type="button" class="btn sm text assistive icon-only remove" aria-label="gateway.log 지우기">${I("x",16)}</button>
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
      { id: "form", title: "In Form", desc: "빈 채로 저장하면 막고 알립니다. 전송 중 · 오류일 때도 막습니다.", html: `
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
      { id: "disabled", title: "Disabled", desc: "받을 수 없는 동안에는 .disabled 와 버튼의 disabled.", html: `
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
    props: [[".upload", "div", "—", "React <code>FileUpload</code>"], ["input[type=file]", "accept · multiple", "—", "받는 형식과 여러 개. React <code>accept</code> · <code>multiple</code>"], ["data-max-size", "attr", "—", "예: 5MB. React <code>maxSize</code>(바이트)"], ["data-max-files", "attr", "—", "여러 개일 때 상한. React <code>maxFiles</code>"], ["data-required", "attr", "—", "폼 검증에 낍니다. React <code>required</code>"], [".compact", "boolean", "false", "버튼형"], [".upload-item", "li", "—", ".uploading · .done · .error, 거절은 data-rejected"], ["ds:upload", "event", "—", "<code>detail.files</code> = [{id, file}]. 전송은 제품이. React <code>onAdd</code>"], ["DS.upload", "API", "—", "<code>progress(el, id, n)</code> · <code>done(el, id)</code> · <code>fail(el, id, 문구)</code>. React 는 <code>items</code> 의 status · progress · error"], ["ds:upload-retry · ds:upload-remove", "event", "—", "<code>detail.id</code> · <code>detail.file</code>. React <code>onRetry</code> · <code>onRemove</code>"], ["data-messages · data-labels", "JSON", "—", "문구 바꾸기. React <code>messages</code> · <code>labels</code>"]],
    spec: [["Size", "영역 패딩 24 · 목록 간격 4 · 줄 패딩 8/12"], ["Container", "1px dashed line/neutral/primary · radius/lg"], ["Icon", "영역 24 · 줄 20"], ["Label", "14 · 크기와 오류 문구 12"], ["Placement", "폼의 필드 자리 · 가져오기 대화상자"]],
  },
  /* ------------------------------------------------ Code · Copy Field (2026-11-10) */
  "code": {
    status: "ready", react: ["CodeBlock", "InlineCode"], css: [".code-view", ".code-inline"], borrows: [".btn", ".t-body-2"],
    desc: "명령 · 설정 · 로그 원문을 고정폭 글자로 보여 줍니다. 여러 줄은 복사 버튼이 있는 블록, 문장 안의 값은 인라인입니다.",
    principles: [
      ["언제 쓰는가", "명령과 설정처럼 그대로 옮겨 쓰는 글자, 고치면 안 되는 로그 원문에 씁니다. 값 하나를 옮겨 쓰는 자리는 Copy Field 입니다."],
      ["강조", "구문 강조는 하지 않습니다. 빌드가 검사합니다."],
      ["긴 줄", "명령과 설정은 가로로 스크롤합니다. 줄을 끊으면 뜻이 바뀌기 때문입니다. 긴 한 줄 로그는 <code>.wrap</code> 으로 줄바꿈합니다."],
      ["긴 내용", "높이를 정해 안에서 스크롤합니다."],
      ["복사", "블록에는 복사 버튼을 둡니다. 결과는 버튼 자리에서 2초 동안 보이고 스크린 리더에도 읽힙니다. Toast 를 띄우지 않습니다."],
      ["키보드", "넘친 내용은 키보드로 스크롤합니다. <code>pre</code> 는 포커스를 받고 제목과 같은 이름을 가집니다. 빌드가 검사합니다."],
      ["민감한 값", "API 키 · 토큰은 Code 에 넣지 않습니다. 가릴 수 있는 Copy Field 를 씁니다."],
    ],
    thumb: `<div class="code-view" style="width:180px"><pre style="padding:8px 12px"><code>sudo sh install.sh</code></pre></div>`,
    examples: [
      { id: "block", title: "Block", desc: "제목과 복사 버튼이 있는 블록입니다. 긴 줄은 가로로 스크롤합니다.", html: `
        <div class="code-view">
          <div class="head"><span class="title">에이전트 설치</span>${copyBtn("에이전트 설치")}</div>
          <pre tabindex="0" aria-label="에이전트 설치"><code>curl -fsSL https://agent.example.com/install.sh -o install.sh
sudo sh install.sh --group default
sudo systemctl enable --now js-agent</code></pre>
        </div>` },
      { id: "wrap", title: "Wrap", desc: "긴 한 줄 로그는 .wrap 으로 줄바꿈합니다.", html: `
        <div class="code-view wrap">
          <div class="head"><span class="title">원본 로그</span>${copyBtn("원본 로그")}</div>
          <pre tabindex="0" aria-label="원본 로그"><code>2026-11-10T09:14:22+09:00 gw-01 kernel: [UFW BLOCK] IN=eth0 OUT= MAC=52:54:00:12:34:56 SRC=203.0.113.24 DST=198.51.100.7 LEN=60 TOS=0x00 PREC=0x00 TTL=52 ID=41021 DF PROTO=TCP SPT=51544 DPT=22 WINDOW=64240 RES=0x00 SYN URGP=0</code></pre>
        </div>` },
      { id: "height", title: "Max Height", desc: "긴 내용은 높이를 정해 안에서 스크롤합니다. 포커스를 준 뒤 화살표 키로도 움직입니다.", html: `
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
      { id: "inline", title: "Inline", desc: "문장 안의 경로 · 명령은 .code-inline 입니다.", html: `
        <p class="t-body-2" style="margin:0">설정 파일은 <code class="code-inline">/etc/js-agent/agent.conf</code> 에 있습니다. 바꾼 뒤 <code class="code-inline">systemctl restart js-agent</code> 를 실행하세요.</p>` },
    ],
    props: [[".code-view", "div", "—", "React <code>CodeBlock</code>. <code>title</code> 필수"], [".wrap", "boolean", "false", "줄바꿈. React <code>wrap</code>"], ["pre", "tabindex · aria-label", "—", "키보드 스크롤과 이름. React 는 자동"], ["max-height", "style", "—", "pre 에. React <code>maxHeight</code>"], [".code-inline", "code", "—", "문장 안의 값. React <code>InlineCode</code>"], ["ds:copy", "event", "—", "<code>detail.ok</code>. 값은 싣지 않습니다. React <code>onCopy(ok)</code>"], ["data-labels", "JSON", "—", "복사 결과 문구. React <code>labels</code>"]],
    spec: [["Header", "패딩 4/8/4/16 · 아래 선 line/neutral/secondary"], ["Body", "패딩 12/16 · 12/20 고정폭"], ["Container", "1px line/neutral/secondary · radius/lg"], ["Inline", "0.9em 고정폭 · 면 surface/neutral/strong · 반경 4"], ["Placement", "설치 안내 · 설정 화면 · 로그 상세"]],
  },
  "copy-field": {
    status: "ready", react: ["CopyField"], css: [".copy-field"], borrows: [".field", ".affix", ".reveal", ".btn", ".help", ".t-label-1"],
    desc: "해시 · IP · API 키처럼 옮겨 쓰는 값을 읽기 전용으로 보여 주고 복사 버튼을 둡니다. 민감한 값은 가립니다.",
    principles: [
      ["언제 쓰는가", "값을 다른 곳으로 옮겨 쓰는 자리에 씁니다. 사용자가 고치는 값은 Text Field, 여러 줄은 Code 입니다."],
      ["민감한 값", "API 키 · 토큰은 기본으로 가리고 보기 버튼을 둡니다. 빌드가 검사합니다."],
      ["복사", "가린 채로도 전체 값을 복사합니다. 복사해도 가림은 풀리지 않습니다."],
      ["결과 알림", "버튼 자리에서 2초 동안 보이고 스크린 리더에도 읽힙니다. Toast 를 띄우지 않습니다."],
      ["버튼 이름", "보기와 복사 버튼 이름에 값의 이름을 넣습니다. 빌드가 검사합니다."],
      ["표 안", "표 · 키-값 목록은 <code>.inline</code> 입니다. 가리는 기능이 없어 민감한 값에는 쓰지 않습니다."],
      ["보안", "가려도 값은 브라우저에 있습니다. 한 번만 보여 줄 키는 화면에 내려보낼지 제품이 정합니다."],
    ],
    thumb: `<div class="field mono copy-field" style="width:180px;min-width:0"><div class="affix"><input readonly value="9f86d081" aria-label="해시"></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "읽기 전용 값과 복사 버튼입니다.", html: `
        <div class="field mono copy-field" style="width:100%;max-width:480px"><label for="cf1">SHA-256</label><div class="affix"><input id="cf1" readonly autocomplete="off" value="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08">${copyBtn("SHA-256")}</div></div>` },
      { id: "secret", title: "Secret", desc: "민감한 값은 가리고 보기 버튼을 둡니다. 가린 채로 복사해도 전체 값이 복사됩니다.", html: `
        <div class="field mono copy-field" style="width:100%;max-width:480px"><label for="cf2">API 키</label><div class="affix"><input id="cf2" type="password" readonly autocomplete="off" value="jsk_demo_4f7a91c2e8b3d605"><button type="button" class="reveal" aria-label="API 키 보기" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button>${copyBtn("API 키")}</div><span class="help">외부에 공유하지 마세요</span></div>` },
      { id: "inline", title: "Inline", desc: "표 · 키-값 목록의 값은 .inline 입니다. 민감한 값에는 쓰지 않습니다.", html: `
        <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;align-items:center">
          <span class="t-label-1">에이전트 IP</span><span class="copy-field inline"><span class="value">203.0.113.24</span>${copyBtn("에이전트 IP", true)}</span>
          <span class="t-label-1">파일 해시</span><span class="copy-field inline"><span class="value">9f86d081884c7d65</span>${copyBtn("파일 해시", true)}</span>
        </div>` },
    ],
    props: [[".copy-field", "class", "—", "React <code>CopyField</code>. <code>.field.mono</code> 와 함께"], ["input", "readonly · value", "—", "React <code>value</code> · <code>label</code>"], ["type=password", "attr", "text", "가리기. <code>.reveal</code> 필수. React <code>secret</code>"], [".inline", "boolean", "false", "표 · 키-값 목록. React <code>inline</code>"], ["ds:copy", "event", "—", "<code>detail.ok</code>. 값은 싣지 않습니다. React <code>onCopy(ok)</code>"], ["ds:reveal", "event", "—", "<code>detail.shown</code>. 감사 로그용. React <code>onReveal(shown)</code>"], ["data-labels", "JSON", "—", "복사 결과 문구. React <code>labels</code>"]],
    spec: [["Size", "Text Field 와 같음 · 높이 40"], ["Value", "고정폭 · 읽기 전용 면 background/neutral/secondary"], ["Actions", "보기 28 · 복사 Button sm · Inline 복사 24"], ["Placement", "폼의 값 자리 · 표 칸 · 키-값 목록"]],
  },
  /* ------------------------------------------------ Number Input (2026-11-10) */
  "number-input": {
    status: "ready", react: ["NumberInput"], css: [".number-field", ".num-btn"], borrows: [".field", ".affix", ".help", ".form", ".form-legend", ".form-actions", ".btn"],
    desc: "임계치 · 세션 시간처럼 정확한 수를 입력합니다. 입력칸 안에 단위와 증감 버튼이 있고 위 · 아래 화살표로도 바꿉니다.",
    principles: [
      ["언제 쓰는가", "크기를 비교하거나 더하는 수에 씁니다. 사번 · 포트 목록 · 전화번호처럼 이름에 가까운 숫자는 Text Field 입니다. 대략의 값을 빠르게 정하는 자리는 Slider 입니다."],
      ["범위 안내", "받을 수 있는 범위를 도움말에 미리 적습니다. 빌드가 검사합니다."],
      ["범위 밖", "입력을 막거나 값을 몰래 고치지 않습니다. 입력을 받고 떠날 때 오류로 알립니다. 폼에서는 저장을 막습니다."],
      ["단위", "입력칸 안쪽 뒤에 둡니다. 스크린 리더도 값과 함께 읽습니다."],
      ["증감", "버튼과 위 · 아래 화살표는 <code>step</code> 만큼 움직이고 범위 끝에서 멈춥니다. 끝에 닿은 쪽 버튼은 꺼집니다."],
      ["키보드", "증감 버튼은 Tab 에서 뺍니다. 화살표 키가 같은 일을 합니다."],
      ["표준 입력", "<code>type=number</code> 입니다. 숫자 입력은 전부 이 컴포넌트를 씁니다. 빌드가 검사합니다."],
    ],
    thumb: `<div class="field number-field" style="width:180px;min-width:0"><div class="affix"><input type="number" value="30" aria-label="값"><span>분</span>${numBtns("값")}</div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "단위 · 범위가 있는 기본 입력입니다. 범위 밖 값은 떠날 때 오류로 알립니다.", html: `
        <div class="field number-field" style="width:280px"><label for="n1">세션 만료</label><div class="affix"><input id="n1" type="number" value="30" min="5" max="1440"><span>분</span>${numBtns("세션 만료")}</div><span class="help">5분부터 1440분까지 입력할 수 있습니다.</span></div>` },
      { id: "step", title: "Step", desc: "step 만큼 움직입니다. 소수도 됩니다.", html: `
        <div style="display:flex;flex-wrap:wrap;gap:16px">
          <div class="field number-field" style="width:240px"><label for="n2">재시도 간격</label><div class="affix"><input id="n2" type="number" value="10" min="0" max="60" step="5"><span>초</span>${numBtns("재시도 간격")}</div><span class="help">0~60초, 5초 단위</span></div>
          <div class="field number-field" style="width:240px"><label for="n3">CPU 임계치</label><div class="affix"><input id="n3" type="number" value="80" min="0" max="100" step="0.5"><span>%</span>${numBtns("CPU 임계치")}</div><span class="help">0~100%, 0.5 단위</span></div>
        </div>` },
      { id: "error", title: "Error", desc: "범위를 벗어난 값을 그대로 두고 알립니다.", html: `
        <div class="field number-field error" style="width:280px"><label for="n4">보관 기간</label><div class="affix"><input id="n4" type="number" value="500" min="1" max="365" aria-invalid="true" aria-describedby="n4h"><span>일</span>${numBtns("보관 기간", false, true)}</div><span class="help" id="n4h">값이 너무 큽니다. 365 이하 입력하세요.</span></div>` },
      { id: "form", title: "In Form", desc: "빈 값 · 범위 밖 값은 저장할 때 막습니다.", html: `
        <form class="form" data-validate novalidate style="width:360px"><p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field number-field"><label for="n5">동시 접속 수 <em>*</em></label><div class="affix"><input id="n5" type="number" required min="1" max="500"><span>명</span>${numBtns("동시 접속 수")}</div><span class="help" aria-live="polite">1~500명</span></div>
          <div class="form-actions"><button type="submit" class="btn md solid primary">저장</button></div>
        </form>` },
      { id: "disabled", title: "Disabled", desc: "입력과 버튼이 함께 꺼집니다.", html: `
        <div class="field number-field" style="width:280px"><label for="n6">세션 만료</label><div class="affix"><input id="n6" type="number" value="30" min="5" max="1440" disabled><span>분</span>${numBtns("세션 만료", true, true)}</div><span class="help">관리자만 바꿀 수 있습니다</span></div>` },
    ],
    props: [[".number-field", "class", "—", ".field 와 함께. React <code>NumberInput</code>"], ["min · max · step", "attr", "—", "범위와 간격. <code>step=any</code> 는 쓰지 않습니다"], ["단위", "span", "—", "입력 뒤 <code>span</code>. React <code>unit</code>"], [".num-btn.down · .up", "button", "—", "tabindex=-1, 이름에 값의 이름. React 는 자동(문구는 <code>labels</code>)"], ["input · change", "event", "—", "버튼 · 화살표로 바꿔도 표준 이벤트가 납니다. React <code>onChange</code>"], ["data-messages", "JSON", "—", "오류 문구. React <code>messages</code>"]],
    spec: [["Size", "Text Field 와 같음 · sm 32 · md 40 · lg 48"], ["Stepper", "28 × 28 · 아이콘 16 · 사이 2"], ["Unit", "12 · foreground/neutral/tertiary"], ["Placement", "폼의 값 자리 · 정책 임계치"]],
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = COMPONENTS;
