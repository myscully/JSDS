import { Breadcrumb, BreadcrumbHome, BreadcrumbItem } from "@jiran/ds-react";

/* Hover 는 마우스를 올리면 CSS 가 그린다 — 사이트 예제의 고정 Hover(data-state)는 문서 전용이라 여기에는 없다 */
export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbHome href="#" />
      <BreadcrumbItem href="#">Normal</BreadcrumbItem>
      <BreadcrumbItem href="#">Hover</BreadcrumbItem>
      <BreadcrumbItem current>Current</BreadcrumbItem>
    </Breadcrumb>
  );
}
