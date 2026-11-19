import { Breadcrumb, BreadcrumbHome, BreadcrumbItem, Button, ButtonGroup, Combobox, CopyField, Notice, NumberInput, PageHead, Select, Setting, SettingsSection, Slider, Stack, Switch, Tag, TagGroup, TimePicker } from "@jiran/ds-react";

const ACTIONS = [{ value: "block-alert", label: "차단 후 알림" }, { value: "block", label: "차단만" }, { value: "alert", label: "알림만" }];
const DEVICES = ["SanDisk 4C530001", "SanDisk 4C530002", "Samsung T7 S6WB", "Kingston DT 0921"].map((d) => ({ value: d, label: d }));

export default function Example() {
  return (
    <Stack>
      <PageHead
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbHome href="#" />
            <BreadcrumbItem href="#">정책</BreadcrumbItem>
            <BreadcrumbItem href="#">USB 제어</BreadcrumbItem>
            <BreadcrumbItem current>외부 USB 차단</BreadcrumbItem>
          </Breadcrumb>
        }
        title="외부 USB 차단" sub="POL-2041 · 전체 그룹 · 마지막 배포 2026-09-06" actions={<><ButtonGroup><Button variant="outline">복제</Button><Button>배포</Button></ButtonGroup></>}
      />
      <Notice tone="warning" title="배포되지 않은 변경 2건">변경 사항은 배포를 눌러야 에이전트에 적용됩니다.</Notice>
      {/* Switch 는 누르면 바로 반영된다 — 섹션 머리에 적는다 */}
      <SettingsSection title={<>실시간 보호<small>바꾸면 바로 적용됩니다</small></>}>
        <Setting title="실시간 보호" description="파일을 실행할 때 바로 검사합니다"><Switch defaultChecked aria-label="실시간 보호" /></Setting>
        <Setting title="USB 저장장치 차단" description="승인하지 않은 장치의 연결을 막습니다"><Switch defaultChecked aria-label="USB 저장장치 차단" /></Setting>
      </SettingsSection>
      <SettingsSection title="탐지 규칙">
        <Setting title="탐지 민감도" description="높을수록 오탐 가능성이 커집니다"><Slider label="민감도" defaultValue={60} /></Setting>
        <Setting title="탐지 시 동작" description="차단한 뒤 관리자에게 알립니다">
          <Select label="탐지 시 동작" options={ACTIONS} defaultValue="block-alert" keepMounted />
        </Setting>
        <Setting title="로그 보관 기간" description="지나면 오래된 로그부터 지웁니다"><NumberInput label="로그 보관 기간" labelHidden min={30} max={365} defaultValue={90} unit="일" help="30~365일" /></Setting>
        <Setting title="정기 점검 시각" description="매일 이 시각에 전체 검사를 합니다"><TimePicker label="정기 점검 시각" labelHidden defaultValue="02:00" /></Setting>
      </SettingsSection>
      <SettingsSection title="저장장치">
        <Setting title="읽기 전용 허용" description="차단하는 대신 읽기만 허용합니다"><Switch aria-label="읽기 전용 허용" /></Setting>
        <Setting title="허용 장치" description="등록된 장치 중에서 고릅니다">
          <Combobox multiple label="허용 장치" placeholder="장치 검색" options={DEVICES} defaultValue={["SanDisk 4C530001", "SanDisk 4C530002"]} />
        </Setting>
      </SettingsSection>
      <SettingsSection title="적용 대상">
        <Setting title="부서" description="5개 부서 · 135대">
          <TagGroup max={2} moreLabel={(n) => `나머지 ${n}개 부서 보기`}>
            <Tag>보안팀</Tag><Tag>개발팀</Tag><Tag>경영지원팀</Tag><Tag>영업팀</Tag><Tag>기술지원팀</Tag>
          </TagGroup>
          <Button variant="outline" color="assistive" size="sm">적용 대상 바꾸기</Button>
        </Setting>
      </SettingsSection>
      <SettingsSection title="에이전트 연결">
        <Setting title="정책 ID" description="에이전트 설치 명령에 넣습니다"><CopyField inline label="정책 ID" value="POL-2041-USB" /></Setting>
      </SettingsSection>
    </Stack>
  );
}
