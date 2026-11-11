import { DataTable, type DataTableColumn } from "@jiran/ds-react";

type Group = { name: string; devices: number; detected: number; blocked: number };
const ROWS: Group[] = [
  { name: "영업팀", devices: 312, detected: 48, blocked: 41 },
  { name: "개발팀", devices: 184, detected: 27, blocked: 19 },
  { name: "인프라팀", devices: 48, detected: 9, blocked: 9 },
];
const COLUMNS: DataTableColumn<Group>[] = [
  { key: "name", header: "그룹" },
  { key: "devices", header: "단말", num: true },
  { key: "detected", header: "탐지", num: true },
  { key: "blocked", header: "차단", num: true },
];
const sum = (k: keyof Omit<Group, "name">) => ROWS.reduce((n, r) => n + r[k], 0);

export default function Example() {
  return (
    <DataTable
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.name}
      summaryRow={{ name: "전체 합계", devices: sum("devices"), detected: sum("detected"), blocked: sum("blocked") }}
    />
  );
}
