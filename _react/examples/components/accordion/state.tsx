import { Accordion } from "@jiran/ds-react";

/* Hover 는 마우스를 올리면 CSS 가 그린다 — 사이트 예제의 고정 Hover(data-state)는 문서 전용이라 여기에는 없다 */
export default function Example() {
  return (
    <>
      <Accordion title="Collapsed" style={{ maxWidth: 560 }}>펼친 내용</Accordion>
      <Accordion title="Expanded" defaultOpen style={{ maxWidth: 560 }}>펼친 내용입니다.</Accordion>
      <Accordion title="Hover" style={{ maxWidth: 560 }}>펼친 내용</Accordion>
      <Accordion title="Disabled" extra="권한 필요" disabled style={{ maxWidth: 560 }}>관리자 권한이 있어야 열람할 수 있습니다.</Accordion>
    </>
  );
}
