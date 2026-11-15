import { BarChart, ChartCard } from "@jiran/ds-react";

/* 정적 Top N — 한 톤(가장 진한 단계). 막대가 심각도일 때만 tone */
export default function Example() {
  return (
    <ChartCard title="유형별 탐지" sub="최근 7일" style={{ maxWidth: 560 }}>
      <BarChart
        max={500}
        rows={[
          { label: "랜섬웨어", value: 412 },
          { label: "악성코드", value: 306 },
          { label: "USB 위반", value: 221 },
          { label: "정책 위반", value: 115 },
          { label: "피싱", value: 88 },
        ]}
      />
    </ChartCard>
  );
}
