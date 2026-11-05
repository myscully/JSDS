import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 시계열 — 심각도 누적 영역. 데이터는 사이트 예제(components.data.js)와 같다 */
const TREND = {
  labels: ["10-21", "10-22", "10-23", "10-24", "10-25", "10-26", "10-27", "10-28", "10-29", "10-30", "10-31", "11-01", "11-02", "11-03"],
  series: [
    { label: "Critical", tone: "critical" as const, data: [12, 18, 9, 14, 22, 17, 11, 8, 15, 19, 24, 13, 10, 16] },
    { label: "High", tone: "high" as const, data: [30, 24, 41, 35, 28, 33, 39, 27, 31, 36, 44, 29, 25, 32] },
    { label: "Medium", tone: "medium" as const, data: [52, 48, 61, 55, 47, 58, 64, 49, 53, 60, 66, 51, 46, 57] },
  ],
  stacked: true,
};

export default function Example() {
  return (
    <ChartCard title="일별 탐지 추이" extra="최근 14일" style={{ maxWidth: 640 }}>
      <ChartCanvas chart={Chart} config={presets.timeseries(TREND)} aria-label="일별 탐지 추이 — 최근 14일, Critical · High · Medium 누적 영역" />
    </ChartCard>
  );
}
