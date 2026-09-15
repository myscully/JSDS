import { useEffect, useRef, type RefObject, type Ref, type RefCallback } from "react";

/** refs 바깥을 pointerdown 했을 때 콜백 */
export function useOutsideClick(refs: Array<RefObject<Element | null>>, onOutside: (e: PointerEvent) => void, enabled = true): void {
  const cb = useRef(onOutside);
  cb.current = onOutside;
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      for (const r of refs) if (r.current && r.current.contains(t)) return;
      cb.current(e);
    };
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...refs]);
}

/** Escape 키 */
export function useEscape(onEscape: (e: KeyboardEvent) => void, enabled = true): void {
  const cb = useRef(onEscape);
  cb.current = onEscape;
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current(e);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled]);
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),details>summary';

export function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null || el === document.activeElement);
}

/** 포커스 트랩: 활성화 시 첫 요소(또는 initial)로 포커스, Tab 순환, 비활성화 시 이전 포커스 복원 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, initial?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const prev = document.activeElement as HTMLElement | null;
    const target = initial?.current ?? focusables(root)[0] ?? root;
    if (!root.hasAttribute("tabindex") && target === root) root.setAttribute("tabindex", "-1");
    const t = window.setTimeout(() => target.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables(root);
      if (!list.length) { e.preventDefault(); root.focus(); return; }
      const first = list[0], last = list[list.length - 1];
      const cur = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (cur === first || !root.contains(cur))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (cur === last || !root.contains(cur))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [active, ref, initial]);
}

/** 여러 ref 를 하나로 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (value: T | null) => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === "function") r(value);
      else (r as { current: T | null }).current = value;
    }
  };
}

/** 마운트 이후에만 true (SSR 대비) */
export function useMounted(): boolean {
  const m = useRef(false);
  const [, force] = useStateSafe();
  useEffect(() => { m.current = true; force(); }, [force]);
  return m.current;
}
// 내부용 소형 setState (react import 최소화)
import { useState, useCallback } from "react";
function useStateSafe(): [number, () => void] {
  const [n, set] = useState(0);
  const bump = useCallback(() => set((x) => x + 1), []);
  return [n, bump];
}
