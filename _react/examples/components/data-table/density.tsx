import { useState } from "react";
import { DataTable, SelectButton, type DataTableColumn, type TableDensity } from "@jiran/ds-react";

type Policy = { id: string; name: string; group: string; targets: number; updated: string };
const ROWS: Policy[] = [
  { id: "usb", name: "외부 USB 차단", group: "전체", targets: 1284, updated: "2026-09-06" },
  { id: "script", name: "스크립트 실행 제한", group: "개발팀 제외", targets: 1102, updated: "2026-09-02" },
  { id: "remote", name: "원격 접속 허용 목록", group: "인프라팀", targets: 48, updated: "2026-08-21" },
];
const COLUMNS: DataTableColumn<Policy>[] = [
  { key: "name", header: "정책" },
  { key: "group", header: "적용 그룹" },
  { key: "targets", header: "대상", num: true, render: (r) => r.targets.toLocaleString("ko-KR") },
  { key: "updated", header: "수정" },
];
const DENSITY = [
  { value: "compact", label: "좁게" },
  { value: "default", label: "기본" },
  { value: "relaxed", label: "넓게" },
] as const;

/* 고른 밀도를 기억하는 것은 제품 몫 — 예: 사용자 설정에 저장 */
export default function Example() {
  const [density, setDensity] = useState<TableDensity>("default");
  return (
    <div className="stack">
      <div className="toolbar">
        <span className="spacer" />
        <SelectButton outline label="행 밀도" options={[...DENSITY]} value={density} onChange={setDensity} />
      </div>
      <DataTable density={density} columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />
    </div>
  );
}
