import { SelectButton } from "@jiran/ds-react";

export default function Example() {
  return (
    <SelectButton
      options={[
        { value: "all", label: "전체" },
        { value: "block", label: "차단" },
        { value: "allow", label: "허용", disabled: true },
      ]}
    />
  );
}
