import { useState } from "react";
import { Chip, ChipGroup } from "@jiran/ds-react";

function Row({ items, color }: { items: string[]; color?: "brand" | "neutral" }) {
  const [sel, setSel] = useState(items.slice(0, 2));
  return (
    <ChipGroup clearable={sel.length > 0} onClear={() => setSel([])}>
      {items.map((l) => (
        <Chip key={l} color={color} selected={sel.includes(l)} onSelectedChange={(on) => setSel((s) => (on ? [...s, l] : s.filter((x) => x !== l)))}>{l}</Chip>
      ))}
    </ChipGroup>
  );
}

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Row items={["Critical", "High", "Medium"]} />
      <Row items={["Windows", "macOS", "Linux"]} color="neutral" />
    </div>
  );
}
