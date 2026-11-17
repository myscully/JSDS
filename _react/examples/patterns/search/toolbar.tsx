import { useState } from "react";
import { Button, Chip, ChipGroup, Combobox, DataTable, DateRangePicker, Icon, Indicator, Pagination, PaginationBar, SearchBar, Spacer, Stack, Tag, Toolbar, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; time: string; sev: "critical" | "high"; event: string; target: string; status: "blocked" | "review" };
const ROWS: Row[] = [
  { id: "1", time: "09:41:12", sev: "critical", event: "랜섬웨어 행위 탐지", target: "PC-2041 · 김민준", status: "blocked" },
  { id: "2", time: "09:36:47", sev: "high", event: "알려진 악성코드 차단", target: "PC-2041 · 김민준", status: "blocked" },
  { id: "3", time: "09:12:03", sev: "high", event: "의심 스크립트 실행", target: "PC-2041 · 김민준", status: "review" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "time", header: "시간", sortable: true },
  { key: "sev", header: "심각도", render: (r) => <Tag tone={r.sev}>{r.sev === "critical" ? "Critical" : "High"}</Tag> },
  { key: "event", header: "이벤트", render: (r) => <a href="#" className="link">{r.event}</a> },
  { key: "target", header: "대상" },
  { key: "status", header: "상태", render: (r) => (r.status === "blocked" ? <Indicator tone="danger">차단</Indicator> : <Indicator tone="warn">검토 필요</Indicator>) },
];
const SEVS = ["Critical", "High", "Medium", "Low", "Info"].map((label) => ({ value: label, label }));

const today = new Date();
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [{ label: "최근 7일", range: (): [Date, Date] => [daysAgo(6), today] }, { label: "최근 30일", range: (): [Date, Date] => [daysAgo(29), today] }];

/* 툴바 한 줄 = 검색 · 심각도(여러 개) · 기간 — 검색칸이 남는 폭을 맞춘다(2026-11-16). 대시보드에서 넘어온 조건은 결과 줄의 입력값 Chip — 하나씩 지운다 */
export default function Example() {
  const [sev, setSev] = useState<string[]>(["Critical"]);
  const [conds, setConds] = useState(["대상: PC-2041", "정책: 랜섬웨어 행위 차단"]);
  const [page, setPage] = useState(1);
  return (
    <Stack>
      <Toolbar>
        <SearchBar placeholder="이벤트, 단말, IP 검색" label="이벤트 검색" />
        <Combobox multiple options={SEVS} value={sev} onChange={(v) => setSev(v as string[])} placeholder="심각도" label="심각도" />
        <DateRangePicker aria-label="조회 기간" max={today} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: today }} />
      </Toolbar>
      <Toolbar className="sub">
        <span>결과 <b>128</b>건</span>
        <ChipGroup>
          {conds.map((c) => (
            <Chip key={c} size="sm" onRemove={() => setConds((s) => s.filter((x) => x !== c))}>{c}</Chip>
          ))}
        </ChipGroup>
        <Button variant="text" color="assistive" size="sm" onClick={() => { setConds([]); setSev([]); }}>필터 초기화</Button>
        <Spacer />
        <Button variant="outline" color="assistive" size="sm" iconLeft={<Icon name="download" />}>내보내기</Button>
      </Toolbar>
      <DataTable hover nowrap columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} defaultSort={{ key: "time", dir: "desc" }} />
      <PaginationBar summary={<>총 <b>128</b>건 · 1–50</>}>
        <Pagination compact page={page} total={3} onChange={setPage} />
      </PaginationBar>
    </Stack>
  );
}
