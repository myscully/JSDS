import { Button, DataTable, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; name: string; group: string; count: number };
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "정책" },
  { key: "group", header: "적용 그룹" },
  { key: "count", header: "대상", num: true },
];

export default function Example() {
  return <DataTable columns={COLUMNS} rows={[] as Row[]} rowKey={(r) => r.id} empty={<div className="empty">아직 만든 정책이 없습니다. <Button size="sm">정책 만들기</Button></div>} />;
}
