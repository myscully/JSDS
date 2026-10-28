import { Button } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Button>Normal</Button>
      <Button variant="outline">Normal</Button>
      <Button color="assistive">Normal</Button>
      <Button variant="outline" color="assistive">Normal</Button>
    </>
  );
}
