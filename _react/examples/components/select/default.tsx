import { Select } from "@jiran/ds-react";

const GROUPS = ["전체", "영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "디자인팀", "QA팀", "고객지원팀", "재무팀", "인사팀", "법무팀"]
  .map((label) => ({ value: label, label }));

export default function Example() {
  return <Select options={GROUPS} placeholder="그룹 선택" label="그룹" keepMounted />;
}
