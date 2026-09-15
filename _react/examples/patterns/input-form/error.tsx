import { Button, Form, FormActions, Notice, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form noValidate onSubmit={(e) => e.preventDefault()}>
      <Notice tone="danger" title="입력값 2개를 확인해 주세요" style={{ marginBottom: -4 }}>정책 이름, 허용 IP</Notice>
      <TextField id="e1" label="정책 이름" required error="정책 이름을 입력하세요" />
      <TextField id="e2" label="허용 IP" defaultValue="10.0.0" error="올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" />
      <FormActions>
        <Button variant="danger-secondary" className="left">삭제</Button>
        <Button variant="text">취소</Button>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
