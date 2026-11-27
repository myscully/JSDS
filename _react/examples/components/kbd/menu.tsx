import { Button, Dropdown, DropdownTrigger, Icon, Kbd, Menu, MenuItem } from "@jiran/ds-react";

/** 항목 끝 Kbd 는 menu(aria-hidden) — 단축키는 항목의 aria-keyshortcuts 로 알린다 */
export default function Example() {
  return (
    <Dropdown kind="menu" defaultOpen keepMounted>
      <DropdownTrigger asChild>
        <Button variant="outline" color="assistive" iconOnly tooltip aria-label="편집 메뉴"><Icon name="dots" /></Button>
      </DropdownTrigger>
      <Menu>
        <MenuItem icon="copy" aria-keyshortcuts="Control+C Meta+C" onSelect={() => {}}>복사<Kbd keys={["Mod", "C"]} size="sm" menu /></MenuItem>
        <MenuItem icon="clipboard" aria-keyshortcuts="Control+V Meta+V" onSelect={() => {}}>붙여넣기<Kbd keys={["Mod", "V"]} size="sm" menu /></MenuItem>
        <MenuItem icon="list" aria-keyshortcuts="Control+A Meta+A" onSelect={() => {}}>모두 선택<Kbd keys={["Mod", "A"]} size="sm" menu /></MenuItem>
        <MenuItem icon="pencil" aria-keyshortcuts="F2" onSelect={() => {}}>이름 바꾸기<Kbd keys={["F2"]} size="sm" menu /></MenuItem>
      </Menu>
    </Dropdown>
  );
}
