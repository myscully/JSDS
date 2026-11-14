import { Tree, type TreeNode } from "@jiran/ds-react";

const ASSETS: TreeNode[] = [
  { value: "server", label: "서버", icon: "server", children: [
    { value: "web", label: "웹 서버", icon: "server", children: [{ value: "web-01", label: "WEB-01" }, { value: "web-02", label: "WEB-02" }] },
    { value: "db", label: "DB 서버", icon: "server", children: [{ value: "db-01", label: "DB-01" }, { value: "db-bak", label: "DB-백업" }] },
  ] },
  { value: "pc", label: "단말", icon: "device-desktop", children: [
    { value: "hq-pc", label: "본사 PC", icon: "device-desktop", children: [{ value: "sec-pc", label: "보안팀 PC" }, { value: "dev-pc", label: "개발팀 PC" }] },
    { value: "branch-pc", label: "지사 PC", icon: "device-desktop" },
  ] },
];

export default function Example() {
  return <Tree label="자산 그룹" items={ASSETS} defaultExpanded={["server"]} searchable searchLabel="자산 그룹 검색" searchPlaceholder="그룹 이름" style={{ width: 280 }} />;
}
