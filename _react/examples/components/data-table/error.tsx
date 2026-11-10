import { DataTable, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; time: string; sev: string; event: string; target: string };
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "time", header: "시간" },
  { key: "sev", header: "심각도" },
  { key: "event", header: "이벤트" },
  { key: "target", header: "대상" },
];

export default function Example() {
  return <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="error" errorText="이벤트를 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요." onRetry={() => {}} />;
}
