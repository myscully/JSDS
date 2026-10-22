import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuItem, MenuSep } from "@jiran/ds-react";

/* 항목 상태 — 아이콘은 기본이 tertiary, 선택·위험·비활성에서는 글자색을 따른다 */
export default function Example() {
  return (
    <Dropdown kind="menu" align="end" defaultOpen>
      <DropdownTrigger asChild>
        <Button variant="secondary" icon aria-label="더 보기"><Icon name="dots" /></Button>
      </DropdownTrigger>
      <Menu>
        <MenuItem icon="pencil" onSelect={() => {}}>편집</MenuItem>
        <MenuItem icon="list" selected onSelect={() => {}}>목록으로 보기</MenuItem>
        <MenuItem icon="share" disabled hint="권한 없음">공유</MenuItem>
        <MenuSep />
        <MenuItem icon="trash" danger onSelect={() => {}}>삭제</MenuItem>
      </Menu>
    </Dropdown>
  );
}
