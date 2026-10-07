import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuItem } from "@jiran/ds-react";

export default function Example() {
  return (
    <Dropdown kind="menu" align="end" keepMounted>
      <DropdownTrigger asChild>
        <Button variant="secondary" icon aria-label="더 보기"><Icon name="dots" /></Button>
      </DropdownTrigger>
      <Menu>
        <MenuItem icon="pencil" onSelect={() => {}}>편집</MenuItem>
        <MenuItem icon="download" onSelect={() => {}}>내보내기</MenuItem>
      </Menu>
    </Dropdown>
  );
}
