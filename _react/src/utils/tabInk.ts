import { useLayoutEffect, useEffect, type RefObject } from "react";

/** 고른 탭으로 밑줄(pill 은 면)을 옮긴다(2026-11-26) — 사이트 ds.js inkSync 와 같은 계산.
 *  처음 그릴 때는 전환 없이(data-ink-ready 를 두 프레임 뒤에 단다). 숨었다 보이는 줄은 display:none 에서 나와 전환이 일어나지 않는다. */
export function syncInk(bar: HTMLElement) {
  const br = bar.getBoundingClientRect();
  if (!bar.hasAttribute("data-ink")) bar.setAttribute("data-ink", "");
  if (!br.width) { bar.toggleAttribute("data-ink-ready", false); return; }   // hidden row: measure when shown, without sliding
  const on = Array.from(bar.querySelectorAll<HTMLElement>(".tab.on")).find((t) => t.closest(".tabs") === bar);
  const st = bar.style;
  if (!on) { st.setProperty("--tab-w", "0px"); st.setProperty("--tab-s", "0"); }
  else {
    const r = on.getBoundingClientRect();
    const k = bar.offsetWidth ? br.width / bar.offsetWidth : 1;   // 조상이 커지는 중(팝오버 scale .98)이어도 맞게 화면 배율을 나눈다(2026-11-27)
    st.setProperty("--tab-x", `${(r.left - br.left) / k - bar.clientLeft + bar.scrollLeft}px`);
    st.setProperty("--tab-w", `${r.width / k}px`);
    st.setProperty("--tab-s", String(r.width / k));   // 선은 1px 를 이만큼 늘린다(scale — 2026-11-27), pill 면은 --tab-w
    st.setProperty("--tab-y", `${(r.top - br.top) / k - bar.clientTop}px`);
    st.setProperty("--tab-h", `${r.height / k}px`);
  }
  const b = bar as HTMLElement & { _dsInkWait?: boolean };
  if (!bar.hasAttribute("data-ink-ready") && !b._dsInkWait && typeof requestAnimationFrame === "function") {
    b._dsInkWait = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { b._dsInkWait = false; bar.setAttribute("data-ink-ready", ""); }));
  }
}

/** TabList · 알림 센터 탭 줄이 쓴다. key 가 바뀌면(고른 탭) 다시 잰다. 크기가 바뀌어도 따라간다. */
export function useTabInk(ref: RefObject<HTMLElement | null>, key: unknown) {
  useLayoutEffect(() => { if (ref.current) syncInk(ref.current); }, [ref, key]);
  useEffect(() => {
    const bar = ref.current;
    if (!bar || typeof ResizeObserver !== "function") return;
    const ro = new ResizeObserver(() => syncInk(bar));
    ro.observe(bar);
    bar.querySelectorAll(".tab").forEach((t) => ro.observe(t));
    return () => ro.disconnect();
  }, [ref]);
}
