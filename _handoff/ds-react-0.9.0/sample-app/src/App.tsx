import { useState } from "react";
import {
  ActionBar, Button, ButtonGroup, ChartCard, DataTable, Icon, PageHead, Popup, PopupActions, PopupBody,
  PopupTitle, PRODUCT_COLORS, Select, SelectButton, Switch, Tag, TextField, applyProductColor, setTheme,
  useToast, type DataTableColumn, type ProductColorKey,
} from "@jiran/ds-react";
import { Chart } from "chart.js/auto";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

type Policy = { id: string; name: string; group: string; severity: "critical" | "high" | "medium"; targets: number; enabled: boolean };
const ROWS: Policy[] = [
  { id: "p1", name: "외부 USB 차단", group: "전체", severity: "critical", targets: 1284, enabled: true },
  { id: "p2", name: "스크립트 실행 제한", group: "개발팀 제외", severity: "high", targets: 1102, enabled: true },
  { id: "p3", name: "원격 접속 허용 목록", group: "인프라팀", severity: "medium", targets: 48, enabled: false },
];
const SEV = { critical: "Critical", high: "High", medium: "Medium" } as const;
const COLUMNS: DataTableColumn<Policy>[] = [
  { key: "name", header: "정책" },
  { key: "group", header: "적용 그룹" },
  { key: "severity", header: "심각도", render: (r) => <Tag tone={r.severity}>{SEV[r.severity]}</Tag> },
  { key: "targets", header: "대상", num: true, render: (r) => r.targets.toLocaleString() },
  { key: "enabled", header: "사용", render: (r) => <Switch size="sm" defaultChecked={r.enabled} aria-label={`${r.name} 사용`} /> },
];
const DAYS = ["11/06", "11/07", "11/08", "11/09", "11/10", "11/11", "11/12"];

export default function App() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Set<string>(["p1"]));

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px", display: "grid", gap: 32 }}>
      <PageHead title="@jiran/ds-react 0.9.0 테스트" sub="제품 색 · 테마를 바꿔 가며 컴포넌트를 확인합니다" />

      <section style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Select
          label="제품 색"
          defaultValue="blue"
          options={PRODUCT_COLORS.map((p) => ({ value: p.key, label: `${p.name} (${p.key})` }))}
          onChange={(v: string) => applyProductColor(v as ProductColorKey)}
        />
        <SelectButton
          label="테마"
          defaultValue="light"
          options={[{ value: "light", label: "라이트" }, { value: "dark", label: "다크" }]}
          onChange={(v: string) => setTheme(v as "light" | "dark")}
        />
      </section>

      <section style={{ display: "grid", gap: 16, maxWidth: 420 }}>
        <TextField id="name" label="정책 이름" placeholder="예: 외부 USB 차단" help="20자 이내" />
        <TextField id="ip" label="허용 IP" defaultValue="10.0.0" error="올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" />
        <ButtonGroup>
          <Button variant="outline" color="assistive" onClick={() => toast.show({ message: "임시 저장했습니다" })}>임시 저장</Button>
          <Button iconLeft={<Icon name="send" />} onClick={() => setOpen(true)}>배포</Button>
        </ButtonGroup>
      </section>

      <DataTable
        hover
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        actionBar={(sel) => (
          <ActionBar count={sel.size}>
            <ButtonGroup>
              <Button variant="outline" color="assistive" size="sm">내보내기</Button>
              <Button variant="outline" color="assistive" size="sm">삭제</Button>
            </ButtonGroup>
          </ActionBar>
        )}
      />

      <ChartCard title="일별 탐지" sub="최근 7일">
        <ChartCanvas
          chart={Chart}
          aria-label="일별 탐지 추이"
          config={presets.timeseries({ labels: DAYS, series: [{ label: "탐지", data: [182, 205, 196, 240, 221, 198, 187] }] })}
        />
      </ChartCard>

      <Popup open={open} onClose={() => setOpen(false)}>
        <PopupTitle>정책을 배포할까요?</PopupTitle>
        <PopupBody>변경 사항이 1,284대에 적용됩니다.</PopupBody>
        <PopupActions>
          <Button variant="outline" color="assistive" onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={() => { setOpen(false); toast.show({ message: "배포를 시작했습니다" }); }}>배포</Button>
        </PopupActions>
      </Popup>
    </main>
  );
}
