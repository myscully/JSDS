import { CodeBlock } from "@jiran/ds-react";

const INSTALL = `curl -fsSL https://agent.example.com/install.sh -o install.sh
sudo sh install.sh --group default
sudo systemctl enable --now js-agent`;

export default function Example() {
  return <CodeBlock title="에이전트 설치">{INSTALL}</CodeBlock>;
}
