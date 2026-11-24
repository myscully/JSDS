import { Button, ButtonGroup, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button iconOnly tooltip aria-label="추가"><Icon name="plus" /></Button>
        <Button iconOnly tooltip color="assistive" aria-label="새로 고침"><Icon name="refresh" /></Button>
        <Button iconOnly tooltip color="assistive" aria-label="삭제"><Icon name="trash" /></Button>
        <Button iconOnly tooltip variant="outline" color="assistive" size="sm" aria-label="더 보기"><Icon name="dots" /></Button>
        <Button iconOnly tooltip variant="outline" color="assistive" aria-label="더 보기"><Icon name="dots" /></Button>
        <Button iconOnly tooltip variant="solid" size="lg" aria-label="설정"><Icon name="settings" /></Button>
      </ButtonGroup>
    </>
  );
}
