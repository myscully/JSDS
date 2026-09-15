import { Tag, Tile, TileGrid } from "@jiran/ds-react";

export default function Example() {
  return (
    <TileGrid style={{ maxWidth: 560 }}>
      <Tile icon="bell" title="Slack 알림" desc="채널로 이벤트 전송" tag={<Tag tone="accent" size="sm" variant="plain">NEW</Tag>} />
      <Tile icon="user" title="AD 연동" desc="사용자·그룹 동기화" tag={<Tag tone="ok" size="sm">연결됨</Tag>} />
    </TileGrid>
  );
}
