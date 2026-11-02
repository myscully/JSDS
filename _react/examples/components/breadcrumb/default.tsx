import { Breadcrumb, BreadcrumbHome, BreadcrumbItem } from "@jiran/ds-react";

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbHome href="#" />
      <BreadcrumbItem href="#">정책</BreadcrumbItem>
      <BreadcrumbItem href="#">USB 제어</BreadcrumbItem>
      <BreadcrumbItem current>외부 저장장치 차단</BreadcrumbItem>
    </Breadcrumb>
  );
}
