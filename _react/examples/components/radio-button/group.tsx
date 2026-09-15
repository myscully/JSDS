import { Radio, RadioGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <RadioGroup legend="탐지 시 동작" name="act" defaultValue="block">
      <Radio value="block" description="실행을 즉시 중단하고 관리자에게 알립니다">차단 후 알림</Radio>
      <Radio value="notify" description="기록과 알림만, 실행은 허용">알림만</Radio>
      <Radio value="log">기록만</Radio>
    </RadioGroup>
  );
}
