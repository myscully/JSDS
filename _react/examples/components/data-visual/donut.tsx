import { ChartCard, ChartLegend, Donut, DonutRow } from "@jiran/ds-react";

const SEGMENTS = [
  { label: "Critical", value: 190, tone: "critical" as const },
  { label: "High", value: 285, tone: "high" as const },
  { label: "Medium", value: 316, tone: "medium" as const },
  { label: "Low", value: 263, tone: "low" as const },
];

export default function Example() {
  return (
    <ChartCard title="심각도 분포" style={{ maxWidth: 560 }}>
      <DonutRow>
        <Donut segments={SEGMENTS} label="1,054" />
        <ChartLegend column items={SEGMENTS.map((s) => ({ label: s.label, value: s.value, tone: s.tone }))} />
      </DonutRow>
    </ChartCard>
  );
}
