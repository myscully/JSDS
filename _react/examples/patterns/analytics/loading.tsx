import { useState } from "react";
import { Chart } from "chart.js/auto";
import { ChartCard, Combobox, DateRangePicker, Stack, Toolbar } from "@jiran/ds-react";

import { ChartCanvas, presets } from "@jiran/ds-react/chart";

const TREND = {
  labels: ["11-12", "11-13", "11-14", "11-15", "11-16", "11-17", "11-18"],
  series: [
    { label: "Critical", tone: "critical" as const, data: [14, 18, 12, 20, 26, 11, 15] },
    { label: "High", tone: "high" as const, data: [38, 42, 40, 44, 49, 36, 39] },
    { label: "Medium", tone: "medium" as const, data: [61, 66, 64, 68, 72, 60, 62] },
    { label: "Low", tone: "low" as const, data: [38, 42, 43, 40, 41, 42, 39] },
    { label: "Info", tone: "info" as const, data: [22, 25, 20, 27, 30, 19, 24] },
  ],
  stacked: true,
};
const TREND_LABEL = "일별 탐지 추이 — 최근 7일 합계 1,309건, 11월 16일 218건이 가장 많음. Critical 116, High 288, Medium 453, Low 285, Info 167";
const SEVS = ["Critical", "High", "Medium", "Low", "Info"].map((label) => ({ value: label, label }));
/* 프리셋 7 · 30 · 90일 — 기간이 필터 줄 맨 앞(dataviz 'Date range first') */
const today = new Date();
const TODAY = today;
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [7, 30, 90].map((n) => ({ label: `최근 ${n}일`, range: (): [Date, Date] => [daysAgo(n - 1), today] }));

/* 조건을 바꾼 직후 — 새 결과가 올 때까지 지난 그림을 흐리게 둔다(state="refreshing" — Skeleton 으로 바꾸지 않아 화면이 흔들리지 않음, dataviz 'Refetch keeps the frame') */
export default function Example() {
  const [sev, setSev] = useState<string[]>(["Critical"]);
  return (
    <Stack>
      <Toolbar>
        <DateRangePicker aria-label="조회 기간" max={TODAY} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: TODAY }} />
        <Combobox multiple options={SEVS} value={sev} onChange={(v) => setSev(v as string[])} placeholder="심각도 전체" label="심각도" />
      </Toolbar>
      <ChartCard title="일별 탐지 추이" sub="심각도별" size="lg" state="refreshing">
        <ChartCanvas chart={Chart} config={presets.bar(TREND)} aria-label={TREND_LABEL} />
      </ChartCard>
    </Stack>
  );
}
