import { useState } from "react";
import { ActionBar, Button, DataTable, Icon, Switch, type DataTableColumn } from "@jiran/ds-react";

type Policy = { id: string; name: string; group: string; targets: number; updated: string; enabled: boolean };
const ROWS: Policy[] = [
  { id: "p1", name: "외부 USB 차단", group: "전체", targets: 1284, updated: "2026-09-06", enabled: true },
  { id: "p2", name: "스크립트 실행 제한", group: "개발팀 제외", targets: 1102, updated: "2026-09-02", enabled: true },
  { id: "p3", name: "원격 접속 허용 목록", group: "인프라팀", targets: 48, updated: "2026-08-21", enabled: false },
];
const COLUMNS: DataTableColumn<Policy>[] = [
  { key: "name", header: "정책" },
  { key: "group", header: "적용 그룹" },
  { key: "targets", header: "대상", num: true, render: (r) => r.targets.toLocaleString() },
  { key: "updated", header: "수정" },
  { key: "enabled", header: "사용", render: (r) => <Switch size="sm" defaultChecked={r.enabled} aria-label="사용" /> },
];

export default function Example() {
  const [selected, setSelected] = useState(new Set(["p1", "p2"]));
  return (
    <DataTable
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.id}
      selectable
      selected={selected}
      onSelectedChange={setSelected}
      actionBar={(sel) => (
        <ActionBar count={sel.size}>
          <Button size="sm" variant="secondary">허용 처리</Button>
          <Button size="sm" variant="secondary" leading={<Icon name="download" />}>내보내기</Button>
          <Button size="sm" variant="danger-secondary">삭제</Button>
        </ActionBar>
      )}
    />
  );
}
