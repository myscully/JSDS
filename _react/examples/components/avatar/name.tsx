import { Avatar } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Avatar initials="이" name="이서연" aria-hidden="true" />
      <span className="t-label-1-reading t-regular">이서연</span>
    </div>
  );
}
