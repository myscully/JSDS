import { Button, Icon, Kbd, Tooltip } from "@jiran/ds-react";

export default function Example() {
  return (
    <Tooltip content={<>새로 고침<Kbd size="sm" aria-hidden="true">R</Kbd></>} show>
      <Button variant="outline" color="assistive" iconOnly aria-label="새로 고침" aria-keyshortcuts="R"><Icon name="refresh" /></Button>
    </Tooltip>
  );
}
