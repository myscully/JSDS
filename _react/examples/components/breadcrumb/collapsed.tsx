import { useEffect, useRef, useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbMore, Icon } from "@jiran/ds-react";

const HIDDEN = ["정책", "USB 제어"];

export default function Example() {
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  /* … 버튼이 사라지므로 펼친 첫 링크로 포커스를 옮긴다 — 안 옮기면 키보드 사용자가 위치를 잃는다 */
  useEffect(() => {
    if (open) nav.current?.querySelector<HTMLAnchorElement>("li:nth-child(2) a")?.focus();
  }, [open]);
  return (
    <Breadcrumb ref={nav}>
      <BreadcrumbItem href="#" linkProps={{ className: "icon", "aria-label": "홈" }}><Icon name="home" /></BreadcrumbItem>
      {open
        ? HIDDEN.map((t) => <BreadcrumbItem key={t} href="#">{t}</BreadcrumbItem>)
        : <BreadcrumbMore onClick={() => setOpen(true)} />}
      <BreadcrumbItem href="#">PC-2041</BreadcrumbItem>
      <BreadcrumbItem current>이벤트 #48213</BreadcrumbItem>
    </Breadcrumb>
  );
}
