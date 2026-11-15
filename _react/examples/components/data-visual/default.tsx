import { Chart } from "chart.js/auto";
import { Button, ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 차트 카드 — 머리(제목 · 보조 · 동작) · 큰 값과 증감 · 본문. 계열이 하나인 추이는 한 톤의 가장 진한 선 + 옅은 영역(기본). 데이터는 사이트 예제와 같다 */
const DAILY = {
  labels: ["10-21", "10-22", "10-23", "10-24", "10-25", "10-26", "10-27", "10-28", "10-29", "10-30", "10-31", "11-01", "11-02", "11-03"],
  series: [{ label: "탐지", data: [94, 90, 111, 104, 97, 108, 114, 84, 99, 115, 134, 93, 81, 105] }],
};

export default function Example() {
  return (
    <ChartCard
      title="일별 탐지"
      sub="최근 14일"
      action={<Button variant="text" color="assistive" size="sm">전체 보기</Button>}
      figure={{ value: "1,429", unit: "건", delta: "8%", deltaDir: "up", deltaTone: "bad", note: "지난 14일 대비" }}
      style={{ maxWidth: 640 }}
    >
      <ChartCanvas chart={Chart} config={presets.timeseries(DAILY)} aria-label="일별 탐지 — 최근 14일 합계 1,429건, 지난 14일보다 8% 증가" />
    </ChartCard>
  );
}
