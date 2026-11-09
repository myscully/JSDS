import { Combobox, Field } from "@jiran/ds-react";

const DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "디자인팀", "QA팀", "고객지원팀", "재무팀", "인사팀", "법무팀"].map((label) => ({ value: label, label }));

export default function Example() {
  return (
    <Field label="담당 부서" htmlFor="cb-d" style={{ width: 320 }}>
      <Combobox id="cb-d" options={DEPTS} placeholder="부서 검색" label="부서" />
    </Field>
  );
}
