import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 도넛(탐색형) — 툴팁 · 범례 토글. 값 몇 개를 요약만 하면 CSS Donut 을 쓴다 */
const SEVERITY = {
  series: [
    { label: "Critical", tone: "critical" as const, value: 190 },
    { label: "High", tone: "high" as const, value: 285 },
    { label: "Medium", tone: "medium" as const, value: 196 },
    { label: "Low", tone: "low" as const, value: 120 },
    { label: "Info", tone: "info" as const, value: 263 },
  ],
  center: "1,054",
  legend: "right" as const,
};

export default function Example() {
  return (
    <ChartCard title="심각도 분포" style={{ maxWidth: 420 }}>
      <ChartCanvas chart={Chart} config={presets.donut(SEVERITY)} aria-label="심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054" />
    </ChartCard>
  );
}
