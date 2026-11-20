import { DataTable, type DataTableColumn } from "@jiran/ds-react";

type User = { id: string; name: string; email: string; pc: string; ip: string; team: string; count: number };
const ROWS: User[] = [
  { id: "1", name: "김민준", email: "minjun.kim@corp.example.com", pc: "PC-2041", ip: "10.0.4.21", team: "영업팀", count: 3 },
  { id: "2", name: "이서연", email: "seoyeon.lee@corp.example.com", pc: "PC-1187", ip: "10.0.4.37", team: "개발팀", count: 1 },
  { id: "3", name: "박지훈", email: "jihoon.park@corp.example.com", pc: "PC-0932", ip: "10.0.2.8", team: "인프라팀", count: 0 },
];
const COLUMNS: DataTableColumn<User>[] = [
  { key: "name", header: "사용자", sub: (r) => r.email },
  { key: "pc", header: "단말", sub: (r) => r.ip },
  { key: "team", header: "역할" },
  { key: "count", header: "위반", num: true },
];

export default function Example() {
  return <DataTable density="relaxed" nowrap columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />;
}
