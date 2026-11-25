/* =========================================================
   patterns.data.js — 패턴 22개. 컴포넌트를 조합한 화면 단위 예시
   shape: { status, desc, uses:[컴포넌트 key…], css:[패턴 전용 접두어…], choose:[[k,v]], principles:[[k,v]], examples:[…] }
   페이지 구성은 컴포넌트와 같다(사람의 결정 2026-11-15) — 정의 · 고르기 표(choose) · Composition · 예제 · Rules(principles) · Usage.
   코드 패널의 CSS 는 uses 컴포넌트의 CSS + css 접두어의 합집합으로 추출됩니다.
   예제에는 인라인 style 을 쓰지 않는다(빌드가 검사) — 값이 곧 데이터인 기하(도넛 각도 · 막대 비율 · 밴드 조각)만 예외.
   브라우저에서 components.data.js 와 한 전역을 나눠 쓰므로 도우미 이름은 p 로 시작한다.
   ========================================================= */
/* 아이콘: icons.gen.js 의 I(name, size) 사용 */

/* ---------- 도우미 — components.data.js 의 같은 컴포넌트 마크업과 같아야 한다(구조 비교 · 빌드 검사) ---------- */
const pCopy = (name, iconOnly) => `<button type="button" class="btn sm text assistive${iconOnly ? " icon-only" : ""} copy" aria-label="${name} 복사"><span class="ico">${I("copy",16)}</span>${iconOnly ? "" : '<span class="t">복사</span>'}</button>`;
const pCopyInline = (name, value) => `<span class="copy-field inline"><span class="value">${value}</span>${pCopy(name, true)}</span>`;
const pClose = (cls, attr) => `<button type="button" class="btn sm text assistive icon-only ${cls}" aria-label="닫기" ${attr}>${I("x")}</button>`;
const pNum = (name, down, up) => `<button type="button" class="num-btn down" tabindex="-1" aria-label="${name} 줄이기"${down ? " disabled" : ""}>${I("minus",16)}</button><button type="button" class="num-btn up" tabindex="-1" aria-label="${name} 늘리기"${up ? " disabled" : ""}>${I("plus",16)}</button>`;
/* 인증 코드 칸 — components.data.js codeField 와 같은 마크업 */
const pCode = (o) => {
  const n = o.length || 6, v = (o.value || "").split(""), rove = Math.min(v.length, n - 1), bad = /error/.test(o.cls || ""), help = o.help !== undefined || o.live;
  const msgs = o.messages ? ` data-messages='${JSON.stringify(o.messages)}'` : "";
  const cells = Array.from({ length: n }, (_, i) => `<input${i ? "" : ` id="${o.id}-1"`} class="code-cell" type="text" inputmode="numeric" autocomplete="${i ? "off" : "one-time-code"}" aria-label="${n}자리 중 ${i + 1}번째"${i === rove ? "" : ' tabindex="-1"'}${v[i] ? ` value="${v[i]}"` : ""}${bad ? ' aria-invalid="true"' : ""}${o.disabled ? " disabled" : ""}>`).join("");
  return `<div class="field code-field${o.cls ? " " + o.cls : ""}"><label id="${o.id}-l" for="${o.id}-1">${o.label}${o.mark ? " <em>*</em>" : ""}</label><div class="code-inputs" role="group" aria-labelledby="${o.id}-l"${help ? ` aria-describedby="${o.id}-help"` : ""}${o.name ? ` data-name="${o.name}"` : ""}${o.req ? " data-required" : ""}${msgs}>${o.name ? `<input type="hidden" name="${o.name}" value="${o.value || ""}">` : ""}${cells}</div>${help ? `<span class="help" id="${o.id}-help" aria-live="polite">${o.help || ""}</span>` : ""}</div>`;
};
/* Select — o: id, label, opts[[value,label]], value, placeholder, name, req, help, live, sm, labelledby(필드 밖에서 이름을 가리킬 id) */
const pSel = (o) => {
  const cur = o.opts.find(([v]) => v === o.value);
  const name = o.labelledby ? ` aria-labelledby="${o.labelledby} ${o.id}"` : o.bare ? "" : ` aria-labelledby="${o.id}-l ${o.id}"`;
  const dd = `<div class="dropdown${o.sm && o.bare ? " sm" : ""}"${o.name ? ` data-name="${o.name}"` : ""}${o.req ? " data-required" : ""}><button type="button" id="${o.id}" class="trigger" aria-haspopup="listbox" aria-expanded="false"${name}>${cur ? cur[1] : `<span class="placeholder">${o.placeholder}</span>`}</button><ul class="menu" role="listbox" aria-label="${o.label}">${o.opts.map(([v, l]) => `<li class="menu-item${v === o.value ? " on" : ""}" role="option" data-value="${v}"${v === o.value ? ' aria-selected="true"' : ""}>${l}</li>`).join("")}</ul>${o.name ? `<input type="hidden" name="${o.name}" value="${o.value || ""}">` : ""}</div>`;
  if (o.bare || o.labelledby) return dd;
  return `<div class="field${o.sm ? " sm" : ""}"><label id="${o.id}-l">${o.label}${o.req ? " <em>*</em>" : ""}</label>${dd}${o.help !== undefined ? `<span class="help"${o.live ? ' aria-live="polite"' : ""}>${o.help}</span>` : ""}</div>`;
};
/* Combobox — o: id, label, items[], selected[], multiple, placeholder, field(라벨 있는 필드), req, name, help, live(검증 폼 — 빈 도움말 칸에 aria-live), all('전체' 옵션 라벨 — 여러 개에만) */
const pCombo = (o) => {
  const sel = o.selected || [], chips = o.multiple ? sel.map((l) => `<span class="chip sm" data-value="${l}"><span class="lbl">${l}</span><button type="button" class="x" aria-label="${l} 제거">${I("x",10)}</button></span>`).join("") : "";
  const value = !o.multiple && sel[0] ? ` value="${sel[0]}"` : "";
  const inp = `<input type="text" id="${o.id}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${o.id}-list" autocomplete="off" placeholder="${o.placeholder}"${value}${o.field ? "" : ` aria-label="${o.label}"`}>`;
  const cb = `<div class="combobox"${o.multiple ? " data-multiple" : ""}${o.overflow ? ` data-overflow="${o.overflow}"` : ""}${o.name ? ` data-name="${o.name}"` : ""}${o.req ? " data-required" : ""}><div class="control">${o.multiple ? `<div class="control-track">${chips}${inp}</div>` : inp}</div><ul class="menu" role="listbox" id="${o.id}-list" aria-label="${o.label}"${o.multiple ? ' aria-multiselectable="true"' : ""}>${o.multiple && o.all ? (() => { const on = o.items.every((l) => sel.includes(l)); return `<li class="menu-item${on ? " on" : ""}" role="option" data-all aria-selected="${on}"><span class="menu-mark check" aria-hidden="true"></span>${o.all}</li>`; })() : ""}${o.items.map((l) => `<li class="menu-item${sel.includes(l) ? " on" : ""}" role="option" data-value="${l}" aria-selected="${sel.includes(l)}">${o.multiple ? '<span class="menu-mark check" aria-hidden="true"></span>' : ""}${l}</li>`).join("")}</ul><span class="sr-only" role="status"></span>${o.name && !o.multiple ? `<input type="hidden" name="${o.name}" value="${sel[0] || ""}">` : ""}</div>`;
  return o.field ? `<div class="field"><label for="${o.id}">${o.label}${o.req ? " <em>*</em>" : ""}</label>${cb}${o.help !== undefined ? `<span class="help"${o.live ? ' aria-live="polite"' : ""}>${o.help}</span>` : ""}</div>` : cb;
};
/* Time Picker · Date Picker — components.data.js 의 tpField · dpField 와 같은 마크업. pTime live = 검증 폼의 도움말 칸에 aria-live */
const pTime = (o) => `<div class="field timepicker${o.cls ? " " + o.cls : ""}"><label for="${o.id}"${o.srLabel ? ' class="sr-only"' : ""}>${o.label}${o.req ? " <em>*</em>" : ""}</label><div class="affix"><input id="${o.id}" type="text" inputmode="numeric" autocomplete="off" placeholder="HH:mm"${o.value ? ` value="${o.value}"` : ""}${o.req ? " required" : ""}${o.help ? ` aria-describedby="${o.id}-help"` : ""}><button type="button" class="tp-btn" aria-label="${o.label} 선택" aria-haspopup="dialog" aria-expanded="false">${I("clock")}</button></div>${o.help ? `<span class="help" id="${o.id}-help"${o.live ? ' aria-live="polite"' : ""}>${o.help}</span>` : ""}</div>`;
const pDate = (o) => { const one = "YYYY. MM. DD" + (o.time ? " HH:mm" : ""); return `<div class="datepicker field"${[o.range && "data-range", o.time && "data-time", o.attrs].filter(Boolean).map((a) => " " + a).join("")}>${o.label ? `<label for="${o.id}">${o.label}</label>` : ""}<div class="affix"><input id="${o.id}"${o.value ? ` value="${o.value}"` : ""} placeholder="${o.range ? `${one} ~ ${one}` : one}" inputmode="numeric" autocomplete="off"${o.label ? "" : ` aria-label="${o.aria}"`}${o.help ? ` aria-describedby="${o.id}-help"` : ""}><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar")}</button></div>${o.help ? `<span class="help" id="${o.id}-help">${o.help}</span>` : ""}</div>`; };
/* 데이터 패턴의 상태 셋(2026-11-20) — 불러오는 중(Skeleton 행) · 빈 결과 · 오류(다시 시도). Data Table 의 Loading · First Use · Load Error 예제와 같은 마크업. "#이름" 은 숫자 열 */
const pStates = (o) => {
  const th = o.cols.map((c) => c[0] === "#" ? `<th class="num">${c.slice(1)}</th>` : `<th>${c}</th>`).join(""), n = o.cols.length;
  const card = (t, body) => `<div class="card flush"><div class="card-head"><h3 class="title">${t}</h3></div><div class="tbl-wrap">${body}</div></div>`;
  const btn = o.emptyBtn ? ` <button type="button" class="btn sm ${o.emptyBtn[1] ? "solid primary" : "outline assistive"}">${o.emptyBtn[0]}</button>` : "";
  return `<div class="stack">
          ${card("불러오는 중", `<span class="sr-only" role="status">${o.loading}</span><table class="tbl" aria-busy="true"><thead><tr>${th}</tr></thead><tbody>${[1, 2, 3].map(() => `<tr>${o.cols.map(() => '<td><span class="skeleton text"></span></td>').join("")}</tr>`).join("")}</tbody></table>`)}
          ${card(o.emptyTitle, `<table class="tbl"><thead><tr>${th}</tr></thead><tbody><tr><td colspan="${n}" class="empty"><div class="empty">${o.empty}${btn}</div></td></tr></tbody></table>`)}
          ${card("불러오기 실패", `<table class="tbl"><thead><tr>${th}</tr></thead><tbody><tr><td colspan="${n}" class="empty"><div class="empty" role="alert">${o.error} <button type="button" class="btn sm outline assistive" data-retry>다시 시도</button></div></td></tr></tbody></table>`)}
        </div>`;
};
const pBreadcrumb = (items) => `<nav aria-label="현재 위치"><ol class="breadcrumb"><li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>${items.slice(0, -1).map((t) => `<li><a href="#">${t}</a></li>`).join("")}<li aria-current="page"><span>${items[items.length - 1]}</span></li></ol></nav>`;
const pAvatars = (label, names, more, sm) => `<span class="avatar-group" role="group" aria-label="${label}">${names.map((n) => `<span class="avatar${sm ? " sm" : ""}" role="img" aria-label="${n}">${n[0]}</span>`).join("")}${more ? `<span class="avatar-group-more">외 ${more}명</span>` : ""}</span>`;
const pNotice = (tone, title, body, extra = "") => { const ico = { info: ["info-circle"], warning: ["alert-triangle"], danger: ["alert-circle"], success: ["circle-check"], "": ["info-circle"] }[tone][0]; return `<div class="notice${tone ? " " + tone : ""}" role="${tone === "danger" ? "alert" : "status"}"><span class="ico">${I(ico,20,{style:"filled"})}</span><div><b>${title}</b>${body}${extra}</div></div>`; };

const LOG_ROWS = [
  ["09:41:12.031", "critical", "CRIT", "10.0.4.21", "PC-2041", "process.create blocked: rundll32.exe → cryptor.dll", "랜섬웨어 행위 차단", "winword.exe"],
  ["09:41:11.870", "medium", "WARN", "10.0.4.21", "PC-2041", "usb.attach vendor=0x0781 product=0x5583 (unapproved)", "외부 USB 차단", "explorer.exe"],
  ["09:41:09.114", "info", "INFO", "10.0.0.3", "Server-03", "policy.sync ok (rev 2041)", "정책 동기화", "js-agent"],
  ["09:40:58.552", "high", "HIGH", "10.0.4.33", "PC-1187", "malware.known blocked sha256=9f3a…c21e", "알려진 악성코드 차단", "chrome.exe"],
  ["09:40:41.207", "low", "LOW", "10.0.0.3", "Server-03", "agent.checkin 1284/1284", "에이전트 체크인", "js-agent"],
  ["09:39:57.980", "info", "INFO", "10.0.7.10", "PC-0932", "scan.scheduled completed files=48213 threats=0", "예약 검사", "js-agent"],
];
/* 로그 뷰어 표 — 행 펼침(사람의 결정 2026-11-15, Side Panel 대신) + 고정 헤더. 첫 행만 펼쳐 둔다 */
const logTable = (rows) => `
          <div class="tbl-wrap sticky log-table" tabindex="0" role="region" aria-label="로그 목록">
            <table class="tbl compact hover" id="log-tbl">
              <thead><tr><th class="expand"><span class="sr-only">상세</span></th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>심각도</th><th>소스 IP</th><th>단말</th><th>메시지</th></tr></thead>
              <tbody>
                ${rows.map(([t, tone, lv, ip, host, msg, pol, proc], i) => `<tr class="log-row"><td class="expand"><button type="button" class="expand-btn" aria-expanded="${i === 0}" aria-controls="lv${i}-d" aria-label="${t} 로그 상세">${I("chevron-right",16)}</button></td><td>2026. 09. 07 ${t}</td><td><span class="tag ${tone} sm">${lv}</span></td><td>${ip}</td><td>${host}</td><td class="truncate">${msg}</td></tr><tr class="row-detail" id="lv${i}-d"${i === 0 ? "" : " hidden"}><td colspan="6"><div class="row-detail-body"><dl class="detail-meta"><dt>탐지 정책</dt><dd>${pol}</dd><dt>단말</dt><dd>${host} · ${ip}</dd><dt>프로세스</dt><dd>${proc}</dd></dl><div class="code-view wrap"><div class="head"><span class="title">${t} 원본 로그</span>${pCopy(t + " 원본 로그")}</div><pre tabindex="0" aria-label="${t} 원본 로그"><code>2026-09-07T${t} ${ip} ${lv} ${msg} host=${host} proc=${proc}</code></pre></div></div></td></tr>`).join("\n                ")}
              </tbody>
            </table>
          </div>`;

/* 대시보드의 탐색형 추이 차트 데이터 — React 예제(_react/examples/patterns/dashboard/full.tsx)와 같아야 한다 */
/* 대시보드 일별 탐지 = Data Visual Default 와 같은 계열 하나인 추이(사람의 요청 2026-11-18 — 그 전 심각도 누적 막대) */
const DAILY14 = {"labels":["10-21","10-22","10-23","10-24","10-25","10-26","10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03"],"series":[{"label":"탐지","data":[94,90,111,104,97,108,114,84,99,115,134,93,81,105]}]};
/* 2026-11-15 차트 카드 · 증감 · 스파크 · 진행 막대 — components.data.js 의 chartHead · delta · sparkCanvas · meter 와 같은 마크업(브라우저에서 두 파일이 한 전역을 나눠 써 이름을 달리한다) */
const pChartHead = (title, sub = "", action = "") => `<div class="chart-head"><h3 class="chart-title">${title}</h3>${sub ? `<span class="chart-sub">${sub}</span>` : ""}${action ? `<div class="chart-action">${action}</div>` : ""}</div>`;
const pDelta = (dir, tone, text) => `<span class="delta${tone ? " " + tone : ""}">${I(dir === "up" ? "arrow-up" : "arrow-down", 12)}<span class="sr-only">${dir === "up" ? "증가" : "감소"}</span>${text}</span>`;
const pMeter = (id, label, value, max, unit = "") => { const pct = Math.round(value / max * 1000) / 10, fmt = (n) => n.toLocaleString("en-US"); return `<div class="progress-row"><div class="row"><span id="${id}">${label}</span><span><b>${fmt(value)}</b><span class="target">/ ${fmt(max)}${unit}</span></span></div><div class="progress" role="meter" aria-labelledby="${id}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${fmt(value)}${unit} / ${fmt(max)}${unit}, ${Math.round(pct)}%"><i style="width:${pct}%"></i></div></div>`; };
const DASH = {
  /* 심각도 분포 — 탐색형 도넛(2026-11-18). components.data.js CHART_DATA.severity 와 같은 값 */
  severity: {"series":[{"label":"Critical","tone":"critical","value":190},{"label":"High","tone":"high","value":285},{"label":"Medium","tone":"medium","value":196},{"label":"Low","tone":"low","value":120},{"label":"Info","tone":"info","value":263}],"center":"1,054","legend":"right"},
  /* tone 없는 두 계열 → 한 톤 1 · 4 단계 */
  weeks: {"labels":["랜섬웨어","악성코드","USB 위반","정책 위반","피싱"],"series":[{"label":"이번 주","data":[412,306,221,115,88]},{"label":"지난 주","data":[349,331,198,142,97]}]},
};
/* 분석 · 리포트(2026-11-20) — 최근 7일. 추이 · 유형 · 경로 · 표의 합계가 모두 1,309 로 맞는다(필터가 아래 전체에 같이 걸리는 화면이라 숫자가 서로 맞아야 한다) */
const ANALYTICS = {
  trend: {"labels":["11-12","11-13","11-14","11-15","11-16","11-17","11-18"],"series":[{"label":"Critical","tone":"critical","data":[14,18,12,20,26,11,15]},{"label":"High","tone":"high","data":[38,42,40,44,49,36,39]},{"label":"Medium","tone":"medium","data":[61,66,64,68,72,60,62]},{"label":"Low","tone":"low","data":[38,42,43,40,41,42,39]},{"label":"Info","tone":"info","data":[22,25,20,27,30,19,24]}],"stacked":true},
  types: {"labels":["랜섬웨어","악성코드","USB 위반","정책 위반","피싱"],"series":[{"label":"탐지","data":[472,351,253,132,101]}],"horizontal":true},
  channels: {"series":[{"label":"엔드포인트","value":734},{"label":"메일","value":307},{"label":"네트워크","value":186},{"label":"USB","value":82}],"center":"1,309","legend":"right"},
  rows: [["랜섬웨어", 472, 58, "99.4%", ["up", "bad", "12%"]], ["악성코드", 351, 31, "99.1%", ["down", "good", "4%"]], ["USB 위반", 253, 9, "97.6%", ["up", "bad", "9%"]], ["정책 위반", 132, 6, "96.2%", ["down", "good", "7%"]], ["피싱", 101, 12, "98.0%", ["up", "bad", "3%"]]],
};
/* 분석 화면의 필터 줄 — 기간이 맨 앞(프리셋 7 · 30 · 90일), 심각도 하나. 모든 카드 위 · 카드 밖에 한 줄 */
const pFilters = (pre, sev = []) => `<div class="toolbar">
            <div class="datepicker field" data-range data-max="today" data-presets="7 30 90"><div class="affix"><input id="${pre}-range" value="2026. 11. 12 ~ 2026. 11. 18" placeholder="YYYY. MM. DD ~ YYYY. MM. DD" inputmode="numeric" autocomplete="off" aria-label="조회 기간"><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar")}</button></div></div>
            ${pCombo({ id: `${pre}-sev`, label: "심각도", items: SEVS, selected: sev, multiple: true, placeholder: "심각도 전체" })}
          </div>`;
