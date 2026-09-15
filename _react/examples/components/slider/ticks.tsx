import { Slider } from "@jiran/ds-react";

export default function Example() {
  return <Slider id="s2" label="로그 보관" min={30} max={180} step={30} defaultValue={90} valueText={(v) => `${v}일`} ticks={[30, 60, 90, 120, 150, 180]} />;
}
