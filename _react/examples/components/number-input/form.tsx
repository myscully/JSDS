import { Button, Form, FormActions, FormLegend, NumberInput } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form validate onSubmit={(e) => e.preventDefault()} style={{ width: 360 }}>
      <FormLegend />
      <NumberInput label="동시 접속 수" unit="명" required min={1} max={500} help="1~500명" />
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
