import { Breadcrumb, BreadcrumbHome, BreadcrumbItem, Button, PageHead } from "@jiran/ds-react";

/* 페이지 타이틀 바로 위 8px — 한 화면에 하나 */
export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <Breadcrumb>
        <BreadcrumbHome href="#" />
        <BreadcrumbItem href="#">정책</BreadcrumbItem>
        <BreadcrumbItem href="#">USB 제어</BreadcrumbItem>
        <BreadcrumbItem current>외부 저장장치 차단</BreadcrumbItem>
      </Breadcrumb>
      <PageHead
        title="외부 저장장치 차단"
        sub="POL-2041 · 전체 그룹"
        actions={<><Button variant="outline" color="assistive">취소</Button><Button>저장</Button></>}
      />
    </div>
  );
}
