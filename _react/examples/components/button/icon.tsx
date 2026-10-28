import { Button, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Button iconLeft={<Icon name="plus" />}>정책 추가</Button>
      <Button variant="outline" color="assistive" iconLeft={<Icon name="download" />}>내보내기</Button>
      <Button variant="outline" iconRight={<Icon name="chevron-right" />}>다음 단계</Button>
    </>
  );
}
