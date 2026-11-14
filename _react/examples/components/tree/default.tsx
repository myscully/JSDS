import { Tree, type TreeNode } from "@jiran/ds-react";

const ORG: TreeNode[] = [
  { value: "hq", label: "본사", icon: "building", meta: 128, children: [
    { value: "sec", label: "보안팀", icon: "users", meta: 24, children: [{ value: "soc", label: "관제 파트", icon: "users", meta: 12 }, { value: "ir", label: "대응 파트", icon: "users", meta: 12 }] },
    { value: "dev", label: "개발팀", icon: "users", meta: 56, children: [{ value: "plat", label: "플랫폼 파트", icon: "users", meta: 30 }, { value: "app", label: "앱 파트", icon: "users", meta: 26 }] },
    { value: "ops", label: "경영지원팀", icon: "users", meta: 48 },
  ] },
  { value: "busan", label: "부산 지사", icon: "building", meta: 31, children: [{ value: "sales", label: "영업팀", icon: "users", meta: 19 }, { value: "support", label: "기술지원팀", icon: "users", meta: 12 }] },
];

export default function Example() {
  return (
    <div style={{ width: 280 }}>
      <Tree label="조직" items={ORG} defaultExpanded={["hq", "sec"]} defaultSelected="soc" onSelect={(v) => console.log(v)} />
    </div>
  );
}
