import { ChartCard } from "@jiran/ds-react";

/* 상태 — 머리는 남기고 본문 자리만 바꾼다(높이 그대로). 오류의 '다시 시도' 는 onRetry */
export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(15rem,1fr))", gap: 16, width: "100%", maxWidth: 960 }}>
      <ChartCard title="일별 탐지" sub="최근 14일" state="loading" />
      <ChartCard title="일별 탐지" sub="최근 14일" state="empty" stateText="최근 14일 동안 탐지된 이벤트가 없습니다." />
      <ChartCard title="일별 탐지" sub="최근 14일" state="error" onRetry={() => {}} />
    </div>
  );
}
