import { TimePicker } from "@jiran/ds-react";

export default function Example() {
  return <TimePicker label="백업 시각" defaultValue="25:10" error="시각이 잘못됐습니다. 14:30 처럼 24시간제로 입력하세요." />;
}
