/* JSDS 메인 화면 시안 공통 동작(사이트 밖). 제품 색 적용 · 저장은 ../assets/app.js 의 applyAccent 와 [data-accent] 클릭이 맡는다 */
(function () {
  const root = document.documentElement, body = document.body;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(pointer: fine)").matches;
  window.CX = { REDUCE, FINE };
  /* 시안이 테마를 고정하면(A2 어두운 바탕) app.js 가 저장된 테마를 다시 칠한 뒤에 덮는다 — 저장값은 건드리지 않음 */
  if (body.dataset.forceTheme) root.setAttribute("data-theme", body.dataset.forceTheme);

  /* 제품 색 칩 — PRODUCTS(app.js) 에서 그린다 */
  const chips = document.querySelector("[data-cx-chips]");
  const list = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  const swatch = (p) => p.kind === "ai" ? "linear-gradient(135deg,var(--purple-40),var(--violet-45))" : p.kind === "neutral" ? "var(--cool-neutral-30)" : p.hex;
  if (chips) chips.insertAdjacentHTML("beforeend", list.map((p) =>
    `<button type="button" class="cx-chip" data-accent="${p.key}" aria-label="${p.name}" title="${p.name}"><i style="background:${swatch(p)}"></i></button>`).join(""));
  const sync = () => { const k = root.dataset.accent || "blue"; document.querySelectorAll(".cx-chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.accent === k))); };
  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-accent"] });

  /* 등장 순서 — data-i 가 없으면 문서 순서 */
  document.querySelectorAll(".cx-w,.rise").forEach((el, i) => { if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i); });
  document.querySelectorAll(".sh").forEach((el, i) => { if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i); });
  const start = () => requestAnimationFrame(() => document.querySelector(".cx-stage")?.classList.add("go"));
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);

  /* 패럴랙스 — 커서가 가운데에서 벗어난 만큼 --mx/--my(-1 ~ 1 의 40배), 도형마다 --z 로 깊이 */
  if (!REDUCE && FINE && body.dataset.parallax !== undefined) {
    let raf = 0, x = 0, y = 0;
    addEventListener("pointermove", (e) => {
      x = (e.clientX / innerWidth - 0.5) * -40; y = (e.clientY / innerHeight - 0.5) * -40;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty("--mx", x.toFixed(2)); root.style.setProperty("--my", y.toFixed(2)); });
    });
  }

  /* 단어에 올리면 짝 도형이 한 바퀴 — data-kick="도형 id" */
  document.querySelectorAll("[data-kick]").forEach((w) => w.addEventListener("pointerenter", () => {
    if (REDUCE) return;
    w.dataset.kick.split(" ").forEach((id) => { const s = document.getElementById(id); if (!s) return; s.classList.remove("kick"); void s.offsetWidth; s.classList.add("kick"); });
  }));
  document.addEventListener("animationend", (e) => { if (e.animationName === "cx-kick") e.target.classList.remove("kick"); });

  /* 도형을 누르면 다음 색 — 제품 색 도형은 다음 제품 색으로 */
  const PAL = ["--c-coral", "--c-amber", "--c-blue", "--c-green", "--c-purple", "--c-violet"];
  document.addEventListener("click", (e) => {
    const s = e.target.closest(".sh[data-cycle]"); if (!s) return;
    if (s.classList.contains("prod")) {
      const cur = list.findIndex((p) => p.key === (root.dataset.accent || "blue"));
      const next = list[(cur + 1) % list.length]; if (next && window.applyAccent) window.applyAccent(next.key);
    } else {
      const now = PAL.indexOf(s.dataset.c || ""), n = PAL[(now + 1) % PAL.length];
      s.dataset.c = n; s.style.setProperty("--c", `var(${n})`);
    }
    if (!REDUCE) { s.classList.remove("kick"); void s.offsetWidth; s.classList.add("kick"); }
  });
})();
