import { useState } from "react";
import { Button, Chip, ChipGroup, DataTable, Icon, Indicator, Pagination, PaginationBar, SearchBar, SelectButton, Spacer, Stack, Tag, Toolbar, type DataTableColumn } from "@jiran/ds-react";

type Log = { id: number; time: string; level: "critical" | "medium" | "info" | "high" | "low"; lv: string; ip: string; host: string; msg: string };
const ROWS: Log[] = [
  { id: 1, time: "2026-09-07 09:41:12.031", level: "critical", lv: "CRIT", ip: "10.0.4.21", host: "PC-2041", msg: "process.create blocked: rundll32.exe → cryptor.dll" },
  { id: 2, time: "2026-09-07 09:41:11.870", level: "medium", lv: "WARN", ip: "10.0.4.21", host: "PC-2041", msg: "usb.attach vendor=0x0781 product=0x5583 (unapproved)" },
  { id: 3, time: "2026-09-07 09:41:09.114", level: "info", lv: "INFO", ip: "10.0.0.3", host: "Server-03", msg: "policy.sync ok (rev 2041)" },
  { id: 4, time: "2026-09-07 09:40:58.552", level: "high", lv: "HIGH", ip: "10.0.4.33", host: "PC-1187", msg: "malware.known blocked sha256=9f3a…c21e" },
  { id: 5, time: "2026-09-07 09:40:41.207", level: "low", lv: "LOW", ip: "10.0.0.3", host: "Server-03", msg: "agent.checkin 1284/1284" },
  { id: 6, time: "2026-09-07 09:39:57.980", level: "info", lv: "INFO", ip: "10.0.7.10", host: "PC-0932", msg: "scan.scheduled completed files=48213 threats=0" },
];
const COLUMNS: DataTableColumn<Log>[] = [
  { key: "time", header: "시간", sortable: true },
  { key: "level", header: "심각도", render: (r) => <Tag tone={r.level} size="sm">{r.lv}</Tag> },
  { key: "ip", header: "소스 IP" },
  { key: "host", header: "단말" },
  { key: "msg", header: "메시지" },
];

export default function Example() {
  const [live, setLive] = useState("live");
  const [page, setPage] = useState(1);
  return (
    <Stack>
      <Toolbar>
        <SearchBar placeholder='메시지 검색 · host:"PC-2041" level:crit' label="로그 검색" wrapperStyle={{ minWidth: 360 }} />
        <ChipGroup>
          <Chip size="sm" defaultSelected>CRIT</Chip>
          <Chip size="sm" defaultSelected>HIGH</Chip>
          <Chip size="sm" defaultSelected>WARN</Chip>
          <Chip size="sm">INFO</Chip>
        </ChipGroup>
        <Spacer />
        <SelectButton outline label="갱신" value={live} onChange={setLive} options={[{ value: "live", label: <Indicator tone="danger" pulse style={{ gap: 6 }}>실시간</Indicator> }, { value: "pause", label: "일시정지" }]} />
        <Button variant="secondary" leading={<Icon name="download" />}>CSV</Button>
      </Toolbar>
      <DataTable
        compact
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => String(r.id)}
        defaultSort={{ key: "time", dir: "desc" }}
        rowProps={() => ({ log: true })}
        actions={() => <Button size="sm" variant="tertiary" icon aria-label="상세"><Icon name="dots" /></Button>}
      />
      <PaginationBar summary={<>총 <b>48,213</b>건 · 최신 100건 표시</>}>
        <Pagination compact page={page} total={483} siblings={2} onChange={setPage} />
      </PaginationBar>
    </Stack>
  );
}
