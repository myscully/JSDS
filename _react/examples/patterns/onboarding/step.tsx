import { useState } from "react";
import { Button, Card, CardDesc, CardFoot, CardTitle, Onboard, Radio, RadioGroup, Steps } from "@jiran/ds-react";

export default function Example() {
  const [level, setLevel] = useState("standard");
  return (
    <Onboard>
      <Steps items={["조직 정보", "보호 수준", "에이전트 배포", "완료"]} current={1} />
      <Card>
        <CardTitle>보호 수준을 선택하세요</CardTitle>
        <CardDesc>나중에 정책 › 기본 정책에서 바꿀 수 있습니다.</CardDesc>
        <RadioGroup row card role="radiogroup" aria-label="보호 수준" value={level} onChange={setLevel}>
          <Radio value="standard" description="알려진 위협 차단. 권장">표준</Radio>
          <Radio value="hardened" description="의심 행위까지 차단">강화</Radio>
        </RadioGroup>
        <CardFoot>
          <Button variant="text">건너뛰기</Button>
          <Button variant="outline" color="assistive">이전</Button>
          <Button>다음</Button>
        </CardFoot>
      </Card>
    </Onboard>
  );
}
