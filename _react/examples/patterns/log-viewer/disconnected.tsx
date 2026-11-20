import { Banner, Button } from "@jiran/ds-react";

/* 실시간 갱신이 끊기면 — 다시 연결은 제품이 한다. 받아 둔 로그는 그대로 둔다 */
export default function Example() {
  return (
    <Banner tone="warning" action={<Button variant="outline" color="assistive" size="sm">다시 연결</Button>}>
      실시간 연결이 끊겼습니다. 09:41 까지 받은 로그를 보여 주고 있습니다.
    </Banner>
  );
}
