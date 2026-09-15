import { Button, ButtonGroup, Empty, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <Empty
      icon="shield"
      title="아직 정책이 없습니다"
      style={{ maxWidth: 560 }}
      actions={
        <ButtonGroup>
          <Button variant="secondary">템플릿 보기</Button>
          <Button leading={<Icon name="plus" />}>정책 만들기</Button>
        </ButtonGroup>
      }
    >
      템플릿에서 시작하거나 새 정책을 만들어 에이전트에 배포하세요.
    </Empty>
  );
}
