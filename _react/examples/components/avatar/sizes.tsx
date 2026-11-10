import { Avatar } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar initials="김" role="img" aria-label="김민준" />
      <Avatar initials="김" size="sm" role="img" aria-label="김민준" />
    </div>
  );
}
