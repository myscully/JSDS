/* =========================================================
   ds.js — JS Design System 컴포넌트 동작 스크립트 (순수 JS, 의존성 없음)
   assets/style.css 의 클래스 마크업에 동작을 붙인다. 이벤트 위임 방식이라 동적으로 추가된 마크업에도 적용.
   사용: <script src="assets/ds.js" defer></script>  (React 제품은 @jiran/ds-react 를 쓰고 이 파일은 불필요)
   - Dropdown / Select: 트리거 토글 · 항목 선택(트리거 텍스트 갱신) · 바깥 클릭 · Esc · ↑↓ Home End
   - Tabs · Select Button · Chip · Tile · List(listbox) · Pagination · SideNav/TopBar 활성 전환
   - Slider(--p·값 표시) · Search(지우기) · DatePicker/Calendar(입력 'YYYY. MM. DD' 자동 형식 · ↑↓ 조각 이동, 단위 연 · 월 · 일, 단일 · 기간(두 달), locale(Intl) · timezone(dayjs 가 있으면), 유효하지 않은 값 상태, 달 · 연 이동, 키보드, min/max, 하단 버튼 · 즉시 적용, 위로 펼침)
   - Checkbox 전체선택(indeterminate) · 약관 동의 · Data Table(정렬·행 선택·액션 바)
   - Notice 닫기 · Toast 액션/자동 소멸 · Popup 배경 클릭 닫기 · Accordion disabled
   - Tabs 패널 텍스트 · Breadcrumb .more 펼치기(data-items) · Steps 마법사(.stepper — 패널 · 이전 · 다음 · 완료 · 검증, ds:step · ds:step-finish) · 달력 프리셋([data-preset]) — 확정은 ds:date {value, start, end, date, text, validity, 기간은 sides} · Text Field 글자 수(.counter) · 선택형 카드(.card-grid .card.clickable)
   ========================================================= */
