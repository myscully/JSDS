import { useState } from "react";
import { Indicator, List, ListItem } from "@jiran/ds-react";

const HOSTS = [
  { id: "PC-2041", ip: "10.0.4.21", tone: "ok" as const },
  { id: "PC-1187", ip: "10.0.4.33", tone: "danger" as const },
  { id: "PC-0932", ip: "오프라인", tone: undefined },
];

export default function Example() {
  const [sel, setSel] = useState("PC-1187");
  return (
    <List hover dense role="listbox" style={{ maxWidth: 480 }}>
      {HOSTS.map((h) => (
        <ListItem key={h.id} role="option" selected={sel === h.id} onClick={() => setSel(h.id)} end={h.ip} endMeta>
          <Indicator tone={h.tone}>{h.id}</Indicator>
        </ListItem>
      ))}
    </List>
  );
}
