/* =========================================================
   ds.js — JS Design System 컴포넌트 동작 스크립트 (순수 JS, 의존성 없음)
   assets/style.css 의 클래스 마크업에 동작을 붙인다. 이벤트 위임 방식이라 동적으로 추가된 마크업에도 적용.
   사용: <script src="assets/ds.js" defer></script>  (React 제품은 @jiran/ds-react 를 쓰고 이 파일은 불필요)
   - Dropdown / Select: 트리거 토글 · 항목 선택(트리거 텍스트 갱신) · 바깥 클릭 · Esc · ↑↓ Home End
   - Tabs · Select Button · Chip · Tile · List(listbox) · Pagination · SideNav/TopBar 활성 전환
   - Slider(--p·값 표시) · Search(지우기) · DatePicker/Calendar(입력 'YYYY. MM. DD' 자동 형식 · ↑↓ 조각 이동, 단위 연 · 월 · 일, 단일 · 기간(두 달), locale(Intl) · timezone(dayjs 가 있으면), 유효하지 않은 값 상태, 달 · 연 이동, 키보드, min/max, 하단 버튼 · 즉시 적용, 위로 펼침)
   - Checkbox 전체선택(indeterminate) · 약관 동의 · Data Table(정렬·행 선택·액션 바)
   - Notice 닫기 · Toast 액션/자동 소멸 · Popup 배경 클릭 닫기 · Accordion disabled
   - Tabs 패널 텍스트 · Breadcrumb .more 펼치기(data-items) · Onboard 단계 이동([data-step]) · 달력 프리셋([data-preset]) — 확정은 ds:date {value, start, end, date, text, validity, 기간은 sides} · Text Field 글자 수(.counter) · 선택형 카드(.card-grid .card.clickable)
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
  /* 잘린 경로만 Tooltip 을 단다 — title 은 키보드로 볼 수 없다(P6, 사람의 결정 2026-11-10). 글자가 전부 보이는 항목에는 달지 않고, 링크가 아닌 항목은 잘렸을 때만 포커스를 받는다.
     문구는 화면 글자와 같아 aria-describedby 로 잇지 않는다(두 번 읽힘). 글꼴이 늦게 와 폭이 바뀌므로 fonts.ready 뒤에 다시 잰다 */
  function fitCrumbs(root) {
    $$(".breadcrumb li>a:not(.icon), .breadcrumb li>span:not(.tooltip-wrap)", root || doc).forEach(function (el) {
      if (el.scrollWidth <= el.clientWidth) return;
      var w = doc.createElement("span"), tip = doc.createElement("span");
      w.className = "tooltip-wrap"; tip.className = "tooltip multi"; tip.setAttribute("role", "tooltip"); tip.textContent = el.textContent;
      el.parentNode.insertBefore(w, el); w.appendChild(el); w.appendChild(tip);
      if (el.tagName !== "A") el.tabIndex = 0;
    });
  }
  function init(root) {
    doc.fonts.ready.then(function () { fitCrumbs(root); });
    $$(".number-field input", root || doc).forEach(numSync);
    dsLive();   // 알림 영역은 미리 — 복사하는 순간 새로 넣으면 대개 읽히지 않는다
    root = root || doc;
    $$("input.mixed", root).forEach(function (i) { i.indeterminate = true; });
    $$(".slider input[type=range]", root).forEach(syncSlider);
    $$(".tabs[role=tablist]", root).forEach(function (b) { tabSync(b); var on = $(".tab.on", b); if (on) tabReveal(on); });
    $$(".select-btn[role=radiogroup]", root).forEach(function (g) { var kids = $$(":scope > button", g), live = kids.filter(function (b) { return !b.disabled; }), cur = live.filter(function (b) { return b.classList.contains("on"); })[0] || live[0]; kids.forEach(function (b) { b.tabIndex = b === cur ? 0 : -1; }); });
    $$(".chip-group", root).forEach(syncChipReset);
    $$(".tbl th.check input, .checkbox-group > .checkbox:first-child input", root).forEach(syncMaster);
    $$(".terms", root).forEach(syncTerms);
    $$(".searchbar .clear", root).forEach(function (c) { var i = $("input", closest(c, ".searchbar")); if (i) c.hidden = !i.value; });
    $$(".combobox", root).forEach(cbInit);
    $$(".dropdown .trigger .placeholder", root).forEach(function (p) { closest(p, ".trigger").dataset.placeholder = p.textContent; });
    $$(".searchbar kbd", root).forEach(function (k) { var i = $("input", closest(k, ".searchbar")); if (i) k.hidden = !!i.value; });
    $$(".toast-stack.fixed .toast[data-duration]", root).forEach(scheduleToast);
    $$(".field input[maxlength], .field textarea[maxlength], .field [data-maxlength]", root).forEach(syncCounter);
    $$(".field [data-maxlength]", root).forEach(vHelp);
    $$("form[data-validate]", root).forEach(function (f) { f.noValidate = true; vFields(f).forEach(vHelp); });
    /* Date Picker — 확정 값을 처음부터 data-* 에 둔다(필드 글자 · 정적 달력에서 읽어). 단독 달력만 host 다 */
    $$(".datepicker", root).forEach(function (h) { S(h); });
    $$(".calendar", root).forEach(function (c) { if (!closest(c, ".datepicker")) S(c); });
  }

  /* ---------- Dropdown ---------- */
  /* 트리거 아래에 메뉴가 들어갈 자리가 없고 위가 더 넓으면 위로 뒤집는다(.up). 메뉴를 보이게 한 뒤에 재야 높이가 나온다 */
  function placeMenu(dd) {
    var menu = $(".menu", dd), t = $("[aria-haspopup], .control", dd);
    dd.classList.remove("up", "float");
    if (!menu || !t) return;
    var r = t.getBoundingClientRect(), h = menu.offsetHeight, w = menu.offsetWidth, gap = 4;
    var below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = below < h && above > below;
    if (up) dd.classList.add("up");
    if (inClipper(dd)) {   // 표처럼 스크롤되는 영역 안 — 화면 기준으로 띄운다
      dd.style.setProperty("--float-x", Math.max(8, Math.min(menu.getBoundingClientRect().left, window.innerWidth - w - 8)) + "px");
      dd.style.setProperty("--float-y", (up ? r.top - gap - h : r.bottom + gap) + "px");
      dd.style.setProperty("--float-w", w + "px");
      dd.classList.add("float");
    }
  }
  function inClipper(el) { for (var p = el.parentElement; p && p !== doc.body; p = p.parentElement) { var c = getComputedStyle(p); if (/auto|scroll|hidden|clip/.test(c.overflowX + c.overflowY)) return true; } return false; }
  /* 띄운 메뉴는 트리거를 따라가지 못하므로 스크롤 · 창 크기 변경에 닫는다. 메뉴 자신의 스크롤은 그대로 */
  function closeFloats(e) {
    $$(".tooltip.float").forEach(function (tip) { var w = tip.parentNode; if (!w._dsTip) return; if (e.type === "scroll" && w.contains(doc.activeElement)) placeTip(w); else w.classList.add("quiet"); });   // 포커스로 온 툴팁은 따라간다 — 포커스가 일으킨 스크롤에 사라지면 키보드로는 볼 수 없다
    $$(".dropdown.float.open, .combobox.float.open").forEach(function (d) {
      if (e.type === "scroll" && $(".menu", d).contains(e.target)) return;
      if (d.matches(".combobox")) { cbOpen(d, false); return; }
      setOpen(d, false); var tr = $("[aria-haspopup]", d); if (tr) tr.focus({ preventScroll: true });
    });
  }
  function setOpen(dd, open) {
    dd.classList.toggle("open", open);
    var t = $("[aria-haspopup]", dd); if (t) t.setAttribute("aria-expanded", String(open));
    if (open) { dd.dataset.dsOpened = "1"; placeMenu(dd); var items = itemsOf(dd); var sel = items.filter(function (i) { return i.classList.contains("on"); })[0]; var f = sel || items[0] || $(".menu-state button", dd); if (f) f.focus(); }
    else { delete dd.dataset.dsOpened; dd.classList.remove("up", "float"); vTouch(dd); }
  }
  /* 글자로 항목 찾기 — 0.5초 안의 글자를 이어 붙이고, 같은 글자를 반복하면 다음 항목으로. 'ㅂ' 은 초성으로 '보안팀' 에 맞는다 */
  var CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  function cho(s) { return s.replace(/[가-힣]/g, function (c) { return CHO[Math.floor((c.charCodeAt(0) - 44032) / 588)]; }); }
  function typeahead(dd, key) {
    var ta = dd._dsType || (dd._dsType = { s: "", t: 0 }), now = Date.now(); if (now - ta.t > 500) ta.s = ""; ta.t = now; ta.s += key.toLowerCase();
    var rep = ta.s.split("").every(function (c) { return c === ta.s[0]; }), q = rep ? ta.s[0] : ta.s, items = itemsOf(dd), i = items.indexOf(doc.activeElement), from = rep ? i + 1 : Math.max(i, 0);
    return items.slice(from).concat(items.slice(0, from)).filter(function (x) { var l = x.textContent.trim().toLowerCase(); return l.indexOf(q) === 0 || cho(l).indexOf(q) === 0; })[0];
  }
  function itemsOf(dd) { return $$(".menu-item:not([aria-disabled=true])", dd).map(function (i) { if (!i.hasAttribute("tabindex")) i.tabIndex = -1; return i; }); }
  function selectItem(item) {
    var dd = closest(item, ".dropdown"), menu = closest(item, ".menu");
    if (menu && menu.getAttribute("role") === "listbox") {
      $$(".menu-item", menu).forEach(function (i) { i.classList.remove("on"); i.removeAttribute("aria-selected"); });
      var val = item.dataset.value, clearing = val === "";   // '선택 안 함'(값 "") — placeholder 로 돌아간다
      if (!clearing) { item.classList.add("on"); item.setAttribute("aria-selected", "true"); }
      var t = dd && $(".trigger", dd);
      if (t) { if (clearing && t.dataset.placeholder) { t.textContent = ""; var ps = doc.createElement("span"); ps.className = "placeholder"; ps.textContent = t.dataset.placeholder; t.appendChild(ps); } else t.textContent = item.textContent.trim(); }
      var hid = dd && dd.getAttribute("data-name") && $("input[type=hidden]", dd); if (hid) hid.value = clearing ? "" : val != null ? val : item.textContent.trim();
    }
    if (dd) { setOpen(dd, false); var tr = $("[aria-haspopup]", dd); tr && tr.focus(); }
    fire(dd || item, "ds:select", { value: item.dataset.value != null ? item.dataset.value : item.textContent.trim() });
  }

  /* ---------- Tabs · Select Button · Chip · Tile · List ---------- */
  function activate(group, itemSel, target, attr) {
    $$(itemSel, group).forEach(function (i) { var on = i === target; i.classList.toggle("on", on); if (attr) i.setAttribute(attr, String(on)); if (attr === "aria-selected" || attr === "aria-checked") i.tabIndex = on ? 0 : -1; });
  }

  /* ---------- Tabs ---------- */
  var tabUid = 0;
  function tabReveal(tab) {   // 탭 줄만 옮긴다 — scrollIntoView 는 페이지까지 움직인다
    var bar = closest(tab, ".tabs"); if (bar.scrollWidth <= bar.clientWidth) return;
    var b = bar.getBoundingClientRect(), r = tab.getBoundingClientRect(), edge = 16;
    if (r.left < b.left + edge) bar.scrollLeft -= b.left + edge - r.left; else if (r.right > b.right - edge) bar.scrollLeft += r.right - b.right + edge;
  }
  function tabSync(bar) {   // Tab 키 멈춤은 고른 탭 하나 + 패널 — 다음 탭으로 가지 않는다
    var all = $$(".tab", bar), on = $(".tab.on", bar) || all.filter(function (x) { return !x.disabled; })[0]; if (!on) return;
    all.forEach(function (x) { x.tabIndex = x === on ? 0 : -1; });
    var linked = false;
    all.forEach(function (x) { var p = doc.getElementById(x.getAttribute("aria-controls") || ""); if (p) { linked = true; p.hidden = x !== on; p.tabIndex = 0; } });   // 숨기기만 한다 — 안의 입력은 남는다
    if (linked) return;
    var pn = bar.nextElementSibling;
    if (pn && pn.classList.contains("tab-panel")) { if (!on.id) on.id = "ds-tab-" + (++tabUid); pn.setAttribute("aria-labelledby", on.id); pn.tabIndex = 0; }
  }
  function tabPick(el) {
    var bar = closest(el, ".tabs"), pn = bar.nextElementSibling; activate(bar, ".tab", el, "aria-selected");
    if (!el.hasAttribute("aria-controls") && pn && pn.classList.contains("tab-panel") && !pn.hasAttribute("data-static")) pn.textContent = el.textContent.trim().replace(/\s*\d+$/, "") + " 탭의 내용이 여기에 표시됩니다.";
    tabSync(bar); tabReveal(el); fire(el, "ds:tab");
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
    if (btn.disabled) next.focus();   // 끝에 닿아 꺼진 화살표에 포커스가 남으면 키보드가 갈 곳을 잃는다
    fire(nav, "ds:page", { page: Number(next.textContent) });
    var tg = nav.dataset.target && $(nav.dataset.target);
    if (tg) { if (!tg.hasAttribute("tabindex")) tg.tabIndex = -1; tg.focus({ preventScroll: true }); tg.scrollIntoView({ block: "start" }); }
  }

  /* ---------- Slider ---------- */
  function syncSlider(input) {
    var min = Number(input.min || 0), max = Number(input.max || 100), v = Number(input.value);
    var p = max > min ? ((v - min) / (max - min)) * 100 : 0;
    input.style.setProperty("--p", p + "%");
    var wrap = closest(input, ".slider"), val = wrap && $(".val", wrap);
    if (val && !input.disabled) { var unit = val.dataset.unit || (val.textContent.match(/[^\d,.\s]+$/) || [""])[0]; val.dataset.unit = unit; val.textContent = v + unit; if (unit) input.setAttribute("aria-valuetext", v + unit); }
  }

  /* ---------- Date Picker · Calendar ----------
     상태가 단일 출처다(2026-10-27). 확정 값은 host(.datepicker 또는 단독 .calendar)의 data-value | data-start · data-end — 기계 형식(YYYY-MM-DD · YYYY-MM · YYYY),
     초안 · 보이는 달 · 뷰 · 키보드 포커스 · 미리보기는 host._dp 에 둔다. 예전에는 기간의 시작을 보이는 달 격자의 .day.on 으로만
     기억해서, 달을 넘기면 격자가 다시 그려지며 시작이 사라졌다 — 다음 달에서 고른 종료일이 단일 날짜로 적용됐다.
     2026-11-09 개편(사람의 요청): 필드는 Text Field 입력 하나(.datepicker.field) — 숫자를 치면 'YYYY. MM. DD' 로 끊어 채우고, ↑↓ 는 커서가 놓인 조각 ±1(min/max 를 보지 않는다).
       값이 늘 유효하지는 않다 — 미완성 · 없는 날짜는 값을 비우고, 범위 밖 · 순서는 값을 그 날짜로 둔 채 data-validity 와 ds:date 의 validity 로 알린다.
     설정: data-unit(year · month · day) · data-range(기간 — 달력 기본 2개, data-calendars="1" 이나 767px 이하에서 1개) · data-locale(기본 ko-KR, Intl 표기)
           · data-timezone(기본 환경 시간대 — IANA 이름 · UTC 는 dayjs + utc · timezone 플러그인이 실렸을 때) · data-min/max(YYYY-MM-DD | today)
           · data-footer("today reset cancel apply" | none) · data-presets("7 30") · data-today(정적 데모의 오늘)
           · data-labels(JSON — Intl 이 만들지 못하는 문구를 바꾼다. 키는 React labels 와 같고 recent 는 "최근 {n}일")
           · data-messages(JSON — 오류 문구. 키 · 자리표시는 React messages 와 같다)
           · data-max-days(기간의 최대 길이 — 양끝 포함 일수, 일 단위 기간만. 달력은 시작을 고르면 그 밖의 날짜를 막고 키보드 입력은 받아서 validity "long" 으로 알린다)
           · data-time(시각까지 — 일 단위 피커만. 값 'YYYY-MM-DD HH:mm', 필드 'YYYY. MM. DD HH:mm', 24시간제. data-time="seconds" 면 초까지) */
  var FOOT = { today: "text", reset: "text", cancel: "outline assistive", apply: "solid primary" };
  /* 문구 — 사람의 결정(2026-11-09): 다른 언어로 쓸 때 data-labels 로 바꾼다. '오늘' 의 기본은 Intl.RelativeTimeFormat */
  var LABELS = { dialog: "날짜 선택", reset: "초기화", cancel: "취소", apply: "적용", prevMonth: "이전 달", nextMonth: "다음 달", prevYear: "이전 연도", nextYear: "다음 연도", prevYears: "이전 12년", nextYears: "다음 12년", chooseYear: "연도 선택", yearGrid: "연도 목록", backToDays: "날짜로 돌아가기", backToMonths: "월 선택으로", recent: "최근 {n}일", time: "시각", startTime: "시작 시각", endTime: "종료 시각" };
  var labelWarned = {};
  function dpLabels(host) {
    var raw = host.getAttribute("data-labels"), o = {}, out = {}, k;
    if (raw) try { o = JSON.parse(raw) || {}; } catch (e) { if (!labelWarned[raw]) { labelWarned[raw] = 1; if (window.console) console.warn("[ds.js] data-labels 가 JSON 이 아닙니다 — 기본 문구를 씁니다: " + raw); } }
    for (k in LABELS) out[k] = LABELS[k];
    out.today = todayLabel(host);
    for (k in o) if (typeof o[k] === "string") out[k] = o[k];
    return out;
  }
  /* 오류 문구 — Writing 규칙(무엇이 일어났는지 + 어떻게 하면 되는지), 범위는 '부터 · 까지'(그 날짜를 포함). 사람의 결정(2026-11-09).
     자리표시 {subject} {example} {min} {max} — 어순이 다른 언어도 쓸 수 있게. 다른 언어 기본값은 두지 않고 data-messages 로 넣는다.
     {subject} 는 기간에서 한쪽만 틀렸으면 그 쪽(startSubject · endSubject), 아니면 subject. 자리표시가 없는 문자열은 옛 조합(앞말 + 예시 · 날짜 + 꼬리말) */
  var MSG = { incomplete: "{subject} 덜 입력됐습니다. {example} 처럼 끝까지 입력하세요.", invalid: "{subject} 달력에 없습니다. 달력에서 고르거나 {example} 처럼 입력하세요.", min: "{subject} 범위를 벗어났습니다. {min} 부터 입력할 수 있습니다.", max: "{subject} 범위를 벗어났습니다. {max} 까지 입력할 수 있습니다.", order: "종료일이 시작일보다 빠릅니다. 시작일과 같거나 늦은 날짜로 바꾸세요.", subject: "날짜가", startSubject: "시작일이", endSubject: "종료일이", long: "기간이 {days}일을 넘습니다. {days}일 이내로 고르세요.", invalidTime: "{subject} 잘못됐습니다. {example} 처럼 24시간제로 입력하세요.", orderTime: "종료 시각이 시작 시각보다 빠릅니다. 시작과 같거나 늦은 시각으로 바꾸세요.", timeSubject: "시각이", startTimeSubject: "시작 시각이", endTimeSubject: "종료 시각이" };
  function dpMessages(host) {
    var raw = host.getAttribute("data-messages"), o = {}, out = {}, k;
    if (raw) try { o = JSON.parse(raw) || {}; } catch (e) { if (!labelWarned[raw]) { labelWarned[raw] = 1; if (window.console) console.warn("[ds.js] data-messages 가 JSON 이 아닙니다 — 기본 문구를 씁니다: " + raw); } }
    for (k in MSG) out[k] = MSG[k];
    for (k in o) if (typeof o[k] === "string") out[k] = o[k];
    return out;
  }
  function say(M, key, x) {
    var t = M[key];
    if (t.indexOf("{") < 0) return key.indexOf("order") === 0 || key === "long" ? t : key === "min" || key === "max" ? x[key] + t : t + x.example;
    return t.replace(/\{(\w+)\}/g, function (m, k) { return x[k] != null ? x[k] : m; });
  }
  var EXAMPLE = { second: "2026. 09. 07 14:30:05", minute: "2026. 09. 07 14:30", day: "2026. 09. 07", month: "2026. 09", year: "2026" }, DIGITS = { second: 14, minute: 12, day: 8, month: 6, year: 4 };
  var ymKey = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
  var firstOf = function (d) { return new Date(d.getFullYear(), d.getMonth(), 1); };
  var addDays = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  /* 단위의 키(기계 형식)와 필드 표기 — 표기는 locale 과 무관하게 연 · 월 · 일 순서(사람의 결정 2026-11-09) */
  var clockOf = function (d, unit) { return pad(d.getHours()) + ":" + pad(d.getMinutes()) + (unit === "second" ? ":" + pad(d.getSeconds()) : ""); };
  var keyOf = function (d, unit) { return unit === "year" ? String(d.getFullYear()) : unit === "month" ? ymKey(d) : unit === "minute" || unit === "second" ? fmt(d) + " " + clockOf(d, unit) : fmt(d); };
  var showOf = function (d, unit) { return unit === "year" ? String(d.getFullYear()) : unit === "minute" || unit === "second" ? showOf(d, "day") + " " + clockOf(d, unit) : d.getFullYear() + ". " + pad(d.getMonth() + 1) + (unit === "month" ? "" : ". " + pad(d.getDate())); };
  /* 양끝을 포함한 일수 — 시각은 보지 않는다(같은 날이면 1). UTC 로 재서 일광 절약 시간의 23 · 25시간 날에 흔들리지 않게 */
  function spanDays(a, b) { return Math.abs(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 864e5 + 1; }
  function dpMaxDays(host) { var st = S(host), n = Number(host.getAttribute("data-max-days")); return n > 0 && st.mode === "range" && st.unit === "day" ? n : 0; }
  /* 글자의 단위 — 달력은 st.unit(일)로 일하고, 필드 글자 · 값은 시각까지 */
  function tu(st) { return st.time || st.unit; }
  var unitStart = function (d, unit) { return unit === "year" ? new Date(d.getFullYear(), 0, 1) : unit === "month" ? firstOf(d) : d; };
  var baseView = function (unit) { return unit === "year" ? "year" : unit === "month" ? "month" : "day"; };
  /* 로컬 시간으로 엄격하게 읽는다 — new Date("YYYY-MM-DD") 는 UTC 라 음수 시간대에서 하루 앞으로 밀렸다. 2026-02-30 은 거부.
     구분자는 - . / 와 공백(2026-09-07 · 2026. 09. 07 · 2026/9/7 · 20260907) */
  /* 구분자가 있거나 자리를 다 붙여 쓴다 — 구분자를 생략 가능하게 두었더니 "2026. 11" 을 2026-1-1 로 읽었다(2026-11-09) */
  function parseYMD(s) { var m = /^(\d{4})(?:[-./\s]+(\d{1,2})[-./\s]+(\d{1,2})|(\d{2})(\d{2}))\.?$/.exec(String(s || "").trim()); if (!m) return null; if (m[4]) { m[2] = m[4]; m[3] = m[5]; } var d = new Date(+m[1], +m[2] - 1, +m[3]); return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null; }
  function parseYM(s) { var m = /^(\d{4})(?:[-./\s]+(\d{1,2})|(\d{2}))\.?$/.exec(String(s || "").trim()); if (m && m[3]) m[2] = m[3]; return m && +m[2] >= 1 && +m[2] <= 12 ? new Date(+m[1], +m[2] - 1, 1) : null; }
  function parseY(s) { var m = /^(\d{4})\.?$/.exec(String(s || "").trim()); return m ? new Date(+m[1], 0, 1) : null; }
  /* 날짜 + 시각 — 조각 수가 정확해야 한다(시각 없는 날짜는 값이 아니다 — 사람의 결정 2026-11-10) */
  function parseDT(s, sec) {
    var g = String(s || "").match(/\d+/g) || [];
    if (g.length === 1) { var x = g[0]; if (x.length !== (sec ? 14 : 12)) return null; g = [x.slice(0, 4), x.slice(4, 6), x.slice(6, 8), x.slice(8, 10), x.slice(10, 12)].concat(sec ? [x.slice(12)] : []); }
    if (g.length !== (sec ? 6 : 5) || g[0].length !== 4) return null;
    var d = parseYMD(g[0] + "-" + g[1] + "-" + g[2]), h = +g[3], m = +g[4], c = sec ? +g[5] : 0;
    if (!d || h > 23 || m > 59 || c > 59) return null;
    d.setHours(h, m, c, 0); return d;
  }
  function parseUnit(s, unit) { return unit === "year" ? parseY(s) : unit === "month" ? parseYM(s) : unit === "minute" ? parseDT(s, false) : unit === "second" ? parseDT(s, true) : parseYMD(s); }
  function parseAny(s) { return parseYMD(s) || parseYM(s) || parseY(s); }
  /* 달을 옮기며 일은 그 달의 마지막 날로 자른다(1월 31일 → 2월 28일) */
  function addMonths(d, n) { var t = new Date(d.getFullYear(), d.getMonth() + n, 1); t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate())); return t; }
  function isPicker(host) { return host.classList.contains("datepicker"); }
  function dpHost(el) { return closest(el, ".datepicker") || closest(el, ".calendar"); }
  function calOf(host) {
    if (!isPicker(host)) return host;
    var cal = $(".calendar", host);
    if (!cal) { cal = doc.createElement("div"); cal.className = "calendar"; cal.setAttribute("role", "dialog"); cal.setAttribute("aria-modal", "true"); cal.setAttribute("aria-label", dpLabels(host).dialog); host.appendChild(cal); }
    return cal;
  }
  /* 표기 — Intl 이 지원하는 언어는 import 없이(사람의 요구 2026-11-09). 잘못된 태그는 ko-KR 로 */
  var INTL = {};
  function intl(loc, o) { var k = loc + JSON.stringify(o); return INTL[k] || (INTL[k] = new Intl.DateTimeFormat(loc, o)); }
  function dpLocale(host) { var l = host.getAttribute("data-locale"); if (!l) return "ko-KR"; try { intl(l, {}); return l; } catch (e) { return "ko-KR"; } }
  var monthTitle = function (host, d) { return intl(dpLocale(host), { year: "numeric", month: "long" }).format(d); };
  var dayLabel = function (host, d) { return intl(dpLocale(host), { dateStyle: "full" }).format(d); };
  function dows(host) { var loc = dpLocale(host), n = intl(loc, { weekday: "narrow" }), l = intl(loc, { weekday: "long" }), out = []; for (var i = 0; i < 7; i++) { var wd = new Date(2024, 0, 7 + i); out.push([n.format(wd), l.format(wd)]); } return out; }   // 2024-01-07 은 일요일
  function todayLabel(host) { try { var s = new Intl.RelativeTimeFormat(dpLocale(host), { numeric: "auto" }).format(0, "day"); return s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { return "오늘"; } }
  /* 기준 시간대 — '오늘'이 어느 날인지와 ds:date 의 date(그 시간대의 0시)를 정한다. 날짜 자체(data-value)는 시간대와 무관한 달력 날짜다.
     IANA 이름 · UTC 는 dayjs(MIT) + utc · timezone 플러그인으로 계산한다 — 없거나 이름이 틀리면 환경 시간대(경고 한 번) */
  var tzWarned = {};
  function dj() { var D = window.dayjs; if (!D || !window.dayjs_plugin_utc || !window.dayjs_plugin_timezone) return null; if (!D.tz) { D.extend(window.dayjs_plugin_utc); D.extend(window.dayjs_plugin_timezone); } return D; }
  function dpZone(host) {
    var z = host.getAttribute("data-timezone"); if (!z) return null;
    var ok = !!dj(); if (ok) { try { new Intl.DateTimeFormat("en-US", { timeZone: z }); } catch (e) { ok = false; } }
    if (!ok && !tzWarned[z]) { tzWarned[z] = 1; if (window.console) console.warn("[ds.js] data-timezone=\"" + z + "\" 을 쓸 수 없어 환경 시간대로 계산합니다 — dayjs · utc · timezone 플러그인이 실렸는지, IANA 이름인지 보세요."); }
    return ok ? z : null;
  }
  function instant(host, d) { var z = dpZone(host), t = S(host).time; return z ? dj().tz(keyOf(d, t || "day"), z).toDate() : t ? new Date(d.getTime()) : new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dpToday(host) {
    var t = parseYMD(host.getAttribute("data-today")); if (t) return t;
    var z = dpZone(host); if (z) return parseYMD(dj()().tz(z).format("YYYY-MM-DD"));
    var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function dpUnit(host) { var u = host.getAttribute("data-unit"); return u === "year" || u === "month" ? u : "day"; }
  /* 시각까지 쓰는 피커의 범위 — 시각을 적었으면 그 순간, 날짜만이면 그 하루 전체(max 는 그날 끝까지) */
  function dpBound(host, k) {
    var v = host.getAttribute("data-" + k); if (!v) return null;
    if (v.indexOf(":") >= 0) return parseDT(v, v.split(":").length > 2);
    var d = v === "today" ? dpToday(host) : parseAny(v);
    if (d && k === "max" && S(host).time) { d = new Date(d.getTime()); d.setHours(23, 59, 59, 0); }
    return d;
  }
  /* min · max 밖인가 — 달 · 연 칸은 그 단위로 비교한다 */
  function outOf(host, d, unit) {
    var lo = dpBound(host, "min"), hi = dpBound(host, "max"), f = function (x) { return keyOf(x, unit || "day"); };
    return !!((lo && f(d) < f(lo)) || (hi && f(d) > f(hi)));
  }
  function isOff(el) { return el.disabled || el.getAttribute("aria-disabled") === "true"; }
  function valText(host, v) { var st = S(host); if (!v || !v.a) return ""; var u = tu(st); return st.mode === "range" ? (v.b ? showOf(v.a, u) + " ~ " + showOf(v.b, u) : "") : showOf(v.a, u); }
  function readValue(host) { var ds = host.dataset, u = tu(S(host)); return S(host).mode === "range" ? { a: parseUnit(ds.start, u), b: parseUnit(ds.end, u) } : { a: parseUnit(ds.value, u), b: null }; }
  function writeValue(host, v) {
    var st = S(host);
    host.removeAttribute("data-value"); host.removeAttribute("data-start"); host.removeAttribute("data-end");
    var u = tu(st);
    if (st.mode === "range") { if (v.a && v.b) { host.dataset.start = keyOf(v.a, u); host.dataset.end = keyOf(v.b, u); } }
    else if (v.a) host.dataset.value = keyOf(v.a, u);
  }
  function setValidity(host, validity) { var st = S(host); st.validity = validity; host.dataset.validity = validity; }   // 유효 · 빈 값도 적는다 — React 와 같다

  /* 입력 글자 — 숫자열을 조각으로(연 4 · 월 2 · 일 2). 월 첫 자리가 2~9 · 일 첫 자리가 4~9 면 앞에 0 을 붙여 그 조각을 끝낸다(9 → 09).
     기간은 앞 날짜가 다 차면 ' ~ ' 뒤로 넘어간다 */
  var LENS = { year: [4], month: [4, 2], day: [4, 2, 2], minute: [4, 2, 2, 2, 2], second: [4, 2, 2, 2, 2, 2], clock: [2, 2], clockS: [2, 2, 2] };
  var isClock = function (unit) { return unit === "clock" || unit === "clockS"; };
  function joinSeg(s, unit) { return isClock(unit) ? s.join(":") : s.slice(0, 3).join(". ") + (s.length > 3 ? " " + s.slice(3).join(":") : ""); }
  function groups(dg, unit, range) {
    var lens = LENS[unit], off = isClock(unit) ? 3 : 0, lim = ["", "1", "3", "2", "5", "5"], max = range ? 2 : 1, sides = [], cur = [], g = "", gi = 0;   // lim — 그 칸의 첫 자리로 쓸 수 있는 가장 큰 숫자(월 · 일 · 시 · 분 · 초)
    for (var i = 0; i < dg.length && sides.length < max; i++) {
      var c = dg.charAt(i);
      if (g === "" && lim[gi + off] && c > lim[gi + off]) g = "0";
      g += c;
      if (g.length === lens[gi]) { cur.push(g); g = ""; gi++; if (gi === lens.length) { sides.push(cur); cur = []; gi = 0; } }
    }
    if (g) cur.push(g);
    if (cur.length && sides.length < max) sides.push(cur);
    return sides.map(function (s) { return joinSeg(s, unit); }).join(" ~ ");
  }
  /* 붙여넣기 · 마크업 값 — 구분자로 나뉜 조각은 자리를 채운다(2026/9/7 → 2026. 09. 07). 친 글자에는 쓰지 않는다: 치는 중인 '2026. 09. 3' 을 3일로 확정하지 않게 */
  function pasteText(s, unit, range) {
    return groups(String(s || "").split("~").slice(0, range ? 2 : 1).map(function (p) {
      var g = p.match(/\d+/g) || [];
      return g.length > 1 ? g[0] + g.slice(1).map(function (x) { return x.length === 1 ? "0" + x : x; }).join("") : g.join("");
    }).join(""), unit, range);
  }
  /* 입력 검사 — 빈 · 미완성 · 없는 날짜 · 순서 · min · max · 유효 */
  function check(host, text) {
    var st = S(host), unit = tu(st), rg = st.mode === "range", s = String(text || "").trim();
    if (!s) return { validity: "empty", a: null, b: null };
    var parts = rg ? s.split(/\s*~\s*/) : [s]; if (rg && parts.length < 2) parts.push("");
    /* 자릿수가 모자라면 미완성 — 치는 중인 "2026. 09. 3" 을 3일로 확정하지 않는다 */
    var sides = parts.slice(0, rg ? 2 : 1).map(function (p) { var dg = p.replace(/\D/g, ""); if (dg.length < DIGITS[unit]) return { v: "incomplete" }; var d = parseUnit(p, unit); return d ? { v: "valid", d: d } : { v: "invalid", t: !!st.time && !!parseYMD(dg.slice(0, 8)) }; });   // t — 날짜는 있는데 시각이 없는 값(25:00)
    var f = function (d) { return keyOf(d, unit); }, lo = dpBound(host, "min"), hi = dpBound(host, "max");
    /* 기간의 쪽마다 상태(React info.sides 와 같다) — 비운 쪽 empty, 범위는 그 쪽 날짜만. 순서(order)는 두 쪽 사이의 일이라 validity 에만 */
    var side = function (p, x) { return !p.trim() ? "empty" : x.v !== "valid" ? x.v : lo && f(x.d) < f(lo) ? "min" : hi && f(x.d) > f(hi) ? "max" : "valid"; };
    var ss = rg ? { start: side(parts[0], sides[0]), end: side(parts[1], sides[1]) } : null;
    /* 주어 — 기간에서 한쪽만 걸리면 그 쪽 이름, 둘 다면 '날짜가'(예시도 A ~ B) */
    var M = dpMessages(host), x = { example: EXAMPLE[unit], min: lo && showOf(lo, unit), max: hi && showOf(hi, unit), subject: M.subject };
    var who = function (hit, t) { var s0 = hit(ss.start), s1 = hit(ss.end); if (s0 !== s1) x.subject = t ? (s0 ? M.startTimeSubject : M.endTimeSubject) : s0 ? M.startSubject : M.endSubject; else if (s0) x.example = EXAMPLE[unit] + " ~ " + EXAMPLE[unit]; };
    var bad = sides.filter(function (x) { return x.v !== "valid"; })[0];
    if (bad) { if (bad.t) x.subject = M.timeSubject; if (rg) who(function (v) { return v === "incomplete" || v === "invalid" || v === "empty"; }, bad.t); return { validity: bad.v, a: null, b: null, sides: ss, msg: say(M, bad.t ? "invalidTime" : bad.v, x) }; }
    var a = sides[0].d, b = rg ? sides[1].d : null, both = [a, b].filter(Boolean);
    if (b && b < a) return { validity: "order", a: a, b: b, sides: ss, msg: say(M, st.time && fmt(a) === fmt(b) ? "orderTime" : "order", x) };   // 같은 날이면 틀린 것은 시각이다
    if (lo && both.some(function (d) { return f(d) < f(lo); })) { if (rg) who(function (v) { return v === "min"; }); return { validity: "min", a: a, b: b, sides: ss, msg: say(M, "min", x) }; }
    if (hi && both.some(function (d) { return f(d) > f(hi); })) { if (rg) who(function (v) { return v === "max"; }); return { validity: "max", a: a, b: b, sides: ss, msg: say(M, "max", x) }; }
    var md = dpMaxDays(host);
    if (md && b && spanDays(a, b) > md) { x.days = md; return { validity: "long", a: a, b: b, sides: ss, msg: say(M, "long", x) }; }
    return { validity: "valid", a: a, b: b, sides: ss };
  }
  /* host 의 상태. 처음 만질 때 마크업(입력 글자 · 정적 달력의 .on)에서 값을 읽어 data-* 로 옮긴다 */
  function S(host) {
    if (host._dp) return host._dp;
    var inp = $(".affix input", host), cal = isPicker(host) ? $(".calendar", host) : host, help = $(":scope > .help", host), unit = dpUnit(host);
    var time = isPicker(host) && unit === "day" && host.hasAttribute("data-time") ? (host.getAttribute("data-time") === "seconds" ? "second" : "minute") : null;
    var mode = host.hasAttribute("data-range") || (!isPicker(host) && ($(".day.in-range", host) || $$(".day.on", host).length > 1)) ? "range" : "single";
    var st = host._dp = { mode: mode, unit: unit, time: time, clock: null, view: baseView(unit), draft: null, month: null, focus: null, hover: null, opener: null, live: "", validity: "empty", text: "" };
    st.help = host.getAttribute("data-help") || (help && !host.classList.contains("error") ? help.textContent : "");
    /* data-default-preset="7": 값이 없으면 오늘 기준 최근 N일을 처음 값으로 — 검색 툴바의 조회 기간(사람의 결정 2026-10-27) */
    var dfp = Number(host.getAttribute("data-default-preset"));
    if (mode === "range" && dfp > 0 && !host.hasAttribute("data-start")) { var te = dpToday(host), tb = addDays(te, -(dfp - 1)); if (time) { te = new Date(te.getTime()); te.setHours(23, 59, 59, 0); } writeValue(host, { a: tb, b: te }); }
    if (host.hasAttribute("data-value") || host.hasAttribute("data-start")) { if (inp) display(host); }
    else if (inp) { var txt = pasteText(inp.value, tu(st), mode === "range"), r = check(host, txt); if (inp.value.trim()) inp.value = txt; writeValue(host, r); }   // 없는 날짜(2026. 02. 30)는 다른 날로 넘기지 않고 값을 비운다
    else if (cal) { var ds = $$(".day.on[data-date]", cal).map(function (d) { return parseYMD(d.dataset.date); }); writeValue(host, { a: ds[0] || null, b: ds[1] || null }); }
    if (inp) { st.text = inp.value.trim(); inp._dpPrev = inp.value; setValidity(host, check(host, inp.value).validity); }
    if (!isPicker(host)) {
      st.draft = readValue(host);
      var mk = parseYM(host.getAttribute("data-month"));
      st.month = mk || firstOf(st.draft.a || dpToday(host));
    }
    return st;
  }
  function dpMonths(host) { var st = S(host); return st.view === "day" && st.unit === "day" && st.mode === "range" && host.getAttribute("data-calendars") !== "1" && !(window.matchMedia && window.matchMedia("(max-width:767px)").matches) ? 2 : 1; }
  function dpFoot(host) {
    var f = host.getAttribute("data-footer"), st = S(host), list = f ? (f === "none" ? [] : f.split(/\s+/)) : st.mode === "single" ? ["today", "apply"] : ["apply"];
    if (st.time && list.indexOf("apply") < 0) list.push("apply");   // 시각을 고를 틈이 있어야 한다 — 날짜를 누르는 순간 닫히면 시각을 못 고친다
    return list;
  }
  /* 달력 아래 시각 칸 — 친 글자(st.clock)는 적용할 때 날짜와 합쳐 필드와 같은 검사를 지난다(사람의 결정 2026-11-10 — 처음 값 00:00 · 기간 끝 23:59) */
  function clockDefaults(st) { var s = st.time === "second"; return { a: s ? "00:00:00" : "00:00", b: s ? "23:59:59" : "23:59" }; }
  function clockSync(st, v) { var c = clockDefaults(st); if (v.a) c.a = clockOf(v.a, st.time); if (v.b) c.b = clockOf(v.b, st.time); st.clock = c; }
  function clockPaint(host) { var st = S(host); $$(".cal-time input", calOf(host)).forEach(function (i) { i.value = st.clock[i.dataset.side]; i._dpPrev = i.value; }); }
  var dpUid = 0;   // id 없는 입력(aria-label 만 쓰는 툴바)이 여럿이어도 시각 칸의 id 가 겹치지 않게
  function timeHtml(host) {
    var st = S(host), L = dpLabels(host), base = $(".affix input", host).id || (st.uid = st.uid || "dp-" + (++dpUid)), ph = st.time === "second" ? "HH:mm:ss" : "HH:mm";
    var one = function (side, label) { var id = base + "-time-" + side; return '<div class="field sm"><label for="' + id + '">' + label + '</label><input id="' + id + '" data-side="' + side + '" value="' + st.clock[side] + '" placeholder="' + ph + '" inputmode="numeric" autocomplete="off"></div>'; };
    return '<div class="cal-time">' + (st.mode === "range" ? one("a", L.startTime) + one("b", L.endTime) : one("a", L.time)) + "</div>";
  }
  /* 적용하면 필드에 들어갈 글자 — 시각 칸의 글자를 날짜 뒤에 그대로 붙인다(덜 친 시각은 필드 검사가 알린다) */
  function pendingText(host, v) {
    var st = S(host); if (!st.time || !v.a) return valText(host, v);
    var s = showOf(v.a, "day") + " " + st.clock.a;
    return st.mode === "range" ? (v.b ? s + " ~ " + showOf(v.b, "day") + " " + st.clock.b : "") : s;
  }
  function titleOf(host) {
    var st = S(host), m = st.month, y0 = m.getFullYear() - m.getFullYear() % 12;
    return st.view === "year" ? y0 + "–" + (y0 + 11) : st.view === "month" ? intl(dpLocale(host), { year: "numeric" }).format(m) : dpMonths(host) === 2 ? monthTitle(host, m) + " – " + monthTitle(host, addMonths(m, 1)) : monthTitle(host, m);
  }
  /* 제목 버튼은 더 넓은 화면(연)으로 — 연 단위는 연 목록이 가장 넓어 제목이 글자일 뿐이다 */
  /* nav = [이전, 다음] 이름, back = 제목 버튼 뒤 이름(false 면 누를 수 없는 제목) */
  function headHtml(which, title, nav2, back) {
    var nav = function (d) { return '<button type="button" class="cal-nav" data-nav="' + d + '" aria-label="' + nav2[d < 0 ? 0 : 1] + '">' + ICON[d < 0 ? "chevron-left" : "chevron-right"] + "</button>"; }, gap = '<span class="cal-nav-gap"></span>';
    var t = back === false ? '<span class="cal-title">' + title + "</span>" : '<button type="button" class="cal-title" aria-label="' + title + ", " + back + '">' + title + "</button>";
    return '<div class="cal-head">' + (which === "next" ? gap : nav(-1)) + t + (which === "prev" ? gap : nav(1)) + "</div>";
  }
  function dayGrid(host, mo, two) {
    var y = mo.getFullYear(), m = mo.getMonth(), off = new Date(y, m, 1).getDay(), rows = Math.ceil((off + new Date(y, m + 1, 0).getDate()) / 7);
    var h = '<div class="cal-grid" role="grid" aria-label="' + monthTitle(host, mo) + '"' + (S(host).mode === "range" ? ' aria-multiselectable="true"' : "") + '><div class="cal-week" role="row">' + dows(host).map(function (d) { return '<span class="dow" role="columnheader" aria-label="' + d[1] + '">' + d[0] + "</span>"; }).join("") + "</div>";
    for (var r = 0; r < rows; r++) {
      h += '<div class="cal-week" role="row">';
      for (var c = 0; c < 7; c++) {
        var d = new Date(y, m, r * 7 + c - off + 1), muted = d.getMonth() !== m;
        /* 두 달 보기에서 다른 달 칸은 비운다 — 같은 날짜가 두 번 나오지 않게 */
        h += two && muted ? '<span class="day blank" role="gridcell"></span>' : '<button type="button" class="day' + (muted ? " muted" : "") + '" role="gridcell" data-date="' + fmt(d) + '" aria-label="' + dayLabel(host, d) + '" tabindex="-1"' + (outOf(host, d) ? ' aria-disabled="true"' : "") + ">" + d.getDate() + "</button>";
      }
      h += "</div>";
    }
    return h + "</div>";
  }
  function cellGrid(host, kind, mo) {
    var st = S(host), y = mo.getFullYear(), y0 = y - y % 12, own = st.mode === "range" && st.unit === (kind === "years" ? "year" : "month"), loc = dpLocale(host);
    var h = '<div class="cal-grid ' + kind + '" role="grid" aria-label="' + (kind === "years" ? dpLabels(host).yearGrid : intl(loc, { year: "numeric" }).format(mo)) + '"' + (own ? ' aria-multiselectable="true"' : "") + ">";
    for (var r = 0; r < 4; r++) {
      h += '<div class="cal-week" role="row">';
      for (var c = 0; c < 3; c++) {
        var i = r * 3 + c, d = kind === "years" ? new Date(y0 + i, 0, 1) : new Date(y, i, 1);
        h += kind === "years" ? '<button type="button" class="cell" role="gridcell" data-year="' + (y0 + i) + '" tabindex="-1"' + (outOf(host, d, "year") ? ' aria-disabled="true"' : "") + ">" + (y0 + i) + "</button>"
          : '<button type="button" class="cell" role="gridcell" data-ym="' + ymKey(d) + '" aria-label="' + monthTitle(host, d) + '" tabindex="-1"' + (outOf(host, d, "month") ? ' aria-disabled="true"' : "") + ">" + intl(loc, { month: "short" }).format(d) + "</button>";
      }
      h += "</div>";
    }
    return h + "</div>";
  }
  function footHtml(host) {
    var st = S(host), list = dpFoot(host), h = "", t = dpToday(host), L = dpLabels(host);
    if (st.mode === "range" && st.unit === "day") (host.getAttribute("data-presets") || "").split(/\s+/).filter(Boolean).forEach(function (n) { var s = addDays(t, -(+n - 1)); h += '<button type="button" class="btn sm text" data-preset="' + n + '"' + (outOf(host, s) || outOf(host, t) || (dpMaxDays(host) && +n > dpMaxDays(host)) ? " disabled" : "") + ">" + L.recent.replace("{n}", n) + "</button>"; });
    ["today", "reset", "cancel", "apply"].forEach(function (k) { if (list.indexOf(k) < 0 || (k === "today" && st.mode !== "single")) return; h += '<button type="button" class="btn sm ' + FOOT[k] + '" data-cal="' + k + '"' + (k === "today" && outOf(host, t, st.unit) ? " disabled" : "") + ">" + L[k] + "</button>"; });
    return h ? '<div class="cal-foot">' + h + "</div>" : "";
  }
  /* 격자를 다시 그린다 — 달 · 뷰 · 달 수가 바뀔 때만. 고르기 · 미리보기 · 키 이동은 renderMarks 만 부른다(포인터 아래 DOM 을 갈지 않게) */
  function renderStructure(host) {
    var st = S(host), cal = calOf(host), act = doc.activeElement, key = cal.contains(act) ? focusKey(act) : null;
    var keep = !host.hasAttribute("data-footer") && !host.hasAttribute("data-presets") && $(":scope > .cal-foot", cal);   // data-footer 가 없으면 하단을 처음 그린(또는 옛 마크업이 직접 만든) 그대로 둔다
    var live = $(":scope > .sr-only[aria-live]", cal);   // 알림 영역은 같은 노드를 둔다 — 새로 넣은 live 영역은 대개 읽히지 않는다
    var n = dpMonths(host), h = "", L = dpLabels(host);
    cal.classList.toggle("two", n === 2);
    if (st.view === "day") {
      for (var i = 0; i < n; i++) { var mo = addMonths(st.month, i); h += (n === 2 ? '<div class="cal-month">' : "") + headHtml(n === 2 ? (i ? "next" : "prev") : "both", monthTitle(host, mo), [L.prevMonth, L.nextMonth], L.chooseYear) + dayGrid(host, mo, n === 2) + (n === 2 ? "</div>" : ""); }
      if (n === 2) h = '<div class="cal-months">' + h + "</div>";
    } else h += headHtml("both", titleOf(host), st.view === "month" ? [L.prevYear, L.nextYear] : [L.prevYears, L.nextYears], st.view === "year" ? (st.unit === "year" ? false : st.unit === "month" ? L.backToMonths : L.backToDays) : L.chooseYear) + cellGrid(host, st.view === "month" ? "months" : "years", st.month);
    if (st.time && st.view === "day") h += timeHtml(host);
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
    var lo = b ? a : hv ? (hv < a ? hv : a) : null, hi = b ? b : hv ? (hv < a ? a : hv) : null, md = rg && a && !b ? dpMaxDays(host) : 0;   // 시작만 고른 동안 — 상한 밖의 날짜는 끝으로 고를 수 없다
    $$(".day[data-date]", cal).forEach(function (d) {
      var dd = parseYMD(d.dataset.date); if (outOf(host, dd) || (md && spanDays(v.a, dd) > md)) d.setAttribute("aria-disabled", "true"); else d.removeAttribute("aria-disabled");
      var k = d.dataset.date, muted = d.classList.contains("muted"), on = !muted && (k === a || k === b), mid = !muted && !!lo && k > lo && k < hi;   // 다른 달(흐린) 칸은 선택 · 띠를 칠하지 않는다(사람의 결정 2026-10-27)
      d.classList.toggle("on", on); d.classList.toggle("start", (on || k === hv) && k === lo); d.classList.toggle("end", (on || k === hv) && k === hi);   // 띠의 양끝(선택 · 미리보기 끝) — CSS 가 반쪽 띠를 칠한다
      d.classList.toggle("in-range", !!b && mid); d.classList.toggle("preview", !!hv && mid); d.classList.toggle("preview-end", k === hv); d.classList.toggle("today", k === today);
      if (on || (b && mid)) d.setAttribute("aria-selected", "true"); else d.removeAttribute("aria-selected");
      if (k === today) d.setAttribute("aria-current", "date"); else d.removeAttribute("aria-current");
    });
    /* 연 · 월 칸 — 고르는 단위의 칸이면 값(기간은 양끝 .on · 사이 .in-range), 이동용 칸이면 값이 든 달 · 연만.
       보이는 달을 .on 으로 칠하면 고른 적 없는 달이 선택처럼 보였다 */
    $$(".cell", cal).forEach(function (c) {
      var u = c.dataset.ym ? "month" : "year", k = c.dataset.ym || c.dataset.year, own = st.unit === u, ca = v.a ? keyOf(v.a, u) : null, cb = own && rg && v.b ? keyOf(v.b, u) : null;
      var on = k === ca || k === cb, mid = !!cb && k > ca && k < cb;
      c.classList.toggle("on", on); c.classList.toggle("in-range", mid); on || mid ? c.setAttribute("aria-selected", "true") : c.removeAttribute("aria-selected");
      c.classList.toggle("today", k === (u === "month" ? today.slice(0, 7) : today.slice(0, 4)));
    });
    /* 키보드 포커스는 격자 안 한 칸만(roving tabindex) — 포커스해 둔 칸 · 선택 · 오늘 · 그 달 첫 날 순 */
    var cells = $$(".cal-grid .day[data-date]:not(.muted), .cal-grid .cell", cal), f = st.focus;
    var pickCell = function (sel) { return cells.filter(function (c) { return c.matches(sel); })[0]; };
    var target = (f && pickCell('[data-date="' + f + '"],[data-ym="' + f + '"],[data-year="' + f + '"]')) || pickCell(".on") || pickCell(".today") || pickCell(':not([aria-disabled="true"])') || cells[0];
    $$(".cal-grid .day[data-date], .cal-grid .cell", cal).forEach(function (c) { c.tabIndex = c === target ? 0 : -1; });
    var ap = $('[data-cal="apply"]', cal); if (ap) ap.disabled = !!(rg && v.a && !v.b) || pendingText(host, v) === valText(host, readValue(host));   // 끝이 없는 기간, 열기 전과 같은 값은 적용할 수 없다(사람의 결정 2026-10-27 — 값 지우기는 초기화의 일)
  }
  function setExpanded(host, open) { $$(".cal-btn", host).forEach(function (b) { b.setAttribute("aria-expanded", String(open)); }); }
  function openDP(host, opener) {
    var st = S(host), inp = $(".affix input", host);
    if (inp && inp.value.trim() !== st.text) typed(host);   // 열기 전에 친 글자를 먼저 반영한다
    st.draft = readValue(host); st.view = baseView(st.unit); st.hover = null; st.focus = null; st.opener = opener; st.live = "";
    if (st.time) clockSync(st, st.draft);
    var base = st.draft.a, lo = dpBound(host, "min"), hi = dpBound(host, "max");
    if (!base) { base = dpToday(host); if (hi && base > hi) base = hi; if (lo && base < lo) base = lo; }   // 값이 범위 밖이면 그 값의 달을 연다 — 고른 것이 보이게
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
    if (restore) { var o = st.opener || $(".cal-btn", host); if (o) o.focus(); }
  }
  /* 아래 자리가 모자라고 위가 더 넓으면 필드 위로(.up). 기준은 필드 상자 — 도움말이 달력을 밀지 않게. 오른쪽으로 넘치면 왼쪽으로 당긴다 */
  function place(host, keep) {
    var cal = calOf(host), anchor = $(".affix", host) || host, hr = host.getBoundingClientRect(), r = anchor.getBoundingClientRect(), h = cal.offsetHeight, w = cal.offsetWidth, gap = 4;
    var below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = keep ? host.classList.contains("up") : below < h && above > below, vw = doc.documentElement.clientWidth;   // 열린 뒤에는 방향을 바꾸지 않고 높이만 다시 잰다
    host.classList.toggle("up", up);
    host.style.setProperty("--dp-top", (up ? r.top - hr.top - gap - h : r.bottom - hr.top + gap) + "px");
    host.style.setProperty("--dp-left", Math.max(8 - hr.left, Math.min(0, vw - 8 - w - hr.left)) + "px");
  }
  /* ds:date — value · start · end 는 기계 형식, date 는 기준 시간대의 0시 · data-time 이면 그 시각(미완성 · 없는 날짜는 Invalid Date, 빈 값은 null), text 는 필드 글자,
     기간은 sides {start, end} — 쪽마다의 상태(달력에서 고른 값은 늘 valid · 비운 쪽 empty) */
  function emit(host, v, validity, sides) {
    var st = S(host), u = tu(st), k = function (d) { return d ? keyOf(d, u) : null; }, bad = validity === "incomplete" || validity === "invalid";
    var at = function (d) { return bad ? new Date(NaN) : d ? instant(host, d) : null; }, inp = $(".affix input", host), text = inp ? inp.value.trim() : valText(host, v);
    fire(host, "ds:date", st.mode === "range" ? { value: v.a && v.b ? k(v.a) + " ~ " + k(v.b) : null, start: k(v.a), end: k(v.b), date: { start: at(v.a), end: at(v.b) }, text: text, validity: validity, sides: sides || { start: v.a ? "valid" : "empty", end: v.b ? "valid" : "empty" } }
      : { value: k(v.a), date: at(v.a), text: text, validity: validity });
  }
  function commit(host) {
    var st = S(host), v = st.draft || { a: null, b: null };
    if (st.mode === "range" && v.a && !v.b) return false;
    if (st.time && v.a) { var ti = $(".affix input", host); ti.value = pendingText(host, v); ti._dpPrev = ti.value; typed(host); return true; }   // 달력은 날짜만 막는다 — 시각의 범위 · 순서는 필드 검사가 잰다
    writeValue(host, v); display(host); clearError(host); setValidity(host, v.a ? "valid" : "empty");
    emit(host, v, st.validity);
    return true;
  }
  function display(host) {
    var st = S(host), inp = $(".affix input", host); if (!inp) return;
    inp.value = valText(host, readValue(host)); inp._dpPrev = inp.value; st.text = inp.value;
  }
  /* 고르기 — 기간은 첫 클릭이 시작, 둘째 클릭이 끝(앞이면 바꾼다). 하단에 적용이 없으면 고르는 순간 적용하고 닫는다.
     달력에서는 min/max 밖을 고를 수 없다 — 범위 밖 값은 키보드 입력으로만 들어온다(사람의 요구 2026-11-09) */
  function pick(host, d, k) {
    var st = S(host), v = st.draft || {};
    if (!d || outOf(host, d, st.unit)) return;
    st.draft = st.mode !== "range" || !v.a || v.b ? { a: d, b: null } : d < v.a ? { a: d, b: v.a } : { a: v.a, b: d };
    st.hover = null; st.focus = k;
    if ((st.mode !== "range" || st.draft.b) && dpFoot(host).indexOf("apply") < 0) { commit(host); if (isPicker(host)) { closeDP(host, true); return; } }
    if (st.unit === "day") {
      var last = addMonths(st.month, dpMonths(host) - 1);
      if (ymKey(d) < ymKey(st.month) || ymKey(d) > ymKey(last)) { st.month = ymKey(d) < ymKey(st.month) ? firstOf(d) : firstOf(addMonths(firstOf(d), -(dpMonths(host) - 1))); st.live = titleOf(host); renderStructure(host); return; }   // 다른 달(흐린) 날을 고르면 그 달로 넘어간다
    }
    renderMarks(host);
  }
  function pickCell(host, el) {
    var st = S(host);
    if (isOff(el)) return;
    if (el.dataset.year) { if (st.unit === "year") { pick(host, new Date(+el.dataset.year, 0, 1), el.dataset.year); return; } st.month = new Date(+el.dataset.year, st.month.getMonth(), 1); setView(host, "month"); return; }
    var d = parseYM(el.dataset.ym);
    if (st.unit === "day") { st.month = d; setView(host, "day"); return; }
    pick(host, d, el.dataset.ym);
  }
  function setView(host, view) { var st = S(host); st.view = view; st.focus = view === "month" ? ymKey(st.month) : view === "year" ? String(st.month.getFullYear()) : null; st.live = titleOf(host); renderStructure(host); }   // 연 · 월 화면은 보던 달(연)에서 시작한다
  function nav(host, dir) {
    var st = S(host), m = st.month;
    st.month = st.view === "day" ? new Date(m.getFullYear(), m.getMonth() + dir, 1) : new Date(m.getFullYear() + dir * (st.view === "month" ? 1 : 12), m.getMonth(), 1);
    st.focus = null; st.live = titleOf(host); renderStructure(host);
  }
  function preset(host, n) {
    var st = S(host), e = dpToday(host);
    st.draft = { a: addDays(e, -(n - 1)), b: e }; st.hover = null; if (st.time) st.clock = clockDefaults(st); commit(host);
    if (isPicker(host)) { closeDP(host, true); return; }
    st.month = firstOf(e); st.focus = fmt(e); st.view = "day"; renderStructure(host);
  }
  function foot(host, kind) {
    var st = S(host);
    if (kind === "apply") { if (commit(host) && isPicker(host)) closeDP(host, true); return; }
    if (kind === "cancel") { if (isPicker(host)) closeDP(host, true); else { st.draft = readValue(host); renderMarks(host); } return; }
    if (kind === "today") { var t = unitStart(dpToday(host), st.unit); st.draft = { a: t, b: null }; st.focus = keyOf(t, st.unit); st.view = baseView(st.unit); st.month = firstOf(t); renderStructure(host); }
    if (kind === "reset") { st.draft = { a: null, b: null }; st.hover = null; if (st.time) { st.clock = clockDefaults(st); clockPaint(host); } renderMarks(host); }
    if (dpFoot(host).indexOf("apply") < 0) { commit(host); if (isPicker(host)) closeDP(host, true); }
  }
  /* 키보드(WAI-ARIA 날짜 선택 대화상자): ←→ 하루 · ↑↓ 일주일 · PageUp/Down 달(Shift 연) · Home/End 주의 처음 · 끝 · Esc 닫고 필드로 · Tab 은 달력 안에서 돈다 */
  function calKey(e, host) {
    var st = S(host), cal = calOf(host), k = e.key, open = isPicker(host) && host.classList.contains("open");
    if (k === "Escape") { if (!open) return false; e.preventDefault(); closeDP(host, true); return true; }
    if (k === "Tab" && open) {
      var f = $$("button, input", cal).filter(function (b) { return !b.disabled && b.tabIndex >= 0 && b.offsetParent !== null; }), i = f.indexOf(doc.activeElement);
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
  /* 직접 입력 — 치는 동안 'YYYY. MM. DD' 로 끊어 채운다. 구분자 하나만 지운 Backspace 는 그 앞 숫자를 지운다(구분자는 다시 생기므로) */
  function dpInput(inp, e) { var st = S(closest(inp, ".datepicker")); reflow(inp, e, tu(st), st.mode === "range"); }
  function clockInput(inp, e) { var host = closest(inp, ".datepicker"), st = S(host); reflow(inp, e, st.time === "second" ? "clockS" : "clock", false); st.clock[inp.dataset.side] = inp.value; renderMarks(host); }
  function reflow(inp, e, unit, rg) {
    var v = inp.value, prev = inp._dpPrev == null ? inp.defaultValue : inp._dpPrev;
    var caret = inp.selectionStart == null ? v.length : inp.selectionStart, atEnd = caret >= v.length, dg = v.replace(/\D/g, ""), before = v.slice(0, caret).replace(/\D/g, "").length;
    if (e.inputType === "deleteContentBackward" && dg === prev.replace(/\D/g, "") && before > 0) { dg = dg.slice(0, before - 1) + dg.slice(before); before--; }
    var text = e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop" ? pasteText(v, unit, rg) : groups(dg, unit, rg), pos = text.length;
    if (!atEnd && e.inputType !== "insertFromPaste") { var n = 0; for (pos = 0; pos < text.length && n < before; pos++) if (/\d/.test(text.charAt(pos))) n++; }
    inp.value = text; inp._dpPrev = text;
    try { inp.setSelectionRange(pos, pos); } catch (x) { /* 포커스 없는 입력 */ }
  }
  /* ↑↓ — 커서가 놓인 조각(연 · 월 · 일)을 ±1 하고 바로 확정한다. min/max 는 보지 않는다(사람의 요구 2026-11-09 — 키보드로는 범위 밖 값도 넣는다).
     빈 조각은 오늘 값으로 채운다. 월은 12 ↔ 1, 일은 그 달의 끝 ↔ 1 로 돈다 */
  function stepSeg(host, inp, dir) {
    var st = S(host), unit = tu(st), rg = st.mode === "range", v = inp.value, caret = inp.selectionStart || 0;
    var parts = rg ? v.split(" ~ ") : [v], side = rg && parts.length > 1 && caret > parts[0].length ? 1 : 0, base = side ? parts[0].length + 3 : 0, local = caret - base;
    var segs = (parts[side] || "").split(/\. | |:/), n = LENS[unit].length, si = Math.min(local <= 4 ? 0 : local <= 8 ? 1 : local <= 12 ? 2 : local <= 15 ? 3 : local <= 18 ? 4 : 5, n - 1);
    var t = dpToday(host), now = [t.getFullYear(), t.getMonth() + 1, t.getDate()].concat(side ? [23, 59, 59] : [0, 0, 0]), num = [], empty = !segs[si] || segs[si].length < (si ? 2 : 4);
    for (var i = 0; i < n; i++) num.push(segs[i] && segs[i].length === (i ? 2 : 4) ? +segs[i] : now[i]);
    if (!empty) {
      if (si === 0) num[0] = Math.max(1, Math.min(9999, num[0] + dir));
      else if (si === 1) num[1] = (num[1] - 1 + dir + 12) % 12 + 1;
      else if (si === 2) { var dim = new Date(num[0], num[1], 0).getDate(); num[2] = (Math.min(num[2], dim) - 1 + dir + dim) % dim + 1; }
      else { var wrap = si === 3 ? 24 : 60; num[si] = (num[si] + dir + wrap) % wrap; }   // 시 23 ↔ 0, 분 · 초 59 ↔ 0
    }
    if (n >= 3) num[2] = Math.min(num[2], new Date(num[0], num[1], 0).getDate());   // 1월 31일에서 월을 올리면 2월 28일
    parts[side] = joinSeg(num.map(function (x, j) { return j ? pad(x) : String(x); }), unit);
    if (rg && side === 0 && parts.length < 2) parts.length = 1;
    inp.value = parts.join(" ~ "); inp._dpPrev = inp.value;
    var end = base + [4, 8, 12, 15, 18, 21][si]; try { inp.setSelectionRange(end, end); } catch (x) { /* 포커스 없는 입력 */ }
    typed(host);
  }
  /* 시각 칸의 ↑↓ — 커서 조각 ±1(시 23 ↔ 0, 분 · 초 59 ↔ 0). 적용하기 전이라 값은 아직 바뀌지 않는다 */
  function clockStep(host, inp, dir) {
    var st = S(host), n = st.time === "second" ? 3 : 2, segs = inp.value.split(":"), caret = inp.selectionStart || 0, si = Math.min(caret <= 2 ? 0 : caret <= 5 ? 1 : 2, n - 1), num = [];
    for (var i = 0; i < n; i++) num.push(segs[i] && segs[i].length === 2 ? +segs[i] : 0);
    if (segs[si] && segs[si].length === 2) { var w = si ? 60 : 24; num[si] = (num[si] + dir + w) % w; }
    inp.value = num.map(pad).join(":"); inp._dpPrev = inp.value; st.clock[inp.dataset.side] = inp.value;
    var end = [2, 5, 8][si]; try { inp.setSelectionRange(end, end); } catch (x) { /* 포커스 없는 입력 */ }
    renderMarks(host);
  }
  /* 검사 · 확정 — Enter · 포커스가 필드를 떠날 때 · ↑↓. 값이 늘 유효하지는 않다(사람의 요구 2026-11-09):
     미완성 · 없는 날짜는 값을 비우고, 범위 밖 · 순서는 값을 그 날짜로 둔 채 data-validity 와 오류 테두리 · 원인 문구로 알린다 */
  function typed(host) {
    var st = S(host), inp = $(".affix input", host); if (!inp) return true;
    var r = check(host, inp.value), v = { a: r.a, b: r.b }, changed = inp.value.trim() !== st.text;
    writeValue(host, v); setValidity(host, r.validity);
    if (r.msg) setError(host, r.msg); else clearError(host);
    if (r.a) { inp.value = valText(host, v) || inp.value; inp._dpPrev = inp.value; }
    st.text = inp.value.trim();
    if (changed) emit(host, v, r.validity, r.sides);
    if (host.classList.contains("open")) { st.draft = v; st.focus = null; if (st.time && v.a) clockSync(st, v); if (v.a) st.month = firstOf(v.a); st.view = baseView(st.unit); renderStructure(host); }   // 연 채로 입력해 확정하면 달력도 그 값으로
    return r.validity === "valid" || r.validity === "empty";
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
    if ((el = closest(t, "button.cal-title"))) { setView(host, st.view === "year" ? baseView(st.unit) : "year"); return true; }
    if ((el = closest(t, ".day[data-date]"))) { if (!isOff(el)) pick(host, parseYMD(el.dataset.date), el.dataset.date); return true; }
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
    if (th) { var tbl = closest(th, "table"); return $$("tbody tr:not(.disabled) td.check input", tbl); }
    var lab = closest(master, ".checkbox"), sib = lab && lab.nextElementSibling;
    if (sib && sib.classList.contains("checkbox-group")) return $$("input[type=checkbox]", sib);
    return [];
  }
  function syncRow(input) {
    var tr = closest(input, "tr"); if (tr) tr.classList.toggle("on", input.checked);
    var wrap = closest(input, ".tbl-wrap"), tbl = closest(input, "table");
    var master = tbl && $("th.check input", tbl); if (master) syncMaster(master);
    var bar = wrap && $(".action-bar", wrap);
    var n = tbl ? $$("tbody td.check input:checked", tbl).length : 0;
    var total = wrap ? Number(wrap.dataset.total) || 0 : 0, note = wrap && $(":scope > .select-notice", wrap);
    var pageAll = !!(master && master.checked), wasAll = wrap && wrap._dsAll;
    if (wrap && !pageAll) wrap._dsAll = false;
    if (note) selectNotice(wrap, note, n, total, pageAll);
    if (wrap && wasAll && !wrap._dsAll) fire(wrap, "ds:select-all", { all: false, total: total });
    if (bar) { var shown = wrap._dsAll ? total : n; var b = $("b", bar); if (b) b.textContent = shown.toLocaleString("ko-KR") + "개 선택"; bar.hidden = n === 0; }
  }
  /* 머리글 체크박스는 이 페이지만 고른다. 건수를 아는 표(data-total)는 전체 결과까지 넓힐 길을 안내한다 — 실행은 제품 서버가 한다(ds:select-all) */
  function selectNotice(wrap, note, n, total, pageAll) {
    var f = function (v) { return Number(v).toLocaleString("ko-KR"); }, html = "";
    if (wrap._dsAll) html = '<span>전체 ' + f(total) + '건을 선택했습니다.</span><button type="button" class="btn sm text" data-select-clear>선택 해제</button>';
    else if (pageAll && total > n) html = '<span>이 페이지의 ' + f(n) + '건을 모두 선택했습니다.</span><button type="button" class="btn sm text" data-select-all>전체 ' + f(total) + '건 선택</button>';
    if (note.innerHTML !== html) note.innerHTML = html;
  }
  /* 행을 지운 뒤 포커스 — 지운 행의 다음(없으면 이전) 행의 첫 조작 요소로, 행이 없으면 표 영역으로 */
  function removeRow(tr) {
    tr = typeof tr === "string" ? $(tr) : tr; if (!tr || !tr.parentNode) return;
    var tbl = closest(tr, "table"), wrap = closest(tr, ".tbl-wrap"), to = tr.nextElementSibling || tr.previousElementSibling, had = tr.contains(doc.activeElement);
    tr.remove();
    var master = tbl && $("th.check input", tbl); if (master) syncRow(master);
    if (!had) return;
    var f = to && $(FOCUSABLE, to);
    if (f) f.focus(); else if (wrap) { wrap.tabIndex = wrap.tabIndex >= 0 ? wrap.tabIndex : -1; wrap.focus(); }
  }
  function syncTerms(terms) {
    var all = $(".all input", terms), items = $$(".item input[type=checkbox]", terms); if (!items.length) return;
    if (all) { var n = items.filter(function (i) { return i.checked; }).length; all.checked = n === items.length; all.indeterminate = n > 0 && n < items.length; all.classList.toggle("mixed", all.indeterminate); }
    if (terms._tried) termsNotice(terms);   // 눌러서 안내가 나온 뒤에만 — 고치면 바로 줄이고, 다 고치면 지운다
  }
  /* 약관 동의의 '다음' 은 비활성으로 두지 않는다(Interaction › Disabled, 사람의 결정 2026-11-09) — 누르면 비어 있는 필수 항목을 알리고 첫 항목으로 포커스를 옮긴다 */
  function termsMissing(terms) { return $$(".item input[type=checkbox]", terms).filter(function (i) { return $(".req", closest(i, ".item")) && !i.checked; }); }
  function termsNotice(terms) {
    var miss = termsMissing(terms), msg = $(":scope > .msg", terms);
    if (!msg) { msg = doc.createElement("div"); msg.className = "msg"; msg.setAttribute("aria-live", "polite"); var g = $(":scope > .btn-group", terms); terms.insertBefore(msg, g); }   // 옛 마크업에는 없다
    msg.textContent = miss.length ? "필수 약관 " + miss.length + "개에 동의하지 않았습니다. 체크하고 다시 누르세요." : "";
    $$(".item input[type=checkbox]", terms).forEach(function (i) { if (miss.indexOf(i) >= 0) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); });
    if (!miss.length) terms._tried = false;
  }
  function sortTable(th) {
    var table = closest(th, "table"), tbody = $("tbody", table); if (!tbody) return;
    var ths = $$("thead th", table), col = ths.indexOf(th);
    var desc = th.classList.contains("sorted") && !th.classList.contains("desc");
    ths.forEach(function (h) { h.classList.remove("sorted", "desc"); h.removeAttribute("aria-sort"); });
    th.classList.add("sorted"); if (desc) th.classList.add("desc"); th.setAttribute("aria-sort", desc ? "descending" : "ascending");
    fire(th, "ds:sort", { key: th.dataset.key || th.textContent.trim(), dir: desc ? "desc" : "asc" });
    if (table.dataset.sort === "server") return;   // 서버가 정렬한 페이지를 다시 정렬하면 현재 페이지만 뒤섞여 틀려 보인다
    var rows = $$("tr", tbody).filter(function (r) { return !$("td.empty", r); });
    var val = function (r) { var c = r.children[col]; var t = c ? c.textContent.trim() : ""; var n = parseFloat(t.replace(/[,\s%]/g, "")); return isNaN(n) || !/^-?[\d,.]+\s*%?$/.test(t) ? t : n; };
    rows.sort(function (a, b) { var x = val(a), y = val(b); var c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "ko"); return desc ? -c : c; });
    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  /* ---------- Toast ---------- */
  /* Toast 타이머(사람의 결정 2026-11-10) — 묶음에 마우스가 있거나 포커스가 든 동안 남은 시간을 멈춘다. 오류는 닫을 때까지 남는다.
     묶음 전체를 멈추는 이유: 다른 Toast 가 사라지면 보고 있던 Toast 가 밀려 내려간다 */
  function toastHeld(s) { return s.matches(":hover") || s.contains(doc.activeElement); }
  function toastSync(s) {
    var held = toastHeld(s);
    $$(":scope > .toast", s).forEach(function (t) {
      if (!(t._tLeft > 0)) return;
      if (held && t._t) { clearTimeout(t._t); t._t = 0; t._tLeft = Math.max(1, t._tLeft - (Date.now() - t._tAt)); }
      else if (!held && !t._t) { t._tAt = Date.now(); t._t = setTimeout(function () { t._t = 0; closeToast(t); }, t._tLeft); }
    });
  }
  function scheduleToast(t) {
    var d = Number(t.dataset.duration || 4000), s = t.parentNode;
    if (!s._dsHold) { s._dsHold = true;
      s.addEventListener("mouseenter", function () { toastSync(s); });
      s.addEventListener("mouseleave", function () { toastSync(s); });
      s.addEventListener("focusin", function (e) { if (!s.contains(e.relatedTarget)) s._dsFrom = e.relatedTarget; toastSync(s); });
      s.addEventListener("focusout", function () { setTimeout(function () { toastSync(s); }, 0); }); }
    if (!(d > 0) || t.classList.contains("danger")) return;   // 오류만 있는 묶음도 위 리스너는 있어야 한다 — 닫은 뒤 돌아갈 자리를 기억한다
    t._tLeft = d;
    toastSync(s);
  }
  /* 키보드로 닫으면 포커스를 다음 Toast, 없으면 들어오기 전 자리로 — body 로 떨어지지 않게. 마우스로 닫을 때는 옮기지 않는다(옮기면 다음 Toast 의 타이머가 멈춘 채 남는다) */
  function closeToast(t, byKey) {
    var s = t.parentNode; if (!s) return;
    if (byKey && t.contains(doc.activeElement)) { var to = $$("button", s).filter(function (b) { return !t.contains(b); })[0] || s._dsFrom; if (to && doc.contains(to)) to.focus({ preventScroll: true }); }
    clearTimeout(t._t); t._t = 0; t._tLeft = 0; dismiss(t); setTimeout(function () { toastSync(s); }, 180);
  }
  /* 닫혀 사라지는 요소(Notice · Banner)에서 키보드 포커스를 다음 칸으로 */
  function focusPast(el) {
    if (!el.contains(doc.activeElement)) return;
    var out = focusablesIn(doc.body).filter(function (x) { return !el.contains(x); }), to = out.filter(function (x) { return el.compareDocumentPosition(x) & 4; })[0] || out[out.length - 1];
    if (to) to.focus({ preventScroll: true });
  }
  function dismiss(el) { if (!el) return; el.style.transition = "opacity 160ms"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 170); }
  /* Filter Chip — 켜진 칩이 있을 때만 '필터 초기화'를 보인다. 누르면 버튼이 사라지므로 포커스는 첫 칩으로 */
  function syncChipReset(g) { var b = $(":scope > [data-chip-reset]", g); if (b) b.hidden = !$(":scope > .chip.on[aria-pressed]", g); }
  /* Input Chip — 지운 뒤 포커스는 다음 칸, 없으면 앞 칸, 칸이 하나도 없으면 묶음 자신. body 로 떨어지지 않게 */
  function chipFocusAfter(chip) {
    var box = chip.parentNode, spots = $$(":scope > button:not([disabled]), :scope > .chip > .x:not([disabled])", box).filter(function (el) { return !el.hidden; }), i = spots.indexOf($(".x", chip)), to = spots[i + 1] || spots[i - 1];
    if (!to) { box.tabIndex = -1; to = box; }
    to.focus({ preventScroll: true });
  }
  /** 프로그램에서 토스트 띄우기: DS.toast("저장됨", {tone:"danger", action:{label, onClick}, duration}) */
  function toast(message, o) {
    o = o || {};
    var stack = $(".toast-stack.fixed");
    if (!stack) { stack = doc.createElement("div"); stack.className = "toast-stack fixed"; stack.setAttribute("aria-live", "polite"); doc.body.appendChild(stack); }
    /* 오류는 닫을 때까지 · 동작이 있으면 10초 · 나머지 4초(사람의 결정 2026-11-10) */
    var d = o.tone === "danger" ? 0 : o.duration != null ? o.duration : o.action ? 10000 : 4000;
    /* 같은 알림이 연달아 오면 쌓지 않고 시간을 다시 잰다. 동작이 있는 Toast 는 합치지 않는다 — 실행 취소 대상이 서로 다르다 */
    if (!o.action) { var same = $$(":scope > .toast", stack).filter(function (x) { return x._dsMsg === String(message) && !$(".action", x) && x.classList.contains("danger") === (o.tone === "danger") && x.style.opacity !== "0"; })[0];
      if (same) { if (d > 0) { clearTimeout(same._t); same._t = 0; same._tLeft = d; toastSync(stack); } return same; } }
    var t = doc.createElement("div"); t.className = "toast" + (o.tone === "danger" ? " danger" : ""); t.dataset.duration = String(d); t._dsMsg = String(message);
    var ic = o.tone === "danger" ? '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/>' : '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>';
    t.innerHTML = '<span class="ico"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic + "</svg></span>";
    t.appendChild(doc.createTextNode(message));
    if (o.action) { var b = doc.createElement("button"); b.type = "button"; b.className = "action"; b.textContent = o.action.label; b.addEventListener("click", function () { o.action.onClick && o.action.onClick(); }); t.appendChild(b); }   // 닫기는 문서 클릭 처리가 한다
    if (!(d > 0)) { var cb = doc.createElement("button"); cb.type = "button"; cb.className = "close"; cb.setAttribute("aria-label", "닫기"); cb.innerHTML = X_ICON; t.appendChild(cb); }
    /* 넘치면 자동으로 사라지는 것부터 지운다. 닫을 때까지 남는 것(오류)은 밀리지 않아 3개를 넘어 쌓일 수 있다 */
    while (stack.children.length >= (o.max || 3)) { var old = $$(":scope > .toast", stack).filter(function (x) { return Number(x.dataset.duration) > 0; })[0]; if (!old) break; clearTimeout(old._t); old.remove(); }
    stack.appendChild(t); scheduleToast(t); return t;
  }

  /* ---------- Popup ---------- */
  /** DS.popup.open("#id") / DS.popup.close(): .popup 요소를 배경과 함께 표시.
      열려 있는 동안 Tab · Shift+Tab 은 팝업 안에서 돌고, 닫으면 연 요소로 포커스가 돌아간다 — React Popup(useFocusTrap)과 같다.
      종전에는 가둠이 없어 aria-modal 팝업에서 Tab 으로 뒤 페이지에 나갔다(2026-10-28, 사람의 결정) */
  var FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var focusablesIn = function (root) { return $$(FOCUSABLE, root).filter(function (x) { return x.getClientRects().length > 0; }); };
  var popup = {
    open: function (sel) {
      var el = typeof sel === "string" ? $(sel) : sel; if (!el) return;
      if ($(".popup-backdrop[data-ds-popup]")) { console.warn("[DS.popup] 모달 위에 모달을 띄우지 않습니다 — 열려 있는 팝업을 먼저 닫으세요."); return; }
      popup._prev = doc.activeElement; delete el.dataset.dsDirty;
      var bd = doc.createElement("div"); bd.className = "popup-backdrop"; bd.dataset.dsPopup = "1";
      el.dataset.dsHome = "1"; var ph = doc.createComment("popup"); el.parentNode.insertBefore(ph, el); el._dsPlaceholder = ph;
      bd.appendChild(el); doc.body.appendChild(bd); doc.body.style.overflow = "hidden";
      /* 첫 포커스는 닫기(X)와 위험 실행 버튼을 건너뛴다 — 입력칸이 있으면 입력칸, 없으면 취소 */
      var fs = focusablesIn(el), f = fs.filter(function (x) { return !x.matches(".popup-close, .negative"); })[0] || fs[0]; f && f.focus();
    },
    /** 처리 중 — DS.popup.busy(true): 닫는 길(X · 취소 · Esc · 배경)을 막는다. 끝나면 DS.popup.busy(false) 후 close() 또는 안에 오류를 보인다 */
    busy: function (on) {
      var el = $(".popup-backdrop[data-ds-popup] .popup"); if (!el) return;
      if (on) el.setAttribute("aria-busy", "true"); else el.removeAttribute("aria-busy");
      $$("[data-popup-close]", el).forEach(function (b) { b.disabled = !!on; });
    },
    close: function () {
      var bd = $(".popup-backdrop[data-ds-popup]"); if (!bd) return;
      var el = $(".popup", bd); if (el && el._dsPlaceholder) { el._dsPlaceholder.parentNode.replaceChild(el, el._dsPlaceholder); delete el._dsPlaceholder; }
      bd.remove(); doc.body.style.overflow = "";
      var prev = popup._prev; popup._prev = null; if (prev && prev.focus && doc.contains(prev)) prev.focus();
    },
  };

  function popupKeeps(bd) { var el = $(".popup", bd); return !el || el.matches(".danger, [aria-busy='true']") || el.dataset.dsDirty === "1"; }
  ["input", "change"].forEach(function (ev) { doc.addEventListener(ev, function (e) { var p = closest(e.target, ".popup-backdrop[data-ds-popup] .popup"); if (p) p.dataset.dsDirty = "1"; }, true); });
  doc.addEventListener("click", function (e) { var it = closest(e.target, ".popup-backdrop[data-ds-popup] .menu-item, .popup-backdrop[data-ds-popup] [role=gridcell]"); if (it) closest(it, ".popup").dataset.dsDirty = "1"; }, true);   // Select · Date Picker 는 input 이벤트를 내지 않는다

  /* ---------- Side Panel(사람의 결정 — 비모달 기본, 모달 옵션) ----------
     DS.panel.open("#id") / DS.panel.close(). 비모달은 뒤 페이지를 그대로 쓸 수 있다 — 가두지 않고 스크롤도 잠그지 않으며, 패널 안에 포커스가 있을 때만 Esc 로 닫는다.
     data-modal 이면 배경 · 가둠 · 스크롤 잠금. 한 번에 하나 — 열려 있는데 다른 패널을 열면 바꿔 끼운다 */
  var panel = {
    open: function (sel) {
      var el = typeof sel === "string" ? $(sel) : sel; if (!el) return;
      var cur = $(".side-panel.fixed:not([hidden])"), from = doc.activeElement;
      if (cur && cur !== el) { from = cur._dsPrev || from; panel.close(cur, true); }
      el._dsPrev = from;
      if (cur !== el) { var ph = doc.createComment("side-panel"); el.parentNode.insertBefore(ph, el); el._dsPlaceholder = ph; doc.body.appendChild(el); }
      el.hidden = false; el.classList.add("fixed");
      if (el.hasAttribute("data-modal") && !$(".side-panel-dim")) { var dim = doc.createElement("div"); dim.className = "side-panel-dim"; doc.body.insertBefore(dim, el); doc.body.style.overflow = "hidden"; }
      el.tabIndex = -1; el.focus({ preventScroll: true });
    },
    close: function (el, swapping) {
      el = el || $(".side-panel.fixed:not([hidden])"); if (!el || !el.classList.contains("fixed")) return;   // 문서 예제처럼 띄우지 않은 패널은 닫을 것이 없다
      var inside = el.contains(doc.activeElement), modal = el.hasAttribute("data-modal"), prev = el._dsPrev;
      el.hidden = true; el.classList.remove("fixed");
      if (el._dsPlaceholder) { el._dsPlaceholder.parentNode.replaceChild(el, el._dsPlaceholder); delete el._dsPlaceholder; }
      var dim = $(".side-panel-dim"); if (dim) { dim.remove(); doc.body.style.overflow = ""; }
      el._dsPrev = null;
      if (swapping) return;
      fire(el, "ds:panel-close");
      if ((inside || modal) && prev && prev.focus && doc.contains(prev)) prev.focus();   // 사용자가 뒤 페이지로 옮겨 갔으면 포커스를 뺏지 않는다
    },
  };

  /* ---------- Tooltip — 화면 끝 뒤집기 · 잘림 방지 · Esc ----------
     보이고 숨는 것은 CSS(JS 없이도 뜬다). 올릴 때 재서, 화면을 넘으면 반대쪽으로, 스크롤 영역 안이거나 옆으로 넘치면 화면 기준으로 띄운다 */
  var TIP_OPP = { top: "bottom", bottom: "top", left: "right", right: "left" };
  function tipSide(tip, side) { ["bottom", "left", "right"].forEach(function (c) { tip.classList.toggle(c, c === side); }); }
  function placeTip(w) {
    var tip = $(":scope > .tooltip", w); if (!tip || w.classList.contains("show")) return;
    var base = tip.dataset.side || (["bottom", "left", "right"].filter(function (c) { return tip.classList.contains(c); })[0] || "top"); tip.dataset.side = base;
    var r = w.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, gap = 8, vw = window.innerWidth, vh = window.innerHeight;
    var room = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right }, vert = base === "top" || base === "bottom", need = (vert ? th : tw) + gap + 8, side = base;
    if (room[base] < need && room[TIP_OPP[base]] > room[base]) side = TIP_OPP[base];
    tipSide(tip, side);
    var x = side === "left" ? r.left - gap - tw : side === "right" ? r.right + gap : r.left + r.width / 2 - tw / 2;
    var y = side === "top" ? r.top - gap - th : side === "bottom" ? r.bottom + gap : r.top + r.height / 2 - th / 2;
    var cx = Math.max(8, Math.min(x, vw - tw - 8)), cy = Math.max(8, Math.min(y, vh - th - 8));
    if (inClipper(w) || cx !== x) {
      tip.style.setProperty("--float-x", cx + "px"); tip.style.setProperty("--float-y", cy + "px"); tip.style.setProperty("--float-arrow", (r.left + r.width / 2 - cx) + "px");
      tip.classList.add("float");
    } else tip.classList.remove("float");
  }
  function tipEnter(e) { var w = closest(e.target, ".tooltip-wrap"); if (!w || w._dsTip) return; w._dsTip = true; placeTip(w); }
  function tipLeave(e) { var w = closest(e.target, ".tooltip-wrap"); if (!w || w.contains(e.relatedTarget)) return; if (e.type === "mouseout" ? w.contains(doc.activeElement) : w.matches(":hover")) return; w._dsTip = false; w.classList.remove("quiet"); }
  doc.addEventListener("mouseover", tipEnter); doc.addEventListener("focusin", tipEnter);
  doc.addEventListener("mouseout", tipLeave); doc.addEventListener("focusout", tipLeave);

  /* ---------- Text Field 카운터 · Onboard 단계 ---------- */
  function syncCounter(input) {
    var f = closest(input, ".field"), c = f && $(".counter", f); if (!c) return;
    var max = Number(input.getAttribute("maxlength") || input.getAttribute("data-maxlength")); c.textContent = input.value.length + (max > 0 ? " / " + max : ""); c.classList.toggle("over", max > 0 && input.value.length > max);
  }
  /* ---------- Combobox(사람의 결정 2026-11-09) ----------
     옵션이 많거나 여러 개 고를 때. 포커스는 입력에 두고 aria-activedescendant 로 옮긴다. 값을 새로 만들지 않는다 — 목록에 있는 것만 고른다 */
  var X_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>';
  function cbInput(h) { return $("input[role=combobox]", h); }
  function cbItems(h) { return $$(".menu-item", h); }
  function cbLabel(i) { return i.textContent.trim(); }
  function cbValue(i) { return i.dataset.value != null ? i.dataset.value : cbLabel(i); }
  function cbOn(h) { return cbItems(h).filter(function (i) { return i.classList.contains("on"); }); }
  function cbMulti(h) { return h.hasAttribute("data-multiple"); }
  function cbVisible(h) { return cbItems(h).filter(function (i) { return !i.hidden && i.getAttribute("aria-disabled") !== "true"; }); }
  function cbLive(h, text) { var s = $(":scope > [role=status]", h); if (s) s.textContent = text; }
  function cbActive(h, item) {
    var inp = cbInput(h); cbItems(h).forEach(function (i) { i.classList.remove("active"); });
    if (item) { item.classList.add("active"); inp.setAttribute("aria-activedescendant", item.id); item.scrollIntoView({ block: "nearest" }); } else inp.removeAttribute("aria-activedescendant");
  }
  function cbFilter(h) {
    var inp = cbInput(h), remote = h.getAttribute("data-filter") === "none", q = remote || !h._dsTyped ? "" : inp.value.trim().toLowerCase(), menu = $(".menu", h);
    if (!remote) cbItems(h).forEach(function (i) { i.hidden = !!q && cbLabel(i).toLowerCase().indexOf(q) < 0; });
    var vis = cbVisible(h), shown = cbItems(h).filter(function (i) { return !i.hidden; }).length, auto = $(".menu-state[data-auto]", menu), none = !!q && !shown && !$(".menu-state:not([data-auto])", menu);   // 비활성 항목만 맞아도 '없음'은 아니다 — 후보만 비운다
    if (none && !auto) { auto = doc.createElement("li"); auto.className = "menu-state"; auto.setAttribute("role", "presentation"); auto.setAttribute("data-auto", ""); auto.textContent = "일치하는 항목이 없습니다. 다른 검색어를 입력하세요."; menu.appendChild(auto); }
    if (!none && auto) auto.remove();
    if (q) cbLive(h, none ? "일치하는 항목이 없습니다." : "결과 " + shown + "개");
    cbActive(h, q ? vis[0] : cbOn(h).filter(function (i) { return !i.hidden; })[0] || null);
  }
  /* 고른 값을 칩 · 숨은 input 으로 옮긴다 — 칩은 옵션 순서 */
  function cbSync(h) {
    var on = cbOn(h), name = h.getAttribute("data-name"), multi = cbMulti(h), inp = cbInput(h), ctrl = $(".control", h);
    if (multi) {
      $$(".chip", ctrl).forEach(function (c) { c.remove(); });
      on.forEach(function (i) { var c = doc.createElement("span"), l = doc.createElement("span"), x = doc.createElement("button"); c.className = "chip sm"; c.dataset.value = cbValue(i); l.className = "lbl"; l.textContent = cbLabel(i); x.type = "button"; x.className = "x"; x.setAttribute("aria-label", cbLabel(i) + " 제거"); x.innerHTML = X_ICON; c.appendChild(l); c.appendChild(x); ctrl.insertBefore(c, inp); });
    }
    if (name) { $$("input[type=hidden]", h).forEach(function (x) { x.remove(); }); (multi ? on.map(cbValue) : [on[0] ? cbValue(on[0]) : ""]).forEach(function (v) { var x = doc.createElement("input"); x.type = "hidden"; x.name = name; x.value = v; h.appendChild(x); }); }
  }
  function cbFire(h) { var on = cbOn(h); fire(h, "ds:select", { value: cbMulti(h) ? on.map(cbValue) : on[0] ? cbValue(on[0]) : "" }); }
  function cbCheck(h) { var inp = cbInput(h), form = closest(inp, "form[data-validate]"); if (form && h._dsTouched && closest(inp, ".field")) { vShow(inp, vMessage(inp)); vChanged(form); } }
  function cbOpen(h, open) {
    var inp = cbInput(h); if (inp.disabled || h.classList.contains("open") === open) return;
    h.classList.toggle("open", open); inp.setAttribute("aria-expanded", String(open));
    if (open) { h._dsTouched = true; h.dataset.dsOpened = "1"; cbFilter(h); placeMenu(h); } else { delete h.dataset.dsOpened; h.classList.remove("up", "float"); cbActive(h, null); }
  }
  function cbToggle(h, item, on) { item.classList.toggle("on", on); item.setAttribute("aria-selected", String(on)); }
  function cbPick(h, item) {
    var inp = cbInput(h), label = cbLabel(item);
    if (cbMulti(h)) { var on = !item.classList.contains("on"); cbToggle(h, item, on); inp.value = ""; h._dsTyped = false; cbSync(h); cbFilter(h); cbActive(h, item); cbLive(h, label + (on ? " 선택됨" : " 선택 해제됨")); inp.focus(); }
    else { cbItems(h).forEach(function (i) { cbToggle(h, i, i === item); }); inp.value = label; h._dsTyped = false; cbSync(h); cbOpen(h, false); cbLive(h, label + " 선택됨"); inp.focus(); }
    cbFire(h); cbCheck(h);
  }
  function cbRemove(h, chip) {
    var item = cbItems(h).filter(function (i) { return cbValue(i) === chip.dataset.value; })[0]; if (!item) return;
    cbToggle(h, item, false); cbSync(h); cbLive(h, cbLabel(item) + " 선택 해제됨"); cbInput(h).focus(); cbFire(h); h._dsTouched = true; cbCheck(h);
  }
  /* 포커스가 떠날 때 — 글자를 비웠으면 선택 해제, 고르지 않은 글자는 고른 값으로 되돌린다 */
  function cbLeave(h) {
    var inp = cbInput(h), on = cbOn(h)[0]; if (h.dataset.dsOpened) cbOpen(h, false);   // 처음부터 열린 예제(.open 만)는 그대로
    if (cbMulti(h)) inp.value = "";
    else if (!inp.value.trim() && on) { cbToggle(h, on, false); cbSync(h); cbFire(h); }
    else inp.value = on ? cbLabel(on) : "";
    h._dsTyped = false; cbCheck(h);
  }
  function cbKey(e, h) {
    var inp = cbInput(h), open = h.classList.contains("open"), k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault(); if (!open) { cbOpen(h, true); return true; }
      var vis = cbVisible(h), i = vis.indexOf($(".menu-item.active", h)), n = k === "ArrowDown" ? (i + 1) % vis.length : i <= 0 ? vis.length - 1 : i - 1; if (vis.length) cbActive(h, vis[n]); return true;
    }
    if (k === "Enter" && open) { e.preventDefault(); var a = $(".menu-item.active", h); if (a) cbPick(h, a); return true; }
    if (k === "Escape" && open) { e.preventDefault(); cbOpen(h, false); return true; }
    if (k === "Backspace" && cbMulti(h) && !inp.value) { var last = $$(".chip", h).pop(); if (last) { e.preventDefault(); cbRemove(h, last); } return true; }
    return false;
  }
  function cbInit(h) {
    var inp = cbInput(h), menu = $(".menu", h); if (!inp || !menu || h._dsInit) return; h._dsInit = true;
    if (!menu.id) menu.id = "cb" + Math.random().toString(36).slice(2, 8); inp.setAttribute("aria-controls", menu.id);
    menu.tabIndex = -1;   // 스크롤되는 목록은 Chromium 에서 Tab 칸이 된다 — Tab 이 목록에 멈춰 떠남이 일어나지 않았다
    cbItems(h).forEach(function (i, n) { if (!i.id) i.id = menu.id + "-" + n; });
    if (!$(":scope > [role=status]", h)) { var s = doc.createElement("span"); s.className = "sr-only"; s.setAttribute("role", "status"); h.insertBefore(s, menu.nextSibling); }
    if (cbMulti(h) || h.getAttribute("data-name")) cbSync(h);
  }

  /* ---------- 입력 검증 — form[data-validate] ----------
     Interaction › Input errors(사람의 결정 2026-11-09). 표준 제약(required · pattern · min · max · minlength · type)과 글자 수 한도(data-maxlength), Select · Combobox 의 data-required 를 본다.
     포커스가 떠날 때 필드 단위 — 건드리지 않은 빈 필드는 탭으로 지나가도 오류를 내지 않는다. 오류가 있는 필드는 입력할 때마다 다시 재 바로 지운다.
     제출하면 전부 재고, 막으면 첫 오류로 포커스 · 스크롤, 3개 이상이면 폼 위에 요약. Date Picker 는 스스로 재므로 .error 만 센다.
     Checkbox · Radio 그룹은 .field 안 fieldset 의 data-required — 하나 이상 고른다. 문구는 React validation.ts 와 같아야 한다 */
  var V_MSG = { fileRequired: "필수 항목입니다. 파일을 선택하세요.", fileBusy: "파일을 전송하고 있습니다. 끝난 뒤 다시 저장하세요.", fileFailed: "올리지 못한 파일이 있습니다. 지우거나 다시 시도하세요.", fileType: "올릴 수 없는 형식입니다. {types} 파일을 고르세요.", fileSize: "파일이 너무 큽니다. {max} 이하 파일을 고르세요.", fileEmpty: "빈 파일입니다. 내용이 있는 파일을 고르세요.", fileDuplicate: "이미 추가한 파일입니다. 다른 파일을 고르세요.", fileCount: "파일이 너무 많습니다. {max}개까지 올릴 수 있습니다.", fileSend: "전송하지 못했습니다. 다시 시도하세요.", fileAdded: "파일 {ok}개를 추가했습니다.", fileRejected: "{bad}개는 올릴 수 없습니다.", fileRemoved: "{name} 파일을 지웠습니다.", required: "필수 항목입니다. 값을 입력하세요.", choose: "필수 항목입니다. 항목을 선택하세요.", number: "숫자가 아닙니다. 숫자를 입력하세요.", email: "이메일 형식이 아닙니다. 예: admin@example.com", url: "URL 형식이 아닙니다. 예: https://example.com", pattern: "형식이 맞지 않습니다. 도움말을 확인하세요.", min: "값이 너무 작습니다. {min} 이상 입력하세요.", max: "값이 너무 큽니다. {max} 이하 입력하세요.", minlength: "글자 수가 모자랍니다. {minlength}자 이상 입력하세요.", step: "입력할 수 없는 값입니다. {step} 단위로 입력하세요.", length: "글자 수가 {over}자 넘었습니다. {limit}자 이하로 줄이세요." };
  function vIsField(t) { return !!(t && t.matches && t.matches(".field input, .field textarea") && !closest(t, ".datepicker") && ["checkbox", "radio", "hidden", "file"].indexOf(t.type) < 0); }
  function vChoice(el) { return closest(el, ".dropdown[data-required], .combobox[data-required], .checkbox-group[data-required], .radio-group[data-required], .upload"); }
  function vEmpty(host) { if (host.matches(".combobox")) return !cbOn(host).length; if (host.matches(".checkbox-group, .radio-group")) return !$("input:checked", host); var on = $(".menu-item.on", host); return !on || on.dataset.value === ""; }
  function vFields(form) { return $$(".field input, .field textarea, .field .dropdown[data-required] .trigger, .field .checkbox-group[data-required], .field .radio-group[data-required], .field .upload .upload-pick", form).filter(function (i) { return !i.disabled && i.type !== "checkbox" && i.type !== "radio" && i.type !== "file" && ((vIsField(i) && i.willValidate) || vChoice(i)); }); }
  function vMsgs(inp) {
    var out = {}, k; for (k in V_MSG) out[k] = V_MSG[k];
    [closest(inp, "form[data-validate]"), inp].forEach(function (el) {
      var raw = el && el.getAttribute("data-messages"), o = {}; if (!raw) return;
      try { o = JSON.parse(raw) || {}; } catch (e) { if (!labelWarned[raw]) { labelWarned[raw] = 1; if (window.console) console.warn("[ds.js] data-messages 가 JSON 이 아닙니다 — 기본 문구를 씁니다: " + raw); } }
      for (k in o) out[k] = o[k];
    });
    return out;
  }
  function vLimit(inp) { return Number(inp.getAttribute("data-maxlength")) || 0; }
  function vMessage(inp) {
    var host = vChoice(inp); if (host) return host.matches(".upload") ? upMessage(host) : vEmpty(host) ? vMsgs(inp).choose : "";
    var v = inp.validity, limit = vLimit(inp), over = limit ? inp.value.length - limit : 0;
    var key = v.valueMissing ? "required" : v.badInput ? "number" : v.typeMismatch ? (inp.type === "email" ? "email" : "url") : v.patternMismatch ? "pattern" : v.rangeUnderflow ? "min" : v.rangeOverflow ? "max" : v.tooShort ? "minlength" : v.stepMismatch ? "step" : over > 0 ? "length" : "";
    if (!key) return "";
    var data = { min: inp.min, max: inp.max, minlength: inp.minLength, step: inp.step, over: over, limit: limit };
    return vMsgs(inp)[key].replace(/\{(\w+)\}/g, function (m, k) { return data[k]; });
  }
  /* 도움말을 라이브 영역으로 준비한다 — 글자가 들어오기 전에 있어야 스크린 리더가 읽는다 */
  function vHelp(inp) {
    var f = closest(inp, ".field"), help = $(":scope > .help", f);
    if (!help) { help = doc.createElement("span"); help.className = "help"; f.appendChild(help); }
    if (!help.id) help.id = (inp.id || "fld" + Math.random().toString(36).slice(2, 8)) + "-help";
    help.setAttribute("aria-live", "polite");
    var ids = (inp.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean); if (ids.indexOf(help.id) < 0) inp.setAttribute("aria-describedby", ids.concat(help.id).join(" "));
    return help;
  }
  function vShow(inp, msg) {
    var f = closest(inp, ".field"), help = vHelp(inp), on = f.classList.contains("error");
    if (msg) { if (!on) help._orig = help.textContent; help.textContent = msg; f.classList.add("error"); inp.setAttribute("aria-invalid", "true"); }
    else if (on) { f.classList.remove("error"); help.textContent = help._orig || ""; inp.removeAttribute("aria-invalid"); }
  }
  var V_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>';
  function vLabel(f) { var l = $("legend", f) || $("label", f); return l ? l.textContent.replace(/\*\s*$/, "").trim() : ""; }
  function vSummary(form) {
    if (!form._tried) return;
    var bad = $$(".field.error", form), box = $(":scope > [data-form-summary]", form);
    if (bad.length < 3) { if (box) box.remove(); return; }
    if (!box) { box = doc.createElement("div"); box.className = "notice danger form-summary"; box.setAttribute("role", "alert"); box.setAttribute("data-form-summary", ""); box.innerHTML = '<span class="ico">' + V_ICON + '</span><div><b></b><span></span></div>'; form.insertBefore(box, form.firstChild); }
    $("b", box).textContent = "입력값 " + bad.length + "개를 확인하세요"; $(":scope > div > span", box).textContent = bad.map(vLabel).filter(Boolean).join(", ");
  }
  /** 폼 전체 검증 — 통과하면 true. 제출 버튼이 아닌 곳에서 부를 때 DS.validate(form) */
  function vRun(form) {
    form._tried = true;
    vFields(form).forEach(function (i) { vShow(i, vMessage(i)); });
    vSummary(form);
    var bad = $$(".field.error", form);
    form.dispatchEvent(new CustomEvent("ds:validate", { bubbles: true, detail: { valid: !bad.length, errors: bad.map(function (f) { return { label: vLabel(f), message: ($(":scope > .help", f) || {}).textContent || "" }; }) } }));
    if (bad.length) { var first = $("input:not([type=hidden]),textarea,button", bad[0]); if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: "center" }); } }
    return !bad.length;
  }
  function vChanged(form) { if (form) vSummary(form); }
  /* Select — 열었다가 고르지 않고 닫으면 알린다. 건드리지 않은 필드는 제출할 때 */
  function vTouch(dd) { var tr = $(".trigger", dd), form = closest(dd, "form[data-validate]"); if (tr && form && dd.hasAttribute("data-required") && closest(dd, ".field")) { vShow(tr, vMessage(tr)); vChanged(form); } }

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
  /* Search — 필터형(data-debounce, 기본 300ms)은 입력이 멈춘 뒤, Enter · 지우기 · Esc 는 기다리지 않고 ds:search {value, trigger} */
  function searchFire(sb, inp, trigger) { clearTimeout(inp._dsSearch); fire(sb, "ds:search", { value: inp.value, trigger: trigger }); }
  function searchClear(sb, inp) { inp.value = ""; inp.focus(); inp.dispatchEvent(new Event("input", { bubbles: true })); searchFire(sb, inp, "clear"); }

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
    if ((el = closest(t, ".menu-state [data-retry]"))) { fire(closest(el, ".dropdown, .combobox"), "ds:retry"); return; }
    if ((el = closest(t, ".tbl [data-retry]"))) { fire(closest(el, ".tbl-wrap"), "ds:retry"); return; }
    if ((el = closest(t, ".combobox .x"))) { var cbh = closest(el, ".combobox"); if (!cbInput(cbh).disabled) cbRemove(cbh, closest(el, ".chip")); return; }
    if ((el = closest(t, ".combobox .menu-item"))) { if (el.getAttribute("aria-disabled") !== "true") cbPick(closest(el, ".combobox"), el); return; }
    if ((el = closest(t, ".combobox .control"))) { var cbc = closest(el, ".combobox"), cbi = cbInput(cbc); if (!cbi.disabled) { cbi.focus(); cbOpen(cbc, t === cbi || !cbc.classList.contains("open")); } return; }
    if ((el = closest(t, ".menu-item"))) { if (el.getAttribute("aria-disabled") === "true") return; selectItem(el); return; }

    // Tabs
    if ((el = closest(t, ".tabs .tab")) && !el.disabled) { tabPick(el); return; }
    if ((el = closest(t, ".steps .step-btn"))) { var stepLi = closest(el, "li"); fire(el, "ds:step", { index: $$(":scope > li", stepLi.parentNode).indexOf(stepLi) }); return; }
    // Breadcrumb 펼치기
    if ((el = closest(t, ".breadcrumb .more"))) { setTimeout(fitCrumbs, 0); var li = closest(el, "li"), items = (el.dataset.items || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean); if (li && items.length) { var first = null; items.forEach(function (s) { var n = doc.createElement("li"); var a2 = doc.createElement("a"); a2.href = "#"; a2.textContent = s; n.appendChild(a2); li.parentNode.insertBefore(n, li); if (!first) first = a2; }); var ol = li.parentNode; li.remove(); /* 버튼이 사라지니 포커스를 펼친 첫 링크로 — 안 옮기면 body 로 떨어진다 */ if (first) first.focus(); fire(ol, "ds:expand", { items: items }); } return; }
    // Onboard 단계
    if ((el = closest(t, ".onboard [data-step]")) && !el.disabled) { stepTo(closest(el, ".onboard"), el.dataset.step === "prev" ? -1 : 1); return; }
    // 선택형 카드 (데모 링크)
    if ((el = closest(t, ".card-grid .card.clickable")) && !el.disabled && el.getAttribute("aria-disabled") !== "true") {   /* 고를 수 없는 선택 카드(Card 정의 2026-11-02) — button 은 disabled, 그 밖은 aria-disabled */ $$(".card.clickable", closest(el, ".card-grid")).forEach(function (c) { var on = c === el; c.classList.toggle("on", on); /* 선택은 .on 만으로는 보조기기에 전해지지 않는다 */ if (c.tagName === "BUTTON") c.setAttribute("aria-pressed", on ? "true" : "false"); }); fire(el, "ds:select", { value: (el.querySelector(".title") || el).textContent.trim() }); return; }
    // Select Button
    if ((el = closest(t, ".select-btn > button")) && !el.disabled) { activate(closest(el, ".select-btn"), "button", el, "aria-checked"); fire(el, "ds:select"); return; }
    // Chip
    if ((el = closest(t, ".chip .x"))) { if (!el.disabled) { var gone = closest(el, ".chip"); chipFocusAfter(gone); dismiss(gone); } return; }   // 비활성 입력값 칩은 지우지 않는다 — CSS pointer-events 만 믿으면 보조기술의 클릭이 지운다
    if ((el = closest(t, "button.chip[aria-pressed]")) && !el.disabled) { var on = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", on); el.setAttribute("aria-pressed", String(on)); syncChipReset(el.parentNode); return; }
    if ((el = closest(t, "[data-chip-reset]"))) { var cg = closest(el, ".chip-group"); $$(":scope > .chip.on[aria-pressed]", cg).forEach(function (c) { c.classList.remove("on"); c.setAttribute("aria-pressed", "false"); }); syncChipReset(cg); var c1 = $(":scope > button.chip:not([disabled])", cg); if (c1) c1.focus(); fire(cg, "ds:chip-reset"); return; }
    // Tile
    if ((el = closest(t, ".tile[aria-pressed]")) && !el.disabled) { var o2 = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", o2); el.setAttribute("aria-pressed", String(o2)); return; }
    // List listbox
    if ((el = closest(t, '.list[role=listbox] > li[role=option]'))) { activate(closest(el, ".list"), "li", el, "aria-selected"); return; }
    // Pagination
    if ((el = closest(t, ".pagination.cursor button")) && !el.disabled) { fire(closest(el, ".pagination"), "ds:page", { direction: el.dataset.cursor }); return; }
    if ((el = closest(t, ".pagination button")) && !el.disabled) { paginate(closest(el, ".pagination"), el); return; }
    if ((el = closest(t, ".select-notice [data-select-all]"))) { var aw = closest(el, ".tbl-wrap"); aw._dsAll = true; var am = $("th.check input", aw); syncRow(am); var at = $("[data-select-clear]", aw); if (at) at.focus(); fire(aw, "ds:select-all", { all: true, total: Number(aw.dataset.total) }); return; }
    if ((el = closest(t, ".select-notice [data-select-clear]"))) { var cw = closest(el, ".tbl-wrap"), cm = $("th.check input", cw); cw._dsAll = false; $$("tbody td.check input:checked", cw).forEach(function (c) { c.checked = false; syncRow(c); }); if (cm) cm.focus(); fire(cw, "ds:select-all", { all: false, total: Number(cw.dataset.total) }); return; }
    // SideNav · TopBar 활성
    if ((el = closest(t, ".sidenav a, .topbar nav a"))) { var nav = closest(el, ".sidenav, .topbar nav"); $$("a", nav).forEach(function (x) { x.classList.toggle("on", x === el); x.classList.remove("has-on"); x === el ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"); });
      // 하위 항목을 고르면 바로 위 부모가 .has-on — 접힌 레일은 하위 항목을 숨기므로 부모가 선택 모양과 aria-current="true" 를 이어받는다
      if (el.classList.contains("sub")) { var par = el.previousElementSibling; while (par && par.matches("a.sub")) par = par.previousElementSibling; if (par && par.tagName === "A") { par.classList.add("has-on"); if (nav.classList.contains("collapsed")) par.setAttribute("aria-current", "true"); } }
      return; }
    // Text Field 비밀번호 표시 — 포커스는 버튼에 남는다
    if ((el = closest(t, ".number-field .num-btn"))) { numStep(el); return; }
    if ((el = closest(t, ".code-view .copy, .copy-field .copy"))) { copyRun(el); return; }
    if ((el = closest(t, ".field .reveal"))) { var pw = $("input", closest(el, ".affix")); if (pw) { var showPw = pw.type === "password"; pw.type = showPw ? "text" : "password"; el.setAttribute("aria-pressed", String(showPw)); var cfHost = closest(el, ".copy-field"); if (cfHost) fire(cfHost, "ds:reveal", { shown: showPw }); } return; }
    // Search 지우기
    if ((el = closest(t, ".searchbar .clear"))) { var sbc = closest(el, ".searchbar"), inp = $("input", sbc); if (inp) searchClear(sbc, inp); return; }
    // DatePicker · Calendar
    if ((el = closest(t, ".datepicker .cal-btn")) && !el.disabled) { var dp = closest(el, ".datepicker"); if (dp.classList.contains("open")) closeDP(dp, false); else openDP(dp, el); return; }
    if ((el = closest(t, ".calendar")) && calClick(el, t)) return;
    // Notice · Toast
    if ((el = closest(t, ".notice .close"))) { var ntc = closest(el, ".notice"); if (e.detail === 0) focusPast(ntc); dismiss(ntc); return; }
    if ((el = closest(t, ".banner .close"))) { var bnr = closest(el, ".banner"); if (e.detail === 0) focusPast(bnr); fire(bnr, "ds:banner-close"); dismiss(bnr); return; }
    if ((el = closest(t, ".toast .action, .toast .close"))) { closeToast(closest(el, ".toast"), e.detail === 0); return; }
    // Popup — 입력 중 · 위험 확인 · 처리 중에는 배경을 눌러도 닫지 않는다(Interaction › Overlays)
    if (t.classList.contains("popup-backdrop")) { if (!popupKeeps(t)) popup.close(); return; }
    if ((el = closest(t, ".popup [data-popup-close]"))) { popup.close(); return; }
    // Side Panel
    if (t.classList.contains("side-panel-dim")) { panel.close(); return; }
    if ((el = closest(t, ".side-panel [data-panel-close]"))) { panel.close(closest(el, ".side-panel")); return; }
    if ((el = closest(t, "[data-panel-open]"))) { panel.open(el.getAttribute("data-panel-open")); return; }
    if ((el = closest(t, "[data-popup-open]"))) { popup.open(el.getAttribute("data-popup-open")); return; }
    // Accordion disabled
    if ((el = closest(t, ".accordion.disabled summary"))) { e.preventDefault(); return; }
  });

  // 바깥 클릭: 사용자가 연 Dropdown / DatePicker 닫기
  doc.addEventListener("pointerdown", function (e) {
    $$(".dropdown.open[data-ds-opened]").forEach(function (dd) { if (!dd.contains(e.target)) setOpen(dd, false); });
    $$(".datepicker.open[data-ds-opened]").forEach(function (dp) { if (!dp.contains(e.target)) closeDP(dp, false); });   // 바깥 클릭은 초안을 버리고 포커스는 옮기지 않는다
  }, true);

  /* Loading 버튼과 비활성 링크 버튼: 비활성 링크의 pointer-events:none 는 마우스만 막고 키보드 Enter/Space 는 그대로 click 을 쏜다.
     버튼 자신에 달린 핸들러가 타깃 단계에서 먼저 실행되므로 버블이 아니라 캡처 단계에서 막아야 한다.
     Loading 은 disabled 와 달리 포커스를 남기고 click · mousedown · pointerdown · keydown 넷을 막는다(사람의 정의 2026-10-28).
     loading 에는 pointer-events:none 이 없다 — 있으면 마우스 클릭이 버튼을 지나 뒤의 행 · 카드에서 실행된다.
     keydown 은 이동 키(NAV)와 수정 키 조합(단축키)을 그대로 보낸다 — 문서 캡처에서 끊으면 Esc 닫기 · 화살표 이동 · 전역 단축키가
     loading 동안 멈춘다. 그래서 버튼 자신의 리스너도 이 키들은 받는다(React 는 onKeyDown 을 아예 부르지 않는다). 기본 동작은 Enter/Space 만 막는다 */
  var NAV = ["Tab", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"];
  doc.addEventListener("click", function (e) {
    if (closest(e.target, '.btn.loading,.btn[aria-disabled="true"]')) { e.preventDefault(); e.stopPropagation(); return; }
    /* 필수 약관이 비었으면 버튼에 달린 제품 핸들러까지 가지 않게 캡처에서 막는다 — disabled 일 때 클릭이 가지 않던 약속을 그대로 지킨다 */
    var nx = closest(e.target, ".terms .btn-group .btn.primary"), terms = nx && closest(nx, ".terms"), miss = terms && !nx.disabled ? termsMissing(terms) : [];
    if (miss.length) { e.preventDefault(); e.stopPropagation(); terms._tried = true; termsNotice(terms); miss[0].focus(); }
  }, true);
  ["mousedown", "pointerdown", "keydown"].forEach(function (type) {
    doc.addEventListener(type, function (e) {
      if (!closest(e.target, ".btn.loading") || (type === "keydown" && (NAV.indexOf(e.key) >= 0 || e.ctrlKey || e.metaKey || e.altKey))) return;
      e.stopPropagation();
      if (type !== "keydown" || e.key === "Enter" || e.key === " ") e.preventDefault();
    }, true);
  });

  /* Search 단축키 — 화면의 [data-hotkey] 하나. 입력 중 · 조합키 · 모달이 열린 동안에는 무시한다. 캡처라 페이지의 다른 '/' 보다 먼저다 */
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    var a = doc.activeElement, m = $('[aria-modal="true"]'), hk = $(".searchbar[data-hotkey] input");
    if (!hk || hk.disabled || (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) || (m && m.getClientRects().length)) return;
    e.preventDefault(); hk.focus(); hk.select();
  }, true);
  doc.addEventListener("keydown", function (e) {
    var cbk = closest(e.target, ".combobox input[role=combobox]");
    if (cbk && !e.isComposing && cbKey(e, closest(cbk, ".combobox"))) return;
    var cbx = closest(e.target, ".combobox .x");
    if (cbx && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cbx.click(); return; }
    var si = closest(e.target, ".searchbar input");
    if (si && !e.isComposing) { var sbk = closest(si, ".searchbar");
      if (e.key === "Enter") searchFire(sbk, si, "enter");
      else if (e.key === "Escape" && si.value) { e.preventDefault(); searchClear(sbk, si); return; } }   // 값이 있으면 지우기만 — 대화상자는 닫지 않는다
    var dd = closest(e.target, ".dropdown.open");
    // Date Picker · Calendar — 달력 안 키보드, 입력형 필드의 Enter(확정) · Alt+↓(열기)
    var kc = closest(e.target, ".calendar");
    if (kc && calKey(e, dpHost(kc))) return;
    var cti = closest(e.target, ".cal-time input");
    if (cti) { var cdh = closest(cti, ".datepicker");
      if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); var cap = $('[data-cal="apply"]', calOf(cdh)); if (cap && !cap.disabled) foot(cdh, "apply"); return; }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); clockStep(cdh, cti, e.key === "ArrowUp" ? 1 : -1); return; } }
    var di = closest(e.target, ".datepicker .affix input");
    if (di) { var dh = closest(di, ".datepicker");
      if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); typed(dh); return; }   // 한글 조합 중 Enter 는 조합 확정이다
      if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); var cb = $(".cal-btn", dh); if (!dh.classList.contains("open") && cb && !cb.disabled) openDP(dh, cb); return; }
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !di.readOnly && !di.disabled) { e.preventDefault(); stepSeg(dh, di, e.key === "ArrowUp" ? 1 : -1); return; } }
    if (e.key === "Escape") { var dpo = closest(e.target, ".datepicker.open"); if (dpo) { closeDP(dpo, true); return; }   // 포커스가 든 피커 하나만
      var ddo = $$(".dropdown.open[data-ds-opened]"); if (ddo.length) { ddo.forEach(function (d) { setOpen(d, false); var tr = $("[aria-haspopup]", d); tr && tr.focus(); }); return; }   // 가장 안쪽 것 하나만 — 대화상자는 다음 Esc 에
      var tips = $$(".tooltip-wrap:not(.show):not(.quiet)").filter(function (w) { var tip = $(".tooltip", w); return tip && (w.matches(":hover") || w.contains(doc.activeElement)) && Number(getComputedStyle(tip).opacity) > 0; });
      if (tips.length) { tips.forEach(function (w) { w.classList.add("quiet"); }); return; }   // 보이는 툴팁이 가장 안쪽이다 — 대화상자는 다음 Esc 에
      var pop = $(".popup-backdrop[data-ds-popup]"); if (pop) { if ($(".popup", pop).getAttribute("aria-busy") !== "true") popup.close(); return; }
      var pn = $(".side-panel.fixed:not([hidden])"); if (pn && (pn.hasAttribute("data-modal") || pn.contains(doc.activeElement))) panel.close(pn); return; }
    var ctr = closest(e.target, ".dropdown:not(.open) [aria-haspopup]");
    if (ctr && !ctr.disabled && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setOpen(closest(ctr, ".dropdown"), true); return; }
    if (dd && e.key === "Tab") { var dtr = $("[aria-haspopup]", dd); if (dtr) dtr.focus(); setOpen(dd, false); dd = null; }   // 트리거에서 다음 칸으로 — 목록이 열린 채 포커스만 나가던 것
    var pbd = e.key === "Tab" && $(".popup-backdrop[data-ds-popup]"), pel = e.key === "Tab" && (pbd ? $(".popup", pbd) : $(".side-panel.fixed[data-modal]:not([hidden])"));
    if (pel) { var fl = focusablesIn(pel), cur = doc.activeElement;
      if (!fl.length) { e.preventDefault(); return; }
      if (e.shiftKey && (cur === fl[0] || cur === pel || !pel.contains(cur))) { e.preventDefault(); fl[fl.length - 1].focus(); return; }
      if (!e.shiftKey && (cur === fl[fl.length - 1] || !pel.contains(cur))) { e.preventDefault(); fl[0].focus(); return; } }
    if (dd && e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) { var hit = typeahead(dd, e.key); if (hit) { e.preventDefault(); hit.focus(); } return; }
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
      e.preventDefault(); tabs[tn].focus(); tabPick(tabs[tn]);
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
  /* 입력 검증 — 캡처라 폼 · 버튼에 달린 제품 핸들러보다 먼저 막는다 */
  doc.addEventListener("submit", function (e) { if (e.target.matches && e.target.matches("form[data-validate]") && !vRun(e.target)) { e.preventDefault(); e.stopPropagation(); } }, true);
  doc.addEventListener("focusout", function (e) { var cb = closest(e.target, ".combobox"); if (cb && !cb.contains(e.relatedTarget)) cbLeave(cb); });
  doc.addEventListener("focusout", function (e) { var t = e.target; if (!vIsField(t) || closest(t, ".combobox")) return; var form = closest(t, "form[data-validate]"); if (!form || !t.willValidate) return; if (t._dsDirty || t.value || closest(t, ".field").classList.contains("error")) { vShow(t, vMessage(t)); vChanged(form); } });
  doc.addEventListener("input", function (e) {
    var t = e.target; if (!vIsField(t) || closest(t, ".combobox")) return; t._dsDirty = true;
    if (t.hasAttribute("data-maxlength")) syncCounter(t);
    var form = closest(t, "form[data-validate]"), limit = vLimit(t), over = limit > 0 && t.value.length > limit;
    if (form) { if (t.willValidate && (over || closest(t, ".field").classList.contains("error"))) { vShow(t, vMessage(t)); vChanged(form); } }
    else if (limit) { if (over) { vShow(t, vMessage(t)); t._dsOver = true; } else if (t._dsOver) { vShow(t, ""); t._dsOver = false; } }   // 폼 밖 — 한도 오류만, 제품이 건 오류는 건드리지 않는다
  });
  doc.addEventListener("focusout", function (e) {
    var host = closest(e.target, ".datepicker"), inp = host && $(".affix input", host); if (!inp || inp.readOnly || inp.disabled) return;
    if (e.relatedTarget && host.contains(e.relatedTarget)) return;   // 필드 안(달력 버튼 · 달력)에서 옮기는 동안은 기다린다 — 입력칸 → 달력 버튼 → 바깥으로 Tab 해도 검사한다
    /* 확정 뒤 바뀐 글자가 있을 때만 — 달력을 다시 그리면 포커스된 버튼이 사라지며 relatedTarget 없는 focusout 이 난다. 그때 검사하면 빈 입력으로 초안('오늘' 등)을 지웠다(2026-11-09 실측) */
    if (inp.value.trim() !== S(host).text) typed(host);
  });

  doc.addEventListener("input", function (e) {
    var t = e.target; if (!(t instanceof Element)) return;
    if (t.matches(".slider input[type=range]")) { syncSlider(t); fire(t, "ds:slide", { value: Number(t.value) }); }
    if (t.matches(".datepicker .affix input") && !e.isComposing) dpInput(t, e);
    if (t.matches(".cal-time input") && !e.isComposing) clockInput(t, e);
    if (t.matches(".field input[maxlength], .field textarea[maxlength]")) syncCounter(t);
    if (t.matches(".combobox input[role=combobox]")) { var cbh = closest(t, ".combobox"), rm = cbh.getAttribute("data-filter") === "none"; cbh._dsTyped = true; cbOpen(cbh, true); cbFilter(cbh);
      if (rm) { clearTimeout(t._dsQuery); t._dsQuery = setTimeout(function () { fire(cbh, "ds:query", { query: t.value }); }, 300); } }
    if (t.matches(".searchbar input")) { var sb = closest(t, ".searchbar"), clr = $(".clear", sb), kb = $("kbd", sb); if (clr) clr.hidden = !t.value; if (kb) kb.hidden = !!t.value;
      if (sb.hasAttribute("data-debounce")) { clearTimeout(t._dsSearch); t._dsSearch = setTimeout(function () { searchFire(sb, t, "input"); }, Number(sb.getAttribute("data-debounce")) || 300); } }
  });
  window.addEventListener("scroll", closeFloats, true);
  window.addEventListener("resize", closeFloats);
  doc.addEventListener("mousedown", function (e) { var t = e.target; if (t instanceof Element && (closest(t, ".combobox .menu") || (closest(t, ".combobox .control") && !t.matches("input")))) e.preventDefault(); });   // 목록 · 빈 자리를 눌러도 입력의 포커스를 잃지 않는다
  /* Switch 응답 후 반영(사람의 결정 2026-11-10) — .switch[data-async] 는 눌러도 바뀌지 않고 처리 중이 된다. 제품이 ds:switch 의 resolve() 를 불러야 바뀌고,
     reject(문구) 는 그대로 두고 닫을 때까지 남는 Toast 로 알리며, cancel() 은 조용히 그대로 둔다(보안 기능을 끄는 확인 Popup 의 취소). 포커스를 잃지 않게 disabled 대신 aria-disabled */
  var SWITCH_FAIL = "설정을 바꾸지 못했습니다. 다시 시도하세요.";
  doc.addEventListener("click", function (e) {
    var inp = e.target; if (!(inp instanceof Element) || !inp.matches(".switch[data-async] input")) return;
    var next = inp.checked; e.preventDefault();
    if (inp.disabled || inp.getAttribute("aria-busy") === "true") return;
    inp.setAttribute("aria-busy", "true"); inp.setAttribute("aria-disabled", "true");
    var settled = false, settle = function () { if (settled) return false; settled = true; inp.removeAttribute("aria-busy"); inp.removeAttribute("aria-disabled"); return true; };
    /* 클릭이 끝난 뒤에 알린다 — 브라우저가 취소된 클릭의 checked 를 되돌리므로, 처리기가 바로 resolve 하면 값이 지워진다 */
    setTimeout(function () { fire(inp, "ds:switch", { checked: next, resolve: function () { if (settle()) inp.checked = next; }, cancel: settle, reject: function (msg) { if (settle()) toast(msg || SWITCH_FAIL, { tone: "danger" }); } }); }, 0);
  }, true);
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var li = closest(e.target, ".list[role=listbox] > li[role=option]"); if (!li || li !== e.target) return;
    e.preventDefault(); activate(closest(li, ".list"), "li", li, "aria-selected");
  });
  /* Select Button — 화살표로 옮기면 바로 고른다(Radio 와 같음). 비활성은 건너뛰고 끝에서 돌아온다 */
  doc.addEventListener("keydown", function (e) {
    var b = closest(e.target, ".select-btn[role=radiogroup] > button"), d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!b || !d || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    var g = b.parentNode, live = $$(":scope > button:not([disabled])", g), to = live[(live.indexOf(b) + d + live.length) % live.length];
    if (to !== b) { activate(g, "button", to, "aria-checked"); to.focus(); fire(to, "ds:select"); }
  });
  doc.addEventListener("change", function (e) {
    var vg = e.target instanceof Element && closest(e.target, ".field .checkbox-group[data-required], .field .radio-group[data-required]"), vf = vg && closest(vg, "form[data-validate]");
    if (vf) { vShow(vg, vMessage(vg)); vChanged(vf); }   // 그룹은 고르면 바로 지우고, 마지막 하나를 풀면 바로 알린다. 지나가기만 하면 조용하다
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
  doc.addEventListener("ds:select", function (e) {
    var bar = closest(e.target, ".pagination-bar"); if (!bar || !closest(e.target, ".dropdown")) return;
    var nav = $(".pagination", bar), nums = nav ? $$("button:not([aria-label])", nav) : [], arrows = nav ? $$("button[aria-label]", nav) : [];
    nums.forEach(function (b, i) { b.classList.toggle("on", i === 0); if (i === 0) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (arrows[0]) arrows[0].disabled = true; if (arrows[1]) arrows[1].disabled = nums.length < 2;
    fire(nav || bar, "ds:page", { page: 1, pageSize: Number(e.detail && e.detail.value) });
  });

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { init(); }); else init();
  /* ---------- Number Input — .number-field ----------
     브라우저의 stepUp · stepDown · 표준 제약을 쓴다. 범위 밖 값은 고치지 않고 받아서 오류로 알린다(사람의 결정 2026-11-10).
     버튼은 Tab 에서 뺀다 — 키보드는 위 · 아래 화살표가 같은 일을 한다 */
  function numSync(inp) {
    var f = closest(inp, ".number-field"); if (!f) return;
    var dn = $(".num-btn.down", f), up = $(".num-btn.up", f), unit = $(".affix > span", f), v = inp.valueAsNumber, off = inp.disabled || inp.readOnly;
    var lo = inp.min === "" ? -Infinity : Number(inp.min), hi = inp.max === "" ? Infinity : Number(inp.max);
    if (dn) dn.disabled = off || v <= lo;
    if (up) up.disabled = off || v >= hi;
    if (unit && inp.value !== "") inp.setAttribute("aria-valuetext", inp.value + unit.textContent); else inp.removeAttribute("aria-valuetext");
  }
  function numStep(btn) {
    var inp = $("input", closest(btn, ".affix"));
    if (btn.classList.contains("up")) inp.stepUp(); else inp.stepDown();
    inp.focus({ preventScroll: true });   // 끝에 닿아 버튼이 꺼져도 포커스를 잃지 않게
    inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true }));
  }
  /* 폼 밖에서도 범위를 알린다 — 빈 값은 조용하다(필수 여부는 폼이 잰다) */
  doc.addEventListener("input", function (e) { var t = e.target; if (!t.matches || !t.matches(".number-field input")) return; numSync(t); if (closest(t, ".field").classList.contains("error")) vShow(t, vMessage(t)); });
  doc.addEventListener("focusout", function (e) { var t = e.target; if (t.matches && t.matches(".number-field input") && (t.value || t.validity.badInput)) vShow(t, vMessage(t)); });

  /* ---------- Code · Copy Field — 복사 ----------
     결과는 버튼 자리에서 2초(Toast 를 쓰지 않음). 값은 이벤트에 싣지 않는다 — 민감한 값이 로그로 새지 않게.
     임시 textarea 는 버튼 옆에 둔다 — body 에 두면 바깥을 감지하는 팝오버가 닫힌다 */
  var COPY_ICON = { idle: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666\"/><path d=\"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1\"/></svg>", done: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 12l5 5l10 -10\"/></svg>" };
  var COPY_LABEL = { copied: "복사됨", failed: "복사 실패", copiedStatus: "복사했습니다.", failedStatus: "복사하지 못했습니다. 값을 직접 선택해 복사하세요." };
  function dsLive() { var l = $("body > .ds-live"); if (!l) { l = doc.createElement("div"); l.className = "sr-only ds-live"; l.setAttribute("role", "status"); doc.body.appendChild(l); } return l; }
  function dsSay(msg) { var l = dsLive(); l.textContent = ""; setTimeout(function () { l.textContent = msg; }, 50); }   // 같은 문구를 또 읽게 비웠다가 넣는다
  function copyL(host, k) { var raw = host.getAttribute("data-labels"), o = {}; if (raw) { try { o = JSON.parse(raw) || {}; } catch (e) { o = {}; } } return o[k] || COPY_LABEL[k]; }
  function copyLegacy(text, near, done) {
    var a = doc.activeElement, ta = doc.createElement("textarea"), ok = false;
    ta.value = text; ta.readOnly = true; ta.tabIndex = -1; ta.className = "sr-only"; ta.setAttribute("aria-hidden", "true"); near.appendChild(ta); ta.focus({ preventScroll: true }); ta.select();
    try { ok = doc.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove(); if (a && a.focus) a.focus(); done(ok);
  }
  function copyText(text, near, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { copyLegacy(text, near, done); });
    else copyLegacy(text, near, done);
  }
  function copyMark(btn, host, state) {
    clearTimeout(btn._copyT);
    var t = $(".t", btn); if (t && btn._copyLabel === undefined) btn._copyLabel = t.textContent;
    btn.classList.toggle("copy-done", state === "done"); btn.classList.toggle("copy-failed", state === "fail");
    $(".ico", btn).innerHTML = state === "done" ? COPY_ICON.done : state === "fail" ? V_ICON : COPY_ICON.idle;
    if (t) t.textContent = state === "done" ? copyL(host, "copied") : state === "fail" ? copyL(host, "failed") : btn._copyLabel;
    if (state) btn._copyT = setTimeout(function () { copyMark(btn, host, ""); }, 2000);
  }
  function copyRun(btn) {
    var host = closest(btn, ".code-view, .copy-field"), pre = $("pre", host), inp = $("input", host), val = $(".value", host);
    var text = pre ? pre.textContent : inp ? inp.value : val ? val.textContent : "";
    copyText(text, btn.parentNode, function (ok) { copyMark(btn, host, ok ? "done" : "fail"); dsSay(copyL(host, ok ? "copiedStatus" : "failedStatus")); fire(host, "ds:copy", { ok: ok }); });
  }

  /* ---------- File Upload — .upload ----------
     화면과 검증까지 맡는다(사람의 결정 2026-11-10). 실제 전송은 제품이 ds:upload 를 받아 하고 DS.upload.progress · done · fail 로 알린다.
     거절(형식 · 용량 · 개수 · 중복)은 목록에 오류 줄로 남기고 통과한 파일은 받는다. 하나만 받는 자리는 새 파일로 교체.
     폼에서는 전송 중 · 오류가 있으면 제출을 막는다. 문구는 React validation.ts 와 같아야 한다 */
  var UP_ICON = { file: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M14 3v4a1 1 0 0 0 1 1h4\"/><path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2\"/></svg>", done: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 12l2 2l4 -4\"/></svg>", retry: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4\"/><path d=\"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4\"/></svg>", remove: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6l-12 12\"/><path d=\"M6 6l12 12\"/></svg>" };
  var UP_LABEL = { list: "첨부 파일", retry: "다시 시도", remove: "지우기", done: "완료", progress: "전송" };
  var upSeq = 0;
  function upL(h, k) { var raw = h.getAttribute("data-labels"), o = {}; if (raw) { try { o = JSON.parse(raw) || {}; } catch (e) { o = {}; } } return o[k] || UP_LABEL[k]; }
  function upItems(h) { return $$(".upload-item", h); }
  function upFill(t, d) { return t.replace(/\{(\w+)\}/g, function (m, k) { return d[k]; }); }
  function upSizeText(n) { if (n < 1024) return n + " B"; var u = n < 1048576 ? [1024, "KB"] : n < 1073741824 ? [1048576, "MB"] : [1073741824, "GB"]; return Math.round(n / u[0] * 10) / 10 + " " + u[1]; }
  function upParseSize(s) { var m = /^([\d.]+)\s*(B|KB|MB|GB)?$/i.exec(String(s || "").trim()); return m ? Number(m[1]) * { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 }[(m[2] || "B").toUpperCase()] : 0; }
  function upTypeOk(file, accept) {
    if (!accept) return true;
    var name = file.name.toLowerCase(), type = (file.type || "").toLowerCase();
    return accept.split(",").some(function (a) { a = a.trim().toLowerCase(); if (!a) return false; if (a[0] === ".") return name.slice(-a.length) === a; if (a.slice(-2) === "/*") return type.indexOf(a.slice(0, -1)) === 0; return type === a; });
  }
  function upButton(cls, icon, label) { var b = doc.createElement("button"); b.type = "button"; b.className = "btn sm text assistive icon-only " + cls; b.innerHTML = icon; b.setAttribute("aria-label", label); return b; }
  /* 줄의 상태를 바꾼다 — 지우기 버튼은 그대로 두어 포커스를 잃지 않는다 */
  function upState(h, li, status, pct, msg, retry) {
    li.classList.remove("uploading", "done", "error"); if (status !== "ready") li.classList.add(status);
    $(".ico", li).innerHTML = status === "done" ? UP_ICON.done : status === "error" ? V_ICON : UP_ICON.file;
    var body = $(".body", li), row = $(".row", li), nm = $(".name", li).textContent;
    var bar = $(":scope > .progress", body), m = $(":scope > .msg", body), sr = $(":scope > .sr-only", row), rt = $(".retry", li), rm = $(".remove", li);
    if (status === "uploading") {
      if (!bar) { bar = doc.createElement("div"); bar.className = "progress sm"; bar.setAttribute("role", "progressbar"); bar.setAttribute("aria-valuemin", "0"); bar.setAttribute("aria-valuemax", "100"); bar.setAttribute("aria-label", nm + " " + upL(h, "progress")); bar.innerHTML = "<i></i>"; body.appendChild(bar); }
      var v = Math.max(0, Math.min(100, pct || 0)); bar.setAttribute("aria-valuenow", String(Math.round(v))); $("i", bar).style.width = v + "%";
    } else if (bar) bar.remove();
    if (status === "error") { if (!m) { m = doc.createElement("span"); m.className = "msg"; body.appendChild(m); } m.textContent = msg; } else if (m) m.remove();
    if (status === "done") { if (!sr) { sr = doc.createElement("span"); sr.className = "sr-only"; sr.textContent = " (" + upL(h, "done") + ")"; row.appendChild(sr); } } else if (sr) sr.remove();
    if (retry && !rt) li.insertBefore(upButton("retry", UP_ICON.retry, nm + " " + upL(h, "retry")), rm); else if (!retry && rt) { if (rt === doc.activeElement) rm.focus(); rt.remove(); }
  }
  function upRow(h, id, name, size) {
    var ul = $(".upload-list", h);
    if (!ul) { ul = doc.createElement("ul"); ul.className = "upload-list"; ul.setAttribute("aria-label", upL(h, "list")); h.appendChild(ul); }
    var li = doc.createElement("li"); li.className = "upload-item"; li.dataset.id = id;
    li.innerHTML = '<span class="ico"></span><div class="body"><div class="row"><span class="name"></span><span class="size"></span></div></div>';
    $(".name", li).textContent = name; $(".size", li).textContent = upSizeText(size);
    li.appendChild(upButton("remove", UP_ICON.remove, name + " " + upL(h, "remove")));
    return { ul: ul, li: li };
  }
  function upTell(h, text) { var s = $(":scope > .upload-status", h); if (s) s.textContent = text; }
  function upMessage(h) {
    var msgs = vMsgs(h), rows = upItems(h);
    if (rows.some(function (li) { return li.classList.contains("uploading"); })) return msgs.fileBusy;
    if (rows.some(function (li) { return li.classList.contains("error"); })) return msgs.fileFailed;
    return h.hasAttribute("data-required") && !rows.length ? msgs.fileRequired : "";
  }
  function upTouch(h, show) {
    var pick = $(".upload-pick", h), form = closest(h, "form[data-validate]"), f = closest(h, ".field");
    if (!pick || !form || !f || !(show || form._tried || f.classList.contains("error"))) return;
    /* 전송 중으로 바뀐 것은 실패가 아니다 — 앞선 오류만 지운다. 제출이 막혀 띄운 안내는 끝날 때까지 둔다 */
    var msg = vMessage(pick), busy = msg && msg === vMsgs(h).fileBusy, help = $(":scope > .help", f);
    if (busy && f.classList.contains("error") && help && help.textContent === msg) return;
    vShow(pick, busy ? "" : msg); vChanged(form);
  }
  function upDrop(h, li) {
    if (!li.hasAttribute("data-rejected")) fire(h, "ds:upload-remove", { id: li.dataset.id, file: (h._dsFiles || {})[li.dataset.id] });
    if (h._dsFiles) delete h._dsFiles[li.dataset.id];
    var ul = li.parentNode; li.remove(); if (!ul.children.length) ul.remove();
  }
  function upCheck(h, input, f, rows, ok, limit) {
    var msgs = vMsgs(h), max = upParseSize(h.getAttribute("data-max-size")), accept = input.getAttribute("accept") || "";
    if (!upTypeOk(f, accept)) return upFill(msgs.fileType, { types: accept.split(",").map(function (a) { return a.trim(); }).join(", ") });
    if (!f.size) return msgs.fileEmpty;
    if (max && f.size > max) return upFill(msgs.fileSize, { max: h.getAttribute("data-max-size") });
    if (rows.some(function (r) { return r.name === f.name && r.size === f.size; }) || ok.some(function (o) { return o.file.name === f.name && o.file.size === f.size; })) return msgs.fileDuplicate;
    if (limit && rows.length + ok.length >= limit) return upFill(msgs.fileCount, { max: limit });
    return "";
  }
  function upAdd(h, files) {
    var input = $("input[type=file]", h); if (!files.length || h.classList.contains("disabled")) return;
    if (!input.multiple) upItems(h).forEach(function (li) { upDrop(h, li); });
    var limit = input.multiple ? Number(h.getAttribute("data-max-files")) || 0 : 1, msgs = vMsgs(h), ok = [], bad = 0, files0 = h._dsFiles || (h._dsFiles = {});
    var rows = upItems(h).filter(function (li) { return !li.hasAttribute("data-rejected"); }).map(function (li) { var f = files0[li.dataset.id]; return { name: f ? f.name : $(".name", li).textContent, size: f ? f.size : -1 }; });
    files.forEach(function (f) {
      var msg = upCheck(h, input, f, rows, ok, limit), id = "up-" + (++upSeq), r = upRow(h, id, f.name, f.size);
      if (msg) { bad++; r.li.setAttribute("data-rejected", ""); r.ul.appendChild(r.li); upState(h, r.li, "error", 0, msg, false); return; }
      r.ul.insertBefore(r.li, $(".upload-item[data-rejected]", r.ul)); upState(h, r.li, "ready"); files0[id] = f; ok.push({ id: id, file: f });
    });
    upTell(h, (ok.length ? upFill(msgs.fileAdded, { ok: ok.length }) : "") + (bad ? (ok.length ? " " : "") + upFill(msgs.fileRejected, { bad: bad }) : ""));
    if (ok.length) fire(h, "ds:upload", { files: ok });
    upTouch(h, false);
  }
  function upFind(h, id) { return upItems(h).filter(function (li) { return li.dataset.id === String(id); })[0]; }
  var upload = {
    progress: function (h, id, pct) { var li = upFind(h, id); if (li) upState(h, li, "uploading", pct); },
    done: function (h, id) { var li = upFind(h, id); if (li) { upState(h, li, "done"); upTouch(h, false); } },
    fail: function (h, id, msg) { var li = upFind(h, id); if (li) { upState(h, li, "error", 0, msg || vMsgs(h).fileSend, true); upTouch(h, false); } },
  };
  function upZone(e) { var t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentNode, z = t && closest(t, ".upload-zone"), h = z && z.parentNode; return h && !h.classList.contains("disabled") && e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], "Files") > -1 ? h : null; }
  ["dragenter", "dragover"].forEach(function (n) { doc.addEventListener(n, function (e) { var h = upZone(e); if (h) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; h.classList.add("dragging"); } }); });
  doc.addEventListener("dragleave", function (e) { var h = upZone(e); if (h && !$(".upload-zone", h).contains(e.relatedTarget)) h.classList.remove("dragging"); });
  doc.addEventListener("drop", function (e) { var h = upZone(e); if (h) { e.preventDefault(); h.classList.remove("dragging"); upAdd(h, [].slice.call(e.dataTransfer.files)); } });
  doc.addEventListener("change", function (e) { var t = e.target; if (t.matches && t.matches(".upload input[type=file]")) { var list = [].slice.call(t.files); t.value = ""; upAdd(closest(t, ".upload"), list); } });
  doc.addEventListener("click", function (e) {
    var t = e.target; if (!(t instanceof Element) || t.matches("input[type=file]")) return;
    var li = closest(t, ".upload-item"), h = li && closest(li, ".upload"), rm = closest(t, ".upload-item .remove"), rt = closest(t, ".upload-item .retry"), z = closest(t, ".upload-zone");
    if (rm) {
      var all = upItems(h), i = all.indexOf(li), go = all[i + 1] || all[i - 1], name = $(".name", li).textContent;
      upDrop(h, li); (go ? $(".remove", go) : $(".upload-pick", h)).focus();
      upTell(h, upFill(vMsgs(h).fileRemoved, { name: name })); upTouch(h, h.hasAttribute("data-required") && !upItems(h).length);
    } else if (rt) {
      upState(h, li, "ready"); upTouch(h, false);   // 다시 시도 버튼이 사라지며 포커스는 upState 가 지우기로 옮긴다
      fire(h, "ds:upload-retry", { id: li.dataset.id, file: (h._dsFiles || {})[li.dataset.id] });
    } else if (z && !z.parentNode.classList.contains("disabled")) $("input[type=file]", z).click();
  });

  window.DS = { init: init, toast: toast, popup: popup, panel: panel, table: { removeRow: removeRow }, upload: upload, validate: vRun, version: "0.5" };
})();
