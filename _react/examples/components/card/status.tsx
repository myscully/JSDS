import { Button, ButtonGroup, Card, CardFoot, CardHead, CardMeta, CardTitle, Indicator } from "@jiran/ds-react";

/* 자산 · 서버 · 에이전트 카드 — 제목 옆 상태 Indicator, 본문은 키-값 행 */
export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ width: 320 }}>
        <CardHead>
          <CardTitle>PC-2041</CardTitle>
          <Indicator tone="ok">온라인</Indicator>
        </CardHead>
        <CardMeta items={[{ label: "에이전트", value: "6.2.1" }, { label: "그룹", value: "개발팀" }, { label: "IP", value: "10.20.4.41" }, { label: "마지막 접속", value: "2026-11-02 09:41" }]} />
        <CardFoot>
          <ButtonGroup>
            <Button variant="outline" color="assistive" size="sm">로그</Button>
            <Button size="sm">원격 점검</Button>
          </ButtonGroup>
        </CardFoot>
      </Card>
      <Card style={{ width: 320 }}>
        <CardHead>
          <CardTitle>SRV-DB-01</CardTitle>
          <Indicator tone="warn">점검 필요</Indicator>
        </CardHead>
        <CardMeta items={[{ label: "에이전트", value: "6.1.8 · 업데이트 필요" }, { label: "그룹", value: "서버" }, { label: "IP", value: "10.20.1.12" }, { label: "마지막 접속", value: "2026-11-01 22:05" }]} />
        <CardFoot>
          <ButtonGroup>
            <Button variant="outline" color="assistive" size="sm">로그</Button>
            <Button size="sm">업데이트</Button>
          </ButtonGroup>
        </CardFoot>
      </Card>
    </div>
  );
}
