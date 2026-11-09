import { Button, Field, Form, FormActions, FormLegend, Select } from "@jiran/ds-react";

const GROUPS = [
  { value: "sales", label: "영업팀" },
  { value: "dev", label: "개발팀" },
  { value: "sec", label: "보안팀" },
];
const APPROVERS = [
  { value: "", label: "선택 안 함" },
  { value: "kim", label: "김보안" },
  { value: "lee", label: "이인프라" },
];

export default function Example() {
  return (
    <Form validate style={{ width: 360 }} onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <Field label="적용 그룹" required>
        <Select name="group" required options={GROUPS} placeholder="그룹 선택" label="적용 그룹" keepMounted />
      </Field>
      <Field label="승인자">
        <Select name="approver" options={APPROVERS} placeholder="승인자 선택" label="승인자" keepMounted />
      </Field>
      <FormActions>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
