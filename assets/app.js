// 공용 스크립트(생성됨): 테마 · Accent(제품 컬러) 미리보기 · 검색 · 코드 복사/탭. 원본은 _build/app.src.js
const SEARCH_INDEX=[{"t":"Overview","s":"Home","g":"","u":"index.html"},{"t":"Getting started","s":"Home","g":"","u":"home/getting-started.html"},{"t":"About","s":"Home","g":"","u":"home/about.html"},{"t":"UX Principles","s":"Home","g":"","u":"home/principles.html"},{"t":"Overview","s":"Foundations","g":"","u":"foundations/overview.html"},{"t":"Colors","s":"Foundations","g":"Base material","u":"foundations/colors.html"},{"t":"Elevation","s":"Foundations","g":"Base material","u":"foundations/elevation.html"},{"t":"Grid","s":"Foundations","g":"Base material","u":"foundations/grid.html"},{"t":"Icons","s":"Foundations","g":"Base material","u":"foundations/icons.html"},{"t":"Typography","s":"Foundations","g":"Base material","u":"foundations/typography.html"},{"t":"Overview","s":"Components","g":"","u":"components/overview.html"},{"t":"Accordion","s":"Components","g":"","u":"components/accordion.html"},{"t":"Breadcrumb","s":"Components","g":"","u":"components/breadcrumb.html"},{"t":"Button","s":"Components","g":"","u":"components/button.html"},{"t":"Card","s":"Components","g":"","u":"components/card.html"},{"t":"Data Visual","s":"Components","g":"","u":"components/data-visual.html"},{"t":"Date Picker","s":"Components","g":"","u":"components/date-picker.html"},{"t":"Divider","s":"Components","g":"","u":"components/divider.html"},{"t":"Dropdown","s":"Components","g":"","u":"components/dropdown.html"},{"t":"Indicator","s":"Components","g":"","u":"components/indicator.html"},{"t":"Item Tile","s":"Components","g":"","u":"components/item-tile.html"},{"t":"List","s":"Components","g":"","u":"components/list.html"},{"t":"Loading","s":"Components","g":"","u":"components/loading.html"},{"t":"Navigation","s":"Components","g":"","u":"components/navigation.html"},{"t":"Notification","s":"Components","g":"","u":"components/notification.html"},{"t":"Pagination","s":"Components","g":"","u":"components/pagination.html"},{"t":"Popup","s":"Components","g":"","u":"components/popup.html"},{"t":"Checkbox","s":"Components","g":"Selection Controls","u":"components/checkbox.html"},{"t":"Chip","s":"Components","g":"Selection Controls","u":"components/chip.html"},{"t":"Radio Button","s":"Components","g":"Selection Controls","u":"components/radio-button.html"},{"t":"Select Button","s":"Components","g":"Selection Controls","u":"components/select-button.html"},{"t":"Search","s":"Components","g":"","u":"components/search.html"},{"t":"Select","s":"Components","g":"","u":"components/select.html"},{"t":"Slider","s":"Components","g":"","u":"components/slider.html"},{"t":"Switch","s":"Components","g":"","u":"components/switch.html"},{"t":"Tab","s":"Components","g":"","u":"components/tab.html"},{"t":"Data Table","s":"Components","g":"Table","u":"components/data-table.html"},{"t":"Table","s":"Components","g":"Table","u":"components/table.html"},{"t":"Tag","s":"Components","g":"","u":"components/tag.html"},{"t":"Text Field","s":"Components","g":"","u":"components/text-field.html"},{"t":"Tooltip","s":"Components","g":"","u":"components/tooltip.html"},{"t":"Top Navigation","s":"Components","g":"","u":"components/top-navigation.html"},{"t":"Overview","s":"Patterns","g":"","u":"patterns/overview.html"},{"t":"입력 폼","s":"Patterns","g":"Common UI","u":"patterns/input-form.html"},{"t":"약관 동의","s":"Patterns","g":"Common UI","u":"patterns/terms-agreement.html"},{"t":"빈 화면","s":"Patterns","g":"Common UI","u":"patterns/empty-state.html"},{"t":"유의사항","s":"Patterns","g":"Common UI","u":"patterns/notes.html"},{"t":"온보딩","s":"Patterns","g":"Service Pattern","u":"patterns/onboarding.html"},{"t":"검색","s":"Patterns","g":"Service Pattern","u":"patterns/search.html"},{"t":"시스템 상태","s":"Patterns","g":"Service Pattern","u":"patterns/system-status.html"},{"t":"대시보드","s":"Patterns","g":"Security Console","u":"patterns/dashboard.html"},{"t":"로그 뷰어","s":"Patterns","g":"Security Console","u":"patterns/log-viewer.html"},{"t":"정책 설정","s":"Patterns","g":"Security Console","u":"patterns/policy-settings.html"},{"t":"심각도 표시","s":"Patterns","g":"Security Console","u":"patterns/severity.html"},{"t":"React Package","s":"Resources","g":"","u":"resources/react.html"},{"t":"Design Token","s":"Resources","g":"","u":"resources/design-token.html"},{"t":"Figma Library","s":"Resources","g":"","u":"resources/figma.html"},{"t":"Token Download","s":"Resources","g":"","u":"resources/tokens.html"},{"t":"Changelog","s":"Resources","g":"","u":"resources/changelog.html"},{"t":"Contribution","s":"Resources","g":"","u":"resources/contribution.html"},{"t":"WBS","s":"Resources","g":"","u":"resources/wbs.html"}];
const PRODUCTS=[{"key":"product-a","name":"제품 A","hex":"#00AAB6","note":"제품 컬러로 교체"},{"key":"product-b","name":"제품 B","hex":"#C30D2A","note":"제품 컬러로 교체"},{"key":"product-c","name":"제품 C","hex":"#00AD7B","note":"제품 컬러로 교체"}];
const ROOT=document.body.dataset.root||'../';
/* 공용 런타임: 테마 · Accent(제품 컬러) 미리보기 · 검색 · 코드 복사/탭/접기
   - 생성 사이트: build.js 가 SEARCH_INDEX / PRODUCTS / ROOT 상수를 앞에 붙여 assets/app.js 로 기록
   - 미리보기(standalone): data.js 의 PRODUCTS 사용, 검색은 render.js 가 사이드바 필터로 처리 */
