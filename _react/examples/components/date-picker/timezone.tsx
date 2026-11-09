import { DatePicker } from "@jiran/ds-react";

/* timezone — '오늘'과 값(그 시간대의 0시)의 기준. dayjs 가 지원하는 IANA 이름과 UTC 를 import 없이 쓴다(기본은 사용자 환경) */
export default function Example() {
  const now = new Date();
  return (
    <>
      <DatePicker label="UTC 기준" timezone="UTC" max={now} help="UTC 의 오늘까지" onChange={(value) => console.log(value?.toISOString())} />
      <DatePicker label="뉴욕 기준" timezone="America/New_York" max={now} help="America/New_York 의 오늘까지" />
    </>
  );
}
