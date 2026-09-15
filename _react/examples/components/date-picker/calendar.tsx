import { DatePicker } from "@jiran/ds-react";

const TODAY = new Date(2026, 8, 7);

export default function Example() {
  return <DatePicker defaultOpen defaultValue={TODAY} today={TODAY} max={new Date(2026, 8, 30)} />;
}
