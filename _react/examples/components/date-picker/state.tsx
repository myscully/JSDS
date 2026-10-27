import { DatePicker } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <DatePicker label="비활성" disabled defaultValue={new Date(2026, 8, 7)} />
      <DatePicker allowTyping readOnly label="읽기 전용" defaultValue={new Date(2026, 8, 7)} help="정책이 정한 날짜" />
    </>
  );
}
