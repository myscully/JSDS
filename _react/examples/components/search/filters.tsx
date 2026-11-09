import { useState } from "react";
import { Chip, ChipGroup, SearchBar } from "@jiran/ds-react";

const FILTERS = ["Critical", "High", "Medium", "Low", "Info", "최근 24시간"];

export default function Example() {
  const [sel, setSel] = useState(["Critical", "High"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 720 }}>
      <SearchBar block debounce placeholder="로그 검색" label="로그 검색" status="128건" />
      <ChipGroup clearable={sel.length > 0} onClear={() => setSel([])}>
        {FILTERS.map((f) => (
          <Chip key={f} selected={sel.includes(f)} onSelectedChange={(on) => setSel((s) => (on ? [...s, f] : s.filter((x) => x !== f)))}>{f}</Chip>
        ))}
      </ChipGroup>
    </div>
  );
}
