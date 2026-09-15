import { Checkbox } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox defaultChecked disabled>Disabled checked</Checkbox>
    </>
  );
}
