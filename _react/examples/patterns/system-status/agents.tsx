import { Card, CardDesc, CardHead, CardTitle, Indicator, ProgressList, Row2 } from "@jiran/ds-react";

/* 한도가 있는 측정값은 진행 막대 목록 — 값과 한도를 숫자로 함께 적는다. 상태는 카드 머리의 Indicator */
export default function Example() {
  return (
    <Row2>
      <Card>
        <CardHead><CardTitle>에이전트 연결</CardTitle><Indicator tone="ok">정상</Indicator></CardHead>
        <ProgressList items={[{ label: "온라인", value: 1247, max: 1284, unit: "대" }, { label: "최신 버전", value: 1102, max: 1284, unit: "대" }]} />
        <CardDesc className="keep-all">오프라인 37대 · 10분 이상 미체크인 12대</CardDesc>
      </Card>
      <Card>
        <CardHead><CardTitle>수집 서버 자원</CardTitle><Indicator tone="warn">주의</Indicator></CardHead>
        <ProgressList items={[{ label: "CPU", value: 42, max: 100, unit: "%" }, { label: "디스크", value: 812, max: 1000, unit: "GB" }, { label: "메모리", value: 21, max: 64, unit: "GB" }]} />
        <CardDesc className="keep-all">디스크가 80%를 넘었습니다. 보관 기간을 줄이거나 저장소를 늘리세요.</CardDesc>
      </Card>
    </Row2>
  );
}
