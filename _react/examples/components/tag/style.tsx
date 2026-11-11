import { Tag } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Tag tone="critical" variant="outline">Critical</Tag>
      <Tag tone="medium" variant="outline">Medium</Tag>
      <Tag tone="critical" variant="solid">Critical</Tag>
      <Tag tone="ok" variant="solid">정상</Tag>
      <Tag tone="critical" dot>Critical</Tag>
      <Tag tone="ok" dot>정상</Tag>
    </>
  );
}
