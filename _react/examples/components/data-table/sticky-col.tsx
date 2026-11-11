import { DataTable, type DataTableColumn } from "@jiran/ds-react";

type Device = { pc: string; user: string; team: string; ip: string; os: string; agent: string; count: number; seen: string };
const ROWS: Device[] = [
  { pc: "PC-2041", user: "김민준", team: "영업팀", ip: "10.0.4.21", os: "Windows 11", agent: "5.2.1", count: 3, seen: "2026-09-07 09:41" },
  { pc: "PC-1187", user: "이서연", team: "개발팀", ip: "10.0.4.37", os: "macOS 14", agent: "5.2.1", count: 1, seen: "2026-09-07 09:12" },
  { pc: "PC-0932", user: "박지훈", team: "인프라팀", ip: "10.0.2.8", os: "Windows 10", agent: "5.1.8", count: 0, seen: "2026-09-06 18:30" },
];
const COLUMNS: DataTableColumn<Device>[] = [
  { key: "pc", header: "단말" },
  { key: "user", header: "사용자" },
  { key: "team", header: "그룹" },
  { key: "ip", header: "IP" },
  { key: "os", header: "OS" },
  { key: "agent", header: "에이전트" },
  { key: "count", header: "위반", num: true },
  { key: "seen", header: "최근 접속" },
];

export default function Example() {
  return <DataTable stickyColumn selectable caption="단말 현황" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.pc} wrapStyle={{ maxWidth: 640 }} />;
}
