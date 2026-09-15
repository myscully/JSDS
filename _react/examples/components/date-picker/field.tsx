import { DatePicker } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <DatePicker label="시작일" />
      <DatePicker label="조회 기간" mode="range" defaultValue={{ start: new Date(2026, 8, 1), end: new Date(2026, 8, 7) }} />
    </>
  );
}
