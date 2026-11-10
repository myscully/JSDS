import { CodeBlock } from "@jiran/ds-react";

const LOG = [
  "2026-11-10T09:14:10 gw-01 ips: rule=2041 action=block src=203.0.113.20 dst=198.51.100.7 port=22",
  "2026-11-10T09:14:13 gw-01 ips: rule=2041 action=block src=203.0.113.21 dst=198.51.100.7 port=443",
  "2026-11-10T09:14:16 gw-01 ips: rule=2041 action=block src=203.0.113.22 dst=198.51.100.7 port=22",
  "2026-11-10T09:14:19 gw-01 ips: rule=2041 action=block src=203.0.113.23 dst=198.51.100.7 port=443",
  "2026-11-10T09:14:22 gw-01 ips: rule=2041 action=block src=203.0.113.24 dst=198.51.100.7 port=22",
  "2026-11-10T09:14:25 gw-01 ips: rule=2041 action=block src=203.0.113.25 dst=198.51.100.7 port=443",
  "2026-11-10T09:14:28 gw-01 ips: rule=2041 action=block src=203.0.113.26 dst=198.51.100.7 port=22",
  "2026-11-10T09:14:31 gw-01 ips: rule=2041 action=block src=203.0.113.27 dst=198.51.100.7 port=443",
  "2026-11-10T09:14:34 gw-01 ips: rule=2041 action=block src=203.0.113.28 dst=198.51.100.7 port=22",
  "2026-11-10T09:14:37 gw-01 ips: rule=2041 action=block src=203.0.113.29 dst=198.51.100.7 port=443",
  "2026-11-10T09:14:40 gw-01 ips: rule=2041 action=block src=203.0.113.30 dst=198.51.100.7 port=22",
  "2026-11-10T09:14:43 gw-01 ips: rule=2041 action=block src=203.0.113.31 dst=198.51.100.7 port=443",
].join("\n");

export default function Example() {
  return <CodeBlock title="차단 로그" maxHeight={200}>{LOG}</CodeBlock>;
}
