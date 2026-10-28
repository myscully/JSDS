import { Button, ButtonGroup, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button iconOnly aria-label="추가"><Icon name="plus" /></Button>
        <Button iconOnly color="assistive" aria-label="새로 고침"><Icon name="refresh" /></Button>
        <Button iconOnly color="negative" aria-label="삭제"><Icon name="trash" /></Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button iconOnly variant="outline" color="assistive" size="sm" aria-label="더 보기"><Icon name="dots" /></Button>
        <Button iconOnly variant="outline" color="assistive" aria-label="더 보기"><Icon name="dots" /></Button>
        <Button iconOnly variant="solid" size="lg" aria-label="설정"><Icon name="settings" /></Button>
      </ButtonGroup>
    </>
  );
}
