import { Button, ButtonGroup, Divider } from "@jiran/ds-react";

export default function Example() {
  return (
    <ButtonGroup>
      <Button variant="solid" color="assistive" size="sm">편집</Button>
      <Button variant="solid" color="assistive" size="sm">복제</Button>
      <Divider orientation="vertical" />
      <Button variant="solid" color="assistive" size="sm">내보내기</Button>
      <Divider orientation="vertical" />
      <Button variant="outline" color="assistive" size="sm">삭제</Button>
    </ButtonGroup>
  );
}
