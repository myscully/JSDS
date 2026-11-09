import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuItem, MenuSep } from "@jiran/ds-react";

export default function Example() {
  return (
    <Dropdown kind="menu" keepMounted>
      <DropdownTrigger asChild>
        <Button variant="outline" color="assistive" iconOnly aria-label="더 보기"><Icon name="dots" /></Button>
      </DropdownTrigger>
      <Menu>
        <MenuItem href="#">정책 상세</MenuItem>
        <MenuItem href="#">감사 로그</MenuItem>
        <MenuItem onSelect={() => {}}>복제</MenuItem>
        <MenuSep />
        <MenuItem danger onSelect={() => {}}>삭제</MenuItem>
      </Menu>
    </Dropdown>
  );
}
