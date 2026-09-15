import { Tab, TabList, Tabs } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tabs defaultValue="detail">
      <TabList sm accent style={{ maxWidth: 480 }}>
        <Tab value="detail">상세</Tab>
        <Tab value="timeline">타임라인</Tab>
        <Tab value="related">관련 이벤트</Tab>
      </TabList>
    </Tabs>
  );
}
