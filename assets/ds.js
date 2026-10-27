/* =========================================================
   ds.js — JS Design System 컴포넌트 동작 스크립트 (순수 JS, 의존성 없음)
   assets/style.css 의 클래스 마크업에 동작을 붙인다. 이벤트 위임 방식이라 동적으로 추가된 마크업에도 적용.
   사용: <script src="assets/ds.js" defer></script>  (React 제품은 @jiran/ds-react 를 쓰고 이 파일은 불필요)
   - Dropdown / Select: 트리거 토글 · 항목 선택(트리거 텍스트 갱신) · 바깥 클릭 · Esc · ↑↓ Home End
   - Tabs · Select Button · Chip · Tile · List(listbox) · Pagination · SideNav/TopBar 활성 전환
   - Slider(--p·값 표시) · Search(지우기) · DatePicker/Calendar(단일 · 기간 · 월, 달 · 연 이동, 두 달, 키보드, 직접 입력 · 오류, min/max, 하단 버튼 · 즉시 적용, 위로 펼침)
   - Checkbox 전체선택(indeterminate) · 약관 동의 · Data Table(정렬·행 선택·액션 바)
   - Notice 닫기 · Toast 액션/자동 소멸 · Popup 배경 클릭 닫기 · Accordion disabled
   - Tabs 패널 텍스트 · Breadcrumb .more 펼치기(data-items) · Onboard 단계 이동([data-step]) · 달력 프리셋([data-preset]) — 확정은 ds:date {value, start, end} · Text Field 글자 수(.counter) · 선택형 카드(.card-grid .card.clickable)
   ========================================================= */
