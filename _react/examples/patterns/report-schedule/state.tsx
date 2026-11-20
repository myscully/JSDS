import { Button, Card, CardHead, CardTitle, DataTable, Stack, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; c0: string; c1: string; c2: string };
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "c0", header: "보고서" },
  { key: "c1", header: "주기" },
  { key: "c2", header: "다음 발송" },
];

/* 불러오는 중 · 빈 결과 · 오류 — 불러오기와 다시 시도는 제품이 하고, 표는 상태만 바꾼다 */
export default function Example() {
  return (
    <Stack>
      <Card flush>
        <CardHead><CardTitle>불러오는 중</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="loading" statusLabel="예약 보고서 불러오는 중" loadingRows={3} />
      </Card>
      <Card flush>
        <CardHead><CardTitle>첫 사용</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} empty={<div className="empty">아직 예약한 보고서가 없습니다. <Button size="sm">보고서 예약</Button></div>} />
      </Card>
      <Card flush>
        <CardHead><CardTitle>불러오기 실패</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="error" errorText="예약 목록을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요." onRetry={() => {}} />
      </Card>
    </Stack>
  );
}
