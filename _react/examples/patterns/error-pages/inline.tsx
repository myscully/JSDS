import { Button, Card, CardHead, CardTitle, Empty, Icon, Row2 } from "@jiran/ds-react";

/* 카드 안 — 화면의 일부만 볼 수 없으면 그 카드 안에만 작게. 나머지 카드는 그대로 쓴다 */
export default function Example() {
  return (
    <Row2>
      <Card>
        <CardHead><CardTitle>라이선스 사용량</CardTitle></CardHead>
        <Empty compact icon={<Icon name="lock" />} title="이 카드를 볼 권한이 없습니다" actions={<Button variant="outline" color="assistive" size="sm">권한 요청</Button>}>
          라이선스 관리 권한이 필요합니다.
        </Empty>
      </Card>
      <Card>
        <CardHead><CardTitle>최근 배포</CardTitle></CardHead>
        <Empty compact className="error" icon={<Icon name="alert-triangle" />} title="목록을 불러오지 못했습니다" actions={<Button variant="outline" color="assistive" size="sm">다시 시도</Button>}>
          잠시 후 다시 시도하세요.
        </Empty>
      </Card>
    </Row2>
  );
}
