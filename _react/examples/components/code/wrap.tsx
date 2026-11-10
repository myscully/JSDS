import { CodeBlock } from "@jiran/ds-react";

const LINE = "2026-11-10T09:14:22+09:00 gw-01 kernel: [UFW BLOCK] IN=eth0 OUT= MAC=52:54:00:12:34:56 SRC=203.0.113.24 DST=198.51.100.7 LEN=60 TOS=0x00 PREC=0x00 TTL=52 ID=41021 DF PROTO=TCP SPT=51544 DPT=22 WINDOW=64240 RES=0x00 SYN URGP=0";

export default function Example() {
  return <CodeBlock title="원본 로그" wrap>{LINE}</CodeBlock>;
}
