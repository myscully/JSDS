import { Card, CardDesc, CardGrid, CardTitle } from "@jiran/ds-react";

export default function Example() {
  return (
    <CardGrid style={{ maxWidth: 600 }}>
      <Card as="button" type="button" clickable selected={false}>
        <CardTitle>USB 제어</CardTitle>
        <CardDesc>정책 12개</CardDesc>
      </Card>
      <Card as="button" type="button" clickable selected>
        <CardTitle>네트워크</CardTitle>
        <CardDesc>정책 8개 · 선택됨</CardDesc>
      </Card>
    </CardGrid>
  );
}
