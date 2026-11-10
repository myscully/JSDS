import { Button, Form, FormActions, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <TextField id="fa-name" label="정책 이름" defaultValue="외부 USB 차단" />
      <FormActions>
        <Button variant="outline" color="negative" className="left">삭제</Button>
        <Button variant="outline" color="assistive">취소</Button>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
