import { Slider } from "@jiran/ds-react";

export default function Example() {
  return <Slider withInput id="s5" label="로그인 실패 허용 횟수" unit="회" min={0} max={20} defaultValue={5} help="0회부터 20회까지 입력할 수 있습니다." />;
}
