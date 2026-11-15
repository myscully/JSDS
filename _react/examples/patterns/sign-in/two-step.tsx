import { Button, Checkbox, Form, Link, TextField } from "@jiran/ds-react";

/* 2단계 인증 코드는 한 칸 — 숫자 6자리를 붙여 넣을 수 있고 자동 완성(one-time-code)이 채운다 */
export default function Example() {
  return (
    <Form validate className="auth">
      <h2 className="auth-title t-title-3">2단계 인증</h2>
      <p className="auth-desc">인증 앱에 표시된 6자리 숫자를 입력하세요.</p>
      <TextField id="si-otp" label="인증 코드" inputMode="numeric" autoComplete="one-time-code" required requiredMark={false} pattern="[0-9]{6}" messages={{ required: "인증 코드를 입력하세요.", pattern: "숫자 6자리를 입력하세요." }} help="코드는 30초마다 바뀝니다." />
      <Checkbox>이 기기에서 30일 동안 묻지 않기</Checkbox>
      <Button type="submit" size="lg">확인</Button>
      <Link href="#" standalone>다른 방법으로 인증</Link>
    </Form>
  );
}
