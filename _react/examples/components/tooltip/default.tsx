import { Button, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tooltip content="목록을 다시 불러옵니다" show>
      <Button variant="secondary">새로 고침</Button>
    </Tooltip>
  );
}
