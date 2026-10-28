import { Button } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Button loading>저장 중</Button>
      <Button variant="outline" color="assistive" loading>불러오는 중</Button>
      <Button color="negative" loading>삭제 중</Button>
    </>
  );
}
