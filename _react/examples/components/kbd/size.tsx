import { Kbd } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Kbd keys={["Mod", "K"]} size="sm" />
      <Kbd keys={["Mod", "K"]} />
    </div>
  );
}