const pAnKpis = () => `<div class="kpi-grid">
            <div class="kpi"><span class="label">전체 탐지</span><span class="value">1,309</span><div class="kpi-foot">${pDelta("up", "bad", "8%")}<span class="delta-note">지난 7일 대비</span></div></div>
            <div class="kpi critical"><span class="label">Critical</span><span class="value">116</span><div class="kpi-foot">${pDelta("down", "good", "5%")}<span class="delta-note">지난 7일 대비</span></div></div>
            <div class="kpi"><span class="label">평균 대응 시간</span><span class="value">42<small>분</small></span><div class="kpi-foot">${pDelta("down", "good", "6분")}<span class="delta-note">지난 7일 대비</span></div></div>
            <div class="kpi"><span class="label">차단률</span><span class="value">98.7<small>%</small></span><div class="kpi-foot">${pDelta("up", "good", "0.4%p")}<span class="delta-note">지난 7일 대비</span></div></div>
          </div>`;
const AN_TREND_LABEL = "일별 탐지 추이 — 최근 7일 합계 1,309건, 11월 16일 218건이 가장 많음. Critical 116, High 288, Medium 453, Low 285, Info 167";
const pAnTrend = (busy) => `<div class="chart-card lg"${busy ? ' aria-busy="true"' : ""}>${pChartHead("일별 탐지 추이", "심각도별")}<div class="chart-view"><div class="chart-canvas"><canvas data-chart="bar" data-spec='${JSON.stringify(ANALYTICS.trend)}' role="img" aria-label="${AN_TREND_LABEL}"></canvas></div></div>${busy ? '<span class="sr-only" role="status">새 조건으로 다시 불러오는 중</span>' : ""}</div>`;
const DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "재무팀"];
const SEVS = ["Critical", "High", "Medium", "Low", "Info"];
/* 권한 트리 — 역할 편집 · 정책 적용 대상에서 쓴다. components.data.js 의 treeHtml 과 같은 구조(상위의 aria-checked 는 하위에서 계산) */
const pTreeState = (it) => it.children ? (() => { const k = it.children.map(pTreeState); return k.every((x) => x === "true") ? "true" : k.every((x) => x === "false") ? "false" : "mixed"; })() : String(!!it.checked);
const pTreeItems = (items, id, lv, path, first) => items.map((it, n) => {
  const nid = `${id}-${path}${n}`, par = !!it.children, st = pTreeState(it);
  const a = [`aria-level="${lv}"`, `tabindex="${first && n === 0 && lv === 1 ? 0 : -1}"`, par && `aria-expanded="${it.open ? "true" : "false"}"`, par && `aria-labelledby="${nid}"`, `aria-checked="${st}"`].filter(Boolean).join(" ");
  return `<li class="tree-item" role="treeitem" ${a}><div class="tree-row"><span class="tree-toggle" aria-hidden="true">${par ? I("chevron-right", 16) : ""}</span><span class="tree-check" aria-hidden="true"></span><span class="tree-label"${par ? ` id="${nid}"` : ""}>${it.label}</span>${it.meta != null ? `<span class="tree-meta">${it.meta}</span>` : ""}</div>${par ? `<ul class="tree-group" role="group"${it.open ? "" : " hidden"}>${pTreeItems(it.children, id, lv + 1, `${path}${n}-`, false)}</ul>` : ""}</li>`;
}).join("");
const pTree = (items, id, label) => `<ul class="tree checkable" role="tree" aria-label="${label}" aria-multiselectable="true">${pTreeItems(items, id, 1, "", true)}</ul>`;
const ROLE_PERMS = [
  { label: "대시보드", open: false, children: [{ label: "보기", checked: true }] },
  { label: "이벤트", open: true, children: [{ label: "보기", checked: true }, { label: "처리", checked: true }, { label: "내보내기", checked: false }] },
  { label: "정책", open: true, children: [{ label: "보기", checked: true }, { label: "편집", checked: true }, { label: "배포", checked: true }] },
  { label: "사용자", open: false, children: [{ label: "보기", checked: true }, { label: "관리", checked: false }] },
];
const POLICY_TARGETS = [
  { label: "본사", meta: 128, open: true, children: [{ label: "보안팀", meta: 24, checked: true }, { label: "개발팀", meta: 56, checked: true }, { label: "경영지원팀", meta: 48, checked: false }] },
  { label: "부산 지사", meta: 31, open: false, children: [{ label: "영업팀", meta: 19, checked: true }, { label: "기술지원팀", meta: 12, checked: true }] },
];

