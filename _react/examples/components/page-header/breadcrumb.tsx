import { Breadcrumb, BreadcrumbHome, BreadcrumbItem, Button, PageHead } from "@jiran/ds-react";

export default function Example() {
  return (
    <PageHead as="h2"
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbHome href="#" />
          <BreadcrumbItem href="#">정책</BreadcrumbItem>
          <BreadcrumbItem current>외부 USB 차단</BreadcrumbItem>
        </Breadcrumb>
      }
      title="외부 USB 차단"
      sub="POL-2041 · 전체 그룹"
      actions={<Button>배포</Button>}
    />
  );
}
