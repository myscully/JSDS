import { DateRangePicker } from "@jiran/ds-react";

/* 기간에도 시각을 붙인다 — 달력에서 고르면 00:00 ~ 23:59 로 시작한다 */
export default function Example() {
  return <DateRangePicker label="로그 조회 구간" time inputId="dp-time-range" defaultValue={{ start: new Date(2026, 8, 7, 9, 0), end: new Date(2026, 8, 8, 18, 30) }} />;
}
