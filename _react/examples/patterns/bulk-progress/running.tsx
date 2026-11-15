import { Button, Card, CardDesc, CardFoot, CardHead, CardMeta, CardTitle, Progress, Tag } from "@jiran/ds-react";

/* 진행 중 — 끝난 수 · 진행 막대 · 성공 · 실패 · 남음. 취소는 아직 시작하지 않은 단말만 멈춘다.
   진행 수는 바뀔 때마다 읽지 않고, 처음 실패했을 때와 끝났을 때만 숨긴 status 로 알린다 */
export default function Example() {
  return (
    <Card>
      <CardHead>
        <CardTitle>정책 배포 · 표준 보호 v12</CardTitle>
        <Tag tone="pending" size="sm">진행 중</Tag>
      </CardHead>
      <Progress value={66} label="1,284대 중 842대 끝남" aria-label="정책 배포 진행률" />
      <CardMeta items={[{ label: "성공", value: "839대" }, { label: "실패", value: "3대" }, { label: "남음", value: "442대" }]} />
      <span className="sr-only" role="status">3대에 배포하지 못했습니다.</span>
      <CardDesc>이미 배포한 단말은 그대로 두고, 아직 시작하지 않은 단말만 멈춥니다.</CardDesc>
      <CardFoot>
        <Button variant="outline" color="assistive">남은 배포 취소</Button>
      </CardFoot>
    </Card>
  );
}
