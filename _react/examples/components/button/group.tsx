import { Button, ButtonGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup end style={{ maxWidth: 520 }}>
        <Button variant="text">초기화</Button>
        <Button variant="secondary">취소</Button>
        <Button>정책 저장</Button>
      </ButtonGroup>
      <Button size="lg" block style={{ maxWidth: 320 }}>시작하기</Button>
    </>
  );
}
