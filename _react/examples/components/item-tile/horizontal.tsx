import { useState } from "react";
import { Tile } from "@jiran/ds-react";

export default function Example() {
  const [sel, setSel] = useState("weekly");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 420 }}>
      <Tile horizontal icon="chart-bar" title="주간 요약" desc="매주 월요일 발송" selected={sel === "weekly"} onSelectedChange={() => setSel("weekly")} />
      <Tile horizontal icon="list" title="상세 이벤트" desc="CSV · 최대 10만 행" selected={sel === "detail"} onSelectedChange={() => setSel("detail")} />
    </div>
  );
}
