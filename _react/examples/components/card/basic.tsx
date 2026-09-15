import { Button, Card, CardDesc, CardFoot, CardHead, CardTitle, Tag } from "@jiran/ds-react";

export default function Example() {
  return (
    <Card style={{ width: 360 }}>
      <CardHead>
        <CardTitle>라이선스</CardTitle>
        <Tag tone="ok">정상</Tag>
      </CardHead>
      <CardDesc>1,000석 중 842석 사용 중. 2026-12-31 만료.</CardDesc>
      <CardFoot>
        <Button size="sm" variant="secondary">상세</Button>
        <Button size="sm">갱신</Button>
      </CardFoot>
    </Card>
  );
}
