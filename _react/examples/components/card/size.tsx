import { Card, CardDesc, CardHead, CardTitle, Tag } from "@jiran/ds-react";

/* md(기본) · sm — sm 은 밀도 높은 그리드에 */
export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
      <Card size="md" style={{ width: 300 }}>
        <CardHead>
          <CardTitle>md</CardTitle>
          <Tag tone="ok">정상</Tag>
        </CardHead>
        <CardDesc>padding 24 · gap 12 · 제목 16/24</CardDesc>
      </Card>
      <Card size="sm" style={{ width: 280 }}>
        <CardHead>
          <CardTitle>sm</CardTitle>
          <Tag tone="ok" size="sm">정상</Tag>
        </CardHead>
        <CardDesc>padding 16 · gap 8 · 제목 14/20</CardDesc>
      </Card>
    </div>
  );
}
