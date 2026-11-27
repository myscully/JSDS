import { useEffect, useLayoutEffect, type RefObject } from "react";

/* 표 행 방향키(2026-11-26) — 사이트 ds.js 의 rnSet · 키 처리와 같은 식.
   행이 roving tabindex 로 Tab 칸 하나가 된다. ↑↓ · Home · End · PageUp/Down(10행)으로 옮기고, Enter 는 행 펼침 버튼(없으면 행의 첫 링크)을, Space 는 행 체크박스를 누른다.
   키는 행 자체에 포커스가 있을 때만 받는다 — 칸 안 입력 · 버튼 · 열린 메뉴의 키는 가로채지 않는다. 비활성 · 빈 상태 · 상세 · 지우는 중인 행은 건너뛴다.
   지금 행 안의 조작 요소만 Tab 에 남고, 다른 행 안의 것은 tabindex -1(원래 값은 data-ds-rn 에 두었다가 그 행이 지금 행이 되면 되돌린다). */
export const ROW_NAV_PAGE = 10;
const INNER = "a[href],button,input,select,textarea,[tabindex]";

export function rowNavRows(t: HTMLTableElement): HTMLTableRowElement[] {
  const b = t.tBodies[0];
  if (!b) return [];
  return Array.from(b.rows).filter((r) => !r.hidden && !r.classList.contains("row-detail") && !r.classList.contains("ds-leaving") && !r.classList.contains("disabled") && r.getAttribute("aria-disabled") !== "true" && !r.querySelector(":scope > td.empty"));
}
function inner(tr: HTMLTableRowElement): HTMLElement[] {
  return Array.from(tr.querySelectorAll<HTMLElement>(INNER)).filter((el) => !(el as HTMLButtonElement).disabled);
}
/** 지금 행을 cur 로(없거나 고를 수 없으면 지금 Tab 칸인 행, 그것도 없으면 첫 행) */
export function rowNavSet(t: HTMLTableElement, cur?: HTMLTableRowElement | null): HTMLTableRowElement | null {
  const rows = rowNavRows(t);
  if (!rows.length) return null;
  const pick = cur && rows.includes(cur) ? cur : rows.find((r) => r.tabIndex === 0) || rows[0];
  for (const r of rows) {
    const on = r === pick;
    r.tabIndex = on ? 0 : -1;
    for (const el of inner(r)) {
      if (!el.hasAttribute("data-ds-rn")) el.setAttribute("data-ds-rn", el.getAttribute("tabindex") ?? "");
      const o = el.getAttribute("data-ds-rn");
      if (on) { if (o) el.setAttribute("tabindex", o); else el.removeAttribute("tabindex"); }
      else el.tabIndex = -1;
    }
  }
  return pick;
}
function onKey(t: HTMLTableElement, e: KeyboardEvent) {
  const tr = e.target as HTMLElement;
  if (tr.tagName !== "TR" || tr.closest("table") !== t || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const rows = rowNavRows(t), i = rows.indexOf(tr as HTMLTableRowElement);
  if (i < 0) return;
  const last = rows.length - 1;
  const to: Record<string, number> = { ArrowDown: Math.min(i + 1, last), ArrowUp: Math.max(i - 1, 0), Home: 0, End: last, PageDown: Math.min(i + ROW_NAV_PAGE, last), PageUp: Math.max(i - ROW_NAV_PAGE, 0) };
  if (e.key in to) { e.preventDefault(); const r = rows[to[e.key]]; rowNavSet(t, r); r.focus(); return; }
  if (e.key === "Enter") {
    const b = tr.querySelector<HTMLElement>(":scope > td.expand .expand-btn") || tr.querySelector<HTMLElement>("a[href]");
    if (b) { e.preventDefault(); b.click(); }
    return;
  }
  if (e.key === " ") {
    const c = tr.querySelector<HTMLInputElement>(":scope > td.check input");
    e.preventDefault();   // 행에서 Space 는 페이지를 내리지 않는다
    if (c && !c.disabled) c.click();
  }
}
/** on 이면 표의 행을 방향키로 옮긴다. 렌더마다 Tab 칸을 다시 맞춘다(행이 바뀌거나 지워져도) */
export function useRowNav(ref: RefObject<HTMLTableElement | null>, on: boolean | undefined): void {
  useLayoutEffect(() => { const t = ref.current; if (on && t) rowNavSet(t); });
  useEffect(() => {
    const t = ref.current;
    if (!on || !t) return;
    const key = (e: KeyboardEvent) => onKey(t, e);
    const focus = (e: FocusEvent) => { const tr = (e.target as HTMLElement).closest("tr"); if (tr && tr.closest("table") === t && rowNavRows(t).includes(tr)) rowNavSet(t, tr); };
    t.addEventListener("keydown", key);
    t.addEventListener("focusin", focus);
    return () => { t.removeEventListener("keydown", key); t.removeEventListener("focusin", focus); };
  }, [on, ref]);
}
