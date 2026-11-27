import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { restRect } from "./motion";

/* 사이트 ds.js 의 placeMenu 와 같은 규칙 — 아래 자리가 모자라고 위가 더 넓으면 위로(.up),
   스크롤 영역 안이면 화면 기준으로 띄워(.float) 잘리지 않게 하고, 스크롤하면 닫는다(사람의 결정 2026-11-10) */
export function inClipper(el: Element) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const c = getComputedStyle(p);
    if (/auto|scroll|hidden|clip/.test(c.overflowX + c.overflowY)) return true;
  }
  return false;
}

export function useMenuPlacement(root: RefObject<HTMLElement | null>, anchor: string, open: boolean, close: () => void) {
  const [up, setUp] = useState(false);
  const [vars, setVars] = useState<Record<string, string> | null>(null);
  const latest = useRef(close);
  latest.current = close;
  useLayoutEffect(() => {
    if (!open) { setUp(false); setVars(null); return; }
    const menu = root.current?.querySelector<HTMLElement>(".menu");
    const a = root.current?.querySelector<HTMLElement>(anchor);
    if (!menu || !a) return;
    const r = a.getBoundingClientRect(), h = menu.offsetHeight, w = menu.offsetWidth, gap = 4;
    const below = window.innerHeight - r.bottom - gap, above = r.top - gap;
    const flip = below < h && above > below;
    setUp(flip);
    if (inClipper(root.current!)) {
      const x = Math.max(8, Math.min(restRect(menu).left, window.innerWidth - w - 8));
      setVars({ "--float-x": `${x}px`, "--float-y": `${flip ? r.top - gap - h : r.bottom + gap}px`, "--float-w": `${w}px` });
    }
  }, [open, root, anchor]);
  const floating = vars !== null;
  useEffect(() => {
    if (!open || !floating) return;
    const onMove = (e: Event) => {
      if (e.type === "scroll" && e.target instanceof Node && root.current?.querySelector(".menu")?.contains(e.target)) return;
      latest.current();
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, floating, root]);
  return { up, floating, vars: (vars ?? undefined) as CSSProperties | undefined };
}
