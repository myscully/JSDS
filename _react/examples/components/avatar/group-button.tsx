import { Avatar, AvatarGroup } from "@jiran/ds-react";

const PEOPLE = ["김민준", "이서연", "박지호", "최유나", "정하준", "강서윤", "조은우", "윤지아"];

export default function Example() {
  return (
    <AvatarGroup label="담당자" onMore={() => { /* 전체 목록은 제품이 연다 — Popup · Side Panel 등 */ }}>
      {PEOPLE.map((n) => <Avatar key={n} initials={n[0]} role="img" aria-label={n} />)}
    </AvatarGroup>
  );
}
