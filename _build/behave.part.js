/* 묶음(behave.*.js)의 덩어리 하나를 돌린다(2026-11-14).
   던지면(클릭이 닿지 않음 · 요소 없음 · 시간 초과 …) 그 덩어리의 실패 하나로 남기고 다음 덩어리로 간다.
   던진 채 두면 behave 전체가 멈춰(exit 2) 뒤의 묶음이 돌지 않고 결과도 나오지 않았다.
   그 덩어리의 나머지 단정은 돌지 않아 전체 수가 줄지만, 실패가 하나 이상이라 게이트는 막힌다.
   page 를 주면 던진 뒤 열린 것을 닫고(Esc) 포인터를 치운다 — 다음 덩어리가 앞의 상태에 걸리지 않게 */
module.exports = (ok, file, getPage) => async (label, fn) => {
  try { await fn(); }
  catch (e) {
    ok(`${file}: ${label} — threw; the rest of this part did not run`, false, String((e && e.message) || e).split("\n")[0].slice(0, 300));
    let p = null; try { p = getPage && getPage(); } catch { p = null; }
    if (p && !p.isClosed()) { await p.keyboard.press("Escape").catch(() => {}); await p.mouse.move(0, 0).catch(() => {}); }
  }
};
