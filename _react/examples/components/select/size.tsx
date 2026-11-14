import { Select } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <Select size="sm" options={[]} placeholder="그룹 선택" />
      <Select options={[]} placeholder="그룹 선택" />
      <Select size="lg" options={[]} placeholder="그룹 선택" />
    </div>
  );
}
