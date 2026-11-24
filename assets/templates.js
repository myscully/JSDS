/* =========================================================
   templates.src.js — Templates 화면의 흉내 동작(→ assets/templates.js, 화면 HTML 만 싣는다)
   컴포넌트 동작은 assets/ds.js 가 한다. 여기에는 제품이 할 일을 둘러보기용으로 흉내 낸 것만 둔다(사람의 결정 2026-11-18 — 검토 도구 막대는 뺌):
   로그인 → 2단계 인증 → 대시보드, 대화상자 폼 제출 → 닫고 Toast, 조직도에서 부서를 고르면 오른쪽이 바뀜, 배포 처리 중 응답과 완료 Toast. 1280 미만 내비 접기는 ds.js 가 한다(2026-11-19).
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m) => window.DS && window.DS.toast(m);

  /* 검토용 링크 — href="#" 는 이동하지 않는다 */
  document.addEventListener("click", (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });

  /* 제출 — 검증에 막힌 제출은 ds.js 가 캡처에서 멈추므로 여기에는 통과한 폼만 온다 */
  document.addEventListener("submit", (e) => {
    const f = e.target; e.preventDefault();
    if (f.id === "tpl-login") { f.hidden = true; const o = $("#tpl-otp"); o.hidden = false; const c = $(".code-cell", o); if (c) c.focus(); return; }
    if (f.id === "tpl-otp") { location.href = "dashboard.html"; return; }
    if (f.closest(".popup")) { window.DS.popup.close(); if (f.dataset.done) toast(f.dataset.done); }
  });
  /* 폼 없는 대화상자의 주 버튼(이동 · 삭제) */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".popup button[data-done]"); if (!b) return;
    window.DS.popup.close(); toast(b.dataset.done);
  });

  /* 정책 배포 마법사 — 완료 */
  document.addEventListener("ds:step-finish", (e) => setTimeout(() => { if (e.detail && e.detail.resolve) e.detail.resolve(); toast("정책 배포를 예약했습니다."); }, 600));

  /* 조직도 — 부서를 고르면 오른쪽 정보 · 구성원과 대화상자의 부서 이름이 바뀐다 */
  const dataEl = $("#tpl-org-data");
  if (dataEl) {
    const D = JSON.parse(dataEl.textContent);
    document.addEventListener("ds:tree-select", (e) => {
      const tree = e.target.closest && e.target.closest('[role="tree"]');
      if (!tree || tree.getAttribute("aria-label") !== "조직도") return;
      const d = D[e.detail && e.detail.value]; if (!d) return;
      for (const k of ["name", "path", "lead", "count", "code", "scope"]) $$(`[data-org="${k}"]`).forEach((x) => { x.textContent = d[k]; });
      const tb = $('[data-org="members"]'); if (tb) { tb.innerHTML = d.rows; }
      const rn = $("#org-rename-name"); if (rn) rn.value = d.name;
    });
  }
})();
