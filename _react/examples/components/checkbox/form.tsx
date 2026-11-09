import { Button, Checkbox, CheckboxGroup, Form, FormActions, FormLegend } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form validate style={{ width: 360 }} onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <CheckboxGroup legend="알림 채널" required help="하나 이상 선택합니다.">
        <Checkbox>이메일</Checkbox>
        <Checkbox>SMS</Checkbox>
        <Checkbox>콘솔 알림</Checkbox>
      </CheckboxGroup>
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
