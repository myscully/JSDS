import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 막대 — tone 없는 두 계열은 한 톤의 1 · 4 단계(이번 주 진하게 · 지난 주 옅게), 심각도 누적은 tone */
const WEEKS = {
  labels: ["랜섬웨어", "악성코드", "USB 위반", "정책 위반", "피싱"],
  series: [
    { label: "이번 주", data: [412, 306, 221, 115, 88] },
    { label: "지난 주", data: [349, 331, 198, 142, 97] },
  ],
};
const DEPTS = {
  labels: ["개발팀", "영업팀", "운영팀", "재무팀", "인사팀"],
  series: [
    { label: "Critical", tone: "critical" as const, data: [42, 18, 25, 9, 6] },
    { label: "High", tone: "high" as const, data: [88, 51, 64, 23, 17] },
    { label: "Medium", tone: "medium" as const, data: [74, 60, 62, 30, 24] },
    { label: "Low", tone: "low" as const, data: [46, 36, 39, 18, 15] },
    { label: "Info", tone: "info" as const, data: [64, 70, 58, 41, 33] },
  ],
  stacked: true,
  horizontal: true,
};

export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(18rem,1fr))", gap: 16, width: "100%", maxWidth: 960 }}>
      <ChartCard title="유형별 탐지" sub="주간 비교">
        <ChartCanvas chart={Chart} config={presets.bar(WEEKS)} aria-label="유형별 탐지 — 이번 주와 지난 주 비교" />
      </ChartCard>
      <ChartCard title="부서별 심각도">
        <ChartCanvas chart={Chart} config={presets.bar(DEPTS)} aria-label="부서별 심각도 — Critical · High · Medium · Low · Info 누적" />
      </ChartCard>
    </div>
  );
}
