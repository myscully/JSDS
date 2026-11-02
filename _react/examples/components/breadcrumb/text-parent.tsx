import { Breadcrumb, BreadcrumbHome, BreadcrumbItem } from "@jiran/ds-react";

/* href 도 current 도 없는 항목은 페이지가 없는 상위 단계 — 링크 없이 텍스트로 */
export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbHome href="#" />
      <BreadcrumbItem>리포트</BreadcrumbItem>
      <BreadcrumbItem href="#">주간 리포트</BreadcrumbItem>
      <BreadcrumbItem current>2026년 10월 4주차</BreadcrumbItem>
    </Breadcrumb>
  );
}
