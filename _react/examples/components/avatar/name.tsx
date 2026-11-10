import { Avatar } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Avatar initials="이" aria-hidden="true" />
      <span className="t-body-2">이서연</span>
    </div>
  );
}
