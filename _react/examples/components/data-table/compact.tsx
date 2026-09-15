import { DataTable, Tag, type DataTableColumn } from "@jiran/ds-react";

type Log = { id: number; time: string; level: "critical" | "medium" | "info"; src: string; msg: string };
const LEVEL = { critical: "CRIT", medium: "WARN", info: "INFO" };
const ROWS: Log[] = [
  { id: 1, time: "2026-09-07 09:41:12.031", level: "critical", src: "10.0.4.21", msg: "process.create blocked: rundll32.exe → cryptor.dll" },
  { id: 2, time: "2026-09-07 09:41:11.870", level: "medium", src: "10.0.4.21", msg: "usb.attach vendor=0x0781 product=0x5583" },
  { id: 3, time: "2026-09-07 09:41:09.114", level: "info", src: "10.0.0.3", msg: "policy.sync ok (rev 2041)" },
  { id: 4, time: "2026-09-07 09:41:08.552", level: "info", src: "10.0.0.3", msg: "agent.checkin 1284/1284" },
];
const COLUMNS: DataTableColumn<Log>[] = [
  { key: "time", header: "시간" },
  { key: "level", header: "레벨", render: (r) => <Tag tone={r.level} size="sm">{LEVEL[r.level]}</Tag> },
  { key: "src", header: "소스" },
  { key: "msg", header: "메시지" },
];

export default function Example() {
  return <DataTable compact columns={COLUMNS} rows={ROWS} rowKey={(r) => String(r.id)} rowProps={() => ({ log: true })} />;
}
