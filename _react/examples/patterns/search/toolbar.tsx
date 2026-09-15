import { useState } from "react";
import { Button, Chip, DataTable, DatePicker, Icon, Indicator, Pagination, PaginationBar, SearchBar, Select, Spacer, Stack, Tag, Toolbar, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; time: string; sev: "critical" | "high"; event: string; target: string; status: "blocked" | "review" };
const ROWS: Row[] = [
  { id: "1", time: "09:41:12", sev: "critical", event: "랜섬웨어 행위 탐지", target: "PC-2041 · 김민준", status: "blocked" },
  { id: "2", time: "09:36:47", sev: "high", event: "알려진 악성코드 차단", target: "PC-0932 · 박지훈", status: "blocked" },
  { id: "3", time: "09:12:03", sev: "high", event: "의심 스크립트 실행", target: "PC-1187 · 이서연", status: "review" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "time", header: "시간", sortable: true },
  { key: "sev", header: "심각도", render: (r) => <Tag tone={r.sev}>{r.sev === "critical" ? "Critical" : "High"}</Tag> },
  { key: "event", header: "이벤트", render: (r) => <a href="#" className="link">{r.event}</a> },
  { key: "target", header: "대상" },
  { key: "status", header: "상태", render: (r) => (r.status === "blocked" ? <Indicator tone="danger">차단</Indicator> : <Indicator tone="warn">검토 필요</Indicator>) },
];

export default function Example() {
  const [filters, setFilters] = useState(["Critical", "High"]);
  const [page, setPage] = useState(1);
  return (
    <Stack>
      <Toolbar>
        <SearchBar placeholder="이벤트, 단말, IP 검색" wrapperStyle={{ minWidth: 320 }} />
        <Select options={[{ value: "2", label: "심각도: 2" }]} defaultValue="2" triggerStyle={{ minWidth: 140, height: 40 }} />
        <DatePicker mode="range" displayText="최근 24시간" triggerStyle={{ height: 40, minWidth: 200 }} />
        <Spacer />
        <Button variant="secondary" leading={<Icon name="download" />}>내보내기</Button>
      </Toolbar>
      <Toolbar style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        <span>결과 <b style={{ color: "var(--text-primary)" }}>128</b>건</span>
        {filters.map((f) => (
          <Chip key={f} size="sm" selected onRemove={() => setFilters((s) => s.filter((x) => x !== f))} removeLabel="제거">{f}</Chip>
        ))}
        <Button size="sm" variant="text" onClick={() => setFilters([])}>필터 초기화</Button>
      </Toolbar>
      <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} defaultSort={{ key: "time", dir: "desc" }} />
      <PaginationBar summary={<>총 <b>128</b>건 · 1–50</>}>
        <Pagination compact page={page} total={3} onChange={setPage} />
      </PaginationBar>
    </Stack>
  );
}
