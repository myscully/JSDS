import { useState } from "react";
import { Avatar, Button, ButtonGroup, Count, Divider, Icon, SearchBar, SideNav, SideNavItem, Tooltip, TopBar, TopBarLogo, TopBarNavToggle, TopBarRight, TopBarStart, TopBarThemeToggle, useSideNavCollapse, WithCount } from "@jiran/ds-react";

/* 사이드 내비가 있는 제품 — 왼쪽 영역(로고 + 접기)은 내비와 같은 240 이고, 접으면 아래 내비만 64 로 줄어든다(2026-11-18) */
export default function Example() {
  const [collapsed, setCollapsed] = useSideNavCollapse();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div style={{ width: "100%", border: "1px solid var(--line-neutral-secondary)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <TopBar>
        <TopBarStart>
          <TopBarLogo href="#" name="Security Console" />
          <TopBarNavToggle collapsed={collapsed} onCollapsedChange={setCollapsed} controls="tn-nav" />
        </TopBarStart>
        <SearchBar placeholder="이벤트, 대상, IP 검색" label="전역 검색" shortcut="/" hotkey />
        <TopBarRight>
          <ButtonGroup>
            <WithCount count={<Count dot />}>
              <Tooltip content="알림" position="bottom"><Button color="assistive" iconOnly aria-label="알림"><Icon name="bell" /></Button></Tooltip>
            </WithCount>
            <Tooltip content="설정" position="bottom"><Button color="assistive" iconOnly aria-label="설정"><Icon name="settings" /></Button></Tooltip>
            <TopBarThemeToggle theme={theme} onThemeChange={setTheme} />
          </ButtonGroup>
          <Divider orientation="vertical" />
          <Avatar initials="JH" role="img" aria-label="정희 · 관리자" />
        </TopBarRight>
      </TopBar>
      <div style={{ display: "flex", minHeight: "15rem" }}>
        <SideNav id="tn-nav" collapsible collapsed={collapsed} style={{ minHeight: 0 }}>
          <SideNavItem href="#" icon="layout-dashboard" active>대시보드</SideNavItem>
          <SideNavItem href="#" icon="list">이벤트</SideNavItem>
          <SideNavItem href="#" icon="shield">정책</SideNavItem>
          <SideNavItem href="#" icon="server">에이전트</SideNavItem>
        </SideNav>
        <p className="t-label-1-normal" style={{ margin: 0, padding: "1.5rem", color: "var(--foreground-neutral-secondary)" }}>본문 영역</p>
      </div>
    </div>
  );
}
