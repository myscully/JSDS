import { Button, Form, FormActions, FormLegend, TimePicker } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form validate onSubmit={(e) => e.preventDefault()} style={{ width: 360 }}>
      <FormLegend />
      <TimePicker label="점검 종료" required help="점검이 끝나는 시각입니다." />
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
