import { Button, ButtonGroup, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button disabled>Primary</Button>
        <Button color="assistive" disabled>Assistive</Button>
        <Button color="negative" disabled>Negative</Button>
        <Button variant="outline" disabled>Primary</Button>
        <Button variant="outline" color="assistive" disabled>Assistive</Button>
        <Button variant="outline" color="negative" disabled>Negative</Button>
        <Button iconOnly color="assistive" aria-label="새로 고침" disabled><Icon name="refresh" /></Button>
      </ButtonGroup>
    </>
  );
}
