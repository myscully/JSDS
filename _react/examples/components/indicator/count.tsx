import { Button, Count, Icon, WithCount } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Count value={3} />
      <Count value={120} />
      <Count value={12} tone="accent" />
      <Count value={128} tone="neutral" max={999} />
      <WithCount count={<Count value={5} />}>
        <Button variant="secondary" icon aria-label="알림 5건"><Icon name="bell" /></Button>
      </WithCount>
      <WithCount count={<Count dot />}>
        <Button variant="secondary" icon aria-label="새 알림"><Icon name="bell" /></Button>
      </WithCount>
    </>
  );
}
