import { CodeBlock, DataTable, Spinner, Tag, type DataTableColumn } from "@jiran/ds-react";

type Log = { id: string; time: string; level: "critical" | "medium" | "info"; src: string; msg: string; loading?: boolean };
const LEVEL = { critical: "CRIT", medium: "WARN", info: "INFO" };
const ROWS: Log[] = [
  { id: "lg1", time: "09:41:12.031", level: "critical", src: "10.0.4.21", msg: "process.create blocked: rundll32.exe → cryptor.dll" },
  { id: "lg2", time: "09:41:11.870", level: "medium", src: "10.0.4.21", msg: "usb.attach vendor=0x0781 product=0x5583", loading: true },
  { id: "lg3", time: "09:41:09.114", level: "info", src: "10.0.0.3", msg: "policy.sync ok (rev 2041)" },
];
const COLUMNS: DataTableColumn<Log>[] = [
  { key: "time", header: "시간", sortable: true },
  { key: "level", header: "레벨", render: (r) => <Tag tone={r.level} size="sm">{LEVEL[r.level]}</Tag> },
  { key: "src", header: "소스" },
  { key: "msg", header: "메시지" },
];

/* 상세는 제품이 불러온다 — 받는 동안은 그 자리에 Spinner(두 번째 행) */
const Detail = ({ r }: { r: Log }) =>
  r.loading ? (
    <Spinner size="sm">상세 불러오는 중…</Spinner>
  ) : (
    <>
      <dl className="detail-meta">
        <dt>탐지 정책</dt><dd>랜섬웨어 행위 차단</dd>
        <dt>사용자</dt><dd>corp\kim</dd>
        <dt>상위 프로세스</dt><dd>winword.exe</dd>
      </dl>
      <CodeBlock wrap title={`${r.time} 원본 로그`}>
        {`${r.time} ${r.src} CRIT ${r.msg} parent=winword.exe user=corp\\kim sha256=9f2c41d07be3a8f6e1c2d4b5a6978e0f1d2c3b4a5968778695a4b3c2d1e0f9a8`}
      </CodeBlock>
    </>
  );

export default function Example() {
  return (
    <DataTable
      compact
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.id}
      rowProps={() => ({ log: true })}
      defaultSort={{ key: "time", dir: "desc" }}
      defaultExpanded={new Set(["lg1", "lg2"])}
      expandLabel={(r) => `${r.time} 로그 상세`}
      renderExpanded={(r) => <Detail r={r} />}
    />
  );
}
