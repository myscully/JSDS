import { DataTable, Indicator, Tag, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; time: string; sev: "critical" | "high" | "medium" | "low"; event: string; target: string; count: number; status: "blocked" | "review" | "ok" };
const ROWS: Row[] = [
  { id: "1", time: "09:41:12", sev: "critical", event: "랜섬웨어 행위 탐지", target: "PC-2041 · 김민준", count: 3, status: "blocked" },
  { id: "2", time: "09:40:58", sev: "medium", event: "미승인 USB 연결", target: "PC-1187 · 이서연", count: 1, status: "review" },
  { id: "3", time: "09:38:03", sev: "low", event: "정책 동기화 완료", target: "Server-03", count: 12, status: "ok" },
  { id: "4", time: "09:36:47", sev: "high", event: "알려진 악성코드 차단", target: "PC-0932 · 박지훈", count: 2, status: "blocked" },
];
const SEV_LABEL = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
const SEV_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
const STATUS = { blocked: ["차단", "danger"], review: ["검토 필요", "warn"], ok: ["정상", "ok"] } as const;

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "time", header: "시간", sortable: true },
  { key: "sev", header: "심각도", sortable: true, sortValue: (r) => SEV_RANK[r.sev], render: (r) => <Tag tone={r.sev}>{SEV_LABEL[r.sev]}</Tag> },
  { key: "event", header: "이벤트", render: (r) => <a href="#" className="link">{r.event}</a> },
  { key: "target", header: "대상", sortable: true },
  { key: "count", header: "횟수", num: true, sortable: true },
  { key: "status", header: "상태", render: (r) => <Indicator tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</Indicator> },
];

export default function Example() {
  return <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} defaultSort={{ key: "time", dir: "desc" }} />;
}
