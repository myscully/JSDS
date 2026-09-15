import { Avatar, Button, Count, Icon, SearchBar, TopBar, TopBarLogo, TopBarRight, WithCount } from "@jiran/ds-react";

export default function Example() {
  return (
    <TopBar style={{ borderRadius: 12, border: "1px solid var(--border-default)" }}>
      <TopBarLogo href="#" name="Security Console" />
      <SearchBar placeholder="이벤트, 대상, IP 검색" label="전역 검색" shortcut="/" hotkey wrapperStyle={{ marginLeft: 16 }} />
      <TopBarRight>
        <WithCount count={<Count dot />}>
          <Button size="sm" variant="tertiary" icon aria-label="알림"><Icon name="bell" /></Button>
        </WithCount>
        <Avatar initials="JH" />
      </TopBarRight>
    </TopBar>
  );
}
