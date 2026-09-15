/* =========================================================
   ds.js — JS Design System 컴포넌트 동작 스크립트 (순수 JS, 의존성 없음)
   assets/style.css 의 클래스 마크업에 동작을 붙인다. 이벤트 위임 방식이라 동적으로 추가된 마크업에도 적용.
   사용: <script src="assets/ds.js" defer></script>  (React 제품은 @jiran/ds-react 를 쓰고 이 파일은 불필요)
   - Dropdown / Select: 트리거 토글 · 항목 선택(트리거 텍스트 갱신) · 바깥 클릭 · Esc · ↑↓ Home End
   - Tabs · Select Button · Chip · Tile · List(listbox) · Pagination · SideNav/TopBar 활성 전환
   - Slider(--p·값 표시) · Search(지우기) · DatePicker/Calendar(열기·달 이동·날짜 선택, 달력 자동 생성)
   - Checkbox 전체선택(indeterminate) · 약관 동의 · Data Table(정렬·행 선택·액션 바)
   - Notice 닫기 · Toast 액션/자동 소멸 · Popup 배경 클릭 닫기 · Accordion disabled
   - Tabs 패널 텍스트 · Breadcrumb .more 펼치기(data-items) · Onboard 단계 이동([data-step]) · 달력 프리셋([data-preset]) · Text Field 글자 수(.counter) · 선택형 카드(.card-grid .card.clickable)
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
  }

  /* ---------- Dropdown ---------- */
  function setOpen(dd, open) {
    dd.classList.toggle("open", open);
    var t = $("[aria-haspopup]", dd); if (t) t.setAttribute("aria-expanded", String(open));
    if (open) { dd.dataset.dsOpened = "1"; var items = itemsOf(dd); var sel = items.filter(function (i) { return i.classList.contains("on"); })[0]; var f = sel || items[0]; if (f) f.focus(); }
    else delete dd.dataset.dsOpened;
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

  /* ---------- Calendar ---------- */
  function buildCalendar(cal, month, selected) {
    var y = month.getFullYear(), m = month.getMonth();
    var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate(), offset = first.getDay();
    var rows = Math.ceil((offset + days) / 7), today = new Date();
    cal.dataset.month = y + "-" + pad(m + 1);
    var head = $(".cal-head", cal);
    if (!head) { head = doc.createElement("div"); head.className = "cal-head"; cal.insertBefore(head, cal.firstChild); }
    head.innerHTML = '<button type="button" aria-label="이전 달">' + ICON["chevron-left"] + "</button><span>" + y + "년 " + (m + 1) + "월</span>" + '<button type="button" aria-label="다음 달">' + ICON["chevron-right"] + "</button>";
    var grid = $(".cal-grid", cal);
    if (!grid) { grid = doc.createElement("div"); grid.className = "cal-grid"; head.after(grid); }
    var html = ["일", "월", "화", "수", "목", "금", "토"].map(function (d) { return '<span class="dow">' + d + "</span>"; }).join("");
    for (var i = 0; i < rows * 7; i++) {
      var d = new Date(y, m, i - offset + 1), muted = d.getMonth() !== m, on = selected && fmt(d) === fmt(selected), isToday = fmt(d) === fmt(today);
      html += '<button type="button" class="day' + (muted ? " muted" : "") + (isToday ? " today" : "") + (on ? " on" : "") + '" data-date="' + fmt(d) + '"' + (on ? ' aria-selected="true"' : "") + ">" + d.getDate() + "</button>";
    }
    grid.innerHTML = html;
    if (!$(".cal-foot", cal)) { var foot = doc.createElement("div"); foot.className = "cal-foot"; foot.innerHTML = '<button type="button" class="btn sm text" data-cal="today">오늘</button><button type="button" class="btn sm primary" data-cal="apply">적용</button>'; cal.appendChild(foot); }
  }
  function ensureCalendar(dp) {
    var cal = $(".calendar", dp);
    if (!cal) {
      cal = doc.createElement("div"); cal.className = "calendar"; cal.setAttribute("role", "dialog"); cal.setAttribute("aria-label", "날짜 선택"); dp.appendChild(cal);
      var btn = $(".field-btn", dp), txt = btn ? btn.textContent : "", ds = [], re = /(\d{4})-(\d{2})-(\d{2})/g, mm;
      while ((mm = re.exec(txt))) ds.push(new Date(+mm[1], +mm[2] - 1, +mm[3]));
      if (btn && $(".sep", btn)) dp.dataset.range = "1";
      buildCalendar(cal, ds[0] || new Date(), ds[0]);
      if (dp.dataset.range && ds[1]) markRange(cal, ds[0], ds[1]);
    }
    return cal;
  }
  function markRange(cal, a, b) {
    $$(".day", cal).forEach(function (d) { var t = new Date(d.dataset.date); var s = fmt(a), e = fmt(b), k = d.dataset.date; d.classList.toggle("on", k === s || k === e); k === s || k === e ? d.setAttribute("aria-selected", "true") : d.removeAttribute("aria-selected"); d.classList.toggle("in-range", k > s && k < e); });
  }
  function monthOf(cal) { var mm = (cal.dataset.month || "").split("-"); if (mm.length === 2) return new Date(+mm[0], +mm[1] - 1, 1); var t = ($(".cal-head span", cal) || {}).textContent || ""; var k = t.match(/(\d{4})년\s*(\d{1,2})월/); return k ? new Date(+k[1], +k[2] - 1, 1) : new Date(); }
  function selectedOf(cal) { var on = $(".day.on", cal); if (!on) return null; if (on.dataset.date) { var p = on.dataset.date.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); } var mo = monthOf(cal); return new Date(mo.getFullYear(), mo.getMonth(), Number(on.textContent)); }
  function pickDay(day) {
    var cal = closest(day, ".calendar"); if (!cal) return;
    var dp0 = closest(cal, ".datepicker"), range = (dp0 && dp0.dataset.range) || $(".day.in-range", cal) || $$(".day.on", cal).length > 1;
    if (range) { // range 모드: 시작·끝 갱신 (간단히: 첫 클릭 시작, 둘째 클릭 끝)
      var ons = $$(".day.on", cal);
      $$(".day", cal).forEach(function (d) { d.classList.remove("in-range"); });
      if (ons.length !== 1) { ons.forEach(function (d) { d.classList.remove("on"); d.removeAttribute("aria-selected"); }); day.classList.add("on"); day.setAttribute("aria-selected", "true"); return; }
      var all = $$(".day", cal), a = all.indexOf(ons[0]), b = all.indexOf(day); if (a === b) return;
      var lo = Math.min(a, b), hi = Math.max(a, b);
      all.forEach(function (d, i) { if (i > lo && i < hi) d.classList.add("in-range"); });
      day.classList.add("on"); day.setAttribute("aria-selected", "true"); return;
    }
    $$(".day", cal).forEach(function (d) { d.classList.remove("on"); d.removeAttribute("aria-selected"); });
    day.classList.add("on"); day.setAttribute("aria-selected", "true");
    var dp = closest(cal, ".datepicker");
    if (dp && !$(".cal-foot", cal)) applyDate(dp);
  }
  function applyDate(dp) {
    var cal = $(".calendar", dp), d = cal && selectedOf(cal), btn = $(".field-btn", dp);
    if (btn && d) {
      var svg = $("svg", btn), ons = $$(".day.on", cal);
      if (dp.dataset.range && ons.length === 2) { var a = ons[0].dataset.date || fmt(d), b = ons[1].dataset.date || fmt(d); btn.textContent = ""; btn.appendChild(doc.createTextNode(a + " ")); var sep = doc.createElement("span"); sep.className = "sep"; sep.textContent = "~"; btn.appendChild(sep); btn.appendChild(doc.createTextNode(" " + b + " ")); d = new Date(b); }
      else { btn.textContent = fmt(d) + " "; }
      if (svg) btn.appendChild(svg);
    }
    dp.classList.remove("open"); btn && btn.setAttribute("aria-expanded", "false");
    fire(dp, "ds:date", { value: d ? fmt(d) : null });
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
    // 데모용 # 링크는 이동하지 않음
    var a = closest(t, 'a[href="#"]'); if (a) e.preventDefault();

    // Dropdown 트리거
    if ((el = closest(t, ".dropdown [aria-haspopup]")) && !el.disabled) { var dd = closest(el, ".dropdown"); setOpen(dd, !dd.classList.contains("open")); return; }
    if ((el = closest(t, ".menu-item"))) { if (el.getAttribute("aria-disabled") === "true") return; selectItem(el); return; }

    // Tabs
    if ((el = closest(t, ".tabs .tab")) && !el.disabled) { var tabs = closest(el, ".tabs"); activate(tabs, ".tab", el, "aria-selected"); var pn = tabs.nextElementSibling; if (pn && pn.classList.contains("tab-panel") && !pn.hasAttribute("data-static")) pn.textContent = el.textContent.trim().replace(/\s*\d+$/, "") + " 탭의 내용이 여기에 표시됩니다."; fire(el, "ds:tab"); return; }
    // Breadcrumb 펼치기
    if ((el = closest(t, ".breadcrumb .more"))) { var li = closest(el, "li"), items = (el.dataset.items || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean); if (li && items.length) { items.forEach(function (s) { var n = doc.createElement("li"); var a2 = doc.createElement("a"); a2.href = "#"; a2.textContent = s; n.appendChild(a2); li.parentNode.insertBefore(n, li); }); li.remove(); } return; }
    // Onboard 단계
    if ((el = closest(t, ".onboard [data-step]")) && !el.disabled) { stepTo(closest(el, ".onboard"), el.dataset.step === "prev" ? -1 : 1); return; }
    // 선택형 카드 (데모 링크)
    if ((el = closest(t, '.card-grid .card.clickable[href="#"]'))) { $$(".card.clickable", closest(el, ".card-grid")).forEach(function (c) { c.classList.toggle("on", c === el); }); fire(el, "ds:select", { value: (el.querySelector(".title") || el).textContent.trim() }); return; }
    // Select Button
    if ((el = closest(t, ".select-btn > button")) && !el.disabled) { activate(closest(el, ".select-btn"), "button", el, "aria-pressed"); fire(el, "ds:select"); return; }
    // Chip
    if ((el = closest(t, ".chip .x"))) { dismiss(closest(el, ".chip")); return; }
    if ((el = closest(t, "button.chip[aria-pressed]")) && !el.disabled) { var on = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", on); el.setAttribute("aria-pressed", String(on)); return; }
    // Tile
    if ((el = closest(t, ".tile[aria-pressed]")) && !el.disabled) { var grid = closest(el, ".tile-grid"), single = grid && grid.dataset.single !== undefined; if (single) activate(grid, ".tile", el, "aria-pressed"); else { var o2 = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", o2); el.setAttribute("aria-pressed", String(o2)); } return; }
    // List listbox
    if ((el = closest(t, '.list[role=listbox] > li[role=option]'))) { activate(closest(el, ".list"), "li", el, "aria-selected"); return; }
    // Pagination
    if ((el = closest(t, ".pagination button")) && !el.disabled) { paginate(closest(el, ".pagination"), el); return; }
    // SideNav · TopBar 활성
    if ((el = closest(t, ".sidenav a, .topbar nav a"))) { var nav = closest(el, ".sidenav, .topbar nav"); $$("a", nav).forEach(function (x) { x.classList.toggle("on", x === el); x === el ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"); }); return; }
    // Search 지우기
    if ((el = closest(t, ".searchbar .clear"))) { var inp = $("input", closest(el, ".searchbar")); if (inp) { inp.value = ""; inp.focus(); inp.dispatchEvent(new Event("input", { bubbles: true })); } return; }
    // DatePicker
    if ((el = closest(t, ".datepicker .field-btn")) && !el.disabled) { var dp = closest(el, ".datepicker"); var open = !dp.classList.contains("open"); if (open) ensureCalendar(dp); dp.classList.toggle("open", open); el.setAttribute("aria-expanded", String(open)); dp.dataset.dsOpened = open ? "1" : ""; return; }
    if ((el = closest(t, ".calendar .cal-head button"))) { var cal = closest(el, ".calendar"); var mo = monthOf(cal), dir = /이전|prev/i.test(el.getAttribute("aria-label") || "") ? -1 : 1; buildCalendar(cal, new Date(mo.getFullYear(), mo.getMonth() + dir, 1), selectedOf(cal)); return; }
    if ((el = closest(t, ".calendar .day")) && !el.disabled) { pickDay(el); return; }
    if ((el = closest(t, ".calendar [data-preset]"))) { var c3 = closest(el, ".calendar"), n = Number(el.dataset.preset) || 7, end = new Date(), start = new Date(); start.setDate(end.getDate() - (n - 1)); buildCalendar(c3, end, null); markRange(c3, start, end); var dp3 = closest(c3, ".datepicker"); if (dp3) { dp3.dataset.range = "1"; } fire(c3, "ds:date", { value: fmt(start) + " ~ " + fmt(end) }); return; }
    if ((el = closest(t, ".calendar [data-cal=today], .calendar .cal-foot .btn.text"))) { var c2 = closest(el, ".calendar"); buildCalendar(c2, new Date(), new Date()); return; }
    if ((el = closest(t, ".calendar [data-cal=apply], .calendar .cal-foot .btn.primary"))) { var dp2 = closest(el, ".datepicker"); if (dp2) applyDate(dp2); return; }
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
    $$(".datepicker.open[data-ds-opened='1']").forEach(function (dp) { if (!dp.contains(e.target)) { dp.classList.remove("open"); var b = $(".field-btn", dp); b && b.setAttribute("aria-expanded", "false"); dp.dataset.dsOpened = ""; } });
  }, true);

  doc.addEventListener("keydown", function (e) {
    var dd = closest(e.target, ".dropdown.open");
    if (e.key === "Escape") { $$(".dropdown.open[data-ds-opened]").forEach(function (d) { setOpen(d, false); var tr = $("[aria-haspopup]", d); tr && tr.focus(); }); $$(".datepicker.open[data-ds-opened='1']").forEach(function (dp) { dp.classList.remove("open"); }); if ($(".popup-backdrop[data-ds-popup]")) popup.close(); return; }
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
