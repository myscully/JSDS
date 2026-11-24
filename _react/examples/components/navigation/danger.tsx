import { Divider, SideNav, SideNavItem } from "@jiran/ds-react";

/* 설정 메뉴 — 아이콘 없이, 위험 항목은 맨 아래 구분선 뒤 하나 */
export default function Example() {
  return (
    <SideNav label="설정 메뉴" style={{ border: "1px solid var(--line-neutral-secondary)", borderRadius: "var(--radius-lg)" }}>
      <SideNavItem href="#" active>내 정보</SideNavItem>
      <SideNavItem href="#">비밀번호와 보안</SideNavItem>
      <SideNavItem href="#">알림</SideNavItem>
      <SideNavItem href="#">팀 구성원</SideNavItem>
      <Divider />
      <SideNavItem href="#" danger>계정 삭제</SideNavItem>
    </SideNav>
  );
}
