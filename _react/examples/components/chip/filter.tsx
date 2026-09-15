import { Chip, ChipGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <ChipGroup>
      <Chip defaultSelected>Critical</Chip>
      <Chip defaultSelected>High</Chip>
      <Chip>Medium</Chip>
      <Chip>Low</Chip>
    </ChipGroup>
  );
}
