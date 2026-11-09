import { DatePicker } from "@jiran/ds-react";

/* 달력은 min · max 밖을 고를 수 없다. 키보드(직접 입력 · ↑↓)로는 들어가고, 값은 그 날짜로 남은 채 validity "max" 와 오류 문구가 붙는다 */
export default function Example() {
  const min = new Date(2026, 0, 1), max = new Date(2026, 11, 31);
  return (
    <>
      <DatePicker label="점검일" min={min} max={max} defaultValue={new Date(2026, 8, 7)} help="2026년 안의 날짜" />
      <DatePicker label="점검일" min={min} max={max} defaultValue={new Date(2027, 0, 5)} help="2026년 안의 날짜" onChange={(value, { validity }) => console.log(value, validity)} />
    </>
  );
}
