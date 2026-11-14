import { useState } from "react";
import { Button, Card, CardDesc, CardFoot, CardTitle, Form, FormLegend, Indicator, Onboard, Radio, RadioGroup, StepButton, Stepper, TextField } from "@jiran/ds-react";

/* 단계마다 카드 한 장 — 버튼은 카드 아래(StepButton). '다음'은 조직 이름 폼을 검사한다 */
export default function Example() {
  const [level, setLevel] = useState("standard");
  return (
    <Onboard>
      <Stepper
        actions={false}
        defaultCurrent={1}
        steps={[
          { label: "조직 정보", content: (
            <Card>
              <CardTitle>조직 이름을 입력하세요</CardTitle>
              <Form bare validate><FormLegend /><TextField id="ob-org" label="조직 이름" required defaultValue="지란지교시큐리티" help="보고서와 알림에 표시됩니다." /></Form>
              <CardFoot><StepButton step="prev" /><StepButton step="next" /></CardFoot>
            </Card>
          ) },
          { label: "보호 수준", content: (
            <Card>
              <CardTitle>보호 수준을 선택하세요</CardTitle>
              <CardDesc>나중에 정책 › 기본 정책에서 바꿀 수 있습니다.</CardDesc>
              <RadioGroup row card role="radiogroup" aria-label="보호 수준" value={level} onChange={setLevel}>
                <Radio value="standard" description="알려진 위협 차단. 권장">표준</Radio>
                <Radio value="hardened" description="의심 행위까지 차단">강화</Radio>
              </RadioGroup>
              <CardFoot><Button variant="text">건너뛰기</Button><StepButton step="prev" /><StepButton step="next" /></CardFoot>
            </Card>
          ) },
          { label: "에이전트 배포", content: (
            <Card>
              <CardTitle>에이전트를 배포하세요</CardTitle>
              <CardDesc>설치 파일을 받아 단말에 설치합니다. 나중에 설정 › 에이전트에서도 받을 수 있습니다.</CardDesc>
              <CardFoot><Button variant="text">건너뛰기</Button><StepButton step="prev" /><StepButton step="next" /></CardFoot>
            </Card>
          ) },
          { label: "완료", content: (
            <Card style={{ alignItems: "center", textAlign: "center" }}>
              <Indicator tone="ok" style={{ fontSize: "var(--font-size-16)", lineHeight: "1.5rem", letterSpacing: "0.0057em", fontWeight: 600 }}>설정이 완료되었습니다</Indicator>
              <CardDesc className="keep-all">표준 보호 · 에이전트 12대 연결 대기 중. 첫 이벤트가 들어오면 대시보드에서 확인할 수 있습니다.</CardDesc>
              <Button size="lg">대시보드로 이동</Button>
            </Card>
          ) },
        ]}
      />
    </Onboard>
  );
}
