import { DatePicker } from "@jiran/ds-react";

export default function Example() {
  return <DatePicker label="보고서 월" mode="month" defaultValue={new Date(2026, 8, 1)} />;
}
