import { useState } from "react";
import { DatePicker } from "@jiran/ds-react";

export default function Example() {
  /* 세 번째 필드: 바깥에서 준 오류는 값을 고치면 바깥이 지운다 */
  const [endError, setEndError] = useState<string | undefined>("날짜 형식이 올바르지 않습니다. 예: 2026-09-07");
  return (
    <>
      <DatePicker allowTyping label="시작일" defaultValue={new Date(2026, 8, 7)} min={new Date(2026, 0, 1)} max={new Date(2026, 11, 31)} help="2026년 안의 날짜 · YYYY-MM-DD" />
      <DatePicker allowTyping label="조회 기간" mode="range" defaultValue={{ start: new Date(2026, 8, 1), end: new Date(2026, 8, 7) }} help="시작 ~ 종료" />
      <DatePicker allowTyping label="종료일" help="YYYY-MM-DD" error={endError} onChange={() => setEndError(undefined)} />
    </>
  );
}
