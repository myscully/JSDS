import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 본문 높이 단계 — sm 160 · md 240(기본) · lg 320 */
const WEEKDAY = { labels: ["월", "화", "수", "목", "금", "토", "일"], series: [{ label: "차단", data: [182, 204, 196, 221, 268, 94, 71] }], highlight: 4 };
const LABEL = "요일별 차단 — 이번 주, 금요일 268건이 가장 많음";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 640 }}>
      <ChartCard size="sm" title="Small" sub="160"><ChartCanvas chart={Chart} config={presets.bar(WEEKDAY)} aria-label={LABEL} /></ChartCard>
      <ChartCard title="Medium" sub="240 · 기본"><ChartCanvas chart={Chart} config={presets.bar(WEEKDAY)} aria-label={LABEL} /></ChartCard>
      <ChartCard size="lg" title="Large" sub="320"><ChartCanvas chart={Chart} config={presets.bar(WEEKDAY)} aria-label={LABEL} /></ChartCard>
    </div>
  );
}
