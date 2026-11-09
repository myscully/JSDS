import { useState } from "react";
import { Button, Calendar, type DateRange } from "@jiran/ds-react";

const TODAY = new Date(2026, 9, 7);
const daysAgo = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n);

/* 기간 달력은 두 달이 기본이다(calendars={1} 로 한 달) */
export default function Example() {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [range, setRange] = useState<DateRange>({ start: new Date(2026, 8, 21), end: TODAY });
  const [applied, setApplied] = useState<DateRange>(range);
  const same = range.start.getTime() === applied.start.getTime() && range.end?.getTime() === applied.end?.getTime();
  /* 첫 클릭은 시작, 둘째 클릭은 끝(앞이면 바꾼다). 프리셋은 고르는 즉시 적용한다 — 사이트(ds.js)와 DateRangePicker 가 그렇다 */
  const preset = (n: number) => { const r = { start: daysAgo(n - 1), end: TODAY }; setRange(r); setApplied(r); };
  const pick = (d: Date) => setRange((r) => (!r.end ? (d < r.start ? { start: d, end: r.start } : { start: r.start, end: d }) : { start: d, end: null }));
  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      mode="range"
      value={range}
      onSelect={pick}
      today={TODAY}
      footer={
        <>
          <Button variant="text" size="sm" onClick={() => preset(7)}>최근 7일</Button>
          <Button variant="text" size="sm" onClick={() => preset(30)}>최근 30일</Button>
          <Button size="sm" data-cal="apply" disabled={!range.end || same} onClick={() => setApplied(range)}>적용</Button>
        </>
      }
    />
  );
}
