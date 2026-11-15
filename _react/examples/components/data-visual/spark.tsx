import { Chart } from "chart.js/auto";
import { Kpi, KpiGrid, Sparkline } from "@jiran/ds-react";
import { SparkCanvas, presets } from "@jiran/ds-react/chart";

/* 정적 스파크라인(값 오른쪽) · 탐색형 스파크(카드 맨 아래, 높이 40) */
const THREATS = { label: "신규 위협", data: [62, 70, 58, 81, 77, 96, 88, 104, 93, 112] };

export default function Example() {
  return (
    <KpiGrid style={{ maxWidth: 640 }}>
      <Kpi label="일별 탐지" value="412">
        <Sparkline values={[30, 45, 38, 70, 55, 90, 62]} max={100} />
      </Kpi>
      <Kpi label="신규 위협" value="112" delta="20%" deltaDir="up" deltaTone="bad" note="전일 대비">
        <SparkCanvas chart={Chart} config={presets.spark(THREATS)} aria-label="신규 위협 — 최근 10일 62건에서 112건으로 증가" />
      </Kpi>
    </KpiGrid>
  );
}
