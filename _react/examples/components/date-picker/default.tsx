import { DatePicker } from "@jiran/ds-react";

/* 숫자만 치면 YYYY. MM. DD 로 끊어 채운다. ↑↓ 는 커서 조각 ±1, 달력 버튼 · Alt+↓ 로 달력 하나에서 고른다 */
export default function Example() {
  return <DatePicker label="점검일" onChange={(value, { validity }) => console.log(value, validity)} />;
}
