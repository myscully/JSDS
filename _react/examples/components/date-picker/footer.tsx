import { DatePicker } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <DatePicker label="전체 버튼" footer={["today", "reset", "cancel", "apply"]} defaultValue={new Date(2026, 8, 7)} />
      <DatePicker label="바로 적용" footer={false} />
      <DatePicker label="기간 바로 적용" mode="range" footer={false} />
    </>
  );
}
