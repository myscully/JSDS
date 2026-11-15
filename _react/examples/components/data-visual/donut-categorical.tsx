import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* tone 없는 조각이 5개를 넘으면 계열 색(--chart-series-1~6) — color 를 적지 않아도 자동 */
const OS = {
  series: [
    { label: "Windows 11", value: 642 }, { label: "Windows 10", value: 318 }, { label: "macOS", value: 156 },
    { label: "Ubuntu", value: 88 }, { label: "RHEL", value: 51 }, { label: "기타", value: 29 },
  ],
  center: "1,284",
  legend: "right" as const,
};

export default function Example() {
  return (
    <ChartCard title="운영체제 분포" sub="연결 에이전트" style={{ maxWidth: 480 }}>
      <ChartCanvas chart={Chart} config={presets.donut(OS)} aria-label="운영체제 분포 — Windows 11 642, Windows 10 318, macOS 156, Ubuntu 88, RHEL 51, 기타 29, 합계 1,284" />
    </ChartCard>
  );
}
