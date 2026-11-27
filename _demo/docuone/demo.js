/* demo.js — DocuONE 시안의 흉내 동작.
   메뉴 · 메뉴 라디오 · Tooltip · 사이드 내비 접기(1280 미만 자동) · 테마 전환 · 검색 단축키(/) · 명령 팔레트(⌘K · Ctrl+K) · 단축키 도움말(?) ·
   Toast · 새 항목 하이라이트는 ../../assets/ds.js 가 한다.
   여기에는 폴더 고르기 → Info 갱신, 검색 · Filter 로 폴더 거르기와 빈 상태, 팔레트 명령 처리, New draft, Info 패널 접기, 테마 저장만 둔다. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.addEventListener("click", (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });
  document.addEventListener("ds:theme", (e) => { const t = e.detail && e.detail.theme; try { if (t === "dark" || t === "light") localStorage.setItem("docu-theme", t); } catch (er) { } });

  /* 폴더 고르기 — 하나만. 고른 폴더의 값을 Info 의 Properties 에 */
  let folders = [];
  try { folders = JSON.parse($("#docu-folders").textContent); } catch (er) { }
  const grid = $(".docu-grid");
  const cards = () => $$(".docu-card", grid);
  const pick = (card) => {
    cards().forEach((c) => { const on = c === card; c.classList.toggle("on", on); c.setAttribute("aria-pressed", String(on)); });
    const f = folders.find((x) => x.id === card.dataset.folder); if (!f) return;
    ["name", "size", "created", "modified"].forEach((k) => { const td = $(`[data-prop="${k}"]`); if (td) td.textContent = f[k]; });
  };
  grid.addEventListener("click", (e) => { const c = e.target.closest(".docu-card"); if (c) pick(c); });

  /* 검색 · Filter 로 거르기 — 맞는 폴더가 없으면 빈 상태(무엇을 찾았는지 + 거름 풀기) */
  const input = $(".docu-toolbar .searchbar input"), empty = $(".docu-empty"), label = $(".docu-filter-label");
  let kind = "all";
  const apply = () => {
    const q = (input.value || "").trim().toLowerCase();
    let shown = 0;
    cards().forEach((c) => {
      const name = c.querySelector(".title").textContent.toLowerCase();
      const hit = (kind === "all" || c.dataset.kind === kind) && (!q || name.includes(q));
      c.hidden = !hit; if (hit) shown++;
    });
    empty.hidden = shown > 0;
    if (!shown) $(".docu-empty-title", empty).textContent = q ? `No folders match '${input.value.trim()}'` : "No folders in this filter";
  };
  document.addEventListener("ds:search", (e) => { if (e.target.closest(".docu-toolbar")) apply(); });
  input.addEventListener("input", () => { if (!input.value) apply(); });
  document.addEventListener("ds:menu-change", (e) => {
    if (!e.target.closest(".docu-filter") || e.detail.name !== "kind") return;
    kind = e.detail.value;
    const item = e.target.querySelector(`[data-value="${kind}"]`);
    label.textContent = kind === "all" ? "Filter" : item.textContent.trim();
    apply();
  });
  $("[data-docu-reset]").addEventListener("click", () => {
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    kind = "all"; label.textContent = "Filter";
    $$('.docu-filter [role="menuitemradio"]').forEach((r) => r.setAttribute("aria-checked", String(r.dataset.value === "all")));
    apply(); input.focus();
  });

  /* New draft — 맨 앞에 새 폴더를 넣고 고르며 잠깐 하이라이트, 되돌리기는 Toast 의 Undo */
  let drafts = 0;
  const newDraft = () => {
    const id = `draft-${++drafts}`, name = drafts === 1 ? "Untitled draft" : `Untitled draft ${drafts}`;
    const today = new Date(), d = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
    folders.push({ id, kind: "notes", name, size: "0 KB", created: d, modified: d });
    const prev = $(".docu-card.on", grid);
    const tpl = cards().find((c) => c.dataset.folder === "ux");
    const card = tpl.cloneNode(true);
    card.dataset.folder = id; card.dataset.kind = "notes"; card.hidden = false;
    card.querySelector(".title").textContent = name;
    card.querySelector(".desc").textContent = "0 notes";
    card.querySelector(".docu-size").textContent = "0 KB";
    grid.prepend(card); pick(card); apply();
    if (card.hidden) $("[data-docu-reset]").click();
    card.scrollIntoView({ block: "nearest" });
    if (window.DS) {
      DS.flash(card, { announce: `${name} added` });
      DS.toast(`${name} created`, { action: { label: "Undo", onClick: () => { const back = prev && prev.isConnected ? prev : cards().find((c) => c !== card); card.remove(); if (back) pick(back); apply(); } } });
    }
  };
  $(".page-head .btn.primary").addEventListener("click", newDraft);

  /* Info 패널 접기 */
  const info = $("#docu-info"), toggle = $(".docu-info-toggle");
  const toggleInfo = () => {
    const collapsed = info.classList.toggle("collapsed");
    const l = collapsed ? "Expand info" : "Collapse info";
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", l);
    const tipEl = toggle.parentElement.querySelector(".tooltip"); if (tipEl) tipEl.textContent = l;
  };
  if (info && toggle) toggle.addEventListener("click", toggleInfo);

  /* 명령 팔레트 — ds.js 가 닫고 포커스를 돌려준 뒤 ds:command 를 낸다 */
  document.addEventListener("ds:command", (e) => {
    const v = e.detail.value || "";
    if (v.startsWith("folder:")) {
      const c = cards().find((x) => x.dataset.folder === v.slice(7)); if (!c) return;
      if (c.hidden) $("[data-docu-reset]").click();
      pick(c); c.scrollIntoView({ block: "nearest" }); c.focus();
      if (window.DS) DS.flash(c, { announce: false });
    } else if (v === "new-draft") newDraft();
    else if (v === "toggle-info") toggleInfo();
    else if (v === "focus-search") { input.focus(); input.select(); }
    else if (v === "show-shortcuts") { if (window.DS) setTimeout(() => DS.popup.open("#docu-help"), 0); }
    else if (window.DS) DS.toast(`${e.detail.label} isn't part of this demo`);
  });
})();
