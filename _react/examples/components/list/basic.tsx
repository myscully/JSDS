import { List, ListItem, Tag } from "@jiran/ds-react";

export default function Example() {
  return (
    <List style={{ maxWidth: 560 }}>
      <ListItem primary="외부 USB 차단" meta="전체 · 1,284대 · 2026-09-06" end={<Tag tone="ok">사용</Tag>} />
      <ListItem primary="스크립트 실행 제한" meta="개발팀 제외 · 1,102대" end={<Tag tone="ok">사용</Tag>} />
      <ListItem primary="원격 접속 허용 목록" meta="인프라팀 · 48대" end={<Tag>중지</Tag>} />
    </List>
  );
}
