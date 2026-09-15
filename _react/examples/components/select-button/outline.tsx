import { SelectButton } from "@jiran/ds-react";

export default function Example() {
  return (
    <SelectButton
      outline
      label="보기"
      options={[
        { value: "list", label: "목록", icon: "list" },
        { value: "chart", label: "차트", icon: "chart-bar" },
      ]}
    />
  );
}
