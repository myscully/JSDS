import { Tag, TagGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <TagGroup style={{ maxWidth: 240 }}>
      <Tag variant="plain">내부망</Tag>
      <Tag variant="plain">재택 근무</Tag>
      <Tag variant="plain">외부 협력사</Tag>
      <Tag variant="plain">서버실</Tag>
      <Tag variant="plain">임원</Tag>
      <Tag variant="plain" tone="accent">신규</Tag>
    </TagGroup>
  );
}
