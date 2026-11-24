import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuCheckboxItem } from "@jiran/ds-react";
import { useState } from "react";

export default function Example() {
  const [view, setView] = useState({ hidden: false, utc: true, refresh: true });
  const toggle = (k: keyof typeof view) => (on: boolean) => setView((v) => ({ ...v, [k]: on }));
  return (
    <Dropdown kind="menu" defaultOpen>
      <DropdownTrigger asChild>
        <Button variant="outline" color="assistive"><Icon name="eye" />보기</Button>
      </DropdownTrigger>
      <Menu label="보기">
        <MenuCheckboxItem value="hidden" checked={view.hidden} onCheckedChange={toggle("hidden")}>숨긴 이벤트 보기</MenuCheckboxItem>
        <MenuCheckboxItem value="utc" checked={view.utc} onCheckedChange={toggle("utc")}>시간을 UTC 로 보기</MenuCheckboxItem>
        <MenuCheckboxItem value="refresh" checked={view.refresh} onCheckedChange={toggle("refresh")}>자동 새로 고침</MenuCheckboxItem>
      </Menu>
    </Dropdown>
  );
}
