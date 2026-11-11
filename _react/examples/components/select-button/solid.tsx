import { SelectButton } from "@jiran/ds-react";

export default function Example() {
  return (
    <SelectButton
      outline
      solid
      label="판정"
      options={[
        { value: "all", label: "전체" },
        { value: "block", label: "차단" },
        { value: "allow", label: "허용" },
      ]}
    />
  );
}
