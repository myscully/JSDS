import { Button, Form, FormActions, FormLegend, TextField, NumberInput } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form noValidate onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <TextField id="e1" label="정책 이름" required error="정책 이름을 입력하세요" />
      <TextField id="e2" label="허용 IP" defaultValue="10.0.0" error="올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" />
      <NumberInput id="e3" label="보관 기간" unit="일" defaultValue="500" min={1} max={365} error="값이 너무 큽니다. 365 이하 입력하세요." />
      <FormActions>
        <Button variant="outline" color="assistive" className="left">삭제</Button>
        <Button variant="outline" color="assistive">취소</Button>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
