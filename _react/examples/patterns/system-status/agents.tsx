import { Card, CardDesc, CardHead, CardTitle, Progress, Row2, Spinner, Tag } from "@jiran/ds-react";

export default function Example() {
  return (
    <Row2 style={{ maxWidth: 800 }}>
      <Card>
        <CardHead><CardTitle>에이전트 연결</CardTitle><Tag tone="ok">정상</Tag></CardHead>
        <Progress label="온라인" value={1247} max={1284} valueText="1,247 / 1,284" tone="success" />
        <CardDesc>오프라인 37대 · 10분 이상 미체크인 12대</CardDesc>
      </Card>
      <Card>
        <CardHead><CardTitle>진행 중 작업</CardTitle><Spinner size="sm" label="진행 중" /></CardHead>
        <Progress label="정책 rev 2041 배포" value={66} />
        <CardDesc>842 / 1,284대 완료 · 예상 3분</CardDesc>
      </Card>
    </Row2>
  );
}
