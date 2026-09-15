import { Chip, ChipGroup, SearchBar } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 720 }}>
      <SearchBar block placeholder="로그 검색" label="로그 검색" />
      <ChipGroup>
        <Chip defaultSelected>Critical</Chip>
        <Chip defaultSelected>High</Chip>
        <Chip>Medium</Chip>
        <Chip>Low</Chip>
        <Chip>최근 24시간</Chip>
      </ChipGroup>
    </div>
  );
}
