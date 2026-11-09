import { useState } from "react";
import { Button, Calendar } from "@jiran/ds-react";

const TODAY = new Date(2026, 8, 7);

/* locale — 제목 · 요일 · 월 이름 · 접근 이름을 Intl 로. Intl 이 지원하는 언어는 import 없이 쓴다 */
function Localized({ locale, today }: { locale: string; today: string }) {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [draft, setDraft] = useState<Date | null>(TODAY);
  return (
    <Calendar
      locale={locale}
      month={month}
      onMonthChange={setMonth}
      value={draft}
      onSelect={setDraft}
      today={TODAY}
      footer={
        <>
          <Button variant="text" size="sm" data-cal="today" onClick={() => setDraft(TODAY)}>{today}</Button>
          <Button size="sm" data-cal="apply" disabled={draft?.getTime() === TODAY.getTime()}>Apply</Button>
        </>
      }
    />
  );
}

export default function Example() {
  return (
    <>
      <Localized locale="en-US" today="Today" />
      <Localized locale="ja-JP" today="今日" />
    </>
  );
}
