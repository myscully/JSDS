import { Button, Card, Empty, Row2 } from "@jiran/ds-react";

/* 불러오는 동안은 Skeleton, 없는 대상이면 Empty State 와 목록으로 돌아갈 길 */
export default function Example() {
  return (
    <Row2>
      <Card loading />
      <Card>
        <Empty compact icon="file-search" title="자산을 찾을 수 없습니다" actions={<Button variant="outline" color="assistive" size="sm" as="a" href="#">자산 목록으로 이동</Button>}>
          지워졌거나 다른 조직의 자산입니다.
        </Empty>
      </Card>
    </Row2>
  );
}
