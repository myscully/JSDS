import { TimePicker } from "@jiran/ds-react";

export default function Example() {
  return <TimePicker label="업무 시작" defaultValue="09:00" min="06:00" max="12:00" help="06:00 부터 12:00 까지 입력할 수 있습니다." />;
}
