import { Button, Form, FormActions, TextField } from "@jiran/ds-react";

/* 서버가 돌려준 오류 — 그 필드 아래에 적는다(폼 위 요약은 없다, 2026-11-16) */
export default function Example() {
  return (
    <Form noValidate onSubmit={(e) => e.preventDefault()}>
      <TextField id="fe-a" label="정책 이름" defaultValue="외부 USB" error="같은 이름의 정책이 있습니다. 다른 이름을 입력하세요." />
      <TextField id="fe-b" label="허용 IP" defaultValue="10.0.0.1" error="다른 정책이 쓰는 주소입니다. 다른 주소를 입력하세요." />
      <TextField id="fe-c" label="보관 기간" defaultValue="400" error="라이선스 한도를 넘었습니다. 365 이하로 입력하세요." />
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
