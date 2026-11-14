import { SelectButton } from "@jiran/ds-react";

const OPTIONS = [
  { value: "all", label: "전체" },
  { value: "block", label: "차단" },
  { value: "allow", label: "허용" },
];

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <SelectButton size="sm" label="판정 sm" options={OPTIONS} />
      <SelectButton label="판정 md" options={OPTIONS} />
      <SelectButton size="lg" label="판정 lg" options={OPTIONS} />
      <SelectButton outline size="sm" label="판정 outline sm" options={OPTIONS} />
      <SelectButton outline label="판정 outline md" options={OPTIONS} />
      <SelectButton outline size="lg" label="판정 outline lg" options={OPTIONS} />
    </div>
  );
}
