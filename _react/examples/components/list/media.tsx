import { Avatar, Button, Icon, List, ListItem } from "@jiran/ds-react";

const actions = (name: string) => (
  <>
    <Button color="assistive" iconOnly size="sm" aria-label={`${name} 편집`}><Icon name="pencil" /></Button>
    <Button color="assistive" iconOnly size="sm" aria-label={`${name} 더 보기`}><Icon name="dots" /></Button>
  </>
);

export default function Example() {
  return (
    <List style={{ maxWidth: 560 }}>
      <ListItem leading={<Avatar initials="김" name="김민준" />} primary="김민준" meta="보안팀 · 관리자" end={actions("김민준")} />
      <ListItem leading={<Avatar initials="이" name="이서연" />} primary="이서연" meta="인프라팀 · 운영자" end={actions("이서연")} />
    </List>
  );
}
