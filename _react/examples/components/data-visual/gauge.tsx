import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 반원 게이지 — 범례 · 툴팁이 없어 aria-label 에 '값 / 목표' 를 적는다 */
const PATCH = { value: 842, max: 1284, label: "66%", caption: "패치 적용" };

export default function Example() {
  return (
    <ChartCard title="패치 적용률" sub="전체 에이전트" style={{ maxWidth: 360 }}>
      <ChartCanvas chart={Chart} config={presets.gauge(PATCH)} aria-label="패치 적용률 66% — 1,284대 중 842대" />
    </ChartCard>
  );
}
