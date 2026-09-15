import { Button, Empty } from "@jiran/ds-react";

export default function Example() {
  return (
    <Empty compact icon="inbox" title="연결된 알림 채널이 없습니다" style={{ maxWidth: 480 }} actions={<Button size="sm" variant="secondary" style={{ margin: "0 0 0 auto" }}>연결</Button>}>
      Slack 또는 이메일을 연결하세요.
    </Empty>
  );
}
