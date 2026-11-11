import { Tag, TagGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <TagGroup style={{ maxWidth: 240 }}>
      <Tag>내부망</Tag>
      <Tag>재택 근무</Tag>
      <Tag>외부 협력사</Tag>
      <Tag>서버실</Tag>
      <Tag>임원</Tag>
      <Tag tone="accent">신규</Tag>
    </TagGroup>
  );
}
