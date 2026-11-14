import { TimePicker } from "@jiran/ds-react";

export default function Example() {
  return <TimePicker label="점검 시작" defaultValue="09:30" step={15} help="15분 단위로 고를 수 있습니다." />;
}
