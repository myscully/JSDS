import { Avatar, Button, Icon, List, ListItem } from "@jiran/ds-react";

const actions = (
  <>
    <Button size="sm" variant="tertiary" icon aria-label="편집"><Icon name="pencil" /></Button>
    <Button size="sm" variant="tertiary" icon aria-label="더 보기"><Icon name="dots" /></Button>
  </>
);

export default function Example() {
  return (
    <List style={{ maxWidth: 560 }}>
      <ListItem leading={<Avatar initials="김" />} primary="김민준" meta="보안팀 · 관리자" end={actions} />
      <ListItem leading={<Avatar initials="이" />} primary="이서연" meta="인프라팀 · 운영자" end={actions} />
    </List>
  );
}
