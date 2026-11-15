import { ChartCard, ProgressList } from "@jiran/ds-react";

/* 진행 막대 목록 — 항목마다 목표 대비(role=meter) */
export default function Example() {
  return (
    <ChartCard title="부서별 패치 적용" sub="에이전트 기준" style={{ maxWidth: 420 }}>
      <ProgressList
        items={[
          { label: "개발팀", value: 412, max: 450, unit: "대" },
          { label: "영업팀", value: 236, max: 298, unit: "대" },
          { label: "운영팀", value: 128, max: 196, unit: "대" },
          { label: "재무팀", value: 66, max: 140, unit: "대" },
        ]}
      />
    </ChartCard>
  );
}
