import { NumberInput } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <NumberInput label="재시도 간격" unit="초" defaultValue={10} min={0} max={60} step={5} help="0~60초, 5초 단위" wrapperStyle={{ width: 240 }} />
      <NumberInput label="CPU 임계치" unit="%" defaultValue={80} min={0} max={100} step={0.5} help="0~100%, 0.5 단위" wrapperStyle={{ width: 240 }} />
    </div>
  );
}
