import { DataTable, SevCell, Tag, type DataTableColumn } from "@jiran/ds-react";

type Sev = "critical" | "high" | "medium" | "low" | "info";
type Row = { id: string; sev: Sev; event: string; target: string; count: number };
const RANK: Record<Sev, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
const LABEL: Record<Sev, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" };
const ROWS: Row[] = [
  { id: "1", sev: "critical", event: "랜섬웨어 행위 탐지", target: "PC-2041", count: 3 },
  { id: "2", sev: "high", event: "알려진 악성코드 차단", target: "PC-0932", count: 2 },
  { id: "3", sev: "medium", event: "미승인 USB 연결", target: "PC-1187", count: 1 },
  { id: "4", sev: "low", event: "정책 동기화 지연", target: "Server-03", count: 12 },
  { id: "5", sev: "info", event: "스케줄 검사 완료", target: "PC-0411", count: 48 },
];
const COLUMNS: DataTableColumn<Row>[] = [
  {
    key: "sev", header: "심각도", sortable: true, sortValue: (r) => RANK[r.sev],
    render: (r) => (
      <SevCell tone={r.sev === "info" ? undefined : r.sev}>
        <Tag tone={r.sev} size="sm">{LABEL[r.sev]}</Tag>
      </SevCell>
    ),
  },
  { key: "event", header: "이벤트" },
  { key: "target", header: "대상" },
  { key: "count", header: "건수", num: true },
];

export default function Example() {
  return <DataTable compact columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} defaultSort={{ key: "sev", dir: "desc" }} wrapStyle={{ maxWidth: 720 }} />;
}
