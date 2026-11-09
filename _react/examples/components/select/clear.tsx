import { Select } from "@jiran/ds-react";

const FILTER = [
  { value: "all", label: "전체" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
];
const APPROVERS = [
  { value: "", label: "선택 안 함" },
  { value: "kim", label: "김보안" },
  { value: "lee", label: "이인프라" },
  { value: "park", label: "박개발" },
];

export default function Example() {
  return (
    <>
      <Select options={FILTER} defaultValue="all" label="심각도 필터" keepMounted />
      <Select options={APPROVERS} placeholder="승인자 선택" label="승인자" keepMounted />
    </>
  );
}
