import { DatePicker } from "@jiran/ds-react";

/* 값이 늘 유효한 날짜는 아니다 — 덜 친 날짜(incomplete) · 없는 날짜(invalid)는 onChange 로 Invalid Date 가 온다 */
export default function Example() {
  return (
    <>
      <DatePicker label="시작일" defaultText="2026. 09" help="점검을 시작한 날" onChange={(value, { validity }) => console.log(isNaN(value?.getTime() ?? 0), validity)} />
      <DatePicker label="종료일" defaultText="2026. 02. 30" help="점검을 끝낸 날" />
    </>
  );
}
