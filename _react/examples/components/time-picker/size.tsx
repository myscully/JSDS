import { TimePicker } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16 }}>
      <TimePicker label="Small" defaultValue="08:00" size="sm" />
      <TimePicker label="Medium" defaultValue="08:00" />
      <TimePicker label="Large" defaultValue="08:00" size="lg" />
    </div>
  );
}
