import { Button, Card, CardHead, CardTitle, DataTable, Stack, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; c0: string; c1: string; c2: string; c3: string };
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "c0", header: "시간" },
  { key: "c1", header: "사용자" },
  { key: "c2", header: "동작" },
  { key: "c3", header: "대상" },
];

/* 불러오는 중 · 빈 결과 · 오류 — 불러오기와 다시 시도는 제품이 하고, 표는 상태만 바꾼다 */
export default function Example() {
  return (
    <Stack>
      <Card flush>
        <CardHead><CardTitle>불러오는 중</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="loading" statusLabel="감사 로그 불러오는 중" loadingRows={3} />
      </Card>
      <Card flush>
        <CardHead><CardTitle>빈 결과</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} empty={<div className="empty">조건에 맞는 기록이 없습니다. 기간을 넓히거나 검색어를 바꾸세요. <Button size="sm" variant="outline" color="assistive">검색 지우기</Button></div>} />
      </Card>
      <Card flush>
        <CardHead><CardTitle>불러오기 실패</CardTitle></CardHead>
        <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} status="error" errorText="감사 로그를 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도하세요." onRetry={() => {}} />
      </Card>
    </Stack>
  );
}