const PATTERNS = {
  /* ------------------------------------------------ Common UI */
  "input-form": {
    status: "ready", react: ["Form","FormLegend","FormSection","FormRow","FormActions"], uses: ["form", "text-field", "number-input", "select", "combobox", "date-picker", "time-picker", "file-upload", "checkbox", "radio-button", "button"], css: [], borrows: [".menu-mark", ".t-label-1-normal", ".t-semibold", ".chip", ".sr-only"],
    desc: "정책이나 사용자, 설정을 입력하는 폼의 기본 구조입니다. 라벨은 필드 위에 두고, 필수 항목에는 별표를 붙입니다. 오류는 필드 아래에 적고, 저장 버튼은 오른쪽 아래에 둡니다.",
    choose: [["언제 쓰는가", "정책이나 사용자, 연동처럼 여러 값을 한 번에 입력하고 저장하는 화면에 씁니다."], ["비슷한 패턴", "값을 하나씩 바로 바꾸는 화면은 <a href=\"#/patterns/policy-settings\">정책 설정</a>을, 순서대로 나눠 받는 처음 설정은 <a href=\"#/patterns/onboarding\">온보딩</a>을 씁니다."]],
    principles: [["구성", "한 열이 기본입니다. 시작과 종료처럼 서로 관련된 짧은 필드만 두 열로 나란히 둡니다. 필드가 많으면 섹션 제목으로 묶습니다."], ["입력 컨트롤", "날짜는 Date Picker, 시각은 Time Picker, 숫자는 Number Input 으로 받습니다. 정해진 목록에서 하나를 고르면 Select, 여럿을 고르거나 목록이 길면 Combobox, 파일은 File Upload 를 씁니다."], ["검증", "폼 검증을 켜면 포커스가 떠날 때 그 필드를 검사합니다. 제출하면 첫 오류로 옮기고, 오류를 폼 위에 모아 요약하지 않습니다. 서버가 돌려준 오류도 그 필드 아래에 적습니다. 고치면 문구를 바로 지웁니다."], ["필수", "필수 항목이 있으면 폼 위에 필수 항목 안내를 둡니다."], ["액션", "버튼은 취소, 저장 순서로 두고 주 버튼은 저장 하나입니다. 삭제처럼 되돌리기 어려운 동작은 왼쪽 끝에 따로 둡니다."]],
    examples: [
      { id: "basic", title: "기본 폼", desc: "섹션 제목으로 필드 묶음을 나누고, 맨 아래에 버튼 줄을 둡니다. 날짜와 시각, 여러 부서, 첨부 파일처럼 값의 종류마다 맞는 컨트롤을 씁니다. 초안 저장을 켜 두어, 입력하다 페이지를 다시 열면 되살립니다.", html: `
        <form class="form" data-draft="policy-new">
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="form-section">기본 정보</div>
          <div class="field"><label for="pname">정책 이름 <em>*</em></label><input id="pname" placeholder="예: 외부 USB 차단" required><span class="help">2~40자</span></div>
          <div class="field"><label for="pdesc">설명</label><textarea id="pdesc" placeholder="정책의 목적과 적용 범위"></textarea></div>
          <div class="form-section">적용 대상</div>
          <div class="form-row">
            ${pSel({ id: "pgroup", label: "그룹", opts: [["all", "전체"], ["sales", "영업팀"], ["dev", "개발팀"], ["sec", "보안팀"]], value: "all" })}
            <div class="field number-field"><label for="prio">우선순위</label><div class="affix"><input id="prio" type="number" value="10" min="1" max="100"><button type="button" class="num-btn down" tabindex="-1" aria-label="우선순위 줄이기">${I("minus",16)}</button><button type="button" class="num-btn up" tabindex="-1" aria-label="우선순위 늘리기">${I("plus",16)}</button></div><span class="help">1~100</span></div>
          </div>
          ${pCombo({ id: "pnotify", label: "알림 받을 부서", items: DEPTS, selected: ["보안팀"], multiple: true, placeholder: "부서 검색", field: true })}
          <div class="form-section">적용 일정</div>
          <div class="form-row">
            ${pDate({ id: "pstart", label: "적용 시작일", value: "2026. 11. 16" })}
            ${pTime({ id: "ptime", label: "적용 시각", value: "09:00" })}
          </div>
          <fieldset class="radio-group"><legend class="t-label-1-normal t-semibold">탐지 시 동작</legend>
            <label class="radio"><input type="radio" name="fa" checked><span>차단 후 알림</span></label>
            <label class="radio"><input type="radio" name="fa"><span>알림만</span></label>
          </fieldset>
          <div class="field"><label id="pfile-l">예외 목록</label><div class="upload compact" data-max-size="1MB"><div class="upload-zone"><button type="button" id="pfile-p" class="btn sm outline assistive upload-pick" aria-labelledby="pfile-l pfile-p">파일 선택</button><input type="file" hidden accept=".csv"></div><span class="sr-only upload-status" role="status"></span></div><span class="help">CSV, 1MB 이하</span></div>
          <label class="checkbox"><input type="checkbox" checked><span>저장 즉시 배포<small>에이전트가 다음 체크인에서 적용합니다</small></span></label>
          <div class="form-actions"><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">정책 저장</button></div></div>
        </form>` },
      { id: "error", title: "오류 상태", desc: "제출한 뒤 오류가 난 모습입니다. 오류는 필드마다 그 아래에 적고, 폼 위에 모아 요약하지 않습니다.", html: `
        <form class="form" novalidate>
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field error"><label for="e1">정책 이름 <em>*</em></label><input id="e1" aria-invalid="true" aria-describedby="e1h"><span class="help" id="e1h">정책 이름을 입력하세요</span></div>
          <div class="field error"><label for="e2">허용 IP</label><input id="e2" value="10.0.0" aria-invalid="true" aria-describedby="e2h"><span class="help" id="e2h">올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12</span></div>
          <div class="field number-field error"><label for="e3">보관 기간</label><div class="affix"><input id="e3" type="number" value="500" min="1" max="365" aria-invalid="true" aria-describedby="e3h" aria-valuetext="500일"><span>일</span><button type="button" class="num-btn down" tabindex="-1" aria-label="보관 기간 줄이기">${I("minus",16)}</button><button type="button" class="num-btn up" tabindex="-1" aria-label="보관 기간 늘리기" disabled>${I("plus",16)}</button></div><span class="help" id="e3h">값이 너무 큽니다. 365 이하 입력하세요.</span></div>
          <div class="form-actions"><button type="button" class="btn md outline assistive left">삭제</button><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">정책 저장</button></div></div>
        </form>` },
      { id: "validate", title: "제출 검증", desc: "폼 검증을 켜면 포커스가 떠날 때 필드 단위로 검사합니다. 빈 채로 정책 저장을 누르면 막고 첫 오류로 옮깁니다. 고치면 문구를 바로 지웁니다.", html: `
        <form class="form" data-validate novalidate>
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label for="v1">정책 이름 <em>*</em></label><input id="v1" required minlength="2" data-maxlength="40"><span class="help" aria-live="polite">2~40자</span></div>
          <div class="field"><label for="v2">허용 IP <em>*</em></label><input id="v2" required pattern="^([0-9]{1,3}[.]){3}[0-9]{1,3}$" data-messages='{"pattern":"올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12"}'><span class="help" aria-live="polite">IPv4 형식</span></div>
          <div class="field number-field"><label for="v3">보관 기간 <em>*</em></label><div class="affix"><input id="v3" type="number" required min="1" max="365"><span>일</span><button type="button" class="num-btn down" tabindex="-1" aria-label="보관 기간 줄이기">${I("minus",16)}</button><button type="button" class="num-btn up" tabindex="-1" aria-label="보관 기간 늘리기">${I("plus",16)}</button></div><span class="help" aria-live="polite">1~365일</span></div>
          <div class="field"><label for="v4">알림 이메일 <em>*</em></label><input id="v4" type="email" required><span class="help" aria-live="polite"></span></div>
          <div class="form-actions"><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">정책 저장</button></div></div>
        </form>` },
    ],
  },

  "terms-agreement": {
    status: "ready", react: ["Terms","TermsAll","TermsItem","TermsMessage"], uses: ["checkbox", "tag", "accordion", "popup", "button"], css: [".terms", ".terms-doc"],
    desc: "약관과 개인정보 처리에 동의를 받는 화면입니다. 전체 동의와 개별 항목을 두고, 항목마다 필수인지 선택인지 표시합니다. 약관 전문은 대화상자로 열거나 같은 화면에서 펼쳐 봅니다.",
    choose: [["언제 쓰는가", "서비스를 쓰기 전에 약관과 개인정보 처리에 동의를 받아야 할 때 씁니다."], ["비슷한 패턴", "동의가 처음 설정의 한 단계라면 <a href=\"#/patterns/onboarding\">온보딩</a> 안에 넣습니다."]],
    principles: [["필수 표시", "항목마다 필수인지 선택인지 Tag 로 적습니다. 필수는 강조 Tag, 선택은 중립 Tag 입니다."], ["전체 동의", "일부만 체크하면 전체 동의가 부분 선택으로 보입니다. 전체 동의를 누르면 선택 항목까지 모두 켜집니다."], ["진행", "다음 버튼은 늘 켜 둡니다. 필수를 비운 채 누르면 넘어가지 않고 남은 개수를 알린 뒤 첫 항목으로 포커스를 옮깁니다."], ["전문", "항목 옆 보기는 전문을 대화상자로 엽니다. 전문이 짧거나 한 항목뿐이면 Accordion 으로 같은 화면에서 펼칩니다. 스크롤되는 전문 영역은 키보드로도 스크롤할 수 있게 합니다."]],
    examples: [
      { id: "basic", title: "전체 동의 + 개별 항목", desc: "일부만 체크하면 전체 동의가 부분 선택으로 보입니다. 다음은 늘 켜 둡니다. 필수 항목을 비운 채 누르면 넘어가지 않고, 남은 개수를 알린 뒤 첫 항목으로 포커스를 옮깁니다. 보기를 누르면 전문이 대화상자로 열립니다.", html: `
        <div class="terms">
          <div class="all"><label class="checkbox"><input type="checkbox" class="mixed" aria-label="전체 동의"><span>전체 동의</span></label></div>
          <div class="item" data-required><label class="checkbox"><input type="checkbox" checked><span>서비스 이용약관</span></label><span class="tag accent sm">필수</span><button type="button" class="view" aria-label="서비스 이용약관 보기" data-popup-open="#terms-tos">보기</button></div>
          <div class="item" data-required><label class="checkbox"><input type="checkbox" checked><span>개인정보 수집·이용</span></label><span class="tag accent sm">필수</span><button type="button" class="view" aria-label="개인정보 수집·이용 보기" data-popup-open="#terms-privacy">보기</button></div>
          <div class="item"><label class="checkbox"><input type="checkbox"><span>보안 소식 이메일 수신</span></label><span class="tag sm">선택</span></div>
          <div class="msg" aria-live="polite"></div>
          <div class="btn-group end"><button type="button" class="btn md solid primary">다음</button></div>
        </div>` },
      { id: "full", title: "전문 대화상자", desc: "보기로 여는 대화상자입니다. 전문은 본문 안에서 스크롤하고, 키보드로도 스크롤할 수 있게 영역에 포커스를 줍니다. 동의는 목록의 체크박스로만 받습니다.", html: `
        <div class="popup" id="terms-tos" role="dialog" aria-modal="true" aria-labelledby="terms-tos-t">
          <h3 class="popup-title" id="terms-tos-t">서비스 이용약관</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-body terms-doc" tabindex="0" role="region" aria-label="서비스 이용약관 전문"><p>제1조(목적) 이 약관은 지란지교시큐리티가 제공하는 보안 관리 서비스의 이용 조건과 절차를 정합니다.</p><p>제2조(정의) 서비스란 회사가 제공하는 에이전트와 관리 콘솔을 말합니다. 이용자란 이 약관에 따라 서비스를 쓰는 조직과 그 구성원을 말합니다.</p><p>제3조(약관의 효력) 이 약관은 서비스 화면에 게시하여 효력이 생깁니다. 회사는 관련 법령을 어기지 않는 범위에서 약관을 바꿀 수 있고, 바꾸면 적용일 7일 전에 알립니다.</p></div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>닫기</button></div>
        </div>
        <div class="popup" id="terms-privacy" role="dialog" aria-modal="true" aria-labelledby="terms-privacy-t">
          <h3 class="popup-title" id="terms-privacy-t">개인정보 수집·이용</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-body terms-doc" tabindex="0" role="region" aria-label="개인정보 수집·이용 전문"><p>수집 항목은 이름, 이메일, 소속 부서입니다. 관리자 계정을 만들고 보안 알림을 보내는 데 씁니다.</p><p>보유 기간은 계정을 지운 뒤 30일입니다. 동의하지 않으면 관리자 계정을 만들 수 없습니다.</p></div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>닫기</button></div>
        </div>`, layout: "stack" },
      { id: "inline", title: "전문 펼쳐 보기", desc: "약관 전문은 Accordion 으로 같은 화면에서 펼칩니다. 펼친 본문은 높이를 넘으면 안에서 스크롤합니다.", html: `
        <div class="terms">
          <details class="accordion md outline" open><summary><label class="checkbox"><input type="checkbox" checked><span>서비스 이용약관</span></label><span class="tag accent sm">필수</span></summary><div class="body" tabindex="0" role="region" aria-label="서비스 이용약관 전문">제1조(목적) 이 약관은 지란지교시큐리티가 제공하는 보안 관리 서비스의 이용 조건과 절차를 정합니다. 제2조(정의) 서비스란 회사가 제공하는 에이전트와 관리 콘솔을 말합니다. 제3조(약관의 효력) 이 약관은 서비스 화면에 게시하여 효력이 생깁니다. 회사는 약관을 바꾸면 적용일 7일 전에 알립니다.</div></details>
        </div>` },
    ],
  },

  "notes": {
    status: "ready", react: ["Notes"], uses: ["notification", "accordion"], css: [],
    desc: "화면 아래나 폼 옆에 두는 유의사항과 안내 문구입니다. 읽지 않아도 진행할 수 있는 정보를 Notice 안에 글머리 목록으로 담습니다.",
    choose: [["언제 쓰는가", "적용 시점이나 보관 기간처럼 알아 두면 좋지만 진행을 막지 않는 안내를 화면에 남길 때 씁니다."], ["비슷한 패턴", "지금 조치해야 하는 문제는 <a href=\"#/components/notification\">Notification</a> 의 위험 알림으로, 되돌릴 수 없는 동작의 확인은 <a href=\"#/patterns/danger-confirm\">위험 작업 확인</a>으로 받습니다."]],
    principles: [["모양", "톤 없는 Notice 위에 제목과 글머리 목록을 둡니다. 회색 면에 회색 말풍선 아이콘이 붙고 테두리는 없습니다."], ["분량", "항목은 3~5개입니다. 한 항목은 완전한 한 문장으로 쓰고, 그보다 길면 Accordion 으로 접습니다."], ["주의", "되돌리기 어려운 영향을 알릴 때만 경고 톤을 씁니다. 경고 톤이 늘 보이면 정말 중요한 경고가 묻힙니다."], ["자리", "관련된 폼이나 표 바로 아래에 둡니다. 화면 맨 위는 상태 알림의 자리라 유의사항을 두지 않습니다."]],
    examples: [
      { id: "basic", title: "기본", desc: "제목과 3~5개의 글머리 항목으로 씁니다. 회색 면 위에 두고 테두리는 없습니다.", html: `
        <div class="notice" role="note"><span class="ico">${I("message-2",20,{style:"filled"})}</span><div><b>유의사항</b><ul><li>정책은 배포 후 에이전트의 다음 체크인(최대 5분)에 적용됩니다.</li><li>차단된 파일은 격리 저장소에 30일 보관 후 자동 삭제됩니다.</li><li>예외 목록은 해시 또는 경로 기준이며 와일드카드(*)를 지원합니다.</li></ul></div></div>` },
      { id: "warning", title: "주의", desc: "되돌리기 어려운 영향을 알릴 때는 경고 톤을 씁니다. 바로 조치해야 하면 <a href=\"#/components/notification\">Notification</a> 의 위험 알림을 씁니다.", html: `
        <div class="notice warning" role="note"><span class="ico">${I("alert-triangle",20,{style:"filled"})}</span><div><b>정책 삭제 전 확인</b><ul><li>삭제한 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</li><li>감사 로그는 유지되지만 정책 이름은 ID 로 표시됩니다.</li></ul></div></div>` },
      { id: "collapsed", title: "접힌 유의사항", desc: "길거나 부차적인 안내는 Accordion 으로 접습니다.", html: `
        <details class="accordion md outline"><summary>${I("info-circle")}유의사항 <small>3개</small></summary><div class="body"><ul><li>정책은 배포 후 최대 5분 내 적용됩니다.</li><li>격리 파일은 30일 보관됩니다.</li><li>예외는 해시와 경로 기준입니다.</li></ul></div></details>` },
    ],
  },

  "error-pages": {
    status: "new", react: ["Empty","Card","CopyField"], uses: ["empty-state", "card", "button", "link", "copy-field"], css: [".row-2"],
    desc: "권한이 없거나 페이지가 없을 때, 서버 오류나 점검 중일 때 보여 주는 화면입니다. 무엇이 일어났는지 한 줄로 알리고 다음에 할 일 하나를 둡니다.",
    choose: [["언제 쓰는가", "화면 전체나 카드 하나를 보여 줄 수 없을 때 그 자리를 대신합니다. 권한 없음, 없는 주소, 서버 오류, 점검 중의 네 가지입니다."], ["비슷한 패턴", "검색 결과가 없는 것은 오류가 아니므로 <a href=\"#/patterns/search\">검색</a>의 빈 결과를 씁니다. 처음이라 데이터가 없는 화면은 <a href=\"#/components/empty-state\">Empty State</a> 를 씁니다."]],
    principles: [["문구", "무엇이 일어났는지와 고치는 법을 한 줄씩 씁니다. 지원 문의에 오류 번호가 필요하면 번호와 시각을 복사할 수 있게 문구 아래에 둡니다. 복사는 다음 행동이 아니라 정보입니다."], ["동작", "다음에 할 일 하나만 버튼으로 둡니다. 권한 없음은 권한 요청, 없는 주소는 대시보드로 이동, 서버 오류는 다시 시도입니다."], ["권한 없음", "권한이 없다는 사실은 알리되 무엇이 있는지는 보이지 않습니다. 메뉴에서 그 화면을 숨기는 것이 먼저이고, 주소로 직접 들어온 경우에만 이 화면을 봅니다."], ["카드 안", "화면의 일부만 볼 수 없으면 그 카드 안에만 작게 둡니다. 나머지 카드는 그대로 씁니다."], ["점검", "점검 시간은 시작과 끝을 날짜와 함께 적습니다. 점검 중에는 다시 시도 버튼을 두지 않습니다."]],
    examples: [
      { id: "pages", title: "화면 전체", desc: "권한 없음, 없는 주소, 서버 오류, 점검 중의 네 화면입니다. 아이콘과 제목, 설명, 동작 하나로 같은 틀을 씁니다.", html: `
        <div class="row-2">
          <div class="empty"><span class="ico">${I("lock",24)}</span><b>이 화면을 볼 권한이 없습니다</b><span>관리자에게 정책 편집 권한을 요청하세요.</span><button type="button" class="btn md outline assistive">권한 요청</button></div>
          <div class="empty"><span class="ico">${I("file-search",24)}</span><b>페이지를 찾을 수 없습니다</b><span>주소가 바뀌었거나 삭제된 페이지입니다.</span><a href="#" class="btn md outline assistive">대시보드로 이동</a></div>
          <div class="empty error"><span class="ico">${I("alert-triangle",24)}</span><b>이 화면을 불러오지 못했습니다</b><span>잠시 후 다시 시도하세요. 계속되면 아래 오류 정보를 복사해 관리자에게 보내세요.</span>${pCopyInline("오류 정보", "E-5021 · 11. 23 14:30")}<button type="button" class="btn md outline assistive">${I("refresh")}다시 시도</button></div>
          <div class="empty"><span class="ico">${I("tool",24)}</span><b>시스템 점검 중입니다</b><span>11월 16일 02:00 부터 04:00 까지 점검합니다. 점검이 끝나면 다시 접속하세요.</span><a href="#" class="link standalone">점검 공지 보기</a></div>
        </div>`, layout: "stack" },
      { id: "inline", title: "카드 안", desc: "화면의 일부만 볼 수 없을 때는 그 카드 안에만 작은 Empty State 를 둡니다.", html: `
        <div class="row-2">
          <div class="card"><div class="card-head"><h3 class="title">라이선스 사용량</h3></div><div class="empty compact"><span class="ico">${I("lock")}</span><div><b>이 카드를 볼 권한이 없습니다</b><span>라이선스 관리 권한이 필요합니다.</span></div><button type="button" class="btn sm outline assistive">권한 요청</button></div></div>
          <div class="card"><div class="card-head"><h3 class="title">최근 배포</h3></div><div class="empty compact error"><span class="ico">${I("alert-triangle")}</span><div><b>목록을 불러오지 못했습니다</b><span>잠시 후 다시 시도하세요.</span></div><button type="button" class="btn sm outline assistive">다시 시도</button></div></div>
        </div>`, layout: "stack" },
    ],
  },

  "danger-confirm": {
    status: "new", react: ["Popup","PopupSurface","Toast"], uses: ["popup", "text-field", "notification", "button"], css: [".danger-list"],
    desc: "삭제나 재발급처럼 되돌리기 어려운 동작을 실행하기 전에 확인을 받는 화면입니다. 무엇이 사라지는지와 영향 범위를 제목과 본문에 적고, 취소를 먼저 둡니다.",
    choose: [["언제 쓰는가", "지우면 복구할 수 없거나, 다른 사용자와 단말에 영향이 가는 동작을 실행하기 직전에 씁니다."], ["비슷한 패턴", "되돌릴 수 있는 동작은 확인을 묻지 않고 실행한 뒤 실행 취소가 있는 Toast 를 띄웁니다. 진행을 막지 않는 안내는 <a href=\"#/patterns/notes\">유의사항</a>으로 남깁니다."]],
    principles: [["제목", "무엇을 하는지 물음으로 씁니다. 대상의 이름이나 개수를 넣고, 주 버튼의 글자가 제목의 동작과 같게 합니다."], ["본문", "사라지는 것과 영향 범위를 적습니다. 복구할 수 없으면 그렇다고 적고, 영향을 받는 단말이나 연동의 수를 숫자로 씁니다."], ["버튼 순서", "취소가 먼저이고 위험 실행 버튼이 뒤입니다. 처음 포커스는 취소나 입력칸에 가고 위험 실행 버튼에는 가지 않습니다."], ["일괄 작업", "여럿을 한 번에 지우면 개수와 이름 몇 개를 보여 주고 나머지는 외 n개로 줄입니다."], ["이름 입력", "연동이나 조직처럼 지우면 넓게 영향을 주는 것만 이름을 입력하게 합니다. 입력할 이름은 라벨에서 굵게 보이고, 앞뒤 공백은 비교하지 않습니다. 버튼은 늘 켜 두고 누르면 검사해, 이름이 다르면 입력칸 아래에 고치는 법을 적습니다."], ["되돌리기", "보관함으로 옮기기처럼 되돌릴 수 있으면 확인을 묻지 않습니다. 바로 실행하고 실행 취소가 있는 Toast 를 10초 동안 띄웁니다."], ["닫기", "위험 확인은 바깥을 눌러도 닫히지 않습니다. 취소와 닫기, Esc 로만 닫습니다."]],
    examples: [
      { id: "single", title: "단건 삭제", desc: "대상의 이름을 제목에 넣고, 사라지는 것과 영향을 본문에 적습니다.", html: `
        <div class="popup danger" role="alertdialog" aria-modal="true" aria-labelledby="dc1-t" aria-describedby="dc1-b">
          <h3 class="popup-title" id="dc1-t">'외부 USB 차단' 정책을 삭제할까요?</h3>${pClose("popup-close", "data-popup-close")}
          <p class="popup-body" id="dc1-b">삭제한 정책은 복구할 수 없습니다. 이 정책이 적용된 에이전트 1,284대는 기본 정책으로 돌아갑니다.</p>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative">삭제</button></div></div>
        </div>` },
      { id: "bulk", title: "일괄 작업", desc: "여럿을 한 번에 지우면 개수와 이름 몇 개를 보여 주고, 나머지는 외 n개로 줄입니다.", html: `
        <div class="popup danger" role="alertdialog" aria-modal="true" aria-labelledby="dc2-t" aria-describedby="dc2-b">
          <h3 class="popup-title" id="dc2-t">정책 12개를 삭제할까요?</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-body" id="dc2-b"><p>삭제한 정책은 복구할 수 없습니다. 적용된 에이전트는 기본 정책으로 돌아갑니다.</p><ul class="danger-list"><li>외부 USB 차단</li><li>스크립트 실행 제한</li><li>원격 접속 허용 목록</li><li>외 9개</li></ul></div>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative">삭제</button></div></div>
        </div>` },
      { id: "type-name", title: "이름 입력 확인", desc: "지우면 넓게 영향을 주는 것은 이름을 입력하게 합니다. 삭제 버튼은 늘 켜 두고, 누르면 입력을 검사합니다. 이름이 다르면 막고 입력칸 아래에 고치는 법을 적습니다.", html: `
        <div class="popup danger" role="alertdialog" aria-modal="true" aria-labelledby="dc3-t" aria-describedby="dc3-b">
          <h3 class="popup-title" id="dc3-t">'SIEM 연동'을 삭제할까요?</h3>${pClose("popup-close", "data-popup-close")}
          <p class="popup-body" id="dc3-b">연동을 삭제하면 이벤트 전송이 바로 멈추고, 이 연동을 쓰는 보고서 3개가 비게 됩니다. 복구할 수 없습니다.</p>
          <form class="popup-form" id="dc3-form" data-validate novalidate><div class="field"><label for="dc3-name">확인을 위해 <b>SIEM 연동</b>을 입력하세요</label><input id="dc3-name" required pattern="\\s*SIEM 연동\\s*" autocomplete="off" data-messages='{"required":"연동 이름을 입력하세요.","pattern":"연동 이름이 다릅니다. SIEM 연동을 그대로 입력하세요."}'><span class="help" aria-live="polite">이름이 같아야 삭제됩니다.</span></div></form>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="submit" form="dc3-form" class="btn md solid negative">삭제</button></div></div>
        </div>` },
      { id: "undo", title: "되돌리기", desc: "되돌릴 수 있는 동작은 확인을 묻지 않습니다. 바로 실행하고 실행 취소가 있는 Toast 를 띄웁니다.", html: `
        <div class="toast-stack" aria-live="polite">
          <div class="toast"><span class="ico">${I("circle-check",20)}</span>정책 3개를 보관함으로 옮겼습니다<button type="button" class="action">실행 취소</button></div>
        </div>` },
    ],
  },

  "import-export": {
    status: "new", react: ["FileUpload","Table","Popup"], uses: ["file-upload", "notification", "table", "tag", "popup", "radio-button", "date-picker", "time-picker", "checkbox", "button"], borrows: [".sr-only", ".help", ".field", ".t-label-1-normal", ".t-semibold"], css: [".stack", ".btn-group"],
    desc: "목록을 파일로 한 번에 들여오거나 내보내는 화면입니다. 가져오기는 줄마다 검사해 결과를 보여 준 뒤 실행하고, 내보내기는 형식과 범위를 정해 받습니다.",
    choose: [["언제 쓰는가", "단말이나 사용자, 예외 목록처럼 수십 건 이상을 한 번에 넣거나 꺼낼 때 씁니다."], ["비슷한 패턴", "한 건씩 넣는 것은 <a href=\"#/patterns/input-form\">입력 폼</a>을, 파일 하나를 첨부하는 것은 <a href=\"#/components/file-upload\">File Upload</a> 를 씁니다."]],
    principles: [["가져오기 순서", "파일을 올리면 먼저 줄마다 검사하고, 결과를 보여 준 뒤 사용자가 가져오기를 누를 때 실행합니다. 올리자마자 바로 반영하지 않습니다."], ["검사 결과", "전체 줄 수와 오류 줄 수를 Notice 에 적고, 오류 줄만 표로 보여 줍니다. 줄 번호와 값, 고치는 법을 함께 적습니다."], ["부분 가져오기", "오류가 있어도 올바른 줄만 가져올 수 있게 합니다. 주 버튼에 가져올 줄 수를 적고, 오류 줄은 파일로 내려받아 고칠 수 있게 합니다."], ["양식", "가져오기 영역 옆에 열 이름이 맞는 양식 파일을 둡니다. 허용하는 형식과 용량은 도움말에 적습니다."], ["내보내기", "형식과 기간을 대화상자에서 고릅니다. 기간이 길어 오래 걸리면 예약해서 보내고, 끝나면 알림으로 알립니다."], ["개인정보", "개인정보가 들어간 열은 기본으로 빼고, 넣으려면 따로 체크하게 합니다. 내보낸 기록은 감사 로그에 남깁니다."]],
    examples: [
      { id: "import", title: "가져오기 검사 결과", desc: "파일을 올리면 줄마다 검사하고, 오류 줄만 표로 보여 줍니다. 올바른 줄만 가져올 수 있고, 오류 줄은 파일로 내려받아 고칩니다.", html: `
        <div class="stack">
          <div class="field"><label id="imp-l">단말 목록 파일</label><div class="upload" data-max-size="5MB"><div class="upload-zone"><span class="ico">${I("upload",24)}</span><span class="upload-msg">CSV 파일을 끌어다 놓거나</span><button type="button" id="imp-p" class="btn sm outline assistive upload-pick" aria-labelledby="imp-l imp-p">파일 선택</button><input type="file" hidden accept=".csv"></div><span class="sr-only upload-status" role="status"></span><ul class="upload-list" aria-label="첨부 파일"><li class="upload-item done" data-id="imp1"><span class="ico">${I("circle-check",20)}</span><div class="body"><div class="row"><span class="name">agents-2026-11.csv</span><span class="size">212 KB</span><span class="sr-only"> (완료)</span></div></div><button type="button" class="btn sm text assistive icon-only remove" aria-label="agents-2026-11.csv 지우기">${I("x",16)}</button></li></ul></div><span class="help">CSV, 5MB 이하. 첫 줄은 단말 이름, IP, 그룹 열입니다.</span></div>
          ${pNotice("warning", "1,284줄 중 3줄을 가져올 수 없습니다", "오류 줄을 고쳐 다시 올리거나, 올바른 1,281줄만 가져오세요.", `<div class="actions"><button type="button" class="btn sm outline assistive">${I("download")}오류 줄 내려받기</button></div>`)}
          <div class="tbl-wrap"><table class="tbl compact nowrap"><thead><tr><th class="num">줄</th><th>단말 이름</th><th>IP</th><th>오류</th></tr></thead><tbody>
            <tr><td class="num">18</td><td>PC-2041</td><td>10.0.4.256</td><td><span class="tag high sm">IP 형식</span> 0~255 사이 숫자로 고치세요</td></tr>
            <tr><td class="num">342</td><td>PC-0932</td><td>10.0.7.10</td><td><span class="tag high sm">중복</span> 57줄과 같은 IP 입니다</td></tr>
            <tr><td class="num">1,107</td><td>(비어 있음)</td><td>10.0.9.44</td><td><span class="tag high sm">빈 값</span> 단말 이름을 채우세요</td></tr>
          </tbody></table></div>
          <div class="btn-group end"><button type="button" class="btn md outline assistive">취소</button><button type="button" class="btn md solid primary">1,281줄 가져오기</button></div>
        </div>`, layout: "stack" },
      { id: "export", title: "내보내기", desc: "형식과 기간을 대화상자에서 고릅니다. 오래 걸리는 내보내기는 시각을 정해 예약할 수 있습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="exp-t">
          <h3 class="popup-title" id="exp-t">로그 내보내기</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-form">
            <fieldset class="radio-group"><legend class="t-label-1-normal t-semibold">형식</legend><label class="radio"><input type="radio" name="exp-fmt" checked><span>CSV</span></label><label class="radio"><input type="radio" name="exp-fmt"><span>JSON</span></label></fieldset>
            ${pDate({ id: "exp-range", label: "기간", range: true, value: "2026. 11. 08 ~ 2026. 11. 14", attrs: 'data-max="today" data-presets="7 30"' })}
            <label class="checkbox"><input type="checkbox"><span>사용자 이름과 이메일 포함<small>개인정보가 들어갑니다. 내보낸 기록은 감사 로그에 남습니다</small></span></label>
            ${pTime({ id: "exp-time", label: "예약 시각", value: "02:00", help: "30일이 넘는 기간은 이 시각에 보냅니다." })}
          </div>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">내보내기</button></div></div>
        </div>` },
    ],
  },

  "bulk-progress": {
    status: "new", react: ["Progress", "Notice", "Table", "DataTable", "Card"], uses: ["card", "loading", "notification", "table", "tag", "button", "data-table", "empty-state"], borrows: [".sr-only"], css: [".stack", ".btn-group"],
    desc: "여러 대상에 같은 작업을 한 번에 실행하고 끝날 때까지 지켜보는 화면입니다. 얼마나 진행됐는지와 실패한 대상을 보여 주고, 실패한 대상만 다시 실행합니다.",
    choose: [["언제 쓰는가", "정책 배포나 에이전트 업데이트처럼 수십 대 이상에 같은 작업을 실행하고, 끝나기까지 몇 분 이상 걸릴 때 씁니다."], ["비슷한 패턴", "실행하기 전에 영향 범위를 확인하는 것은 <a href=\"#/patterns/danger-confirm\">위험 작업 확인</a>을, 파일로 목록을 들여오는 것은 <a href=\"#/patterns/import-export\">가져오기 · 내보내기</a>를 씁니다."]],
    principles: [["진행 표시", "전체 수와 끝난 수를 함께 적고 진행 막대로 보여 줍니다. 남은 시간은 잴 수 있을 때만 적습니다."], ["성공과 실패", "성공, 실패, 남은 수를 따로 셉니다. 실패가 생기면 작업이 끝나기 전에도 실패 수를 보여 줍니다."], ["화면을 떠나도 계속", "작업은 서버에서 이어집니다. 사용자가 다른 화면으로 가도 멈추지 않고, 끝나면 알림 센터로 알립니다."], ["취소", "취소는 아직 시작하지 않은 대상만 멈춥니다. 이미 끝난 대상은 되돌리지 않는다고 버튼 옆에 적습니다."], ["실패 목록", "끝나면 실패한 대상과 이유를 표로 보여 줍니다. 실패한 대상만 다시 실행하는 버튼을 두고, 실패 목록은 파일로도 내려받게 합니다."], ["읽어 주기", "진행 수가 바뀔 때마다 읽지 않습니다. 처음 실패했을 때와 끝났을 때만 화면 읽기 프로그램에 알립니다."]],
    examples: [
      { id: "running", title: "진행 중", desc: "끝난 수와 진행 막대, 성공과 실패, 남은 수를 함께 보여 줍니다. 취소는 아직 시작하지 않은 단말만 멈춥니다.", html: `
        <div class="card">
          <div class="card-head"><h3 class="title">정책 배포 · 표준 보호 v12</h3><span class="tag pending sm">진행 중</span></div>
          <div class="progress-row"><div class="row"><span>1,284대 중 842대 끝남</span><span>66%</span></div><div class="progress" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100" aria-label="정책 배포 진행률"><i style="width:66%"></i></div></div>
          <dl class="card-meta"><dt>성공</dt><dd>839대</dd><dt>실패</dt><dd>3대</dd><dt>남음</dt><dd>442대</dd></dl>
          <span class="sr-only" role="status">3대에 배포하지 못했습니다.</span>
          <p class="desc">이미 배포한 단말은 그대로 두고, 아직 시작하지 않은 단말만 멈춥니다.</p>
          <div class="card-foot"><button type="button" class="btn md outline assistive">남은 배포 취소</button></div>
        </div>` },
      { id: "result", title: "결과와 실패 목록", desc: "끝나면 실패한 대상과 이유를 표로 보여 주고, 실패한 대상만 다시 실행합니다.", html: `
        <div class="stack">
          ${pNotice("warning", "1,284대 중 3대에 배포하지 못했습니다", "원인을 고친 뒤 실패한 단말만 다시 배포하세요.", `<div class="actions"><button type="button" class="btn sm outline assistive">${I("download")}실패 목록 내려받기</button></div>`)}
          <div class="tbl-wrap"><table class="tbl compact nowrap"><thead><tr><th>단말</th><th>IP</th><th>이유</th><th>시도</th></tr></thead><tbody>
            <tr><td>PC-2041</td><td>10.0.4.21</td><td><span class="tag high sm">오프라인</span> 마지막 연결 3일 전</td><td>09:41</td></tr>
            <tr><td>PC-1187</td><td>10.0.4.33</td><td><span class="tag high sm">버전</span> 에이전트 4.2 이상이 필요합니다</td><td>09:42</td></tr>
            <tr><td>Server-03</td><td>10.0.0.3</td><td><span class="tag high sm">시간 초과</span> 응답이 없습니다</td><td>09:44</td></tr>
          </tbody></table></div>
          <div class="btn-group end"><button type="button" class="btn md outline assistive">닫기</button><button type="button" class="btn md solid primary">실패한 3대 다시 배포</button></div>
        </div>`, layout: "stack" },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "작업 결과를 불러오는 동안과 실패한 항목이 없을 때, 결과를 불러오지 못했을 때의 화면입니다.", html: pStates({"cols": ["대상", "결과", "사유"], "loading": "작업 결과 불러오는 중", "emptyTitle": "실패 없음", "empty": "실패한 항목이 없습니다.", "error": "작업 결과를 불러오지 못했습니다. 작업은 서버에서 계속되니 잠시 뒤 다시 시도하세요."}), layout: "stack" },
    ],
  },

  /* ------------------------------------------------ Service Pattern */
  "onboarding": {
    status: "ready", react: ["Stepper","StepButton","Steps"], uses: ["steps", "card", "form", "text-field", "radio-button", "code", "copy-field", "indicator", "button"], css: [".onboard"], borrows: [".keep-all", ".t-body-1-normal", ".t-semibold"],
    desc: "처음 온 사용자가 콘솔을 설정하는 단계형 흐름입니다. 진행 단계를 보여 주고, 한 단계에서는 한 가지만 정하게 합니다. 꼭 필요하지 않은 단계는 건너뛸 수 있습니다.",
    choose: [["언제 쓰는가", "처음 쓰는 사람이 조직 정보와 보호 수준, 에이전트 배포처럼 순서가 있는 설정을 마쳐야 콘솔을 쓸 수 있을 때 씁니다."], ["비슷한 패턴", "순서 없이 언제든 바꾸는 설정은 <a href=\"#/patterns/policy-settings\">정책 설정</a>으로, 한 화면에서 끝나는 입력은 <a href=\"#/patterns/input-form\">입력 폼</a>으로 받습니다."]],
    principles: [["단계 수", "3~6단계로 나눕니다. 한 단계에서는 한 가지만 정하고, 단계 이름은 무엇을 정하는지로 씁니다."], ["진행", "다음은 그 단계의 폼을 검사하고, 통과하면 다음 단계로 갑니다. 단계를 옮겨도 입력값은 남고, 완료한 단계는 눌러서 돌아갈 수 있습니다."], ["건너뛰기", "나중에 해도 되는 단계만 건너뛸 수 있습니다. 건너뛴 일은 마지막 단계와 대시보드에서 다시 알립니다."], ["선택 단계", "보호 수준처럼 하나를 고르는 단계는 Card Radio 로 보여 주고, 권장하는 것을 미리 골라 둡니다."], ["설치 안내", "설치 명령은 Code 로, 등록 키는 Copy Field 로 보여 줘 복사 한 번으로 쓰게 합니다. 키는 기본으로 가립니다."], ["완료", "마지막 단계는 정한 것을 요약하고, 첫 행동으로 이어지는 버튼 하나를 둡니다."]],
    examples: [
      { id: "step", title: "단계 화면", desc: "Steps 마법사로 단계마다 카드 한 장을 보여 주고, 아래에 이전과 다음 버튼을 둡니다. 다음은 그 단계의 폼을 검사하고, 마지막 단계에서는 대시보드로 이동 버튼으로 바뀝니다.", html: `
        <div class="onboard">
          <div class="stepper">
            <ol class="steps" aria-label="진행 단계"><li class="done"><button type="button" class="step-btn"><i>${I("check",16)}</i><span class="label">조직 정보</span><span class="sr-only"> (완료)</span></button></li><li class="on" aria-current="step"><i>2</i><span class="label">보호 수준</span></li><li><i>3</i><span class="label">에이전트 배포</span></li><li><i>4</i><span class="label">완료</span></li></ol>
            <div class="step-panel" tabindex="-1" hidden>
              <div class="card">
                <h3 class="title">조직 이름을 입력하세요</h3>
                <form data-validate novalidate><p class="form-legend"><em>*</em> 필수 항목</p><div class="field"><label for="ob-org">조직 이름 <em>*</em></label><input id="ob-org" value="지란지교시큐리티" required><span class="help" aria-live="polite">보고서와 알림에 표시됩니다.</span></div></form>
              </div>
            </div>
            <div class="step-panel" tabindex="-1">
              <div class="card">
                <h3 class="title">보호 수준을 선택하세요</h3>
                <p class="desc">나중에 정책의 기본 정책에서 바꿀 수 있습니다.</p>
                <div class="radio-group row" role="radiogroup" aria-label="보호 수준">
                  <label class="radio card"><input type="radio" name="ob-level" checked><span>표준<small>알려진 위협 차단. 권장</small></span></label>
                  <label class="radio card"><input type="radio" name="ob-level"><span>강화<small>의심 행위까지 차단</small></span></label>
                </div>
              </div>
            </div>
            <div class="step-panel" tabindex="-1" hidden>
              <div class="card">
                <h3 class="title">에이전트를 배포하세요</h3>
                <p class="desc">단말에서 아래 명령을 실행하면 에이전트가 설치되고 이 조직에 등록됩니다.</p>
                <div class="code-view"><div class="head"><span class="title">에이전트 설치</span>${pCopy("에이전트 설치")}</div><pre tabindex="0" aria-label="에이전트 설치"><code>curl -fsSL https://agent.example.com/install.sh -o install.sh
sudo sh install.sh --key "$JS_AGENT_KEY"</code></pre></div>
                <div class="field copy-field"><label for="ob-key">등록 키</label><div class="affix"><input id="ob-key" type="password" readonly autocomplete="off" value="jsk_demo_8c2e41f7a9b3d605"><button type="button" class="reveal" aria-label="등록 키 보기" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button>${pCopy("등록 키")}</div><span class="help">외부에 공유하지 마세요</span></div>
                <div class="card-foot"><button type="button" class="btn sm text" data-step="next">나중에 설치</button></div>
              </div>
            </div>
            <div class="step-panel" tabindex="-1" hidden>
              <div class="card center">
                <span class="indicator ok t-body-1-normal t-semibold">설정이 완료되었습니다</span>
                <p class="desc keep-all">표준 보호 · 에이전트 12대 연결 대기 중. 첫 이벤트가 들어오면 대시보드에서 확인할 수 있습니다.</p>
              </div>
            </div>
            <div class="step-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-step="prev">이전</button><button type="button" class="btn md solid primary" data-step="next">다음</button><button type="button" class="btn md solid primary" data-step="finish" hidden>대시보드로 이동</button></div></div>
          </div>
        </div>` },
    ],
  },

  "search": {
    status: "ready", react: ["Toolbar","Spacer","Stack"], uses: ["search", "combobox", "date-picker", "chip", "data-table", "tag", "indicator", "pagination", "empty-state", "button", "link"], borrows: [".menu-mark", ".field"], css: [".toolbar", ".stack"],
    desc: "검색과 필터로 결과 목록을 조회하는 화면입니다. 조건은 늘 보이게 두고, 결과 수와 적용 중인 조건을 함께 보여 줍니다.",
    choose: [["언제 쓰는가", "이벤트나 단말, 정책처럼 많은 항목에서 조건으로 좁혀 찾는 목록 화면에 씁니다."], ["비슷한 패턴", "초 단위로 쌓이는 로그를 훑는 화면은 <a href=\"#/patterns/log-viewer\">로그 뷰어</a>를 씁니다."]],
    principles: [["툴바", "검색칸 옆에 필터와 기간을 두고 되도록 한 줄에 놓습니다. 옆 컨트롤은 제 폭을 지키고 검색칸이 남는 폭을 가집니다. 자리가 모자라면 검색칸이 최소 폭까지 줄고, 그래도 넘칠 때만 줄을 바꿉니다. 한 줄에 놓인 컨트롤은 같은 높이로 맞추고, 동작 버튼은 결과 줄 오른쪽 끝에 둡니다."], ["필터", "여러 값을 고르는 필터는 Combobox 로 받습니다. 대시보드처럼 다른 화면에서 넘어온 조건은 결과 줄에 Chip 으로 보여 주고, 하나씩 지울 수 있게 합니다."], ["결과 줄", "결과 수를 툴바 아래 첫머리에 적습니다. 조건을 하나라도 바꿨으면 필터 초기화를 둡니다."], ["빈 결과", "결과가 없으면 표 대신 <a href=\"#/components/empty-state\">Empty State</a> 를 두고, 무엇을 바꾸면 되는지와 필터 초기화를 함께 보여 줍니다."], ["갱신", "글자를 칠 때마다 조회하면 입력을 잠시 기다렸다가 조회합니다. 결과 수가 바뀌면 화면 읽기 프로그램에도 알립니다."]],
    examples: [
      { id: "toolbar", title: "검색 툴바 + 결과", desc: "검색칸 옆에 심각도 필터와 기간을 한 줄로 둡니다. 검색칸이 남는 폭을 맞추고, 자리가 모자라면 검색칸이 먼저 줄어듭니다. 대시보드에서 넘어온 조건은 결과 줄의 Chip 으로 보여 줍니다.", html: `
        <div class="stack">
          <div class="toolbar">
            <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="이벤트, 단말, IP 검색" aria-label="이벤트 검색"></div>
            ${pCombo({ id: "sr-sev", label: "심각도", items: SEVS, selected: ["Critical"], multiple: true, placeholder: "심각도" })}
            ${pDate({ id: "sr-range", aria: "조회 기간", range: true, value: "2026. 10. 21 ~ 2026. 10. 27", attrs: 'data-max="today" data-presets="7 30" data-default-preset="7"' })}
          </div>
          <div class="toolbar sub">
            <span>결과 <b>128</b>건</span>
            <div class="chip-group"><span class="chip sm"><span class="lbl">대상: PC-2041</span><button type="button" class="x" aria-label="대상: PC-2041 제거">${I("x",10)}</button></span><span class="chip sm"><span class="lbl">정책: 랜섬웨어 행위 차단</span><button type="button" class="x" aria-label="정책: 랜섬웨어 행위 차단 제거">${I("x",10)}</button></span></div>
            <button type="button" class="btn sm text assistive">필터 초기화</button>
            <span class="spacer"></span>
            <button type="button" class="btn sm outline assistive">${I("download")}CSV 내보내기</button>
          </div>
          <div class="tbl-wrap">
            <table class="tbl hover nowrap">
              <thead><tr><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>심각도</th><th>이벤트</th><th>대상</th><th>상태</th></tr></thead>
              <tbody>
                <tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td><span class="indicator danger">차단</span></td></tr>
                <tr><td>09:36:47</td><td><span class="tag high">High</span></td><td><a href="#" class="link">알려진 악성코드 차단</a></td><td>PC-2041 · 김민준</td><td><span class="indicator danger">차단</span></td></tr>
                <tr><td>09:12:03</td><td><span class="tag high">High</span></td><td><a href="#" class="link">의심 스크립트 실행</a></td><td>PC-2041 · 김민준</td><td><span class="indicator warn">검토 필요</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar"><span>총 <b>128</b>건 · 1–50</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav></div>
        </div>`, layout: "stack" },
      { id: "empty", title: "빈 결과", desc: "결과가 없어도 툴바와 표 틀은 그대로 두고 표 본문에 이유와 필터 초기화를 둡니다. 조건을 바로 고칠 수 있고 화면이 흔들리지 않습니다.", html: `
        <div class="stack">
          <div class="toolbar">
            <div class="searchbar" role="search">${I("search")}<input type="search" value="랜섬웨어 2025" placeholder="이벤트, 단말, IP 검색" aria-label="이벤트 검색"></div>
            ${pCombo({ id: "sr-sev0", label: "심각도", items: SEVS, selected: ["Critical"], multiple: true, placeholder: "심각도" })}
            ${pDate({ id: "sr-range0", aria: "조회 기간", range: true, value: "2026. 10. 21 ~ 2026. 10. 27", attrs: 'data-max="today" data-presets="7 30" data-default-preset="7"' })}
          </div>
          <div class="toolbar sub"><span>결과 <b>0</b>건</span></div>
          <div class="tbl-wrap">
            <table class="tbl nowrap">
              <thead><tr><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>심각도</th><th>이벤트</th><th>대상</th><th>상태</th></tr></thead>
              <tbody><tr><td colspan="5" class="empty"><div class="empty">'랜섬웨어 2025' 에 대한 결과가 없습니다. 검색어를 줄이거나 기간을 최근 30일로 넓혀 보세요. <button type="button" class="btn sm outline assistive">필터 초기화</button></div></td></tr></tbody>
            </table>
          </div>
        </div>`, layout: "stack" },
    ],
  },

  "system-status": {
    status: "ready", react: ["StatusList","StatusItem"], uses: ["indicator", "notification", "card", "data-visual", "button"], borrows: [".progress-row", ".progress", ".keep-all"], css: [".status-list", ".status-item", ".stack", ".row-2"],
    desc: "에이전트와 서버, 연동 서비스의 상태를 한눈에 보여 줍니다. 정상인 항목은 조용하게 두고, 이상이 있는 항목은 눈에 띄게 합니다.",
    choose: [["언제 쓰는가", "수집 서버나 연동, 에이전트처럼 늘 돌아가야 하는 것들이 정상인지 한 화면에서 확인할 때 씁니다."], ["비슷한 패턴", "위협과 이벤트의 흐름은 <a href=\"#/patterns/dashboard\">대시보드</a>에서, 한 대상의 자세한 상태는 <a href=\"#/patterns/detail\">상세 화면</a>에서 봅니다."]],
    principles: [["이상 먼저", "끊김이나 실패가 있으면 맨 위에 위험 알림을 두고, 고치는 화면으로 가는 버튼을 붙입니다. 정상인 항목은 점과 짧은 수치만 둡니다."], ["상태 점", "항목마다 Indicator 점과 이름, 짧은 수치를 한 줄에 둡니다. 점의 색만으로 알리지 않고 수치나 문구를 함께 씁니다."], ["측정값", "온라인 비율이나 디스크 사용량처럼 한도가 있는 값은 진행 막대 목록으로 보여 줍니다. 값과 한도를 숫자로 함께 적습니다."], ["갱신", "상태는 자동으로 갱신하고 마지막 갱신 시각을 적습니다. 화면을 가만히 둔 사람을 방해하지 않게 상태가 바뀔 때만 알립니다."]],
    examples: [
      { id: "overview", title: "서비스 상태 보드", desc: "이상이 있는 연동을 맨 위 위험 알림으로 올리고, 나머지는 상태 원과 수치로 조용히 보여 줍니다.", html: `
        <div class="stack">
          <div class="notice danger" role="alert"><span class="ico">${I("alert-circle",20,{style:"filled"})}</span><div><b>SIEM 연동 연결 끊김</b>09:12 부터 이벤트 전송이 실패하고 있습니다. 인증 토큰을 확인하세요.<div class="actions"><div class="btn-group"><button type="button" class="btn sm solid primary">연동 설정</button><button type="button" class="btn sm text">다시 시도</button></div></div></div></div>
          <div class="status-list">
            <div class="status-item"><span class="indicator ok">수집 서버</span><span class="meta">가동 99.98%</span></div>
            <div class="status-item"><span class="indicator ok">정책 배포</span><span class="meta">rev 2041</span></div>
            <div class="status-item"><span class="indicator warn">업데이트 서버</span><span class="meta">지연 3분</span></div>
            <div class="status-item"><span class="indicator danger">SIEM 연동</span><span class="meta">09:12 끊김</span></div>
            <div class="status-item"><span class="indicator info">DB 점검</span><span class="meta">02:00~04:00</span></div>
            <div class="status-item"><span class="indicator ok">라이선스</span><span class="meta">842 / 1,000</span></div>
          </div>
        </div>`, layout: "stack" },
      { id: "agents", title: "에이전트와 서버 자원", desc: "한도가 있는 측정값은 진행 막대 목록으로 보여 줍니다. 값과 한도를 숫자로 함께 적습니다.", html: `
        <div class="row-2">
          <div class="card"><div class="card-head"><h3 class="title">에이전트 연결</h3><span class="indicator ok">정상</span></div><div class="progress-list">${pMeter("ss-online", "온라인", 1247, 1284, "대")}${pMeter("ss-latest", "최신 버전", 1102, 1284, "대")}</div><p class="desc keep-all">오프라인 37대 · 10분 이상 미체크인 12대</p></div>
          <div class="card"><div class="card-head"><h3 class="title">수집 서버 자원</h3><span class="indicator warn">주의</span></div><div class="progress-list">${pMeter("ss-cpu", "CPU", 42, 100, "%")}${pMeter("ss-disk", "디스크", 812, 1000, "GB")}${pMeter("ss-mem", "메모리", 21, 64, "GB")}</div><p class="desc keep-all">디스크가 80%를 넘었습니다. 보관 기간을 줄이거나 저장소를 늘리세요.</p></div>
        </div>`, layout: "stack" },
    ],
  },

  "sign-in": {
    status: "new", react: ["Form","TextField","Popup"], uses: ["form", "text-field", "checkbox", "notification", "popup", "button", "link"], borrows: [".t-title-3", ".sr-only"], css: [".auth", ".auth-logo", ".auth-timer", ".auth-screen", ".auth-copy"],
    desc: "관리 콘솔에 들어오는 로그인과 2단계 인증, 오래 쓰지 않은 세션의 만료 안내입니다. 실패 이유와 남은 횟수를 알리고, 입력한 값은 지우지 않습니다.",
    choose: [["언제 쓰는가", "관리 콘솔에 로그인하거나, 2단계 인증 코드를 받거나, 세션이 곧 끝난다고 알릴 때 씁니다."], ["비슷한 패턴", "로그인 뒤 처음 하는 설정은 <a href=\"#/patterns/onboarding\">온보딩</a>으로, 권한이 없는 화면은 <a href=\"#/patterns/error-pages\">오류 화면</a>으로 보여 줍니다."]],
    principles: [["실패 안내", "이메일과 비밀번호 중 무엇이 틀렸는지는 알리지 않고, 둘 중 하나가 맞지 않는다고 적습니다. 잠금까지 남은 횟수와 잠기는 시간을 함께 씁니다."], ["입력 유지", "실패해도 이메일은 남기고 비밀번호만 비웁니다. 포커스는 비밀번호 칸으로 옮깁니다."], ["자동 완성", "이메일과 비밀번호, 일회용 코드 칸에 맞는 자동 완성 속성을 줘 비밀번호 관리자와 문자 코드 채우기가 동작하게 합니다."], ["비밀번호 보기", "비밀번호 칸에는 보기 버튼을 둡니다. 붙여넣기를 막지 않습니다."], ["칸", "이메일과 비밀번호 두 칸은 라벨을 숨기고 placeholder 와 칸 안 아이콘으로 보입니다. 숨긴 라벨은 화면 읽기 프로그램이 읽습니다. 칸이 더 많은 폼은 보이는 라벨을 씁니다."], ["화면", "바탕색 위에 테두리 없이 그림자로 띄운 카드를 가운데 둡니다. 카드 위쪽 가운데에는 제품 로고를 두고, 화면 제목은 숨겨서 화면 읽기 프로그램이 읽게 남깁니다. 화면 아래에는 저작권 줄을 고정합니다."], ["2단계 인증", "숫자 6자리를 Text Field 의 인증 코드 칸 여섯에 한 자리씩 받습니다. 붙여넣기와 자동 채우기는 칸을 나눠도 한 번에 채워집니다. 다 채워도 저절로 제출하지 않고 확인 버튼을 누르게 합니다."], ["세션 만료", "끝나기 2분 전에 대화상자로 알리고 남은 시간을 보여 줍니다. 시간 세기와 연장은 제품 서버가 맡고, 시간이 다 되면 로그인 화면으로 보낸 뒤 원래 화면으로 돌아오게 합니다."]],
    examples: [
      { id: "sign-in", title: "로그인", desc: "실패하면 폼 위에 이유와 남은 횟수를 적고, 이메일은 남긴 채 비밀번호 칸으로 포커스를 옮깁니다.", html: `
        <div class="auth-screen">
        <form class="form auth" data-validate novalidate>
          <p class="auth-logo" role="img" aria-label="Security Console"><i>${I("shield-check",48,{style:"filled"})}</i><span aria-hidden="true">Security Console</span></p>
          <h2 class="sr-only">관리 콘솔 로그인</h2>
          <div class="notice danger" role="alert"><span class="ico">${I("alert-circle",20,{style:"filled"})}</span><div><b>이메일 또는 비밀번호가 맞지 않습니다</b>5번 틀리면 10분 동안 로그인할 수 없습니다. 남은 횟수는 3번입니다. 비밀번호가 기억나지 않으면 비밀번호 찾기를 누르세요.</div></div>
          <div class="field"><label for="si-email" class="sr-only">이메일</label><div class="affix"><span class="field-icon" aria-hidden="true">${I("user",18)}</span><input id="si-email" type="email" value="admin@jiran.com" placeholder="이메일" autocomplete="username" required data-messages='{"required":"이메일을 입력하세요."}'></div><span class="help" aria-live="polite"></span></div>
          <div class="field"><label for="si-pw" class="sr-only">비밀번호</label><div class="affix"><span class="field-icon" aria-hidden="true">${I("lock",18)}</span><input id="si-pw" type="password" placeholder="비밀번호" autocomplete="current-password" required data-messages='{"required":"비밀번호를 입력하세요."}'><button type="button" class="reveal" aria-label="비밀번호 표시" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button></div><span class="help" aria-live="polite"></span></div>
          <div class="auth-row"><label class="checkbox"><input type="checkbox" checked><span>이메일 저장</span></label><a href="#" class="link standalone">비밀번호 찾기</a></div>
          <button type="submit" class="btn lg solid primary">로그인</button>
        </form>
        <p class="auth-copy">© 2026 JIRANSECURITY Co., Ltd. All rights reserved.</p>
        </div>`, layout: "stack" },
      { id: "two-step", title: "2단계 인증", desc: "숫자 6자리를 큰 칸 여섯에 한 자리씩 받습니다. 치면 다음 칸으로 가고, 붙여넣기와 문자로 받은 코드 자동 채우기는 모든 칸을 한 번에 채웁니다.", html: `
        <div class="auth-screen">
        <form class="form auth" data-validate novalidate>
          <p class="auth-logo" role="img" aria-label="Security Console"><i>${I("shield-check",48,{style:"filled"})}</i><span aria-hidden="true">Security Console</span></p>
          <div><h2 class="auth-title t-title-3">2단계 인증</h2><p class="auth-desc">인증 앱에 표시된 6자리 숫자를 입력하세요.</p><p class="auth-account"><b>admin@jiran.com</b><a href="#" class="link standalone">다른 계정으로 로그인</a></p></div>
          ${pCode({ id: "si-otp", label: "인증 코드", name: "otp", req: true, help: "코드는 30초마다 바뀝니다.", messages: { required: "인증 코드를 입력하세요.", code: "숫자 6자리를 모두 입력하세요." } })}
          <label class="checkbox"><input type="checkbox"><span>이 기기에서 30일 동안 묻지 않기</span></label>
          <button type="submit" class="btn lg solid primary">인증하고 로그인</button>
          <a href="#" class="link standalone">다른 방법으로 인증</a>
        </form>
        <p class="auth-copy">© 2026 JIRANSECURITY Co., Ltd. All rights reserved.</p>
        </div>`, layout: "stack" },
      { id: "session", title: "세션 만료 안내", desc: "끝나기 2분 전에 대화상자로 알리고 남은 시간을 보여 줍니다. 연장하면 서버가 세션을 늘리고, 시간이 다 되면 로그인 화면으로 보냅니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="ss-t" aria-describedby="ss-b">
          <h3 class="popup-title" id="ss-t">로그인을 연장할까요?</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-body" id="ss-b"><p>오래 쓰지 않아 곧 자동으로 로그아웃됩니다. 입력하던 내용은 다시 로그인하면 되살립니다.</p><p class="auth-timer" role="timer">남은 시간 <b>01:58</b></p></div>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive">로그아웃</button><button type="button" class="btn md solid primary" data-popup-close>연장</button></div></div>
        </div>` },
    ],
  },

  /* ------------------------------------------------ Security Console */
  "report-schedule": {
    status: "new", react: ["Form", "TextField", "Select", "Combobox", "TimePicker", "Table", "DataTable", "Card"], uses: ["page-header", "pagination", "form", "text-field", "select", "radio-button", "combobox", "time-picker", "notification", "button", "table", "link", "avatar", "indicator", "switch", "data-table", "card", "loading", "empty-state"], borrows: [".menu-mark", ".sr-only", ".t-label-1-normal", ".t-semibold", ".chip"], css: [".stack", ".toolbar"],
    desc: "보고서의 내용과 받는 사람, 보내는 때를 정해 정기적으로 보내는 화면입니다. 저장하기 전에 다음 발송이 언제 누구에게 가는지 한 문장으로 보여 줍니다.",
    choose: [["언제 쓰는가", "주간 보안 요약처럼 같은 보고서를 정해진 때마다 여러 사람에게 보내야 할 때 씁니다."], ["비슷한 패턴", "한 번만 파일로 받는 것은 <a href=\"#/patterns/import-export\">가져오기 · 내보내기</a>를, 이벤트가 생길 때 바로 알리는 것은 <a href=\"#/patterns/alert-rules\">알림 규칙</a>을 씁니다."]],
    principles: [["기간", "정기 보고서의 기간은 날짜가 아니라 '지난 7일' 처럼 보내는 때를 기준으로 고릅니다."], ["받는 사람", "사람과 부서를 Combobox 로 함께 받습니다. 부서를 고르면 그 부서에 새로 온 사람도 받습니다."], ["보내는 때", "반복 주기와 시각을 한 줄에 둡니다. 시각은 콘솔에 정한 시간대를 따르고, 그 시간대를 도움말에 적습니다."], ["요약 문장", "저장 버튼 위에 다음 발송이 언제 누구에게 어떤 형식으로 가는지 한 문장으로 보여 줍니다. 값을 바꾸면 바로 고칩니다."], ["미리보기와 지금 보내기", "미리보기는 지금 데이터로 보고서를 만들어 보여 주기만 합니다. 지금 보내기는 예약과 별개로 한 번 보냅니다."], ["목록", "예약 목록에는 주기와 다음 발송, 마지막 발송 결과를 둡니다. 잠시 멈출 때는 지우지 않고 사용을 끕니다."], ["실패", "발송에 실패하면 목록에 실패를 표시하고 만든 사람에게 알립니다. 다음 주기에는 다시 보냅니다."]],
    examples: [
      { id: "create", title: "보고서 예약", desc: "내용과 기간, 형식, 받는 사람, 보내는 때를 정합니다. 저장 버튼 위에 다음 발송을 한 문장으로 보여 줍니다.", html: `
        <form class="form" data-validate novalidate>
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label for="rp-name">보고서 이름 <em>*</em></label><input id="rp-name" value="주간 보안 요약" required><span class="help" aria-live="polite"></span></div>
          <div class="form-row">
            ${pSel({ id: "rp-kind", label: "내용", opts: [["summary", "보안 요약"], ["threat", "위협 상세"], ["agent", "에이전트 상태"]], value: "summary", help: "", live: true })}
            ${pSel({ id: "rp-range", label: "기간", opts: [["7", "지난 7일"], ["30", "지난 30일"], ["month", "지난달"]], value: "7", help: "", live: true })}
          </div>
          <div class="field"><fieldset class="radio-group row"><legend class="t-label-1-normal t-semibold">형식</legend><label class="radio"><input type="radio" name="rp-fmt" checked><span>PDF</span></label><label class="radio"><input type="radio" name="rp-fmt"><span>CSV</span></label></fieldset><span class="help" aria-live="polite"></span></div>
          ${pCombo({ id: "rp-to", label: "받는 사람", items: ["보안팀", "운영팀", "김민준", "이서연", "박지훈"], selected: ["보안팀", "김민준"], multiple: true, field: true, req: true, placeholder: "사람 또는 부서 검색", help: "", live: true })}
          <div class="form-row">
            ${pSel({ id: "rp-repeat", label: "반복", opts: [["day", "매일"], ["mon", "매주 월요일"], ["first", "매월 1일"]], value: "mon", help: "", live: true })}
            ${pTime({ id: "rp-time", label: "시각", value: "09:00", help: "서울 시간 기준", live: true })}
          </div>
          ${pNotice("", "다음 발송: 11월 16일 월요일 09:00", "보안팀 외 1명에게 지난 7일의 보안 요약을 PDF 로 보냅니다.")}
          <div class="form-actions"><div class="btn-group"><button type="button" class="btn md outline assistive">미리보기</button><button type="button" class="btn md outline primary">지금 보내기</button><button type="submit" class="btn md solid primary">예약 저장</button></div></div>
        </form>` },
      { id: "list", title: "예약 목록", desc: "주기와 다음 발송, 받는 사람, 마지막 발송 결과를 보여 줍니다. 잠시 멈출 때는 사용을 끕니다.", html: `
        <div class="stack">
          <div class="page-head"><div><h2 class="title">예약 보고서</h2></div><div class="actions"><button type="button" class="btn md solid primary">${I("plus")}보고서 만들기</button></div></div>
          <div class="tbl-wrap"><table class="tbl nowrap"><thead><tr><th>보고서</th><th>주기</th><th class="sortable sorted" aria-sort="ascending"><button type="button" class="sort">다음 발송</button></th><th>받는 사람</th><th>마지막 발송</th><th>사용</th></tr></thead><tbody>
            <tr><td><a href="#" class="link">주간 보안 요약</a></td><td>매주 월요일 09:00</td><td>11. 16 09:00</td><td>${pAvatars("주간 보안 요약 받는 사람", ["김민준", "이서연"], 3, true)}</td><td><span class="indicator ok">보냄</span></td><td><label class="switch"><input type="checkbox" role="switch" checked aria-label="주간 보안 요약 사용"></label></td></tr>
            <tr><td><a href="#" class="link">에이전트 상태</a></td><td>매월 1일 08:00</td><td>12. 01 08:00</td><td>${pAvatars("에이전트 상태 받는 사람", ["박지훈"], 0, true)}</td><td><span class="indicator danger">실패</span></td><td><label class="switch"><input type="checkbox" role="switch" checked aria-label="에이전트 상태 사용"></label></td></tr>
            <tr><td><a href="#" class="link">위협 상세</a></td><td>매일 02:00</td><td>—<span class="sr-only">없음</span></td><td>${pAvatars("위협 상세 받는 사람", ["최유진", "정다은"], 0, true)}</td><td><span class="indicator ok">보냄</span></td><td><label class="switch"><input type="checkbox" role="switch" aria-label="위협 상세 사용"></label></td></tr>
          </tbody></table></div>
          <div class="pagination-bar"><span>총 <b>56</b>건 · 1–20</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav></div>
        </div>`, layout: "stack" },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "예약 목록을 불러오는 동안과 예약한 보고서가 없을 때, 불러오지 못했을 때의 화면입니다. 첫 사용에는 예약하는 동작을 둡니다.", html: pStates({"cols": ["보고서", "주기", "다음 발송"], "loading": "예약 보고서 불러오는 중", "emptyTitle": "첫 사용", "empty": "아직 예약한 보고서가 없습니다.", "error": "예약 목록을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.", "emptyBtn": ["보고서 예약", true]}), layout: "stack" },
    ],
  },

  "dashboard": {
    status: "ready", react: ["PageHead","Stack","Row3","Row2"], uses: ["button", "card", "data-visual", "indicator", "link", "page-header", "select-button", "table", "tooltip"], css: [".stack", ".row-2", ".row-3"], borrows: [".sr-only", ".progress-row", ".progress"],
    desc: "보안 관리자가 처음 보는 화면입니다. 위에 KPI 4개를 두고, 그 아래에 일별 탐지 · 분포 차트, 비교 · 목표 대비 차트, 최근 이벤트 표를 차례로 둡니다. 위험이 한눈에 들어오고 상세로 바로 내려갈 수 있어야 합니다.",
    choose: [["언제 쓰는가", "로그인한 관리자가 지금 위험이 얼마나 있는지 훑고, 손볼 곳으로 바로 내려가야 하는 첫 화면에 씁니다."], ["비슷한 패턴", "심각도 같은 조건으로 좁혀 들여다보는 화면은 <a href=\"#/patterns/analytics\">분석 · 리포트</a>입니다. 연동과 서버가 살아 있는지는 <a href=\"#/patterns/system-status\">시스템 상태</a>에서, 로그 한 건 한 건은 <a href=\"#/patterns/log-viewer\">로그 뷰어</a>에서 봅니다."]],
    principles: [["위계", "KPI 로 무슨 일이 있는지, 차트로 어디서 얼마나 일어났는지, 표로 무엇을 할지를 차례로 보여 줍니다. KPI 카드는 숫자와 증감만 두고 스파크라인은 넣지 않습니다. 흐름은 아래 차트가 보여 줍니다."], ["기간", "머리 오른쪽에 기간을 고르는 Select Button 하나를 둡니다. 24시간 · 7일 · 30일 가운데 하나를 고르면 KPI 와 차트, 표가 모두 그 기간으로 바뀝니다. 다른 조건으로 좁혀 보려면 <a href=\"#/patterns/analytics\">분석 · 리포트</a> 화면으로 갑니다. KPI 는 한 화면에 다섯 개를 넘기지 않습니다."], ["밀도", "카드 사이 간격은 16px, 카드 안 여백은 24px 입니다. KPI 카드만 좌우 여백이 20px 입니다. 스크롤하지 않아도 첫 화면에 KPI 와 차트가 들어오게 합니다."], ["한 세트", "차트는 한 톤으로 그리고, 심각도처럼 등급이 있을 때만 등급 색을 씁니다. 같은 줄 카드는 머리와 본문 높이를 맞춥니다."], ["내려가기", "표의 이벤트 이름은 그 이벤트의 상세로 가는 링크입니다. 카드의 전체 보기는 같은 조건이 걸린 목록 화면으로 갑니다."], ["증감", "증감 배지의 색은 방향이 아니라 좋고 나쁨을 따릅니다. 비교 기준을 배지 옆에 함께 적습니다."]],
    examples: [
      { id: "full", title: "대시보드", html: `
        <div class="stack">
          <div class="page-head"><div><h2 class="title">대시보드</h2><p class="sub">최근 갱신 09:41 · 자동 갱신 1분</p></div><div class="actions"><div class="btn-group"><div class="select-btn" role="radiogroup" aria-label="기간"><button type="button" class="on" role="radio" aria-checked="true">24시간</button><button type="button" role="radio" aria-checked="false">7일</button><button type="button" role="radio" aria-checked="false">30일</button></div><span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip left" role="tooltip">새로 고침</span></span></div></div></div>
          <div class="kpi-grid">
            <div class="kpi critical"><span class="label">Critical 이벤트</span><span class="value">1,284</span><div class="kpi-foot">${pDelta("up", "bad", "12%")}<span class="delta-note">전일 대비</span></div></div>
            <div class="kpi"><span class="label">차단률</span><span class="value">99.2<small>%</small></span><div class="kpi-foot">${pDelta("up", "good", "0.3%p")}<span class="delta-note">전일 대비</span></div></div>
            <div class="kpi"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><div class="kpi-foot"><span class="delta-note">37대 오프라인</span></div></div>
            <div class="kpi"><span class="label">신규 위협</span><span class="value">112</span><div class="kpi-foot">${pDelta("up", "bad", "20%")}<span class="delta-note">전일 대비</span></div></div>
          </div>
          <div class="row-3">
            <div class="chart-card">${pChartHead("일별 탐지", "최근 14일")}<div class="chart-view"><div class="chart-canvas"><canvas data-chart="timeseries" data-spec='${JSON.stringify(DAILY14)}' role="img" aria-label="일별 탐지 — 최근 14일 합계 1,429건, 지난 14일보다 8% 증가"></canvas></div></div></div>
            <div class="chart-card">${pChartHead("심각도 분포")}<div class="chart-view"><div class="chart-canvas"><canvas data-chart="donut" data-spec='${JSON.stringify(DASH.severity)}' role="img" aria-label="심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054"></canvas></div></div></div>
          </div>
          <div class="row-2">
            <div class="chart-card">${pChartHead("유형별 탐지", "주간 비교")}<div class="chart-view"><div class="chart-canvas"><canvas data-chart="bar" data-spec='${JSON.stringify(DASH.weeks)}' role="img" aria-label="유형별 탐지 — 이번 주와 지난 주 비교, 랜섬웨어 412건이 가장 많음"></canvas></div></div></div>
            <div class="chart-card">${pChartHead("부서별 패치 적용", "에이전트 기준")}<div class="progress-list">${pMeter("dash-pl-dev", "개발팀", 412, 450, "대")}${pMeter("dash-pl-sales", "영업팀", 236, 298, "대")}${pMeter("dash-pl-ops", "운영팀", 128, 196, "대")}${pMeter("dash-pl-fin", "재무팀", 66, 140, "대")}</div></div>
          </div>
          <div class="card flush">
            <div class="card-head"><h3 class="title">최근 Critical 이벤트</h3><a href="#" class="btn sm text assistive">전체 보기${I("chevron-right",16)}</a></div>
            <div class="tbl-wrap"><table class="tbl nowrap"><thead><tr><th>시간</th><th>이벤트</th><th>대상</th><th>상태</th></tr></thead><tbody>
              <tr><td>09:41:12</td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>09:36:47</td><td><a href="#" class="link">알려진 악성코드 차단</a></td><td>PC-0932 · 박지훈</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>08:58:20</td><td><a href="#" class="link">C2 통신 시도</a></td><td>PC-0411 · 최유진</td><td><span class="indicator warn">검토 필요</span></td></tr>
            </tbody></table></div>
          </div>
        </div>`, layout: "stack" },
    ],
  },

  "analytics": {
    status: "new", react: ["PageHead","Stack","Toolbar","Row2"], uses: ["page-header", "button", "date-picker", "combobox", "chip", "data-visual", "card", "table", "empty-state"], css: [".stack", ".row-2", ".toolbar"], borrows: [".menu-mark", ".field", ".menu", ".menu-item", ".sr-only"],
    desc: "기간과 조건을 바꿔 가며 탐지를 들여다보는 화면입니다. 맨 위 필터 한 줄이 아래 KPI 와 차트, 표 전체에 같이 걸려서 숫자가 서로 맞습니다. 대시보드가 기간 하나로 전체를 훑는 화면이라면, 이 화면은 원인을 찾고 보고서로 내보내는 화면입니다.",
    choose: [["언제 쓰는가", "지난 기간과 견주거나 특정 심각도만 골라 추이를 보고, 그 결과를 내보내야 할 때 씁니다."], ["비슷한 패턴", "기간만 골라 전체를 훑는 첫 화면은 <a href=\"#/patterns/dashboard\">대시보드</a>입니다. 로그 한 건 한 건을 찾는 일은 <a href=\"#/patterns/log-viewer\">로그 뷰어</a>가 맡습니다."]],
    principles: [["필터 한 줄", "필터는 모든 카드 위에 한 줄로 두고 카드 안에는 두지 않습니다. 카드마다 다른 기간을 두면 숫자가 서로 맞지 않습니다."], ["기간이 먼저", "기간을 필터 줄 맨 앞에 둡니다. 최근 7일 · 30일 · 90일 프리셋을 먼저 보이고, 직접 고르는 기간은 달력으로 엽니다."], ["같은 조각", "조건을 바꾸면 KPI 와 모든 차트, 표가 같은 기간과 조건으로 다시 그려집니다. 합계가 어디서나 같아야 합니다."], ["순서", "KPI, 주 차트, 보조 차트 둘, 상세 표 순서로 위에서 아래로 갑니다. 주 차트는 넓게 한 줄을 다 씁니다."], ["다시 불러오기", "조건을 바꾼 뒤 새 결과가 올 때까지 지난 차트를 흐리게 둡니다. Skeleton 으로 바꾸지 않아 화면이 흔들리지 않습니다."], ["빈 결과", "조건에 맞는 탐지가 없으면 무엇이 걸렸는지 칩으로 보이고, 필터를 지우는 버튼을 둡니다."], ["내보내기", "지금 걸린 조건 그대로 내보냅니다. 내보내기는 이 화면의 머리 오른쪽에 하나만 둡니다."]],
    examples: [
      { id: "default", title: "분석 · 리포트", desc: "필터 줄, KPI 넷, 심각도별 일별 탐지 추이, 유형별 탐지와 탐지 경로, 유형별 상세 표입니다. 추이와 유형, 경로, 표의 합계가 모두 같습니다.", html: `
        <div class="stack">
          <div class="page-head"><div><h2 class="title">탐지 분석</h2><p class="sub">조건을 바꾸면 아래 숫자와 차트가 모두 같은 조건으로 다시 그려집니다.</p></div><div class="actions"><button type="button" class="btn md outline assistive">${I("download")}CSV 내보내기</button></div></div>
          ${pFilters("an")}
          ${pAnKpis()}
          ${pAnTrend(false)}
          <div class="row-2">
            <div class="chart-card">${pChartHead("유형별 탐지", "최근 7일")}<div class="chart-view"><div class="chart-canvas"><canvas data-chart="bar" data-spec='${JSON.stringify(ANALYTICS.types)}' role="img" aria-label="유형별 탐지 — 랜섬웨어 472, 악성코드 351, USB 위반 253, 정책 위반 132, 피싱 101"></canvas></div></div></div>
            <div class="chart-card">${pChartHead("탐지 경로")}<div class="chart-view"><div class="chart-canvas"><canvas data-chart="donut" data-spec='${JSON.stringify(ANALYTICS.channels)}' role="img" aria-label="탐지 경로 — 엔드포인트 734, 메일 307, 네트워크 186, USB 82, 합계 1,309"></canvas></div></div></div>
          </div>
          <div class="card flush">
            <div class="card-head"><h3 class="title">유형별 상세</h3></div>
            <div class="tbl-wrap"><table class="tbl nowrap"><thead><tr><th>유형</th><th class="num">탐지</th><th class="num">Critical</th><th class="num">차단률</th><th>지난 7일 대비</th></tr></thead><tbody>
              ${ANALYTICS.rows.map(([t, n, c, r, d]) => `<tr><td>${t}</td><td class="num">${n.toLocaleString("en-US")}</td><td class="num">${c}</td><td class="num">${r}</td><td>${pDelta(d[0], d[1], d[2])}</td></tr>`).join("")}
            </tbody></table></div>
          </div>
        </div>`, layout: "stack" },
      { id: "loading", title: "다시 불러오는 중", desc: "조건을 바꾼 직후입니다. 새 결과가 올 때까지 지난 차트를 흐리게 두고, 다시 불러오는 중이라는 것을 스크린 리더에도 알립니다. 카드 크기가 그대로라 화면이 흔들리지 않습니다.", html: `
        <div class="stack">
          ${pFilters("an-ld", ["Critical"])}
          ${pAnTrend(true)}
        </div>`, layout: "stack" },
      { id: "empty", title: "빈 결과", desc: "조건에 맞는 탐지가 없을 때입니다. 걸린 조건을 칩으로 보이고 하나씩 지우거나 한 번에 초기화할 수 있게 둡니다.", html: `
        <div class="stack">
          ${pFilters("an-em", ["Critical"])}
          <div class="toolbar sub"><span>적용된 조건</span><div class="chip-group"><span class="chip sm"><span class="lbl">단말: PC-2041</span><button type="button" class="x" aria-label="단말: PC-2041 제거">${I("x",10)}</button></span><span class="chip sm"><span class="lbl">정책: USB 차단</span><button type="button" class="x" aria-label="정책: USB 차단 제거">${I("x",10)}</button></span></div><button type="button" class="btn sm text assistive">필터 초기화</button></div>
          <div class="chart-card lg">${pChartHead("일별 탐지 추이", "심각도별")}<div class="chart-state"><div class="empty"><span class="ico">${I("chart-bar",24)}</span><b>조건에 맞는 탐지가 없습니다</b><span>기간을 넓히거나 조건을 줄여 보세요.</span></div></div></div>
        </div>`, layout: "stack" },
    ],
  },

  "log-viewer": {
    status: "ready", react: ["Toolbar","Stack"], uses: ["search", "date-picker", "chip", "select-button", "notification", "data-table", "tag", "code", "pagination", "button"], borrows: [".sr-only", ".field"], css: [".toolbar", ".stack", ".log-row", ".log-table"],
    desc: "대량의 로그를 빠르게 훑고 거르는 화면입니다. 촘촘한 표에 로그 한 건을 한 줄로 보여 주고, 행을 펼쳐 상세와 원본 로그를 봅니다. 실시간과 일시정지를 오갈 수 있습니다.",
    choose: [["언제 쓰는가", "초 단위로 쌓이는 탐지 · 감사 로그를 시간 순서로 훑고, 조건으로 걸러 한 건의 원본까지 확인할 때 씁니다."], ["비슷한 패턴", "로그가 아니라 이벤트나 단말을 찾는 목록은 <a href=\"#/patterns/search\">검색 · 필터</a>를 씁니다."]],
    principles: [["밀도", "행 높이 40px 의 촘촘한 표를 쓰고, 로그 한 건은 한 줄로 보여 줍니다. 시간과 IP 는 숫자 폭을 맞춘 본문 글자로 씁니다. 고정폭 글자는 원본 로그에만 씁니다."], ["필터", "심각도 Chip 을 여러 개 골라 거르고, 검색으로 좁힙니다. 조회 구간은 시각까지 입력하고, 달력이나 프리셋으로 고른 날짜는 첫날 00:00 부터 마지막 날 23:59 까지입니다."], ["상세", "행 맨 앞의 셰브론으로 그 행 아래에 상세를 펼칩니다. 탐지 정책과 단말, 프로세스를 키-값으로 보여 주고 원본 로그를 복사할 수 있게 둡니다. 여러 행을 함께 펼칠 수 있습니다."], ["실시간", "실시간이면 새 로그를 위에 쌓습니다. 읽는 중에 표가 밀리지 않게, 스크롤을 내렸거나 행을 펼쳤으면 쌓지 않고 표 위에 새 로그 건수를 알립니다. 누르면 맨 위로 가서 쌓습니다."], ["일시정지", "일시정지하면 새 로그를 받지 않습니다. 다시 실시간으로 바꾸면 쌓인 건수를 먼저 알립니다."], ["내보내기", "지금 걸린 조건 그대로 CSV 로 내보냅니다. 큰 내보내기는 <a href=\"#/patterns/import-export\">가져오기 · 내보내기</a>의 예약으로 보냅니다."]],
    examples: [
      { id: "viewer", title: "로그 뷰어", html: `
        <div class="stack">
          <div class="toolbar">
            <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="메시지, 단말, IP 검색" aria-label="로그 검색"></div>
            ${pDate({ id: "lv-range", aria: "조회 구간", range: true, time: true, value: "2026. 10. 21 00:00 ~ 2026. 10. 27 23:59", attrs: 'data-max="today" data-presets="7 30" data-default-preset="7"' })}
          </div>
          <div class="toolbar">
            <div class="chip-group"><button type="button" class="chip on" aria-pressed="true">CRIT</button><button type="button" class="chip on" aria-pressed="true">HIGH</button><button type="button" class="chip on" aria-pressed="true">WARN</button><button type="button" class="chip" aria-pressed="false">LOW</button><button type="button" class="chip" aria-pressed="false">INFO</button><button type="button" class="btn sm text assistive" data-chip-reset>필터 초기화</button></div>
            <span class="spacer"></span>
            <div class="select-btn outline sm" role="radiogroup" aria-label="갱신"><button type="button" role="radio" aria-checked="false">실시간</button><button type="button" class="on" role="radio" aria-checked="true">일시정지</button></div>
            <button type="button" class="btn sm outline assistive">${I("download")}CSV 내보내기</button>
          </div>
          ${pNotice("info", "새 로그 24건", "일시정지한 동안 들어왔습니다.", `<div class="actions"><button type="button" class="btn sm outline assistive">맨 위로 이동해 보기</button></div>`)}
          ${logTable(LOG_ROWS)}
          <div class="pagination-bar"><span>총 <b>48,213</b>건 · 최신 100건 표시</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><span class="gap">…</span><button type="button">483</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav></div>
        </div>`, layout: "stack" },
      { id: "disconnected", title: "실시간 연결 끊김", desc: "실시간 갱신이 끊기면 표 위에 경고 Banner 를 띄우고, 마지막으로 받은 시각과 다시 연결하는 동작을 둡니다. 받아 둔 로그는 그대로 보여 줍니다.", html: `
        <div class="banner warning" role="alert">${I("alert-triangle",18,{style:"filled"})}실시간 연결이 끊겼습니다. 09:41 까지 받은 로그를 보여 주고 있습니다.<button type="button" class="btn sm outline assistive">다시 연결</button></div>`, layout: "stack" },
    ],
  },

  "policy-settings": {
    status: "ready", react: ["SettingsSection","Setting","PageHead","Breadcrumb"], uses: ["page-header", "breadcrumb", "notification", "switch", "slider", "select", "number-input", "time-picker", "combobox", "copy-field", "tag", "side-panel", "tree", "button"], borrows: [".menu-mark", ".chip", ".sr-only", ".field", ".tooltip-wrap", ".tooltip"], css: [".settings-section", ".setting", ".stack"],
    desc: "정책과 시스템을 설정하는 화면입니다. 섹션마다 카드를 두고, 왼쪽에 라벨과 설명, 오른쪽에 컨트롤이 있는 행을 쌓습니다. 바로 적용되는 Switch 와 배포해야 적용되는 입력을 구분합니다.",
    choose: [["언제 쓰는가", "정책 하나의 동작이나 시스템 설정처럼, 언제든 돌아와 값을 바꾸는 설정 화면에 씁니다."], ["비슷한 패턴", "처음 한 번 순서대로 정하는 설정은 <a href=\"#/patterns/onboarding\">온보딩</a>으로, 새 항목을 만드는 입력은 <a href=\"#/patterns/input-form\">입력 폼</a>으로 받습니다."]],
    principles: [["행 구성", "왼쪽에 이름과 한 줄 설명, 오른쪽에 컨트롤 하나를 둡니다. 설명에는 바꾸면 무엇이 달라지는지를 씁니다."], ["바로 적용과 배포", "Switch 는 누르면 바로 서버에 반영합니다. 그 섹션 머리에 바로 적용된다고 적습니다. 나머지 입력은 모아 두었다가 배포를 눌러야 에이전트에 갑니다."], ["배포 전 변경", "배포하지 않은 변경이 있으면 맨 위 경고 알림에 건수를 적습니다. 화면을 떠나려 하면 버릴지 묻습니다."], ["컨트롤 고르기", "켜고 끄기는 Switch, 정도는 Slider, 정확한 수는 Number Input, 시각은 Time Picker, 여럿 고르기는 Combobox 로 받습니다."], ["적용 대상", "부서처럼 계층이 있는 대상은 지금 고른 것을 Tag 로 보여 주고, 바꿀 때는 Side Panel 의 체크박스 Tree 에서 고릅니다."], ["연결 정보", "에이전트 등록 키처럼 복사해 쓰는 값은 Copy Field 로 보여 줍니다."]],
    examples: [
      { id: "sections", title: "설정 섹션", html: `
        <div class="stack">
          <div class="page-head">
            ${pBreadcrumb(["정책", "USB 제어", "외부 USB 차단"])}
            <div><h2 class="title">외부 USB 차단</h2><p class="sub">POL-2041 · 전체 그룹 · 마지막 배포 2026. 09. 06</p></div><div class="actions"><div class="btn-group"><button type="button" class="btn md outline primary">복제</button><button type="button" class="btn md solid primary">배포</button></div></div>
          </div>
          ${pNotice("warning", "배포되지 않은 변경 2건", "변경 사항은 배포를 눌러야 에이전트에 적용됩니다.")}
          <div class="settings-section">
            <div class="section-head">실시간 보호<small>바꾸면 바로 적용됩니다</small></div>
            <div class="setting"><div class="info"><b>실시간 보호</b><span>파일을 실행할 때 바로 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="실시간 보호"></label></div></div>
            <div class="setting"><div class="info"><b>USB 저장장치 차단</b><span>승인하지 않은 장치의 연결을 막습니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="USB 저장장치 차단"></label></div></div>
          </div>
          <div class="settings-section">
            <div class="section-head">탐지 규칙</div>
            <div class="setting"><div class="info"><b>탐지 민감도</b><span>높을수록 오탐 가능성이 커집니다</span></div><div class="ctrl"><div class="slider"><div class="row"><label for="ps-sens">민감도</label><span class="val">60</span></div><input id="ps-sens" type="range" min="0" max="100" value="60" style="--p:60%"></div></div></div>
            <div class="setting"><div class="info"><b id="ps-act-l">탐지 시 동작</b><span>차단한 뒤 관리자에게 알립니다</span></div><div class="ctrl">${pSel({ id: "ps-act", label: "탐지 시 동작", labelledby: "ps-act-l", value: "block-alert", opts: [["block-alert", "차단 후 알림"], ["block", "차단만"], ["alert", "알림만"]] })}</div></div>
            <div class="setting"><div class="info"><b>로그 보관 기간</b><span>지나면 오래된 로그부터 지웁니다</span></div><div class="ctrl"><div class="field number-field"><label for="ps-keep" class="sr-only">로그 보관 기간</label><div class="affix"><input id="ps-keep" type="number" min="30" max="365" step="1" value="90" aria-valuetext="90일"><span>일</span>${pNum("로그 보관 기간")}</div><span class="help">30~365일</span></div></div></div>
            <div class="setting"><div class="info"><b>정기 점검 시각</b><span>매일 이 시각에 전체 검사를 합니다</span></div><div class="ctrl">${pTime({ id: "ps-time", label: "정기 점검 시각", value: "02:00", srLabel: true })}</div></div>
          </div>
          <div class="settings-section">
            <div class="section-head">저장장치</div>
            <div class="setting"><div class="info"><b>읽기 전용 허용</b><span>차단하는 대신 읽기만 허용합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" aria-label="읽기 전용 허용"></label></div></div>
            <div class="setting"><div class="info"><b>허용 장치</b><span>등록된 장치 중에서 고릅니다</span></div><div class="ctrl">${pCombo({ id: "ps-dev", label: "허용 장치", items: ["SanDisk 4C530001", "SanDisk 4C530002", "Samsung T7 S6WB", "Kingston DT 0921"], selected: ["SanDisk 4C530001", "SanDisk 4C530002"], multiple: true, placeholder: "장치 검색" })}</div></div>
          </div>
          <div class="settings-section">
            <div class="section-head">적용 대상</div>
            <div class="setting"><div class="info"><b>부서</b><span>5개 부서 · 135대</span></div><div class="ctrl"><div class="tag-group"><span class="tag">보안팀</span><span class="tag">개발팀</span><span class="tooltip-wrap"><button type="button" class="tag tag-more" aria-label="나머지 3개 부서 보기" aria-describedby="ps-more">+3</button><span class="tooltip" role="tooltip" id="ps-more">경영지원팀, 영업팀, 기술지원팀</span></span></div><button type="button" class="btn sm outline assistive" data-panel-open="#pol-targets">적용 대상 바꾸기</button></div></div>
          </div>
          <div class="settings-section">
            <div class="section-head">에이전트 연결</div>
            <div class="setting"><div class="info"><b>정책 ID</b><span>에이전트 설치 명령에 넣습니다</span></div><div class="ctrl">${pCopyInline("정책 ID", "POL-2041-USB")}</div></div>
          </div>
        </div>`, layout: "stack" },
      { id: "targets", title: "적용 대상 고르기", desc: "적용 대상 바꾸기를 누르면 열리는 Side Panel 입니다. 체크박스 Tree 에서 부서를 고르고, 적용을 눌러야 설정에 반영됩니다.", html: `
        <section class="side-panel" id="pol-targets" role="dialog" aria-modal="true" aria-labelledby="pol-targets-t" data-modal>
          <div class="side-panel-header"><h3 class="side-panel-title" id="pol-targets-t">적용 대상</h3>${pClose("side-panel-close", "data-panel-close")}</div>
          <div class="side-panel-body">${pTree(POLICY_TARGETS, "pt", "적용 대상 부서")}</div>
          <div class="side-panel-footer"><div class="btn-group"><button type="button" class="btn md outline assistive" data-panel-close>취소</button><button type="button" class="btn md solid primary" data-panel-close>적용</button></div></div>
        </section>` },
    ],
  },

  "severity": {
    status: "ready", react: ["SevBand"], uses: ["tag", "data-visual", "data-table"], css: [".sev-band", ".stack"],
    desc: "위협 심각도 5단계인 Critical · High · Medium · Low · Info 를 화면 어디서나 같게 표현하는 규칙입니다. 색과 Tag, 분포 밴드, 정렬 순서를 통일합니다.",
    choose: [["언제 쓰는가", "이벤트나 로그, 취약점처럼 위험의 크기를 등급으로 나눠 보여 주는 모든 자리에 씁니다."], ["비슷한 패턴", "처리 상태처럼 등급이 아닌 단계는 Tag 의 상태 톤과 <a href=\"#/components/indicator\">Indicator</a> 로 보여 줍니다."]],
    principles: [["색", "심각도는 따로 만든 색이 아니라 기존 상태색과 강조색에 맞춘 것입니다. Critical 은 위험 빨강, High 는 경고 주황, Medium 은 라이트 블루, Low 는 라임, Info 는 중립 회색입니다. 색 전체는 <a href=\"#/foundations/colors\">Colors</a> 에 있습니다."], ["이웃 등급", "도넛이나 누적 막대에서 맞붙는 이웃 등급은 색각 이상에서도 갈리도록 배치했습니다. 면에는 옅은 틴트를, 점과 지표에는 진한 단색을 씁니다."], ["표현", "표와 목록에는 Tag 를, 요약에는 분포 밴드나 도넛을 씁니다. Tag 의 글자가 색을 나르므로 행 왼쪽에 색 막대를 따로 두지 않습니다."], ["정렬", "늘 Critical 에서 Info 순서로 놓습니다. 표의 기본 정렬도 심각도가 높은 순서입니다."], ["라벨", "등급 이름을 반드시 함께 둡니다. 색조가 주된 단서라서, 색만으로 뜻을 전하지 않는다는 규칙이 여기서는 권고가 아니라 제약입니다."]],
    examples: [
      { id: "scale", title: "5단계 스케일", desc: "Tag 의 기본 모양과 Solid 모양입니다. 글자는 틴트와 같은 색상의 진한 톤이고 점은 없습니다.", html: `
        <div class="stack">
          <div class="tag-group"><span class="tag critical">Critical</span><span class="tag high">High</span><span class="tag medium">Medium</span><span class="tag low">Low</span><span class="tag info">Info</span></div>
          <div class="tag-group"><span class="tag critical solid">Critical</span><span class="tag high solid">High</span><span class="tag medium solid">Medium</span><span class="tag low solid">Low</span><span class="tag info solid">Info</span></div>
        </div>`, layout: "left" },
      { id: "band", title: "분포 밴드", desc: "전체에서 각 등급이 차지하는 비율을 띠 하나로 보여 줍니다. 조각의 길이가 비율이고, 수치는 아래 범례에 적습니다.", html: `
        <div class="stack">
          <div class="sev-band" role="img" aria-label="Critical 18%, High 27%, Medium 19%, Low 11%, Info 25%"><i class="critical" style="flex:18"></i><i class="high" style="flex:27"></i><i class="medium" style="flex:19"></i><i class="low" style="flex:11"></i><i class="info" style="flex:25"></i></div>
          <div class="chart-legend"><span><i class="critical"></i>Critical <b>190</b></span><span><i class="high"></i>High <b>285</b></span><span><i class="medium"></i>Medium <b>196</b></span><span><i class="low"></i>Low <b>120</b></span><span><i class="info"></i>Info <b>263</b></span></div>
        </div>` },
      { id: "table", title: "표 안의 심각도", desc: "심각도 칸은 Tag 하나로 씁니다. Tag 의 글자가 색을 나르므로 행 왼쪽에 색 막대를 두지 않습니다. 기본 정렬은 심각도가 높은 순서입니다.", html: `
        <div class="tbl-wrap">
          <table class="tbl compact nowrap">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">심각도</button></th><th>이벤트</th><th>대상</th><th class="num">건수</th></tr></thead>
            <tbody>
              <tr><td><span class="tag critical sm">Critical</span></td><td>랜섬웨어 행위 탐지</td><td>PC-2041</td><td class="num">3</td></tr>
              <tr><td><span class="tag high sm">High</span></td><td>알려진 악성코드 차단</td><td>PC-0932</td><td class="num">2</td></tr>
              <tr><td><span class="tag medium sm">Medium</span></td><td>미승인 USB 연결</td><td>PC-1187</td><td class="num">1</td></tr>
              <tr><td><span class="tag low sm">Low</span></td><td>정책 동기화 지연</td><td>Server-03</td><td class="num">12</td></tr>
              <tr><td><span class="tag info sm">Info</span></td><td>스케줄 검사 완료</td><td>PC-0411</td><td class="num">48</td></tr>
            </tbody>
          </table>
        </div>` },
    ],
  },

  "detail": {
    status: "new", react: ["PageHead","Tabs","Card","Table"], uses: ["page-header", "breadcrumb", "button", "dropdown", "tab", "card", "table", "copy-field", "indicator", "tag", "link", "list", "loading", "empty-state", "tooltip"], css: [".stack", ".row-2"],
    desc: "자산이나 정책, 사용자처럼 한 대상의 모든 것을 보여 주는 화면입니다. 위에는 이름과 그 대상에 할 동작을, 아래에는 탭으로 나눈 정보를 둡니다.",
    choose: [["언제 쓰는가", "목록에서 한 항목을 눌러 들어가, 그 대상의 상태와 이력을 보고 동작을 실행하는 화면에 씁니다."], ["비슷한 패턴", "목록을 떠나지 않고 잠깐 보는 상세는 <a href=\"#/components/side-panel\">Side Panel</a> 이나 표의 행 펼침으로 보여 줍니다."]],
    principles: [["머리", "Page Header 에 위치와 이름, 상태 한 줄을 둡니다. 동작은 세 개까지이고 가장 많이 하는 동작 하나만 주 버튼입니다."], ["위험 동작", "격리나 삭제처럼 되돌리기 어려운 동작은 ⋯ 메뉴 맨 아래 구분선 뒤에 둡니다. 누르면 <a href=\"#/patterns/danger-confirm\">위험 작업 확인</a>으로 묻습니다."], ["탭", "개요 · 활동 · 설정처럼 성격이 다른 정보를 탭으로 나눕니다. 첫 탭인 개요에는 가장 자주 보는 정보만 둡니다."], ["키-값", "카드 안 속성은 키-값 목록으로 보여 줍니다. IP 처럼 복사해 쓰는 값에는 복사 버튼을 붙입니다."], ["관련 항목", "관련 이벤트나 로그는 최근 몇 건만 보여 주고, 같은 조건의 목록 화면으로 가는 링크를 둡니다."], ["상태", "불러오는 동안은 내용 자리에 Skeleton 을 두고, 없는 대상이면 Empty State 로 알리며 목록으로 돌아갈 길을 줍니다."]],
    examples: [
      { id: "asset", title: "자산 상세", html: `
        <div class="stack">
          <div class="page-head">
            ${pBreadcrumb(["자산", "PC-2041"])}
            <div><h2 class="title">PC-2041</h2><p class="sub">김민준 · 개발팀 · Windows 11</p></div>
            <div class="actions"><div class="btn-group"><button type="button" class="btn md outline assistive">검사 실행</button><button type="button" class="btn md solid primary">원격 점검</button><div class="dropdown"><span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="PC-2041 동작 더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button><span class="tooltip left" role="tooltip">PC-2041 동작 더 보기</span></span><ul class="menu" role="menu"><li class="menu-item" role="menuitem">${I("refresh")}에이전트 재설치</li><li class="menu-item" role="menuitem">${I("download")}정보 내보내기</li><li class="menu-item" role="menuitem">${I("lock")}네트워크 격리</li><li class="menu-sep" role="separator"></li><li class="menu-item danger" role="menuitem">${I("trash")}자산 삭제</li></ul></div></div></div>
          </div>
          <div class="tabs" role="tablist" aria-label="자산 정보"><button type="button" class="tab on" role="tab" aria-selected="true" id="ad-tab-a" aria-controls="ad-panel-a">개요</button><button type="button" class="tab" role="tab" aria-selected="false" id="ad-tab-b" aria-controls="ad-panel-b">활동</button><button type="button" class="tab" role="tab" aria-selected="false" id="ad-tab-c" aria-controls="ad-panel-c">설정</button></div>
          <div class="tab-panel" role="tabpanel" id="ad-panel-a" aria-labelledby="ad-tab-a">
            <div class="stack">
              <div class="row-2">
                <div class="card"><div class="card-head"><h3 class="title">자산 정보</h3><span class="indicator ok">연결됨</span></div><dl class="card-meta"><dt>IP</dt><dd>${pCopyInline("IP", "10.0.4.21")}</dd><dt>에이전트</dt><dd>6.2.1</dd><dt>그룹</dt><dd>본사 · 개발팀</dd><dt>마지막 접속</dt><dd>2026. 11. 15 09:41</dd></dl></div>
                <div class="card"><div class="card-head"><h3 class="title">보호 상태</h3><span class="tag high">위험 2건</span></div><dl class="card-meta"><dt>실시간 보호</dt><dd><span class="indicator ok">켜짐</span></dd><dt>정책</dt><dd><a href="#" class="link">외부 USB 차단</a> 외 11개</dd><dt>마지막 검사</dt><dd>2026. 11. 15 02:00 · 위협 0</dd></dl></div>
              </div>
              <div class="card flush">
                <div class="card-head"><h3 class="title">최근 이벤트</h3><a href="#" class="btn sm text assistive">이벤트 목록에서 보기${I("chevron-right",16)}</a></div>
                <div class="tbl-wrap"><table class="tbl nowrap"><thead><tr><th>시간</th><th>심각도</th><th>이벤트</th></tr></thead><tbody>
                  <tr><td>09:41:12</td><td><span class="tag critical sm">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td></tr>
                  <tr><td>09:36:47</td><td><span class="tag high sm">High</span></td><td><a href="#" class="link">알려진 악성코드 차단</a></td></tr>
                </tbody></table></div>
              </div>
            </div>
          </div>
          <div class="tab-panel" role="tabpanel" id="ad-panel-b" aria-labelledby="ad-tab-b" hidden>
            <ul class="list"><li><div><span class="primary">정책 배포 rev 2041</span><span class="meta">2026. 11. 15 08:00 · 자동</span></div></li><li><div><span class="primary">에이전트 6.2.1 업데이트</span><span class="meta">2026. 11. 12 14:20 · 이서연</span></div></li></ul>
          </div>
          <div class="tab-panel" role="tabpanel" id="ad-panel-c" aria-labelledby="ad-tab-c" hidden>
            <ul class="list"><li><div><span class="primary">소속 그룹</span><span class="meta">본사 · 개발팀</span></div></li><li><div><span class="primary">예외 정책</span><span class="meta">없음</span></div></li></ul>
          </div>
        </div>`, layout: "stack" },
      { id: "states", title: "불러오는 중 · 없는 대상", desc: "불러오는 동안은 내용 자리에 Skeleton 을 둡니다. 지워졌거나 권한 밖인 대상은 Empty State 로 알리고 목록으로 돌아갈 길을 줍니다.", html: `
        <div class="row-2">
          <div class="card" aria-busy="true"><span class="skeleton title"></span><span class="skeleton text"></span><span class="skeleton text short"></span></div>
          <div class="card"><div class="empty compact"><span class="ico">${I("file-search",24)}</span><div><b>자산을 찾을 수 없습니다</b><span>지워졌거나 다른 조직의 자산입니다.</span></div><a href="#" class="btn sm outline assistive">자산 목록으로 이동</a></div></div>
        </div>`, layout: "stack" },
    ],
  },

  "roles": {
    status: "new", react: ["DataTable", "AvatarGroup", "SidePanel", "Tree", "Card"], uses: ["page-header", "button", "data-table", "avatar", "tag", "side-panel", "notification", "tree", "card", "loading", "empty-state"], borrows: [".sr-only"], css: [".toolbar", ".stack"],
    desc: "관리자 역할과 그 역할이 할 수 있는 일을 정하는 화면입니다. 역할 목록에서 하나를 골라 Side Panel 에서 권한을 고칩니다.",
    choose: [["언제 쓰는가", "콘솔을 쓰는 사람에게 역할을 주고, 역할마다 보기 · 처리 · 배포 같은 권한을 정할 때 씁니다."], ["비슷한 패턴", "정책이 적용될 부서나 단말을 고르는 일은 <a href=\"#/patterns/policy-settings\">정책 설정</a>의 적용 대상에서 합니다."]],
    principles: [["목록", "역할마다 이름과 설명, 그 역할을 가진 사람, 기본 · 사용자 정의 구분을 한 줄에 둡니다. 사람은 Avatar Group 으로 다섯까지 보여 주고 나머지는 수로 적습니다."], ["기본 역할", "시스템이 만든 기본 역할은 이름을 바꾸거나 지울 수 없습니다. 권한을 바꾸려면 복제해서 사용자 정의 역할로 만듭니다."], ["권한 트리", "권한은 화면별로 묶은 체크박스 Tree 로 고릅니다. 묶음을 켜면 그 안의 권한이 함께 켜지고, 일부만 켜지면 묶음은 일부 선택으로 보입니다."], ["변경 요약", "저장하기 전에 무엇이 늘고 줄었는지 Side Panel 위에 요약합니다. 영향을 받는 사람 수를 함께 적습니다."], ["저장", "저장해야 반영되고, 취소하면 열기 전 상태로 돌아갑니다. 바뀐 권한은 그 사람이 다음에 화면을 열 때부터 적용됩니다."], ["감사", "역할을 바꾼 기록은 감사 로그에 남습니다. 누가 언제 무엇을 바꿨는지는 제품 서버가 기록합니다."]],
    examples: [
      { id: "list", title: "역할 목록", html: `
        <div class="stack">
          <div class="page-head"><div><h2 class="title">역할</h2></div><div class="actions"><button type="button" class="btn md solid primary">${I("plus")}역할 만들기</button></div></div>
          <div class="tbl-wrap">
            <table class="tbl hover">
              <thead><tr><th class="sortable sorted" aria-sort="ascending"><button type="button" class="sort">역할</button></th><th>설명</th><th>사용자</th><th>구분</th><th class="actions"><span class="sr-only">동작</span></th></tr></thead>
              <tbody>
                <tr><td>보안 관리자</td><td>모든 화면을 보고 정책을 배포합니다</td><td>${pAvatars("보안 관리자 사용자", ["김민준", "이서연", "박지훈"], 0, true)}</td><td><span class="tag sm">기본</span></td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="보안 관리자 권한 편집" data-panel-open="#role-edit">권한 편집</button></td></tr>
                <tr><td>운영자</td><td>이벤트를 처리하고 정책을 봅니다</td><td>${pAvatars("운영자 사용자", ["최유진", "정다은", "한지우", "오세훈", "윤하늘"], 7, true)}</td><td><span class="tag sm">기본</span></td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="운영자 권한 편집" data-panel-open="#role-edit">권한 편집</button></td></tr>
                <tr><td>감사자</td><td>로그와 보고서만 봅니다</td><td>${pAvatars("감사자 사용자", ["강민서"], 0, true)}</td><td><span class="tag accent sm">사용자 정의</span></td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="감사자 권한 편집" data-panel-open="#role-edit">권한 편집</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>`, layout: "stack" },
      { id: "edit", title: "권한 편집", desc: "권한 편집을 누르면 열리는 Side Panel 입니다. 저장하기 전에 무엇이 바뀌는지 맨 위에 요약합니다.", html: `
        <section class="side-panel" id="role-edit" role="dialog" aria-modal="true" aria-labelledby="role-edit-t" data-modal>
          <div class="side-panel-header"><h3 class="side-panel-title" id="role-edit-t">운영자 권한</h3>${pClose("side-panel-close", "data-panel-close")}</div>
          <div class="side-panel-body">
            ${pNotice("info", "변경 2건 · 12명에게 적용", "이벤트 처리를 켜고 사용자 관리를 껐습니다.")}
            ${pTree(ROLE_PERMS, "rp", "운영자 권한")}
          </div>
          <div class="side-panel-footer"><div class="btn-group"><button type="button" class="btn md outline assistive" data-panel-close>취소</button><button type="button" class="btn md solid primary" data-panel-close>저장</button></div></div>
        </section>` },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "역할 목록을 불러오는 동안과 아직 만든 역할이 없을 때, 불러오지 못했을 때의 화면입니다. 첫 사용에는 만드는 동작을 둡니다.", html: pStates({"cols": ["역할", "설명", "#사용자"], "loading": "역할 불러오는 중", "emptyTitle": "첫 사용", "empty": "아직 만든 역할이 없습니다.", "error": "역할 목록을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.", "emptyBtn": ["역할 만들기", true]}), layout: "stack" },
    ],
  },

  "secrets": {
    status: "new", react: ["DataTable", "CopyField", "Popup", "Card"], uses: ["page-header", "button", "data-table", "copy-field", "indicator", "popup", "form", "text-field", "date-picker", "radio-button", "notification", "card", "loading", "empty-state"], borrows: [".sr-only", ".t-label-1-normal", ".t-semibold"], css: [".toolbar", ".stack"],
    desc: "외부 연동에 쓰는 API 키와 비밀값을 만들고 재발급하는 화면입니다. 비밀값은 만든 순간 한 번만 보여 주고, 목록에는 알아볼 수 있는 앞자리만 둡니다.",
    choose: [["언제 쓰는가", "SIEM 이나 티켓 시스템처럼 콘솔과 연결되는 외부 서비스에 줄 키를 만들고, 만료를 관리할 때 씁니다."], ["비슷한 패턴", "에이전트 등록처럼 가려서 다시 볼 수 있는 값은 <a href=\"#/components/copy-field\">Copy Field</a> 하나로 충분합니다."]],
    principles: [["한 번만 보임", "비밀값은 만든 직후 대화상자에서 한 번만 보여 줍니다. 다시 볼 수 없다는 경고를 함께 두고, 닫으면 서버에 남지 않습니다."], ["목록", "목록에는 키 이름과 키 ID, 알아볼 수 있는 앞자리, 만료일, 마지막 사용을 둡니다. 비밀값 전체는 목록에 두지 않습니다."], ["만료", "만료가 30일 안이면 남은 날을 경고 점으로, 7일 안이면 위험 점으로 보여 줍니다. 그보다 멀면 날짜만 적습니다. 만료가 없는 키는 만들 수 없게 기본값을 정해 둡니다."], ["재발급", "재발급하면 옛 키가 바로 멈춥니다. 그래서 alertdialog 로 묻고, 무엇이 끊기는지 적습니다."], ["범위", "키마다 할 수 있는 일을 정합니다. 읽기 전용을 기본으로 고르고, 쓰기는 필요한 연동에만 줍니다."], ["복사", "복사해도 값은 알림이나 로그에 남기지 않습니다. 복사했다는 사실만 버튼 자리에서 알립니다."]],
    examples: [
      { id: "keys", title: "키 목록", html: `
        <div class="stack">
          <div class="page-head"><div><h2 class="title">API 키</h2></div><div class="actions"><button type="button" class="btn md solid primary" data-popup-open="#sec-create">${I("plus")}API 키 만들기</button></div></div>
          <div class="tbl-wrap">
            <table class="tbl hover nowrap">
              <thead><tr><th>이름</th><th>키 ID</th><th>앞자리</th><th class="sortable sorted" aria-sort="ascending"><button type="button" class="sort">만료</button></th><th>마지막 사용</th><th class="actions"><span class="sr-only">동작</span></th></tr></thead>
              <tbody>
                <tr><td>SIEM 연동</td><td>${pCopyInline("SIEM 연동 키 ID", "key_01HF8Q")}</td><td>jsk_live_8c2e</td><td><span class="indicator danger">7일 남음</span></td><td>09:41</td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="SIEM 연동 키 재발급" data-popup-open="#sec-reissue">재발급</button></td></tr>
                <tr><td>티켓 시스템</td><td>${pCopyInline("티켓 시스템 키 ID", "key_01HD2K")}</td><td>jsk_live_41f7</td><td><span class="indicator warn">24일 남음</span></td><td>어제</td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="티켓 시스템 키 재발급" data-popup-open="#sec-reissue">재발급</button></td></tr>
                <tr><td>보고서 내보내기</td><td>${pCopyInline("보고서 내보내기 키 ID", "key_01HA9M")}</td><td>jsk_live_a9b3</td><td>2027. 03. 31</td><td>11. 02</td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="보고서 내보내기 키 재발급" data-popup-open="#sec-reissue">재발급</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>`, layout: "stack" },
      { id: "create", title: "키 만들기", desc: "API 키 만들기를 누르면 열리는 대화상자입니다. 이름과 만료일, 범위를 받습니다. 범위는 읽기 전용을 미리 골라 둡니다.", html: `
        <div class="popup" id="sec-create" role="dialog" aria-modal="true" aria-labelledby="sec-create-t">
          <h3 class="popup-title" id="sec-create-t">API 키 만들기</h3>${pClose("popup-close", "data-popup-close")}
          <form class="form popup-body" id="sec-create-form" data-validate novalidate>
            <p class="form-legend"><em>*</em> 필수 항목</p>
            <div class="field"><label for="sec-name">키 이름 <em>*</em></label><input id="sec-name" required placeholder="예: SIEM 연동"><span class="help" aria-live="polite">목록에서 알아볼 이름입니다.</span></div>
            ${pDate({ id: "sec-exp", label: "만료일", value: "2027. 02. 15", help: "최대 1년까지 정할 수 있습니다." })}
            <div class="field"><fieldset class="radio-group"><legend class="t-label-1-normal t-semibold">범위</legend><label class="radio"><input type="radio" name="sec-scope" checked><span>읽기 전용</span></label><label class="radio"><input type="radio" name="sec-scope"><span>읽기와 쓰기</span></label></fieldset><span class="help" aria-live="polite"></span></div>
          </form>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="submit" class="btn md solid primary" form="sec-create-form">만들기</button></div></div>
        </div>` },
      { id: "created", title: "만든 키 보기", desc: "만든 직후 한 번만 보이는 비밀값입니다. 다시 볼 수 없다는 경고를 두고, 값은 가린 채로도 복사할 수 있습니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="sec-done-t">
          <h3 class="popup-title" id="sec-done-t">API 키를 만들었습니다</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-body">
            ${pNotice("warning", "이 창을 닫으면 다시 볼 수 없습니다", "지금 복사해 연동할 서비스에 넣으세요.")}
            <div class="field copy-field"><label for="sec-secret">비밀값</label><div class="affix"><input id="sec-secret" type="password" readonly autocomplete="off" value="jsk_live_8c2e41f7a9b3d605e1"><button type="button" class="reveal" aria-label="비밀값 보기" aria-pressed="false"><span class="i-show">${I("eye",18)}</span><span class="i-hide">${I("eye-off",18)}</span></button>${pCopy("비밀값")}</div></div>
          </div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>닫기</button></div>
        </div>` },
      { id: "reissue", title: "재발급 확인", desc: "재발급하면 옛 키가 바로 멈추므로 alertdialog 로 묻습니다. 무엇이 끊기는지 적고 취소를 앞에 둡니다.", html: `
        <div class="popup danger" id="sec-reissue" role="alertdialog" aria-modal="true" aria-labelledby="sec-re-t" aria-describedby="sec-re-b">
          <h3 class="popup-title" id="sec-re-t">SIEM 연동 키를 재발급할까요?</h3>${pClose("popup-close", "data-popup-close")}
          <div class="popup-body" id="sec-re-b"><p>지금 키는 바로 멈춥니다. 새 키를 SIEM 에 넣기 전까지 이벤트 전송이 끊깁니다.</p></div>
          <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative">재발급</button></div></div>
        </div>` },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "키 목록을 불러오는 동안과 아직 만든 키가 없을 때, 불러오지 못했을 때의 화면입니다. 첫 사용에는 만드는 동작을 둡니다.", html: pStates({"cols": ["이름", "범위", "만든 날", "마지막 사용"], "loading": "API 키 불러오는 중", "emptyTitle": "첫 사용", "empty": "아직 만든 API 키가 없습니다.", "error": "API 키 목록을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.", "emptyBtn": ["API 키 만들기", true]}), layout: "stack" },
    ],
  },

  "incident": {
    status: "new", react: ["PageHead", "Steps", "Card", "Combobox", "DataTable"], uses: ["page-header", "breadcrumb", "button", "steps", "card", "list", "text-field", "table", "tag", "avatar", "combobox", "link", "data-table", "loading", "empty-state"], borrows: [".menu", ".menu-item", ".chip", ".sr-only"], css: [".stack", ".row-2"],
    desc: "탐지된 사고를 접수부터 종료까지 처리하는 화면입니다. 지금 어느 단계인지와 담당자를 보여 주고, 처리한 일을 기록으로 남깁니다.",
    choose: [["언제 쓰는가", "Critical 탐지처럼 사람이 맡아 분석하고 조치해야 하는 사고를 한 화면에서 처리할 때 씁니다."], ["비슷한 패턴", "사고가 아닌 자산이나 정책 하나를 보는 화면은 <a href=\"#/patterns/detail\">상세 화면</a>을 씁니다."]],
    principles: [["단계", "접수 · 분석 · 조치 · 종료 네 단계를 Steps 로 보여 줍니다. 단계를 옮기는 일은 제품의 처리 버튼이 맡고, Steps 는 표시만 합니다."], ["요약", "오른쪽에 심각도와 상태, 담당자, 대상을 키-값으로 둡니다. 담당자는 Combobox 로 바로 바꿀 수 있습니다."], ["처리 기록", "누가 언제 무엇을 했는지 시간 순서로 쌓습니다. 메모를 남기는 칸은 기록 맨 위에 둡니다."], ["관련 로그", "사고를 일으킨 로그를 몇 건 보여 주고, 같은 조건의 로그 뷰어로 가는 링크를 둡니다."], ["알림에서 오기", "담당자로 지정되거나 단계가 바뀌면 알림 센터에 알림이 옵니다. 알림을 누르면 이 화면으로 옵니다."], ["종료", "종료할 때는 원인과 조치를 남기게 합니다. 종료한 사고는 기록만 남고 담당자와 단계를 바꿀 수 없습니다."]],
    examples: [
      { id: "case", title: "사고 처리", html: `
        <div class="stack">
          <div class="page-head">
            ${pBreadcrumb(["사고", "INC-0412"])}
            <div><h2 class="title">랜섬웨어 행위 탐지</h2><p class="sub">INC-0412 · 접수 09:41 · PC-2041</p></div>
            <div class="actions"><div class="btn-group"><button type="button" class="btn md outline assistive">단말 격리</button><button type="button" class="btn md solid primary">조치 완료</button></div></div>
          </div>
          <ol class="steps" aria-label="처리 단계"><li class="done"><i>${I("check",16)}</i><span class="label">접수</span><span class="sr-only"> (완료)</span></li><li class="done"><i>${I("check",16)}</i><span class="label">분석</span><span class="sr-only"> (완료)</span></li><li class="on" aria-current="step"><i>3</i><span class="label">조치</span></li><li><i>4</i><span class="label">종료</span></li></ol>
          <div class="row-2">
            <div class="stack">
              <div class="card">
                <div class="card-head"><h3 class="title">처리 기록</h3></div>
                <form data-validate novalidate><div class="field"><label for="inc-memo">메모</label><textarea id="inc-memo" required placeholder="처리한 일을 남기세요"></textarea><span class="help" aria-live="polite">감사 로그에도 남습니다.</span></div><div class="btn-group end"><button type="submit" class="btn md outline primary">기록 추가</button></div></form>
                <ul class="list"><li><span class="avatar sm" role="img" aria-label="이서연">이</span><div><span class="primary">cryptor.dll 을 격리 저장소로 옮겼습니다</span><span class="meta">이서연 · 10:12</span></div></li><li><span class="avatar sm" role="img" aria-label="이서연">이</span><div><span class="primary">분석 완료. 첨부 문서의 매크로로 들어왔습니다</span><span class="meta">이서연 · 09:58</span></div></li></ul>
              </div>
              <div class="card flush">
                <div class="card-head"><h3 class="title">관련 로그</h3><a href="#" class="btn sm text assistive">로그 뷰어에서 보기${I("chevron-right",16)}</a></div>
                <div class="tbl-wrap"><table class="tbl compact nowrap"><thead><tr><th>시간</th><th>심각도</th><th>메시지</th></tr></thead><tbody>
                  <tr><td>09:41:12</td><td><span class="tag critical sm">CRIT</span></td><td>process.create blocked: rundll32.exe</td></tr>
                  <tr><td>09:41:11</td><td><span class="tag medium sm">WARN</span></td><td>usb.attach vendor=0x0781</td></tr>
                </tbody></table></div>
              </div>
            </div>
            <div class="card">
              <div class="card-head"><h3 class="title">요약</h3></div>
              <dl class="card-meta"><dt>심각도</dt><dd><span class="tag critical sm">Critical</span></dd><dt>상태</dt><dd><span class="tag pending sm">조치 중</span></dd><dt>대상</dt><dd><a href="#" class="link">PC-2041</a></dd></dl>
              ${pCombo({ id: "inc-owner", label: "담당자", items: ["이서연", "김민준", "박지훈", "최유진"], selected: ["이서연"], field: true, placeholder: "담당자 검색" })}
            </div>
          </div>
        </div>`, layout: "stack" },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "사고 목록을 불러오는 동안과 조건에 맞는 사고가 없을 때, 불러오지 못했을 때의 화면입니다.", html: pStates({"cols": ["시간", "심각도", "사고", "담당자"], "loading": "사고 목록 불러오는 중", "emptyTitle": "빈 결과", "empty": "조건에 맞는 사고가 없습니다. 필터를 바꾸거나 지우세요.", "error": "사고 목록을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.", "emptyBtn": ["필터 초기화", false]}), layout: "stack" },
    ],
  },

  "audit-log": {
    status: "new", react: ["DataTable", "Table", "Card"], uses: ["pagination", "search", "date-picker", "data-table", "table", "indicator", "card", "tag", "link", "button", "loading", "empty-state"], borrows: [".sr-only", ".field"], css: [".stack", ".toolbar"],
    desc: "누가 언제 무엇을 바꿨는지 남기고 찾아보는 화면입니다. 기록은 고칠 수 없고, 바꾼 내용은 변경 전과 변경 후를 나란히 보여 줍니다.",
    choose: [["언제 쓰는가", "정책 변경이나 로그인, 내보내기처럼 관리자가 한 일을 감사하거나, 설정이 언제 왜 바뀌었는지 찾을 때 씁니다."], ["비슷한 패턴", "단말과 보안 이벤트의 기록은 <a href=\"#/patterns/log-viewer\">로그 뷰어</a>를, 사고 하나의 처리 기록은 <a href=\"#/patterns/incident\">사고 처리</a>를 씁니다."]],
    principles: [["남기는 것", "누가, 언제, 어디서, 무엇을 했는지와 결과를 남깁니다. 실패한 시도도 남깁니다."], ["고칠 수 없음", "감사 기록은 고치거나 지울 수 없습니다. 화면에 편집이나 삭제 동작을 두지 않습니다."], ["찾기", "검색칸과 기간을 툴바에 둡니다. 기간의 처음 값은 최근 7일입니다."], ["자세히 보기", "행을 펼쳐 접속 IP와 사유, 바뀐 항목을 보여 줍니다. 바뀐 항목은 변경 전에서 변경 후로 읽히게 적습니다."], ["변경 이력", "설정 하나의 이력은 버전마다 바꾼 사람과 시각, 요약을 표로 보여 주고, 두 버전을 나란히 비교합니다."], ["되돌리기", "지난 버전으로 되돌리는 일도 새 버전을 하나 만듭니다. 이력을 지우지 않고, 누르면 <a href=\"#/patterns/danger-confirm\">위험 작업 확인</a>을 거칩니다."], ["보관", "보관 기간과 내보내기 방법은 화면 아래에 적습니다. 내보낸 일도 감사 기록에 남습니다."]],
    examples: [
      { id: "list", title: "감사 로그", desc: "검색칸과 기간으로 찾고, 행을 펼쳐 바뀐 항목을 변경 전과 변경 후로 봅니다.", html: `
        <div class="stack">
          <div class="toolbar">
            <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="사용자, 대상 검색" aria-label="감사 로그 검색"></div>
            ${pDate({ id: "au-range", aria: "조회 기간", range: true, value: "2026. 11. 09 ~ 2026. 11. 15", attrs: 'data-max="today" data-presets="7 30" data-default-preset="7"' })}
          </div>
          <div class="tbl-wrap"><table class="tbl compact nowrap">
            <thead><tr><th class="expand"><span class="sr-only">상세</span></th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>사용자</th><th>동작</th><th>대상</th><th>결과</th></tr></thead>
            <tbody>
              <tr><td class="expand"><button type="button" class="expand-btn" aria-expanded="true" aria-controls="au0-d" aria-label="10:12 기록 상세">${I("chevron-right",16)}</button></td><td>11. 15 10:12</td><td>이서연</td><td>정책 변경</td><td><a href="#" class="link">표준 보호</a></td><td><span class="indicator ok">성공</span></td></tr>
              <tr class="row-detail" id="au0-d"><td colspan="6"><div class="row-detail-body"><dl class="detail-meta"><dt>접속 IP</dt><dd>10.0.0.12</dd><dt>사유</dt><dd>PC-2041 USB 예외 요청</dd><dt>USB 저장장치 차단</dt><dd>켬 → 끔</dd><dt>예외 단말</dt><dd>2대 → 3대</dd></dl></div></td></tr>
              <tr><td class="expand"><button type="button" class="expand-btn" aria-expanded="false" aria-controls="au1-d" aria-label="10:05 기록 상세">${I("chevron-right",16)}</button></td><td>11. 15 10:05</td><td>김민준</td><td>로그인</td><td>콘솔</td><td><span class="indicator danger">실패</span></td></tr>
              <tr class="row-detail" id="au1-d" hidden><td colspan="6"><div class="row-detail-body"><dl class="detail-meta"><dt>접속 IP</dt><dd>203.0.113.7</dd><dt>사유</dt><dd>비밀번호 5회 틀림 · 계정 잠김</dd></dl></div></td></tr>
              <tr><td class="expand"><button type="button" class="expand-btn" aria-expanded="false" aria-controls="au2-d" aria-label="09:58 기록 상세">${I("chevron-right",16)}</button></td><td>11. 15 09:58</td><td>박지훈</td><td>내보내기</td><td>로그 7일</td><td><span class="indicator ok">성공</span></td></tr>
              <tr class="row-detail" id="au2-d" hidden><td colspan="6"><div class="row-detail-body"><dl class="detail-meta"><dt>접속 IP</dt><dd>10.0.0.31</dd><dt>형식</dt><dd>CSV · 48,213줄</dd></dl></div></td></tr>
            </tbody>
          </table></div>
          <div class="pagination-bar"><span>총 <b>142</b>건 · 1–50</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav></div>
        </div>`, layout: "stack" },
      { id: "history", title: "변경 이력과 비교", desc: "설정 하나의 버전을 표로 보여 주고, 두 버전을 나란히 비교합니다. 되돌리기도 새 버전을 만듭니다.", html: `
        <div class="stack">
          <div class="card flush">
            <div class="card-head"><h3 class="title">표준 보호 · 변경 이력</h3></div>
            <div class="tbl-wrap"><table class="tbl nowrap"><thead><tr><th>버전</th><th>바꾼 사람</th><th>시각</th><th>내용</th><th><span class="sr-only">동작</span></th></tr></thead><tbody>
              <tr><td>v12 <span class="tag accent sm">현재</span></td><td>이서연</td><td>11. 15 10:12</td><td>USB 저장장치 차단 끔 외 1건</td><td class="actions"></td></tr>
              <tr><td>v11</td><td>김민준</td><td>11. 10 16:40</td><td>예약 검사 시각 02:00</td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="v11 버전으로 되돌리기">되돌리기</button></td></tr>
              <tr><td>v10</td><td>이서연</td><td>11. 02 11:05</td><td>랜섬웨어 행위 차단 켬</td><td class="actions"><button type="button" class="btn sm outline assistive" aria-label="v10 버전으로 되돌리기">되돌리기</button></td></tr>
            </tbody></table></div>
          </div>
          <div class="card flush">
            <div class="card-head"><h3 class="title">v11 과 v12 비교</h3></div>
            <div class="tbl-wrap"><table class="tbl grid nowrap"><thead><tr><th>항목</th><th>변경 전 · v11</th><th>변경 후 · v12</th></tr></thead><tbody>
              <tr><td>USB 저장장치 차단</td><td>켬</td><td>끔</td></tr>
              <tr><td>예외 단말</td><td>PC-0932, PC-1187</td><td>PC-0932, PC-1187, PC-2041</td></tr>
            </tbody></table></div>
          </div>
        </div>`, layout: "stack" },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "기록을 불러오는 동안은 같은 크기의 Skeleton 행을, 조건에 맞는 기록이 없으면 조건을 바꾸는 길을, 불러오지 못하면 원인과 다시 시도를 둡니다.", html: pStates({"cols": ["시간", "사용자", "동작", "대상"], "loading": "감사 로그 불러오는 중", "emptyTitle": "빈 결과", "empty": "조건에 맞는 기록이 없습니다. 기간을 넓히거나 검색어를 바꾸세요.", "error": "감사 로그를 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.", "emptyBtn": ["필터 초기화", false]}), layout: "stack" },
    ],
  },

  "alert-rules": {
    status: "new", react: ["Form", "Combobox", "NumberInput", "Checkbox", "DataTable", "Card"], uses: ["form", "text-field", "combobox", "select", "number-input", "checkbox", "notification", "button", "data-table", "card", "loading", "empty-state"], borrows: [".menu-mark", ".sr-only", ".chip"], css: [".btn-group", ".stack"],
    desc: "어떤 이벤트가 생기면 누구에게 어떻게 알릴지 정하는 화면입니다. 조건과 동작을 나눠 받고, 저장하기 전에 규칙을 한 문장으로 보여 줍니다.",
    choose: [["언제 쓰는가", "Critical 이벤트가 짧은 시간에 몰리는 것처럼 사람이 바로 알아야 하는 조건을 정해 메일이나 웹훅으로 알릴 때 씁니다."], ["비슷한 패턴", "정해진 때마다 요약을 보내는 것은 <a href=\"#/patterns/report-schedule\">보고서 · 예약 발송</a>을, 탐지와 차단 동작 자체를 정하는 것은 <a href=\"#/patterns/policy-settings\">정책 설정</a>을 씁니다."]],
    principles: [["조건과 동작", "조건과 동작을 섹션으로 나눕니다. 조건은 모두 맞아야 하고, 동작은 하나 이상 고릅니다."], ["조건", "심각도와 대상, 횟수와 시간 창을 받습니다. 횟수와 시간 창은 '10분 안에 5건 이상' 처럼 한 줄로 읽히게 둡니다."], ["동작", "메일은 받는 사람을, 웹훅은 주소를 받습니다. 웹훅은 저장하기 전에 테스트 전송으로 확인할 수 있게 합니다."], ["요약 문장", "저장 버튼 위에 규칙을 한 문장으로 보여 주고, 값을 바꾸면 바로 고칩니다."], ["알림 묶기", "같은 규칙의 알림은 시간 창 안에서 한 번만 보냅니다. 같은 이벤트로 알림이 쏟아지지 않게 합니다."], ["검증", "필수 값과 웹훅 주소 형식은 입력 검증으로 확인합니다. 저장을 누르면 첫 오류로 이동합니다."]],
    examples: [
      { id: "builder", title: "알림 규칙 만들기", html: `
        <form class="form" data-validate data-draft="alert-rule-new" novalidate>
          <p class="form-legend"><em>*</em> 필수 항목</p>
          <div class="field"><label for="ar-name">규칙 이름 <em>*</em></label><input id="ar-name" value="랜섬웨어 연속 탐지" required><span class="help" aria-live="polite"></span></div>
          <div class="form-section">조건</div>
          ${pCombo({ id: "ar-sev", label: "심각도", items: SEVS, selected: ["Critical", "High"], multiple: true, field: true, req: true, placeholder: "심각도 선택", help: "", live: true })}
          ${pSel({ id: "ar-target", label: "대상", opts: [["all", "전체 단말"], ["server", "서버 그룹"], ["sales", "영업팀 PC"]], value: "all", help: "", live: true })}
          <div class="form-row">
            <div class="field number-field"><label for="ar-count">횟수</label><div class="affix"><input id="ar-count" type="number" value="5" min="1" max="100" aria-valuetext="5건 이상"><span>건 이상</span>${pNum("횟수")}</div><span class="help" aria-live="polite">1~100</span></div>
            ${pSel({ id: "ar-window", label: "시간 창", opts: [["5", "5분 안에"], ["10", "10분 안에"], ["60", "1시간 안에"]], value: "10", help: "", live: true })}
          </div>
          <div class="form-section">동작</div>
          <label class="checkbox"><input type="checkbox" checked><span>메일 보내기</span></label>
          ${pCombo({ id: "ar-mail", label: "받는 사람", items: ["보안팀", "운영팀", "김민준", "이서연"], selected: ["보안팀"], multiple: true, field: true, placeholder: "사람 또는 부서 검색", help: "", live: true })}
          <label class="checkbox"><input type="checkbox" checked><span>웹훅 호출</span></label>
          <div class="field"><label for="ar-hook">웹훅 주소</label><input id="ar-hook" type="url" value="https://hooks.example.com/js-alert" data-messages='{"url":"https:// 로 시작하는 주소를 입력하세요."}'><span class="help" aria-live="polite">테스트 전송으로 받는 쪽을 확인하세요.</span></div>
          <div class="btn-group"><button type="button" class="btn sm outline assistive">테스트 전송</button></div>
          ${pNotice("", "규칙 요약", "Critical · High 이벤트가 전체 단말에서 10분 안에 5건 이상 생기면 보안팀에 메일을 보내고 웹훅을 호출합니다.")}
          <div class="form-actions"><div class="btn-group"><button type="button" class="btn md outline assistive">취소</button><button type="submit" class="btn md solid primary">저장</button></div></div>
        </form>` },
      { id: "state", title: "불러오는 중 · 빈 결과 · 오류", desc: "규칙 목록을 불러오는 동안과 아직 만든 규칙이 없을 때, 불러오지 못했을 때의 화면입니다. 첫 사용에는 만드는 동작을 둡니다.", html: pStates({"cols": ["규칙", "조건", "알림"], "loading": "알림 규칙 불러오는 중", "emptyTitle": "첫 사용", "empty": "아직 만든 알림 규칙이 없습니다.", "error": "알림 규칙을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요.", "emptyBtn": ["규칙 만들기", true]}), layout: "stack" },
    ],
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = PATTERNS;
