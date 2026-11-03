import { Button, Card, CardHead, CardTitle, Empty, Icon } from "@jiran/ds-react";

/* 카드 틀과 헤더는 남기고 본문 자리만 바꾼다 */
export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ width: 320 }}>
        <CardHead>
          <CardTitle>최근 차단 이벤트</CardTitle>
          <Button variant="text" size="sm">전체 보기</Button>
        </CardHead>
        <Empty icon="inbox" title="차단 이벤트 없음">최근 24시간 동안 차단된 이벤트가 없습니다.</Empty>
      </Card>
      <Card style={{ width: 320 }}>
        <CardHead>
          <CardTitle>위협 탐지 추이</CardTitle>
        </CardHead>
        <Empty className="error" icon="alert-triangle" title="데이터를 불러오지 못했습니다" actions={<Button variant="outline" color="assistive" size="sm" iconLeft={<Icon name="refresh" size={16} />}>다시 시도</Button>}>
          잠시 후 다시 시도하세요.
        </Empty>
      </Card>
    </div>
  );
}
