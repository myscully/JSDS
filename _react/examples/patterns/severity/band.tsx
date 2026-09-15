import { ChartLegend, SevBand, Stack } from "@jiran/ds-react";

const DIST = [
  { tone: "critical" as const, label: "Critical", value: 190 },
  { tone: "high" as const, label: "High", value: 285 },
  { tone: "medium" as const, label: "Medium", value: 316 },
  { tone: "low" as const, label: "Low", value: 263 },
];

export default function Example() {
  return (
    <Stack style={{ maxWidth: 640, gap: 10 }}>
      <SevBand segments={DIST} />
      <ChartLegend items={DIST.map((d) => ({ label: d.label, value: d.value, tone: d.tone }))} />
    </Stack>
  );
}