(function () {
  "use strict";
  var doc = document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var closest = function (el, sel) { return el && el.closest ? el.closest(sel) : null; };
  var ICON = {
    "clock": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/></svg>',
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
      w.className = "tooltip-wrap"; tip.className = "tooltip multi"; tip.setAttribute("role", "tooltip"); tip.setAttribute("aria-hidden", "true"); tip.textContent = el.textContent;
      el.parentNode.insertBefore(w, el); w.appendChild(el); w.appendChild(tip);
      if (el.tagName !== "A") el.tabIndex = 0;
    });
  }
  /* 표의 말줄임 칸(td.truncate)도 같다 — 잘린 칸만 전체 값 Tooltip(2026-11-12). title 은 키보드로 볼 수 없다.
     칸 폭은 창 크기를 따라 바뀌므로 다시 재서, 잘리지 않게 된 칸은 풀어 둔다. 비활성 행 안에서는 Tab 칸을 만들지 않는다.
     Tooltip 은 칸 글자와 같아 aria-hidden — 그렇지 않으면 표를 읽을 때 칸 값이 두 번 읽힌다(Breadcrumb 도 같은 이유) */
  function fitCells(root) {
    $$(".tbl td.truncate", root || doc).forEach(function (td) {
      var w = $(":scope > .tooltip-wrap", td), el = w ? $(":scope > .cell-text", w) : td, cut = el.scrollWidth > el.clientWidth;
      if (cut && !w) {
        var t = doc.createElement("span"), tip = doc.createElement("span"); w = doc.createElement("span");
        w.className = "tooltip-wrap"; t.className = "cell-text"; tip.className = "tooltip multi"; tip.setAttribute("role", "tooltip"); tip.setAttribute("aria-hidden", "true");
        while (td.firstChild) t.appendChild(td.firstChild);
        tip.textContent = t.textContent; w.appendChild(t); w.appendChild(tip); td.appendChild(w);
        if (!closest(td, "tr.disabled")) t.tabIndex = 0;
      } else if (!cut && w) {
        if (w.contains(doc.activeElement)) return;   // 포커스를 받고 있는 칸은 그대로 — 풀면 포커스가 사라진다
        while (el.firstChild) td.insertBefore(el.firstChild, w);
        td.removeChild(w);
      }
    });
  }
  /* 입력값 칩의 긴 값(.lbl 240 말줄임)도 같다 — 잘린 값에만 Tooltip(2026-11-12, title 대신). 키보드는 지우기 버튼에 포커스가 오면 값을 펼쳐 읽는다(CSS) */
  function fitChips(root) {
    $$(".chip > .lbl", root || doc).forEach(function (el) {
      if (el.scrollWidth <= el.clientWidth) return;
      var w = doc.createElement("span"), tip = doc.createElement("span");
      w.className = "tooltip-wrap"; tip.className = "tooltip multi"; tip.setAttribute("role", "tooltip"); tip.setAttribute("aria-hidden", "true"); tip.textContent = el.textContent;
      el.parentNode.insertBefore(w, el); w.appendChild(el); w.appendChild(tip);
    });
  }
  /* Steps — 가로 · 라벨 아래 배치가 자리에 안 들어가면 .stacked 로 세로로 쌓는다(2026-11-13 — 사람의 결정 '좁으면 세로로').
     클래스를 뗀 모양에서 넘치는지 잰다 — 붙인 채로는 늘 들어가 보여서. .vertical 은 이미 세로라 재지 않는다 */
  function fitSteps(root) {
    $$(".steps:not(.vertical)", root || doc).forEach(function (ol) {
      ol.classList.remove("stacked");
      if (ol.offsetParent !== null && ol.scrollWidth > ol.clientWidth + 1) ol.classList.add("stacked");
    });
  }
  var fitTimer = 0;
  window.addEventListener("resize", function () { fitSteps(); clearTimeout(fitTimer); fitTimer = setTimeout(function () { fitCells(); }, 150); });
  function init(root) {
    fitSteps(root);
    doc.fonts.ready.then(function () { fitCrumbs(root); fitCells(root); fitChips(root); fitSteps(root); });
    $$(".number-field input", root || doc).forEach(numSync);
    dsLive();   // 알림 영역은 미리 — 복사하는 순간 새로 넣으면 대개 읽히지 않는다
    root = root || doc;
    $$("input.mixed", root).forEach(function (i) { i.indeterminate = true; });
    $$(".slider input[type=range]", root).forEach(syncSlider);
    $$(".tabs[role=tablist]", root).forEach(function (b) { tabSync(b); var on = $(".tab.on", b); if (on) tabReveal(on); });
    $$(".select-btn[role=radiogroup]", root).forEach(function (g) { var kids = $$(":scope > button", g), live = kids.filter(function (b) { return !b.disabled; }), cur = live.filter(function (b) { return b.classList.contains("on"); })[0] || live[0]; kids.forEach(function (b) { b.tabIndex = b === cur ? 0 : -1; }); });
    $$(".chip-group", root).forEach(syncChipReset);
    $$("[data-sidenav-toggle]", root).forEach(navSync);
    if (NAV_MQ) navAutoList(root).forEach(function (n) { if (!n._dsAuto) { n._dsAuto = true; if (NAV_MQ.matches) navSet(n, true, "width"); } });   // 처음 그릴 때 한 번 — 다시 init 해도 사용자가 편 상태를 되돌리지 않는다
    themeSync();
    $$(".tbl th.check input, .checkbox-group > .checkbox:first-child input", root).forEach(syncMaster);
    $$(".tbl-wrap > .action-bar", root).forEach(function (bar) { var w = bar.parentNode, t = $("table.tbl", w); barOff(bar, !(t && $("tbody td.check input:checked", t)) && !w._dsAll); });
    $$(".terms", root).forEach(syncTerms);
    $$(".searchbar .clear", root).forEach(function (c) { var i = $("input", closest(c, ".searchbar")); if (i) c.hidden = !i.value; });
    $$(".combobox", root).forEach(cbInit);
    $$("form[data-draft]", root).forEach(draftRestore);
    $$(".dropdown .trigger .placeholder", root).forEach(function (p) { closest(p, ".trigger").dataset.placeholder = p.textContent; });
    $$(".searchbar kbd", root).forEach(function (k) { var i = $("input", closest(k, ".searchbar")); if (i) k.hidden = !!i.value; });
    $$(".toast-stack.fixed .toast[data-duration]", root).forEach(scheduleToast);
    $$(".field input[maxlength], .field textarea[maxlength], .field [data-maxlength]", root).forEach(syncCounter);
    $$(".field [data-maxlength]", root).forEach(vHelp);
    $$("form[data-validate]", root).forEach(function (f) { f.noValidate = true; vFields(f).forEach(vHelp); });
    $$(".stepper", root).forEach(spPaint);
    /* Date Picker — 확정 값을 처음부터 data-* 에 둔다(필드 글자 · 정적 달력에서 읽어). 단독 달력만 host 다 */
    $$(".datepicker", root).forEach(function (h) { S(h); });
    $$(".timepicker", root).forEach(tpInit);
    $$(".code-inputs", root).forEach(codeInit);
    $$(".tree", root).forEach(trInit);
    $$(".notify", root).forEach(nfInit);
    $$(".calendar", root).forEach(function (c) { if (!closest(c, ".datepicker")) { S(c); dpFitStatic(c); } });
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
  /* Date Picker 달력 · Time Picker 열 목록의 자리(사람의 요청 2026-11-17 — 팝업 안에서 잘렸다). 넘침을 자르는 영역(팝업 · 패널 본문 · 표) 안이면 화면 기준(.float)으로 띄운다.
     화면 기준으로 뜬 조상(달력 안의 시각 칸)을 만나면 거기서 멈춘다 — 그 바깥 영역은 더는 자르지 않는다. 아래 자리가 모자라고 위가 더 넓으면 위로, 오른쪽으로 넘치면 왼쪽으로 당긴다 */
  function pickerClip(el, each) { for (var p = el.parentElement; p && p !== doc.body; p = p.parentElement) { var c = getComputedStyle(p); if (c.position === "fixed") return false; if (/auto|scroll|hidden|clip/.test(c.overflowX + c.overflowY) && each(p)) return true; } return false; }
  function pickerSpot(host, panel, up0) {
    var anchor = $(":scope > .affix", host) || host, hr = host.getBoundingClientRect(), r = anchor.getBoundingClientRect(), h = panel.offsetHeight, w = panel.offsetWidth, gap = 4, vw = doc.documentElement.clientWidth;
    var below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = up0 == null ? below < h && above > below : up0;
    var fl = pickerClip(host, function () { return true; }), top = up ? r.top - gap - h : r.bottom + gap, left = Math.max(8, Math.min(hr.left, vw - 8 - w));
    return { up: up, float: fl, top: fl ? top : top - hr.top, left: fl ? left : left - hr.left };
  }
  /* 필드가 자르는 영역 밖으로 나갔는지 — 나갔으면 띄운 목록이 엉뚱한 자리에 남지 않게 닫는다 */
  function pickerHidden(host) {
    var r = ($(":scope > .affix", host) || host).getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= window.innerHeight) return true;
    return pickerClip(host, function (p) { var q = p.getBoundingClientRect(); return r.bottom <= q.top || r.top >= q.bottom || r.right <= q.left || r.left >= q.right; });
  }
  /* 띄운 달력 · 시각 목록은 바깥이 스크롤되면 필드를 따라간다(방향은 그대로). 목록 자신의 스크롤은 그대로 */
  function followPickers(e) {
    $$(".datepicker.float.open, .timepicker.float.open").forEach(function (h) {
      var dp = h.matches(".datepicker"), panel = dp ? calOf(h) : $(":scope > .time-panel", h);
      if (e.type === "scroll" && e.target instanceof Node && panel && panel.contains(e.target)) return;
      if (pickerHidden(h)) {
        var had = h.contains(doc.activeElement), inp = $(":scope > .affix input", h);
        if (dp) closeDP(h, false); else tpClose(h, false);
        if (had && inp) inp.focus({ preventScroll: true });
        return;
      }
      if (dp) place(h, true); else tpPlace(h, true);
    });
  }
  /* 띄운 메뉴는 트리거를 따라가지 못하므로 스크롤 · 창 크기 변경에 닫는다. 메뉴 자신의 스크롤은 그대로 */
  function closeFloats(e) {
    $$(".tooltip.float").forEach(function (tip) { var w = tip.parentNode; if (!w._dsTip) return; if (e.type === "scroll" && w.contains(doc.activeElement)) placeTip(w); else w.classList.add("quiet"); });   // 포커스로 온 툴팁은 따라간다 — 포커스가 일으킨 스크롤에 사라지면 키보드로는 볼 수 없다
    $$(".dropdown.float.open, .combobox.float.open").forEach(function (d) {
      if (e.type === "scroll" && $(".menu", d).contains(e.target)) return;
      if (d.matches(".combobox")) { cbOpen(d, false); return; }
      setOpen(d, false); var tr = $("[aria-haspopup]", d); if (tr) tr.focus({ preventScroll: true });
    });
    $$(".notify.float.open").forEach(function (h) { if (e.type === "scroll" && nfPanel(h).contains(e.target)) return; nfOpen(h, false, true); });   // 알림 패널도 — 본문 스크롤은 그대로
  }
  function setOpen(dd, open) {
    dd.classList.toggle("open", open);
    var t = $("[aria-haspopup]", dd); if (t) t.setAttribute("aria-expanded", String(open));
    if (open) { dd.dataset.dsOpened = "1"; placeMenu(dd); var items = itemsOf(dd); mcSnap(dd); var sel = items.filter(function (i) { return i.classList.contains("on") || (i.getAttribute("role") === "option" && i.getAttribute("aria-selected") === "true"); })[0]; var f = sel || items[0] || $(".menu-state button", dd); if (f) f.focus(); }
    else { delete dd.dataset.dsOpened; dd.classList.remove("up", "float"); mcRestore(dd); vTouch(dd); }
  }
  /* 글자로 항목 찾기 — 0.5초 안의 글자를 이어 붙이고, 같은 글자를 반복하면 다음 항목으로. 'ㅂ' 은 초성으로 '보안팀' 에 맞는다 */
  var CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  function cho(s) { return s.replace(/[가-힣]/g, function (c) { return CHO[Math.floor((c.charCodeAt(0) - 44032) / 588)]; }); }
  function typeahead(dd, key) {
    var ta = dd._dsType || (dd._dsType = { s: "", t: 0 }), now = Date.now(); if (now - ta.t > 500) ta.s = ""; ta.t = now; ta.s += key.toLowerCase();
    var rep = ta.s.split("").every(function (c) { return c === ta.s[0]; }), q = rep ? ta.s[0] : ta.s, items = itemsOf(dd), i = items.indexOf(doc.activeElement), from = rep ? i + 1 : Math.max(i, 0);
    return items.slice(from).concat(items.slice(0, from)).filter(function (x) { var l = ($(".menu-name", x) || x).textContent.trim().toLowerCase(); return l.indexOf(q) === 0 || cho(l).indexOf(q) === 0; })[0];
  }
  function itemsOf(dd) { return $$(".menu-item:not([aria-disabled=true])", dd).map(function (i) { if (!i.hasAttribute("tabindex")) i.tabIndex = -1; return i; }); }

  /* 메뉴의 체크 · 라디오 항목과 Select 여러 개(사람의 결정 2026-11-23 — Montage Menu · Select 참고).
     켜고 끄는 동안 메뉴는 열린 채이고 포커스도 그 항목에 남는다. 실행 항목(menuitem)과 단일 Select 는 지금처럼 닫는다.
     아래 초기화 · 적용 영역(.menu[data-actions])이 있으면 고르는 것은 초안 — 적용해야 이벤트가 나고, 적용 없이 닫히면(Esc · 바깥 · Tab) 열 때로 되돌린다 */
  function mcAttr(i) { return i.getAttribute("role") === "option" ? "aria-selected" : "aria-checked"; }
  function mcOn(i) { return i.getAttribute(mcAttr(i)) === "true"; }
  function mcSet(i, on) { i.setAttribute(mcAttr(i), String(on)); }
  function mcToggles(i) { var r = i.getAttribute("role"); return r === "menuitemcheckbox" || r === "menuitemradio" || (r === "option" && !!closest(i, '.dropdown [aria-multiselectable="true"]')); }
  function mcItems(dd) { return $$('.menu-item[role=menuitemcheckbox], .menu-item[role=menuitemradio], [aria-multiselectable="true"] .menu-item[role=option]', dd); }
  function mcVal(i) { return i.dataset.value != null ? i.dataset.value : ($(".menu-name", i) || i).textContent.trim(); }
  function mcName(i) { var g = closest(i, "[role=group][data-name]"), dd = closest(i, ".dropdown"); return g ? g.dataset.name : (dd && dd.getAttribute("data-name")) || ""; }
  function mcValues(dd) { return mcItems(dd).filter(mcOn).map(mcVal); }
  function mcGroups(dd) { var g = {}; mcItems(dd).forEach(function (i) { var n = mcName(i); g[n] = g[n] || []; if (mcOn(i)) g[n].push(mcVal(i)); }); return g; }
  function mcDraft(dd) { return !!$(".menu[data-actions]", dd); }
  function mcFire(dd, item, trigger) {
    if (dd.hasAttribute("data-multiple")) { fire(dd, "ds:select", { values: mcValues(dd), trigger: trigger }); return; }
    fire(dd, "ds:menu-change", { name: item ? mcName(item) : null, value: item ? mcVal(item) : null, checked: item ? mcOn(item) : null, values: mcValues(dd), groups: mcGroups(dd), trigger: trigger });
  }
  function mcToggle(item) {
    var dd = closest(item, ".dropdown");
    if (dd && mcDraft(dd) && !dd._dsSnap) mcSnap(dd);   // 처음부터 열린 메뉴(문서 예제)도 적용 없이 닫으면 되돌아가게
    if (item.getAttribute("role") === "menuitemradio") $$("[role=menuitemradio]", closest(item, "[role=group]") || closest(item, ".menu")).forEach(function (r) { mcSet(r, r === item); });
    else mcSet(item, !mcOn(item));
    if (!item.hasAttribute("tabindex")) item.tabIndex = -1;   // 처음부터 열린 메뉴는 itemsOf 를 거치지 않아 아직 포커스를 받지 못한다
    item.focus();
    if (!dd) return;
    if (dd.hasAttribute("data-multiple")) { selMulti(dd); var mt = $(".trigger", dd); if (mt && mt.getAttribute("aria-invalid") === "true") vTouch(dd); }   // 오류가 떠 있으면 고르는 순간 지운다
    if (!mcDraft(dd)) mcFire(dd, item, "toggle");
  }
  function mcSnap(dd) { dd._dsSnap = mcDraft(dd) ? mcItems(dd).map(function (i) { return [i, mcOn(i)]; }) : null; }
  function mcRestore(dd) { var sn = dd._dsSnap; dd._dsSnap = null; if (!sn) return; sn.forEach(function (p) { mcSet(p[0], p[1]); }); if (dd.hasAttribute("data-multiple")) selMulti(dd); }
  /* 초기화 — 체크는 모두 끄고 라디오는 data-default(없으면 첫 항목)로. 적용 전까지는 초안이다. 끈 항목은 그대로 */
  function mcReset(dd) {
    if (mcDraft(dd) && !dd._dsSnap) mcSnap(dd);
    mcItems(dd).forEach(function (i) { if (i.getAttribute("aria-disabled") !== "true" && i.getAttribute("role") !== "menuitemradio") mcSet(i, false); });
    $$("[role=group]", dd).forEach(function (g) { var rs = $$("[role=menuitemradio]", g); if (!rs.length) return; var d = rs.filter(function (r) { return r.hasAttribute("data-default"); })[0] || rs[0]; rs.forEach(function (r) { mcSet(r, r === d); }); });
    if (dd.hasAttribute("data-multiple")) selMulti(dd);
  }
  function mcApply(dd) { dd._dsSnap = null; mcFire(dd, null, "apply"); setOpen(dd, false); var tr = $("[aria-haspopup]", dd); if (tr) tr.focus(); }
  /* Select 여러 개 — 트리거 글은 고른 이름을 쉼표로(넘치면 말줄임, data-overflow="wrap" 이면 줄바꿈), 모두 고르면 data-all-label. 폼 값은 값마다 숨은 input 하나 */
  function selMulti(dd) {
    var t = $(".trigger", dd), on = $$('.menu-item[role=option][aria-selected="true"]', dd), all = $$('.menu-item[role=option]:not([aria-disabled="true"])', dd);
    if (t) { t.textContent = ""; var sp = doc.createElement("span");
      if (!on.length) { sp.className = "placeholder"; sp.textContent = t.dataset.placeholder || ""; }
      else { sp.className = "trigger-text"; sp.textContent = dd.dataset.allLabel && all.length && all.every(mcOn) ? dd.dataset.allLabel : on.map(function (i) { return ($(".menu-name", i) || i).textContent.trim(); }).join(", "); }
      t.appendChild(sp); }
    var nm = dd.getAttribute("data-name"); if (nm) { $$(":scope > input[type=hidden]", dd).forEach(function (h) { dd.removeChild(h); }); on.forEach(function (i) { var h = doc.createElement("input"); h.type = "hidden"; h.name = nm; h.value = mcVal(i); dd.appendChild(h); }); }
  }
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
    tabSync(bar); tabReveal(el); fire(el, "ds:tab", { value: el.dataset.value != null ? el.dataset.value : el.textContent.trim().replace(/\s*\d+$/, ""), index: Array.prototype.indexOf.call(bar.querySelectorAll(".tab"), el) });
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
    var sf = closest(input, ".slider-field"), su = sf && $(".affix > span", sf); if (su) input.setAttribute("aria-valuetext", v + su.textContent);
  }
  /* Slider + 숫자 입력 — 두 칸이 값 하나를 나눠 쓴다(사람의 결정 2026-11-11). 트랙을 움직이면 입력칸이 바로 따라가고(input · change 를 낸다),
     입력칸에 수를 치면 트랙이 따라간다 — 범위 밖이면 가까운 끝(브라우저가 range 를 범위 · step 에 맞춘다). 입력칸의 글자는 고치지 않고 오류는 Number Input 의 규칙대로 */
  function sliderPair(t, kind) {
    var f = closest(t, ".slider-field"); if (!f) return;
    var r = $(".slider input[type=range]", f), n = $(".affix input[type=number]", f); if (!r || !n) return;
    if (t === r) { n.value = r.value; n.dispatchEvent(new Event(kind, { bubbles: true })); }
    else if (kind === "input" && n.value !== "" && !n.validity.badInput) { r.value = n.value; syncSlider(r); }
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
  var LABELS = { dialog: "날짜 선택", reset: "초기화", cancel: "취소", apply: "적용", prevMonth: "이전 달", nextMonth: "다음 달", prevYear: "이전 연도", nextYear: "다음 연도", prevYears: "이전 12년", nextYears: "다음 12년", chooseYear: "연도 선택", yearGrid: "연도 목록", backToDays: "날짜로 돌아가기", backToMonths: "월 선택으로", recent: "최근 {n}일", time: "시각", startTime: "시작 시각", endTime: "종료 시각", timeOpen: "선택" };
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
  var MSG = { incomplete: "{subject} 덜 입력됐습니다. {example} 처럼 끝까지 입력하세요.", invalid: "{subject} 달력에 없습니다. 달력에서 고르거나 {example} 처럼 입력하세요.", min: "{subject} 범위를 벗어났습니다. {min} 부터 입력할 수 있습니다.", max: "{subject} 범위를 벗어났습니다. {max} 까지 입력할 수 있습니다.", order: "종료일이 시작일보다 빠릅니다. 시작일과 같거나 늦은 날짜로 바꾸세요.", subject: "날짜가", startSubject: "시작일이", endSubject: "종료일이", long: "기간이 {days}일을 넘습니다. {days}일 이내로 고르세요.", invalidTime: "{subject} 24시간제 형식이 아닙니다. {example} 처럼 입력하세요.", orderTime: "종료 시각이 시작 시각보다 빠릅니다. 시작과 같거나 늦은 시각으로 바꾸세요.", timeSubject: "시각이", startTimeSubject: "시작 시각이", endTimeSubject: "종료 시각이" };
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
    /* 한국어가 아닌 표기면 달력에 lang — 스크린 리더가 그 언어로 읽는다(3.1.2) */
    var lc = dpLocale(host); if (/^ko\b/i.test(lc)) cal.removeAttribute("lang"); else cal.setAttribute("lang", lc);
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
      var one = function (x) { return x.length === 1 ? "0" + x : x; };   // 시각만 쓰는 단위는 첫 조각(시)도 채운다 — 2:0 → 02:00(날짜의 첫 조각은 연)
      return g.length > 1 ? (isClock(unit) ? one(g[0]) : g[0]) + g.slice(1).map(one).join("") : g.join("");
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
    var inp = $(":scope > .affix input", host), cal = isPicker(host) ? $(".calendar", host) : host, help = $(":scope > .help", host), unit = dpUnit(host);
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
  /* 단독 기간 달력의 좁은 화면(2026-11-15) — 마크업에 두 달로 그린 달력은 767 이하에서도 처음 누를 때까지 두 달이라 390 에서 247 넘쳤다.
     두 달로 그려졌는데 지금 한 달이어야 하면 다시 그리고, 넓어지면 이렇게 줄인 달력만 두 달로 되돌린다(처음부터 한 달인 달력은 건드리지 않는다) */
  function dpFitStatic(c) {
    var n = dpMonths(c);
    if (c.classList.contains("two") && n === 1) { c._dpFit = true; renderStructure(c); }
    else if (c._dpFit && n === 2 && !c.classList.contains("two")) renderStructure(c);
  }
  if (window.matchMedia) { var dpMq = window.matchMedia("(max-width:767px)"), dpRefit = function () { $$(".calendar").forEach(function (c) { if (!closest(c, ".datepicker") && c._dp) dpFitStatic(c); }); }; if (dpMq.addEventListener) dpMq.addEventListener("change", dpRefit); }
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
    var st = S(host), L = dpLabels(host), base = $(":scope > .affix input", host).id || (st.uid = st.uid || "dp-" + (++dpUid)), ph = st.time === "second" ? "HH:mm:ss" : "HH:mm";
    /* 칸마다 Time Picker sm(사람의 결정 2026-11-13) — 입력 · ↑↓ · Enter 는 달력이 맡고(st.clock), 열 목록은 Time Picker 가 연다. 범위 검사는 적용할 때 필드가 한다 */
    var one = function (side, label) { var id = base + "-time-" + side; return '<div class="field sm timepicker" data-dp-side="' + side + '"' + (st.time === "second" ? " data-seconds" : "") + '><label for="' + id + '">' + label + '</label><div class="affix"><input id="' + id + '" data-side="' + side + '" value="' + st.clock[side] + '" placeholder="' + ph + '" inputmode="numeric" autocomplete="off"><button type="button" class="tp-btn" aria-label="' + label + ' ' + L.timeOpen + '" aria-haspopup="dialog" aria-expanded="false">' + ICON.clock + "</button></div></div>"; };
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
    var st = S(host), list = dpFoot(host), lo = [], hi = [], t = dpToday(host), L = dpLabels(host);
    if (st.mode === "range" && st.unit === "day") (host.getAttribute("data-presets") || "").split(/\s+/).filter(Boolean).forEach(function (n) { var s = addDays(t, -(+n - 1)); lo.push('<button type="button" class="btn sm text" data-preset="' + n + '"' + (outOf(host, s) || outOf(host, t) || (dpMaxDays(host) && +n > dpMaxDays(host)) ? " disabled" : "") + ">" + L.recent.replace("{n}", n) + "</button>"); });
    ["today", "reset", "cancel", "apply"].forEach(function (k) { if (list.indexOf(k) < 0 || (k === "today" && st.mode !== "single")) return; (FOOT[k] === "text" ? lo : hi).push('<button type="button" class="btn sm ' + FOOT[k] + '" data-cal="' + k + '"' + (k === "today" && outOf(host, t, st.unit) ? " disabled" : "") + ">" + L[k] + "</button>"); });
    var h = btnGroup(lo) + btnGroup(hi);
    return h ? '<div class="cal-foot">' + h + "</div>" : "";
  }
  /* 나란한 버튼 2개 이상은 .btn-group(사람의 요청 2026-11-18) — 달력 아래는 글자 버튼(프리셋 · 오늘 · 초기화)과 취소 · 적용을 따로 묶는다 */
  function btnGroup(list) { return list.length > 1 ? '<div class="btn-group">' + list.join("") + "</div>" : list.join(""); }
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
    var st = S(host), inp = $(":scope > .affix input", host);
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
    host.classList.remove("open", "up", "float"); delete host.dataset.dsOpened; setExpanded(host, false);
    st.hover = null; st.draft = null;
    if (restore) { var o = st.opener || $(".cal-btn", host); if (o) o.focus(); }
  }
  /* 아래 자리가 모자라고 위가 더 넓으면 필드 위로(.up). 기준은 필드 상자 — 도움말이 달력을 밀지 않게. 오른쪽으로 넘치면 왼쪽으로 당긴다 */
  function place(host, keep) {
    var sp = pickerSpot(host, calOf(host), keep ? host.classList.contains("up") : null);   // 열린 뒤에는 방향을 바꾸지 않고 높이만 다시 잰다
    host.classList.toggle("up", sp.up); host.classList.toggle("float", sp.float);
    host.style.setProperty("--dp-top", sp.top + "px");
    host.style.setProperty("--dp-left", sp.left + "px");
  }
  /* ds:date — value · start · end 는 기계 형식, date 는 기준 시간대의 0시 · data-time 이면 그 시각(미완성 · 없는 날짜는 Invalid Date, 빈 값은 null), text 는 필드 글자,
     기간은 sides {start, end} — 쪽마다의 상태(달력에서 고른 값은 늘 valid · 비운 쪽 empty) */
  function emit(host, v, validity, sides) {
    var st = S(host), u = tu(st), k = function (d) { return d ? keyOf(d, u) : null; }, bad = validity === "incomplete" || validity === "invalid";
    var at = function (d) { return bad ? new Date(NaN) : d ? instant(host, d) : null; }, inp = $(":scope > .affix input", host), text = inp ? inp.value.trim() : valText(host, v);
    fire(host, "ds:date", st.mode === "range" ? { value: v.a && v.b ? k(v.a) + " ~ " + k(v.b) : null, start: k(v.a), end: k(v.b), date: { start: at(v.a), end: at(v.b) }, text: text, validity: validity, sides: sides || { start: v.a ? "valid" : "empty", end: v.b ? "valid" : "empty" } }
      : { value: k(v.a), date: at(v.a), text: text, validity: validity });
  }
  function commit(host) {
    var st = S(host), v = st.draft || { a: null, b: null };
    if (st.mode === "range" && v.a && !v.b) return false;
    if (st.time && v.a) { var ti = $(":scope > .affix input", host); ti.value = pendingText(host, v); ti._dpPrev = ti.value; typed(host); return true; }   // 달력은 날짜만 막는다 — 시각의 범위 · 순서는 필드 검사가 잰다
    writeValue(host, v); display(host); clearError(host); setValidity(host, v.a ? "valid" : "empty");
    emit(host, v, st.validity);
    return true;
  }
  function display(host) {
    var st = S(host), inp = $(":scope > .affix input", host); if (!inp) return;
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
      if (closest(e.target, ".time-panel")) return true;   // 시각 열 사이 · 버튼으로는 브라우저의 Tab 그대로(열을 떠나면 Time Picker 가 닫는다)
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
    var st = S(host); clockBump(inp, st.time === "second" ? 3 : 2, dir); st.clock[inp.dataset.side] = inp.value;
    renderMarks(host);
  }
  /* 시각 글자의 ↑↓ — Date Picker 의 시각 칸과 Time Picker 가 같이 쓴다. 빈 조각은 00 으로 채운다 */
  function clockBump(inp, n, dir) {
    var segs = inp.value.split(":"), caret = inp.selectionStart || 0, si = Math.min(caret <= 2 ? 0 : caret <= 5 ? 1 : 2, n - 1), num = [];
    for (var i = 0; i < n; i++) num.push(segs[i] && segs[i].length === 2 ? +segs[i] : 0);
    if (segs[si] && segs[si].length === 2) { var w = si ? 60 : 24; num[si] = (num[si] + dir + w) % w; }
    inp.value = num.map(pad).join(":"); inp._dpPrev = inp.value;
    var end = [2, 5, 8][si]; try { inp.setSelectionRange(end, end); } catch (x) { /* 포커스 없는 입력 */ }
  }
  /* 검사 · 확정 — Enter · 포커스가 필드를 떠날 때 · ↑↓. 값이 늘 유효하지는 않다(사람의 요구 2026-11-09):
     미완성 · 없는 날짜는 값을 비우고, 범위 밖 · 순서는 값을 그 날짜로 둔 채 data-validity 와 오류 테두리 · 원인 문구로 알린다 */
  function typed(host) {
    var st = S(host), inp = $(":scope > .affix input", host); if (!inp) return true;
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
    var inp = $(":scope > .affix input", host), help = $(":scope > .help", host);
    if (!help) { help = doc.createElement("span"); help.className = "help"; help.id = (inp && inp.id ? inp.id : "dp" + Math.random().toString(36).slice(2, 8)) + "-help"; ($(".affix", host) || host.lastChild).after(help); }
    help.textContent = msg; host.classList.add("error");
    if (inp) { inp.setAttribute("aria-invalid", "true"); var ids = (inp.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean); if (help.id && ids.indexOf(help.id) < 0) inp.setAttribute("aria-describedby", ids.concat(help.id).join(" ")); }
  }
  function clearError(host) {
    if (!host.classList.contains("error")) return;
    var st = S(host), inp = $(":scope > .affix input", host), help = $(":scope > .help", host);
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
    if (bar) { var shown = wrap._dsAll ? total : n; var b = $("b", bar); if (b) b.textContent = shown.toLocaleString("ko-KR") + "개 선택"; barOff(bar, n === 0); }
  }
  /* 선택 표의 액션 바는 늘 보인다(사람의 결정 2026-11-12). 0개면 버튼을 aria-disabled 로 — 포커스는 남고 누르면 아무 일 없다(아래 .btn[aria-disabled] 클릭 캡처가 막는다).
     제품이 일부러 aria-disabled 를 단 버튼(data-ds-off 없음)은 건드리지 않는다 — 고르면 풀어 버리지 않게 */
  function barOff(bar, off) {
    $$(".btn", bar).forEach(function (btn) {
      if (off) { if (btn.getAttribute("aria-disabled") === "true" && !btn.hasAttribute("data-ds-off")) return; btn.setAttribute("aria-disabled", "true"); btn.setAttribute("data-ds-off", ""); }
      else if (btn.hasAttribute("data-ds-off")) { btn.removeAttribute("aria-disabled"); btn.removeAttribute("data-ds-off"); }
    });
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
    var det = detailOf(tr), sib = function (el, k) { el = el && el[k]; while (el && el.classList.contains("row-detail")) el = el[k]; return el; };
    var tbl = closest(tr, "table"), wrap = closest(tr, ".tbl-wrap"), to = sib(det || tr, "nextElementSibling") || sib(tr, "previousElementSibling"), had = tr.contains(doc.activeElement) || !!(det && det.contains(doc.activeElement));
    tr.remove(); if (det) det.remove();
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
  function termsMissing(terms) { return $$(".item input[type=checkbox]", terms).filter(function (i) { var it = closest(i, ".item"); return (it.hasAttribute("data-required") || $(".req", it)) && !i.checked; }); }
  function termsNotice(terms) {
    var miss = termsMissing(terms), msg = $(":scope > .msg", terms);
    if (!msg) { msg = doc.createElement("div"); msg.className = "msg"; msg.setAttribute("aria-live", "polite"); var g = $(":scope > .btn-group", terms); terms.insertBefore(msg, g); }   // 옛 마크업에는 없다
    msg.textContent = miss.length ? "필수 약관 " + miss.length + "개에 동의하지 않았습니다. 체크하고 다시 누르세요." : "";
    $$(".item input[type=checkbox]", terms).forEach(function (i) { if (miss.indexOf(i) >= 0) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); });
    if (!miss.length) terms._tried = false;
  }
  /* 행 펼침(사람의 결정 2026-11-11) — 버튼이 aria-controls 의 상세 행을 열고 닫는다. 여러 개를 함께 펼친다. 포커스는 버튼에 남는다.
     상세를 서버에서 불러오면 ds:row-expand {expanded} 를 받은 제품이 그 행의 .row-detail-body 를 채운다 */
  function detailOf(tr) { var b = tr && $(":scope > td.expand .expand-btn", tr); return b ? doc.getElementById(b.getAttribute("aria-controls")) : null; }
  function toggleDetail(btn) {
    var det = doc.getElementById(btn.getAttribute("aria-controls")); if (!det) return;
    var open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open)); det.hidden = !open;
    fire(closest(btn, "tr"), "ds:row-expand", { expanded: open });
  }
  function sortTable(th) {
    var table = closest(th, "table"), tbody = $("tbody", table); if (!tbody) return;
    var ths = $$("thead th", table), col = ths.indexOf(th);
    var desc = th.classList.contains("sorted") && !th.classList.contains("desc");
    ths.forEach(function (h) { h.classList.remove("sorted", "desc"); h.removeAttribute("aria-sort"); });
    th.classList.add("sorted"); if (desc) th.classList.add("desc"); th.setAttribute("aria-sort", desc ? "descending" : "ascending");
    fire(th, "ds:sort", { key: th.dataset.key || th.textContent.trim(), dir: desc ? "desc" : "asc" });
    if (table.dataset.sort === "server") return;   // 서버가 정렬한 페이지를 다시 정렬하면 현재 페이지만 뒤섞여 틀려 보인다
    var rows = $$(":scope > tr", tbody).filter(function (r) { return !$("td.empty", r) && !r.classList.contains("row-detail"); });
    var val = function (r) { var c = r.children[col]; var t = c ? c.textContent.trim() : ""; var n = parseFloat(t.replace(/[,\s%]/g, "")); return isNaN(n) || !/^-?[\d,.]+\s*%?$/.test(t) ? t : n; };
    rows.sort(function (a, b) { var x = val(a), y = val(b); var c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "ko"); return desc ? -c : c; });
    rows.forEach(function (r) { var d = detailOf(r); tbody.appendChild(r); if (d) tbody.appendChild(d); });   // 펼친 상세는 제 행을 따라간다
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
  /* 닫기 — --motion-fast 로 흐려진 뒤 지운다. 줄인 모션이면 바로 지운다(전환 토큰 규칙 · React 는 바로 지움) */
  function dismiss(el) {
    if (!el) return;
    var ms = parseFloat(getComputedStyle(doc.documentElement).getPropertyValue("--motion-fast")) || 0;
    if (!ms || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.remove(); return; }
    el.style.transition = "opacity var(--motion-fast)"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, ms + 20);
  }
  /* 오버레이가 나가는 모습(2026-11-20) — React utils/ghost.ts 와 같은 식. 닫힌 오버레이는 바로 지우고(포커스 · 상태 · 선택자는 그대로),
     같은 모양의 사본이 --motion-fast 로 흐려진 뒤 지워진다. 사본은 aria-hidden · inert · id · role 없음. 줄인 모션이면 만들지 않는다 */
  var GHOST_STRIP = ["id", "role", "name", "for", "tabindex", "aria-modal", "aria-labelledby", "aria-describedby", "aria-controls", "aria-live"];
  function ghostOut(nodes) {
    var ms = parseFloat(getComputedStyle(doc.documentElement).getPropertyValue("--motion-fast")) || 0;
    if (!ms || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var wrap = doc.createElement("div"); wrap.className = "ds-ghost"; wrap.setAttribute("aria-hidden", "true"); wrap.inert = true;
    nodes.forEach(function (n) {
      if (!n || !n.getBoundingClientRect) return; var r = n.getBoundingClientRect(); if (!r.width && !r.height) return;
      var c = n.cloneNode(true);
      [c].concat($$("*", c)).forEach(function (e) { GHOST_STRIP.forEach(function (a) { e.removeAttribute(a); }); [].slice.call(e.attributes).forEach(function (a) { if (a.name.indexOf("data-ds") === 0) e.removeAttribute(a.name); }); });
      if (getComputedStyle(n).position !== "fixed") { c.style.position = "fixed"; c.style.left = r.left + "px"; c.style.top = r.top + "px"; c.style.width = r.width + "px"; c.style.height = r.height + "px"; c.style.margin = "0"; }
      wrap.appendChild(c);
    });
    if (!wrap.children.length) return;
    doc.body.appendChild(wrap); setTimeout(function () { wrap.remove(); }, ms + 40);
  }
  /* Select Button 의 값 — data-value, 없으면 글자 */
  function sbValue(b) { return b.dataset.value != null ? b.dataset.value : b.textContent.trim(); }
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
      popup._prev = doc.activeElement; delete el.dataset.dsDirty; discardClear(el);
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
      ghostOut([bd]);
      var el = $(".popup", bd); if (el && el._dsPlaceholder) { el._dsPlaceholder.parentNode.replaceChild(el, el._dsPlaceholder); delete el._dsPlaceholder; }
      bd.remove(); doc.body.style.overflow = "";
      var prev = popup._prev; popup._prev = null; if (prev && prev.focus && doc.contains(prev)) prev.focus();
    },
  };

  /* ---------- 오버레이 입력 보호 — Popup · 모달 Side Panel 공통(2026-11-23) ----------
     입력을 시작하면(data-ds-dirty) 배경을 눌러도 닫지 않고, Esc · X · 취소로 닫으려 하면 그 안에 '변경 사항을 버릴까요?' 를 띄운다.
     새 모달을 겹치지 않는다(모달 위 모달 금지) — 오버레이 안 위험 Notice 한 줄. 위험 확인(alertdialog) · 처리 중은 대상이 아니고,
     data-confirm-discard="false" 로 끈다. DS.popup.close() · DS.panel.close() 를 코드에서 부르면 묻지 않는다(저장 뒤 닫기) */
  var DIRTY_HOST = ".popup-backdrop[data-ds-popup] .popup, .side-panel.fixed[data-modal]:not([hidden])";
  var DISCARD_LABEL = { title: "변경 사항을 버릴까요?", body: "입력한 내용은 저장되지 않습니다.", keep: "계속 편집", drop: "버리기" };
  var ALERT_FILLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z"/></svg>';
  function overlayKeeps(box) { return !box || box.matches(".danger, [aria-busy='true']") || box.dataset.dsDirty === "1"; }
  function popupKeeps(bd) { return overlayKeeps($(".popup", bd)); }
  function discardAsks(box) { return !!box && box.dataset.dsDirty === "1" && !box.matches(".danger, [aria-busy='true']") && box.getAttribute("data-confirm-discard") !== "false"; }
  function discardClear(box) { var n = box && $(":scope > .discard-confirm", box); if (n) n.remove(); }
  /** 닫으려는 순간 — 물어야 하면 확인 줄을 띄우고 true. 이미 떠 있으면 '계속 편집' 과 같다(두 번째 Esc) */
  function discardAsk(box) {
    if (!discardAsks(box)) return false;
    var cur = $(":scope > .discard-confirm", box); if (cur) { discardKeep(box); return true; }
    box._dsDiscardFrom = box.contains(doc.activeElement) ? doc.activeElement : null;
    var n = doc.createElement("div"); n.className = "notice danger discard-confirm"; n.setAttribute("role", "alert");
    n.innerHTML = '<span class="ico">' + ALERT_FILLED + '</span><div><b></b><span class="discard-body"></span><div class="actions"><div class="btn-group"><button type="button" class="btn sm outline assistive" data-discard="keep"></button><button type="button" class="btn sm outline assistive" data-discard="drop"></button></div></div></div>';
    $("b", n).textContent = DISCARD_LABEL.title; $(".discard-body", n).textContent = DISCARD_LABEL.body;
    $('[data-discard="keep"]', n).textContent = DISCARD_LABEL.keep; $('[data-discard="drop"]', n).textContent = DISCARD_LABEL.drop;
    var at = $(":scope > .popup-actions, :scope > .side-panel-footer", box); box.insertBefore(n, at || null);   // 버튼 줄 바로 위 — 화면 순서와 Tab 순서가 같다
    $('[data-discard="keep"]', n).focus();
    return true;
  }
  function discardKeep(box) {
    discardClear(box); var f = box._dsDiscardFrom; box._dsDiscardFrom = null;
    if (f && box.contains(f) && f.getClientRects().length) f.focus(); else { var fs = focusablesIn(box); (fs.filter(function (x) { return !x.matches(".popup-close, .side-panel-close"); })[0] || fs[0] || box).focus(); }
  }
  function discardDrop(box) { discardClear(box); delete box.dataset.dsDirty; if (box.classList.contains("popup")) popup.close(); else panel.close(box); }
  ["input", "change"].forEach(function (ev) { doc.addEventListener(ev, function (e) { var p = closest(e.target, DIRTY_HOST); if (p && !closest(e.target, ".searchbar")) p.dataset.dsDirty = "1"; }, true);   /* 오버레이 안 검색창은 거르는 것이지 입력이 아니다 — 초안과 같은 규칙 */ });
  doc.addEventListener("click", function (e) { var it = closest(e.target, ".menu-item, [role=gridcell]"), p = it && closest(it, DIRTY_HOST); if (p) p.dataset.dsDirty = "1"; }, true);   // Select · Date Picker 는 input 이벤트를 내지 않는다

  /* ---------- Side Panel(사람의 결정 — 비모달 기본, 모달 옵션) ----------
     DS.panel.open("#id") / DS.panel.close(). 비모달은 뒤 페이지를 그대로 쓸 수 있다 — 가두지 않고 스크롤도 잠그지 않으며, 패널 안에 포커스가 있을 때만 Esc 로 닫는다.
     data-modal 이면 배경 · 가둠 · 스크롤 잠금. 한 번에 하나 — 열려 있는데 다른 패널을 열면 바꿔 끼운다 */
  var panel = {
    open: function (sel) {
      var el = typeof sel === "string" ? $(sel) : sel; if (!el) return;
      var cur = $(".side-panel.fixed:not([hidden])"), from = doc.activeElement;
      if (cur && cur !== el) { from = cur._dsPrev || from; panel.close(cur, true); }
      el._dsPrev = from; delete el.dataset.dsDirty; discardClear(el);
      if (cur !== el) el._dsWasHidden = el.hidden;   // 닫을 때 되돌린다 — 문서 예제처럼 처음부터 보이던 패널은 닫아도 제자리에 다시 보인다
      if (cur !== el) { var ph = doc.createComment("side-panel"); el.parentNode.insertBefore(ph, el); el._dsPlaceholder = ph; doc.body.appendChild(el); }
      el.hidden = false; el.classList.add("fixed");
      if (el.hasAttribute("data-modal") && !$(".side-panel-dim")) { var dim = doc.createElement("div"); dim.className = "side-panel-dim"; doc.body.insertBefore(dim, el); doc.body.style.overflow = "hidden"; }
      el.tabIndex = -1; el.focus({ preventScroll: true });
    },
    close: function (el, swapping) {
      el = el || $(".side-panel.fixed:not([hidden])"); if (!el || !el.classList.contains("fixed")) return;   // 문서 예제처럼 띄우지 않은 패널은 닫을 것이 없다
      var inside = el.contains(doc.activeElement), modal = el.hasAttribute("data-modal"), prev = el._dsPrev;
      if (!swapping) ghostOut([$(".side-panel-dim"), el]);
      el.hidden = el._dsWasHidden !== false; el.classList.remove("fixed"); delete el._dsWasHidden;
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
    var on = cbOn(h), name = h.getAttribute("data-name"), multi = cbMulti(h), inp = cbInput(h), ctrl = $(".control", h), row = inp.parentNode;
    if (multi) {
      $$(".chip", ctrl).forEach(function (c) { c.remove(); });
      on.forEach(function (i) { var c = doc.createElement("span"), l = doc.createElement("span"), x = doc.createElement("button"); c.className = "chip sm"; c.dataset.value = cbValue(i); l.className = "lbl"; l.textContent = cbLabel(i); x.type = "button"; x.className = "x"; x.setAttribute("aria-label", cbLabel(i) + " 제거"); x.innerHTML = X_ICON; c.appendChild(l); c.appendChild(x); row.insertBefore(c, inp); });
      fitChips(ctrl); cbEnd(h);
    }
    if (name) { $$("input[type=hidden]", h).forEach(function (x) { x.remove(); }); (multi ? on.map(cbValue) : [on[0] ? cbValue(on[0]) : ""]).forEach(function (v) { var x = doc.createElement("input"); x.type = "hidden"; x.name = name; x.value = v; h.appendChild(x); }); }
  }
  /* 가로 스크롤(기본) — 입력칸이 늘 끝에 보이게 */
  function cbScrolls(h) { return cbMulti(h) && h.getAttribute("data-overflow") !== "wrap"; }
  function cbEnd(h) { var row = $(".control-track", h); if (row && cbScrolls(h)) row.scrollLeft = row.scrollWidth; }
  function cbFire(h) { var on = cbOn(h); fire(h, "ds:select", { value: cbMulti(h) ? on.map(cbValue) : on[0] ? cbValue(on[0]) : "" }); }
  function cbCheck(h) { var inp = cbInput(h), form = closest(inp, "form[data-validate]"); if (form && h._dsTouched && closest(inp, ".field")) { vShow(inp, vMessage(inp)); } }
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
    if (cbMulti(h)) {
      /* 2026-11-23 앞 마크업(.control 바로 아래 칩 · 입력)과 앞 체크 없는 옵션도 받는다 */
      if (!$(".control-track", h)) { var ctl = $(".control", h), tr = doc.createElement("div"); tr.className = "control-track"; while (ctl.firstChild) tr.appendChild(ctl.firstChild); ctl.appendChild(tr); }
      cbItems(h).forEach(function (i) { if (!$(":scope > .menu-mark", i)) { var m = doc.createElement("span"); m.className = "menu-mark check"; m.setAttribute("aria-hidden", "true"); i.insertBefore(m, i.firstChild); } });
      /* 세로 휠은 넘칠 때만 가로로 — 넘치지 않으면 페이지가 그대로 스크롤된다 */
      $(".control-track", h).addEventListener("wheel", function (ev) { var r = ev.currentTarget; if (!cbScrolls(h) || r.scrollWidth <= r.clientWidth || Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return; ev.preventDefault(); r.scrollLeft += ev.deltaY; }, { passive: false });
    }
    if (cbMulti(h) || h.getAttribute("data-name")) cbSync(h);
  }

  /* ---------- 입력 검증 — form[data-validate] ----------
     Interaction › Input errors(사람의 결정 2026-11-09). 표준 제약(required · pattern · min · max · minlength · type)과 글자 수 한도(data-maxlength), Select · Combobox 의 data-required 를 본다.
     포커스가 떠날 때 필드 단위 — 건드리지 않은 빈 필드는 탭으로 지나가도 오류를 내지 않는다. 오류가 있는 필드는 입력할 때마다 다시 재 바로 지운다.
     제출하면 전부 재고, 막으면 첫 오류로 포커스 · 스크롤(폼 위 요약은 없다 — 사람의 결정 2026-11-16). Date Picker 는 스스로 재므로 .error 만 센다.
     Checkbox · Radio 그룹은 .field 안 fieldset 의 data-required — 하나 이상 고른다. 문구는 React validation.ts 와 같아야 한다 */
  var V_MSG = { fileRequired: "고른 파일이 없습니다. 파일을 선택하세요.", fileBusy: "파일을 전송하고 있습니다. 끝난 뒤 다시 저장하세요.", fileFailed: "올리지 못한 파일이 있습니다. 지우거나 다시 시도하세요.", fileType: "올릴 수 없는 형식입니다. {types} 파일을 고르세요.", fileSize: "파일이 너무 큽니다. {max} 이하 파일을 고르세요.", fileEmpty: "빈 파일입니다. 내용이 있는 파일을 고르세요.", fileDuplicate: "이미 추가한 파일입니다. 다른 파일을 고르세요.", fileCount: "파일이 너무 많습니다. {max}개까지 올릴 수 있습니다.", fileSend: "전송하지 못했습니다. 다시 시도하세요.", fileAdded: "파일 {ok}개를 추가했습니다.", fileRejected: "{bad}개는 올릴 수 없습니다. 파일 목록에서 이유를 확인하세요.", fileRemoved: "{name} 파일을 지웠습니다.", required: "값이 비어 있습니다. 값을 입력하세요.", choose: "고른 항목이 없습니다. 항목을 선택하세요.", number: "숫자가 아닙니다. 숫자를 입력하세요.", email: "이메일 형식이 아닙니다. 예: admin@example.com", url: "URL 형식이 아닙니다. 예: https://example.com", pattern: "형식이 맞지 않습니다. 도움말을 확인하세요.", min: "값이 너무 작습니다. {min} 이상 입력하세요.", max: "값이 너무 큽니다. {max} 이하 입력하세요.", minlength: "글자 수가 모자랍니다. {minlength}자 이상 입력하세요.", step: "입력할 수 없는 값입니다. {step} 단위로 입력하세요.", length: "글자 수가 {over}자 넘었습니다. {limit}자 이하로 줄이세요.", code: "코드가 덜 입력됐습니다. {length}자리를 모두 입력하세요." };
  function vIsField(t) { return !!(t && t.matches && t.matches(".field input, .field textarea") && !closest(t, ".datepicker, .code-inputs") && ["checkbox", "radio", "hidden", "file"].indexOf(t.type) < 0); }   // 인증 코드 칸은 묶음(.code-inputs) 하나로 잰다
  function vChoice(el) { return closest(el, ".dropdown[data-required], .combobox[data-required], .checkbox-group[data-required], .radio-group[data-required], .upload"); }
  function vEmpty(host) { if (host.matches(".combobox")) return !cbOn(host).length; if (host.matches(".checkbox-group, .radio-group")) return !$("input:checked", host); if (host.hasAttribute("data-multiple")) return !$('.menu-item[aria-selected="true"]', host); var on = $(".menu-item.on", host); return !on || on.dataset.value === ""; }
  function vFields(form) { return $$(".field input, .field textarea, .field .dropdown[data-required] .trigger, .field .checkbox-group[data-required], .field .radio-group[data-required], .field .upload .upload-pick, .field .code-inputs", form).filter(function (i) { if (i.matches(".code-inputs")) return codeCells(i).some(function (c) { return !c.disabled; }); return !i.disabled && i.type !== "checkbox" && i.type !== "radio" && i.type !== "file" && ((vIsField(i) && i.willValidate) || vChoice(i)); }); }
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
    if (inp.matches(".code-inputs")) { var cv = codeValue(inp), cn = codeCells(inp).length, cm = vMsgs(inp); return !cv ? (inp.hasAttribute("data-required") ? cm.required : "") : cv.length < cn ? cm.code.replace(/\{length\}/g, cn) : ""; }
    var tph = closest(inp, ".timepicker"); if (tph) return !inp.value.trim() ? (inp.required ? vMsgs(inp).required : "") : tpCheck(tph, inp.value).msg || "";
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
    var marks = inp.matches(".code-inputs") ? codeCells(inp) : [inp];   // 인증 코드는 칸마다 aria-invalid
    if (msg) { if (!on) help._orig = help.textContent; help.textContent = msg; f.classList.add("error"); marks.forEach(function (m) { m.setAttribute("aria-invalid", "true"); }); }
    else if (on) { f.classList.remove("error"); help.textContent = help._orig || ""; marks.forEach(function (m) { m.removeAttribute("aria-invalid"); }); }
  }
  var V_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>';
  function vLabel(f) { var l = $("legend", f) || $("label", f); return l ? l.textContent.replace(/\*\s*$/, "").trim() : ""; }
  /** 폼 전체 검증 — 통과하면 true. 제출 버튼이 아닌 곳에서 부를 때 DS.validate(form) */
  function vRun(form) {
    form._tried = true;
    vFields(form).forEach(function (i) { vShow(i, vMessage(i)); });
    var bad = $$(".field.error", form);
    form.dispatchEvent(new CustomEvent("ds:validate", { bubbles: true, detail: { valid: !bad.length, errors: bad.map(function (f) { return { label: vLabel(f), message: ($(":scope > .help", f) || {}).textContent || "" }; }) } }));
    if (bad.length) { var first = $("input:not([type=hidden]),textarea,button", bad[0]), cg0 = $(".code-inputs", bad[0]); if (cg0) first = codeCells(cg0).filter(function (c) { return !c.value; })[0] || first; if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: "center" }); } }   // 인증 코드는 첫 빈 칸으로
    return !bad.length;
  }
  /* Select — 열었다가 고르지 않고 닫으면 알린다. 건드리지 않은 필드는 제출할 때 */
  function vTouch(dd) { var tr = $(".trigger", dd), form = closest(dd, "form[data-validate]"); if (tr && form && dd.hasAttribute("data-required") && closest(dd, ".field")) { vShow(tr, vMessage(tr)); } }

  /* ---------- Text Field Code — .code-inputs(사람의 요청 · 결정 2026-11-17) ----------
     인증 코드처럼 자리 수가 정해진 숫자를 칸마다 한 자리씩. 치면 다음 칸, 빈 칸에서 Backspace 는 앞 칸을 지우고 그리로, ← → Home End 로 옮긴다.
     붙여넣기 · 문자 자동 채우기(첫 칸 autocomplete=one-time-code)는 그 칸부터 나눠 채운다. 숫자가 아닌 글자는 받지 않는다. 앞에 빈 칸이 있으면 빈 칸에 포커스를 주지 않고 첫 빈 칸으로 보낸다.
     값은 칸을 이은 글자 — 안의 hidden 입력(name)에 담고, 바뀔 때마다 ds:code {value, complete}. 검증은 묶음 하나로(필수 data-required · 덜 친 값 code 문구) */
  function codeCells(g) { return $$(".code-cell", g); }
  function codeValue(g) { return codeCells(g).map(function (c) { return c.value; }).join(""); }
  /* Tab 칸은 하나 — 첫 빈 칸(다 차면 마지막 칸). 칸마다 Tab 이 멈추면 빈 칸으로 되돌리는 규칙과 맞물려 묶음을 빠져나갈 수 없다. 안에서는 화살표로 옮긴다 */
  function codeRove(g) { var cs = codeCells(g), k = cs.findIndex(function (c) { return !c.value; }); if (k < 0) k = cs.length - 1; cs.forEach(function (c, i) { if (i === k) c.removeAttribute("tabindex"); else c.setAttribute("tabindex", "-1"); }); }
  function codeInit(g) { var hid = $(":scope > input[type=hidden]", g); g._dsCode = codeValue(g); if (hid) hid.value = g._dsCode; codeCells(g).forEach(function (c) { c._dsPrev = c.value; }); codeRove(g); }
  function codeSync(g) {
    var v = codeValue(g), hid = $(":scope > input[type=hidden]", g); if (hid) hid.value = v;
    codeCells(g).forEach(function (c) { c._dsPrev = c.value; }); codeRove(g);
    g._dsDirty = true;
    var f = closest(g, ".field"); if (closest(g, "form[data-validate]") && f.classList.contains("error")) vShow(g, vMessage(g));   // 오류가 떠 있으면 고치는 대로 다시 잰다
    if (v === g._dsCode) return; g._dsCode = v;
    fire(g, "ds:code", { value: v, complete: v.length === codeCells(g).length });
  }
  function codeFill(cell, digits) {   // cell 부터 한 자리씩 — 마지막으로 채운 다음 칸(없으면 마지막 칸)으로
    var g = closest(cell, ".code-inputs"), cs = codeCells(g), i = cs.indexOf(cell), k = 0;
    for (; k < digits.length && i + k < cs.length; k++) cs[i + k].value = digits.charAt(k);
    var next = cs[Math.min(i + k, cs.length - 1)]; next.focus(); next.select();
    codeSync(g);
  }
  doc.addEventListener("input", function (e) {
    var t = e.target; if (!(t instanceof Element) || !t.matches(".code-inputs .code-cell") || e.isComposing) return;
    var g = closest(t, ".code-inputs"), typed = e.inputType === "insertText" && e.data != null, d = (typed ? e.data : t.value).replace(/\D/g, "");
    if (d) { codeFill(t, d); return; }
    if (typed || /^insert/.test(e.inputType || "") || t.value) t.value = t._dsPrev || "";   // 숫자가 아닌 글자 — 전 값으로 되돌린다
    codeSync(g);
  });
  doc.addEventListener("compositionend", function (e) { var t = e.target; if (t instanceof Element && t.matches(".code-inputs .code-cell")) { var d = t.value.replace(/\D/g, ""); if (d) codeFill(t, d); else t.value = t._dsPrev || ""; } });
  doc.addEventListener("paste", function (e) {
    var t = e.target; if (!(t instanceof Element) || !t.matches(".code-inputs .code-cell")) return;
    e.preventDefault(); var d = ((e.clipboardData && e.clipboardData.getData("text")) || "").replace(/\D/g, ""); if (d) codeFill(t, d);
  });
  doc.addEventListener("keydown", function (e) {
    var t = e.target; if (!(t instanceof Element) || !t.matches(".code-inputs .code-cell") || e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
    var g = closest(t, ".code-inputs"), cs = codeCells(g), i = cs.indexOf(t), go = function (j) { var c = cs[j]; e.preventDefault(); if (c) { c.focus(); c.select(); } };
    if (e.key === "Backspace" && !t.value && i > 0) { e.preventDefault(); cs[i - 1].value = ""; cs[i - 1].focus(); codeSync(g); }
    else if (e.key === "ArrowLeft") go(i - 1); else if (e.key === "ArrowRight") go(i + 1); else if (e.key === "Home") go(0); else if (e.key === "End") go(cs.length - 1);
  });
  doc.addEventListener("focusin", function (e) {
    var t = e.target; if (!(t instanceof Element) || !t.matches(".code-inputs .code-cell")) return;
    var cs = codeCells(closest(t, ".code-inputs")), gap = cs.filter(function (c) { return !c.value; })[0];
    if (!t.value && gap && cs.indexOf(gap) < cs.indexOf(t)) { gap.focus(); return; }
    t.select();
  });
  doc.addEventListener("focusout", function (e) {   // 묶음을 떠날 때 — 다른 필드처럼 건드렸거나 값이 있거나 이미 오류일 때만
    var g = e.target instanceof Element && closest(e.target, ".code-inputs"); if (!g || (e.relatedTarget && g.contains(e.relatedTarget)) || !closest(g, "form[data-validate]")) return;
    if (g._dsDirty || codeValue(g) || closest(g, ".field").classList.contains("error")) vShow(g, vMessage(g));
  });

  /* ---------- Steps 마법사 — .stepper(2026-11-13) ----------
     단계(.steps li)와 패널(.step-panel)은 문서 순서로 짝짓는다(세로 배치는 패널이 li 안). 현재 = li.on + aria-current, 완료 = li.done(+ 숨긴 '(완료)').
     누를 수 있는 단계만 .step-btn — 순서대로면 완료한 단계, data-nonlinear 면 현재가 아닌 모든 단계. 검증은 패널 안 form[data-validate] 를 vRun 으로 */
  function spSteps(sp) { var ol = $(".steps", sp); return ol ? $$(":scope > li", ol) : []; }
  function spPanels(sp) { return $$(".step-panel", sp); }
  function spCur(sp) { var i = spSteps(sp).findIndex(function (li) { return li.classList.contains("on"); }); return i < 0 ? 0 : i; }
  function spForm(p) { return p ? $("form[data-validate]", p) : null; }
  function spQuiet(p) { var f = spForm(p); return !f || vFields(f).every(function (i) { return !vMessage(i); }); }   /* 문구 없이 통과 여부만 */
  function spPaint(sp) {
    var steps = spSteps(sp), panels = spPanels(sp), free = sp.hasAttribute("data-nonlinear"), cur = spCur(sp), last = steps.length - 1;
    steps.forEach(function (li, i) {
      var on = i === cur, done = li.classList.contains("done"), btn = $(":scope > .step-btn", li), want = !on && (done || free), ic = $("i", li), lab = $(".label", li), sr = $(".sr-only", li);
      li.classList.toggle("on", on);
      on ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current");
      if (ic) { if (done && !on) { if (!ic.dataset.num) ic.dataset.num = ic.textContent.trim() || String(i + 1); ic.innerHTML = ICON.check.replace(/"12"/g, '"16"'); } else ic.textContent = ic.dataset.num || ic.textContent.trim() || String(i + 1); }
      if (done && !sr && lab) { sr = doc.createElement("span"); sr.className = "sr-only"; sr.textContent = " (완료)"; lab.parentNode.insertBefore(sr, lab.nextSibling); }
      else if (!done && sr) sr.remove();
      if (want && !btn) {
        btn = doc.createElement("button"); btn.type = "button"; btn.className = "step-btn";
        [].slice.call(li.childNodes).forEach(function (n) { if (!(n.nodeType === 1 && n.classList.contains("step-panel"))) btn.appendChild(n); });
        li.insertBefore(btn, li.firstChild);
      } else if (!want && btn) { while (btn.firstChild) li.insertBefore(btn.firstChild, btn); btn.remove(); }
    });
    panels.forEach(function (p, i) { p.hidden = i !== cur; p.tabIndex = -1; });
    $$("[data-step]", sp).forEach(function (b) { var k = b.dataset.step; if (k === "prev") b.disabled = cur === 0; else if (k === "next") b.hidden = cur === last; else if (k === "finish") b.hidden = cur !== last; });
  }
  function spGo(sp, to, trigger) {
    var steps = spSteps(sp), from = spCur(sp); if (to < 0 || to >= steps.length || to === from) return false;
    steps[from].classList.remove("on"); steps[to].classList.add("on");
    spPaint(sp);
    var p = spPanels(sp)[to]; if (p) { p.focus({ preventScroll: true }); if (p.getBoundingClientRect().top < 0) p.scrollIntoView({ block: "start" }); }
    fire(sp, "ds:step", { index: to, from: from, trigger: trigger });
    return true;
  }
  /* 떠나는 단계 — 자유 이동이면 조용히 재서 완료 표시를 맞춘다(순서대로면 '다음' 만 완료를 만든다) */
  function spLeave(sp) { if (!sp.hasAttribute("data-nonlinear")) return; var cur = spCur(sp); spSteps(sp)[cur].classList.toggle("done", spQuiet(spPanels(sp)[cur])); }
  function spNext(sp, checked) {
    var cur = spCur(sp), f = spForm(spPanels(sp)[cur]);
    if (!checked && f && !vRun(f)) return;
    spSteps(sp)[cur].classList.add("done");
    if (cur === spSteps(sp).length - 1) return spFinish(sp, true);
    spGo(sp, cur + 1, "next");
  }
  /* 완료 — 현재 단계를 검사하고, 자유 이동이면 모든 단계를 순서대로 재서 막힌 첫 단계로 간다 */
  /* 완료 처리 중(2026-11-20 — 사람의 결정 '옵션으로') — .stepper[data-async] 는 완료를 내면 완료 버튼이 loading 이 되어 다시 눌리지 않고,
     제품이 ds:step-finish 의 resolve() · reject(문구) 를 불러야 풀린다(Switch data-async 와 같은 방식). reject 는 오류 Toast */
  var STEP_FAIL = "작업을 끝내지 못했습니다. 다시 시도하세요.";
  function spBusy(sp, on) {
    sp._dsBusy = on;
    $$('[data-step="finish"]', sp).forEach(function (b) { b.classList.toggle("loading", on); if (on) b.setAttribute("aria-busy", "true"); else b.removeAttribute("aria-busy"); });
  }
  function spFinish(sp, checked) {
    if (sp._dsBusy) return;
    var steps = spSteps(sp), panels = spPanels(sp), cur = spCur(sp), free = sp.hasAttribute("data-nonlinear");
    if (!checked) { var cf = spForm(panels[cur]); if (cf && !vRun(cf)) return; }
    steps[cur].classList.add("done");
    if (free) for (var i = 0; i < steps.length; i++) {
      if (i === cur || spQuiet(panels[i])) { steps[i].classList.add("done"); continue; }
      steps[i].classList.remove("done"); spGo(sp, i, "finish"); vRun(spForm(panels[i])); return;
    }
    spPaint(sp);
    if (!sp.hasAttribute("data-async")) return fire(sp, "ds:step-finish", { index: cur });
    spBusy(sp, true);
    var settle = function () { if (!sp._dsBusy) return false; spBusy(sp, false); return true; };
    fire(sp, "ds:step-finish", { index: cur, resolve: settle, reject: function (msg) { if (settle()) toast(msg || STEP_FAIL, { tone: "danger" }); } });
  }

  /* Top Navigation 의 사이드 내비 접기(2026-11-18) — [data-sidenav-toggle][aria-controls=사이드 내비 id] 가 .collapsed 를 붙였다 뗀다.
     aria-expanded · 이름 · Tooltip 을 맞추고 ds:sidenav {collapsed} 를 낸다. 접은 상태를 기억하는 일은 제품 몫 */
  var NAV_LABEL = { collapse: "메뉴 접기", expand: "메뉴 펼치기" };
  function navTarget(btn) { var id = btn.getAttribute("aria-controls"); return id ? doc.getElementById(id) : null; }
  function navSync(btn) { var nav = navTarget(btn); if (!nav) return; var c = nav.classList.contains("collapsed"), name = c ? NAV_LABEL.expand : NAV_LABEL.collapse; btn.setAttribute("aria-expanded", String(!c)); btn.setAttribute("aria-label", name); $$("a.has-on", nav).forEach(function (x) { if (c) x.setAttribute("aria-current", "true"); else if (x.getAttribute("aria-current") === "true") x.removeAttribute("aria-current"); });   /* 하위가 현재인 부모 — 접힌 레일에서만 현재를 잇는다(React SideNavItem hasActiveChild 와 같음) */ var w = btn.parentNode, tip = w && w.classList.contains("tooltip-wrap") && $(".tooltip", w); if (tip) tip.textContent = name; }
  function navSet(nav, c, trigger) { if (nav.classList.contains("collapsed") === c) return; nav.classList.toggle("collapsed", c); $$("[data-sidenav-toggle]").forEach(function (b) { if (navTarget(b) === nav) navSync(b); }); fire(nav, "ds:sidenav", { collapsed: c, trigger: trigger }); }
  function navToggle(btn) { var nav = navTarget(btn); if (nav) navSet(nav, !nav.classList.contains("collapsed"), "button"); }
  /* 좁은 화면(2026-11-19 사람의 결정) — 화면 폭이 1280 아래로 줄면 접기 버튼이 가리키는 사이드 내비를 접고, 다시 넓히면 편다.
     경계를 넘을 때만 맞추므로 그 사이 사용자가 바꾼 상태는 남는다. 접기 버튼이 없는 내비(펼 길이 없음)와 data-auto-collapse="false" 는 건드리지 않는다 */
  var NAV_MQ = window.matchMedia ? window.matchMedia("(max-width:1279.98px)") : null;
  function navAutoList(root) { var seen = []; $$("[data-sidenav-toggle]", root || doc).forEach(function (b) { var n = navTarget(b); if (n && seen.indexOf(n) < 0 && n.getAttribute("data-auto-collapse") !== "false") seen.push(n); }); return seen; }
  if (NAV_MQ && NAV_MQ.addEventListener) NAV_MQ.addEventListener("change", function (e) { navAutoList().forEach(function (n) { n._dsAuto = true; navSet(n, e.matches, "width"); }); });
  /* 라이트/다크(2026-11-18) — [data-theme-toggle] 이 <html data-theme> 를 바꾸고 ds:theme {theme} 를 낸다. aria-pressed = 다크. 저장은 제품 몫.
     다른 곳에서 테마를 바꿔도 버튼이 따라오게 data-theme 를 지켜본다 */
  function themeNow() { var t = doc.documentElement.getAttribute("data-theme"); return t === "dark" || t === "light" ? t : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); }
  function themeSync() { var d = String(themeNow() === "dark"); $$("[data-theme-toggle]").forEach(function (b) { if (b.getAttribute("aria-pressed") !== d) b.setAttribute("aria-pressed", d); }); }
  function themeToggle(btn) { var next = themeNow() === "dark" ? "light" : "dark"; doc.documentElement.setAttribute("data-theme", next); themeSync(); fire(btn, "ds:theme", { theme: next }); }
  if (window.MutationObserver) new MutationObserver(themeSync).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
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
    if ((el = closest(t, ".chart-state [data-retry]"))) { fire(closest(el, ".chart-card"), "ds:retry"); return; }   // 차트 카드 오류 상태(2026-11-15) — 다시 부르는 일은 제품
    if ((el = closest(t, ".tbl .expand-btn"))) { toggleDetail(el); return; }
    if ((el = closest(t, ".combobox .x"))) { var cbh = closest(el, ".combobox"); if (!cbInput(cbh).disabled) cbRemove(cbh, closest(el, ".chip")); return; }
    if ((el = closest(t, ".combobox .menu-item"))) { if (el.getAttribute("aria-disabled") !== "true") cbPick(closest(el, ".combobox"), el); return; }
    if ((el = closest(t, ".combobox .control"))) { var cbc = closest(el, ".combobox"), cbi = cbInput(cbc); if (!cbi.disabled) { cbi.focus(); cbOpen(cbc, t === cbi || !cbc.classList.contains("open")); } return; }
    if ((el = closest(t, ".dropdown .menu-actions [data-menu-action]")) && !el.disabled) { var mad = closest(el, ".dropdown"); if (el.dataset.menuAction === "apply") mcApply(mad); else mcReset(mad); return; }
    if ((el = closest(t, ".menu-item"))) { if (el.getAttribute("aria-disabled") === "true") return; if (mcToggles(el)) mcToggle(el); else selectItem(el); return; }

    // Tabs
    if ((el = closest(t, ".tabs .tab")) && !el.disabled) { tabPick(el); return; }
    if ((el = closest(t, ".steps .step-btn"))) { var stepLi = closest(el, "li"), stepAt = $$(":scope > li", stepLi.parentNode).indexOf(stepLi), stepSp = closest(el, ".stepper");
      if (stepSp) { spLeave(stepSp); spGo(stepSp, stepAt, "click"); } else fire(el, "ds:step", { index: stepAt, from: $$(":scope > li", stepLi.parentNode).findIndex(function (x) { return x.classList.contains("on"); }), trigger: "click" }); return; }   /* .stepper 밖 — 이동은 제품이 한다 */
    // Breadcrumb 펼치기
    if ((el = closest(t, ".breadcrumb .more"))) { setTimeout(fitCrumbs, 0); var li = closest(el, "li"), items = (el.dataset.items || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean); if (li && items.length) { var first = null; items.forEach(function (s) { var n = doc.createElement("li"); var a2 = doc.createElement("a"); a2.href = "#"; a2.textContent = s; n.appendChild(a2); li.parentNode.insertBefore(n, li); if (!first) first = a2; }); var ol = li.parentNode; li.remove(); /* 버튼이 사라지니 포커스를 펼친 첫 링크로 — 안 옮기면 body 로 떨어진다 */ if (first) first.focus(); fire(ol, "ds:expand", { items: items }); } return; }
    // Steps 마법사 — 이전 · 다음 · 완료
    if ((el = closest(t, ".stepper [data-step]")) && !el.disabled) { var spx = closest(el, ".stepper"), sk = el.dataset.step; if (sk === "next") spNext(spx); else if (sk === "prev") { spLeave(spx); spGo(spx, spCur(spx) - 1, "prev"); } else if (sk === "finish") spFinish(spx); return; }
    // 선택형 카드 (데모 링크)
    if ((el = closest(t, ".card-grid .card.clickable")) && !el.disabled && el.getAttribute("aria-disabled") !== "true") {   /* 고를 수 없는 선택 카드(Card 정의 2026-11-02) — button 은 disabled, 그 밖은 aria-disabled */ $$(".card.clickable", closest(el, ".card-grid")).forEach(function (c) { var on = c === el; c.classList.toggle("on", on); /* 선택은 .on 만으로는 보조기기에 전해지지 않는다 */ if (c.tagName === "BUTTON") c.setAttribute("aria-pressed", on ? "true" : "false"); }); fire(el, "ds:select", { value: (el.querySelector(".title") || el).textContent.trim() }); return; }
    // Select Button
    if ((el = closest(t, ".select-btn > button")) && !el.disabled) { activate(closest(el, ".select-btn"), "button", el, "aria-checked"); fire(el, "ds:select", { value: sbValue(el) }); return; }
    // Chip
    if ((el = closest(t, ".chip .x"))) { if (!el.disabled) { var gone = closest(el, ".chip"), gl = $(".lbl", gone); fire(gone, "ds:chip-remove", { value: gone.dataset.value != null ? gone.dataset.value : (gl || gone).textContent.trim() }); chipFocusAfter(gone); dismiss(gone); } return; }   // 비활성 입력값 칩은 지우지 않는다 — CSS pointer-events 만 믿으면 보조기술의 클릭이 지운다
    if ((el = closest(t, "button.chip[aria-pressed]")) && !el.disabled) { var on = el.getAttribute("aria-pressed") !== "true"; el.classList.toggle("on", on); el.setAttribute("aria-pressed", String(on)); syncChipReset(el.parentNode); fire(el, "ds:chip-toggle", { selected: on, value: el.dataset.value != null ? el.dataset.value : el.textContent.trim() }); return; }
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
    // SideNav · TopBar 활성 — 위험 항목(.danger, 2026-11-24)은 화면이 아니라 확인 대화상자를 여는 동작이라 현재 표시를 옮기지 않는다
    if ((el = closest(t, ".sidenav a:not(.danger), .topbar nav a"))) { var nav = closest(el, ".sidenav, .topbar nav"); $$("a", nav).forEach(function (x) { x.classList.toggle("on", x === el); x.classList.remove("has-on"); x === el ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"); });
      // 하위 항목을 고르면 바로 위 부모가 .has-on — 접힌 레일은 하위 항목을 숨기므로 부모가 선택 모양과 aria-current="true" 를 이어받는다
      if (el.classList.contains("sub")) { var par = el.previousElementSibling; while (par && par.matches("a.sub")) par = par.previousElementSibling; if (par && par.tagName === "A") { par.classList.add("has-on"); if (nav.classList.contains("collapsed")) par.setAttribute("aria-current", "true"); } }
      return; }
    // Top Navigation — 사이드 내비 접기 · 라이트/다크(2026-11-18). 포커스는 버튼에 남는다
    if ((el = closest(t, "[data-sidenav-toggle]"))) { navToggle(el); return; }
    if ((el = closest(t, "[data-theme-toggle]"))) { themeToggle(el); return; }
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
    if ((el = closest(t, ".notice .close"))) { var ntc = closest(el, ".notice"); if (e.detail === 0) focusPast(ntc); fire(ntc, "ds:notice-close"); dismiss(ntc); return; }
    if ((el = closest(t, ".banner .close"))) { var bnr = closest(el, ".banner"); if (e.detail === 0) focusPast(bnr); fire(bnr, "ds:banner-close"); dismiss(bnr); return; }
    if ((el = closest(t, ".toast .action, .toast .close"))) { closeToast(closest(el, ".toast"), e.detail === 0); return; }
    // Popup — 입력 중 · 위험 확인 · 처리 중에는 배경을 눌러도 닫지 않는다(Interaction › Overlays)
    if ((el = closest(t, ".discard-confirm [data-discard]"))) { var dbx = closest(el, ".popup, .side-panel"); if (el.getAttribute("data-discard") === "drop") discardDrop(dbx); else discardKeep(dbx); return; }
    if (t.classList.contains("popup-backdrop")) { if (!popupKeeps(t)) popup.close(); return; }
    if ((el = closest(t, ".popup [data-popup-close]"))) { if (el.matches(".primary") || !discardAsk(closest(el, ".popup"))) popup.close(); return; }   // 주 버튼에 단 닫기는 저장 뒤 닫기라 묻지 않는다
    // Side Panel — 모달의 배경도 Popup 과 같은 판정(입력 중 · 처리 중이면 닫지 않음)
    if (t.classList.contains("side-panel-dim")) { var dpn = $(".side-panel.fixed[data-modal]:not([hidden])"); if (!dpn || !overlayKeeps(dpn)) panel.close(dpn || undefined); return; }
    if ((el = closest(t, ".side-panel [data-panel-close]"))) { var cpn = closest(el, ".side-panel"); if (el.matches(".primary") || !discardAsk(cpn)) panel.close(cpn); return; }
    if ((el = closest(t, "[data-panel-open]"))) { panel.open(el.getAttribute("data-panel-open")); return; }
    if ((el = closest(t, "[data-popup-open]"))) { popup.open(el.getAttribute("data-popup-open")); return; }
  });

  // 바깥 클릭: 사용자가 연 Dropdown / DatePicker 닫기
  doc.addEventListener("pointerdown", function (e) {
    $$(".dropdown.open[data-ds-opened]").forEach(function (dd) { if (!dd.contains(e.target)) setOpen(dd, false); });
    $$(".datepicker.open[data-ds-opened]").forEach(function (dp) { if (!dp.contains(e.target)) closeDP(dp, false); });   // 바깥 클릭은 초안을 버리고 포커스는 옮기지 않는다
    $$(".timepicker.open[data-ds-opened]").forEach(function (tp) { if (!tp.contains(e.target)) tpClose(tp, false); });
  }, true);

  /* Loading 버튼과 aria-disabled 버튼(비활성 링크 포함): 둘 다 포커스를 받으므로 키보드 Enter/Space 가 그대로 click 을 쏜다.
     끈 버튼에도 pointer-events:none 을 두지 않는다 — 두면 마우스 클릭이 뒤의 행 · 카드로 떨어진다(2026-11-12).
     버튼 자신에 달린 핸들러가 타깃 단계에서 먼저 실행되므로 버블이 아니라 캡처 단계에서 막아야 한다.
     Loading 은 disabled 와 달리 포커스를 남기고 click · mousedown · pointerdown · keydown 넷을 막는다(사람의 정의 2026-10-28).
     loading 에는 pointer-events:none 이 없다 — 있으면 마우스 클릭이 버튼을 지나 뒤의 행 · 카드에서 실행된다.
     keydown 은 이동 키(NAV)와 수정 키 조합(단축키)을 그대로 보낸다 — 문서 캡처에서 끊으면 Esc 닫기 · 화살표 이동 · 전역 단축키가
     loading 동안 멈춘다. 그래서 버튼 자신의 리스너도 이 키들은 받는다(React 는 onKeyDown 을 아예 부르지 않는다). 기본 동작은 Enter/Space 만 막는다 */
  var NAV = ["Tab", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"];
  doc.addEventListener("click", function (e) {
    /* 끈 칩(span) · 메뉴 항목 · Accordion 헤더 · 표의 비활성 행도 같다 — pointer-events:none · inert 를 지운 뒤(2026-11-12) 클릭이 그 요소에 오므로
       제품 핸들러 · 부모 · 링크 이동 · 펼침을 여기서 막는다 */
    if (closest(e.target, '.btn.loading,.btn[aria-disabled="true"],.chip[aria-disabled="true"],.menu-item[aria-disabled="true"],.accordion.disabled summary,.tbl tr.disabled')) { e.preventDefault(); e.stopPropagation(); return; }
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
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey) { e.preventDefault(); clockStep(cdh, cti, e.key === "ArrowUp" ? 1 : -1); return; }
      if (e.defaultPrevented) return; }   // Alt+↓ 는 Time Picker 가 열 목록을 연다
    var di = closest(e.target, ".datepicker > .affix input");
    if (di) { var dh = closest(di, ".datepicker");
      if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); typed(dh); return; }   // 한글 조합 중 Enter 는 조합 확정이다
      if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); var cb = $(".cal-btn", dh); if (!dh.classList.contains("open") && cb && !cb.disabled) openDP(dh, cb); return; }
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !di.readOnly && !di.disabled) { e.preventDefault(); stepSeg(dh, di, e.key === "ArrowUp" ? 1 : -1); return; } }
    if (e.key === "Escape") { var dpo = closest(e.target, ".datepicker.open"); if (dpo) { closeDP(dpo, true); return; }   // 포커스가 든 피커 하나만
      var ddo = $$(".dropdown.open[data-ds-opened]"); if (ddo.length) { ddo.forEach(function (d) { setOpen(d, false); var tr = $("[aria-haspopup]", d); tr && tr.focus(); }); return; }   // 가장 안쪽 것 하나만 — 대화상자는 다음 Esc 에
      var tips = $$(".tooltip-wrap:not(.show):not(.quiet)").filter(function (w) { var tip = $(".tooltip", w); return tip && (w.matches(":hover") || w.contains(doc.activeElement)) && Number(getComputedStyle(tip).opacity) > 0; });
      if (tips.length) { tips.forEach(function (w) { w.classList.add("quiet"); }); return; }   // 보이는 툴팁이 가장 안쪽이다 — 대화상자는 다음 Esc 에
      var pop = $(".popup-backdrop[data-ds-popup]"); if (pop) { var ppe = $(".popup", pop); if (ppe.getAttribute("aria-busy") !== "true" && !discardAsk(ppe)) popup.close(); return; }
      var pn = $(".side-panel.fixed:not([hidden])"); if (pn && (pn.hasAttribute("data-modal") || pn.contains(doc.activeElement)) && !discardAsk(pn)) panel.close(pn); return; }
    var ctr = closest(e.target, ".dropdown:not(.open) [aria-haspopup]");
    if (ctr && !ctr.disabled && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setOpen(closest(ctr, ".dropdown"), true); return; }
    if (dd && e.key === "Tab") { var acts = $$(".menu-actions button:not([disabled])", dd), mae = doc.activeElement, mai = acts.indexOf(mae);
      if (acts.length && !e.shiftKey && (mai < 0 ? !!closest(mae, ".menu-items") : mai < acts.length - 1)) return;   // 적용 영역 — 항목 → 초기화 → 적용은 브라우저 기본 이동(항목은 tabindex -1)
      if (acts.length && e.shiftKey && mai > 0) return;
      if (acts.length && e.shiftKey && mai === 0) { e.preventDefault(); var mfi = itemsOf(dd); (mfi.filter(mcOn)[0] || mfi[0] || mae).focus(); return; } }
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
      else if (i >= 0) { e.preventDefault(); if (mcToggles(items[i])) mcToggle(items[i]); else selectItem(items[i]); }
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

  /* 폼 초안(2026-11-23 — VectorLab UI/UX 대조, 사람의 결정 '옵션으로') — form[data-draft="키"] 는 입력을 이 브라우저(localStorage jsds-draft:키)에 0.5초 뒤 남긴다.
     다시 열면 기본값과 다른 칸만 되살리고 폼 맨 위에 알린다('버리기' 는 기본값으로 되돌림). 제출이 통과하면(그 틱에 aria-invalid 가 없으면) 지운다.
     남기지 않는 칸: 비밀번호 · 파일 · 숨은 값 · 읽기 전용 · 일회용 코드 · 복사 필드 · 인증 코드 칸 · Combobox 검색 글자 · 검색창 · data-draft-skip 안 · 이름도 id 도 없는 칸.
     네이티브 입력(글자 · 숫자 · 체크박스 · 라디오 · select · textarea)만 다룬다 — Select · Combobox 의 고른 값은 제품이 저장한다. 저장이 막힌 브라우저는 그냥 지나간다 */
  var DRAFT_LABEL = { restored: "저장하지 않은 입력을 되살렸습니다.", discard: "버리기" };
  var DRAFT_SKIP_TYPE = ["password", "file", "hidden", "submit", "button", "reset", "image"];
  var INFO_FILLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"/></svg>';
  function draftKey(f) { return "jsds-draft:" + f.getAttribute("data-draft"); }
  function draftFields(f) {
    return $$("input, textarea, select", f).filter(function (el) {
      return !!(el.name || el.id) && DRAFT_SKIP_TYPE.indexOf((el.type || "").toLowerCase()) < 0 && !el.readOnly && el.getAttribute("autocomplete") !== "one-time-code" && el.getAttribute("role") !== "combobox" && !el.closest(".copy-field, .code-inputs, .searchbar, [data-draft-skip]");
    });
  }
  function draftRadioIdx(f, el) { return $$("input[type=radio]", f).filter(function (r) { return r.name === el.name; }).indexOf(el); }
  function draftSave(f) {
    var data = {};
    draftFields(f).forEach(function (el) {
      if (el.type === "radio") { if (el.checked && el.name) data["radio:" + el.name] = draftRadioIdx(f, el); return; }
      data[el.name || el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    try { localStorage.setItem(draftKey(f), JSON.stringify({ v: 1, f: data })); } catch (e) {}
  }
  function draftNotice(f) {
    var old = $(":scope > .draft-notice", f); if (old) return old;
    var n = doc.createElement("div"); n.className = "notice info draft-notice"; n.setAttribute("role", "status");
    n.innerHTML = '<span class="ico">' + INFO_FILLED + '</span><div><span></span><div class="actions"><button type="button" class="btn sm outline assistive" data-draft-discard></button></div></div>';
    $("div > span", n).textContent = DRAFT_LABEL.restored; $("[data-draft-discard]", n).textContent = DRAFT_LABEL.discard;
    f.insertBefore(n, f.firstChild); return n;
  }
  function draftPut(el, v, isDefault) {   // 값을 넣고 다른 동작(카운터 · 슬라이더 · 검증)이 따라오게 input · change 를 낸다
    var t = el.type;
    if (t === "checkbox" || t === "radio") { var c = isDefault ? el.defaultChecked : !!v; if (el.checked === c) return false; el.checked = c; }
    else {
      var dv = el.tagName === "SELECT" ? (($$("option", el).filter(function (o) { return o.defaultSelected; })[0] || el.options[0] || {}).value || "") : el.defaultValue;
      var sv = isDefault ? dv : String(v); if (el.value === sv) return false; el.value = sv;
    }
    el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); return true;
  }
  function draftRestore(f) {
    if (f._dsDraft) return; f._dsDraft = true;
    var d = null; try { d = JSON.parse(localStorage.getItem(draftKey(f)) || "null"); } catch (e) {}
    if (!d || !d.f) return;
    var n = 0;
    f._dsDraftQuiet = true;
    draftFields(f).forEach(function (el) {
      if (el.type === "radio") { var rk = "radio:" + el.name; if (el.name && rk in d.f && d.f[rk] === draftRadioIdx(f, el) && draftPut(el, true)) n++; return; }
      var k = el.name || el.id; if (k in d.f && draftPut(el, d.f[k])) n++;
    });
    f._dsDraftQuiet = false;
    if (n) draftNotice(f); else draftClear(f);
  }
  function draftClear(f) {
    clearTimeout(f._dsDraftT);
    try { localStorage.removeItem(draftKey(f)); } catch (e) {}
    var n = $(":scope > .draft-notice", f); if (n) n.parentNode.removeChild(n);
  }
  function draftDiscard(f) {
    var fields = draftFields(f);
    f._dsDraftQuiet = true;
    fields.forEach(function (el) { draftPut(el, null, true); });
    f._dsDraftQuiet = false;
    draftClear(f);
    var first = fields.filter(function (el) { return el.offsetParent; })[0]; if (first) first.focus();
  }
  function draftQueue(e) {
    var f = e.target && e.target.closest && e.target.closest("form[data-draft]"); if (!f || f._dsDraftQuiet) return;
    clearTimeout(f._dsDraftT); f._dsDraftT = setTimeout(function () { draftSave(f); }, 500);
  }
  doc.addEventListener("input", draftQueue, true); doc.addEventListener("change", draftQueue, true);
  doc.addEventListener("submit", function (e) {   // 캡처 — 검증이 막아도(stopPropagation) 같은 document 의 이 처리기는 돈다. 검증 결과(aria-invalid)를 보고 지운다. 막힌 제출은 기다리던 저장을 그대로 둔다(방금 친 값까지 남게)
    var f = e.target; if (!f.matches || !f.matches("form[data-draft]")) return;
    if (!$('[aria-invalid="true"]', f)) draftClear(f);
  }, true);
  doc.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest(".draft-notice [data-draft-discard]"), f = b && closest(b, "form[data-draft]"); if (f) draftDiscard(f); });
  /* Steps 마법사 — 패널 안 폼의 Enter 제출은 '다음'(마지막이면 '완료'). 검증은 위 캡처가 이미 했고 막히면 여기까지 오지 않는다 */
  doc.addEventListener("submit", function (e) { var f = e.target, p = f && f.closest && f.closest(".stepper .step-panel"), sp = p && closest(p, ".stepper"); if (!sp) return; e.preventDefault();   /* 막힌 제출은 위 캡처가 멈춘다. defaultPrevented 는 보지 않는다 — 제출 기본 동작을 막는 제품 · 문서 미리보기 처리기가 먼저 돌아도 단계는 넘어가야 한다 */ if (spPanels(sp).indexOf(p) === spCur(sp)) spNext(sp, true); });
  doc.addEventListener("focusout", function (e) { var cb = closest(e.target, ".combobox"); if (cb && !cb.contains(e.relatedTarget)) cbLeave(cb); });
  doc.addEventListener("focusout", function (e) { var t = e.target; if (!vIsField(t) || closest(t, ".combobox, .timepicker")) return; var form = closest(t, "form[data-validate]"); if (!form || !t.willValidate) return; if (t._dsDirty || t.value || closest(t, ".field").classList.contains("error")) { vShow(t, vMessage(t)); } });
  doc.addEventListener("input", function (e) {
    var t = e.target; if (!vIsField(t) || closest(t, ".combobox, .timepicker")) return; t._dsDirty = true;   // Time Picker 는 글자를 끊은 뒤 스스로 잰다
    if (t.hasAttribute("data-maxlength")) syncCounter(t);
    var form = closest(t, "form[data-validate]"), limit = vLimit(t), over = limit > 0 && t.value.length > limit;
    if (form) { if (t.willValidate && (over || closest(t, ".field").classList.contains("error"))) { vShow(t, vMessage(t)); } }
    else if (limit) { if (over) { vShow(t, vMessage(t)); t._dsOver = true; } else if (t._dsOver) { vShow(t, ""); t._dsOver = false; } }   // 폼 밖 — 한도 오류만, 제품이 건 오류는 건드리지 않는다
  });
  doc.addEventListener("focusout", function (e) {
    var host = closest(e.target, ".datepicker"), inp = host && $(":scope > .affix input", host); if (!inp || inp.readOnly || inp.disabled) return;
    if (e.relatedTarget && host.contains(e.relatedTarget)) return;   // 필드 안(달력 버튼 · 달력)에서 옮기는 동안은 기다린다 — 입력칸 → 달력 버튼 → 바깥으로 Tab 해도 검사한다
    /* 확정 뒤 바뀐 글자가 있을 때만 — 달력을 다시 그리면 포커스된 버튼이 사라지며 relatedTarget 없는 focusout 이 난다. 그때 검사하면 빈 입력으로 초안('오늘' 등)을 지웠다(2026-11-09 실측) */
    if (inp.value.trim() !== S(host).text) typed(host);
  });

  doc.addEventListener("input", function (e) {
    var t = e.target; if (!(t instanceof Element)) return;
    if (t.matches(".slider input[type=range]")) { syncSlider(t); fire(t, "ds:slide", { value: Number(t.value) }); }
    if (t.matches(".slider-field input")) sliderPair(t, "input");
    if (t.matches(".datepicker > .affix input") && !e.isComposing) dpInput(t, e);
    if (t.matches(".cal-time input") && !e.isComposing) clockInput(t, e);
    if (t.matches(".field input[maxlength], .field textarea[maxlength]")) syncCounter(t);
    if (t.matches(".combobox input[role=combobox]")) { var cbh = closest(t, ".combobox"), rm = cbh.getAttribute("data-filter") === "none"; cbh._dsTyped = true; cbOpen(cbh, true); cbFilter(cbh);
      if (rm) { clearTimeout(t._dsQuery); t._dsQuery = setTimeout(function () { fire(cbh, "ds:query", { query: t.value }); }, 300); } }
    if (t.matches(".searchbar input")) { var sb = closest(t, ".searchbar"), clr = $(".clear", sb), kb = $("kbd", sb); if (clr) clr.hidden = !t.value; if (kb) kb.hidden = !!t.value;
      if (sb.hasAttribute("data-debounce")) { clearTimeout(t._dsSearch); var dbr = sb.getAttribute("data-debounce"), dbn = dbr === "" ? 300 : Number(dbr); if (isNaN(dbn)) dbn = 300;   // 0 은 기다리지 않음(React debounce={0} 와 같다) — 빈 값만 기본 300
        if (dbn <= 0) searchFire(sb, t, "input"); else t._dsSearch = setTimeout(function () { searchFire(sb, t, "input"); }, dbn); } }
  });
  window.addEventListener("scroll", closeFloats, true);
  window.addEventListener("resize", closeFloats);
  window.addEventListener("scroll", followPickers, true);
  window.addEventListener("resize", followPickers);
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
    if (to !== b) { activate(g, "button", to, "aria-checked"); to.focus(); fire(to, "ds:select", { value: sbValue(to) }); }
  });
  /* 표 밀도 전환(2026-11-11) — .select-btn[data-density-for="표 id"] 의 버튼 data-density(compact · default · relaxed)로 표의 클래스를 바꾼다. 고른 밀도의 기억은 제품 몫 */
  doc.addEventListener("ds:select", function (e) {
    var g = e.target instanceof Element && closest(e.target, ".select-btn[data-density-for]"), t = g && doc.getElementById(g.getAttribute("data-density-for")), d = e.target.getAttribute("data-density");
    if (!t || !d) return;
    var tbl = t.matches("table") ? t : $("table.tbl", t); if (!tbl) return;
    tbl.classList.toggle("compact", d === "compact"); tbl.classList.toggle("relaxed", d === "relaxed");
  });
  doc.addEventListener("change", function (e) {
    var vg = e.target instanceof Element && closest(e.target, ".field .checkbox-group[data-required], .field .radio-group[data-required]"), vf = vg && closest(vg, "form[data-validate]");
    if (vf) { vShow(vg, vMessage(vg)); }   // 그룹은 고르면 바로 지우고, 마지막 하나를 풀면 바로 알린다. 지나가기만 하면 조용하다
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

  /* ---------- Time Picker — .timepicker(2026-11-13) ----------
     입력칸 + 열 목록(시 · 분 · 초). 24시간제 HH:mm, data-seconds 면 HH:mm:ss. 열에서 고르면 바로 값이 된다(사람의 결정 — 적용 버튼 없음).
     data-step 은 분 열의 간격이고 입력은 받는다. data-min · data-max 밖 칸은 고를 수 없고, 입력은 받아서 오류로 알린다(Number Input 과 같은 방식).
     문구는 Date Picker 의 시각 문구(invalidTime · timeSubject)와 범위 문구(min · max)를 같이 쓴다 — data-messages 로 바꾼다 */
  var TP_LABELS = { dialog: "시각 선택", hour: "시", minute: "분", second: "초" };
  function tpLabels(host) {
    var raw = host.getAttribute("data-labels"), o = {}, out = {}, k;
    if (raw) try { o = JSON.parse(raw) || {}; } catch (e) { if (!labelWarned[raw]) { labelWarned[raw] = 1; if (window.console) console.warn("[ds.js] data-labels 가 JSON 이 아닙니다 — 기본 문구를 씁니다: " + raw); } }
    for (k in TP_LABELS) out[k] = TP_LABELS[k];
    for (k in o) if (typeof o[k] === "string") out[k] = o[k];
    return out;
  }
  function tpSec(host) { return host.hasAttribute("data-seconds"); }
  function tpUnit(host) { return tpSec(host) ? "clockS" : "clock"; }
  function tpInp(host) { return $(".affix input", host); }
  function tpS(host) { return host._dsTp || (host._dsTp = { text: "" }); }
  /* 범위 값 — 초가 없는 data-min 은 :00 을 붙인다 */
  function tpBound(host, name) { var g = (host.getAttribute("data-" + name) || "").match(/\d+/g); if (!g || g.length < 2) return ""; return [g[0], g[1], g[2] || "0"].slice(0, tpSec(host) ? 3 : 2).map(function (x) { return pad(+x); }).join(":"); }
  /* 검사 — 빈 · 미완성 · 없는 시각 · min · max · 유효. 범위 밖도 값은 남긴다(React 와 같다) */
  function tpCheck(host, text) {
    var sec = tpSec(host), s = String(text || "").trim(), dg = s.replace(/\D/g, ""), n = sec ? 6 : 4, M = dpMessages(host);
    var lo = tpBound(host, "min"), hi = tpBound(host, "max"), x = { subject: M.timeSubject, example: sec ? "14:30:05" : "14:30", min: lo, max: hi };
    if (!s) return { validity: "empty", value: null };
    if (dg.length < n) return { validity: "incomplete", value: null, msg: say(M, "incomplete", x) };
    var h = +dg.slice(0, 2), m = +dg.slice(2, 4), c = sec ? +dg.slice(4, 6) : 0;
    if (dg.length > n || h > 23 || m > 59 || c > 59) return { validity: "invalid", value: null, msg: say(M, "invalidTime", x) };
    var v = pad(h) + ":" + pad(m) + (sec ? ":" + pad(c) : "");
    if (lo && v < lo) return { validity: "min", value: v, msg: say(M, "min", x) };
    if (hi && v > hi) return { validity: "max", value: v, msg: say(M, "max", x) };
    return { validity: "valid", value: v };
  }
  /* 확정 — Enter · 열에서 고름 · ↑↓ · 필드를 떠날 때. 폼 안에서는 폼 검증 문구(필수 포함), 밖에서는 시각 문구만 — 제품이 건 오류는 건드리지 않는다 */
  function tpCommit(host) {
    if (host.dataset.dpSide) { var dpi = tpInp(host), dhs = dpHost(host); if (dhs) { S(dhs).clock[host.dataset.dpSide] = dpi.value; renderMarks(dhs); } tpS(host).text = dpi.value.trim(); if (host.classList.contains("open")) tpMarks(host); return; }   // 달력 안 시각 칸 — 글자만 달력에 넘긴다(문구 · ds:time 없음, 적용할 때 필드가 잰다)
    var inp = tpInp(host), st = tpS(host), f = closest(inp, ".field"), r = tpCheck(host, inp.value), form = closest(inp, "form[data-validate]");
    if (r.value) { inp.value = r.value; inp._dpPrev = r.value; }
    host.dataset.validity = r.validity;
    if (form) { if (inp.value || inp._dsDirty || f.classList.contains("error")) { vShow(inp, vMessage(inp)); } }
    else if (r.msg) { vShow(inp, r.msg); st.err = true; }
    else if (st.err) { vShow(inp, ""); st.err = false; }
    if (inp.value.trim() !== st.text) { st.text = inp.value.trim(); fire(host, "ds:time", { value: r.value, text: st.text, validity: r.validity }); }
    if (host.classList.contains("open")) tpMarks(host);
  }
  function tpInit(host) {
    var inp = tpInp(host), st = tpS(host); if (!inp) return;
    if (inp.value) { inp.value = pasteText(inp.value, tpUnit(host), false); inp._dpPrev = inp.value; }   // 마크업 값 9:5 → 09:05
    st.text = inp.value.trim(); host.dataset.validity = tpCheck(host, inp.value).validity;
  }
  /* 지금 글자의 조각 — 두 자리가 찬 조각만(없으면 null) */
  function tpSegs(host) { var n = tpSec(host) ? 3 : 2, g = tpInp(host).value.split(":"), out = []; for (var i = 0; i < n; i++) out.push(g[i] && /^\d\d$/.test(g[i]) && +g[i] < (i ? 60 : 24) ? +g[i] : null); return out; }
  function tpCols(host) { return $$(".time-panel .time-col", host); }
  function tpOpts(col) { return $$(":scope > .time-opt", col); }
  function tpLive(o) { return o.getAttribute("aria-disabled") !== "true"; }
  /* 패널 — 열 때마다 새로 그린다(data-step · min · max 를 그때 읽는다). 칸은 div — .field .affix span 규칙을 받지 않게 패널은 .affix 밖 host 끝에 둔다 */
  function tpBuild(host) {
    var L = tpLabels(host), p = $(":scope > .time-panel", host), uid = (tpInp(host).id || "tp" + Math.random().toString(36).slice(2, 8)), step = Math.max(1, Math.min(59, parseInt(host.getAttribute("data-step"), 10) || 1));
    if (!p) { p = doc.createElement("div"); p.className = "time-panel"; p.setAttribute("role", "dialog"); host.appendChild(p); }
    p.setAttribute("aria-label", L.dialog);
    var col = function (key, len, by) { var h = '<div class="time-col" role="listbox" aria-label="' + L[key] + '" data-part="' + key + '">'; for (var i = 0; i < len; i += by) h += '<div class="time-opt" role="option" id="' + uid + "-" + key + "-" + pad(i) + '" data-v="' + i + '" aria-selected="false" tabindex="-1">' + pad(i) + "</div>"; return h + "</div>"; };
    p.innerHTML = col("hour", 24, 1) + col("minute", 60, step) + (tpSec(host) ? col("second", 60, 1) : "");
    tpMarks(host);
  }
  /* 고른 칸 · 고를 수 없는 칸 · 열마다 Tab 이 멈출 칸. 시는 그 시간 전체가 범위 밖일 때, 분은 그 분 전체, 초는 그 값이 범위 밖일 때 끈다 */
  function tpMarks(host) {
    var seg = tpSegs(host), sec = tpSec(host), lo = tpBound(host, "min"), hi = tpBound(host, "max"), t = function (a) { return a.map(pad).join(":"); };
    tpCols(host).forEach(function (col, ci) {
      var opts = tpOpts(col), act = null;
      opts.forEach(function (o) {
        var v = +o.dataset.v, first, last;
        if (ci === 0) { first = [v, 0, 0]; last = [v, 59, 59]; }
        else if (ci === 1) { if (seg[0] == null) { first = last = null; } else { first = [seg[0], v, 0]; last = [seg[0], v, 59]; } }
        else { if (seg[0] == null || seg[1] == null) { first = last = null; } else first = last = [seg[0], seg[1], v]; }
        var off = !!first && ((lo && t(last.slice(0, sec ? 3 : 2)) < lo) || (hi && t(first.slice(0, sec ? 3 : 2)) > hi));
        if (off) o.setAttribute("aria-disabled", "true"); else o.removeAttribute("aria-disabled");
        var on = seg[ci] === v; o.setAttribute("aria-selected", String(on)); o.classList.toggle("on", on);
        if (on && !off) act = o;
      });
      if (!act) { var cur = opts.filter(function (o) { return o.tabIndex === 0 && tpLive(o); })[0]; act = cur || opts.filter(tpLive)[0] || opts[0]; }
      opts.forEach(function (o) { o.tabIndex = o === act ? 0 : -1; });
    });
  }
  function tpPlace(host, keep) {
    var sp = pickerSpot(host, $(":scope > .time-panel", host), keep ? host.classList.contains("up") : null);
    host.classList.toggle("up", sp.up); host.classList.toggle("float", sp.float);
    host.style.setProperty("--tp-top", sp.top + "px");
    host.style.setProperty("--tp-left", sp.left + "px");
  }
  function tpOpen(host, focus) {
    var inp = tpInp(host); if (inp.value.trim() !== tpS(host).text) tpCommit(host);   // 열기 전에 친 글자를 먼저 반영한다
    tpBuild(host); host.classList.add("open"); host.dataset.dsOpened = "1";
    $$(".tp-btn", host).forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    tpPlace(host);
    tpCols(host).forEach(function (col) { var on = $(".time-opt.on", col); col.scrollTop = on ? on.offsetTop - parseFloat(getComputedStyle(col).paddingTop) : 0; });   // 고른 칸을 맨 위로
    if (focus) { var first = $(".time-opt[tabindex='0']", host); if (first) first.focus({ preventScroll: true }); }
  }
  function tpClose(host, restore) {
    host.classList.remove("open", "up", "float"); delete host.dataset.dsOpened;
    $$(".tp-btn", host).forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (restore) tpInp(host).focus();
  }
  /* 고름 — 그 조각만 바꾸고 빈 조각은 00 으로 채운다 */
  function tpPick(opt) {
    var host = closest(opt, ".timepicker"), col = closest(opt, ".time-col"), ci = tpCols(host).indexOf(col), seg = tpSegs(host), inp = tpInp(host);
    if (!tpLive(opt)) return false;
    seg[ci] = +opt.dataset.v;
    inp.value = seg.map(function (x) { return pad(x == null ? 0 : x); }).join(":"); inp._dpPrev = inp.value; inp._dsDirty = true;
    tpCommit(host);
    tpOpts(col).forEach(function (o) { o.tabIndex = o === opt ? 0 : -1; });
    return true;
  }
  function tpMove(col, opt) { tpOpts(col).forEach(function (o) { o.tabIndex = o === opt ? 0 : -1; }); opt.focus({ preventScroll: true }); opt.scrollIntoView({ block: "nearest" }); }
  function tpKey(e, opt) {
    var host = closest(opt, ".timepicker"), col = closest(opt, ".time-col"), cols = tpCols(host), ci = cols.indexOf(col), live = tpOpts(col).filter(tpLive), i = live.indexOf(opt), k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); var nx = live[k === "ArrowDown" ? Math.min(live.length - 1, i + 1) : Math.max(0, i < 0 ? 0 : i - 1)]; if (nx) tpMove(col, nx); return true; }
    if (k === "Home" || k === "End") { e.preventDefault(); if (live.length) tpMove(col, live[k === "Home" ? 0 : live.length - 1]); return true; }
    if (k === "ArrowLeft" || k === "ArrowRight") { e.preventDefault(); var c2 = cols[ci + (k === "ArrowRight" ? 1 : -1)]; if (c2) { var t2 = $(".time-opt[tabindex='0']", c2); if (t2) tpMove(c2, t2); } return true; }
    if (k === "Enter" || k === " ") { e.preventDefault(); if (!tpPick(opt)) return true; var c3 = cols[ci + 1]; if (c3) { var t3 = $(".time-opt[tabindex='0']", c3); if (t3) tpMove(c3, t3); } else tpClose(host, true); return true; }   // 고르고 다음 열로, 마지막 열이면 닫고 입력칸으로
    if (k === "Escape") { e.preventDefault(); e.stopPropagation(); tpClose(host, true); return true; }
    return false;
  }
  doc.addEventListener("input", function (e) {
    var t = e.target; if (!t.matches || !t.matches(".timepicker .affix input") || e.isComposing) return;
    var host = closest(t, ".timepicker"), form = closest(t, "form[data-validate]");
    reflow(t, e, tpUnit(host), false); t._dsDirty = true;
    if (closest(t, ".field").classList.contains("error")) { if (form) { vShow(t, vMessage(t)); } else vShow(t, tpCheck(host, t.value).msg || ""); }   // 오류가 있는 동안은 칠 때마다 다시 재 바로 지운다
    if (host.classList.contains("open")) tpMarks(host);
  });
  doc.addEventListener("keydown", function (e) {
    var t = e.target; if (!(t instanceof Element)) return;
    var opt = closest(t, ".timepicker .time-opt"); if (opt) { tpKey(e, opt); return; }
    var otp = e.key === "Escape" && closest(t, ".timepicker.open"); if (otp && !closest(t, ".affix input")) { e.preventDefault(); e.stopPropagation(); tpClose(otp, true); return; }   // 열린 채 시계 버튼에서 Esc — 목록만 닫는다(달력 안이면 달력은 그대로)
    var inp = closest(t, ".timepicker .affix input"); if (!inp || e.isComposing) return;
    var host = closest(inp, ".timepicker");
    if (host.dataset.dpSide && e.key !== "Escape" && !(e.key === "ArrowDown" && e.altKey)) return;   // 달력 안 — Enter(적용) · ↑↓ 는 달력이 맡는다
    if (e.key === "Enter") { e.preventDefault(); tpCommit(host); return; }
    if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); var b = $(".tp-btn", host); if (b && !b.disabled) tpOpen(host, true); return; }
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !inp.readOnly && !inp.disabled) { e.preventDefault(); clockBump(inp, tpSec(host) ? 3 : 2, e.key === "ArrowUp" ? 1 : -1); inp._dsDirty = true; tpCommit(host); return; }
    if (e.key === "Escape" && host.classList.contains("open")) { e.preventDefault(); e.stopPropagation(); tpClose(host, false); }   // 가장 안쪽 하나만 — 대화상자는 다음 Esc 에
  }, true);
  doc.addEventListener("click", function (e) {
    var t = e.target; if (!(t instanceof Element)) return;
    var b = closest(t, ".timepicker .tp-btn"); if (b) { var h = closest(b, ".timepicker"); if (b.disabled) return; if (h.classList.contains("open")) tpClose(h, true); else tpOpen(h, true); return; }
    var opt = closest(t, ".timepicker .time-opt"); if (opt) tpPick(opt);
  });
  /* 필드를 떠나면 닫고 확정한다 — 입력칸 → 버튼 → 열 사이를 옮기는 동안은 기다린다 */
  doc.addEventListener("focusout", function (e) {
    var host = closest(e.target, ".timepicker"); if (!host || (e.relatedTarget && host.contains(e.relatedTarget))) return;
    var inp = tpInp(host); if (!inp || inp.disabled || inp.readOnly) return;
    if (host.classList.contains("open")) tpClose(host, false);
    tpCommit(host);
  });

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
    /* 다시 시도 + 지우기 = 나란한 버튼 둘이라 .btn-group 으로 묶고, 하나로 돌아가면 푼다(2026-11-18). 옮긴 지우기 버튼의 포커스는 되돌린다 */
    if (retry && !rt) {
      var hadRm = rm === doc.activeElement, grp = doc.createElement("div"); grp.className = "btn-group";
      li.insertBefore(grp, rm); grp.appendChild(upButton("retry", UP_ICON.retry, nm + " " + upL(h, "retry"))); grp.appendChild(rm); if (hadRm) rm.focus();
    } else if (!retry && rt) {
      if (rt === doc.activeElement) rm.focus();
      var g = rt.parentNode; rt.remove();
      if (g !== li && g.classList.contains("btn-group")) { var hadRm2 = rm === doc.activeElement; li.insertBefore(rm, g); g.remove(); if (hadRm2) rm.focus(); }
    }
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
    vShow(pick, busy ? "" : msg);
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
  doc.addEventListener("change", function (e) { var t = e.target; if (t.matches && t.matches(".slider-field input[type=range]")) sliderPair(t, "change"); });
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

  /* ---------- Tree — ul.tree[role=tree](2026-11-14 사람의 결정: 탐색형 기본 + 체크박스 옵션 · 불러오기는 상태만 · 검색 필터 · 끌어 옮기기 없음) ----------
     WAI-ARIA tree 패턴. 포커스는 li 하나만 Tab 칸(roving tabindex). 탐색형은 Enter · Space · 클릭으로 고르고(포커스가 옮겨도 고르지 않는다 — 고를 때마다 오른쪽 내용을 다시 부르지 않게),
     체크박스형(.tree.checkable)은 하위를 따라 켜고 일부만 켜지면 상위가 mixed. 끈 항목은 펼칠 수는 있고 고르거나 켤 수 없다.
     data-lazy 항목은 펼칠 때 ds:tree-load {value, resolve(items), reject(msg)} — 조회는 제품, 불러오는 동안 셰브론 자리에 스피너 · aria-busy, 실패하면 접고 줄에 알린다(다시 펼치면 다시 부름) */
  var TREE_LABEL = { failed: "불러오지 못했습니다. 다시 펼치세요", failedStatus: "{label} 하위 항목을 불러오지 못했습니다. 다시 펼치면 다시 불러옵니다.", results: "결과 {n}개", empty: "검색 결과가 없습니다." };
  function trL(tree, k) { var h = closest(tree, ".tree-view") || tree, raw = h.getAttribute("data-labels") || tree.getAttribute("data-labels"), o = {}; if (raw) { try { o = JSON.parse(raw) || {}; } catch (e) { o = {}; } } return o[k] || TREE_LABEL[k]; }
  function trEsc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function trGroup(li) { return $(":scope > .tree-group", li); }
  function trText(li) { var l = $(":scope > .tree-row > .tree-label", li); return l ? (l._dsText != null ? l._dsText : l.textContent).trim() : ""; }
  function trVal(li) { return li.dataset.value != null ? li.dataset.value : trText(li); }
  function trOff(li) { return li.getAttribute("aria-disabled") === "true"; }
  function trShown(li, tree) { if (li.hidden) return false; for (var p = li.parentElement; p && p !== tree; p = p.parentElement) if (p.hidden) return false; return true; }
  function trVisible(tree) { return $$(".tree-item", tree).filter(function (li) { return trShown(li, tree); }); }
  function trParent(li) { var g = li.parentElement; return g && g.classList.contains("tree-group") ? closest(g, ".tree-item") : null; }
  function trFocus(li, noFocus) {
    var tree = closest(li, ".tree"); if (!tree) return;
    $$(".tree-item", tree).forEach(function (x) { x.tabIndex = x === li ? 0 : -1; });
    if (!noFocus) li.focus();
  }
  function trInit(tree) {
    $$(".tree-item", tree).forEach(function (li) { var g = trGroup(li); if (g) g.hidden = li.getAttribute("aria-expanded") !== "true"; });
    if (tree.classList.contains("checkable")) trSync(tree);
    trRove(tree);
  }
  function trRove(tree) {   // Tab 칸 하나 — 보이는 고른 항목, 없으면 보이는 첫 항목
    var vis = trVisible(tree), cur = vis.filter(function (li) { return li.tabIndex === 0; })[0] || vis.filter(function (li) { return li.getAttribute("aria-selected") === "true"; })[0] || vis[0];
    if (cur) trFocus(cur, true);
  }
  function trExpand(li, open) {
    if (!li.hasAttribute("aria-expanded") || li.getAttribute("aria-busy") === "true") return;
    if (open && li.hasAttribute("data-lazy") && !trGroup(li)) { trLoad(li); return; }
    var g = trGroup(li); if (!g || (li.getAttribute("aria-expanded") === "true") === open) return;
    li.setAttribute("aria-expanded", String(open)); g.hidden = !open;
    fire(li, "ds:tree-expand", { value: trVal(li), expanded: open });
  }
  function trLoad(li) {
    var tree = closest(li, ".tree"), tg = $(":scope > .tree-row > .tree-toggle", li), err = $(":scope > .tree-row > .tree-meta.error", li), done = false;
    if (err) err.remove();
    li.setAttribute("aria-busy", "true");
    if (tg) { var sp = doc.createElement("span"); sp.className = "spinner"; sp.setAttribute("aria-hidden", "true"); tg.appendChild(sp); }
    var end = function () { done = true; li.removeAttribute("aria-busy"); var s = tg && $(".spinner", tg); if (s) s.remove(); };
    fire(li, "ds:tree-load", {
      value: trVal(li),
      resolve: function (items) {
        if (done || !li.isConnected) return; end();
        var lv = +li.getAttribute("aria-level") || 1, chk = tree.classList.contains("checkable"), on = li.getAttribute("aria-checked") === "true";
        var g = doc.createElement("ul"); g.className = "tree-group"; g.setAttribute("role", "group");
        g.innerHTML = trBuild(items || [], lv + 1, chk, on);
        li.appendChild(g); li.removeAttribute("data-lazy");
        li.setAttribute("aria-expanded", "true");
        if (chk) trSync(tree);
        if (tree._dsQ) trFilter(tree, tree._dsQ);
        fire(li, "ds:tree-expand", { value: trVal(li), expanded: true });
      },
      reject: function (msg) {
        if (done || !li.isConnected) return; end();
        li.setAttribute("aria-expanded", "false");
        var row = $(":scope > .tree-row", li), m = doc.createElement("span"); m.className = "tree-meta error"; m.textContent = trL(tree, "failed"); row.appendChild(m);
        dsSay(msg || trL(tree, "failedStatus").replace("{label}", trText(li)));
      },
    });
  }
  var trUid = 0;
  function trBuild(items, lv, chk, on) {
    return items.map(function (it) {
      var kids = it.children && it.children.length, par = kids || it.lazy, id = "tree-" + (++trUid), st = it.checked != null ? (it.checked === "mixed" ? "mixed" : String(!!it.checked)) : String(!!on && !it.disabled);
      return "<li class=\"tree-item\" role=\"treeitem\" aria-level=\"" + lv + "\" tabindex=\"-1\"" + (par ? " aria-expanded=\"false\" aria-labelledby=\"" + id + "\"" : "") + (it.lazy && !kids ? " data-lazy" : "") + (it.disabled ? " aria-disabled=\"true\"" : "") + (chk ? " aria-checked=\"" + st + "\"" : "") + (it.value != null ? " data-value=\"" + trEsc(it.value) + "\"" : "") + ">" +
        "<div class=\"tree-row\"><span class=\"tree-toggle\" aria-hidden=\"true\">" + (par ? ICON["chevron-right"] : "") + "</span>" + (chk ? "<span class=\"tree-check\" aria-hidden=\"true\"></span>" : "") +
        "<span class=\"tree-label\"" + (par ? " id=\"" + id + "\"" : "") + ">" + trEsc(it.label) + "</span>" + (it.meta != null ? "<span class=\"tree-meta\">" + trEsc(it.meta) + "</span>" : "") + "</div>" +
        (kids ? "<ul class=\"tree-group\" role=\"group\" hidden>" + trBuild(it.children, lv + 1, chk, st === "true") + "</ul>" : "") + "</li>";
    }).join("");
  }
  function trSelect(li) {
    var tree = closest(li, ".tree"); if (!tree || trOff(li)) return;
    if (tree.classList.contains("checkable")) { trCheck(li); return; }
    $$(".tree-item[aria-selected]", tree).forEach(function (x) { if (x !== li) x.removeAttribute("aria-selected"); });
    li.setAttribute("aria-selected", "true"); trFocus(li);
    fire(li, "ds:tree-select", { value: trVal(li), label: trText(li) });
  }
  /* 켜고 끄기 — 상위를 누르면 켤 수 있는 하위가 모두 따라간다. 이미 켤 수 있는 것이 다 켜져 있으면 끈다(끈 하위가 꺼진 채라 mixed 로 남아도 다시 누르면 꺼짐) */
  function trCheck(li) {
    var tree = closest(li, ".tree"); if (trOff(li)) return;
    var open = [li].concat($$(".tree-item", li)).filter(function (x) { return !trOff(x); }), ends = open.filter(function (x) { return !trGroup(x); }), full = ends.every(function (x) { return x.getAttribute("aria-checked") === "true"; }), next = !full;   // 상위 자신의 mixed 는 보지 않는다 — 켤 수 있는 끝 항목이 다 켜졌으면 끈다
    open.forEach(function (x) { x.setAttribute("aria-checked", String(next)); });
    trSync(tree); trFocus(li);
    fire(li, "ds:tree-check", { value: trVal(li), checked: next, values: $$(".tree-item[aria-checked=\"true\"]", tree).map(trVal) });
  }
  function trSync(tree) {   // 아래에서 위로 — 하위가 모두 켜지면 true, 모두 꺼지면 false, 그 밖은 mixed
    $$(".tree-item", tree).filter(trGroup).sort(function (a, b) { return (+b.getAttribute("aria-level") || 1) - (+a.getAttribute("aria-level") || 1); }).forEach(function (li) {
      var kids = $$(":scope > .tree-group > .tree-item", li).map(function (x) { return x.getAttribute("aria-checked"); }); if (!kids.length) return;
      li.setAttribute("aria-checked", kids.every(function (s) { return s === "true"; }) ? "true" : kids.every(function (s) { return s === "false"; }) ? "false" : "mixed");
    });
  }
  /* 검색 필터 — 맞는 항목과 그 상위만 남기고 펼친다. 맞는 글자는 굵게, 결과 수는 알림 영역에. 지우면 검색 전 펼침으로 돌아간다. 아직 불러오지 않은 하위는 찾지 않는다(서버 검색은 제품) */
  function trFilter(tree, q) {
    var view = closest(tree, ".tree-view"); q = (q || "").trim().toLowerCase();
    var items = $$(".tree-item", tree);
    if (q && !tree._dsQ) tree._dsExp = items.filter(function (li) { return li.getAttribute("aria-expanded") === "true"; });
    tree._dsQ = q;
    items.forEach(function (li) { var l = $(":scope > .tree-row > .tree-label", li); if (l._dsText == null) l._dsText = l.textContent; l.textContent = l._dsText; });
    if (!q) {
      var keep = tree._dsExp || []; delete tree._dsExp;
      items.forEach(function (li) { li.hidden = false; var g = trGroup(li); if (g) { var o = keep.indexOf(li) > -1; li.setAttribute("aria-expanded", String(o)); g.hidden = !o; } });
      var e0 = view && $(":scope > .tree-empty", view); if (e0) e0.hidden = true;
      trRove(tree); return;
    }
    var jamo = /^[ㄱ-ㅎ]+$/.test(q), n = 0;
    items.slice().sort(function (a, b) { return (+b.getAttribute("aria-level") || 1) - (+a.getAttribute("aria-level") || 1); }).forEach(function (li) {
      var t = li.querySelector(":scope > .tree-row > .tree-label")._dsText, lo = t.toLowerCase(), at = lo.indexOf(q), hit = at > -1 || (jamo && cho(lo).indexOf(q) > -1);
      var g = trGroup(li), kid = g && $$(":scope > .tree-item", g).some(function (x) { return !x.hidden; });
      li.hidden = !(hit || kid);
      if (g) { li.setAttribute("aria-expanded", String(!!kid)); g.hidden = !kid; }
      if (hit) { n++; if (at > -1) { var l = $(":scope > .tree-row > .tree-label", li); l.innerHTML = trEsc(t.slice(0, at)) + "<mark class=\"tree-hit\">" + trEsc(t.slice(at, at + q.length)) + "</mark>" + trEsc(t.slice(at + q.length)); } }
    });
    if (view) { var e = $(":scope > .tree-empty", view); if (!e) { e = doc.createElement("p"); e.className = "tree-empty"; e.textContent = trL(tree, "empty"); view.appendChild(e); } e.hidden = n > 0; }
    dsSay(n ? trL(tree, "results").replace("{n}", n) : trL(tree, "empty"));
    trRove(tree);
  }
  var trType = { s: "", t: 0 };
  function trTypeahead(tree, li, key) {
    var now = Date.now(); if (now - trType.t > 500) trType.s = ""; trType.t = now; trType.s += key.toLowerCase();
    var rep = trType.s.split("").every(function (c) { return c === trType.s[0]; }), q = rep ? trType.s[0] : trType.s, vis = trVisible(tree), i = vis.indexOf(li), from = rep ? i + 1 : Math.max(i, 0);
    return vis.slice(from).concat(vis.slice(0, from)).filter(function (x) { var l = trText(x).toLowerCase(); return l.indexOf(q) === 0 || cho(l).indexOf(q) === 0; })[0];
  }
  doc.addEventListener("click", function (e) {
    var row = closest(e.target, ".tree-row"), li = row && row.parentElement; if (!li || !li.classList.contains("tree-item")) return;
    if (closest(e.target, ".tree-toggle") && li.hasAttribute("aria-expanded")) { trExpand(li, li.getAttribute("aria-expanded") !== "true"); trFocus(li); return; }
    if (trOff(li)) { trFocus(li); return; }
    trSelect(li);
  });
  doc.addEventListener("keydown", function (e) {
    var li = e.target, tree = li.classList && li.classList.contains("tree-item") && closest(li, ".tree");
    if (!tree) {   // 검색칸에서 아래 화살표 — 트리의 첫 항목으로
      var view = e.key === "ArrowDown" && closest(e.target, ".tree-view > .searchbar"), t = view && $(".tree", view.parentNode), f = t && trVisible(t)[0];
      if (f) { e.preventDefault(); trFocus(f); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var vis = trVisible(tree), i = vis.indexOf(li), exp = li.getAttribute("aria-expanded"), go = null;
    switch (e.key) {
      case "ArrowDown": go = vis[i + 1]; break;
      case "ArrowUp": go = vis[i - 1]; break;
      case "Home": go = vis[0]; break;
      case "End": go = vis[vis.length - 1]; break;
      case "ArrowRight": if (exp === "false") trExpand(li, true); else if (exp === "true") go = vis[i + 1] && trParent(vis[i + 1]) === li ? vis[i + 1] : null; break;
      case "ArrowLeft": if (exp === "true") trExpand(li, false); else go = trParent(li); break;
      case "Enter": case " ": trSelect(li); break;
      case "*": $$(":scope > .tree-item", li.parentElement).forEach(function (x) { if (!x.hasAttribute("data-lazy")) trExpand(x, true); }); break;   // 같은 단계 모두 펼침 — 불러와야 하는 항목은 건너뛴다(한꺼번에 조회하지 않게)
      default:
        if (e.key.length === 1 && e.key !== " ") { var hit = trTypeahead(tree, li, e.key); if (hit) { e.preventDefault(); trFocus(hit); } }
        return;
    }
    e.preventDefault();
    if (go) trFocus(go);
  });
  function trQuery(e) { var view = closest(e.target, ".tree-view"), inp = view && $(":scope > .searchbar input", view); if (!inp || (e.type === "input" && e.target !== inp)) return; var t = $(":scope > .tree", view); if (t) trFilter(t, inp.value); }
  doc.addEventListener("input", trQuery);
  doc.addEventListener("ds:search", trQuery);   // 지우기 버튼 · Esc 로 비웠을 때

  /* ---------- Notification Center(2026-11-14) ----------
     벨 버튼(aria-haspopup=dialog)이 비모달 대화상자 .notify-panel 을 연다. 읽음 · 개수 · 탭 거르기 · 더 보기 상태 · 새 알림 추가와 알림은 여기서,
     알림을 받아 오는 연결과 서버의 읽음 저장은 제품이 한다(ds:notify-read · ds:notify-more · DS.notify.add) */
  var NF_LABEL = { trigger: "알림 {n}건", triggerNone: "알림", unread: "안 읽음", empty: "알림이 없습니다.", emptyUnread: "안 읽은 알림이 없습니다.", more: "이전 알림 보기", retry: "다시 시도", moreFailed: "알림을 불러오지 못했습니다.", loaded: "알림 {n}건을 더 불러왔습니다.", readAll: "모든 알림을 읽음으로 표시했습니다.", fresh: "새 알림: {title}", freshMany: "새 알림 {n}건", today: "오늘" };
  var NF_SEV = { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" };
  function nfL(host, k) { var raw = host.getAttribute("data-labels"), o = {}; if (raw) { try { o = JSON.parse(raw) || {}; } catch (e) { o = {}; } } return o[k] || NF_LABEL[k]; }
  function nfPanel(host) { return $(":scope > .notify-panel", host); }
  function nfTrigger(host) { return $("[aria-haspopup=dialog]", host); }
  function nfItems(host) { return $$(".notify-item", host); }
  function nfSync(host) {   // 안 읽은 수 — 벨 배지 · 접근 이름 · Tooltip · 탭 배지 · 모두 읽음 버튼
    var n = nfItems(host).filter(function (li) { return li.classList.contains("unread"); }).length, t = nfTrigger(host), name = n ? nfL(host, "trigger").replace("{n}", n) : nfL(host, "triggerNone");
    var wc = $(".with-count", host), c = wc && $(":scope > .count", wc), num = host.getAttribute("data-count") === "number"; if (n && wc && !c) { c = doc.createElement("span"); c.className = "count"; c.setAttribute("aria-hidden", "true"); wc.appendChild(c); }   // 0 이면 배지를 두지 않는다 — 새 알림이 오면 만든다
    if (c) { c.classList.toggle("dot", !num); c.textContent = num ? (n > 99 ? "99+" : String(n)) : ""; c.hidden = !n; }   // 벨은 점이 기본, 숫자는 data-count="number"(2026-11-18) — 접근 이름 '알림 n건' 은 점이어도 같다
    if (t) { t.setAttribute("aria-label", name); var tip = t.parentNode.classList.contains("tooltip-wrap") && $(".tooltip", t.parentNode); if (tip) tip.textContent = name; }
    var ut = $(".tabs .tab[data-filter=unread]", host), tc = ut && $(".count", ut); if (n && ut && !tc) { tc = doc.createElement("span"); tc.className = "count"; ut.appendChild(doc.createTextNode(" ")); ut.appendChild(tc); }
    if (tc) { tc.textContent = n > 99 ? "99+" : String(n); tc.hidden = !n; }
    var ra = $(".notify-read-all", host); if (ra) { if (n) ra.removeAttribute("aria-disabled"); else ra.setAttribute("aria-disabled", "true"); }
    nfItems(host).forEach(function (li) { var s = $(".notify-link > .sr-only", li); if (s) s.textContent = li.classList.contains("unread") ? ", " + nfL(host, "unread") : ""; });
    return n;
  }
  function nfFilter(host) {   // 안 읽음 탭이면 읽은 항목 · 빈 묶음을 숨기고, 보일 것이 없으면 빈 상태 문구
    var tab = $(".tabs .tab.on", host), only = tab && tab.getAttribute("data-filter") === "unread", shown = 0;
    nfItems(host).forEach(function (li) { li.hidden = only && !li.classList.contains("unread"); if (!li.hidden) shown++; });
    $$(".notify-group", host).forEach(function (g) { g.hidden = !$$(".notify-item", g).some(function (li) { return !li.hidden; }); });
    var body = $(".notify-body", host); if (!body) return;
    var em = $(":scope > .notify-empty", body); if (!em) { em = doc.createElement("p"); em.className = "notify-empty"; var more = $(":scope > .notify-more", body); body.insertBefore(em, more); }
    em.textContent = nfL(host, only ? "emptyUnread" : "empty"); em.hidden = shown > 0;
  }
  function nfFit(host) {   // 띄우지 않는 자리 — 넘침을 자르는 영역(없으면 화면) 안 8px 에 들게 좁히고 민다
    var p = nfPanel(host), c = { left: 0, right: window.innerWidth };
    p.style.removeProperty("--nf-dx"); p.style.removeProperty("max-width");
    for (var e = host.parentElement; e && e !== doc.body; e = e.parentElement) { var cs = getComputedStyle(e); if (/auto|scroll|hidden|clip/.test(cs.overflowX + cs.overflowY)) { c = e.getBoundingClientRect(); break; } }
    var room = c.right - c.left - 16; if (p.offsetWidth > room) p.style.maxWidth = room + "px";
    var pr = p.getBoundingClientRect(); if (pr.left < c.left + 8) p.style.setProperty("--nf-dx", (c.left + 8 - pr.left) + "px");   // 오른쪽 정렬이 왼쪽을 넘으면 민다
  }
  function nfPlace(host, init) {   // init — 처음부터 열린 패널은 띄우지 않는다(띄운 패널은 페이지 스크롤에 닫히므로)
    var p = nfPanel(host), t = nfTrigger(host); host.classList.remove("float"); p.style.removeProperty("--nf-dx"); p.style.removeProperty("max-width");
    if (!init && inClipper(host) && t) {   // 표 · 스크롤 영역 안 — 화면 기준, 트리거 오른쪽 끝에 맞추고 화면 안 8px
      var r = t.getBoundingClientRect(), w = p.offsetWidth;
      host.style.setProperty("--float-x", Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + "px");
      host.style.setProperty("--float-y", (r.bottom + 8) + "px"); host.classList.add("float"); return;
    }
    nfFit(host);
  }
  function nfOpen(host, open, back) {
    var p = nfPanel(host), t = nfTrigger(host); if (!p || host.classList.contains("open") === open) return;
    host.classList.toggle("open", open); p.hidden = !open; if (t) t.setAttribute("aria-expanded", String(open));
    if (open) { if (!p.hasAttribute("tabindex")) p.tabIndex = -1; nfSync(host); nfFilter(host); nfPlace(host); p.focus({ preventScroll: true }); fire(host, "ds:notify-open", { open: true }); }
    else { host.classList.remove("float"); if (back && t) t.focus({ preventScroll: true }); fire(host, "ds:notify-open", { open: false }); }
  }
  function nfRead(host, lis, all) {
    var ids = lis.filter(function (li) { return li.classList.contains("unread"); }).map(function (li) { li.classList.remove("unread"); return li.dataset.id; });
    if (!ids.length) return;
    nfSync(host); fire(host, "ds:notify-read", { ids: ids, all: !!all });
  }
  var nfUid = 0;
  function nfItemHtml(host, it) {
    var sev = it.severity && NF_SEV[it.severity], tag = sev ? "<span class=\"tag sm " + it.severity + "\">" + trEsc(it.severityLabel || sev) + "</span>" : "", inner =
      "<span class=\"notify-dot\" aria-hidden=\"true\"></span><span class=\"notify-main\"><span class=\"notify-text\">" + tag + trEsc(it.title) + "</span>" + (it.sub ? "<span class=\"notify-sub\">" + trEsc(it.sub) + "</span>" : "") + "</span>" +
      "<time class=\"notify-time\"" + (it.datetime ? " datetime=\"" + trEsc(it.datetime) + "\"" : "") + ">" + trEsc(it.time || "") + "</time><span class=\"sr-only\"></span>";
    return "<li class=\"notify-item" + (it.unread === false ? "" : " unread") + "\" data-id=\"" + trEsc(it.id != null ? it.id : "nf-" + (++nfUid)) + "\">" + (it.href ? "<a class=\"notify-link\" href=\"" + trEsc(it.href) + "\">" + inner + "</a>" : "<button type=\"button\" class=\"notify-link\">" + inner + "</button>") + "</li>";
  }
  function nfGroup(body, label, top) {   // 같은 이름의 묶음이 끝(더 보기) 또는 처음(새 알림)에 있으면 그곳에, 없으면 새로
    var gs = $$(":scope > .notify-group", body), g = top ? gs[0] : gs[gs.length - 1];
    if (g && $(".notify-day", g).textContent.trim() === label) return $(".notify-list", g);
    g = doc.createElement("section"); g.className = "notify-group"; g.setAttribute("aria-label", label);
    g.innerHTML = "<h3 class=\"notify-day\">" + trEsc(label) + "</h3><ul class=\"notify-list\"></ul>";
    var anchor = top ? gs[0] || $(":scope > .notify-empty, :scope > .notify-more", body) : $(":scope > .notify-empty, :scope > .notify-more", body);
    body.insertBefore(g, anchor || null); return $(".notify-list", g);
  }
  function nfAdd(host, items, top) {
    var body = $(".notify-body", host); if (!body) return [];
    items = [].concat(items || []); if (top) items = items.slice().reverse();
    var made = items.map(function (it) {
      var ul = nfGroup(body, it.group || nfL(host, "today"), top), w = doc.createElement("ul"); w.innerHTML = nfItemHtml(host, it);
      var li = w.firstChild; if (top) ul.insertBefore(li, ul.firstChild); else ul.appendChild(li); return li;
    });
    nfSync(host); nfFilter(host); if (top) made.reverse(); return made;
  }
  function nfMore(host, btn) {
    if (btn.classList.contains("loading")) return;
    var box = closest(btn, ".notify-more"), msg = $(".msg", box), done = false;
    if (!msg) { msg = doc.createElement("p"); msg.className = "msg"; msg.setAttribute("role", "status"); box.insertBefore(msg, btn); }
    msg.textContent = ""; btn.classList.add("loading"); btn.setAttribute("aria-busy", "true");
    var end = function () { done = true; btn.classList.remove("loading"); btn.removeAttribute("aria-busy"); };
    fire(host, "ds:notify-more", {
      resolve: function (items, o) {
        if (done || !host.isConnected) return; end();
        var made = nfAdd(host, items, false); btn.textContent = nfL(host, "more");
        dsSay(nfL(host, "loaded").replace("{n}", made.length));
        if (o && o.done) { var f = made.filter(function (li) { return !li.hidden; })[0]; box.remove(); if (f) $(".notify-link", f).focus(); else nfPanel(host).focus(); }
      },
      reject: function (m) {
        if (done || !host.isConnected) return; end();
        msg.textContent = m || nfL(host, "moreFailed"); btn.textContent = nfL(host, "retry");
      },
    });
  }
  doc.addEventListener("click", function (e) {
    var t = closest(e.target, ".notify > .with-count [aria-haspopup=dialog], .notify > [aria-haspopup=dialog]");
    if (t) { var h = closest(t, ".notify"); nfOpen(h, !h.classList.contains("open")); return; }
    var host = closest(e.target, ".notify"); if (!host) return;
    var ln = closest(e.target, ".notify-link");
    if (ln) { nfRead(host, [closest(ln, ".notify-item")], false); if (ln.tagName === "A") setTimeout(function () { nfOpen(host, false); }, 0); return; }   // 이동하는 항목은 닫는다 — 이동은 링크가 한다
    var ra = closest(e.target, ".notify-read-all");
    if (ra) { if (ra.getAttribute("aria-disabled") === "true") return; nfRead(host, nfItems(host), true); nfFilter(host); dsSay(nfL(host, "readAll")); return; }
    var mb = closest(e.target, ".notify-more > .btn"); if (mb) nfMore(host, mb);
  });
  doc.addEventListener("ds:tab", function (e) { var host = closest(e.target, ".notify"); if (host) nfFilter(host); });
  doc.addEventListener("pointerdown", function (e) { $$(".notify.open").forEach(function (h) { if (!h.contains(e.target)) nfOpen(h, false); }); });
  doc.addEventListener("keydown", function (e) {   // Esc 는 팝오버만 닫고 벨로 — 바깥 대화상자까지 닫지 않는다
    if (e.key !== "Escape") return; var host = closest(e.target, ".notify.open"); if (!host) return;
    e.stopImmediatePropagation(); e.preventDefault(); nfOpen(host, false, true);
  }, true);
  window.addEventListener("resize", function () { $$(".notify.open:not(.float)").forEach(nfFit); });   // 띄운 패널은 closeFloats 가 닫는다
  doc.addEventListener("focusout", function (e) { var host = closest(e.target, ".notify.open"); if (host && e.relatedTarget && !host.contains(e.relatedTarget)) nfOpen(host, false); });   // Tab 으로 떠나면 닫는다(포커스가 사라진 경우 — 창 전환 — 는 그대로)
  function nfInit(host) {
    var p = nfPanel(host), t = nfTrigger(host); if (!p) return;
    if (t) { if (!p.id) p.id = "ds-notify-" + (++nfUid); t.setAttribute("aria-controls", p.id); t.setAttribute("aria-expanded", String(!p.hidden)); }
    host.classList.toggle("open", !p.hidden);
    nfSync(host); nfFilter(host); if (!p.hidden) nfPlace(host, true);
  }
  function nfApiAdd(el, items) {
    var host = closest(el, ".notify") || el, list = [].concat(items || []), made = nfAdd(host, list, true), fresh = list.filter(function (it) { return it.unread !== false; });
    if (fresh.length) dsSay(fresh.length === 1 ? nfL(host, "fresh").replace("{title}", fresh[0].title) : nfL(host, "freshMany").replace("{n}", fresh.length));   // 한꺼번에 여럿이면 한 번만 — 연달아 넣으면 앞 문구가 지워진다
    return made;
  }

  /* ---------- Loading 지연 — 보일지를 정한다(사람의 결정 2026-11-11) ----------
     start 뒤 delay(기본 1000ms) 안에 stop 하면 끝내 보이지 않고, 한 번 보이면 min(기본 500ms)을 채운 뒤 숨긴다 — 1.1초에 끝나는 동작이 0.1초 번쩍이지 않게.
     el.hidden 을 쓴다. 이 도우미를 쓰는 요소에는 data-delay 를 달지 않는다(보일 때 CSS 지연이 한 번 더 걸린다) */
  var LOAD = { delay: 1000, min: 500 };
  function loadStart(el, o) {
    o = o || {}; var st = el._dsLoad || (el._dsLoad = {}); clearTimeout(st.t); st.min = o.min != null ? o.min : LOAD.min;
    if (st.shown) return;   // 이미 보이면 그대로 — 숨기려던 것만 취소한다
    el.hidden = true;
    st.t = setTimeout(function () { el.hidden = false; st.shown = Date.now(); }, o.delay != null ? o.delay : LOAD.delay);
  }
  function loadStop(el) {
    var st = el._dsLoad;
    return new Promise(function (res) {
      if (!st) { el.hidden = true; res(); return; }
      clearTimeout(st.t);
      st.t = setTimeout(function () { el.hidden = true; st.shown = 0; res(); }, st.shown ? Math.max(0, st.min - (Date.now() - st.shown)) : 0);
    });
  }

  /* 맨 끝에서 부른다 — 뒤에 선언한 문구 상수(NF_LABEL 등)가 init 때 아직 undefined 이지 않게 */
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { init(); }); else init();
  window.DS = { init: init, toast: toast, popup: popup, panel: panel, table: { removeRow: removeRow }, upload: upload, validate: vRun, stepper: { go: function (el, i) { var sp = closest(el, ".stepper") || el; return spGo(sp, i, "api"); } }, loading: { start: loadStart, stop: loadStop, DELAY: LOAD.delay, MIN: LOAD.min }, notify: { add: nfApiAdd, sync: function (el) { var h = closest(el, ".notify") || el; nfFilter(h); return nfSync(h); } }, version: "0.9" };
})();
