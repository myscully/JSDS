import { useState } from "react";
import { Button, Combobox, DataTable, DateRangePicker, SearchBar, Stack, Toolbar, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; time: string; sev: string; event: string; target: string; status: string };
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "time", header: "시간", sortable: true },
  { key: "sev", header: "심각도" },
  { key: "event", header: "이벤트" },
  { key: "target", header: "대상" },
  { key: "status", header: "상태" },
];
const SEVS = ["Critical", "High", "Medium", "Low", "Info"].map((label) => ({ value: label, label }));
const today = new Date();
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [{ label: "최근 7일", range: (): [Date, Date] => [daysAgo(6), today] }, { label: "최근 30일", range: (): [Date, Date] => [daysAgo(29), today] }];

/* 결과가 없어도 툴바와 표 틀은 그대로 — 표 본문에 이유와 필터 초기화(2026-11-23) */
export default function Example() {
  const [sev, setSev] = useState<string[]>(["Critical"]);
  return (
    <Stack>
      <Toolbar>
        <SearchBar defaultValue="랜섬웨어 2025" placeholder="이벤트, 단말, IP 검색" label="이벤트 검색" />
        <Combobox multiple options={SEVS} value={sev} onChange={(v) => setSev(v as string[])} placeholder="심각도" label="심각도" />
        <DateRangePicker aria-label="조회 기간" max={today} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: today }} />
      </Toolbar>
      <Toolbar className="sub"><span>결과 <b>0</b>건</span></Toolbar>
      <DataTable
        nowrap
        columns={COLUMNS}
        rows={[] as Row[]}
        rowKey={(r) => r.id}
        defaultSort={{ key: "time", dir: "desc" }}
        empty={<div className="empty">'랜섬웨어 2025' 에 대한 결과가 없습니다. 검색어를 줄이거나 기간을 최근 30일로 넓혀 보세요. <Button size="sm" variant="outline" color="assistive">필터 초기화</Button></div>}
      />
    </Stack>
  );
}
