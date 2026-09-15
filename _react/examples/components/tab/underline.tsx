import { Tab, TabList, TabPanel, Tabs } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">개요</Tab>
          <Tab value="events">이벤트</Tab>
          <Tab value="policy">정책</Tab>
          <Tab value="report" disabled>리포트</Tab>
        </TabList>
        <TabPanel value="overview">선택한 탭의 내용이 여기에 표시됩니다.</TabPanel>
        <TabPanel value="events">이벤트 목록</TabPanel>
        <TabPanel value="policy">정책 목록</TabPanel>
      </Tabs>
    </div>
  );
}
