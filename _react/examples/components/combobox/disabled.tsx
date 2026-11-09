import { Combobox } from "@jiran/ds-react";

const DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "디자인팀", "QA팀", "고객지원팀", "재무팀", "인사팀", "법무팀"].map((label) => ({ value: label, label }));

export default function Example() {
  return <Combobox disabled options={DEPTS} placeholder="권한 없음" label="담당 부서" style={{ width: 260 }} />;
}
