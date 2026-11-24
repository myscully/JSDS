import { Tab, TabList, TabPanel, Tabs, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <Tabs defaultValue="a">
        <TabList label="정책 설정">
          <Tab value="a">기본</Tab>
          <Tab value="b">예외</Tab>
        </TabList>
        <TabPanel value="a"><TextField label="정책 이름" placeholder="예: 외부 USB 차단" /></TabPanel>
        <TabPanel value="b"><TextField label="예외 대상" placeholder="사용자 또는 그룹" /></TabPanel>
      </Tabs>
    </div>
  );
}
