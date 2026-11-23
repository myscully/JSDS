import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 강조(highlight — 그 막대만 진하게, 나머지는 옅은 단계). 계열이 하나인 막대에만. 막대에 그라데이션은 쓰지 않는다 */
const WEEKDAY = { labels: ["월", "화", "수", "목", "금", "토", "일"], series: [{ label: "차단", data: [182, 204, 196, 221, 268, 94, 71] }], highlight: 4 };
const MONTHLY = { labels: ["5월", "6월", "7월", "8월", "9월", "10월"], series: [{ label: "탐지", data: [2140, 2385, 2210, 2560, 2470, 2920] }], highlight: 5 };

export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(18rem,1fr))", gap: 16, width: "100%", maxWidth: 960 }}>
      <ChartCard title="요일별 차단" sub="이번 주">
        <ChartCanvas chart={Chart} config={presets.bar(WEEKDAY)} aria-label="요일별 차단 — 이번 주, 금요일 268건이 가장 많음" />
      </ChartCard>
      <ChartCard title="월별 탐지" sub="최근 6개월">
        <ChartCanvas chart={Chart} config={presets.bar(MONTHLY)} aria-label="월별 탐지 — 최근 6개월, 이번 달 10월 2,920건이 가장 많음" />
      </ChartCard>
    </div>
  );
}
