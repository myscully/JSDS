import { Button, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Tooltip content="위 (기본)" show><Button variant="secondary">Top</Button></Tooltip>
      <Tooltip content="아래" position="bottom" show><Button variant="secondary">Bottom</Button></Tooltip>
      <Tooltip content="왼쪽" position="left" show><Button variant="secondary">Left</Button></Tooltip>
      <Tooltip content="오른쪽" position="right" show><Button variant="secondary">Right</Button></Tooltip>
    </>
  );
}
