/* 오버레이가 나가는 모습(2026-11-20) — 사이트 ds.js 의 ghostOut 과 같은 식.
   닫힌 오버레이는 그 자리에서 바로 지우고(포커스 · 상태 · 선택자는 그대로), 같은 모양의 사본이 --motion-fast 로 흐려진 뒤 지워진다.
   사본은 aria-hidden · inert · id · role 없음이라 보조기기 · 키보드 · 선택자에 걸리지 않는다. 줄인 모션이면 만들지 않는다. */
const STRIP = ["id", "role", "name", "for", "tabindex", "aria-modal", "aria-labelledby", "aria-describedby", "aria-controls", "aria-live"];

export function ghostOut(nodes: Array<Element | null | undefined>): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion-fast")) || 0;
  if (!ms || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  const wrap = document.createElement("div");
  wrap.className = "ds-ghost";
  wrap.setAttribute("aria-hidden", "true");
  wrap.inert = true;
  for (const n of nodes) {
    if (!(n instanceof HTMLElement)) continue;
    const r = n.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    const c = n.cloneNode(true) as HTMLElement;
    for (const e of [c, ...Array.from(c.querySelectorAll("*"))]) {
      STRIP.forEach((a) => e.removeAttribute(a));
      Array.from(e.attributes).forEach((a) => { if (a.name.startsWith("data-ds")) e.removeAttribute(a.name); });
    }
    if (getComputedStyle(n).position !== "fixed") Object.assign(c.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", margin: "0" });
    wrap.appendChild(c);
  }
  if (!wrap.children.length) return;
  document.body.appendChild(wrap);
  window.setTimeout(() => wrap.remove(), ms + 40);
}
