import { Button } from "@jiran/ds-react";

/* data-state 는 사이트 전용 고정 상태(문서 예제용)다 — 제품 코드에서는 쓰지 않는다. Hover · Pressed 는 실제로는 CSS 가 처리한다 */
export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: 12 }}>
        <Button>Normal</Button>
        <Button variant="outline">Normal</Button>
        <Button color="assistive">Normal</Button>
        <Button variant="outline" color="assistive">Normal</Button>
        <Button data-state="hover">Hover</Button>
        <Button variant="outline" data-state="hover">Hover</Button>
        <Button color="assistive" data-state="hover">Hover</Button>
        <Button variant="outline" color="assistive" data-state="hover">Hover</Button>
        <Button data-state="pressed">Pressed</Button>
        <Button variant="outline" data-state="pressed">Pressed</Button>
        <Button color="assistive" data-state="pressed">Pressed</Button>
        <Button variant="outline" color="assistive" data-state="pressed">Pressed</Button>
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>Disabled</Button>
        <Button color="assistive" disabled>Disabled</Button>
        <Button variant="outline" color="assistive" disabled>Disabled</Button>
    </div>
  );
}
