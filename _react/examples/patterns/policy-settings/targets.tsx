import { Button, SidePanelSurface, Tree, type TreeNode } from "@jiran/ds-react";

/* 적용 대상 바꾸기를 누르면 열리는 패널 — 제품에서는 SidePanel open modal 로 띄운다 */
const TARGETS: TreeNode[] = [
  { value: "hq", label: "본사", meta: 128, children: [
    { value: "sec", label: "보안팀", meta: 24 },
    { value: "dev", label: "개발팀", meta: 56 },
    { value: "ops", label: "경영지원팀", meta: 48 },
  ] },
  { value: "busan", label: "부산 지사", meta: 31, children: [
    { value: "sales", label: "영업팀", meta: 19 },
    { value: "support", label: "기술지원팀", meta: 12 },
  ] },
];

export default function Example() {
  return (
    <SidePanelSurface
      modal
      title="적용 대상"
      onClose={() => {}}
      footer={<><Button variant="outline" color="assistive">취소</Button><Button>적용</Button></>}
    >
      <Tree label="적용 대상 부서" checkable items={TARGETS} defaultExpanded={["hq"]} defaultChecked={["sec", "dev", "sales", "support"]} />
    </SidePanelSurface>
  );
}
