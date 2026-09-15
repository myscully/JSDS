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
  function accentScale(hex) { const [h, s] = hexToHsl(hex); const L = { 50: 96, 100: 90, 200: 80, 300: 68, 400: 56, 500: 46, 700: 30, 800: 22, 900: 14 }; const out = {}; for (const [k, l] of Object.entries(L)) out[k] = hslToHex(h, Math.min(100, s * (k < 300 ? 0.7 : 1)), l); out[600] = hex.toUpperCase(); return out; }
  function applyAccent(key) {
    const p = products.find(x => x.key === key) || products[0]; if (!p) return;
    const sc = accentScale(p.hex); for (const [k, v] of Object.entries(sc)) root.style.setProperty("--accent-" + k, v);
    root.dataset.accent = p.key; try { localStorage.setItem("jsds-accent", p.key); } catch (e) { }
    const sel = document.getElementById("accentSel"); if (sel && sel.value !== p.key) sel.value = p.key;
  }
  window.applyAccent = applyAccent;

  /* 테마 */
  try { const t = localStorage.getItem("jsds-theme"); if (t) root.setAttribute("data-theme", t); } catch (e) { }
  const btn = document.getElementById("themeBtn");
  if (btn) btn.addEventListener("click", () => { const cur = root.getAttribute("data-theme"); const next = cur === "dark" ? "light" : cur === "light" ? "" : "dark"; if (next) root.setAttribute("data-theme", next); else root.removeAttribute("data-theme"); try { localStorage.setItem("jsds-theme", next); } catch (e) { } });

  /* Accent 선택 */
  const sel = document.getElementById("accentSel");
  if (sel) { sel.innerHTML = products.map(p => '<option value="' + p.key + '">' + p.name + "</option>").join(""); sel.addEventListener("change", e => applyAccent(e.target.value)); }
  let saved = null; try { saved = localStorage.getItem("jsds-accent"); } catch (e) { }
  applyAccent(saved || (products[0] && products[0].key));

  /* 검색 (생성 사이트) */
  const q = document.getElementById("q"); const box = document.getElementById("searchResults");
  if (q && box && typeof SEARCH_INDEX !== "undefined") {
    const run = () => {
      const f = q.value.trim().toLowerCase(); if (!f) { box.hidden = true; return; }
      const hits = SEARCH_INDEX.filter(i => i.t.toLowerCase().includes(f) || i.g.toLowerCase().includes(f)).slice(0, 20);
      box.innerHTML = hits.length ? hits.map(i => '<a href="' + siteRoot + i.u + '"><span>' + i.t + "</span><small>" + i.s + (i.g ? " · " + i.g : "") + "</small></a>").join("") : '<div class="empty">검색 결과가 없습니다.</div>';
      box.hidden = false;
    };
    q.addEventListener("input", run); q.addEventListener("focus", run);
    document.addEventListener("click", e => { if (!box.contains(e.target) && e.target !== q) box.hidden = true; });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { box.hidden = true; q.blur(); } });
  }
  if (q) document.addEventListener("keydown", e => { if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); } });

  /* 코드 패널: 복사 · 탭 · 접기 (이벤트 위임 — 해시 라우팅으로 DOM 이 다시 그려져도 유지) */
  function copyText(text) { if (navigator.clipboard) return navigator.clipboard.writeText(text); const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { } ta.remove(); return Promise.resolve(); }
  document.addEventListener("click", e => {
    const copy = e.target.closest("[data-copy],[data-copy-text]");
    if (copy) {
      const text = copy.dataset.copyText !== undefined ? copy.dataset.copyText : ((document.getElementById(copy.dataset.copy) || {}).textContent || "");
      copyText(text);
      if (copy.tagName === "BUTTON") { const label = copy.dataset.label || copy.textContent; copy.dataset.label = label; copy.textContent = "복사됨"; setTimeout(() => { copy.textContent = label; }, 1500); }
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
    const m = document.getElementById("iconModal"); if (!m) return;
    const grid = tile.closest("#iconGrid"), filled = grid.classList.contains("filled") && !!tile.dataset.copyF, name = tile.dataset.name;
    const style = filled ? "filled" : "outline", svg = filled ? tile.dataset.copyF : tile.dataset.copyO;
    document.getElementById("iconModalTitle").textContent = name;
    document.getElementById("iconModalStyle").textContent = filled ? "Filled" : "Outline";
    document.getElementById("iconModalCat").textContent = tile.dataset.cat || "";
    document.getElementById("iconModalPreview").innerHTML = svg;
    const kws = [name, ...(tile.dataset.ko || "").split(/\s+/), ...(tile.dataset.tags || "").split("|"), tile.dataset.cat || ""].map(s => s.trim()).filter((s, i, a) => s && a.indexOf(s) === i);
    document.getElementById("iconModalKw").innerHTML = kws.map(k => '<span class="tag sm">' + k.replace(/[<>&"]/g, ch => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch])) + "</span>").join("");
    document.getElementById("iconModalCode").textContent = '<!-- HTML: 인라인 SVG (아래 "SVG 복사") · 정적 파일 -->\n<img src="assets/icons/' + style + "/" + name + '.svg" width="24" height="24" alt="">\n\n// React\nimport { Icon } from "@jiran/ds-react";\n<Icon name="' + name + '"' + (filled ? " filled" : "") + " size={24} />\n\n// 사이트 소스\nI(\"" + name + "\"" + (filled ? ', 24, { style: "filled" }' : "") + ")";
    const dl = document.getElementById("iconModalDl"); dl.href = siteRoot + "assets/icons/" + style + "/" + name + ".svg"; dl.setAttribute("download", name + ".svg");
    document.getElementById("iconModalCopy").dataset.copyText = svg;
    grid.querySelectorAll(".icon-tile.on").forEach(t => t.classList.remove("on")); tile.classList.add("on");
    if (window.DS && window.DS.popup) window.DS.popup.open(m); else m.parentElement.hidden = false;
  }
})();
