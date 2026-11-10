import { Tab, TabList, Tabs } from "@jiran/ds-react";

const TABS = ["전체", "USB 제어", "네트워크", "웹 필터", "메일", "프린터", "앱 실행", "화면 캡처", "클립보드"];

export default function Example() {
  return (
    <Tabs defaultValue="전체">
      <TabList label="정책 종류" style={{ maxWidth: 480 }}>
        {TABS.map((t) => <Tab key={t} value={t}>{t}</Tab>)}
      </TabList>
    </Tabs>
  );
}
