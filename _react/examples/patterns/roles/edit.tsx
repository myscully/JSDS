import { Button, Notice, SidePanelSurface, Tree, type TreeNode } from "@jiran/ds-react";

/* 권한 편집을 누르면 열리는 패널 — 제품에서는 SidePanel open modal 로 띄운다. 저장하기 전에 바뀌는 것을 맨 위에 요약한다 */
const PERMS: TreeNode[] = [
  { value: "dash", label: "대시보드", children: [{ value: "dash-view", label: "보기" }] },
  { value: "event", label: "이벤트", children: [{ value: "event-view", label: "보기" }, { value: "event-handle", label: "처리" }, { value: "event-export", label: "내보내기" }] },
  { value: "policy", label: "정책", children: [{ value: "policy-view", label: "보기" }, { value: "policy-edit", label: "편집" }, { value: "policy-deploy", label: "배포" }] },
  { value: "user", label: "사용자", children: [{ value: "user-view", label: "보기" }, { value: "user-manage", label: "관리" }] },
];
const CHECKED = ["dash-view", "event-view", "event-handle", "policy-view", "policy-edit", "policy-deploy", "user-view"];

export default function Example() {
  return (
    <SidePanelSurface
      modal
      title="운영자 권한"
      onClose={() => {}}
      footer={<><Button variant="outline" color="assistive">취소</Button><Button>저장</Button></>}
    >
      <Notice tone="info" title="변경 2건 · 12명에게 적용">이벤트 처리를 켜고 사용자 관리를 껐습니다.</Notice>
      <Tree label="운영자 권한" checkable items={PERMS} defaultExpanded={["event", "policy"]} defaultChecked={CHECKED} />
    </SidePanelSurface>
  );
}
