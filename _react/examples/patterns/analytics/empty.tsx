import { useState } from "react";
import { Button, ChartCard, Chip, ChipGroup, Combobox, DateRangePicker, Stack, Toolbar } from "@jiran/ds-react";

const SEVS = ["Critical", "High", "Medium", "Low", "Info"].map((label) => ({ value: label, label }));
/* 프리셋 7 · 30 · 90일 — 기간이 필터 줄 맨 앞(dataviz 'Date range first') */
const today = new Date();
const TODAY = today;
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [7, 30, 90].map((n) => ({ label: `최근 ${n}일`, range: (): [Date, Date] => [daysAgo(n - 1), today] }));

/* 조건에 맞는 탐지가 없을 때 — 걸린 조건을 입력값 Chip 으로 보이고 하나씩 지우거나 한 번에 초기화 */
export default function Example() {
  const [sev, setSev] = useState<string[]>(["Critical"]);
  const [conds, setConds] = useState(["단말: PC-2041", "정책: USB 차단"]);
  return (
    <Stack>
      <Toolbar>
        <DateRangePicker aria-label="조회 기간" max={TODAY} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: TODAY }} />
        <Combobox multiple options={SEVS} value={sev} onChange={(v) => setSev(v as string[])} placeholder="심각도 전체" label="심각도" />
      </Toolbar>
      <Toolbar className="sub">
        <span>적용된 조건</span>
        <ChipGroup>
          {conds.map((c) => <Chip key={c} size="sm" onRemove={() => setConds((s) => s.filter((x) => x !== c))}>{c}</Chip>)}
        </ChipGroup>
        <Button variant="text" color="assistive" size="sm" onClick={() => { setConds([]); setSev([]); }}>필터 초기화</Button>
      </Toolbar>
      <ChartCard title="일별 탐지 추이" sub="심각도별" size="lg" state="empty" stateTitle="조건에 맞는 탐지가 없습니다" stateText="기간을 넓히거나 조건을 줄여 보세요." />
    </Stack>
  );
}
