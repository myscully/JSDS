import { Card, CardDesc, CardHead, CardTitle, SelectButton, Sparkline } from "@jiran/ds-react";

export default function Example() {
  return (
    <Card style={{ width: 480 }}>
      <CardHead>
        <CardTitle>주간 탐지 추이</CardTitle>
        {/* 패널이 없으니 탭이 아니라 role=group + aria-pressed */}
        <SelectButton label="기간" defaultValue="7d" options={[{ value: "7d", label: "7일" }, { value: "30d", label: "30일" }]} />
      </CardHead>
      <Sparkline values={[30, 45, 38, 70, 55, 90, 62]} max={100} />
      <CardDesc>이번 주 탐지 <b>412</b>건, 지난주보다 18% 증가</CardDesc>
    </Card>
  );
}
