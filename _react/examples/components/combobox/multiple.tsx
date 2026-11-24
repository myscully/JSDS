import { Combobox, Field } from "@jiran/ds-react";

const DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "디자인팀", "QA팀", "고객지원팀", "재무팀", "인사팀", "법무팀"].map((label) => ({ value: label, label }));

export default function Example() {
  return (
    <Field label="알림 받을 부서" htmlFor="cb-m" style={{ width: 320 }}>
      <Combobox id="cb-m" multiple options={DEPTS} defaultValue={["영업팀", "인프라팀", "보안팀", "디자인팀", "고객지원팀"]} placeholder="부서 검색" label="알림 받을 부서" />
    </Field>
  );
}
