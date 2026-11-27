import { useLayoutEffect, useRef, type RefObject } from "react";
import { announce } from "./copy";

/* 내용 변화 모션(2026-11-26) — 사이트 ds.js 의 swap · flash · dismiss 와 같은 식.
   swapIn: 탭 · 단계 · 행 펼침 패널을 바꿀 때 새 패널이 흐림에서 나타난다(.ds-swap, 자기 animationend 에 뗌). 처음 그릴 때는 부르지 않는다.
   flash: 새로 들어온 항목이 brand subtle 면에서 --motion-flash 동안 한 번 흐려진다(.ds-new, 그 뒤 뗌). 줄인 모션이면 CSS 가 흐려지지 않는 면을 같은 시간 둔다.
   leaveInPlace: 지운 요소의 사본을 그 자리에 두고 --motion-exit 로 흐린 뒤 지운다(.ds-leaving · inert · aria-hidden · id 없음). 줄인 모션이면 아무것도 하지 않는다. */
const cssMs = (name: string) => (typeof document === "undefined" ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0);
const reduced = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function swapIn(el: Element | null | undefined): void {
  if (!el) return;
  el.classList.remove("ds-swap");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("ds-swap");
  const off = (e: Event) => { if (e.target !== el) return; el.classList.remove("ds-swap"); el.removeEventListener("animationend", off); };
  el.addEventListener("animationend", off);
}

/** shown 이 false → true 로 바뀔 때만(처음 그림 제외) 그 요소를 흐림에서 나타나게 한다 */
export function useSwapIn(ref: RefObject<Element | null>, shown: boolean): void {
  const prev = useRef(shown);
  useLayoutEffect(() => {
    if (shown && !prev.current) swapIn(ref.current);
    prev.current = shown;
  }, [shown, ref]);
}

const flashTimers = new WeakMap<Element, number>();
export const FLASH_SAY = "새 항목 {n}개";
export interface FlashOptions {
  /** 숨긴 알림 영역에 알릴 문구. 기본 '새 항목 {n}개', false 면 알리지 않음(따로 알리는 곳 — 알림 센터) */
  announce?: string | false;
}
/** 새로 들어온 항목을 옅은 brand 면에서 한 번 흐리게 하고 '새 항목 n개' 를 한 번 알린다(--motion-flash, 알림은 2026-11-27). 표 행이면 칸에 칠한다. 줄인 모션이면 흐려지지 않는 면이 같은 시간 머문다. 사이트 `DS.flash` 와 같다. */
export function flash(nodes: Array<Element | null | undefined> | Element | null | undefined, opts: FlashOptions = {}): void {
  if (typeof window === "undefined") return;
  const ms = cssMs("--motion-flash") || 1600;
  const list = ([] as Array<Element | null | undefined>).concat(nodes).filter((n): n is Element => !!n);
  if (list.length && opts.announce !== false) announce((opts.announce ?? FLASH_SAY).replace("{n}", String(list.length)));
  for (const n of list) {
    window.clearTimeout(flashTimers.get(n));
    n.classList.remove("ds-new");
    void (n as HTMLElement).offsetWidth;
    n.classList.add("ds-new");
    flashTimers.set(n, window.setTimeout(() => n.classList.remove("ds-new"), ms + 60));
  }
}

export function leaveInPlace(source: HTMLElement, insert: (copy: HTMLElement) => void): void {
  const ms = cssMs("--motion-exit");
  if (!ms || reduced()) return;
  const copy = source.cloneNode(true) as HTMLElement;
  for (const e of [copy, ...Array.from(copy.querySelectorAll("*"))]) ["id", "for", "name", "aria-controls", "aria-labelledby", "aria-describedby"].forEach((a) => e.removeAttribute(a));
  copy.classList.add("ds-leaving");
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  copy.style.animation = "ds-out var(--motion-exit) forwards";
  insert(copy);
  const gone = () => copy.remove();
  copy.addEventListener("animationend", (e) => { if (e.target === copy) gone(); });
  window.setTimeout(gone, ms + 60);
}

/** 들어오는 중(팝오버 scale .98 · translate — 2026-11-27)인 요소의 쉬는 자리 상자. 도는 애니메이션을 끝으로 옮겨 재고 되돌린다. 사이트 ds.js restRect 와 같다 */
export function restRect(el: Element): DOMRect {
  const as = typeof el.getAnimations === "function" ? el.getAnimations().filter((a) => a.playState === "running" && a.effect) : [];
  if (!as.length) return el.getBoundingClientRect();
  const t = as.map((a) => a.currentTime);
  for (const a of as) a.currentTime = a.effect!.getComputedTiming().endTime as number;
  const r = el.getBoundingClientRect();
  as.forEach((a, i) => { a.currentTime = t[i]; });
  return r;
}
