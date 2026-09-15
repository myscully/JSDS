import { Avatar, Button, Count, Divider, Icon, TopBar, TopBarLogo, TopBarNav, TopBarNavItem, TopBarRight, WithCount } from "@jiran/ds-react";

export default function Example() {
  return (
    <TopBar style={{ borderRadius: 12, border: "1px solid var(--border-default)" }}>
      <TopBarLogo href="#" name="Security Console" version="v2.4" />
      <TopBarNav>
        <TopBarNavItem href="#" active>대시보드</TopBarNavItem>
        <TopBarNavItem href="#">이벤트</TopBarNavItem>
        <TopBarNavItem href="#">정책</TopBarNavItem>
        <TopBarNavItem href="#">에이전트</TopBarNavItem>
      </TopBarNav>
      <TopBarRight>
        <WithCount count={<Count value={3} />}>
          <Button size="sm" variant="tertiary" icon aria-label="알림 3건"><Icon name="bell" /></Button>
        </WithCount>
        <Button size="sm" variant="tertiary" icon aria-label="설정"><Icon name="settings" /></Button>
        <Divider orientation="vertical" />
        <Avatar initials="JH" title="정희 · 관리자" />
      </TopBarRight>
    </TopBar>
  );
}
