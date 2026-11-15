import { Kpi, KpiGrid } from "@jiran/ds-react";

/* 증감 배지의 색은 방향이 아니라 의미 — 위협 증가 bad · 차단률 상승 good · 판단 없음은 중립 */
export default function Example() {
  return (
    <KpiGrid style={{ maxWidth: 800 }}>
      <Kpi tone="critical" label="Critical 이벤트" value="1,284" delta="12%" deltaDir="up" deltaTone="bad" note="전주 대비" />
      <Kpi label="차단률" value="99.2" unit="%" delta="0.3%p" deltaDir="up" deltaTone="good" note="전주 대비" />
      <Kpi label="연결 에이전트" value="1,247" unit="/ 1,284" note="37대 오프라인" />
    </KpiGrid>
  );
}
