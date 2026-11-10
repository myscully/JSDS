import { useState } from "react";
import { ActionBar, Button, DataTable, Icon, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; name: string; group: string };
const ROWS: Row[] = [
  { id: "PC-2041", name: "PC-2041", group: "영업팀" },
  { id: "PC-1187", name: "PC-1187", group: "개발팀" },
  { id: "PC-0932", name: "PC-0932", group: "인프라팀" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "단말" },
  { key: "group", header: "그룹" },
];

export default function Example() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(ROWS.map((r) => r.id)));
  return (
    <DataTable
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.id}
      selectable
      selected={selected}
      onSelectedChange={setSelected}
      totalCount={1054}
      actionBar={(_, { count }) => <ActionBar count={count} label={(n) => `${n.toLocaleString("ko-KR")}개 선택`}><Button variant="outline" color="assistive" size="sm"><Icon name="download" />내보내기</Button></ActionBar>}
    />
  );
}
