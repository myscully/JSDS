import { Button } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading>저장 중</Button>
      <Button variant="secondary" loading>불러오는 중</Button>
    </>
  );
}
