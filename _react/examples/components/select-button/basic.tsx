import { SelectButton } from "@jiran/ds-react";

export default function Example() {
  return (
    <SelectButton
      label="기간"
      defaultValue="24h"
      options={[
        { value: "24h", label: "24시간" },
        { value: "7d", label: "7일" },
        { value: "30d", label: "30일" },
      ]}
    />
  );
}
