import { Card, CardDesc, CardGrid, CardTitle } from "@jiran/ds-react";

export default function Example() {
  return (
    <CardGrid style={{ maxWidth: 600 }}>
      <Card as="a" href="#" clickable style={{ textDecoration: "none", minWidth: 0 }}>
        <CardTitle>USB 제어</CardTitle>
        <CardDesc>정책 12개</CardDesc>
      </Card>
      <Card as="a" href="#" clickable selected style={{ textDecoration: "none", minWidth: 0 }}>
        <CardTitle>네트워크</CardTitle>
        <CardDesc>정책 8개 · 선택됨</CardDesc>
      </Card>
    </CardGrid>
  );
}
