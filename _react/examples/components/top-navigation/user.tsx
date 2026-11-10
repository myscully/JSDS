import { Avatar, Button, Dropdown, DropdownTrigger, Icon, Menu, MenuItem, MenuSep, Tooltip, TopBar, TopBarLogo, TopBarRight } from "@jiran/ds-react";

export default function Example() {
  return (
    <TopBar style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--line-neutral-secondary)" }}>
      <TopBarLogo href="#" name="Security Console" />
      <TopBarRight>
        <Tooltip content="알림" position="bottom"><Button color="assistive" iconOnly size="sm" aria-label="알림"><Icon name="bell" /></Button></Tooltip>
        <Dropdown kind="menu" align="end" keepMounted>
          <DropdownTrigger asChild>
            <button type="button" className="topbar-user" aria-label="사용자 메뉴"><Avatar initials="JH" /></button>
          </DropdownTrigger>
          <Menu>
            <MenuItem onSelect={() => {}}>내 정보</MenuItem>
            <MenuItem onSelect={() => {}}>비밀번호 변경</MenuItem>
            <MenuSep />
            <MenuItem onSelect={() => {}}>로그아웃</MenuItem>
          </Menu>
        </Dropdown>
      </TopBarRight>
    </TopBar>
  );
}
