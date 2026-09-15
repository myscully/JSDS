import { Button, Card, CardDesc, Indicator, Onboard, Steps } from "@jiran/ds-react";

export default function Example() {
  return (
    <Onboard>
      <Steps items={["조직 정보", "보호 수준", "에이전트 배포", "완료"]} current={3} />
      <Card style={{ alignItems: "center", textAlign: "center" }}>
        <Indicator tone="ok" style={{ fontSize: 16, fontWeight: 600 }}>설정이 완료되었습니다</Indicator>
        <CardDesc>표준 보호 · 에이전트 12대 연결 대기 중. 첫 이벤트가 들어오면 대시보드에서 확인할 수 있습니다.</CardDesc>
        <Button size="lg">대시보드로 이동</Button>
      </Card>
    </Onboard>
  );
}
