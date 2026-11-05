import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 혼합 — 막대(탐지) + 선(차단). 두 값의 단위가 같아(건) y 축 하나로 그린다. 단위가 다르면 차트를 둘로 나눈다 */
const DAILY = {
  labels: ["10-28", "10-29", "10-30", "10-31", "11-01", "11-02", "11-03"],
  bars: [{ label: "탐지", data: [412, 380, 455, 402, 390, 470, 431] }],
  lines: [{ label: "차단", data: [398, 372, 440, 391, 377, 462, 420] }],
};

export default function Example() {
  return (
    <ChartCard title="일별 탐지와 차단" extra="최근 7일" style={{ maxWidth: 640 }}>
      <ChartCanvas chart={Chart} config={presets.mixed(DAILY)} aria-label="일별 탐지와 차단 — 최근 7일, 막대는 탐지 건수, 선은 차단 건수" />
    </ChartCard>
  );
}
