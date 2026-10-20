import { Card, CardDesc, CardTitle } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Card compact style={{ width: 280 }}>
        <CardTitle>Compact</CardTitle>
        <CardDesc>padding 16 · 제목 14</CardDesc>
      </Card>
    </>
  );
}
