import { Card, CardDesc, CardHead, CardTitle, Sparkline, Tab, TabList, Tabs } from "@jiran/ds-react";

export default function Example() {
  return (
    <Card style={{ width: 480 }}>
      <CardHead>
        <CardTitle>주간 탐지 추이</CardTitle>
        <Tabs defaultValue="7d">
          <TabList pill sm>
            <Tab value="7d">7일</Tab>
            <Tab value="30d">30일</Tab>
          </TabList>
        </Tabs>
      </CardHead>
      <Sparkline values={[30, 45, 38, 70, 55, 90, 62]} max={100} />
      <CardDesc>이번 주 탐지 <b>412</b>건, 지난주보다 18% 증가</CardDesc>
    </Card>
  );
}
