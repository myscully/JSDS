import { useState } from "react";
import { Button, Chip, ChipGroup, CodeBlock, DataTable, DateRangePicker, Icon, Notice, Pagination, PaginationBar, SearchBar, SelectButton, Spacer, Stack, Tag, Toolbar, type DataTableColumn } from "@jiran/ds-react";

type Log = { id: number; t: string; level: "critical" | "medium" | "high" | "low" | "info"; lv: string; ip: string; host: string; msg: string; policy: string; proc: string };
const ROWS: Log[] = [
  { id: 1, t: "09:41:12.031", level: "critical", lv: "CRIT", ip: "10.0.4.21", host: "PC-2041", msg: "process.create blocked: rundll32.exe → cryptor.dll", policy: "랜섬웨어 행위 차단", proc: "winword.exe" },
  { id: 2, t: "09:41:11.870", level: "medium", lv: "WARN", ip: "10.0.4.21", host: "PC-2041", msg: "usb.attach vendor=0x0781 product=0x5583 (unapproved)", policy: "외부 USB 차단", proc: "explorer.exe" },
  { id: 3, t: "09:41:09.114", level: "info", lv: "INFO", ip: "10.0.0.3", host: "Server-03", msg: "policy.sync ok (rev 2041)", policy: "정책 동기화", proc: "js-agent" },
  { id: 4, t: "09:40:58.552", level: "high", lv: "HIGH", ip: "10.0.4.33", host: "PC-1187", msg: "malware.known blocked sha256=9f3a…c21e", policy: "알려진 악성코드 차단", proc: "chrome.exe" },
  { id: 5, t: "09:40:41.207", level: "low", lv: "LOW", ip: "10.0.0.3", host: "Server-03", msg: "agent.checkin 1284/1284", policy: "에이전트 체크인", proc: "js-agent" },
  { id: 6, t: "09:39:57.980", level: "info", lv: "INFO", ip: "10.0.7.10", host: "PC-0932", msg: "scan.scheduled completed files=48213 threats=0", policy: "예약 검사", proc: "js-agent" },
];
const COLUMNS: DataTableColumn<Log>[] = [
  { key: "t", header: "시간", sortable: true, render: (r) => `2026-09-07 ${r.t}` },
  { key: "level", header: "심각도", render: (r) => <Tag tone={r.level} size="sm">{r.lv}</Tag> },
  { key: "ip", header: "소스 IP" },
  { key: "host", header: "단말" },
  { key: "msg", header: "메시지", truncate: true },
];

const LEVELS = ["CRIT", "HIGH", "WARN", "LOW", "INFO"];

/* max 를 0시로 두면 그 하루 끝까지다 — 지금 시각으로 두면 오늘 23:59 가 범위 밖이 된다 */
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [{ label: "최근 7일", range: (): [Date, Date] => [daysAgo(6), today] }, { label: "최근 30일", range: (): [Date, Date] => [daysAgo(29), today] }];
const END_OF_TODAY = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

/* 행 펼침 — 키-값 + 원본 로그. 여러 행을 함께 펼칠 수 있고 첫 행만 펼쳐 둔다 */
function Detail({ r }: { r: Log }) {
  return (
    <>
      <dl className="detail-meta">
        <dt>탐지 정책</dt><dd>{r.policy}</dd>
        <dt>단말</dt><dd>{r.host} · {r.ip}</dd>
        <dt>프로세스</dt><dd>{r.proc}</dd>
      </dl>
      <CodeBlock wrap title={`${r.t} 원본 로그`}>{`2026-09-07T${r.t} ${r.ip} ${r.lv} ${r.msg} host=${r.host} proc=${r.proc}`}</CodeBlock>
    </>
  );
}

export default function Example() {
  const [live, setLive] = useState("pause");
  const [levels, setLevels] = useState(["CRIT", "HIGH", "WARN"]);
  const [page, setPage] = useState(1);
  return (
    <Stack>
      <Toolbar>
        <SearchBar placeholder="메시지, 단말, IP 검색" label="로그 검색" />
        <DateRangePicker aria-label="조회 구간" time max={today} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: END_OF_TODAY }} />
      </Toolbar>
      {/* 첫 줄은 검색 · 기간(40), 둘째 줄은 칩 · 버튼 모두 32 — 나란히 놓인 컨트롤은 높이가 같다 */}
      <Toolbar>
        <ChipGroup clearable={levels.length > 0} onClear={() => setLevels([])}>
          {LEVELS.map((l) => (
            <Chip key={l} selected={levels.includes(l)} onSelectedChange={(on) => setLevels((s) => (on ? [...s, l] : s.filter((x) => x !== l)))}>{l}</Chip>
          ))}
        </ChipGroup>
        <Spacer />
        <SelectButton outline size="sm" label="갱신" value={live} onChange={setLive} options={[{ value: "live", label: "실시간" }, { value: "pause", label: "일시정지" }]} />
        <Button variant="outline" color="assistive" size="sm" iconLeft={<Icon name="download" />}>CSV</Button>
      </Toolbar>
      {live === "pause" && (
        <Notice tone="info" title="새 로그 24건" actions={<Button variant="outline" color="assistive" size="sm">맨 위로 이동해 보기</Button>}>
          일시정지한 동안 들어왔습니다.
        </Notice>
      )}
      <DataTable
        className="log-table"
        aria-label="로그 목록"
        stickyHeader
        hover
        compact
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => String(r.id)}
        defaultSort={{ key: "t", dir: "desc" }}
        rowProps={() => ({ log: true })}
        defaultExpanded={new Set(["1"])}
        expandLabel={(r) => `${r.t} 로그 상세`}
        renderExpanded={(r) => <Detail r={r} />}
      />
      <PaginationBar summary={<>총 <b>48,213</b>건 · 최신 100건 표시</>}>
        <Pagination compact page={page} total={483} siblings={2} onChange={setPage} />
      </PaginationBar>
    </Stack>
  );
}
