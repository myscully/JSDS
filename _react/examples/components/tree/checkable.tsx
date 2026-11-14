import { Tree, type TreeNode } from "@jiran/ds-react";

const TARGETS: TreeNode[] = [
  { value: "all", label: "전체 조직", children: [
    { value: "hq", label: "본사", children: [
      { value: "sec", label: "보안팀", children: [{ value: "soc", label: "관제 파트" }, { value: "ir", label: "대응 파트" }] },
      { value: "dev", label: "개발팀", children: [{ value: "plat", label: "플랫폼 파트" }, { value: "app", label: "앱 파트" }] },
      { value: "ops", label: "경영지원팀" },
    ] },
    { value: "busan", label: "부산 지사", children: [{ value: "sales", label: "영업팀" }, { value: "support", label: "기술지원팀" }] },
  ] },
];

export default function Example() {
  return (
    <div style={{ width: 280 }}>
      <Tree label="적용 대상" checkable items={TARGETS} defaultExpanded={["all", "hq"]} defaultChecked={["soc", "ir", "ops"]} onCheckedChange={(values) => console.log(values)} />
    </div>
  );
}
