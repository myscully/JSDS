import { useState } from "react";
import { Chip, ChipGroup } from "@jiran/ds-react";

export default function Example() {
  const [ips, setIps] = useState(["10.0.0.12", "10.0.0.13", "192.168.1.0/24"]);
  return (
    <ChipGroup>
      {ips.map((ip) => (
        <Chip key={ip} onRemove={() => setIps((s) => s.filter((x) => x !== ip))}>{ip}</Chip>
      ))}
      <Chip action icon="plus" onClick={() => setIps((s) => [...s, `10.0.0.${20 + s.length}`])}>추가</Chip>
    </ChipGroup>
  );
}
