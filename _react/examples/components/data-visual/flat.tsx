import { BarChart, ChartCard, Kpi, KpiGrid } from "@jiran/ds-react";

/* 회색 바탕 대시보드 — KPI · Chart Card 도 Card 와 같이 flat */
export default function Example() {
  return (
    <div style={{ background: "var(--background-neutral-secondary)", padding: 24, borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 800 }}>
      <KpiGrid>
        <Kpi variant="flat" tone="critical" label="Critical 이벤트" value="1,284" delta="12%" deltaDir="up" deltaTone="bad" note="전주 대비" />
        <Kpi variant="flat" label="연결 에이전트" value="1,247" unit="/ 1,284" note="37대 오프라인" />
      </KpiGrid>
      <ChartCard variant="flat" title="유형별 탐지" sub="최근 7일">
        <BarChart
          max={500}
          rows={[
            { label: "랜섬웨어", value: 412 },
            { label: "악성코드", value: 306 },
          ]}
        />
      </ChartCard>
    </div>
  );
}
