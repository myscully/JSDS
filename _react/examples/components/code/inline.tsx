import { InlineCode } from "@jiran/ds-react";

export default function Example() {
  return (
    <p className="t-body-2" style={{ margin: 0 }}>
      설정 파일은 <InlineCode>/etc/js-agent/agent.conf</InlineCode> 에 있습니다. 바꾼 뒤 <InlineCode>systemctl restart js-agent</InlineCode> 를 실행하세요.
    </p>
  );
}
