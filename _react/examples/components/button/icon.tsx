import { Button, ButtonGroup, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button iconLeft={<Icon name="plus" />}>정책 만들기</Button>
        <Button variant="outline" color="assistive" iconLeft={<Icon name="download" />}>CSV 내보내기</Button>
        <Button variant="outline" iconRight={<Icon name="chevron-right" />}>다음 단계</Button>
      </ButtonGroup>
    </>
  );
}
