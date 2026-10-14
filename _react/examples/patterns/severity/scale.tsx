import { SevCell, Stack, Tag } from "@jiran/ds-react";

const LEVELS = [["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]] as const;

export default function Example() {
  return (
    <Stack style={{ maxWidth: 640, gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {LEVELS.map(([t, l]) => <Tag key={t} tone={t}>{l}</Tag>)}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {LEVELS.map(([t, l]) => <Tag key={t} tone={t} variant="solid">{l}</Tag>)}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <SevCell tone="critical">Critical</SevCell>
        <SevCell tone="high">High</SevCell>
        <SevCell tone="medium">Medium</SevCell>
        <SevCell tone="low">Low</SevCell>
      </div>
    </Stack>
  );
}
