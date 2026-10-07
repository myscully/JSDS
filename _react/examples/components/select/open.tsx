import { useState } from "react";
import { Select } from "@jiran/ds-react";

const GROUPS = [
  { value: "all", label: "전체" },
  { value: "sales", label: "영업팀" },
  { value: "dev", label: "개발팀" },
  { value: "infra", label: "인프라팀" },
  { value: "ext", label: "외주(권한 없음)", disabled: true },
];

export default function Example() {
  const [group, setGroup] = useState<string | null>("sales");
  return (
    <>
      <Select options={GROUPS} placeholder="그룹 선택" label="그룹" keepMounted />
      <Select options={GROUPS} value={group} onChange={setGroup} label="그룹" defaultOpen />
    </>
  );
}
