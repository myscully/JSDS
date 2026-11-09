import { useState } from "react";
import { Chip, ChipGroup } from "@jiran/ds-react";

export default function Example() {
  const [mails, setMails] = useState(["security-audit-notification@corp.example.com", "admin@example.com"]);
  return (
    <ChipGroup>
      {mails.map((m) => (
        <Chip key={m} onRemove={() => setMails((s) => s.filter((x) => x !== m))}>{m}</Chip>
      ))}
    </ChipGroup>
  );
}
