import { Avatar, Button, Count, Icon, SearchBar, Tooltip, TopBar, TopBarLogo, TopBarRight, WithCount } from "@jiran/ds-react";

export default function Example() {
  return (
    <TopBar style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--line-neutral-secondary)" }}>
      <TopBarLogo href="#" name="Security Console" />
      <SearchBar placeholder="이벤트, 대상, IP 검색" label="전역 검색" shortcut="/" hotkey wrapperStyle={{ marginLeft: 16 }} />
      <TopBarRight>
        <WithCount count={<Count dot />}>
          <Tooltip content="알림" position="bottom"><Button color="assistive" iconOnly size="sm" aria-label="알림"><Icon name="bell" /></Button></Tooltip>
        </WithCount>
        <Avatar initials="JH" name="정희" />
      </TopBarRight>
    </TopBar>
  );
}