(function () {
  "use strict";
  var doc = document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var closest = function (el, sel) { return el && el.closest ? el.closest(sel) : null; };
  var ICON = {
    "chevron-left": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6l6 6"/></svg>',
    "check": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10"/></svg>',
    "chevron-right": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6l-6 6"/></svg>',
  };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var fmt = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };

  /* ---------- 초기화 ---------- */
  function init(root) {
    root = root || doc;
    $$("input.mixed", root).forEach(function (i) { i.indeterminate = true; });
    $$(".slider input[type=range]", root).forEach(syncSlider);
    $$(".tbl th.check input, .checkbox-group > .checkbox:first-child input", root).forEach(syncMaster);
    $$(".terms", root).forEach(syncTerms);
    $$(".searchbar .clear", root).forEach(function (c) { var i = $("input", closest(c, ".searchbar")); if (i) c.hidden = !i.value; });
    $$(".toast-stack.fixed .toast[data-duration]", root).forEach(scheduleToast);
    $$(".field input[maxlength], .field textarea[maxlength]", root).forEach(syncCounter);
    /* Date Picker — 확정 값을 처음부터 data-* 에 둔다(필드 글자 · 정적 달력에서 읽어). 단독 달력만 host 다 */
    $$(".datepicker", root).forEach(function (h) { S(h); dpLink(h); });
    $$(".calendar", root).forEach(function (c) { if (!closest(c, ".datepicker")) S(c); });
  }

  /* ---------- Dropdown ---------- */
  /* 트리거 아래에 메뉴가 들어갈 자리가 없고 위가 더 넓으면 위로 뒤집는다(.up). 메뉴를 보이게 한 뒤에 재야 높이가 나온다 */
  function placeMenu(dd) {
    var menu = $(".menu", dd), t = $("[aria-haspopup]", dd);
    dd.classList.remove("up");
    if (!menu || !t) return;
    var r = t.getBoundingClientRect(), h = menu.offsetHeight, gap = 4;
    var below = window.innerHeight - r.bottom - gap, above = r.top - gap;
    if (below < h && above > below) dd.classList.add("up");
  }
  function setOpen(dd, open) {
    dd.classList.toggle("open", open);
    var t = $("[aria-haspopup]", dd); if (t) t.setAttribute("aria-expanded", String(open));
    if (open) { dd.dataset.dsOpened = "1"; placeMenu(dd); var items = itemsOf(dd); var sel = items.filter(function (i) { return i.classList.contains("on"); })[0]; var f = sel || items[0]; if (f) f.focus(); }
    else { delete dd.dataset.dsOpened; dd.classList.remove("up"); }
  }
  function itemsOf(dd) { return $$(".menu-item:not([aria-disabled=true])", dd).map(function (i) { if (!i.hasAttribute("tabindex")) i.tabIndex = -1; return i; }); }
  function selectItem(item) {
    var dd = closest(item, ".dropdown"), menu = closest(item, ".menu");
    if (menu && menu.getAttribute("role") === "listbox") {
      $$(".menu-item", menu).forEach(function (i) { i.classList.remove("on"); i.removeAttribute("aria-selected"); });
      item.classList.add("on"); item.setAttribute("aria-selected", "true");
      var t = dd && $(".trigger", dd);
      if (t) { var ph = $(".placeholder", t); if (ph) ph.remove(); t.textContent = item.textContent.trim(); }
    }
    if (dd) { setOpen(dd, false); var tr = $("[aria-haspopup]", dd); tr && tr.focus(); }
    fire(dd || item, "ds:select", { value: item.dataset.value || item.textContent.trim() });
  }

  /* ---------- Tabs · Select Button · Chip · Tile · List ---------- */
  function activate(group, itemSel, target, attr) {
    $$(itemSel, group).forEach(function (i) { var on = i === target; i.classList.toggle("on", on); if (attr) i.setAttribute(attr, String(on)); if (attr === "aria-selected") i.tabIndex = on ? 0 : -1; });
  }

  /* ---------- Pagination ---------- */
  function paginate(nav, btn) {
    var nums = $$("button:not([aria-label])", nav);
    var cur = nums.filter(function (b) { return b.classList.contains("on"); })[0];
    var idx = nums.indexOf(cur), next = btn;
    if (btn.getAttribute("aria-label") && !/^\d+$/.test(btn.textContent.trim())) {
      var label = btn.getAttribute("aria-label");
      var dir = /이전|prev/i.test(label) ? -1 : 1;
      next = nums[idx + dir]; if (!next) return;
    }
    nums.forEach(function (b) { var on = b === next; b.classList.toggle("on", on); on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"); });
    var i = nums.indexOf(next), arrows = $$("button[aria-label]", nav);
    if (arrows[0]) arrows[0].disabled = i === 0;
    if (arrows[1]) arrows[1].disabled = i === nums.length - 1;
    fire(nav, "ds:page", { page: Number(next.textContent) });
  }

  /* ---------- Slider ---------- */
  function syncSlider(input) {
    var min = Number(input.min || 0), max = Number(input.max || 100), v = Number(input.value);
    var p = max > min ? ((v - min) / (max - min)) * 100 : 0;
    input.style.setProperty("--p", p + "%");
    var wrap = closest(input, ".slider"), val = wrap && $(".val", wrap);
    if (val && !input.disabled) { var unit = val.dataset.unit || (val.textContent.match(/[^\d,.\s]+$/) || [""])[0]; val.dataset.unit = unit; val.textContent = v + unit; }
  }

  /* ---------- Date Picker · Calendar ----------
     상태가 단일 출처다(2026-10-27). 확정 값은 host(.datepicker 또는 단독 .calendar)의 data-value | data-start · data-end,
     초안 · 보이는 달 · 뷰 · 키보드 포커스 · 미리보기는 host._dp 에 둔다. 예전에는 기간의 시작을 보이는 달 격자의 .day.on 으로만
     기억해서, 달을 넘기면 격자가 다시 그려지며 시작이 사라졌다 — 다음 달에서 고른 종료일이 단일 날짜로 적용됐다.
     설정: data-mode(single · range · month) · data-min/max(YYYY-MM-DD | today) · data-footer("today reset cancel apply" | none)
           · data-calendars(1 · 2) · data-presets("7 30") · data-today(정적 데모의 오늘) */
  var DOW = ["일", "월", "화", "수", "목", "금", "토"];
  var FOOT = { today: ["text", "오늘"], reset: ["text", "초기화"], cancel: ["secondary", "취소"], apply: ["primary", "적용"] };
  var MSG = { format: "날짜 형식이 올바르지 않습니다. 예: ", min: " 이후 날짜를 입력하세요", max: " 이전 날짜를 입력하세요", order: "종료일이 시작일보다 빠릅니다" };
  var ymKey = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
  var firstOf = function (d) { return new Date(d.getFullYear(), d.getMonth(), 1); };
  var addDays = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  var monthTitle = function (d) { return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월"; };
  var dayLabel = function (d) { return monthTitle(d) + " " + d.getDate() + "일 " + DOW[d.getDay()] + "요일"; };
  /* 로컬 시간으로 엄격하게 읽는다 — new Date("YYYY-MM-DD") 는 UTC 라 음수 시간대에서 하루 앞으로 밀렸다. 2026-02-30 은 거부 */
  function parseYMD(s) { var m = /^(\d{4})[-./]?(\d{1,2})[-./]?(\d{1,2})$/.exec(String(s || "").trim()); if (!m) return null; var d = new Date(+m[1], +m[2] - 1, +m[3]); return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null; }
  function parseYM(s) { var m = /^(\d{4})[-./]?(\d{1,2})$/.exec(String(s || "").trim()); return m && +m[2] >= 1 && +m[2] <= 12 ? new Date(+m[1], +m[2] - 1, 1) : null; }
  /* 달을 옮기며 일은 그 달의 마지막 날로 자른다(1월 31일 → 2월 28일) */
  function addMonths(d, n) { var t = new Date(d.getFullYear(), d.getMonth() + n, 1); t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate())); return t; }
  function isPicker(host) { return host.classList.contains("datepicker"); }
  function dpHost(el) { return closest(el, ".datepicker") || closest(el, ".calendar"); }
  function calOf(host) {
    if (!isPicker(host)) return host;
    var cal = $(".calendar", host);
    if (!cal) { cal = doc.createElement("div"); cal.className = "calendar"; cal.setAttribute("role", "dialog"); cal.setAttribute("aria-modal", "true"); cal.setAttribute("aria-label", "날짜 선택"); host.appendChild(cal); }
    return cal;
  }
  function dpToday(host) { var n = new Date(); return parseYMD(host.getAttribute("data-today")) || new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function dpBound(host, k) { var v = host.getAttribute("data-" + k); return !v ? null : v === "today" ? dpToday(host) : parseYMD(v); }
  /* min · max 밖인가 — 달 · 연 뷰는 그 단위로 비교한다 */
  function outOf(host, d, unit) {
    var lo = dpBound(host, "min"), hi = dpBound(host, "max"), f = unit === "year" ? function (x) { return String(x.getFullYear()); } : unit === "month" ? ymKey : fmt;
    return !!((lo && f(d) < f(lo)) || (hi && f(d) > f(hi)));
  }
  function isOff(el) { return el.disabled || el.getAttribute("aria-disabled") === "true"; }
  function valText(mode, v) { if (!v || !v.a) return ""; return mode === "month" ? ymKey(v.a) : mode === "range" ? (v.b ? fmt(v.a) + " ~ " + fmt(v.b) : "") : fmt(v.a); }
  function readValue(host, mode) { var ds = host.dataset; return mode === "range" ? { a: parseYMD(ds.start), b: parseYMD(ds.end) } : { a: mode === "month" ? parseYM(ds.value) : parseYMD(ds.value), b: null }; }
  function writeValue(host, mode, v) {
    host.removeAttribute("data-value"); host.removeAttribute("data-start"); host.removeAttribute("data-end");
    if (mode === "range") { if (v.a && v.b) { host.dataset.start = fmt(v.a); host.dataset.end = fmt(v.b); } }
    else if (v.a) host.dataset.value = mode === "month" ? ymKey(v.a) : fmt(v.a);
  }
  /* host 의 상태. 처음 만질 때 옛 마크업(필드 글자 · 정적 달력의 .on)에서 값을 읽어 data-* 로 옮긴다 */
  function S(host) {
    if (host._dp) return host._dp;
    var btn = $(".field-btn", host), inp = $(".affix input", host), cal = isPicker(host) ? $(".calendar", host) : host, help = $(":scope > .help", host);
    var mode = host.dataset.mode || (btn && $(".sep", btn) ? "range" : !isPicker(host) && ($(".day.in-range", host) || $$(".day.on", host).length > 1) ? "range" : "single");
    var ph = btn && $(".placeholder", btn), st = host._dp = { mode: mode, view: mode === "month" ? "month" : "day", draft: null, month: null, focus: null, hover: null, opener: null, live: "" };
    st.ph = ph ? ph.textContent.trim() : null;
    st.help = host.getAttribute("data-help") || (help && !host.classList.contains("error") ? help.textContent : "");
    /* data-default-preset="7": 값이 없으면 오늘 기준 최근 N일을 처음 값으로 — 마크업의 날짜 글자는 스크립트 전의 자리 표시다.
       "최근 24시간" 이라는 이름만 있고 달력에는 기간이 없던 검색 툴바(사람의 결정 2026-10-27) */
    var dfp = Number(host.getAttribute("data-default-preset"));
    if (mode === "range" && dfp > 0 && !host.hasAttribute("data-start")) { var te = dpToday(host); writeValue(host, mode, { a: addDays(te, -(dfp - 1)), b: te }); display(host); }
    if (!host.hasAttribute("data-value") && !host.hasAttribute("data-start")) {
      var txt = btn ? btn.textContent : inp ? inp.value : "", ds = [], re = mode === "month" ? /(\d{4})-(\d{2})(?!-\d)/g : /(\d{4})-(\d{2})-(\d{2})/g, mm;
      while ((mm = re.exec(txt))) { var pd = mode === "month" ? parseYM(mm[0]) : parseYMD(mm[0]); if (pd) ds.push(pd); }   // 없는 날짜(2026-13-01)는 다른 날로 넘기지 않고 버린다
      if (!ds.length && cal) $$(".day.on[data-date]", cal).forEach(function (d) { ds.push(parseYMD(d.dataset.date)); });
      if (btn && !ds.length && !ph) st.label = btn.textContent.trim();   // "최근 24시간" 처럼 날짜가 아닌 이름 — 값이 없을 때 보인다
      if (ds[1] && ds[1] < ds[0]) ds.reverse();   // "끝 ~ 시작" 으로 적힌 글자도 기간으로
      writeValue(host, mode, { a: ds[0] || null, b: ds[1] || null });
    }
    if (!isPicker(host)) {
      st.draft = readValue(host, mode);
      var tt = $(".cal-title, .cal-head span", host), k = tt && tt.textContent.match(/(\d{4})년\s*(\d{1,2})월/);
      st.month = k ? new Date(+k[1], +k[2] - 1, 1) : firstOf(st.draft.a || dpToday(host));
    }
    return st;
  }
  /* 버튼형 필드의 <label> 은 버튼과 이어져 있지 않다 — 버튼 이름이 "시작일 2026-09-07" 이 되게 aria-labelledby 로 잇는다 */
  function dpLink(host) {
    var lab = $(":scope > label", host), btn = $(".field-btn", host);
    if (!lab || !btn || btn.hasAttribute("aria-labelledby")) return;
    var id = function (el, k) { if (!el.id) el.id = "dp-" + k + "-" + Math.random().toString(36).slice(2, 8); return el.id; };
    btn.setAttribute("aria-labelledby", id(lab, "l") + " " + id(btn, "b"));
  }
  function dpMonths(host) { var st = S(host); return st.view === "day" && st.mode === "range" && host.getAttribute("data-calendars") === "2" && !(window.matchMedia && window.matchMedia("(max-width:767px)").matches) ? 2 : 1; }
  function dpFoot(host) { var f = host.getAttribute("data-footer"); return f ? (f === "none" ? [] : f.split(/\s+/)) : S(host).mode === "single" ? ["today", "apply"] : ["apply"]; }
  function titleOf(host) {
    var st = S(host), m = st.month, y0 = m.getFullYear() - m.getFullYear() % 12;
    return st.view === "year" ? y0 + "–" + (y0 + 11) : st.view === "month" ? m.getFullYear() + "년" : dpMonths(host) === 2 ? monthTitle(m) + " – " + monthTitle(addMonths(m, 1)) : monthTitle(m);
  }
  function headHtml(which, title, unit, back) {
    var nav = function (d) { return '<button type="button" class="cal-nav" data-nav="' + d + '" aria-label="' + (d < 0 ? "이전 " : "다음 ") + unit + '">' + ICON[d < 0 ? "chevron-left" : "chevron-right"] + "</button>"; }, gap = '<span class="cal-nav-gap"></span>';
    return '<div class="cal-head">' + (which === "next" ? gap : nav(-1)) + '<button type="button" class="cal-title" aria-label="' + title + ", " + (back || "연도 선택") + '">' + title + "</button>" + (which === "prev" ? gap : nav(1)) + "</div>";
  }
  function dayGrid(host, mo, two) {
    var y = mo.getFullYear(), m = mo.getMonth(), off = new Date(y, m, 1).getDay(), rows = Math.ceil((off + new Date(y, m + 1, 0).getDate()) / 7);
    var h = '<div class="cal-grid" role="grid" aria-label="' + monthTitle(mo) + '"' + (S(host).mode === "range" ? ' aria-multiselectable="true"' : "") + '><div class="cal-week" role="row">' + DOW.map(function (d) { return '<span class="dow" role="columnheader" aria-label="' + d + '요일">' + d + "</span>"; }).join("") + "</div>";
    for (var r = 0; r < rows; r++) {
      h += '<div class="cal-week" role="row">';
      for (var c = 0; c < 7; c++) {
        var d = new Date(y, m, r * 7 + c - off + 1), muted = d.getMonth() !== m;
        /* 두 달 보기에서 다른 달 칸은 비운다 — 같은 날짜가 두 번 나오지 않게 */
        h += two && muted ? '<span class="day blank" role="gridcell"></span>' : '<button type="button" class="day' + (muted ? " muted" : "") + '" role="gridcell" data-date="' + fmt(d) + '" aria-label="' + dayLabel(d) + '" tabindex="-1"' + (outOf(host, d) ? ' aria-disabled="true"' : "") + ">" + d.getDate() + "</button>";
      }
      h += "</div>";
    }
    return h + "</div>";
  }
  function cellGrid(host, kind, mo) {
    var y = mo.getFullYear(), y0 = y - y % 12, h = '<div class="cal-grid ' + kind + '" role="grid" aria-label="' + (kind === "years" ? "연도 선택" : y + "년 월 선택") + '">';
    for (var r = 0; r < 4; r++) {
      h += '<div class="cal-week" role="row">';
      for (var c = 0; c < 3; c++) {
        var i = r * 3 + c, d = kind === "years" ? new Date(y0 + i, 0, 1) : new Date(y, i, 1);
        h += kind === "years" ? '<button type="button" class="cell" role="gridcell" data-year="' + (y0 + i) + '" tabindex="-1"' + (outOf(host, d, "year") ? ' aria-disabled="true"' : "") + ">" + (y0 + i) + "</button>"
          : '<button type="button" class="cell" role="gridcell" data-ym="' + ymKey(d) + '" aria-label="' + monthTitle(d) + '" tabindex="-1"' + (outOf(host, d, "month") ? ' aria-disabled="true"' : "") + ">" + (i + 1) + "월</button>";
      }
      h += "</div>";
    }
    return h + "</div>";
  }
  function footHtml(host) {
    var st = S(host), list = dpFoot(host), h = "", t = dpToday(host);
    if (st.mode === "range") (host.getAttribute("data-presets") || "").split(/\s+/).filter(Boolean).forEach(function (n) { var s = addDays(t, -(+n - 1)); h += '<button type="button" class="btn sm text" data-preset="' + n + '"' + (outOf(host, s) || outOf(host, t) ? " disabled" : "") + ">최근 " + n + "일</button>"; });
    ["today", "reset", "cancel", "apply"].forEach(function (k) { if (list.indexOf(k) < 0 || (k === "today" && st.mode !== "single")) return; h += '<button type="button" class="btn sm ' + FOOT[k][0] + '" data-cal="' + k + '"' + (k === "today" && outOf(host, t) ? " disabled" : "") + ">" + FOOT[k][1] + "</button>"; });
    return h ? '<div class="cal-foot">' + h + "</div>" : "";
  }
  /* 격자를 다시 그린다 — 달 · 뷰 · 달 수가 바뀔 때만. 고르기 · 미리보기 · 키 이동은 renderMarks 만 부른다(포인터 아래 DOM 을 갈지 않게) */
  function renderStructure(host) {
    var st = S(host), cal = calOf(host), act = doc.activeElement, key = cal.contains(act) ? focusKey(act) : null;
    var keep = !host.hasAttribute("data-footer") && !host.hasAttribute("data-presets") && $(":scope > .cal-foot", cal);   // data-footer 가 없으면 하단을 처음 그린(또는 옛 마크업이 직접 만든) 그대로 둔다
    var live = $(":scope > .sr-only[aria-live]", cal);   // 알림 영역은 같은 노드를 둔다 — 새로 넣은 live 영역은 대개 읽히지 않는다
    var n = dpMonths(host), h = "";
    cal.classList.toggle("two", n === 2);
    if (st.view === "day") {
      for (var i = 0; i < n; i++) { var mo = addMonths(st.month, i); h += (n === 2 ? '<div class="cal-month">' : "") + headHtml(n === 2 ? (i ? "next" : "prev") : "both", monthTitle(mo), "달") + dayGrid(host, mo, n === 2) + (n === 2 ? "</div>" : ""); }
      if (n === 2) h = '<div class="cal-months">' + h + "</div>";
    } else h += headHtml("both", titleOf(host), st.view === "month" ? "연도" : "12년", st.view === "year" ? (st.mode === "month" ? "월 선택으로" : "날짜로 돌아가기") : null) + cellGrid(host, st.view === "month" ? "months" : "years", st.month);
    h += keep ? "" : footHtml(host);
    if (!live) { live = doc.createElement("span"); live.className = "sr-only"; live.setAttribute("aria-live", "polite"); }
    cal.innerHTML = h;
    if (keep) cal.appendChild(keep);
    cal.appendChild(live); live.textContent = st.live;
    renderMarks(host);
    if (isPicker(host) && host.classList.contains("open")) place(host, true);   // 달 · 뷰가 바뀌면 높이가 달라진다 — 위로 펼친 달력이 필드를 덮지 않게
    if (key) { var back = key === "cell" ? null : $(key, cal); back ? back.focus() : focusActive(host); }
  }
  function focusKey(el) {
    if (closest(el, ".day, .cell")) return "cell";
    var b = closest(el, "button"); if (!b) return null;
    return b.dataset.nav ? '.cal-nav[data-nav="' + b.dataset.nav + '"]' : b.classList.contains("cal-title") ? ".cal-title" : b.dataset.cal ? '[data-cal="' + b.dataset.cal + '"]' : b.dataset.preset ? '[data-preset="' + b.dataset.preset + '"]' : null;
  }
  function focusActive(host) { var el = $('.cal-grid [tabindex="0"]', calOf(host)); if (el) el.focus(); }
  /* 선택 · 기간 · 미리보기 · 오늘 · 포커스 칸 표시만 갱신한다. 다른 달(흐린) 칸에는 기간 띠를 칠하지 않는다(사람의 결정 2026-10-27) */
  function renderMarks(host) {
    var st = S(host), cal = calOf(host), v = st.draft || {}, rg = st.mode === "range", today = fmt(dpToday(host));
    var a = v.a ? fmt(v.a) : null, b = rg && v.b ? fmt(v.b) : null, hv = rg && a && !b && st.hover && st.hover !== a ? st.hover : null;
    var lo = b ? a : hv ? (hv < a ? hv : a) : null, hi = b ? b : hv ? (hv < a ? a : hv) : null;
    $$(".day[data-date]", cal).forEach(function (d) {
      var k = d.dataset.date, muted = d.classList.contains("muted"), on = !muted && (k === a || k === b), mid = !muted && !!lo && k > lo && k < hi;   // 다른 달(흐린) 칸은 선택 · 띠를 칠하지 않는다(사람의 결정 2026-10-27)
      d.classList.toggle("on", on); d.classList.toggle("start", on && k === lo); d.classList.toggle("end", on && k === hi);
      d.classList.toggle("in-range", !!b && mid); d.classList.toggle("preview", !!hv && mid); d.classList.toggle("preview-end", k === hv); d.classList.toggle("today", k === today);
      if (on || (b && mid)) d.setAttribute("aria-selected", "true"); else d.removeAttribute("aria-selected");
      if (k === today) d.setAttribute("aria-current", "date"); else d.removeAttribute("aria-current");
    });
    var mon = v.a ? ymKey(v.a) : null, yr = v.a ? String(v.a.getFullYear()) : null;   // 연 · 월 칸의 선택은 고른 값만 — 보이는 달을 .on 으로 칠하면 고른 적 없는 달이 선택처럼 보였다
    $$(".cell", cal).forEach(function (c) {
      var on = c.dataset.ym ? c.dataset.ym === mon : c.dataset.year === yr;
      c.classList.toggle("on", on); on ? c.setAttribute("aria-selected", "true") : c.removeAttribute("aria-selected");
      c.classList.toggle("today", c.dataset.ym ? c.dataset.ym === today.slice(0, 7) : c.dataset.year === today.slice(0, 4));
    });
    /* 키보드 포커스는 격자 안 한 칸만(roving tabindex) — 포커스해 둔 칸 · 선택 · 오늘 · 그 달 첫 날 순 */
    var cells = $$(".cal-grid .day[data-date]:not(.muted), .cal-grid .cell", cal), f = st.focus;
    var pickCell = function (sel) { return cells.filter(function (c) { return c.matches(sel); })[0]; };
    var target = (f && pickCell('[data-date="' + f + '"],[data-ym="' + f + '"],[data-year="' + f + '"]')) || pickCell(".on") || pickCell(".today") || pickCell(':not([aria-disabled="true"])') || cells[0];
    $$(".cal-grid .day[data-date], .cal-grid .cell", cal).forEach(function (c) { c.tabIndex = c === target ? 0 : -1; });
    var ap = $('[data-cal="apply"]', cal); if (ap) ap.disabled = !!(rg && a && !b) || valText(st.mode, v) === valText(st.mode, readValue(host, st.mode));   // 끝이 없는 기간, 열기 전과 같은 값은 적용할 수 없다(사람의 결정 2026-10-27 — 값 지우기는 초기화의 일)
  }
  function setExpanded(host, open) { $$(".field-btn, .cal-btn", host).forEach(function (b) { b.setAttribute("aria-expanded", String(open)); }); }
  function openDP(host, opener) {
    var st = S(host), inp = $(".affix input", host);
    if (inp && inp.value.trim() !== valText(st.mode, readValue(host, st.mode))) typed(host);   // 열기 전에 친 글자를 먼저 반영한다
    st.draft = readValue(host, st.mode); st.view = st.mode === "month" ? "month" : "day"; st.hover = null; st.focus = null; st.opener = opener; st.live = "";
    var base = st.draft.a, lo = dpBound(host, "min"), hi = dpBound(host, "max");
    if (!base) { base = dpToday(host); if (hi && base > hi) base = hi; if (lo && base < lo) base = lo; }
    st.month = firstOf(base);
    host.classList.add("open"); host.dataset.dsOpened = "1"; setExpanded(host, true);
    /* 두 달 보기에서 다음 달이 통째로 max 밖이면 한 달 앞부터 — 오늘까지인 조회 기간이 빈 달을 보이지 않게 */
    if (dpMonths(host) === 2 && hi && ymKey(addMonths(st.month, 1)) > ymKey(hi)) st.month = addMonths(st.month, -1);
    renderStructure(host); place(host); focusActive(host);
  }
  function closeDP(host, restore) {
    var st = S(host);
    host.classList.remove("open", "up"); delete host.dataset.dsOpened; setExpanded(host, false);
    st.hover = null; st.draft = null;
    if (restore) { var o = st.opener || $(".field-btn, .cal-btn", host); if (o) o.focus(); }
  }
  /* 아래 자리가 모자라고 위가 더 넓으면 필드 위로(.up). 기준은 필드 상자 — 도움말이 달력을 밀지 않게. 오른쪽으로 넘치면 왼쪽으로 당긴다 */
  function place(host, keep) {
    var cal = calOf(host), anchor = $(".field-btn", host) || $(".affix", host) || host, hr = host.getBoundingClientRect(), r = anchor.getBoundingClientRect(), h = cal.offsetHeight, w = cal.offsetWidth, gap = 4;
    var below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = keep ? host.classList.contains("up") : below < h && above > below, vw = doc.documentElement.clientWidth;   // 열린 뒤에는 방향을 바꾸지 않고 높이만 다시 잰다
    host.classList.toggle("up", up);
    host.style.setProperty("--dp-top", (up ? r.top - hr.top - gap - h : r.bottom - hr.top + gap) + "px");
    host.style.setProperty("--dp-left", Math.max(8 - hr.left, Math.min(0, vw - 8 - w - hr.left)) + "px");
  }
  function commit(host) {
    var st = S(host), v = st.draft || { a: null, b: null };
    if (st.mode === "range" && v.a && !v.b) return false;
    writeValue(host, st.mode, v); display(host); clearError(host);
    var t = valText(st.mode, v) || null, both = st.mode === "range" && v.a && v.b;
    fire(host, "ds:date", st.mode === "range" ? { value: t, start: both ? fmt(v.a) : null, end: both ? fmt(v.b) : null } : { value: t });
    return true;
  }
  function display(host) {
    var st = S(host), v = readValue(host, st.mode), t = valText(st.mode, v), inp = $(".affix input", host), btn = $(".field-btn", host);
    if (inp) { inp.value = t; return; }
    if (!btn) return;
    var svg = $("svg", btn); btn.textContent = "";
    if (!t) { if (st.label) btn.appendChild(doc.createTextNode(st.label + " ")); else { var p = doc.createElement("span"); p.className = "placeholder"; p.textContent = st.ph || "날짜 선택"; btn.appendChild(p); } }
    else if (st.mode === "range") { btn.appendChild(doc.createTextNode(fmt(v.a) + " ")); var sep = doc.createElement("span"); sep.className = "sep"; sep.textContent = "~"; btn.appendChild(sep); btn.appendChild(doc.createTextNode(" " + fmt(v.b) + " ")); }
    else btn.appendChild(doc.createTextNode(t + " "));
    if (svg) btn.appendChild(svg);
  }
  /* 고르기 — 기간은 첫 클릭이 시작, 둘째 클릭이 끝(앞이면 바꾼다). 하단에 적용이 없으면 고르는 순간 적용하고 닫는다 */
  function pick(host, k) {
    var st = S(host), d = parseYMD(k), v = st.draft || {};
    if (!d || outOf(host, d)) return;
    st.draft = st.mode !== "range" || !v.a || v.b ? { a: d, b: null } : d < v.a ? { a: d, b: v.a } : { a: v.a, b: d };
    st.hover = null; st.focus = k;
    if ((st.mode !== "range" || st.draft.b) && dpFoot(host).indexOf("apply") < 0) { commit(host); if (isPicker(host)) { closeDP(host, true); return; } }
    var last = addMonths(st.month, dpMonths(host) - 1);
    if (ymKey(d) < ymKey(st.month) || ymKey(d) > ymKey(last)) { st.month = ymKey(d) < ymKey(st.month) ? firstOf(d) : firstOf(addMonths(firstOf(d), -(dpMonths(host) - 1))); st.live = titleOf(host); renderStructure(host); }   // 다른 달(흐린) 날을 고르면 그 달로 넘어간다
    else renderMarks(host);
  }
  function pickCell(host, el) {
    var st = S(host);
    if (isOff(el)) return;
    if (el.dataset.year) { st.month = new Date(+el.dataset.year, st.month.getMonth(), 1); setView(host, "month"); return; }
    var d = parseYM(el.dataset.ym);
    if (st.mode !== "month") { st.month = d; setView(host, "day"); return; }
    st.draft = { a: d, b: null }; st.focus = el.dataset.ym;
    if (dpFoot(host).indexOf("apply") < 0) { commit(host); if (isPicker(host)) { closeDP(host, true); return; } }
    renderMarks(host);
  }
  function setView(host, view) { var st = S(host); st.view = view; st.focus = view === "month" ? ymKey(st.month) : view === "year" ? String(st.month.getFullYear()) : null; st.live = titleOf(host); renderStructure(host); }   // 연 · 월 화면은 보던 달(연)에서 시작한다
  function nav(host, dir) {
    var st = S(host), m = st.month;
    st.month = st.view === "day" ? new Date(m.getFullYear(), m.getMonth() + dir, 1) : new Date(m.getFullYear() + dir * (st.view === "month" ? 1 : 12), m.getMonth(), 1);
    st.focus = null; st.live = titleOf(host); renderStructure(host);
  }
  function preset(host, n) {
    var st = S(host), e = dpToday(host);
    st.draft = { a: addDays(e, -(n - 1)), b: e }; st.hover = null; commit(host);
    if (isPicker(host)) { closeDP(host, true); return; }
    st.month = firstOf(e); st.focus = fmt(e); st.view = "day"; renderStructure(host);
  }
  function foot(host, kind) {
    var st = S(host);
    if (kind === "apply") { if (commit(host) && isPicker(host)) closeDP(host, true); return; }
    if (kind === "cancel") { if (isPicker(host)) closeDP(host, true); else { st.draft = readValue(host, st.mode); renderMarks(host); } return; }
    if (kind === "today") { var t = dpToday(host); st.draft = { a: t, b: null }; st.focus = fmt(t); if (st.view !== "day" || ymKey(t) !== ymKey(st.month)) { st.view = "day"; st.month = firstOf(t); renderStructure(host); } else renderMarks(host); }
    if (kind === "reset") { st.draft = { a: null, b: null }; st.hover = null; renderMarks(host); }
    if (dpFoot(host).indexOf("apply") < 0) { commit(host); if (isPicker(host)) closeDP(host, true); }
  }
  /* 키보드(WAI-ARIA 날짜 선택 대화상자): ←→ 하루 · ↑↓ 일주일 · PageUp/Down 달(Shift 연) · Home/End 주의 처음 · 끝 · Esc 닫고 필드로 · Tab 은 달력 안에서 돈다 */
  function calKey(e, host) {
    var st = S(host), cal = calOf(host), k = e.key, open = isPicker(host) && host.classList.contains("open");
    if (k === "Escape") { if (!open) return false; e.preventDefault(); closeDP(host, true); return true; }
    if (k === "Tab" && open) {
      var f = $$("button", cal).filter(function (b) { return !b.disabled && b.tabIndex >= 0 && b.offsetParent !== null; }), i = f.indexOf(doc.activeElement);
      if (e.shiftKey ? i <= 0 : i === f.length - 1) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
      return true;
    }
    var cell = closest(e.target, ".day[data-date], .cell"); if (!cell) return false;
    var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: st.view === "day" ? -7 : -3, ArrowDown: st.view === "day" ? 7 : 3 }[k], n = null;
    if (st.view === "day") {
      var d = parseYMD(cell.dataset.date);
      n = step ? addDays(d, step) : k === "PageUp" ? addMonths(d, e.shiftKey ? -12 : -1) : k === "PageDown" ? addMonths(d, e.shiftKey ? 12 : 1) : k === "Home" ? addDays(d, -d.getDay()) : k === "End" ? addDays(d, 6 - d.getDay()) : null;
      n = n && fmt(n);
    } else if (st.view === "month") {
      var mm = parseYM(cell.dataset.ym), x = step ? new Date(mm.getFullYear(), mm.getMonth() + step, 1) : k === "PageUp" ? new Date(mm.getFullYear() - 1, mm.getMonth(), 1) : k === "PageDown" ? new Date(mm.getFullYear() + 1, mm.getMonth(), 1) : k === "Home" ? new Date(mm.getFullYear(), 0, 1) : k === "End" ? new Date(mm.getFullYear(), 11, 1) : null;
      n = x && ymKey(x);
    } else {
      var yy = +cell.dataset.year, y0 = yy - yy % 12;
      n = step ? yy + step : k === "PageUp" ? yy - 12 : k === "PageDown" ? yy + 12 : k === "Home" ? y0 : k === "End" ? y0 + 11 : null;
      n = n && String(n);
    }
    if (!n) return false;
    e.preventDefault(); moveFocus(host, n); return true;
  }
  function moveFocus(host, key) {
    var st = S(host), cal = calOf(host), before = st.month.getTime();
    if (st.view === "day") {
      var d = parseYMD(key), last = addMonths(st.month, dpMonths(host) - 1);
      if (ymKey(d) < ymKey(st.month)) st.month = firstOf(d); else if (ymKey(d) > ymKey(last)) st.month = firstOf(addMonths(firstOf(d), -(dpMonths(host) - 1)));
      if (st.mode === "range" && st.draft && st.draft.a && !st.draft.b) st.hover = key;   // 키보드로도 기간을 미리 본다
    } else if (st.view === "month") { if (+key.slice(0, 4) !== st.month.getFullYear()) st.month = new Date(+key.slice(0, 4), 0, 1); }
    else { var y0 = st.month.getFullYear() - st.month.getFullYear() % 12; if (+key < y0 || +key > y0 + 11) st.month = new Date(+key, st.month.getMonth(), 1); }
    st.focus = key;
    if (st.month.getTime() !== before) { st.live = titleOf(host); renderStructure(host); } else renderMarks(host);
    var el = $('.cal-grid [data-date="' + key + '"]:not(.muted), .cal-grid [data-ym="' + key + '"], .cal-grid [data-year="' + key + '"]', cal); if (el) el.focus();
  }
  /* 직접 입력 — Enter · 포커스가 필드를 떠날 때 검사한다. 틀리면 값은 그대로 두고 오류 테두리 + 원인과 고치는 법 */
  function typed(host) {
    var st = S(host), inp = $(".affix input", host); if (!inp) return true;
    var mode = st.mode, s = inp.value.trim(), parts = !s ? [] : mode === "range" ? s.split(/\s*~\s*/) : [s], ds = parts.map(mode === "month" ? parseYM : parseYMD);
    var f = mode === "month" ? ymKey : fmt, lo = dpBound(host, "min"), hi = dpBound(host, "max"), err = null;
    if ((mode === "range" && parts.length && parts.length !== 2) || ds.some(function (d) { return !d; })) err = MSG.format + (mode === "month" ? "2026-09" : mode === "range" ? "2026-09-01 ~ 2026-09-07" : "2026-09-07");
    else if (ds[1] && ds[1] < ds[0]) err = MSG.order;
    else if (lo && ds.some(function (d) { return f(d) < f(lo); })) err = f(lo) + MSG.min;
    else if (hi && ds.some(function (d) { return f(d) > f(hi); })) err = f(hi) + MSG.max;
    if (err) { setError(host, err); return false; }
    var was = st.draft; st.draft = { a: ds[0] || null, b: ds[1] || null };
    if (valText(mode, st.draft) !== valText(mode, readValue(host, mode)) || host.classList.contains("error")) commit(host); else display(host);
    if (!host.classList.contains("open")) st.draft = was;
    else { st.focus = null; if (st.draft.a) st.month = firstOf(st.draft.a); renderStructure(host); }   // 연 채로 입력해 확정하면 달력도 그 값으로
    return true;
  }
  function setError(host, msg) {
    var inp = $(".affix input", host), help = $(":scope > .help", host);
    if (!help) { help = doc.createElement("span"); help.className = "help"; help.id = (inp && inp.id ? inp.id : "dp" + Math.random().toString(36).slice(2, 8)) + "-help"; ($(".affix", host) || host.lastChild).after(help); }
    help.textContent = msg; host.classList.add("error");
    if (inp) { inp.setAttribute("aria-invalid", "true"); var ids = (inp.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean); if (help.id && ids.indexOf(help.id) < 0) inp.setAttribute("aria-describedby", ids.concat(help.id).join(" ")); }
  }
  function clearError(host) {
    if (!host.classList.contains("error")) return;
    var st = S(host), inp = $(".affix input", host), help = $(":scope > .help", host);
    host.classList.remove("error"); if (inp) inp.removeAttribute("aria-invalid");
    if (help) { if (st.help) help.textContent = st.help; else help.remove(); }
  }
  /* 달력 안 클릭 — 처리했으면 true */
  function calClick(cal, t) {
    var host = dpHost(cal), st = S(host), el;
    if (!st.month) st.month = firstOf(dpToday(host));
    if ((el = closest(t, ".cal-nav, .cal-head button:not(.cal-title)"))) { nav(host, +el.dataset.nav || (/이전|prev/i.test(el.getAttribute("aria-label") || "") ? -1 : 1)); return true; }
    if ((el = closest(t, ".cal-title"))) { setView(host, st.view === "year" ? (st.mode === "month" ? "month" : "day") : "year"); return true; }
    if ((el = closest(t, ".day[data-date]"))) { if (!isOff(el)) pick(host, el.dataset.date); return true; }
    if ((el = closest(t, ".cell"))) { pickCell(host, el); return true; }
    if ((el = closest(t, "[data-preset]"))) { if (!el.disabled) preset(host, Number(el.dataset.preset) || 7); return true; }
    if ((el = closest(t, "[data-cal]"))) { if (!el.disabled) foot(host, el.dataset.cal); return true; }
    return false;
  }

  /* ---------- 체크박스 전체 선택 · 약관 · 테이블 ---------- */
  function syncMaster(master) {
    var childs = childrenOf(master); if (!childs.length) return;
    var n = childs.filter(function (c) { return c.checked; }).length;
    master.checked = n === childs.length; master.indeterminate = n > 0 && n < childs.length; master.classList.toggle("mixed", master.indeterminate);
  }
  function childrenOf(master) {
    var th = closest(master, "th.check");
    if (th) { var tbl = closest(th, "table"); return $$("tbody td.check input", tbl); }
    var lab = closest(master, ".checkbox"), sib = lab && lab.nextElementSibling;
    if (sib && sib.classList.contains("checkbox-group")) return $$("input[type=checkbox]", sib);
    return [];
  }
  function syncRow(input) {
    var tr = closest(input, "tr"); if (tr) tr.classList.toggle("on", input.checked);
    var wrap = closest(input, ".tbl-wrap"), tbl = closest(input, "table");
    var master = tbl && $("th.check input", tbl); if (master) syncMaster(master);
    var bar = wrap && $(".action-bar", wrap);
    if (bar) { var n = $$("tbody td.check input:checked", tbl).length; var b = $("b", bar); if (b) b.textContent = n + "개 선택"; bar.hidden = n === 0; }
  }
  function syncTerms(terms) {
    var all = $(".all input", terms), items = $$(".item input[type=checkbox]", terms); if (!items.length) return;
    if (all) { var n = items.filter(function (i) { return i.checked; }).length; all.checked = n === items.length; all.indeterminate = n > 0 && n < items.length; all.classList.toggle("mixed", all.indeterminate); }
    var next = $(".btn-group .btn.primary", terms);
    if (next) next.disabled = !items.every(function (i) { var it = closest(i, ".item"); return !$(".req", it) || i.checked; });
  }
  function sortTable(th) {
    var table = closest(th, "table"), tbody = $("tbody", table); if (!tbody) return;
    var ths = $$("thead th", table), col = ths.indexOf(th);
    var desc = th.classList.contains("sorted") && !th.classList.contains("desc");
    ths.forEach(function (h) { h.classList.remove("sorted", "desc"); h.removeAttribute("aria-sort"); });
    th.classList.add("sorted"); if (desc) th.classList.add("desc"); th.setAttribute("aria-sort", desc ? "descending" : "ascending");
    var rows = $$("tr", tbody).filter(function (r) { return !$("td.empty", r); });
    var val = function (r) { var c = r.children[col]; var t = c ? c.textContent.trim() : ""; var n = parseFloat(t.replace(/[,\s%]/g, "")); return isNaN(n) || !/^-?[\d,.]+\s*%?$/.test(t) ? t : n; };
    rows.sort(function (a, b) { var x = val(a), y = val(b); var c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "ko"); return desc ? -c : c; });
    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  /* ---------- Toast ---------- */
  function scheduleToast(t) { var d = Number(t.dataset.duration || 4000); if (d > 0) setTimeout(function () { dismiss(t); }, d); }
  function dismiss(el) { if (!el) return; el.style.transition = "opacity 160ms"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 170); }
  /** 프로그램에서 토스트 띄우기: DS.toast("저장됨", {tone:"danger", action:{label, onClick}, duration}) */
  function toast(message, o) {
    o = o || {};
    var stack = $(".toast-stack.fixed");
    if (!stack) { stack = doc.createElement("div"); stack.className = "toast-stack fixed"; stack.setAttribute("aria-live", "polite"); doc.body.appendChild(stack); }
    var t = doc.createElement("div"); t.className = "toast" + (o.tone === "danger" ? " danger" : ""); t.dataset.duration = String(o.duration == null ? 4000 : o.duration);
    var ic = o.tone === "danger" ? '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/>' : '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>';
    t.innerHTML = '<span class="ico"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic + "</svg></span>";
    t.appendChild(doc.createTextNode(message));
    if (o.action) { var b = doc.createElement("button"); b.type = "button"; b.className = "action"; b.textContent = o.action.label; b.addEventListener("click", function () { o.action.onClick && o.action.onClick(); dismiss(t); }); t.appendChild(b); }
    while (stack.children.length >= (o.max || 3)) stack.firstElementChild.remove();
    stack.appendChild(t); scheduleToast(t); return t;
  }

  /* ---------- Popup ---------- */
  /** DS.popup.open("#id") / DS.popup.close(): .popup 요소를 배경과 함께 표시 */
  var popup = {
    open: function (sel) {
      var el = typeof sel === "string" ? $(sel) : sel; if (!el) return;
      var bd = doc.createElement("div"); bd.className = "popup-backdrop"; bd.dataset.dsPopup = "1";
      el.dataset.dsHome = "1"; var ph = doc.createComment("popup"); el.parentNode.insertBefore(ph, el); el._dsPlaceholder = ph;
      bd.appendChild(el); doc.body.appendChild(bd); doc.body.style.overflow = "hidden";
      var f = $("button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])", el); f && f.focus();
    },
    close: function () {
      var bd = $(".popup-backdrop[data-ds-popup]"); if (!bd) return;
      var el = $(".popup", bd); if (el && el._dsPlaceholder) { el._dsPlaceholder.parentNode.replaceChild(el, el._dsPlaceholder); delete el._dsPlaceholder; }
      bd.remove(); doc.body.style.overflow = "";
    },
  };

  /* ---------- Text Field 카운터 · Onboard 단계 ---------- */
  function syncCounter(input) {
    var f = closest(input, ".field"), c = f && $(".counter", f); if (!c) return;
    var max = Number(input.getAttribute("maxlength")); c.textContent = input.value.length + (max > 0 ? " / " + max : "");
  }
  function stepTo(board, dir) {
    var steps = $$(".steps li", board); if (!steps.length) return;
    var cur = steps.findIndex(function (li) { return li.classList.contains("on"); }); if (cur < 0) cur = 0;
    var next = Math.max(0, Math.min(steps.length - 1, cur + dir)); if (next === cur) return;
    steps.forEach(function (li, i) {
      li.classList.toggle("done", i < next); li.classList.toggle("on", i === next);
      i === next ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current");
      var ic = $("i", li); if (ic) { if (i < next) { if (!ic.dataset.num) ic.dataset.num = ic.textContent.trim() || String(i + 1); ic.innerHTML = ICON.check; } else if (ic.dataset.num) ic.textContent = ic.dataset.num; }
    });
    var prev = $('[data-step="prev"]', board), nx = $('[data-step="next"]', board);
    if (prev) prev.disabled = next === 0; if (nx) nx.disabled = next === steps.length - 1;
    fire(board, "ds:step", { step: next });
  }

  function fire(el, name, detail) { if (el) el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); }

  /* ---------- 이벤트 위임 ---------- */
  doc.addEventListener("click", function (e) {
    var t = e.target; if (!(t instanceof Element)) return;
    var el;
    // Anatomy 데모(.anat)는 정적 — 열림/선택 동작 없음
    if (closest(t, ".anat")) { if (closest(t, 'a[href="#"]')) e.preventDefault(); return; }
    // 데모용 # 링크는 이동하지 않음
    var a = closest(t, 'a[href="#"]'); if (a) e.preventDefault();

    // Dropdown 트리거
    if ((el = closest(t, ".dropdown [aria-haspopup]")) && !el.disabled) { var dd = closest(el, ".dropdown"); setOpen(dd, !dd.classList.contains("open")); return; }
    if ((el = closest(t, ".menu-item"))) { if (el.getAttribute("aria-disabled") === "true") return; selectItem(el); return; }

    // Tabs
    if ((el = closest(t, ".tabs .tab")) && !el.disabled) { var tabs = closest(el, ".tabs"); activate(tabs, ".tab", el, "aria-selected"); var pn = tabs.nextElementSibling; if (pn && pn.classList.contains("tab-panel") && !pn.hasAttribute("data-static")) pn.textContent = el.textContent.trim().replace(/\s*\d+$/, "") + " 탭의 내용이 여기에 표시됩니다."; fire(el, "ds:tab"); return; }
    // Breadcrumb 펼치기
    if ((el = closest(t, ".breadcrumb .more"))) { var li = closest(el, "li"), items = (el.dataset.items || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean); if (li && items.length) { var first = null; items.forEach(function (s) { var n = doc.createElement("li"); var a2 = doc.createElement("a"); a2.href = "#"; a2.textContent = s; n.appendChild(a2); li.parentNode.insertBefore(n, li); if (!first) first = a2; }); var ol = li.parentNode; li.remove(); /* 버튼이 사라지니 포커스를 펼친 첫 링크로 — 안 옮기면 body 로 떨어진다 */ if (first) first.focus(); fire(ol, "ds:expand", { items: items }); } return; }
    // Onboard 단계
    if ((el = closest(t, ".onboard [data-step]")) && !el.disabled) { stepTo(closest(el, ".onboard"), el.dataset.step === "prev" ? -1 : 1); return; }
    // 선택형 카드 (데모 링크)
    if ((el = closest(t, ".card-grid .card.clickable")) && !el.disabled) { $$(".card.clickable", closest(el, ".card-grid")).forEach(function (c) { var on = c === el; c.classList.toggle("on", on); /* 선택은 .on 만으로는 보조기기에 전해지지 않는다 */ if (c.tagName === "BUTTON") c.setAttribute("aria-pressed", on ? "true" : "false"); }); fire(el, "ds:select", { value: (el.querySelector(".title") || el).textContent.trim() }); return; }
    // Select Button
    if ((el = closest(t, ".select-btn > button")) && !el.disabled) { activate(closest(el, ".select-btn"), "button", el, "aria-pressed"); fire(el, "ds:select"); return; }
    // Chip
    if ((el = closest(t, ".chip .x"))) { if (el.getAttribute("aria-disabled") !== "true") dismiss(closest(el, ".chip")); return; }   // 비활성 입력값 칩은 지우지 않는다 — CSS pointer-events 만 믿으면 보조기술의 클릭이 지운다
    if ((el = closest(t, "button.chip[aria-pressed]")) && !el.disabled) { var on = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", on); el.setAttribute("aria-pressed", String(on)); return; }
    // Tile
    if ((el = closest(t, ".tile[aria-pressed]")) && !el.disabled) { var grid = closest(el, ".tile-grid"), single = grid && grid.dataset.single !== undefined; if (single) activate(grid, ".tile", el, "aria-pressed"); else { var o2 = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", o2); el.setAttribute("aria-pressed", String(o2)); } return; }
    // List listbox
    if ((el = closest(t, '.list[role=listbox] > li[role=option]'))) { activate(closest(el, ".list"), "li", el, "aria-selected"); return; }
    // Pagination
    if ((el = closest(t, ".pagination button")) && !el.disabled) { paginate(closest(el, ".pagination"), el); return; }
    // SideNav · TopBar 활성
    if ((el = closest(t, ".sidenav a, .topbar nav a"))) { var nav = closest(el, ".sidenav, .topbar nav"); $$("a", nav).forEach(function (x) { x.classList.toggle("on", x === el); x.classList.remove("has-on"); x === el ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"); });
      // 하위 항목을 고르면 바로 위 부모가 .has-on — 접힌 레일은 하위 항목을 숨기므로 부모가 선택 모양과 aria-current="true" 를 이어받는다
      if (el.classList.contains("sub")) { var par = el.previousElementSibling; while (par && par.matches("a.sub")) par = par.previousElementSibling; if (par && par.tagName === "A") { par.classList.add("has-on"); if (nav.classList.contains("collapsed")) par.setAttribute("aria-current", "true"); } }
      return; }
    // Search 지우기
    if ((el = closest(t, ".searchbar .clear"))) { var inp = $("input", closest(el, ".searchbar")); if (inp) { inp.value = ""; inp.focus(); inp.dispatchEvent(new Event("input", { bubbles: true })); } return; }
    // DatePicker · Calendar
    if ((el = closest(t, ".datepicker .field-btn, .datepicker .cal-btn")) && !el.disabled) { var dp = closest(el, ".datepicker"); if (dp.classList.contains("open")) closeDP(dp, false); else openDP(dp, el); return; }
    if ((el = closest(t, ".calendar")) && calClick(el, t)) return;
    // Notice · Toast
    if ((el = closest(t, ".notice .close"))) { dismiss(closest(el, ".notice")); return; }
    if ((el = closest(t, ".toast .action"))) { dismiss(closest(el, ".toast")); return; }
    // Popup 배경
    if (t.classList.contains("popup-backdrop")) { popup.close(); return; }
    if ((el = closest(t, ".popup [data-popup-close]"))) { popup.close(); return; }
    if ((el = closest(t, "[data-popup-open]"))) { popup.open(el.getAttribute("data-popup-open")); return; }
    // Accordion disabled
    if ((el = closest(t, ".accordion.disabled summary"))) { e.preventDefault(); return; }
  });

  // 바깥 클릭: 사용자가 연 Dropdown / DatePicker 닫기
  doc.addEventListener("pointerdown", function (e) {
    $$(".dropdown.open[data-ds-opened]").forEach(function (dd) { if (!dd.contains(e.target)) setOpen(dd, false); });
    $$(".datepicker.open[data-ds-opened]").forEach(function (dp) { if (!dp.contains(e.target)) closeDP(dp, false); });   // 바깥 클릭은 초안을 버리고 포커스는 옮기지 않는다
  }, true);

  /* Loading 버튼과 비활성 링크 버튼: pointer-events:none 는 마우스만 막고 키보드 Enter/Space 는 그대로 click 을 쏜다.
     버튼 자신에 달린 핸들러가 타깃 단계에서 먼저 실행되므로 버블이 아니라 캡처 단계에서 막아야 한다. */
  doc.addEventListener("click", function (e) {
    if (closest(e.target, '.btn.loading,.btn[aria-disabled="true"]')) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  doc.addEventListener("keydown", function (e) {
    var dd = closest(e.target, ".dropdown.open");
    // Date Picker · Calendar — 달력 안 키보드, 입력형 필드의 Enter(확정) · Alt+↓(열기)
    var kc = closest(e.target, ".calendar");
    if (kc && calKey(e, dpHost(kc))) return;
    var di = closest(e.target, ".datepicker .affix input");
    if (di) { var dh = closest(di, ".datepicker");
      if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); typed(dh); return; }   // 한글 조합 중 Enter 는 조합 확정이다
      if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); var cb = $(".cal-btn", dh); if (!dh.classList.contains("open") && cb && !cb.disabled) openDP(dh, cb); return; } }
    if (e.key === "Escape") { var dpo = closest(e.target, ".datepicker.open"); if (dpo) { closeDP(dpo, true); return; }   // 포커스가 든 피커 하나만
      $$(".dropdown.open[data-ds-opened]").forEach(function (d) { setOpen(d, false); var tr = $("[aria-haspopup]", d); tr && tr.focus(); }); if ($(".popup-backdrop[data-ds-popup]")) popup.close(); return; }
    if (dd && ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].indexOf(e.key) >= 0) {
      var items = itemsOf(dd), i = items.indexOf(doc.activeElement); if (!items.length) return;
      var n = e.key === "ArrowDown" ? (i + 1) % items.length : e.key === "ArrowUp" ? (i - 1 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
      if (n >= 0) { e.preventDefault(); items[n].focus(); }
      else if (i >= 0) { e.preventDefault(); selectItem(items[i]); }
      return;
    }
    // Tabs 방향키
    var tab = closest(e.target, ".tabs .tab");
    if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(e.key) >= 0) {
      var tabs = $$(".tab:not([disabled])", closest(tab, ".tabs")), ti = tabs.indexOf(tab);
      var tn = e.key === "ArrowLeft" ? (ti - 1 + tabs.length) % tabs.length : e.key === "ArrowRight" ? (ti + 1) % tabs.length : e.key === "Home" ? 0 : tabs.length - 1;
      e.preventDefault(); tabs[tn].focus(); activate(closest(tab, ".tabs"), ".tab", tabs[tn], "aria-selected");
    }
  });

  /* 기간 미리보기 — 시작만 고른 동안 포인터가 올라간 날까지 띠를 미리 보인다 */
  var dpHover = null;
  doc.addEventListener("pointerover", function (e) {
    var day = closest(e.target, ".calendar .day[data-date]"), host = day && dpHost(day);
    if (dpHover && dpHover !== host) { var hs = S(dpHover); if (hs.hover) { hs.hover = null; renderMarks(dpHover); } dpHover = null; }
    if (!host || !host._dp) return;
    var st = host._dp, want = st.mode === "range" && st.draft && st.draft.a && !st.draft.b && !isOff(day) ? day.dataset.date : null;
    if (st.hover !== want) { st.hover = want; renderMarks(host); }
    dpHover = want ? host : null;
  });
  /* 입력형 Date Picker — 포커스가 필드 밖(달력 · 달력 버튼은 안)으로 나가면 친 글자를 검사한다 */
  doc.addEventListener("focusout", function (e) {
    var host = closest(e.target, ".datepicker"), inp = host && $(".affix input", host); if (!inp || inp.readOnly || inp.disabled) return;
    if (e.relatedTarget && host.contains(e.relatedTarget)) return;   // 필드 안(달력 버튼 · 달력)에서 옮기는 동안은 기다린다 — 입력칸 → 달력 버튼 → 바깥으로 Tab 해도 검사한다
    typed(host);
  });

  doc.addEventListener("input", function (e) {
    var t = e.target; if (!(t instanceof Element)) return;
    if (t.matches(".slider input[type=range]")) { syncSlider(t); fire(t, "ds:slide", { value: Number(t.value) }); }
    if (t.matches(".field input[maxlength], .field textarea[maxlength]")) syncCounter(t);
    if (t.matches(".searchbar input")) { var sb = closest(t, ".searchbar"), clr = $(".clear", sb); if (clr) clr.hidden = !t.value; }
  });
  doc.addEventListener("change", function (e) {
    var t = e.target; if (!(t instanceof Element) || t.type !== "checkbox") return;
    var kids = childrenOf(t);
    if (kids.length) { kids.forEach(function (c) { c.checked = t.checked; var tr = closest(c, "tr"); if (tr) tr.classList.toggle("on", c.checked); }); t.indeterminate = false; t.classList.remove("mixed"); }
    if (closest(t, "td.check")) syncRow(t); else if (closest(t, "th.check")) syncRow(kids[0] || t);
    else { var group = closest(t, ".checkbox-group"); var master = group && group.previousElementSibling && $("input", group.previousElementSibling); if (master && childrenOf(master).length) syncMaster(master); }
    var terms = closest(t, ".terms"); if (terms) { if (closest(t, ".all")) $$(".item input[type=checkbox]", terms).forEach(function (i) { i.checked = t.checked; }); syncTerms(terms); }
  });
  doc.addEventListener("click", function (e) {
    var th = closest(e.target, ".tbl th.sortable"); if (th) sortTable(th);
  });

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { init(); }); else init();
  window.DS = { init: init, toast: toast, popup: popup, version: "0.5" };
})();
