import { Avatar, AvatarGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <AvatarGroup label="담당자">
        <Avatar initials="김" role="img" aria-label="김민준" />
        <Avatar initials="이" role="img" aria-label="이서연" />
        <Avatar initials="박" role="img" aria-label="박지호" />
      </AvatarGroup>
      <AvatarGroup label="검토자" size="sm">
        <Avatar initials="최" role="img" aria-label="최유나" />
        <Avatar initials="정" role="img" aria-label="정하준" />
        <Avatar initials="강" role="img" aria-label="강서윤" />
      </AvatarGroup>
    </div>
  );
}
