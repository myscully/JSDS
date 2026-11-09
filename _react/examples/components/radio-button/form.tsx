import { Button, Form, FormActions, FormLegend, Radio, RadioGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form validate style={{ width: 360 }} onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <RadioGroup legend="격리 해제 권한" required>
        <Radio value="sec">보안 관리자만</Radio>
        <Radio value="ops">보안 · 운영 관리자</Radio>
        <Radio value="all">모든 관리자</Radio>
      </RadioGroup>
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
