import { SideNav, SideNavItem } from "@jiran/ds-react";

export default function Example() {
  return (
    <SideNav collapsed style={{ border: "1px solid var(--border-default)", borderRadius: 12 }}>
      <SideNavItem href="#" icon="home" active>대시보드</SideNavItem>
      <SideNavItem href="#" icon="list">이벤트</SideNavItem>
      <SideNavItem href="#" icon="shield">정책</SideNavItem>
      <SideNavItem href="#" icon="server">에이전트</SideNavItem>
      <SideNavItem href="#" icon="settings">설정</SideNavItem>
    </SideNav>
  );
}
