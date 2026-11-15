import { Stack, Tag, TagGroup } from "@jiran/ds-react";

const LEVELS = [["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"], ["info", "Info"]] as const;

export default function Example() {
  return (
    <Stack>
      <TagGroup>{LEVELS.map(([t, l]) => <Tag key={t} tone={t}>{l}</Tag>)}</TagGroup>
      <TagGroup>{LEVELS.map(([t, l]) => <Tag key={t} tone={t} variant="solid">{l}</Tag>)}</TagGroup>
    </Stack>
  );
}
