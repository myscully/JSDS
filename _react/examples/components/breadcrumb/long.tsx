import { Breadcrumb, BreadcrumbHome, BreadcrumbItem } from "@jiran/ds-react";

const POLICY = "본사 개발팀 외부 저장장치 · 클라우드 업로드 통합 차단 정책";
const PAGE = "예외 승인 요청 상세 — 2026-10-30 개발팀 김지란";

/* 220px 에서 말줄임 — 잘린 항목에만 Tooltip 이 붙는다 */
export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbHome href="#" />
      <BreadcrumbItem href="#">정책</BreadcrumbItem>
      <BreadcrumbItem href="#">{POLICY}</BreadcrumbItem>
      <BreadcrumbItem current>{PAGE}</BreadcrumbItem>
    </Breadcrumb>
  );
}
