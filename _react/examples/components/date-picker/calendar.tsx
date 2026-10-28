import { useState } from "react";
import { Button, Calendar } from "@jiran/ds-react";

const TODAY = new Date(2026, 8, 7);

export default function Example() {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  /* 날짜를 누르면 초안, 적용을 눌러야 확정 — 사이트 예제와 같다 */
  const [draft, setDraft] = useState<Date | null>(TODAY);
  const [value, setValue] = useState<Date | null>(TODAY);
  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      value={draft}
      onSelect={setDraft}
      today={TODAY}
      max={new Date(2026, 8, 30)}
      footer={
        <>
          <Button variant="text" size="sm" data-cal="today" onClick={() => { setMonth(new Date(2026, 8, 1)); setDraft(TODAY); }}>오늘</Button>
          <Button size="sm" data-cal="apply" disabled={draft?.getTime() === value?.getTime()} onClick={() => setValue(draft)}>적용</Button>
        </>
      }
    />
  );
}
