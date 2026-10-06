import { Tab, TabList, Tabs } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabList>
        <Tab value="overview">개요</Tab>
        <Tab value="events">이벤트</Tab>
        <Tab value="policy">정책</Tab>
      </TabList>
    </Tabs>
  );
}
