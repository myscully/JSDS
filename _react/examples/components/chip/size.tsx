import { Chip } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Chip size="sm" defaultSelected>Small</Chip>
      <Chip defaultSelected>Default</Chip>
      <Chip disabled>Disabled</Chip>
    </>
  );
}
