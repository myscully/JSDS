import { Button, Combobox, Field, Form, FormActions, FormLegend } from "@jiran/ds-react";

const DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "디자인팀", "QA팀", "고객지원팀", "재무팀", "인사팀", "법무팀"].map((label) => ({ value: label, label }));

export default function Example() {
  return (
    <Form validate style={{ width: 360 }} onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <Field label="담당 부서" htmlFor="cb-f1" required>
        <Combobox id="cb-f1" name="owner" required options={DEPTS} placeholder="부서 검색" label="담당 부서" />
      </Field>
      <Field label="알림 받을 부서" htmlFor="cb-f2" required>
        <Combobox id="cb-f2" name="notify" required multiple options={DEPTS} placeholder="부서 검색" label="알림 받을 부서" />
      </Field>
      <FormActions>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
