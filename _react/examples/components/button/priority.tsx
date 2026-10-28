import { Button, ButtonGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button variant="outline" color="assistive">취소</Button>
        <Button color="assistive">필터</Button>
        <Button variant="outline">미리보기</Button>
        <Button>정책 저장</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" color="assistive">취소</Button>
        <Button color="negative">정책 삭제</Button>
      </ButtonGroup>
    </>
  );
}
