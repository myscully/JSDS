import { Tree, type TreeNode } from "@jiran/ds-react";

const TARGETS: TreeNode[] = [
  { value: "hq", label: "본사", children: [
    { value: "sec", label: "보안팀" },
    { value: "dev", label: "개발팀" },
    { value: "partner", label: "외부 협력사", disabled: true, meta: "권한 없음" },
  ] },
];

export default function Example() {
  return (
    <div style={{ width: 280 }}>
      <Tree label="적용 대상" checkable items={TARGETS} defaultExpanded={["hq"]} defaultChecked={["sec"]} />
    </div>
  );
}