(function () {
  const root = document.documentElement;
  const products = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  const siteRoot = typeof ROOT !== "undefined" ? ROOT : "";

  /* Accent 스케일 */
  function hexToHsl(hex) { const n = parseInt(hex.slice(1), 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); switch (mx) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; } h /= 6; } return [h * 360, s * 100, l * 100]; }
  function hslToHex(h, s, l) { s /= 100; l /= 100; const k = n => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase(); }
  function accentScale(hex) { const [h, s, l6] = hexToHsl(hex); const up = t => l6 + (88 - l6) * t, dn = t => l6 * t; const L = { 50: 96, 100: 90, 200: 80, 300: up(.55), 400: up(.32), 500: up(.13), 700: dn(.78), 800: dn(.58), 900: dn(.38) }; const S = { 50: .7, 100: .7, 200: .7, 300: .8, 400: .85, 500: .9 }; const out = {}; for (const [k, l] of Object.entries(L)) out[k] = hslToHex(h, Math.min(100, s * (S[k] || 1)), Math.max(0, Math.min(100, l))); out[600] = hex.toUpperCase(); return out; }
  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  /* 제품 메인 컬러가 상태색과 헷갈리는지 — 색상환에서 danger 0 · warning 38 · success 160 · info 199 와 15도 미만이면 참.
     채도가 낮은 색은 애초에 상태색으로 읽히지 않으므로 뺀다. 겹치면 램프 자체를 NEUTRAL_RAMP 로 갈아끼워,
     --accent-* 를 참조하는 모든 것(버튼·링크·탭·체크박스·포커스 링·Atomic 램프)이 함께 중립으로 간다 */
  const STATUS_HUES = [0, 38, 160, 199];
  /* 중립 램프 — gray-* 와 같은 단계. accentScale("#0F172A") 로 만들면 중간 단계에 푸른 기가 남아 쓸 수 없다 */
  const NEUTRAL_RAMP = { 50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1", 400: "#94A3B8", 500: "#64748B", 600: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A" };
  function clashesWithStatus(hex) {
    const [h, sat] = hexToHsl(hex);
    if (sat < 20) return false;
    return STATUS_HUES.some(t => { const d = Math.abs(h - t) % 360; return Math.min(d, 360 - d) < 15; });
  }
  function applyAccent(key) {
    const p = products.find(x => x.key === key);
    if (!p) { /* 기본: CSS 토큰 값(--accent-*) 그대로 */ for (const k of STEPS) root.style.removeProperty("--accent-" + k); delete root.dataset.accent; delete root.dataset.accentNeutral; try { localStorage.removeItem("jsds-accent"); } catch (e) { } paintAccent(); return; }
    const neutral = clashesWithStatus(p.hex);
    const sc = neutral ? NEUTRAL_RAMP : accentScale(p.hex); for (const [k, v] of Object.entries(sc)) root.style.setProperty("--accent-" + k, v);
    root.dataset.accent = p.key;
    if (neutral) root.dataset.accentNeutral = ""; else delete root.dataset.accentNeutral; try { localStorage.setItem("jsds-accent", p.key); } catch (e) { }
    paintAccent();
  }
  window.applyAccent = applyAccent;

  /* 테마: 라이트 ↔ 다크 2단. 저장값이 없으면 시스템 설정을 따른다(아이콘 전환은 CSS 담당) */
  try { const t = localStorage.getItem("jsds-theme"); if (t === "dark" || t === "light") root.setAttribute("data-theme", t); } catch (e) { }
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") || (mql.matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("jsds-theme", next); } catch (e) { }
    markFaintSwatches();
  });
  mql.addEventListener("change", markFaintSwatches);

  /* Accent 팝오버 (팔레트 아이콘의 점이 현재 색) */
  const accentBtn = document.getElementById("accentBtn"), accentPop = document.getElementById("accentPop");
  function paintAccent() {
    const key = root.dataset.accent || "", p = products.find(x => x.key === key);
    const dot = accentBtn && accentBtn.querySelector(".dot"); if (dot) dot.style.background = p ? p.hex : "";
    if (accentPop) accentPop.querySelectorAll("[data-accent]").forEach(b => b.setAttribute("aria-checked", String(b.dataset.accent === key)));
    markFaintSwatches();
  }
  if (accentPop) {
    accentPop.innerHTML = '<button type="button" role="menuitemradio" aria-checked="false" data-accent=""><i style="background:var(--accent-600)"></i>기본 (토큰 값)</button>'
      + products.map(p => '<button type="button" role="menuitemradio" aria-checked="false" data-accent="' + p.key + '"><i style="background:' + p.hex + '"></i>' + p.name + "</button>").join("");
    /* stopPropagation 금지 — 바깥 클릭 닫기가 이 이벤트에 얹혀 있다 */
    accentPop.addEventListener("click", e => { const b = e.target.closest("[data-accent]"); if (b) { applyAccent(b.dataset.accent); closePop(accentBtn, accentPop); accentBtn.focus(); } });
  }
  /* 팝오버 밖의 [data-accent] 도 같은 동작 — Foundations › Colors 의 "이 컬러로 미리보기" 카드 버튼 */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-accent]");
    if (b && !(accentPop && accentPop.contains(b))) applyAccent(b.dataset.accent);
  });
  let saved = null; try { saved = localStorage.getItem("jsds-accent"); } catch (e) { }
  applyAccent(saved || "");

  /* 팝오버 공통 (검색 · Accent) */
  const q = document.getElementById("q"), box = document.getElementById("searchResults");
  const searchBtn = document.getElementById("searchBtn"), searchPop = document.getElementById("searchPop");
  const menuBtn = document.getElementById("menuBtn"), menuPop = document.getElementById("menuPop");
  const POPS = [[searchBtn, searchPop], [accentBtn, accentPop], [menuBtn, menuPop]].filter(x => x[0] && x[1]);
  const menuDim = document.getElementById("menuDim");
  /* ☰ 드로어: 우측 오프캔버스 2단계. 1단계는 대메뉴, 고르면 그 섹션의 하위 메뉴(2단계)로 넘어간다.
     하위 목록은 정적 사이트의 SEARCH_INDEX(= 전 페이지 색인) 또는 미리보기 셸의 SITE 로 만든다 — 현재 섹션뿐 아니라 모든 섹션을 보여 줄 수 있다. */
  const ICO = { back: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>' };
  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  /* 섹션 목록: 상단 메뉴에서 이름·링크·현재 여부를 가져온다(두 환경 공통) */
  function sections() {
    return [].slice.call(document.querySelectorAll(".topnav a")).map(a => {
      const c = a.cloneNode(true), n = c.querySelector(".n"); if (n) n.remove();   /* N 배지 글자가 섹션명에 섞이지 않게 */
      return { title: c.textContent.trim(), href: a.getAttribute("href"), on: a.classList.contains("active"), badge: !!a.querySelector(".n") };
    });
  }
  /* 섹션 제목 → 하위 항목 [{t, g, u}] */
  function pagesOf(title) {
    if (typeof SEARCH_INDEX !== "undefined") return SEARCH_INDEX.filter(i => i.s === title).map(i => ({ t: i.t, g: i.g, u: siteRoot + i.u }));
    if (typeof SITE !== "undefined") {
      const key = Object.keys(SITE).find(k => SITE[k].title === title); if (!key) return [];
      const d = SITE[key], out = [];
      for (const k of Object.keys(d.pages || {})) out.push({ t: d.pages[k], g: "", u: "#/" + key + "/" + k });
      for (const [g, list] of (d.groups || [])) for (const [k, t] of list) out.push({ t: t, g: g, u: "#/" + key + "/" + k });
      return out;
    }
    return [];
  }
  function drawerTop(back) {
    return '<div class="drawer-top">' +
      (back ? '<button class="hbtn" type="button" data-drawer-back aria-label="뒤로">' + ICO.back + "</button>" : '<span class="spacer"></span>') +
      '<span class="spacer"></span><button class="hbtn" type="button" data-drawer-close aria-label="닫기">' + ICO.close + "</button></div>";
  }
  /* title 이 없으면 1단계(대메뉴), 있으면 2단계(그 섹션 하위) */
  function renderDrawer(title) {
    if (!menuPop) return;
    let body;
    if (!title) {
      body = sections().map(s => '<button class="d-item' + (s.on ? " on" : "") + '" type="button" data-drawer-sec="' + esc(s.title) + '">' + esc(s.title) + (s.badge ? ' <span class="n">N</span>' : "") + "</button>").join("");
    } else {
      const here = location.pathname.split("/").pop() || "index.html", hash = location.hash;
      let g = null;
      body = "<h2>" + esc(title) + "</h2>" + pagesOf(title).map(p => {
        const head = p.g && p.g !== g ? (g = p.g, '<div class="d-group">' + esc(p.g) + "</div>") : (p.g ? "" : (g = null, ""));
        const on = p.u.indexOf("#/") === 0 ? p.u === hash : p.u.split("/").pop() === here;
        return head + '<a class="d-item' + (on ? " on" : "") + '" href="' + esc(p.u) + '">' + esc(p.t) + "</a>";
      }).join("");
    }
    menuPop.innerHTML = drawerTop(!!title) + '<div class="drawer-body">' + body + "</div>";
  }
  /* 화면 전환은 다음 틱에 — 지금 바로 innerHTML 을 갈아끼우면 클릭 대상이 DOM 에서 빠져
     문서 레벨 "바깥 클릭" 판정(closest)이 실패해 드로어가 닫혀 버린다. */
  function swap(title, focusSel) {
    setTimeout(() => { renderDrawer(title); const f = menuPop.querySelector(focusSel); if (f) f.focus(); }, 0);
  }
  if (menuPop) menuPop.addEventListener("click", e => {
    const sec = e.target.closest("[data-drawer-sec]");
    if (sec) { swap(sec.dataset.drawerSec, ".drawer-body a,.drawer-body button"); return; }
    if (e.target.closest("[data-drawer-back]")) { swap(null, ".d-item"); return; }
    if (e.target.closest("[data-drawer-close]")) closePop(menuBtn, menuPop);
  });
  function closePop(btn, pop) {
    if (pop.hidden) return;
    pop.hidden = true; btn.setAttribute("aria-expanded", "false");
    if (pop === menuPop && menuDim) menuDim.hidden = true;
    /* 미리보기 셸에서 #q 는 사이드바 필터도 겸한다 — 닫을 때 비우고 알려야 필터가 걸린 채 굳지 않는다 */
    if (pop === searchPop && q && q.value) { q.value = ""; q.dispatchEvent(new Event("input", { bubbles: true })); }
    if (pop === searchPop && box) box.hidden = true;
  }
  function closeAll(except) { POPS.forEach(([b, p]) => { if (p !== except) closePop(b, p); }); }
  function openPop(btn, pop) { closeAll(pop); pop.hidden = false; btn.setAttribute("aria-expanded", "true"); if (pop === menuPop && menuDim) menuDim.hidden = false; }
  POPS.forEach(([btn, pop]) => btn.addEventListener("click", () => {
    if (!pop.hidden) { closePop(btn, pop); return; }
    if (pop === menuPop) renderDrawer(null);
    openPop(btn, pop);
    const f = pop === searchPop ? q : pop.querySelector("a,button,input");
    if (f) { f.focus(); if (f.select) f.select(); }
  }));
  /* 드로어는 링크를 눌러도 미리보기 셸에서는 페이지가 그대로라 수동으로 닫는다.
     창이 1200 이상으로 커지면 오버레이가 남지 않게 함께 닫는다. */
  if (menuBtn && menuPop) {
    window.addEventListener("hashchange", () => closePop(menuBtn, menuPop));
    window.addEventListener("resize", () => { if (window.innerWidth >= 1200) closePop(menuBtn, menuPop); });
  }
  document.addEventListener("click", e => { if (!e.target.closest(".hmenu,.drawer,.copy-helper")) closeAll(); if (!e.target.closest(".val-cell,.icon-tile,#valPop,.copy-helper")) closeValPop(); });
  document.addEventListener("focusin", e => { if (!e.target.closest(".hmenu,.drawer,.copy-helper")) closeAll(); if (!e.target.closest(".val-cell,.icon-tile,#valPop,.copy-helper")) closeValPop(); });
  window.addEventListener("hashchange", closeValPop);
  window.addEventListener("resize", closeValPop);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { const c = valAnchor; if (closeValPop()) { c.focus(); return; } const o = POPS.find(x => !x[1].hidden); if (o) { closePop(o[0], o[1]); o[0].focus(); } return; }
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && searchBtn && searchPop) { e.preventDefault(); openPop(searchBtn, searchPop); if (q) { q.focus(); q.select(); } }
  });

  /* 검색 결과 (생성 사이트 전용 — 미리보기 셸은 render.js 가 같은 #q 로 사이드바를 필터한다) */
  if (q && box && typeof SEARCH_INDEX !== "undefined") {
    const run = () => {
      const f = q.value.trim().toLowerCase(); if (!f) { box.hidden = true; return; }
      const hits = SEARCH_INDEX.filter(i => i.t.toLowerCase().includes(f) || i.g.toLowerCase().includes(f)).slice(0, 20);
      box.innerHTML = hits.length ? hits.map(i => '<a href="' + siteRoot + i.u + '"><span>' + i.t + "</span><small>" + i.s + (i.g ? " · " + i.g : "") + "</small></a>").join("") : '<div class="empty">검색 결과가 없습니다.</div>';
      box.hidden = false;
    };
    q.addEventListener("input", run); q.addEventListener("focus", run);
  }

  /* 코드 패널: 복사 · 탭 · 접기 (이벤트 위임 — 해시 라우팅으로 DOM 이 다시 그려져도 유지) */
  function copyText(text) {
    /* Clipboard API 는 보안 컨텍스트·권한이 없으면 거부(reject)되므로 반드시 execCommand 로 폴백한다 */
    /* 임시 textarea 에 포커스가 가면 focusin 으로 열려 있던 팝오버가 닫히므로 .copy-helper 로 표시하고 포커스를 되돌린다 */
    const fallback = () => { const act = document.activeElement; const ta = document.createElement("textarea"); ta.className = "copy-helper"; ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { } ta.remove(); if (act && act.focus) act.focus(); };
    if (navigator.clipboard) return navigator.clipboard.writeText(text).catch(fallback);
    fallback(); return Promise.resolve();
  }
  document.addEventListener("click", e => {
    const copy = e.target.closest("[data-copy],[data-copy-text]");
    if (copy) {
      const text = copy.dataset.copyText !== undefined ? copy.dataset.copyText : ((document.getElementById(copy.dataset.copy) || {}).textContent || "");
      copyText(text);
      /* 아이콘 전용 버튼(.icon)은 글자를 바꾸면 SVG 가 지워지므로 .copied 로 피드백한다 */
      if (copy.tagName === "BUTTON" && !copy.classList.contains("icon")) { const label = copy.dataset.label || copy.textContent; copy.dataset.label = label; copy.textContent = "복사됨"; setTimeout(() => { copy.textContent = label; }, 1500); }
      else { copy.classList.add("copied"); setTimeout(() => copy.classList.remove("copied"), 1200); }
      return;
    }
    const tab = e.target.closest(".code-tabs [data-tab]");
    if (tab) {
      const ex = tab.closest(".example");
      ex.querySelectorAll(".code-tabs [data-tab]").forEach(b => { const on = b === tab; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
      ex.querySelectorAll("[data-pane]").forEach(p => { p.hidden = p.dataset.pane !== tab.dataset.tab; });
      const c = ex.querySelector(".example-actions [data-copy]"); if (c) c.dataset.copy = c.dataset.copy.replace(/-(html|react)$/, "-" + tab.dataset.tab);
      const code = ex.querySelector(".example-code"); if (code && code.hidden) toggle(ex);
      return;
    }
    const tog = e.target.closest("[data-toggle]");
    if (tog) { toggle(tog.closest(".example")); return; }
    /* 문서 안 탭 (Foundations: Semantic/Atomic · Normal/Spread) */
    const dt = e.target.closest(".doc-tabs [data-doctab]");
    if (dt) {
      const set = dt.closest(".doc-tabset");
      set.querySelectorAll(".doc-tabs [data-doctab]").forEach(b => { const on = b === dt; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
      set.querySelectorAll(":scope > [data-docpane]").forEach(p => { p.hidden = p.dataset.docpane !== dt.dataset.doctab; });
      return;
    }
    /* Icons: Outline / Filled 전환 (ds.js 가 .on 을 바꾸고, 여기서 갤러리를 필터) */
    const st = e.target.closest("#iconStyle [data-style]");
    if (st) { const grid = document.getElementById("iconGrid"); if (grid) { grid.classList.toggle("filled", st.dataset.style === "filled"); filterIcons(); } return; }
    /* Icons: 타일 클릭 → 상세 모달 */
    const tile = e.target.closest("#iconGrid .icon-tile");
    if (tile) { openIcon(tile); return; }
    /* Colors: Semantic 스와치 클릭 → 값 모달 */
    const cell = e.target.closest(".val-cell");
    if (cell) { openValue(cell); return; }
  });
  function toggle(ex) {
    const code = ex.querySelector(".example-code"), tog = ex.querySelector("[data-toggle]"); if (!code) return;
    code.hidden = !code.hidden; if (tog) { tog.textContent = code.hidden ? "코드 보기" : "코드 접기"; tog.setAttribute("aria-expanded", String(!code.hidden)); }
  }
  /* Icons 검색 + 스타일 필터 (Filled 탭은 Filled 버전이 없는 아이콘 제외) */
  function filterIcons() {
    const grid = document.getElementById("iconGrid"), q = document.getElementById("iconSearch"); if (!grid) return;
    const f = (q && q.value.trim().toLowerCase()) || "", filled = grid.classList.contains("filled"); let n = 0;
    grid.querySelectorAll(".icon-tile").forEach(t => { const hit = (!f || t.dataset.kw.includes(f)) && !(filled && t.classList.contains("no-f")); t.hidden = !hit; if (hit) n++; });
    const c = document.getElementById("iconCount"), em = document.getElementById("iconEmpty"); if (c) c.textContent = n + "개"; if (em) em.hidden = n > 0;
  }
  document.addEventListener("input", e => { if (e.target.id === "iconSearch") filterIcons(); });
  function openIcon(tile) {
    const grid = tile.closest("#iconGrid"), name = tile.dataset.name;
    const f = tile.querySelector(".f"), filled = grid.classList.contains("filled") && !!f;
    const style = filled ? "filled" : "outline", svg = (filled ? f : tile.querySelector(".o")).innerHTML;   /* 화면에 그려진 바로 그 SVG */
    const kws = [name, ...(tile.dataset.ko || "").split(/\s+/), ...(tile.dataset.tags || "").split("|"), tile.dataset.cat || ""]
      .map(t => t.trim()).filter((t, i, a) => t && a.indexOf(t) === i);
    const rows = [["Style", filled ? "Filled" : "Outline"], ["Category", tile.dataset.cat || "—"], ["Keyword", kws.join(" · ")]];
    if (!showValPop(tile, name, rows, svg, "icon", "SVG 복사")) return;
    document.getElementById("valPopIcon").innerHTML = svg;
    const dl = document.getElementById("valPopDl");
    dl.href = siteRoot + "assets/icons/" + style + "/" + name + ".svg"; dl.setAttribute("download", name + ".svg");
    grid.querySelectorAll(".icon-tile.on").forEach(t => t.classList.remove("on")); tile.classList.add("on");
  }

  /* Colors: 스와치 → 값 모달. 값은 빌드가 아니라 클릭 시점의 렌더 색에서 읽는다 —
     현재 테마와 헤더에서 고른 제품 컬러(--accent*)가 모두 반영된 최종 색이어야 하기 때문. */
  function openValue(cell) {
    const tok = "var(" + (cell.dataset.token || "") + ")";
    const rows = cell.dataset.kind === "shadow" ? [["Value", shadowOf(cell)], ["Token", tok]] : colorRows(cell, tok);
    showValPop(cell.querySelector(".bar") || cell, cell.dataset.label || "Value", rows, tok, "", "토큰 복사", cell);
  }
  /* 값 팝오버 공용 — 채우고, 누른 것 바로 아래에 두고, 연다. anchor 는 위치 기준, key 는 재클릭 토글 기준 */
  function showValPop(anchor, title, rows, copyText, kind, copyLabel, key) {
    const pop = document.getElementById("valPop"); if (!pop) return false;
    if (valAnchor === (key || anchor) && !pop.hidden) { closeValPop(); return false; }   /* 같은 것 재클릭 = 토글 */
    const esc = t => String(t).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
    pop.classList.toggle("kind-icon", kind === "icon");
    document.getElementById("valPopTitle").textContent = title;
    document.getElementById("valPopRows").innerHTML = rows.map(([k, v, dot]) =>
      '<div class="val-row"><b>' + k + "</b>" + (dot ? '<i style="background:' + esc(dot) + '"></i>' : "") + "<span>" + esc(v) + "</span></div>").join("");
    const btn = document.getElementById("valPopCopy");
    btn.dataset.copyText = copyText; btn.classList.remove("copied");
    btn.setAttribute("aria-label", copyLabel); btn.title = copyLabel;
    /* 위치: 숨김을 푼 뒤 같은 태스크에서 재므로 깜빡이지 않는다. offsetParent 기준이라 스크롤을 따라다닌다 */
    pop.hidden = false;
    const host = pop.offsetParent || document.body, hr = host.getBoundingClientRect(), br = anchor.getBoundingClientRect();
    const w = pop.offsetWidth, max = host.clientWidth - w - 16;
    pop.style.left = Math.max(16, Math.min(br.left - hr.left + br.width / 2 - w / 2, max)) + "px";
    pop.style.top = (br.bottom - hr.top + 8) + "px";
    valAnchor = key || anchor; pop.focus();   /* 버튼이 아니라 다이얼로그에 포커스 — 마우스로 열었을 때 버튼이 눌린 듯 보이지 않게. Tab 하면 복사 버튼 */
    return true;
  }
  /* 색: Semantic 은 .bar i 에, Atomic 은 버튼 자신에 색이 있다 */
  function colorRows(cell, tok) {
    const css = getComputedStyle(cell.querySelector(".bar i") || cell).backgroundColor, p = (css.match(/[\d.]+/g) || []).map(Number);
    const r = p[0] || 0, g = p[1] || 0, b = p[2] || 0, a = p.length > 3 ? p[3] : 1;
    const h2 = v => Math.round(v).toString(16).padStart(2, "0").toUpperCase();
    return [["Hex", "#" + h2(r) + h2(g) + h2(b) + (a < 1 ? h2(a * 255) : "")],      /* 알파가 있으면 8자리 */
      ["RGBA", [Math.round(r), Math.round(g), Math.round(b), Math.round(a * 100) / 100].join("/")],
      ["Token", tok, css]];
  }
  /* 그림자: box-shadow 계산값은 색을 앞으로 옮겨 적으므로, 토큰에 적힌 원문을 그대로 읽는다(아래 Style 표와 같은 표기).
     겹이 둘이면(Ambient + Key) 줄을 나눈다 — rgba(...) 안의 쉼표는 건너뛰고 최상위 쉼표로만 자른다 */
  function shadowOf(cell) {
    const v = getComputedStyle(root).getPropertyValue(cell.dataset.token || "").trim() || getComputedStyle(cell.querySelector("i") || cell).boxShadow;
    const out = []; let depth = 0, start = 0;
    for (let i = 0; i < v.length; i++) {
      const c = v[i];
      if (c === "(") depth++; else if (c === ")") depth--;
      else if (c === "," && depth === 0) { out.push(v.slice(start, i).trim()); start = i + 1; }
    }
    out.push(v.slice(start).trim());
    return out.join("\n");
  }
  let valAnchor = null;
  function closeValPop() {
    const pop = document.getElementById("valPop"); if (!pop || pop.hidden) return false;
    pop.hidden = true; valAnchor = null;
    document.querySelectorAll(".icon-tile.on").forEach(t => t.classList.remove("on"));   /* 팝오버가 닫혔는데 타일만 켜져 있으면 헷갈린다 */
    return true;
  }

  /* 오른쪽 페이지 목차(On this page) — 1600 이상에서만 CSS 로 보인다.
     본문 DOM 을 실제로 만들어야 하므로 이 파일에서 유일하게 라우트마다 다시 그린다.
     미리보기 셸은 render.js 가 hashchange 를 먼저 등록하므로, 아래 리스너는 #main 이 다시 그려진 뒤 실행된다. */
  let tocSpy = null;
  function buildToc() {
    const toc = document.getElementById("toc"), art = document.getElementById("content");
    if (!toc) return;
    if (tocSpy) { tocSpy.disconnect(); tocSpy = null; }
    /* 예제 미리보기 안의 제목(.page-head .title 등)은 섹션이 아니므로 제외 */
    const hs = art ? [].slice.call(art.querySelectorAll("h2[id], h3[id]")).filter(h => !h.closest(".example")) : [];
    if (hs.length < 2) { toc.innerHTML = ""; toc.hidden = true; return; }
    toc.innerHTML = '<h6>이 페이지</h6>' + hs.map(h =>
      '<a href="#' + h.id + '"' + (h.tagName === "H3" ? ' class="sub"' : "") + ">" + h.textContent.trim() + "</a>").join("");
    toc.hidden = false;
    const links = {}; toc.querySelectorAll("a").forEach(a => { links[a.getAttribute("href").slice(1)] = a; });
    const seen = new Set();
    const mark = () => {
      let cur = null;
      hs.forEach(h => { if (seen.has(h.id)) cur = h.id; });
      if (!cur) cur = hs[0].id;
      Object.keys(links).forEach(id => {
        links[id].classList.toggle("on", id === cur);
        if (id === cur) links[id].setAttribute("aria-current", "true"); else links[id].removeAttribute("aria-current");
      });
    };
    tocSpy = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting || e.boundingClientRect.top < 0) seen.add(e.target.id); else if (e.boundingClientRect.top > 0) seen.delete(e.target.id); });
      mark();
    }, { rootMargin: "-" + (64 + 16) + "px 0px -70% 0px" });
    hs.forEach(h => tocSpy.observe(h));
    mark();
  }
  buildToc();
  window.addEventListener("hashchange", buildToc);
  /* 미리보기 셸은 style.src.css 를 fetch 한 뒤 첫 render() 를 하므로 이 스크립트가 먼저 돌 수 있다.
     그때는 #content 가 아직 없으니 처음 생길 때 한 번만 다시 그린다(정적 사이트에서는 실행되지 않음). */
  if (document.getElementById("toc") && !document.getElementById("content")) {
    const mo = new MutationObserver(() => { if (document.getElementById("content")) { mo.disconnect(); buildToc(); } });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* 바탕과 거의 구분되지 않는 스와치(라이트의 흰색, 각 Subtle 틴트, 다크의 Surface 등)에 1px 라인을 둘러 형태가 보이게 한다.
     테마와 제품 컬러에 따라 달라지므로 빌드가 아니라 렌더 색을 재서 판단한다. Atomic 팔레트는 CSS 로 늘 라인을 두르고 있다 */
  function markFaintSwatches() {
    const bars = document.querySelectorAll(".sem-row:not(.checker) .bar:not(.line)");
    if (!bars.length) return;
    const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    const lum = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
    const rgb = el => (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || []).map(Number);
    const bg = rgb(document.body), bl = lum(bg);
    bars.forEach(bar => {
      const i = bar.querySelector("i"); if (!i) return;
      const c = rgb(i), a = c.length > 3 ? c[3] : 1;                       /* 알파가 있으면 바탕 위에 합성한 색으로 */
      const l = lum([0, 1, 2].map(k => a * c[k] + (1 - a) * bg[k]));
      bar.classList.toggle("faint", (Math.max(l, bl) + .05) / (Math.min(l, bl) + .05) < 1.4);
    });
  }
  window.addEventListener("hashchange", markFaintSwatches);   /* 미리보기 셸: #content 를 다시 그린 뒤 */

  /* 좌측 메뉴 스크롤 유지 — 정적 사이트는 페이지가 통째로 새로 로드돼 사이드바가 맨 위로 돌아간다.
     위치를 저장했다 복원하고, 저장값이 없으면(직접 링크·새 탭) 활성 항목이 보이도록 맞춘다.
     정적 페이지의 사이드바에는 id 가 없으므로 클래스로 찾는다(미리보기 셸과 공통). */
  const NAVPOS = "jsds-nav-scroll";
  const navBox = () => document.querySelector(".sidebar");
  function saveNavScroll() { const s = navBox(); if (!s) return; try { sessionStorage.setItem(NAVPOS, String(s.scrollTop)); } catch (e) { } }
  function restoreNavScroll() {
    const s = navBox(); if (!s) return;
    let saved = null;
    try { const v = sessionStorage.getItem(NAVPOS); if (v !== null) saved = parseFloat(v) || 0; } catch (e) { }
    if (saved !== null) s.scrollTop = saved;
    const a = s.querySelector(".nav a.active"); if (!a) return;
    const top = a.getBoundingClientRect().top - s.getBoundingClientRect().top + s.scrollTop;
    if (saved === null || top < s.scrollTop || top + a.offsetHeight > s.scrollTop + s.clientHeight)
      s.scrollTop = Math.max(0, top - (s.clientHeight - a.offsetHeight) / 2);
  }
  markFaintSwatches();
  restoreNavScroll();
  /* 저장은 클릭이 아니라 스크롤 시점에 — 메뉴를 내려둔 채 본문 링크로 이동해도 위치가 남는다 */
  const navScrollBox = navBox();
  if (navScrollBox) {
    let raf = 0;
    navScrollBox.addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; saveNavScroll(); }); }, { passive: true });
  }
  window.addEventListener("hashchange", restoreNavScroll); /* 미리보기 셸: buildNav 가 #nav 를 다시 그린 뒤 */
})();
