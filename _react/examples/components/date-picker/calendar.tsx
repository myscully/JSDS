import { useState } from "react";
import { Button, Calendar } from "@jiran/ds-react";

const TODAY = new Date(2026, 8, 7);

export default function Example() {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [value, setValue] = useState<Date | null>(TODAY);
  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      value={value}
      onSelect={setValue}
      today={TODAY}
      max={new Date(2026, 8, 30)}
      footer={
        <>
          <Button size="sm" variant="text" onClick={() => { setMonth(new Date(2026, 8, 1)); setValue(TODAY); }}>오늘</Button>
          <Button size="sm">적용</Button>
        </>
      }
    />
  );
}
