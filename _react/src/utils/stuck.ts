import { useEffect, useState, type RefObject } from "react";

/* 긴 폼의 버튼 줄 고정(2026-11-26) — 사이트 ds.js stickWatch 와 같은 식. position:sticky 는 CSS(.sticky) 가 하고,
   붙어 있는 동안(스크롤 영역 아래 끝에 걸려 다 보이지 않음)만 true — .stuck 의 위 선을 보이는 데 쓴다. IntersectionObserver 가 없으면 늘 false */
function scrollRoot(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(p).overflowY)) return p;
  }
  return null;
}
export function useStuck(ref: RefObject<HTMLElement | null>, on: boolean | undefined): boolean {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!on || !el || typeof IntersectionObserver === "undefined") { setStuck(false); return; }
    // sticky 는 스크롤 영역의 아래 안쪽 여백 위에 붙는다 — 관찰 영역을 그 여백 + 1px 만큼 줄인다
    const root = scrollRoot(el), pad = root ? parseFloat(getComputedStyle(root).paddingBottom) || 0 : 0;
    const io = new IntersectionObserver((es) => {
      for (const en of es) { const rb = en.rootBounds; setStuck(!!rb && en.intersectionRatio < 1 && en.boundingClientRect.bottom >= rb.bottom - 1); }
    }, { root, rootMargin: `0px 0px -${Math.ceil(pad + 1)}px 0px`, threshold: [1] });
    io.observe(el);
    return () => io.disconnect();
  }, [on, ref]);
  return !!on && stuck;
}
