import { Setting, SettingsSection, Switch } from "@jiran/ds-react";

export default function Example() {
  return (
    <SettingsSection style={{ maxWidth: 560 }}>
      <Setting title="실시간 보호" description="파일 실행 시 즉시 검사합니다">
        <Switch defaultChecked aria-label="실시간 보호" />
      </Setting>
      <Setting title="USB 자동 검사" description="연결된 저장장치를 검사합니다">
        <Switch aria-label="USB 자동 검사" />
      </Setting>
    </SettingsSection>
  );
}
