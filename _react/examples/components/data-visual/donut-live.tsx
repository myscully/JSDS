import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 도넛(탐색형) — 조각도 계열처럼 센다: tone 없는 4조각은 한 톤, 심각도는 tone */
const CHANNELS = {
  series: [{ label: "엔드포인트", value: 612 }, { label: "메일", value: 248 }, { label: "네트워크", value: 131 }, { label: "USB", value: 63 }],
  center: "1,054",
  legend: "right" as const,
};
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(22rem,1fr))", gap: 16, width: "100%", maxWidth: 960 }}>
      <ChartCard title="탐지 경로">
        <ChartCanvas chart={Chart} config={presets.donut(CHANNELS)} aria-label="탐지 경로 — 엔드포인트 612, 메일 248, 네트워크 131, USB 63, 합계 1,054" />
      </ChartCard>
      <ChartCard title="심각도 분포">
        <ChartCanvas chart={Chart} config={presets.donut(SEVERITY)} aria-label="심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054" />
      </ChartCard>
    </div>
  );
}
