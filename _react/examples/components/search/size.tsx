import { SearchBar } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <SearchBar size="sm" placeholder="검색" label="검색 sm" />
      <SearchBar placeholder="검색" label="검색 md" />
      <SearchBar size="lg" placeholder="검색" label="검색 lg" />
    </div>
  );
}
