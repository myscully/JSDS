import { Kpi, KpiGrid } from "@jiran/ds-react";

export default function Example() {
  return (
    <KpiGrid style={{ maxWidth: 800 }}>
      <Kpi tone="critical" label="Critical 이벤트" value="1,284" delta="12% 전주 대비" deltaDir="up" />
      <Kpi label="차단률" value="99.2" unit="%" delta="0.3%p" deltaDir="down" />
      <Kpi label="연결 에이전트" value="1,247" unit="/ 1,284" delta="37대 오프라인" />
      <Kpi label="미처리 검토" value="5" delta="24시간 내 처리" />
    </KpiGrid>
  );
}
