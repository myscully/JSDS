/* 사이트 HTML 예제 ↔ React 렌더 결과를 "구조 스켈레톤"으로 비교하기 위한 유틸.
   비교 대상: 태그 이름 · 정렬된 클래스 · 상태 속성(role, aria-*, disabled, checked, open, type).
   무시: id · style · for · aria-describedby/labelledby/controls · href · 텍스트 · svg 내부 */
const STATE_ATTRS = ["role", "aria-selected", "aria-pressed", "aria-current", "aria-invalid", "aria-sort", "aria-expanded", "aria-disabled", "aria-modal", "aria-orientation", "aria-live"];

function attrs(el: Element): string {
  const out: string[] = [];
  for (const a of STATE_ATTRS) {
    const v = el.getAttribute(a);
    if (v !== null) out.push(`[${a}=${v}]`);
  }
  // input 의 type 만 비교 (button 의 type=button 은 React 가 항상 명시하므로 제외)
  if (el.tagName === "INPUT") out.push(`[type=${el.getAttribute("type") || "text"}]`);
  const anyEl = el as HTMLInputElement & HTMLDetailsElement;
  if ("disabled" in anyEl && anyEl.disabled) out.push("[disabled]");
  if (el.tagName === "INPUT" && (el as HTMLInputElement).checked) out.push("[checked]");
  if (el.tagName === "DETAILS" && anyEl.open) out.push("[open]");
  return out.join("");
}

function line(el: Element, depth: number): string {
  const cls = Array.from(el.classList).sort().map((c) => "." + c).join("");
  return `${"  ".repeat(depth)}${el.tagName.toLowerCase()}${cls}${attrs(el)}`;
}

export function skeleton(root: ParentNode, depth = 0): string[] {
  const lines: string[] = [];
  for (const el of Array.from(root.children)) {
    if (el.tagName.toLowerCase() === "svg") { lines.push(line(el, depth)); continue; }
    lines.push(line(el, depth));
    lines.push(...skeleton(el, depth + 1));
  }
  return lines;
}

export function skeletonOfHtml(html: string): string[] {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return skeleton(doc.body);
}
