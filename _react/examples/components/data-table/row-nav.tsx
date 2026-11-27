import { DataTable, Link, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; host: string; group: string; seen: string; off?: boolean };
const ROWS: Row[] = [
  { id: "1", host: "PC-2041", group: "영업팀", seen: "09:41" },
  { id: "2", host: "PC-1187", group: "개발팀", seen: "09:38" },
  { id: "3", host: "PC-0932", group: "인프라팀", seen: "08:12", off: true },
  { id: "4", host: "PC-0815", group: "경영지원팀", seen: "09:40" },
  { id: "5", host: "Server-03", group: "보안팀", seen: "09:41" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "host", header: "단말", render: (r) => <Link href="#">{r.host}</Link> },
  { key: "group", header: "그룹" },
  { key: "seen", header: "마지막 접속", render: (r) => `2026. 09. 07 ${r.seen}` },
];

export default function Example() {
  return (
    <DataTable
      hover
      rowNavigation
      selectable
      caption="단말 목록"
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.id}
      rowLabel={(r) => r.host}
      rowProps={(r) => ({ disabled: r.off })}
    />
  );
}
