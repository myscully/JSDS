import { Button, Icon, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Tooltip content="새로 고침"><Button variant="outline" color="assistive" iconOnly aria-label="새로 고침"><Icon name="refresh" /></Button></Tooltip>
      <Tooltip content="필터"><Button variant="outline" color="assistive" iconOnly aria-label="필터"><Icon name="filter" /></Button></Tooltip>
      <Tooltip content="삭제"><Button variant="outline" color="negative" iconOnly aria-label="삭제"><Icon name="trash" /></Button></Tooltip>
    </>
  );
}
