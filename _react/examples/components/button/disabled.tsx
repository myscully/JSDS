import { Button, ButtonGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button disabled>Primary</Button>
        <Button variant="tertiary" disabled>Tertiary</Button>
        <Button variant="danger" disabled>Danger</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="secondary" disabled>Secondary</Button>
        <Button variant="danger-secondary" disabled>Danger outline</Button>
        <Button variant="text" disabled>Text</Button>
      </ButtonGroup>
    </>
  );
}
