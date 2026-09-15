import { Tag } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Tag tone="ok">승인</Tag>
      <Tag tone="medium">검토 대기</Tag>
      <Tag tone="high">반려</Tag>
      <Tag>보관</Tag>
      <Tag tone="accent">신규</Tag>
    </>
  );
}
