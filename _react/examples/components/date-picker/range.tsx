import { useState } from "react";
import { Button, Calendar, type DateRange } from "@jiran/ds-react";

const TODAY = new Date(2026, 8, 7);
const daysAgo = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n);

export default function Example() {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [range, setRange] = useState<DateRange>({ start: new Date(2026, 8, 1), end: TODAY });
  /* 첫 클릭은 시작, 둘째 클릭은 끝(앞이면 바꾼다). 달을 넘겨도 range 상태는 그대로다 */
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
          <Button size="sm" variant="text" onClick={() => setRange({ start: daysAgo(6), end: TODAY })}>최근 7일</Button>
          <Button size="sm" variant="text" onClick={() => setRange({ start: daysAgo(29), end: TODAY })}>최근 30일</Button>
          <Button size="sm" data-cal="apply" disabled={!range.end}>적용</Button>
        </>
      }
    />
  );
}
