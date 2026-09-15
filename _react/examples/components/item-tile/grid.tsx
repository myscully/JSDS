import { useState } from "react";
import { Tile, TileGrid } from "@jiran/ds-react";

export default function Example() {
  const [sel, setSel] = useState("usb");
  const pick = (k: string) => ({ selected: sel === k, onSelectedChange: () => setSel(k) });
  return (
    <TileGrid style={{ maxWidth: 760 }}>
      <Tile icon="shield" title="USB 제어" desc="저장장치 차단·읽기 전용" {...pick("usb")} />
      <Tile icon="server" title="네트워크 격리" desc="감염 의심 단말 격리" {...pick("net")} />
      <Tile icon="list" title="스크립트 제한" desc="PowerShell·WSH 실행 제어" {...pick("script")} />
      <Tile icon="chart-bar" title="SIEM 연동" desc="Enterprise 전용" {...pick("siem")} disabled />
    </TileGrid>
  );
}
