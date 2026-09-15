import { BarChart, ChartCard } from "@jiran/ds-react";

export default function Example() {
  return (
    <ChartCard title="유형별 탐지" extra="최근 7일" style={{ maxWidth: 560 }}>
      <BarChart
        max={500}
        rows={[
          { label: "랜섬웨어", value: 412, tone: "critical" },
          { label: "악성코드", value: 306, tone: "high" },
          { label: "USB 위반", value: 221, tone: "medium" },
          { label: "정책 위반", value: 115, tone: "low" },
        ]}
      />
    </ChartCard>
  );
}
