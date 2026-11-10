import { NumberInput } from "@jiran/ds-react";

export default function Example() {
  return <NumberInput label="보관 기간" unit="일" defaultValue={500} min={1} max={365} error="값이 너무 큽니다. 365 이하 입력하세요." wrapperStyle={{ width: 280 }} />;
}
