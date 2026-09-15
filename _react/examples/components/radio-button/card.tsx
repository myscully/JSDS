import { Radio, RadioGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <RadioGroup row card name="plan" defaultValue="standard">
      <Radio value="standard" description="권장. 알려진 위협 차단">표준 모드</Radio>
      <Radio value="hardened" description="의심 행위까지 차단, 오탐 증가">강화 모드</Radio>
    </RadioGroup>
  );
}
