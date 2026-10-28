import { Button, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Tooltip content="위 (기본)" show><Button variant="outline" color="assistive">Top</Button></Tooltip>
      <Tooltip content="아래" position="bottom" show><Button variant="outline" color="assistive">Bottom</Button></Tooltip>
      <Tooltip content="왼쪽" position="left" show><Button variant="outline" color="assistive">Left</Button></Tooltip>
      <Tooltip content="오른쪽" position="right" show><Button variant="outline" color="assistive">Right</Button></Tooltip>
    </>
  );
}
