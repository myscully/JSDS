import { Button, ButtonGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <ButtonGroup>
        <Button variant="solid" color="primary">Primary</Button>
        <Button variant="solid" color="assistive">Assistive</Button>
        <Button variant="solid" color="negative">Negative</Button>
        <Button variant="outline" color="primary">Primary</Button>
        <Button variant="outline" color="assistive">Assistive</Button>
        <Button variant="outline" color="negative">Negative</Button>
      </ButtonGroup>
    </>
  );
}
