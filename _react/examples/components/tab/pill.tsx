import { Tab, TabList, Tabs } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tabs defaultValue="day">
      <TabList pill>
        <Tab value="day">일간</Tab>
        <Tab value="week">주간</Tab>
        <Tab value="month">월간</Tab>
      </TabList>
    </Tabs>
  );
}
