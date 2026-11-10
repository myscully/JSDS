import { DatePicker } from "@jiran/ds-react";

/* time 이면 시각까지 입력한다 — YYYY. MM. DD HH:mm, 24시간제. "seconds" 면 초까지. 값은 그 시각의 Date */
export default function Example() {
  return (
    <>
      <DatePicker label="예약 실행" time inputId="dp-time" defaultValue={new Date(2026, 8, 7, 14, 30)} />
      <DatePicker label="이벤트 시각" time="seconds" inputId="dp-time-sec" defaultValue={new Date(2026, 8, 7, 14, 30, 5)} />
    </>
  );
}
