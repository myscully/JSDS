import { Kpi, Sparkline } from "@jiran/ds-react";

export default function Example() {
  return (
    <Kpi label="일별 탐지" value="412" style={{ minWidth: 260 }}>
      <Sparkline values={[30, 45, 38, 70, 55, 90, 62]} max={100} />
    </Kpi>
  );
}
