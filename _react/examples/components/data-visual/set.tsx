import { Chart } from "chart.js/auto";
import { Button, ChartCard, ProgressList } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 종류가 다른 차트를 한 줄에 — 머리 32 · 같은 본문 높이 단계라 줄이 맞는다 */
const WEEKDAY = { labels: ["월", "화", "수", "목", "금", "토", "일"], series: [{ label: "차단", data: [182, 204, 196, 221, 268, 94, 71] }], highlight: 4 };
const PATCH = { value: 842, max: 1284, label: "66%", caption: "패치 적용" };

export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(15rem,1fr))", gap: 16, width: "100%", maxWidth: 960 }}>
      <ChartCard title="요일별 차단" sub="이번 주" action={<Button variant="text" color="assistive" size="sm">전체 보기</Button>}>
        <ChartCanvas chart={Chart} config={presets.bar(WEEKDAY)} aria-label="요일별 차단 — 이번 주, 금요일 268건이 가장 많음" />
      </ChartCard>
      <ChartCard title="패치 적용률">
        <ChartCanvas chart={Chart} config={presets.gauge(PATCH)} aria-label="패치 적용률 66% — 1,284대 중 842대" />
      </ChartCard>
      <ChartCard title="부서별 패치 적용">
        <ProgressList
          items={[
            { label: "개발팀", value: 412, max: 450, unit: "대" },
            { label: "영업팀", value: 236, max: 298, unit: "대" },
            { label: "운영팀", value: 128, max: 196, unit: "대" },
          ]}
        />
      </ChartCard>
    </div>
  );
}
