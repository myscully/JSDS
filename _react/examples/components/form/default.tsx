import { Button, Form, FormActions, FormLegend, FormRow, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <TextField id="fm-name" label="정책 이름" required help="2~40자" />
      <FormRow>
        <TextField id="fm-from" label="시작 IP" />
        <TextField id="fm-to" label="종료 IP" />
      </FormRow>
      <FormActions>
        <Button variant="outline" color="assistive">취소</Button>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
