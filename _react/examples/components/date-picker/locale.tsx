import { useState } from "react";
import { Button, Calendar, type DatePickerLabels } from "@jiran/ds-react";

const TODAY = new Date(2026, 8, 7);

/* locale — 제목 · 요일 · 월 이름 · 접근 이름 · '오늘' 을 Intl 로. Intl 이 지원하는 언어는 import 없이 쓴다.
   Intl 에 없는 문구(적용 · 이전 달 …)는 labels 로 — 사이트 data-labels 와 같은 키 */
const LABELS: Record<string, Partial<DatePickerLabels>> = {
  "en-US": { dialog: "Choose date", apply: "Apply", prevMonth: "Previous month", nextMonth: "Next month", chooseYear: "choose year" },
  "ja-JP": { dialog: "日付を選択", apply: "適用", prevMonth: "前の月", nextMonth: "次の月", chooseYear: "年を選択" },
};

function Localized({ locale, today }: { locale: string; today: string }) {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [draft, setDraft] = useState<Date | null>(TODAY);
  return (
    <Calendar
      locale={locale}
      labels={LABELS[locale]}
      month={month}
      onMonthChange={setMonth}
      value={draft}
      onSelect={setDraft}
      today={TODAY}
      footer={
        <>
          <Button variant="text" size="sm" data-cal="today" onClick={() => setDraft(TODAY)}>{today}</Button>
          <Button size="sm" data-cal="apply" disabled={draft?.getTime() === TODAY.getTime()}>{LABELS[locale].apply}</Button>
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
