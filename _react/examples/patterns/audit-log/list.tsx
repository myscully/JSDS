import { DataTable, DateRangePicker, Indicator, Link, SearchBar, Stack, Toolbar, type DataTableColumn } from "@jiran/ds-react";

type Entry = { id: string; time: string; user: string; action: string; target: string; href?: string; ok: boolean; meta: [string, string][] };
const ROWS: Entry[] = [
  { id: "1", time: "10:12", user: "이서연", action: "정책 변경", target: "표준 보호", href: "#", ok: true, meta: [["접속 IP", "10.0.0.12"], ["사유", "PC-2041 USB 예외 요청"], ["USB 저장장치 차단", "켬 → 끔"], ["예외 단말", "2대 → 3대"]] },
  { id: "2", time: "10:05", user: "김민준", action: "로그인", target: "콘솔", ok: false, meta: [["접속 IP", "203.0.113.7"], ["사유", "비밀번호 5회 틀림 · 계정 잠김"]] },
  { id: "3", time: "09:58", user: "박지훈", action: "내보내기", target: "로그 7일", ok: true, meta: [["접속 IP", "10.0.0.31"], ["형식", "CSV · 48,213줄"]] },
];
const COLUMNS: DataTableColumn<Entry>[] = [
  { key: "time", header: "시간", render: (r) => `11-15 ${r.time}` },
  { key: "user", header: "사용자" },
  { key: "action", header: "동작" },
  { key: "target", header: "대상", render: (r) => (r.href ? <Link href={r.href}>{r.target}</Link> : r.target) },
  { key: "ok", header: "결과", render: (r) => (r.ok ? <Indicator tone="ok">성공</Indicator> : <Indicator tone="danger">실패</Indicator>) },
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [{ label: "최근 7일", range: (): [Date, Date] => [daysAgo(6), today] }, { label: "최근 30일", range: (): [Date, Date] => [daysAgo(29), today] }];

/* 감사 기록은 고칠 수 없다 — 편집 · 삭제 동작이 없다. 행을 펼쳐 접속 IP · 사유 · 바뀐 항목(변경 전 → 변경 후)을 본다 */
export default function Example() {
  return (
    <Stack>
      <Toolbar>
        <SearchBar placeholder="사용자, 대상 검색" label="감사 로그 검색" />
        <DateRangePicker aria-label="조회 기간" max={today} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: today }} />
      </Toolbar>
      <DataTable
        compact
        nowrap
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        defaultExpanded={new Set(["1"])}
        expandLabel={(r) => `${r.time} 기록 상세`}
        renderExpanded={(r) => (
          <dl className="detail-meta">
            {r.meta.map(([k, v]) => [<dt key={`${k}-t`}>{k}</dt>, <dd key={`${k}-d`}>{v}</dd>])}
          </dl>
        )}
      />
    </Stack>
  );
}
