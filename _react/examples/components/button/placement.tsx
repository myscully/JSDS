import { Button, ButtonGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button variant="outline" color="assistive">취소</Button>
        <Button variant="outline">임시 저장</Button>
        <Button>정책 저장</Button>
      </ButtonGroup>
      <ButtonGroup vertical style={{ width: 320 }}>
        <Button size="lg">시작하기</Button>
        <Button size="lg" variant="outline" color="assistive">나중에 하기</Button>
      </ButtonGroup>
    </>
  );
}
