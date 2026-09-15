import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuItem, MenuLabel, MenuSep } from "@jiran/ds-react";

export default function Example() {
  return (
    <Dropdown kind="menu" align="end" defaultOpen>
      <DropdownTrigger asChild>
        <Button variant="secondary" icon aria-label="더 보기"><Icon name="dots" /></Button>
      </DropdownTrigger>
      <Menu>
        <MenuLabel>정책</MenuLabel>
        <MenuItem icon="pencil" hint="E" onSelect={() => {}}>편집</MenuItem>
        <MenuItem icon="download" onSelect={() => {}}>내보내기</MenuItem>
        <MenuSep />
        <MenuItem icon="trash" danger onSelect={() => {}}>삭제</MenuItem>
      </Menu>
    </Dropdown>
  );
}
