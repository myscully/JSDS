import { ChartCard, ChartLegend, Donut, DonutRow } from "@jiran/ds-react";

/* 정적 도넛 — 심각도는 tone, tone 없는 조각 4개는 한 톤(명도 단계, spec 순서) */
const SEGMENTS = [
  { label: "Critical", value: 190, tone: "critical" as const },
  { label: "High", value: 285, tone: "high" as const },
  { label: "Medium", value: 196, tone: "medium" as const },
  { label: "Low", value: 120, tone: "low" as const },
  { label: "Info", value: 263, tone: "info" as const },
];
const CHANNELS = [{ label: "엔드포인트", value: 612 }, { label: "메일", value: 248 }, { label: "네트워크", value: 131 }, { label: "USB", value: 63 }];
const MONO = ["mono-1", "mono-2", "mono-3", "mono-4"] as const;

export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(18rem,1fr))", gap: 16, width: "100%", maxWidth: 720 }}>
      <ChartCard title="심각도 분포">
        <DonutRow>
          <Donut segments={SEGMENTS} label="1,054" />
          <ChartLegend column items={SEGMENTS.map((s) => ({ label: s.label, value: s.value, tone: s.tone }))} />
        </DonutRow>
      </ChartCard>
      <ChartCard title="탐지 경로">
        <DonutRow>
          <Donut segments={CHANNELS} label="1,054" />
          <ChartLegend column items={CHANNELS.map((s, i) => ({ label: s.label, value: s.value, tone: MONO[i] }))} />
        </DonutRow>
      </ChartCard>
    </div>
  );
}
