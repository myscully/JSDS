import { DateRangePicker } from "@jiran/ds-react";

const today = new Date();
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);

/* 기간(조회 기간) — 달력 두 개가 기본(767px 이하에서는 하나). 미래 날짜는 고를 수 없다 */
export default function Example() {
  return (
    <DateRangePicker
      label="조회 기간"
      max={today}
      presets={[
        { label: "최근 7일", range: () => [daysAgo(6), today] },
        { label: "최근 30일", range: () => [daysAgo(29), today] },
      ]}
      defaultValue={{ start: new Date(2026, 8, 1), end: new Date(2026, 8, 7) }}
      onChange={({ start, end }, { validity }) => console.log(start, end, validity)}
    />
  );
}
