import { DatePicker } from "@jiran/ds-react";

/* unit — year: YYYY + 12년 연도 목록 · month: YYYY. MM + 월 목록 · day(기본): YYYY. MM. DD + 날짜 달력 */
export default function Example() {
  return (
    <>
      <DatePicker label="보고 연도" unit="year" defaultValue={new Date(2026, 0, 1)} />
      <DatePicker label="보고서 월" unit="month" defaultValue={new Date(2026, 8, 1)} />
      <DatePicker label="점검일" defaultValue={new Date(2026, 8, 7)} />
    </>
  );
}
