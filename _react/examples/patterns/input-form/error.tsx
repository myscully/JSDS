import { Button, Form, FormActions, FormLegend, Notice, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form noValidate onSubmit={(e) => e.preventDefault()}>
      <Notice tone="danger" title="입력값 3개를 확인하세요" style={{ marginBottom: -4 }}>정책 이름, 허용 IP, 보관 기간</Notice>
      <FormLegend />
      <TextField id="e1" label="정책 이름" required error="정책 이름을 입력하세요" />
      <TextField id="e2" label="허용 IP" defaultValue="10.0.0" error="올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" />
      <TextField id="e3" label="보관 기간" type="number" defaultValue="500" error="값이 너무 큽니다. 365 이하 입력하세요." />
      <FormActions>
        <Button variant="outline" color="negative" className="left">삭제</Button>
        <Button variant="outline" color="assistive">취소</Button>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
