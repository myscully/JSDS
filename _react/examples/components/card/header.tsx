import { Button, Card, CardDesc, CardHead, CardTitle, SelectButton, Sparkline, Tag } from "@jiran/ds-react";

/* 헤더 오른쪽에는 상태 Tag · 기간 선택 · '전체 보기' 중 하나만 */
export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ width: 300 }}>
        <CardHead>
          <CardTitle>에이전트 연결</CardTitle>
          <Tag tone="ok">정상</Tag>
        </CardHead>
        <CardDesc>1,284대 중 1,247대 온라인</CardDesc>
      </Card>
      <Card style={{ width: 300 }}>
        <CardHead>
          <CardTitle>주간 탐지 추이</CardTitle>
          {/* 패널이 없으니 탭이 아니라 role=group + aria-pressed */}
          <SelectButton label="기간" defaultValue="7d" options={[{ value: "7d", label: "7일" }, { value: "30d", label: "30일" }]} />
        </CardHead>
        <Sparkline values={[30, 45, 38, 70, 55, 90, 62]} max={100} />
        <CardDesc>이번 주 탐지 <b>412</b>건, 지난주보다 18% 증가</CardDesc>
      </Card>
      <Card style={{ width: 300 }}>
        <CardHead>
          <CardTitle>정책 배포</CardTitle>
          <Button variant="text" color="assistive" size="sm">전체 보기</Button>
        </CardHead>
        <CardDesc>대기 중인 배포 3건 · 마지막 배포 09:12</CardDesc>
      </Card>
    </div>
  );
}
