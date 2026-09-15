import { Tab, TabList, Tabs } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tabs defaultValue="all">
      <TabList style={{ maxWidth: 640 }}>
        <Tab value="all" count={128}>전체</Tab>
        <Tab value="blocked" count={37}>차단</Tab>
        <Tab value="review" count={5}>검토 필요</Tab>
      </TabList>
    </Tabs>
  );
}
