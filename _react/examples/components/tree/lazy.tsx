import { Tree, type TreeNode } from "@jiran/ds-react";

const SITES: TreeNode[] = [
  { value: "idc-seoul", label: "본사 IDC", icon: "server", lazy: true },
  { value: "idc-busan", label: "부산 IDC", icon: "server", lazy: true },
];

/* 조회는 제품 몫 — 하위를 돌려주는 Promise. 실패하면 reject 하면 줄 끝에 알리고, 다시 펼치면 다시 부른다 */
const fetchServers = (value: string): Promise<TreeNode[]> =>
  new Promise((resolve, reject) => setTimeout(() => (value === "idc-busan" ? reject(new Error("timeout")) : resolve([{ value: `${value}-web`, label: "WEB-01" }, { value: `${value}-db`, label: "DB-01" }])), 800));

export default function Example() {
  return (
    <div style={{ width: 280 }}>
      <Tree label="서버 위치" items={SITES} onLoad={fetchServers} />
    </div>
  );
}
