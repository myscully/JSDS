import { useState } from "react";
import { Card, CardDesc, CardFoot, CardTitle, CodeBlock, CopyField, Form, FormLegend, Indicator, Onboard, Radio, RadioGroup, StepButton, Stepper, TextField } from "@jiran/ds-react";

const INSTALL = `curl -fsSL https://agent.example.com/install.sh -o install.sh
sudo sh install.sh --key "$JS_AGENT_KEY"`;

/* 단계마다 카드 한 장 — 이전 · 다음 · 완료는 Stepper 의 단계 버튼. '다음'은 조직 이름 폼을 검사한다.
   에이전트 단계의 '나중에 설치' 는 설치를 건너뛰고 다음 단계로 간다 */
export default function Example() {
  const [level, setLevel] = useState("standard");
  return (
    <Onboard>
      <Stepper
        defaultCurrent={1}
        labels={{ finish: "대시보드로 이동" }}
        steps={[
          { label: "조직 정보", content: (
            <Card>
              <CardTitle>조직 이름을 입력하세요</CardTitle>
              <Form bare validate><FormLegend /><TextField id="ob-org" label="조직 이름" required defaultValue="지란지교시큐리티" help="보고서와 알림에 표시됩니다." /></Form>
            </Card>
          ) },
          { label: "보호 수준", content: (
            <Card>
              <CardTitle>보호 수준을 선택하세요</CardTitle>
              <CardDesc>나중에 정책의 기본 정책에서 바꿀 수 있습니다.</CardDesc>
              <RadioGroup row card role="radiogroup" aria-label="보호 수준" value={level} onChange={setLevel}>
                <Radio value="standard" description="알려진 위협 차단. 권장">표준</Radio>
                <Radio value="hardened" description="의심 행위까지 차단">강화</Radio>
              </RadioGroup>
            </Card>
          ) },
          { label: "에이전트 배포", content: (
            <Card>
              <CardTitle>에이전트를 배포하세요</CardTitle>
              <CardDesc>단말에서 아래 명령을 실행하면 에이전트가 설치되고 이 조직에 등록됩니다.</CardDesc>
              <CodeBlock title="에이전트 설치">{INSTALL}</CodeBlock>
              <CopyField label="등록 키" value="jsk_demo_8c2e41f7a9b3d605" secret help="외부에 공유하지 마세요" />
              <CardFoot><StepButton step="next" variant="text" size="sm">나중에 설치</StepButton></CardFoot>
            </Card>
          ) },
          { label: "완료", content: (
            <Card className="center">
              <Indicator tone="ok" className="t-body-1-normal t-semibold">설정이 완료되었습니다</Indicator>
              <CardDesc className="keep-all">표준 보호 · 에이전트 12대 연결 대기 중. 첫 이벤트가 들어오면 대시보드에서 확인할 수 있습니다.</CardDesc>
            </Card>
          ) },
        ]}
      />
    </Onboard>
  );
}
