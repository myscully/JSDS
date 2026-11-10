import { DataTable, Tag, type DataTableColumn } from "@jiran/ds-react";

type Row = { time: string; tone: "critical" | "high" | "medium" | "low" | "info"; level: string; ip: string; msg: string };
const ROWS: Row[] = [
  { time: "09:41:12.031", tone: "critical", level: "CRIT", ip: "10.0.4.21", msg: "process.create blocked: rundll32.exe → cryptor.dll (parent=winword.exe, user=corp\\kim, sha256=9f2c…)" },
  { time: "09:41:11.870", tone: "medium", level: "WARN", ip: "10.0.4.21", msg: "usb.attach vendor=0x0781 product=0x5583" },
  { time: "09:41:09.114", tone: "info", level: "INFO", ip: "10.0.0.3", msg: "policy.sync ok (rev 2041)" },
  { time: "09:41:08.552", tone: "info", level: "INFO", ip: "10.0.0.3", msg: "agent.checkin 1284/1284" },
  { time: "09:41:05.207", tone: "high", level: "HIGH", ip: "10.0.4.33", msg: "network.block dst=185.220.101.4:443" },
  { time: "09:41:03.118", tone: "info", level: "INFO", ip: "10.0.0.3", msg: "policy.sync ok (rev 2040)" },
  { time: "09:41:01.640", tone: "low", level: "LOW", ip: "10.0.4.12", msg: "agent.update 3.8.1 → 3.8.2" },
  { time: "09:40:58.902", tone: "medium", level: "WARN", ip: "10.0.4.33", msg: "usb.attach vendor=0x13fe product=0x4200" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "time", header: "시간", width: 120 },
  { key: "level", header: "레벨", width: 96, render: (r) => <Tag tone={r.tone} size="sm">{r.level}</Tag> },
  { key: "ip", header: "소스", width: 120 },
  { key: "msg", header: "메시지", truncate: true },
];

export default function Example() {
  return <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.time} compact stickyHeader maxHeight={240} caption="최근 로그" rowProps={() => ({ log: true })} />;
}
