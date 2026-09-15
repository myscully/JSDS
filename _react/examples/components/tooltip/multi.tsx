import { Indicator, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tooltip content="서명이 확인되지 않은 실행 파일입니다. 24시간 내 처리하지 않으면 자동 차단됩니다." multi show>
      <Indicator tone="warn">검토 필요</Indicator>
    </Tooltip>
  );
}
