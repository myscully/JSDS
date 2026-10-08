import { Card, CardDesc, CardTitle } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Card bordered style={{ width: 280 }}>
        <CardTitle>Bordered</CardTitle>
        <CardDesc>그림자 대신 1px 보더</CardDesc>
      </Card>
      <Card compact style={{ width: 280 }}>
        <CardTitle>Compact</CardTitle>
        <CardDesc>padding 16 · 제목 14</CardDesc>
      </Card>
    </>
  );
}
