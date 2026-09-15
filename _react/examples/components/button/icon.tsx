import { Button, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Button leading={<Icon name="plus" />}>정책 추가</Button>
      <Button variant="secondary" leading={<Icon name="download" />}>내보내기</Button>
      <Button variant="secondary" icon aria-label="더 보기"><Icon name="dots" /></Button>
      <Button variant="tertiary" icon aria-label="새로 고침"><Icon name="refresh" /></Button>
      <Button variant="danger-secondary" icon aria-label="삭제"><Icon name="trash" /></Button>
    </>
  );
}
