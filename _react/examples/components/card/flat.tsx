import { Card, CardDesc, CardHead, CardMeta, CardTitle, Indicator, Tag } from "@jiran/ds-react";

/* 주변에 배경색(background/neutral/secondary)이 있을 때 — 보더 없이 면 색 차이로만. 흰 바탕 위에서는 쓰지 않는다 */
export default function Example() {
  return (
    <div style={{ background: "var(--background-neutral-secondary)", padding: 24, borderRadius: "var(--radius-lg)", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
      <Card variant="flat" style={{ width: 300 }}>
        <CardHead>
          <CardTitle>라이선스</CardTitle>
          <Tag tone="ok">정상</Tag>
        </CardHead>
        <CardDesc>1,000석 중 842석 사용 중. 2026-12-31 만료.</CardDesc>
      </Card>
      <Card variant="flat" style={{ width: 300 }}>
        <CardHead>
          <CardTitle>PC-2041</CardTitle>
          <Indicator tone="ok">온라인</Indicator>
        </CardHead>
        <CardMeta items={[{ label: "에이전트", value: "6.2.1" }, { label: "그룹", value: "개발팀" }, { label: "IP", value: "10.20.4.41" }]} />
      </Card>
    </div>
  );
}
