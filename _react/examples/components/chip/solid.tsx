import { useState } from "react";
import { Chip, ChipGroup } from "@jiran/ds-react";

function Row({ items, color }: { items: string[]; color?: "brand" | "neutral" }) {
  const [sel, setSel] = useState(items.slice(0, 2));
  return (
    <ChipGroup clearable={sel.length > 0} onClear={() => setSel([])}>
      {items.map((l) => (
        <Chip key={l} variant="solid" color={color} selected={sel.includes(l)} onSelectedChange={(on) => setSel((s) => (on ? [...s, l] : s.filter((x) => x !== l)))}>{l}</Chip>
      ))}
    </ChipGroup>
  );
}

export default function Example() {
  const [ips, setIps] = useState(["10.0.1.5", "10.0.1.6"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Row items={["Critical", "High", "Medium"]} />
      <Row items={["Windows", "macOS", "Linux"]} color="neutral" />
      <ChipGroup>
        {ips.map((ip) => (
          <Chip key={ip} variant="solid" onRemove={() => setIps((s) => s.filter((x) => x !== ip))}>{ip}</Chip>
        ))}
        <Chip action variant="solid" icon="plus" onClick={() => setIps((s) => [...s, `10.0.1.${7 + s.length}`])}>추가</Chip>
      </ChipGroup>
    </div>
  );
}
