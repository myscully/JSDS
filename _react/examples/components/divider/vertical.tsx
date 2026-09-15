import { Button, Divider } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button size="sm" variant="tertiary">편집</Button>
      <Button size="sm" variant="tertiary">복제</Button>
      <Divider orientation="vertical" />
      <Button size="sm" variant="tertiary">내보내기</Button>
      <Divider orientation="vertical" />
      <Button size="sm" variant="danger-secondary">삭제</Button>
    </div>
  );
}
