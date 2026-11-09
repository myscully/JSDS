import { Button, Icon, Indicator, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Indicator tone="warn">검토 필요</Indicator>
      <Tooltip content="게시자 서명을 확인하지 못한 실행 파일입니다. 신뢰할 수 있는 파일이면 예외로 추가할 수 있습니다." multi show>
        <Button variant="text" color="assistive" size="sm" iconOnly aria-label="검토 필요 이유"><Icon name="info-circle" /></Button>
      </Tooltip>
    </>
  );
}
