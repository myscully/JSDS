import { Button, Form, FormActions, FormLegend, TextField, NumberInput } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form validate onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <TextField id="v1" label="정책 이름" required minLength={2} maxLength={40} help="2~40자" />
      <TextField id="v2" label="허용 IP" required pattern="^([0-9]{1,3}[.]){3}[0-9]{1,3}$" help="IPv4 형식" messages={{ pattern: "올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" }} />
      <NumberInput id="v3" label="보관 기간" required min={1} max={365} unit="일" help="1~365일" />
      <TextField id="v4" label="알림 이메일" type="email" required />
      <FormActions>
        <Button variant="outline" color="assistive">취소</Button>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
