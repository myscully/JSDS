import { useState } from "react";
import { Avatar, Button, ButtonGroup, Count, Divider, Icon, Tooltip, TopBar, TopBarLogo, TopBarNav, TopBarNavItem, TopBarRight, TopBarThemeToggle, WithCount } from "@jiran/ds-react";

/* 오른쪽 순서: 알림 · 설정 · 라이트/다크 · 사용자(2026-11-18). 아이콘 버튼 40 · 알림은 점이 기본 */
export default function Example() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <TopBar style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--line-neutral-secondary)" }}>
      <TopBarLogo href="#" name="Security Console" version="v2.4" />
      <TopBarNav>
        <TopBarNavItem href="#" active>대시보드</TopBarNavItem>
        <TopBarNavItem href="#">이벤트</TopBarNavItem>
        <TopBarNavItem href="#">정책</TopBarNavItem>
      </TopBarNav>
      <TopBarRight>
        <ButtonGroup>
          <WithCount count={<Count dot />}>
            <Tooltip content="알림 3건" position="bottom"><Button color="assistive" iconOnly aria-label="알림 3건"><Icon name="bell" /></Button></Tooltip>
          </WithCount>
          <Tooltip content="설정" position="bottom"><Button color="assistive" iconOnly aria-label="설정"><Icon name="settings" /></Button></Tooltip>
          <TopBarThemeToggle theme={theme} onThemeChange={setTheme} />
        </ButtonGroup>
        <Divider orientation="vertical" />
        <Avatar initials="JH" name="정희" role="img" aria-label="정희 · 관리자" />
      </TopBarRight>
    </TopBar>
  );
}
