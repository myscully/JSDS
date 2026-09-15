import { Radio } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Radio name="r1">Unchecked</Radio>
      <Radio name="r1" defaultChecked>Checked</Radio>
      <Radio name="r2" disabled>Disabled</Radio>
      <Radio name="r3" defaultChecked disabled>Disabled checked</Radio>
    </>
  );
}
