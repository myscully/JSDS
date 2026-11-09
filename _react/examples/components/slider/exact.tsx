import { TextField } from "@jiran/ds-react";

export default function Example() {
  return <TextField id="s4" label="세션 만료" type="number" defaultValue={30} min={5} max={1440} suffix="분" help="5분부터 1440분까지 입력할 수 있습니다." wrapperStyle={{ width: 280 }} />;
}
