import { Button, Form, FormActions, FormSection, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormSection>기본 정보</FormSection>
      <TextField id="fs-name" label="정책 이름" />
      <FormSection>알림</FormSection>
      <TextField id="fs-mail" label="알림 이메일" type="email" />
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
