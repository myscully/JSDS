import { DatePicker } from "@jiran/ds-react";

const today = new Date();
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);

export default function Example() {
  return (
    <DatePicker
      label="조회 기간"
      mode="range"
      calendars={2}
      max={today}
      presets={[
        { label: "최근 7일", range: () => [daysAgo(6), today] },
        { label: "최근 30일", range: () => [daysAgo(29), today] },
      ]}
      defaultValue={{ start: new Date(2026, 8, 1), end: new Date(2026, 8, 7) }}
    />
  );
}
