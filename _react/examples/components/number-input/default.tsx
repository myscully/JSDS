import { NumberInput } from "@jiran/ds-react";

export default function Example() {
  return <NumberInput label="세션 만료" unit="분" defaultValue={30} min={5} max={1440} help="5분부터 1440분까지 입력할 수 있습니다." wrapperStyle={{ width: 280 }} />;
}
