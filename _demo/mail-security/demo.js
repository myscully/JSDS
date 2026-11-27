/* demo.js — Mail Security Console 데모의 흉내 동작.
   컴포넌트 동작(검증 · 선택 · 펼침 · 정렬 · 메뉴 · Date Picker · 사이드 내비 접기 · 테마 전환)은 ../../assets/ds.js 가 한다.
   여기에는 제품 서버가 할 일을 둘러보기용으로 흉내 낸 것만 둔다. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, o) => window.DS && window.DS.toast(m, o);

  /* 둘러보기용 링크 — href="#" 는 이동하지 않는다 */
  document.addEventListener("click", (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });

  /* 테마 — ds.js 가 바꾼 테마를 저장한다(head 의 스크립트가 다음에 읽음) */
  document.addEventListener("ds:theme", (e) => { const t = e.detail && e.detail.theme; try { if (t === "dark" || t === "light") localStorage.setItem("msc-theme", t); } catch (er) { } });

  /* 대시보드 추이 차트 — 데이터 꼭지마다 속이 빈 원(지름 6 · 면은 카드 면 색 · 테두리 1.5 는 선 색).
     ds-chart 의 선 프리셋은 점을 hover 때만 그리고 칠할 때 점을 '선 색 면 + 면 색 링' 으로 둔다.
     그래서 그린 뒤 반지름을 주고 두 색을 맞바꾼다. 테마가 바뀌면 ds-chart 가 다시 칠하므로 그 뒤에 다시 바꾼다 */
  const trendCanvas = $('canvas[data-chart="timeseries"]');
  if (trendCanvas) {
    let tries = 0;
    const hollow = (repaint) => {
      const c = window.Chart && window.Chart.getChart(trendCanvas);
      if (!c) { if (tries++ < 50) setTimeout(hollow, 100); return; }
      c.data.datasets.forEach((ds) => {
        ds.pointRadius = 3; ds.pointBorderWidth = 1.5; ds.pointHoverRadius = 5;
        /* ds-chart 가 막 칠했으면 테두리 = 면 색 — 그때만 맞바꾼다(두 번 불려도 그대로) */
        if (ds.pointBorderColor !== ds._dsColor) {
          ds.pointBackgroundColor = ds.pointBorderColor; ds.pointBorderColor = ds._dsColor;
          ds.pointHoverBackgroundColor = ds.pointHoverBorderColor; ds.pointHoverBorderColor = ds._dsColor;
        }
      });
      /* 다시 칠한 뒤에는 기본 update — "none" 은 점의 옛 색을 그대로 둔다(Chart.js 가 점 옵션을 들고 있음, 실측) */
      c.update(repaint === true ? undefined : "none");
    };
    hollow();
    new MutationObserver(() => setTimeout(() => hollow(true), 0))
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });
  }

  /* 로그인 → 2단계 인증 → 대시보드. 검증에 막힌 제출은 ds.js 가 캡처에서 멈추므로 여기에는 통과한 폼만 온다 */
  document.addEventListener("submit", (e) => {
    const f = e.target; e.preventDefault();
    if (f.id === "msc-login") {
      const pw = $("#si-pw").value, fail = $("#msc-login-fail");
      if (pw.length < 4) { fail.hidden = false; $("#si-pw").focus(); return; }   /* 흉내: 4자 미만이면 실패 */
      fail.hidden = true;
      const acc = $("#msc-otp-account"); if (acc) acc.textContent = $("#si-email").value;
      f.hidden = true; const o = $("#msc-otp"); o.hidden = false; const c = $(".code-cell", o); if (c) c.focus(); return;
    }
    if (f.id === "msc-otp") { location.href = "dashboard.html"; }
  });

  /* 스팸 목록 — 액션 바 */
  const table = $(".msc-spam .tbl");
  if (!table) return;
  const checked = () => $$("tbody td.check input:checked", table).map((i) => i.closest("tr"));
  const total = $("#sp-total");
  const setStatus = (tr, tone, text) => { const c = $('[data-col="status"]', tr); if (c) c.innerHTML = `<span class="indicator ${tone}">${text}</span>`; };
  const clearSelection = () => {
    $$("tbody td.check input:checked", table).forEach((i) => { i.checked = false; i.dispatchEvent(new Event("change", { bubbles: true })); });
  };

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b || b.getAttribute("aria-disabled") === "true") return;
    const rows = checked(), n = rows.length;
    if (b.dataset.act === "release") { rows.forEach((tr) => setStatus(tr, "ok", "해제")); clearSelection(); toast(`메일 ${n}통을 받은편지함으로 돌려보냈습니다.`); return; }
    if (b.dataset.act === "block") {
      const senders = new Set(rows.map((tr) => ($(".cell-sub", tr) || {}).textContent));
      rows.forEach((tr) => setStatus(tr, "danger", "차단")); clearSelection();
      toast(`발신자 ${senders.size}곳을 차단 목록에 더했습니다.`); return;
    }
    if (b.dataset.act === "delete") { $("[data-del-count]").textContent = n; window.DS.popup.open("#sp-del"); return; }
    if (b.dataset.act === "delete-confirm") {
      window.DS.popup.close();
      rows.forEach((tr) => window.DS.table.removeRow(tr));
      if (total) total.textContent = String(Math.max(0, Number(total.textContent.replace(/,/g, "")) - n));
      clearSelection();
      toast(`메일 ${n}통을 영구 삭제했습니다.`);
    }
  });
})();
