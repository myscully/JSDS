import { Breadcrumb, BreadcrumbItem, BreadcrumbMore, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="#"><Icon name="home" /></BreadcrumbItem>
      <BreadcrumbMore onClick={() => {}} />
      <BreadcrumbItem href="#">PC-2041</BreadcrumbItem>
      <BreadcrumbItem current>이벤트 #48213</BreadcrumbItem>
    </Breadcrumb>
  );
}
