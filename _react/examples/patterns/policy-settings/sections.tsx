import { Button, Notice, PageHead, Select, Setting, SettingsSection, Slider, Stack, Switch, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Stack style={{ maxWidth: 760 }}>
      <PageHead title="외부 USB 차단" sub="POL-2041 · 전체 그룹 · 마지막 배포 2026-09-06" actions={<><Button variant="secondary">복제</Button><Button>배포</Button></>} />
      <Notice tone="warning" title="배포되지 않은 변경 2건">변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</Notice>
      <SettingsSection title="탐지">
        <Setting title="실시간 보호" description="파일 실행 시 즉시 검사합니다"><Switch defaultChecked aria-label="실시간 보호" /></Setting>
        <Setting title="탐지 민감도" description="높을수록 오탐 가능성이 커집니다"><Slider id="sens" label="민감도" defaultValue={60} wrapperStyle={{ minWidth: 220 }} /></Setting>
        <Setting title="탐지 시 동작" description="차단 후 관리자에게 알립니다">
          <Select options={[{ value: "block", label: "차단 후 알림" }, { value: "notify", label: "알림만" }, { value: "log", label: "기록만" }]} defaultValue="block" triggerStyle={{ minWidth: 180 }} />
        </Setting>
      </SettingsSection>
      <SettingsSection title="저장장치">
        <Setting title="USB 저장장치" description="미승인 장치 연결을 차단합니다"><Switch defaultChecked aria-label="USB 저장장치 차단" /></Setting>
        <Setting title="읽기 전용 허용" description="차단 대신 읽기만 허용"><Switch aria-label="읽기 전용 허용" /></Setting>
        <Setting title="허용 장치 시리얼" description="쉼표로 구분"><TextField defaultValue="4C530001, 4C530002" aria-label="허용 장치 시리얼" wrapperStyle={{ minWidth: 280 }} /></Setting>
      </SettingsSection>
    </Stack>
  );
}
