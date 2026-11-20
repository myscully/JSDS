import { Card, CardHead, CardTitle, DataTable, Stack, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; c0: string; c1: string; c2: string };
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "c0", header: "대상" },
  { key: "c1", header: "결과" },
  { key: "c2", header: "사유" },
];

/* 불러오는 중 · 빈 결과 · 오류 — 불러오기와 다시 시도는 제품이 하고, 표는 상태만 바꾼다 */
export default function Example() {
  return (
    <Stack>
      <Card flush>
        <CardHead><CardTitle>불러오는 중</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="loading" statusLabel="작업 결과 불러오는 중" loadingRows={3} />
      </Card>
      <Card flush>
        <CardHead><CardTitle>실패 없음</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} empty={<div className="empty">실패한 항목이 없습니다.</div>} />
      </Card>
      <Card flush>
        <CardHead><CardTitle>불러오기 실패</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="error" errorText="작업 결과를 불러오지 못했습니다. 작업은 서버에서 계속되니 잠시 뒤 다시 시도하세요." onRetry={() => {}} />
      </Card>
    </Stack>
  );
}
