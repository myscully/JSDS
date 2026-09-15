import { SideNav, SideNavGroup, SideNavItem } from "@jiran/ds-react";

export default function Example() {
  return (
    <SideNav footer="v2.4.1 · 라이선스 정상" style={{ border: "1px solid var(--border-default)", borderRadius: 12 }}>
      <SideNavItem href="#" icon="home" active>대시보드</SideNavItem>
      <SideNavItem href="#" icon="list" count={12}>이벤트</SideNavItem>
      <SideNavGroup>보호</SideNavGroup>
      <SideNavItem href="#" icon="shield">정책</SideNavItem>
      <SideNavItem href="#" sub>USB 제어</SideNavItem>
      <SideNavItem href="#" sub>네트워크</SideNavItem>
      <SideNavItem href="#" icon="server">에이전트</SideNavItem>
      <SideNavGroup>관리</SideNavGroup>
      <SideNavItem href="#" icon="user">사용자</SideNavItem>
      <SideNavItem href="#" icon="settings">설정</SideNavItem>
    </SideNav>
  );
}
