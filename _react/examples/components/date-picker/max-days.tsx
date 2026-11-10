import { DateRangePicker } from "@jiran/ds-react";

/* maxDays — 시작을 고르면 상한 밖의 날짜를 막는다. 키보드로 친 값은 받아서 validity "long" 으로 알린다 */
export default function Example() {
  return <DateRangePicker label="감사 로그 내보내기" inputId="dp-max-days" maxDays={31} help="최대 31일까지 내보낼 수 있습니다." defaultValue={{ start: new Date(2026, 8, 1), end: new Date(2026, 8, 30) }} />;
}
