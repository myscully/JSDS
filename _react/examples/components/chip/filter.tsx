import { useState } from "react";
import { Chip, ChipGroup } from "@jiran/ds-react";

const LEVELS = ["Critical", "High", "Medium", "Low", "Info"];

export default function Example() {
  const [sel, setSel] = useState(["Critical", "High"]);
  return (
    <ChipGroup clearable={sel.length > 0} onClear={() => setSel([])}>
      {LEVELS.map((l) => (
        <Chip key={l} selected={sel.includes(l)} onSelectedChange={(on) => setSel((s) => (on ? [...s, l] : s.filter((x) => x !== l)))}>{l}</Chip>
      ))}
    </ChipGroup>
  );
}
