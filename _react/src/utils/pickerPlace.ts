import { useEffect, useRef, type RefObject } from "react";

/* Date Picker 달력 · Time Picker 열 목록의 자리 — 사이트 ds.js 의 pickerSpot · pickerHidden · followPickers 와 같은 규칙(사람의 요청 2026-11-17 — 팝업 안에서 잘렸다).
   넘침을 자르는 영역(팝업 · 패널 본문 · 표) 안이면 화면 기준(.float)으로 띄운다. 화면 기준으로 뜬 조상(달력 안의 시각 칸)을 만나면 거기서 멈춘다.
   아래 자리가 모자라고 위가 더 넓으면 위로, 오른쪽으로 넘치면 왼쪽으로 당긴다. 띄운 목록은 바깥이 스크롤되면 필드를 따라가고, 필드가 자르는 영역 밖으로 나가면 닫는다 */
function clip(el: Element, each: (p: Element) => boolean) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const c = getComputedStyle(p);
    if (c.position === "fixed") return false;
    if (/auto|scroll|hidden|clip/.test(c.overflowX + c.overflowY) && each(p)) return true;
  }
  return false;
}
const anchorOf = (host: HTMLElement) => host.querySelector<HTMLElement>(":scope > .affix") ?? host;

export interface PickerSpot { up: boolean; float: boolean; top: number; left: number }
/** 목록의 자리 — float 이면 top · left 는 화면 좌표, 아니면 피커 상자 기준. up0 을 주면 방향을 바꾸지 않는다 */
export function pickerSpot(host: HTMLElement, panel: HTMLElement, up0?: boolean | null): PickerSpot {
  const hr = host.getBoundingClientRect(), r = anchorOf(host).getBoundingClientRect(), h = panel.offsetHeight, w = panel.offsetWidth, gap = 4;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = up0 ?? (below < h && above > below);
  const float = clip(host, () => true), top = up ? r.top - gap - h : r.bottom + gap, left = Math.max(8, Math.min(hr.left, vw - 8 - w));
  return { up, float, top: float ? top : top - hr.top, left: float ? left : left - hr.left };
}
/** 필드가 화면 · 자르는 영역 밖으로 나갔는지 */
export function pickerHidden(host: HTMLElement) {
  const r = anchorOf(host).getBoundingClientRect();
  if (r.bottom <= 0 || r.top >= window.innerHeight) return true;
  return clip(host, (p) => { const q = p.getBoundingClientRect(); return r.bottom <= q.top || r.top >= q.bottom || r.right <= q.left || r.left >= q.right; });
}
/** 띄운 목록을 따라가게 한다 — 바깥 스크롤 · 창 크기 변경마다 move(방향 유지로 다시 잼), 필드가 가려지면 hide. 목록 자신의 스크롤은 그대로 */
export function usePickerFollow(active: boolean, host: RefObject<HTMLElement | null>, panel: () => HTMLElement | null | undefined, move: () => void, hide: () => void) {
  const latest = useRef({ panel, move, hide });
  latest.current = { panel, move, hide };
  useEffect(() => {
    if (!active) return;
    const on = (e: Event) => {
      const el = host.current; if (!el) return;
      const p = latest.current.panel();
      if (e.type === "scroll" && e.target instanceof Node && p?.contains(e.target)) return;
      if (pickerHidden(el)) latest.current.hide(); else latest.current.move();
    };
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on, true); window.removeEventListener("resize", on); };
  }, [active, host]);
}
