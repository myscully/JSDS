import { Select } from "@jiran/ds-react";

const GROUPS = [
  { value: "all", label: "전체" },
  { value: "sales", label: "영업팀" },
  { value: "dev", label: "개발팀" },
];

export default function Example() {
  return <Select options={GROUPS} placeholder="그룹 선택" label="그룹" keepMounted />;
}
